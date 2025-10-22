import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { GoalDetailView } from "@/components/goals/goal-detail-view";
import { Skeleton } from "@/components/ui/skeleton";

interface GoalDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params;
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="container max-w-6xl py-8">
      <Suspense fallback={<GoalDetailSkeleton />}>
        <GoalDetailView goalId={id} />
      </Suspense>
    </div>
  );
}

function GoalDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
      <Skeleton className="h-64" />
    </div>
  );
}
