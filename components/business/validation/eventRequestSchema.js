import { z } from "zod";

// Event request form validation schema
export const eventRequestSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Full name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .refine((value) => {
      // Additional check to prevent contact info in name field
      const contactPatterns = [
        /@/, // Email symbol
        /\d{3,}/, // 3 or more consecutive digits
      ];
      return !contactPatterns.some((pattern) => pattern.test(value));
    }, "Please enter only your name without contact information"),

  eventDate: z
    .string()
    .min(1, "Event date is required")
    .refine((dateString) => {
      const eventDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, "Event date cannot be in the past"),

  eventTime: z
    .string()
    .min(1, "Event time is required")
    .regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Please enter a valid time format (HH:MM)"
    ),

  numberOfGuests: z
    .string()
    .min(1, "Number of guests is required")
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
    }, "Please enter exact number (e.g., 25) or complete range (e.g., 10-20)"),

  category: z.string().min(1, "Please select a service category"),

  serviceRequired: z
    .string()
    .min(2, "Service required must be at least 2 characters")
    .max(200, "Service required cannot exceed 200 characters")
    .refine((value) => {
      // Check for email patterns
      const emailPattern =
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      return !emailPattern.test(value);
    }, "Please do not include email addresses in service description")
    .refine((value) => {
      // Check for phone number patterns
      const phonePatterns = [
        /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
        /\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/,
        /\b\+\d{1,3}[-.\s]?\d{1,14}\b/,
        /\b\d{10,11}\b/,
      ];
      return !phonePatterns.some((pattern) => pattern.test(value));
    }, "Please do not include phone numbers in service description"),

  eventLocation: z
    .string()
    .min(5, "Event location must be at least 5 characters")
    .max(300, "Event location cannot exceed 300 characters"),

  eventDescription: z
    .string()
    .min(10, "Event description must be at least 10 characters")
    .max(1000, "Event description cannot exceed 1,000 characters")
    .refine((value) => {
      // Check for email patterns
      const emailPattern =
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      return !emailPattern.test(value);
    }, "Please do not include email addresses in the description")
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
    }, "Please do not include phone numbers in the description")
    .refine((value) => {
      // Check for other contact patterns
      const contactPatterns = [
        /\b(call|text|phone|contact|email|reach)\s+(me|us)\s+(at|on)\b/i,
        /\b(my|our)\s+(number|phone|email|contact)\s+(is|:)\b/i,
        /\b(tel|phone|mobile|cell)[:.]?\s*\d/i,
        /\b(email|mail)[:.]?\s*\w+@/i,
      ];
      return !contactPatterns.some((pattern) => pattern.test(value));
    }, "Please do not include contact information in the description"),
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
