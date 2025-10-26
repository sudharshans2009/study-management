import { db } from "@/database/drizzle";
import { user, studySession, goal, goalProgress, globalUpdate } from "@/database/schema";
import { eq, and, between, gte, lt, desc, sql } from "drizzle-orm";

/**
 * Get the user's local midnight for a given date
 */
export function getUserLocalMidnight(date: Date, timezone: string): Date {
  // Format: "2024-01-15 00:00:00" in user's timezone
  const dateStr = date.toLocaleDateString("en-CA", { timeZone: timezone }); // YYYY-MM-DD
  const midnightStr = `${dateStr} 00:00:00`;
  
  // Parse as if it's in the user's timezone, convert to UTC
  const localMidnight = new Date(
    new Date(midnightStr + " UTC").toLocaleString("en-US", { timeZone: timezone })
  );
  
  // Create date in user's timezone at midnight
  const year = parseInt(dateStr.split("-")[0]);
  const month = parseInt(dateStr.split("-")[1]) - 1;
  const day = parseInt(dateStr.split("-")[2]);
  
  // Get UTC timestamp for this local midnight
  const utcTimestamp = new Date(
    Date.UTC(year, month, day) - 
    (new Date(Date.UTC(year, month, day, 12)).getTimezoneOffset() * 60000)
  );
  
  return new Date(dateStr + "T00:00:00.000Z");
}

/**
 * Get all midnights between two dates in a user's timezone
 */
export function getMidnightsBetween(
  start: Date,
  end: Date,
  timezone: string
): Date[] {
  const midnights: Date[] = [];
  let current = new Date(start);
  
  while (current < end) {
    const midnight = getUserLocalMidnight(current, timezone);
    if (midnight > start && midnight <= end) {
      midnights.push(midnight);
    }
    // Move to next day
    current.setDate(current.getDate() + 1);
  }
  
  return midnights;
}

/**
 * Check if user had any study session on a specific date (in their timezone)
 */
export async function hasSessionOnDate(
  userId: string,
  date: Date,
  timezone: string
): Promise<boolean> {
  // Get the user's local day boundaries
  const dayStart = getUserLocalMidnight(date, timezone);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  
  const sessions = await db
    .select({ id: studySession.id })
    .from(studySession)
    .where(
      and(
        eq(studySession.userId, userId),
        gte(studySession.startedAt, dayStart),
        lt(studySession.startedAt, dayEnd),
        eq(studySession.status, "completed")
      )
    )
    .limit(1);
  
  return sessions.length > 0;
}

/**
 * Calculate user's streak up to a specific date
 */
export async function calculateStreakUpToDate(
  userId: string,
  upToDate: Date,
  timezone: string
): Promise<number> {
  let streak = 0;
  let checkDate = new Date(upToDate);
  
  // Go backwards from the target date
  while (true) {
    const hadSession = await hasSessionOnDate(userId, checkDate, timezone);
    
    if (hadSession) {
      streak++;
      // Check previous day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Streak broken
      break;
    }
    
    // Safety limit: don't check more than 365 days
    if (streak >= 365) break;
  }
  
  return streak;
}

/**
 * Update a user's streak for a specific date
 * Note: This updates goal streaks, not a global user streak
 */
export async function updateGoalStreaksForDate(
  userId: string,
  date: Date,
  timezone: string
): Promise<void> {
  // Get all active goals for this user
  const activeGoals = await db
    .select()
    .from(goal)
    .where(
      and(
        eq(goal.userId, userId),
        eq(goal.status, "active")
      )
    );
  
  for (const userGoal of activeGoals) {
    // Check if goal was completed on this date
    const dayStart = getUserLocalMidnight(date, timezone);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    
    // Get progress for this goal on this date
    const progress = await db
      .select()
      .from(goalProgress)
      .where(
        and(
          eq(goalProgress.goalId, userGoal.id),
          gte(goalProgress.createdAt, dayStart),
          lt(goalProgress.createdAt, dayEnd)
        )
      );
    
    const totalMinutes = progress.reduce((sum, p) => sum + (p.minutes || 0), 0);
    const totalCount = progress.reduce((sum, p) => sum + (p.count || 0), 0);
    
    // Check if goal was completed on this day
    const completedToday =
      (userGoal.unit === "minutes" && totalMinutes >= userGoal.target) ||
      (userGoal.unit === "sessions" && totalCount >= userGoal.target);
    
    // Get yesterday's completion status
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = getUserLocalMidnight(yesterday, timezone);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);
    
    const yesterdayProgress = await db
      .select()
      .from(goalProgress)
      .where(
        and(
          eq(goalProgress.goalId, userGoal.id),
          gte(goalProgress.createdAt, yesterdayStart),
          lt(goalProgress.createdAt, yesterdayEnd)
        )
      );
    
    const yesterdayMinutes = yesterdayProgress.reduce((sum, p) => sum + (p.minutes || 0), 0);
    const yesterdayCount = yesterdayProgress.reduce((sum, p) => sum + (p.count || 0), 0);
    
    const completedYesterday =
      (userGoal.unit === "minutes" && yesterdayMinutes >= userGoal.target) ||
      (userGoal.unit === "sessions" && yesterdayCount >= userGoal.target);
    
    let newStreak = userGoal.currentStreak || 0;
    let newLongestStreak = userGoal.longestStreak || 0;
    
    if (completedToday) {
      // If completed yesterday, increment streak
      if (completedYesterday) {
        newStreak = newStreak + 1;
      } else {
        // New streak starts
        newStreak = 1;
      }
      
      // Update longest streak if needed
      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
      }
    } else {
      // Not completed today
      if (!completedYesterday) {
        // Streak broken
        newStreak = 0;
      }
      // If completed yesterday but not today, keep current streak (grace period)
    }
    
    // Update goal streak
    await db
      .update(goal)
      .set({
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        updatedAt: new Date(),
      })
      .where(eq(goal.id, userGoal.id));
  }
}

