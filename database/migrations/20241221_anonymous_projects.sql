-- Migration: Add support for anonymous user projects
-- Date: 2024-12-21

-- Add session_id column to sdlc_projects table for anonymous users
ALTER TABLE sdlc_projects 
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Create index for session_id lookups
CREATE INDEX IF NOT EXISTS idx_sdlc_projects_session_id ON sdlc_projects(session_id);

-- Create anonymous project sessions table
CREATE TABLE IF NOT EXISTS anonymous_project_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    project_count INTEGER DEFAULT 0
);

-- Create indexes for anonymous sessions
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_session_id ON anonymous_project_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_last_activity ON anonymous_project_sessions(last_activity);

-- Update RLS policies to allow anonymous access
DROP POLICY IF EXISTS "Users can view own projects" ON sdlc_projects;
CREATE POLICY "Users can view own projects" ON sdlc_projects
    FOR SELECT USING (
        (auth.uid() = user_id) OR 
        (session_id IS NOT NULL AND session_id = current_setting('app.session_id', true))
    );

DROP POLICY IF EXISTS "Users can insert own projects" ON sdlc_projects;
CREATE POLICY "Users can insert own projects" ON sdlc_projects
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id) OR 
        (session_id IS NOT NULL AND session_id = current_setting('app.session_id', true))
    );

DROP POLICY IF EXISTS "Users can update own projects" ON sdlc_projects;
CREATE POLICY "Users can update own projects" ON sdlc_projects
    FOR UPDATE USING (
        (auth.uid() = user_id) OR 
        (session_id IS NOT NULL AND session_id = current_setting('app.session_id', true))
    );

-- Create function to get or create anonymous session
CREATE OR REPLACE FUNCTION get_or_create_anonymous_session(
    p_session_id TEXT,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL
)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    existing_session_id TEXT;
BEGIN
    -- Try to find existing session
    SELECT session_id INTO existing_session_id
    FROM anonymous_project_sessions
    WHERE session_id = p_session_id;
    
    IF existing_session_id IS NULL THEN
        -- Create new session
        INSERT INTO anonymous_project_sessions (
            session_id,
            user_agent,
            ip_address,
            referrer
        ) VALUES (
            p_session_id,
            p_user_agent,
            p_ip_address,
            p_referrer
        );
        
        existing_session_id := p_session_id;
    ELSE
        -- Update last activity
        UPDATE anonymous_project_sessions
        SET last_activity = NOW()
        WHERE session_id = p_session_id;
    END IF;
    
    RETURN existing_session_id;
END;
$$;

-- Create function to save anonymous SDLC project
CREATE OR REPLACE FUNCTION save_anonymous_sdlc_project(
    p_session_id TEXT,
    p_title TEXT,
    p_input_text TEXT,
    p_documents JSONB,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    project_uuid UUID;
    document_uuid UUID;
    doc_type TEXT;
    doc_content TEXT;
BEGIN
    -- Get or create anonymous session
    PERFORM get_or_create_anonymous_session(p_session_id, p_user_agent, p_ip_address, p_referrer);
    
    -- Create the project
    INSERT INTO sdlc_projects (
        session_id,
        title,
        input_text,
        status,
        template_used
    ) VALUES (
        p_session_id,
        p_title,
        p_input_text,
        'completed',
        'anonymous_sdlc'
    ) RETURNING id INTO project_uuid;
    
    -- Create documents
    FOR doc_type, doc_content IN SELECT * FROM jsonb_each_text(p_documents)
    LOOP
        IF doc_content IS NOT NULL AND doc_content != '' THEN
            INSERT INTO documents (
                project_id,
                document_type,
                content
            ) VALUES (
                project_uuid,
                doc_type,
                doc_content
            ) RETURNING id INTO document_uuid;
        END IF;
    END LOOP;
    
    -- Update project count in session
    UPDATE anonymous_project_sessions
    SET project_count = project_count + 1,
        last_activity = NOW()
    WHERE session_id = p_session_id;
    
    RETURN project_uuid;
END;
$$;

-- Create function to get anonymous projects by session
CREATE OR REPLACE FUNCTION get_anonymous_projects(p_session_id TEXT)
RETURNS TABLE (
    project_id UUID,
    title TEXT,
    input_text TEXT,
    status TEXT,
    created_at TIMESTAMP,
    documents JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as project_id,
        p.title,
        p.input_text,
        p.status,
        p.created_at,
        COALESCE(
            (SELECT jsonb_object_agg(d.document_type, d.content)
             FROM documents d
             WHERE d.project_id = p.id),
            '{}'::jsonb
        ) as documents
    FROM sdlc_projects p
    WHERE p.session_id = p_session_id
    ORDER BY p.created_at DESC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_or_create_anonymous_session(TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION save_anonymous_sdlc_project(TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_anonymous_projects(TEXT) TO anon;

-- Comments for documentation
COMMENT ON TABLE anonymous_project_sessions IS 'Tracks anonymous user sessions for project generation';
COMMENT ON COLUMN sdlc_projects.session_id IS 'Session ID for anonymous users (NULL for authenticated users)';
COMMENT ON FUNCTION save_anonymous_sdlc_project IS 'Saves SDLC project for anonymous users with session tracking'; 