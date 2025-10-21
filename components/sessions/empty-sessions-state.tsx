"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Filter } from "lucide-react";
import Link from "next/link";

interface EmptySessionsStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptySessionsState({
  hasFilters,
  onClearFilters,
}: EmptySessionsStateProps) {
  if (hasFilters) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <Filter className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold">No sessions found</h3>
          <p className="text-muted-foreground">
            No sessions match your current filters. Try adjusting your filter
            criteria or clear all filters.
          </p>
          <Button onClick={onClearFilters}>Clear All Filters</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-12 text-center">
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Timer className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">No study sessions yet</h3>
        <p className="text-muted-foreground">
          Start your first study session to see it appear here. Track your
          progress and build better study habits!
        </p>
        <Link href="/timer">
          <Button>Start Your First Session</Button>
        </Link>
      </div>
    </Card>
  );
}
