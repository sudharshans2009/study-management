"use client";

import { useState, useEffect } from "react";

interface UseTimerOptions {
  initialSeconds?: number;
  onComplete?: () => void;
}

export function useTimer({ initialSeconds = 0, onComplete }: UseTimerOptions = {}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSeconds((seconds) => {
          if (seconds <= 0) {
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, onComplete]);

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
    setSeconds(initialSeconds);
  };

  const setTime = (newSeconds: number) => {
    setSeconds(newSeconds);
  };

  return {
    seconds,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    reset,
    setTime,
  };
}
