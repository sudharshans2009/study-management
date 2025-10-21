"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/database/drizzle";
import { studySession, subject } from "@/database/schema";
import { eq, and, gte, lte, inArray, desc, asc, like } from "drizzle-orm";

export type SessionFilters = {
  dateRange?: "today" | "week" | "month" | "all";
  customStartDate?: Date;
  customEndDate?: Date;
  subjectIds?: string[];
  types?: ("timer" | "pomodoro" | "stopwatch")[];
  statuses?: ("completed" | "cancelled")[];
  focusScores?: number[];
  searchQuery?: string;
};

export type SessionSort = {
  field: "startTime" | "duration" | "focusScore";
  order: "asc" | "desc";
};

export type SessionWithSubject = {
  id: string;
  userId: string;
  subjectId: string | null;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  type: "timer" | "pomodoro" | "stopwatch";
  status: "active" | "paused" | "completed" | "cancelled";
  pomodoroCount: number;
  isBreak: boolean;
  notes: string | null;
  focusScore: number | null;
  createdAt: Date;
  // Resumption tracking fields
  pausedAt: Date | null;
  lastResumedAt: Date | null;
  canResume: boolean;
  autoCompleteReason: string | null;
  progressPercentage: number | null;
  remainingDuration: number | null;
  subject: {
    id: string;
    name: string;
    color: string;
  } | null;
};

/**
 * Get user sessions with filters and sorting
 */
export async function getSessions(
  filters?: SessionFilters,
  sort?: SessionSort
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Build date range conditions
    const dateConditions = [];
    
    if (filters?.dateRange) {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          dateConditions.push(gte(studySession.startTime, startDate));
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateConditions.push(gte(studySession.startTime, startDate));
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateConditions.push(gte(studySession.startTime, startDate));
          break;
      }
    }

    if (filters?.customStartDate) {
      dateConditions.push(gte(studySession.startTime, filters.customStartDate));
    }

    if (filters?.customEndDate) {
      dateConditions.push(lte(studySession.startTime, filters.customEndDate));
    }

    // Build filter conditions
    const conditions = [eq(studySession.userId, userId)];

    if (dateConditions.length > 0) {
      conditions.push(...dateConditions);
    }

    if (filters?.subjectIds && filters.subjectIds.length > 0) {
      conditions.push(inArray(studySession.subjectId, filters.subjectIds));
    }

    if (filters?.types && filters.types.length > 0) {
      conditions.push(inArray(studySession.type, filters.types));
    }

    if (filters?.statuses && filters.statuses.length > 0) {
      conditions.push(inArray(studySession.status, filters.statuses));
    }

    if (filters?.focusScores && filters.focusScores.length > 0) {
      conditions.push(inArray(studySession.focusScore, filters.focusScores));
    }

    if (filters?.searchQuery) {
      conditions.push(
        like(studySession.notes, `%${filters.searchQuery}%`)
      );
    }

    // Determine sort order
    let orderByClause;
    const sortField = sort?.field || "startTime";
    const sortOrder = sort?.order || "desc";

    switch (sortField) {
      case "duration":
        orderByClause = sortOrder === "asc" 
          ? asc(studySession.duration) 
          : desc(studySession.duration);
        break;
      case "focusScore":
        orderByClause = sortOrder === "asc" 
          ? asc(studySession.focusScore) 
          : desc(studySession.focusScore);
        break;
      default:
        orderByClause = sortOrder === "asc" 
          ? asc(studySession.startTime) 
          : desc(studySession.startTime);
    }

    // Query sessions with subject data
    const sessions = await db
      .select({
        id: studySession.id,
        userId: studySession.userId,
        subjectId: studySession.subjectId,
        startTime: studySession.startTime,
        endTime: studySession.endTime,
        duration: studySession.duration,
        type: studySession.type,
        status: studySession.status,
        pomodoroCount: studySession.pomodoroCount,
        isBreak: studySession.isBreak,
        notes: studySession.notes,
        focusScore: studySession.focusScore,
        createdAt: studySession.createdAt,
        subject: {
          id: subject.id,
          name: subject.name,
          color: subject.color,
        },
      })
      .from(studySession)
      .leftJoin(subject, eq(studySession.subjectId, subject.id))
      .where(and(...conditions))
      .orderBy(orderByClause);

    return {
      success: true,
      data: sessions as SessionWithSubject[],
    };
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch sessions",
    };
  }
}

/**
 * Get session statistics
 */
