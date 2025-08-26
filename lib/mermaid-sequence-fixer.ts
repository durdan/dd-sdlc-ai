/**
 * Specialized fixer for sequence diagrams that may have lost line breaks
 */

export function fixSequenceDiagramLineBreaks(content: string): string {
  // If content already has proper line breaks, return as is
  if (content.includes('\n') && content.split('\n').length > 5) {
    return content
  }
  
  let fixed = content
  
  // First pass: Fix obvious concatenated messages within quotes
  // Pattern like: "Submit request APP->>API: API call" should be split
  fixed = fixed.replace(/"([^"]*?)\s+([A-Z][A-Z0-9_]*)\s*(->>?|-->>?|-x|--x)\s*([A-Z][A-Z0-9_]*)\s*:\s*([^"]*?)"/g, 
    (match, msg1, from, arrow, to, msg2) => {
      return `"${msg1}"\n${from}${arrow}${to}: "${msg2}"`
    })
  
  // Pattern 1: Fix sequenceDiagram declaration
  fixed = fixed.replace(/sequenceDiagram\s*/g, 'sequenceDiagram\n')
  
  // Pattern 2: Fix participant declarations
  // More careful matching to avoid breaking within quotes
  fixed = fixed.replace(/(["\s]|^)(participant\s+[A-Z][A-Z0-9_]*(?:\s+as\s+(?:"[^"]*"|[^\s]+))?)/g, '$1\n$2')
  
  // Pattern 3: Fix arrows/messages
  // Be more careful about not splitting within quoted strings
  const arrowPattern = /(["\s]|^)([A-Z][A-Z0-9_]*)\s*(->>?|-->>?|-x|--x|-\)|--\)|->|-->)\s*([A-Z][A-Z0-9_]*)(?:\s*:\s*(.*))?/g
  fixed = fixed.replace(arrowPattern, (match, prefix, from, arrow, to, msg) => {
    // Check if this is within quotes (part of a message)
    if (prefix === '"') {
      return match // Don't modify if within quotes
    }
    return `\n${from}${arrow}${to}${msg ? ': ' + msg : ''}`
  })
  
  // Pattern 4: Fix Note declarations
  fixed = fixed.replace(/(["\s]|^)(Note\s+(?:over|right of|left of)\s+[A-Z][A-Z0-9_,\s]*(?:\s*:\s*.*)?)/g, '$1\n$2')
  
  // Pattern 5: Fix control flow keywords - be more careful with 'end'
  // 'end' should always be on its own line
  fixed = fixed.replace(/\s+(end)(?=\s|$)/gi, '\n$1')
  // Other control flow keywords
  fixed = fixed.replace(/(["\s]|^)(loop|alt|opt|par|rect|critical|break|else)(\s+[^"\n]*)?/g, '$1\n$2$3')
  
  // Pattern 6: Fix activate/deactivate
  fixed = fixed.replace(/(["\s]|^)(activate|deactivate)\s+([A-Z][A-Z0-9_]*)/g, '$1\n$2 $3')
  
  // Clean up extra spaces and empty lines
  fixed = fixed.replace(/  +/g, ' ')
  fixed = fixed.replace(/\n\s*\n/g, '\n')
  
  // Ensure proper line structure
  const lines = fixed.split('\n')
  const cleanLines: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed) {
      cleanLines.push(trimmed)
    }
  }
  
  return cleanLines.join('\n')
}

/**
 * Parse and fix a sequence diagram from localStorage or pasted content
 */
export function parseAndFixSequenceDiagram(rawContent: string): string {
  // First, try to extract just the sequence diagram if it's embedded in other content
  let diagramContent = rawContent
  
  // If it contains sequenceDiagram, try to extract it
  if (rawContent.includes('sequenceDiagram')) {
    // Find start of sequence diagram
    const startIdx = rawContent.indexOf('sequenceDiagram')
    
    // Find potential end (another diagram type or end of string)
    const endPatterns = ['erDiagram', 'classDiagram', 'stateDiagram', 'graph ', 'flowchart ', 'gantt', 'pie ']
    let endIdx = rawContent.length
    
    for (const pattern of endPatterns) {
      const idx = rawContent.indexOf(pattern, startIdx + 1)
      if (idx > -1 && idx < endIdx) {
        endIdx = idx
      }
    }
    
    diagramContent = rawContent.substring(startIdx, endIdx).trim()
  }
  
  // Apply line break fixes
  const withLineBreaks = fixSequenceDiagramLineBreaks(diagramContent)
  
  // Now apply the standard sequence diagram fixes
  const lines = withLineBreaks.split('\n')
  const fixedLines: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (!line) continue
    
    // sequenceDiagram should be at the start
    if (line === 'sequenceDiagram' || line.startsWith('sequenceDiagram')) {
      fixedLines.push('sequenceDiagram')
      continue
    }
    
    // Handle participant declarations
    if (line.startsWith('participant')) {
      const match = line.match(/participant\s+([A-Z][A-Z0-9_]*)(?:\s+as\s+(.+))?/)
      if (match) {
        const [, id, label] = match
        if (label) {
          let cleanLabel = label.trim()
          // Remove existing quotes
          cleanLabel = cleanLabel.replace(/^["']|["']$/g, '')
          // Add quotes if label contains spaces or special chars
          if (cleanLabel.includes(' ') || cleanLabel.includes('/') || cleanLabel.includes('.')) {
            fixedLines.push(`    participant ${id} as "${cleanLabel}"`)
          } else {
            fixedLines.push(`    participant ${id} as ${cleanLabel}`)
          }
        } else {
          fixedLines.push(`    participant ${id}`)
        }
      } else {
        fixedLines.push(`    ${line}`)
      }
      continue
    }
    
    // Handle arrows/messages
    const arrowMatch = line.match(/^([A-Z][A-Z0-9_]*)\s*(->>?|-->>?|-x|--x|-\)|--\)|->|-->)\s*([A-Z][A-Z0-9_]*)(?:\s*:\s*(.*))?$/)
    if (arrowMatch) {
      const [, from, arrow, to, message] = arrowMatch
      if (message) {
        let cleanMsg = message.trim()
        
        // Check if message is already properly quoted
        if (cleanMsg.match(/^".*"$/)) {
          // Already quoted, just ensure no extra quotes
          cleanMsg = cleanMsg.replace(/^"+|"+$/g, '"')
          fixedLines.push(`    ${from}${arrow}${to}: ${cleanMsg}`)
        } else {
          // Remove any stray quotes
          cleanMsg = cleanMsg.replace(/^["']|["']$/g, '')
          
          // Always quote messages for safety in sequence diagrams
          fixedLines.push(`    ${from}${arrow}${to}: "${cleanMsg}"`)
        }
      } else {
        fixedLines.push(`    ${from}${arrow}${to}`)
      }
      continue
    }
    
    // Handle Note declarations
    if (line.startsWith('Note')) {
      const noteMatch = line.match(/Note\s+(over|right of|left of)\s+([^:]+)(?:\s*:\s*(.*))?/)
      if (noteMatch) {
        const [, position, participants, note] = noteMatch
        if (note) {
          let cleanNote = note.trim()
          cleanNote = cleanNote.replace(/^["']|["']$/g, '')
          fixedLines.push(`    Note ${position} ${participants.trim()}: "${cleanNote}"`)
        } else {
          fixedLines.push(`    Note ${position} ${participants.trim()}`)
        }
      } else {
        fixedLines.push(`    ${line}`)
      }
      continue
    }
    
    // Handle control flow keywords
    if (line.match(/^(loop|alt|opt|par|rect|critical|break|else|end)/)) {
      fixedLines.push(`    ${line}`)
      continue
    }
    
    // Handle activate/deactivate
    if (line.match(/^(activate|deactivate)/)) {
      fixedLines.push(`    ${line}`)
      continue
    }
    
    // Default: add with indentation
    fixedLines.push(`    ${line}`)
  }
  
  return fixedLines.join('\n')
}