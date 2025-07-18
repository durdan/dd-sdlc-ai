-- Rename system prompts to reflect unified system approach
-- Remove "Enterprise" prefix since we now have one unified system
-- Note: Using prompt_templates base table (active_prompts and default_prompts are views)

UPDATE prompt_templates 
SET name = REPLACE(name, 'Enterprise ', 'System Default - ')
WHERE is_system_default = true 
AND name LIKE '%Enterprise%';

-- Update descriptions to remove Enterprise references
UPDATE prompt_templates 
SET description = REPLACE(COALESCE(description, ''), 'Enterprise', 'Unified system default')
WHERE is_system_default = true;

-- Verify the changes
SELECT name, document_type, description 
FROM prompt_templates 
WHERE is_system_default = true 
ORDER BY document_type; 