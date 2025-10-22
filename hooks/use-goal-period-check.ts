"use client";

import { useEffect, useRef } from "react";
import { checkAndResetGoalPeriods } from "@/actions/goals-actions";
import { toast } from "sonner";

/**
 * Hook to check and reset goal periods on app mount and periodically
 * This serves as a backup to the cron job (timezone-aware)
 * 
 * Runs every 30 minutes to align with the cron job schedule. The actual reset logic
 * inside checkAndResetGoalPeriods() will only process goals if the user's local time
 * is exactly midnight (hour 0, minute 0 or 30).
 * 
 * With cron running every 30 minutes and checking for exact midnight match,
 * goals reset precisely when user's local time hits 00:00 or 00:30.
 * 
 * @param enabled - Whether to enable the check (default: true)
 * @param interval - Check interval in milliseconds (default: 30 minutes)
 */
export function useGoalPeriodCheck(
  enabled: boolean = true,
  interval: number = 30 * 60 * 1000 // 30 minutes (aligned with cron)
) {
  const hasCheckedOnMount = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const checkPeriods = async () => {
      try {
        const result = await checkAndResetGoalPeriods();

        if (result.success && result.data) {
          const data = result.data as {
            resetCount: number;
            usersProcessed: number;
            resets: Array<{
              goalTitle: string;
              periodCompleted: boolean;
              newStreak: number;
            }>;
          };

          // Show notifications for period resets
          if (data.resetCount > 0) {
            data.resets.forEach((reset) => {
              if (reset.periodCompleted) {
                toast.success(`🎉 Goal "${reset.goalTitle}" completed!`, {
                  description: `Current streak: ${reset.newStreak}`,
                });
              } else {
                toast.info(`⏰ Goal "${reset.goalTitle}" period reset`, {
                  description: "A new tracking period has started",
                });
              }
            });
          }
        }
      } catch (error) {
        console.error("Error checking goal periods:", error);
      }
    };

    // Check on mount (only once)
    if (!hasCheckedOnMount.current) {
      checkPeriods();
      hasCheckedOnMount.current = true;
    }

    // Set up interval
    const intervalId = setInterval(checkPeriods, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, interval]);
}
