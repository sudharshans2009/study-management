"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, X, Timer, Coffee } from "lucide-react";
import { getResumableSessions } from "@/actions/timer-actions";
import { formatDistanceToNow } from "date-fns";
import { getSubjectColorClasses } from "@/lib/subject-colors";
import { cn } from "@/lib/utils";

interface ResumableSession {
  id: string;
  type: "timer" | "pomodoro" | "stopwatch";
  pausedAt: Date | null;
  remainingDuration: number | null;
  progressPercentage: number | null;
  isBreak: boolean;
  subject: {
    id: string;
    name: string;
    color: string;
  } | null;
}

interface ResumableSessionAlertProps {
  onResume: (sessionId: string) => void;
}

export function ResumableSessionAlert({ onResume }: ResumableSessionAlertProps) {
  const [sessions, setSessions] = useState<ResumableSession[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResumableSessions();
  }, []);

  async function loadResumableSessions() {
    setIsLoading(true);
    try {
      const result = await getResumableSessions();
      if (result.success && result.data) {
        setSessions(result.data as ResumableSession[]);
      }
    } catch (error) {
      console.error("Error loading resumable sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const visibleSessions = sessions.filter((s) => !dismissed.includes(s.id));

  if (isLoading || visibleSessions.length === 0) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pomodoro":
        return "🍅";
      case "stopwatch":
        return "⏱️";
      default:
        return "⏲️";
    }
  };

  return (
    <div className="space-y-3">
      {visibleSessions.map((session) => (
        <Alert
          key={session.id}
          className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20"
        >
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex items-start justify-between gap-4 ml-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium flex items-center gap-1">
                  {session.isBreak && <Coffee className="h-4 w-4" />}
                  {session.isBreak ? "Break session paused" : "Study session paused"}
                </span>
                <Badge variant="outline" className="gap-1 text-xs">
                  {getTypeIcon(session.type)}
                  {session.type}
                </Badge>
                {session.subject && (
                  <Badge
                    className={cn(
                      "text-xs",
                      getSubjectColorClasses(session.subject.color).softBg,
                      getSubjectColorClasses(session.subject.color).border,
                      getSubjectColorClasses(session.subject.color).text
                    )}
                  >
                    {session.subject.name}
                  </Badge>
                )}
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Timer className="h-3 w-3" />
                  {Math.floor((session.remainingDuration || 0) / 60)}m left
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-3">
                <span>
                  Paused{" "}
                  {session.pausedAt
                    ? formatDistanceToNow(new Date(session.pausedAt), {
                        addSuffix: true,
                      })
                    : "recently"}
                </span>
                <span>•</span>
                <span>{session.progressPercentage}% complete</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => onResume(session.id)}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Resume
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissed([...dismissed, session.id])}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
