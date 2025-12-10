import { useState, useEffect } from 'react';
import { InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { MachineStatus } from '../types/machine';
import { getErrorDetails } from '../utils/errorCodeHelpers';

interface NextStepGuideProps {
  machineStatus: MachineStatus;
  isConnected: boolean;
  hasPattern: boolean;
  patternUploaded: boolean;
  hasError: boolean;
  errorMessage?: string;
  errorCode?: number;
}

export function NextStepGuide({
  machineStatus,
  isConnected,
  hasPattern,
  patternUploaded,
  hasError,
  errorMessage,
  errorCode
}: NextStepGuideProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Expand when state changes
  useEffect(() => {
    setIsExpanded(true);
  }, [machineStatus, isConnected, hasPattern, patternUploaded, hasError]);

  // Render guide content based on state
  const renderContent = () => {
    // Don't show if there's an error - show detailed error guidance instead
    if (hasError) {
      const errorDetails = getErrorDetails(errorCode);

      // Check if this is informational (like initialization steps) vs a real error
      if (errorDetails?.isInformational) {
        return (
          <div className="bg-blue-50 dark:bg-blue-900/95 border-l-4 border-blue-600 dark:border-blue-500 p-4 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  {errorDetails.title}
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                  {errorDetails.description}
                </p>
                {errorDetails.solutions && errorDetails.solutions.length > 0 && (
                  <>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">Steps:</h4>
                    <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1.5">
                      {errorDetails.solutions.map((solution, index) => (
                        <li key={index} className="pl-2">{solution}</li>
                      ))}
                    </ol>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Regular error display for actual errors
      return (
        <div className="bg-red-50 dark:bg-red-900/95 border-l-4 border-red-600 dark:border-red-500 p-4 rounded-lg shadow-lg backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-red-900 dark:text-red-200 mb-2">
                {errorDetails?.title || 'Error Occurred'}
              </h3>
              <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                {errorDetails?.description || errorMessage || 'An error occurred. Please check the machine and try again.'}
              </p>
              {errorDetails?.solutions && errorDetails.solutions.length > 0 && (
                <>
                  <h4 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">How to Fix:</h4>
                  <ol className="list-decimal list-inside text-sm text-red-700 dark:text-red-300 space-y-1.5">
                    {errorDetails.solutions.map((solution, index) => (
                      <li key={index} className="pl-2">{solution}</li>
                    ))}
                  </ol>
                </>
              )}
              {errorCode !== undefined && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-3 font-mono">
                  Error Code: 0x{errorCode.toString(16).toUpperCase().padStart(2, '0')}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Determine what to show based on current state
    if (!isConnected) {
      return (
        <div className="bg-blue-50 dark:bg-blue-900/95 border-l-4 border-blue-600 dark:border-blue-500 p-4 rounded-lg shadow-lg backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-2">Step 1: Connect to Machine</h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">To get started, connect to your Brother embroidery machine via Bluetooth.</p>
              <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>Make sure your machine is powered on</li>
                <li>Enable Bluetooth on your machine</li>
                <li>Click the "Connect to Machine" button below</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (!hasPattern) {
      return (
        <div className="bg-blue-50 dark:bg-blue-900/95 border-l-4 border-blue-600 dark:border-blue-500 p-4 rounded-lg shadow-lg backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-2">Step 2: Load Your Pattern</h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">Choose a PES embroidery file from your computer to preview and upload.</p>
              <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>Click "Choose PES File" in the Pattern File section</li>
                <li>Select your embroidery design (.pes file)</li>
                <li>Review the pattern preview on the right</li>
                <li>You can drag the pattern to adjust its position</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (!patternUploaded) {
      return (
        <div className="bg-blue-50 dark:bg-blue-900/95 border-l-4 border-blue-600 dark:border-blue-500 p-4 rounded-lg shadow-lg backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-2">Step 3: Upload Pattern to Machine</h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">Send your pattern to the embroidery machine to prepare for sewing.</p>
              <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>Review the pattern preview to ensure it's positioned correctly</li>
                <li>Check the pattern size matches your hoop</li>
                <li>Click "Upload to Machine" when ready</li>
                <li>Wait for the upload to complete (this may take a minute)</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // Pattern is uploaded, guide based on machine status
    switch (machineStatus) {
      case MachineStatus.IDLE:
        return (
          <div className="bg-blue-50 dark:bg-blue-900/95 border-l-4 border-blue-600 dark:border-blue-500 p-4 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-2">Step 4: Start Mask Trace</h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">The mask trace helps the machine understand the pattern boundaries.</p>
                <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>Click "Start Mask Trace" button in the Sewing Progress section</li>
                  <li>The machine will trace the pattern outline</li>
                  <li>This ensures the hoop is positioned correctly</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case MachineStatus.MASK_TRACE_LOCK_WAIT:
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/95 border-l-4 border-yellow-600 dark:border-yellow-500 p-4 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Machine Action Required</h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">The machine is ready to trace the pattern outline.</p>
                <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li><strong>Press the button on your machine</strong> to confirm and start the mask trace</li>
                  <li>Ensure the hoop is properly attached</li>
                  <li>Make sure the needle area is clear</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case MachineStatus.MASK_TRACING:
        return (
          <div className="bg-cyan-50 dark:bg-cyan-900/95 border-l-4 border-cyan-600 dark:border-cyan-500 p-4 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-cyan-900 dark:text-cyan-200 mb-2">Mask Trace In Progress</h3>
                <p className="text-sm text-cyan-800 dark:text-cyan-300 mb-3">The machine is tracing the pattern boundary. Please wait...</p>
                <ul className="list-disc list-inside text-sm text-cyan-700 dark:text-cyan-300 space-y-1">
                  <li>Watch the machine trace the outline</li>
                  <li>Verify the pattern fits within your hoop</li>
                  <li>Do not interrupt the machine</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case MachineStatus.MASK_TRACE_COMPLETE:
      case MachineStatus.SEWING_WAIT:
        return (
          <div className="bg-green-50 dark:bg-green-900/95 border-l-4 border-green-600 dark:border-green-500 p-4 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-green-900 dark:text-green-200 mb-2">Step 5: Ready to Sew!</h3>
                <p className="text-sm text-green-800 dark:text-green-300 mb-3">The machine is ready to begin embroidering your pattern.</p>
                <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>Verify your thread colors are correct</li>
                  <li>Ensure the fabric is properly hooped</li>
                  <li>Click "Start Sewing" when ready</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case MachineStatus.SEWING:
        return (
          <div className="bg-cyan-50 dark:bg-cyan-900/95 border-l-4 border-cyan-600 dark:border-cyan-500 p-4 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-cyan-900 dark:text-cyan-200 mb-2">Step 6: Sewing In Progress</h3>
                <p className="text-sm text-cyan-800 dark:text-cyan-300 mb-3">Your embroidery is being stitched. Monitor the progress below.</p>
                <ul className="list-disc list-inside text-sm text-cyan-700 dark:text-cyan-300 space-y-1">
                  <li>Watch the progress bar and current stitch count</li>
                  <li>The machine will pause when a color change is needed</li>
                  <li>Do not leave the machine unattended</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case MachineStatus.COLOR_CHANGE_WAIT:
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/95 border-l-4 border-yellow-600 dark:border-yellow-500 p-4 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Thread Change Required</h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">The machine needs a different thread color to continue.</p>
                <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>Check the color blocks section to see which thread is needed</li>
                  <li>Change to the correct thread color</li>
                  <li><strong>Press the button on your machine</strong> to resume sewing</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case MachineStatus.PAUSE:
      case MachineStatus.STOP:
      case MachineStatus.SEWING_INTERRUPTION:
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/95 border-l-4 border-yellow-600 dark:border-yellow-500 p-4 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Sewing Paused</h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">The embroidery has been paused or interrupted.</p>
                <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>Check if everything is okay with the machine</li>
                  <li>Click "Resume Sewing" when ready to continue</li>
                  <li>The machine will pick up where it left off</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case MachineStatus.SEWING_COMPLETE:
        return (
          <div className="bg-green-50 dark:bg-green-900/95 border-l-4 border-green-600 dark:border-green-500 p-4 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-green-900 dark:text-green-200 mb-2">Step 7: Embroidery Complete!</h3>
                <p className="text-sm text-green-800 dark:text-green-300 mb-3">Your embroidery is finished. Great work!</p>
                <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>Remove the hoop from the machine</li>
                  <li>Press the Accept button on the machine</li>
                  <li>Carefully remove your finished embroidery</li>
                  <li>Trim any jump stitches or loose threads</li>
                  <li>Click "Delete Pattern" to start a new project</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render floating overlay
  return (
    <>
      {/* Collapsed state - small info button in bottom-right */}
      {!isExpanded && (
        <div className="fixed bottom-4 right-4 z-50 animate-fadeIn">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-12 h-12 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 animate-pulse"
            aria-label="Show next step guide"
            title="Show next step guide"
          >
            <InformationCircleIcon className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* Expanded state - floating overlay */}
      {isExpanded && (
        <div className="fixed bottom-4 right-4 z-50 w-[90vw] max-w-[400px] max-h-[40vh] overflow-y-auto animate-slideInRight">
          <div className="relative rounded-lg overflow-hidden shadow-xl">
            {/* Close button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors shadow-md"
              aria-label="Minimize guide"
              title="Minimize guide"
            >
              <XMarkIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Content */}
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
