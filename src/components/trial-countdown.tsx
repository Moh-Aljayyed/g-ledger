"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Free trial promo expires at the end of April 2026 (Riyadh time, 23:59:59 +03)
const PROMO_END_ISO = "2026-04-30T23:59:59+03:00";

type Remaining = { days: number; hours: number; minutes: number; seconds: number; expired: boolean };

function compute(): Remaining {
  const diff = new Date(PROMO_END_ISO).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, expired: false };
}

export function TrialCountdown() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const [t, setT] = useState<Remaining | null>(null);

  useEffect(() => {
    setT(compute());
    const id = setInterval(() => setT(compute()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!t || t.expired) return null;

  const labels = isAr
    ? { days: "يوم", hours: "ساعة", minutes: "دقيقة", seconds: "ثانية" }
    : { days: "days", hours: "hrs", minutes: "min", seconds: "sec" };

  return (
    <div className="mt-6 inline-flex flex-col items-center max-w-2xl mx-auto bg-gradient-to-r from-[#fff8e7] via-[#fffbf0] to-[#fff8e7] border-2 border-[#c9a14a]/40 rounded-2xl px-5 py-4 shadow-md">
      {/* Headline */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#c9a14a] text-white text-[10px] md:text-xs font-bold uppercase tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          {isAr ? "العرض على وشك الانتهاء" : "Offer Ending Soon"}
        </span>
      </div>

      <p className="text-sm md:text-base text-[#021544] font-semibold text-center leading-relaxed">
        {isAr ? (
          <>
            🎁 العرض المجاني <span className="text-[#0d4d35] font-bold">6 شهور بدون فيزا أو ميزة</span>
            <br className="md:hidden" />
            <span className="text-[#a67c2a]"> — ينتهي قريباً!</span>
          </>
        ) : (
          <>
            🎁 Free <span className="text-[#0d4d35] font-bold">6 months — no card required</span>
            <span className="text-[#a67c2a]"> — ending soon!</span>
          </>
        )}
      </p>

      {/* Countdown grid */}
      <div className="flex items-center gap-2 md:gap-3 mt-3 font-mono">
        {[
          { value: t.days, label: labels.days },
          { value: t.hours, label: labels.hours },
          { value: t.minutes, label: labels.minutes },
          { value: t.seconds, label: labels.seconds },
        ].map((unit, i, arr) => (
          <div key={unit.label} className="flex items-center">
            <div className="flex flex-col items-center min-w-[48px] md:min-w-[60px] px-2 py-1.5 rounded-lg bg-[#021544] text-white shadow-md">
              <span className="text-xl md:text-2xl font-bold leading-none tabular-nums">
                {String(unit.value).padStart(2, "0")}
              </span>
              <span className="text-[9px] md:text-[10px] text-white/70 mt-0.5 uppercase tracking-wide">
                {unit.label}
              </span>
            </div>
            {i < arr.length - 1 && (
              <span className="text-[#c9a14a] text-xl font-bold mx-0.5 md:mx-1">:</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-[10px] md:text-[11px] text-muted-foreground mt-2.5 text-center">
        {isAr
          ? "بعد انتهاء العرض، التجربة المجانية تصبح 14 يوماً فقط"
          : "After this date, the free trial drops to 14 days only"}
      </p>
    </div>
  );
}
