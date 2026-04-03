"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function FixedAssetsPage() {
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

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
    ACTIVE: isAr ? "نشط" : "Active",
    FULLY_DEPRECIATED: isAr ? "مهلك بالكامل" : "Fully Depreciated",
    DISPOSED: isAr ? "مستبعد" : "Disposed",
    UNDER_MAINTENANCE: isAr ? "تحت الصيانة" : "Under Maintenance",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">{isAr ? "الاصول الثابتة" : "Fixed Assets"}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDepreciationModal(true)}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            {isAr ? "تشغيل الاهلاك" : "Run Depreciation"}
          </button>
          <button
            onClick={() => setShowAddAssetModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {isAr ? "+ اضافة اصل" : "+ Add Asset"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-blue-500">
          <p className="text-sm text-muted-foreground mb-1">{isAr ? "اجمالي الاصول" : "Total Assets"}</p>
          <p className="text-2xl font-bold text-[#021544]">{summary?.totalAssets ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-green-500">
          <p className="text-sm text-muted-foreground mb-1">{isAr ? "التكلفة الاجمالية" : "Total Cost"}</p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(summary?.totalCost ?? 0, currency)}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-yellow-500">
          <p className="text-sm text-muted-foreground mb-1">{isAr ? "مجمع الاهلاك" : "Accumulated Depreciation"}</p>
          <p className="text-2xl font-bold text-yellow-700">
            {formatCurrency(summary?.totalAccumulatedDepreciation ?? 0, currency)}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 border-t-purple-500">
          <p className="text-sm text-muted-foreground mb-1">{isAr ? "صافي القيمة الدفترية" : "Net Book Value"}</p>
          <p className="text-2xl font-bold text-purple-700">
            {formatCurrency(summary?.totalNBV ?? 0, currency)}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      {summary?.byCategory && Object.keys(summary.byCategory).length > 0 && (
        <div className="mt-2 mb-6 bg-card rounded-xl border border-border p-6">
          <h2 className="font-bold text-[#021544] mb-4">{isAr ? "توزيع الأصول حسب الفئة" : "Assets by Category"}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="px-4 py-2 text-start">{isAr ? "الفئة" : "Category"}</th>
                  <th className="px-4 py-2 text-start">{isAr ? "العدد" : "Count"}</th>
                  <th className="px-4 py-2 text-start">{isAr ? "التكلفة" : "Cost"}</th>
                  <th className="px-4 py-2 text-start">{isAr ? "مجمع الإهلاك" : "Acc. Dep."}</th>
                  <th className="px-4 py-2 text-start">{isAr ? "صافي القيمة" : "NBV"}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.byCategory).map(([cat, data]: [string, any]) => (
                  <tr key={cat} className="border-b border-border/30">
                    <td className="px-4 py-2 font-medium">{cat || (isAr ? "غير مصنف" : "Uncategorized")}</td>
                    <td className="px-4 py-2">{data.count}</td>
                    <td className="px-4 py-2">{formatCurrency(data.totalCost, currency)}</td>
                    <td className="px-4 py-2 text-red-600">{formatCurrency(data.totalAccDep, currency)}</td>
                    <td className="px-4 py-2 font-bold text-[#0070F2]">{formatCurrency(data.totalNBV, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assets Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground w-8"></th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "رقم الاصل" : "Asset No."}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الاسم" : "Name"}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الفئة" : "Category"}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "تاريخ الاقتناء" : "Acquisition Date"}</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "التكلفة" : "Cost"}</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "مجمع الاهلاك" : "Accum. Depr."}</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "صافي القيمة" : "Net Value"}</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الحالة" : "Status"}</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "اجراءات" : "Actions"}</th>
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
                          {isAr ? "استبعاد" : "Dispose"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {/* Depreciation History Expand */}
                  {expandedAssetId === asset.id && (
                    <tr key={`${asset.id}-details`}>
                      <td colSpan={10} className="bg-muted/10 px-8 py-4">
                        <h4 className="text-sm font-semibold text-[#021544] mb-3">{isAr ? "سجل الاهلاك" : "Depreciation History"}</h4>
                        {asset.depreciationHistory && asset.depreciationHistory.length > 0 ? (
                          <table className="w-full">
                            <thead>
                              <tr className="text-xs text-muted-foreground border-b border-border">
                                <th className="text-start pb-2 font-medium">{isAr ? "الفترة" : "Period"}</th>
                                <th className="text-end pb-2 font-medium">{isAr ? "مبلغ الاهلاك" : "Depr. Amount"}</th>
                                <th className="text-end pb-2 font-medium">{isAr ? "المجمع" : "Accumulated"}</th>
                                <th className="text-end pb-2 font-medium">{isAr ? "صافي القيمة" : "Net Value"}</th>
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
                          <p className="text-sm text-muted-foreground">{isAr ? "لا يوجد سجل اهلاك بعد" : "No depreciation history yet"}</p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-8 text-muted-foreground">
                  {isAr ? "لا توجد اصول ثابتة" : "No fixed assets"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <AddAssetModal
          isAr={isAr}
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
          isAr={isAr}
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
          isAr={isAr}
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
  isAr,
  onClose,
  onSuccess,
}: {
  isAr: boolean;
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
        <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "اضافة اصل ثابت" : "Add Fixed Asset"}</h2>

        {createAsset.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {createAsset.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "رقم الاصل" : "Asset No."}</label>
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
              <label className="block text-sm font-medium mb-1">{isAr ? "الفئة" : "Category"}</label>
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
              <label className="block text-sm font-medium mb-1">{isAr ? "الاسم بالانجليزية" : "Name (English)"}</label>
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
              <label className="block text-sm font-medium mb-1">{isAr ? "تاريخ الاقتناء" : "Acquisition Date"}</label>
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
              <label className="block text-sm font-medium mb-1">{isAr ? "تكلفة الاقتناء" : "Acquisition Cost"}</label>
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
              <label className="block text-sm font-medium mb-1">{isAr ? "القيمة المتبقية" : "Residual Value"}</label>
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
              <label className="block text-sm font-medium mb-1">{isAr ? "العمر الافتراضي (شهر)" : "Useful Life (months)"}</label>
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
            <label className="block text-sm font-medium mb-1">{isAr ? "طريقة الاهلاك" : "Depreciation Method"}</label>
            <select
              value={formData.depreciationMethod}
              onChange={(e) => updateField("depreciationMethod", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="STRAIGHT_LINE">{isAr ? "القسط الثابت" : "Straight Line"}</option>
              <option value="DECLINING_BALANCE">{isAr ? "القسط المتناقص" : "Declining Balance"}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "الموقع" : "Location"}</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "الرقم التسلسلي" : "Serial Number"}</label>
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
              {isAr ? "الغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={createAsset.isPending}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createAsset.isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ" : "Save")}
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
  isAr,
  onClose,
  onSuccess,
}: {
  currency: string;
  isAr: boolean;
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
        <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "تشغيل الاهلاك الشهري" : "Run Monthly Depreciation"}</h2>

        {runDepreciation.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {runDepreciation.error.message}
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 font-medium mb-2">{isAr ? "تم تشغيل الاهلاك بنجاح" : "Depreciation completed successfully"}</p>
              <p className="text-sm text-green-700">
                {isAr ? "عدد الاصول المهلكة:" : "Assets depreciated:"} <strong>{result.count}</strong>
              </p>
              <p className="text-sm text-green-700">
                {isAr ? "اجمالي مبلغ الاهلاك:" : "Total depreciation:"} <strong>{formatCurrency(result.totalAmount, currency)}</strong>
              </p>
            </div>
            <button
              onClick={onSuccess}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {isAr ? "اغلاق" : "Close"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{isAr ? "الشهر" : "Month"}</label>
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
                <label className="block text-sm font-medium mb-1">{isAr ? "السنة" : "Year"}</label>
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
                {runDepreciation.isPending ? (isAr ? "جاري التنفيذ..." : "Running...") : (isAr ? "تشغيل" : "Run")}
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
  isAr,
  onClose,
  onSuccess,
}: {
  assetId: string;
  currency: string;
  isAr: boolean;
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
        <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "استبعاد الاصل" : "Dispose Asset"}</h2>

        {dispose.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {dispose.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{isAr ? "سعر الاستبعاد" : "Disposal Price"}</label>
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
              {isAr ? "الغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={dispose.isPending}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {dispose.isPending ? (isAr ? "جاري الاستبعاد..." : "Disposing...") : (isAr ? "تاكيد الاستبعاد" : "Confirm Disposal")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
