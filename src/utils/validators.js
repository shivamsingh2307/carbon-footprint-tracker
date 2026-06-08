/**
 * Input validation utilities.
 * All validators return a structured result: { valid: boolean, errors: string[] }.
 * @module validators
 */

import { CATEGORIES } from '../data/emissionFactors.js';
import { LIMITS } from './constants.js';

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the input is valid
 * @property {string[]} errors - List of validation error messages
 */

/**
 * Validate an activity log entry.
 * @param {Object} data - Activity data to validate
 * @returns {ValidationResult}
 */
export function validateActivity(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Activity data must be an object.'] };
  }

  // Activity ID
  if (!data.activityId || typeof data.activityId !== 'string') {
    errors.push('Activity type is required.');
  }

  // Quantity
  if (data.quantity === undefined || data.quantity === null || data.quantity === '') {
    errors.push('Quantity is required.');
  } else {
    const qty = Number(data.quantity);
    if (!Number.isFinite(qty)) {
      errors.push('Quantity must be a valid number.');
    } else if (qty < LIMITS.MIN_QUANTITY) {
      errors.push(`Quantity cannot be negative.`);
    } else if (qty > LIMITS.MAX_QUANTITY) {
      errors.push(`Quantity cannot exceed ${LIMITS.MAX_QUANTITY}.`);
    }
  }

  // Date
  if (!data.date || typeof data.date !== 'string') {
    errors.push('Date is required.');
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      errors.push('Date must be in YYYY-MM-DD format.');
    } else {
      const parsed = new Date(data.date + 'T00:00:00');
      if (Number.isNaN(parsed.getTime())) {
        errors.push('Date is not a valid date.');
      }
      // Don't allow future dates beyond today
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (parsed > today) {
        errors.push('Date cannot be in the future.');
      }
    }
  }

  // Notes (optional)
  if (data.notes !== undefined && data.notes !== '') {
    if (typeof data.notes !== 'string') {
      errors.push('Notes must be a string.');
    } else if (data.notes.length > LIMITS.MAX_NOTE_LENGTH) {
      errors.push(`Notes cannot exceed ${LIMITS.MAX_NOTE_LENGTH} characters.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a goal entry.
 * @param {Object} data - Goal data to validate
 * @returns {ValidationResult}
 */
export function validateGoal(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Goal data must be an object.'] };
  }

  // Target reduction percentage
  if (data.targetPercent === undefined) {
    errors.push('Target reduction percentage is required.');
  } else {
    const pct = Number(data.targetPercent);
    if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
      errors.push('Target must be between 1% and 100%.');
    }
  }

  // Deadline
  if (!data.deadline || typeof data.deadline !== 'string') {
    errors.push('Deadline is required.');
  } else {
    const parsed = new Date(data.deadline + 'T00:00:00');
    if (Number.isNaN(parsed.getTime())) {
      errors.push('Deadline is not a valid date.');
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsed <= today) {
        errors.push('Deadline must be in the future.');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check if a value is a valid positive number.
 * @param {*} value
 * @returns {boolean}
 */
export function isPositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

/**
 * Check if a string is a valid ISO date (YYYY-MM-DD).
 * @param {string} value
 * @returns {boolean}
 */
export function isValidDate(value) {
  if (typeof value !== 'string') return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) return false;
  const d = new Date(value + 'T00:00:00');
  return !Number.isNaN(d.getTime());
}

/**
 * Validate that a category string is one of the known categories.
 * @param {string} category
 * @returns {boolean}
 */
export function isValidCategory(category) {
  return Object.values(CATEGORIES).includes(category);
}
