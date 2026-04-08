import Link from "next/link";
import { LogoFull } from "@/components/logo";
import { VisitorCounter } from "@/components/visitor-counter";
import { LangLink } from "@/components/lang-link";
import { AnimatedSection, AnimatedCard, FloatingElement } from "@/components/animated-landing";
import { PricingCards } from "@/components/pricing-cards";
import { AddonsCards } from "@/components/addons-cards";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === "ar";

  // Geo-based pricing: Egypt=EGP, Gulf=SAR, Rest=USD
  // Rate: $1 = 50 EGP = 5 SAR
  const gulfCountries = ["SA", "AE", "KW", "BH", "OM", "QA"];
  // Detect from locale (Arabic=likely MENA, default USD)
  // Server can't detect IP, so we use locale + show all currencies
  const prices = {
    free: { usd: 0, egp: 0, sar: 0 },
    basic: { usd: 8, egp: 400, sar: 40 },
    pro: { usd: 15, egp: 750, sar: 75 },
    enterprise: { usd: 25, egp: 1250, sar: 125 },
  };
  // Show EGP for Arabic (Egypt market), SAR, and USD
  const priceDisplay = (tier: keyof typeof prices) =>
    isAr
      ? `${prices[tier].egp} ج.م / ${prices[tier].sar} ر.س`
      : `$${prices[tier].usd}`;

  // Free trial: 6 months until end of April 2026, then 14 days
  const isPromoActive = new Date() <= new Date("2026-04-30");
  const trialText = isPromoActive
    ? (isAr ? "6 أشهر مجاناً (حتى نهاية أبريل)" : "6 months free (until end of April)")
    : (isAr ? "14 يوم تجربة مجانية" : "14-day free trial");

  const t = {
    nav: {
      features: isAr ? "المميزات" : "Features",
      sectors: isAr ? "القطاعات" : "Sectors",
      einvoice: isAr ? "الفوترة الإلكترونية" : "E-Invoicing",
      pricing: isAr ? "الأسعار" : "Pricing",
      blog: isAr ? "المدونة" : "Blog",
      integrations: isAr ? "التكاملات" : "Integrations",
      api: isAr ? "API المطورين" : "Developer API",
      login: isAr ? "تسجيل الدخول" : "Login",
      register: isAr ? "ابدأ تجربتك المجانية" : "Start Free Trial",
    },
    hero: {
      badge: isAr ? "29+ دولة | 15 قطاع | فوترة إلكترونية" : "29+ Countries | 15 Sectors | E-Invoicing",
      title1: isAr ? "اختر قطاعك..." : "Choose Your Sector...",
      title2: isAr ? "ونظامك جاهز" : "Your System is Ready",
      subtitle: isAr
        ? "أول نظام محاسبي عربي بشجرة حسابات جاهزة لكل قطاع وضرائب مخصصة لكل دولة — النظام يجهّز لك كل شيء في ثوانٍ"
        : "The first accounting system with a ready chart of accounts for every sector and custom taxes for every country — setup in seconds",
      cta1: isAr ? "ابدأ مجانًا — 6 أشهر بدون بطاقة" : "Start Free — 6 Months No Card",
      cta2: isAr ? "شاهد المميزات" : "View Features",
      trust1: isAr ? "+5,000 مستخدم" : "5,000+ Users",
      trust2: isAr ? "29 دولة" : "29 Countries",
      trust3: isAr ? "15 قطاع" : "15 Sectors",
      trust4: isAr ? "100% قيود تلقائية" : "100% Auto Entries",
    },
    whyDifferent: {
      badge: isAr ? "ما يميّزنا" : "What Sets Us Apart",
      title: isAr ? "لماذا G-Ledger مختلف؟" : "Why is G-Ledger Different?",
      subtitle: isAr ? "الفرق الذي ستلاحظه من أول لحظة — ليس مجرد برنامج محاسبي آخر" : "The difference you'll notice from the first moment — not just another accounting software",
      card1Title: isAr ? "شجرة حسابات جاهزة — مش فاضية" : "Ready Chart of Accounts — Not Empty",
      card1Desc: isAr
        ? "البرامج الأخرى تعطيك شجرة فارغة وتتركك تبنيها من الصفر. G-Ledger يعطيك شجرة مكتملة ومصممة خصيصًا لقطاعك — صناعي، طبي، مقاولات، أو أي قطاع آخر."
        : "Other software gives you an empty chart. G-Ledger gives you a complete chart designed specifically for your sector — manufacturing, medical, contracting, or any other.",
      card1Stat: isAr ? "15 قطاع جاهز" : "15 Ready Sectors",
      card2Title: isAr ? "ضرائب ذكية — مش رقم واحد للكل" : "Smart Taxes — Not One Rate for All",
      card2Desc: isAr
        ? "هل تعرف إن القطاع الطبي في مصر معفى من ض.ق.م بينما المقاولات 14% + خصم منبع 0.5%؟ G-Ledger يعرف — ويحسب الضريبة الصحيحة تلقائيًا حسب دولتك وقطاعك."
        : "Did you know Egypt's medical sector is VAT-exempt while contracting is 14% + 0.5% WHT? G-Ledger knows — and calculates the correct tax automatically for your country and sector.",
      card2Stat: isAr ? "29+ دولة حول العالم" : "29+ Countries Worldwide",
      card3Title: isAr ? "كل شيء ينشئ قيد تلقائي" : "Everything Creates Auto Journal Entries",
      card3Desc: isAr
        ? "فاتورة؟ قيد. راتب؟ قيد. حركة مخزون؟ قيد. إهلاك؟ قيد. إنتاج؟ قيد. كل عملية في النظام تُنشئ قيدها المحاسبي تلقائيًا — صفر إدخال يدوي."
        : "Invoice? Entry. Salary? Entry. Stock? Entry. Depreciation? Entry. Production? Entry. Every operation auto-creates its journal entry — zero manual input.",
      card3Stat: isAr ? "تلقائي 100%" : "100% Automatic",
    },
    modules: {
      badge: isAr ? "الموديولات" : "Modules",
      title: isAr ? "نظام ERP متكامل" : "Complete ERP System",
      subtitle: isAr ? "12 موديول يغطي كل العمليات المحاسبية والإدارية — من القيد اليومي إلى التقارير المالية" : "12 modules covering all accounting and administrative operations — from journal entries to financial reports",
    },
    moduleItems: [
      {
        title: isAr ? "القيود المحاسبية" : "Journal Entries",
        desc: isAr ? "قيد مزدوج تلقائي مع ترحيل وعكس وقيد مركب" : "Auto double-entry with posting, reversal & compound entries",
      },
      {
        title: isAr ? "الفوترة الإلكترونية" : "E-Invoicing",
        desc: isAr ? "ETA مصر + ZATCA السعودية مع توقيع إلكتروني وQR" : "ETA Egypt + ZATCA Saudi with digital signature & QR",
      },
      {
        title: isAr ? "العملاء والموردين" : "Clients & Vendors",
        desc: isAr ? "كشف حساب، تقادم ديون، حد ائتمان، شروط دفع" : "Statements, aging, credit limits, payment terms",
      },
      {
        title: isAr ? "الرواتب والـ HR" : "Payroll & HR",
        desc: isAr ? "مسير رواتب تلقائي مع تأمينات GOSI وبدلات" : "Auto payroll with GOSI insurance & allowances",
      },
      {
        title: isAr ? "المخزون" : "Inventory",
        desc: isAr ? "باتش، صلاحية، FIFO/متوسط مرجح، تنبيهات نقص" : "Batch, expiry, FIFO/weighted avg, low stock alerts",
      },
      {
        title: isAr ? "الأصول الثابتة" : "Fixed Assets",
        desc: isAr ? "إهلاك شهري تلقائي — قسط ثابت أو متناقص" : "Auto monthly depreciation — straight-line or declining",
      },
      {
        title: isAr ? "البنوك والنقدية" : "Banks & Cash",
        desc: isAr ? "حسابات متعددة، تحويلات، تسوية بنكية تلقائية" : "Multi-accounts, transfers, auto bank reconciliation",
      },
      {
        title: isAr ? "الإنتاج والتصنيع" : "Production & Manufacturing",
        desc: isAr ? "5 مراحل — من المواد الخام إلى المنتج النهائي" : "5 phases — from raw materials to finished product",
      },
      {
        title: isAr ? "التقارير المالية" : "Financial Reports",
        desc: isAr ? "ميزان مراجعة، قائمة دخل، ميزانية، أستاذ عام" : "Trial balance, income statement, balance sheet, general ledger",
      },
      {
        title: isAr ? "29+ دولة حول العالم" : "29+ Countries Worldwide",
        desc: isAr ? "ضرائب وعملات مخصصة لكل دولة وقطاع تلقائيًا" : "Custom taxes & currencies for each country & sector automatically",
      },
      {
        title: isAr ? "أمان بنكي" : "Bank-Level Security",
        desc: isAr ? "2FA + OTP عند كل دخول، تشفير SSL، عزل كامل" : "2FA + OTP on every login, SSL encryption, full isolation",
      },
      {
        title: isAr ? "مساعد ذكي" : "AI Assistant",
        desc: isAr ? "شات بوت بالعربية — 45+ فئة سؤال عن كل الموديولات" : "Arabic chatbot — 45+ question categories across all modules",
      },
    ],
    einvoice: {
      badge: isAr ? "الفوترة الإلكترونية" : "E-Invoicing",
      title: isAr ? "متوافق مع ETA مصر و ZATCA السعودية" : "ETA Egypt & ZATCA Saudi Compliant",
      subtitle: isAr ? "أرسل فواتيرك الإلكترونية مباشرة لمصلحة الضرائب — بدون وسيط وبدون تعقيد" : "Send e-invoices directly to tax authorities — no middleman, no complexity",
      egyptTitle: isAr ? "مصر — مصلحة الضرائب (ETA)" : "Egypt — Tax Authority (ETA)",
      egyptItems: isAr
        ? [
            "تكامل مباشر عبر API مع منظومة الفاتورة الإلكترونية",
            "دعم التوقيع الإلكتروني وتكويد الأصناف (EGS/GS1)",
            "ض.ق.م + ضريبة الجدول + الخصم من المنبع",
            "بيئة اختبار Pre-Production + بيئة الإنتاج",
            "ضرائب مخصصة: طبي = 0%، مقاولات = 14% + 3% خصم منبع",
          ]
        : [
            "Direct API integration with the e-invoicing system",
            "Digital signature & item coding support (EGS/GS1)",
            "VAT + Table Tax + Withholding Tax",
            "Pre-Production test environment + Production",
            "Custom taxes: Medical = 0%, Contracting = 14% + 0.5% WHT",
          ],
      saudiTitle: isAr ? "السعودية — هيئة الزكاة (ZATCA)" : "Saudi Arabia — ZATCA",
      saudiItems: isAr
        ? [
            "المرحلة الأولى (التوليد) والثانية (التكامل)",
            "فواتير XML (UBL 2.1) مع QR Code وتوقيع رقمي",
            "Clearance للقياسية + Reporting للمبسطة",
            "CSID Onboarding + بوابة فاتورة (FATOORA)",
            "ضريبة القيمة المضافة 15% مع استثناء RETT 5%",
          ]
        : [
            "Phase 1 (Generation) & Phase 2 (Integration)",
            "XML invoices (UBL 2.1) with QR Code & digital signature",
            "Clearance for standard + Reporting for simplified",
            "CSID Onboarding + FATOORA portal",
            "15% VAT with RETT 5% exception",
          ],
    },
    sectors: {
      badge: isAr ? "القطاعات المدعومة" : "Supported Sectors",
      title1: isAr ? "15 قطاع" : "15 Sectors",
      title2: isAr ? " بشجرة حسابات جاهزة" : " with Ready Chart of Accounts",
      subtitle: isAr ? "اختر قطاعك وابدأ فورًا — النظام يجهّز لك الشجرة المحاسبية والضرائب المناسبة تلقائيًا" : "Choose your sector and start immediately — the system sets up your chart of accounts and taxes automatically",
    },
    sectorNames: isAr
      ? ["صناعي","تجاري","خدمي","بنوك ومالي","تأمين","عقاري","مقاولات","زراعي","تقني / SaaS","غير ربحي","تمويل جماعي","مستشفيات","صيدليات","عيادات","معامل تحاليل"]
      : ["Manufacturing","Commercial","Services","Banking & Finance","Insurance","Real Estate","Contracting","Agriculture","Tech / SaaS","Non-Profit","Crowdfunding","Hospitals","Pharmacies","Clinics","Laboratories"],
    comparison: {
      badge: isAr ? "المقارنة" : "Comparison",
      title: isAr ? "قارن بنفسك" : "Compare Yourself",
      subtitle: isAr ? "شوف الفرق بين G-Ledger والبرامج المحاسبية الأخرى" : "See the difference between G-Ledger and other accounting software",
      featureHeader: isAr ? "الميزة" : "Feature",
      otherHeader: isAr ? "البرامج الأخرى" : "Other Software",
    },
    comparisonRows: [
      { feature: isAr ? "شجرة حسابات جاهزة حسب القطاع" : "Ready chart of accounts per sector", gl: { text: isAr ? "15 قطاع" : "15 Sectors", status: "green" }, other: { text: isAr ? "شجرة فارغة" : "Empty chart", status: "red" } },
      { feature: isAr ? "ضرائب مخصصة لكل دولة وقطاع" : "Custom taxes per country & sector", gl: { text: isAr ? "29+ دولة" : "29+ Countries", status: "green" }, other: { text: isAr ? "نسبة واحدة" : "One rate", status: "red" } },
      { feature: isAr ? "قيود تلقائية من كل موديول" : "Auto entries from every module", gl: { text: isAr ? "تلقائي 100%" : "100% Auto", status: "green" }, other: { text: isAr ? "يدوي غالبًا" : "Mostly manual", status: "yellow" } },
      { feature: isAr ? "فوترة إلكترونية ETA + ZATCA" : "E-invoicing ETA + ZATCA", gl: { text: isAr ? "مدمجة" : "Built-in", status: "green" }, other: { text: isAr ? "إضافة مدفوعة" : "Paid add-on", status: "yellow" } },
      { feature: isAr ? "موديول إنتاج (5 مراحل)" : "Production module (5 phases)", gl: { text: isAr ? "متكامل" : "Integrated", status: "green" }, other: { text: isAr ? "غير متوفر" : "Not available", status: "red" } },
      { feature: isAr ? "مساعد ذكي (AI Chatbot)" : "AI Chatbot", gl: { text: isAr ? "45+ سؤال" : "45+ Questions", status: "green" }, other: { text: isAr ? "لا يوجد" : "None", status: "red" } },
      { feature: isAr ? "2FA + OTP عند كل دخول" : "2FA + OTP on every login", gl: { text: isAr ? "إلزامي" : "Mandatory", status: "green" }, other: { text: isAr ? "اختياري" : "Optional", status: "yellow" } },
      { feature: isAr ? "تجربة مجانية بدون بطاقة" : "Free trial without card", gl: { text: trialText, status: "green" }, other: { text: isAr ? "14 يوم فقط" : "14 days only", status: "yellow" } },
    ],
    pricing: {
      badge: isAr ? "الأسعار" : "Pricing",
      title: isAr ? "أسعار بسيطة وشفافة" : "Simple & Transparent Pricing",
      subtitle: isAr ? "ادفع فقط على ما تحتاجه — ابدأ مجاناً وكبّر حسب نموك" : "Pay only for what you need — start free and scale as you grow",
      free: isAr ? "مجاني" : "Free",
      freeTrialPeriod: trialText,
      basic: isAr ? "أساسي" : "Basic",
      basicDesc: isAr ? "للشركات الصغيرة" : "For small businesses",
      professional: isAr ? "احترافي" : "Professional",
      professionalDesc: isAr ? "للشركات المتوسطة" : "For medium businesses",
      enterprise: isAr ? "مؤسسي" : "Enterprise",
      enterpriseDesc: isAr ? "للشركات الكبيرة" : "For large businesses",
      mostPopular: isAr ? "الأكثر طلباً" : "Most Popular",
      startFree: isAr ? "ابدأ مجاناً" : "Start Free",
      startNow: isAr ? "ابدأ الآن" : "Start Now",
      contactUs: isAr ? "تواصل معنا" : "Contact Us",
      perUserMonth: isAr ? "/مستخدم/شهر" : "/user/mo",
      addons: isAr ? "إضافات مدفوعة" : "Paid Add-ons",
      paymentMethods: isAr ? "طرق الدفع المدعومة" : "Supported Payment Methods",
      paymentNote: isAr ? "ادفع بأمان عبر بوابات الدفع المعتمدة — لا نحفظ بيانات بطاقتك" : "Pay securely via certified gateways — we never store your card details",
    },
    pricingFreeItems: isAr
      ? ["موديول واحد", "3 مستخدمين", "100,000 KB تخزين", "شجرة حسابات جاهزة", "مساعد ذكي"]
      : ["One module", "3 users", "100,000 KB storage", "Ready chart of accounts", "AI assistant"],
    pricingBasicItems: isAr
      ? ["محاسبة + فواتير + مخزون", "تقارير مالية", "1 GB تخزين", "فوترة إلكترونية", "استيراد Excel"]
      : ["Accounting + Invoicing + Inventory", "Financial reports", "1 GB storage", "E-invoicing", "Excel import"],
    pricingProItems: isAr
      ? ["كل الموديولات", "CRM + مشاريع + مصروفات", "2 GB تخزين", "نقاط البيع POS", "موديول الإنتاج", "دعم أولوية"]
      : ["All modules", "CRM + Projects + Expenses", "2 GB storage", "POS Point of Sale", "Production module", "Priority support"],
    pricingEnterpriseItems: isAr
      ? ["كل شيء في الاحترافي", "API خارجي", "5 GB تخزين", "White Label", "دعم مخصص 24/7", "مستخدمين غير محدود"]
      : ["Everything in Professional", "External API", "5 GB storage", "White Label", "Dedicated 24/7 support", "Unlimited users"],
    tips: {
      badge: isAr ? "نصائح محاسبية" : "Accounting Tips",
      title: isAr ? "أخبار ونصائح مالية" : "Financial News & Tips",
      subtitle: isAr ? "ابقَ على اطلاع بآخر التحديثات الضريبية والمحاسبية" : "Stay updated with the latest tax and accounting news",
    },
    tipArticles: [
      {
        tag: isAr ? "الفوترة الإلكترونية" : "E-Invoicing",
        tagColor: "bg-green-100 text-green-700",
        title: isAr ? "المرحلة الثانية من ZATCA — ما الذي تحتاج معرفته؟" : "ZATCA Phase 2 — What You Need to Know",
        desc: isAr
          ? "هيئة الزكاة والضريبة والجمارك بدأت تطبيق المرحلة الثانية (التكامل) من الفوترة الإلكترونية. G-Ledger يدعم التكامل المباشر مع بوابة فاتورة شاملةً التوقيع الرقمي وختم التشفير."
          : "ZATCA has started implementing Phase 2 (Integration) of e-invoicing. G-Ledger supports direct integration with the FATOORA portal including digital signatures and cryptographic stamps.",
        date: isAr ? "مارس 2026" : "March 2026",
        image: "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400",
        imageAlt: isAr ? "تقارير ورسوم بيانية مالية" : "Financial reports and charts",
      },
      {
        tag: isAr ? "مصر — ETA" : "Egypt — ETA",
        tagColor: "bg-blue-100 text-blue-700",
        title: isAr ? "تحديثات منظومة الفاتورة الإلكترونية المصرية 2026" : "Egypt E-Invoice System Updates 2026",
        desc: isAr
          ? "مصلحة الضرائب المصرية وسّعت نطاق الإلزام ليشمل جميع الممولين. النظام يدعم التكامل مع ETA بما في ذلك التوقيع الإلكتروني وتكويد الأصناف EGS/GS1."
          : "Egypt's Tax Authority expanded the mandate to all taxpayers. The system supports ETA integration including digital signatures and EGS/GS1 item coding.",
        date: isAr ? "فبراير 2026" : "February 2026",
        image: "https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=400",
        imageAlt: isAr ? "حاسبة وحسابات مالية" : "Calculator and financial accounts",
      },
      {
        tag: isAr ? "نصيحة محاسبية" : "Accounting Tip",
        tagColor: "bg-purple-100 text-purple-700",
        title: isAr ? "5 أخطاء شائعة في المحاسبة وكيف تتجنبها" : "5 Common Accounting Mistakes & How to Avoid Them",
        desc: isAr
          ? "1. عدم فصل المصروفات الشخصية عن التجارية\n2. تأخير تسجيل القيود\n3. إهمال التسويات البنكية\n4. عدم متابعة تقادم الديون\n5. نسيان احتساب الإهلاك الشهري — G-Ledger يحلها كلها تلقائيًا."
          : "1. Not separating personal & business expenses\n2. Delaying journal entries\n3. Neglecting bank reconciliation\n4. Not tracking aging receivables\n5. Forgetting monthly depreciation — G-Ledger solves all automatically.",
        date: isAr ? "مارس 2026" : "March 2026",
        image: "https://images.pexels.com/photos/5483071/pexels-photo-5483071.jpeg?auto=compress&cs=tinysrgb&w=400",
        imageAlt: isAr ? "أتمتة العمليات المحاسبية" : "Accounting automation",
      },
      {
        tag: isAr ? "ضريبة" : "Tax",
        tagColor: "bg-amber-100 text-amber-700",
        title: isAr ? "ضريبة القيمة المضافة — الفرق بين مصر والسعودية" : "VAT — Difference Between Egypt & Saudi Arabia",
        desc: isAr
          ? "مصر 14% مع إعفاءات للقطاع الصحي والبنوك والزراعة + خصم منبع. السعودية 15% موحدة مع استثناء العقارات (5% RETT). G-Ledger يحسب الضريبة تلقائيًا حسب دولتك وقطاعك."
          : "Egypt 14% with exemptions for healthcare, banks & agriculture + WHT. Saudi 15% unified with real estate exception (5% RETT). G-Ledger calculates tax automatically based on your country and sector.",
        date: isAr ? "يناير 2026" : "January 2026",
        image: "https://images.pexels.com/photos/4386373/pexels-photo-4386373.jpeg?auto=compress&cs=tinysrgb&w=400",
        imageAlt: isAr ? "ضرائب وحسابات مالية" : "Tax and financial calculations",
      },
      {
        tag: isAr ? "إدارة أعمال" : "Business Management",
        tagColor: "bg-rose-100 text-rose-700",
        title: isAr ? "كيف تختار النظام المحاسبي المناسب لشركتك؟" : "How to Choose the Right Accounting System for Your Business?",
        desc: isAr
          ? "أهم المعايير: دعم قطاعك بشجرة حسابات جاهزة، التوافق مع الفوترة الإلكترونية، سهولة الاستخدام، الأمان، والتكلفة. G-Ledger يوفر 15 قطاع جاهز مع تجربة مجانية بدون بطاقة ائتمان."
          : "Key criteria: sector support with ready chart of accounts, e-invoicing compliance, ease of use, security, and cost. G-Ledger offers 15 ready sectors with a free trial — no credit card needed.",
        date: isAr ? "ديسمبر 2025" : "December 2025",
        image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400",
        imageAlt: isAr ? "فريق عمل يناقش اختيار نظام" : "Team discussing system selection",
      },
      {
        tag: isAr ? "تحديث النظام" : "System Update",
        tagColor: "bg-cyan-100 text-cyan-700",
        title: isAr ? "G-Ledger يدعم الآن موديول الإنتاج والتصنيع" : "G-Ledger Now Supports Production & Manufacturing Module",
        desc: isAr
          ? "أصبح بإمكانك تتبع دورة الإنتاج الكاملة — من شراء المواد الخام إلى المنتج النهائي. دعم التشغيل الخارجي (مقاولي الباطن) مع تتبع التكلفة في كل مرحلة وقيود تلقائية."
          : "You can now track the full production cycle — from raw material purchase to finished product. Support for outsourcing (subcontractors) with cost tracking at every stage and auto journal entries.",
        date: isAr ? "مارس 2026" : "March 2026",
        image: "https://images.pexels.com/photos/3735709/pexels-photo-3735709.jpeg?auto=compress&cs=tinysrgb&w=400",
        imageAlt: isAr ? "مصنع وآلات حديثة" : "Factory and modern machinery",
      },
    ],
    cta: {
      badge: isAr ? "بدون بطاقة ائتمان — بدون التزام" : "No Credit Card — No Commitment",
      title: isAr ? "ابدأ الآن — مجانًا" : "Start Now — Free",
      subtitle: isAr ? "سجّل واحصل على تجربة مجانية 6 أشهر — بدون بطاقة ائتمان، بدون التزام" : "Register and get a 6-month free trial — no credit card, no commitment",
      cta: isAr ? "ابدأ تجربتك المجانية" : "Start Your Free Trial",
      stat1Label: isAr ? "قطاع مدعوم" : "Supported Sectors",
      stat2Label: isAr ? "دولة حول العالم" : "Countries Worldwide",
      stat3Label: isAr ? "أشهر مجانًا" : "Free Months",
      stat4Label: isAr ? "قيود تلقائية" : "Auto Entries",
    },
    footer: {
      company: isAr ? "الشركة" : "Company",
      about: isAr ? "عن G-Ledger" : "About G-Ledger",
      features: isAr ? "المميزات" : "Features",
      pricing: isAr ? "الأسعار" : "Pricing",
      sectors: isAr ? "القطاعات" : "Sectors",
      resources: isAr ? "الموارد" : "Resources",
      helpCenter: isAr ? "مركز المساعدة" : "Help Center",
      faq: isAr ? "الأسئلة الشائعة" : "FAQ",
      einvoice: isAr ? "الفوترة الإلكترونية" : "E-Invoicing",
      terms: isAr ? "شروط الاستخدام" : "Terms of Service",
      privacy: isAr ? "سياسة الخصوصية" : "Privacy Policy",
      sla: isAr ? "اتفاقية الخدمة" : "SLA",
      contact: isAr ? "تواصل معنا" : "Contact Us",
      messenger: isAr ? "ماسنجر" : "Messenger",
      smartAccountant: isAr ? "حساب الأستاذ" : "General Ledger",
      brandDesc: isAr
        ? "نظام محاسبي سحابي متعدد القطاعات مع شجرة حسابات جاهزة وضرائب مخصصة لكل دولة وقطاع."
        : "Multi-sector cloud accounting system with ready chart of accounts and custom taxes for every country and sector.",
      copyright: isAr ? "© 2026 G-Ledger — حساب الأستاذ. جميع الحقوق محفوظة." : "© 2026 G-Ledger — General Ledger. All rights reserved.",
    },
  };

  return (
    <div className="min-h-screen bg-white" dir={isAr ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif" }}>
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
            description: "حساب الأستاذ — لكل القطاعات — Smart Accounting for Every Sector",
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
            <a href="#features" className="hover:text-[#0070F2] transition-colors">{t.nav.features}</a>
            <a href="#sectors" className="hover:text-[#0070F2] transition-colors">{t.nav.sectors}</a>
            <a href="#einvoice" className="hover:text-[#0070F2] transition-colors">{t.nav.einvoice}</a>
            <a href="#pricing" className="hover:text-[#0070F2] transition-colors">{t.nav.pricing}</a>
            <Link href={`/${locale}/blog`} className="hover:text-[#0070F2] transition-colors">{t.nav.blog}</Link>
            <Link href={`/${locale}/integrations`} className="hover:text-[#0070F2] transition-colors">{t.nav.integrations}</Link>
          </nav>

          <div className="flex items-center gap-3">
            <LangLink variant="header" />
            <Link
              href={`/${locale}/login`}
              className="px-5 py-2.5 text-sm font-semibold text-[#021544] hover:text-[#0070F2] transition-colors"
            >
              {t.nav.login}
            </Link>
            <a
              href="#pricing"
              className={`px-6 py-2.5 text-sm font-semibold bg-gradient-to-l from-[#021544] to-[#0070F2] text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all`}
            >
              {t.nav.register}
            </a>
          </div>
        </div>
      </header>

      {/* ============ ANNOUNCEMENT BANNER — RAQYY INTEGRATION ============ */}
      <a
        href="https://raqyy.com"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-gradient-to-r from-[#0d4d35] via-[#0f5f3e] to-[#0d4d35] border-b border-[#c9a14a]/40 hover:brightness-110 transition-all"
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center gap-3 text-center text-white text-sm md:text-base font-medium">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#c9a14a] text-[#0d4d35] text-[10px] md:text-xs font-bold uppercase tracking-wide">
            {isAr ? "جديد" : "New"}
          </span>
          <span className="text-[#f5e6b8]">
            {isAr
              ? "تم التكامل مع رقي (Raqyy) — مزامنة فواتير المبيعات والمخزون تلقائياً من raqyy.com"
              : "Now integrated with Raqyy — auto-sync your sales invoices and inventory from raqyy.com"}
          </span>
          <span className="hidden md:inline text-[#c9a14a]">→</span>
        </div>
      </a>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #021544 0%, #0a2a6e 50%, #0070F2 100%)" }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
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
                {t.hero.badge}
              </div>

              <h1 className="text-4xl md:text-[56px] font-bold text-white leading-tight mb-6">
                {t.hero.title1}
                <br />
                <span className="text-[#00C9A7]">{t.hero.title2}</span>
              </h1>

              <p className="text-lg md:text-xl text-white/75 max-w-xl mb-10 leading-relaxed">
                {t.hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <a
                  href="#pricing"
                  className="px-10 py-4 text-base font-bold bg-white text-[#021544] rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  {t.hero.cta1}
                </a>
                <a
                  href="#why-different"
                  className="px-10 py-4 text-base font-semibold bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm text-center"
                >
                  {t.hero.cta2}
                </a>
              </div>

              {/* Visitor Counter */}
              <VisitorCounter variant="landing" />

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 mt-8">
                {[
                  { label: t.hero.trust1, icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" },
                  { label: t.hero.trust2, icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" },
                  { label: t.hero.trust3, icon: "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" },
                  { label: t.hero.trust4, icon: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" },
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

            {/* Dashboard image (left side in RTL) */}
            <div className="hidden lg:block">
              <FloatingElement speed="slow">
              <div className="relative">
                <div className="absolute -inset-4 bg-[#0070F2]/20 rounded-3xl blur-2xl" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 img-branded">
                  <img src="https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=600" alt={isAr ? "لوحة تحكم محاسبية" : "Accounting Dashboard"} className="w-full h-auto" loading="eager" />
                </div>
                <svg viewBox="0 0 1 1" className="hidden">
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
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">{t.whyDifferent.badge}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">{t.whyDifferent.title}</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">{t.whyDifferent.subtitle}</p>
          </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 - Chart tree */}
            <AnimatedCard delay={0}>
            <div className="relative bg-gradient-to-br from-[#021544] to-[#0070F2] rounded-2xl p-8 text-white overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-premium">
              <div className="h-40 overflow-hidden rounded-t-xl -mx-8 -mt-8 mb-4 img-branded">
                <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80" alt="رسوم بيانية ومستندات مالية" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
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
                <h3 className="text-xl font-bold mb-3">{t.whyDifferent.card1Title}</h3>
                <p className="text-white/70 leading-relaxed text-sm">
                  {t.whyDifferent.card1Desc}
                </p>
                <div className="mt-6 flex items-center gap-2 text-[#00C9A7] text-sm font-semibold">
                  <span>{t.whyDifferent.card1Stat}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></svg>
                </div>
              </div>
            </div>

            </AnimatedCard>
            {/* Card 2 - Globe with checkmark */}
            <AnimatedCard delay={150}>
            <div className="relative bg-gradient-to-br from-[#021544] to-[#0070F2] rounded-2xl p-8 text-white overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-premium">
              <div className="h-40 overflow-hidden rounded-t-xl -mx-8 -mt-8 mb-4 img-branded">
                <img src="https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80" alt="آلة حاسبة ومستندات مالية" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
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
                <h3 className="text-xl font-bold mb-3">{t.whyDifferent.card2Title}</h3>
                <p className="text-white/70 leading-relaxed text-sm">
                  {t.whyDifferent.card2Desc}
                </p>
                <div className="mt-6 flex items-center gap-2 text-[#00C9A7] text-sm font-semibold">
                  <span>{t.whyDifferent.card2Stat}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></svg>
                </div>
              </div>
            </div>

            </AnimatedCard>
            {/* Card 3 - Auto-sync arrows */}
            <AnimatedCard delay={300}>
            <div className="relative bg-gradient-to-br from-[#021544] to-[#0070F2] rounded-2xl p-8 text-white overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-premium">
              <div className="h-40 overflow-hidden rounded-t-xl -mx-8 -mt-8 mb-4 img-branded">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" alt="لوحة تحكم وتحليلات" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
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
                <h3 className="text-xl font-bold mb-3">{t.whyDifferent.card3Title}</h3>
                <p className="text-white/70 leading-relaxed text-sm">
                  {t.whyDifferent.card3Desc}
                </p>
                <div className="mt-6 flex items-center gap-2 text-[#00C9A7] text-sm font-semibold">
                  <span>{t.whyDifferent.card3Stat}</span>
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
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">{t.modules.badge}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">{t.modules.title}</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">{t.modules.subtitle}</p>
          </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              {
                title: t.moduleItems[0].title,
                desc: t.moduleItems[0].desc,
                iconPath: "M4 4h16v2H4V4zm0 4h10v2H4V8zm0 4h16v2H4v-2zm0 4h10v2H4v-2zm14-2l3 3-3 3v-2h-4v-2h4v-2z",
                color: "#0070F2",
                image: "https://images.pexels.com/photos/6694543/pexels-photo-6694543.jpeg?auto=compress&cs=tinysrgb&w=400",
                imageAlt: isAr ? "محاسب يعمل على دفتر حسابات" : "Accountant working on ledger",
              },
              {
                title: t.moduleItems[1].title,
                desc: t.moduleItems[1].desc,
                iconPath: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 9h-2v2H9v-2H7v-2h2V7h2v2h2v2zm-2-7V3.5L16.5 9H13c-.55 0-1-.45-1-1z",
                color: "#00C9A7",
                image: "https://images.pexels.com/photos/5483077/pexels-photo-5483077.jpeg?auto=compress&cs=tinysrgb&w=400",
                imageAlt: isAr ? "فاتورة إلكترونية على شاشة" : "Electronic invoice on screen",
              },
              {
                title: t.moduleItems[2].title,
                desc: t.moduleItems[2].desc,
                iconPath: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
                color: "#0070F2",
                image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400",
                imageAlt: isAr ? "اجتماع عمل مع عملاء" : "Business meeting with clients",
              },
              {
                title: t.moduleItems[3].title,
                desc: t.moduleItems[3].desc,
                iconPath: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
                color: "#00C9A7",
                image: "https://images.pexels.com/photos/3760069/pexels-photo-3760069.jpeg?auto=compress&cs=tinysrgb&w=400",
                imageAlt: isAr ? "موظفة تعمل على الرواتب" : "Employee working on payroll",
              },
              {
                title: t.moduleItems[4].title,
                desc: t.moduleItems[4].desc,
                iconPath: "M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z",
                color: "#0070F2",
                image: "https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=400",
                imageAlt: isAr ? "مستودع منظم للمخزون" : "Organized warehouse inventory",
              },
              {
                title: t.moduleItems[5].title,
                desc: t.moduleItems[5].desc,
                iconPath: "M1 11v10h6v-5h2v5h6V11L8 6l-7 5zm12 8h-2v-5H5v5H3v-7l5-3.5 5 3.5v7zm4-12h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm-4-16v2H7L17 1v4h4v2h-4z",
                color: "#00C9A7",
                image: "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400",
                imageAlt: isAr ? "معدات ومكتب عمل" : "Equipment and workspace",
              },
              {
                title: t.moduleItems[6].title,
                desc: t.moduleItems[6].desc,
                iconPath: "M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z",
                color: "#0070F2",
                image: "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=400",
                imageAlt: isAr ? "بنك وخدمات مالية" : "Bank and financial services",
              },
              {
                title: t.moduleItems[7].title,
                desc: t.moduleItems[7].desc,
                iconPath: "M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3h7zM7 9H4V5h3v4zm10 6h3v4h-3v-4zm0-10h3v4h-3V5z",
                color: "#00C9A7",
                image: "https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg?auto=compress&cs=tinysrgb&w=400",
                imageAlt: isAr ? "مصنع وخط إنتاج" : "Factory production line",
              },
              {
                title: t.moduleItems[8].title,
                desc: t.moduleItems[8].desc,
                iconPath: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
                color: "#0070F2",
                image: "https://images.pexels.com/photos/7681091/pexels-photo-7681091.jpeg?auto=compress&cs=tinysrgb&w=400",
                imageAlt: isAr ? "رسوم بيانية وتقارير" : "Charts and reports",
              },
              {
                title: t.moduleItems[9].title,
                desc: t.moduleItems[9].desc,
                iconPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
                color: "#00C9A7",
                image: "https://images.pexels.com/photos/335393/pexels-photo-335393.jpeg?auto=compress&cs=tinysrgb&w=400",
                imageAlt: isAr ? "خريطة العالم والأعمال" : "World map and business",
              },
              {
                title: t.moduleItems[10].title,
                desc: t.moduleItems[10].desc,
                iconPath: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z",
                color: "#0070F2",
                image: "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=400",
                imageAlt: isAr ? "حماية وأمان رقمي" : "Digital security and protection",
              },
              {
                title: t.moduleItems[11].title,
                desc: t.moduleItems[11].desc,
                iconPath: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 12H7v-2h10v2zm0-3H7V9h10v2zm0-3H7V6h10v2z",
                color: "#00C9A7",
                image: "https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=400",
                imageAlt: isAr ? "شات بوت ومساعد ذكي" : "AI chatbot assistant",
              },
            ].map((mod, i) => (
              <AnimatedCard delay={i * 80} key={i}>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-premium overflow-hidden">
                {mod.image && (
                  <div className="h-32 overflow-hidden rounded-xl -mx-6 -mt-6 mb-4 img-branded">
                    <img src={mod.image} alt={mod.imageAlt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                )}
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
          <div>
            {/* Text content */}
            <div>
              <AnimatedSection>
              <span className="text-sm font-semibold text-[#00C9A7] mb-2 block">{t.einvoice.badge}</span>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t.einvoice.title}
              </h3>
              <p className="text-white/60 max-w-xl mb-10">
                {t.einvoice.subtitle}
              </p>
              </AnimatedSection>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Egypt Card */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/15 transition-all">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect width="28" height="9.33" fill="#CE1126"/>
                      <rect y="9.33" width="28" height="9.33" fill="white"/>
                      <rect y="18.67" width="28" height="9.33" fill="#111"/>
                    </svg>
                    {t.einvoice.egyptTitle}
                  </h4>
                  <ul className="space-y-3 text-white/70 text-sm">
                    {t.einvoice.egyptItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Saudi Card */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/15 transition-all">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect width="28" height="28" rx="2" fill="#006C35"/>
                      <rect x="4" y="10" width="20" height="3" rx="1" fill="white" opacity="0.5"/>
                      <rect x="10" y="16" width="8" height="2" rx="1" fill="white" opacity="0.3"/>
                    </svg>
                    {t.einvoice.saudiTitle}
                  </h4>
                  <ul className="space-y-3 text-white/70 text-sm">
                    {t.einvoice.saudiItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M6.5 12L2 7.5l1.5-1.5L6.5 9 12.5 3 14 4.5 6.5 12z" fill="#00C9A7"/></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============ SECTORS ============ */}
      <section id="sectors" className="py-24 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
          <div className="text-center mb-20">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">{t.sectors.badge}</span>
            <h3 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">
              <span className="gradient-text">{t.sectors.title1}</span>{t.sectors.title2}
            </h3>
            <p className="text-gray-500 max-w-xl mx-auto mt-3">
              {t.sectors.subtitle}
            </p>
          </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: t.sectorNames[0], image: "https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#0070F2" },
              { name: t.sectorNames[1], image: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#00C9A7" },
              { name: t.sectorNames[2], image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#0070F2" },
              { name: t.sectorNames[3], image: "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#00C9A7" },
              { name: t.sectorNames[4], image: "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#0070F2" },
              { name: t.sectorNames[5], image: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#00C9A7" },
              { name: t.sectorNames[6], image: "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#0070F2" },
              { name: t.sectorNames[7], image: "https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#00C9A7" },
              { name: t.sectorNames[8], image: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#0070F2" },
              { name: t.sectorNames[9], image: "https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#00C9A7" },
              { name: t.sectorNames[10], image: "https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#0070F2" },
              { name: t.sectorNames[11], image: "https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#00C9A7" },
              { name: t.sectorNames[12], image: "https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#0070F2" },
              { name: t.sectorNames[13], image: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#00C9A7" },
              { name: t.sectorNames[14], image: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=300", color: "#0070F2" },
            ].map((sector, i) => (
              <AnimatedCard delay={i * 60} key={sector.name}>
              <div className="group rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default shadow-premium">
                <div className="h-28 overflow-hidden img-branded">
                  <img src={sector.image} alt={sector.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-3 bg-white text-center">
                  <span className="text-sm font-bold text-[#021544]">{sector.name}</span>
                </div>
              </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMPARISON TABLE ============ */}
      <section className="py-24 relative" style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 50%, #F8FAFC 100%)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection>
          <div className="text-center mb-20">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">{t.comparison.badge}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">{t.comparison.title}</h2>
            <p className="text-gray-500 mt-3">{t.comparison.subtitle}</p>
          </div>
          </AnimatedSection>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#021544] text-white">
                    <th className={`${isAr ? "text-right" : "text-left"} py-4 px-6 font-bold`}>{t.comparison.featureHeader}</th>
                    <th className="text-center py-4 px-6 font-bold">
                      <span className="text-[#00C9A7]">G-Ledger</span>
                    </th>
                    <th className="text-center py-4 px-6 font-bold">{t.comparison.otherHeader}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.comparisonRows.map((row, i) => (
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
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">{t.pricing.badge}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#021544] mt-4">{t.pricing.title}</h2>
            <p className="text-gray-500 mt-3">{t.pricing.subtitle}</p>
          </div>
          </AnimatedSection>

          <PricingCards />

          {/* Old pricing cards replaced by PricingCards component above */}

          {/* Add-ons (geo-aware: shows only the user's local currency) */}
          <div className="bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] rounded-2xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-[#021544] mb-6 text-center">{t.pricing.addons}</h3>
            <AddonsCards />
          </div>

          {/* Payment Methods */}
          <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-[#021544] mb-6 text-center">{t.pricing.paymentMethods}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "Visa", color: "#1A1F71",
                  svg: `<svg viewBox="0 0 48 16" fill="none"><path d="M19.2 1l-3.2 14h-2.6l3.2-14h2.6zm12.8 9l1.4-3.8.8 3.8h-2.2zm2.9-9h2.4l-2.1 14h-2.2l.1-.7c0 0-2.1.9-3.6.9-3.4 0-4.2-2.9-4.2-2.9l6.5-11.3h3.1zm-8.2 0s-2.8-.6-4.4.5c-1.3.9-2 2.4-1.5 4 .5 1.5 2 2 3.3 2.5 1 .4 1.3.7 1.2 1.2-.1.6-1 1-2 .9-.9 0-2.5-.5-2.5-.5l-.4 2.2s1.4.5 3.2.5c2.3 0 4-1 4.3-3 .3-1.7-.5-2.8-2.2-3.5-1-.5-1.6-.7-1.5-1.3.1-.5.7-.9 1.8-.8.7 0 1.8.3 1.8.3l.4-2zM8.6 1L5 15H2.1L.2 3.4C.1 2.8 0 2.5-.5 2.2-1 1.9-2.3 1.5-2.3 1.5L-2.2 1h4.2c.8 0 1.5.6 1.6 1.4l1 5.5L7.8 1h2.6z" fill="#1A1F71" transform="translate(6,0)"/></svg>` },
                { name: "Mastercard", color: "#EB001B",
                  svg: `<svg viewBox="0 0 48 32" fill="none"><circle cx="18" cy="16" r="12" fill="#EB001B"/><circle cx="30" cy="16" r="12" fill="#F79E1B"/><path d="M24 6.8a12 12 0 010 18.4 12 12 0 000-18.4z" fill="#FF5F00"/></svg>` },
                { name: isAr ? "مدى" : "Mada", color: "#003B71",
                  svg: `<svg viewBox="0 0 48 20" fill="none"><rect x="2" y="2" width="44" height="16" rx="4" fill="#003B71"/><text x="24" y="13" text-anchor="middle" fill="white" font-size="8" font-weight="bold" font-family="Arial">mada</text></svg>` },
                { name: "Apple Pay", color: "#000",
                  svg: `<svg viewBox="0 0 48 20" fill="none"><path d="M12 4c-.7 0-1.5.3-2 .8-.4.5-.8 1.2-.7 1.9.8 0 1.5-.3 2-.8.4-.5.7-1.2.7-1.9zm.6 2c-1.1 0-2 .6-2.5.6s-1.3-.6-2.2-.6c-1.1 0-2.2.7-2.8 1.7-1.2 2-.3 5 .8 6.7.6.8 1.2 1.7 2.1 1.7s1.2-.6 2.2-.6 1.3.6 2.2.6 1.5-.9 2-1.7c.6-.9.9-1.8.9-1.8s-1.7-.7-1.7-2.6c0-1.6 1.3-2.4 1.4-2.4-.8-1.2-2-1.3-2.4-1.3z" fill="black"/><text x="28" y="13" fill="black" font-size="7" font-weight="600" font-family="Arial">Pay</text></svg>` },
                { name: "Google Pay", color: "#4285F4",
                  svg: `<svg viewBox="0 0 48 20" fill="none"><rect x="4" y="3" width="40" height="14" rx="3" fill="white" stroke="#dadce0"/><text x="24" y="13" text-anchor="middle" font-size="7" font-weight="500" font-family="Arial"><tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">o</tspan><tspan fill="#FBBC05">o</tspan><tspan fill="#4285F4">g</tspan><tspan fill="#34A853">l</tspan><tspan fill="#EA4335">e</tspan><tspan fill="#5f6368"> Pay</tspan></text></svg>` },
                { name: isAr ? "ميزة" : "Meeza", color: "#1B3A6B",
                  svg: `<svg viewBox="0 0 48 20" fill="none"><rect x="2" y="2" width="44" height="16" rx="4" fill="#1B3A6B"/><text x="24" y="13" text-anchor="middle" fill="#E8A317" font-size="8" font-weight="bold" font-family="Arial">Meeza</text></svg>` },
                { name: "PayPal", color: "#003087",
                  svg: `<svg viewBox="0 0 48 20" fill="none"><text x="8" y="14" fill="#003087" font-size="10" font-weight="bold" font-family="Arial">Pay</text><text x="28" y="14" fill="#009cde" font-size="10" font-weight="bold" font-family="Arial">Pal</text></svg>` },
                { name: isAr ? "تحويل بنكي" : "Bank Transfer", color: "#059669",
                  svg: `<svg viewBox="0 0 48 20" fill="none"><rect x="8" y="3" width="32" height="14" rx="2" fill="#059669" opacity="0.1"/><path d="M18 6h12v1H18V6zm-2 2h16v1H16V8zm0 4h16v2H16v-2zm2 3h12v1H18v-1z" fill="#059669"/><path d="M24 4l6 3H18l6-3z" fill="#059669"/></svg>` },
                { name: "STC Pay", color: "#5F259F",
                  svg: `<svg viewBox="0 0 48 20" fill="none"><rect x="4" y="3" width="40" height="14" rx="4" fill="#5F259F"/><text x="24" y="13" text-anchor="middle" fill="white" font-size="7" font-weight="bold" font-family="Arial">STC Pay</text></svg>` },
                { name: "Fawry", color: "#F7941D",
                  svg: `<svg viewBox="0 0 48 20" fill="none"><rect x="4" y="3" width="40" height="14" rx="4" fill="#F7941D"/><text x="24" y="13" text-anchor="middle" fill="white" font-size="8" font-weight="bold" font-family="Arial">FAWRY</text></svg>` },
                { name: "Vodafone Cash", color: "#E60000",
                  svg: `<svg viewBox="0 0 48 20" fill="none"><circle cx="14" cy="10" r="8" fill="#E60000"/><text x="14" y="13" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="Arial">v</text><text x="32" y="13" fill="#E60000" font-size="6" font-weight="600" font-family="Arial">Cash</text></svg>` },
                { name: "Instapay", color: "#00A651",
                  svg: `<svg viewBox="0 0 48 20" fill="none"><rect x="4" y="3" width="40" height="14" rx="4" fill="#00A651"/><text x="24" y="13" text-anchor="middle" fill="white" font-size="7" font-weight="bold" font-family="Arial">InstaPay</text></svg>` },
                { name: "Stripe", color: "#635BFF",
                  svg: `<svg viewBox="0 0 48 20" fill="none"><rect x="4" y="3" width="40" height="14" rx="4" fill="#635BFF"/><text x="24" y="13" text-anchor="middle" fill="white" font-size="8" font-weight="bold" font-family="Arial">stripe</text></svg>` },
              ].map((method, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-full h-10 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: method.svg }} />
                  <span className="text-xs font-semibold" style={{ color: method.color }}>{method.name}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">{t.pricing.paymentNote}</p>
          </div>
        </div>
      </section>

      {/* ============ ACCOUNTING TIPS & NEWS ============ */}
      <section className="py-24 relative" style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
          <div className="text-center mb-20">
            <span className="text-sm font-semibold text-[#0070F2] bg-[#0070F2]/10 px-4 py-1.5 rounded-full">{t.tips.badge}</span>
            <h2 className="text-3xl font-bold text-[#021544] mt-4">{t.tips.title}</h2>
            <p className="text-gray-500 mt-2">{t.tips.subtitle}</p>
          </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.tipArticles.map((article, i) => (
              <article key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="h-36 overflow-hidden img-branded">
                  <img src={article.image} alt={article.imageAlt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
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
      <section className="py-24 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #021544 0%, #0070F2 100%)" }}>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        </div>
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
            {t.cta.badge}
          </div>

          <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {t.cta.title}
          </h3>
          <p className="text-white/70 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
            {t.cta.subtitle}
          </p>

          <a
            href="#pricing"
            className="inline-block px-14 py-5 text-lg font-bold bg-white text-[#021544] rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            {t.cta.cta}
          </a>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: "15+", label: t.cta.stat1Label },
              { value: "29+", label: t.cta.stat2Label },
              { value: "6", label: t.cta.stat3Label },
              { value: "100%", label: t.cta.stat4Label },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-[#00C9A7]">{stat.value}</div>
                <div className="text-sm text-white/60 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PARTNERS ============ */}
      <section className="py-16 bg-[#F8FAFC] border-t border-border/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-muted-foreground mb-8">{isAr ? "نتكامل مع أفضل المنصات" : "We integrate with the best platforms"}</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {["ZATCA", "ETA", "Stripe", "Paymob", "Tamara", "Tabby", "Salla", "Zid", "Mada"].map((name) => (
              <div key={name} className="text-lg font-bold text-[#021544]">{name}</div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href={`/${locale}/integrations`} className="text-sm text-[#0070F2] hover:underline font-medium">
              {isAr ? "عرض جميع التكاملات →" : "View all integrations →"}
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#021544] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <h4 className="text-sm font-bold mb-4 text-white/80">{t.footer.company}</h4>
              <ul className="space-y-2 text-white/50 text-sm">
                <li><a href="#why-different" className="hover:text-white transition-colors">{t.footer.about}</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">{t.footer.features}</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">{t.footer.pricing}</a></li>
                <li><a href="#sectors" className="hover:text-white transition-colors">{t.footer.sectors}</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-white/80">{t.footer.resources}</h4>
              <ul className="space-y-2 text-white/50 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t.footer.helpCenter}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.footer.faq}</a></li>
                <li><a href="#einvoice" className="hover:text-white transition-colors">{t.footer.einvoice}</a></li>
                <li><Link href={`/${locale}/legal/terms`} className="hover:text-white transition-colors">{t.footer.terms}</Link></li>
                <li><Link href={`/${locale}/legal/privacy`} className="hover:text-white transition-colors">{t.footer.privacy}</Link></li>
                <li><Link href={`/${locale}/legal/sla`} className="hover:text-white transition-colors">{t.footer.sla}</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-white/80">{t.footer.contact}</h4>
              <ul className="space-y-2 text-white/50 text-sm">
                <li>
                  <a href="https://m.me/61574741902666" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.12 7.24V22l3.04-1.67c.82.23 1.68.35 2.58.35h.26c5.64 0 10-4.13 10-9.68C21 6.13 17.64 2 12 2z"/></svg>
                    {t.footer.messenger}
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
                  <span className="text-xs text-white/50 block">{t.footer.smartAccountant}</span>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                {t.footer.brandDesc}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <VisitorCounter variant="footer" />
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-white/40 text-xs">
            <span>{t.footer.copyright}</span>
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
