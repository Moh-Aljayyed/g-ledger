/**
 * G-Ledger Logo Component
 * لوجو جي-ليدجر
 *
 * The logo represents an open ledger book with a digital arrow,
 * symbolizing the transition from traditional to smart accounting.
 */

export function LogoIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Book/Ledger shape */}
      <rect x="4" y="6" width="24" height="20" rx="2" fill="white" opacity="0.15"/>
      <rect x="5" y="7" width="22" height="18" rx="1.5" stroke="white" strokeWidth="1.5" opacity="0.4"/>
      {/* Center spine of book */}
      <line x1="16" y1="7" x2="16" y2="25" stroke="white" strokeWidth="1" opacity="0.3"/>
      {/* Ledger lines - left page */}
      <line x1="8" y1="11" x2="14" y2="11" stroke="white" strokeWidth="1.2" opacity="0.6"/>
      <line x1="8" y1="14" x2="14" y2="14" stroke="white" strokeWidth="1.2" opacity="0.5"/>
      <line x1="8" y1="17" x2="14" y2="17" stroke="white" strokeWidth="1.2" opacity="0.4"/>
      <line x1="8" y1="20" x2="12" y2="20" stroke="white" strokeWidth="1.2" opacity="0.3"/>
      {/* Right page - checkmarks (verified/smart) */}
      <path d="M19 11l1.5 1.5L23 10" stroke="#00C9A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 14.5l1.5 1.5L23 13.5" stroke="#00C9A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 18l1.5 1.5L23 17" stroke="#00C9A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      {/* Digital pulse/arrow at bottom */}
      <path d="M10 23h4l2-3 2 4 2-2h4" stroke="#00C9A7" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
    </svg>
  );
}

export function LogoFull({ size = "md", variant = "dark" }: { size?: "sm" | "md" | "lg"; variant?: "dark" | "light" | "gradient" }) {
  const sizes = {
    sm: { icon: 28, text: "text-sm", sub: "text-[8px]" },
    md: { icon: 36, text: "text-lg", sub: "text-[10px]" },
    lg: { icon: 48, text: "text-2xl", sub: "text-xs" },
  };

  const s = sizes[size];

  const textColor = variant === "light" ? "text-white" : "text-[#021544]";
  const subColor = variant === "light" ? "text-white/60" : "text-muted-foreground";

  return (
    <div className="flex items-center gap-3">
      <div className={`rounded-xl flex items-center justify-center shadow-lg ${
        variant === "gradient"
          ? "bg-gradient-to-br from-[#021544] to-[#0070F2] shadow-blue-500/20"
          : variant === "light"
            ? "bg-white/10 shadow-none"
            : "bg-gradient-to-br from-[#021544] to-[#0052CC] shadow-primary/20"
      }`} style={{ width: s.icon, height: s.icon }}>
        <LogoIcon size={s.icon * 0.65} />
      </div>
      <div>
        <h1 className={`font-bold ${s.text} ${textColor} leading-tight`}>G-Ledger</h1>
        <span className={`${s.sub} ${subColor} leading-none`}>حساب الأستاذ — لكل القطاعات</span>
      </div>
    </div>
  );
}

export const SLOGAN = {
  ar: "حساب الأستاذ — لكل القطاعات",
  en: "Smart Accounting for Every Sector",
};
