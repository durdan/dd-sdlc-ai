-- Fix remaining system default prompts with proper JSON syntax

-- Update Technical Specification system default
UPDATE prompt_templates SET
    name = 'Enterprise Technical Specification - System Default (Updated)',
    description = 'Technical specification prompt that creates detailed architecture based on specific project requirements and previous analysis',
    prompt_content = 'You are an expert technical architect. Create a detailed technical specification based on the SPECIFIC project requirements and previous analysis provided.

IMPORTANT: Base your specification ONLY on the specific project described below. Do NOT use generic enterprise architecture unless specifically mentioned in the requirements.

Original Project Requirements:
"{{input}}"

Business Analysis Context:
{{business_analysis}}

Functional Specification Context:
{{functional_spec}}

Create a technical specification that includes:

## System Architecture
- **Architecture Pattern**: Design pattern suitable for this specific system
- **Components**: System components needed for this specific project
- **Data Flow**: How data moves through this specific system
- **Technology Stack**: Languages, frameworks, databases appropriate for this use case

## Database Design
- **Data Model**: Entity relationships for this specific domain
- **Schema Design**: Table structures needed for this specific system
- **Indexing Strategy**: Performance optimization for this specific use case
- **Data Migration**: Upgrade procedures for this specific project

## API Design
- **REST Endpoints**: API specifications for this specific system
- **Request/Response**: Data formats for this specific use case
- **Authentication**: Security mechanisms appropriate for this domain
- **Rate Limiting**: Usage controls for this specific system

## Security Implementation
- **Authentication System**: Login mechanisms for this specific system
- **Authorization Controls**: Access permissions for this specific domain
- **Data Encryption**: Protection methods for this specific type of data
- **Compliance**: Any regulatory requirements mentioned in the original requirements

## Performance Specifications
- **Response Times**: Latency requirements for this specific use case
- **Throughput**: Transaction volumes for this specific system
- **Scalability Plan**: Growth handling for this specific project
- **Caching Strategy**: Performance optimization for this specific domain

## Deployment Strategy
- **Infrastructure**: Server requirements for this specific system
- **Environment Setup**: Dev/Test/Prod for this specific project
- **CI/CD Pipeline**: Automated deployment for this specific codebase
- **Monitoring**: Health checks and alerts for this specific system

Focus on the SPECIFIC project requirements and domain. Avoid generic enterprise architecture unless explicitly requested.',
    variables = '{"input": "The specific project requirements from the user", "business_analysis": "The generated business analysis content", "functional_spec": "The generated functional specification content"}',
    version = version + 1,
    updated_at = NOW()
WHERE document_type = 'technical' 
AND prompt_scope = 'system' 
AND is_system_default = true;

-- Update UX Specification system default
UPDATE prompt_templates SET
    name = 'Enterprise UX Specification - System Default (Updated)',
    description = 'UX specification prompt that creates detailed user experience design based on specific project requirements and previous analysis',
    prompt_content = 'You are an expert UX designer and user experience architect. Create a detailed UX specification based on the SPECIFIC project requirements and previous analysis provided.

IMPORTANT: Base your UX design ONLY on the specific project described below. Do NOT use generic enterprise UX patterns unless specifically mentioned in the requirements.

Original Project Requirements:
"{{input}}"

Business Analysis Context:
{{business_analysis}}

Functional Specification Context:
{{functional_spec}}

Technical Specification Context:
{{technical_spec}}

Create a UX specification that includes:

## User Research & Analysis
- **Target Users**: Who will use this specific system (from business analysis)
- **User Goals**: What users want to accomplish with this specific system
- **Pain Points**: Current problems this specific system solves
- **User Journey**: How users will interact with this specific system

## Information Architecture
- **Content Structure**: How information is organized for this specific domain
- **Navigation System**: How users move through this specific system
- **User Flow**: Step-by-step paths for this specific use case
- **Content Strategy**: Information presentation for this specific domain

## Interface Design
- **UI Components**: Interface elements needed for this specific system
- **Layout Patterns**: Screen organization for this specific use case
- **Interaction Patterns**: User interactions specific to this domain
- **Visual Hierarchy**: Information prioritization for this specific system

## Accessibility & Usability
- **Accessibility Standards**: Requirements for this specific user base
- **Responsive Design**: Device support for this specific system
- **Performance Requirements**: UX performance needs for this specific domain
- **Error Handling**: User-friendly error management for this specific use case

## Design System
- **Style Guide**: Visual standards for this specific brand/domain
- **Component Library**: Reusable UI components for this specific system
- **Design Tokens**: Consistent styling for this specific project
- **Documentation**: Design guidelines for this specific system

Focus on the SPECIFIC project requirements and user needs. Avoid generic enterprise UX unless explicitly requested.',
    variables = '{"input": "The specific project requirements from the user", "business_analysis": "The generated business analysis content", "functional_spec": "The generated functional specification content", "technical_spec": "The generated technical specification content"}',
    version = version + 1,
    updated_at = NOW()
WHERE document_type = 'ux' 
AND prompt_scope = 'system' 
AND is_system_default = true;

-- Show final status
SELECT 
    document_type,
    name,
    version,
    updated_at
FROM prompt_templates 
WHERE prompt_scope = 'system' 
AND is_system_default = true
ORDER BY document_type; 