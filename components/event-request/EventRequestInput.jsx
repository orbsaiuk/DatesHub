"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EventRequestInput({
  name,
  label,
  type = "text",
  placeholder = "",
  icon = null,
  required = true,
  helperText = null,
  error = null,
  hasValue = false,
  register,
  onChange = null,
  min = undefined,
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          min={min}
          {...register(name)}
          onChange={onChange}
          className={`
            ${icon ? "pl-10" : ""}
            ${error ? "border-red-500 focus-visible:ring-red-500" : ""}
            ${hasValue && !error ? "border-green-500" : ""}
          `}
          aria-invalid={!!error}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
      {helperText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}
