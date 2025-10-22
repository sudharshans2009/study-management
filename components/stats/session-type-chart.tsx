"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";

interface SessionTypeChartProps {
  types: Array<{
    type: string;
    count: number;
    minutes: number;
    percentage: number;
  }>;
}

const chartConfig = {
  Pomodoro: {
    label: "Pomodoro",
    color: "var(--chart-1)",
  },
  Stopwatch: {
    label: "Stopwatch",
    color: "var(--chart-2)",
  },
  Timer: {
    label: "Timer",
    color: "var(--chart-3)",
  },
  Standard: {
    label: "Standard",
    color: "var(--chart-4)",
  },
};

// Fixed color mapping
const colorMap: Record<string, string> = {
  'Pomodoro': 'var(--chart-1)',
  'Stopwatch': 'var(--chart-2)',
  'Timer': 'var(--chart-3)',
  'Standard': 'var(--chart-4)',
};

export function SessionTypeChart({ types }: SessionTypeChartProps) {
  const data = types.map(t => ({
    type: t.type === 'pomodoro' ? 'Pomodoro' : 
          t.type === 'stopwatch' ? 'Stopwatch' : 
          t.type === 'timer' ? 'Timer' : 
          'Standard',
    sessions: t.count,
    minutes: t.minutes,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Types</CardTitle>
        <CardDescription>Breakdown by session type</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="type" 
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
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar 
                dataKey="minutes" 
                radius={[4, 4, 0, 0]} 
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorMap[entry.type]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No session type data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
