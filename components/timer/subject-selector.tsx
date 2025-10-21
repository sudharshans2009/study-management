"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserSubjects } from "@/actions/timer-actions";
import { BookOpen } from "lucide-react";

interface SubjectSelectorProps {
  selectedSubject: string | null;
  onSubjectChange: (subjectId: string | null) => void;
}

export function SubjectSelector({
  selectedSubject,
  onSubjectChange,
}: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const result = await getUserSubjects();
        if (result.success && result.subjects) {
          setSubjects(result.subjects);
        }
      } catch (error) {
        console.error("Error loading subjects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubjects();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Subject (Optional)</Label>
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Subject</Label>
        <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
          <BookOpen className="h-4 w-4 inline mr-2" />
          No subjects yet. Create one in your dashboard!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="subject-select" className="text-sm font-medium">
        Subject (Optional)
      </Label>
      <Select
        value={selectedSubject || "none"}
        onValueChange={(value) => onSubjectChange(value === "none" ? null : value)}
      >
        <SelectTrigger id="subject-select">
          <SelectValue placeholder="Select a subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No subject</SelectItem>
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
