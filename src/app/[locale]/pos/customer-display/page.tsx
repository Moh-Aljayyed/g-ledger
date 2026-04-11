"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";

/**
 * Customer Display — full-screen second-monitor view.
 * Shows the currently "pinned" tab (by tabNumber query param, or the
 * most recent OPEN tab) as a big, customer-friendly readout of the
 * bill. Intended to live on a second HDMI monitor facing the guest.
 *
 * URL: /pos/customer-display?tab=42
 */
export default function CustomerDisplayPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const [pinnedTabNumber, setPinnedTabNumber] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("tab");
    if (t) setPinnedTabNumber(parseInt(t));
  }, []);

  // Clock tick for the header time
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Poll every 2 seconds for the latest tab state
  const { data: openTabs } = trpc.restaurant.listOpenTabs.useQuery(undefined, {
    refetchInterval: 2000,
  });

  const currentTab = openTabs
    ? pinnedTabNumber
      ? openTabs.find((t: any) => t.tabNumber === pinnedTabNumber)
      : openTabs[0]
    : null;

  const t = {
    welcome: isAr ? "مرحباً بك" : "Welcome",
    waiting: isAr ? "في انتظار فتح حساب..." : "Waiting for a tab to open...",
    order: isAr ? "طلبك" : "Your Order",
    subtotal: isAr ? "المجموع" : "Subtotal",
    vat: isAr ? "الضريبة" : "VAT",
    total: isAr ? "الإجمالي" : "TOTAL",
    thanks: isAr ? "شكراً لاختياركم لنا" : "Thank you for choosing us",
    table: isAr ? "طاولة" : "Table",
  };

  const timeStr = new Date(now).toLocaleTimeString(isAr ? "ar-EG" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      className="min-h-screen text-white overflow-hidden"
      style={{ background: "linear-gradient(135deg, #021544 0%, #0a2a6e 50%, #0070F2 100%)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Decorative background */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-8 flex items-center justify-between">
          <div className="text-5xl font-bold">G-Ledger</div>
          <div className="text-2xl font-mono text-white/80 tabular-nums">{timeStr}</div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-8 pb-8 flex flex-col">
          {!currentTab ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-8xl mb-6">🍽️</div>
              <h1 className="text-6xl font-bold mb-3">{t.welcome}</h1>
              <p className="text-xl text-white/60">{t.waiting}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
              {/* Tab header */}
              <div className="text-center mb-6">
                <div className="text-xs text-white/50 uppercase tracking-wider mb-1">
                  #{currentTab.tabNumber}
                  {currentTab.table && ` · ${t.table} ${currentTab.table.name}`}
                </div>
                <h1 className="text-4xl font-bold">{t.order}</h1>
                {currentTab.customerName && (
                  <p className="text-lg text-white/70 mt-2">{currentTab.customerName}</p>
                )}
              </div>

              {/* Items list */}
              <div className="flex-1 overflow-y-auto mb-6 bg-white/5 rounded-3xl p-6 backdrop-blur-sm">
                {currentTab.items.length === 0 ? (
                  <div className="text-center text-white/50 py-12 text-lg">
                    {isAr ? "لم يتم إضافة أصناف بعد" : "No items added yet"}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentTab.items
                      .filter((i: any) => i.status !== "VOIDED")
                      .map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-3 px-4 rounded-2xl bg-white/5 border border-white/10"
                        >
                          <div className="flex-1">
                            <div className="text-xl font-bold">{item.product.nameAr}</div>
                            {item.notes && (
                              <div className="text-sm text-white/60 italic">{item.notes}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-lg font-mono text-white/70">
                              ×{Number(item.quantity)}
                            </div>
                            <div className="text-xl font-mono font-bold min-w-[100px] text-end">
                              {Number(item.totalPrice).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="bg-white rounded-3xl p-8 text-[#021544] shadow-2xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xl">
                    <span className="text-muted-foreground">{t.subtotal}</span>
                    <span className="font-mono font-semibold">{Number(currentTab.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xl">
                    <span className="text-muted-foreground">{t.vat}</span>
                    <span className="font-mono font-semibold">{Number(currentTab.vatAmount).toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-dashed border-border/50 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold">{t.total}</span>
                      <span className="text-5xl font-mono font-bold text-[#0070F2]">
                        {Number(currentTab.total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-sm text-white/40">
          {t.thanks}
        </footer>
      </div>
    </div>
  );
}
