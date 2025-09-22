"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function EventRequestTextarea({
  name,
  label,
  placeholder = "",
  required = true,
  error = null,
  hasValue = false,
  register,
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Textarea
          id={name}
          placeholder={placeholder}
          rows={4}
          {...register(name)}
          className={`
            resize-none
            ${error ? "border-red-500 focus-visible:ring-red-500" : ""}
            ${hasValue && !error ? "border-green-500" : ""}
          `}
          aria-invalid={!!error}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
    </div>
  );
}
