"use client";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gl_theme");
    if (saved === "dark") { setDark(true); document.documentElement.classList.add("dark"); }
  }, []);

  const toggle = () => {
    setDark(!dark);
    if (!dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("gl_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("gl_theme", "light");
    }
  };

  return (
    <button onClick={toggle} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all" title={dark ? "الوضع الفاتح" : "الوضع الداكن"}>
      {dark ? <span className="text-sm">☀️</span> : <span className="text-sm">🌙</span>}
    </button>
  );
}
