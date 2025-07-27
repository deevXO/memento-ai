"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useEditorStore } from "@/lib/store/editor-store"
import { Palette, Frame, RotateCcw, RotateCw, ChevronUp, ChevronDown } from "lucide-react"

export function MobileToolbar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeQuickTool, setActiveQuickTool] = useState<string | null>(null)
  const { effects, updateAdjustment, undo, redo, history, applyEffect, isProcessing, activeTool, setActiveTool } =
    useEditorStore()

  const quickTools = [
    {
      id: "brightness",
      icon: "☀️",
      label: "Brightness",
      value: effects.brightness,
      min: 0,
      max: 2,
      step: 0.1,
      default: 1,
    },
    {
      id: "contrast",
      icon: "🔆",
      label: "Contrast",
      value: effects.contrast,
      min: 0,
      max: 2,
      step: 0.1,
      default: 1,
    },
    {
      id: "saturation",
      icon: "🌈",
      label: "Saturation",
      value: effects.saturation,
      min: 0,
      max: 2,
      step: 0.1,
      default: 1,
    },
  ]

  const quickEffects = [
    { id: "crop", label: "Crop", icon: "✂️", action: () => setActiveTool("crop") },
    { id: "resize", label: "Resize", icon: "📏", action: () => setActiveTool("resize") },
    { id: "enhance", label: "Enhance", icon: "✨", action: () => applyEffect("enhance") },
    { id: "cartoon", label: "Cartoon", icon: "🎨", action: () => applyEffect("cartoon") },
  ]

  return (
    <div className="bg-white border-t border-gray-200 safe-area-pb">
      {/* Quick Actions Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={history.length <= 1 || isProcessing}
            className="p-2"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={redo} disabled={isProcessing} className="p-2">
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-1">
          {quickEffects.map((effect) => (
            <Button
              key={effect.id}
              variant="ghost"
              size="sm"
              onClick={effect.action}
              disabled={isProcessing}
              className="flex flex-col items-center p-2 h-auto min-w-[60px]"
            >
              <span className="text-lg">{effect.icon}</span>
              <span className="text-xs mt-1">{effect.label}</span>
            </Button>
          ))}
        </div>

        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="p-2">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </Button>
      </div>

      {/* Expandable Quick Tools */}
      {isExpanded && (
        <div className="px-4 py-3 space-y-4 max-h-48 overflow-y-auto">
          {/* Quick Adjustment Tools */}
          <div className="grid grid-cols-3 gap-3">
            {quickTools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeQuickTool === tool.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveQuickTool(activeQuickTool === tool.id ? null : tool.id)}
                className="flex flex-col items-center p-3 h-auto"
              >
                <span className="text-lg mb-1">{tool.icon}</span>
                <span className="text-xs">{tool.label}</span>
                <span className="text-xs text-gray-500 mt-1">{tool.value.toFixed(1)}</span>
              </Button>
            ))}
          </div>

          {/* Active Tool Slider */}
          {activeQuickTool && (
            <div className="bg-gray-50 rounded-lg p-3">
              {(() => {
                const tool = quickTools.find((t) => t.id === activeQuickTool)
                if (!tool) return null

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{tool.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{tool.value.toFixed(1)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateAdjustment(tool.id as any, tool.default)}
                          className="text-xs px-2 py-1 h-auto"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                    <Slider
                      value={[tool.value]}
                      onValueChange={([value]) => updateAdjustment(tool.id as any, value)}
                      min={tool.min}
                      max={tool.max}
                      step={tool.step}
                      className="w-full"
                    />
                  </div>
                )
              })()}
            </div>
          )}

          {/* Quick Access Buttons */}
          <div className="flex justify-center space-x-4 pt-2 border-t border-gray-100">
            <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
              <Palette className="w-4 h-4" />
              <span>More Tools</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
              <Frame className="w-4 h-4" />
              <span>Frames</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
