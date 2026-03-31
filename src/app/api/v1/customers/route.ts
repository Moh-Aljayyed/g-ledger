import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/server/api-auth";
import { db } from "@/server/db";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customers = await db.customer.findMany({
    where: { tenantId: auth.tenantId },
    orderBy: { code: "asc" },
  });

  return NextResponse.json({ data: customers, total: customers.length });
}

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.code || !body.nameAr) return NextResponse.json({ error: "code and nameAr required" }, { status: 400 });

  const customer = await db.customer.create({
    data: { ...body, tenantId: auth.tenantId },
  });

  return NextResponse.json({ data: customer }, { status: 201 });
}
