import { NextRequest, NextResponse } from 'next/server'
import { BacklogStructureService } from '@/lib/backlog-structure'
import { ContentParserService } from '@/lib/content-parser'
import { ContentIntelligenceService } from '@/lib/content-intelligence'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      openaiKey, 
      businessAnalysis, 
      functionalSpec, 
      technicalSpec, 
      uxSpec,
      customPrompts 
    } = body

    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 400 }
      )
    }

    if (!businessAnalysis || !functionalSpec || !technicalSpec || !uxSpec) {
      return NextResponse.json(
        { error: 'All SDLC documents are required for backlog structure generation' },
        { status: 400 }
      )
    }

    console.log('🎯 Starting backlog structure generation...')

    // Step 1: Parse content to extract items
    const contentParser = new ContentParserService(openaiKey)
    const parsedContent = await contentParser.parseSDLCContent(
      businessAnalysis,
      functionalSpec,
      technicalSpec,
      uxSpec,
      customPrompts
    )

    // Step 2: Generate content intelligence
    const intelligenceService = new ContentIntelligenceService(openaiKey)
    const intelligence = await intelligenceService.analyzeContent(
      parsedContent.epic,
      parsedContent.userStories,
      parsedContent.developmentTasks,
      parsedContent.designTasks,
      businessAnalysis,
      functionalSpec,
      technicalSpec,
      uxSpec
    )

    // Step 3: Create comprehensive backlog structure
    const backlogService = new BacklogStructureService(openaiKey)
    const backlogStructure = await backlogService.createBacklogStructure(
      parsedContent.epic,
      parsedContent.userStories,
      parsedContent.developmentTasks,
      parsedContent.designTasks,
      intelligence,
      businessAnalysis,
      technicalSpec,
      uxSpec
    )

    console.log('✅ Backlog structure generation completed')

    return NextResponse.json({
      success: true,
      data: backlogStructure
    })

  } catch (error) {
    console.error('Error generating backlog structure:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate backlog structure',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
