/**
 * Prompt Validation Service
 * Validates prompt templates, variables, and provides user guidance
 */

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description?: string;
  defaultValue?: any;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    options?: string[]; // For enum-like values
    min?: number; // For numbers
    max?: number; // For numbers
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  extractedVariables: PromptVariable[];
}

export interface PromptValidationOptions {
  documentType: string;
  strictMode?: boolean; // If true, enforces stricter validation rules
  allowCustomVariables?: boolean; // If false, only allows predefined variables
}

export class PromptValidationService {
  // Predefined variables for each document type
  private readonly documentTypeVariables: Record<string, PromptVariable[]> = {
    business: [
      {
        name: 'input',
        type: 'string',
        required: true,
        description: 'The main project description or requirements',
        validation: { minLength: 10, maxLength: 5000 }
      },
      {
        name: 'stakeholders',
        type: 'string',
        required: false,
        description: 'Key stakeholders involved in the project'
      },
      {
        name: 'budget',
        type: 'string',
        required: false,
        description: 'Project budget constraints'
      },
      {
        name: 'timeline',
        type: 'string',
        required: false,
        description: 'Project timeline or deadlines'
      },
      {
        name: 'industry',
        type: 'string',
        required: false,
        description: 'Industry or domain context'
      }
    ],
    functional: [
      {
        name: 'input',
        type: 'string',
        required: true,
        description: 'The project requirements or business analysis',
        validation: { minLength: 10, maxLength: 10000 }
      },
      {
        name: 'userRoles',
        type: 'string',
        required: false,
        description: 'Different user roles that will interact with the system'
      },
      {
        name: 'integrations',
        type: 'string',
        required: false,
        description: 'Required system integrations'
      },
      {
        name: 'constraints',
        type: 'string',
        required: false,
        description: 'Technical or business constraints'
      }
    ],
    technical: [
      {
        name: 'input',
        type: 'string',
        required: true,
        description: 'The functional requirements or specifications',
        validation: { minLength: 10, maxLength: 10000 }
      },
      {
        name: 'technology',
        type: 'string',
        required: false,
        description: 'Preferred technology stack'
      },
      {
        name: 'architecture',
        type: 'string',
        required: false,
        description: 'Architectural preferences or patterns'
      },
      {
        name: 'scalability',
        type: 'string',
        required: false,
        description: 'Scalability requirements'
      },
      {
        name: 'security',
        type: 'string',
        required: false,
        description: 'Security requirements and considerations'
      }
    ],
    ux: [
      {
        name: 'input',
        type: 'string',
        required: true,
        description: 'The project requirements or functional specifications',
        validation: { minLength: 10, maxLength: 10000 }
      },
      {
        name: 'targetAudience',
        type: 'string',
        required: false,
        description: 'Target user demographics and characteristics'
      },
      {
        name: 'devices',
        type: 'string',
        required: false,
        description: 'Target devices (mobile, desktop, tablet)'
      },
      {
        name: 'accessibility',
        type: 'string',
        required: false,
        description: 'Accessibility requirements'
      },
      {
        name: 'brandGuidelines',
        type: 'string',
        required: false,
        description: 'Brand guidelines and design constraints'
      }
    ],
    mermaid: [
      {
        name: 'input',
        type: 'string',
        required: true,
        description: 'The system description or requirements',
        validation: { minLength: 10, maxLength: 10000 }
      },
      {
        name: 'diagramType',
        type: 'string',
        required: false,
        description: 'Preferred diagram types (flowchart, sequence, etc.)',
        validation: { 
          options: ['flowchart', 'sequence', 'class', 'state', 'entity-relationship', 'user-journey', 'gantt']
        }
      },
      {
        name: 'complexity',
        type: 'string',
        required: false,
        description: 'Diagram complexity level',
        validation: { options: ['simple', 'moderate', 'detailed'] }
      }
    ],
    sdlc: [
      {
        name: 'input',
        type: 'string',
        required: true,
        description: 'The complete project description',
        validation: { minLength: 20, maxLength: 15000 }
      },
      {
        name: 'methodology',
        type: 'string',
        required: false,
        description: 'Development methodology preference',
        validation: { options: ['agile', 'waterfall', 'lean', 'devops'] }
      },
      {
        name: 'teamSize',
        type: 'string',
        required: false,
        description: 'Development team size'
      }
    ]
  };

  /**
   * Extract variables from a prompt template
   */
  extractVariables(promptContent: string): PromptVariable[] {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const extractedVars: PromptVariable[] = [];
    const matches = promptContent.matchAll(variableRegex);

    for (const match of matches) {
      const varName = match[1];
      if (!extractedVars.find(v => v.name === varName)) {
        extractedVars.push({
          name: varName,
          type: 'string',
          required: true,
          description: `Variable: ${varName}`
        });
      }
    }

    return extractedVars;
  }

  /**
   * Validate a prompt template
   */
  validatePrompt(
    promptContent: string, 
    documentType: string, 
    options: PromptValidationOptions = {}
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      extractedVariables: []
    };

    // Extract variables from the prompt
    result.extractedVariables = this.extractVariables(promptContent);

