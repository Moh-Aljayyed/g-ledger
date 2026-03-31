"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function ReferralPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState("");
  const [applyResult, setApplyResult] = useState("");

  const { data: referral, isLoading } = trpc.referral.getMyCode.useQuery();
  const applyMutation = trpc.referral.applyCode.useMutation({
    onSuccess: (data) => setApplyResult(data.message),
    onError: (err) => setApplyResult(err.message),
  });

  const referralLink = `https://g-ledger.com/${isAr ? "ar" : "en"}/register?ref=${referral?.code || ""}`;
  const shareText = isAr
    ? `جرّب G-Ledger — أفضل نظام محاسبي سحابي! استخدم كود الإحالة ${referral?.code} واحصل على مساحة إضافية مجاناً.\n${referralLink}`
    : `Try G-Ledger — the best cloud accounting! Use code ${referral?.code} for extra storage.\n${referralLink}`;

  const copy = () => { navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(() => setCopied(false), 3000); };
  const shareWA = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  const shareEmail = () => window.open(`mailto:?subject=${encodeURIComponent("G-Ledger")}&body=${encodeURIComponent(shareText)}`, "_blank");
  const shareSMS = () => window.open(`sms:?body=${encodeURIComponent(shareText)}`, "_blank");
  const shareTelegram = () => window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`, "_blank");
  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
  const shareLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, "_blank");
  const shareFB = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, "_blank");
  const nativeShare = async () => { if (navigator.share) try { await navigator.share({ title: "G-Ledger", text: shareText, url: referralLink }); } catch {} };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0070F2] to-[#00C9A7] mx-auto flex items-center justify-center mb-4 shadow-lg">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-[#021544]">{isAr ? "برنامج الإحالة" : "Referral Program"}</h1>
        <p className="text-muted-foreground mt-2">{isAr ? "شارك G-Ledger مع أصدقائك واحصل على 10,000 KB مساحة إضافية لكل إحالة ناجحة!" : "Share G-Ledger with friends and get 10,000 KB extra storage per referral!"}</p>
      </div>

      {/* Code Card */}
      <div className="bg-gradient-to-br from-[#021544] to-[#0070F2] rounded-2xl p-8 text-white text-center mb-8 shadow-xl">
        <p className="text-white/60 text-sm mb-2">{isAr ? "كود الإحالة الخاص بك" : "Your Referral Code"}</p>
        <div className="text-4xl font-bold font-mono tracking-[8px] mb-4">{referral?.code}</div>
        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3 max-w-md mx-auto mb-6">
          <input type="text" value={referralLink} readOnly className="flex-1 bg-transparent text-white/80 text-xs outline-none" dir="ltr" />
          <button onClick={copy} className="px-4 py-2 bg-white text-[#021544] rounded-lg text-xs font-bold hover:bg-white/90 transition-all shrink-0">
            {copied ? (isAr ? "✓ تم النسخ!" : "✓ Copied!") : (isAr ? "نسخ" : "Copy")}
          </button>
        </div>

        <p className="text-white/50 text-xs mb-3">{isAr ? "شارك عبر" : "Share via"}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button onClick={nativeShare} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-all">📲 {isAr ? "مشاركة" : "Share"}</button>
          )}
          <button onClick={shareWA} className="px-4 py-2.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 rounded-xl text-sm transition-all">💬 WhatsApp</button>
          <button onClick={shareEmail} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-all">📧 {isAr ? "إيميل" : "Email"}</button>
          <button onClick={shareSMS} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-all">📱 SMS</button>
          <button onClick={shareTelegram} className="px-4 py-2.5 bg-[#0088cc]/20 hover:bg-[#0088cc]/30 rounded-xl text-sm transition-all">✈️ Telegram</button>
          <button onClick={shareTwitter} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-all">𝕏 Twitter</button>
          <button onClick={shareLinkedIn} className="px-4 py-2.5 bg-[#0077B5]/20 hover:bg-[#0077B5]/30 rounded-xl text-sm transition-all">💼 LinkedIn</button>
          <button onClick={shareFB} className="px-4 py-2.5 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 rounded-xl text-sm transition-all">📘 Facebook</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-3xl font-bold text-[#0070F2]">{referral?.referrals ?? 0}</p>
          <p className="text-sm text-muted-foreground mt-1">{isAr ? "عدد الإحالات" : "Total Referrals"}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-3xl font-bold text-[#00C9A7]">{((referral?.totalRewardKB ?? 0) / 1024).toFixed(1)} MB</p>
          <p className="text-sm text-muted-foreground mt-1">{isAr ? "المكافأة الإجمالية" : "Total Reward"}</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <h3 className="font-bold text-[#021544] mb-4">{isAr ? "كيف يعمل؟" : "How it works?"}</h3>
        <div className="flex flex-col md:flex-row gap-4">
          {[
            isAr ? "شارك كودك مع أصدقائك" : "Share your code with friends",
            isAr ? "صديقك يسجل باستخدام الكود" : "Friend registers using the code",
            isAr ? "تحصل على 10,000 KB مساحة إضافية" : "You get 10,000 KB extra storage",
          ].map((step, i) => (
            <div key={i} className="flex-1 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0070F2] text-white flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</div>
              <p className="text-sm text-muted-foreground pt-1">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Code */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-bold text-[#021544] mb-3">{isAr ? "هل لديك كود إحالة؟" : "Have a referral code?"}</h3>
        <div className="flex gap-2">
          <input type="text" value={applyCode} onChange={(e) => setApplyCode(e.target.value.toUpperCase())} placeholder={isAr ? "أدخل كود الإحالة" : "Enter referral code"} className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring font-mono tracking-wider" dir="ltr" />
          <button onClick={() => { if (applyCode) applyMutation.mutate({ code: applyCode }); }} disabled={!applyCode || applyMutation.isPending} className="px-6 py-2.5 bg-[#0070F2] text-white rounded-lg font-medium hover:bg-[#005ed4] disabled:opacity-50 transition-all">
            {isAr ? "تطبيق" : "Apply"}
          </button>
        </div>
        {applyResult && <p className={`text-sm mt-2 ${applyResult.includes("تم") || applyResult.includes("success") ? "text-green-600" : "text-red-500"}`}>{applyResult}</p>}
      </div>
    </div>
  );
}
