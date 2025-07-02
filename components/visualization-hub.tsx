"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Play,
  Square,
  SkipBack,
  SkipForward,
  Download,
  FileText,
  Presentation,
  Edit3,
  ZoomIn,
  ZoomOut,
  Grid,
  MousePointer,
  Circle,
  SquareIcon,
  Triangle,
  ArrowRight,
  Type,
  Save,
  Undo,
  Redo,
  Share,
  Printer,
  ImageIcon,
  Maximize,
  Layers,
  Move,
  RotateCcw,
  Copy,
  Trash2,
} from "lucide-react"

interface DiagramElement {
  id: string
  type: "rectangle" | "circle" | "diamond" | "arrow" | "text"
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  text?: string
  fontSize?: number
  rotation?: number
}

interface SlideData {
  id: string
  title: string
  content: string
  type: "business" | "functional" | "technical" | "ux" | "architecture"
  diagrams?: DiagramElement[]
}

export function VisualizationHub() {
  const [activeTab, setActiveTab] = useState("diagrams")
  const [selectedDiagram, setSelectedDiagram] = useState("architecture")
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedTool, setSelectedTool] = useState("pointer")
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)

  // Presentation state
  const [isPresenting, setIsPresenting] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [slideInterval, setSlideInterval] = useState(5)
  const [presentationTheme, setPresentationTheme] = useState("default")

  // Canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [elements, setElements] = useState<DiagramElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Sample slides data
  const slides: SlideData[] = [
    {
      id: "1",
      title: "Project Overview",
      content: "User Authentication System - Complete SDLC Documentation",
      type: "business",
    },
    {
      id: "2",
      title: "Business Analysis",
      content: "Executive Summary, Objectives, and Stakeholder Analysis",
      type: "business",
    },
    {
      id: "3",
      title: "Functional Requirements",
      content: "User Stories, Use Cases, and Acceptance Criteria",
      type: "functional",
    },
    {
      id: "4",
      title: "System Architecture",
      content: "Technical Architecture and Component Design",
      type: "technical",
    },
    {
      id: "5",
      title: "User Experience",
      content: "UI/UX Design and User Journey Maps",
      type: "ux",
    },
  ]

  // Interactive diagram data
  const diagramComponents = [
    {
      id: "frontend",
      name: "Frontend Application",
      type: "component",
      x: 100,
      y: 100,
      width: 150,
      height: 80,
      description: "React-based user interface with authentication forms",
      technologies: ["React", "TypeScript", "Tailwind CSS"],
    },
    {
      id: "api",
      name: "Authentication API",
      type: "service",
      x: 350,
      y: 100,
      width: 150,
      height: 80,
      description: "RESTful API handling authentication logic",
      technologies: ["Node.js", "Express", "JWT"],
    },
    {
      id: "database",
      name: "User Database",
      type: "database",
      x: 600,
      y: 100,
      width: 150,
      height: 80,
      description: "PostgreSQL database storing user credentials",
      technologies: ["PostgreSQL", "Prisma ORM"],
    },
    {
      id: "oauth",
      name: "OAuth Provider",
      type: "external",
      x: 350,
      y: 250,
      width: 150,
      height: 80,
      description: "Third-party OAuth services (Google, Facebook)",
      technologies: ["OAuth 2.0", "OpenID Connect"],
    },
  ]

  // Auto-play effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAutoPlay && isPresenting) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, slideInterval * 1000)
    }
    return () => clearInterval(interval)
  }, [isAutoPlay, isPresenting, slideInterval, slides.length])

  // Canvas drawing functions
  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 1
      const gridSize = 20
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    // Draw elements
    elements.forEach((element) => {
      ctx.save()
      ctx.translate(element.x + element.width / 2, element.y + element.height / 2)
      if (element.rotation) {
        ctx.rotate((element.rotation * Math.PI) / 180)
      }
      ctx.translate(-element.width / 2, -element.height / 2)

      ctx.fillStyle = element.fill
      ctx.strokeStyle = element.stroke
      ctx.lineWidth = element.strokeWidth

      switch (element.type) {
        case "rectangle":
          ctx.fillRect(0, 0, element.width, element.height)
          ctx.strokeRect(0, 0, element.width, element.height)
          break
        case "circle":
          ctx.beginPath()
          ctx.ellipse(element.width / 2, element.height / 2, element.width / 2, element.height / 2, 0, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()
          break
        case "diamond":
          ctx.beginPath()
          ctx.moveTo(element.width / 2, 0)
          ctx.lineTo(element.width, element.height / 2)
          ctx.lineTo(element.width / 2, element.height)
          ctx.lineTo(0, element.height / 2)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          break
      }

      if (element.text) {
        ctx.fillStyle = "#000"
        ctx.font = `${element.fontSize || 14}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(element.text, element.width / 2, element.height / 2)
      }

      // Highlight selected element
      if (selectedElement === element.id) {
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(-2, -2, element.width + 4, element.height + 4)
        ctx.setLineDash([])
      }

      ctx.restore()
    })
  }

  useEffect(() => {
    drawCanvas()
  }, [elements, selectedElement, showGrid])

  // Handle canvas mouse events
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditMode) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (selectedTool === "pointer") {
      // Select element
      const clickedElement = elements.find(
        (el) => x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height,
      )
      setSelectedElement(clickedElement?.id || null)
    } else {
      // Start drawing new element
      setIsDrawing(true)
      setDragStart({ x, y })
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isEditMode) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Update preview of element being drawn
    // This would be implemented with a preview overlay
  }

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isEditMode) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const width = Math.abs(x - dragStart.x)
    const height = Math.abs(y - dragStart.y)

    if (width > 10 && height > 10) {
      const newElement: DiagramElement = {
        id: `element-${Date.now()}`,
        type: selectedTool as DiagramElement["type"],
        x: Math.min(dragStart.x, x),
        y: Math.min(dragStart.y, y),
        width,
        height,
        fill: "#e5e7eb",
        stroke: "#374151",
        strokeWidth: 2,
        text: selectedTool === "text" ? "Text" : "",
        fontSize: 14,
      }

      setElements((prev) => [...prev, newElement])
      setSelectedElement(newElement.id)
    }

    setIsDrawing(false)
  }

  // Export functions
  const exportToPDF = () => {
    console.log("Exporting to PDF...")
    // Implementation would use libraries like jsPDF
  }

  const exportToPowerPoint = () => {
    console.log("Exporting to PowerPoint...")
    // Implementation would generate PPTX file
  }

  const exportDiagram = (format: string) => {
    console.log(`Exporting diagram as ${format}...`)
    // Implementation would export canvas as image
  }

  return (
    <div className="space-y-6">
      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
              Coming Soon
            </Badge>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900 mb-1">
              🚧 Visualization & Presentation Hub - Demo Preview
            </h3>
            <p className="text-xs text-amber-700">
              This feature is currently in development. The interface below shows demo/mock data 
              to preview the upcoming functionality. Full integration with generated SDLC documents coming soon!
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Visualization & Presentation Hub</h2>
          <p className="text-gray-600">Create interactive diagrams and professional presentations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPowerPoint}>
            <Presentation className="h-4 w-4 mr-2" />
            Export PPT
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="diagrams">Interactive Diagrams</TabsTrigger>
          <TabsTrigger value="presentation">Presentation Mode</TabsTrigger>
          <TabsTrigger value="editor">Diagram Editor</TabsTrigger>
          <TabsTrigger value="mindmap">Mind Maps</TabsTrigger>
          <TabsTrigger value="export">Export & Print</TabsTrigger>
        </TabsList>

        {/* Interactive Diagrams */}
        <TabsContent value="diagrams" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Diagram Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { id: "architecture", name: "System Architecture", icon: <Layers className="h-4 w-4" /> },
                    { id: "dataflow", name: "Data Flow", icon: <ArrowRight className="h-4 w-4" /> },
                    { id: "userjourney", name: "User Journey", icon: <Move className="h-4 w-4" /> },
                    { id: "component", name: "Component Diagram", icon: <Grid className="h-4 w-4" /> },
                  ].map((diagram) => (
                    <Button
                      key={diagram.id}
                      variant={selectedDiagram === diagram.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedDiagram(diagram.id)}
                    >
                      {diagram.icon}
                      <span className="ml-2">{diagram.name}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>System Architecture Diagram</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <svg width="100%" height="400" className="border rounded-lg bg-white">
                      {/* Connections */}
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                        </marker>
                      </defs>

                      {/* Connection lines */}
                      <line
                        x1="250"
                        y1="140"
                        x2="350"
                        y2="140"
                        stroke="#6b7280"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                      <line
                        x1="500"
                        y1="140"
                        x2="600"
                        y2="140"
                        stroke="#6b7280"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                      <line
                        x1="425"
                        y1="180"
                        x2="425"
                        y2="250"
                        stroke="#6b7280"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />

                      {/* Interactive components */}
                      {diagramComponents.map((component) => (
                        <g key={component.id}>
                          <rect
                            x={component.x}
                            y={component.y}
                            width={component.width}
                            height={component.height}
                            fill={
                              component.type === "database"
                                ? "#dbeafe"
                                : component.type === "external"
                                  ? "#fef3c7"
                                  : "#f3f4f6"
                            }
                            stroke={
                              component.type === "database"
                                ? "#3b82f6"
                                : component.type === "external"
                                  ? "#f59e0b"
                                  : "#6b7280"
                            }
                            strokeWidth="2"
                            rx="8"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              // Show component details
                              console.log("Component clicked:", component.name)
                            }}
                          />
                          <text
                            x={component.x + component.width / 2}
                            y={component.y + component.height / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-sm font-medium fill-gray-800 pointer-events-none"
                          >
                            {component.name}
                          </text>
                        </g>
                      ))}
                    </svg>

                    {/* Component details panel */}
                    <div className="absolute top-4 right-4 w-64">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Component Details</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-2">
                          <div>
                            <strong>Frontend Application</strong>
                            <p className="text-gray-600">React-based user interface with authentication forms</p>
                          </div>
                          <div>
                            <strong>Technologies:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {["React", "TypeScript", "Tailwind CSS"].map((tech) => (
                                <Badge key={tech} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Presentation Mode */}
        <TabsContent value="presentation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Presentation Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setIsPresenting(!isPresenting)}
                      className={isPresenting ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                      {isPresenting ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}>
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Auto-play</Label>
                      <Switch checked={isAutoPlay} onCheckedChange={setIsAutoPlay} />
                    </div>
                    {isAutoPlay && (
                      <div>
                        <Label className="text-sm">Interval (seconds)</Label>
                        <Slider
                          value={[slideInterval]}
                          onValueChange={(value) => setSlideInterval(value[0])}
                          min={3}
                          max={30}
                          step={1}
                          className="mt-1"
                        />
                        <div className="text-xs text-gray-500 mt-1">{slideInterval}s per slide</div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm">Theme</Label>
                    <Select value={presentationTheme} onValueChange={setPresentationTheme}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" onClick={() => setIsPresenting(true)}>
                    <Maximize className="h-4 w-4 mr-2" />
                    Full Screen
                  </Button>
                </CardContent>
              </Card>

              {/* Slide Thumbnails */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Slides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        currentSlide === index ? "bg-blue-100 border-blue-300" : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => setCurrentSlide(index)}
                    >
                      <div className="text-xs font-medium">{slide.title}</div>
                      <div className="text-xs text-gray-500 truncate">{slide.content}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card className="h-[600px]">
                <CardContent className="p-0 h-full">
                  <div
                    className={`h-full flex items-center justify-center text-center p-8 ${
                      presentationTheme === "dark"
                        ? "bg-gray-900 text-white"
                        : presentationTheme === "corporate"
                          ? "bg-blue-900 text-white"
                          : "bg-white"
                    }`}
                  >
                    <div>
                      <h1 className="text-4xl font-bold mb-4">{slides[currentSlide]?.title}</h1>
                      <p className="text-xl text-gray-600">{slides[currentSlide]?.content}</p>
                      <div className="mt-8">
                        <Badge variant="outline" className="text-sm">
                          Slide {currentSlide + 1} of {slides.length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Diagram Editor */}
        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-sm">Edit Mode</Label>
                    <Switch checked={isEditMode} onCheckedChange={setIsEditMode} />
                  </div>

                  {[
                    { id: "pointer", name: "Select", icon: <MousePointer className="h-4 w-4" /> },
                    { id: "rectangle", name: "Rectangle", icon: <SquareIcon className="h-4 w-4" /> },
                    { id: "circle", name: "Circle", icon: <Circle className="h-4 w-4" /> },
                    { id: "diamond", name: "Diamond", icon: <Triangle className="h-4 w-4" /> },
                    { id: "arrow", name: "Arrow", icon: <ArrowRight className="h-4 w-4" /> },
                    { id: "text", name: "Text", icon: <Type className="h-4 w-4" /> },
                  ].map((tool) => (
                    <Button
                      key={tool.id}
                      variant={selectedTool === tool.id ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedTool(tool.id)}
                      disabled={!isEditMode}
                    >
                      {tool.icon}
                      <span className="ml-2">{tool.name}</span>
                    </Button>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm">Zoom</Label>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(25, zoom - 25))}>
                        <ZoomOut className="h-3 w-3" />
                      </Button>
                      <span className="text-sm flex-1 text-center">{zoom}%</span>
                      <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                        <ZoomIn className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Grid</Label>
                    <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      <Undo className="h-3 w-3 mr-2" />
                      Undo
                    </Button>
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      <Redo className="h-3 w-3 mr-2" />
                      Redo
                    </Button>
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      <Save className="h-3 w-3 mr-2" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Properties Panel */}
              {selectedElement && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">Fill Color</Label>
                      <div className="flex gap-2 mt-1">
                        {["#e5e7eb", "#dbeafe", "#fef3c7", "#dcfce7", "#fce7f3"].map((color) => (
                          <div
                            key={color}
                            className="w-6 h-6 rounded cursor-pointer border-2 border-gray-300"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              setElements((prev) =>
                                prev.map((el) => (el.id === selectedElement ? { ...el, fill: color } : el)),
                              )
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Stroke Color</Label>
                      <div className="flex gap-2 mt-1">
                        {["#374151", "#3b82f6", "#f59e0b", "#10b981", "#ec4899"].map((color) => (
                          <div
                            key={color}
                            className="w-6 h-6 rounded cursor-pointer border-2 border-gray-300"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              setElements((prev) =>
                                prev.map((el) => (el.id === selectedElement ? { ...el, stroke: color } : el)),
                              )
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Actions</Label>
                      <div className="flex gap-1 mt-1">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => {
                            setElements((prev) => prev.filter((el) => el.id !== selectedElement))
                            setSelectedElement(null)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Diagram Canvas</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => exportDiagram("png")}>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Export PNG
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportDiagram("svg")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export SVG
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden" style={{ transform: `scale(${zoom / 100})` }}>
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={600}
                      className="cursor-crosshair bg-white"
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Mind Maps */}
        <TabsContent value="mindmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Requirements Mind Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] border rounded-lg bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-semibold mb-2">Interactive Mind Map</div>
                  <p className="text-gray-600 mb-4">Visual representation of project requirements and dependencies</p>
                  <Button>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Create Mind Map
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export & Print */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  PDF Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Page Size</Label>
                  <Select defaultValue="a4">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quality</Label>
                  <Select defaultValue="high">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Fast)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High (Best)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={exportToPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Presentation className="h-5 w-5" />
                  PowerPoint Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Template</Label>
                  <Select defaultValue="corporate">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="include-notes" className="rounded" />
                  <Label htmlFor="include-notes" className="text-sm">
                    Include speaker notes
                  </Label>
                </div>
                <Button className="w-full" onClick={exportToPowerPoint}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PPTX
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Print Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Layout</Label>
                  <Select defaultValue="portrait">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="print-diagrams" className="rounded" defaultChecked />
                  <Label htmlFor="print-diagrams" className="text-sm">
                    Include diagrams
                  </Label>
                </div>
                <Button className="w-full" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Export History */}
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "User Authentication System.pdf", date: "2024-01-15 14:30", size: "2.4 MB" },
                  { name: "System Architecture.pptx", date: "2024-01-15 14:25", size: "5.1 MB" },
                  { name: "Requirements Diagram.png", date: "2024-01-15 14:20", size: "856 KB" },
                ].map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{file.name}</div>
                      <div className="text-xs text-gray-500">
                        {file.date} • {file.size}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Share className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
