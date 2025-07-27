"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEditorStore } from "@/lib/store/editor-store"
import { useMediaQuery } from "@/hooks/use-media-query"
import { AVAILABLE_EFFECTS } from "@/lib/api/process"
import { EffectCard } from "@/components/effect-card"

export function AIEffectsPanel() {
  const { applyEffect, isProcessing } = useEditorStore()
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null)
  const [effectParams, setEffectParams] = useState<Record<string, any>>({})
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleEffectSelect = (effectId: string) => {
    setSelectedEffect(effectId)
    const effect = AVAILABLE_EFFECTS.find((e) => e.id === effectId)
    if (effect) {
      const defaultParams: Record<string, any> = {}
      effect.params.forEach((param) => {
        if ("default" in param) {
          defaultParams[param.name] = param.default
        }
      })
      setEffectParams(defaultParams)
    }
  }

  const handleApplyEffect = async () => {
    if (selectedEffect) {
      await applyEffect(selectedEffect, effectParams)
      setSelectedEffect(null)
      setEffectParams({})
    }
  }

  const selectedEffectData = AVAILABLE_EFFECTS.find((e) => e.id === selectedEffect)

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">AI Effects</h3>

      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1"} gap-3`}>
        {AVAILABLE_EFFECTS.map((effect) => (
          <EffectCard
            key={effect.id}
            effect={effect}
            isSelected={selectedEffect === effect.id}
            onClick={() => handleEffectSelect(effect.id)}
            disabled={isProcessing}
            isMobile={isMobile}
          />
        ))}
      </div>

      {selectedEffect && selectedEffectData && (
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium text-gray-900">Effect Settings</h4>

          {selectedEffectData.params.map((param) => (
            <div key={param.name} className="space-y-3">
              <label className={`${isMobile ? "text-sm" : "text-sm"} font-medium text-gray-700 capitalize block`}>
                {param.name.replace(/([A-Z])/g, " $1").toLowerCase()}
              </label>

              {param.type === "slider" && (
                <div className="space-y-2">
                  <div className="px-1">
                    <Slider
                      value={[effectParams[param.name] || param.default]}
                      onValueChange={([value]) => setEffectParams((prev) => ({ ...prev, [param.name]: value }))}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      className={`w-full ${isMobile ? "h-6" : "h-5"}`}
                    />
                    {isMobile && (
                      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                        <span>{param.min}</span>
                        <span>{param.max}</span>
                      </div>
                    )}
                  </div>
                  <div className={`${isMobile ? "text-sm" : "text-xs"} text-gray-500 text-right`}>
                    {effectParams[param.name] || param.default}
                  </div>
                </div>
              )}

              {param.type === "select" && (
                <Select
                  value={effectParams[param.name] || param.default}
                  onValueChange={(value) => setEffectParams((prev) => ({ ...prev, [param.name]: value }))}
                >
                  <SelectTrigger className={isMobile ? "h-12" : "h-10"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {param.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {param.type === "color" && (
                <input
                  type="color"
                  value={effectParams[param.name] || param.default}
                  onChange={(e) => setEffectParams((prev) => ({ ...prev, [param.name]: e.target.value }))}
                  className={`w-full ${isMobile ? "h-12" : "h-10"} rounded border border-gray-300 cursor-pointer`}
                />
              )}
            </div>
          ))}

          <div className={`flex ${isMobile ? "flex-col space-y-2" : "flex-row space-x-2"} pt-2`}>
            <Button
              onClick={handleApplyEffect}
              disabled={isProcessing}
              className={`${isMobile ? "w-full h-12" : "flex-1"}`}
            >
              {isProcessing ? "Processing..." : "Apply Effect"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedEffect(null)
                setEffectParams({})
              }}
              disabled={isProcessing}
              className={`${isMobile ? "w-full h-12" : ""}`}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
