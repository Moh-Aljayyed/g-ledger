"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tab = "products" | "movements";

export default function InventoryPage() {
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";

  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddMovementModal, setShowAddMovementModal] = useState(false);

  const { data: products, isLoading: productsLoading, refetch: refetchProducts } =
    trpc.inventory.listProducts.useQuery();

  const { data: movements, isLoading: movementsLoading, refetch: refetchMovements } =
    trpc.inventory.listMovements.useQuery();

  const { data: valuation } = trpc.inventory.getStockValuation.useQuery();
  const { data: lowStockAlerts } = trpc.inventory.getLowStockAlerts.useQuery();

  const productsList = (products as any)?.products ?? products ?? [];
  const filteredProducts = productsList.filter((p: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.code?.toLowerCase().includes(q) ||
      p.nameAr?.toLowerCase().includes(q) ||
      p.nameEn?.toLowerCase().includes(q)
    );
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
    if (product.currentStock === 0) return "نفذ";
    if (product.currentStock <= product.reorderLevel) return "منخفض";
    return "متوفر";
  };

  const movementTypeStyles: Record<string, string> = {
    IN: "bg-green-50 text-green-700",
    OUT: "bg-red-50 text-red-700",
    ADJUSTMENT: "bg-blue-50 text-blue-700",
    RETURN_IN: "bg-cyan-50 text-cyan-700",
    RETURN_OUT: "bg-orange-50 text-orange-700",
  };

  const movementTypeLabels: Record<string, string> = {
    IN: "وارد",
    OUT: "صادر",
    ADJUSTMENT: "تسوية",
    RETURN_IN: "مرتجع وارد",
    RETURN_OUT: "مرتجع صادر",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">المخزون</h1>
        <div className="flex gap-2">
          {activeTab === "products" && (
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              + اضافة منتج
            </button>
          )}
          {activeTab === "movements" && (
            <button
              onClick={() => setShowAddMovementModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              + اضافة حركة
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-blue-500">
          <p className="text-sm text-muted-foreground mb-1">اجمالي المنتجات</p>
          <p className="text-2xl font-bold text-[#021544]">{totalProducts}</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-green-500">
          <p className="text-sm text-muted-foreground mb-1">قيمة المخزون</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(stockValuation, currency)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-yellow-500">
          <p className="text-sm text-muted-foreground mb-1">تنبيهات نقص المخزون</p>
          <p className="text-2xl font-bold text-yellow-700">{lowStockCount}</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-red-500">
          <p className="text-sm text-muted-foreground mb-1">اصناف منتهية الصلاحية</p>
          <p className="text-2xl font-bold text-red-700">{expiringCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/50 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab("products")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "products"
              ? "bg-card text-[#021544] shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          المنتجات
        </button>
        <button
          onClick={() => setActiveTab("movements")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "movements"
              ? "bg-card text-[#021544] shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          حركات المخزون
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم او الكود..."
              className="w-full max-w-md px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Products Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">الكود</th>
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">الاسم</th>
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">الفئة</th>
                  <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">الرصيد الحالي</th>
                  <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">سعر التكلفة</th>
                  <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">سعر البيع</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {productsLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      {tc("loading")}
                    </td>
                  </tr>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product: any) => (
                    <tr key={product.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3 text-sm font-mono">{product.code}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#021544]">{product.nameAr}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                      <td className="px-4 py-3 text-sm text-end font-mono">{product.currentStock}</td>
                      <td className="px-4 py-3 text-sm text-end font-mono">
                        {formatCurrency(Number(product.costPrice ?? 0), currency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-end font-mono">
                        {formatCurrency(Number(product.sellingPrice ?? 0), currency)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                            getStockStatusColor(product)
                          )}
                        >
                          {getStockStatusLabel(product)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد منتجات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Movements Tab */}
      {activeTab === "movements" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">رقم الحركة</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">التاريخ</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">النوع</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">المنتج</th>
                <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">الكمية</th>
                <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">تكلفة الوحدة</th>
                <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">التكلفة الاجمالية</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">الدفعة</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">المرجع</th>
              </tr>
            </thead>
            <tbody>
              {movementsLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-muted-foreground">
                    {tc("loading")}
                  </td>
                </tr>
              ) : (movements as any)?.movements?.length > 0 || ((movements as any)?.length > 0) ? (
                ((movements as any)?.movements ?? movements ?? []).map((mov: any) => (
                  <tr key={mov.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3 text-sm font-mono">{mov.movementNumber}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(mov.date)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                          movementTypeStyles[mov.type] ?? "bg-gray-50 text-gray-700"
                        )}
                      >
                        {movementTypeLabels[mov.type] ?? mov.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{mov.product?.nameAr ?? mov.productName ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-end font-mono">{mov.quantity}</td>
                    <td className="px-4 py-3 text-sm text-end font-mono">
                      {formatCurrency(Number(mov.unitCost ?? 0), currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-end font-mono">
                      {formatCurrency(Number(mov.unitCost ?? 0) * Number(mov.quantity ?? 0), currency)}
                    </td>
                    <td className="px-4 py-3 text-sm">{mov.batchNumber || "—"}</td>
                    <td className="px-4 py-3 text-sm">{mov.reference || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-muted-foreground">
                    لا توجد حركات مخزون
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <AddProductModal
          onClose={() => setShowAddProductModal(false)}
          onSuccess={() => {
            setShowAddProductModal(false);
            refetchProducts();
          }}
        />
      )}

      {/* Add Movement Modal */}
      {showAddMovementModal && (
        <AddMovementModal
          products={productsList ?? []}
          currency={currency}
          onClose={() => setShowAddMovementModal(false)}
          onSuccess={() => {
            setShowAddMovementModal(false);
            refetchMovements();
            refetchProducts();
          }}
        />
      )}
    </div>
  );
}

/* ─── Add Product Modal ─── */
function AddProductModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    category: "بضاعة تامة",
    unitType: "",
    costPrice: "",
    sellingPrice: "",
    minimumStock: "",
    reorderLevel: "",
    vatRate: "",
    trackExpiry: false,
    trackBatch: false,
  });

  const createProduct = trpc.inventory.createProduct.useMutation({
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate({
      code: formData.code,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn || undefined,
      category: formData.category,
      unitType: formData.unitType || undefined,
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0,
      sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : 0,
      minimumStock: formData.minimumStock ? parseInt(formData.minimumStock) : 0,
      reorderLevel: formData.reorderLevel ? parseInt(formData.reorderLevel) : 0,
      vatRate: formData.vatRate ? parseFloat(formData.vatRate) : undefined,
      trackExpiry: formData.trackExpiry,
      trackBatch: formData.trackBatch,
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-[#021544] mb-4">اضافة منتج</h2>

        {createProduct.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {createProduct.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الكود</label>
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
              <label className="block text-sm font-medium mb-1">الفئة</label>
              <select
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="مواد خام">مواد خام</option>
                <option value="بضاعة تامة">بضاعة تامة</option>
                <option value="مستلزمات">مستلزمات</option>
                <option value="قطع غيار">قطع غيار</option>
                <option value="اخرى">اخرى</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الاسم بالعربية</label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => updateField("nameAr", e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الاسم بالانجليزية</label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => updateField("nameEn", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">وحدة القياس</label>
            <input
              type="text"
              value={formData.unitType}
              onChange={(e) => updateField("unitType", e.target.value)}
              placeholder="مثال: قطعة، كجم، لتر"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">سعر التكلفة</label>
              <input
                type="number"
                value={formData.costPrice}
                onChange={(e) => updateField("costPrice", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">سعر البيع</label>
              <input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => updateField("sellingPrice", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الحد الادنى</label>
              <input
                type="number"
                value={formData.minimumStock}
                onChange={(e) => updateField("minimumStock", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">حد اعادة الطلب</label>
              <input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => updateField("reorderLevel", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">نسبة الضريبة %</label>
              <input
                type="number"
                value={formData.vatRate}
                onChange={(e) => updateField("vatRate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.trackExpiry}
                onChange={(e) => updateField("trackExpiry", e.target.checked)}
                className="w-4 h-4 rounded border-input"
              />
              تتبع الصلاحية
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.trackBatch}
                onChange={(e) => updateField("trackBatch", e.target.checked)}
                className="w-4 h-4 rounded border-input"
              />
              تتبع الدفعات
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              الغاء
            </button>
            <button
              type="submit"
              disabled={createProduct.isPending}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createProduct.isPending ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Add Movement Modal ─── */
function AddMovementModal({
  products,
  currency,
  onClose,
  onSuccess,
}: {
  products: any[];
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    productId: "",
    type: "IN" as "IN" | "OUT" | "ADJUSTMENT",
    quantity: "",
    unitCost: "",
    batchNumber: "",
    expiryDate: "",
    reference: "",
    notes: "",
  });

  const selectedProduct = products.find((p: any) => p.id === formData.productId);

  const addMovement = trpc.inventory.addMovement.useMutation({
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMovement.mutate({
      productId: formData.productId,
      type: formData.type as "IN" | "OUT" | "ADJUSTMENT" | "RETURN_IN" | "RETURN_OUT",
      date: new Date(),
      quantity: parseFloat(formData.quantity),
      unitCost: formData.unitCost ? parseFloat(formData.unitCost) : undefined,
      batchNumber: formData.batchNumber || undefined,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      reference: formData.reference || undefined,
      notes: formData.notes || undefined,
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-[#021544] mb-4">اضافة حركة مخزون</h2>

        {addMovement.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {addMovement.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">المنتج</label>
            <select
              value={formData.productId}
              onChange={(e) => updateField("productId", e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">اختر المنتج...</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">النوع</label>
              <select
                value={formData.type}
                onChange={(e) => updateField("type", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="IN">وارد</option>
                <option value="OUT">صادر</option>
                <option value="ADJUSTMENT">تسوية</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الكمية</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => updateField("quantity", e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">تكلفة الوحدة</label>
            <input
              type="number"
              value={formData.unitCost}
              onChange={(e) => updateField("unitCost", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
              min="0"
              step="0.01"
            />
          </div>

          {selectedProduct?.trackBatch && (
            <div>
              <label className="block text-sm font-medium mb-1">رقم الدفعة</label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => updateField("batchNumber", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
            </div>
          )}

          {selectedProduct?.trackExpiry && (
            <div>
              <label className="block text-sm font-medium mb-1">تاريخ الصلاحية</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => updateField("expiryDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">المرجع</label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => updateField("reference", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              الغاء
            </button>
            <button
              type="submit"
              disabled={addMovement.isPending}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {addMovement.isPending ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
