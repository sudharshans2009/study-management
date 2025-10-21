"use client";

import { Button } from "@/components/ui/button";
import { Pause, Play, Square } from "lucide-react";
import type { TimerState } from "@/hooks/use-timer";

interface TimerControlsProps {
  state: TimerState;
  isLoading: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function TimerControls({
  state,
  isLoading,
  onPause,
  onResume,
  onStop,
}: TimerControlsProps) {
  if (state === "idle" || state === "completed") {
    return null;
  }

  return (
    <div className="flex gap-3 justify-center">
      {state === "running" && (
        <Button
          onClick={onPause}
          disabled={isLoading}
          size="lg"
          variant="outline"
          className="gap-2"
        >
          <Pause className="h-5 w-5" />
          Pause
        </Button>
      )}

      {state === "paused" && (
        <Button
          onClick={onResume}
          disabled={isLoading}
          size="lg"
          className="gap-2"
        >
          <Play className="h-5 w-5" />
          Resume
        </Button>
      )}

      <Button
        onClick={onStop}
        disabled={isLoading}
        size="lg"
        variant="destructive"
        className="gap-2"
      >
        <Square className="h-5 w-5" />
        Stop
      </Button>
    </div>
  );
}
