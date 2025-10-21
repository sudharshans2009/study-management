"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Clock, Play, Pause } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TimerState {
  sessionId: string;
  timeLeft: number;
  totalDuration: number;
  state: "running" | "paused";
  type: "timer" | "pomodoro" | "stopwatch";
  isBreak: boolean;
  startedAt: number;
}

/**
 * Floating timer badge that shows on all pages when timer is active
 * Allows user to quickly see timer status and navigate back to timer page
 */
export function FloatingTimerBadge() {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for active timer from localStorage
    const checkTimer = () => {
      if (typeof window === "undefined") return;

      try {
        const stored = localStorage.getItem("ss-study-timer-state");
        if (stored) {
          const state = JSON.parse(stored);
          
          // Only show badge if timer is running or paused
          if (state.state === "running" || state.state === "paused") {
            setTimerState(state);
            
            if (state.state === "running") {
              // Calculate remaining time
              const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
              const remaining = Math.max(0, state.totalDuration - elapsed);
              setTimeLeft(remaining);
            } else {
              setTimeLeft(state.timeLeft);
            }
          } else {
            setTimerState(null);
          }
        } else {
          setTimerState(null);
        }
      } catch (error) {
        console.error("Error checking timer state:", error);
      }
    };

    // Check immediately
    checkTimer();

    // Update every second
    const interval = setInterval(checkTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't show on timer page
  if (!timerState || pathname === "/timer") return null;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isRunning = timerState.state === "running";

  return (
    <Card
      className={cn(
        "fixed bottom-4 right-4 z-50 p-4 shadow-lg cursor-pointer",
        "hover:shadow-xl transition-all duration-200 hover:scale-105",
        "border-2",
        isRunning ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"
      )}
      onClick={() => router.push("/timer")}
      role="button"
      aria-label="Go to timer page"
    >
      <div className="flex items-center gap-3 min-w-[180px]">
        <div className="relative shrink-0">
          <Clock className={cn(
            "h-6 w-6",
            isRunning ? "text-green-600" : "text-yellow-600"
          )} />
          {isRunning && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
        
        <div className="flex-1">
          <div className={cn(
            "text-xs font-medium uppercase tracking-wide",
            isRunning ? "text-green-700" : "text-yellow-700"
          )}>
            {isRunning ? "Timer Running" : "Timer Paused"}
          </div>
          <div className="text-2xl font-bold tabular-nums font-mono text-foreground">
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="shrink-0">
          {isRunning ? (
            <Pause className="h-5 w-5 text-green-600" />
          ) : (
            <Play className="h-5 w-5 text-yellow-600" />
          )}
        </div>
      </div>

      {/* Type indicator */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        {timerState.type === "pomodoro" && "🍅 Pomodoro"}
        {timerState.type === "timer" && "⏱️ Timer"}
        {timerState.type === "stopwatch" && "⏲️ Stopwatch"}
        {timerState.isBreak && " (Break)"}
      </div>
    </Card>
  );
}
