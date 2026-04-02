"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function BrandingPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: branding, refetch } = trpc.company.getBranding.useQuery();
  const updateBranding = trpc.company.updateBranding.useMutation({ onSuccess: () => { refetch(); setMsg(isAr ? "✓ تم الحفظ" : "✓ Saved"); } });

  const [logoUrl, setLogoUrl] = useState("");
  const [color, setColor] = useState("#021544");
  const [footer, setFooter] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (branding) {
      setLogoUrl(branding.logoUrl || "");
      setColor(branding.documentColor || "#021544");
      setFooter(branding.documentFooter || "");
      setPhone(branding.phone || "");
      setWebsite(branding.website || "");
      setAddress1(branding.addressLine1 || "");
      setAddress2(branding.addressLine2 || "");
    }
  }, [branding]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) setLogoUrl(data.url);
    } catch {} finally { setUploading(false); }
  };

  const save = () => {
    setMsg("");
    updateBranding.mutate({ logoUrl: logoUrl || undefined, documentColor: color, documentFooter: footer || undefined, phone: phone || undefined, website: website || undefined, addressLine1: address1 || undefined, addressLine2: address2 || undefined });
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#021544] mb-6">{isAr ? "تخصيص العلامة التجارية" : "Brand Customization"}</h1>

      {msg && <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-bold text-[#021544] mb-4">{isAr ? "لوجو الشركة" : "Company Logo"}</h2>
          <div className="flex flex-col items-center gap-4">
            {logoUrl ? (
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-border overflow-hidden bg-white flex items-center justify-center">
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 text-muted-foreground text-sm text-center p-2">
                {isAr ? "لا يوجد لوجو" : "No logo"}
              </div>
            )}
            <button onClick={() => inputRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-[#0070F2] text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {uploading ? "..." : (isAr ? "رفع لوجو" : "Upload Logo")}
            </button>
            {logoUrl && <button onClick={() => setLogoUrl("")} className="text-xs text-red-500 hover:underline">{isAr ? "حذف اللوجو" : "Remove Logo"}</button>}
            <input ref={inputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <p className="text-[10px] text-muted-foreground">{isAr ? "PNG أو JPG — حد أقصى 5MB" : "PNG or JPG — max 5MB"}</p>
          </div>
        </div>

        {/* Brand Color */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-bold text-[#021544] mb-4">{isAr ? "لون العلامة التجارية" : "Brand Color"}</h2>
          <div className="flex items-center gap-4 mb-4">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 h-16 rounded-lg border-2 border-border cursor-pointer" />
            <div>
              <p className="text-sm font-mono">{color}</p>
              <p className="text-xs text-muted-foreground">{isAr ? "يُستخدم في رأس الفواتير والمستندات" : "Used in invoice and document headers"}</p>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg overflow-hidden border border-border">
            <div className="p-3 text-white text-sm font-bold" style={{ background: color }}>
              {branding?.name || "G-Ledger"} {logoUrl && <img src={logoUrl} alt="" className="inline w-6 h-6 mr-2 rounded" />}
            </div>
            <div className="p-3 text-xs text-muted-foreground bg-white">
              {isAr ? "معاينة رأس المستند" : "Document header preview"}
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-card rounded-xl border border-border p-6 lg:col-span-2">
          <h2 className="font-bold text-[#021544] mb-4">{isAr ? "بيانات الشركة (تظهر في المستندات)" : "Company Details (shown on documents)"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "الهاتف" : "Phone"}</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "الموقع الإلكتروني" : "Website"}</label>
              <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "العنوان (سطر 1)" : "Address Line 1"}</label>
              <input type="text" value={address1} onChange={(e) => setAddress1(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "العنوان (سطر 2)" : "Address Line 2"}</label>
              <input type="text" value={address2} onChange={(e) => setAddress2(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" />
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="bg-card rounded-xl border border-border p-6 lg:col-span-2">
          <h2 className="font-bold text-[#021544] mb-4">{isAr ? "ذيل المستند" : "Document Footer"}</h2>
          <textarea value={footer} onChange={(e) => setFooter(e.target.value)} rows={2} placeholder={isAr ? "نص يظهر أسفل الفواتير والمستندات..." : "Text shown at the bottom of invoices..."} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none resize-none" />
        </div>
      </div>

      <button onClick={save} disabled={updateBranding.isPending} className="mt-6 px-8 py-3 bg-[#0070F2] text-white rounded-lg font-medium hover:bg-[#005ed4] disabled:opacity-50 transition-all">
        {updateBranding.isPending ? "..." : (isAr ? "حفظ التغييرات" : "Save Changes")}
      </button>
    </div>
  );
}
