"use client";
import ServicesSelectionForm from "@/components/business/ServicesSelectionForm";

export default function ServicesForm({ form, updateField }) {
  return (
    <div id="section-services" className="space-y-6">
      <ServicesSelectionForm
        selectedCategories={form.categories || []}
        onCategoriesChange={(categories) =>
          updateField("categories", categories)
        }
        extraServices={form.extraServices || []}
        openingHours={form.openingHours || Array(7).fill("")}
        onExtraServicesChange={(services) =>
          updateField("extraServices", services)
        }
        onOpeningHoursChange={(hours) => updateField("openingHours", hours)}
        errors={{}}
        servicesLabel="الفئات"
        servicesFieldName="categories"
        maxCategories={3}
        maxExtraServices={20}
        rhfMode={false}
        showServicesSection={true}
        showExtraServicesSection={true}
        showOpeningHoursSection={true}
      />
    </div>
  );
}
