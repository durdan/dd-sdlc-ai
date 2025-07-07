import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { createPromptService } from '@/lib/prompt-service'

export const maxDuration = 60

interface SDLCRequest {
  input: string
  template: string
  jiraProject: string
  confluenceSpace: string
  userId?: string
  projectId?: string
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
  metadata?: {
    promptSources: {
      business: string
      functional: string
      technical: string
      ux: string
      mermaid: string
    }
    totalResponseTime: number
    usageLogIds: string[]
  }
}

async function getAuthenticatedUser() {
  try {
    // Auth handled via userId parameter
    // For API routes, we rely on userId being passed in request
    return null
  } catch (error) {
    console.warn('Could not get authenticated user:', error)
    return null
  }
}

async function generateWithDatabasePrompt(
  documentType: 'business' | 'functional' | 'technical' | 'ux' | 'mermaid',
  variables: Record<string, string>,
  customPrompt: string | undefined,
  openaiKey: string,
  userId: string | undefined,
  projectId: string | undefined,
  fallbackPrompt: string
) {
  const promptService = createPromptService()
  const startTime = Date.now()
  const openaiClient = createOpenAI({ apiKey: openaiKey })
  
  try {
    // Priority 1: Use custom prompt if provided (legacy support)
    if (customPrompt && customPrompt.trim() !== "") {
      console.log(`Using custom ${documentType} prompt from request`)
      let processedPrompt = customPrompt
      for (const [key, value] of Object.entries(variables)) {
        processedPrompt = processedPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value)
      }
      
      const result = await generateText({
        model: openaiClient("gpt-4o"),
        prompt: processedPrompt,
      })
      
      return {
        content: result.text,
        promptSource: 'custom',
        responseTime: Date.now() - startTime
      }
    }

    // Priority 2: Load prompt from database
    const promptTemplate = await promptService.getPromptForExecution(documentType, userId || 'anonymous')
    
    if (promptTemplate) {
      console.log(`Using database ${documentType} prompt: ${promptTemplate.name} (v${promptTemplate.version})`)
      
      try {
        // Prepare the prompt
        const { processedContent } = await promptService.preparePrompt(
          promptTemplate.id,
          variables
        )
        
        // Execute AI call
        const aiResult = await generateText({
          model: openaiClient("gpt-4o"),
          prompt: processedContent,
        })
        
        const responseTime = Date.now() - startTime
        
        // Log successful usage
        const usageLogId = await promptService.logUsage(
          promptTemplate.id,
          userId || 'anonymous',
          variables,
          {
            content: aiResult.text,
            input_tokens: Math.floor(processedContent.length / 4),
            output_tokens: Math.floor(aiResult.text.length / 4),
          },
          responseTime,
          true,
          undefined,
          projectId,
          'gpt-4o'
        )
        
        return {
          content: aiResult.text,
          promptSource: 'database',
          promptId: promptTemplate.id,
          promptName: promptTemplate.name,
          responseTime,
          usageLogId
        }
      } catch (aiError) {
        // Log failed usage
        const responseTime = Date.now() - startTime
        await promptService.logUsage(
          promptTemplate.id,
          userId || 'anonymous',
          variables,
          { content: '', input_tokens: 0, output_tokens: 0 },
          responseTime,
          false,
          aiError instanceof Error ? aiError.message : 'AI execution failed',
          projectId,
          'gpt-4o'
        )
        throw aiError
      }
    }

    // Priority 3: Fallback to hardcoded prompt
    console.warn(`No database ${documentType} prompt found, using hardcoded fallback`)
    throw new Error('No database prompt available')
    
  } catch (error) {
    console.warn(`Database ${documentType} prompt failed, using hardcoded fallback:`, error)
    
    // Fallback execution with hardcoded prompt
    let processedPrompt = fallbackPrompt
    for (const [key, value] of Object.entries(variables)) {
      processedPrompt = processedPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
    }
    
    const result = await generateText({
      model: openaiClient("gpt-4o"),
      prompt: processedPrompt,
    })
    
    return {
      content: result.text,
      promptSource: 'fallback',
      responseTime: Date.now() - startTime,
      fallbackReason: error instanceof Error ? error.message : 'Unknown error'
    }
  }
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
      openaiKey,
      customPrompts = {},
      userId,
      projectId,
    }: SDLCRequest & { jiraEnabled?: boolean; confluenceEnabled?: boolean; openaiKey?: string } = await req.json()

    // Validate OpenAI API key
    if (!openaiKey || openaiKey.trim() === '') {
      return NextResponse.json(
        { error: 'OpenAI API key is required but was not provided in the request' },
        { status: 400 }
      )
    }

    // Get authenticated user if not provided
    const user = await getAuthenticatedUser()
    const effectiveUserId = userId || user?.id

    console.log('Generating SDLC documentation with database prompts...')
    console.log('User ID:', effectiveUserId)
    console.log('Project ID:', projectId)

    const totalStartTime = Date.now()
    const promptSources: any = {}
    const usageLogIds: string[] = []

    // Generate business analysis
    const businessResult = await generateWithDatabasePrompt(
      'business',
      { input },
      customPrompts?.business,
      openaiKey,
      effectiveUserId,
      projectId,
      `As a senior business analyst, analyze the following business case and provide a comprehensive business analysis:
      
      Business Case: {input}
      
      Please provide:
      1. Executive Summary
      2. Business Objectives
      3. Stakeholder Analysis
      4. Success Criteria
      5. Risk Assessment
      6. Timeline Estimates
      7. Resource Requirements
      
      Format the response in markdown with clear headings and structure.`
    )
    promptSources.business = businessResult.promptSource
    if (businessResult.usageLogId) usageLogIds.push(businessResult.usageLogId)

    // Generate functional specification
    const functionalResult = await generateWithDatabasePrompt(
      'functional',
      { input, business_analysis: businessResult.content },
      customPrompts?.functional,
      openaiKey,
      effectiveUserId,
      projectId,
      `Based on the following business analysis, create a detailed functional specification:
      
      Business Analysis: {business_analysis}
      
      Please provide:
      1. Functional Requirements (numbered list)
      2. User Stories with acceptance criteria
      3. Use Cases
      4. Data Requirements
      5. Integration Requirements
      6. Performance Requirements
      7. Security Requirements
      
      Format as a markdown technical specification document.`
    )
    promptSources.functional = functionalResult.promptSource
    if (functionalResult.usageLogId) usageLogIds.push(functionalResult.usageLogId)

    // Generate technical specification
    const technicalResult = await generateWithDatabasePrompt(
      'technical',
      { 
        input, 
        business_analysis: businessResult.content,
        functional_spec: functionalResult.content 
      },
      customPrompts?.technical,
      openaiKey,
      effectiveUserId,
      projectId,
      `Based on the functional specification, create a comprehensive technical specification:
      
      Functional Specification: {functional_spec}
      
      Please provide:
      1. System Architecture Overview
      2. Technology Stack Recommendations
      3. Database Design
      4. API Specifications
      5. Security Implementation
      6. Deployment Strategy
      7. Testing Strategy
      8. Monitoring and Logging
      
      Include specific technical details and implementation approaches in markdown format.`
    )
    promptSources.technical = technicalResult.promptSource
    if (technicalResult.usageLogId) usageLogIds.push(technicalResult.usageLogId)

    // Generate UX specification
    const uxResult = await generateWithDatabasePrompt(
      'ux',
      { 
        input, 
        business_analysis: businessResult.content,
        functional_spec: functionalResult.content,
        technical_spec: technicalResult.content
      },
      customPrompts?.ux,
      openaiKey,
      effectiveUserId,
      projectId,
      `Create a UX specification based on the business and functional requirements:
      
      Business Analysis: {business_analysis}
      Functional Specification: {functional_spec}
      
      Please provide:
      1. User Personas
      2. User Journey Maps
      3. Wireframe Descriptions
      4. UI Component Specifications
      5. Accessibility Requirements
      6. Mobile Responsiveness
      7. Usability Testing Plan
      
      Focus on user experience and interface design principles in markdown format.`
    )
    promptSources.ux = uxResult.promptSource
    if (uxResult.usageLogId) usageLogIds.push(uxResult.usageLogId)

    // Generate Mermaid diagrams
    const mermaidResult = await generateWithDatabasePrompt(
      'mermaid',
      { 
        input, 
        business_analysis: businessResult.content,
        functional_spec: functionalResult.content,
        technical_spec: technicalResult.content
      },
      customPrompts?.mermaid,
      openaiKey,
      effectiveUserId,
      projectId,
      `Create Mermaid diagrams for the system architecture based on the technical specification:
      
      Technical Specification: {technical_spec}
      
      Please provide Mermaid code for a comprehensive system architecture diagram.
      Return only valid Mermaid syntax without any additional text or formatting.`
    )
    promptSources.mermaid = mermaidResult.promptSource
    if (mermaidResult.usageLogId) usageLogIds.push(mermaidResult.usageLogId)

    let jiraEpic = null
    let confluencePage = null

    // Only create JIRA epic if enabled and configured
    if (jiraEnabled && jiraProject) {
      jiraEpic = {
        key: `${jiraProject}-${Math.floor(Math.random() * 1000)}`,
        summary: `Implementation: ${input.substring(0, 100)}...`,
        description: businessResult.content.substring(0, 500) + "...",
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

    const totalResponseTime = Date.now() - totalStartTime

    console.log('SDLC documentation generated successfully')
    console.log('Prompt sources:', promptSources)
    console.log(`Total response time: ${totalResponseTime}ms`)

    const response: SDLCResponse = {
      businessAnalysis: businessResult.content,
      functionalSpec: functionalResult.content,
      technicalSpec: technicalResult.content,
      uxSpec: uxResult.content,
      mermaidDiagrams: mermaidResult.content,
      jiraEpic,
      confluencePage,
      metadata: {
        promptSources,
        totalResponseTime,
        usageLogIds
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error generating SDLC documentation:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to generate SDLC documentation" 
    }, { status: 500 })
  }
}
