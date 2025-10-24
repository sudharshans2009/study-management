"use client";

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
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface StopConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  onCancel: () => void;
  timeElapsed: string;
  isStopwatch?: boolean;
}

export function StopConfirmationDialog({
  open,
  onOpenChange,
  onComplete,
  onCancel,
  timeElapsed,
  isStopwatch = false,
}: StopConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isStopwatch ? "End Stopwatch Session?" : "Stop Timer?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>You've been studying for <span className="font-semibold text-foreground">{timeElapsed}</span>.</p>
            <p className="text-sm">Choose how you want to end this session:</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Continue Session
            </Button>
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={onCancel}
            className="w-full sm:w-auto gap-2"
          >
            <XCircle className="h-4 w-4" />
            Cancel Session
          </Button>
          <AlertDialogAction asChild>
            <Button
              onClick={onComplete}
              className="w-full sm:w-auto gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete Session
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
