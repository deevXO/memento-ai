export async function processImage(image: Blob, effect: string, params: Record<string, any> = {}): Promise<Blob> {
  const formData = new FormData()
  formData.append("image", image)
  formData.append("effect", effect)
  formData.append("params", JSON.stringify(params))

  const response = await fetch("/api/process", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Processing failed: ${await response.text()}`)
  }

  return await response.blob()
}

export const AVAILABLE_EFFECTS = [
  {
    id: "remove-bg",
    label: "Remove Background",
    icon: "🖼️",
    description: "Automatically remove the background from your image",
    params: [],
  },
  {
    id: "cartoon",
    label: "Cartoon Effect",
    icon: "🎨",
    description: "Transform your photo into a cartoon-style image",
    params: [
      { name: "lineIntensity", type: "slider", min: 0.1, max: 1, step: 0.1, default: 0.7 },
      { name: "colorIntensity", type: "slider", min: 0.1, max: 1, step: 0.1, default: 0.8 },
    ],
  },
  {
    id: "colorize",
    label: "Colorize B&W",
    icon: "🌈",
    description: "Add color to black and white photos",
    params: [],
  },
  {
    id: "face-detect",
    label: "Face Detection",
    icon: "👤",
    description: "Detect and highlight faces in the image",
    params: [{ name: "boxColor", type: "color", default: "#ff0000" }],
  },
  {
    id: "style-transfer",
    label: "Style Transfer",
    icon: "🎭",
    description: "Apply artistic styles to your image",
    params: [{ name: "style", type: "select", options: ["van-gogh", "picasso", "monet"], default: "van-gogh" }],
  },
  {
    id: "enhance",
    label: "AI Enhance",
    icon: "✨",
    description: "Enhance image quality using AI",
    params: [{ name: "strength", type: "slider", min: 0.1, max: 2, step: 0.1, default: 1 }],
  },
  {
    id: "crop",
    label: "Crop Image",
    icon: "✂️",
    description: "Crop image to specified dimensions",
    params: [
      { name: "x", type: "number", default: 0 },
      { name: "y", type: "number", default: 0 },
      { name: "width", type: "number", default: 100 },
      { name: "height", type: "number", default: 100 },
    ],
  },
  {
    id: "resize",
    label: "Resize Image",
    icon: "📏",
    description: "Resize image to specified dimensions",
    params: [
      { name: "width", type: "number", default: 800 },
      { name: "height", type: "number", default: 600 },
      { name: "maintainAspectRatio", type: "boolean", default: true },
      { name: "interpolation", type: "select", options: ["nearest", "bilinear", "bicubic"], default: "bilinear" },
    ],
  },
]
