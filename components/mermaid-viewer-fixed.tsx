"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MermaidViewerProps {
  diagrams: {
    [key: string]: string
  }
  title?: string
}

// Common Mermaid diagram types - but we'll use a more flexible approach for validation
// This list is just for reference and not used for strict validation
const commonDiagramTypes = [
  "graph", "flowchart", "sequenceDiagram", "classDiagram", "erDiagram", 
  "gantt", "pie", "stateDiagram", "journey", "gitGraph", "requirement", 
  "mindmap", "timeline", "quadrantChart", "sankey", "C4Context", "C4Container"
]

// Helper to split and validate Mermaid diagrams from a block of text
function splitDiagrams(content: string): string[] {
  if (!content || content.trim() === "") return []

  // First, filter out markdown headers (lines starting with #)
  const contentWithoutHeaders = content
    .split('\n')
    .filter(line => !line.trim().startsWith('#'))
    .join('\n')

  // Find all ```mermaid code blocks (if any)
  const mermaidCodeBlockRegex = /```(?:mermaid)?\s*([\s\S]*?)```/g
  const codeBlocks: string[] = []
  let match
  while ((match = mermaidCodeBlockRegex.exec(content)) !== null) {
    if (match[1] && match[1].trim()) {
      codeBlocks.push(match[1].trim())
    }
  }
  
  // If code blocks found, use those instead of filtered content
  let processedContent = codeBlocks.length > 0 ? codeBlocks.join("\n\n") : contentWithoutHeaders

  // Common Mermaid diagram types to help with validation
  const commonDiagramTypes = [
    "graph", "flowchart", "sequenceDiagram", "classDiagram", "erDiagram", 
    "gantt", "pie", "stateDiagram", "journey", "gitGraph", "requirement", 
    "mindmap", "timeline", "quadrantChart", "sankey", "C4Context", "C4Container"
  ]

  // If the content doesn't start with any known diagram type, it's probably not a valid diagram
  const startsWithDiagramType = commonDiagramTypes.some(type => 
    new RegExp(`^\\s*${type}\\s`, 'i').test(processedContent)
  )

  // If it doesn't look like a diagram at all, return empty array
  if (!startsWithDiagramType && !codeBlocks.length) {
    return []
  }

  // More flexible approach: look for any word followed by space at beginning of line
  // This will catch all diagram types without hardcoding them
  const diagramStartRegex = /(?:^|\n)(\w+)\s/g
  
  // Find all potential diagram starts
  const possibleDiagrams = []
  let lastIndex = 0
  let diagramMatch
  
  // Reset regex to start from beginning
  diagramStartRegex.lastIndex = 0
  
  while ((diagramMatch = diagramStartRegex.exec(processedContent)) !== null) {
    // Skip if this looks like a markdown header
    if (diagramMatch[1] === "#") continue
    
    // If this isn't the first match and we have content since the last match
    if (diagramMatch.index > lastIndex) {
      const diagram = processedContent.substring(lastIndex, diagramMatch.index).trim()
      if (diagram && !diagram.startsWith('#')) possibleDiagrams.push(diagram)
    }
    lastIndex = diagramMatch.index
  }
  
  // Add the last diagram if there is content after the last match
  if (lastIndex < processedContent.length) {
    const lastDiagram = processedContent.substring(lastIndex).trim()
    if (lastDiagram && !lastDiagram.startsWith('#')) possibleDiagrams.push(lastDiagram)
  }
  
  // If we couldn't split it, just return the whole content as one diagram
  if (possibleDiagrams.length === 0 && processedContent.trim() && !processedContent.trim().startsWith('#')) {
    return [processedContent.trim()]
  }
  
  // Filter out any obviously invalid diagrams
  return possibleDiagrams.filter(diagram => {
    // Skip markdown headers
    if (diagram.trim().startsWith('#')) return false
    
    // Basic validation: must be at least 10 chars and contain word characters
    if (diagram.length < 10) return false
    
    // Check if it starts with a common diagram type
    const hasValidStart = commonDiagramTypes.some(type => 
      new RegExp(`^\\s*${type}\\s`, 'i').test(diagram)
    )
    
    return hasValidStart
  })
}

