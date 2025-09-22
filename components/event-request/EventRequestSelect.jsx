"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function EventRequestSelect({
  name,
  label,
  options,
  placeholder = "",
  icon = null,
  required = true,
  error = null,
  hasValue = false,
  setValue,
  value,
  loading = false,
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        {loading ? (
          <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
        ) : (
          <Select
            value={value || ""}
            onValueChange={(selectedValue) => setValue(name, selectedValue)}
          >
            <SelectTrigger
              className={`
                ${icon ? "pl-10" : ""}
                ${error ? "border-red-500 focus-visible:ring-red-500" : ""}
                ${hasValue && !error ? "border-green-500" : ""}
              `}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
    </div>
  );
}
