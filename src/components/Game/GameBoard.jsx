import React, { useState, useEffect, useRef } from 'react';
import PuzzleGrid from './PuzzleGrid.jsx';
import PuzzlePiece from './PuzzlePiece.jsx';
import { createPuzzlePieces, updatePiecePosition, validatePuzzle, getUnplacedPieces } from '../../services/puzzleEngine.js';
import { getEventPosition, getDropZoneAtPosition } from '../../utils/touchHelpers.js';
import './GameBoard.css';

/**
 * Main Game Board Component - Orchestrates the puzzle game
 */
const GameBoard = ({ imageUrl, rows, cols, onComplete }) => {
  const [puzzleData, setPuzzleData] = useState(null);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });

  // Initialize puzzle when image or dimensions change
  useEffect(() => {
    if (imageUrl) {
      const data = createPuzzlePieces(imageUrl, rows, cols);
      setPuzzleData(data);
    }
  }, [imageUrl, rows, cols]);

  const handlePieceDragStart = (e, piece) => {
    e.preventDefault();
    const pos = getEventPosition(e);

    setDraggedPiece(piece);
    setDragPosition(pos);
    dragStartPosRef.current = pos;
    setIsDragging(true);

    // Add mouse/touch move and up listeners
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleDragMove = (e) => {
    if (!isDragging && !draggedPiece) return;

    e.preventDefault();
    const pos = getEventPosition(e);
    setDragPosition(pos);
  };

  const handleDragEnd = (e) => {
    if (!draggedPiece || !puzzleData) return;

    const pos = getEventPosition(e);
    const dropZone = getDropZoneAtPosition(pos.x, pos.y);

    if (dropZone) {
      // Update piece position
      const updatedPieces = updatePiecePosition(
        puzzleData.pieces,
        draggedPiece.id,
        dropZone
      );

      setPuzzleData({
        ...puzzleData,
        pieces: updatedPieces,
      });

      // Check if puzzle is complete
      const validation = validatePuzzle(updatedPieces);
      if (validation.isComplete && onComplete) {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }

    // Clean up
    setDraggedPiece(null);
    setIsDragging(false);

    // Remove listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
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
          onPieceDragStart={handlePieceDragStart}
          draggedPieceId={draggedPiece?.id}
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

      {/* Floating dragged piece */}
      {isDragging && draggedPiece && (
        <div
          className="game-board__floating-piece"
          style={{
            position: 'fixed',
            left: dragPosition.x - 30,
            top: dragPosition.y - 30,
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <PuzzlePiece
            piece={draggedPiece}
            size={60}
            isDragging={true}
          />
        </div>
      )}
    </div>
  );
};

export default GameBoard;
