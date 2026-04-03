"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";

interface Field {
  id: string;
  label: string;
}

interface FieldGroup {
  name: string;
  fields: Field[];
}

function getFieldGroups(isAr: boolean): FieldGroup[] {
  return [
    { name: isAr ? "المحاسبة" : "Accounting", fields: [
      { id: "entry_number", label: isAr ? "رقم القيد" : "Entry No." },
      { id: "entry_date", label: isAr ? "التاريخ" : "Date" },
      { id: "entry_description", label: isAr ? "الوصف" : "Description" },
      { id: "entry_debit", label: isAr ? "مدين" : "Debit" },
      { id: "entry_credit", label: isAr ? "دائن" : "Credit" },
      { id: "entry_status", label: isAr ? "الحالة" : "Status" },
      { id: "account_code", label: isAr ? "رمز الحساب" : "Account Code" },
      { id: "account_name", label: isAr ? "اسم الحساب" : "Account Name" },
    ]},
    { name: isAr ? "الفواتير" : "Invoices", fields: [
      { id: "inv_number", label: isAr ? "رقم الفاتورة" : "Invoice No." },
      { id: "inv_date", label: isAr ? "التاريخ" : "Date" },
      { id: "inv_buyer", label: isAr ? "العميل" : "Customer" },
      { id: "inv_subtotal", label: isAr ? "المجموع" : "Subtotal" },
      { id: "inv_vat", label: isAr ? "الضريبة" : "VAT" },
      { id: "inv_total", label: isAr ? "الإجمالي" : "Total" },
      { id: "inv_status", label: isAr ? "الحالة" : "Status" },
    ]},
    { name: isAr ? "العملاء" : "Customers", fields: [
      { id: "cust_code", label: isAr ? "الرمز" : "Code" },
      { id: "cust_name", label: isAr ? "الاسم" : "Name" },
      { id: "cust_tax_id", label: isAr ? "الرقم الضريبي" : "Tax ID" },
      { id: "cust_phone", label: isAr ? "الهاتف" : "Phone" },
      { id: "cust_balance", label: isAr ? "الرصيد" : "Balance" },
    ]},
    { name: isAr ? "الموردون" : "Vendors", fields: [
      { id: "vend_code", label: isAr ? "الرمز" : "Code" },
      { id: "vend_name", label: isAr ? "الاسم" : "Name" },
      { id: "vend_balance", label: isAr ? "الرصيد" : "Balance" },
    ]},
    { name: isAr ? "المخزون" : "Inventory", fields: [
      { id: "prod_code", label: isAr ? "كود المنتج" : "Product Code" },
      { id: "prod_name", label: isAr ? "اسم المنتج" : "Product Name" },
      { id: "prod_stock", label: isAr ? "الكمية" : "Stock" },
      { id: "prod_cost", label: isAr ? "سعر التكلفة" : "Cost" },
      { id: "prod_price", label: isAr ? "سعر البيع" : "Sell Price" },
      { id: "prod_value", label: isAr ? "قيمة المخزون" : "Stock Value" },
    ]},
    { name: isAr ? "الموظفون" : "Employees", fields: [
      { id: "emp_number", label: isAr ? "رقم الموظف" : "Employee No." },
      { id: "emp_name", label: isAr ? "الاسم" : "Name" },
      { id: "emp_department", label: isAr ? "القسم" : "Department" },
      { id: "emp_salary", label: isAr ? "الراتب" : "Salary" },
      { id: "emp_status", label: isAr ? "الحالة" : "Status" },
    ]},
  ];
}

