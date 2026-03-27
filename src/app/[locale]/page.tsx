import Link from "next/link";
import { useLocale } from "next-intl";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">GL</span>
            </div>
            <h1 className="text-xl font-bold">المحاسب العام</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/ar/login"
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/ar/register"
              className="px-6 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              إنشاء حساب مجاني
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-5xl font-bold leading-tight mb-6">
          نظام محاسبي سحابي
          <br />
          <span className="text-primary">متعدد القطاعات</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          شجرة حسابات جاهزة ومُعدّة مسبقًا لكل قطاع. اختر قطاعك والنظام يجهّز لك كل شيء
          — صناعي، تجاري، طبي، خدمي، والمزيد.
        </p>
        <Link
          href="/ar/register"
          className="inline-flex px-8 py-4 text-lg font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
        >
          ابدأ مجانًا الآن
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "15 قطاع مدعوم",
              desc: "من الصناعي والتجاري إلى الطبي والمقاولات — شجرة حسابات مخصصة لكل قطاع",
              icon: "🏢",
            },
            {
              title: "محاسبة القيد المزدوج",
              desc: "نظام محاسبي متكامل يشمل القيود اليومية، الأستاذ العام، وميزان المراجعة",
              icon: "📊",
            },
            {
              title: "تقارير مالية فورية",
              desc: "قائمة الدخل والميزانية العمومية والتدفقات النقدية — متاحة في أي لحظة",
              icon: "📈",
            },
            {
              title: "عربي وإنجليزي",
              desc: "واجهة كاملة بالعربية مع دعم الإنجليزية — أسماء حسابات ثنائية اللغة",
              icon: "🌐",
            },
            {
              title: "آمن وسحابي",
              desc: "بياناتك محمية ومتاحة من أي مكان — لا تثبيت ولا صيانة",
              icon: "🔒",
            },
            {
              title: "سهل الاستخدام",
              desc: "واجهة بسيطة ومباشرة — لا تحتاج خبرة تقنية للبدء",
              icon: "✨",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow"
            >
              <span className="text-3xl mb-4 block">{feature.icon}</span>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sectors Grid */}
      <section className="container mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center mb-10">القطاعات المدعومة</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: "صناعي", icon: "🏭" },
            { name: "تجاري", icon: "🛒" },
            { name: "خدمي", icon: "💼" },
            { name: "بنوك ومالي", icon: "🏦" },
            { name: "تأمين", icon: "🛡️" },
            { name: "عقاري", icon: "🏗️" },
            { name: "مقاولات", icon: "🔨" },
            { name: "زراعي", icon: "🌾" },
            { name: "تقني / SaaS", icon: "💻" },
            { name: "غير ربحي", icon: "❤️" },
            { name: "تمويل جماعي", icon: "🤝" },
            { name: "مستشفيات", icon: "🏥" },
            { name: "صيدليات", icon: "💊" },
            { name: "عيادات", icon: "🩺" },
            { name: "معامل تحاليل", icon: "🔬" },
          ].map((sector) => (
            <div
              key={sector.name}
              className="p-4 rounded-lg border border-border bg-card text-center hover:border-primary/50 transition-colors"
            >
              <span className="text-2xl block mb-2">{sector.icon}</span>
              <span className="text-sm font-medium">{sector.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
          © 2026 المحاسب العام — General Ledger. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
