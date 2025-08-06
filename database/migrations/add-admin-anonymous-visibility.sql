-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_live_admin_analytics();

-- Create or update function to include anonymous projects in admin analytics
CREATE OR REPLACE FUNCTION get_live_admin_analytics()
RETURNS TABLE (
    analytics_date DATE,
    total_users BIGINT,
    active_users BIGINT,
    new_users BIGINT,
    total_projects BIGINT,
    anonymous_projects BIGINT,
    authenticated_projects BIGINT,
    system_key_usage BIGINT,
    user_key_usage BIGINT,
    total_tokens_used BIGINT,
    total_cost_estimate NUMERIC,
    error_rate NUMERIC,
    avg_generation_time_ms NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CURRENT_DATE as analytics_date,
        (SELECT COUNT(DISTINCT id) FROM auth.users) as total_users,
        (SELECT COUNT(DISTINCT id) FROM auth.users WHERE last_sign_in_at > NOW() - INTERVAL '7 days') as active_users,
        (SELECT COUNT(DISTINCT id) FROM auth.users WHERE created_at > NOW() - INTERVAL '1 day') as new_users,
        (SELECT COUNT(*) FROM sdlc_projects) as total_projects,
        (SELECT COUNT(*) FROM sdlc_projects WHERE user_id IS NULL AND session_id IS NOT NULL) as anonymous_projects,
        (SELECT COUNT(*) FROM sdlc_projects WHERE user_id IS NOT NULL) as authenticated_projects,
        0::BIGINT as system_key_usage,
        0::BIGINT as user_key_usage,
        0::BIGINT as total_tokens_used,
        0::NUMERIC as total_cost_estimate,
        0::NUMERIC as error_rate,
        0::NUMERIC as avg_generation_time_ms;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for admins to see all projects including anonymous ones
CREATE OR REPLACE VIEW admin_all_projects AS
SELECT 
    p.id,
    p.user_id,
    p.session_id,
    p.title,
    p.description,
    p.input_text,
    p.status,
    p.template_used,
    p.created_at,
    p.updated_at,
    CASE 
        WHEN p.user_id IS NULL THEN 'Anonymous'
        ELSE COALESCE(u.email, 'Unknown User')
    END as created_by,
    CASE 
        WHEN p.user_id IS NULL THEN 'anonymous'
        ELSE 'authenticated'
    END as project_type,
    s.user_agent,
    s.ip_address,
    s.referrer,
    (SELECT COUNT(*) FROM documents d WHERE d.project_id = p.id) as document_count
FROM sdlc_projects p
LEFT JOIN auth.users u ON p.user_id = u.id
LEFT JOIN anonymous_project_sessions s ON p.session_id = s.session_id
ORDER BY p.created_at DESC;

-- Grant access to the view for authenticated users (admin check should be done in application)
GRANT SELECT ON admin_all_projects TO authenticated;

-- Create function to get anonymous project details for admin
CREATE OR REPLACE FUNCTION get_admin_anonymous_projects()
RETURNS TABLE (
    project_id UUID,
    session_id TEXT,
    title TEXT,
    input_text TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    user_agent TEXT,
    ip_address TEXT,
    referrer TEXT,
    document_count BIGINT,
    documents JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as project_id,
        p.session_id,
        p.title,
        p.input_text,
        p.status,
        p.created_at,
        s.user_agent,
        s.ip_address,
        s.referrer,
        (SELECT COUNT(*) FROM documents d WHERE d.project_id = p.id) as document_count,
        COALESCE(
            jsonb_object_agg(
                CASE d.document_type
                    WHEN 'business_analysis' THEN 'business'
                    WHEN 'functional_spec' THEN 'functional'
                    WHEN 'technical_spec' THEN 'technical'
                    WHEN 'ux_spec' THEN 'ux'
                    WHEN 'architecture' THEN 'mermaid'
                    ELSE d.document_type
                END,
                LEFT(d.content, 500) || '...' -- Truncate content for overview
            ) FILTER (WHERE d.content IS NOT NULL),
            '{}'::jsonb
        ) as documents
    FROM sdlc_projects p
    LEFT JOIN anonymous_project_sessions s ON p.session_id = s.session_id
    LEFT JOIN documents d ON d.project_id = p.id
    WHERE p.user_id IS NULL AND p.session_id IS NOT NULL
    GROUP BY p.id, p.session_id, p.title, p.input_text, p.status, p.created_at, 
             s.user_agent, s.ip_address, s.referrer
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;