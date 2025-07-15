-- =====================================================
-- EARLY ACCESS SYSTEM MIGRATION
-- =====================================================
-- File: 20241218_early_access_system.sql
-- Purpose: Add early access enrollment, beta features, and waitlist system
-- Dependencies: Existing user_profiles, daily_usage tables

-- =====================================================
-- 1. EARLY ACCESS ENROLLMENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS early_access_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    enrollment_status TEXT NOT NULL DEFAULT 'pending' CHECK (enrollment_status IN ('pending', 'approved', 'rejected', 'waitlisted')),
    access_level TEXT NOT NULL DEFAULT 'beta' CHECK (access_level IN ('alpha', 'beta', 'preview', 'enterprise')),
    requested_features JSONB DEFAULT '[]', -- Array of requested beta features
    use_case_description TEXT,
    company_name TEXT,
    company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),
    technical_background TEXT CHECK (technical_background IN ('beginner', 'intermediate', 'advanced', 'expert')),
    expected_usage TEXT CHECK (expected_usage IN ('light', 'moderate', 'heavy', 'enterprise')),
    referral_source TEXT,
    priority_score INTEGER DEFAULT 0, -- Admin scoring for prioritization
    admin_notes TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    enrolled_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, access_level)
);

-- Indexes for early access
CREATE INDEX IF NOT EXISTS idx_early_access_user_id ON early_access_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_early_access_status ON early_access_enrollments(enrollment_status);
CREATE INDEX IF NOT EXISTS idx_early_access_level ON early_access_enrollments(access_level);
CREATE INDEX IF NOT EXISTS idx_early_access_priority ON early_access_enrollments(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_early_access_created ON early_access_enrollments(created_at);

-- =====================================================
-- 2. BETA FEATURES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS beta_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_key TEXT NOT NULL UNIQUE, -- e.g., 'advanced_claude_integration', 'premium_templates'
    feature_name TEXT NOT NULL,
    feature_description TEXT,
    feature_category TEXT NOT NULL DEFAULT 'general', -- 'ai', 'integrations', 'templates', 'analytics'
    access_level TEXT NOT NULL DEFAULT 'beta' CHECK (access_level IN ('alpha', 'beta', 'preview', 'enterprise')),
    is_active BOOLEAN DEFAULT true,
    min_priority_score INTEGER DEFAULT 0,
    usage_limit INTEGER, -- NULL means unlimited
    usage_limit_period TEXT CHECK (usage_limit_period IN ('daily', 'weekly', 'monthly')),
    feature_config JSONB DEFAULT '{}', -- Feature-specific configuration
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for beta features
CREATE INDEX IF NOT EXISTS idx_beta_features_key ON beta_features(feature_key);
CREATE INDEX IF NOT EXISTS idx_beta_features_category ON beta_features(feature_category);
CREATE INDEX IF NOT EXISTS idx_beta_features_level ON beta_features(access_level);
CREATE INDEX IF NOT EXISTS idx_beta_features_active ON beta_features(is_active) WHERE is_active = true;

-- =====================================================
-- 3. USER FEATURE ACCESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_feature_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES beta_features(id) ON DELETE CASCADE,
    access_granted BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, feature_id)
);

