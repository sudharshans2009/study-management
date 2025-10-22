"use client";

import { Card } from "@/components/ui/card";
import { Clock, TrendingUp, Target, Star } from "lucide-react";

type SessionStatsData = {
  totalSessions: number;
  totalMinutes: number;
  totalHours: string;
  avgMinutes: number;
  longestMinutes: number;
  avgFocusScore: string | null;
};

interface SessionStatsProps {
  stats: SessionStatsData;
  period: "today" | "week" | "month" | "all";
}

export function SessionStats({ stats, period }: SessionStatsProps) {
  const getPeriodLabel = () => {
    switch (period) {
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      default:
        return "All Time";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Study Time */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Study Time</p>
            <p className="text-3xl font-bold mt-1">{stats.totalHours}h</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalMinutes} minutes
            </p>
          </div>
          <Clock className="h-10 w-10 text-primary opacity-20" />
        </div>
      </Card>

      {/* Total Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Sessions</p>
            <p className="text-3xl font-bold mt-1">{stats.totalSessions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {getPeriodLabel()}
            </p>
          </div>
          <TrendingUp className="h-10 w-10 text-green-500 opacity-20" />
        </div>
      </Card>

      {/* Average Session */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Avg. Session</p>
            <p className="text-3xl font-bold mt-1">{stats.avgMinutes} min</p>
            <p className="text-xs text-muted-foreground mt-1">
              Longest: {stats.longestMinutes} min
            </p>
          </div>
          <Target className="h-10 w-10 text-blue-500 opacity-20" />
        </div>
      </Card>

      {/* Average Focus Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Avg. Focus</p>
            <p className="text-3xl font-bold mt-1">
              {stats.avgFocusScore 
                ? `${stats.avgFocusScore} / 5` 
                : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.avgFocusScore ? "Great focus!" : "No ratings yet"}
            </p>
          </div>
          <Star className="h-10 w-10 text-yellow-500 opacity-20" />
        </div>
      </Card>
    </div>
  );
}
