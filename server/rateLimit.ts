/**
 * Minimal in-memory fixed-window rate limiter. Suitable for the single-server
 * Manus deployment; swap for a Redis-backed limiter if the app is ever scaled
 * to multiple instances.
 */
interface WindowEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, WindowEntry>();

const MAX_BUCKETS = 10_000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  // Opportunistic cleanup so the map can't grow without bound.
  if (buckets.size > MAX_BUCKETS) {
    buckets.forEach((v, k) => {
      if (v.resetAt <= now) buckets.delete(k);
    });
  }

  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count++;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetRateLimits() {
  buckets.clear();
}
