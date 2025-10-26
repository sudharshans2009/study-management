import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  eachDayOfInterval, 
  eachMonthOfInterval,
  format 
} from 'date-fns';

export type StatsPeriod = 'week' | 'month' | 'year' | 'all-time';

export interface StudyStats {
  // Time stats
  totalMinutes: number;
  totalSessions: number;
  averageSessionLength: number;
  
  // Goal stats
  dailyGoalProgress: number; // percentage
  goalsCompleted: number;
  goalsActive: number;
  currentStreak: number;
  longestStreak: number;
  
  // Subject stats
  subjectBreakdown: Array<{
    subjectId: string;
    subjectName: string;
    subjectColor: string;
    minutes: number;
    sessions: number;
    percentage: number;
  }>;
  
  // Time distribution
  timeDistribution: Array<{
    date: string;
    minutes: number;
    sessions: number;
  }>;
  
  // Session types
  sessionTypeBreakdown: Array<{
    type: string;
    count: number;
    minutes: number;
    percentage: number;
  }>;
  
  // Focus score
  averageFocusScore: number;
  focusScoreDistribution: Array<{
    range: string;
    count: number;
  }>;
  
  // Productivity insights
  mostProductiveDay: string;
  mostProductiveHour: number;
  averageSessionsPerDay: number;
}

/**
 * Get date range for a period
 */
export function getDateRangeForPeriod(period: StatsPeriod): {
  start: Date;
  end: Date;
} {
  const now = new Date();
  
  switch (period) {
    case 'week':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case 'month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    case 'year':
      return {
        start: startOfYear(now),
        end: endOfYear(now),
      };
    case 'all-time':
      return {
        start: new Date(2020, 0, 1),
        end: now,
      };
  }
}

/**
 * Generate time series data for charting
 */
export function generateTimeSeriesData(
  period: StatsPeriod,
  start: Date,
  end: Date
): Array<{ date: string; minutes: number; sessions: number }> {
  let intervals: Date[];
  
  switch (period) {
    case 'week':
      intervals = eachDayOfInterval({ start, end });
      break;
    case 'month':
      intervals = eachDayOfInterval({ start, end });
      break;
    case 'year':
      intervals = eachMonthOfInterval({ start, end });
      break;
    case 'all-time':
      intervals = eachMonthOfInterval({ start, end });
      break;
  }
  
  return intervals.map(date => ({
    date: format(date, period === 'week' || period === 'month' ? 'MMM d' : 'MMM yyyy'),
    minutes: 0,
    sessions: 0,
  }));
}

/**
 * Calculate most productive day of week
 */
export function getMostProductiveDay(
  sessions: Array<{ startedAt: Date; duration: number }>
): string {
  if (sessions.length === 0) return 'N/A';
  
  const dayTotals: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };
  
  sessions.forEach(session => {
    const day = format(session.startedAt, 'EEEE');
    dayTotals[day] += session.duration;
  });
  
  const entries = Object.entries(dayTotals);
  if (entries.length === 0) return 'N/A';
  
  return entries.reduce((a, b) => b[1] > a[1] ? b : a)[0];
}

/**
 * Calculate most productive hour
 */
export function getMostProductiveHour(
  sessions: Array<{ startedAt: Date; duration: number }>
): number {
  if (sessions.length === 0) return 0;
  
  const hourTotals: Record<number, number> = {};
  
  for (let i = 0; i < 24; i++) {
    hourTotals[i] = 0;
  }
  
  sessions.forEach(session => {
    const hour = session.startedAt.getHours();
    hourTotals[hour] += session.duration;
  });
  
  const entries = Object.entries(hourTotals);
  if (entries.length === 0) return 0;
  
  return parseInt(
    entries.reduce((a, b) => 
      parseInt(b[1].toString()) > parseInt(a[1].toString()) ? b : a
    )[0]
  );
}

/**
 * Calculate focus score distribution (scores are 0-5)
 */
export function getFocusScoreDistribution(
  sessions: Array<{ focusScore: number | null }>
): Array<{ range: string; count: number }> {
  const ranges = [
    { range: '0', value: 0, count: 0 },
    { range: '1', value: 1, count: 0 },
    { range: '2', value: 2, count: 0 },
    { range: '3', value: 3, count: 0 },
    { range: '4', value: 4, count: 0 },
    { range: '5', value: 5, count: 0 },
  ];
  
  sessions.forEach(session => {
    if (session.focusScore === null) return;
    
    // Round to nearest integer (0-5)
    const roundedScore = Math.round(session.focusScore);
    const range = ranges.find(r => r.value === roundedScore);
    
    if (range) {
      range.count++;
    }
  });
  
  return ranges.map(({ range, count }) => ({ range, count }));
}
