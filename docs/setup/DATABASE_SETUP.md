# Database Setup for SDLC AI Platform

This document explains how to set up the database tables for the SDLC AI platform to replace localStorage with persistent database storage.

## Overview

The application now stores user data in Supabase instead of localStorage, including:
- **SDLC Projects**: User input, generated documents, and project metadata
- **User Configurations**: API keys, integration settings, and preferences
- **Documents**: Generated business analysis, functional specs, technical specs, etc.
- **Integrations**: Links to Jira epics and Confluence pages
- **Progress Logs**: Step-by-step generation progress tracking

## Database Setup

### 1. Run the SQL Script

Copy and paste the contents of `scripts/setup-database.sql` into your Supabase SQL editor and run it. This will create:

- All necessary tables with proper relationships
- Row Level Security (RLS) policies for data isolation
- Indexes for optimal performance
- Default templates for SDLC generation

### 2. Verify Tables Created

After running the script, verify these tables exist in your Supabase database:
- `sdlc_projects`
- `documents`
- `integrations`
- `user_configurations`
- `progress_logs`
- `templates`
- `audit_logs`

### 3. Check RLS Policies

Ensure Row Level Security is enabled and policies are created. Users should only be able to access their own data.

## Features Migrated from localStorage

### ✅ **Project Storage**
- **Before**: Projects stored in browser localStorage
- **After**: Projects stored in `sdlc_projects` table with user association
- **Benefit**: Access projects from any device, data persists across sessions

### ✅ **Generated Documents**
- **Before**: Documents stored as JSON in localStorage
- **After**: Each document type stored separately in `documents` table
- **Benefit**: Version control, better organization, searchable content

### ✅ **User Configuration**
- **Before**: API keys and settings in localStorage
- **After**: Encrypted storage in `user_configurations` table with unique constraint
- **Benefit**: Secure storage, sync across devices, prevents duplicate configurations

### ✅ **Project History**
- **Before**: Limited localStorage capacity
- **After**: Unlimited project history with search capabilities
- **Benefit**: Full project history, advanced search and filtering

### ✅ **Integration Tracking**
- **Before**: Basic URL storage
- **After**: Full integration metadata in `integrations` table
- **Benefit**: Track all external integrations, metadata storage

## Database Service

The `DatabaseService` class (`lib/database-service.ts`) provides methods for:

```typescript
// Projects
await dbService.createProject(projectData)
await dbService.getProjectsByUser(userId)
await dbService.getProjectById(projectId)

// Documents
await dbService.createDocument(documentData)
await dbService.getDocumentsByProject(projectId)

// Configuration
await dbService.getUserConfiguration(userId)
await dbService.upsertUserConfiguration(userId, config)

// Complete SDLC Results
await dbService.saveCompleteSDLCResult(userId, input, title, documents)
```

## Security Features

### Row Level Security (RLS)
- Users can only access their own projects and data
- Automatic user isolation using `auth.uid()`
- Secure API key storage

### Data Encryption
- API keys and sensitive data are encrypted at rest
- Secure transmission over HTTPS
- No sensitive data in client-side code

## Performance Optimizations

### Database Indexes
- Optimized queries for user projects
- Fast document retrieval by project
- Efficient configuration lookups

### Caching Strategy
- Recent projects cached in component state
- Configuration loaded once per session
- Progressive loading for large datasets

## Migration Benefits

1. **Cross-Device Sync**: Access your projects from any device
2. **Data Persistence**: No data loss when clearing browser cache
3. **Unlimited Storage**: No localStorage size limitations
4. **Search & Filter**: Find projects by content, date, or status
5. **Version Control**: Track document changes over time
6. **Security**: Encrypted storage with user isolation
7. **Backup & Recovery**: Automatic database backups
8. **Analytics**: Usage tracking and audit logs

## Testing the Migration

After setup, test these features:

1. **Create a new project** - Should save to database
2. **Refresh the page** - Projects should persist
3. **Sign out and back in** - Projects should still be there
4. **Configure API keys** - Should save and reload automatically
5. **Generate documents** - Should create project and document records

## Important Notes

### User Configuration Unique Constraint

The `user_configurations` table has a unique constraint on `user_id` to ensure each user has only one configuration record. This prevents issues with:
- Multiple API key records for the same user
- Configuration loading errors due to duplicate records
- Data consistency problems

If you encounter "multiple rows returned" errors, run this cleanup query:

```sql
-- Clean up duplicate user configurations (keep most recent)
WITH ranked_configs AS (
  SELECT id, user_id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) as rn
  FROM user_configurations
)
DELETE FROM user_configurations 
WHERE id IN (
  SELECT id FROM ranked_configs WHERE rn > 1
);
```

## Troubleshooting

### Common Issues

1. **RLS Policies Not Working**
   - Ensure policies are created for all tables
   - Check that `auth.uid()` is available in policies

2. **Configuration Not Loading**
   - Verify `user_configurations` table exists
   - Check user ID is being passed correctly
   - Ensure unique constraint on user_id prevents duplicate configurations

3. **Projects Not Showing**
   - Confirm `sdlc_projects` table has correct user_id references
   - Verify RLS policies allow user access

### Debug Steps

1. Check Supabase logs for SQL errors
2. Verify user authentication is working
3. Test database queries in Supabase SQL editor
4. Check browser console for JavaScript errors

## Next Steps

With the database migration complete, you can now:
- Add advanced search and filtering
- Implement project sharing and collaboration
- Add real-time updates with Supabase subscriptions
- Create analytics dashboards
- Implement automated backups and versioning 