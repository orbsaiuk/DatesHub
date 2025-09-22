"use client";

export default function Stepper({ step, total = 4, progressPct }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
        <span>
          Step {step} of {total}
        </span>
        <span>{Math.round(progressPct ?? (step / total) * 100)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded">
        <div
          className="h-2 bg-black rounded"
          style={{
            width: `${Math.round(progressPct ?? (step / total) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
