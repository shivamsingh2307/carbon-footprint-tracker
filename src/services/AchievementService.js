/**
 * AchievementService — Validates and unlocks achievements based on user activities.
 * @module AchievementService
 */

import { ACHIEVEMENTS } from '../utils/constants.js';
import {
  getUnlockedAchievements,
  unlockAchievement,
  getActivities,
} from './StorageService.js';
import {
  getCurrentStreak,
  getDailyAverage,
  getPeriodTotal,
  getGreenTransportCount,
  getVeganDayCount,
} from './CalculatorService.js';
import { showToast } from '../components/Toast.js';

/**
 * Check and unlock any newly earned achievements.
 * Shows a toast notification for each new achievement unlocked.
 * @returns {string[]} IDs of achievements unlocked in this run
 */
export function checkAchievements() {
  const unlocked = getUnlockedAchievements();
  const newlyUnlocked = [];

  const activities = getActivities();
  const totalLogs = activities.length;
  const streak = getCurrentStreak();
  const greenCommutes = getGreenTransportCount();
  const veganDays = getVeganDayCount();

  // Calculate daily averages
  const dailyAvg = getDailyAverage(7); // Last 7 days

  // Baseline to compare reduction (let's assume baseline of EU average = 17.8 kg/day)
  const baseline = 17.8;
  const pctReduction = dailyAvg > 0 ? ((baseline - dailyAvg) / baseline) * 100 : 0;

  for (const ach of ACHIEVEMENTS) {
    if (unlocked.includes(ach.id)) continue;

    let qualifies = false;

    switch (ach.category) {
      case 'streak':
        qualifies = streak >= ach.threshold;
        break;

      case 'exploration':
        qualifies = totalLogs >= ach.threshold;
        break;

      case 'reduction':
        qualifies = pctReduction >= ach.threshold;
        break;

      case 'impact':
        if (ach.id === 'zero-day') {
          // Check if any date has entries and the total for that date is 0
          const dates = [...new Set(activities.map(a => a.date))];
          qualifies = dates.some(d => {
            const dayTotal = activities.filter(a => a.date === d).reduce((sum, a) => sum + (a.emission || 0), 0);
            return dayTotal === 0;
          });
        } else if (ach.id === 'green-commute') {
          qualifies = greenCommutes >= ach.threshold;
        } else if (ach.id === 'vegan-week') {
          qualifies = veganDays >= ach.threshold;
        }
        break;
    }

    if (qualifies) {
      const success = unlockAchievement(ach.id);
      if (success) {
        newlyUnlocked.push(ach.id);
        showToast({
          title: `🏆 Badge Unlocked: ${ach.name}`,
          message: ach.description,
          type: 'success',
          duration: 6000,
        });
      }
    }
  }

  return newlyUnlocked;
}
