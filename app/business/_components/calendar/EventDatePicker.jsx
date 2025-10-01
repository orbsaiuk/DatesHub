"use client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function EventDatePicker({
  label,
  required = true,
  value,
  onChange,
  minDate,
  disabled = false,
  placeholder = "اختر التاريخ",
}) {
  const [date, setDate] = useState(value ? new Date(value) : undefined);
  const [open, setOpen] = useState(false);

  // Get minimum date (today or provided minDate)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minimumDate = minDate ? new Date(minDate) : today;

  const handleDateSelect = useCallback(
    (selectedDate) => {
      setDate(selectedDate);
      if (selectedDate) {
        // Format date to YYYY-MM-DD format for the form
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        onChange(formattedDate);
      } else {
        onChange("");
      }
      setOpen(false);
    },
    [onChange]
  );

  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      const dateObj = new Date(value);
      const currentDateString = date?.toISOString().split("T")[0];
      const newDateString = dateObj.toISOString().split("T")[0];

      // Only update if the value has actually changed
      if (currentDateString !== newDateString) {
        setDate(dateObj);
      }
    } else if (date) {
      // Only clear if we currently have a date
      setDate(undefined);
    }
  }, [value]); // Remove 'date' from dependencies to prevent infinite loop

  return (
    <div className="space-y-2" dir="rtl">
      <Label className="text-sm font-medium text-gray-700 text-right block">
        {label}
        {required && <span className="text-red-600 ms-1">*</span>}
      </Label>

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
            <CalendarIcon className="ms-2 h-4 w-4" />
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
