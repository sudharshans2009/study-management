"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/database/drizzle";
import { studySession, subject } from "@/database/schema";
import { eq, and, desc, gte, lt } from "drizzle-orm";
import { nanoid } from "nanoid";

export type TimerType = "timer" | "pomodoro" | "stopwatch";
export type SessionStatus = "active" | "paused" | "completed" | "cancelled";

export type TimerSession = {
  id: string;
  userId: string;
  subjectId: string | null;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  type: TimerType;
  status: SessionStatus;
  pomodoroCount: number;
  isBreak: boolean;
  notes: string | null;
  focusScore: number | null;
};

export type StartSessionResult = {
  success: boolean;
  session?: TimerSession;
  error?: string;
};

/**
 * Start a new timer session
 */
export async function startTimerSession(data: {
  duration: number; // in seconds
  subjectId?: string | null;
  type?: TimerType;
  isBreak?: boolean;
}): Promise<StartSessionResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Check for existing active session
    const existingActive = await db
      .select()
      .from(studySession)
      .where(
        and(
          eq(studySession.userId, userId),
          eq(studySession.status, "active")
        )
      )
      .limit(1);

    if (existingActive.length > 0) {
      return {
        success: false,
        error: "You already have an active session. Please stop it first.",
      };
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + data.duration * 1000);

    const sessionId = nanoid();
    const newSession = await db
      .insert(studySession)
      .values({
        id: sessionId,
        userId,
        subjectId: data.subjectId || null,
        startTime: now,
        endTime,
        duration: data.duration, // Store target duration initially
        type: data.type || "timer",
        status: "active",
        isBreak: data.isBreak || false,
        pomodoroCount: 0,
        lastResumedAt: now, // Track when this active period started
      })
      .returning();

    return {
      success: true,
      session: newSession[0] as TimerSession,
    };
  } catch (error) {
    console.error("Error starting timer session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start session",
    };
  }
}

/**
 * Pause an active timer session
 */
export async function pauseTimerSession(
  sessionId: string
): Promise<StartSessionResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Get the session
    const existingSession = await db
      .select()
      .from(studySession)
      .where(
        and(
          eq(studySession.id, sessionId),
          eq(studySession.userId, userId),
          eq(studySession.status, "active")
        )
      )
      .limit(1);

    if (existingSession.length === 0) {
      return { success: false, error: "Session not found or not active" };
    }

    const current = existingSession[0];
    const now = new Date();

    // Calculate time elapsed in this active period
    // Use lastResumedAt if session was previously resumed, otherwise use startTime
    const measureFrom = current.lastResumedAt 
      ? new Date(current.lastResumedAt)
      : new Date(current.startTime);
    
    const activeSeconds = Math.floor(
      (now.getTime() - measureFrom.getTime()) / 1000
    );

    // For sessions that haven't been paused before, duration is the target
    // For resumed sessions, duration is already accumulated time
    // We need to distinguish between first pause and subsequent pauses
    const isFirstPause = !current.pausedAt; // Never been paused before
    
    let accumulatedTime: number;
    if (isFirstPause) {
      // First pause: activeSeconds is the accumulated time
      accumulatedTime = activeSeconds;
    } else {
      // Subsequent pause: add activeSeconds to existing accumulated time
      accumulatedTime = (current.duration || 0) + activeSeconds;
    }

    // Calculate remaining time (for timers with target duration)
    // If this is first pause, calculate from original endTime
    let remaining = 0;
    if (current.endTime) {
      const targetDuration = Math.floor(
        (new Date(current.endTime).getTime() - new Date(current.startTime).getTime()) / 1000
      );
      remaining = Math.max(0, targetDuration - accumulatedTime);
    }
    
    const progress = current.endTime
      ? Math.round((accumulatedTime / (accumulatedTime + remaining)) * 100)
      : 0;

    // Update session
    const updated = await db
      .update(studySession)
      .set({
        status: "paused",
        duration: accumulatedTime, // Store accumulated time
        pausedAt: now,
        remainingDuration: remaining,
        progressPercentage: progress,
        canResume: true,
        updatedAt: now,
      })
      .where(eq(studySession.id, sessionId))
      .returning();

    return {
      success: true,
      session: updated[0] as TimerSession,
    };
  } catch (error) {
    console.error("Error pausing timer session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to pause session",
    };
  }
}