-- Indexes for user feature access
CREATE INDEX IF NOT EXISTS idx_user_feature_access_user_id ON user_feature_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_access_feature_id ON user_feature_access(feature_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_access_granted ON user_feature_access(access_granted) WHERE access_granted = true;
CREATE INDEX IF NOT EXISTS idx_user_feature_access_expires ON user_feature_access(expires_at);

-- =====================================================
-- 4. WAITLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS early_access_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    requested_features JSONB DEFAULT '[]',
    position INTEGER,
    priority_score INTEGER DEFAULT 0,
    notification_sent BOOLEAN DEFAULT false,
    invited_at TIMESTAMPTZ,
    signed_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Indexes for waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON early_access_waitlist(position);
CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON early_access_waitlist(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_invited ON early_access_waitlist(invited_at);

-- =====================================================
-- 5. FUNCTIONS FOR EARLY ACCESS MANAGEMENT
-- =====================================================

-- Function to check if user has access to a beta feature
CREATE OR REPLACE FUNCTION has_beta_feature_access(
    p_user_id UUID,
    p_feature_key TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN := false;
    user_enrollment RECORD;
    feature_info RECORD;
BEGIN
    -- Get feature information
    SELECT * INTO feature_info
    FROM beta_features 
    WHERE feature_key = p_feature_key AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check if user has explicit access granted
    IF EXISTS (
        SELECT 1 FROM user_feature_access ufa
        WHERE ufa.user_id = p_user_id 
        AND ufa.feature_id = feature_info.id
        AND ufa.access_granted = true
        AND (ufa.expires_at IS NULL OR ufa.expires_at > NOW())
    ) THEN
        RETURN true;
    END IF;
    
    -- Check if user has early access enrollment that covers this feature
    SELECT * INTO user_enrollment
    FROM early_access_enrollments
    WHERE user_id = p_user_id 
    AND enrollment_status = 'approved'
    AND (expires_at IS NULL OR expires_at > NOW());
    
    IF FOUND THEN
        -- Check if user's access level and priority score meet feature requirements
        IF user_enrollment.access_level = feature_info.access_level 
        AND user_enrollment.priority_score >= feature_info.min_priority_score THEN
            RETURN true;
        END IF;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's beta features
CREATE OR REPLACE FUNCTION get_user_beta_features(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    features JSONB := '[]';
    feature_record RECORD;
BEGIN
    FOR feature_record IN
        SELECT bf.feature_key, bf.feature_name, bf.feature_description, bf.feature_category
        FROM beta_features bf
        WHERE bf.is_active = true
        AND has_beta_feature_access(p_user_id, bf.feature_key) = true
    LOOP
        features := features || jsonb_build_object(
            'key', feature_record.feature_key,
            'name', feature_record.feature_name,
            'description', feature_record.feature_description,
            'category', feature_record.feature_category
        );
    END LOOP;
    
    RETURN features;
END;
$$ LANGUAGE plpgsql;

-- Function to enroll user in early access
CREATE OR REPLACE FUNCTION enroll_user_early_access(
    p_user_id UUID,
    p_access_level TEXT,
    p_requested_features JSONB,
    p_use_case_description TEXT,
    p_company_name TEXT DEFAULT NULL,
    p_company_size TEXT DEFAULT NULL,
    p_technical_background TEXT DEFAULT NULL,
    p_expected_usage TEXT DEFAULT NULL,
    p_referral_source TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    enrollment_id UUID;
    priority_score INTEGER := 0;
BEGIN
    -- Calculate priority score based on various factors
    IF p_company_size IN ('201-1000', '1000+') THEN
        priority_score := priority_score + 20;
    ELSIF p_company_size IN ('51-200') THEN
        priority_score := priority_score + 10;
    END IF;
    
    IF p_technical_background IN ('advanced', 'expert') THEN
        priority_score := priority_score + 15;
    ELSIF p_technical_background = 'intermediate' THEN
        priority_score := priority_score + 10;
    END IF;
    
    IF p_expected_usage IN ('heavy', 'enterprise') THEN
        priority_score := priority_score + 25;
    ELSIF p_expected_usage = 'moderate' THEN
        priority_score := priority_score + 10;
    END IF;
    
    -- Add bonus for referrals
    IF p_referral_source IS NOT NULL THEN
        priority_score := priority_score + 5;
    END IF;
    
    -- Insert enrollment
    INSERT INTO early_access_enrollments (
        user_id, access_level, requested_features, use_case_description,
        company_name, company_size, technical_background, expected_usage,
        referral_source, priority_score
    ) VALUES (
        p_user_id, p_access_level, p_requested_features, p_use_case_description,
        p_company_name, p_company_size, p_technical_background, p_expected_usage,
        p_referral_source, priority_score
    ) ON CONFLICT (user_id, access_level) 
    DO UPDATE SET
        requested_features = EXCLUDED.requested_features,
        use_case_description = EXCLUDED.use_case_description,
        company_name = EXCLUDED.company_name,
        company_size = EXCLUDED.company_size,
        technical_background = EXCLUDED.technical_background,
        expected_usage = EXCLUDED.expected_usage,
        referral_source = EXCLUDED.referral_source,
        priority_score = EXCLUDED.priority_score,
        updated_at = NOW()
    RETURNING id INTO enrollment_id;
    
    RETURN enrollment_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE early_access_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_access_waitlist ENABLE ROW LEVEL SECURITY;

-- Early access enrollments policies
CREATE POLICY "Users can view own enrollment" ON early_access_enrollments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own enrollment" ON early_access_enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollment" ON early_access_enrollments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all enrollments" ON early_access_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Beta features policies (public read, admin manage)
CREATE POLICY "Anyone can view active features" ON beta_features
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage features" ON beta_features
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- User feature access policies
CREATE POLICY "Users can view own feature access" ON user_feature_access
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage feature access" ON user_feature_access
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Waitlist policies
CREATE POLICY "Users can view own waitlist entry" ON early_access_waitlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own waitlist entry" ON early_access_waitlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage waitlist" ON early_access_waitlist
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- 7. INITIAL DATA - BETA FEATURES
-- =====================================================

-- Insert initial beta features
INSERT INTO beta_features (feature_key, feature_name, feature_description, feature_category, access_level, min_priority_score)
VALUES 
    ('advanced_claude_integration', 'Advanced Claude Integration', 'Enhanced Claude AI features with custom prompts and fine-tuning', 'ai', 'beta', 10),
    ('premium_templates', 'Premium SDLC Templates', 'Access to enterprise-grade SDLC templates and frameworks', 'templates', 'beta', 5),
    ('advanced_analytics', 'Advanced Analytics Dashboard', 'Detailed project analytics and team collaboration insights', 'analytics', 'beta', 15),
    ('custom_integrations', 'Custom Integrations', 'Build custom integrations with third-party tools and APIs', 'integrations', 'beta', 20),
    ('bulk_processing', 'Bulk Project Processing', 'Process multiple projects simultaneously with batch operations', 'ai', 'beta', 25),
    ('enterprise_sso', 'Enterprise SSO', 'Single sign-on integration with enterprise identity providers', 'integrations', 'enterprise', 30),
    ('white_label', 'White Label Solution', 'Customize platform branding and deploy as your own solution', 'enterprise', 'enterprise', 50),
    ('priority_support', 'Priority Support', '24/7 priority support with dedicated account manager', 'support', 'beta', 10),
    ('advanced_exports', 'Advanced Export Options', 'Export to PDF, Word, PowerPoint, and custom formats', 'integrations', 'beta', 5),
    ('ai_code_review', 'AI Code Review', 'Automated code review and quality assessment using AI', 'ai', 'beta', 15)
ON CONFLICT (feature_key) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATIC OPERATIONS
-- =====================================================

-- Function to update waitlist positions
CREATE OR REPLACE FUNCTION update_waitlist_positions()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate positions based on priority score and creation date
    UPDATE early_access_waitlist
    SET position = subquery.row_number
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY priority_score DESC, created_at ASC) as row_number
        FROM early_access_waitlist
    ) AS subquery
    WHERE early_access_waitlist.id = subquery.id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update waitlist positions when new entries are added
CREATE TRIGGER update_waitlist_positions_trigger
    AFTER INSERT OR UPDATE ON early_access_waitlist
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_waitlist_positions();

COMMIT; 