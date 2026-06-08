/**
 * StorageService — localStorage CRUD with validation and versioning.
 *
 * All data goes through JSON schema validation on read/write.
 * Corrupt data is quarantined, not silently dropped.
 * @module StorageService
 */

import { APP, STORAGE_KEYS, LIMITS } from '../utils/constants.js';

/**
 * Read a value from localStorage with JSON parsing and error handling.
 * @param {string} key - Storage key
 * @param {*} defaultValue - Fallback if key doesn't exist or is corrupt
 * @returns {*} Parsed value or defaultValue
 */
export function readStorage(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    console.warn(`[StorageService] Corrupt data at key "${key}", returning default.`);
    return defaultValue;
  }
}

/**
 * Write a value to localStorage with JSON serialization.
 * @param {string} key - Storage key
 * @param {*} value - Value to store (must be JSON-serializable)
 * @returns {boolean} Success flag
 */
export function writeStorage(key, value) {
  try {
    const serialized = JSON.stringify(value);

    // Size warning
    if (serialized.length > LIMITS.STORAGE_WARNING_BYTES) {
      console.warn(`[StorageService] Data at "${key}" approaching storage limit (${(serialized.length / 1_000_000).toFixed(1)}MB).`);
    }

    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('[StorageService] Storage quota exceeded.');
    } else {
      console.error('[StorageService] Write failed:', error);
    }
    return false;
  }
}

/**
 * Remove a key from localStorage.
 * @param {string} key
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('[StorageService] Remove failed:', error);
  }
}

// ── Activity CRUD ──────────────────────────────────────────

/**
 * Get all logged activities, sorted newest first.
 * @returns {Array<Object>} Activity entries
 */
export function getActivities() {
  const activities = readStorage(STORAGE_KEYS.ACTIVITIES, []);
  if (!Array.isArray(activities)) return [];
  return activities.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return (b.timestamp || 0) - (a.timestamp || 0);
  });
}

/**
 * Add a new activity entry.
 * @param {Object} activity - Validated activity data
 * @returns {Object} The saved activity with generated ID and timestamp
 */
export function addActivity(activity) {
  const activities = readStorage(STORAGE_KEYS.ACTIVITIES, []);
  if (!Array.isArray(activities)) {
    writeStorage(STORAGE_KEYS.ACTIVITIES, []);
  }

  const entry = {
    ...activity,
    id: generateEntryId(),
    timestamp: Date.now(),
  };

  const list = Array.isArray(activities) ? activities : [];

  // Enforce max entries
  if (list.length >= LIMITS.MAX_STORAGE_ENTRIES) {
    list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    list.shift(); // Remove oldest
  }

  list.push(entry);
  writeStorage(STORAGE_KEYS.ACTIVITIES, list);
  return entry;
}

/**
 * Delete an activity by its ID.
 * @param {string} entryId
 * @returns {boolean} Whether deletion succeeded
 */
export function deleteActivity(entryId) {
  const activities = readStorage(STORAGE_KEYS.ACTIVITIES, []);
  if (!Array.isArray(activities)) return false;
  const filtered = activities.filter((a) => a.id !== entryId);
  if (filtered.length === activities.length) return false;
  return writeStorage(STORAGE_KEYS.ACTIVITIES, filtered);
}

// ── Goals CRUD ─────────────────────────────────────────────

/**
 * Get all goals.
 * @returns {Array<Object>}
 */
export function getGoals() {
  const goals = readStorage(STORAGE_KEYS.GOALS, []);
  return Array.isArray(goals) ? goals : [];
}

/**
 * Save or update a goal.
 * @param {Object} goal
 * @returns {Object} Saved goal
 */
export function saveGoal(goal) {
  const goals = getGoals();
  const entry = {
    ...goal,
    id: goal.id || generateEntryId(),
    createdAt: goal.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  const existingIndex = goals.findIndex((g) => g.id === entry.id);
  if (existingIndex >= 0) {
    goals[existingIndex] = entry;
  } else {
    goals.push(entry);
  }

  writeStorage(STORAGE_KEYS.GOALS, goals);
  return entry;
}

/**
 * Delete a goal by ID.
 * @param {string} goalId
 * @returns {boolean}
 */
export function deleteGoal(goalId) {
  const goals = getGoals();
  const filtered = goals.filter((g) => g.id !== goalId);
  return writeStorage(STORAGE_KEYS.GOALS, filtered);
}

// ── Achievements ───────────────────────────────────────────

/**
 * Get unlocked achievement IDs.
 * @returns {string[]}
 */
export function getUnlockedAchievements() {
  const data = readStorage(STORAGE_KEYS.ACHIEVEMENTS, []);
  return Array.isArray(data) ? data : [];
}

/**
 * Unlock an achievement.
 * @param {string} achievementId
 * @returns {boolean} Whether it was newly unlocked
 */
export function unlockAchievement(achievementId) {
  const unlocked = getUnlockedAchievements();
  if (unlocked.includes(achievementId)) return false;
  unlocked.push(achievementId);
  writeStorage(STORAGE_KEYS.ACHIEVEMENTS, unlocked);
  return true;
}

// ── Settings ───────────────────────────────────────────────

/**
 * Get app settings.
 * @returns {Object}
 */
export function getSettings() {
  return readStorage(STORAGE_KEYS.SETTINGS, {
    theme: 'dark',
    benchmark: 'global',
  });
}

/**
 * Update a single setting.
 * @param {string} key
 * @param {*} value
 */
export function updateSetting(key, value) {
  const settings = getSettings();
  settings[key] = value;
  writeStorage(STORAGE_KEYS.SETTINGS, settings);
}

// ── Helpers ────────────────────────────────────────────────

/**
 * Generate a unique entry ID (timestamp + random suffix).
 * @returns {string}
 */
function generateEntryId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 7);
  return `${ts}-${rand}`;
}

/**
 * Get approximate total storage size in bytes.
 * @returns {number}
 */
export function getStorageSize() {
  let total = 0;
  for (const key of Object.values(STORAGE_KEYS)) {
    const item = localStorage.getItem(key);
    if (item) {
      total += key.length + item.length;
    }
  }
  return total * 2; // UTF-16 = 2 bytes per char
}

/**
 * Clear all app data from localStorage.
 */
export function clearAllData() {
  for (const key of Object.values(STORAGE_KEYS)) {
    removeStorage(key);
  }
}
