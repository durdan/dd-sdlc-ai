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
  
  // Apply professional formatting for technical specs
  if (documentType === 'technical') {
    cleaned = enhanceTechnicalDocumentFormatting(cleaned);
  }
  
  // Apply professional formatting for business analysis
  if (documentType === 'business') {
    cleaned = enhanceBusinessDocumentFormatting(cleaned);
  }
  
  // Apply universal professional formatting
  cleaned = applyUniversalProfessionalFormatting(cleaned);
  
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

/**
 * Enhance technical document formatting to make it more professional
 */
function enhanceTechnicalDocumentFormatting(content: string): string {
  let formatted = content;
  
  // Convert bullet lists with key-value pairs to tables
  // Pattern: - **Key**: Value
  const bulletPattern = /^- \*\*([^:]+)\*\*:\s*(.+)$/gm;
  const bullets: string[] = [];
  let match;
  
  while ((match = bulletPattern.exec(formatted)) !== null) {
    bullets.push(`| **${match[1]}** | ${match[2]} |`);
  }
  
  // Replace technology stack lists with tables
  formatted = formatted.replace(
    /^### (Frontend|Backend|Infrastructure)$\n((?:^- .+$\n?)+)/gm,
    (match, section, items) => {
      const lines = items.trim().split('\n');
      let table = `### ${section}\n\n| Component | Technology | Details |\n|-----------|------------|----------|\n`;
      lines.forEach(line => {
        const parts = line.replace(/^- /, '').split(':');
        if (parts.length >= 2) {
          table += `| **${parts[0].trim()}** | ${parts[1].trim()} | - |\n`;
        }
      });
      return table;
    }
  );
  
  // Add visual indicators for important sections
  formatted = formatted
    .replace(/^(#{1,3}) (Architecture|Security|Performance|Scalability)/gm, '$1 🏗️ $2')
    .replace(/^(#{1,3}) (API|Integration)/gm, '$1 🔌 $2')
    .replace(/^(#{1,3}) (Database|Data)/gm, '$1 💾 $2')
    .replace(/^(#{1,3}) (Monitoring|Observability)/gm, '$1 📊 $2');
  
  return formatted;
}

/**
 * Enhance business document formatting
 */
function enhanceBusinessDocumentFormatting(content: string): string {
  let formatted = content;
  
  // Convert requirement lists to numbered format
  formatted = formatted.replace(
    /^- (Must have|Should have|Could have|Won't have):\s*(.+)$/gm,
    (match, priority, requirement) => {
      const emoji = priority === 'Must have' ? '🔴' :
                    priority === 'Should have' ? '🟡' :
                    priority === 'Could have' ? '🟢' : '⚪';
      return `${emoji} **${priority}:** ${requirement}`;
    }
  );
  
  // Format KPIs and metrics
  formatted = formatted.replace(
    /^- ([^:]+):\s*(\d+%?)/gm,
    '| **$1** | `$2` |'
  );
  
  // Add professional section markers
  formatted = formatted
    .replace(/^(#{1,3}) (Executive Summary)/gm, '$1 📋 $2')
    .replace(/^(#{1,3}) (Requirements|User Stories)/gm, '$1 ✅ $2')
    .replace(/^(#{1,3}) (Risk|Risks)/gm, '$1 ⚠️ $2')
    .replace(/^(#{1,3}) (Timeline|Roadmap)/gm, '$1 📅 $2')
    .replace(/^(#{1,3}) (Budget|Cost)/gm, '$1 💰 $2')
    .replace(/^(#{1,3}) (Stakeholder)/gm, '$1 👥 $2');
  
  return formatted;
}

/**
 * Apply universal professional formatting improvements
 */
function applyUniversalProfessionalFormatting(content: string): string {
  let formatted = content;
  
  // Convert simple lists to tables where appropriate
  // Pattern: Multiple lines of "Key: Value" format
  const keyValuePattern = /^([A-Z][^:]+):\s*(.+)$/gm;
  const keyValueSections: string[] = [];
  
  formatted = formatted.replace(
    /(^[A-Z][^:]+:\s*.+$\n){3,}/gm,
    (match) => {
      const lines = match.trim().split('\n');
      if (lines.length >= 3) {
        let table = '| Property | Value |\n|----------|-------|\n';
        lines.forEach(line => {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          table += `| **${key.trim()}** | ${value} |\n`;
        });
        return table + '\n';
      }
      return match;
    }
  );
  
  // Improve code block formatting
  formatted = formatted.replace(
    /```\n([^`]+)\n```/g,
    (match, code) => {
      // Try to detect language if not specified
      if (code.includes('function') || code.includes('const') || code.includes('=>')) {
        return '```javascript\n' + code + '\n```';
      } else if (code.includes('SELECT') || code.includes('CREATE TABLE')) {
        return '```sql\n' + code + '\n```';
      } else if (code.includes('<!DOCTYPE') || code.includes('<html')) {
        return '```html\n' + code + '\n```';
      }
      return match;
    }
  );
  
  // Add proper spacing around headers
  formatted = formatted
    .replace(/([^\n])\n(#{1,6} )/g, '$1\n\n$2')
    .replace(/(#{1,6} [^\n]+)\n([^\n])/g, '$1\n\n$2');
  
  // Convert emphasis patterns
  formatted = formatted
    .replace(/\[([^\]]+)\]/g, '`$1`') // [text] to `text`
    .replace(/^(\w+):\s+/gm, '**$1:** '); // Key: to **Key:**
  
  // Clean up excessive line breaks
  formatted = formatted.replace(/\n{4,}/g, '\n\n\n');
  
  return formatted;
}