"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function FixedAssetsPage() {
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";

  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showDepreciationModal, setShowDepreciationModal] = useState(false);
  const [showDisposeModal, setShowDisposeModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

  const { data: summary } = trpc.fixedAssets.getSummary.useQuery();
  const { data: assets, isLoading, refetch: refetchAssets } =
    trpc.fixedAssets.list.useQuery();

  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-green-50 text-green-700",
    FULLY_DEPRECIATED: "bg-blue-50 text-blue-700",
    DISPOSED: "bg-gray-100 text-gray-600",
    UNDER_MAINTENANCE: "bg-yellow-50 text-yellow-700",
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: "نشط",
    FULLY_DEPRECIATED: "مهلك بالكامل",
    DISPOSED: "مستبعد",
    UNDER_MAINTENANCE: "تحت الصيانة",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">الاصول الثابتة</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDepreciationModal(true)}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            تشغيل الاهلاك
          </button>
          <button
            onClick={() => setShowAddAssetModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            + اضافة اصل
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-blue-500">
          <p className="text-sm text-muted-foreground mb-1">اجمالي الاصول</p>
          <p className="text-2xl font-bold text-[#021544]">{summary?.totalAssets ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-green-500">
          <p className="text-sm text-muted-foreground mb-1">التكلفة الاجمالية</p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(summary?.totalCost ?? 0, currency)}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-yellow-500">
          <p className="text-sm text-muted-foreground mb-1">مجمع الاهلاك</p>
          <p className="text-2xl font-bold text-yellow-700">
            {formatCurrency(summary?.totalAccumulatedDepreciation ?? 0, currency)}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-purple-500">
          <p className="text-sm text-muted-foreground mb-1">صافي القيمة الدفترية</p>
          <p className="text-2xl font-bold text-purple-700">
            {formatCurrency(summary?.totalNBV ?? 0, currency)}
          </p>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground w-8"></th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">رقم الاصل</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">الاسم</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">الفئة</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">تاريخ الاقتناء</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">التكلفة</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">مجمع الاهلاك</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">صافي القيمة</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">الحالة</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">اجراءات</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-muted-foreground">
                  {tc("loading")}
                </td>
              </tr>
            ) : assets?.assets && assets.assets.length > 0 ? (
              assets.assets.map((asset: any) => (
                <>
                  <tr
                    key={asset.id}
                    className="border-b border-border/50 hover:bg-muted/20 cursor-pointer"
                    onClick={() =>
                      setExpandedAssetId(expandedAssetId === asset.id ? null : asset.id)
                    }
                  >
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          "inline-block transition-transform text-muted-foreground",
                          expandedAssetId === asset.id && "rotate-90"
                        )}
                      >
                        &#9654;
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{asset.assetNumber}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#021544]">{asset.nameAr}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{asset.category}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(asset.acquisitionDate)}</td>
                    <td className="px-4 py-3 text-sm text-end font-mono">
                      {formatCurrency(Number(asset.acquisitionCost ?? 0), currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-end font-mono">
                      {formatCurrency(Number(asset.accumulatedDepreciation ?? 0), currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-end font-mono font-medium">
                      {formatCurrency(Number(asset.netBookValue ?? 0), currency)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                          statusStyles[asset.status] ?? "bg-gray-100 text-gray-600"
                        )}
                      >
                        {statusLabels[asset.status] ?? asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {asset.status === "ACTIVE" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAssetId(asset.id);
                            setShowDisposeModal(true);
                          }}
                          className="text-xs px-2 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                          استبعاد
                        </button>
                      )}
                    </td>
                  </tr>
                  {/* Depreciation History Expand */}
                  {expandedAssetId === asset.id && (
                    <tr key={`${asset.id}-details`}>
                      <td colSpan={10} className="bg-muted/10 px-8 py-4">
                        <h4 className="text-sm font-semibold text-[#021544] mb-3">سجل الاهلاك</h4>
                        {asset.depreciationHistory && asset.depreciationHistory.length > 0 ? (
                          <table className="w-full">
                            <thead>
                              <tr className="text-xs text-muted-foreground border-b border-border">
                                <th className="text-start pb-2 font-medium">الفترة</th>
                                <th className="text-end pb-2 font-medium">مبلغ الاهلاك</th>
                                <th className="text-end pb-2 font-medium">المجمع</th>
                                <th className="text-end pb-2 font-medium">صافي القيمة</th>
                              </tr>
                            </thead>
                            <tbody>
                              {asset.depreciationHistory.map((dep: any, idx: number) => (
                                <tr key={idx} className="border-b border-border/30 text-sm">
                                  <td className="py-2">{dep.period}</td>
                                  <td className="py-2 text-end font-mono">
                                    {formatCurrency(Number(dep.amount ?? 0), currency)}
                                  </td>
                                  <td className="py-2 text-end font-mono">
                                    {formatCurrency(Number(dep.accumulated ?? 0), currency)}
                                  </td>
                                  <td className="py-2 text-end font-mono">
                                    {formatCurrency(Number(dep.netBookValue ?? 0), currency)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-sm text-muted-foreground">لا يوجد سجل اهلاك بعد</p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-8 text-muted-foreground">
                  لا توجد اصول ثابتة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <AddAssetModal
          onClose={() => setShowAddAssetModal(false)}
          onSuccess={() => {
            setShowAddAssetModal(false);
            refetchAssets();
          }}
        />
      )}

      {/* Run Depreciation Modal */}
      {showDepreciationModal && (
        <RunDepreciationModal
          currency={currency}
          onClose={() => setShowDepreciationModal(false)}
          onSuccess={() => {
            setShowDepreciationModal(false);
            refetchAssets();
          }}
        />
      )}

      {/* Dispose Modal */}
      {showDisposeModal && selectedAssetId && (
        <DisposeModal
          assetId={selectedAssetId}
          currency={currency}
          onClose={() => {
            setShowDisposeModal(false);
            setSelectedAssetId(null);
          }}
          onSuccess={() => {
            setShowDisposeModal(false);
            setSelectedAssetId(null);
            refetchAssets();
          }}
        />
      )}
    </div>
  );
}

/* ─── Add Asset Modal ─── */
function AddAssetModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    assetNumber: "",
    nameAr: "",
    nameEn: "",
    category: "معدات",
    acquisitionDate: new Date().toISOString().split("T")[0],
    acquisitionCost: "",
    residualValue: "",
    usefulLifeMonths: "",
    depreciationMethod: "STRAIGHT_LINE" as "STRAIGHT_LINE" | "DECLINING_BALANCE",
    location: "",
    serialNumber: "",
  });

  const createAsset = trpc.fixedAssets.create.useMutation({
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAsset.mutate({
      assetNumber: formData.assetNumber,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn || undefined,
      category: formData.category,
      acquisitionDate: new Date(formData.acquisitionDate),
      acquisitionCost: parseFloat(formData.acquisitionCost),
      residualValue: formData.residualValue ? parseFloat(formData.residualValue) : 0,
      usefulLifeMonths: parseInt(formData.usefulLifeMonths),
      depreciationMethod: formData.depreciationMethod,
      location: formData.location || undefined,
      serialNumber: formData.serialNumber || undefined,
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-[#021544] mb-4">اضافة اصل ثابت</h2>

        {createAsset.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {createAsset.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">رقم الاصل</label>
              <input
                type="text"
                value={formData.assetNumber}
                onChange={(e) => updateField("assetNumber", e.target.value)}
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
                <option value="اثاث وتجهيزات">اثاث وتجهيزات</option>
                <option value="معدات">معدات</option>
                <option value="سيارات">سيارات</option>
                <option value="مباني">مباني</option>
                <option value="اجهزة كمبيوتر">اجهزة كمبيوتر</option>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">تاريخ الاقتناء</label>
              <input
                type="date"
                value={formData.acquisitionDate}
                onChange={(e) => updateField("acquisitionDate", e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تكلفة الاقتناء</label>
              <input
                type="number"
                value={formData.acquisitionCost}
                onChange={(e) => updateField("acquisitionCost", e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">القيمة المتبقية</label>
              <input
                type="number"
                value={formData.residualValue}
                onChange={(e) => updateField("residualValue", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">العمر الافتراضي (شهر)</label>
              <input
                type="number"
                value={formData.usefulLifeMonths}
                onChange={(e) => updateField("usefulLifeMonths", e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">طريقة الاهلاك</label>
            <select
              value={formData.depreciationMethod}
              onChange={(e) => updateField("depreciationMethod", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="STRAIGHT_LINE">القسط الثابت</option>
              <option value="DECLINING_BALANCE">القسط المتناقص</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الموقع</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الرقم التسلسلي</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => updateField("serialNumber", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
            </div>
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
              disabled={createAsset.isPending}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createAsset.isPending ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Run Depreciation Modal ─── */
function RunDepreciationModal({
  currency,
  onClose,
  onSuccess,
}: {
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [result, setResult] = useState<{ count: number; totalAmount: number } | null>(null);

  const runDepreciation = trpc.fixedAssets.runDepreciation.useMutation({
    onSuccess: (data: any) => {
      setResult({
        count: data.depreciatedCount ?? data.count ?? 0,
        totalAmount: data.totalAmount ?? 0,
      });
    },
  });

  const handleRun = () => {
    runDepreciation.mutate({ period: `${year}-${String(month).padStart(2, "0")}` });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold text-[#021544] mb-4">تشغيل الاهلاك الشهري</h2>

        {runDepreciation.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {runDepreciation.error.message}
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 font-medium mb-2">تم تشغيل الاهلاك بنجاح</p>
              <p className="text-sm text-green-700">
                عدد الاصول المهلكة: <strong>{result.count}</strong>
              </p>
              <p className="text-sm text-green-700">
                اجمالي مبلغ الاهلاك: <strong>{formatCurrency(result.totalAmount, currency)}</strong>
              </p>
            </div>
            <button
              onClick={onSuccess}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              اغلاق
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">الشهر</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleDateString("ar-SA", { month: "long" })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">السنة</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                  dir="ltr"
                  min="2020"
                  max="2099"
                />
              </div>
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
                onClick={handleRun}
                disabled={runDepreciation.isPending}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {runDepreciation.isPending ? "جاري التنفيذ..." : "تشغيل"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Dispose Asset Modal ─── */
function DisposeModal({
  assetId,
  currency,
  onClose,
  onSuccess,
}: {
  assetId: string;
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [disposalPrice, setDisposalPrice] = useState("");

  const dispose = trpc.fixedAssets.dispose.useMutation({
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispose.mutate({
      id: assetId,
      disposalDate: new Date(),
      disposalPrice: parseFloat(disposalPrice),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold text-[#021544] mb-4">استبعاد الاصل</h2>

        {dispose.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {dispose.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">سعر الاستبعاد</label>
            <input
              type="number"
              value={disposalPrice}
              onChange={(e) => setDisposalPrice(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
              min="0"
              step="0.01"
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
              disabled={dispose.isPending}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {dispose.isPending ? "جاري الاستبعاد..." : "تاكيد الاستبعاد"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
