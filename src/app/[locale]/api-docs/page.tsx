"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { LogoFull } from "@/components/logo";
import { useState } from "react";

const endpoints = [
  { method: "GET", path: "/api/v1/accounts", desc: { ar: "قائمة شجرة الحسابات", en: "List chart of accounts" } },
  { method: "GET", path: "/api/v1/journal-entries", desc: { ar: "قائمة القيود اليومية", en: "List journal entries" } },
  { method: "POST", path: "/api/v1/journal-entries", desc: { ar: "إنشاء قيد يومي", en: "Create journal entry" } },
  { method: "GET", path: "/api/v1/customers", desc: { ar: "قائمة العملاء", en: "List customers" } },
  { method: "POST", path: "/api/v1/customers", desc: { ar: "إنشاء عميل", en: "Create customer" } },
  { method: "GET", path: "/api/v1/vendors", desc: { ar: "قائمة الموردين", en: "List vendors" } },
  { method: "POST", path: "/api/v1/vendors", desc: { ar: "إنشاء مورد", en: "Create vendor" } },
  { method: "GET", path: "/api/v1/products", desc: { ar: "قائمة المنتجات", en: "List products" } },
  { method: "POST", path: "/api/v1/products", desc: { ar: "إنشاء منتج", en: "Create product" } },
  { method: "GET", path: "/api/v1/invoices", desc: { ar: "قائمة الفواتير", en: "List invoices" } },
  { method: "POST", path: "/api/v1/invoices", desc: { ar: "إنشاء فاتورة", en: "Create invoice" } },
  { method: "GET", path: "/api/v1/employees", desc: { ar: "قائمة الموظفين", en: "List employees" } },
];

