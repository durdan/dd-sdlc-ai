#!/usr/bin/env tsx

/**
 * Update Dashboard to Use Database Prompts
 * 
 * This script demonstrates how to refactor the dashboard component to use
 * database-stored prompts instead of hardcoded custom prompts.
 * 
 * Usage:
 * 1. Run the database migration first: scripts/migrate-prompts-to-database.sql
 * 2. Update the dashboard component as shown below
 * 3. Test the system to ensure prompts are loaded from database
 */

console.log(`
🚀 Dashboard Prompt Migration Guide
===================================

Step 1: Run Database Migration
------------------------------
Execute the SQL migration script:
psql -d your_database -f scripts/migrate-prompts-to-database.sql

Step 2: Update Dashboard Component  
---------------------------------
Replace hardcoded custom prompts with database calls:

BEFORE (Current Implementation):
// Hard-coded custom prompt in dashboard
const customPrompt = "You are an expert business analyst..."

AFTER (Database Implementation):
// Remove custom prompt parameter - let API use database
body: JSON.stringify({
  input,
  businessAnalysis: results.businessAnalysis,
  // Remove customPrompt parameter entirely
  openaiKey: config.openaiKey,
}),

Step 3: Update API Calls
------------------------
The APIs already support database prompts. When customPrompt is undefined,
they automatically fall back to the 4-tier hierarchy:

1. Custom prompt (if provided) 
2. User's personal default prompt
3. System default prompt (our migration)
4. Hardcoded fallback prompt

Step 4: Code Changes Required
-----------------------------
Update these lines in app/dashboard/page.tsx:

1. Business Analysis API call (line ~1450):
   REMOVE: customPrompt: "You are an expert business analyst..."
   
2. Functional Spec API call (line ~1580):  
   REMOVE: customPrompt: "You are an expert systems analyst..."
   
3. Technical Spec API call (line ~1720):
   REMOVE: customPrompt: "You are an expert technical architect..."
   
4. UX Spec API call (line ~1970):
   REMOVE: customPrompt: "You are an expert UX designer..."
   
5. Mermaid Diagrams API call (line ~2084):
   REMOVE: customPrompt: "You are an expert system architect..."

Step 5: Benefits of Database Prompts
-----------------------------------
✅ Prompt versioning and A/B testing
✅ User-specific prompt customization  
✅ Centralized prompt management
✅ Analytics and usage tracking
✅ Easy prompt updates without code deployment
✅ Admin panel for prompt management

Step 6: Admin Panel Integration
------------------------------
The system already has admin panels for prompt management:
- /admin/prompts - System prompt management
- /prompts - User prompt management  
- Analytics and usage tracking

Step 7: Testing
---------------
1. Test with existing projects - should use database prompts
2. Create new user prompts via admin panel
3. Verify prompt analytics are working
4. Test A/B experiments if needed

Step 8: Rollback Plan
--------------------
If issues occur, temporarily re-add customPrompt parameters
with the original hardcoded values until resolved.

`)

// Example of the updated API call structure
export const exampleUpdatedApiCall = `
// OLD: Hardcoded prompt
const response = await fetch("/api/generate-business-analysis", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    input,
    customPrompt: "You are an expert business analyst...", // REMOVE THIS
    openaiKey: config.openaiKey,
  }),
})

// NEW: Database prompt  
const response = await fetch("/api/generate-business-analysis", {
  method: "POST", 
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    input,
    // customPrompt removed - API will load from database
    openaiKey: config.openaiKey,
    userId: user?.id, // Optional: for user-specific prompts
  }),
})
`

// Example of prompt management API usage
export const examplePromptManagement = `
// Load user's custom prompts
const promptService = createPromptService()
const userPrompts = await promptService.getUserPrompts(userId, 'business')

// Create new user prompt
const newPrompt = await promptService.createUserPrompt({
  name: "My Custom Business Analysis",
  description: "Tailored for my specific industry",
  document_type: "business", 
  prompt_content: "You are an expert in {{industry}} business analysis...",
  variables: { "industry": "Healthcare" },
  is_personal_default: true
}, userId)

// Get analytics
const analytics = await promptService.getUserPromptAnalytics(userId, 30)
`

console.log("Migration guide complete! ✅")
console.log("Next: Run the database migration and update the dashboard component") 