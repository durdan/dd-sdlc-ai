import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText, generateObject, streamText } from 'ai'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

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
  private anthropicClient: any
  private userId?: string

  constructor(config?: {
    model?: string
    apiKey?: string
    maxTokens?: number
    temperature?: number
    userId?: string
  }) {
    this.model = config?.model || 'claude-3-5-sonnet-20241022'
    this.apiKey = config?.apiKey
    this.maxTokens = config?.maxTokens || 8192  // Claude's actual limit, not 200000
    this.temperature = config?.temperature || 0.1
    this.userId = config?.userId
    this.anthropicClient = this.apiKey ? createAnthropic({ apiKey: this.apiKey }) : null
  }

  /**
   * Initialize with user's Claude API key from database
   */
  static async createForUser(userId: string): Promise<ClaudeCodeService> {
    console.log('🔍 Creating ClaudeCodeService for user:', userId)
    
    try {
      const supabase = createAdminClient()
      
      // Fetch user's Claude API key from database
      const { data: claudeConfig, error } = await supabase
        .from('sdlc_user_ai_configurations')
        .select('encrypted_api_key, is_active')
        .eq('user_id', userId)
        .eq('provider_id', 'a346dae4-1425-45ad-9eab-9e4a1cb53122') // Anthropic Claude provider ID
        .eq('is_active', true)
        .single()

      if (error || !claudeConfig) {
        console.error('❌ No active Claude API key found for user:', userId, error)
        throw new Error('Claude API key not configured. Please add your Claude API key in the Integration Hub.')
      }

      console.log('✅ Found Claude API key for user:', userId)
      
      // For demo purposes, we'll use the encrypted key directly
      // In production, you'd decrypt it first
      const apiKey = claudeConfig.encrypted_api_key
      
      return new ClaudeCodeService({
        apiKey,
        userId
      })
    } catch (error) {
      console.error('❌ Failed to create ClaudeCodeService for user:', error)
      throw error
    }
  }

  /**
   * Test connection to Claude API
   */
  async testConnection(): Promise<boolean> {
    if (!this.apiKey || !this.anthropicClient) {
      throw new Error('API key not provided')
    }

    try {
      const result = await generateText({
        model: this.anthropicClient(this.model),
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
    if (!this.apiKey || !this.anthropicClient) {
      throw new Error('Claude API key not configured. Please configure in Integration Hub.')
    }

    const prompt = this.buildAnalysisPrompt(request)

    try {
      const result = await generateObject({
        model: this.anthropicClient(this.model),
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
    console.log('🤖 ClaudeCodeService.generateAgenticCode called')
    console.log('📝 Request details:', {
      task_type: request.task_type,
      specific_request: request.specific_request,
      has_file_contents: !!request.file_contents,
      file_count: request.file_contents ? Object.keys(request.file_contents).length : 0,
      codebase_context_length: request.codebase_context?.length || 0
    })

    if (!this.apiKey || !this.anthropicClient) {
      console.error('❌ Claude API key not configured')
      throw new Error('Claude API key not configured. Please configure in Integration Hub.')
    }
    console.log('✅ Claude API key is configured')

    console.log('🔨 Building prompt for Claude...')
    let prompt = this.buildAgenticCodePrompt(request)
    console.log('✅ Prompt built, length:', prompt.length)

    // Check if prompt is too large (over 100k characters might cause timeouts)
    if (prompt.length > 100000) {
      console.log('⚠️  Large prompt detected, simplifying request...')
      // Create a simplified request with less context
      const simplifiedRequest = {
        ...request,
        codebase_context: request.codebase_context.slice(0, 5000) + '\n... (truncated for performance)',
        file_contents: Object.keys(request.file_contents || {}).length > 3 
          ? Object.fromEntries(Object.entries(request.file_contents || {}).slice(0, 3))
          : request.file_contents
      }
      prompt = this.buildAgenticCodePrompt(simplifiedRequest)
      console.log('✅ Simplified prompt built, length:', prompt.length)
    }

    // LOG COMPLETE REQUEST
    console.log('📤 ===== CLAUDE REQUEST LOGGING =====')
    console.log('🔧 Model:', this.model)
    console.log('🌡️ Temperature:', this.temperature)
    console.log('📏 Max tokens:', this.maxTokens)
    console.log('📝 Complete prompt being sent to Claude:')
    console.log('--- PROMPT START ---')
    console.log(prompt)
    console.log('--- PROMPT END ---')
    console.log('📤 ===== END REQUEST LOGGING =====')

    try {
      console.log('🚀 Making API call to Claude...')
      const startTime = Date.now()

      // Progress logging
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        console.log(`⏱️  Claude API call in progress... ${Math.round(elapsed / 1000)}s elapsed`)
      }, 10000) // Log every 10 seconds

      // Create timeout promise (2 minutes)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          clearInterval(progressInterval)
          reject(new Error('Claude API call timed out after 2 minutes'))
        }, 120000) // 2 minutes
      })

      const claudeApiCall = generateObject({
        model: this.anthropicClient(this.model),
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
        temperature: this.temperature,
        maxTokens: this.maxTokens,
      })

      // Race between API call and timeout
      const result = await Promise.race([claudeApiCall, timeoutPromise])
      clearInterval(progressInterval)

      const endTime = Date.now()
      const responseTime = endTime - startTime

      console.log('🎉 Claude API call successful!')
      console.log('⏱️ Response time:', responseTime, 'ms')
      
      // LOG COMPLETE RESPONSE
      console.log('📥 ===== CLAUDE RESPONSE LOGGING =====')
      console.log('📊 Response metadata:', {
        has_reasoning: !!result.object.reasoning,
        files_to_create: result.object.implementation.files_to_create.length,
        files_to_modify: result.object.implementation.files_to_modify.length,
        unit_tests: result.object.tests.unit_tests.length,
        integration_tests: result.object.tests.integration_tests.length,
        response_time_ms: responseTime
      })
      console.log('🧠 Claude reasoning:')
      console.log('--- REASONING START ---')
      console.log(result.object.reasoning)
      console.log('--- REASONING END ---')
      
      console.log('📁 Files to create:', result.object.implementation.files_to_create.length)
      result.object.implementation.files_to_create.forEach((file, index) => {
        console.log(`📄 File ${index + 1}: ${file.path}`)
        console.log(`📝 Description: ${file.description}`)
        console.log(`📄 Content preview: ${file.content.slice(0, 200)}...`)
      })
      
      console.log('✏️ Files to modify:', result.object.implementation.files_to_modify.length)
      result.object.implementation.files_to_modify.forEach((file, index) => {
        console.log(`📄 File ${index + 1}: ${file.path}`)
        console.log(`📝 Description: ${file.description}`)
        console.log(`✏️ Changes preview: ${file.changes.slice(0, 200)}...`)
      })
      
      console.log('🧪 Unit tests:', result.object.tests.unit_tests.length)
      result.object.tests.unit_tests.forEach((test, index) => {
        console.log(`🧪 Test ${index + 1}: ${test.file_path}`)
        console.log(`📝 Description: ${test.description}`)
      })
      
      console.log('📥 ===== END RESPONSE LOGGING =====')

      return result.object
    } catch (error) {
      console.error('💥 ===== CLAUDE API ERROR LOGGING =====')
      console.error('💥 Claude API error in generateAgenticCode:', error)
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      
      // Log additional error context
      if (error instanceof Error) {
        console.error('🔍 Error message:', error.message)
        console.error('🔍 Error name:', error.name)
        if (error.stack) {
          console.error('🔍 Full stack trace:')
          console.error(error.stack)
        }
      }
      
      // Log the request that failed
      console.error('🔍 Request that failed:')
      console.error('- Task type:', request.task_type)
      console.error('- Description:', request.specific_request)
      console.error('- Model:', this.model)
      console.error('- Temperature:', this.temperature)
      console.error('- Max tokens:', this.maxTokens)
      console.error('- API key configured:', !!this.apiKey)
      console.error('- Prompt length:', prompt.length)
      
      console.error('💥 ===== END ERROR LOGGING =====')
      throw new Error(`Claude analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Stream agentic code generation for real-time debugging
   */
  async *streamAgenticCode(request: AgenticCodeRequest): AsyncGenerator<string, AgenticCodeResult, unknown> {
    console.log('🌊 ClaudeCodeService.streamAgenticCode called')
    console.log('📝 Request details:', {
      task_type: request.task_type,
      specific_request: request.specific_request,
      has_file_contents: !!request.file_contents,
      file_count: request.file_contents ? Object.keys(request.file_contents).length : 0,
      codebase_context_length: request.codebase_context?.length || 0
    })

    if (!this.apiKey || !this.anthropicClient) {
      console.error('❌ Claude API key not configured')
      throw new Error('Claude API key not configured. Please configure in Integration Hub.')
    }
    console.log('✅ Claude API key is configured')

    console.log('🔨 Building prompt for Claude...')
    let prompt = this.buildAgenticCodePrompt(request)
    console.log('✅ Prompt built, length:', prompt.length)

    // Check if prompt is too large
    if (prompt.length > 100000) {
      console.log('⚠️  Large prompt detected, simplifying request...')
      const simplifiedRequest = {
        ...request,
        codebase_context: request.codebase_context.slice(0, 5000) + '\n... (truncated for performance)',
        file_contents: Object.keys(request.file_contents || {}).length > 3 
          ? Object.fromEntries(Object.entries(request.file_contents || {}).slice(0, 3))
          : request.file_contents
      }
      prompt = this.buildAgenticCodePrompt(simplifiedRequest)
      console.log('✅ Simplified prompt built, length:', prompt.length)
    }

    yield `🔧 Starting Claude API call...\n`
    yield `📊 Model: ${this.model}\n`
    yield `🌡️ Temperature: ${this.temperature}\n`
    yield `📏 Max tokens: ${this.maxTokens}\n`
    yield `📝 Prompt length: ${prompt.length} characters\n`

    try {
      console.log('🚀 Making streaming API call to Claude...')
      const startTime = Date.now()

      yield `🚀 API call initiated at ${new Date().toISOString()}\n`

      // Use streamText for real-time streaming
      const stream = streamText({
        model: this.anthropicClient(this.model),
        prompt: `${prompt}\n\nPlease respond with a valid JSON object matching the expected schema. Start your response with { and end with }.`,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
      })

      let fullResponse = ''
      let chunkCount = 0

      for await (const chunk of stream.textStream) {
        chunkCount++
        fullResponse += chunk
        yield `📦 Chunk ${chunkCount}: ${chunk}\n`
        
        // Log progress every 10 chunks
        if (chunkCount % 10 === 0) {
          const elapsed = Date.now() - startTime
          console.log(`⏱️ Streaming progress: ${chunkCount} chunks, ${elapsed}ms elapsed`)
          yield `⏱️ Progress: ${chunkCount} chunks received (${Math.round(elapsed/1000)}s)\n`
        }
      }

      const endTime = Date.now()
      const responseTime = endTime - startTime

      yield `✅ Streaming completed!\n`
      yield `📊 Total chunks: ${chunkCount}\n`
      yield `⏱️ Response time: ${responseTime}ms\n`
      yield `📝 Full response length: ${fullResponse.length} characters\n`

      console.log('🎉 Claude streaming completed!')
      console.log('📊 Response metadata:', {
        chunkCount,
        responseTime,
        responseLength: fullResponse.length
      })

      // Try to parse the JSON response
      yield `🔍 Parsing JSON response...\n`
      
      try {
        // Clean the response - remove any markdown formatting
        let cleanResponse = fullResponse.trim()
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        }
        if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }

        const parsedResponse = JSON.parse(cleanResponse)
        yield `✅ JSON parsing successful!\n`

        // Validate the structure
        const result: AgenticCodeResult = {
          reasoning: parsedResponse.reasoning || 'No reasoning provided',
          implementation: {
            files_to_create: parsedResponse.implementation?.files_to_create || [],
            files_to_modify: parsedResponse.implementation?.files_to_modify || [],
            files_to_delete: parsedResponse.implementation?.files_to_delete || []
          },
          tests: {
            unit_tests: parsedResponse.tests?.unit_tests || [],
            integration_tests: parsedResponse.tests?.integration_tests || []
          },
          documentation: {
            changes_needed: parsedResponse.documentation?.changes_needed || [],
            new_docs: parsedResponse.documentation?.new_docs || []
          },
          validation_steps: parsedResponse.validation_steps || []
        }

        yield `📊 Parsed structure:\n`
        yield `- Files to create: ${result.implementation.files_to_create.length}\n`
        yield `- Files to modify: ${result.implementation.files_to_modify.length}\n`
        yield `- Unit tests: ${result.tests.unit_tests.length}\n`
        yield `- Integration tests: ${result.tests.integration_tests.length}\n`

        console.log('✅ Response validation successful')
        return result

      } catch (parseError) {
        yield `❌ JSON parsing failed: ${parseError}\n`
        yield `📝 Raw response: ${fullResponse.slice(0, 500)}...\n`
        
        console.error('❌ JSON parsing failed:', parseError)
        console.error('📝 Raw response:', fullResponse)
        
        // Return a fallback result
        return {
          reasoning: `Failed to parse Claude response: ${parseError}. Raw response: ${fullResponse.slice(0, 200)}...`,
          implementation: {
            files_to_create: [],
            files_to_modify: [],
            files_to_delete: []
          },
          tests: {
            unit_tests: [],
            integration_tests: []
          },
          documentation: {
            changes_needed: ['Failed to generate documentation due to parsing error'],
            new_docs: []
          },
          validation_steps: ['Manual verification required due to parsing error']
        }
      }

    } catch (error) {
      yield `❌ Streaming API call failed: ${error}\n`
      console.error('❌ Claude streaming API error:', error)
      throw new Error(`Claude streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Stream code review and suggestions
   */
  async *streamCodeReview(codeContent: string, reviewType: 'security' | 'performance' | 'maintainability' | 'comprehensive') {
    if (!this.apiKey || !this.anthropicClient) {
      throw new Error('Claude API key not configured. Please configure in Integration Hub.')
    }

    const prompt = this.buildCodeReviewPrompt(codeContent, reviewType)

    try {
      const stream = await streamText({
        model: this.anthropicClient(this.model),
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

Please provide:
1. **Code Quality Issues**: Identify potential problems, bugs, or improvements
2. **Security Concerns**: Highlight any security vulnerabilities or risks
3. **Performance Issues**: Point out performance bottlenecks or inefficiencies
4. **Best Practices**: Suggest improvements following coding standards
5. **Maintainability**: Recommend changes for better code maintainability

Be specific and actionable in your feedback.`
  }
} 