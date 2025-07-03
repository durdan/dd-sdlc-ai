"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MermaidViewer({ diagrams, title = "System Architecture Diagrams" }) {
  const [activeTab, setActiveTab] = useState("architecture")
  const diagramRef = useRef(null)

  const hasContent = key => diagrams[key] && diagrams[key].trim().length > 0

  // Set active tab to first one with content on mount or when diagrams change
  useEffect(() => {
    const tabsWithContent = ['architecture', 'database', 'userFlow', 'apiFlow'].filter(hasContent)
    if (tabsWithContent.length > 0 && !hasContent(activeTab)) {
      setActiveTab(tabsWithContent[0])
    }
  }, [diagrams])

  // Render the Mermaid diagram only for the active tab
  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagramRef.current) return
      const diagramContent = diagrams[activeTab]
      if (!diagramContent || diagramContent.trim() === '') {
        diagramRef.current.innerHTML = '<div class="p-8 text-center text-gray-500">No diagram available</div>'
        return
      }
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" })
        diagramRef.current.innerHTML = ''
        const { svg } = await mermaid.render(`diagram-${Date.now()}`, diagramContent.trim())
        diagramRef.current.innerHTML = svg
      } catch (error) {
        diagramRef.current.innerHTML = `<div class="p-8 text-center text-red-500">Rendering error: ${error}</div>`
      }
    }
    renderDiagram()
  }, [activeTab, diagrams])

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
            <TabsContent key={activeTab} value={activeTab}>
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div 
                  ref={diagramRef}
                  className="p-6 min-h-[400px] overflow-auto"
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
