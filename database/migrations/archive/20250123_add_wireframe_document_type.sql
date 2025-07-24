-- Migration: Add wireframe document type
-- Date: 2025-01-23
-- Description: Adds 'wireframe' as a valid document type for storing wireframe data

BEGIN;

-- Drop existing constraint if it exists
ALTER TABLE documents 
DROP CONSTRAINT IF EXISTS documents_document_type_check;

-- Check if we're dealing with an enum type
DO $$
DECLARE
    is_enum boolean;
    type_text text;
    existing_types text[];
    all_types text[];
BEGIN
    -- Check if document_type is an enum
    SELECT EXISTS (
        SELECT 1 
        FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE t.typname = 'document_type' 
        AND n.nspname = 'public'
        AND t.typtype = 'e'
    ) INTO is_enum;
    
    IF is_enum THEN
        -- Handle enum type
        RAISE NOTICE 'document_type is an enum type';
        
        -- Add wireframe to the enum if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumtypid = 'public.document_type'::regtype 
            AND enumlabel = 'wireframe'
        ) THEN
            ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'wireframe';
            RAISE NOTICE 'Added wireframe to document_type enum';
        ELSE
            RAISE NOTICE 'wireframe already exists in document_type enum';
        END IF;
    ELSE
        -- Handle non-enum type with dynamic constraint
        RAISE NOTICE 'document_type is not an enum, creating dynamic CHECK constraint';
        
        -- Get all existing document types
        SELECT array_agg(DISTINCT document_type ORDER BY document_type)
        INTO existing_types
        FROM documents
        WHERE document_type IS NOT NULL;
        
        -- If no existing types, use defaults
        IF existing_types IS NULL THEN
            existing_types := ARRAY[]::text[];
        END IF;
        
        RAISE NOTICE 'Found existing document types: %', existing_types;
        
        -- Combine existing types with new required types
        all_types := existing_types || ARRAY[
            'business_analysis',
            'functional_spec',
            'technical_spec',
            'ux_spec',
            'architecture',
            'wireframe'
        ];
        
        -- Remove duplicates
        SELECT array_agg(DISTINCT unnest ORDER BY unnest)
        INTO all_types
        FROM unnest(all_types);
        
        RAISE NOTICE 'Creating constraint with types: %', all_types;
        
        -- Build and execute the constraint dynamically
        EXECUTE format(
            'ALTER TABLE documents ADD CONSTRAINT documents_document_type_check CHECK (document_type = ANY(%L))',
            all_types
        );
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN documents.document_type IS 'Type of document - dynamically managed based on usage';

-- Create an index for faster wireframe queries
CREATE INDEX IF NOT EXISTS idx_documents_wireframe 
ON documents(project_id, document_type) 
WHERE document_type = 'wireframe';

-- Add a function to validate wireframe content
CREATE OR REPLACE FUNCTION validate_wireframe_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate if document_type is 'wireframe'
  IF NEW.document_type = 'wireframe' THEN
    -- Check if content is valid JSON
    BEGIN
      -- Try to parse as JSONB
      PERFORM NEW.content::jsonb;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Wireframe content must be valid JSON';
    END;
    
    -- Check required fields exist
    IF NOT (NEW.content::jsonb ? 'title' AND 
            NEW.content::jsonb ? 'layout' AND 
            NEW.content::jsonb ? 'components') THEN
      RAISE EXCEPTION 'Wireframe must contain title, layout, and components fields';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
DROP TRIGGER IF EXISTS validate_wireframe_content_trigger ON documents;
CREATE TRIGGER validate_wireframe_content_trigger
BEFORE INSERT OR UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION validate_wireframe_content();

COMMIT;

-- Show final status
DO $$
DECLARE
    constraint_def text;
BEGIN
    -- Get the final constraint definition
    SELECT pg_get_constraintdef(c.oid)
    INTO constraint_def
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    JOIN pg_class r ON r.oid = c.conrelid
    WHERE r.relname = 'documents'
    AND c.conname = 'documents_document_type_check'
    AND n.nspname = 'public';
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Final constraint: %', COALESCE(constraint_def, 'No constraint (using enum type)');
END $$;