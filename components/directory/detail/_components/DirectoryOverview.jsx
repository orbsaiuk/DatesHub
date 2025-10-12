"use client";

import React from "react";
import { Card } from "@/components/ui/card";

export default function DirectoryOverview({ tenant }) {
  return (
    <Card className="mt-6 p-4 sm:p-6">
      <h2 className="text-lg font-semibold">نبذة عن {tenant.name}</h2>
      <div className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
        {tenant.description}
      </div>
    </Card>
  );
}
