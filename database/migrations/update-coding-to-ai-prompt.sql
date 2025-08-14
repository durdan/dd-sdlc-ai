-- Migration: Update Coding Spec to AI Coding Prompt
-- Description: Updates the prompt template name and description for the coding document type

-- Update the prompt template name and description
UPDATE prompt_templates
SET 
  name = 'AI Coding Prompt',
  description = 'Generates AI-optimized implementation prompts for coding assistants like Cursor, GitHub Copilot, Claude, etc.',
  updated_at = NOW()
WHERE document_type = 'coding' AND version = '1.0';

-- Note: The prompt content remains the same as it's already well-optimized for AI coding assistants
-- Only the user-facing name and description are updated for clarity