import { useState, useCallback } from 'react';
import { convertPesToPen, type PesPatternData } from '../utils/pystitchConverter';
import { MachineStatus } from '../types/machine';
import { canUploadPattern, getMachineStateCategory } from '../utils/machineStateHelpers';

interface FileUploadProps {
  isConnected: boolean;
  machineStatus: MachineStatus;
  uploadProgress: number;
  onPatternLoaded: (pesData: PesPatternData) => void;
  onUpload: (penData: Uint8Array, pesData: PesPatternData, fileName: string, patternOffset?: { x: number; y: number }) => void;
  pyodideReady: boolean;
  patternOffset: { x: number; y: number };
}

export function FileUpload({
  isConnected,
  machineStatus,
  uploadProgress,
  onPatternLoaded,
  onUpload,
  pyodideReady,
  patternOffset,
}: FileUploadProps) {
  const [pesData, setPesData] = useState<PesPatternData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!pyodideReady) {
        alert('Python environment is still loading. Please wait...');
        return;
      }

      setIsLoading(true);
      try {
        const data = await convertPesToPen(file);
        setPesData(data);
        setFileName(file.name);
        onPatternLoaded(data);
      } catch (err) {
        alert(
          `Failed to load PES file: ${
            err instanceof Error ? err.message : 'Unknown error'
          }`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onPatternLoaded, pyodideReady]
  );

  const handleUpload = useCallback(() => {
    if (pesData && fileName) {
      onUpload(pesData.penData, pesData, fileName, patternOffset);
    }
  }, [pesData, fileName, onUpload, patternOffset]);

  return (
    <div className="file-upload-panel">
      <h2>Pattern File</h2>

      <div className="upload-controls">
        <input
          type="file"
          accept=".pes"
          onChange={handleFileChange}
          id="file-input"
          className="file-input"
          disabled={!pyodideReady || isLoading}
        />
        <label htmlFor="file-input" className={`btn-secondary ${!pyodideReady || isLoading ? 'disabled' : ''}`}>
          {isLoading ? 'Loading...' : !pyodideReady ? 'Initializing...' : 'Choose PES File'}
        </label>

        {pesData && (
          <div className="pattern-info">
            <h3>Pattern Details</h3>
            <div className="detail-row">
              <span className="label">Total Stitches:</span>
              <span className="value">{pesData.stitchCount}</span>
            </div>
            <div className="detail-row">
              <span className="label">Colors:</span>
              <span className="value">{pesData.colorCount}</span>
            </div>
            <div className="detail-row">
              <span className="label">Size:</span>
              <span className="value">
                {((pesData.bounds.maxX - pesData.bounds.minX) / 10).toFixed(1)} x{' '}
                {((pesData.bounds.maxY - pesData.bounds.minY) / 10).toFixed(1)} mm
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Bounds:</span>
              <span className="value">
                ({pesData.bounds.minX}, {pesData.bounds.minY}) to (
                {pesData.bounds.maxX}, {pesData.bounds.maxY})
              </span>
            </div>
          </div>
        )}

        {pesData && canUploadPattern(machineStatus) && (
          <button
            onClick={handleUpload}
            disabled={!isConnected || uploadProgress > 0}
            className="btn-primary"
          >
            {uploadProgress > 0
              ? `Uploading... ${uploadProgress.toFixed(0)}%`
              : 'Upload to Machine'}
          </button>
        )}

        {pesData && !canUploadPattern(machineStatus) && (
          <div className="status-message warning">
            Cannot upload pattern while machine is {getMachineStateCategory(machineStatus)}
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
