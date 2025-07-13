import { ClaudeService } from './claude-service';
import { EnhancedRepositoryAnalyzer, RepositoryAnalysis } from './enhanced-repository-analyzer';
import { supabase } from './supabase/server';

export interface EnhancedGenerationRequest {
  specification: any;
  repositoryUrl: string;
  taskType: 'feature' | 'enhancement' | 'refactor' | 'component' | 'api' | 'fix';
  generateTests?: boolean;
  followPatterns?: boolean;
  targetDirectory?: string;
  includeDocumentation?: boolean;
  optimizeFor?: 'performance' | 'maintainability' | 'scalability' | 'simplicity';
}

export interface EnhancedGenerationResult {
  id: string;
  implementation: GeneratedImplementation;
  validation: ValidationResult;
  repoContext: RepositoryContext;
  similarImplementations: SimilarImplementation[];
  patternCompliance: PatternCompliance;
  testCoverage?: TestCoverage;
  documentation?: GeneratedDocumentation;
  qualityScore: number;
  suggestions: CodeSuggestion[];
  createdAt: Date;
}

export interface GeneratedImplementation {
  files_to_create: GeneratedFile[];
  files_to_modify: ModifiedFile[];
  description: string;
  type: string;
  validation_steps: string[];
  dependencies: string[];
  configuration_changes: ConfigurationChange[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  description: string;
  language: string;
  type: 'component' | 'service' | 'test' | 'config' | 'documentation' | 'other';
  dependencies: string[];
  exports: string[];
}

export interface ModifiedFile {
  path: string;
  changes: string;
  description: string;
  startLine?: number;
  endLine?: number;
  changeType: 'add' | 'modify' | 'remove';
  affectedFunctions: string[];
}

export interface ConfigurationChange {
  file: string;
  type: 'package_json' | 'tsconfig' | 'webpack' | 'env' | 'other';
  changes: Record<string, any>;
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  hasIssues: boolean;
  issues: ValidationIssue[];
  score: number;
  patternCompliance: number;
  recommendations: string[];
}

export interface ValidationIssue {
  type: 'pattern' | 'syntax' | 'convention' | 'dependency' | 'structure';
  severity: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  line?: number;
  suggestion?: string;
}

export interface RepositoryContext {
  framework: string;
  patterns: any;
  conventions: any;
  architecture: string;
  testingFramework?: string;
  stylingApproach?: string;
  stateManagement?: string;
}

export interface SimilarImplementation {
  path: string;
  pattern: string;
  example: string;
  similarity: number;
  language: string;
  type: 'component' | 'service' | 'function' | 'class' | 'hook';
  extractedPatterns: ExtractedPattern[];
}

export interface ExtractedPattern {
  name: string;
  type: 'naming' | 'structure' | 'imports' | 'exports' | 'styling' | 'testing';
  pattern: string;
  example: string;
  confidence: number;
}

export interface PatternCompliance {
  overall: number;
  naming: number;
  structure: number;
  imports: number;
  exports: number;
  testing: number;
  styling: number;
  violations: PatternViolation[];
}

export interface PatternViolation {
  type: string;
  description: string;
  file: string;
  expected: string;
  actual: string;
  severity: 'high' | 'medium' | 'low';
  autoFixable: boolean;
}

export interface TestCoverage {
  files: TestFile[];
  coverage: number;
  testTypes: string[];
  framework: string;
  missingTests: string[];
}

export interface TestFile {
  path: string;
  content: string;
  type: 'unit' | 'integration' | 'e2e';
  coverage: string[];
  framework: string;
}

export interface GeneratedDocumentation {
  readme: string;
  apiDocs: string;
  examples: DocumentationExample[];
  changelog: string;
}

export interface DocumentationExample {
  title: string;
  code: string;
  description: string;
  language: string;
}

export interface CodeSuggestion {
  type: 'improvement' | 'optimization' | 'refactor' | 'pattern' | 'security';
  description: string;
  file: string;
  line?: number;
  before?: string;
  after?: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
}

export interface GenerationTemplate {
  name: string;
  type: string;
  framework: string;
  template: string;
  variables: TemplateVariable[];
  patterns: string[];
}

export interface TemplateVariable {
  name: string;
  type: string;
  required: boolean;
  default?: any;
  description: string;
}

export class ContextAwareCodeGenerator {
  private repositoryAnalyzer: EnhancedRepositoryAnalyzer;
  private claude: ClaudeService;
  private templates: Map<string, GenerationTemplate> = new Map();

