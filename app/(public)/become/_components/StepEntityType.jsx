"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Package } from "lucide-react";

export default function StepEntityType({ onNext }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const entityType = watch("entityType");

  const handleEntitySelect = (type) => {
    setValue("entityType", type);
    // Reset form fields that might differ between entity types
    setValue("companyType", "");
    setValue("totalEmployees", "");
    setValue("foundingYear", "");
  };

  const canNext = Boolean(entityType);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Join Our Platform</h1>
      <p className="text-gray-600 mb-8">
        Choose the type of business you want to register
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            entityType === "company" 
              ? "ring-2 ring-blue-500 bg-blue-50" 
              : "hover:bg-gray-50"
          }`}
          onClick={() => handleEntitySelect("company")}
        >
          <CardContent className="p-6 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Company</h3>
            <p className="text-sm text-gray-600">
              Full-service event planning companies or specialized service providers
            </p>
            <div className="mt-4">
              <input
                type="radio"
                {...register("entityType")}
                value="company"
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mx-auto ${
                entityType === "company" 
                  ? "bg-blue-500 border-blue-500" 
                  : "border-gray-300"
              }`}>
                {entityType === "company" && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            entityType === "supplier" 
              ? "ring-2 ring-green-500 bg-green-50" 
              : "hover:bg-gray-50"
          }`}
          onClick={() => handleEntitySelect("supplier")}
        >
          <CardContent className="p-6 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold mb-2">Supplier</h3>
            <p className="text-sm text-gray-600">
              Product suppliers, vendors, or equipment rental services
            </p>
            <div className="mt-4">
              <input
                type="radio"
                {...register("entityType")}
                value="supplier"
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mx-auto ${
                entityType === "supplier" 
                  ? "bg-green-500 border-green-500" 
                  : "border-gray-300"
              }`}>
                {entityType === "supplier" && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {errors.entityType && (
        <p className="text-sm text-red-600 mb-4">{errors.entityType.message}</p>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="w-full sm:w-auto cursor-pointer"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
