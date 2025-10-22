"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/database/drizzle";
import { profile as profileTable, subject as subjectTable, user as userTable } from "@/database/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { isValidTimezone } from "@/lib/timezone-utils";

export type SettingsResult = {
  success: boolean;
  error?: string;
};

/**
 * Update daily study goal
 */
export async function updateDailyGoal(
  dailyGoalMinutes: number
): Promise<SettingsResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(profileTable)
      .set({
        dailyGoalMinutes,
        updatedAt: new Date(),
      })
      .where(eq(profileTable.userId, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Error updating daily goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update daily goal",
    };
  }
}

/**
 * Get user's subjects
 */
export async function getUserSubjects() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const subjects = await db
      .select()
      .from(subjectTable)
      .where(eq(subjectTable.userId, session.user.id));

    return {
      success: true,
      data: subjects,
    };
  } catch (error) {
    console.error("Error getting subjects:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get subjects",
    };
  }
}

/**
 * Add a new subject
 */
export async function addSubject(data: {
  name: string;
  color: string;
}): Promise<SettingsResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await db.insert(subjectTable).values({
      id: nanoid(),
      userId: session.user.id,
      name: data.name,
      color: data.color,
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding subject:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add subject",
    };
  }
}

/**
 * Update an existing subject
 */
export async function updateSubject(
  subjectId: string,
  data: {
    name?: string;
    color?: string;
  }
): Promise<SettingsResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify the subject belongs to the user
    const existingSubject = await db
      .select()
      .from(subjectTable)
      .where(eq(subjectTable.id, subjectId))
      .limit(1);

    if (!existingSubject.length || existingSubject[0].userId !== session.user.id) {
      return { success: false, error: "Subject not found or unauthorized" };
    }

    await db
      .update(subjectTable)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.color && { color: data.color }),
        updatedAt: new Date(),
      })
      .where(eq(subjectTable.id, subjectId));

    return { success: true };
  } catch (error) {
    console.error("Error updating subject:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update subject",
    };
  }
}

/**
 * Delete a subject
 */
export async function deleteSubject(subjectId: string): Promise<SettingsResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify the subject belongs to the user
    const existingSubject = await db
      .select()
      .from(subjectTable)
      .where(eq(subjectTable.id, subjectId))
      .limit(1);

    if (!existingSubject.length || existingSubject[0].userId !== session.user.id) {
      return { success: false, error: "Subject not found or unauthorized" };
    }

    await db
      .delete(subjectTable)
      .where(eq(subjectTable.id, subjectId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting subject:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete subject",
    };
  }
}

/**
 * Get user's daily goal
 */
export async function getDailyGoal() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const profile = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.userId, session.user.id))
      .limit(1);

    return {
      success: true,
      data: profile.length > 0 ? profile[0].dailyGoalMinutes : 120, // Default to 2 hours
    };
  } catch (error) {
    console.error("Error getting daily goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get daily goal",
    };
  }
}

/**
 * Update user's timezone preference
 */
export async function updateUserTimezone(
  timezone: string
): Promise<SettingsResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate timezone
    if (!isValidTimezone(timezone)) {
      return { success: false, error: "Invalid timezone" };
    }

    await db
      .update(userTable)
      .set({
        timezone,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Error updating timezone:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update timezone",
    };
  }
}

/**
 * Get user's timezone
 */
export async function getUserTimezone() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const users = await db
      .select({ timezone: userTable.timezone })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    return {
      success: true,
      data: users.length > 0 ? users[0].timezone : "Asia/Kolkata",
    };
  } catch (error) {
    console.error("Error getting timezone:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get timezone",
    };
  }
}
