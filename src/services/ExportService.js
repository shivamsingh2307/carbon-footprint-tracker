/**
 * ExportService — Export user data as CSV or JSON.
 * Uses Blob-based download (no server required).
 * @module ExportService
 */

import { getActivities } from './StorageService.js';
import { getFactorById } from '../data/emissionFactors.js';
import { escapeHTML } from '../utils/sanitize.js';

/**
 * Export activities as CSV.
 * @param {boolean} [anonymize=false] - Remove notes if true
 */
export function exportAsCSV(anonymize = false) {
  const activities = getActivities();
  if (activities.length === 0) {
    throw new Error('No activities to export.');
  }

  const headers = ['Date', 'Category', 'Activity', 'Quantity', 'Unit', 'CO2e (kg)'];
  if (!anonymize) headers.push('Notes');

  const rows = activities.map((a) => {
    const factor = getFactorById(a.activityId);
    const row = [
      a.date,
      a.category || '',
      factor ? factor.name : a.activityId,
      a.quantity || 0,
      factor ? factor.unit : '',
      (a.emission || 0).toFixed(3),
    ];
    if (!anonymize) row.push(csvEscape(a.notes || ''));
    return row.join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  downloadBlob(csv, 'ecotrack-activities.csv', 'text/csv;charset=utf-8;');
}

/**
 * Export activities as JSON.
 * @param {boolean} [anonymize=false]
 */
export function exportAsJSON(anonymize = false) {
  let activities = getActivities();
  if (activities.length === 0) {
    throw new Error('No activities to export.');
  }

  if (anonymize) {
    activities = activities.map(({ notes, ...rest }) => rest);
  }

  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    totalActivities: activities.length,
    activities,
  };

  const json = JSON.stringify(data, null, 2);
  downloadBlob(json, 'ecotrack-activities.json', 'application/json');
}

/**
 * Escape a value for CSV (handle commas, quotes, newlines).
 * @param {string} value
 * @returns {string}
 */
function csvEscape(value) {
  if (typeof value !== 'string') return '';
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Create a Blob and trigger download.
 * @param {string} content
 * @param {string} filename
 * @param {string} mimeType
 */
function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
