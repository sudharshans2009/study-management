"use client";

import { useState, useEffect } from "react";
import type { SessionFilters } from "@/actions/session-actions";
import { getUserSubjects } from "@/actions/timer-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SessionFiltersBarProps {
  filters: SessionFilters;
  onFiltersChange: (filters: Partial<SessionFilters>) => void;
}

export function SessionFiltersBar({ filters, onFiltersChange }: SessionFiltersBarProps) {
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadSubjects = async () => {
      const result = await getUserSubjects();
      if (result.success && result.subjects) {
        setSubjects(result.subjects);
      }
    };
    loadSubjects();
  }, []);

  const handleSubjectToggle = (subjectId: string) => {
    const current = filters.subjectIds || [];
    const updated = current.includes(subjectId)
      ? current.filter((id) => id !== subjectId)
      : [...current, subjectId];
    onFiltersChange({ subjectIds: updated.length > 0 ? updated : undefined });
  };

  const handleTypeToggle = (type: "timer" | "pomodoro" | "stopwatch") => {
    const current = filters.types || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFiltersChange({ types: updated.length > 0 ? updated : undefined });
  };

  const handleStatusToggle = (status: "completed" | "cancelled") => {
    const current = filters.statuses || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFiltersChange({ statuses: updated.length > 0 ? updated : undefined });
  };

  const handleFocusScoreToggle = (score: number) => {
    const current = filters.focusScores || [];
    const updated = current.includes(score)
      ? current.filter((s) => s !== score)
      : [...current, score];
    onFiltersChange({ focusScores: updated.length > 0 ? updated : undefined });
  };

  const handleSearchSubmit = () => {
    onFiltersChange({ searchQuery: searchQuery.trim() || undefined });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: "all",
      subjectIds: undefined,
      types: undefined,
      statuses: undefined,
      focusScores: undefined,
      searchQuery: undefined,
    });
    setSearchQuery("");
  };

  const hasActiveFilters =
    filters.dateRange !== "all" ||
    (filters.subjectIds && filters.subjectIds.length > 0) ||
    (filters.types && filters.types.length > 0) ||
    (filters.statuses && filters.statuses.length > 0) ||
    (filters.focusScores && filters.focusScores.length > 0) ||
    !!filters.searchQuery;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date-range">Time Period</Label>
          <Select
            value={filters.dateRange || "all"}
            onValueChange={(value) => onFiltersChange({ dateRange: value as "today" | "week" | "month" | "all" })}
          >
            <SelectTrigger id="date-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="space-y-2 sm:col-span-2 lg:col-span-3">
          <Label htmlFor="search">Search Notes</Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="Search in session notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit();
                }
              }}
            />
            <Button onClick={handleSearchSubmit} size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Subject Filters */}
      {subjects.length > 0 && (
        <div className="space-y-2">
          <Label>Subjects</Label>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <Badge
                key={subject.id}
                variant={
                  filters.subjectIds?.includes(subject.id) ? "default" : "outline"
                }
                className="cursor-pointer hover:opacity-80"
                onClick={() => handleSubjectToggle(subject.id)}
                style={{
                  backgroundColor: filters.subjectIds?.includes(subject.id)
                    ? subject.color
                    : undefined,
                  borderColor: subject.color,
                }}
              >
                {subject.name}
                {filters.subjectIds?.includes(subject.id) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Type Filters */}
      <div className="space-y-2">
        <Label>Session Type</Label>
        <div className="flex flex-wrap gap-2">
          {(["timer", "pomodoro", "stopwatch"] as const).map((type) => (
            <Badge
              key={type}
              variant={filters.types?.includes(type) ? "default" : "outline"}
              className="cursor-pointer hover:opacity-80"
              onClick={() => handleTypeToggle(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              {filters.types?.includes(type) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Status Filters */}
      <div className="space-y-2">
        <Label>Status</Label>
        <div className="flex flex-wrap gap-2">
          {(["completed", "cancelled"] as const).map((status) => (
            <Badge
              key={status}
              variant={filters.statuses?.includes(status) ? "default" : "outline"}
              className="cursor-pointer hover:opacity-80"
              onClick={() => handleStatusToggle(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {filters.statuses?.includes(status) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Focus Score Filters */}
      <div className="space-y-2">
        <Label>Focus Score</Label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <Badge
              key={score}
              variant={filters.focusScores?.includes(score) ? "default" : "outline"}
              className="cursor-pointer hover:opacity-80"
              onClick={() => handleFocusScoreToggle(score)}
            >
              {score} ★
              {filters.focusScores?.includes(score) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
