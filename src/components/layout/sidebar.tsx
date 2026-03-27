"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavGroup {
  label: string;
  items: { key: string; href: string; icon: string }[];
}

const navGroups: NavGroup[] = [
  {
    label: "main",
    items: [
      { key: "dashboard", href: "", icon: "📊" },
    ],
  },
  {
    label: "accounting",
    items: [
      { key: "chartOfAccounts", href: "/chart-of-accounts", icon: "🌳" },
      { key: "journalEntries", href: "/journal-entries", icon: "📝" },
      { key: "ledger", href: "/ledger", icon: "📖" },
    ],
  },
  {
    label: "sales",
    items: [
      { key: "customers", href: "/customers", icon: "👥" },
      { key: "invoices", href: "/invoices", icon: "🧾" },
      { key: "paymentsReceived", href: "/payments?type=RECEIVED", icon: "💵" },
    ],
  },
  {
    label: "purchases",
    items: [
      { key: "vendors", href: "/vendors", icon: "🏪" },
      { key: "bills", href: "/bills", icon: "📃" },
      { key: "paymentsMade", href: "/payments?type=MADE", icon: "💸" },
    ],
  },
  {
    label: "hr",
    items: [
      { key: "employees", href: "/employees", icon: "🧑‍💼" },
      { key: "payroll", href: "/payroll", icon: "💰" },
    ],
  },
  {
    label: "banking",
    items: [
      { key: "bankAccounts", href: "/bank", icon: "🏦" },
    ],
  },
  {
    label: "reportsGroup",
    items: [
      { key: "trialBalance", href: "/trial-balance", icon: "⚖️" },
      { key: "incomeStatement", href: "/financial-statements/income-statement", icon: "📈" },
      { key: "balanceSheet", href: "/financial-statements/balance-sheet", icon: "📋" },
    ],
  },
  {
    label: "system",
    items: [
      { key: "taxSettings", href: "/tax-settings", icon: "🏛️" },
      { key: "settings", href: "/settings", icon: "⚙️" },
    ],
  },
];

const groupLabels: Record<string, string> = {
  main: "",
  accounting: "المحاسبة",
  sales: "المبيعات والعملاء",
  purchases: "المشتريات والموردين",
  hr: "الموارد البشرية",
  banking: "البنوك والنقدية",
  reportsGroup: "التقارير",
  system: "النظام",
};

export function Sidebar() {
  const t = useTranslations("nav");
  const ts = useTranslations("sectors");
  const pathname = usePathname();
  const { data: session } = useSession();
  const basePath = "/ar";
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-e border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#021544] to-[#0070F2] flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xs">GL</span>
          </div>
          <div>
            <h1 className="font-bold text-sm text-[#021544]">G-Ledger</h1>
            {session?.user && (
              <span className="text-[10px] text-muted-foreground">
                {ts((session.user as any).sector)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className={group.label !== "main" ? "mt-4" : ""}>
            {groupLabels[group.label] && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              >
                <span>{groupLabels[group.label]}</span>
                <span className="text-[8px]">{collapsed[group.label] ? "◂" : "▾"}</span>
              </button>
            )}
            {!collapsed[group.label] &&
              group.items.map((item) => {
                const href = `${basePath}${item.href}`;
                const isActive =
                  item.href === ""
                    ? pathname === basePath || pathname === `${basePath}/`
                    : pathname.startsWith(href.split("?")[0]);

                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-sidebar-foreground hover:bg-muted"
                    )}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-xs">{t(item.key)}</span>
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      {/* User */}
      {session?.user && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-sm font-bold">
                {session.user.name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{session.user.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {(session.user as any).tenantName}
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/ar/login" })}
            className="w-full px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      )}
    </aside>
  );
}
