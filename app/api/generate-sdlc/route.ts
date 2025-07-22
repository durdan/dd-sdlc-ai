import { NextRequest, NextResponse } from 'next/server'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { createServerPromptService } from '@/lib/prompt-service-server'
import { getDocumentContextOptimizer } from '@/lib/document-context-optimizer'

interface SDLCRequest {
  input: string
  template: string
  jiraProject: string
  confluenceSpace: string
  userId?: string
  projectId?: string
  customPrompts?: {
    business?: string
    functional?: string
    technical?: string
    ux?: string
    mermaid?: string
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
  // This would integrate with your auth system
  // For now, return null to use anonymous user
  return null
}

async function generateDocumentWithDatabasePrompt(
  documentType: 'business' | 'functional' | 'technical' | 'ux' | 'mermaid',
  input: string,
  businessAnalysis?: string,
  functionalSpec?: string,
  technicalSpec?: string,
  customPrompt?: string,
  userId?: string,
  projectId?: string,
  useContextOptimization: boolean = true
) {
  const promptService = createServerPromptService()
  const startTime = Date.now()
  const openaiClient = createOpenAI({ apiKey: process.env.OPENAI_API_KEY || '' })
  
  // Initialize context optimizer - it will use config values by default
  const contextOptimizer = getDocumentContextOptimizer({
    enableSmartSummarization: useContextOptimization
  })
  
  // Optimize context for non-business document types
  let optimizedContext: {
    businessAnalysis?: string
    functionalSpec?: string
    technicalSpec?: string
  } = {
    businessAnalysis,
    functionalSpec,
    technicalSpec
  }
  
  if (useContextOptimization && documentType !== 'business' && documentType !== 'mermaid') {
    console.log(`🧠 Optimizing context for ${documentType} generation...`)
    optimizedContext = await contextOptimizer.optimizeContext(
      documentType as 'functional' | 'technical' | 'ux',
      {
        businessAnalysis,
        functionalSpec,
        technicalSpec
      }
    )
    
    // Log optimization results
    if (businessAnalysis && optimizedContext.businessAnalysis) {
      console.log(`   📉 Business: ${businessAnalysis.length} → ${optimizedContext.businessAnalysis.length} chars`)
    }
    if (functionalSpec && optimizedContext.functionalSpec) {
      console.log(`   📉 Functional: ${functionalSpec.length} → ${optimizedContext.functionalSpec.length} chars`)
    }
    if (technicalSpec && optimizedContext.technicalSpec) {
      console.log(`   📉 Technical: ${technicalSpec.length} → ${optimizedContext.technicalSpec.length} chars`)
    }
  }
  
  try {
    // Priority 1: Use custom prompt if provided (legacy support)
    if (customPrompt && customPrompt.trim() !== "") {
      console.log(`🎯 [${documentType.toUpperCase()}] Using custom prompt from request`)
      
      let processedPrompt = customPrompt
        .replace(/{{input}}/g, input)
        .replace(/\{input\}/g, input)
        .replace(/{{business_analysis}}/g, optimizedContext.businessAnalysis || '')
        .replace(/\{business_analysis\}/g, optimizedContext.businessAnalysis || '')
        .replace(/{{functional_spec}}/g, optimizedContext.functionalSpec || '')
        .replace(/\{functional_spec\}/g, optimizedContext.functionalSpec || '')
        .replace(/{{technical_spec}}/g, optimizedContext.technicalSpec || '')
        .replace(/\{technical_spec\}/g, optimizedContext.technicalSpec || '')
      
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
      console.log(`✅ [${documentType.toUpperCase()}] Using database prompt: ${promptTemplate.name} (v${promptTemplate.version})`)
      console.log(`   📋 ID: ${promptTemplate.id}, Active: ${promptTemplate.is_active}, Scope: ${promptTemplate.prompt_scope}, Default: ${promptTemplate.is_system_default || promptTemplate.is_personal_default}`)
      
      try {
        // Build variables for the prompt with optimized context
        const variables: Record<string, string> = { input }
        if (optimizedContext.businessAnalysis) variables.business_analysis = optimizedContext.businessAnalysis
        if (optimizedContext.functionalSpec) variables.functional_spec = optimizedContext.functionalSpec
        if (optimizedContext.technicalSpec) variables.technical_spec = optimizedContext.technicalSpec
        
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
          { input },
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
    console.warn(`⚠️  [${documentType.toUpperCase()}] No database prompt found, using hardcoded fallback`)
    
    const fallbackPrompts = {
      business: `As a senior business analyst, analyze the following business case and provide a comprehensive business analysis:

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

      functional: `Based on the following business analysis, create a detailed functional specification:

Business Analysis: ${optimizedContext.businessAnalysis || ''}

Please provide:
1. Functional Requirements (numbered list)
2. User Stories with acceptance criteria
3. Use Cases
4. Data Requirements
5. Integration Requirements
6. Performance Requirements
7. Security Requirements

Format as a markdown technical specification document.`,

      technical: `Based on the functional specification, create a comprehensive technical specification:

Functional Specification: ${optimizedContext.functionalSpec || ''}

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

      ux: `Create a UX specification based on the business and functional requirements:

Business Analysis: ${optimizedContext.businessAnalysis || ''}
Functional Specification: ${optimizedContext.functionalSpec || ''}

Please provide:
1. User Personas
2. User Journey Maps
3. Wireframe Descriptions
4. UI Component Specifications
5. Accessibility Requirements
6. Mobile Responsiveness
7. Usability Testing Plan

Focus on user experience and interface design principles in markdown format.`,

      mermaid: `Create Mermaid diagrams for the system architecture based on the technical specification:

Technical Specification: ${optimizedContext.technicalSpec || ''}

Please provide Mermaid code for a comprehensive system architecture diagram.
Return only valid Mermaid syntax without any additional text or formatting.`
    }

    const fallbackPrompt = fallbackPrompts[documentType]
    const result = await generateText({
      model: openaiClient("gpt-4o"),
      prompt: fallbackPrompt,
    })

    return {
      content: result.text,
      promptSource: 'fallback',
      responseTime: Date.now() - startTime
    }
    
  } catch (error) {
    console.error(`Error in ${documentType} generation:`, error)
    throw error
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
      useContextOptimization = true,
    }: SDLCRequest & { jiraEnabled?: boolean; confluenceEnabled?: boolean; openaiKey?: string; useContextOptimization?: boolean } = await req.json()

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
    console.log('\n🔍 [BUSINESS] Starting generation...')
    const businessResult = await generateDocumentWithDatabasePrompt(
      'business',
      input,
      undefined, // No previous documents
      undefined,
      undefined,
      customPrompts?.business,
      effectiveUserId,
      projectId
    )
    promptSources.business = businessResult.promptSource
    if (businessResult.usageLogId) usageLogIds.push(businessResult.usageLogId)

    // Generate functional specification
    console.log('\n🔍 [FUNCTIONAL] Starting generation...')
    const functionalResult = await generateDocumentWithDatabasePrompt(
      'functional',
      input,
      businessResult.content, // Pass business analysis
      undefined,
      undefined,
      customPrompts?.functional,
      effectiveUserId,
      projectId,
      useContextOptimization
    )
    promptSources.functional = functionalResult.promptSource
    if (functionalResult.usageLogId) usageLogIds.push(functionalResult.usageLogId)

    // Generate technical specification
    console.log('\n🔍 [TECHNICAL] Starting generation...')
    const technicalResult = await generateDocumentWithDatabasePrompt(
      'technical',
      input,
      businessResult.content, // Pass business analysis
      functionalResult.content, // Pass functional spec
      undefined,
      customPrompts?.technical,
      effectiveUserId,
      projectId,
      useContextOptimization
    )
    promptSources.technical = technicalResult.promptSource
    if (technicalResult.usageLogId) usageLogIds.push(technicalResult.usageLogId)

    // Generate UX specification
    console.log('\n🔍 [UX] Starting generation...')
    const uxResult = await generateDocumentWithDatabasePrompt(
      'ux',
      input,
      businessResult.content, // Pass business analysis
      functionalResult.content, // Pass functional spec
      technicalResult.content, // Pass technical spec
      customPrompts?.ux,
      effectiveUserId,
      projectId,
      useContextOptimization
    )
    promptSources.ux = uxResult.promptSource
    if (uxResult.usageLogId) usageLogIds.push(uxResult.usageLogId)

    // Generate Mermaid diagrams
    console.log('\n🔍 [MERMAID] Starting generation...')
    const mermaidResult = await generateDocumentWithDatabasePrompt(
      'mermaid',
      input,
      businessResult.content, // Pass business analysis
      functionalResult.content, // Pass functional spec
      technicalResult.content, // Pass technical spec
      customPrompts?.mermaid,
      effectiveUserId,
      projectId
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

    // Summary of generation results
    console.log('\n🎉 SDLC GENERATION COMPLETE!')
    console.log('📊 PROMPT SOURCES USED:')
    console.log(`   • Business: ${promptSources.business} prompt`)
    console.log(`   • Functional: ${promptSources.functional} prompt`)
    console.log(`   • Technical: ${promptSources.technical} prompt`)
    console.log(`   • UX: ${promptSources.ux} prompt`)
    console.log(`   • Mermaid: ${promptSources.mermaid} prompt`)
    console.log(`⏱️  Total response time: ${totalResponseTime}ms`)
    console.log(`📝 Usage logs created: ${usageLogIds.length}`)

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
