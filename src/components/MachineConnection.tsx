import { useState } from 'react';
import type { MachineInfo } from '../types/machine';
import { MachineStatus } from '../types/machine';
import { ConfirmDialog } from './ConfirmDialog';
import { shouldConfirmDisconnect, getStateVisualInfo } from '../utils/machineStateHelpers';
import { hasError, getErrorMessage } from '../utils/errorCodeHelpers';

interface MachineConnectionProps {
  isConnected: boolean;
  machineInfo: MachineInfo | null;
  machineStatus: MachineStatus;
  machineStatusName: string;
  machineError: number;
  isPolling: boolean;
  resumeAvailable: boolean;
  resumeFileName: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}

export function MachineConnection({
  isConnected,
  machineInfo,
  machineStatus,
  machineStatusName,
  machineError,
  isPolling,
  resumeAvailable,
  resumeFileName,
  onConnect,
  onDisconnect,
  onRefresh,
}: MachineConnectionProps) {
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const handleDisconnectClick = () => {
    if (shouldConfirmDisconnect(machineStatus)) {
      setShowDisconnectConfirm(true);
    } else {
      onDisconnect();
    }
  };

  const handleConfirmDisconnect = () => {
    setShowDisconnectConfirm(false);
    onDisconnect();
  };

  const stateVisual = getStateVisualInfo(machineStatus);

  return (
    <div className="connection-panel">
      <h2>Machine Connection</h2>

      {!isConnected ? (
        <div className="connection-actions">
          <button onClick={onConnect} className="btn-primary">
            Connect to Machine
          </button>
        </div>
      ) : (
        <div className="connection-info">
          <div className="status-bar">
            <span className={`status-badge status-badge-${stateVisual.color}`}>
              <span className="status-icon">{stateVisual.icon}</span>
              <span className="status-text">{machineStatusName}</span>
            </span>
            {isPolling && (
              <span className="polling-indicator" title="Polling machine status">●</span>
            )}
            {hasError(machineError) && (
              <span className="error-indicator">{getErrorMessage(machineError)}</span>
            )}
          </div>

          {machineInfo && (
            <div className="machine-details">
              <div className="detail-row">
                <span className="label">Model:</span>
                <span className="value">{machineInfo.modelNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Serial:</span>
                <span className="value">{machineInfo.serialNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Software:</span>
                <span className="value">{machineInfo.softwareVersion}</span>
              </div>
              <div className="detail-row">
                <span className="label">Max Area:</span>
                <span className="value">
                  {(machineInfo.maxWidth / 10).toFixed(1)} x{' '}
                  {(machineInfo.maxHeight / 10).toFixed(1)} mm
                </span>
              </div>
              <div className="detail-row">
                <span className="label">MAC:</span>
                <span className="value">{machineInfo.macAddress}</span>
              </div>
            </div>
          )}

          {resumeAvailable && resumeFileName && (
            <div className="status-message success">
              Loaded cached pattern: "{resumeFileName}"
            </div>
          )}

          <div className="connection-actions">
            <button onClick={onRefresh} className="btn-secondary">
              Refresh Status
            </button>
            <button onClick={handleDisconnectClick} className="btn-danger">
              Disconnect
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDisconnectConfirm}
        title="Confirm Disconnect"
        message={`The machine is currently ${machineStatusName.toLowerCase()}. Disconnecting may interrupt the operation. Are you sure you want to disconnect?`}
        confirmText="Disconnect Anyway"
        cancelText="Cancel"
        onConfirm={handleConfirmDisconnect}
        onCancel={() => setShowDisconnectConfirm(false)}
        variant="danger"
      />
    </div>
  );
}
