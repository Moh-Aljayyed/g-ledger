"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function LedgerPage() {
  const t = useTranslations("nav");
  const tj = useTranslations("journal");
  const tr = useTranslations("reports");
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";

  const [accountId, setAccountId] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: accounts } = trpc.accounts.getLeafAccounts.useQuery();
  const { data: ledger, isLoading } = trpc.reports.ledger.useQuery(
    { accountId, fromDate: new Date(fromDate), toDate: new Date(toDate) },
    { enabled: !!accountId }
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("ledger")}</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-card rounded-xl border border-border p-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">الحساب</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
          >
            <option value="">اختر حساب...</option>
            {accounts?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.code} - {acc.nameAr}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{tr("fromDate")}</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{tr("toDate")}</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
            dir="ltr"
          />
        </div>
      </div>

      {/* Ledger Table */}
      {accountId && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {ledger?.account && (
            <div className="px-4 py-3 bg-muted/30 border-b border-border">
              <span className="font-medium">{ledger.account.code}</span>
              <span className="mx-2">—</span>
              <span>{ledger.account.nameAr}</span>
              <span className="text-muted-foreground text-sm mr-2">({ledger.account.nameEn})</span>
            </div>
          )}

          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{tc("date")}</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">رقم القيد</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{tc("description")}</th>
                <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{tj("debit")}</th>
                <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{tj("credit")}</th>
                <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">{tc("loading")}</td>
                </tr>
              ) : ledger?.lines && ledger.lines.length > 0 ? (
                ledger.lines.map((line, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-2.5 text-sm">{formatDate(line.journalEntry.date)}</td>
                    <td className="px-4 py-2.5 text-sm font-mono">{line.journalEntry.entryNumber}</td>
                    <td className="px-4 py-2.5 text-sm">{line.journalEntry.description}</td>
                    <td className="px-4 py-2.5 text-sm text-end font-mono">
                      {line.debit > 0 ? formatCurrency(line.debit, currency) : ""}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-end font-mono">
                      {line.credit > 0 ? formatCurrency(line.credit, currency) : ""}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-end font-mono font-medium">
                      {formatCurrency(line.runningBalance, currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">{tc("noData")}</td>
                </tr>
              )}
            </tbody>
            {ledger && ledger.lines.length > 0 && (
              <tfoot>
                <tr className="bg-muted/30 font-bold">
                  <td colSpan={3} className="px-4 py-3 text-sm">{tc("total")}</td>
                  <td className="px-4 py-3 text-sm text-end font-mono">
                    {formatCurrency(ledger.totalDebit, currency)}
                  </td>
                  <td className="px-4 py-3 text-sm text-end font-mono">
                    {formatCurrency(ledger.totalCredit, currency)}
                  </td>
                  <td className="px-4 py-3 text-sm text-end font-mono">
                    {formatCurrency(ledger.closingBalance, currency)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
