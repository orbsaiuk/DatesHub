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
        event ? "جاري تحديث الحجز..." : "جاري إنشاء الحجز..."
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
        toast.success(event ? "تم تحديث الحجز بنجاح" : "تم إنشاء الحجز بنجاح", {
          id: toastId,
        });
        onSave();
      } else {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to save event");
        }
        toast.error("فشل في حفظ الحجز", { id: toastId });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error saving event:", error);
      }
      toast.error("حدث خطأ أثناء حفظ الحجز");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader className="space-y-3 pb-4 border-b">
          <DialogTitle className="text-center text-2xl font-bold">
            {event ? "تحرير الحجز" : "إنشاء حجز جديد"}
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            {event ? "قم بتحديث تفاصيل الحجز" : "أضف حجز جديد إلى التقويم"}
          </p>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 pt-4"
          dir="rtl"
        >
          {/* Basic Information */}
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded"></span>
              المعلومات الأساسية
            </h3>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">
                عنوان الحجز <span className="text-red-500 ms-1">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="مثال: حفل زفاف أحمد وسارة"
                className="text-right h-11 text-base"
                dir="rtl"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">
                الوصف
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="أضف تفاصيل إضافية عن الحجز..."
                rows={3}
                className="text-right resize-none"
                dir="rtl"
              />
              <p className="text-xs text-muted-foreground">
                يمكنك إضافة ملاحظات أو متطلبات خاصة هنا
              </p>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded"></span>
              التاريخ والوقت
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date & Time */}
              <div className="space-y-4 p-4 bg-background rounded-md border border-border/50">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h4 className="font-medium text-base">بداية الحجز</h4>
                </div>

                <EventDatePicker
                  label="التاريخ"
                  required={true}
                  value={startDateVal}
                  onChange={handleStartDateChange}
                  placeholder="اختر تاريخ البداية"
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.startDate.message}
                  </p>
                )}

                <EventTimePicker
                  label="الوقت"
                  required={true}
                  value={startTimeVal}
                  onChange={handleStartTimeChange}
                  placeholder="اختر وقت البداية"
                />
                {errors.startTime && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              {/* End Date & Time */}
              <div className="space-y-4 p-4 bg-background rounded-md border border-border/50">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <h4 className="font-medium text-base">نهاية الحجز</h4>
                </div>

                <EventDatePicker
                  label="التاريخ"
                  required={true}
                  value={endDateVal}
                  onChange={handleEndDateChange}
                  minDate={startDateVal}
                  disabled={!startDateVal || !startTimeVal}
                  placeholder="اختر تاريخ النهاية"
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.endDate.message}
                  </p>
                )}

                <EventTimePicker
                  label="الوقت"
                  required={true}
                  value={endTimeVal}
                  onChange={handleEndTimeChange}
                  disabled={!startDateVal || !startTimeVal || !endDateVal}
                  placeholder="اختر وقت النهاية"
                />
                {errors.endTime && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            {(!startDateVal || !startTimeVal) && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                <span className="text-lg">ℹ️</span>
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  حدد تاريخ ووقت البداية أولاً لتتمكن من اختيار النهاية
                </p>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded"></span>
              تفاصيل الحجز
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-base font-medium">
                  الحالة <span className="text-red-500 ms-1">*</span>
                </Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value) => setValue("status", value)}
                  dir="rtl"
                >
                  <SelectTrigger className="h-11">
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
                <Label htmlFor="priority" className="text-base font-medium">
                  الأولوية
                </Label>
                <Select
                  value={watch("priority")}
                  onValueChange={(value) => setValue("priority", value)}
                  dir="rtl"
                >
                  <SelectTrigger className="h-11">
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
                <Label htmlFor="location" className="text-base font-medium">
                  الموقع
                </Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="مثال: قاعة الأفراح"
                  className="text-right h-11"
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded"></span>
              معلومات العميل
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-base font-medium">
                  اسم العميل
                </Label>
                <Input
                  id="clientName"
                  {...register("clientName")}
                  placeholder="مثال: أحمد محمد"
                  className="text-right h-11"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail" className="text-base font-medium">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  {...register("clientEmail")}
                  placeholder="example@email.com"
                  className="text-right h-11"
                  dir="ltr"
                />
                {errors.clientEmail && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.clientEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone" className="text-base font-medium">
                  رقم الهاتف
                </Label>
                <Input
                  id="clientPhone"
                  {...register("clientPhone")}
                  placeholder="05XX XXX XXXX"
                  className="text-right h-11"
                  dir="ltr"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span>💡</span>
              سيتم استخدام هذه المعلومات للتواصل مع العميل
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t" dir="rtl">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-w-[120px] h-11"
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px] h-11 font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  جاري الحفظ...
                </span>
              ) : event ? (
                "تحديث الحجز"
              ) : (
                "إنشاء الحجز"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
