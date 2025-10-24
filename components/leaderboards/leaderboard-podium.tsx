"use client";

import { LeaderboardEntry, LeaderboardMetric, formatLeaderboardValue } from "@/lib/leaderboard-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Medal, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
  metric: LeaderboardMetric;
}

const PODIUM_CONFIG = [
  { 
    rank: 2, 
    color: 'bg-slate-400', 
    icon: Medal, 
    iconColor: 'text-slate-600',
    height: 'h-40',
    order: 0,
  },
  { 
    rank: 1, 
    color: 'bg-yellow-400', 
    icon: Crown, 
    iconColor: 'text-yellow-600',
    height: 'h-52',
    order: 1,
  },
  { 
    rank: 3, 
    color: 'bg-amber-600', 
    icon: Trophy, 
    iconColor: 'text-amber-800',
    height: 'h-32',
    order: 2,
  },
];

export function LeaderboardPodium({ entries, metric }: LeaderboardPodiumProps) {
  if (entries.length === 0) {
    return null;
  }

  // Sort entries by rank to match podium config
  const sortedEntries = PODIUM_CONFIG.map(config => 
    entries.find(e => e.rank === config.rank)
  ).filter(Boolean) as LeaderboardEntry[];

  return (
    <div className="grid grid-cols-3 gap-4 items-end mb-8">
      {PODIUM_CONFIG.map((config) => {
        const entry = entries.find(e => e.rank === config.rank);
        
        if (!entry) {
          return <div key={config.rank} />;
        }

        const Icon = config.icon;
        const value = formatLeaderboardValue(entry.value, metric);
        const initials = entry.name
          ?.split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase() || '??';

        return (
          <div 
            key={entry.rank} 
            className={cn("flex flex-col items-center", config.order === 0 && "order-first sm:order-0")}
          >
            {/* Avatar */}
            <div className="relative mb-3">
              <Avatar className="h-20 w-20 border-4 border-background ring-4 ring-primary/20">
                <AvatarImage src={entry.avatar || undefined} alt={entry.name || 'User'} />
                <AvatarFallback className="text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {/* Rank Badge */}
              <div className={cn(
                "absolute -top-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center shadow-lg",
                config.color
              )}>
                <Icon className={cn("h-5 w-5", config.iconColor)} />
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-3 max-w-full px-2">
              <p className="font-semibold text-sm truncate max-w-[120px]">
                {entry.name || entry.username}
              </p>
              <p className="text-lg font-bold text-primary mt-1">
                {value}
              </p>
            </div>

            {/* Podium Stand */}
            <Card className={cn(
              "w-full transition-all hover:shadow-md",
              entry.isCurrentUser && "ring-2 ring-primary"
            )}>
              <CardContent className={cn(
                "p-4 flex flex-col items-center justify-end",
                config.height
              )}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-muted-foreground/30">
                    #{entry.rank}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
