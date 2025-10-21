"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  startTimerSession,
  pauseTimerSession,
  resumeTimerSession,
  completeTimerSession,
  cancelTimerSession,
  getActiveSession,
  incrementPomodoroCount,
  type TimerSession,
  type TimerType,
} from "@/actions/timer-actions";
import { toast } from "sonner";
import { useTimerSync, type TimerSyncMessage } from "./use-timer-sync";

export type TimerState = "idle" | "running" | "paused" | "completed";

// localStorage key for timer persistence
const TIMER_STORAGE_KEY = "ss-study-timer-state";

// Interface for persisted timer state
interface PersistedTimerState {
  sessionId: string;
  timeLeft: number;
  totalDuration: number;
  state: TimerState;
  type: TimerType;
  isBreak: boolean;
  pomodoroCount: number;
  subjectId: string | null;
  startedAt: number; // timestamp in ms
  pausedAt: number | null; // timestamp in ms
}

// Save timer state to localStorage
function saveTimerState(state: PersistedTimerState): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save timer state:", error);
  }
}

// Load timer state from localStorage
function loadTimerState(): PersistedTimerState | null {
  try {
    if (typeof window === "undefined") return null;
    
    const stored = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!stored) return null;
    
    const state = JSON.parse(stored) as PersistedTimerState;
    
    // Validate state is not too old (max 24 hours)
    const now = Date.now();
    const age = now - state.startedAt;
    if (age > 24 * 60 * 60 * 1000) {
      console.log("Saved timer state is too old, clearing...");
      clearTimerState();
      return null;
    }
    
    return state;
  } catch (error) {
    console.error("Failed to load timer state:", error);
    return null;
  }
}

// Clear timer state from localStorage
function clearTimerState(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TIMER_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear timer state:", error);
  }
}

export interface UseTimerOptions {
  onComplete?: (session: TimerSession) => void;
  onTick?: (timeLeft: number) => void;
  autoSaveInterval?: number; // seconds
}

export interface UseTimerReturn {
  // State
  timeLeft: number; // seconds
  totalDuration: number; // seconds
  state: TimerState;
  session: TimerSession | null;
  isLoading: boolean;

  // Actions
  start: (duration: number, subjectId?: string, type?: TimerType) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  complete: (focusScore?: number, notes?: string) => Promise<void>;
  
  // Utilities
  formatTime: (seconds: number) => string;
  getProgress: () => number;
  
