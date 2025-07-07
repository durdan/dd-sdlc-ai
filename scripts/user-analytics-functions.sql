-- User Prompt Analytics Functions
-- These functions provide detailed analytics for admin dashboard

-- Function to get user prompt statistics
CREATE OR REPLACE FUNCTION get_user_prompt_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    total_prompts BIGINT,
    active_prompts BIGINT,
    total_usage BIGINT,
    avg_success_rate NUMERIC,
    last_activity TIMESTAMP WITH TIME ZONE,
    favorite_document_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        COALESCE(p.email, 'Unknown') as user_email,
        COALESCE(p.full_name, 'Unknown User') as user_name,
        COUNT(pt.id) as total_prompts,
        COUNT(CASE WHEN pt.is_active THEN 1 END) as active_prompts,
        COALESCE(usage_stats.total_usage, 0) as total_usage,
        COALESCE(usage_stats.avg_success_rate, 0) as avg_success_rate,
        COALESCE(usage_stats.last_activity, pt.created_at) as last_activity,
        COALESCE(usage_stats.favorite_document_type, pt.document_type) as favorite_document_type
    FROM user_roles u
    LEFT JOIN profiles p ON u.user_id = p.id
    LEFT JOIN prompt_templates pt ON u.user_id = pt.user_id AND pt.prompt_scope = 'user'
    LEFT JOIN (
        SELECT 
            pt_inner.user_id,
            COUNT(pul.id) as total_usage,
            AVG(CASE WHEN pul.success THEN 1.0 ELSE 0.0 END) * 100 as avg_success_rate,
            MAX(pul.created_at) as last_activity,
            MODE() WITHIN GROUP (ORDER BY pt_inner.document_type) as favorite_document_type
        FROM prompt_templates pt_inner
        LEFT JOIN prompt_usage_logs pul ON pt_inner.id = pul.prompt_template_id
        WHERE pt_inner.prompt_scope = 'user'
        AND (pul.created_at IS NULL OR pul.created_at >= NOW() - INTERVAL '1 day' * days_back)
        GROUP BY pt_inner.user_id
    ) usage_stats ON u.user_id = usage_stats.user_id
    WHERE pt.id IS NOT NULL
    GROUP BY u.user_id, p.email, p.full_name, usage_stats.total_usage, 
             usage_stats.avg_success_rate, usage_stats.last_activity, 
             usage_stats.favorite_document_type, pt.created_at, pt.document_type
    ORDER BY usage_stats.total_usage DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get document type statistics
CREATE OR REPLACE FUNCTION get_document_type_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    document_type TEXT,
    total_prompts BIGINT,
    total_users BIGINT,
    total_usage BIGINT,
    avg_success_rate NUMERIC,
    avg_response_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.document_type,
        COUNT(pt.id) as total_prompts,
        COUNT(DISTINCT pt.user_id) as total_users,
        COALESCE(SUM(usage_stats.usage_count), 0) as total_usage,
        COALESCE(AVG(usage_stats.success_rate), 0) as avg_success_rate,
        COALESCE(AVG(usage_stats.avg_response_time), 0) as avg_response_time
    FROM prompt_templates pt
    LEFT JOIN (
        SELECT 
            prompt_template_id,
            COUNT(*) as usage_count,
            AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) * 100 as success_rate,
            AVG(response_time_ms) as avg_response_time
        FROM prompt_usage_logs
        WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
        GROUP BY prompt_template_id
    ) usage_stats ON pt.id = usage_stats.prompt_template_id
    WHERE pt.prompt_scope = 'user'
    GROUP BY pt.document_type
    ORDER BY total_usage DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get time series data for prompt usage
CREATE OR REPLACE FUNCTION get_prompt_usage_timeseries(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    user_prompts_created BIGINT,
    total_usage BIGINT,
    unique_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            CURRENT_DATE - INTERVAL '1 day' * days_back,
            CURRENT_DATE,
            INTERVAL '1 day'
        )::DATE as date
    ),
    prompt_creation_stats AS (
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as user_prompts_created
        FROM prompt_templates
        WHERE prompt_scope = 'user'
        AND created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY DATE(created_at)
    ),
    usage_stats AS (
        SELECT 
            DATE(pul.created_at) as date,
            COUNT(pul.id) as total_usage,
            COUNT(DISTINCT pt.user_id) as unique_users
        FROM prompt_usage_logs pul
        JOIN prompt_templates pt ON pul.prompt_template_id = pt.id
        WHERE pt.prompt_scope = 'user'
        AND pul.created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY DATE(pul.created_at)
    )
    SELECT 
        ds.date,
        COALESCE(pcs.user_prompts_created, 0) as user_prompts_created,
        COALESCE(us.total_usage, 0) as total_usage,
        COALESCE(us.unique_users, 0) as unique_users
    FROM date_series ds
    LEFT JOIN prompt_creation_stats pcs ON ds.date = pcs.date
    LEFT JOIN usage_stats us ON ds.date = us.date
    ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_prompt_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_document_type_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_prompt_usage_timeseries(INTEGER) TO authenticated;

-- Add comments
COMMENT ON FUNCTION get_user_prompt_stats(INTEGER) IS 'Returns detailed user prompt statistics for admin analytics';
COMMENT ON FUNCTION get_document_type_stats(INTEGER) IS 'Returns document type performance statistics';
COMMENT ON FUNCTION get_prompt_usage_timeseries(INTEGER) IS 'Returns time series data for prompt usage trends'; 