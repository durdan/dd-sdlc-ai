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
        : `As a Senior Software Architect with 10+ years of full-stack development experience, break down the following functional requirements into specific development tasks:

Functional Requirements: ${functionalSpec}
Business Analysis: ${businessAnalysis}

Generate the following structured output:

## Technical Epic
- **Epic Title**: [Technical implementation focus]
- **Technical Approach**: [Architecture pattern/approach]
- **Technology Stack**: [Specific technologies]

## Development Tasks
For each task, provide:
1. **Task Title**: Clear, action-oriented (e.g., "Implement user authentication API")
2. **Task Description**: Technical implementation details
3. **Acceptance Criteria**: Technical completion criteria
4. **Story Points**: Effort estimate (1, 2, 3, 5, 8)
5. **Components**: Frontend/Backend/Database/DevOps
6. **Dependencies**: Technical prerequisites
7. **Definition of Done**: Code quality, testing, documentation requirements

## Task Categories:
### Backend Development
- API endpoint implementation
- Database schema design
- Business logic implementation
- Authentication/authorization
- Data validation and processing

### Frontend Development
- UI component development
- State management
- API integration
- Form handling and validation
- Responsive design implementation

### Infrastructure & DevOps
- Database setup and configuration
- CI/CD pipeline setup
- Environment configuration
- Monitoring and logging
- Security implementation

### Testing & Quality Assurance
- Unit test implementation
- Integration test setup
- End-to-end test scenarios
- Performance testing
- Security testing

## Technical Debt & Improvements
- Code refactoring opportunities
- Performance optimizations
- Security enhancements
- Documentation updates

Create 8-12 specific, actionable development tasks that are:
- Technically detailed and implementable
- Properly estimated for sprint planning
- Categorized by development area
- Include clear technical acceptance criteria

Architecture Pattern: Microservices
Cloud Platform: AWS
Database Type: Relational
Security Level: Enterprise`,
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
