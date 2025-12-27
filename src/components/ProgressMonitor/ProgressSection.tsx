/**
 * ProgressSection Component
 *
 * Displays the progress bar and current/total stitch information
 */

import { Progress } from "@/components/ui/progress";

interface ProgressSectionProps {
  currentStitch: number;
  totalStitches: number;
  elapsedMinutes: number;
  totalMinutes: number;
  progressPercent: number;
}

export function ProgressSection({
  currentStitch,
  totalStitches,
  elapsedMinutes,
  totalMinutes,
  progressPercent,
}: ProgressSectionProps) {
  return (
    <div className="mb-3">
      <Progress
        value={progressPercent}
        className="h-3 mb-2 [&>div]:bg-gradient-to-r [&>div]:from-accent-600 [&>div]:to-accent-700 dark:[&>div]:from-accent-600 dark:[&>div]:to-accent-800"
      />

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-gray-200 dark:bg-gray-700/50 p-2 rounded">
          <span className="text-gray-600 dark:text-gray-400 block">
            Current Stitch
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {currentStitch.toLocaleString()} / {totalStitches.toLocaleString()}
          </span>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700/50 p-2 rounded">
          <span className="text-gray-600 dark:text-gray-400 block">Time</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {elapsedMinutes} / {totalMinutes} min
          </span>
        </div>
      </div>
    </div>
  );
}
