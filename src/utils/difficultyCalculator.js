import { GAME_CONFIG } from '../constants/gameConfig.js';

const { MIN_GRID_SIZE, MAX_GRID_SIZE, PUZZLES_PER_LEVEL } = GAME_CONFIG;

/**
 * Calculate the next difficulty level based on completed puzzles
 * @param {number} completedPuzzles - Total number of puzzles completed
 * @param {number} currentRows - Current number of rows
 * @param {number} currentCols - Current number of columns
 * @returns {Object} Next difficulty with rows, cols, and optional reset flag
 */
export function calculateNextDifficulty(completedPuzzles, currentRows, currentCols) {
  // Check if it's time to increase difficulty
  const shouldIncrease = completedPuzzles > 0 && completedPuzzles % PUZZLES_PER_LEVEL === 0;

  if (!shouldIncrease) {
    return { rows: currentRows, cols: currentCols };
  }

  // If we're at maximum size, reset to minimum
  if (currentRows === MAX_GRID_SIZE && currentCols === MAX_GRID_SIZE) {
    return {
      rows: MIN_GRID_SIZE,
      cols: MIN_GRID_SIZE,
      resetCycle: true,
    };
  }

  // Alternate between increasing rows and columns
  if (currentRows === currentCols) {
    // When square, increase columns first
    if (currentCols < MAX_GRID_SIZE) {
      return { rows: currentRows, cols: currentCols + 1 };
    }
  } else if (currentCols > currentRows) {
    // When columns are ahead, increase rows
    if (currentRows < MAX_GRID_SIZE) {
      return { rows: currentRows + 1, cols: currentCols };
    }
  }

  // Default: maintain current difficulty
  return { rows: currentRows, cols: currentCols };
}

/**
 * Get the total number of pieces for a given difficulty
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {number} Total number of pieces
 */
export function getTotalPieces(rows, cols) {
  return rows * cols;
}

/**
 * Get the difficulty level number (1-based)
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {number} Difficulty level
 */
export function getDifficultyLevel(rows, cols) {
  // Calculate based on total pieces
  const pieces = getTotalPieces(rows, cols);

  // Simple mapping based on piece count
  if (pieces <= 4) return 1;   // 2x2
  if (pieces <= 6) return 2;   // 2x3
  if (pieces <= 9) return 3;   // 3x3
  if (pieces <= 12) return 4;  // 3x4
  if (pieces <= 16) return 5;  // 4x4
  if (pieces <= 20) return 6;  // 4x5
  if (pieces <= 25) return 7;  // 5x5
  if (pieces <= 30) return 8;  // 5x6
  return 9;                     // 6x6 (36 pieces)
}

/**
 * Get human-readable difficulty description
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {string} Description like "Easy (2x2)" or "Hard (5x5)"
 */
export function getDifficultyDescription(rows, cols) {
  const level = getDifficultyLevel(rows, cols);
  const size = `${rows}×${cols}`;

  if (level <= 2) return `Super Easy (${size})`;
  if (level <= 4) return `Easy (${size})`;
  if (level <= 6) return `Medium (${size})`;
  if (level <= 8) return `Hard (${size})`;
  return `Expert (${size})`;
}

/**
 * Get the puzzle number within current difficulty level
 * @param {number} completedPuzzles - Total completed puzzles
 * @returns {number} Puzzle number within level (1-5)
 */
export function getPuzzleNumberInLevel(completedPuzzles) {
  return (completedPuzzles % PUZZLES_PER_LEVEL) + 1;
}

/**
 * Calculate progress through all difficulty levels
 * @param {number} completedPuzzles - Total completed puzzles
 * @returns {Object} Progress information
 */
export function getProgressInfo(completedPuzzles) {
  // Total possible progression levels before reset
  // 2x2, 2x3, 3x3, 3x4, 4x4, 4x5, 5x5, 5x6, 6x6 = 9 levels
  const totalLevels = 9;
  const puzzlesPerCycle = totalLevels * PUZZLES_PER_LEVEL; // 45 puzzles

  const currentCycle = Math.floor(completedPuzzles / puzzlesPerCycle) + 1;
  const puzzlesInCurrentCycle = completedPuzzles % puzzlesPerCycle;
  const currentLevel = Math.floor(puzzlesInCurrentCycle / PUZZLES_PER_LEVEL) + 1;

  return {
    currentCycle,
    currentLevel,
    totalLevels,
    puzzlesInCurrentCycle,
    puzzlesPerCycle,
    percentComplete: (puzzlesInCurrentCycle / puzzlesPerCycle) * 100,
  };
}

/**
 * Get the grid size for a specific puzzle number
 * @param {number} puzzleNumber - The puzzle number (0-based)
 * @returns {Object} Grid size with rows and cols
 */
export function getGridSizeForPuzzle(puzzleNumber) {
  let rows = MIN_GRID_SIZE;
  let cols = MIN_GRID_SIZE;

  for (let i = 0; i < puzzleNumber; i++) {
    const next = calculateNextDifficulty(i + 1, rows, cols);
    rows = next.rows;
    cols = next.cols;
  }

  return { rows, cols };
}

/**
 * Check if the next puzzle will increase difficulty
 * @param {number} completedPuzzles - Total completed puzzles
 * @returns {boolean} True if next puzzle increases difficulty
 */
export function willDifficultyIncrease(completedPuzzles) {
  return completedPuzzles > 0 && (completedPuzzles + 1) % PUZZLES_PER_LEVEL === 0;
}

/**
 * Get congratulations message based on difficulty
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {string} Congratulations message
 */
export function getCongratulationsMessage(rows, cols) {
  const pieces = getTotalPieces(rows, cols);
  const messages = [
    'Amazing!',
    'Great Job!',
    'You Did It!',
    'Fantastic!',
    'Wonderful!',
    'Super!',
    'Excellent!',
    'Brilliant!',
    'Perfect!',
    'Awesome!',
  ];

  // Random message
  const message = messages[Math.floor(Math.random() * messages.length)];

  if (pieces <= 6) {
    return `${message} You completed a ${rows}×${cols} puzzle!`;
  } else if (pieces <= 16) {
    return `${message} That was ${pieces} pieces!`;
  } else {
    return `${message} You're a puzzle master! ${pieces} pieces!`;
  }
}

export default {
  calculateNextDifficulty,
  getTotalPieces,
  getDifficultyLevel,
  getDifficultyDescription,
  getPuzzleNumberInLevel,
  getProgressInfo,
  getGridSizeForPuzzle,
  willDifficultyIncrease,
  getCongratulationsMessage,
};
