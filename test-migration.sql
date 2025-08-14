-- Test migration for coding spec
-- This is a test file to verify the SQL syntax

-- First, check if the coding spec already exists
SELECT COUNT(*) as existing_count 
FROM prompt_templates 
WHERE document_type = 'coding';

-- If you want to delete existing coding spec prompts (for testing):
-- DELETE FROM prompt_templates WHERE document_type = 'coding';

-- Now run the actual migration
-- Copy the INSERT statement from add-coding-spec.sql here when ready to test