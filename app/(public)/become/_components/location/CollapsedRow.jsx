"use client";

import { Button } from "@/components/ui/button";

export default function CollapsedRow({
  summary,
  onEdit,
  onRemove,
  removeDisabled,
}) {
  return (
    <div className="flex items-center justify-between border rounded-md p-3 flex-wrap gap-3">
      <div className="text-sm">
        <div className="font-medium">{summary}</div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          className="cursor-pointer"
        >
          تعديل
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onRemove}
          disabled={removeDisabled}
          className="cursor-pointer"
        >
          إزالة
        </Button>
      </div>
    </div>
  );
}