// Generate mock data for preview
function generateMockData(fields: Field[], rows: number = 5): Record<string, string>[] {
  const mockValues: Record<string, string[]> = {
    entry_number: ["JE-001", "JE-002", "JE-003", "JE-004", "JE-005"],
    entry_date: ["2026-01-15", "2026-02-01", "2026-02-15", "2026-03-01", "2026-03-15"],
    entry_description: ["Purchase materials", "Sales revenue", "Salary payment", "Rent expense", "Equipment purchase"],
    entry_debit: ["5,000", "0", "12,000", "3,500", "25,000"],
    entry_credit: ["0", "8,500", "0", "0", "0"],
    entry_status: ["Posted", "Posted", "Draft", "Posted", "Draft"],
    account_code: ["1101", "4101", "5201", "5301", "1501"],
    account_name: ["Cash", "Sales", "Salaries", "Rent", "Equipment"],
    inv_number: ["INV-001", "INV-002", "INV-003", "INV-004", "INV-005"],
    inv_date: ["2026-01-10", "2026-01-20", "2026-02-05", "2026-02-18", "2026-03-01"],
    inv_buyer: ["ABC Corp", "XYZ Ltd", "Tech Inc", "Global Co", "Star LLC"],
    inv_subtotal: ["10,000", "5,500", "22,000", "8,750", "15,000"],
    inv_vat: ["1,500", "825", "3,300", "1,312", "2,250"],
    inv_total: ["11,500", "6,325", "25,300", "10,062", "17,250"],
    inv_status: ["Accepted", "Submitted", "Draft", "Accepted", "Rejected"],
    cust_code: ["C-001", "C-002", "C-003", "C-004", "C-005"],
    cust_name: ["Ahmad Co", "Salem Ltd", "Nour Inc", "Fahd Group", "Reem LLC"],
    cust_tax_id: ["100-200-300", "100-200-301", "100-200-302", "100-200-303", "100-200-304"],
    cust_phone: ["+966-50-111", "+966-50-222", "+966-50-333", "+966-50-444", "+966-50-555"],
    cust_balance: ["15,000", "8,200", "0", "22,500", "3,100"],
    vend_code: ["V-001", "V-002", "V-003", "V-004", "V-005"],
    vend_name: ["Supplier A", "Supplier B", "Supplier C", "Supplier D", "Supplier E"],
    vend_balance: ["7,500", "12,000", "0", "5,300", "18,000"],
    prod_code: ["P-001", "P-002", "P-003", "P-004", "P-005"],
    prod_name: ["Widget A", "Widget B", "Part X", "Part Y", "Assembly Z"],
    prod_stock: ["150", "80", "300", "45", "12"],
    prod_cost: ["25.00", "42.50", "10.00", "85.00", "250.00"],
    prod_price: ["35.00", "60.00", "15.00", "120.00", "350.00"],
    prod_value: ["3,750", "3,400", "3,000", "3,825", "3,000"],
    emp_number: ["E-001", "E-002", "E-003", "E-004", "E-005"],
    emp_name: ["Ali Hassan", "Sara Ahmed", "Omar Khalid", "Lina Nasser", "Youssef Fadi"],
    emp_department: ["Finance", "IT", "Sales", "HR", "Operations"],
    emp_salary: ["8,000", "12,000", "7,500", "9,000", "6,500"],
    emp_status: ["Active", "Active", "On Leave", "Active", "Resigned"],
  };

  return Array.from({ length: rows }, (_, i) =>
    Object.fromEntries(
      fields.map((f) => [f.id, mockValues[f.id]?.[i] ?? "—"])
    )
  );
}

