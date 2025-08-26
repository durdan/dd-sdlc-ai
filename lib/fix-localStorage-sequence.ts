/**
 * Minimal fix specifically for localStorage sequence diagrams
 * This ONLY fixes the concatenated message issue without breaking other diagrams
 */

export function fixLocalStorageSequenceDiagram(content: string): string {
  // Only apply fix if it looks like a localStorage issue (single line or very few lines)
  if (!content.includes('sequenceDiagram') || content.split('\n').length > 10) {
    return content // Return as-is if it's already properly formatted
  }
  
  let fixed = content
  
  // Fix 1: The main issue - messages concatenated within quotes
  // Pattern: "Message1 ACTOR->>ACTOR: Message2" should become two lines
  // This is VERY specific to avoid breaking other patterns
  fixed = fixed.replace(/"([^"]+?)\s+([A-Z][A-Z0-9_]*)\s*(->>?|-->>?|-x|--x)\s*([A-Z][A-Z0-9_]*)\s*:\s*([^"]+)"/g, 
    (match, msg1, from, arrow, to, msg2) => {
      // Only split if msg1 doesn't look like it should contain the arrow
      if (msg1.includes('>>') || msg1.includes('--')) {
        return match // Don't change if msg1 already contains arrows
      }
      return `"${msg1}"\n${from}${arrow}${to}: "${msg2}"`
    })
  
  // Fix 1b: Fix malformed par blocks
  // Pattern: "Message par Something" or "Message and" should be split
  fixed = fixed.replace(/"([^"]+?)\s+(par|and|end)\s+([^"]*?)"/g, 
    (match, msg1, keyword, msg2) => {
      // Check if this is actually a malformed block
      if (keyword === 'par' && msg2) {
        return `"${msg1}"\n${keyword} ${msg2}`
      } else if (keyword === 'and' || keyword === 'end') {
        return `"${msg1}"\n${keyword}${msg2 ? '\n' + msg2 : ''}`
      }
      return match
    })
  
  // Fix 1c: Fix specific pattern where par is attached to a message
  // Pattern: "Publish: OrderCreated  par Event Processing"
  fixed = fixed.replace(/:\s*"([^"]+?)\s\s+(par|loop|alt|opt)\s+([^"]+)"/g, ': "$1"\n$2 $3')
  
  // Fix 1d: Fix "and" keywords that should be "end"
  // Common OCR/paste error where "end" becomes "and" in certain contexts
  fixed = fixed.replace(/"\s+(and)\s*$/gm, '"\nend')
  fixed = fixed.replace(/"\s+(and)\s+([A-Z])/g, '"\nend\n$2')
  
  // Fix 2: More aggressive fix for 'end' keywords - they MUST be on their own line
  // This needs to happen before other line break fixes
  fixed = fixed.replace(/"\s+end\s+/g, '"\nend\n')  // "message" end something
  fixed = fixed.replace(/"\s+end$/gm, '"\nend')     // "message" end (at end of line)
  fixed = fixed.replace(/([^d])\send\s+([A-Z])/g, '$1\nend\n$2')  // something end ACTOR
  
  // Fix 3: Add line breaks if everything is on one line
  if (!fixed.includes('\n') || fixed.split('\n').length <= 2) {
    // Add line breaks before key patterns
    fixed = fixed
      // sequenceDiagram should be on its own line
      .replace(/sequenceDiagram\s+/, 'sequenceDiagram\n')
      // participant declarations
      .replace(/\s+(participant\s+[A-Z][A-Z0-9_]*(?:\s+as\s+(?:"[^"]+"|[^\s]+))?)/g, '\n$1')
      // Messages (arrows) - but NOT if they're inside quotes
      .replace(/([^"])\s+([A-Z][A-Z0-9_]*)\s*(->>?|-->>?|-x|--x)\s*([A-Z][A-Z0-9_]*)/g, '$1\n$2$3$4')
      // Note declarations
      .replace(/\s+(Note\s+(?:over|right of|left of)\s+[^:]+)/g, '\n$1')
      // Control flow keywords
      .replace(/\s+(loop|alt|opt|par|rect|critical|break|else)\s+/g, '\n$1 ')
  }
  
  // Fix 3.5: Final aggressive end keyword fix - scan the entire string
  // Any occurrence of "end" that follows a quote should be on a new line
  fixed = fixed.replace(/"(\s*)end/g, '"\nend')
  // Any "end" followed by an actor should have a line break after
  fixed = fixed.replace(/end(\s*)([A-Z][A-Z0-9_]*)/g, 'end\n$2')
  
  // Fix 4: Clean up the result and handle nested structures
  const lines = fixed.split('\n')
  const cleanedLines: string[] = []
  let indentLevel = 0
  let inParBlock = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (!line) continue
    
    // Track indent level for nested structures
    if (line.match(/^(loop|alt|opt|par|rect|critical|break)/)) {
      const indent = '    '.repeat(Math.max(1, indentLevel))
      cleanedLines.push(indent + line)
      indentLevel++
      if (line.startsWith('par')) {
        inParBlock = true
      }
      continue
    }
    
    if (line === 'end') {
      indentLevel = Math.max(0, indentLevel - 1)
      const indent = '    '.repeat(Math.max(1, indentLevel))
      cleanedLines.push(indent + line)
      if (inParBlock) {
        inParBlock = false
      }
      continue
    }
    
    if (line === 'else') {
      const indent = '    '.repeat(Math.max(1, indentLevel - 1))
      cleanedLines.push(indent + line)
      continue
    }
    
    // Special handling for "and" in par blocks
    if (line === 'and' && inParBlock) {
      const indent = '    '.repeat(Math.max(1, indentLevel - 1))
      cleanedLines.push(indent + 'and')
      continue
    }
    
    // Check if this line is a proper sequence diagram element
    if (line === 'sequenceDiagram') {
      cleanedLines.push(line)
    } else if (line.startsWith('participant')) {
      cleanedLines.push('    ' + line)
    } else if (line.match(/^[A-Z][A-Z0-9_]*\s*(->>?|-->>?|-x|--x)/)) {
      const indent = '    '.repeat(Math.max(1, indentLevel))
      cleanedLines.push(indent + line)
    } else if (line.startsWith('Note')) {
      const indent = '    '.repeat(Math.max(1, indentLevel))
      cleanedLines.push(indent + line)
    } else if (line.match(/^(activate|deactivate)/)) {
      const indent = '    '.repeat(Math.max(1, indentLevel))
      cleanedLines.push(indent + line)
    } else {
      // Default - preserve with current indent
      const indent = '    '.repeat(Math.max(1, indentLevel))
      cleanedLines.push(line.startsWith('    ') ? line : indent + line)
    }
  }
  
  // Final validation - ensure all blocks are closed
  if (indentLevel > 0) {
    // Add missing end keywords
    for (let i = 0; i < indentLevel; i++) {
      cleanedLines.push('    end')
    }
  }
  
  return cleanedLines.join('\n')
}