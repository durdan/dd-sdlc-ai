-- Add subsection tracking to documents table
-- This migration adds support for tracking which subsections were generated for each document

-- Add columns to track subsection generation
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS selected_sections TEXT[],
ADD COLUMN IF NOT EXISTS generation_type VARCHAR(50) DEFAULT 'full',
ADD COLUMN IF NOT EXISTS section_metadata JSONB DEFAULT '{}';

-- Add comments to explain the new columns
COMMENT ON COLUMN documents.selected_sections IS 'Array of section IDs that were selected for generation (null = full document)';
COMMENT ON COLUMN documents.generation_type IS 'Type of generation: full, sections, or single';
COMMENT ON COLUMN documents.section_metadata IS 'Metadata about each section including prompts used, generation time, etc.';

-- Create index for faster section queries
CREATE INDEX IF NOT EXISTS idx_documents_selected_sections 
ON documents USING GIN (selected_sections);

CREATE INDEX IF NOT EXISTS idx_documents_generation_type 
ON documents(generation_type);

-- Add columns to sdlc_projects table for section tracking (for both logged-in and anonymous users)
ALTER TABLE sdlc_projects 
ADD COLUMN IF NOT EXISTS selected_sections JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT '{}';

-- Add comments for project columns
COMMENT ON COLUMN sdlc_projects.selected_sections IS 'JSON object mapping document type to array of selected section IDs';
COMMENT ON COLUMN sdlc_projects.generation_metadata IS 'Metadata about the generation including type, sections, prompts used, etc.';

-- Create a function to get section usage statistics
CREATE OR REPLACE FUNCTION get_section_usage_stats()
RETURNS TABLE (
    document_type VARCHAR,
    section_id TEXT,
    usage_count BIGINT,
    last_used TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.document_type,
        unnest(d.selected_sections) as section_id,
        COUNT(*) as usage_count,
        MAX(d.created_at) as last_used
    FROM documents d
    WHERE d.selected_sections IS NOT NULL
    GROUP BY d.document_type, unnest(d.selected_sections)
    ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_section_usage_stats() TO authenticated;