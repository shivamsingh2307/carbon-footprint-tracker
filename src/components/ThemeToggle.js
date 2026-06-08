/**
 * ThemeToggle component — Dark/light mode toggle with system preference detection.
 * @module ThemeToggle
 */

import { getSettings, updateSetting } from '../services/StorageService.js';
import { announceToScreenReader } from '../utils/accessibility.js';

const SUN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
const MOON_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

/**
 * Initialize the theme toggle button.
 */
export function initThemeToggle() {
  const mount = document.getElementById('theme-toggle-mount');
  if (!mount) return;

  const button = document.createElement('button');
  button.className = 'theme-toggle';
  button.setAttribute('aria-label', 'Toggle dark/light mode');
  button.id = 'theme-toggle-btn';

  // Determine initial theme
  const settings = getSettings();
  let currentTheme = settings.theme || getSystemPreference();
  applyTheme(currentTheme);
  updateButtonIcon(button, currentTheme);

  button.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    updateButtonIcon(button, currentTheme);
    updateSetting('theme', currentTheme);
    announceToScreenReader(`Switched to ${currentTheme} mode`);
  });

  mount.appendChild(button);
}

/**
 * Apply a theme to the document.
 * @param {'dark'|'light'} theme
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Update the button icon based on current theme.
 * @param {HTMLElement} button
 * @param {'dark'|'light'} theme
 */
function updateButtonIcon(button, theme) {
  // Show the icon for the theme you'd switch TO
  button.innerHTML = theme === 'dark' ? SUN_ICON : MOON_ICON;
  button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}

/**
 * Detect system color scheme preference.
 * @returns {'dark'|'light'}
 */
function getSystemPreference() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}
