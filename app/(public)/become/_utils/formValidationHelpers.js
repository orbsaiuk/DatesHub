/**
 * Get fields to validate for each step
 */
export function getStepFields(stepNum, entityType) {
  const baseFields = {
    0: ["entityType"],
    1: [
      "name",
      "logo",
      "logoSelected",
      "description",
      entityType === "company" ? "totalEmployees" : null,
      "foundingYear",
      "registrationNumber",
    ],
    2: [
      "contact.ownerName",
      "contact.phone",
      "contact.email",
      "contact.address",
    ],
    3: ["locations"],
    4: ["services", "openingHours"],
  };
  return baseFields[stepNum] || [];
}

/**
 * Collect all errors from the form errors object
 */
export function collectErrors(node, base = []) {
  const results = [];
  if (!node) return results;
  if (
    typeof node === "object" &&
    node.message &&
    typeof node.message === "string"
  ) {
    results.push({ path: base.join("."), message: node.message });
    return results;
  }
  if (Array.isArray(node)) {
    node.forEach((child, idx) => {
      results.push(...collectErrors(child, [...base, String(idx)]));
    });
    return results;
  }
  if (typeof node === "object") {
    Object.entries(node).forEach(([key, value]) => {
      results.push(...collectErrors(value, [...base, key]));
    });
  }
  return results;
}

/**
 * Priority order for error fields
 */
const ERROR_PRIORITY = [
  "entityType",
  "name",
  "logo",
  "website",
  "description",
  "totalEmployees",
  "foundingYear",
  "registrationNumber",
  "businessLicense",
  "productCategories",
  "contact.ownerName",
  "contact.phone",
  "contact.email",
  "contact.address",
  "locations",
  "locations.0.country",
  "locations.0.city",
  "locations.0.address",
  "locations.0.zipCode",
  "locations.0.region",
  "services",
];

/**
 * Pick the first error from the list based on priority
 */
export function pickFirstError(flatErrors) {
  for (const want of ERROR_PRIORITY) {
    const found = flatErrors.find(
      (e) => e.path === want || e.path.startsWith(want)
    );
    if (found) return found;
  }
  return flatErrors[0] || null;
}

/**
 * Get the step number for a given field path
 */
export function stepForPath(path) {
  if (!path) return 0;
  if (path === "entityType") return 0;
  if (path.startsWith("contact")) return 2;
  if (path.startsWith("locations")) return 3;
  if (path.startsWith("services")) return 4;
  return 1; // base info
}

/**
 * Get the focus path for a given field path
 */
export function focusPathFor(path) {
  if (!path) return "name";
  if (path === "locations") return "locations.0.address";
  return path;
}

/**
 * Get Arabic label for a given field path
 */
export function labelFor(path, entityType) {
  const map = {
    entityType: "نوع الكيان",
    name: entityType === "company" ? "اسم الشركة" : "اسم العمل التجاري",
    logo: "الشعار",
    website: "الموقع الإلكتروني",
    description: "الوصف",
    totalEmployees: "إجمالي الموظفين",
    foundingYear: "سنة التأسيس",
    registrationNumber: "رقم السجل التجاري",
    businessLicense: "الرخصة التجارية",
    productCategories: "فئات المنتجات",
    "contact.ownerName": "اسم المالك",
    "contact.phone": "الهاتف",
    "contact.email": "البريد الإلكتروني",
    "contact.address": "عنوان التواصل",
    locations: "المواقع",
    "locations.0.address": "العنوان (الموقع الأول)",
    "locations.0.country": "البلد (الموقع الأول)",
    "locations.0.city": "المدينة (الموقع الأول)",
    "locations.0.region": "المنطقة (الموقع الأول)",
    "locations.0.zipCode": "الرمز البريدي (الموقع الأول)",
    services: "الخدمات",
  };
  return map[path] || path;
}
