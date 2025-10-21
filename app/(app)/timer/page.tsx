"use client";

import { useState } from "react";
import { useTimer } from "@/hooks/use-timer";
import { useSessionCleanup } from "@/hooks/use-session-cleanup";
import { useSessionExpiryNotifications } from "@/hooks/use-session-expiry-notifications";
import { usePreventNavigation } from "@/hooks/use-prevent-navigation";
import { TimerDisplay } from "@/components/timer/timer-display";
import { TimerControls } from "@/components/timer/timer-controls";
import { TimerPresets } from "@/components/timer/timer-presets";
import { SubjectSelector } from "@/components/timer/subject-selector";
import { SessionSummaryModal } from "@/components/timer/session-summary-modal";
// import { SessionRecoveryModal } from "@/components/timer/session-recovery-modal";
import { PomodoroTracker } from "@/components/timer/pomodoro-tracker";
import { ResumableSessionAlert } from "@/components/timer/resumable-session-alert";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TimerSession } from "@/actions/timer-actions";
import { resumeTimerSession } from "@/actions/timer-actions";
import { toast } from "sonner";

// NOTE: SessionRecoveryModal is commented out because the useTimer hook
// now handles recovery automatically on mount. If saved state exists,
// the timer will resume automatically without showing a modal.

// Import types and functions from use-timer (currently unused but kept for reference)
// interface PersistedTimerState {
//   sessionId: string;
//   timeLeft: number;
//   totalDuration: number;
//   state: "idle" | "running" | "paused" | "completed";
//   type: "timer" | "pomodoro" | "stopwatch";
//   isBreak: boolean;
//   pomodoroCount: number;
//   subjectId: string | null;
//   startedAt: number;
//   pausedAt: number | null;
// }

// Helper function to load timer state from localStorage (currently unused)
// function loadTimerStateFromStorage(): PersistedTimerState | null {
//   try {
//     if (typeof window === "undefined") return null;
//     
//     const stored = localStorage.getItem("ss-study-timer-state");
//     if (!stored) return null;
//     
//     const state = JSON.parse(stored) as PersistedTimerState;
//     
//     // Validate state is not too old (max 24 hours)
//     const now = Date.now();
//     const age = now - state.startedAt;
//     if (age > 24 * 60 * 60 * 1000) {
//       console.log("Saved timer state is too old, clearing...");
//       localStorage.removeItem("ss-study-timer-state");
//       return null;
//     }
//     
//     return state;
//   } catch (error) {
//     console.error("Failed to load timer state:", error);
//     return null;
//   }
// }

// Helper function to clear timer state from localStorage (currently unused)
// function clearTimerStateFromStorage(): void {
//   try {
//     if (typeof window === "undefined") return;
//     localStorage.removeItem("ss-study-timer-state");
//   } catch (error) {
//     console.error("Failed to clear timer state:", error);
//   }
// }

