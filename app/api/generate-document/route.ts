import { NextRequest, NextResponse } from 'next/server'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createServerPromptService } from '@/lib/prompt-service-server'
import { DocumentType } from '@/lib/prompt-service'
import { createClient } from '@/lib/supabase/server'
import { getDocumentContextOptimizer } from '@/lib/document-context-optimizer'
import { cleanupDocumentFormatting } from '@/lib/format-cleanup'
import { rateLimitService } from '@/lib/rate-limit-service'
import { anonymousProjectService } from '@/lib/anonymous-project-service'

interface GenerateDocumentRequest {
  input: string
  documentType: DocumentType
  businessAnalysis?: string
  functionalSpec?: string
  technicalSpec?: string
  customPrompt?: string
  userId?: string
  projectId?: string
  useContextOptimization?: boolean
}

async function getAuthenticatedUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Auth error:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

async function generateWithDatabasePromptStreaming(
  documentType: DocumentType,
  input: string,
  businessAnalysis: string | undefined,
  functionalSpec: string | undefined,
  technicalSpec: string | undefined,
  customPrompt: string | undefined,
  userId: string | undefined,
  projectId: string | undefined,
  useContextOptimization: boolean = true
) {
  const promptService = createServerPromptService()
  const startTime = Date.now()
  const openaiClient = createOpenAI({ apiKey: process.env.OPENAI_API_KEY || '' })
  
  // Initialize context optimizer
  const contextOptimizer = getDocumentContextOptimizer({
    enableSmartSummarization: useContextOptimization
  })
  
  // Optimize context for non-business and non-mermaid document types
  let optimizedContext = {
    businessAnalysis,
    functionalSpec,
    technicalSpec
  }
  
  if (useContextOptimization && documentType !== 'business' && documentType !== 'mermaid') {
    console.log(`🧠 Optimizing context for ${documentType} generation (streaming)...`)
    
    // Send optimization status to client (we'll implement this UI update later)
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
  
  // Build optional context from optimized documents
  const contextParts = []
  if (optimizedContext.businessAnalysis && optimizedContext.businessAnalysis.trim()) {
    contextParts.push(`Business Analysis: ${optimizedContext.businessAnalysis}`)
  }
  if (optimizedContext.functionalSpec && optimizedContext.functionalSpec.trim()) {
    contextParts.push(`Functional Specification: ${optimizedContext.functionalSpec}`)
  }
  if (optimizedContext.technicalSpec && optimizedContext.technicalSpec.trim()) {
    contextParts.push(`Technical Specification: ${optimizedContext.technicalSpec}`)
  }
  
  const optionalContext = contextParts.length > 0 
    ? `\nAdditional Context:\n${contextParts.join('\n\n')}`
    : ''
  
  try {
    // Priority 1: Use custom prompt if provided (legacy support)
    if (customPrompt && customPrompt.trim() !== "") {
      console.log('Using custom prompt from request (streaming)')
      console.log('🚀 ===== CUSTOM PROMPT DETAILS =====')
      console.log('🚀 Document Type:', documentType)
      console.log('🚀 Using custom prompt from request')
      console.log('🚀 Custom Prompt Length:', customPrompt.length)
      
      const processedPrompt = customPrompt
        .replace(/{{input}}/g, input)
        .replace(/\{input\}/g, input)
        .replace(/{{business_analysis}}/g, optimizedContext.businessAnalysis || '')
        .replace(/\{business_analysis\}/g, optimizedContext.businessAnalysis || '')
        .replace(/{{functional_spec}}/g, optimizedContext.functionalSpec || '')
        .replace(/\{functional_spec\}/g, optimizedContext.functionalSpec || '')
        .replace(/{{technical_spec}}/g, optimizedContext.technicalSpec || '')
        .replace(/\{technical_spec\}/g, optimizedContext.technicalSpec || '')
      
      console.log('🚀 Processed Custom Prompt:')
      console.log(processedPrompt)
      console.log('🚀 ===== END CUSTOM PROMPT DETAILS =====')
      
      return await streamText({
        model: openaiClient("gpt-4o"),
        prompt: processedPrompt,
      })
    }

    // Priority 2: Load prompt from database
    const promptTemplate = await promptService.getPromptForExecution(documentType, userId || 'anonymous')
    
    console.log('🔍 Using database prompt:', promptTemplate?.name || 'none')
    
    if (promptTemplate?.prompt_content) {
      console.log('✅ Using database prompt for streaming:', promptTemplate.name)
      
      // Build optional context from optimized documents
      const contextParts = []
      const hasBusinessAnalysis = optimizedContext.businessAnalysis && optimizedContext.businessAnalysis.trim()
      const hasFunctionalSpec = optimizedContext.functionalSpec && optimizedContext.functionalSpec.trim()
      const hasTechnicalSpec = optimizedContext.technicalSpec && optimizedContext.technicalSpec.trim()
      
      if (hasBusinessAnalysis) {
        contextParts.push(`Business Analysis: ${optimizedContext.businessAnalysis}`)
      }
      if (hasFunctionalSpec) {
        contextParts.push(`Functional Specification: ${optimizedContext.functionalSpec}`)
      }
      if (hasTechnicalSpec) {
        contextParts.push(`Technical Specification: ${optimizedContext.technicalSpec}`)
      }
      
      let processedContent = promptTemplate.prompt_content
      
      // Check if the prompt contains the input placeholder, if not add it
      if (!processedContent.includes('{{input}}') && !processedContent.includes('{input}')) {
        console.log('⚠️ Prompt template missing input placeholder, adding it...')
        processedContent = `## Original Project Requirements:
{{input}}

${processedContent}`
      }
      
      let cleanedContent = processedContent
      
      // Create a comprehensive variable replacement map
      const variableMap = {
        // Input variables
        '{{input}}': input,
        '{input}': input,
        
        // Business analysis variables (all possible formats)
        '{{business_analysis}}': optimizedContext.businessAnalysis || '',
        '{business_analysis}': optimizedContext.businessAnalysis || '',
        '{{businessAnalysis}}': optimizedContext.businessAnalysis || '',
        '{businessAnalysis}': optimizedContext.businessAnalysis || '',
        '{{business_analysis_context}}': optimizedContext.businessAnalysis || '',
        '{business_analysis_context}': optimizedContext.businessAnalysis || '',
        '{{businessAnalysisContext}}': optimizedContext.businessAnalysis || '',
        '{businessAnalysisContext}': optimizedContext.businessAnalysis || '',
        
        // Functional spec variables
        '{{functional_spec}}': optimizedContext.functionalSpec || '',
        '{functional_spec}': optimizedContext.functionalSpec || '',
        '{{functionalSpec}}': optimizedContext.functionalSpec || '',
        '{functionalSpec}': optimizedContext.functionalSpec || '',
        
        // Technical spec variables
        '{{technical_spec}}': optimizedContext.technicalSpec || '',
        '{technical_spec}': optimizedContext.technicalSpec || '',
        '{{technicalSpec}}': optimizedContext.technicalSpec || '',
        '{technicalSpec}': optimizedContext.technicalSpec || '',
      }
      
      // Apply all variable replacements
      Object.entries(variableMap).forEach(([variable, value]) => {
        const regex = new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
        cleanedContent = cleanedContent.replace(regex, value)
      })
      
      // Handle specific patterns that might be in the prompt template
      if (optimizedContext.businessAnalysis && optimizedContext.businessAnalysis.trim()) {
        cleanedContent = cleanedContent.replace(/Business Analysis Context:\s*\n```\s*\nundefinedundefinedundefined[^\n]*\n```/g, `Business Analysis Context:\n\`\`\`\n${optimizedContext.businessAnalysis}\n\`\`\``)
        cleanedContent = cleanedContent.replace(/Business Analysis Context:\s*\nundefinedundefinedundefined[^\n]*/g, `Business Analysis Context:\n${optimizedContext.businessAnalysis}`)
      }
      
      // Remove any remaining unreplaced variables
      cleanedContent = cleanedContent
        .replace(/\{\{[^}]+\}\}/g, '')
        .replace(/\{[^}]+\}/g, '')
      
      // Add intelligent context based on what's available
      if (!hasBusinessAnalysis && !hasFunctionalSpec && !hasTechnicalSpec) {
        const contextNote = `\n\n## IMPORTANT CONTEXT NOTE:
This ${documentType} specification is being generated based on the project requirements only. No other specification documents are available.

**Approach:**
- Focus on creating comprehensive ${documentType} specification that can be refined once other specifications are available
- Infer requirements and context from the project requirements
- Design for common patterns and best practices in the domain
- Include validation and testing tasks to ensure quality
- Emphasize completeness and clarity

**Next Steps After ${documentType} Specification:**
- Generate other specifications to provide additional context
- Iterate on ${documentType} design based on additional context

Please proceed with creating a comprehensive ${documentType} specification that establishes a solid foundation.`
        cleanedContent = cleanedContent + contextNote
      } else {
        const availableDocs = []
        if (hasBusinessAnalysis) availableDocs.push('Business Analysis')
        if (hasFunctionalSpec) availableDocs.push('Functional Specification')
        if (hasTechnicalSpec) availableDocs.push('Technical Specification')
        
        const contextNote = `\n\n## AVAILABLE CONTEXT:
The following documents are available to inform this ${documentType} specification: ${availableDocs.join(', ')}

**Approach:**
- Leverage the provided documents to create informed ${documentType} specification
- Align with business objectives, functional requirements, and technical architecture
- Ensure consistency with business processes, system functionality, and technical constraints
- Build upon existing context to create comprehensive specifications
- Validate decisions against available business, functional, and technical context

Please create a comprehensive ${documentType} specification that integrates seamlessly with the provided documents.`
        cleanedContent = cleanedContent + contextNote
      }
      
      console.log('🚀 Generating', documentType, 'document with', cleanedContent.length, 'chars')
      
      // Execute AI streaming call
      const streamResult = await streamText({
        model: openaiClient("gpt-4o"),
        prompt: cleanedContent,
      })
      
      return streamResult
    }

    // Priority 3: Fallback to hardcoded prompt
    console.warn('No database prompt found, using hardcoded fallback for streaming')
    console.log('🚀 ===== FALLBACK PROMPT DETAILS =====')
    console.log('🚀 Document Type:', documentType)
    console.log('🚀 Using hardcoded fallback prompt')
    console.log('🚀 Input Length:', input?.length || 0)
    console.log('🚀 Business Analysis Length:', businessAnalysis?.length || 0)
    console.log('🚀 Functional Spec Length:', functionalSpec?.length || 0)
    console.log('🚀 Technical Spec Length:', technicalSpec?.length || 0)
    
    // Get fallback prompt based on document type
    const fallbackPrompts = {
      business: `As a senior business analyst, analyze the following business case and provide a comprehensive business analysis:

Project Requirements: {input}

Please provide:
1. Executive Summary
2. Business Objectives
3. Stakeholder Analysis
4. Success Criteria
5. Risk Assessment
6. Timeline Estimates
7. Resource Requirements

Format the response in markdown with clear headings and structure.`,

      functional: `As an expert systems analyst, create a comprehensive functional specification based on the following requirements:

Requirements: {input}

Please include:
1. System Overview
2. Functional Requirements
3. User Stories
4. System Interactions
5. Data Requirements
6. Business Rules

Structure the response with clear sections and detailed specifications.`,

      technical: `As an expert technical architect, create a comprehensive technical specification for the following system:

System Requirements: {input}

Please provide:
1. System Architecture
2. Technical Requirements
3. API Specifications
4. Database Design
5. Security Considerations
6. Performance Requirements
7. Implementation Guidelines

Format with technical details and implementation guidance.`,

      ux: `As a Senior UX Designer with expertise in user-centered design, create specific design tasks based on the following project requirements:

Project Requirements: {input}

Generate the following structured output:

## UX Epic
- **Epic Title**: [User experience focus]
- **Design Approach**: [Design methodology]
- **Success Metrics**: [User experience KPIs]

## Design Tasks
For each task, provide:
1. **Task Title**: Clear design deliverable
2. **Task Description**: Design scope and requirements
3. **Deliverables**: Specific design artifacts
4. **Story Points**: Design effort estimate (1, 2, 3, 5, 8)
5. **User Impact**: How this improves user experience
6. **Dependencies**: Design prerequisites
7. **Definition of Done**: Design completion criteria

Create 6-10 specific design tasks that are user-focused and experience-driven.`,

      mermaid: `Create Mermaid diagrams for the system architecture based on the project requirements:

Project Requirements: {input}

Please provide Mermaid code for:
1. System architecture diagram
2. Database schema diagram
3. User flow diagram
4. API sequence diagram

Return only valid Mermaid syntax without any additional text or formatting.`
    }

    const fallbackPrompt = fallbackPrompts[documentType as keyof typeof fallbackPrompts] || fallbackPrompts.business
    const processedPrompt = fallbackPrompt
      .replace(/\{input\}/g, input)
      .replace(/\{\{input\}\}/g, input)
      .replace(/\{optional_context\}/g, optionalContext)
      .replace(/\{\{optional_context\}\}/g, optionalContext)
    
    console.log('🚀 Fallback Prompt Content:')
    console.log(processedPrompt)
    console.log('🚀 ===== END FALLBACK PROMPT DETAILS =====')
    
    return await streamText({
      model: openaiClient("gpt-4o"),
      prompt: processedPrompt,
    })
    
  } catch (error) {
    console.error('Error in streaming generation:', error)
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    const { 
      input, 
      documentType, 
      businessAnalysis, 
      functionalSpec, 
      technicalSpec, 
      customPrompt, 
      userId, 
      projectId,
      useContextOptimization = true
    }: GenerateDocumentRequest = await req.json()
    
    console.log('🔍 POST handler - Document type:', documentType)
    console.log('🔍 POST handler - Input length:', input?.length)
    
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      return new Response(
        JSON.stringify({ error: "OpenAI API key is required" }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate input
    if (!input || input.trim() === '') {
      return new Response(
        JSON.stringify({ error: "Project input is required" }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate document type
    const validDocumentTypes = ['business', 'functional', 'technical', 'ux', 'mermaid']
    if (!validDocumentTypes.includes(documentType)) {
      return new Response(
        JSON.stringify({ error: `Invalid document type. Must be one of: ${validDocumentTypes.join(', ')}` }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Get authenticated user if not provided
    const user = await getAuthenticatedUser()
    const effectiveUserId = userId || user?.id || 'anonymous'
    
    // Check rate limit for anonymous users
    if (!user || effectiveUserId === 'anonymous') {
      const sessionId = req.headers.get('x-session-id') || anonymousProjectService.generateSessionId()
      const limitCheck = await rateLimitService.checkAnonymousLimit(sessionId)
      
      if (!limitCheck.allowed) {
        return new Response(
          JSON.stringify({ 
            error: limitCheck.reason || "Rate limit exceeded",
            remaining: limitCheck.remaining,
            resetAt: limitCheck.resetAt
          }),
          { 
            status: 429, 
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    console.log('🚀 Starting streaming document generation...')
    console.log('Document Type:', documentType)
    console.log('User ID:', effectiveUserId)
    console.log('Project ID:', projectId)
    console.log('Business Analysis Length:', businessAnalysis?.length || 0)
    console.log('Business Analysis Preview:', businessAnalysis?.substring(0, 100) || 'No content')
    console.log('Available context:', {
      hasBusinessAnalysis: !!(businessAnalysis && businessAnalysis.trim()),
      hasFunctionalSpec: !!(functionalSpec && functionalSpec.trim()),
      hasTechnicalSpec: !!(technicalSpec && technicalSpec.trim())
    })

    const streamResult = await generateWithDatabasePromptStreaming(
      documentType,
      input,
      businessAnalysis,
      functionalSpec,
      technicalSpec,
      customPrompt,
      effectiveUserId,
      projectId,
      useContextOptimization
    )

    // Convert the AI stream to a web-compatible ReadableStream
    const encoder = new TextEncoder()
    let fullContent = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.textStream) {
            // Use chunk directly like the working version
            const text = chunk
            fullContent += text
            
            // Send SSE format that frontend expects - send individual chunks
            const sseData = {
              type: 'chunk',
              content: text, // Frontend expects 'content' not 'chunk'
              fullContent: fullContent // Include fullContent for progress tracking
            }
            
            const sseLine = `data: ${JSON.stringify(sseData)}\n\n`
            controller.enqueue(encoder.encode(sseLine))
          }
          
          // Apply formatting cleanup for better display (especially for UX specs)
          const cleanedContent = cleanupDocumentFormatting(fullContent, documentType);
          
          // Send completion signal with cleaned content
          const completionData = {
            type: 'complete',
            fullContent: cleanedContent,
            success: true,
            metadata: {
              responseTime: Date.now() - Date.now(),
              contentLength: cleanedContent.length,
              documentType: documentType
            }
          }
          
          const completionLine = `data: ${JSON.stringify(completionData)}\n\n`
          controller.enqueue(encoder.encode(completionLine))
          controller.close()
          
        } catch (error) {
          console.error('Error in stream processing:', error)
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
          const errorLine = `data: ${JSON.stringify(errorData)}\n\n`
          controller.enqueue(encoder.encode(errorLine))
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Error in document generation:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate document',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 