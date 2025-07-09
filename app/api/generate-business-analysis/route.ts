import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { type NextRequest } from "next/server"
import { createPromptService } from '@/lib/prompt-service'
import { createClient } from "@/lib/supabase/server"

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
const FALLBACK_PROMPT = `You are an expert business analyst. Analyze the following project requirements and create a comprehensive business analysis document.

Project Requirements:
{input}

Create a business analysis that includes:

## Executive Summary
- **Project Overview**: [Brief description]
- **Business Justification**: [Why this project matters]
- **Expected Outcomes**: [What success looks like]

## Stakeholder Analysis
- **Primary Stakeholders**: [Key decision makers]
- **Secondary Stakeholders**: [Affected parties]
- **Stakeholder Interests**: [What each group cares about]

## Requirements Analysis
- **Functional Requirements**: [What the system must do]
- **Non-Functional Requirements**: [Performance, security, usability]
- **Business Rules**: [Constraints and policies]
- **Assumptions**: [What we're assuming to be true]

## Risk Assessment
- **Technical Risks**: [Technology-related concerns]
- **Business Risks**: [Market, financial, operational risks]
- **Mitigation Strategies**: [How to address each risk]

## User Stories & Acceptance Criteria
- **Epic**: [High-level feature description]
- **User Stories**: [Specific user needs in "As a... I want... So that..." format]
- **Acceptance Criteria**: [Testable conditions for completion]

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

async function generateWithDatabasePromptStreaming(
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
      console.log('Using custom prompt from request (streaming)')
      const processedPrompt = customPrompt.replace(/{{input}}/g, input)
      
      return await streamText({
        model: openaiClient("gpt-4o"),
        prompt: processedPrompt,
      })
    }

    // Priority 2: Load prompt from database
    const promptTemplate = await promptService.getPromptForExecution('business', userId || 'anonymous')
    
    if (promptTemplate) {
      console.log(`Using database prompt for streaming: ${promptTemplate.name} (v${promptTemplate.version})`)
      
      // Prepare the prompt
      const { processedContent } = await promptService.preparePrompt(
        promptTemplate.id,
        { 
          input: input,
          context: '', // No additional context for business analysis
        }
      )
      
      // Execute AI streaming call
      const streamResult = await streamText({
        model: openaiClient("gpt-4o"),
        prompt: processedContent,
      })
      
      // Note: We'll log usage after streaming completes in the response handler
      return streamResult
    }

    // Priority 3: Fallback to hardcoded prompt
    console.warn('No database prompt found, using hardcoded fallback for streaming')
    const processedPrompt = FALLBACK_PROMPT.replace(/\{input\}/g, input)
    
    return await streamText({
      model: openaiClient("gpt-4o"),
      prompt: processedPrompt,
    })
    
  } catch (error) {
    console.error('Error in streaming generation:', error)
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    const { input, template, customPrompt, openaiKey, userId, projectId }: BusinessAnalysisRequest = await req.json()
    
    // Validate OpenAI API key
    if (!openaiKey || openaiKey.trim() === '') {
      return new Response(
        JSON.stringify({ error: "OpenAI API key is required" }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Get authenticated user if not provided
    const user = await getAuthenticatedUser()
    const effectiveUserId = userId || user?.id

    console.log('🚀 Starting streaming Business Analysis generation...')
    console.log('User ID:', effectiveUserId)
    console.log('Project ID:', projectId)

    const streamResult = await generateWithDatabasePromptStreaming(
      input,
      customPrompt,
      openaiKey,
      effectiveUserId,
      projectId
    )

    // Convert the AI stream to a web-compatible ReadableStream
    const encoder = new TextEncoder()
    let fullContent = ''
    
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.textStream) {
            fullContent += chunk
            
            // Send each chunk as JSON with metadata
            const chunkData = JSON.stringify({
              type: 'chunk',
              content: chunk,
              fullContent: fullContent,
              timestamp: Date.now()
            })
            
            controller.enqueue(encoder.encode(`data: ${chunkData}\n\n`))
          }
          
          // Send completion signal
          const completionData = JSON.stringify({
            type: 'complete',
            fullContent: fullContent,
            success: true,
            metadata: {
              responseTime: Date.now() - Date.now(),
              contentLength: fullContent.length
            }
          })
          
          controller.enqueue(encoder.encode(`data: ${completionData}\n\n`))
          controller.close()
          
          console.log(`✅ Business Analysis streaming completed - ${fullContent.length} characters`)
          
        } catch (error) {
          console.error('Error in streaming:', error)
          const errorData = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Streaming failed'
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error("Error generating streaming business analysis:", error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate business analysis",
        success: false 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