/**
 * Reset goals for a user if their goal period has ended
 */
export async function resetGoalsForUser(
  userId: string,
  currentDate: Date,
  timezone: string
): Promise<void> {
  // Get all active goals for this user
  const activeGoals = await db
    .select()
    .from(goal)
    .where(
      and(
        eq(goal.userId, userId),
        eq(goal.status, "active")
      )
    );
  
  for (const userGoal of activeGoals) {
    const endDate = userGoal.endDate;
    if (!endDate) continue;
    
    // Check if goal period ended (in user's timezone)
    const goalEndMidnight = getUserLocalMidnight(endDate, timezone);
    
    if (currentDate >= goalEndMidnight) {
      // Goal period ended - mark as completed or archived
      const progress = await db
        .select()
        .from(goalProgress)
        .where(eq(goalProgress.goalId, userGoal.id));
      
      const totalMinutes = progress.reduce((sum, p) => sum + (p.minutes || 0), 0);
      const totalCount = progress.reduce((sum, p) => sum + (p.count || 0), 0);
      
      const isCompleted =
        (userGoal.unit === "minutes" && totalMinutes >= userGoal.target) ||
        (userGoal.unit === "sessions" && totalCount >= userGoal.target);
      
      await db
        .update(goal)
        .set({
          status: isCompleted ? "completed" : "archived",
          updatedAt: new Date(),
        })
        .where(eq(goal.id, userGoal.id));
    }
  }
}

/**
 * Get all users that need updates
 * Returns users whose lastLocalMidnight is before current midnight in their timezone
 */
export async function getUsersNeedingUpdates(): Promise<
  Array<{
    id: string;
    timezone: string;
    lastLocalMidnight: Date | null;
    lastActivityAt: Date | null;
  }>
> {
  const now = new Date();
  const allUsers = await db
    .select({
      id: user.id,
      timezone: user.timezone,
      lastLocalMidnight: user.lastLocalMidnight,
      lastActivityAt: user.lastActivityAt,
    })
    .from(user);
  
  const usersNeedingUpdate = [];
  
  for (const u of allUsers) {
    const userTimezone = u.timezone || "UTC";
    const currentMidnight = getUserLocalMidnight(now, userTimezone);
    
    // If lastLocalMidnight is null or before current midnight, needs update
    if (!u.lastLocalMidnight || u.lastLocalMidnight < currentMidnight) {
      usersNeedingUpdate.push(u);
    }
  }
  
  return usersNeedingUpdate;
}

/**
 * Process updates for a single user between two dates
 */
export async function processUserUpdates(
  userId: string,
  timezone: string,
  fromDate: Date,
  toDate: Date
): Promise<void> {
  // Get all midnights between the dates
  const midnights = getMidnightsBetween(fromDate, toDate, timezone);
  
  // Process each midnight
  for (const midnight of midnights) {
    // Update goal streaks for this day
    await updateGoalStreaksForDate(userId, midnight, timezone);
    
    // Reset goals if needed
    await resetGoalsForUser(userId, midnight, timezone);
  }
  
  // Update the user's lastLocalMidnight
  const currentMidnight = getUserLocalMidnight(toDate, timezone);
  await db
    .update(user)
    .set({
      lastLocalMidnight: currentMidnight,
      lastActivityAt: toDate,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));
}
