"use client";

import { useState } from "react";
import { toast } from "sonner";
import SectionsNav from "./SectionsNav";
import EditBusinessForm from "./EditBusinessForm";
import { validateLocations } from "./validationUtils";

export default function EditPageClient({ initialEntity, entityType }) {
  const initial = initialEntity || {};
  const [formData, setFormData] = useState({
    name: initial?.name || "",
    website: initial?.website || "",
    foundingYear: initial?.foundingYear || "",
    registrationNumber: initial?.registrationNumber || "",
    contact: initial?.contact || {},
    categories: Array.isArray(initial?.categories)
      ? initial.categories.filter(Boolean)
      : [],
    extraServices: initial?.extraServices || [],
    locations: Array.isArray(initial?.locations) ? initial.locations : [],
    openingHours: Array.isArray(initial?.openingHours)
      ? initial.openingHours
      : [],
    description: initial?.descriptionText || "",
    logo: initial?.logo || null,
    ...(entityType === "company"
      ? {
        socialLinks: Array.isArray(initial?.socialLinks)
          ? initial.socialLinks
          : [],
        companyType: initial?.companyType || "",
        totalEmployees: initial?.totalEmployees || "",
      }
      : {}),
  });

  const [errors, setErrors] = useState({});
  const [currentSection, setCurrentSection] = useState("section-company-info");

  const handleSectionChange = (nextId) => {
    // Block leaving services if no categories are selected
    if (currentSection === "section-services") {
      const hasCategories =
        Array.isArray(formData.categories) &&
        formData.categories.filter(Boolean).length > 0;
      if (!hasCategories) {
        toast.error("يرجى تحديد فئة واحدة على الأقل قبل المتابعة");
        return;
      }
    }

    // Block leaving Company Info if required fields are missing
    if (currentSection === "section-company-info") {
      const nameOk = !!(formData.name && String(formData.name).trim());
      const descriptionOk = !!(
        formData.description && String(formData.description).trim()
      );
      const logoOk = !!formData.logo;
      const companyTypeOk =
        entityType === "company" ? !!formData.companyType : true;
      const totalEmployeesOk =
        entityType === "company" ? !!formData.totalEmployees : true;
      const foundingYearOk = !!formData.foundingYear;
      const registrationNumberOk = !!formData.registrationNumber;
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
          `Please fill all required fields in ${entityType} Information.`
        );
        return;
      }
    }

    // Block leaving Contact if required fields are missing
    if (currentSection === "section-contact") {
      const contact = formData?.contact || {};
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

    // Block leaving Locations if there are incomplete locations
    if (currentSection === "section-locations") {
      const locationValidation = validateLocations(formData.locations, true);
      if (!locationValidation.isValid) {
        toast.error(locationValidation.message);
        return;
      }
    }



    setCurrentSection(nextId);
  };

  const sections = [
    {
      id: "section-company-info",
      label: entityType === "supplier" ? "معلومات المورد" : "معلومات الشركة",
    },
    {
      id: "section-locations",
      label: "المواقع",
    },
    {
      id: "section-contact",
      label: "الاتصال",
    },
    {
      id: "section-services",
      label: "الخدمات",
    },
  ];

  const hasNoCategories =
    !Array.isArray(formData.categories) ||
    formData.categories.filter(Boolean).length === 0;

  // Check for incomplete locations
  const locationValidation = validateLocations(formData.locations, true);
  const hasIncompleteLocations = !locationValidation.isValid;

  // Debug logging
  console.log('Location validation:', {
    locations: formData.locations,
    validation: locationValidation,
    hasIncompleteLocations
  });

  const saveDisabled = hasNoCategories || hasIncompleteLocations;
  const saveDisabledReason = hasNoCategories
    ? "يرجى تحديد فئة واحدة على الأقل قبل الحفظ."
    : hasIncompleteLocations
      ? locationValidation.message
      : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Sections */}
      <div className="lg:col-span-1">
        <div className="bg-card rounded-xl border p-3 sm:p-4 lg:sticky lg:top-20 lg:h-fit">
          <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">
            الأقسام
          </h3>
          {/* On mobile, render sections as a horizontal scrollable pill list */}
          <div className="block lg:hidden -mx-1 overflow-x-auto">
            <div className="flex gap-2 px-1 pb-2">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSectionChange(s.id)}
                  className={`whitespace-nowrap px-3 py-2 rounded-full text-sm border ${currentSection === s.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60"
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <SectionsNav
              sections={sections}
              formData={formData}
              errors={errors}
              currentSection={currentSection}
              onSectionChange={handleSectionChange}
              entityType={entityType}
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card rounded-xl border p-4 sm:p-6 lg:col-span-2 space-y-4 sm:space-y-6">
        <EditBusinessForm
          initialBusiness={initial}
          onFormChange={setFormData}
          onErrorsChange={setErrors}
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
          saveDisabled={saveDisabled}
          saveDisabledReason={saveDisabledReason}
          entityType={entityType}
        />
      </div>
    </div>
  );
}
