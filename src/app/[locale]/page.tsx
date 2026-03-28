import Link from "next/link";
import { LogoFull } from "@/components/logo";
import { VisitorCounter } from "@/components/visitor-counter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <LogoFull size="md" variant="dark" />

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

            {/* Visitor Counter */}
            <VisitorCounter variant="landing" />

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

      {/* ============ FEATURES DETAIL ============ */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">مميزات النظام</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">كل ما تحتاجه لإدارة أعمالك</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">نظام ERP متكامل يغطي جميع العمليات المحاسبية والإدارية — من القيد اليومي إلى التقارير المالية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "\ud83d\udcdd", title: "القيود المحاسبية", desc: "قيد مزدوج تلقائي مع ترحيل وعكس. كل عملية في النظام تُنشئ قيدها المحاسبي بدون تدخل يدوي. دعم كامل للقيد المركب.", color: "blue" },
              { icon: "\ud83e\uddfe", title: "الفوترة الإلكترونية", desc: "متوافق مع ETA مصر و ZATCA السعودية. توقيع إلكتروني، QR Code، تكويد أصناف GS1/EGS، وإرسال مباشر لمنظومة الضرائب.", color: "green" },
              { icon: "\ud83d\udc65", title: "العملاء والموردين", desc: "إدارة كاملة لحسابات العملاء والموردين. كشف حساب، تقرير تقادم ديون (30/60/90/120 يوم)، حد ائتمان، وشروط دفع مخصصة.", color: "purple" },
              { icon: "\ud83d\udcb0", title: "الرواتب والموارد البشرية", desc: "مسير رواتب شهري تلقائي مع حساب التأمينات الاجتماعية GOSI (9.75% + 11.75%). بيانات الموظفين، البدلات، والقيد المحاسبي تلقائي.", color: "red" },
              { icon: "\ud83d\udce6", title: "إدارة المخزون", desc: "تتبع المنتجات بالباتش وتاريخ الصلاحية. حركات وارد/صادر/تسوية مع تنبيهات نقص المخزون وتقييم تلقائي (FIFO/متوسط مرجح).", color: "amber" },
              { icon: "\ud83c\udfd7\ufe0f", title: "الأصول الثابتة والإهلاك", desc: "سجل أصول متكامل مع إهلاك شهري تلقائي (قسط ثابت/متناقص). استبعاد وبيع الأصول مع حساب الربح والخسارة تلقائيًا.", color: "teal" },
              { icon: "\ud83c\udfe6", title: "البنوك والنقدية", desc: "إدارة حسابات بنكية متعددة. إيداع، سحب، تحويل بين الحسابات، وتسوية/مطابقة بنكية. كل حركة تُنشئ قيد تلقائي.", color: "indigo" },
              { icon: "\ud83c\udfed", title: "الإنتاج والتصنيع", desc: "أوامر إنتاج بـ 5 مراحل — من شراء المواد الخام إلى المنتج النهائي. دعم التشغيل الخارجي (مقاولي باطن) وتتبع التكلفة لكل مرحلة.", color: "violet" },
              { icon: "\ud83d\udcca", title: "التقارير المالية", desc: "ميزان مراجعة، قائمة دخل، ميزانية عمومية، أستاذ عام، كشف حساب. جميع التقارير لحظية من القيود المرحّلة مباشرةً.", color: "sky" },
              { icon: "\ud83c\udf0d", title: "14 دولة عربية", desc: "دعم كامل لـ 14 دولة مع ضرائب مخصصة لكل قطاع. العملات والأنظمة الضريبية تُحدد تلقائيًا حسب الدولة والقطاع.", color: "emerald" },
              { icon: "\ud83d\udd10", title: "أمان على مستوى بنكي", desc: "تشفير SSL/TLS، مصادقة ثنائية (2FA) بكود إيميل عند كل دخول، عزل كامل بين الشركات، ونسخ احتياطي يومي تلقائي.", color: "rose" },
              { icon: "\ud83e\udd16", title: "مساعد ذكي 24/7", desc: "شات بوت ذكي يجيب على أسئلتك عن النظام فورًا بالعربية. 45+ فئة سؤال تغطي كل الموديولات من القيود للرواتب للمخزون.", color: "cyan" },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border/50 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-[#021544] mb-2 group-hover:text-[#0070F2] transition-colors">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
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

      {/* ============ ACCOUNTING TIPS & NEWS ============ */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">نصائح محاسبية</span>
            <h2 className="text-3xl font-bold text-[#021544] mt-4">أخبار ونصائح مالية</h2>
            <p className="text-muted-foreground mt-2">ابقَ على اطلاع بآخر التحديثات الضريبية والمحاسبية</p>
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
                    <span className="text-[11px] text-muted-foreground">{article.date}</span>
                  </div>
                  <h3 className="font-bold text-[#021544] mb-2 group-hover:text-[#0070F2] transition-colors leading-tight">{article.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{article.desc}</p>
                </div>
              </article>
            ))}
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

          <div className="mb-6">
            <VisitorCounter variant="footer" />
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
