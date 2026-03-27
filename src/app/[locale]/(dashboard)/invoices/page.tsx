"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function InvoicesPage() {
  const t = useTranslations("invoices");
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "EGP";

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const { data, isLoading, refetch } = trpc.invoices.list.useQuery(
    {
      ...(statusFilter ? { status: statusFilter as any } : {}),
      ...(typeFilter ? { type: typeFilter as any } : {}),
    }
  );

  const submitInvoice = trpc.invoices.submit.useMutation({
    onSuccess: () => refetch(),
  });

  const statusColors: Record<string, string> = {
    DRAFT: "bg-muted text-muted-foreground",
    READY: "bg-blue-50 text-blue-700",
    SUBMITTED: "bg-yellow-50 text-yellow-700",
    ACCEPTED: "bg-green-50 text-green-700",
    REJECTED: "bg-red-50 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link
          href="/ar/invoices/create"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + {t("newInvoice")}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="flex gap-1">
          {["", "DRAFT", "SUBMITTED", "ACCEPTED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {status === "" ? "الكل" : t(`statuses.${status}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{t("invoiceNumber")}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">النوع</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{t("issueDate")}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{t("buyerName")}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{t("buyerTaxId")}</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{t("grandTotal")}</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">{tc("status")}</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">{tc("loading")}</td>
              </tr>
            ) : data?.invoices && data.invoices.length > 0 ? (
              data.invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-sm font-mono">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-sm">{t(`types.${inv.type}`)}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(inv.issueDate)}</td>
                  <td className="px-4 py-3 text-sm">{inv.buyerName}</td>
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{inv.buyerTaxId || "—"}</td>
                  <td className="px-4 py-3 text-sm text-end font-mono font-medium">
                    {formatCurrency(Number(inv.grandTotal), currency)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[inv.status]}`}>
                      {t(`statuses.${inv.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end space-x-2 rtl:space-x-reverse">
                    {(inv.status === "DRAFT" || inv.status === "REJECTED") && (
                      <button
                        onClick={() => submitInvoice.mutate({ id: inv.id })}
                        disabled={submitInvoice.isPending}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        {t("submitToAuthority")}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">{tc("noData")}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Submit result notification */}
      {submitInvoice.data && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          submitInvoice.data.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {submitInvoice.data.success ? t("submitSuccess") : `${t("submitFailed")}: ${submitInvoice.data.error}`}
        </div>
      )}
    </div>
  );
}
