import React, { memo } from 'react';
import PuzzlePiece from './PuzzlePiece.jsx';
import './DropZone.css';

/**
 * Drop Zone Component - Target area for puzzle pieces
 * @param {Object} position - Grid position {row, col}
 * @param {number} size - Size of the zone in pixels
 * @param {Object|null} piece - Piece currently in this zone (if any)
 * @param {boolean} isHighlighted - Whether to highlight this zone
 * @param {Function} onDrop - Drop handler
 */
const DropZone = memo(({
  position,
  size,
  piece = null,
  isHighlighted = false,
  onDrop,
  onPieceDragStart,
}) => {
  const { row, col } = position;

  const handleDrop = (e) => {
    e.preventDefault();
    if (onDrop) {
      onDrop(position);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const className = [
    'drop-zone',
    isHighlighted && 'drop-zone--highlighted',
    piece && 'drop-zone--filled',
  ].filter(Boolean).join(' ');

  const style = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div
      className={className}
      style={style}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      data-row={row}
      data-col={col}
    >
      {piece && (
        <PuzzlePiece
          piece={piece}
          size={size}
          onDragStart={onPieceDragStart}
        />
      )}
      {!piece && (
        <div className="drop-zone__placeholder">
          <div className="drop-zone__corner drop-zone__corner--tl" />
          <div className="drop-zone__corner drop-zone__corner--tr" />
          <div className="drop-zone__corner drop-zone__corner--bl" />
          <div className="drop-zone__corner drop-zone__corner--br" />
        </div>
      )}
    </div>
  );
});

DropZone.displayName = 'DropZone';

export default DropZone;
