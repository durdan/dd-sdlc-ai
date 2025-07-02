import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

interface FunctionalSpecRequest {
  input: string
  businessAnalysis: string
  customPrompt?: string
  openaiKey: string
}

export async function POST(req: NextRequest) {
  try {
    const { input, businessAnalysis, customPrompt, openaiKey }: FunctionalSpecRequest = await req.json()
    
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

    console.log('Generating Functional Specification...')

    const functionalSpec = await generateText({
      model: openaiClient("gpt-4o"),
      prompt: customPrompt && customPrompt.trim() !== "" 
        ? customPrompt
            .replace(/{{input}}/g, input)
            .replace(/{{business_analysis}}/g, businessAnalysis)
        : `Create a detailed functional specification based on the business analysis:
      
      Original Input: ${input}
      Business Analysis: ${businessAnalysis}
      
      Please structure the functional specification as follows:
      1. Functional Overview
      2. System Requirements
      3. User Stories and Use Cases
      4. Data Requirements
      5. Integration Requirements
      6. Performance Requirements
      7. Security Requirements
      8. Acceptance Criteria
      
      Focus on detailed functional requirements and user interactions in markdown format.`,
    })

    console.log('Functional Specification generated successfully')

    return NextResponse.json({
      functionalSpec: functionalSpec.text,
      success: true
    })

  } catch (error) {
    console.error("Error generating functional specification:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate functional specification",
        success: false 
      },
      { status: 500 }
    )
  }
}
