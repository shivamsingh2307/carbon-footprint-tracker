/**
 * ActivityLogger Component — Form for logging new carbon-emitting or green activities.
 * @module ActivityLogger
 */

import { CATEGORIES, CATEGORY_META, getFactorsByCategory, getFactorById } from '../data/emissionFactors.js';
import { calculateEmission } from '../services/CalculatorService.js';
import { addActivity, deleteActivity } from '../services/StorageService.js';
import { checkAchievements } from '../services/AchievementService.js';
import { validateActivity } from '../utils/validators.js';
import { sanitizeString, sanitizeNumber, sanitizeDate } from '../utils/sanitize.js';
import { getTodayISO } from '../utils/formatters.js';
import { showToast } from './Toast.js';

let activeCategory = CATEGORIES.TRANSPORT;

/**
 * Render the activity logger view.
 * @param {HTMLElement} container - The mount element
 */
export function initActivityLogger(container) {
  if (!container) return;
  renderLogger(container);
}

function renderLogger(container) {
  container.innerHTML = `
    <div class="logger-container card fade-in" style="max-width: 680px; margin: 0 auto;">
      <div class="card-header">
        <h2 class="card-title">Log New Activity</h2>
        <p class="card-subtitle">Choose a category and enter details to calculate emissions</p>
      </div>

      <form id="activity-form" novalidate>
        <!-- Category Selector -->
        <div class="form-group">
          <span class="form-label">Select Category</span>
          <div class="category-grid" role="radiogroup" aria-label="Activity category">
            ${CATEGORY_META.map(
              (cat) => `
              <div class="category-card ${cat.id === activeCategory ? 'active' : ''}" 
                   data-category="${cat.id}" 
                   role="radio" 
                   aria-checked="${cat.id === activeCategory}"
                   tabindex="0"
                   aria-label="${cat.name}">
                <div class="category-icon" aria-hidden="true">${cat.icon}</div>
                <div class="category-name">${cat.name}</div>
              </div>
            `
            ).join('')}
          </div>
        </div>

        <div class="grid grid-2">
          <!-- Sub-activity Select -->
          <div class="form-group">
            <label class="form-label" for="activity-select">Activity Type</label>
            <select class="form-select" id="activity-select" required>
              <!-- Populated dynamically -->
            </select>
            <div class="form-error" id="error-activity-select" style="display: none;"></div>
          </div>

          <!-- Quantity Input -->
          <div class="form-group">
            <label class="form-label" for="quantity-input">Quantity (<span id="unit-label">units</span>)</label>
            <input class="form-input" type="number" id="quantity-input" placeholder="0" min="0" step="any" required />
            <div class="form-error" id="error-quantity-input" style="display: none;"></div>
          </div>
        </div>

        <div class="grid grid-2">
          <!-- Date Picker -->
          <div class="form-group">
            <label class="form-label" for="date-input">Date</label>
            <input class="form-input" type="date" id="date-input" max="${getTodayISO()}" value="${getTodayISO()}" required />
            <div class="form-error" id="error-date-input" style="display: none;"></div>
          </div>

          <!-- Real-time CO2 Preview -->
          <div class="form-group" style="display: flex; flex-direction: column; justify-content: flex-end;">
            <div class="card stat-card" style="padding: var(--space-3); background: var(--bg-input); border-color: var(--border-secondary); margin-bottom: 0;">
              <div class="stat-value" id="preview-value" style="font-size: var(--font-size-xl);">0.0 kg</div>
              <div class="stat-label">Estimated CO₂e</div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label class="form-label" for="notes-input">Notes (Optional)</label>
          <textarea class="form-input" id="notes-input" placeholder="e.g. Commute to work, Vegan burger, etc." maxlength="500"></textarea>
          <div class="form-error" id="error-notes-input" style="display: none;"></div>
        </div>

        <!-- Submit Button -->
        <div style="display: flex; justify-content: flex-end; margin-top: var(--space-4);">
          <button type="submit" class="btn btn-primary btn-lg" id="submit-btn">
            Log Activity
          </button>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector('#activity-form');
  const activitySelect = container.querySelector('#activity-select');
  const quantityInput = container.querySelector('#quantity-input');
  const unitLabel = container.querySelector('#unit-label');
  const dateInput = container.querySelector('#date-input');
  const notesInput = container.querySelector('#notes-input');
  const previewValue = container.querySelector('#preview-value');

  // Populate sub-activities initially
  populateActivities(activeCategory, activitySelect);
  updateUnitLabel(activitySelect, unitLabel);

  // Category selection handler
  container.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      const cat = card.dataset.category;
      if (cat !== activeCategory) {
        activeCategory = cat;
        // Update active class
        container.querySelectorAll('.category-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');

        // Populate activities dropdown
        populateActivities(activeCategory, activitySelect);
        updateUnitLabel(activitySelect, unitLabel);
        updatePreview(activitySelect, quantityInput, previewValue);
      }
    });

    // Support Space/Enter key for keyboard accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Dropdown change handler
  activitySelect.addEventListener('change', () => {
    updateUnitLabel(activitySelect, unitLabel);
    updatePreview(activitySelect, quantityInput, previewValue);
  });

  // Quantity input handler
  quantityInput.addEventListener('input', () => {
    updatePreview(activitySelect, quantityInput, previewValue);
  });

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear previous errors
    container.querySelectorAll('.form-error').forEach((el) => {
      el.textContent = '';
      el.style.display = 'none';
    });
    container.querySelectorAll('.form-input').forEach((el) => el.classList.remove('form-input--error'));

    // Prepare and sanitize data
    const rawData = {
      activityId: activitySelect.value,
      quantity: quantityInput.value === '' ? null : Number(quantityInput.value),
      date: dateInput.value,
      notes: notesInput.value,
    };

    // Validate
    const validation = validateActivity(rawData);
    if (!validation.valid) {
      showValidationErrors(validation.errors, container);
      return;
    }

    // Sanitize values
    const cleanQuantity = sanitizeNumber(rawData.quantity, 0, 10000);
    const cleanDate = sanitizeDate(rawData.date);
    const cleanNotes = sanitizeString(rawData.notes, 500);

    const factor = getFactorById(rawData.activityId);
    const emission = calculateEmission(rawData.activityId, cleanQuantity);

    const activityEntry = {
      activityId: rawData.activityId,
      category: activeCategory,
      quantity: cleanQuantity,
      unit: factor ? factor.unit : '',
      date: cleanDate,
      notes: cleanNotes,
      emission,
    };

    // Save to storage
    const savedEntry = addActivity(activityEntry);

    // Trigger toast with undo
    showToast({
      message: `Logged ${factor ? factor.name : 'activity'} (${emission} kg CO₂e)`,
      type: 'success',
      action: {
        label: 'Undo',
        onClick: () => {
          deleteActivity(savedEntry.id);
          showToast({ message: 'Activity entry deleted', type: 'info' });
        },
      },
    });

    // Reset Form
    form.reset();
    dateInput.value = getTodayISO();
    updatePreview(activitySelect, quantityInput, previewValue);

    // Check achievements
    checkAchievements();
  });
}

function populateActivities(category, selectEl) {
  const factors = getFactorsByCategory(category);
  selectEl.innerHTML = factors
    .map((f) => `<option value="${f.id}">${f.name} — ${f.description}</option>`)
    .join('');
}

function updateUnitLabel(selectEl, labelEl) {
  const factor = getFactorById(selectEl.value);
  if (factor && labelEl) {
    labelEl.textContent = factor.unit;
  }
}

function updatePreview(selectEl, inputEl, previewEl) {
  const activityId = selectEl.value;
  const qty = Number(inputEl.value);
  if (!activityId || isNaN(qty) || qty <= 0) {
    previewEl.textContent = '0.0 kg';
    return;
  }
  const emission = calculateEmission(activityId, qty);
  previewEl.textContent = `${emission.toFixed(1)} kg`;
}

function showValidationErrors(errors, container) {
  errors.forEach((err) => {
    if (err.includes('Activity')) {
      const el = container.querySelector('#error-activity-select');
      el.textContent = err;
      el.style.display = 'flex';
      container.querySelector('#activity-select').classList.add('form-input--error');
    } else if (err.includes('Quantity')) {
      const el = container.querySelector('#error-quantity-input');
      el.textContent = err;
      el.style.display = 'flex';
      container.querySelector('#quantity-input').classList.add('form-input--error');
    } else if (err.includes('Date')) {
      const el = container.querySelector('#error-date-input');
      el.textContent = err;
      el.style.display = 'flex';
      container.querySelector('#date-input').classList.add('form-input--error');
    } else if (err.includes('Notes')) {
      const el = container.querySelector('#error-notes-input');
      el.textContent = err;
      el.style.display = 'flex';
      container.querySelector('#notes-input').classList.add('form-input--error');
    }
  });
}
