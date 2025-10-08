import { z } from "zod";

export const orderRequestSchema = z.object({
  fullName: z
    .string()
    .min(1, "الاسم الكامل مطلوب")
    .min(2, "الاسم الكامل يجب أن يكون على الأقل حرفين")
    .max(100, "الاسم الكامل لا يمكن أن يتجاوز 100 حرف")
    .regex(
      /^[\u0600-\u06FFa-zA-Z\s'-]+$/,
      "الاسم الكامل يمكن أن يحتوي فقط على أحرف ومسافات وشرطات"
    )
    .refine((value) => {
      const contactPatterns = [/@/, /\d{3,}/];
      return !contactPatterns.some((pattern) => pattern.test(value));
    }, "الرجاء إدخال الاسم فقط بدون معلومات الاتصال"),

  deliveryDate: z
    .string()
    .min(1, "تاريخ التوصيل مطلوب")
    .refine((dateString) => {
      if (!dateString) return false;
      const deliveryDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return deliveryDate >= today;
    }, "تاريخ التوصيل لا يمكن أن يكون في الماضي"),

  quantity: z
    .string()
    .refine((val) => val !== "", {
      message: "الكمية مطلوبة",
    })
    // Validate format first (digits and decimal point only)
    .refine((val) => /^\d+(\.\d+)?$/.test(val), {
      message: "الرجاء إدخال رقم صحيح أو عشري",
    })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), {
      message: "الرجاء إدخال رقم صحيح",
    })
    .refine((val) => val >= 0.5, {
      message: "الكمية يجب أن تكون على الأقل 0.5",
    })
    .refine((val) => val <= 100, {
      message: "الكمية لا يمكن أن تتجاوز 100 كيلو",
    }),

  category: z.string().min(1, "الرجاء اختيار فئة الخدمة"),

  deliveryAddress: z
    .string()
    .min(1, "عنوان التوصيل مطلوب")
    .min(5, "عنوان التوصيل يجب أن يكون بالتفصيل")
    .max(300, "عنوان التوصيل لا يمكن أن يتجاوز 300 حرف"),

  additionalNotes: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .superRefine((value, ctx) => {
      // Skip all validations if the value is undefined or empty
      if (value === undefined || value === "") return;

      // Min length validation
      if (value.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 10,
          type: "string",
          inclusive: true,
          message: "الملاحظات يجب أن تكون على الأقل 10 أحرف",
        });
        return;
      }

      // Max length validation
      if (value.length > 1000) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: 1000,
          type: "string",
          inclusive: true,
          message: "الملاحظات لا يمكن أن تتجاوز 1000 حرف",
        });
        return;
      }

      // Email pattern validation
      const emailPattern =
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      if (emailPattern.test(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "الرجاء عدم تضمين عناوين البريد الإلكتروني في الوصف",
        });
        return;
      }

      // Phone patterns validation
      const phonePatterns = [
        /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
        /\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/,
        /\b\+\d{1,3}[-.\s]?\d{1,14}\b/,
        /\b0\d{2,4}[-.\s]?\d{3,8}\b/,
        /\b\d{11}\b/,
        /\b\d{10}\b/,
      ];
      if (phonePatterns.some((pattern) => pattern.test(value))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "الرجاء عدم تضمين أرقام الهاتف في الوصف",
        });
        return;
      }

      // Contact patterns validation
      const contactPatterns = [
        /\b(call|text|phone|contact|email|reach)\s+(me|us)\s+(at|on)\b/i,
        /\b(my|our)\s+(number|phone|email|contact)\s+(is|:)\b/i,
        /\b(tel|phone|mobile|cell)[:.]?\s*\d/i,
        /\b(email|mail)[:.]?\s*\w+@/i,
        /\b(اتصل|تواصل|رقم|هاتف|جوال|ايميل|بريد)\b/i,
      ];
      if (contactPatterns.some((pattern) => pattern.test(value))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "الرجاء عدم تضمين معلومات الاتصال في الوصف",
        });
        return;
      }

      // Digit count validation
      const digitMatches = value.match(/\d/g);
      const totalDigits = digitMatches ? digitMatches.length : 0;
      if (totalDigits > 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "الرجاء عدم تضمين أكثر من 8 أرقام في الوصف",
        });
        return;
      }
    }),
});

export const defaultOrderRequestValues = {
  fullName: "",
  deliveryDate: "",
  quantity: "",
  category: "",
  deliveryAddress: "",
  additionalNotes: "",
};
