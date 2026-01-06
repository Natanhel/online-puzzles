import { useState, useRef, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';
import { GAME_CONFIG } from '../constants/gameConfig.js';

/**
 * Hook for handling drag and drop with touch and mouse support
 * Optimized for kids aged 2-5
 */
export function useDragAndDrop() {
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dropTargetRef = useRef(null);

  /**
   * Start dragging a piece
   */
  const startDrag = useCallback((piece, initialPosition) => {
    setDraggedPiece(piece);
    setDragPosition(initialPosition);
    setIsDragging(true);
  }, []);

  /**
   * Update drag position
   */
  const updateDragPosition = useCallback((position) => {
    setDragPosition(position);
  }, []);

  /**
   * End drag and return the drop target position
   */
  const endDrag = useCallback(() => {
    const target = dropTargetRef.current;
    setIsDragging(false);
    setDraggedPiece(null);
    setDragPosition({ x: 0, y: 0 });
    return target;
  }, []);

  /**
   * Set the current drop target
   */
  const setDropTarget = useCallback((position) => {
    dropTargetRef.current = position;
  }, []);

  /**
   * Find drop zone at given coordinates
   */
  const findDropZoneAt = useCallback((x, y) => {
    // Get all drop zones
    const dropZones = document.querySelectorAll('.drop-zone');

    for (const zone of dropZones) {
      const rect = zone.getBoundingClientRect();

      // Check if point is within zone bounds (with some tolerance)
      const tolerance = GAME_CONFIG.SNAP_TOLERANCE;
      if (
        x >= rect.left - tolerance &&
        x <= rect.right + tolerance &&
        y >= rect.top - tolerance &&
        y <= rect.bottom + tolerance
      ) {
        const row = parseInt(zone.dataset.row, 10);
        const col = parseInt(zone.dataset.col, 10);
        return { row, col };
      }
    }

    return null;
  }, []);

  /**
   * Create drag gesture bindings for a piece
   */
  const createDragBinding = useCallback((piece, onDrop) => {
    return useDrag(
      ({ active, movement: [mx, my], initial: [ix, iy], xy: [x, y] }) => {
        if (active) {
          // Dragging is active
          if (!isDragging) {
            startDrag(piece, { x: ix, y: iy });
          }

          // Update position as user drags
          updateDragPosition({ x: ix + mx, y: iy + my });

          // Find potential drop target
          const dropZone = findDropZoneAt(x, y);
          setDropTarget(dropZone);
        } else {
          // Drag ended
          const dropZone = findDropZoneAt(x, y);

          if (dropZone && onDrop) {
            onDrop(piece, dropZone);
          }

          endDrag();
        }
      },
      {
        filterTaps: true, // Don't trigger drag on taps
        pointer: { touch: true }, // Enable touch events
        threshold: GAME_CONFIG.DRAG_THRESHOLD, // Movement threshold before drag starts
      }
    );
  }, [isDragging, startDrag, updateDragPosition, findDropZoneAt, setDropTarget, endDrag]);

  return {
    draggedPiece,
    dragPosition,
    isDragging,
    dropTarget: dropTargetRef.current,
    createDragBinding,
    findDropZoneAt,
  };
}

export default useDragAndDrop;
