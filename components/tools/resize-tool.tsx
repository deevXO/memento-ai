"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useEditorStore } from "@/lib/store/editor-store"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Maximize2, Link, Unlink, RotateCw, Check, X } from "lucide-react"

const PRESET_SIZES = [
  { label: "Instagram Square", width: 1080, height: 1080 },
  { label: "Instagram Portrait", width: 1080, height: 1350 },
  { label: "Facebook Cover", width: 1200, height: 630 },
  { label: "Twitter Header", width: 1500, height: 500 },
  { label: "YouTube Thumbnail", width: 1280, height: 720 },
  { label: "HD (1080p)", width: 1920, height: 1080 },
  { label: "4K", width: 3840, height: 2160 },
]

const INTERPOLATION_METHODS = [
  { value: "nearest", label: "Nearest Neighbor (Pixelated)" },
  { value: "bilinear", label: "Bilinear (Smooth)" },
  { value: "bicubic", label: "Bicubic (High Quality)" },
]

export function ResizeTool() {
  const { resizeSettings, setResizeSettings, applyResize, isProcessing, imageMetadata, setActiveTool } =
    useEditorStore()

  const [localWidth, setLocalWidth] = useState(resizeSettings.width.toString())
  const [localHeight, setLocalHeight] = useState(resizeSettings.height.toString())
  const [isLinked, setIsLinked] = useState(resizeSettings.maintainAspectRatio)
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number>(1)

  const isMobile = useMediaQuery("(max-width: 768px)")

  // Update local state when imageMetadata changes
  useEffect(() => {
    if (imageMetadata) {
      const aspectRatio = imageMetadata.currentWidth / imageMetadata.currentHeight
      setOriginalAspectRatio(aspectRatio)
      setLocalWidth(imageMetadata.currentWidth.toString())
      setLocalHeight(imageMetadata.currentHeight.toString())
      setResizeSettings({
        width: imageMetadata.currentWidth,
        height: imageMetadata.currentHeight,
      })
    }
  }, [imageMetadata, setResizeSettings])

  const handleWidthChange = (value: string) => {
    setLocalWidth(value)
    const width = Number.parseInt(value) || 0

    if (isLinked && width > 0) {
      const height = Math.round(width / originalAspectRatio)
      setLocalHeight(height.toString())
      setResizeSettings({ width, height })
    } else {
      setResizeSettings({ width })
    }
  }

  const handleHeightChange = (value: string) => {
    setLocalHeight(value)
    const height = Number.parseInt(value) || 0

    if (isLinked && height > 0) {
      const width = Math.round(height * originalAspectRatio)
      setLocalWidth(width.toString())
      setResizeSettings({ width, height })
    } else {
      setResizeSettings({ height })
    }
  }

  const handleLinkToggle = (linked: boolean) => {
    setIsLinked(linked)
    setResizeSettings({ maintainAspectRatio: linked })

    if (linked) {
      // Recalculate height based on current width
      const width = Number.parseInt(localWidth) || 0
      if (width > 0) {
        const height = Math.round(width / originalAspectRatio)
        setLocalHeight(height.toString())
        setResizeSettings({ height })
      }
    }
  }

  const handlePresetSelect = (preset: (typeof PRESET_SIZES)[0]) => {
    setLocalWidth(preset.width.toString())
    setLocalHeight(preset.height.toString())
    setResizeSettings({
      width: preset.width,
      height: preset.height,
    })
    setIsLinked(false)
    setResizeSettings({ maintainAspectRatio: false })
  }

  const handleApplyResize = async () => {
    await applyResize()
  }

  const handleCancelResize = () => {
    setActiveTool("none")
  }

  const resetToOriginal = () => {
    if (imageMetadata) {
      setLocalWidth(imageMetadata.originalWidth.toString())
      setLocalHeight(imageMetadata.originalHeight.toString())
      setResizeSettings({
        width: imageMetadata.originalWidth,
        height: imageMetadata.originalHeight,
      })
    }
  }

  const getScalePercentage = () => {
    if (!imageMetadata) return 100
    const currentWidth = Number.parseInt(localWidth) || imageMetadata.currentWidth
    return Math.round((currentWidth / imageMetadata.originalWidth) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Resize Image</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Maximize2 className="w-4 h-4" />
          <span>{getScalePercentage()}%</span>
        </div>
      </div>

      {/* Current Size Display */}
      {imageMetadata && (
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Size</h4>
          <div className="text-sm text-gray-600">
            {imageMetadata.currentWidth} × {imageMetadata.currentHeight} pixels
          </div>
        </div>
      )}

      {/* Dimension Inputs */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
            <Input
              type="number"
              value={localWidth}
              onChange={(e) => handleWidthChange(e.target.value)}
              className={isMobile ? "h-12" : ""}
              placeholder="Width in pixels"
            />
          </div>

          <div className="flex flex-col items-center justify-end pb-2">
            <Button variant="ghost" size="sm" onClick={() => handleLinkToggle(!isLinked)} className="p-2">
              {isLinked ? <Link className="w-4 h-4 text-blue-600" /> : <Unlink className="w-4 h-4 text-gray-400" />}
            </Button>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
            <Input
              type="number"
              value={localHeight}
              onChange={(e) => handleHeightChange(e.target.value)}
              className={isMobile ? "h-12" : ""}
              placeholder="Height in pixels"
              disabled={isLinked}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch checked={isLinked} onCheckedChange={handleLinkToggle} id="maintain-aspect-ratio" />
          <label htmlFor="maintain-aspect-ratio" className="text-sm text-gray-700">
            Maintain aspect ratio
          </label>
        </div>
      </div>

      {/* Preset Sizes */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Preset Sizes</label>
        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-2`}>
          {PRESET_SIZES.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect(preset)}
              className="justify-start text-left"
            >
              <div>
                <div className="font-medium">{preset.label}</div>
                <div className="text-xs text-gray-500">
                  {preset.width} × {preset.height}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Interpolation Method */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Quality</label>
        <Select
          value={resizeSettings.interpolation}
          onValueChange={(value: any) => setResizeSettings({ interpolation: value })}
        >
          <SelectTrigger className={isMobile ? "h-12" : ""}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INTERPOLATION_METHODS.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Size Preview */}
      <div className="bg-blue-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Preview</h4>
        <div className="text-sm text-blue-700">
          <div>
            New size: {localWidth} × {localHeight} pixels
          </div>
          <div>Scale: {getScalePercentage()}% of original</div>
          <div>Quality: {INTERPOLATION_METHODS.find((m) => m.value === resizeSettings.interpolation)?.label}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex ${isMobile ? "flex-col space-y-2" : "space-x-2"} pt-4`}>
        <Button
          onClick={handleApplyResize}
          disabled={isProcessing}
          className={`${isMobile ? "w-full h-12" : "flex-1"} bg-blue-600 hover:bg-blue-700`}
        >
          <Check className="w-4 h-4 mr-2" />
          {isProcessing ? "Resizing..." : "Apply Resize"}
        </Button>

        <Button
          variant="outline"
          onClick={resetToOriginal}
          disabled={isProcessing}
          className={`${isMobile ? "w-full h-12" : ""}`}
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Original Size
        </Button>

        <Button
          variant="outline"
          onClick={handleCancelResize}
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
