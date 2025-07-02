import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

interface SDLCRequest {
  input: string
  template: string
  jiraProject: string
  confluenceSpace: string
  customPrompts?: {
    business: string
    functional: string
    technical: string
    ux: string
    mermaid: string
  }
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
      openaiKey, // Extract the OpenAI API key from the request
      customPrompts = {}, // Extract custom prompts if provided, default to empty object
    }: SDLCRequest & { jiraEnabled?: boolean; confluenceEnabled?: boolean; openaiKey?: string } = await req.json()

    // Debug logging
    console.log('OpenAI Key received:', openaiKey ? 'Present' : 'Missing')
    console.log('OpenAI Key length:', openaiKey ? openaiKey.length : 0)
    
    // Validate OpenAI API key
    if (!openaiKey || openaiKey.trim() === '') {
      return NextResponse.json(
        { error: 'OpenAI API key is required but was not provided in the request' },
        { status: 400 }
      )
    }

    // Create OpenAI client with the provided API key
    const openaiClient = createOpenAI({ apiKey: openaiKey })
    
    // Always generate the core documents
    const businessAnalysis = await generateText({
      model: openaiClient("gpt-4o"), // Use the client with the provided API key
      prompt: customPrompts?.business && customPrompts.business.trim() !== "" 
        ? customPrompts.business.replace(/{{input}}/g, input) // Use custom prompt if provided
        : `As a senior business analyst, analyze the following business case and provide a comprehensive business analysis:
      
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
      model: openaiClient("gpt-4o"),
      prompt: customPrompts?.functional && customPrompts.functional.trim() !== "" 
        ? customPrompts.functional
            .replace(/{{business_analysis}}/g, businessAnalysis.text)
            .replace(/{{input}}/g, input)
        : `Based on the following business analysis, create a detailed functional specification:
      
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
      model: openaiClient("gpt-4o"),
      prompt: customPrompts?.technical && customPrompts.technical.trim() !== "" 
        ? customPrompts.technical
            .replace(/{{functional_spec}}/g, functionalSpec.text)
            .replace(/{{business_analysis}}/g, businessAnalysis.text)
            .replace(/{{input}}/g, input)
        : `Based on the functional specification, create a comprehensive technical specification:
      
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
      model: openaiClient("gpt-4o"),
      prompt: customPrompts?.ux && customPrompts.ux.trim() !== "" 
        ? customPrompts.ux
            .replace(/{{functional_spec}}/g, functionalSpec.text)
            .replace(/{{business_analysis}}/g, businessAnalysis.text)
            .replace(/{{input}}/g, input)
        : `Create a UX specification based on the business and functional requirements:
      
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
      model: openaiClient("gpt-4o"),
      prompt: customPrompts?.mermaid && customPrompts.mermaid.trim() !== "" 
        ? customPrompts.mermaid
            .replace(/{{technical_spec}}/g, technicalSpec.text)
            .replace(/{{functional_spec}}/g, functionalSpec.text)
            .replace(/{{business_analysis}}/g, businessAnalysis.text)
            .replace(/{{input}}/g, input)
        : `Create Mermaid diagrams for the system architecture based on the technical specification:
      
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
