/**
 * Utility functions for working hours display and formatting
 */

import { toArabicNumerals } from "./arabic";

const DAY_LABELS = [
  "السبت",
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

/**
 * Convert time format to Arabic numerals
 * @param {string} timeString - The time string to convert
 * @returns {string} - Time string with Arabic numerals
 */
export function convertTimeToArabic(timeString) {
  if (!timeString || timeString === "مغلق") return timeString;

  // Convert numbers to Arabic numerals
  return toArabicNumerals(timeString);
}

/**
 * Group consecutive days with same working hours into ranges
 * @param {Array} openingHours - Array of working hours for each day
 * @returns {Array} - Array of grouped working hours with day ranges
 */
export function groupWorkingHours(openingHours) {
  if (!Array.isArray(openingHours) || openingHours.length === 0) return [];

  const groups = [];
  let currentGroup = null;

  for (let i = 0; i < openingHours.length; i++) {
    const hours = openingHours[i];

    if (!currentGroup || currentGroup.hours !== hours) {
      // Start new group
      currentGroup = {
        startDay: i,
        endDay: i,
        hours: hours,
      };
      groups.push(currentGroup);
    } else {
      // Extend current group
      currentGroup.endDay = i;
    }
  }

  return groups.map((group) => ({
    startDay: group.startDay,
    endDay: group.endDay,
    hours: group.hours,
    dayRange:
      group.startDay === group.endDay
        ? DAY_LABELS[group.startDay]
        : `${DAY_LABELS[group.startDay]} - ${DAY_LABELS[group.endDay]}`,
  }));
}

/**
 * Get formatted working hours for display
 * @param {Array} openingHours - Array of working hours for each day
 * @param {number} maxGroups - Maximum number of groups to display (default: 2)
 * @returns {Array} - Array of formatted working hours groups
 */
export function getFormattedWorkingHours(openingHours, maxGroups = 2) {
  const grouped = groupWorkingHours(openingHours);
  return grouped.slice(0, maxGroups).map((group) => ({
    ...group,
    formattedHours: convertTimeToArabic(group.hours),
  }));
}

/**
 * Get day labels for working hours
 * @returns {Array} - Array of Arabic day labels
 */
export function getDayLabels() {
  return DAY_LABELS;
}
