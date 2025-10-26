import { NextRequest, NextResponse } from "next/server";
import { verifyQStashSignature } from "@/services/qstash";
import { db } from "@/database/drizzle";
import { user } from "@/database/schema";
import { and, eq, lt } from "drizzle-orm";
import { sendWelcomeEmail } from "@/services/email";

export async function POST(req: NextRequest) {
  try {
    // Verify QStash signature
    const signature = req.headers.get("upstash-signature");
    const body = await req.text();

    if (!signature || !(await verifyQStashSignature(signature, body))) {
      console.error("[QStash] Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    console.log("[QStash] Processing batch onboarding reminders...");

    // Find users who signed up more than 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const usersNeedingReminder = await db
      .select({ 
        id: user.id, 
        email: user.email, 
        name: user.name,
        onboardingStatus: user.onboardingStatus 
      })
      .from(user)
      .where(
        and(
          lt(user.createdAt, fiveMinutesAgo),
          eq(user.onboardingStatus, "pending_setup") // Only users who haven't completed setup
        )
      )
      .limit(50); // Process max 50 users per batch

    console.log(
      `[QStash] Found ${usersNeedingReminder.length} users needing onboarding email`
    );

    // Send welcome emails
    let successCount = 0;
    let failCount = 0;

    for (const userData of usersNeedingReminder) {
      try {
        const result = await sendWelcomeEmail(
          userData.email,
          userData.name || "there"
        );

        if (result.success) {
          successCount++;
          console.log(`[QStash] ✓ Sent welcome email to ${userData.email}`);
          
          // Update onboarding status to completed
          await db
            .update(user)
            .set({ onboardingStatus: "completed" })
            .where(eq(user.id, userData.id));
        } else {
          failCount++;
          console.error(`[QStash] ✗ Failed to send to ${userData.email}:`, result.error);
        }
      } catch (error) {
        failCount++;
        console.error(`[QStash] ✗ Exception sending to ${userData.email}:`, error);
      }
    }

    console.log(
      `[QStash] Batch onboarding complete: ${successCount} sent, ${failCount} failed`
    );

    return NextResponse.json({
      success: true,
      checked: usersNeedingReminder.length,
      sent: successCount,
      failed: failCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[QStash] Batch onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
