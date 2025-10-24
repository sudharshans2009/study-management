"use server";

import { db } from "@/database/drizzle";
import { studySession, goal, user } from "@/database/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, gte, lte, sql, desc, isNotNull } from "drizzle-orm";
import type { LeaderboardEntry, LeaderboardStats, LeaderboardPeriod, LeaderboardMetric } from "@/lib/leaderboard-utils";
import { getLeaderboardDateRange, calculateCompositeScore } from "@/lib/leaderboard-utils";

/**
 * Get composite leaderboard with weighted scoring
 */
export async function getLeaderboard(
  metric: LeaderboardMetric,
  period: LeaderboardPeriod = 'monthly',
  limit: number = 100
): Promise<{
  success: boolean;
  data?: {
    entries: LeaderboardEntry[];
    stats: LeaderboardStats;
    currentUserEntry?: LeaderboardEntry;
  };
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }
    const currentUser = session.user;

    // Get user's timezone from database
    const userRecord = await db
      .select({ timezone: user.timezone })
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1);
    
    const timezone = userRecord[0]?.timezone || 'UTC';
    const { start, end } = getLeaderboardDateRange(period, timezone);

    let leaderboardData: LeaderboardEntry[] = [];

    if (metric === 'composite') {
      leaderboardData = await getCompositeLeaderboard(start, end, limit);
    } else {
      // Individual metric leaderboards
      switch (metric) {
        case 'study-time':
          leaderboardData = await getStudyTimeLeaderboard(start, end, limit);
          break;
        case 'streak':
          leaderboardData = await getStreakLeaderboard(limit, period);
          break;
        case 'goals':
          leaderboardData = await getGoalsLeaderboard(start, end, limit);
          break;
        case 'focus-score':
          leaderboardData = await getFocusScoreLeaderboard(start, end, limit);
          break;
        case 'sessions':
          leaderboardData = await getSessionsLeaderboard(start, end, limit);
          break;
      }
    }

    // Mark current user's entry
    const entries = leaderboardData.map(entry => ({
      ...entry,
      isCurrentUser: entry.userId === currentUser.id,
    }));

    // Calculate stats
    const totalParticipants = entries.length;
    const averageScore = entries.length > 0
      ? entries.reduce((sum, e) => sum + (e.compositeScore || e.value), 0) / entries.length
      : 0;
    const topPerformer = entries[0] || null;

    // Find current user's entry
    const currentUserEntry = entries.find(e => e.isCurrentUser);

    return {
      success: true,
      data: {
        entries,
        stats: {
          totalParticipants,
          averageScore,
          topPerformer,
          period,
        },
        currentUserEntry,
      },
    };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return { success: false, error: "Failed to fetch leaderboard" };
  }
}

/**
 * Get composite weighted leaderboard
 */
