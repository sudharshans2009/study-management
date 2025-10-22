"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, TrendingUp } from "lucide-react";

interface ProductivityInsightsProps {
  mostProductiveDay: string;
  mostProductiveHour: number;
  averageSessionsPerDay: number;
}

export function ProductivityInsights({ 
  mostProductiveDay, 
  mostProductiveHour, 
  averageSessionsPerDay 
}: ProductivityInsightsProps) {
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Productivity Insights
        </CardTitle>
        <CardDescription>
          Discover your most productive patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Most Productive Day */}
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Most Productive Day</p>
            <p className="text-2xl font-bold mt-1">{mostProductiveDay}</p>
            <p className="text-xs text-muted-foreground mt-1">
              You tend to study more on {mostProductiveDay}s
            </p>
          </div>
        </div>

        {/* Most Productive Hour */}
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Peak Study Time</p>
            <p className="text-2xl font-bold mt-1">{formatHour(mostProductiveHour)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your most productive hour of the day
            </p>
          </div>
        </div>

        {/* Average Sessions Per Day */}
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Daily Average</p>
            <p className="text-2xl font-bold mt-1">
              {averageSessionsPerDay.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sessions per day on average
            </p>
          </div>
        </div>

        {/* Tip */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm font-medium mb-1">💡 Tip</p>
          <p className="text-xs text-muted-foreground">
            Schedule your most challenging subjects during your peak productivity time
            ({formatHour(mostProductiveHour)}) for better results!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
