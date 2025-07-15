import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { usageTracker } from '@/lib/usage-tracking-service'
import { ClaudeCodeService } from '@/lib/claude-service'

export interface ClaudeFreemiumConfig {
  projectType: string
  requiresAuth: boolean
  allowSystemKey: boolean
  maxTokens?: number
  estimatedCost?: number
}

export interface ClaudeFreemiumResult {
  canProceed: boolean
  useSystemKey: boolean
  claudeService: ClaudeCodeService | null
  userId: string | null
  error?: string
  remainingProjects?: number
}

/**
 * Middleware to handle Claude freemium limits and key selection
 */
export async function handleClaudeFreemiumRequest(
  request: NextRequest,
  config: ClaudeFreemiumConfig
): Promise<ClaudeFreemiumResult> {
  try {
    const supabase = createClient()
    let userId: string | null = null
    let userClaudeKey: string | null = null

    // Check authentication if required
    if (config.requiresAuth) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          canProceed: false,
          useSystemKey: false,
          claudeService: null,
          userId: null,
          error: 'Authentication required'
        }
      }
      
      userId = user.id

      // Create user profile if it doesn't exist
      await usageTracker.upsertUserProfile(
        userId,
        user.email || '',
        user.user_metadata?.full_name,
        user.user_metadata?.avatar_url
      )
    }

    // Get request body to check for user's Claude key
    const body = await request.json()
    userClaudeKey = body.claudeKey || body.anthropicKey

    // Determine key usage strategy
    let useSystemKey = false
    let claudeService: ClaudeCodeService | null = null

    if (userClaudeKey) {
      // User provided their own key - use it directly
      claudeService = new ClaudeCodeService({
        apiKey: userClaudeKey,
        model: body.model || 'claude-3-5-sonnet-20241022',
        maxTokens: config.maxTokens || 8192,
        temperature: body.temperature || 0.1
      })
      useSystemKey = false
    } else if (config.allowSystemKey && userId) {
      // Check if user can use system key (daily limit)
      const usageStats = await usageTracker.checkDailyLimit(userId)
      
      if (!usageStats.can_create) {
        return {
          canProceed: false,
          useSystemKey: false,
          claudeService: null,
          userId,
          error: `Daily limit exceeded. You've used ${usageStats.projects_today}/${usageStats.daily_limit} free Claude projects today. Please provide your own Claude API key or try again tomorrow.`,
          remainingProjects: usageStats.remaining
        }
      }

      // Use system key
      const systemKey = process.env.ANTHROPIC_API_KEY
      if (!systemKey) {
        return {
          canProceed: false,
          useSystemKey: false,
          claudeService: null,
          userId,
          error: 'System Claude API key not configured. Please provide your own Claude API key.'
        }
      }

      claudeService = new ClaudeCodeService({
        apiKey: systemKey,
        model: body.model || 'claude-3-5-sonnet-20241022',
        maxTokens: config.maxTokens || 8192,
        temperature: body.temperature || 0.1
      })
      useSystemKey = true
    } else {
      // No key available
      return {
        canProceed: false,
        useSystemKey: false,
        claudeService: null,
        userId,
        error: 'Claude API key required. Please provide your own key or sign in to use free daily credits.'
      }
    }

    return {
      canProceed: true,
      useSystemKey,
      claudeService,
      userId,
      remainingProjects: userId ? (await usageTracker.checkDailyLimit(userId)).remaining : undefined
    }
  } catch (error) {
    console.error('Error in Claude freemium middleware:', error)
    return {
      canProceed: false,
      useSystemKey: false,
      claudeService: null,
      userId: null,
      error: 'Internal server error'
    }
  }
}

/**
 * Record Claude project generation after successful completion
 */
export async function recordClaudeProjectGeneration(
  userId: string,
  projectType: string,
  useSystemKey: boolean,
  tokensUsed: number,
  generationTimeMs: number,
  success: boolean,
  errorMessage?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Increment project count if successful
    if (success && useSystemKey) {
      await usageTracker.incrementProjectCount(userId, 'system_key')
    } else if (success && !useSystemKey) {
      await usageTracker.incrementProjectCount(userId, 'user_key')
    }

    // Record detailed generation info
    await usageTracker.recordProjectGeneration({
      user_id: userId,
      project_type: projectType,
      generation_method: useSystemKey ? 'system_key' : 'user_key',
      ai_provider: 'claude',
      tokens_used: tokensUsed,
      cost_estimate: calculateClaudeCost(tokensUsed),
      generation_time_ms: generationTimeMs,
      success,
      error_message: errorMessage,
      metadata: metadata || {}
    })
  } catch (error) {
    console.error('Error recording Claude project generation:', error)
  }
}

/**
 * Calculate estimated cost based on tokens for Claude
 */
function calculateClaudeCost(tokens: number): number {
  // Claude pricing (approximate)
  const claudeCostPer1kTokens = 0.024 // $0.024 per 1K tokens
  
  return (tokens / 1000) * claudeCostPer1kTokens
}

/**
 * Create standardized error response for Claude
 */
export function createClaudeFreemiumErrorResponse(error: string, statusCode: number = 429): NextResponse {
  return NextResponse.json({
    error,
    type: 'claude_freemium_limit',
    message: 'Daily free Claude project limit exceeded',
    suggestion: 'Provide your own Claude API key or upgrade to a paid plan'
  }, { status: statusCode })
}

/**
 * Create standardized success response with usage info for Claude
 */
export function createClaudeFreemiumSuccessResponse(
  data: any,
  useSystemKey: boolean,
  remainingProjects?: number
): NextResponse {
  const response: any = {
    ...data,
    usage_info: {
      used_system_key: useSystemKey,
      remaining_free_projects: remainingProjects,
      ai_provider: 'claude'
    }
  }

  if (useSystemKey && remainingProjects !== undefined) {
    response.usage_info.message = `You have ${remainingProjects} free Claude projects remaining today`
  }

  return NextResponse.json(response)
}

/**
 * Wrapper function to easily integrate with existing Claude endpoints
 */
export function withClaudeFreemiumSupport(
  config: ClaudeFreemiumConfig,
  handler: (request: NextRequest, freemiumResult: ClaudeFreemiumResult, body: any) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    
    // Handle Claude freemium logic
    const freemiumResult = await handleClaudeFreemiumRequest(request, config)
    
    if (!freemiumResult.canProceed) {
      return createClaudeFreemiumErrorResponse(freemiumResult.error || 'Request denied')
    }

    try {
      // Get request body (already parsed in middleware)
      const body = await request.json()
      
      // Call the actual handler
      const response = await handler(request, freemiumResult, body)
      
      // Record successful generation
      if (freemiumResult.userId && response.status === 200) {
        const generationTime = Date.now() - startTime
        await recordClaudeProjectGeneration(
          freemiumResult.userId,
          config.projectType,
          freemiumResult.useSystemKey,
          config.maxTokens || 0,
          generationTime,
          true,
          undefined,
          { endpoint: config.projectType }
        )
      }
      
      return response
    } catch (error) {
      // Record failed generation
      if (freemiumResult.userId) {
        const generationTime = Date.now() - startTime
        await recordClaudeProjectGeneration(
          freemiumResult.userId,
          config.projectType,
          freemiumResult.useSystemKey,
          0,
          generationTime,
          false,
          error instanceof Error ? error.message : 'Unknown error'
        )
      }
      
      throw error
    }
  }
} 