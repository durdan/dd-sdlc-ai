/**
 * SDLC Document Parser
 * Utility functions for parsing SDLC documents into structured formats
 * for integrations with project management tools
 */
/**
 * Parse a document section into subsections based on markdown headers
 * @param content The document content as a string
 * @returns An object with subsection keys and content values
 */
function parseDocumentSections(content) {
    if (!content || typeof content !== 'string') {
        return {};
    }
    var sections = {};
    // Try to split by markdown headers (## Section Title)
    var headerRegex = /^##\s+([^\n]+?)$/gm;
    var match;
    // First pass - identify all section headers
    var headers = [];
    while ((match = headerRegex.exec(content)) !== null) {
        headers.push({
            title: match[1].trim(),
            index: match.index
        });
    }
    // Second pass - extract content between headers
    for (var i = 0; i < headers.length; i++) {
        var currentHeader = headers[i];
        var nextHeader = headers[i + 1];
        var sectionEnd = nextHeader ? nextHeader.index : content.length;
        // Get section content (excluding the header itself)
        var headerEndIndex = content.indexOf('\n', currentHeader.index);
        var sectionStart = headerEndIndex !== -1 ? headerEndIndex + 1 : currentHeader.index + currentHeader.title.length + 3;
        // Extract and clean up section content
        var sectionContent = content.substring(sectionStart, sectionEnd).trim();
        // Convert title to camelCase for the key
        var sectionKey = currentHeader.title
            .replace(/[^\w\s]/g, '')
            .trim()
            .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
            .replace(/\s+/g, '');
        sections[sectionKey] = sectionContent;
    }
    // If no sections were found, try to create logical sections based on content
    if (Object.keys(sections).length === 0) {
        // Look for potential section indicators like bold text or lists
        var potentialSections = content.split(/\n\s*\n/); // Split by empty lines
        if (potentialSections.length > 1) {
            // Multiple paragraphs - use them as sections
            potentialSections.forEach(function (section, index) {
                var trimmed = section.trim();
                if (trimmed) {
                    // Try to extract a title from the first line
                    var firstLine = trimmed.split('\n')[0].trim();
                    var title = firstLine
                        .replace(/[*#_]/g, '') // Remove markdown formatting
                        .trim();
                    var key = title
                        ? title
                            .replace(/[^\w\s]/g, '')
                            .trim()
                            .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
                            return index === 0 ? word.toLowerCase() : word.toUpperCase();
                        })
                            .replace(/\s+/g, '')
                        : "section".concat(index + 1);
                    sections[key] = trimmed;
                }
            });
        }
        else {
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
function parseSDLCDocument(documents) {
    // If comprehensive document is provided but specific sections aren't,
    // try to extract sections from the comprehensive document
    var comprehensive = documents.comprehensive;
    var businessContent = documents.businessAnalysis || '';
    var functionalContent = documents.functionalSpec || '';
    var technicalContent = documents.technicalSpec || '';
    var uxContent = documents.uxSpec || '';
    if (comprehensive && (!businessContent || !functionalContent || !technicalContent)) {
        // Try to extract sections from comprehensive document
        var businessRegex = /(?:##\s+Business Analysis|#\s+Business Analysis)[\s\S]*?(?=##\s+|$)/i;
        var functionalRegex = /(?:##\s+Functional Specification|#\s+Functional Specification)[\s\S]*?(?=##\s+|$)/i;
        var technicalRegex = /(?:##\s+Technical Specification|#\s+Technical Specification)[\s\S]*?(?=##\s+|$)/i;
        var uxRegex = /(?:##\s+UX Specification|#\s+UX Specification)[\s\S]*?(?=##\s+|$)/i;
        var businessMatch = comprehensive.match(businessRegex);
        var functionalMatch = comprehensive.match(functionalRegex);
        var technicalMatch = comprehensive.match(technicalRegex);
        var uxMatch = comprehensive.match(uxRegex);
        if (businessMatch && !businessContent)
            businessContent = businessMatch[0];
        if (functionalMatch && !functionalContent)
            functionalContent = functionalMatch[0];
        if (technicalMatch && !technicalContent)
            technicalContent = technicalMatch[0];
        if (uxMatch && !uxContent)
            uxContent = uxMatch[0];
        // If we still don't have content, create basic sections from the comprehensive doc
        if (!businessContent && !functionalContent && !technicalContent) {
            // Split document into thirds as a fallback
            var lines = comprehensive.split('\n');
            var third = Math.floor(lines.length / 3);
            businessContent = lines.slice(0, third).join('\n');
            functionalContent = lines.slice(third, third * 2).join('\n');
            technicalContent = lines.slice(third * 2).join('\n');
        }
    }
    // Parse each section into subsections
    var result = {
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
    return result;
}
/**
 * Create default subsections if none are found in the parsed document
 * @param parsedDocument The parsed SDLC document
 * @returns An SDLC document with default subsections if needed
 */
function ensureDefaultSubsections(parsedDocument) {
    var defaultSections = {
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
    Object.keys(defaultSections).forEach(function (section) {
        var sectionKey = section;
        if (!parsedDocument[sectionKey] ||
            typeof parsedDocument[sectionKey] !== 'object' ||
            Object.keys(parsedDocument[sectionKey]).length === 0) {
            parsedDocument[sectionKey] = defaultSections[sectionKey];
        }
    });
    return parsedDocument;
}
// Export functions using CommonJS syntax
module.exports = {
    parseDocumentSections: parseDocumentSections,
    parseSDLCDocument: parseSDLCDocument,
    ensureDefaultSubsections: ensureDefaultSubsections
};
