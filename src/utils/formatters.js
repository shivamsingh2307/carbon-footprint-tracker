/**
 * Formatting utilities for display.
 * @module formatters
 */

/**
 * Format CO₂ emissions with appropriate unit (kg or tons).
 * @param {number} kg - Emissions in kg CO₂e
 * @param {number} [decimals=1] - Decimal places
 * @returns {string} Formatted string like "2.5 kg" or "1.2 t"
 */
export function formatCO2(kg, decimals = 1) {
  if (typeof kg !== 'number' || !Number.isFinite(kg)) {
    return '0 kg';
  }
  const abs = Math.abs(kg);
  const sign = kg < 0 ? '-' : '';
  if (abs >= 1000) {
    return `${sign}${(abs / 1000).toFixed(decimals)} t`;
  }
  if (abs >= 1) {
    return `${sign}${abs.toFixed(decimals)} kg`;
  }
  return `${sign}${(abs * 1000).toFixed(0)} g`;
}

/**
 * Format a number with locale-aware separators.
 * @param {number} value
 * @param {number} [decimals=0]
 * @returns {string}
 */
export function formatNumber(value, decimals = 0) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '0';
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a percentage with a sign indicator.
 * @param {number} value - Percentage value (e.g., -15 for -15%)
 * @returns {string} e.g., "+15%" or "-15%"
 */
export function formatPercentage(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '0%';
  }
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Format a date string for display.
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @param {'short'|'long'|'relative'} [format='short']
 * @returns {string}
 */
export function formatDate(dateStr, format = 'short') {
  if (!dateStr) return '';

  const date = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return dateStr;

  if (format === 'relative') {
    return formatRelativeTime(date);
  }

  const options =
    format === 'long'
      ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      : { month: 'short', day: 'numeric' };

  return date.toLocaleDateString(undefined, options);
}

/**
 * Format a date as relative time (e.g., "2 days ago", "Today").
 * @param {Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}

/**
 * Get today's date as YYYY-MM-DD.
 * @returns {string}
 */
export function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get a date N days ago as YYYY-MM-DD.
 * @param {number} daysAgo
 * @returns {string}
 */
export function getDateDaysAgo(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}
