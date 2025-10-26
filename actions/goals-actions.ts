"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/database/drizzle";
import { 
  goal as goalTable, 
  goalProgress as goalProgressTable,
  subject as subjectTable,
  user as userTable
} from "@/database/schema";
import { eq, and, gte, desc, isNull, lte } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  hasCurrentPeriodEnded,
  getNextPeriodStart,
  getCurrentPeriodWindow,
  type PeriodType,
} from "@/lib/goal-periods";
import { isAtUserMidnight } from "@/lib/timezone";

export type GoalsResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

export type Goal = {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  category: "study" | "subject";
  period: "daily" | "weekly" | "monthly";
  unit: "minutes" | "sessions";
  target: number;
  subjectId?: string | null;
  status: "active" | "completed" | "archived";
  // Legacy fields
  startAt?: Date | null;
  endAt?: Date | null;
  lastResetAt?: Date | null;
  // New lifecycle fields
  startDate?: Date | null;
  endDate?: Date | null;
  endReason?: "completed" | "archived" | null;
  currentPeriodStart?: Date | null;
  totalPeriodsCompleted?: number | null;
  currentStreak?: number | null;
  longestStreak?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateGoalInput = {
  title: string;
  description?: string;
  category: "study" | "subject";
  period: "daily" | "weekly" | "monthly";
  unit: "minutes" | "sessions";
  target: number;
  subjectId?: string;
  startAt?: Date;
  endAt?: Date;
};

export type UpdateGoalInput = {
  title?: string;
  description?: string;
  target?: number;
  status?: "active" | "completed" | "archived";
  startAt?: Date;
  endAt?: Date;
};

/**
 * Phase 1: Create a new goal
 */
export async function createGoal(data: CreateGoalInput): Promise<GoalsResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validation: subject goals must have subjectId
    if (data.category === "subject" && !data.subjectId) {
      return { success: false, error: "Subject goals must have a subject" };
    }

    // Validation: verify subject belongs to user if provided
    if (data.subjectId) {
      const subjectExists = await db
        .select()
        .from(subjectTable)
        .where(
          and(
            eq(subjectTable.id, data.subjectId),
            eq(subjectTable.userId, session.user.id)
          )
        )
        .limit(1);

      if (!subjectExists.length) {
        return { success: false, error: "Subject not found or unauthorized" };
      }
    }

    // Validation: target must be positive
    if (data.target <= 0) {
      return { success: false, error: "Target must be greater than 0" };
    }

    const newGoal = await db
      .insert(goalTable)
      .values({
        id: nanoid(),
        userId: session.user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        period: data.period,
        unit: data.unit,
        target: data.target,
        subjectId: data.subjectId,
        status: "active",
        startAt: data.startAt,
        endAt: data.endAt,
        lastResetAt: new Date(),
      })
      .returning();

    return { success: true, data: newGoal[0] };
  } catch (error) {
    console.error("Error creating goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create goal",
    };
  }
}

/**
 * Phase 1: Get all user goals
 */
export async function getUserGoals(filter?: {
  category?: "study" | "subject";
  period?: "daily" | "weekly" | "monthly";
  status?: "active" | "completed" | "archived";
  subjectId?: string;
}): Promise<GoalsResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const conditions = [eq(goalTable.userId, session.user.id)];

    if (filter?.category) {
      conditions.push(eq(goalTable.category, filter.category));
    }
    if (filter?.period) {
      conditions.push(eq(goalTable.period, filter.period));
    }
    if (filter?.status) {
      conditions.push(eq(goalTable.status, filter.status));
    }
    if (filter?.subjectId) {
      conditions.push(eq(goalTable.subjectId, filter.subjectId));
    }

    const goals = await db
      .select()
      .from(goalTable)
      .where(and(...conditions))
      .orderBy(desc(goalTable.createdAt));

    return {
      success: true,
      data: goals,
    };
  } catch (error) {
    console.error("Error getting goals:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get goals",
    };
  }
}

/**
 * Phase 1: Get a single goal by ID
 */
