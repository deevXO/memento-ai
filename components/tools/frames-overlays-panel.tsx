"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useEditorStore } from "@/lib/store/editor-store"
import { Plus, X } from "lucide-react"

export function FramesOverlaysPanel() {
  const { frames, textOverlays, setFrame, addTextOverlay, removeTextOverlay } = useEditorStore()
  const [newText, setNewText] = useState("")
  const [textStyle, setTextStyle] = useState({
    fontSize: 24,
    color: "#ffffff",
    fontFamily: "Arial",
  })

  const frameTypes = [
    { id: null, label: "None" },
    { id: "polaroid", label: "Polaroid" },
    { id: "instagram", label: "Instagram" },
    { id: "vintage", label: "Vintage" },
  ]

  const fontFamilies = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Impact"]

  const handleAddText = () => {
    if (newText.trim()) {
      addTextOverlay({
        content: newText,
        position: [50, 50], // Center position
        style: textStyle,
      })
      setNewText("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Frames Section */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Frames</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Frame Type</label>
          <Select
            value={frames.type || "none"}
            onValueChange={(value) => setFrame(value === "none" ? null : (value as any))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {frameTypes.map((frame) => (
                <SelectItem key={frame.id || "none"} value={frame.id || "none"}>
                  {frame.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {frames.type && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Frame Color</label>
            <input
              type="color"
              value={frames.color}
              onChange={(e) => setFrame(frames.type, e.target.value)}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>
        )}
      </div>

      {/* Text Overlays Section */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Text Overlays</h3>

        <div className="space-y-3">
          <Input placeholder="Enter text..." value={newText} onChange={(e) => setNewText(e.target.value)} />

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Font Size</label>
              <Slider
                value={[textStyle.fontSize]}
                onValueChange={([value]) => setTextStyle((prev) => ({ ...prev, fontSize: value }))}
                min={12}
                max={72}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">{textStyle.fontSize}px</div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-600">Color</label>
              <input
                type="color"
                value={textStyle.color}
                onChange={(e) => setTextStyle((prev) => ({ ...prev, color: e.target.value }))}
                className="w-full h-8 rounded border border-gray-300"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-600">Font Family</label>
            <Select
              value={textStyle.fontFamily}
              onValueChange={(value) => setTextStyle((prev) => ({ ...prev, fontFamily: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAddText} disabled={!newText.trim()} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Text
          </Button>
        </div>

        {/* Existing Text Overlays */}
        {textOverlays.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Active Text Overlays</h4>
            {textOverlays.map((overlay) => (
              <div key={overlay.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm truncate flex-1">{overlay.content}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTextOverlay(overlay.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
