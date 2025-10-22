"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { Target } from "lucide-react";

interface FocusScoreChartProps {
  average: number;
  distribution: Array<{
    range: string;
    count: number;
  }>;
}

const chartConfig = {
  "0": {
    label: "0 Stars",
    color: "var(--chart-5)",
  },
  "1": {
    label: "1 Star",
    color: "var(--chart-4)",
  },
  "2": {
    label: "2 Stars",
    color: "var(--chart-3)",
  },
  "3": {
    label: "3 Stars",
    color: "var(--chart-2)",
  },
  "4": {
    label: "4 Stars",
    color: "var(--chart-1)",
  },
  "5": {
    label: "5 Stars",
    color: "hsl(142 76% 36%)",
  },
};

// Fixed color mapping for each score
const colorMap: Record<string, string> = {
  '0': 'var(--chart-5)',
  '1': 'var(--chart-4)',
  '2': 'var(--chart-3)',
  '3': 'var(--chart-2)',
  '4': 'var(--chart-1)',
  '5': 'hsl(142 76% 36%)', // Green for perfect score
};

export function FocusScoreChart({ average, distribution }: FocusScoreChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Focus Score Analysis
        </CardTitle>
        <CardDescription>
          Your focus patterns and performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">Average Focus Score</p>
            <p className="text-3xl font-bold">{average.toFixed(1)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Out of 5</p>
            <p className="text-xs text-muted-foreground mt-1">
              {average >= 4.5 ? '⭐⭐⭐⭐⭐ Excellent!' :
               average >= 3.5 ? '⭐⭐⭐⭐ Great' :
               average >= 2.5 ? '⭐⭐⭐ Good' :
               average >= 1.5 ? '⭐⭐ Fair' :
               '⭐ Keep improving!'}
            </p>
          </div>
        </div>

        {distribution.some(d => d.count > 0) ? (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="range" 
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
                dataKey="count" 
                radius={[4, 4, 0, 0]} 
              >
                {distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorMap[entry.range]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
            Complete sessions to see focus score distribution
          </div>
        )}
      </CardContent>
    </Card>
  );
}
