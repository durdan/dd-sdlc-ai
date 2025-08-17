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
  
  private meetingConfig: RateLimitConfig = {
    maxDocuments: 5, // Lower limit for meeting transcripts due to higher processing cost
    windowHours: 24,
    burstLimit: 2 // Max 2 meeting transcript requests per minute
  }

  /**
   * Check if anonymous user can generate a document
   */
  async checkAnonymousLimit(sessionId: string, documentType?: string): Promise<{
    allowed: boolean
    remaining: number
    resetAt: Date
    reason?: string
  }> {
    try {
      // Use appropriate config based on document type
      const activeConfig = documentType === 'meeting' ? this.meetingConfig : this.config
      
      // Skip burst limit check for now - it's incorrectly implemented
      // TODO: Implement proper burst protection by tracking request timestamps
      // The current logic incorrectly uses total project_count instead of recent request count

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
          remaining: activeConfig.maxDocuments,
          resetAt: new Date(Date.now() + activeConfig.windowHours * 60 * 60 * 1000)
        }
      }

      if (!session) {
        // New session
        return {
          allowed: true,
          remaining: activeConfig.maxDocuments,
          resetAt: new Date(Date.now() + activeConfig.windowHours * 60 * 60 * 1000)
        }
      }

      // Check if within 24-hour window
      const sessionAge = Date.now() - new Date(session.created_at).getTime()
      const windowMs = activeConfig.windowHours * 60 * 60 * 1000

      if (sessionAge > windowMs) {
        // Session expired, reset count
        await this.resetSessionCount(sessionId)
        return {
          allowed: true,
          remaining: activeConfig.maxDocuments,
          resetAt: new Date(Date.now() + windowMs)
        }
      }

      const projectCount = session.project_count || 0
      const remaining = Math.max(0, activeConfig.maxDocuments - projectCount)
      
      const limitMessage = documentType === 'meeting' 
        ? 'Meeting transcript processing limit reached. Sign up for unlimited access!'
        : 'Daily limit reached. Sign up for unlimited access!'

      return {
        allowed: remaining > 0,
        remaining,
        resetAt: new Date(new Date(session.created_at).getTime() + windowMs),
        reason: remaining === 0 ? limitMessage : undefined
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      // Allow on error to not block users
      return {
        allowed: true,
        remaining: activeConfig.maxDocuments,
        resetAt: new Date(Date.now() + activeConfig.windowHours * 60 * 60 * 1000)
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