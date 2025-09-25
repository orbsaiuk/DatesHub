import { z } from "zod";

export const optionalString = z.string().optional().or(z.literal(""));

export const requiredString = (message) => z.string().min(1, message);

export const urlString = z
  .string()
  .url("أدخل رابط صحيح")
  .refine((v) => /^https?:\/\//i.test(v), {
    message: "يجب أن يبدأ الرابط بـ https://",
  });

export const optionalUrl = optionalString.refine(
  (v) => !v || z.string().url().safeParse(v).success,
  { message: "أدخل رابط صحيح" }
);

export const emailString = z.string().email("أدخل عنوان بريد إلكتروني صحيح");

export const phoneString = z.string().min(7, "رقم الهاتف مطلوب");

// Year validation with logical bounds
export const yearString = z
  .string()
  .regex(/^\d{4}$/, "أدخل سنة مكونة من 4 أرقام")
  .refine(
    (year) => {
      const yearNum = parseInt(year, 10);
      const currentYear = new Date().getFullYear();
      return yearNum >= 1800 && yearNum <= currentYear;
    },
    {
      message: "يجب أن تكون السنة بين 1800 والسنة الحالية",
    }
  );

export const yearNumber = z
  .number()
  .int()
  .min(1800, "يجب أن تكون السنة 1800 أو أحدث")
  .max(
    new Date().getFullYear(),
    `لا يمكن أن تكون السنة أحدث من ${new Date().getFullYear()}`
  );

// Simple form field schemas (no Sanity structure validation)
export const imageFileSchema = z.instanceof(File).optional().nullable();

export const categoryIdSchema = z.string().min(1, "الفئة مطلوبة");

export const geoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const contactSchema = z.object({
  ownerName: requiredString("اسم المالك مطلوب"),
  phone: phoneString,
  email: emailString,
  address: requiredString("العنوان مطلوب"),
});

export const locationSchema = z.object({
  country: requiredString("البلد مطلوب"),
  city: requiredString("المدينة مطلوبة"),
  address: requiredString("العنوان مطلوب"),
  region: requiredString("المنطقة مطلوبة"),
  zipCode: requiredString("الرمز البريدي مطلوب"),
  geo: geoPointSchema.optional().nullable(),
});

// Flexible schemas for edit forms
export const flexibleContactSchema = z.object({
  ownerName: optionalString,
  phone: optionalString,
  email: optionalString.refine((v) => !v || emailString.safeParse(v).success, {
    message: "أدخل عنوان بريد إلكتروني صحيح",
  }),
  address: optionalString,
});

export const flexibleLocationSchema = z.object({
  country: optionalString,
  city: optionalString,
  address: optionalString,
  region: optionalString,
  zipCode: optionalString,
  geo: geoPointSchema.optional().nullable(),
});

// ============================================================================
// CONTENT SCHEMAS
// ============================================================================

export const awardSchema = z.object({
  name: optionalString,
  description: optionalString,
  issuer: optionalString,
  date: optionalString,
  image: imageFileSchema, // Just validate File objects
});

export const workSchema = z.object({
  title: optionalString,
  description: optionalString,
  images: z.array(imageFileSchema).optional(), // Array of File objects
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const logoValidation = (val, ctx) => {
  const hasFile = Boolean(val.logoFile);
  const hasSelected = Boolean(val.logoSelected);
  if (!hasFile && !hasSelected) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["logo"],
      message: "الشعار مطلوب",
    });
  }
};

export const createArraySchema = (
  itemSchema,
  min = 0,
  max = Infinity,
  minMessage,
  maxMessage
) => {
  let schema = z.array(itemSchema);
  if (min > 0) schema = schema.min(min, minMessage);
  if (max < Infinity) schema = schema.max(max, maxMessage);
  return schema;
};

// Common array configurations
export const categoriesArray = createArraySchema(
  z.union([
    z.string().min(1, "الفئة مطلوبة"), // Simple string IDs
    z.object({
      _type: z.literal("reference"),
      _ref: z.string().min(1, "مرجع الفئة مطلوب"),
    }), // Sanity reference objects
  ]),
  1,
  3,
  "اختر فئة واحدة على الأقل",
  "يمكنك اختيار حتى 3 فئات"
);

export const extraServicesArray = createArraySchema(
  z.string().min(2, "حرفان على الأقل").max(30, "حد أقصى 30 حرف"),
  0,
  20,
  undefined,
  "خدمات إضافية كثيرة جداً"
);

export const socialLinksArray = z.array(
  optionalString.refine((v) => !v || urlString.safeParse(v).success, {
    message: "أدخل رابط صحيح",
  })
);

export const openingHoursArray = z
  .array(z.string().min(1, "خط الساعة لا يمكن أن يكون فارغاً"))
  .length(7, "يرجى تقديم ساعات العمل لجميع الأيام السبعة");

// ============================================================================
// ENTITY TYPE ENUMS
// ============================================================================

export const entityTypeEnum = z.enum(["company", "supplier"], {
  required_error: "يرجى اختيار نوع الكيان",
});

export const companyTypeEnum = z.enum(
  [
    "full-event-planner",
    "kids-birthday",
    "wedding",
    "social-gathering",
    "corporate-event",
  ],
  {
    required_error: "نوع الفعالية مطلوب",
  }
);

export const validateCompanyType = (value) => {
  const errors = {};
  if (!value) {
    errors.companyType = "نوع الفعالية مطلوب";
  }
  return errors;
};
