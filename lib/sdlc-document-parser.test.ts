/**
 * Test file for SDLC Document Parser
 * Run with: npx ts-node lib/sdlc-document-parser.test.ts
 */

import { parseDocumentSections, parseSDLCDocument, ensureDefaultSubsections } from './sdlc-document-parser';

// Test document with markdown headers
const testDocument = `
# Main Title

Some introduction text

## Executive Summary

This is the executive summary section.
It has multiple lines.

## Requirements Analysis

This section contains requirements.
- Requirement 1
- Requirement 2

## Risk Assessment

Risk assessment content.
`;

// Test comprehensive document
const comprehensiveDocument = `
# Business Analysis

## Executive Summary
Business executive summary

## Stakeholder Analysis
Stakeholder details

# Functional Specification

## System Overview
System overview details

## Functional Requirements
Functional requirements list

# Technical Specification

## System Architecture
Architecture diagram and explanation

## Technology Stack
Technology stack details
`;

console.log('Testing parseDocumentSections...');
const sections = parseDocumentSections(testDocument);
console.log('Parsed sections:', sections);
console.log('Number of sections:', Object.keys(sections).length);
console.log('Section keys:', Object.keys(sections));

console.log('\nTesting parseSDLCDocument...');
const parsedSDLC = parseSDLCDocument({
  comprehensive: comprehensiveDocument
});
console.log('Parsed SDLC document structure:');
console.log('Business Analysis sections:', Object.keys(parsedSDLC.businessAnalysis));
console.log('Functional Spec sections:', Object.keys(parsedSDLC.functionalSpec));
console.log('Technical Spec sections:', Object.keys(parsedSDLC.technicalSpec));

console.log('\nTesting ensureDefaultSubsections...');
const emptyDocument = {
  businessAnalysis: {},
  functionalSpec: {},
  technicalSpec: {},
  metadata: {
    generationTime: Date.now(),
    sectionsGenerated: 3
  }
};
const documentWithDefaults = ensureDefaultSubsections(emptyDocument);
console.log('Document with defaults:');
console.log('Business Analysis sections:', Object.keys(documentWithDefaults.businessAnalysis));
console.log('Functional Spec sections:', Object.keys(documentWithDefaults.functionalSpec));
console.log('Technical Spec sections:', Object.keys(documentWithDefaults.technicalSpec));

console.log('\nAll tests completed!'); 