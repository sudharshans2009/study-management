"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import type { StatsPeriod } from "@/lib/stats";

interface TimeDistributionChartProps {
  data: Array<{ date: string; minutes: number; sessions: number }>;
  period: StatsPeriod;
}

const chartConfig = {
  minutes: {
    label: "Study Time",
    color: "var(--primary)",
  },
};

export function TimeDistributionChart({ data }: TimeDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Time Distribution</CardTitle>
        <CardDescription>
          Your study time over the selected period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-minutes)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-minutes)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="var(--color-minutes)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#fillMinutes)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
