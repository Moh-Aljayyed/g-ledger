import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/server/api-auth";
import { db } from "@/server/db";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  const date = searchParams.get("date");

  const where: any = { tenantId: auth.tenantId };
  if (employeeId) where.employeeId = employeeId;
  if (date) where.date = new Date(date);

  const records = await db.attendance.findMany({ where, include: { employee: { select: { nameAr: true, nameEn: true, employeeNumber: true } } }, orderBy: { date: "desc" }, take: 100 });

  return NextResponse.json({ data: records, total: records.length });
}

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.employeeId || !body.date) return NextResponse.json({ error: "employeeId and date required" }, { status: 400 });

  const date = new Date(body.date);
  date.setHours(0, 0, 0, 0);

  const checkIn = body.checkIn ? new Date(body.checkIn) : null;
  const checkOut = body.checkOut ? new Date(body.checkOut) : null;
  const hours = checkIn && checkOut ? ((checkOut.getTime() - checkIn.getTime()) / 3600000) : null;

  const record = await db.attendance.upsert({
    where: { employeeId_date: { employeeId: body.employeeId, date } },
    create: { employeeId: body.employeeId, date, checkIn, checkOut, hoursWorked: hours, status: body.status || "PRESENT", tenantId: auth.tenantId },
    update: { checkIn, checkOut, hoursWorked: hours, status: body.status },
  });

  return NextResponse.json({ data: record }, { status: 201 });
}
