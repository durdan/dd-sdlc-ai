import { createClient } from '@/lib/supabase/server'
import { createClient as createClientComponent } from '@/lib/supabase/client'

export interface UsageStats {
  can_create: boolean
  projects_today: number
  daily_limit: number
  remaining: number
}

export interface UserStats {
  today: UsageStats
  total_projects: number
  last_30_days: number
}

export interface ProjectGeneration {
  id: string
  user_id: string
  project_type: string
  generation_method: 'system_key' | 'user_key'
  ai_provider: string
  tokens_used: number
  cost_estimate: number
  generation_time_ms: number
  success: boolean
  error_message?: string
  metadata: Record<string, any>
  created_at: string
}

export interface AdminUserStats {
  id: string
  email: string
  full_name: string
  role: string
  subscription_type: string
  total_projects_created: number
  projects_today: number
  last_login_at: string
  created_at: string
}

export interface SystemAnalytics {
  analytics_date: string
  total_users: number
  active_users: number
  new_users: number
  total_projects: number
  system_key_usage: number
  user_key_usage: number
  total_tokens_used: number
  total_cost_estimate: number
  error_rate: number
  avg_generation_time_ms: number
}

export class UsageTrackingService {
  private supabase: any

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient
  }

  /**
   * Create a new instance with server client
   */
  static async createServerInstance() {
    const supabase = await createClient()
    return new UsageTrackingService(supabase)
  }

  /**
   * Create a new instance with client component
   */
  static createClientInstance() {
    const supabase = createClientComponent()
    return new UsageTrackingService(supabase)
  }

  /**
   * Check if user can create a project today
   */
  async checkDailyLimit(userId: string): Promise<UsageStats> {
    try {
      const { data, error } = await this.supabase
        .rpc('check_daily_project_limit', { p_user_id: userId })

      if (error) {
        console.error('Error checking daily limit:', error)
        // Return default limit if error
        return {
          can_create: true,
          projects_today: 0,
          daily_limit: 2,
          remaining: 2
        }
      }

      return data as UsageStats
    } catch (error) {
      console.error('Error in checkDailyLimit:', error)
      return {
        can_create: true,
        projects_today: 0,
        daily_limit: 2,
        remaining: 2
      }
    }
  }

  /**
   * Increment project count for user
   */
  async incrementProjectCount(userId: string, generationMethod: 'system_key' | 'user_key' = 'system_key'): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('increment_project_count', { 
          p_user_id: userId,
          p_generation_method: generationMethod
        })

      if (error) {
        console.error('Error incrementing project count:', error)
        return false
      }

      return data as boolean
    } catch (error) {
      console.error('Error in incrementProjectCount:', error)
      return false
    }
  }

  /**
   * Record project generation
   */
  async recordProjectGeneration(generation: Omit<ProjectGeneration, 'id' | 'created_at'>): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('project_generations')
        .insert([generation])
        .select('id')
        .single()

      if (error) {
        console.error('Error recording project generation:', error)
        return null
      }

      return data?.id || null
    } catch (error) {
      console.error('Error in recordProjectGeneration:', error)
      return null
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_statistics', { p_user_id: userId })

      if (error) {
        console.error('Error getting user stats:', error)
        return null
      }

      return data as UserStats
    } catch (error) {
      console.error('Error in getUserStats:', error)
      return null
    }
  }

  /**
   * Create or update user profile
   */
  async upsertUserProfile(
    userId: string,
    email: string,
    fullName?: string,
    avatarUrl?: string,
    role: string = 'user'
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('upsert_user_profile', {
          p_user_id: userId,
          p_email: email,
          p_full_name: fullName,
          p_avatar_url: avatarUrl,
          p_role: role
        })

      if (error) {
        console.error('Error upserting user profile:', error)
        return null
      }

      return data as string
    } catch (error) {
      console.error('Error in upsertUserProfile:', error)
      return null
    }
  }

  /**
   * Get user role
   */
  async getUserRole(userId: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error getting user role:', error)
        return 'user'
      }

      return data?.role || 'user'
    } catch (error) {
      console.error('Error in getUserRole:', error)
      return 'user'
    }
  }

  /**
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId)
    return role === 'admin' || role === 'super_admin'
  }

  // =====================================================
  // ADMIN FUNCTIONS
  // =====================================================

  /**
   * Get all users with statistics (admin only)
   */
  async getAllUsersStats(): Promise<AdminUserStats[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          subscription_type,
          total_projects_created,
          last_login_at,
          created_at,
          daily_usage!inner(projects_created)
        `)
        .eq('daily_usage.usage_date', new Date().toISOString().split('T')[0])

      if (error) {
        console.error('Error getting all users stats:', error)
        return []
      }

      return data?.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        subscription_type: user.subscription_type,
        total_projects_created: user.total_projects_created,
        projects_today: user.daily_usage?.[0]?.projects_created || 0,
        last_login_at: user.last_login_at,
        created_at: user.created_at
      })) || []
    } catch (error) {
      console.error('Error in getAllUsersStats:', error)
      return []
    }
  }

  /**
   * Get system analytics
   */
  async getSystemAnalytics(days: number = 30): Promise<SystemAnalytics[]> {
    try {
      const { data, error } = await this.supabase
        .from('system_analytics')
        .select('*')
        .gte('analytics_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('analytics_date', { ascending: false })

      if (error) {
        console.error('Error getting system analytics:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getSystemAnalytics:', error)
      return []
    }
  }

  /**
   * Get project generations with filters
   */
  async getProjectGenerations(
    userId?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<ProjectGeneration[]> {
    try {
      let query = this.supabase
        .from('project_generations')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error getting project generations:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getProjectGenerations:', error)
      return []
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating user role:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateUserRole:', error)
      return false
    }
  }

  /**
   * Update user daily limit (admin only)
   */
  async updateUserDailyLimit(userId: string, dailyLimit: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .update({ daily_project_limit: dailyLimit, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating user daily limit:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateUserDailyLimit:', error)
      return false
    }
  }

  /**
   * Get usage trends
   */
  async getUsageTrends(days: number = 30): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('daily_usage')
        .select('usage_date, projects_created, ai_requests_made, tokens_used')
        .gte('usage_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('usage_date', { ascending: true })

      if (error) {
        console.error('Error getting usage trends:', error)
        return []
      }

      // Group by date and sum values
      const trends = data?.reduce((acc, curr) => {
        const date = curr.usage_date
        if (!acc[date]) {
          acc[date] = {
            date,
            projects_created: 0,
            ai_requests_made: 0,
            tokens_used: 0
          }
        }
        acc[date].projects_created += curr.projects_created || 0
        acc[date].ai_requests_made += curr.ai_requests_made || 0
        acc[date].tokens_used += curr.tokens_used || 0
        return acc
      }, {} as Record<string, any>)

      return Object.values(trends || {})
    } catch (error) {
      console.error('Error in getUsageTrends:', error)
      return []
    }
  }
} 