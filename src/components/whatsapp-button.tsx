"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useGeoPricing } from "./geo-pricing";

// Technical support: geo-routed (Gulf → Saudi, rest → Egypt)
// Accounting support: Dalia Mahdy, CMA — single Egypt number for everyone
const DALIA_PHONE = "201285736144";

export function WhatsAppButton() {
  const { currency } = useGeoPricing();
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const [open, setOpen] = useState(false);

  const techPhone = currency === "SAR" ? "966570620570" : "201507522155";
  const techMessage = encodeURIComponent(
    isAr
      ? "مرحباً، أحتاج دعم فني بخصوص نظام G-Ledger"
      : "Hello, I need technical support for G-Ledger",
  );
  const accountingMessage = encodeURIComponent(
    isAr
      ? "مرحباً د. داليا، أحتاج استفسار محاسبي بخصوص G-Ledger"
      : "Hello Dr. Dalia, I have an accounting question about G-Ledger",
  );

  const techHref = `https://wa.me/${techPhone}?text=${techMessage}`;
  const accountingHref = `https://wa.me/${DALIA_PHONE}?text=${accountingMessage}`;

  return (
    <div className="fixed bottom-24 left-6 z-40 flex flex-col items-start gap-3">
      {/* Expanded options */}
      {open && (
        <div className="flex flex-col gap-2 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Accounting support — Dalia */}
          <a
            href={accountingHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-white rounded-2xl shadow-xl border border-[#c9a14a]/30 pl-3 pr-4 py-2.5 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
            title={isAr ? "دعم محاسبي — د. داليا" : "Accounting support — Dr. Dalia"}
            onClick={() => setOpen(false)}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0d4d35] to-[#0f5f3e] flex items-center justify-center text-[#c9a14a] font-bold text-sm border-2 border-[#c9a14a]/40">
              د
            </div>
            <div className="text-start">
              <div className="text-xs font-bold text-[#021544] leading-tight">
                {isAr ? "دعم محاسبي" : "Accounting Support"}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                {isAr ? "د. داليا — CMA" : "Dr. Dalia — CMA"}
              </div>
            </div>
            <span className="ml-1 text-[#25D366] text-lg">›</span>
          </a>

          {/* Technical support */}
          <a
            href={techHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-white rounded-2xl shadow-xl border border-[#0070F2]/20 pl-3 pr-4 py-2.5 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
            title={isAr ? "دعم فني" : "Technical support"}
            onClick={() => setOpen(false)}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#021544] to-[#0070F2] flex items-center justify-center text-white text-base">
              ⚙
            </div>
            <div className="text-start">
              <div className="text-xs font-bold text-[#021544] leading-tight">
                {isAr ? "دعم فني" : "Technical Support"}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                {currency === "SAR"
                  ? isAr
                    ? "الرقم السعودي"
                    : "Saudi number"
                  : isAr
                    ? "الرقم المصري"
                    : "Egypt number"}
              </div>
            </div>
            <span className="ml-1 text-[#25D366] text-lg">›</span>
          </a>
        </div>
      )}

      {/* Main toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 bg-[#25D366]"
        title={isAr ? "تواصل عبر واتساب" : "Contact via WhatsApp"}
        aria-expanded={open}
        aria-label={isAr ? "تواصل عبر واتساب" : "Contact via WhatsApp"}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        )}
        {/* Pulse indicator when closed */}
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c9a14a] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c9a14a]" />
          </span>
        )}
      </button>
    </div>
  );
}
