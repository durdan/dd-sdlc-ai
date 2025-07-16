import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { createServerPromptService } from '@/lib/prompt-service-server'
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

interface MermaidDiagramsRequest {
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
const FALLBACK_PROMPT = `As a Senior System Architect with expertise in technical documentation, create comprehensive Mermaid diagrams based on the following specifications:

Technical Specification: {technical_spec}
Functional Specification: {functional_spec}
Business Analysis: {business_analysis}

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
  const promptService = createServerPromptService()
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
        maxTokens: 8000,
      })
      
      return {
        content: result.text,
        promptSource: 'custom',
        responseTime: Date.now() - startTime
      }
    }

    // Priority 2: Load prompt from database
    const promptTemplate = await promptService.getPromptForExecution('mermaid', userId || 'anonymous')
    
    if (promptTemplate) {
      console.log('Using database prompt:', promptTemplate.name, 'version:', promptTemplate.version)
      
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
          maxTokens: 8000,
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
      maxTokens: 8000,
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
    const { input, businessAnalysis, functionalSpec, technicalSpec, customPrompt, openaiKey, userId, projectId }: MermaidDiagramsRequest = await req.json()
    
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

    console.log('Generating Mermaid Diagrams with database prompts...')
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

    // Log diagram generation for analytics (logged-in and anonymous)
    try {
      const supabase = await createClient()
      const userAgent = req.headers.get('user-agent') || 'unknown'
      
      if (effectiveUserId) {
        // Log for authenticated users
        await supabase.from('project_generations').insert({
          user_id: effectiveUserId,
          project_type: 'diagram',
          generation_method: 'user',
          ai_provider: 'openai',
          tokens_used: 0,
          success: true,
          metadata: {
            input,
            businessAnalysis,
            functionalSpec,
            technicalSpec,
            userAgent
          },
          created_at: new Date().toISOString()
        })
      } else {
        // Log for anonymous users in separate table using service role
        const { createClient: createServiceClient } = await import('@supabase/supabase-js')
        const serviceSupabase = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        
        await serviceSupabase.from('anonymous_analytics').insert({
          action_type: 'diagram_generation',
          action_data: {
            input: input.substring(0, 500), // Limit input size
            businessAnalysis: businessAnalysis?.substring(0, 200),
            functionalSpec: functionalSpec?.substring(0, 200),
            technicalSpec: technicalSpec?.substring(0, 200),
            ai_provider: 'openai'
          },
          user_agent: userAgent,
          timestamp: new Date().toISOString()
        })
      }
    } catch (logError) {
      console.warn('Failed to log diagram generation:', logError)
    }

    return NextResponse.json({
      mermaidDiagrams: result.content,
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
    console.error("Error generating Mermaid diagrams:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate Mermaid diagrams",
        success: false 
      },
      { status: 500 }
    )
  }
}
