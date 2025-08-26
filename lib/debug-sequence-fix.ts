/**
 * Debug version of the sequence diagram fixer to understand what's happening
 */

export function debugFixSequenceDiagram(content: string): { original: string, steps: string[], final: string } {
  const steps: string[] = []
  
  steps.push("=== ORIGINAL ===")
  steps.push(content)
  
  let fixed = content
  
  // Step 1: Fix concatenated messages
  steps.push("\n=== STEP 1: Fix concatenated messages ===")
  const step1 = fixed.replace(/"([^"]+?)\s+([A-Z][A-Z0-9_]*)\s*(->>?|-->>?|-x|--x)\s*([A-Z][A-Z0-9_]*)\s*:\s*([^"]+)"/g, 
    (match, msg1, from, arrow, to, msg2) => {
      const result = `"${msg1}"\n${from}${arrow}${to}: "${msg2}"`
      steps.push(`Found: ${match}`)
      steps.push(`Fixed to: ${result}`)
      return result
    })
  fixed = step1
  
  // Step 2: Fix malformed par blocks
  steps.push("\n=== STEP 2: Fix malformed par blocks ===")
  const step2 = fixed.replace(/"([^"]+?)\s+(par|and|end)\s+([^"]*?)"/g, 
    (match, msg1, keyword, msg2) => {
      let result = match
      if (keyword === 'par' && msg2) {
        result = `"${msg1}"\n${keyword} ${msg2}`
      } else if (keyword === 'and') {
        result = `"${msg1}"\n${keyword}${msg2 ? '\n' + msg2 : ''}`
      } else if (keyword === 'end') {
        result = `"${msg1}"\nend${msg2 ? '\n' + msg2 : ''}`
      }
      if (result !== match) {
        steps.push(`Found: ${match}`)
        steps.push(`Fixed to: ${result}`)
      }
      return result
    })
  fixed = step2
  
  // Step 3: Fix specific par patterns
  steps.push("\n=== STEP 3: Fix specific par patterns ===")
  const step3 = fixed.replace(/:\s*"([^"]+?)\s\s+(par|loop|alt|opt)\s+([^"]+)"/g, 
    (match, msg, keyword, rest) => {
      const result = `: "${msg}"\n${keyword} ${rest}`
      steps.push(`Found: ${match}`)
      steps.push(`Fixed to: ${result}`)
      return result
    })
  fixed = step3
  
  // Step 4: Fix end keywords more aggressively
  steps.push("\n=== STEP 4: Fix end keywords ===")
  // Look for patterns where end is not on its own line
  const endPatterns = [
    { pattern: /"\s+end\s+/g, replacement: '"\nend\n', desc: '"message" end something' },
    { pattern: /"\s+end$/gm, replacement: '"\nend', desc: '"message" end (EOL)' },
    { pattern: /"\s+end\s+([A-Z])/g, replacement: '"\nend\n$1', desc: '"message" end ACTOR' },
    { pattern: /([^"\s])\s+end\s+/g, replacement: '$1\nend\n', desc: 'something end something' },
  ]
  
  for (const {pattern, replacement, desc} of endPatterns) {
    const before = fixed
    fixed = fixed.replace(pattern, replacement)
    if (before !== fixed) {
      steps.push(`Applied: ${desc}`)
    }
  }
  
  // Step 5: Add line breaks if needed
  steps.push("\n=== STEP 5: Add line breaks ===")
  if (fixed.split('\n').length <= 5) {
    steps.push("Content appears to be mostly on one line, adding breaks...")
    fixed = fixed
      .replace(/sequenceDiagram\s+/, 'sequenceDiagram\n')
      .replace(/\s+(participant\s+)/g, '\n$1')
      .replace(/\s+([A-Z][A-Z0-9_]*->>)/g, '\n$1')
      .replace(/\s+([A-Z][A-Z0-9_]*-->>)/g, '\n$1')
      .replace(/\s+([A-Z][A-Z0-9_]*--x)/g, '\n$1')
      .replace(/\s+(Note\s+)/g, '\n$1')
      .replace(/\s+(loop\s+)/g, '\n$1')
      .replace(/\s+(alt\s+)/g, '\n$1')
      .replace(/\s+(par\s+)/g, '\n$1')
      .replace(/\s+(else)/g, '\n$1')
      .replace(/\s+(end)(?=\s|$)/g, '\n$1')
  }
  
  steps.push("\n=== FINAL OUTPUT ===")
  steps.push(fixed)
  
  return {
    original: content,
    steps,
    final: fixed
  }
}