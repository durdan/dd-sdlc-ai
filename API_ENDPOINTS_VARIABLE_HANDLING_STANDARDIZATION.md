# API Endpoints Variable Handling Standardization

## Overview

This document outlines the standardized approach for handling input variables across all document generation API endpoints in the SDLC AI platform. The goal is to ensure consistent behavior, proper input validation, and intelligent context handling regardless of which documents are available.

## Standardized Variable Handling

### 1. Variable Syntax Support

All endpoints now support both variable syntax formats:
- **Double Curly Braces**: `{{variable_name}}` (preferred format)
- **Single Curly Braces**: `{variable_name}` (legacy support)

### 2. Input Variable Requirements

Each document type expects specific input variables based on the document hierarchy:

| Document Type | Required Variables | Optional Variables |
|---------------|-------------------|-------------------|
| **Business Analysis** | `{{input}}` | None |
| **Functional Spec** | `{{input}}` | `{{business_analysis}}` |
| **Technical Spec** | `{{input}}` | `{{business_analysis}}`, `{{functional_spec}}` |
| **UX Spec** | `{{input}}` | `{{business_analysis}}`, `{{functional_spec}}`, `{{technical_spec}}` |
| **Mermaid Diagrams** | `{{input}}` | `{{business_analysis}}`, `{{functional_spec}}`, `{{technical_spec}}` |

### 3. Standardized Processing Flow

All endpoints follow this consistent processing flow:

```typescript
// 1. Custom Prompt Handling (Legacy Support)
if (customPrompt && customPrompt.trim() !== "") {
  const processedPrompt = customPrompt
    .replace(/{{input}}/g, input)
    .replace(/\{input\}/g, input)
    // ... additional variable replacements
}

// 2. Database Prompt Processing
const { processedContent } = await promptService.preparePrompt(
  promptTemplate.id,
  { 
    input: input,
    business_analysis: businessAnalysis || '',
    functional_spec: functionalSpec || '',
    technical_spec: technicalSpec || '',
  }
)

// 3. Input Placeholder Validation
if (!processedContent.includes('{{input}}') && !processedContent.includes('{input}')) {
  processedContentWithInput = `## Original Project Requirements:
{{input}}

${processedContent}`
}

// 4. Variable Replacement
cleanedContent = cleanedContent
  .replace(/\{\{input\}\}/g, input)
  .replace(/\{input\}/g, input)
  .replace(/\{\{business_analysis\}\}/g, businessAnalysis || '')
  .replace(/\{business_analysis\}/g, businessAnalysis || '')
  // ... additional replacements

// 5. Cleanup Unreplaced Variables
cleanedContent = cleanedContent
  .replace(/\{\{[^}]+\}\}/g, '')
  .replace(/\{[^}]+\}/g, '')

// 6. Context-Aware Notes
// Add intelligent context based on available documents
```

### 4. Intelligent Context Handling

Each endpoint provides intelligent context notes based on available documents:

#### When No Context Documents Available:
- Explains that generation is based on requirements only
- Provides approach guidance for the specific document type
- Suggests next steps for document generation
- Emphasizes best practices for the domain

#### When Context Documents Are Available:
- Lists available documents
- Provides approach guidance leveraging existing context
- Emphasizes consistency and integration with existing documents
- Validates decisions against available context

### 5. Error Handling and Validation

#### Input Validation:
- All endpoints validate that `input` is provided and not empty
- OpenAI API key validation
- User authentication validation

#### Variable Replacement Validation:
- Check for missing `{{input}}` placeholder in prompt templates
- Automatically add input placeholder if missing
- Clean up any unreplaced variable placeholders
- Log detailed debugging information for troubleshooting

### 6. Fallback Strategy

All endpoints implement a 3-tier fallback strategy:

1. **Custom Prompt** (Legacy Support): Use custom prompt if provided
2. **Database Prompt**: Use prompt template from database
3. **Hardcoded Fallback**: Use built-in fallback prompt

## Endpoint-Specific Implementations

### Business Analysis API (`/api/generate-business-analysis`)

**Variables**: `{{input}}` only
**Context**: None required
**Special Handling**: 
- Focuses on business context extraction
- Emphasizes stakeholder analysis and business objectives

### Functional Specification API (`/api/generate-functional-spec`)

**Variables**: `{{input}}` + `{{business_analysis}}` (optional)
**Context**: Business analysis if available
**Special Handling**:
- Leverages business analysis for informed functional requirements
- Provides guidance when business analysis is missing

### Technical Specification API (`/api/generate-technical-spec`)

**Variables**: `{{input}}` + `{{business_analysis}}` + `{{functional_spec}}` (optional)
**Context**: Business analysis and functional spec if available
**Special Handling**:
- Aligns technical architecture with business and functional requirements
- Provides comprehensive guidance when context documents are missing

### UX Specification API (`/api/generate-ux-spec`)

**Variables**: `{{input}}` + `{{business_analysis}}` + `{{functional_spec}}` + `{{technical_spec}}` (optional)
**Context**: All previous documents if available
**Special Handling**:
- Aligns UX design with business, functional, and technical context
- Emphasizes user-centered design principles
- Provides comprehensive guidance for UX design approach

### Mermaid Diagrams API (`/api/generate-mermaid-diagrams`)

**Variables**: `{{input}}` + `{{business_analysis}}` + `{{functional_spec}}` + `{{technical_spec}}` (optional)
**Context**: All previous documents if available
**Special Handling**:
- Creates architectural diagrams based on available context
- Emphasizes system visualization and technical architecture
- Provides guidance for diagram generation approach

## Benefits of Standardization

### 1. Consistency
- All endpoints handle variables the same way
- Predictable behavior across the platform
- Reduced maintenance overhead

### 2. Reliability
- Robust input validation and placeholder checking
- Graceful handling of missing context documents
- Comprehensive fallback strategies

### 3. User Experience
- Intelligent context-aware generation
- Clear guidance when documents are missing
- Consistent streaming behavior

### 4. Maintainability
- Standardized code patterns
- Centralized variable handling logic
- Easy to extend and modify

## Testing and Validation

### Automated Testing
- Unit tests for variable replacement logic
- Integration tests for endpoint behavior
- Validation tests for input handling

### Manual Testing
- Test each endpoint with various combinations of available documents
- Verify context notes are appropriate for each scenario
- Validate streaming behavior and response quality

## Future Enhancements

### 1. Variable Validation
- Add validation for variable content quality
- Implement minimum content length requirements
- Add domain-specific validation rules

### 2. Enhanced Context
- Add support for additional context variables
- Implement context quality scoring
- Add context relevance validation

### 3. Performance Optimization
- Cache processed prompt templates
- Optimize variable replacement performance
- Implement prompt template versioning

## Conclusion

The standardized variable handling approach ensures that all API endpoints provide consistent, reliable, and intelligent document generation capabilities. This standardization improves the overall user experience while making the codebase more maintainable and extensible.

The implementation follows best practices for:
- Input validation and sanitization
- Error handling and recovery
- Context-aware processing
- Streaming response handling
- Comprehensive logging and debugging

This approach provides a solid foundation for the SDLC AI platform's document generation capabilities. 