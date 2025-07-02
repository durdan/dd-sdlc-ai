"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Presentation,
  FileImage,
  Printer,
  Download,
  Edit3,
  GitBranch,
  Eye,
  Maximize,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Layout,
  Share,
  Zap,
  MousePointer,
  Square,
  Circle,
  ArrowRight,
  Type,
  ImageIcon,
  RotateCcw,
  Save,
  Grid,
  Layers,
} from "lucide-react"

interface DiagramNode {
  id: string
  type: "rectangle" | "circle" | "diamond" | "text"
  x: number
  y: number
  width: number
  height: number
  text: string
  color: string
  borderColor: string
  connections: string[]
}

interface PresentationSlide {
  id: string
  title: string
  content: string
  type: "overview" | "business" | "functional" | "technical" | "ux" | "architecture"
  diagrams?: DiagramNode[]
  notes?: string
}

export function VisualizationHub() {
  const [activeTab, setActiveTab] = useState("diagrams")
  const [presentationMode, setPresentationMode] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [diagramMode, setDiagramMode] = useState<"view" | "edit">("view")
  const [selectedTool, setSelectedTool] = useState<"select" | "rectangle" | "circle" | "arrow" | "text">("select")
  const [zoomLevel, setZoomLevel] = useState([100])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Sample presentation slides
  const [slides, setSlides] = useState<PresentationSlide[]>([
    {
      id: "1",
      title: "Project Overview",
      content: "User Authentication System - Complete SDLC Documentation",
      type: "overview",
      notes: "Introduction to the authentication system project and its scope",
    },
    {
      id: "2",
      title: "Business Analysis",
      content: "Executive Summary, Objectives, and Success Criteria",
      type: "business",
      notes: "Key business drivers and expected outcomes",
    },
    {
      id: "3",
      title: "System Architecture",
      content: "High-level system design and component interactions",
      type: "architecture",
      diagrams: [
        {
          id: "arch1",
          type: "rectangle",
          x: 100,
          y: 100,
          width: 120,
          height: 60,
          text: "Frontend",
          color: "#3B82F6",
          borderColor: "#1E40AF",
          connections: ["arch2"],
        },
        {
          id: "arch2",
          type: "rectangle",
          x: 300,
          y: 100,
          width: 120,
          height: 60,
          text: "API Gateway",
          color: "#10B981",
          borderColor: "#047857",
          connections: ["arch3"],
        },
        {
          id: "arch3",
          type: "rectangle",
          x: 500,
          y: 100,
          width: 120,
          height: 60,
          text: "Database",
          color: "#F59E0B",
          borderColor: "#D97706",
          connections: [],
        },
      ],
      notes: "Interactive architecture diagram showing system components",
    },
    {
      id: "4",
      title: "Technical Specifications",
      content: "Technology stack, database design, and API specifications",
      type: "technical",
      notes: "Detailed technical implementation details",
    },
    {
      id: "5",
      title: "User Experience Design",
      content: "User personas, journey maps, and interface specifications",
      type: "ux",
      notes: "User-centered design approach and wireframes",
    },
  ])

  // Sample diagram nodes for the diagram editor
  const [diagramNodes, setDiagramNodes] = useState<DiagramNode[]>([
    {
      id: "node1",
      type: "rectangle",
      x: 150,
      y: 100,
      width: 100,
      height: 60,
      text: "User Input",
      color: "#EBF8FF",
      borderColor: "#3182CE",
      connections: ["node2"],
    },
    {
      id: "node2",
      type: "diamond",
      x: 300,
      y: 90,
      width: 80,
      height: 80,
      text: "Validate?",
      color: "#F0FFF4",
      borderColor: "#38A169",
      connections: ["node3", "node4"],
    },
    {
      id: "node3",
      type: "rectangle",
      x: 450,
      y: 50,
      width: 100,
      height: 60,
      text: "Process",
      color: "#FFFBEB",
      borderColor: "#D69E2E",
      connections: [],
    },
    {
      id: "node4",
      type: "rectangle",
      x: 450,
      y: 150,
      width: 100,
      height: 60,
      text: "Error",
      color: "#FED7D7",
      borderColor: "#E53E3E",
      connections: [],
    },
  ])

  // Presentation controls
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      // Auto-advance slides every 10 seconds
      const interval = setInterval(() => {
        setCurrentSlide((prev) => {
          const next = (prev + 1) % slides.length
          if (next === 0) {
            setIsPlaying(false)
            clearInterval(interval)
          }
          return next
        })
      }, 10000)
    }
  }

  // Export functions
  const exportToPDF = () => {
    console.log("Exporting to PDF...")
    // In a real implementation, this would use a library like jsPDF
  }

  const printDocument = () => {
    window.print()
  }

  const exportDiagram = (format: "png" | "svg" | "pdf") => {
    console.log(`Exporting diagram as ${format}...`)
    // Implementation would depend on the chosen diagramming library
  }

  // Diagram editor functions
  const addNode = (type: DiagramNode["type"]) => {
    const newNode: DiagramNode = {
      id: `node_${Date.now()}`,
      type,
      x: 200 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: type === "circle" ? 80 : 100,
      height: type === "circle" ? 80 : 60,
      text: "New Node",
      color: "#F7FAFC",
      borderColor: "#4A5568",
      connections: [],
    }
    setDiagramNodes([...diagramNodes, newNode])
  }

  const renderDiagramNode = (node: DiagramNode) => {
    const style = {
      position: "absolute" as const,
      left: node.x,
      top: node.y,
      width: node.width,
      height: node.height,
      backgroundColor: node.color,
      border: `2px solid ${node.borderColor}`,
      borderRadius: node.type === "circle" ? "50%" : node.type === "diamond" ? "0" : "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: "500",
      cursor: diagramMode === "edit" ? "move" : "pointer",
      transform: node.type === "diamond" ? "rotate(45deg)" : "none",
      zIndex: 10,
    }

    return (
      <div key={node.id} style={style} onClick={() => console.log(`Clicked node: ${node.id}`)}>
        <span style={{ transform: node.type === "diamond" ? "rotate(-45deg)" : "none" }}>{node.text}</span>
      </div>
    )
  }

  const renderConnections = () => {
    return diagramNodes.map((node) =>
      node.connections.map((targetId) => {
        const target = diagramNodes.find((n) => n.id === targetId)
        if (!target) return null

        const startX = node.x + node.width / 2
        const startY = node.y + node.height / 2
        const endX = target.x + target.width / 2
        const endY = target.y + target.height / 2

        return (
          <svg
            key={`${node.id}-${targetId}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" fill="#4A5568">
                <polygon points="0 0, 10 3.5, 0 7" />
              </marker>
            </defs>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="#4A5568"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          </svg>
        )
      }),
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Visualization & Presentation</h2>
          <p className="text-gray-600">Create interactive diagrams and professional presentations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPresentationMode(true)}>
            <Presentation className="h-4 w-4 mr-2" />
            Present
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={printDocument}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="diagrams">Interactive Diagrams</TabsTrigger>
          <TabsTrigger value="presentation">Presentation Mode</TabsTrigger>
          <TabsTrigger value="editor">Diagram Editor</TabsTrigger>
          <TabsTrigger value="mindmap">Mind Maps</TabsTrigger>
          <TabsTrigger value="export">Export Options</TabsTrigger>
        </TabsList>

        {/* Interactive Diagrams */}
        <TabsContent value="diagrams" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Architecture Diagram */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  System Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden">
                  {slides[2].diagrams?.map(renderDiagramNode)}
                  {renderConnections()}
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Maximize className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline">Interactive</Badge>
                    <Badge variant="outline">Clickable</Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Flow Diagram */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Data Flow Diagram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden">
                  {diagramNodes.map(renderDiagramNode)}
                  {renderConnections()}
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Maximize className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline">Editable</Badge>
                    <Badge variant="outline">Auto-generated</Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Journey Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5" />
                  User Journey Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p className="text-gray-600">Interactive user journey visualization</p>
                    <Button className="mt-2" size="sm">
                      Generate Journey Map
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Component Hierarchy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Component Hierarchy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏗️</div>
                    <p className="text-gray-600">System component breakdown</p>
                    <Button className="mt-2" size="sm">
                      View Hierarchy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Presentation Mode */}
        <TabsContent value="presentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Presentation Builder</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={prevSlide}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={togglePlayback}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={nextSlide}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => setPresentationMode(true)}>
                    <Maximize className="h-4 w-4 mr-2" />
                    Full Screen
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Slide Preview */}
                <div className="aspect-video bg-white border-2 border-gray-200 rounded-lg p-8 shadow-sm">
                  <div className="h-full flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{slides[currentSlide]?.title}</h1>
                    <div className="flex-1 flex items-center justify-center">
                      {slides[currentSlide]?.type === "architecture" && slides[currentSlide]?.diagrams ? (
                        <div className="relative w-full h-full">
                          {slides[currentSlide].diagrams?.map(renderDiagramNode)}
                          {renderConnections()}
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-xl text-gray-700 mb-4">{slides[currentSlide]?.content}</p>
                          <div className="text-6xl mb-4">
                            {slides[currentSlide]?.type === "business" && "📊"}
                            {slides[currentSlide]?.type === "technical" && "⚙️"}
                            {slides[currentSlide]?.type === "ux" && "🎨"}
                            {slides[currentSlide]?.type === "overview" && "🚀"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Slide Navigation */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Slide {currentSlide + 1} of {slides.length}
                  </div>
                  <div className="flex gap-1">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        className={`w-3 h-3 rounded-full ${index === currentSlide ? "bg-blue-500" : "bg-gray-300"}`}
                        onClick={() => setCurrentSlide(index)}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {slides[currentSlide]?.notes && `Notes: ${slides[currentSlide].notes}`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slide Thumbnails */}
          <Card>
            <CardHeader>
              <CardTitle>Slide Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`aspect-video bg-white border-2 rounded cursor-pointer transition-all ${
                      index === currentSlide ? "border-blue-500 shadow-md" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  >
                    <div className="p-2 h-full flex flex-col">
                      <div className="text-xs font-medium truncate">{slide.title}</div>
                      <div className="flex-1 flex items-center justify-center text-2xl">
                        {slide.type === "business" && "📊"}
                        {slide.type === "technical" && "⚙️"}
                        {slide.type === "ux" && "🎨"}
                        {slide.type === "overview" && "🚀"}
                        {slide.type === "architecture" && "🏗️"}
                      </div>
                      <div className="text-xs text-gray-500">{index + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diagram Editor */}
        <TabsContent value="editor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Diagram Editor</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={diagramMode === "edit" ? "default" : "outline"}
                    onClick={() => setDiagramMode(diagramMode === "edit" ? "view" : "edit")}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {diagramMode === "edit" ? "View Mode" : "Edit Mode"}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {/* Toolbar */}
                {diagramMode === "edit" && (
                  <div className="w-48 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Tools</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant={selectedTool === "select" ? "default" : "outline"}
                          onClick={() => setSelectedTool("select")}
                        >
                          <MousePointer className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedTool === "rectangle" ? "default" : "outline"}
                          onClick={() => setSelectedTool("rectangle")}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedTool === "circle" ? "default" : "outline"}
                          onClick={() => setSelectedTool("circle")}
                        >
                          <Circle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedTool === "arrow" ? "default" : "outline"}
                          onClick={() => setSelectedTool("arrow")}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedTool === "text" ? "default" : "outline"}
                          onClick={() => setSelectedTool("text")}
                        >
                          <Type className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Quick Add</h4>
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => addNode("rectangle")}
                        >
                          Add Rectangle
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => addNode("circle")}
                        >
                          Add Circle
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => addNode("diamond")}
                        >
                          Add Diamond
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Zoom</h4>
                      <div className="space-y-2">
                        <Slider
                          value={zoomLevel}
                          onValueChange={setZoomLevel}
                          max={200}
                          min={25}
                          step={25}
                          className="w-full"
                        />
                        <div className="text-sm text-gray-600 text-center">{zoomLevel[0]}%</div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Actions</h4>
                      <div className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Undo
                        </Button>
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          <Grid className="h-4 w-4 mr-2" />
                          Grid
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Canvas */}
                <div className="flex-1">
                  <div
                    className="relative h-96 bg-white border-2 border-gray-200 rounded-lg overflow-hidden"
                    style={{ transform: `scale(${zoomLevel[0] / 100})`, transformOrigin: "top left" }}
                  >
                    {diagramNodes.map(renderDiagramNode)}
                    {renderConnections()}
                    {diagramMode === "edit" && (
                      <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {selectedTool === "select" && "Select and move objects"}
                        {selectedTool === "rectangle" && "Click to add rectangle"}
                        {selectedTool === "circle" && "Click to add circle"}
                        {selectedTool === "arrow" && "Click and drag to connect"}
                        {selectedTool === "text" && "Click to add text"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mind Maps */}
        <TabsContent value="mindmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Requirements Mind Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🧠</div>
                  <h3 className="text-xl font-semibold mb-2">Visual Requirements Mapping</h3>
                  <p className="text-gray-600 mb-4">Transform your requirements into interactive mind maps</p>
                  <Button>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Mind Map
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Requirements Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-blue-50 rounded border flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl mb-2">📋</div>
                    <p className="text-sm text-gray-600">Business objectives and requirements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Dependencies Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-green-50 rounded border flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔧</div>
                    <p className="text-sm text-gray-600">Technical components and dependencies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Export Options */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* PDF Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  PDF Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">Export complete documentation as high-quality PDF</p>
                <div className="space-y-2">
                  <Select defaultValue="complete">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complete">Complete Documentation</SelectItem>
                      <SelectItem value="business">Business Analysis Only</SelectItem>
                      <SelectItem value="technical">Technical Specs Only</SelectItem>
                      <SelectItem value="diagrams">Diagrams Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="a4">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4 Format</SelectItem>
                      <SelectItem value="letter">Letter Format</SelectItem>
                      <SelectItem value="legal">Legal Format</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={exportToPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </CardContent>
            </Card>

            {/* Print Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Print Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">Professional document printing with optimized layouts</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include diagrams</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Page numbers</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Table of contents</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>
                <Button className="w-full" onClick={printDocument}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Document
                </Button>
              </CardContent>
            </Card>

            {/* Diagram Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Diagram Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">Export diagrams in various formats</p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => exportDiagram("png")}>
                    Export as PNG
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => exportDiagram("svg")}>
                    Export as SVG
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => exportDiagram("pdf")}>
                    Export as PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Presentation Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Presentation className="h-5 w-5" />
                  Presentation Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">Export as PowerPoint or Google Slides</p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full bg-transparent">
                    Export to PowerPoint
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Export to Google Slides
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Generate Slide Deck
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sharing Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share className="h-5 w-5" />
                  Sharing & Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">Share visualizations with your team</p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full bg-transparent">
                    Generate Share Link
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Embed Code
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Team Collaboration
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Custom Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Custom Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">Create and manage presentation templates</p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full bg-transparent">
                    Create Template
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Manage Templates
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Import Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Full Screen Presentation Modal */}
      <Dialog open={presentationMode} onOpenChange={setPresentationMode}>
        <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 bg-black">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Slide Content */}
            <div className="w-full max-w-6xl aspect-video bg-white rounded-lg p-12 mx-8">
              <div className="h-full flex flex-col">
                <h1 className="text-5xl font-bold text-gray-900 mb-8">{slides[currentSlide]?.title}</h1>
                <div className="flex-1 flex items-center justify-center">
                  {slides[currentSlide]?.type === "architecture" && slides[currentSlide]?.diagrams ? (
                    <div className="relative w-full h-full">
                      {slides[currentSlide].diagrams?.map(renderDiagramNode)}
                      {renderConnections()}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-3xl text-gray-700 mb-8">{slides[currentSlide]?.content}</p>
                      <div className="text-8xl">
                        {slides[currentSlide]?.type === "business" && "📊"}
                        {slides[currentSlide]?.type === "technical" && "⚙️"}
                        {slides[currentSlide]?.type === "ux" && "🎨"}
                        {slides[currentSlide]?.type === "overview" && "🚀"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={prevSlide}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={togglePlayback}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={nextSlide}>
                <SkipForward className="h-4 w-4" />
              </Button>
              <div className="text-white text-sm mx-4">
                {currentSlide + 1} / {slides.length}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setPresentationMode(false)}
              >
                Exit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
