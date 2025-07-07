import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { createPromptService } from '@/lib/prompt-service'
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

interface UXSpecRequest {
  input: string
  businessAnalysis: string
  functionalSpec: string
  technicalSpec: string
  customPrompt?: string
  openaiKey: string
  userId?: string
  projectId?: string
}

// Hardcoded fallback prompt for reliability
const FALLBACK_PROMPT = `As a Senior UX Designer with expertise in user-centered design, create specific design tasks based on the following requirements:

User Stories: {business_analysis}
Business Analysis: {business_analysis}

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

async function generateWithDatabasePrompt(
  input: string,
  businessAnalysis: string,
  functionalSpec: string,
  technicalSpec: string,
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
        .replace(/{{technical_spec}}/g, technicalSpec)
      
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
    const promptTemplate = await promptService.getPromptForExecution('ux', userId || 'anonymous')
    
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
            technical_spec: technicalSpec,
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
          { input, business_analysis: businessAnalysis, functional_spec: functionalSpec, technical_spec: technicalSpec },
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
          { input, business_analysis: businessAnalysis, functional_spec: functionalSpec, technical_spec: technicalSpec },
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
      .replace(/\{technical_spec\}/g, technicalSpec)
    
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
    const { input, businessAnalysis, functionalSpec, technicalSpec, customPrompt, openaiKey, userId, projectId }: UXSpecRequest = await req.json()
    
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

    console.log('Generating UX Specification with database prompts...')
    console.log('User ID:', effectiveUserId)
    console.log('Project ID:', projectId)

    const result = await generateWithDatabasePrompt(
      input,
      businessAnalysis,
      functionalSpec,
      technicalSpec,
      customPrompt,
      openaiKey,
      effectiveUserId,
      projectId
    )

    console.log(`UX Specification generated successfully using ${result.promptSource} prompt`)
    console.log(`Response time: ${result.responseTime}ms`)

    return NextResponse.json({
      uxSpec: result.content,
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
    console.error("Error generating UX specification:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate UX specification",
        success: false 
      },
      { status: 500 }
    )
  }
}
