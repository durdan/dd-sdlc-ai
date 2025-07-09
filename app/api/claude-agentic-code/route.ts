import { NextRequest, NextResponse } from 'next/server'
import { ClaudeCodeService } from '@/lib/claude-service'
import { createClient } from '@/lib/supabase/server'

// Helper function to get Claude configuration
async function getClaudeConfig(body: any) {
  return {
    apiKey: body.claudeConfig?.apiKey || process.env.ANTHROPIC_API_KEY,
    model: body.claudeConfig?.model || 'claude-3-5-sonnet-20241022',
    maxTokens: body.claudeConfig?.maxTokens || 200000,
    temperature: body.claudeConfig?.temperature || 0.1
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await req.json()
    
    // Get Claude configuration
    const claudeConfig = await getClaudeConfig(body)
    
    if (!claudeConfig.apiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured. Please configure in Integration Hub.' },
        { status: 400 }
      )
    }

    const {
      task_type,
      codebase_context,
      specific_request,
      file_contents,
      requirements,
      constraints,
      project_id
    } = body

    // Validate required inputs
    if (!task_type || !codebase_context || !specific_request) {
      return NextResponse.json(
        { error: 'Task type, codebase context, and specific request are required' },
        { status: 400 }
      )
    }

    // Initialize Claude service with user configuration
    const claudeService = new ClaudeCodeService(claudeConfig)

    // Generate agentic code implementation
    const codeResult = await claudeService.generateAgenticCode({
      task_type,
      codebase_context,
      specific_request,
      file_contents,
      requirements,
      constraints
    })

    // Create task execution record
    const { data: taskRecord, error: taskError } = await supabase
      .from('sdlc_task_executions')
      .insert({
        user_id: user.id,
        project_id: project_id || null,
        task_type: 'code_generation',
        task_name: `Claude: ${task_type}`,
        task_description: specific_request,
        ai_provider: 'claude',
        model_used: claudeConfig.model,
        execution_status: 'completed',
        execution_result: codeResult,
        execution_logs: [
          {
            timestamp: new Date().toISOString(),
            message: `Starting Claude agentic code generation with ${claudeConfig.model}`,
            level: 'info'
          },
          {
            timestamp: new Date().toISOString(),
            message: `Generated implementation for ${task_type}`,
            level: 'success'
          }
        ],
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (taskError) {
      console.error('Database task insertion error:', taskError)
    }

    // Store in AI integrations table
    const { data: integrationRecord, error: integrationError } = await supabase
      .from('sdlc_ai_integrations')
      .insert({
        user_id: user.id,
        provider_name: 'claude',
        integration_type: 'agentic_coding',
        configuration: {
          model: claudeConfig.model,
          task_type,
          features_enabled: ['code_generation', 'test_creation', 'documentation'],
          maxTokens: claudeConfig.maxTokens,
          temperature: claudeConfig.temperature
        },
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (integrationError) {
      console.error('Database integration insertion error:', integrationError)
    }

    return NextResponse.json({
      success: true,
      result: codeResult,
      task_id: taskRecord?.id,
      integration_id: integrationRecord?.id,
      model_used: claudeConfig.model,
      metrics: {
        files_to_create: codeResult.implementation.files_to_create.length,
        files_to_modify: codeResult.implementation.files_to_modify.length,
        tests_generated: codeResult.tests.unit_tests.length + codeResult.tests.integration_tests.length,
        documentation_updates: codeResult.documentation.changes_needed.length
      }
    })

  } catch (error) {
    console.error('Claude agentic code generation error:', error)
    
    // Log failed execution
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from('sdlc_task_executions')
          .insert({
            user_id: user.id,
            task_type: 'code_generation',
            task_name: 'Claude: Agentic Code Generation',
            task_description: 'Failed execution',
            ai_provider: 'claude',
            execution_status: 'failed',
            execution_logs: [
              {
                timestamp: new Date().toISOString(),
                message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                level: 'error'
              }
            ],
            created_at: new Date().toISOString()
          })
      }
    } catch (logError) {
      console.error('Failed to log error to database:', logError)
    }

    return NextResponse.json(
      { 
        error: 'Agentic code generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 