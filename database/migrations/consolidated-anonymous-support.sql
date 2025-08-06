-- =====================================================
-- CONSOLIDATED ANONYMOUS USER SUPPORT MIGRATION
-- =====================================================
-- This migration consolidates all anonymous user support features
-- Run this after the initial-setup.sql
-- =====================================================

-- 1. Update anonymous_project_sessions table structure
-- Add missing columns if they don't exist
ALTER TABLE anonymous_project_sessions 
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS project_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Update the save_anonymous_sdlc_project function with proper implementation
CREATE OR REPLACE FUNCTION save_anonymous_sdlc_project(
    p_session_id TEXT,
    p_project_data JSONB
)
RETURNS UUID AS $$
DECLARE
    v_project_id UUID;
    v_title TEXT;
    v_input_text TEXT;
    v_documents JSONB;
BEGIN
    -- Generate a new UUID for the project
    v_project_id := gen_random_uuid();
    
    -- Extract data from the JSONB
    v_title := p_project_data->>'title';
    v_input_text := p_project_data->>'input_text';
    v_documents := p_project_data->'documents';
    
    -- First, ensure we have a session record
    INSERT INTO anonymous_project_sessions (
        session_id,
        user_agent,
        ip_address,
        referrer,
        project_count
    )
    VALUES (
        p_session_id,
        p_project_data->>'user_agent',
        p_project_data->>'ip_address',
        p_project_data->>'referrer',
        1
    )
    ON CONFLICT (session_id) 
    DO UPDATE SET 
        last_activity = NOW(),
        project_count = COALESCE(anonymous_project_sessions.project_count, 0) + 1;
    
    -- Insert the project into sdlc_projects table
    INSERT INTO sdlc_projects (
        id,
        user_id,
        session_id,
        title,
        description,
        input_text,
        status,
        document_metadata,
        created_at
    )
    VALUES (
        v_project_id,
        NULL, -- Anonymous users have no user_id
        p_session_id,
        v_title,
        p_project_data->>'description',
        v_input_text,
        'completed',
        v_documents,
        NOW()
    );
    
    -- Insert documents if provided
    IF v_documents IS NOT NULL THEN
        -- Insert architecture document if exists
        IF v_documents->>'architecture' IS NOT NULL THEN
            INSERT INTO documents (project_id, document_type, content, created_at)
            VALUES (v_project_id, 'architecture', v_documents->>'architecture', NOW());
        END IF;
        
        -- Insert business analysis if exists
        IF v_documents->>'businessAnalysis' IS NOT NULL THEN
            INSERT INTO documents (project_id, document_type, content, created_at)
            VALUES (v_project_id, 'business_analysis', v_documents->>'businessAnalysis', NOW());
        END IF;
        
        -- Insert functional spec if exists
        IF v_documents->>'functionalSpec' IS NOT NULL THEN
            INSERT INTO documents (project_id, document_type, content, created_at)
            VALUES (v_project_id, 'functional_spec', v_documents->>'functionalSpec', NOW());
        END IF;
        
        -- Insert technical spec if exists
        IF v_documents->>'technicalSpec' IS NOT NULL THEN
            INSERT INTO documents (project_id, document_type, content, created_at)
            VALUES (v_project_id, 'technical_spec', v_documents->>'technicalSpec', NOW());
        END IF;
        
        -- Insert UX spec if exists
        IF v_documents->>'uxSpec' IS NOT NULL THEN
            INSERT INTO documents (project_id, document_type, content, created_at)
            VALUES (v_project_id, 'ux_spec', v_documents->>'uxSpec', NOW());
        END IF;
    END IF;
    
    RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Create function to get anonymous projects
