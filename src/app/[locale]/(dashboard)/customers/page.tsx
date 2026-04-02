"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function CustomersPage() {
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading, refetch } = trpc.customers.list.useQuery({
    search: searchTerm || undefined,
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">{isAr ? "العملاء" : "Customers"}</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {isAr ? "+ إضافة عميل" : "+ Add Customer"}
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={isAr ? "بحث بالاسم أو الرمز..." : "Search by name or code..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring outline-none w-72"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الرمز" : "Code"}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الاسم" : "Name"}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الرقم الضريبي" : "Tax ID"}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الهاتف" : "Phone"}</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الحد الائتماني" : "Credit Limit"}</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الرصيد" : "Balance"}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  {tc("loading")}
                </td>
              </tr>
            ) : data?.customers && data.customers.length > 0 ? (
              data.customers.map((customer: any) => (
                <tr key={customer.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-sm font-mono">{customer.code}</td>
                  <td className="px-4 py-3 text-sm font-medium">{customer.nameAr || customer.nameEn}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{customer.taxId || "—"}</td>
                  <td className="px-4 py-3 text-sm" dir="ltr">{customer.phone || "—"}</td>
                  <td className="px-4 py-3 text-sm text-end font-mono">
                    {customer.creditLimit ? formatCurrency(Number(customer.creditLimit), currency) : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-end font-mono font-medium">
                    {formatCurrency(Number(customer.balance ?? 0), currency)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  {tc("noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerModal
          isAr={isAr}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function AddCustomerModal({
  isAr,
  onClose,
  onSuccess,
}: {
  isAr: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    taxId: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    creditLimit: "",
    paymentTerms: 30,
  });

  const createCustomer = trpc.customers.create.useMutation({
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer.mutate({
      ...formData,
      creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
      taxId: formData.taxId || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "إضافة عميل جديد" : "Add New Customer"}</h2>

        {createCustomer.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {createCustomer.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "الرمز" : "Code"}</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => updateField("code", e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "الرقم الضريبي" : "Tax ID"}</label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => updateField("taxId", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{isAr ? "الاسم بالعربية" : "Name (Arabic)"}</label>
            <input
              type="text"
              value={formData.nameAr}
              onChange={(e) => updateField("nameAr", e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{isAr ? "الاسم بالإنجليزية" : "Name (English)"}</label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => updateField("nameEn", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "البريد الإلكتروني" : "Email"}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "الهاتف" : "Phone"}</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{isAr ? "العنوان" : "Address"}</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "المدينة" : "City"}</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "الحد الائتماني" : "Credit Limit"}</label>
              <input
                type="number"
                value={formData.creditLimit}
                onChange={(e) => updateField("creditLimit", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{isAr ? "شروط الدفع (أيام)" : "Payment Terms (days)"}</label>
            <input
              type="number"
              value={formData.paymentTerms}
              onChange={(e) => updateField("paymentTerms", parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
              min="0"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={createCustomer.isPending}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createCustomer.isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ" : "Save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
