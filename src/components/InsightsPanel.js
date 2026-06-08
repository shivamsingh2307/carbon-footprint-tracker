/**
 * InsightsPanel Component — Displays carbon reduction recommendations, weekly summaries, and data export tools.
 * @module InsightsPanel
 */

import { generateInsights } from '../services/InsightsEngine.js';
import { exportAsCSV, exportAsJSON } from '../services/ExportService.js';
import { getComparisonData, getPeriodTotal } from '../services/CalculatorService.js';
import { formatCO2 } from '../utils/formatters.js';
import { showToast } from './Toast.js';

const ECO_FACTS = [
  "Eating a plant-based diet can reduce your food-related greenhouse gas emissions by up to 73%.",
  "If everyone in the US skipped meat and cheese for just one day a week, it would be like taking 7.6 million cars off the road.",
  "Washing clothes at 30°C uses about 40% less electricity than washing at 40°C.",
  "Standby power accounts for up to 10% of average home electricity use — unplugging devices saves energy and money.",
  "Recycling one aluminum can saves enough energy to run a TV for three hours.",
  "Public transit reduces CO₂ emissions by 76% compared to driving an average single-occupant vehicle."
];

let activeFactIndex = 0;

/**
 * Render the insights panel view.
 * @param {HTMLElement} container - The mount element
 */
export function initInsightsPanel(container) {
  if (!container) return;
  renderInsights(container);
}

function renderInsights(container) {
  const insights = generateInsights(30);
  const comparison = getComparisonData(30);
  const totalEmitted = getPeriodTotal(30);

  // Generate comparison summary HTML
  const vsGlobalClass = comparison.vsGlobal <= 0 ? 'good' : 'bad';
  const vsGlobalSign = comparison.vsGlobal > 0 ? '+' : '';

  container.innerHTML = `
    <div class="insights-grid grid">
      <!-- Top banner / summary -->
      <div class="card fade-in">
        <h2 class="card-title">Monthly Progress & Benchmarks</h2>
        <p class="card-subtitle">How your footprint compares to regional and global averages</p>
        
        <div class="grid grid-3" style="margin-top: var(--space-6);">
          <div class="stat-card" style="background: var(--bg-input); border-radius: var(--radius-lg);">
            <div class="stat-value">${formatCO2(comparison.userAvg, 1)}</div>
            <div class="stat-label">Your Daily Avg (30 days)</div>
          </div>
          <div class="stat-card" style="background: var(--bg-input); border-radius: var(--radius-lg);">
            <div class="stat-value">${formatCO2(comparison.globalAvg, 1)}</div>
            <div class="stat-label">Global Target / Avg</div>
            <div class="stat-trend stat-trend--${vsGlobalClass}">
              ${vsGlobalSign}${comparison.vsGlobal.toFixed(0)}% vs Global
            </div>
          </div>
          <div class="stat-card" style="background: var(--bg-input); border-radius: var(--radius-lg);">
            <div class="stat-value">${formatCO2(comparison.usAvg, 1)}</div>
            <div class="stat-label">US Daily Avg</div>
            <div class="stat-trend stat-trend--good">
              -${Math.abs(comparison.vsUS).toFixed(0)}% vs US
            </div>
          </div>
        </div>
      </div>

      <!-- Main Recommendations Grid -->
      <div class="grid grid-2">
        <!-- Actionable Tips -->
        <div class="insights-tips grid">
          <h3 class="section-title fade-in" style="animation-delay: 100ms; margin-bottom: 0;">Recommended Actions</h3>
          ${
            insights.length === 0
              ? `<p class="text-secondary">Keep logging activities to generate custom insights.</p>`
              : insights
                  .map(
                    (insight, idx) => `
            <div class="insight-card fade-in" style="animation-delay: ${(idx + 1) * 50}ms;">
              <div class="insight-icon" aria-hidden="true">${insight.icon}</div>
              <div class="insight-content">
                <h4 class="insight-title">${insight.title}</h4>
                <p class="insight-text">${insight.text}</p>
                ${insight.savings ? `<div class="insight-savings">🌱 ${insight.savings}</div>` : ''}
              </div>
            </div>
          `
                  )
                  .join('')
          }
        </div>

        <!-- Facts Carousel & Data Portability -->
        <div class="grid" style="align-content: start; gap: var(--space-6);">
          <!-- Eco Fact Carousel -->
          <div class="card fade-in" style="animation-delay: 200ms;">
            <div class="card-header">
              <h3 class="card-title">💡 Did You Know?</h3>
            </div>
            <div class="carousel" style="min-height: 120px; display: flex; flex-direction: column; justify-content: space-between;">
              <p class="carousel-text" id="fact-text" style="font-size: var(--font-size-base); line-height: var(--line-height-relaxed); font-style: italic;">
                "${ECO_FACTS[activeFactIndex]}"
              </p>
              <div style="display: flex; justify-content: flex-end; gap: var(--space-2); margin-top: var(--space-4);">
                <button class="btn btn-sm btn-secondary" id="next-fact-btn">Next Fact</button>
              </div>
            </div>
          </div>

          <!-- Data Portability / Exports -->
          <div class="card fade-in" style="animation-delay: 300ms;">
            <div class="card-header">
              <h3 class="card-title">📥 Data Portability</h3>
              <p class="card-subtitle">Export your logged activity history</p>
            </div>
            <p class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--space-4);">
              Download your complete environmental profile. You can choose standard CSV for spreadsheets or raw JSON data.
            </p>
            <div style="display: flex; gap: var(--space-3);">
              <button class="btn btn-primary" id="export-csv-btn">
                Export to CSV
              </button>
              <button class="btn btn-secondary" id="export-json-btn">
                Export to JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach carousel event listener
  const factText = container.querySelector('#fact-text');
  const nextFactBtn = container.querySelector('#next-fact-btn');
  if (nextFactBtn && factText) {
    nextFactBtn.addEventListener('click', () => {
      activeFactIndex = (activeFactIndex + 1) % ECO_FACTS.length;
      factText.style.opacity = '0';
      setTimeout(() => {
        factText.textContent = `"${ECO_FACTS[activeFactIndex]}"`;
        factText.style.opacity = '1';
      }, 150);
    });
  }

  // Attach export buttons listeners
  container.querySelector('#export-csv-btn').addEventListener('click', () => {
    try {
      exportAsCSV(false);
      showToast({ message: 'CSV export downloaded successfully', type: 'success' });
    } catch (err) {
      showToast({ message: err.message, type: 'error' });
    }
  });

  container.querySelector('#export-json-btn').addEventListener('click', () => {
    try {
      exportAsJSON(false);
      showToast({ message: 'JSON export downloaded successfully', type: 'success' });
    } catch (err) {
      showToast({ message: err.message, type: 'error' });
    }
  });
}
