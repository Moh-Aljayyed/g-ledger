"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

const COUNTRY_FLAGS: Record<string, string> = {
  SA: "🇸🇦", AE: "🇦🇪", EG: "🇪🇬", KW: "🇰🇼", QA: "🇶🇦", BH: "🇧🇭", OM: "🇴🇲",
  JO: "🇯🇴", LB: "🇱🇧", IQ: "🇮🇶", MA: "🇲🇦", TN: "🇹🇳", DZ: "🇩🇿", LY: "🇱🇾",
  SD: "🇸🇩", YE: "🇾🇪", SY: "🇸🇾", PS: "🇵🇸", US: "🇺🇸", GB: "🇬🇧", TR: "🇹🇷",
};

const SECTOR_AR: Record<string, string> = {
  INDUSTRIAL: "صناعي",
  COMMERCIAL: "تجاري",
  SERVICES: "خدمي",
  BANKING: "بنوك ومالي",
  INSURANCE: "تأمين",
  REAL_ESTATE: "عقاري",
  CONTRACTING: "مقاولات",
  AGRICULTURAL: "زراعي",
  TECHNOLOGY: "تقني / SaaS",
  NON_PROFIT: "غير ربحي",
  CROWDFUNDING: "تمويل جماعي",
  MEDICAL_HOSPITAL: "طبي - مستشفيات",
  MEDICAL_PHARMACY: "طبي - صيدليات",
  MEDICAL_CLINIC: "طبي - عيادات",
  MEDICAL_LAB: "طبي - معامل",
};

