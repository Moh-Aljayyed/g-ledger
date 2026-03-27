"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const adminNav = [
  { label: "لوحة التحكم", href: "/ar/admin", icon: "📊" },
  { label: "المنشآت", href: "/ar/admin/tenants", icon: "🏢" },
  { label: "المستخدمون", href: "/ar/admin/users", icon: "👥" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Skip auth check on login page
    if (pathname.includes("/admin/login")) {
      setIsAuth(true);
      return;
    }

    const token = localStorage.getItem("adminToken");
    const name = localStorage.getItem("adminName");
    if (!token) {
      router.push("/ar/admin/login");
    } else {
      setIsAuth(true);
      setAdminName(name || "Admin");
    }
  }, [pathname, router]);

  // Login page - no layout
  if (pathname.includes("/admin/login")) {
    return <>{children}</>;
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Admin Sidebar */}
      <aside className="w-60 min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #0a1628 0%, #121e38 100%)" }}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#ef4444"/>
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">G-LEDGER</h1>
              <span className="text-[10px] text-red-400">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin User */}
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-red-400 text-xs font-bold">{adminName[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{adminName}</div>
              <div className="text-[10px] text-red-400">Super Admin</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="flex-1 px-2 py-1.5 text-[10px] text-white/40 hover:text-white hover:bg-white/5 rounded text-center transition-colors">
              الموقع
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminName");
                router.push("/ar/admin/login");
              }}
              className="flex-1 px-2 py-1.5 text-[10px] text-white/40 hover:text-red-400 hover:bg-white/5 rounded text-center transition-colors"
            >
              خروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        {/* Top Bar */}
        <div className="bg-white border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            لوحة تحكم المدير — G-Ledger Admin
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
