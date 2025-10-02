import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEntitySchema,
  getInitialValues,
} from "@/components/business/validation/entitySchema";

/**
 * Hook to manage the tenant request form state and submission
 */
export function useTenantRequestForm() {
  const router = useRouter();
  const [entityType, setEntityType] = useState("company");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create dynamic schema and initial values based on entity type
  const schema = useMemo(() => createEntitySchema(entityType), [entityType]);
  const initialValues = useMemo(
    () => getInitialValues(entityType),
    [entityType]
  );

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const { handleSubmit, watch, reset } = methods;
  const logoFile = watch("logoFile");
  const watchedEntityType = watch("entityType");

  // Update entity type and reset form when entity type changes
  useEffect(() => {
    if (watchedEntityType && watchedEntityType !== entityType) {
      setEntityType(watchedEntityType);
      const newInitialValues = getInitialValues(watchedEntityType);
      reset(newInitialValues);
    }
  }, [watchedEntityType, entityType, reset]);

  // Submit handler
  async function onSubmit(values) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const categories = values.services || [];

      const data = {
        tenantType: values.entityType || "company",
        entityType: values.entityType,
        name: values.name,
        website: values.website || null,
        email: values.contact?.email || null,
        description: values.description,
        totalEmployees: values.totalEmployees || null,
        foundingYear: values.foundingYear || null,
        registrationNumber: values.registrationNumber || null,
        companyType: values.companyType || null,
        businessLicense: values.businessLicense || null,
        productCategories: values.productCategories || [],
        categories,
        extraServices: values.extraServices || [],
        socialLinks: (values.socialLinks || []).filter(Boolean),
        contact: values.contact,
        locations: (values.locations || []).map((l) => ({
          country: l.country,
          city: l.city,
          address: l.address,
          region: l.region || "",
          zipCode: l.zipCode,
          geo:
            l.geo &&
            typeof l.geo.lat === "number" &&
            typeof l.geo.lng === "number"
              ? { lat: l.geo.lat, lng: l.geo.lng }
              : undefined,
        })),
        openingHours: values.openingHours,
      };

      const form = new FormData();
      form.append("data", JSON.stringify(data));
      if (logoFile instanceof File) {
        form.append("logo", logoFile, logoFile.name);
      }

      const res = await fetch("/api/tenant-requests", {
        method: "POST",
        body: form,
      });

      const responseData = await res.json();

      // Handle existing pending request
      if (res.status === 409 && responseData.existingRequestId) {
        router.push(`/become/success?id=${responseData.existingRequestId}`);
        return;
      }

      if (!res.ok)
        throw new Error(responseData.message || "فشل في إرسال الطلب");
      if (!responseData?.ok) throw new Error("حدث خطأ في الإرسال");

      const requestId = responseData?.id;

      router.push(`/become/success?id=${requestId}`);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  return {
    methods,
    entityType,
    saving,
    error,
    success,
    setError,
    onSubmit: handleSubmit(onSubmit),
  };
}
