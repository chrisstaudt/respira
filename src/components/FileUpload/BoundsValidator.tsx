/**
 * BoundsValidator Component
 *
 * Renders error/warning messages with smooth transitions
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { MachineStatus } from "../../types/machine";
import {
  canUploadPattern,
  getMachineStateCategory,
} from "../../utils/machineStateHelpers";
import type { PesPatternData } from "../../formats/import/pesImporter";

interface BoundsValidatorProps {
  pesData: PesPatternData | null;
  machineStatus: MachineStatus;
  boundsError: string | null;
}

export function BoundsValidator({
  pesData,
  machineStatus,
  boundsError,
}: BoundsValidatorProps) {
  const hasError = pesData && (boundsError || !canUploadPattern(machineStatus));

  return (
    <div
      className="transition-all duration-200 ease-in-out overflow-hidden"
      style={{
        maxHeight: hasError ? "200px" : "0px",
        marginTop: hasError ? "12px" : "0px",
      }}
    >
      {pesData && !canUploadPattern(machineStatus) && (
        <Alert className="bg-warning-100 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
          <AlertDescription className="text-warning-800 dark:text-warning-200 text-sm">
            Cannot upload while {getMachineStateCategory(machineStatus)}
          </AlertDescription>
        </Alert>
      )}

      {pesData && boundsError && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Pattern too large:</strong> {boundsError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
