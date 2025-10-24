"use client";

import { LeaderboardEntry, LeaderboardMetric, formatLeaderboardValue } from "@/lib/leaderboard-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, TrendingDown } from "lucide-react";

interface UserRankCardProps {
  entry: LeaderboardEntry;
  metric: LeaderboardMetric;
  totalParticipants: number;
}

export function UserRankCard({ entry, metric, totalParticipants }: UserRankCardProps) {
  const initials = entry.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '??';
  const value = formatLeaderboardValue(entry.value, metric);
  
  // Calculate percentile (top X%)
  const percentile = totalParticipants > 0 
    ? Math.round(((totalParticipants - entry.rank + 1) / totalParticipants) * 100)
    : 0;

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-primary" />
          Your Ranking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={entry.avatar || undefined} alt={entry.name || 'You'} />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-base">
                  {entry.name || entry.username}
                </p>
                <p className="text-sm text-muted-foreground">
                  Rank #{entry.rank} of {totalParticipants}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {value}
                </p>
                {entry.change !== undefined && entry.change !== 0 && (
                  <Badge variant={entry.change > 0 ? "default" : "destructive"} className="mt-1">
                    {entry.change > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(entry.change)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Percentile Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Top {percentile}%</span>
                <span>{percentile}th percentile</span>
              </div>
              <Progress value={percentile} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
