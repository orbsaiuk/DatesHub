"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, FileText } from "lucide-react";
import {
  eventRequestSchema,
  defaultEventRequestValues,
} from "./eventRequestSchema";

// Import smaller components
import FullNameInput from "./FullNameInput";
import EventRequestInput from "./EventRequestInput";
import EventRequestDatePicker from "./EventRequestDatePicker";
import EventRequestTimePicker from "./EventRequestTimePicker";
import NumberOfGuestsInput from "./NumberOfGuestsInput";
import CategorySelect from "./CategorySelect";
import EventRequestTextarea from "./EventRequestTextarea";
import EventRequestActions from "./EventRequestActions";

export default function EventRequestForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialValues = defaultEventRequestValues,
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
    resolver: zodResolver(eventRequestSchema),
    defaultValues: initialValues,
    mode: "all", // Validate on blur, change, and submit
    reValidateMode: "onChange", // Re-validate on change
  });

  // Watch all form values for live validation feedback
  const watchedValues = watch();

  const onFormSubmit = async (data) => {
    try {
      await onSubmit?.(data);
      reset(); // Reset form after successful submission
    } catch (error) {
      console.error("Error submitting event request:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-900">
          خطط فعاليتك المثاليه – إنه سريع وسهل
        </CardTitle>
        <p className="text-gray-600 mt-2">
          أخبرنا التفاصيل حول فعاليتك وسنقوم بتوصيلك مع أفضل الموردين لجعله غير
          قابل للنسيان.
        </p>
      </CardHeader>
      <CardContent>
        <form
          dir="rtl"
          onSubmit={handleSubmit(onFormSubmit)}
          className="space-y-6"
        >
          {/* Full Name and Event Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FullNameInput
              register={register}
              setValue={setValue}
              error={errors.fullName}
              hasValue={watchedValues.fullName?.trim()}
            />
            <EventRequestDatePicker
              name="eventDate"
              label="تاريخ الفعالية"
              required={true}
              error={errors.eventDate}
              hasValue={watchedValues.eventDate?.trim()}
              setValue={setValue}
              value={watchedValues.eventDate}
              trigger={trigger}
            />
          </div>

          {/* Event Time and Number of Guests Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EventRequestTimePicker
              name="eventTime"
              label="وقت الفعالية"
              required={true}
              error={errors.eventTime}
              hasValue={watchedValues.eventTime?.trim()}
              setValue={setValue}
              value={watchedValues.eventTime}
              trigger={trigger}
            />
            <NumberOfGuestsInput
              register={register}
              setValue={setValue}
              trigger={trigger}
              error={errors.numberOfGuests}
              hasValue={watchedValues.numberOfGuests?.trim()}
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
            <EventRequestInput
              name="serviceRequired"
              label="الخدمات المطلوبة"
              type="text"
              placeholder="مثال: التصوير, الموسيقى"
              icon={<FileText size={16} />}
              required={true}
              error={errors.serviceRequired}
              hasValue={watchedValues.serviceRequired?.trim()}
              register={register}
            />
          </div>

          {/* Service Required and Event Location Row */}
          <div className="grid grid-cols-1 gap-6">
            <EventRequestInput
              name="eventLocation"
              label="موقع الفعالية"
              type="text"
              placeholder="أدخل المدينة أو الموقع الدقيق"
              icon={<MapPin size={16} />}
              required={true}
              error={errors.eventLocation}
              hasValue={watchedValues.eventLocation?.trim()}
              register={register}
            />
          </div>

          {/* Event Description */}
          <div>
            <EventRequestTextarea
              name="eventDescription"
              label="وصف الفعالية"
              placeholder="وصف فعاليتك, الموضوع, أو أي طلبات خاصة"
              required={true}
              error={errors.eventDescription}
              hasValue={watchedValues.eventDescription?.trim()}
              register={register}
            />
          </div>

          {/* Action Buttons */}
          <EventRequestActions
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
