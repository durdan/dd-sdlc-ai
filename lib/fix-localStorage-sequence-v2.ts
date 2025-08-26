/**
 * Fixed version that doesn't break properly formatted diagrams
 */

export function fixLocalStorageSequenceDiagramV2(content: string): string {
  // First check if this is actually a problematic diagram
  // If it has proper line breaks and structure, don't modify it
  const lines = content.split('\n')
  
  // If the diagram already has good structure (more than 10 lines), check if it needs fixing
  if (lines.length > 10) {
    // Only fix specific issues without breaking the structure
    let fixed = content
    
    // Fix 1: Handle "message par Something" pattern
    fixed = fixed.replace(/:\s*"([^"]+?)\s\s+(par|loop|alt|opt)\s+([^"]+)"/g, ': "$1"\n    $2 $3')
    
    // Fix 2: Handle "message and" pattern (should be message + and keyword)
    fixed = fixed.replace(/:\s*"([^"]+?)\s\s+(and)"\s*$/gm, ': "$1"\n    $2')
    
    // Fix 3: Ensure 'end' is on its own line when it appears after a quote
    fixed = fixed.replace(/"(\s+)end(\s+)/g, '"\n    end\n    ')
    fixed = fixed.replace(/"(\s+)end$/gm, '"\n    end')
    
    return fixed
  }
  
  // For single-line or nearly single-line diagrams, do more aggressive fixing
  let fixed = content
  
  // Only apply aggressive fixes if it's actually a single line mess
  if (!fixed.includes('\n') || lines.length <= 2) {
    // This is a collapsed single-line diagram, need to reconstruct it
    
    // Step 1: Add line break after sequenceDiagram
    fixed = fixed.replace(/sequenceDiagram\s*/, 'sequenceDiagram\n')
    
    // Step 2: Add line breaks before participant declarations
    fixed = fixed.replace(/\s+(participant\s+[A-Z_]+(?:\s+as\s+(?:"[^"]+"|[^\s]+))?)/g, '\n    $1')
    
    // Step 3: Add line breaks before message arrows (but not inside quotes!)
    // Use a more careful pattern that won't match inside quotes
    fixed = fixed.replace(/([">])\s+([A-Z_]+)\s*(->>?|-->>?|-x|--x)\s*([A-Z_]+)\s*:\s*/g, '$1\n    $2$3$4: ')
    
    // Step 4: Add line breaks before Note
    fixed = fixed.replace(/([">])\s+(Note\s+)/g, '$1\n    $2')
    
    // Step 5: Add line breaks before control keywords
    fixed = fixed.replace(/([">])\s+(loop|alt|opt|par|rect|critical|break)\s+/g, '$1\n    $2 ')
    fixed = fixed.replace(/([">])\s+(else)(?:\s+|$)/g, '$1\n    $2')
    fixed = fixed.replace(/([">])\s+(end)(?:\s+|$)/g, '$1\n    $2')
    
    // Step 6: Fix malformed par blocks
    fixed = fixed.replace(/:\s*"([^"]+?)\s\s+(par|loop|alt|opt)\s+([^"]+)"/g, ': "$1"\n    $2 $3')
    
    // Step 7: Fix "and" that should be a keyword
    fixed = fixed.replace(/:\s*"([^"]+?)\s\s+(and)"/g, ': "$1"\n    $2')
  }
  
  // Final cleanup for all cases
  // Ensure end keyword is never on the same line as a closing quote
  fixed = fixed.replace(/"(\s*)end\s+/g, '"\n    end\n    ')
  fixed = fixed.replace(/"(\s*)end$/gm, '"\n    end')
  
  // Remove any double spaces
  fixed = fixed.replace(/  +/g, ' ')
  
  // Clean up any orphaned quotes
  fixed = fixed.replace(/^\s*"\s*$/gm, '')
  
  return fixed
}