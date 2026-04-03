import Link from "next/link";
import { LogoFull } from "@/components/logo";
import { LangLink } from "@/components/lang-link";

export default async function IntegrationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const t = {
    title: isAr ? "التكاملات والشراكات" : "Integrations & Partnerships",
    subtitle: isAr ? "G-Ledger يتكامل مع أفضل المنصات والخدمات لتقوية أعمالك" : "G-Ledger integrates with the best platforms and services to power your business",
    payments: isAr ? "بوابات الدفع" : "Payment Gateways",
    ecommerce: isAr ? "منصات التجارة الإلكترونية" : "E-Commerce Platforms",
    bnpl: isAr ? "اشترِ الآن وادفع لاحقاً" : "Buy Now Pay Later",
    government: isAr ? "جهات حكومية" : "Government Services",
    hr: isAr ? "موارد بشرية" : "HR Systems",
    accounting: isAr ? "خدمات محاسبية" : "Accounting Services",
    comingSoon: isAr ? "قريباً" : "Coming Soon",
    integrated: isAr ? "متكامل" : "Integrated",
    ready: isAr ? "جاهز للربط" : "Ready to Connect",
    becomePartner: isAr ? "كن شريكاً" : "Become a Partner",
    becomePartnerDesc: isAr ? "هل لديك منصة أو خدمة وتريد الربط مع G-Ledger؟ تواصل معنا" : "Have a platform or service and want to integrate with G-Ledger? Contact us",
    contact: isAr ? "تواصل معنا" : "Contact Us",
  };

  const integrations = [
    // Payment Gateways
    { category: t.payments, items: [
      { name: "Stripe", desc: isAr ? "Visa, Mastercard, Apple Pay, Google Pay" : "Visa, Mastercard, Apple Pay, Google Pay", status: "integrated", color: "#635BFF" },
      { name: "Paymob", desc: isAr ? "ميزة، فوري، فودافون كاش، إنستاباي" : "Meeza, Fawry, VodaCash, Instapay", status: "integrated", color: "#0070F2" },
      { name: "مدى Mada", desc: isAr ? "بطاقات مدى السعودية" : "Saudi Mada cards", status: "integrated", color: "#003B71" },
      { name: "HyperPay", desc: isAr ? "بوابة دفع خليجية شاملة" : "GCC payment gateway", status: "ready", color: "#00A0E3" },
      { name: "PayPal", desc: isAr ? "مدفوعات دولية" : "International payments", status: "ready", color: "#003087" },
      { name: "STC Pay", desc: isAr ? "محفظة STC الرقمية" : "STC digital wallet", status: "ready", color: "#5F259F" },
    ]},
    // BNPL
    { category: t.bnpl, items: [
      { name: "Tamara تمارا", desc: isAr ? "اشترِ الآن وادفع لاحقاً — بدون فوائد" : "Buy now pay later — interest free", status: "ready", color: "#FFD700" },
      { name: "Tabby تابي", desc: isAr ? "تقسيط المدفوعات على 4 دفعات" : "Split payments into 4 installments", status: "ready", color: "#3CFFD0" },
    ]},
    // E-Commerce
    { category: t.ecommerce, items: [
      { name: "Salla سلة", desc: isAr ? "ربط المتجر + المخزون + الطلبات" : "Store + inventory + orders sync", status: "ready", color: "#5B3EB5" },
      { name: "Zid زد", desc: isAr ? "منصة تجارة إلكترونية سعودية" : "Saudi e-commerce platform", status: "ready", color: "#FF6B35" },
      { name: "Shopify", desc: isAr ? "ربط المتاجر العالمية" : "Global store integration", status: "coming", color: "#96BF48" },
      { name: "WooCommerce", desc: isAr ? "ربط متاجر WordPress" : "WordPress store integration", status: "coming", color: "#96588A" },
    ]},
    // Government
    { category: t.government, items: [
      { name: "ZATCA فاتورة", desc: isAr ? "الفوترة الإلكترونية السعودية — المرحلة الأولى والثانية" : "Saudi e-invoicing Phase 1 & 2", status: "integrated", color: "#006C35" },
      { name: "ETA مصلحة الضرائب", desc: isAr ? "منظومة الفاتورة الإلكترونية المصرية" : "Egypt electronic invoice system", status: "integrated", color: "#CE1126" },
      { name: isAr ? "المركز السعودي للأعمال" : "Saudi Business Center", desc: isAr ? "توثيق البرنامج كمنصة تقنية معتمدة" : "Program certification as approved tech platform", status: "coming", color: "#003B71" },
      { name: "Qiwa قوى", desc: isAr ? "منصة إدارة العمالة السعودية" : "Saudi labor management platform", status: "coming", color: "#1B7B4B" },
      { name: "Muqeem مقيم", desc: isAr ? "خدمات الجوازات والإقامات" : "Passport & residency services", status: "coming", color: "#003B71" },
    ]},
    // HR
    { category: t.hr, items: [
      { name: "GOSI التأمينات", desc: isAr ? "التأمينات الاجتماعية السعودية — حساب تلقائي" : "Saudi social insurance — auto calculation", status: "integrated", color: "#00695C" },
      { name: "Bayzat", desc: isAr ? "نظام HR إماراتي/سعودي" : "UAE/Saudi HR system", status: "ready", color: "#FF5722" },
      { name: "MenaITech", desc: isAr ? "نظام HR خليجي شامل" : "Comprehensive GCC HR system", status: "coming", color: "#0070F2" },
    ]},
  ];

  const statusStyles = {
    integrated: { bg: "bg-green-100", text: "text-green-700", label: t.integrated },
    ready: { bg: "bg-blue-100", text: "text-blue-700", label: t.ready },
    coming: { bg: "bg-gray-100", text: "text-gray-500", label: t.comingSoon },
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/${locale}`}><LogoFull size="sm" variant="dark" /></Link>
          <div className="flex items-center gap-3">
            <LangLink variant="header" />
            <Link href={`/${locale}/register`} className="px-4 py-2 text-sm bg-[#0070F2] text-white rounded-lg font-medium">{isAr ? "ابدأ مجاناً" : "Start Free"}</Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-[#021544] mb-3">{t.title}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        {/* Integration Categories */}
        {integrations.map((category, ci) => (
          <div key={ci} className="mb-12">
            <h2 className="text-xl font-bold text-[#021544] mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#0070F2] rounded-full" />
              {category.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((item, i) => {
                const status = statusStyles[item.status as keyof typeof statusStyles];
                return (
                  <div key={i} className="bg-white rounded-xl border border-border p-5 hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: item.color }}>
                        {item.name.charAt(0)}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#021544] text-sm mb-1">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Become Partner CTA */}
        <div className="mt-16 bg-gradient-to-r from-[#021544] to-[#0070F2] rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">{t.becomePartner}</h3>
          <p className="text-white/70 mb-6 max-w-xl mx-auto">{t.becomePartnerDesc}</p>
          <a href="https://m.me/1043966828805970" target="_blank" className="inline-block px-8 py-3 bg-white text-[#021544] rounded-xl font-bold hover:bg-white/90 transition-all">
            {t.contact}
          </a>
        </div>
      </div>
    </div>
  );
}
