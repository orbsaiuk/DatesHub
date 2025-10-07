"use client";
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ImageUploader from "@/app/business/_components/edit/ImageUploader";

// Middle East currencies
const currencies = [
  { code: "SAR", name: "ريال سعودي", symbol: "ر.س" },
  { code: "AED", name: "درهم إماراتي", symbol: "د.إ" },
  { code: "KWD", name: "دينار كويتي", symbol: "د.ك" },
  { code: "QAR", name: "ريال قطري", symbol: "ر.ق" },
  { code: "BHD", name: "دينار بحريني", symbol: "د.ب" },
  { code: "OMR", name: "ريال عماني", symbol: "ر.ع" },
  { code: "JOD", name: "دينار أردني", symbol: "د.أ" },
  { code: "LBP", name: "ليرة لبنانية", symbol: "ل.ل" },
  { code: "EGP", name: "جنيه مصري", symbol: "ج.م" },
  { code: "IQD", name: "دينار عراقي", symbol: "د.ع" },
  { code: "SYP", name: "ليرة سورية", symbol: "ل.س" },
  { code: "YER", name: "ريال يمني", symbol: "ر.ي" },
];

// Base validation schema
const baseProductSchema = z
  .object({
    title: z
      .string()
      .min(3, "العنوان يجب أن يكون 3 أحرف على الأقل")
      .max(100, "العنوان يجب أن يكون أقل من 100 حرف"),
    description: z
      .string()
      .min(3, "الوصف يجب أن يكون 3 أحرف على الأقل")
      .max(1000, "الوصف يجب أن يكون أقل من 1000 حرف"),
    price: z
      .string()
      .min(1, "السعر مطلوب")
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: "السعر يجب أن يكون رقم أكبر من صفر",
      }),
    quantity: z
      .string()
      .min(1, "الكمية مطلوبة")
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: "الكمية يجب أن تكون رقم أكبر من صفر",
      }),
    currency: z.string().min(1, "يرجى اختيار العملة"),
    weightUnit: z.string().min(1, "يرجى اختيار وحدة الوزن"),
  })
  .refine(
    (data) => {
      // Additional validation for grams - must be whole numbers
      if (data.weightUnit === "g" && data.quantity) {
        const num = parseFloat(data.quantity);
        return Number.isInteger(num);
      }
      return true;
    },
    {
      message: "الكمية بالجرام يجب أن تكون رقم صحيح (بدون فاصلة عشرية)",
      path: ["quantity"],
    }
  );

// Product schema with required image (for both create and update)
const productSchema = baseProductSchema.extend({
  image: z.any().refine(
    (file) => {
      // Accept File objects (new uploads)
      if (file instanceof File) return true;
      // Accept Sanity image objects (existing images)
      if (file?.asset) return true;
      // Accept string URLs (existing images)
      if (typeof file === "string" && file.length > 0) return true;
      // Reject null, undefined, or empty
      return false;
    },
    {
      message: "يرجى رفع صورة للمنتج",
    }
  ),
});

export default function ProductForm({
  onSubmit,
  onCancel,
  isLoading,
  initialValues,
}) {
  const isUpdateMode = !!initialValues;

  // Set proper default values
  const defaultValues = useMemo(
    () => ({
      title: "",
      description: "",
      price: "",
      quantity: "",
      currency: "SAR",
      weightUnit: "kg",
      image: null,
      ...initialValues,
    }),
    [initialValues]
  );

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { isValid, isDirty },
    reset,
  } = form;

  // Reset form when initialValues change
  useEffect(() => {
    if (initialValues) {
      reset(defaultValues);
    }
  }, [initialValues, reset, defaultValues]);

  // Create a unique key for ImageUploader to force re-render when needed
  const imageUploaderKey = useMemo(() => {
    return `image-uploader-${isUpdateMode ? "update" : "create"}-${initialValues?._id || "new"}-${Date.now()}`;
  }, [isUpdateMode, initialValues?._id]);

  const onFormSubmit = (data) => {
    if (!isLoading && isValid) {
      // Convert string numbers to actual numbers
      const processedData = {
        ...data,
        price: parseFloat(data.price),
        quantity: parseFloat(data.quantity),
      };
      onSubmit?.(processedData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                العنوان <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="اسم المنتج"
                  className="h-12 text-base md:h-10 md:text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price, Quantity, Currency Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Price and Currency */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  السعر <span className="text-red-600">*</span>
                </FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="h-10 text-sm sm:h-12 sm:text-base flex-1"
                    />
                  </FormControl>
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field: currencyField }) => (
                      <FormControl>
                        <Select
                          value={currencyField.value}
                          onValueChange={currencyField.onChange}
                          dir="rtl"
                        >
                          <SelectTrigger className="h-10 text-sm sm:h-12 sm:text-base">
                            <SelectValue placeholder="اختر العملة" />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem
                                key={currency.code}
                                value={currency.code}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{currency.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    )}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quantity and Weight Unit */}
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => {
              const weightUnit = form.watch("weightUnit");
              const isKg = weightUnit === "kg";

              return (
                <FormItem>
                  <FormLabel>
                    الكمية <span className="text-red-600">*</span>
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step={isKg ? "0.1" : "1"}
                        placeholder={isKg ? "0.0" : "0"}
                        className="h-10 text-sm sm:h-12 sm:text-base flex-1"
                        onChange={(e) => {
                          let value = e.target.value;

                          // Prevent negative values
                          if (parseFloat(value) < 0) {
                            value = "0";
                          }

                          // For grams, ensure whole numbers only
                          if (!isKg && value.includes(".")) {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              value = Math.floor(numValue).toString();
                            }
                          }

                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormField
                      control={form.control}
                      name="weightUnit"
                      render={({ field: weightField }) => (
                        <FormControl>
                          <Select
                            value={weightField.value}
                            onValueChange={(value) => {
                              weightField.onChange(value);
                              // When switching to grams, convert decimal to whole number
                              if (value === "g") {
                                const currentQuantity =
                                  form.getValues("quantity");
                                if (
                                  currentQuantity &&
                                  currentQuantity.includes(".")
                                ) {
                                  const wholeNumber = Math.floor(
                                    parseFloat(currentQuantity)
                                  ).toString();
                                  form.setValue("quantity", wholeNumber);
                                }
                              }
                            }}
                            dir="rtl"
                          >
                            <SelectTrigger className="h-10 text-sm sm:h-12 sm:text-base w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">كغ</SelectItem>
                              <SelectItem value="g">جم</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Currency Error Message */}
        <FormField
          control={form.control}
          name="currency"
          render={() => (
            <FormItem className="hidden">
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Weight Unit Error Message */}
        <FormField
          control={form.control}
          name="weightUnit"
          render={() => (
            <FormItem className="hidden">
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                الوصف <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="اوصف تفاصيل منتجك"
                  className="text-sm sm:text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Field */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                الصورة <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <ImageUploader
                  key={imageUploaderKey}
                  image={field.value}
                  onImageChange={(newImage) => {
                    field.onChange(newImage);
                  }}
                  placeholder={
                    isUpdateMode ? "تغيير صورة المنتج" : "رفع صورة المنتج"
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Buttons */}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-10 text-sm sm:h-12 sm:text-base"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={!isValid || isLoading || (!isDirty && isUpdateMode)}
            className="h-10 text-sm sm:h-12 sm:text-base"
          >
            {isLoading
              ? isUpdateMode
                ? "جاري التحديث..."
                : "جاري الإنشاء..."
              : isUpdateMode
                ? "تحديث"
                : "إنشاء"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
