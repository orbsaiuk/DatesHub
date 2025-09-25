"use client";

import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MethodSelector from "./location/MethodSelector";
import MapSection from "./location/MapSection";
import AddressFields from "./location/AddressFields";
import CollapsedRow from "./location/CollapsedRow";

// Stable toast IDs to avoid stacking multiple toasts
const TOAST_IDS = {
  reverse: "reverse-geocode",
  geoloc: "geolocation-error",
};

// Geolocation error codes (spec-defined)
const GEO_ERROR = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
};

export default function StepLocation({ onPrev, onNext, hideFooter }) {
  const {
    register,
    formState: { errors },
    control,
    setValue,
    watch,
    trigger,
    clearErrors,
  } = useFormContext();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "locations",
  });
  const locations = watch("locations") || [];
  const [locatingIdx, setLocatingIdx] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isReverseLoading, setIsReverseLoading] = useState(false);
  const [modeByIdx, setModeByIdx] = useState({}); // map | manual per index

  function getMode(idx) {
    return modeByIdx[idx] || "manual";
  }
  function setMode(idx, mode) {
    setModeByIdx((m) => ({ ...m, [idx]: mode }));
  }

  function isEmpty(loc) {
    if (!loc) return true;
    const hasGeo =
      loc.geo &&
      typeof loc.geo.lat === "number" &&
      typeof loc.geo.lng === "number";
    return !(
      loc.address ||
      loc.city ||
      loc.region ||
      loc.country ||
      loc.zipCode ||
      hasGeo
    );
  }

  function addLocation() {
    append({
      country: "",
      city: "",
      address: "",
      region: "",
      zipCode: "",
      geo: null,
    });
    setActiveIdx(fields.length); // new last index becomes active
    setMode(fields.length, "manual");
  }

  function removeAt(idx) {
    remove(idx);
    setActiveIdx((cur) => {
      if (cur === idx) return Math.max(0, cur - 1);
      if (cur > idx) return cur - 1;
      return cur;
    });
  }

  async function reverseGeocodeWithToast(idx, lat, lng) {
    if (isReverseLoading) return; // prevent concurrent toasts/requests
    setIsReverseLoading(true);
    toast.loading("الحصول على العنوان...", { id: TOAST_IDS.reverse });
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error("reverse_failed");
      const data = await res.json();
      update(idx, { ...locations[idx], ...data, geo: { lat, lng } });

      // Clear validation errors for this location when data is filled
      clearErrors([
        `locations.${idx}.country`,
        `locations.${idx}.city`,
        `locations.${idx}.address`,
        `locations.${idx}.region`,
        `locations.${idx}.zipCode`,
      ]);

      toast.success("تم إضافة الموقع", { id: TOAST_IDS.reverse });
      return data;
    } catch (error) {
      toast.error("لا يمكن الحصول على العنوان، يرجى ملء الحقول يدوياً.", {
        id: TOAST_IDS.reverse,
      });
      throw error;
    } finally {
      setIsReverseLoading(false);
    }
  }

  async function onLocateMe(idx) {
    if (!navigator.geolocation) {
      toast.error("تحديد الموقع غير مدعوم", {
        description: "متصفحك لا يدعم تحديد الموقع.",
        id: TOAST_IDS.geoloc,
      });
      return;
    }
    if (locatingIdx !== null || isReverseLoading) {
      // Already locating or reverse geocoding; avoid stacking actions/toasts
      return;
    }

    // Check permissions first if available
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        // Geolocation permission state checked
        if (permission.state === "denied") {
          toast.error("تم رفض الإذن", {
            description:
              "تم حظر الوصول للموقع. يرجى تفعيله في إعدادات المتصفح وإعادة تحميل الصفحة.",
            id: TOAST_IDS.geoloc,
          });
          return;
        }
      } catch (error) {
        // Permission query failed - continuing anyway
        // Continue anyway, as permission query might not be supported
      }
    }

    setLocatingIdx(idx);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        update(idx, {
          ...(locations[idx] || {}),
          geo: { lat: latitude, lng: longitude },
        });
        try {
          await reverseGeocodeWithToast(idx, latitude, longitude);
        } finally {
          setLocatingIdx(null);
        }
      },
      (err) => {
        // Geolocation error occurred
        setLocatingIdx(null);
        if (err.code === GEO_ERROR.PERMISSION_DENIED) {
          toast.error("إذن مطلوب", {
            description:
              "تم رفض الوصول للموقع. يرجى تفعيل أذونات الموقع في المتصفح أو وضع علامة على الخريطة.",
            id: TOAST_IDS.geoloc,
          });
        } else if (err.code === GEO_ERROR.POSITION_UNAVAILABLE) {
          toast.error("الموقع غير متاح", {
            description:
              "لا يمكن تحديد موقعك. حاول مرة أخرى لاحقاً أو ضع علامة على الخريطة.",
            id: TOAST_IDS.geoloc,
          });
        } else if (err.code === GEO_ERROR.TIMEOUT) {
          toast.error("انتهت مهلة الموقع", {
            description:
              "انتهت مهلة طلب الموقع. حاول مرة أخرى أو ضع علامة على الخريطة.",
            id: TOAST_IDS.geoloc,
          });
        } else {
          toast.error("لا يمكن الحصول على الموقع", {
            description:
              "حدث خطأ أثناء الحصول على موقعك. استخدم الخريطة لاختيار مكان.",
            id: TOAST_IDS.geoloc,
          });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function onMapSelect(idx, lat, lng) {
    update(idx, { ...(locations[idx] || {}), geo: { lat, lng } });
    await reverseGeocodeWithToast(idx, lat, lng);
  }

  function clearGeo(idx) {
    update(idx, { ...(locations[idx] || {}), geo: null });
  }

  // Validate locations before proceeding to next step
  async function handleNext() {
    const isValid = await trigger("locations");
    if (isValid) {
      onNext();
    }
  }

  // Check if all required location fields are filled
  function areAllLocationFieldsFilled() {
    if (!locations || locations.length === 0) {
      return false;
    }

    return locations.every((location) => {
      // Required fields for location validation
      return (
        location?.country?.trim() &&
        location?.city?.trim() &&
        location?.address?.trim() &&
        location?.region?.trim() &&
        location?.zipCode?.trim()
      );
    });
  }

  const isNextDisabled = !areAllLocationFieldsFilled();

  return (
    <div className="min-h-[50vh]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold">إضافة الموقع/المواقع</h1>
        {fields.length > 0 ? (
          <Button
            type="button"
            variant="secondary"
            onClick={addLocation}
            className="cursor-pointer w-full sm:w-auto"
          >
            إضافة موقع آخر
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={addLocation}
            className="cursor-pointer w-full sm:w-auto"
          >
            إضافة موقع
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {fields.map((field, idx) => {
          const loc = locations[idx] || {};
          const summary =
            [loc.address, loc.city, loc.region, loc.zipCode, loc.country]
              .filter(Boolean)
              .join(", ") || `الموقع ${idx + 1}`;
          if (idx !== activeIdx) {
            if (isEmpty(loc)) return null;
            return (
              <CollapsedRow
                key={field.id}
                summary={summary}
                onEdit={() => setActiveIdx(idx)}
                onRemove={() => removeAt(idx)}
                removeDisabled={fields.length <= 1}
              />
            );
          }

          const mode = getMode(idx);
          return (
            <div key={field.id} className="border rounded-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MethodSelector
                  idx={idx}
                  mode={mode}
                  onModeChange={(m) => setMode(idx, m)}
                  onLocateMe={onLocateMe}
                  locating={locatingIdx === idx}
                  reverseLoading={isReverseLoading}
                />
                {mode === "map" ? (
                  <MapSection
                    value={locations[idx]?.geo}
                    onChange={(lat, lng) => onMapSelect(idx, lat, lng)}
                    onCollapse={() => setActiveIdx(-1)}
                    onClear={() => clearGeo(idx)}
                    clearDisabled={!locations[idx]?.geo}
                  />
                ) : null}
                <AddressFields idx={idx} register={register} errors={errors} />
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeAt(idx)}
                  disabled={fields.length <= 1}
                  className="cursor-pointer"
                >
                  إزالة الموقع
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {hideFooter ? null : (
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8">
          <Button
            type="button"
            variant="secondary"
            onClick={onPrev}
            className="cursor-pointer w-full sm:w-auto"
          >
            السابق
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={isNextDisabled}
            className="cursor-pointer w-full sm:w-auto"
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
}
