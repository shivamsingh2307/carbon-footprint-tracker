/**
 * Navigation component — Tab-based SPA navigation with ARIA tablist pattern.
 * @module Navigation
 */

import { NAV_TABS } from '../utils/constants.js';
import { handleArrowKeyNav } from '../utils/accessibility.js';

/** SVG icons for tabs */
const TAB_ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  add: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
  lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M6 3h12v6a6 6 0 0 1-12 0V3z"/><path d="M12 15v3M8 21h8M10 18h4"/></svg>',
};

/**
 * Initialize navigation tabs.
 * @param {Function} onTabChange - Callback receiving tab ID
 */
export function initNavigation(onTabChange) {
  const tablist = document.getElementById('nav-tabs');
  if (!tablist) return;

  // Create tab buttons
  NAV_TABS.forEach((tab, index) => {
    const button = document.createElement('button');
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    button.setAttribute('aria-controls', `panel-${tab.id}`);
    button.setAttribute('id', `tab-${tab.id}`);
    button.setAttribute('tabindex', index === 0 ? '0' : '-1');
    button.dataset.tabId = tab.id;

    button.innerHTML = `
      <span class="tab-icon" aria-hidden="true">${TAB_ICONS[tab.icon] || ''}</span>
      <span class="tab-label">${tab.label}</span>
    `;

    button.addEventListener('click', () => {
      activateTab(tab.id, onTabChange);
    });

    tablist.appendChild(button);
  });

  // Keyboard navigation
  tablist.addEventListener('keydown', (event) => {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    handleArrowKeyNav(event, tabs, 'horizontal');
  });

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (mobileBtn && mainNav) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = mobileBtn.getAttribute('aria-expanded') === 'true';
      mobileBtn.setAttribute('aria-expanded', String(!isOpen));
      mainNav.classList.toggle('open', !isOpen);
    });

    // Close mobile menu when a tab is selected
    tablist.addEventListener('click', () => {
      mobileBtn.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('open');
    });
  }
}

/**
 * Activate a specific tab.
 * @param {string} tabId
 * @param {Function} onTabChange
 */
export function activateTab(tabId, onTabChange) {
  const tablist = document.getElementById('nav-tabs');
  if (!tablist) return;

  const tabs = tablist.querySelectorAll('[role="tab"]');
  tabs.forEach((tab) => {
    const isSelected = tab.dataset.tabId === tabId;
    tab.setAttribute('aria-selected', String(isSelected));
    tab.setAttribute('tabindex', isSelected ? '0' : '-1');
  });

  if (onTabChange) {
    onTabChange(tabId);
  }
}
