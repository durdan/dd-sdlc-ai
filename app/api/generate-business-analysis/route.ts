import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { createPromptService } from '@/lib/prompt-service'

export const maxDuration = 60

interface BusinessAnalysisRequest {
  input: string
  template: string
  customPrompt?: string
  openaiKey: string
  userId?: string
  projectId?: string
}

// Hardcoded fallback prompt for reliability
const FALLBACK_PROMPT = `As a Senior Product Owner with 8+ years of Agile experience, analyze the following business case and extract actionable user stories:

Business Case: {input}

Generate the following structured output:

## Epic Overview
- **Epic Title**: [Clear, business-focused title]
- **Epic Description**: [2-3 sentences describing the overall business goal]
- **Business Value**: [Quantifiable value/impact]
- **Priority**: [High/Medium/Low with justification]

## User Stories (Format: As a [user type], I want [functionality], so that [benefit])
For each user story, provide:
1. **Story Title**: Clear, action-oriented title
2. **Story Description**: Full user story format
3. **Acceptance Criteria**: 3-5 specific, testable criteria
4. **Story Points**: Estimate (1, 2, 3, 5, 8, 13)
5. **Priority**: High/Medium/Low
6. **Dependencies**: Any blocking or related stories
7. **Definition of Done**: Clear completion criteria

## Personas & User Types
- **Primary Users**: [List main user types]
- **Secondary Users**: [Supporting user types]
- **Admin Users**: [Administrative roles]

## Success Metrics
- **User Adoption**: [Specific metrics]
- **Business Impact**: [ROI/KPI targets]
- **Technical Performance**: [Performance benchmarks]

Focus on creating 5-8 user stories that are:
- Independent and deliverable
- Testable with clear acceptance criteria
- Properly sized for sprint planning
- Aligned with business objectives

Format the response in markdown with clear headings and structured sections.`

async function getAuthenticatedUser() {
  // For API routes, we'll rely on the userId being passed in the request
  // Server-side auth will be handled differently in production
  return null
}

async function generateWithDatabasePrompt(
  input: string,
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
      const processedPrompt = customPrompt.replace(/{{input}}/g, input)
      
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
    const promptTemplate = await promptService.getPromptForExecution('business', userId || 'anonymous')
    
    if (promptTemplate) {
      console.log(`Using database prompt: ${promptTemplate.name} (v${promptTemplate.version})`)
      
      try {
        // Prepare the prompt
        const { processedContent } = await promptService.preparePrompt(
          promptTemplate.id,
          { 
            input: input,
            context: '', // No additional context for business analysis
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
          { input, context: '' },
          {
            content: aiResult.text,
            input_tokens: Math.floor(processedContent.length / 4), // Rough estimate
            output_tokens: Math.floor(aiResult.text.length / 4), // Rough estimate
          },
          responseTime,
          true, // success
          undefined, // no error
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
          { input, context: '' },
          { content: '', input_tokens: 0, output_tokens: 0 },
          responseTime,
          false, // failed
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
    const processedPrompt = FALLBACK_PROMPT.replace(/\{input\}/g, input)
    
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
    const { input, template, customPrompt, openaiKey, userId, projectId }: BusinessAnalysisRequest = await req.json()
    
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

    console.log('Generating Business Analysis with database prompts...')
    console.log('User ID:', effectiveUserId)
    console.log('Project ID:', projectId)

    const result = await generateWithDatabasePrompt(
      input,
      customPrompt,
      openaiKey,
      effectiveUserId,
      projectId
    )

    console.log(`Business Analysis generated successfully using ${result.promptSource} prompt`)
    console.log(`Response time: ${result.responseTime}ms`)

    return NextResponse.json({
      businessAnalysis: result.content,
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
    console.error("Error generating business analysis:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate business analysis",
        success: false 
      },
      { status: 500 }
    )
  }
}
