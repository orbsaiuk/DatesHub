"use client";

import * as React from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function OfferDatePicker({
  label,
  required = true,
  value,
  onChange,
  minDate,
  disabled = false,
  placeholder = "اختر التاريخ",
}) {
  const [date, setDate] = React.useState(value ? new Date(value) : undefined);
  const [open, setOpen] = React.useState(false);

  // Get minimum date (today or provided minDate)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minimumDate = minDate ? new Date(minDate) : today;

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Format date to YYYY-MM-DD format for the form
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      onChange(formattedDate);
    } else {
      onChange("");
    }
    setOpen(false);
  };

  // Update local state when value prop changes
  React.useEffect(() => {
    if (value && value !== date?.toISOString().split("T")[0]) {
      setDate(new Date(value));
    } else if (!value) {
      setDate(undefined);
    }
  }, [value, date]);

  return (
    <div className="space-y-1" dir="rtl">
      <label className="text-sm font-medium text-gray-700 text-right block">
        {label}
        {required && <span className="text-red-600 mr-1">*</span>}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-right font-normal h-12 md:h-10 text-base md:text-sm",
              !date && "text-muted-foreground",
              disabled && "opacity-70 cursor-not-allowed"
            )}
            dir="rtl"
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            {date ? (
              format(date, "PPP", { locale: ar })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => date < minimumDate}
            initialFocus
            locale={ar}
            dir="rtl"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
