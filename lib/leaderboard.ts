export type LeaderboardPeriod = 'daily' | 'monthly' | 'yearly' | 'all-time';
export type LeaderboardMetric = 'composite' | 'study-time' | 'streak' | 'goals' | 'focus-score' | 'sessions';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  name: string;
  avatar?: string | null;
  rank: number;
  value: number; // The metric value (composite score or individual metric)
  compositeScore?: number; // Total weighted score out of 150
  breakdown?: {
    studyTimeScore: number; // out of 82.5 (55% of 150)
    streakScore: number; // out of 7.5 (5% of 150)
    goalsScore: number; // out of 22.5 (15% of 150)
    focusScore: number; // out of 7.5 (5% of 150)
    sessionsScore: number; // out of 30 (20% of 150)
  };
  rawMetrics?: {
    totalMinutes: number;
    currentStreak: number;
    goalsCompleted: number;
    avgFocusScore: number;
    sessionCount: number;
  };
  change?: number; // Rank change from previous period
  isCurrentUser?: boolean;
}

export interface LeaderboardStats {
  totalParticipants: number;
  averageScore: number;
  topPerformer: LeaderboardEntry | null;
  period: LeaderboardPeriod;
}

/**
 * Calculate composite score with weighted metrics and diminishing returns
 * Total: 150 points
 * - Study Time: 55% (82.5 points)
 * - Goals: 15% (22.5 points)
 * - Sessions: 20% (30 points)
 * - Streak: 5% (7.5 points)
 * - Focus Score: 5% (7.5 points)
 */
export function calculateCompositeScore(metrics: {
  totalMinutes: number;
  currentStreak: number;
  goalsCompleted: number;
  avgFocusScore: number;
  sessionCount: number;
}): {
  total: number;
  breakdown: {
    studyTimeScore: number;
    streakScore: number;
    goalsScore: number;
    focusScore: number;
    sessionsScore: number;
  };
} {
  // 1. Study Time Score (55% = 82.5 points)
  const studyTimeScore = calculateStudyTimeScore(metrics.totalMinutes);

  // 2. Streak Score (5% = 7.5 points)
  const streakScore = calculateStreakScore(metrics.currentStreak);

  // 3. Goals Score (15% = 22.5 points)
  const goalsScore = calculateGoalsScore(metrics.goalsCompleted);

  // 4. Focus Score (5% = 7.5 points)
  const focusScore = calculateFocusScore(
    metrics.avgFocusScore,
    metrics.sessionCount,
    metrics.totalMinutes
  );

  // 5. Sessions Score (20% = 30 points)
  const sessionsScore = calculateSessionsScore(
    metrics.sessionCount,
    metrics.totalMinutes
  );

  const total = Math.round(
    studyTimeScore + streakScore + goalsScore + focusScore + sessionsScore
  );

  return {
    total: Math.min(total, 150), // Cap at 150
    breakdown: {
      studyTimeScore: Math.round(studyTimeScore * 10) / 10,
      streakScore: Math.round(streakScore * 10) / 10,
      goalsScore: Math.round(goalsScore * 10) / 10,
      focusScore: Math.round(focusScore * 10) / 10,
      sessionsScore: Math.round(sessionsScore * 10) / 10,
    },
  };
}

/**
 * Calculate study time score with logarithmic scaling (max 82.5 points)
 */
function calculateStudyTimeScore(minutes: number): number {
  if (minutes <= 0) return 0;
  
  // Logarithmic formula: score = 82.5 * (1 - e^(-minutes/180))
  // 60 mins ≈ 23 pts, 120 mins ≈ 40 pts, 240 mins ≈ 60 pts, 480+ mins ≈ 82.5 pts
  const maxScore = 82.5;
  const scalingFactor = 180;
  
  const score = maxScore * (1 - Math.exp(-minutes / scalingFactor));
  return Math.min(score, maxScore);
}

/**
 * Calculate streak score (max 7.5 points)
 */
function calculateStreakScore(streak: number): number {
  if (streak <= 0) return 0;
  
  // Linear up to 7 days, then logarithmic
  const maxScore = 7.5;
  
  if (streak <= 7) {
    return (streak / 7) * (maxScore / 2);
  }
  
  // Logarithmic for streaks > 7 days
  const additionalDays = streak - 7;
  const additionalScore = (maxScore / 2) * (1 - Math.exp(-additionalDays / 15));
  
  return (maxScore / 2) + additionalScore;
}

/**
 * Calculate goals score (max 22.5 points)
 */
function calculateGoalsScore(goalsCompleted: number): number {
  if (goalsCompleted <= 0) return 0;
  
  // Linear with diminishing returns after 5 goals
  const maxScore = 22.5;
  const pointsPerGoal = 4.5;
  
  if (goalsCompleted <= 5) {
    return Math.min(goalsCompleted * pointsPerGoal, maxScore);
  }
  
  // Diminishing returns after 5 goals
  const baseScore = 5 * pointsPerGoal;
  const additionalGoals = goalsCompleted - 5;
  const additionalScore = Math.log(additionalGoals + 1) * 2;
  
  return Math.min(baseScore + additionalScore, maxScore);
}

/**
 * Calculate focus score with anti-gaming measures (max 7.5 points)
 */
function calculateFocusScore(
  avgFocusScore: number,
  sessionCount: number,
  totalMinutes: number
): number {
  if (avgFocusScore <= 0 || sessionCount === 0) return 0;
  
  const maxScore = 7.5;
  
  // Base score from focus rating (0-5 scale)
  const baseScore = (avgFocusScore / 5) * maxScore;
  
  // Penalty for too few sessions (need at least 3 sessions)
  let sessionPenalty = 1;
  if (sessionCount < 3) {
    sessionPenalty = sessionCount / 3;
  }
  
  // Penalty for too little study time (need at least 30 mins)
  let timePenalty = 1;
  if (totalMinutes < 30) {
    timePenalty = totalMinutes / 30;
  }
  
  return baseScore * sessionPenalty * timePenalty;
}

