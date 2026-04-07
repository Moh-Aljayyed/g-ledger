/**
 * Best-effort in-memory rate limiter for Raqyy webhook endpoints.
 *
 * Vercel Functions are stateless, so each warm instance keeps its own
 * counters — the effective rate limit is per-instance, not global.
 * This is acceptable for abuse mitigation: 600 req/min per (instance, key)
 * still bounds a misbehaving client.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 600;

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return { ok: true, remaining: MAX_PER_WINDOW - 1 };
  }

  if (existing.count >= MAX_PER_WINDOW) {
    const retryAfterMs = WINDOW_MS - (now - existing.windowStart);
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  existing.count += 1;
  return { ok: true, remaining: MAX_PER_WINDOW - existing.count };
}

// Periodic cleanup so the Map doesn't grow unbounded across long-lived warm instances.
let lastCleanup = Date.now();
export function maybeCleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < WINDOW_MS) return;
  lastCleanup = now;
  for (const [k, b] of buckets) {
    if (now - b.windowStart >= WINDOW_MS * 2) buckets.delete(k);
  }
}
