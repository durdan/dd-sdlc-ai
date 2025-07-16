import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { usageTracker } from '@/lib/usage-tracking-service'
import { createOpenAI } from '@ai-sdk/openai'

export interface FreemiumConfig {
  projectType: string
  requiresAuth: boolean
  allowSystemKey: boolean
  maxTokens?: number
  estimatedCost?: number
}

export interface FreemiumResult {
  canProceed: boolean
  useSystemKey: boolean
  openaiClient: any
  userId: string | null
  usageTracker: any
  error?: string
  remainingProjects?: number
}

/**
 * Middleware to handle freemium limits and key selection
 */
export async function handleFreemiumRequest(
  request: NextRequest,
  config: FreemiumConfig
): Promise<FreemiumResult> {
  try {
    const supabase = createClient()
    let userId: string | null = null
    let userOpenAIKey: string | null = null

    // Check authentication if required
    if (config.requiresAuth) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          canProceed: false,
          useSystemKey: false,
          openaiClient: null,
          userId: null,
          usageTracker,
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

    // Get request body to check for user's OpenAI key
    const body = await request.json()
    userOpenAIKey = body.openaiKey

    // Determine key usage strategy
    let useSystemKey = false
    let openaiClient: any = null

    if (userOpenAIKey) {
      // User provided their own key - use it directly
      openaiClient = createOpenAI({ apiKey: userOpenAIKey })
      useSystemKey = false
    } else if (config.allowSystemKey && userId) {
      // Check if user can use system key (daily limit)
      const usageStats = await usageTracker.checkDailyLimit(userId)
      
      if (!usageStats.can_create) {
        return {
          canProceed: false,
          useSystemKey: false,
          openaiClient: null,
          userId,
          usageTracker,
          error: `Daily limit exceeded. You've used ${usageStats.projects_today}/${usageStats.daily_limit} free projects today. Please provide your own OpenAI key or try again tomorrow.`,
          remainingProjects: usageStats.remaining
        }
      }

      // Use system key
      const systemKey = process.env.OPENAI_API_KEY
      if (!systemKey) {
        return {
          canProceed: false,
          useSystemKey: false,
          openaiClient: null,
          userId,
          usageTracker,
          error: 'System OpenAI key not configured. Please provide your own OpenAI key.'
        }
      }

      openaiClient = createOpenAI({ apiKey: systemKey })
      useSystemKey = true
    } else {
      // No key available
      return {
        canProceed: false,
        useSystemKey: false,
        openaiClient: null,
        userId,
        usageTracker,
        error: 'OpenAI API key required. Please provide your own key or sign in to use free daily credits.'
      }
    }

    return {
      canProceed: true,
      useSystemKey,
      openaiClient,
      userId,
      usageTracker,
      remainingProjects: userId ? (await usageTracker.checkDailyLimit(userId)).remaining : undefined
    }
  } catch (error) {
    console.error('Error in freemium middleware:', error)
    return {
      canProceed: false,
      useSystemKey: false,
      openaiClient: null,
      userId: null,
      usageTracker,
      error: 'Internal server error'
    }
  }
}

/**
 * Record project generation after successful completion
 */
export async function recordProjectGeneration(
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
      ai_provider: 'openai',
      tokens_used: tokensUsed,
      cost_estimate: calculateCost(tokensUsed, 'openai'),
      generation_time_ms: generationTimeMs,
      success,
      error_message: errorMessage,
      metadata: metadata || {}
    })
  } catch (error) {
    console.error('Error recording project generation:', error)
  }
}

/**
 * Calculate estimated cost based on tokens and provider
 */
function calculateCost(tokens: number, provider: 'openai' | 'claude'): number {
  // OpenAI GPT-4 pricing (approximate)
  const openaiCostPer1kTokens = 0.03 // $0.03 per 1K tokens
  
  // Claude pricing (approximate)
  const claudeCostPer1kTokens = 0.024 // $0.024 per 1K tokens
  
  const costPer1k = provider === 'openai' ? openaiCostPer1kTokens : claudeCostPer1kTokens
  
  return (tokens / 1000) * costPer1k
}

/**
 * Create standardized error response
 */
export function createFreemiumErrorResponse(error: string, statusCode: number = 429): NextResponse {
  return NextResponse.json({
    error,
    type: 'freemium_limit',
    message: 'Daily free project limit exceeded',
    suggestion: 'Provide your own OpenAI API key or upgrade to a paid plan'
  }, { status: statusCode })
}

/**
 * Create standardized success response with usage info
 */
export function createFreemiumSuccessResponse(
  data: any,
  useSystemKey: boolean,
  remainingProjects?: number
): NextResponse {
  const response: any = {
    ...data,
    usage_info: {
      used_system_key: useSystemKey,
      remaining_free_projects: remainingProjects
    }
  }

  if (useSystemKey && remainingProjects !== undefined) {
    response.usage_info.message = `You have ${remainingProjects} free projects remaining today`
  }

  return NextResponse.json(response)
}

/**
 * Wrapper function to easily integrate with existing endpoints
 */
export function withFreemiumSupport(
  config: FreemiumConfig,
  handler: (request: NextRequest, freemiumResult: FreemiumResult, body: any) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    
    // Handle freemium logic
    const freemiumResult = await handleFreemiumRequest(request, config)
    
    if (!freemiumResult.canProceed) {
      return createFreemiumErrorResponse(freemiumResult.error || 'Request denied')
    }

    try {
      // Get request body (already parsed in middleware)
      const body = await request.json()
      
      // Call the actual handler
      const response = await handler(request, freemiumResult, body)
      
      // Record successful generation
      if (freemiumResult.userId && response.status === 200) {
        const generationTime = Date.now() - startTime
        await recordProjectGeneration(
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
        await recordProjectGeneration(
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