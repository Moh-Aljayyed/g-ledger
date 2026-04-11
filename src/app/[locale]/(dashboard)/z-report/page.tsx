"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function ZReportPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const [mode, setMode] = useState<"today" | "range">("today");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  const { from, to } = useMemo(() => {
    if (mode === "today") {
      const f = new Date();
      f.setHours(0, 0, 0, 0);
      const t = new Date(f);
      t.setDate(t.getDate() + 1);
      return { from: f, to: t };
    }
    const f = new Date(fromDate);
    f.setHours(0, 0, 0, 0);
    const t = new Date(toDate);
    t.setHours(23, 59, 59, 999);
    return { from: f, to: t };
  }, [mode, fromDate, toDate]);

  const { data: report, isLoading, refetch } = trpc.pos.zReport.useQuery(
    { from, to },
    { refetchOnWindowFocus: false },
  );

  const t = {
    title: isAr ? "تقرير Z / X" : "Z / X Report",
    subtitle: isAr
      ? "تقرير إقفال اليوم — ملخص شامل لكل المبيعات مع تفصيل طرق الدفع"
      : "Daily closing report — full sales breakdown with payment methods",
    today: isAr ? "اليوم" : "Today",
    range: isAr ? "فترة مخصصة" : "Date Range",
    refresh: isAr ? "تحديث" : "Refresh",
    print: isAr ? "طباعة (إقفال Z)" : "Print (Z Close)",
    gross: isAr ? "إجمالي المبيعات" : "Gross Sales",
    vat: isAr ? "الضريبة" : "VAT",
    discount: isAr ? "الخصم" : "Discount",
    net: isAr ? "الصافي" : "Net Sales",
    count: isAr ? "عدد الفواتير" : "Transactions",
    avg: isAr ? "متوسط الفاتورة" : "Avg Ticket",
    payments: isAr ? "طرق الدفع" : "Payment Methods",
    cash: isAr ? "نقداً" : "Cash",
    card: isAr ? "بطاقة" : "Card",
    transfer: isAr ? "تحويل" : "Transfer",
    credit: isAr ? "آجل" : "Credit",
    top: isAr ? "أكثر الأصناف مبيعاً" : "Top Selling Products",
    hourly: isAr ? "التوزيع حسب الساعة" : "Hourly Distribution",
  };

  const maxHourly = Math.max(...(report?.hourly || [1]), 1);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#021544]">{t.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 border border-border rounded-lg text-sm font-semibold bg-white"
          >
            🔄 {t.refresh}
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#021544] text-white rounded-lg text-sm font-semibold"
          >
            🖨️ {t.print}
          </button>
        </div>
      </div>

      {/* Date range selector */}
      <div className="mb-6 flex gap-3 items-center flex-wrap print:hidden">
        <div className="inline-flex bg-muted/50 rounded-lg p-1 border border-border">
          <button
            onClick={() => setMode("today")}
            className={`px-4 py-1.5 rounded text-xs font-semibold ${
              mode === "today" ? "bg-white text-[#021544] shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t.today}
          </button>
          <button
            onClick={() => setMode("range")}
            className={`px-4 py-1.5 rounded text-xs font-semibold ${
              mode === "range" ? "bg-white text-[#021544] shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t.range}
          </button>
        </div>
        {mode === "range" && (
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm"
            />
            <span className="text-muted-foreground">→</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm"
            />
          </div>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          {isAr ? "جاري التحميل..." : "Loading..."}
        </div>
      )}

      {report && (
        <div className="space-y-6">
          {/* Period header */}
          <div className="bg-gradient-to-br from-[#021544] to-[#0070F2] rounded-2xl p-6 text-white">
            <div className="text-xs opacity-70 mb-1">{isAr ? "الفترة" : "Period"}</div>
            <div className="font-mono text-sm">
              {new Date(report.period.from).toLocaleString(isAr ? "ar-EG" : "en-US")}
              {" → "}
              {new Date(report.period.to).toLocaleString(isAr ? "ar-EG" : "en-US")}
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label={t.gross} value={report.grossSales.toFixed(2)} icon="📊" />
            <MetricCard label={t.vat} value={report.totalVat.toFixed(2)} icon="🧾" />
            <MetricCard label={t.net} value={report.netSales.toFixed(2)} icon="💰" highlight />
            <MetricCard label={t.count} value={String(report.count)} icon="🛒" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <MetricCard label={t.avg} value={report.avgTicket.toFixed(2)} icon="💳" />
            <MetricCard label={t.discount} value={report.totalDiscount.toFixed(2)} icon="🏷️" />
          </div>

          {/* Payment breakdown */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-[#021544] mb-4">{t.payments}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PaymentCard label={t.cash} amount={report.payments.cash} icon="💵" color="bg-green-100 text-green-700" />
              <PaymentCard label={t.card} amount={report.payments.card} icon="💳" color="bg-blue-100 text-blue-700" />
              <PaymentCard label={t.transfer} amount={report.payments.transfer} icon="🏦" color="bg-purple-100 text-purple-700" />
              <PaymentCard label={t.credit} amount={report.payments.credit} icon="📜" color="bg-amber-100 text-amber-700" />
            </div>
          </div>

          {/* Top products */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="text-base font-semibold text-[#021544]">{t.top}</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">#</th>
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الصنف" : "Product"}</th>
                  <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الكمية" : "Qty"}</th>
                  <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الإيراد" : "Revenue"}</th>
                </tr>
              </thead>
              <tbody>
                {report.topProducts.map((p, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-end">{p.qty.toFixed(0)}</td>
                    <td className="px-4 py-3 text-sm font-mono font-bold text-end text-[#0070F2]">{p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
                {report.topProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-sm text-muted-foreground">
                      {isAr ? "لا توجد بيانات" : "No data"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Hourly */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-[#021544] mb-4">{t.hourly}</h2>
            <div className="flex items-end gap-1 h-32">
              {report.hourly.map((value, hour) => {
                const height = maxHourly > 0 ? (value / maxHourly) * 100 : 0;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <div
                      className="w-full bg-gradient-to-t from-[#0070F2] to-[#00C9A7] rounded-t transition-all"
                      style={{ height: `${Math.max(2, height)}%` }}
                      title={`${hour}:00 = ${value.toFixed(2)}`}
                    />
                    <div className="text-[9px] font-mono text-muted-foreground">{hour}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800 print:hidden">
            💡 {isAr
              ? "هذا التقرير متوافق مع متطلبات التدقيق الضريبي (ZATCA / ETA). اطبعه واحفظه في أرشيف يومي."
              : "This report is ZATCA / ETA audit compliant. Print and archive daily."}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        highlight
          ? "bg-gradient-to-br from-[#0070F2]/10 to-[#00C9A7]/10 border-[#0070F2]/30"
          : "bg-card border-border"
      }`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-xl font-bold text-[#021544] font-mono">{value}</div>
    </div>
  );
}

function PaymentCard({ label, amount, icon, color }: { label: string; amount: number; icon: string; color: string }) {
  return (
    <div className="text-center p-4 rounded-lg bg-muted/30 border border-border/50">
      <div className={`inline-flex w-10 h-10 rounded-xl items-center justify-center text-lg mb-2 ${color}`}>
        {icon}
      </div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-base font-bold text-[#021544] font-mono mt-1">{amount.toFixed(2)}</div>
    </div>
  );
}
