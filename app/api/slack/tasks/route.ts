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
    let tasks = taskStore.getUserTasks(user.id)
    
    // If no tasks in memory, try to load from database
    if (tasks.length === 0) {
      console.log(`📊 No tasks in memory for user ${user.id}, checking database...`)
      
      try {
        // Check enhanced_claude_tasks table
        const { data: dbTasks, error: dbError } = await supabase
          .from('enhanced_claude_tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (dbTasks && dbTasks.length > 0) {
          console.log(`📦 Found ${dbTasks.length} tasks in database, restoring to TaskStore...`)
          
          // Convert database tasks to StoredTask format and add to TaskStore
          for (const dbTask of dbTasks) {
            const storedTask: StoredTask = {
              id: dbTask.id,
              type: dbTask.type,
              status: dbTask.status,
              priority: dbTask.priority,
              description: dbTask.description,
              repository: dbTask.repository_url ? {
                owner: 'unknown',
                name: 'unknown', 
                branch: 'main'
              } : undefined,
              createdAt: dbTask.created_at,
              completedAt: dbTask.completed_at,
              progress: dbTask.progress || 0,
              result: dbTask.result_data,
              steps: dbTask.context_data?.steps || [],
              userId: user.id  // CRITICAL FIX: Add explicit user ID for restored tasks
            }
            
            if (dbTask.status === 'completed' || dbTask.status === 'failed') {
              taskStore.completeTask(storedTask.id, storedTask.result, dbTask.status === 'failed' ? 'Task failed' : undefined)
            } else {
              taskStore.addActiveTask(storedTask)
            }
          }
          
          // Get tasks again after restoring from database
          tasks = taskStore.getUserTasks(user.id)
          console.log(`✅ Restored ${tasks.length} tasks from database to TaskStore`)
        }

        // Also check sdlc_ai_task_executions table
        const { data: agenticTasks, error: agenticError } = await supabase
          .from('sdlc_ai_task_executions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (agenticTasks && agenticTasks.length > 0) {
          console.log(`📦 Found ${agenticTasks.length} agentic tasks in database, restoring to TaskStore...`)
          
          for (const agenticTask of agenticTasks) {
            // Check if we already have this task to avoid duplicates
            if (!taskStore.getTask(agenticTask.id)) {
              const storedTask: StoredTask = {
                id: agenticTask.id,
                type: agenticTask.task_type,
                status: agenticTask.status,
                priority: agenticTask.priority,
                description: agenticTask.description,
                repository: {
                  owner: agenticTask.repository_owner,
                  name: agenticTask.repository_name,
                  branch: agenticTask.repository_branch || 'main'
                },
                githubIssueUrl: agenticTask.github_issue_url,
                context: agenticTask.context,
                requirements: agenticTask.requirements,
                createdAt: agenticTask.created_at,
                completedAt: agenticTask.completed_at,
                progress: agenticTask.status === 'completed' ? 100 : 
                         agenticTask.status === 'failed' ? 0 : 50,
                result: agenticTask.execution_result,
                steps: agenticTask.execution_logs || [],
                userId: user.id  // CRITICAL FIX: Add explicit user ID for restored agentic tasks
              }
              
              if (agenticTask.status === 'completed' || agenticTask.status === 'failed') {
                taskStore.completeTask(storedTask.id, storedTask.result, agenticTask.status === 'failed' ? 'Task failed' : undefined)
              } else {
                taskStore.addActiveTask(storedTask)
              }
            }
          }
          
          // Get tasks again after restoring agentic tasks
          tasks = taskStore.getUserTasks(user.id)
          console.log(`✅ Total tasks after restoration: ${tasks.length}`)
        }

      } catch (dbError) {
        console.error('❌ Error loading tasks from database:', dbError)
      }
    }
    
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
      progress: 0,
      userId: user.id  // CRITICAL FIX: Add explicit user ID for proper ownership
    }

    // Add task to shared task store
    taskStore.addActiveTask(task)
    
    console.log(`🎯 Created real task: ${taskId}`)

    // Start execution asynchronously using the unified Claude service
    console.log(`🚀 ABOUT TO START ASYNC EXECUTION for task: ${taskId}`)
    executeTaskAsync(task, claudeApiKey, githubToken).catch(error => {
      console.error(`❌ ASYNC EXECUTION ERROR for task ${taskId}:`, error)
    })
    console.log(`✅ ASYNC EXECUTION STARTED for task: ${taskId}`)

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

  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

