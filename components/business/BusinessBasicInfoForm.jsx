"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  { label: "متجر الكتروني", value: "online-store" },
  { label: "محل تمور", value: "dates-shop" },
  { label: "موزع", value: "distributor" },
];

const supplierTypeOptions = [
  { label: "مصنع تمور", value: "dates-factory" },
  { label: "مصنع تعبئة", value: "packaging-factory" },
  { label: "مصنع تغليف", value: "wrapping-factory" },
  { label: "مزرعة", value: "farm" },
  { label: "تاجر جملة", value: "wholesaler" },
  { label: "مصدر", value: "exporter" },
];

export default function BusinessBasicInfoForm({
  // Form values
  name,
  website,
  totalEmployees,
  foundingYear,
  registrationNumber,
  companyType,
  supplierType,
  description,

  // Change handlers
  onNameChange,
  onWebsiteChange,
  onTotalEmployeesChange,
  onFoundingYearChange,
  onRegistrationNumberChange,
  onCompanyTypeChange,
  onSupplierTypeChange,
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
        className={`mt-1 appearance-none ${error ? "border-destructive focus-visible:ring-destructive" : ""
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
          <option value="">اختر</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <Select
        value={value || undefined}
        onValueChange={(val) => onChange?.(val)}
        dir="rtl"
      >
        <SelectTrigger
          id={id}
          className={`mt-1 ${error ? "border-destructive" : ""}`}
        >
          <SelectValue placeholder="اختر" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
          اسم {entityType === "company" ? "الشركة" : "المورد"} {requiredMark}
        </Label>
        {renderInput(
          "name",
          `اسم ${entityType === "company" ? "الشركة" : "المورد"}`,
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
          موقع {entityType === "company" ? "الشركة" : "المورد"} الإلكتروني
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
            إجمالي الموظفين {requiredMark}
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
          سنة التأسيس {requiredMark}
        </Label>
        {renderInput(
          "foundingYear",
          "مثال: 2015",
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
            أنواع الأعمال {requiredMark}
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

      {entityType === "supplier" && (
        <div>
          <Label className="text-sm" htmlFor="supplierType">
            نوع المورد {requiredMark}
          </Label>
          {renderSelect(
            "supplierType",
            supplierType,
            onSupplierTypeChange,
            supplierTypeOptions,
            errors.supplierType
          )}
          {errors.supplierType && (
            <p className="text-xs text-red-600 mt-1">
              {errors.supplierType?.message || errors.supplierType}
            </p>
          )}
        </div>
      )}

      <div>
        <Label className="text-sm" htmlFor="registrationNumber">
          رقم السجل التجاري {requiredMark}
        </Label>
        {renderInput(
          "registrationNumber",
          "رقم السجل التجاري",
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
            {entityType === "supplier" ? "وصف الخدمات" : "وصف الشركة"}{" "}
            {requiredMark}
          </Label>
          {renderTextarea(
            "description",
            entityType === "supplier"
              ? "اوصف خدماتك وما يجعلك مميزاً..."
              : "أخبر العملاء عن شركتك...",
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
