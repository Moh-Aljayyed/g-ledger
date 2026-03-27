"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";

export default function TrialBalancePage() {
  const t = useTranslations("reports");
  const ta = useTranslations("accounts");
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";

  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);

  const { data, isLoading } = trpc.reports.trialBalance.useQuery({
    asOfDate: new Date(asOfDate),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("trialBalance")}</h1>

      {/* Date Selector */}
      <div className="flex items-center gap-4 mb-6 bg-card rounded-xl border border-border p-4">
        <div>
          <label className="block text-sm font-medium mb-1">حتى تاريخ</label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
            dir="ltr"
          />
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{ta("code")}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{ta("name")}</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground" colSpan={2}>المجاميع</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground" colSpan={2}>الأرصدة</th>
            </tr>
            <tr className="border-b border-border bg-muted/20">
              <th colSpan={2}></th>
              <th className="text-end px-4 py-2 text-xs font-medium text-muted-foreground">مدين</th>
              <th className="text-end px-4 py-2 text-xs font-medium text-muted-foreground">دائن</th>
              <th className="text-end px-4 py-2 text-xs font-medium text-muted-foreground">مدين</th>
              <th className="text-end px-4 py-2 text-xs font-medium text-muted-foreground">دائن</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">{tc("loading")}</td>
              </tr>
            ) : data?.rows && data.rows.length > 0 ? (
              data.rows.map((row) => (
                <tr key={row.accountId} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-2.5 text-sm font-mono">{row.accountCode}</td>
                  <td className="px-4 py-2.5 text-sm">{row.accountNameAr}</td>
                  <td className="px-4 py-2.5 text-sm text-end font-mono">
                    {row.totalDebit > 0 ? formatCurrency(row.totalDebit, currency) : ""}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-end font-mono">
                    {row.totalCredit > 0 ? formatCurrency(row.totalCredit, currency) : ""}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-end font-mono">
                    {row.balanceDebit > 0 ? formatCurrency(row.balanceDebit, currency) : ""}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-end font-mono">
                    {row.balanceCredit > 0 ? formatCurrency(row.balanceCredit, currency) : ""}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">{tc("noData")}</td>
              </tr>
            )}
          </tbody>
          {data?.totals && (
            <tfoot>
              <tr className="bg-primary/5 font-bold border-t-2 border-primary">
                <td colSpan={2} className="px-4 py-3 text-sm">{tc("total")}</td>
                <td className="px-4 py-3 text-sm text-end font-mono">
                  {formatCurrency(data.totals.totalDebit, currency)}
                </td>
                <td className="px-4 py-3 text-sm text-end font-mono">
                  {formatCurrency(data.totals.totalCredit, currency)}
                </td>
                <td className="px-4 py-3 text-sm text-end font-mono">
                  {formatCurrency(data.totals.balanceDebit, currency)}
                </td>
                <td className="px-4 py-3 text-sm text-end font-mono">
                  {formatCurrency(data.totals.balanceCredit, currency)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
