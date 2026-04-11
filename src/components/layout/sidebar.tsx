"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { LogoIcon } from "@/components/logo";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { LangLink } from "@/components/lang-link";
import { useState } from "react";

interface NavGroup {
  label: string;
  items: { key: string; href: string; icon: string }[];
}

const navGroups: NavGroup[] = [
  {
    label: "",
    items: [
      { key: "dashboard", href: "/dashboard", icon: "📊" },
    ],
  },
  {
    label: "المبيعات",
    items: [
      { key: "pos", href: "/pos", icon: "🖥️" },
      { key: "posRestaurant", href: "/pos/restaurant", icon: "🍽️" },
      { key: "restaurantSetup", href: "/restaurant", icon: "🍴" },
      { key: "customers", href: "/customers", icon: "👥" },
      { key: "crm", href: "/crm", icon: "🎯" },
      { key: "invoices", href: "/invoices", icon: "🧾" },
      { key: "paymentsReceived", href: "/payments?type=RECEIVED", icon: "💵" },
    ],
  },
  {
    label: "المشتريات",
    items: [
      { key: "vendors", href: "/vendors", icon: "🏪" },
      { key: "bills", href: "/bills", icon: "📃" },
      { key: "paymentsMade", href: "/payments?type=MADE", icon: "💸" },
    ],
  },
  {
    label: "المنتجات والمخزون",
    items: [
      { key: "inventory", href: "/inventory", icon: "📦" },
      { key: "production", href: "/production", icon: "🏭" },
      { key: "fixedAssets", href: "/fixed-assets", icon: "🏗️" },
      { key: "chartOfAccounts", href: "/chart-of-accounts", icon: "🌳" },
    ],
  },
  {
    label: "الموارد البشرية",
    items: [
      { key: "hr", href: "/hr", icon: "🏠" },
      { key: "employees", href: "/employees", icon: "🧑‍💼" },
      { key: "payroll", href: "/payroll", icon: "💰" },
      { key: "leaves", href: "/leaves", icon: "🏖️" },
    ],
  },
  {
    label: "المصروفات",
    items: [
      { key: "expenses", href: "/expenses", icon: "🧾" },
    ],
  },
  {
    label: "المشاريع",
    items: [
      { key: "projects", href: "/projects", icon: "📋" },
    ],
  },
  {
    label: "المحاسبة",
    items: [
      { key: "journalEntries", href: "/journal-entries", icon: "📝" },
      { key: "ledger", href: "/ledger", icon: "📖" },
      { key: "bankAccounts", href: "/bank", icon: "🏦" },
    ],
  },
  {
    label: "التقارير",
    items: [
      { key: "reports", href: "/reports", icon: "📊" },
      { key: "trialBalance", href: "/trial-balance", icon: "⚖️" },
      { key: "incomeStatement", href: "/financial-statements/income-statement", icon: "📈" },
      { key: "balanceSheet", href: "/financial-statements/balance-sheet", icon: "📋" },
      { key: "cashFlow", href: "/financial-statements/cash-flow", icon: "💧" },
      { key: "budget", href: "/budget", icon: "📝" },
      { key: "reportBuilder", href: "/report-builder", icon: "🔧" },
    ],
  },
  {
    label: "الدعم",
    items: [
      { key: "helpdesk", href: "/helpdesk", icon: "🎫" },
    ],
  },
  {
    label: "النظام",
    items: [
      { key: "whatsapp", href: "/whatsapp", icon: "💬" },
      { key: "users", href: "/users", icon: "👤" },
      { key: "branding", href: "/branding", icon: "🎨" },
      { key: "referral", href: "/referral", icon: "🎁" },
      { key: "auditLog", href: "/audit-log", icon: "📋" },
    ],
  },
  {
    label: "الإعدادات",
    items: [
      { key: "taxSettings", href: "/tax-settings", icon: "🏛️" },
      { key: "settings", href: "/settings", icon: "⚙️" },
    ],
  },
];

