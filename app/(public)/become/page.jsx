"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { FormProvider } from "react-hook-form";

import Stepper from "./_components/Stepper";
import PageLoadingState from "./_components/PageLoadingState";
import TenantRequestSteps from "./_components/TenantRequestSteps";
import { usePendingRequestCheck, useTenantRequestForm } from "./_hooks";
import {
  getStepFields,
  collectErrors,
  pickFirstError,
  stepForPath,
  focusPathFor,
  labelFor,
} from "./_utils";

export default function BecomeTenantPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [step, setStep] = useState(0);

  // Check for pending requests and handle redirects
  const { isCheckingPending } = usePendingRequestCheck(isLoaded, isSignedIn);

  // Form state and submission
  const { methods, entityType, saving, error, setError, onSubmit } =
    useTenantRequestForm();

  const { trigger } = methods;

  // Step validation and navigation
  async function handleStepChange(nextStep, validate = true) {
    if (!validate) {
      setStep(nextStep);
      return;
    }

    const fieldsToValidate = getStepFields(step, entityType).filter(Boolean);

    if (fieldsToValidate.length === 0) {
      setStep(nextStep);
      return;
    }

    const ok = await trigger(fieldsToValidate, { shouldFocus: true });
    if (ok) setStep(nextStep);
  }

  // Final form validation and submission
  async function handleFinalSubmit() {
    const ok = await trigger(undefined, { shouldFocus: false });

    if (!ok) {
      const errs = methods.formState.errors || {};
      const flat = collectErrors(errs);
      const first = pickFirstError(flat);

      const targetStep = stepForPath(first?.path || "");
      setStep(targetStep);

      const fieldToFocus = focusPathFor(first?.path || "");
      setTimeout(() => {
        try {
          methods.setFocus(fieldToFocus);
        } catch {}
      }, 0);

      setError(
        `${labelFor(first?.path, entityType)}: ${first?.message || "يرجى تعبئة هذا الحقل"}`
      );
      return;
    }

    await onSubmit();
  }

  const progressPct = useMemo(() => (step / 5) * 100, [step]);

  // Show loading spinner while checking authentication and pending requests
  if (!isLoaded || isCheckingPending) {
    return <PageLoadingState />;
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto px-4 py-10 w-full">
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <Stepper step={step} total={5} progressPct={progressPct} />

        <TenantRequestSteps
          step={step}
          entityType={entityType}
          saving={saving}
          onStepChange={handleStepChange}
          onFinalSubmit={handleFinalSubmit}
        />
      </div>
    </FormProvider>
  );
}
