"use server";

import { setupProfileSchema } from "@/lib/validations/auth";
import { getDb } from "@/database/drizzle";
import { profile, subject, user } from "@/database/schema";
import { getSessionAction } from "./auth-actions";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export async function setupProfileAction(data: unknown) {
  try {
    // Validate data
    const validatedData = setupProfileSchema.parse(data);

    // Get current session
    const sessionResult = await getSessionAction();
    
    if (!sessionResult.success || !sessionResult.user) {
      return {
        success: false,
        error: "You must be logged in to complete setup",
      };
    }

    const userId = sessionResult.user.id;
    const db = getDb();

    // Check for existing profile
    const profiles = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, userId))
      .limit(1);

    const existingProfile = profiles[0];

    if (existingProfile) {
      // Update existing profile
      await db
        .update(profile)
        .set({
          dailyGoalMinutes: validatedData.dailyGoal,
          setupCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(profile.userId, userId));
    } else {
      // Create new profile
      await db.insert(profile).values({
        id: nanoid(),
        userId,
        dailyGoalMinutes: validatedData.dailyGoal,
        setupCompleted: true,
      });
    }

    // Delete existing subjects for this user and create new ones
    await db.delete(subject).where(eq(subject.userId, userId));

    // Create subjects
    if (validatedData.subjects && validatedData.subjects.length > 0) {
      const subjectsToInsert = validatedData.subjects.map((sub) => ({
        id: nanoid(),
        userId,
        name: sub.name,
        color: sub.color || "#6366f1", // Default color if undefined
      }));

      await db.insert(subject).values(subjectsToInsert);
    }

    // Mark onboarding as completed
    await db
      .update(user)
      .set({
        onboardingStatus: "completed",
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    console.log(`🎉 Onboarding completed for user ${userId}`);

    return {
      success: true,
      message: "Profile setup completed successfully!",
    };
  } catch (error) {
    console.error("Setup profile error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to setup profile",
    };
  }
}

