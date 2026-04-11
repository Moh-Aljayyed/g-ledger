"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

const COUNTRY_FLAGS: Record<string, string> = {
  SA: "🇸🇦", AE: "🇦🇪", EG: "🇪🇬", KW: "🇰🇼", QA: "🇶🇦", BH: "🇧🇭", OM: "🇴🇲",
  JO: "🇯🇴", LB: "🇱🇧", IQ: "🇮🇶", MA: "🇲🇦", TN: "🇹🇳", DZ: "🇩🇿", LY: "🇱🇾",
  SD: "🇸🇩", YE: "🇾🇪", SY: "🇸🇾", PS: "🇵🇸", US: "🇺🇸", GB: "🇬🇧", TR: "🇹🇷",
};

const SECTOR_AR: Record<string, string> = {
  INDUSTRIAL: "صناعي",
  COMMERCIAL: "تجاري",
  SERVICES: "خدمي",
  BANKING: "بنوك ومالي",
  INSURANCE: "تأمين",
  REAL_ESTATE: "عقاري",
  CONTRACTING: "مقاولات",
  AGRICULTURAL: "زراعي",
  TECHNOLOGY: "تقني / SaaS",
  NON_PROFIT: "غير ربحي",
  CROWDFUNDING: "تمويل جماعي",
  MEDICAL_HOSPITAL: "طبي - مستشفيات",
  MEDICAL_PHARMACY: "طبي - صيدليات",
  MEDICAL_CLINIC: "طبي - عيادات",
  MEDICAL_LAB: "طبي - معامل",
};

