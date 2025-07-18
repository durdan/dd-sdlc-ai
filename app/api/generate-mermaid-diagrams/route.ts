import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { type NextRequest } from "next/server"
import { createServerPromptService } from '@/lib/prompt-service-server'
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { anonymousProjectService } from '@/lib/anonymous-project-service'

export const maxDuration = 60

interface MermaidDiagramsRequest {
  input: string
  businessAnalysis?: string
  functionalSpec?: string
  technicalSpec?: string
  uxSpec?: string
  customPrompt?: string
  openaiKey: string
  userId?: string
  projectId?: string
}

// Hardcoded fallback prompt for reliability
const FALLBACK_PROMPT = `As a Senior System Architect with expertise in technical documentation, create comprehensive Mermaid diagrams based on the following project requirements:

Project Requirements: {input}

{optional_context}

Generate the following structured Mermaid diagrams:

## System Architecture Diagram
\`\`\`mermaid
graph TD
    %% Create a high-level system architecture diagram
    %% Include: Frontend, Backend, Database, External Services
    %% Show data flow and component relationships
    Frontend["Frontend Application"]
    Backend["Backend API"]
    Database["Database"]
    Auth["Authentication Service"]
    Cache["Cache Layer"]
    
    Frontend --> Backend
    Backend --> Database
    Backend --> Auth
    Backend --> Cache
\`\`\`

## Database Schema Diagram
\`\`\`mermaid
erDiagram
    %% Create entity relationship diagram
    %% Include: Tables, relationships, key fields
    %% Show primary keys, foreign keys, and constraints
    USER {
        int id PK
        string email
        string name
        datetime created_at
    }
    
    PROJECT {
        int id PK
        string name
        string description
        int user_id FK
        datetime created_at
    }
    
    USER ||--o{ PROJECT : creates
\`\`\`

## User Flow Diagram
\`\`\`mermaid
flowchart TD
    %% Create user journey flowchart
    %% Include: User actions, decision points, system responses
    %% Show happy path and error handling
    Start(["User Starts"]) --> Login{"Login Required?"}
    Login -->|Yes| Auth["Authenticate"]
    Login -->|No| Dashboard["Dashboard"]
    Auth --> Dashboard
    Dashboard --> Action["User Action"]
    Action --> Success["Success"]
    Action --> Error["Error Handling"]
\`\`\`

## API Flow Diagram
\`\`\`mermaid
sequenceDiagram
    %% Create API interaction sequence
    %% Include: Client, Server, Database interactions
    %% Show request/response flow and error handling
    participant Client
    participant API
    participant Database
    
    Client->>API: Request
    API->>Database: Query
    Database-->>API: Response
    API-->>Client: JSON Response
\`\`\`

CRITICAL REQUIREMENTS:
- ALL diagrams MUST use proper Mermaid syntax
- Each diagram MUST be wrapped in \`\`\`mermaid code blocks
- NO truncated or incomplete diagrams
- Generate COMPLETE diagrams with all nodes and relationships
- Test each diagram type for valid Mermaid syntax
- Include meaningful labels and descriptions
- Show realistic system interactions
- Include error handling and edge cases

Diagram Style: Professional
Complexity Level: Detailed  
Focus Area: System Architecture

VALIDATION CHECKLIST:
✓ All diagrams use \`\`\`mermaid syntax
✓ No syntax errors or incomplete structures
✓ All nodes and edges are properly defined
✓ Diagrams are complete and rendereable
✓ Professional labeling and structure
`;

