import { useState, useEffect, useCallback } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig.js';

/**
 * Hook to calculate responsive grid dimensions that fit the screen
 * @param {number} rows - Number of rows in the puzzle
 * @param {number} cols - Number of columns in the puzzle
 * @returns {Object} Grid dimensions and piece size
 */
export function useResponsiveGrid(rows, cols) {
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
    // - Top area: progress bar and title (~120px)
    // - Side trays: left and right (~15% each = 30% total)
    // - Padding: 20px on each side
    const topReserved = 120;
    const sideTraysPercent = 0.35; // 35% total for both side trays plus gaps
    const padding = 20;

    // Available space for the grid (70% of width for center grid)
    const availableWidth = (viewportWidth * (1 - sideTraysPercent)) - (padding * 2);
    const availableHeight = viewportHeight - topReserved - (padding * 2);

    // Calculate piece size based on grid
    const pieceWidth = availableWidth / cols;
    const pieceHeight = availableHeight / rows;

    // Use the smaller dimension to ensure grid fits
    let pieceSize = Math.min(pieceWidth, pieceHeight);

    // Ensure minimum touch target size
    const minSize = GAME_CONFIG.MIN_TOUCH_TARGET;
    pieceSize = Math.max(pieceSize, minSize);

    // If pieces are too large for the screen with minimum size, scale down
    const gridWidth = pieceSize * cols;
    const gridHeight = pieceSize * rows;

    if (gridWidth > availableWidth || gridHeight > availableHeight) {
      // Recalculate with forced fit
      pieceSize = Math.min(availableWidth / cols, availableHeight / rows);
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
  }, [rows, cols]);

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
