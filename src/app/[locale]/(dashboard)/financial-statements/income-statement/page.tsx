"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";

export default function IncomeStatementPage() {
  const t = useTranslations("reports");
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";

  const [fromDate, setFromDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  const { data, isLoading } = trpc.reports.incomeStatement.useQuery({
    fromDate: new Date(fromDate),
    toDate: new Date(toDate),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("incomeStatement")}</h1>

      {/* Date Range */}
      <div className="flex items-center gap-4 mb-6 bg-card rounded-xl border border-border p-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("fromDate")}</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("toDate")}</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" dir="ltr" />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">{tc("loading")}</div>
      ) : data ? (
        <div className="bg-card rounded-xl border border-border p-6 max-w-2xl">
          {/* Title */}
          <div className="text-center mb-6 pb-4 border-b border-border">
            <h2 className="text-lg font-bold">{t("incomeStatement")}</h2>
            <p className="text-sm text-muted-foreground">
              من {fromDate} إلى {toDate}
            </p>
          </div>

          {/* Revenue */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-muted-foreground mb-3">الإيرادات</h3>
            {data.revenue.map((item) => (
              <div key={item.accountId} className="flex justify-between py-1.5 text-sm">
                <span>{item.accountNameAr}</span>
                <span className="font-mono">{formatCurrency(item.balance, currency)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 text-sm font-bold border-t border-border mt-2">
              <span>{t("totalRevenue")}</span>
              <span className="font-mono text-success">{formatCurrency(data.totalRevenue, currency)}</span>
            </div>
          </div>

          {/* Expenses */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-muted-foreground mb-3">المصروفات</h3>
            {data.expenses.map((item) => (
              <div key={item.accountId} className="flex justify-between py-1.5 text-sm">
                <span>{item.accountNameAr}</span>
                <span className="font-mono">{formatCurrency(item.balance, currency)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 text-sm font-bold border-t border-border mt-2">
              <span>{t("totalExpenses")}</span>
              <span className="font-mono text-destructive">{formatCurrency(data.totalExpenses, currency)}</span>
            </div>
          </div>

          {/* Net Income */}
          <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-primary">
            <span>{t("netIncome")}</span>
            <span className={`font-mono ${data.netIncome >= 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(data.netIncome, currency)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
