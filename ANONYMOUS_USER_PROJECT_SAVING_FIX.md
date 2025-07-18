# Anonymous User Project Saving & Claude Code Assistant Display Fix

## Issues Addressed

### 1. Claude Code Assistant Projects Showing SDLC Tabs
**Problem**: Claude Code Assistant projects were displaying all SDLC document tabs (Business, Functional, Technical, UX, Architecture) even though they don't have this content structure.

**Solution**: 
- Updated the `RecentProject` interface to include `projectType?: 'sdlc' | 'claude_code_assistant'`
- Modified the project viewer modal to show appropriate content based on project type
- Claude Code Assistant projects now show a dedicated view with a button to navigate to the Claude Code interface
- SDLC projects continue to show dynamic tabs based on available content

### 2. Anonymous User Projects Not Being Saved to Database
**Problem**: Anonymous users' SDLC projects and diagram generations were not being saved to the database, only tracked in analytics.

**Solution**: 
- Created database migration `20241221_anonymous_projects.sql` to support anonymous user projects
- Added `session_id` column to `sdlc_projects` table for anonymous users
- Created `anonymous_project_sessions` table to track anonymous user sessions
- Implemented `AnonymousProjectService` to handle anonymous project operations
- Updated dashboard to load and display both authenticated and anonymous projects

## Database Changes

### New Tables
- `anonymous_project_sessions`: Tracks anonymous user sessions with metadata
- Added `session_id` column to `sdlc_projects` table

### New Functions
- `get_or_create_anonymous_session()`: Manages anonymous user sessions
- `save_anonymous_sdlc_project()`: Saves SDLC projects for anonymous users
- `get_anonymous_projects()`: Retrieves projects for anonymous sessions

### Updated RLS Policies
- Modified policies to allow anonymous access using session IDs
- Maintains security while enabling anonymous project storage

## Code Changes

### New Service: `lib/anonymous-project-service.ts`
- `AnonymousProjectService` class for handling anonymous project operations
- Session ID generation and management
- Project saving and retrieval for anonymous users
- Conversion utilities for dashboard display

### Updated Dashboard: `app/dashboard/page.tsx`
- Modified `getCachedProjects()` to include anonymous projects
- Updated `setCachedResults()` to handle both authenticated and anonymous users
- Enhanced `loadUserData()` to load projects regardless of authentication status
- Added project type filtering and display logic

### Interface Updates
- Added `projectType` property to `RecentProject` interface
- Enhanced project filtering and display based on project type

## Features

### Anonymous User Support
- **Session Management**: Anonymous users get unique session IDs stored in localStorage
- **Project Persistence**: Anonymous projects are saved to database with session tracking
- **Cross-Session Access**: Anonymous users can access their projects across browser sessions
- **Analytics Integration**: Anonymous project activity is tracked for analytics

### Project Type Differentiation
- **SDLC Projects**: Show dynamic tabs based on available document content
- **Claude Code Assistant Projects**: Show dedicated interface with navigation to Claude Code
- **Smart Filtering**: Dashboard filters projects by type (All, SDLC, Claude Code)
- **Visual Indicators**: Project type badges for easy identification

### Enhanced User Experience
- **Unified Dashboard**: Both authenticated and anonymous users see their projects
- **Seamless Transition**: Anonymous users can sign up and keep their projects
- **Content-Aware Display**: Only show relevant tabs and content for each project type
- **Responsive Design**: Mobile-friendly project display and filtering

## Migration Instructions

1. **Run Database Migration**:
   ```sql
   -- Execute the migration script
   \i database/migrations/20241221_anonymous_projects.sql
   ```

2. **Verify Tables**:
   ```sql
   -- Check if new tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_name IN ('anonymous_project_sessions');
   
   -- Check if session_id column was added
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'sdlc_projects' AND column_name = 'session_id';
   ```

3. **Test Anonymous Project Saving**:
   - Open the application in incognito mode
   - Generate an SDLC project without signing in
   - Verify the project appears in the Recent Projects section
   - Check the database for the saved project

## Benefits

1. **Improved User Experience**: Anonymous users can now save and access their projects
2. **Better Project Organization**: Clear distinction between SDLC and Claude Code projects
3. **Enhanced Analytics**: Better tracking of anonymous user engagement
4. **Seamless Onboarding**: Users can try the platform before signing up
5. **Data Persistence**: Anonymous projects are preserved across sessions

## Future Enhancements

1. **Anonymous to Authenticated Migration**: Allow anonymous users to claim their projects when they sign up
2. **Project Sharing**: Enable anonymous users to share their projects via links
3. **Enhanced Analytics**: More detailed tracking of anonymous user behavior
4. **Project Templates**: Pre-built templates for anonymous users to get started quickly 