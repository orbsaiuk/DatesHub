"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const employeeOptions = [
  { value: "1-5", label: "1-5" },
  { value: "6-10", label: "6-10" },
  { value: "11-20", label: "11-20" },
  { value: "21-50", label: "21-50" },
  { value: "51-100", label: "51-100" },
  { value: "101-200", label: "101-200" },
  { value: "201-500", label: "201-500" },
  { value: "500+", label: "500+" },
];

const companyTypeOptions = [
  { label: "Full Event Planner", value: "full-event-planner" },
  { label: "Kids Birthday", value: "kids-birthday" },
  { label: "Wedding", value: "wedding" },
  { label: "Social Gathering", value: "social-gathering" },
  { label: "Corporate Event", value: "corporate-event" },
];

export default function BusinessBasicInfoForm({
  // Form values
  name,
  website,
  totalEmployees,
  foundingYear,
  registrationNumber,
  companyType,
  description,

  // Change handlers
  onNameChange,
  onWebsiteChange,
  onTotalEmployeesChange,
  onFoundingYearChange,
  onRegistrationNumberChange,
  onCompanyTypeChange,
  onDescriptionChange,

  // Validation errors
  errors = {},

  // Optional props for different use cases
  showDescription = true,
  required = true,
  enableValidation = false, // Enable real-time validation

  // For react-hook-form integration
  register = null,
  rhfMode = false, // React Hook Form mode

  // Entity type and field requirements
  entityType = entityType,
}) {
  const requiredMark = required ? (
    <span className="text-red-600">*</span>
  ) : null;

  const entityLabel = entityType === "company" ? "Company" : "Supplier";

  const handleFieldChange = (fieldName, value, onChange) => {
    onChange?.(value);
  };

  const renderInput = (
    id,
    placeholder,
    value,
    onChange,
    type = "text",
    error = null
  ) => {
    if (rhfMode && register) {
      return (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          aria-invalid={!!error}
          {...register(id)}
          className={`mt-1 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
        />
      );
    }

    return (
      <Input
        id={id}
        type={type}
        value={value || ""}
        onChange={(e) => {
          const newValue =
            type === "number" ? Number(e.target.value) : e.target.value;
          handleFieldChange(id, newValue, onChange);
        }}
        placeholder={placeholder}
        className={`mt-1 appearance-none ${
          error ? "border-destructive focus-visible:ring-destructive" : ""
        }`}
      />
    );
  };

  const renderSelect = (id, value, onChange, options, error = null) => {
    if (rhfMode && register) {
      return (
        <select
          id={id}
          className={`w-full rounded border px-3 py-2 text-sm mt-1 ${error ? "border-destructive" : ""}`}
          aria-invalid={!!error}
          {...register(id)}
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <select
        id={id}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={`mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
          error ? "border-destructive" : ""
        }`}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  const renderTextarea = (
    id,
    placeholder,
    value,
    onChange,
    rows = 6,
    error = null
  ) => {
    if (rhfMode && register) {
      return (
        <textarea
          id={id}
          rows={rows}
          className={`w-full rounded border px-3 py-2 text-sm mt-1 ${error ? "border-destructive" : ""}`}
          placeholder={placeholder}
          aria-invalid={!!error}
          {...register(id)}
        />
      );
    }

    return (
      <Textarea
        id={id}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`mt-1 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
      />
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label className="text-sm" htmlFor="name">
          {entityLabel} name {requiredMark}
        </Label>
        {renderInput(
          "name",
          `${entityLabel} name`,
          name,
          onNameChange,
          "text",
          errors.name
        )}
        {errors.name && (
          <p className="text-xs text-red-600 mt-1">
            {errors.name?.message || errors.name}
          </p>
        )}
      </div>
      <div>
        <Label className="text-sm" htmlFor="website">
          {entityLabel} Website
        </Label>
        {renderInput(
          "website",
          "https://example.com",
          website,
          onWebsiteChange,
          "text",
          errors.website
        )}
        {errors.website && (
          <p className="text-xs text-red-600 mt-1">
            {errors.website?.message || errors.website}
          </p>
        )}
      </div>
      {entityType === "company" && (
        <div>
          <Label className="text-sm" htmlFor="totalEmployees">
            Total Employees {requiredMark}
          </Label>
          {renderSelect(
            "totalEmployees",
            totalEmployees,
            onTotalEmployeesChange,
            employeeOptions,
            errors.totalEmployees
          )}
          {errors.totalEmployees && (
            <p className="text-xs text-red-600 mt-1">
              {errors.totalEmployees?.message || errors.totalEmployees}
            </p>
          )}
        </div>
      )}

      <div>
        <Label className="text-sm" htmlFor="foundingYear">
          Founding Year {requiredMark}
        </Label>
        {renderInput(
          "foundingYear",
          "e.g. 2015",
          foundingYear,
          onFoundingYearChange,
          "text",
          errors.foundingYear
        )}
        {errors.foundingYear && (
          <p className="text-xs text-red-600 mt-1">
            {errors.foundingYear?.message || errors.foundingYear}
          </p>
        )}
      </div>

      {entityType === "company" && (
        <div>
          <Label className="text-sm" htmlFor="companyType">
            Business Types {requiredMark}
          </Label>
          {renderSelect(
            "companyType",
            companyType,
            onCompanyTypeChange,
            companyTypeOptions,
            errors.companyType
          )}
          {errors.companyType && (
            <p className="text-xs text-red-600 mt-1">
              {errors.companyType?.message || errors.companyType}
            </p>
          )}
        </div>
      )}

      <div>
        <Label className="text-sm" htmlFor="registrationNumber">
          Business Registration Number {requiredMark}
        </Label>
        {renderInput(
          "registrationNumber",
          "Business Registration Number",
          registrationNumber,
          onRegistrationNumberChange,
          "number",
          errors.registrationNumber
        )}
        {errors.registrationNumber && (
          <p className="text-xs text-red-600 mt-1">
            {errors.registrationNumber?.message || errors.registrationNumber}
          </p>
        )}
      </div>

      {showDescription && (
        <div className="md:col-span-2">
          <Label className="text-sm" htmlFor="description">
            {entityType === "supplier"
              ? "Service Description"
              : "Business Description"}{" "}
            {requiredMark}
          </Label>
          {renderTextarea(
            "description",
            entityType === "supplier"
              ? "Describe your services and what makes you unique..."
              : "Tell customers about your business...",
            description,
            onDescriptionChange,
            6,
            errors.description
          )}
          {errors.description && (
            <p className="text-xs text-red-600 mt-1">
              {errors.description?.message || errors.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
