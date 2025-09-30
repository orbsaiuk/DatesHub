"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import EventDatePicker from "./EventDatePicker";
import EventTimePicker from "./EventTimePicker";

const statusOptions = [
  { value: "planned", label: "مخطط" },
  { value: "confirmed", label: "مؤكد" },
  { value: "in-progress", label: "جاري" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغى" },
];

const priorityOptions = [
  { value: "low", label: "منخفض" },
  { value: "medium", label: "متوسط" },
  { value: "high", label: "عالي" },
  { value: "urgent", label: "عاجل" },
];

export default function EventDialog({
  open,
  onOpenChange,
  event,
  initialSlot,
  onSave,
}) {
  const [loading, setLoading] = useState(false);
  const eventSchema = z
    .object({
      title: z.string().min(1, "العنوان مطلوب"),
      description: z.string().optional(),
      startDate: z.string().min(1, "تاريخ البداية مطلوب"),
      startTime: z.string().min(1, "وقت البداية مطلوب"),
      endDate: z.string().min(1, "تاريخ النهاية مطلوب"),
      endTime: z.string().min(1, "وقت النهاية مطلوب"),
      location: z.string().optional(),
      status: z.enum([
        "planned",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
      ]),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      clientName: z.string().optional(),
      clientEmail: z
        .string()
        .email("البريد الإلكتروني غير صالح")
        .optional()
        .or(z.literal("")),
      clientPhone: z.string().optional(),
    })
    .refine(
      (data) => {
        // Prevent end selection without start
        if (
          !data.startDate ||
          !data.startTime ||
          !data.endDate ||
          !data.endTime
        )
          return false;
        const start = new Date(`${data.startDate}T${data.startTime}:00`);
        const end = new Date(`${data.endDate}T${data.endTime}:00`);
        return end.getTime() > start.getTime();
      },
      {
        message: "يجب أن تكون النهاية بعد البداية",
        path: ["endTime"],
      }
    );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(eventSchema) });

  const startDateVal = watch("startDate");
  const startTimeVal = watch("startTime");
  const endDateVal = watch("endDate");
  const endTimeVal = watch("endTime");

  // Memoized callbacks to prevent unnecessary re-renders
  const handleStartDateChange = useCallback(
    (value) => {
      setValue("startDate", value);
    },
    [setValue]
  );

  const handleStartTimeChange = useCallback(
    (value) => {
      setValue("startTime", value);
    },
    [setValue]
  );

  const handleEndDateChange = useCallback(
    (value) => {
      setValue("endDate", value);
    },
    [setValue]
  );

  const handleEndTimeChange = useCallback(
    (value) => {
      setValue("endTime", value);
    },
    [setValue]
  );

  useEffect(() => {
    if (open) {
      if (event) {
        // Editing existing event
        reset({
          title: event.title || "",
          description: event.description || "",
          startDate: formatDateForInput(event.start || event.startDate),
          startTime: formatTimeForInput(event.start || event.startDate),
          endDate: formatDateForInput(event.end || event.endDate),
          endTime: formatTimeForInput(event.end || event.endDate),
          location: event.location || "",
          status: event.status || "planned",
          priority: event.priority || "medium",
          clientName: event.clientContact?.name || "",
          clientEmail: event.clientContact?.email || "",
          clientPhone: event.clientContact?.phone || "",
        });
      } else if (initialSlot) {
        // Creating new event from slot selection
        reset({
          title: "",
          description: "",
          startDate: formatDateForInput(initialSlot.start),
          startTime: formatTimeForInput(initialSlot.start),
          endDate: formatDateForInput(initialSlot.end),
          endTime: formatTimeForInput(initialSlot.end),
          location: "",
          status: "planned",
          priority: "medium",
          clientName: "",
          clientEmail: "",
          clientPhone: "",
        });
      } else {
        // Creating new event manually - default to empty date/time fields
        reset({
          title: "",
          description: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
          location: "",
          status: "planned",
          priority: "medium",
          clientName: "",
          clientEmail: "",
          clientPhone: "",
        });
      }
    }
  }, [open, event, initialSlot, reset]);

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toTimeString().slice(0, 5);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const toastId = toast.loading(
        event ? "Updating event…" : "Creating event…"
      );

      // Combine date and time
      const startDateTime = new Date(`${data.startDate}T${data.startTime}:00`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}:00`);

      const eventData = {
        title: data.title,
        description: data.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        location: data.location,
        status: data.status,
        priority: data.priority,
        clientContact:
          data.clientName || data.clientEmail || data.clientPhone
            ? {
                name: data.clientName || undefined,
                email: data.clientEmail || undefined,
                phone: data.clientPhone || undefined,
              }
            : null,
      };

      const url = event
        ? `/api/events/${event.id || event._id}`
        : "/api/events";
      const method = event ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        toast.success(event ? "تم تحديث الحدث" : "تم إنشاء الحدث", {
          id: toastId,
        });
        onSave();
      } else {
        console.error("Failed to save event");
        toast.error("فشل في حفظ الحدث", { id: toastId });
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("خطأ في حفظ الحدث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {event ? "تحرير الحدث" : "إنشاء حدث جديد"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                عنوان الحدث <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="أدخل عنوان الحدث"
                className="text-right"
                dir="rtl"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="وصف الحدث..."
                rows={3}
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <EventDatePicker
                  label="تاريخ البداية"
                  required={true}
                  value={startDateVal}
                  onChange={handleStartDateChange}
                  placeholder="اختر تاريخ البداية"
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.startDate.message}
                  </p>
                )}

                <EventTimePicker
                  label="وقت البداية"
                  required={true}
                  value={startTimeVal}
                  onChange={handleStartTimeChange}
                  placeholder="اختر وقت البداية"
                />
                {errors.startTime && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <EventDatePicker
                  label="تاريخ النهاية"
                  required={true}
                  value={endDateVal}
                  onChange={handleEndDateChange}
                  minDate={startDateVal}
                  disabled={!startDateVal || !startTimeVal}
                  placeholder="اختر تاريخ النهاية"
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endDate.message}
                  </p>
                )}

                <EventTimePicker
                  label="وقت النهاية"
                  required={true}
                  value={endTimeVal}
                  onChange={handleEndTimeChange}
                  disabled={!startDateVal || !startTimeVal || !endDateVal}
                  placeholder="اختر وقت النهاية"
                />
                {errors.endTime && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>
            {(!startDateVal || !startTimeVal) && (
              <p className="text-xs text-muted-foreground">
                حدد تاريخ ووقت البداية أولاً
              </p>
            )}
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="status">
                الحالة <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value)}
                dir="rtl"
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">الأولوية</Label>
              <Select
                value={watch("priority")}
                onValueChange={(value) => setValue("priority", value)}
                dir="rtl"
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الأولوية" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {priorityOptions.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">الموقع</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="موقع الحدث"
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">معلومات العميل</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="clientName">اسم العميل</Label>
                <Input
                  id="clientName"
                  {...register("clientName")}
                  placeholder="اسم العميل"
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">البريد الإلكتروني للعميل</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  {...register("clientEmail")}
                  placeholder="client@example.com"
                  className="text-right"
                  dir="rtl"
                />
                {errors.clientEmail && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.clientEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone">هاتف العميل</Label>
                <Input
                  id="clientPhone"
                  {...register("clientPhone")}
                  placeholder="+966 123 456 789"
                  className="text-right"
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-start space-x-2 pt-4" dir="ltr">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "جاري الحفظ..."
                : event
                  ? "تحديث الحدث"
                  : "إنشاء الحدث"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
