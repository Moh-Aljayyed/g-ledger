"use client";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-[#021544] mb-2">حدث خطأ</h2>
        <p className="text-sm text-muted-foreground mb-4">{error.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."}</p>
        <button onClick={reset} className="px-6 py-2.5 bg-[#0070F2] text-white rounded-lg text-sm font-medium hover:bg-[#005ed4]">
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
