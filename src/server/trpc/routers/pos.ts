import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

// In-memory shift storage (per tenant)
const activeShifts = new Map<
  string,
  {
    openedAt: Date;
    openingBalance: number;
    userId: string;
    sales: {
      invoiceId: string;
      total: number;
      paymentMethod: string;
      createdAt: Date;
    }[];
  }
>();

export const posRouter = router({
  // ============ PRODUCTS FOR POS ============

  getProducts: protectedProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      where: {
        tenantId: ctx.tenantId,
        isActive: true,
        currentStock: { gt: 0 },
      },
      select: {
        id: true,
        code: true,
        nameAr: true,
        nameEn: true,
        sellingPrice: true,
        currentStock: true,
        category: true,
        barcode: true,
        vatRate: true,
        costPrice: true,
      },
      orderBy: { nameAr: "asc" },
    });

    return products.map((p) => ({
      ...p,
      sellingPrice: Number(p.sellingPrice),
      currentStock: Number(p.currentStock),
      vatRate: Number(p.vatRate),
      costPrice: Number(p.costPrice),
    }));
  }),

  searchProducts: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const q = input.query;
      const products = await ctx.db.product.findMany({
        where: {
          tenantId: ctx.tenantId,
          isActive: true,
          OR: [
            { nameAr: { contains: q, mode: "insensitive" } },
            { nameEn: { contains: q, mode: "insensitive" } },
            { code: { contains: q, mode: "insensitive" } },
            { barcode: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          code: true,
          nameAr: true,
          nameEn: true,
          sellingPrice: true,
          currentStock: true,
          category: true,
          barcode: true,
          vatRate: true,
          costPrice: true,
        },
        take: 20,
        orderBy: { nameAr: "asc" },
      });

      return products.map((p) => ({
        ...p,
        sellingPrice: Number(p.sellingPrice),
        currentStock: Number(p.currentStock),
        vatRate: Number(p.vatRate),
        costPrice: Number(p.costPrice),
      }));
    }),

  // ============ CREATE SALE ============

  createSale: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().positive(),
            unitPrice: z.number().min(0),
            discount: z.number().min(0).default(0),
          })
        ).min(1),
        paymentMethod: z.enum(["CASH", "CARD", "TRANSFER", "CREDIT"]),
        customerId: z.string().optional(),
        amountPaid: z.number().min(0),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate credit sales require customer
      if (input.paymentMethod === "CREDIT" && !input.customerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "البيع الآجل يتطلب اختيار عميل",
        });
      }

      // Fetch all products for validation
      const productIds = input.items.map((i) => i.productId);
      const products = await ctx.db.product.findMany({
        where: { id: { in: productIds }, tenantId: ctx.tenantId },
      });

      if (products.length !== productIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "بعض المنتجات غير موجودة",
        });
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      // Validate stock
      for (const item of input.items) {
        const product = productMap.get(item.productId)!;
        if (Number(product.currentStock) < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `الكمية المتاحة من "${product.nameAr}" (${Number(product.currentStock)}) غير كافية`,
          });
        }
      }

      // Calculate totals
      let subtotal = 0;
      let totalVat = 0;
      let totalDiscount = 0;
      const lineItems = input.items.map((item, idx) => {
        const product = productMap.get(item.productId)!;
        const lineDiscount = item.discount || 0;
        const netAmount = item.quantity * item.unitPrice - lineDiscount;
        const vatRate = Number(product.vatRate);
        const vatAmount = netAmount * (vatRate / 100);
        const lineTotal = netAmount + vatAmount;

        subtotal += netAmount;
        totalVat += vatAmount;
        totalDiscount += lineDiscount;

        return {
          lineNumber: idx + 1,
          description: product.nameAr,
          itemCode: product.code,
          internalCode: product.code,
          unitType: product.unitType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: lineDiscount,
          discountRate: item.unitPrice > 0 ? (lineDiscount / (item.quantity * item.unitPrice)) * 100 : 0,
          vatRate,
          vatAmount,
          vatCategory: product.vatCategory || "S",
          netAmount,
          totalAmount: lineTotal,
          productId: item.productId,
          product,
        };
      });

      const grandTotal = subtotal + totalVat;
      const changeAmount = input.paymentMethod === "CASH"
        ? Math.max(0, input.amountPaid - grandTotal)
        : 0;

      // Generate invoice number
      const lastInvoice = await ctx.db.invoice.findFirst({
        where: { tenantId: ctx.tenantId, type: "SALES" },
        orderBy: { createdAt: "desc" },
      });
      const lastNum = lastInvoice
        ? parseInt(lastInvoice.invoiceNumber.replace(/\D/g, ""), 10) || 0
        : 0;
      const invoiceNumber = `POS-${String(lastNum + 1).padStart(6, "0")}`;

      // Find open fiscal period
      const now = new Date();
      const fiscalPeriod = await ctx.db.fiscalPeriod.findFirst({
        where: {
          tenantId: ctx.tenantId,
          startDate: { lte: now },
          endDate: { gte: now },
          isClosed: false,
        },
      });
      if (!fiscalPeriod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا توجد فترة مالية مفتوحة لهذا التاريخ",
        });
      }

      // Get next journal entry number
      const lastEntry = await ctx.db.journalEntry.findFirst({
        where: { tenantId: ctx.tenantId },
        orderBy: { entryNumber: "desc" },
      });
      const entryNumber = (lastEntry?.entryNumber ?? 0) + 1;

      // Get next stock movement number
      const lastMovement = await ctx.db.stockMovement.findFirst({
        where: { tenantId: ctx.tenantId },
        orderBy: { movementNumber: "desc" },
      });
      const lastMvNum = lastMovement
        ? parseInt(lastMovement.movementNumber.replace("SM-", ""), 10) || 0
        : 0;

      // Find tenant for VAT/currency
      const tenant = await ctx.db.tenant.findUnique({
        where: { id: ctx.tenantId },
        select: { currency: true },
      });
      const currency = tenant?.currency ?? "SAR";

      // ---- TRANSACTION ----
      const result = await ctx.db.$transaction(async (tx) => {
        // 1. Create Invoice
        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            type: "SALES",
            status: "ACCEPTED",
            issueDate: now,
            supplyDate: now,
            buyerName: input.customerId ? "عميل" : "عميل نقدي",
            subtotal,
            totalVat,
            totalDiscount,
            grandTotal,
            currency,
            notes: input.notes,
            tenantId: ctx.tenantId,
            createdById: ctx.user.id,
            customerId: input.customerId || null,
            items: {
              create: lineItems.map((li) => ({
                lineNumber: li.lineNumber,
                description: li.description,
                itemCode: li.itemCode,
                internalCode: li.internalCode,
                unitType: li.unitType,
                quantity: li.quantity,
                unitPrice: li.unitPrice,
                discount: li.discount,
                discountRate: li.discountRate,
                vatRate: li.vatRate,
                vatAmount: li.vatAmount,
                vatCategory: li.vatCategory,
                netAmount: li.netAmount,
                totalAmount: li.totalAmount,
              })),
            },
          },
        });

        // 2. Update customer name on invoice if customerId provided
        if (input.customerId) {
          const customer = await tx.customer.findFirst({
            where: { id: input.customerId, tenantId: ctx.tenantId },
          });
          if (customer) {
            await tx.invoice.update({
              where: { id: invoice.id },
              data: { buyerName: customer.nameAr },
            });
          }
        }

        // 3. Update product stock & create stock movements
        for (let i = 0; i < input.items.length; i++) {
          const item = input.items[i];
          const mvNum = `SM-${String(lastMvNum + i + 1).padStart(6, "0")}`;

          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              movementNumber: mvNum,
              type: "OUT",
              date: now,
              productId: item.productId,
              quantity: item.quantity,
              unitCost: Number(productMap.get(item.productId)!.costPrice),
              totalCost: item.quantity * Number(productMap.get(item.productId)!.costPrice),
              reference: invoiceNumber,
              notes: `بيع نقطة البيع - ${invoiceNumber}`,
              tenantId: ctx.tenantId,
              createdById: ctx.user.id,
            },
          });
        }

        // 4. Create Payment (if not credit)
        if (input.paymentMethod !== "CREDIT") {
          const lastPayment = await tx.payment.findFirst({
            where: { tenantId: ctx.tenantId },
            orderBy: { createdAt: "desc" },
          });
          const nextPayNum = lastPayment
            ? parseInt(lastPayment.paymentNumber.replace(/\D/g, "")) + 1
            : 1;
          const paymentNumber = `RCV-${String(nextPayNum).padStart(6, "0")}`;

          const methodMap: Record<string, "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "OTHER"> = {
            CASH: "CASH",
            CARD: "CREDIT_CARD",
            TRANSFER: "BANK_TRANSFER",
          };

          await tx.payment.create({
            data: {
              paymentNumber,
              type: "RECEIVED",
              method: methodMap[input.paymentMethod] || "CASH",
              date: now,
              amount: grandTotal,
              currency,
              reference: invoiceNumber,
              notes: `دفعة نقطة البيع - ${invoiceNumber}`,
              invoiceId: invoice.id,
              tenantId: ctx.tenantId,
              createdById: ctx.user.id,
            },
          });
        }

        // 5. Create Journal Entry
        const journalLines: {
          accountId: string;
          debit: number;
          credit: number;
          description: string;
        }[] = [];

        // Find GL accounts - try to find Cash/Bank and Sales Revenue accounts
        const cashAccount = await tx.account.findFirst({
          where: {
            tenantId: ctx.tenantId,
            isActive: true,
            OR: [
              { code: { startsWith: "1101" } }, // Cash
              { code: { startsWith: "110" } },
              { nameAr: { contains: "صندوق" } },
              { nameAr: { contains: "نقدية" } },
            ],
          },
          orderBy: { code: "asc" },
        });

        const arAccount = await tx.account.findFirst({
          where: {
            tenantId: ctx.tenantId,
            isActive: true,
            OR: [
              { code: { startsWith: "1201" } }, // AR
              { code: { startsWith: "120" } },
              { nameAr: { contains: "مدينون" } },
              { nameAr: { contains: "ذمم مدينة" } },
            ],
          },
          orderBy: { code: "asc" },
        });

        const salesAccount = await tx.account.findFirst({
          where: {
            tenantId: ctx.tenantId,
            isActive: true,
            OR: [
              { code: { startsWith: "4101" } }, // Sales Revenue
              { code: { startsWith: "410" } },
              { nameAr: { contains: "مبيعات" } },
              { nameAr: { contains: "إيرادات" } },
            ],
          },
          orderBy: { code: "asc" },
        });

        const vatAccount = await tx.account.findFirst({
          where: {
            tenantId: ctx.tenantId,
            isActive: true,
            OR: [
              { code: { startsWith: "2103" } }, // VAT Payable
              { nameAr: { contains: "ضريبة" } },
              { nameAr: { contains: "ض.ق.م" } },
            ],
          },
          orderBy: { code: "asc" },
        });

        // Build journal lines
        const desc = `مبيعات نقطة البيع - ${invoiceNumber}`;

        if (input.paymentMethod === "CREDIT") {
          // Dr Accounts Receivable
          if (arAccount) {
            journalLines.push({
              accountId: arAccount.id,
              debit: grandTotal,
              credit: 0,
              description: desc,
            });
          }
        } else {
          // Dr Cash/Bank
          if (cashAccount) {
            journalLines.push({
              accountId: cashAccount.id,
              debit: grandTotal,
              credit: 0,
              description: desc,
            });
          }
        }

        // Cr Sales Revenue
        if (salesAccount) {
          journalLines.push({
            accountId: salesAccount.id,
            debit: 0,
            credit: subtotal,
            description: desc,
          });
        }

        // Cr VAT Payable
        if (vatAccount && totalVat > 0) {
          journalLines.push({
            accountId: vatAccount.id,
            debit: 0,
            credit: totalVat,
            description: desc,
          });
        }

        let journalEntryId: string | null = null;
        if (journalLines.length >= 2) {
          const je = await tx.journalEntry.create({
            data: {
              entryNumber,
              date: now,
              description: desc,
              reference: invoiceNumber,
              status: "POSTED",
              fiscalPeriodId: fiscalPeriod.id,
              tenantId: ctx.tenantId,
              createdById: ctx.user.id,
              postedAt: now,
              lines: { create: journalLines },
            },
          });
          journalEntryId = je.id;
        }

        // Track sale in shift
        const shift = activeShifts.get(ctx.tenantId);
        if (shift) {
          shift.sales.push({
            invoiceId: invoice.id,
            total: grandTotal,
            paymentMethod: input.paymentMethod,
            createdAt: now,
          });
        }

        return {
          invoiceId: invoice.id,
          receiptNumber: invoiceNumber,
          subtotal,
          totalVat,
          totalDiscount,
          grandTotal,
          amountPaid: input.paymentMethod === "CREDIT" ? 0 : input.amountPaid,
          changeAmount,
          paymentMethod: input.paymentMethod,
          items: lineItems.map((li) => ({
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            discount: li.discount,
            vatAmount: li.vatAmount,
            totalAmount: li.totalAmount,
          })),
          createdAt: now,
        };
      });

      return result;
    }),

  // ============ SHIFT MANAGEMENT ============

  openShift: protectedProcedure
    .input(z.object({ openingBalance: z.number().min(0) }))
    .mutation(async ({ ctx, input }) => {
      const existing = activeShifts.get(ctx.tenantId);
      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "يوجد وردية مفتوحة بالفعل",
        });
      }

      activeShifts.set(ctx.tenantId, {
        openedAt: new Date(),
        openingBalance: input.openingBalance,
        userId: ctx.user.id,
        sales: [],
      });

      return { success: true, openedAt: new Date(), openingBalance: input.openingBalance };
    }),

  closeShift: protectedProcedure.mutation(async ({ ctx }) => {
    const shift = activeShifts.get(ctx.tenantId);
    if (!shift) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "لا توجد وردية مفتوحة",
      });
    }

    const totalSales = shift.sales.reduce((sum, s) => sum + s.total, 0);
    const totalCash = shift.sales
      .filter((s) => s.paymentMethod === "CASH")
      .reduce((sum, s) => sum + s.total, 0);
    const totalCard = shift.sales
      .filter((s) => s.paymentMethod === "CARD")
      .reduce((sum, s) => sum + s.total, 0);
    const totalTransfer = shift.sales
      .filter((s) => s.paymentMethod === "TRANSFER")
      .reduce((sum, s) => sum + s.total, 0);
    const totalCredit = shift.sales
      .filter((s) => s.paymentMethod === "CREDIT")
      .reduce((sum, s) => sum + s.total, 0);

    const expectedCashBalance = shift.openingBalance + totalCash;

    const summary = {
      openedAt: shift.openedAt,
      closedAt: new Date(),
      openingBalance: shift.openingBalance,
      totalSales,
      totalCash,
      totalCard,
      totalTransfer,
      totalCredit,
      transactionsCount: shift.sales.length,
      expectedCashBalance,
    };

    activeShifts.delete(ctx.tenantId);

    return summary;
  }),

  getShiftStatus: protectedProcedure.query(async ({ ctx }) => {
    const shift = activeShifts.get(ctx.tenantId);
    if (!shift) {
      return { isOpen: false };
    }

    const totalSales = shift.sales.reduce((sum, s) => sum + s.total, 0);
    return {
      isOpen: true,
      openedAt: shift.openedAt,
      openingBalance: shift.openingBalance,
      salesCount: shift.sales.length,
      totalSales,
    };
  }),

  // ============ DAILY SUMMARY ============

  getDailySummary: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's POS invoices
    const todayInvoices = await ctx.db.invoice.findMany({
      where: {
        tenantId: ctx.tenantId,
        type: "SALES",
        invoiceNumber: { startsWith: "POS-" },
        issueDate: { gte: today, lt: tomorrow },
        status: "ACCEPTED",
      },
      include: {
        items: true,
        payments: true,
      },
    });

    const totalSales = todayInvoices.reduce(
      (sum, inv) => sum + Number(inv.grandTotal),
      0
    );
    const transactionsCount = todayInvoices.length;

    // Breakdown by payment method
    const cashSales = todayInvoices
      .filter((inv) => inv.payments.some((p) => p.method === "CASH"))
      .reduce((sum, inv) => sum + Number(inv.grandTotal), 0);
    const cardSales = todayInvoices
      .filter((inv) => inv.payments.some((p) => p.method === "CREDIT_CARD"))
      .reduce((sum, inv) => sum + Number(inv.grandTotal), 0);
    const transferSales = todayInvoices
      .filter((inv) => inv.payments.some((p) => p.method === "BANK_TRANSFER"))
      .reduce((sum, inv) => sum + Number(inv.grandTotal), 0);
    const creditSales = todayInvoices
      .filter((inv) => inv.payments.length === 0)
      .reduce((sum, inv) => sum + Number(inv.grandTotal), 0);

    // Top selling products
    const productSales = new Map<string, { name: string; qty: number; total: number }>();
    for (const inv of todayInvoices) {
      for (const item of inv.items) {
        const key = item.itemCode || item.description;
        const existing = productSales.get(key) || { name: item.description, qty: 0, total: 0 };
        existing.qty += Number(item.quantity);
        existing.total += Number(item.totalAmount);
        productSales.set(key, existing);
      }
    }

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      totalSales,
      transactionsCount,
      cashSales,
      cardSales,
      transferSales,
      creditSales,
      topProducts,
    };
  }),

  // ============ RECEIPT ============

  getReceipt: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findFirst({
        where: { id: input.invoiceId, tenantId: ctx.tenantId },
        include: {
          items: true,
          payments: true,
          customer: { select: { nameAr: true, phone: true } },
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الفاتورة غير موجودة" });
      }

      const tenant = await ctx.db.tenant.findUnique({
        where: { id: ctx.tenantId },
        select: { name: true, registrationNumber: true, currency: true },
      });

      return {
        receiptNumber: invoice.invoiceNumber,
        date: invoice.issueDate,
        buyerName: invoice.buyerName,
        customerPhone: invoice.customer?.phone,
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount),
          vatAmount: Number(item.vatAmount),
          totalAmount: Number(item.totalAmount),
        })),
        subtotal: Number(invoice.subtotal),
        totalVat: Number(invoice.totalVat),
        totalDiscount: Number(invoice.totalDiscount),
        grandTotal: Number(invoice.grandTotal),
        payments: invoice.payments.map((p) => ({
          method: p.method,
          amount: Number(p.amount),
        })),
        tenantName: tenant?.name ?? "",
        taxId: tenant?.registrationNumber ?? "",
        currency: tenant?.currency ?? "SAR",
      };
    }),

  // ============ CUSTOMERS FOR POS ============

  getCustomers: protectedProcedure.query(async ({ ctx }) => {
    const customers = await ctx.db.customer.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      select: { id: true, code: true, nameAr: true, phone: true },
      orderBy: { nameAr: "asc" },
    });
    return customers;
  }),
});
