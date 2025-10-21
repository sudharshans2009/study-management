"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/database/drizzle";
import { user as userTable, profile as profileTable } from "@/database/schema";
import { eq } from "drizzle-orm";

export type UpdateProfileResult = {
  success: boolean;
  error?: string;
};

/**
 * Update user profile information
 */
export async function updateProfile(data: {
  displayName?: string;
  bio?: string;
  socialLinks?: string[];
  image?: string;
}): Promise<UpdateProfileResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Update user table if display name or image changed
    if (data.displayName || data.image) {
      await db
        .update(userTable)
        .set({
          ...(data.displayName && { name: data.displayName }),
          ...(data.image && { image: data.image }),
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, userId));
    }

    // Update profile table if bio or social links changed
    if (data.bio !== undefined || data.socialLinks !== undefined) {
      await db
        .update(profileTable)
        .set({
          ...(data.bio !== undefined && { bio: data.bio }),
          ...(data.socialLinks !== undefined && { 
            socialLinks: JSON.stringify(data.socialLinks) 
          }),
          updatedAt: new Date(),
        })
        .where(eq(profileTable.userId, userId));
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

/**
 * Update user avatar/profile picture
 */
export async function updateAvatar(imageUrl: string): Promise<UpdateProfileResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(userTable)
      .set({
        image: imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Error updating avatar:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update avatar",
    };
  }
}

/**
 * Remove user avatar/profile picture
 */
export async function removeAvatar(): Promise<UpdateProfileResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(userTable)
      .set({
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Error removing avatar:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove avatar",
    };
  }
}

/**
 * Get user profile data
 */
export async function getProfile() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Get user data
    const userData = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    // Get profile data
    const profileData = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.userId, userId))
      .limit(1);

    if (!userData.length) {
      return { success: false, error: "User not found" };
    }

    const profile = profileData.length > 0 ? profileData[0] : null;

    return {
      success: true,
      data: {
        user: userData[0],
        profile: profile ? {
          bio: profile.bio,
          username: profile.username,
          socialLinks: profile.socialLinks 
            ? JSON.parse(profile.socialLinks) 
            : [],
        } : null,
      },
    };
  } catch (error) {
    console.error("Error getting profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get profile",
    };
  }
}
