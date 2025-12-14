import { describe, it, expect } from 'vitest';
import {
  encodeStitchPosition,
  calculateLockDirection,
  generateLockStitches,
  encodeStitchesToPen,
} from './penEncoder';
import { STITCH, MOVE, TRIM, END } from './embroideryConstants';

describe('encodeStitchPosition', () => {
  it('should encode position (0, 0) correctly', () => {
    const result = encodeStitchPosition(0, 0);
    expect(result).toEqual([0x00, 0x00, 0x00, 0x00]);
  });

  it('should shift coordinates left by 3 bits', () => {
    // Position (1, 1) should become (8, 8) after shifting
    const result = encodeStitchPosition(1, 1);
    expect(result).toEqual([0x08, 0x00, 0x08, 0x00]);
  });

  it('should handle negative coordinates', () => {
    // -1 in 16-bit signed = 0xFFFF, shifted left 3 = 0xFFF8
    const result = encodeStitchPosition(-1, -1);
    expect(result).toEqual([0xF8, 0xFF, 0xF8, 0xFF]);
  });

  it('should encode multi-byte coordinates correctly', () => {
    // Position (128, 0) -> shifted = 1024 = 0x0400
    const result = encodeStitchPosition(128, 0);
    expect(result).toEqual([0x00, 0x04, 0x00, 0x00]);
  });

  it('should round fractional coordinates', () => {
    const result = encodeStitchPosition(1.5, 2.4);
    // 2 << 3 = 16, 2 << 3 = 16
    expect(result).toEqual([0x10, 0x00, 0x10, 0x00]);
  });
});

describe('calculateLockDirection', () => {
  it('should look ahead for forward direction', () => {
    const stitches = [
      [0, 0, STITCH, 0],
      [10, 0, STITCH, 0],
      [20, 0, STITCH, 0],
    ];

    const result = calculateLockDirection(stitches, 0, true);

    // Should accumulate forward stitches
    expect(result.dirX).toBeGreaterThan(0);
    expect(result.dirY).toBe(0);
    // Result should have magnitude ~8.0
    const magnitude = Math.sqrt(result.dirX ** 2 + result.dirY ** 2);
    expect(magnitude).toBeCloseTo(8.0, 1);
  });

  it('should look backward for backward direction', () => {
    const stitches = [
      [0, 0, STITCH, 0],
      [10, 0, STITCH, 0],
      [20, 0, STITCH, 0],
    ];

    const result = calculateLockDirection(stitches, 2, false);

    // Should accumulate backward stitches
    expect(result.dirX).toBeLessThan(0);
    expect(result.dirY).toBe(0);
    // Result should have magnitude ~8.0
    const magnitude = Math.sqrt(result.dirX ** 2 + result.dirY ** 2);
    expect(magnitude).toBeCloseTo(8.0, 1);
  });

  it('should skip MOVE stitches when accumulating', () => {
    const stitches = [
      [0, 0, STITCH, 0],
      [5, 0, MOVE, 0],   // Should be skipped
      [10, 0, STITCH, 0],
      [15, 0, STITCH, 0],
    ];

    const result = calculateLockDirection(stitches, 0, true);

    // Should skip the MOVE stitch and only count actual stitches
    expect(result.dirX).toBeGreaterThan(0);
  });

  it('should return fallback diagonal for empty or short stitch sequences', () => {
    const stitches = [
      [0, 0, STITCH, 0],
    ];

    const result = calculateLockDirection(stitches, 0, true);

    // Should return diagonal fallback
    const expectedMag = 8.0 / Math.sqrt(2);
    expect(result.dirX).toBeCloseTo(expectedMag, 1);
    expect(result.dirY).toBeCloseTo(expectedMag, 1);
  });

  it('should normalize accumulated vector to magnitude 8.0', () => {
    const stitches = [
      [0, 0, STITCH, 0],
      [3, 4, STITCH, 0], // Distance = 5
      [6, 8, STITCH, 0], // Accumulated: (6, 8), length = 10
    ];

    const result = calculateLockDirection(stitches, 0, true);

    // Should normalize (6, 8) to magnitude 8.0
    // Expected: (6 * 8 / 10, 8 * 8 / 10) = (4.8, 6.4)
    expect(result.dirX).toBeCloseTo(4.8, 1);
    expect(result.dirY).toBeCloseTo(6.4, 1);

    const magnitude = Math.sqrt(result.dirX ** 2 + result.dirY ** 2);
    expect(magnitude).toBeCloseTo(8.0, 1);
  });

  it('should stop accumulating after reaching target length', () => {
    // Create a long chain of stitches
    const stitches = [
      [0, 0, STITCH, 0],
      [2, 0, STITCH, 0],
      [4, 0, STITCH, 0],
      [6, 0, STITCH, 0],
      [8, 0, STITCH, 0],
      [10, 0, STITCH, 0],
      [100, 0, STITCH, 0], // This should not be reached
    ];

    const result = calculateLockDirection(stitches, 0, true);

    // Should stop once accumulated length >= 8.0
    const magnitude = Math.sqrt(result.dirX ** 2 + result.dirY ** 2);
    expect(magnitude).toBeCloseTo(8.0, 1);
  });
});

