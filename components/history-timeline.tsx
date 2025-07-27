"use client"

import { useEditorStore } from "@/lib/store/editor-store"
import { Button } from "@/components/ui/button"
import { RotateCcw, RotateCw } from "lucide-react"

export function HistoryTimeline() {
  const { history, historyIndex, undo, redo } = useEditorStore()

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Undo
        </Button>

        <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
          <RotateCw className="w-4 h-4 mr-1" />
          Redo
        </Button>
      </div>

      <div className="flex-1">
        <div className="flex items-center space-x-1">
          {history.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${index <= historyIndex ? "bg-blue-500" : "bg-gray-300"}`}
            />
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Step {historyIndex + 1} of {history.length}
        </div>
      </div>
    </div>
  )
}
