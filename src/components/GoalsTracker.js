/**
 * GoalsTracker Component — Form and display for setting carbon footprint reduction targets.
 * @module GoalsTracker
 */

import { getGoals, saveGoal, deleteGoal, getActivities } from '../services/StorageService.js';
import { getDailyAverage } from '../services/CalculatorService.js';
import { validateGoal } from '../utils/validators.js';
import { sanitizeNumber, sanitizeDate } from '../utils/sanitize.js';
import { getTodayISO, formatDate, formatCO2 } from '../utils/formatters.js';
import { showToast } from './Toast.js';

/**
 * Render the goals tracker view.
 * @param {HTMLElement} container - The mount element
 */
export function initGoalsTracker(container) {
  if (!container) return;
  renderGoals(container);
}

function renderGoals(container) {
  const goals = getGoals();
  const activities = getActivities();
  const currentDailyAvg = getDailyAverage(30); // 30 day current daily average

  // Estimate a baseline footprint: average before goal, or 20 kg/day as fallback
  const baselineFootprint = 17.8; // EU standard baseline

  container.innerHTML = `
    <div class="goals-grid grid">
      <!-- Active Goals Section -->
      <div class="card fade-in">
        <div class="card-header">
          <h2 class="card-title">My Goals</h2>
          <p class="card-subtitle">Track your emission reduction progress</p>
        </div>
        <div class="goals-list" style="margin-top: var(--space-4);">
          ${
            goals.length === 0
              ? `
            <div class="empty-state">
              <div class="empty-state-icon">🎯</div>
              <div class="empty-state-title">No goals set yet</div>
              <p class="empty-state-text">Establish a target reduction goal below to help stay focused on lowering your footprint.</p>
            </div>
          `
              : goals
                  .map((goal) => {
                    const progressData = calculateGoalProgress(goal, currentDailyAvg, baselineFootprint);
                    const isCompleted = new Date(goal.deadline + 'T00:00:00') < new Date() || progressData.percent >= 100;

                    return `
              <div class="goal-item card" style="background: var(--bg-input); border-color: var(--border-secondary); margin-bottom: var(--space-4);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-3);">
                  <div>
                    <h3 style="font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--text-primary);">
                      Reduce Daily Average Footprint by ${goal.targetPercent}%
                    </h3>
                    <p class="card-subtitle">
                      Target: ${formatCO2(progressData.targetValue)}/day (Current: ${formatCO2(currentDailyAvg, 1)}/day)
                    </p>
                  </div>
                  <button class="btn btn-icon btn-ghost delete-goal-btn" data-id="${goal.id}" aria-label="Delete goal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
                
                <!-- Progress bar -->
                <div class="progress-container" style="margin-bottom: var(--space-3);">
                  <div class="progress-label">
                    <span>Progress to Target</span>
                    <span>${progressData.percent.toFixed(0)}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressData.percent}%;"></div>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-xs); color: var(--text-tertiary);">
                  <span>Created: ${formatDate(new Date(goal.createdAt).toISOString().split('T')[0])}</span>
                  <span>Deadline: <strong>${formatDate(goal.deadline)}</strong> (${daysRemaining(goal.deadline)} days left)</span>
                </div>
              </div>
            `;
                  })
                  .join('')
          }
        </div>
      </div>

      <!-- Set Goal Form -->
      <div class="card fade-in" style="animation-delay: 100ms; align-self: start;">
        <div class="card-header">
          <h2 class="card-title">Create New Goal</h2>
          <p class="card-subtitle">Set a reduction goal and target deadline</p>
        </div>

        <form id="goal-form" novalidate style="margin-top: var(--space-4);">
          <!-- Presets -->
          <div class="form-group">
            <span class="form-label">Quick Presets</span>
            <div style="display: flex; gap: var(--space-2);">
              <button type="button" class="btn btn-secondary btn-sm preset-btn" data-target="10">10% Reduction (Moderate)</button>
              <button type="button" class="btn btn-secondary btn-sm preset-btn" data-target="25">25% Reduction (Ambitious)</button>
              <button type="button" class="btn btn-secondary btn-sm preset-btn" data-target="50">50% Reduction (Eco Warrior)</button>
            </div>
          </div>

          <div class="grid grid-2">
            <!-- Target Reduction Percent -->
            <div class="form-group">
              <label class="form-label" for="target-percent-input">Target Reduction (%)</label>
              <input class="form-input" type="number" id="target-percent-input" min="1" max="100" placeholder="e.g. 15" required />
              <div class="form-error" id="error-target-percent" style="display: none;"></div>
            </div>

            <!-- Goal Deadline -->
            <div class="form-group">
              <label class="form-label" for="deadline-input">Target Deadline</label>
              <input class="form-input" type="date" id="deadline-input" required />
              <div class="form-error" id="error-deadline" style="display: none;"></div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: var(--space-4);">
            <button type="submit" class="btn btn-primary" id="save-goal-btn">
              Set Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const form = container.querySelector('#goal-form');
  const targetPercentInput = container.querySelector('#target-percent-input');
  const deadlineInput = container.querySelector('#deadline-input');

  // Set default deadline to 30 days in the future
  const defaultDeadline = new Date();
  defaultDeadline.setDate(defaultDeadline.getDate() + 30);
  deadlineInput.value = defaultDeadline.toISOString().split('T')[0];

  // Preset buttons handler
  container.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      targetPercentInput.value = btn.dataset.target;
    });
  });

  // Goal Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear errors
    container.querySelectorAll('.form-error').forEach((el) => {
      el.textContent = '';
      el.style.display = 'none';
    });
    container.querySelectorAll('.form-input').forEach((el) => el.classList.remove('form-input--error'));

    const rawData = {
      targetPercent: targetPercentInput.value === '' ? undefined : Number(targetPercentInput.value),
      deadline: deadlineInput.value,
    };

    // Validate
    const validation = validateGoal(rawData);
    if (!validation.valid) {
      showValidationErrors(validation.errors, container);
      return;
    }

    const cleanPercent = sanitizeNumber(rawData.targetPercent, 1, 100);
    const cleanDeadline = sanitizeDate(rawData.deadline);

    const goalEntry = {
      targetPercent: cleanPercent,
      deadline: cleanDeadline,
    };

    // Save
    saveGoal(goalEntry);
    showToast({ message: 'Goal created successfully!', type: 'success' });

    // Reset view
    renderGoals(container);
  });

  // Delete Goal Buttons
  container.querySelectorAll('.delete-goal-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const goalId = btn.dataset.id;
      if (!goalId) return;

      const deleted = deleteGoal(goalId);
      if (deleted) {
        showToast({ message: 'Goal removed', type: 'info' });
        renderGoals(container);
      }
    });
  });
}

function calculateGoalProgress(goal, currentDailyAvg, baselineFootprint) {
  const targetValue = baselineFootprint * (1 - goal.targetPercent / 100);

  // If daily average is lower than baseline, calculate progress
  let reductionPercent = 0;
  if (currentDailyAvg < baselineFootprint) {
    reductionPercent = ((baselineFootprint - currentDailyAvg) / baselineFootprint) * 100;
  }

  const progressPercent = Math.min(100, Math.max(0, (reductionPercent / goal.targetPercent) * 100));

  return {
    percent: progressPercent,
    targetValue,
  };
}

function daysRemaining(deadlineStr) {
  const deadline = new Date(deadlineStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function showValidationErrors(errors, container) {
  errors.forEach((err) => {
    if (err.includes('percent') || err.includes('Target')) {
      const el = container.querySelector('#error-target-percent');
      el.textContent = err;
      el.style.display = 'flex';
      container.querySelector('#target-percent-input').classList.add('form-input--error');
    } else if (err.includes('Deadline') || err.includes('deadline')) {
      const el = container.querySelector('#error-deadline');
      el.textContent = err;
      el.style.display = 'flex';
      container.querySelector('#deadline-input').classList.add('form-input--error');
    }
  });
}
