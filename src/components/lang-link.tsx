"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function LangLink({ variant = "header" }: { variant?: "header" | "sidebar" | "footer" | "auth" }) {
  const pathname = usePathname();
  const isArabic = pathname.startsWith("/ar");
  const newPath = isArabic
    ? pathname.replace(/^\/ar/, "/en") || "/en"
    : pathname.replace(/^\/en/, "/ar") || "/ar";
  const label = isArabic ? "English" : "\u0627\u0644\u0639\u0631\u0628\u064A\u0629";

  if (variant === "sidebar") {
    return (
      <Link
        href={newPath}
        className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-white/50 hover:text-white/70 transition-all"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>
        {label}
      </Link>
    );
  }

  if (variant === "auth") {
    return (
      <Link
        href={newPath}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>
        {label}
      </Link>
    );
  }

  if (variant === "footer") {
    return (
      <Link
        href={newPath}
        className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>
        {label}
      </Link>
    );
  }

  // Header variant (default)
  return (
    <Link
      href={newPath}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-border/50 hover:bg-muted transition-all"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>
      {label}
    </Link>
  );
}
