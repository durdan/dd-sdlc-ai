-- Freemium Model and Admin Dashboard Migration
-- This migration adds usage tracking, daily limits, and admin features

-- =====================================================
-- 1. USER ROLES AND PERMISSIONS
-- =====================================================

-- Add role column to users (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE auth.users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));
    END IF;
END $$;

-- Create user profiles table for extended user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'pro', 'enterprise')),
    daily_project_limit INTEGER DEFAULT 2,
    total_projects_created INTEGER DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id),
    UNIQUE(email)
);

-- Create indexes for user profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON public.user_profiles(subscription_type);

-- =====================================================
-- 2. USAGE TRACKING SYSTEM
-- =====================================================

-- Daily usage tracking table
CREATE TABLE IF NOT EXISTS public.daily_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    projects_created INTEGER DEFAULT 0,
    ai_requests_made INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    system_key_used BOOLEAN DEFAULT false,
    user_key_used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, usage_date)
);

-- Create indexes for daily usage
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON public.daily_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON public.daily_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_daily_usage_system_key ON public.daily_usage(system_key_used);

-- Project generation tracking
CREATE TABLE IF NOT EXISTS public.project_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_type TEXT NOT NULL, -- 'sdlc', 'comprehensive', 'enhanced', 'business_analysis', etc.
    generation_method TEXT NOT NULL CHECK (generation_method IN ('system_key', 'user_key')),
    ai_provider TEXT NOT NULL, -- 'openai', 'claude', 'custom'
    tokens_used INTEGER DEFAULT 0,
    cost_estimate DECIMAL(10,4) DEFAULT 0,
    generation_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_project_generations_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create indexes for project generations
CREATE INDEX IF NOT EXISTS idx_project_generations_user_id ON public.project_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_project_generations_date ON public.project_generations(created_at);
CREATE INDEX IF NOT EXISTS idx_project_generations_method ON public.project_generations(generation_method);
CREATE INDEX IF NOT EXISTS idx_project_generations_type ON public.project_generations(project_type);
CREATE INDEX IF NOT EXISTS idx_project_generations_success ON public.project_generations(success);

-- =====================================================
-- 3. ADMIN ANALYTICS TABLES
-- =====================================================

-- System-wide analytics
CREATE TABLE IF NOT EXISTS public.system_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analytics_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    system_key_usage INTEGER DEFAULT 0,
    user_key_usage INTEGER DEFAULT 0,
    total_tokens_used BIGINT DEFAULT 0,
    total_cost_estimate DECIMAL(10,2) DEFAULT 0,
    error_rate DECIMAL(5,2) DEFAULT 0,
    avg_generation_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(analytics_date)
);

-- Create indexes for system analytics
CREATE INDEX IF NOT EXISTS idx_system_analytics_date ON public.system_analytics(analytics_date);

-- =====================================================
-- 4. FUNCTIONS FOR USAGE TRACKING
-- =====================================================

