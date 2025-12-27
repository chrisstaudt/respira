/**
 * ProgressStats Component
 *
 * Displays three stat cards: total stitches, total time, and speed
 */

interface ProgressStatsProps {
  totalStitches: number;
  totalMinutes: number;
  speed: number;
}

export function ProgressStats({
  totalStitches,
  totalMinutes,
  speed,
}: ProgressStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
      <div className="bg-gray-200 dark:bg-gray-700/50 p-2 rounded">
        <span className="text-gray-600 dark:text-gray-400 block">
          Total Stitches
        </span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {totalStitches.toLocaleString()}
        </span>
      </div>
      <div className="bg-gray-200 dark:bg-gray-700/50 p-2 rounded">
        <span className="text-gray-600 dark:text-gray-400 block">
          Total Time
        </span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {totalMinutes} min
        </span>
      </div>
      <div className="bg-gray-200 dark:bg-gray-700/50 p-2 rounded">
        <span className="text-gray-600 dark:text-gray-400 block">Speed</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {speed} spm
        </span>
      </div>
    </div>
  );
}
