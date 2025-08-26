/**
 * Centralized Mermaid diagram parser and fixer
 * This module provides bulletproof parsing and syntax fixing for Mermaid diagrams
 */

// Common Mermaid diagram types
export const MERMAID_DIAGRAM_TYPES = [
  'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'erDiagram',
  'gantt', 'pie', 'stateDiagram', 'journey', 'gitGraph', 'requirement',
  'mindmap', 'timeline', 'quadrantChart', 'sankey', 'C4Context', 'C4Container'
] as const

export interface ParsedDiagrams {
  [key: string]: string
}

/**
 * Fix common Mermaid syntax errors
 */
export function fixMermaidSyntax(diagramContent: string): string {
  let fixed = diagramContent

  // CRITICAL FIX 0: Fix sequence diagram authentication and response errors
  // Common patterns that break sequence diagrams:
  // - "401 Unauthorized" or similar HTTP status codes without quotes
  // - "Connection error" without proper formatting
  // - Response formats that break parsing
  
  // Fix HTTP status codes and error messages in sequence diagrams
  if (fixed.includes('sequenceDiagram') || fixed.includes('sequence')) {
    // Fix unquoted HTTP status codes and error messages
    fixed = fixed.replace(/(->>?|-->>?)\s*([^:\n]+):\s*(401\s+Unauthorized|403\s+Forbidden|404\s+Not Found|500\s+Internal Server Error|Connection error|Error|Success|OK)(?!["\n])/gm, 
      (match, arrow, participant, message) => {
        return `${arrow} ${participant}: "${message}"`
      })
    
    // Fix responses that are missing quotes
    fixed = fixed.replace(/(->>?|-->>?)\s*([^:\n]+):\s*([^"\n][^:\n]+[^"\n])$/gm, 
      (match, arrow, participant, message) => {
        // Only add quotes if message doesn't already have them and looks like it needs them
        const trimmedMsg = message.trim()
        if (!trimmedMsg.startsWith('"') && !trimmedMsg.endsWith('"') && 
            (trimmedMsg.includes(' ') || trimmedMsg.match(/^\d{3}\s/) || 
             trimmedMsg.includes('error') || trimmedMsg.includes('Error'))) {
          return `${arrow} ${participant}: "${trimmedMsg}"`
        }
        return match
      })
    
    // Fix participant declarations with special characters
    fixed = fixed.replace(/participant\s+([^\s]+)\s+as\s+"?([^"\n]+)"?/gm, 
      (match, id, label) => {
        return `participant ${id} as "${label.replace(/"/g, '')}"`
      })
    
    // Fix broken response patterns
    fixed = fixed.replace(/Response:\s*{([^}]+)}/gm, (match, content) => {
      return `"Response: {${content}}"`
    })
    
    // Fix authentication flow patterns
    fixed = fixed.replace(/Note\s+(over|right of|left of)\s+([^:]+):\s*([^"\n].+[^"\n])$/gm,
      (match, position, participant, note) => {
        const trimmedNote = note.trim()
        if (!trimmedNote.startsWith('"') && !trimmedNote.endsWith('"')) {
          return `Note ${position} ${participant}: "${trimmedNote}"`
        }
        return match
      })
  }

  // CRITICAL FIX 0.5: Fix line breaks in node labels
  // Pattern: AUTH[Authentication Service<br/>JWT, OAuth2, RBAC]
  // The <br/> should be preserved, but newlines within labels break the syntax
  
  // First, fix cases where node labels are split across lines
  fixed = fixed.replace(/(\w+)\[([^\]]*)\n([^\]]*)\]/gm, (match, nodeId, part1, part2) => {
    // Combine parts with <br/> if they don't already have it
    const combined = part1.trim() + '<br/>' + part2.trim()
    return `${nodeId}[${combined}]`
  })
  
  // Handle multiple line breaks in labels (with max iterations to prevent infinite loop)
  let prevFixed = ''
  let iterations = 0
  const maxIterations = 10 // Prevent infinite loops
  
  while (prevFixed !== fixed && iterations < maxIterations) {
    prevFixed = fixed
    fixed = fixed.replace(/\[([^\[\]]*)\n([^\[\]]*)\]/gm, (match, part1, part2) => {
      if (part1.includes('<br/>') && part2.includes('<br/>')) {
        return `[${part1.trim()} ${part2.trim()}]`
      }
      return `[${part1.trim()}<br/>${part2.trim()}]`
    })
    iterations++
  }
  
  if (iterations >= maxIterations) {
    console.warn('Maximum iterations reached in fixMermaidSyntax - possible malformed content')
  }

  // CRITICAL FIX 0.5: Split compressed single-line diagrams
  // Pattern: graph LR  subgraph ... end  subgraph ... end  A --> B
  if (fixed.split('\n').length <= 2) {
    // Replace multiple spaces with newlines for better structure
    fixed = fixed.replace(/\s{2,}/g, '\n  ')
    // Ensure proper formatting around subgraph declarations
    fixed = fixed.replace(/(\w+)\s+subgraph\s+/g, '$1\n  subgraph ')
    fixed = fixed.replace(/\s+end\s+/g, '\n  end\n  ')
    // Format node connections
    fixed = fixed.replace(/\s+([\w]+\s*-->\s*[\w]+)/g, '\n  $1')
    // Clean up extra spaces
    fixed = fixed.replace(/\n\s*\n/g, '\n')
  }

  // CRITICAL FIX 1: Fix malformed subgraph syntax
  // Pattern: subgraph subgraph1[Client Layer  WEB][Web App...
  fixed = fixed.replace(/subgraph\s+(\w+)\[([^\]]+)\s+(\w+)\]\[/g, (match, id, label, nodeId) => {
    // Separate the subgraph declaration from the node definition
    return `subgraph ${id}[${label.trim()}]\n    ${nodeId}[`
  })

  // FIX 2: Fix subgraph declarations with content on the same line
  fixed = fixed.replace(/subgraph\s+(\w+)\[([^\]]+)\]\s*(\w+\[)/g, (match, id, label, nodeStart) => {
    return `subgraph ${id}[${label}]\n    ${nodeStart}`
  })

  // FIX 3: Remove extra 'end' statements
  const subgraphCount = (fixed.match(/subgraph\s+/g) || []).length
  const endCount = (fixed.match(/^\s*end\s*$/gm) || []).length
  
  if (endCount > subgraphCount) {
    const extraEnds = endCount - subgraphCount
    // Remove extra ends from the bottom
    const lines = fixed.split('\n')
    let removedCount = 0
    for (let i = lines.length - 1; i >= 0 && removedCount < extraEnds; i--) {
      if (lines[i].trim() === 'end') {
        lines.splice(i, 1)
        removedCount++
      }
    }
    fixed = lines.join('\n')
  }

  // FIX 4: Fix concatenated diagrams (e.g., "enderDiagram")
  fixed = fixed.replace(/end([A-Z]\w+)/g, 'end\n\n$1')

  // FIX 5: Fix quotes in subgraph names
  fixed = fixed.replace(/subgraph\s+"([^"]+)"/g, 'subgraph $1')

  // FIX 6: Fix subgraphs with spaces/special chars
  let subgraphCounter = 0
  fixed = fixed.replace(/subgraph\s+([^\[\n\s]+)\s*$/gm, (match, name) => {
    if (name.includes(' ') || name.includes('&') || name.includes('-')) {
      subgraphCounter++
      return `subgraph subgraph${subgraphCounter}[${name}]`
    }
    return match
  })

  // FIX 7: Fix node definitions with unbalanced brackets
  fixed = fixed.replace(/(\w+)\[([^\]]+?)(?:\]|$)/gm, (match, nodeId, label) => {
    if (!match.endsWith(']')) {
      return `${nodeId}[${label}]`
    }
    return match
  })

  // FIX 8: Ensure proper spacing around arrows
  fixed = fixed.replace(/(\w+)(-->|--|->|==>|-.->|\|\|--o\{|\|\|--\|\{)(\w+)/g, '$1 $2 $3')

  // FIX 9: Fix ER diagram entity syntax
  fixed = fixed.replace(/(\w+)\s+\{([^}]*)\}/gm, (match, entity, attributes) => {
    const cleanedAttrs = attributes.split('\n').map((attr: string) => attr.trim()).filter((attr: string) => attr)
    return `${entity} {\n    ${cleanedAttrs.join('\n    ')}\n}`
  })

  // FIX 10: Fix truncated node labels (e.g., "Send]" instead of "SendGrid")
  // This happens when content is cut off mid-label
  fixed = fixed.replace(/\[([^\]]+)\]\s*\n\s*([^\[\n]+)\]/gm, (match, part1, part2) => {
    // If part2 looks like a continuation (doesn't start with a node ID)
    if (!part2.match(/^\w+\[/)) {
      return `[${part1.trim()}<br/>${part2.trim()}]`
    }
    return match
  })
  
  // FIX 11: Fix incomplete Email Service node labels
  // Pattern: EMAIL[Email Service\nSend] should be EMAIL[Email Service<br/>SendGrid]
  fixed = fixed.replace(/EMAIL\[Email Service\s*\n\s*Send\]/g, 'EMAIL[Email Service<br/>SendGrid, AWS SES]')
  
  // FIX 12: Fix specific sequence diagram patterns that commonly fail
  if (fixed.includes('sequenceDiagram')) {
    // Fix broken activation/deactivation patterns
    fixed = fixed.replace(/activate\s+([^\s\n]+)\s*$/gm, 'activate $1')
    fixed = fixed.replace(/deactivate\s+([^\s\n]+)\s*$/gm, 'deactivate $1')
    
    // Fix loop and alt blocks
    fixed = fixed.replace(/loop\s+([^\n]+)\s*$/gm, 'loop $1')
    fixed = fixed.replace(/alt\s+([^\n]+)\s*$/gm, 'alt $1')
    fixed = fixed.replace(/else\s+([^\n]+)\s*$/gm, 'else $1')
    
    // Ensure proper end statements for blocks
    const loopCount = (fixed.match(/^\s*loop\s+/gm) || []).length
    const altCount = (fixed.match(/^\s*alt\s+/gm) || []).length
    const endCount = (fixed.match(/^\s*end\s*$/gm) || []).length
    const expectedEnds = loopCount + altCount
    
    if (endCount < expectedEnds) {
      // Add missing end statements
      const missingEnds = expectedEnds - endCount
      for (let i = 0; i < missingEnds; i++) {
        fixed += '\n    end'
      }
    }
    
    // Fix message arrows with special characters
    fixed = fixed.replace(/(->>?|-->>?)\s*([^:\n]+):\s*([^\n]+)/gm, (match, arrow, participant, message) => {
      const trimmedMsg = message.trim()
      // Check if message contains problematic characters
      if (trimmedMsg.includes('{') || trimmedMsg.includes('}') || 
          trimmedMsg.includes('[') || trimmedMsg.includes(']') ||
          trimmedMsg.includes('(') || trimmedMsg.includes(')')) {
        // Ensure it's properly quoted
        if (!trimmedMsg.startsWith('"') || !trimmedMsg.endsWith('"')) {
          return `${arrow} ${participant}: "${trimmedMsg.replace(/"/g, '\\"')}"`
        }
      }
      return match
    })
  }
  
  // FIX 13: Fix class diagram method signatures
  if (fixed.includes('classDiagram')) {
    // Fix method signatures with return types
    fixed = fixed.replace(/(\+|-|#|~)\s*(\w+)\s*\(\s*([^)]*)\s*\)\s*:\s*(\w+)/gm, 
      '$1$2($3) $4')
    
    // Fix attributes with types
    fixed = fixed.replace(/(\+|-|#|~)\s*(\w+)\s*:\s*(\w+)/gm, 
      '$1$2 : $3')
  }
  
  // FIX 14: Fix state diagram syntax
  if (fixed.includes('stateDiagram')) {
    // Fix state transitions
    fixed = fixed.replace(/(\w+)\s*-->\s*(\w+)\s*:\s*([^\n]+)/gm, 
      (match, from, to, label) => {
        const trimmedLabel = label.trim()
        if (trimmedLabel.includes(' ') && !trimmedLabel.startsWith('"')) {
          return `${from} --> ${to} : "${trimmedLabel}"`
        }
        return `${from} --> ${to} : ${trimmedLabel}`
      })
  }
  
  // FIX 15: Clean up whitespace
  fixed = fixed.split('\n').map(line => line.trimRight()).join('\n')
  fixed = fixed.replace(/\n{3,}/g, '\n\n')

  return fixed
}

/**
 * Check if content contains Mermaid diagram syntax
 */
export function hasDiagramContent(content: string): boolean {
  if (!content || content.trim() === '') return false
  
  // Check for Mermaid diagram keywords
  const hasMermaidSyntax = MERMAID_DIAGRAM_TYPES.some(keyword => 
    new RegExp(`^\\s*${keyword}\\s`, 'im').test(content)
  )
  
  // Check for code blocks that might contain diagrams
  const hasCodeBlocks = /```(?:mermaid)?[\s\S]*?```/g.test(content)
  
  return hasMermaidSyntax || hasCodeBlocks
}

/**
 * Parse Mermaid content into separate diagrams
 * Handles both markdown code blocks and raw content
 */
export function parseMermaidDiagrams(content: string): ParsedDiagrams {
  if (!content || !hasDiagramContent(content)) {
    return {}
  }

  const diagrams: ParsedDiagrams = {}
  
  // First, check if the content has proper markdown code blocks
  const hasCodeBlocks = content.includes('```mermaid')
  
  if (hasCodeBlocks) {
    // Parse markdown code blocks
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
    let match
    let index = 1

    while ((match = mermaidRegex.exec(content)) !== null) {
      let diagramContent = match[1].trim()
      
      if (diagramContent && diagramContent.length > 10) {
        // Apply fixes
        diagramContent = fixMermaidSyntax(diagramContent)
        diagrams[`diagram${index}`] = diagramContent
        index++
      }
    }
  } else {
    // Parse raw content by looking for diagram type declarations
    const diagramStarts: {type: string, index: number}[] = []
    
    // Find all diagram starts
    MERMAID_DIAGRAM_TYPES.forEach(type => {
      // Look for variations like "graph TB", "flowchart LR", etc.
      const variations = type === 'graph' || type === 'flowchart' 
        ? [`${type} TB`, `${type} TD`, `${type} LR`, `${type} RL`, `${type} BT`]
        : [type]
      
      variations.forEach(variant => {
        let index = content.indexOf(variant)
        while (index !== -1) {
          diagramStarts.push({ type: variant, index })
          index = content.indexOf(variant, index + 1)
        }
      })
    })
    
    // Sort by index
    diagramStarts.sort((a, b) => a.index - b.index)
    
    // Extract each diagram
    diagramStarts.forEach((start, i) => {
      const nextStart = diagramStarts[i + 1]
      const endIndex = nextStart ? nextStart.index : content.length
      let diagramContent = content.substring(start.index, endIndex).trim()
      
      // Apply fixes
      diagramContent = fixMermaidSyntax(diagramContent)
      
      if (diagramContent.length > 10) {
        // Try to find a section name from headers or comments
        const headerMatch = content.substring(Math.max(0, start.index - 100), start.index)
          .match(/(?:^|\n)##\s+([^\n]+)/m)
        const commentMatch = diagramContent.match(/^%%\s*([A-Za-z\s]+)/m)
        
        const name = headerMatch?.[1]?.trim().toLowerCase().replace(/\s+/g, '') ||
                    commentMatch?.[1]?.trim().toLowerCase().replace(/\s+/g, '') ||
                    `diagram${i + 1}`
        
        diagrams[name] = diagramContent
      }
    })
  }
  
  // If we couldn't split it, but it has diagram content, return as single diagram
  if (Object.keys(diagrams).length === 0 && hasDiagramContent(content)) {
    const fixed = fixMermaidSyntax(content.trim())
    if (fixed.length > 10) {
      diagrams.diagram1 = fixed
    }
  }
  
  return diagrams
}

/**
 * Validate a single Mermaid diagram
 */
export function validateMermaidDiagram(diagram: string): { isValid: boolean; error?: string } {
  if (!diagram || diagram.trim().length < 10) {
    return { isValid: false, error: 'Diagram content too short' }
  }

  // Check if it starts with a valid diagram type
  const startsWithValidType = MERMAID_DIAGRAM_TYPES.some(type =>
    new RegExp(`^\\s*${type}\\s`, 'i').test(diagram)
  )

  if (!startsWithValidType) {
    return { isValid: false, error: 'Diagram must start with a valid type (e.g., graph, flowchart, etc.)' }
  }

  // Check for balanced brackets
  const openBrackets = (diagram.match(/\[/g) || []).length
  const closeBrackets = (diagram.match(/\]/g) || []).length
  
  if (openBrackets !== closeBrackets) {
    return { isValid: false, error: 'Unbalanced brackets detected' }
  }

  // Check for balanced quotes
  const quotes = (diagram.match(/"/g) || []).length
  if (quotes % 2 !== 0) {
    return { isValid: false, error: 'Unbalanced quotes detected' }
  }

  // Check subgraph/end balance
  const subgraphCount = (diagram.match(/subgraph\s+/g) || []).length
  const endCount = (diagram.match(/^\s*end\s*$/gm) || []).length
  
  if (subgraphCount !== endCount) {
    return { isValid: false, error: `Mismatched subgraphs (${subgraphCount}) and end statements (${endCount})` }
  }

  return { isValid: true }
}

/**
 * Extract and fix all Mermaid diagrams from content
 * Returns both the parsed diagrams and the content with fixed diagrams
 */
export function extractAndFixMermaidDiagrams(content: string): {
  diagrams: ParsedDiagrams
  fixedContent: string
} {
  const diagrams = parseMermaidDiagrams(content)
  
  if (Object.keys(diagrams).length === 0) {
    return { diagrams: {}, fixedContent: content }
  }

  // If content has markdown blocks, replace them with fixed versions
  if (content.includes('```mermaid')) {
    let fixedContent = content
    let diagramIndex = 0
    
    fixedContent = fixedContent.replace(/```mermaid\n([\s\S]*?)```/g, (match, diagramContent) => {
      diagramIndex++
      const fixedDiagram = diagrams[`diagram${diagramIndex}`]
      if (fixedDiagram) {
        return `\`\`\`mermaid\n${fixedDiagram}\n\`\`\``
      }
      return match
    })
    
    return { diagrams, fixedContent }
  }

  // For raw content, return as is (diagrams are already fixed in the parsed result)
  return { diagrams, fixedContent: content }
}