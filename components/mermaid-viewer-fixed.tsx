"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Eye, Code, Copy, Check } from "lucide-react"

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
function splitDiagrams(content: string | undefined | null): string[] {
  // Convert to string and handle null/undefined cases
  const stringContent = content ? String(content) : ""
  if (!stringContent || stringContent.trim() === "") return []

  // First, filter out markdown headers (lines starting with #)
  const contentWithoutHeaders = stringContent
    .split('\n')
    .filter(line => !line.trim().startsWith('#'))
    .join('\n')

  // Find all ```mermaid code blocks (if any)
  const mermaidCodeBlockRegex = /```(?:mermaid)?\s*([\s\S]*?)```/g
  const codeBlocks: string[] = []
  let match
  while ((match = mermaidCodeBlockRegex.exec(stringContent)) !== null) {
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
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview')
  const [copiedDiagram, setCopiedDiagram] = useState<string | null>(null)
  
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
      
      // Clean up any existing Mermaid elements first
      try {
        const existingMermaidElements = document.querySelectorAll('[id^="mermaid-"], [id^="diagram-"]')
        existingMermaidElements.forEach(el => {
          if (el.parentNode) {
            el.parentNode.removeChild(el)
          }
        })
      } catch (cleanupError) {
        console.warn('[MermaidViewer] Cleanup warning:', cleanupError)
      }
      
      // Small delay to ensure DOM refs are ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Render each tab's diagrams
      for (const tabKey of Object.keys(diagrams)) {
        const tabRef = diagramRefs.current[tabKey]
        const diagramsToRender = diagrams[tabKey] || []
        
        console.log(`[MermaidViewer] Rendering tab: ${tabKey}, ref:`, tabRef, `diagrams: ${diagramsToRender.length}`)
        
        if (!tabRef) {
          console.log(`[MermaidViewer] No ref found for tab: ${tabKey}`)
          continue
        }
        
        // Clear any existing content first
        tabRef.innerHTML = ''
        
        if (!diagramsToRender.length) {
          tabRef.innerHTML = '<div class="p-8 text-center text-gray-500">No diagrams available</div>'
          continue
        }
        
        try {
          // Import and initialize Mermaid once per tab
          const mermaid = (await import("mermaid")).default
          
          // Create container for all diagrams in this tab
          const diagramsContainer = document.createElement("div")
          diagramsContainer.className = "space-y-6 sm:space-y-8 py-4"

          for (let i = 0; i < diagramsToRender.length; i++) {
            const content = diagramsToRender[i].trim()
            const wrapper = document.createElement("div")
            wrapper.className = "border rounded-lg p-3 sm:p-4 bg-white shadow-sm overflow-x-auto"
            
            // Create header with view toggle and copy button
            const header = document.createElement("div")
            header.className = "flex items-center justify-between mb-3 pb-2 border-b border-gray-200"
            
            const title = document.createElement("h4")
            title.className = "text-sm font-medium text-gray-700"
            title.textContent = `Diagram ${i + 1}`
            
            const controls = document.createElement("div")
            controls.className = "flex items-center gap-2"
            
            // View mode toggle buttons
            const previewBtn = document.createElement("button")
            previewBtn.className = `px-2 py-1 text-xs rounded transition-colors ${
              viewMode === 'preview' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`
            previewBtn.innerHTML = '<svg class="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>Preview'
            previewBtn.onclick = () => setViewMode('preview')
            
            const rawBtn = document.createElement("button")
            rawBtn.className = `px-2 py-1 text-xs rounded transition-colors ${
              viewMode === 'raw' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`
            rawBtn.innerHTML = '<svg class="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>Raw'
            rawBtn.onclick = () => setViewMode('raw')
            
            // Copy button
            const copyBtn = document.createElement("button")
            copyBtn.className = "px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            const diagramId = `${tabKey}-${i}`
            const isCopied = copiedDiagram === diagramId
            copyBtn.innerHTML = isCopied 
              ? '<svg class="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Copied!'
              : '<svg class="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>Copy'
            copyBtn.onclick = () => copyDiagram(content, i)
            
            controls.appendChild(previewBtn)
            controls.appendChild(rawBtn)
            controls.appendChild(copyBtn)
            
            header.appendChild(title)
            header.appendChild(controls)
            wrapper.appendChild(header)
            
            // Content area
            const contentArea = document.createElement("div")
            contentArea.className = "min-h-[200px]"
            
            if (viewMode === 'raw') {
              // Show raw script
              const pre = document.createElement("pre")
              pre.className = "text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-96"
              pre.textContent = content
              contentArea.appendChild(pre)
            } else {
              // Show preview
              try {
                // More flexible validation - just check if it looks like a valid diagram
                if (content.length < 10 || !/^\s*\w+\s/.test(content)) {
                  throw new Error("Invalid diagram format: Must start with a diagram type keyword")
                }
                
                // Use a completely isolated approach - render to string without DOM manipulation
                const uniqueId = `diagram-${tabKey.replace(/\s+/g, '-')}-${i}-${Date.now()}`
                
                try {
                  // Reset mermaid to clean state
                  const mermaid = (await import("mermaid")).default
                  await mermaid.initialize({
                    startOnLoad: false,
                    theme: "default",
                    securityLevel: "loose",
                    suppressErrorRendering: true,
                    deterministicIds: false,
                    maxTextSize: 50000
                  })
                  
                  // Use render method that doesn't require DOM elements
                  const renderResult = await mermaid.render(uniqueId, content)
                  
                  // Create responsive wrapper for the SVG
                  const svgWrapper = document.createElement("div")
                  svgWrapper.className = "mermaid-container w-full overflow-auto"
                  svgWrapper.innerHTML = renderResult.svg
                  
                  // Add mobile-friendly styling to the SVG
                  const svgElement = svgWrapper.querySelector('svg')
                  if (svgElement) {
                    svgElement.style.maxWidth = '100%'
                    svgElement.style.height = 'auto'
                    svgElement.style.fontSize = 'clamp(10px, 2vw, 14px)'
                    // Ensure proper scaling
                    svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')
                  }
                  
                  contentArea.appendChild(svgWrapper)
                  
                } catch (mermaidError: any) {
                  console.error(`[MermaidViewer] Mermaid render error for diagram ${i + 1}:`, mermaidError)
                  throw mermaidError
                }
                
              } catch (err: any) {
                console.error(`[MermaidViewer] Error rendering diagram ${i + 1} in tab ${tabKey}:`, err)
                contentArea.innerHTML = `
                  <div class="p-3 sm:p-4 text-center border border-red-200 rounded-lg bg-red-50">
                    <div class="text-red-500 font-medium mb-2 text-sm sm:text-base">Diagram ${i + 1} Rendering Error</div>
                    <div class="text-xs sm:text-sm text-gray-600 mb-2">${err?.message || "Unknown error"}</div>
                    <details class="text-left bg-white p-2 rounded border">
                      <summary class="cursor-pointer font-medium text-blue-600 text-xs sm:text-sm">Show Raw Content</summary>
                      <pre class="mt-2 text-xs overflow-auto max-h-32 p-2 bg-gray-50 rounded">${content}</pre>
                    </details>
                  </div>
                `
              }
            }
            
            wrapper.appendChild(contentArea)
            diagramsContainer.appendChild(wrapper)
          }
          
          // Append the complete container to the tab
          tabRef.appendChild(diagramsContainer)
          
        } catch (error) {
          console.error(`[MermaidViewer] Error rendering tab ${tabKey}:`, error)
          tabRef.innerHTML = `<div class="p-8 text-center text-red-500">Rendering error: ${error}</div>`
        }
      }
    }
    
    if (Object.keys(diagrams).length > 0) {
      renderAllTabs()
    }
  }, [diagrams, viewMode])

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

  // Copy diagram content to clipboard
  const copyDiagram = async (content: string, diagramIndex: number) => {
    try {
      await navigator.clipboard.writeText(content)
      const diagramId = `${activeTab}-${diagramIndex}`
      setCopiedDiagram(diagramId)
      setTimeout(() => setCopiedDiagram(null), 2000)
    } catch (error) {
      console.error('Failed to copy diagram:', error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {tabsWithContent.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500 text-sm sm:text-base">
            No diagrams available. Generate SDLC documents first.
          </div>
        ) : (
          <div className="w-full">
            {/* Mobile-responsive tab buttons with horizontal scroll */}
            <div className="mb-4 overflow-x-auto">
              <div className="flex min-w-max bg-muted p-1 rounded-md gap-1">
                {tabsWithContent.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`text-xs sm:text-sm flex items-center gap-1 px-2 sm:px-3 py-2 rounded-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.key 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="text-sm">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
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
                  className="p-3 sm:p-6 min-h-[300px] sm:min-h-[400px] overflow-auto"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
