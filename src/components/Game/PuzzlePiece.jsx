import React, { memo } from 'react';
import './PuzzlePiece.css';

/**
 * Individual Puzzle Piece Component
 * @param {Object} piece - Piece data with image info and position
 * @param {number} size - Size of the piece in pixels
 * @param {boolean} isDragging - Whether this piece is being dragged
 * @param {Function} onDragStart - Drag start handler
 * @param {Function} onDragEnd - Drag end handler
 */
const PuzzlePiece = memo(({
  piece,
  size,
  isDragging = false,
  onDragStart,
  onDragEnd,
}) => {
  const { imageData, isPlaced, isCorrect } = piece;

  const handleStart = (e) => {
    if (isPlaced) return; // Can't drag pieces that are already placed
    if (onDragStart) {
      onDragStart(e, piece);
    }
  };

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: `url(${imageData.imageUrl})`,
    backgroundSize: imageData.backgroundSize,
    backgroundPosition: imageData.backgroundPosition,
    cursor: isPlaced ? 'default' : 'grab',
    opacity: isDragging ? 0.3 : 1,
    transform: isDragging ? 'scale(1.05)' : 'scale(1)',
  };

  const className = [
    'puzzle-piece',
    isPlaced && 'puzzle-piece--placed',
    isCorrect && 'puzzle-piece--correct',
    isDragging && 'puzzle-piece--dragging',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={className}
      style={style}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      data-piece-id={piece.id}
    >
      {isCorrect && <div className="puzzle-piece__checkmark">✓</div>}
    </div>
  );
});

PuzzlePiece.displayName = 'PuzzlePiece';

export default PuzzlePiece;