export async function getSessionStats(period: "today" | "week" | "month" | "all" = "all") {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Query completed sessions in period
    const sessions = await db
      .select()
      .from(studySession)
      .where(
        and(
          eq(studySession.userId, userId),
          eq(studySession.status, "completed"),
          gte(studySession.startTime, startDate)
        )
      );

    // Calculate statistics
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;
    const longestSession = sessions.length > 0 
      ? Math.max(...sessions.map((s) => s.duration || 0)) 
      : 0;

    // Calculate focus score average
    const sessionsWithScore = sessions.filter((s) => s.focusScore !== null);
    const avgFocusScore = sessionsWithScore.length > 0
      ? sessionsWithScore.reduce((sum, s) => sum + (s.focusScore || 0), 0) / sessionsWithScore.length
      : 0;

    return {
      success: true,
      data: {
        totalSessions: sessions.length,
        totalMinutes: Math.floor(totalDuration / 60),
        totalHours: (totalDuration / 3600).toFixed(1),
        avgMinutes: Math.floor(avgDuration / 60),
        longestMinutes: Math.floor(longestSession / 60),
        avgFocusScore: avgFocusScore > 0 ? avgFocusScore.toFixed(1) : null,
      },
    };
  } catch (error) {
    console.error("Error calculating session stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to calculate stats",
    };
  }
}

/**
 * Get a single session by ID
 */
export async function getSessionById(sessionId: string) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    const result = await db
      .select({
        id: studySession.id,
        userId: studySession.userId,
        subjectId: studySession.subjectId,
        startTime: studySession.startTime,
        endTime: studySession.endTime,
        duration: studySession.duration,
        type: studySession.type,
        status: studySession.status,
        pomodoroCount: studySession.pomodoroCount,
        isBreak: studySession.isBreak,
        notes: studySession.notes,
        focusScore: studySession.focusScore,
        createdAt: studySession.createdAt,
        subject: {
          id: subject.id,
          name: subject.name,
          color: subject.color,
        },
      })
      .from(studySession)
      .leftJoin(subject, eq(studySession.subjectId, subject.id))
      .where(
        and(
          eq(studySession.id, sessionId),
          eq(studySession.userId, userId)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return { success: false, error: "Session not found" };
    }

    return {
      success: true,
      data: result[0] as SessionWithSubject,
    };
  } catch (error) {
    console.error("Error fetching session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch session",
    };
  }
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    await db
      .delete(studySession)
      .where(
        and(
          eq(studySession.id, sessionId),
          eq(studySession.userId, userId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error deleting session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete session",
    };
  }
}

/**
 * Update session metadata (status, focus, notes)
 */
export async function updateSessionMetadata(
  sessionId: string,
  data: {
    status?: "completed" | "cancelled";
    focusScore?: number;
    notes?: string;
  }
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Verify session belongs to user
    const timerSession = await db
      .select()
      .from(studySession)
      .where(
        and(
          eq(studySession.id, sessionId),
          eq(studySession.userId, userId)
        )
      )
      .limit(1);

    if (timerSession.length === 0) {
      return { success: false, error: "Session not found" };
    }

    // Update session
    await db
      .update(studySession)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(studySession.id, sessionId));

    return { success: true, message: "Session updated successfully" };
  } catch (error) {
    console.error("Error updating session metadata:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update session metadata",
    };
  }
}

/**
 * Get recent paused sessions (paused within last 24 hours)
 */
export async function getRecentPausedSessions() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const pausedSessions = await db
      .select({
        id: studySession.id,
        userId: studySession.userId,
        subjectId: studySession.subjectId,
        startTime: studySession.startTime,
        endTime: studySession.endTime,
        duration: studySession.duration,
        type: studySession.type,
        status: studySession.status,
        pausedAt: studySession.pausedAt,
        remainingDuration: studySession.remainingDuration,
        progressPercentage: studySession.progressPercentage,
        canResume: studySession.canResume,
        pomodoroCount: studySession.pomodoroCount,
        isBreak: studySession.isBreak,
        notes: studySession.notes,
        focusScore: studySession.focusScore,
        createdAt: studySession.createdAt,
        subject: {
          id: subject.id,
          name: subject.name,
          color: subject.color,
        },
      })
      .from(studySession)
      .leftJoin(subject, eq(studySession.subjectId, subject.id))
      .where(
        and(
          eq(studySession.userId, userId),
          eq(studySession.status, "paused"),
          eq(studySession.canResume, true),
          gte(studySession.pausedAt, oneDayAgo)
        )
      )
      .orderBy(desc(studySession.pausedAt))
      .limit(10);

    return { success: true, data: pausedSessions, sessions: pausedSessions };
  } catch (error) {
    console.error("Error getting recent paused sessions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get recent paused sessions",
    };
  }
}
