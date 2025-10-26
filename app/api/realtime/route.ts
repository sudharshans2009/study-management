import { handle } from "@upstash/realtime";
import { realtime } from "@/services/realtime";

/**
 * Realtime SSE endpoint
 * Provides server-sent events for live updates
 * 
 * Usage in client components:
 * ```tsx
 * import { useRealtime } from "@upstash/realtime/react"
 * 
 * const { data, error } = useRealtime<RealtimeEvents>(userId, {
 *   url: "/api/realtime",
 *   history: 10 // Optional: get last 10 messages
 * })
 * 
 * useEffect(() => {
 *   if (data?.sessionCompleted) {
 *     // Handle session completed event
 *   }
 * }, [data])
 * ```
 */
export const GET = handle({ realtime });
