import { useEffect, useRef, useState, useCallback } from 'react';
import Konva from 'konva';
import type { PesPatternData } from '../utils/pystitchConverter';
import type { SewingProgress, MachineInfo } from '../types/machine';
import {
  renderGrid,
  renderOrigin,
  renderHoop,
  renderStitches,
  renderPatternBounds,
  renderCurrentPosition,
  calculateInitialScale,
} from '../utils/konvaRenderers';

interface PatternCanvasProps {
  pesData: PesPatternData | null;
  sewingProgress: SewingProgress | null;
  machineInfo: MachineInfo | null;
  onPatternOffsetChange?: (offsetX: number, offsetY: number) => void;
}

export function PatternCanvas({ pesData, sewingProgress, machineInfo, onPatternOffsetChange }: PatternCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const backgroundLayerRef = useRef<Konva.Layer | null>(null);
  const patternLayerRef = useRef<Konva.Layer | null>(null);
  const currentPosLayerRef = useRef<Konva.Layer | null>(null);
  const patternGroupRef = useRef<Konva.Group | null>(null);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [patternOffset, setPatternOffset] = useState({ x: 0, y: 0 });
  const initialScaleRef = useRef<number>(1);
  const isDraggingRef = useRef(false);

  // Initialize Konva stage and layers
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Create stage
    const stage = new Konva.Stage({
      container,
      width: container.offsetWidth,
      height: container.offsetHeight,
      draggable: false, // Stage itself is not draggable
    });

    // Configure stage to center on embroidery origin (0,0)
    // Simply position the stage so that (0,0) appears at the center
    stage.position({ x: stage.width() / 2, y: stage.height() / 2 });

    // Create layers
    const backgroundLayer = new Konva.Layer();
    const patternLayer = new Konva.Layer();
    const currentPosLayer = new Konva.Layer();

    stage.add(backgroundLayer, patternLayer, currentPosLayer);

    // Store refs
    stageRef.current = stage;
    backgroundLayerRef.current = backgroundLayer;
    patternLayerRef.current = patternLayer;
    currentPosLayerRef.current = currentPosLayer;

    // Set initial cursor - grab for panning
    stage.container().style.cursor = 'grab';

    // Make stage draggable for panning
    stage.draggable(true);

    // Update cursor on drag
    stage.on('dragstart', () => {
      stage.container().style.cursor = 'grabbing';
    });

    stage.on('dragend', () => {
      stage.container().style.cursor = 'grab';
    });

    return () => {
      stage.destroy();
    };
  }, []);

  // Handle responsive resizing
  useEffect(() => {
    if (!containerRef.current || !stageRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const stage = stageRef.current;

        if (stage) {
          // Keep the current pan/zoom, just update size
          const oldWidth = stage.width();
          const oldHeight = stage.height();
          const oldPos = stage.position();

          stage.width(width);
          stage.height(height);

          // Adjust position to maintain center point
          stage.position({
            x: oldPos.x + (width - oldWidth) / 2,
            y: oldPos.y + (height - oldHeight) / 2,
          });

          stage.batchDraw();
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Mouse wheel zoom handler
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.1;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Apply constraints
    newScale = Math.max(0.1, Math.min(10, newScale));

    // Zoom towards pointer
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    setZoomLevel(newScale);
    stage.batchDraw();
  }, []);

  // Attach wheel event handler
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    stage.on('wheel', handleWheel);

    return () => {
      stage.off('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Helper function to zoom to a specific point
  const zoomToPoint = useCallback(
    (point: { x: number; y: number }, newScale: number) => {
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = stage.scaleX();

      const mousePointTo = {
        x: (point.x - stage.x()) / oldScale,
        y: (point.y - stage.y()) / oldScale,
      };

      const newPos = {
        x: point.x - mousePointTo.x * newScale,
        y: point.y - mousePointTo.y * newScale,
      };

      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);
      setZoomLevel(newScale);
      stage.batchDraw();
    },
    []
  );

  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const newScale = Math.min(stage.scaleX() * 1.2, 10);
    const center = {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };

    zoomToPoint(center, newScale);
  }, [zoomToPoint]);

  const handleZoomOut = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const newScale = Math.max(stage.scaleX() / 1.2, 0.1);
    const center = {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };

    zoomToPoint(center, newScale);
  }, [zoomToPoint]);

  const handleZoomReset = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const initialScale = initialScaleRef.current;

    stage.scale({ x: initialScale, y: initialScale });
    stage.position({ x: stage.width() / 2, y: stage.height() / 2 });
    setZoomLevel(initialScale);
    stage.batchDraw();
  }, []);

  // Render background layer (grid, origin, hoop)
  useEffect(() => {
    const layer = backgroundLayerRef.current;
    const stage = stageRef.current;
    if (!layer || !stage || !pesData) return;

    layer.destroyChildren();

    const { bounds } = pesData;

    // Determine view dimensions - always fit to hoop if available, otherwise fit to pattern
    const viewWidth = machineInfo ? machineInfo.maxWidth : bounds.maxX - bounds.minX;
    const viewHeight = machineInfo ? machineInfo.maxHeight : bounds.maxY - bounds.minY;

    // Calculate and store initial scale
    const initialScale = calculateInitialScale(stage.width(), stage.height(), viewWidth, viewHeight);
    initialScaleRef.current = initialScale;

    // Always reset to initial scale when background is re-rendered (e.g., when pattern or hoop changes)
    stage.scale({ x: initialScale, y: initialScale });
    stage.position({ x: stage.width() / 2, y: stage.height() / 2 });
    setZoomLevel(initialScale);

    // Render background elements
    const gridSize = 100; // 10mm grid (100 units in 0.1mm)
    renderGrid(layer, gridSize, bounds, machineInfo);
    renderOrigin(layer);

    if (machineInfo) {
      renderHoop(layer, machineInfo);
    }

    // Cache the background layer for performance
    layer.cache();
    layer.batchDraw();
  }, [machineInfo, pesData, zoomLevel]);

  // Render pattern layer (stitches and bounds in a draggable group)
  // This effect only runs when the pattern changes, NOT when sewing progress changes
  useEffect(() => {
    const layer = patternLayerRef.current;
    if (!layer || !pesData) return;

    layer.destroyChildren();

    const { stitches, bounds } = pesData;

    // Create a draggable group for the pattern
    const patternGroup = new Konva.Group({
      draggable: true,
      x: patternOffset.x,
      y: patternOffset.y,
    });

    // Store ref
    patternGroupRef.current = patternGroup;

    // Render pattern elements into the group (initial render with currentStitch = 0)
    const currentStitch = sewingProgress?.currentStitch || 0;
    renderStitches(patternGroup, stitches, pesData, currentStitch);
    renderPatternBounds(patternGroup, bounds);

    // Handle drag events
    patternGroup.on('dragstart', () => {
      isDraggingRef.current = true;
    });

    patternGroup.on('dragend', () => {
      isDraggingRef.current = false;
      const newOffset = {
        x: patternGroup.x(),
        y: patternGroup.y(),
      };
      setPatternOffset(newOffset);

      // Notify parent component of offset change
      if (onPatternOffsetChange) {
        onPatternOffsetChange(newOffset.x, newOffset.y);
      }
    });

    // Add visual feedback on hover
    patternGroup.on('mouseenter', () => {
      const stage = stageRef.current;
      if (stage) stage.container().style.cursor = 'move';
    });

    patternGroup.on('mouseleave', () => {
      if (!isDraggingRef.current) {
        const stage = stageRef.current;
        if (stage) stage.container().style.cursor = 'grab';
      }
    });

    layer.add(patternGroup);
    layer.batchDraw();
  }, [pesData, onPatternOffsetChange]); // Removed sewingProgress from dependencies

  // Separate effect to update stitches when sewing progress changes
  // This only updates the stitch rendering, not the entire group
  useEffect(() => {
    const patternGroup = patternGroupRef.current;
    if (!patternGroup || !pesData || isDraggingRef.current) return;

    const currentStitch = sewingProgress?.currentStitch || 0;
    const { stitches } = pesData;

    // Remove old stitches group and re-render
    const oldStitchesGroup = patternGroup.findOne('.stitches');
    if (oldStitchesGroup) {
      oldStitchesGroup.destroy();
    }

    // Re-render stitches with updated progress
    renderStitches(patternGroup, stitches, pesData, currentStitch);
    patternGroup.getLayer()?.batchDraw();
  }, [sewingProgress, pesData]);

  // Separate effect to update pattern position when offset changes externally (not during drag)
  useEffect(() => {
    const patternGroup = patternGroupRef.current;
    if (patternGroup && !isDraggingRef.current) {
      patternGroup.position({ x: patternOffset.x, y: patternOffset.y });
      patternGroup.getLayer()?.batchDraw();
    }
  }, [patternOffset.x, patternOffset.y]);

  // Render current position layer (updates frequently, follows pattern offset)
  useEffect(() => {
    const layer = currentPosLayerRef.current;
    if (!layer || !pesData) return;

    layer.destroyChildren();

    const currentStitch = sewingProgress?.currentStitch || 0;
    const { stitches } = pesData;

    if (currentStitch > 0 && currentStitch < stitches.length) {
      // Create group at pattern offset
      const posGroup = new Konva.Group({
        x: patternOffset.x,
        y: patternOffset.y,
      });

      renderCurrentPosition(posGroup, currentStitch, stitches);
      layer.add(posGroup);
    }

    layer.batchDraw();
  }, [pesData, sewingProgress, patternOffset.x, patternOffset.y]);

  return (
    <div className="canvas-panel">
      <h2>Pattern Preview</h2>
      <div className="canvas-container" ref={containerRef}>
        {!pesData && (
          <div className="canvas-placeholder">
            Load a PES file to preview the pattern
          </div>
        )}
        {pesData && (
          <>
            {/* Thread Legend Overlay */}
            <div className="canvas-legend">
              <h4>Threads</h4>
              {pesData.threads.map((thread, index) => (
                <div key={index} className="legend-item">
                  <div
                    className="legend-swatch"
                    style={{ backgroundColor: thread.hex }}
                  />
                  <span className="legend-label">Thread {index + 1}</span>
                </div>
              ))}
            </div>

            {/* Pattern Dimensions Overlay */}
            <div className="canvas-dimensions">
              {((pesData.bounds.maxX - pesData.bounds.minX) / 10).toFixed(1)} x{' '}
              {((pesData.bounds.maxY - pesData.bounds.minY) / 10).toFixed(1)} mm
            </div>

            {/* Pattern Offset Indicator */}
            <div className="canvas-offset-info">
              <div className="offset-label">Pattern Position:</div>
              <div className="offset-value">
                X: {(patternOffset.x / 10).toFixed(1)}mm, Y: {(patternOffset.y / 10).toFixed(1)}mm
              </div>
              <div className="offset-hint">
                Drag pattern to move • Drag background to pan
              </div>
            </div>

            {/* Zoom Controls Overlay */}
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">
                +
              </button>
              <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
              <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">
                −
              </button>
              <button className="zoom-btn zoom-reset" onClick={handleZoomReset} title="Reset Zoom">
                ⟲
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
