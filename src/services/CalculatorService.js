/**
 * CalculatorService — Pure functions for emission calculations and analytics.
 * @module CalculatorService
 */

import { getFactorById, EMISSION_FACTORS, CATEGORY_META } from '../data/emissionFactors.js';
import { getActivities } from './StorageService.js';
import { getTodayISO, getDateDaysAgo } from '../utils/formatters.js';
import { BENCHMARKS, EQUIVALENCIES } from '../utils/constants.js';

/**
 * Calculate CO₂e for a given activity and quantity.
 * @param {string} activityId - Emission factor ID
 * @param {number} quantity - Amount in the factor's unit
 * @returns {number} kg CO₂e
 */
export function calculateEmission(activityId, quantity) {
  const factor = getFactorById(activityId);
  if (!factor) return 0;
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty < 0) return 0;
  return Math.round(factor.co2ePerUnit * qty * 1000) / 1000;
}

/**
 * Get total emissions for a specific date.
 * @param {string} date - YYYY-MM-DD
 * @returns {number} Total kg CO₂e
 */
export function getDailyTotal(date) {
  const activities = getActivities();
  return activities
    .filter((a) => a.date === date)
    .reduce((sum, a) => sum + (a.emission || 0), 0);
}

/**
 * Get total emissions for the last N days.
 * @param {number} days
 * @returns {number}
 */
export function getPeriodTotal(days) {
  const activities = getActivities();
  const startDate = getDateDaysAgo(days - 1);
  return activities
    .filter((a) => a.date >= startDate)
    .reduce((sum, a) => sum + (a.emission || 0), 0);
}

/**
 * Get daily average emissions over the last N days.
 * @param {number} days
 * @returns {number} Average kg CO₂e per day
 */
export function getDailyAverage(days) {
  const total = getPeriodTotal(days);
  return total / days;
}

/**
 * Get category breakdown for a period.
 * @param {number} days - Number of days to look back
 * @returns {Array<{category: string, name: string, icon: string, color: string, total: number, percentage: number}>}
 */
export function getCategoryBreakdown(days) {
  const activities = getActivities();
  const startDate = getDateDaysAgo(days - 1);
  const periodActivities = activities.filter((a) => a.date >= startDate);

  const totals = {};
  let grandTotal = 0;

  for (const activity of periodActivities) {
    const emission = activity.emission || 0;
    if (emission <= 0) continue;
    const cat = activity.category || 'unknown';
    totals[cat] = (totals[cat] || 0) + emission;
    grandTotal += emission;
  }

  return CATEGORY_META.map((meta) => ({
    category: meta.id,
    name: meta.name,
    icon: meta.icon,
    color: meta.color,
    total: totals[meta.id] || 0,
    percentage: grandTotal > 0 ? ((totals[meta.id] || 0) / grandTotal) * 100 : 0,
  })).sort((a, b) => b.total - a.total);
}

/**
 * Get daily totals for a range of dates (time-series data for charts).
 * @param {number} days
 * @returns {Array<{date: string, total: number}>}
 */
export function getTrendData(days) {
  const activities = getActivities();
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = getDateDaysAgo(i);
    const dayTotal = activities
      .filter((a) => a.date === date)
      .reduce((sum, a) => sum + (a.emission || 0), 0);
    result.push({ date, total: Math.round(dayTotal * 100) / 100 });
  }

  return result;
}

/**
 * Compare user's emissions against benchmark averages.
 * @param {number} days - Period to average over
 * @returns {Object} Comparison data
 */
export function getComparisonData(days) {
  const userAvg = getDailyAverage(days);
  const globalAvg = BENCHMARKS.GLOBAL_AVERAGE_DAILY;
  const usAvg = BENCHMARKS.US_AVERAGE_DAILY;
  const euAvg = BENCHMARKS.EU_AVERAGE_DAILY;
  const target = BENCHMARKS.TARGET_DAILY;

  return {
    userAvg: Math.round(userAvg * 100) / 100,
    globalAvg,
    usAvg,
    euAvg,
    target,
    vsGlobal: globalAvg > 0 ? ((userAvg - globalAvg) / globalAvg) * 100 : 0,
    vsUS: usAvg > 0 ? ((userAvg - usAvg) / usAvg) * 100 : 0,
    vsEU: euAvg > 0 ? ((userAvg - euAvg) / euAvg) * 100 : 0,
    vsTarget: target > 0 ? ((userAvg - target) / target) * 100 : 0,
  };
}

/**
 * Calculate carbon equivalencies to make numbers tangible.
 * @param {number} kgCO2 - Total kg CO₂e
 * @returns {Object} Equivalency values
 */
export function getEquivalencies(kgCO2) {
  const abs = Math.abs(kgCO2);
  return {
    trees: Math.round(abs * EQUIVALENCIES.TREES_PER_KG * 10) / 10,
    phoneCharges: Math.round(abs * EQUIVALENCIES.PHONE_CHARGES_PER_KG),
    kmDriven: Math.round(abs * EQUIVALENCIES.KM_DRIVEN_PER_KG * 10) / 10,
    lightHours: Math.round(abs * EQUIVALENCIES.LIGHT_HOURS_PER_KG),
    showers: Math.round(abs * EQUIVALENCIES.SHOWERS_PER_KG * 10) / 10,
  };
}

/**
 * Calculate the current logging streak (consecutive days with entries).
 * @returns {number} Streak length in days
 */
export function getCurrentStreak() {
  const activities = getActivities();
  if (activities.length === 0) return 0;

  const uniqueDates = [...new Set(activities.map((a) => a.date))].sort().reverse();
  const today = getTodayISO();
  const yesterday = getDateDaysAgo(1);

  // Streak must include today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(uniqueDates[i - 1] + 'T00:00:00');
    const prev = new Date(uniqueDates[i] + 'T00:00:00');
    const diffDays = (current - prev) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get the user's best (lowest emission) day in the last N days.
 * @param {number} days
 * @returns {{date: string, total: number}|null}
 */
export function getBestDay(days) {
  const trend = getTrendData(days);
  const daysWithData = trend.filter((d) => d.total > 0);
  if (daysWithData.length === 0) return null;
  return daysWithData.reduce((best, day) => (day.total < best.total ? day : best));
}

/**
 * Get total number of activities logged.
 * @returns {number}
 */
export function getTotalActivityCount() {
  return getActivities().length;
}

/**
 * Count zero-emission transport activities.
 * @returns {number}
 */
export function getGreenTransportCount() {
  const activities = getActivities();
  const greenIds = ['bicycle', 'walking'];
  return activities.filter((a) => greenIds.includes(a.activityId)).length;
}

/**
 * Count consecutive days with vegan meals (for achievements).
 * @returns {number}
 */
export function getVeganDayCount() {
  const activities = getActivities();
  const veganDates = new Set(
    activities.filter((a) => a.activityId === 'meal-vegan').map((a) => a.date)
  );
  return veganDates.size;
}
