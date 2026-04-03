import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#021544] to-[#0070F2]">
      <div className="text-center text-white max-w-md px-6">
        <div className="text-8xl font-bold mb-4 opacity-20">404</div>
        <h1 className="text-3xl font-bold mb-2">الصفحة غير موجودة</h1>
        <p className="text-white/60 mb-8">الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
        <div className="space-y-3">
          <Link href="/ar" className="block w-full py-3 bg-white text-[#021544] rounded-xl font-bold hover:bg-white/90 transition-all">
            الصفحة الرئيسية
          </Link>
          <Link href="/ar/dashboard" className="block w-full py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all">
            لوحة التحكم
          </Link>
        </div>
      </div>
    </div>
  );
}
