import { useState, useEffect } from 'react';
import { useBrotherMachine } from './hooks/useBrotherMachine';
import { MachineConnection } from './components/MachineConnection';
import { FileUpload } from './components/FileUpload';
import { PatternCanvas } from './components/PatternCanvas';
import { ProgressMonitor } from './components/ProgressMonitor';
import type { PesPatternData } from './utils/pystitchConverter';
import { pyodideLoader } from './utils/pyodideLoader';
import './App.css';

function App() {
  const machine = useBrotherMachine();
  const [pesData, setPesData] = useState<PesPatternData | null>(null);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [pyodideError, setPyodideError] = useState<string | null>(null);

  // Initialize Pyodide on mount
  useEffect(() => {
    pyodideLoader
      .initialize()
      .then(() => {
        setPyodideReady(true);
        console.log('[App] Pyodide initialized successfully');
      })
      .catch((err) => {
        setPyodideError(err instanceof Error ? err.message : 'Failed to initialize Python environment');
        console.error('[App] Failed to initialize Pyodide:', err);
      });
  }, []);

  // Auto-load cached pattern when available
  useEffect(() => {
    if (machine.resumedPattern && !pesData) {
      console.log('[App] Loading resumed pattern:', machine.resumeFileName);
      setPesData(machine.resumedPattern);
    }
  }, [machine.resumedPattern, pesData, machine.resumeFileName]);

  const handlePatternLoaded = (data: PesPatternData) => {
    setPesData(data);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Brother Embroidery Machine Controller</h1>
        {machine.error && (
          <div className="error-message">{machine.error}</div>
        )}
        {pyodideError && (
          <div className="error-message">Python Error: {pyodideError}</div>
        )}
        {!pyodideReady && !pyodideError && (
          <div className="info-message">Initializing Python environment...</div>
        )}
      </header>

      <div className="app-content">
        <div className="left-panel">
          <MachineConnection
            isConnected={machine.isConnected}
            machineInfo={machine.machineInfo}
            machineStatus={machine.machineStatus}
            machineStatusName={machine.machineStatusName}
            machineError={machine.machineError}
            isPolling={machine.isPolling}
            resumeAvailable={machine.resumeAvailable}
            resumeFileName={machine.resumeFileName}
            onConnect={machine.connect}
            onDisconnect={machine.disconnect}
            onRefresh={machine.refreshStatus}
          />

          <FileUpload
            isConnected={machine.isConnected}
            machineStatus={machine.machineStatus}
            uploadProgress={machine.uploadProgress}
            onPatternLoaded={handlePatternLoaded}
            onUpload={machine.uploadPattern}
            pyodideReady={pyodideReady}
          />

          <ProgressMonitor
            machineStatus={machine.machineStatus}
            patternInfo={machine.patternInfo}
            sewingProgress={machine.sewingProgress}
            pesData={pesData}
            onStartMaskTrace={machine.startMaskTrace}
            onStartSewing={machine.startSewing}
            onResumeSewing={machine.resumeSewing}
            onDeletePattern={machine.deletePattern}
          />
        </div>

        <div className="right-panel">
          <PatternCanvas
            pesData={pesData}
            sewingProgress={machine.sewingProgress}
            machineInfo={machine.machineInfo}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
