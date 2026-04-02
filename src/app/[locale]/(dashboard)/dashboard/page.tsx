"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const ts = useTranslations("sectors");
  const { data: session } = useSession();
  const { data, isLoading } = trpc.reports.dashboard.useQuery();
  const { data: usage } = trpc.subscription.getUsage.useQuery();
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

  const currency = (session?.user as any)?.currency ?? "SAR";
  const sector = (session?.user as any)?.sector ?? "COMMERCIAL";
  const tenantName = (session?.user as any)?.tenantName ?? "";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 mb-6 text-white" style={{ background: "linear-gradient(135deg, #021544, #0070F2)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {isAr ? "مرحبًا،" : "Welcome,"} {session?.user?.name}
            </h1>
            <p className="text-white/60 text-sm">
              {tenantName} — {ts(sector)}
            </p>
            {(session?.user as any)?.slug && (
              <div className="text-xs text-white/50 mt-1">
                {(session?.user as any).slug}.g-ledger.com
              </div>
            )}
          </div>
          <div className="text-end">
            <div className="text-xs text-white/40 mb-1">
              {new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            {usage?.plan === "FREE_TRIAL" && (
              <div className="text-xs text-[#00C9A7]">
                {isAr ? `تجربة مجانية — متبقي ${usage.daysRemaining} يوم` : `Free trial — ${usage.daysRemaining} days remaining`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title={t("totalRevenue")}
          value={formatCurrency(data?.totalRevenue ?? 0, currency)}
          icon="💰"
          borderColor="border-t-green-500"
          textColor="text-green-600"
        />
        <StatCard
          title={t("totalExpenses")}
          value={formatCurrency(data?.totalExpenses ?? 0, currency)}
          icon="📉"
          borderColor="border-t-red-500"
          textColor="text-red-600"
        />
        <StatCard
          title={t("netProfit")}
          value={formatCurrency(data?.netProfit ?? 0, currency)}
          icon="📊"
          borderColor={(data?.netProfit ?? 0) >= 0 ? "border-t-blue-500" : "border-t-red-500"}
          textColor={(data?.netProfit ?? 0) >= 0 ? "text-blue-600" : "text-red-600"}
        />
        <StatCard
          title={t("entriesCount")}
          value={String(data?.entriesCount ?? 0)}
          icon="📝"
          borderColor="border-t-gray-400"
          textColor="text-[#021544]"
          subtitle={isAr ? `${data?.accountsCount ?? 0} حساب` : `${data?.accountsCount ?? 0} accounts`}
        />
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "وصول سريع" : "Quick Access"}</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: isAr ? "قيد جديد" : "New Entry", href: isAr ? "/ar/journal-entries" : "/en/journal-entries", icon: "📝", color: "bg-blue-50 text-blue-700" },
              { label: isAr ? "فاتورة جديدة" : "New Invoice", href: isAr ? "/ar/invoices/create" : "/en/invoices/create", icon: "🧾", color: "bg-green-50 text-green-700" },
              { label: isAr ? "تحصيل دفعة" : "Receive Payment", href: isAr ? "/ar/payments?type=RECEIVED" : "/en/payments?type=RECEIVED", icon: "💵", color: "bg-emerald-50 text-emerald-700" },
              { label: isAr ? "ميزان المراجعة" : "Trial Balance", href: isAr ? "/ar/trial-balance" : "/en/trial-balance", icon: "⚖️", color: "bg-purple-50 text-purple-700" },
              { label: isAr ? "شجرة الحسابات" : "Chart of Accounts", href: isAr ? "/ar/chart-of-accounts" : "/en/chart-of-accounts", icon: "🌳", color: "bg-cyan-50 text-cyan-700" },
              { label: isAr ? "إضافة موظف" : "Add Employee", href: isAr ? "/ar/employees" : "/en/employees", icon: "🧑‍💼", color: "bg-orange-50 text-orange-700" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex items-center gap-3 p-3 rounded-lg ${action.color} hover:shadow-md transition-all`}
              >
                <span className="text-lg">{action.icon}</span>
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Subscription & Usage */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "الاشتراك والاستهلاك" : "Subscription & Usage"}</h2>
          {usage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isAr ? "الباقة" : "Plan"}</span>
                <span className="text-sm font-bold text-[#0070F2]">{usage.planNameAr}</span>
              </div>

              {/* Storage */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{isAr ? "التخزين" : "Storage"}</span>
                  <span className="text-xs font-medium">{usage.storageUsedMB} MB / {usage.storageLimitMB} MB</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usage.storagePercent < 50 ? "bg-[#00C9A7]" :
                      usage.storagePercent < 80 ? "bg-yellow-400" : "bg-red-400"
                    }`}
                    style={{ width: `${Math.min(100, usage.storagePercent)}%` }}
                  />
                </div>
              </div>

              {/* Users */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isAr ? "المستخدمين" : "Users"}</span>
                <span className="text-sm">{usage.currentUsers} / {usage.maxUsers}</span>
              </div>

              {/* Days */}
              {usage.plan === "FREE_TRIAL" && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{isAr ? "أيام متبقية" : "Days remaining"}</span>
                  <span className={`text-sm font-bold ${usage.daysRemaining < 30 ? "text-red-500" : "text-green-600"}`}>
                    {isAr ? `${usage.daysRemaining} يوم` : `${usage.daysRemaining} days`}
                  </span>
                </div>
              )}

              {/* Records */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isAr ? "السجلات" : "Records"}</span>
                <span className="text-sm">{usage.totalRecords}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#021544]">{isAr ? "آخر القيود" : "Recent Entries"}</h2>
          <Link href={isAr ? "/ar/journal-entries" : "/en/journal-entries"} className="text-xs text-[#0070F2] hover:underline">
            {isAr ? "عرض الكل" : "View All"}
          </Link>
        </div>
        {data?.recentEntries && data.recentEntries.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-start pb-2 font-medium">{isAr ? "رقم القيد" : "Entry No."}</th>
                <th className="text-start pb-2 font-medium">{isAr ? "التاريخ" : "Date"}</th>
                <th className="text-start pb-2 font-medium">{isAr ? "الوصف" : "Description"}</th>
                <th className="text-center pb-2 font-medium">{isAr ? "الحالة" : "Status"}</th>
                <th className="text-end pb-2 font-medium">{isAr ? "المبلغ" : "Amount"}</th>
              </tr>
            </thead>
            <tbody>
              {data.recentEntries.map((entry) => {
                const total = entry.lines.reduce((sum, l) => sum + Number(l.debit), 0);
                return (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 text-sm font-mono">{entry.entryNumber}</td>
                    <td className="py-2.5 text-sm">{formatDate(entry.date)}</td>
                    <td className="py-2.5 text-sm">{entry.description}</td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${
                        entry.status === "POSTED" ? "bg-green-50 text-green-700" :
                        entry.status === "DRAFT" ? "bg-gray-100 text-gray-600" :
                        "bg-red-50 text-red-700"
                      }`}>
                        {entry.status === "POSTED" ? (isAr ? "مرحّل" : "Posted") : entry.status === "DRAFT" ? (isAr ? "مسودة" : "Draft") : (isAr ? "معكوس" : "Reversed")}
                      </span>
                    </td>
                    <td className="py-2.5 text-sm text-end font-mono">
                      {formatCurrency(total, currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {isAr ? "لا توجد قيود بعد. ابدأ بإنشاء أول قيد يومي." : "No entries yet. Start by creating your first journal entry."}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  borderColor,
  textColor,
  subtitle,
}: {
  title: string;
  value: string;
  icon: string;
  borderColor: string;
  textColor: string;
  subtitle?: string;
}) {
  return (
    <div className={`bg-card rounded-xl border border-border shadow-sm p-5 border-t-4 ${borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      )}
    </div>
  );
}
