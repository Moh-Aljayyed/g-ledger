"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function BillsPage() {
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, refetch } = trpc.bills.list.useQuery(
    statusFilter ? { status: statusFilter as any } : undefined
  );

  const approveBill = trpc.bills.approve.useMutation({
    onSuccess: () => refetch(),
  });

  const statusColors: Record<string, string> = {
    DRAFT: "bg-muted text-muted-foreground",
    APPROVED: "bg-blue-50 text-blue-700",
    PARTIALLY_PAID: "bg-yellow-50 text-yellow-700",
    PAID: "bg-green-50 text-green-700",
    CANCELLED: "bg-red-50 text-red-700",
  };

  const statusLabels: Record<string, string> = {
    DRAFT: "مسودة",
    APPROVED: "معتمد",
    PARTIALLY_PAID: "مدفوع جزئياً",
    PAID: "مدفوع",
    CANCELLED: "ملغي",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">الفواتير الواردة</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + إنشاء فاتورة
        </button>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-4">
        {["", "DRAFT", "APPROVED", "PARTIALLY_PAID", "PAID"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {status === "" ? "الكل" : statusLabels[status]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">رقم الفاتورة</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">المورد</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">التاريخ</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">تاريخ الاستحقاق</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">الإجمالي</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">المدفوع</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">الحالة</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  {tc("loading")}
                </td>
              </tr>
            ) : data?.bills && data.bills.length > 0 ? (
              data.bills.map((bill: any) => (
                <tr key={bill.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-sm font-mono">{bill.billNumber}</td>
                  <td className="px-4 py-3 text-sm">{bill.vendor?.nameAr || bill.vendor?.nameEn || "—"}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(bill.date)}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(bill.dueDate)}</td>
                  <td className="px-4 py-3 text-sm text-end font-mono font-medium">
                    {formatCurrency(Number(bill.total), currency)}
                  </td>
                  <td className="px-4 py-3 text-sm text-end font-mono">
                    {formatCurrency(Number(bill.amountPaid ?? 0), currency)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        statusColors[bill.status] ?? ""
                      }`}
                    >
                      {statusLabels[bill.status] ?? bill.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    {bill.status === "DRAFT" && (
                      <button
                        onClick={() => approveBill.mutate({ id: bill.id })}
                        disabled={approveBill.isPending}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        اعتماد
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  {tc("noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Bill Modal */}
      {showCreateModal && (
        <CreateBillModal
          currency={currency}
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

function CreateBillModal({
  currency,
  onClose,
  onSuccess,
}: {
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { data: vendors } = trpc.vendors.list.useQuery();

  const [formData, setFormData] = useState({
    vendorId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    description: "",
    amount: "",
    notes: "",
  });

  const createBill = trpc.bills.create.useMutation({
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBill.mutate({
      vendorId: formData.vendorId,
      issueDate: new Date(formData.date),
      dueDate: new Date(formData.dueDate),
      notes: formData.notes || undefined,
      items: [
        {
          description: formData.description || "فاتورة وارد",
          quantity: 1,
          unitPrice: parseFloat(formData.amount) || 0,
        },
      ],
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold text-[#021544] mb-4">إنشاء فاتورة واردة</h2>

        {createBill.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {createBill.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">المورد</label>
            <select
              value={formData.vendorId}
              onChange={(e) => updateField("vendorId", e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">اختر المورد...</option>
              {vendors?.vendors?.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.nameAr || v.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">التاريخ</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => updateField("date", e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تاريخ الاستحقاق</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => updateField("dueDate", e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الإجمالي</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => updateField("amount", e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createBill.isPending}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createBill.isPending ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
