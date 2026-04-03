"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/utils";

export default function CashFlowPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";

  const { data: reportData } = trpc.reports.dashboard.useQuery();

  // Simplified cash flow based on available data
  const revenue = reportData?.totalRevenue ?? 0;
  const expenses = reportData?.totalExpenses ?? 0;
  const netIncome = revenue - expenses;

  // Estimate operating, investing, financing
  const operating = netIncome;
  const investing = 0; // Would need fixed asset purchase data
  const financing = 0; // Would need loan data
  const netCashChange = operating + investing + financing;

  const sections = [
    {
      title: isAr ? "التدفقات النقدية من الأنشطة التشغيلية" : "Cash Flows from Operating Activities",
      items: [
        { label: isAr ? "صافي الربح/الخسارة" : "Net Income/Loss", amount: netIncome },
        { label: isAr ? "تغير في العملاء (الذمم المدينة)" : "Change in Accounts Receivable", amount: 0 },
        { label: isAr ? "تغير في الموردين (الذمم الدائنة)" : "Change in Accounts Payable", amount: 0 },
        { label: isAr ? "تغير في المخزون" : "Change in Inventory", amount: 0 },
        { label: isAr ? "إهلاك الأصول الثابتة" : "Depreciation", amount: 0 },
      ],
      total: operating,
    },
    {
      title: isAr ? "التدفقات النقدية من الأنشطة الاستثمارية" : "Cash Flows from Investing Activities",
      items: [
        { label: isAr ? "شراء أصول ثابتة" : "Purchase of Fixed Assets", amount: 0 },
        { label: isAr ? "بيع أصول ثابتة" : "Sale of Fixed Assets", amount: 0 },
      ],
      total: investing,
    },
    {
      title: isAr ? "التدفقات النقدية من الأنشطة التمويلية" : "Cash Flows from Financing Activities",
      items: [
        { label: isAr ? "قروض جديدة" : "New Loans", amount: 0 },
        { label: isAr ? "سداد قروض" : "Loan Repayments", amount: 0 },
        { label: isAr ? "زيادة رأس المال" : "Capital Increase", amount: 0 },
        { label: isAr ? "مسحوبات" : "Drawings", amount: 0 },
      ],
      total: financing,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#021544] mb-6">{isAr ? "قائمة التدفقات النقدية" : "Cash Flow Statement"}</h1>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {sections.map((section, si) => (
          <div key={si} className={si > 0 ? "border-t-2 border-border" : ""}>
            <div className="bg-muted/30 px-6 py-3">
              <h2 className="font-bold text-[#021544] text-sm">{section.title}</h2>
            </div>
            <div className="px-6">
              {section.items.map((item, ii) => (
                <div key={ii} className="flex justify-between py-2.5 border-b border-border/30 last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={`text-sm font-medium ${item.amount < 0 ? "text-red-600" : item.amount > 0 ? "text-green-600" : ""}`}>
                    {formatCurrency(item.amount, currency)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-3 font-bold border-t border-border">
                <span className="text-sm text-[#021544]">{isAr ? "صافي التدفق" : "Net Cash Flow"}</span>
                <span className={`text-sm ${section.total < 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(section.total, currency)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Net Change */}
        <div className="bg-[#021544] text-white px-6 py-4 flex justify-between items-center">
          <span className="font-bold">{isAr ? "صافي التغير في النقدية" : "Net Change in Cash"}</span>
          <span className="text-xl font-bold">{formatCurrency(netCashChange, currency)}</span>
        </div>
      </div>
    </div>
  );
}