export default function SuperAdminDashboard() {
  const tc = useTranslations("common");

  const { data: stats, isLoading: statsLoading } = trpc.admin.getSystemStats.useQuery();
  const { data: tenantsData, isLoading: tenantsLoading } = trpc.admin.getAllTenants.useQuery();

  const [searchQuery, setSearchQuery] = useState("");

  const tenants = tenantsData ?? [];

  const filteredTenants = useMemo(() => {
    if (!searchQuery) return tenants;
    const q = searchQuery.toLowerCase();
    return tenants.filter((t: any) => t.name?.toLowerCase().includes(q));
  }, [tenants, searchQuery]);

  // Calculate derived stats
  const totalRevenue = useMemo(() => {
    return tenants.reduce((sum: number, t: any) => sum + (t.monthlyPriceUsd ?? 0), 0);
  }, [tenants]);

  const totalStorageUsed = useMemo(() => {
    return tenants.reduce((sum: number, t: any) => sum + (t.storageUsedKB ?? 0), 0);
  }, [tenants]);

  // Sector breakdown
  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tenants.forEach((t: any) => {
      const sector = t.sector ?? "UNKNOWN";
      counts[sector] = (counts[sector] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([sector, count]) => ({ sector, count }))
      .sort((a, b) => b.count - a.count);
  }, [tenants]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#021544]">لوحة تحكم المدير</h1>
          <p className="text-sm text-muted-foreground mt-1">نظرة عامة شاملة على النظام</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/ar/admin/tenants"
            className="px-4 py-2 bg-[#021544] text-white rounded-xl text-sm font-medium hover:bg-[#021544]/90 transition-colors"
          >
            إدارة المنشآت
          </Link>
          <Link
            href="/ar/admin/users"
            className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
          >
            إدارة المستخدمين
          </Link>
        </div>
      </div>

      {/* Stats Row - 4 Cards */}
      {statsLoading ? (
        <div className="text-center py-8 text-muted-foreground">{tc("loading")}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="إجمالي المنشآت"
            value={stats?.totalTenants ?? 0}
            icon="🏢"
            gradient="from-blue-500/10 to-blue-500/5"
            borderColor="border-blue-200"
          />
          <StatCard
            title="إجمالي المستخدمين"
            value={stats?.totalUsers ?? 0}
            icon="👥"
            gradient="from-green-500/10 to-green-500/5"
            borderColor="border-green-200"
          />
          <StatCard
            title="إجمالي الإيرادات (شهري)"
            value={`$${totalRevenue.toLocaleString("en-US")}`}
            icon="💰"
            gradient="from-purple-500/10 to-purple-500/5"
            borderColor="border-purple-200"
            isText
          />
          <StatCard
            title="التخزين المستخدم"
            value={totalStorageUsed >= 1024 ? `${(totalStorageUsed / 1024).toFixed(1)} MB` : `${totalStorageUsed} KB`}
            icon="💾"
            gradient="from-amber-500/10 to-amber-500/5"
            borderColor="border-amber-200"
            isText
          />
        </div>
      )}

      {/* Quick Stats Per Sector */}
      {sectorCounts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#021544] mb-4">توزيع القطاعات</h2>
          <div className="flex flex-wrap gap-2">
            {sectorCounts.map(({ sector, count }) => (
              <div
                key={sector}
                className="inline-flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border"
              >
                <span className="text-sm font-medium">{SECTOR_AR[sector] ?? sector}</span>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#021544] text-white text-xs font-bold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المنشأة..."
            className="w-full px-4 py-2.5 pr-10 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021544]/20"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredTenants.length} منشأة
        </div>
      </div>

      {/* ============ TODO CENTER — all pending roadmaps ============ */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#021544]">📋 مركز المهام (TODO Center)</h2>
            <p className="text-xs text-muted-foreground mt-1">
              كل الخرائط والمهام المؤجلة في مكان واحد — بنود مؤجلة، أولويات، وتقديرات زمنية
            </p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-[#021544] to-[#0070F2] text-white font-bold shadow-md">
            4 خرائط مفتوحة
          </span>
        </div>

        {/* Roadmap summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            {
              emoji: "🔌",
              title: "تكامل رقي (Raqyy)",
              count: "5 بنود",
              priority: "متوسطة",
              color: "from-cyan-500/10 to-blue-500/10 border-cyan-200",
              priorityColor: "bg-yellow-100 text-yellow-700",
            },
            {
              emoji: "⚡",
              title: "Scaling & Performance",
              count: "2 بنود حرجة",
              priority: "عالية",
              color: "from-red-500/10 to-orange-500/10 border-red-200",
              priorityColor: "bg-red-100 text-red-700",
            },
            {
              emoji: "🍽️",
              title: "Restaurant POS Waves 5-10",
              count: "58 فيتشر · 6 موجات",
              priority: "مرحلية",
              color: "from-orange-500/10 to-amber-500/10 border-orange-200",
              priorityColor: "bg-blue-100 text-blue-700",
            },
            {
              emoji: "🏥",
              title: "Medical Suite Waves 11-16",
              count: "6 موجات · 3-5 سنين",
              priority: "استراتيجية",
              color: "from-purple-500/10 to-pink-500/10 border-purple-200",
              priorityColor: "bg-purple-100 text-purple-700",
            },
          ].map((r) => (
            <div
              key={r.title}
              className={`p-4 rounded-xl border bg-gradient-to-br ${r.color}`}
            >
              <div className="text-3xl mb-2">{r.emoji}</div>
              <div className="text-sm font-bold text-[#021544] mb-1">{r.title}</div>
              <div className="text-xs text-muted-foreground mb-2">{r.count}</div>
              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${r.priorityColor}`}>
                {r.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ============ Scaling & Performance — critical infra fixes ============ */}
      <div className="mb-8 bg-card rounded-xl border border-red-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#021544]">⚡ أداء وسعة — إصلاحات بنية تحتية حرجة</h2>
            <p className="text-xs text-muted-foreground mt-1">
              يرفع السقف من ~100 اتصال لـ 10,000+ · بدون هذه الإصلاحات السقف الحالي ~5,000 مشترك
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">2 بنود</span>
        </div>

        <div className="space-y-3">
          {[
            {
              id: 1,
              title: "🔴 تفعيل Neon Pooler (5 دقائق، مجاني)",
              desc: "تغيير DATABASE_URL على Vercel لاستخدام ep-patient-dew-agbrqn30-pooler بدل endpoint المباشر. يرفع السقف من 100 اتصال لـ 10,000+ اتصال متزامن فوراً. بدون deploy تقني — مجرد تحديث env variable.",
              priority: "حرجة",
              priorityColor: "bg-red-100 text-red-700",
            },
            {
              id: 2,
              title: "🟠 OTP Store في Upstash Redis",
              desc: "OTP حالياً في ذاكرة Vercel function (Map). لو user يطلب OTP من instance A ويتحقق من instance B، التحقق يفشل. الحل: استخدام Upstash Redis free tier (10k req/يوم). يصلح bug فعلي مش مجرد scaling.",
              priority: "عالية",
              priorityColor: "bg-orange-100 text-orange-700",
            },
          ].map((todo) => (
            <div
              key={todo.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                {todo.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-[#021544]">{todo.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${todo.priorityColor}`}>
                    {todo.priority}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{todo.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-red-200/50 text-xs text-muted-foreground">
          الحالة: <span className="font-semibold text-amber-600">مؤجّل بناءً على طلب المستخدم</span> · السقف الحالي: ~5,000 مشترك · race-safe numbering ✅ شُحن 2026-04-11
        </div>
      </div>

      {/* ============ Restaurant POS Waves 5-10 ============ */}
      <div className="mb-8 bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#021544]">🍽️ Restaurant POS — Waves 5-10</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Waves 1-4 شُحنت 2026-04-11 · المنصة مكتملة وظيفياً · الباقي خندق تنافسي وتوسّع
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">6 موجات · 58 فيتشر</span>
        </div>

        <div className="space-y-2">
          {[
            { num: 5, title: "إغلاق حلقات Wave 4", desc: "Apply Happy Hour pricing, KDS sound, AI predictions, WhatsApp orders, customer profile, analytics, iPad app", duration: "1 شهر", color: "bg-green-100 text-green-700" },
            { num: 6, title: "العمق التشغيلي + الأجهزة", desc: "Recipes/BOM (أهم فيتشر ناقص!), Food Cost %, Waste, Tips, ESC/POS, Barcode HID, Scales, Multi-branch, Shifts, Split/Merge", duration: "2-3 شهور", color: "bg-green-100 text-green-700" },
            { num: 7, title: "النمو والمنصة", desc: "تكاملات دليفري (Talabat/HungerStation/Uber Eats), White-label, Open API, NPS, Franchise portal, Driver app, Voice ordering, Vision OCR, Memberships, Reservations", duration: "3-4 شهور", color: "bg-yellow-100 text-yellow-700" },
            { num: 8, title: "AI-Native + توسّع الامتثال", desc: "Arabic voice POS, Bank auto-categorization, Receipt AI scanning, فواتير الإمارات/عُمان/البحرين/الأردن/المغرب, IFRS↔GAAP, SOX permissions, Anomaly detection", duration: "3-4 شهور", color: "bg-green-100 text-green-700" },
            { num: 9, title: "Embedded Finance", desc: "قروض رأس مال عامل, Invoice factoring, MCA, BNPL, Virtual cards, Plaid-style aggregation, Savings wallet, Insurance", duration: "6-12 شهر", color: "bg-red-100 text-red-700" },
            { num: 10, title: "Ecosystem / Exit-Ready", desc: "App store plugins, Partner channel, Acquisition imports, Global tax engine, Marketplaces, IoT smart kitchen, AR/VR menus, IPO-readiness", duration: "12-24 شهر", color: "bg-red-100 text-red-700" },
          ].map((wave) => (
            <div
              key={wave.num}
              className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-50/40 to-amber-50/20 border border-orange-100"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white text-xs font-bold flex items-center justify-center shadow">
                W{wave.num}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5 flex-wrap">
                  <h3 className="text-sm font-bold text-[#021544]">{wave.title}</h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-mono text-muted-foreground">
                      {wave.duration}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${wave.color}`}>
                      {wave.num <= 8 ? (wave.num === 7 ? "مختلط" : "هندسي") : "يحتاج شراكات"}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{wave.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
          المرحلة الحالية: <span className="font-semibold text-green-700">Waves 1-4 مكتملة · 4 موجات</span> · أفضل نقاط انطلاق للموجة الجاية: Apply Happy Hour, Recipes/BOM, KDS sound, Delivery platforms
        </div>
      </div>

      {/* Pending TODOs — deferred Raqyy integration items */}
      <div className="mb-8 bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#021544]">🔌 المهام المؤجلة — تكامل رقي (Raqyy)</h2>
            <p className="text-xs text-muted-foreground mt-1">بنود تم تأجيلها بقصد بعد إطلاق Phases 1–3 يوم 2026-04-07</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">5 بنود</span>
        </div>

        <div className="space-y-3">
          {[
            {
              id: 1,
              title: "التحقق من توقيع HMAC على الـ webhooks الواردة",
              desc: "إضافة فحص X-Raqyy-Signature في raqyy-auth.ts — يحتاج shared secret يتم الاتفاق عليه مع رقي أولاً",
              priority: "متوسطة",
              priorityColor: "bg-yellow-100 text-yellow-700",
            },
            {
              id: 2,
              title: "تنبيهات Email عند فشل المزامنة المتكرر",
              desc: "Cron job يفحص RaqyySyncLog، عند N محاولات فاشلة متتالية يبعت Email لمالك الحساب عبر Resend",
              priority: "عالية",
              priorityColor: "bg-red-100 text-red-700",
            },
            {
              id: 3,
              title: "Phase 4 — مزامنة ثنائية الاتجاه (G-Ledger ⇄ Raqyy)",
              desc: "دفع تصحيحات السعر/المخزون من G-Ledger إلى رقي + تقارير المطابقة. يحتاج رقي يفتح webhooks وارد عندهم أولاً",
              priority: "منخفضة",
              priorityColor: "bg-gray-100 text-gray-700",
            },
            {
              id: 4,
              title: "Endpoint إعادة المحاولة للمابينج الفاشل",
              desc: "POST /api/v1/integrations/raqyy/retry — يبحث عن السجلات بحالة mappingStatus='FAILED' ويعيد تشغيل المابر",
              priority: "عالية",
              priorityColor: "bg-red-100 text-red-700",
            },
            {
              id: 5,
              title: "لوحة Admin لعرض كل حسابات رقي المربوطة",
              desc: "للسوبر أدمن فقط — تعرض جميع الـ tenants المربوطة برقي مع آخر مزامنة وعدد الفواتير وحالة الاشتراك",
              priority: "متوسطة",
              priorityColor: "bg-yellow-100 text-yellow-700",
            },
          ].map((todo) => (
            <div
              key={todo.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#021544] text-white text-xs font-bold flex items-center justify-center">
                {todo.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-[#021544]">{todo.title}</h3>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap", todo.priorityColor)}>
                    {todo.priority}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{todo.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
          المرحلة الحالية: <span className="font-semibold text-green-700">Phases 1–3 مكتملة</span> · آخر تحديث: 2026-04-07 · commit <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">9e9cc53</code>
        </div>
      </div>

      {/* Medical Suite Roadmap — Waves 11-16 */}
      <div className="mb-8 bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#021544]">🏥 خريطة طريق Medical Suite — Waves 11-16</h2>
            <p className="text-xs text-muted-foreground mt-1">
              قطاع طبي كامل: مستشفيات، مراكز صحية، عيادات، ومعامل تحاليل — بمعايير ICD-10/11, CPT, HCPCS, ATC, LOINC
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
            6 موجات · متعدد السنوات
          </span>
        </div>

        {/* Warning callout */}
        <div className="mb-5 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="text-xs font-bold text-amber-900 mb-1">⚠️ تحذيرات مهمة قبل البدء</div>
          <ul className="text-[11px] text-amber-800 space-y-0.5 mr-3">
            <li>• <strong>CPT license مدفوع</strong> من AMA (~$1k-10k/سنة حسب الاستخدام)</li>
            <li>• <strong>موافقات تنظيمية لكل دولة</strong> (Saudi SFDA/CBAHI، Egypt EDA، UAE MoHAP...)</li>
            <li>• <strong>تأمين مسؤولية طبية</strong> إجباري بعد لمس القرارات السريرية (الجرعات، الوصفات)</li>
            <li>• <strong>فريق طبي لازم</strong>: CMO + صيدلي إكلينيكي + مبرمج HL7 + مبرمج DICOM</li>
            <li>• <strong>مشروع 3-5 سنين</strong> ويفضل يكون خط منتج منفصل بفريقه وميزانيته</li>
          </ul>
        </div>

        {/* Waves list */}
        <div className="space-y-3">
          {[
            {
              num: 11,
              title: "Medical Foundation — معايير الترميز وقاعدة الأدوية",
              desc: "ICD-10/11, ICD-10-PCS, CPT, HCPCS, ATC, NDC, LOINC + قاعدة أدوية موحدة + ترجمة عربية + مدقق تفاعلات دوائية",
              duration: "6-12 شهر",
              priority: "🔴 أساسي",
              priorityColor: "bg-red-100 text-red-700",
              blocker: true,
            },
            {
              num: 12,
              title: "Medical Clinic Platform — منصة العيادات",
              desc: "إدارة مواعيد + EMR مبسط + وصفات إلكترونية + Telehealth + بوابة المريض",
              duration: "4-6 شهور",
              priority: "🟠 عالية",
              priorityColor: "bg-orange-100 text-orange-700",
              blocker: false,
            },
            {
              num: 13,
              title: "Medical Lab Platform — منصة معامل التحاليل (LIS)",
              desc: "كتالوج تحاليل بـ LOINC + تتبع عينات بباركود + ربط أجهزة HL7/ASTM + تقارير PDF مخصصة + QC (Levey-Jennings)",
              duration: "4-6 شهور",
              priority: "🟠 عالية",
              priorityColor: "bg-orange-100 text-orange-700",
              blocker: false,
            },
            {
              num: 14,
              title: "Health Centers — مراكز الصحة الأولية",
              desc: "سجل تطعيمات + تقارير وبائية + ربط وزارة الصحة (Saudi NPHIES / Egypt UHIS / UAE Malaffi) + تطبيق زيارات ميدانية",
              duration: "3-6 شهور/دولة",
              priority: "🟡 متوسطة",
              priorityColor: "bg-yellow-100 text-yellow-700",
              blocker: false,
            },
            {
              num: 15,
              title: "Hospital Platform — منصة المستشفيات (HIS الكامل)",
              desc: "ADT + إدارة الأسِرّة + صيدلية كاملة + حاسبة جرعات + مطالبات تأمين + جدولة عمليات + DICOM viewer + ICU + ER + Quality metrics",
              duration: "18-36 شهر",
              priority: "🔴 ضخم",
              priorityColor: "bg-red-100 text-red-700",
              blocker: false,
            },
            {
              num: 16,
              title: "Regulatory Compliance & Accreditation",
              desc: "اعتماد CBAHI / JCI + Audit logs متقدم (HIPAA/PDPL) + إدارة الموافقات + Data residency + Clinical Trials (GCP)",
              duration: "مستمر",
              priority: "🔴 إلزامي",
              priorityColor: "bg-red-100 text-red-700",
              blocker: false,
            },
          ].map((wave) => (
            <div
              key={wave.num}
              className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50/50 to-pink-50/30 border border-purple-100 hover:border-purple-300 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white text-sm font-bold flex items-center justify-center shadow-md">
                W{wave.num}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                  <h3 className="text-sm font-bold text-[#021544]">{wave.title}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-mono text-muted-foreground">
                      {wave.duration}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${wave.priorityColor}`}>
                      {wave.priority}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{wave.desc}</p>
                {wave.blocker && (
                  <p className="text-[10px] text-red-600 font-semibold mt-1">
                    ⚠️ شرط مسبق لكل الموجات اللي بعده
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Integration standards reference */}
        <div className="mt-5 p-4 rounded-lg bg-muted/40 border border-border">
          <div className="text-xs font-bold text-[#021544] mb-3">📚 معايير الترميز الطبي المستهدفة</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px]">
            {[
              { code: "ICD-10", body: "WHO", use: "تشخيصات الأمراض", cost: "مجاني" },
              { code: "ICD-11", body: "WHO", use: "تشخيصات — الجيل الجديد", cost: "مجاني" },
              { code: "ICD-10-PCS", body: "CMS", use: "إجراءات المستشفى", cost: "مجاني" },
              { code: "CPT", body: "AMA", use: "فحوصات + أشعة + عيادات", cost: "💰 مدفوع" },
              { code: "HCPCS", body: "CMS", use: "أجهزة ومستلزمات", cost: "مجاني" },
              { code: "ATC", body: "WHO", use: "تصنيف الأدوية", cost: "مجاني" },
              { code: "NDC", body: "FDA", use: "تعريف الدواء تجارياً", cost: "مجاني" },
              { code: "LOINC", body: "Regenstrief", use: "ترميز التحاليل", cost: "مجاني" },
            ].map((std) => (
              <div
                key={std.code}
                className="flex items-center justify-between gap-2 p-2 rounded bg-white border border-border/50"
              >
                <div className="min-w-0">
                  <div className="font-bold text-[#021544] text-xs">{std.code}</div>
                  <div className="text-[10px] text-muted-foreground">{std.body} · {std.use}</div>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                  std.cost.includes("مدفوع") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}>
                  {std.cost}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
          الحالة: <span className="font-semibold text-amber-600">خطة مستقبلية</span> — لم يبدأ التنفيذ · تتطلب شراكات طبية وفريق متخصص · آخر تحديث: 2026-04-11
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">المنشأة</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">القطاع</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الدولة</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">المستخدمين</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">التخزين</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الاستخدام %</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الخطة</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الأيام المتبقية</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">السعر/شهر</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الحالة</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {tenantsLoading ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-muted-foreground">
                    {tc("loading")}
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-muted-foreground">
                    {tc("noData")}
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant: any) => {
                  const usagePercent = tenant.usagePercent ?? 0;
                  const usageBarColor =
                    usagePercent >= 80 ? "bg-red-500" :
                    usagePercent >= 50 ? "bg-yellow-500" :
                    "bg-green-500";
                  const usageTextColor =
                    usagePercent >= 80 ? "text-red-700" :
                    usagePercent >= 50 ? "text-yellow-700" :
                    "text-green-700";

                  const isBlocked = tenant.isBlocked;
                  const planLabel = tenant.plan === "FREE_TRIAL" ? "تجربة مجانية" : "مشترك";
                  const planBg = tenant.plan === "FREE_TRIAL" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700";

                  return (
                    <tr key={tenant.id} className="border-b border-border/50 hover:bg-muted/20">
                      {/* Company name */}
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{tenant.name}</div>
                      </td>

                      {/* Sector (Arabic) */}
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {SECTOR_AR[tenant.sector] ?? tenant.sector}
                      </td>

                      {/* Country (flag) */}
                      <td className="px-4 py-3 text-center text-lg">
                        {COUNTRY_FLAGS[tenant.country] ?? tenant.country ?? "-"}
                      </td>

                      {/* Users count */}
                      <td className="px-4 py-3 text-center text-sm font-mono">
                        {tenant.userCount ?? 0}
                      </td>

                      {/* Storage used KB / limit KB */}
                      <td className="px-4 py-3 text-center">
                        <div className="text-xs font-mono text-muted-foreground">
                          {tenant.storageUsedKB ?? 0} / {tenant.storageLimitKB ?? 0} KB
                        </div>
                      </td>

                      {/* Usage % with colored bar */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all", usageBarColor)}
                              style={{ width: `${Math.min(100, usagePercent)}%` }}
                            />
                          </div>
                          <span className={cn("text-xs font-mono font-medium", usageTextColor)}>
                            {usagePercent}%
                          </span>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3 text-center">
                        <span className={cn("inline-flex px-2 py-0.5 rounded text-[11px] font-medium", planBg)}>
                          {planLabel}
                        </span>
                      </td>

                      {/* Days remaining */}
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "text-sm font-mono",
                          tenant.daysRemaining <= 7 ? "text-red-600 font-bold" :
                          tenant.daysRemaining <= 30 ? "text-yellow-600" :
                          "text-muted-foreground"
                        )}>
                          {tenant.daysRemaining}
                        </span>
                      </td>

                      {/* Monthly price */}
                      <td className="px-4 py-3 text-center text-sm font-mono">
                        ${tenant.monthlyPriceUsd ?? 0}
                      </td>

                      {/* Status (ACTIVE/BLOCKED badge) */}
                      <td className="px-4 py-3 text-center">
                        {isBlocked ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                            محظور
                          </span>
                        ) : tenant.subscriptionStatus === "ACTIVE" ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                            نشط
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {tenant.subscriptionStatus}
                          </span>
                        )}
                      </td>

                      {/* Created date */}
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(tenant.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  borderColor,
  isText,
}: {
  title: string;
  value: number | string;
  icon: string;
  gradient: string;
  borderColor: string;
  isText?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border p-5 bg-gradient-to-br", gradient, borderColor)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-[#021544] font-mono">
        {isText ? value : (value as number).toLocaleString("ar-SA")}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{title}</div>
    </div>
  );
}