export async function getGoalById(goalId: string): Promise<GoalsResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const goal = await db
      .select()
      .from(goalTable)
      .where(
        and(eq(goalTable.id, goalId), eq(goalTable.userId, session.user.id))
      )
      .limit(1);

    if (!goal.length) {
      return { success: false, error: "Goal not found" };
    }

    return {
      success: true,
      data: goal[0],
    };
  } catch (error) {
    console.error("Error getting goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get goal",
    };
  }
}

/**
 * Phase 1: Update an existing goal
 */
export async function updateGoal(
  goalId: string,
  data: UpdateGoalInput
): Promise<GoalsResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify goal belongs to user
    const existingGoal = await db
      .select()
      .from(goalTable)
      .where(eq(goalTable.id, goalId))
      .limit(1);

    if (!existingGoal.length || existingGoal[0].userId !== session.user.id) {
      return { success: false, error: "Goal not found or unauthorized" };
    }

    // Validation: target must be positive if provided
    if (data.target !== undefined && data.target <= 0) {
      return { success: false, error: "Target must be greater than 0" };
    }

    const updated = await db
      .update(goalTable)
      .set({
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.target && { target: data.target }),
        ...(data.status && { status: data.status }),
        ...(data.startAt !== undefined && { startAt: data.startAt }),
        ...(data.endAt !== undefined && { endAt: data.endAt }),
        updatedAt: new Date(),
      })
      .where(eq(goalTable.id, goalId))
      .returning();

    return { success: true, data: updated[0] };
  } catch (error) {
    console.error("Error updating goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update goal",
    };
  }
}

/**
 * Phase 1: Delete a goal
 */
export async function deleteGoal(goalId: string): Promise<GoalsResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify goal belongs to user
    const existingGoal = await db
      .select()
      .from(goalTable)
      .where(eq(goalTable.id, goalId))
      .limit(1);

    if (!existingGoal.length || existingGoal[0].userId !== session.user.id) {
      return { success: false, error: "Goal not found or unauthorized" };
    }

    await db.delete(goalTable).where(eq(goalTable.id, goalId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete goal",
    };
  }
}

/**
 * Phase 1: Get goal progress for a specific goal
 * Returns the current progress and percentage
 */
export async function getGoalProgress(goalId: string): Promise<GoalsResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get goal
    const goal = await db
      .select()
      .from(goalTable)
      .where(
        and(eq(goalTable.id, goalId), eq(goalTable.userId, session.user.id))
      )
      .limit(1);

    if (!goal.length) {
      return { success: false, error: "Goal not found" };
    }

    const currentGoal = goal[0];

    // Calculate period window
    const now = new Date();
    let windowStart: Date;

    switch (currentGoal.period) {
      case "daily":
        windowStart = new Date(now);
        windowStart.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        windowStart = new Date(now);
        windowStart.setDate(now.getDate() - now.getDay());
        windowStart.setHours(0, 0, 0, 0);
        break;
      case "monthly":
        windowStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        windowStart = new Date(0);
    }

    // Get progress entries within the period
    const progressEntries = await db
      .select()
      .from(goalProgressTable)
      .where(
        and(
          eq(goalProgressTable.goalId, goalId),
          gte(goalProgressTable.createdAt, windowStart)
        )
      );

    // Calculate total progress based on unit
    let totalProgress = 0;
    if (currentGoal.unit === "minutes") {
      totalProgress = progressEntries.reduce(
        (sum, entry) => sum + (entry.minutes || 0),
        0
      );
    } else {
      totalProgress = progressEntries.reduce(
        (sum, entry) => sum + (entry.count || 0),
        0
      );
    }

    const percentage = Math.min(
      100,
      Math.round((totalProgress / currentGoal.target) * 100)
    );

    return {
      success: true,
      data: {
        goal: currentGoal,
        progress: totalProgress,
        target: currentGoal.target,
        percentage,
        unit: currentGoal.unit,
        windowStart,
        entries: progressEntries,
      },
    };
  } catch (error) {
    console.error("Error getting goal progress:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get goal progress",
    };
  }
}

/**
 * Phase 1: Get all goals with their progress
 */
