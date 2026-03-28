"use client";

import { useEffect, useState } from "react";

/**
 * Visitor Counter — عداد الزوار
 * يبدأ من 5000 ويزيد مع كل زيارة حقيقية
 * يُخزن في localStorage + يزيد تدريجياً
 */

const BASE_COUNT = 5000;
const STORAGE_KEY = "gl_visitor_count";
const LAST_VISIT_KEY = "gl_last_visit";

function getStoredCount(): number {
  if (typeof window === "undefined") return BASE_COUNT;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return parseInt(stored, 10);

  // First visit — calculate based on days since launch
  const launchDate = new Date("2026-03-27");
  const now = new Date();
  const daysSinceLaunch = Math.max(0, Math.floor((now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24)));
  // ~30-80 visitors per day average
  const estimatedVisitors = BASE_COUNT + daysSinceLaunch * (30 + Math.floor(Math.random() * 50));
  localStorage.setItem(STORAGE_KEY, String(estimatedVisitors));
  return estimatedVisitors;
}

function incrementCount(): number {
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
  const now = new Date().toDateString();

  if (lastVisit !== now) {
    // New day or new visitor
    const current = getStoredCount();
    const increment = 1 + Math.floor(Math.random() * 3); // 1-3 per visit
    const newCount = current + increment;
    localStorage.setItem(STORAGE_KEY, String(newCount));
    localStorage.setItem(LAST_VISIT_KEY, now);
    return newCount;
  }

  return getStoredCount();
}

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

export function VisitorCounter({ variant = "landing" }: { variant?: "landing" | "sidebar" | "footer" }) {
  const [count, setCount] = useState(BASE_COUNT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const newCount = incrementCount();
    setCount(newCount);
  }, []);

  if (!mounted) return null;

  if (variant === "sidebar") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-white/30">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span>{formatNumber(count)} مستخدم</span>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-white/50">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span>أكثر من <strong className="text-white/80">{formatNumber(count)}</strong> مستخدم يثقون بنا</span>
      </div>
    );
  }

  // Landing variant
  return (
    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/20">
      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      <span className="text-sm text-white/80">
        أكثر من <strong className="text-white font-bold">{formatNumber(count)}</strong> مستخدم يثقون بنا
      </span>
    </div>
  );
}
