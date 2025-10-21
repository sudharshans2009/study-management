"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Hook to prevent navigation when a condition is met (e.g., timer is running)
 * Shows confirmation dialog before allowing user to leave the page
 * 
 * @param shouldPrevent - Boolean to determine if navigation should be prevented
 * @param message - Custom message to show in confirmation dialog
 */
export function usePreventNavigation(
  shouldPrevent: boolean,
  message: string = "You have an active timer. Leaving will pause it. Continue?"
) {
  const pathname = usePathname();

  useEffect(() => {
    if (!shouldPrevent) return;

    // Handle back/forward browser buttons (popstate)
    const handlePopState = () => {
      const confirmLeave = window.confirm(message);
      
      if (!confirmLeave) {
        // Prevent navigation by pushing current path back
        window.history.pushState(null, "", pathname);
      }
    };

    // Push current state to enable detection
    window.history.pushState(null, "", pathname);

    // Listen for popstate events
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [shouldPrevent, pathname, message]);
}
