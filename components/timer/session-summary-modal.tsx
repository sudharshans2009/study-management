"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { TimerSession } from "@/actions/timer-actions";
import { completeTimerSession } from "@/actions/timer-actions";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: TimerSession | null;
  onClose: () => void;
}

export function SessionSummaryModal({
  open,
  onOpenChange,
  session,
  onClose,
}: SessionSummaryModalProps) {
  const [focusScore, setFocusScore] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!session) return;

    try {
      setIsSubmitting(true);
      const result = await completeTimerSession(session.id, {
        focusScore: focusScore > 0 ? focusScore : undefined,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        toast.success("Session saved successfully!");
        handleClose();
      } else {
        toast.error(result.error || "Failed to save session");
      }
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error("Failed to save session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFocusScore(0);
    setNotes("");
    onClose();
  };

  if (!session) return null;

  const durationMinutes = Math.round(session.duration / 60);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Session Complete! 🎉</DialogTitle>
          <DialogDescription>
            Great work! You studied for {durationMinutes} minute{durationMinutes !== 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Focus Score */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              How focused were you? (Optional)
            </Label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => setFocusScore(score)}
                  aria-label={`Rate focus ${score} out of 5 stars`}
                  title={`${score} star${score !== 1 ? "s" : ""}`}
                  className={cn(
                    "p-2 rounded-lg transition-all hover:scale-110",
                    focusScore >= score
                      ? "text-yellow-500"
                      : "text-muted-foreground hover:text-yellow-500"
                  )}
                >
                  <Star
                    className="h-8 w-8"
                    fill={focusScore >= score ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
            {focusScore > 0 && (
              <p className="text-xs text-center text-muted-foreground">
                {focusScore === 1 && "Struggled to focus"}
                {focusScore === 2 && "Somewhat distracted"}
                {focusScore === 3 && "Average focus"}
                {focusScore === 4 && "Good focus"}
                {focusScore === 5 && "Excellent focus!"}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="session-notes" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="session-notes"
              placeholder="What did you learn or accomplish?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Skip
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Session"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
