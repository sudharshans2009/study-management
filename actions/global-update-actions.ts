"use server";

import { db } from "@/database/drizzle";
import { globalUpdate } from "@/database/schema";
import {
  getUsersNeedingUpdates,
  processUserUpdates,
} from "@/services/global-update";
import { redis, CACHE_KEYS } from "@/services/redis";
import { globalUpdateRateLimit } from "@/services/rate-limit";
import { realtime } from "@/services/realtime";
import { desc } from "drizzle-orm";

/**
 * Acquire lock for global updates (prevents concurrent runs)
 */
async function acquireGlobalUpdateLock(): Promise<boolean> {
  try {
    const lockKey = CACHE_KEYS.GLOBAL_UPDATE_LOCK;

    // Try to set lock with 5 minute expiry
    const acquired = await redis.set(lockKey, Date.now().toString(), {
      ex: 300, // 5 minutes
      nx: true, // Only set if not exists
    });

    return acquired === "OK";
  } catch (error) {
    console.error("[GlobalUpdate] Failed to acquire lock:", error);
    return false;
  }
}

/**
 * Release lock
 */
async function releaseGlobalUpdateLock(): Promise<void> {
  try {
    await redis.del(CACHE_KEYS.GLOBAL_UPDATE_LOCK);
  } catch (error) {
    console.error("[GlobalUpdate] Failed to release lock:", error);
  }
}

/**
 * Process global lazy updates for all users
 * This is called when any user accesses the site or via QStash cron
 */
export async function processGlobalLazyUpdates(
  triggeredByUserId?: string
): Promise<{
  success: boolean;
  processedUsers: number;
  error?: string;
}> {
  // Check rate limit
  const { success: rateLimitPassed } = await globalUpdateRateLimit.limit("global");
  if (!rateLimitPassed) {
    console.log("[GlobalUpdate] Rate limited, skipping");
    return {
      success: true,
      processedUsers: 0,
    };
  }

  // Acquire lock
  const lockAcquired = await acquireGlobalUpdateLock();
  if (!lockAcquired) {
    console.log("[GlobalUpdate] Another update is in progress, skipping");
    return {
      success: true,
      processedUsers: 0,
    };
  }

  try {
    const now = new Date();

    // TODO: Fix Realtime type inference
    // Emit realtime event - update started
    // try {
    //   await realtime.emit("globalUpdateStarted", {
    //     triggeredBy: triggeredByUserId || "system",
    //     timestamp: now.getTime(),
    //   });
    // } catch (error) {
    //   console.error("[GlobalUpdate] Failed to emit start event:", error);
    // }

    // Get all users that need updates
    const usersNeedingUpdate = await getUsersNeedingUpdates();

    if (usersNeedingUpdate.length === 0) {
      return {
        success: true,
        processedUsers: 0,
      };
    }

    console.log(`[GlobalUpdate] Processing ${usersNeedingUpdate.length} users`);

    // Process each user
    let processedCount = 0;
    for (const user of usersNeedingUpdate) {
      try {
        const fromDate =
          user.lastLocalMidnight ||
          user.lastActivityAt ||
          new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const toDate = now;

        await processUserUpdates(
          user.id,
          user.timezone || "UTC",
          fromDate,
          toDate
        );

        processedCount++;
      } catch (error) {
        console.error(
          `[GlobalUpdate] Failed to process user ${user.id}:`,
          error
        );
        // Continue processing other users
      }
    }

    // Log the global update
    await db.insert(globalUpdate).values({
      lastUpdateAt: now,
      updateType: triggeredByUserId || "lazy",
      processedUsers: processedCount,
      triggeredBy: triggeredByUserId || "system",
    });

    // TODO: Fix Realtime type inference
    // Emit realtime event - update completed
    // try {
    //   await realtime.emit("globalUpdateCompleted", {
    //     processedUsers: processedCount,
    //     timestamp: Date.now(),
    //   });
    // } catch (error) {
    //   console.error("[GlobalUpdate] Failed to emit completion event:", error);
    // }

    console.log(`[GlobalUpdate] Completed: ${processedCount} users processed`);

    return {
      success: true,
      processedUsers: processedCount,
    };
  } catch (error) {
    console.error("[GlobalUpdate] Failed:", error);
    return {
      success: false,
      processedUsers: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    // Always release lock
    await releaseGlobalUpdateLock();
  }
}

/**
 * Check if global updates need to be run
 * Returns true if it's been more than 5 minutes since last update
 */
export async function shouldRunGlobalUpdates(): Promise<boolean> {
  try {
    const lastUpdate = await db
      .select()
      .from(globalUpdate)
      .orderBy(desc(globalUpdate.createdAt))
      .limit(1);
    
    if (lastUpdate.length === 0) {
      return true;
    }
    
    const lastUpdateTime = lastUpdate[0].createdAt;
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    return lastUpdateTime < fiveMinutesAgo;
  } catch (error) {
    console.error("Failed to check if global updates needed:", error);
    return false;
  }
}

/**
 * Get the last global update timestamp
 */
export async function getLastGlobalUpdateInfo(): Promise<{
  lastUpdateAt: Date | null;
  processedUsers: number;
  updateType: string;
} | null> {
  try {
    const lastUpdate = await db
      .select()
      .from(globalUpdate)
      .orderBy(desc(globalUpdate.createdAt))
      .limit(1);
    
    if (lastUpdate.length === 0) {
      return null;
    }
    
    return {
      lastUpdateAt: lastUpdate[0].lastUpdateAt,
      processedUsers: lastUpdate[0].processedUsers || 0,
      updateType: lastUpdate[0].updateType,
    };
  } catch (error) {
    console.error("Failed to get last global update info:", error);
    return null;
  }
}
