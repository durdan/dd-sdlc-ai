/**
 * Enhanced Mermaid diagram parser with robust self-healing capabilities
 * This module provides bulletproof parsing and syntax fixing for Mermaid diagrams
 */

import { fixBrokenERDiagram } from './er-diagram-reconstructor'

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
 * Comprehensive Mermaid syntax fixer with deep pattern matching
 */
export function fixMermaidSyntaxEnhanced(diagramContent: string): string {
  let fixed = diagramContent
  
  // Step 1: Pre-processing - Clean up common formatting issues
  // Remove numbered lists that break sequence diagrams
  fixed = fixed.replace(/^\s*\d+\.\s+/gm, '')
  
  // Remove bullet points
  fixed = fixed.replace(/^\s*[-*•]\s+/gm, '')
  
  // Fix Windows line endings
  fixed = fixed.replace(/\r\n/g, '\n')
  
  // Remove excessive whitespace at line ends
  fixed = fixed.replace(/[ \t]+$/gm, '')
  
  // Step 2: Detect diagram type and apply specific fixes
  const diagramType = detectDiagramType(fixed)
  
  switch (diagramType) {
    case 'sequenceDiagram':
      fixed = fixSequenceDiagram(fixed)
      break
    case 'flowchart':
    case 'graph':
      fixed = fixFlowchart(fixed)
      break
    case 'classDiagram':
      fixed = fixClassDiagram(fixed)
      break
    case 'erDiagram':
      fixed = fixERDiagram(fixed)
      break
    case 'stateDiagram':
      fixed = fixStateDiagram(fixed)
      break
    default:
      // Apply generic fixes
      fixed = applyGenericFixes(fixed)
  }
  
  // Step 3: Post-processing - Final cleanup
  fixed = postProcessDiagram(fixed)
  
  return fixed
}

/**
 * Detect the type of Mermaid diagram
 */
function detectDiagramType(content: string): string {
  const firstLine = content.trim().split('\n')[0].toLowerCase()
  
  for (const type of MERMAID_DIAGRAM_TYPES) {
    if (firstLine.includes(type.toLowerCase())) {
      return type
    }
  }
  
  return 'unknown'
}

/**
 * Fix sequence diagram specific issues
 */
