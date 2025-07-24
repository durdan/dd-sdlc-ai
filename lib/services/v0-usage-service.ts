import { createClient } from '@/lib/supabase/server';

interface V0UsageCheckResult {
  canUseSystemKey: boolean;
  remainingUsage: number;
  hasOwnKey: boolean;
  message?: string;
}

export class V0UsageService {
  private dailyLimit: number = 2;

  private async getSupabase() {
    return await createClient();
  }

  /**
   * Check if user can use v0.dev (either own key or system key within limits)
   */
  async checkV0Usage(userId: string): Promise<V0UsageCheckResult> {
    try {
      const supabase = await this.getSupabase();
      
      // Check if user is admin - following the same pattern as other admin checks
      let isAdmin = false;
      
      // First get the user's email
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      // Check if email matches admin email
      if (authUser?.email === 'durgeshdandotiya@gmail.com') {
        isAdmin = true;
        console.log('🔍 V0UsageService: User is admin by email match', { userId, email: authUser.email });
      } else {
        // Check user_profiles table for role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', userId)
          .single();
          
        if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
          isAdmin = true;
          console.log('🔍 V0UsageService: User is admin by role', { userId, role: profile.role });
        } else {
          console.log('🔍 V0UsageService: User is not admin', { userId, profile });
        }
      }
      
      // Admins get unlimited access with system key
      if (isAdmin) {
        console.log('✅ V0UsageService: User is admin, granting unlimited access');
        return {
          canUseSystemKey: true,
          remainingUsage: -1, // Unlimited for admins
          hasOwnKey: false,
        };
      }
      
      // First check if user has their own API key
      const { data: userConfig } = await supabase
        .from('user_configurations')
        .select('v0_api_key')
        .eq('user_id', userId)
        .single();

      if (userConfig?.v0_api_key) {
        return {
          canUseSystemKey: false,
          remainingUsage: -1, // Unlimited with own key
          hasOwnKey: true,
        };
      }

      // Check system key from environment
      const systemApiKey = process.env.V0_SYSTEM_API_KEY;
      const systemKeyEnabled = process.env.V0_SYSTEM_KEY_ENABLED !== 'false'; // Default to true
      this.dailyLimit = parseInt(process.env.V0_DAILY_LIMIT || '2', 10);

      if (!systemKeyEnabled || !systemApiKey) {
        return {
          canUseSystemKey: false,
          remainingUsage: 0,
          hasOwnKey: false,
          message: 'System v0.dev key is not available. Please add your own API key.',
        };
      }

      // Check today's usage
      const today = new Date().toISOString().split('T')[0];
      const { data: usageData } = await supabase
        .from('v0_usage_tracking')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('usage_date', today)
        .single();

      const currentUsage = usageData?.usage_count || 0;
      const remainingUsage = Math.max(0, this.dailyLimit - currentUsage);

      return {
        canUseSystemKey: remainingUsage > 0,
        remainingUsage,
        hasOwnKey: false,
        message: remainingUsage === 0 
          ? `Daily limit of ${this.dailyLimit} v0.dev generations reached. Add your own API key for unlimited access.`
          : undefined,
      };
    } catch (error) {
      console.error('Error checking v0 usage:', error);
      return {
        canUseSystemKey: false,
        remainingUsage: 0,
        hasOwnKey: false,
        message: 'Error checking v0.dev usage limits.',
      };
    }
  }

  /**
   * Track v0.dev usage for system key
   */
  async trackV0Usage(userId: string, projectId?: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase();
      
      // Check if user is admin - skip tracking for admins
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (userData?.role === 'admin') {
        return true; // Skip tracking for admins
      }
      
      const today = new Date().toISOString().split('T')[0];

      // Try to update existing record
      const { data: existing } = await supabase
        .from('v0_usage_tracking')
        .select('id, usage_count, project_ids')
        .eq('user_id', userId)
        .eq('usage_date', today)
        .single();

      if (existing) {
        // Update existing record
        const updatedProjectIds = projectId 
          ? [...(existing.project_ids || []), projectId]
          : existing.project_ids;

        const { error } = await supabase
          .from('v0_usage_tracking')
          .update({
            usage_count: existing.usage_count + 1,
            project_ids: updatedProjectIds,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('v0_usage_tracking')
          .insert({
            user_id: userId,
            usage_date: today,
            usage_count: 1,
            project_ids: projectId ? [projectId] : [],
          });

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error tracking v0 usage:', error);
      return false;
    }
  }

  /**
   * Get user's v0 usage statistics
   */
  async getUserV0Stats(userId: string, days: number = 30): Promise<{
    totalUsage: number;
    dailyAverage: number;
    recentUsage: Array<{ date: string; count: number }>;
  }> {
    try {
      const supabase = await this.getSupabase();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data } = await supabase
        .from('v0_usage_tracking')
        .select('usage_date, usage_count')
        .eq('user_id', userId)
        .gte('usage_date', startDate.toISOString().split('T')[0])
        .order('usage_date', { ascending: false });

      const totalUsage = data?.reduce((sum, record) => sum + record.usage_count, 0) || 0;
      const dailyAverage = data?.length ? totalUsage / data.length : 0;

      return {
        totalUsage,
        dailyAverage: Math.round(dailyAverage * 10) / 10,
        recentUsage: data?.map(record => ({
          date: record.usage_date,
          count: record.usage_count,
        })) || [],
      };
    } catch (error) {
      console.error('Error getting v0 usage stats:', error);
      return {
        totalUsage: 0,
        dailyAverage: 0,
        recentUsage: [],
      };
    }
  }

  /**
   * Get system v0 API key (for internal use)
   */
  async getSystemV0ApiKey(): Promise<string | null> {
    return process.env.V0_SYSTEM_API_KEY || null;
  }
}

// Export singleton instance
export const v0UsageService = new V0UsageService();