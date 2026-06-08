/**
 * Application-wide constants.
 * @module constants
 */

/** Application metadata */
export const APP = Object.freeze({
  NAME: 'EcoTrack',
  VERSION: '1.0.0',
  STORAGE_VERSION: 1,
});

/** localStorage keys */
export const STORAGE_KEYS = Object.freeze({
  ACTIVITIES: 'ecotrack_activities',
  GOALS: 'ecotrack_goals',
  ACHIEVEMENTS: 'ecotrack_achievements',
  SETTINGS: 'ecotrack_settings',
  DATA_VERSION: 'ecotrack_data_version',
});

/** Average carbon footprint benchmarks (kg CO₂e per day) */
export const BENCHMARKS = Object.freeze({
  GLOBAL_AVERAGE_DAILY: 11.0,
  US_AVERAGE_DAILY: 44.4,
  EU_AVERAGE_DAILY: 17.8,
  TARGET_DAILY: 5.5,
  GLOBAL_AVERAGE_YEARLY: 4000,
  US_AVERAGE_YEARLY: 16200,
  EU_AVERAGE_YEARLY: 6500,
});

/** Navigation tabs */
export const NAV_TABS = Object.freeze([
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'log', label: 'Log Activity', icon: 'add' },
  { id: 'insights', label: 'Insights', icon: 'lightbulb' },
  { id: 'goals', label: 'Goals', icon: 'target' },
  { id: 'achievements', label: 'Badges', icon: 'trophy' },
]);

/** Achievement definitions */
export const ACHIEVEMENTS = Object.freeze([
  // Streak achievements
  { id: 'streak-3', name: 'Getting Started', description: 'Log activities for 3 consecutive days', icon: '🔥', category: 'streak', threshold: 3 },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day logging streak', icon: '📅', category: 'streak', threshold: 7 },
  { id: 'streak-30', name: 'Monthly Master', description: '30-day logging streak', icon: '🏆', category: 'streak', threshold: 30 },

  // Reduction achievements
  { id: 'reduce-10', name: 'Carbon Cutter', description: 'Reduce daily average by 10%', icon: '✂️', category: 'reduction', threshold: 10 },
  { id: 'reduce-25', name: 'Green Champion', description: 'Reduce daily average by 25%', icon: '🌿', category: 'reduction', threshold: 25 },
  { id: 'reduce-50', name: 'Eco Hero', description: 'Reduce daily average by 50%', icon: '🦸', category: 'reduction', threshold: 50 },

  // Activity count achievements
  { id: 'log-10', name: 'First Steps', description: 'Log 10 activities', icon: '👣', category: 'exploration', threshold: 10 },
  { id: 'log-50', name: 'Eco Tracker', description: 'Log 50 activities', icon: '📊', category: 'exploration', threshold: 50 },
  { id: 'log-100', name: 'Data Driven', description: 'Log 100 activities', icon: '🔬', category: 'exploration', threshold: 100 },

  // Impact achievements
  { id: 'zero-day', name: 'Zero Hero', description: 'Log a day with zero emissions', icon: '🌍', category: 'impact', threshold: 1 },
  { id: 'green-commute', name: 'Green Commuter', description: 'Use zero-emission transport 5 times', icon: '🚲', category: 'impact', threshold: 5 },
  { id: 'vegan-week', name: 'Plant Powered', description: 'Log vegan meals for 7 days', icon: '🥬', category: 'impact', threshold: 7 },
]);

/** Carbon equivalencies for making emissions tangible */
export const EQUIVALENCIES = Object.freeze({
  TREES_PER_KG: 1 / 22,           // One tree absorbs ~22 kg CO₂/year
  PHONE_CHARGES_PER_KG: 1 / 0.008, // One phone charge ≈ 0.008 kg CO₂e
  KM_DRIVEN_PER_KG: 1 / 0.21,     // Average car: 0.21 kg CO₂e/km
  LIGHT_HOURS_PER_KG: 1 / 0.01,   // LED bulb: ~0.01 kg CO₂e/hour
  SHOWERS_PER_KG: 1 / 2.0,        // 10-min shower ≈ 2 kg CO₂e
});

/** Maximum values for input validation */
export const LIMITS = Object.freeze({
  MAX_QUANTITY: 10000,
  MIN_QUANTITY: 0,
  MAX_NOTE_LENGTH: 500,
  MAX_STORAGE_ENTRIES: 10000,
  STORAGE_WARNING_BYTES: 4_000_000, // 4MB warning
});
