import React from 'react';
import { motion } from 'framer-motion';
import { getDifficultyDescription, getPuzzleNumberInLevel } from '../../utils/difficultyCalculator.js';
import { GAME_CONFIG } from '../../constants/gameConfig.js';
import './ProgressBar.css';

const ProgressBar = ({ rows, cols, completedPuzzles }) => {
  const difficultyDesc = getDifficultyDescription(rows, cols);
  const puzzleInLevel = getPuzzleNumberInLevel(completedPuzzles);
  const progress = (puzzleInLevel / GAME_CONFIG.PUZZLES_PER_LEVEL) * 100;

  return (
    <div className="progress-bar">
      <div className="progress-bar__header">
        <h3 className="progress-bar__title">{difficultyDesc}</h3>
        <p className="progress-bar__count">
          Puzzle {puzzleInLevel} of {GAME_CONFIG.PUZZLES_PER_LEVEL}
        </p>
      </div>

      <div className="progress-bar__track">
        <motion.div
          className="progress-bar__fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <p className="progress-bar__total">
        Total Puzzles: {completedPuzzles}
      </p>
    </div>
  );
};

export default ProgressBar;
