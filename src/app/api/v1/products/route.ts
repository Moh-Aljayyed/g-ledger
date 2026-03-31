import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/server/api-auth";
import { db } from "@/server/db";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await db.product.findMany({
    where: { tenantId: auth.tenantId, isActive: true },
    orderBy: { code: "asc" },
  });

  return NextResponse.json({ data: products, total: products.length });
}

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.code || !body.nameAr) return NextResponse.json({ error: "code and nameAr required" }, { status: 400 });

  const product = await db.product.create({
    data: { ...body, tenantId: auth.tenantId },
  });

  return NextResponse.json({ data: product }, { status: 201 });
}
