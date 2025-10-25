"use server";

import { db } from "@/database/drizzle";
import { globalUpdate } from "@/database/schema";
import {
  getUsersNeedingUpdates,
  processUserUpdates,
  getUserLocalMidnight,
} from "@/lib/global-update-service";
import { headers } from "next/headers";
import { desc } from "drizzle-orm";

/**
 * Process global lazy updates for all users
 * This is called when any user accesses the site
 */
export async function processGlobalLazyUpdates(
  triggeredByUserId?: string
): Promise<{
  success: boolean;
  processedUsers: number;
  error?: string;
}> {
  try {
    const now = new Date();
    
    // Get all users that need updates
    const usersNeedingUpdate = await getUsersNeedingUpdates();
    
    if (usersNeedingUpdate.length === 0) {
      return {
        success: true,
        processedUsers: 0,
      };
    }
    
    // Process each user
    let processedCount = 0;
    for (const user of usersNeedingUpdate) {
      try {
        const fromDate = user.lastLocalMidnight || user.lastActivityAt || new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const toDate = now;
        
        await processUserUpdates(
          user.id,
          user.timezone || "UTC",
          fromDate,
          toDate
        );
        
        processedCount++;
      } catch (error) {
        console.error(`Failed to process updates for user ${user.id}:`, error);
        // Continue processing other users
      }
    }
    
    // Log the global update
    await db.insert(globalUpdate).values({
      lastUpdateAt: now,
      updateType: "lazy",
      processedUsers: processedCount,
      triggeredBy: triggeredByUserId || "system",
    });
    
    return {
      success: true,
      processedUsers: processedCount,
    };
  } catch (error) {
    console.error("Global lazy update failed:", error);
    return {
      success: false,
      processedUsers: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
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
