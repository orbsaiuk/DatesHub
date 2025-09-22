"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, FileText } from "lucide-react";
import {
  eventRequestSchema,
  defaultEventRequestValues,
} from "./eventRequestSchema";

// Import smaller components
import FullNameInput from "./FullNameInput";
import EventRequestInput from "./EventRequestInput";
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
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm({
    resolver: zodResolver(eventRequestSchema),
    defaultValues: initialValues,
    mode: "onChange",
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

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Plan Your Perfect Event – It's Quick & Easy
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Tell us the details of your event and we'll connect you with the best
          suppliers to make it unforgettable.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Full Name and Event Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FullNameInput
              register={register}
              setValue={setValue}
              error={errors.fullName}
              hasValue={watchedValues.fullName?.trim()}
            />
            <EventRequestInput
              name="eventDate"
              label="Event Date"
              type="date"
              placeholder="Select the date of your event"
              icon={<Calendar size={16} />}
              required={true}
              error={errors.eventDate}
              hasValue={watchedValues.eventDate?.trim()}
              register={register}
              min={today}
            />
          </div>

          {/* Event Time and Number of Guests Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EventRequestInput
              name="eventTime"
              label="Event Time"
              type="time"
              placeholder="Select the time"
              icon={<Clock size={16} />}
              required={true}
              error={errors.eventTime}
              hasValue={watchedValues.eventTime?.trim()}
              register={register}
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
              error={errors.category}
              hasValue={watchedValues.category}
              value={watchedValues.category}
            />
            <EventRequestInput
              name="serviceRequired"
              label="Service Required"
              type="text"
              placeholder="e.g., Catering, Photography, DJ"
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
              label="Event Location"
              type="text"
              placeholder="Enter the city or exact venue location"
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
              label="Event Description"
              placeholder="Describe your event, theme, or any special requests"
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
          />
        </form>
      </CardContent>
    </Card>
  );
}