export default function ApiDocsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<"curl" | "js" | "python">("curl");

  const t = {
    title: isAr ? "G-Ledger Public API v1" : "G-Ledger Public API v1",
    subtitle: isAr
      ? "اربط أنظمتك الخارجية (Odoo، Bayzat، Workday وغيرها) مباشرة بنظام G-Ledger عبر REST API"
      : "Connect your external systems (Odoo, Bayzat, Workday, etc.) directly to G-Ledger via REST API",
    baseUrl: isAr ? "الرابط الأساسي" : "Base URL",
    auth: isAr ? "المصادقة" : "Authentication",
    authDesc: isAr
      ? "جميع الطلبات تتطلب مفتاح API يُرسل في ترويسة Authorization كـ Bearer Token. احصل على مفتاحك من الإعدادات."
      : "All requests require an API key sent in the Authorization header as a Bearer Token. Get your key from Settings.",
    endpoints: isAr ? "نقاط الوصول" : "Endpoints",
    method: isAr ? "الطريقة" : "Method",
    endpoint: isAr ? "نقطة الوصول" : "Endpoint",
    description: isAr ? "الوصف" : "Description",
    examples: isAr ? "أمثلة الاستخدام" : "Code Examples",
    rateLimit: isAr ? "حدود الاستخدام" : "Rate Limiting",
    rateLimitDesc: isAr
      ? "100 طلب في الدقيقة لكل مفتاح API. عند تجاوز الحد، ستحصل على رد 429 Too Many Requests."
      : "100 requests per minute per API key. When exceeded, you will receive a 429 Too Many Requests response.",
    getApiKey: isAr ? "احصل على مفتاح API من الإعدادات" : "Get your API key from Settings",
    pagination: isAr ? "التصفح" : "Pagination",
    paginationDesc: isAr
      ? "النقاط التي تدعم التصفح تقبل معاملات page و limit. الحد الأقصى لـ limit هو 100."
      : "Endpoints that support pagination accept page and limit parameters. Maximum limit is 100.",
    errors: isAr ? "رموز الأخطاء" : "Error Codes",
    response: isAr ? "شكل الاستجابة" : "Response Format",
    responseDesc: isAr
      ? "جميع الاستجابات بصيغة JSON مع حقل data يحتوي البيانات وحقل total لعدد النتائج."
      : "All responses are JSON with a data field containing the results and a total field for count.",
    backHome: isAr ? "الرئيسية" : "Home",
    login: isAr ? "تسجيل الدخول" : "Login",
  };

  const curlExample = `curl -X GET "https://app.g-ledger.com/api/v1/accounts" \\
  -H "Authorization: Bearer glk_your_api_key_here" \\
  -H "Content-Type: application/json"`;

  const curlPostExample = `curl -X POST "https://app.g-ledger.com/api/v1/journal-entries" \\
  -H "Authorization: Bearer glk_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "date": "2026-03-30",
    "description": "Sales revenue",
    "lines": [
      { "accountId": "acc_cash", "debit": 1150, "credit": 0 },
      { "accountId": "acc_revenue", "debit": 0, "credit": 1000 },
      { "accountId": "acc_vat", "debit": 0, "credit": 150 }
    ]
  }'`;

  const jsExample = `const response = await fetch("https://app.g-ledger.com/api/v1/accounts", {
  headers: {
    "Authorization": "Bearer glk_your_api_key_here",
    "Content-Type": "application/json",
  },
});
const { data, total } = await response.json();
console.log(\`Found \${total} accounts\`);`;

  const jsPostExample = `const response = await fetch("https://app.g-ledger.com/api/v1/journal-entries", {
  method: "POST",
  headers: {
    "Authorization": "Bearer glk_your_api_key_here",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    date: "2026-03-30",
    description: "Sales revenue",
    lines: [
      { accountId: "acc_cash", debit: 1150, credit: 0 },
      { accountId: "acc_revenue", debit: 0, credit: 1000 },
      { accountId: "acc_vat", debit: 0, credit: 150 },
    ],
  }),
});
const { data } = await response.json();`;

  const pythonExample = `import requests

headers = {
    "Authorization": "Bearer glk_your_api_key_here",
    "Content-Type": "application/json",
}

# List accounts
response = requests.get("https://app.g-ledger.com/api/v1/accounts", headers=headers)
data = response.json()
print(f"Found {data['total']} accounts")`;

  const pythonPostExample = `import requests

headers = {
    "Authorization": "Bearer glk_your_api_key_here",
    "Content-Type": "application/json",
}

# Create journal entry
response = requests.post(
    "https://app.g-ledger.com/api/v1/journal-entries",
    headers=headers,
    json={
        "date": "2026-03-30",
        "description": "Sales revenue",
        "lines": [
            {"accountId": "acc_cash", "debit": 1150, "credit": 0},
            {"accountId": "acc_revenue", "debit": 0, "credit": 1000},
            {"accountId": "acc_vat", "debit": 0, "credit": 150},
        ],
    },
)
entry = response.json()["data"]`;

  const errorCodes = [
    { code: "401", desc: isAr ? "غير مصرح — مفتاح API غير صالح أو مفقود" : "Unauthorized — invalid or missing API key" },
    { code: "400", desc: isAr ? "طلب غير صالح — بيانات مفقودة أو غير صحيحة" : "Bad Request — missing or invalid data" },
    { code: "404", desc: isAr ? "غير موجود — المورد غير موجود" : "Not Found — resource does not exist" },
    { code: "429", desc: isAr ? "تجاوز الحد — انتظر قبل المحاولة مرة أخرى" : "Too Many Requests — wait before retrying" },
    { code: "500", desc: isAr ? "خطأ في الخادم — حاول مرة أخرى لاحقًا" : "Server Error — try again later" },
  ];

  return (
    <div className={`min-h-screen bg-[#f8fafc] ${isAr ? "font-['Tajawal',sans-serif]" : ""}`} dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <LogoFull size="md" variant="dark" />
          <div className="flex items-center gap-4">
            <Link href={`/${locale}`} className="text-sm text-gray-600 hover:text-[#0070F2] transition-colors">
              {t.backHome}
            </Link>
            <Link
              href={`/${locale}/login`}
              className="px-5 py-2 text-sm font-semibold bg-gradient-to-l from-[#021544] to-[#0070F2] text-white rounded-xl hover:shadow-lg transition-all"
            >
              {t.login}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#021544] via-[#0a1e5e] to-[#0070F2] text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            REST API v1
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Base URL */}
        <section>
          <h2 className="text-xl font-bold text-[#021544] mb-4">{t.baseUrl}</h2>
          <div className="bg-[#0f172a] text-green-400 font-mono text-sm p-4 rounded-xl">
            https://app.g-ledger.com/api/v1/
          </div>
        </section>

        {/* Authentication */}
        <section>
          <h2 className="text-xl font-bold text-[#021544] mb-4">{t.auth}</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-gray-600 mb-4">{t.authDesc}</p>
            <div className="bg-[#0f172a] text-gray-300 font-mono text-sm p-4 rounded-lg">
              <span className="text-blue-400">Authorization</span>: Bearer <span className="text-green-400">glk_your_api_key_here</span>
            </div>
            <div className="mt-4">
              <Link
                href={`/${locale}/settings`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0070F2] text-white text-sm font-medium rounded-lg hover:bg-[#005bc4] transition-colors"
              >
                {t.getApiKey} &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Endpoints Table */}
        <section>
          <h2 className="text-xl font-bold text-[#021544] mb-4">{t.endpoints}</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase">{t.method}</th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase">{t.endpoint}</th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase">{t.description}</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((ep, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        ep.method === "GET" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {ep.method}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-sm text-gray-800">{ep.path}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{ep.desc[isAr ? "ar" : "en"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Response Format */}
        <section>
          <h2 className="text-xl font-bold text-[#021544] mb-4">{t.response}</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-gray-600 mb-4">{t.responseDesc}</p>
            <div className="bg-[#0f172a] text-gray-300 font-mono text-sm p-4 rounded-lg whitespace-pre">{`{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 50,
  "pages": 1
}`}</div>
          </div>
        </section>

        {/* Pagination */}
        <section>
          <h2 className="text-xl font-bold text-[#021544] mb-4">{t.pagination}</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-gray-600 mb-4">{t.paginationDesc}</p>
            <div className="bg-[#0f172a] text-green-400 font-mono text-sm p-4 rounded-lg">
              GET /api/v1/journal-entries?page=2&limit=25
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section>
          <h2 className="text-xl font-bold text-[#021544] mb-4">{t.examples}</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {(["curl", "js", "python"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "text-[#0070F2] border-b-2 border-[#0070F2] bg-blue-50/50"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "curl" ? "cURL" : tab === "js" ? "JavaScript" : "Python"}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4">
              {/* GET example */}
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase mb-2 block">GET {isAr ? "مثال" : "Example"}</span>
                <pre className="bg-[#0f172a] text-gray-300 font-mono text-sm p-4 rounded-lg overflow-x-auto whitespace-pre">
                  {activeTab === "curl" ? curlExample : activeTab === "js" ? jsExample : pythonExample}
                </pre>
              </div>

              {/* POST example */}
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase mb-2 block">POST {isAr ? "مثال" : "Example"}</span>
                <pre className="bg-[#0f172a] text-gray-300 font-mono text-sm p-4 rounded-lg overflow-x-auto whitespace-pre">
                  {activeTab === "curl" ? curlPostExample : activeTab === "js" ? jsPostExample : pythonPostExample}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Error Codes */}
        <section>
          <h2 className="text-xl font-bold text-[#021544] mb-4">{t.errors}</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase">{isAr ? "الرمز" : "Code"}</th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase">{t.description}</th>
                </tr>
              </thead>
              <tbody>
                {errorCodes.map((err) => (
                  <tr key={err.code} className="border-b border-gray-100">
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        err.code === "401" ? "bg-red-100 text-red-700" :
                        err.code === "400" ? "bg-yellow-100 text-yellow-700" :
                        err.code === "404" ? "bg-gray-100 text-gray-700" :
                        err.code === "429" ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {err.code}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{err.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Rate Limiting */}
        <section>
          <h2 className="text-xl font-bold text-[#021544] mb-4">{t.rateLimit}</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-amber-800">{t.rateLimitDesc}</p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <div className="bg-gradient-to-br from-[#021544] to-[#0070F2] rounded-2xl p-10 text-white">
            <h3 className="text-2xl font-bold mb-3">
              {isAr ? "جاهز للتكامل؟" : "Ready to Integrate?"}
            </h3>
            <p className="text-white/70 mb-6">
              {isAr ? "سجّل الآن واحصل على مفتاح API خلال دقيقة واحدة" : "Sign up now and get your API key in one minute"}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href={`/${locale}/register`}
                className="px-8 py-3 bg-white text-[#021544] font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                {isAr ? "ابدأ مجانًا" : "Start Free"}
              </Link>
              <Link
                href={`/${locale}/settings`}
                className="px-8 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
              >
                {t.getApiKey}
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-[#021544] text-white/50 text-center py-6 text-sm">
        &copy; {new Date().getFullYear()} G-Ledger. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
      </footer>
    </div>
  );
}
