export const codingPromptSections: Record<string, {
  id: string
  name: string
  icon: string
  description: string
  prompt: string
}> = {
  system_prompt: {
    id: 'system_prompt',
    name: "System Prompt",
    icon: "🧠",
    description: "Core system instructions and behavior",
    prompt: `Define the system behavior and AI assistant instructions:
- Core capabilities and limitations
- Response format and style
- Security and safety guidelines
- Context handling
- Error recovery strategies`
  },
  code_structure: {
    id: 'code_structure',
    name: "Code Structure",
    icon: "🏗️",
    description: "Project structure and architecture guidelines",
    prompt: `Design the code structure and organization:
- Directory structure and organization
- Module dependencies
- Component hierarchy
- Separation of concerns
- Code reusability patterns`
  },
  coding_standards: {
    id: 'coding_standards',
    name: "Coding Standards",
    icon: "📏",
    description: "Code style, conventions, and best practices",
    prompt: `Establish coding standards and conventions:
- Naming conventions
- Code formatting rules
- Comment standards
- Code review guidelines
- Linting rules and configuration`
  },
  implementation_guide: {
    id: 'implementation_guide',
    name: "Implementation Guide",
    icon: "🛠️",
    description: "Step-by-step implementation instructions",
    prompt: `Create detailed implementation instructions:
- Setup and initialization steps
- Core functionality implementation
- Feature development workflow
- Integration points
- Configuration management`
  },
  api_specifications: {
    id: 'api_specifications',
    name: "API Specifications",
    icon: "🔌",
    description: "API endpoints, methods, and data formats",
    prompt: `Define API specifications:
- Endpoint definitions
- Request/response formats
- Authentication methods
- Rate limiting
- API versioning strategy`
  },
  error_handling: {
    id: 'error_handling',
    name: "Error Handling",
    icon: "⚠️",
    description: "Error handling patterns and strategies",
    prompt: `Design error handling approach:
- Exception handling patterns
- Error logging strategy
- User-facing error messages
- Recovery mechanisms
- Debugging guidelines`
  },
  testing_requirements: {
    id: 'testing_requirements',
    name: "Testing Requirements",
    icon: "✅",
    description: "Unit tests, integration tests, and coverage",
    prompt: `Specify testing requirements:
- Unit test coverage targets
- Integration testing approach
- Test data management
- Mocking strategies
- Test automation setup`
  },
  deployment_instructions: {
    id: 'deployment_instructions',
    name: "Deployment Instructions",
    icon: "🚀",
    description: "Deployment process and configuration",
    prompt: `Document deployment procedures:
- Build process
- Environment configurations
- CI/CD pipeline setup
- Rollback procedures
- Monitoring setup`
  },
  documentation_requirements: {
    id: 'documentation_requirements',
    name: "Documentation Requirements",
    icon: "📚",
    description: "Code documentation and commenting standards",
    prompt: `Define documentation requirements:
- Code documentation standards
- API documentation format
- README structure
- Change log maintenance
- Architecture decision records`
  },
  performance_optimization: {
    id: 'performance_optimization',
    name: "Performance Optimization",
    icon: "⚡",
    description: "Performance considerations and optimizations",
    prompt: `Outline performance optimization strategies:
- Performance benchmarks
- Caching strategies
- Database optimization
- Code optimization techniques
- Scalability considerations`
  }
}

const defaultCodingPrompt = `Generate comprehensive coding instructions for the following project:

Project Description: {{input}}
${`{{business_analysis}}` ? `\nBusiness Analysis:\n{{business_analysis}}` : ''}
${`{{functional_spec}}` ? `\nFunctional Specification:\n{{functional_spec}}` : ''}
${`{{technical_spec}}` ? `\nTechnical Specification:\n{{technical_spec}}` : ''}

Create detailed coding guidelines and implementation instructions including:

1. **System Architecture**
   - Overall system design
   - Component architecture
   - Technology stack

2. **Code Structure**
   - Project organization
   - Module structure
   - File naming conventions

3. **Implementation Details**
   - Core functionality implementation
   - API endpoints and methods
   - Database operations
   - Business logic

4. **Coding Standards**
   - Code style guidelines
   - Best practices
   - Design patterns to use

5. **Error Handling**
   - Exception handling strategy
   - Logging requirements
   - Error recovery mechanisms

6. **Testing Requirements**
   - Unit test coverage
   - Integration testing
   - Test data requirements

7. **Performance Considerations**
   - Optimization techniques
   - Caching strategies
   - Scalability considerations

8. **Security Implementation**
   - Authentication and authorization
   - Data validation
   - Security best practices

9. **Documentation**
   - Code documentation standards
   - API documentation
   - README requirements

10. **Deployment**
    - Build process
    - Environment configuration
    - Deployment procedures

Provide specific code examples where appropriate and ensure all guidelines are actionable and clear.`

export function generateCombinedCodingPrompt(selectedSections: string[], context: {
  input: string
  business_analysis?: string
  functional_spec?: string
  technical_spec?: string
}): string {
  if (selectedSections.length === 0) {
    return defaultCodingPrompt
  }

  const sections = selectedSections.map(id => codingPromptSections[id]).filter(Boolean)
  
  const combinedPrompt = `As a Senior Software Engineer, create comprehensive coding instructions and implementation guidelines.

Project Description: {{input}}
${context.business_analysis ? `Business Analysis: {{business_analysis}}` : ''}
${context.functional_spec ? `Functional Specification: {{functional_spec}}` : ''}
${context.technical_spec ? `Technical Specification: {{technical_spec}}` : ''}

Generate detailed coding instructions covering the following areas:

${sections.map((section, index) => `
## Part ${index + 1}: ${section.name}
${section.prompt}
`).join('\n\n')}

Ensure all sections include specific code examples, follow best practices, and provide clear implementation guidance. Format as a professional technical document.`

  return combinedPrompt
}