"use client";
import { useState, useRef } from "react";

interface ExcelImportProps {
  type: "products" | "customers" | "vendors" | "employees" | "accounts";
  onSuccess?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  products: "المنتجات",
  customers: "العملاء",
  vendors: "الموردون",
  employees: "الموظفون",
  accounts: "الحسابات",
};

export function ExcelImport({ type, onSuccess }: ExcelImportProps) {
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    window.open(`/api/excel/template?type=${type}`, "_blank");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/excel/import", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data);
      if (data.success && onSuccess) onSuccess();
    } catch {
      setResult({ error: "فشل رفع الملف" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 transition-all">
        📥 استيراد Excel
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#021544]">استيراد {TYPE_LABELS[type]} من Excel</h2>
              <button onClick={() => { setShowModal(false); setResult(null); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            {/* Step 1: Download Template */}
            <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h3 className="text-sm font-bold text-blue-800 mb-2">الخطوة 1: حمّل القالب</h3>
              <p className="text-xs text-blue-600 mb-3">حمّل ملف Excel الفارغ واملأه ببيانات {TYPE_LABELS[type]}</p>
              <button onClick={downloadTemplate} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                تحميل قالب {TYPE_LABELS[type]}
              </button>
            </div>

            {/* Warning */}
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-700 font-medium">تنبيه: الحقول المميزة بـ (*) مطلوبة. إذا كان هناك كود في الصف يجب ملء جميع الحقول المطلوبة.</p>
            </div>

            {/* Step 2: Upload */}
            <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-800 mb-2">الخطوة 2: ارفع الملف</h3>
              <div onClick={() => inputRef.current?.click()} className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 cursor-pointer transition-colors">
                {uploading ? (
                  <div className="flex items-center gap-2 text-sm"><div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /> جاري الاستيراد...</div>
                ) : (
                  <div className="text-sm text-gray-500 text-center">اضغط لرفع ملف Excel (.xlsx)</div>
                )}
              </div>
              <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleUpload} className="hidden" />
            </div>

            {/* Result */}
            {result && (
              <div className={`p-4 rounded-lg ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                {result.success ? (
                  <div>
                    <p className="text-sm font-bold text-green-800">تم الاستيراد بنجاح!</p>
                    <p className="text-xs text-green-600 mt-1">جديد: {result.imported} | محدّث: {result.updated} | إجمالي: {result.total}</p>
                    {result.errors?.length > 0 && (
                      <div className="mt-2 max-h-32 overflow-y-auto">
                        <p className="text-xs font-bold text-amber-700">تحذيرات:</p>
                        {result.errors.map((err: string, i: number) => (
                          <p key={i} className="text-[10px] text-amber-600">{err}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-red-700">{result.error}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
