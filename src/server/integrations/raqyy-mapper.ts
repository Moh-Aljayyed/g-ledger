import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

/**
 * Maps Raqyy webhook payloads into native G-Ledger records.
 *
 * Sales-invoice payload  → Customer (upserted) + Invoice (DRAFT, type=SALES) + InvoiceItems
 * Stock-movement payload → Product (upserted by SKU) + StockMovement + Product.currentStock update
 *
 * Both mappers are idempotent: if the corresponding ingest row already has
 * `glInvoiceId` / `glStockMovementId` set, the mapper short-circuits.
 */

type SalesItem = {
  product_id?: number | string;
  title?: string;
  sku?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
};

type SalesPayload = {
  external_id: string;
  total?: number | string;
  created_at?: string;
  items?: SalesItem[];
  customer?: {
    id?: number | string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  shipping_address?: {
    street?: string;
    city?: string;
    governorate?: string;
  };
};

type StockPayload = {
  external_id: string;
  product_id?: number | string;
  sku?: string;
  product_title?: string;
  product_title_ar?: string;
  new_quantity?: number;
  change?: number;
  reason?: string;
  unit_cost?: number;
  unit_price?: number;
};

async function getSystemUserId(tenantId: string): Promise<string> {
  // Prefer OWNER, then ADMIN, then any user from the tenant.
  const owner = await db.user.findFirst({
    where: { tenantId, role: "OWNER" },
    select: { id: true },
  });
  if (owner) return owner.id;

  const admin = await db.user.findFirst({
    where: { tenantId, role: "ADMIN" },
    select: { id: true },
  });
  if (admin) return admin.id;

  const any = await db.user.findFirst({
    where: { tenantId },
    select: { id: true },
  });
  if (!any) {
    throw new Error("No user found for tenant — cannot attribute Raqyy ingest");
  }
  return any.id;
}

async function getTenantDefaults(tenantId: string) {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { currency: true, vatRate: true, country: true },
  });
  return {
    currency: tenant?.currency || "EGP",
    vatRate: tenant ? Number(tenant.vatRate) : 14,
    country: tenant?.country || "EG",
  };
}

export async function mapRaqyySalesInvoice(ingestId: string): Promise<void> {
  const ingest = await db.raqyySalesInvoice.findUnique({ where: { id: ingestId } });
  if (!ingest) return;
  if (ingest.glInvoiceId) return; // already mapped

  try {
    const payload = ingest.payload as unknown as SalesPayload;
    const tenantId = ingest.tenantId;
    const userId = await getSystemUserId(tenantId);
    const defaults = await getTenantDefaults(tenantId);

    // Upsert customer
    const customerCode = payload.customer?.id
      ? `RQ-${payload.customer.id}`
      : `RQ-GUEST-${ingest.externalId}`;
    const customerName =
      [payload.customer?.first_name, payload.customer?.last_name].filter(Boolean).join(" ") ||
      payload.customer?.email ||
      "Raqyy Customer";

    let customer = await db.customer.findUnique({
      where: { tenantId_code: { tenantId, code: customerCode } },
    });
    if (!customer) {
      customer = await db.customer.create({
        data: {
          tenantId,
          code: customerCode,
          nameAr: customerName,
          email: payload.customer?.email,
          address: payload.shipping_address?.street,
          city: payload.shipping_address?.city,
          country: defaults.country,
        },
      });
    }

    // Build invoice items from payload (fall back to a single line if items missing)
    const rawItems = Array.isArray(payload.items) && payload.items.length > 0
      ? payload.items
      : [{ title: `Raqyy Order ${ingest.externalId}`, quantity: 1, unit_price: Number(ingest.total ?? 0) }];

    const processedItems = rawItems.map((it, idx) => {
      const quantity = Number(it.quantity ?? 1);
      const unitPrice = Number(it.unit_price ?? 0);
      const netAmount = quantity * unitPrice;
      const vatAmount = netAmount * (defaults.vatRate / 100);
      const totalAmount = netAmount + vatAmount;
      return {
        lineNumber: idx + 1,
        description: it.title || `Item ${idx + 1}`,
        itemCode: it.sku ?? undefined,
        unitType: "EA",
        quantity: new Prisma.Decimal(quantity),
        unitPrice: new Prisma.Decimal(unitPrice),
        discount: new Prisma.Decimal(0),
        discountRate: new Prisma.Decimal(0),
        vatRate: new Prisma.Decimal(defaults.vatRate),
        vatAmount: new Prisma.Decimal(vatAmount),
        vatCategory: "S",
        withholdingRate: new Prisma.Decimal(0),
        withholdingAmount: new Prisma.Decimal(0),
        tableTaxRate: new Prisma.Decimal(0),
        tableTaxAmount: new Prisma.Decimal(0),
        netAmount: new Prisma.Decimal(netAmount),
        totalAmount: new Prisma.Decimal(totalAmount),
      };
    });

    const subtotal = processedItems.reduce((s, i) => s + Number(i.netAmount), 0);
    const totalVat = processedItems.reduce((s, i) => s + Number(i.vatAmount), 0);
    const grandTotal = subtotal + totalVat;

    // Generate invoice number
    const lastInvoice = await db.invoice.findFirst({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true },
    });
    const nextNum = lastInvoice
      ? parseInt(lastInvoice.invoiceNumber.replace(/\D/g, ""), 10) + 1
      : 1;
    const invoiceNumber = `INV-${String(nextNum).padStart(6, "0")}`;

    const issueDate = payload.created_at ? new Date(payload.created_at) : new Date();

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        type: "SALES",
        status: "READY",
        issueDate,
        buyerName: customerName,
        buyerCountry: defaults.country,
        buyerType: "P",
        currency: defaults.currency,
        exchangeRate: new Prisma.Decimal(1),
        subtotal: new Prisma.Decimal(subtotal),
        totalVat: new Prisma.Decimal(totalVat),
        totalWithholding: new Prisma.Decimal(0),
        totalTableTax: new Prisma.Decimal(0),
        totalDiscount: new Prisma.Decimal(0),
        grandTotal: new Prisma.Decimal(grandTotal),
        notes: `Imported from Raqyy — order ${ingest.externalId}`,
        tenantId,
        createdById: userId,
        customerId: customer.id,
        items: { create: processedItems },
      },
    });

    await db.raqyySalesInvoice.update({
      where: { id: ingest.id },
      data: {
        glInvoiceId: invoice.id,
        glCustomerId: customer.id,
        mappingStatus: "MAPPED",
        mappingError: null,
      },
    });
  } catch (err) {
    await db.raqyySalesInvoice.update({
      where: { id: ingest.id },
      data: {
        mappingStatus: "FAILED",
        mappingError: err instanceof Error ? err.message : String(err),
      },
    });
    throw err;
  }
}

