import React from 'react';
import './ResetButton.css';

/**
 * Reset Button Component
 * Allows user to reset the entire game to 2x2 with a new image
 */
const ResetButton = ({ onReset }) => {
  const handleClick = () => {
    // Confirm before resetting to prevent accidental resets
    if (window.confirm('Start a brand new game? This will reset your progress!')) {
      onReset();
    }
  };

  return (
    <button
      className="reset-button"
      onClick={handleClick}
      aria-label="Reset game to start"
      type="button"
    >
      🔄 New Game
    </button>
  );
};

export default ResetButton;
