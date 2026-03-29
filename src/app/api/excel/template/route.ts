import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // products, customers, vendors, employees, accounts

  const templates: Record<string, { headers: string[]; sample: any[]; sheetName: string }> = {
    products: {
      sheetName: "المنتجات",
      headers: ["الكود*", "الاسم بالعربي*", "الاسم بالإنجليزي", "التصنيف", "الوحدة", "سعر التكلفة*", "سعر البيع*", "الحد الأدنى", "حد إعادة الطلب", "نسبة الضريبة"],
      sample: [["P001", "غزل قطن", "Cotton Yarn", "مواد خام", "KG", "50.00", "75.00", "100", "200", "14"]],
    },
    customers: {
      sheetName: "العملاء",
      headers: ["الكود*", "الاسم بالعربي*", "الاسم بالإنجليزي", "الرقم الضريبي", "الإيميل", "الهاتف", "العنوان", "المدينة", "الدولة", "حد الائتمان", "شروط الدفع (أيام)"],
      sample: [["C001", "شركة الأمل", "Al-Amal Co", "123456789", "info@alamal.com", "0501234567", "شارع الملك فهد", "الرياض", "SA", "50000", "30"]],
    },
    vendors: {
      sheetName: "الموردون",
      headers: ["الكود*", "الاسم بالعربي*", "الاسم بالإنجليزي", "الرقم الضريبي", "الإيميل", "الهاتف", "العنوان", "المدينة", "الدولة", "شروط الدفع (أيام)"],
      sample: [["V001", "مصنع النسيج", "Textile Factory", "987654321", "info@textile.com", "0559876543", "المنطقة الصناعية", "جدة", "SA", "45"]],
    },
    employees: {
      sheetName: "الموظفون",
      headers: ["رقم الموظف*", "الاسم بالعربي*", "الاسم بالإنجليزي", "الإيميل", "الهاتف", "رقم الهوية", "القسم", "المنصب", "تاريخ التعيين*", "الراتب الأساسي*", "بدل السكن", "بدل النقل", "اسم البنك", "IBAN"],
      sample: [["E001", "أحمد محمد", "Ahmed Mohamed", "ahmed@co.com", "0551234567", "1234567890", "الإنتاج", "مشغل ماكينة", "2026-01-15", "5000", "1250", "500", "الراجحي", "SA0380000000608010167519"]],
    },
    accounts: {
      sheetName: "الحسابات",
      headers: ["الكود*", "الاسم بالعربي*", "الاسم بالإنجليزي*", "النوع* (ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE)", "الطبيعة* (DEBIT/CREDIT)", "كود الحساب الأب"],
      sample: [["1109", "مخزون إضافي", "Additional Inventory", "ASSET", "DEBIT", "11"]],
    },
  };

  const template = templates[type || "products"];
  if (!template) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const ws = XLSX.utils.aoa_to_sheet([template.headers, ...template.sample]);

  // Add validation note as a comment-like row
  const noteRow = template.headers.map(h => h.includes("*") ? "مطلوب" : "اختياري");
  XLSX.utils.sheet_add_aoa(ws, [noteRow], { origin: -1 });

  // Set column widths
  ws["!cols"] = template.headers.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, template.sheetName);

  // Add instructions sheet
  const instructionsData = [
    ["تعليمات الاستيراد"],
    [""],
    ["1. الحقول المميزة بـ * مطلوبة ولا يمكن تركها فارغة"],
    ["2. إذا كان الكود موجود مسبقاً في النظام سيتم تحديث البيانات"],
    ["3. إذا كان الكود جديد سيتم إنشاء سجل جديد"],
    ["4. لا تغيّر ترتيب الأعمدة أو أسماءها"],
    ["5. الصف الأول هو صف العناوين — لا تحذفه"],
    ["6. الصف الثاني مثال — يمكنك حذفه أو تعديله"],
    ["7. احفظ الملف بصيغة .xlsx"],
    [""],
    ["تنبيه: إذا كان هناك كود في أي صف يجب ملء جميع الحقول المطلوبة (*)"],
  ];
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
  wsInstructions["!cols"] = [{ wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, "تعليمات");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${type}_template.xlsx"`,
    },
  });
}
