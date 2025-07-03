import { NextRequest, NextResponse } from 'next/server'
import { parseSDLCContent } from '@/lib/content-parser'
import { ContentIntelligenceService } from '@/lib/content-intelligence'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      businessAnalysis,
      functionalSpec,
      technicalSpec,
      uxSpec,
      openaiKey,
      projectId
    } = body

    // Validate required fields
    if (!businessAnalysis || !technicalSpec || !uxSpec || !openaiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: businessAnalysis, technicalSpec, uxSpec, or openaiKey' },
        { status: 400 }
      )
    }

    console.log('🧠 Starting content intelligence analysis for project:', projectId)

    // Parse SDLC content to extract structured data
    console.log('📊 Parsing SDLC content...')
    const parsedContent = parseSDLCContent(
      businessAnalysis,
      functionalSpec || '',
      technicalSpec,
      uxSpec
    )

    console.log('Parsed content summary:', {
      epic: parsedContent.epic.title,
      userStoriesCount: parsedContent.userStories.length,
      developmentTasksCount: parsedContent.developmentTasks.length,
      designTasksCount: parsedContent.designTasks.length
    })

    // Initialize Content Intelligence service
    const intelligenceService = new ContentIntelligenceService(openaiKey)

    // Analyze content for intelligence insights
    console.log('🔍 Analyzing content intelligence...')
    const intelligence = await intelligenceService.analyzeContent(
      parsedContent.epic,
      parsedContent.userStories,
      parsedContent.developmentTasks,
      parsedContent.designTasks,
      businessAnalysis,
      technicalSpec,
      uxSpec
    )

    console.log('Content intelligence analysis complete:', {
      dependenciesFound: intelligence.dependencies.length,
      businessValuesAnalyzed: intelligence.businessValues.size,
      taskBreakdowns: intelligence.taskBreakdowns.length,
      priorityRecommendations: intelligence.priorityRecommendations.length,
      sprintRecommendations: intelligence.sprintRecommendations.length
    })

    // Convert Map to Object for JSON serialization
    const businessValuesObj: Record<string, any> = {}
    intelligence.businessValues.forEach((value, key) => {
      businessValuesObj[key] = value
    })

    return NextResponse.json({
      success: true,
      message: 'Content intelligence analysis completed successfully',
      data: {
        parsedContent: {
          epic: parsedContent.epic,
          userStories: parsedContent.userStories,
          developmentTasks: parsedContent.developmentTasks,
          designTasks: parsedContent.designTasks
        },
        intelligence: {
          dependencies: intelligence.dependencies,
          businessValues: businessValuesObj,
          taskBreakdowns: intelligence.taskBreakdowns,
          priorityRecommendations: intelligence.priorityRecommendations,
          sprintRecommendations: intelligence.sprintRecommendations
        },
        summary: {
          totalItems: parsedContent.userStories.length + parsedContent.developmentTasks.length + parsedContent.designTasks.length,
          dependenciesIdentified: intelligence.dependencies.length,
          complexTasksAnalyzed: intelligence.taskBreakdowns.length,
          priorityRecommendations: intelligence.priorityRecommendations.length,
          sprintsRecommended: intelligence.sprintRecommendations.length,
          averageBusinessValue: Object.values(businessValuesObj).reduce((sum: number, bv: any) => sum + bv.score, 0) / Object.keys(businessValuesObj).length || 0
        }
      }
    })

  } catch (error) {
    console.error('Error in content intelligence analysis:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze content intelligence',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