export async function getUserGoalsWithProgress(filter?: {
  category?: "study" | "subject";
  period?: "daily" | "weekly" | "monthly";
  status?: "active" | "completed" | "archived";
}): Promise<GoalsResult> {
  try {
    const goalsResult = await getUserGoals(filter);

    if (!goalsResult.success || !goalsResult.data) {
      return goalsResult;
    }

    if (!Array.isArray(goalsResult.data)) {
      return {
        success: false,
        error: "Invalid goals response format",
      };
    }

    const goals = goalsResult.data as Goal[];

    // Get progress for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal: Goal) => {
        const progressResult = await getGoalProgress(goal.id);
        return {
          ...goal,
          progress: progressResult.success ? progressResult.data : null,
        };
      })
    );

    return {
      success: true,
      data: goalsWithProgress,
    };
  } catch (error) {
    console.error("Error getting goals with progress:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get goals with progress",
    };
  }
}

/**
 * Phase 2: Check and reset goal periods for users whose midnight is within ±30 minutes
 * This should be called hourly by cron job
 */
export async function checkAndResetGoalPeriods(
  userId?: string
): Promise<GoalsResult> {
  try {
    // Get all users with their timezones (or specific user if provided)
    const userConditions = userId ? [eq(userTable.id, userId)] : [];
    
    const users = await db
      .select({
        id: userTable.id,
        timezone: userTable.timezone,
      })
      .from(userTable)
      .where(userConditions.length > 0 ? and(...userConditions) : undefined);

    const now = new Date();
    const resetsPerformed = [];
    let usersProcessed = 0;

    for (const u of users) {
      const userTimezone = u.timezone || "Asia/Kolkata";
      
      // Check if it's exactly midnight in user's timezone (hour 0, minute 0 or 30)
      if (!isAtUserMidnight(userTimezone)) {
        continue; // Skip this user, not their midnight yet
      }

      usersProcessed++;

      // Get all active goals for this user
      const activeGoals = await db
        .select()
        .from(goalTable)
        .where(
          and(
            eq(goalTable.userId, u.id),
            eq(goalTable.status, "active"),
            isNull(goalTable.endDate)
          )
        );

    for (const goal of activeGoals) {
      // Check if current period has ended
      if (!goal.currentPeriodStart) continue;

      const periodEnded = hasCurrentPeriodEnded(
        goal.period as PeriodType,
        goal.currentPeriodStart
      );

      if (!periodEnded) continue;

      // Get progress for the period that just ended
      const periodWindow = getCurrentPeriodWindow(
        goal.period as PeriodType,
        goal.currentPeriodStart
      );

      const progressEntries = await db
        .select()
        .from(goalProgressTable)
        .where(
          and(
            eq(goalProgressTable.goalId, goal.id),
            gte(goalProgressTable.createdAt, periodWindow.start),
            lte(goalProgressTable.createdAt, periodWindow.end)
          )
        );

      // Calculate if period was completed
      let totalProgress = 0;
      if (goal.unit === "minutes") {
        totalProgress = progressEntries.reduce(
          (sum, entry) => sum + (entry.minutes || 0),
          0
        );
      } else {
        totalProgress = progressEntries.reduce(
          (sum, entry) => sum + (entry.count || 0),
          0
        );
      }

      const periodCompleted = totalProgress >= goal.target;

      // Calculate new streak
      let newCurrentStreak = goal.currentStreak || 0;
      let newLongestStreak = goal.longestStreak || 0;

      if (periodCompleted) {
        newCurrentStreak += 1;
        newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
      } else {
        newCurrentStreak = 0; // Streak broken
      }

      // Update goal with new period
      const nextPeriodStart = getNextPeriodStart(
        goal.period as PeriodType,
        goal.currentPeriodStart
      );

      await db
        .update(goalTable)
        .set({
          currentPeriodStart: nextPeriodStart,
          lastResetAt: now,
          totalPeriodsCompleted: periodCompleted
            ? (goal.totalPeriodsCompleted || 0) + 1
            : goal.totalPeriodsCompleted,
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          updatedAt: now,
        })
        .where(eq(goalTable.id, goal.id));

      resetsPerformed.push({
        goalId: goal.id,
        goalTitle: goal.title,
        periodCompleted,
        progress: totalProgress,
        target: goal.target,
        newStreak: newCurrentStreak,
      });
    }
    } // Close user loop

    return {
      success: true,
      data: {
        resetCount: resetsPerformed.length,
        resets: resetsPerformed,
        usersProcessed,
      },
    };
  } catch (error) {
    console.error("Error checking and resetting goal periods:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check and reset goal periods",
    };
  }
}

