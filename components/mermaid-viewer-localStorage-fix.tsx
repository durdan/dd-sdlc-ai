"use client"

import React from "react"
import { MermaidViewerEnhanced } from "./mermaid-viewer-enhanced"
import { fixLocalStorageSequenceDiagram } from "@/lib/fix-localStorage-sequence"

interface MermaidViewerLocalStorageFixProps {
  content?: string
  diagrams?: Record<string, string>
  title?: string
  height?: string
}

/**
 * Wrapper around MermaidViewerEnhanced that applies localStorage-specific fixes
 * Use this when loading diagrams from localStorage that may have formatting issues
 */
export function MermaidViewerLocalStorageFix({ 
  content, 
  diagrams: providedDiagrams, 
  title,
  height
}: MermaidViewerLocalStorageFixProps) {
  
  // Apply localStorage fix to diagrams if needed
  const fixedDiagrams = React.useMemo(() => {
    if (!providedDiagrams) return undefined
    
    const fixed: Record<string, string> = {}
    
    for (const [key, diagram] of Object.entries(providedDiagrams)) {
      // Check if this looks like a localStorage sequence diagram issue
      if (diagram.includes('sequenceDiagram') && 
          diagram.includes('" ') && 
          diagram.includes('->>') &&
          diagram.split('\n').length <= 5) {
        // Apply the localStorage-specific fix
        fixed[key] = fixLocalStorageSequenceDiagram(diagram)
      } else {
        // Keep as is
        fixed[key] = diagram
      }
    }
    
    return fixed
  }, [providedDiagrams])
  
  // Apply fix to content if needed
  const fixedContent = React.useMemo(() => {
    if (!content) return undefined
    
    // Check if content has the localStorage issue pattern
    if (content.includes('sequenceDiagram') && 
        content.includes('" ') && 
        content.includes('->>') &&
        content.split('\n').length <= 5) {
      return fixLocalStorageSequenceDiagram(content)
    }
    
    return content
  }, [content])
  
  return (
    <MermaidViewerEnhanced
      content={fixedContent}
      diagrams={fixedDiagrams}
      title={title}
      height={height}
    />
  )
}