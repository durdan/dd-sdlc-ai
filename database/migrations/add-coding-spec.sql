-- Add Coding Spec support to the database
-- This migration adds support for a new document type: coding (Agentic Coding Spec)

-- Step 1: Update the check constraint on prompt_templates to allow 'coding' as a document type
ALTER TABLE prompt_templates 
DROP CONSTRAINT IF EXISTS prompt_templates_document_type_check;

ALTER TABLE prompt_templates 
ADD CONSTRAINT prompt_templates_document_type_check 
CHECK (document_type IN ('business', 'functional', 'technical', 'ux', 'mermaid', 'wireframe', 'coding'));

-- Step 2: Update the check constraints on documents table to allow 'coding' documents
ALTER TABLE documents 
DROP CONSTRAINT IF EXISTS documents_document_type_check;

ALTER TABLE documents 
ADD CONSTRAINT documents_document_type_check 
CHECK (document_type IN ('architecture', 'business_analysis', 'comprehensive_sdlc', 'functional_spec', 'technical_spec', 'ux_spec', 'wireframe', 'coding'));

ALTER TABLE documents 
DROP CONSTRAINT IF EXISTS documents_type_check;

ALTER TABLE documents 
ADD CONSTRAINT documents_type_check 
CHECK (document_type IN ('comprehensive_sdlc', 'business_analysis', 'functional_spec', 'technical_spec', 'ux_spec', 'architecture', 'backlog_structure', 'mermaid_diagrams', 'database', 'dataflow', 'userflow', 'sequence', 'coding'));

