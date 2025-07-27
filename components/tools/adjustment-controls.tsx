"use client"

import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/lib/store/editor-store"
import { useMediaQuery } from "@/hooks/use-media-query"
import { RotateCcw } from "lucide-react"

export function AdjustmentControls() {
  const { effects, updateAdjustment, reset } = useEditorStore()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const adjustments = [
    { key: "brightness" as const, label: "Brightness", min: 0, max: 2, step: 0.1, default: 1, icon: "☀️" },
    { key: "contrast" as const, label: "Contrast", min: 0, max: 2, step: 0.1, default: 1, icon: "🔆" },
    { key: "saturation" as const, label: "Saturation", min: 0, max: 2, step: 0.1, default: 1, icon: "🌈" },
    { key: "hue" as const, label: "Hue", min: -180, max: 180, step: 1, default: 0, icon: "🎨" },
    { key: "blur" as const, label: "Blur", min: 0, max: 10, step: 0.5, default: 0, icon: "🌫️" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Adjustments</h3>
        <Button variant="ghost" size="sm" onClick={reset} className="text-gray-500 hover:text-gray-700">
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      {adjustments.map(({ key, label, min, max, step, default: defaultValue, icon }) => (
        <div key={key} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{icon}</span>
              <label className={`${isMobile ? "text-sm" : "text-sm"} font-medium text-gray-700`}>{label}</label>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`${isMobile ? "text-sm" : "text-sm"} text-gray-500 min-w-[3rem] text-right`}>
                {key === "hue" ? `${effects[key]}°` : effects[key].toFixed(1)}
              </span>
              {effects[key] !== defaultValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateAdjustment(key, defaultValue)}
                  className="text-xs text-gray-500 hover:text-gray-700 p-1 h-auto min-w-[50px]"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          <div className="px-1">
            <Slider
              value={[effects[key]]}
              onValueChange={([value]) => updateAdjustment(key, value)}
              min={min}
              max={max}
              step={step}
              className={`w-full ${isMobile ? "h-6" : "h-5"}`}
            />

            {/* Value indicators for mobile */}
            {isMobile && (
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                <span>{min}</span>
                <span>{max}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
