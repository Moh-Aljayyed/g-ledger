"use client";

import { useGeoPricing } from "./geo-pricing";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PricingCards() {
  const { prices, currency, detected } = useGeoPricing();
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const locale = isAr ? "ar" : "en";

  const isPromoActive = new Date() <= new Date("2026-04-30");
  const trialText = isPromoActive
    ? (isAr ? "6 أشهر مجاناً (حتى نهاية أبريل)" : "6 months free (until end of April)")
    : (isAr ? "14 يوم تجربة مجانية" : "14-day free trial");

  const t = {
    free: isAr ? "مجاني" : "Free",
    basic: isAr ? "أساسي" : "Basic",
    pro: isAr ? "احترافي" : "Professional",
    enterprise: isAr ? "مؤسسي" : "Enterprise",
    mostPopular: isAr ? "الأكثر طلباً" : "Most Popular",
    startFree: isAr ? "ابدأ مجاناً" : "Start Free",
    startNow: isAr ? "ابدأ الآن" : "Start Now",
    contact: isAr ? "تواصل معنا" : "Contact Us",
    forSmall: isAr ? "للشركات الصغيرة" : "For small businesses",
    forMedium: isAr ? "للشركات المتوسطة" : "For medium businesses",
    forLarge: isAr ? "للشركات الكبيرة" : "For large businesses",
    perUser: prices.perUser,
    freeItems: isAr
      ? ["موديول واحد", "مستخدم واحد", "100,000 KB تخزين", "شجرة حسابات جاهزة", "مساعد ذكي"]
      : ["One module", "1 user", "100,000 KB storage", "Ready chart of accounts", "AI chatbot"],
    basicItems: isAr
      ? ["محاسبة + فواتير + مخزون", "تقارير مالية", "1 GB تخزين", "فوترة إلكترونية", "استيراد Excel"]
      : ["Accounting + Invoices + Inventory", "Financial reports", "1 GB storage", "E-invoicing", "Excel import"],
    proItems: isAr
      ? ["كل الموديولات", "CRM + مشاريع + مصروفات", "2 مستخدمين", "2 GB تخزين", "موظفون + رواتب + إجازات", "دعم أولوية"]
      : ["All modules", "CRM + Projects + Expenses", "2 users", "2 GB storage", "Employees + Payroll + Leaves", "Priority support"],
    enterpriseItems: isAr
      ? ["كل شيء في الاحترافي", "3 مستخدمين", "HR متقدم (حضور، شهادات، سلف)", "نقاط البيع POS احترافي", "API خارجي", "5 GB تخزين", "White Label"]
      : ["Everything in Professional", "3 users", "Advanced HR (attendance, certificates, advances)", "Professional POS", "External API", "5 GB storage", "White Label"],
  };

  if (!detected) return <div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const check = <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#22C55E"/></svg>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Free */}
      <div className="rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all duration-300 bg-white">
        <div className="text-sm font-bold text-gray-500 mb-2">{t.free}</div>
        <div className="text-4xl font-bold text-[#021544] mb-1">{prices.free}{currency !== "USD" && ` ${prices.currency}`}</div>
        <div className="text-xs text-gray-400 mb-6">{trialText}</div>
        <ul className="space-y-3 text-sm mb-6">
          {t.freeItems.map((item, i) => <li key={i} className="flex items-center gap-2">{check}{item}</li>)}
        </ul>
        <Link href={`/${locale}/register`} className="block text-center py-3 rounded-xl border-2 border-[#021544] text-[#021544] font-bold hover:bg-[#021544] hover:text-white transition-all">{t.startFree}</Link>
      </div>

      {/* Basic */}
      <div className="rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all duration-300 bg-white">
        <div className="text-sm font-bold text-blue-600 mb-2">{t.basic}</div>
        <div className="text-3xl font-bold text-[#021544] mb-1">{prices.basic} {prices.currency}<span className="text-sm font-normal text-gray-400">{t.perUser}</span></div>
        <div className="text-xs text-gray-400 mb-6">{t.forSmall}</div>
        <ul className="space-y-3 text-sm mb-6">
          {t.basicItems.map((item, i) => <li key={i} className="flex items-center gap-2">{check}{item}</li>)}
        </ul>
        <Link href={`/${locale}/register`} className="block text-center py-3 rounded-xl bg-[#0070F2] text-white font-bold hover:bg-[#005ed4] transition-all">{t.startNow}</Link>
      </div>

      {/* Professional */}
      <div className="rounded-2xl border-2 border-[#0070F2] p-6 hover:shadow-xl transition-all duration-300 bg-white relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0070F2] text-white text-xs font-bold px-4 py-1 rounded-full">{t.mostPopular}</div>
        <div className="text-sm font-bold text-[#0070F2] mb-2">{t.pro}</div>
        <div className="text-3xl font-bold text-[#021544] mb-1">{prices.pro} {prices.currency}<span className="text-sm font-normal text-gray-400">{t.perUser}</span></div>
        <div className="text-xs text-gray-400 mb-6">{t.forMedium}</div>
        <ul className="space-y-3 text-sm mb-6">
          {t.proItems.map((item, i) => <li key={i} className="flex items-center gap-2">{check}{item}</li>)}
        </ul>
        <Link href={`/${locale}/register`} className="block text-center py-3 rounded-xl bg-[#0070F2] text-white font-bold hover:bg-[#005ed4] transition-all shadow-lg">{t.startNow}</Link>
      </div>

      {/* Enterprise */}
      <div className="rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all duration-300 bg-white">
        <div className="text-sm font-bold text-purple-600 mb-2">{t.enterprise}</div>
        <div className="text-3xl font-bold text-[#021544] mb-1">{prices.enterprise} {prices.currency}<span className="text-sm font-normal text-gray-400">{t.perUser}</span></div>
        <div className="text-xs text-gray-400 mb-6">{t.forLarge}</div>
        <ul className="space-y-3 text-sm mb-6">
          {t.enterpriseItems.map((item, i) => <li key={i} className="flex items-center gap-2">{check}{item}</li>)}
        </ul>
        <Link href={`/${locale}/register`} className="block text-center py-3 rounded-xl border-2 border-purple-600 text-purple-600 font-bold hover:bg-purple-600 hover:text-white transition-all">{t.contact}</Link>
      </div>
    </div>
  );
}
