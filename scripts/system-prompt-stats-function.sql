-- System Prompt Statistics Function
-- This function provides system-wide analytics for admin interface

CREATE OR REPLACE FUNCTION get_system_prompt_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_users INTEGER;
    total_user_prompts INTEGER;
    total_system_prompts INTEGER;
    active_user_prompts INTEGER;
    total_usage_last_30_days INTEGER;
    avg_success_rate NUMERIC;
    top_document_types JSON;
BEGIN
    -- Get total users count
    SELECT COUNT(DISTINCT user_id) INTO total_users
    FROM user_roles;
    
    -- Get user prompts count
    SELECT COUNT(*) INTO total_user_prompts
    FROM prompt_templates
    WHERE prompt_scope = 'user';
    
    -- Get system prompts count
    SELECT COUNT(*) INTO total_system_prompts
    FROM prompt_templates
    WHERE prompt_scope = 'system';
    
    -- Get active user prompts count
    SELECT COUNT(*) INTO active_user_prompts
    FROM prompt_templates
    WHERE prompt_scope = 'user' AND is_active = true;
    
    -- Get total usage in last 30 days
    SELECT COALESCE(COUNT(*), 0) INTO total_usage_last_30_days
    FROM prompt_usage_logs
    WHERE created_at >= NOW() - INTERVAL '30 days';
    
    -- Get average success rate
    SELECT COALESCE(AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) * 100, 0) INTO avg_success_rate
    FROM prompt_usage_logs
    WHERE created_at >= NOW() - INTERVAL '30 days';
    
    -- Get top document types with usage stats
    SELECT JSON_AGG(
        JSON_BUILD_OBJECT(
            'document_type', document_type,
            'count', prompt_count,
            'usage_count', usage_count
        )
        ORDER BY usage_count DESC
    ) INTO top_document_types
    FROM (
        SELECT 
            pt.document_type,
            COUNT(pt.id) as prompt_count,
            COALESCE(SUM(usage_stats.usage_count), 0) as usage_count
        FROM prompt_templates pt
        LEFT JOIN (
            SELECT 
                prompt_template_id,
                COUNT(*) as usage_count
            FROM prompt_usage_logs
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY prompt_template_id
        ) usage_stats ON pt.id = usage_stats.prompt_template_id
        GROUP BY pt.document_type
    ) doc_stats;
    
    -- Build final result
    result := JSON_BUILD_OBJECT(
        'total_users', total_users,
        'total_user_prompts', total_user_prompts,
        'total_system_prompts', total_system_prompts,
        'active_user_prompts', active_user_prompts,
        'total_usage_last_30_days', total_usage_last_30_days,
        'avg_success_rate', avg_success_rate,
        'top_document_types', COALESCE(top_document_types, '[]'::JSON)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION get_system_prompt_stats() TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_system_prompt_stats() IS 'Returns system-wide prompt statistics for admin analytics dashboard'; 