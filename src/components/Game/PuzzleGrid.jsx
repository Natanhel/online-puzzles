import React, { memo } from 'react';
import DropZone from './DropZone.jsx';
import useResponsiveGrid from '../../hooks/useResponsiveGrid.js';
import { getPieceAtPosition } from '../../services/puzzleEngine.js';
import './PuzzleGrid.css';

/**
 * Puzzle Grid Component - Renders the M x N grid of drop zones
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @param {Array} pieces - Array of all puzzle pieces
 * @param {Function} onDrop - Drop handler
 * @param {Function} onPieceDragStart - Piece drag start handler
 */
const PuzzleGrid = memo(({
  rows,
  cols,
  pieces,
  onDrop,
  onPieceDragStart,
}) => {
  const gridSize = useResponsiveGrid(rows, cols);
  const { width, height, pieceSize } = gridSize;

  // Create grid array
  const grid = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const position = { row, col };
      const piece = getPieceAtPosition(pieces, position);
      grid.push({
        position,
        piece,
      });
    }
  }

  const gridStyle = {
    width: `${width}px`,
    height: `${height}px`,
    gridTemplateColumns: `repeat(${cols}, ${pieceSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${pieceSize}px)`,
  };

  return (
    <div className="puzzle-grid" style={gridStyle}>
      {grid.map(({ position, piece }) => (
        <DropZone
          key={`${position.row}-${position.col}`}
          position={position}
          size={pieceSize}
          piece={piece}
          onDrop={onDrop}
          onPieceDragStart={onPieceDragStart}
        />
      ))}
    </div>
  );
});

PuzzleGrid.displayName = 'PuzzleGrid';

export default PuzzleGrid;
