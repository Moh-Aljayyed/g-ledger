import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import * as XLSX from "xlsx";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = (session.user as any).tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file || !type) return NextResponse.json({ error: "ملف ونوع البيانات مطلوبين" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const wb = XLSX.read(bytes, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    if (rows.length < 2) return NextResponse.json({ error: "الملف فارغ أو لا يحتوي على بيانات" }, { status: 400 });

    const headers = rows[0];
    const dataRows = rows.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ""));

    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2;
      const code = String(row[0] || "").trim();

      if (!code) continue;

      // Check required fields have values
      const requiredIndices = headers.map((h: string, idx: number) => String(h).includes("*") ? idx : -1).filter((i: number) => i >= 0);
      const missingRequired = requiredIndices.filter((idx: number) => !row[idx] || String(row[idx]).trim() === "");

      if (missingRequired.length > 0) {
        errors.push(`صف ${rowNum}: الكود ${code} — حقول مطلوبة ناقصة: ${missingRequired.map((idx: number) => headers[idx]).join(", ")}`);
        continue;
      }

      try {
        if (type === "products") {
          const existing = await db.product.findUnique({ where: { tenantId_code: { tenantId, code } } });
          const data = {
            code,
            nameAr: String(row[1]),
            nameEn: row[2] ? String(row[2]) : null,
            category: row[3] ? String(row[3]) : null,
            unitType: row[4] ? String(row[4]) : "EA",
            costPrice: parseFloat(row[5]) || 0,
            sellingPrice: parseFloat(row[6]) || 0,
            minimumStock: parseFloat(row[7]) || 0,
            reorderLevel: parseFloat(row[8]) || 0,
            vatRate: parseFloat(row[9]) || 0,
            tenantId,
          };
          if (existing) { await db.product.update({ where: { id: existing.id }, data }); updated++; }
          else { await db.product.create({ data }); imported++; }
        } else if (type === "customers") {
          const existing = await db.customer.findUnique({ where: { tenantId_code: { tenantId, code } } });
          const data = {
            code, nameAr: String(row[1]), nameEn: row[2] ? String(row[2]) : null,
            taxId: row[3] ? String(row[3]) : null, email: row[4] ? String(row[4]) : null,
            phone: row[5] ? String(row[5]) : null, address: row[6] ? String(row[6]) : null,
            city: row[7] ? String(row[7]) : null, country: row[8] ? String(row[8]) : "SA",
            creditLimit: parseFloat(row[9]) || 0, paymentTerms: parseInt(row[10]) || 30, tenantId,
          };
          if (existing) { await db.customer.update({ where: { id: existing.id }, data }); updated++; }
          else { await db.customer.create({ data }); imported++; }
        } else if (type === "vendors") {
          const existing = await db.vendor.findUnique({ where: { tenantId_code: { tenantId, code } } });
          const data = {
            code, nameAr: String(row[1]), nameEn: row[2] ? String(row[2]) : null,
            taxId: row[3] ? String(row[3]) : null, email: row[4] ? String(row[4]) : null,
            phone: row[5] ? String(row[5]) : null, address: row[6] ? String(row[6]) : null,
            city: row[7] ? String(row[7]) : null, country: row[8] ? String(row[8]) : "SA",
            paymentTerms: parseInt(row[9]) || 30, tenantId,
          };
          if (existing) { await db.vendor.update({ where: { id: existing.id }, data }); updated++; }
          else { await db.vendor.create({ data }); imported++; }
        } else if (type === "employees") {
          const existing = await db.employee.findUnique({ where: { tenantId_employeeNumber: { tenantId, employeeNumber: code } } });
          const data = {
            employeeNumber: code, nameAr: String(row[1]), nameEn: row[2] ? String(row[2]) : null,
            email: row[3] ? String(row[3]) : null, phone: row[4] ? String(row[4]) : null,
            nationalId: row[5] ? String(row[5]) : null, department: row[6] ? String(row[6]) : null,
            position: row[7] ? String(row[7]) : null, hireDate: new Date(row[8]),
            basicSalary: parseFloat(row[9]) || 0, housingAllowance: parseFloat(row[10]) || 0,
            transportAllowance: parseFloat(row[11]) || 0, bankName: row[12] ? String(row[12]) : null,
            iban: row[13] ? String(row[13]) : null, tenantId,
          };
          if (existing) { await db.employee.update({ where: { id: existing.id }, data }); updated++; }
          else { await db.employee.create({ data }); imported++; }
        }
      } catch (err: any) {
        errors.push(`صف ${rowNum}: الكود ${code} — ${err.message?.substring(0, 100)}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      updated,
      total: dataRows.length,
      errors: errors.slice(0, 20),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
