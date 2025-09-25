import { z } from "zod";
import {
  optionalString,
  requiredString,
  optionalUrl,
  yearString,
  imageFileSchema,
  contactSchema,
  locationSchema,
  logoValidation,
  categoriesArray,
  extraServicesArray,
  socialLinksArray,
  openingHoursArray,
  entityTypeEnum,
  companyTypeEnum,
} from "./shared";

// Base schema shared by both entity types
const baseEntitySchema = z.object({
  entityType: entityTypeEnum,
  name: requiredString("اسم العمل التجاري مطلوب"),
  website: optionalUrl,
  foundingYear: yearString,
  registrationNumber: requiredString("رقم السجل التجاري مطلوب"),
  logoSelected: z.boolean().optional(),
  logoFile: imageFileSchema,
  description: z.string().min(10, "يجب أن يكون الوصف 10 أحرف على الأقل"),
  socialLinks: socialLinksArray,
  contact: contactSchema,
  locations: z.array(locationSchema).min(1, "أضف موقع واحد على الأقل"),
  openingHours: openingHoursArray,
  services: categoriesArray,
  extraServices: extraServicesArray,
});

// Entity-specific schemas using discriminated union
const companySchema = baseEntitySchema
  .extend({
    entityType: z.literal("company"),
    totalEmployees: requiredString("إجمالي الموظفين مطلوب"),
    companyType: companyTypeEnum,
  })
  .superRefine(logoValidation);

const supplierSchema = baseEntitySchema
  .extend({
    entityType: z.literal("supplier"),
    totalEmployees: optionalString,
  })
  .superRefine(logoValidation);

// Discriminated union for entity schemas
const entitySchemaUnion = z.discriminatedUnion("entityType", [
  companySchema,
  supplierSchema,
]);

// Create conditional schema based on entity type
export const createEntitySchema = (entityType) => {
  return entityType === "company" ? companySchema : supplierSchema;
};

// Default schema (fallback to company)
export const entitySchema = createEntitySchema("company");

// Export the discriminated union for cases where entity type is dynamic
export const dynamicEntitySchema = entitySchemaUnion;

// Initial values for different entity types
export const getInitialValues = (entityType = "company") => {
  const baseInitial = {
    entityType,
    name: "",
    website: "",
    logo: null,
    logoSelected: false,
    logoFile: null,
    description: "",
    socialLinks: [""], // Frontend-only default
    contact: { ownerName: "", phone: "", email: "", address: "" },
    locations: [
      {
        country: "",
        city: "",
        address: "",
        region: "",
        zipCode: "",
        geo: null,
      },
    ], // Frontend-only default
    openingHours: ["", "", "", "", "", "", ""], // Frontend-only default
    services: [], // Frontend-only default
    extraServices: [], // Frontend-only default
    foundingYear: "",
    registrationNumber: "",
  };

  if (entityType === "company") {
    return {
      ...baseInitial,
      totalEmployees: "",
      companyType: "",
    };
  } else {
    return {
      ...baseInitial,
      totalEmployees: "",
    };
  }
};