async function getCompositeLeaderboard(
  start: Date,
  end: Date,
  limit: number
): Promise<LeaderboardEntry[]> {
  // Get all users with their metrics
  const results = await db
    .select({
      userId: user.id,
      username: user.email,
      name: user.name,
      avatar: user.image,
      totalMinutes: sql<number>`CAST(COALESCE(SUM(CASE WHEN ${studySession.status} = 'completed' THEN ${studySession.duration} END) / 60, 0) AS INTEGER)`,
      sessionCount: sql<number>`CAST(COUNT(DISTINCT CASE WHEN ${studySession.status} = 'completed' THEN ${studySession.id} END) AS INTEGER)`,
      avgFocusScore: sql<number>`CAST(COALESCE(AVG(CASE WHEN ${studySession.focusScore} IS NOT NULL THEN ${studySession.focusScore} END), 0) AS DECIMAL(3,2))`,
      goalsCompleted: sql<number>`CAST(COUNT(DISTINCT CASE WHEN ${goal.status} = 'completed' AND ${goal.endDate} >= ${start} AND ${goal.endDate} <= ${end} THEN ${goal.id} END) AS INTEGER)`,
      currentStreak: sql<number>`CAST(COALESCE(MAX(${goal.currentStreak}), 0) AS INTEGER)`,
    })
    .from(user)
    .leftJoin(
      studySession,
      and(
        eq(studySession.userId, user.id),
        gte(studySession.startTime, start),
        lte(studySession.startTime, end)
      )
    )
    .leftJoin(
      goal,
      eq(goal.userId, user.id)
    )
    .groupBy(user.id, user.email, user.name, user.image);

  // Calculate composite scores
  const scoredResults = results.map(r => {
    const score = calculateCompositeScore({
      totalMinutes: r.totalMinutes,
      currentStreak: r.currentStreak,
      goalsCompleted: r.goalsCompleted,
      avgFocusScore: r.avgFocusScore,
      sessionCount: r.sessionCount,
    });

    return {
      userId: r.userId,
      username: r.username,
      name: r.name || r.username.split('@')[0],
      avatar: r.avatar,
      value: score.total,
      compositeScore: score.total,
      breakdown: score.breakdown,
      rawMetrics: {
        totalMinutes: r.totalMinutes,
        currentStreak: r.currentStreak,
        goalsCompleted: r.goalsCompleted,
        avgFocusScore: r.avgFocusScore,
        sessionCount: r.sessionCount,
      },
    };
  });

  // Sort by composite score and assign ranks
  const sorted = scoredResults
    .filter(r => r.compositeScore > 0) // Only users with activity
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, limit)
    .map((r, index) => ({
      ...r,
      rank: index + 1,
    }));

  return sorted;
}

/**
 * Get study time leaderboard
 */
async function getStudyTimeLeaderboard(
  start: Date,
  end: Date,
  limit: number
): Promise<LeaderboardEntry[]> {
  const results = await db
    .select({
      userId: user.id,
      username: user.email,
      name: user.name,
      avatar: user.image,
      totalMinutes: sql<number>`CAST(SUM(${studySession.duration}) / 60 AS INTEGER)`,
    })
    .from(studySession)
    .innerJoin(user, eq(studySession.userId, user.id))
    .where(
      and(
        eq(studySession.status, "completed"),
        gte(studySession.startTime, start),
        lte(studySession.startTime, end)
      )
    )
    .groupBy(user.id, user.email, user.name, user.image)
    .orderBy(desc(sql`SUM(${studySession.duration})`))
    .limit(limit);

  return results.map((r, index) => ({
    userId: r.userId,
    username: r.username,
    name: r.name || r.username.split('@')[0],
    avatar: r.avatar,
    rank: index + 1,
    value: r.totalMinutes,
  }));
}

/**
 * Get streak leaderboard
 */
async function getStreakLeaderboard(
  limit: number,
  period: LeaderboardPeriod
): Promise<LeaderboardEntry[]> {
  const streakField = period === 'all-time' ? goal.longestStreak : goal.currentStreak;
  
  const results = await db
    .select({
      userId: user.id,
      username: user.email,
      name: user.name,
      avatar: user.image,
      maxStreak: sql<number>`COALESCE(MAX(${streakField}), 0)`,
    })
    .from(user)
    .leftJoin(goal, and(
      eq(goal.userId, user.id),
      eq(goal.status, 'active')
    ))
    .groupBy(user.id, user.email, user.name, user.image)
    .orderBy(desc(sql`COALESCE(MAX(${streakField}), 0)`))
    .limit(limit);

  return results
    .filter(r => r.maxStreak > 0)
    .map((r, index) => ({
      userId: r.userId,
      username: r.username,
      name: r.name || r.username.split('@')[0],
      avatar: r.avatar,
      rank: index + 1,
      value: r.maxStreak,
    }));
}

/**
 * Get goals completed leaderboard
 */
async function getGoalsLeaderboard(
  start: Date,
  end: Date,
  limit: number
): Promise<LeaderboardEntry[]> {
  const results = await db
    .select({
      userId: user.id,
      username: user.email,
      name: user.name,
      avatar: user.image,
      goalsCompleted: sql<number>`COUNT(${goal.id})`,
    })
    .from(user)
    .innerJoin(goal, and(
      eq(goal.userId, user.id),
      eq(goal.status, 'completed'),
      isNotNull(goal.endDate),
      gte(goal.endDate, start),
      lte(goal.endDate, end)
    ))
    .groupBy(user.id, user.email, user.name, user.image)
    .orderBy(desc(sql`COUNT(${goal.id})`))
    .limit(limit);

  return results.map((r, index) => ({
    userId: r.userId,
    username: r.username,
    name: r.name || r.username.split('@')[0],
    avatar: r.avatar,
    rank: index + 1,
    value: r.goalsCompleted,
  }));
}

