"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";

type Tab = "settings" | "customers" | "lookup";

export default function LoyaltyPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const [tab, setTab] = useState<Tab>("settings");

  const t = {
    title: isAr ? "برنامج الولاء" : "Loyalty Program",
    subtitle: isAr
      ? "نقاط، عضويات، وعروض تكسب بها عملاءك"
      : "Points, tiers, and rewards that keep customers coming back",
    tabs: {
      settings: isAr ? "الإعدادات" : "Settings",
      customers: isAr ? "أعلى العملاء" : "Top Customers",
      lookup: isAr ? "بحث عن عميل" : "Customer Lookup",
    },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">{t.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-border">
        {(["settings", "customers", "lookup"] as Tab[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === k
                ? "border-[#0070F2] text-[#0070F2]"
                : "border-transparent text-muted-foreground hover:text-[#021544]"
            }`}
          >
            {t.tabs[k]}
          </button>
        ))}
      </div>

      {tab === "settings" && <SettingsPanel isAr={isAr} />}
      {tab === "customers" && <TopCustomersPanel isAr={isAr} />}
      {tab === "lookup" && <LookupPanel isAr={isAr} />}
    </div>
  );
}

// ============ SETTINGS ============
function SettingsPanel({ isAr }: { isAr: boolean }) {
  const { data: settings, refetch } = trpc.loyalty.getSettings.useQuery();
  const update = trpc.loyalty.updateSettings.useMutation({ onSuccess: () => refetch() });
  const [msg, setMsg] = useState("");

  if (!settings) {
    return <div className="text-muted-foreground">{isAr ? "جاري التحميل..." : "Loading..."}</div>;
  }

  return (
    <div className="max-w-3xl space-y-4">
      {/* Enable toggle */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#021544]">
              {isAr ? "تفعيل برنامج الولاء" : "Enable Loyalty Program"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isAr
                ? "بعد التفعيل، العملاء هيكسبوا نقاط مع كل عملية شراء"
                : "Customers will earn points on every purchase"}
            </p>
          </div>
          <button
            onClick={() => update.mutate({ enabled: !settings.enabled })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.enabled ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                settings.enabled ? "right-0.5" : "right-6"
              }`}
            />
          </button>
        </div>
      </div>

      {settings.enabled && (
        <>
          {/* Earn & redeem rates */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-base font-semibold text-[#021544] mb-4">
              {isAr ? "معدل الكسب والاستبدال" : "Earn & Redeem Rates"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#021544] mb-1.5">
                  {isAr ? "نقاط لكل وحدة عملة" : "Points per currency unit"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={Number(settings.pointsPerUnit)}
                  onBlur={(e) => {
                    update.mutate({ pointsPerUnit: parseFloat(e.target.value) || 0 });
                    setMsg(isAr ? "✓ تم الحفظ" : "✓ Saved");
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm outline-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {isAr ? "مثال: 1 = نقطة لكل جنيه/ريال" : "e.g. 1 = 1 point per EGP/SAR"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#021544] mb-1.5">
                  {isAr ? "قيمة النقطة عند الاستبدال" : "Point value at redemption"}
                </label>
                <input
                  type="number"
                  step="0.001"
                  defaultValue={Number(settings.redeemValue)}
                  onBlur={(e) => {
                    update.mutate({ redeemValue: parseFloat(e.target.value) || 0 });
                    setMsg(isAr ? "✓ تم الحفظ" : "✓ Saved");
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm outline-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {isAr ? "مثال: 0.01 = كل نقطة تساوي قرش واحد" : "e.g. 0.01 = each point is worth 1 cent"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#021544] mb-1.5">
                  {isAr ? "الحد الأدنى للاستبدال (نقاط)" : "Min redeemable points"}
                </label>
                <input
                  type="number"
                  defaultValue={settings.minRedeemPoints}
                  onBlur={(e) => {
                    update.mutate({ minRedeemPoints: parseInt(e.target.value) || 0 });
                    setMsg(isAr ? "✓ تم الحفظ" : "✓ Saved");
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#021544] mb-1.5">
                  {isAr ? "صلاحية النقاط (أيام)" : "Points expiry (days)"}
                </label>
                <input
                  type="number"
                  defaultValue={settings.expiryDays ?? ""}
                  onBlur={(e) => {
                    const v = e.target.value ? parseInt(e.target.value) : null;
                    update.mutate({ expiryDays: v });
                    setMsg(isAr ? "✓ تم الحفظ" : "✓ Saved");
                  }}
                  placeholder={isAr ? "بدون انتهاء" : "No expiry"}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tiers */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-base font-semibold text-[#021544] mb-4">
              {isAr ? "حدود الفئات" : "Tier Thresholds"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: "silverThreshold" as const, label: isAr ? "🥈 فضية" : "🥈 Silver", color: "from-gray-300 to-gray-400" },
                { key: "goldThreshold" as const, label: isAr ? "🥇 ذهبية" : "🥇 Gold", color: "from-yellow-300 to-yellow-500" },
                { key: "platinumThreshold" as const, label: isAr ? "💎 بلاتينية" : "💎 Platinum", color: "from-indigo-300 to-indigo-500" },
              ].map((tier) => (
                <div key={tier.key} className="p-4 rounded-xl bg-gradient-to-br border border-border text-center">
                  <div className={`text-base font-bold mb-2`}>{tier.label}</div>
                  <input
                    type="number"
                    defaultValue={settings[tier.key]}
                    onBlur={(e) => {
                      update.mutate({ [tier.key]: parseInt(e.target.value) || 0 } as any);
                      setMsg(isAr ? "✓ تم الحفظ" : "✓ Saved");
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-white text-sm text-center font-mono outline-none"
                  />
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {isAr ? "نقطة إجمالي" : "total points"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {msg && (
        <div className="text-xs text-green-600 font-semibold">{msg}</div>
      )}
    </div>
  );
}

// ============ TOP CUSTOMERS ============
function TopCustomersPanel({ isAr }: { isAr: boolean }) {
  const { data: top } = trpc.loyalty.topCustomers.useQuery({ limit: 50 });

  const tierBadge = (tier: string) => {
    const map: Record<string, { label: string; bg: string }> = {
      PLATINUM: { label: "💎", bg: "bg-indigo-100 text-indigo-700" },
      GOLD: { label: "🥇", bg: "bg-yellow-100 text-yellow-700" },
      SILVER: { label: "🥈", bg: "bg-gray-100 text-gray-700" },
      STANDARD: { label: "⭐", bg: "bg-blue-100 text-blue-700" },
    };
    return map[tier] || map.STANDARD;
  };

  return (
    <div className="max-w-4xl">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-semibold text-[#021544]">
            {isAr ? "أعلى 50 عميل بالنقاط" : "Top 50 customers by points"}
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">#</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "العميل" : "Customer"}</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الفئة" : "Tier"}</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الرصيد" : "Balance"}</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "مكتسب" : "Earned"}</th>
            </tr>
          </thead>
          <tbody>
            {top?.map((a: any, i: number) => {
              const badge = tierBadge(a.tier);
              return (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-sm text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-[#021544]">{a.customer.nameAr}</div>
                    {a.customer.phone && <div className="text-xs text-muted-foreground font-mono">{a.customer.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${badge.bg}`}>
                      {badge.label} {a.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end font-mono font-bold text-[#0070F2]">{a.balance}</td>
                  <td className="px-4 py-3 text-end font-mono text-muted-foreground">{a.totalEarned}</td>
                </tr>
              );
            })}
            {(!top || top.length === 0) && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                  {isAr ? "لا توجد حسابات ولاء بعد" : "No loyalty accounts yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ CUSTOMER LOOKUP ============
function LookupPanel({ isAr }: { isAr: boolean }) {
  const [phone, setPhone] = useState("");
  const [searchedPhone, setSearchedPhone] = useState("");
  const { data: result } = trpc.loyalty.lookupByPhone.useQuery(
    { phone: searchedPhone },
    { enabled: !!searchedPhone },
  );
  const { data: txns } = trpc.loyalty.listTransactions.useQuery(
    { customerId: result?.customer?.id || "", limit: 20 },
    { enabled: !!result?.customer?.id },
  );

  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");
  const adjust = trpc.loyalty.adjust.useMutation({
    onSuccess: () => {
      setAdjustPoints(0);
      setAdjustReason("");
      setSearchedPhone((s) => s + " "); // trigger refetch
      setTimeout(() => setSearchedPhone((s) => s.trim()), 10);
    },
  });

  return (
    <div className="max-w-3xl space-y-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-base font-semibold text-[#021544] mb-3">
          {isAr ? "ابحث عن عميل بالهاتف" : "Find customer by phone"}
        </h2>
        <div className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={isAr ? "رقم الهاتف" : "Phone number"}
            dir="ltr"
            className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none"
            onKeyDown={(e) => e.key === "Enter" && setSearchedPhone(phone)}
          />
          <button
            onClick={() => setSearchedPhone(phone)}
            disabled={!phone}
            className="px-5 py-2.5 bg-[#0070F2] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            {isAr ? "بحث" : "Search"}
          </button>
        </div>
      </div>

      {searchedPhone && !result && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          {isAr ? "لم يتم العثور على عميل بهذا الرقم" : "No customer found with this phone"}
        </div>
      )}

      {result && (
        <>
          <div className="bg-gradient-to-br from-[#021544] to-[#0070F2] rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs text-white/70">{isAr ? "العميل" : "Customer"}</div>
                <div className="text-xl font-bold">{result.customer.nameAr}</div>
                <div className="text-sm text-white/70 font-mono mt-0.5">{result.customer.phone}</div>
              </div>
              <div className="text-xs px-3 py-1 rounded-full bg-white/20 font-bold">
                {(result.account as any)?.tier || "STANDARD"}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 rounded-lg bg-white/10">
                <div className="text-2xl font-bold font-mono">{(result.account as any)?.balance ?? 0}</div>
                <div className="text-[10px] text-white/70">{isAr ? "الرصيد" : "Balance"}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/10">
                <div className="text-2xl font-bold font-mono">{(result.account as any)?.totalEarned ?? 0}</div>
                <div className="text-[10px] text-white/70">{isAr ? "المكتسب" : "Earned"}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/10">
                <div className="text-2xl font-bold font-mono">{(result.account as any)?.totalRedeemed ?? 0}</div>
                <div className="text-[10px] text-white/70">{isAr ? "المستبدل" : "Redeemed"}</div>
              </div>
            </div>
          </div>

          {/* Manual adjust */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-[#021544] mb-3">
              {isAr ? "تعديل يدوي على النقاط" : "Manual adjustment"}
            </h3>
            <div className="flex gap-2">
              <input
                type="number"
                value={adjustPoints}
                onChange={(e) => setAdjustPoints(parseInt(e.target.value) || 0)}
                placeholder={isAr ? "النقاط (± للخصم)" : "Points (- to deduct)"}
                className="w-32 px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
              />
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder={isAr ? "السبب" : "Reason"}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
              />
              <button
                onClick={() =>
                  result?.customer?.id &&
                  adjust.mutate({
                    customerId: result.customer.id,
                    points: adjustPoints,
                    reason: adjustReason,
                  })
                }
                disabled={!adjustPoints || !adjustReason || adjust.isPending}
                className="px-4 py-2 bg-[#0070F2] text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {isAr ? "تطبيق" : "Apply"}
              </button>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-5 border-b border-border">
              <h3 className="text-sm font-semibold text-[#021544]">
                {isAr ? "آخر الحركات" : "Recent Transactions"}
              </h3>
            </div>
            <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
              {txns?.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#021544]">{tx.type}</div>
                    {tx.notes && <div className="text-[11px] text-muted-foreground truncate">{tx.notes}</div>}
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(tx.createdAt).toLocaleString(isAr ? "ar-EG" : "en-US")}
                    </div>
                  </div>
                  <div className={`font-mono font-bold text-sm ${tx.points > 0 ? "text-green-600" : "text-red-600"}`}>
                    {tx.points > 0 ? "+" : ""}
                    {tx.points}
                  </div>
                </div>
              ))}
              {(!txns || txns.length === 0) && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {isAr ? "لا توجد حركات" : "No transactions"}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
