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
        : `As a Senior Business Analyst with expertise in requirements engineering, create a detailed functional specification based on the business analysis:

Original Input: ${input}
Business Analysis: ${businessAnalysis}

Generate the following structured output:

## Functional Overview
- **System Purpose**: [Clear description of what the system does]
- **Key Capabilities**: [Main functional areas]
- **Success Criteria**: [Measurable outcomes]

## Detailed Functional Requirements
For each functional area, provide:
1. **Requirement ID**: [Unique identifier]
2. **Requirement Title**: [Clear, descriptive title]
3. **Description**: [Detailed functional behavior]
4. **Acceptance Criteria**: [Specific, testable criteria]
5. **Priority**: [Must Have/Should Have/Could Have]
6. **Dependencies**: [Related requirements]

## System Capabilities
### Core Functions
- User management and authentication
- Data processing and storage
- Business logic implementation
- Reporting and analytics

### Integration Requirements
- External API integrations
- Third-party service connections
- Data import/export capabilities
- System interoperability

### Performance Requirements
- Response time specifications
- Throughput requirements
- Scalability targets
- Availability requirements

### Security Requirements
- Authentication mechanisms
- Authorization controls
- Data protection measures
- Compliance requirements

## Data Requirements
- **Data Entities**: [Key data objects]
- **Data Relationships**: [How data connects]
- **Data Validation**: [Quality requirements]
- **Data Lifecycle**: [Creation, update, deletion rules]

## User Interface Requirements
- **User Experience**: [UX principles]
- **Accessibility**: [WCAG compliance]
- **Responsive Design**: [Device compatibility]
- **Navigation**: [User flow requirements]

Ensure all requirements are:
- Specific and measurable
- Testable and verifiable
- Aligned with business objectives
- Technically feasible

Format the response in markdown with clear headings and structured sections.`,
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
