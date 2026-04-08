"use client";

import { usePathname } from "next/navigation";
import { useGeoPricing } from "./geo-pricing";

/**
 * Geo-aware paid add-ons grid. Mirrors the PricingCards pattern: shows
 * only the user's local currency (EGP for Egypt, SAR for Gulf, USD for
 * everywhere else) instead of jamming both EGP and SAR into a single line.
 */
export function AddonsCards() {
  const { currency, detected } = useGeoPricing();
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

  if (!detected) {
    return (
      <div className="h-40 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0070F2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Per-currency price strings.
  // Source of truth: 1 USD ≈ 50 EGP ≈ 5 SAR (matches main pricing cards).
  const ADDONS = [
    {
      key: "crm",
      name: "CRM",
      desc: isAr ? "إدارة العملاء المحتملين" : "Lead management",
      price: { EGP: "+150 ج.م", SAR: "+15 ر.س", USD: "+$3" },
      unit: isAr ? "/مستخدم/شهر" : "/user/mo",
      iconPath:
        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    },
    {
      key: "ecommerce",
      name: "eCommerce",
      desc: isAr ? "متجر إلكتروني" : "Online store",
      price: { EGP: "+250 ج.م", SAR: "+25 ر.س", USD: "+$5" },
      unit: isAr ? "/مستخدم/شهر" : "/user/mo",
      iconPath:
        "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020.01 4H5.21l-.94-2H1z",
    },
    {
      key: "emp-pro",
      name: isAr ? "موظفين (احترافي)" : "Employees (Pro)",
      desc: isAr ? "أول 10 ثم تنازلي" : "First 10 then tiered",
      price: { EGP: "250 ج.م", SAR: "25 ر.س", USD: "$5" },
      unit: isAr ? "/موظف" : "/emp",
      iconPath:
        "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z",
    },
    {
      key: "emp-ent",
      name: isAr ? "موظفين (مؤسسي)" : "Employees (Enterprise)",
      desc: isAr ? "HR متقدم + أول 10 ثم تنازلي" : "Advanced HR + tiered",
      price: { EGP: "500 ج.م", SAR: "50 ر.س", USD: "$10" },
      unit: isAr ? "/موظف" : "/emp",
      iconPath:
        "M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4z",
    },
    {
      key: "pos",
      name: "POS",
      desc: isAr ? "نقطة بيع (مؤسسي)" : "POS (Enterprise)",
      price: { EGP: "+150 ج.م", SAR: "+15 ر.س", USD: "+$3" },
      unit: isAr ? "/جهاز" : "/device",
      iconPath:
        "M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zM2 14h20v-4H2v4zm2-3h2v2H4v-2z",
    },
    {
      key: "storage",
      name: isAr ? "تخزين" : "Storage",
      desc: isAr ? "مساحة إضافية" : "Extra space",
      price: { EGP: "500 ج.م", SAR: "50 ر.س", USD: "$10" },
      unit: isAr ? "/جيجا" : "/GB",
      iconPath:
        "M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {ADDONS.map((addon) => (
        <div
          key={addon.key}
          className="bg-white rounded-xl p-4 border border-gray-100 text-center hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-[#0070F2]/10 flex items-center justify-center mx-auto mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0070F2">
              <path d={addon.iconPath} />
            </svg>
          </div>
          <div className="font-bold text-sm text-[#021544]">{addon.name}</div>
          <div className="text-xs text-[#0070F2] font-bold mt-1">
            {addon.price[currency]}
            <span className="text-[10px] text-gray-400 font-normal">{addon.unit}</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-1">{addon.desc}</div>
        </div>
      ))}
    </div>
  );
}
