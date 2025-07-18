import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { type NextRequest } from "next/server"
import { createServerPromptService } from '@/lib/prompt-service-server'
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

interface UXSpecRequest {
  input: string
  businessAnalysis?: string
  functionalSpec?: string
  technicalSpec?: string
  customPrompt?: string
  openaiKey: string
  userId?: string
  projectId?: string
}

// Hardcoded fallback prompt for reliability
const FALLBACK_PROMPT = `As a Senior UX Designer with expertise in user-centered design, create specific design tasks based on the following project requirements:

Project Requirements: {input}

{optional_context}

Generate the following structured output:

## UX Epic
- **Epic Title**: [User experience focus]
- **Design Approach**: [Design methodology]
- **Success Metrics**: [User experience KPIs]

## Design Tasks
For each task, provide:
1. **Task Title**: Clear design deliverable (e.g., "Create user onboarding wireframes")
2. **Task Description**: Design scope and requirements
3. **Deliverables**: Specific design artifacts
4. **Story Points**: Design effort estimate (1, 2, 3, 5, 8)
5. **User Impact**: How this improves user experience
6. **Dependencies**: Design prerequisites
7. **Definition of Done**: Design completion criteria

## Design Task Categories:
### Research & Discovery
- User research and interviews
- Competitive analysis
- User journey mapping
- Persona development
- Usability testing

### Information Architecture
- Site map creation
- User flow diagrams
- Content strategy
- Navigation design
- Information hierarchy

### Visual Design
- Wireframe creation
- Mockup development
- Visual style guide
- Component library
- Icon and illustration design

### Prototyping & Testing
- Interactive prototype development
- Usability testing sessions
- A/B test setup
- Accessibility review
- Design system documentation

Create 6-10 specific design tasks that are:
- User-focused and experience-driven
- Deliverable-based with clear outcomes
- Properly scoped for design sprints
- Include user validation methods

Target Devices: Desktop, Mobile, Tablet
Design System: Material Design
User Experience Level: Intermediate
Accessibility Standard: WCAG 2.1 AA

Focus on usability and accessibility and ensure the design supports efficient task completion.`

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
    const promptTemplate = await promptService.getPromptForExecution('ux', userId || 'anonymous')
    
    console.log('🔍 Prompt template retrieved:', {
      found: !!promptTemplate,
      name: promptTemplate?.name,
      id: promptTemplate?.id,
      contentLength: promptTemplate?.prompt_content?.length,
      contentPreview: promptTemplate?.prompt_content?.substring(0, 200)
    })
    
    if (promptTemplate?.prompt_content) {
      console.log('✅ Using database prompt for streaming:', promptTemplate.name)
      
      // Debug: Check the exact content of the prompt
      console.log('🔍 Full prompt content length:', promptTemplate.prompt_content.length)
      console.log('🔍 First 500 chars of prompt:', promptTemplate.prompt_content.substring(0, 500))
      console.log('🔍 Last 500 chars of prompt:', promptTemplate.prompt_content.substring(promptTemplate.prompt_content.length - 500))
      console.log('🔍 All occurrences of "input" in prompt:', (promptTemplate.prompt_content.match(/input/gi) || []).length)
      console.log('🔍 All occurrences of "{{input}}" in prompt:', (promptTemplate.prompt_content.match(/\{\{input\}\}/g) || []).length)
      console.log('🔍 All occurrences of "{input}" in prompt:', (promptTemplate.prompt_content.match(/\{input\}/g) || []).length)
      
      // Build optional context from available documents
      const contextParts = []
      const hasBusinessAnalysis = businessAnalysis && businessAnalysis.trim()
      const hasFunctionalSpec = functionalSpec && functionalSpec.trim()
      const hasTechnicalSpec = technicalSpec && technicalSpec.trim()
      
      if (hasBusinessAnalysis) {
        contextParts.push(`Business Analysis: ${businessAnalysis}`)
      }
      if (hasFunctionalSpec) {
        contextParts.push(`Functional Specification: ${functionalSpec}`)
      }
      if (hasTechnicalSpec) {
        contextParts.push(`Technical Specification: ${technicalSpec}`)
      }
      
      let processedContent = promptTemplate.prompt_content
      
      // Check if the prompt contains the input placeholder, if not add it
      if (!processedContent.includes('{{input}}') && !processedContent.includes('{input}')) {
        console.log('⚠️ Prompt template missing input placeholder, adding it...')
        processedContent = `## Original Project Requirements:
{{input}}

${processedContent}`
      }
      
      let cleanedContent = processedContent
      
      console.log('🔍 Input value received:', input)
      console.log('🔍 Input type:', typeof input)
      console.log('🔍 Input length:', input?.length)
      console.log('🔍 Original prompt content preview:', processedContent.substring(0, 200))
      console.log('🔍 Does prompt contain {{input}}?', processedContent.includes('{{input}}'))
      console.log('🔍 Does prompt contain {input}?', processedContent.includes('{input}'))
      
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
      
      console.log('🔍 After replacement preview:', cleanedContent.substring(0, 200))
      
      // Remove any remaining unreplaced variables
      cleanedContent = cleanedContent
        .replace(/\{\{[^}]+\}\}/g, '')
        .replace(/\{[^}]+\}/g, '')
      
      console.log('🔍 Does cleaned content still contain {{input}}?', cleanedContent.includes('{{input}}'))
      
      // Add intelligent context based on what's available
      if (!hasBusinessAnalysis && !hasFunctionalSpec && !hasTechnicalSpec) {
        // If no other documents are available, add a comprehensive note
        const contextNote = `\n\n## IMPORTANT CONTEXT NOTE:
This UX specification is being generated based on the project requirements only. No business analysis, functional specification, or technical specification documents are available.

**UX Specification Approach:**
- Focus on creating comprehensive user experience design that can be refined once other specifications are available
- Infer user needs and workflows from the project requirements
- Design for common UX patterns and best practices in the domain
- Include user research and testing tasks to understand user context
- Emphasize usability, accessibility, and user-centered design principles
- Consider modern design systems and interaction patterns

**Next Steps After UX Specification:**
- Generate business analysis to refine business context and user needs
- Create functional specification to detail system functionality and user workflows
- Develop technical specification to align UX design with technical architecture
- Iterate on UX design based on additional context

Please proceed with creating a comprehensive UX specification that establishes a solid foundation for user experience design.`
        cleanedContent = cleanedContent + contextNote
      } else {
        // Add context about what's available
        const availableDocs = []
        if (hasBusinessAnalysis) availableDocs.push('Business Analysis')
        if (hasFunctionalSpec) availableDocs.push('Functional Specification')
        if (hasTechnicalSpec) availableDocs.push('Technical Specification')
        
        const contextNote = `\n\n## AVAILABLE CONTEXT:
The following documents are available to inform this UX specification: ${availableDocs.join(', ')}

**UX Specification Approach:**
- Leverage the provided documents to create informed user experience design
- Align UX design with business objectives, functional requirements, and technical architecture
- Ensure consistency with business processes, system functionality, and technical constraints
- Build upon existing context to create comprehensive UX specifications
- Validate UX decisions against available business, functional, and technical context

Please create a comprehensive UX specification that integrates seamlessly with the provided documents.`
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
    const { input, businessAnalysis, functionalSpec, technicalSpec, customPrompt, openaiKey, userId, projectId }: UXSpecRequest = await req.json()
    
    console.log('🔍 POST handler - Raw input received:', input)
    console.log('🔍 POST handler - Input type:', typeof input)
    console.log('🔍 POST handler - Input length:', input?.length)
    
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

    console.log('🚀 Starting streaming UX Specification generation...')
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
    console.error("Error generating UX specification:", error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate UX specification",
        success: false 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
