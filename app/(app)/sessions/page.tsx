"use client";

import { useState, useEffect, useCallback } from "react";
import { getSessions, getSessionStats } from "@/actions/session-actions";
import type { SessionWithSubject, SessionFilters, SessionSort } from "@/actions/session-actions";
import { SessionStats } from "@/components/sessions/session-stats";
import { SessionFiltersBar } from "@/components/sessions/session-filters-bar";
import { SessionList } from "@/components/sessions/session-list";
import { EmptySessionsState } from "@/components/sessions/empty-sessions-state";
import { SessionListSkeleton } from "@/components/sessions/session-list-skeleton";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useSessionCleanup } from "@/hooks/use-session-cleanup";
import { useSessionExpiryNotifications } from "@/hooks/use-session-expiry-notifications";

type SessionStatsData = {
  totalSessions: number;
  totalMinutes: number;
  totalHours: string;
  avgMinutes: number;
  longestMinutes: number;
  avgFocusScore: string | null;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionWithSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SessionStatsData | null>(null);
  
  // Auto-cleanup expired paused sessions
  useSessionCleanup();
  
  // Show notifications for sessions about to expire
  useSessionExpiryNotifications();
  
  const [filters, setFilters] = useState<SessionFilters>({
    dateRange: "all",
  });
  
  const [sort, setSort] = useState<SessionSort>({
    field: "startTime",
    order: "desc",
  });

  // Load sessions
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getSessions(filters, sort);
      if (result.success && result.data) {
        setSessions(result.data);
      } else {
        console.error("Failed to load sessions:", result.error);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sort]);

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const result = await getSessionStats(filters.dateRange || "all");
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, [filters.dateRange]);

  // Load data on mount and when filters/sort change
  useEffect(() => {
    loadSessions();
    loadStats();
  }, [loadSessions, loadStats]);

  // Toggle sort order
  const toggleSort = () => {
    setSort((prev) => ({
      ...prev,
      order: prev.order === "desc" ? "asc" : "desc",
    }));
  };

  const handleFiltersChange = (newFilters: Partial<SessionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleRefresh = () => {
    loadSessions();
    loadStats();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Study Sessions</h1>
            <p className="text-muted-foreground mt-2">
              Track and analyze your study history
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSort}
            className="gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sort.order === "desc" ? "Newest First" : "Oldest First"}
          </Button>
        </div>

        {/* Statistics Cards */}
        {stats && <SessionStats stats={stats} period={filters.dateRange || "all"} />}

        {/* Filters */}
        <SessionFiltersBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Sessions List */}
        {isLoading ? (
          <SessionListSkeleton />
        ) : sessions.length === 0 ? (
          <EmptySessionsState
            hasFilters={
              filters.dateRange !== "all" ||
              (filters.subjectIds && filters.subjectIds.length > 0) ||
              (filters.types && filters.types.length > 0) ||
              (filters.statuses && filters.statuses.length > 0) ||
              (filters.focusScores && filters.focusScores.length > 0) ||
              !!filters.searchQuery
            }
            onClearFilters={() =>
              setFilters({
                dateRange: "all",
              })
            }
          />
        ) : (
          <SessionList sessions={sessions} onRefresh={handleRefresh} />
        )}
      </div>
    </div>
  );
}
