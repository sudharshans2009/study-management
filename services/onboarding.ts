"use server";

import { db } from "@/database/drizzle";
import { user } from "@/database/schema";
import { eq } from "drizzle-orm";

export type OnboardingStatus = "pending_verification" | "pending_setup" | "completed";

/**
 * Update user's onboarding status
 */
export async function updateOnboardingStatus(
  userId: string,
  status: OnboardingStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📋 Updating onboarding status for user ${userId} to: ${status}`);

    await db
      .update(user)
      .set({
        onboardingStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    console.log(`✅ Onboarding status updated successfully`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to update onboarding status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get user's current onboarding status
 */
export async function getOnboardingStatus(
  userId: string
): Promise<{ success: boolean; status?: OnboardingStatus; error?: string }> {
  try {
    const result = await db
      .select({ onboardingStatus: user.onboardingStatus })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!result || result.length === 0) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      status: result[0].onboardingStatus as OnboardingStatus,
    };
  } catch (error) {
    console.error("❌ Failed to get onboarding status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mark user as verified (after email verification)
 */
export async function markUserAsVerified(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`✅ Marking user ${userId} as verified`);

    await db
      .update(user)
      .set({
        emailVerified: true,
        onboardingStatus: "pending_setup",
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    console.log(`✅ User marked as verified, status set to pending_setup`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to mark user as verified:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Complete user onboarding (after setup)
 */
export async function completeOnboarding(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🎉 Completing onboarding for user ${userId}`);

    await db
      .update(user)
      .set({
        onboardingStatus: "completed",
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    console.log(`✅ Onboarding completed successfully`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to complete onboarding:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
