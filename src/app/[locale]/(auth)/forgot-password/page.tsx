"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { LogoIcon } from "@/components/logo";
import { LangLink } from "@/components/lang-link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const locale = isAr ? "/ar" : "/en";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const sendOTP = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => setStep(2),
    onError: (err) => setError(err.message),
  });

  const resetPassword = trpc.auth.resetPassword.useMutation({
    onSuccess: () => setSuccess(true),
    onError: (err) => setError(err.message),
  });

  const t = {
    title: isAr ? "نسيت كلمة المرور" : "Forgot Password",
    subtitle: isAr ? "أدخل إيميلك وسنرسل لك رمز تحقق" : "Enter your email and we'll send you a verification code",
    email: isAr ? "البريد الإلكتروني" : "Email",
    sendCode: isAr ? "إرسال رمز التحقق" : "Send Verification Code",
    sending: isAr ? "جاري الإرسال..." : "Sending...",
    codeSent: isAr ? "تم إرسال رمز التحقق إلى" : "Verification code sent to",
    enterCode: isAr ? "أدخل الرمز" : "Enter Code",
    verify: isAr ? "تحقق" : "Verify",
    newPassword: isAr ? "كلمة المرور الجديدة" : "New Password",
    confirmPassword: isAr ? "تأكيد كلمة المرور" : "Confirm Password",
    reset: isAr ? "إعادة تعيين كلمة المرور" : "Reset Password",
    resetting: isAr ? "جاري إعادة التعيين..." : "Resetting...",
    successMsg: isAr ? "تم تغيير كلمة المرور بنجاح!" : "Password changed successfully!",
    loginNow: isAr ? "تسجيل الدخول الآن" : "Login Now",
    backToLogin: isAr ? "العودة لتسجيل الدخول" : "Back to Login",
    mismatch: isAr ? "كلمتا المرور غير متطابقتين" : "Passwords don't match",
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
        <div className="text-center mb-2"><LangLink variant="auth" /></div>
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#021544] to-[#0070F2] mx-auto flex items-center justify-center mb-4 shadow-lg">
            <LogoIcon size={30} />
          </div>
          <h1 className="text-2xl font-bold text-[#021544]">{t.title}</h1>
          {step === 1 && <p className="text-xs text-muted-foreground mt-1">{t.subtitle}</p>}
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{error}</div>}

        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#22C55E"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            </div>
            <p className="text-green-700 font-bold">{t.successMsg}</p>
            <Link href={`${locale}/login`} className="block w-full py-3 bg-[#0070F2] text-white rounded-lg font-medium text-center hover:bg-[#005ed4]">{t.loginNow}</Link>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.email}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring" dir="ltr" />
                </div>
                <button onClick={() => { setError(""); sendOTP.mutate({ email }); }} disabled={!email || sendOTP.isPending} className="w-full py-3 bg-[#0070F2] text-white rounded-lg font-medium disabled:opacity-50">
                  {sendOTP.isPending ? t.sending : t.sendCode}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground">{t.codeSent} <strong>{email}</strong></p>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-2xl font-mono tracking-[12px] text-center outline-none focus:ring-2 focus:ring-ring" dir="ltr" />
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.newPassword}</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.confirmPassword}</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring" dir="ltr" />
                </div>
                <button onClick={() => {
                  setError("");
                  if (newPassword !== confirmPassword) { setError(t.mismatch); return; }
                  resetPassword.mutate({ email, code, newPassword });
                }} disabled={code.length !== 6 || !newPassword || resetPassword.isPending} className="w-full py-3 bg-[#0070F2] text-white rounded-lg font-medium disabled:opacity-50">
                  {resetPassword.isPending ? t.resetting : t.reset}
                </button>
              </div>
            )}

            <div className="text-center mt-4">
              <Link href={`${locale}/login`} className="text-sm text-[#0070F2] hover:underline">{t.backToLogin}</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
