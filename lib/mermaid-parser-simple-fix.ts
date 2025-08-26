/**
 * Simple, targeted fixes for Mermaid diagrams without aggressive splitting
 * This preserves the original structure while fixing common syntax errors
 */

export interface ParsedDiagrams {
  [key: string]: string
}

/**
 * Apply minimal fixes to Mermaid syntax without breaking structure
 */
export function fixMermaidSyntaxSimple(diagramContent: string): string {
  let fixed = diagramContent
  
  // Pre-fix: Handle single-line sequence diagrams (common when pasted from localStorage)
  // Keep the original simple approach - don't break what's working
  if (fixed.includes('sequenceDiagram') && fixed.split('\n').length <= 2) {
    // Just add basic line breaks
    fixed = fixed.replace(/sequenceDiagram\s*/, 'sequenceDiagram\n')
    fixed = fixed.replace(/\s+(participant\s+)/g, '\n$1')
    fixed = fixed.replace(/\s+([A-Z][A-Z0-9_]*->>)/g, '\n$1')
    fixed = fixed.replace(/\s+([A-Z][A-Z0-9_]*-->>)/g, '\n$1')
    fixed = fixed.replace(/\s+(Note\s+)/g, '\n$1')
    fixed = fixed.replace(/\s+(loop\s+)/g, '\n$1')
    fixed = fixed.replace(/\s+(alt\s+)/g, '\n$1')
    fixed = fixed.replace(/\s+(else\s+)/g, '\n$1')
    fixed = fixed.replace(/\s+(end)(\s|$)/g, '\n$1$2')
  }
  
  // Fix 1: Remove numbered lists that break sequence diagrams
  fixed = fixed.replace(/^\s*\d+\.\s+/gm, '    ')
  
  // Fix 2: Remove bullet points
  fixed = fixed.replace(/^\s*[-*•]\s+/gm, '    ')
  
  // Fix 3: Fix double quotes in ER diagrams
  fixed = fixed.replace(/""([^"]+)""/g, '"$1"')
  
  // Fix 4: Fix broken ER diagram relationship labels
  // Pattern: : "has  ENTITY should be : "has"\n    ENTITY
  fixed = fixed.replace(/:\s*"([^"]*?)\s+([A-Z_]+\s+\|\|)/gm, ': "$1"\n    $2')
  
  // Fix 5: Remove stray quotes in entity definitions
  fixed = fixed.replace(/([A-Z_]+)\s*\{\s*"\s*\n\s*"/gm, '$1 {\n')
  fixed = fixed.replace(/^\s*"\s*$/gm, '')
  
  // Fix 6: Fix sequence diagram issues comprehensively
  if (fixed.includes('sequenceDiagram')) {
    const lines = fixed.split('\n')
    const fixedSeqLines: string[] = []
    let inSequence = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      
      // Start of sequence diagram
      if (trimmed === 'sequenceDiagram' || trimmed.startsWith('sequenceDiagram')) {
        inSequence = true
        fixedSeqLines.push('sequenceDiagram')
        continue
      }
      
      // End of this diagram (start of another)
      if (inSequence && trimmed.match(/^(erDiagram|classDiagram|stateDiagram|graph\s|flowchart\s)/)) {
        inSequence = false
        fixedSeqLines.push(line)
        continue
      }
      
      if (!inSequence) {
        fixedSeqLines.push(line)
        continue
      }
      
      // Inside sequence diagram - fix common issues
      
      // Skip empty lines
      if (!trimmed) {
        fixedSeqLines.push('')
        continue
      }
      
      // Fix participant declarations
      if (trimmed.startsWith('participant')) {
        // Handle both formats:
        // participant ID
        // participant ID as Label
        const match = trimmed.match(/participant\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+as\s+(.+))?/)
        if (match) {
          const [, id, label] = match
          if (label) {
            // Clean up the label - remove quotes if present
            let cleanLabel = label.trim()
            // Remove existing quotes
            cleanLabel = cleanLabel.replace(/^["']|["']$/g, '')
            // Always quote labels that have spaces or special characters
            if (cleanLabel.includes(' ') || 
                cleanLabel.includes(':') || 
                cleanLabel.includes(',') || 
                cleanLabel.includes('(') || 
                cleanLabel.includes(')') ||
                cleanLabel.includes('/') ||
                cleanLabel.includes('\\') ||
                cleanLabel.includes('{') ||
                cleanLabel.includes('}') ||
                cleanLabel.includes('[') ||
                cleanLabel.includes(']') ||
                cleanLabel.match(/^\d/)) {
              fixedSeqLines.push(`    participant ${id} as "${cleanLabel}"`)
            } else {
              fixedSeqLines.push(`    participant ${id} as ${cleanLabel}`)
            }
          } else {
            fixedSeqLines.push(`    participant ${id}`)
          }
        } else {
          fixedSeqLines.push(`    ${trimmed}`)
        }
        continue
      }
      
      // Fix messages (arrows)
      // More flexible pattern to handle various arrow formats
      const arrowMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(->>?|-x|-->>?|-\)|--\)|->|-->)\s*([A-Za-z_][A-Za-z0-9_]*)(?:\s*:\s*(.*))?$/)
      if (arrowMatch) {
        const [, from, arrow, to, message] = arrowMatch
        const cleanFrom = from.trim()
        const cleanTo = to.trim()
        
        if (message) {
          let cleanMsg = message.trim()
          // Remove existing quotes if present
          cleanMsg = cleanMsg.replace(/^["']|["']$/g, '')
          
          // Quote the message if it contains special characters or spaces
          // But don't quote if it's already properly formatted
          if (cleanMsg && !cleanMsg.match(/^".*"$/)) {
            // Check if message needs quoting
            if (cleanMsg.includes(' ') || 
                cleanMsg.includes(':') || 
                cleanMsg.includes(',') || 
                cleanMsg.includes('(') || 
                cleanMsg.includes(')') ||
                cleanMsg.includes('{') ||
                cleanMsg.includes('}') ||
                cleanMsg.includes('[') ||
                cleanMsg.includes(']') ||
                cleanMsg.includes('/') ||
                cleanMsg.match(/^\d/)) {
              cleanMsg = `"${cleanMsg}"`
            }
          }
          
          fixedSeqLines.push(`    ${cleanFrom}${arrow}${cleanTo}: ${cleanMsg}`)
        } else {
          fixedSeqLines.push(`    ${cleanFrom}${arrow}${cleanTo}`)
        }
        continue
      }
      
      // Fix Note declarations
      if (trimmed.startsWith('Note')) {
        // Handle both single participant and range (participant1,participant2)
        const noteMatch = trimmed.match(/Note\s+(over|right of|left of)\s+([^:]+):\s*(.*)/)
        if (noteMatch) {
          const [, position, participants, note] = noteMatch
          let cleanNote = note.trim()
          
          // Remove existing quotes if present
          cleanNote = cleanNote.replace(/^["']|["']$/g, '')
          
          // Quote the note text if it's not empty and not already quoted
          if (cleanNote && !cleanNote.match(/^".*"$/)) {
            cleanNote = `"${cleanNote}"`
          }
          
          fixedSeqLines.push(`    Note ${position} ${participants.trim()}: ${cleanNote}`)
        } else {
          // Handle Note without colon
          const simpleNoteMatch = trimmed.match(/Note\s+(over|right of|left of)\s+(.+)/)
          if (simpleNoteMatch) {
            const [, position, rest] = simpleNoteMatch
            fixedSeqLines.push(`    Note ${position} ${rest}`)
          } else {
            fixedSeqLines.push(`    ${trimmed}`)
          }
        }
        continue
      }
      
      // Control flow keywords (loop, alt, opt, etc.)
      if (trimmed.match(/^(loop|alt|opt|par|rect|critical|break|else|end)/)) {
        fixedSeqLines.push(`    ${trimmed}`)
        continue
      }
      
      // Activation/deactivation
      if (trimmed.match(/^(activate|deactivate)/)) {
        fixedSeqLines.push(`    ${trimmed}`)
        continue
      }
      
      // Default: add with indentation
      fixedSeqLines.push(`    ${trimmed}`)
    }
    
    fixed = fixedSeqLines.join('\n')
  }
  
  // Fix 7: Ensure proper indentation for non-sequence diagrams
  // Skip this for sequence diagrams as they're already handled above
  if (!fixed.includes('sequenceDiagram')) {
    const lines = fixed.split('\n')
    const fixedLines: string[] = []
    let inDiagram = false
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Detect diagram start
      if (trimmed.match(/^(erDiagram|classDiagram|stateDiagram|graph\s|flowchart\s)/)) {
        inDiagram = true
        fixedLines.push(trimmed)
        continue
      }
      
      // Keep empty lines
      if (!trimmed) {
        fixedLines.push('')
        continue
      }
      
      // Add proper indentation for diagram content
      if (inDiagram) {
        // Don't indent the diagram type declaration
        if (!trimmed.match(/^(erDiagram|classDiagram|stateDiagram|graph|flowchart)/)) {
          fixedLines.push('    ' + trimmed)
        } else {
          fixedLines.push(trimmed)
        }
      } else {
        fixedLines.push(line)
      }
    }
    
    return fixedLines.join('\n')
  }
  
  return fixed
}

/**
 * Parse diagrams from content without aggressive splitting
 */
export function parseMermaidDiagramsSimple(content: string): ParsedDiagrams {
  if (!content || content.trim() === '') {
    return {}
  }
  
  const diagrams: ParsedDiagrams = {}
  
  // Check for markdown code blocks first
  if (content.includes('```mermaid')) {
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
    let match
    let index = 1
    
    while ((match = mermaidRegex.exec(content)) !== null) {
      const diagramContent = match[1].trim()
      if (diagramContent && diagramContent.length > 10) {
        // Apply minimal fixes
        const fixed = fixMermaidSyntaxSimple(diagramContent)
        
        // Try to identify the type for better naming
        let name = `diagram${index}`
        if (fixed.includes('erDiagram')) name = `database${index}`
        else if (fixed.includes('sequenceDiagram')) name = `sequence${index}`
        else if (fixed.includes('classDiagram')) name = `class${index}`
        else if (fixed.includes('stateDiagram')) name = `state${index}`
        else if (fixed.match(/^(graph|flowchart)/)) name = `flow${index}`
        
        diagrams[name] = fixed
        index++
      }
    }
  } else {
    // For raw content, be very careful about splitting
    // Only split if we have CLEAR diagram boundaries
    
    // Count different diagram types
    const erCount = (content.match(/^erDiagram/gm) || []).length
    const seqCount = (content.match(/^sequenceDiagram/gm) || []).length
    const classCount = (content.match(/^classDiagram/gm) || []).length
    const stateCount = (content.match(/^stateDiagram/gm) || []).length
    const graphCount = (content.match(/^(graph|flowchart)\s+(TB|TD|LR|RL|BT)/gm) || []).length
    
    const totalDiagrams = erCount + seqCount + classCount + stateCount + graphCount
    
    if (totalDiagrams === 1) {
      // Single diagram - don't split, just fix
      const fixed = fixMermaidSyntaxSimple(content)
      
      // Name based on type - but ONLY if it's actually a diagram
      if (fixed.includes('erDiagram')) diagrams.database = fixed
      else if (fixed.includes('sequenceDiagram')) diagrams.sequence = fixed
      else if (fixed.includes('classDiagram')) diagrams.class = fixed
      else if (fixed.includes('stateDiagram')) diagrams.state = fixed
      else if (fixed.match(/^(graph|flowchart)/m)) diagrams.flow = fixed
      // Don't add as diagram1 if it's not actually a diagram
    } else if (totalDiagrams > 1) {
      // Multiple diagrams - need to be careful
      // Split ONLY at clear diagram type declarations at the start of lines
      const diagramStarts: {type: string, match: string, index: number}[] = []
      
      // Find all diagram starts with their exact positions
      const diagramPatterns = [
        { regex: /^erDiagram/gm, type: 'database' },
        { regex: /^sequenceDiagram/gm, type: 'sequence' },
        { regex: /^classDiagram/gm, type: 'class' },
        { regex: /^stateDiagram/gm, type: 'state' },
        { regex: /^(graph|flowchart)\s+(TB|TD|LR|RL|BT)/gm, type: 'flow' }
      ]
      
      for (const pattern of diagramPatterns) {
        let match
        while ((match = pattern.regex.exec(content)) !== null) {
          diagramStarts.push({
            type: pattern.type,
            match: match[0],
            index: match.index
          })
        }
      }
      
      // Sort by position
      diagramStarts.sort((a, b) => a.index - b.index)
      
      // Extract each diagram carefully
      diagramStarts.forEach((start, i) => {
        const nextStart = diagramStarts[i + 1]
        const endIndex = nextStart ? nextStart.index : content.length
        
        // Extract this diagram's content
        const diagramContent = content.substring(start.index, endIndex).trim()
        
        // Apply minimal fixes
        const fixed = fixMermaidSyntaxSimple(diagramContent)
        
        // Name with type and index
        const typeCount = diagramStarts.filter((d, j) => j <= i && d.type === start.type).length
        const name = `${start.type}${typeCount > 1 ? typeCount : ''}`
        
        diagrams[name] = fixed
      })
    } else {
      // No clear diagram declarations - DON'T treat as diagram
      // Return empty - this is not a diagram
    }
  }
  
  return diagrams
}

/**
 * Check if content has Mermaid diagrams
 */
export function hasDiagramContent(content: string): boolean {
  if (!content || content.trim() === '') return false
  
  // Check for mermaid code blocks
  if (content.includes('```mermaid')) return true
  
  // Check for diagram keywords at the START of lines (more accurate)
  const diagramPatterns = [
    /^erDiagram/m,
    /^sequenceDiagram/m,
    /^classDiagram/m,
    /^stateDiagram/m,
    /^(graph|flowchart)\s+(TB|TD|LR|RL|BT)/m,
    /^gantt/m,
    /^pie\s+/m,
    /^journey/m,
    /^gitGraph/m
  ]
  
  return diagramPatterns.some(pattern => pattern.test(content))
}

// Export main functions
export const fixMermaidSyntax = fixMermaidSyntaxSimple
export const parseMermaidDiagrams = parseMermaidDiagramsSimple