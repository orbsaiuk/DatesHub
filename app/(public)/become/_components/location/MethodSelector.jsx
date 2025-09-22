"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function MethodSelector({
  idx,
  mode,
  onModeChange,
  onLocateMe,
  locating,
  reverseLoading,
}) {
  const effectiveMode = mode || "manual";
  return (
    <div className="md:col-span-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Label className="text-sm">Choose method</Label>
        <div className="flex gap-2 flex-wrap">
          <Button
            type="button"
            variant={locating ? "secondary" : "outline"}
            onClick={() => onLocateMe(idx)}
            disabled={locating || reverseLoading}
            className="cursor-pointer"
          >
            {locating ? "Locating..." : "Auto locate"}
          </Button>
          <Button
            type="button"
            variant={effectiveMode === "map" ? "secondary" : "outline"}
            onClick={() => onModeChange("map")}
            className="cursor-pointer"
          >
            Drop pin
          </Button>
          <Button
            type="button"
            variant={effectiveMode === "manual" ? "secondary" : "outline"}
            onClick={() => onModeChange("manual")}
            className="cursor-pointer"
          >
            Manual
          </Button>
        </div>
      </div>
    </div>
  );
}
