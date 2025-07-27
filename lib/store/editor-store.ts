import { create } from "zustand"
import { processImage } from "@/lib/api/process"

interface TextOverlay {
  id: string
  content: string
  position: [number, number]
  style: {
    fontSize: number
    color: string
    fontFamily: string
  }
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
  aspectRatio?: number
}

interface ResizeSettings {
  width: number
  height: number
  maintainAspectRatio: boolean
  interpolation: "nearest" | "bilinear" | "bicubic"
  unit: "px" | "%"
}

interface EditorState {
  originalImage: string | null
  currentImage: string | null
  history: string[]
  historyIndex: number
  isProcessing: boolean
  effects: {
    brightness: number
    contrast: number
    saturation: number
    hue: number
    blur: number
    activeEffect: string | null
  }
  frames: {
    type: "polaroid" | "instagram" | "vintage" | null
    color: string
  }
  textOverlays: TextOverlay[]
  cropArea: CropArea | null
  resizeSettings: ResizeSettings
  activeTool: "none" | "crop" | "resize" | "adjust" | "effects" | "frames"
  imageMetadata: {
    originalWidth: number
    originalHeight: number
    currentWidth: number
    currentHeight: number
  } | null
}

interface EditorActions {
  loadImage: (imageUrl: string) => void
  applyEffect: (effect: string, params?: Record<string, any>) => Promise<void>
  updateAdjustment: (key: keyof EditorState["effects"], value: number) => void
  addTextOverlay: (overlay: Omit<TextOverlay, "id">) => void
  removeTextOverlay: (id: string) => void
  setFrame: (type: EditorState["frames"]["type"], color?: string) => void
  undo: () => void
  redo: () => void
  reset: () => void
  exportImage: (format: string, quality: number) => Promise<void>
  setCropArea: (crop: CropArea | null) => void
  applyCrop: () => Promise<void>
  setResizeSettings: (settings: Partial<ResizeSettings>) => void
  applyResize: () => Promise<void>
  setActiveTool: (tool: EditorState["activeTool"]) => void
  setImageMetadata: (metadata: EditorState["imageMetadata"]) => void
}

export const useEditorStore = create<EditorState & EditorActions>()((set, get) => ({
  originalImage: null,
  currentImage: null,
  history: [],
  historyIndex: -1,
  isProcessing: false,
  effects: {
    brightness: 1,
    contrast: 1,
    saturation: 1,
    hue: 0,
    blur: 0,
    activeEffect: null,
  },
  frames: {
    type: null,
    color: "#ffffff",
  },
  textOverlays: [],
  cropArea: null,
  resizeSettings: {
    width: 800,
    height: 600,
    maintainAspectRatio: true,
    interpolation: "bilinear",
    unit: "px",
  },
  activeTool: "none",
  imageMetadata: null,

  loadImage: (imageUrl: string) => {
    // Create image to get dimensions
    const img = new Image()
    img.onload = () => {
      set({
        imageMetadata: {
          originalWidth: img.width,
          originalHeight: img.height,
          currentWidth: img.width,
          currentHeight: img.height,
        },
      })
    }
    img.src = imageUrl

    set({
      originalImage: imageUrl,
      currentImage: imageUrl,
      history: [imageUrl],
      historyIndex: 0,
      effects: {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        hue: 0,
        blur: 0,
        activeEffect: null,
      },
      textOverlays: [],
      cropArea: null,
      activeTool: "none",
    })
  },

  applyEffect: async (effect: string, params = {}) => {
    const { currentImage } = get()
    if (!currentImage) return

    set({ isProcessing: true })

    try {
      // Convert data URL to blob for processing
      const response = await fetch(currentImage)
      const blob = await response.blob()

      const processedBlob = await processImage(blob, effect, params)
      const processedUrl = URL.createObjectURL(processedBlob)

      set((state) => {
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        newHistory.push(processedUrl)

        return {
          currentImage: processedUrl,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          effects: { ...state.effects, activeEffect: effect },
        }
      })
    } catch (error) {
      console.error("Error applying effect:", error)
    } finally {
      set({ isProcessing: false })
    }
  },

  updateAdjustment: (key: keyof EditorState["effects"], value: number) => {
    set((state) => ({
      effects: { ...state.effects, [key]: value },
    }))
  },

  addTextOverlay: (overlay: Omit<TextOverlay, "id">) => {
    set((state) => ({
      textOverlays: [...state.textOverlays, { ...overlay, id: Math.random().toString(36).substr(2, 9) }],
    }))
  },

  removeTextOverlay: (id: string) => {
    set((state) => ({
      textOverlays: state.textOverlays.filter((overlay) => overlay.id !== id),
    }))
  },

  setFrame: (type: EditorState["frames"]["type"], color = "#ffffff") => {
    set((state) => ({
      frames: { ...state.frames, type, color },
    }))
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1
        return {
          currentImage: state.history[newIndex],
          historyIndex: newIndex,
        }
      }
      return state
    })
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1
        return {
          currentImage: state.history[newIndex],
          historyIndex: newIndex,
        }
      }
      return state
    })
  },

  reset: () => {
    const { originalImage } = get()
    if (originalImage) {
      set({
        currentImage: originalImage,
        history: [originalImage],
        historyIndex: 0,
        effects: {
          brightness: 1,
          contrast: 1,
          saturation: 1,
          hue: 0,
          blur: 0,
          activeEffect: null,
        },
        textOverlays: [],
      })
    }
  },

  exportImage: async (format: string, quality: number) => {
    const { currentImage } = get()
    if (!currentImage) return

    // Create download link
    const link = document.createElement("a")
    link.href = currentImage
    link.download = `edited-image.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  setCropArea: (crop: CropArea | null) => {
    set({ cropArea: crop })
  },

  applyCrop: async () => {
    const { currentImage, cropArea } = get()
    if (!currentImage || !cropArea) return

    set({ isProcessing: true })

    try {
      const response = await fetch(currentImage)
      const blob = await response.blob()

      const processedBlob = await processImage(blob, "crop", {
        x: cropArea.x,
        y: cropArea.y,
        width: cropArea.width,
        height: cropArea.height,
      })

      const processedUrl = URL.createObjectURL(processedBlob)

      set((state) => {
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        newHistory.push(processedUrl)

        return {
          currentImage: processedUrl,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          cropArea: null,
          activeTool: "none",
        }
      })
    } catch (error) {
      console.error("Error applying crop:", error)
    } finally {
      set({ isProcessing: false })
    }
  },

  setResizeSettings: (settings: Partial<ResizeSettings>) => {
    set((state) => ({
      resizeSettings: { ...state.resizeSettings, ...settings },
    }))
  },

  applyResize: async () => {
    const { currentImage, resizeSettings } = get()
    if (!currentImage) return

    set({ isProcessing: true })

    try {
      const response = await fetch(currentImage)
      const blob = await response.blob()

      const processedBlob = await processImage(blob, "resize", resizeSettings)
      const processedUrl = URL.createObjectURL(processedBlob)

      set((state) => {
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        newHistory.push(processedUrl)

        return {
          currentImage: processedUrl,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          activeTool: "none",
        }
      })
    } catch (error) {
      console.error("Error applying resize:", error)
    } finally {
      set({ isProcessing: false })
    }
  },

  setActiveTool: (tool: EditorState["activeTool"]) => {
    set({ activeTool: tool })
  },

  setImageMetadata: (metadata: EditorState["imageMetadata"]) => {
    set({ imageMetadata: metadata })
  },
}))
