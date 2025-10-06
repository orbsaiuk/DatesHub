"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import StepLocation from "../../../(public)/become/_components/StepLocation";

export default function LocationsStepWrapper({ form, updateField }) {
  const methods = useForm({
    mode: "onChange",
    defaultValues: { locations: form.locations || [] },
    resolver: undefined, // We'll handle validation manually in the parent components
  });

  const initialLoadedRef = useRef(false);

  // Keep RHF in sync when parent form.locations changes externally
  useEffect(() => {
    const current = methods.getValues("locations") || [];
    const incoming = form.locations || [];
    const same = JSON.stringify(current) === JSON.stringify(incoming);
    if (!same) {
      methods.reset({ locations: incoming });
    }
    // Mark that we've applied initial reset to avoid early propagation
    if (!initialLoadedRef.current) initialLoadedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.locations]);

  // Watch locations and propagate up
  const locations = useWatch({ control: methods.control, name: "locations" });

  useEffect(() => {
    if (!initialLoadedRef.current) return;
    // Avoid unnecessary parent updates
    const same =
      JSON.stringify(form.locations || []) === JSON.stringify(locations || []);
    if (!same) updateField("locations", locations || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  return (
    <FormProvider {...methods}>
      <StepLocation hideFooter />
    </FormProvider>
  );
}
