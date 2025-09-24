"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { ALL_CATEGORIES_QUERY } from "@/sanity/queries/categories";
import Spinner from "@/components/ui/spinner";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ServicesSelectionForm({
  // Services/Categories - Now using Sanity references
  selectedCategories = [], // Array of category references
  onCategoriesChange,
  maxCategories = 3,

  // Extra Services
  extraServices = [],
  onExtraServicesChange,
  maxExtraServices = 20,

  // Opening Hours
  openingHours = Array(7).fill(""),
  onOpeningHoursChange,

  // Validation errors
  errors = {},

  // Labels and config
  servicesLabel = "Categories",
  servicesFieldName = "categories", // Changed from services to categories
  rhfMode = false,
  showServicesSection = true,
  showExtraServicesSection = true,
  showOpeningHoursSection = true,

  // For react-hook-form integration
  control = null,
  setValue = null,
  watch = null,
  Controller = null,
}) {
  const [categoryQuery, setCategoryQuery] = useState("");
  const [extraInput, setExtraInput] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch categories from Sanity
  useEffect(() => {
    setIsLoadingCategories(true);
    client
      .fetch(ALL_CATEGORIES_QUERY)
      .then((rows) => setAllCategories(rows || []))
      .catch(() => setAllCategories([]))
      .finally(() => setIsLoadingCategories(false));
  }, []);

  // Get selected category IDs
  const selectedCategoryIds = useMemo(() => {
    const arr = Array.isArray(selectedCategories) ? selectedCategories : [];
    return new Set(
      arr
        .map((c) => (c && typeof c === "object" ? c._ref || c._id : null))
        .filter(Boolean)
    );
  }, [selectedCategories]);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    const rows = Array.isArray(allCategories) ? allCategories : [];
    if (!q) return rows;
    return rows.filter((r) =>
      String(r.title || r.name || "")
        .toLowerCase()
        .includes(q)
    );
  }, [allCategories, categoryQuery]);

  // Extra service validation
  const extraTooShort =
    extraInput.trim().length > 0 && extraInput.trim().length < 2;
  const extraTooLong = extraInput.trim().length > 30;
  const extraLimitReached = extraServices.length >= maxExtraServices;

  const handleCategoryToggle = (categoryId) => {
    if (rhfMode && Controller && control) {
      // React Hook Form mode - handled by Controller
      return;
    }

    const current = Array.isArray(selectedCategories) ? selectedCategories : [];
    const ids = new Set(
      current
        .map((c) => (c && typeof c === "object" ? c._ref || c._id : null))
        .filter(Boolean)
    );

    if (ids.has(categoryId)) {
      ids.delete(categoryId);
    } else if (ids.size < maxCategories) {
      ids.add(categoryId);
    }

    const nextIds = Array.from(ids);
    const nextRefs = nextIds.map((cid) => ({
      _type: "reference",
      _ref: cid,
    }));
    onCategoriesChange?.(nextRefs);
  };

  // Normalize dereferenced categories to references on mount (if needed)
  useEffect(() => {
    const arr = Array.isArray(selectedCategories) ? selectedCategories : [];
    if (arr.length > 0 && arr.some((c) => c && c._id && !c._ref)) {
      const next = arr
        .map((c) => (c && c._id ? { _type: "reference", _ref: c._id } : null))
        .filter(Boolean);
      if (next.length > 0) onCategoriesChange?.(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addExtraService = () => {
    const val = extraInput.trim();
    if (!val || val.length < 2 || val.length > 30) return;
    if (extraServices.includes(val) || extraServices.length >= maxExtraServices)
      return;

    if (rhfMode && setValue) {
      setValue("extraServices", [...extraServices, val], {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      onExtraServicesChange?.([...extraServices, val]);
    }
    setExtraInput("");
  };

  const removeExtraService = (serviceToRemove) => {
    const newServices = extraServices.filter((s) => s !== serviceToRemove);
    if (rhfMode && setValue) {
      setValue("extraServices", newServices, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      onExtraServicesChange?.(newServices);
    }
  };

  const setOpeningHour = (index, value) => {
    if (rhfMode && setValue) {
      setValue(`openingHours.${index}`, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      const newHours = [...openingHours];
      newHours[index] = value;
      onOpeningHoursChange?.(newHours);
    }
  };

  const loadWeekdayTemplate = () => {
    const template = [
      "9:00 ص - 5:00 م",
      "9:00 ص - 5:00 م",
      "9:00 ص - 5:00 م",
      "9:00 ص - 5:00 م",
      "9:00 ص - 5:00 م",
      "مغلق",
      "مغلق",
    ];

    if (rhfMode && setValue) {
      template.forEach((val, idx) =>
        setValue(`openingHours.${idx}`, val, {
          shouldDirty: true,
          shouldValidate: true,
        })
      );
    } else {
      onOpeningHoursChange?.(template);
    }
  };

  const clearAllHours = () => {
    const emptyHours = Array(7).fill("");
    if (rhfMode && setValue) {
      emptyHours.forEach((val, idx) =>
        setValue(`openingHours.${idx}`, val, {
          shouldDirty: true,
          shouldValidate: true,
        })
      );
    } else {
      onOpeningHoursChange?.(emptyHours);
    }
  };

  const renderCategoriesSection = () => {
    if (rhfMode && Controller && control) {
      // React Hook Form mode
      return (
        <Controller
          control={control}
          name={servicesFieldName}
          render={({ field }) => {
            if (isLoadingCategories) {
              return (
                <div className="py-2 flex items-center gap-2 text-muted-foreground text-xs">
                  <Spinner size={16} label="Loading categories" />
                  <span>
                    جاري تحميل{" "}
                    {servicesLabel === "Categories"
                      ? "الفئات"
                      : servicesLabel.toLowerCase()}
                    …
                  </span>
                </div>
              );
            }
            const fieldValue = field.value ?? [];
            const currentIds = new Set(
              fieldValue
                .map((c) =>
                  c && typeof c === "object" ? c._ref || c._id : null
                )
                .filter(Boolean)
            );

            const toggle = (categoryId) => {
              const current = Array.isArray(fieldValue) ? fieldValue : [];
              const ids = new Set(
                current
                  .map((c) =>
                    c && typeof c === "object" ? c._ref || c._id : null
                  )
                  .filter(Boolean)
              );

              if (ids.has(categoryId)) {
                ids.delete(categoryId);
              } else if (ids.size < maxCategories) {
                ids.add(categoryId);
              }

              const nextIds = Array.from(ids);
              const nextRefs = nextIds.map((cid) => ({
                _type: "reference",
                _ref: cid,
              }));
              field.onChange(nextRefs);
            };

            return (
              <div className="space-y-2">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => {
                    const categoryId = category._id;
                    const categoryTitle =
                      category.title || category.name || categoryId;
                    const isSelected = currentIds.has(categoryId);
                    const isDisabled =
                      currentIds.size >= maxCategories && !isSelected;

                    return (
                      <label
                        key={categoryId}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggle(categoryId)}
                          disabled={isDisabled}
                        />
                        <span>{categoryTitle}</span>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground">
                    لم يتم العثور على{" "}
                    {servicesLabel === "Categories"
                      ? "فئات"
                      : servicesLabel.toLowerCase()}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  اختر حتى {maxCategories}{" "}
                  {servicesLabel === "Categories"
                    ? "فئات"
                    : servicesLabel.toLowerCase()}
                  .
                </p>
              </div>
            );
          }}
        />
      );
    }

    // Regular mode
    return (
      <div className="space-y-2">
        {isLoadingCategories ? (
          <div className="py-2 flex items-center gap-2 text-muted-foreground text-xs">
            <Spinner size={16} label="Loading categories" />
            <span>Loading {servicesLabel.toLowerCase()}…</span>
          </div>
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map((category) => {
            const categoryId = category._id;
            const categoryTitle = category.title || category.name || categoryId;
            const isSelected = selectedCategoryIds.has(categoryId);
            const isDisabled =
              selectedCategoryIds.size >= maxCategories && !isSelected;

            return (
              <label
                key={categoryId}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleCategoryToggle(categoryId)}
                  disabled={isDisabled}
                />
                <span>{categoryTitle}</span>
              </label>
            );
          })
        ) : (
          <p className="text-xs text-muted-foreground">
            No {servicesLabel.toLowerCase()} found
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Select up to {maxCategories} {servicesLabel.toLowerCase()}.
        </p>
      </div>
    );
  };

  const renderOpeningHoursSection = () => {
    const currentHours =
      rhfMode && watch ? (watch("openingHours") ?? []) : openingHours;

    return (
      <div className="mt-2 space-y-2">
        {DAY_LABELS.map((day, i) => (
          <div
            key={day}
            className="grid grid-cols-[64px,1fr] items-center gap-2"
          >
            <div className="text-xs text-muted-foreground font-medium px-1 select-none">
              {day}
            </div>

            {rhfMode && Controller && control ? (
              <Controller
                name={`openingHours.${i}`}
                control={control}
                render={({ field }) => (
                  <div className="relative w-full">
                    <Input
                      {...field}
                      placeholder="مثال: 9:00 ص - 5:00 م"
                      aria-label={`${day} ساعات العمل`}
                      className="pr-10"
                    />
                    {!!field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => field.onChange("")}
                        aria-label={`مسح ساعات ${day}`}
                        title={`مسح ساعات ${day}`}
                        className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        <X />
                      </Button>
                    )}
                  </div>
                )}
              />
            ) : (
              <div className="relative w-full">
                <Input
                  value={currentHours[i] || ""}
                  onChange={(e) => setOpeningHour(i, e.target.value)}
                  placeholder="مثال: 9:00 ص - 5:00 م"
                  aria-label={`${day} ساعات العمل`}
                  className="pr-10"
                />
                {!!currentHours[i] && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpeningHour(i, "")}
                    aria-label={`مسح ساعات ${day}`}
                    title={`مسح ساعات ${day}`}
                    className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    <X />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Categories Selection */}
      {showServicesSection && (
        <div>
          <Label className="text-sm" htmlFor="categorySearch">
            البحث عن {servicesLabel === "Categories" ? "الفئات" : servicesLabel}{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="categorySearch"
            placeholder={`البحث عن ${servicesLabel === "Categories" ? "الفئات" : servicesLabel}`}
            className="mt-1"
            value={categoryQuery}
            onChange={(e) => setCategoryQuery(e.target.value)}
          />
          <div className="mt-3">{renderCategoriesSection()}</div>
          {(() => {
            const fieldError = errors[servicesFieldName];
            const message =
              typeof fieldError === "string" ? fieldError : fieldError?.message;
            return message ? (
              <p className="text-xs text-red-600 mt-1">{message}</p>
            ) : null;
          })()}
        </div>
      )}

      {/* Extra Services */}
      {showExtraServicesSection && (
        <div>
          <Label className="text-sm" htmlFor="extraServiceInput">
            خدمات إضافية (اختيارية)
          </Label>
          <div className="mt-2">
            <div className="flex gap-2">
              <Input
                id="extraServiceInput"
                placeholder="اكتب خدمة واضغط إضافة"
                value={extraInput}
                onChange={(e) => setExtraInput(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                className="cursor-pointer"
                disabled={
                  !extraInput.trim() ||
                  extraTooShort ||
                  extraTooLong ||
                  extraLimitReached
                }
                onClick={addExtraService}
              >
                إضافة
              </Button>
            </div>
            {extraTooShort && (
              <p className="text-xs text-red-600 mt-1">الحد الأدنى 2 أحرف.</p>
            )}
            {extraTooLong && (
              <p className="text-xs text-red-600 mt-1">الحد الأقصى 30 حرف.</p>
            )}
            {extraLimitReached && (
              <p className="text-xs text-red-600 mt-1">
                لقد وصلت إلى الحد الأقصى وهو {maxExtraServices} خدمات إضافية.
              </p>
            )}
            {extraServices.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {extraServices.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 border px-2 py-1 text-xs"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeExtraService(t)}
                      className="ml-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              2-30 حرف لكل خدمة، حتى {maxExtraServices} علامات. ستظهر هذه
              كعلامات على ملفك الشخصي والبطاقات.
            </p>
          </div>
        </div>
      )}

      {/* Opening Hours */}
      {showOpeningHoursSection && (
        <div>
          <Label className="text-sm">
            ساعات العمل <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            قدم الساعات لجميع الأيام السبعة. مثال: "9:00 ص - 5:00 م" أو "مغلق".
          </p>
          {renderOpeningHoursSection()}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={loadWeekdayTemplate}
              className="cursor-pointer w-full sm:w-auto"
            >
              تحميل قالب أيام الأسبوع
            </Button>
            <Button
              type="button"
              onClick={clearAllHours}
              className="cursor-pointer w-full sm:w-auto"
            >
              مسح الكل
            </Button>
          </div>
          {Array.isArray(errors.openingHours) &&
            errors.openingHours.length > 0 && (
              <p className="text-xs text-red-600 mt-2">
                يرجى تقديم الساعات لجميع الأيام السبعة.
              </p>
            )}
        </div>
      )}
    </div>
  );
}
