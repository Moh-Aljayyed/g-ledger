"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";

const ENTITY_TYPES = [
  "ALL", "ACCOUNT", "JOURNAL_ENTRY", "INVOICE", "CUSTOMER", "VENDOR",
  "EMPLOYEE", "PRODUCT", "PAYMENT", "EXPENSE", "BILL", "PAYROLL",
];

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-50 text-green-700",
  UPDATE: "bg-blue-50 text-blue-700",
  DELETE: "bg-red-50 text-red-700",
};

export default function AuditLogPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

  const [entityFilter, setEntityFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = trpc.audit.list.useQuery({
    ...(entityFilter !== "ALL" ? { entity: entityFilter } : {}),
    page,
    limit: pageSize,
  });

  const logs = data?.logs ?? [];
  const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isAr ? "سجل العمليات" : "Audit Log"}</h1>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <label className="text-sm text-muted-foreground font-medium">
          {isAr ? "تصفية حسب:" : "Filter by:"}
        </label>
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
        >
          {ENTITY_TYPES.map((et) => (
            <option key={et} value={et}>
              {et === "ALL" ? (isAr ? "الكل" : "All") : et}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">
                {isAr ? "التاريخ والوقت" : "Date/Time"}
              </th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">
                {isAr ? "المستخدم" : "User"}
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">
                {isAr ? "العملية" : "Action"}
              </th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">
                {isAr ? "الكيان" : "Entity"}
              </th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">
                {isAr ? "التفاصيل" : "Details"}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  {isAr ? "جاري التحميل..." : "Loading..."}
                </td>
              </tr>
            ) : logs.length > 0 ? (
              logs.map((log: any) => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString(isAr ? "ar-SA" : "en-US", {
                      year: "numeric", month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm">{log.userName || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[log.action] || "bg-muted text-muted-foreground"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{log.entity}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{log.details || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  {isAr ? "لا توجد سجلات" : "No logs found"}
                </td>
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
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-40"
          >
            {isAr ? "السابق" : "Previous"}
          </button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-40"
          >
            {isAr ? "التالي" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
