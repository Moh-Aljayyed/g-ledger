"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ReportsPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const base = isAr ? "/ar" : "/en";

  const reportGroups = [
    {
      title: isAr ? "المحاسبة" : "Accounting",
      icon: "\u{1F4DD}",
      reports: [
        { name: isAr ? "ميزان المراجعة" : "Trial Balance", href: `${base}/trial-balance`, desc: isAr ? "أرصدة جميع الحسابات" : "All account balances" },
        { name: isAr ? "قائمة الدخل" : "Income Statement", href: `${base}/financial-statements/income-statement`, desc: isAr ? "الإيرادات والمصروفات والربح" : "Revenue, expenses & profit" },
        { name: isAr ? "الميزانية العمومية" : "Balance Sheet", href: `${base}/financial-statements/balance-sheet`, desc: isAr ? "الأصول والخصوم وحقوق الملكية" : "Assets, liabilities & equity" },
        { name: isAr ? "الأستاذ العام" : "General Ledger", href: `${base}/ledger`, desc: isAr ? "حركات حساب محدد" : "Account transactions" },
        { name: isAr ? "منشئ التقارير" : "Report Builder", href: `${base}/report-builder`, desc: isAr ? "تقرير مخصص بالحقول التي تختارها" : "Custom report with fields you choose" },
      ],
    },
    {
      title: isAr ? "المبيعات والعملاء" : "Sales & Customers",
      icon: "\u{1F9FE}",
      reports: [
        { name: isAr ? "تقرير المبيعات" : "Sales Report", href: `${base}/invoices`, desc: isAr ? "جميع فواتير المبيعات" : "All sales invoices" },
        { name: isAr ? "تقادم ديون العملاء" : "Customer Aging", href: `${base}/customers`, desc: isAr ? "مستحقات متأخرة 30/60/90 يوم" : "Overdue 30/60/90 days" },
        { name: isAr ? "كشف حساب عميل" : "Customer Statement", href: `${base}/customers`, desc: isAr ? "حركات عميل محدد" : "Specific customer transactions" },
      ],
    },
    {
      title: isAr ? "المشتريات والموردين" : "Purchases & Vendors",
      icon: "\u{1F4C3}",
      reports: [
        { name: isAr ? "تقرير المشتريات" : "Purchases Report", href: `${base}/bills`, desc: isAr ? "جميع فواتير المشتريات" : "All purchase bills" },
        { name: isAr ? "مستحقات الموردين" : "Vendor Aging", href: `${base}/vendors`, desc: isAr ? "مستحقات متأخرة للموردين" : "Overdue vendor payments" },
      ],
    },
    {
      title: isAr ? "المخزون" : "Inventory",
      icon: "\u{1F4E6}",
      reports: [
        { name: isAr ? "تقييم المخزون" : "Stock Valuation", href: `${base}/inventory`, desc: isAr ? "قيمة المخزون الإجمالية" : "Total inventory value" },
        { name: isAr ? "حركات المخزون" : "Stock Movements", href: `${base}/inventory`, desc: isAr ? "وارد/صادر/تسوية" : "In/Out/Adjustment" },
        { name: isAr ? "تنبيهات نقص المخزون" : "Low Stock Alerts", href: `${base}/inventory`, desc: isAr ? "أصناف تحت حد الطلب" : "Items below reorder level" },
      ],
    },
    {
      title: isAr ? "الأصول الثابتة" : "Fixed Assets",
      icon: "\u{1F3D7}\uFE0F",
      reports: [
        { name: isAr ? "سجل الأصول" : "Asset Register", href: `${base}/fixed-assets`, desc: isAr ? "جميع الأصول بالتكلفة والإهلاك" : "All assets with cost & depreciation" },
        { name: isAr ? "جدول الإهلاك" : "Depreciation Schedule", href: `${base}/fixed-assets`, desc: isAr ? "إهلاك متوقع لكل أصل" : "Projected depreciation per asset" },
        { name: isAr ? "الأصول المستبعدة" : "Disposed Assets", href: `${base}/fixed-assets`, desc: isAr ? "أصول تم بيعها أو تخريدها" : "Sold or scrapped assets" },
      ],
    },
    {
      title: isAr ? "الموارد البشرية" : "HR & Payroll",
      icon: "\u{1F465}",
      reports: [
        { name: isAr ? "مسير الرواتب" : "Payroll Report", href: `${base}/payroll`, desc: isAr ? "ملخص الرواتب الشهري" : "Monthly payroll summary" },
        { name: isAr ? "سجل الحضور" : "Attendance Report", href: `${base}/hr`, desc: isAr ? "حضور وانصراف الموظفين" : "Employee attendance" },
        { name: isAr ? "رصيد الإجازات" : "Leave Balance", href: `${base}/leaves`, desc: isAr ? "رصيد الإجازات لكل موظف" : "Leave balance per employee" },
        { name: isAr ? "تقرير التأمينات" : "GOSI Report", href: `${base}/payroll`, desc: isAr ? "حصة الموظف وصاحب العمل" : "Employee & employer share" },
      ],
    },
    {
      title: isAr ? "البنوك والنقدية" : "Banking & Cash",
      icon: "\u{1F3E6}",
      reports: [
        { name: isAr ? "كشف حساب بنكي" : "Bank Statement", href: `${base}/bank`, desc: isAr ? "حركات حساب بنكي محدد" : "Specific bank account transactions" },
        { name: isAr ? "تسوية بنكية" : "Bank Reconciliation", href: `${base}/bank`, desc: isAr ? "مطابقة مع كشف البنك" : "Match with bank statement" },
      ],
    },
    {
      title: isAr ? "CRM والمبيعات" : "CRM & Sales",
      icon: "\u{1F3AF}",
      reports: [
        { name: isAr ? "تقرير Pipeline" : "Pipeline Report", href: `${base}/crm`, desc: isAr ? "العملاء المحتملين حسب المرحلة" : "Leads by stage" },
        { name: isAr ? "معدل التحويل" : "Conversion Rate", href: `${base}/crm`, desc: isAr ? "نسبة الفوز من إجمالي الفرص" : "Win rate from total opportunities" },
      ],
    },
    {
      title: isAr ? "المصروفات" : "Expenses",
      icon: "\u{1F9FE}",
      reports: [
        { name: isAr ? "تقرير المصروفات" : "Expense Report", href: `${base}/expenses`, desc: isAr ? "المصروفات حسب الفئة والفترة" : "Expenses by category & period" },
        { name: isAr ? "مصروفات معلقة" : "Pending Expenses", href: `${base}/expenses`, desc: isAr ? "مصروفات تنتظر الاعتماد" : "Expenses awaiting approval" },
      ],
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#021544] mb-2">{isAr ? "مركز التقارير" : "Reports Center"}</h1>
      <p className="text-muted-foreground mb-8">{isAr ? "جميع التقارير مصنفة حسب الموديول — اختر التقرير المطلوب" : "All reports organized by module — choose the report you need"}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportGroups.map((group, gi) => (
          <div key={gi} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all">
            <div className="bg-gradient-to-l from-[#021544] to-[#0070F2] px-5 py-3 flex items-center gap-3">
              <span className="text-xl">{group.icon}</span>
              <h2 className="text-white font-bold text-sm">{group.title}</h2>
            </div>
            <div className="p-4 space-y-1">
              {group.reports.map((report, ri) => (
                <Link key={ri} href={report.href} className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#0070F2" className="mt-0.5 shrink-0 opacity-50 group-hover:opacity-100"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
                  <div>
                    <p className="text-sm font-medium text-[#021544] group-hover:text-[#0070F2]">{report.name}</p>
                    <p className="text-[10px] text-muted-foreground">{report.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