/**
 * Resume a paused timer session
 */
export async function resumeTimerSession(
  sessionId: string
): Promise<StartSessionResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Get the session
    const existingSession = await db
      .select()
      .from(studySession)
      .where(
        and(
          eq(studySession.id, sessionId),
          eq(studySession.userId, userId),
          eq(studySession.status, "paused")
        )
      )
      .limit(1);

    if (existingSession.length === 0) {
      return { success: false, error: "Session not found or not paused" };
    }

    const current = existingSession[0];
    const now = new Date();

    // Calculate new end time based on remaining duration
    const remainingTime = current.remainingDuration || 0;
    const newEndTime = remainingTime > 0 
      ? new Date(now.getTime() + remainingTime * 1000)
      : null;

    // Update session - keep accumulated duration, set lastResumedAt to track new active period
    const updated = await db
      .update(studySession)
      .set({
        status: "active",
        endTime: newEndTime,
        lastResumedAt: now, // Track when this active period started
        updatedAt: now,
      })
      .where(eq(studySession.id, sessionId))
      .returning();

    return {
      success: true,
      session: updated[0] as TimerSession,
    };
  } catch (error) {
    console.error("Error resuming timer session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resume session",
    };
  }
}

/**
 * Complete a timer session
 */
export async function completeTimerSession(
  sessionId: string,
  data?: {
    focusScore?: number;
    notes?: string;
  }
): Promise<StartSessionResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Get the session
    const existingSession = await db
      .select()
      .from(studySession)
      .where(
        and(
          eq(studySession.id, sessionId),
          eq(studySession.userId, userId)
        )
      )
      .limit(1);

    if (existingSession.length === 0) {
      return { success: false, error: "Session not found" };
    }

    const current = existingSession[0];
    const now = new Date();

    // Calculate actual time spent studying
    let finalDuration: number;
    
    if (current.status === 'active') {
      // Session is active - calculate time since last resume/start
      const measureFrom = current.lastResumedAt 
        ? new Date(current.lastResumedAt)
        : new Date(current.startTime);
      
      const activeSeconds = Math.floor(
        (now.getTime() - measureFrom.getTime()) / 1000
      );
      
      // Check if this is first completion (never paused)
      const isFirstCompletion = !current.pausedAt;
      
      if (isFirstCompletion) {
        // Never paused: activeSeconds is the total time
        finalDuration = activeSeconds;
      } else {
        // Was paused before: add activeSeconds to accumulated duration
        finalDuration = (current.duration || 0) + activeSeconds;
      }
    } else if (current.status === 'paused') {
      // Session is paused - duration already contains accumulated time
      finalDuration = current.duration || 0;
    } else {
      // Fallback for other statuses
      finalDuration = current.duration || 0;
    }

    // Update session
    const updated = await db
      .update(studySession)
      .set({
        status: "completed",
        endTime: now,
        duration: finalDuration,
        focusScore: data?.focusScore,
        notes: data?.notes,
        durationMinutes: Math.floor(finalDuration / 60), // For backward compatibility
        updatedAt: now,
      })
      .where(eq(studySession.id, sessionId))
      .returning();

    return {
      success: true,
      session: updated[0] as TimerSession,
    };
  } catch (error) {
    console.error("Error completing timer session:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to complete session",
    };
  }
}

/**
 * Cancel a timer session
 * Saves the elapsed time so it shows in the dashboard, but doesn't count in stats
 */
