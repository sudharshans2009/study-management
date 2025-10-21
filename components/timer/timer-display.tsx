"use client";

import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  timeLeft: number;
  totalDuration: number;
  formatTime: (seconds: number) => string;
  getProgress: () => number;
  isBreak: boolean;
  isStopwatch?: boolean;
}

export function TimerDisplay({
  timeLeft,
  totalDuration,
  formatTime,
  getProgress,
  isBreak,
  isStopwatch = false,
}: TimerDisplayProps) {
  const progress = getProgress();
  const displayTime = isStopwatch ? totalDuration - timeLeft : timeLeft;
  
  // Calculate the stroke dasharray for the progress ring
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Progress Ring */}
      <div className="relative">
        <svg
          className="transform -rotate-90"
          width="280"
          height="280"
          viewBox="0 0 280 280"
        >
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-muted opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-1000 ease-linear",
              isBreak
                ? "text-green-500"
                : isStopwatch
                ? "text-blue-500"
                : "text-primary"
            )}
          />
        </svg>

        {/* Time display in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className={cn(
                "text-6xl font-bold tabular-nums",
                isBreak && "text-green-500"
              )}
            >
              {formatTime(displayTime)}
            </div>
            {isBreak && (
              <div className="text-sm text-green-500 font-medium mt-2">
                Break Time 🎉
              </div>
            )}
            {isStopwatch && (
              <div className="text-sm text-muted-foreground font-medium mt-2">
                Elapsed Time
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress percentage */}
      {!isStopwatch && (
        <div className="text-sm text-muted-foreground">
          {Math.round(progress)}% complete
        </div>
      )}
    </div>
  );
}
