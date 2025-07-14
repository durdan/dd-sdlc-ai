/**
 * SDLC Document Parser
 * Utility functions for parsing SDLC documents into structured formats
 * for integrations with project management tools
 */

interface SDLCDocumentInput {
  businessAnalysis?: string;
  functionalSpec?: string;
  technicalSpec?: string;
  uxSpec?: string;
  comprehensive?: string;
  architecture?: string;
  mermaidDiagrams?: string;
}

interface SDLCDocumentOutput {
  businessAnalysis: Record<string, string>;
  functionalSpec: Record<string, string>;
  technicalSpec: Record<string, string>;
  uxSpec?: Record<string, string>;
  metadata: {
    generationTime: number;
    sectionsGenerated: number;
  };
}

interface DefaultSections {
  businessAnalysis: Record<string, string>;
  functionalSpec: Record<string, string>;
  technicalSpec: Record<string, string>;
}

/**
 * Parse a document section into subsections based on markdown headers
 * @param content The document content as a string
 * @returns An object with subsection keys and content values
 */
function parseDocumentSections(content: string): Record<string, string> {
  if (!content || typeof content !== 'string') {
    return {};
  }

  const sections: Record<string, string> = {};
  
  // Try to split by markdown headers (## Section Title)
  const headerRegex = /^##\s+([^\n]+?)$/gm;
  let match;
  
  // First pass - identify all section headers
  const headers: {title: string, index: number}[] = [];
  while ((match = headerRegex.exec(content)) !== null) {
    headers.push({
      title: match[1].trim(),
      index: match.index
    });
  }
  
  // Second pass - extract content between headers
  for (let i = 0; i < headers.length; i++) {
    const currentHeader = headers[i];
    const nextHeader = headers[i + 1];
    const sectionEnd = nextHeader ? nextHeader.index : content.length;
    
    // Get section content (excluding the header itself)
    const headerEndIndex = content.indexOf('\n', currentHeader.index);
    const sectionStart = headerEndIndex !== -1 ? headerEndIndex + 1 : currentHeader.index + currentHeader.title.length + 3;
    
    // Extract and clean up section content
    const sectionContent = content.substring(sectionStart, sectionEnd).trim();
    
    // Convert title to camelCase for the key
    const sectionKey = currentHeader.title
      .replace(/[^\w\s]/g, '')
      .trim()
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');
    
    sections[sectionKey] = sectionContent;
  }
  
  // If no sections were found, try to create logical sections based on content
  if (Object.keys(sections).length === 0) {
    // Look for potential section indicators like bold text or lists
    const potentialSections = content.split(/\n\s*\n/); // Split by empty lines
    
    if (potentialSections.length > 1) {
      // Multiple paragraphs - use them as sections
      potentialSections.forEach((section, index) => {
        const trimmed = section.trim();
        if (trimmed) {
          // Try to extract a title from the first line
          const firstLine = trimmed.split('\n')[0].trim();
          const title = firstLine
            .replace(/[*#_]/g, '') // Remove markdown formatting
            .trim();
          
          const key = title
            ? title
                .replace(/[^\w\s]/g, '')
                .trim()
                .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
                  index === 0 ? word.toLowerCase() : word.toUpperCase()
                )
                .replace(/\s+/g, '')
            : `section${index + 1}`;
          
          sections[key] = trimmed;
        }
      });
    } else {
      // Single block of text - create a default section
      sections['content'] = content;
    }
  }
  
  return sections;
}

/**
 * Parse a complete SDLC document into a structured format for GitHub Projects
 * @param documents The SDLC document sections
 * @returns A structured SDLC document with subsections
 */
function parseSDLCDocument(documents: SDLCDocumentInput): SDLCDocumentOutput {
  // If comprehensive document is provided but specific sections aren't,
  // try to extract sections from the comprehensive document
  const comprehensive = documents.comprehensive;
  let businessContent = documents.businessAnalysis || '';
  let functionalContent = documents.functionalSpec || '';
  let technicalContent = documents.technicalSpec || '';
  let uxContent = documents.uxSpec || '';
  
  if (comprehensive && (!businessContent || !functionalContent || !technicalContent)) {
    // Try to extract sections from comprehensive document
    const businessRegex = /(?:##\s+Business Analysis|#\s+Business Analysis)[\s\S]*?(?=##\s+|$)/i;
    const functionalRegex = /(?:##\s+Functional Specification|#\s+Functional Specification)[\s\S]*?(?=##\s+|$)/i;
    const technicalRegex = /(?:##\s+Technical Specification|#\s+Technical Specification)[\s\S]*?(?=##\s+|$)/i;
    const uxRegex = /(?:##\s+UX Specification|#\s+UX Specification)[\s\S]*?(?=##\s+|$)/i;
    
    const businessMatch = comprehensive.match(businessRegex);
    const functionalMatch = comprehensive.match(functionalRegex);
    const technicalMatch = comprehensive.match(technicalRegex);
    const uxMatch = comprehensive.match(uxRegex);
    
    if (businessMatch && !businessContent) businessContent = businessMatch[0];
    if (functionalMatch && !functionalContent) functionalContent = functionalMatch[0];
    if (technicalMatch && !technicalContent) technicalContent = technicalMatch[0];
    if (uxMatch && !uxContent) uxContent = uxMatch[0];
    
    // If we still don't have content, create basic sections from the comprehensive doc
    if (!businessContent && !functionalContent && !technicalContent) {
      // Split document into thirds as a fallback
      const lines = comprehensive.split('\n');
      const third = Math.floor(lines.length / 3);
      
      businessContent = lines.slice(0, third).join('\n');
      functionalContent = lines.slice(third, third * 2).join('\n');
      technicalContent = lines.slice(third * 2).join('\n');
    }
  }
  
  // Parse each section into subsections
  const result: SDLCDocumentOutput = {
    businessAnalysis: parseDocumentSections(businessContent),
    functionalSpec: parseDocumentSections(functionalContent),
    technicalSpec: parseDocumentSections(technicalContent),
    metadata: {
      generationTime: Date.now(),
      sectionsGenerated: 3 // Base sections
    }
  };
  
  // Add UX spec if available
  if (uxContent) {
    result.uxSpec = parseDocumentSections(uxContent);
    result.metadata.sectionsGenerated++;
  }
  
  // Ensure each section has at least one subsection
  if (Object.keys(result.businessAnalysis).length === 0) {
    result.businessAnalysis = { 'executiveSummary': businessContent || 'Business Analysis Content' };
  }
  
  if (Object.keys(result.functionalSpec).length === 0) {
    result.functionalSpec = { 'systemOverview': functionalContent || 'Functional Specification Content' };
  }
  
  if (Object.keys(result.technicalSpec).length === 0) {
    result.technicalSpec = { 'systemArchitecture': technicalContent || 'Technical Specification Content' };
  }
  
  if (uxContent && (!result.uxSpec || Object.keys(result.uxSpec).length === 0)) {
    result.uxSpec = { 'userExperience': uxContent || 'UX Specification Content' };
  }
  
  return result;
}

/**
 * Create default subsections if none are found in the parsed document
 * @param parsedDocument The parsed SDLC document
 * @returns An SDLC document with default subsections if needed
 */
function ensureDefaultSubsections(parsedDocument: SDLCDocumentOutput): SDLCDocumentOutput {
  const defaultSections: DefaultSections = {
    businessAnalysis: {
      executiveSummary: "Executive summary of the project",
      stakeholderAnalysis: "Analysis of project stakeholders",
      requirementsAnalysis: "Business requirements analysis",
      riskAssessment: "Business risk assessment"
    },
    functionalSpec: {
      systemOverview: "Overview of the system functionality",
      functionalRequirements: "Detailed functional requirements",
      userInterfaceRequirements: "UI requirements",
      workflowDefinitions: "System workflows"
    },
    technicalSpec: {
      systemArchitecture: "System architecture overview",
      technologyStack: "Technology stack details",
      dataModels: "Data models and database design",
      apiSpecifications: "API specifications"
    }
  };
  
  // Check if each main section has subsections, if not, use defaults
  Object.keys(defaultSections).forEach(section => {
    const sectionKey = section as keyof DefaultSections;
    if (
      !parsedDocument[sectionKey] || 
      typeof parsedDocument[sectionKey] !== 'object' || 
      Object.keys(parsedDocument[sectionKey]).length === 0
    ) {
      parsedDocument[sectionKey] = defaultSections[sectionKey];
    }
  });
  
  return parsedDocument;
}

/**
 * Extract section summary from SDLC document
 * @param sdlcDocument The parsed SDLC document
 * @returns An object with section counts and details
 */
function extractDocumentSummary(sdlcDocument: SDLCDocumentOutput) {
  const summary = {
    totalSections: 0,
    sectionCounts: {
      businessAnalysis: Object.keys(sdlcDocument.businessAnalysis || {}).length,
      functionalSpec: Object.keys(sdlcDocument.functionalSpec || {}).length,
      technicalSpec: Object.keys(sdlcDocument.technicalSpec || {}).length,
      uxSpec: Object.keys(sdlcDocument.uxSpec || {}).length || 0
    },
    sectionDetails: {
      businessAnalysis: Object.keys(sdlcDocument.businessAnalysis || {}),
      functionalSpec: Object.keys(sdlcDocument.functionalSpec || {}),
      technicalSpec: Object.keys(sdlcDocument.technicalSpec || {}),
      uxSpec: Object.keys(sdlcDocument.uxSpec || {}) || []
    }
  };
  
  summary.totalSections = 
    summary.sectionCounts.businessAnalysis + 
    summary.sectionCounts.functionalSpec + 
    summary.sectionCounts.technicalSpec + 
    summary.sectionCounts.uxSpec;
    
  return summary;
}

// Export functions using CommonJS syntax
module.exports = {
  parseDocumentSections,
  parseSDLCDocument,
  ensureDefaultSubsections,
  extractDocumentSummary
}; 