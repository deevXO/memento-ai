"use client"

import type React from "react"
import { useRef, useCallback, useState, useEffect } from "react"
import { Upload, Download, RotateCcw, RotateCw, Sparkles, Menu, Crop, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useEditorStore } from "@/lib/store/editor-store"
import { ImageCanvas } from "@/components/canvas/image-canvas"
import { AdjustmentControls } from "@/components/tools/adjustment-controls"
import { AIEffectsPanel } from "@/components/tools/ai-effects-panel"
import { FramesOverlaysPanel } from "@/components/tools/frames-overlays-panel"
import { HistoryTimeline } from "@/components/history-timeline"
import { MobileToolbar } from "@/components/mobile-toolbar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { CropTool } from "@/components/tools/crop-tool"
import { ResizeTool } from "@/components/tools/resize-tool"

export default function PhotoEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("adjustments")

  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")

  const {
    originalImage,
    currentImage,
    history,
    effects,
    isProcessing,
    loadImage,
    applyEffect,
    undo,
    redo,
    reset,
    exportImage,
    activeTool,
    setActiveTool,
  } = useEditorStore()

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string
          loadImage(imageUrl)
        }
        reader.readAsDataURL(file)
      }
    },
    [loadImage],
  )

  const handleExport = useCallback(async () => {
    if (currentImage) {
      await exportImage("png", 90)
    }
  }, [currentImage, exportImage])

  // Close panels when switching between mobile/desktop
  useEffect(() => {
    if (!isMobile) {
      setLeftPanelOpen(false)
      setRightPanelOpen(false)
    }
  }, [isMobile])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      {isMobile && (
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <Sheet open={leftPanelOpen} onOpenChange={setLeftPanelOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <MobileToolsPanel activeTab={activeTab} setActiveTab={setActiveTab} />
              </SheetContent>
            </Sheet>

            <h1 className="text-lg font-bold text-gray-900">AI Editor</h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              AI
            </Badge>
          </div>

          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={undo} disabled={history.length <= 1 || isProcessing}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={redo} disabled={isProcessing}>
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
              <Upload className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExport} disabled={!currentImage || isProcessing}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </header>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">AI Photo Editor</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>

              {currentImage && (
                <>
                  <Button
                    variant={activeTool === "crop" ? "default" : "outline"}
                    onClick={() => setActiveTool(activeTool === "crop" ? "none" : "crop")}
                    disabled={isProcessing}
                  >
                    <Crop className="w-4 h-4 mr-2" />
                    Crop
                  </Button>

                  <Button
                    variant={activeTool === "resize" ? "default" : "outline"}
                    onClick={() => setActiveTool(activeTool === "resize" ? "none" : "resize")}
                    disabled={isProcessing}
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Resize
                  </Button>
                </>
              )}

              <Button variant="outline" onClick={undo} disabled={history.length <= 1 || isProcessing}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={redo} disabled={isProcessing}>
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button onClick={handleExport} disabled={!currentImage || isProcessing}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left Toolbar */}
        {!isMobile && (
          <div
            className={`${isTablet ? "w-72" : "w-80"} bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0`}
          >
            <div className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="adjustments" className="text-xs">
                    Adjust
                  </TabsTrigger>
                  <TabsTrigger value="crop" className="text-xs">
                    Crop
                  </TabsTrigger>
                  <TabsTrigger value="resize" className="text-xs">
                    Resize
                  </TabsTrigger>
                  <TabsTrigger value="ai-effects" className="text-xs">
                    AI Effects
                  </TabsTrigger>
                  <TabsTrigger value="frames" className="text-xs">
                    Frames
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="adjustments" className="mt-4">
                  <AdjustmentControls />
                </TabsContent>

                <TabsContent value="crop" className="mt-4">
                  <CropTool />
                </TabsContent>

                <TabsContent value="resize" className="mt-4">
                  <ResizeTool />
                </TabsContent>

                <TabsContent value="ai-effects" className="mt-4">
                  <AIEffectsPanel />
                </TabsContent>

                <TabsContent value="frames" className="mt-4">
                  <FramesOverlaysPanel />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-3 md:p-6">
            {!originalImage ? (
              <div className="h-full flex items-center justify-center">
                <Card className="p-8 md:p-12 text-center border-dashed border-2 border-gray-300 mx-4">
                  <div className="space-y-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-gray-900">Upload an image to get started</h3>
                      <p className="text-sm text-gray-500 mt-1">Drag and drop or click to select</p>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()} size={isMobile ? "sm" : "default"}>
                      Choose Image
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <ImageCanvas />
            )}
          </div>

          {/* Mobile Bottom Toolbar */}
          {isMobile && originalImage && <MobileToolbar />}

          {/* Desktop History Timeline */}
          {!isMobile && history.length > 1 && (
            <div className="border-t border-gray-200 p-4">
              <HistoryTimeline />
            </div>
          )}
        </div>

        {/* Desktop Right Settings Panel */}
        {!isMobile && (
          <div
            className={`${isTablet ? "w-56" : "w-64"} bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0`}
          >
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">Export Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <Select defaultValue="png">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpg">JPG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quality: 90%</label>
                  <Slider defaultValue={[90]} max={100} min={1} step={1} className="w-full" />
                </div>

                {currentImage && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Image Info</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Format: PNG</div>
                      <div>Size: 1024 × 768</div>
                      <div>File Size: 2.4 MB</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 mx-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Processing image...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// Mobile Tools Panel Component
function MobileToolsPanel({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Tools</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="adjustments" className="text-xs">
                Adjust
              </TabsTrigger>
              <TabsTrigger value="ai-effects" className="text-xs">
                AI Effects
              </TabsTrigger>
              <TabsTrigger value="frames" className="text-xs">
                Frames
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            <TabsContent value="adjustments" className="mt-0">
              <AdjustmentControls />
            </TabsContent>

            <TabsContent value="ai-effects" className="mt-0">
              <AIEffectsPanel />
            </TabsContent>

            <TabsContent value="frames" className="mt-0">
              <FramesOverlaysPanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
