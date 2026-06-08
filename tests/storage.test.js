import { describe, test, expect, beforeEach } from 'vitest';
import { getActivities, addActivity, deleteActivity, getGoals, saveGoal, deleteGoal, getUnlockedAchievements, unlockAchievement } from '../src/services/StorageService.js';
import { STORAGE_KEYS } from '../src/utils/constants.js';

describe('Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('addActivity and getActivities should perform CRUD operations', () => {
    const act = {
      activityId: 'car-petrol',
      quantity: 10,
      date: '2026-06-08',
      emission: 2.1,
      category: 'transport',
    };

    const saved = addActivity(act);
    expect(saved.id).toBeDefined();
    expect(saved.timestamp).toBeDefined();

    const all = getActivities();
    expect(all).toHaveLength(1);
    expect(all[0].activityId).toBe('car-petrol');

    const deleted = deleteActivity(saved.id);
    expect(deleted).toBe(true);
    expect(getActivities()).toHaveLength(0);
  });

  test('saveGoal and getGoals should perform goal storage operations', () => {
    const goal = {
      targetPercent: 20,
      deadline: '2026-07-09',
    };

    const saved = saveGoal(goal);
    expect(saved.id).toBeDefined();
    expect(saved.createdAt).toBeDefined();

    expect(getGoals()).toHaveLength(1);

    const deleted = deleteGoal(saved.id);
    expect(deleted).toBe(true);
    expect(getGoals()).toHaveLength(0);
  });

  test('unlockAchievement should store unlocked achievement unique IDs', () => {
    expect(getUnlockedAchievements()).toHaveLength(0);

    const firstUnlock = unlockAchievement('streak-3');
    expect(firstUnlock).toBe(true);
    expect(getUnlockedAchievements()).toContain('streak-3');

    // Duplicate unlock should return false
    const secondUnlock = unlockAchievement('streak-3');
    expect(secondUnlock).toBe(false);
    expect(getUnlockedAchievements()).toHaveLength(1);
  });
});
