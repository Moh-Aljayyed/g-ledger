"use client";

interface ExportButtonsProps {
  onPDF?: () => void;
  onExcel?: () => void;
  onPrint?: () => void;
  loading?: boolean;
}

export function ExportButtons({ onPDF, onExcel, onPrint, loading }: ExportButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {onPDF && (
        <button onClick={onPDF} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 transition-all disabled:opacity-50">
          📄 PDF
        </button>
      )}
      {onExcel && (
        <button onClick={onExcel} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 transition-all disabled:opacity-50">
          📊 Excel
        </button>
      )}
      {onPrint && (
        <button onClick={onPrint} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 transition-all disabled:opacity-50">
          🖨️ Print
        </button>
      )}
    </div>
  );
}
