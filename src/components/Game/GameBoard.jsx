import React, { useState, useEffect, useRef } from 'react';
import PuzzleGrid from './PuzzleGrid.jsx';
import PuzzlePiece from './PuzzlePiece.jsx';
import HintButton from '../UI/HintButton.jsx';
import { createPuzzlePieces, updatePiecePosition, validatePuzzle, getUnplacedPieces, applyHint } from '../../services/puzzleEngine.js';
import { getEventPosition, getDropZoneAtPosition } from '../../utils/touchHelpers.js';
import './GameBoard.css';

/**
 * Main Game Board Component - Orchestrates the puzzle game
 */
const GameBoard = ({ imageUrl, rows, cols, onComplete, pieceSize, hintModeEnabled, onToggleHintMode }) => {
  const [puzzleData, setPuzzleData] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  // Use refs to avoid async state issues with drag events
  const draggedPieceRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const originalPositionRef = useRef(null); // Store original position before drag
  const hintAppliedRef = useRef(false);

  // Initialize puzzle when image or dimensions change
  useEffect(() => {
    if (imageUrl) {
      hintAppliedRef.current = false; // Reset hint applied flag for new puzzle

      // Load the image to get its natural dimensions
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const data = createPuzzlePieces(imageUrl, rows, cols, aspectRatio);
        setPuzzleData(data);
      };
      img.onerror = () => {
        // Fallback to square aspect ratio if image fails to load
        console.warn('Failed to load image for aspect ratio calculation');
        const data = createPuzzlePieces(imageUrl, rows, cols, 1);
        setPuzzleData(data);
      };
      img.src = imageUrl;
    }
  }, [imageUrl, rows, cols]);

  // Auto-apply hint when hint mode is enabled and puzzle is ready
  useEffect(() => {
    if (hintModeEnabled && puzzleData && !hintAppliedRef.current) {
      hintAppliedRef.current = true;

      // Apply hint after a short delay to let the puzzle render
      setTimeout(() => {
        const updatedPieces = applyHint(puzzleData.pieces);
        setPuzzleData({
          ...puzzleData,
          pieces: updatedPieces,
        });
      }, 300);
    }
  }, [hintModeEnabled, puzzleData]);

  const handlePieceDragStart = (e, piece) => {
    e.preventDefault();
    const pos = getEventPosition(e);

    // Use refs for immediate access in event handlers
    draggedPieceRef.current = piece;
    isDraggingRef.current = true;
    dragStartPosRef.current = pos;
    // Store original position to restore if drop is invalid
    originalPositionRef.current = piece.isPlaced ? piece.currentPosition : null;
    setDragPosition(pos);

    // Add mouse/touch move and up listeners
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleDragMove = (e) => {
    if (!isDraggingRef.current || !draggedPieceRef.current) return;

    e.preventDefault();
    const pos = getEventPosition(e);
    setDragPosition(pos);
  };

  const handleDragEnd = (e) => {
    if (!draggedPieceRef.current || !puzzleData) return;

    const pos = getEventPosition(e);
    const dropZone = getDropZoneAtPosition(pos.x, pos.y);
    const draggedPiece = draggedPieceRef.current;

    if (dropZone) {
      // Check if piece would be in correct position
      const isCorrectPosition =
        draggedPiece.correctPosition.row === dropZone.row &&
        draggedPiece.correctPosition.col === dropZone.col;

      // Only place piece if it's in the correct position
      if (isCorrectPosition) {
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
      } else if (originalPositionRef.current) {
        // If drop is incorrect and piece was already on board, restore to original position
        const updatedPieces = updatePiecePosition(
          puzzleData.pieces,
          draggedPiece.id,
          originalPositionRef.current
        );

        setPuzzleData({
          ...puzzleData,
          pieces: updatedPieces,
        });
      }
      // If incorrect position and piece was from tray, it returns to tray (do nothing)
    } else if (originalPositionRef.current) {
      // Dropped outside board - if piece was on board, restore it
      const updatedPieces = updatePiecePosition(
        puzzleData.pieces,
        draggedPiece.id,
        originalPositionRef.current
      );

      setPuzzleData({
        ...puzzleData,
        pieces: updatedPieces,
      });
    }

    // Clean up
    draggedPieceRef.current = null;
    isDraggingRef.current = false;
    originalPositionRef.current = null;

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

  // Use pieceSize from props or default to responsive calculation
  const trayPieceSize = pieceSize || 60;

  return (
    <div className="game-board">
      {/* Hint mode toggle for small kids */}
      <HintButton isActive={hintModeEnabled} onToggle={onToggleHintMode} />

      <div className="game-board__content">
        {/* Left tray for unplaced pieces */}
        <div className="game-board__side-tray game-board__side-tray--left">
          <div className="pieces-tray__container">
            {unplacedPieces.slice(0, Math.ceil(unplacedPieces.length / 2)).map(piece => (
              <PuzzlePiece
                key={piece.id}
                piece={piece}
                size={trayPieceSize}
                isDragging={draggedPieceRef.current?.id === piece.id}
                onDragStart={handlePieceDragStart}
              />
            ))}
          </div>
        </div>

        {/* Center grid */}
        <div className="game-board__grid-container">
          <PuzzleGrid
            rows={rows}
            cols={cols}
            pieces={puzzleData.pieces}
            onPieceDragStart={handlePieceDragStart}
            draggedPieceId={draggedPieceRef.current?.id}
          />
          {unplacedPieces.length === 0 && validation.isComplete && (
            <p className="game-board__complete-message">Puzzle Complete! 🎉</p>
          )}
        </div>

        {/* Right tray for remaining unplaced pieces */}
        <div className="game-board__side-tray game-board__side-tray--right">
          <div className="pieces-tray__container">
            {unplacedPieces.slice(Math.ceil(unplacedPieces.length / 2)).map(piece => (
              <PuzzlePiece
                key={piece.id}
                piece={piece}
                size={trayPieceSize}
                isDragging={draggedPieceRef.current?.id === piece.id}
                onDragStart={handlePieceDragStart}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating dragged piece */}
      {isDraggingRef.current && draggedPieceRef.current && (
        <div
          className="game-board__floating-piece"
          style={{
            position: 'fixed',
            left: dragPosition.x - trayPieceSize / 2,
            top: dragPosition.y - trayPieceSize / 2,
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <PuzzlePiece
            piece={draggedPieceRef.current}
            size={trayPieceSize}
            isDragging={true}
          />
        </div>
      )}
    </div>
  );
};

export default GameBoard;
