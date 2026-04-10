"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function AllUsersPage() {
  const tc = useTranslations("common");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allUsers, isLoading, error } = trpc.admin.getAllUsers.useQuery(undefined, {
    retry: 1,
  });
  const data = allUsers?.filter((u: any) =>
    !searchTerm || u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "مدير النظام",
    OWNER: "مالك",
    ADMIN: "مدير",
    ACCOUNTANT: "محاسب",
    VIEWER: "مشاهد",
  };

  const roleBadgeColors: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-50 text-purple-700",
    OWNER: "bg-blue-50 text-blue-700",
    ADMIN: "bg-indigo-50 text-indigo-700",
    ACCOUNTANT: "bg-green-50 text-green-700",
    VIEWER: "bg-muted text-muted-foreground",
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#021544]">جميع المستخدمين</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة مستخدمي النظام</p>
        </div>
        <Link
          href="/ar/admin"
          className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          العودة للوحة التحكم
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="بحث بالاسم أو البريد الإلكتروني..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring outline-none w-80"
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <strong>خطأ في تحميل المستخدمين:</strong> {error.message}
          <div className="text-xs text-red-500 mt-1 font-mono">{error.data?.code}</div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">الاسم</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">البريد الإلكتروني</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">الصلاحية</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">المنشأة</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">القطاع</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">تاريخ الإنشاء</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  {tc("loading")}
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((user: any) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground" dir="ltr">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        roleBadgeColors[user.role] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {roleLabels[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.tenant?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.tenant?.sector ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">{formatDate(user.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  {tc("noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {data && data && (
          <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground">
            إجمالي {data.length} مستخدم
          </div>
        )}
      </div>
    </div>
  );
}
