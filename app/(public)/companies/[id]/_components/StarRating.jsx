import { Star } from "lucide-react";
import React from "react";

export default function StarRating({
  rating = 0,
  className = "",
  onChange,
  size = 16,
  readOnly = false,
  ariaLabel = "Rating",
}) {
  const [hoverValue, setHoverValue] = React.useState(null);
  const displayValue = hoverValue ?? rating;
  const stars = Array.from({ length: 5 });

  function handleClick(value) {
    if (readOnly || typeof onChange !== "function") return;
    onChange(value);
  }

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role={onChange && !readOnly ? "radiogroup" : undefined}
      aria-label={ariaLabel}
    >
      {stars.map((_, index) => {
        const value = index + 1;
        const isFilled = value <= Math.round(displayValue);
        const isInteractive = Boolean(onChange) && !readOnly;
        return (
          <button
            type="button"
            key={index}
            className={`p-0 ${isInteractive ? "cursor-pointer" : "cursor-default"}`}
            onMouseEnter={() => isInteractive && setHoverValue(value)}
            onMouseLeave={() => isInteractive && setHoverValue(null)}
            onFocus={() => isInteractive && setHoverValue(value)}
            onBlur={() => isInteractive && setHoverValue(null)}
            onClick={() => handleClick(value)}
            aria-checked={value === Math.round(displayValue)}
            role={isInteractive ? "radio" : undefined}
            title={`${value} star${value > 1 ? "s" : ""}`}
          >
            <Star
              className={`${isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              style={{ width: size, height: size }}
            />
          </button>
        );
      })}
    </div>
  );
}
