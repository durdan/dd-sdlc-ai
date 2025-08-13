import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai as openaiProvider } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { promptService } from '@/lib/prompt-service-server'
import { getTechSpecSectionPrompt, generateCombinedTechSpec } from '@/lib/tech-spec-sections'
import { z } from 'zod'

const TechSpecRequestSchema = z.object({
  businessAnalysis: z.string().optional(),
  functionalSpec: z.string().optional(),
  technicalSpec: z.string().optional(),
  sections: z.array(z.string()).optional(),
  sectionId: z.string().optional(),
  provider: z.enum(['openai', 'anthropic']).default('openai'),
  apiKey: z.string(),
  userId: z.string().optional(),
  projectId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = TechSpecRequestSchema.parse(body)
    
    const {
      businessAnalysis,
      functionalSpec,
      technicalSpec,
      sections,
      sectionId,
      provider,
      apiKey,
      userId,
      projectId
    } = validatedData

    // Get authenticated user if not provided
    const user = await getAuthenticatedUser()
    const effectiveUserId = userId || user?.id

    // Build context object
    const context = {
      business_analysis: businessAnalysis,
      functional_spec: functionalSpec,
      technical_spec: technicalSpec
    }

    let prompt: string

    // Generate prompt based on request type
    if (sections && sections.length > 0) {
      // Multiple sections - generate combined spec
      prompt = generateCombinedTechSpec(sections, context)
    } else if (sectionId) {
      // Single section - use specific prompt
      prompt = getTechSpecSectionPrompt(sectionId)
    } else {
      // Default - use system architecture
      prompt = getTechSpecSectionPrompt('system-architecture')
    }

    // Replace variables in prompt
    Object.entries(context).forEach(([key, value]) => {
      if (value) {
        prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value)
      }
    })

    // Select AI provider
    const model = provider === 'anthropic' 
      ? anthropic('claude-3-5-sonnet-20241022')
      : openaiProvider('gpt-4o', { 
          apiKey,
          headers: {
            'OpenAI-Beta': 'assistants=v2'
          }
        })

    // Generate the technical specification
    const startTime = Date.now()
    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 8000,
    })

    const responseTime = Date.now() - startTime

    // Log usage if user is authenticated
    if (effectiveUserId && projectId) {
      try {
        await promptService.logUsage(
          'tech-spec-custom',
          effectiveUserId,
          context,
          {
            content: result.text,
            input_tokens: Math.floor(prompt.length / 4),
            output_tokens: Math.floor(result.text.length / 4),
          },
          responseTime,
          true,
          undefined,
          projectId,
          provider === 'anthropic' ? 'claude-3.5-sonnet' : 'gpt-4o'
        )
      } catch (logError) {
        console.error('Failed to log usage:', logError)
      }
    }

    return NextResponse.json({
      content: result.text,
      sections: sections || (sectionId ? [sectionId] : ['system-architecture']),
      responseTime,
      provider,
      success: true
    })

  } catch (error) {
    console.error('Error generating technical specification:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate technical specification',
        success: false
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const section = searchParams.get('section')
    
    if (!section) {
      // Return all available sections
      const { getAllTechSpecSections } = await import('@/lib/tech-spec-sections')
      const sections = getAllTechSpecSections()
      
      return NextResponse.json({
        sections: sections.map(s => ({
          id: s.id,
          name: s.name,
          icon: s.icon,
          description: s.description,
          bestFor: s.bestFor,
          outputSections: s.outputSections,
          requiredContext: s.requiredContext
        }))
      })
    }

    // Return specific section details
    const { getTechSpecSectionById } = await import('@/lib/tech-spec-sections')
    const sectionData = getTechSpecSectionById(section)
    
    if (!sectionData) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      section: {
        id: sectionData.id,
        name: sectionData.name,
        icon: sectionData.icon,
        description: sectionData.description,
        detailedDescription: sectionData.detailedDescription,
        bestFor: sectionData.bestFor,
        outputSections: sectionData.outputSections,
        requiredContext: sectionData.requiredContext
      }
    })

  } catch (error) {
    console.error('Error fetching tech spec sections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch technical specification sections' },
      { status: 500 }
    )
  }
}