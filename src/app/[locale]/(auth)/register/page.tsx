"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useGeoLocation } from "./useGeoLocation";
import { LogoIcon } from "@/components/logo";
import { LangLink } from "@/components/lang-link";

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
  const pathname = usePathname();
  const isArabic = pathname.startsWith("/ar");
  const localePath = isArabic ? "/ar" : "/en";

  // Inline translations for registration UI
  const ui = {
    step1: isArabic ? "بيانات المنشأة" : "Business Info",
    step2: isArabic ? "الحساب والتحقق" : "Account & Verify",
    step3: isArabic ? "القطاع" : "Sector",
    enterRegNum: isArabic ? "{ui.enterRegNum}" : "Enter your commercial registration or tax number to auto-fetch business data",
    country: isArabic ? "الدولة" : "Country",
    arabCountries: isArabic ? "{ui.arabCountries}" : "Arab Countries",
    globalCountries: isArabic ? "{ui.globalCountries}" : "Global Countries",
    regNumLabel: isArabic ? "الرقم الضريبي" : "Tax/Registration Number",
    businessName: isArabic ? "اسم المنشأة" : "Business Name",
    businessNamePlaceholder: isArabic ? "اسم المنشأة" : "Business Name",
    autoFilled: isArabic ? "{ui.autoFilled}" : "Auto-filled from commercial registration",
    nextAccount: isArabic ? "{ui.nextAccount}" : "Next — Account Details",
    skipNoReg: isArabic ? "{ui.skipNoReg}" : "Skip — I don't have a registration number",
    verifyIdentity: isArabic ? "{ui.verifyIdentity}" : "Identity Verification",
    viaEmail: isArabic ? "إيميل" : "Email",
    viaWhatsapp: isArabic ? "واتساب" : "WhatsApp",
    sendOtpEmail: isArabic ? "إرسال رمز التحقق للإيميل" : "Send verification code to email",
    sendOtpWhatsapp: isArabic ? "إرسال رمز التحقق للواتساب" : "Send code via WhatsApp",
    sending: isArabic ? "{ui.sending}" : "Sending...",
    otpSentTo: isArabic ? "تم إرسال رمز مكون من 6 أرقام" : "6-digit code sent",
    verify: isArabic ? "تحقق" : "Verify",
    verifying: isArabic ? "{ui.verifying}" : "Verifying...",
    resendAfter: isArabic ? "إعادة الإرسال بعد" : "Resend after",
    seconds: isArabic ? "ثانية" : "seconds",
    resend: isArabic ? "{ui.resend}" : "Resend code",
    verified: isArabic ? "{ui.verified}" : "✓ Verified successfully",
    back: isArabic ? "{ui.back}" : "Back",
    nextSector: isArabic ? "{ui.nextSector}" : "Next — Choose Sector",
    chooseSector: isArabic ? "{ui.chooseSector}" : "Choose your business sector. Chart of accounts will be set up automatically.",
    creating: isArabic ? "{ui.creating}" : "Creating...",
    enterPhone: isArabic ? "أدخل رقم الواتساب" : "Enter WhatsApp number",
    passwordMismatch: isArabic ? "كلمة المرور غير متطابقة" : "Passwords don't match",
    selectSector: isArabic ? "يرجى اختيار القطاع" : "Please select a sector",
    termsAgree: isArabic ? "بالتسجيل، أنت توافق على" : "By registering, you agree to",
    termsLink: isArabic ? "شروط الاستخدام" : "Terms of Service",
    and: isArabic ? "و" : "and",
    privacyLink: isArabic ? "سياسة الخصوصية" : "Privacy Policy",
    slogan: isArabic ? "{ui.slogan}" : "Smart Accounting for Every Sector",
  };

  const { country: detectedCountry } = useGeoLocation();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    sector: "" as string,
    country: "SA" as "SA" | "EG",
    registrationNumber: "",
    taxId: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupQuery, setLookupQuery] = useState("");

  // OTP
  const [otpMethod, setOtpMethod] = useState<"email" | "whatsapp">("email");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  const sendEmailOTP = trpc.auth.sendEmailOTP.useMutation({
    onSuccess: () => { setOtpSent(true); setOtpCountdown(60); },
    onError: (err) => setError(err.message),
  });
  const sendWhatsAppOTP = trpc.auth.sendWhatsAppOTP.useMutation({
    onSuccess: () => { setOtpSent(true); setOtpCountdown(60); },
    onError: (err) => setError(err.message),
  });
  const verifyOTP = trpc.auth.verifyOTP.useMutation({
    onSuccess: (data) => {
      if (data.valid) { setOtpVerified(true); setStep(3); }
      else setError(data.error || "رمز غير صحيح");
    },
  });

  // Countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  useEffect(() => { if (detectedCountry) setFormData(prev => ({ ...prev, country: detectedCountry as any })); }, [detectedCountry]);

  // Debounced lookup
  const { data: verificationData, isLoading: lookingUp } = trpc.verification.lookup.useQuery(
    { registrationNumber: lookupQuery, country: formData.country },
    { enabled: lookupQuery.length >= 4 }
  );

  useEffect(() => {
    if (verificationData) {
      setLookupResult(verificationData);
      if (verificationData.found && verificationData.companyName) {
        setFormData((prev) => ({
          ...prev,
          businessName: verificationData.companyName,
        }));
      }
    }
  }, [verificationData]);

  const register = trpc.auth.register.useMutation({
    onSuccess: () => {
      router.push(`${localePath}/login`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(ui.passwordMismatch);
      return;
    }

    if (!formData.sector) {
      setError(ui.selectSector);
      return;
    }

    register.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      businessName: formData.businessName,
      sector: formData.sector as any,
      country: formData.country,
      registrationNumber: formData.registrationNumber || undefined,
    });
  };

  const handleRegistrationNumberChange = (value: string) => {
    setFormData({ ...formData, registrationNumber: value });
    // Trigger lookup after 4+ chars
    if (value.length >= 4) {
      setLookupQuery(value);
    } else {
      setLookupResult(null);
      setLookupQuery("");
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
        {/* Language Toggle */}
        <div className="text-center mb-4">
          <LangLink variant="auth" />
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#021544] to-[#0070F2] mx-auto flex items-center justify-center mb-4 shadow-lg">
            <LogoIcon size={30} />
          </div>
          <h1 className="text-2xl font-bold text-[#021544]">{t("register")}</h1>
          <p className="text-xs text-muted-foreground mt-1">{ui.slogan}</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[
            { num: 1, label: ui.step1 },
            { num: 2, label: ui.step2 },
            { num: 3, label: ui.step3 },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center gap-2">
              {idx > 0 && <div className="w-8 h-0.5 bg-border" />}
              <div className={`flex items-center gap-2 ${step >= s.num ? "text-[#0070F2]" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s.num ? "bg-[#0070F2] text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Business Registration */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-4">
                {ui.enterRegNum}
              </p>

              {/* Country Selection */}
              <div>
                <label className="block text-sm font-medium mb-1.5">{ui.country}</label>
                <div className="max-h-[320px] overflow-y-auto border border-border rounded-xl p-3 space-y-4">
                  {/* Arab Countries */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-2">{ui.arabCountries}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { code: "SA", flag: "🇸🇦", name: "السعودية" },
                        { code: "EG", flag: "🇪🇬", name: "مصر" },
                        { code: "AE", flag: "🇦🇪", name: "الإمارات" },
                        { code: "KW", flag: "🇰🇼", name: "الكويت" },
                        { code: "BH", flag: "🇧🇭", name: "البحرين" },
                        { code: "OM", flag: "🇴🇲", name: "عمان" },
                        { code: "QA", flag: "🇶🇦", name: "قطر" },
                        { code: "JO", flag: "🇯🇴", name: "الأردن" },
                        { code: "IQ", flag: "🇮🇶", name: "العراق" },
                        { code: "MA", flag: "🇲🇦", name: "المغرب" },
                        { code: "TN", flag: "🇹🇳", name: "تونس" },
                        { code: "SD", flag: "🇸🇩", name: "السودان" },
                        { code: "LY", flag: "🇱🇾", name: "ليبيا" },
                        { code: "LB", flag: "🇱🇧", name: "لبنان" },
                      ].map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setFormData({ ...formData, country: c.code as any })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.country === c.code
                              ? "bg-[#0070F2] text-white"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          <span>{c.flag}</span> {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Global Countries */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-2">{ui.globalCountries}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { code: "US", flag: "🇺🇸", name: "الولايات المتحدة" },
                        { code: "IN", flag: "🇮🇳", name: "الهند" },
                        { code: "CN", flag: "🇨🇳", name: "الصين" },
                        { code: "ID", flag: "🇮🇩", name: "إندونيسيا" },
                        { code: "PK", flag: "🇵🇰", name: "باكستان" },
                        { code: "BR", flag: "🇧🇷", name: "البرازيل" },
                        { code: "NG", flag: "🇳🇬", name: "نيجيريا" },
                        { code: "BD", flag: "🇧🇩", name: "بنغلاديش" },
                        { code: "RU", flag: "🇷🇺", name: "روسيا" },
                        { code: "MX", flag: "🇲🇽", name: "المكسيك" },
                        { code: "TR", flag: "🇹🇷", name: "تركيا" },
                        { code: "DE", flag: "🇩🇪", name: "ألمانيا" },
                        { code: "GB", flag: "🇬🇧", name: "المملكة المتحدة" },
                        { code: "FR", flag: "🇫🇷", name: "فرنسا" },
                        { code: "MY", flag: "🇲🇾", name: "ماليزيا" },
                      ].map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setFormData({ ...formData, country: c.code as any })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.country === c.code
                              ? "bg-[#0070F2] text-white"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          <span>{c.flag}</span> {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Number Input */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {formData.country === "SA" ? "رقم السجل التجاري (10 أرقام)" : "الرقم الضريبي (9 أرقام)"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => handleRegistrationNumberChange(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-lg font-mono tracking-wider focus:ring-2 focus:ring-ring outline-none text-center"
                    placeholder={formData.country === "SA" ? "1234567890" : "123456789"}
                    dir="ltr"
                    maxLength={formData.country === "SA" ? 10 : 9}
                  />
                  {lookingUp && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Lookup Result */}
              {lookupResult && (
                <div className={`p-4 rounded-lg ${
                  lookupResult.found
                    ? "bg-green-50 border border-green-200"
                    : lookupResult.validated
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-red-50 border border-red-200"
                }`}>
                  {lookupResult.found && lookupResult.companyName ? (
                    <div>
                      <div className="text-sm font-bold text-green-800 mb-1">✓ تم العثور على المنشأة</div>
                      <div className="text-sm text-green-700">{lookupResult.companyName}</div>
                      {lookupResult.city && (
                        <div className="text-xs text-green-600 mt-1">{lookupResult.city}</div>
                      )}
                      {lookupResult.activities && (
                        <div className="text-xs text-green-600 mt-1">النشاط: {lookupResult.activities}</div>
                      )}
                      {lookupResult.status && (
                        <div className="text-xs text-green-600 mt-1">الحالة: {lookupResult.status}</div>
                      )}
                    </div>
                  ) : lookupResult.validated || lookupResult.message ? (
                    <div>
                      <div className="text-sm font-medium text-blue-700">
                        {lookupResult.message || "تم التحقق من صيغة الرقم ✓"}
                      </div>
                      {lookupResult.governorate && (
                        <div className="text-xs text-blue-600 mt-1">المحافظة: {lookupResult.governorate}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-700">{lookupResult.error}</div>
                  )}
                </div>
              )}

              {/* Business Name (auto-filled or manual) */}
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("businessName")} *</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none"
                  placeholder={ui.businessNamePlaceholder}
                />
                {lookupResult?.found && lookupResult?.companyName && (
                  <p className="text-[10px] text-green-600 mt-1">{ui.autoFilled}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (formData.businessName) setStep(2);
                }}
                disabled={!formData.businessName}
                className="w-full py-3 px-4 bg-[#0070F2] text-white rounded-lg font-medium hover:bg-[#005ed4] disabled:opacity-50 transition-all"
              >
                {ui.nextAccount}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {ui.skipNoReg}
              </button>
            </div>
          )}

          {/* Step 2: Account Info */}
          {step === 2 && (
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

              {/* OTP Verification */}
              {!otpVerified && formData.email && formData.name && formData.password && (
                <div className="border border-border rounded-xl p-4 bg-muted/30">
                  <h3 className="text-sm font-bold mb-3 text-[#021544]">{ui.verifyIdentity}</h3>

                  {/* Method toggle */}
                  <div className="flex gap-2 mb-3">
                    <button type="button" onClick={() => setOtpMethod("email")}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${otpMethod === "email" ? "bg-[#0070F2] text-white" : "bg-white border border-border"}`}>
                      📧 {ui.viaEmail}
                    </button>
                    <button type="button" onClick={() => setOtpMethod("whatsapp")}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${otpMethod === "whatsapp" ? "bg-[#25D366] text-white" : "bg-white border border-border"}`}>
                      💬 {ui.viaWhatsapp}
                    </button>
                  </div>

                  {otpMethod === "whatsapp" && !otpSent && (
                    <div className="mb-3">
                      <input type="tel" value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+966501234567"
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" dir="ltr" />
                    </div>
                  )}

                  {!otpSent ? (
                    <button type="button" onClick={() => {
                      setError("");
                      if (otpMethod === "email") sendEmailOTP.mutate({ email: formData.email });
                      else if (formData.phone) sendWhatsAppOTP.mutate({ phone: formData.phone });
                      else setError(ui.enterPhone);
                    }}
                      disabled={sendEmailOTP.isPending || sendWhatsAppOTP.isPending}
                      className="w-full py-2.5 bg-[#0070F2] text-white rounded-lg text-sm font-medium hover:bg-[#005ed4] disabled:opacity-50">
                      {sendEmailOTP.isPending || sendWhatsAppOTP.isPending ? "{ui.sending}" :
                        otpMethod === "email" ? ui.sendOtpEmail : ui.sendOtpWhatsapp}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground text-center">
                        تم إرسال رمز مكون من 6 أرقام {otpMethod === "email" ? `إلى ${formData.email}` : `إلى ${formData.phone}`}
                      </p>
                      <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000" maxLength={6}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-2xl font-mono tracking-[12px] text-center outline-none focus:ring-2 focus:ring-[#0070F2]" dir="ltr" />
                      <button type="button" onClick={() => {
                        setError("");
                        verifyOTP.mutate({
                          method: otpMethod,
                          target: otpMethod === "email" ? formData.email : formData.phone,
                          code: otpCode,
                        });
                      }}
                        disabled={otpCode.length !== 6 || verifyOTP.isPending}
                        className="w-full py-2.5 bg-[#0070F2] text-white rounded-lg text-sm font-medium disabled:opacity-50">
                        {verifyOTP.isPending ? "{ui.verifying}" : "تحقق"}
                      </button>
                      {otpCountdown > 0 ? (
                        <p className="text-xs text-muted-foreground text-center">{ui.resendAfter} {otpCountdown} {ui.seconds}</p>
                      ) : (
                        <button type="button" onClick={() => {
                          setOtpSent(false); setOtpCode("");
                        }} className="w-full text-xs text-[#0070F2] hover:underline text-center">
                          {ui.resend}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {otpVerified && (
                <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm text-center font-medium">
                  {ui.verified}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 border border-border rounded-lg font-medium hover:bg-muted transition-all">
                  {ui.back}
                </button>
                <button type="button"
                  onClick={() => { if (otpVerified) setStep(3); }}
                  disabled={!otpVerified}
                  className="flex-1 py-3 px-4 bg-[#0070F2] text-white rounded-lg font-medium hover:bg-[#005ed4] disabled:opacity-50 transition-all">
                  {ui.nextSector}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Sector Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-4">
                {ui.chooseSector}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {SECTORS.map((sector) => (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => setFormData({ ...formData, sector })}
                    className={`p-4 rounded-lg border text-start transition-all ${
                      formData.sector === sector
                        ? "border-[#0070F2] bg-[#0070F2]/5 ring-2 ring-[#0070F2]"
                        : "border-border hover:border-[#0070F2]/30"
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
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 px-4 border border-border rounded-lg font-medium hover:bg-muted transition-all"
                >
                  {ui.back}
                </button>
                <button
                  type="submit"
                  disabled={!formData.sector || register.isPending}
                  className="flex-1 py-3 px-4 bg-[#0070F2] text-white rounded-lg font-medium hover:bg-[#005ed4] disabled:opacity-50 transition-all"
                >
                  {register.isPending ? "{ui.creating}" : t("register")}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-[10px] text-muted-foreground mt-4">
          {ui.termsAgree}{" "}
          <Link href={`${localePath}/legal/terms`} className="text-[#0070F2] hover:underline">{ui.termsLink}</Link>
          {" "}{ui.and}{" "}
          <Link href={`${localePath}/legal/privacy`} className="text-[#0070F2] hover:underline">{ui.privacyLink}</Link>
        </p>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("alreadyHaveAccount")}{" "}
          <Link href={`${localePath}/login`} className="text-[#0070F2] font-medium hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
