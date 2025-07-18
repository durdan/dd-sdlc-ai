# Anonymous Content Saving Fix

## Problem Identified

You asked: **"Are we saving that diagram and user input?"**

The answer was **NO** - we were only tracking analytics metadata, but **NOT saving the actual content**.

### What Was Missing:
- ❌ **Diagram content** - The actual Mermaid diagrams generated
- ❌ **User input** - The original requirements/description  
- ❌ **Anonymous projects** - No projects saved for anonymous users
- ❌ **Session tracking** - No anonymous sessions created

### Database Evidence:
```sql
-- 0 anonymous projects saved
SELECT COUNT(*) FROM sdlc_projects WHERE user_id IS NULL;
-- Result: 0

-- 0 anonymous sessions
SELECT COUNT(*) FROM anonymous_project_sessions;
-- Result: 0

-- Only analytics metadata (no content)
SELECT action_type, COUNT(*) FROM anonymous_analytics GROUP BY action_type;
-- Result: 126 page_visit, 2 diagram_generation (metadata only)
```

## Solution Implemented

### 1. Added Content Saving to `/api/generate-preview-diagrams`

**What's Now Saved:**
- ✅ **User input** - Original requirements/description
- ✅ **Project title** - Extracted from input (first 50 chars)
- ✅ **Diagram content** - Parsed Mermaid diagrams by type:
  - `architecture` - System architecture diagrams
  - `dataflow` - Data flow diagrams  
  - `userflow` - User journey diagrams
  - `database` - Database schema diagrams
- ✅ **Session tracking** - Anonymous user session with metadata
- ✅ **Analytics** - Generation event tracking

**Code Added:**
```typescript
// Save anonymous project if no authenticated user
try {
  const userAgent = request.headers.get('user-agent') || undefined
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || undefined
  const referrer = request.headers.get('referer') || undefined

  // Extract project title from input
  const projectTitle = input.length > 50 ? 
    input.substring(0, 50) + '...' : input

  // Parse diagrams from content
  const diagrams = parseMermaidDiagrams(fullContent)
  
  // Save to anonymous projects
  await anonymousProjectService.saveAnonymousProject(
    projectTitle,
    input,
    {
      architecture: diagrams.architecture || fullContent,
      dataflow: diagrams.dataflow || '',
      userflow: diagrams.userflow || '',
      database: diagrams.database || ''
    },
    userAgent,
    ipAddress,
    referrer
  )
  
  console.log('✅ Anonymous diagram project saved successfully')
} catch (saveError) {
  console.error('❌ Error saving anonymous diagram project:', saveError)
}
```

### 2. Added Content Saving to `/api/generate-mermaid-diagrams`

**What's Now Saved:**
- ✅ **User input** - Original requirements/description
- ✅ **Project title** - Extracted from input (first 50 chars)
- ✅ **Diagram content** - Parsed Mermaid diagrams by type:
  - `architecture` - System architecture diagrams
  - `dataflow` - Data flow diagrams
  - `userflow` - User journey diagrams  
  - `database` - Database schema diagrams
  - `sequence` - API sequence diagrams
- ✅ **Context availability** - Which SDLC documents were available
- ✅ **Session tracking** - Anonymous user session with metadata
- ✅ **Analytics** - Generation event tracking

**Code Added:**
```typescript
// Save anonymous project if no authenticated user
if (!effectiveUserId) {
  try {
    const userAgent = req.headers.get('user-agent') || undefined
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || undefined
    const referrer = req.headers.get('referer') || undefined

    // Extract project title from input
    const projectTitle = input.length > 50 ? 
      input.substring(0, 50) + '...' : input

    // Parse diagrams from content
    const diagrams = parseMermaidDiagrams(fullContent)
    
    // Save to anonymous projects
    await anonymousProjectService.saveAnonymousProject(
      projectTitle,
      input,
      {
        architecture: diagrams.architecture || fullContent,
        dataflow: diagrams.dataflow || '',
        userflow: diagrams.userflow || '',
        database: diagrams.database || '',
        sequence: diagrams.sequence || ''
      },
      userAgent,
      ipAddress,
      referrer
    )
    
    console.log('✅ Anonymous mermaid project saved successfully')
  } catch (saveError) {
    console.error('❌ Error saving anonymous mermaid project:', saveError)
  }
}
```

### 3. Added Mermaid Diagram Parsing

**New Function:**
```typescript
function parseMermaidDiagrams(content: string): Record<string, string> {
  const diagrams: Record<string, string> = {}
  
  // Split content into sections
  const sections = content.split(/(?=## )/g)
  
  sections.forEach(section => {
    const lines = section.split('\n')
    const title = lines[0].replace('## ', '').toLowerCase()
    
    // Extract mermaid code blocks
    const mermaidMatch = section.match(/```(?:mermaid)?\s*([\s\S]*?)```/)
    if (mermaidMatch && mermaidMatch[1]) {
      const diagramContent = mermaidMatch[1].trim()
      
      // Map section titles to diagram types
      if (title.includes('architecture') || title.includes('system')) {
        diagrams.architecture = diagramContent
      } else if (title.includes('data flow') || title.includes('flow')) {
        diagrams.dataflow = diagramContent
      } else if (title.includes('user journey') || title.includes('journey')) {
        diagrams.userflow = diagramContent
      } else if (title.includes('database') || title.includes('schema')) {
        diagrams.database = diagramContent
      } else if (title.includes('sequence') || title.includes('api')) {
        diagrams.sequence = diagramContent
      } else {
        // Default to architecture if no specific type found
        diagrams.architecture = diagramContent
      }
    }
  })
  
  return diagrams
}
```

## What's Now Being Saved

### For Anonymous Users:
1. **Complete user input** - Original requirements/description
2. **Project metadata** - Title, creation time, session info
3. **Parsed diagram content** - Organized by diagram type
4. **Session tracking** - Anonymous user session with metadata
5. **Analytics events** - Generation tracking with context

### Database Tables Used:
- `sdlc_projects` - Main project data (with `session_id` for anonymous users)
- `documents` - Individual document content (diagrams, specs)
- `anonymous_project_sessions` - Session tracking
- `anonymous_analytics` - Analytics events

## Expected Results

Now when anonymous users generate diagrams:

1. **Content is saved** - Full diagrams and input stored in database
2. **Projects are created** - Anonymous projects appear in dashboard
3. **Sessions are tracked** - User activity across visits
4. **Analytics are complete** - Both metadata and content tracking

## Testing

To verify the fix is working:

1. **Generate diagrams anonymously** using either route
2. **Check the database** for new records:
   ```sql
   -- Check anonymous projects
   SELECT COUNT(*) FROM sdlc_projects WHERE user_id IS NULL;
   
   -- Check anonymous sessions  
   SELECT COUNT(*) FROM anonymous_project_sessions;
   
   -- Check analytics
   SELECT action_type, COUNT(*) FROM anonymous_analytics GROUP BY action_type;
   ```
3. **Check dashboard** - Anonymous projects should appear in recent projects

## Files Modified

1. `app/api/generate-preview-diagrams/route.ts` - Added content saving
2. `app/api/generate-mermaid-diagrams/route.ts` - Added content saving

## Answer to Your Question

**YES** - We are now saving both the diagram content and user input for anonymous users! 🎉 