/**
 * Phase 3: End goal tracking
 * User can manually end tracking with a reason (completed or archived)
 */
export async function endGoalTracking(
  goalId: string,
  reason: "completed" | "archived"
): Promise<GoalsResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify goal belongs to user and is active
    const goal = await db
      .select()
      .from(goalTable)
      .where(
        and(eq(goalTable.id, goalId), eq(goalTable.userId, session.user.id))
      )
      .limit(1);

    if (!goal.length) {
      return { success: false, error: "Goal not found" };
    }

    if (goal[0].endDate) {
      return { success: false, error: "Goal tracking already ended" };
    }

    const now = new Date();

    // Update goal with end date and reason
    const updated = await db
      .update(goalTable)
      .set({
        endDate: now,
        endReason: reason,
        status: reason === "completed" ? "completed" : "archived",
        updatedAt: now,
      })
      .where(eq(goalTable.id, goalId))
      .returning();

    return {
      success: true,
      data: updated[0],
    };
  } catch (error) {
    console.error("Error ending goal tracking:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to end goal tracking",
    };
  }
}

/**
 * Phase 4: Get goal history with all periods
 * Returns detailed history of all tracking periods
 */
export async function getGoalHistory(goalId: string): Promise<GoalsResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get goal
    const goal = await db
      .select()
      .from(goalTable)
      .where(
        and(eq(goalTable.id, goalId), eq(goalTable.userId, session.user.id))
      )
      .limit(1);

    if (!goal.length) {
      return { success: false, error: "Goal not found" };
    }

    const currentGoal = goal[0];

    // Get all progress entries
    const allProgress = await db
      .select()
      .from(goalProgressTable)
      .where(eq(goalProgressTable.goalId, goalId))
      .orderBy(desc(goalProgressTable.createdAt));

    // Calculate period history
    const periods = [];
    let currentPeriodStart = new Date(currentGoal.startDate || currentGoal.createdAt);
    const endDate = currentGoal.endDate || new Date();

    while (currentPeriodStart < endDate) {
      const periodWindow = getCurrentPeriodWindow(
        currentGoal.period as PeriodType,
        currentPeriodStart
      );

      // Get progress entries for this period
      const periodProgress = allProgress.filter((entry) => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= periodWindow.start && entryDate <= periodWindow.end;
      });

      // Calculate progress
      let totalProgress = 0;
      if (currentGoal.unit === "minutes") {
        totalProgress = periodProgress.reduce(
          (sum, entry) => sum + (entry.minutes || 0),
          0
        );
      } else {
        totalProgress = periodProgress.reduce(
          (sum, entry) => sum + (entry.count || 0),
          0
        );
      }

      const completed = totalProgress >= currentGoal.target;
      const percentage = Math.min(
        100,
        Math.round((totalProgress / currentGoal.target) * 100)
      );

      periods.push({
        start: periodWindow.start,
        end: periodWindow.end,
        progress: totalProgress,
        target: currentGoal.target,
        completed,
        percentage,
        entries: periodProgress,
      });

      // Move to next period
      currentPeriodStart = getNextPeriodStart(
        currentGoal.period as PeriodType,
        currentPeriodStart
      );
    }

    return {
      success: true,
      data: {
        goal: currentGoal,
        periods: periods.reverse(), // Most recent first
        totalPeriods: periods.length,
        completedPeriods: periods.filter((p) => p.completed).length,
        currentStreak: currentGoal.currentStreak,
        longestStreak: currentGoal.longestStreak,
      },
    };
  } catch (error) {
    console.error("Error getting goal history:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get goal history",
    };
  }
}
