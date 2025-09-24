"use client";
import ContactDetailsForm from "@/components/business/ContactDetailsForm";
import SocialLinksForm from "./company/SocialLinksForm";

export default function ContactInfo({
  form,
  errors,
  updateField,
  entityType = "company",
}) {
  const handleContactFieldChange = (field, value) => {
    updateField("contact", {
      ...form.contact,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <ContactDetailsForm
        ownerName={form.contact?.ownerName}
        phone={form.contact?.phone}
        email={form.contact?.email}
        address={form.contact?.address}
        onOwnerNameChange={(value) =>
          handleContactFieldChange("ownerName", value)
        }
        onPhoneChange={(value) => handleContactFieldChange("phone", value)}
        onEmailChange={(value) => handleContactFieldChange("email", value)}
        onAddressChange={(value) => handleContactFieldChange("address", value)}
        errors={errors}
        rhfMode={false}
      />

      {entityType === "company" && (
        <div className="pt-2">
          <h3 className="text-base font-medium mb-2">
            روابط التواصل الاجتماعي
          </h3>
          <SocialLinksForm
            form={form}
            updateField={updateField}
            errors={errors}
          />
        </div>
      )}
    </div>
  );
}
