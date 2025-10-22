"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Archive,
  Trash2,
  Clock,
  Calendar,
  CheckCircle2,
  StopCircle,
  History,
  Flame,
} from "lucide-react";
import { updateGoal, deleteGoal } from "@/actions/goals-actions";
import { toast } from "sonner";
import { EndTrackingDialog } from "./end-tracking-dialog";

type GoalCardProps = {
  goal: {
    id: string;
    title: string;
    description?: string | null;
    category: "study" | "subject";
    period: "daily" | "weekly" | "monthly";
    unit: "minutes" | "sessions";
    target: number;
    status: "active" | "completed" | "archived";
    currentStreak?: number | null;
    longestStreak?: number | null;
    endDate?: Date | null;
    progress?: {
      progress: number;
      target: number;
      percentage: number;
      unit: string;
    } | null;
  };
  onUpdate: () => void;
  onDelete: () => void;
};

export function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEndTrackingDialog, setShowEndTrackingDialog] = useState(false);

  const progress = goal.progress?.progress || 0;
  const target = goal.target;
  const percentage = goal.progress?.percentage || 0;
  const isCompleted = percentage >= 100;

  // Archive/Unarchive mutation
  const archiveMutation = useMutation({
    mutationFn: async (newStatus: "active" | "archived") => {
      const result = await updateGoal(goal.id, { status: newStatus });
      if (!result.success) {
        throw new Error(result.error || "Failed to update goal");
      }
      return result;
    },
    onSuccess: (_, newStatus) => {
      toast.success(
        newStatus === "archived"
          ? "Goal archived successfully"
          : "Goal unarchived successfully"
      );
      onUpdate();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update goal");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const result = await deleteGoal(goal.id);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete goal");
      }
      return result;
    },
    onSuccess: () => {
      onDelete();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete goal");
    },
    onSettled: () => {
      setShowDeleteDialog(false);
    },
  });

  const handleArchive = () => {
    const newStatus = goal.status === "archived" ? "active" : "archived";
    archiveMutation.mutate(newStatus);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

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

  const getPeriodIcon = () => {
    switch (goal.period) {
      case "daily":
        return <Clock className="h-3 w-3" />;
      case "weekly":
        return <Calendar className="h-3 w-3" />;
      case "monthly":
        return <Calendar className="h-3 w-3" />;
    }
  };

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{goal.title}</h3>
              {isCompleted && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
            {goal.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {goal.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {getPeriodIcon()}
                <span className="ml-1 capitalize">{goal.period}</span>
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {goal.category}
              </Badge>
              {goal.status === "archived" && (
                <Badge variant="secondary" className="text-xs">
                  Archived
                </Badge>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/goals/${goal.id}`} className="cursor-pointer">
                  <History className="h-4 w-4 mr-2" />
                  View History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!goal.endDate && (
                <>
                  <DropdownMenuItem onClick={() => setShowEndTrackingDialog(true)}>
                    <StopCircle className="h-4 w-4 mr-2" />
                    End Tracking
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="h-4 w-4 mr-2" />
                {goal.status === "archived" ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">
              {formatValue(progress, goal.unit)} / {formatValue(target, goal.unit)}
            </span>
          </div>

          <Progress value={percentage} className="h-2" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{percentage}% complete</span>
            {isCompleted && (
              <span className="text-green-600 font-medium">Goal reached! 🎉</span>
            )}
          </div>

          {/* Streak indicator */}
          {(goal.currentStreak ?? 0) > 0 && (
            <div className="flex items-center gap-2 text-sm pt-2 border-t">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-medium">
                {goal.currentStreak} {goal.period} streak
              </span>
              {(goal.longestStreak ?? 0) > (goal.currentStreak ?? 0) && (
                <span className="text-muted-foreground text-xs">
                  (Best: {goal.longestStreak})
                </span>
              )}
            </div>
          )}

          {/* Ended indicator */}
          {goal.endDate && (
            <div className="flex items-center gap-2 text-sm pt-2 border-t text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Tracking ended •{" "}
                {goal.status === "completed" ? "Completed" : "Archived"}
              </span>
            </div>
          )}
        </div>
      </Card>

      <EndTrackingDialog
        open={showEndTrackingDialog}
        onOpenChange={setShowEndTrackingDialog}
        goalId={goal.id}
        goalTitle={goal.title}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{goal.title}&rdquo;? This
              action cannot be undone and will remove all progress data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
