"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function PaymentsPage() {
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

  const [typeFilter, setTypeFilter] = useState<"RECEIVED" | "MADE">("RECEIVED");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, refetch } = trpc.payments.list.useQuery({
    type: typeFilter,
  });

  const methodLabelsAr: Record<string, string> = {
    CASH: "نقدي",
    BANK_TRANSFER: "تحويل بنكي",
    CHECK: "شيك",
    CREDIT_CARD: "بطاقة ائتمان",
    OTHER: "أخرى",
  };

  const methodLabelsEn: Record<string, string> = {
    CASH: "Cash",
    BANK_TRANSFER: "Bank Transfer",
    CHECK: "Check",
    CREDIT_CARD: "Credit Card",
    OTHER: "Other",
  };

  const methodLabels = isAr ? methodLabelsAr : methodLabelsEn;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">{isAr ? "المدفوعات والمقبوضات" : "Payments & Receipts"}</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {isAr ? "+ إضافة عملية دفع" : "+ Add Payment"}
        </button>
      </div>

      {/* Type Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTypeFilter("RECEIVED")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            typeFilter === "RECEIVED"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {isAr ? "المقبوضات" : "Receipts"}
        </button>
        <button
          onClick={() => setTypeFilter("MADE")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            typeFilter === "MADE"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {isAr ? "المدفوعات" : "Payments"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "رقم العملية" : "Txn No."}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "التاريخ" : "Date"}</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "المبلغ" : "Amount"}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "طريقة الدفع" : "Method"}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "المرجع" : "Reference"}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">
                {typeFilter === "RECEIVED" ? (isAr ? "الفاتورة" : "Invoice") : (isAr ? "فاتورة المورد" : "Vendor Bill")}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">{tc("loading")}</td>
              </tr>
            ) : data?.payments && data.payments.length > 0 ? (
              data.payments.map((payment: any) => (
                <tr key={payment.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-sm font-mono">{payment.paymentNumber}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(payment.date)}</td>
                  <td className="px-4 py-3 text-sm text-end font-mono font-medium">{formatCurrency(Number(payment.amount), currency)}</td>
                  <td className="px-4 py-3 text-sm">{methodLabels[payment.method] ?? payment.method}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{payment.reference || "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{payment.invoice?.invoiceNumber || payment.bill?.billNumber || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">{tc("noData")}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Payment Modal */}
      {showCreateModal && (
        <CreatePaymentModal
          currency={currency}
          isAr={isAr}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function CreatePaymentModal({
  currency,
  isAr,
  onClose,
  onSuccess,
}: {
  currency: string;
  isAr: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { data: invoices } = trpc.invoices.list.useQuery();
  const { data: bills } = trpc.bills.list.useQuery();
  const { data: bankAccounts } = trpc.bank.listAccounts.useQuery();

  const [formData, setFormData] = useState({
    type: "RECEIVED" as "RECEIVED" | "MADE",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    method: "BANK_TRANSFER",
    reference: "",
    invoiceId: "",
    billId: "",
    bankAccountId: "",
  });

  const createPayment = trpc.payments.create.useMutation({
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPayment.mutate({
      type: formData.type as "RECEIVED" | "MADE",
      date: new Date(formData.date),
      amount: parseFloat(formData.amount),
      method: formData.method as "CASH" | "BANK_TRANSFER" | "CHECK" | "CREDIT_CARD" | "OTHER",
      reference: formData.reference || undefined,
      invoiceId: formData.invoiceId || undefined,
      billId: formData.billId || undefined,
      bankAccountId: formData.bankAccountId || undefined,
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "إضافة عملية دفع" : "Add Payment"}</h2>

        {createPayment.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{createPayment.error.message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{isAr ? "النوع" : "Type"}</label>
            <select value={formData.type} onChange={(e) => updateField("type", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring">
              <option value="RECEIVED">{isAr ? "مقبوضات" : "Received"}</option>
              <option value="MADE">{isAr ? "مدفوعات" : "Made"}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "التاريخ" : "Date"}</label>
              <input type="date" value={formData.date} onChange={(e) => updateField("date", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "المبلغ" : "Amount"}</label>
              <input type="number" value={formData.amount} onChange={(e) => updateField("amount", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" min="0" step="0.01" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "طريقة الدفع" : "Payment Method"}</label>
              <select value={formData.method} onChange={(e) => updateField("method", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring">
                <option value="CASH">{isAr ? "نقدي" : "Cash"}</option>
                <option value="BANK_TRANSFER">{isAr ? "تحويل بنكي" : "Bank Transfer"}</option>
                <option value="CHECK">{isAr ? "شيك" : "Check"}</option>
                <option value="CREDIT_CARD">{isAr ? "بطاقة ائتمان" : "Credit Card"}</option>
                <option value="OTHER">{isAr ? "أخرى" : "Other"}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "المرجع" : "Reference"}</label>
              <input type="text" value={formData.reference} onChange={(e) => updateField("reference", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          {formData.type === "RECEIVED" ? (
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "الفاتورة" : "Invoice"}</label>
              <select value={formData.invoiceId} onChange={(e) => updateField("invoiceId", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring">
                <option value="">{isAr ? "اختر الفاتورة (اختياري)..." : "Select invoice (optional)..."}</option>
                {invoices?.invoices?.map((inv: any) => (
                  <option key={inv.id} value={inv.id}>{inv.invoiceNumber} — {formatCurrency(Number(inv.grandTotal), currency)}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "فاتورة المورد" : "Vendor Bill"}</label>
              <select value={formData.billId} onChange={(e) => updateField("billId", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring">
                <option value="">{isAr ? "اختر الفاتورة (اختياري)..." : "Select bill (optional)..."}</option>
                {bills?.bills?.map((bill: any) => (
                  <option key={bill.id} value={bill.id}>{bill.billNumber} — {formatCurrency(Number(bill.total), currency)}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">{isAr ? "الحساب البنكي" : "Bank Account"}</label>
            <select value={formData.bankAccountId} onChange={(e) => updateField("bankAccountId", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring">
              <option value="">{isAr ? "اختر الحساب (اختياري)..." : "Select account (optional)..."}</option>
              {bankAccounts?.map((acc: any) => (
                <option key={acc.id} value={acc.id}>{acc.name} — {acc.bankName}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" disabled={createPayment.isPending} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {createPayment.isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ" : "Save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
