"use client";

import { useEffect, useRef, useCallback } from "react";

// Message types for cross-tab timer synchronization
export type TimerSyncMessage =
  | { type: "TIMER_STARTED"; sessionId: string; duration: number; timestamp: number }
  | { type: "TIMER_PAUSED"; sessionId: string; timeLeft: number; timestamp: number }
  | { type: "TIMER_RESUMED"; sessionId: string; timestamp: number }
  | { type: "TIMER_STOPPED"; sessionId: string; timestamp: number }
  | { type: "TIMER_COMPLETED"; sessionId: string; timestamp: number };

/**
 * Hook to synchronize timer state across multiple tabs using BroadcastChannel API
 * Allows seamless timer experience when user has multiple tabs open
 */
export function useTimerSync(onSync: (message: TimerSyncMessage) => void) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // Check if BroadcastChannel is supported
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      console.warn("BroadcastChannel API not supported");
      return;
    }

    // Create broadcast channel for timer sync
    channelRef.current = new BroadcastChannel("ss-study-timer-sync");

    // Listen for messages from other tabs
    channelRef.current.onmessage = (event: MessageEvent<TimerSyncMessage>) => {
      console.log("Timer sync received:", event.data);
      onSync(event.data);
    };

    // Cleanup on unmount
    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [onSync]);

  // Broadcast message to all other tabs
  const broadcast = useCallback((message: TimerSyncMessage) => {
    if (channelRef.current) {
      console.log("Timer sync broadcasting:", message);
      channelRef.current.postMessage(message);
    }
  }, []);

  return { broadcast };
}
