"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const pathname = usePathname();
  const isAr = pathname?.startsWith("/ar");

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem("gl_pwa_dismissed")) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Also show for iOS (no beforeinstallprompt)
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isIOS && !isStandalone) {
      setTimeout(() => setShow(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") setShow(false);
    }
    setShow(false);
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("gl_pwa_dismissed", "1");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-border p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#021544] to-[#0070F2] flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="6" width="24" height="20" rx="2" fill="white" opacity="0.15"/>
              <line x1="8" y1="11" x2="14" y2="11" stroke="white" strokeWidth="1.2" opacity="0.6"/>
              <line x1="8" y1="14" x2="14" y2="14" stroke="white" strokeWidth="1.2" opacity="0.5"/>
              <path d="M19 11l1.5 1.5L23 10" stroke="#00C9A7" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M19 14.5l1.5 1.5L23 13.5" stroke="#00C9A7" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#021544]">
              {isAr ? "ثبّت G-Ledger على جهازك" : "Install G-Ledger"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isAr ? "وصول أسرع بدون متصفح — زي التطبيق بالضبط" : "Quick access without browser — just like an app"}
            </p>
            <div className="flex gap-2 mt-3">
              <button onClick={install} className="px-4 py-1.5 bg-[#0070F2] text-white rounded-lg text-xs font-bold hover:bg-[#005ed4] transition-all">
                {isAr ? "تثبيت" : "Install"}
              </button>
              <button onClick={dismiss} className="px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {isAr ? "لاحقاً" : "Later"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
