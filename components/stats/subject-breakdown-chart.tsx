"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SubjectBreakdownChartProps {
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    subjectColor: string;
    minutes: number;
    sessions: number;
    percentage: number;
  }>;
}

export function SubjectBreakdownChart({ subjects }: SubjectBreakdownChartProps) {
  const data = subjects.map(s => ({
    name: s.subjectName,
    value: s.minutes,
    color: s.subjectColor,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Breakdown</CardTitle>
        <CardDescription>Time spent on each subject</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}: {name?: string, percent?: number}) => 
                  `${name || ''} ${percent ? (percent * 100).toFixed(0) : '0'}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold">{payload[0].name}</span>
                        <span className="text-sm text-muted-foreground">
                          {payload[0].value} minutes
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No subject data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