    // Get expected variables for this document type
    const expectedVariables = this.documentTypeVariables[documentType] || [];

    // Basic prompt validation
    if (!promptContent.trim()) {
      result.errors.push('Prompt content cannot be empty');
      result.isValid = false;
    }

    if (promptContent.length < 50) {
      result.warnings.push('Prompt is quite short. Consider adding more detailed instructions.');
    }

    if (promptContent.length > 10000) {
      result.warnings.push('Prompt is very long. Consider breaking it into smaller, focused prompts.');
    }

    // Variable validation
    this.validateVariables(result, expectedVariables, options);

    // Content structure validation
    this.validatePromptStructure(promptContent, documentType, result);

    // AI model compatibility checks
    this.validateAICompatibility(promptContent, result);

    return result;
  }

  /**
   * Validate variables in the prompt
   */
  private validateVariables(
    result: ValidationResult, 
    expectedVariables: PromptVariable[], 
    options: PromptValidationOptions
  ): void {
    const extractedVarNames = result.extractedVariables.map(v => v.name);
    const expectedVarNames = expectedVariables.map(v => v.name);

    // Check for required variables
    const requiredVars = expectedVariables.filter(v => v.required);
    for (const requiredVar of requiredVars) {
      if (!extractedVarNames.includes(requiredVar.name)) {
        result.errors.push(`Missing required variable: {{${requiredVar.name}}}`);
        result.isValid = false;
      }
    }

    // Check for unknown variables
    if (!options.allowCustomVariables) {
      for (const varName of extractedVarNames) {
        if (!expectedVarNames.includes(varName)) {
          result.warnings.push(`Unknown variable: {{${varName}}}. Consider using standard variables.`);
        }
      }
    }

    // Check variable naming conventions
    for (const variable of result.extractedVariables) {
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(variable.name)) {
        result.errors.push(`Invalid variable name: {{${variable.name}}}. Use alphanumeric characters and underscores only.`);
        result.isValid = false;
      }

      if (variable.name.length > 50) {
        result.warnings.push(`Variable name is too long: {{${variable.name}}}`);
      }
    }

    // Provide suggestions for missing recommended variables
    const missingRecommended = expectedVariables.filter(v => 
      !v.required && !extractedVarNames.includes(v.name)
    );
    
    if (missingRecommended.length > 0) {
      result.suggestions.push(
        `Consider adding these optional variables: ${missingRecommended.map(v => `{{${v.name}}}`).join(', ')}`
      );
    }
  }

  /**
   * Validate prompt structure and content
   */
  private validatePromptStructure(
    promptContent: string, 
    documentType: string, 
    result: ValidationResult
  ): void {
    // Check for basic structure elements
    const hasInstructions = /(?:please|generate|create|analyze|provide)/i.test(promptContent);
    if (!hasInstructions) {
      result.warnings.push('Prompt should include clear instructions (e.g., "Please generate...", "Analyze...")');
    }

    // Check for context setting
    const hasContext = /(?:context|background|about|regarding)/i.test(promptContent);
    if (!hasContext) {
      result.suggestions.push('Consider adding context or background information to improve results');
    }

    // Document type specific validations
    switch (documentType) {
      case 'business':
        if (!promptContent.toLowerCase().includes('business')) {
          result.suggestions.push('Consider mentioning "business requirements" or "business analysis" explicitly');
        }
        break;
      
      case 'technical':
        if (!promptContent.toLowerCase().includes('technical')) {
          result.suggestions.push('Consider mentioning "technical specification" or "technical requirements" explicitly');
        }
        break;
      
      case 'mermaid':
        if (!promptContent.toLowerCase().includes('diagram')) {
          result.warnings.push('Mermaid prompts should explicitly mention diagram generation');
        }
        break;
    }

    // Check for output format instructions
    const hasFormat = /(?:format|structure|organize|sections)/i.test(promptContent);
    if (!hasFormat) {
      result.suggestions.push('Consider specifying the desired output format or structure');
    }
  }

  /**
   * Validate AI model compatibility
   */
  private validateAICompatibility(promptContent: string, result: ValidationResult): void {
    // Check for potential token limit issues
    const estimatedTokens = Math.ceil(promptContent.length / 4); // Rough estimate
    if (estimatedTokens > 3000) {
      result.warnings.push('Prompt may be too long for some AI models. Consider shortening or splitting.');
    }

    // Check for problematic patterns
    const problematicPatterns = [
      { pattern: /\{\{[^}]*\{\{/, message: 'Nested variable syntax detected. Use simple {{variable}} format.' },
      { pattern: /\$\{/, message: 'JavaScript template syntax detected. Use {{variable}} format instead.' },
      { pattern: /%[a-zA-Z]/, message: 'Printf-style variables detected. Use {{variable}} format instead.' }
    ];

    for (const { pattern, message } of problematicPatterns) {
      if (pattern.test(promptContent)) {
        result.errors.push(message);
        result.isValid = false;
      }
    }
  }

  /**
   * Get variable suggestions for a document type
   */
  getVariableSuggestions(documentType: string): PromptVariable[] {
    return this.documentTypeVariables[documentType] || [];
  }

  /**
   * Generate a template prompt for a document type
   */
  generateTemplate(documentType: string): string {
    const variables = this.documentTypeVariables[documentType] || [];
    const requiredVars = variables.filter(v => v.required);
    const optionalVars = variables.filter(v => !v.required);

    let template = '';

    switch (documentType) {
      case 'business':
        template = `Please analyze the following project requirements and generate a comprehensive business analysis:

Project Description: {{input}}

${optionalVars.length > 0 ? `Additional Context:
${optionalVars.map(v => `- ${v.description}: {{${v.name}}}`).join('\n')}` : ''}

Please provide:
1. Executive Summary
2. Business Objectives
3. Stakeholder Analysis
4. Requirements Analysis
5. Risk Assessment
6. Success Metrics

Format the response in clear sections with actionable insights.`;
        break;

      case 'functional':
        template = `Generate a detailed functional specification based on the following requirements:

Requirements: {{input}}

${optionalVars.length > 0 ? `Additional Information:
${optionalVars.map(v => `- ${v.description}: {{${v.name}}}`).join('\n')}` : ''}

Please include:
1. System Overview
2. Functional Requirements
3. User Stories
4. System Interactions
5. Data Requirements
6. Business Rules

Structure the response with clear sections and detailed specifications.`;
        break;

      case 'technical':
        template = `Create a comprehensive technical specification for the following system:

System Requirements: {{input}}

${optionalVars.length > 0 ? `Technical Context:
${optionalVars.map(v => `- ${v.description}: {{${v.name}}}`).join('\n')}` : ''}

Please provide:
1. System Architecture
2. Technical Requirements
3. API Specifications
4. Database Design
5. Security Considerations
6. Performance Requirements
7. Implementation Guidelines

Format with technical details and implementation guidance.`;
        break;

      case 'ux':
        template = `Design a comprehensive UX specification for the following project:

Project Requirements: {{input}}

${optionalVars.length > 0 ? `UX Context:
${optionalVars.map(v => `- ${v.description}: {{${v.name}}}`).join('\n')}` : ''}

Please include:
1. User Research Summary
2. User Personas
3. User Journey Maps
4. Information Architecture
5. Wireframes Description
6. Interaction Design
7. Accessibility Guidelines

Focus on user-centered design principles and usability.`;
        break;

      case 'mermaid':
        template = `Generate Mermaid diagrams to visualize the following system:

System Description: {{input}}

${optionalVars.length > 0 ? `Diagram Preferences:
${optionalVars.map(v => `- ${v.description}: {{${v.name}}}`).join('\n')}` : ''}

Please create appropriate Mermaid diagrams including:
1. System Flow Diagram
2. Component Relationships
3. User Interaction Flow
4. Data Flow (if applicable)

Use proper Mermaid syntax and ensure diagrams are clear and informative.`;
        break;

      default:
        template = `Please analyze and process the following input:

Input: {{input}}

Provide a comprehensive analysis with clear structure and actionable insights.`;
    }

    return template;
  }

  /**
   * Validate variable values at runtime
   */
  validateVariableValues(variables: Record<string, any>, documentType: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      extractedVariables: []
    };

    const expectedVariables = this.documentTypeVariables[documentType] || [];

    for (const expectedVar of expectedVariables) {
      const value = variables[expectedVar.name];

      // Check required variables
      if (expectedVar.required && (value === undefined || value === null || value === '')) {
        result.errors.push(`Required variable '${expectedVar.name}' is missing or empty`);
        result.isValid = false;
        continue;
      }

      // Skip validation if variable is not provided and not required
      if (!expectedVar.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      if (!this.validateVariableType(value, expectedVar.type)) {
        result.errors.push(`Variable '${expectedVar.name}' should be of type ${expectedVar.type}`);
        result.isValid = false;
        continue;
      }

      // Custom validation rules
      if (expectedVar.validation) {
        const validationErrors = this.validateVariableConstraints(value, expectedVar.validation, expectedVar.name);
        result.errors.push(...validationErrors);
        if (validationErrors.length > 0) {
          result.isValid = false;
        }
      }
    }

    return result;
  }

  private validateVariableType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  private validateVariableConstraints(
    value: any, 
    validation: PromptVariable['validation'], 
    varName: string
  ): string[] {
    const errors: string[] = [];

    if (!validation) return errors;

    // String validations
    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        errors.push(`Variable '${varName}' must be at least ${validation.minLength} characters long`);
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push(`Variable '${varName}' must be no more than ${validation.maxLength} characters long`);
      }
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        errors.push(`Variable '${varName}' does not match the required pattern`);
      }
      if (validation.options && !validation.options.includes(value)) {
        errors.push(`Variable '${varName}' must be one of: ${validation.options.join(', ')}`);
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        errors.push(`Variable '${varName}' must be at least ${validation.min}`);
      }
      if (validation.max !== undefined && value > validation.max) {
        errors.push(`Variable '${varName}' must be no more than ${validation.max}`);
      }
    }

    return errors;
  }
}

// Export singleton instance
export const promptValidationService = new PromptValidationService(); 