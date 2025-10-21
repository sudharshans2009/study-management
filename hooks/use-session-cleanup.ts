"use client";

import { useEffect } from "react";
import { autoCancelExpiredSessions } from "@/actions/timer-actions";
import { toast } from "sonner";

/**
 * Hook to automatically cancel sessions that have been paused for more than 24 hours
 * Runs on component mount and then every 5 minutes
 */
export function useSessionCleanup() {
  useEffect(() => {
    const runCleanup = async () => {
      try {
        const result = await autoCancelExpiredSessions();
        
        if (result.success && result.cancelledCount && result.cancelledCount > 0) {
          toast.info(
            `${result.cancelledCount} paused session${result.cancelledCount > 1 ? "s" : ""} automatically cancelled`,
            {
              description: "Sessions paused for more than 24 hours are cancelled to keep your history clean.",
            }
          );
        }
      } catch (error) {
        console.error("Error running session cleanup:", error);
      }
    };

    // Run immediately on mount
    runCleanup();

    // Run every 5 minutes
    const interval = setInterval(runCleanup, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