  constructor(repositoryAnalyzer: EnhancedRepositoryAnalyzer, claude: ClaudeService) {
    this.repositoryAnalyzer = repositoryAnalyzer;
    this.claude = claude;
    this.loadTemplates();
  }

  async generateFromSpecification(
    request: EnhancedGenerationRequest
  ): Promise<EnhancedGenerationResult> {
    
    console.log(`Starting context-aware code generation for: ${request.specification.title || 'untitled'}`);
    
    try {
      // 1. Get deep repository analysis
      const repoAnalysis = await this.repositoryAnalyzer.analyzeRepositoryDeep(request.repositoryUrl);
      
      // 2. Find similar existing implementations
      const similarImplementations = await this.findSimilarImplementations(
        request.specification,
        repoAnalysis
      );
      
      // 3. Generate with full context
      const generation = await this.generateWithContext(
        request,
        repoAnalysis,
        similarImplementations
      );
      
      // 4. Validate against existing patterns
      const validation = await this.validateGeneration(generation, repoAnalysis);
      
      // 5. Auto-fix any pattern violations
      if (validation.hasIssues && request.followPatterns !== false) {
        generation.implementation = await this.fixPatternViolations(
          generation.implementation,
          validation.issues,
          repoAnalysis
        );
      }
      
      // 6. Generate tests if requested
      let testCoverage: TestCoverage | undefined;
      if (request.generateTests) {
        testCoverage = await this.generateTests(generation.implementation, repoAnalysis);
      }
      
      // 7. Generate documentation if requested
      let documentation: GeneratedDocumentation | undefined;
      if (request.includeDocumentation) {
        documentation = await this.generateDocumentation(generation.implementation, repoAnalysis);
      }
      
      // 8. Calculate quality score and suggestions
      const qualityScore = this.calculateQualityScore(validation, generation.implementation);
      const suggestions = await this.generateSuggestions(generation.implementation, repoAnalysis);
      
      // 9. Extract pattern compliance
      const patternCompliance = this.calculatePatternCompliance(validation, similarImplementations);
      
      const result: EnhancedGenerationResult = {
        id: this.generateResultId(),
        implementation: generation.implementation,
        validation,
        repoContext: {
          framework: repoAnalysis.architecture.framework,
          patterns: repoAnalysis.patterns,
          conventions: repoAnalysis.architecture.conventions,
          architecture: repoAnalysis.architecture.framework,
          testingFramework: repoAnalysis.architecture.testFramework,
          stylingApproach: repoAnalysis.architecture.styling,
          stateManagement: repoAnalysis.architecture.stateManagement
        },
        similarImplementations,
        patternCompliance,
        testCoverage,
        documentation,
        qualityScore,
        suggestions,
        createdAt: new Date()
      };
      
      // 10. Store the result
      await this.storeGenerationResult(result);
      
      console.log(`Context-aware code generation completed with quality score: ${qualityScore}`);
      return result;
      
    } catch (error) {
      console.error('Error in context-aware code generation:', error);
      throw new Error(`Failed to generate code: ${error.message}`);
    }
  }

