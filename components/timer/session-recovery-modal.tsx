"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionRecoveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: {
    sessionId: string;
    timeLeft: number;
    totalDuration: number;
    state: "idle" | "running" | "paused" | "completed";
    type: "timer" | "pomodoro" | "stopwatch";
    isBreak: boolean;
    pomodoroCount: number;
    subjectId: string | null;
    startedAt: number;
    pausedAt: number | null;
  } | null;
  onRecover: () => void;
  onDiscard: () => void;
}

export function SessionRecoveryModal({
  open,
  onOpenChange,
  session,
  onRecover,
  onDiscard,
}: SessionRecoveryModalProps) {
  const [isRecovering, setIsRecovering] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  if (!session) return null;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    return ((session.totalDuration - session.timeLeft) / session.totalDuration) * 100;
  };

  const handleRecover = async () => {
    setIsRecovering(true);
    try {
      await onRecover();
    } finally {
      setIsRecovering(false);
    }
  };

  const handleDiscard = async () => {
    setIsDiscarding(true);
    try {
      await onDiscard();
      onOpenChange(false);
    } finally {
      setIsDiscarding(false);
    }
  };

  const isRunning = session.state === "running";
  const isPaused = session.state === "paused";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {isRunning ? "Continue Your Session?" : "Resume Your Session?"}
          </DialogTitle>
          <DialogDescription>
            You have a {isPaused ? "paused" : "running"} study session that was
            automatically saved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Session Info Card */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            {/* Timer Type & State */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "gap-1",
                  session.type === "pomodoro" &&
                    "border-red-500 text-red-700 bg-red-50",
                  session.type === "timer" &&
                    "border-blue-500 text-blue-700 bg-blue-50",
                  session.type === "stopwatch" &&
                    "border-purple-500 text-purple-700 bg-purple-50"
                )}
              >
                {session.type === "pomodoro" && "🍅"}
                {session.type === "timer" && "⏱️"}
                {session.type === "stopwatch" && "⏲️"}
                <span className="ml-1 capitalize">{session.type}</span>
              </Badge>

              {session.isBreak && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Break
                </Badge>
              )}

              <Badge
                variant="outline"
                className={cn(
                  isRunning
                    ? "bg-green-50 text-green-700 border-green-500"
                    : "bg-yellow-50 text-yellow-700 border-yellow-500"
                )}
              >
                {isRunning ? "Running" : "Paused"}
              </Badge>
            </div>

            {/* Time Remaining */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Time Remaining
              </span>
              <span className="font-mono font-bold text-2xl text-foreground">
                {formatTime(session.timeLeft)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(getProgress())}%</span>
              </div>
              <div className="h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    session.type === "pomodoro" && "bg-red-500",
                    session.type === "timer" && "bg-blue-500",
                    session.type === "stopwatch" && "bg-purple-500"
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, getProgress()))}%` }}
                />
              </div>
            </div>

            {/* Pomodoro Count */}
            {session.type === "pomodoro" && session.pomodoroCount > 0 && (
              <div className="text-sm text-muted-foreground">
                🍅 {session.pomodoroCount} pomodoro
                {session.pomodoroCount !== 1 ? "s" : ""} completed
              </div>
            )}

            {/* Duration Info */}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total Duration</span>
              <span>{formatTime(session.totalDuration)}</span>
            </div>
          </div>

          {/* Warning Message */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
            <p>
              Your session was automatically saved when you left. You can
              continue where you left off or start fresh.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1 gap-2"
              onClick={handleRecover}
              disabled={isRecovering || isDiscarding}
            >
              {isRecovering ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  {isPaused ? "Resuming..." : "Continuing..."}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {isPaused ? "Resume Session" : "Continue Session"}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={handleDiscard}
              disabled={isRecovering || isDiscarding}
            >
              {isDiscarding ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Discarding...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Discard
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your session data is stored locally and will be removed after 24
            hours
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
