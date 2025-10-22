import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  onboardingStatus: text("onboarding_status", {
    enum: ["pending_verification", "pending_setup", "completed"],
  })
    .default("pending_verification")
    .notNull(),
  timezone: text("timezone").default("Asia/Kolkata").notNull(), // User's timezone for goal resets
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Profile table
export const profile = pgTable("profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  bio: text("bio"),
  username: text("username").unique(),
  socialLinks: text("social_links"), // JSON string array of social links
  dailyGoalMinutes: integer("daily_goal_minutes").default(120).notNull(),
  setupCompleted: boolean("setup_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Subject table
export const subject = pgTable("subject", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Study session table
export const studySession = pgTable("study_session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  subjectId: text("subject_id").references(() => subject.id, {
    onDelete: "set null",
  }),
  
  // Timer data (UTC timestamps)
  startTime: timestamp("start_time", { mode: "date", withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { mode: "date", withTimezone: true }),
  duration: integer("duration").notNull().default(0), // Duration in seconds
  
  // Session type and status
  type: text("type", { enum: ["timer", "pomodoro", "stopwatch"] })
    .notNull()
    .default("timer"),
  status: text("status", { enum: ["active", "paused", "completed", "cancelled"] })
    .notNull()
    .default("active"),
  
  // Resumption tracking
  pausedAt: timestamp("paused_at", { mode: "date", withTimezone: true }), // When session was paused
  lastResumedAt: timestamp("last_resumed_at", { mode: "date", withTimezone: true }), // Last resume time
  canResume: boolean("can_resume").default(true), // Whether session can be resumed
  autoCompleteReason: text("auto_complete_reason"), // Why it was auto-completed (e.g., "expired")
  progressPercentage: integer("progress_percentage").default(0), // % completed when paused
  remainingDuration: integer("remaining_duration"), // Seconds left when paused
  
  // Pomodoro specific
  pomodoroCount: integer("pomodoro_count").default(0), // Number of completed pomodoros
  isBreak: boolean("is_break").default(false), // Is this a break session?
  
  // Session metadata
  notes: text("notes"),
  focusScore: integer("focus_score"), // 1-5 rating of focus quality
  
  // Legacy fields (for backward compatibility)
  durationMinutes: integer("duration_minutes"), // Deprecated: use duration instead
  startedAt: timestamp("started_at"), // Deprecated: use startTime instead
  endedAt: timestamp("ended_at"), // Deprecated: use endTime instead
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Goal table - Phase 1: Schema & Basic CRUD
export const goal = pgTable("goal", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  
  // Goal type: study (overall) or subject (specific subject)
  category: text("category", { enum: ["study", "subject"] }).notNull(),
  
  // Time period: daily, weekly, monthly
  period: text("period", { enum: ["daily", "weekly", "monthly"] }).notNull(),
  
  // Unit of measurement: minutes or sessions
  unit: text("unit", { enum: ["minutes", "sessions"] }).notNull(),
  
  // Target value (minutes or session count)
  target: integer("target").notNull(),
  
  // Subject reference (required for subject goals, null for study goals)
  subjectId: text("subject_id").references(() => subject.id, {
    onDelete: "cascade",
  }),
  
  // Status tracking
  status: text("status", { enum: ["active", "completed", "archived"] })
    .default("active")
    .notNull(),
  
  // Lifecycle management (Phase 2)
  startDate: timestamp("start_date", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(), // When tracking started
  endDate: timestamp("end_date", { mode: "date", withTimezone: true }), // When tracking ended (null = still active)
  endReason: text("end_reason", { enum: ["completed", "archived"] }), // Why tracking ended
  
  // Period tracking (Phase 2)
  currentPeriodStart: timestamp("current_period_start", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(), // Start of current tracking window
  lastResetAt: timestamp("last_reset_at", { mode: "date", withTimezone: true }), // Last time progress was reset
  
  // Progress metadata (Phase 2)
  totalPeriodsCompleted: integer("total_periods_completed").default(0).notNull(), // How many periods user completed this goal
  currentStreak: integer("current_streak").default(0).notNull(), // Consecutive periods completed
  longestStreak: integer("longest_streak").default(0).notNull(), // Best streak achieved
  
  // Legacy fields (deprecated - keep for backward compatibility)
  startAt: timestamp("start_at", { mode: "date", withTimezone: true }),
  endAt: timestamp("end_at", { mode: "date", withTimezone: true }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Goal progress table - tracks individual session contributions
export const goalProgress = pgTable("goal_progress", {
  id: text("id").primaryKey(),
  goalId: text("goal_id")
    .notNull()
    .references(() => goal.id, { onDelete: "cascade" }),
  sessionId: text("session_id").references(() => studySession.id, {
    onDelete: "cascade",
  }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  // Progress values
  minutes: integer("minutes").default(0).notNull(),
  count: integer("count").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
