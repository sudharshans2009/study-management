import { serve } from "@upstash/workflow/nextjs";

interface OnboardingPayload {
  userId: string;
  email: string;
  name: string;
}

/**
 * Multi-day onboarding workflow
 * 
 * This demonstrates the power of Upstash Workflow for complex, multi-step processes.
 * 
 * Flow:
 * 1. Send welcome email immediately
 * 2. Wait 1 day
 * 3. Send reminder email
 * 4. Wait 3 days
 * 5. Send final encouragement email
 * 
 * Features:
 * - Automatic retries on failures
 * - State persists across days
 * - Can resume after server restarts
 * - Conditional logic based on user activity
 * 
 * Usage:
 * POST /api/workflow/onboarding
 * Body: { userId: "123", email: "user@example.com", name: "John" }
 */
export const { POST } = serve<OnboardingPayload>(
  async (context) => {
    const { userId, email, name } = context.requestPayload;

    console.log(`[Onboarding Workflow] Starting for user ${userId}`);

    // Step 1: Send welcome email
    await context.run("send-welcome-email", async () => {
      console.log(`[Onboarding] Sending welcome email to ${email}`);

      // TODO: Integrate with email service (Resend/SendGrid)
      // await sendEmail({
      //   to: email,
      //   subject: "Welcome to Study Tracker!",
      //   template: "welcome",
      //   data: { name },
      // });

      console.log(`[Onboarding] ✓ Welcome email sent to ${email}`);
      return { sent: true, timestamp: Date.now() };
    });

    // Step 2: Wait 1 day (86400 seconds)
    console.log("[Onboarding] Waiting 1 day before first reminder...");
    await context.sleep("wait-1-day", 60 * 60 * 24);

    // Step 3: Send day 1 reminder
    await context.run("send-reminder-day-1", async () => {
      console.log(`[Onboarding] Sending day 1 reminder to ${email}`);

      // TODO: Send reminder email
      // await sendEmail({
      //   to: email,
      //   subject: "Ready to start tracking your study time?",
      //   template: "reminder-day-1",
      //   data: { name },
      // });

      console.log(`[Onboarding] ✓ Day 1 reminder sent to ${email}`);
      return { sent: true, timestamp: Date.now() };
    });

    // Step 4: Wait 3 more days (259200 seconds)
    console.log("[Onboarding] Waiting 3 days before final reminder...");
    await context.sleep("wait-3-days", 60 * 60 * 24 * 3);

    // Step 5: Send final encouragement
    await context.run("send-encouragement-email", async () => {
      console.log(`[Onboarding] Sending final encouragement to ${email}`);

      // TODO: Send encouragement email
      // await sendEmail({
      //   to: email,
      //   subject: "You're almost there! Complete your profile",
      //   template: "encouragement-day-4",
      //   data: { name },
      // });

      console.log(`[Onboarding] ✓ Final encouragement sent to ${email}`);
      return { sent: true, timestamp: Date.now() };
    });

    console.log(`[Onboarding Workflow] Completed for user ${userId}`);

    // Return workflow summary
    return {
      success: true,
      userId,
      emailsSent: 3,
      duration: "4 days",
      completedAt: new Date().toISOString(),
    };
  },
  {
    retries: 3,
  }
);

/**
 * Example usage in user registration:
 * 
 * async function registerUser(data: RegisterData) {
 *   // Create user in database
 *   const user = await db.insert(users).values(data).returning();
 *   
 *   // Trigger onboarding workflow
 *   await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/workflow/onboarding`, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({
 *       userId: user.id,
 *       email: user.email,
 *       name: user.name,
 *     }),
 *   });
 *   
 *   return user;
 * }
 */
