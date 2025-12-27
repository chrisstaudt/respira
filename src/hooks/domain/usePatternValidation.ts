import { useMemo } from "react";
import type { PesPatternData } from "../../formats/import/pesImporter";
import type { MachineInfo } from "../../types/machine";
import { usePatternValidationFromStore } from "../../stores/usePatternStore";

export interface PatternBoundsCheckResult {
  fits: boolean;
  error: string | null;
}

export interface UsePatternValidationParams {
  pesData: PesPatternData | null;
  machineInfo: MachineInfo | null;
  // Note: patternOffset and patternRotation are read from the store
  // These params are kept for backward compatibility but are not used
  patternOffset?: { x: number; y: number };
  patternRotation?: number;
}

/**
 * Custom hook for validating pattern bounds against hoop size
 *
 * Checks if the pattern (with rotation and offset applied) fits within
 * the machine's hoop bounds and provides detailed error messages if not.
 *
 * This hook now uses the computed selector from the pattern store for
 * consistent validation logic across the application.
 *
 * @param params - Pattern and machine configuration
 * @returns Bounds check result with fit status and error message
 */
export function usePatternValidation({
  pesData,
  machineInfo,
}: UsePatternValidationParams): PatternBoundsCheckResult {
  // Use the computed selector from the store for validation
  // The store selector uses the current state (patternOffset, patternRotation)
  const validationFromStore = usePatternValidationFromStore(
    machineInfo
      ? { maxWidth: machineInfo.maxWidth, maxHeight: machineInfo.maxHeight }
      : null,
  );

  // Memoize the result to avoid unnecessary recalculations
  return useMemo((): PatternBoundsCheckResult => {
    if (!pesData || !machineInfo) {
      return { fits: true, error: null };
    }

    // Use the validation from store which already has all the logic
    return {
      fits: validationFromStore.fits,
      error: validationFromStore.error,
    };
  }, [
    pesData,
    machineInfo,
    validationFromStore.fits,
    validationFromStore.error,
  ]);
}
