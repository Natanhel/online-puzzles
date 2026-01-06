import React from 'react';
import './HintButton.css';

/**
 * Hint Button Component
 * Provides help for small kids by placing up to 50% of pieces on the board
 */
const HintButton = ({ onHint, disabled }) => {
  return (
    <button
      className="hint-button"
      onClick={onHint}
      disabled={disabled}
      aria-label="Get hint - place some pieces"
      type="button"
    >
      💡 Help Me!
    </button>
  );
};

export default HintButton;