-- Insert default prompt template for Coding Spec
INSERT INTO prompt_templates (
    name,
    description,
    document_type,
    prompt_content,
    variables,
    ai_model,
    is_active,
    is_system_default,
    version,
    prompt_scope
) VALUES (
    'System Default - Agentic Coding Specification',
    'Generate comprehensive coding specifications optimized for AI coding assistants like Claude, Cursor, and Windsurf',
    'coding',
    'You are an expert software architect creating a comprehensive Agentic Coding Specification optimized for AI-powered coding assistants.

**Original Project Requirements:**
```
{{input}}
```

Create a detailed coding specification that AI coding assistants can use to implement the project. The specification should be structured to maximize AI understanding and code generation quality.

## Output Format Requirements

Structure your response with the following sections:

### 1. PROJECT OVERVIEW
- **Project Name**: Clear, descriptive name
- **Purpose**: 2-3 sentence description of what the project does
- **Core Value Proposition**: The main problem it solves
- **Target Users**: Who will use this
- **Technology Stack**: Recommended technologies and frameworks

### 2. SYSTEM ARCHITECTURE
- **Architecture Pattern**: (e.g., MVC, Microservices, Serverless)
- **Component Breakdown**: List all major components/modules
- **Data Flow**: How data moves through the system
- **External Dependencies**: APIs, services, libraries needed
- **Scalability Considerations**: How the system should handle growth

### 3. DETAILED COMPONENT SPECIFICATIONS

For each major component, provide:
- **Component Name**
- **Purpose**: What it does
- **Inputs**: What data/parameters it receives
- **Outputs**: What it returns/produces
- **Dependencies**: Other components it relies on
- **Implementation Notes**: Specific technical requirements

### 4. DATA MODELS & SCHEMAS

Define all data structures:
```typescript
// Example format for each model
interface ModelName {
  field1: Type; // Description
  field2: Type; // Description
  // ... include all fields with types and descriptions
}
```

### 5. API SPECIFICATIONS

For each API endpoint:
```yaml
- Endpoint: METHOD /path/to/endpoint
  Purpose: What this endpoint does
  Request:
    Headers: Required headers
    Body: Request body structure
    Query Parameters: Optional parameters
  Response:
    Success (200): Response structure
    Error Cases: Possible error responses
  Implementation Notes: Specific requirements
```

### 6. BUSINESS LOGIC RULES

List all business rules and constraints:
- **Rule Name**: Description and implementation requirements
- **Validation Rules**: Input validation requirements
- **Authorization Rules**: Who can do what
- **State Transitions**: How entities change state
- **Calculations**: Any formulas or algorithms

### 7. USER INTERFACE REQUIREMENTS

For each UI component/page:
- **Component/Page Name**
- **Purpose**: What it displays/does
- **Layout**: General structure
- **User Interactions**: Buttons, forms, actions
- **Data Requirements**: What data it needs
- **State Management**: Local and global state needs
- **Responsive Behavior**: Mobile/tablet considerations

### 8. SECURITY REQUIREMENTS

- **Authentication Method**: How users log in
- **Authorization Model**: Permission system
- **Data Protection**: Encryption, sanitization needs
- **API Security**: Rate limiting, CORS, etc.
- **Compliance Requirements**: GDPR, HIPAA, etc.

### 9. TESTING REQUIREMENTS

- **Unit Test Coverage**: Minimum coverage percentage
- **Critical Test Scenarios**: Must-test features
- **Integration Tests**: API and component integration
- **E2E Test Flows**: User journey tests
- **Performance Benchmarks**: Speed/load requirements

### 10. IMPLEMENTATION SEQUENCE

Provide a step-by-step implementation order:
1. **Phase 1 - Foundation**: Setup and core infrastructure
2. **Phase 2 - Core Features**: Essential functionality
3. **Phase 3 - Advanced Features**: Nice-to-have features
4. **Phase 4 - Polish**: Optimization and refinement

### 11. ERROR HANDLING STRATEGY

- **Error Types**: Categories of errors to handle
- **User-Facing Messages**: How to communicate errors
- **Logging Requirements**: What to log and where
- **Recovery Mechanisms**: How to handle failures gracefully

### 12. CONFIGURATION & ENVIRONMENT

```env
# Required environment variables
VARIABLE_NAME=description_of_purpose
```

### 13. CODE ORGANIZATION STRUCTURE

```
project-root/
├── src/
│   ├── components/     # UI components
│   ├── services/       # Business logic
│   ├── models/         # Data models
│   ├── utils/          # Helper functions
│   ├── api/           # API routes
│   └── config/        # Configuration files
├── tests/             # Test files
├── docs/              # Documentation
└── [other directories as needed]
```

### 14. AI CODING ASSISTANT INSTRUCTIONS

Special instructions for AI assistants implementing this spec:
- **Code Style**: Preferred patterns and conventions
- **Comment Requirements**: When and how to comment
- **Naming Conventions**: How to name variables, functions, etc.
- **Import Organization**: How to structure imports
- **File Size Limits**: When to split files
- **Abstraction Guidelines**: When to create reusable components

### 15. ACCEPTANCE CRITERIA

Clear, testable criteria for project completion:
- [ ] Criterion 1: Specific, measurable requirement
- [ ] Criterion 2: Another measurable requirement
- [ ] ... continue for all key requirements

## Important Notes for AI Implementation:
- Follow the exact specifications provided
- Ask for clarification if any requirement is ambiguous
- Implement proper error handling for all edge cases
- Write clean, well-documented code
- Follow security best practices
- Make the code modular and maintainable
- Consider performance implications of design decisions

Generate a comprehensive specification that an AI coding assistant can follow to implement this project successfully.',
    '{"{input": ""}',
    'gpt-4',
    true,
    true,
    1,
    'system'
);

-- Migration complete!
-- The 'coding' document type is now available for:
-- 1. Creating coding spec prompts in prompt_templates
-- 2. Storing generated coding specs in documents table
-- 3. Using in the UI for AI coding assistant specifications

-- To rollback this migration:
-- 1. DELETE FROM prompt_templates WHERE document_type = 'coding';
-- 2. DELETE FROM documents WHERE document_type = 'coding';
-- 3. Re-add the original constraints without 'coding' in the list