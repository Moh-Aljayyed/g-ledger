import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/server/api-auth";
import { db } from "@/server/db";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized. Use Bearer token." }, { status: 401 });

  const accounts = await db.account.findMany({
    where: { tenantId: auth.tenantId, isActive: true },
    select: { id: true, code: true, nameAr: true, nameEn: true, type: true, nature: true, level: true, parentId: true },
    orderBy: { code: "asc" },
  });

  return NextResponse.json({ data: accounts, total: accounts.length });
}
