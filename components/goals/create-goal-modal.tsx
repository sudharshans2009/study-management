"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createGoal } from "@/actions/goals-actions";
import { getUserSubjects } from "@/actions/settings-actions";
import { toast } from "sonner";
import { getSubjectColorClasses } from "@/lib/subject-colors";
import { cn } from "@/lib/utils";

type CreateGoalModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function CreateGoalModal({
  open,
  onClose,
  onSuccess,
}: CreateGoalModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "study" as "study" | "subject",
    period: "daily" as "daily" | "weekly" | "monthly",
    unit: "minutes" as "minutes" | "sessions",
    target: "",
    subjectId: "",
  });

  // Fetch subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const result = await getUserSubjects();
      if (!result.success) {
        return [];
      }
      return result.data || [];
    },
    enabled: open,
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async () => {
      const target = parseInt(formData.target);
      if (isNaN(target) || target <= 0) {
        throw new Error("Please enter a valid target");
      }

      if (formData.category === "subject" && !formData.subjectId) {
        throw new Error("Please select a subject");
      }

      const result = await createGoal({
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        period: formData.period,
        unit: formData.unit,
        target,
        subjectId:
          formData.category === "subject" ? formData.subjectId : undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create goal");
      }

      return result;
    },
    onSuccess: () => {
      setFormData({
        title: "",
        description: "",
        category: "study",
        period: "daily",
        unit: "minutes",
        target: "",
        subjectId: "",
      });
      onSuccess();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create goal");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    createGoalMutation.mutate();
  };

  const handleCategoryChange = (category: "study" | "subject") => {
    setFormData({
      ...formData,
      category,
      subjectId: category === "study" ? "" : formData.subjectId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogDescription>
              Set a study or subject goal to track your progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Study 2 hours daily"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Row 1: Category and Period */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-full" id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="study">Study (Overall)</SelectItem>
                    <SelectItem value="subject">Subject (Specific)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">
                  Period <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.period}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      period: value as "daily" | "weekly" | "monthly",
                    })
                  }
                >
                  <SelectTrigger className="w-full" id="period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject (only for subject goals) */}
            {formData.category === "subject" && (
              <div className="space-y-2">
                <Label htmlFor="subject">
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subjectId: value })
                  }
                >
                  <SelectTrigger className="w-full" id="subject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full",
                              getSubjectColorClasses(subject.color).bg
                            )}
                          />
                          {subject.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Row 2: Unit and Target */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">
                  Unit <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      unit: value as "minutes" | "sessions",
                    })
                  }
                >
                  <SelectTrigger className="w-full" id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="sessions">Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">
                  Target <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="target"
                  type="number"
                  min="1"
                  placeholder="e.g., 120"
                  value={formData.target}
                  onChange={(e) =>
                    setFormData({ ...formData, target: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createGoalMutation.isPending}>
              {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
