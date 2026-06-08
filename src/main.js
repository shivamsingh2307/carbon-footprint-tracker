/**
 * Main Entry Point — Initializes app shell, sets up global error handling, and boots the application.
 * @module main
 */

import { initApp } from './app.js';
import { getSettings } from './services/StorageService.js';

// Global Error Handler
window.onerror = function (message, source, lineno, colno, error) {
  console.error('[EcoTrack Global Error]:', { message, source, lineno, colno, error });
  // Prevent default browser action in production if desired, but keep for development visibility
  return false;
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('[EcoTrack Unhandled Promise Rejection]:', event.reason);
});

// Boot the application once DOM is loaded
function bootApp() {
  try {
    const settings = getSettings();
    const theme = settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (err) {
    console.warn('[main] Failed to apply initial theme:', err);
  }

  try {
    initApp();
    window.__ECOTRACK_BOOTED__ = true;
  } catch (err) {
    console.error('[EcoTrack Boot Error]:', err);
    showBootError(err);
  }
}

/**
 * Show a visible fallback when the app fails to initialize.
 * @param {Error} error
 */
function showBootError(error) {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  viewContainer.innerHTML = `
    <div class="card" style="padding: var(--space-8); text-align: center;">
      <div style="font-size: 3rem; margin-bottom: var(--space-4);">⚠️</div>
      <h2 style="margin-bottom: var(--space-2);">EcoTrack failed to start</h2>
      <p class="text-secondary" style="margin-bottom: var(--space-4);">
        ${error?.message || 'An unexpected error occurred while loading the app.'}
      </p>
      <p class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--space-6);">
        Run <code>npm install</code> then <code>npm run dev</code> to start the development server.
      </p>
      <button class="btn btn-primary" type="button" id="boot-reload-btn">Reload</button>
    </div>
  `;

  viewContainer.querySelector('#boot-reload-btn')?.addEventListener('click', () => {
    window.location.reload();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