  // Pomodoro specific
  pomodoroCount: number;
  isBreak: boolean;
  startBreak: (duration: number) => Promise<void>;
}

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const { onComplete, onTick, autoSaveInterval = 30 } = options;

  const [session, setSession] = useState<TimerSession | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [state, setState] = useState<TimerState>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [isBreak, setIsBreak] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const autoSaveRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSaveRef = useRef<number>(0);
  const startedAtRef = useRef<number>(0); // Track when timer actually started
  const hasInitialized = useRef(false); // Prevent double initialization

  // Format time as MM:SS or HH:MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }

    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Calculate progress percentage
  const getProgress = useCallback((): number => {
    if (totalDuration === 0) return 0;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  }, [timeLeft, totalDuration]);

  // Clear intervals
  const clearIntervals = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
      autoSaveRef.current = undefined;
    }
  }, []);

  // Start countdown with time jump detection (Phase 6.1)
  const startCountdown = useCallback(() => {
    clearIntervals();
    let lastTickTime = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastTick = now - lastTickTime;
      
      // Detect time jump (computer sleep, manual time change, etc.)
      if (timeSinceLastTick > 2000) {
        console.warn("Time jump detected:", timeSinceLastTick, "ms");
        
        // Recalculate elapsed time from startedAt
        if (startedAtRef.current > 0) {
          const actualElapsed = Math.floor((now - startedAtRef.current) / 1000);
          const newTimeLeft = Math.max(0, totalDuration - actualElapsed);
          
          setTimeLeft(newTimeLeft);
          
          if (newTimeLeft === 0) {
            clearIntervals();
            setState("completed");
          }
          
          lastTickTime = now;
          return;
        }
      }
      
      // Normal tick
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        if (newTime <= 0) {
          clearIntervals();
          setState("completed");
          return 0;
        }

        if (onTick) {
          onTick(newTime);
        }

        lastTickTime = now;
        return newTime;
      });
    }, 1000);
  }, [clearIntervals, onTick, totalDuration]);

  // Auto-save during long sessions
  const startAutoSave = useCallback(() => {
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }

    autoSaveRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastSaveRef.current >= autoSaveInterval * 1000) {
        // Just update the duration silently without UI feedback
        if (session) {
          pauseTimerSession(session.id).catch(console.error);
          resumeTimerSession(session.id).catch(console.error);
          lastSaveRef.current = now;
        }
      }
    }, autoSaveInterval * 1000);
  }, [autoSaveInterval, session]);

  // Cross-tab synchronization (Phase 2.2)
  const handleSync = useCallback((message: TimerSyncMessage) => {
    switch (message.type) {
      case "TIMER_STARTED":
        // Another tab started timer - reload state from localStorage
        if (message.sessionId !== session?.id) {
          const saved = loadTimerState();
          if (saved && saved.sessionId === message.sessionId) {
            setTimeLeft(saved.timeLeft);
            setTotalDuration(saved.totalDuration);
            setState(saved.state);
            setPomodoroCount(saved.pomodoroCount);
            setIsBreak(saved.isBreak);
            startedAtRef.current = saved.startedAt;
          }
        }
        break;

      case "TIMER_PAUSED":
        if (message.sessionId === session?.id && state === "running") {
          setState("paused");
          setTimeLeft(message.timeLeft);
          clearIntervals();
        }
        break;

      case "TIMER_RESUMED":
        if (message.sessionId === session?.id && state === "paused") {
          setState("running");
          startCountdown();
        }
        break;

      case "TIMER_STOPPED":
      case "TIMER_COMPLETED":
        if (message.sessionId === session?.id) {
          clearTimerState();
          setState("idle");
          setSession(null);
          clearIntervals();
        }
        break;
    }
  }, [session, state, clearIntervals, startCountdown]);

  const { broadcast } = useTimerSync(handleSync);

  // Start timer
  const start = useCallback(
    async (duration: number, subjectId?: string, type: TimerType = "timer") => {
      try {
        setIsLoading(true);

        const result = await startTimerSession({
          duration,
          subjectId,
          type,
          isBreak: false,
        });

        if (!result.success || !result.session) {
          toast.error(result.error || "Failed to start timer");
          return;
        }

        setSession(result.session);
        setTimeLeft(duration);
        setTotalDuration(duration);
        setState("running");
        setPomodoroCount(result.session.pomodoroCount);
        setIsBreak(false);
        startedAtRef.current = Date.now(); // Track start time for persistence

        startCountdown();
        startAutoSave();

        // Broadcast to other tabs
        broadcast({
          type: "TIMER_STARTED",
          sessionId: result.session.id,
          duration,
          timestamp: Date.now(),
        });

        toast.success("Timer started!");
      } catch (error) {
        console.error("Error starting timer:", error);
        toast.error("Failed to start timer");
      } finally {
        setIsLoading(false);
      }
    },
    [startCountdown, startAutoSave, broadcast]
  );

  // Start break
  const startBreak = useCallback(
    async (duration: number) => {
      try {
        setIsLoading(true);

        if (!session) {
          toast.error("No active session");
          return;
        }

        const result = await startTimerSession({
          duration,
          subjectId: session.subjectId,
          type: "pomodoro",
          isBreak: true,
        });

        if (!result.success || !result.session) {
          toast.error(result.error || "Failed to start break");
          return;
        }

        setSession(result.session);
        setTimeLeft(duration);
        setTotalDuration(duration);
        setState("running");
        setIsBreak(true);
        startedAtRef.current = Date.now(); // Track start time for persistence

        startCountdown();

        toast.success("Break started!");
      } catch (error) {
        console.error("Error starting break:", error);
        toast.error("Failed to start break");
      } finally {
        setIsLoading(false);
      }
    },
    [session, startCountdown]
  );

  // Pause timer
  const pause = useCallback(async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      clearIntervals();

      const result = await pauseTimerSession(session.id);

      if (!result.success || !result.session) {
        toast.error(result.error || "Failed to pause timer");
        return;
      }

      setSession(result.session);
      setState("paused");

      // Broadcast to other tabs
      broadcast({
        type: "TIMER_PAUSED",
        sessionId: session.id,
        timeLeft,
        timestamp: Date.now(),
      });

      toast.success("Timer paused");
    } catch (error) {
      console.error("Error pausing timer:", error);
      toast.error("Failed to pause timer");
    } finally {
      setIsLoading(false);
    }
  }, [session, clearIntervals, timeLeft, broadcast]);

  // Resume timer
  const resume = useCallback(async () => {
    if (!session) return;

    try {
      setIsLoading(true);

      const result = await resumeTimerSession(session.id);

      if (!result.success || !result.session) {
        toast.error(result.error || "Failed to resume timer");
        return;
      }

      setSession(result.session);
      setState("running");

      startCountdown();
      startAutoSave();

      // Broadcast to other tabs
      broadcast({
        type: "TIMER_RESUMED",
        sessionId: session.id,
        timestamp: Date.now(),
      });

      toast.success("Timer resumed");
    } catch (error) {
      console.error("Error resuming timer:", error);
      toast.error("Failed to resume timer");
    } finally {
      setIsLoading(false);
    }
  }, [session, startCountdown, startAutoSave, broadcast]);

  // Stop/cancel timer
  const stop = useCallback(async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      clearIntervals();

      const result = await cancelTimerSession(session.id);

      if (!result.success) {
        toast.error(result.error || "Failed to stop timer");
        return;
      }

      const sessionId = session.id;

      setSession(null);
      setTimeLeft(0);
      setTotalDuration(0);
      setState("idle");
      setPomodoroCount(0);
      setIsBreak(false);

      // Clear localStorage when session is deleted
      clearTimerState();

      // Broadcast to other tabs
      broadcast({
        type: "TIMER_STOPPED",
        sessionId,
        timestamp: Date.now(),
      });

      toast.success("Timer stopped");
    } catch (error) {
      console.error("Error stopping timer:", error);
      toast.error("Failed to stop timer");
    } finally {
      setIsLoading(false);
    }
  }, [session, clearIntervals, broadcast]);

  // Complete timer
  const complete = useCallback(
    async (focusScore?: number, notes?: string) => {
      if (!session) return;

      try {
        setIsLoading(true);
        clearIntervals();

        const result = await completeTimerSession(session.id, {
          focusScore,
          notes,
        });

        if (!result.success || !result.session) {
          toast.error(result.error || "Failed to complete timer");
          return;
        }

        // Increment pomodoro count if it's a pomodoro session
        if (result.session.type === "pomodoro" && !result.session.isBreak) {
          await incrementPomodoroCount(result.session.id);
          setPomodoroCount((prev) => prev + 1);
        }

        const sessionId = result.session.id;

        if (onComplete) {
          onComplete(result.session);
        }

        setSession(null);
        setTimeLeft(0);
        setTotalDuration(0);
        setState("idle");

        // Clear localStorage when session completes
        clearTimerState();

        // Broadcast to other tabs
        broadcast({
          type: "TIMER_COMPLETED",
          sessionId,
          timestamp: Date.now(),
        });

        toast.success("Session completed!");
      } catch (error) {
        console.error("Error completing timer:", error);
        toast.error("Failed to complete timer");
      } finally {
        setIsLoading(false);
      }
    },
    [session, clearIntervals, onComplete, broadcast]
  );

  // Load saved timer state on mount (Phase 1.2)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const loadSavedState = async () => {
      const savedState = loadTimerState();
      
      if (savedState && savedState.state !== "completed") {
        const now = Date.now();
        
        if (savedState.state === "running") {
          // Calculate elapsed time since start
          const elapsed = Math.floor((now - savedState.startedAt) / 1000);
          const remaining = Math.max(0, savedState.totalDuration - elapsed);
          
          if (remaining > 0) {
            // Try to load session from server first
            try {
              const result = await getActiveSession();
              if (result.success && result.session && result.session.id === savedState.sessionId) {
                // Server session exists - resume running timer
                setSession(result.session);
                setTimeLeft(remaining);
                setTotalDuration(savedState.totalDuration);
                setState("running");
                setPomodoroCount(savedState.pomodoroCount);
                setIsBreak(savedState.isBreak);
                startedAtRef.current = savedState.startedAt;
                
                startCountdown();
                startAutoSave();
                toast.info("Resuming your study session...", {
                  description: `${formatTime(remaining)} remaining`,
                });
              } else {
                // Server session not found - clear localStorage
                console.warn("Server session not found, clearing localStorage");
                clearTimerState();
                toast.error("Session expired or not found");
              }
            } catch (error) {
              console.error("Error loading session:", error);
              clearTimerState();
            }
          } else {
            // Timer completed while tab was closed
            toast.info("Your timer completed while you were away");
            clearTimerState();
          }
        } else if (savedState.state === "paused" && savedState.pausedAt) {
          // Try to load session from server first
          try {
            const result = await getActiveSession();
            if (result.success && result.session && result.session.id === savedState.sessionId) {
              // Server session exists - restore paused state
              setSession(result.session);
              setTimeLeft(savedState.timeLeft);
              setTotalDuration(savedState.totalDuration);
              setState("paused");
              setPomodoroCount(savedState.pomodoroCount);
              setIsBreak(savedState.isBreak);
              startedAtRef.current = savedState.startedAt;
              
              toast.info("Your paused session is ready to resume");
            } else {
              // Server session not found - clear localStorage
              console.warn("Server session not found, clearing localStorage");
              clearTimerState();
              toast.error("Session expired or not found");
            }
          } catch (error) {
            console.error("Error loading session:", error);
            clearTimerState();
          }
        }
      } else {
        // No saved state, try loading from server (original behavior)
        try {
          const result = await getActiveSession();

          if (result.success && result.session) {
            const sess = result.session;
            setSession(sess);

            // Calculate remaining time
            const now = Date.now();
            const endTime = sess.endTime ? new Date(sess.endTime).getTime() : now;
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

            setTimeLeft(remaining);
            setTotalDuration(sess.duration);
            setState(remaining > 0 ? "running" : "completed");
            setPomodoroCount(sess.pomodoroCount);
            setIsBreak(sess.isBreak);

            if (remaining > 0) {
              startCountdown();
              startAutoSave();
            }
          }
        } catch (error) {
          console.error("Error loading active session:", error);
        }
      }
    };

    loadSavedState();
  }, [startCountdown, startAutoSave, formatTime]);

  // Save state to localStorage whenever it changes (Phase 1.3)
  useEffect(() => {
    if (!session) return;

    if (state === "running" || state === "paused") {
      const timerState: PersistedTimerState = {
        sessionId: session.id,
        timeLeft,
        totalDuration,
        state,
        type: session.type,
        isBreak,
        pomodoroCount,
        subjectId: session.subjectId,
        startedAt: startedAtRef.current || Date.now(),
        pausedAt: state === "paused" ? Date.now() : null,
      };
      saveTimerState(timerState);
    } else if (state === "completed" || state === "idle") {
      clearTimerState();
    }
  }, [state, timeLeft, session, totalDuration, isBreak, pomodoroCount]);

  // Handle timer completion
  useEffect(() => {
    if (state === "completed" && session) {
      complete();
    }
  }, [state, session, complete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearIntervals();
    };
  }, [clearIntervals]);

  // Handle page close - warn and save state (Phase 3.1)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state === "running" && session) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
        
        // Pause the countdown interval while the dialog is open
        // This prevents the timer from continuing to count down in the background
        clearIntervals();
        
        // Don't pause on the server - just warn the user
        // If they actually reload, the state will be recovered on mount
        // Pausing here causes issues if user cancels the reload
        
        // Save current state as RUNNING before unload
        // On reload, the recovery logic will handle calculating elapsed time
        const timerState: PersistedTimerState = {
          sessionId: session.id,
          timeLeft,
          totalDuration,
          state: "running", // Keep as running
          type: session.type,
          isBreak,
          pomodoroCount,
          subjectId: session.subjectId,
          startedAt: startedAtRef.current || Date.now(),
          pausedAt: null,
        };
        saveTimerState(timerState);
        
        return "You have an active study session. Are you sure you want to leave?";
      }
    };

    // Resume countdown if user cancels navigation
    const handleFocus = () => {
      // If timer was running and intervals were cleared by beforeunload
      if (state === "running" && session && !intervalRef.current) {
        startCountdown();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("focus", handleFocus);
    };
  }, [session, state, timeLeft, totalDuration, isBreak, pomodoroCount, clearIntervals, startCountdown]);

  // Update browser tab title with timer countdown (Phase 4.1)
  useEffect(() => {
    if (state === "running" && timeLeft > 0) {
      const formattedTime = formatTime(timeLeft);
      document.title = `${formattedTime} - SS.Study Timer`;
    } else {
      document.title = "SS.Study";
    }

    return () => {
      document.title = "SS.Study";
    };
  }, [state, timeLeft, formatTime]);

  return {
    timeLeft,
    totalDuration,
    state,
    session,
    isLoading,
    start,
    pause,
    resume,
    stop,
    complete,
    formatTime,
    getProgress,
    pomodoroCount,
    isBreak,
    startBreak,
  };
}
