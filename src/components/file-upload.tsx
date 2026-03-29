"use client";

import { useState, useRef } from "react";

interface FileUploadProps {
  onUpload: (url: string, name: string) => void;
  currentUrl?: string;
  currentName?: string;
  label?: string;
}

export function FileUpload({ onUpload, currentUrl, currentName, label = "إرفاق مستند" }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        onUpload(data.url, data.name);
      } else {
        setError(data.error);
      }
    } catch {
      setError("فشل رفع الملف");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {currentUrl && currentName ? (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200 text-sm">
          <span className="text-green-600">📎</span>
          <span className="text-green-700 truncate flex-1">{currentName}</span>
          <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">عرض</a>
          <button type="button" onClick={() => onUpload("", "")} className="text-xs text-red-500 hover:text-red-700">حذف</button>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()} className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#0070F2] cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50">
          {uploading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              جاري الرفع...
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center">
              <span className="text-lg">📄</span>
              <p>اضغط لرفع ملف (PDF, JPG, PNG — حد أقصى 5MB)</p>
            </div>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleUpload} className="hidden" />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