// Simplified task execution using unified Claude service
async function executeTaskAsync(task: StoredTask, claudeApiKey: string, githubToken: string) {
  // IMMEDIATE EXECUTION CHECK
  console.log(`🔥 IMMEDIATE CHECK: executeTaskAsync CALLED for task ${task.id} at ${new Date().toISOString()}`)
  console.log(`🔥 IMMEDIATE CHECK: Task details:`, {
    id: task.id,
    type: task.type,
    description: task.description,
    status: task.status
  })
  
  // Set a timeout to check if function completes
  const timeoutId = setTimeout(() => {
    console.log(`⏰ TIMEOUT WARNING: executeTaskAsync for task ${task.id} has been running for 30 seconds`)
  }, 30000)
  
  // Helper function to add/update step
  const updateStep = (stepId: string, stepData: any) => {
    const currentTask = taskStore.getTask(task.id)
    if (currentTask) {
      if (!currentTask.steps) currentTask.steps = []
      
      const existingIndex = currentTask.steps.findIndex(s => s.id === stepId)
      if (existingIndex >= 0) {
        currentTask.steps[existingIndex] = { ...currentTask.steps[existingIndex], ...stepData }
      } else {
        currentTask.steps.push(stepData)
      }
      
      // Update progress based on completed steps
      const completedSteps = currentTask.steps.filter(s => s.status === 'completed').length
      const totalSteps = currentTask.steps.length
      currentTask.progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
      
      taskStore.updateTask(currentTask)
      console.log(`📊 Step ${stepData.title} updated: ${stepData.status}`)
    }
  }
  
  try {
    console.log(`🚀 Starting async execution for task: ${task.id}`)
    console.log(`🔑 Claude API Key available: ${!!claudeApiKey}`)
    console.log(`🔑 GitHub Token available: ${!!githubToken}`)
    
    // STEP 1: Initialize Repository Analysis
    const analysisStepId = `${task.id}-analysis`
    updateStep(analysisStepId, {
      id: analysisStepId,
      taskId: task.id,
      stepNumber: 1,
      type: 'analysis',
      status: 'in_progress',
      title: '📊 Analyzing repository and requirements',
      description: 'Preparing context and analyzing requirements',
      startedAt: new Date().toISOString()
    })
    
    // Update task status to analyzing
    task.status = 'analyzing'
    task.startedAt = new Date().toISOString()
    taskStore.updateTask(task)
    console.log(`📊 Task status updated to: ${task.status}`)

    // Create Claude service
    console.log(`🤖 Creating Claude service...`)
    const claudeService = new ClaudeCodeService({
      apiKey: claudeApiKey,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 8192,
      temperature: 0.1
    })
    console.log(`✅ Claude service created successfully`)

    // Complete analysis step
    updateStep(analysisStepId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      description: 'Repository analysis and requirement processing completed'
    })

    // STEP 2: Planning Phase
    const planningStepId = `${task.id}-planning`
    updateStep(planningStepId, {
      id: planningStepId,
      taskId: task.id,
      stepNumber: 2,
      type: 'planning',
      status: 'in_progress',
      title: '🎯 Creating implementation plan',
      description: 'Planning the implementation approach and architecture',
      startedAt: new Date().toISOString()
    })

    // Create agentic code request
    const agenticRequest: AgenticCodeRequest = {
      task_type: task.type === 'bug_fix' ? 'bug_fix' : 'feature_implementation',
      codebase_context: task.context || 'Repository context will be analyzed',
      specific_request: task.description,
      requirements: task.requirements
    }
    console.log(`📋 Agentic request created:`, agenticRequest)

    // Update task status to planning
    task.status = 'planning'
    taskStore.updateTask(task)
    console.log(`📊 Task status updated to: ${task.status}`)

    // Complete planning step
    updateStep(planningStepId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      description: 'Implementation plan created successfully'
    })

    // STEP 3: Code Generation
    const generationStepId = `${task.id}-generation`
    updateStep(generationStepId, {
      id: generationStepId,
      taskId: task.id,
      stepNumber: 3,
      type: 'code_generation',
      status: 'in_progress',
      title: `⚡ Generating ${task.type === 'bug_fix' ? 'bug fix' : 'feature'} code`,
      description: 'Generating code implementation with Claude AI',
      startedAt: new Date().toISOString()
    })

    // Update task status to executing
    task.status = 'executing'
    taskStore.updateTask(task)

    // Execute Claude analysis and code generation with timeout
    console.log(`🤖 About to execute Claude code generation for task: ${task.id}`)
    
    try {
      // Add timeout to prevent hanging
      const result = await Promise.race([
        claudeService.generateAgenticCode(agenticRequest),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Claude API call timed out after 5 minutes')), 300000)
        )
      ]) as any
      
      console.log(`✅ Claude code generation completed for task: ${task.id}`)

      // Complete generation step
      updateStep(generationStepId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        description: 'Code generation completed successfully',
        result: result.implementation
      })

      // STEP 4: Test Generation (if tests were generated)
      if (result.tests && (result.tests.unit_tests?.length > 0 || result.tests.integration_tests?.length > 0)) {
        const testStepId = `${task.id}-testing`
        updateStep(testStepId, {
          id: testStepId,
          taskId: task.id,
          stepNumber: 4,
          type: 'testing',
          status: 'completed',
          title: '🧪 Generated comprehensive tests',
          description: `Generated ${(result.tests.unit_tests?.length || 0) + (result.tests.integration_tests?.length || 0)} test files`,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          result: result.tests
        })
      }

      console.log(`✅ Task ${task.id} execution completed`)
      
      // Clear timeout since we completed successfully
      clearTimeout(timeoutId)
      
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
        
        // Ensure progress is 100%
        completedTask.progress = 100
        taskStore.completeTask(task.id)
        console.log(`📊 Task ${task.id} marked as completed with 100% progress`)
      }
      
    } catch (claudeError) {
      console.error(`❌ Claude API error for task ${task.id}:`, claudeError)
      
      // Mark generation step as failed
      updateStep(generationStepId, {
        status: 'failed',
        completedAt: new Date().toISOString(),
        description: 'Code generation failed',
        error: claudeError instanceof Error ? claudeError.message : 'Claude API error'
      })
      
      throw claudeError // Re-throw to be caught by outer try-catch
    }

  } catch (error) {
    console.error(`❌ Execution failed for task ${task.id}:`, error)
    
    // Clear timeout since we're handling the error
    clearTimeout(timeoutId)
    
    // Update task status to failed
    const failedTask = taskStore.getTask(task.id)
    if (failedTask) {
      failedTask.status = 'failed'
      failedTask.completedAt = new Date().toISOString()
      failedTask.actualDuration = Date.now() - new Date(failedTask.startedAt || failedTask.createdAt).getTime()
      
      // Add error step or update current step as failed
      const errorStepId = `${task.id}-error`
      updateStep(errorStepId, {
        id: errorStepId,
        taskId: task.id,
        stepNumber: (failedTask.steps?.length || 0) + 1,
        type: 'error',
        status: 'failed',
        title: '❌ Task execution failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      })
      
      taskStore.completeTask(task.id, undefined, error instanceof Error ? error.message : 'Unknown error')
      console.log(`📊 Task ${task.id} marked as failed`)
    }
  }
}