/**
 * Utility functions to clean up and improve document formatting
 * Especially for UX specifications that may contain tree-like structures
 */

/**
 * Clean up tree-like formatting (├── └──) and convert to more readable format
 */
export function cleanupTreeFormatting(content: string): string {
  if (!content) return content;
  
  // Replace tree characters with bullet points or proper formatting
  let cleaned = content
    // Replace tree branches with bullet points
    .replace(/├──\s*/g, '• ')
    .replace(/└──\s*/g, '• ')
    .replace(/│\s*/g, '  ')
    
    // Clean up any remaining tree characters
    .replace(/[├└│─]+/g, '')
    
    // Fix any double spaces created
    .replace(/\s{3,}/g, '  ')
    
    // Ensure proper line breaks around headers
    .replace(/(\n#{1,6}\s+[^\n]+)/g, '\n$1\n')
    
    // Clean up multiple consecutive line breaks
    .replace(/\n{3,}/g, '\n\n');
  
  return cleaned;
}

/**
 * Format color definitions for better display
 */
export function formatColorDefinitions(content: string): string {
  // Pattern to match color definitions like "#0056b3 - Main actions"
  const colorPattern = /(#[0-9A-Fa-f]{6})\s*-\s*([^•\n]+)/g;
  
  return content.replace(colorPattern, (match, hex, description) => {
    return `**${hex}** - ${description.trim()}`;
  });
}

/**
 * Convert spacing definitions to a table format
 */
export function formatSpacingDefinitions(content: string): string {
  // Look for spacing sections and convert to table
  const spacingSection = /Spacing Scale:?\s*\n((?:.*(?:px|rem|em).*\n?)+)/gi;
  
  return content.replace(spacingSection, (match, spacingContent) => {
    const lines = spacingContent.trim().split('\n');
    let table = 'Spacing Scale:\n\n| Size | Usage |\n|------|-------|\n';
    
    lines.forEach(line => {
      const spacingMatch = line.match(/(\d+(?:px|rem|em))\s*[:•-]\s*(.+)/);
      if (spacingMatch) {
        table += `| ${spacingMatch[1]} | ${spacingMatch[2].trim()} |\n`;
      }
    });
    
    return table;
  });
}

/**
 * Improve list formatting
 */
export function improveListFormatting(content: string): string {
  // Convert lines starting with dash to proper bullet points
  content = content.replace(/^\s*-\s+/gm, '• ');
  
  // Ensure consistent spacing after bullet points
  content = content.replace(/•\s+/g, '• ');
  
  // Add proper indentation for nested lists
  content = content.replace(/^\s{2,}•\s+/gm, '  • ');
  
  return content;
}

/**
 * Main cleanup function that applies all formatting improvements
 */
export function cleanupDocumentFormatting(content: string, documentType: string): string {
  if (!content) return content;
  
  // Apply general cleanup
  let cleaned = cleanupTreeFormatting(content);
  cleaned = improveListFormatting(cleaned);
  
  // Apply specific formatting for UX documents
  if (documentType === 'ux' || documentType === 'ux_spec') {
    cleaned = formatColorDefinitions(cleaned);
    cleaned = formatSpacingDefinitions(cleaned);
    
    // Add some specific UX formatting improvements
    cleaned = cleaned
      // Make component names bold
      .replace(/Component:\s*([^\n]+)/g, '**Component:** $1')
      
      // Format property definitions
      .replace(/^(\w+):\s*\[([^\]]+)\]/gm, '**$1:** `$2`')
      
      // Improve section headers
      .replace(/^(Primary|Secondary|Semantic|Accessibility|Spacing|Grid|Component)/gm, '### $1');
  }
  
  return cleaned;
}

/**
 * Format for display in a box or card UI
 */
export function formatForBoxDisplay(content: string, maxLength?: number): string {
  let formatted = cleanupDocumentFormatting(content, 'ux');
  
  // If content is too long, truncate intelligently
  if (maxLength && formatted.length > maxLength) {
    // Try to cut at a paragraph break
    const cutPoint = formatted.lastIndexOf('\n\n', maxLength);
    if (cutPoint > maxLength * 0.8) {
      formatted = formatted.substring(0, cutPoint) + '\n\n[Content continues...]';
    } else {
      formatted = formatted.substring(0, maxLength) + '...';
    }
  }
  
  return formatted;
}