export default function SuperAdminDashboard() {
  const tc = useTranslations("common");

  const { data: stats, isLoading: statsLoading } = trpc.admin.getSystemStats.useQuery();
  const { data: tenantsData, isLoading: tenantsLoading } = trpc.admin.getAllTenants.useQuery();

  const [searchQuery, setSearchQuery] = useState("");

  const tenants = tenantsData ?? [];

  const filteredTenants = useMemo(() => {
    if (!searchQuery) return tenants;
    const q = searchQuery.toLowerCase();
    return tenants.filter((t: any) => t.name?.toLowerCase().includes(q));
  }, [tenants, searchQuery]);

  // Calculate derived stats
  const totalRevenue = useMemo(() => {
    return tenants.reduce((sum: number, t: any) => sum + (t.monthlyPriceUsd ?? 0), 0);
  }, [tenants]);

  const totalStorageUsed = useMemo(() => {
    return tenants.reduce((sum: number, t: any) => sum + (t.storageUsedKB ?? 0), 0);
  }, [tenants]);

  // Sector breakdown
  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tenants.forEach((t: any) => {
      const sector = t.sector ?? "UNKNOWN";
      counts[sector] = (counts[sector] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([sector, count]) => ({ sector, count }))
      .sort((a, b) => b.count - a.count);
  }, [tenants]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#021544]">لوحة تحكم المدير</h1>
          <p className="text-sm text-muted-foreground mt-1">نظرة عامة شاملة على النظام</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/ar/admin/tenants"
            className="px-4 py-2 bg-[#021544] text-white rounded-xl text-sm font-medium hover:bg-[#021544]/90 transition-colors"
          >
            إدارة المنشآت
          </Link>
          <Link
            href="/ar/admin/users"
            className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
          >
            إدارة المستخدمين
          </Link>
        </div>
      </div>

      {/* Stats Row - 4 Cards */}
      {statsLoading ? (
        <div className="text-center py-8 text-muted-foreground">{tc("loading")}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="إجمالي المنشآت"
            value={stats?.totalTenants ?? 0}
            icon="🏢"
            gradient="from-blue-500/10 to-blue-500/5"
            borderColor="border-blue-200"
          />
          <StatCard
            title="إجمالي المستخدمين"
            value={stats?.totalUsers ?? 0}
            icon="👥"
            gradient="from-green-500/10 to-green-500/5"
            borderColor="border-green-200"
          />
          <StatCard
            title="إجمالي الإيرادات (شهري)"
            value={`$${totalRevenue.toLocaleString("en-US")}`}
            icon="💰"
            gradient="from-purple-500/10 to-purple-500/5"
            borderColor="border-purple-200"
            isText
          />
          <StatCard
            title="التخزين المستخدم"
            value={totalStorageUsed >= 1024 ? `${(totalStorageUsed / 1024).toFixed(1)} MB` : `${totalStorageUsed} KB`}
            icon="💾"
            gradient="from-amber-500/10 to-amber-500/5"
            borderColor="border-amber-200"
            isText
          />
        </div>
      )}

      {/* Quick Stats Per Sector */}
      {sectorCounts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#021544] mb-4">توزيع القطاعات</h2>
          <div className="flex flex-wrap gap-2">
            {sectorCounts.map(({ sector, count }) => (
              <div
                key={sector}
                className="inline-flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border"
              >
                <span className="text-sm font-medium">{SECTOR_AR[sector] ?? sector}</span>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#021544] text-white text-xs font-bold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المنشأة..."
            className="w-full px-4 py-2.5 pr-10 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021544]/20"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredTenants.length} منشأة
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">المنشأة</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">القطاع</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الدولة</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">المستخدمين</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">التخزين</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الاستخدام %</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الخطة</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الأيام المتبقية</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">السعر/شهر</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الحالة</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {tenantsLoading ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-muted-foreground">
                    {tc("loading")}
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-muted-foreground">
                    {tc("noData")}
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant: any) => {
                  const usagePercent = tenant.usagePercent ?? 0;
                  const usageBarColor =
                    usagePercent >= 80 ? "bg-red-500" :
                    usagePercent >= 50 ? "bg-yellow-500" :
                    "bg-green-500";
                  const usageTextColor =
                    usagePercent >= 80 ? "text-red-700" :
                    usagePercent >= 50 ? "text-yellow-700" :
                    "text-green-700";

                  const isBlocked = tenant.isBlocked;
                  const planLabel = tenant.plan === "FREE_TRIAL" ? "تجربة مجانية" : "مشترك";
                  const planBg = tenant.plan === "FREE_TRIAL" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700";

                  return (
                    <tr key={tenant.id} className="border-b border-border/50 hover:bg-muted/20">
                      {/* Company name */}
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{tenant.name}</div>
                      </td>

                      {/* Sector (Arabic) */}
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {SECTOR_AR[tenant.sector] ?? tenant.sector}
                      </td>

                      {/* Country (flag) */}
                      <td className="px-4 py-3 text-center text-lg">
                        {COUNTRY_FLAGS[tenant.country] ?? tenant.country ?? "-"}
                      </td>

                      {/* Users count */}
                      <td className="px-4 py-3 text-center text-sm font-mono">
                        {tenant.userCount ?? 0}
                      </td>

                      {/* Storage used KB / limit KB */}
                      <td className="px-4 py-3 text-center">
                        <div className="text-xs font-mono text-muted-foreground">
                          {tenant.storageUsedKB ?? 0} / {tenant.storageLimitKB ?? 0} KB
                        </div>
                      </td>

                      {/* Usage % with colored bar */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all", usageBarColor)}
                              style={{ width: `${Math.min(100, usagePercent)}%` }}
                            />
                          </div>
                          <span className={cn("text-xs font-mono font-medium", usageTextColor)}>
                            {usagePercent}%
                          </span>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3 text-center">
                        <span className={cn("inline-flex px-2 py-0.5 rounded text-[11px] font-medium", planBg)}>
                          {planLabel}
                        </span>
                      </td>

                      {/* Days remaining */}
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "text-sm font-mono",
                          tenant.daysRemaining <= 7 ? "text-red-600 font-bold" :
                          tenant.daysRemaining <= 30 ? "text-yellow-600" :
                          "text-muted-foreground"
                        )}>
                          {tenant.daysRemaining}
                        </span>
                      </td>

                      {/* Monthly price */}
                      <td className="px-4 py-3 text-center text-sm font-mono">
                        ${tenant.monthlyPriceUsd ?? 0}
                      </td>

                      {/* Status (ACTIVE/BLOCKED badge) */}
                      <td className="px-4 py-3 text-center">
                        {isBlocked ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                            محظور
                          </span>
                        ) : tenant.subscriptionStatus === "ACTIVE" ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                            نشط
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {tenant.subscriptionStatus}
                          </span>
                        )}
                      </td>

                      {/* Created date */}
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(tenant.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  borderColor,
  isText,
}: {
  title: string;
  value: number | string;
  icon: string;
  gradient: string;
  borderColor: string;
  isText?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border p-5 bg-gradient-to-br", gradient, borderColor)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-[#021544] font-mono">
        {isText ? value : (value as number).toLocaleString("ar-SA")}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{title}</div>
    </div>
  );
}
