import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  isWithinInterval,
} from "date-fns";

export type PeriodType = "daily" | "weekly" | "monthly";

export interface PeriodWindow {
  start: Date;
  end: Date;
}

/**
 * Get the current period window based on period type and optional start date
 * @param periodType - The type of period (daily, weekly, monthly)
 * @param referenceDate - Optional reference date to calculate window from (defaults to now)
 * @returns An object with start and end dates for the current period
 */
export function getCurrentPeriodWindow(
  periodType: PeriodType,
  referenceDate: Date = new Date()
): PeriodWindow {
  const now = referenceDate;

  switch (periodType) {
    case "daily":
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };

    case "weekly":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };

    case "monthly":
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
  }
}

/**
 * Get the start date of the next period
 * @param periodType - The type of period (daily, weekly, monthly)
 * @param currentPeriodStart - The start date of the current period
 * @returns The start date of the next period
 */
export function getNextPeriodStart(
  periodType: PeriodType,
  currentPeriodStart: Date
): Date {
  switch (periodType) {
    case "daily":
      return addDays(startOfDay(currentPeriodStart), 1);

    case "weekly":
      return addWeeks(startOfWeek(currentPeriodStart, { weekStartsOn: 1 }), 1);

    case "monthly":
      return addMonths(startOfMonth(currentPeriodStart), 1);
  }
}

/**
 * Check if a given date is within the current period
 * @param date - The date to check
 * @param periodType - The type of period (daily, weekly, monthly)
 * @param currentPeriodStart - The start date of the current period
 * @returns True if the date is within the current period, false otherwise
 */
export function isInCurrentPeriod(
  date: Date,
  periodType: PeriodType,
  currentPeriodStart: Date
): boolean {
  const window = getCurrentPeriodWindow(periodType, currentPeriodStart);
  return isWithinInterval(date, { start: window.start, end: window.end });
}

/**
 * Check if the current period has ended
 * @param periodType - The type of period (daily, weekly, monthly)
 * @param currentPeriodStart - The start date of the current period
 * @returns True if the current period has ended, false otherwise
 */
export function hasCurrentPeriodEnded(
  periodType: PeriodType,
  currentPeriodStart: Date
): boolean {
  const window = getCurrentPeriodWindow(periodType, currentPeriodStart);
  const now = new Date();
  return now > window.end;
}

/**
 * Calculate how many complete periods have passed since a start date
 * @param startDate - The start date
 * @param periodType - The type of period (daily, weekly, monthly)
 * @param endDate - Optional end date (defaults to now)
 * @returns The number of complete periods
 */
export function calculateCompletePeriods(
  startDate: Date,
  periodType: PeriodType,
  endDate: Date = new Date()
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let count = 0;
  let currentPeriodStart = start;

  while (true) {
    const window = getCurrentPeriodWindow(periodType, currentPeriodStart);

    // If the end of this period is after our end date, stop counting
    if (window.end > end) {
      break;
    }

    count++;
    currentPeriodStart = getNextPeriodStart(periodType, currentPeriodStart);
  }

  return count;
}
