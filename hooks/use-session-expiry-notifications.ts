"use client";

import { useEffect, useRef } from "react";
import { getRecentPausedSessions } from "@/actions/session-actions";
import { toast } from "sonner";

/**
 * Hook to show browser notifications when paused sessions are about to expire (23 hours after pause)
 * Checks every 10 minutes
 */
export function useSessionExpiryNotifications() {
  const notifiedSessionsRef = useRef<Set<string>>(new Set());
  const notificationPermissionRef = useRef<NotificationPermission>("default");

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        notificationPermissionRef.current = permission;
      });
    } else if ("Notification" in window) {
      notificationPermissionRef.current = Notification.permission;
    }

    const checkExpiringSessions = async () => {
      try {
        const result = await getRecentPausedSessions();
        
        if (result.success && result.sessions) {
          const now = new Date().getTime();
          const twentyThreeHours = 23 * 60 * 60 * 1000;
          const oneHour = 60 * 60 * 1000;
          
          for (const session of result.sessions) {
            if (!session.pausedAt || notifiedSessionsRef.current.has(session.id)) {
              continue;
            }
            
            const pausedTime = new Date(session.pausedAt).getTime();
            const timeSincePause = now - pausedTime;
            
            // Notify if session has been paused for 23+ hours (1 hour until expiry)
            if (timeSincePause >= twentyThreeHours && timeSincePause < twentyThreeHours + oneHour) {
              notifiedSessionsRef.current.add(session.id);
              
              // Show toast notification
              toast.warning("Session expiring soon!", {
                description: `Your ${session.type} session ${session.subject ? `for ${session.subject.name} ` : ""}will be auto-cancelled in 1 hour.`,
                action: {
                  label: "Resume",
                  onClick: () => {
                    window.location.href = "/timer";
                  },
                },
                duration: 10000,
              });
              
              // Show browser notification if permitted
              if (
                "Notification" in window &&
                notificationPermissionRef.current === "granted"
              ) {
                const notification = new Notification("Study Session Expiring Soon", {
                  body: `Your ${session.type} session will be auto-cancelled in 1 hour. Click to resume.`,
                  icon: "/favicon.ico",
                  tag: `session-expiry-${session.id}`,
                  requireInteraction: true,
                });
                
                notification.onclick = () => {
                  window.focus();
                  window.location.href = "/timer";
                  notification.close();
                };
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking expiring sessions:", error);
      }
    };

    // Check immediately
    checkExpiringSessions();

    // Check every 10 minutes
    const interval = setInterval(checkExpiringSessions, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
