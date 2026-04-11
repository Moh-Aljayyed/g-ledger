"use client";

import { useEffect } from "react";

/**
 * Registers the offline-first service worker once the page loads.
 * Only runs in production (next dev hot-reloads conflict with SW caching).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const timer = setTimeout(() => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => console.warn("[sw] register failed:", err));
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
