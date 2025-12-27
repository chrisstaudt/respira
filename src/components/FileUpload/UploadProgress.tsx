/**
 * UploadProgress Component
 *
 * Renders upload progress bar
 */

import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  isUploading: boolean;
  uploadProgress: number;
}

export function UploadProgress({
  isUploading,
  uploadProgress,
}: UploadProgressProps) {
  if (!isUploading || uploadProgress >= 100) return null;

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Uploading
        </span>
        <span className="text-xs font-bold text-secondary-600 dark:text-secondary-400">
          {uploadProgress > 0 ? uploadProgress.toFixed(1) + "%" : "Starting..."}
        </span>
      </div>
      <Progress
        value={uploadProgress}
        className="h-2.5 [&>div]:bg-gradient-to-r [&>div]:from-secondary-500 [&>div]:via-secondary-600 [&>div]:to-secondary-700 dark:[&>div]:from-secondary-600 dark:[&>div]:via-secondary-700 dark:[&>div]:to-secondary-800"
      />
    </div>
  );
}
