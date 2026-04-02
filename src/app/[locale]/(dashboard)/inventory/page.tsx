"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tab = "products" | "movements";

export default function InventoryPage() {
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddMovementModal, setShowAddMovementModal] = useState(false);

  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = trpc.inventory.listProducts.useQuery();
  const { data: movements, isLoading: movementsLoading, refetch: refetchMovements } = trpc.inventory.listMovements.useQuery();
  const { data: valuation } = trpc.inventory.getStockValuation.useQuery();
  const { data: lowStockAlerts } = trpc.inventory.getLowStockAlerts.useQuery();

  const productsList = (products as any)?.products ?? products ?? [];
  const filteredProducts = productsList.filter((p: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.code?.toLowerCase().includes(q) || p.nameAr?.toLowerCase().includes(q) || p.nameEn?.toLowerCase().includes(q);
  });

  const totalProducts = (products as any)?.total ?? productsList?.length ?? 0;
  const stockValuation = (valuation as any)?.totalValue ?? 0;
  const lowStockCount = (lowStockAlerts as any)?.length ?? (lowStockAlerts as any)?.total ?? 0;
  const expiringCount = (valuation as any)?.expiringCount ?? 0;

  const getStockStatusColor = (product: any) => {
    if (product.currentStock === 0) return "bg-red-100 text-red-700";
    if (product.currentStock <= product.reorderLevel) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const getStockStatusLabel = (product: any) => {
    if (product.currentStock === 0) return isAr ? "نفذ" : "Out";
    if (product.currentStock <= product.reorderLevel) return isAr ? "منخفض" : "Low";
    return isAr ? "متوفر" : "In Stock";
  };

  const movementTypeStyles: Record<string, string> = { IN: "bg-green-50 text-green-700", OUT: "bg-red-50 text-red-700", ADJUSTMENT: "bg-blue-50 text-blue-700", RETURN_IN: "bg-cyan-50 text-cyan-700", RETURN_OUT: "bg-orange-50 text-orange-700" };
  const movementTypeLabels: Record<string, string> = { IN: isAr ? "وارد" : "In", OUT: isAr ? "صادر" : "Out", ADJUSTMENT: isAr ? "تسوية" : "Adjustment", RETURN_IN: isAr ? "مرتجع وارد" : "Return In", RETURN_OUT: isAr ? "مرتجع صادر" : "Return Out" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">{isAr ? "المخزون" : "Inventory"}</h1>
        <div className="flex gap-2">
          {activeTab === "products" && <button onClick={() => setShowAddProductModal(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">{isAr ? "+ اضافة منتج" : "+ Add Product"}</button>}
          {activeTab === "movements" && <button onClick={() => setShowAddMovementModal(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">{isAr ? "+ اضافة حركة" : "+ Add Movement"}</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-blue-500"><p className="text-sm text-muted-foreground mb-1">{isAr ? "اجمالي المنتجات" : "Total Products"}</p><p className="text-2xl font-bold text-[#021544]">{totalProducts}</p></div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-green-500"><p className="text-sm text-muted-foreground mb-1">{isAr ? "قيمة المخزون" : "Stock Value"}</p><p className="text-2xl font-bold text-green-700">{formatCurrency(stockValuation, currency)}</p></div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-yellow-500"><p className="text-sm text-muted-foreground mb-1">{isAr ? "تنبيهات نقص المخزون" : "Low Stock Alerts"}</p><p className="text-2xl font-bold text-yellow-700">{lowStockCount}</p></div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-red-500"><p className="text-sm text-muted-foreground mb-1">{isAr ? "اصناف منتهية الصلاحية" : "Expiring Items"}</p><p className="text-2xl font-bold text-red-700">{expiringCount}</p></div>
      </div>

      <div className="flex gap-1 mb-6 bg-muted/50 rounded-lg p-1 w-fit">
        <button onClick={() => setActiveTab("products")} className={cn("px-4 py-2 rounded-md text-sm font-medium transition-colors", activeTab === "products" ? "bg-card text-[#021544] shadow-sm" : "text-muted-foreground hover:text-foreground")}>{isAr ? "المنتجات" : "Products"}</button>
        <button onClick={() => setActiveTab("movements")} className={cn("px-4 py-2 rounded-md text-sm font-medium transition-colors", activeTab === "movements" ? "bg-card text-[#021544] shadow-sm" : "text-muted-foreground hover:text-foreground")}>{isAr ? "حركات المخزون" : "Stock Movements"}</button>
      </div>

      {activeTab === "products" && (
        <div>
          <div className="mb-4"><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={isAr ? "بحث بالاسم او الكود..." : "Search by name or code..."} className="w-full max-w-md px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الكود" : "Code"}</th>
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الاسم" : "Name"}</th>
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الفئة" : "Category"}</th>
                  <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الرصيد الحالي" : "Current Stock"}</th>
                  <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "سعر التكلفة" : "Cost Price"}</th>
                  <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "سعر البيع" : "Selling Price"}</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الحالة" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {productsLoading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">{tc("loading")}</td></tr>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product: any) => (
                    <tr key={product.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3 text-sm font-mono">{product.code}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#021544]">{product.nameAr}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                      <td className="px-4 py-3 text-sm text-end font-mono">{product.currentStock}</td>
                      <td className="px-4 py-3 text-sm text-end font-mono">{formatCurrency(Number(product.costPrice ?? 0), currency)}</td>
                      <td className="px-4 py-3 text-sm text-end font-mono">{formatCurrency(Number(product.sellingPrice ?? 0), currency)}</td>
                      <td className="px-4 py-3 text-center"><span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", getStockStatusColor(product))}>{getStockStatusLabel(product)}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">{isAr ? "لا توجد منتجات" : "No products"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "movements" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "رقم الحركة" : "Movement No."}</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "التاريخ" : "Date"}</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "النوع" : "Type"}</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "المنتج" : "Product"}</th>
                <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الكمية" : "Qty"}</th>
                <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "تكلفة الوحدة" : "Unit Cost"}</th>
                <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "التكلفة الاجمالية" : "Total Cost"}</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الدفعة" : "Batch"}</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "المرجع" : "Reference"}</th>
              </tr>
            </thead>
            <tbody>
              {movementsLoading ? (
                <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">{tc("loading")}</td></tr>
              ) : (movements as any)?.movements?.length > 0 || ((movements as any)?.length > 0) ? (
                ((movements as any)?.movements ?? movements ?? []).map((mov: any) => (
                  <tr key={mov.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3 text-sm font-mono">{mov.movementNumber}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(mov.date)}</td>
                    <td className="px-4 py-3"><span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", movementTypeStyles[mov.type] ?? "bg-gray-50 text-gray-700")}>{movementTypeLabels[mov.type] ?? mov.type}</span></td>
                    <td className="px-4 py-3 text-sm">{mov.product?.nameAr ?? mov.productName ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-end font-mono">{mov.quantity}</td>
                    <td className="px-4 py-3 text-sm text-end font-mono">{formatCurrency(Number(mov.unitCost ?? 0), currency)}</td>
                    <td className="px-4 py-3 text-sm text-end font-mono">{formatCurrency(Number(mov.unitCost ?? 0) * Number(mov.quantity ?? 0), currency)}</td>
                    <td className="px-4 py-3 text-sm">{mov.batchNumber || "—"}</td>
                    <td className="px-4 py-3 text-sm">{mov.reference || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">{isAr ? "لا توجد حركات مخزون" : "No stock movements"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddProductModal && <AddProductModal isAr={isAr} onClose={() => setShowAddProductModal(false)} onSuccess={() => { setShowAddProductModal(false); refetchProducts(); }} />}
      {showAddMovementModal && <AddMovementModal products={productsList ?? []} currency={currency} isAr={isAr} onClose={() => setShowAddMovementModal(false)} onSuccess={() => { setShowAddMovementModal(false); refetchMovements(); refetchProducts(); }} />}
    </div>
  );
}

function AddProductModal({ isAr, onClose, onSuccess }: { isAr: boolean; onClose: () => void; onSuccess: () => void; }) {
  const [formData, setFormData] = useState({ code: "", nameAr: "", nameEn: "", category: isAr ? "بضاعة تامة" : "Finished Goods", unitType: "", costPrice: "", sellingPrice: "", minimumStock: "", reorderLevel: "", vatRate: "", trackExpiry: false, trackBatch: false });
  const createProduct = trpc.inventory.createProduct.useMutation({ onSuccess: () => onSuccess() });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); createProduct.mutate({ code: formData.code, nameAr: formData.nameAr, nameEn: formData.nameEn || undefined, category: formData.category, unitType: formData.unitType || undefined, costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0, sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : 0, minimumStock: formData.minimumStock ? parseInt(formData.minimumStock) : 0, reorderLevel: formData.reorderLevel ? parseInt(formData.reorderLevel) : 0, vatRate: formData.vatRate ? parseFloat(formData.vatRate) : undefined, trackExpiry: formData.trackExpiry, trackBatch: formData.trackBatch }); };
  const updateField = (field: string, value: any) => { setFormData((prev) => ({ ...prev, [field]: value })); };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "اضافة منتج" : "Add Product"}</h2>
        {createProduct.error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{createProduct.error.message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{isAr ? "الكود" : "Code"}</label><input type="text" value={formData.code} onChange={(e) => updateField("code", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" /></div>
            <div><label className="block text-sm font-medium mb-1">{isAr ? "الفئة" : "Category"}</label><select value={formData.category} onChange={(e) => updateField("category", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"><option value={isAr ? "مواد خام" : "Raw Materials"}>{isAr ? "مواد خام" : "Raw Materials"}</option><option value={isAr ? "بضاعة تامة" : "Finished Goods"}>{isAr ? "بضاعة تامة" : "Finished Goods"}</option><option value={isAr ? "مستلزمات" : "Supplies"}>{isAr ? "مستلزمات" : "Supplies"}</option><option value={isAr ? "قطع غيار" : "Spare Parts"}>{isAr ? "قطع غيار" : "Spare Parts"}</option><option value={isAr ? "اخرى" : "Other"}>{isAr ? "اخرى" : "Other"}</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{isAr ? "الاسم بالعربية" : "Name (Arabic)"}</label><input type="text" value={formData.nameAr} onChange={(e) => updateField("nameAr", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-1">{isAr ? "الاسم بالانجليزية" : "Name (English)"}</label><input type="text" value={formData.nameEn} onChange={(e) => updateField("nameEn", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">{isAr ? "وحدة القياس" : "Unit Type"}</label><input type="text" value={formData.unitType} onChange={(e) => updateField("unitType", e.target.value)} placeholder={isAr ? "مثال: قطعة، كجم، لتر" : "e.g. piece, kg, liter"} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{isAr ? "سعر التكلفة" : "Cost Price"}</label><input type="number" value={formData.costPrice} onChange={(e) => updateField("costPrice", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" min="0" step="0.01" /></div>
            <div><label className="block text-sm font-medium mb-1">{isAr ? "سعر البيع" : "Selling Price"}</label><input type="number" value={formData.sellingPrice} onChange={(e) => updateField("sellingPrice", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" min="0" step="0.01" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">{isAr ? "الحد الادنى" : "Min Stock"}</label><input type="number" value={formData.minimumStock} onChange={(e) => updateField("minimumStock", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" min="0" /></div>
            <div><label className="block text-sm font-medium mb-1">{isAr ? "حد اعادة الطلب" : "Reorder Level"}</label><input type="number" value={formData.reorderLevel} onChange={(e) => updateField("reorderLevel", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" min="0" /></div>
            <div><label className="block text-sm font-medium mb-1">{isAr ? "نسبة الضريبة %" : "VAT Rate %"}</label><input type="number" value={formData.vatRate} onChange={(e) => updateField("vatRate", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" min="0" step="0.01" /></div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={formData.trackExpiry} onChange={(e) => updateField("trackExpiry", e.target.checked)} className="w-4 h-4 rounded border-input" />{isAr ? "تتبع الصلاحية" : "Track Expiry"}</label>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={formData.trackBatch} onChange={(e) => updateField("trackBatch", e.target.checked)} className="w-4 h-4 rounded border-input" />{isAr ? "تتبع الدفعات" : "Track Batches"}</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">{isAr ? "الغاء" : "Cancel"}</button>
            <button type="submit" disabled={createProduct.isPending} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">{createProduct.isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ" : "Save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMovementModal({ products, currency, isAr, onClose, onSuccess }: { products: any[]; currency: string; isAr: boolean; onClose: () => void; onSuccess: () => void; }) {
  const [formData, setFormData] = useState({ productId: "", type: "IN" as "IN" | "OUT" | "ADJUSTMENT", quantity: "", unitCost: "", batchNumber: "", expiryDate: "", reference: "", notes: "" });
  const selectedProduct = products.find((p: any) => p.id === formData.productId);
  const addMovement = trpc.inventory.addMovement.useMutation({ onSuccess: () => onSuccess() });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); addMovement.mutate({ productId: formData.productId, type: formData.type as "IN" | "OUT" | "ADJUSTMENT" | "RETURN_IN" | "RETURN_OUT", date: new Date(), quantity: parseFloat(formData.quantity), unitCost: formData.unitCost ? parseFloat(formData.unitCost) : undefined, batchNumber: formData.batchNumber || undefined, expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined, reference: formData.reference || undefined, notes: formData.notes || undefined }); };
  const updateField = (field: string, value: any) => { setFormData((prev) => ({ ...prev, [field]: value })); };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "اضافة حركة مخزون" : "Add Stock Movement"}</h2>
        {addMovement.error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{addMovement.error.message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">{isAr ? "المنتج" : "Product"}</label><select value={formData.productId} onChange={(e) => updateField("productId", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"><option value="">{isAr ? "اختر المنتج..." : "Select product..."}</option>{products.map((p: any) => <option key={p.id} value={p.id}>{p.code} - {p.nameAr}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{isAr ? "النوع" : "Type"}</label><select value={formData.type} onChange={(e) => updateField("type", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"><option value="IN">{isAr ? "وارد" : "In"}</option><option value="OUT">{isAr ? "صادر" : "Out"}</option><option value="ADJUSTMENT">{isAr ? "تسوية" : "Adjustment"}</option></select></div>
            <div><label className="block text-sm font-medium mb-1">{isAr ? "الكمية" : "Quantity"}</label><input type="number" value={formData.quantity} onChange={(e) => updateField("quantity", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" min="1" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">{isAr ? "تكلفة الوحدة" : "Unit Cost"}</label><input type="number" value={formData.unitCost} onChange={(e) => updateField("unitCost", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" min="0" step="0.01" /></div>
          {selectedProduct?.trackBatch && <div><label className="block text-sm font-medium mb-1">{isAr ? "رقم الدفعة" : "Batch Number"}</label><input type="text" value={formData.batchNumber} onChange={(e) => updateField("batchNumber", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" /></div>}
          {selectedProduct?.trackExpiry && <div><label className="block text-sm font-medium mb-1">{isAr ? "تاريخ الصلاحية" : "Expiry Date"}</label><input type="date" value={formData.expiryDate} onChange={(e) => updateField("expiryDate", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" /></div>}
          <div><label className="block text-sm font-medium mb-1">{isAr ? "المرجع" : "Reference"}</label><input type="text" value={formData.reference} onChange={(e) => updateField("reference", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
          <div><label className="block text-sm font-medium mb-1">{isAr ? "ملاحظات" : "Notes"}</label><textarea value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">{isAr ? "الغاء" : "Cancel"}</button>
            <button type="submit" disabled={addMovement.isPending} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">{addMovement.isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ" : "Save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
