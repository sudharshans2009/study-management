import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/drizzle';
import { user, goal, studySession } from '@/database/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

/**
 * Cron job to update user streaks every 30 minutes
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
 * 
 * Schedule: Every 30 minutes
 * Purpose: Update current streaks based on user activity in their timezone
 * 
 * Streak logic:
 * - A streak continues if the user has completed at least one session today
 * - A streak breaks if the user hasn't studied for a full day (in their timezone)
 * - Streaks are timezone-aware to ensure fair tracking across global users
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

    // Get all users with their timezones
    const allUsers = await db.select({
      id: user.id,
      timezone: user.timezone,
    }).from(user);

    console.log(`[Cron] Starting streak update for ${allUsers.length} users`);

    let updatedCount = 0;
    let brokenStreaks = 0;

    for (const userRecord of allUsers) {
      try {
        // Get current time in user's timezone
        const now = new Date();
        const nowInTimezone = new Date(
          now.toLocaleString('en-US', { timeZone: userRecord.timezone })
        );

        // Calculate start of today in user's timezone
        const startOfDayLocal = new Date(nowInTimezone);
        startOfDayLocal.setHours(0, 0, 0, 0);

        // Calculate start of yesterday in user's timezone
        const startOfYesterdayLocal = new Date(startOfDayLocal);
        startOfYesterdayLocal.setDate(startOfYesterdayLocal.getDate() - 1);

        // Convert back to UTC
        const offset = nowInTimezone.getTime() - now.getTime();
        const startOfToday = new Date(startOfDayLocal.getTime() - offset);
        const startOfYesterday = new Date(startOfYesterdayLocal.getTime() - offset);

        // Check if user has completed any sessions today
        const todaySessions = await db
          .select({ count: sql<number>`count(*)` })
          .from(studySession)
          .where(
            and(
              eq(studySession.userId, userRecord.id),
              eq(studySession.status, 'completed'),
              gte(studySession.startTime, startOfToday)
            )
          );

        const hasStudiedToday = Number(todaySessions[0]?.count) > 0;

        // Check if user studied yesterday
        const yesterdaySessions = await db
          .select({ count: sql<number>`count(*)` })
          .from(studySession)
          .where(
            and(
              eq(studySession.userId, userRecord.id),
              eq(studySession.status, 'completed'),
              gte(studySession.startTime, startOfYesterday),
              gte(studySession.startTime, startOfToday)
            )
          );

        const hasStudiedYesterday = Number(yesterdaySessions[0]?.count) > 0;

        // Get all user's active goals to update their streaks
        const userGoals = await db
          .select()
          .from(goal)
          .where(
            and(
              eq(goal.userId, userRecord.id),
              eq(goal.status, 'active')
            )
          );

        for (const userGoal of userGoals) {
          let newStreak = userGoal.currentStreak;

          if (hasStudiedToday) {
            // User studied today - maintain or increment streak
            // Only increment if they also studied yesterday (continuous streak)
            if (hasStudiedYesterday || newStreak === 0) {
              newStreak = newStreak + 1;
            }
          } else if (!hasStudiedYesterday) {
            // User hasn't studied today or yesterday - break streak
            if (newStreak > 0) {
              brokenStreaks++;
            }
            newStreak = 0;
          }
          // If they studied yesterday but not today yet, keep current streak

          // Update longest streak if needed
          const longestStreak = Math.max(userGoal.longestStreak, newStreak);

          // Update goal with new streak values
          await db
            .update(goal)
            .set({
              currentStreak: newStreak,
              longestStreak: longestStreak,
              updatedAt: new Date(),
            })
            .where(eq(goal.id, userGoal.id));
        }

        updatedCount++;
      } catch (error) {
        console.error(`[Cron] Error updating streak for user ${userRecord.id}:`, error);
        // Continue with other users
      }
    }

    console.log(`[Cron] Streak update completed: ${updatedCount} users updated, ${brokenStreaks} streaks broken`);

    return NextResponse.json({
      success: true,
      message: `Streak update completed`,
      stats: {
        totalUsers: allUsers.length,
        usersUpdated: updatedCount,
        streaksBroken: brokenStreaks,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Error updating streaks:', error);
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
