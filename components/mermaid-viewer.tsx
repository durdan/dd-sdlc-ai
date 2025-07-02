"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Maximize2, Copy, Eye, Code, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface MermaidViewerProps {
  diagrams: {
    architecture: string
    database: string
    userFlow: string
    apiFlow: string
  }
  title?: string
}

export function MermaidViewer({ diagrams, title = "System Architecture Diagrams" }: MermaidViewerProps) {
  const [activeTab, setActiveTab] = useState("architecture")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const diagramRef = useRef<HTMLDivElement>(null)

  // Sample diagrams if none provided
  const defaultDiagrams = {
    architecture: `graph TB
    A[User Interface] --> B[API Gateway]
    B --> C[Authentication Service]
    B --> D[Business Logic Layer]
    D --> E[Data Access Layer]
    E --> F[(Database)]
    D --> G[External APIs]
    G --> H[JIRA API]
    G --> I[Confluence API]
    G --> J[AI Services]`,

    database: `erDiagram
    USER {
        string id PK
        string email
        string name
        datetime created_at
    }
    PROJECT {
        string id PK
        string title
        string description
        string status
        string user_id FK
        datetime created_at
    }
    DOCUMENT {
        string id PK
        string type
        text content
        string project_id FK
        datetime created_at
    }
    INTEGRATION {
        string id PK
        string type
        json config
        string project_id FK
    }
    
    USER ||--o{ PROJECT : creates
    PROJECT ||--o{ DOCUMENT : contains
    PROJECT ||--o{ INTEGRATION : has`,

    userFlow: `flowchart TD
    A[User Login] --> B{Authenticated?}
    B -->|No| C[Login Page]
    C --> A
    B -->|Yes| D[Dashboard]
    D --> E[Create New Project]
    E --> F[Input Business Case]
    F --> G[Configure Settings]
    G --> H[Generate Documents]
    H --> I[Review Generated Content]
    I --> J{Approve?}
    J -->|No| K[Edit & Regenerate]
    K --> I
    J -->|Yes| L[Create JIRA Epic]
    L --> M[Create Confluence Page]
    M --> N[Link Documents]
    N --> O[Notify Team]`,

    apiFlow: `sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Gateway
    participant AI as AI Service
    participant J as JIRA API
    participant C as Confluence API
    participant D as Database
    
    U->>F: Submit Business Case
    F->>A: POST /generate-sdlc
    A->>AI: Generate Business Analysis
    AI-->>A: Business Analysis Content
    A->>AI: Generate Functional Spec
    AI-->>A: Functional Spec Content
    A->>AI: Generate Technical Spec
    AI-->>A: Technical Spec Content
    A->>AI: Generate UX Spec
    AI-->>A: UX Spec Content
    A->>D: Save Documents
    A->>J: Create Epic (if enabled)
    A->>C: Create Page (if enabled)
    A-->>F: Complete Response
    F-->>U: Display Results`,
  }

  const currentDiagrams = { ...defaultDiagrams, ...diagrams }

  useEffect(() => {
    // Dynamically import and render Mermaid
    const renderMermaid = async () => {
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: true,
          theme: "default",
          securityLevel: "loose",
          fontFamily: "Inter, system-ui, sans-serif",
        })

        if (diagramRef.current) {
          const diagramContent = currentDiagrams[activeTab as keyof typeof currentDiagrams]
          diagramRef.current.innerHTML = `<div class="mermaid">${diagramContent}</div>`
          await mermaid.run()
        }
      } catch (error) {
        console.error("Error rendering Mermaid diagram:", error)
        if (diagramRef.current) {
          diagramRef.current.innerHTML = `
            <div class="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div class="text-center">
                <p class="text-gray-500">Error rendering diagram</p>
                <p class="text-sm text-gray-400 mt-1">Please check the diagram syntax</p>
              </div>
            </div>
          `
        }
      }
    }

    renderMermaid()
  }, [activeTab])

  const handleDownload = (format: "png" | "svg" | "pdf") => {
    // Implementation for downloading diagrams
    console.log(`Downloading ${activeTab} diagram as ${format}`)
    // In a real implementation, you would use mermaid's export functionality
  }

  const handleCopyCode = () => {
    const diagramContent = currentDiagrams[activeTab as keyof typeof currentDiagrams]
    navigator.clipboard.writeText(diagramContent)
  }

  const handleZoom = (direction: "in" | "out" | "reset") => {
    if (direction === "reset") {
      setZoom(100)
    } else if (direction === "in" && zoom < 200) {
      setZoom(zoom + 25)
    } else if (direction === "out" && zoom > 50) {
      setZoom(zoom - 25)
    }
  }

  const diagramTitles = {
    architecture: "System Architecture",
    database: "Database Schema",
    userFlow: "User Flow",
    apiFlow: "API Sequence",
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-white p-4" : ""}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">Interactive Mermaid diagrams with export capabilities</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{diagramTitles[activeTab as keyof typeof diagramTitles]}</Badge>
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="architecture">Architecture</TabsTrigger>
                <TabsTrigger value="database">Database</TabsTrigger>
                <TabsTrigger value="userFlow">User Flow</TabsTrigger>
                <TabsTrigger value="apiFlow">API Flow</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 border rounded-md">
                  <Button variant="ghost" size="sm" onClick={() => handleZoom("out")} disabled={zoom <= 50}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="px-2 text-sm font-mono">{zoom}%</span>
                  <Button variant="ghost" size="sm" onClick={() => handleZoom("in")} disabled={zoom >= 200}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleZoom("reset")}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Action Buttons */}
                <Button variant="outline" size="sm" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>

                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleDownload("png")}>
                    <Download className="h-4 w-4 mr-1" />
                    PNG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload("svg")}>
                    SVG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload("pdf")}>
                    PDF
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value={activeTab} className="space-y-4">
              {/* Diagram Display */}
              <div
                className="border rounded-lg bg-white overflow-auto"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top left",
                  minHeight: "400px",
                }}
              >
                <div ref={diagramRef} className="p-4 flex items-center justify-center min-h-[400px]" />
              </div>

              {/* Diagram Source Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Code className="h-4 w-4" />
                    Mermaid Source Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                    <code>{currentDiagrams[activeTab as keyof typeof currentDiagrams]}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
