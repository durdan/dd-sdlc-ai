import { ClaudeCodeService, AgenticCodeRequest, AgenticCodeResult } from './claude-service'
import { RepositoryAnalysis } from './repository-analyzer'

export interface CodeSpecification {
  description: string
  type: 'feature' | 'component' | 'service' | 'api' | 'test' | 'fix'
  requirements: string[]
  constraints?: string[]
  targetFiles?: string[]
  dependencies?: string[]
  testRequirements?: string[]
}

export interface GeneratedCode {
  specification: CodeSpecification
  repository: RepositoryAnalysis
  implementation: {
    files_to_create: Array<{
      path: string
      content: string
      description: string
      language: string
    }>
    files_to_modify: Array<{
      path: string
      changes: string
      description: string
      reasoning: string
    }>
    files_to_delete: string[]
  }
  tests: {
    unit_tests: Array<{
      file_path: string
      test_content: string
      description: string
      framework: string
    }>
    integration_tests: Array<{
      file_path: string
      test_content: string
      description: string
      scope: string
    }>
  }
  documentation: {
    changes_needed: string[]
    new_docs: Array<{
      file_path: string
      content: string
      type: 'readme' | 'api' | 'guide' | 'changelog'
    }>
  }
  validation_steps: string[]
  reasoning: string
  estimatedComplexity: 'low' | 'medium' | 'high'
  riskAssessment: {
    level: 'low' | 'medium' | 'high'
    concerns: string[]
    mitigations: string[]
  }
}

export class CodeGenerator {
  private claudeService: ClaudeCodeService

  constructor(claudeService: ClaudeCodeService) {
    this.claudeService = claudeService
  }

