import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

interface MermaidDiagramsRequest {
  input: string
  businessAnalysis: string
  functionalSpec: string
  technicalSpec: string
  customPrompt?: string
  openaiKey: string
}

export async function POST(req: NextRequest) {
  try {
    const { input, businessAnalysis, functionalSpec, technicalSpec, customPrompt, openaiKey }: MermaidDiagramsRequest = await req.json()
    
    // Validate OpenAI API key
    if (!openaiKey || openaiKey.trim() === '') {
      return NextResponse.json(
        { error: "OpenAI API key is required" },
        { status: 400 }
      )
    }

    // Create OpenAI client with the provided API key
    const openaiClient = createOpenAI({
      apiKey: openaiKey,
    })

    console.log('Generating Mermaid Diagrams...')

    const mermaidDiagrams = await generateText({
      model: openaiClient("gpt-4o"),
      prompt: customPrompt && customPrompt.trim() !== "" 
        ? customPrompt
            .replace(/{{input}}/g, input)
            .replace(/{{business_analysis}}/g, businessAnalysis)
            .replace(/{{functional_spec}}/g, functionalSpec)
            .replace(/{{technical_spec}}/g, technicalSpec)
        : `As a Senior System Architect with expertise in technical documentation, create comprehensive Mermaid diagrams based on the following specifications:

Technical Specification: ${technicalSpec}
Functional Specification: ${functionalSpec}
Business Analysis: ${businessAnalysis}

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

Ensure diagrams are:
- Technically accurate and detailed
- Easy to understand and well-labeled
- Include proper Mermaid syntax
- Show realistic system interactions
- Include error handling and edge cases

Diagram Style: Professional
Complexity Level: Detailed
Focus Area: System Architecture`,
    })

    console.log('Mermaid Diagrams generated successfully')

    return NextResponse.json({
      mermaidDiagrams: mermaidDiagrams.text,
      success: true
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
