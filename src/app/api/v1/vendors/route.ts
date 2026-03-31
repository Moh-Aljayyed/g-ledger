import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/server/api-auth";
import { db } from "@/server/db";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendors = await db.vendor.findMany({
    where: { tenantId: auth.tenantId },
    orderBy: { code: "asc" },
  });

  return NextResponse.json({ data: vendors, total: vendors.length });
}

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.code || !body.nameAr) return NextResponse.json({ error: "code and nameAr required" }, { status: 400 });

  const vendor = await db.vendor.create({
    data: { ...body, tenantId: auth.tenantId },
  });

  return NextResponse.json({ data: vendor }, { status: 201 });
}
