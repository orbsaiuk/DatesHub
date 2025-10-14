"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import {
  orderRequestSchema,
  defaultOrderRequestValues,
} from "./orderRequestSchema";

// Import smaller components
import FullNameInput from "./FullNameInput";
import OrderRequestInput from "./OrderRequestInput";
import OrderRequestDatePicker from "./OrderRequestDatePicker";
import CategorySelect from "./CategorySelect";
import QuantityInput from "./QuantityInput";
import OrderRequestTextarea from "./OrderRequestTextarea";
import OrderRequestActions from "./OrderRequestActions";

export default function OrderRequestForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialValues = defaultOrderRequestValues,
  companyTenantId,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm({
    resolver: zodResolver(orderRequestSchema),
    defaultValues: initialValues,
    mode: "all",
    reValidateMode: "onChange",
  });

  const watchedValues = watch();

  const onFormSubmit = async (data) => {
    try {
      await onSubmit?.(data);
      reset();
    } catch (error) {
      // Error submitting order request
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-900">
          اطلب تمورك المفضلة
        </CardTitle>
        <p className="text-gray-600 mt-2">
          أخبرنا عن طلبك وسنوفر لك أجود أنواع التمور بأفضل سعر
        </p>
      </CardHeader>
      <CardContent>
        <form
          dir="rtl"
          onSubmit={handleSubmit(onFormSubmit)}
          className="space-y-6"
        >
          {/* Full Name and Delivery Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FullNameInput
              register={register}
              setValue={setValue}
              error={errors.fullName}
              hasValue={watchedValues.fullName?.trim()}
            />
            <OrderRequestDatePicker
              name="deliveryDate"
              label="تاريخ الاستلام"
              required={true}
              error={errors.deliveryDate}
              hasValue={watchedValues.deliveryDate?.trim()}
              setValue={setValue}
              value={watchedValues.deliveryDate}
              trigger={trigger}
            />
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategorySelect
              companyTenantId={companyTenantId}
              setValue={setValue}
              trigger={trigger}
              error={errors.category}
              hasValue={watchedValues.category}
              value={watchedValues.category}
            />
            <QuantityInput
              register={register}
              setValue={setValue}
              trigger={trigger}
              error={errors.quantity}
              hasValue={watchedValues.quantity}
            />
          </div>

          {/* Delivery Address Row */}
          <div className="grid grid-cols-1 gap-6">
            <OrderRequestInput
              name="deliveryAddress"
              label="عنوان التوصيل"
              type="text"
              placeholder="أدخل المدينة والعنوان بالتفصيل"
              icon={<MapPin size={16} />}
              required={true}
              error={errors.deliveryAddress}
              hasValue={watchedValues.deliveryAddress?.trim()}
              register={register}
            />
          </div>

          {/* Additional Notes */}
          <div>
            <OrderRequestTextarea
              name="additionalNotes"
              label="ملاحظات إضافية"
              placeholder="أي ملاحظات أو طلبات خاصة بخصوص الطلب"
              required={false}
              error={errors.additionalNotes}
              hasValue={watchedValues.additionalNotes?.trim()}
              register={register}
            />
          </div>

          {/* Action Buttons */}
          <OrderRequestActions
            onCancel={onCancel}
            isLoading={isLoading}
            isValid={isValid}
            errors={errors}
          />
        </form>
      </CardContent>
    </Card>
  );
}
