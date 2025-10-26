"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth/client";
import {
  processGlobalLazyUpdates,
  shouldRunGlobalUpdates,
} from "@/actions/global-update-actions";
import { useQueryClient } from "@tanstack/react-query";

/**
 * GlobalUpdateProvider
 * Triggers global lazy updates when user logs in
 * Throttled to once per 5 minutes
 */
export function GlobalUpdateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const lastUpdateRef = useRef<number>(0);
  const processingRef = useRef<boolean>(false);

  useEffect(() => {
    // Only run if user is logged in
    if (!session?.user?.id) return;

    // Check if we should run updates (throttle to every 5 minutes)
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - lastUpdateRef.current < fiveMinutes) {
      return;
    }

    // Prevent concurrent executions
    if (processingRef.current) {
      return;
    }

    processingRef.current = true;

    const runUpdates = async () => {
      try {
        // Check if updates are needed
        const needsUpdate = await shouldRunGlobalUpdates();

        if (!needsUpdate) {
          return;
        }

        // Process global updates
        const result = await processGlobalLazyUpdates(session.user.id);

        if (result.success && result.processedUsers > 0) {
          console.log(
            `Global updates completed: ${result.processedUsers} users updated`
          );

          // Invalidate relevant queries to refetch data
          await queryClient.invalidateQueries({ queryKey: ["goals"] });
          await queryClient.invalidateQueries({ queryKey: ["leaderboards"] });
          await queryClient.invalidateQueries({ queryKey: ["profile"] });
          await queryClient.invalidateQueries({ queryKey: ["streaks"] });
        }

        lastUpdateRef.current = now;
      } catch (error) {
        console.error("Failed to run global updates:", error);
      } finally {
        processingRef.current = false;
      }
    };

    runUpdates();
  }, [session?.user?.id, queryClient]);

  return <>{children}</>;
}
