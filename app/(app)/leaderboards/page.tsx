import { Suspense } from "react";
import { Metadata } from "next";
import { LeaderboardView } from "@/components/leaderboards/leaderboard-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Leaderboards | SS.Study",
  description: "Compete with learners worldwide, track your rankings, and climb the global study leaderboards",
};

export default function LeaderboardsPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Leaderboards</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Compete with learners worldwide • Daily updates at midnight UTC
        </p>
      </div>

      <Suspense fallback={<LeaderboardLoadingSkeleton />}>
        <LeaderboardView />
      </Suspense>
    </div>
  );
}

function LeaderboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-48" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}
