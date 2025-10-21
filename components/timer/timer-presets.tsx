"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface TimerPresetsProps {
  onSelectDuration: (durationInSeconds: number) => void;
  disabled?: boolean;
}

const PRESET_DURATIONS = [
  { label: "25 min", seconds: 25 * 60 },
  { label: "45 min", seconds: 45 * 60 },
  { label: "1 hour", seconds: 60 * 60 },
  { label: "2 hours", seconds: 120 * 60 },
];

export function TimerPresets({ onSelectDuration, disabled }: TimerPresetsProps) {
  const [customMinutes, setCustomMinutes] = useState<string>("");

  const handleCustomStart = () => {
    const minutes = parseInt(customMinutes);
    if (!isNaN(minutes) && minutes > 0) {
      onSelectDuration(minutes * 60);
      setCustomMinutes("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset Buttons */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Quick Start</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESET_DURATIONS.map((preset) => (
            <Button
              key={preset.label}
              onClick={() => onSelectDuration(preset.seconds)}
              disabled={disabled}
              variant="outline"
              className="h-12"
            >
              <Clock className="h-4 w-4 mr-2" />
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Duration */}
      <div>
        <Label htmlFor="custom-duration" className="text-sm font-medium mb-2 block">
          Custom Duration
        </Label>
        <div className="flex gap-2">
          <Input
            id="custom-duration"
            type="number"
            min="1"
            max="600"
            placeholder="Minutes"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCustomStart();
              }
            }}
            disabled={disabled}
            className="flex-1"
          />
          <Button
            onClick={handleCustomStart}
            disabled={disabled || !customMinutes || parseInt(customMinutes) <= 0}
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
