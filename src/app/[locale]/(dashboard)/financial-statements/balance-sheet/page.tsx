"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";

export default function BalanceSheetPage() {
  const t = useTranslations("reports");
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";

  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);

  const { data, isLoading } = trpc.reports.balanceSheet.useQuery({
    asOfDate: new Date(asOfDate),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("balanceSheet")}</h1>

      {/* Date Selector */}
      <div className="flex items-center gap-4 mb-6 bg-card rounded-xl border border-border p-4">
        <div>
          <label className="block text-sm font-medium mb-1">حتى تاريخ</label>
          <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" dir="ltr" />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">{tc("loading")}</div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Assets Side */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold mb-4 text-center border-b border-border pb-3">الأصول</h2>
            {data.assets.map((item) => (
              <div key={item.accountId} className="flex justify-between py-1.5 text-sm">
                <span>{item.accountNameAr}</span>
                <span className="font-mono">{formatCurrency(item.balance, currency)}</span>
              </div>
            ))}
            <div className="flex justify-between py-3 text-sm font-bold border-t-2 border-primary mt-4">
              <span>{t("totalAssets")}</span>
              <span className="font-mono">{formatCurrency(data.totalAssets, currency)}</span>
            </div>
          </div>

          {/* Liabilities + Equity Side */}
          <div className="bg-card rounded-xl border border-border p-6">
            {/* Liabilities */}
            <h2 className="text-lg font-bold mb-4 text-center border-b border-border pb-3">الخصوم وحقوق الملكية</h2>

            <h3 className="text-sm font-bold text-muted-foreground mb-2">الخصوم</h3>
            {data.liabilities.map((item) => (
              <div key={item.accountId} className="flex justify-between py-1.5 text-sm">
                <span>{item.accountNameAr}</span>
                <span className="font-mono">{formatCurrency(item.balance, currency)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 text-sm font-bold border-t border-border mt-2 mb-4">
              <span>{t("totalLiabilities")}</span>
              <span className="font-mono">{formatCurrency(data.totalLiabilities, currency)}</span>
            </div>

            {/* Equity */}
            <h3 className="text-sm font-bold text-muted-foreground mb-2">حقوق الملكية</h3>
            {data.equity.map((item) => (
              <div key={item.accountId} className="flex justify-between py-1.5 text-sm">
                <span>{item.accountNameAr}</span>
                <span className="font-mono">{formatCurrency(item.balance, currency)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 text-sm font-bold border-t border-border mt-2">
              <span>{t("totalEquity")}</span>
              <span className="font-mono">{formatCurrency(data.totalEquity, currency)}</span>
            </div>

            {/* Total */}
            <div className="flex justify-between py-3 text-sm font-bold border-t-2 border-primary mt-4">
              <span>الإجمالي</span>
              <span className="font-mono">
                {formatCurrency(data.totalLiabilities + data.totalEquity, currency)}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Balance Check */}
      {data && (
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
          data.isBalanced ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {data.isBalanced
            ? "✓ الميزانية متوازنة — الأصول = الخصوم + حقوق الملكية"
            : "✗ الميزانية غير متوازنة — يوجد فرق في الأرصدة"}
        </div>
      )}
    </div>
  );
}
