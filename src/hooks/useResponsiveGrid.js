import { useState, useEffect, useCallback } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig.js';

/**
 * Hook to calculate responsive grid dimensions that fit the screen
 * @param {number} rows - Number of rows in the puzzle
 * @param {number} cols - Number of columns in the puzzle
 * @param {number} unplacedCount - Number of pieces in the trays
 * @returns {Object} Grid dimensions and piece size
 */
export function useResponsiveGrid(rows, cols, unplacedCount = 0) {
  const [gridSize, setGridSize] = useState({
    width: 0,
    height: 0,
    pieceSize: 0,
    containerWidth: 0,
    containerHeight: 0,
  });

  const calculateGrid = useCallback(() => {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Reserve space for UI elements
    const topReserved = 120; // Progress bar
    const padding = 10;
    const trayGap = 10; // Gap between pieces in tray

    // Available space
    const availableWidth = viewportWidth - (padding * 4); // padding on all sides plus gaps
    const availableHeight = viewportHeight - topReserved - (padding * 2);

    // Calculate how many pieces will be in each side tray
    const piecesPerTray = Math.ceil(unplacedCount / 2);

    // We need to fit:
    // - Grid: cols × rows pieces
    // - Left tray: piecesPerTray pieces vertically
    // - Right tray: piecesPerTray pieces vertically

    // Calculate piece size constrained by:
    // 1. Grid width and height
    // 2. Tray height (must fit piecesPerTray pieces vertically)

    // For grid
    const gridPieceWidth = (availableWidth * 0.6) / cols; // 60% for grid
    const gridPieceHeight = availableHeight / rows;

    // For trays (each tray gets ~20% of width)
    const trayWidth = availableWidth * 0.18; // 18% for each tray
    const trayPieceHeight = piecesPerTray > 0
      ? (availableHeight - (piecesPerTray - 1) * trayGap) / piecesPerTray
      : availableHeight;

    // Piece size must work for both grid and trays
    let pieceSize = Math.min(
      gridPieceWidth,
      gridPieceHeight,
      trayWidth,
      trayPieceHeight
    );

    // Ensure minimum touch target size
    const minSize = GAME_CONFIG.MIN_TOUCH_TARGET;

    // Only enforce minimum if it doesn't cause overflow
    const minPieceWithGrid = Math.min(
      availableWidth * 0.6 / cols,
      availableHeight / rows
    );

    if (minPieceWithGrid >= minSize) {
      pieceSize = Math.max(pieceSize, minSize);
    }

    // Round to avoid sub-pixel rendering issues
    pieceSize = Math.floor(pieceSize);

    const finalGridWidth = pieceSize * cols;
    const finalGridHeight = pieceSize * rows;

    setGridSize({
      width: finalGridWidth,
      height: finalGridHeight,
      pieceSize: pieceSize,
      containerWidth: availableWidth,
      containerHeight: availableHeight,
    });
  }, [rows, cols, unplacedCount]);

  useEffect(() => {
    // Calculate on mount and when grid dimensions change
    calculateGrid();

    // Recalculate on window resize
    window.addEventListener('resize', calculateGrid);

    // Recalculate on orientation change
    window.addEventListener('orientationchange', () => {
      // Delay slightly to ensure dimensions are updated
      setTimeout(calculateGrid, 100);
    });

    return () => {
      window.removeEventListener('resize', calculateGrid);
      window.removeEventListener('orientationchange', calculateGrid);
    };
  }, [calculateGrid]);

  return gridSize;
}

export default useResponsiveGrid;
