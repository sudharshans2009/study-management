"use client";

import type { SessionWithSubject } from "@/actions/session-actions";
import { SessionCard } from "./session-card";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";

interface SessionListProps {
  sessions: SessionWithSubject[];
  onRefresh: () => void;
}

export function SessionList({ sessions, onRefresh }: SessionListProps) {
  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = new Date(session.startTime);
    let groupKey: string;

    if (isToday(date)) {
      groupKey = "Today";
    } else if (isYesterday(date)) {
      groupKey = "Yesterday";
    } else if (isThisWeek(date)) {
      groupKey = format(date, "EEEE"); // Day name
    } else {
      groupKey = format(date, "MMMM d, yyyy");
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(session);
    return groups;
  }, {} as Record<string, SessionWithSubject[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedSessions).map(([dateLabel, dateSessions]) => (
        <div key={dateLabel} className="space-y-3">
          {/* Date Header */}
          <div className="sticky top-0 bg-background/95 backdrop-blur z-10 py-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {dateLabel}
              <span className="text-sm font-normal text-muted-foreground">
                ({dateSessions.length} session{dateSessions.length !== 1 ? "s" : ""})
              </span>
            </h2>
          </div>

          {/* Session Cards */}
          <div className="space-y-3">
            {dateSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onDelete={onRefresh}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
