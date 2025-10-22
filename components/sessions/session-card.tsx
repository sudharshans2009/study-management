"use client";

import { useState } from "react";
import type { SessionWithSubject } from "@/actions/session-actions";
import { deleteSession, updateSessionMetadata } from "@/actions/session-actions";
import { resumeTimerSession } from "@/actions/timer-actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { format, formatDistanceToNow } from "date-fns";
import { Clock, Star, Timer, Trash2, Play, MoreVertical, Edit, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EditSessionDialog } from "./edit-session-dialog";
import { getSubjectColorClasses } from "@/lib/subject-colors";

interface SessionCardProps {
  session: SessionWithSubject;
  onDelete: () => void;
}

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Check if session can be resumed (paused within 24 hours)
  const canResumeSession =
    session.status === "paused" &&
    session.canResume &&
    session.pausedAt &&
    new Date().getTime() - new Date(session.pausedAt).getTime() <
      24 * 60 * 60 * 1000;

  const handleResume = async () => {
    try {
      setIsResuming(true);
      const result = await resumeTimerSession(session.id);
      if (result.success) {
        toast.success("Session resumed! Redirecting to timer...");
        setTimeout(() => {
          window.location.href = "/timer";
        }, 500);
      } else {
        toast.error(result.error || "Failed to resume session");
      }
    } catch (error) {
      console.error("Error resuming session:", error);
      toast.error("Failed to resume session");
    } finally {
      setIsResuming(false);
    }
  };

  const handleCancelPaused = async () => {
    try {
      setIsCancelling(true);
      const result = await updateSessionMetadata(session.id, {
        status: "cancelled",
      });
      if (result.success) {
        toast.success("Session cancelled");
        onDelete(); // Trigger refresh
      } else {
        toast.error(result.error || "Failed to cancel session");
      }
    } catch (error) {
      console.error("Error cancelling session:", error);
      toast.error("Failed to cancel session");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSession(session.id);
      if (result.success) {
        toast.success("Session deleted successfully");
        onDelete();
      } else {
        toast.error(result.error || "Failed to delete session");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTypeIcon = () => {
    switch (session.type) {
      case "pomodoro":
        return "🍅";
      case "stopwatch":
        return "⏱️";
      default:
        return "⏲️";
    }
  };

  const getStatusColor = () => {
    switch (session.status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          {/* Left Side - Main Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Type Badge */}
              <Badge variant="outline" className="gap-1">
                <span>{getTypeIcon()}</span>
                {session.type}
              </Badge>

              {/* Subject Badge */}
              {session.subject && (
                <Badge
                  variant="outline"
                  className={cn(
                    getSubjectColorClasses(session.subject.color).softBg,
                    getSubjectColorClasses(session.subject.color).border,
                    getSubjectColorClasses(session.subject.color).text
                  )}
                >
                  {session.subject.name}
                </Badge>
              )}

              {/* Resumable Indicator */}
              {canResumeSession && (
                <Badge
                  variant="outline"
                  className="border-yellow-500 bg-yellow-50 text-yellow-700 gap-1"
                >
                  ⏸️ Resumable
                </Badge>
              )}

              {/* Status Badge */}
              <Badge variant="outline" className={cn(getStatusColor())}>
                {session.status}
              </Badge>

              {/* Break Badge */}
              {session.isBreak && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                  Break
                </Badge>
              )}
            </div>

            {/* Time and Duration */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {format(new Date(session.startTime), "h:mm a")}
                {session.endTime && (
                  <> - {format(new Date(session.endTime), "h:mm a")}</>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(session.duration)}
              </div>
              
              {/* Time Remaining for Paused Sessions */}
              {session.status === "paused" &&
                session.remainingDuration != null && (
                  <div className="flex items-center gap-1 text-yellow-700">
                    <Clock className="h-4 w-4" />
                    {formatDuration(session.remainingDuration)} left
                  </div>
                )}
                
              {/* Paused Time */}
              {session.status === "paused" && session.pausedAt && (
                <div className="flex items-center gap-1">
                  <span className="text-xs">
                    Paused {formatDistanceToNow(new Date(session.pausedAt), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>

            {/* Focus Score */}
            {session.focusScore && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < session.focusScore!
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Notes */}
            {session.notes && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                {session.notes}
              </p>
            )}

            {/* Pomodoro Count */}
            {session.type === "pomodoro" && session.pomodoroCount > 0 && (
              <div className="text-xs text-muted-foreground">
                🍅 {session.pomodoroCount} pomodoro{session.pomodoroCount !== 1 ? "s" : ""} completed
              </div>
            )}
          </div>

          {/* Right Side - Actions */}
          <div className="flex flex-col gap-2">
            {/* Resume Button for Paused Sessions */}
            {canResumeSession && (
              <Button
                variant="default"
                size="sm"
                onClick={handleResume}
                disabled={isResuming}
                className="gap-2 bg-yellow-600 hover:bg-yellow-700"
              >
                {isResuming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resuming...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Resume
                  </>
                )}
              </Button>
            )}

            {/* Actions Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>

                {session.status === "paused" && (
                  <DropdownMenuItem
                    onClick={handleCancelPaused}
                    disabled={isCancelling}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {isCancelling ? "Cancelling..." : "Cancel Session"}
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this study
              session from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Session Dialog */}
      {showEditDialog && (
        <EditSessionDialog
          session={session}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={onDelete} // Triggers parent refresh
        />
      )}
    </>
  );
}
