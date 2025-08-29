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
 * This is now much more conservative to avoid breaking valid diagrams
 */
export function fixMermaidSyntax(diagramContent: string): string {
  let fixed = diagramContent
  
  // Fix backticks in node labels - replace with quotes for proper rendering
  // Mermaid doesn't handle backticks well in node labels
  fixed = fixed.replace(/([A-Za-z0-9_]+)`([^`]+)`/g, '$1"$2"')
  
  // Also handle standalone backtick labels like `Code Commit`
  fixed = fixed.replace(/`([^`]+)`/g, '"$1"')
  
  // Remove problematic line breaks in the middle of connections
  // This fixes the "Expecting SPACE, got NEWLINE" error
  fixed = fixed.replace(/-->\s*\n\s*\|/g, ' -->|')
  fixed = fixed.replace(/-->\s*\n\s*([A-Za-z0-9_"'`\[\]{}])/g, ' --> $1')
  
  // Fix decision nodes with improper formatting
  fixed = fixed.replace(/\{\s*([^}]+)\s*\}/g, '{$1}')
  
  // Only apply minimal fixes that are absolutely necessary
  
  // Fix malformed sequence diagrams with compressed whitespace
  // Check if it's a sequence diagram with improper formatting
  if (fixed.includes('sequenceDiagram')) {
    // Count the number of lines - if it's less than expected for the content, it's compressed
    const lines = fixed.split('\n').length
    const hasParticipants = fixed.includes('participant')
    const hasArrows = fixed.includes('->>') || fixed.includes('-->>')
    
    // If we have participants and arrows but very few lines, it's likely compressed
    if (hasParticipants && hasArrows && lines < 5) {
      // Fix compressed sequence diagrams by adding proper line breaks
      fixed = fixed.replace(/sequenceDiagram\s*/g, 'sequenceDiagram\n')
      
      // Add line breaks before each participant declaration
      fixed = fixed.replace(/(\s+|^)participant\s+/g, '\n  participant ')
      
      // Add line breaks before each message arrow
      fixed = fixed.replace(/(\s+)([A-Za-z0-9_]+\s*->>?\s*[A-Za-z0-9_]+:)/g, '\n  $2')
      fixed = fixed.replace(/(\s+)([A-Za-z0-9_]+\s*-->>?\s*[A-Za-z0-9_]+:)/g, '\n  $2')
      
      // Add line breaks before Note statements
      fixed = fixed.replace(/(\s+)Note\s+(over|right of|left of)\s+/g, '\n  Note $2 ')
      
      // Add line breaks before and after control flow keywords
      fixed = fixed.replace(/(\s+)(loop|alt|opt|par|critical|break)\s+/g, '\n  $2 ')
      fixed = fixed.replace(/(\s+)else\s+/g, '\n  else ')
      fixed = fixed.replace(/(\s+)and\s+/g, '\n  and ')
      fixed = fixed.replace(/(\s+)end(?=\s|$)/g, '\n  end')
      
      // Clean up any duplicate whitespace or newlines
      fixed = fixed.replace(/\n\s*\n\s*\n/g, '\n\n')
      fixed = fixed.trim()
    }
  }
  
  // Fix other diagram types with similar compression issues
  if (fixed.includes('erDiagram') && fixed.split('\n').length < 3) {
    fixed = fixed.replace(/erDiagram\s*/g, 'erDiagram\n')
    fixed = fixed.replace(/(\s+)([A-Z_]+\s*\|\|)/g, '\n  $2')
    fixed = fixed.replace(/(\s+)([A-Z_]+\s*\{)/g, '\n  $2')
  }
  
  if ((fixed.includes('graph') || fixed.includes('flowchart')) && fixed.split('\n').length < 3) {
    fixed = fixed.replace(/(graph|flowchart)\s+(TB|TD|LR|RL|BT)\s*/g, '$1 $2\n')
    fixed = fixed.replace(/(\s+)([A-Za-z0-9_]+\[)/g, '\n  $2')
    fixed = fixed.replace(/(\s+)([A-Za-z0-9_]+\s*-->)/g, '\n  $2')
    fixed = fixed.replace(/(\s+)subgraph\s+/g, '\n  subgraph ')
    fixed = fixed.replace(/(\s+)end(?=\s|$)/g, '\n  end')
  }
  
  // Fix graph/flowchart diagrams with mixed line breaks and inline content
  if (fixed.includes('graph LR') || fixed.includes('graph TB') || fixed.includes('graph TD') || fixed.includes('flowchart')) {
    // Normalize spacing around arrows and ensure each connection is on its own line
    // Handle --> connections with proper line breaks, including quoted labels
    fixed = fixed.replace(/(\s+)([A-Za-z0-9_"`\[\]{}][^-]*?-->\s*[A-Za-z0-9_"`\[\]{}][^\n]*)/g, '\n  $2')
    
    // Handle labeled connections like C -->|Yes| D with proper spacing
    fixed = fixed.replace(/(\s+)([A-Za-z0-9_"`\[\]{}][^-]*?-->\s*\|[^|]*\|\s*[A-Za-z0-9_"`\[\]{}][^\n]*)/g, '\n  $2')
    
    // Clean up excessive whitespace
    fixed = fixed.replace(/\n\s*\n\s*\n/g, '\n\n')
    fixed = fixed.trim()
  }
  
  return fixed
}

/**
 * Check if content contains Mermaid diagram syntax
 */
export function hasDiagramContent(content: string): boolean {
  if (!content || content.trim() === '') return false
  
  // First check for explicit mermaid code blocks
  const hasMermaidCodeBlocks = /```mermaid[\s\S]*?```/g.test(content)
  if (hasMermaidCodeBlocks) return true
  
  // For raw content, check for Mermaid diagram keywords with more strict patterns
  // These keywords should be at the start of a line and followed by specific syntax
  const strictPatterns = [
    /^\s*graph\s+(TB|TD|LR|RL|BT)/m,  // graph must be followed by direction
    /^\s*flowchart\s+(TB|TD|LR|RL|BT)/m,  // flowchart must be followed by direction
    /^\s*sequenceDiagram(?:\s|$)/m,  // sequenceDiagram as standalone
    /^\s*classDiagram(?:\s|$)/m,  // classDiagram as standalone
    /^\s*erDiagram(?:\s|$)/m,  // erDiagram as standalone
    /^\s*gantt(?:\s|$)/m,  // gantt as standalone
    /^\s*pie\s+title/m,  // pie must be followed by title
    /^\s*stateDiagram(?:-v2)?(?:\s|$)/m,  // stateDiagram with optional -v2
    /^\s*journey(?:\s|$)/m,  // journey as standalone
    /^\s*gitGraph(?:\s|$)/m,  // gitGraph as standalone
    /^\s*mindmap(?:\s|$)/m,  // mindmap as standalone
    /^\s*timeline(?:\s|$)/m,  // timeline as standalone
    /^\s*quadrantChart(?:\s|$)/m,  // quadrantChart as standalone
    /^\s*sankey(?:\s|$)/m,  // sankey as standalone
    /^\s*C4Context(?:\s|$)/m,  // C4Context as standalone
    /^\s*C4Container(?:\s|$)/m,  // C4Container as standalone
  ]
  
  // Check if any of the strict patterns match
  const hasMermaidSyntax = strictPatterns.some(pattern => pattern.test(content))
  
  return hasMermaidSyntax
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

/**
 * Parse Mermaid diagrams with section awareness
 * This version respects document structure and sections
 */
export function parseMermaidDiagramsWithSections(content: string): ParsedDiagrams {
  if (!content || !hasDiagramContent(content)) {
    return {}
  }

  const diagrams: ParsedDiagrams = {}
  
  // First, try to identify major sections (## 1. Sequence Diagrams, ## 2. Database Schema)
  // But also handle subsections (### 1. User Authentication Flow)
  const majorSectionRegex = /^##\s+(?:\d+\.\s*)?(.+?)$/gm
  const subsectionRegex = /^###\s+(?:\d+\.\s*)?(.+?)$/gm
  
  // Find major sections first
  const majorSections: Array<{name: string, start: number, end: number}> = []
  let match
  const majorMatches: Array<{name: string, index: number}> = []
  
  while ((match = majorSectionRegex.exec(content)) !== null) {
    const sectionName = match[1].trim()
    // Only consider it a major section if it contains keywords we care about
    if (sectionName.match(/Sequence|Database|System|Data Flow|Network|Deployment|Architecture|Component|Entity|Transaction|Content|Analytics/i)) {
      majorMatches.push({ name: sectionName, index: match.index })
    }
  }
  
  // Build major section ranges
  for (let i = 0; i < majorMatches.length; i++) {
    const current = majorMatches[i]
    const next = majorMatches[i + 1]
    majorSections.push({
      name: current.name,
      start: current.index,
      end: next ? next.index : content.length
    })
  }
  
  // Process each major section
  if (majorSections.length > 0) {
    majorSections.forEach((majorSection) => {
      const sectionContent = content.substring(majorSection.start, majorSection.end)
      
      // Find all subsections within this major section
      const subsectionMatches: Array<{name: string, index: number}> = []
      subsectionRegex.lastIndex = 0 // Reset regex
      
      while ((match = subsectionRegex.exec(sectionContent)) !== null) {
        const subsectionName = match[1].trim()
        subsectionMatches.push({ name: subsectionName, index: match.index })
      }
      
      // If we have subsections, parse each subsection's mermaid diagram
      if (subsectionMatches.length > 0) {
        for (let i = 0; i < subsectionMatches.length; i++) {
          const current = subsectionMatches[i]
          const next = subsectionMatches[i + 1]
          const subsectionStart = current.index
          const subsectionEnd = next ? next.index : sectionContent.length
          const subsectionContent = sectionContent.substring(subsectionStart, subsectionEnd)
          
          // Look for mermaid block in this subsection
          const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
          const mermaidMatch = mermaidRegex.exec(subsectionContent)
          
          if (mermaidMatch) {
            let diagramContent = mermaidMatch[1].trim()
            
            if (diagramContent && diagramContent.length > 10) {
              // Apply fixes
              diagramContent = fixMermaidSyntax(diagramContent)
              
              // Create key based on major section and subsection names
              const majorKey = majorSection.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
              
              const subKey = current.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
              
              // Use a combination of major and sub keys, or just sub if it's descriptive enough
              let key = subKey
              
              // For better naming, use subsection name if it's descriptive
              if (subKey.includes('auth') || subKey.includes('user')) {
                key = 'user-authentication'
              } else if (subKey.includes('order')) {
                key = 'order-processing'
              } else if (subKey.includes('api')) {
                key = 'api-integration'
              } else if (subKey.includes('error')) {
                key = 'error-handling'
              } else if (subKey.includes('microservice')) {
                key = 'microservices'
              } else if (subKey.includes('webhook')) {
                key = 'webhook-processing'
              } else if (subKey.includes('entity') || subKey.includes('erd')) {
                key = 'entity-relationship'
              } else if (subKey.includes('user') && subKey.includes('management')) {
                key = 'user-management'
              } else if (subKey.includes('product') && subKey.includes('catalog')) {
                key = 'product-catalog'
              } else if (subKey.includes('transaction')) {
                key = 'transactions'
              } else if (subKey.includes('content')) {
                key = 'content-management'
              } else if (subKey.includes('analytics') || subKey.includes('event')) {
                key = 'analytics-events'
              } else {
                // Use major section prefix if subsection name isn't clear
                if (majorKey.includes('sequence')) {
                  key = `sequence-${i + 1}`
                } else if (majorKey.includes('database')) {
                  key = `database-${i + 1}`
                } else {
                  key = `${majorKey}-${i + 1}`
                }
              }
              
              // Ensure unique keys
              if (diagrams[key]) {
                let counter = 2
                while (diagrams[`${key}-${counter}`]) {
                  counter++
                }
                key = `${key}-${counter}`
              }
              
              diagrams[key] = diagramContent
            }
          }
        }
      } else {
        // No subsections, look for mermaid diagrams in the major section directly
        const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
        let sectionMatch
        let diagramCount = 0
        
        while ((sectionMatch = mermaidRegex.exec(sectionContent)) !== null) {
          let diagramContent = sectionMatch[1].trim()
          
          if (diagramContent && diagramContent.length > 10) {
            // Apply fixes
            diagramContent = fixMermaidSyntax(diagramContent)
            
            // Create a meaningful key based on section name
            const sectionKey = majorSection.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
            
            // If multiple diagrams in same section, add index
            const key = diagramCount === 0 ? sectionKey : `${sectionKey}-${diagramCount + 1}`
            diagrams[key] = diagramContent
            diagramCount++
          }
        }
      }
    })
  }
  
  // If no sections were found or no diagrams parsed, fall back to simple parsing
  if (Object.keys(diagrams).length === 0) {
    return parseMermaidDiagrams(content)
  }
  
  return diagrams
}

/**
 * Enhanced extraction with section awareness
 */
export function extractAndFixMermaidDiagramsWithSections(content: string): {
  diagrams: ParsedDiagrams
  fixedContent: string
} {
  const diagrams = parseMermaidDiagramsWithSections(content)
  
  if (Object.keys(diagrams).length === 0) {
    return { diagrams: {}, fixedContent: content }
  }

  // Replace diagrams with fixed versions while preserving structure
  let fixedContent = content
  
  if (content.includes('```mermaid')) {
    // Create a map of original to fixed diagrams
    const originalToFixed: Map<string, string> = new Map()
    
    // First pass: extract originals
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
    let match
    const originals: string[] = []
    
    while ((match = mermaidRegex.exec(content)) !== null) {
      originals.push(match[1].trim())
    }
    
    // Map originals to fixed versions
    const fixedDiagrams = Object.values(diagrams)
    originals.forEach((original, index) => {
      if (fixedDiagrams[index]) {
        originalToFixed.set(original, fixedDiagrams[index])
      }
    })
    
    // Replace with fixed versions
    fixedContent = fixedContent.replace(/```mermaid\n([\s\S]*?)```/g, (match, diagramContent) => {
      const trimmed = diagramContent.trim()
      const fixed = originalToFixed.get(trimmed) || fixMermaidSyntax(trimmed)
      return `\`\`\`mermaid\n${fixed}\n\`\`\``
    })
  }
  
  return { diagrams, fixedContent }
}