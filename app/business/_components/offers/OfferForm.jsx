"use client";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUploader from "@/app/business/_components/edit/ImageUploader";
import OfferDatePicker from "./OfferDatePicker";

export default function OfferForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  isLoading,
}) {
  const form = values;

  const isValid = useMemo(
    () =>
      form.title.trim().length > 2 &&
      form.description.trim().length > 2 &&
      form.image &&
      form.startDate &&
      form.endDate,
    [form.title, form.description, form.image, form.startDate, form.endDate]
  );

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const minEndStr = useMemo(() => {
    if (!form.startDate) return "";
    // Allow same date for start and end (same-day offers)
    return form.startDate;
  }, [form.startDate]);

  // Calculate offer duration in days
  const offerDuration = useMemo(() => {
    if (!form.startDate || !form.endDate) return null;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return diffDays;
  }, [form.startDate, form.endDate]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isValid || isLoading) return;
        onSubmit?.();
      }}
    >
      <div className="space-y-1">
        <label className="text-sm font-medium">
          العنوان <span className="text-red-600">*</span>
        </label>
        <Input
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          placeholder="أدخل عنوان العرض"
          className="h-12 text-base md:h-10 md:text-sm"
        />
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <OfferDatePicker
            label="تاريخ البداية"
            required={true}
            value={form.startDate}
            onChange={(startDate) => {
              let end = form.endDate;
              if (end && new Date(end) < new Date(startDate)) {
                end = "";
              }
              onChange({ ...form, startDate, endDate: end });
            }}
            minDate={todayStr}
            placeholder="اختر تاريخ البداية"
          />
          <OfferDatePicker
            label="تاريخ النهاية"
            required={true}
            value={form.endDate}
            onChange={(endDate) => onChange({ ...form, endDate })}
            minDate={minEndStr || todayStr}
            disabled={!form.startDate}
            placeholder="اختر تاريخ النهاية"
          />
          <div className="space-y-1">
            <label className="text-sm font-medium">
              الحالة <span className="text-red-600">*</span>
            </label>
            <Select
              value={form.status}
              onValueChange={(v) => onChange({ ...form, status: v })}
              dir="rtl"
            >
              <SelectTrigger className="h-12 md:h-10 text-base md:text-sm">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {offerDuration !== null && (
          <div
            className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-right"
            dir="rtl"
          >
            <p className="text-sm font-medium text-blue-900">
              مدة العرض:{" "}
              {offerDuration === 1
                ? "يوم واحد"
                : offerDuration === 2
                  ? "يومان"
                  : `${offerDuration} أيام`}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">
          الوصف <span className="text-red-600">*</span>
        </label>
        <Textarea
          rows={4}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="اوصف تفاصيل عرضك"
          className="text-base md:text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">
          الصورة <span className="text-red-600">*</span>
        </label>
        <ImageUploader
          image={form.image}
          onImageChange={(img) => onChange({ ...form, image: img })}
          placeholder="رفع صورة العرض"
          multiple={false}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="h-12 md:h-10"
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="h-12 md:h-10"
        >
          {isLoading ? "جاري الإنشاء..." : "إنشاء"}
        </Button>
      </div>
    </form>
  );
}
