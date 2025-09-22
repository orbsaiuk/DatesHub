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
    const d = new Date(form.startDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, [form.startDate]);

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
          Title <span className="text-red-600">*</span>
        </label>
        <Input
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          placeholder="Wedding Photography"
          className="h-12 text-base md:h-10 md:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Start date <span className="text-red-600">*</span>
          </label>
          <Input
            type="date"
            value={form.startDate}
            min={todayStr}
            onChange={(e) => {
              const start = e.target.value;
              let end = form.endDate;
              if (end && new Date(end) <= new Date(start)) {
                end = "";
              }
              onChange({ ...form, startDate: start, endDate: end });
            }}
            className="h-12 text-base md:h-10 md:text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">
            End date <span className="text-red-600">*</span>
          </label>
          <Input
            type="date"
            value={form.endDate}
            min={minEndStr || todayStr}
            disabled={!form.startDate}
            onChange={(e) => onChange({ ...form, endDate: e.target.value })}
            className="h-12 text-base md:h-10 md:text-sm disabled:opacity-70"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Status <span className="text-red-600">*</span>
          </label>
          <Select
            value={form.status}
            onValueChange={(v) => onChange({ ...form, status: v })}
          >
            <SelectTrigger className="h-12 md:h-10 text-base md:text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">
          Description <span className="text-red-600">*</span>
        </label>
        <Textarea
          rows={4}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="Describe your offer details"
          className="text-base md:text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">
          Image <span className="text-red-600">*</span>
        </label>
        <ImageUploader
          image={form.image}
          onImageChange={(img) => onChange({ ...form, image: img })}
          placeholder="Upload offer image"
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
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="h-12 md:h-10"
        >
          {isLoading ? "Creating..." : "Create"}
        </Button>
      </div>
    </form>
  );
}
