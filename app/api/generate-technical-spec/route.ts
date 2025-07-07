import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { createPromptService } from '@/lib/prompt-service'
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

interface TechnicalSpecRequest {
  input: string
  businessAnalysis: string
  functionalSpec: string
  customPrompt?: string
  openaiKey: string
  userId?: string
  projectId?: string
}

// Hardcoded fallback prompt for reliability
const FALLBACK_PROMPT = `As a Senior Software Architect with 10+ years of full-stack development experience, break down the following functional requirements into specific development tasks:

Functional Requirements: {functional_spec}
Business Analysis: {business_analysis}

Generate the following structured output:

## Technical Epic
- **Epic Title**: [Technical implementation focus]
- **Technical Approach**: [Architecture pattern/approach]
- **Technology Stack**: [Specific technologies]

## Development Tasks
For each task, provide:
1. **Task Title**: Clear, action-oriented (e.g., "Implement user authentication API")
2. **Task Description**: Technical implementation details
3. **Acceptance Criteria**: Technical completion criteria
4. **Story Points**: Effort estimate (1, 2, 3, 5, 8)
5. **Components**: Frontend/Backend/Database/DevOps
6. **Dependencies**: Technical prerequisites
7. **Definition of Done**: Code quality, testing, documentation requirements

## Task Categories:
### Backend Development
- API endpoint implementation
- Database schema design
- Business logic implementation
- Authentication/authorization
- Data validation and processing

### Frontend Development
- UI component development
- State management
- API integration
- Form handling and validation
- Responsive design implementation

### Infrastructure & DevOps
- Database setup and configuration
- CI/CD pipeline setup
- Environment configuration
- Monitoring and logging
- Security implementation

### Testing & Quality Assurance
- Unit test implementation
- Integration test setup
- End-to-end test scenarios
- Performance testing
- Security testing

## Technical Debt & Improvements
- Code refactoring opportunities
- Performance optimizations
- Security enhancements
- Documentation updates

Create 8-12 specific, actionable development tasks that are:
- Technically detailed and implementable
- Properly estimated for sprint planning
- Categorized by development area
- Include clear technical acceptance criteria

Architecture Pattern: Microservices
Cloud Platform: AWS
Database Type: Relational
Security Level: Enterprise`

async function getAuthenticatedUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.warn('Error getting authenticated user:', error.message)
      return null
    }
    
    return user
  } catch (error) {
    console.warn('Failed to get authenticated user:', error)
    return null
  }
}

async function generateWithDatabasePrompt(
  input: string,
  businessAnalysis: string,
  functionalSpec: string,
  customPrompt: string | undefined,
  openaiKey: string,
  userId: string | undefined,
  projectId: string | undefined
) {
  const promptService = createPromptService()
  const startTime = Date.now()
  const openaiClient = createOpenAI({ apiKey: openaiKey })
  
  try {
    // Priority 1: Use custom prompt if provided (legacy support)
    if (customPrompt && customPrompt.trim() !== "") {
      console.log('Using custom prompt from request')
      const processedPrompt = customPrompt
        .replace(/{{input}}/g, input)
        .replace(/{{business_analysis}}/g, businessAnalysis)
        .replace(/{{functional_spec}}/g, functionalSpec)
      
      const result = await generateText({
        model: openaiClient("gpt-4o"),
        prompt: processedPrompt,
      })
      
      return {
        content: result.text,
        promptSource: 'custom',
        responseTime: Date.now() - startTime
      }
    }

    // Priority 2: Load prompt from database
    const promptTemplate = await promptService.getPromptForExecution('technical', userId || 'anonymous')
    
    if (promptTemplate) {
      console.log(`Using database prompt: ${promptTemplate.name} (v${promptTemplate.version})`)
      
      try {
        // Prepare the prompt
        const { processedContent } = await promptService.preparePrompt(
          promptTemplate.id,
          { 
            input: input,
            business_analysis: businessAnalysis,
            functional_spec: functionalSpec,
          }
        )
        
        // Execute AI call
        const aiResult = await generateText({
          model: openaiClient("gpt-4o"),
          prompt: processedContent,
        })
        
        const responseTime = Date.now() - startTime
        
        // Log successful usage
        const usageLogId = await promptService.logUsage(
          promptTemplate.id,
          userId || 'anonymous',
          { input, business_analysis: businessAnalysis, functional_spec: functionalSpec },
          {
            content: aiResult.text,
            input_tokens: Math.floor(processedContent.length / 4),
            output_tokens: Math.floor(aiResult.text.length / 4),
          },
          responseTime,
          true,
          undefined,
          projectId,
          'gpt-4o'
        )
        
        return {
          content: aiResult.text,
          promptSource: 'database',
          promptId: promptTemplate.id,
          promptName: promptTemplate.name,
          responseTime,
          usageLogId
        }
      } catch (aiError) {
        // Log failed usage
        const responseTime = Date.now() - startTime
        await promptService.logUsage(
          promptTemplate.id,
          userId || 'anonymous',
          { input, business_analysis: businessAnalysis, functional_spec: functionalSpec },
          { content: '', input_tokens: 0, output_tokens: 0 },
          responseTime,
          false,
          aiError instanceof Error ? aiError.message : 'AI execution failed',
          projectId,
          'gpt-4o'
        )
        throw aiError
      }
    }

    // Priority 3: Fallback to hardcoded prompt
    console.warn('No database prompt found, using hardcoded fallback')
    throw new Error('No database prompt available')
    
  } catch (error) {
    console.warn('Database prompt failed, using hardcoded fallback:', error)
    
    // Fallback execution with hardcoded prompt
    const processedPrompt = FALLBACK_PROMPT
      .replace(/\{input\}/g, input)
      .replace(/\{business_analysis\}/g, businessAnalysis)
      .replace(/\{functional_spec\}/g, functionalSpec)
    
    const result = await generateText({
      model: openaiClient("gpt-4o"),
      prompt: processedPrompt,
    })
    
    return {
      content: result.text,
      promptSource: 'fallback',
      responseTime: Date.now() - startTime,
      fallbackReason: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { input, businessAnalysis, functionalSpec, customPrompt, openaiKey, userId, projectId }: TechnicalSpecRequest = await req.json()
    
    // Validate OpenAI API key
    if (!openaiKey || openaiKey.trim() === '') {
      return NextResponse.json(
        { error: "OpenAI API key is required" },
        { status: 400 }
      )
    }

    // Get authenticated user if not provided
    const user = await getAuthenticatedUser()
    const effectiveUserId = userId || user?.id

    console.log('Generating Technical Specification with database prompts...')
    console.log('User ID:', effectiveUserId)
    console.log('Project ID:', projectId)

    const result = await generateWithDatabasePrompt(
      input,
      businessAnalysis,
      functionalSpec,
      customPrompt,
      openaiKey,
      effectiveUserId,
      projectId
    )

    console.log(`Technical Specification generated successfully using ${result.promptSource} prompt`)
    console.log(`Response time: ${result.responseTime}ms`)

    return NextResponse.json({
      technicalSpec: result.content,
      success: true,
      metadata: {
        promptSource: result.promptSource,
        promptId: result.promptId,
        promptName: result.promptName,
        responseTime: result.responseTime,
        fallbackReason: result.fallbackReason,
        usageLogId: result.usageLogId
      }
    })

  } catch (error) {
    console.error("Error generating technical specification:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate technical specification",
        success: false 
      },
      { status: 500 }
    )
  }
}
