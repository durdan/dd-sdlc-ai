-- Update the save_anonymous_sdlc_project function to handle section tracking
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
    v_selected_sections JSONB;
    v_generation_metadata JSONB;
BEGIN
    -- Extract data from JSONB
    v_title := p_project_data->>'title';
    v_input_text := p_project_data->>'input_text';
    v_documents := COALESCE(p_project_data->'documents', '{}'::jsonb);
    v_selected_sections := COALESCE(p_project_data->'selected_sections', '{}'::jsonb);
    v_generation_metadata := COALESCE(p_project_data->'generation_metadata', '{}'::jsonb);
    
    -- Validate session_id
    IF p_session_id IS NULL OR p_session_id = '' THEN
        RAISE EXCEPTION 'Session ID is required';
    END IF;
    
    -- Create or update anonymous session
    INSERT INTO anonymous_project_sessions (
        session_id,
        user_agent,
        ip_address,
        referrer,
        last_activity,
        expires_at
    ) VALUES (
        p_session_id,
        p_project_data->>'user_agent',
        p_project_data->>'ip_address',
        p_project_data->>'referrer',
        NOW(),
        NOW() + INTERVAL '30 days'
    )
    ON CONFLICT (session_id) DO UPDATE SET
        last_activity = NOW(),
        expires_at = NOW() + INTERVAL '30 days',
        project_count = anonymous_project_sessions.project_count + 1;
    
    -- Create project
    INSERT INTO sdlc_projects (
        title,
        input_text,
        status,
        session_id,
        document_metadata,
        selected_sections,
        generation_metadata,
        created_at,
        updated_at
    ) VALUES (
        v_title,
        v_input_text,
        'completed',
        p_session_id,
        v_documents,
        v_selected_sections,
        v_generation_metadata,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_project_id;
    
    -- Create document records for each document type in the documents object
    INSERT INTO documents (project_id, document_type, content, created_at)
    SELECT 
        v_project_id,
        key::text,
        value::text,
        NOW()
    FROM jsonb_each_text(v_documents)
    WHERE value IS NOT NULL AND value::text != '';
    
    -- Log the save
    INSERT INTO anonymous_analytics (
        session_id,
        event_type,
        event_data,
        created_at
    ) VALUES (
        p_session_id,
        'project_saved',
        jsonb_build_object(
            'project_id', v_project_id,
            'title', v_title,
            'document_count', jsonb_object_keys(v_documents),
            'has_sections', jsonb_object_keys(v_selected_sections)
        ),
        NOW()
    );
    
    RETURN v_project_id;
EXCEPTION WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE NOTICE 'Error saving anonymous project: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION save_anonymous_sdlc_project(TEXT, JSONB) TO anon, authenticated;