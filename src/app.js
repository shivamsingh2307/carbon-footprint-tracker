/**
 * App Module — Client-side router and view mounting orchestration.
 * @module app
 */

import { initNavigation, activateTab } from './components/Navigation.js';
import { initDashboard } from './components/Dashboard.js';
import { initActivityLogger } from './components/ActivityLogger.js';
import { initInsightsPanel } from './components/InsightsPanel.js';
import { initGoalsTracker } from './components/GoalsTracker.js';
import { initAchievementsBadges } from './components/AchievementsBadges.js';
import { initThemeToggle } from './components/ThemeToggle.js';
import { destroyAllCharts } from './components/ChartManager.js';
import { NAV_TABS } from './utils/constants.js';

const VALID_TAB_IDS = new Set(NAV_TABS.map((tab) => tab.id));

/**
 * Normalize a hash route to a known tab id.
 * @param {string} tabId
 * @returns {string}
 */
function normalizeTabId(tabId) {
  return VALID_TAB_IDS.has(tabId) ? tabId : 'dashboard';
}

/**
 * Render an error state in the view container without inline handlers (CSP-safe).
 * @param {HTMLElement} container
 * @param {Error} error
 */
function renderViewError(container, error) {
  container.innerHTML = `
    <div class="card" style="border-color: var(--status-danger); padding: var(--space-8); text-align: center;">
      <div style="font-size: 3rem; margin-bottom: var(--space-4);">⚠️</div>
      <h2 style="color: var(--status-danger); margin-bottom: var(--space-2);">Something went wrong</h2>
      <p class="text-secondary" style="margin-bottom: var(--space-6);">${error.message}</p>
      <button class="btn btn-primary" type="button" id="app-reload-btn">Reload Application</button>
    </div>
  `;

  container.querySelector('#app-reload-btn')?.addEventListener('click', () => {
    window.location.reload();
  });
}

/**
 * Bootstrap and configure the SPA.
 */
export function initApp() {
  try {
    initThemeToggle();
  } catch (err) {
    console.error('Failed to initialize theme toggle:', err);
  }

  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) {
    console.error('Critical Error: View container not found in DOM.');
    return;
  }

  /**
   * Render view corresponding to selected tab.
   * @param {string} tabId
   */
  const renderView = (tabId) => {
    const normalizedTabId = normalizeTabId(tabId);

    destroyAllCharts();
    viewContainer.innerHTML = '';

    try {
      switch (normalizedTabId) {
        case 'dashboard':
          initDashboard(viewContainer);
          break;
        case 'log':
          initActivityLogger(viewContainer);
          break;
        case 'insights':
          initInsightsPanel(viewContainer);
          break;
        case 'goals':
          initGoalsTracker(viewContainer);
          break;
        case 'achievements':
          initAchievementsBadges(viewContainer);
          break;
        default:
          initDashboard(viewContainer);
      }
    } catch (error) {
      console.error(`Render error in view "${normalizedTabId}":`, error);
      renderViewError(viewContainer, error);
    }
  };

  /**
   * Sync tab UI and content with the current URL hash.
   */
  const syncRoute = () => {
    const tabId = normalizeTabId(window.location.hash.slice(1));
    activateTab(tabId);
    renderView(tabId);
  };

  // Tab clicks update the hash; hashchange drives rendering.
  initNavigation((tabId) => {
    const normalizedTabId = normalizeTabId(tabId);
    if (window.location.hash !== `#${normalizedTabId}`) {
      window.location.hash = normalizedTabId;
    } else {
      syncRoute();
    }
  });

  window.addEventListener('hashchange', syncRoute);

  if (!window.location.hash) {
    window.location.hash = 'dashboard';
  } else {
    syncRoute();
  }
}
