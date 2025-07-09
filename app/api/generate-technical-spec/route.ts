import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { type NextRequest } from "next/server"
import { createPromptService } from '@/lib/prompt-service'
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

interface TechnicalSpecRequest {
  input: string
  businessAnalysis: string
  functionalSpec: string
  template?: string
  customPrompt?: string
  openaiKey: string
  userId?: string
  projectId?: string
}

const FALLBACK_PROMPT = `You are an expert technical architect. Based on the business analysis and functional specification, create a comprehensive technical specification document.

Project Requirements:
{input}

Business Analysis:
{businessAnalysis}

Functional Specification:
{functionalSpec}

Create a technical specification that includes:

## System Architecture
- **Architecture Pattern**: [Design pattern used]
- **Components**: [System components and modules]
- **Data Flow**: [How data moves through system]
- **Technology Stack**: [Languages, frameworks, databases]

## Database Design
- **Data Model**: [Entity relationships]
- **Schema Design**: [Table structures]
- **Indexing Strategy**: [Performance optimization]
- **Data Migration**: [Upgrade procedures]

## API Design
- **REST Endpoints**: [API specifications]
- **Request/Response**: [Data formats]
- **Authentication**: [Security mechanisms]
- **Rate Limiting**: [Usage controls]

## Security Implementation
- **Authentication System**: [Login mechanisms]
- **Authorization Controls**: [Access permissions]
- **Data Encryption**: [Protection methods]
- **Security Monitoring**: [Threat detection]

## Performance Specifications
- **Response Times**: [Latency requirements]
- **Throughput**: [Transaction volumes]
- **Scalability Plan**: [Growth handling]
- **Caching Strategy**: [Performance optimization]

## Deployment Strategy
- **Infrastructure**: [Server requirements]
- **Environment Setup**: [Dev/Test/Prod]
- **CI/CD Pipeline**: [Automated deployment]
- **Monitoring**: [Health checks and alerts]

## Development Guidelines
- **Coding Standards**: [Code quality rules]
- **Testing Strategy**: [Unit/Integration/E2E tests]
- **Documentation**: [Technical documentation]
- **Version Control**: [Git workflow]

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
  functionalSpec: string,
  customPrompt: string | undefined,
  openaiKey: string,
  userId: string | undefined,
  projectId: string | undefined
) {
  const promptService = createPromptService()
  const openaiClient = createOpenAI({ apiKey: openaiKey })
  
  try {
    // Priority 1: Use custom prompt if provided
    if (customPrompt && customPrompt.trim() !== "") {
      console.log('Using custom prompt from request (streaming)')
      const processedPrompt = customPrompt
        .replace(/{{input}}/g, input)
        .replace(/{{businessAnalysis}}/g, businessAnalysis)
        .replace(/{{functionalSpec}}/g, functionalSpec)
      
      return await streamText({
        model: openaiClient("gpt-4o"),
        prompt: processedPrompt,
      })
    }

    // Priority 2: Load prompt from database
    const promptTemplate = await promptService.getPromptForExecution('technical', userId || 'anonymous')
    
    if (promptTemplate) {
      console.log(`Using database prompt for streaming: ${promptTemplate.name} (v${promptTemplate.version})`)
      
      // Prepare the prompt with combined context
      const context = `Business Analysis:\n${businessAnalysis}\n\nFunctional Specification:\n${functionalSpec}`
      const { processedContent } = await promptService.preparePrompt(
        promptTemplate.id,
        { 
          input: input,
          context: context,
        }
      )
      
      return await streamText({
        model: openaiClient("gpt-4o"),
        prompt: processedContent,
      })
    }

    // Priority 3: Fallback to hardcoded prompt
    console.warn('No database prompt found, using hardcoded fallback for streaming')
    const processedPrompt = FALLBACK_PROMPT
      .replace(/\{input\}/g, input)
      .replace(/\{businessAnalysis\}/g, businessAnalysis)
      .replace(/\{functionalSpec\}/g, functionalSpec)
    
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
    const { input, businessAnalysis, functionalSpec, template, customPrompt, openaiKey, userId, projectId }: TechnicalSpecRequest = await req.json()
    
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

    console.log('🚀 Starting streaming Technical Specification generation...')
    console.log('User ID:', effectiveUserId)
    console.log('Project ID:', projectId)

    const streamResult = await generateWithDatabasePromptStreaming(
      input,
      businessAnalysis,
      functionalSpec,
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
          
          console.log(`✅ Technical Specification streaming completed - ${fullContent.length} characters`)
          
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
    console.error("Error generating streaming technical specification:", error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate technical specification",
        success: false 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
