"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/lib/store/editor-store"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Crop, Check, X, Grid, Square, Smartphone, Monitor } from "lucide-react"

const ASPECT_RATIOS = [
  { label: "Free", value: null, icon: <Crop className="w-4 h-4" /> },
  { label: "1:1", value: 1, icon: <Square className="w-4 h-4" /> },
  { label: "4:3", value: 4 / 3, icon: <Monitor className="w-4 h-4" /> },
  { label: "3:4", value: 3 / 4, icon: <Smartphone className="w-4 h-4" /> },
  { label: "16:9", value: 16 / 9, icon: <Monitor className="w-4 h-4" /> },
  { label: "9:16", value: 9 / 16, icon: <Smartphone className="w-4 h-4" /> },
]

export function CropTool() {
  const { cropArea, setCropArea, applyCrop, isProcessing, imageMetadata, setActiveTool } = useEditorStore()
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleAspectRatioChange = (value: string) => {
    const ratio = value === "free" ? null : Number.parseFloat(value)
    setSelectedAspectRatio(ratio)

    if (cropArea && ratio) {
      // Adjust crop area to match aspect ratio
      const centerX = cropArea.x + cropArea.width / 2
      const centerY = cropArea.y + cropArea.height / 2

      let newWidth = cropArea.width
      let newHeight = cropArea.width / ratio

      if (newHeight > cropArea.height) {
        newHeight = cropArea.height
        newWidth = cropArea.height * ratio
      }

      setCropArea({
        x: Math.max(0, centerX - newWidth / 2),
        y: Math.max(0, centerY - newHeight / 2),
        width: newWidth,
        height: newHeight,
        aspectRatio: ratio,
      })
    }
  }

  const handleApplyCrop = async () => {
    await applyCrop()
  }

  const handleCancelCrop = () => {
    setCropArea(null)
    setActiveTool("none")
  }

  const resetCrop = () => {
    if (imageMetadata) {
      setCropArea({
        x: imageMetadata.currentWidth * 0.1,
        y: imageMetadata.currentHeight * 0.1,
        width: imageMetadata.currentWidth * 0.8,
        height: imageMetadata.currentHeight * 0.8,
        aspectRatio: selectedAspectRatio,
      })
    }
  }

  // Initialize crop area when tool is activated
  useEffect(() => {
    if (!cropArea && imageMetadata) {
      resetCrop()
    }
  }, [imageMetadata])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Crop Image</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
          className="text-gray-500 hover:text-gray-700"
          title="Toggle grid overlay"
        >
          <Grid className="w-4 h-4" />
        </Button>
      </div>

      {/* Aspect Ratio Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Aspect Ratio</label>
        <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-3"} gap-2`}>
          {ASPECT_RATIOS.map((ratio) => (
            <Button
              key={ratio.label}
              variant={selectedAspectRatio === ratio.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleAspectRatioChange(ratio.value?.toString() || "free")}
              className="flex items-center space-x-2 justify-start"
            >
              {ratio.icon}
              <span className="text-xs">{ratio.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Crop Dimensions Display */}
      {cropArea && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Crop Area</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Position:</span>
              <div className="font-mono">
                X: {Math.round(cropArea.x)}px, Y: {Math.round(cropArea.y)}px
              </div>
            </div>
            <div>
              <span className="text-gray-500">Size:</span>
              <div className="font-mono">
                {Math.round(cropArea.width)} × {Math.round(cropArea.height)}px
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crop Instructions */}
      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
        <p className="font-medium text-blue-800 mb-1">How to crop:</p>
        <ul className="space-y-1 text-blue-700">
          <li>• Drag corners to resize the crop area</li>
          <li>• Drag the center to move the crop area</li>
          <li>• Select an aspect ratio for constrained cropping</li>
          {isMobile && <li>• Use pinch gestures for precise adjustments</li>}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className={`flex ${isMobile ? "flex-col space-y-2" : "space-x-2"} pt-4`}>
        <Button
          onClick={handleApplyCrop}
          disabled={!cropArea || isProcessing}
          className={`${isMobile ? "w-full h-12" : "flex-1"} bg-green-600 hover:bg-green-700`}
        >
          <Check className="w-4 h-4 mr-2" />
          {isProcessing ? "Cropping..." : "Apply Crop"}
        </Button>

        <Button
          variant="outline"
          onClick={resetCrop}
          disabled={isProcessing}
          className={`${isMobile ? "w-full h-12" : ""}`}
        >
          Reset
        </Button>

        <Button
          variant="outline"
          onClick={handleCancelCrop}
          disabled={isProcessing}
          className={`${isMobile ? "w-full h-12" : ""}`}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  )
}
