"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SocialLinks() {
  const {
    control,
    formState: { errors },
    register,
  } = useFormContext();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "socialLinks",
  });

  return (
    <div className="space-y-2 mt-1">
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2">
          <Input
            placeholder="https://your-site-or-social.com"
            aria-invalid={!!errors.socialLinks?.[index]}
            {...register(`socialLinks.${index}`)}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => remove(index)}
            className="cursor-pointer"
          >
            إزالة
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => append("")}
          className="cursor-pointer"
        >
          إضافة رابط آخر
        </Button>
        {fields.length > 1 && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              replace([""]);
            }}
            className="cursor-pointer"
          >
            مسح
          </Button>
        )}
      </div>
    </div>
  );
}