CREATE OR REPLACE FUNCTION get_anonymous_projects(p_session_id TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    created_at TIMESTAMP,
    status TEXT,
    documents JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.created_at,
        p.status,
        COALESCE(
            jsonb_object_agg(
                d.document_type, 
                d.content
            ) FILTER (WHERE d.document_type IS NOT NULL),
            '{}'::jsonb
        ) as documents
    FROM sdlc_projects p
    LEFT JOIN documents d ON d.project_id = p.id
    WHERE p.session_id = p_session_id
    GROUP BY p.id, p.title, p.description, p.created_at, p.status
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Update RLS policies for anonymous users
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anonymous users can view their own projects" ON sdlc_projects;
DROP POLICY IF EXISTS "Anonymous users can create projects" ON sdlc_projects;
DROP POLICY IF EXISTS "Anonymous users can view their own documents" ON documents;

-- Create new policies for anonymous users
CREATE POLICY "Anonymous users can view their own projects" ON sdlc_projects
    FOR SELECT USING (
        auth.uid() IS NULL AND 
        session_id IS NOT NULL AND 
        session_id = current_setting('request.headers', true)::json->>'x-session-id'
    );

CREATE POLICY "Anonymous users can create projects" ON sdlc_projects
    FOR INSERT WITH CHECK (
        auth.uid() IS NULL AND 
        session_id IS NOT NULL
    );

CREATE POLICY "Anonymous users can view their own documents" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sdlc_projects p 
            WHERE p.id = documents.project_id 
            AND p.session_id = current_setting('request.headers', true)::json->>'x-session-id'
        )
    );

-- 5. Create admin view for all projects including anonymous
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
    p.jira_project,
    p.confluence_space,
    p.created_at,
    p.updated_at,
    CASE 
        WHEN p.user_id IS NOT NULL THEN u.email
        WHEN p.session_id IS NOT NULL THEN 'Anonymous: ' || LEFT(p.session_id, 8)
        ELSE 'Unknown'
    END as user_identifier,
    CASE 
        WHEN p.user_id IS NOT NULL THEN 'authenticated'
        ELSE 'anonymous'
    END as user_type,
    aps.user_agent,
    aps.ip_address,
    aps.referrer,
    COUNT(DISTINCT d.id) as document_count
FROM sdlc_projects p
LEFT JOIN auth.users u ON p.user_id = u.id
LEFT JOIN anonymous_project_sessions aps ON p.session_id = aps.session_id
LEFT JOIN documents d ON d.project_id = p.id
GROUP BY 
    p.id, p.user_id, p.session_id, p.title, p.description, 
    p.input_text, p.status, p.template_used, p.jira_project, 
    p.confluence_space, p.created_at, p.updated_at, u.email,
    aps.user_agent, aps.ip_address, aps.referrer;

-- 6. Create admin view for anonymous documents
CREATE OR REPLACE VIEW admin_anonymous_documents AS
SELECT 
    d.id,
    d.project_id,
    d.document_type,
    d.content,
    d.created_at,
    d.updated_at,
    p.title as project_title,
    p.session_id,
    aps.user_agent,
    aps.ip_address,
    aps.referrer,
    aps.last_activity
FROM documents d
JOIN sdlc_projects p ON d.project_id = p.id
LEFT JOIN anonymous_project_sessions aps ON p.session_id = aps.session_id
WHERE p.user_id IS NULL AND p.session_id IS NOT NULL;

-- 7. Update admin analytics function to include anonymous metrics
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
        (SELECT COUNT(*) FROM v0_usage_tracking WHERE is_system_key = true) as system_key_usage,
        (SELECT COUNT(*) FROM v0_usage_tracking WHERE is_system_key = false) as user_key_usage,
        COALESCE((SELECT SUM(tokens_used) FROM project_generations), 0)::BIGINT as total_tokens_used,
        COALESCE((SELECT SUM(cost) FROM project_generations), 0)::NUMERIC as total_cost_estimate,
        COALESCE((SELECT AVG(CASE WHEN error_message IS NOT NULL THEN 1 ELSE 0 END) * 100 FROM project_generations), 0)::NUMERIC as error_rate,
        COALESCE((SELECT AVG(generation_time_ms) FROM project_generations WHERE generation_time_ms IS NOT NULL), 0)::NUMERIC as avg_generation_time_ms;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant appropriate permissions
GRANT SELECT ON admin_all_projects TO authenticated;
GRANT SELECT ON admin_anonymous_documents TO authenticated;
GRANT EXECUTE ON FUNCTION get_anonymous_projects(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION save_anonymous_sdlc_project(TEXT, JSONB) TO anon, authenticated;

-- 9. Create cleanup job for expired anonymous sessions
CREATE OR REPLACE FUNCTION cleanup_expired_anonymous_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM anonymous_project_sessions 
    WHERE expires_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- END OF ANONYMOUS USER SUPPORT MIGRATION
-- =====================================================