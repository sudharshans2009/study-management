import { NextRequest, NextResponse } from "next/server";
import { processGlobalLazyUpdates } from "@/actions/global-update-actions";

// This cron runs daily to ensure all users are up to date
// It catches users who haven't visited the site
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Process global updates for all users
    const result = await processGlobalLazyUpdates("cron");
    
    return NextResponse.json({
      success: true,
      message: `Cleanup completed: ${result.processedUsers} users updated`,
      processedUsers: result.processedUsers,
    });
  } catch (error) {
    console.error("Cleanup cron failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
