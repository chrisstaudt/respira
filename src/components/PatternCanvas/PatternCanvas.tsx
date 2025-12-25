import { useEffect, useRef, useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useMachineStore,
  usePatternUploaded,
} from "../../stores/useMachineStore";
import { usePatternStore } from "../../stores/usePatternStore";
import { Stage, Layer, Group, Transformer } from "react-konva";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import {
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  LockClosedIcon,
  PhotoIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/solid";
import type { PesPatternData } from "../../formats/import/pesImporter";
import { calculateInitialScale } from "../../utils/konvaRenderers";
import {
  Grid,
  Origin,
  Hoop,
  Stitches,
  PatternBounds,
  CurrentPosition,
} from "../KonvaComponents";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  calculatePatternCenter,
  convertPenStitchesToPesFormat,
  calculateZoomToPoint,
} from "./patternCanvasHelpers";

export function PatternCanvas() {
  // Machine store
  const { sewingProgress, machineInfo, isUploading } = useMachineStore(
    useShallow((state) => ({
      sewingProgress: state.sewingProgress,
      machineInfo: state.machineInfo,
      isUploading: state.isUploading,
    })),
  );

  // Pattern store
  const {
    pesData,
    patternOffset: initialPatternOffset,
    patternRotation: initialPatternRotation,
    uploadedPesData,
    uploadedPatternOffset: initialUploadedPatternOffset,
    setPatternOffset,
    setPatternRotation,
  } = usePatternStore(
    useShallow((state) => ({
      pesData: state.pesData,
      patternOffset: state.patternOffset,
      patternRotation: state.patternRotation,
      uploadedPesData: state.uploadedPesData,
      uploadedPatternOffset: state.uploadedPatternOffset,
      setPatternOffset: state.setPatternOffset,
      setPatternRotation: state.setPatternRotation,
    })),
  );

  // Derived state: pattern is uploaded if machine has pattern info
  const patternUploaded = usePatternUploaded();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const patternGroupRef = useRef<Konva.Group | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [localPatternOffset, setLocalPatternOffset] = useState(
    initialPatternOffset || { x: 0, y: 0 },
  );
  const [localPatternRotation, setLocalPatternRotation] = useState(
    initialPatternRotation || 0,
  );
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const initialScaleRef = useRef<number>(1);
  const prevPesDataRef = useRef<PesPatternData | null>(null);

  // Update pattern offset when initialPatternOffset changes
  if (
    initialPatternOffset &&
    (localPatternOffset.x !== initialPatternOffset.x ||
      localPatternOffset.y !== initialPatternOffset.y)
  ) {
    setLocalPatternOffset(initialPatternOffset);
    console.log(
      "[PatternCanvas] Restored pattern offset:",
      initialPatternOffset,
    );
  }

  // Update pattern rotation when initialPatternRotation changes
  if (
    initialPatternRotation !== undefined &&
    localPatternRotation !== initialPatternRotation
  ) {
    setLocalPatternRotation(initialPatternRotation);
  }

  // Track container size
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        setContainerSize({ width, height });
      }
    };

    // Initial size
    updateSize();

    // Watch for resize
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate and store initial scale when pattern or hoop changes
  useEffect(() => {
    // Use whichever pattern is available (uploaded or original)
    const currentPattern = uploadedPesData || pesData;
    if (!currentPattern || containerSize.width === 0) {
      prevPesDataRef.current = null;
      return;
    }

    // Only recalculate if pattern changed
    if (prevPesDataRef.current !== currentPattern) {
      prevPesDataRef.current = currentPattern;

      const { bounds } = currentPattern;
      const viewWidth = machineInfo
        ? machineInfo.maxWidth
        : bounds.maxX - bounds.minX;
      const viewHeight = machineInfo
        ? machineInfo.maxHeight
        : bounds.maxY - bounds.minY;

      const initialScale = calculateInitialScale(
        containerSize.width,
        containerSize.height,
        viewWidth,
        viewHeight,
      );
      initialScaleRef.current = initialScale;

      // Reset view when pattern changes
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStageScale(initialScale);
      setStagePos({ x: containerSize.width / 2, y: containerSize.height / 2 });
    }
  }, [pesData, uploadedPesData, machineInfo, containerSize]);

  // Wheel zoom handler
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.1;
    const direction = e.evt.deltaY > 0 ? -1 : 1;

    setStageScale((oldScale) => {
      const newScale = Math.max(
        0.1,
        Math.min(direction > 0 ? oldScale * scaleBy : oldScale / scaleBy, 2),
      );

      // Zoom towards pointer
      setStagePos((prevPos) =>
        calculateZoomToPoint(oldScale, newScale, pointer, prevPos),
      );

      return newScale;
    });
  }, []);

  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    setStageScale((oldScale) => {
      const newScale = Math.max(0.1, Math.min(oldScale * 1.2, 2));

      // Zoom towards center of viewport
      const center = {
        x: containerSize.width / 2,
        y: containerSize.height / 2,
      };
      setStagePos((prevPos) =>
        calculateZoomToPoint(oldScale, newScale, center, prevPos),
      );

      return newScale;
    });
  }, [containerSize]);

  const handleZoomOut = useCallback(() => {
    setStageScale((oldScale) => {
      const newScale = Math.max(0.1, Math.min(oldScale / 1.2, 2));

      // Zoom towards center of viewport
      const center = {
        x: containerSize.width / 2,
        y: containerSize.height / 2,
      };
      setStagePos((prevPos) =>
        calculateZoomToPoint(oldScale, newScale, center, prevPos),
      );

      return newScale;
    });
  }, [containerSize]);

  const handleZoomReset = useCallback(() => {
    const initialScale = initialScaleRef.current;
    setStageScale(initialScale);
    setStagePos({ x: containerSize.width / 2, y: containerSize.height / 2 });
  }, [containerSize]);

  const handleCenterPattern = useCallback(() => {
    if (!pesData) return;

    const { bounds } = pesData;
    const centerOffsetX = -(bounds.minX + bounds.maxX) / 2;
    const centerOffsetY = -(bounds.minY + bounds.maxY) / 2;

    setLocalPatternOffset({ x: centerOffsetX, y: centerOffsetY });
    setPatternOffset(centerOffsetX, centerOffsetY);
  }, [pesData, setPatternOffset]);

  // Pattern drag handlers
  const handlePatternDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const newOffset = {
        x: e.target.x(),
        y: e.target.y(),
      };
      setLocalPatternOffset(newOffset);
      setPatternOffset(newOffset.x, newOffset.y);
    },
    [setPatternOffset],
  );

  // Attach/detach transformer based on state
  const attachTransformer = useCallback(() => {
    if (!transformerRef.current || !patternGroupRef.current) {
      console.log(
        "[PatternCanvas] Cannot attach transformer - refs not ready",
        {
          hasTransformer: !!transformerRef.current,
          hasPatternGroup: !!patternGroupRef.current,
        },
      );
      return;
    }

    if (!patternUploaded && !isUploading) {
      console.log("[PatternCanvas] Attaching transformer");
      transformerRef.current.nodes([patternGroupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    } else {
      console.log("[PatternCanvas] Detaching transformer");
      transformerRef.current.nodes([]);
    }
  }, [patternUploaded, isUploading]);

  // Call attachTransformer when conditions change
  useEffect(() => {
    attachTransformer();
  }, [attachTransformer, pesData]);

  // Sync node rotation with state (important for when rotation is reset to 0 after upload)
  useEffect(() => {
    if (patternGroupRef.current) {
      patternGroupRef.current.rotation(localPatternRotation);
    }
  }, [localPatternRotation]);

  // Handle transformer rotation - just store the angle, apply at upload time
  const handleTransformEnd = useCallback(
    (e: KonvaEventObject<Event>) => {
      if (!pesData) return;

      const node = e.target;
      // Read rotation from the node
      const totalRotation = node.rotation();
      const normalizedRotation = ((totalRotation % 360) + 360) % 360;

      setLocalPatternRotation(normalizedRotation);

      // Also read position in case the Transformer affected it
      const newOffset = {
        x: node.x(),
        y: node.y(),
      };
      setLocalPatternOffset(newOffset);

      // Store rotation angle and position
      setPatternRotation(normalizedRotation);
      setPatternOffset(newOffset.x, newOffset.y);

      console.log(
        "[Canvas] Transform end - rotation:",
        normalizedRotation,
        "degrees, position:",
        newOffset,
      );
    },
    [setPatternRotation, setPatternOffset, pesData],
  );

  const hasPattern = pesData || uploadedPesData;
  const borderColor = hasPattern
    ? "border-tertiary-600 dark:border-tertiary-500"
    : "border-gray-400 dark:border-gray-600";
  const iconColor = hasPattern
    ? "text-tertiary-600 dark:text-tertiary-400"
    : "text-gray-600 dark:text-gray-400";

  return (
    <Card
      className={`p-0 gap-0 lg:h-full flex flex-col border-l-4 ${borderColor}`}
    >
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <PhotoIcon className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm">Pattern Preview</CardTitle>
            {hasPattern ? (
              <CardDescription className="text-xs">
                {(() => {
                  const displayPattern = uploadedPesData || pesData;
                  return displayPattern ? (
                    <>
                      {(
                        (displayPattern.bounds.maxX -
                          displayPattern.bounds.minX) /
                        10
                      ).toFixed(1)}{" "}
                      ×{" "}
                      {(
                        (displayPattern.bounds.maxY -
                          displayPattern.bounds.minY) /
                        10
                      ).toFixed(1)}{" "}
                      mm
                    </>
                  ) : null;
                })()}
              </CardDescription>
            ) : (
              <CardDescription className="text-xs">
                No pattern loaded
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-0 pb-4 flex-1 flex flex-col min-h-0">
        <div
          className="relative w-full flex-1 min-h-0 border border-gray-300 dark:border-gray-600 rounded bg-gray-200 dark:bg-gray-900 overflow-hidden"
          ref={containerRef}
        >
          {containerSize.width > 0 && (
            <Stage
              width={containerSize.width}
              height={containerSize.height}
              x={stagePos.x}
              y={stagePos.y}
              scaleX={stageScale}
              scaleY={stageScale}
              draggable
              onWheel={handleWheel}
              onDragStart={() => {
                if (stageRef.current) {
                  stageRef.current.container().style.cursor = "grabbing";
                }
              }}
              onDragEnd={() => {
                if (stageRef.current) {
                  stageRef.current.container().style.cursor = "grab";
                }
              }}
              ref={(node) => {
                stageRef.current = node;
                if (node) {
                  node.container().style.cursor = "grab";
                }
              }}
            >
              {/* Background layer: grid, origin, hoop */}
              <Layer>
                {hasPattern && (
                  <>
                    <Grid
                      gridSize={100}
                      bounds={(uploadedPesData || pesData)!.bounds}
                      machineInfo={machineInfo}
                    />
                    <Origin />
                    {machineInfo && <Hoop machineInfo={machineInfo} />}
                  </>
                )}
              </Layer>

              {/* Original pattern layer: draggable with transformer (shown before upload starts) */}
              <Layer visible={!isUploading && !patternUploaded}>
                {pesData &&
                  (() => {
                    const originalCenter = calculatePatternCenter(
                      pesData.bounds,
                    );
                    console.log("[Canvas] Rendering original pattern:", {
                      position: localPatternOffset,
                      rotation: localPatternRotation,
                      center: originalCenter,
                      bounds: pesData.bounds,
                    });
                    return (
                      <>
                        <Group
                          name="pattern-group"
                          ref={(node) => {
                            patternGroupRef.current = node;
                            // Set initial rotation from state
                            if (node) {
                              node.rotation(localPatternRotation);
                              // Try to attach transformer when group is mounted
                              attachTransformer();
                            }
                          }}
                          draggable={!isUploading}
                          x={localPatternOffset.x}
                          y={localPatternOffset.y}
                          offsetX={originalCenter.x}
                          offsetY={originalCenter.y}
                          onDragEnd={handlePatternDragEnd}
                          onTransformEnd={handleTransformEnd}
                          onMouseEnter={(e) => {
                            const stage = e.target.getStage();
                            if (stage && !isUploading)
                              stage.container().style.cursor = "move";
                          }}
                          onMouseLeave={(e) => {
                            const stage = e.target.getStage();
                            if (stage && !isUploading)
                              stage.container().style.cursor = "grab";
                          }}
                        >
                          <Stitches
                            stitches={convertPenStitchesToPesFormat(
                              pesData.penStitches,
                            )}
                            pesData={pesData}
                            currentStitchIndex={0}
                            showProgress={false}
                          />
                          <PatternBounds bounds={pesData.bounds} />
                        </Group>
                        <Transformer
                          ref={(node) => {
                            transformerRef.current = node;
                            // Try to attach transformer when transformer is mounted
                            if (node) {
                              attachTransformer();
                            }
                          }}
                          enabledAnchors={[]}
                          rotateEnabled={true}
                          borderEnabled={true}
                          borderStroke="#FF6B6B"
                          borderStrokeWidth={2}
                          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                          ignoreStroke={true}
                          rotateAnchorOffset={20}
                        />
                      </>
                    );
                  })()}
              </Layer>

              {/* Uploaded pattern layer: locked, rotation baked in (shown during and after upload) */}
              <Layer visible={isUploading || patternUploaded}>
                {uploadedPesData &&
                  (() => {
                    const uploadedCenter = calculatePatternCenter(
                      uploadedPesData.bounds,
                    );
                    console.log("[Canvas] Rendering uploaded pattern:", {
                      position: initialUploadedPatternOffset,
                      center: uploadedCenter,
                      bounds: uploadedPesData.bounds,
                    });
                    return (
                      <Group
                        name="uploaded-pattern-group"
                        x={initialUploadedPatternOffset.x}
                        y={initialUploadedPatternOffset.y}
                        offsetX={uploadedCenter.x}
                        offsetY={uploadedCenter.y}
                      >
                        <Stitches
                          stitches={convertPenStitchesToPesFormat(
                            uploadedPesData.penStitches,
                          )}
                          pesData={uploadedPesData}
                          currentStitchIndex={
                            sewingProgress?.currentStitch || 0
                          }
                          showProgress={true}
                        />
                        <PatternBounds bounds={uploadedPesData.bounds} />
                      </Group>
                    );
                  })()}
              </Layer>

              {/* Current position layer (for uploaded pattern during sewing) */}
              <Layer visible={isUploading || patternUploaded}>
                {uploadedPesData &&
                  sewingProgress &&
                  sewingProgress.currentStitch > 0 &&
                  (() => {
                    const center = calculatePatternCenter(
                      uploadedPesData.bounds,
                    );
                    return (
                      <Group
                        x={initialUploadedPatternOffset.x}
                        y={initialUploadedPatternOffset.y}
                        offsetX={center.x}
                        offsetY={center.y}
                      >
                        <CurrentPosition
                          currentStitchIndex={sewingProgress.currentStitch}
                          stitches={convertPenStitchesToPesFormat(
                            uploadedPesData.penStitches,
                          )}
                        />
                      </Group>
                    );
                  })()}
              </Layer>
            </Stage>
          )}

          {/* Placeholder overlay when no pattern is loaded */}
          {!hasPattern && (
            <div className="flex items-center justify-center h-full text-gray-600 dark:text-gray-400 italic">
              Load a PES file to preview the pattern
            </div>
          )}

          {/* Pattern info overlays */}
          {hasPattern &&
            (() => {
              const displayPattern = uploadedPesData || pesData;
              return (
                displayPattern && (
                  <>
                    {/* Thread Legend Overlay */}
                    <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-2 sm:p-2.5 rounded-lg shadow-lg z-10 max-w-[150px] sm:max-w-[180px] lg:max-w-[200px]">
                      <h4 className="m-0 mb-1.5 sm:mb-2 text-xs font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600 pb-1 sm:pb-1.5">
                        Colors
                      </h4>
                      {displayPattern.uniqueColors.map((color, idx) => {
                        // Primary metadata: brand and catalog number
                        const primaryMetadata = [
                          color.brand,
                          color.catalogNumber
                            ? `#${color.catalogNumber}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" ");

                        // Secondary metadata: chart and description
                        // Only show chart if it's different from catalogNumber
                        const secondaryMetadata = [
                          color.chart && color.chart !== color.catalogNumber
                            ? color.chart
                            : null,
                          color.description,
                        ]
                          .filter(Boolean)
                          .join(" ");

                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 last:mb-0"
                          >
                            <div
                              className="w-3 h-3 sm:w-4 sm:h-4 rounded border border-black dark:border-gray-300 flex-shrink-0 mt-0.5"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                Color {idx + 1}
                              </div>
                              {(primaryMetadata || secondaryMetadata) && (
                                <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight mt-0.5 break-words">
                                  {primaryMetadata}
                                  {primaryMetadata && secondaryMetadata && (
                                    <span className="mx-1">•</span>
                                  )}
                                  {secondaryMetadata}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pattern Offset Indicator */}
                    <div
                      className={`absolute bottom-16 sm:bottom-20 right-2 sm:right-5 backdrop-blur-sm p-2 sm:p-2.5 px-2.5 sm:px-3.5 rounded-lg shadow-lg z-[11] min-w-[160px] sm:min-w-[180px] transition-colors ${
                        isUploading || patternUploaded
                          ? "bg-amber-50/95 dark:bg-amber-900/80 border-2 border-amber-300 dark:border-amber-600"
                          : "bg-white/95 dark:bg-gray-800/95"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Pattern Position:
                        </div>
                        {(isUploading || patternUploaded) && (
                          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <LockClosedIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span className="text-xs font-bold">
                              {isUploading ? "UPLOADING" : "LOCKED"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-1">
                        {isUploading || patternUploaded ? (
                          <>
                            X:{" "}
                            {(initialUploadedPatternOffset.x / 10).toFixed(1)}
                            mm, Y:{" "}
                            {(initialUploadedPatternOffset.y / 10).toFixed(1)}mm
                          </>
                        ) : (
                          <>
                            X: {(localPatternOffset.x / 10).toFixed(1)}mm, Y:{" "}
                            {(localPatternOffset.y / 10).toFixed(1)}mm
                          </>
                        )}
                      </div>
                      {!isUploading &&
                        !patternUploaded &&
                        localPatternRotation !== 0 && (
                          <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-1">
                            Rotation: {localPatternRotation.toFixed(1)}°
                          </div>
                        )}
                      <div className="text-xs text-gray-600 dark:text-gray-400 italic">
                        {isUploading
                          ? "Uploading pattern..."
                          : patternUploaded
                            ? "Pattern locked • Drag background to pan"
                            : "Drag pattern to move • Drag background to pan"}
                      </div>
                    </div>

                    {/* Zoom Controls Overlay */}
                    <div className="absolute bottom-2 sm:bottom-5 right-2 sm:right-5 flex gap-1.5 sm:gap-2 items-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-lg z-10">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-7 h-7 sm:w-8 sm:h-8"
                        onClick={handleCenterPattern}
                        disabled={!pesData || patternUploaded || isUploading}
                        title="Center Pattern in Hoop"
                      >
                        <ArrowsPointingInIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-7 h-7 sm:w-8 sm:h-8"
                        onClick={handleZoomIn}
                        title="Zoom In"
                      >
                        <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                      <span className="min-w-[40px] sm:min-w-[50px] text-center text-sm font-semibold text-gray-900 dark:text-gray-100 select-none">
                        {Math.round(stageScale * 100)}%
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-7 h-7 sm:w-8 sm:h-8"
                        onClick={handleZoomOut}
                        title="Zoom Out"
                      >
                        <MinusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-7 h-7 sm:w-8 sm:h-8 ml-1"
                        onClick={handleZoomReset}
                        title="Reset Zoom"
                      >
                        <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </div>
                  </>
                )
              );
            })()}
        </div>
      </CardContent>
    </Card>
  );
}
