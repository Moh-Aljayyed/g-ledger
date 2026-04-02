"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function PayrollPage() {
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [expandedPayroll, setExpandedPayroll] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.payroll.list.useQuery();

  const approvePayroll = trpc.payroll.approve.useMutation({ onSuccess: () => refetch() });
  const markPaid = trpc.payroll.markPaid.useMutation({ onSuccess: () => refetch() });

  const statusColors: Record<string, string> = {
    DRAFT: "bg-muted text-muted-foreground",
    APPROVED: "bg-blue-50 text-blue-700",
    PAID: "bg-green-50 text-green-700",
  };

  const statusLabels: Record<string, string> = {
    DRAFT: isAr ? "مسودة" : "Draft",
    APPROVED: isAr ? "معتمد" : "Approved",
    PAID: isAr ? "مدفوع" : "Paid",
  };

  const monthNamesAr: Record<number, string> = { 1: "يناير", 2: "فبراير", 3: "مارس", 4: "أبريل", 5: "مايو", 6: "يونيو", 7: "يوليو", 8: "أغسطس", 9: "سبتمبر", 10: "أكتوبر", 11: "نوفمبر", 12: "ديسمبر" };
  const monthNamesEn: Record<number, string> = { 1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December" };
  const monthNames = isAr ? monthNamesAr : monthNamesEn;

  const toggleExpand = (id: string) => { setExpandedPayroll((prev) => (prev === id ? null : id)); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">{isAr ? "مسيّر الرواتب" : "Payroll"}</h1>
        <button onClick={() => setShowGenerateModal(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          {isAr ? "+ إنشاء مسيّر رواتب" : "+ Generate Payroll"}
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground w-8"></th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الفترة" : "Period"}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الشهر / السنة" : "Month / Year"}</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "إجمالي الراتب الأساسي" : "Total Basic Salary"}</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "صافي الرواتب" : "Net Salaries"}</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الحالة" : "Status"}</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">{tc("loading")}</td></tr>
            ) : data?.payrolls && data.payrolls.length > 0 ? (
              data.payrolls.map((payroll: any) => (
                <>
                  <tr key={payroll.id} className="border-b border-border/50 hover:bg-muted/20 cursor-pointer" onClick={() => toggleExpand(payroll.id)}>
                    <td className="px-4 py-3 text-sm">{expandedPayroll === payroll.id ? "▾" : "◂"}</td>
                    <td className="px-4 py-3 text-sm font-medium">{payroll.period}</td>
                    <td className="px-4 py-3 text-sm">{monthNames[payroll.month] ?? payroll.month} / {payroll.year}</td>
                    <td className="px-4 py-3 text-sm text-end font-mono">{formatCurrency(Number(payroll.totalBasic ?? 0), currency)}</td>
                    <td className="px-4 py-3 text-sm text-end font-mono font-medium">{formatCurrency(Number(payroll.totalNet ?? 0), currency)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[payroll.status] ?? ""}`}>
                        {statusLabels[payroll.status] ?? payroll.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end space-x-2 rtl:space-x-reverse">
                      {payroll.status === "DRAFT" && (
                        <button onClick={(e) => { e.stopPropagation(); approvePayroll.mutate({ id: payroll.id }); }} disabled={approvePayroll.isPending} className="text-xs text-primary hover:underline font-medium">
                          {isAr ? "اعتماد" : "Approve"}
                        </button>
                      )}
                      {payroll.status === "APPROVED" && (
                        <button onClick={(e) => { e.stopPropagation(); markPaid.mutate({ id: payroll.id }); }} disabled={markPaid.isPending} className="text-xs text-green-700 hover:underline font-medium">
                          {isAr ? "تم الصرف" : "Mark Paid"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedPayroll === payroll.id && payroll.items && (
                    <tr key={`${payroll.id}-items`}>
                      <td colSpan={7} className="px-8 py-3 bg-muted/10">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border/50">
                              <th className="text-start px-3 py-2 text-xs font-medium text-muted-foreground">{isAr ? "الموظف" : "Employee"}</th>
                              <th className="text-end px-3 py-2 text-xs font-medium text-muted-foreground">{isAr ? "الراتب الأساسي" : "Basic Salary"}</th>
                              <th className="text-end px-3 py-2 text-xs font-medium text-muted-foreground">{isAr ? "البدلات" : "Allowances"}</th>
                              <th className="text-end px-3 py-2 text-xs font-medium text-muted-foreground">{isAr ? "الخصومات" : "Deductions"}</th>
                              <th className="text-end px-3 py-2 text-xs font-medium text-muted-foreground">{isAr ? "الصافي" : "Net"}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payroll.items.map((item: any) => (
                              <tr key={item.id} className="border-b border-border/30">
                                <td className="px-3 py-2 text-sm">{item.employee?.nameAr || item.employee?.nameEn || "—"}</td>
                                <td className="px-3 py-2 text-sm text-end font-mono">{formatCurrency(Number(item.basicSalary ?? 0), currency)}</td>
                                <td className="px-3 py-2 text-sm text-end font-mono">{formatCurrency(Number(item.totalAllowances ?? 0), currency)}</td>
                                <td className="px-3 py-2 text-sm text-end font-mono text-red-600">{formatCurrency(Number(item.totalDeductions ?? 0), currency)}</td>
                                <td className="px-3 py-2 text-sm text-end font-mono font-medium">{formatCurrency(Number(item.netSalary ?? 0), currency)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              ))
            ) : (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">{tc("noData")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showGenerateModal && (
        <GeneratePayrollModal isAr={isAr} onClose={() => setShowGenerateModal(false)} onSuccess={() => { setShowGenerateModal(false); refetch(); }} />
      )}
    </div>
  );
}

function GeneratePayrollModal({ isAr, onClose, onSuccess }: { isAr: boolean; onClose: () => void; onSuccess: () => void; }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const generatePayroll = trpc.payroll.generate.useMutation({ onSuccess: () => onSuccess() });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); generatePayroll.mutate({ month, year }); };

  const monthOptionsAr = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const monthOptionsEn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthOptions = isAr ? monthOptionsAr : monthOptionsEn;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "إنشاء مسيّر رواتب" : "Generate Payroll"}</h2>

        {generatePayroll.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{generatePayroll.error.message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "الشهر" : "Month"}</label>
              <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring">
                {monthOptions.map((name, i) => <option key={i+1} value={i+1}>{name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "السنة" : "Year"}</label>
              <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} required className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" min={2020} max={2030} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" disabled={generatePayroll.isPending} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {generatePayroll.isPending ? (isAr ? "جاري الإنشاء..." : "Generating...") : (isAr ? "إنشاء" : "Generate")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
