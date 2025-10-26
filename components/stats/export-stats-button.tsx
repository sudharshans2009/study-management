"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { StudyStats } from "@/lib/stats";

interface ExportStatsButtonProps {
  stats: StudyStats;
  period: string;
}

export function ExportStatsButton({ stats, period }: ExportStatsButtonProps) {
  const handleExport = () => {
    const data = {
      period,
      exportDate: new Date().toISOString(),
      ...stats,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-stats-${period}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export Data
    </Button>
  );
}
