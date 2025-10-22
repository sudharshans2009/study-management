"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/database/drizzle";
import { 
  studySession as studySessionTable,
  goal as goalTable,
  subject as subjectTable 
} from "@/database/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import type { StudyStats, StatsPeriod } from "@/lib/stats-utils";
import {
  getDateRangeForPeriod,
  generateTimeSeriesData,
  getMostProductiveDay,
  getMostProductiveHour,
  getFocusScoreDistribution,
} from "@/lib/stats-utils";
import { format } from "date-fns";

export type StatsResult = {
  success: boolean;
  data?: StudyStats;
  error?: string;
};

export async function getStudyStats(
  period: StatsPeriod = 'week'
): Promise<StatsResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const { start, end } = getDateRangeForPeriod(period);

    // Get all completed sessions in period
    const sessions = await db
      .select()
      .from(studySessionTable)
      .where(
        and(
          eq(studySessionTable.userId, session.user.id),
          eq(studySessionTable.status, "completed"),
          gte(studySessionTable.startTime, start),
          lte(studySessionTable.startTime, end)
        )
      )
      .orderBy(desc(studySessionTable.startTime));

    // Get all goals
    const goals = await db
      .select()
      .from(goalTable)
      .where(eq(goalTable.userId, session.user.id));

    // Get all subjects
    const subjects = await db
      .select()
      .from(subjectTable)
      .where(eq(subjectTable.userId, session.user.id));

    // Calculate total minutes and sessions (duration is in seconds, convert to minutes)
    const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);
    const totalSessions = sessions.length;
    const averageSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0;

    // Calculate goal stats
    const activeGoals = goals.filter(g => g.status === 'active' && !g.endDate);
    const completedGoals = goals.filter(g => g.status === 'completed' || g.endDate);
    const maxStreak = Math.max(...goals.map(g => g.longestStreak || 0), 0);
    const currentStreaks = activeGoals.map(g => g.currentStreak || 0);
    const maxCurrentStreak = Math.max(...currentStreaks, 0);

    // Get daily goal progress (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = sessions.filter(s => {
      if (!s.startTime) return false;
      const sessionDate = new Date(s.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });
    const todayMinutes = Math.round(todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);
    const dailyGoal = 120; // Default, should fetch from user settings
    const dailyGoalProgress = (todayMinutes / dailyGoal) * 100;

    // Calculate subject breakdown
    const subjectStats = subjects.map(subj => {
      const subjectSessions = sessions.filter(s => s.subjectId === subj.id);
      const minutes = Math.round(subjectSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);
      const sessionCount = subjectSessions.length;
      const percentage = totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0;

      return {
        subjectId: subj.id,
        subjectName: subj.name,
        subjectColor: subj.color,
        minutes,
        sessions: sessionCount,
        percentage,
      };
    }).sort((a, b) => b.minutes - a.minutes);

    // Generate time distribution
    const timeSeriesData = generateTimeSeriesData(period, start, end);
    
    sessions.forEach(session => {
      if (!session.startTime) return;
      const sessionDate = format(new Date(session.startTime), 
        period === 'week' || period === 'month' ? 'MMM d' : 'MMM yyyy'
      );
      
      const dataPoint = timeSeriesData.find(d => d.date === sessionDate);
      if (dataPoint) {
        dataPoint.minutes += Math.round((session.duration || 0) / 60);
        dataPoint.sessions += 1;
      }
    });

    // Calculate session type breakdown
    const typeStats: Record<string, { count: number; minutes: number }> = {};
    
    sessions.forEach(session => {
      const type = session.type || 'timer';
      if (!typeStats[type]) {
        typeStats[type] = { count: 0, minutes: 0 };
      }
      typeStats[type].count += 1;
      typeStats[type].minutes += Math.round((session.duration || 0) / 60);
    });

    const sessionTypeBreakdown = Object.entries(typeStats).map(([type, stats]) => ({
      type,
      count: stats.count,
      minutes: stats.minutes,
      percentage: totalMinutes > 0 ? (stats.minutes / totalMinutes) * 100 : 0,
    })).sort((a, b) => b.minutes - a.minutes);

    // Calculate focus score stats
    const sessionsWithFocus = sessions.filter(s => s.focusScore !== null);
    const averageFocusScore = sessionsWithFocus.length > 0
      ? sessionsWithFocus.reduce((sum, s) => sum + (s.focusScore || 0), 0) / sessionsWithFocus.length
      : 0;
    
    const focusScoreDistribution = getFocusScoreDistribution(
      sessions.map(s => ({ focusScore: s.focusScore }))
    );

    // Calculate productivity insights
    const mostProductiveDay = getMostProductiveDay(
      sessions
        .filter(s => s.startTime)
        .map(s => ({
          startedAt: new Date(s.startTime!),
          duration: s.duration || 0,
        }))
    );

    const mostProductiveHour = getMostProductiveHour(
      sessions
        .filter(s => s.startTime)
        .map(s => ({
          startedAt: new Date(s.startTime!),
          duration: s.duration || 0,
        }))
    );

    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const averageSessionsPerDay = daysInPeriod > 0 ? totalSessions / daysInPeriod : 0;

    const stats: StudyStats = {
      totalMinutes,
      totalSessions,
      averageSessionLength,
      dailyGoalProgress,
      goalsCompleted: completedGoals.length,
      goalsActive: activeGoals.length,
      currentStreak: maxCurrentStreak,
      longestStreak: maxStreak,
      subjectBreakdown: subjectStats,
      timeDistribution: timeSeriesData,
      sessionTypeBreakdown,
      averageFocusScore,
      focusScoreDistribution,
      mostProductiveDay,
      mostProductiveHour,
      averageSessionsPerDay,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching study stats:", error);
    return { success: false, error: "Failed to fetch statistics" };
  }
}

/**
 * Get comparison with previous period
 */
export async function getStatsComparison(
  period: StatsPeriod
): Promise<{
  success: boolean;
  data?: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const currentRange = getDateRangeForPeriod(period);
    const duration = currentRange.end.getTime() - currentRange.start.getTime();
    const previousStart = new Date(currentRange.start.getTime() - duration);
    const previousEnd = new Date(currentRange.end.getTime() - duration);

    // Current period
    const currentSessions = await db
      .select()
      .from(studySessionTable)
      .where(
        and(
          eq(studySessionTable.userId, session.user.id),
          eq(studySessionTable.status, "completed"),
          gte(studySessionTable.startTime, currentRange.start),
          lte(studySessionTable.startTime, currentRange.end)
        )
      );

    // Previous period
    const previousSessions = await db
      .select()
      .from(studySessionTable)
      .where(
        and(
          eq(studySessionTable.userId, session.user.id),
          eq(studySessionTable.status, "completed"),
          gte(studySessionTable.startTime, previousStart),
          lte(studySessionTable.startTime, previousEnd)
        )
      );

    const current = Math.round(currentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);
    const previous = Math.round(previousSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);
    
    const change = previous > 0 ? ((current - previous) / previous) * 100 : (current > 0 ? 100 : 0);
    const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'neutral';

    return {
      success: true,
      data: { current, previous, change, trend },
    };
  } catch (error) {
    console.error("Error fetching stats comparison:", error);
    return { success: false, error: "Failed to fetch comparison" };
  }
}
