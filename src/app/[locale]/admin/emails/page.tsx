"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

const DOC_TYPE_COLORS: Record<string, string> = {
  INVOICE: "bg-blue-50 text-blue-700",
  QUOTE: "bg-green-50 text-green-700",
  PURCHASE_ORDER: "bg-purple-50 text-purple-700",
  RECEIPT: "bg-yellow-50 text-yellow-700",
};

const STATUS_COLORS: Record<string, string> = {
  SENT: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-700",
  PENDING: "bg-yellow-50 text-yellow-700",
};

export default function AdminEmailsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data: allEmails, isLoading } = trpc.admin.getAllEmailLogs.useQuery();
  const data = allEmails?.slice((page - 1) * pageSize, page * pageSize);

  const logs = data ?? [];
  const totalPages = allEmails ? Math.ceil(allEmails.length / pageSize) : 1;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">سجل الإيميلات</h1>
        <span className="text-sm text-muted-foreground">
          {allEmails?.length ?? 0} إيميل مرسل
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-gray-50">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">التاريخ</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">المنشأة (المرسل)</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">إلى</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">الموضوع</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">نوع المستند</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">جاري التحميل...</td>
              </tr>
            ) : logs.length > 0 ? (
              logs.map((log: any) => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("ar-SA", {
                      year: "numeric", month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{log.tenantName || "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{log.to}</td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate">{log.subject}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${DOC_TYPE_COLORS[log.documentType] || "bg-muted text-muted-foreground"}`}>
                      {log.documentType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[log.status] || "bg-muted text-muted-foreground"}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد رسائل مرسلة</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
          >
            السابق
          </button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
