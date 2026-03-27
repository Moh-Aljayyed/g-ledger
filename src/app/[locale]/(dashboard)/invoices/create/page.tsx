"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";

interface InvoiceItem {
  description: string;
  itemCode: string;
  unitType: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatRate: number;
  vatCategory: string;
  withholdingRate: number;
  tableTaxRate: number;
}

const emptyItem: InvoiceItem = {
  description: "",
  itemCode: "",
  unitType: "EA",
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  vatRate: 14,
  vatCategory: "S",
  withholdingRate: 0,
  tableTaxRate: 0,
};

export default function CreateInvoicePage() {
  const t = useTranslations("invoices");
  const tc = useTranslations("common");
  const router = useRouter();
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "EGP";

  const { data: taxConfig } = trpc.invoices.getTaxConfig.useQuery();

  const [formData, setFormData] = useState({
    type: "SALES" as string,
    issueDate: new Date().toISOString().split("T")[0],
    buyerName: "",
    buyerTaxId: "",
    buyerAddress: "",
    buyerCity: "",
    buyerCountry: taxConfig?.country === "SA" ? "SA" : "EG",
    buyerType: "B",
    currency: taxConfig?.country === "SA" ? "SAR" : "EGP",
    notes: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { ...emptyItem, vatRate: taxConfig?.country === "SA" ? 15 : 14 },
  ]);

  const createInvoice = trpc.invoices.create.useMutation({
    onSuccess: () => router.push("/ar/invoices"),
  });

  // Calculate totals
  const itemTotals = items.map((item) => {
    const net = item.quantity * item.unitPrice - item.discount;
    const vat = net * (item.vatRate / 100);
    const wht = net * (item.withholdingRate / 100);
    const table = net * (item.tableTaxRate / 100);
    const total = net + vat + table;
    return { net, vat, wht, table, total };
  });

  const subtotal = itemTotals.reduce((s, i) => s + i.net, 0);
  const totalVat = itemTotals.reduce((s, i) => s + i.vat, 0);
  const totalWht = itemTotals.reduce((s, i) => s + i.wht, 0);
  const totalTable = itemTotals.reduce((s, i) => s + i.table, 0);
  const totalDiscount = items.reduce((s, i) => s + i.discount, 0);
  const grandTotal = subtotal + totalVat + totalTable;

  const updateItem = (idx: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { ...emptyItem, vatRate: taxConfig?.country === "SA" ? 15 : 14 }]);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoice.mutate({
      type: formData.type as any,
      issueDate: new Date(formData.issueDate),
      buyerName: formData.buyerName,
      buyerTaxId: formData.buyerTaxId || undefined,
      buyerAddress: formData.buyerAddress || undefined,
      buyerCity: formData.buyerCity || undefined,
      buyerCountry: formData.buyerCountry || undefined,
      buyerType: formData.buyerType || undefined,
      currency: formData.currency,
      notes: formData.notes || undefined,
      items: items.map((item) => ({
        ...item,
        discountRate: item.unitPrice > 0 ? (item.discount / (item.quantity * item.unitPrice)) * 100 : 0,
      })),
    });
  };

  const isEgypt = taxConfig?.country === "EG";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("newInvoice")}</h1>

      {createInvoice.error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {createInvoice.error.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Invoice Header */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-sm font-bold text-muted-foreground mb-4">بيانات الفاتورة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">النوع</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
              >
                <option value="SALES">{t("types.SALES")}</option>
                <option value="SALES_RETURN">{t("types.SALES_RETURN")}</option>
                <option value="CREDIT_NOTE">{t("types.CREDIT_NOTE")}</option>
                <option value="DEBIT_NOTE">{t("types.DEBIT_NOTE")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("issueDate")}</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">العملة</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
              >
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="USD">دولار أمريكي (USD)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">نوع المشتري</label>
              <select
                value={formData.buyerType}
                onChange={(e) => setFormData({ ...formData, buyerType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
              >
                <option value="B">شركة (B2B)</option>
                <option value="P">فرد (B2C)</option>
                <option value="F">أجنبي (Export)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-sm font-bold text-muted-foreground mb-4">بيانات المشتري</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("buyerName")} *</label>
              <input
                type="text"
                value={formData.buyerName}
                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("buyerTaxId")}</label>
              <input
                type="text"
                value={formData.buyerTaxId}
                onChange={(e) => setFormData({ ...formData, buyerTaxId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المدينة</label>
              <input
                type="text"
                value={formData.buyerCity}
                onChange={(e) => setFormData({ ...formData, buyerCity: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-card rounded-xl border border-border mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-sm font-bold text-muted-foreground">أصناف الفاتورة</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-start px-3 py-2 text-xs font-medium text-muted-foreground">{t("itemDescription")}</th>
                  <th className="text-start px-3 py-2 text-xs font-medium text-muted-foreground w-24">{t("itemCode")}</th>
                  <th className="text-end px-3 py-2 text-xs font-medium text-muted-foreground w-20">{t("quantity")}</th>
                  <th className="text-end px-3 py-2 text-xs font-medium text-muted-foreground w-28">{t("unitPrice")}</th>
                  <th className="text-end px-3 py-2 text-xs font-medium text-muted-foreground w-24">{t("discount")}</th>
                  <th className="text-end px-3 py-2 text-xs font-medium text-muted-foreground w-20">{t("vatRate")}</th>
                  {isEgypt && (
                    <>
                      <th className="text-end px-3 py-2 text-xs font-medium text-muted-foreground w-20">خصم منبع</th>
                      <th className="text-end px-3 py-2 text-xs font-medium text-muted-foreground w-20">جدول</th>
                    </>
                  )}
                  <th className="text-end px-3 py-2 text-xs font-medium text-muted-foreground w-28">{t("lineTotal")}</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                        required
                        className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm outline-none"
                        placeholder="وصف الصنف..."
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.itemCode}
                        onChange={(e) => updateItem(idx, "itemCode", e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm outline-none"
                        dir="ltr"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm outline-none text-end"
                        dir="ltr" min="0.01" step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm outline-none text-end"
                        dir="ltr" min="0" step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) => updateItem(idx, "discount", parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm outline-none text-end"
                        dir="ltr" min="0" step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.vatRate}
                        onChange={(e) => updateItem(idx, "vatRate", parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm outline-none"
                      >
                        {isEgypt ? (
                          <>
                            <option value="14">14%</option>
                            <option value="5">5%</option>
                            <option value="0">0%</option>
                          </>
                        ) : (
                          <>
                            <option value="15">15%</option>
                            <option value="0">0%</option>
                          </>
                        )}
                      </select>
                    </td>
                    {isEgypt && (
                      <>
                        <td className="px-3 py-2">
                          <select
                            value={item.withholdingRate}
                            onChange={(e) => updateItem(idx, "withholdingRate", parseFloat(e.target.value))}
                            className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm outline-none"
                          >
                            <option value="0">—</option>
                            <option value="1">1%</option>
                            <option value="3">3%</option>
                            <option value="5">5%</option>
                            <option value="10">10%</option>
                            <option value="20">20%</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.tableTaxRate}
                            onChange={(e) => updateItem(idx, "tableTaxRate", parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm outline-none text-end"
                            dir="ltr" min="0" step="0.01"
                          />
                        </td>
                      </>
                    )}
                    <td className="px-3 py-2 text-end font-mono text-sm font-medium">
                      {formatCurrency(itemTotals[idx]?.total ?? 0, formData.currency)}
                    </td>
                    <td className="px-1">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} className="text-destructive text-xs p-1">
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-border">
            <button type="button" onClick={addItem} className="text-xs text-primary hover:underline font-medium">
              + {t("addItem")}
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6 max-w-sm ms-auto">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="font-mono">{formatCurrency(subtotal, formData.currency)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("discount")}</span>
                <span className="font-mono text-destructive">-{formatCurrency(totalDiscount, formData.currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("totalVat")}</span>
              <span className="font-mono">{formatCurrency(totalVat, formData.currency)}</span>
            </div>
            {isEgypt && totalWht > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("withholdingTax")}</span>
                <span className="font-mono">{formatCurrency(totalWht, formData.currency)}</span>
              </div>
            )}
            {isEgypt && totalTable > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("tableTax")}</span>
                <span className="font-mono">{formatCurrency(totalTable, formData.currency)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border font-bold text-base">
              <span>{t("grandTotal")}</span>
              <span className="font-mono">{formatCurrency(grandTotal, formData.currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <label className="block text-sm font-medium mb-1">ملاحظات</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none resize-none"
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            {tc("cancel")}
          </button>
          <button
            type="submit"
            disabled={createInvoice.isPending || items.every(i => !i.description)}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {createInvoice.isPending ? "جاري الحفظ..." : "حفظ الفاتورة"}
          </button>
        </div>
      </form>
    </div>
  );
}
