"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function WhatsAppPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  // Quick reply templates
  const templates = [
    {
      label: isAr ? "ترحيب" : "Welcome",
      text: isAr
        ? "مرحباً! 👋\nشكراً لتواصلك مع G-Ledger (حساب الأستاذ).\nنظام محاسبي سحابي متكامل يدعم 16 قطاع.\nتجربة مجانية 6 أشهر: g-ledger.com\nكيف أقدر أساعدك؟"
        : "Hello! 👋\nThanks for contacting G-Ledger.\nCloud ERP for 16 sectors.\nFree 6mo trial: g-ledger.com\nHow can I help?",
    },
    {
      label: isAr ? "تسعير" : "Pricing",
      text: isAr
        ? "أسعارنا:\n🆓 مجاني — 6 أشهر\n💵 أساسي — 400 ج.م / 40 ر.س / $8 شهرياً\n⭐ احترافي — 750 ج.م / 75 ر.س / $15\n🏢 مؤسسي — 1,250 ج.م / 125 ر.س / $25\n\nسجّل مجاناً: g-ledger.com/ar/register"
        : "Pricing:\n🆓 Free — 6 months\n💵 Basic — $8/mo\n⭐ Pro — $15/mo\n🏢 Enterprise — $25/mo\n\nStart free: g-ledger.com/en/register",
    },
    {
      label: isAr ? "مميزات" : "Features",
      text: isAr
        ? "مميزات G-Ledger:\n✅ 16 قطاع بشجرة حسابات جاهزة\n✅ فوترة إلكترونية ETA + ZATCA\n✅ مخزون + مبيعات + مشتريات\n✅ رواتب + HR + إجازات\n✅ CRM + مشاريع + مصروفات\n✅ POS نقاط بيع\n✅ 29+ دولة\n✅ عربي + إنجليزي\n\ng-ledger.com"
        : "Features:\n✅ 16 sectors with ready charts\n✅ E-invoicing ETA + ZATCA\n✅ Inventory + Sales + Purchases\n✅ Payroll + HR + Leaves\n✅ CRM + Projects + Expenses\n✅ POS\n✅ 29+ countries\n\ng-ledger.com",
    },
    {
      label: isAr ? "دعم فني" : "Support",
      text: isAr
        ? "للدعم الفني:\n💬 شات بوت في الموقع: g-ledger.com\n📧 إيميل: info@g-ledger.com\n📘 ماسنجر: m.me/1043966828805970\n\nفريقنا جاهز لمساعدتك!"
        : "Support:\n💬 Chatbot: g-ledger.com\n📧 Email: info@g-ledger.com\n📘 Messenger: m.me/1043966828805970\n\nWe're here to help!",
    },
  ];

  const sendMessage = async () => {
    if (!phone || !message) return;
    setSending(true);
    setResult("");

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message }),
      });
      const data = await res.json();

      if (data.method === "link") {
        // No API key — open WhatsApp link
        window.open(data.url, "_blank");
        setResult(isAr ? "✓ تم فتح واتساب — أرسل الرسالة من هناك" : "✓ WhatsApp opened — send from there");
      } else if (data.success) {
        setResult(isAr ? "✓ تم إرسال الرسالة!" : "✓ Message sent!");
        setMessage("");
      } else {
        setResult(data.error || "فشل الإرسال");
      }
    } catch {
      setResult(isAr ? "خطأ في الاتصال" : "Connection error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#021544] mb-2">{isAr ? "رسائل واتساب" : "WhatsApp Messages"}</h1>
      <p className="text-muted-foreground mb-6">{isAr ? "أرسل رسائل لعملائك وموردينك عبر واتساب" : "Send messages to customers and vendors via WhatsApp"}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Form */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <h2 className="font-bold text-[#021544] mb-4">{isAr ? "إرسال رسالة" : "Send Message"}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "رقم الهاتف" : "Phone Number"}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+201004004744"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "الرسالة" : "Message"}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {result && (
              <p className={`text-sm ${result.includes("✓") ? "text-green-600" : "text-red-500"}`}>{result}</p>
            )}

            <button
              onClick={sendMessage}
              disabled={!phone || !message || sending}
              className="w-full py-3 bg-[#25D366] text-white rounded-lg font-bold hover:bg-[#20BD5A] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? "..." : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  {isAr ? "إرسال عبر واتساب" : "Send via WhatsApp"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-bold text-[#021544] mb-4">{isAr ? "ردود جاهزة" : "Quick Replies"}</h2>
          <div className="space-y-2">
            {templates.map((t, i) => (
              <button
                key={i}
                onClick={() => setMessage(t.text)}
                className="w-full text-start px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-medium text-[#021544]">{t.label}</span>
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{t.text.substring(0, 60)}...</p>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-[10px] text-amber-700">
              {isAr
                ? "⚠️ حالياً الإرسال يفتح واتساب في نافذة جديدة. لتفعيل الإرسال التلقائي، أضف مفتاح UltraMsg API في الإعدادات."
                : "⚠️ Currently opens WhatsApp in new window. For auto-send, add UltraMsg API key in settings."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
