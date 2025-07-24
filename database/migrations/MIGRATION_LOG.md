# Database Migration Log

## Applied Migrations (Included in initial-setup.sql)

The following migrations have been applied and incorporated into `database/schema/initial-setup.sql`:

### 2025-01-23
- `20250123_add_v0_api_key.sql` - Added v0_api_key column to user_configurations table
- `20250123_add_v0_usage_tracking.sql` - Added v0_usage_tracking table with RLS policies
- `20250123_add_wireframe_document_type.sql` - Added wireframe to document types
- `20250123_add_wireframe_prompts.sql` - Added wireframe_prompts table with default data
- `20250123_add_wireframe_to_prompt_templates.sql` - Added default wireframe prompt template

### 2024-12-18
- `20241218_fix_documents_type_constraint.sql` - Fixed document type constraints

## Remaining Migrations

### To Be Applied
- `20250123_add_project_generations_rls.sql` - RLS policies for project_generations table

## Migration Process

1. New installations should run `database/schema/initial-setup.sql` which includes all applied migrations
2. Existing installations should run any migrations in the main migrations folder
3. After applying a migration to production, it should be:
   - Incorporated into initial-setup.sql
   - Moved to the archive folder
   - Documented in this log

## Notes

- All archived migrations are stored in `database/migrations/archive/` for historical reference
- The initial-setup.sql file represents the complete current schema
- Always test migrations in a development environment first