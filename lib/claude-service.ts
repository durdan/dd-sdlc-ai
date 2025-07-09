import { anthropic } from '@ai-sdk/anthropic'
import { generateText, generateObject, streamText } from 'ai'
import { z } from 'zod'

export interface CodeAnalysisRequest {
  repositoryUrl?: string
  codeContent?: string
  analysisType: 'bug_fix' | 'feature_implementation' | 'code_review' | 'refactoring'
  context?: string
  requirements?: string
}

export interface CodeAnalysisResult {
  analysis: string
  suggestions: string[]
  implementation_plan: {
    steps: Array<{
      step_number: number
      description: string
      files_to_modify: string[]
      code_changes: string
      tests_needed: string[]
    }>
  }
  estimated_complexity: 'low' | 'medium' | 'high'
  risk_assessment: {
    level: 'low' | 'medium' | 'high'
    concerns: string[]
    mitigation_strategies: string[]
  }
}

export interface AgenticCodeRequest {
  task_type: 'bug_fix' | 'feature_implementation' | 'code_review' | 'test_generation'
  codebase_context: string
  specific_request: string
  file_contents?: Record<string, string>
  requirements?: string
  constraints?: string[]
}

export interface AgenticCodeResult {
  reasoning: string
  implementation: {
    files_to_create: Array<{
      path: string
      content: string
      description: string
    }>
    files_to_modify: Array<{
      path: string
      changes: string
      description: string
    }>
    files_to_delete: string[]
  }
  tests: {
    unit_tests: Array<{
      file_path: string
      test_content: string
      description: string
    }>
    integration_tests: Array<{
      file_path: string
      test_content: string
      description: string
    }>
  }
  documentation: {
    changes_needed: string[]
    new_docs: Array<{
      file_path: string
      content: string
    }>
  }
  validation_steps: string[]
}

export class ClaudeCodeService {
  private model: string
  private apiKey?: string
  private maxTokens: number
  private temperature: number

  constructor(config?: {
    model?: string
    apiKey?: string
    maxTokens?: number
    temperature?: number
  }) {
    this.model = config?.model || 'claude-3-5-sonnet-20241022'
    this.apiKey = config?.apiKey
    this.maxTokens = config?.maxTokens || 200000
    this.temperature = config?.temperature || 0.1
  }

