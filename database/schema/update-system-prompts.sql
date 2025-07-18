-- Simple migration to update existing system default prompts
-- This avoids constraint issues by just updating existing records

-- Show current system defaults
\echo 'Current system default prompts:'
SELECT document_type, name, version, updated_at 
FROM prompt_templates 
WHERE prompt_scope = 'system' AND is_system_default = true
ORDER BY document_type;

-- Update Business Analysis system default
UPDATE prompt_templates SET
    name = 'Enterprise Business Analysis - System Default (Updated)',
    description = 'Comprehensive business analysis prompt that focuses on specific project requirements rather than generic enterprise examples',
    prompt_content = 'You are an expert business analyst. Analyze the following SPECIFIC project requirements and create a comprehensive business analysis document.

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
    variables = '{"input": "The specific project requirements from the user"}',
    version = version + 1,
    updated_at = NOW()
WHERE document_type = 'business' 
AND prompt_scope = 'system' 
AND is_system_default = true;

-- Update Functional Specification system default
UPDATE prompt_templates SET
    name = 'Enterprise Functional Specification - System Default (Updated)',
    description = 'Functional specification prompt that creates detailed specs based on specific project requirements and business analysis',
    prompt_content = 'You are an expert systems analyst. Create a detailed functional specification based on the SPECIFIC project requirements and business analysis provided.

IMPORTANT: Base your specification ONLY on the specific project described below. Do NOT use generic enterprise examples like CRM, SCM, HRM, or Financial Management unless they are specifically mentioned in the requirements.

Original Project Requirements:
"{{input}}"

Business Analysis Context:
{{business_analysis}}

Create a functional specification that includes:

## System Overview
- **Purpose**: What this specific system does (based on the actual requirements)
- **Scope**: What is included/excluded for this specific project
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
    variables = '{"input": "The specific project requirements from the user", "business_analysis": "The generated business analysis content"}',
    version = version + 1,
    updated_at = NOW()
WHERE document_type = 'functional' 
AND prompt_scope = 'system' 
AND is_system_default = true;

-- Update Mermaid system default (most important fix for syntax issue)
UPDATE prompt_templates SET
    name = 'Enterprise Mermaid Diagrams - System Default (Updated)',
    description = 'Mermaid diagram prompt that generates valid diagram syntax based on specific project requirements and previous analysis',
    prompt_content = 'You are an expert system architect. Generate VALID MERMAID SYNTAX for the specific project requirements provided.

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
    variables = '{"input": "The specific project requirements from the user", "business_analysis": "The generated business analysis content", "functional_spec": "The generated functional specification content", "technical_spec": "The generated technical specification content"}',
    version = version + 1,
    updated_at = NOW()
WHERE document_type = 'mermaid' 
AND prompt_scope = 'system' 
AND is_system_default = true;

-- Show updated results
\echo 'Updated system default prompts:'
SELECT document_type, name, version, updated_at 
FROM prompt_templates 
WHERE prompt_scope = 'system' AND is_system_default = true
ORDER BY document_type; 