/**
 * AchievementsBadges Component — Displays locked/unlocked badges with progress indicators.
 * @module AchievementsBadges
 */

import { ACHIEVEMENTS } from '../utils/constants.js';
import { getUnlockedAchievements, getActivities } from '../services/StorageService.js';
import {
  getCurrentStreak,
  getDailyAverage,
  getGreenTransportCount,
  getVeganDayCount,
} from '../services/CalculatorService.js';
import { showToast } from './Toast.js';

/**
 * Render the achievements/badges view.
 * @param {HTMLElement} container - The mount element
 */
export function initAchievementsBadges(container) {
  if (!container) return;
  renderBadges(container);
}

function renderBadges(container) {
  const unlocked = getUnlockedAchievements();
  const activities = getActivities();
  const totalLogs = activities.length;
  const streak = getCurrentStreak();
  const greenCommutes = getGreenTransportCount();
  const veganDays = getVeganDayCount();

  const dailyAvg = getDailyAverage(7);
  const baseline = 17.8;
  const pctReduction = dailyAvg > 0 ? ((baseline - dailyAvg) / baseline) * 100 : 0;

  container.innerHTML = `
    <div class="achievements-container grid">
      <div class="card fade-in">
        <h2 class="card-title">Eco Badges & Trophies</h2>
        <p class="card-subtitle">Earn rewards by logging activities, maintaining streaks, and reducing carbon emissions.</p>
        
        <div class="grid grid-3" style="margin-top: var(--space-4);">
          <div class="stat-card" style="background: var(--bg-input); border-radius: var(--radius-lg);">
            <div class="stat-value">${unlocked.length} / ${ACHIEVEMENTS.length}</div>
            <div class="stat-label">Badges Unlocked</div>
          </div>
          <div class="stat-card" style="background: var(--bg-input); border-radius: var(--radius-lg);">
            <div class="stat-value">${streak} days</div>
            <div class="stat-label">Current Streak</div>
          </div>
          <div class="stat-card" style="background: var(--bg-input); border-radius: var(--radius-lg);">
            <div class="stat-value">${totalLogs}</div>
            <div class="stat-label">Total Logs</div>
          </div>
        </div>
      </div>

      <!-- Grid of Achievements -->
      <div class="grid grid-auto">
        ${ACHIEVEMENTS.map((ach, idx) => {
          const isUnlocked = unlocked.includes(ach.id);
          const progress = calculateProgress(ach, streak, totalLogs, pctReduction, greenCommutes, veganDays, activities);

          return `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'} fade-in" 
                 style="animation-delay: ${(idx + 1) * 30}ms;"
                 data-id="${ach.id}"
                 data-name="${ach.name}">
              <div class="achievement-icon" aria-hidden="true">${ach.icon}</div>
              <div class="achievement-name">${ach.name}</div>
              <div class="achievement-desc" style="margin-bottom: var(--space-3);">${ach.description}</div>
              
              <!-- Progress indicator -->
              ${
                !isUnlocked
                  ? `
                <div style="width: 100%; font-size: var(--font-size-xs); color: var(--text-tertiary);">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <span>Progress</span>
                    <span>${progress.display}</span>
                  </div>
                  <div class="progress-bar" style="height: 6px;">
                    <div class="progress-fill" style="width: ${progress.percent}%;"></div>
                  </div>
                </div>
              `
                  : `
                <button class="btn btn-sm btn-secondary share-badge-btn" 
                        style="width: 100%; border-radius: var(--radius-md);" 
                        data-name="${ach.name}" 
                        data-icon="${ach.icon}">
                  Share Achievement
                </button>
              `
              }
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Attach share event listeners
  container.querySelectorAll('.share-badge-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const name = btn.dataset.name;
      const icon = btn.dataset.icon;

      const shareText = `I unlocked the "${icon} ${name}" badge on EcoTrack! Tracking my journey to a lower carbon footprint. 🌿`;
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          showToast({ message: 'Achievement copy-text copied to clipboard!', type: 'success' });
        })
        .catch(() => {
          showToast({ message: 'Failed to copy achievement text', type: 'error' });
        });
    });
  });
}

function calculateProgress(ach, streak, totalLogs, pctReduction, greenCommutes, veganDays, activities) {
  let current = 0;
  let display = '';

  switch (ach.category) {
    case 'streak':
      current = streak;
      display = `${current} / ${ach.threshold} days`;
      break;

    case 'exploration':
      current = totalLogs;
      display = `${current} / ${ach.threshold} logs`;
      break;

    case 'reduction':
      current = Math.max(0, pctReduction);
      display = `${current.toFixed(0)}% / ${ach.threshold}%`;
      break;

    case 'impact':
      if (ach.id === 'zero-day') {
        const dates = [...new Set(activities.map(a => a.date))];
        const hasZero = dates.some(d => {
          const dayTotal = activities.filter(a => a.date === d).reduce((sum, a) => sum + (a.emission || 0), 0);
          return dayTotal === 0;
        });
        current = hasZero ? 1 : 0;
        display = `${current} / 1 day`;
      } else if (ach.id === 'green-commute') {
        current = greenCommutes;
        display = `${current} / ${ach.threshold} rides`;
      } else if (ach.id === 'vegan-week') {
        current = veganDays;
        display = `${current} / ${ach.threshold} days`;
      }
      break;
  }

  const percent = Math.min(100, Math.max(0, (current / ach.threshold) * 100));

  return {
    percent,
    display,
  };
}
