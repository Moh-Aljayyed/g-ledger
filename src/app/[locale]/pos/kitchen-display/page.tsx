"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

/**
 * Kitchen Display System — full-screen dark UI for the kitchen.
 * Auto-polls every 4 seconds. Shows items grouped by station with a
 * live timer. Chef taps "Ready" to bump an item; waiter taps "Served"
 * to clear it from the screen.
 */
export default function KDSPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const [stationFilter, setStationFilter] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Tick every second for live timers (doesn't hit the network)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data: stations } = trpc.restaurant.listStations.useQuery();
  const { data: items, refetch } = trpc.restaurant.kdsQueue.useQuery(
    stationFilter ? { stationId: stationFilter } : undefined,
    { refetchInterval: 4000 },
  );

  const markReady = trpc.restaurant.kdsMarkReady.useMutation({ onSuccess: () => refetch() });
  const markServed = trpc.restaurant.kdsMarkServed.useMutation({ onSuccess: () => refetch() });

  const sentItems = useMemo(
    () => (items ?? []).filter((i: any) => i.status === "SENT"),
    [items],
  );
  const readyItems = useMemo(
    () => (items ?? []).filter((i: any) => i.status === "READY"),
    [items],
  );

  const t = {
    title: isAr ? "شاشة المطبخ" : "Kitchen Display",
    all: isAr ? "الكل" : "All",
    sent: isAr ? "قيد التحضير" : "In Progress",
    ready: isAr ? "جاهز" : "Ready",
    noItems: isAr ? "لا توجد طلبات حالياً" : "No orders in queue",
    ready_btn: isAr ? "جاهز ✓" : "READY ✓",
    served_btn: isAr ? "تم التقديم" : "Served",
    table: isAr ? "طاولة" : "Table",
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white" dir="ltr">
      {/* Header */}
      <header className="bg-[#111827] border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${isAr ? "ar" : "en"}/dashboard`} className="text-sm text-white/60 hover:text-white">
              ← Dashboard
            </Link>
            <div className="h-6 w-px bg-white/20" />
            <h1 className="text-2xl font-bold flex items-center gap-2">
              🍳 <span>{t.title}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-white/60">
              <span className="text-orange-400 font-bold">{sentItems.length}</span> {t.sent}
              {" · "}
              <span className="text-green-400 font-bold">{readyItems.length}</span> {t.ready}
            </div>
            <div className="font-mono text-xs text-white/40">
              {new Date(now).toLocaleTimeString(isAr ? "ar-EG" : "en-US")}
            </div>
          </div>
        </div>

        {/* Station filter */}
        <div className="max-w-full px-6 pb-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setStationFilter(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
              stationFilter === null ? "bg-white text-[#0a0e1a]" : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            {t.all}
          </button>
          {stations?.map((s: any) => (
            <button
              key={s.id}
              onClick={() => setStationFilter(s.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
                stationFilter === s.id ? "text-white" : "text-white/70 hover:text-white"
              }`}
              style={{
                backgroundColor: stationFilter === s.id ? s.displayColor || "#0070F2" : "rgba(255,255,255,0.08)",
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.displayColor || "#0070F2" }} />
              {s.name}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-full p-6">
        {sentItems.length === 0 && readyItems.length === 0 ? (
          <div className="text-center py-32 text-white/40">
            <div className="text-6xl mb-4">🍽️</div>
            <div className="text-xl font-semibold">{t.noItems}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* In Progress (orange) */}
            {sentItems.map((item: any) => (
              <KDSCard
                key={item.id}
                item={item}
                now={now}
                onAction={() => markReady.mutate({ itemId: item.id })}
                actionLabel={t.ready_btn}
                actionColor="bg-green-500 hover:bg-green-600"
                isAr={isAr}
                status="sent"
              />
            ))}

            {/* Ready (green) */}
            {readyItems.map((item: any) => (
              <KDSCard
                key={item.id}
                item={item}
                now={now}
                onAction={() => markServed.mutate({ itemId: item.id })}
                actionLabel={t.served_btn}
                actionColor="bg-blue-500 hover:bg-blue-600"
                isAr={isAr}
                status="ready"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function KDSCard({
  item,
  now,
  onAction,
  actionLabel,
  actionColor,
  isAr,
  status,
}: {
  item: any;
  now: number;
  onAction: () => void;
  actionLabel: string;
  actionColor: string;
  isAr: boolean;
  status: "sent" | "ready";
}) {
  const sentAt = item.sentAt ? new Date(item.sentAt).getTime() : now;
  const elapsed = Math.floor((now - sentAt) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  // Color by urgency (only for "sent" items)
  const urgency =
    status === "ready" ? "ready" : elapsed > 600 ? "critical" : elapsed > 300 ? "warning" : "normal";

  const bgColor = {
    ready: "bg-green-900/50 border-green-500",
    critical: "bg-red-900/50 border-red-500 animate-pulse",
    warning: "bg-yellow-900/50 border-yellow-500",
    normal: "bg-orange-900/40 border-orange-500",
  }[urgency];

  const stationBadge = item.station
    ? { name: item.station.name, color: item.station.displayColor || "#0070F2" }
    : null;

  return (
    <div className={`${bgColor} border-2 rounded-2xl p-4 shadow-xl`}>
      {/* Header: tab / table / order type */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs text-white/60 font-semibold">
            {item.tab.table ? `🪑 ${isAr ? "طاولة" : "Table"} ${item.tab.table.name}` : item.tab.orderType === "TAKEAWAY" ? "🛍️ Takeaway" : "🛵 Delivery"}
          </div>
          <div className="text-sm font-bold text-white mt-0.5">#{item.tab.tabNumber}</div>
        </div>
        <div className="font-mono text-lg font-bold text-white tabular-nums">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
      </div>

      {/* Station badge */}
      {stationBadge && (
        <div
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white mb-2"
          style={{ backgroundColor: stationBadge.color }}
        >
          {stationBadge.name}
        </div>
      )}

      {/* Product name + quantity */}
      <div className="mb-3">
        <div className="text-xl font-bold text-white leading-tight" dir={isAr ? "rtl" : "ltr"}>
          <span className="text-white/60 mr-2">{Number(item.quantity)}×</span>
          {item.product.nameAr}
        </div>
      </div>

      {/* Modifiers */}
      {item.modifiers && Array.isArray(item.modifiers) && item.modifiers.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {item.modifiers.map((m: any, i: number) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/80">
              + {m.name}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {item.notes && (
        <div className="mb-3 text-xs text-yellow-300 italic bg-yellow-900/30 px-2 py-1 rounded">
          ⚠️ {item.notes}
        </div>
      )}

      {/* Action button */}
      <button
        onClick={onAction}
        className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all ${actionColor}`}
      >
        {actionLabel}
      </button>
    </div>
  );
}
