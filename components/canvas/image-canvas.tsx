"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { useEditorStore } from "@/lib/store/editor-store"
import { useTouchGestures } from "@/hooks/use-touch-gestures"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Maximize } from "lucide-react"
import { CropOverlay } from "./crop-overlay"

export function ImageCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentImage, originalImage, effects, textOverlays, frames, activeTool, setImageMetadata } = useEditorStore()

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [transform, setTransform] = useState({ scale: 1, translateX: 0, translateY: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTouch = useMediaQuery("(pointer: coarse)")

  // Touch gesture handling
  const gestureRef = useTouchGestures({
    onPinch: useCallback((scale: number, center: { x: number; y: number }) => {
      setTransform((prev) => ({
        ...prev,
        scale: Math.max(0.5, Math.min(3, prev.scale * scale)),
      }))
    }, []),

    onPan: useCallback(
      (deltaX: number, deltaY: number) => {
        if (transform.scale > 1) {
          setTransform((prev) => ({
            ...prev,
            translateX: prev.translateX + deltaX,
            translateY: prev.translateY + deltaY,
          }))
        }
      },
      [transform.scale],
    ),

    onDoubleTap: useCallback((x: number, y: number) => {
      setTransform((prev) => ({
        scale: prev.scale === 1 ? 2 : 1,
        translateX: prev.scale === 1 ? 0 : prev.translateX,
        translateY: prev.scale === 1 ? 0 : prev.translateY,
      }))
    }, []),

    onSwipe: useCallback(
      (direction: string, velocity: number) => {
        if (direction === "up" && velocity > 0.5) {
          setIsFullscreen(true)
        } else if (direction === "down" && velocity > 0.5 && isFullscreen) {
          setIsFullscreen(false)
        }
      },
      [isFullscreen],
    ),
  })

  const resetTransform = useCallback(() => {
    setTransform({ scale: 1, translateX: 0, translateY: 0 })
  }, [])

  const zoomIn = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(3, prev.scale * 1.2),
    }))
  }, [])

  const zoomOut = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.5, prev.scale / 1.2),
    }))
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  const drawFrame = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, type: string, color: string) => {
      const lineWidth = isMobile ? 15 : 20
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth

      switch (type) {
        case "polaroid":
          ctx.strokeRect(10, 10, width - 20, height - 60)
          ctx.fillStyle = color
          ctx.fillRect(10, height - 50, width - 20, 40)
          break
        case "instagram":
          ctx.lineWidth = isMobile ? 8 : 10
          ctx.strokeStyle = color
          const radius = isMobile ? 15 : 20
          ctx.beginPath()
          ctx.roundRect(10, 10, width - 20, height - 20, radius)
          ctx.stroke()
          break
        case "vintage":
          ctx.lineWidth = isMobile ? 12 : 15
          ctx.strokeStyle = color
          ctx.strokeRect(15, 15, width - 30, height - 30)
          ctx.strokeRect(5, 5, width - 10, height - 10)
          break
      }
    },
    [isMobile],
  )

  const drawTextOverlay = useCallback(
    (ctx: CanvasRenderingContext2D, overlay: any, canvasWidth: number, canvasHeight: number) => {
      const fontSize = isMobile ? overlay.style.fontSize * 0.8 : overlay.style.fontSize
      ctx.font = `${fontSize}px ${overlay.style.fontFamily}`
      ctx.fillStyle = overlay.style.color
      ctx.textAlign = "center"

      const x = (overlay.position[0] / 100) * canvasWidth
      const y = (overlay.position[1] / 100) * canvasHeight

      // Add text shadow for better visibility
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      ctx.fillText(overlay.content, x, y)

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    },
    [isMobile],
  )

  useEffect(() => {
    if (!currentImage || !canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const container = containerRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      console.error("Failed to get 2D context from canvas")
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      try {
        // Calculate responsive canvas size
        const containerRect = container.getBoundingClientRect()
        const containerWidth = containerRect.width - (isMobile ? 20 : 40)
        const containerHeight = containerRect.height - (isMobile ? 20 : 40)

        const aspectRatio = img.width / img.height
        let canvasWidth = containerWidth
        let canvasHeight = canvasWidth / aspectRatio

        if (canvasHeight > containerHeight) {
          canvasHeight = containerHeight
          canvasWidth = canvasHeight * aspectRatio
        }

        // Set device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1
        canvas.width = canvasWidth * dpr
        canvas.height = canvasHeight * dpr
        canvas.style.width = `${canvasWidth}px`
        canvas.style.height = `${canvasHeight}px`

        // Scale the context to match device pixel ratio
        ctx.scale(dpr, dpr)
        setDimensions({ width: canvasWidth, height: canvasHeight })

        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)

        // Apply CSS filters based on adjustments
        ctx.filter = `
          brightness(${effects.brightness})
          contrast(${effects.contrast})
          saturate(${effects.saturation})
          hue-rotate(${effects.hue}deg)
          blur(${effects.blur}px)
        `

        // Draw main image
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

        // Reset filter for overlays
        ctx.filter = "none"

        // Draw frame if selected
        if (frames.type) {
          drawFrame(ctx, canvasWidth, canvasHeight, frames.type, frames.color)
        }

        // Draw text overlays
        textOverlays.forEach((overlay) => {
          drawTextOverlay(ctx, overlay, canvasWidth, canvasHeight)
        })

        // Set image dimensions for crop overlay
        setImageDimensions({ width: img.width, height: img.height })

        // Update image metadata in store
        setImageMetadata({
          originalWidth: img.width,
          originalHeight: img.height,
          currentWidth: img.width,
          currentHeight: img.height,
        })
      } catch (error) {
        console.error("Error drawing on canvas:", error)
      }
    }

    img.onerror = (error) => {
      console.error("Error loading image:", error)
    }

    img.src = currentImage
  }, [currentImage, effects, textOverlays, frames, isMobile, setImageMetadata, drawFrame, drawTextOverlay])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Trigger re-render on resize with a small delay to ensure container dimensions are updated
      setTimeout(() => {
        if (currentImage) {
          // Force re-render by updating a state
          setDimensions((prev) => ({ ...prev }))
        }
      }, 100)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [currentImage])

  const handleShowOriginal = useCallback(
    (show: boolean) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          ctx.clearRect(0, 0, dimensions.width, dimensions.height)

          if (show) {
            // Show original without effects
            ctx.filter = "none"
          } else {
            // Show with current effects
            ctx.filter = `
            brightness(${effects.brightness})
            contrast(${effects.contrast})
            saturate(${effects.saturation})
            hue-rotate(${effects.hue}deg)
            blur(${effects.blur}px)
          `
          }

          ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height)
          ctx.filter = "none"
        } catch (error) {
          console.error("Error in show original:", error)
        }
      }

      img.src = show ? originalImage || currentImage : currentImage
    },
    [originalImage, currentImage, effects, dimensions],
  )

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center h-full bg-gray-100 rounded-lg overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 bg-black" : ""
      }`}
    >
      <div
        ref={gestureRef}
        className="relative touch-none"
        style={{
          transform: `scale(${transform.scale}) translate(${transform.translateX}px, ${transform.translateY}px)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <canvas
          ref={canvasRef}
          className={`border border-gray-300 rounded shadow-lg bg-white ${
            isFullscreen ? "max-w-full max-h-full" : "max-w-full max-h-full"
          }`}
        />

        {/* Crop Overlay */}
        {activeTool === "crop" && (
          <CropOverlay
            canvasWidth={dimensions.width}
            canvasHeight={dimensions.height}
            imageWidth={imageDimensions.width}
            imageHeight={imageDimensions.height}
          />
        )}

        {/* Before/After comparison toggle */}
        {originalImage && currentImage !== originalImage && (
          <div className={`absolute ${isMobile ? "top-2 right-2" : "top-4 right-4"}`}>
            <button
              className={`bg-black bg-opacity-50 text-white ${
                isMobile ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm"
              } rounded hover:bg-opacity-70 touch-manipulation`}
              onMouseDown={() => handleShowOriginal(true)}
              onMouseUp={() => handleShowOriginal(false)}
              onMouseLeave={() => handleShowOriginal(false)}
              onTouchStart={() => handleShowOriginal(true)}
              onTouchEnd={() => handleShowOriginal(false)}
            >
              {isMobile ? "Hold" : "Hold to see original"}
            </button>
          </div>
        )}
      </div>

      {/* Canvas Controls */}
      <div className={`absolute ${isMobile ? "bottom-2 right-2" : "bottom-4 right-4"} flex flex-col space-y-2`}>
        {(isTouch || isMobile) && (
          <>
            <Button
              variant="secondary"
              size={isMobile ? "sm" : "default"}
              onClick={zoomIn}
              className="bg-white bg-opacity-90 hover:bg-opacity-100"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size={isMobile ? "sm" : "default"}
              onClick={zoomOut}
              className="bg-white bg-opacity-90 hover:bg-opacity-100"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size={isMobile ? "sm" : "default"}
              onClick={resetTransform}
              className="bg-white bg-opacity-90 hover:bg-opacity-100"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </>
        )}

        {isMobile && (
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-white bg-opacity-90 hover:bg-opacity-100"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Zoom indicator */}
      {transform.scale !== 1 && (
        <div
          className={`absolute ${isMobile ? "top-2 left-2" : "top-4 left-4"} bg-black bg-opacity-50 text-white ${
            isMobile ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm"
          } rounded`}
        >
          {Math.round(transform.scale * 100)}%
        </div>
      )}

      {/* Touch instructions for first-time users */}
      {isMobile && transform.scale === 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 text-xs rounded animate-pulse">
          Pinch to zoom • Double tap to zoom • Swipe up for fullscreen
        </div>
      )}
    </div>
  )
}
