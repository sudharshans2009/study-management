"use client";

import { cn } from "@/lib/utils";

interface PomodoroTrackerProps {
  pomodoroCount: number;
  isBreak: boolean;
}

export function PomodoroTracker({ pomodoroCount, isBreak }: PomodoroTrackerProps) {
  const maxPomodoros = 4;
  const pomodoros = Array.from({ length: maxPomodoros }, (_, i) => i < pomodoroCount);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="text-sm font-medium text-muted-foreground">
        Pomodoro Progress
      </div>
      <div className="flex gap-2">
        {pomodoros.map((completed, index) => (
          <div
            key={index}
            className={cn(
              "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
              completed
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/20 text-muted-foreground"
            )}
          >
            {completed ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>
        ))}
      </div>
      {isBreak && (
        <div className="text-xs text-green-500 font-medium animate-pulse">
          Break time! 🎉
        </div>
      )}
      {pomodoroCount >= maxPomodoros && !isBreak && (
        <div className="text-xs text-primary font-medium">
          Great work! Take a long break (15 min) 🎊
        </div>
      )}
    </div>
  );
}
