import { z } from "zod";

export const eventRequestSchema = z.object({
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
      // Additional check to prevent contact info in name field
      const contactPatterns = [
        /@/, // Email symbol
        /\d{3,}/, // 3 or more consecutive digits
      ];
      return !contactPatterns.some((pattern) => pattern.test(value));
    }, "الرجاء إدخال الاسم فقط بدون معلومات الاتصال"),

  eventDate: z
    .string()
    .min(1, "تاريخ الفعالية مطلوب")
    .refine((dateString) => {
      if (!dateString) return false;
      const eventDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, "تاريخ الفعالية لا يمكن أن يكون في الماضي"),

  eventTime: z
    .string()
    .min(1, "وقت الفعالية مطلوب")
    .regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "الرجاء إدخال وقت صحيح (ساعة:دقيقة)"
    ),

  numberOfGuests: z
    .string()
    .min(1, "عدد الضيوف مطلوب")
    .refine((val) => {
      if (!val || val.trim() === "") return false;

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
        const minNum = parseInt(min, 10);
        const maxNum = parseInt(max, 10);
        return minNum >= 1 && maxNum <= 10000 && minNum <= maxNum;
      } else if (exactPattern.test(val)) {
        const num = parseInt(val, 10);
        return num >= 1 && num <= 10000;
      }

      return false;
    }, "الرجاء إدخال رقم محدد (مثال: 25) أو نطاق كامل (مثال: 10-20)"),

  category: z.string().min(1, "الرجاء اختيار فئة الخدمة"),

  serviceRequired: z
    .string()
    .min(1, "الخدمات المطلوبة مطلوبة")
    .min(2, "الخدمات المطلوبة يجب أن تكون على الأقل حرفين")
    .max(200, "الخدمات المطلوبة لا يمكن أن تتجاوز 200 حرف")
    .refine((value) => {
      // Check for email patterns
      const emailPattern =
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      return !emailPattern.test(value);
    }, "الرجاء عدم تضمين عناوين البريد الإلكتروني في وصف الخدمة")
    .refine((value) => {
      // Check for phone number patterns
      const phonePatterns = [
        /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
        /\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/,
        /\b\+\d{1,3}[-.\s]?\d{1,14}\b/,
        /\b\d{10,11}\b/,
      ];
      return !phonePatterns.some((pattern) => pattern.test(value));
    }, "الرجاء عدم تضمين أرقام الهاتف في وصف الخدمة"),

  eventLocation: z
    .string()
    .min(1, "موقع الفعالية مطلوب")
    .min(5, "موقع الفعالية يجب أن يكون على بالتفصيل")
    .max(300, "موقع الفعالية لا يمكن أن يتجاوز 300 حرف"),

  eventDescription: z
    .string()
    .min(1, "وصف الفعالية مطلوب")
    .min(10, "وصف الفعالية يجب أن يكون على الأقل 10 أحرف")
    .max(1000, "وصف الفعالية لا يمكن أن يتجاوز 1000 حرف")
    .refine((value) => {
      // Check for email patterns
      const emailPattern =
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      return !emailPattern.test(value);
    }, "الرجاء عدم تضمين عناوين البريد الإلكتروني في الوصف")
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
    }, "الرجاء عدم تضمين أرقام الهاتف في الوصف")
    .refine((value) => {
      // Check for other contact patterns
      const contactPatterns = [
        /\b(call|text|phone|contact|email|reach)\s+(me|us)\s+(at|on)\b/i,
        /\b(my|our)\s+(number|phone|email|contact)\s+(is|:)\b/i,
        /\b(tel|phone|mobile|cell)[:.]?\s*\d/i,
        /\b(email|mail)[:.]?\s*\w+@/i,
        /\b(اتصل|تواصل|رقم|هاتف|جوال|ايميل|بريد)\b/i, // Arabic contact keywords
      ];
      return !contactPatterns.some((pattern) => pattern.test(value));
    }, "الرجاء عدم تضمين معلومات الاتصال في الوصف")
    .refine((value) => {
      // Limit the total count of digits to a maximum of 8
      const digitMatches = value.match(/\d/g);
      const totalDigits = digitMatches ? digitMatches.length : 0;
      return totalDigits <= 8;
    }, "الرجاء عدم تضمين أكثر من 8 أرقام في الوصف"),
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
