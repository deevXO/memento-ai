"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Effect {
  id: string
  label: string
  icon: string
  description: string
  params: any[]
}

interface EffectCardProps {
  effect: Effect
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
  isMobile?: boolean
}

export function EffectCard({ effect, isSelected, onClick, disabled, isMobile }: EffectCardProps) {
  return (
    <Card
      className={`${isMobile ? "p-4" : "p-3"} cursor-pointer transition-all hover:shadow-md active:scale-95 ${
        isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-start space-x-3">
        <div className={`${isMobile ? "text-3xl" : "text-2xl"} flex-shrink-0`}>{effect.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`${isMobile ? "text-base" : "text-sm"} font-medium text-gray-900 truncate`}>
              {effect.label}
            </h4>
            {effect.params.length > 0 && (
              <Badge variant="secondary" className={`${isMobile ? "text-xs" : "text-xs"} ml-2 flex-shrink-0`}>
                Customizable
              </Badge>
            )}
          </div>
          <p className={`${isMobile ? "text-sm" : "text-xs"} text-gray-600 mt-1 ${isMobile ? "line-clamp-2" : ""}`}>
            {effect.description}
          </p>
        </div>
      </div>
    </Card>
  )
}
