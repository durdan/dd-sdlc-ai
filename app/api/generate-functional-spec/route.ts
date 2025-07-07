import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { createPromptService } from '@/lib/prompt-service'

export const maxDuration = 60

interface FunctionalSpecRequest {
  input: string
  businessAnalysis: string
  customPrompt?: string
  openaiKey: string
  userId?: string
  projectId?: string
}

// Hardcoded fallback prompt for reliability
const FALLBACK_PROMPT = `As a Senior Business Analyst with expertise in requirements engineering, create a detailed functional specification based on the business analysis:

Original Input: {input}
Business Analysis: {business_analysis}

Generate the following structured output:

## Functional Overview
- **System Purpose**: [Clear description of what the system does]
- **Key Capabilities**: [Main functional areas]
- **Success Criteria**: [Measurable outcomes]

## Detailed Functional Requirements
For each functional area, provide:
1. **Requirement ID**: [Unique identifier]
2. **Requirement Title**: [Clear, descriptive title]
3. **Description**: [Detailed functional behavior]
4. **Acceptance Criteria**: [Specific, testable criteria]
5. **Priority**: [Must Have/Should Have/Could Have]
6. **Dependencies**: [Related requirements]

## System Capabilities
### Core Functions
- User management and authentication
- Data processing and storage
- Business logic implementation
- Reporting and analytics

### Integration Requirements
- External API integrations
- Third-party service connections
- Data import/export capabilities
- System interoperability

### Performance Requirements
- Response time specifications
- Throughput requirements
- Scalability targets
- Availability requirements

### Security Requirements
- Authentication mechanisms
- Authorization controls
- Data protection measures
- Compliance requirements

## Data Requirements
- **Data Entities**: [Key data objects]
- **Data Relationships**: [How data connects]
- **Data Validation**: [Quality requirements]
- **Data Lifecycle**: [Creation, update, deletion rules]

## User Interface Requirements
- **User Experience**: [UX principles]
- **Accessibility**: [WCAG compliance]
- **Responsive Design**: [Device compatibility]
- **Navigation**: [User flow requirements]

Ensure all requirements are:
- Specific and measurable
- Testable and verifiable
- Aligned with business objectives
- Technically feasible

Format the response in markdown with clear headings and structured sections.`

async function getAuthenticatedUser() {
  // For API routes, we'll rely on the userId being passed in the request
  // Server-side auth will be handled differently in production
  return null
}

async function generateWithDatabasePrompt(
  input: string,
  businessAnalysis: string,
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
    const promptTemplate = await promptService.getPromptForExecution('functional', userId || 'anonymous')
    
    if (promptTemplate) {
      console.log(`Using database prompt: ${promptTemplate.name} (v${promptTemplate.version})`)
      
      try {
        // Prepare the prompt
        const { processedContent } = await promptService.preparePrompt(
          promptTemplate.id,
          { 
            input: input,
            business_analysis: businessAnalysis,
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
          { input, business_analysis: businessAnalysis },
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
          { input, business_analysis: businessAnalysis },
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
    const { input, businessAnalysis, customPrompt, openaiKey, userId, projectId }: FunctionalSpecRequest = await req.json()
    
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

    console.log('Generating Functional Specification with database prompts...')
    console.log('User ID:', effectiveUserId)
    console.log('Project ID:', projectId)

    const result = await generateWithDatabasePrompt(
      input,
      businessAnalysis,
      customPrompt,
      openaiKey,
      effectiveUserId,
      projectId
    )

    console.log(`Functional Specification generated successfully using ${result.promptSource} prompt`)
    console.log(`Response time: ${result.responseTime}ms`)

    return NextResponse.json({
      functionalSpec: result.content,
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
    console.error("Error generating functional specification:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate functional specification",
        success: false 
      },
      { status: 500 }
    )
  }
}
