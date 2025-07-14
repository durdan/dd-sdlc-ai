-- SDLC Documents Database Migration - FIXED VERSION
-- This migration handles existing data and constraint violations

-- Step 1: Check existing document types
DO $$
DECLARE
    existing_types TEXT[];
BEGIN
    -- Get all existing document_type values
    SELECT ARRAY_AGG(DISTINCT document_type) INTO existing_types
    FROM documents 
    WHERE document_type IS NOT NULL;
    
    -- Log existing types for reference
    RAISE NOTICE 'Existing document types found: %', existing_types;
END $$;

-- Step 2: Update any non-standard document types to 'comprehensive_sdlc'
UPDATE documents 
SET document_type = 'comprehensive_sdlc'
WHERE document_type NOT IN (
    'comprehensive_sdlc',
    'business_analysis', 
    'functional_spec', 
    'technical_spec', 
    'ux_spec', 
    'architecture',
    'backlog_structure',
    'mermaid_diagrams'
) AND document_type IS NOT NULL;

-- Step 3: Handle NULL document_type values
UPDATE documents 
SET document_type = 'comprehensive_sdlc'
WHERE document_type IS NULL;

-- Step 4: Add the constraint now that data is clean
DO $$
BEGIN
    -- Drop constraint if it exists (in case of re-running)
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'documents_type_check' 
        AND table_name = 'documents'
    ) THEN
        ALTER TABLE documents DROP CONSTRAINT documents_type_check;
    END IF;
    
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
    
    RAISE NOTICE 'Successfully added documents_type_check constraint';
END $$;

-- Step 5: Ensure SDLC projects table has required fields for document management
ALTER TABLE sdlc_projects 
ADD COLUMN IF NOT EXISTS document_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS linked_projects JSONB DEFAULT '{}';

-- Step 6: Add indexes for better performance on document searches
CREATE INDEX IF NOT EXISTS idx_sdlc_projects_document_metadata ON sdlc_projects USING GIN (document_metadata);
CREATE INDEX IF NOT EXISTS idx_sdlc_projects_user_title ON sdlc_projects(user_id, title);

-- Step 7: Update RLS policies for document management
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

-- Step 8: Create function to get user's SDLC documents with project info
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

-- Step 9: Create function to save comprehensive SDLC document
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
    document_uuid UUID;
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
    ) RETURNING id INTO document_uuid;

    RETURN project_uuid;
END;
$$;

-- Step 10: Create function to update project linked projects
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

-- Step 11: Grant execution permissions on functions
GRANT EXECUTE ON FUNCTION get_user_sdlc_documents(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION save_comprehensive_sdlc_document(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_project_linked_projects(UUID, UUID, JSONB) TO authenticated;

-- Step 12: Final verification
DO $$
DECLARE
    constraint_exists BOOLEAN;
    function_count INTEGER;
BEGIN
    -- Check if constraint was added successfully
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'documents_type_check' 
        AND table_name = 'documents'
    ) INTO constraint_exists;
    
    -- Count created functions
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN (
        'get_user_sdlc_documents',
        'save_comprehensive_sdlc_document', 
        'update_project_linked_projects'
    );
    
    RAISE NOTICE 'Migration Results:';
    RAISE NOTICE '- Constraint added: %', constraint_exists;
    RAISE NOTICE '- Functions created: %/3', function_count;
    RAISE NOTICE '- Migration completed successfully!';
END $$; 

-- Step 13: Create helper function to fix projects with multiple comprehensive_sdlc documents
-- This converts existing broken projects to use individual document types
CREATE OR REPLACE FUNCTION fix_comprehensive_document_projects()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    project_record RECORD;
    doc_record RECORD;
    fixed_count INTEGER := 0;
    doc_type TEXT;
    content_lower TEXT;
BEGIN
    -- Find projects with multiple comprehensive_sdlc documents
    FOR project_record IN 
        SELECT p.id, p.title
        FROM sdlc_projects p
        WHERE (
            SELECT COUNT(*) 
            FROM documents d 
            WHERE d.project_id = p.id AND d.document_type = 'comprehensive_sdlc'
        ) > 1
    LOOP
        RAISE NOTICE 'Fixing project: % (%)', project_record.title, project_record.id;
        
        -- Process each comprehensive_sdlc document for this project
        FOR doc_record IN 
            SELECT id, content
            FROM documents 
            WHERE project_id = project_record.id 
            AND document_type = 'comprehensive_sdlc'
            ORDER BY created_at
        LOOP
            content_lower := LOWER(doc_record.content);
            
            -- Determine the appropriate document type based on content
            IF content_lower LIKE '%business analysis%' OR 
               content_lower LIKE '%executive summary%' OR 
               content_lower LIKE '%stakeholder%' OR 
               content_lower LIKE '%business objective%' THEN
                doc_type := 'business_analysis';
            ELSIF content_lower LIKE '%functional%' OR 
                  content_lower LIKE '%system overview%' OR 
                  content_lower LIKE '%api specification%' OR 
                  content_lower LIKE '%data architecture%' THEN
                doc_type := 'functional_spec';
            ELSIF content_lower LIKE '%technical%' OR 
                  content_lower LIKE '%system architecture%' OR 
                  content_lower LIKE '%technology stack%' OR 
                  content_lower LIKE '%deployment%' THEN
                doc_type := 'technical_spec';
            ELSIF content_lower LIKE '%ux %' OR 
                  content_lower LIKE '%user experience%' OR 
                  content_lower LIKE '%personas%' OR 
                  content_lower LIKE '%wireframe%' OR 
                  content_lower LIKE '%design system%' THEN
                doc_type := 'ux_spec';
            ELSE
                -- Default to business_analysis for unclassified content
                doc_type := 'business_analysis';
            END IF;
            
            -- Update the document type
            UPDATE documents 
            SET document_type = doc_type 
            WHERE id = doc_record.id;
            
            RAISE NOTICE 'Updated document % to type: %', doc_record.id, doc_type;
        END LOOP;
        
        fixed_count := fixed_count + 1;
    END LOOP;
    
    RETURN format('Fixed %s projects with multiple comprehensive_sdlc documents', fixed_count);
END;
$$;

-- Step 14: Grant permission and run the fix
GRANT EXECUTE ON FUNCTION fix_comprehensive_document_projects() TO authenticated;

-- Optionally run the fix now (commented out - run manually if needed)
-- SELECT fix_comprehensive_document_projects(); 