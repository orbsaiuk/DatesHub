"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EventTimePicker({
  label,
  required = true,
  value,
  onChange,
  disabled = false,
  placeholder = "اختر الوقت",
}) {
  const [time, setTime] = useState(value || undefined);

  // Generate time options (every 15 minutes)
  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const displayTime = format(
          new Date(`2000-01-01T${timeString}`),
          "h:mm a",
          { locale: ar }
        );
        options.push({ value: timeString, label: displayTime });
      }
    }
    return options;
  }, []);

  const handleTimeSelect = useCallback(
    (selectedTime) => {
      setTime(selectedTime);
      onChange(selectedTime);
    },
    [onChange]
  );

  // Update local state when value prop changes
  useEffect(() => {
    if (value && value !== time) {
      setTime(value);
    }
  }, [value]);

  return (
    <div className="space-y-2" dir="rtl">
      <Label className="text-sm font-medium text-gray-700 text-right block">
        {label}
        {required && <span className="text-red-600 mr-1">*</span>}
      </Label>

      <Select
        value={time}
        onValueChange={handleTimeSelect}
        disabled={disabled}
        dir="rtl"
      >
        <SelectTrigger className="w-full h-12 md:h-10 text-base md:text-sm">
          <div className="flex items-center">
            <Clock className="ml-2 h-4 w-4" />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent dir="rtl" className="max-h-60">
          {timeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label || "اختر الوقت"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
