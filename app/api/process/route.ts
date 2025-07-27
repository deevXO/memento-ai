import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File
    const effect = formData.get("effect") as string
    const params = JSON.parse((formData.get("params") as string) || "{}")

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // In a real implementation, this would connect to your Python backend
    // For demo purposes, we'll simulate processing by returning the original image
    // with some basic client-side effects applied

    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

    try {
      // Forward request to Python backend
      const backendFormData = new FormData()
      backendFormData.append("image", image)
      backendFormData.append("effect", effect)
      backendFormData.append("params", JSON.stringify(params))

      const response = await fetch(`${pythonBackendUrl}/process`, {
        method: "POST",
        body: backendFormData,
      })

      if (!response.ok) {
        throw new Error(`Backend processing failed: ${response.statusText}`)
      }

      const processedImage = await response.blob()

      return new Response(processedImage, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-cache",
        },
      })
    } catch (backendError) {
      console.warn("Python backend not available, using mock processing:", backendError)

      // Mock processing - return original image for demo
      if (effect === "crop") {
        // Mock crop processing - in real implementation, this would crop the image
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        return new Promise((resolve) => {
          img.onload = () => {
            canvas.width = params.width || img.width
            canvas.height = params.height || img.height

            ctx?.drawImage(
              img,
              params.x || 0,
              params.y || 0,
              params.width || img.width,
              params.height || img.height,
              0,
              0,
              canvas.width,
              canvas.height,
            )

            canvas.toBlob((blob) => {
              resolve(
                new Response(blob, {
                  headers: {
                    "Content-Type": "image/png",
                    "Cache-Control": "no-cache",
                  },
                }),
              )
            }, "image/png")
          }
          img.src = URL.createObjectURL(image)
        })
      }

      if (effect === "resize") {
        // Mock resize processing - in real implementation, this would resize with proper interpolation
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        return new Promise((resolve) => {
          img.onload = () => {
            canvas.width = params.width || img.width
            canvas.height = params.height || img.height

            // Set interpolation method
            if (ctx) {
              ctx.imageSmoothingEnabled = params.interpolation !== "nearest"
              if (params.interpolation === "bicubic") {
                ctx.imageSmoothingQuality = "high"
              }
            }

            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

            canvas.toBlob((blob) => {
              resolve(
                new Response(blob, {
                  headers: {
                    "Content-Type": "image/png",
                    "Cache-Control": "no-cache",
                  },
                }),
              )
            }, "image/png")
          }
          img.src = URL.createObjectURL(image)
        })
      }
      const buffer = await image.arrayBuffer()
      return new Response(buffer, {
        headers: {
          "Content-Type": image.type,
          "Cache-Control": "no-cache",
        },
      })
    }
  } catch (error) {
    console.error("Processing error:", error)
    return NextResponse.json({ error: "Image processing failed" }, { status: 500 })
  }
}
