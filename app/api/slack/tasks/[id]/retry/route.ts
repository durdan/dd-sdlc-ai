import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ClaudeCodeService, AgenticCodeRequest } from '@/lib/claude-service'
import { cookies } from 'next/headers'
import taskStore, { StoredTask } from '@/lib/task-store'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id: taskId } = await params

    // Get task from shared store
    const originalTask = taskStore.getTask(taskId)
    
    if (!originalTask) {
      console.log(`❌ Task ${taskId} not found for retry`)
      console.log(`📊 Current store stats:`, taskStore.getStats())
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user has access to this task
    if (!originalTask.id.includes(user.id) && !originalTask.id.includes('user-')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if task can be retried (only failed or cancelled tasks)
    if (originalTask.status !== 'failed' && originalTask.status !== 'cancelled') {
      return NextResponse.json({ error: `Task status is '${originalTask.status}' - only failed or cancelled tasks can be retried` }, { status: 400 })
    }

    console.log(`🔄 Retrying task: ${taskId} for user: ${user.id}`)
    console.log(`📊 Original task status: ${originalTask.status}`)

    // Get Claude API key - check user-specific config first, then environment variables
    let claudeApiKey = null
    
    console.log('🔍 [RETRY] Checking for user-specific Claude configuration...')
    console.log('🆔 [RETRY] User ID:', user.id)
    
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

    console.log('📊 [RETRY] Database query result:', {
      hasData: !!claudeConfig,
      hasError: !!configError,
      errorMessage: configError?.message,
      errorCode: configError?.code,
      apiKeyFound: !!claudeConfig?.encrypted_api_key,
      apiKeyPreview: claudeConfig?.encrypted_api_key ? claudeConfig.encrypted_api_key.slice(0, 10) + '...' : 'none'
    })

    if (configError) {
      console.log('❌ [RETRY] Database query error:', configError)
      console.log('⚠️  [RETRY] No user-specific Claude configuration found, checking environment variables...')
    } else if (claudeConfig && claudeConfig.encrypted_api_key) {
      claudeApiKey = claudeConfig.encrypted_api_key // TODO: Decrypt if encrypted
      console.log('✅ [RETRY] Using user-specific Claude API key from database')
      console.log('🔑 [RETRY] API key starts with:', claudeApiKey.slice(0, 15) + '...')
    } else {
      console.log('⚠️  [RETRY] Query succeeded but no API key found, checking environment variables...')
    }

    // Fall back to environment variable if no user-specific key found
    if (!claudeApiKey) {
      claudeApiKey = process.env.ANTHROPIC_API_KEY
      if (claudeApiKey) {
        console.log('✅ [RETRY] Using system-wide Claude API key from environment')
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
    
    console.log('🔍 [RETRY] Checking for user-specific GitHub token...')
    try {
      const cookieStore = await cookies()
      const userGithubToken = cookieStore.get('github_token')
      
      if (userGithubToken && userGithubToken.value) {
        githubToken = userGithubToken.value
        console.log('✅ [RETRY] Using user-specific GitHub token from cookie')
      }
    } catch (cookieError) {
      console.log('⚠️  [RETRY] No user-specific GitHub token found, checking environment variables...')
    }

    // Fall back to environment variable if no user-specific token found
    if (!githubToken) {
      githubToken = process.env.GITHUB_TOKEN
      if (githubToken) {
        console.log('✅ [RETRY] Using system-wide GitHub token from environment')
      }
    }
    
    if (!githubToken) {
      return NextResponse.json({ 
        error: 'GitHub token not configured. Please connect your GitHub account in the Integration Hub or set GITHUB_TOKEN environment variable.',
        details: 'Go to the Integration Hub → GitHub tab to connect your account.'
      }, { status: 500 })
    }

    // Reset the existing task for retry instead of creating a new one
    console.log(`🔄 Resetting task ${taskId} for retry...`)
    
    // Find the first failed step to determine restart point
    let firstFailedStepIndex = -1
    if (originalTask.steps && originalTask.steps.length > 0) {
      firstFailedStepIndex = originalTask.steps.findIndex(step => step.status === 'failed')
    }
    
    console.log(`📊 Found ${originalTask.steps?.length || 0} existing steps, first failed step at index: ${firstFailedStepIndex}`)
    
    // Reset task state for retry
    originalTask.status = 'pending'
    originalTask.startedAt = undefined
    originalTask.completedAt = undefined
    originalTask.actualDuration = undefined
    
    // Reset progress
    if (originalTask.steps && originalTask.steps.length > 0) {
      // Reset failed and pending steps to pending, keep completed steps
      originalTask.steps.forEach((step, index) => {
        if (step.status === 'failed' || step.status === 'in_progress') {
          step.status = 'pending'
          step.startedAt = undefined
          step.completedAt = undefined
          step.error = undefined
          step.result = undefined
        }
        // Keep completed steps as-is to avoid redoing work
      })
      
      // Recalculate progress based on completed steps
      const completedSteps = originalTask.steps.filter(s => s.status === 'completed').length
      originalTask.progress = Math.round((completedSteps / originalTask.steps.length) * 100)
    } else {
      originalTask.progress = 0
      originalTask.steps = []
    }

    // Add retry metadata
    const retryCount = ((originalTask as any).retryCount || 0) + 1
    ;(originalTask as any).retryCount = retryCount
    ;(originalTask as any).lastRetryAt = new Date().toISOString()

    // Update the task in the store
    taskStore.updateTask(originalTask)

    console.log(`✅ Reset task ${taskId} for retry (attempt #${retryCount})`)
    console.log(`📊 Keeping ${originalTask.steps?.filter(s => s.status === 'completed').length || 0} completed steps`)
    console.log(`🔄 Will retry ${originalTask.steps?.filter(s => s.status === 'pending').length || 0} pending/failed steps`)

    // Start execution asynchronously using the reset task
    executeTaskAsync(originalTask, claudeApiKey, githubToken, firstFailedStepIndex)

    return NextResponse.json({ 
      message: 'Task retry initiated successfully',
      task: originalTask,
      retryCount,
      keptCompletedSteps: originalTask.steps?.filter(s => s.status === 'completed').length || 0,
      retryingSteps: originalTask.steps?.filter(s => s.status === 'pending').length || 0
    })
  } catch (error) {
    console.error('Error retrying task:', error)
    return NextResponse.json({ error: 'Failed to retry task' }, { status: 500 })
  }
}

// Simplified task execution for retry using unified Claude service
async function executeTaskAsync(task: StoredTask, claudeApiKey: string, githubToken: string, resumeFromStepIndex = -1) {
  try {
    console.log(`🚀 [RETRY] Starting async execution for task: ${task.id}`)
    console.log(`🔄 [RETRY] Resume from step index: ${resumeFromStepIndex}`)
    
    // Update task status to analyzing (or appropriate status based on first pending step)
    if (task.steps && task.steps.length > 0) {
      const firstPendingStep = task.steps.find(s => s.status === 'pending')
      if (firstPendingStep) {
        if (firstPendingStep.type === 'analysis') task.status = 'analyzing'
        else if (firstPendingStep.type === 'planning') task.status = 'planning'
        else if (firstPendingStep.type === 'code_generation' || firstPendingStep.type === 'file_creation' || firstPendingStep.type === 'file_modification') task.status = 'executing'
        else if (firstPendingStep.type === 'review') task.status = 'reviewing'
        else task.status = 'analyzing' // default
      } else {
        task.status = 'analyzing' // fallback
      }
    } else {
      task.status = 'analyzing'
    }
    
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
    console.log(`🤖 [RETRY] Executing Claude code generation for task: ${task.id}`)
    const result = await claudeService.generateAgenticCode(agenticRequest)

    console.log(`✅ [RETRY] Task ${task.id} execution completed`)
    
    // Get final task and update status
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
      
      // Update or add successful execution steps
      completedTask.steps = [
        {
          id: `${task.id}-retry-analysis`,
          taskId: task.id,
          stepNumber: 1,
          type: 'analysis',
          status: 'completed',
          title: 'Repository Analysis (Retry)',
          description: 'Re-analyzed repository structure and requirements',
          startedAt: task.startedAt,
          completedAt: new Date().toISOString()
        },
        {
          id: `${task.id}-retry-planning`,
          taskId: task.id,
          stepNumber: 2,
          type: 'planning',
          status: 'completed',
          title: 'Implementation Planning (Retry)',
          description: 'Created implementation plan with Claude AI',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        },
        {
          id: `${task.id}-retry-generation`,
          taskId: task.id,
          stepNumber: 3,
          type: 'code_generation',
          status: 'completed',
          title: 'Code Generation (Retry)',
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
    console.error(`❌ [RETRY] Execution failed for task ${task.id}:`, error)
    
    // Update task status to failed
    const failedTask = taskStore.getTask(task.id)
    if (failedTask) {
      failedTask.status = 'failed'
      failedTask.completedAt = new Date().toISOString()
      failedTask.actualDuration = Date.now() - new Date(failedTask.startedAt || failedTask.createdAt).getTime()
      
      // Add error step for retry failure
      failedTask.steps = [
        {
          id: `${task.id}-retry-error`,
          taskId: task.id,
          stepNumber: 1,
          type: 'analysis',
          status: 'failed',
          title: 'Retry Execution Failed',
          description: error instanceof Error ? error.message : 'Unknown error occurred during retry',
          error: error instanceof Error ? error.message : 'Unknown error',
          startedAt: task.startedAt,
          completedAt: new Date().toISOString()
        }
      ]
      
      taskStore.completeTask(task.id)
    }
  }
} 