-- Function to get or create daily usage record
CREATE OR REPLACE FUNCTION get_or_create_daily_usage(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS UUID AS $$
DECLARE
    usage_id UUID;
BEGIN
    -- Try to get existing record
    SELECT id INTO usage_id 
    FROM public.daily_usage 
    WHERE user_id = p_user_id AND usage_date = p_date;
    
    -- If not found, create new record
    IF usage_id IS NULL THEN
        INSERT INTO public.daily_usage (user_id, usage_date)
        VALUES (p_user_id, p_date)
        RETURNING id INTO usage_id;
    END IF;
    
    RETURN usage_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check daily project limit
CREATE OR REPLACE FUNCTION check_daily_project_limit(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    user_limit INTEGER;
    projects_today INTEGER;
    can_create BOOLEAN;
    result JSONB;
BEGIN
    -- Get user's daily limit
    SELECT daily_project_limit INTO user_limit
    FROM public.user_profiles
    WHERE user_id = p_user_id;
    
    -- Default to 2 if no profile found
    IF user_limit IS NULL THEN
        user_limit := 2;
    END IF;
    
    -- Get projects created today
    SELECT COALESCE(projects_created, 0) INTO projects_today
    FROM public.daily_usage
    WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
    
    -- Default to 0 if no usage record
    IF projects_today IS NULL THEN
        projects_today := 0;
    END IF;
    
    -- Check if can create
    can_create := projects_today < user_limit;
    
    -- Build result
    result := jsonb_build_object(
        'can_create', can_create,
        'projects_today', projects_today,
        'daily_limit', user_limit,
        'remaining', user_limit - projects_today
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to increment project count
CREATE OR REPLACE FUNCTION increment_project_count(p_user_id UUID, p_generation_method TEXT DEFAULT 'system_key')
RETURNS BOOLEAN AS $$
DECLARE
    usage_id UUID;
    current_count INTEGER;
    user_limit INTEGER;
BEGIN
    -- Get daily usage record
    usage_id := get_or_create_daily_usage(p_user_id);
    
    -- Get current count and user limit
    SELECT du.projects_created, up.daily_project_limit
    INTO current_count, user_limit
    FROM public.daily_usage du
    LEFT JOIN public.user_profiles up ON du.user_id = up.user_id
    WHERE du.id = usage_id;
    
    -- Default values
    IF current_count IS NULL THEN current_count := 0; END IF;
    IF user_limit IS NULL THEN user_limit := 2; END IF;
    
    -- Check if within limit
    IF current_count >= user_limit THEN
        RETURN FALSE;
    END IF;
    
    -- Increment count
    UPDATE public.daily_usage
    SET projects_created = projects_created + 1,
        system_key_used = CASE WHEN p_generation_method = 'system_key' THEN TRUE ELSE system_key_used END,
        user_key_used = CASE WHEN p_generation_method = 'user_key' THEN TRUE ELSE user_key_used END,
        updated_at = NOW()
    WHERE id = usage_id;
    
    -- Update user profile total
    UPDATE public.user_profiles
    SET total_projects_created = total_projects_created + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_statistics(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    today_usage JSONB;
    total_projects INTEGER;
    last_30_days INTEGER;
BEGIN
    -- Get today's usage
    today_usage := check_daily_project_limit(p_user_id);
    
    -- Get total projects
    SELECT COALESCE(total_projects_created, 0) INTO total_projects
    FROM public.user_profiles
    WHERE user_id = p_user_id;
    
    -- Get last 30 days projects
    SELECT COALESCE(SUM(projects_created), 0) INTO last_30_days
    FROM public.daily_usage
    WHERE user_id = p_user_id 
    AND usage_date >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Build result
    result := jsonb_build_object(
        'today', today_usage,
        'total_projects', total_projects,
        'last_30_days', last_30_days
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_analytics ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Daily usage policies
CREATE POLICY "Users can view own usage" ON public.daily_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage" ON public.daily_usage
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update usage" ON public.daily_usage
    FOR UPDATE USING (true);

CREATE POLICY "Admins can view all usage" ON public.daily_usage
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Project generations policies
CREATE POLICY "Users can view own generations" ON public.project_generations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert generations" ON public.project_generations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all generations" ON public.project_generations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- System analytics policies (admin only)
CREATE POLICY "Admins can view analytics" ON public.system_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- 6. INITIAL DATA AND ADMIN USER
-- =====================================================

-- Function to create or update user profile
CREATE OR REPLACE FUNCTION upsert_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_full_name TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_role TEXT DEFAULT 'user'
)
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
BEGIN
    INSERT INTO public.user_profiles (user_id, email, full_name, avatar_url, role)
    VALUES (p_user_id, p_email, p_full_name, p_avatar_url, p_role)
    ON CONFLICT (user_id) 
    DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
        role = COALESCE(EXCLUDED.role, user_profiles.role),
        last_login_at = NOW(),
        updated_at = NOW()
    RETURNING id INTO profile_id;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql;

-- Create initial system analytics record
INSERT INTO public.system_analytics (analytics_date)
VALUES (CURRENT_DATE)
ON CONFLICT (analytics_date) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated; 