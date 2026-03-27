import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#021544] to-[#0052CC] flex items-center justify-center shadow-lg shadow-primary/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h12v2H3v-2z" fill="white" opacity="0.7"/>
                  <path d="M17 16l3-3-3-3v2h-4v2h4v2z" fill="#00C9A7"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#021544] leading-tight">G-Ledger</h1>
              <span className="text-[10px] text-muted-foreground leading-none">المحاسب الذكي</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#021544]">
            <a href="#features" className="hover:text-primary transition-colors">المميزات</a>
            <a href="#sectors" className="hover:text-primary transition-colors">القطاعات</a>
            <a href="#einvoice" className="hover:text-primary transition-colors">الفوترة الإلكترونية</a>
            <a href="#pricing" className="hover:text-primary transition-colors">الأسعار</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/ar/login"
              className="px-5 py-2.5 text-sm font-semibold text-[#021544] hover:text-primary transition-colors"
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
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(to bottom, rgba(9,24,61,1), rgba(0,112,242,1))" }}>
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#00C9A7] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-[#00C9A7] animate-pulse" />
              متوافق مع الفوترة الإلكترونية — مصر (ETA) والسعودية (ZATCA)
            </div>

            <h2 className="text-4xl md:text-[52px] font-bold text-white leading-tight mb-6">
              نظامك المحاسبي الذكي
              <br />
              <span className="text-[#00C9A7]">لكل القطاعات</span>
            </h2>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              شجرة حسابات جاهزة لـ 15 قطاع مختلف — من الصناعي والتجاري إلى الطبي والمقاولات.
              <br className="hidden md:block" />
              اختر قطاعك والنظام يجهّز لك كل شيء في ثوانٍ.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/ar/register"
                className="px-10 py-4 text-base font-bold bg-white text-[#162560] rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                ابدأ مجانًا — بدون بطاقة ائتمان
              </Link>
              <a
                href="#features"
                className="px-10 py-4 text-base font-semibold bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                اكتشف المميزات
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                15 قطاع مدعوم
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                عربي وإنجليزي
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                تجربة مجانية 14 يوم
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                فوترة إلكترونية متكاملة
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full"><path d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z" fill="white"/></svg>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary mb-2 block">لماذا G-Ledger؟</span>
            <h3 className="text-3xl md:text-4xl font-bold text-[#021544] mb-4">
              حلول محاسبية متكاملة في منصة واحدة
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              كل ما تحتاجه لإدارة حساباتك باحترافية — من القيد اليومي إلى القوائم المالية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "15 قطاع مدعوم",
                desc: "شجرة حسابات مُعدّة مسبقًا لكل قطاع — صناعي، تجاري، طبي، مقاولات، بنوك، والمزيد",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                ),
                color: "from-blue-500 to-blue-600",
              },
              {
                title: "القيد المزدوج",
                desc: "نظام محاسبي احترافي يضمن توازن كل قيد تلقائيًا مع تتبع كامل لكل حركة مالية",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 6h16M4 12h16M4 18h10"/><circle cx="19" cy="18" r="3"/>
                  </svg>
                ),
                color: "from-indigo-500 to-indigo-600",
              },
              {
                title: "تقارير مالية فورية",
                desc: "قائمة الدخل، الميزانية العمومية، ميزان المراجعة — جاهزة في أي لحظة بنقرة واحدة",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 5-6"/>
                  </svg>
                ),
                color: "from-emerald-500 to-emerald-600",
              },
              {
                title: "الفوترة الإلكترونية",
                desc: "متكامل مع مصلحة الضرائب المصرية (ETA) وهيئة الزكاة السعودية (ZATCA) — إرسال مباشر",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 14l2 2 4-4"/>
                  </svg>
                ),
                color: "from-orange-500 to-orange-600",
              },
              {
                title: "عربي وإنجليزي",
                desc: "واجهة كاملة بالعربية مع دعم الإنجليزية — أسماء حسابات ثنائية اللغة لكل شجرة",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10A15 15 0 0112 2z"/>
                  </svg>
                ),
                color: "from-cyan-500 to-cyan-600",
              },
              {
                title: "آمن وسحابي",
                desc: "بياناتك مشفرة ومحمية على خوادم سحابية — متاحة من أي مكان وأي جهاز على مدار الساعة",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                ),
                color: "from-violet-500 to-violet-600",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-7 rounded-2xl bg-white border border-border/60 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-[#021544] mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ E-INVOICE SECTION ============ */}
      <section id="einvoice" className="py-20" style={{ background: "linear-gradient(to bottom, rgba(9,24,61,1), rgba(0,112,242,1))" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#00C9A7] mb-2 block">الفوترة الإلكترونية</span>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              الامتثال الضريبي أسهل مما تتخيّل
            </h3>
            <p className="text-white/60 max-w-xl mx-auto">
              أرسل فواتيرك الإلكترونية مباشرة لمصلحة الضرائب — بدون وسيط وبدون تعقيد
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Egypt Card */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/15 transition-all">
              <div className="text-4xl mb-4">🇪🇬</div>
              <h4 className="text-xl font-bold text-white mb-2">مصر — مصلحة الضرائب (ETA)</h4>
              <ul className="space-y-3 text-white/70 text-sm">
                <li className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                  تكامل مباشر عبر API مع منظومة الفاتورة الإلكترونية
                </li>
                <li className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                  دعم التوقيع الإلكتروني وتكويد الأصناف (EGS/GS1)
                </li>
                <li className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                  ض.ق.م + ضريبة الجدول + الخصم من المنبع
                </li>
                <li className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                  بيئة اختبار Pre-Production + بيئة الإنتاج
                </li>
              </ul>
            </div>

            {/* Saudi Card */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/15 transition-all">
              <div className="text-4xl mb-4">🇸🇦</div>
              <h4 className="text-xl font-bold text-white mb-2">السعودية — هيئة الزكاة (ZATCA)</h4>
              <ul className="space-y-3 text-white/70 text-sm">
                <li className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                  المرحلة الأولى (التوليد) والثانية (التكامل)
                </li>
                <li className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                  فواتير XML (UBL 2.1) مع QR Code وتوقيع رقمي
                </li>
                <li className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                  Clearance للقياسية + Reporting للمبسطة
                </li>
                <li className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                  CSID Onboarding + بوابة فاتورة (FATOORA)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTORS ============ */}
      <section id="sectors" className="py-20 md:py-28 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary mb-2 block">القطاعات المدعومة</span>
            <h3 className="text-3xl md:text-4xl font-bold text-[#021544] mb-4">
              شجرة حسابات جاهزة لكل قطاع
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              اختر قطاعك وابدأ فورًا — النظام يجهّز لك الشجرة المحاسبية المناسبة تلقائيًا
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { name: "صناعي", icon: "🏭", desc: "تكاليف إنتاج" },
              { name: "تجاري", icon: "🛒", desc: "مشتريات ومبيعات" },
              { name: "خدمي", icon: "💼", desc: "إيرادات خدمات" },
              { name: "بنوك ومالي", icon: "🏦", desc: "قروض وودائع" },
              { name: "تأمين", icon: "🛡️", desc: "أقساط واحتياطيات" },
              { name: "عقاري", icon: "🏗️", desc: "إيجارات واستثمار" },
              { name: "مقاولات", icon: "🔨", desc: "عقود ومستخلصات" },
              { name: "زراعي", icon: "🌾", desc: "أصول بيولوجية" },
              { name: "تقني / SaaS", icon: "💻", desc: "اشتراكات متكررة" },
              { name: "غير ربحي", icon: "❤️", desc: "تبرعات ومنح" },
              { name: "تمويل جماعي", icon: "🤝", desc: "أمانات وعمولات" },
              { name: "مستشفيات", icon: "🏥", desc: "أقسام طبية" },
              { name: "صيدليات", icon: "💊", desc: "باتش وصلاحية" },
              { name: "عيادات", icon: "🩺", desc: "كشف واستشارات" },
              { name: "معامل تحاليل", icon: "🔬", desc: "كواشف وتحاليل" },
            ].map((sector) => (
              <div
                key={sector.name}
                className="group p-5 rounded-xl bg-white border border-border/60 text-center hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 cursor-default"
              >
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{sector.icon}</span>
                <span className="text-sm font-bold text-[#021544] block">{sector.name}</span>
                <span className="text-[11px] text-muted-foreground">{sector.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section id="pricing" className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-[#021544] mb-4">
            جاهز تبدأ؟
          </h3>
          <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">
            سجّل الآن واحصل على تجربة مجانية لمدة 14 يوم — بدون بطاقة ائتمان
          </p>

          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link
              href="/ar/register"
              className="px-12 py-4 text-base font-bold bg-[#0070F2] text-white rounded-xl hover:bg-[#005ed4] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              ابدأ تجربتك المجانية
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary">15+</div>
              <div className="text-sm text-muted-foreground mt-1">قطاع مدعوم</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">2</div>
              <div className="text-sm text-muted-foreground mt-1">دولة (مصر + السعودية)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground mt-1">سحابي وآمن</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#021544] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
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
              <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                نظام محاسبي سحابي متعدد القطاعات مع دعم الفوترة الإلكترونية لمصر والسعودية.
                شجرة حسابات جاهزة لكل قطاع — ابدأ في ثوانٍ.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-white/80">روابط سريعة</h4>
              <ul className="space-y-2 text-white/50 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">المميزات</a></li>
                <li><a href="#sectors" className="hover:text-white transition-colors">القطاعات</a></li>
                <li><a href="#einvoice" className="hover:text-white transition-colors">الفوترة الإلكترونية</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">الأسعار</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-white/80">تواصل معنا</h4>
              <ul className="space-y-2 text-white/50 text-sm">
                <li>info@g-ledger.com</li>
                <li>الرياض، المملكة العربية السعودية</li>
                <li>القاهرة، جمهورية مصر العربية</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-white/40 text-xs">
            <span>© 2026 G-Ledger — المحاسب الذكي. جميع الحقوق محفوظة.</span>
            <span className="mt-2 md:mt-0">نظامك المحاسبي الذكي لكل القطاعات</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
