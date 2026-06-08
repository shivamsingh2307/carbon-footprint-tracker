/**
 * Toast notification component.
 * @module Toast
 */

/**
 * Show a toast notification.
 * @param {Object} options
 * @param {string} options.message - Notification message
 * @param {'success'|'error'|'warning'|'info'} [options.type='info']
 * @param {number} [options.duration=4000] - Auto-dismiss in ms (0 = manual)
 * @param {string} [options.title]
 * @param {{label: string, onClick: Function}} [options.action]
 */
export function showToast({ message, type = 'info', duration = 4000, title, action }) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  let html = `
    <span class="toast-icon" aria-hidden="true">${icons[type]}</span>
    <div class="toast-content">
      ${title ? `<div class="toast-title"></div>` : ''}
      <div class="toast-message"></div>
    </div>
  `;

  if (action) {
    html += `<button class="btn btn-sm btn-secondary toast-action">${action.label}</button>`;
  }

  html += `
    <button class="toast-close" aria-label="Dismiss notification">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

  toast.innerHTML = html;

  // Set text safely (avoid XSS via textContent)
  if (title) {
    toast.querySelector('.toast-title').textContent = title;
  }
  toast.querySelector('.toast-message').textContent = message;

  // Close button
  toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast));

  // Action button
  if (action) {
    toast.querySelector('.toast-action').addEventListener('click', () => {
      action.onClick();
      dismissToast(toast);
    });
  }

  container.appendChild(toast);

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(() => dismissToast(toast), duration);
  }
}

/**
 * Dismiss a toast with animation.
 * @param {HTMLElement} toast
 */
function dismissToast(toast) {
  if (!toast || !toast.parentNode) return;
  toast.style.animation = 'fadeOut 200ms ease forwards';
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 200);
}
