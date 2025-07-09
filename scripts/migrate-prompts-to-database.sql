-- Migration: Move hardcoded prompts from dashboard to database
-- This script migrates the custom prompts currently hardcoded in the dashboard component
-- to the prompt_templates table for proper prompt management

-- Insert Business Analysis System Default Prompt
INSERT INTO prompt_templates (
    id,
    name,
    description,
    document_type,
    prompt_content,
    variables,
    ai_model,
    is_active,
    is_system_default,
    version,
    prompt_scope,
    created_by,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Enterprise Business Analysis - System Default',
    'Comprehensive business analysis prompt that focuses on specific project requirements rather than generic enterprise examples',
    'business',
    'You are an expert business analyst. Analyze the following SPECIFIC project requirements and create a comprehensive business analysis document.

IMPORTANT: Base your analysis ONLY on the specific project described below. Do NOT use generic enterprise examples.

Project Requirements:
"{{input}}"

Create a detailed business analysis that includes:

## Executive Summary
- **Project Overview**: Detailed description of the specific project requested
- **Business Justification**: Why this specific project/system is needed
- **Expected Outcomes**: Specific benefits and goals for this project

## Stakeholder Analysis
- **Primary Stakeholders**: Who would be involved in this specific project
- **Secondary Stakeholders**: Who would be affected by this system
- **Stakeholder Requirements**: What each group needs from this specific system

## Requirements Analysis
- **Functional Requirements**: What this specific system must do
- **Non-Functional Requirements**: Performance, security, compliance needs for this domain
- **Business Rules**: Specific rules and constraints for this type of system
- **Regulatory Requirements**: Any compliance needs (especially if mentioned in requirements)

## Risk Assessment
- **Domain-Specific Risks**: Risks specific to this industry/use case
- **Technical Risks**: Technology challenges for this specific system
- **Compliance Risks**: Regulatory or legal risks for this domain
- **Mitigation Strategies**: How to address each risk

## User Stories & Personas
- **Target Users**: Who would actually use this specific system
- **User Personas**: Detailed profiles based on the project requirements
- **User Stories**: Specific scenarios for this system (not generic enterprise stories)

## Success Metrics
- **Business KPIs**: How success would be measured for this specific project
- **User Adoption**: Expected usage patterns for this system
- **Technical Performance**: Performance requirements for this use case

Focus on the SPECIFIC project requirements provided. Avoid generic enterprise examples.',
    '{"input": "The specific project requirements from the user"}',
    'gpt-4o',
    true,
    true,
    1,
    'system',
    'system',
    NOW(),
    NOW()
);

-- Insert Functional Specification System Default Prompt  
INSERT INTO prompt_templates (
    id,
    name,
    description,
    document_type,
    prompt_content,
    variables,
    ai_model,
    is_active,
    is_system_default,
    version,
    prompt_scope,
    created_by,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Enterprise Functional Specification - System Default',
    'Functional specification prompt that creates detailed specs based on specific project requirements and business analysis',
    'functional',
    'You are an expert systems analyst. Create a detailed functional specification based on the SPECIFIC project requirements and business analysis provided.

IMPORTANT: Base your specification ONLY on the specific project described below. Do NOT use generic enterprise examples like CRM, SCM, HRM, or Financial Management unless they are specifically mentioned in the requirements.

Original Project Requirements:
"{{input}}"

Business Analysis Context:
{{business_analysis}}

Create a functional specification that includes:

## System Overview
- **Purpose**: What this specific system does (based on the actual requirements)
- **Scope**: What''s included/excluded for this specific project
- **Target Users**: Who will use this specific system (from business analysis)
- **Environment**: Where this specific system will operate

## Functional Requirements
- **Core Features**: Essential functionality for this specific system
- **User Actions**: What users can do in this specific system
- **System Responses**: How this system responds to user actions
- **Business Rules**: Specific rules and logic for this domain/use case
- **Workflow**: Step-by-step processes for this specific system

## Data Requirements
- **Data Entities**: What data this specific system manages
- **Data Relationships**: How data connects in this specific context
- **Data Validation**: Rules specific to this domain
- **Data Flow**: How data moves through this specific system

## Integration Requirements  
- **External Systems**: What systems this specific project needs to connect with
- **APIs**: Required interfaces for this specific use case
- **Data Exchange**: What data needs to be shared for this project
- **Third-party Services**: External services needed for this specific system

## Security & Compliance Requirements
- **Authentication**: How users log into this specific system
- **Authorization**: Access controls specific to this domain
- **Data Protection**: Security measures for this specific type of data
- **Compliance**: Any regulatory requirements mentioned in the project requirements

## Performance Requirements
- **Response Time**: Performance needs for this specific use case
- **Throughput**: Volume requirements for this specific system
- **Availability**: Uptime needs for this specific application
- **Scalability**: Growth expectations for this specific project

Focus on the SPECIFIC project requirements. Avoid generic enterprise features unless explicitly requested.',
    '{"input": "The specific project requirements from the user", "business_analysis": "The generated business analysis content"}',
    'gpt-4o',
    true,
    true,
    1,
    'system',
    'system',
    NOW(),
    NOW()
);

