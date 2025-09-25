"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import ServicesSelectionForm from "@/components/business/ServicesSelectionForm";

export default function StepServices({ onPrev, onSubmit, saving }) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const servicesSelected = watch("services") ?? [];
  const openingHours = watch("openingHours") ?? [];
  const extraServices = watch("extraServices") ?? [];

  const hasValidHours = Array.isArray(openingHours)
    ? openingHours.every((l) =>
        typeof l === "string" ? l.trim().length > 0 : true
      )
    : true;

  const canSubmit = Boolean(servicesSelected.length > 0 && hasValidHours);

  return (
    <div className="min-h-[50vh]">
      <h1 className="text-2xl font-semibold mb-8">إضافة الفئات التي تقدمها</h1>

      <ServicesSelectionForm
        selectedCategories={servicesSelected}
        onCategoriesChange={(categories) =>
          setValue("services", categories, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
        extraServices={extraServices}
        openingHours={openingHours}
        errors={errors}
        servicesLabel="الفئات"
        servicesFieldName="services"
        maxCategories={3}
        maxExtraServices={20}
        rhfMode={true}
        control={control}
        setValue={setValue}
        watch={watch}
        Controller={Controller}
      />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8">
        <Button
          type="button"
          variant="secondary"
          onClick={onPrev}
          disabled={saving}
          className="cursor-pointer w-full sm:w-auto"
        >
          السابق
        </Button>
        <Button
          disabled={saving || !canSubmit}
          onClick={onSubmit}
          className={`w-full sm:w-auto cursor-pointer ${
            saving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {saving ? "جارٍ الحفظ..." : "إرسال"}
        </Button>
      </div>
    </div>
  );
}
