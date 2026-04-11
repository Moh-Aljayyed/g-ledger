// G-Ledger POS Service Worker
// Minimal offline-first shell cache so the POS app opens even without a
// network connection. API requests are still live (online only) — but the
// UI itself renders, which matters when Wi-Fi drops mid-shift.

const CACHE = "gl-pos-v1";
const SHELL = [
  "/",
  "/manifest.json",
  "/logo.svg",
  "/logo-with-text.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never intercept API / auth / tRPC requests — they MUST stay live
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/") ||
    url.pathname.startsWith("/trpc")
  ) {
    return;
  }

  // Stale-while-revalidate for static assets and Next.js chunks
  if (url.pathname.startsWith("/_next/static/") || SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const networkFetch = fetch(event.request)
          .then((res) => {
            if (res && res.status === 200) cache.put(event.request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});
