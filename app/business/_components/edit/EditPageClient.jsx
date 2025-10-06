"use client";

import { useState } from "react";
import { toast } from "sonner";
import SectionsNav from "./SectionsNav";
import EditBusinessForm from "./EditBusinessForm";

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
    ourWorks: initial?.ourWorks || [],
    awards: initial?.awards || [],
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

  const isNonEmpty = (val) => typeof val === "string" && val.trim().length > 0;
  const isWorkComplete = (w) =>
    !!w &&
    isNonEmpty(w.title) &&
    isNonEmpty(w.description) &&
    Array.isArray(w.images) &&
    w.images.length > 0;
  const isAwardComplete = (a) =>
    !!a && isNonEmpty(a.name) && isNonEmpty(a.description) && !!a.image;



  const hasIncompleteAward = () => {
    const arr = Array.isArray(formData?.awards) ? formData.awards : [];
    return arr.some((a) => !isAwardComplete(a));
  };

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

    // Block leaving works/awards if there are incomplete entries (company only)
    if (
      entityType === "company" &&
      currentSection === "section-our-works" &&
      hasIncompleteWork()
    ) {
      toast.error("يرجى إكمال أو حذف العمل المضاف قبل مغادرة هذا القسم.");
      return;
    }
    if (
      entityType === "company" &&
      currentSection === "section-awards" &&
      hasIncompleteAward()
    ) {
      toast.error("يرجى إكمال أو حذف الجائزة المضافة قبل مغادرة هذا القسم.");
      return;
    }

    setCurrentSection(nextId);
  };

  const sections = [
    {
      id: "section-company-info",
      label: "معلومات الشركة",
    },
    {
      id: "section-services",
      label: "الخدمات",
    },
    {
      id: "section-contact",
      label: "الاتصال",
    },
    {
      id: "section-our-works",
      label: "الاعمال",
    },
    {
      id: "section-awards",
      label: "الجوائز",
    },
  ];

  const hasNoCategories =
    !Array.isArray(formData.categories) ||
    formData.categories.filter(Boolean).length === 0;

  const saveDisabled =
    hasNoCategories ||
    (entityType === "company" && (hasIncompleteAward() || hasIncompleteWork()));
  const saveDisabledReason = hasNoCategories
    ? "يرجى تحديد فئة واحدة على الأقل قبل الحفظ."
    : entityType === "company" && hasIncompleteAward()
      ? "يرجى إكمال أو حذف الجائزة المضافة قبل الحفظ."
      : entityType === "company" && hasIncompleteWork()
        ? "يرجى إكمال أو حذف العمل المضاف قبل الحفظ."
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
