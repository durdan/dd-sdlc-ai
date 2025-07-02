import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

interface BusinessAnalysisRequest {
  input: string
  template: string
  customPrompt?: string
  openaiKey: string
}

export async function POST(req: NextRequest) {
  try {
    const { input, template, customPrompt, openaiKey }: BusinessAnalysisRequest = await req.json()
    
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

    console.log('Generating Business Analysis...')

    const businessAnalysis = await generateText({
      model: openaiClient("gpt-4o"),
      prompt: customPrompt && customPrompt.trim() !== "" 
        ? customPrompt.replace(/{{input}}/g, input)
        : `Create a comprehensive business analysis document for the following input:
      
      Input: ${input}
      
      Please structure the analysis as follows:
      1. Executive Summary
      2. Business Objectives
      3. Stakeholder Analysis
      4. Requirements Overview
      5. Success Metrics
      6. Risk Analysis
      7. Budget Considerations
      8. Timeline Considerations
      
      Focus on business value and strategic alignment in markdown format.`,
    })

    console.log('Business Analysis generated successfully')

    return NextResponse.json({
      businessAnalysis: businessAnalysis.text,
      success: true
    })

  } catch (error) {
    console.error("Error generating business analysis:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate business analysis",
        success: false 
      },
      { status: 500 }
    )
  }
}
