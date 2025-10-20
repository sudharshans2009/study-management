"use client";

import { useState, useEffect } from "react";

interface UseStopwatchOptions {
  onTick?: (seconds: number) => void;
}

export function useStopwatch({ onTick }: UseStopwatchOptions = {}) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSeconds((seconds) => {
          const newSeconds = seconds + 1;
          onTick?.(newSeconds);
          return newSeconds;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, onTick]);

  const start = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pause = () => {
    setIsPaused(true);
  };

  const resume = () => {
    setIsPaused(false);
  };

  const reset = () => {
    setIsActive(false);
    setIsPaused(false);
    setSeconds(0);
  };

  return {
    seconds,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    reset,
  };
}