export default function ReportBuilderPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

  const fieldGroups = getFieldGroups(isAr);

  const [selectedFields, setSelectedFields] = useState<Field[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(fieldGroups.map((g) => [g.name, true]))
  );
  const [showPreview, setShowPreview] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const addField = useCallback((field: Field) => {
    setSelectedFields((prev) => {
      if (prev.some((f) => f.id === field.id)) return prev;
      return [...prev, field];
    });
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setSelectedFields((prev) => prev.filter((f) => f.id !== fieldId));
  }, []);

  const moveField = useCallback((index: number, direction: "up" | "down") => {
    setSelectedFields((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const mockData = showPreview ? generateMockData(selectedFields) : [];

  const handleExportExcel = () => {
    if (selectedFields.length === 0) return;
    // Build CSV content for download
    const headers = selectedFields.map((f) => f.label).join(",");
    const rows = mockData.map((row) =>
      selectedFields.map((f) => `"${row[f.id] || ""}"`).join(",")
    );
    const csv = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    // Print the preview table as PDF
    if (selectedFields.length === 0) return;
    window.print();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isAr ? "منشئ التقارير" : "Report Builder"}</h1>
      </div>

      {/* Date Range Filter */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {isAr ? "من تاريخ" : "From Date"}
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {isAr ? "إلى تاريخ" : "To Date"}
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
          />
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* LEFT: Available Fields */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h2 className="text-sm font-bold">{isAr ? "الحقول المتاحة" : "Available Fields"}</h2>
          </div>
          <div className="p-3 max-h-[500px] overflow-y-auto">
            {fieldGroups.map((group) => (
              <div key={group.name} className="mb-2">
                <button
                  onClick={() => toggleGroup(group.name)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors text-sm font-medium"
                >
                  <span>{group.name}</span>
                  <svg
                    width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                    className={`transition-transform text-muted-foreground ${expandedGroups[group.name] ? "" : "-rotate-90"}`}
                  >
                    <path d="M3 4L6 7L9 4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
                {expandedGroups[group.name] && (
                  <div className="mt-1 space-y-0.5">
                    {group.fields.map((field) => {
                      const isSelected = selectedFields.some((f) => f.id === field.id);
                      return (
                        <div
                          key={field.id}
                          className={`flex items-center justify-between px-3 py-1.5 rounded text-sm ${
                            isSelected ? "opacity-40" : "hover:bg-muted/30"
                          }`}
                        >
                          <span className="text-muted-foreground">{field.label}</span>
                          <button
                            onClick={() => addField(field)}
                            disabled={isSelected}
                            className="text-primary hover:text-primary/80 font-bold text-lg leading-none disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Selected Fields (Report) */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h2 className="text-sm font-bold">
              {isAr ? "التقرير" : "Report"}
              {selectedFields.length > 0 && (
                <span className="text-muted-foreground font-normal mr-2 ml-2">
                  ({selectedFields.length} {isAr ? "حقل" : "fields"})
                </span>
              )}
            </h2>
          </div>
          <div className="p-3 max-h-[500px] overflow-y-auto">
            {selectedFields.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                {isAr
                  ? 'اختر حقول من القائمة اليسرى بالضغط على "+"'
                  : 'Select fields from the left panel by clicking "+"'}
              </div>
            ) : (
              <div className="space-y-1">
                {selectedFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5 text-center">{idx + 1}</span>
                      <span className="text-sm font-medium">{field.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveField(idx, "up")}
                        disabled={idx === 0}
                        className="px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveField(idx, "down")}
                        disabled={idx === selectedFields.length - 1}
                        className="px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeField(field.id)}
                        className="px-1.5 py-0.5 text-xs text-red-500 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap mb-6">
        <button
          onClick={() => setShowPreview(true)}
          disabled={selectedFields.length === 0}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isAr ? "إنشاء التقرير" : "Generate Report"}
        </button>
        {showPreview && (
          <>
            <button
              onClick={handleExportPdf}
              className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              {isAr ? "تصدير PDF" : "Export PDF"}
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              {isAr ? "تصدير Excel" : "Export Excel"}
            </button>
          </>
        )}
        {selectedFields.length > 0 && (
          <button
            onClick={() => { setSelectedFields([]); setShowPreview(false); }}
            className="px-4 py-2.5 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            {isAr ? "مسح الكل" : "Clear All"}
          </button>
        )}
      </div>

      {/* Preview Table */}
      {showPreview && selectedFields.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden print:border-0 print:rounded-none">
          <div className="px-4 py-3 border-b border-border bg-muted/30 print:hidden">
            <h2 className="text-sm font-bold">
              {isAr ? "معاينة التقرير" : "Report Preview"}
              {(dateFrom || dateTo) && (
                <span className="text-muted-foreground font-normal mr-2 ml-2 text-xs">
                  {dateFrom && `${isAr ? "من" : "From"}: ${dateFrom}`}
                  {dateFrom && dateTo && " — "}
                  {dateTo && `${isAr ? "إلى" : "To"}: ${dateTo}`}
                </span>
              )}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-start px-4 py-2.5 text-xs font-medium text-muted-foreground">#</th>
                  {selectedFields.map((f) => (
                    <th key={f.id} className="text-start px-4 py-2.5 text-xs font-medium text-muted-foreground">
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockData.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">{i + 1}</td>
                    {selectedFields.map((f) => (
                      <td key={f.id} className="px-4 py-2.5 text-sm">{row[f.id]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
