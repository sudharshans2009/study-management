"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStudyStats, getStatsComparison } from "@/actions/stats-actions";
import type { StatsPeriod } from "@/lib/stats-utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsOverview } from "./stats-overview";
import { TimeDistributionChart } from "./time-distribution-chart";
import { SubjectBreakdownChart } from "./subject-breakdown-chart";
import { FocusScoreChart } from "./focus-score-chart";
import { ProductivityInsights } from "./productivity-insights";
import { SessionTypeChart } from "./session-type-chart";
import { ExportStatsButton } from "./export-stats-button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function StatsView() {
  const [period, setPeriod] = useState<StatsPeriod>('week');

  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['stats', period],
    queryFn: async () => {
      const result = await getStudyStats(period);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to load stats');
      }
      return result.data;
    },
  });

  const { data: comparisonData } = useQuery({
    queryKey: ['stats-comparison', period],
    queryFn: async () => {
      const result = await getStatsComparison(period);
      return result.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load statistics. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!statsData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No statistics available</p>
      </div>
    );
  }

  const hasData = statsData.totalSessions > 0;

  return (
    <div className="space-y-6">
      {/* Period Selector & Export */}
      <div className="flex items-center justify-between">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as StatsPeriod)}>
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="year">This Year</TabsTrigger>
            <TabsTrigger value="all-time">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {hasData && <ExportStatsButton stats={statsData} period={period} />}
      </div>

      {!hasData ? (
        <Alert>
          <AlertDescription>
            No study sessions recorded for this period. Start a study session to see your statistics!
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Overview Cards */}
          <StatsOverview stats={statsData} comparison={comparisonData} />

          {/* Time Distribution Chart */}
          <TimeDistributionChart 
            data={statsData.timeDistribution} 
            period={period}
          />

          {/* Two Column Layout */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Subject Breakdown */}
            <SubjectBreakdownChart subjects={statsData.subjectBreakdown} />

            {/* Session Types */}
            <SessionTypeChart types={statsData.sessionTypeBreakdown} />
          </div>

          {/* Focus Score & Productivity */}
          <div className="grid gap-6 md:grid-cols-2">
            <FocusScoreChart 
              average={statsData.averageFocusScore}
              distribution={statsData.focusScoreDistribution}
            />

            <ProductivityInsights
              mostProductiveDay={statsData.mostProductiveDay}
              mostProductiveHour={statsData.mostProductiveHour}
              averageSessionsPerDay={statsData.averageSessionsPerDay}
            />
          </div>
        </>
      )}
    </div>
  );
}
