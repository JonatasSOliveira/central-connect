interface RateLimitOptions {
  windowMs: number;
  max: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function pruneExpiredEntries(now: number): void {
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function consumeRateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  pruneExpiredEntries(now);

  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + options.windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      remaining: Math.max(options.max - 1, 0),
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);

  const remaining = Math.max(options.max - existing.count, 0);
  const retryAfterSeconds = Math.max(
    Math.ceil((existing.resetAt - now) / 1000),
    1,
  );

  return {
    allowed: existing.count <= options.max,
    remaining,
    retryAfterSeconds,
  };
}
