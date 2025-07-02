import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

interface UXSpecRequest {
  input: string
  businessAnalysis: string
  functionalSpec: string
  technicalSpec: string
  customPrompt?: string
  openaiKey: string
}

export async function POST(req: NextRequest) {
  try {
    const { input, businessAnalysis, functionalSpec, technicalSpec, customPrompt, openaiKey }: UXSpecRequest = await req.json()
    
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

    console.log('Generating UX Specification...')

    const uxSpec = await generateText({
      model: openaiClient("gpt-4o"),
      prompt: customPrompt && customPrompt.trim() !== "" 
        ? customPrompt
            .replace(/{{input}}/g, input)
            .replace(/{{business_analysis}}/g, businessAnalysis)
            .replace(/{{functional_spec}}/g, functionalSpec)
            .replace(/{{technical_spec}}/g, technicalSpec)
        : `Create a comprehensive UX specification based on the business analysis, functional specification, and technical specification:
      
      Original Input: ${input}
      Business Analysis: ${businessAnalysis}
      Functional Specification: ${functionalSpec}
      Technical Specification: ${technicalSpec}
      
      Please structure the UX specification as follows:
      1. UX Overview and Objectives
      2. User Personas and Journey Maps
      3. Information Architecture
      4. Wireframes and Layout Guidelines
      5. UI Components and Design System
      6. Interaction Design Patterns
      7. Accessibility Requirements
      8. Usability Testing Plan
      
      Focus on user experience and interface design principles in markdown format.`,
    })

    console.log('UX Specification generated successfully')

    return NextResponse.json({
      uxSpec: uxSpec.text,
      success: true
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
