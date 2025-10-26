"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/actions/leaderboard-actions";
import type { LeaderboardMetric, LeaderboardPeriod } from "@/lib/leaderboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaderboardTable } from "@/components/leaderboards/leaderboard-table";
import { LeaderboardPodium } from "@/components/leaderboards/leaderboard-podium";
import { LeaderboardStats } from "@/components/leaderboards/leaderboard-stats";
import { UserRankCard } from "@/components/leaderboards/user-rank-card";
import { Loader2, Info, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const METRICS: { value: LeaderboardMetric; label: string; }[] = [
  { value: 'composite', label: 'Overall' },
  { value: 'study-time', label: 'Study Time' },
  { value: 'goals', label: 'Goals' },
  { value: 'sessions', label: 'Sessions' },
  { value: 'streak', label: 'Streak' },
  { value: 'focus-score', label: 'Focus' },
];

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: 'daily', label: 'Today' },
  { value: 'monthly', label: 'This Month' },
  { value: 'yearly', label: 'This Year' },
  { value: 'all-time', label: 'All Time' },
];

export function LeaderboardView() {
  const [metric, setMetric] = useState<LeaderboardMetric>('composite');
  const [period, setPeriod] = useState<LeaderboardPeriod>('monthly');

  // Calculate next update time (daily at 00:00 UTC)
  const nextUpdateInfo = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(24, 0, 0, 0); // Next midnight UTC
    
    const hoursUntil = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
    const minutesUntil = Math.floor(((tomorrow.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
    
    // Get local time when update happens
    const updateTimeLocal = new Date(tomorrow);
    const timeString = updateTimeLocal.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    return {
      hoursUntil,
      minutesUntil,
      timeString,
    };
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['leaderboard', metric, period],
    queryFn: async () => {
      const result = await getLeaderboard(metric, period);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to load leaderboard');
      }
      return result.data;
    },
    refetchInterval: 3600000, // Refetch every hour
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load leaderboard</p>
      </div>
    );
  }

  const { entries, stats, currentUserEntry } = data;
  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <div className="space-y-6">
      {/* Update Schedule Info */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          Rankings update daily at midnight UTC (your local time: {nextUpdateInfo.timeString}).
          {nextUpdateInfo.hoursUntil > 0 && (
            <> Next update in {nextUpdateInfo.hoursUntil}h {nextUpdateInfo.minutesUntil}m.</>
          )}
          {nextUpdateInfo.hoursUntil === 0 && (
            <> Next update in {nextUpdateInfo.minutesUntil}m.</>
          )}
        </AlertDescription>
      </Alert>

      {/* Metric Selector */}
      <Tabs value={metric} onValueChange={(v) => setMetric(v as LeaderboardMetric)}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
          {METRICS.map((m) => (
            <TabsTrigger 
              key={m.value} 
              value={m.value}
              className="flex flex-col gap-0.5 px-2"
            >
              <span className="text-xs sm:text-sm font-medium">{m.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Period Selector */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          {PERIODS.map((p) => (
            <TabsTrigger key={p.value} value={p.value}>
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Stats Overview */}
      <LeaderboardStats stats={stats} metric={metric} />

      {/* User's Current Rank */}
      {currentUserEntry && (
        <UserRankCard 
          entry={currentUserEntry} 
          metric={metric} 
          totalParticipants={stats.totalParticipants} 
        />
      )}

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <LeaderboardPodium entries={topThree} metric={metric} />
      )}

      {/* Full Leaderboard Table */}
      <LeaderboardTable entries={remaining} metric={metric} startRank={4} />
    </div>
  );
}
