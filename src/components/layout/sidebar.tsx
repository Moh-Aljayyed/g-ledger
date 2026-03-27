"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "dashboard", href: "", icon: "📊" },
  { key: "chartOfAccounts", href: "/chart-of-accounts", icon: "🌳" },
  { key: "journalEntries", href: "/journal-entries", icon: "📝" },
  { key: "ledger", href: "/ledger", icon: "📖" },
  { key: "trialBalance", href: "/trial-balance", icon: "⚖️" },
  { key: "incomeStatement", href: "/financial-statements/income-statement", icon: "💰" },
  { key: "balanceSheet", href: "/financial-statements/balance-sheet", icon: "📋" },
  { key: "settings", href: "/settings", icon: "⚙️" },
];

export function Sidebar() {
  const t = useTranslations("nav");
  const ts = useTranslations("sectors");
  const pathname = usePathname();
  const { data: session } = useSession();
  const basePath = "/ar";

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-e border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">GL</span>
          </div>
          <div>
            <h1 className="font-bold text-sm">المحاسب العام</h1>
            {session?.user && (
              <span className="text-xs text-muted-foreground">
                {ts((session.user as any).sector)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive =
            item.href === ""
              ? pathname === basePath || pathname === `${basePath}/`
              : pathname.startsWith(href);

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-muted"
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
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
