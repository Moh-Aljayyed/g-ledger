import Link from "next/link";
import { LogoFull } from "@/components/logo";
import { VisitorCounter } from "@/components/visitor-counter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
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
              "14 دولة عربية مدعومة",
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
                  text: "يدعم 14 دولة عربية: السعودية، مصر، الإمارات، الكويت، البحرين، عمان، قطر، الأردن، العراق، المغرب، تونس، السودان، ليبيا، ولبنان. مع ضرائب مخصصة لكل دولة وقطاع.",
                },
              },
            ],
          }),
        }}
      />

      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50">
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
            <Link
              href="/ar/login"
              className="px-5 py-2.5 text-sm font-semibold text-[#021544] hover:text-[#0070F2] transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/ar/register"
              className="px-6 py-2.5 text-sm font-semibold bg-white text-[#162560] rounded-lg hover:bg-gray-100 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 border border-border/30"
            >
              ابدأ تجربتك المجانية
            </Link>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #021544 0%, #0070F2 100%)" }}>
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-[#00C9A7] rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0070F2] rounded-full blur-3xl opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-[#00C9A7] animate-pulse" />
              متوافق مع ETA + ZATCA | 14 دولة عربية | 15 قطاع
            </div>

            <h1 className="text-4xl md:text-[56px] font-bold text-white leading-tight mb-6">
              اختر قطاعك...
              <br />
              <span className="text-[#00C9A7]">ونظامك جاهز</span>
            </h1>

            <p className="text-lg md:text-xl text-white/75 max-w-3xl mx-auto mb-10 leading-relaxed">
              أول نظام محاسبي عربي بشجرة حسابات جاهزة لكل قطاع وضرائب مخصصة لكل دولة — النظام يجهّز لك كل شيء في ثوانٍ
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/ar/register"
                className="px-10 py-4 text-base font-bold bg-white text-[#021544] rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                ابدأ مجانًا — 6 أشهر بدون بطاقة
              </Link>
              <a
                href="#why-different"
                className="px-10 py-4 text-base font-semibold bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                شاهد المميزات
              </a>
            </div>

            {/* Visitor Counter */}
            <VisitorCounter variant="landing" />

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-8 mt-8">
              {[
                { label: "15 قطاع", icon: "M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h12v2H3v-2z" },
                { label: "14 دولة", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" },
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
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full"><path d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z" fill="white"/></svg>
        </div>
      </section>

      {/* ============ WHY DIFFERENT ============ */}
      <section id="why-different" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">ما يميّزنا</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">لماذا G-Ledger مختلف؟</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">الفرق الذي ستلاحظه من أول لحظة — ليس مجرد برنامج محاسبي آخر</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="relative bg-gradient-to-br from-[#021544] to-[#0070F2] rounded-2xl p-8 text-white overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3h7zM7 9H4V5h3v4zm10 6h3v4h-3v-4zm0-10h3v4h-3V5z" fill="#00C9A7"/></svg>
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

            {/* Card 2 */}
            <div className="relative bg-gradient-to-br from-[#021544] to-[#0070F2] rounded-2xl p-8 text-white overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" fill="#00C9A7"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">ضرائب ذكية — مش رقم واحد للكل</h3>
                <p className="text-white/70 leading-relaxed text-sm">
                  هل تعرف إن القطاع الطبي في مصر معفى من ض.ق.م بينما المقاولات 14% + خصم منبع 3%؟ G-Ledger يعرف — ويحسب الضريبة الصحيحة تلقائيًا حسب دولتك وقطاعك.
                </p>
                <div className="mt-6 flex items-center gap-2 text-[#00C9A7] text-sm font-semibold">
                  <span>14 دولة عربية</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></svg>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative bg-gradient-to-br from-[#021544] to-[#0070F2] rounded-2xl p-8 text-white overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="#00C9A7"/></svg>
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
          </div>
        </div>
      </section>

      {/* ============ MODULES / FEATURES ============ */}
      <section id="features" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">الموديولات</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">نظام ERP متكامل</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">12 موديول يغطي كل العمليات المحاسبية والإدارية — من القيد اليومي إلى التقارير المالية</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { icon: "\ud83d\udcdd", title: "القيود المحاسبية", desc: "قيد مزدوج تلقائي مع ترحيل وعكس وقيد مركب" },
              { icon: "\ud83e\uddfe", title: "الفوترة الإلكترونية", desc: "ETA مصر + ZATCA السعودية مع توقيع إلكتروني وQR" },
              { icon: "\ud83d\udc65", title: "العملاء والموردين", desc: "كشف حساب، تقادم ديون، حد ائتمان، شروط دفع" },
              { icon: "\ud83d\udcb0", title: "الرواتب والـ HR", desc: "مسير رواتب تلقائي مع تأمينات GOSI وبدلات" },
              { icon: "\ud83d\udce6", title: "المخزون", desc: "باتش، صلاحية، FIFO/متوسط مرجح، تنبيهات نقص" },
              { icon: "\ud83c\udfd7\ufe0f", title: "الأصول الثابتة", desc: "إهلاك شهري تلقائي — قسط ثابت أو متناقص" },
              { icon: "\ud83c\udfe6", title: "البنوك والنقدية", desc: "حسابات متعددة، تحويلات، تسوية بنكية تلقائية" },
              { icon: "\ud83c\udfed", title: "الإنتاج والتصنيع", desc: "5 مراحل — من المواد الخام إلى المنتج النهائي" },
              { icon: "\ud83d\udcca", title: "التقارير المالية", desc: "ميزان مراجعة، قائمة دخل، ميزانية، أستاذ عام" },
              { icon: "\ud83c\udf0d", title: "14 دولة عربية", desc: "ضرائب وعملات مخصصة لكل دولة وقطاع تلقائيًا" },
              { icon: "\ud83d\udd10", title: "أمان بنكي", desc: "2FA + OTP عند كل دخول، تشفير SSL، عزل كامل" },
              { icon: "\ud83e\udd16", title: "مساعد ذكي", desc: "شات بوت بالعربية — 45+ فئة سؤال عن كل الموديولات" },
            ].map((mod, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border/50 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="text-3xl mb-3">{mod.icon}</div>
                <h3 className="text-base font-bold text-[#021544] mb-1.5 group-hover:text-[#0070F2] transition-colors">{mod.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ E-INVOICE SECTION ============ */}
      <section id="einvoice" className="py-20" style={{ background: "linear-gradient(135deg, #021544 0%, #0070F2 100%)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#00C9A7] mb-2 block">الفوترة الإلكترونية</span>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              متوافق مع ETA مصر و ZATCA السعودية
            </h3>
            <p className="text-white/60 max-w-xl mx-auto">
              أرسل فواتيرك الإلكترونية مباشرة لمصلحة الضرائب — بدون وسيط وبدون تعقيد
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Egypt Card */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/15 transition-all">
              <div className="text-4xl mb-4">{"\ud83c\uddea\ud83c\uddec"}</div>
              <h4 className="text-xl font-bold text-white mb-4">مصر — مصلحة الضرائب (ETA)</h4>
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
              <div className="text-4xl mb-4">{"\ud83c\uddf8\ud83c\udde6"}</div>
              <h4 className="text-xl font-bold text-white mb-4">السعودية — هيئة الزكاة (ZATCA)</h4>
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
      </section>

      {/* ============ SECTORS ============ */}
      <section id="sectors" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">القطاعات المدعومة</span>
            <h3 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">
              15 قطاع بشجرة حسابات جاهزة
            </h3>
            <p className="text-gray-500 max-w-xl mx-auto mt-3">
              اختر قطاعك وابدأ فورًا — النظام يجهّز لك الشجرة المحاسبية والضرائب المناسبة تلقائيًا
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { name: "صناعي", icon: "\ud83c\udfed", desc: "تكاليف إنتاج ومراحل تصنيع" },
              { name: "تجاري", icon: "\ud83d\uded2", desc: "مشتريات ومبيعات وفوترة" },
              { name: "خدمي", icon: "\ud83d\udcbc", desc: "إيرادات خدمات واستشارات" },
              { name: "بنوك ومالي", icon: "\ud83c\udfe6", desc: "قروض وودائع وفوائد" },
              { name: "تأمين", icon: "\ud83d\udee1\ufe0f", desc: "أقساط واحتياطيات ومطالبات" },
              { name: "عقاري", icon: "\ud83c\udfd7\ufe0f", desc: "إيجارات واستثمار عقاري" },
              { name: "مقاولات", icon: "\ud83d\udd28", desc: "عقود ومستخلصات ومقاولي باطن" },
              { name: "زراعي", icon: "\ud83c\udf3e", desc: "أصول بيولوجية ومحاصيل" },
              { name: "تقني / SaaS", icon: "\ud83d\udcbb", desc: "اشتراكات متكررة وSaaS" },
              { name: "غير ربحي", icon: "\u2764\ufe0f", desc: "تبرعات ومنح وأنشطة" },
              { name: "تمويل جماعي", icon: "\ud83e\udd1d", desc: "أمانات وعمولات ومستثمرين" },
              { name: "مستشفيات", icon: "\ud83c\udfe5", desc: "أقسام طبية وتأمينات صحية" },
              { name: "صيدليات", icon: "\ud83d\udc8a", desc: "باتش وصلاحية وأدوية" },
              { name: "عيادات", icon: "\ud83e\ude7a", desc: "كشف واستشارات وحجوزات" },
              { name: "معامل تحاليل", icon: "\ud83d\udd2c", desc: "كواشف وتحاليل ونتائج" },
            ].map((sector) => (
              <div
                key={sector.name}
                className="group p-5 rounded-xl bg-[#F8FAFC] border border-border/60 text-center hover:border-[#0070F2]/40 hover:shadow-lg hover:shadow-[#0070F2]/5 transition-all duration-300 hover:-translate-y-1 cursor-default"
              >
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{sector.icon}</span>
                <span className="text-sm font-bold text-[#021544] block">{sector.name}</span>
                <span className="text-[11px] text-gray-500">{sector.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMPARISON TABLE ============ */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">المقارنة</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">قارن بنفسك</h2>
            <p className="text-gray-500 mt-3">شوف الفرق بين G-Ledger والبرامج المحاسبية الأخرى</p>
          </div>

          <div className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-lg">
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
                    { feature: "ضرائب مخصصة لكل دولة وقطاع", gl: { text: "14 دولة", status: "green" }, other: { text: "نسبة واحدة", status: "red" } },
                    { feature: "قيود تلقائية من كل موديول", gl: { text: "تلقائي 100%", status: "green" }, other: { text: "يدوي غالبًا", status: "yellow" } },
                    { feature: "فوترة إلكترونية ETA + ZATCA", gl: { text: "مدمجة", status: "green" }, other: { text: "إضافة مدفوعة", status: "yellow" } },
                    { feature: "موديول إنتاج (5 مراحل)", gl: { text: "متكامل", status: "green" }, other: { text: "غير متوفر", status: "red" } },
                    { feature: "مساعد ذكي (AI Chatbot)", gl: { text: "45+ سؤال", status: "green" }, other: { text: "لا يوجد", status: "red" } },
                    { feature: "2FA + OTP عند كل دخول", gl: { text: "إلزامي", status: "green" }, other: { text: "اختياري", status: "yellow" } },
                    { feature: "تجربة مجانية بدون بطاقة", gl: { text: "6 أشهر", status: "green" }, other: { text: "14 يوم فقط", status: "yellow" } },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-4 px-6 font-medium text-[#021544]">{row.feature}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          row.gl.status === "green" ? "bg-green-100 text-green-700" : ""
                        }`}>
                          <span>{row.gl.status === "green" ? "\u2705" : ""}</span>
                          {row.gl.text}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          row.other.status === "red" ? "bg-red-100 text-red-600" :
                          row.other.status === "yellow" ? "bg-yellow-100 text-yellow-700" : ""
                        }`}>
                          <span>{row.other.status === "red" ? "\u274c" : "\u26a0\ufe0f"}</span>
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
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">الأسعار</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">أسعار بسيطة وشفافة</h2>
            <p className="text-muted-foreground mt-3">ادفع فقط على ما تحتاجه — ابدأ مجاناً وكبّر حسب نموك</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Free */}
            <div className="rounded-2xl border-2 border-border p-6 hover:shadow-lg transition-all">
              <div className="text-sm font-bold text-gray-500 mb-2">مجاني</div>
              <div className="text-4xl font-bold text-[#021544] mb-1">$0</div>
              <div className="text-xs text-muted-foreground mb-6">6 أشهر تجربة</div>
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> موديول واحد</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 3 مستخدمين</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 100,000 KB تخزين</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> شجرة حسابات جاهزة</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> مساعد ذكي</li>
              </ul>
              <Link href="/ar/register" className="block text-center py-3 rounded-xl border-2 border-[#021544] text-[#021544] font-bold hover:bg-[#021544] hover:text-white transition-all">ابدأ مجاناً</Link>
            </div>

            {/* Basic */}
            <div className="rounded-2xl border-2 border-border p-6 hover:shadow-lg transition-all">
              <div className="text-sm font-bold text-blue-600 mb-2">أساسي</div>
              <div className="text-4xl font-bold text-[#021544] mb-1">$8<span className="text-lg font-normal text-muted-foreground">/مستخدم/شهر</span></div>
              <div className="text-xs text-muted-foreground mb-6">للشركات الصغيرة</div>
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> محاسبة + فواتير + مخزون</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> تقارير مالية</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 1 GB تخزين</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> فوترة إلكترونية</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> استيراد Excel</li>
              </ul>
              <Link href="/ar/register" className="block text-center py-3 rounded-xl bg-[#0070F2] text-white font-bold hover:bg-[#005ed4] transition-all">ابدأ الآن</Link>
            </div>

            {/* Professional - POPULAR */}
            <div className="rounded-2xl border-2 border-[#0070F2] p-6 hover:shadow-lg transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0070F2] text-white text-xs font-bold px-4 py-1 rounded-full">الأكثر طلباً</div>
              <div className="text-sm font-bold text-[#0070F2] mb-2">احترافي</div>
              <div className="text-4xl font-bold text-[#021544] mb-1">$15<span className="text-lg font-normal text-muted-foreground">/مستخدم/شهر</span></div>
              <div className="text-xs text-muted-foreground mb-6">للشركات المتوسطة</div>
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> كل الموديولات</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> CRM + مشاريع + مصروفات</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 2 GB تخزين</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> نقاط البيع POS</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> موديول الإنتاج</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> دعم أولوية</li>
              </ul>
              <Link href="/ar/register" className="block text-center py-3 rounded-xl bg-[#0070F2] text-white font-bold hover:bg-[#005ed4] transition-all shadow-lg">ابدأ الآن</Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border-2 border-border p-6 hover:shadow-lg transition-all">
              <div className="text-sm font-bold text-purple-600 mb-2">مؤسسي</div>
              <div className="text-4xl font-bold text-[#021544] mb-1">$25<span className="text-lg font-normal text-muted-foreground">/مستخدم/شهر</span></div>
              <div className="text-xs text-muted-foreground mb-6">للشركات الكبيرة</div>
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> كل شيء في الاحترافي</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> API خارجي</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 5 GB تخزين</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> White Label</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> دعم مخصص 24/7</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> مستخدمين غير محدود</li>
              </ul>
              <Link href="/ar/register" className="block text-center py-3 rounded-xl border-2 border-purple-600 text-purple-600 font-bold hover:bg-purple-600 hover:text-white transition-all">تواصل معنا</Link>
            </div>
          </div>

          {/* Add-ons */}
          <div className="bg-[#F8FAFC] rounded-2xl p-8">
            <h3 className="text-xl font-bold text-[#021544] mb-6 text-center">إضافات مدفوعة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { name: "CRM", price: "+$3/مستخدم", desc: "إدارة العملاء المحتملين", icon: "🎯" },
                { name: "eCommerce", price: "+$5/مستخدم", desc: "متجر إلكتروني", icon: "🛒" },
                { name: "موظفين", price: "$2/موظف", desc: "HR + رواتب + إجازات", icon: "👥" },
                { name: "POS", price: "+$3/جهاز", desc: "نقطة بيع", icon: "🖥️" },
                { name: "تخزين", price: "$10/GB", desc: "مساحة إضافية", icon: "💾" },
              ].map((addon, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-border text-center">
                  <div className="text-2xl mb-2">{addon.icon}</div>
                  <div className="font-bold text-sm text-[#021544]">{addon.name}</div>
                  <div className="text-xs text-[#0070F2] font-bold mt-1">{addon.price}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{addon.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-12 bg-white rounded-2xl border border-border p-8">
            <h3 className="text-xl font-bold text-[#021544] mb-6 text-center">طرق الدفع المدعومة</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "Visa", icon: "💳" },
                { name: "Mastercard", icon: "💳" },
                { name: "مدى", icon: "🇸🇦" },
                { name: "Apple Pay", icon: "🍎" },
                { name: "Google Pay", icon: "📱" },
                { name: "ميزة", icon: "🇪🇬" },
                { name: "PayPal", icon: "💰" },
                { name: "تحويل بنكي", icon: "🏦" },
                { name: "STC Pay", icon: "📲" },
                { name: "Fawry", icon: "🏪" },
                { name: "Vodafone Cash", icon: "📞" },
                { name: "Instapay", icon: "🔄" },
                { name: "Stripe", icon: "⚡" },
              ].map((method, i) => (
                <div key={i} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-sm transition-all">
                  <span className="text-2xl">{method.icon}</span>
                  <span className="text-xs font-medium text-[#021544]">{method.name}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">ادفع بأمان عبر بوابات الدفع المعتمدة — لا نحفظ بيانات بطاقتك</p>
          </div>
        </div>
      </section>

      {/* ============ ACCOUNTING TIPS & NEWS ============ */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">نصائح محاسبية</span>
            <h2 className="text-3xl font-bold text-[#021544] mt-4">أخبار ونصائح مالية</h2>
            <p className="text-gray-500 mt-2">ابقَ على اطلاع بآخر التحديثات الضريبية والمحاسبية</p>
          </div>

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
              <article key={i} className="bg-white rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="h-2" style={{ background: "linear-gradient(90deg, #021544, #0070F2)" }} />
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
      <section className="py-20" style={{ background: "linear-gradient(135deg, #021544 0%, #0070F2 100%)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ابدأ الآن — مجانًا
          </h3>
          <p className="text-white/70 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            سجّل واحصل على تجربة مجانية 6 أشهر — بدون بطاقة ائتمان، بدون التزام
          </p>

          <Link
            href="/ar/register"
            className="inline-block px-12 py-4 text-base font-bold bg-white text-[#021544] rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            ابدأ تجربتك المجانية
          </Link>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: "15+", label: "قطاع مدعوم" },
              { value: "14", label: "دولة عربية" },
              { value: "6", label: "أشهر مجانًا" },
              { value: "100%", label: "قيود تلقائية" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-[#00C9A7]">{stat.value}</div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
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
              <span>اختر قطاعك... ونظامك جاهز</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
