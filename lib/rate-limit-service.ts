import { createClient } from '@/lib/supabase/client'

export interface RateLimitConfig {
  maxDocuments: number
  windowHours: number
  burstLimit: number // Max requests per minute
}

export class RateLimitService {
  private supabase = createClient()
  
  private config: RateLimitConfig = {
    maxDocuments: 10,
    windowHours: 24,
    burstLimit: 3 // Max 3 requests per minute to prevent spam
  }

  /**
   * Check if anonymous user can generate a document
   */
  async checkAnonymousLimit(sessionId: string): Promise<{
    allowed: boolean
    remaining: number
    resetAt: Date
    reason?: string
  }> {
    try {
      // Check burst limit first (spam protection)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
      const { data: recentRequests, error: burstError } = await this.supabase
        .from('anonymous_project_sessions')
        .select('project_count, last_activity')
        .eq('session_id', sessionId)
        .gte('last_activity', oneMinuteAgo.toISOString())
        .single()

      if (!burstError && recentRequests && recentRequests.project_count >= this.config.burstLimit) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: new Date(Date.now() + 60 * 1000),
          reason: 'Too many requests. Please wait a minute before trying again.'
        }
      }

      // Check daily limit
      const { data: session, error } = await this.supabase
        .from('anonymous_project_sessions')
        .select('project_count, created_at')
        .eq('session_id', sessionId)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('Error checking rate limit:', error)
        return {
          allowed: true,
          remaining: this.config.maxDocuments,
          resetAt: new Date(Date.now() + this.config.windowHours * 60 * 60 * 1000)
        }
      }

      if (!session) {
        // New session
        return {
          allowed: true,
          remaining: this.config.maxDocuments,
          resetAt: new Date(Date.now() + this.config.windowHours * 60 * 60 * 1000)
        }
      }

      // Check if within 24-hour window
      const sessionAge = Date.now() - new Date(session.created_at).getTime()
      const windowMs = this.config.windowHours * 60 * 60 * 1000

      if (sessionAge > windowMs) {
        // Session expired, reset count
        await this.resetSessionCount(sessionId)
        return {
          allowed: true,
          remaining: this.config.maxDocuments,
          resetAt: new Date(Date.now() + windowMs)
        }
      }

      const projectCount = session.project_count || 0
      const remaining = Math.max(0, this.config.maxDocuments - projectCount)

      return {
        allowed: remaining > 0,
        remaining,
        resetAt: new Date(new Date(session.created_at).getTime() + windowMs),
        reason: remaining === 0 ? 'Daily limit reached. Sign up for unlimited access!' : undefined
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      // Allow on error to not block users
      return {
        allowed: true,
        remaining: this.config.maxDocuments,
        resetAt: new Date(Date.now() + this.config.windowHours * 60 * 60 * 1000)
      }
    }
  }

  /**
   * Reset session count (for expired sessions)
   */
  private async resetSessionCount(sessionId: string): Promise<void> {
    try {
      await this.supabase
        .from('anonymous_project_sessions')
        .update({ 
          project_count: 0,
          created_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
    } catch (error) {
      console.error('Error resetting session count:', error)
    }
  }

  /**
   * Get rate limit status for display
   */
  async getRateLimitStatus(sessionId: string): Promise<{
    used: number
    total: number
    remaining: number
    resetAt: Date
  }> {
    const { remaining, resetAt } = await this.checkAnonymousLimit(sessionId)
    const used = this.config.maxDocuments - remaining

    return {
      used,
      total: this.config.maxDocuments,
      remaining,
      resetAt
    }
  }

  /**
   * Check if IP is suspicious (basic DDoS protection)
   */
  async checkIPReputation(ipAddress: string): Promise<boolean> {
    try {
      // Check if IP has too many sessions
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const { data, error } = await this.supabase
        .from('anonymous_project_sessions')
        .select('id')
        .eq('ip_address', ipAddress)
        .gte('created_at', oneHourAgo.toISOString())

      if (error) {
        console.error('Error checking IP reputation:', error)
        return true // Allow on error
      }

      // If more than 5 sessions from same IP in last hour, block
      return (data?.length || 0) < 5
    } catch (error) {
      console.error('IP reputation check error:', error)
      return true
    }
  }
}

// Create singleton instance
export const rateLimitService = new RateLimitService()