function fixSequenceDiagram(content: string): string {
  let fixed = content
  const lines = fixed.split('\n')
  const fixedLines: string[] = []
  let inSequenceDiagram = false
  let indentLevel = 0
  
  // Define control keywords at function scope
  const controlKeywords = ['loop', 'alt', 'opt', 'par', 'rect', 'critical', 'break']
  const endKeyword = 'end'
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()
    
    // Skip empty lines
    if (!trimmedLine) {
      fixedLines.push('')
      continue
    }
    
    // Start of sequence diagram
    if (trimmedLine.includes('sequenceDiagram')) {
      inSequenceDiagram = true
      fixedLines.push('sequenceDiagram')
      continue
    }
    
    if (!inSequenceDiagram) {
      fixedLines.push(line)
      continue
    }
    
    // Handle participant declarations
    if (trimmedLine.startsWith('participant')) {
      const participantMatch = trimmedLine.match(/participant\s+(\w+)(?:\s+as\s+(.+))?/)
      if (participantMatch) {
        const [, id, label] = participantMatch
        if (label) {
          // Ensure label is properly quoted
          const cleanLabel = label.replace(/^["']|["']$/g, '').trim()
          fixedLines.push(`    participant ${id} as "${cleanLabel}"`)
        } else {
          fixedLines.push(`    participant ${id}`)
        }
      } else {
        fixedLines.push(`    ${trimmedLine}`)
      }
      continue
    }
    
    // Handle messages (arrows)
    const arrowPatterns = [
      /^(.+?)\s*(->>?|-\)|-x|-->>?|--\)|--x)\s*(.+?)\s*:\s*(.*)$/,
      /^(.+?)\s*(->>?|-\)|-x|-->>?|--\)|--x)\s*(.+?)$/
    ]
    
    let messageHandled = false
    for (const pattern of arrowPatterns) {
      const match = trimmedLine.match(pattern)
      if (match) {
        const [, from, arrow, to, message] = match
        const fromClean = from.trim()
        const toClean = to.trim()
        
        if (message !== undefined) {
          const msgClean = message.trim()
          // Fix message quoting
          if (msgClean) {
            const needsQuotes = 
              msgClean.includes(' ') ||
              msgClean.match(/^\d/) ||
              msgClean.includes('{') || msgClean.includes('}') ||
              msgClean.includes('[') || msgClean.includes(']') ||
              msgClean.includes('(') || msgClean.includes(')') ||
              msgClean.toLowerCase().includes('error') ||
              msgClean.toLowerCase().includes('response') ||
              msgClean.toLowerCase().includes('unauthorized') ||
              msgClean.toLowerCase().includes('confirmed')
            
            if (needsQuotes && !msgClean.startsWith('"') && !msgClean.endsWith('"')) {
              fixedLines.push(`    ${fromClean} ${arrow} ${toClean}: "${msgClean.replace(/"/g, '\\"')}"`)
            } else {
              fixedLines.push(`    ${fromClean} ${arrow} ${toClean}: ${msgClean}`)
            }
          } else {
            fixedLines.push(`    ${fromClean} ${arrow} ${toClean}`)
          }
        } else {
          fixedLines.push(`    ${fromClean} ${arrow} ${toClean}`)
        }
        messageHandled = true
        break
      }
    }
    
    if (messageHandled) continue
    
    // Handle notes
    if (trimmedLine.startsWith('Note')) {
      const noteMatch = trimmedLine.match(/Note\s+(over|right of|left of)\s+(.+?)\s*:\s*(.*)/)
      if (noteMatch) {
        const [, position, participant, note] = noteMatch
        const noteClean = note.trim()
        if (noteClean && !noteClean.startsWith('"') && !noteClean.endsWith('"')) {
          fixedLines.push(`    Note ${position} ${participant}: "${noteClean}"`)
        } else {
          fixedLines.push(`    Note ${position} ${participant}: ${noteClean}`)
        }
      } else {
        fixedLines.push(`    ${trimmedLine}`)
      }
      continue
    }
    
    // Handle control flow keywords
    if (controlKeywords.some(kw => trimmedLine.startsWith(kw))) {
      indentLevel++
      fixedLines.push(`    ${trimmedLine}`)
      continue
    }
    
    if (trimmedLine === endKeyword) {
      fixedLines.push(`    ${trimmedLine}`)
      indentLevel = Math.max(0, indentLevel - 1)
      continue
    }
    
    // Handle activate/deactivate
    if (trimmedLine.startsWith('activate') || trimmedLine.startsWith('deactivate')) {
      fixedLines.push(`    ${trimmedLine}`)
      continue
    }
    
    // Handle else
    if (trimmedLine === 'else' || trimmedLine.startsWith('else ')) {
      fixedLines.push(`    ${trimmedLine}`)
      continue
    }
    
    // Default: add with proper indentation
    fixedLines.push(`    ${trimmedLine}`)
  }
  
  // Ensure proper number of end statements
  const controlCount = fixedLines.filter(l => 
    controlKeywords.some(kw => l.trim().startsWith(kw))
  ).length
  const endCount = fixedLines.filter(l => l.trim() === 'end').length
  
  if (endCount < controlCount) {
    for (let i = 0; i < controlCount - endCount; i++) {
      fixedLines.push('    end')
    }
  }
  
  return fixedLines.join('\n')
}

/**
 * Fix flowchart/graph diagram issues
 */
