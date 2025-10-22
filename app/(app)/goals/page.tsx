"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Target, TrendingUp } from "lucide-react";
import { CreateGoalModal } from "@/components/goals/create-goal-modal";
import { GoalCard } from "@/components/goals/goal-card";
import { getUserGoalsWithProgress } from "@/actions/goals-actions";
import { toast } from "sonner";
import { useGoalPeriodCheck } from "@/hooks/use-goal-period-check";

type GoalWithProgress = {
  id: string;
  title: string;
  description?: string | null;
  category: "study" | "subject";
  period: "daily" | "weekly" | "monthly";
  unit: "minutes" | "sessions";
  target: number;
  subjectId?: string | null;
  status: "active" | "completed" | "archived";
  currentStreak?: number | null;
  longestStreak?: number | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  progress?: {
    progress: number;
    target: number;
    percentage: number;
    unit: string;
  } | null;
};

export default function GoalsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<{
    category?: "study" | "subject";
    period?: "daily" | "weekly" | "monthly";
    status?: "active" | "completed" | "archived";
  }>({ status: "active" });

  // Enable automatic period checking
  useGoalPeriodCheck(true);

  // Fetch goals with React Query
  const {
    data: goals = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["goals", filter],
    queryFn: async () => {
      const result = await getUserGoalsWithProgress(filter);

      if (!result.success) {
        toast.error(result.error || "Failed to load goals");
        return [];
      }

      return (result.data || []) as GoalWithProgress[];
    },
  });

  const handleGoalCreated = () => {
    setShowCreateModal(false);
    refetch();
    toast.success("Goal created successfully!");
  };

  const handleGoalUpdated = () => {
    refetch();
  };

  const handleGoalDeleted = () => {
    refetch();
    toast.success("Goal deleted successfully!");
  };

  // Filter goals by category
  const studyGoals = goals.filter((g) => g.category === "study");
  const subjectGoals = goals.filter((g) => g.category === "subject");

  // Calculate overall stats
  const activeGoals = goals.filter((g) => g.status === "active");
  const completedCount = goals.filter(
    (g) =>
      g.status === "active" &&
      g.progress &&
      g.progress.percentage >= 100
  ).length;
  const totalProgress = activeGoals.length
    ? Math.round(
        activeGoals.reduce(
          (sum, g) => sum + (g.progress?.percentage || 0),
          0
        ) / activeGoals.length
      )
    : 0;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8" />
            Goals
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your study and subject goals
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Goals</p>
              <p className="text-3xl font-bold mt-1">{activeGoals.length}</p>
            </div>
            <Target className="h-10 w-10 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold mt-1">{completedCount}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Progress</p>
              <p className="text-3xl font-bold mt-1">{totalProgress}%</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold">%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          variant={!filter.status ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter({ ...filter, status: undefined })}
        >
          All
        </Button>
        <Button
          variant={filter.status === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter({ ...filter, status: "active" })}
        >
          Active
        </Button>
        <Button
          variant={filter.status === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter({ ...filter, status: "completed" })}
        >
          Completed
        </Button>
        <Button
          variant={filter.status === "archived" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter({ ...filter, status: "archived" })}
        >
          Archived
        </Button>
        <div className="border-l mx-2" />
        <Button
          variant={filter.period === "daily" ? "default" : "outline"}
          size="sm"
          onClick={() =>
            setFilter({
              ...filter,
              period: filter.period === "daily" ? undefined : "daily",
            })
          }
        >
          Daily
        </Button>
        <Button
          variant={filter.period === "weekly" ? "default" : "outline"}
          size="sm"
          onClick={() =>
            setFilter({
              ...filter,
              period: filter.period === "weekly" ? undefined : "weekly",
            })
          }
        >
          Weekly
        </Button>
        <Button
          variant={filter.period === "monthly" ? "default" : "outline"}
          size="sm"
          onClick={() =>
            setFilter({
              ...filter,
              period: filter.period === "monthly" ? undefined : "monthly",
            })
          }
        >
          Monthly
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading goals...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && goals.length === 0 && (
        <Card className="p-12 text-center">
          <Target className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first goal to start tracking your progress
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Goal
          </Button>
        </Card>
      )}

      {/* Goals Lists */}
      {!isLoading && goals.length > 0 && (
        <div className="space-y-8">
          {/* Study Goals */}
          {studyGoals.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Study Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={handleGoalUpdated}
                    onDelete={handleGoalDeleted}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Subject Goals */}
          {subjectGoals.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Subject Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={handleGoalUpdated}
                    onDelete={handleGoalDeleted}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Goal Modal */}
      <CreateGoalModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleGoalCreated}
      />
    </div>
  );
}
