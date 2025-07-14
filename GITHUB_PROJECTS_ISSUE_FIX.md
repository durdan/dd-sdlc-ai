# GitHub Projects Integration Fix

## Issue
The GitHub Projects integration was creating issues without proper titles, descriptions, or organization. This was happening because the SDLC document was being passed to the GitHub Projects API as a string instead of as a structured object with subsections.

## Root Cause
The `SDLCGitHubProjectsMapping` class expects each section (businessAnalysis, functionalSpec, etc.) to be an object with subsections, not a single string. The mapping code is designed to iterate through these subsections to create properly formatted issues, but we were passing entire document sections as strings.

## Solution
1. Created a new utility file `lib/sdlc-document-parser.ts` that:
   - Parses document sections into subsections based on markdown headers
   - Extracts sections from a comprehensive document if specific sections aren't provided
   - Ensures default subsections if none are found in the parsed document

2. Updated the dashboard to use the parser:
   - Modified `handleCreateGitHubProject` and `handleCreateGitHubProjectForExisting` functions to parse the SDLC document before sending it to the API
   - Added fallback mechanisms to ensure proper structure even if parsing fails

## Implementation Details

### SDLC Document Parser
The parser includes three main functions:

1. `parseDocumentSections`: Parses a document section into subsections based on markdown headers (## Section Title)
2. `parseSDLCDocument`: Parses a complete SDLC document into a structured format for GitHub Projects
3. `ensureDefaultSubsections`: Creates default subsections if none are found in the parsed document

### Key Features
- Intelligent parsing of markdown headers to create subsections
- Extraction of sections from comprehensive documents
- Fallback mechanisms for documents without clear section headers
- Default subsections for each document type to ensure minimum viable structure

## Testing
The parser has been tested with various document formats:
- Documents with clear markdown headers
- Comprehensive documents with multiple sections
- Documents without clear section headers
- Empty documents

## Results
With this fix, the GitHub Projects integration will now create properly formatted issues with:
- Meaningful titles based on section headers (e.g., "Business Analysis: Executive Summary")
- Detailed descriptions containing the section content
- Proper organization by category (functional spec, UX, technical, etc.)
- Appropriate labels, milestones, and epic assignments

## Usage
The parser is automatically used when creating GitHub Projects from the dashboard. No additional user action is required. 