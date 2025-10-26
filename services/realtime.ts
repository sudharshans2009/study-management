import { Realtime, type InferRealtimeEvents } from "@upstash/realtime";
import { redis } from "./redis";
import { z } from "zod";

/**
 * Realtime event schema
 * Define all realtime events that can be emitted across the application
 */
const realtimeEvents = {
  // Session updates
  sessionStarted: {
    userId: z.string(),
    sessionId: z.string(),
    subjectId: z.string().optional(),
    timestamp: z.number(),
  },
  sessionCompleted: {
    userId: z.string(),
    sessionId: z.string(),
    duration: z.number(),
    timestamp: z.number(),
  },
  sessionPaused: {
    userId: z.string(),
    sessionId: z.string(),
    timestamp: z.number(),
  },

  // Goal updates
  goalProgress: {
    userId: z.string(),
    goalId: z.string(),
    progress: z.number(),
    target: z.number(),
    timestamp: z.number(),
  },
  goalCompleted: {
    userId: z.string(),
    goalId: z.string(),
    title: z.string(),
    timestamp: z.number(),
  },
  goalStreak: {
    userId: z.string(),
    goalId: z.string(),
    streak: z.number(),
    timestamp: z.number(),
  },

  // Leaderboard updates
  leaderboardRankChange: {
    userId: z.string(),
    metric: z.string(),
    oldRank: z.number().optional(),
    newRank: z.number(),
    score: z.number(),
    timestamp: z.number(),
  },
  leaderboardUpdated: {
    metric: z.string(),
    period: z.string(),
    timestamp: z.number(),
  },

  // Notifications
  notificationInfo: {
    userId: z.string(),
    message: z.string(),
    timestamp: z.number(),
  },
  notificationSuccess: {
    userId: z.string(),
    message: z.string(),
    timestamp: z.number(),
  },
  notificationWarning: {
    userId: z.string(),
    message: z.string(),
    timestamp: z.number(),
  },

  // Global updates
  globalUpdateStarted: {
    triggeredBy: z.string(),
    timestamp: z.number(),
  },
  globalUpdateCompleted: {
    processedUsers: z.number(),
    timestamp: z.number(),
  },
};

export const realtime = new Realtime({ events: realtimeEvents, redis });
export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;
