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
  
  // Simple helper to check if a diagram has content
  const hasContent = (key: string) => {
    const content = diagrams[key as keyof typeof diagrams]
    return content && content.trim().length > 0
  }
  
  // Set active tab to first one with content on mount
  useEffect(() => {
    const tabsWithContent = ['architecture', 'database', 'userFlow', 'apiFlow'].filter(hasContent)
    if (tabsWithContent.length > 0 && !hasContent(activeTab)) {
      setActiveTab(tabsWithContent[0])
    }
  }, [diagrams])

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
        // Debug: Log what we're working with
        console.log('Current tab:', activeTab)
        console.log('Available diagrams:', Object.keys(currentDiagrams))
        
        const diagramContent = currentDiagrams[activeTab as keyof typeof currentDiagrams]
        console.log('Raw diagram content:', diagramContent)
        console.log('Diagram content type:', typeof diagramContent)
        console.log('Diagram content length:', diagramContent?.length)

        if (!diagramContent || typeof diagramContent !== 'string' || diagramContent.trim() === '') {
          throw new Error(`Invalid diagram content for tab '${activeTab}': ${typeof diagramContent} - '${diagramContent}'`)
        }

        const mermaid = (await import("mermaid")).default
        
        // Clear any existing content first
        if (diagramRef.current) {
          diagramRef.current.innerHTML = ''
        }
        
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          fontFamily: "Inter, system-ui, sans-serif",
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true
          }
        })

        if (diagramRef.current) {
          // Clean up the diagram content - remove extra whitespace and ensure proper format
          const cleanDiagram = diagramContent.trim()
          console.log('Clean diagram content:', cleanDiagram)
          
          // Validate that it starts with a valid mermaid diagram type
          const validStarters = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'journey', 'pie']
          const firstLine = cleanDiagram.split('\n')[0].toLowerCase()
          const isValidMermaid = validStarters.some(starter => firstLine.includes(starter))
          
          if (!isValidMermaid) {
            throw new Error(`Invalid Mermaid syntax. First line: '${firstLine}'. Expected one of: ${validStarters.join(', ')}`)
          }
          
          // Generate unique ID for this diagram
          const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          
          // Create the diagram element
          const currentContent = currentDiagrams[activeTab as keyof typeof currentDiagrams]
      
          // Check if content is empty or invalid
          if (!currentContent || currentContent.trim() === '') {
            console.log('Mermaid diagram content is empty for tab:', activeTab)
            if (diagramRef.current) {
              diagramRef.current.innerHTML = `
                <div class="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div class="text-center p-6">
                    <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="text-lg font-medium text-gray-700 mb-2">No Diagram Available</h3>
                    <p class="text-gray-500">This diagram type hasn't been generated yet or the content is empty.</p>
                  </div>
                </div>
              `
            }
            return
          }
          
          if (diagramRef.current) {
            console.log('Rendering Mermaid diagram for tab:', activeTab, 'Content length:', currentContent.length)
            
            // Clear previous content
            diagramRef.current.innerHTML = ''
            
            // Create a new element for the diagram
            const diagramElement = document.createElement('div')
            diagramElement.className = 'mermaid'
            diagramElement.textContent = currentContent
            diagramRef.current.appendChild(diagramElement)
            
            try {
              // Render the diagram
              await mermaid.run({
                nodes: [diagramElement]
              })
              
              console.log('Mermaid diagram rendered successfully')
            } catch (error) {
              const diagramContent = currentDiagrams[activeTab as keyof typeof currentDiagrams]
              
              // Enhanced error logging
              const errorInfo = {
                errorType: typeof error,
                errorConstructor: error?.constructor?.name || 'Unknown',
                message: error?.message || 'No error message',
                stack: error?.stack || 'No stack trace',
                activeTab,
                diagramContent: diagramContent || 'No content',
                diagramLength: diagramContent?.length || 0,
                isEmpty: !diagramContent || diagramContent.trim() === '',
                firstChars: diagramContent?.substring(0, 200) || 'No content',
                containsMermaidKeywords: diagramContent ? 
                  ['graph', 'flowchart', 'erDiagram', 'sequenceDiagram', 'classDiagram'].some(keyword => 
                    diagramContent.toLowerCase().includes(keyword.toLowerCase())) : false,
                hasSpecialChars: diagramContent ? /[{}\[\]()<>"'`]/.test(diagramContent) : false,
                lineCount: diagramContent ? diagramContent.split('\n').length : 0
              }
              
              console.error("Enhanced Mermaid Error Debug:", errorInfo)
              
              // Try to validate Mermaid syntax
              if (diagramContent) {
                console.log('Raw Mermaid content for debugging:', JSON.stringify(diagramContent))
                
                // Check for common syntax issues
                const lines = diagramContent.split('\n')
                lines.forEach((line, index) => {
                  if (line.trim() && !line.trim().startsWith('%%')) {
                    console.log(`Line ${index + 1}: "${line}"`)
                  }
                })
              }
              if (diagramRef.current) {
                diagramRef.current.innerHTML = `
                  <div class="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div class="text-center p-6">
                      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p class="text-gray-600 font-medium">Error rendering diagram</p>
                      <p class="text-sm text-gray-500 mt-2">Please check the diagram syntax</p>
                      <details class="mt-4 text-left">
                        <summary class="text-sm text-gray-400 cursor-pointer hover:text-gray-600">Show error details</summary>
                        <pre class="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-32">${error?.message || error?.toString() || 'Empty error object - check console for details'}</pre>
                        <pre class="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-32">Content preview: ${currentDiagrams[activeTab as keyof typeof currentDiagrams]?.substring(0, 300) || 'No content'}...</pre>
                        <button class="mt-2 text-xs text-blue-600 hover:text-blue-800 underline" onclick="console.log('Full Mermaid content:', ${JSON.stringify(currentDiagrams[activeTab as keyof typeof currentDiagrams])})">
                          Log full content to console
                        </button>
                      </details>
                    </div>
                  </div>
                `
              }
            }
          }
        }
      } catch (error) {
        const diagramContent = currentDiagrams[activeTab as keyof typeof currentDiagrams]
        console.error("Error rendering Mermaid diagram:", {
          error,
          message: error?.message || 'No error message',
          stack: error?.stack || 'No stack trace',
          activeTab,
          diagramContent,
          diagramLength: diagramContent?.length || 0,
          isEmpty: !diagramContent || diagramContent.trim() === '',
          firstChars: diagramContent?.substring(0, 100) || 'No content'
        })
        if (diagramRef.current) {
          diagramRef.current.innerHTML = `
            <div class="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div class="text-center p-6">
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p class="text-gray-600 font-medium">Error rendering diagram</p>
                <p class="text-sm text-gray-500 mt-2">Please check the diagram syntax</p>
                <details class="mt-4 text-left">
                  <summary class="text-sm text-gray-400 cursor-pointer hover:text-gray-600">Show error details</summary>
                  <pre class="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-32">${error.message || 'Unknown error'}</pre>
                  <pre class="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-32">Content: ${currentDiagrams[activeTab as keyof typeof currentDiagrams]?.substring(0, 200) || 'No content'}...</pre>
                </details>
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
    userflow: "User Flow",
    apiflow: "API Sequence",
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
                {hasContent('architecture') && <TabsTrigger value="architecture">Architecture</TabsTrigger>}
                {hasContent('database') && <TabsTrigger value="database">Database</TabsTrigger>}
                {hasContent('userFlow') && <TabsTrigger value="userFlow">User Flow</TabsTrigger>}
                {hasContent('apiFlow') && <TabsTrigger value="apiFlow">API Flow</TabsTrigger>}
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
