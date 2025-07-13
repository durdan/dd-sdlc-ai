import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AgenticExecutionEngine } from '@/lib/agentic-execution-engine'
import taskStore, { StoredTask } from '@/lib/task-store'

/**
 * GitHub Claude Task API
 * Called by user-installed GitHub Actions to request Claude AI assistance
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 GitHub Claude Task API called')
    
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
    const supabase = await createClient()
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

    // Check if user has GitHub and Claude configured
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

    const { data: claudeConfig } = await supabase
      .from('sdlc_user_ai_configurations')
      .select('encrypted_api_key')
      .eq('user_id', user.id)
      .eq('provider_id', (
        await supabase
          .from('sdlc_ai_providers')
          .select('id')
          .eq('type', 'anthropic')
          .single()
      ).data?.id)
      .eq('is_active', true)
      .single()

    if (!claudeConfig?.encrypted_api_key) {
      return NextResponse.json({ 
        error: 'Claude API key not configured',
        details: 'Please configure your Claude API key in the SDLC.dev Integration Hub'
      }, { status: 400 })
    }

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

    // Create task object
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
        source: 'github-action'
      }),
      requirements: task.description,
      createdAt: new Date().toISOString(),
      steps: [],
      progress: 0
    }

    // Add to task store
    taskStore.addActiveTask(storedTask)
    
    console.log(`✅ Created GitHub task: ${taskId}`)

    // Start async processing
    processGitHubTaskAsync(storedTask, claudeConfig.encrypted_api_key, githubConfig?.encrypted_api_key)

    return NextResponse.json({
      status: 'accepted',
      message: 'Task accepted and processing started',
      task: {
        id: taskId,
        status: 'pending',
        estimated_duration: '2-5 minutes'
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
    const supabase = await createClient()
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

    return NextResponse.json({
      task: {
        id: task.id,
        status: task.status,
        progress: task.progress,
        steps: task.steps,
        result: task.result,
        error: task.status === 'failed' ? 'Task execution failed' : undefined,
        created_at: task.createdAt,
        completed_at: task.completedAt
      }
    })

  } catch (error) {
    console.error('❌ Task status API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Async task processing function
async function processGitHubTaskAsync(task: StoredTask, claudeApiKey: string, githubToken?: string) {
  try {
    console.log(`🚀 Starting GitHub task processing: ${task.id}`)
    
    // Update task status
    task.status = 'analyzing'
    task.startedAt = new Date().toISOString()
    taskStore.updateTask(task)

    // Use available GitHub token (user's or fallback to env)
    const finalGithubToken = githubToken || process.env.GITHUB_TOKEN
    
    if (!finalGithubToken) {
      throw new Error('No GitHub token available')
    }

    // Create execution engine
    const executionEngine = new AgenticExecutionEngine({
      claudeApiKey,
      claudeModel: 'claude-3-5-sonnet-20241022',
      githubToken: finalGithubToken,
      maxExecutionTime: 10, // Shorter for GitHub Actions
      requireHumanApproval: false,
      autoCreatePR: true,
      runTests: false, // Skip tests for faster GitHub Action execution
      enableSafetyChecks: true
    })

    // Execute task with progress tracking
    const result = await executionEngine.executeTask(task, (step) => {
      console.log(`📊 GitHub task ${task.id} step:`, step.title, step.status)
      
      const currentTask = taskStore.getTask(task.id)
      if (currentTask) {
        if (!currentTask.steps) currentTask.steps = []
        
        const existingIndex = currentTask.steps.findIndex(s => s.id === step.id)
        if (existingIndex >= 0) {
          currentTask.steps[existingIndex] = step
        } else {
          currentTask.steps.push(step)
        }
        
        // Update status based on step
        if (step.status === 'in_progress') {
          if (step.type === 'analysis') currentTask.status = 'analyzing'
          else if (step.type === 'planning') currentTask.status = 'planning'  
          else if (step.type === 'code_generation') currentTask.status = 'executing'
        }
        
        // Calculate progress
        const completed = currentTask.steps.filter(s => s.status === 'completed').length
        currentTask.progress = Math.round((completed / currentTask.steps.length) * 100)
        
        taskStore.updateTask(currentTask)
      }
    })

    console.log(`✅ GitHub task completed: ${task.id}`)
    
    // Update final task status
    const completedTask = taskStore.getTask(task.id)
    if (completedTask) {
      completedTask.status = result.status === 'success' ? 'completed' : 'failed'
      completedTask.completedAt = new Date().toISOString()
      
      // Format result for GitHub Action consumption
      if (result.status === 'success') {
        completedTask.result = {
          summary: result.claudeAnalysis?.reasoning || 'Task completed successfully',
          pull_request: result.repositoryChanges.pullRequestUrl ? {
            url: result.repositoryChanges.pullRequestUrl,
            number: extractPRNumber(result.repositoryChanges.pullRequestUrl)
          } : null,
          files_modified: result.repositoryChanges.filesModified,
          files_created: result.repositoryChanges.filesCreated,
          findings: result.claudeAnalysis?.implementation?.files_to_modify?.map(f => f.description) || []
        }
      }
      
      taskStore.completeTask(task.id)
    }

  } catch (error) {
    console.error(`❌ GitHub task processing failed: ${task.id}`, error)
    
    const failedTask = taskStore.getTask(task.id)
    if (failedTask) {
      failedTask.status = 'failed'
      failedTask.completedAt = new Date().toISOString()
      failedTask.result = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      taskStore.completeTask(task.id)
    }
  }
}

function extractPRNumber(url: string): number {
  const match = url.match(/\/pull\/(\d+)/)
  return match ? parseInt(match[1]) : 0
} 