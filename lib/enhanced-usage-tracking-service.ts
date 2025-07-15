import { createClient } from '@/lib/supabase/server'
import { usageTracker } from '@/lib/usage-tracking-service'

export interface ServiceUsage {
  service_type: 'sdlc_documents' | 'claude_code_assistant' | 'github_code_assistant' | 'claude_code_generation' | 'repository_analysis'
  ai_provider: 'openai' | 'claude'
  tokens_used: number
  cost_estimate: number
  generation_time_ms: number
  success: boolean
  error_message?: string
  metadata?: Record<string, any>
}

export interface UsageStats {
  total_projects: number
  projects_today: number
  daily_limit: number
  remaining_projects: number
  can_create: boolean
  services_breakdown: {
    sdlc_documents: { count: number; tokens: number; cost: number }
    claude_code_assistant: { count: number; tokens: number; cost: number }
    github_code_assistant: { count: number; tokens: number; cost: number }
  }
  ai_providers_breakdown: {
    openai: { count: number; tokens: number; cost: number }
    claude: { count: number; tokens: number; cost: number }
  }
}

export class EnhancedUsageTrackingService {
  private supabase = createClient()

  /**
   * Record service usage with enhanced tracking
   */
  async recordServiceUsage(
    userId: string,
    serviceUsage: ServiceUsage,
    useSystemKey: boolean
  ): Promise<void> {
    try {
      // Use the existing usage tracker for basic project counting
      if (useSystemKey) {
        await usageTracker.incrementProjectCount(userId, 'system_key')
      } else {
        await usageTracker.incrementProjectCount(userId, 'user_key')
      }

      // Record detailed service usage
      await usageTracker.recordProjectGeneration({
        user_id: userId,
        project_type: serviceUsage.service_type,
        generation_method: useSystemKey ? 'system_key' : 'user_key',
        ai_provider: serviceUsage.ai_provider,
        tokens_used: serviceUsage.tokens_used,
        cost_estimate: serviceUsage.cost_estimate,
        generation_time_ms: serviceUsage.generation_time_ms,
        success: serviceUsage.success,
        error_message: serviceUsage.error_message,
        metadata: serviceUsage.metadata || {}
      })

      // Also record in enhanced service tracking table
      await this.supabase.from('enhanced_service_usage').insert({
        user_id: userId,
        service_type: serviceUsage.service_type,
        ai_provider: serviceUsage.ai_provider,
        tokens_used: serviceUsage.tokens_used,
        cost_estimate: serviceUsage.cost_estimate,
        generation_time_ms: serviceUsage.generation_time_ms,
        success: serviceUsage.success,
        error_message: serviceUsage.error_message,
        metadata: serviceUsage.metadata,
        used_system_key: useSystemKey,
        created_at: new Date().toISOString()
      })

      console.log(`✅ Recorded ${serviceUsage.service_type} usage for user ${userId}`)
    } catch (error) {
      console.error('Error recording service usage:', error)
    }
  }

  /**
   * Get enhanced usage statistics
   */
  async getEnhancedUsageStats(userId: string): Promise<UsageStats> {
    try {
      // Get basic usage stats
      const basicStats = await usageTracker.checkDailyLimit(userId)
      
      // Get detailed service breakdown
      const { data: serviceUsage } = await this.supabase
        .from('enhanced_service_usage')
        .select('service_type, ai_provider, tokens_used, cost_estimate')
        .eq('user_id', userId)
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

      // Initialize breakdown objects
      const servicesBreakdown = {
        sdlc_documents: { count: 0, tokens: 0, cost: 0 },
        claude_code_assistant: { count: 0, tokens: 0, cost: 0 },
        github_code_assistant: { count: 0, tokens: 0, cost: 0 }
      }

      const aiProvidersBreakdown = {
        openai: { count: 0, tokens: 0, cost: 0 },
        claude: { count: 0, tokens: 0, cost: 0 }
      }

      // Process service usage data
      serviceUsage?.forEach(usage => {
        // Service breakdown
        if (usage.service_type in servicesBreakdown) {
          const serviceKey = usage.service_type as keyof typeof servicesBreakdown
          servicesBreakdown[serviceKey].count += 1
          servicesBreakdown[serviceKey].tokens += usage.tokens_used || 0
          servicesBreakdown[serviceKey].cost += usage.cost_estimate || 0
        }

        // AI provider breakdown
        if (usage.ai_provider in aiProvidersBreakdown) {
          const providerKey = usage.ai_provider as keyof typeof aiProvidersBreakdown
          aiProvidersBreakdown[providerKey].count += 1
          aiProvidersBreakdown[providerKey].tokens += usage.tokens_used || 0
          aiProvidersBreakdown[providerKey].cost += usage.cost_estimate || 0
        }
      })

      return {
        total_projects: basicStats.projects_today,
        projects_today: basicStats.projects_today,
        daily_limit: basicStats.daily_limit,
        remaining_projects: basicStats.remaining,
        can_create: basicStats.can_create,
        services_breakdown: servicesBreakdown,
        ai_providers_breakdown: aiProvidersBreakdown
      }
    } catch (error) {
      console.error('Error getting enhanced usage stats:', error)
      // Fallback to basic stats
      const basicStats = await usageTracker.checkDailyLimit(userId)
      return {
        total_projects: basicStats.projects_today,
        projects_today: basicStats.projects_today,
        daily_limit: basicStats.daily_limit,
        remaining_projects: basicStats.remaining,
        can_create: basicStats.can_create,
        services_breakdown: {
          sdlc_documents: { count: 0, tokens: 0, cost: 0 },
          claude_code_assistant: { count: 0, tokens: 0, cost: 0 },
          github_code_assistant: { count: 0, tokens: 0, cost: 0 }
        },
        ai_providers_breakdown: {
          openai: { count: 0, tokens: 0, cost: 0 },
          claude: { count: 0, tokens: 0, cost: 0 }
        }
      }
    }
  }

