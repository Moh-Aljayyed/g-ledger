"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface JournalLine {
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

export default function JournalEntriesPage() {
  const t = useTranslations("journal");
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, refetch } = trpc.journalEntries.list.useQuery(
    statusFilter ? { status: statusFilter as any } : undefined
  );

  const postEntry = trpc.journalEntries.post.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + {t("newEntry")}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {["", "DRAFT", "POSTED", "REVERSED"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {status === "" ? "الكل" : status === "DRAFT" ? t("draft") : status === "POSTED" ? t("posted") : t("reversed")}
          </button>
        ))}
      </div>

      {/* Entries Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("entryNumber")}</th>
              <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{tc("date")}</th>
              <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{tc("description")}</th>
              <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("reference")}</th>
              <th className="text-end px-4 py-3 text-sm font-medium text-muted-foreground">{t("totalDebit")}</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">{tc("status")}</th>
              <th className="text-end px-4 py-3 text-sm font-medium text-muted-foreground">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  {tc("loading")}
                </td>
              </tr>
            ) : data?.entries && data.entries.length > 0 ? (
              data.entries.map((entry) => {
                const totalDebit = entry.lines.reduce((sum, l) => sum + Number(l.debit), 0);
                return (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3 text-sm font-mono">{entry.entryNumber}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(entry.date)}</td>
                    <td className="px-4 py-3 text-sm">{entry.description}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{entry.reference || "—"}</td>
                    <td className="px-4 py-3 text-sm text-end font-mono">
                      {formatCurrency(totalDebit, currency)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="px-4 py-3 text-end">
                      {entry.status === "DRAFT" && (
                        <button
                          onClick={() => postEntry.mutate({ id: entry.id })}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          {t("post")}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  {tc("noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
            <span>
              عرض {data.entries.length} من {data.total} قيد
            </span>
          </div>
        )}
      </div>

      {/* Create Journal Entry Modal */}
      {showCreateForm && (
        <CreateJournalEntryModal
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            refetch();
          }}
          currency={currency}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    DRAFT: "bg-muted text-muted-foreground",
    POSTED: "bg-green-50 text-green-700",
    REVERSED: "bg-red-50 text-red-700",
  };
  const labels = { DRAFT: "مسودة", POSTED: "مرحّل", REVERSED: "معكوس" };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
}

function CreateJournalEntryModal({
  onClose,
  onSuccess,
  currency,
}: {
  onClose: () => void;
  onSuccess: () => void;
  currency: string;
}) {
  const t = useTranslations("journal");
  const { data: accounts } = trpc.accounts.getLeafAccounts.useQuery();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<JournalLine[]>([
    { accountId: "", debit: 0, credit: 0, description: "" },
    { accountId: "", debit: 0, credit: 0, description: "" },
  ]);

  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const createEntry = trpc.journalEntries.create.useMutation({
    onSuccess: () => onSuccess(),
  });

  const updateLine = (index: number, field: keyof JournalLine, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    // Auto-clear opposite field
    if (field === "debit" && value > 0) updated[index].credit = 0;
    if (field === "credit" && value > 0) updated[index].debit = 0;
    setLines(updated);
  };

  const addLine = () => {
    setLines([...lines, { accountId: "", debit: 0, credit: 0, description: "" }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEntry.mutate({
      date: new Date(date),
      description,
      reference: reference || undefined,
      lines: lines.filter((l) => l.accountId && (l.debit > 0 || l.credit > 0)),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-6">{t("newEntry")}</h2>

        {createEntry.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {createEntry.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Header Fields */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">{t("entryDate")}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الوصف</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("reference")}</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
              />
            </div>
          </div>

          {/* Lines Table */}
          <div className="border border-border rounded-lg overflow-hidden mb-4">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-start px-3 py-2 text-xs font-medium text-muted-foreground">{t("selectAccount")}</th>
                  <th className="text-start px-3 py-2 text-xs font-medium text-muted-foreground w-24">البيان</th>
                  <th className="text-end px-3 py-2 text-xs font-medium text-muted-foreground w-36">{t("debit")}</th>
                  <th className="text-end px-3 py-2 text-xs font-medium text-muted-foreground w-36">{t("credit")}</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="px-3 py-2">
                      <select
                        value={line.accountId}
                        onChange={(e) => updateLine(index, "accountId", e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm outline-none"
                      >
                        <option value="">{t("selectAccount")}...</option>
                        {accounts?.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.code} - {acc.nameAr}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => updateLine(index, "description", e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={line.debit || ""}
                        onChange={(e) => updateLine(index, "debit", parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm outline-none text-end"
                        dir="ltr"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={line.credit || ""}
                        onChange={(e) => updateLine(index, "credit", parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm outline-none text-end"
                        dir="ltr"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-1">
                      {lines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="text-destructive hover:bg-destructive/10 rounded p-1 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/20">
                  <td colSpan={2} className="px-3 py-2">
                    <button
                      type="button"
                      onClick={addLine}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      + {t("addLine")}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-end font-mono text-sm font-bold">
                    {formatCurrency(totalDebit, currency)}
                  </td>
                  <td className="px-3 py-2 text-end font-mono text-sm font-bold">
                    {formatCurrency(totalCredit, currency)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Balance Status */}
          <div className={`text-sm font-medium mb-6 ${isBalanced ? "text-success" : "text-destructive"}`}>
            {isBalanced ? t("balanced") : `${t("unbalanced")} — ${t("difference")}: ${formatCurrency(Math.abs(totalDebit - totalCredit), currency)}`}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!isBalanced || createEntry.isPending}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createEntry.isPending ? "جاري الحفظ..." : "حفظ كمسودة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
