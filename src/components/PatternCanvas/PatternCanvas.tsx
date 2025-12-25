import { useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useMachineStore,
  usePatternUploaded,
} from "../../stores/useMachineStore";
import { usePatternStore } from "../../stores/usePatternStore";
import { Stage, Layer, Group, Transformer } from "react-konva";
import Konva from "konva";
import { PhotoIcon } from "@heroicons/react/24/solid";
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
import {
  calculatePatternCenter,
  convertPenStitchesToPesFormat,
} from "./patternCanvasHelpers";
import { ThreadLegend } from "./ThreadLegend";
import { PatternPositionIndicator } from "./PatternPositionIndicator";
import { ZoomControls } from "./ZoomControls";
import { useCanvasViewport } from "../../hooks/useCanvasViewport";
import { usePatternTransform } from "../../hooks/usePatternTransform";

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

  // Canvas viewport (zoom, pan, container size)
  const {
    stagePos,
    stageScale,
    containerSize,
    handleWheel,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
  } = useCanvasViewport({
    containerRef,
    pesData,
    uploadedPesData,
    machineInfo,
  });

  // Pattern transform (position, rotation, drag/transform)
  const {
    localPatternOffset,
    localPatternRotation,
    patternGroupRef,
    transformerRef,
    attachTransformer,
    handleCenterPattern,
    handlePatternDragEnd,
    handleTransformEnd,
  } = usePatternTransform({
    pesData,
    initialPatternOffset,
    initialPatternRotation,
    setPatternOffset,
    setPatternRotation,
    patternUploaded,
    isUploading,
  });

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
                    <ThreadLegend colors={displayPattern.uniqueColors} />

                    <PatternPositionIndicator
                      offset={
                        isUploading || patternUploaded
                          ? initialUploadedPatternOffset
                          : localPatternOffset
                      }
                      rotation={localPatternRotation}
                      isLocked={patternUploaded}
                      isUploading={isUploading}
                    />

                    <ZoomControls
                      scale={stageScale}
                      onZoomIn={handleZoomIn}
                      onZoomOut={handleZoomOut}
                      onZoomReset={handleZoomReset}
                      onCenterPattern={handleCenterPattern}
                      canCenterPattern={
                        !!pesData && !patternUploaded && !isUploading
                      }
                    />
                  </>
                )
              );
            })()}
        </div>
      </CardContent>
    </Card>
  );
}
