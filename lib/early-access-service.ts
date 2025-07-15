import { createClient } from '@/lib/supabase/client';

export interface EarlyAccessEnrollment {
  id: string;
  user_id: string;
  enrollment_status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  access_level: 'alpha' | 'beta' | 'preview' | 'enterprise';
  requested_features: string[];
  use_case_description: string;
  company_name?: string;
  company_size?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  technical_background?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  expected_usage?: 'light' | 'moderate' | 'heavy' | 'enterprise';
  referral_source?: string;
  priority_score: number;
  admin_notes?: string;
  approved_by?: string;
  approved_at?: string;
  enrolled_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BetaFeature {
  id: string;
  feature_key: string;
  feature_name: string;
  feature_description: string;
  feature_category: 'ai' | 'integrations' | 'templates' | 'analytics' | 'support' | 'enterprise';
  access_level: 'alpha' | 'beta' | 'preview' | 'enterprise';
  is_active: boolean;
  min_priority_score: number;
  usage_limit?: number;
  usage_limit_period?: 'daily' | 'weekly' | 'monthly';
  feature_config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserFeatureAccess {
  id: string;
  user_id: string;
  feature_id: string;
  access_granted: boolean;
  usage_count: number;
  last_used_at?: string;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EarlyAccessWaitlist {
  id: string;
  user_id: string;
  email: string;
  requested_features: string[];
  position: number;
  priority_score: number;
  notification_sent: boolean;
  invited_at?: string;
  signed_up_at?: string;
  created_at: string;
}

export interface EnrollmentFormData {
  access_level: 'alpha' | 'beta' | 'preview' | 'enterprise';
  requested_features: string[];
  use_case_description: string;
  company_name?: string;
  company_size?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  technical_background?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  expected_usage?: 'light' | 'moderate' | 'heavy' | 'enterprise';
  referral_source?: string;
}

class EarlyAccessService {
  private supabase = createClient();

  // =====================================================
  // EARLY ACCESS ENROLLMENT METHODS
  // =====================================================

  async enrollUser(userId: string, formData: EnrollmentFormData): Promise<{ success: boolean; data?: EarlyAccessEnrollment; error?: string }> {
    try {
      const { data, error } = await this.supabase.rpc('enroll_user_early_access', {
        p_user_id: userId,
        p_access_level: formData.access_level,
        p_requested_features: JSON.stringify(formData.requested_features),
        p_use_case_description: formData.use_case_description,
        p_company_name: formData.company_name,
        p_company_size: formData.company_size,
        p_technical_background: formData.technical_background,
        p_expected_usage: formData.expected_usage,
        p_referral_source: formData.referral_source
      });

      if (error) {
        console.error('Error enrolling user in early access:', error);
        return { success: false, error: error.message };
      }

      // Fetch the created enrollment
      const { data: enrollment, error: fetchError } = await this.supabase
        .from('early_access_enrollments')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) {
        console.error('Error fetching enrollment:', fetchError);
        return { success: false, error: fetchError.message };
      }

      return { success: true, data: enrollment };
    } catch (error) {
      console.error('Error in enrollUser:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUserEnrollment(userId: string): Promise<{ success: boolean; data?: EarlyAccessEnrollment; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('early_access_enrollments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('Error fetching user enrollment:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || undefined };
    } catch (error) {
      console.error('Error in getUserEnrollment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateEnrollmentStatus(enrollmentId: string, status: 'pending' | 'approved' | 'rejected' | 'waitlisted', adminNotes?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('early_access_enrollments')
        .update({
          enrollment_status: status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId);

      if (error) {
        console.error('Error updating enrollment status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateEnrollmentStatus:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // =====================================================
  // BETA FEATURES METHODS
  // =====================================================

  async getBetaFeatures(): Promise<{ success: boolean; data?: BetaFeature[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('beta_features')
        .select('*')
        .eq('is_active', true)
        .order('feature_category', { ascending: true });

      if (error) {
        console.error('Error fetching beta features:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getBetaFeatures:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUserBetaFeatures(userId: string): Promise<{ success: boolean; data?: BetaFeature[]; error?: string }> {
    try {
      const { data, error } = await this.supabase.rpc('get_user_beta_features', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching user beta features:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getUserBetaFeatures:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async hasBetaFeatureAccess(userId: string, featureKey: string): Promise<{ success: boolean; hasAccess?: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.rpc('has_beta_feature_access', {
        p_user_id: userId,
        p_feature_key: featureKey
      });

      if (error) {
        console.error('Error checking beta feature access:', error);
        return { success: false, error: error.message };
      }

      return { success: true, hasAccess: data };
    } catch (error) {
      console.error('Error in hasBetaFeatureAccess:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async grantFeatureAccess(userId: string, featureKey: string, grantedBy: string, expiresAt?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First get the feature ID
      const { data: feature, error: featureError } = await this.supabase
        .from('beta_features')
        .select('id')
        .eq('feature_key', featureKey)
        .single();

      if (featureError) {
        console.error('Error finding feature:', featureError);
        return { success: false, error: featureError.message };
      }

      // Grant access
      const { error } = await this.supabase
        .from('user_feature_access')
        .upsert({
          user_id: userId,
          feature_id: feature.id,
          access_granted: true,
          granted_by: grantedBy,
          expires_at: expiresAt,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error granting feature access:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in grantFeatureAccess:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // =====================================================
  // WAITLIST METHODS
  // =====================================================

  async addToWaitlist(userId: string, email: string, requestedFeatures: string[]): Promise<{ success: boolean; data?: EarlyAccessWaitlist; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('early_access_waitlist')
        .upsert({
          user_id: userId,
          email: email,
          requested_features: JSON.stringify(requestedFeatures),
          priority_score: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding to waitlist:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data };
    } catch (error) {
      console.error('Error in addToWaitlist:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getWaitlistPosition(userId: string): Promise<{ success: boolean; position?: number; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('early_access_waitlist')
        .select('position')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('Error fetching waitlist position:', error);
        return { success: false, error: error.message };
      }

      return { success: true, position: data?.position };
    } catch (error) {
      console.error('Error in getWaitlistPosition:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // =====================================================
  // ADMIN METHODS
  // =====================================================

  async getAllEnrollments(): Promise<{ success: boolean; data?: EarlyAccessEnrollment[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('early_access_enrollments')
        .select('*')
        .order('priority_score', { ascending: false });

      if (error) {
        console.error('Error fetching all enrollments:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getAllEnrollments:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getWaitlist(): Promise<{ success: boolean; data?: EarlyAccessWaitlist[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('early_access_waitlist')
        .select('*')
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching waitlist:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getWaitlist:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createBetaFeature(featureData: Omit<BetaFeature, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: BetaFeature; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('beta_features')
        .insert(featureData)
        .select()
        .single();

      if (error) {
        console.error('Error creating beta feature:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data };
    } catch (error) {
      console.error('Error in createBetaFeature:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateBetaFeature(featureId: string, updates: Partial<BetaFeature>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('beta_features')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', featureId);

      if (error) {
        console.error('Error updating beta feature:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateBetaFeature:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  async getEnrollmentStats(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('early_access_enrollments')
        .select('enrollment_status, access_level, company_size, technical_background, expected_usage')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching enrollment stats:', error);
        return { success: false, error: error.message };
      }

      // Calculate stats
      const stats = {
        total: data.length,
        pending: data.filter(e => e.enrollment_status === 'pending').length,
        approved: data.filter(e => e.enrollment_status === 'approved').length,
        rejected: data.filter(e => e.enrollment_status === 'rejected').length,
        waitlisted: data.filter(e => e.enrollment_status === 'waitlisted').length,
        byAccessLevel: {
          alpha: data.filter(e => e.access_level === 'alpha').length,
          beta: data.filter(e => e.access_level === 'beta').length,
          preview: data.filter(e => e.access_level === 'preview').length,
          enterprise: data.filter(e => e.access_level === 'enterprise').length,
        },
        byCompanySize: {
          '1-10': data.filter(e => e.company_size === '1-10').length,
          '11-50': data.filter(e => e.company_size === '11-50').length,
          '51-200': data.filter(e => e.company_size === '51-200').length,
          '201-1000': data.filter(e => e.company_size === '201-1000').length,
          '1000+': data.filter(e => e.company_size === '1000+').length,
        },
        byTechnicalBackground: {
          beginner: data.filter(e => e.technical_background === 'beginner').length,
          intermediate: data.filter(e => e.technical_background === 'intermediate').length,
          advanced: data.filter(e => e.technical_background === 'advanced').length,
          expert: data.filter(e => e.technical_background === 'expert').length,
        },
        byExpectedUsage: {
          light: data.filter(e => e.expected_usage === 'light').length,
          moderate: data.filter(e => e.expected_usage === 'moderate').length,
          heavy: data.filter(e => e.expected_usage === 'heavy').length,
          enterprise: data.filter(e => e.expected_usage === 'enterprise').length,
        }
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error in getEnrollmentStats:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const earlyAccessService = new EarlyAccessService(); 