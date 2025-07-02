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
    const {
      input,
      template,
      jiraProject,
      confluenceSpace,
      jiraEnabled = false,
      confluenceEnabled = false,
    }: SDLCRequest & { jiraEnabled?: boolean; confluenceEnabled?: boolean } = await req.json()

    // Always generate the core documents
    const businessAnalysis = await generateText({
      model: openai("gpt-4o"),
      prompt: `As a senior business analyst, analyze the following business case and provide a comprehensive business analysis:
      
      Business Case: ${input}
      
      Please provide:
      1. Executive Summary
      2. Business Objectives
      3. Stakeholder Analysis
      4. Success Criteria
      5. Risk Assessment
      6. Timeline Estimates
      7. Resource Requirements
      
      Format the response in markdown with clear headings and structure.`,
    })

    const functionalSpec = await generateText({
      model: openai("gpt-4o"),
      prompt: `Based on the following business analysis, create a detailed functional specification:
      
      Business Analysis: ${businessAnalysis.text}
      
      Please provide:
      1. Functional Requirements (numbered list)
      2. User Stories with acceptance criteria
      3. Use Cases
      4. Data Requirements
      5. Integration Requirements
      6. Performance Requirements
      7. Security Requirements
      
      Format as a markdown technical specification document.`,
    })

    const technicalSpec = await generateText({
      model: openai("gpt-4o"),
      prompt: `Based on the functional specification, create a comprehensive technical specification:
      
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
      
      Include specific technical details and implementation approaches in markdown format.`,
    })

    const uxSpec = await generateText({
      model: openai("gpt-4o"),
      prompt: `Create a UX specification based on the business and functional requirements:
      
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
      
      Focus on user experience and interface design principles in markdown format.`,
    })

    const mermaidDiagrams = await generateText({
      model: openai("gpt-4o"),
      prompt: `Create Mermaid diagrams for the system architecture based on the technical specification:
      
      Technical Specification: ${technicalSpec.text}
      
      Please provide Mermaid code for a comprehensive system architecture diagram.
      Return only valid Mermaid syntax without any additional text or formatting.`,
    })

    let jiraEpic = null
    let confluencePage = null

    // Only create JIRA epic if enabled and configured
    if (jiraEnabled && jiraProject) {
      jiraEpic = {
        key: `${jiraProject}-${Math.floor(Math.random() * 1000)}`,
        summary: `Implementation: ${input.substring(0, 100)}...`,
        description: businessAnalysis.text.substring(0, 500) + "...",
        status: "To Do",
        created: new Date().toISOString(),
        url: `https://company.atlassian.net/browse/${jiraProject}-${Math.floor(Math.random() * 1000)}`,
      }
    }

    // Only create Confluence page if enabled and configured
    if (confluenceEnabled && confluenceSpace) {
      confluencePage = {
        id: Math.floor(Math.random() * 100000),
        title: `SDLC Documentation - ${new Date().toLocaleDateString()}`,
        space: confluenceSpace,
        url: `https://company.atlassian.net/wiki/spaces/${confluenceSpace}/pages/${Math.floor(Math.random() * 100000)}`,
        created: new Date().toISOString(),
      }
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
