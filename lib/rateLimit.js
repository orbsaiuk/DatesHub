// Simple in-memory rate limiter suitable for MVP and development.
// For production, use a shared store (Upstash Redis, etc.).

const buckets = new Map();

export function rateLimit({ key, limit = 20, windowMs = 60_000 }) {
  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, reset: now + windowMs };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + windowMs;
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  const allowed = bucket.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - bucket.count),
    reset: bucket.reset,
  };
}
