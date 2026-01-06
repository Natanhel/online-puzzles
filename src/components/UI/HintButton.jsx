import React from 'react';
import './HintButton.css';

/**
 * Hint Button Component
 * Toggle mode that provides continuous help for small kids
 */
const HintButton = ({ isActive, onToggle }) => {
  return (
    <button
      className={`hint-button ${isActive ? 'hint-button--active' : ''}`}
      onClick={onToggle}
      aria-label={isActive ? "Help mode ON" : "Help mode OFF"}
      aria-pressed={isActive}
      type="button"
    >
      💡 Help Me {isActive ? '✓' : ''}
    </button>
  );
};

export default HintButton;
