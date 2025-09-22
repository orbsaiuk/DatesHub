"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEntitySchema,
  getInitialValues,
} from "@/components/business/validation/entitySchema";

import Stepper from "./_components/Stepper";
import StepEntityType from "./_components/StepEntityType";
import StepBasicInfo from "./_components/StepBasicInfo";
import StepContact from "./_components/StepContact";
import StepLocation from "./_components/StepLocation";
import StepServices from "./_components/StepServices";

// Dynamic schema and initial values based on entity type

export default function BecomeTenantPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(0); // Start with entity type selection
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [entityType, setEntityType] = useState("company");

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

  const { trigger, handleSubmit, watch, getValues, reset } = methods;
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

  useEffect(() => {
    if (!isSignedIn) {
      router.replace(`/sign-in?redirect_url=/become`);
    }
  }, [isSignedIn, router]);

  async function validateStepAndGo(nextStep) {
    const getStepFields = (stepNum, entityType) => {
      const baseFields = {
        0: ["entityType"],
        1: [
          "name",
          "logo",
          "logoSelected",
          "description",
          entityType === "company" ? "totalEmployees" : null,
          "foundingYear",
          "registrationNumber",
        ],
        2: [
          "contact.ownerName",
          "contact.phone",
          "contact.email",
          "contact.address",
        ],
        3: ["locations"],
        4: ["services", "openingHours"],
      };
      return baseFields[stepNum] || [];
    };

    const fieldsToValidate = (getStepFields(step, entityType) || []).filter(
      Boolean
    );
    if (fieldsToValidate.length === 0) {
      setStep(nextStep);
      return;
    }
    const ok = await trigger(fieldsToValidate, { shouldFocus: true });
    if (ok) setStep(nextStep);
  }

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
      if (!res.ok) throw new Error("Failed to submit request");
      const responseData = await res.json();
      if (!responseData?.ok) throw new Error("Submit returned an error");

      router.push("/become/success");
      // Optionally reset form
      // methods.reset(initial);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  // Validate entire form on final submit; if invalid, jump to the step with the first error
  async function onFinalSubmitClick() {
    // Submit attempt - validating form
    const ok = await trigger(undefined, { shouldFocus: false });
    if (!ok) {
      const errs = methods.formState.errors || {};

      function collectErrors(node, base = []) {
        const results = [];
        if (!node) return results;
        if (
          typeof node === "object" &&
          node.message &&
          typeof node.message === "string"
        ) {
          results.push({ path: base.join("."), message: node.message });
          return results;
        }
        if (Array.isArray(node)) {
          node.forEach((child, idx) => {
            results.push(...collectErrors(child, [...base, String(idx)]));
          });
          return results;
        }
        if (typeof node === "object") {
          Object.entries(node).forEach(([key, value]) => {
            results.push(...collectErrors(value, [...base, key]));
          });
        }
        return results;
      }

      const flat = collectErrors(errs);

      const priority = [
        "entityType",
        "name",
        "logo",
        "website",
        "description",
        "totalEmployees",
        "foundingYear",
        "registrationNumber",
        "businessLicense",
        "productCategories",
        "contact.ownerName",
        "contact.phone",
        "contact.email",
        "contact.address",
        "locations",
        "locations.0.country",
        "locations.0.city",
        "locations.0.address",
        "locations.0.zipCode",
        "locations.0.region",
        "services",
      ];

      function pickFirstError(flatErrors) {
        for (const want of priority) {
          const found = flatErrors.find(
            (e) => e.path === want || e.path.startsWith(want)
          );
          if (found) return found;
        }
        return flatErrors[0] || null;
      }

      const first = pickFirstError(flat);

      function stepForPath(path) {
        if (!path) return 0;
        if (path === "entityType") return 0;
        if (path.startsWith("contact")) return 2;
        if (path.startsWith("locations")) return 3;
        if (path.startsWith("services")) return 4;
        return 1; // base info
      }

      function focusPathFor(path) {
        if (!path) return "name";
        if (path === "locations") return "locations.0.address";
        return path;
      }

      function labelFor(path) {
        const map = {
          entityType: "Entity type",
          name: entityType === "company" ? "Company name" : "Business name",
          logo: "Logo",
          website: "Website",
          description: "Description",
          totalEmployees: "Total employees",
          foundingYear: "Founding year",
          registrationNumber: "Registration number",
          businessLicense: "Business license",
          productCategories: "Product categories",
          "contact.ownerName": "Owner name",
          "contact.phone": "Phone",
          "contact.email": "Email",
          "contact.address": "Contact address",
          locations: "Locations",
          "locations.0.address": "Address (Location 1)",
          "locations.0.country": "Country (Location 1)",
          "locations.0.city": "City (Location 1)",
          "locations.0.region": "Region (Location 1)",
          "locations.0.zipCode": "Zip code (Location 1)",
          services: "Services",
        };
        return map[path] || path;
      }

      const targetStep = stepForPath(first?.path || "");
      setStep(targetStep);

      const fieldToFocus = focusPathFor(first?.path || "");
      setTimeout(() => {
        try {
          methods.setFocus(fieldToFocus);
        } catch {}
      }, 0);

      setError(
        `${labelFor(first?.path)}: ${first?.message || "Please fill out this field"}`
      );
      return;
    }

    await handleSubmit(onSubmit)();
  }

  const progressPct = useMemo(() => (step / 5) * 100, [step]);

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto px-4 py-10 w-full">
        {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
        {success ? (
          <p className="text-sm text-green-700 mb-4">{success}</p>
        ) : null}

        <Stepper step={step} total={5} progressPct={progressPct} />

        {step === 0 && <StepEntityType onNext={() => validateStepAndGo(1)} />}

        {step === 1 && (
          <StepBasicInfo
            onPrev={() => setStep(0)}
            onNext={() => validateStepAndGo(2)}
            entityType={entityType}
          />
        )}

        {step === 2 && (
          <StepContact
            onPrev={() => setStep(1)}
            onNext={() => validateStepAndGo(3)}
          />
        )}

        {step === 3 && (
          <StepLocation
            onPrev={() => setStep(2)}
            onNext={() => validateStepAndGo(4)}
          />
        )}

        {step === 4 && (
          <StepServices
            saving={saving}
            onPrev={() => setStep(3)}
            onSubmit={onFinalSubmitClick}
            entityType={entityType}
          />
        )}
      </div>
    </FormProvider>
  );
}
