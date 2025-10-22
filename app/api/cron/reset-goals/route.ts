import { NextRequest, NextResponse } from "next/server";
import { checkAndResetGoalPeriods } from "@/actions/goals-actions";

/**
 * Cron job endpoint to reset goal periods (timezone-aware with exact matching)
 * This runs every 30 minutes and processes users whose local time is exactly midnight
 * 
 * Schedule: * /30 * * * * (Every 30 minutes at :00 and :30)
 * 
 * How it works:
 * - Runs every 30 minutes (e.g., 00:00, 00:30, 01:00, 01:30, etc.)
 * - Queries all users with their timezones
 * - Checks if each user's local time is EXACTLY midnight (hour 0, minute 0 or 30)
 * - Only resets goals for users at their exact midnight
 * - Examples:
 *   - India (GMT+5:30): Midnight = 18:30 UTC → Processed at 18:30 UTC run
 *   - NYC (GMT-5): Midnight = 05:00 UTC → Processed at 05:00 UTC run
 *   - Shanghai (GMT+8): Midnight = 16:00 UTC → Processed at 16:00 UTC run
 * 
 * To secure this endpoint, set CRON_SECRET environment variable
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret if configured
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    // Check and reset goal periods for users near their midnight
    // No userId = checks all users, but only processes those in their midnight window
    const result = await checkAndResetGoalPeriods();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Goal periods checked and reset (timezone-aware)",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reset goals",
      },
      { status: 500 }
    );
  }
}

// Alternatively, use POST for better semantics
export async function POST(request: NextRequest) {
  return GET(request);
}
