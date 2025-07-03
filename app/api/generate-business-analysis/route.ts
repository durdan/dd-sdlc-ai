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
        : `As a Senior Product Owner with 8+ years of Agile experience, analyze the following business case and extract actionable user stories:

Business Case: ${input}

Generate the following structured output:

## Epic Overview
- **Epic Title**: [Clear, business-focused title]
- **Epic Description**: [2-3 sentences describing the overall business goal]
- **Business Value**: [Quantifiable value/impact]
- **Priority**: [High/Medium/Low with justification]

## User Stories (Format: As a [user type], I want [functionality], so that [benefit])
For each user story, provide:
1. **Story Title**: Clear, action-oriented title
2. **Story Description**: Full user story format
3. **Acceptance Criteria**: 3-5 specific, testable criteria
4. **Story Points**: Estimate (1, 2, 3, 5, 8, 13)
5. **Priority**: High/Medium/Low
6. **Dependencies**: Any blocking or related stories
7. **Definition of Done**: Clear completion criteria

## Personas & User Types
- **Primary Users**: [List main user types]
- **Secondary Users**: [Supporting user types]
- **Admin Users**: [Administrative roles]

## Success Metrics
- **User Adoption**: [Specific metrics]
- **Business Impact**: [ROI/KPI targets]
- **Technical Performance**: [Performance benchmarks]

Focus on creating 5-8 user stories that are:
- Independent and deliverable
- Testable with clear acceptance criteria
- Properly sized for sprint planning
- Aligned with business objectives

Format the response in markdown with clear headings and structured sections.`,
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
