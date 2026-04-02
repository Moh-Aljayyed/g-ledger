"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import Link from "next/link";

const SECTORS = [
  "INDUSTRIAL", "COMMERCIAL", "SERVICES", "BANKING", "INSURANCE",
  "REAL_ESTATE", "CONTRACTING", "AGRICULTURAL", "TECHNOLOGY",
  "NON_PROFIT", "CROWDFUNDING", "MEDICAL_HOSPITAL", "MEDICAL_PHARMACY",
  "MEDICAL_CLINIC", "MEDICAL_LAB",
] as const;

export default function SettingsPage() {
  const t = useTranslations("settings");
  const ts = useTranslations("sectors");
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const user = session?.user as any;

  // Change password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  const changePw = trpc.auth.changePassword.useMutation({
    onSuccess: () => { setPwMsg(isAr ? "✓ تم تغيير كلمة المرور" : "✓ Password changed"); setCurrentPw(""); setNewPw(""); setConfirmPw(""); },
    onError: (err) => setPwMsg(err.message),
  });

  // API Keys
  const { data: apiKeys, refetch: refetchKeys } = trpc.apiKeys.list.useQuery();
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState("");

  const createKey = trpc.apiKeys.create.useMutation({
    onSuccess: (data) => { setCreatedKey(data.key); setNewKeyName(""); refetchKeys(); },
  });
  const revokeKey = trpc.apiKeys.revoke.useMutation({ onSuccess: () => refetchKeys() });

  // Change sector
  const [newSector, setNewSector] = useState("");
  const [sectorMsg, setSectorMsg] = useState("");
  const changeSector = trpc.auth.changeSector.useMutation({
    onSuccess: (data) => setSectorMsg(data.message),
    onError: (err) => setSectorMsg(err.message),
  });

  // Subscription
  const { data: usage } = trpc.subscription.getUsage.useQuery();

  const ui = {
    title: isAr ? "الإعدادات" : "Settings",
    companyInfo: isAr ? "معلومات المنشأة" : "Company Info",
    companyName: isAr ? "اسم المنشأة" : "Company Name",
    subdomain: isAr ? "النطاق الفرعي" : "Subdomain",
    sector: isAr ? "القطاع" : "Sector",
    currency: isAr ? "العملة" : "Currency",
    country: isAr ? "الدولة" : "Country",
    userInfo: isAr ? "معلومات المستخدم" : "User Info",
    name: isAr ? "الاسم" : "Name",
    email: isAr ? "البريد الإلكتروني" : "Email",
    role: isAr ? "الصلاحية" : "Role",
    changePw: isAr ? "تغيير كلمة المرور" : "Change Password",
    currentPw: isAr ? "كلمة المرور الحالية" : "Current Password",
    newPw: isAr ? "كلمة المرور الجديدة" : "New Password",
    confirmPw: isAr ? "تأكيد كلمة المرور" : "Confirm Password",
    save: isAr ? "حفظ" : "Save",
    saving: isAr ? "جاري الحفظ..." : "Saving...",
    mismatch: isAr ? "كلمتا المرور غير متطابقتين" : "Passwords don't match",
    apiKeys: isAr ? "مفاتيح API" : "API Keys",
    keyName: isAr ? "اسم المفتاح" : "Key Name",
    create: isAr ? "إنشاء" : "Create",
    revoke: isAr ? "إلغاء" : "Revoke",
    createdKeyNote: isAr ? "⚠️ انسخ المفتاح الآن — لن يظهر مرة أخرى" : "⚠️ Copy the key now — it won't be shown again",
    changeSector: isAr ? "تغيير القطاع" : "Change Sector",
    changeSectorWarn: isAr ? "تحذير: تغيير القطاع سيحذف شجرة الحسابات الحالية وينشئ واحدة جديدة. يُسمح فقط إذا لم تُدخل أي قيود أو فواتير." : "Warning: Changing sector will delete current chart of accounts and create a new one. Only allowed if no entries or invoices exist.",
    subscription: isAr ? "الاشتراك" : "Subscription",
    referral: isAr ? "برنامج الإحالة" : "Referral Program",
    viewReferral: isAr ? "عرض كود الإحالة" : "View Referral Code",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#021544] mb-6">{ui.title}</h1>

      <div className="max-w-2xl space-y-6">
        {/* Company Info */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-[#021544] mb-4">{ui.companyInfo}</h2>
          <div className="space-y-3">
            {[
              [ui.companyName, user?.tenantName],
              [ui.subdomain, user?.slug ? `${user.slug}.g-ledger.com` : "—"],
              [ui.sector, user?.sector ? ts(user.sector) : "—"],
              [ui.currency, user?.currency ?? "SAR"],
            ].map(([label, value], i) => (
              <div key={i} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-[#021544] mb-4">{ui.userInfo}</h2>
          <div className="space-y-3">
            {[
              [ui.name, user?.name],
              [ui.email, user?.email],
              [ui.role, user?.role],
            ].map(([label, value], i) => (
              <div key={i} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-[#021544] mb-4">{ui.changePw}</h2>
          <div className="space-y-3">
            <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder={ui.currentPw} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring text-sm" dir="ltr" />
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder={ui.newPw} minLength={8} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring text-sm" dir="ltr" />
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder={ui.confirmPw} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring text-sm" dir="ltr" />
            {pwMsg && <p className={`text-sm ${pwMsg.includes("✓") ? "text-green-600" : "text-red-500"}`}>{pwMsg}</p>}
            <button onClick={() => {
              setPwMsg("");
              if (newPw !== confirmPw) { setPwMsg(ui.mismatch); return; }
              changePw.mutate({ currentPassword: currentPw, newPassword: newPw });
            }} disabled={!currentPw || !newPw || changePw.isPending} className="px-6 py-2.5 bg-[#0070F2] text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {changePw.isPending ? ui.saving : ui.save}
            </button>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-[#021544] mb-4">{ui.apiKeys}</h2>
          {createdKey && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-700 font-bold mb-1">{ui.createdKeyNote}</p>
              <code className="text-xs bg-white p-2 rounded block font-mono break-all select-text">{createdKey}</code>
            </div>
          )}
          <div className="flex gap-2 mb-4">
            <input type="text" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder={ui.keyName} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" />
            <button onClick={() => { if (newKeyName) createKey.mutate({ name: newKeyName }); }} disabled={!newKeyName} className="px-4 py-2 bg-[#0070F2] text-white rounded-lg text-sm font-medium disabled:opacity-50">{ui.create}</button>
          </div>
          {apiKeys && apiKeys.length > 0 && (
            <div className="space-y-2">
              {apiKeys.map((key: any) => (
                <div key={key.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="text-sm font-medium">{key.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{key.key.substring(0, 12)}...</p>
                  </div>
                  <button onClick={() => revokeKey.mutate({ id: key.id })} className={`text-xs px-3 py-1 rounded ${key.isActive ? "text-red-600 hover:bg-red-50" : "text-gray-400"}`} disabled={!key.isActive}>
                    {key.isActive ? ui.revoke : "✗"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change Sector */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-[#021544] mb-2">{ui.changeSector}</h2>
          <p className="text-xs text-amber-600 mb-4">{ui.changeSectorWarn}</p>
          <div className="flex gap-2">
            <select value={newSector} onChange={(e) => setNewSector(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm">
              <option value="">{isAr ? "اختر القطاع الجديد" : "Select new sector"}</option>
              {SECTORS.map((s) => <option key={s} value={s}>{ts(s)}</option>)}
            </select>
            <button onClick={() => { setSectorMsg(""); if (newSector) changeSector.mutate({ sector: newSector as any }); }} disabled={!newSector || changeSector.isPending} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">{ui.save}</button>
          </div>
          {sectorMsg && <p className={`text-sm mt-2 ${sectorMsg.includes("✓") || sectorMsg.includes("نجاح") || sectorMsg.includes("success") ? "text-green-600" : "text-red-500"}`}>{sectorMsg}</p>}
        </div>

        {/* Subscription */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-[#021544] mb-4">{ui.subscription}</h2>
          {usage && (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">{isAr ? "الباقة" : "Plan"}</span>
                <span className="text-sm font-medium">{usage.planNameAr}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">{isAr ? "التخزين" : "Storage"}</span>
                <span className="text-sm font-medium">{usage.storageUsedKB} KB / {usage.storageLimitKB} KB ({usage.storagePercent}%)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">{isAr ? "المتبقي" : "Remaining"}</span>
                <span className="text-sm font-medium">{usage.daysRemaining} {isAr ? "يوم" : "days"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">{isAr ? "التكلفة الشهرية" : "Monthly Cost"}</span>
                <span className="text-sm font-bold text-[#0070F2]">${(usage as any).totalMonthlyCost ?? usage.monthlyPriceUsd}</span>
              </div>
            </div>
          )}
        </div>

        {/* Referral */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-[#021544] mb-4">{ui.referral}</h2>
          <Link href={`${isAr ? "/ar" : "/en"}/referral`} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0070F2] to-[#00C9A7] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
            🎁 {ui.viewReferral}
          </Link>
        </div>
      </div>
    </div>
  );
}
