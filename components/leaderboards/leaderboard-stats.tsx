"use client";

import { LeaderboardStats as Stats, LeaderboardMetric, formatLeaderboardValue } from "@/lib/leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Crown } from "lucide-react";

interface LeaderboardStatsProps {
  stats: Stats;
  metric: LeaderboardMetric;
}

export function LeaderboardStats({ stats, metric }: LeaderboardStatsProps) {
  const avgValue = formatLeaderboardValue(stats.averageScore, metric);
  const topValue = stats.topPerformer 
    ? formatLeaderboardValue(stats.topPerformer.value, metric)
    : '-';
  const topName = stats.topPerformer?.name || stats.topPerformer?.username || 'Be the first!';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Participants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Participants
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalParticipants}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Active learners competing
          </p>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Score
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgValue}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Mean across all participants
          </p>
        </CardContent>
      </Card>

      {/* Top Performer */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Top Performer
          </CardTitle>
          <Crown className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topValue}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.topPerformer ? `By ${topName}` : topName}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
