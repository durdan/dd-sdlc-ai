import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ClaudeCodeService, AgenticCodeRequest } from '@/lib/claude-service'
import { cookies } from 'next/headers'
import taskStore, { StoredTask } from '@/lib/task-store'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's real tasks from the shared task store
    const tasks = taskStore.getUserTasks(user.id)
    
    console.log(`📋 Retrieved ${tasks.length} tasks for user ${user.id}`)

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { description, type, priority, repository, github_issue_url, context } = body

    console.log('🎯 Creating Slack task:', { description, type, priority })

    // Get Claude API key - check user-specific config first, then environment variables
    let claudeApiKey = null
    
    console.log('🔍 Checking for user-specific Claude configuration...')
    console.log('🆔 User ID:', user.id)
    
    const { data: claudeConfig, error: configError } = await supabase
      .from('sdlc_user_ai_configurations')
      .select(`
        encrypted_api_key,
        usage_limits,
        sdlc_ai_providers!inner (
          name,
          type
        )
      `)
      .eq('user_id', user.id)
      .eq('sdlc_ai_providers.type', 'anthropic')
      .eq('is_active', true)
      .single()

    console.log('📊 Database query result:', {
      hasData: !!claudeConfig,
      hasError: !!configError,
      errorMessage: configError?.message,
      errorCode: configError?.code,
      apiKeyFound: !!claudeConfig?.encrypted_api_key,
      apiKeyPreview: claudeConfig?.encrypted_api_key ? claudeConfig.encrypted_api_key.slice(0, 10) + '...' : 'none'
    })

    if (configError) {
      console.log('❌ Database query error:', configError)
      console.log('⚠️  No user-specific Claude configuration found, checking environment variables...')
    } else if (claudeConfig && claudeConfig.encrypted_api_key) {
      claudeApiKey = claudeConfig.encrypted_api_key // TODO: Decrypt if encrypted
      console.log('✅ Using user-specific Claude API key from database')
      console.log('🔑 API key starts with:', claudeApiKey.slice(0, 15) + '...')
    } else {
      console.log('⚠️  Query succeeded but no API key found, checking environment variables...')
    }

    // Fall back to environment variable if no user-specific key found
    if (!claudeApiKey) {
      claudeApiKey = process.env.ANTHROPIC_API_KEY
      if (claudeApiKey) {
        console.log('✅ Using system-wide Claude API key from environment')
      }
    }
    
    if (!claudeApiKey) {
      return NextResponse.json({ 
        error: 'Claude API key not configured. Please configure Claude in the Integration Hub or set ANTHROPIC_API_KEY environment variable.',
        details: 'Go to the Integration Hub → Claude AI tab to set up your API key.'
      }, { status: 500 })
    }

    // Get GitHub token - check user-specific cookie first, then environment variables
    let githubToken = null
    
    console.log('🔍 Checking for user-specific GitHub token...')
    try {
      const cookieStore = await cookies()
      const userGithubToken = cookieStore.get('github_token')
      
      if (userGithubToken && userGithubToken.value) {
        githubToken = userGithubToken.value
        console.log('✅ Using user-specific GitHub token from cookie')
      }
    } catch (cookieError) {
      console.log('⚠️  No user-specific GitHub token found, checking environment variables...')
    }

    // Fall back to environment variable if no user-specific token found
    if (!githubToken) {
      githubToken = process.env.GITHUB_TOKEN
      if (githubToken) {
        console.log('✅ Using system-wide GitHub token from environment')
      }
    }
    
    if (!githubToken) {
      return NextResponse.json({ 
        error: 'GitHub token not configured. Please connect your GitHub account in the Integration Hub or set GITHUB_TOKEN environment variable.',
        details: 'Go to the Integration Hub → GitHub tab to connect your account.'
      }, { status: 500 })
    }

    // Create task ID
    const taskId = `task-${user.id}-${Date.now()}`
    
    // Parse repository if provided
    let repositoryInfo = null
    if (repository && repository !== 'auto-detect') {
      const parts = repository.split('/')
      if (parts.length >= 2) {
        repositoryInfo = {
          owner: parts[0],
          name: parts[1],
          branch: 'main' // Default branch, will be detected by the engine
        }
      }
    }

    // Create the task
    const task: StoredTask = {
      id: taskId,
      type: type || 'feature',
      status: 'pending',
      priority: priority || 'medium',
      description,
      repository: repositoryInfo || {
        owner: 'auto-detect',
        name: 'auto-detect',
        branch: 'main'
      },
      githubIssueUrl: github_issue_url,
      context,
      requirements: context,
      createdAt: new Date().toISOString(),
      steps: [],
      progress: 0
    }

    // Add task to shared task store
    taskStore.addActiveTask(task)
    
    console.log(`🎯 Created real task: ${taskId}`)

    // Response with task info including credential sources
    return NextResponse.json({ 
      message: 'Task created successfully',
      task: {
        id: taskId,
        description,
        type: type || 'feature',
        priority: priority || 'medium',
        status: 'pending',
        repository: repositoryInfo,
        github_issue_url,
        context,
        created_at: task.createdAt
      },
      claudeApiKeySource: claudeApiKey === process.env.ANTHROPIC_API_KEY ? 'environment' : 'user-database',
      githubTokenSource: githubToken === process.env.GITHUB_TOKEN ? 'environment' : 'user-cookie'
    })

    // Start execution asynchronously using the unified Claude service
    executeTaskAsync(task, claudeApiKey, githubToken)

  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

