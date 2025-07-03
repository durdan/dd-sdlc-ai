import { NextRequest, NextResponse } from 'next/server'
import { parseSDLCContent } from '@/lib/content-parser'
import { JiraService } from '@/lib/jira-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      businessAnalysis,
      functionalSpec,
      technicalSpec,
      uxSpec,
      jiraConfig,
      projectId
    } = body

    // Validate required fields
    if (!businessAnalysis || !technicalSpec || !uxSpec || !jiraConfig) {
      return NextResponse.json(
        { error: 'Missing required fields: businessAnalysis, technicalSpec, uxSpec, or jiraConfig' },
        { status: 400 }
      )
    }

    // Validate Jira configuration
    if (!jiraConfig.url || !jiraConfig.email || !jiraConfig.apiToken || !jiraConfig.projectKey) {
      return NextResponse.json(
        { error: 'Incomplete Jira configuration. Please provide URL, email, API token, and project key.' },
        { status: 400 }
      )
    }

    // Parse SDLC content to extract structured data
    console.log('Parsing SDLC content...')
    const parsedContent = parseSDLCContent(
      businessAnalysis,
      functionalSpec || '',
      technicalSpec,
      uxSpec
    )

    console.log('Parsed content:', {
      epic: parsedContent.epic.title,
      userStoriesCount: parsedContent.userStories.length,
      developmentTasksCount: parsedContent.developmentTasks.length,
      designTasksCount: parsedContent.designTasks.length
    })

    // Initialize Jira service
    const jiraService = new JiraService(jiraConfig)

    // Test Jira connection first
    console.log('Testing Jira connection...')
    const connectionTest = await jiraService.testConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        { error: `Jira connection failed: ${connectionTest.message}` },
        { status: 400 }
      )
    }

    // Create all SDLC issues in Jira
    console.log('Creating SDLC issues in Jira...')
    const jiraResult = await jiraService.createSDLCIssues(
      parsedContent.epic,
      parsedContent.userStories,
      parsedContent.developmentTasks,
      parsedContent.designTasks,
      projectId || 'sdlc-project'
    )

    console.log('Successfully created Jira issues:', jiraResult.summary)

    return NextResponse.json({
      success: true,
      message: 'SDLC issues created successfully in Jira',
      data: {
        epic: {
          key: jiraResult.epic.key,
          url: jiraResult.epic.url,
          title: jiraResult.epic.summary
        },
        summary: jiraResult.summary,
        userStories: jiraResult.userStories.map(story => ({
          key: story.key,
          url: story.url,
          title: story.summary,
          storyPoints: story.storyPoints
        })),
        developmentTasks: jiraResult.developmentTasks.map(task => ({
          key: task.key,
          url: task.url,
          title: task.summary,
          storyPoints: task.storyPoints,
          components: task.components
        })),
        designTasks: jiraResult.designTasks.map(task => ({
          key: task.key,
          url: task.url,
          title: task.summary,
          storyPoints: task.storyPoints
        })),
        jiraProjectUrl: `${jiraConfig.url}/projects/${jiraConfig.projectKey}`
      }
    })

  } catch (error) {
    console.error('Error creating Jira issues:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create Jira issues',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
