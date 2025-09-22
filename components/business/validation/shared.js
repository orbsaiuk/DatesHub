import { z } from "zod";

export const optionalString = z.string().optional().or(z.literal(""));

export const requiredString = (message) => z.string().min(1, message);

export const urlString = z
  .string()
  .url("Enter a valid URL")
  .refine((v) => /^https?:\/\//i.test(v), {
    message: "URL must start with http:// or https://",
  });

export const optionalUrl = optionalString.refine(
  (v) => !v || z.string().url().safeParse(v).success,
  { message: "Enter a valid URL" }
);

export const emailString = z.string().email("Enter a valid email address");

export const phoneString = z.string().min(7, "Phone number is required");

// Year validation with logical bounds
export const yearString = z
  .string()
  .regex(/^\d{4}$/, "Enter a 4-digit year")
  .refine(
    (year) => {
      const yearNum = parseInt(year, 10);
      const currentYear = new Date().getFullYear();
      return yearNum >= 1800 && yearNum <= currentYear;
    },
    {
      message: "Year must be between 1800 and current year",
    }
  );

export const yearNumber = z
  .number()
  .int()
  .min(1800, "Year must be 1800 or later")
  .max(
    new Date().getFullYear(),
    `Year cannot be later than ${new Date().getFullYear()}`
  );

// Simple form field schemas (no Sanity structure validation)
export const imageFileSchema = z.instanceof(File).optional().nullable();

export const categoryIdSchema = z.string().min(1, "Category is required");

export const geoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const contactSchema = z.object({
  ownerName: requiredString("Owner name is required"),
  phone: phoneString,
  email: emailString,
  address: requiredString("Address is required"),
});

export const locationSchema = z.object({
  country: requiredString("Country is required"),
  city: requiredString("City is required"),
  address: requiredString("Address is required"),
  region: optionalString,
  zipCode: requiredString("Zip code is required"),
  geo: geoPointSchema.optional().nullable(),
});

// Flexible schemas for edit forms
export const flexibleContactSchema = z.object({
  ownerName: optionalString,
  phone: optionalString,
  email: optionalString.refine((v) => !v || emailString.safeParse(v).success, {
    message: "Enter a valid email address",
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
      message: "Logo is required",
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
    z.string().min(1, "Category is required"), // Simple string IDs
    z.object({
      _type: z.literal("reference"),
      _ref: z.string().min(1, "Category reference is required"),
    }), // Sanity reference objects
  ]),
  1,
  3,
  "Select at least one category",
  "You can select up to 3 categories"
);

export const extraServicesArray = createArraySchema(
  z.string().min(2, "At least 2 characters").max(30, "Max 30 characters"),
  0,
  20,
  undefined,
  "Too many extra services"
);

export const socialLinksArray = z.array(
  optionalString.refine((v) => !v || urlString.safeParse(v).success, {
    message: "Enter a valid URL",
  })
);

export const openingHoursArray = z
  .array(z.string().min(1, "Hour line cannot be empty"))
  .length(7, "Please provide hours for all 7 days");

// ============================================================================
// ENTITY TYPE ENUMS
// ============================================================================

export const entityTypeEnum = z.enum(["company", "supplier"], {
  required_error: "Please select an entity type",
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
    required_error: "Event type is required",
  }
);

export const validateCompanyType = (value) => {
  const errors = {};
  if (!value) {
    errors.companyType = "Event type is required";
  }
  return errors;
};
