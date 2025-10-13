/**
 * Utility functions for Arabic localization
 */

/**
 * Convert English numbers to Arabic-Indic numerals
 * @param {string|number} input - The input to convert
 * @returns {string} - The converted string with Arabic numerals
 */
export function toArabicNumerals(input) {
  if (input === null || input === undefined) return "";

  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const englishNumerals = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  let result = String(input);

  for (let i = 0; i < englishNumerals.length; i++) {
    result = result.replace(
      new RegExp(englishNumerals[i], "g"),
      arabicNumerals[i]
    );
  }

  return result;
}

/**
 * Format numbers with Arabic numerals and thousand separators
 * @param {number} num - The number to format
 * @returns {string} - Formatted number with Arabic numerals
 */
export function formatArabicNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "٠";

  // Format with thousand separators using Arabic locale
  const formatted = new Intl.NumberFormat("ar-EG").format(num);
  return toArabicNumerals(formatted);
}

/**
 * Format date in Arabic
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date in Arabic
 */
export function formatArabicDate(date, options = {}) {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";

  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  const formatted = new Intl.DateTimeFormat("ar-EG", defaultOptions).format(
    dateObj
  );
  return toArabicNumerals(formatted);
}

/**
 * Format month and year for charts/reports
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted month/year in Arabic
 */
export function formatArabicMonthYear(date) {
  return formatArabicDate(date, {
    month: "short",
    year: "numeric",
  });
}

/**
 * Format month and year only (no day) for activity reports
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted month/year in Arabic without day
 */
export function formatArabicMonthYearOnly(date) {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";

  // Format only month and year, explicitly excluding day
  const formatted = new Intl.DateTimeFormat("ar-EG", {
    month: "short",
    year: "numeric",
  }).format(dateObj);

  return toArabicNumerals(formatted);
}

/**
 * Format decimal numbers (like ratings) in Arabic
 * @param {number} num - The decimal number
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted decimal in Arabic
 */
export function formatArabicDecimal(num, decimals = 1) {
  if (num === null || num === undefined || isNaN(num)) return "٠.٠";

  const formatted = Number(num).toFixed(decimals);
  return toArabicNumerals(formatted);
}

/**
 * Arabic translation utilities
 */

/**
 * Translates English day names to Arabic in text
 * @param {string} text - Text containing English day names
 * @returns {string} Text with day names translated to Arabic
 */
export function translateDaysToArabic(text) {
  const dayTranslations = {
    Monday: "الاثنين",
    Tuesday: "الثلاثاء",
    Wednesday: "الأربعاء",
    Thursday: "الخميس",
    Friday: "الجمعة",
    Saturday: "السبت",
    Sunday: "الأحد",
    Mon: "الاثنين",
    Tue: "الثلاثاء",
    Wed: "الأربعاء",
    Thu: "الخميس",
    Fri: "الجمعة",
    Sat: "السبت",
    Sun: "الأحد",
  };

  let translatedText = text;
  Object.entries(dayTranslations).forEach(([english, arabic]) => {
    const regex = new RegExp(`\\b${english}\\b`, "gi");
    translatedText = translatedText.replace(regex, arabic);
  });

  return translatedText;
}

/**
 * Translates English month names to Arabic in text
 * @param {string} text - Text containing English month names
 * @returns {string} Text with month names translated to Arabic
 */
export function translateMonthsToArabic(text) {
  const monthTranslations = {
    January: "يناير",
    February: "فبراير",
    March: "مارس",
    April: "أبريل",
    May: "مايو",
    June: "يونيو",
    July: "يوليو",
    August: "أغسطس",
    September: "سبتمبر",
    October: "أكتوبر",
    November: "نوفمبر",
    December: "ديسمبر",
    Jan: "يناير",
    Feb: "فبراير",
    Mar: "مارس",
    Apr: "أبريل",
    Jun: "يونيو",
    Jul: "يوليو",
    Aug: "أغسطس",
    Sep: "سبتمبر",
    Oct: "أكتوبر",
    Nov: "نوفمبر",
    Dec: "ديسمبر",
  };

  let translatedText = text;
  Object.entries(monthTranslations).forEach(([english, arabic]) => {
    const regex = new RegExp(`\\b${english}\\b`, "gi");
    translatedText = translatedText.replace(regex, arabic);
  });

  return translatedText;
}

/**
 * Translates both days and months to Arabic in text
 * @param {string} text - Text containing English day/month names
 * @returns {string} Text with day and month names translated to Arabic
 */
export function translateDateToArabic(text) {
  return translateMonthsToArabic(translateDaysToArabic(text));
}

/**
 * Currency translation utilities
 */

/**
 * Translates currency codes to Arabic
 * @param {string} currency - Currency code (e.g., 'SAR', 'USD', 'EUR')
 * @returns {string} Arabic currency name
 */
export function translateCurrencyToArabic(currency) {
  const currencyTranslations = {
    SAR: "ر.س",
    AED: "د.إ",
    KWD: "د.ك",
    QAR: "ر.ق",
    BHD: "د.ب",
    OMR: "ر.ع",
    JOD: "د.أ",
    EGP: "ج.م",
    LBP: "ل.ل",
    SYP: "ل.س",
    IQD: "د.ع",
    YER: "ر.ي",
    LYD: "د.ل",
    TND: "د.ت",
    DZD: "د.ج",
    MAD: "د.م",
    SDG: "ج.س",
  };

  return currencyTranslations[currency?.toUpperCase()] || currency;
}

/**
 * Translates weight and quantity units to Arabic
 * @param {string} unit - Unit code (e.g., 'kg', 'g', 'ton', 'piece')
 * @returns {string} Arabic unit name
 */
export function translateUnitToArabic(unit) {
  const unitTranslations = {
    // Weight units
    kg: "كجم",
    g: "جرام",
  };

  return unitTranslations[unit?.toLowerCase()] || unit;
}

/**
 * Format price with Arabic currency
 * @param {number} price - The price to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted price with Arabic currency
 */
export function formatArabicPrice(price, currency = "SAR") {
  if (!price || price === 0) return "السعر عند الطلب";
  const formattedPrice = formatArabicNumber(price);
  const currencyText = translateCurrencyToArabic(currency);
  return `${formattedPrice} ${currencyText}`;
}

/**
 * Format quantity with Arabic unit
 * @param {number} quantity - The quantity to format
 * @param {string} unit - Unit code
 * @returns {string} Formatted quantity with Arabic unit
 */
export function formatArabicQuantity(quantity, unit = "kg") {
  if (!quantity || quantity === 0) return "الكمية عند الطلب";
  const formattedQuantity = formatArabicNumber(quantity);
  const unitText = translateUnitToArabic(unit);
  return `${formattedQuantity} ${unitText}`;
}
