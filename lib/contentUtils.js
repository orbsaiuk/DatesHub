/**
 * Utility functions for handling blog content conversion between HTML and plain text
 */

/**
 * Convert HTML content to plain text for preview purposes
 * @param {string} html - HTML content from Quill editor
 * @returns {string} Plain text version
 */
export function htmlToPlainText(html) {
  if (!html || typeof html !== 'string') return '';
  
  // Remove HTML tags and decode entities
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Decode ampersands
    .replace(/&lt;/g, '<') // Decode less than
    .replace(/&gt;/g, '>') // Decode greater than
    .replace(/&quot;/g, '"') // Decode quotes
    .replace(/&#39;/g, "'") // Decode apostrophes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Sanitize HTML content for safe display
 * @param {string} html - Raw HTML content
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';
  
  // Basic sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Extract a preview excerpt from HTML content
 * @param {string} html - HTML content
 * @param {number} maxLength - Maximum length of excerpt
 * @returns {string} Preview excerpt
 */
export function extractExcerpt(html, maxLength = 200) {
  const plainText = htmlToPlainText(html);
  if (plainText.length <= maxLength) return plainText;
  
  // Find the last complete word within the limit
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Format HTML content for display with proper styling
 * @param {string} html - HTML content from Quill
 * @returns {string} Formatted HTML with CSS classes
 */
export function formatContentForDisplay(html) {
  if (!html || typeof html !== 'string') return '';
  
  return sanitizeHtml(html)
    // Add styling classes to elements
    .replace(/<h1>/g, '<h1 class="text-3xl font-bold mb-4 text-gray-900">')
    .replace(/<h2>/g, '<h2 class="text-2xl font-semibold mb-3 text-gray-900">')
    .replace(/<h3>/g, '<h3 class="text-xl font-medium mb-2 text-gray-900">')
    .replace(/<p>/g, '<p class="mb-4 text-gray-800 leading-relaxed">')
    .replace(/<ul>/g, '<ul class="list-disc list-inside mb-4 space-y-2 text-gray-800">')
    .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-4 space-y-2 text-gray-800">')
    .replace(/<li>/g, '<li class="leading-relaxed">')
    .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 mb-4 italic text-gray-700 bg-blue-50">')
    .replace(/<strong>/g, '<strong class="font-semibold">')
    .replace(/<em>/g, '<em class="italic">')
    .replace(/<a /g, '<a class="text-blue-600 hover:text-blue-800 underline" ')
    .replace(/<img /g, '<img class="max-w-full h-auto rounded-lg shadow-md my-4" ');
}

/**
 * Estimate reading time based on content
 * @param {string} html - HTML content
 * @param {number} wordsPerMinute - Average reading speed (default: 200)
 * @returns {number} Estimated reading time in minutes
 */
export function estimateReadingTime(html, wordsPerMinute = 200) {
  const plainText = htmlToPlainText(html);
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
