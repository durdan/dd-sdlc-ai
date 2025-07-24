-- Migration: Add wireframe prompt to main prompt_templates table
-- Date: 2025-01-23
-- Description: Adds a system default wireframe prompt to enable wireframe generation

BEGIN;

-- First, check if we need to update the document_type constraint
DO $$
DECLARE
    constraint_def text;
    has_wireframe boolean;
BEGIN
    -- Get current constraint definition
    SELECT pg_get_constraintdef(c.oid)
    INTO constraint_def
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    JOIN pg_class r ON r.oid = c.conrelid
    WHERE r.relname = 'prompt_templates'
    AND c.conname LIKE '%document_type%'
    AND n.nspname = 'public';
    
    -- Check if wireframe is already in the constraint
    has_wireframe := constraint_def LIKE '%wireframe%';
    
    IF NOT has_wireframe AND constraint_def IS NOT NULL THEN
        -- Drop the old constraint
        EXECUTE 'ALTER TABLE prompt_templates DROP CONSTRAINT ' || 
            (SELECT c.conname FROM pg_constraint c
             JOIN pg_namespace n ON n.oid = c.connamespace
             JOIN pg_class r ON r.oid = c.conrelid
             WHERE r.relname = 'prompt_templates'
             AND c.conname LIKE '%document_type%'
             AND n.nspname = 'public');
        
        -- Add new constraint including wireframe
        ALTER TABLE prompt_templates 
        ADD CONSTRAINT prompt_templates_document_type_check 
        CHECK (document_type IN ('business', 'functional', 'technical', 'ux', 'mermaid', 'wireframe'));
        
        RAISE NOTICE 'Updated document_type constraint to include wireframe';
    END IF;
END $$;

-- Check if wireframe prompt already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM prompt_templates 
        WHERE document_type = 'wireframe' 
        AND prompt_scope = 'system'
        AND is_system_default = true
    ) THEN
        -- Insert default wireframe prompt
        INSERT INTO prompt_templates (
            id,
            name,
            description,
            prompt_content,
            document_type,
            prompt_scope,
            is_active,
            is_system_default,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'Default Wireframe Generator',
            'System default prompt for generating comprehensive wireframes from user descriptions',
    'You are an expert UX designer creating detailed wireframes.

User Request: {user_prompt}

Create a comprehensive wireframe specification for a {layout_type} interface with the following requirements:

1. **Layout Structure**:
   - Define the overall layout with appropriate dimensions for {layout_type}
   - Use a grid system with proper spacing
   - Include responsive breakpoints if applicable

2. **Components**:
   - Create a hierarchical component structure
   - Each component should have:
     - Unique ID
     - Type (from standard UI components)
     - Position and size
     - Content or placeholder text
     - Relevant properties
   - Use semantic component types

3. **Visual Hierarchy**:
   - Establish clear visual hierarchy
   - Group related components
   - Use appropriate spacing and alignment

4. **Annotations** (if {include_annotations} is true):
   - Add design annotations explaining key decisions
   - Include interaction notes
   - Specify content requirements
   - Note accessibility considerations

5. **User Flow** (if {include_user_flow} is true):
   - Document the primary user flow
   - Include step-by-step actions
   - Note expected results
   - Identify alternative paths

Output the wireframe specification as a valid JSON object following this structure:
{
  "title": "Page/Screen Title",
  "description": "Brief description of the interface",
  "layout": {
    "type": "{layout_type}",
    "dimensions": { "width": number, "height": number },
    "grid": { "columns": number, "gap": number, "padding": number }
  },
  "components": [...],
  "annotations": [...],
  "userFlow": [
    {
      "step": 1,
      "action": "User action description",
      "result": "What happens as a result",
      "componentId": "ID of component involved",
      "alternativePaths": ["Alternative action 1", "Alternative action 2"] // Optional array of strings
    }
  ]
}

Important guidelines:
- Use realistic dimensions (e.g., 1440x900 for desktop, 375x812 for mobile)
- Components should not overlap unless intentionally layered
- Use standard component types: header, nav, button, input, card, etc.
- Ensure proper parent-child relationships for nested components
- Make the design accessible and user-friendly
- In userFlow, alternativePaths must be an array of strings (even if empty: [])
- Do not include alternativePaths field if there are no alternatives

Return ONLY the JSON object without any additional text or markdown formatting.',
    'wireframe',
    'system',
    true,
    true,
    NOW(),
    NOW()
        );
        RAISE NOTICE 'Wireframe prompt successfully added';
    ELSE
        RAISE NOTICE 'Wireframe prompt already exists';
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompt_templates_wireframe 
ON prompt_templates(document_type, is_active, is_system_default) 
WHERE document_type = 'wireframe';

COMMIT;

-- Verify the prompt was added
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM prompt_templates 
        WHERE document_type = 'wireframe' 
        AND is_system_default = true
    ) THEN
        RAISE NOTICE 'Wireframe prompt successfully added to prompt_templates';
    ELSE
        RAISE EXCEPTION 'Failed to add wireframe prompt';
    END IF;
END $$;