"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const diagramRef = useRef<HTMLDivElement>(null)
  
  // Helper to check if a diagram has content
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
  }, [diagrams, activeTab])

  // Render Mermaid diagram
  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagramRef.current) return
      
      const diagramContent = diagrams[activeTab as keyof typeof diagrams]
      
      if (!diagramContent || diagramContent.trim() === '') {
        diagramRef.current.innerHTML = `
          <div class="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div class="text-center p-6">
              <h3 class="text-lg font-medium text-gray-700 mb-2">No Diagram Available</h3>
              <p class="text-gray-500">This diagram type hasn't been generated yet.</p>
            </div>
          </div>
        `
        return
      }

      try {
        // Dynamic import of Mermaid
        const mermaid = (await import("mermaid")).default
        
        // Initialize Mermaid with basic config
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose"
        })

        // Clear previous content
        diagramRef.current.innerHTML = ''
        
        // Create unique ID
        const diagramId = `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        // Render the diagram
        const { svg } = await mermaid.render(diagramId, diagramContent.trim())
        diagramRef.current.innerHTML = svg
        
        console.log('✅ Mermaid diagram rendered successfully for tab:', activeTab)
        
      } catch (error) {
        console.error('❌ Mermaid rendering error:', error)
        diagramRef.current.innerHTML = `
          <div class="flex items-center justify-center h-64 bg-red-50 rounded-lg border-2 border-dashed border-red-300">
            <div class="text-center p-6">
              <h3 class="text-lg font-medium text-red-700 mb-2">Diagram Rendering Error</h3>
              <p class="text-red-600 text-sm">Unable to render this diagram. Check console for details.</p>
              <details class="mt-4 text-left">
                <summary class="cursor-pointer text-sm font-medium text-red-700">Show Raw Content</summary>
                <pre class="mt-2 p-3 bg-red-100 rounded text-xs overflow-auto max-h-32">${diagramContent}</pre>
              </details>
            </div>
          </div>
        `
      }
    }

    renderDiagram()
  }, [activeTab, diagrams])

  // Get tabs that have content
  const tabsWithContent = [
    { key: 'architecture', label: 'Architecture', icon: '🏗️' },
    { key: 'database', label: 'Database', icon: '🗄️' },
    { key: 'userFlow', label: 'User Flow', icon: '👤' },
    { key: 'apiFlow', label: 'API Flow', icon: '🔄' }
  ].filter(tab => hasContent(tab.key))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      
      <CardContent>
        {tabsWithContent.length === 0 ? (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center p-8">
              <h3 class="text-lg font-medium text-gray-700 mb-2">No Diagrams Available</h3>
              <p class="text-gray-500">Generate SDLC documents first to see architecture diagrams here.</p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-md mb-4">
              {tabsWithContent.map(tab => (
                <TabsTrigger 
                  key={tab.key} 
                  value={tab.key}
                  className="text-xs flex items-center gap-1"
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabsWithContent.map(tab => (
              <TabsContent key={tab.key} value={tab.key}>
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div 
                    ref={diagramRef}
                    className="p-6 min-h-[400px] overflow-auto"
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