  private async generateWithContext(
    request: EnhancedGenerationRequest,
    repoAnalysis: RepositoryAnalysis,
    similarImplementations: SimilarImplementation[]
  ): Promise<{ implementation: GeneratedImplementation }> {
    
    const prompt = `
      You are an expert software engineer generating code that seamlessly integrates with an existing codebase.
      
      TASK SPECIFICATION:
      ${JSON.stringify(request.specification, null, 2)}
      
      TASK TYPE: ${request.taskType}
      TARGET DIRECTORY: ${request.targetDirectory || 'auto-detect'}
      OPTIMIZE FOR: ${request.optimizeFor || 'maintainability'}
      
      REPOSITORY CONTEXT:
      Framework: ${repoAnalysis.architecture.framework}
      Language: ${repoAnalysis.primaryLanguage}
      Build Tool: ${repoAnalysis.architecture.buildTool}
      Test Framework: ${repoAnalysis.architecture.testFramework}
      Styling: ${repoAnalysis.architecture.styling}
      State Management: ${repoAnalysis.architecture.stateManagement}
      
      CODE PATTERNS TO FOLLOW:
      Naming Conventions: ${JSON.stringify(repoAnalysis.patterns.naming, null, 2)}
      File Organization: ${JSON.stringify(repoAnalysis.patterns.fileOrganization, null, 2)}
      Import Patterns: ${JSON.stringify(repoAnalysis.patterns.imports.slice(0, 5), null, 2)}
      Export Patterns: ${JSON.stringify(repoAnalysis.patterns.exports.slice(0, 5), null, 2)}
      Function Patterns: ${JSON.stringify(repoAnalysis.patterns.functions.slice(0, 3), null, 2)}
      Component Patterns: ${JSON.stringify(repoAnalysis.patterns.components.slice(0, 3), null, 2)}
      Error Handling: ${JSON.stringify(repoAnalysis.patterns.errorHandling.slice(0, 3), null, 2)}
      
      SIMILAR IMPLEMENTATIONS IN CODEBASE:
      ${similarImplementations.map(impl => `
        File: ${impl.path}
        Type: ${impl.type}
        Pattern: ${impl.pattern}
        Similarity: ${Math.round(impl.similarity * 100)}%
        
        Example Code:
        \`\`\`${impl.language}
        ${impl.example}
        \`\`\`
        
        Extracted Patterns:
        ${impl.extractedPatterns.map(p => `- ${p.name}: ${p.pattern}`).join('\n')}
      `).join('\n\n')}
      
      DIRECTORY STRUCTURE:
      ${this.getDirectoryStructure(repoAnalysis.structure)}
      
      REQUIREMENTS:
      1. Follow EXACTLY the patterns shown in similar implementations
      2. Use the same naming conventions for files, functions, variables, classes
      3. Place files in appropriate directories based on existing structure
      4. Include proper imports following the project's import patterns
      5. Add TypeScript types if the project uses TypeScript
      6. Include error handling following project patterns
      7. Add appropriate comments/documentation matching project style
      8. Include proper exports following project patterns
      9. Consider performance optimizations if optimizeFor is 'performance'
      10. Ensure scalability if optimizeFor is 'scalability'
      11. Keep it simple if optimizeFor is 'simplicity'
      
      CRITICAL: The generated code MUST look like it was written by the same developer who wrote the similar implementations.
      
      Return JSON with this exact structure:
      {
        "implementation": {
          "files_to_create": [
            {
              "path": "src/components/ExampleComponent.tsx",
              "content": "complete file content",
              "description": "What this file does",
              "language": "typescript",
              "type": "component",
              "dependencies": ["react", "lodash"],
              "exports": ["ExampleComponent", "ExampleProps"]
            }
          ],
          "files_to_modify": [
            {
              "path": "src/index.ts",
              "changes": "export { ExampleComponent } from './components/ExampleComponent';",
              "description": "Export the new component",
              "changeType": "add",
              "affectedFunctions": []
            }
          ],
          "description": "Brief description of the implementation",
          "type": "${request.taskType}",
          "validation_steps": ["Step 1", "Step 2"],
          "dependencies": ["new-package@1.0.0"],
          "configuration_changes": [
            {
              "file": "package.json",
              "type": "package_json",
              "changes": {"dependencies": {"new-package": "^1.0.0"}},
              "description": "Add required dependency"
            }
          ]
        }
      }
    `;
    
    try {
      const response = await this.claude.generateCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating code with context:', error);
      throw new Error(`Failed to generate code: ${error.message}`);
    }
  }

  private async findSimilarImplementations(
    specification: any,
    repoAnalysis: RepositoryAnalysis
  ): Promise<SimilarImplementation[]> {
    
    // Extract search terms from specification
    const searchQuery = this.extractSearchTerms(specification);
    
    // Use enhanced search to find similar code
    const relevantFiles = await this.repositoryAnalyzer.findRelevantFiles(
      searchQuery,
      repoAnalysis,
      10
    );
    
    const implementations: SimilarImplementation[] = [];
    
    for (const file of relevantFiles) {
      const content = await this.getFileContent(file.path);
      const pattern = await this.extractPattern(content, specification);
      
      if (pattern.similarity > 0.4) {
        implementations.push({
          path: file.path,
          pattern: pattern.description,
          example: pattern.relevantCode,
          similarity: pattern.similarity,
          language: this.detectLanguage(file.path),
          type: this.detectFileType(file.path, content),
          extractedPatterns: pattern.extractedPatterns
        });
      }
    }
    
    // Sort by similarity and return top results
    return implementations
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  private async extractPattern(
    content: string,
    specification: any
  ): Promise<{
    description: string;
    relevantCode: string;
    similarity: number;
    extractedPatterns: ExtractedPattern[];
  }> {
    
    const prompt = `
      Analyze this code and extract patterns that might be relevant to the specification.
      
