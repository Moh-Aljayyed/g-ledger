"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const tc = useTranslations("common");

  const { data: stats, isLoading: statsLoading } = trpc.admin.getSystemStats.useQuery();
  const { data: tenantsData, isLoading: tenantsLoading } = trpc.admin.getAllTenants.useQuery();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#021544]">لوحة تحكم المدير</h1>
          <p className="text-sm text-muted-foreground mt-1">نظرة عامة على النظام</p>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="text-center py-8 text-muted-foreground">{tc("loading")}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="إجمالي المنشآت" value={stats?.totalTenants ?? 0} icon="🏢" />
          <StatCard title="إجمالي المستخدمين" value={stats?.totalUsers ?? 0} icon="👥" />
          <StatCard title="إجمالي القيود" value={stats?.totalEntries ?? 0} icon="📋" />
          <StatCard title="إجمالي الفواتير" value={stats?.totalInvoices ?? 0} icon="📄" />
        </div>
      )}

      {/* Sector Breakdown */}
      {stats?.tenantsBySector && stats.tenantsBySector.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#021544] mb-4">توزيع القطاعات</h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-border bg-muted/30">
              <div className="text-sm font-medium text-muted-foreground">القطاع</div>
              <div className="text-sm font-medium text-muted-foreground text-center">عدد المنشآت</div>
              <div className="text-sm font-medium text-muted-foreground text-end">النسبة</div>
            </div>
            {stats.tenantsBySector.map((sector: any) => {
              const percentage = stats.totalTenants
                ? ((sector.count / stats.totalTenants) * 100).toFixed(1)
                : "0";
              return (
                <div
                  key={sector.sector}
                  className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-border/50 hover:bg-muted/20"
                >
                  <div className="text-sm">{sector.sector}</div>
                  <div className="text-sm text-center font-mono">{sector.count}</div>
                  <div className="text-sm text-end">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground font-mono text-xs">{percentage}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <Link
          href="/ar/admin/tenants"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          عرض جميع المنشآت
        </Link>
        <Link
          href="/ar/admin/users"
          className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          عرض جميع المستخدمين
        </Link>
      </div>

      {/* Recent Tenants */}
      <div>
        <h2 className="text-lg font-bold text-[#021544] mb-4">آخر المنشآت المسجلة</h2>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">الاسم</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">القطاع</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">المستخدمين</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">تاريخ التسجيل</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {tenantsLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    {tc("loading")}
                  </td>
                </tr>
              ) : tenantsData && tenantsData.length > 0 ? (
                tenantsData.slice(0, 10).map((tenant: any) => (
                  <tr key={tenant.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3 text-sm font-medium">{tenant.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{tenant.sector}</td>
                    <td className="px-4 py-3 text-sm text-center font-mono">{tenant._count?.users ?? 0}</td>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    {tc("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-[#021544] font-mono">{value.toLocaleString("ar-SA")}</div>
      <div className="text-sm text-muted-foreground mt-1">{title}</div>
    </div>
  );
}
