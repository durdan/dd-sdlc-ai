-- Migration: Add Meeting Transcript Document Type
-- Description: Adds support for processing meeting transcripts and generating meeting summaries and requirement stories
-- Date: 2025-01-16

-- Step 1: Update the check constraint on prompt_templates to allow 'meeting' as a document type
ALTER TABLE prompt_templates 
DROP CONSTRAINT IF EXISTS prompt_templates_document_type_check;

ALTER TABLE prompt_templates 
ADD CONSTRAINT prompt_templates_document_type_check 
CHECK (document_type IN ('business', 'functional', 'technical', 'ux', 'mermaid', 'wireframe', 'coding', 'test', 'meeting'));

-- Step 2: Update the check constraints on documents table to allow 'meeting' documents
ALTER TABLE documents 
DROP CONSTRAINT IF EXISTS documents_document_type_check;

-- Include both new format and legacy format document types
ALTER TABLE documents 
ADD CONSTRAINT documents_document_type_check 
CHECK (document_type IN (
  -- New format (single words)
  'architecture', 
  'business_analysis', 
  'comprehensive_sdlc', 
  'functional_spec', 
  'technical_spec', 
  'ux_spec', 
  'wireframe', 
  'coding',
  'test',
  'meeting',
  -- Legacy format (for backward compatibility)
  'businessAnalysis',
  'functionalSpec',
  'technicalSpec', 
  'uxSpec'
));

-- Step 3: Insert default prompt templates for meeting transcript processing
INSERT INTO prompt_templates (
  name,
  document_type,
  prompt_content,
  description,
  variables,
  is_active,
  is_system_default,
  prompt_scope,
  created_at,
  updated_at
) VALUES (
  'Meeting Transcript Processor',
  'meeting',
  'You are an expert meeting analyst and requirement documentation specialist. Process the following meeting transcript to generate structured documentation.

**Meeting Transcript:**
{{input}}

Generate a comprehensive document with the following sections:

## 1. Meeting Summary

Provide a high-level overview that includes:
- **Meeting Purpose**: The main objective and context
- **Key Participants**: Roles and stakeholders involved (if mentioned)
- **Date/Time**: If mentioned in the transcript
- **Main Topics Discussed**: List the primary discussion points
- **Key Decisions Made**: Important decisions and consensus reached
- **Action Items**: Specific tasks assigned with owners (if mentioned)
- **Next Steps**: Planned follow-up activities

## 2. Requirement Stories

For each requirement or feature discussed in the meeting, create a detailed user story in the following Agile format:

### Story [Number]: [Title]

**As a** [type of user/role]
**I want** [specific functionality/feature]
**So that** [business value/benefit]

**Acceptance Criteria:**
- [ ] [Specific testable criterion 1]
- [ ] [Specific testable criterion 2]
- [ ] [Specific testable criterion 3]
- [ ] [Additional criteria as needed]

**Technical Considerations:**
- [Any technical constraints or considerations mentioned]
- [Integration points discussed]
- [Performance requirements if mentioned]

**Dependencies:**
- [Other stories or systems this depends on]
- [External dependencies mentioned]

**Priority:** [High/Medium/Low based on discussion emphasis]

**Estimated Effort:** [If discussed, otherwise mark as "TBD"]

**Additional Notes:**
- [Any relevant context from the discussion]
- [Risks or concerns raised]
- [Alternative approaches considered]

---

Ensure that:
1. Each story is self-contained and implementable
2. Acceptance criteria are specific and testable
3. Stories follow INVEST principles (Independent, Negotiable, Valuable, Estimable, Small, Testable)
4. Technical details mentioned in the meeting are captured
5. Business context and value are clearly articulated
6. The format is consistent and ready for Jira integration

Focus on extracting actionable requirements and maintaining traceability to the discussion points.',
  'Processes meeting transcripts to generate structured meeting summaries and detailed requirement stories in Agile format',
  '["input"]'::jsonb,
  true,
  true,
  'system',
  NOW(),
  NOW()
);

-- Step 4: Create an index for faster queries on meeting documents
CREATE INDEX IF NOT EXISTS idx_documents_meeting_type 
ON documents(document_type) 
WHERE document_type = 'meeting';

-- Step 5: Add a comment to document the new document type
COMMENT ON COLUMN documents.document_type IS 'Document type: architecture, business_analysis, comprehensive_sdlc, functional_spec, technical_spec, ux_spec, wireframe, coding, test, meeting (for meeting transcripts), or legacy formats';