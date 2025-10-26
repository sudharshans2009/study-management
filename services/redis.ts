import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("Upstash Redis credentials are not set");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache key prefixes
export const CACHE_KEYS = {
  USER_STATS: (userId: string) => `stats:user:${userId}`,
  USER_GOALS: (userId: string) => `goals:user:${userId}`,
  USER_SESSIONS: (userId: string) => `sessions:user:${userId}`,
  LEADERBOARD: (metric: string, period: string) => `leaderboard:${metric}:${period}`,
  GLOBAL_UPDATE_LOCK: "lock:global-update",
  USER_ACTIVITY: (userId: string) => `activity:user:${userId}`,
} as const;

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  USER_STATS: 300, // 5 minutes
  USER_GOALS: 300, // 5 minutes
  USER_SESSIONS: 600, // 10 minutes
  LEADERBOARD: 3600, // 1 hour
  GLOBAL_UPDATE_LOCK: 300, // 5 minutes
  USER_ACTIVITY: 3600, // 1 hour
} as const;

/**
 * Generic cache wrapper
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();

    // Store in cache
    await redis.setex(key, ttl, data);

    return data;
  } catch (error) {
    console.error("[Redis] Cache error:", error);
    // If Redis fails, just fetch the data
    return fetcher();
  }
}

/**
 * Invalidate cache by key
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("[Redis] Invalidate cache error:", error);
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("[Redis] Invalidate cache pattern error:", error);
  }
}

/**
 * Batch invalidate multiple keys
 */
export async function invalidateCacheKeys(keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("[Redis] Batch invalidate error:", error);
  }
}

/**
 * Batch invalidate multiple patterns
 */
export async function invalidateCachePatterns(patterns: string[]): Promise<void> {
  try {
    await Promise.all(patterns.map((pattern) => invalidateCachePattern(pattern)));
  } catch (error) {
    console.error("[Redis] Batch invalidate patterns error:", error);
  }
}
