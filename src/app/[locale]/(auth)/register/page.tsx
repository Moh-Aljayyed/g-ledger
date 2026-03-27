"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import Link from "next/link";

const SECTORS = [
  "INDUSTRIAL", "COMMERCIAL", "SERVICES", "BANKING", "INSURANCE",
  "REAL_ESTATE", "CONTRACTING", "AGRICULTURAL", "TECHNOLOGY",
  "NON_PROFIT", "CROWDFUNDING", "MEDICAL_HOSPITAL", "MEDICAL_PHARMACY",
  "MEDICAL_CLINIC", "MEDICAL_LAB",
] as const;

export default function RegisterPage() {
  const t = useTranslations("auth");
  const ts = useTranslations("sectors");
  const td = useTranslations("sectorDescriptions");
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    sector: "" as string,
  });
  const [error, setError] = useState("");

  const register = trpc.auth.register.useMutation({
    onSuccess: () => {
      router.push("/ar/login");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      return;
    }

    if (!formData.sector) {
      setError("يرجى اختيار القطاع");
      return;
    }

    register.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      businessName: formData.businessName,
      sector: formData.sector as any,
    });
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary mx-auto flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-2xl">GL</span>
          </div>
          <h1 className="text-2xl font-bold">{t("register")}</h1>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              1
            </div>
            <span className="text-sm font-medium">بيانات الحساب</span>
          </div>
          <div className="w-12 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              2
            </div>
            <span className="text-sm font-medium">اختيار القطاع</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Account Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("fullName")}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("email")}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("businessName")}</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t("password")}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t("confirmPassword")}</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none"
                    dir="ltr"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (formData.name && formData.email && formData.password && formData.businessName) {
                    setStep(2);
                  }
                }}
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
              >
                التالي — اختر القطاع
              </button>
            </div>
          )}

          {/* Step 2: Sector Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-4">
                اختر القطاع المناسب لنشاطك التجاري. سيتم إعداد شجرة الحسابات تلقائيًا.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {SECTORS.map((sector) => (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => setFormData({ ...formData, sector })}
                    className={`p-4 rounded-lg border text-start transition-all ${
                      formData.sector === sector
                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="font-medium text-sm">{ts(sector)}</div>
                    <div className="text-xs text-muted-foreground mt-1">{td(sector)}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 border border-border rounded-lg font-medium hover:bg-muted transition-all"
                >
                  رجوع
                </button>
                <button
                  type="submit"
                  disabled={!formData.sector || register.isPending}
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  {register.isPending ? "جاري الإنشاء..." : t("register")}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("alreadyHaveAccount")}{" "}
          <Link href="/ar/login" className="text-primary font-medium hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
