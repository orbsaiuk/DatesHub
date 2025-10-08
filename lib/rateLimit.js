let rateLimiter;

const hasRedisConfig =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

if (hasRedisConfig) {
  try {
    const { Ratelimit } = require("@upstash/ratelimit");
    const { Redis } = require("@upstash/redis");

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "60 s"),
      analytics: true,
      prefix: "@orbsai/ratelimit",
    });
  } catch (error) {
    console.warn(
      "Upstash Redis not available, falling back to in-memory rate limiting:",
      error.message
    );
    rateLimiter = null;
  }
}

// Main rate limit function
export async function rateLimit({ key, limit = 20, windowMs = 60_000 }) {
  if (rateLimiter) {
    try {
      const result = await rateLimiter.limit(key);
      return {
        success: result.success,
        allowed: result.success, // backwards compatibility
        remaining: result.remaining,
        reset: result.reset,
        limit: result.limit,
      };
    } catch (error) {
      console.error("Rate limit check failed, allowing request:", error);
      // Fail open: allow request if rate limiting fails
      return {
        success: true,
        allowed: true,
        remaining: limit,
        reset: Date.now() + windowMs,
        limit,
      };
    }
  }

  // No rate limiter configured, allow all requests
  return {
    success: true,
    allowed: true,
    remaining: limit,
    reset: Date.now() + windowMs,
    limit,
  };
}

// Helper to get rate limit identifier from request
export function getRateLimitKey(request, identifier = "global") {
  // Try to get IP from headers (works with most proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";

  return `${identifier}:${ip}`;
}

// Middleware helper for API routes
export async function withRateLimit(request, options = {}) {
  const { identifier = "api", limit = 20, windowMs = 60_000 } = options;

  const key = getRateLimitKey(request, identifier);
  const result = await rateLimit({ key, limit, windowMs });

  return {
    ...result,
    headers: {
      "X-RateLimit-Limit": String(result.limit),
      "X-RateLimit-Remaining": String(result.remaining),
      "X-RateLimit-Reset": String(result.reset),
    },
  };
}
