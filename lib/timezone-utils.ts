import { toZonedTime, formatInTimeZone } from "date-fns-tz";

/**
 * Common IANA timezone identifiers with labels and offsets
 */
export const TIMEZONES = [
  { value: "UTC", label: "UTC (GMT+0:00)", offset: "+00:00" },
  { value: "Asia/Kolkata", label: "India Standard Time (GMT+5:30)", offset: "+05:30" },
  { value: "America/New_York", label: "Eastern Time (GMT-5:00/-4:00)", offset: "-05:00" },
  { value: "America/Chicago", label: "Central Time (GMT-6:00/-5:00)", offset: "-06:00" },
  { value: "America/Denver", label: "Mountain Time (GMT-7:00/-6:00)", offset: "-07:00" },
  { value: "America/Los_Angeles", label: "Pacific Time (GMT-8:00/-7:00)", offset: "-08:00" },
  { value: "Europe/London", label: "London (GMT+0:00/+1:00)", offset: "+00:00" },
  { value: "Europe/Paris", label: "Paris (GMT+1:00/+2:00)", offset: "+01:00" },
  { value: "Europe/Berlin", label: "Berlin (GMT+1:00/+2:00)", offset: "+01:00" },
  { value: "Asia/Dubai", label: "Dubai (GMT+4:00)", offset: "+04:00" },
  { value: "Asia/Shanghai", label: "China Standard Time (GMT+8:00)", offset: "+08:00" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (GMT+9:00)", offset: "+09:00" },
  { value: "Australia/Sydney", label: "Sydney (GMT+10:00/+11:00)", offset: "+10:00" },
  { value: "Pacific/Auckland", label: "New Zealand (GMT+12:00/+13:00)", offset: "+12:00" },
] as const;

/**
 * Get current time in user's timezone
 */
export function getUserTime(timezone: string): Date {
  return toZonedTime(new Date(), timezone);
}

/**
 * Get midnight (00:00:00) in user's timezone for today
 */
export function getUserMidnightToday(timezone: string): Date {
  const userTime = getUserTime(timezone);
  userTime.setHours(0, 0, 0, 0);
  return userTime;
}

/**
 * Get midnight (00:00:00) in user's timezone for tomorrow
 */
export function getUserMidnightTomorrow(timezone: string): Date {
  const midnight = getUserMidnightToday(timezone);
  midnight.setDate(midnight.getDate() + 1);
  return midnight;
}

/**
 * Check if current UTC time exactly matches user's midnight
 * Only triggers at exactly midnight hour (0) and minute 0 or 30
 * 
 * With cron running every 30 minutes, this ensures precise resets
 */
export function isAtUserMidnight(timezone: string): boolean {
  const now = new Date();
  const userTime = toZonedTime(now, timezone);
  
  const hour = userTime.getHours();
  const minute = userTime.getMinutes();
  
  // Only trigger at exactly midnight (hour 0) with minute 0 or 30
  // This matches the cron schedule running at :00 and :30
  return hour === 0 && (minute === 0 || minute === 30);
}

/**
 * @deprecated Use isAtUserMidnight instead for exact matching
 * Legacy function kept for backwards compatibility
 */
export function isNearUserMidnight(timezone: string): boolean {
  return isAtUserMidnight(timezone);
}

/**
 * Format date in user's timezone
 */
export function formatUserDate(
  date: Date,
  timezone: string,
  formatStr: string
): string {
  return formatInTimeZone(date, timezone, formatStr);
}

/**
 * Get user's current hour (0-23) in their timezone
 */
export function getUserHour(timezone: string): number {
  const userTime = getUserTime(timezone);
  return userTime.getHours();
}

/**
 * Get user's current date components in their timezone
 */
export function getUserDateComponents(timezone: string) {
  const userTime = getUserTime(timezone);
  return {
    year: userTime.getFullYear(),
    month: userTime.getMonth(),
    day: userTime.getDate(),
    hour: userTime.getHours(),
    minute: userTime.getMinutes(),
    second: userTime.getSeconds(),
  };
}

/**
 * Detect browser timezone
 * Used for auto-detecting user's timezone during signup
 */
export function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "Asia/Kolkata"; // Fallback to India
  }
}

/**
 * Validate if a timezone string is valid
 */
export function isValidTimezone(timezone: string): boolean {
  return TIMEZONES.some((tz) => tz.value === timezone);
}

/**
 * Get timezone label from value
 */
export function getTimezoneLabel(timezone: string): string {
  const tz = TIMEZONES.find((t) => t.value === timezone);
  return tz ? tz.label : timezone;
}
