"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";

export default function TaxSettingsPage() {
  const t = useTranslations("tax");
  const tc = useTranslations("common");

  const { data: existing, isLoading } = trpc.invoices.getTaxConfig.useQuery();

  const [country, setCountry] = useState<"EG" | "SA">("EG");
  const [formData, setFormData] = useState({
    taxRegistrationNumber: "",
    companyNameAr: "",
    companyNameEn: "",
    branchId: "",
    activityCode: "",
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressCountry: "",
    addressPostalCode: "",
    addressBuildingNo: "",
    addressAdditionalNo: "",
    addressDistrict: "",
    vatRate: 14,
    // ETA
    etaClientId: "",
    etaClientSecret: "",
    etaSignerSerialNo: "",
    etaSignerPin: "",
    etaEnvironment: "preproduction",
    // ZATCA
    zatcaEnvironment: "sandbox",
    zatcaOtp: "",
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (existing) {
      setCountry(existing.country as "EG" | "SA");
      setFormData({
        taxRegistrationNumber: existing.taxRegistrationNumber || "",
        companyNameAr: existing.companyNameAr || "",
        companyNameEn: existing.companyNameEn || "",
        branchId: existing.branchId || "",
        activityCode: existing.activityCode || "",
        addressStreet: existing.addressStreet || "",
        addressCity: existing.addressCity || "",
        addressState: existing.addressState || "",
        addressCountry: existing.addressCountry || "",
        addressPostalCode: existing.addressPostalCode || "",
        addressBuildingNo: existing.addressBuildingNo || "",
        addressAdditionalNo: existing.addressAdditionalNo || "",
        addressDistrict: existing.addressDistrict || "",
        vatRate: Number(existing.vatRate) || 14,
        etaClientId: existing.etaClientId || "",
        etaClientSecret: existing.etaClientSecret || "",
        etaSignerSerialNo: existing.etaSignerSerialNo || "",
        etaSignerPin: existing.etaSignerPin || "",
        etaEnvironment: existing.etaEnvironment || "preproduction",
        zatcaEnvironment: existing.zatcaEnvironment || "sandbox",
        zatcaOtp: "",
      });
    }
  }, [existing]);

  const saveConfig = trpc.invoices.saveTaxConfig.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const zatcaOnboard = trpc.invoices.zatcaOnboard.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig.mutate({ ...formData, country });
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">{tc("loading")}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>

      {saved && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">{t("saved")}</div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Country Selection */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-bold text-muted-foreground mb-4">{t("country")}</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setCountry("EG");
                setFormData({ ...formData, vatRate: 14 });
              }}
              className={`p-4 rounded-lg border text-start transition-all ${
                country === "EG"
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="text-lg mb-1">🇪🇬</div>
              <div className="font-medium text-sm">{t("egypt")}</div>
              <div className="text-xs text-muted-foreground mt-1">
                الفاتورة الإلكترونية + الإيصال الإلكتروني
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setCountry("SA");
                setFormData({ ...formData, vatRate: 15 });
              }}
              className={`p-4 rounded-lg border text-start transition-all ${
                country === "SA"
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="text-lg mb-1">🇸🇦</div>
              <div className="font-medium text-sm">{t("saudi")}</div>
              <div className="text-xs text-muted-foreground mt-1">
                فاتورة — المرحلة الأولى والثانية
              </div>
            </button>
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-bold text-muted-foreground mb-4">بيانات المنشأة</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("taxRegNumber")} *</label>
              <input
                type="text"
                value={formData.taxRegistrationNumber}
                onChange={(e) => setFormData({ ...formData, taxRegistrationNumber: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("vatRate")} (%)</label>
              <input
                type="number"
                value={formData.vatRate}
                onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("companyNameAr")} *</label>
              <input
                type="text"
                value={formData.companyNameAr}
                onChange={(e) => setFormData({ ...formData, companyNameAr: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("companyNameEn")}</label>
              <input
                type="text"
                value={formData.companyNameEn}
                onChange={(e) => setFormData({ ...formData, companyNameEn: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("branchId")}</label>
              <input
                type="text"
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("activityCode")}</label>
              <input
                type="text"
                value={formData.activityCode}
                onChange={(e) => setFormData({ ...formData, activityCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-bold text-muted-foreground mb-4">{t("address")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الشارع</label>
              <input type="text" value={formData.addressStreet}
                onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المدينة</label>
              <input type="text" value={formData.addressCity}
                onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{country === "EG" ? "المحافظة" : "المنطقة"}</label>
              <input type="text" value={formData.addressState}
                onChange={(e) => setFormData({ ...formData, addressState: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رقم المبنى</label>
              <input type="text" value={formData.addressBuildingNo}
                onChange={(e) => setFormData({ ...formData, addressBuildingNo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الرمز البريدي</label>
              <input type="text" value={formData.addressPostalCode}
                onChange={(e) => setFormData({ ...formData, addressPostalCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" dir="ltr" />
            </div>
            {country === "SA" && (
              <div>
                <label className="block text-sm font-medium mb-1">الحي</label>
                <input type="text" value={formData.addressDistrict}
                  onChange={(e) => setFormData({ ...formData, addressDistrict: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" />
              </div>
            )}
          </div>
        </div>

        {/* ETA Settings */}
        {country === "EG" && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-sm font-bold text-muted-foreground mb-4">{t("etaSettings")}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("etaClientId")}</label>
                <input type="text" value={formData.etaClientId}
                  onChange={(e) => setFormData({ ...formData, etaClientId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("etaClientSecret")}</label>
                <input type="password" value={formData.etaClientSecret}
                  onChange={(e) => setFormData({ ...formData, etaClientSecret: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("etaSignerSerial")}</label>
                <input type="text" value={formData.etaSignerSerialNo}
                  onChange={(e) => setFormData({ ...formData, etaSignerSerialNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("etaEnvironment")}</label>
                <select value={formData.etaEnvironment}
                  onChange={(e) => setFormData({ ...formData, etaEnvironment: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none">
                  <option value="preproduction">{t("preproduction")}</option>
                  <option value="production">{t("production")}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ZATCA Settings */}
        {country === "SA" && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-sm font-bold text-muted-foreground mb-4">{t("zatcaSettings")}</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("zatcaEnvironment")}</label>
                <select value={formData.zatcaEnvironment}
                  onChange={(e) => setFormData({ ...formData, zatcaEnvironment: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none">
                  <option value="sandbox">{t("sandbox")}</option>
                  <option value="simulation">{t("simulation")}</option>
                  <option value="production">{t("production")}</option>
                </select>
              </div>
            </div>

            {/* Onboarding */}
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-medium mb-3">{t("zatcaOnboard")}</h3>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">{t("zatcaOtp")}</label>
                  <input type="text" value={formData.zatcaOtp}
                    onChange={(e) => setFormData({ ...formData, zatcaOtp: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" dir="ltr"
                    placeholder="123456" />
                </div>
                <button
                  type="button"
                  onClick={() => zatcaOnboard.mutate({ otp: formData.zatcaOtp })}
                  disabled={!formData.zatcaOtp || zatcaOnboard.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {zatcaOnboard.isPending ? "..." : "تسجيل"}
                </button>
              </div>
              {zatcaOnboard.data && (
                <div className="mt-2 p-2 rounded bg-green-50 text-green-700 text-xs">
                  تم التسجيل بنجاح — Request ID: {zatcaOnboard.data.requestId}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          disabled={saveConfig.isPending}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saveConfig.isPending ? "جاري الحفظ..." : tc("save")}
        </button>
      </form>
    </div>
  );
}