// Parse Mermaid diagrams from content
function parseMermaidDiagrams(content: string): Record<string, string> {
  const diagrams: Record<string, string> = {}
  
  // Split content into sections
  const sections = content.split(/(?=## )/g)
  
  sections.forEach(section => {
    const lines = section.split('\n')
    const title = lines[0].replace('## ', '').toLowerCase()
    
    // Extract mermaid code blocks
    const mermaidMatch = section.match(/```(?:mermaid)?\s*([\s\S]*?)```/)
    if (mermaidMatch && mermaidMatch[1]) {
      const diagramContent = mermaidMatch[1].trim()
      
      // Map section titles to diagram types
      if (title.includes('architecture') || title.includes('system')) {
        diagrams.architecture = diagramContent
      } else if (title.includes('data flow') || title.includes('flow')) {
        diagrams.dataflow = diagramContent
      } else if (title.includes('user journey') || title.includes('journey')) {
        diagrams.userflow = diagramContent
      } else if (title.includes('database') || title.includes('schema')) {
        diagrams.database = diagramContent
      } else if (title.includes('sequence') || title.includes('api')) {
        diagrams.sequence = diagramContent
      } else {
        // Default to architecture if no specific type found
        diagrams.architecture = diagramContent
      }
    }
  })
  
  return diagrams
}

// Track anonymous analytics
async function trackAnonymousAnalytics(
  actionType: string,
  actionData: any,
  userAgent?: string,
  ipAddress?: string,
  referrer?: string
) {
  try {
    // Use service role client to bypass RLS for anonymous analytics
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    await supabase.from('anonymous_analytics').insert({
      action_type: actionType,
      action_data: actionData,
      user_agent: userAgent,
      ip_address: ipAddress,
      referrer: referrer,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error tracking anonymous analytics:', error)
  }
}

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
  businessAnalysis: string | undefined,
  functionalSpec: string | undefined,
  technicalSpec: string | undefined,
  customPrompt: string | undefined,
  openaiKey: string,
  userId: string | undefined,
  projectId: string | undefined
) {
  const promptService = createServerPromptService()
  const startTime = Date.now()
  const openaiClient = createOpenAI({ apiKey: openaiKey })
  
  try {
    // Priority 1: Use custom prompt if provided (legacy support)
    if (customPrompt && customPrompt.trim() !== "") {
      console.log('Using custom prompt from request (streaming)')
      const processedPrompt = customPrompt
        .replace(/{{input}}/g, input)
        .replace(/\{input\}/g, input)
        .replace(/{{business_analysis}}/g, businessAnalysis || '')
        .replace(/\{business_analysis\}/g, businessAnalysis || '')
        .replace(/{{functional_spec}}/g, functionalSpec || '')
        .replace(/\{functional_spec\}/g, functionalSpec || '')
        .replace(/{{technical_spec}}/g, technicalSpec || '')
        .replace(/\{technical_spec\}/g, technicalSpec || '')
      
      return await streamText({
        model: openaiClient("gpt-4o"),
        prompt: processedPrompt,
      })
    }

    // Priority 2: Load prompt from database
    const promptTemplate = await promptService.getPromptForExecution('mermaid', userId || 'anonymous')
    
    if (promptTemplate) {
      console.log(`Using database prompt for streaming: ${promptTemplate.name} (v${promptTemplate.version})`)
      console.log('🔍 Input received:', input.substring(0, 200) + '...')
      console.log('🔍 Input length:', input.length)
      
      // Check what context is available
      const hasBusinessAnalysis = !!(businessAnalysis && businessAnalysis.trim())
      const hasFunctionalSpec = !!(functionalSpec && functionalSpec.trim())
      const hasTechnicalSpec = !!(technicalSpec && technicalSpec.trim())
      
      console.log('🔍 Available context:', {
        hasBusinessAnalysis,
        hasFunctionalSpec,
        hasTechnicalSpec
      })
      
      // Prepare the prompt with available parameters
      const { processedContent } = await promptService.preparePrompt(
        promptTemplate.id,
        { 
          input: input,
          business_analysis: businessAnalysis || '',
          functional_spec: functionalSpec || '',
          technical_spec: technicalSpec || '',
        }
      )
      
      // Check if the prompt contains the input placeholder, if not add it
      let processedContentWithInput = processedContent
      if (!processedContent.includes('{{input}}') && !processedContent.includes('{input}')) {
        console.log('⚠️ Prompt template missing input placeholder, adding it...')
        processedContentWithInput = `## Original Project Requirements:
{{input}}

${processedContent}`
      }
      
      // Clean up any unreplaced variables and provide context
      let cleanedContent = processedContentWithInput
      
      // Handle both {{variable}} and {variable} syntax formats
      cleanedContent = cleanedContent
        .replace(/\{\{input\}\}/g, input)
        .replace(/\{input\}/g, input)
        .replace(/\{\{business_analysis\}\}/g, businessAnalysis || '')
        .replace(/\{business_analysis\}/g, businessAnalysis || '')
        .replace(/\{\{functional_spec\}\}/g, functionalSpec || '')
        .replace(/\{functional_spec\}/g, functionalSpec || '')
        .replace(/\{\{technical_spec\}\}/g, technicalSpec || '')
        .replace(/\{technical_spec\}/g, technicalSpec || '')
      
      // Remove any remaining unreplaced variable placeholders
      cleanedContent = cleanedContent
        .replace(/\{\{[^}]+\}\}/g, '')
        .replace(/\{[^}]+\}/g, '')
      
      // Add intelligent context based on what's available
      if (!hasBusinessAnalysis && !hasFunctionalSpec && !hasTechnicalSpec) {
        // If no other documents are available, add a comprehensive note
        const contextNote = `\n\n## IMPORTANT CONTEXT NOTE:
This Mermaid diagram generation is being performed based on the project requirements only. No business analysis, functional specification, or technical specification documents are available.

**Diagram Generation Approach:**
- Focus on creating comprehensive architectural diagrams that can be refined once other specifications are available
- Infer system architecture and relationships from the project requirements
- Design for common architectural patterns and best practices in the domain
- Include system analysis and modeling tasks to understand technical requirements
- Emphasize scalability, security, and performance considerations in diagrams
- Consider modern architectural patterns and technology stacks

**Next Steps After Diagram Generation:**
- Generate business analysis to refine business context and requirements
- Create functional specification to detail system functionality and user workflows
- Develop technical specification to align diagrams with technical architecture
- Iterate on diagrams based on additional context

Please proceed with creating comprehensive Mermaid diagrams that establish a solid foundation for system visualization.`
        cleanedContent = cleanedContent + contextNote
      } else {
        // Add context about what's available
        const availableDocs = []
        if (hasBusinessAnalysis) availableDocs.push('Business Analysis')
        if (hasFunctionalSpec) availableDocs.push('Functional Specification')
        if (hasTechnicalSpec) availableDocs.push('Technical Specification')
        
        const contextNote = `\n\n## AVAILABLE CONTEXT:
The following documents are available to inform this diagram generation: ${availableDocs.join(', ')}

**Diagram Generation Approach:**
- Leverage the provided documents to create informed architectural diagrams
- Align diagrams with business objectives, functional requirements, and technical architecture
- Ensure consistency with business processes, system functionality, and technical constraints
- Build upon existing context to create comprehensive visual representations
- Validate diagram decisions against available business, functional, and technical context

Please create comprehensive Mermaid diagrams that integrate seamlessly with the provided documents.`
        cleanedContent = cleanedContent + contextNote
      }
      
      console.log('🔍 Final prompt preview:', cleanedContent.substring(0, 500) + '...')
      console.log('🔍 Final prompt length:', cleanedContent.length)
      
      // Execute AI streaming call
      const streamResult = await streamText({
        model: openaiClient("gpt-4o"),
        prompt: cleanedContent,
      })
      
      // Note: We'll log usage after streaming completes in the response handler
      return streamResult
    }

    // Priority 3: Fallback to hardcoded prompt
    console.warn('No database prompt found, using hardcoded fallback for streaming')
    
    // Build optional context from available documents
    const contextParts = []
    if (businessAnalysis && businessAnalysis.trim()) {
      contextParts.push(`Business Analysis: ${businessAnalysis}`)
    }
    if (functionalSpec && functionalSpec.trim()) {
      contextParts.push(`Functional Specification: ${functionalSpec}`)
    }
    if (technicalSpec && technicalSpec.trim()) {
      contextParts.push(`Technical Specification: ${technicalSpec}`)
    }
    
    const optionalContext = contextParts.length > 0 
      ? `\nAdditional Context:\n${contextParts.join('\n\n')}`
      : ''
    
    const processedPrompt = FALLBACK_PROMPT
      .replace(/\{input\}/g, input)
      .replace(/\{\{input\}\}/g, input)
      .replace(/\{optional_context\}/g, optionalContext)
      .replace(/\{\{optional_context\}\}/g, optionalContext)
    
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
    const { input, businessAnalysis, functionalSpec, technicalSpec, uxSpec, customPrompt, openaiKey, userId, projectId }: MermaidDiagramsRequest = await req.json()
    
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

    // Validate input
    if (!input || input.trim() === '') {
      return new Response(
        JSON.stringify({ error: "Project input is required" }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Get authenticated user if not provided
    const user = await getAuthenticatedUser()
    const effectiveUserId = userId || user?.id

    // Track anonymous analytics for diagram generation
    if (!effectiveUserId) {
      const userAgent = req.headers.get('user-agent') || undefined
      const ipAddress = req.headers.get('x-forwarded-for') || 
                       req.headers.get('x-real-ip') || undefined
      const referrer = req.headers.get('referer') || undefined

      await trackAnonymousAnalytics(
        'diagram_generation',
        {
          input: input.substring(0, 500), // Limit input length for analytics
          ai_provider: 'openai',
          model: 'gpt-4o',
          route: 'generate-mermaid-diagrams',
          hasBusinessAnalysis: !!(businessAnalysis && businessAnalysis.trim()),
          hasFunctionalSpec: !!(functionalSpec && functionalSpec.trim()),
          hasTechnicalSpec: !!(technicalSpec && technicalSpec.trim())
        },
        userAgent,
        ipAddress,
        referrer
      )
    }

    console.log('🚀 Starting streaming Mermaid Diagrams generation...')
    console.log('User ID:', effectiveUserId)
    console.log('Project ID:', projectId)
    console.log('Input length:', input.length)
    console.log('Available context:', {
      hasBusinessAnalysis: !!(businessAnalysis && businessAnalysis.trim()),
      hasFunctionalSpec: !!(functionalSpec && functionalSpec.trim()),
      hasTechnicalSpec: !!(technicalSpec && technicalSpec.trim())
    })

    const streamResult = await generateWithDatabasePromptStreaming(
      input,
      businessAnalysis,
      functionalSpec,
      technicalSpec,
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
          
          // Save anonymous project if no authenticated user
          if (!effectiveUserId) {
            try {
              const userAgent = req.headers.get('user-agent') || undefined
              const ipAddress = req.headers.get('x-forwarded-for') || 
                               req.headers.get('x-real-ip') || undefined
              const referrer = req.headers.get('referer') || undefined

              // Extract project title from input
              const projectTitle = input.length > 50 ? 
                input.substring(0, 50) + '...' : input

              // Parse diagrams from content
              const diagrams = parseMermaidDiagrams(fullContent)
              
              // Save to anonymous projects - use architecture type for all diagrams
              await anonymousProjectService.saveAnonymousProject(
                projectTitle,
                input,
                {
                  architecture: fullContent // Save all diagrams as one architecture document
                },
                userAgent,
                ipAddress,
                referrer
              )
              
              console.log('✅ Anonymous mermaid project saved successfully')
            } catch (saveError) {
              console.error('❌ Error saving anonymous mermaid project:', saveError)
            }
          }

          // Send completion signal
          const completionData = JSON.stringify({
            type: 'complete',
            fullContent: fullContent,
            timestamp: Date.now()
          })
          
          controller.enqueue(encoder.encode(`data: ${completionData}\n\n`))
          controller.close()
          
        } catch (error) {
          console.error('Error in streaming:', error)
          const errorData = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Streaming failed',
            timestamp: Date.now()
          })
          
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error("Error generating Mermaid diagrams:", error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate Mermaid diagrams",
        success: false 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
