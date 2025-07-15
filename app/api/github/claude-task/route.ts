import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ClaudeCodeService, AgenticCodeRequest } from '@/lib/claude-service'
import taskStore, { StoredTask } from '@/lib/task-store'
import { handleClaudeFreemiumRequest, recordClaudeProjectGeneration } from '@/lib/claude-freemium-middleware'
import { usageTracker } from '@/lib/usage-tracking-service'

/**
 * GitHub Claude Task API
 * Called by user-installed GitHub Actions to request Claude AI assistance
 * Now integrated with freemium system
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 GitHub Claude Task API called with freemium support')
    
    // Verify authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Missing or invalid authorization header',
        details: 'Include your SDLC.dev platform token as: Authorization: Bearer <token>'
      }, { status: 401 })
    }

    const userToken = authHeader.replace('Bearer ', '')
    console.log('🔑 Received user token:', userToken.slice(0, 10) + '...')

    // Get user from token
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken)
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Invalid user token',
        details: 'Your SDLC_USER_TOKEN may be expired. Please regenerate it in the SDLC.dev platform.'
      }, { status: 401 })
    }

    console.log('✅ Authenticated user:', user.email)

    const body = await request.json()
    const { github, task } = body

    console.log('📝 Task request:', {
      repository: github.repository,
      event_type: github.event_type,
      task_type: task.type,
      description: task.description?.substring(0, 100) + '...'
    })

    // Validate required fields
    if (!github?.repository || !task?.description) {
      return NextResponse.json({ 
        error: 'Invalid request format',
        details: 'Missing required fields: github.repository or task.description'
      }, { status: 400 })
    }

    // Check freemium limits first
    const freemiumResult = await handleClaudeFreemiumRequest(request, {
      projectType: 'github_code_assistant',
      requiresAuth: true,
      allowSystemKey: true,
      maxTokens: 8192,
      estimatedCost: 0.024
    })

    if (!freemiumResult.canProceed) {
      return NextResponse.json({ 
        error: 'Freemium limit exceeded',
        details: freemiumResult.error || 'Daily limit exceeded',
        suggestion: 'Provide your own Claude API key or upgrade your plan'
      }, { status: 429 })
    }

    // Check if user has GitHub configured
    const { data: githubConfig } = await supabase
      .from('sdlc_user_ai_configurations')
      .select('encrypted_api_key')
      .eq('user_id', user.id)
      .eq('provider_id', (
        await supabase
          .from('sdlc_ai_providers')
          .select('id')
          .eq('type', 'github')
          .single()
      ).data?.id)
      .eq('is_active', true)
      .single()

    // Parse repository info
    const [owner, name] = github.repository.split('/')
    if (!owner || !name) {
      return NextResponse.json({ 
        error: 'Invalid repository format',
        details: 'Repository should be in format: owner/name'
      }, { status: 400 })
    }

    // Create task ID
    const taskId = `github-task-${user.id}-${Date.now()}`

    // Create task object with freemium info
    const storedTask: StoredTask = {
      id: taskId,
      type: task.type === 'review' ? 'review' : 'feature',
      status: 'pending',
      priority: 'medium',
      description: task.description,
      repository: {
        owner,
        name,
        branch: 'main' // Will be detected by engine
      },
      context: JSON.stringify({
        github_event: github.event_type,
        github_actor: github.actor,
        github_ref: github.ref,
        github_sha: github.sha,
        issue_number: github.issue_number,
        pr_number: github.pr_number,
        changed_files: github.changed_files,
        source: 'github-action',
        used_system_key: freemiumResult.useSystemKey,
        remaining_projects: freemiumResult.remainingProjects
      }),
      requirements: task.description,
      createdAt: new Date().toISOString(),
      steps: [],
      progress: 0
    }

    // Add to task store
    taskStore.addActiveTask(storedTask)
    
    console.log(`✅ Created GitHub task: ${taskId}`)
    console.log(`🔑 Using system key: ${freemiumResult.useSystemKey}`)
    console.log(`📊 Remaining projects: ${freemiumResult.remainingProjects}`)

    // Start async processing with freemium support
    processGitHubTaskAsync(
      storedTask, 
      freemiumResult.claudeService!, 
      freemiumResult.useSystemKey,
      freemiumResult.userId!,
      githubConfig?.encrypted_api_key
    )

    return NextResponse.json({
      status: 'accepted',
      message: 'Task accepted and processing started',
      task: {
        id: taskId,
        status: 'pending',
        estimated_duration: '2-5 minutes',
        used_system_key: freemiumResult.useSystemKey,
        remaining_free_projects: freemiumResult.remainingProjects
      }
    })

  } catch (error) {
    console.error('❌ GitHub Claude Task API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Get task status - called by GitHub Action to check progress
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const taskId = url.searchParams.get('taskId')
    
    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId parameter' }, { status: 400 })
    }

    // Verify authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }

    const userToken = authHeader.replace('Bearer ', '')
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid user token' }, { status: 401 })
    }

    // Get task from store
    const task = taskStore.getTask(taskId)
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Verify task belongs to user
    if (!task.id.includes(user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Parse context to get freemium info
    let freemiumInfo = {}
    try {
      const context = JSON.parse(task.context || '{}')
      freemiumInfo = {
        used_system_key: context.used_system_key,
        remaining_projects: context.remaining_projects
      }
    } catch (e) {
      // Context parsing failed, continue without freemium info
    }

    return NextResponse.json({
      task: {
        id: task.id,
        status: task.status,
        progress: task.progress,
        steps: task.steps,
        result: task.result,
        error: task.status === 'failed' ? 'Task execution failed' : undefined,
        created_at: task.createdAt,
        completed_at: task.completedAt,
        ...freemiumInfo
      }
    })

  } catch (error) {
    console.error('❌ Task status API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Async task processing function with freemium support
async function processGitHubTaskAsync(
  task: StoredTask, 
  claudeService: ClaudeCodeService,
  useSystemKey: boolean,
  userId: string,
  githubToken?: string
) {
  const startTime = Date.now()
  
  try {
    console.log(`🚀 Starting GitHub task processing: ${task.id}`)
    console.log(`🔑 Using system key: ${useSystemKey}`)
    
    // Update task status
    task.status = 'analyzing'
    task.startedAt = new Date().toISOString()
    taskStore.updateTask(task)

    // Use available GitHub token (user's or fallback to env)
    const finalGithubToken = githubToken || process.env.GITHUB_TOKEN
    
    if (!finalGithubToken) {
      throw new Error('No GitHub token available')
    }

    // Create agentic request
    const agenticRequest: AgenticCodeRequest = {
      task_type: task.type === 'bug_fix' ? 'bug_fix' : 'feature_implementation',
      codebase_context: task.context || 'Repository context will be analyzed',
      specific_request: task.description,
      requirements: task.requirements
    }

    // Execute task with Claude service
    const claudeResult = await claudeService.generateAgenticCode(agenticRequest)
    
    // Update task with completion
    task.status = 'completed'
    task.completedAt = new Date().toISOString()
    task.result = claudeResult
    taskStore.updateTask(task)

    console.log(`✅ GitHub task ${task.id} completed successfully`)
    
    // Record usage in freemium system
    const generationTime = Date.now() - startTime
    await recordClaudeProjectGeneration(
      userId,
      'github_code_assistant',
      useSystemKey,
      8192, // Estimated tokens
      generationTime,
      true,
      undefined,
      { 
        task_id: task.id,
        repository: task.repository,
        task_type: task.type,
        source: 'github-action'
      }
    )
    
    // Update final task status with freemium info
    const completedTask = taskStore.getTask(task.id)
    if (completedTask) {
      completedTask.status = 'completed'
      completedTask.completedAt = new Date().toISOString()
      
      // Format result for GitHub Action consumption
      completedTask.result = {
        summary: claudeResult.reasoning || 'Task completed successfully',
        pull_request: null, // No PR creation in this simplified version
        files_modified: [],
        files_created: [],
        findings: claudeResult.implementation?.files_to_modify?.map(f => f.description) || [],
        usage_info: {
          used_system_key: useSystemKey,
          ai_provider: 'claude',
          completion_time: generationTime
        }
      }
      
      taskStore.completeTask(task.id)
    }

  } catch (error) {
    console.error(`❌ GitHub task processing failed: ${task.id}`, error)
    
    // Record failed generation in freemium system
    const generationTime = Date.now() - startTime
    await recordClaudeProjectGeneration(
      userId,
      'github_code_assistant',
      useSystemKey,
      0,
      generationTime,
      false,
      error instanceof Error ? error.message : 'Unknown error',
      { 
        task_id: task.id,
        repository: task.repository,
        task_type: task.type,
        source: 'github-action'
      }
    )
    
    const failedTask = taskStore.getTask(task.id)
    if (failedTask) {
      failedTask.status = 'failed'
      failedTask.completedAt = new Date().toISOString()
      failedTask.result = {
        error: error instanceof Error ? error.message : 'Unknown error',
        usage_info: {
          used_system_key: useSystemKey,
          ai_provider: 'claude',
          completion_time: generationTime
        }
      }
      taskStore.completeTask(task.id)
    }
  }
}

function extractPRNumber(url: string): number {
  const match = url.match(/\/pull\/(\d+)/)
  return match ? parseInt(match[1]) : 0
} 