      SPECIFICATION: ${JSON.stringify(specification, null, 2)}
      
      CODE:
      \`\`\`
      ${content}
      \`\`\`
      
      Analyze and extract:
      1. Naming patterns for functions, variables, classes
      2. Structure patterns (how code is organized)
      3. Import/export patterns
      4. Styling patterns (if applicable)
      5. Testing patterns (if applicable)
      6. Error handling patterns
      
      Calculate similarity to the specification (0-1 scale).
      Extract the most relevant code snippets.
      
      Return JSON:
      {
        "description": "Brief description of the pattern",
        "relevantCode": "Most relevant code snippet (max 50 lines)",
        "similarity": 0.8,
        "extractedPatterns": [
          {
            "name": "Component Structure",
            "type": "structure",
            "pattern": "Functional component with hooks",
            "example": "const Component = () => { ... }",
            "confidence": 0.9
          }
        ]
      }
    `;
    
    try {
      const response = await this.claude.analyzeCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error extracting pattern:', error);
      return {
        description: 'Pattern extraction failed',
        relevantCode: content.slice(0, 500),
        similarity: 0.1,
        extractedPatterns: []
      };
    }
  }

  private async validateGeneration(
    generation: { implementation: GeneratedImplementation },
    repoAnalysis: RepositoryAnalysis
  ): Promise<ValidationResult> {
    
    const prompt = `
      Validate this generated code against the repository patterns and conventions.
      
      GENERATED CODE:
      ${JSON.stringify(generation.implementation, null, 2)}
      
      REPOSITORY PATTERNS:
      ${JSON.stringify(repoAnalysis.patterns, null, 2)}
      
      ARCHITECTURE CONVENTIONS:
      ${JSON.stringify(repoAnalysis.architecture.conventions, null, 2)}
      
      Check for:
      1. Naming convention compliance
      2. File organization compliance
      3. Import/export pattern compliance
      4. Code structure compliance
      5. Error handling pattern compliance
      6. Testing pattern compliance (if tests included)
      7. Styling pattern compliance (if applicable)
      8. Syntax errors
      9. Dependency issues
      10. Best practices compliance
      
      Rate each area (0-1 scale) and provide specific issues.
      
      Return JSON:
      {
        "isValid": true,
        "hasIssues": false,
        "issues": [
          {
            "type": "pattern",
            "severity": "warning",
            "message": "Function name should be camelCase",
            "file": "src/component.tsx",
            "line": 10,
            "suggestion": "Change myFunction to myFunction"
          }
        ],
        "score": 0.85,
        "patternCompliance": 0.90,
        "recommendations": ["Use consistent naming", "Add error handling"]
      }
    `;
    
    try {
      const response = await this.claude.analyzeCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error validating generation:', error);
      return {
        isValid: false,
        hasIssues: true,
        issues: [{
          type: 'pattern',
          severity: 'error',
          message: 'Validation failed',
          file: 'unknown',
          suggestion: 'Manual review required'
        }],
        score: 0.5,
        patternCompliance: 0.5,
        recommendations: ['Manual review required']
      };
    }
  }

  private async fixPatternViolations(
    implementation: GeneratedImplementation,
    issues: ValidationIssue[],
    repoAnalysis: RepositoryAnalysis
  ): Promise<GeneratedImplementation> {
    
    const fixableIssues = issues.filter(issue => 
      issue.type === 'pattern' && issue.severity !== 'error'
    );
    
    if (fixableIssues.length === 0) {
      return implementation;
    }
    
    const prompt = `
      Fix these pattern violations in the generated code:
      
      ORIGINAL CODE:
      ${JSON.stringify(implementation, null, 2)}
      
      ISSUES TO FIX:
      ${JSON.stringify(fixableIssues, null, 2)}
      
      REPOSITORY PATTERNS:
      ${JSON.stringify(repoAnalysis.patterns, null, 2)}
      
      Fix the issues while maintaining the functionality.
      Return the corrected implementation in the same JSON format.
    `;
    
    try {
      const response = await this.claude.generateCode(prompt);
      return JSON.parse(response).implementation;
    } catch (error) {
      console.error('Error fixing pattern violations:', error);
      return implementation;
    }
  }

  private async generateTests(
    implementation: GeneratedImplementation,
    repoAnalysis: RepositoryAnalysis
  ): Promise<TestCoverage> {
    
    const testFramework = repoAnalysis.architecture.testFramework || 'Jest';
    const testPatterns = repoAnalysis.patterns.testing || [];
    
    const prompt = `
      Generate comprehensive tests for this implementation:
      
      IMPLEMENTATION:
      ${JSON.stringify(implementation, null, 2)}
      
      TEST FRAMEWORK: ${testFramework}
      EXISTING TEST PATTERNS: ${JSON.stringify(testPatterns, null, 2)}
      
      Generate tests including:
      1. Unit tests for all functions/methods
      2. Integration tests for components
      3. Edge case tests
      4. Error scenario tests
      5. Performance tests (if applicable)
      
      Follow the existing test patterns and naming conventions.
      
      Return JSON:
      {
        "files": [
          {
            "path": "src/__tests__/component.test.tsx",
            "content": "complete test file content",
            "type": "unit",
            "coverage": ["ComponentName", "functionName"],
            "framework": "Jest"
          }
        ],
        "coverage": 0.95,
        "testTypes": ["unit", "integration"],
        "framework": "Jest",
        "missingTests": ["edge case for X"]
      }
    `;
    
    try {
      const response = await this.claude.generateCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating tests:', error);
      return {
        files: [],
        coverage: 0,
        testTypes: [],
        framework: testFramework,
        missingTests: []
      };
    }
  }

  private async generateDocumentation(
    implementation: GeneratedImplementation,
    repoAnalysis: RepositoryAnalysis
  ): Promise<GeneratedDocumentation> {
    
    const prompt = `
      Generate comprehensive documentation for this implementation:
      
      IMPLEMENTATION:
      ${JSON.stringify(implementation, null, 2)}
      
      FRAMEWORK: ${repoAnalysis.architecture.framework}
      
      Generate:
      1. README with setup, usage, and examples
      2. API documentation for public interfaces
      3. Code examples with explanations
      4. Changelog entry
      
      Follow the project's documentation style.
      
      Return JSON:
      {
        "readme": "# Component Name\n\nDescription...",
        "apiDocs": "## API\n\n### Methods...",
        "examples": [
          {
            "title": "Basic Usage",
            "code": "const example = ...",
            "description": "How to use...",
            "language": "typescript"
          }
        ],
        "changelog": "## [1.0.0] - 2024-01-01\n### Added\n- New component..."
      }
    `;
    
    try {
      const response = await this.claude.generateCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating documentation:', error);
      return {
        readme: '# Documentation\n\nDocumentation generation failed.',
        apiDocs: '# API Documentation\n\nAPI documentation generation failed.',
        examples: [],
        changelog: '# Changelog\n\nChangelog generation failed.'
      };
    }
  }

  private async generateSuggestions(
    implementation: GeneratedImplementation,
    repoAnalysis: RepositoryAnalysis
  ): Promise<CodeSuggestion[]> {
    
    const prompt = `
      Analyze this implementation and suggest improvements:
      
      IMPLEMENTATION:
      ${JSON.stringify(implementation, null, 2)}
      
      REPOSITORY CONTEXT:
      ${JSON.stringify(repoAnalysis.architecture, null, 2)}
      
      Suggest improvements for:
      1. Performance optimizations
      2. Code structure improvements
      3. Security enhancements
      4. Maintainability improvements
      5. Pattern consistency
      6. Error handling improvements
      7. Testing improvements
      
      Return JSON array:
      [
        {
          "type": "optimization",
          "description": "Use useMemo for expensive calculations",
          "file": "src/component.tsx",
          "line": 25,
          "before": "const result = heavyCalculation(data)",
          "after": "const result = useMemo(() => heavyCalculation(data), [data])",
          "impact": "medium",
          "effort": "low"
        }
      ]
    `;
    
    try {
      const response = await this.claude.analyzeCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }

  // Helper methods
  private extractSearchTerms(specification: any): string {
    const terms = [];
    
    if (specification.title) terms.push(specification.title);
    if (specification.description) terms.push(specification.description);
    if (specification.component) terms.push(specification.component);
    if (specification.functionality) terms.push(specification.functionality);
    if (specification.features) terms.push(...specification.features);
    
    return terms.join(' ').toLowerCase();
  }

  private async getFileContent(filePath: string): Promise<string> {
    // This would integrate with your GitHub service
    // For now, returning mock content
    return `// Mock content for ${filePath}`;
  }

  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rb': 'ruby',
      'php': 'php',
      'swift': 'swift',
      'kt': 'kotlin'
    };
    
    return languageMap[ext || ''] || 'text';
  }

  private detectFileType(filePath: string, content: string): 'component' | 'service' | 'function' | 'class' | 'hook' {
    const fileName = filePath.toLowerCase();
    
    if (fileName.includes('component') || fileName.includes('.tsx') || fileName.includes('.jsx')) {
      return 'component';
    }
    if (fileName.includes('service') || fileName.includes('api')) {
      return 'service';
    }
    if (fileName.includes('hook') || fileName.startsWith('use')) {
      return 'hook';
    }
    if (content.includes('class ')) {
      return 'class';
    }
    
    return 'function';
  }

  private getDirectoryStructure(structure: any): string {
    // This would format the directory structure for the prompt
    return JSON.stringify(structure, null, 2);
  }

  private calculateQualityScore(validation: ValidationResult, implementation: GeneratedImplementation): number {
    let score = validation.score;
    
    // Adjust score based on implementation completeness
    if (implementation.files_to_create.length > 0) score += 0.1;
    if (implementation.validation_steps.length > 0) score += 0.05;
    if (implementation.dependencies.length > 0) score += 0.05;
    
    return Math.min(score, 1.0);
  }

  private calculatePatternCompliance(
    validation: ValidationResult,
    similarImplementations: SimilarImplementation[]
  ): PatternCompliance {
    const avgSimilarity = similarImplementations.length > 0 
      ? similarImplementations.reduce((sum, impl) => sum + impl.similarity, 0) / similarImplementations.length
      : 0.5;
    
    return {
      overall: (validation.patternCompliance + avgSimilarity) / 2,
      naming: validation.patternCompliance,
      structure: validation.patternCompliance,
      imports: validation.patternCompliance,
      exports: validation.patternCompliance,
      testing: validation.patternCompliance,
      styling: validation.patternCompliance,
      violations: validation.issues.map(issue => ({
        type: issue.type,
        description: issue.message,
        file: issue.file,
        expected: issue.suggestion || 'See repository patterns',
        actual: 'Generated code',
        severity: issue.severity === 'error' ? 'high' : issue.severity === 'warning' ? 'medium' : 'low',
        autoFixable: issue.type === 'pattern'
      }))
    };
  }

  private async storeGenerationResult(result: EnhancedGenerationResult): Promise<void> {
    try {
      await supabase
        .from('code_generation_results')
        .insert({
          id: result.id,
          implementation_data: result,
          quality_score: result.qualityScore,
          pattern_compliance: result.patternCompliance.overall,
          created_at: result.createdAt.toISOString()
        });
    } catch (error) {
      console.error('Error storing generation result:', error);
    }
  }

  private generateResultId(): string {
    return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadTemplates(): void {
    // Load common templates for different frameworks
    // This would be populated with actual templates
    this.templates.set('react-component', {
      name: 'React Component',
      type: 'component',
      framework: 'React',
      template: `import React from 'react';

interface {{componentName}}Props {
  // Props go here
}

export const {{componentName}}: React.FC<{{componentName}}Props> = (props) => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};`,
      variables: [
        { name: 'componentName', type: 'string', required: true, description: 'Name of the component' }
      ],
      patterns: ['PascalCase', 'TypeScript', 'Functional Component']
    });
  }

  // Public methods for retrieving stored results
  async getGenerationResult(resultId: string): Promise<EnhancedGenerationResult | null> {
    try {
      const { data, error } = await supabase
        .from('code_generation_results')
        .select('implementation_data')
        .eq('id', resultId)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      return data.implementation_data;
    } catch (error) {
      console.error('Error retrieving generation result:', error);
      return null;
    }
  }

  async listGenerationResults(limit: number = 20): Promise<EnhancedGenerationResult[]> {
    try {
      const { data, error } = await supabase
        .from('code_generation_results')
        .select('implementation_data')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error || !data) {
        return [];
      }
      
      return data.map(item => item.implementation_data);
    } catch (error) {
      console.error('Error listing generation results:', error);
      return [];
    }
  }
} 