/**
 * Get focus score leaderboard
 */
async function getFocusScoreLeaderboard(
  start: Date,
  end: Date,
  limit: number
): Promise<LeaderboardEntry[]> {
  const results = await db
    .select({
      userId: user.id,
      username: user.email,
      name: user.name,
      avatar: user.image,
      avgFocusScore: sql<number>`ROUND(AVG(${studySession.focusScore}), 2)`,
      sessionCount: sql<number>`COUNT(${studySession.id})`,
    })
    .from(studySession)
    .innerJoin(user, eq(studySession.userId, user.id))
    .where(
      and(
        eq(studySession.status, "completed"),
        isNotNull(studySession.focusScore),
        gte(studySession.startTime, start),
        lte(studySession.startTime, end)
      )
    )
    .groupBy(user.id, user.email, user.name, user.image)
    .having(sql`COUNT(${studySession.id}) >= 3`)
    .orderBy(desc(sql`AVG(${studySession.focusScore})`))
    .limit(limit);

  return results.map((r, index) => ({
    userId: r.userId,
    username: r.username,
    name: r.name || r.username.split('@')[0],
    avatar: r.avatar,
    rank: index + 1,
    value: r.avgFocusScore,
  }));
}

/**
 * Get sessions count leaderboard
 */
async function getSessionsLeaderboard(
  start: Date,
  end: Date,
  limit: number
): Promise<LeaderboardEntry[]> {
  const results = await db
    .select({
      userId: user.id,
      username: user.email,
      name: user.name,
      avatar: user.image,
      sessionCount: sql<number>`COUNT(${studySession.id})`,
    })
    .from(studySession)
    .innerJoin(user, eq(studySession.userId, user.id))
    .where(
      and(
        eq(studySession.status, "completed"),
        gte(studySession.startTime, start),
        lte(studySession.startTime, end)
      )
    )
    .groupBy(user.id, user.email, user.name, user.image)
    .orderBy(desc(sql`COUNT(${studySession.id})`))
    .limit(limit);

  return results.map((r, index) => ({
    userId: r.userId,
    username: r.username,
    name: r.name || r.username.split('@')[0],
    avatar: r.avatar,
    rank: index + 1,
    value: r.sessionCount,
  }));
}

/**
 * Get user's rank for a specific metric
 */
export async function getUserRank(
  metric: LeaderboardMetric,
  period: LeaderboardPeriod = 'monthly'
): Promise<{
  success: boolean;
  data?: {
    rank: number;
    value: number;
    compositeScore?: number;
    breakdown?: any;
    totalParticipants: number;
    percentile: number;
  };
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }
    const currentUser = session.user;

    const leaderboardResult = await getLeaderboard(metric, period, 1000);
    
    if (!leaderboardResult.success || !leaderboardResult.data) {
      return { success: false, error: "Failed to get leaderboard" };
    }

    const { entries } = leaderboardResult.data;
    const userEntry = entries.find(e => e.userId === currentUser.id);

    if (!userEntry) {
      return {
        success: true,
        data: {
          rank: 0,
          value: 0,
          compositeScore: 0,
          totalParticipants: entries.length,
          percentile: 0,
        },
      };
    }

    const percentile = ((entries.length - userEntry.rank + 1) / entries.length) * 100;

    return {
      success: true,
      data: {
        rank: userEntry.rank,
        value: userEntry.value,
        compositeScore: userEntry.compositeScore,
        breakdown: userEntry.breakdown,
        totalParticipants: entries.length,
        percentile: Math.round(percentile),
      },
    };
  } catch (error) {
    console.error("Error getting user rank:", error);
    return { success: false, error: "Failed to get user rank" };
  }
}
