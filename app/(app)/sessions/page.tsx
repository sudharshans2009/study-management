"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSessions, getSessionStats } from "@/actions/session-actions";
import type { SessionFilters, SessionSort } from "@/actions/session-actions";
import { SessionStats } from "@/components/sessions/session-stats";
import { SessionFiltersBar } from "@/components/sessions/session-filters-bar";
import { SessionList } from "@/components/sessions/session-list";
import { EmptySessionsState } from "@/components/sessions/empty-sessions-state";
import { SessionListSkeleton } from "@/components/sessions/session-list-skeleton";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, History } from "lucide-react";
import { useSessionCleanup } from "@/hooks/use-session-cleanup";
import { useSessionExpiryNotifications } from "@/hooks/use-session-expiry-notifications";

export default function SessionsPage() {
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

  // Fetch sessions with React Query
  const {
    data: sessions = [],
    isLoading,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["sessions", filters, sort],
    queryFn: async () => {
      const result = await getSessions(filters, sort);
      if (!result.success) {
        console.error("Failed to load sessions:", result.error);
        return [];
      }
      return result.data || [];
    },
  });

  // Fetch session statistics
  const { data: stats = null, refetch: refetchStats } = useQuery({
    queryKey: ["sessionStats", filters.dateRange],
    queryFn: async () => {
      const result = await getSessionStats(filters.dateRange || "all");
      if (!result.success) {
        console.error("Failed to load stats:", result.error);
        return null;
      }
      return result.data || null;
    },
  });

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
    refetchSessions();
    refetchStats();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="h-8 w-8" />
            Study Sessions
          </h1>
          <p className="text-muted-foreground mt-1">
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
  );
}
