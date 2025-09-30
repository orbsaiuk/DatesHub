"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactDetailsForm({
  // Form values
  ownerName,
  phone,
  email,
  address,

  // Change handlers
  onOwnerNameChange,
  onPhoneChange,
  onEmailChange,
  onAddressChange,

  // Validation errors
  errors = {},

  // Optional props
  required = true,

  // For react-hook-form integration
  register = null,
  rhfMode = false, // React Hook Form mode
  rhfPrefix = "contact", // Field prefix for RHF
}) {
  const requiredMark = required ? (
    <span className="text-red-600">*</span>
  ) : null;

  const renderInput = (
    id,
    placeholder,
    value,
    onChange,
    type = "text",
    error = null,
    rhfName = null
  ) => {
    // Special handling for phone input
    const isTel = type === "tel";

    if (rhfMode && register) {
      return (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          aria-invalid={!!error}
          inputMode={isTel ? "numeric" : undefined}
          pattern={isTel ? "[0-9]*" : undefined}
          {...register(rhfName || id, {
            ...(isTel && {
              pattern: {
                value: /^[0-9]+$/,
                message: "الرجاء إدخال أرقام فقط",
              },
            }),
            ...(id === "ownerName" && {
              pattern: {
                value: /^[^0-9]*$/,
                message: "الاسم لا يجب أن يحتوي على أرقام",
              },
            }),
          })}
          onInput={(e) => {
            // Client-side filtering for real-time input
            if (id === "ownerName") {
              e.target.value = e.target.value.replace(/[0-9]/g, "");
            } else if (isTel) {
              e.target.value = e.target.value.replace(/\D/g, "");
            }
          }}
          className={`mt-1 text-right ${
            error ? "border-destructive focus-visible:ring-destructive" : ""
          }`}
        />
      );
    }

    return (
      <Input
        id={id}
        type={type}
        value={value || ""}
        onChange={(e) => {
          let val = e.target.value;
          if (isTel) {
            val = val.replace(/\D/g, ""); // remove non-digits
          } else if (id === "ownerName") {
            val = val.replace(/[0-9]/g, ""); // remove numbers from name
          }
          onChange?.(val);
        }}
        placeholder={placeholder}
        inputMode={isTel ? "numeric" : undefined}
        pattern={isTel ? "[0-9]*" : undefined}
        className={`mt-1 text-right ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
      />
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label className="text-sm" htmlFor="ownerName">
          اسم المالك {requiredMark}
        </Label>
        {renderInput(
          "ownerName",
          "اسم المالك",
          ownerName,
          onOwnerNameChange,
          "text",
          errors.ownerName,
          rhfMode ? `${rhfPrefix}.ownerName` : null
        )}
        {errors.ownerName && (
          <p className="text-xs text-red-600 mt-1">
            {errors.ownerName?.message || errors.ownerName}
          </p>
        )}
      </div>

      <div>
        <Label className="text-sm" htmlFor="phone">
          رقم الهاتف {requiredMark}
        </Label>
        {renderInput(
          "phone",
          "رقم الهاتف",
          phone,
          onPhoneChange,
          "tel",
          errors.phone,
          rhfMode ? `${rhfPrefix}.phone` : null
        )}
        {errors.phone && (
          <p className="text-xs text-red-600 mt-1">
            {errors.phone?.message || errors.phone}
          </p>
        )}
      </div>

      <div>
        <Label className="text-sm" htmlFor="email">
          عنوان البريد الإلكتروني للشركة {requiredMark}
        </Label>
        {renderInput(
          "email",
          "عنوان البريد الإلكتروني",
          email,
          onEmailChange,
          "email",
          errors.email,
          rhfMode ? `${rhfPrefix}.email` : null
        )}
        {errors.email && (
          <p className="text-xs text-red-600 mt-1">
            {errors.email?.message || errors.email}
          </p>
        )}
      </div>

      <div>
        <Label className="text-sm" htmlFor="contactAddress">
          عنوان المنزل {requiredMark}
        </Label>
        {renderInput(
          "contactAddress",
          "عنوان المنزل",
          address,
          onAddressChange,
          "text",
          errors.address,
          rhfMode ? `${rhfPrefix}.address` : null
        )}
        {errors.address && (
          <p className="text-xs text-red-600 mt-1">
            {errors.address?.message || errors.address}
          </p>
        )}
      </div>
    </div>
  );
}