// Simplified task execution using unified Claude service
async function executeTaskAsync(task: StoredTask, claudeApiKey: string, githubToken: string) {
  try {
    console.log(`🚀 Starting async execution for task: ${task.id}`)
    
    // Update task status to analyzing
    task.status = 'analyzing'
    task.startedAt = new Date().toISOString()
    taskStore.updateTask(task)

    // Create Claude service
    const claudeService = new ClaudeCodeService({
      apiKey: claudeApiKey,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 8192,
      temperature: 0.1
    })

    // Create agentic code request
    const agenticRequest: AgenticCodeRequest = {
      task_type: task.type === 'bug_fix' ? 'bug_fix' : 'feature_implementation',
      codebase_context: task.context || 'Repository context will be analyzed',
      specific_request: task.description,
      requirements: task.requirements
    }

    // Update task status to planning
    task.status = 'planning'
    taskStore.updateTask(task)

    // Execute Claude analysis and code generation
    console.log(`🤖 Executing Claude code generation for task: ${task.id}`)
    const result = await claudeService.generateAgenticCode(agenticRequest)

    console.log(`✅ Task ${task.id} execution completed`)
    
    // Update final task status
    const completedTask = taskStore.getTask(task.id)
    if (completedTask) {
      completedTask.status = 'completed'
      completedTask.completedAt = new Date().toISOString()
      completedTask.actualDuration = Date.now() - new Date(completedTask.startedAt || completedTask.createdAt).getTime()
      
      // Add result data
      completedTask.result = {
        reasoning: result.reasoning,
        files_to_create: result.implementation.files_to_create,
        files_to_modify: result.implementation.files_to_modify,
        tests: result.tests,
        documentation: result.documentation,
        validation_steps: result.validation_steps
      }
      
      // Simulate some progress steps
      completedTask.steps = [
        {
          id: `${task.id}-analysis`,
          taskId: task.id,
          stepNumber: 1,
          type: 'analysis',
          status: 'completed',
          title: 'Repository Analysis',
          description: 'Analyzed repository structure and requirements',
          startedAt: task.startedAt,
          completedAt: new Date().toISOString()
        },
        {
          id: `${task.id}-planning`,
          taskId: task.id,
          stepNumber: 2,
          type: 'planning',
          status: 'completed',
          title: 'Implementation Planning',
          description: 'Created implementation plan with Claude AI',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        },
        {
          id: `${task.id}-generation`,
          taskId: task.id,
          stepNumber: 3,
          type: 'code_generation',
          status: 'completed',
          title: 'Code Generation',
          description: 'Generated code implementation',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          result: result.implementation
        }
      ]
      
      completedTask.progress = 100
      taskStore.completeTask(task.id)
    }
    
  } catch (error) {
    console.error(`❌ Execution failed for task ${task.id}:`, error)
    
    // Update task status to failed
    const failedTask = taskStore.getTask(task.id)
    if (failedTask) {
      failedTask.status = 'failed'
      failedTask.completedAt = new Date().toISOString()
      failedTask.actualDuration = Date.now() - new Date(failedTask.startedAt || failedTask.createdAt).getTime()
      
      // Add error step
      failedTask.steps = [
        {
          id: `${task.id}-error`,
          taskId: task.id,
          stepNumber: 1,
          type: 'analysis',
          status: 'failed',
          title: 'Task Execution Failed',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          error: error instanceof Error ? error.message : 'Unknown error',
          startedAt: task.startedAt,
          completedAt: new Date().toISOString()
        }
      ]
      
      taskStore.completeTask(task.id)
    }
  }
} 