export async function mapRaqyyStockMovement(ingestId: string): Promise<void> {
  const ingest = await db.raqyyStockMovement.findUnique({ where: { id: ingestId } });
  if (!ingest) return;
  if (ingest.glStockMovementId) return; // already mapped

  try {
    const payload = ingest.payload as unknown as StockPayload;
    const tenantId = ingest.tenantId;
    const userId = await getSystemUserId(tenantId);

    const sku = ingest.sku || `RQ-${payload.product_id ?? ingest.externalId}`;
    const productCode = sku;

    // Upsert product by code
    let product = await db.product.findUnique({
      where: { tenantId_code: { tenantId, code: productCode } },
    });
    if (!product) {
      product = await db.product.create({
        data: {
          tenantId,
          code: productCode,
          nameAr: payload.product_title_ar || payload.product_title || sku,
          nameEn: payload.product_title,
          barcode: sku,
          unitType: "EA",
          costPrice: new Prisma.Decimal(payload.unit_cost ?? 0),
          sellingPrice: new Prisma.Decimal(payload.unit_price ?? 0),
          currentStock: new Prisma.Decimal(0),
        },
      });
    }

    // Determine direction + quantity
    const change = Number(payload.change ?? 0);
    const reason = (payload.reason || "adjustment").toLowerCase();
    let movementType: "IN" | "OUT" | "ADJUSTMENT" = "ADJUSTMENT";
    let quantity = Math.abs(change);

    if (reason === "created") {
      movementType = "IN";
      quantity = Math.abs(Number(payload.new_quantity ?? change ?? 0));
    } else if (reason === "sale") {
      movementType = "OUT";
    } else if (reason === "restock") {
      movementType = "IN";
    } else {
      movementType = "ADJUSTMENT";
    }

    // Skip no-op movements (quantity 0)
    if (quantity <= 0) {
      await db.raqyyStockMovement.update({
        where: { id: ingest.id },
        data: {
          glProductId: product.id,
          mappingStatus: "MAPPED",
          mappingError: "No-op (quantity 0)",
        },
      });
      return;
    }

    // Generate movement number
    const lastMovement = await db.stockMovement.findFirst({
      where: { tenantId },
      orderBy: { movementNumber: "desc" },
      select: { movementNumber: true },
    });
    const lastNum = lastMovement
      ? parseInt(lastMovement.movementNumber.replace("SM-", ""), 10) || 0
      : 0;
    const movementNumber = `SM-${String(lastNum + 1).padStart(6, "0")}`;

    const stockChange =
      movementType === "IN"
        ? quantity
        : movementType === "OUT"
          ? -quantity
          : change; // ADJUSTMENT keeps sign

    const productId = product.id;

    const movement = await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { currentStock: { increment: stockChange } },
      });

      return tx.stockMovement.create({
        data: {
          movementNumber,
          type: movementType,
          date: new Date(),
          productId,
          quantity: new Prisma.Decimal(Math.abs(stockChange)),
          unitCost: new Prisma.Decimal(payload.unit_cost ?? 0),
          totalCost: new Prisma.Decimal(Math.abs(stockChange) * Number(payload.unit_cost ?? 0)),
          reference: `Raqyy:${ingest.externalId}`,
          notes: `Imported from Raqyy — reason: ${reason}`,
          tenantId,
          createdById: userId,
        },
      });
    });

    await db.raqyyStockMovement.update({
      where: { id: ingest.id },
      data: {
        glStockMovementId: movement.id,
        glProductId: productId,
        mappingStatus: "MAPPED",
        mappingError: null,
      },
    });
  } catch (err) {
    await db.raqyyStockMovement.update({
      where: { id: ingest.id },
      data: {
        mappingStatus: "FAILED",
        mappingError: err instanceof Error ? err.message : String(err),
      },
    });
    throw err;
  }
}
