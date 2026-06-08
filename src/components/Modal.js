/**
 * Modal component — Accessible dialog with focus trap.
 * @module Modal
 */

import { trapFocus, generateId, announceToScreenReader } from '../utils/accessibility.js';

let activeModal = null;
let previousFocus = null;
let cleanupFocusTrap = null;

/**
 * Open a modal dialog.
 * @param {Object} options
 * @param {string} options.title - Modal title
 * @param {string} options.body - HTML content for the body
 * @param {Array<{label: string, className: string, onClick: Function}>} [options.actions]
 * @param {Function} [options.onClose]
 */
export function openModal({ title, body, actions = [], onClose }) {
  closeModal(); // Close any existing modal

  previousFocus = document.activeElement;
  const container = document.getElementById('modal-container');
  if (!container) return;

  const titleId = generateId('modal-title');
  const bodyId = generateId('modal-body');

  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.addEventListener('click', () => closeModal(onClose));

  // Modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', titleId);
  modal.setAttribute('aria-describedby', bodyId);

  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `
    <h2 class="modal-title" id="${titleId}"></h2>
    <button class="btn-icon btn-ghost modal-close-btn" aria-label="Close dialog">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;
  header.querySelector('.modal-title').textContent = title;
  header.querySelector('.modal-close-btn').addEventListener('click', () => closeModal(onClose));

  // Body
  const bodyEl = document.createElement('div');
  bodyEl.className = 'modal-body';
  bodyEl.id = bodyId;
  bodyEl.innerHTML = body;

  // Footer
  const footer = document.createElement('div');
  footer.className = 'modal-footer';

  actions.forEach((action) => {
    const btn = document.createElement('button');
    btn.className = `btn ${action.className || 'btn-secondary'}`;
    btn.textContent = action.label;
    btn.addEventListener('click', () => {
      if (action.onClick) action.onClick();
      if (action.closeOnClick !== false) closeModal(onClose);
    });
    footer.appendChild(btn);
  });

  // Assemble
  modal.appendChild(header);
  modal.appendChild(bodyEl);
  if (actions.length > 0) modal.appendChild(footer);

  container.appendChild(backdrop);
  container.appendChild(modal);

  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  // Focus trap
  cleanupFocusTrap = trapFocus(modal);

  // Escape key
  activeModal = { modal, backdrop, onClose };
  document.addEventListener('keydown', handleEscape);

  announceToScreenReader(`Dialog opened: ${title}`);
}

/**
 * Close the active modal.
 * @param {Function} [onClose] - Callback
 */
export function closeModal(onClose) {
  if (!activeModal) return;

  const { modal, backdrop } = activeModal;
  document.removeEventListener('keydown', handleEscape);

  if (cleanupFocusTrap) {
    cleanupFocusTrap();
    cleanupFocusTrap = null;
  }

  // Animate out
  modal.style.animation = 'fadeOut 200ms ease forwards';
  backdrop.style.animation = 'fadeOut 200ms ease forwards';

  setTimeout(() => {
    modal.remove();
    backdrop.remove();
    document.body.style.overflow = '';
    activeModal = null;

    // Restore focus
    if (previousFocus && previousFocus.focus) {
      previousFocus.focus();
    }
  }, 200);

  if (onClose) onClose();
  announceToScreenReader('Dialog closed');
}

/**
 * Handle Escape key to close modal.
 * @param {KeyboardEvent} event
 */
function handleEscape(event) {
  if (event.key === 'Escape') {
    closeModal(activeModal?.onClose);
  }
}
