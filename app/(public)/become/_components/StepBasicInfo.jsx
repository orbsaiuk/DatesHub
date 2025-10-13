"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SocialLinks from "./SocialLinks";
import LogoUploader from "./LogoUploader";
import BusinessBasicInfoForm from "@/components/business/BusinessBasicInfoForm";

export default function StepBasicInfo({
  onPrev,
  onNext,
  entityType = "company",
}) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const name = watch("name")?.trim();
  const description = watch("description")?.trim();
  const totalEmployees = watch("totalEmployees");
  const foundingYear = watch("foundingYear")?.trim();
  const registrationNumber = watch("registrationNumber")?.trim();

  const hasFieldErrors = Boolean(
    errors.name ||
    errors.logo ||
    errors.description ||
    (entityType === "company" && errors.totalEmployees) ||
    errors.foundingYear ||
    errors.registrationNumber ||
    errors.website
  );

  const canNext = Boolean(
    name &&
    description &&
    (entityType === "company" ? totalEmployees : true) &&
    foundingYear &&
    registrationNumber &&
    !hasFieldErrors
  );

  const entityLabel = entityType === "company" ? "الشركة" : "المورد";

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">
        إضافة معلومات {entityLabel}
      </h1>
      <h2 className="text-lg font-medium mb-4">المعلومات الأساسية</h2>

      <BusinessBasicInfoForm
        rhfMode={true}
        register={register}
        errors={errors}
        required={true}
        showDescription={true}
        entityType={entityType}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="md:col-span-2">
          <Label className="text-sm">
            رفع الشعار <span className="text-muted-foreground text-xs">(اختياري)</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            سيتم استخدام شعار افتراضي إذا لم يتم رفع شعار
          </p>
          <LogoUploader />
        </div>

        {entityType === "company" && (
          <div className="md:col-span-2">
            <Label className="text-sm">أضف روابط وسائل التواصل الاجتماعي</Label>
            <SocialLinks />
          </div>
        )}
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8">
        <Button
          type="button"
          variant="secondary"
          onClick={onPrev}
          disabled={!onPrev}
          className="w-full sm:w-auto cursor-pointer"
        >
          السابق
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="cursor-pointer w-full sm:w-auto"
        >
          التالي
        </Button>
      </div>
    </div>
  );
}
