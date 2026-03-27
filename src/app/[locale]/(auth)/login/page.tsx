"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loginEmail, setLoginEmail] = useState("");

  const sendOTP = trpc.auth.sendEmailOTP.useMutation({
    onSuccess: () => setShowOTP(true),
  });

  const verifyOTPMutation = trpc.auth.verifyOTP.useMutation({
    onSuccess: (data) => {
      if (data.valid) {
        router.push("/ar/dashboard");
        router.refresh();
      } else {
        setError(data.error || "رمز غير صحيح");
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t("loginError"));
    } else {
      // Send OTP before allowing access
      setLoginEmail(email);
      sendOTP.mutate({ email });
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary mx-auto flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-2xl">GL</span>
          </div>
          <h1 className="text-2xl font-bold">{t("login")}</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        {!showOTP && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                placeholder="name@company.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">{t("password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {loading ? "..." : t("login")}
            </button>
          </form>
        )}

        {showOTP && (
          <div className="space-y-4 mt-4">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-700 text-sm text-center">
              تم إرسال رمز التحقق إلى {loginEmail}
            </div>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-2xl font-mono tracking-[12px] text-center outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
            />
            <button
              onClick={() => verifyOTPMutation.mutate({
                method: "email",
                target: loginEmail,
                code: otpCode,
              })}
              disabled={otpCode.length !== 6}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              تحقق ودخول
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("dontHaveAccount")}{" "}
          <Link href="/ar/register" className="text-primary font-medium hover:underline">
            {t("register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