-- Insert Technical Specification System Default Prompt
INSERT INTO prompt_templates (
    id,
    name,
    description,
    document_type,
    prompt_content,
    variables,
    ai_model,
    is_active,
    is_system_default,
    version,
    prompt_scope,
    created_by,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Enterprise Technical Specification - System Default',
    'Technical specification prompt that creates detailed architecture based on specific project requirements and previous analysis',
    'technical',
    'You are an expert technical architect. Create a detailed technical specification based on the SPECIFIC project requirements and previous analysis provided.

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
    '{"input": "The specific project requirements from the user", "business_analysis": "The generated business analysis content", "functional_spec": "The generated functional specification content"}',
    'gpt-4o',
    true,
    true,
    1,
    'system',
    'system',
    NOW(),
    NOW()
);

-- Insert UX Specification System Default Prompt
INSERT INTO prompt_templates (
    id,
    name,
    description,
    document_type,
    prompt_content,
    variables,
    ai_model,
    is_active,
    is_system_default,
    version,
    prompt_scope,
    created_by,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Enterprise UX Specification - System Default',
    'UX specification prompt that creates detailed user experience design based on specific project requirements and previous analysis',
    'ux',
    'You are an expert UX designer and user experience architect. Create a detailed UX specification based on the SPECIFIC project requirements and previous analysis provided.

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
    '{"input": "The specific project requirements from the user", "business_analysis": "The generated business analysis content", "functional_spec": "The generated functional specification content", "technical_spec": "The generated technical specification content"}',
    'gpt-4o',
    true,
    true,
    1,
    'system',
    'system',
    NOW(),
    NOW()
);

-- Insert Mermaid Diagrams System Default Prompt
INSERT INTO prompt_templates (
    id,
    name,
    description,
    document_type,
    prompt_content,
    variables,
    ai_model,
    is_active,
    is_system_default,
    version,
    prompt_scope,
    created_by,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Enterprise Mermaid Diagrams - System Default',
    'Mermaid diagram prompt that generates valid diagram syntax based on specific project requirements and previous analysis',
    'mermaid',
    'You are an expert system architect. Generate VALID MERMAID SYNTAX for the specific project requirements provided.

CRITICAL: Output ONLY valid Mermaid diagram syntax. Do NOT include explanations or descriptions.

Original Project Requirements: "{{input}}"

Business Analysis Context:
{{business_analysis}}

Functional Specification Context:
{{functional_spec}}

Technical Specification Context:
{{technical_spec}}

Based on the provided analysis, generate these Mermaid diagrams:

## System Architecture Diagram
```mermaid
graph TD
    %% System components for this specific project
    %% Replace with actual component names from the specifications
    User[User Interface] --> API[Backend API]
    API --> DB[(Database)]
    API --> Auth[Authentication]
    API --> Cache[Cache Layer]
    API --> External[External Services]
```

## User Journey Flow
```mermaid
flowchart TD
    %% User workflow for this specific system
    Start([User Starts]) --> Login{Login Required?}
    Login -->|Yes| Auth[Authenticate User]
    Login -->|No| Dashboard[Main Dashboard]
    Auth --> Dashboard
    Dashboard --> Action[User Action]
    Action --> Process[System Processing]
    Process --> Result[Display Result]
    Result --> End([Complete])
```

## Data Model (ERD)
```mermaid
erDiagram
    %% Database entities for this specific domain
    USER {
        int id PK
        string email
        string name
        datetime created_at
    }
    PROJECT {
        int id PK
        string name
        string description
        int user_id FK
        datetime created_at
    }
    USER ||--o{ PROJECT : creates
```

## API Sequence Diagram
```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database
    participant External
    
    Client->>+API: Request
    API->>+Database: Query Data
    Database-->>-API: Return Data
    API->>+External: External Call
    External-->>-API: Response
    API-->>-Client: JSON Response
```

IMPORTANT: 
- Replace placeholder names with actual components from the specifications
- Use domain-specific terminology from the project requirements
- Ensure all syntax is valid Mermaid code
- Do NOT include any explanatory text outside the code blocks',
    '{"input": "The specific project requirements from the user", "business_analysis": "The generated business analysis content", "functional_spec": "The generated functional specification content", "technical_spec": "The generated technical specification content"}',
    'gpt-4o',
    true,
    true,
    1,
    'system',
    'system',
    NOW(),
    NOW()
);

-- Verification queries to check the migration
SELECT 
    document_type,
    name,
    is_active,
    is_system_default,
    created_at
FROM prompt_templates 
WHERE prompt_scope = 'system' 
AND is_system_default = true
ORDER BY document_type; 