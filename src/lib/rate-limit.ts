/**
 * Bounded in-memory sliding-window rate limiter for authentication
 * and public notary verification endpoints.
 */

const MAX_TRACKED_KEYS = 10_000;
const buckets = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

function pruneExpiredBuckets(now: number, maxWindowMs: number) {
  if (buckets.size <= MAX_TRACKED_KEYS) return;
  for (const [key, timestamps] of buckets.entries()) {
    const active = timestamps.filter((t) => now - t < maxWindowMs);
    if (active.length === 0) {
      buckets.delete(key);
    } else {
      buckets.set(key, active);
    }
    if (buckets.size <= MAX_TRACKED_KEYS / 2) break;
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): RateLimitResult {
  pruneExpiredBuckets(now, Math.max(windowMs, 15 * 60 * 1000));

  const existing = buckets.get(key) || [];
  const active = existing.filter((timestamp) => now - timestamp < windowMs);

  if (active.length >= limit) {
    buckets.set(key, active);
    const oldest = active[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  active.push(now);
  buckets.set(key, active);
  return {
    allowed: true,
    remaining: Math.max(0, limit - active.length),
    retryAfterSeconds: 0,
  };
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

export function clearAllRateLimits(): void {
  buckets.clear();
}

export function getClientIp(
  headers?: Headers | Record<string, string | string[] | undefined> | null
): string {
  if (!headers) return "local";

  const readHeader = (name: string): string | undefined => {
    if (typeof (headers as Headers).get === "function") {
      return (headers as Headers).get(name) || undefined;
    }
    const raw = (headers as Record<string, string | string[] | undefined>)[name];
    return Array.isArray(raw) ? raw[0] : raw;
  };

  const forwarded = readHeader("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = readHeader("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "local";
}
