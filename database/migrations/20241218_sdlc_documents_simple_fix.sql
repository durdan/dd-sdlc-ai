-- SDLC Documents Database Migration - Simple Fix
-- Handles existing data safely

-- Step 1: Add new columns to sdlc_projects if they don't exist
ALTER TABLE sdlc_projects 
ADD COLUMN IF NOT EXISTS document_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS linked_projects JSONB DEFAULT '{}';

-- Step 2: Add indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_sdlc_projects_document_metadata ON sdlc_projects USING GIN (document_metadata);
CREATE INDEX IF NOT EXISTS idx_sdlc_projects_user_title ON sdlc_projects(user_id, title);

-- Step 3: Check and add constraint only if it doesn't exist
DO $$
BEGIN
    -- Only add constraint if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'documents_type_check' 
        AND table_name = 'documents'
        AND table_schema = 'public'
    ) THEN
        -- Add the constraint
        ALTER TABLE documents 
        ADD CONSTRAINT documents_type_check 
        CHECK (document_type IN (
            'comprehensive_sdlc',
            'business_analysis', 
            'functional_spec', 
            'technical_spec', 
            'ux_spec', 
            'architecture',
            'backlog_structure',
            'mermaid_diagrams'
        ));
        
        RAISE NOTICE 'Added documents_type_check constraint';
    ELSE
        RAISE NOTICE 'documents_type_check constraint already exists';
    END IF;
END $$;

-- Step 4: Update RLS policies (replace existing ones)
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
CREATE POLICY "Users can view own documents" ON documents 
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM sdlc_projects WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
CREATE POLICY "Users can insert own documents" ON documents 
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM sdlc_projects WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own documents" ON documents;
CREATE POLICY "Users can update own documents" ON documents 
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM sdlc_projects WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete own documents" ON documents;
CREATE POLICY "Users can delete own documents" ON documents 
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM sdlc_projects WHERE user_id = auth.uid()
        )
    );

-- Step 5: Create/replace functions
CREATE OR REPLACE FUNCTION get_user_sdlc_documents(user_uuid UUID)
RETURNS TABLE (
    document_id UUID,
    project_id UUID,
    title TEXT,
    description TEXT,
    document_type TEXT,
    content TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    linked_projects JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id as document_id,
        p.id as project_id,
        p.title,
        p.description,
        d.document_type,
        d.content,
        d.created_at,
        p.updated_at,
        p.linked_projects
    FROM documents d
    JOIN sdlc_projects p ON d.project_id = p.id
    WHERE p.user_id = user_uuid
    ORDER BY d.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION save_comprehensive_sdlc_document(
    user_uuid UUID,
    doc_title TEXT,
    doc_description TEXT,
    doc_content TEXT,
    doc_metadata JSONB DEFAULT '{}'
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    project_uuid UUID;
BEGIN
    -- Create the project
    INSERT INTO sdlc_projects (
        user_id,
        title,
        description,
        input_text,
        status,
        document_metadata,
        template_used
    ) VALUES (
        user_uuid,
        doc_title,
        COALESCE(doc_description, ''),
        doc_content,
        'completed',
        doc_metadata,
        'comprehensive_sdlc'
    ) RETURNING id INTO project_uuid;

    -- Create the comprehensive SDLC document
    INSERT INTO documents (
        project_id,
        document_type,
        content
    ) VALUES (
        project_uuid,
        'comprehensive_sdlc',
        doc_content
    );

    RETURN project_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION update_project_linked_projects(
    project_uuid UUID,
    user_uuid UUID,
    linked_data JSONB
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE sdlc_projects 
    SET 
        linked_projects = linked_data,
        updated_at = NOW()
    WHERE id = project_uuid AND user_id = user_uuid;
    
    RETURN FOUND;
END;
$$;

-- Step 6: Grant permissions
GRANT EXECUTE ON FUNCTION get_user_sdlc_documents(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION save_comprehensive_sdlc_document(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_project_linked_projects(UUID, UUID, JSONB) TO authenticated;

-- Step 7: Verification
SELECT 
    'Migration completed successfully!' as status,
    (SELECT COUNT(*) FROM information_schema.table_constraints 
     WHERE constraint_name = 'documents_type_check') as constraint_exists,
    (SELECT COUNT(*) FROM information_schema.routines 
     WHERE routine_name = 'get_user_sdlc_documents') as function_exists; 