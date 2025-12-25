/**
 * Utility functions for PatternCanvas operations
 */

import type { DecodedPenData } from "../../formats/pen/types";

/**
 * Calculate the geometric center of a pattern's bounds
 */
export function calculatePatternCenter(bounds: {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}): { x: number; y: number } {
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
}

/**
 * Convert PEN stitch format to PES stitch format
 * PEN: {x, y, flags, isJump}
 * PES: [x, y, cmd, colorIndex]
 */
export function convertPenStitchesToPesFormat(
  penStitches: DecodedPenData,
): [number, number, number, number][] {
  return penStitches.stitches.map((s, i) => {
    const cmd = s.isJump ? 0x10 : 0; // MOVE flag if jump
    const colorIndex =
      penStitches.colorBlocks.find(
        (b) => i >= b.startStitch && i <= b.endStitch,
      )?.colorIndex ?? 0;
    return [s.x, s.y, cmd, colorIndex];
  });
}

/**
 * Calculate new stage position for zooming towards a specific point
 * Used for both wheel zoom and button zoom operations
 */
export function calculateZoomToPoint(
  oldScale: number,
  newScale: number,
  targetPoint: { x: number; y: number },
  currentPos: { x: number; y: number },
): { x: number; y: number } {
  const mousePointTo = {
    x: (targetPoint.x - currentPos.x) / oldScale,
    y: (targetPoint.y - currentPos.y) / oldScale,
  };

  return {
    x: targetPoint.x - mousePointTo.x * newScale,
    y: targetPoint.y - mousePointTo.y * newScale,
  };
}
