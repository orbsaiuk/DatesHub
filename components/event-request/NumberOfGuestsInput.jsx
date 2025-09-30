"use client";

import { useState, useEffect } from "react";
import EventRequestInput from "./EventRequestInput";
import { Users } from "lucide-react";

export default function NumberOfGuestsInput({
  register,
  setValue,
  trigger,
  error,
  hasValue,
}) {
  // Format numberOfGuests input to help with range or exact number entry
  const handleNumberOfGuestsChange = (e) => {
    let value = e.target.value;

    // Remove any non-digit and non-dash characters
    value = value.replace(/[^0-9-]/g, "");

    // Handle dash logic for ranges
    const dashCount = (value.match(/-/g) || []).length;

    if (dashCount > 1) {
      // Remove extra dashes - keep only the first one
      const firstDashIndex = value.indexOf("-");
      value =
        value.substring(0, firstDashIndex + 1) +
        value.substring(firstDashIndex + 1).replace(/-/g, "");
    }

    // Don't allow dash at the beginning
    if (value.startsWith("-")) {
      value = value.substring(1);
    }

    // Update the form value (allow trailing dash temporarily for validation to catch it)
    setValue("numberOfGuests", value);

    // Trigger validation immediately to show error for incomplete ranges
    trigger("numberOfGuests");
  };

  return (
    <EventRequestInput
      name="numberOfGuests"
      label="عدد الضيوف"
      type="text"
      placeholder="مثال: 25 أو 10-20 أو 50-100"
      icon={<Users size={16} />}
      required={true}
      helperText="أدخل العدد الدقيق (مثال: 25) أو النطاق (مثال: 10-20)"
      error={error}
      hasValue={hasValue}
      register={register}
      onChange={handleNumberOfGuestsChange}
    />
  );
}
