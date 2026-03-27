"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function AllTenantsPage() {
  const tc = useTranslations("common");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allTenants, isLoading } = trpc.admin.getAllTenants.useQuery();
  const data = allTenants?.filter((t: any) =>
    !searchTerm || t.name.includes(searchTerm) || t.sector.includes(searchTerm)
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#021544]">جميع المنشآت</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة المنشآت المسجلة في النظام</p>
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
          placeholder="بحث بالاسم..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring outline-none w-72"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">الاسم</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">القطاع</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">المستخدمين</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">القيود</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">تاريخ الإنشاء</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">الحالة</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  {tc("loading")}
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((tenant: any) => (
                <tr key={tenant.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-sm font-medium">{tenant.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{tenant.sector}</td>
                  <td className="px-4 py-3 text-sm text-center font-mono">{tenant._count?.users ?? 0}</td>
                  <td className="px-4 py-3 text-sm text-center font-mono">{tenant._count?.journalEntries ?? 0}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(tenant.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        tenant.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {tenant.isActive ? "نشط" : "معطل"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      href={`/ar/admin/tenants/${tenant.id}`}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      التفاصيل
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  {tc("noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {data && data && (
          <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground">
            إجمالي {data.length} منشأة
          </div>
        )}
      </div>
    </div>
  );
}
