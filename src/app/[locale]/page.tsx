import Link from "next/link";
import { LogoFull } from "@/components/logo";
import { VisitorCounter } from "@/components/visitor-counter";
import { LangLink } from "@/components/lang-link";
import { AnimatedSection, AnimatedCard, FloatingElement } from "@/components/animated-landing";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "G-Ledger",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: "نظام محاسبي سحابي متكامل يدعم 15 قطاع مختلف مع فوترة إلكترونية متوافقة مع ETA مصر و ZATCA السعودية",
            url: "https://g-ledger.com",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "تجربة مجانية لمدة 6 أشهر",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              ratingCount: "5230",
              bestRating: "5",
            },
            featureList: [
              "القيود المحاسبية التلقائية",
              "الفوترة الإلكترونية ETA و ZATCA",
              "إدارة العملاء والموردين",
              "مسير الرواتب والتأمينات",
              "إدارة المخزون",
              "الأصول الثابتة والإهلاك",
              "البنوك والنقدية",
              "الإنتاج والتصنيع",
              "التقارير المالية",
              "29+ دولة حول العالم مدعومة",
              "15 قطاع بشجرة حسابات جاهزة",
            ],
            author: {
              "@type": "Organization",
              name: "G-Ledger",
              url: "https://g-ledger.com",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "G-Ledger",
            url: "https://g-ledger.com",
            logo: "https://g-ledger.com/logo.svg",
            description: "المحاسب الذكي لكل القطاعات — Smart Accounting for Every Sector",
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer service",
              availableLanguage: ["Arabic", "English"],
            },
            sameAs: [
              "https://www.facebook.com/profile.php?id=61574741902666",
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "ما هو G-Ledger؟",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "G-Ledger هو نظام محاسبي سحابي متكامل (ERP) يدعم 15 قطاع مختلف مع شجرة حسابات جاهزة لكل قطاع. متوافق مع الفوترة الإلكترونية في مصر (ETA) والسعودية (ZATCA).",
                },
              },
              {
                "@type": "Question",
                name: "هل G-Ledger مجاني؟",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "نعم، G-Ledger يقدم تجربة مجانية لمدة 6 أشهر بمساحة 100,000 KB بدون الحاجة لبطاقة ائتمان. بعد انتهاء التجربة، الاشتراك يبدأ من $10 لكل جيجابايت شهرياً مع خصومات متدرجة.",
                },
              },
              {
                "@type": "Question",
                name: "هل يدعم الفوترة الإلكترونية؟",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "نعم، G-Ledger متوافق بالكامل مع منظومة الفاتورة الإلكترونية في مصر (ETA) والسعودية (ZATCA) بما في ذلك التوقيع الإلكتروني وتكويد الأصناف وQR Code.",
                },
              },
              {
                "@type": "Question",
                name: "ما هي القطاعات المدعومة؟",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "يدعم 15 قطاع: صناعي، تجاري، خدمي، بنوك، تأمين، عقاري، مقاولات، زراعي، تقني، غير ربحي، تمويل جماعي، مستشفيات، صيدليات، عيادات، ومعامل تحاليل.",
                },
              },
              {
                "@type": "Question",
                name: "ما هي الدول المدعومة؟",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "يدعم 29+ دولة حول العالم: 14 دولة عربية (السعودية، مصر، الإمارات، الكويت، البحرين، عمان، قطر، الأردن، العراق، المغرب، تونس، السودان، ليبيا، لبنان) و15 دولة عالمية (الولايات المتحدة، الهند، الصين، إندونيسيا، باكستان، البرازيل، نيجيريا، بنغلاديش، روسيا، المكسيك، تركيا، ألمانيا، المملكة المتحدة، فرنسا، ماليزيا). مع ضرائب وعملات مخصصة لكل دولة وقطاع.",
                },
              },
            ],
          }),
        }}
      />

      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <LogoFull size="md" variant="dark" />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#021544]">
            <a href="#features" className="hover:text-[#0070F2] transition-colors">المميزات</a>
            <a href="#sectors" className="hover:text-[#0070F2] transition-colors">القطاعات</a>
            <a href="#einvoice" className="hover:text-[#0070F2] transition-colors">الفوترة الإلكترونية</a>
            <a href="#pricing" className="hover:text-[#0070F2] transition-colors">الأسعار</a>
            <Link href="/ar/blog" className="hover:text-[#0070F2] transition-colors">المدونة</Link>
          </nav>

          <div className="flex items-center gap-3">
            <LangLink variant="header" />
            <Link
              href="/ar/login"
              className="px-5 py-2.5 text-sm font-semibold text-[#021544] hover:text-[#0070F2] transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/ar/register"
              className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-l from-[#021544] to-[#0070F2] text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              ابدأ تجربتك المجانية
            </Link>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #021544 0%, #0a2a6e 50%, #0070F2 100%)" }}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-[#00C9A7] rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0070F2] rounded-full blur-3xl opacity-30" />
        </div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-[#0070F2] rounded-full blur-3xl opacity-10 animate-blob" />
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-[#00C9A7] rounded-full blur-3xl opacity-10 animate-blob" style={{ animationDelay: '2s' }} />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text content (right side in RTL) */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-[#00C9A7] animate-pulse" />
                29+ دولة | 15 قطاع | فوترة إلكترونية
              </div>

              <h1 className="text-4xl md:text-[56px] font-bold text-white leading-tight mb-6">
                اختر قطاعك...
                <br />
                <span className="text-[#00C9A7]">ونظامك جاهز</span>
              </h1>

              <p className="text-lg md:text-xl text-white/75 max-w-xl mb-10 leading-relaxed">
                أول نظام محاسبي عربي بشجرة حسابات جاهزة لكل قطاع وضرائب مخصصة لكل دولة — النظام يجهّز لك كل شيء في ثوانٍ
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  href="/ar/register"
                  className="px-10 py-4 text-base font-bold bg-white text-[#021544] rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  ابدأ مجانًا — 6 أشهر بدون بطاقة
                </Link>
                <a
                  href="#why-different"
                  className="px-10 py-4 text-base font-semibold bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm text-center"
                >
                  شاهد المميزات
                </a>
              </div>

              {/* Visitor Counter */}
              <VisitorCounter variant="landing" />

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 mt-8">
                {[
                  { label: "15 قطاع", icon: "M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h12v2H3v-2z" },
                  { label: "29+ دولة", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" },
                  { label: "2FA حماية", icon: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" },
                  { label: "شات بوت ذكي", icon: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" },
                ].map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2 text-white/70 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#00C9A7"><path d={badge.icon}/></svg>
                    </div>
                    <span className="font-medium">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard SVG illustration (left side in RTL) */}
            <div className="hidden lg:block">
              <FloatingElement speed="slow">
              <div className="relative">
                {/* Glow effect behind */}
                <div className="absolute -inset-4 bg-[#0070F2]/20 rounded-3xl blur-2xl" />
                <svg viewBox="0 0 500 400" fill="none" className="relative w-full drop-shadow-2xl">
                  {/* Browser frame */}
                  <rect x="20" y="20" width="460" height="360" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
                  <rect x="20" y="20" width="460" height="36" rx="12" fill="#F1F5F9"/>
                  <rect x="20" y="20" width="460" height="36" rx="12" fill="#F1F5F9"/>
                  <circle cx="42" cy="38" r="6" fill="#EF4444"/>
                  <circle cx="62" cy="38" r="6" fill="#F59E0B"/>
                  <circle cx="82" cy="38" r="6" fill="#22C55E"/>
                  {/* URL bar */}
                  <rect x="110" y="30" width="200" height="16" rx="8" fill="#E2E8F0"/>
                  <rect x="120" y="35" width="80" height="6" rx="3" fill="#94A3B8" opacity="0.5"/>
                  {/* Sidebar */}
                  <rect x="20" y="56" width="100" height="324" fill="#0a1628"/>
                  {/* Sidebar logo area */}
                  <rect x="30" y="70" width="80" height="8" rx="4" fill="white" opacity="0.3"/>
                  {/* Sidebar items */}
                  <rect x="30" y="90" width="60" height="6" rx="3" fill="white" opacity="0.15"/>
                  <rect x="30" y="106" width="70" height="6" rx="3" fill="white" opacity="0.15"/>
                  <rect x="28" y="118" width="84" height="16" rx="4" fill="#0070F2" opacity="0.3"/>
                  <rect x="30" y="122" width="55" height="6" rx="3" fill="#00C9A7" opacity="0.9"/>
                  <rect x="30" y="138" width="65" height="6" rx="3" fill="white" opacity="0.15"/>
                  <rect x="30" y="154" width="50" height="6" rx="3" fill="white" opacity="0.15"/>
                  <rect x="30" y="170" width="60" height="6" rx="3" fill="white" opacity="0.15"/>
                  <rect x="30" y="186" width="55" height="6" rx="3" fill="white" opacity="0.15"/>
                  {/* Main content area */}
                  {/* Stats cards row */}
                  <rect x="135" y="70" width="80" height="50" rx="8" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1"/>
                  <rect x="225" y="70" width="80" height="50" rx="8" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1"/>
                  <rect x="315" y="70" width="80" height="50" rx="8" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1"/>
                  <rect x="405" y="70" width="60" height="50" rx="8" fill="#FEE2E2" stroke="#FECACA" strokeWidth="1"/>
                  {/* Stats text placeholders */}
                  <rect x="145" y="82" width="40" height="5" rx="2" fill="#3B82F6" opacity="0.5"/>
                  <rect x="145" y="95" width="55" height="10" rx="3" fill="#1E40AF"/>
                  <rect x="235" y="82" width="40" height="5" rx="2" fill="#22C55E" opacity="0.5"/>
                  <rect x="235" y="95" width="50" height="10" rx="3" fill="#166534"/>
                  <rect x="325" y="82" width="40" height="5" rx="2" fill="#F59E0B" opacity="0.5"/>
                  <rect x="325" y="95" width="50" height="10" rx="3" fill="#92400E"/>
                  <rect x="415" y="82" width="30" height="5" rx="2" fill="#EF4444" opacity="0.5"/>
                  <rect x="415" y="95" width="35" height="10" rx="3" fill="#991B1B"/>
                  {/* Chart area */}
                  <rect x="135" y="135" width="200" height="120" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
                  {/* Chart title */}
                  <rect x="145" y="145" width="60" height="5" rx="2" fill="#021544" opacity="0.3"/>
                  {/* Bar chart */}
                  <rect x="155" y="200" width="20" height="40" rx="4" fill="#0070F2" opacity="0.8"/>
                  <rect x="185" y="180" width="20" height="60" rx="4" fill="#0070F2" opacity="0.6"/>
                  <rect x="215" y="170" width="20" height="70" rx="4" fill="#0070F2"/>
                  <rect x="245" y="190" width="20" height="50" rx="4" fill="#00C9A7"/>
                  <rect x="275" y="165" width="20" height="75" rx="4" fill="#00C9A7" opacity="0.8"/>
                  <rect x="305" y="185" width="20" height="55" rx="4" fill="#00C9A7" opacity="0.6"/>
                  {/* Chart grid lines */}
                  <line x1="145" y1="180" x2="330" y2="180" stroke="#E2E8F0" strokeWidth="0.5"/>
                  <line x1="145" y1="200" x2="330" y2="200" stroke="#E2E8F0" strokeWidth="0.5"/>
                  <line x1="145" y1="220" x2="330" y2="220" stroke="#E2E8F0" strokeWidth="0.5"/>
                  {/* Pie chart / donut area */}
                  <rect x="350" y="135" width="120" height="120" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
                  <circle cx="410" cy="190" r="30" fill="none" stroke="#0070F2" strokeWidth="8" strokeDasharray="94 94" strokeDashoffset="0"/>
                  <circle cx="410" cy="190" r="30" fill="none" stroke="#00C9A7" strokeWidth="8" strokeDasharray="47 141" strokeDashoffset="-94"/>
                  <circle cx="410" cy="190" r="30" fill="none" stroke="#F59E0B" strokeWidth="8" strokeDasharray="28 160" strokeDashoffset="-141"/>
                  <rect x="385" y="230" width="50" height="4" rx="2" fill="#94A3B8" opacity="0.3"/>
                  {/* Table area */}
                  <rect x="135" y="270" width="335" height="95" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
                  {/* Table header */}
                  <rect x="135" y="270" width="335" height="20" rx="8" fill="#F8FAFC"/>
                  <rect x="150" y="277" width="40" height="5" rx="2" fill="#021544" opacity="0.3"/>
                  <rect x="220" y="277" width="50" height="5" rx="2" fill="#021544" opacity="0.3"/>
                  <rect x="310" y="277" width="35" height="5" rx="2" fill="#021544" opacity="0.3"/>
                  <rect x="390" y="277" width="40" height="5" rx="2" fill="#021544" opacity="0.3"/>
                  {/* Table rows */}
                  <rect x="150" y="298" width="60" height="4" rx="2" fill="#94A3B8" opacity="0.2"/>
                  <rect x="220" y="298" width="70" height="4" rx="2" fill="#94A3B8" opacity="0.2"/>
                  <rect x="310" y="298" width="45" height="4" rx="2" fill="#22C55E" opacity="0.4"/>
                  <rect x="390" y="298" width="50" height="4" rx="2" fill="#94A3B8" opacity="0.2"/>
                  <rect x="150" y="312" width="55" height="4" rx="2" fill="#94A3B8" opacity="0.15"/>
                  <rect x="220" y="312" width="60" height="4" rx="2" fill="#94A3B8" opacity="0.15"/>
                  <rect x="310" y="312" width="40" height="4" rx="2" fill="#0070F2" opacity="0.3"/>
                  <rect x="390" y="312" width="45" height="4" rx="2" fill="#94A3B8" opacity="0.15"/>
                  <rect x="150" y="326" width="50" height="4" rx="2" fill="#94A3B8" opacity="0.1"/>
                  <rect x="220" y="326" width="65" height="4" rx="2" fill="#94A3B8" opacity="0.1"/>
                  <rect x="310" y="326" width="38" height="4" rx="2" fill="#F59E0B" opacity="0.3"/>
                  <rect x="390" y="326" width="42" height="4" rx="2" fill="#94A3B8" opacity="0.1"/>
                  <rect x="150" y="340" width="45" height="4" rx="2" fill="#94A3B8" opacity="0.08"/>
                  <rect x="220" y="340" width="55" height="4" rx="2" fill="#94A3B8" opacity="0.08"/>
                  <rect x="310" y="340" width="42" height="4" rx="2" fill="#EF4444" opacity="0.25"/>
                  <rect x="390" y="340" width="48" height="4" rx="2" fill="#94A3B8" opacity="0.08"/>
                </svg>
              </div>
              </FloatingElement>
            </div>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-scroll">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto text-white/40">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 80V40C180 15 360 0 540 10C720 20 900 50 1080 45C1260 40 1380 20 1440 15V80H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ============ WHY DIFFERENT ============ */}
      <section id="why-different" className="py-24 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
          <div className="text-center mb-20">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">ما يميّزنا</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">لماذا G-Ledger مختلف؟</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">الفرق الذي ستلاحظه من أول لحظة — ليس مجرد برنامج محاسبي آخر</p>
          </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 - Chart tree */}
            <AnimatedCard delay={0}>
            <div className="relative bg-gradient-to-br from-[#021544] to-[#0070F2] rounded-2xl p-8 text-white overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-premium">
              <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <rect x="24" y="4" width="12" height="10" rx="3" fill="#00C9A7"/>
                    <line x1="30" y1="14" x2="30" y2="22" stroke="#00C9A7" strokeWidth="2"/>
                    <line x1="14" y1="22" x2="46" y2="22" stroke="#00C9A7" strokeWidth="2"/>
                    <line x1="14" y1="22" x2="14" y2="28" stroke="#00C9A7" strokeWidth="2"/>
                    <line x1="30" y1="22" x2="30" y2="28" stroke="#00C9A7" strokeWidth="2"/>
                    <line x1="46" y1="22" x2="46" y2="28" stroke="#00C9A7" strokeWidth="2"/>
                    <rect x="6" y="28" width="16" height="8" rx="2" fill="white" opacity="0.3"/>
                    <rect x="22" y="28" width="16" height="8" rx="2" fill="white" opacity="0.3"/>
                    <rect x="38" y="28" width="16" height="8" rx="2" fill="white" opacity="0.3"/>
                    <line x1="14" y1="36" x2="14" y2="42" stroke="white" strokeWidth="1.5" opacity="0.3"/>
                    <line x1="30" y1="36" x2="30" y2="42" stroke="white" strokeWidth="1.5" opacity="0.3"/>
                    <line x1="46" y1="36" x2="46" y2="42" stroke="white" strokeWidth="1.5" opacity="0.3"/>
                    <rect x="8" y="42" width="12" height="6" rx="2" fill="white" opacity="0.15"/>
                    <rect x="24" y="42" width="12" height="6" rx="2" fill="white" opacity="0.15"/>
                    <rect x="40" y="42" width="12" height="6" rx="2" fill="white" opacity="0.15"/>
                    <circle cx="50" cy="10" r="6" fill="#00C9A7" opacity="0.3"/>
                    <path d="M48 10l2 2 4-4" stroke="#00C9A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">شجرة حسابات جاهزة — مش فاضية</h3>
                <p className="text-white/70 leading-relaxed text-sm">
                  البرامج الأخرى تعطيك شجرة فارغة وتتركك تبنيها من الصفر. G-Ledger يعطيك شجرة مكتملة ومصممة خصيصًا لقطاعك — صناعي، طبي، مقاولات، أو أي قطاع آخر.
                </p>
                <div className="mt-6 flex items-center gap-2 text-[#00C9A7] text-sm font-semibold">
                  <span>15 قطاع جاهز</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></svg>
                </div>
              </div>
            </div>

            </AnimatedCard>
            {/* Card 2 - Globe with checkmark */}
            <AnimatedCard delay={150}>
            <div className="relative bg-gradient-to-br from-[#021544] to-[#0070F2] rounded-2xl p-8 text-white overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-premium">
              <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <circle cx="28" cy="30" r="18" stroke="#00C9A7" strokeWidth="2" fill="none"/>
                    <ellipse cx="28" cy="30" rx="8" ry="18" stroke="#00C9A7" strokeWidth="1.5" fill="none" opacity="0.5"/>
                    <line x1="10" y1="22" x2="46" y2="22" stroke="#00C9A7" strokeWidth="1" opacity="0.4"/>
                    <line x1="10" y1="38" x2="46" y2="38" stroke="#00C9A7" strokeWidth="1" opacity="0.4"/>
                    <line x1="28" y1="12" x2="28" y2="48" stroke="#00C9A7" strokeWidth="1" opacity="0.3"/>
                    <circle cx="44" cy="44" r="10" fill="#00C9A7"/>
                    <path d="M40 44l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">ضرائب ذكية — مش رقم واحد للكل</h3>
                <p className="text-white/70 leading-relaxed text-sm">
                  هل تعرف إن القطاع الطبي في مصر معفى من ض.ق.م بينما المقاولات 14% + خصم منبع 3%؟ G-Ledger يعرف — ويحسب الضريبة الصحيحة تلقائيًا حسب دولتك وقطاعك.
                </p>
                <div className="mt-6 flex items-center gap-2 text-[#00C9A7] text-sm font-semibold">
                  <span>29+ دولة حول العالم</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></svg>
                </div>
              </div>
            </div>

            </AnimatedCard>
            {/* Card 3 - Auto-sync arrows */}
            <AnimatedCard delay={300}>
            <div className="relative bg-gradient-to-br from-[#021544] to-[#0070F2] rounded-2xl p-8 text-white overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-premium">
              <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    {/* Circular sync arrows */}
                    <path d="M30 12C20.06 12 12 20.06 12 30" stroke="#00C9A7" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    <path d="M12 30C12 39.94 20.06 48 30 48" stroke="#00C9A7" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    <path d="M30 48C39.94 48 48 39.94 48 30" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4"/>
                    <path d="M48 30C48 20.06 39.94 12 30 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4"/>
                    {/* Arrow tips */}
                    <polygon points="14,24 8,30 14,30" fill="#00C9A7"/>
                    <polygon points="46,36 52,30 46,30" fill="white" opacity="0.4"/>
                    {/* Center icon - document with checkmark */}
                    <rect x="22" y="22" width="16" height="16" rx="3" fill="#00C9A7" opacity="0.2"/>
                    <rect x="24" y="24" width="12" height="12" rx="2" fill="#00C9A7" opacity="0.3"/>
                    <path d="M27 30l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">كل شيء ينشئ قيد تلقائي</h3>
                <p className="text-white/70 leading-relaxed text-sm">
                  فاتورة؟ قيد. راتب؟ قيد. حركة مخزون؟ قيد. إهلاك؟ قيد. إنتاج؟ قيد. كل عملية في النظام تُنشئ قيدها المحاسبي تلقائيًا — صفر إدخال يدوي.
                </p>
                <div className="mt-6 flex items-center gap-2 text-[#00C9A7] text-sm font-semibold">
                  <span>تلقائي 100%</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></svg>
                </div>
              </div>
            </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* ============ MODULES / FEATURES ============ */}
      <section id="features" className="py-24 relative" style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)" }}>
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#021544 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative max-w-7xl mx-auto px-6">
          <AnimatedSection>
          <div className="text-center mb-20">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">الموديولات</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">نظام ERP متكامل</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">12 موديول يغطي كل العمليات المحاسبية والإدارية — من القيد اليومي إلى التقارير المالية</p>
          </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              {
                title: "القيود المحاسبية",
                desc: "قيد مزدوج تلقائي مع ترحيل وعكس وقيد مركب",
                iconPath: "M4 4h16v2H4V4zm0 4h10v2H4V8zm0 4h16v2H4v-2zm0 4h10v2H4v-2zm14-2l3 3-3 3v-2h-4v-2h4v-2z",
                color: "#0070F2",
              },
              {
                title: "الفوترة الإلكترونية",
                desc: "ETA مصر + ZATCA السعودية مع توقيع إلكتروني وQR",
                iconPath: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 9h-2v2H9v-2H7v-2h2V7h2v2h2v2zm-2-7V3.5L16.5 9H13c-.55 0-1-.45-1-1z",
                color: "#00C9A7",
              },
              {
                title: "العملاء والموردين",
                desc: "كشف حساب، تقادم ديون، حد ائتمان، شروط دفع",
                iconPath: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
                color: "#0070F2",
              },
              {
                title: "الرواتب والـ HR",
                desc: "مسير رواتب تلقائي مع تأمينات GOSI وبدلات",
                iconPath: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
                color: "#00C9A7",
              },
              {
                title: "المخزون",
                desc: "باتش، صلاحية، FIFO/متوسط مرجح، تنبيهات نقص",
                iconPath: "M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z",
                color: "#0070F2",
              },
              {
                title: "الأصول الثابتة",
                desc: "إهلاك شهري تلقائي — قسط ثابت أو متناقص",
                iconPath: "M1 11v10h6v-5h2v5h6V11L8 6l-7 5zm12 8h-2v-5H5v5H3v-7l5-3.5 5 3.5v7zm4-12h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm-4-16v2H7L17 1v4h4v2h-4z",
                color: "#00C9A7",
              },
              {
                title: "البنوك والنقدية",
                desc: "حسابات متعددة، تحويلات، تسوية بنكية تلقائية",
                iconPath: "M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z",
                color: "#0070F2",
              },
              {
                title: "الإنتاج والتصنيع",
                desc: "5 مراحل — من المواد الخام إلى المنتج النهائي",
                iconPath: "M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3h7zM7 9H4V5h3v4zm10 6h3v4h-3v-4zm0-10h3v4h-3V5z",
                color: "#00C9A7",
              },
              {
                title: "التقارير المالية",
                desc: "ميزان مراجعة، قائمة دخل، ميزانية، أستاذ عام",
                iconPath: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
                color: "#0070F2",
              },
              {
                title: "29+ دولة حول العالم",
                desc: "ضرائب وعملات مخصصة لكل دولة وقطاع تلقائيًا",
                iconPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
                color: "#00C9A7",
              },
              {
                title: "أمان بنكي",
                desc: "2FA + OTP عند كل دخول، تشفير SSL، عزل كامل",
                iconPath: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z",
                color: "#0070F2",
              },
              {
                title: "مساعد ذكي",
                desc: "شات بوت بالعربية — 45+ فئة سؤال عن كل الموديولات",
                iconPath: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 12H7v-2h10v2zm0-3H7V9h10v2zm0-3H7V6h10v2z",
                color: "#00C9A7",
              },
            ].map((mod, i) => (
              <AnimatedCard delay={i * 80} key={i}>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-premium">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${mod.color}15` }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={mod.color}><path d={mod.iconPath}/></svg>
                </div>
                <h3 className="text-base font-bold text-[#021544] mb-1.5 group-hover:text-[#0070F2] transition-colors">{mod.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{mod.desc}</p>
              </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* ============ E-INVOICE SECTION ============ */}
      <section id="einvoice" className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #021544 0%, #0070F2 100%)" }}>
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-10 right-20 w-40 h-40 border border-white rounded-full" />
          <div className="absolute bottom-20 left-10 w-60 h-60 border border-white rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text content */}
            <div>
              <AnimatedSection>
              <span className="text-sm font-semibold text-[#00C9A7] mb-2 block">الفوترة الإلكترونية</span>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                متوافق مع ETA مصر و ZATCA السعودية
              </h3>
              <p className="text-white/60 max-w-xl mb-10">
                أرسل فواتيرك الإلكترونية مباشرة لمصلحة الضرائب — بدون وسيط وبدون تعقيد
              </p>
              </AnimatedSection>

              <div className="space-y-8">
                {/* Egypt Card */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/15 transition-all">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect width="28" height="9.33" fill="#CE1126"/>
                      <rect y="9.33" width="28" height="9.33" fill="white"/>
                      <rect y="18.67" width="28" height="9.33" fill="#111"/>
                    </svg>
                    مصر — مصلحة الضرائب (ETA)
                  </h4>
                  <ul className="space-y-3 text-white/70 text-sm">
                    {[
                      "تكامل مباشر عبر API مع منظومة الفاتورة الإلكترونية",
                      "دعم التوقيع الإلكتروني وتكويد الأصناف (EGS/GS1)",
                      "ض.ق.م + ضريبة الجدول + الخصم من المنبع",
                      "بيئة اختبار Pre-Production + بيئة الإنتاج",
                      "ضرائب مخصصة: طبي = 0%، مقاولات = 14% + 3% خصم منبع",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Saudi Card */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/15 transition-all">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect width="28" height="28" rx="2" fill="#006C35"/>
                      <rect x="4" y="10" width="20" height="3" rx="1" fill="white" opacity="0.5"/>
                      <rect x="10" y="16" width="8" height="2" rx="1" fill="white" opacity="0.3"/>
                    </svg>
                    السعودية — هيئة الزكاة (ZATCA)
                  </h4>
                  <ul className="space-y-3 text-white/70 text-sm">
                    {[
                      "المرحلة الأولى (التوليد) والثانية (التكامل)",
                      "فواتير XML (UBL 2.1) مع QR Code وتوقيع رقمي",
                      "Clearance للقياسية + Reporting للمبسطة",
                      "CSID Onboarding + بوابة فاتورة (FATOORA)",
                      "ضريبة القيمة المضافة 15% مع استثناء RETT 5%",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Invoice SVG illustration */}
            <div className="hidden lg:flex items-center justify-center">
              <FloatingElement speed="delayed">
              <div className="relative">
                <div className="absolute -inset-6 bg-[#00C9A7]/10 rounded-3xl blur-2xl" />
                <svg viewBox="0 0 400 500" fill="none" className="relative w-full max-w-sm drop-shadow-2xl">
                  {/* Main invoice document */}
                  <rect x="40" y="20" width="320" height="460" rx="16" fill="white" />
                  <rect x="40" y="20" width="320" height="460" rx="16" stroke="#E2E8F0" strokeWidth="1.5"/>
                  {/* Header bar */}
                  <rect x="40" y="20" width="320" height="60" rx="16" fill="#021544"/>
                  <rect x="40" y="64" width="320" height="16" fill="#021544"/>
                  {/* Logo placeholder in header */}
                  <rect x="60" y="35" width="80" height="10" rx="3" fill="white" opacity="0.4"/>
                  <rect x="60" y="52" width="50" height="6" rx="2" fill="#00C9A7" opacity="0.8"/>
                  {/* Invoice number */}
                  <rect x="280" y="35" width="60" height="8" rx="2" fill="white" opacity="0.3"/>
                  <rect x="290" y="50" width="50" height="6" rx="2" fill="white" opacity="0.2"/>
                  {/* Date and client section */}
                  <rect x="60" y="100" width="100" height="6" rx="3" fill="#94A3B8" opacity="0.4"/>
                  <rect x="60" y="114" width="140" height="8" rx="3" fill="#021544" opacity="0.6"/>
                  <rect x="260" y="100" width="80" height="6" rx="3" fill="#94A3B8" opacity="0.4"/>
                  <rect x="260" y="114" width="80" height="8" rx="3" fill="#021544" opacity="0.6"/>
                  {/* Divider */}
                  <line x1="60" y1="140" x2="340" y2="140" stroke="#E2E8F0" strokeWidth="1"/>
                  {/* Table header */}
                  <rect x="60" y="152" width="280" height="24" rx="6" fill="#F1F5F9"/>
                  <rect x="70" y="160" width="40" height="5" rx="2" fill="#64748B" opacity="0.5"/>
                  <rect x="150" y="160" width="50" height="5" rx="2" fill="#64748B" opacity="0.5"/>
                  <rect x="240" y="160" width="30" height="5" rx="2" fill="#64748B" opacity="0.5"/>
                  <rect x="300" y="160" width="30" height="5" rx="2" fill="#64748B" opacity="0.5"/>
                  {/* Table rows */}
                  <rect x="70" y="190" width="70" height="5" rx="2" fill="#94A3B8" opacity="0.3"/>
                  <rect x="150" y="190" width="60" height="5" rx="2" fill="#94A3B8" opacity="0.3"/>
                  <rect x="240" y="190" width="25" height="5" rx="2" fill="#94A3B8" opacity="0.3"/>
                  <rect x="300" y="190" width="35" height="5" rx="2" fill="#0070F2" opacity="0.5"/>

                  <rect x="70" y="210" width="60" height="5" rx="2" fill="#94A3B8" opacity="0.25"/>
                  <rect x="150" y="210" width="50" height="5" rx="2" fill="#94A3B8" opacity="0.25"/>
                  <rect x="240" y="210" width="20" height="5" rx="2" fill="#94A3B8" opacity="0.25"/>
                  <rect x="300" y="210" width="30" height="5" rx="2" fill="#0070F2" opacity="0.4"/>

                  <rect x="70" y="230" width="80" height="5" rx="2" fill="#94A3B8" opacity="0.2"/>
                  <rect x="150" y="230" width="45" height="5" rx="2" fill="#94A3B8" opacity="0.2"/>
                  <rect x="240" y="230" width="28" height="5" rx="2" fill="#94A3B8" opacity="0.2"/>
                  <rect x="300" y="230" width="32" height="5" rx="2" fill="#0070F2" opacity="0.35"/>

                  <rect x="70" y="250" width="55" height="5" rx="2" fill="#94A3B8" opacity="0.15"/>
                  <rect x="150" y="250" width="55" height="5" rx="2" fill="#94A3B8" opacity="0.15"/>
                  <rect x="240" y="250" width="22" height="5" rx="2" fill="#94A3B8" opacity="0.15"/>
                  <rect x="300" y="250" width="28" height="5" rx="2" fill="#0070F2" opacity="0.3"/>
                  {/* Divider */}
                  <line x1="60" y1="275" x2="340" y2="275" stroke="#E2E8F0" strokeWidth="1"/>
                  {/* Totals section */}
                  <rect x="220" y="290" width="50" height="6" rx="2" fill="#94A3B8" opacity="0.4"/>
                  <rect x="290" y="290" width="45" height="6" rx="2" fill="#021544" opacity="0.5"/>
                  <rect x="220" y="308" width="50" height="6" rx="2" fill="#94A3B8" opacity="0.3"/>
                  <rect x="290" y="308" width="45" height="6" rx="2" fill="#021544" opacity="0.4"/>
                  <rect x="220" y="326" width="50" height="8" rx="2" fill="#00C9A7" opacity="0.6"/>
                  <rect x="290" y="326" width="45" height="8" rx="3" fill="#00C9A7"/>
                  {/* QR Code */}
                  <rect x="60" y="290" width="60" height="60" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1"/>
                  <rect x="68" y="298" width="8" height="8" rx="1" fill="#021544" opacity="0.7"/>
                  <rect x="80" y="298" width="8" height="8" rx="1" fill="#021544" opacity="0.5"/>
                  <rect x="92" y="298" width="8" height="8" rx="1" fill="#021544" opacity="0.7"/>
                  <rect x="68" y="310" width="8" height="8" rx="1" fill="#021544" opacity="0.4"/>
                  <rect x="80" y="310" width="8" height="8" rx="1" fill="#021544" opacity="0.7"/>
                  <rect x="92" y="310" width="8" height="8" rx="1" fill="#021544" opacity="0.3"/>
                  <rect x="68" y="322" width="8" height="8" rx="1" fill="#021544" opacity="0.6"/>
                  <rect x="80" y="322" width="8" height="8" rx="1" fill="#021544" opacity="0.3"/>
                  <rect x="92" y="322" width="8" height="8" rx="1" fill="#021544" opacity="0.7"/>
                  {/* Digital signature area */}
                  <rect x="60" y="370" width="280" height="40" rx="8" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1"/>
                  <rect x="75" y="382" width="16" height="16" rx="4" fill="#00C9A7" opacity="0.3"/>
                  <path d="M80 388l2 2 4-4" stroke="#00C9A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="100" y="384" width="100" height="5" rx="2" fill="#16A34A" opacity="0.4"/>
                  <rect x="100" y="394" width="70" height="4" rx="2" fill="#16A34A" opacity="0.2"/>
                  {/* Footer stamps */}
                  <rect x="60" y="430" width="130" height="5" rx="2" fill="#94A3B8" opacity="0.15"/>
                  <rect x="60" y="442" width="100" height="4" rx="2" fill="#94A3B8" opacity="0.1"/>
                  <rect x="60" y="454" width="80" height="4" rx="2" fill="#94A3B8" opacity="0.08"/>
                  {/* Stamp circle */}
                  <circle cx="310" cy="440" r="22" fill="none" stroke="#00C9A7" strokeWidth="2" opacity="0.3" strokeDasharray="4 3"/>
                  <circle cx="310" cy="440" r="16" fill="none" stroke="#00C9A7" strokeWidth="1" opacity="0.2"/>
                  <rect x="296" y="436" width="28" height="5" rx="2" fill="#00C9A7" opacity="0.3"/>
                </svg>
              </div>
              </FloatingElement>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTORS ============ */}
      <section id="sectors" className="py-24 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
          <div className="text-center mb-20">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">القطاعات المدعومة</span>
            <h3 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">
              <span className="gradient-text">15 قطاع</span> بشجرة حسابات جاهزة
            </h3>
            <p className="text-gray-500 max-w-xl mx-auto mt-3">
              اختر قطاعك وابدأ فورًا — النظام يجهّز لك الشجرة المحاسبية والضرائب المناسبة تلقائيًا
            </p>
          </div>
          </AnimatedSection>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "صناعي", iconPath: "M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3h7z", color: "#0070F2" },
              { name: "تجاري", iconPath: "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020.01 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z", color: "#00C9A7" },
              { name: "خدمي", iconPath: "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z", color: "#0070F2" },
              { name: "بنوك ومالي", iconPath: "M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z", color: "#00C9A7" },
              { name: "تأمين", iconPath: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z", color: "#0070F2" },
              { name: "عقاري", iconPath: "M1 11v10h6v-5h2v5h6V11L8 6l-7 5zm12 8h-2v-5H5v5H3v-7l5-3.5 5 3.5v7zm4-12h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm-4-16v2H7L17 1v4h4v2h-4z", color: "#00C9A7" },
              { name: "مقاولات", iconPath: "M13 2v8h8V2h-8zM3 14v8h8v-8H3zm0-12v8h8V2H3zm13.66 4.66l-5.66 5.66 2.83 2.83 5.66-5.66-2.83-2.83z", color: "#0070F2" },
              { name: "زراعي", iconPath: "M17.12 10a6.997 6.997 0 00-2.28-3.87l.97-.97a.996.996 0 10-1.41-1.41l-.97.97A6.986 6.986 0 0010 3.51V2c0-.55-.45-1-1-1s-1 .45-1 1v1.51A6.98 6.98 0 001 10h16.12zM1 12c0 4.97 4.03 9 9 9v-9H1z", color: "#00C9A7" },
              { name: "تقني / SaaS", iconPath: "M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z", color: "#0070F2" },
              { name: "غير ربحي", iconPath: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z", color: "#00C9A7" },
              { name: "تمويل جماعي", iconPath: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z", color: "#0070F2" },
              { name: "مستشفيات", iconPath: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z", color: "#00C9A7" },
              { name: "صيدليات", iconPath: "M6 3h12v2H6V3zm6 4c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm3 7h-2v2h-2v-2H9v-2h2v-2h2v2h2v2z", color: "#0070F2" },
              { name: "عيادات", iconPath: "M10.5 13H8v-3h2.5V7.5h3V10H16v3h-2.5v2.5h-3V13zM12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z", color: "#00C9A7" },
              { name: "معامل تحاليل", iconPath: "M7 2v2h1v14a4 4 0 008 0V4h1V2H7zm4 14c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z", color: "#0070F2" },
            ].map((sector) => (
              <div
                key={sector.name}
                className="group flex items-center gap-3 px-5 py-3 rounded-full bg-[#F8FAFC] border border-gray-200 hover:border-[#0070F2]/40 hover:shadow-lg hover:shadow-[#0070F2]/5 transition-all duration-300 hover:-translate-y-0.5 cursor-default"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${sector.color}15` }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={sector.color}><path d={sector.iconPath}/></svg>
                </div>
                <span className="text-sm font-bold text-[#021544] whitespace-nowrap">{sector.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMPARISON TABLE ============ */}
      <section className="py-24 relative" style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 50%, #F8FAFC 100%)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection>
          <div className="text-center mb-20">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">المقارنة</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">قارن بنفسك</h2>
            <p className="text-gray-500 mt-3">شوف الفرق بين G-Ledger والبرامج المحاسبية الأخرى</p>
          </div>
          </AnimatedSection>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#021544] text-white">
                    <th className="text-right py-4 px-6 font-bold">الميزة</th>
                    <th className="text-center py-4 px-6 font-bold">
                      <span className="text-[#00C9A7]">G-Ledger</span>
                    </th>
                    <th className="text-center py-4 px-6 font-bold">البرامج الأخرى</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "شجرة حسابات جاهزة حسب القطاع", gl: { text: "15 قطاع", status: "green" }, other: { text: "شجرة فارغة", status: "red" } },
                    { feature: "ضرائب مخصصة لكل دولة وقطاع", gl: { text: "29+ دولة", status: "green" }, other: { text: "نسبة واحدة", status: "red" } },
                    { feature: "قيود تلقائية من كل موديول", gl: { text: "تلقائي 100%", status: "green" }, other: { text: "يدوي غالبًا", status: "yellow" } },
                    { feature: "فوترة إلكترونية ETA + ZATCA", gl: { text: "مدمجة", status: "green" }, other: { text: "إضافة مدفوعة", status: "yellow" } },
                    { feature: "موديول إنتاج (5 مراحل)", gl: { text: "متكامل", status: "green" }, other: { text: "غير متوفر", status: "red" } },
                    { feature: "مساعد ذكي (AI Chatbot)", gl: { text: "45+ سؤال", status: "green" }, other: { text: "لا يوجد", status: "red" } },
                    { feature: "2FA + OTP عند كل دخول", gl: { text: "إلزامي", status: "green" }, other: { text: "اختياري", status: "yellow" } },
                    { feature: "تجربة مجانية بدون بطاقة", gl: { text: "6 أشهر", status: "green" }, other: { text: "14 يوم فقط", status: "yellow" } },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="py-4 px-6 font-medium text-[#021544]">{row.feature}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          row.gl.status === "green" ? "bg-green-100 text-green-700" : ""
                        }`}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 9L2 6l1-1 2 2 4-4 1 1L5 9z" fill="#16A34A"/></svg>
                          {row.gl.text}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          row.other.status === "red" ? "bg-red-100 text-red-600" :
                          row.other.status === "yellow" ? "bg-yellow-100 text-yellow-700" : ""
                        }`}>
                          {row.other.status === "red" ? (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3l6 6" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#CA8A04" strokeWidth="1.2" fill="none"/><rect x="5.25" y="3" width="1.5" height="4" rx="0.75" fill="#CA8A04"/><circle cx="6" cy="8.5" r="0.75" fill="#CA8A04"/></svg>
                          )}
                          {row.other.text}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
          <div className="text-center mb-20">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">الأسعار</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">أسعار بسيطة وشفافة</h2>
            <p className="text-gray-500 mt-3">ادفع فقط على ما تحتاجه — ابدأ مجاناً وكبّر حسب نموك</p>
          </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Free */}
            <div className="rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all duration-300 bg-white card-3d shadow-premium-lg">
              <div className="text-sm font-bold text-gray-500 mb-2">مجاني</div>
              <div className="text-4xl font-bold text-[#021544] mb-1">$0</div>
              <div className="text-xs text-gray-400 mb-6">6 أشهر تجربة</div>
              <ul className="space-y-3 text-sm mb-6">
                {["موديول واحد", "3 مستخدمين", "100,000 KB تخزين", "شجرة حسابات جاهزة", "مساعد ذكي"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#22C55E"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/ar/register" className="block text-center py-3 rounded-xl border-2 border-[#021544] text-[#021544] font-bold hover:bg-[#021544] hover:text-white transition-all">ابدأ مجاناً</Link>
            </div>

            {/* Basic */}
            <div className="rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all duration-300 bg-white card-3d shadow-premium-lg">
              <div className="text-sm font-bold text-blue-600 mb-2">أساسي</div>
              <div className="text-4xl font-bold text-[#021544] mb-1">$8<span className="text-lg font-normal text-gray-400">/مستخدم/شهر</span></div>
              <div className="text-xs text-gray-400 mb-6">للشركات الصغيرة</div>
              <ul className="space-y-3 text-sm mb-6">
                {["محاسبة + فواتير + مخزون", "تقارير مالية", "1 GB تخزين", "فوترة إلكترونية", "استيراد Excel"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#22C55E"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/ar/register" className="block text-center py-3 rounded-xl bg-[#0070F2] text-white font-bold hover:bg-[#005ed4] transition-all">ابدأ الآن</Link>
            </div>

            {/* Professional - POPULAR */}
            <div className="rounded-2xl border-2 border-[#0070F2] p-6 hover:shadow-xl transition-all duration-300 relative bg-gradient-to-b from-[#EFF6FF] to-white card-3d shadow-premium-lg glow-blue">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-l from-[#021544] to-[#0070F2] text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">الأكثر طلباً</div>
              <div className="text-sm font-bold text-[#0070F2] mb-2">احترافي</div>
              <div className="text-4xl font-bold text-[#021544] mb-1">$15<span className="text-lg font-normal text-gray-400">/مستخدم/شهر</span></div>
              <div className="text-xs text-gray-400 mb-6">للشركات المتوسطة</div>
              <ul className="space-y-3 text-sm mb-6">
                {["كل الموديولات", "CRM + مشاريع + مصروفات", "2 GB تخزين", "نقاط البيع POS", "موديول الإنتاج", "دعم أولوية"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#22C55E"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/ar/register" className="block text-center py-3 rounded-xl bg-[#0070F2] text-white font-bold hover:bg-[#005ed4] transition-all shadow-lg">ابدأ الآن</Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all duration-300 bg-white card-3d shadow-premium-lg">
              <div className="text-sm font-bold text-purple-600 mb-2">مؤسسي</div>
              <div className="text-4xl font-bold text-[#021544] mb-1">$25<span className="text-lg font-normal text-gray-400">/مستخدم/شهر</span></div>
              <div className="text-xs text-gray-400 mb-6">للشركات الكبيرة</div>
              <ul className="space-y-3 text-sm mb-6">
                {["كل شيء في الاحترافي", "API خارجي", "5 GB تخزين", "White Label", "دعم مخصص 24/7", "مستخدمين غير محدود"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#22C55E"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/ar/register" className="block text-center py-3 rounded-xl border-2 border-purple-600 text-purple-600 font-bold hover:bg-purple-600 hover:text-white transition-all">تواصل معنا</Link>
            </div>
          </div>

          {/* Add-ons */}
          <div className="bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] rounded-2xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-[#021544] mb-6 text-center">إضافات مدفوعة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { name: "CRM", price: "+$3/مستخدم", desc: "إدارة العملاء المحتملين", iconPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
                { name: "eCommerce", price: "+$5/مستخدم", desc: "متجر إلكتروني", iconPath: "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020.01 4H5.21l-.94-2H1z" },
                { name: "موظفين", price: "$2/موظف", desc: "HR + رواتب + إجازات", iconPath: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z" },
                { name: "POS", price: "+$3/جهاز", desc: "نقطة بيع", iconPath: "M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4z" },
                { name: "تخزين", price: "$10/GB", desc: "مساحة إضافية", iconPath: "M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zM2 14h20v-4H2v4zm2-3h2v2H4v-2z" },
              ].map((addon, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 text-center hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#0070F2]/10 flex items-center justify-center mx-auto mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0070F2"><path d={addon.iconPath}/></svg>
                  </div>
                  <div className="font-bold text-sm text-[#021544]">{addon.name}</div>
                  <div className="text-xs text-[#0070F2] font-bold mt-1">{addon.price}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{addon.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-[#021544] mb-6 text-center">طرق الدفع المدعومة</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                {
                  name: "Visa",
                  svg: <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="#1A1F71"/><text x="8" y="16" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">VISA</text></svg>
                },
                {
                  name: "Mastercard",
                  svg: <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="#F9F9F9" stroke="#E2E8F0" strokeWidth="0.5"/><circle cx="16" cy="12" r="7" fill="#EB001B" opacity="0.9"/><circle cx="24" cy="12" r="7" fill="#F79E1B" opacity="0.9"/><ellipse cx="20" cy="12" rx="3.5" ry="6" fill="#FF5F00" opacity="0.8"/></svg>
                },
                {
                  name: "مدى",
                  svg: <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="#004B87"/><rect x="8" y="8" width="10" height="8" rx="1" fill="#F5A623"/><rect x="22" y="8" width="10" height="8" rx="1" fill="white" opacity="0.8"/></svg>
                },
                {
                  name: "Apple Pay",
                  svg: <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="#000"/><path d="M14 7c-.6.7-1.5 1.2-2.4 1.1-.1-1 .4-2 .9-2.6.6-.7 1.5-1.1 2.3-1.1.1 1-.3 2-.8 2.6z" fill="white"/><path d="M14.8 8.3c-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2.1-1.4 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.6-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.1-.8-2.1-3.1 0-2 1.6-2.9 1.7-3-.9-1.4-2.4-1.6-2.9-1.7z" fill="white" transform="translate(8 -3) scale(0.7)"/></svg>
                },
                {
                  name: "Google Pay",
                  svg: <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="#F9F9F9" stroke="#E2E8F0" strokeWidth="0.5"/><circle cx="14" cy="10" r="3" fill="#4285F4"/><circle cx="20" cy="10" r="3" fill="#EA4335"/><circle cx="26" cy="10" r="3" fill="#FBBC05"/><circle cx="20" cy="16" r="3" fill="#34A853"/></svg>
                },
                {
                  name: "ميزة",
                  svg: <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="#005BAA"/><rect x="6" y="7" width="28" height="10" rx="5" fill="white" opacity="0.2"/><text x="11" y="16" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">meeza</text></svg>
                },
                {
                  name: "PayPal",
                  svg: <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="#F9F9F9" stroke="#E2E8F0" strokeWidth="0.5"/><path d="M15 6h4c2 0 3.5 1 3 3.5S19.5 13 17.5 13H16l-.5 3.5h-2.5L15 6z" fill="#003087"/><path d="M13 8h4c2 0 3.5 1 3 3.5S17.5 15 15.5 15H14l-.5 3.5h-2.5L13 8z" fill="#009CDE"/></svg>
                },
                {
                  name: "تحويل بنكي",
                  svg: <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5"/><path d="M8 10v7h3v-7H8zm6 0v7h3v-7h-3zM6 20h23v-2H6v2zm18-10v7h3v-7h-3zM17.5 4L6 8.5V10h23V8.5L17.5 4z" fill="#64748B"/></svg>
                },
                {
                  name: "STC Pay",
                  svg: <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="#5F259F"/><text x="7" y="15" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">STC</text><circle cx="32" cy="12" r="4" fill="white" opacity="0.2"/></svg>
                },
                {
                  name: "Fawry",
                  svg: <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="#F5A623"/><text x="6" y="15" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">fawry</text></svg>
                },
                {
                  name: "Vodafone Cash",
                  svg: <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="#E60000"/><circle cx="20" cy="12" r="7" fill="none" stroke="white" strokeWidth="1.5"/><path d="M18 8c0 0 2 4 2 4s2-4 2-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
                },
                {
                  name: "Instapay",
                  svg: <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="#00A651"/><path d="M12 8l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M20 8l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5"/></svg>
                },
                {
                  name: "Stripe",
                  svg: <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="#635BFF"/><text x="7" y="15" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">stripe</text></svg>
                },
              ].map((method, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  {method.svg}
                  <span className="text-xs font-medium text-[#021544]">{method.name}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">ادفع بأمان عبر بوابات الدفع المعتمدة — لا نحفظ بيانات بطاقتك</p>
          </div>
        </div>
      </section>

      {/* ============ ACCOUNTING TIPS & NEWS ============ */}
      <section className="py-24 relative" style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
          <div className="text-center mb-20">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">نصائح محاسبية</span>
            <h2 className="text-3xl font-bold text-[#021544] mt-4">أخبار ونصائح مالية</h2>
            <p className="text-gray-500 mt-2">ابقَ على اطلاع بآخر التحديثات الضريبية والمحاسبية</p>
          </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                tag: "الفوترة الإلكترونية",
                tagColor: "bg-green-100 text-green-700",
                title: "المرحلة الثانية من ZATCA — ما الذي تحتاج معرفته؟",
                desc: "هيئة الزكاة والضريبة والجمارك بدأت تطبيق المرحلة الثانية (التكامل) من الفوترة الإلكترونية. G-Ledger يدعم التكامل المباشر مع بوابة فاتورة شاملةً التوقيع الرقمي وختم التشفير.",
                date: "مارس 2026",
              },
              {
                tag: "مصر — ETA",
                tagColor: "bg-blue-100 text-blue-700",
                title: "تحديثات منظومة الفاتورة الإلكترونية المصرية 2026",
                desc: "مصلحة الضرائب المصرية وسّعت نطاق الإلزام ليشمل جميع الممولين. النظام يدعم التكامل مع ETA بما في ذلك التوقيع الإلكتروني وتكويد الأصناف EGS/GS1.",
                date: "فبراير 2026",
              },
              {
                tag: "نصيحة محاسبية",
                tagColor: "bg-purple-100 text-purple-700",
                title: "5 أخطاء شائعة في المحاسبة وكيف تتجنبها",
                desc: "1. عدم فصل المصروفات الشخصية عن التجارية\n2. تأخير تسجيل القيود\n3. إهمال التسويات البنكية\n4. عدم متابعة تقادم الديون\n5. نسيان احتساب الإهلاك الشهري — G-Ledger يحلها كلها تلقائيًا.",
                date: "مارس 2026",
              },
              {
                tag: "ضريبة",
                tagColor: "bg-amber-100 text-amber-700",
                title: "ضريبة القيمة المضافة — الفرق بين مصر والسعودية",
                desc: "مصر 14% مع إعفاءات للقطاع الصحي والبنوك والزراعة + خصم منبع. السعودية 15% موحدة مع استثناء العقارات (5% RETT). G-Ledger يحسب الضريبة تلقائيًا حسب دولتك وقطاعك.",
                date: "يناير 2026",
              },
              {
                tag: "إدارة أعمال",
                tagColor: "bg-rose-100 text-rose-700",
                title: "كيف تختار النظام المحاسبي المناسب لشركتك؟",
                desc: "أهم المعايير: دعم قطاعك بشجرة حسابات جاهزة، التوافق مع الفوترة الإلكترونية، سهولة الاستخدام، الأمان، والتكلفة. G-Ledger يوفر 15 قطاع جاهز مع تجربة مجانية بدون بطاقة ائتمان.",
                date: "ديسمبر 2025",
              },
              {
                tag: "تحديث النظام",
                tagColor: "bg-cyan-100 text-cyan-700",
                title: "G-Ledger يدعم الآن موديول الإنتاج والتصنيع",
                desc: "أصبح بإمكانك تتبع دورة الإنتاج الكاملة — من شراء المواد الخام إلى المنتج النهائي. دعم التشغيل الخارجي (مقاولي الباطن) مع تتبع التكلفة في كل مرحلة وقيود تلقائية.",
                date: "مارس 2026",
              },
            ].map((article, i) => (
              <article key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="h-1.5" style={{ background: "linear-gradient(90deg, #021544, #0070F2, #00C9A7)" }} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${article.tagColor}`}>{article.tag}</span>
                    <span className="text-[11px] text-gray-400">{article.date}</span>
                  </div>
                  <h3 className="font-bold text-[#021544] mb-2 group-hover:text-[#0070F2] transition-colors leading-tight">{article.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{article.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #021544 0%, #0070F2 100%)" }}>
        {/* Background SVG pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="cta-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="white"/>
                <path d="M0 30h60M30 0v60" stroke="white" strokeWidth="0.5" opacity="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-pattern)"/>
          </svg>
        </div>
        {/* Floating shapes */}
        <div className="absolute top-10 right-20 w-32 h-32 border border-white/10 rounded-full" />
        <div className="absolute bottom-10 left-10 w-48 h-48 border border-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 border border-[#00C9A7]/10 rounded-lg rotate-45" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-medium mb-8">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#00C9A7"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            بدون بطاقة ائتمان — بدون التزام
          </div>

          <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
            ابدأ الآن — مجانًا
          </h3>
          <p className="text-white/70 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
            سجّل واحصل على تجربة مجانية 6 أشهر — بدون بطاقة ائتمان، بدون التزام
          </p>

          <Link
            href="/ar/register"
            className="inline-block px-14 py-5 text-lg font-bold bg-white text-[#021544] rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            ابدأ تجربتك المجانية
          </Link>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: "15+", label: "قطاع مدعوم" },
              { value: "14", label: "دولة عربية" },
              { value: "6", label: "أشهر مجانًا" },
              { value: "100%", label: "قيود تلقائية" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-[#00C9A7]">{stat.value}</div>
                <div className="text-sm text-white/60 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#021544] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <h4 className="text-sm font-bold mb-4 text-white/80">الشركة</h4>
              <ul className="space-y-2 text-white/50 text-sm">
                <li><a href="#why-different" className="hover:text-white transition-colors">عن G-Ledger</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">المميزات</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">الأسعار</a></li>
                <li><a href="#sectors" className="hover:text-white transition-colors">القطاعات</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-white/80">الموارد</h4>
              <ul className="space-y-2 text-white/50 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</a></li>
                <li><a href="#einvoice" className="hover:text-white transition-colors">الفوترة الإلكترونية</a></li>
                <li><Link href="/ar/legal/terms" className="hover:text-white transition-colors">شروط الاستخدام</Link></li>
                <li><Link href="/ar/legal/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link></li>
                <li><Link href="/ar/legal/sla" className="hover:text-white transition-colors">اتفاقية الخدمة</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-white/80">تواصل معنا</h4>
              <ul className="space-y-2 text-white/50 text-sm">
                <li>
                  <a href="https://m.me/61574741902666" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.12 7.24V22l3.04-1.67c.82.23 1.68.35 2.58.35h.26c5.64 0 10-4.13 10-9.68C21 6.13 17.64 2 12 2z"/></svg>
                    ماسنجر
                  </a>
                </li>
                <li>
                  <a href="mailto:info@g-ledger.com" className="hover:text-white transition-colors flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    info@g-ledger.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Brand description */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h12v2H3v-2z" fill="white" opacity="0.7"/>
                    <path d="M17 16l3-3-3-3v2h-4v2h4v2z" fill="#00C9A7"/>
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-bold">G-Ledger</span>
                  <span className="text-xs text-white/50 block">المحاسب الذكي</span>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                نظام محاسبي سحابي متعدد القطاعات مع شجرة حسابات جاهزة وضرائب مخصصة لكل دولة وقطاع.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <VisitorCounter variant="footer" />
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-white/40 text-xs">
            <span>&copy; 2026 G-Ledger — المحاسب الذكي. جميع الحقوق محفوظة.</span>
            <div className="flex items-center gap-4 mt-2 md:mt-0">
              <a
                href="https://www.facebook.com/profile.php?id=61574741902666"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
