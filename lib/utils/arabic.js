/**
 * Utility functions for Arabic localization
 */

/**
 * Convert English numbers to Arabic-Indic numerals
 * @param {string|number} input - The input to convert
 * @returns {string} - The converted string with Arabic numerals
 */
export function toArabicNumerals(input) {
    if (input === null || input === undefined) return '';

    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let result = String(input);

    for (let i = 0; i < englishNumerals.length; i++) {
        result = result.replace(new RegExp(englishNumerals[i], 'g'), arabicNumerals[i]);
    }

    return result;
}

/**
 * Format numbers with Arabic numerals and thousand separators
 * @param {number} num - The number to format
 * @returns {string} - Formatted number with Arabic numerals
 */
export function formatArabicNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '٠';

    // Format with thousand separators using Arabic locale
    const formatted = new Intl.NumberFormat('ar-EG').format(num);
    return toArabicNumerals(formatted);
}

/**
 * Format date in Arabic
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date in Arabic
 */
export function formatArabicDate(date, options = {}) {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';

    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    };

    const formatted = new Intl.DateTimeFormat('ar-EG', defaultOptions).format(dateObj);
    return toArabicNumerals(formatted);
}

/**
 * Format month and year for charts/reports
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted month/year in Arabic
 */
export function formatArabicMonthYear(date) {
    return formatArabicDate(date, {
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Format decimal numbers (like ratings) in Arabic
 * @param {number} num - The decimal number
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted decimal in Arabic
 */
export function formatArabicDecimal(num, decimals = 1) {
    if (num === null || num === undefined || isNaN(num)) return '٠.٠';

    const formatted = Number(num).toFixed(decimals);
    return toArabicNumerals(formatted);
}