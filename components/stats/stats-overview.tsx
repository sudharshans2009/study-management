"use client";

import { Card } from "@/components/ui/card";
import { Clock, Target, TrendingUp, Award } from "lucide-react";
import type { StudyStats } from "@/lib/stats-utils";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  stats: StudyStats;
  comparison?: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

export function StatsOverview({ stats, comparison }: StatsOverviewProps) {
  const hours = Math.floor(stats.totalMinutes / 60);
  const minutes = stats.totalMinutes % 60;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Study Time */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Study Time</p>
            <p className="text-3xl font-bold mt-1">
              {hours}h {minutes}m
            </p>
            {comparison && (
              <p className={cn(
                "text-xs mt-1",
                comparison.trend === 'up' ? "text-green-600" :
                comparison.trend === 'down' ? "text-red-600" :
                "text-muted-foreground"
              )}>
                {comparison.change > 0 ? '+' : ''}{comparison.change.toFixed(1)}% from last period
              </p>
            )}
            {!comparison && (
              <p className="text-xs text-muted-foreground mt-1">
                Across all sessions
              </p>
            )}
          </div>
          <Clock className="h-10 w-10 text-primary opacity-20" />
        </div>
      </Card>

      {/* Total Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Study Sessions</p>
            <p className="text-3xl font-bold mt-1">{stats.totalSessions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {Math.round(stats.averageSessionLength)} min/session
            </p>
          </div>
          <Target className="h-10 w-10 text-primary opacity-20" />
        </div>
      </Card>

      {/* Current Streak */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-3xl font-bold mt-1">{stats.currentStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Best: {stats.longestStreak} periods
            </p>
          </div>
          <TrendingUp className="h-10 w-10 text-green-500 opacity-20" />
        </div>
      </Card>

      {/* Goals */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Goals Completed</p>
            <p className="text-3xl font-bold mt-1">{stats.goalsCompleted}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.goalsActive} active goals
            </p>
          </div>
          <Award className="h-10 w-10 text-primary opacity-20" />
        </div>
      </Card>
    </div>
  );
}