  /**
   * Check if user can use specific service
   */
  async canUseService(
    userId: string,
    serviceType: ServiceUsage['service_type']
  ): Promise<{
    can_use: boolean
    reason?: string
    remaining_projects: number
    service_specific_limit?: number
  }> {
    try {
      const basicStats = await usageTracker.checkDailyLimit(userId)
      
      if (!basicStats.can_create) {
        return {
          can_use: false,
          reason: 'Daily project limit exceeded',
          remaining_projects: 0
        }
      }

      // Check service-specific limits if needed
      const serviceUsageToday = await this.getServiceUsageToday(userId, serviceType)
      
      // Example: Claude code assistant has a sub-limit of 5 per day
      const serviceSpecificLimits = {
        claude_code_assistant: 5,
        github_code_assistant: 5,
        sdlc_documents: basicStats.daily_limit // No sub-limit
      }

      const serviceLimit = serviceSpecificLimits[serviceType] || basicStats.daily_limit
      
      if (serviceUsageToday >= serviceLimit) {
        return {
          can_use: false,
          reason: `${serviceType} daily limit exceeded`,
          remaining_projects: basicStats.remaining,
          service_specific_limit: serviceLimit
        }
      }

      return {
        can_use: true,
        remaining_projects: basicStats.remaining,
        service_specific_limit: serviceLimit
      }
    } catch (error) {
      console.error('Error checking service usage:', error)
      return {
        can_use: false,
        reason: 'Error checking usage',
        remaining_projects: 0
      }
    }
  }

  /**
   * Get service usage count for today
   */
  private async getServiceUsageToday(
    userId: string,
    serviceType: ServiceUsage['service_type']
  ): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('enhanced_service_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('service_type', serviceType)
        .eq('success', true)
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

      if (error) throw error
      return data?.length || 0
    } catch (error) {
      console.error('Error getting service usage today:', error)
      return 0
    }
  }

  /**
   * Get usage analytics for admin
   */
  async getUsageAnalytics(
    startDate: string,
    endDate: string,
    userId?: string
  ): Promise<{
    total_requests: number
    success_rate: number
    average_tokens_per_request: number
    total_cost: number
    service_breakdown: Record<string, number>
    provider_breakdown: Record<string, number>
    user_breakdown?: Record<string, number>
  }> {
    try {
      let query = this.supabase
        .from('enhanced_service_usage')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: usage, error } = await query

      if (error) throw error

      const totalRequests = usage?.length || 0
      const successfulRequests = usage?.filter(u => u.success).length || 0
      const totalTokens = usage?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0
      const totalCost = usage?.reduce((sum, u) => sum + (u.cost_estimate || 0), 0) || 0

      // Service breakdown
      const serviceBreakdown: Record<string, number> = {}
      usage?.forEach(u => {
        serviceBreakdown[u.service_type] = (serviceBreakdown[u.service_type] || 0) + 1
      })

      // Provider breakdown
      const providerBreakdown: Record<string, number> = {}
      usage?.forEach(u => {
        providerBreakdown[u.ai_provider] = (providerBreakdown[u.ai_provider] || 0) + 1
      })

      // User breakdown (if not filtering by user)
      const userBreakdown: Record<string, number> = {}
      if (!userId) {
        usage?.forEach(u => {
          userBreakdown[u.user_id] = (userBreakdown[u.user_id] || 0) + 1
        })
      }

      return {
        total_requests: totalRequests,
        success_rate: totalRequests > 0 ? successfulRequests / totalRequests : 0,
        average_tokens_per_request: totalRequests > 0 ? totalTokens / totalRequests : 0,
        total_cost: totalCost,
        service_breakdown: serviceBreakdown,
        provider_breakdown: providerBreakdown,
        user_breakdown: userId ? undefined : userBreakdown
      }
    } catch (error) {
      console.error('Error getting usage analytics:', error)
      return {
        total_requests: 0,
        success_rate: 0,
        average_tokens_per_request: 0,
        total_cost: 0,
        service_breakdown: {},
        provider_breakdown: {},
        user_breakdown: {}
      }
    }
  }
}

export const enhancedUsageTracker = new EnhancedUsageTrackingService() 