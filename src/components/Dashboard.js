/**
 * Dashboard Component — Main overview screen with statistics, charts, and activity feed.
 * @module Dashboard
 */

import {
  getPeriodTotal,
  getDailyTotal,
  getCategoryBreakdown,
  getTrendData,
  getComparisonData,
  getEquivalencies,
  getCurrentStreak,
  getBestDay,
} from '../services/CalculatorService.js';
import { getActivities, deleteActivity } from '../services/StorageService.js';
import { createDoughnutChart, createLineChart } from './ChartManager.js';
import { formatCO2, formatNumber, getTodayISO, formatDate } from '../utils/formatters.js';
import { showToast } from './Toast.js';
import { openModal } from './Modal.js';

let activePeriodDays = 7;

/**
 * Render the dashboard view.
 * @param {HTMLElement} container - The mount element
 */
export function initDashboard(container) {
  if (!container) return;
  renderDashboard(container);
}

function renderDashboard(container) {
  const today = getTodayISO();
  const todayEmissions = getDailyTotal(today);
  const streak = getCurrentStreak();
  const periodTotal = getPeriodTotal(activePeriodDays);
  const bestDayData = getBestDay(activePeriodDays);
  const equivalencies = getEquivalencies(periodTotal);
  const breakdown = getCategoryBreakdown(activePeriodDays);
  const recentActivities = getActivities().slice(0, 5);

  container.innerHTML = `
    <div class="dashboard-grid grid">
      <!-- Hero/Overview Section -->
      <div class="card card-hero fade-in">
        <div class="card-header">
          <h2 class="card-title">Carbon Footprint Summary</h2>
          <span class="badge badge-primary">${activePeriodDays} Days View</span>
        </div>
        <div class="hero-content grid grid-2">
          <div class="hero-left">
            <p class="hero-label">Total CO₂e Emitted</p>
            <h1 class="hero-value count-up">${formatCO2(periodTotal, 1)}</h1>
            <p class="hero-subtext">Equivalent to planting <strong>${equivalencies.trees.toFixed(1)}</strong> trees this year.</p>
          </div>
          <div class="hero-right chart-wrapper" style="height: 180px; position: relative;">
            <canvas id="category-doughnut-canvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Quick Stats Grid -->
      <div class="stats-container grid grid-4 fade-in" style="animation-delay: 100ms;">
        <!-- Today's Emissions -->
        <div class="card stat-card">
          <span class="stat-icon" aria-hidden="true" style="font-size: var(--font-size-2xl);">💨</span>
          <div class="stat-value">${formatCO2(todayEmissions, 1)}</div>
          <div class="stat-label">Today's Emissions</div>
        </div>

        <!-- Weekly Streak -->
        <div class="card stat-card">
          <span class="stat-icon" aria-hidden="true" style="font-size: var(--font-size-2xl);">🔥</span>
          <div class="stat-value">${streak}</div>
          <div class="stat-label">Logging Streak (Days)</div>
        </div>

        <!-- Best Day -->
        <div class="card stat-card">
          <span class="stat-icon" aria-hidden="true" style="font-size: var(--font-size-2xl);">🌿</span>
          <div class="stat-value">${bestDayData ? formatCO2(bestDayData.total, 1) : '0 kg'}</div>
          <div class="stat-label">Best Day (${bestDayData ? formatDate(bestDayData.date) : 'No data'})</div>
        </div>

        <!-- Equivalencies (Trees Offset) -->
        <div class="card stat-card">
          <span class="stat-icon" aria-hidden="true" style="font-size: var(--font-size-2xl);">🌳</span>
          <div class="stat-value">${equivalencies.trees.toFixed(1)}</div>
          <div class="stat-label">Trees Required to Offset</div>
        </div>
      </div>

      <!-- Main Visualizations & Activities -->
      <div class="grid grid-2 fade-in" style="animation-delay: 200ms;">
        <!-- Trend Line Chart -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Emission Trend</h3>
              <p class="card-subtitle">Daily emissions time series</p>
            </div>
            <div class="period-selector" role="radiogroup" aria-label="Select trend period">
              <button class="period-btn ${activePeriodDays === 7 ? 'active' : ''}" data-days="7" role="radio" aria-checked="${activePeriodDays === 7}">7D</button>
              <button class="period-btn ${activePeriodDays === 30 ? 'active' : ''}" data-days="30" role="radio" aria-checked="${activePeriodDays === 30}">30D</button>
              <button class="period-btn ${activePeriodDays === 90 ? 'active' : ''}" data-days="90" role="radio" aria-checked="${activePeriodDays === 90}">90D</button>
            </div>
          </div>
          <div class="chart-container" style="height: 250px;">
            <canvas id="trend-line-canvas"></canvas>
          </div>
        </div>

        <!-- Recent Activities Feed -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Recent Activities</h3>
              <p class="card-subtitle">Your latest logged entries</p>
            </div>
          </div>
          <div class="activity-feed">
            ${
              recentActivities.length === 0
                ? `
              <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-title">No activities logged yet</div>
                <p class="empty-state-text">Go to the "Log Activity" tab to start building your carbon profile.</p>
              </div>
            `
                : recentActivities
                    .map(
                      (act) => `
              <div class="activity-item" data-id="${act.id}">
                <div class="activity-icon-wrap" aria-hidden="true">
                  ${getCategoryIcon(act.category)}
                </div>
                <div class="activity-details">
                  <div class="activity-name">${act.notes || getCategoryName(act.category)}</div>
                  <div class="activity-meta">${act.quantity} ${act.unit || ''} • ${formatDate(act.date, 'relative')}</div>
                </div>
                <div class="activity-emission">${formatCO2(act.emission, 1)}</div>
                <button class="btn btn-icon btn-ghost delete-activity-btn" aria-label="Delete activity entry" data-id="${act.id}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            `
                    )
                    .join('')
            }
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize charts
  if (breakdown.length > 0 && periodTotal > 0) {
    const chartLabels = breakdown.map((item) => item.name);
    const chartValues = breakdown.map((item) => item.total);
    const chartColors = breakdown.map((item) => item.color);
    createDoughnutChart('category-doughnut-canvas', {
      labels: chartLabels,
      values: chartValues,
      colors: chartColors,
    });
  }

  const trendData = getTrendData(activePeriodDays);
  createLineChart('trend-line-canvas', {
    labels: trendData.map((d) => formatDate(d.date)),
    values: trendData.map((d) => d.total),
  });

  // Attach event listeners for period buttons
  container.querySelectorAll('.period-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const days = parseInt(e.target.dataset.days, 10);
      if (days !== activePeriodDays) {
        activePeriodDays = days;
        renderDashboard(container);
      }
    });
  });

  // Attach event listeners for activity deletion
  container.querySelectorAll('.delete-activity-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const btnEl = e.currentTarget;
      const activityId = btnEl.dataset.id;
      if (!activityId) return;

      openModal({
        title: 'Delete Activity?',
        body: '<p>Are you sure you want to delete this activity? This action cannot be undone.</p>',
        actions: [
          {
            label: 'Cancel',
            className: 'btn-ghost',
          },
          {
            label: 'Delete',
            className: 'btn-danger',
            onClick: () => {
              const deleted = deleteActivity(activityId);
              if (deleted) {
                showToast({ message: 'Activity deleted successfully', type: 'success' });
                // Re-render the dashboard to update all stats and charts
                renderDashboard(container);
              } else {
                showToast({ message: 'Failed to delete activity', type: 'error' });
              }
            },
          },
        ],
      });
    });
  });
}

function getCategoryIcon(category) {
  const icons = {
    transport: '🚗',
    food: '🍽️',
    energy: '⚡',
    home: '🏠',
    shopping: '🛍️',
    waste: '♻️',
  };
  return icons[category] || '🌱';
}

function getCategoryName(category) {
  const names = {
    transport: 'Transport',
    food: 'Food',
    energy: 'Energy',
    home: 'Home',
    shopping: 'Shopping',
    waste: 'Waste',
  };
  return names[category] || 'Activity';
}