export function Sidebar() {
  const t = useTranslations("nav");
  const ts = useTranslations("sectors");
  const pathname = usePathname();
  const { data: session } = useSession();
  const isArabic = pathname.startsWith("/ar");
  const basePath = isArabic ? "/ar" : "/en";
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Real usage data from subscription
  const { data: usage } = trpc.subscription.getUsage.useQuery(undefined, {
    refetchInterval: 60000, // refresh every minute
  });
  const usagePercent = usage?.storagePercent ?? 0;
  const usedKB = usage?.storageUsedKB ?? 0;
  const totalKB = usage?.storageLimitKB ?? 100000;
  const daysRemaining = usage?.daysRemaining ?? 180;
  const planName = usage?.planNameAr ?? "تجربة مجانية";
  const isBlocked = usage?.isBlocked ?? false;
  const warningMessage = usage?.warningMessage ?? "";

  return (
    <>
    {/* Mobile hamburger */}
    <button onClick={() => setMobileOpen(!mobileOpen)} className="fixed top-4 right-4 z-50 lg:hidden w-10 h-10 rounded-lg bg-[#021544] flex items-center justify-center shadow-lg">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        {mobileOpen ? <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/> : <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>}
      </svg>
    </button>
    {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}
    <aside className={`w-60 min-h-screen flex flex-col fixed lg:static z-40 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`} style={{ background: "linear-gradient(180deg, #0a1628 0%, #121e38 100%)" }}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0070F2]/30 to-[#00C9A7]/20 flex items-center justify-center">
            <LogoIcon size={22} />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white">G-LEDGER</h1>
            {session?.user && (
              <span className="text-[10px] text-white/40">
                {(session.user as any).tenantName}
              </span>
            )}
          </div>
          <div className="mr-auto flex items-center gap-2"><ThemeToggle /><NotificationBell /></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            {group.label && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-5 pt-5 pb-1.5 text-[11px] font-bold text-white/40 uppercase tracking-wider hover:text-white/60 transition-colors"
              >
                <span>{group.label}</span>
                <svg
                  width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
                  className={`transition-transform ${collapsed[group.label] ? "-rotate-90" : ""}`}
                >
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </button>
            )}
            {!collapsed[group.label] &&
              group.items.map((item) => {
                const href = `${basePath}${item.href}`;
                const isActive = pathname.startsWith(href.split("?")[0]);

                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span className="text-sm w-5 text-center">{item.icon}</span>
                    <span>{t(item.key)}</span>
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      {/* Usage Meter */}
      <div className={cn(
        "mx-3 mb-3 p-3 rounded-xl border",
        isBlocked ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10"
      )}>
        {/* Blocked Banner */}
        {isBlocked && (
          <div className="text-[9px] font-bold px-2 py-1.5 rounded mb-2 text-center bg-red-500/20 text-red-300 animate-pulse">
            🚫 تم إيقاف الخدمة — اشترك الآن
          </div>
        )}

        {/* Warning Banner */}
        {!isBlocked && usagePercent >= 50 && (
          <div className={cn(
            "text-[9px] font-bold px-2 py-1 rounded mb-2 text-center",
            usagePercent >= 90 ? "bg-red-500/20 text-red-300" :
            usagePercent >= 70 ? "bg-yellow-500/20 text-yellow-300" :
            "bg-orange-500/20 text-orange-300"
          )}>
            ⚠️ استهلكت {Math.round(usagePercent)}% من المساحة
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-white/50 font-medium">الاستهلاك</span>
          <span className="text-[10px] text-white/70 font-bold">{Math.round(usagePercent)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 mb-2">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              usagePercent < 50 ? "bg-[#00C9A7]" :
              usagePercent < 70 ? "bg-yellow-400" :
              usagePercent < 90 ? "bg-orange-400" : "bg-red-400"
            )}
            style={{ width: `${Math.min(100, usagePercent)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] text-white/40">
            {usedKB >= 1024 ? `${(usedKB/1024).toFixed(1)} MB` : `${usedKB} KB`}
            {" / "}
            {totalKB >= 1048576 ? `${(totalKB/1048576).toFixed(1)} GB` : totalKB >= 1024 ? `${(totalKB/1024).toFixed(1)} MB` : `${totalKB} KB`}
          </span>
          <span className="text-[9px] text-[#00C9A7] font-medium">{planName}</span>
        </div>
        {(usage as any)?.employeeCount > 0 && (
          <div className="text-[9px] text-white/40 mt-1">
            {(usage as any).employeeCount} موظف × $2 = ${(usage as any).employeeMonthlyCost}/شهر
          </div>
        )}
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] text-white/30">
            {usage?.plan === "FREE_TRIAL" ? `متبقي ${daysRemaining} يوم` : `$${(usage as any)?.totalMonthlyCost ?? usage?.monthlyPriceUsd}/شهر`}
          </span>
          <Link href={`${basePath}/settings`} className="text-[9px] text-[#00C9A7] hover:underline font-medium">
            {isBlocked ? "اشترك الآن" : "ترقية"}
          </Link>
        </div>
      </div>

      {/* Language Toggle */}
      <div className="mx-3 mb-2">
        <LangLink variant="sidebar" />
      </div>

      {/* User */}
      {session?.user && (
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {session.user.name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{session.user.name}</div>
              <div className="text-[10px] text-white/40 truncate">
                {ts((session.user as any).sector)}
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: `${basePath}/login` })}
            className="w-full px-3 py-1.5 text-[10px] text-white/40 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors text-center"
          >
            تسجيل الخروج
          </button>
        </div>
      )}
    </aside>
    </>
  );
}
