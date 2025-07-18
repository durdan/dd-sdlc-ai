# Anonymous Diagram Generation Tracking Fix

## Problem Identified

You were right to be suspicious about only seeing 2 anonymous diagram generations! The issue was that **neither of the diagram generation routes were tracking anonymous analytics**.

### What Was Happening:
1. **AI Diagram Modal** (`/api/generate-preview-diagrams`) - **NOT tracking anonymous analytics**
2. **Dashboard Mermaid Diagrams** (`/api/generate-mermaid-diagrams`) - **NOT tracking anonymous analytics**
3. **Only page visits** were being tracked in `anonymous_analytics` (126 records)
4. **Only 2 diagram generations** were tracked because they were probably manually inserted or from a different source

### Database Evidence:
```sql
-- Only 2 diagram generation records with NULL session_id
SELECT COUNT(*) FROM anonymous_analytics WHERE action_type = 'diagram_generation';
-- Result: 2

-- 126 page visits (working correctly)
SELECT COUNT(*) FROM anonymous_analytics WHERE action_type = 'page_visit';
-- Result: 126
```

## Solution Implemented

### 1. Added Anonymous Analytics Tracking to `/api/generate-preview-diagrams`

**Changes Made:**
- Added `createClient` import from `@supabase/supabase-js`
- Created `trackAnonymousAnalytics()` function
- Added analytics tracking call in the POST handler
- Tracks: input preview, AI provider, model, route, user agent, IP, referrer

**Code Added:**
```typescript
// Track anonymous analytics for diagram generation
const userAgent = request.headers.get('user-agent') || undefined
const ipAddress = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || undefined
const referrer = request.headers.get('referer') || undefined

await trackAnonymousAnalytics(
  'diagram_generation',
  {
    input: input.substring(0, 500), // Limit input length for analytics
    ai_provider: 'openai',
    model: 'gpt-4o',
    route: 'generate-preview-diagrams',
    stream: stream
  },
  userAgent,
  ipAddress,
  referrer
)
```

### 2. Added Anonymous Analytics Tracking to `/api/generate-mermaid-diagrams`

**Changes Made:**
- Added `createServiceClient` import from `@supabase/supabase-js`
- Created `trackAnonymousAnalytics()` function
- Added analytics tracking call in the POST handler (only for anonymous users)
- Tracks: input preview, AI provider, model, route, context availability, user agent, IP, referrer

**Code Added:**
```typescript
// Track anonymous analytics for diagram generation
if (!effectiveUserId) {
  const userAgent = req.headers.get('user-agent') || undefined
  const ipAddress = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || undefined
  const referrer = req.headers.get('referer') || undefined

  await trackAnonymousAnalytics(
    'diagram_generation',
    {
      input: input.substring(0, 500),
      ai_provider: 'openai',
      model: 'gpt-4o',
      route: 'generate-mermaid-diagrams',
      hasBusinessAnalysis: !!(businessAnalysis && businessAnalysis.trim()),
      hasFunctionalSpec: !!(functionalSpec && functionalSpec.trim()),
      hasTechnicalSpec: !!(technicalSpec && technicalSpec.trim())
    },
    userAgent,
    ipAddress,
    referrer
  )
}
```

## Expected Results

Now when you generate diagrams anonymously:

1. **AI Diagram Modal** (landing page) will track analytics
2. **Dashboard Mermaid Diagrams** will track analytics (for anonymous users)
3. **Admin analytics** will show the correct count of anonymous diagram generations
4. **Session tracking** will work properly for anonymous users

## Testing

To verify the fix is working:

1. **Generate diagrams anonymously** using the AI Diagram Modal on the landing page
2. **Check the database** for new `anonymous_analytics` records:
   ```sql
   SELECT action_type, COUNT(*) 
   FROM anonymous_analytics 
   GROUP BY action_type 
   ORDER BY COUNT(*) DESC;
   ```
3. **Check admin dashboard** for updated diagram generation counts

## Files Modified

1. `app/api/generate-preview-diagrams/route.ts` - Added anonymous analytics tracking
2. `app/api/generate-mermaid-diagrams/route.ts` - Added anonymous analytics tracking

## Next Steps

The anonymous project saving functionality (from the previous migration) will now work properly with the analytics tracking, giving you complete visibility into anonymous user activity. 