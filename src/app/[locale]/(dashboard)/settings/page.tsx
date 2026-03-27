"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const ts = useTranslations("sectors");
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>

      <div className="max-w-2xl space-y-6">
        {/* Business Info */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">معلومات المنشأة</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">اسم المنشأة</span>
              <span className="text-sm font-medium">{user?.tenantName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">القطاع</span>
              <span className="text-sm font-medium">{user?.sector ? ts(user.sector) : "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">{t("currency")}</span>
              <span className="text-sm font-medium">{user?.currency ?? "SAR"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-muted-foreground">{t("language")}</span>
              <span className="text-sm font-medium">{user?.locale === "ar" ? "العربية" : "English"}</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">معلومات المستخدم</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">الاسم</span>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">البريد الإلكتروني</span>
              <span className="text-sm font-medium" dir="ltr">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-muted-foreground">الصلاحية</span>
              <span className="text-sm font-medium">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
