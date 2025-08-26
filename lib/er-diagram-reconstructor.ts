/**
 * Reconstructs broken ER diagrams by parsing entities and relationships
 * and rebuilding them with proper syntax
 */

interface Entity {
  name: string
  attributes: string[]
}

interface Relationship {
  from: string
  to: string
  type: string
  label?: string
}

/**
 * Parse and reconstruct a broken ER diagram
 */
export function reconstructERDiagram(content: string): string {
  // Extract entities and relationships
  const entities = extractEntities(content)
  const relationships = extractRelationships(content)
  
  // Rebuild the diagram with proper syntax
  let reconstructed = 'erDiagram\n'
  
  // Add relationships first
  relationships.forEach(rel => {
    reconstructed += `    ${rel.from} ${rel.type} ${rel.to}`
    if (rel.label) {
      reconstructed += ` : "${rel.label}"`
    }
    reconstructed += '\n'
  })
  
  // Add some spacing
  if (relationships.length > 0 && entities.length > 0) {
    reconstructed += '\n'
  }
  
  // Add entities with attributes
  entities.forEach(entity => {
    reconstructed += `    ${entity.name} {\n`
    entity.attributes.forEach(attr => {
      reconstructed += `        ${attr}\n`
    })
    reconstructed += '    }\n'
    if (entities.indexOf(entity) < entities.length - 1) {
      reconstructed += '\n'
    }
  })
  
  return reconstructed
}

/**
 * Extract entities from broken ER diagram content
 */
function extractEntities(content: string): Entity[] {
  const entities: Entity[] = []
  
  // Pattern to match entity definitions (even broken ones)
  // Matches: ENTITY_NAME { ... attributes ... }
  const entityPattern = /([A-Z][A-Z_]*)\s*\{([^}]*)\}/g
  
  let match
  while ((match = entityPattern.exec(content)) !== null) {
    const entityName = match[1]
    const attributesBlock = match[2]
    
    // Skip if this looks like a relationship pattern
    if (entityName.includes('||') || entityName.includes('--')) {
      continue
    }
    
    // Parse attributes
    const attributes: string[] = []
    const lines = attributesBlock.split('\n')
    
    for (const line of lines) {
      const cleaned = line.trim()
      
      // Skip empty lines and quotes
      if (!cleaned || cleaned === '"' || cleaned === '""') {
        continue
      }
      
      // Remove leading/trailing quotes
      const attr = cleaned.replace(/^["']+|["']+$/g, '')
      
      // Check if it looks like an attribute (has type and name)
      if (attr.includes(' ') && !attr.includes(':')) {
        // Common attribute patterns: "type name constraints"
        const parts = attr.split(/\s+/)
        if (parts.length >= 2) {
          // Looks like a valid attribute
          attributes.push(attr)
        }
      }
    }
    
    // Only add entity if it has a valid name and some attributes
    if (entityName && entityName.match(/^[A-Z][A-Z_]*$/) && attributes.length > 0) {
      // Check if entity already exists
      if (!entities.find(e => e.name === entityName)) {
        entities.push({
          name: entityName,
          attributes
        })
      }
    }
  }
  
  return entities
}

/**
 * Extract relationships from broken ER diagram content
 */
function extractRelationships(content: string): Relationship[] {
  const relationships: Relationship[] = []
  
  // Common relationship patterns in ER diagrams
  const relationshipPatterns = [
    '||--o{',  // One to many
    '||--|{',  // One to many (mandatory)
    '||--||',  // One to one
    'o{--||',  // Many to one
    '}o--||',  // Many to one (alternative)
    '}|--||',  // Many to one (mandatory)
    '||--o ',  // One to many (with space)
    '||--| ',  // One to many mandatory (with space)
  ]
  
  // Build a regex that matches any relationship
  const escapedPatterns = relationshipPatterns.map(p => 
    p.replace(/[|{}]/g, '\\$&').replace(/\s/g, '\\s*')
  )
  const relationshipRegex = new RegExp(
    `([A-Z][A-Z_]*)\\s*(${escapedPatterns.join('|')})\\s*([A-Z][A-Z_]*)(?:\\s*:\\s*["']?([^"'\n]+)["']?)?`,
    'gm'
  )
  
  let match
  while ((match = relationshipRegex.exec(content)) !== null) {
    const [, from, type, to, label] = match
    
    // Clean up the relationship type (remove extra spaces)
    let cleanType = type.trim()
    // Find the original pattern
    for (const pattern of relationshipPatterns) {
      if (type.match(new RegExp(pattern.replace(/[|{}]/g, '\\$&').replace(/\s/g, '\\s*')))) {
        cleanType = pattern.trim()
        break
      }
    }
    
    // Clean up the label
    let cleanLabel = label ? label.trim() : undefined
    if (cleanLabel) {
      // Remove quotes and fix common issues
      cleanLabel = cleanLabel
        .replace(/^["']+|["']+$/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      
      // Skip if label is just quotes or empty
      if (!cleanLabel || cleanLabel === '""' || cleanLabel === '"') {
        cleanLabel = undefined
      }
    }
    
    // Add relationship if entities are valid
    if (from && to && from !== to && 
        from.match(/^[A-Z][A-Z_]*$/) && 
        to.match(/^[A-Z][A-Z_]*$/)) {
      // Check for duplicate
      const exists = relationships.find(r => 
        r.from === from && r.to === to && r.type === cleanType
      )
      
      if (!exists) {
        relationships.push({
          from,
          to,
          type: cleanType,
          label: cleanLabel
        })
      }
    }
  }
  
  return relationships
}

/**
 * Attempt to fix a broken ER diagram using reconstruction
 */
export function fixBrokenERDiagram(content: string): string {
  // First check if it's an ER diagram
  if (!content.includes('erDiagram') && !content.includes('||--')) {
    return content
  }
  
  try {
    // Try to reconstruct the diagram
    const reconstructed = reconstructERDiagram(content)
    
    // Validate that we got something useful
    if (reconstructed.split('\n').length > 2) {
      return reconstructed
    }
  } catch (error) {
    console.error('Failed to reconstruct ER diagram:', error)
  }
  
  // If reconstruction failed, return original
  return content
}