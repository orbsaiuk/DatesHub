"use client";

import OrderRequestInput from "./OrderRequestInput";
import { Package } from "lucide-react";

export default function QuantityInput({
  register,
  setValue,
  trigger,
  error,
  hasValue,
}) {
  const handleQuantityChange = (e) => {
    let value = e.target.value;

    // Allow empty value for optional state
    if (value === "") {
      setValue("quantity", "");
      trigger("quantity");
      return;
    }

    // Allow digits and one decimal point for quantity
    value = value.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const firstDecimalIndex = value.indexOf(".");
      value =
        value.substring(0, firstDecimalIndex + 1) +
        value.substring(firstDecimalIndex + 1).replace(/\./g, "");
    }

    // Handle leading zeros appropriately
    if (value !== "") {
      // If it starts with a decimal, add a leading zero
      if (value.startsWith(".")) {
        value = "0" + value;
      }
      // Remove leading zeros for whole numbers but keep single zero
      else if (!value.startsWith("0.")) {
        value = value.replace(/^0+/, "") || "0";
      }
    }

    setValue("quantity", value);
    trigger("quantity");
  };

  return (
    <OrderRequestInput
      name="quantity"
      label=" الكمية المطلوبة بالكيلو"
      type="decimal"
      placeholder="مثال: 5"
      icon={<Package size={16} />}
      required={true}
      error={error}
      hasValue={hasValue}
      register={register}
      onChange={handleQuantityChange}
    />
  );
}