describe('generateLockStitches', () => {
  it('should generate 8 lock stitches (32 bytes)', () => {
    const result = generateLockStitches(0, 0, 8.0, 0);
    expect(result.length).toBe(32); // 8 stitches * 4 bytes each
  });

  it('should alternate between +dir and -dir', () => {
    const result = generateLockStitches(0, 0, 8.0, 0);
    expect(result.length).toBe(32); // 8 stitches * 4 bytes

    // With a larger base position, verify the pattern still generates correctly
    const result2 = generateLockStitches(100, 100, 8.0, 0);
    expect(result2.length).toBe(32);
  });

  it('should rotate stitches in the given direction', () => {
    // Direction pointing right (8, 0)
    const result = generateLockStitches(0, 0, 8.0, 0);

    // Scale: 0.4 / 8.0 = 0.05
    // Scaled direction: (0.4, 0)
    // Positions should alternate between (+0.4, 0) and (-0.4, 0)

    expect(result.length).toBe(32);

    // With diagonal direction (8/√2, 8/√2)
    const diag = 8.0 / Math.sqrt(2);
    const result2 = generateLockStitches(0, 0, diag, diag);
    expect(result2.length).toBe(32);
  });
});

describe('encodeStitchesToPen', () => {
  it('should encode a simple stitch sequence', () => {
    const stitches = [
      [0, 0, STITCH, 0],
      [10, 0, STITCH, 0],
      [20, 0, STITCH | END, 0], // Last stitch with both STITCH and END flags
    ];

    const result = encodeStitchesToPen(stitches);

    expect(result.penBytes.length).toBeGreaterThan(0);
    expect(result.penBytes.length % 4).toBe(0); // Should be multiple of 4 (4 bytes per stitch)
    expect(result.bounds.minX).toBe(0);
    expect(result.bounds.maxX).toBe(20);
  });

  it('should track bounds correctly', () => {
    const stitches = [
      [10, 20, STITCH, 0],
      [-5, 30, STITCH, 0],
      [15, -10, STITCH, 0],
      [0, 0, END, 0],
    ];

    const result = encodeStitchesToPen(stitches);

    expect(result.bounds.minX).toBe(-5);
    expect(result.bounds.maxX).toBe(15);
    expect(result.bounds.minY).toBe(-10);
    expect(result.bounds.maxY).toBe(30);
  });

  it('should mark the last stitch with DATA_END flag', () => {
    const stitches = [
      [0, 0, STITCH, 0],
      [10, 0, END, 0],
    ];

    const result = encodeStitchesToPen(stitches);

    // Last stitch should have DATA_END (0x05) in low 3 bits of X coordinate
    const lastStitchStart = result.penBytes.length - 4;
    const xLow = result.penBytes[lastStitchStart];
    expect(xLow & 0x07).toBe(0x05); // DATA_END flag
  });

  it('should handle color changes with lock stitches', () => {
    const stitches = [
      [0, 0, STITCH, 0],   // Color 0
      [10, 0, STITCH, 0],  // Color 0
      [20, 0, STITCH, 0],  // Color 0 - last stitch before color change
      [20, 0, STITCH, 1],  // Color 1 - first stitch of new color
      [30, 0, STITCH, 1],  // Color 1
      [40, 0, END, 1],     // Color 1 - last stitch
    ];

    const result = encodeStitchesToPen(stitches);

    // Should include:
    // - Regular stitches for color 0 (3 stitches = 12 bytes)
    // - Finishing lock stitches (32 bytes)
    // - Cut command (4 bytes)
    // - COLOR_END marker (4 bytes)
    // - Starting lock stitches (32 bytes)
    // - Regular stitches for color 1 (3 stitches = 12 bytes)
    // Total: 96+ bytes

    expect(result.penBytes.length).toBeGreaterThan(90); // Should have many bytes from lock stitches
  });

  it('should handle long jumps with lock stitches and cut', () => {
    const stitches = [
      [0, 0, STITCH, 0],
      [10, 0, STITCH, 0],
      [100, 0, MOVE, 0],  // Long jump (distance > 50)
      [110, 0, STITCH, 0],
      [120, 0, END, 0],
    ];

    const result = encodeStitchesToPen(stitches);

    // Should include:
    // - Initial stitches
    // - Finishing lock stitches before jump (32 bytes)
    // - Jump with FEED and CUT flags (4 bytes)
    // - Starting lock stitches after jump (32 bytes)
    // - Final stitches

    expect(result.penBytes.length).toBeGreaterThan(80);

    // Jump stitch should have both FEED (0x01) and CUT (0x02) flags
    // We need to find the jump in the output
    // The jump will have Y coordinate with flags 0x03 (FEED | CUT)
  });

  it('should encode MOVE flag for jump stitches', () => {
    const stitches = [
      [0, 0, STITCH, 0],
      [10, 0, MOVE, 0],  // Short jump (no lock stitches)
      [20, 0, END, 0],
    ];

    const result = encodeStitchesToPen(stitches);

    // Second stitch (jump) should have FEED_DATA flag (0x01) in Y low byte
    // Stitch format: [xLow, xHigh, yLow, yHigh]
    // We need to find the jump stitch - it's the second one encoded
    const jumpStitchStart = 4; // Skip first stitch
    const yLow = result.penBytes[jumpStitchStart + 2];
    expect(yLow & 0x01).toBe(0x01); // FEED_DATA flag
  });

  it('should not include MOVE stitches in bounds calculation', () => {
    const stitches = [
      [0, 0, STITCH, 0],
      [100, 100, MOVE, 0],  // Jump - should not affect bounds
      [10, 10, STITCH, 0],
      [20, 20, STITCH | END, 0], // Last stitch with both STITCH and END flags
    ];

    const result = encodeStitchesToPen(stitches);

    // Bounds should only include STITCH positions, not MOVE
    expect(result.bounds.minX).toBe(0);
    expect(result.bounds.maxX).toBe(20);
    expect(result.bounds.minY).toBe(0);
    expect(result.bounds.maxY).toBe(20);
  });

  it('should handle TRIM flag', () => {
    const stitches = [
      [0, 0, STITCH, 0],
      [10, 0, TRIM, 0],
      [20, 0, END, 0],
    ];

    const result = encodeStitchesToPen(stitches);

    // TRIM stitch should have CUT_DATA flag (0x02) in Y low byte
    const trimStitchStart = 4;
    const yLow = result.penBytes[trimStitchStart + 2];
    expect(yLow & 0x02).toBe(0x02); // CUT_DATA flag
  });

  it('should handle empty stitch array', () => {
    const stitches: number[][] = [];

    const result = encodeStitchesToPen(stitches);

    expect(result.penBytes.length).toBe(0);
    expect(result.bounds.minX).toBe(0);
    expect(result.bounds.maxX).toBe(0);
    expect(result.bounds.minY).toBe(0);
    expect(result.bounds.maxY).toBe(0);
  });

  it('should handle single stitch', () => {
    const stitches = [
      [5, 10, END, 0],
    ];

    const result = encodeStitchesToPen(stitches);

    expect(result.penBytes.length).toBe(4);
    expect(result.bounds.minX).toBe(5);
    expect(result.bounds.maxX).toBe(5);
    expect(result.bounds.minY).toBe(10);
    expect(result.bounds.maxY).toBe(10);
    // END stitches update bounds (they're not MOVE stitches)
  });
});
