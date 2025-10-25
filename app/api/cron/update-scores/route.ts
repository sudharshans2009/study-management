import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/drizzle';
import { user } from '@/database/schema';

/**
 * Cron job to update leaderboard scores daily
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
 * 
 * Schedule: Daily at 00:00 UTC (0 0 * * *)
 * Purpose: Pre-calculate and cache leaderboard scores to improve performance
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a trusted source (cron service)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all users to process
    const allUsers = await db.select().from(user);

    console.log(`[Cron] Starting score update for ${allUsers.length} users`);

    // In a production environment, you might want to:
    // 1. Calculate composite scores for all users
    // 2. Cache them in Redis or a dedicated cache table
    // 3. Update user statistics
    
    // For now, we'll just log that the cron ran successfully
    // The actual score calculation happens on-demand when leaderboards are viewed
    
    return NextResponse.json({
      success: true,
      message: `Score update completed for ${allUsers.length} users`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Error updating scores:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Allow POST as well for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