export default function TimerPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [timerMode, setTimerMode] = useState<"timer" | "pomodoro" | "stopwatch">("timer");
  const [showSummary, setShowSummary] = useState(false);
  const [completedSession, setCompletedSession] = useState<TimerSession | null>(null);
  
  // Session recovery modal state - DISABLED (timer hook handles recovery automatically)
  // const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  // const [recoveredSession, setRecoveredSession] = useState<PersistedTimerState | null>(null);

  // Auto-cleanup expired paused sessions
  useSessionCleanup();
  
  // Show notifications for sessions about to expire
  useSessionExpiryNotifications();

  const timer = useTimer({
    onComplete: (session) => {
      setCompletedSession(session);
      setShowSummary(true);
    },
  });

  // The timer hook now handles recovery automatically on mount
  // We don't need the recovery modal anymore - it was causing reload loops
  // If the timer state is already running/paused after mount, it recovered successfully
  
  // Prevent navigation when timer is running (Phase 3.2)
  usePreventNavigation(
    timer.state === "running",
    "You have an active study timer. Leaving this page will pause it. Continue?"
  );

  // Session recovery handlers - DISABLED (not needed anymore)
  // const handleRecoverSession = async () => {
  //   if (!recoveredSession) return;
  //   try {
  //     setShowRecoveryModal(false);
  //     toast.success("Session recovered successfully!");
  //   } catch (error) {
  //     console.error("Error recovering session:", error);
  //     toast.error("Failed to recover session");
  //   }
  // };

  // const handleDiscardSession = () => {
  //   if (!recoveredSession) return;
  //   try {
  //     clearTimerStateFromStorage();
  //     setShowRecoveryModal(false);
  //     setRecoveredSession(null);
  //     toast.info("Saved session discarded");
  //   } catch (error) {
  //     console.error("Error discarding session:", error);
  //     toast.error("Failed to discard session");
  //   }
  // };

  const handleStartTimer = (durationInSeconds: number) => {
    timer.start(durationInSeconds, selectedSubject || undefined, timerMode);
  };

  const handleStartPomodoro = () => {
    // Standard pomodoro: 25 minutes
    timer.start(25 * 60, selectedSubject || undefined, "pomodoro");
  };

  const handleStartBreak = (isLongBreak: boolean = false) => {
    // Short break: 5 minutes, Long break: 15 minutes
    const duration = isLongBreak ? 15 * 60 : 5 * 60;
    timer.startBreak(duration);
  };

  const handleStopwatch = () => {
    // Stopwatch: 10 hours max
    timer.start(10 * 60 * 60, selectedSubject || undefined, "stopwatch");
  };

  const handleResumeSession = async (sessionId: string) => {
    try {
      const result = await resumeTimerSession(sessionId);
      if (result.success && result.session) {
        // Reload the page to refresh the timer with the resumed session
        window.location.reload();
        toast.success("Session resumed successfully!");
      } else {
        toast.error(result.error || "Failed to resume session");
      }
    } catch (error) {
      console.error("Error resuming session:", error);
      toast.error("Failed to resume session");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Study Timer</h1>
          <p className="text-muted-foreground">
            Stay focused and track your study sessions
          </p>
        </div>

        {/* Resumable Session Alert */}
        {timer.state === "idle" && (
          <ResumableSessionAlert onResume={handleResumeSession} />
        )}

        {/* Timer Mode Tabs */}
        <Tabs
          value={timerMode}
          onValueChange={(value) => setTimerMode(value as typeof timerMode)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timer" disabled={timer.state !== "idle"}>
              Timer
            </TabsTrigger>
            <TabsTrigger value="pomodoro" disabled={timer.state !== "idle"}>
              Pomodoro
            </TabsTrigger>
            <TabsTrigger value="stopwatch" disabled={timer.state !== "idle"}>
              Stopwatch
            </TabsTrigger>
          </TabsList>

          {/* Timer Mode */}
          <TabsContent value="timer" className="space-y-6">
            <Card className="p-6 space-y-6">
              <TimerDisplay
                timeLeft={timer.timeLeft}
                totalDuration={timer.totalDuration}
                formatTime={timer.formatTime}
                getProgress={timer.getProgress}
                isBreak={timer.isBreak}
              />

              <TimerControls
                state={timer.state}
                isLoading={timer.isLoading}
                onPause={timer.pause}
                onResume={timer.resume}
                onStop={timer.stop}
              />

              {timer.state === "idle" && (
                <>
                  <SubjectSelector
                    selectedSubject={selectedSubject}
                    onSubjectChange={setSelectedSubject}
                  />

                  <TimerPresets
                    onSelectDuration={handleStartTimer}
                    disabled={timer.isLoading}
                  />
                </>
              )}
            </Card>
          </TabsContent>

          {/* Pomodoro Mode */}
          <TabsContent value="pomodoro" className="space-y-6">
            <Card className="p-6 space-y-6">
              <PomodoroTracker
                pomodoroCount={timer.pomodoroCount}
                isBreak={timer.isBreak}
              />

              <TimerDisplay
                timeLeft={timer.timeLeft}
                totalDuration={timer.totalDuration}
                formatTime={timer.formatTime}
                getProgress={timer.getProgress}
                isBreak={timer.isBreak}
              />

              <TimerControls
                state={timer.state}
                isLoading={timer.isLoading}
                onPause={timer.pause}
                onResume={timer.resume}
                onStop={timer.stop}
              />

              {timer.state === "idle" && (
                <>
                  <SubjectSelector
                    selectedSubject={selectedSubject}
                    onSubjectChange={setSelectedSubject}
                  />

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleStartPomodoro}
                      disabled={timer.isLoading}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
                    >
                      Start Pomodoro (25 min)
                    </button>
                  </div>
                </>
              )}

              {timer.state === "completed" && !timer.isBreak && (
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleStartBreak(false)}
                    disabled={timer.isLoading}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    Short Break (5 min)
                  </button>
                  <button
                    onClick={() => handleStartBreak(true)}
                    disabled={timer.isLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    Long Break (15 min)
                  </button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Stopwatch Mode */}
          <TabsContent value="stopwatch" className="space-y-6">
            <Card className="p-6 space-y-6">
              <TimerDisplay
                timeLeft={timer.timeLeft}
                totalDuration={timer.totalDuration}
                formatTime={timer.formatTime}
                getProgress={timer.getProgress}
                isBreak={false}
                isStopwatch={true}
              />

              <TimerControls
                state={timer.state}
                isLoading={timer.isLoading}
                onPause={timer.pause}
                onResume={timer.resume}
                onStop={timer.stop}
              />

              {timer.state === "idle" && (
                <>
                  <SubjectSelector
                    selectedSubject={selectedSubject}
                    onSubjectChange={setSelectedSubject}
                  />

                  <div className="flex justify-center">
                    <button
                      onClick={handleStopwatch}
                      disabled={timer.isLoading}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
                    >
                      Start Stopwatch
                    </button>
                  </div>
                </>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card className="p-4 bg-muted/50">
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">💡 Tips:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use Timer mode for custom study sessions</li>
              <li>Pomodoro mode follows 25-5-25-5-25-5-25-15 pattern</li>
              <li>Stopwatch counts up - perfect for open-ended tasks</li>
              <li>Your session is auto-saved every 30 seconds</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Session Summary Modal */}
      <SessionSummaryModal
        open={showSummary}
        onOpenChange={setShowSummary}
        session={completedSession}
        onClose={() => {
          setShowSummary(false);
          setCompletedSession(null);
        }}
      />

      {/* Session Recovery Modal - DISABLED (timer hook handles recovery automatically)
      <SessionRecoveryModal
        open={showRecoveryModal}
        onOpenChange={setShowRecoveryModal}
        session={recoveredSession}
        onRecover={handleRecoverSession}
        onDiscard={handleDiscardSession}
      />
      */}
    </div>
  );
}