export async function cancelTimerSession(
  sessionId: string
): Promise<StartSessionResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Get the current session to calculate elapsed time
    const existingSession = await db
      .select()
      .from(studySession)
      .where(
        and(
          eq(studySession.id, sessionId),
          eq(studySession.userId, userId)
        )
      )
      .limit(1);

    if (existingSession.length === 0) {
      return { success: false, error: "Session not found" };
    }

    const current = existingSession[0];
    const now = new Date();

    // Calculate actual time spent studying (same logic as complete)
    let finalDuration: number;
    
    if (current.status === 'active') {
      // Session is active - calculate time since last resume/start
      const measureFrom = current.lastResumedAt 
        ? new Date(current.lastResumedAt)
        : new Date(current.startTime);
      
      const activeSeconds = Math.floor(
        (now.getTime() - measureFrom.getTime()) / 1000
      );
      
      // Check if this is first cancellation (never paused)
      const isFirstCancellation = !current.pausedAt;
      
      if (isFirstCancellation) {
        // Never paused: activeSeconds is the total time
        finalDuration = activeSeconds;
      } else {
        // Was paused before: add activeSeconds to accumulated duration
        finalDuration = (current.duration || 0) + activeSeconds;
      }
    } else if (current.status === 'paused') {
      // Session is paused - duration already contains accumulated time
      finalDuration = current.duration || 0;
    } else {
      // Fallback for other statuses
      finalDuration = current.duration || 0;
    }

    // Update session with cancelled status and actual elapsed duration
    const updated = await db
      .update(studySession)
      .set({
        status: "cancelled",
        endTime: now,
        duration: finalDuration, // Save the actual time spent
        updatedAt: now,
      })
      .where(
        and(
          eq(studySession.id, sessionId),
          eq(studySession.userId, userId)
        )
      )
      .returning();

    if (updated.length === 0) {
      return { success: false, error: "Session not found" };
    }

    return {
      success: true,
      session: updated[0] as TimerSession,
    };
  } catch (error) {
    console.error("Error cancelling timer session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel session",
    };
  }
}

/**
 * Get active session for current user
 */
export async function getActiveSession(): Promise<StartSessionResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    const activeSession = await db
      .select()
      .from(studySession)
      .where(
        and(
          eq(studySession.userId, userId),
          eq(studySession.status, "active")
        )
      )
      .limit(1);

    if (activeSession.length === 0) {
      return { success: true, session: undefined };
    }

    return {
      success: true,
      session: activeSession[0] as TimerSession,
    };
  } catch (error) {
    console.error("Error getting active session:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get active session",
    };
  }
}

/**
 * Get user's subjects for dropdown
 */
export async function getUserSubjects() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const subjects = await db
      .select()
      .from(subject)
      .where(eq(subject.userId, session.user.id))
      .orderBy(desc(subject.createdAt));

    return {
      success: true,
      subjects,
    };
  } catch (error) {
    console.error("Error getting subjects:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get subjects",
    };
  }
}

/**
 * Increment pomodoro count
 */
export async function incrementPomodoroCount(
  sessionId: string
): Promise<StartSessionResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Get current count
    const existingSession = await db
      .select()
      .from(studySession)
      .where(
        and(
          eq(studySession.id, sessionId),
          eq(studySession.userId, userId)
        )
      )
      .limit(1);

    if (existingSession.length === 0) {
      return { success: false, error: "Session not found" };
    }

    const newCount = (existingSession[0].pomodoroCount || 0) + 1;

    // Update count
    const updated = await db
      .update(studySession)
      .set({
        pomodoroCount: newCount,
        updatedAt: new Date(),
      })
      .where(eq(studySession.id, sessionId))
      .returning();

    return {
      success: true,
      session: updated[0] as TimerSession,
    };
  } catch (error) {
    console.error("Error incrementing pomodoro count:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to increment pomodoro count",
    };
  }
}

/**
 * Get resumable sessions (paused within last 30 minutes)
 */
export async function getResumableSessions() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

    const resumableSessions = await db
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
        pomodoroCount: studySession.pomodoroCount,
        isBreak: studySession.isBreak,
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
          gte(studySession.pausedAt, thirtyMinsAgo)
        )
      )
      .orderBy(desc(studySession.pausedAt));

    return { success: true, data: resumableSessions };
  } catch (error) {
    console.error("Error getting resumable sessions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get resumable sessions",
    };
  }
}

/**
 * Auto-cancel expired paused sessions (older than 1 day)
 */
export async function autoCancelExpiredSessions() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const expiredSessions = await db
      .update(studySession)
      .set({
        status: "cancelled",
        canResume: false,
        autoCompleteReason: "expired_paused",
        endTime: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(studySession.userId, userId),
          eq(studySession.status, "paused"),
          lt(studySession.pausedAt, oneDayAgo)
        )
      )
      .returning();

    return { 
      success: true, 
      data: expiredSessions,
      cancelledCount: expiredSessions.length 
    };
  } catch (error) {
    console.error("Error auto-cancelling expired sessions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to auto-cancel expired sessions",
    };
  }
}
