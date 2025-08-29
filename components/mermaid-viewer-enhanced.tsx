"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, AlertCircle, CheckCircle2, Code, Eye } from "lucide-react"
import { parseMermaidDiagramsWithSections, fixMermaidSyntax, hasDiagramContent, validateMermaidDiagram } from "@/lib/mermaid-parser-enhanced"
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
      component: '🧩',
      system: '⚙️',
      user: '👤',
      order: '📦',
      payment: '💳',
      microservices: '🔗',
      webhook: '🔌',
      error: '⚠️',
      transaction: '💰',
      content: '📝',
      analytics: '📈'
    }
    
    // Check if key contains any of the icon keywords
    const lowerKey = key.toLowerCase()
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (lowerKey.includes(keyword)) {
        return icon
      }
    }
    
    return '📊'
  }

  // Helper function to check if a diagram is actually renderable
  const isRenderableDiagram = (diagram: string): boolean => {
    if (!diagram || diagram.trim().length < 10) return false
    
    // Check if it starts with a valid diagram type (more flexible)
    const firstLine = diagram.trim().split('\n')[0].toLowerCase()
    const validTypes = ['graph', 'flowchart', 'sequencediagram', 'classdiagram', 'erdiagram', 'statediagram']
    const hasValidStart = validTypes.some(type => firstLine.includes(type))
    
    // If it doesn't start with a diagram type, check if it contains diagram structure
    if (!hasValidStart) {
      const hasStructure = diagram.includes('-->') || 
                          diagram.includes('->') || 
                          diagram.includes('participant') ||
                          diagram.includes('class') ||
                          diagram.includes('state') ||
                          diagram.includes('entity') ||
                          diagram.includes('[') ||
                          diagram.includes('{') ||
                          diagram.includes('graph') ||
                          diagram.includes('flowchart')
      
      return hasStructure
    }
    
    return true
  }

  // Parse diagrams from content or use provided diagrams
  // Use useMemo to prevent recalculation on every render
  const fixedDiagrams = React.useMemo(() => {
    try {
      const parsedDiagrams = content ? parseMermaidDiagramsWithSections(content) : (providedDiagrams || {})
      
      // Apply fixes to all diagrams
      return Object.entries(parsedDiagrams).reduce((acc, [key, diagram]) => {
        try {
          // First apply the general fix
          let fixed = fixMermaidSyntax(diagram)
          
          // Then apply the minimal sequence fix for the specific issues
          // This targets the known problematic patterns without breaking anything
          fixed = fixSequenceMinimal(fixed)
          
          const validation = validateMermaidDiagram(fixed)
          
          if (!validation.isValid) {
            console.warn(`Diagram ${key} validation warning:`, validation.error)
            // Try to apply additional fixes for validation issues
            if (validation.error?.includes('unqString') || validation.error?.includes('Parse error')) {
              // Remove problematic patterns that cause parsing errors
              fixed = fixed.replace(/\*\*[^\s]*/g, '')
              fixed = fixed.replace(/[^\w\s\[\]{}()<>"':;.,=\-\+*\/\\|&%$#@!~`-]/g, ' ')
              fixed = fixed.replace(/^[^a-zA-Z0-9\s\[\]{}()<>"':;.,=\-\+*\/\\|&%$#@!~`]+.*$/gm, '')
            }
          }
          
          // Additional safety check: ensure the diagram is actually renderable
          if (isRenderableDiagram(fixed)) {
            acc[key] = fixed
          } else {
            console.warn(`Diagram ${key} failed renderability check, skipping`)
          }
        } catch (error) {
          console.error(`Error processing diagram ${key}:`, error)
          // Skip this diagram if it can't be processed
        }
        return acc
      }, {} as Record<string, string>)
    } catch (error) {
      console.error('Error parsing Mermaid diagrams:', error)
      return {}
    }
  }, [content, providedDiagrams])

  // Get tabs with content
  const tabsWithContent = Object.entries(fixedDiagrams)
    .filter(([_, diagram]) => diagram && diagram.trim().length > 0)
    .map(([key, _]) => ({
      key,
      label: formatDiagramLabel(key),
      icon: getIconForDiagramType(key)
    }))
    
  // Format diagram label from key
  function formatDiagramLabel(key: string): string {
    // Handle section-based keys (e.g., "sequence-diagrams", "database-schema")
    if (key.includes('-')) {
      return key.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    
    // Handle simple keys (e.g., "diagram1", "diagram2")
    if (key.match(/^diagram\d+$/)) {
      const num = key.match(/\d+/)?.[0] || ''
      return `Diagram ${num}`
    }
    
    // Default formatting
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()
  }

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
        
        // Final safety check before rendering
        if (!isRenderableDiagram(diagramContent)) {
          throw new Error('Diagram content is not valid Mermaid syntax')
        }
        
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
      
      <CardContent className="p-0 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Horizontal scrolling tab container */}
          <div className="relative overflow-hidden bg-gray-50 border-b">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="flex w-max min-w-full gap-0 h-auto p-0 bg-transparent rounded-none">
                {tabsWithContent.map(tab => (
                  <TabsTrigger 
                    key={tab.key} 
                    value={tab.key}
                    className="relative flex items-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm whitespace-nowrap rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <span className="text-base sm:text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                    {renderStatus[tab.key] === "error" && (
                      <AlertCircle className="w-3 h-3 text-red-500 ml-1" />
                    )}
                    {renderStatus[tab.key] === "success" && (
                      <CheckCircle2 className="w-3 h-3 text-green-500 ml-1" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {/* Scroll indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none opacity-0 transition-opacity has-scroll-left:opacity-100" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none opacity-0 transition-opacity has-scroll-right:opacity-100" />
          </div>

          {tabsWithContent.map(tab => (
            <TabsContent key={tab.key} value={tab.key} className="mt-0">
              {viewMode === "preview" ? (
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden m-4 sm:m-0">
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
                <div id={`raw-${tab.key}`} className="bg-gray-50 rounded-lg border p-4 m-4 sm:m-0">
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