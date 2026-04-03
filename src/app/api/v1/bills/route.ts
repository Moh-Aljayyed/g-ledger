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

  const [bills, total] = await Promise.all([
    db.bill.findMany({ where, include: { vendor: { select: { nameAr: true, nameEn: true, code: true } }, items: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    db.bill.count({ where }),
  ]);

  return NextResponse.json({ data: bills, total, page, limit });
}

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.vendorId || !body.items?.length) return NextResponse.json({ error: "vendorId and items required" }, { status: 400 });

  const lastBill = await db.bill.findFirst({ where: { tenantId: auth.tenantId }, orderBy: { createdAt: "desc" } });
  const billNumber = `BILL-${String((lastBill ? parseInt(lastBill.billNumber.replace(/\D/g, "") || "0") : 0) + 1).padStart(6, "0")}`;

  const items = body.items.map((item: any, i: number) => {
    const net = (item.quantity || 1) * (item.unitPrice || 0) - (item.discount || 0);
    const vat = net * ((item.vatRate || 0) / 100);
    return { lineNumber: i + 1, description: item.description || "", quantity: item.quantity || 1, unitPrice: item.unitPrice || 0, discount: item.discount || 0, vatRate: item.vatRate || 0, vatAmount: vat, netAmount: net, totalAmount: net + vat };
  });

  const subtotal = items.reduce((s: number, i: any) => s + i.netAmount, 0);
  const totalVat = items.reduce((s: number, i: any) => s + i.vatAmount, 0);

  const bill = await db.bill.create({
    data: { billNumber, vendorId: body.vendorId, issueDate: new Date(body.issueDate || new Date()), dueDate: new Date(body.dueDate || new Date()), subtotal, totalVat, grandTotal: subtotal + totalVat, currency: body.currency || "SAR", notes: body.notes, tenantId: auth.tenantId, createdById: "api", items: { create: items } },
    include: { items: true },
  });

  return NextResponse.json({ data: bill }, { status: 201 });
}
