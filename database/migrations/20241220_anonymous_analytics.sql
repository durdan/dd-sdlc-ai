-- Migration: Add anonymous_analytics table for tracking non-logged-in user activities
-- Date: 2024-12-20

CREATE TABLE IF NOT EXISTS anonymous_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT, -- Optional: for tracking sessions
    action_type TEXT NOT NULL, -- 'diagram_generation', 'page_visit', etc.
    action_data JSONB, -- Flexible data storage
    user_agent TEXT,
    ip_address TEXT, -- Optional: for geo analytics
    referrer TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_anonymous_analytics_action_type ON anonymous_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_anonymous_analytics_timestamp ON anonymous_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_anonymous_analytics_session_id ON anonymous_analytics(session_id);

-- Add RLS (Row Level Security) if needed
ALTER TABLE anonymous_analytics ENABLE ROW LEVEL SECURITY;

-- Policy for admin access
CREATE POLICY "Admin can view anonymous analytics" ON anonymous_analytics
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Comments for documentation
COMMENT ON TABLE anonymous_analytics IS 'Tracks activities from anonymous (non-logged-in) users';
COMMENT ON COLUMN anonymous_analytics.action_type IS 'Type of action performed (diagram_generation, page_visit, etc.)';
COMMENT ON COLUMN anonymous_analytics.action_data IS 'JSON data specific to the action type';
COMMENT ON COLUMN anonymous_analytics.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN anonymous_analytics.session_id IS 'Optional session identifier for tracking user sessions'; 