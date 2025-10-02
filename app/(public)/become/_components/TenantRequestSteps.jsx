import StepEntityType from "./StepEntityType";
import StepBasicInfo from "./StepBasicInfo";
import StepContact from "./StepContact";
import StepLocation from "./StepLocation";
import StepServices from "./StepServices";

export default function TenantRequestSteps({
  step,
  entityType,
  saving,
  onStepChange,
  onFinalSubmit,
}) {
  return (
    <>
      {step === 0 && <StepEntityType onNext={() => onStepChange(1)} />}

      {step === 1 && (
        <StepBasicInfo
          onPrev={() => onStepChange(0, false)}
          onNext={() => onStepChange(2)}
          entityType={entityType}
        />
      )}

      {step === 2 && (
        <StepContact
          onPrev={() => onStepChange(1, false)}
          onNext={() => onStepChange(3)}
        />
      )}

      {step === 3 && (
        <StepLocation
          onPrev={() => onStepChange(2, false)}
          onNext={() => onStepChange(4)}
        />
      )}

      {step === 4 && (
        <StepServices
          saving={saving}
          onPrev={() => onStepChange(3, false)}
          onSubmit={onFinalSubmit}
          entityType={entityType}
        />
      )}
    </>
  );
}
