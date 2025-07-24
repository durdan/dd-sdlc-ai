-- Create v0_usage_tracking table to track daily usage of system v0.dev API key
CREATE TABLE IF NOT EXISTS v0_usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    usage_count INTEGER NOT NULL DEFAULT 1,
    project_ids TEXT[], -- Array of project IDs generated on this date
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, usage_date)
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_v0_usage_user_date ON v0_usage_tracking(user_id, usage_date);

-- Enable RLS
ALTER TABLE v0_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own v0 usage"
    ON v0_usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own v0 usage"
    ON v0_usage_tracking FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own v0 usage"
    ON v0_usage_tracking FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON v0_usage_tracking TO postgres;
GRANT ALL ON v0_usage_tracking TO authenticated;

-- Note: System v0.dev API key should be configured via environment variable: V0_SYSTEM_API_KEY
-- Daily limit is hardcoded to 2 generations per day per user