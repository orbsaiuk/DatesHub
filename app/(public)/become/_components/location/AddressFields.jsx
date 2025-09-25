"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddressFields({ idx, register, errors }) {
  return (
    <>
      <div className="md:col-span-2">
        <Label className="text-sm" htmlFor={`address_${idx}`}>
          العنوان <span className="text-red-600">*</span>
        </Label>
        <Input
          id={`address_${idx}`}
          placeholder="عنوان الشارع"
          aria-invalid={!!errors.locations?.[idx]?.address}
          {...register(`locations.${idx}.address`)}
          className="mt-1"
        />
        {errors.locations?.[idx]?.address?.message ? (
          <p className="text-xs text-red-600 mt-1">
            {errors.locations[idx].address.message}
          </p>
        ) : null}
      </div>
      <div>
        <Label className="text-sm" htmlFor={`country_${idx}`}>
          البلد <span className="text-red-600">*</span>
        </Label>
        <Input
          id={`country_${idx}`}
          placeholder="البلد"
          aria-invalid={!!errors.locations?.[idx]?.country}
          {...register(`locations.${idx}.country`)}
          className="mt-1"
        />
        {errors.locations?.[idx]?.country?.message ? (
          <p className="text-xs text-red-600 mt-1">
            {errors.locations[idx].country.message}
          </p>
        ) : null}
      </div>
      <div>
        <Label className="text-sm" htmlFor={`city_${idx}`}>
          المدينة <span className="text-red-600">*</span>
        </Label>
        <Input
          id={`city_${idx}`}
          placeholder="المدينة"
          aria-invalid={!!errors.locations?.[idx]?.city}
          {...register(`locations.${idx}.city`)}
          className="mt-1"
        />
        {errors.locations?.[idx]?.city?.message ? (
          <p className="text-xs text-red-600 mt-1">
            {errors.locations[idx].city.message}
          </p>
        ) : null}
      </div>
      <div>
        <Label className="text-sm" htmlFor={`zip_${idx}`}>
          الرمز البريدي <span className="text-red-600">*</span>
        </Label>
        <Input
          id={`zip_${idx}`}
          placeholder="الرمز البريدي"
          aria-invalid={!!errors.locations?.[idx]?.zipCode}
          {...register(`locations.${idx}.zipCode`)}
          className="mt-1"
        />
        {errors.locations?.[idx]?.zipCode?.message ? (
          <p className="text-xs text-red-600 mt-1">
            {errors.locations[idx].zipCode.message}
          </p>
        ) : null}
      </div>
      <div>
        <Label className="text-sm" htmlFor={`region_${idx}`}>
          المنطقة <span className="text-red-600">*</span>
        </Label>
        <Input
          id={`region_${idx}`}
          placeholder="الولاية/المنطقة"
          aria-invalid={!!errors.locations?.[idx]?.region}
          {...register(`locations.${idx}.region`)}
          className="mt-1"
        />
        {errors.locations?.[idx]?.region?.message ? (
          <p className="text-xs text-red-600 mt-1">
            {errors.locations[idx].region.message}
          </p>
        ) : null}
      </div>
    </>
  );
}
