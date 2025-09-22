"use client";

import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function WaitingForResponseButton({
  className = "",
  variant = "outline",
  size = "sm",
}) {
  return (
    <Button
      variant={variant}
      size={size}
      className={`cursor-not-allowed opacity-75 ${className}`}
      disabled
    >
      <Clock className="size-4 ml-2 animate-pulse" />
      في انتظار الرد
    </Button>
  );
}
