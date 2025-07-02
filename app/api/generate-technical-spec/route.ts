import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

interface TechnicalSpecRequest {
  input: string
  businessAnalysis: string
  functionalSpec: string
  customPrompt?: string
  openaiKey: string
}

export async function POST(req: NextRequest) {
  try {
    const { input, businessAnalysis, functionalSpec, customPrompt, openaiKey }: TechnicalSpecRequest = await req.json()
    
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

    console.log('Generating Technical Specification...')

    const technicalSpec = await generateText({
      model: openaiClient("gpt-4o"),
      prompt: customPrompt && customPrompt.trim() !== "" 
        ? customPrompt
            .replace(/{{input}}/g, input)
            .replace(/{{business_analysis}}/g, businessAnalysis)
            .replace(/{{functional_spec}}/g, functionalSpec)
        : `Create a comprehensive technical specification based on the business analysis and functional specification:
      
      Original Input: ${input}
      Business Analysis: ${businessAnalysis}
      Functional Specification: ${functionalSpec}
      
      Please structure the technical specification as follows:
      1. Technical Overview
      2. System Architecture
      3. Technology Stack
      4. Database Design
      5. API Specifications
      6. Security Implementation
      7. Performance Considerations
      8. Deployment Strategy
      9. Development Guidelines
      
      Focus on technical implementation details and system design in markdown format.`,
    })

    console.log('Technical Specification generated successfully')

    return NextResponse.json({
      technicalSpec: technicalSpec.text,
      success: true
    })

  } catch (error) {
    console.error("Error generating technical specification:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate technical specification",
        success: false 
      },
      { status: 500 }
    )
  }
}
