/**
 * Puzzle Engine - Core logic for creating and validating puzzles
 */

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create puzzle pieces from an image
 * @param {string} imageUrl - URL of the image to slice
 * @param {number} rows - Number of rows in the puzzle
 * @param {number} cols - Number of columns in the puzzle
 * @param {number} aspectRatio - Image aspect ratio (width/height), defaults to 1 for square
 * @returns {Object} Puzzle data with pieces array and grid info
 */
export function createPuzzlePieces(imageUrl, rows, cols, aspectRatio = 1) {
  const pieces = [];

  // Calculate background-size accounting for aspect ratio
  // Pieces are square, but images may not be
  // For wide images (aspectRatio > 1): adjust width
  // For tall images (aspectRatio < 1): adjust height
  const bgSizeWidth = cols * 100;
  const bgSizeHeight = aspectRatio >= 1
    ? rows * 100 * aspectRatio  // Wide/square image: increase height
    : rows * 100;               // Tall image: keep height
  const bgSizeWidthAdjusted = aspectRatio < 1
    ? cols * 100 / aspectRatio  // Tall image: increase width
    : cols * 100;               // Wide/square image: keep width

  // Generate pieces for each position in the grid
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Calculate background position for this piece
      // Formula: position as percentage from 0% to 100%
      const bgPosX = cols > 1 ? (col / (cols - 1)) * 100 : 50;
      const bgPosY = rows > 1 ? (row / (rows - 1)) * 100 : 50;

      pieces.push({
        id: `piece-${row}-${col}`,
        correctPosition: { row, col },
        currentPosition: null, // Not placed yet
        imageData: {
          imageUrl: imageUrl,
          backgroundSize: `${bgSizeWidthAdjusted}% ${bgSizeHeight}%`,
          backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        },
        isPlaced: false,
        isCorrect: false,
      });
    }
  }

  // Shuffle pieces so they're not in order
  const shuffledPieces = shuffleArray(pieces);

  return {
    pieces: shuffledPieces,
    grid: {
      rows,
      cols,
      totalPieces: rows * cols,
    },
    imageUrl,
    aspectRatio,
  };
}

/**
 * Validate if a puzzle is complete
 * @param {Array} pieces - Array of puzzle pieces
 * @returns {Object} Validation result with completion status and statistics
 */
export function validatePuzzle(pieces) {
  if (!pieces || pieces.length === 0) {
    return {
      isComplete: false,
      correctCount: 0,
      totalPieces: 0,
      percentage: 0,
    };
  }

  const totalPieces = pieces.length;

  // Count how many pieces are placed
  const placedPieces = pieces.filter(p => p.isPlaced);

  // Check if all pieces are placed
  if (placedPieces.length !== totalPieces) {
    return {
      isComplete: false,
      correctCount: placedPieces.filter(p => p.isCorrect).length,
      placedCount: placedPieces.length,
      totalPieces,
      percentage: (placedPieces.filter(p => p.isCorrect).length / totalPieces) * 100,
    };
  }

  // Count how many pieces are in the correct position
  let correctCount = 0;
  for (const piece of pieces) {
    if (piece.isPlaced && piece.isCorrect) {
      if (
        piece.currentPosition.row === piece.correctPosition.row &&
        piece.currentPosition.col === piece.correctPosition.col
      ) {
        correctCount++;
      }
    }
  }

  const isComplete = correctCount === totalPieces;
  const percentage = (correctCount / totalPieces) * 100;

  return {
    isComplete,
    correctCount,
    placedCount: placedPieces.length,
    totalPieces,
    percentage,
  };
}

/**
 * Check if a piece is in the correct position
 * @param {Object} piece - Puzzle piece to check
 * @param {Object} position - Current position {row, col}
 * @returns {boolean} True if piece is in correct position
 */
export function isPieceCorrect(piece, position) {
  if (!piece || !position) return false;

  return (
    piece.correctPosition.row === position.row &&
    piece.correctPosition.col === position.col
  );
}

/**
 * Update a piece's position
 * @param {Array} pieces - Array of all puzzle pieces
 * @param {string} pieceId - ID of the piece to update
 * @param {Object|null} position - New position {row, col} or null
 * @returns {Array} Updated pieces array
 */
