/**
 * Convert stitch count to minutes using Brother PP1 timing formula
 * Formula: ((pointCount - 1) * 150 + 3000) / 60000
 * - 150ms per stitch
 * - 3000ms startup time
 * - Result in minutes (rounded up)
 */
export function convertStitchesToMinutes(
  stitchCount: number,
  logPrefix = "",
): number {
  if (stitchCount <= 1) {
    console.log(
      `${logPrefix}[convertStitchesToMinutes] stitchCount=${stitchCount} <= 1, returning 0`,
    );
    return 0;
  }

  const timeMs = (stitchCount - 1) * 150 + 3000;
  const timeMin = Math.ceil(timeMs / 60000);
  const result = timeMin < 1 ? 1 : timeMin;

  console.log(
    `${logPrefix}[convertStitchesToMinutes] stitchCount=${stitchCount}, timeMs=${timeMs}, timeMin=${timeMin}, result=${result}`,
  );

  return result;
}

/**
 * Calculate total and elapsed time for a pattern based on color blocks
 * This matches the Brother app's calculation method
 */
export function calculatePatternTime(
  colorBlocks: Array<{ stitchCount: number }>,
  currentStitch: number,
): {
  totalMinutes: number;
  elapsedMinutes: number;
  remainingMinutes: number;
} {
  console.log(
    `\n[calculatePatternTime] Starting calculation with ${colorBlocks.length} blocks, currentStitch=${currentStitch}`,
  );

  // Step 1: Calculate total time for ALL blocks
  console.log("\n[calculatePatternTime] STEP 1: Calculating total time");
  let totalMinutes = 0;
  for (let i = 0; i < colorBlocks.length; i++) {
    const block = colorBlocks[i];
    const blockTime = convertStitchesToMinutes(
      block.stitchCount,
      `  Total Block ${i + 1} `,
    );
    totalMinutes += blockTime;
    console.log(
      `  [calculatePatternTime] Block ${i + 1}: ${block.stitchCount} stitches = ${blockTime} min. Total now: ${totalMinutes} min`,
    );
  }
  console.log(
    `[calculatePatternTime] Total time for all blocks: ${totalMinutes} min`,
  );

  // Step 2: Calculate elapsed time based on currentStitch
  console.log(
    `\n[calculatePatternTime] STEP 2: Calculating elapsed time for currentStitch=${currentStitch}`,
  );
  let elapsedMinutes = 0;
  let cumulativeStitches = 0;

  for (let i = 0; i < colorBlocks.length; i++) {
    const block = colorBlocks[i];
    const prevCumulativeStitches = cumulativeStitches;
    cumulativeStitches += block.stitchCount;

    console.log(
      `\n[calculatePatternTime] Block ${i + 1}/${colorBlocks.length}: stitchCount=${block.stitchCount}`,
    );
    console.log(
      `  [calculatePatternTime] Cumulative stitches: ${prevCumulativeStitches} + ${block.stitchCount} = ${cumulativeStitches}`,
    );

    if (cumulativeStitches < currentStitch) {
      // This entire block is completed
      console.log(
        `  [calculatePatternTime] Block completed (${cumulativeStitches} < ${currentStitch})`,
      );
      const elapsed = convertStitchesToMinutes(
        block.stitchCount,
        `  Elapsed Block ${i + 1} `,
      );
      elapsedMinutes += elapsed;
      console.log(
        `  [calculatePatternTime] Added ${elapsed} min to elapsed. Elapsed now: ${elapsedMinutes} min`,
      );
    } else if (cumulativeStitches === currentStitch) {
      // We just completed this block
      console.log(
        `  [calculatePatternTime] Block just completed (${cumulativeStitches} === ${currentStitch})`,
      );
      const elapsed = convertStitchesToMinutes(
        block.stitchCount,
        `  Elapsed Block ${i + 1} `,
      );
      elapsedMinutes += elapsed;
      console.log(
        `  [calculatePatternTime] Added ${elapsed} min to elapsed. Elapsed now: ${elapsedMinutes} min`,
      );
      console.log(
        `  [calculatePatternTime] Breaking elapsed calculation at block ${i + 1}`,
      );
      break;
    } else {
      // We're partway through this block (or haven't started)
      const stitchesInBlock =
        currentStitch - (cumulativeStitches - block.stitchCount);
      console.log(
        `  [calculatePatternTime] Partway through block (${cumulativeStitches} > ${currentStitch})`,
      );
      console.log(
        `  [calculatePatternTime] Stitches in this block: ${currentStitch} - ${cumulativeStitches - block.stitchCount} = ${stitchesInBlock}`,
      );
      const elapsed = convertStitchesToMinutes(
        stitchesInBlock,
        `  Elapsed Partial Block ${i + 1} `,
      );
      elapsedMinutes += elapsed;
      console.log(
        `  [calculatePatternTime] Added ${elapsed} min to elapsed. Elapsed now: ${elapsedMinutes} min`,
      );
      console.log(
        `  [calculatePatternTime] Breaking elapsed calculation at block ${i + 1}`,
      );
      break;
    }
  }

  const result = {
    totalMinutes,
    elapsedMinutes,
    remainingMinutes: Math.max(0, totalMinutes - elapsedMinutes),
  };

  console.log(`\n[calculatePatternTime] Final result:`, result);
  console.log(
    `  Total: ${result.totalMinutes} min, Elapsed: ${result.elapsedMinutes} min, Remaining: ${result.remainingMinutes} min\n`,
  );

  return result;
}

/**
 * Format minutes as MM:SS
 */
export function formatMinutes(minutes: number): string {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
