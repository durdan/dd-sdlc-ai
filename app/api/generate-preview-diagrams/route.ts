import { createOpenAI } from "@ai-sdk/openai"
import { generateText, streamText } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { ServerPromptService } from "@/lib/prompt-service-server"

export const maxDuration = 30

interface PreviewDiagramsRequest {
  input: string
  stream?: boolean
}

// Fallback prompt if system prompt not available
const FALLBACK_SYSTEM_PROMPT = `You are an expert system architect and technical documentation specialist. Your role is to create comprehensive Mermaid diagrams that visualize system architecture, data flows, and technical relationships based on user requirements.

Generate professional Mermaid diagrams that showcase the technical depth and architectural thinking capabilities of our SDLC.dev platform. Create exactly 4 different diagram types:

## System Architecture Diagram
\`\`\`mermaid
graph TB
    subgraph "Frontend Layer"
        A[Web Application]
        B[Mobile App]
    end
    
    subgraph "API Gateway"
        C[API Gateway]
        D[Load Balancer]
    end
    
    subgraph "Backend Services"
        E[Auth Service]
        F[Business Logic]
        G[Data Processing]
    end
    
    subgraph "Data Layer"
        H[Database]
        I[Cache]
        J[File Storage]
    end
    
    A --> C
    B --> C
    C --> D
    D --> E
    D --> F
    D --> G
    E --> H
    F --> H
    G --> I
    F --> J
\`\`\`

## Data Flow Diagram
\`\`\`mermaid
graph LR
    A[User Input] --> B[Validation]
    B --> C[Processing Engine]
    C --> D[Business Rules]
    D --> E[Data Transformation]
    E --> F[Storage Layer]
    F --> G[Response Generation]
    G --> H[User Interface]
\`\`\`

## User Journey Diagram
\`\`\`mermaid
journey
    title User Experience Flow
    section Authentication
      Login: 5: User
      Verify: 3: System
      Redirect: 4: System
    section Core Features
      Navigate: 5: User
      Process: 4: System
      Display: 5: User
    section Completion
      Review: 5: User
      Submit: 4: User
      Confirm: 5: System
\`\`\`

## Database Schema Diagram
\`\`\`mermaid
erDiagram
    USERS {
        int id PK
        string username
        string email
        string password_hash
        datetime created_at
        datetime updated_at
    }
    
    PROJECTS {
        int id PK
        string name
        string description
        int user_id FK
        datetime created_at
        datetime updated_at
    }
    
    DOCUMENTS {
        int id PK
        string title
        text content
        string document_type
        int project_id FK
        datetime created_at
        datetime updated_at
    }
    
    USERS ||--o{ PROJECTS : "creates"
    PROJECTS ||--o{ DOCUMENTS : "contains"
\`\`\`

Always maintain professional quality and ensure diagrams are syntactically correct and visually appealing.`

// Get system prompt from database with fallback
const getSystemPrompt = async (): Promise<string> => {
  try {
    console.log('🔍 Fetching system prompt for mermaid diagrams...')
    
    const promptService = new ServerPromptService()
    const systemPrompt = await promptService.getActivePrompt('mermaid')
    
    if (systemPrompt?.prompt_content) {
      console.log("✅ Using system prompt from database")
      return systemPrompt.prompt_content
    }
    
    console.log("⚠️ No system prompt found in database, using fallback")
    return FALLBACK_SYSTEM_PROMPT
  } catch (error) {
    console.error("❌ Error fetching system prompt:", error)
    console.log("⚠️ Using fallback prompts due to error")
    return FALLBACK_SYSTEM_PROMPT
  }
}

export async function POST(request: NextRequest) {
  try {
    const { input, stream = true }: PreviewDiagramsRequest = await request.json()

    if (!input?.trim()) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 })
    }

    // Rate limiting for unauthenticated requests
    if (input.length > 2000) {
      return NextResponse.json({ 
        error: "Input too long. Please limit to 2000 characters for preview." 
      }, { status: 400 })
    }

    // Get system prompt
    const systemPrompt = await getSystemPrompt()

    // Create OpenAI client
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: "OpenAI API key not configured" 
      }, { status: 500 })
    }

    if (stream) {
      // Streaming response
      const result = await streamText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: `Based on the following requirements, generate comprehensive Mermaid diagrams that demonstrate professional system architecture thinking:

Requirements: ${input}

Generate exactly 4 different diagram types with clear sections and proper Mermaid syntax.`,
        temperature: 0.7,
        maxTokens: 8000,
      })

      let fullContent = ""
      let progress = 0

      // Create a readable stream
      const stream = new ReadableStream({
        async start(controller) {
          // Send initial progress
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: 'progress',
                progress: 0,
                message: 'Analyzing system requirements...'
              })}\n\n`
            )
          )

          try {
            for await (const delta of result.textStream) {
              fullContent += delta
              progress = Math.min(90, Math.floor(fullContent.length / 30))
              
              // Send progress updates
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    type: 'chunk',
                    content: delta,
                    fullContent,
                    progress,
                    message: progress < 30 ? 'Analyzing system requirements...' : 
                             progress < 60 ? 'Generating architecture diagrams...' : 
                             'Finalizing diagrams...'
                  })}\n\n`
                )
              )
            }

            // Send completion
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({
                  type: 'complete',
                  fullContent,
                  progress: 100,
                  message: 'Architecture diagrams generated successfully!'
                })}\n\n`
              )
            )
          } catch (error) {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({
                  type: 'error',
                  error: error instanceof Error ? error.message : 'Generation failed'
                })}\n\n`
              )
            )
          }

          controller.close()
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Non-streaming response
      const result = await generateText({
        model: openai("gpt-4-turbo-preview"),
        system: systemPrompt,
        prompt: `Based on the following requirements, generate comprehensive Mermaid diagrams:

Requirements: ${input}

Generate exactly 4 different diagram types with clear sections and proper Mermaid syntax.`,
        temperature: 0.7,
        maxTokens: 8000,
      })

      return NextResponse.json({
        diagrams: result.text,
        message: "Diagrams generated successfully"
      })
    }
  } catch (error) {
    console.error("Error in generate-preview-diagrams:", error)
    return NextResponse.json(
      { error: "Failed to generate diagrams" },
      { status: 500 }
    )
  }
} 