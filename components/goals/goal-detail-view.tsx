"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  ArrowLeft,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  Award,
} from "lucide-react";
import { getGoalHistory } from "@/actions/goals-actions";

interface GoalDetailViewProps {
  goalId: string;
}

export function GoalDetailView({ goalId }: GoalDetailViewProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["goal-history", goalId],
    queryFn: async () => {
      const result = await getGoalHistory(goalId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as {
        goal: {
          id: string;
          title: string;
          description?: string | null;
          period: "daily" | "weekly" | "monthly";
          unit: "minutes" | "sessions";
          target: number;
          currentStreak: number | null;
          longestStreak: number | null;
          totalPeriodsCompleted: number | null;
          startDate: Date | null;
          endDate: Date | null;
          endReason: string | null;
          createdAt: Date;
        };
        periods: Array<{
          start: Date;
          end: Date;
          progress: number;
          target: number;
          completed: boolean;
          percentage: number;
        }>;
        totalPeriods: number;
        completedPeriods: number;
        currentStreak: number;
        longestStreak: number;
      };
    },
  });

  if (isLoading) {
    return <GoalDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load goal details</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/goals">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Link>
        </Button>
      </div>
    );
  }

  const { goal, periods, totalPeriods, completedPeriods } = data;
  const completionRate =
    totalPeriods > 0 ? Math.round((completedPeriods / totalPeriods) * 100) : 0;

  // Prepare chart data (last 30 periods or all if less)
  const chartData = periods
    .slice(0, 30)
    .reverse()
    .map((period) => ({
      date: format(new Date(period.start), "MMM dd"),
      progress: period.progress,
      target: period.target,
      percentage: period.percentage,
    }));

  const formatValue = (value: number, unit: string) => {
    if (unit === "minutes") {
      const hours = Math.floor(value / 60);
      const mins = value % 60;
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      return `${mins}m`;
    }
    return `${value} ${value === 1 ? "session" : "sessions"}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/goals">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Goals
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {goal.title}
          </h1>
          {goal.description && (
            <p className="text-muted-foreground mt-1">{goal.description}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="capitalize">
              {goal.period}
            </Badge>
            <Badge variant="secondary">
              Target: {formatValue(goal.target, goal.unit)}
            </Badge>
            {goal.endDate && (
              <Badge variant="secondary">
                {goal.endReason === "completed" ? "Completed" : "Archived"}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Periods</p>
              <p className="text-3xl font-bold mt-1">{totalPeriods}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Since {format(new Date(goal.startDate || goal.createdAt), "MMM dd, yyyy")}
              </p>
            </div>
            <Calendar className="h-10 w-10 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold mt-1">{completedPeriods}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {completionRate}% completion rate
              </p>
            </div>
            <CheckCircle2 className="h-10 w-10 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-3xl font-bold mt-1">{goal.currentStreak ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {goal.period}s in a row
              </p>
            </div>
            <Flame className="h-10 w-10 text-orange-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
              <p className="text-3xl font-bold mt-1">{goal.longestStreak ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Personal best</p>
            </div>
            <Award className="h-10 w-10 text-primary opacity-20" />
          </div>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
          <CardDescription>
            Your progress over the last {Math.min(30, periods.length)} periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="progress"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorProgress)"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No data available yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Period History */}
      <Card>
        <CardHeader>
          <CardTitle>Period History</CardTitle>
          <CardDescription>
            All tracking periods for this goal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {periods.length > 0 ? (
              periods.map((period, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(period.start), "MMM dd, yyyy")} -{" "}
                        {format(new Date(period.end), "MMM dd, yyyy")}
                      </span>
                      {period.completed && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <Progress value={period.percentage} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatValue(period.progress, goal.unit)} /{" "}
                        {formatValue(period.target, goal.unit)}
                      </span>
                      <span className="font-medium">{period.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No periods tracked yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GoalDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
      <Skeleton className="h-64" />
    </div>
  );
}
