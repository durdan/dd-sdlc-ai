import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

interface SDLCRequest {
  input: string
  template: string
  jiraProject: string
  confluenceSpace: string
}

interface SDLCResponse {
  businessAnalysis: string
  functionalSpec: string
  technicalSpec: string
  uxSpec: string
  mermaidDiagrams: string
  jiraEpic: any
  confluencePage: any
}

export async function POST(req: NextRequest) {
  try {
    const { input, template, jiraProject, confluenceSpace }: SDLCRequest = await req.json()

    // Step 1: Business Analysis
    const businessAnalysisPrompt = `
    As a senior business analyst, analyze the following business case and provide a comprehensive business analysis:
    
    Business Case: ${input}
    
    Please provide:
    1. Executive Summary
    2. Business Objectives
    3. Stakeholder Analysis
    4. Success Criteria
    5. Risk Assessment
    6. Timeline Estimates
    7. Resource Requirements
    
    Format the response in a structured, professional manner.
    `

    const businessAnalysis = await generateText({
      model: openai("gpt-4o"),
      prompt: businessAnalysisPrompt,
    })

    // Step 2: Functional Specification
    const functionalSpecPrompt = `
    Based on the following business analysis, create a detailed functional specification:
    
    Business Analysis: ${businessAnalysis.text}
    
    Please provide:
    1. Functional Requirements (numbered list)
    2. User Stories with acceptance criteria
    3. Use Cases
    4. Data Requirements
    5. Integration Requirements
    6. Performance Requirements
    7. Security Requirements
    
    Format as a technical specification document.
    `

    const functionalSpec = await generateText({
      model: openai("gpt-4o"),
      prompt: functionalSpecPrompt,
    })

    // Step 3: Technical Specification
    const technicalSpecPrompt = `
    Based on the functional specification, create a comprehensive technical specification:
    
    Functional Specification: ${functionalSpec.text}
    
    Please provide:
    1. System Architecture Overview
    2. Technology Stack Recommendations
    3. Database Design
    4. API Specifications
    5. Security Implementation
    6. Deployment Strategy
    7. Testing Strategy
    8. Monitoring and Logging
    
    Include specific technical details and implementation approaches.
    `

    const technicalSpec = await generateText({
      model: openai("gpt-4o"),
      prompt: technicalSpecPrompt,
    })

    // Step 4: UX Specification
    const uxSpecPrompt = `
    Create a UX specification based on the business and functional requirements:
    
    Business Analysis: ${businessAnalysis.text}
    Functional Specification: ${functionalSpec.text}
    
    Please provide:
    1. User Personas
    2. User Journey Maps
    3. Wireframe Descriptions
    4. UI Component Specifications
    5. Accessibility Requirements
    6. Mobile Responsiveness
    7. Usability Testing Plan
    
    Focus on user experience and interface design principles.
    `

    const uxSpec = await generateText({
      model: openai("gpt-4o"),
      prompt: uxSpecPrompt,
    })

    // Step 5: Mermaid Architecture Diagrams
    const mermaidPrompt = `
    Create Mermaid diagrams for the system architecture based on the technical specification:
    
    Technical Specification: ${technicalSpec.text}
    
    Please provide Mermaid code for:
    1. System Architecture Diagram
    2. Database ERD
    3. User Flow Diagram
    4. API Flow Diagram
    
    Return only valid Mermaid syntax.
    `

    const mermaidDiagrams = await generateText({
      model: openai("gpt-4o"),
      prompt: mermaidPrompt,
    })

    // Simulate JIRA Epic Creation
    const jiraEpic = {
      key: `${jiraProject}-${Math.floor(Math.random() * 1000)}`,
      summary: `Implementation: ${input.substring(0, 100)}...`,
      description: businessAnalysis.text.substring(0, 500) + "...",
      status: "To Do",
      created: new Date().toISOString(),
    }

    // Simulate Confluence Page Creation
    const confluencePage = {
      id: Math.floor(Math.random() * 100000),
      title: `SDLC Documentation - ${new Date().toLocaleDateString()}`,
      space: confluenceSpace,
      url: `https://company.atlassian.net/wiki/spaces/${confluenceSpace}/pages/${Math.floor(Math.random() * 100000)}`,
      created: new Date().toISOString(),
    }

    const response: SDLCResponse = {
      businessAnalysis: businessAnalysis.text,
      functionalSpec: functionalSpec.text,
      technicalSpec: technicalSpec.text,
      uxSpec: uxSpec.text,
      mermaidDiagrams: mermaidDiagrams.text,
      jiraEpic,
      confluencePage,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error generating SDLC documentation:", error)
    return NextResponse.json({ error: "Failed to generate SDLC documentation" }, { status: 500 })
  }
}
