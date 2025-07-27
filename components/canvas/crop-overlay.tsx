"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { useEditorStore } from "@/lib/store/editor-store"
import { useTouchGestures } from "@/hooks/use-touch-gestures"
import { useMediaQuery } from "@/hooks/use-media-query"

interface CropOverlayProps {
  canvasWidth: number
  canvasHeight: number
  imageWidth: number
  imageHeight: number
}

export function CropOverlay({ canvasWidth, canvasHeight, imageWidth, imageHeight }: CropOverlayProps) {
  const { cropArea, setCropArea, activeTool } = useEditorStore()
  const overlayRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialCrop, setInitialCrop] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTouch = useMediaQuery("(pointer: coarse)")

  // Calculate scale factors
  const scaleX = canvasWidth / imageWidth
  const scaleY = canvasHeight / imageHeight

  // Touch gesture handling for mobile
  const gestureRef = useTouchGestures({
    onPan: useCallback(
      (deltaX: number, deltaY: number) => {
        if (!cropArea || !isDragging) return

        if (dragHandle === "move") {
          const newX = Math.max(0, Math.min(imageWidth - cropArea.width, initialCrop.x + deltaX / scaleX))
          const newY = Math.max(0, Math.min(imageHeight - cropArea.height, initialCrop.y + deltaY / scaleY))

          setCropArea({
            ...cropArea,
            x: newX,
            y: newY,
          })
        }
      },
      [cropArea, isDragging, dragHandle, initialCrop, scaleX, scaleY, imageWidth, imageHeight, setCropArea],
    ),
  })

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: string) => {
      e.preventDefault()
      e.stopPropagation()

      if (!cropArea) return

      setIsDragging(true)
      setDragHandle(handle)
      setDragStart({ x: e.clientX, y: e.clientY })
      setInitialCrop({ ...cropArea })
    },
    [cropArea],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !cropArea || !dragHandle) return

      const deltaX = (e.clientX - dragStart.x) / scaleX
      const deltaY = (e.clientY - dragStart.y) / scaleY

      const newCrop = { ...initialCrop }

      switch (dragHandle) {
        case "move":
          newCrop.x = Math.max(0, Math.min(imageWidth - cropArea.width, initialCrop.x + deltaX))
          newCrop.y = Math.max(0, Math.min(imageHeight - cropArea.height, initialCrop.y + deltaY))
          break

        case "nw":
          newCrop.x = Math.max(0, initialCrop.x + deltaX)
          newCrop.y = Math.max(0, initialCrop.y + deltaY)
          newCrop.width = Math.max(50, initialCrop.width - deltaX)
          newCrop.height = Math.max(50, initialCrop.height - deltaY)
          break

        case "ne":
          newCrop.y = Math.max(0, initialCrop.y + deltaY)
          newCrop.width = Math.max(50, Math.min(imageWidth - newCrop.x, initialCrop.width + deltaX))
          newCrop.height = Math.max(50, initialCrop.height - deltaY)
          break

        case "sw":
          newCrop.x = Math.max(0, initialCrop.x + deltaX)
          newCrop.width = Math.max(50, initialCrop.width - deltaX)
          newCrop.height = Math.max(50, Math.min(imageHeight - newCrop.y, initialCrop.height + deltaY))
          break

        case "se":
          newCrop.width = Math.max(50, Math.min(imageWidth - newCrop.x, initialCrop.width + deltaX))
          newCrop.height = Math.max(50, Math.min(imageHeight - newCrop.y, initialCrop.height + deltaY))
          break

        case "n":
          newCrop.y = Math.max(0, initialCrop.y + deltaY)
          newCrop.height = Math.max(50, initialCrop.height - deltaY)
          break

        case "s":
          newCrop.height = Math.max(50, Math.min(imageHeight - newCrop.y, initialCrop.height + deltaY))
          break

        case "w":
          newCrop.x = Math.max(0, initialCrop.x + deltaX)
          newCrop.width = Math.max(50, initialCrop.width - deltaX)
          break

        case "e":
          newCrop.width = Math.max(50, Math.min(imageWidth - newCrop.x, initialCrop.width + deltaX))
          break
      }

      // Maintain aspect ratio if set
      if (cropArea.aspectRatio && dragHandle !== "move") {
        if (dragHandle.includes("w") || dragHandle.includes("e")) {
          newCrop.height = newCrop.width / cropArea.aspectRatio
        } else if (dragHandle.includes("n") || dragHandle.includes("s")) {
          newCrop.width = newCrop.height * cropArea.aspectRatio
        }
      }

      // Ensure crop stays within bounds
      newCrop.x = Math.max(0, Math.min(imageWidth - newCrop.width, newCrop.x))
      newCrop.y = Math.max(0, Math.min(imageHeight - newCrop.height, newCrop.y))
      newCrop.width = Math.min(imageWidth - newCrop.x, newCrop.width)
      newCrop.height = Math.min(imageHeight - newCrop.y, newCrop.height)

      setCropArea({
        ...newCrop,
        aspectRatio: cropArea.aspectRatio,
      })
    },
    [isDragging, cropArea, dragHandle, dragStart, initialCrop, scaleX, scaleY, imageWidth, imageHeight, setCropArea],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragHandle(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  if (activeTool !== "crop" || !cropArea) return null

  const cropStyle = {
    left: `${cropArea.x * scaleX}px`,
    top: `${cropArea.y * scaleY}px`,
    width: `${cropArea.width * scaleX}px`,
    height: `${cropArea.height * scaleY}px`,
  }

  const handleSize = isMobile ? 20 : 12

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: canvasWidth, height: canvasHeight }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Crop area */}
      <div
        className="absolute border-2 border-white shadow-lg pointer-events-auto cursor-move"
        style={cropStyle}
        onMouseDown={(e) => handleMouseDown(e, "move")}
        ref={isTouch ? gestureRef : undefined}
      >
        {/* Clear area */}
        <div className="absolute inset-0 bg-transparent" />

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Rule of thirds grid */}
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white opacity-50" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white opacity-50" />
          <div className="absolute top-1/3 left-0 right-0 h-px bg-white opacity-50" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-white opacity-50" />
        </div>

        {/* Resize handles */}
        {!isTouch && (
          <>
            {/* Corner handles */}
            <div
              className="absolute bg-white border border-gray-400 cursor-nw-resize"
              style={{
                left: -handleSize / 2,
                top: -handleSize / 2,
                width: handleSize,
                height: handleSize,
              }}
              onMouseDown={(e) => handleMouseDown(e, "nw")}
            />
            <div
              className="absolute bg-white border border-gray-400 cursor-ne-resize"
              style={{
                right: -handleSize / 2,
                top: -handleSize / 2,
                width: handleSize,
                height: handleSize,
              }}
              onMouseDown={(e) => handleMouseDown(e, "ne")}
            />
            <div
              className="absolute bg-white border border-gray-400 cursor-sw-resize"
              style={{
                left: -handleSize / 2,
                bottom: -handleSize / 2,
                width: handleSize,
                height: handleSize,
              }}
              onMouseDown={(e) => handleMouseDown(e, "sw")}
            />
            <div
              className="absolute bg-white border border-gray-400 cursor-se-resize"
              style={{
                right: -handleSize / 2,
                bottom: -handleSize / 2,
                width: handleSize,
                height: handleSize,
              }}
              onMouseDown={(e) => handleMouseDown(e, "se")}
            />

            {/* Edge handles */}
            <div
              className="absolute bg-white border border-gray-400 cursor-n-resize"
              style={{
                left: "50%",
                top: -handleSize / 2,
                width: handleSize,
                height: handleSize,
                transform: "translateX(-50%)",
              }}
              onMouseDown={(e) => handleMouseDown(e, "n")}
            />
            <div
              className="absolute bg-white border border-gray-400 cursor-s-resize"
              style={{
                left: "50%",
                bottom: -handleSize / 2,
                width: handleSize,
                height: handleSize,
                transform: "translateX(-50%)",
              }}
              onMouseDown={(e) => handleMouseDown(e, "s")}
            />
            <div
              className="absolute bg-white border border-gray-400 cursor-w-resize"
              style={{
                left: -handleSize / 2,
                top: "50%",
                width: handleSize,
                height: handleSize,
                transform: "translateY(-50%)",
              }}
              onMouseDown={(e) => handleMouseDown(e, "w")}
            />
            <div
              className="absolute bg-white border border-gray-400 cursor-e-resize"
              style={{
                right: -handleSize / 2,
                top: "50%",
                width: handleSize,
                height: handleSize,
                transform: "translateY(-50%)",
              }}
              onMouseDown={(e) => handleMouseDown(e, "e")}
            />
          </>
        )}

        {/* Mobile touch handles */}
        {isTouch && (
          <>
            <div
              className="absolute bg-white border-2 border-blue-500 rounded-full shadow-lg"
              style={{
                left: -handleSize / 2,
                top: -handleSize / 2,
                width: handleSize,
                height: handleSize,
              }}
              onTouchStart={(e) => {
                e.preventDefault()
                setIsDragging(true)
                setDragHandle("nw")
                const touch = e.touches[0]
                setDragStart({ x: touch.clientX, y: touch.clientY })
                setInitialCrop({ ...cropArea })
              }}
            />
            <div
              className="absolute bg-white border-2 border-blue-500 rounded-full shadow-lg"
              style={{
                right: -handleSize / 2,
                bottom: -handleSize / 2,
                width: handleSize,
                height: handleSize,
              }}
              onTouchStart={(e) => {
                e.preventDefault()
                setIsDragging(true)
                setDragHandle("se")
                const touch = e.touches[0]
                setDragStart({ x: touch.clientX, y: touch.clientY })
                setInitialCrop({ ...cropArea })
              }}
            />
          </>
        )}
      </div>

      {/* Crop info overlay */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-mono">
        {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
      </div>
    </div>
  )
}
