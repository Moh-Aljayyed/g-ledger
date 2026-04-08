"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LogoFull } from "@/components/logo";
import { LangLink } from "@/components/lang-link";

type Mode = "contact" | "careers";

export default function ContactPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale === "en" ? "en" : "ar";
  const isAr = locale === "ar";

  const [mode, setMode] = useState<Mode>("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [position, setPosition] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const t = {
    title: isAr ? "تواصل معنا واعمل معنا" : "Contact & Careers",
    subtitle: isAr
      ? "فريقنا جاهز للرد على استفساراتك أو استقبال طلبك للانضمام لفريق G-Ledger"
      : "Our team is ready to answer your questions or welcome your application to join G-Ledger",
    tabContact: isAr ? "تواصل معنا" : "Contact Us",
    tabCareers: isAr ? "اعمل معنا" : "Work With Us",
    quickWays: isAr ? "طرق التواصل السريع" : "Quick Contact",
    formTitle: {
      contact: isAr ? "أرسل لنا رسالة" : "Send us a message",
      careers: isAr ? "قدّم طلبك للانضمام" : "Apply to join us",
    },
    name: isAr ? "الاسم الكامل" : "Full name",
    email: isAr ? "البريد الإلكتروني" : "Email",
    phone: isAr ? "رقم الهاتف (اختياري)" : "Phone (optional)",
    subject: isAr ? "الموضوع" : "Subject",
    position: isAr ? "الوظيفة المطلوبة" : "Position",
    message: {
      contact: isAr ? "رسالتك" : "Your message",
      careers: isAr ? "نبذة عنك + رابط CV" : "Tell us about yourself + CV link",
    },
    send: isAr ? "إرسال" : "Send",
    sending: isAr ? "جاري الإرسال..." : "Sending...",
    success: isAr
      ? "✓ تم استلام رسالتك بنجاح — سنرد عليك قريباً"
      : "✓ We've received your message — we'll reply shortly",
    error: isAr ? "حدث خطأ، يرجى المحاولة مرة أخرى" : "Something went wrong, please try again",
    careersIntro: isAr
      ? "نحن نبني مستقبل المحاسبة السحابية للسوق العربي — وندوّر على شغوفين بزيكم"
      : "We're building the future of cloud accounting for the Arab market — and looking for passionate people like you",
    openPositions: isAr ? "وظائف شاغرة الآن" : "Open positions",
    apply: isAr ? "قدّم على هذه الوظيفة" : "Apply for this role",
    filled: isAr ? "تم التعيين" : "Position Filled",
    notAccepting: isAr ? "هذه الوظيفة مغلقة حالياً" : "This position is no longer accepting applications",
  };

  const positions = [
    {
      title: isAr ? "محاسب أول (Senior Accountant)" : "Senior Accountant",
      type: isAr ? "دوام كامل · عن بُعد" : "Full-time · Remote",
      desc: isAr
        ? "خبرة 5+ سنوات في المحاسبة، ZATCA/ETA، QuickBooks أو Odoo. CMA ميزة."
        : "5+ years accounting, ZATCA/ETA, QuickBooks/Odoo. CMA preferred.",
      icon: "📊",
      filled: true,
    },
    {
      title: isAr ? "مطور Full-Stack (Next.js + Prisma)" : "Full-Stack Engineer (Next.js + Prisma)",
      type: isAr ? "دوام كامل · عن بُعد" : "Full-time · Remote",
      desc: isAr
        ? "TypeScript, React 19, Next.js 16, Postgres, tRPC. خبرة بـ ERP أو فاتورة إلكترونية ميزة."
        : "TypeScript, React 19, Next.js 16, Postgres, tRPC. ERP/e-invoicing experience a plus.",
      icon: "💻",
      filled: true,
    },
    {
      title: isAr ? "مسؤول مبيعات / Account Manager" : "Sales / Account Manager",
      type: isAr ? "دوام كامل · القاهرة أو الرياض" : "Full-time · Cairo or Riyadh",
      desc: isAr
        ? "خبرة في بيع SaaS B2B للشركات. شبكة علاقات في القطاعات المحاسبية ميزة."
        : "B2B SaaS sales experience. Network in accounting/finance is a plus.",
      icon: "🤝",
      filled: false,
    },
    {
      title: isAr ? "متخصص دعم فني" : "Technical Support Specialist",
      type: isAr ? "دوام كامل · عن بُعد" : "Full-time · Remote",
      desc: isAr
        ? "خبرة في دعم منتجات SaaS. عربي + إنجليزي ممتاز. خلفية محاسبية ميزة كبيرة."
        : "SaaS support experience. Excellent Arabic + English. Accounting background is a big plus.",
      icon: "🛠️",
      filled: false,
    },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          name,
          email,
          phone,
          subject: mode === "contact" ? subject : undefined,
          position: mode === "careers" ? position : undefined,
          message,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult({ ok: true, msg: t.success });
        setName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setPosition("");
        setMessage("");
      } else {
        setResult({ ok: false, msg: data.error || t.error });
      }
    } catch {
      setResult({ ok: false, msg: t.error });
    } finally {
      setSubmitting(false);
    }
  };

  const applyToPosition = (positionTitle: string) => {
    setMode("careers");
    setPosition(positionTitle);
    setTimeout(() => {
      document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/${locale}`}>
            <LogoFull size="sm" variant="dark" />
          </Link>
          <div className="flex items-center gap-3">
            <LangLink variant="header" />
            <Link
              href={`/${locale}`}
              className="px-4 py-2 text-sm font-medium text-[#021544] hover:text-[#0070F2]"
            >
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <Link
              href={`/${locale}#pricing`}
              className="px-4 py-2 text-sm bg-[#0070F2] text-white rounded-lg font-medium"
            >
              {isAr ? "ابدأ مجاناً" : "Start Free"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#021544] via-[#0a2a6e] to-[#0070F2] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t.title}</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Quick contact cards */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-[#021544] mb-6 text-center">{t.quickWays}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* WhatsApp Technical */}
            <a
              href={`https://wa.me/201507522155?text=${encodeURIComponent(isAr ? "مرحباً، أحتاج دعم فني بخصوص G-Ledger" : "Hello, I need technical support for G-Ledger")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl border border-border p-5 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                </svg>
              </div>
              <div className="font-bold text-[#021544] text-sm">
                {isAr ? "واتساب — دعم فني" : "WhatsApp — Tech Support"}
              </div>
              <div className="text-xs text-muted-foreground mt-1" dir="ltr">
                +20 150 752 2155
              </div>
            </a>

            {/* WhatsApp Accounting */}
            <a
              href={`https://wa.me/201285736144?text=${encodeURIComponent(isAr ? "مرحباً د. داليا، أحتاج استفسار محاسبي" : "Hello Dr. Dalia, I have an accounting question")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl border border-[#c9a14a]/30 p-5 hover:shadow-xl hover:-translate-y-1 transition-all relative"
            >
              <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-[#c9a14a]/15 text-[#a67c2a] font-bold">
                {isAr ? "CMA" : "CMA"}
              </span>
              <div className="w-12 h-12 rounded-xl bg-[#0d4d35]/10 flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#0d4d35">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                </svg>
              </div>
              <div className="font-bold text-[#021544] text-sm">
                {isAr ? "د. داليا — دعم محاسبي" : "Dr. Dalia — Accounting"}
              </div>
              <div className="text-xs text-muted-foreground mt-1" dir="ltr">
                +20 128 573 6144
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:info@g-ledger.com"
              className="group bg-white rounded-2xl border border-border p-5 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0070F2]/10 flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#0070F2">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <div className="font-bold text-[#021544] text-sm">{isAr ? "البريد الإلكتروني" : "Email"}</div>
              <div className="text-xs text-muted-foreground mt-1" dir="ltr">
                info@g-ledger.com
              </div>
            </a>

            {/* Messenger */}
            <a
              href="https://m.me/61574741902666"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl border border-border p-5 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0084FF]/10 flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#0084FF">
                  <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.12 7.24V22l3.04-1.67c.82.23 1.68.35 2.58.35h.26c5.64 0 10-4.13 10-9.68C21 6.13 17.64 2 12 2z" />
                </svg>
              </div>
              <div className="font-bold text-[#021544] text-sm">Messenger</div>
              <div className="text-xs text-muted-foreground mt-1">
                {isAr ? "رد فوري على فيسبوك" : "Instant reply on Facebook"}
              </div>
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-muted/50 rounded-xl p-1 border border-border">
            <button
              onClick={() => setMode("contact")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === "contact"
                  ? "bg-white text-[#021544] shadow-sm"
                  : "text-muted-foreground hover:text-[#021544]"
              }`}
            >
              💬 {t.tabContact}
            </button>
            <button
              onClick={() => setMode("careers")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === "careers"
                  ? "bg-white text-[#021544] shadow-sm"
                  : "text-muted-foreground hover:text-[#021544]"
              }`}
            >
              💼 {t.tabCareers}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: form OR open positions */}
          <div>
            {mode === "careers" ? (
              <div>
                <h2 className="text-xl font-bold text-[#021544] mb-2">{t.openPositions}</h2>
                <p className="text-sm text-muted-foreground mb-5">{t.careersIntro}</p>
                <div className="space-y-3">
                  {positions.map((p, i) => (
                    <div
                      key={i}
                      className={`bg-white border rounded-xl p-5 transition-all ${
                        p.filled
                          ? "border-border/50 opacity-75"
                          : "border-border hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`text-2xl ${p.filled ? "grayscale" : ""}`}>{p.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`font-bold text-sm ${p.filled ? "text-muted-foreground line-through" : "text-[#021544]"}`}>
                              {p.title}
                            </h3>
                            {p.filled && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold whitespace-nowrap">
                                ✓ {t.filled}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#0070F2] font-medium mt-0.5">{p.type}</div>
                          <p className={`text-xs mt-2 leading-relaxed ${p.filled ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                            {p.desc}
                          </p>
                          {p.filled ? (
                            <div className="mt-3 text-[11px] text-muted-foreground italic">
                              {t.notAccepting}
                            </div>
                          ) : (
                            <button
                              onClick={() => applyToPosition(p.title)}
                              className="mt-3 text-xs font-semibold text-[#0070F2] hover:underline"
                            >
                              ← {t.apply}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#021544] to-[#0070F2] rounded-2xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-3">{isAr ? "نحن هنا للمساعدة" : "We're here to help"}</h2>
                <p className="text-white/80 text-sm mb-6">
                  {isAr
                    ? "سواء كنت محاسباً يبحث عن نظام محاسبي أحدث، صاحب شركة عاوز يحوّل أعماله للسحابة، أو شريك محتمل — فريقنا جاهز للرد عليك خلال ساعات."
                    : "Whether you're an accountant looking for a modern system, a business owner moving to the cloud, or a potential partner — our team will reply within hours."}
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">⏱</div>
                    <div>
                      <div className="font-semibold">{isAr ? "رد سريع" : "Fast reply"}</div>
                      <div className="text-xs text-white/70">
                        {isAr ? "متوسط الرد خلال ساعتين" : "Average reply within 2 hours"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">🌍</div>
                    <div>
                      <div className="font-semibold">{isAr ? "29+ دولة" : "29+ countries"}</div>
                      <div className="text-xs text-white/70">
                        {isAr ? "ندعم العملاء في الوطن العربي والعالم" : "Serving customers across the Arab world and beyond"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">🔒</div>
                    <div>
                      <div className="font-semibold">{isAr ? "خصوصية تامة" : "Full privacy"}</div>
                      <div className="text-xs text-white/70">
                        {isAr ? "بياناتك آمنة ولا تُشارك مع أي طرف ثالث" : "Your data is secure and never shared"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column: form */}
          <div id="contact-form" className="bg-white rounded-2xl border border-border shadow-xl p-8">
            <h2 className="text-xl font-bold text-[#021544] mb-1">{t.formTitle[mode]}</h2>
            <p className="text-xs text-muted-foreground mb-6">
              {isAr ? "* الحقول المطلوبة" : "* Required fields"}
            </p>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#021544] mb-1.5">{t.name} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#0070F2]/20 focus:border-[#0070F2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#021544] mb-1.5">{t.email} *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#0070F2]/20 focus:border-[#0070F2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#021544] mb-1.5">{t.phone}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#0070F2]/20 focus:border-[#0070F2]"
                  />
                </div>
              </div>

              {mode === "contact" ? (
                <div>
                  <label className="block text-xs font-semibold text-[#021544] mb-1.5">{t.subject}</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#0070F2]/20 focus:border-[#0070F2]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#021544] mb-1.5">{t.position}</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#0070F2]/20 focus:border-[#0070F2]"
                  >
                    <option value="">{isAr ? "اختر الوظيفة" : "Choose position"}</option>
                    {positions.filter(p => !p.filled).map((p, i) => (
                      <option key={i} value={p.title}>
                        {p.title}
                      </option>
                    ))}
                    <option value={isAr ? "أخرى" : "Other"}>{isAr ? "أخرى" : "Other"}</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#021544] mb-1.5">
                  {t.message[mode]} *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    mode === "careers"
                      ? isAr
                        ? "اكتب نبذة عنك وألصق رابط CV (Drive / LinkedIn)"
                        : "Tell us about yourself and paste your CV link (Drive / LinkedIn)"
                      : ""
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#0070F2]/20 focus:border-[#0070F2] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-l from-[#021544] to-[#0070F2] text-white font-bold text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t.sending : t.send}
              </button>

              {result && (
                <div
                  className={`p-3 rounded-xl text-sm ${
                    result.ok
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {result.msg}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#021544] text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} G-Ledger.{" "}
          {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
        </div>
      </footer>
    </div>
  );
}
