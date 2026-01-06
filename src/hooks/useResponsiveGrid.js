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

    // CSS spacing values (from themes.css)
    const spacingSm = 8;  // --spacing-sm
    const spacingMd = 16; // --spacing-md

    // Layout structure:
    // - Game board padding: spacingSm (8px) on all sides
    // - Content gap between grid and trays: spacingMd (16px)
    // - Each tray width: 18% of viewport
    // - Tray padding: spacingSm (8px) on all sides
    // - Tray piece gap: spacingSm (8px) between pieces

    const topReserved = 120; // Progress bar height
    const gameBoardPadding = spacingSm * 2; // top + bottom
    const contentGap = spacingMd * 2; // 2 gaps (left tray-grid, grid-right tray)
    const trayPadding = spacingSm * 2; // top + bottom padding for each tray
    const trayPieceGap = spacingSm; // gap between pieces in tray

    // Available viewport space
    const availableWidth = viewportWidth - gameBoardPadding;
    const availableHeight = viewportHeight - topReserved - gameBoardPadding;

    // Layout allocation:
    // Each tray: 18% of availableWidth
    // Grid: remaining width after trays and gaps
    const trayWidthPercent = 0.18;
    const singleTrayWidth = availableWidth * trayWidthPercent;
    const totalTrayWidth = singleTrayWidth * 2;
    const gridAreaWidth = availableWidth - totalTrayWidth - contentGap;

    // Calculate piece size for grid
    const gridPieceWidth = gridAreaWidth / cols;
    const gridPieceHeight = availableHeight / rows;

    // Calculate how many pieces per tray
    const piecesPerTray = Math.ceil(unplacedCount / 2);

    // Calculate piece size for tray (must fit width and height with padding/gaps)
    const trayInnerWidth = singleTrayWidth - (spacingSm * 2); // subtract left+right padding
    const trayPieceWidth = trayInnerWidth;

    const trayInnerHeight = availableHeight - trayPadding;
    const trayPieceHeight = piecesPerTray > 0
      ? (trayInnerHeight - (piecesPerTray - 1) * trayPieceGap) / piecesPerTray
      : trayInnerHeight;

    // Piece size must work for both grid and trays
    let pieceSize = Math.min(
      gridPieceWidth,
      gridPieceHeight,
      trayPieceWidth,
      trayPieceHeight
    );

    // Ensure minimum touch target size if possible
    const minSize = GAME_CONFIG.MIN_TOUCH_TARGET;
    const gridCanFitMinSize = Math.min(gridPieceWidth, gridPieceHeight) >= minSize;

    if (gridCanFitMinSize) {
      pieceSize = Math.max(pieceSize, minSize);

      // But ensure we don't exceed tray constraints
      pieceSize = Math.min(pieceSize, trayPieceWidth, trayPieceHeight);
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
