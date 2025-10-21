"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/database/drizzle";
import { 
  goal as goalTable, 
  goalProgress as goalProgressTable,
  subject as subjectTable 
} from "@/database/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

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
  startAt?: Date | null;
  endAt?: Date | null;
  lastResetAt?: Date | null;
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

    const goals = goalsResult.data;

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
