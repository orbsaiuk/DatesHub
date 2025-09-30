"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check } from "lucide-react";
import BusinessBasicInfo from "./BusinessBasicInfo";
import LocationsStepWrapper from "./LocationsStepWrapper";
import ServicesForm from "./ServicesForm";
import OurWorksForm from "./OurWorksForm";
import AwardsForm from "./AwardsForm";
import ContactInfo from "./ContactInfo";
import { ArrowLeft } from "lucide-react";
import { ArrowRight } from "lucide-react";

export default function EditBusinessForm({
  initialBusiness,
  onSaved,
  onFormChange,
  onErrorsChange,
  currentSection,
  onSectionChange,
  saveDisabled,
  saveDisabledReason,
  entityType = "company",
}) {
  const [form, setForm] = useState(() => ({
    tenantId: initialBusiness?.tenantId,
    name: initialBusiness?.name || "",
    website: initialBusiness?.website || "",
    foundingYear: initialBusiness?.foundingYear || "",
    registrationNumber: initialBusiness?.registrationNumber || "",
    description: initialBusiness?.descriptionText || "",
    logo: initialBusiness?.logo || null,
    locations: initialBusiness?.locations || [],
    categories: initialBusiness?.categories?.filter(Boolean) || [],
    extraServices: initialBusiness?.extraServices || [],
    openingHours: initialBusiness?.openingHours || Array(7).fill(""),
    ...(entityType === "company"
      ? {
          socialLinks: Array.isArray(initialBusiness?.socialLinks)
            ? initialBusiness.socialLinks
            : [],
          companyType: initialBusiness?.companyType || "",
          totalEmployees: initialBusiness?.totalEmployees || "",
        }
      : {}),
    contact: initialBusiness?.contact || {},
    ourWorks: initialBusiness?.ourWorks || [],
    awards: initialBusiness?.awards || [],
  }));
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errors, setErrors] = useState({});

  const sections = [
    {
      id: "section-company-info",
      label: entityType === "supplier" ? "معلومات المورد" : "معلومات الشركة",
      component: "company-info",
    },
    {
      id: "section-locations",
      label: "المواقع",
      component: "locations",
    },
    {
      id: "section-contact",
      label: "الاتصال",
      component: "contact",
    },
    {
      id: "section-services",
      label: "الخدمات",
      component: "services",
    },
    {
      id: "section-our-works",
      label: "أعمالنا",
      component: "our-works",
    },
    {
      id: "section-awards",
      label: "الجوائز",
      component: "awards",
    },
  ];

  const currentSectionData =
    sections.find((s) => s.id === currentSection) || sections[0];

  // Track unsaved changes
  useEffect(() => {
    const initialForm = {
      name: initialBusiness?.name || "",
      website: initialBusiness?.website || "",
      foundingYear: initialBusiness?.foundingYear || "",
      registrationNumber: initialBusiness?.registrationNumber || "",
      description: initialBusiness?.descriptionText || "",
      logo: initialBusiness?.logo || null,
      locations: initialBusiness?.locations || [],
      categories: initialBusiness?.categories?.filter(Boolean) || [],
      extraServices: initialBusiness?.extraServices || [],
      openingHours: initialBusiness?.openingHours || Array(7).fill(""),
      ...(entityType === "company"
        ? {
            socialLinks: Array.isArray(initialBusiness?.socialLinks)
              ? initialBusiness.socialLinks
              : [],
            companyType: initialBusiness?.companyType || "",
            totalEmployees: initialBusiness?.totalEmployees || "",
          }
        : {}),
      contact: initialBusiness?.contact || {},
      ourWorks: initialBusiness?.ourWorks || [],
      awards: initialBusiness?.awards || [],
    };

    const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);
    setHasUnsavedChanges(hasChanges);
  }, [form, initialBusiness]);

  function updateField(field, value) {
    const newForm = { ...form, [field]: value };
    setForm(newForm);

    // Create a safe version for parent state (without File objects for JSON serialization)
    const safeForm = { ...newForm };
    if (Array.isArray(safeForm.ourWorks)) {
      safeForm.ourWorks = safeForm.ourWorks.map((work) => ({
        ...work,
        images: work.images || [], // Keep File objects but ensure array exists
      }));
    }
    if (Array.isArray(safeForm.awards)) {
      safeForm.awards = safeForm.awards.map((award) => ({
        ...award,
        image: award.image || null, // Keep File objects
      }));
    }

    onFormChange?.(safeForm);

    // Clear error when field is updated
    if (errors[field]) {
      const newErrors = { ...errors, [field]: null };
      setErrors(newErrors);
      onErrorsChange?.(newErrors);
    }
  }

  // Helper function to upload a single file
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/${entityType}/upload-logo`, {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (!json?.image) {
      throw new Error("Upload failed");
    }

    return json.image;
  };

  // Helper function to process images (upload files, keep existing Sanity refs)
  const processImages = async (images) => {
    if (!images) return null;

    if (Array.isArray(images)) {
      const processedImages = await Promise.all(
        images.map(async (img) => {
          if (img instanceof File) {
            return await uploadFile(img);
          }
          // Keep existing Sanity image references
          return img;
        })
      );
      return processedImages;
    } else {
      // Single image
      if (images instanceof File) {
        return await uploadFile(images);
      }
      return images;
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (saveDisabled) {
      if (saveDisabledReason) toast.error(saveDisabledReason);
      return;
    }

    setSaving(true);
    try {
      // sanitize locations: drop completely empty rows and coerce geo
      const cleanedLocations = Array.isArray(form.locations)
        ? form.locations
            .map((loc) => loc || {})
            .filter((loc) => {
              const values = [
                loc.address,
                loc.city,
                loc.region,
                loc.country,
                loc.zipCode,
                loc?.geo?.lat,
                loc?.geo?.lng,
              ];
              return values
                .map((v) => (typeof v === "string" ? v.trim() : v))
                .some(Boolean);
            })
        : undefined;

      // Process awards - upload images and clean empty rows
      const processedAwards = Array.isArray(form.awards)
        ? await Promise.all(
            form.awards
              .map((a) => a || {})
              .filter((a) => {
                const values = [a.name, a.description];
                return values
                  .map((v) => (typeof v === "string" ? v.trim() : v))
                  .some(Boolean);
              })
              .map(async (award) => ({
                ...award,
                image: await processImages(award.image),
              }))
          )
        : undefined;

      // Process our works - upload images and clean empty rows
      const processedOurWorks = Array.isArray(form.ourWorks)
        ? await Promise.all(
            form.ourWorks
              .map((w) => w || {})
              .filter((w) => {
                const values = [w.title, w.description];
                return values
                  .map((v) => (typeof v === "string" ? v.trim() : v))
                  .some(Boolean);
              })
              .map(async (work) => ({
                ...work,
                images: await processImages(work.images),
              }))
          )
        : undefined;

      // Process logo upload if it's a File
      const processedLogo = await processImages(form.logo);

      // Filter out empty social links
      const filteredSocialLinks = Array.isArray(form.socialLinks)
        ? form.socialLinks.filter((link) => link && link.trim() !== "")
        : [];

      const payload = {
        ...form,
        logo: processedLogo,
        locations: cleanedLocations,
        awards: processedAwards,
        ourWorks: processedOurWorks,
        ...(entityType === "company"
          ? {
              socialLinks: filteredSocialLinks,
              companyType: form.companyType,
              totalEmployees: form.totalEmployees,
            }
          : {}),
      };

      const endpoint = `/api/${entityType}/update`;
      const method = entityType === "company" ? "POST" : "PATCH";
      const body =
        entityType === "company"
          ? { data: payload }
          : { tenantId: form?.tenantId, ...payload };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(
        entityType === "company"
          ? "تم تحديث الشركة بنجاح"
          : "تم تحديث المورد بنجاح"
      );
      setHasUnsavedChanges(false);
      setErrors({});
      onErrorsChange?.({});
      onSaved?.();
    } catch (err) {
      toast.error(
        entityType === "company" ? "فشل في تحديث الشركة" : "فشل في تحديث المورد"
      );
    } finally {
      setSaving(false);
    }
  }

  // Render current section component
  const renderCurrentSection = () => {
    switch (currentSectionData.component) {
      case "company-info":
        return (
          <BusinessBasicInfo
            form={form}
            errors={errors}
            updateField={updateField}
            entityType={entityType}
          />
        );
      case "locations":
        return (
          // Reuse the become flow's StepLocation via wrapper
          // The wrapper syncs RHF state back to parent `form.locations`
          // and hides the StepLocation footer controls
          <>
            <LocationsStepWrapper form={form} updateField={updateField} />
          </>
        );
      case "services":
        return <ServicesForm form={form} updateField={updateField} />;
      case "contact":
        return (
          <ContactInfo
            form={form}
            errors={errors}
            updateField={updateField}
            entityType={entityType}
          />
        );

      case "our-works":
        return (
          <OurWorksForm
            form={form}
            updateField={updateField}
            workErrors={errors?.ourWorks}
          />
        );
      case "awards":
        return (
          <AwardsForm
            form={form}
            updateField={updateField}
            awardErrors={errors?.awards}
          />
        );
      default:
        return (
          <BusinessBasicInfo
            form={form}
            errors={errors}
            updateField={updateField}
          />
        );
    }
  };

  const currentIndex = sections.findIndex((s) => s.id === currentSection);
  const isFirstSection = currentIndex === 0;
  const isLastSection = currentIndex === sections.length - 1;

  const goToNextSection = (e) => {
    // Prevent accidental form submit when moving to last section
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!isLastSection) {
      // Block leaving Services if no categories are selected
      const leavingServices = currentSectionData.component === "services";
      if (leavingServices) {
        const hasCategories =
          Array.isArray(form.categories) &&
          form.categories.filter(Boolean).length > 0;
        if (!hasCategories) {
          toast.error("يرجى تحديد فئة واحدة على الأقل قبل المتابعة");
          return;
        }
      }

      // Block leaving Company Info if required fields are missing
      const leavingCompanyInfo =
        currentSectionData.component === "company-info";
      if (leavingCompanyInfo) {
        const nameOk = !!(form.name && String(form.name).trim());
        const descriptionOk = !!(
          form.description && String(form.description).trim()
        );
        const logoOk = !!form.logo;
        const companyTypeOk =
          entityType === "company" ? !!form.companyType : true;
        const totalEmployeesOk =
          entityType === "company" ? !!form.totalEmployees : true;
        const foundingYearOk = !!form.foundingYear;
        const registrationNumberOk = !!form.registrationNumber;
        if (
          !nameOk ||
          !foundingYearOk ||
          !registrationNumberOk ||
          !companyTypeOk ||
          !totalEmployeesOk ||
          !logoOk ||
          !descriptionOk
        ) {
          toast.error(
            `يرجى ملء جميع الحقول المطلوبة في معلومات ${entityType === "company" ? "الشركة" : "المورد"}.`
          );
          return;
        }
      }

      // Block leaving Contact if required fields are missing
      const leavingContact = currentSectionData.component === "contact";
      if (leavingContact) {
        const contact = form?.contact || {};
        const hasAny = [
          contact.ownerName,
          contact.phone,
          contact.email,
          contact.address,
        ]
          .map((v) => (typeof v === "string" ? v.trim() : v))
          .some(Boolean);
        if (!hasAny) {
          toast.error(
            "يرجى ملء جميع حقول الاتصال المطلوبة (الاسم، الهاتف، البريد الإلكتروني، العنوان)."
          );
          return;
        }
      }

      // Block leaving Locations if there is any new, incomplete location
      const leavingLocations = currentSectionData.component === "locations";
      if (leavingLocations) {
        const hasBlockingNew = Array.isArray(form.locations)
          ? form.locations.some((loc) => {
              if (!loc || !loc.__new) return false;
              const address = (loc.address || "").trim();
              const city = (loc.city || "").trim();
              const region = (loc.region || "").trim();
              const country = (loc.country || "").trim();
              const zipCode = (loc.zipCode || "").trim();
              const hasGeo =
                loc.geo &&
                Number.isFinite(Number(loc.geo.lat)) &&
                Number.isFinite(Number(loc.geo.lng));
              return !(
                address &&
                city &&
                region &&
                country &&
                zipCode &&
                hasGeo
              );
            })
          : false;
        if (hasBlockingNew) {
          if (typeof window !== "undefined") {
            const el = document.getElementById("section-locations");
            el?.scrollIntoView?.({ behavior: "smooth", block: "start" });
          }
          return;
        }
      }
      const nextSection = sections[currentIndex + 1];
      // Defer navigation to avoid click landing on new submit button
      if (typeof window !== "undefined" && window.requestAnimationFrame) {
        window.requestAnimationFrame(() => onSectionChange?.(nextSection.id));
      } else {
        setTimeout(() => onSectionChange?.(nextSection.id), 0);
      }
    }
  };

  const goToPreviousSection = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!isFirstSection) {
      const previousSection = sections[currentIndex - 1];
      if (typeof window !== "undefined" && window.requestAnimationFrame) {
        window.requestAnimationFrame(() =>
          onSectionChange?.(previousSection.id)
        );
      } else {
        setTimeout(() => onSectionChange?.(previousSection.id), 0);
      }
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">
              {currentSectionData.label}
            </h2>
            <p className="text-muted-foreground mt-0.5 sm:mt-1 text-sm">
              الخطوة {currentIndex + 1} من {sections.length}
            </p>
          </div>
        </div>

        {/* Current Section Content */}
        <div className="min-h-[300px] sm:min-h-[360px]">
          {renderCurrentSection()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t">
          <div>
            {!isFirstSection && (
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousSection}
                className="cursor-pointer px-4 py-2"
              >
                <ArrowRight className="ml-1" /> السابق
              </Button>
            )}
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {!isLastSection ? (
              <Button
                type="button"
                variant="default"
                onClick={goToNextSection}
                className="cursor-pointer w-full sm:w-auto px-4 py-2"
              >
                التالي <ArrowLeft className="ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={saving}
                className="cursor-pointer w-full sm:w-auto px-4 py-2"
              >
                <Check className="h-4 w-4 ml-1" />
                {saving ? "جاري الحفظ..." : "حفظ جميع التغييرات"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
