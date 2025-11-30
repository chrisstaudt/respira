import { useEffect, useRef } from 'react';
import type { PesPatternData } from '../utils/pystitchConverter';
import { getThreadColor } from '../utils/pystitchConverter';
import type { SewingProgress, MachineInfo } from '../types/machine';

interface PatternCanvasProps {
  pesData: PesPatternData | null;
  sewingProgress: SewingProgress | null;
  machineInfo: MachineInfo | null;
}

export function PatternCanvas({ pesData, sewingProgress, machineInfo }: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !pesData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentStitch = sewingProgress?.currentStitch || 0;

    const { stitches, bounds } = pesData;
    const { minX, maxX, minY, maxY } = bounds;
    const patternWidth = maxX - minX;
    const patternHeight = maxY - minY;

    const padding = 40;

    // Calculate scale based on hoop size if available, otherwise pattern size
    let scale: number;
    let viewWidth: number;
    let viewHeight: number;

    if (machineInfo) {
      // Use hoop dimensions to determine scale
      viewWidth = machineInfo.maxWidth;
      viewHeight = machineInfo.maxHeight;
    } else {
      // Fallback to pattern dimensions
      viewWidth = patternWidth;
      viewHeight = patternHeight;
    }

    const scaleX = (canvas.width - 2 * padding) / viewWidth;
    const scaleY = (canvas.height - 2 * padding) / viewHeight;
    scale = Math.min(scaleX, scaleY);

    // Center the view (hoop or pattern) in canvas
    // The origin (0,0) should be at the center of the hoop
    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 2;

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    const gridSize = 100; // 10mm grid (100 units in 0.1mm)

    // Determine grid bounds based on hoop or pattern
    const gridMinX = machineInfo ? -machineInfo.maxWidth / 2 : minX;
    const gridMaxX = machineInfo ? machineInfo.maxWidth / 2 : maxX;
    const gridMinY = machineInfo ? -machineInfo.maxHeight / 2 : minY;
    const gridMaxY = machineInfo ? machineInfo.maxHeight / 2 : maxY;

    for (let x = Math.floor(gridMinX / gridSize) * gridSize; x <= gridMaxX; x += gridSize) {
      const canvasX = x * scale + offsetX;
      ctx.beginPath();
      ctx.moveTo(canvasX, padding);
      ctx.lineTo(canvasX, canvas.height - padding);
      ctx.stroke();
    }
    for (let y = Math.floor(gridMinY / gridSize) * gridSize; y <= gridMaxY; y += gridSize) {
      const canvasY = y * scale + offsetY;
      ctx.beginPath();
      ctx.moveTo(padding, canvasY);
      ctx.lineTo(canvas.width - padding, canvasY);
      ctx.stroke();
    }

    // Draw origin
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(offsetX - 10, offsetY);
    ctx.lineTo(offsetX + 10, offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY - 10);
    ctx.lineTo(offsetX, offsetY + 10);
    ctx.stroke();

    // Draw hoop boundary (if machine info available)
    if (machineInfo) {
      // Machine info stores dimensions in 0.1mm units
      const hoopWidth = machineInfo.maxWidth;
      const hoopHeight = machineInfo.maxHeight;

      // Hoop is centered at origin (0, 0)
      const hoopLeft = -hoopWidth / 2;
      const hoopTop = -hoopHeight / 2;
      const hoopRight = hoopWidth / 2;
      const hoopBottom = hoopHeight / 2;

      // Draw hoop boundary
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(
        hoopLeft * scale + offsetX,
        hoopTop * scale + offsetY,
        hoopWidth * scale,
        hoopHeight * scale
      );

      // Draw hoop label
      ctx.setLineDash([]);
      ctx.fillStyle = '#2196F3';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(
        `Hoop: ${(hoopWidth / 10).toFixed(0)} x ${(hoopHeight / 10).toFixed(0)} mm`,
        hoopLeft * scale + offsetX + 10,
        hoopTop * scale + offsetY + 25
      );
    }

    // Draw stitches
    // stitches is number[][], each stitch is [x, y, command, colorIndex]
    const MOVE = 0x10;

    ctx.lineWidth = 1.5;
    let lastX = 0;
    let lastY = 0;
    let threadColor = getThreadColor(pesData, 0);
    let currentPosX = 0;
    let currentPosY = 0;

    for (let i = 0; i < stitches.length; i++) {
      const stitch = stitches[i];
      const x = stitch[0] * scale + offsetX;
      const y = stitch[1] * scale + offsetY;
      const cmd = stitch[2];
      const colorIndex = stitch[3]; // Color index from PyStitch

      // Update thread color based on stitch's color index
      threadColor = getThreadColor(pesData, colorIndex);

      // Track current position for highlighting
      if (i === currentStitch) {
        currentPosX = x;
        currentPosY = y;
      }

      if (i > 0) {
        const isCompleted = i < currentStitch;
        const isCurrent = i === currentStitch;

        if ((cmd & MOVE) !== 0) {
          // Draw jump as dashed line
          ctx.strokeStyle = isCompleted ? '#cccccc' : '#e8e8e8';
          ctx.setLineDash([3, 3]);
        } else {
          // Draw stitch as solid line with actual thread color
          // Dim pending stitches
          if (isCompleted) {
            ctx.strokeStyle = threadColor;
            ctx.globalAlpha = 1.0;
          } else {
            ctx.strokeStyle = threadColor;
            ctx.globalAlpha = 0.3;
          }
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      lastX = x;
      lastY = y;
    }

    // Draw current position indicator
    if (currentStitch > 0 && currentStitch < stitches.length) {
      // Draw a pulsing circle at current position
      ctx.strokeStyle = '#ff0000';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(currentPosX, currentPosY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Draw crosshair
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentPosX - 12, currentPosY);
      ctx.lineTo(currentPosX - 3, currentPosY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(currentPosX + 12, currentPosY);
      ctx.lineTo(currentPosX + 3, currentPosY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(currentPosX, currentPosY - 12);
      ctx.lineTo(currentPosX, currentPosY - 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(currentPosX, currentPosY + 12);
      ctx.lineTo(currentPosX, currentPosY + 3);
      ctx.stroke();
    }

    // Draw bounds
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      minX * scale + offsetX,
      minY * scale + offsetY,
      patternWidth * scale,
      patternHeight * scale
    );

    // Draw color legend using actual thread colors
    ctx.setLineDash([]);
    let legendY = 20;

    // Draw legend for each thread
    for (let i = 0; i < pesData.threads.length; i++) {
      const color = getThreadColor(pesData, i);

      ctx.fillStyle = color;
      ctx.fillRect(10, legendY, 20, 20);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, legendY, 20, 20);

      ctx.fillStyle = '#000';
      ctx.font = '12px sans-serif';
      ctx.fillText(
        `Thread ${i + 1}`,
        35,
        legendY + 15
      );
      legendY += 25;
    }

    // Draw dimensions
    ctx.fillStyle = '#000';
    ctx.font = '14px sans-serif';
    ctx.fillText(
      `${(patternWidth / 10).toFixed(1)} x ${(patternHeight / 10).toFixed(1)} mm`,
      canvas.width - 120,
      canvas.height - 10
    );
  }, [pesData, sewingProgress, machineInfo]);

  return (
    <div className="canvas-panel">
      <h2>Pattern Preview</h2>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="pattern-canvas"
      />
      {!pesData && (
        <div className="canvas-placeholder">
          Load a PES file to preview the pattern
        </div>
      )}
    </div>
  );
}
