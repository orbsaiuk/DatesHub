"use client";

import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const DynamicMap = dynamic(() => import("../map/MapPicker"), { ssr: false });

export default function MapSection({
  value,
  onChange,
  onCollapse,
  onClear,
  clearDisabled,
}) {
  return (
    <div className="md:col-span-2">
      <Label className="text-sm">علامة على الخريطة</Label>
      <div className="mt-2 h-64 w-full overflow-hidden rounded">
        <DynamicMap value={value} onChange={onChange} />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCollapse}
          className="w-full sm:w-auto"
        >
          طي
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          disabled={clearDisabled}
          className="w-full sm:w-auto"
        >
          مسح العلامة
        </Button>
      </div>
    </div>
  );
}