  /**
   * Generate code from specification with repository context
   */
  async generateFromSpecification(
    specification: CodeSpecification,
    repository: RepositoryAnalysis
  ): Promise<GeneratedCode> {
    console.log(`🔧 Generating code for: ${specification.description}`)
    console.log(`📂 Repository: ${repository.repoUrl}`)
    console.log(`🏗️ Framework: ${repository.framework}`)

    try {
      // Build context-aware prompt
      const contextAwarePrompt = this.buildContextAwarePrompt(specification, repository)
      
      // Create agentic request
      const agenticRequest: AgenticCodeRequest = {
        task_type: this.mapSpecificationType(specification.type),
        codebase_context: this.buildCodebaseContext(repository),
        specific_request: contextAwarePrompt,
        requirements: specification.requirements.join('\n'),
        constraints: specification.constraints
      }

      // Execute Claude generation
      console.log('🤖 Executing Claude code generation...')
      const claudeResult = await this.claudeService.generateAgenticCode(agenticRequest)

      // Enhance and validate generated code
      const generatedCode = this.enhanceGeneratedCode(
        specification,
        repository,
        claudeResult
      )

      console.log(`✅ Code generation completed for: ${specification.description}`)
      return generatedCode

    } catch (error) {
      console.error(`❌ Code generation failed:`, error)
      throw new Error(`Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate code with existing file contents for context
   */
  async generateWithFileContext(
    specification: CodeSpecification,
    repository: RepositoryAnalysis,
    existingFiles: Record<string, string>
  ): Promise<GeneratedCode> {
    console.log(`🔧 Generating code with file context: ${specification.description}`)

    const contextAwarePrompt = this.buildContextAwarePrompt(specification, repository)
    
    const agenticRequest: AgenticCodeRequest = {
      task_type: this.mapSpecificationType(specification.type),
      codebase_context: this.buildCodebaseContext(repository),
      specific_request: contextAwarePrompt,
      file_contents: existingFiles,
      requirements: specification.requirements.join('\n'),
      constraints: specification.constraints
    }

    const claudeResult = await this.claudeService.generateAgenticCode(agenticRequest)
    return this.enhanceGeneratedCode(specification, repository, claudeResult)
  }

  /**
   * Validate generated code against repository patterns
   */
  async validateGeneratedCode(
    generatedCode: GeneratedCode,
    repository: RepositoryAnalysis
  ): Promise<{
    isValid: boolean
    issues: string[]
    suggestions: string[]
  }> {
    console.log('🔍 Validating generated code against repository patterns...')

    const validationPrompt = `
Validate this generated code against the repository patterns and conventions:

REPOSITORY PATTERNS:
${JSON.stringify(repository.patterns, null, 2)}

GENERATED FILES TO CREATE:
${generatedCode.implementation.files_to_create.map(f => 
  `${f.path}:\n${f.content.slice(0, 500)}...`
).join('\n\n')}

GENERATED MODIFICATIONS:
${generatedCode.implementation.files_to_modify.map(f => 
  `${f.path}:\n${f.changes.slice(0, 500)}...`
).join('\n\n')}

Please analyze for:
1. Naming convention consistency
2. Code style alignment
3. Architecture pattern adherence
4. Import/dependency consistency
5. Security considerations

Return validation results as JSON:
{
  "isValid": boolean,
  "issues": ["list of specific issues found"],
  "suggestions": ["list of improvement suggestions"]
}
`

    try {
      const result = await this.claudeService.analyzeCode({
        codeContent: validationPrompt,
        analysisType: 'code_review',
        context: 'Generated code validation'
      })

      // Parse validation results
      return this.parseValidationResults(result.analysis)
    } catch (error) {
      console.warn('Code validation failed, using basic validation')
      return this.basicValidation(generatedCode, repository)
    }
  }

  /**
   * Build context-aware prompt that includes repository information
   */
  private buildContextAwarePrompt(
    specification: CodeSpecification,
    repository: RepositoryAnalysis
  ): string {
    return `
Generate code for the following specification in the context of this repository:

SPECIFICATION:
${specification.description}

TYPE: ${specification.type}

REQUIREMENTS:
${specification.requirements.map(req => `- ${req}`).join('\n')}

${specification.constraints ? `CONSTRAINTS:
${specification.constraints.map(constraint => `- ${constraint}`).join('\n')}` : ''}

REPOSITORY CONTEXT:
- Framework: ${repository.framework}
- Primary Language: ${repository.primaryLanguage}
- Architecture: ${repository.patterns.architecture.join(', ')}
- Patterns: ${repository.patterns.patterns.join(', ')}
- Technologies: ${repository.patterns.technologies.join(', ')}

CODING CONVENTIONS:
- Naming: ${repository.patterns.conventions.naming}
- Structure: ${repository.patterns.conventions.structure}
- Imports: ${repository.patterns.conventions.imports}

EXISTING FILE STRUCTURE:
${this.getRelevantFileStructure(repository)}

DEPENDENCIES IN USE:
${this.getDependencySummary(repository)}

Please generate code that:
1. Follows the established patterns and conventions
2. Integrates seamlessly with existing code
3. Maintains consistency with the project structure
4. Uses appropriate dependencies and imports
5. Includes proper error handling and validation
6. Follows security best practices
7. Is well-documented and testable

${specification.testRequirements ? `
TEST REQUIREMENTS:
${specification.testRequirements.map(req => `- ${req}`).join('\n')}
` : ''}
`
  }

  /**
   * Build comprehensive codebase context
   */
  private buildCodebaseContext(repository: RepositoryAnalysis): string {
    return `
Repository: ${repository.repoUrl}
Framework: ${repository.framework}
Language: ${repository.primaryLanguage}
Files: ${repository.fileCount}

Summary: ${repository.summary}

Architecture: ${repository.patterns.architecture.join(', ')}
Patterns: ${repository.patterns.patterns.join(', ')}
Technologies: ${repository.patterns.technologies.join(', ')}

File Categories:
- Code files: ${repository.codeFiles.length}
- Test files: ${repository.testFiles.length}
- Config files: ${repository.configFiles.length}

Key Dependencies:
${Object.entries(repository.dependencies.imports)
  .slice(0, 10)
  .map(([file, deps]) => `${file}: ${deps.join(', ')}`)
  .join('\n')}
`
  }

  /**
   * Map specification type to Claude task type
   */
  private mapSpecificationType(type: CodeSpecification['type']): AgenticCodeRequest['task_type'] {
    switch (type) {
      case 'fix': return 'bug_fix'
      case 'test': return 'test_generation'
      case 'feature':
      case 'component':
      case 'service':
      case 'api':
      default:
        return 'feature_implementation'
    }
  }

  /**
   * Enhance Claude's generated code with additional context and validation
   */
  private enhanceGeneratedCode(
    specification: CodeSpecification,
    repository: RepositoryAnalysis,
    claudeResult: AgenticCodeResult
  ): GeneratedCode {
    // Add language detection to generated files
    const enhancedFilesToCreate = claudeResult.implementation.files_to_create.map(file => ({
      ...file,
      language: this.detectLanguage(file.path)
    }))

    // Add framework information to tests
    const enhancedUnitTests = claudeResult.tests.unit_tests.map(test => ({
      ...test,
      framework: this.detectTestFramework(repository, test.file_path)
    }))

    const enhancedIntegrationTests = claudeResult.tests.integration_tests.map(test => ({
      ...test,
      scope: this.determineTestScope(test.file_path)
    }))

    // Enhance documentation with types
    const enhancedDocs = claudeResult.documentation.new_docs.map(doc => ({
      ...doc,
      type: this.determineDocType(doc.file_path) as 'readme' | 'api' | 'guide' | 'changelog'
    }))

    // Calculate complexity and risk
    const estimatedComplexity = this.calculateComplexity(specification, claudeResult)
    const riskAssessment = this.assessRisk(specification, repository, claudeResult)

    return {
      specification,
      repository,
      implementation: {
        files_to_create: enhancedFilesToCreate,
        files_to_modify: claudeResult.implementation.files_to_modify.map(file => ({
          ...file,
          reasoning: `Modification needed for ${specification.type}: ${file.description}`
        })),
        files_to_delete: claudeResult.implementation.files_to_delete
      },
      tests: {
        unit_tests: enhancedUnitTests,
        integration_tests: enhancedIntegrationTests
      },
      documentation: {
        changes_needed: claudeResult.documentation.changes_needed,
        new_docs: enhancedDocs
      },
      validation_steps: [
        ...claudeResult.validation_steps,
        'Verify code follows repository conventions',
        'Test integration with existing components',
        'Validate security implications',
        'Review performance impact'
      ],
      reasoning: claudeResult.reasoning,
      estimatedComplexity,
      riskAssessment
    }
  }

  // Helper methods for enhancement
  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'vue': 'vue',
      'css': 'css',
      'scss': 'scss',
      'html': 'html'
    }
    return languageMap[ext || ''] || 'text'
  }

  private detectTestFramework(repository: RepositoryAnalysis, testPath: string): string {
    // Detect test framework based on repository patterns and file path
    const frameworks = repository.patterns.technologies
    
    if (frameworks.includes('Jest') || testPath.includes('jest')) return 'Jest'
    if (frameworks.includes('Mocha') || testPath.includes('mocha')) return 'Mocha'
    if (frameworks.includes('Vitest') || testPath.includes('vitest')) return 'Vitest'
    if (frameworks.includes('Cypress') || testPath.includes('cypress')) return 'Cypress'
    if (frameworks.includes('Playwright') || testPath.includes('playwright')) return 'Playwright'
    
    // Default based on language
    if (repository.primaryLanguage === 'typescript' || repository.primaryLanguage === 'javascript') {
      return 'Jest'
    }
    
    return 'Unknown'
  }

  private determineTestScope(testPath: string): string {
    if (testPath.includes('e2e') || testPath.includes('integration')) return 'integration'
    if (testPath.includes('unit')) return 'unit'
    if (testPath.includes('api')) return 'api'
    return 'component'
  }

  private determineDocType(docPath: string): string {
    const fileName = docPath.toLowerCase()
    if (fileName.includes('readme')) return 'readme'
    if (fileName.includes('api')) return 'api'
    if (fileName.includes('changelog')) return 'changelog'
    return 'guide'
  }

  private calculateComplexity(
    specification: CodeSpecification,
    claudeResult: AgenticCodeResult
  ): 'low' | 'medium' | 'high' {
    let score = 0
    
    // File count factor
    const totalFiles = claudeResult.implementation.files_to_create.length + 
                      claudeResult.implementation.files_to_modify.length
    score += totalFiles > 10 ? 3 : totalFiles > 5 ? 2 : 1
    
    // Requirements factor
    score += specification.requirements.length > 5 ? 2 : 1
    
    // Type factor
    if (specification.type === 'api' || specification.type === 'service') score += 2
    if (specification.type === 'component') score += 1
    
    if (score <= 3) return 'low'
    if (score <= 6) return 'medium'
    return 'high'
  }

  private assessRisk(
    specification: CodeSpecification,
    repository: RepositoryAnalysis,
    claudeResult: AgenticCodeResult
  ): GeneratedCode['riskAssessment'] {
    const concerns: string[] = []
    const mitigations: string[] = []
    
    // Check for breaking changes
    if (claudeResult.implementation.files_to_modify.length > 0) {
      concerns.push('Modifying existing files may introduce breaking changes')
      mitigations.push('Run comprehensive tests before deployment')
    }
    
    // Check for new dependencies
    const newDeps = claudeResult.implementation.files_to_create
      .some(file => file.content.includes('import') || file.content.includes('require'))
    if (newDeps) {
      concerns.push('New dependencies may affect bundle size')
      mitigations.push('Review and audit new dependencies')
    }
    
    // Security considerations
    if (specification.type === 'api' || specification.description.toLowerCase().includes('auth')) {
      concerns.push('Security implications for API/authentication code')
      mitigations.push('Conduct security review and testing')
    }
    
    const level = concerns.length > 2 ? 'high' : concerns.length > 0 ? 'medium' : 'low'
    
    return { level, concerns, mitigations }
  }

  private getRelevantFileStructure(repository: RepositoryAnalysis): string {
    // Extract and format key parts of the file structure
    try {
      const structure = repository.structure
      return this.formatStructureForPrompt(structure, 0, 3) // Max depth of 3
    } catch (error) {
      return 'File structure not available'
    }
  }

  private formatStructureForPrompt(structure: any, depth: number, maxDepth: number): string {
    if (depth > maxDepth) return ''
    
    const indent = '  '.repeat(depth)
    let result = `${indent}${structure.path || 'root'}\n`
    
    if (structure.children && depth < maxDepth) {
      for (const child of structure.children.slice(0, 20)) { // Limit children
        result += this.formatStructureForPrompt(child, depth + 1, maxDepth)
      }
    }
    
    return result
  }

  private getDependencySummary(repository: RepositoryAnalysis): string {
    const imports = repository.dependencies.imports
    const topDependencies: Record<string, number> = {}
    
    // Count dependency usage
    Object.values(imports).forEach(deps => {
      deps.forEach(dep => {
        if (!dep.startsWith('.')) { // External dependencies
          topDependencies[dep] = (topDependencies[dep] || 0) + 1
        }
      })
    })
    
    // Return top 10 dependencies
    return Object.entries(topDependencies)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([dep, count]) => `${dep} (${count} files)`)
      .join('\n')
  }

  private parseValidationResults(analysis: string): {
    isValid: boolean
    issues: string[]
    suggestions: string[]
  } {
    try {
      // Try to parse JSON from Claude's response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.warn('Failed to parse validation JSON')
    }
    
    // Fallback parsing
    const isValid = !analysis.toLowerCase().includes('error') && 
                   !analysis.toLowerCase().includes('issue')
    
    return {
      isValid,
      issues: isValid ? [] : ['Code validation completed with warnings'],
      suggestions: ['Review generated code manually', 'Test thoroughly before deployment']
    }
  }

  private basicValidation(
    generatedCode: GeneratedCode,
    repository: RepositoryAnalysis
  ): { isValid: boolean; issues: string[]; suggestions: string[] } {
    const issues: string[] = []
    const suggestions: string[] = []
    
    // Basic file extension validation
    generatedCode.implementation.files_to_create.forEach(file => {
      const expectedLang = this.detectLanguage(file.path)
      if (expectedLang !== file.language) {
        issues.push(`Language mismatch for ${file.path}`)
      }
    })
    
    // Basic naming convention check
    const isValidNaming = generatedCode.implementation.files_to_create.every(file => {
      return file.path.match(/^[a-zA-Z0-9_\-/.]+$/) // Basic character validation
    })
    
    if (!isValidNaming) {
      issues.push('Invalid file naming conventions detected')
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      suggestions: issues.length > 0 ? ['Review file naming and structure'] : []
    }
  }
} 