"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { endGoalTracking } from "@/actions/goals-actions";
import { CheckCircle2, Archive } from "lucide-react";

interface EndTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  goalTitle: string;
}

export function EndTrackingDialog({
  open,
  onOpenChange,
  goalId,
  goalTitle,
}: EndTrackingDialogProps) {
  const [reason, setReason] = useState<"completed" | "archived">("completed");
  const queryClient = useQueryClient();

  const endTrackingMutation = useMutation({
    mutationFn: async () => {
      const result = await endGoalTracking(goalId, reason);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal", goalId] });
      toast.success("Goal tracking ended", {
        description:
          reason === "completed"
            ? "Congratulations on completing your goal! 🎉"
            : "Goal has been archived",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to end goal tracking", {
        description: error.message,
      });
    },
  });

  const handleEndTracking = () => {
    endTrackingMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End Goal Tracking</DialogTitle>
          <DialogDescription>
            Are you sure you want to stop tracking &ldquo;{goalTitle}&rdquo;? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={reason} onValueChange={(v) => setReason(v as "completed" | "archived")}>
            <div className="flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
              <RadioGroupItem value="completed" id="completed" className="mt-1" />
              <div className="flex-1">
                <Label
                  htmlFor="completed"
                  className="flex items-center gap-2 text-base font-semibold cursor-pointer"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Mark as Completed
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  You&apos;ve successfully achieved this goal and want to stop tracking it.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
              <RadioGroupItem value="archived" id="archived" className="mt-1" />
              <div className="flex-1">
                <Label
                  htmlFor="archived"
                  className="flex items-center gap-2 text-base font-semibold cursor-pointer"
                >
                  <Archive className="h-5 w-5 text-muted-foreground" />
                  Archive
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  You no longer want to track this goal, but didn&apos;t complete it.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={endTrackingMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEndTracking}
            disabled={endTrackingMutation.isPending}
            variant={reason === "completed" ? "default" : "secondary"}
          >
            {endTrackingMutation.isPending
              ? "Ending..."
              : reason === "completed"
                ? "Complete Goal"
                : "Archive Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
