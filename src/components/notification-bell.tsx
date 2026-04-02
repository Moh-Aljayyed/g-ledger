"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const basePath = isAr ? "/ar" : "/en";

  const { data: notifications } = trpc.notifications.getAll.useQuery(undefined, { refetchInterval: 60000 });
  const { data: count } = trpc.notifications.getCount.useQuery(undefined, { refetchInterval: 30000 });

  const severityStyles = {
    danger: "border-red-200 bg-red-50",
    warning: "border-amber-200 bg-amber-50",
    info: "border-blue-200 bg-blue-50",
  };

  const severityIcons = { danger: "🔴", warning: "🟡", info: "🔵" };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.7"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
        {(count || 0) > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-2xl border border-border z-50 overflow-hidden">
            <div className="px-4 py-3 bg-[#021544] text-white flex items-center justify-between">
              <span className="text-sm font-bold">{isAr ? "التنبيهات" : "Notifications"}</span>
              <span className="text-xs text-white/60">{notifications?.length || 0}</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {(!notifications || notifications.length === 0) ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {isAr ? "لا توجد تنبيهات" : "No notifications"}
                </div>
              ) : (
                notifications.map((n) => (
                  <Link key={n.id} href={`${basePath}${n.link}`} onClick={() => setOpen(false)}
                    className={`block px-4 py-3 border-b last:border-0 hover:bg-muted/30 transition-colors ${severityStyles[n.severity]}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">{severityIcons[n.severity]}</span>
                      <div>
                        <p className="text-sm font-bold text-[#021544]">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.message}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