  /**
   * Test connection to Claude API
   */
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error('API key not provided')
    }

    try {
      const result = await generateText({
        model: anthropic(this.model, { apiKey: this.apiKey }),
        prompt: 'Say "Connection successful" if you can read this.',
        maxTokens: 50,
      })

      return result.text.includes('Connection successful')
    } catch (error) {
      console.error('Claude API connection test failed:', error)
      return false
    }
  }

  /**
   * Analyze code using Claude's extended thinking capabilities
   */
  async analyzeCode(request: CodeAnalysisRequest): Promise<CodeAnalysisResult> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured. Please configure in Integration Hub.')
    }

    const prompt = this.buildAnalysisPrompt(request)

    try {
      const result = await generateObject({
        model: anthropic(this.model, { apiKey: this.apiKey }),
        schema: z.object({
          analysis: z.string(),
          suggestions: z.array(z.string()),
          implementation_plan: z.object({
            steps: z.array(z.object({
              step_number: z.number(),
              description: z.string(),
              files_to_modify: z.array(z.string()),
              code_changes: z.string(),
              tests_needed: z.array(z.string())
            }))
          }),
          estimated_complexity: z.enum(['low', 'medium', 'high']),
          risk_assessment: z.object({
            level: z.enum(['low', 'medium', 'high']),
            concerns: z.array(z.string()),
            mitigation_strategies: z.array(z.string())
          })
        }),
        prompt,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
      })

      return result.object
    } catch (error) {
      console.error('Claude API error in analyzeCode:', error)
      throw new Error(`Claude analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate agentic code implementation using Claude's advanced reasoning
   */
  async generateAgenticCode(request: AgenticCodeRequest): Promise<AgenticCodeResult> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured. Please configure in Integration Hub.')
    }

    const prompt = this.buildAgenticCodePrompt(request)

    try {
      const result = await generateObject({
        model: anthropic(this.model, { apiKey: this.apiKey }),
        schema: z.object({
          reasoning: z.string(),
          implementation: z.object({
            files_to_create: z.array(z.object({
              path: z.string(),
              content: z.string(),
              description: z.string()
            })),
            files_to_modify: z.array(z.object({
              path: z.string(),
              changes: z.string(),
              description: z.string()
            })),
            files_to_delete: z.array(z.string())
          }),
          tests: z.object({
            unit_tests: z.array(z.object({
              file_path: z.string(),
              test_content: z.string(),
              description: z.string()
            })),
            integration_tests: z.array(z.object({
              file_path: z.string(),
              test_content: z.string(),
              description: z.string()
            }))
          }),
          documentation: z.object({
            changes_needed: z.array(z.string()),
            new_docs: z.array(z.object({
              file_path: z.string(),
              content: z.string()
            }))
          }),
          validation_steps: z.array(z.string())
        }),
        prompt,
        temperature: this.temperature + 0.1, // Slightly higher for creative code generation
        maxTokens: this.maxTokens,
      })

      return result.object
    } catch (error) {
      console.error('Claude API error in generateAgenticCode:', error)
      throw new Error(`Claude code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Stream code review and suggestions
   */
  async *streamCodeReview(codeContent: string, reviewType: 'security' | 'performance' | 'maintainability' | 'comprehensive') {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured. Please configure in Integration Hub.')
    }

    const prompt = this.buildCodeReviewPrompt(codeContent, reviewType)

    try {
      const stream = await streamText({
        model: anthropic(this.model, { apiKey: this.apiKey }),
        prompt,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
      })

      for await (const chunk of stream.textStream) {
        yield chunk
      }
    } catch (error) {
      console.error('Claude API error in streamCodeReview:', error)
      throw new Error(`Claude code review failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private buildAnalysisPrompt(request: CodeAnalysisRequest): string {
    return `You are an expert software engineer and architect with deep knowledge of coding best practices, design patterns, and system architecture.

ANALYSIS TYPE: ${request.analysisType}

${request.codeContent ? `CODE TO ANALYZE:
\`\`\`
${request.codeContent}
\`\`\`` : ''}

${request.repositoryUrl ? `REPOSITORY: ${request.repositoryUrl}` : ''}

${request.context ? `CONTEXT: ${request.context}` : ''}

${request.requirements ? `REQUIREMENTS: ${request.requirements}` : ''}

Please provide a comprehensive analysis with:

1. **Code Analysis**: Deep technical analysis of the current state
2. **Suggestions**: Specific, actionable improvement recommendations
3. **Implementation Plan**: Detailed step-by-step plan with:
   - Clear steps in logical order
   - Files that need to be modified
   - Specific code changes required
   - Tests that need to be written
4. **Complexity Estimation**: Realistic assessment of implementation difficulty
5. **Risk Assessment**: Potential issues and mitigation strategies

Focus on:
- Code quality and maintainability
- Performance implications
- Security considerations
- Testing strategy
- Documentation needs

Be thorough but practical in your recommendations.`
  }

  private buildAgenticCodePrompt(request: AgenticCodeRequest): string {
    return `You are an advanced AI coding assistant capable of autonomous development tasks. You will think step-by-step through the implementation and provide complete, production-ready code.

TASK TYPE: ${request.task_type}
SPECIFIC REQUEST: ${request.specific_request}

CODEBASE CONTEXT:
${request.codebase_context}

${request.file_contents ? `CURRENT FILES:
${Object.entries(request.file_contents).map(([path, content]) => `
File: ${path}
\`\`\`
${content}
\`\`\``).join('\n')}` : ''}

${request.requirements ? `REQUIREMENTS:
${request.requirements}` : ''}

${request.constraints ? `CONSTRAINTS:
${request.constraints.join('\n- ')}` : ''}

Please provide:

1. **Reasoning**: Your step-by-step thinking process and approach
2. **Implementation**: Complete code implementation including:
   - New files to create with full content
   - Existing files to modify with specific changes
   - Files to delete if necessary
3. **Tests**: Comprehensive test coverage including:
   - Unit tests for individual functions/components
   - Integration tests for system interactions
4. **Documentation**: 
   - Updates needed to existing documentation
   - New documentation files required
5. **Validation Steps**: How to verify the implementation works correctly

Requirements for code quality:
- Follow TypeScript/React best practices
- Include proper error handling
- Add meaningful comments for complex logic
- Ensure type safety
- Follow existing code patterns and conventions
- Consider performance implications
- Include accessibility considerations for UI components

Generate complete, production-ready code that can be directly implemented.`
  }

  private buildCodeReviewPrompt(codeContent: string, reviewType: string): string {
    return `You are conducting a ${reviewType} code review. Please analyze the following code and provide detailed feedback:

\`\`\`
${codeContent}
\`\`\`

Focus areas for ${reviewType} review:
${reviewType === 'security' ? `
- Input validation and sanitization
- Authentication and authorization
- Data protection and encryption
- SQL injection and XSS vulnerabilities
- Secure configuration practices` : ''}
${reviewType === 'performance' ? `
- Algorithm efficiency and complexity
- Memory usage and resource management
- Database query optimization
- Caching strategies
- Bundle size and loading performance` : ''}
${reviewType === 'maintainability' ? `
- Code organization and structure
- Naming conventions and readability
- Documentation and comments
- Testing coverage and quality
- Design patterns and principles` : ''}
${reviewType === 'comprehensive' ? `
- Security vulnerabilities
- Performance bottlenecks
- Code maintainability
- Testing gaps
- Documentation issues
- Best practice violations` : ''}

Please provide:
1. **Issues Found**: Specific problems with severity levels
2. **Recommendations**: Concrete improvement suggestions
3. **Code Examples**: Show better implementations where applicable
4. **Priority**: Order issues by importance and impact

Be thorough but constructive in your feedback.`
  }
} 