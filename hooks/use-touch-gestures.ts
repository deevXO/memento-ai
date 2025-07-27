"use client"

import { useRef, useCallback, useEffect } from "react"

interface TouchGestureOptions {
  onPinch?: (scale: number, center: { x: number; y: number }) => void
  onPan?: (deltaX: number, deltaY: number) => void
  onSwipe?: (direction: "left" | "right" | "up" | "down", velocity: number) => void
  onTap?: (x: number, y: number) => void
  onDoubleTap?: (x: number, y: number) => void
}

export function useTouchGestures(options: TouchGestureOptions) {
  const elementRef = useRef<HTMLElement>(null)
  const touchesRef = useRef<Touch[]>([])
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null)
  const initialDistanceRef = useRef<number>(0)
  const initialCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const lastPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null)

  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  const getCenter = useCallback((touch1: Touch, touch2: Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    }
  }, [])

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      touchesRef.current = Array.from(e.touches)

      if (e.touches.length === 2) {
        // Pinch gesture start
        const [touch1, touch2] = e.touches
        initialDistanceRef.current = getDistance(touch1, touch2)
        initialCenterRef.current = getCenter(touch1, touch2)
      } else if (e.touches.length === 1) {
        // Pan or swipe gesture start
        const touch = e.touches[0]
        lastPanRef.current = { x: touch.clientX, y: touch.clientY }
        swipeStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
      }
    },
    [getDistance, getCenter],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      touchesRef.current = Array.from(e.touches)

      if (e.touches.length === 2 && options.onPinch) {
        // Pinch gesture
        const [touch1, touch2] = e.touches
        const currentDistance = getDistance(touch1, touch2)
        const currentCenter = getCenter(touch1, touch2)

        if (initialDistanceRef.current > 0) {
          const scale = currentDistance / initialDistanceRef.current
          options.onPinch(scale, currentCenter)
        }
      } else if (e.touches.length === 1 && options.onPan) {
        // Pan gesture
        const touch = e.touches[0]
        const deltaX = touch.clientX - lastPanRef.current.x
        const deltaY = touch.clientY - lastPanRef.current.y

        options.onPan(deltaX, deltaY)
        lastPanRef.current = { x: touch.clientX, y: touch.clientY }
      }
    },
    [options, getDistance, getCenter],
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const wasSwipe = swipeStartRef.current && e.changedTouches.length === 1
      const wasTap = e.changedTouches.length === 1 && touchesRef.current.length === 1

      if (wasSwipe && options.onSwipe && swipeStartRef.current) {
        const touch = e.changedTouches[0]
        const deltaX = touch.clientX - swipeStartRef.current.x
        const deltaY = touch.clientY - swipeStartRef.current.y
        const deltaTime = Date.now() - swipeStartRef.current.time
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const velocity = distance / deltaTime

        // Minimum swipe distance and velocity
        if (distance > 50 && velocity > 0.3) {
          const absX = Math.abs(deltaX)
          const absY = Math.abs(deltaY)

          if (absX > absY) {
            options.onSwipe(deltaX > 0 ? "right" : "left", velocity)
          } else {
            options.onSwipe(deltaY > 0 ? "down" : "up", velocity)
          }
        }
      }

      if (wasTap) {
        const touch = e.changedTouches[0]
        const now = Date.now()
        const tapX = touch.clientX
        const tapY = touch.clientY

        // Check for double tap
        if (
          lastTapRef.current &&
          now - lastTapRef.current.time < 300 &&
          Math.abs(tapX - lastTapRef.current.x) < 50 &&
          Math.abs(tapY - lastTapRef.current.y) < 50
        ) {
          if (options.onDoubleTap) {
            options.onDoubleTap(tapX, tapY)
          }
          lastTapRef.current = null
        } else {
          lastTapRef.current = { time: now, x: tapX, y: tapY }

          // Single tap with delay to check for double tap
          setTimeout(() => {
            if (lastTapRef.current && lastTapRef.current.time === now && options.onTap) {
              options.onTap(tapX, tapY)
            }
          }, 300)
        }
      }

      touchesRef.current = Array.from(e.touches)

      // Reset gesture states
      if (e.touches.length === 0) {
        initialDistanceRef.current = 0
        swipeStartRef.current = null
      }
    },
    [options],
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener("touchstart", handleTouchStart, { passive: false })
    element.addEventListener("touchmove", handleTouchMove, { passive: false })
    element.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return elementRef
}