export function updatePiecePosition(pieces, pieceId, position) {
  // Find the piece being moved
  const draggedPiece = pieces.find(p => p.id === pieceId);
  if (!draggedPiece) return pieces;

  // Check if there's already a piece at the target position
  const existingPiece = position ? getPieceAtPosition(pieces, position) : null;

  // Determine behavior based on whether dragged piece is from board or tray
  const draggedFromBoard = draggedPiece.isPlaced;
  const shouldSwap = draggedFromBoard && existingPiece;

  return pieces.map(piece => {
    // Handle the existing piece at target position
    if (existingPiece && piece.id === existingPiece.id) {
      if (shouldSwap) {
        // SWAP: Move existing piece to dragged piece's old position
        const swapPosition = draggedPiece.currentPosition;
        const isCorrect = swapPosition ? isPieceCorrect(piece, swapPosition) : false;
        return {
          ...piece,
          currentPosition: swapPosition,
          isPlaced: swapPosition !== null,
          isCorrect,
        };
      } else {
        // REMOVE TO TRAY: Dragged from tray, remove existing piece
        return {
          ...piece,
          currentPosition: null,
          isPlaced: false,
          isCorrect: false,
        };
      }
    }

    // Place the dragged piece at new position
    if (piece.id === pieceId) {
      const isCorrect = position ? isPieceCorrect(piece, position) : false;
      return {
        ...piece,
        currentPosition: position,
        isPlaced: position !== null,
        isCorrect,
      };
    }

    return piece;
  });
}

/**
 * Get piece at a specific grid position
 * @param {Array} pieces - Array of puzzle pieces
 * @param {Object} position - Position to check {row, col}
 * @returns {Object|null} Piece at that position or null
 */
export function getPieceAtPosition(pieces, position) {
  return pieces.find(
    piece =>
      piece.isPlaced &&
      piece.currentPosition.row === position.row &&
      piece.currentPosition.col === position.col
  ) || null;
}

/**
 * Get all unplaced pieces
 * @param {Array} pieces - Array of puzzle pieces
 * @returns {Array} Array of unplaced pieces
 */
export function getUnplacedPieces(pieces) {
  return pieces.filter(piece => !piece.isPlaced);
}

/**
 * Swap two pieces' positions
 * @param {Array} pieces - Array of puzzle pieces
 * @param {string} pieceId1 - First piece ID
 * @param {string} pieceId2 - Second piece ID
 * @returns {Array} Updated pieces array
 */
export function swapPieces(pieces, pieceId1, pieceId2) {
  const piece1 = pieces.find(p => p.id === pieceId1);
  const piece2 = pieces.find(p => p.id === pieceId2);

  if (!piece1 || !piece2) return pieces;

  const pos1 = piece1.currentPosition;
  const pos2 = piece2.currentPosition;

  let updatedPieces = updatePiecePosition(pieces, pieceId1, pos2);
  updatedPieces = updatePiecePosition(updatedPieces, pieceId2, pos1);

  return updatedPieces;
}

/**
 * Reset all pieces to unplaced state
 * @param {Array} pieces - Array of puzzle pieces
 * @returns {Array} Reset and reshuffled pieces
 */
export function resetPuzzle(pieces) {
  const resetPieces = pieces.map(piece => ({
    ...piece,
    currentPosition: null,
    isPlaced: false,
    isCorrect: false,
  }));

  return shuffleArray(resetPieces);
}

/**
 * Get puzzle statistics
 * @param {Array} pieces - Array of puzzle pieces
 * @returns {Object} Statistics object
 */
export function getPuzzleStats(pieces) {
  const validation = validatePuzzle(pieces);
  const unplaced = getUnplacedPieces(pieces);

  return {
    ...validation,
    unplacedCount: unplaced.length,
    hint: unplaced.length > 0 ? unplaced[0].correctPosition : null,
  };
}

export default {
  createPuzzlePieces,
  validatePuzzle,
  isPieceCorrect,
  updatePiecePosition,
  getPieceAtPosition,
  getUnplacedPieces,
  swapPieces,
  resetPuzzle,
  getPuzzleStats,
};
