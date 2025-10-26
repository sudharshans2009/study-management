import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

/**
 * Rate limiter for API endpoints
 * 10 requests per 10 seconds per IP
 */
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "ratelimit:api",
});

/**
 * Rate limiter for auth endpoints
 * 5 requests per minute per IP
 */
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

/**
 * Rate limiter for global updates
 * 1 request per 5 minutes globally
 */
export const globalUpdateRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "5 m"),
  analytics: true,
  prefix: "ratelimit:global-update",
});

/**
 * Rate limiter for session creation
 * 30 sessions per hour per user
 */
export const sessionCreationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 h"),
  analytics: true,
  prefix: "ratelimit:session-create",
});

/**
 * Apply rate limit to a request
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit = apiRateLimit
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    return {
      success,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    console.error("[RateLimit] Error:", error);
    // Fail open - allow request if rate limit check fails
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }
}
