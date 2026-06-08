/**
 * Input sanitization utilities to prevent XSS and injection attacks.
 * Uses an allowlisting approach — only safe characters pass through.
 * @module sanitize
 */

/** Map of characters to their HTML entity equivalents. */
const HTML_ESCAPE_MAP = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
});

const HTML_ESCAPE_REGEX = /[&<>"'/`]/g;

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} input - Raw user input
 * @returns {string} Escaped safe string
 */
export function escapeHTML(input) {
  if (typeof input !== 'string') {
    return '';
  }
  return input.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPE_MAP[char]);
}

/**
 * Sanitize a string input: trim, limit length, escape HTML.
 * @param {string} input - Raw user input
 * @param {number} [maxLength=500] - Maximum allowed length
 * @returns {string} Sanitized string
 */
export function sanitizeString(input, maxLength = 500) {
  if (typeof input !== 'string') {
    return '';
  }
  const trimmed = input.trim().slice(0, maxLength);
  return escapeHTML(trimmed);
}

/**
 * Sanitize a numeric input.
 * @param {*} input - Raw input
 * @param {number} [min=0] - Minimum value
 * @param {number} [max=Infinity] - Maximum value
 * @returns {number} Sanitized number, or 0 if invalid
 */
export function sanitizeNumber(input, min = 0, max = Infinity) {
  const num = Number(input);
  if (!Number.isFinite(num)) {
    return 0;
  }
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitize a date string to ensure it's a valid ISO date.
 * @param {string} input - Date string
 * @returns {string} Valid ISO date string (YYYY-MM-DD), or today's date
 */
export function sanitizeDate(input) {
  if (typeof input !== 'string') {
    return new Date().toISOString().split('T')[0];
  }

  // Only allow YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(input.trim())) {
    return new Date().toISOString().split('T')[0];
  }

  const parsed = new Date(input.trim() + 'T00:00:00');
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().split('T')[0];
  }

  return input.trim();
}

/**
 * Sanitize a value intended for use as an HTML attribute ID.
 * Only allows alphanumeric characters, hyphens, and underscores.
 * @param {string} input
 * @returns {string}
 */
export function sanitizeId(input) {
  if (typeof input !== 'string') {
    return '';
  }
  return input.replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Create safe text content for DOM insertion.
 * Uses textContent instead of innerHTML as an additional safety layer.
 * @param {HTMLElement} element - Target element
 * @param {string} text - Text to insert
 */
export function safeSetText(element, text) {
  if (element && typeof text === 'string') {
    element.textContent = text;
  }
}
