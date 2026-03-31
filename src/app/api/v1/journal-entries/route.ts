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

  const [entries, total] = await Promise.all([
    db.journalEntry.findMany({
      where,
      include: { lines: { include: { account: { select: { code: true, nameAr: true, nameEn: true } } } } },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.journalEntry.count({ where }),
  ]);

  return NextResponse.json({ data: entries, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { date, description, reference, lines } = body;

  if (!date || !description || !lines || lines.length < 2) {
    return NextResponse.json({ error: "date, description, and at least 2 lines required" }, { status: 400 });
  }

  // Validate debit = credit
  const totalDebit = lines.reduce((s: number, l: any) => s + (l.debit || 0), 0);
  const totalCredit = lines.reduce((s: number, l: any) => s + (l.credit || 0), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return NextResponse.json({ error: "Total debit must equal total credit" }, { status: 400 });
  }

  const lastEntry = await db.journalEntry.findFirst({
    where: { tenantId: auth.tenantId },
    orderBy: { entryNumber: "desc" },
  });

  const fiscalPeriod = await db.fiscalPeriod.findFirst({
    where: { tenantId: auth.tenantId, startDate: { lte: new Date(date) }, endDate: { gte: new Date(date) }, isClosed: false },
  });

  if (!fiscalPeriod) return NextResponse.json({ error: "No open fiscal period for this date" }, { status: 400 });

  const entry = await db.journalEntry.create({
    data: {
      entryNumber: (lastEntry?.entryNumber ?? 0) + 1,
      date: new Date(date),
      description,
      reference: reference || null,
      status: "DRAFT",
      fiscalPeriodId: fiscalPeriod.id,
      tenantId: auth.tenantId,
      createdById: "api",
      lines: {
        create: lines.map((l: any) => ({
          accountId: l.accountId,
          debit: l.debit || 0,
          credit: l.credit || 0,
          description: l.description || null,
        })),
      },
    },
    include: { lines: true },
  });

  return NextResponse.json({ data: entry }, { status: 201 });
}