export function MermaidViewer({
  diagrams: initialDiagrams,
  title = "System Diagrams"
}: MermaidViewerProps) {
  // Get all diagram keys from the input
  const diagramKeys = Object.keys(initialDiagrams || {})
  
  // Default to first key or 'diagrams' if empty
  const defaultKey = diagramKeys.length > 0 ? diagramKeys[0] : 'diagrams'
  
  const [activeTab, setActiveTab] = useState(defaultKey)
  
  // Debug tab changes
  useEffect(() => {
    console.log(`[MermaidViewer] Active tab changed to: ${activeTab}`)
  }, [activeTab])

  const [diagrams, setDiagrams] = useState<{
    [key: string]: string[]
  }>({})

  // Create separate refs for each tab to maintain rendered content
  const diagramRefs = useRef<{[key: string]: HTMLDivElement | null}>({})

  // Process input diagrams into arrays per tab
  useEffect(() => {
    if (!initialDiagrams) {
      setDiagrams({});
      return;
    }
    
    // Process each diagram key
    const processed: {[key: string]: string[]} = {}
    
    // Process each diagram key from the input
    Object.entries(initialDiagrams).forEach(([key, content]) => {
      processed[key] = splitDiagrams(content || "")
    })
    
    // If we have no diagrams at all, add an empty 'diagrams' category
    if (Object.keys(processed).length === 0) {
      processed['diagrams'] = []
    }
    
    // If we have multiple categories but the first one is empty,
    // consolidate all diagrams into the first category
    const keys = Object.keys(processed)
    if (keys.length > 1) {
      const firstKey = keys[0]
      if (processed[firstKey].length === 0) {
        // Collect all diagrams from other categories
        const allOtherDiagrams = keys.slice(1)
          .flatMap(key => processed[key])
          .filter(Boolean)
          
        if (allOtherDiagrams.length > 0) {
          // Move all diagrams to the first category
          processed[firstKey] = allOtherDiagrams
          
          // Clear other categories
          keys.slice(1).forEach(key => {
            processed[key] = []
          })
        }
      }
    }
    
    setDiagrams(processed)
  }, [initialDiagrams])

  // Set the first tab with content as active

  // Render Mermaid diagrams for all tabs
  useEffect(() => {
    const renderAllTabs = async () => {
      console.log(`[MermaidViewer] Rendering all tabs with diagrams:`, Object.keys(diagrams))
      
      // Render each tab's diagrams
      for (const tabKey of Object.keys(diagrams)) {
        const tabRef = diagramRefs.current[tabKey]
        const diagramsToRender = diagrams[tabKey] || []
        
        console.log(`[MermaidViewer] Rendering tab: ${tabKey}, ref:`, tabRef, `diagrams: ${diagramsToRender.length}`)
        
        if (!tabRef) {
          console.log(`[MermaidViewer] No ref found for tab: ${tabKey}`)
          continue
        }
        
        if (!diagramsToRender.length) {
          tabRef.innerHTML = '<div class="p-8 text-center text-gray-500">No diagrams available</div>'
          continue
        }
        try {
          const mermaid = (await import("mermaid")).default
          mermaid.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "loose"
          })
          tabRef.innerHTML = ""
          const diagramsContainer = document.createElement("div")
          diagramsContainer.className = "space-y-8 py-4"

          for (let i = 0; i < diagramsToRender.length; i++) {
            const content = diagramsToRender[i].trim()
            const wrapper = document.createElement("div")
            wrapper.className = "border rounded-lg p-4 bg-white shadow-sm"
            try {
              // More flexible validation - just check if it looks like a valid diagram
              // (has a word at the start followed by space, and reasonable length)
              if (content.length < 10 || !/^\s*\w+\s/.test(content)) {
                throw new Error("Invalid diagram format: Must start with a diagram type keyword")
              }
              const id = `mermaid-${tabKey}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
              const { svg } = await mermaid.render(id, content)
              wrapper.innerHTML = svg
            } catch (err: any) {
              wrapper.innerHTML = `
                <div class="p-4 text-center border border-red-200 rounded-lg bg-red-50">
                  <div class="text-red-500 font-medium mb-2">Diagram ${i + 1} Rendering Error</div>
                  <div class="text-sm text-gray-600 mb-2">${err?.message || "Unknown error"}</div>
                  <details class="text-left bg-white p-2 rounded border">
                    <summary class="cursor-pointer font-medium text-blue-600">Show Raw Content</summary>
                    <pre class="mt-2 text-xs overflow-auto max-h-32 p-2 bg-gray-50 rounded">${content}</pre>
                  </details>
                </div>
              `
            }
            diagramsContainer.appendChild(wrapper)
          }
          tabRef.innerHTML = ""
          tabRef.appendChild(diagramsContainer)
        } catch (error) {
          tabRef.innerHTML = `<div class="p-8 text-center text-red-500">Rendering error: ${error}</div>`
        }
      }
    }
    renderAllTabs()
    // Re-render when diagrams change (removed activeTab since we render all tabs)
  }, [diagrams])

  // Get tabs that have at least one diagram
  const tabsWithContent = Object.keys(diagrams)
    .filter(key => diagrams[key] && diagrams[key].length > 0)
    .map(key => {
      // Generate a friendly label and icon based on the key
      let label = key.charAt(0).toUpperCase() + key.slice(1)
      // Convert camelCase to Title Case with spaces
      label = label.replace(/([A-Z])/g, ' $1').trim()
      
      // Assign an appropriate icon based on the key name - using a more dynamic approach
      const keyLower = key.toLowerCase()
      const iconMap: Record<string, string> = {
        'architecture': '🏗️',
        'database': '🗄️',
        'user': '👤',
        'api': '🔄',
        'flow': '📈',
        'sequence': '⏱️',
        'class': '📦',
        'entity': '🔰',
        'er': '🔰',
        'relationship': '🔰',
        'state': '🔄',
        'gantt': '📅',
        'pie': '🥧',
        'journey': '🧭',
        'git': '🔀',
        'flowchart': '📊',
        'graph': '📊',
        'mindmap': '🧠',
        'timeline': '⏳',
        'diagram': '📊'
      }
      
      // Find the first matching key in our icon map
      let icon = "📊" // Default icon
      for (const [iconKey, iconValue] of Object.entries(iconMap)) {
        if (keyLower.includes(iconKey)) {
          icon = iconValue
          break
        }
      }
      
      return { key, label, icon }
    })

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
          <div className="w-full">
            {/* Custom tab buttons */}
            <div className={`grid w-full max-w-md mb-4 grid-cols-${tabsWithContent.length} bg-muted p-1 rounded-md`}>
              {tabsWithContent.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-xs flex items-center gap-1 px-3 py-2 rounded-sm transition-colors ${
                    activeTab === tab.key 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
            
            {/* All tab content rendered simultaneously, shown/hidden with CSS */}
            {tabsWithContent.map(tab => (
              <div 
                key={tab.key} 
                className={`bg-white rounded-lg border shadow-sm overflow-hidden ${
                  activeTab === tab.key ? 'block' : 'hidden'
                }`}
              >
                <div
                  ref={(el) => {
                    console.log(`[MermaidViewer] Setting ref for tab ${tab.key}:`, el)
                    diagramRefs.current[tab.key] = el
                  }}
                  className="p-6 min-h-[400px] overflow-auto"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
