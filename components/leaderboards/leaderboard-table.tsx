"use client";

import { LeaderboardEntry, LeaderboardMetric, formatLeaderboardValue } from "@/lib/leaderboard-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  metric: LeaderboardMetric;
  startRank?: number;
}

export function LeaderboardTable({ entries, metric, startRank = 1 }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No participants yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="w-16 text-center hidden sm:table-cell">Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const initials = entry.name
              ?.split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase() || '??';
            const value = formatLeaderboardValue(entry.value, metric);
            
            return (
              <TableRow 
                key={entry.userId}
                className={cn(
                  "transition-colors",
                  entry.isCurrentUser && "bg-primary/5 hover:bg-primary/10"
                )}
              >
                {/* Rank */}
                <TableCell className="font-medium">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    entry.isCurrentUser && "bg-primary text-primary-foreground font-bold"
                  )}>
                    {entry.rank}
                  </div>
                </TableCell>

                {/* User */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.avatar || undefined} alt={entry.name || 'User'} />
                      <AvatarFallback className="text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {entry.name || entry.username}
                      </span>
                      {entry.isCurrentUser && (
                        <Badge variant="secondary" className="w-fit text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Score */}
                <TableCell className="text-right font-semibold text-lg">
                  {value}
                </TableCell>

                {/* Trend */}
                <TableCell className="text-center hidden sm:table-cell">
                  {entry.change !== undefined && (
                    <div className="flex items-center justify-center">
                      {entry.change > 0 && (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                      {entry.change < 0 && (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      {entry.change === 0 && (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
