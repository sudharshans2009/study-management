import { Suspense } from "react";
import { Metadata } from "next";
import { StatsView } from "@/components/stats/stats-view";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Statistics | SS.Study",
  description: "View detailed study statistics, analyze your performance, and track your progress over time",
};

export default function StatsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <BarChart3 className="h-10 w-10" />
            Statistics
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your study progress and analyze your performance
          </p>
        </div>

        <Suspense fallback={<StatsLoadingSkeleton />}>
          <StatsView />
        </Suspense>
      </div>
    </div>
  );
}

function StatsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
