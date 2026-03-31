import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/server/api-auth";
import { db } from "@/server/db";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const status = searchParams.get("status");

  const where: any = { tenantId: auth.tenantId };
  if (status) where.status = status;

  const [invoices, total] = await Promise.all([
    db.invoice.findMany({
      where,
      include: { items: true, customer: { select: { code: true, nameAr: true, nameEn: true } } },
      orderBy: { issueDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.invoice.count({ where }),
  ]);

  return NextResponse.json({ data: invoices, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { invoiceNumber, type, issueDate, buyerName, items } = body;

  if (!invoiceNumber || !type || !issueDate || !buyerName || !items || items.length === 0) {
    return NextResponse.json({ error: "invoiceNumber, type, issueDate, buyerName, and at least 1 item required" }, { status: 400 });
  }

  // Calculate totals
  let subtotal = 0;
  let totalVat = 0;
  const processedItems = items.map((item: any, idx: number) => {
    const netAmount = (item.quantity || 1) * (item.unitPrice || 0) - (item.discount || 0);
    const vatAmount = netAmount * ((item.vatRate || 0) / 100);
    subtotal += netAmount;
    totalVat += vatAmount;
    return {
      lineNumber: idx + 1,
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      discount: item.discount || 0,
      vatRate: item.vatRate || 0,
      vatAmount,
      netAmount,
      totalAmount: netAmount + vatAmount,
    };
  });

  const invoice = await db.invoice.create({
    data: {
      invoiceNumber,
      type,
      issueDate: new Date(issueDate),
      buyerName,
      buyerTaxId: body.buyerTaxId || null,
      subtotal,
      totalVat,
      grandTotal: subtotal + totalVat,
      currency: body.currency || "SAR",
      tenantId: auth.tenantId,
      createdById: "api",
      customerId: body.customerId || null,
      items: { create: processedItems },
    },
    include: { items: true },
  });

  return NextResponse.json({ data: invoice }, { status: 201 });
}
