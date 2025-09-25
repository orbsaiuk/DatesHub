import { z } from "zod";

// Event request form validation schema
export const eventRequestSchema = z.object({
  fullName: z
    .string()
    .min(2, "يجب أن يكون الاسم الكامل حرفين على الأقل")
    .max(100, "لا يمكن أن يتجاوز الاسم الكامل 100 حرف")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "الاسم الكامل يمكن أن يحتوي على أحرف ومسافات وشرطات وفواصل عليا فقط"
    )
    .refine((value) => {
      // Additional check to prevent contact info in name field
      const contactPatterns = [
        /@/, // Email symbol
        /\d{3,}/, // 3 or more consecutive digits
      ];
      return !contactPatterns.some((pattern) => pattern.test(value));
    }, "يرجى إدخال اسمك فقط بدون معلومات الاتصال"),

  eventDate: z
    .string()
    .min(1, "تاريخ الحدث مطلوب")
    .refine((dateString) => {
      const eventDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, "لا يمكن أن يكون تاريخ الحدث في الماضي"),

  eventTime: z
    .string()
    .min(1, "وقت الحدث مطلوب")
    .regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "يرجى إدخال تنسيق وقت صحيح (ساعة:دقيقة)"
    ),

  numberOfGuests: z
    .string()
    .min(1, "عدد الضيوف مطلوب")
    .refine((val) => {
      // Reject incomplete ranges like "20-" or "-20"
      if (val.includes("-")) {
        if (val.startsWith("-") || val.endsWith("-")) {
          return false;
        }
      }

      // Check if it's a range format (e.g., "10-20", "50-100") or exact number (e.g., "25", "100")
      const rangePattern = /^(\d+)-(\d+)$/;
      const exactPattern = /^(\d+)$/;

      if (rangePattern.test(val)) {
        const [, min, max] = val.match(rangePattern);
        const minNum = parseInt(min);
        const maxNum = parseInt(max);
        return minNum >= 1 && maxNum <= 10000 && minNum <= maxNum;
      } else if (exactPattern.test(val)) {
        const num = parseInt(val);
        return num >= 1 && num <= 10000;
      }

      return false;
    }, "يرجى إدخال رقم دقيق (مثل 25) أو نطاق كامل (مثل 10-20)"),

  category: z.string().min(1, "يرجى اختيار فئة الخدمة"),

  serviceRequired: z
    .string()
    .min(2, "يجب أن تكون الخدمة المطلوبة حرفين على الأقل")
    .max(200, "لا يمكن أن تتجاوز الخدمة المطلوبة 200 حرف")
    .refine((value) => {
      // Check for email patterns
      const emailPattern =
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      return !emailPattern.test(value);
    }, "يرجى عدم تضمين عناوين البريد الإلكتروني في وصف الخدمة")
    .refine((value) => {
      // Check for phone number patterns
      const phonePatterns = [
        /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
        /\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/,
        /\b\+\d{1,3}[-.\s]?\d{1,14}\b/,
        /\b\d{10,11}\b/,
      ];
      return !phonePatterns.some((pattern) => pattern.test(value));
    }, "يرجى عدم تضمين أرقام الهاتف في وصف الخدمة"),

  eventLocation: z
    .string()
    .min(5, "يجب أن يكون موقع الحدث 5 أحرف على الأقل")
    .max(300, "لا يمكن أن يتجاوز موقع الحدث 300 حرف"),

  eventDescription: z
    .string()
    .min(10, "يجب أن يكون وصف الحدث 10 أحرف على الأقل")
    .max(1000, "لا يمكن أن يتجاوز وصف الحدث 1000 حرف")
    .refine((value) => {
      // Check for email patterns
      const emailPattern =
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      return !emailPattern.test(value);
    }, "يرجى عدم تضمين عناوين البريد الإلكتروني في الوصف")
    .refine((value) => {
      // Check for phone number patterns (various formats)
      const phonePatterns = [
        /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // 123-456-7890, 123.456.7890, 1234567890
        /\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/, // (123) 456-7890
        /\b\+\d{1,3}[-.\s]?\d{1,14}\b/, // +1-234-567-8900, +44 20 7946 0958
        /\b0\d{2,4}[-.\s]?\d{3,8}\b/, // 020 7946 0958
        /\b\d{11}\b/, // 12345678901 (11 digits)
        /\b\d{10}\b/, // 1234567890 (10 digits)
      ];
      return !phonePatterns.some((pattern) => pattern.test(value));
    }, "يرجى عدم تضمين أرقام الهاتف في الوصف")
    .refine((value) => {
      // Check for other contact patterns
      const contactPatterns = [
        /\b(call|text|phone|contact|email|reach)\s+(me|us)\s+(at|on)\b/i,
        /\b(my|our)\s+(number|phone|email|contact)\s+(is|:)\b/i,
        /\b(tel|phone|mobile|cell)[:.]?\s*\d/i,
        /\b(email|mail)[:.]?\s*\w+@/i,
      ];
      return !contactPatterns.some((pattern) => pattern.test(value));
    }, "يرجى عدم تضمين معلومات الاتصال في الوصف"),
});

// Default initial values for the form
export const defaultEventRequestValues = {
  fullName: "",
  eventDate: "",
  eventTime: "",
  numberOfGuests: "",
  category: "",
  serviceRequired: "",
  eventLocation: "",
  eventDescription: "",
};
