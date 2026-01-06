import React, { useState, useEffect } from 'react';
import PuzzleGrid from './PuzzleGrid.jsx';
import PuzzlePiece from './PuzzlePiece.jsx';
import { createPuzzlePieces, updatePiecePosition, validatePuzzle, getUnplacedPieces } from '../../services/puzzleEngine.js';
import './GameBoard.css';

/**
 * Main Game Board Component - Orchestrates the puzzle game
 */
const GameBoard = ({ imageUrl, rows, cols, onComplete }) => {
  const [puzzleData, setPuzzleData] = useState(null);
  const [draggedPiece, setDraggedPiece] = useState(null);

  // Initialize puzzle when image or dimensions change
  useEffect(() => {
    if (imageUrl) {
      const data = createPuzzlePieces(imageUrl, rows, cols);
      setPuzzleData(data);
    }
  }, [imageUrl, rows, cols]);

  const handleDrop = (position) => {
    if (!draggedPiece || !puzzleData) return;

    // Update piece position
    const updatedPieces = updatePiecePosition(
      puzzleData.pieces,
      draggedPiece.id,
      position
    );

    setPuzzleData({
      ...puzzleData,
      pieces: updatedPieces,
    });

    setDraggedPiece(null);

    // Check if puzzle is complete
    const validation = validatePuzzle(updatedPieces);
    if (validation.isComplete && onComplete) {
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  };

  const handlePieceDragStart = (e, piece) => {
    setDraggedPiece(piece);
  };

  if (!puzzleData) {
    return (
      <div className="game-board game-board--loading">
        <p>Loading puzzle...</p>
      </div>
    );
  }

  const unplacedPieces = getUnplacedPieces(puzzleData.pieces);
  const validation = validatePuzzle(puzzleData.pieces);

  return (
    <div className="game-board">
      <div className="game-board__grid-container">
        <PuzzleGrid
          rows={rows}
          cols={cols}
          pieces={puzzleData.pieces}
          onDrop={handleDrop}
          onPieceDragStart={handlePieceDragStart}
        />
      </div>

      <div className="game-board__pieces-tray">
        <div className="pieces-tray__container">
          {unplacedPieces.map(piece => (
            <PuzzlePiece
              key={piece.id}
              piece={piece}
              size={60}
              isDragging={draggedPiece?.id === piece.id}
              onDragStart={handlePieceDragStart}
            />
          ))}
        </div>
        {unplacedPieces.length === 0 && validation.isComplete && (
          <p className="pieces-tray__message">Puzzle Complete! 🎉</p>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
