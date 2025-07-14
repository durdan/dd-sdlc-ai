-- =====================================================
-- GITDIGEST SETTINGS TABLE MIGRATION
-- =====================================================
-- File: 20241218_gitdigest_settings_table.sql
-- Purpose: Add GitDigest user settings table for webhook automation
-- Dependencies: Existing auth.users table

-- =====================================================
-- GITDIGEST SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS gitdigest_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}', -- Store user preferences as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one settings record per user
    UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gitdigest_settings_user_id ON gitdigest_settings(user_id);

-- =====================================================
-- GITDIGEST QUEUE TABLE (for webhook processing)
-- =====================================================
CREATE TABLE IF NOT EXISTS gitdigest_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    repository_full_name TEXT NOT NULL,
    trigger_type TEXT NOT NULL, -- 'push', 'pull_request', 'issues', 'release'
    trigger_context JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gitdigest_queue_user_id ON gitdigest_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_gitdigest_queue_status ON gitdigest_queue(status);
CREATE INDEX IF NOT EXISTS idx_gitdigest_queue_repository ON gitdigest_queue(repository_full_name);
CREATE INDEX IF NOT EXISTS idx_gitdigest_queue_created_at ON gitdigest_queue(created_at);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on tables
ALTER TABLE gitdigest_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gitdigest_queue ENABLE ROW LEVEL SECURITY;

-- GitDigest Settings Policies
CREATE POLICY "Users can view their own GitDigest settings" ON gitdigest_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own GitDigest settings" ON gitdigest_settings
    FOR ALL USING (auth.uid() = user_id);

-- GitDigest Queue Policies
CREATE POLICY "Users can view their own GitDigest queue items" ON gitdigest_queue
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage GitDigest queue items" ON gitdigest_queue
    FOR ALL USING (true); -- Allow system operations

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's GitDigest settings with defaults
CREATE OR REPLACE FUNCTION get_user_gitdigest_settings(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    user_settings JSONB;
    default_settings JSONB := '{
        "enabled": false,
        "selectedRepos": [],
        "triggers": {
            "push": true,
            "pullRequest": true,
            "issues": false,
            "release": true
        },
        "schedule": {
            "enabled": false,
            "frequency": "daily",
            "time": "09:00"
        }
    }';
BEGIN
    SELECT settings INTO user_settings
    FROM gitdigest_settings
    WHERE user_id = user_uuid;
    
    -- Return user settings if they exist, otherwise return defaults
    RETURN COALESCE(user_settings, default_settings);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update GitDigest settings with automatic upsert
CREATE OR REPLACE FUNCTION upsert_gitdigest_settings(
    user_uuid UUID,
    new_settings JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO gitdigest_settings (user_id, settings, updated_at)
    VALUES (user_uuid, new_settings, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
        settings = new_settings,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert default settings for existing users (optional)
-- INSERT INTO gitdigest_settings (user_id, settings)
-- SELECT id, '{
--     "enabled": false,
--     "selectedRepos": [],
--     "triggers": {"push": true, "pullRequest": true, "issues": false, "release": true},
--     "schedule": {"enabled": false, "frequency": "daily", "time": "09:00"}
-- }'::jsonb
-- FROM auth.users
-- WHERE id NOT IN (SELECT user_id FROM gitdigest_settings);

-- =====================================================
-- MIGRATION COMPLETE
-- ===================================================== 