/**
 * Accessibility utilities for keyboard navigation, focus management,
 * and screen reader announcements.
 * @module accessibility
 */

let idCounter = 0;

/**
 * Generate a unique ID for ARIA attributes.
 * @param {string} [prefix='el'] - ID prefix
 * @returns {string}
 */
export function generateId(prefix = 'el') {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Announce a message to screen readers via a live region.
 * @param {string} message - Message to announce
 * @param {'polite'|'assertive'} [priority='polite']
 */
export function announceToScreenReader(message, priority = 'polite') {
  const container = document.getElementById('sr-announcements');
  if (!container) return;

  container.setAttribute('aria-live', priority);
  container.textContent = '';

  // Brief delay ensures screen readers pick up the change
  requestAnimationFrame(() => {
    container.textContent = message;
  });
}

/**
 * Trap focus within a container element (for modals/dialogs).
 * Returns a cleanup function to remove the trap.
 * @param {HTMLElement} container - Element to trap focus within
 * @returns {() => void} Cleanup function
 */
export function trapFocus(container) {
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  function handleKeyDown(event) {
    if (event.key !== 'Tab') return;

    const focusable = Array.from(container.querySelectorAll(focusableSelector));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  // Focus the first focusable element
  const firstFocusable = container.querySelector(focusableSelector);
  if (firstFocusable) {
    firstFocusable.focus();
  }

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Handle arrow-key navigation within a container of items.
 * Supports horizontal (left/right) and vertical (up/down) arrow keys.
 * @param {KeyboardEvent} event
 * @param {HTMLElement[]} items - Array of navigable items
 * @param {'horizontal'|'vertical'|'both'} [orientation='horizontal']
 */
export function handleArrowKeyNav(event, items, orientation = 'horizontal') {
  if (!items || items.length === 0) return;

  const currentIndex = items.indexOf(document.activeElement);
  let nextIndex = currentIndex;

  const isHorizontal = orientation === 'horizontal' || orientation === 'both';
  const isVertical = orientation === 'vertical' || orientation === 'both';

  switch (event.key) {
    case 'ArrowRight':
      if (isHorizontal) {
        nextIndex = (currentIndex + 1) % items.length;
      }
      break;
    case 'ArrowLeft':
      if (isHorizontal) {
        nextIndex = (currentIndex - 1 + items.length) % items.length;
      }
      break;
    case 'ArrowDown':
      if (isVertical) {
        nextIndex = (currentIndex + 1) % items.length;
      }
      break;
    case 'ArrowUp':
      if (isVertical) {
        nextIndex = (currentIndex - 1 + items.length) % items.length;
      }
      break;
    case 'Home':
      nextIndex = 0;
      break;
    case 'End':
      nextIndex = items.length - 1;
      break;
    default:
      return; // Don't prevent default for other keys
  }

  if (nextIndex !== currentIndex) {
    event.preventDefault();
    items[nextIndex].focus();
  }
}
