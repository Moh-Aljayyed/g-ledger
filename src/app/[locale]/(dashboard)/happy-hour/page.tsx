"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function HappyHourPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

  const { data: rules, refetch } = trpc.restaurant.listHappyHourRules.useQuery();
  const create = trpc.restaurant.createHappyHourRule.useMutation({ onSuccess: () => refetch() });
  const toggle = trpc.restaurant.toggleHappyHourRule.useMutation({ onSuccess: () => refetch() });
  const del = trpc.restaurant.deleteHappyHourRule.useMutation({ onSuccess: () => refetch() });

  const [name, setName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("15:00");
  const [endTime, setEndTime] = useState("17:00");
  const [discountPct, setDiscountPct] = useState(20);
  const [categories, setCategories] = useState("");

  const days = isAr
    ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const t = {
    title: isAr ? "عروض الـ Happy Hour" : "Happy Hour Rules",
    subtitle: isAr
      ? "عروض تلقائية خلال أوقات محددة من اليوم"
      : "Automatic discounts during specific time windows",
    newRule: isAr ? "قاعدة جديدة" : "New Rule",
    name: isAr ? "اسم القاعدة" : "Rule Name",
    day: isAr ? "اليوم" : "Day",
    allDays: isAr ? "كل الأيام" : "Every day",
    start: isAr ? "من" : "Start",
    end: isAr ? "إلى" : "End",
    discount: isAr ? "نسبة الخصم %" : "Discount %",
    cats: isAr ? "الفئات (مفصولة بفاصلة، فارغ = كل الأصناف)" : "Categories (comma separated, empty = all)",
    add: isAr ? "إضافة" : "Add",
    enabled: isAr ? "مفعّلة" : "Enabled",
    disabled: isAr ? "معطّلة" : "Disabled",
    del: isAr ? "حذف" : "Delete",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">{t.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      {/* New rule form */}
      <div className="max-w-4xl bg-card rounded-xl border border-border p-5 mb-6">
        <h2 className="text-base font-semibold text-[#021544] mb-4">{t.newRule}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-[#021544] mb-1.5">{t.name}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAr ? "عرض العصر" : "Afternoon Deal"}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#021544] mb-1.5">{t.day}</label>
            <select
              value={dayOfWeek === null ? "" : dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value === "" ? null : parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
            >
              <option value="">{t.allDays}</option>
              {days.map((d, i) => (
                <option key={i} value={i}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#021544] mb-1.5">{t.discount}</label>
            <input
              type="number"
              min={0}
              max={100}
              value={discountPct}
              onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#021544] mb-1.5">{t.start}</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#021544] mb-1.5">{t.end}</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-[#021544] mb-1.5">{t.cats}</label>
            <input
              type="text"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder={isAr ? "مشروبات, حلويات" : "Drinks, Desserts"}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
            />
          </div>
        </div>
        <button
          onClick={() => {
            if (name) {
              create.mutate({
                name,
                dayOfWeek,
                startTime,
                endTime,
                discountPct,
                categories: categories || undefined,
              });
              setName("");
              setCategories("");
            }
          }}
          disabled={!name || create.isPending}
          className="px-5 py-2.5 bg-[#0070F2] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {t.add}
        </button>
      </div>

      {/* Rules list */}
      <div className="max-w-4xl space-y-3">
        {rules?.map((r: any) => (
          <div
            key={r.id}
            className={`bg-card rounded-xl border p-5 ${
              r.enabled ? "border-green-300" : "border-border opacity-70"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⏰</div>
                <div>
                  <h3 className="font-bold text-[#021544]">{r.name}</h3>
                  <div className="text-xs text-muted-foreground">
                    {r.dayOfWeek !== null ? days[r.dayOfWeek] : t.allDays} ·{" "}
                    {r.startTime} → {r.endTime}
                    {r.categories && ` · ${r.categories}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-mono font-bold text-green-600">
                  -{Number(r.discountPct)}%
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
              <button
                onClick={() => toggle.mutate({ id: r.id, enabled: !r.enabled })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  r.enabled
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {r.enabled ? t.enabled : t.disabled}
              </button>
              <button
                onClick={() => del.mutate({ id: r.id })}
                className="px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50"
              >
                {t.del}
              </button>
            </div>
          </div>
        ))}
        {(!rules || rules.length === 0) && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {isAr ? "لا توجد قواعد بعد — أضف أول قاعدة" : "No rules yet — add your first"}
          </div>
        )}
      </div>
    </div>
  );
}
