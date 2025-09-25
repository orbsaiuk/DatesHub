"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import ContactDetailsForm from "@/components/business/ContactDetailsForm";

export default function StepContact({ onPrev, onNext }) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const ownerName = watch("contact.ownerName")?.trim();
  const phone = watch("contact.phone")?.trim();
  const email = watch("contact.email")?.trim();
  const address = watch("contact.address")?.trim();

  const hasFieldErrors = Boolean(
    errors.contact?.ownerName ||
      errors.contact?.phone ||
      errors.contact?.email ||
      errors.contact?.address
  );

  const canNext = Boolean(
    ownerName && phone && email && address && !hasFieldErrors
  );

  return (
    <div className="min-h-[50vh]">
      <h1 className="text-2xl font-semibold mb-8">تفاصيل الاتصال الرسمية</h1>
      <h2 className="text-lg font-medium mb-4">تفاصيل الاتصال</h2>

      <ContactDetailsForm
        rhfMode={true}
        register={register}
        errors={errors.contact || {}}
        required={true}
        rhfPrefix="contact"
      />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8">
        <Button
          type="button"
          variant="secondary"
          onClick={onPrev}
          className={` w-full sm:w-auto ${!onPrev ? "opacity-50 cursor-not-allowed" : " cursor-pointer"}`}
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