function fixFlowchart(content: string): string {
  let fixed = content
  
  // Fix node definitions with line breaks
  fixed = fixed.replace(/(\w+)\[([^\]]*)\n([^\]]*)\]/gm, (match, nodeId, part1, part2) => {
    const combined = part1.trim() + '<br/>' + part2.trim()
    return `${nodeId}[${combined}]`
  })
  
  // Fix subgraph syntax
  fixed = fixed.replace(/subgraph\s+(\w+)\[([^\]]+)\]\s*(\w+\[)/g, (match, id, label, nodeStart) => {
    return `subgraph ${id}["${label}"]\n    ${nodeStart}`
  })
  
  // Ensure proper spacing around arrows
  fixed = fixed.replace(/(\w+)(-->|--|->|==>|-.->|\|\|--o\{|\|\|--\|\{)(\w+)/g, '$1 $2 $3')
  
  // Fix unbalanced subgraph/end
  const subgraphCount = (fixed.match(/subgraph\s+/g) || []).length
  const endCount = (fixed.match(/^\s*end\s*$/gm) || []).length
  
  if (endCount < subgraphCount) {
    for (let i = 0; i < subgraphCount - endCount; i++) {
      fixed += '\nend'
    }
  }
  
  return fixed
}

/**
 * Fix class diagram issues
 */
function fixClassDiagram(content: string): string {
  let fixed = content
  
  // Fix class definitions
  fixed = fixed.replace(/class\s+(\w+)\s*{([^}]*)}/gm, (match, className, body) => {
    const lines = body.split('\n').map(l => l.trim()).filter(l => l)
    const fixedBody = lines.map(line => {
      // Fix method signatures
      if (line.includes('(') && line.includes(')')) {
        return line.replace(/(\+|-|#|~)?\s*(\w+)\s*\(([^)]*)\)\s*:\s*(\w+)/, '$1$2($3) : $4')
      }
      // Fix attributes
      return line.replace(/(\+|-|#|~)?\s*(\w+)\s*:\s*(\w+)/, '$1$2 : $3')
    }).join('\n        ')
    
    return `class ${className} {\n        ${fixedBody}\n    }`
  })
  
  return fixed
}

/**
 * Fix ER diagram issues
 */
function fixERDiagram(content: string): string {
  // First try the reconstructor for severely broken diagrams
  const reconstructed = fixBrokenERDiagram(content)
  if (reconstructed !== content) {
    return reconstructed
  }
  
  let fixed = content
  
  // CRITICAL FIX 1: Fix broken relationship labels that span multiple lines
  // Pattern: : "has  EVENTS ||--|| EVENT_SESSIONS : belongs  EVENTS {"
  // This happens when labels are unclosed and run into the next relationship
  fixed = fixed.replace(/:\s*"([^"]*?)\s+([A-Z_]+)\s+(\|\|--[o|]\{|\|\|--\|\|)([^"]*?)"\s*$/gm, 
    (match, label1, entity, relationship, label2) => {
      // The label was broken, fix it
      const cleanLabel = label1.trim()
      return `: "${cleanLabel}"\n    ${entity} ${relationship} ${entity.replace(/\s+{.*$/, '')} : "${label2.trim()}"`
    })
  
  // CRITICAL FIX 2: Fix malformed entity definitions with quotes in wrong places
  // Pattern: EVENTS {" with a quote and newline
  fixed = fixed.replace(/([A-Z_]+)\s*\{\s*"\s*\n\s*"/gm, '$1 {\n')
  fixed = fixed.replace(/([A-Z_]+)\s*\{\s*"/gm, '$1 {\n')
  
  // CRITICAL FIX 3: Remove stray quotes in entity definitions
  fixed = fixed.replace(/^\s*"\s*$/gm, '')
  
  // Fix double quotes in relationships (""places"" -> "places")
  fixed = fixed.replace(/""([^"]+)""/g, '"$1"')
  
  // Remove extra quotes around relationship labels
  fixed = fixed.replace(/:\s*"+"([^"]+)"+/g, ': "$1"')
  
  // Fix unclosed quotes in relationship labels
  fixed = fixed.replace(/:\s*"([^"\n]+)$/gm, ': "$1"')
  
  // First, fix the concatenated entities issue
  // Pattern: ENTITY1 { ... } ENTITY2 { ... } should have proper spacing
  fixed = fixed.replace(/}\s*([A-Z_]+)\s*{/g, '}\n\n    $1 {')
  
  // Fix relationships that are concatenated with incomplete labels
  fixed = fixed.replace(/:\s*"([^"]+?)\s+([A-Z_]+)\s*(\|\|--o\{|\|\|--\|\{|o\{--\|\||o\|--\|\||\|\|--o\s*\{)/gm, 
    (match, label, entity, relationship) => {
      const cleanLabel = label.trim()
      return `: "${cleanLabel}"\n    ${entity} ${relationship}`
    })
  
  // Fix entity definitions with proper formatting
  fixed = fixed.replace(/([A-Z_]+)\s*\{([^}]*)\}/gm, (match, entity, attributes) => {
    // Clean up the attributes - split by newlines or multiple spaces
    const lines = attributes.split('\n')
    const attrs: string[] = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      
      // Skip lines that are just quoted strings (relationship labels)
      if (trimmed.match(/^["'].*["']$/)) continue
      
      // Process attribute lines
      if (trimmed.includes(' ')) {
        attrs.push(`        ${trimmed}`)
      } else if (trimmed.length > 0) {
        attrs.push(`        ${trimmed}`)
      }
    }
    
    if (attrs.length === 0) {
      // Entity with no attributes
      return `    ${entity} {\n    }`
    }
    
    return `    ${entity} {\n${attrs.join('\n')}\n    }`
  })
  
  // Fix relationships with proper spacing and format
  const relationshipPatterns = [
    '||--o{', '||--|{', 'o{--||', 'o|--||', '}o--||', '}|--||',
    '||--o ', '||--| ', ' o--||', ' |--||'
  ]
  
  // Fix each relationship pattern
  relationshipPatterns.forEach(pattern => {
    const escapedPattern = pattern.replace(/[|{}]/g, '\\$&').replace(/\s/g, '\\s*')
    const regex = new RegExp(`([A-Z_]+)\\s*(${escapedPattern})\\s*([A-Z_]+)`, 'g')
    fixed = fixed.replace(regex, (match, entity1, rel, entity2) => {
      // Clean up the relationship operator
      const cleanRel = pattern.trim()
      return `    ${entity1} ${cleanRel} ${entity2}`
    })
  })
  
  // Fix relationship labels - ensure they're properly quoted
  fixed = fixed.replace(/([A-Z_]+\s*(?:\|\|--o\{|\|\|--\|\{|o\{--\|\||o\|--\|\||\}o--\|\||\}\|--\|\||\|\|--o\s|\|\|--\|\s)\s*[A-Z_]+)\s*:\s*([^\n]+)/gm,
    (match, relationship, label) => {
      // Clean up the label
      let cleanLabel = label.trim()
      
      // Remove existing quotes
      cleanLabel = cleanLabel.replace(/^["']|["']$/g, '')
      
      // Remove double quotes
      cleanLabel = cleanLabel.replace(/^"+|"+$/g, '')
      
      // If empty or just whitespace, don't add a label
      if (!cleanLabel || cleanLabel === '""') {
        return relationship
      }
      
      return `${relationship} : "${cleanLabel}"`
    })
  
  // Clean up any remaining issues
  const lines = fixed.split('\n')
  const cleanedLines: string[] = []
  let inEntity = false
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (!trimmed) {
      cleanedLines.push('')
      continue
    }
    
    if (trimmed === 'erDiagram') {
      cleanedLines.push(trimmed)
      continue
    }
    
    // Check if we're entering an entity definition
    if (trimmed.match(/^[A-Z_]+\s*\{/)) {
      inEntity = true
    }
    
    // Check if we're exiting an entity definition
    if (trimmed === '}') {
      inEntity = false
      cleanedLines.push('    }')
      continue
    }
    
    // Add proper indentation
    if (inEntity && !trimmed.startsWith('}')) {
      // Inside entity, double indent for attributes
      cleanedLines.push('        ' + trimmed)
    } else {
      // Outside entity or relationship, single indent
      cleanedLines.push('    ' + trimmed)
    }
  }
  
  return cleanedLines.join('\n')
}

/**
 * Fix state diagram issues
 */
function fixStateDiagram(content: string): string {
  let fixed = content
  
  // Fix state transitions
  fixed = fixed.replace(/(\w+)\s*-->\s*(\w+)\s*:\s*([^\n]+)/gm, (match, from, to, label) => {
    const labelClean = label.trim()
    if (labelClean.includes(' ') && !labelClean.startsWith('"')) {
      return `${from} --> ${to} : "${labelClean}"`
    }
    return `${from} --> ${to} : ${labelClean}`
  })
  
  // Fix state definitions
  fixed = fixed.replace(/state\s+"([^"]+)"\s+as\s+(\w+)/gm, 'state "$1" as $2')
  fixed = fixed.replace(/state\s+(\w+)\s+as\s+"([^"]+)"/gm, 'state $1 as "$2"')
  
  return fixed
}

/**
 * Apply generic fixes for unknown diagram types
 */
function applyGenericFixes(content: string): string {
  let fixed = content
  
  // Fix quotes
  fixed = fixed.replace(/["']/g, '"')
  
  // Fix brackets
  const openBrackets = (fixed.match(/\[/g) || []).length
  const closeBrackets = (fixed.match(/\]/g) || []).length
  
  if (openBrackets > closeBrackets) {
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      fixed += ']'
    }
  }
  
  return fixed
}

/**
 * Post-process the diagram for final cleanup
 */
function postProcessDiagram(content: string): string {
  let fixed = content
  
  // Remove duplicate empty lines
  fixed = fixed.replace(/\n{3,}/g, '\n\n')
  
  // Ensure diagram ends with newline
  if (!fixed.endsWith('\n')) {
    fixed += '\n'
  }
  
  // Remove trailing whitespace
  fixed = fixed.split('\n').map(line => line.trimRight()).join('\n')
  
  return fixed
}

/**
 * Validate a Mermaid diagram
 */
export function validateMermaidDiagramEnhanced(diagram: string): { 
  isValid: boolean
  error?: string
  suggestions?: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  
  // Check for diagram type
  const diagramType = detectDiagramType(diagram)
  if (diagramType === 'unknown') {
    issues.push('No valid diagram type detected')
    suggestions.push('Start with a valid diagram type like: sequenceDiagram, graph, flowchart, etc.')
  }
  
  // Check for balanced brackets
  const openBrackets = (diagram.match(/\[/g) || []).length
  const closeBrackets = (diagram.match(/\]/g) || []).length
  if (openBrackets !== closeBrackets) {
    issues.push(`Unbalanced brackets: ${openBrackets} open, ${closeBrackets} close`)
    suggestions.push('Check all node definitions have matching brackets')
  }
  
  // Check for balanced quotes
  const quotes = (diagram.match(/"/g) || []).length
  if (quotes % 2 !== 0) {
    issues.push('Unbalanced quotes')
    suggestions.push('Ensure all strings are properly quoted')
  }
  
  // Check subgraph/end balance
  if (diagram.includes('subgraph')) {
    const subgraphCount = (diagram.match(/subgraph\s+/g) || []).length
    const endCount = (diagram.match(/^\s*end\s*$/gm) || []).length
    if (subgraphCount !== endCount) {
      issues.push(`Mismatched subgraphs (${subgraphCount}) and ends (${endCount})`)
      suggestions.push('Each subgraph needs a corresponding end statement')
    }
  }
  
  // Check for numbered lists (common error source)
  if (/^\s*\d+\.\s+/m.test(diagram)) {
    issues.push('Numbered lists detected in diagram')
    suggestions.push('Remove numbered list prefixes (1., 2., etc.) from diagram content')
  }
  
  return {
    isValid: issues.length === 0,
    error: issues.join('; '),
    suggestions: suggestions.length > 0 ? suggestions : undefined
  }
}

/**
 * Parse and fix all diagrams in content
 */
export function parseAndFixDiagrams(content: string): ParsedDiagrams {
  if (!content || content.trim() === '') {
    return {}
  }
  
  const diagrams: ParsedDiagrams = {}
  
  // First, check for markdown code blocks
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
        diagramContent = fixMermaidSyntaxEnhanced(diagramContent)
        diagrams[`diagram${index}`] = diagramContent
        index++
      }
    }
  } else {
    // Parse raw content by looking for diagram type declarations
    // Split concatenated diagrams first
    const splitDiagrams = splitConcatenatedDiagrams(content)
    
    if (splitDiagrams.length > 1) {
      // Multiple diagrams found
      splitDiagrams.forEach((diagram, index) => {
        const fixed = fixMermaidSyntaxEnhanced(diagram)
        if (fixed.length > 10) {
          // Try to identify the diagram type for better naming
          const diagramType = detectDiagramType(fixed)
          const name = diagramType !== 'unknown' ? `${diagramType}${index + 1}` : `diagram${index + 1}`
          diagrams[name] = fixed
        }
      })
    } else {
      // Single diagram or need more complex parsing
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
      
      if (diagramStarts.length > 0) {
        // Extract each diagram
        diagramStarts.forEach((start, i) => {
          const nextStart = diagramStarts[i + 1]
          const endIndex = nextStart ? nextStart.index : content.length
          let diagramContent = content.substring(start.index, endIndex).trim()
          
          // Apply fixes
          diagramContent = fixMermaidSyntaxEnhanced(diagramContent)
          
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
      } else if (content.trim().length > 10) {
        // No specific diagram start found, but has content - try to fix it anyway
        const fixed = fixMermaidSyntaxEnhanced(content)
        if (fixed.length > 10) {
          diagrams.diagram1 = fixed
        }
      }
    }
  }
  
  return diagrams
}

/**
 * Split concatenated diagrams (e.g., multiple erDiagrams without separation)
 */
function splitConcatenatedDiagrams(content: string): string[] {
  const allDiagrams: string[] = []
  
  // Check for each diagram type separately and collect all
  
  // Pattern 1: Multiple erDiagram declarations
  if (content.includes('erDiagram')) {
    const parts = content.split(/(?=erDiagram)/g)
    parts.forEach(part => {
      if (part.trim().startsWith('erDiagram')) {
        allDiagrams.push(part.trim())
      }
    })
    // If we found ER diagrams, return them
    if (allDiagrams.length > 0) {
      return allDiagrams
    }
  }
  
  // Pattern 2: Multiple sequenceDiagram declarations
  if (content.includes('sequenceDiagram')) {
    const parts = content.split(/(?=sequenceDiagram)/g)
    parts.forEach(part => {
      if (part.trim().startsWith('sequenceDiagram')) {
        allDiagrams.push(part.trim())
      }
    })
    // If we found sequence diagrams, return them
    if (allDiagrams.length > 0) {
      return allDiagrams
    }
  }
  
  // Pattern 3: Multiple graph/flowchart declarations
  if (content.match(/(?:graph|flowchart)\s+(?:TB|TD|LR|RL|BT)/)) {
    const parts = content.split(/(?=(?:graph|flowchart)\s+(?:TB|TD|LR|RL|BT))/g)
    parts.forEach(part => {
      if (part.trim().match(/^(?:graph|flowchart)\s+(?:TB|TD|LR|RL|BT)/)) {
        allDiagrams.push(part.trim())
      }
    })
    // If we found graph/flowchart diagrams, return them
    if (allDiagrams.length > 0) {
      return allDiagrams
    }
  }
  
  // Pattern 4: Multiple classDiagram declarations
  if (content.includes('classDiagram')) {
    const parts = content.split(/(?=classDiagram)/g)
    parts.forEach(part => {
      if (part.trim().startsWith('classDiagram')) {
        allDiagrams.push(part.trim())
      }
    })
    // If we found class diagrams, return them
    if (allDiagrams.length > 0) {
      return allDiagrams
    }
  }
  
  // Pattern 5: Multiple stateDiagram declarations
  if (content.includes('stateDiagram')) {
    const parts = content.split(/(?=stateDiagram)/g)
    parts.forEach(part => {
      if (part.trim().startsWith('stateDiagram')) {
        allDiagrams.push(part.trim())
      }
    })
    // If we found state diagrams, return them
    if (allDiagrams.length > 0) {
      return allDiagrams
    }
  }
  
  // If no specific patterns found, return original content
  return [content]
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

// Re-export the enhanced function as the main one
export const fixMermaidSyntax = fixMermaidSyntaxEnhanced
export const validateMermaidDiagram = validateMermaidDiagramEnhanced
export const parseMermaidDiagrams = parseAndFixDiagrams