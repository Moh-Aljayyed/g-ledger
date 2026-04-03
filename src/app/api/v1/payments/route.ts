import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/server/api-auth";
import { db } from "@/server/db";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // RECEIVED or MADE
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  const where: any = { tenantId: auth.tenantId };
  if (type) where.type = type;

  const [payments, total] = await Promise.all([
    db.payment.findMany({ where, orderBy: { date: "desc" }, skip: (page - 1) * limit, take: limit }),
    db.payment.count({ where }),
  ]);

  return NextResponse.json({ data: payments, total, page, limit });
}
