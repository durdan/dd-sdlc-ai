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
        : `Create comprehensive Mermaid diagrams for the system architecture based on the specifications:
      
      Original Input: ${input}
      Business Analysis: ${businessAnalysis}
      Functional Specification: ${functionalSpec}
      Technical Specification: ${technicalSpec}
      
      Please create the following Mermaid diagrams in valid Mermaid syntax:
      
      1. **System Architecture Diagram** - Show the overall system components and their relationships
      2. **Database Schema Diagram** - Show entities, relationships, and key attributes  
      3. **User Flow Diagram** - Show the main user journeys and decision points
      4. **API Flow Diagram** - Show the API endpoints and data flow between components
      
      Important guidelines:
      - Return only valid Mermaid syntax without any additional text, formatting, or markdown code blocks
      - Use proper Mermaid diagram types (graph, flowchart, erDiagram, sequenceDiagram, etc.)
      - Ensure all node IDs are unique and follow Mermaid naming conventions
      - Separate each diagram with a clear comment indicating its purpose
      - Make sure the syntax is completely valid and renderable by Mermaid.js
      
      Start with the System Architecture diagram:`,
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
