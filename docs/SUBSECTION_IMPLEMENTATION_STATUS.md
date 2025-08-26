# Subsection Implementation Status

## Current Implementation Status

### ✅ Non-Logged-In Users (Anonymous)
**Status: FULLY IMPLEMENTED**

1. **UI/Selection**:
   - ✅ `DocumentButtonWithSections` component on landing page
   - ✅ Dropdown menu with section selection
   - ✅ Saves selections to localStorage

2. **Generation**:
   - ✅ Sends selected sections to API
   - ✅ Sequential section-by-section generation
   - ✅ Progress tracking with `ExpandableSectionViewer`

3. **Database Storage**:
   - ✅ Saves to `sdlc_projects` table via `saveAnonymousProject()`
   - ✅ Stores `selected_sections` JSONB
   - ✅ Stores `generation_metadata` JSONB

### ❌ Logged-In Users
**Status: NOT IMPLEMENTED**

1. **UI/Selection**:
   - ❌ No section selection UI in dashboard
   - ❌ No dropdown menus for document types
   - ❌ Always generates full documents

2. **Generation**:
   - ❌ Dashboard doesn't pass section parameters to API
   - ❌ No section-by-section generation
   - ❌ No progress tracking for sections

3. **Database Storage**:
   - ❌ `createProject()` doesn't save section data
   - ❌ `createDocument()` doesn't save section metadata
   - ❌ No tracking of which sections were generated

## Implementation Needed for Logged-In Users

### 1. Update Dashboard UI (`/app/dashboard/page.tsx`)
```typescript
// Add section selection state
const [selectedBusinessSections, setSelectedBusinessSections] = useState<string[]>([])
const [selectedTechSpecSections, setSelectedTechSpecSections] = useState<string[]>([])
// ... etc for all document types

// Add UI components for section selection
// Option 1: Add DocumentButtonWithSections to dashboard
// Option 2: Add checkboxes/toggles for each section
```

### 2. Update API Calls in Dashboard
```typescript
const businessResponse = await fetch("/api/generate-document", {
  body: JSON.stringify({
    documentType: "business",
    input,
    businessSections: selectedBusinessSections, // ADD THIS
    userId: user.id,
    // ... other params
  })
})
```

### 3. Update Database Service (`/lib/database-service.ts`)
```typescript
async createProject(projectData: SDLCProjectInsert): Promise<SDLCProject | null> {
  // Include selected_sections and generation_metadata
  const enrichedData = {
    ...projectData,
    selected_sections: projectData.selected_sections || {},
    generation_metadata: projectData.generation_metadata || {}
  }
  // ... rest of implementation
}

async createDocument(documentData: DocumentInsert): Promise<Document | null> {
  // Include section-specific metadata
  const enrichedData = {
    ...documentData,
    selected_sections: documentData.selected_sections || null,
    generation_type: documentData.generation_type || 'full',
    section_metadata: documentData.section_metadata || {}
  }
  // ... rest of implementation
}
```

### 4. Database Schema Updates
**Already completed in migrations:**
- ✅ `documents` table has section columns
- ✅ `sdlc_projects` table has section columns
- ✅ RPC functions updated for anonymous users

## Files That Need Updates

1. **Dashboard Page**: `/app/dashboard/page.tsx`
   - Add section selection UI
   - Update API calls to include sections
   - Add progress tracking for sections

2. **Database Service**: `/lib/database-service.ts`
   - Update `createProject()` to save section data
   - Update `createDocument()` to save section metadata
   - Add methods to retrieve section data

3. **Types**: `/database.types.ts` (if needed)
   - Ensure types include new columns

## Testing Checklist

### Non-Logged-In Users
- [x] Can select specific sections
- [x] Sections are saved to localStorage
- [x] Sections are sent to API
- [x] Sections are saved to database
- [x] Can generate section-by-section

### Logged-In Users (TO BE TESTED)
- [ ] Can select specific sections
- [ ] Sections are saved to state
- [ ] Sections are sent to API
- [ ] Sections are saved to database
- [ ] Can generate section-by-section

## Summary

The subsection feature is **50% complete**:
- ✅ **Backend/API**: Fully supports sections for all users
- ✅ **Database**: Schema ready for all users
- ✅ **Anonymous Users**: Fully implemented
- ❌ **Logged-In Users**: No UI or data flow implemented

To complete the feature, the dashboard needs to be updated with section selection UI and the database service needs to save section metadata.