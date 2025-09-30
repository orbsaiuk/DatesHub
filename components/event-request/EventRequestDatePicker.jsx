"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function EventRequestDatePicker({
  name,
  label,
  required = true,
  error = null,
  hasValue = false,
  setValue,
  value,
  trigger,
}) {
  const [date, setDate] = useState(value ? new Date(value) : undefined);
  const [open, setOpen] = useState(false);

  // Get minimum date (today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Format date to YYYY-MM-DD format for the form
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      setValue(name, formattedDate);
      trigger(name); // Trigger validation
    } else {
      setValue(name, "");
    }
    setOpen(false);
  };

  // Update local state when value prop changes
  useEffect(() => {
    if (value && value !== date?.toISOString().split("T")[0]) {
      setDate(new Date(value));
    }
  }, [value, date]);

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
              "w-full items-right text-right font-normal",
              !date && "text-muted-foreground",
              error ? "border-red-500 focus-visible:ring-red-500" : "",
              hasValue && !error ? "border-green-500" : ""
            )}
            dir="rtl"
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            {date ? (
              format(date, "PPP", { locale: ar })
            ) : (
              <span>اختر تاريخ الفعالية</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => date < today}
            initialFocus
            locale={ar}
            dir="rtl"
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
    </div>
  );
}
