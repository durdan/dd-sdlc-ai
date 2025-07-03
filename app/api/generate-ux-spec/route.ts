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
        : `As a Senior UX Designer with expertise in user-centered design, create specific design tasks based on the following requirements:

User Stories: ${businessAnalysis}
Business Analysis: ${businessAnalysis}

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

Focus on usability and accessibility and ensure the design supports efficient task completion.`,
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
