"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/sanity/lib/image";

export default function LogoUploader() {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const {
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext();

  const logo = watch("logo");
  const logoFile = watch("logoFile");
  const logoSelected = watch("logoSelected");

  useEffect(() => {
    if (logoFile instanceof File) {
      const url = URL.createObjectURL(logoFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      try {
        if (logo?.asset?._ref) {
          setPreviewUrl(urlFor(logo).width(160).height(160).fit("crop").url());
        } else {
          setPreviewUrl("");
        }
      } catch {
        setPreviewUrl("");
      }
    }
  }, [logo, logoFile]);

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue("logoFile", file, { shouldDirty: true, shouldValidate: true });
    setValue("logoSelected", true, { shouldDirty: true, shouldValidate: true });
    // Clear Sanity reference
    setValue("logo", null, { shouldDirty: true, shouldValidate: true });
  }

  function onOpenPicker() {
    inputRef.current?.click();
  }

  function onClear() {
    setValue("logoFile", null, { shouldDirty: true, shouldValidate: true });
    setValue("logoSelected", false, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("logo", null, { shouldDirty: true, shouldValidate: true });
  }

  const hasAnyLogo = Boolean(logo?.asset?._ref || logoSelected);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {hasAnyLogo ? (
          <>
            <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
              {previewUrl ? (
                <Image
                  key={previewUrl} // important: forces re-render when URL changes
                  src={previewUrl}
                  alt="معاينة الشعار"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover"
                />
              ) : null}
            </div>
            <Button
              type="button"
              onClick={onOpenPicker}
              className="w-full sm:w-auto"
            >
              تغيير
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClear}
              className="w-full sm:w-auto"
            >
              إزالة
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              onClick={onOpenPicker}
              className="w-full sm:w-auto"
            >
              رفع
            </Button>
            <span className="text-xs text-muted-foreground">PNG, JPG, SVG</span>
          </>
        )}
      </div>
      {hasAnyLogo ? (
        <p className="text-xs text-muted-foreground">تم اختيار الشعار</p>
      ) : (
        <p className="text-xs text-muted-foreground">لم يتم اختيار شعار</p>
      )}
      {errors.logo?.message ? (
        <p className="text-xs text-red-600">{errors.logo.message}</p>
      ) : null}
    </div>
  );
}
