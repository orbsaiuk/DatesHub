"use client";

import * as React from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function EventRequestTimePicker({
  name,
  label,
  required = true,
  error = null,
  hasValue = false,
  setValue,
  value,
  trigger,
}) {
  const [time, setTime] = React.useState(value || "");
  const [open, setOpen] = React.useState(false);

  // Generate hours (0-23) and minutes (0-59)
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const handleTimeSelect = (selectedHour, selectedMinute) => {
    const timeString = `${selectedHour}:${selectedMinute}`;
    setTime(timeString);
    setValue(name, timeString);
    trigger(name); // Trigger validation
    setOpen(false);
  };

  // Update local state when value prop changes
  React.useEffect(() => {
    if (value !== time) {
      setTime(value || "");
    }
  }, [value, time]);

  // Parse current time for display
  const [currentHour, currentMinute] = time ? time.split(":") : ["", ""];

  // Convert 24-hour format to 12-hour format for Arabic display
  const formatTimeForDisplay = (timeStr) => {
    if (!timeStr) return "اختر الوقت";

    const [hour, minute] = timeStr.split(":");
    const hourNum = parseInt(hour, 10);
    const period = hourNum >= 12 ? "مساءً" : "صباحاً";
    const displayHour =
      hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;

    return `${displayHour}:${minute} ${period}`;
  };

  return (
    <div className="space-y-2" dir="rtl">
      <Label
        htmlFor={name}
        className="text-sm font-medium text-gray-700 text-right"
      >
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={name}
            variant="outline"
            className={cn(
              "w-full text-right font-normal",
              !time && "text-muted-foreground",
              error ? "border-red-500 focus-visible:ring-red-500" : "",
              hasValue && !error ? "border-green-500" : ""
            )}
            dir="rtl"
          >
            <Clock className="ml-2 h-4 w-4" />
            <span>{formatTimeForDisplay(time)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="flex" dir="rtl">
            {/* Hours */}
            <div className="flex-1">
              <div className="p-2 text-center text-sm font-medium border-b">
                الساعة
              </div>
              <div className="h-48 overflow-y-auto">
                <div className="p-1">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      className={cn(
                        "w-full px-2 py-1 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground",
                        currentHour === hour &&
                          "bg-primary text-primary-foreground"
                      )}
                      onClick={() =>
                        handleTimeSelect(hour, currentMinute || "00")
                      }
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Minutes */}
            <div className="flex-1 border-r">
              <div className="p-2 text-center text-sm font-medium border-b">
                الدقيقة
              </div>
              <div className="h-48 overflow-y-auto">
                <div className="p-1">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      className={cn(
                        "w-full px-2 py-1 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground",
                        currentMinute === minute &&
                          "bg-primary text-primary-foreground"
                      )}
                      onClick={() =>
                        handleTimeSelect(currentHour || "00", minute)
                      }
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
    </div>
  );
}
