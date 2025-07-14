import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { type NextRequest } from "next/server"
import { createServerPromptService } from '@/lib/prompt-service-server'
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

interface FunctionalSpecRequest {
  input: string
  businessAnalysis: string
  template?: string
  customPrompt?: string
  openaiKey: string
  userId?: string
  projectId?: string
}

// Hardcoded fallback prompt for reliability
const FALLBACK_PROMPT = `You are an expert systems analyst. Based on the business analysis and project requirements, create a comprehensive functional specification document.

Project Requirements:
{input}

Business Analysis:
{businessAnalysis}

Create a functional specification that includes:

## System Overview
- **Purpose**: [What the system does]
- **Scope**: [What's included/excluded]
- **Users**: [Who will use the system]
- **Environment**: [Where it will operate]

## Functional Requirements
- **Core Features**: [Essential functionality]
- **User Actions**: [What users can do]
- **System Responses**: [How system responds]
- **Business Rules**: [Constraints and logic]

## Data Requirements
- **Data Entities**: [What data the system manages]
- **Data Relationships**: [How data connects]
- **Data Validation**: [Rules for data integrity]
- **Data Flow**: [How data moves through system]

## Integration Requirements
- **External Systems**: [What systems to connect with]
- **APIs**: [Required interfaces]
- **Data Exchange**: [What data to share]
- **Authentication**: [How to secure connections]

## User Interface Requirements
- **Screen Layouts**: [Key interface elements]
- **Navigation**: [How users move around]
- **Input/Output**: [Forms, reports, displays]
- **Accessibility**: [Support for all users]

## Performance Requirements
- **Response Time**: [How fast system responds]
- **Throughput**: [How much data it handles]
- **Availability**: [Uptime requirements]
- **Scalability**: [Growth expectations]

## Security Requirements
- **Authentication**: [How users log in]
- **Authorization**: [What users can access]
- **Data Protection**: [How to secure data]
- **Audit Trail**: [What to log]

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
  businessAnalysis: string,
  customPrompt: string | undefined,
  openaiKey: string,
  userId: string | undefined,
  projectId: string | undefined
) {
  const promptService = createServerPromptService()
  const openaiClient = createOpenAI({ apiKey: openaiKey })
  
  try {
    // Priority 1: Use custom prompt if provided (legacy support)
    if (customPrompt && customPrompt.trim() !== "") {
      console.log('Using custom prompt from request (streaming)')
      const processedPrompt = customPrompt.replace(/{{input}}/g, input).replace(/{{businessAnalysis}}/g, businessAnalysis)
      
      return await streamText({
        model: openaiClient("gpt-4o"),
        prompt: processedPrompt,
      })
    }

    // Priority 2: Load prompt from database
    const promptTemplate = await promptService.getPromptForExecution('functional', userId || 'anonymous')
    
    if (promptTemplate) {
      console.log(`Using database prompt for streaming: ${promptTemplate.name} (v${promptTemplate.version})`)
      
      // Prepare the prompt
      const { processedContent } = await promptService.preparePrompt(
        promptTemplate.id,
        { 
          input: input,
          context: businessAnalysis, // Use business analysis as context
        }
      )
      
      // Execute AI streaming call
      return await streamText({
        model: openaiClient("gpt-4o"),
        prompt: processedContent,
      })
    }

    // Priority 3: Fallback to hardcoded prompt
    console.warn('No database prompt found, using hardcoded fallback for streaming')
    const processedPrompt = FALLBACK_PROMPT.replace(/\{input\}/g, input).replace(/\{businessAnalysis\}/g, businessAnalysis)
    
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
    const { input, businessAnalysis, template, customPrompt, openaiKey, userId, projectId }: FunctionalSpecRequest = await req.json()
    
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

    console.log('🚀 Starting streaming Functional Specification generation...')
    console.log('User ID:', effectiveUserId)
    console.log('Project ID:', projectId)

    const streamResult = await generateWithDatabasePromptStreaming(
      input,
      businessAnalysis,
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
              contentLength: fullContent.length
            }
          })
          
          controller.enqueue(encoder.encode(`data: ${completionData}\n\n`))
          controller.close()
          
          console.log(`✅ Functional Specification streaming completed - ${fullContent.length} characters`)
          
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
    console.error("Error generating streaming functional specification:", error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate functional specification",
        success: false 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
