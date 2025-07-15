-- Migration: Add Credit Requests Table
-- Date: 2024-12-18
-- Description: Add credit requests table to work with existing early access system

-- Create credit requests table
CREATE TABLE IF NOT EXISTS credit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    current_usage JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'processed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id),
    admin_notes TEXT,
    credits_granted INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_requests_user_id ON credit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_requests_status ON credit_requests(status);
CREATE INDEX IF NOT EXISTS idx_credit_requests_created_at ON credit_requests(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_requests
CREATE POLICY "Users can view their own credit requests" ON credit_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create credit requests" ON credit_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies for credit requests
CREATE POLICY "Admins can view all credit requests" ON credit_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update credit requests" ON credit_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Function to get credit request stats
CREATE OR REPLACE FUNCTION get_credit_request_stats()
RETURNS TABLE (
    total_pending INTEGER,
    total_approved INTEGER,
    total_denied INTEGER,
    avg_processing_time_hours NUMERIC,
    recent_requests JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as total_pending,
        COUNT(*) FILTER (WHERE status = 'approved')::INTEGER as total_approved,
        COUNT(*) FILTER (WHERE status = 'denied')::INTEGER as total_denied,
        AVG(EXTRACT(EPOCH FROM (COALESCE(processed_at, NOW()) - created_at)) / 3600)::NUMERIC as avg_processing_time_hours,
        json_agg(
            json_build_object(
                'user_id', user_id,
                'message', LEFT(message, 100),
                'status', status,
                'created_at', created_at,
                'credits_granted', credits_granted
            ) ORDER BY created_at DESC
        ) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::JSONB as recent_requests
    FROM credit_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON credit_requests TO authenticated;

COMMENT ON TABLE credit_requests IS 'Stores user requests for additional credits';
COMMENT ON FUNCTION get_credit_request_stats() IS 'Returns statistics about credit requests'; 