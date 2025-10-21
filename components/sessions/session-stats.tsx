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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Study Time */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Study Time
            </p>
            <h3 className="text-2xl font-bold mt-2">
              {stats.totalHours}h
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalMinutes} minutes • {getPeriodLabel()}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      {/* Total Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Sessions Completed
            </p>
            <h3 className="text-2xl font-bold mt-2">
              {stats.totalSessions}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {getPeriodLabel()}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
        </div>
      </Card>

      {/* Average Session */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Average Session
            </p>
            <h3 className="text-2xl font-bold mt-2">
              {stats.avgMinutes} min
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Longest: {stats.longestMinutes} min
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Target className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </Card>

      {/* Average Focus Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Average Focus
            </p>
            <h3 className="text-2xl font-bold mt-2">
              {stats.avgFocusScore 
                ? `${stats.avgFocusScore} / 5` 
                : "N/A"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.avgFocusScore ? "Great focus!" : "No ratings yet"}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Star className="h-6 w-6 text-yellow-500" />
          </div>
        </div>
      </Card>
    </div>
  );
}
