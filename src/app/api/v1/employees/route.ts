import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/server/api-auth";
import { db } from "@/server/db";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: any = { tenantId: auth.tenantId };
  if (status) where.status = status;

  const employees = await db.employee.findMany({
    where,
    select: {
      id: true,
      employeeNumber: true,
      nameAr: true,
      nameEn: true,
      email: true,
      phone: true,
      department: true,
      position: true,
      hireDate: true,
      status: true,
    },
    orderBy: { employeeNumber: "asc" },
  });

  return NextResponse.json({ data: employees, total: employees.length });
}
