"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, AlertCircle, CheckCircle2, Code, Eye } from "lucide-react"
import { parseMermaidDiagrams, fixMermaidSyntax, hasDiagramContent } from "@/lib/mermaid-parser-simple-fix"
import { validateMermaidDiagram } from "@/lib/mermaid-parser"
import { fixSequenceMinimal } from "@/lib/fix-sequence-minimal"

interface MermaidViewerProps {
  content?: string
  diagrams?: Record<string, string>
  title?: string
  height?: string
}

// Singleton mermaid instance to prevent multiple initializations
let mermaidInstance: any = null
let mermaidInitialized = false

export function MermaidViewerEnhanced({ 
  content, 
  diagrams: providedDiagrams, 
  title = "System Architecture Diagrams",
  height = "400px"
}: MermaidViewerProps) {
  const [activeTab, setActiveTab] = useState("")
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview")
  const [renderStatus, setRenderStatus] = useState<Record<string, "loading" | "success" | "error">>({})
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({})
  const [copiedTab, setCopiedTab] = useState<string | null>(null)
  const diagramRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to get icon for diagram type
  const getIconForDiagramType = (key: string): string => {
    const iconMap: Record<string, string> = {
      architecture: '🏗️',
      database: '🗄️',
      userflow: '👤',
      apiflow: '🔄',
      sequence: '📋',
      class: '📦',
      state: '🔀',
      entity: '🔷',
      deployment: '🚀',
      component: '🧩'
    }
    return iconMap[key.toLowerCase()] || '📊'
  }

  // Parse diagrams from content or use provided diagrams
  // Use useMemo to prevent recalculation on every render
  const fixedDiagrams = React.useMemo(() => {
    const parsedDiagrams = content ? parseMermaidDiagrams(content) : (providedDiagrams || {})
    
    // Apply fixes to all diagrams
    return Object.entries(parsedDiagrams).reduce((acc, [key, diagram]) => {
      // First apply the general fix
      let fixed = fixMermaidSyntax(diagram)
      
      // Then apply the minimal sequence fix for the specific issues
      // This targets the known problematic patterns without breaking anything
      fixed = fixSequenceMinimal(fixed)
      
      const validation = validateMermaidDiagram(fixed)
      
      if (!validation.isValid) {
        console.warn(`Diagram ${key} validation warning:`, validation.error)
      }
      
      acc[key] = fixed
      return acc
    }, {} as Record<string, string>)
  }, [content, providedDiagrams])

  // Get tabs with content
  const tabsWithContent = Object.entries(fixedDiagrams)
    .filter(([_, diagram]) => diagram && diagram.trim().length > 0)
    .map(([key, _]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
      icon: getIconForDiagramType(key)
    }))

  // Set initial active tab
  useEffect(() => {
    if (tabsWithContent.length > 0 && !activeTab) {
      setActiveTab(tabsWithContent[0].key)
    }
  }, [tabsWithContent, activeTab])

  // Render Mermaid diagram with debouncing and singleton pattern
  useEffect(() => {
    // Clear any pending render timeout
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current)
    }

    const renderDiagram = async () => {
      if (!activeTab || viewMode !== "preview") return
      
      const diagramContent = fixedDiagrams[activeTab]
      const diagramRef = diagramRefs.current[activeTab]
      
      if (!diagramRef || !diagramContent) return

      setRenderStatus(prev => ({ ...prev, [activeTab]: "loading" }))
      
      try {
        // Initialize mermaid only once
        if (!mermaidInstance) {
          mermaidInstance = (await import("mermaid")).default
        }
        
        // Initialize with enhanced error handling only once
        if (!mermaidInitialized) {
          mermaidInstance.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "loose",
            deterministicIds: true,
            fontFamily: "monospace",
            flowchart: {
              htmlLabels: true,
              curve: 'basis'
            },
            sequence: {
              diagramMarginX: 50,
              diagramMarginY: 10,
              actorMargin: 50,
              width: 150,
              height: 65,
              boxMargin: 10,
              boxTextMargin: 5,
              noteMargin: 10,
              messageMargin: 35,
              mirrorActors: true,
              bottomMarginAdj: 1,
              useMaxWidth: true,
              rightAngles: false,
              showSequenceNumbers: false,
            }
          })
          mermaidInitialized = true
        }

        // Clear previous content
        diagramRef.innerHTML = '<div class="text-center text-gray-500">Rendering diagram...</div>'
        
        // Create unique ID with timestamp and random component
        const diagramId = `mermaid-${activeTab}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        // Log the diagram content for debugging
        console.log(`Rendering ${activeTab} diagram`)
        
        // Clear any existing SVG with the same ID (prevent conflicts)
        const existingSvg = document.getElementById(diagramId)
        if (existingSvg) {
          existingSvg.remove()
        }
        
        // Render the diagram
        const { svg } = await mermaidInstance.render(diagramId, diagramContent)
        
        // Check if component is still mounted before updating DOM
        if (diagramRef) {
          diagramRef.innerHTML = svg
          setRenderStatus(prev => ({ ...prev, [activeTab]: "success" }))
          setErrorMessages(prev => ({ ...prev, [activeTab]: "" }))
        }
        
      } catch (error: any) {
        console.error(`Failed to render ${activeTab} diagram:`, error)
        setRenderStatus(prev => ({ ...prev, [activeTab]: "error" }))
        setErrorMessages(prev => ({ 
          ...prev, 
          [activeTab]: error.message || "Unknown rendering error"
        }))
        
        // Show error in UI
        if (diagramRef) {
          diagramRef.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full p-8 bg-red-50 rounded-lg">
              <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 class="text-lg font-medium text-red-700 mb-2">Rendering Error</h3>
              <p class="text-red-600 text-sm text-center max-w-md">${error.message || "Failed to render diagram"}</p>
              <button onclick="document.getElementById('raw-${activeTab}').scrollIntoView()" class="mt-4 text-sm text-red-600 underline">
                View raw diagram
              </button>
            </div>
          `
        }
      }
    }

    // Debounce the render to prevent rapid re-renders
    renderTimeoutRef.current = setTimeout(renderDiagram, 100)
    
    // Cleanup function
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current)
      }
    }
  }, [activeTab, fixedDiagrams, viewMode])

  const copyToClipboard = async (text: string, tabKey: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedTab(tabKey)
      setTimeout(() => setCopiedTab(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (tabsWithContent.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No diagrams available. Please generate SDLC documents first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === "preview" ? "default" : "outline"}
            onClick={() => setViewMode("preview")}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            variant={viewMode === "raw" ? "default" : "outline"}
            onClick={() => setViewMode("raw")}
          >
            <Code className="w-4 h-4 mr-1" />
            Raw
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap gap-1 w-full mb-4">
            {tabsWithContent.map(tab => (
              <TabsTrigger 
                key={tab.key} 
                value={tab.key}
                className="text-xs flex items-center gap-1"
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {renderStatus[tab.key] === "error" && (
                  <AlertCircle className="w-3 h-3 text-red-500 ml-1" />
                )}
                {renderStatus[tab.key] === "success" && (
                  <CheckCircle2 className="w-3 h-3 text-green-500 ml-1" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabsWithContent.map(tab => (
            <TabsContent key={tab.key} value={tab.key}>
              {viewMode === "preview" ? (
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div 
                    ref={el => diagramRefs.current[tab.key] = el}
                    className="p-6 overflow-auto"
                    style={{ minHeight: height }}
                  />
                  {errorMessages[tab.key] && (
                    <Alert variant="destructive" className="m-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {errorMessages[tab.key]}
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium">Show diagram source</summary>
                          <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                            {fixedDiagrams[tab.key]}
                          </pre>
                        </details>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div id={`raw-${tab.key}`} className="bg-gray-50 rounded-lg border p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Mermaid Source</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(fixedDiagrams[tab.key], tab.key)}
                    >
                      {copiedTab === tab.key ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="bg-white p-4 rounded border overflow-auto text-sm" style={{ maxHeight: height }}>
                    <code>{fixedDiagrams[tab.key]}</code>
                  </pre>
                  {validateMermaidDiagram(fixedDiagrams[tab.key]).error && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Validation warning: {validateMermaidDiagram(fixedDiagrams[tab.key]).error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}