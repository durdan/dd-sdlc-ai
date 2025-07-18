-- Fix documents type constraint to include 'database' type
-- This migration adds 'database' as a valid document type

-- Drop the existing constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_type_check;

-- Add the updated constraint with 'database' included
ALTER TABLE documents 
ADD CONSTRAINT documents_type_check 
CHECK (document_type IN (
    'comprehensive_sdlc', 'business_analysis', 'functional_spec', 
    'technical_spec', 'ux_spec', 'architecture', 'backlog_structure', 
    'mermaid_diagrams', 'database'
));

-- Add comment for documentation
COMMENT ON CONSTRAINT documents_type_check ON documents IS 
'Validates document types. Added database type for ER diagrams and database schemas.'; 