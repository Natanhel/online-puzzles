/**
 * Touch and Mouse Helper Utilities
 * Provides unified event handling for kids' touch interactions
 */

/**
 * Get unified position from touch or mouse event
 * @param {Event} event - Touch or mouse event
 * @returns {Object} Position {x, y}
 */
export function getEventPosition(event) {
  if (event.touches && event.touches.length > 0) {
    // Touch event
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  } else if (event.changedTouches && event.changedTouches.length > 0) {
    // Touch end event
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
    };
  } else {
    // Mouse event
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }
}

/**
 * Check if two positions are close enough (for snap-to-grid)
 * @param {Object} pos1 - Position {x, y}
 * @param {Object} pos2 - Position {x, y}
 * @param {number} tolerance - Distance tolerance in pixels
 * @returns {boolean} True if positions are within tolerance
 */
export function isNearPosition(pos1, pos2, tolerance = 30) {
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  return dx <= tolerance && dy <= tolerance;
}

/**
 * Find element at position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} selector - CSS selector for target elements
 * @returns {Element|null} Element at position or null
 */
export function findElementAt(x, y, selector) {
  const elements = document.querySelectorAll(selector);

  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    if (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ) {
      return element;
    }
  }

  return null;
}

/**
 * Get drop zone at coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Object|null} Position {row, col} or null
 */
export function getDropZoneAtPosition(x, y) {
  const element = findElementAt(x, y, '.drop-zone');

  if (element && element.dataset.row !== undefined && element.dataset.col !== undefined) {
    return {
      row: parseInt(element.dataset.row, 10),
      col: parseInt(element.dataset.col, 10),
    };
  }

  return null;
}

/**
 * Prevent default touch behaviors (scrolling, zooming)
 * @param {Event} event - Touch event
 */
export function preventDefaultTouch(event) {
  if (event.cancelable) {
    event.preventDefault();
  }
}

/**
 * Trigger haptic feedback (vibration) if available
 * @param {number} duration - Vibration duration in ms
 */
export function triggerHaptic(duration = 10) {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
}

/**
 * Calculate distance between two points
 * @param {Object} pos1 - Position {x, y}
 * @param {Object} pos2 - Position {x, y}
 * @returns {number} Distance in pixels
 */
export function getDistance(pos1, pos2) {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export default {
  getEventPosition,
  isNearPosition,
  findElementAt,
  getDropZoneAtPosition,
  preventDefaultTouch,
  triggerHaptic,
  getDistance,
};
