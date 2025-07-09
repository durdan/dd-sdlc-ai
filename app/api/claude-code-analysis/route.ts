import { NextRequest, NextResponse } from 'next/server'
import { ClaudeCodeService } from '@/lib/claude-service'
import { createClient } from '@/lib/supabase/server'

// Helper function to get Claude configuration
async function getClaudeConfig(req: NextRequest) {
  // First check if config is passed directly (for connection testing)
  const body = await req.json()
  
  if (body.testConnection && body.apiKey) {
    return {
      apiKey: body.apiKey,
      model: body.model || 'claude-3-5-sonnet-20241022',
      maxTokens: body.maxTokens || 200000,
      temperature: body.temperature || 0.1
    }
  }
  
  // Otherwise, get from user's integration configuration
  // In a real implementation, you might store this in the database
  // For now, we'll expect the frontend to pass the configuration
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
    const claudeConfig = await getClaudeConfig(req)
    
    if (!claudeConfig.apiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured. Please configure in Integration Hub.' },
        { status: 400 }
      )
    }

    // Handle connection test
    if (body.testConnection) {
      try {
        const claudeService = new ClaudeCodeService(claudeConfig)
        const connectionSuccess = await claudeService.testConnection()
        
        return NextResponse.json({
          success: connectionSuccess,
          message: connectionSuccess ? 'Connection successful' : 'Connection failed'
        })
      } catch (error) {
        return NextResponse.json(
          { error: 'Connection test failed', details: error instanceof Error ? error.message : 'Unknown error' },
          { status: 400 }
        )
      }
    }

    const {
      repositoryUrl,
      codeContent,
      analysisType,
      context,
      requirements
    } = body

    // Validate input
    if (!analysisType) {
      return NextResponse.json(
        { error: 'Analysis type is required' },
        { status: 400 }
      )
    }

    if (!codeContent && !repositoryUrl) {
      return NextResponse.json(
        { error: 'Either code content or repository URL is required' },
        { status: 400 }
      )
    }

    // Initialize Claude service with user configuration
    const claudeService = new ClaudeCodeService(claudeConfig)

    // Perform analysis
    const analysisResult = await claudeService.analyzeCode({
      repositoryUrl,
      codeContent,
      analysisType,
      context,
      requirements
    })

    // Store analysis in database
    const { data: analysisRecord, error: insertError } = await supabase
      .from('sdlc_ai_code_analyses')
      .insert({
        user_id: user.id,
        analysis_type: analysisType,
        repository_url: repositoryUrl,
        code_content: codeContent?.substring(0, 5000), // Store first 5k chars
        context,
        requirements,
        analysis_result: analysisResult,
        ai_provider: 'claude',
        model_used: claudeConfig.model,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insertion error:', insertError)
      // Don't fail the request if DB insert fails, just log it
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      analysis_id: analysisRecord?.id,
      model_used: claudeConfig.model
    })

  } catch (error) {
    console.error('Claude code analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Code analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 