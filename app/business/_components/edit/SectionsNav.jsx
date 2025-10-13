"use client";
import { useEffect, useState } from "react";
import { Check, AlertCircle } from "lucide-react";

export default function SectionsNav({
  sections,
  formData,
  errors,
  currentSection,
  onSectionChange,
  entityType = "company",
}) {
  const [active, setActive] = useState(currentSection || sections?.[0]?.id);

  // Update active section when currentSection changes
  useEffect(() => {
    setActive(currentSection);
  }, [currentSection]);

  // Check completion status for each section
  const getSectionStatus = (sectionId) => {
    switch (sectionId) {
      case "section-company-info": {
        const nameFilled =
          !!formData?.name && String(formData.name).trim().length > 0;
        const typeFilled =
          entityType === "company" ? !!formData?.companyType : !!formData?.supplierType;
        const logoFilled = !!formData?.logo;
        const descriptionFilled = !!(
          formData?.description && String(formData.description).trim()
        );
        const hasCompanyErrors = Boolean(
          errors?.name ||
          errors?.website ||
          errors?.foundingYear ||
          errors?.description
        );
        if (hasCompanyErrors) return "error";
        return nameFilled && typeFilled && logoFilled && descriptionFilled
          ? "complete"
          : "incomplete";
      }

      case "section-locations": {
        const locations = Array.isArray(formData?.locations)
          ? formData.locations
          : [];
        return locations.length > 0 ? "complete" : "incomplete";
      }

      case "section-services": {
        const categories = Array.isArray(formData?.categories)
          ? formData.categories
          : [];
        const openingHoursOk = Array.isArray(formData?.openingHours)
          ? formData.openingHours.length === 7
          : true;
        const extraOk = Array.isArray(formData?.extraServices) ? true : true;
        return categories.length > 0 && openingHoursOk && extraOk
          ? "complete"
          : "incomplete";
      }

      case "section-contact": {
        const contact = formData?.contact || {};
        const hasAny = [
          contact.ownerName,
          contact.phone,
          contact.email,
          contact.address,
        ]
          .map((v) => (typeof v === "string" ? v.trim() : v))
          .some(Boolean);
        if (entityType === "supplier") {
          return hasAny ? "complete" : "incomplete";
        }
        const hasSocialLinks = Array.isArray(formData?.socialLinks)
          ? formData.socialLinks.length > 0
          : false;
        return entityType === "company" && hasAny && hasSocialLinks
          ? "complete"
          : "incomplete";
      }



      default:
        return "incomplete";
    }
  };

  useEffect(() => {
    const observers = [];
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(s.id);
          });
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: [0, 1] }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  return (
    <div className="space-y-3 text-sm">
      <ul className="space-y-1">
        {sections.map((s) => {
          const status = getSectionStatus(s.id);
          return (
            <li key={s.id}>
              <button
                onClick={() => {
                  onSectionChange?.(s.id);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-md flex items-center justify-between transition-colors ${active === s.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60"
                  }`}
                aria-current={active === s.id ? "page" : undefined}
              >
                <span className="text-sm sm:text-base">{s.label}</span>
                <div className="flex-shrink-0">
                  {status === "complete" && (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  )}
                  {status === "error" && (
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                  )}
                  {status === "incomplete" && (
                    <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 bg-muted-foreground/30 rounded-full" />
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
