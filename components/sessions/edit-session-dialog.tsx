"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star } from "lucide-react";
import { updateSessionMetadata } from "@/actions/session-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: {
    id: string;
    focusScore?: number | null;
    notes?: string | null;
    status: string;
  } | null;
  onSuccess: () => void;
}

export function EditSessionDialog({
  open,
  onOpenChange,
  session,
  onSuccess,
}: EditSessionDialogProps) {
  const [focusScore, setFocusScore] = useState(session?.focusScore || 3);
  const [notes, setNotes] = useState(session?.notes || "");
  const [status, setStatus] = useState(session?.status || "completed");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const result = await updateSessionMetadata(session.id, {
        focusScore,
        notes: notes.trim() || undefined,
        status: status as "completed" | "cancelled",
      });

      if (result.success) {
        toast.success("Session updated successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to update session");
      }
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Failed to update session");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Session Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Focus Score */}
          <div className="space-y-2">
            <Label>Focus Score</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setFocusScore(score)}
                  className="transition-transform hover:scale-110"
                  aria-label={`Rate focus ${score} out of 5`}
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      score <= focusScore
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {focusScore === 1 && "Struggled to focus"}
              {focusScore === 2 && "Somewhat distracted"}
              {focusScore === 3 && "Average focus"}
              {focusScore === 4 && "Good focus"}
              {focusScore === 5 && "Excellent focus!"}
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <RadioGroup value={status} onValueChange={setStatus}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completed" id="completed" />
                <Label htmlFor="completed" className="font-normal cursor-pointer">
                  Completed
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cancelled" id="cancelled" />
                <Label htmlFor="cancelled" className="font-normal cursor-pointer">
                  Cancelled
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="What did you study? Any reflections?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
