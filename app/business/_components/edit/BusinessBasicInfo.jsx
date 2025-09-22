"use client";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import BusinessBasicInfoForm from "@/components/business/BusinessBasicInfoForm";

export default function BusinessBasicInfo({
  form,
  errors,
  updateField,
  entityType,
}) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);

  // Rebuild preview URL when form.logo changes (e.g., after section switches)
  useEffect(() => {
    let createdUrl = null;
    if (form?.logo instanceof File) {
      try {
        createdUrl = URL.createObjectURL(form.logo);
        setLogoPreviewUrl(createdUrl);
      } catch {}
    } else {
      // Not a File (probably a Sanity image ref) → clear local preview
      if (logoPreviewUrl) {
        try {
          URL.revokeObjectURL(logoPreviewUrl);
        } catch {}
      }
      setLogoPreviewUrl(null);
    }
    return () => {
      if (createdUrl) {
        try {
          URL.revokeObjectURL(createdUrl);
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.logo]);

  return (
    <div id="section-company-info" className="space-y-5 sm:space-y-6">
      <BusinessBasicInfoForm
        name={form.name}
        website={form.website}
        totalEmployees={form.totalEmployees}
        foundingYear={form.foundingYear}
        registrationNumber={form.registrationNumber}
        entityType={entityType}
        description={form.description}
        onNameChange={(value) => updateField("name", value)}
        onWebsiteChange={(value) => updateField("website", value)}
        onTotalEmployeesChange={(value) => updateField("totalEmployees", value)}
        onFoundingYearChange={(value) =>
          updateField("foundingYear", Number(value))
        }
        onRegistrationNumberChange={(value) =>
          updateField("registrationNumber", value)
        }
        onDescriptionChange={(value) => updateField("description", value)}
        errors={errors}
        rhfMode={false}
        required={true}
        showDescription={true}
        enableValidation={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {/* Logo Upload */}
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-4">
            {/* Current Logo Preview */}
            <div className="flex items-start gap-4 sm:gap-6 flex-col sm:flex-row">
              <div className="flex-shrink-0">
                <div className="relative">
                  {form.logo ? (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-border bg-muted">
                      {form.logo instanceof File ? (
                        <Image
                          src={logoPreviewUrl || ""}
                          alt="Company logo preview"
                          width={160}
                          height={160}
                          className="w-full h-full object-cover"
                        />
                      ) : form.logo?.asset?._ref ? (
                        <Image
                          src={urlFor(form.logo).width(160).height(160).url()}
                          alt="Company logo"
                          width={160}
                          height={160}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/50 flex items-center justify-center">
                      <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                    </div>
                  )}
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-background/80 rounded-xl flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-2 sm:space-y-3 w-full">
                <div>
                  <label className="text-sm sm:text-base font-medium">
                    Upload Logo <span className="text-red-600">*</span>
                  </label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    JPG, PNG or SVG. Max size 2MB. Recommended 200x200px.
                  </p>
                </div>

                <div className="flex gap-2 flex-col sm:flex-row w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingLogo}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (file.size > 2 * 1024 * 1024) {
                        toast.error("File size must be less than 2MB");
                        return;
                      }

                      try {
                        const objectUrl = URL.createObjectURL(file);
                        setLogoPreviewUrl(objectUrl);
                        updateField("logo", file);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      } catch (error) {
                        toast.error("Could not preview file");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer w-full sm:w-auto"
                  >
                    Choose File
                  </Button>

                  {form.logo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (logoPreviewUrl) {
                          try {
                            URL.revokeObjectURL(logoPreviewUrl);
                          } catch {}
                          setLogoPreviewUrl(null);
                        }
                        updateField("logo", null);
                      }}
                      className="text-destructive hover:text-destructive w-full sm:w-auto"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
