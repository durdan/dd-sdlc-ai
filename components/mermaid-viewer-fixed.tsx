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
  console.log('🚀 FIXED MermaidViewer component rendered!', { diagrams, title })
  
  const [activeTab, setActiveTab] = useState("architecture")
  const diagramRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  
  // Helper to check if a diagram has content
  const hasContent = (key: string) => {
    const content = diagrams[key as keyof typeof diagrams]
    return content && content.trim().length > 0
  }
  
  // Set active tab to first one with content on mount
  useEffect(() => {
    console.log('🔥 FIXED MermaidViewer useEffect triggered', { diagrams, activeTab })
    const tabsWithContent = ['architecture', 'database', 'userFlow', 'apiFlow'].filter(hasContent)
    console.log('🔥 FIXED tabsWithContent:', tabsWithContent)
    if (tabsWithContent.length > 0 && !hasContent(activeTab)) {
      console.log('🔥 FIXED setActiveTab to first tab with content:', tabsWithContent[0])
      setActiveTab(tabsWithContent[0])
    }
  }, [diagrams])

  // Render Mermaid diagram for active tab
  useEffect(() => {
    console.log('🔥 FIXED MermaidViewer useEffect triggered', { activeTab })
    
    const renderDiagram = async () => {
      const diagramRef = diagramRefs.current[activeTab]
      console.log('🔥 renderDiagram called', { activeTab, hasRef: !!diagramRef })
      
      if (!diagramRef) {
        console.log('❌ No diagramRef for tab:', activeTab)
        return
      }
      
      const diagramContent = diagrams[activeTab as keyof typeof diagrams]
      console.log('🔥 Diagram content:', { activeTab, hasContent: !!diagramContent, length: diagramContent?.length })
      
      if (!diagramContent || diagramContent.trim() === '') {
        console.log('❌ No diagram content for tab:', activeTab)
        diagramRef.innerHTML = '<div class="p-8 text-center text-gray-500">No diagram available</div>'
        return
      }

      try {
        console.log('🔥 Importing Mermaid...')
        const mermaid = (await import("mermaid")).default
        console.log('✅ Mermaid imported successfully')
        
        // Initialize with basic config
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          fontFamily: "Arial, sans-serif"
        })
        console.log('✅ Mermaid initialized')

        // Clear and render
        diagramRef.innerHTML = '<div class="p-4 text-center text-blue-500">Rendering diagram...</div>'
        console.log('🔥 Rendering diagram for tab:', activeTab)
        
        const diagramId = `mermaid-${activeTab}-${Date.now()}`
        const { svg } = await mermaid.render(diagramId, diagramContent.trim())
        
        console.log('✅ Mermaid render successful, SVG length:', svg.length)
        diagramRef.innerHTML = svg
        console.log('✅ SVG inserted into DOM for tab:', activeTab)
        
      } catch (error) {
        console.error('❌ Mermaid error for tab:', activeTab, error)
        diagramRef.innerHTML = `
          <div class="p-8 text-center">
            <div class="text-red-500 font-medium mb-2">Diagram Rendering Error</div>
            <div class="text-sm text-gray-600 mb-4">Failed to render Mermaid diagram</div>
            <details class="text-left bg-gray-100 p-4 rounded">
              <summary class="cursor-pointer font-medium">Show Raw Content</summary>
              <pre class="mt-2 text-xs overflow-auto max-h-32">${diagramContent}</pre>
            </details>
          </div>
        `
      }
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(renderDiagram, 100)
    return () => clearTimeout(timeoutId)
  }, [activeTab, diagrams])

  // Get tabs that have content
  const tabsWithContent = [
    { key: 'architecture', label: 'Architecture', icon: '🏗️' },
    { key: 'database', label: 'Database', icon: '🗄️' },
    { key: 'userFlow', label: 'User Flow', icon: '👤' },
    { key: 'apiFlow', label: 'API Flow', icon: '🔄' }
  ].filter(tab => hasContent(tab.key))

  console.log('🔥 Tabs with content:', tabsWithContent.map(t => t.key))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      
      <CardContent>
        {tabsWithContent.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No diagrams available. Generate SDLC documents first.
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
                    ref={(el) => { diagramRefs.current[tab.key] = el }}
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