/**
 * Calculate sessions score with diminishing returns (max 30 points)
 */
function calculateSessionsScore(
  sessionCount: number,
  totalMinutes: number
): number {
  if (sessionCount <= 0) return 0;
  
  const maxScore = 30;
  
  // Calculate average session length
  const avgSessionLength = totalMinutes / sessionCount;
  
  // Base score from session count (logarithmic)
  const baseScore = maxScore * (1 - Math.exp(-sessionCount / 5));
  
  // Quality multiplier based on average session length
  let qualityMultiplier = 1;
  
  if (avgSessionLength < 10) {
    // Heavy penalty for micro-sessions
    qualityMultiplier = avgSessionLength / 10;
  } else if (avgSessionLength < 15) {
    // Moderate penalty
    qualityMultiplier = 0.7 + (avgSessionLength - 10) / 50;
  } else if (avgSessionLength > 120) {
    // Slight penalty for very long sessions
    qualityMultiplier = Math.max(0.85, 1 - (avgSessionLength - 120) / 480);
  }
  
  return baseScore * qualityMultiplier;
}

/**
 * Get date range for leaderboard period
 */
export function getLeaderboardDateRange(
  period: LeaderboardPeriod,
  timezone: string = 'UTC'
): {
  start: Date;
  end: Date;
} {
  const now = new Date();
  
  // Create date in user's timezone
  const nowInTimezone = new Date(
    now.toLocaleString('en-US', { timeZone: timezone })
  );
  
  switch (period) {
    case 'daily': {
      // Start of day in user's timezone
      const startOfDayLocal = new Date(nowInTimezone);
      startOfDayLocal.setHours(0, 0, 0, 0);
      
      // Convert back to UTC by calculating the offset
      const offset = nowInTimezone.getTime() - now.getTime();
      const start = new Date(startOfDayLocal.getTime() - offset);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
      
      return { start, end };
    }
    case 'monthly': {
      // Start of month in user's timezone
      const startOfMonthLocal = new Date(nowInTimezone);
      startOfMonthLocal.setDate(1);
      startOfMonthLocal.setHours(0, 0, 0, 0);
      
      const offset = nowInTimezone.getTime() - now.getTime();
      const monthStart = new Date(startOfMonthLocal.getTime() - offset);
      
      // End of month in user's timezone
      const endOfMonthLocal = new Date(nowInTimezone);
      endOfMonthLocal.setMonth(endOfMonthLocal.getMonth() + 1, 0);
      endOfMonthLocal.setHours(23, 59, 59, 999);
      const monthEnd = new Date(endOfMonthLocal.getTime() - offset);
      
      return { start: monthStart, end: monthEnd };
    }
    case 'yearly': {
      // Start of year in user's timezone
      const startOfYearLocal = new Date(nowInTimezone);
      startOfYearLocal.setMonth(0, 1);
      startOfYearLocal.setHours(0, 0, 0, 0);
      
      const offset = nowInTimezone.getTime() - now.getTime();
      const yearStart = new Date(startOfYearLocal.getTime() - offset);
      
      // End of year in user's timezone
      const endOfYearLocal = new Date(nowInTimezone);
      endOfYearLocal.setMonth(11, 31);
      endOfYearLocal.setHours(23, 59, 59, 999);
      const yearEnd = new Date(endOfYearLocal.getTime() - offset);
      
      return { start: yearStart, end: yearEnd };
    }
    case 'all-time':
      return {
        start: new Date(2020, 0, 1),
        end: now,
      };
  }
}

/**
 * Format leaderboard value based on metric
 */
export function formatLeaderboardValue(value: number, metric: LeaderboardMetric): string {
  switch (metric) {
    case 'composite':
      return `${value} pts`;
    case 'study-time':
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    case 'streak':
      return `${value} day${value !== 1 ? 's' : ''}`;
    case 'goals':
      return `${value} goal${value !== 1 ? 's' : ''}`;
    case 'focus-score':
      return `${value.toFixed(1)} / 5.0`;
    case 'sessions':
      return `${value} session${value !== 1 ? 's' : ''}`;
    default:
      return value.toString();
  }
}

/**
 * Get metric label
 */
export function getMetricLabel(metric: LeaderboardMetric): string {
  switch (metric) {
    case 'composite':
      return 'Overall Score';
    case 'study-time':
      return 'Study Time';
    case 'streak':
      return 'Current Streak';
    case 'goals':
      return 'Goals Completed';
    case 'focus-score':
      return 'Avg Focus Score';
    case 'sessions':
      return 'Study Sessions';
  }
}

/**
 * Get rank badge color
 */
export function getRankBadgeColor(rank: number): string {
  if (rank === 1) return 'from-yellow-400 to-yellow-600'; // Gold
  if (rank === 2) return 'from-gray-300 to-gray-500'; // Silver
  if (rank === 3) return 'from-orange-400 to-orange-600'; // Bronze
  return 'from-gray-200 to-gray-400';
}

/**
 * Get rank emoji
 */
export function getRankEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '🏅';
}

/**
 * Get period display name
 */
export function getPeriodDisplayName(period: LeaderboardPeriod): string {
  switch (period) {
    case 'daily':
      return 'Today';
    case 'monthly':
      return 'This Month';
    case 'yearly':
      return 'This Year';
    case 'all-time':
      return 'All Time';
  }
}
