/**
 * Enhanced Prompt Template Manager
 * Handles template loading, uploading, validation, and variable guidance
 */

import { promptValidationService, type PromptVariable, type ValidationResult } from './prompt-validation'
import { createClient } from '@/lib/supabase/client'

export interface PromptTemplate {
  id: string
  name: string
  description: string
  document_type: string
  prompt_content: string
  variables: Record<string, any>
  ai_model: string
  is_active: boolean
  is_system_default?: boolean
  is_personal_default?: boolean
  version: number
  prompt_scope: 'system' | 'user'
  user_id?: string
  created_by: string
  created_at: string
  updated_at: string
  category?: string
  tags?: string[]
  usage_count?: number
  success_rate?: number
  author?: string
  license?: string
}

export interface TemplateMetadata {
  name: string
  description: string
  author: string
  version: string
  documentType: string
  category: string
  tags: string[]
  license: string
  requiredVariables: PromptVariable[]
  optionalVariables: PromptVariable[]
  examples: TemplateExample[]
  bestPractices: string[]
  warnings: string[]
}

export interface TemplateExample {
  title: string
  description: string
  variables: Record<string, any>
  expectedOutput: string
}

export interface TemplateBundle {
  metadata: TemplateMetadata
  content: string
  validationResult: ValidationResult
}

export interface TemplateLibraryItem {
  id: string
  name: string
  description: string
  category: string
  documentType: string
  author: string
  rating: number
  downloads: number
  tags: string[]
  preview: string
  isOfficial: boolean
  isPremium: boolean
  requiredVariables: string[]
  optionalVariables: string[]
}

export class PromptTemplateManager {
  private supabase = createClient()

  // Enhanced template library with comprehensive templates
  private readonly templateLibrary: Record<string, TemplateBundle> = {
    // System Default Templates (matching hardcoded fallback prompts)
    'business-default': {
      metadata: {
        name: 'System Default - Business Analysis',
        description: 'Default business analysis template used by the system when no custom prompt is available',
        author: 'System',
        version: '1.0',
        documentType: 'business',
        category: 'System Default',
        tags: ['default', 'business', 'analysis', 'stakeholder'],
        license: 'MIT',
        requiredVariables: [
          {
            name: 'input',
            type: 'string',
            required: true,
            description: 'Project requirements and objectives',
            validation: { minLength: 50, maxLength: 5000 }
          }
        ],
        optionalVariables: [],
        examples: [
          {
            title: 'Task Management App',
            description: 'Business analysis for a task management application',
            variables: {
              input: 'Build a task management application for small teams with project tracking, time logging, and team collaboration features.'
            },
            expectedOutput: 'Comprehensive business analysis with stakeholder analysis, requirements, and success metrics'
          }
        ],
        bestPractices: [
          'Provide detailed project context in the input field',
          'Include specific business objectives and constraints',
          'Mention target audience and user types'
        ],
        warnings: [
          'Ensure input contains sufficient detail for meaningful analysis'
        ]
      },
      content: `You are an expert business analyst. Analyze the following project requirements and create a comprehensive business analysis document.

Project Requirements:
{{input}}

Create a business analysis that includes:

## Executive Summary
- **Project Overview**: [Brief description]
- **Business Justification**: [Why this project matters]
- **Expected Outcomes**: [What success looks like]

## Stakeholder Analysis
- **Primary Stakeholders**: [Key decision makers]
- **Secondary Stakeholders**: [Affected parties]
- **Stakeholder Interests**: [What each group cares about]

## Requirements Analysis
- **Functional Requirements**: [What the system must do]
- **Non-Functional Requirements**: [Performance, security, usability]
- **Business Rules**: [Constraints and policies]
- **Assumptions**: [What we're assuming to be true]

## Risk Assessment
- **Technical Risks**: [Technology-related concerns]
- **Business Risks**: [Market, financial, operational risks]
- **Mitigation Strategies**: [How to address each risk]

## User Stories & Acceptance Criteria
- **Epic**: [High-level feature description]
- **User Stories**: [Specific user needs in "As a... I want... So that..." format]
- **Acceptance Criteria**: [Testable conditions for completion]

## Personas & User Types
- **Primary Users**: [List main user types]
- **Secondary Users**: [Supporting user types]
- **Admin Users**: [Administrative roles]

## Success Metrics
- **User Adoption**: [Specific metrics]
- **Business Impact**: [ROI/KPI targets]
- **Technical Performance**: [Performance benchmarks]

Focus on creating 5-8 user stories that are:
- Independent and deliverable
- Testable with clear acceptance criteria
- Properly sized for sprint planning
- Aligned with business objectives

Format the response in markdown with clear headings and structured sections.`,
      validationResult: {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        extractedVariables: []
      }
    },

    'functional-default': {
      metadata: {
        name: 'System Default - Functional Specification',
        description: 'Default functional specification template used by the system',
        author: 'System',
        version: '1.0',
        documentType: 'functional',
        category: 'System Default',
        tags: ['default', 'functional', 'requirements', 'specification'],
        license: 'MIT',
        requiredVariables: [
          {
            name: 'input',
            type: 'string',
            required: true,
            description: 'Original project requirements',
            validation: { minLength: 50, maxLength: 8000 }
          },
          {
            name: 'business_analysis',
            type: 'string',
            required: true,
            description: 'Business analysis document',
            validation: { minLength: 100, maxLength: 10000 }
          }
        ],
        optionalVariables: [],
        examples: [
          {
            title: 'Task Management Functional Spec',
            description: 'Functional specification based on business analysis',
            variables: {
              input: 'Build a task management application...',
              business_analysis: 'The business analysis shows need for team collaboration...'
            },
            expectedOutput: 'Detailed functional requirements with acceptance criteria'
          }
        ],
        bestPractices: [
          'Reference the business analysis for context',
          'Include specific acceptance criteria for each requirement',
          'Organize requirements by functional area'
        ],
        warnings: [
          'Ensure business analysis input is complete and detailed'
        ]
      },
      content: `As a Senior Business Analyst with expertise in requirements engineering, create a detailed functional specification based on the business analysis:

Original Input: {{input}}
Business Analysis: {{business_analysis}}

Generate the following structured output:

## Functional Overview
- **System Purpose**: [Clear description of what the system does]
- **Key Capabilities**: [Main functional areas]
- **Success Criteria**: [Measurable outcomes]

## Detailed Functional Requirements
For each functional area, provide:
1. **Requirement ID**: [Unique identifier]
2. **Requirement Title**: [Clear, descriptive title]
3. **Description**: [Detailed functional behavior]
4. **Acceptance Criteria**: [Specific, testable criteria]
5. **Priority**: [Must Have/Should Have/Could Have]
6. **Dependencies**: [Related requirements]

## System Capabilities
### Core Functions
- User management and authentication
- Data processing and storage
- Business logic implementation
- Reporting and analytics

### Integration Requirements
- External API integrations
- Third-party service connections
- Data import/export capabilities
- System interoperability

### Performance Requirements
- Response time specifications
- Throughput requirements
- Scalability targets
- Availability requirements

### Security Requirements
- Authentication mechanisms
- Authorization controls
- Data protection measures
- Compliance requirements

## Data Requirements
- **Data Entities**: [Key data objects]
- **Data Relationships**: [How data connects]
- **Data Validation**: [Quality requirements]
- **Data Lifecycle**: [Creation, update, deletion rules]

## User Interface Requirements
- **User Experience**: [UX principles]
- **Accessibility**: [WCAG compliance]
- **Responsive Design**: [Device compatibility]
- **Navigation**: [User flow requirements]

Ensure all requirements are:
- Specific and measurable
- Testable and verifiable
- Aligned with business objectives
- Technically feasible

Format the response in markdown with clear headings and structured sections.`,
      validationResult: {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        extractedVariables: []
      }
    },

    'technical-default': {
      metadata: {
        name: 'System Default - Technical Specification',
        description: 'Default technical specification template used by the system',
        author: 'System',
        version: '1.0',
        documentType: 'technical',
        category: 'System Default',
        tags: ['default', 'technical', 'architecture', 'development'],
        license: 'MIT',
        requiredVariables: [
          {
            name: 'functional_spec',
            type: 'string',
            required: true,
            description: 'Functional specification document',
            validation: { minLength: 100, maxLength: 10000 }
          },
          {
            name: 'business_analysis',
            type: 'string',
            required: true,
            description: 'Business analysis document',
            validation: { minLength: 100, maxLength: 10000 }
          }
        ],
        optionalVariables: [],
        examples: [
          {
            title: 'Task Management Technical Spec',
            description: 'Technical specification for task management system',
            variables: {
              functional_spec: 'The functional specification defines user management, task creation...',
              business_analysis: 'The business analysis shows need for scalable team collaboration...'
            },
            expectedOutput: 'Detailed technical architecture and development tasks'
          }
        ],
        bestPractices: [
          'Reference functional requirements for each technical task',
          'Include specific technology recommendations',
          'Provide clear development task breakdown'
        ],
        warnings: [
          'Ensure functional specification is complete before creating technical spec'
        ]
      },
      content: `As a Senior Software Architect with 10+ years of full-stack development experience, break down the following functional requirements into specific development tasks:

Functional Requirements: {{functional_spec}}
Business Analysis: {{business_analysis}}

Generate the following structured output:

## Technical Epic
- **Epic Title**: [Technical implementation focus]
- **Technical Approach**: [Architecture pattern/approach]
- **Technology Stack**: [Specific technologies]

## Development Tasks
For each task, provide:
1. **Task Title**: Clear, action-oriented (e.g., "Implement user authentication API")
2. **Task Description**: Technical implementation details
3. **Acceptance Criteria**: Technical completion criteria
4. **Story Points**: Effort estimate (1, 2, 3, 5, 8)
5. **Components**: Frontend/Backend/Database/DevOps
6. **Dependencies**: Technical prerequisites
7. **Definition of Done**: Code quality, testing, documentation requirements

## Task Categories:
### Backend Development
- API endpoint implementation
- Database schema design
- Business logic implementation
- Authentication/authorization
- Data validation and processing

### Frontend Development
- UI component development
- State management
- API integration
- Form handling and validation
- Responsive design implementation

### Infrastructure & DevOps
- Database setup and configuration
- CI/CD pipeline setup
- Environment configuration
- Monitoring and logging
- Security implementation

### Testing & Quality Assurance
- Unit test implementation
- Integration test setup
- End-to-end test scenarios
- Performance testing
- Security testing

## Technical Debt & Improvements
- Code refactoring opportunities
- Performance optimizations
- Security enhancements
- Documentation updates

Create 8-12 specific, actionable development tasks that are:
- Technically detailed and implementable
- Properly estimated for sprint planning
- Categorized by development area
- Include clear technical acceptance criteria

Architecture Pattern: Microservices
Cloud Platform: AWS
Database Type: Relational
Security Level: Enterprise`,
      validationResult: {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        extractedVariables: []
      }
    },

    'ux-default': {
      metadata: {
        name: 'System Default - UX Specification',
        description: 'Default UX specification template used by the system',
        author: 'System',
        version: '1.0',
        documentType: 'ux',
        category: 'System Default',
        tags: ['default', 'ux', 'design', 'user-experience'],
        license: 'MIT',
        requiredVariables: [
          {
            name: 'business_analysis',
            type: 'string',
            required: true,
            description: 'Business analysis document',
            validation: { minLength: 100, maxLength: 8000 }
          }
        ],
        optionalVariables: [
          {
            name: 'functional_spec',
            type: 'string',
            required: false,
            description: 'Functional specification document',
            validation: { maxLength: 8000 }
          },
          {
            name: 'technical_spec',
            type: 'string',
            required: false,
            description: 'Technical specification document',
            validation: { maxLength: 8000 }
          }
        ],
        examples: [
          {
            title: 'Task Management UX Spec',
            description: 'UX specification for task management application',
            variables: {
              business_analysis: 'The business analysis shows need for intuitive team collaboration...'
            },
            expectedOutput: 'Comprehensive UX design tasks and deliverables'
          }
        ],
        bestPractices: [
          'Focus on user needs and pain points from business analysis',
          'Include accessibility considerations',
          'Provide specific design deliverables'
        ],
        warnings: [
          'Ensure business analysis includes user personas and requirements'
        ]
      },
      content: `As a Senior UX Designer with expertise in user-centered design, create specific design tasks based on the following requirements:

User Stories: {{business_analysis}}
Business Analysis: {{business_analysis}}

Generate the following structured output:

## UX Epic
- **Epic Title**: [User experience focus]
- **Design Approach**: [Design methodology]
- **Success Metrics**: [User experience KPIs]

## Design Tasks
For each task, provide:
1. **Task Title**: Clear design deliverable (e.g., "Create user onboarding wireframes")
2. **Task Description**: Design scope and requirements
3. **Deliverables**: Specific design artifacts
4. **Story Points**: Design effort estimate (1, 2, 3, 5, 8)
5. **User Impact**: How this improves user experience
6. **Dependencies**: Design prerequisites
7. **Definition of Done**: Design completion criteria

## Design Task Categories:
### Research & Discovery
- User research and interviews
- Competitive analysis
- User journey mapping
- Persona development
- Usability testing

### Information Architecture
- Site map creation
- User flow diagrams
- Content strategy
- Navigation design
- Information hierarchy

### Visual Design
- Wireframe creation
- Mockup development
- Visual style guide
- Component library
- Icon and illustration design

### Prototyping & Testing
- Interactive prototype development
- Usability testing sessions
- A/B test setup
- Accessibility review
- Design system documentation

Create 6-10 specific design tasks that are:
- User-focused and experience-driven
- Deliverable-based with clear outcomes
- Properly scoped for design sprints
- Include user validation methods

Target Devices: Desktop, Mobile, Tablet
Design System: Material Design
User Experience Level: Intermediate
Accessibility Standard: WCAG 2.1 AA

Focus on usability and accessibility and ensure the design supports efficient task completion.`,
      validationResult: {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        extractedVariables: []
      }
    },

    'mermaid-default': {
      metadata: {
        name: 'System Default - Mermaid Diagrams',
        description: 'Default Mermaid diagram template used by the system',
        author: 'System',
        version: '1.0',
        documentType: 'mermaid',
        category: 'System Default',
        tags: ['default', 'mermaid', 'diagrams', 'architecture'],
        license: 'MIT',
        requiredVariables: [
          {
            name: 'technical_spec',
            type: 'string',
            required: true,
            description: 'Technical specification document',
            validation: { minLength: 100, maxLength: 5000 }
          }
        ],
        optionalVariables: [
          {
            name: 'functional_spec',
            type: 'string',
            required: false,
            description: 'Functional specification document',
            validation: { maxLength: 5000 }
          },
          {
            name: 'business_analysis',
            type: 'string',
            required: false,
            description: 'Business analysis document',
            validation: { maxLength: 5000 }
          }
        ],
        examples: [
          {
            title: 'System Architecture Diagrams',
            description: 'Mermaid diagrams for system architecture',
            variables: {
              technical_spec: 'The technical specification outlines a microservices architecture...'
            },
            expectedOutput: 'Professional Mermaid diagrams showing system architecture'
          }
        ],
        bestPractices: [
          'Use appropriate diagram types for the content',
          'Keep diagrams simple and focused',
          'Include clear labels and relationships'
        ],
        warnings: [
          'Ensure technical specification contains architectural details'
        ]
      },
      content: `As a Senior System Architect with expertise in technical documentation, create comprehensive Mermaid diagrams based on the following specifications:

Technical Specification: {{technical_spec}}
{{#if functional_spec}}Functional Specification: {{functional_spec}}{{/if}}
{{#if business_analysis}}Business Analysis: {{business_analysis}}{{/if}}

Generate the following structured Mermaid diagrams:

## System Architecture Diagram
\`\`\`mermaid
graph TD
    %% Create a high-level system architecture diagram
    %% Include: Frontend, Backend, Database, External Services
    %% Show data flow and component relationships
    Frontend["Frontend Application"]
    Backend["Backend API"]
    Database["Database"]
    Auth["Authentication Service"]
    Cache["Cache Layer"]
    
    Frontend --> Backend
    Backend --> Database
    Backend --> Auth
    Backend --> Cache
\`\`\`

## Database Schema Diagram
\`\`\`mermaid
erDiagram
    %% Create entity relationship diagram
    %% Include: Tables, relationships, key fields
    %% Show primary keys, foreign keys, and constraints
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
\`\`\`

## User Flow Diagram
\`\`\`mermaid
flowchart TD
    %% Create user journey flowchart
    %% Include: User actions, decision points, system responses
    %% Show happy path and error handling
    Start(["User Starts"]) --> Login{"Login Required?"}
    Login -->|Yes| Auth["Authenticate"]
    Login -->|No| Dashboard["Dashboard"]
    Auth --> Dashboard
    Dashboard --> Action["User Action"]
    Action --> Success["Success"]
    Action --> Error["Error Handling"]
\`\`\`

## API Flow Diagram
\`\`\`mermaid
sequenceDiagram
    %% Create API interaction sequence
    %% Include: Client, Server, Database interactions
    %% Show request/response flow and error handling
    participant Client
    participant API
    participant Database
    
    Client->>API: Request
    API->>Database: Query
    Database-->>API: Response
    API-->>Client: JSON Response
\`\`\`

Ensure diagrams are:
- Technically accurate and detailed
- Easy to understand and well-labeled
- Include proper Mermaid syntax
- Show realistic system interactions
- Include error handling and edge cases

Diagram Style: Professional
Complexity Level: Detailed
Focus Area: System Architecture`,
      validationResult: {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        extractedVariables: []
      }
    },

    'sdlc-business-default': {
      metadata: {
        name: 'System Default - SDLC Business Analysis',
        description: 'Default business analysis template used in SDLC generation',
        author: 'System',
        version: '1.0',
        documentType: 'business',
        category: 'SDLC Default',
        tags: ['default', 'sdlc', 'business', 'analysis'],
        license: 'MIT',
        requiredVariables: [
          {
            name: 'input',
            type: 'string',
            required: true,
            description: 'Business case description',
            validation: { minLength: 100, maxLength: 15000 }
          }
        ],
        optionalVariables: [],
        examples: [
          {
            title: 'SDLC Business Case',
            description: 'Business analysis for SDLC documentation',
            variables: {
              input: 'Develop a comprehensive project management platform for enterprise teams...'
            },
            expectedOutput: 'Structured business analysis for SDLC process'
          }
        ],
        bestPractices: [
          'Provide comprehensive business case description',
          'Include timeline and resource estimates',
          'Focus on business objectives and success criteria'
        ],
        warnings: [
          'Ensure business case is detailed enough for full SDLC documentation'
        ]
      },
      content: `As a senior business analyst, analyze the following business case and provide a comprehensive business analysis:

Business Case: {{input}}

Please provide:
1. Executive Summary
2. Business Objectives
3. Stakeholder Analysis
4. Success Criteria
5. Risk Assessment
6. Timeline Estimates
7. Resource Requirements

Format the response in markdown with clear headings and structure.`,
      validationResult: {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        extractedVariables: []
      }
    },

    // Advanced Templates
    'business-comprehensive': {
      metadata: {
        name: 'Comprehensive Business Analysis',
        description: 'Complete business analysis template with stakeholder mapping and risk assessment',
        author: 'System',
        version: '2.0',
        documentType: 'business',
        category: 'Analysis',
        tags: ['comprehensive', 'stakeholder', 'risk', 'requirements'],
        license: 'MIT',
        requiredVariables: [
          {
            name: 'input',
            type: 'string',
            required: true,
            description: 'Detailed project requirements and objectives',
            validation: { minLength: 50, maxLength: 5000 }
          }
        ],
        optionalVariables: [
          {
            name: 'stakeholders',
            type: 'string',
            required: false,
            description: 'Key stakeholders and their roles',
            validation: { maxLength: 1000 }
          },
          {
            name: 'budget',
            type: 'string',
            required: false,
            description: 'Budget constraints and financial considerations',
            validation: { maxLength: 500 }
          },
          {
            name: 'timeline',
            type: 'string',
            required: false,
            description: 'Project timeline and key milestones',
            validation: { maxLength: 500 }
          },
          {
            name: 'industry',
            type: 'string',
            required: false,
            description: 'Industry context and domain-specific considerations',
            validation: { maxLength: 300 }
          },
          {
            name: 'compliance',
            type: 'string',
            required: false,
            description: 'Regulatory and compliance requirements',
            validation: { maxLength: 800 }
          }
        ],
        examples: [
          {
            title: 'E-commerce Platform',
            description: 'Business analysis for a new e-commerce platform',
            variables: {
              input: 'Build a modern e-commerce platform for small businesses with inventory management, payment processing, and customer analytics.',
              stakeholders: 'Small business owners, customers, payment processors, logistics partners',
              budget: '$100,000 - $150,000',
              timeline: '6 months development, 2 months testing',
              industry: 'E-commerce, Retail Technology'
            },
            expectedOutput: 'Comprehensive business analysis with market analysis, user personas, feature prioritization, and implementation roadmap'
          }
        ],
        bestPractices: [
          'Provide detailed project context in the input field',
          'Include specific stakeholder roles and interests',
          'Mention budget constraints early for realistic recommendations',
          'Specify timeline constraints to prioritize features appropriately'
        ],
        warnings: [
          'Ensure input contains sufficient detail for meaningful analysis',
          'Consider regulatory requirements in your industry context'
        ]
      },
      content: `# Business Analysis: {{input}}

## Project Overview
Analyze the following project requirements and provide a comprehensive business analysis:

**Project Description:** {{input}}

{{#if stakeholders}}
**Key Stakeholders:** {{stakeholders}}
{{/if}}

{{#if budget}}
**Budget Constraints:** {{budget}}
{{/if}}

{{#if timeline}}
**Timeline:** {{timeline}}
{{/if}}

{{#if industry}}
**Industry Context:** {{industry}}
{{/if}}

{{#if compliance}}
**Compliance Requirements:** {{compliance}}
{{/if}}

## Required Analysis

### 1. Executive Summary
- **Project Vision**: [Clear, concise project vision]
- **Business Justification**: [Why this project is needed]
- **Expected ROI**: [Quantifiable return on investment]
- **Success Metrics**: [How success will be measured]

### 2. Stakeholder Analysis
- **Primary Stakeholders**: [Decision makers and key influencers]
- **Secondary Stakeholders**: [Affected parties and users]
- **Stakeholder Interests**: [What each group wants to achieve]
- **Potential Conflicts**: [Areas of disagreement or competing interests]

### 3. Market & Competitive Analysis
- **Market Size**: [Target market size and growth potential]
- **Competitive Landscape**: [Key competitors and their strengths/weaknesses]
- **Market Positioning**: [How this project will differentiate]
- **Market Trends**: [Relevant industry trends and opportunities]

### 4. Requirements Analysis
- **Functional Requirements**: [What the system must do]
  - Core Features (Must-Have)
  - Enhanced Features (Should-Have)
  - Future Features (Could-Have)
- **Non-Functional Requirements**: [Performance, security, usability]
- **Business Rules**: [Constraints and policies]
- **Integration Requirements**: [External system connections]

### 5. Risk Assessment
- **Technical Risks**: [Technology-related concerns and mitigation]
- **Business Risks**: [Market, financial, operational risks]
- **Resource Risks**: [Team, budget, timeline risks]
- **External Risks**: [Regulatory, competitive, economic factors]
- **Mitigation Strategies**: [Specific actions to address each risk]

### 6. User Analysis
- **Primary User Personas**: [Detailed user profiles with goals and pain points]
- **User Journey Mapping**: [How users will interact with the solution]
- **User Acceptance Criteria**: [What users need for success]

### 7. Business Model & Revenue
- **Revenue Streams**: [How the project will generate value]
- **Cost Structure**: [Ongoing operational costs]
- **Pricing Strategy**: [How pricing will be determined]
- **Financial Projections**: [Revenue and cost forecasts]

### 8. Implementation Strategy
- **Phase 1 (MVP)**: [Minimum viable product features]
- **Phase 2 (Growth)**: [Expansion features]
- **Phase 3 (Scale)**: [Advanced features and optimization]
- **Resource Requirements**: [Team, technology, budget needs]

### 9. Success Metrics & KPIs
- **User Adoption**: [Specific user metrics]
- **Business Impact**: [Revenue, cost savings, efficiency gains]
- **Technical Performance**: [System performance benchmarks]
- **Customer Satisfaction**: [User satisfaction measures]

### 10. Recommendations
- **Priority Actions**: [Immediate next steps]
- **Resource Allocation**: [Recommended team structure]
- **Technology Choices**: [Recommended technology stack]
- **Timeline Recommendations**: [Suggested project phases]

## Deliverables Summary
1. **Business Requirements Document** (This analysis)
2. **Stakeholder Communication Plan**
3. **Risk Register and Mitigation Plan**
4. **User Persona Profiles**
5. **Project Charter and Scope Statement**

---
*This analysis should be reviewed with key stakeholders and updated based on their feedback before proceeding to functional specification.*`,
      validationResult: {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        extractedVariables: []
      }
    },

    'technical-microservices': {
      metadata: {
        name: 'Microservices Technical Specification',
        description: 'Technical specification template for microservices architecture',
        author: 'System',
        version: '2.0',
        documentType: 'technical',
        category: 'Architecture',
        tags: ['microservices', 'architecture', 'scalability', 'cloud'],
        license: 'MIT',
        requiredVariables: [
          {
            name: 'input',
            type: 'string',
            required: true,
            description: 'Functional requirements and system specifications',
            validation: { minLength: 100, maxLength: 10000 }
          }
        ],
        optionalVariables: [
          {
            name: 'technology',
            type: 'string',
            required: false,
            description: 'Preferred technology stack and frameworks',
            validation: { maxLength: 1000 }
          },
          {
            name: 'scalability',
            type: 'string',
            required: false,
            description: 'Scalability requirements and expected load',
            validation: { maxLength: 800 }
          },
          {
            name: 'security',
            type: 'string',
            required: false,
            description: 'Security requirements and compliance needs',
            validation: { maxLength: 1000 }
          },
          {
            name: 'integrations',
            type: 'string',
            required: false,
            description: 'External system integrations and APIs',
            validation: { maxLength: 800 }
          }
        ],
        examples: [
          {
            title: 'E-commerce Microservices',
            description: 'Technical spec for e-commerce microservices platform',
            variables: {
              input: 'Design a microservices architecture for an e-commerce platform with user management, product catalog, order processing, payment, and inventory services.',
              technology: 'Node.js, React, MongoDB, Redis, Docker, Kubernetes',
              scalability: '10,000 concurrent users, 1M products, 100,000 orders/day',
              security: 'OAuth 2.0, JWT tokens, PCI DSS compliance, data encryption',
              integrations: 'Payment gateways (Stripe, PayPal), shipping APIs, analytics'
            },
            expectedOutput: 'Detailed microservices architecture with service boundaries, API specifications, data models, and deployment strategy'
          }
        ],
        bestPractices: [
          'Define clear service boundaries and responsibilities',
          'Specify API contracts and data models',
          'Include monitoring and observability requirements',
          'Plan for fault tolerance and resilience'
        ],
        warnings: [
          'Microservices add complexity - ensure team has necessary expertise',
          'Consider data consistency and transaction management across services'
        ]
      },
      content: `# Technical Specification: Microservices Architecture

## System Overview
{{input}}

{{#if technology}}
**Technology Stack:** {{technology}}
{{/if}}

{{#if scalability}}
**Scalability Requirements:** {{scalability}}
{{/if}}

{{#if security}}
**Security Requirements:** {{security}}
{{/if}}

{{#if integrations}}
**External Integrations:** {{integrations}}
{{/if}}

## 1. Architecture Overview

### 1.1 System Architecture
- **Architecture Pattern**: Microservices with Event-Driven Architecture
- **Communication**: RESTful APIs + Message Queues
- **Data Strategy**: Database per Service
- **Deployment**: Containerized with Kubernetes

### 1.2 Service Boundaries
[Define each microservice with clear responsibilities]

## 2. Service Specifications

### 2.1 Core Services
For each service, provide:
- **Service Name**: [Descriptive name]
- **Responsibility**: [Single responsibility principle]
- **API Endpoints**: [REST API specification]
- **Data Model**: [Database schema]
- **Dependencies**: [Other services it depends on]
- **Events**: [Events it publishes/subscribes to]

### 2.2 Infrastructure Services
- **API Gateway**: [Routing, authentication, rate limiting]
- **Service Discovery**: [Service registration and discovery]
- **Configuration Management**: [Centralized configuration]
- **Monitoring & Logging**: [Observability stack]

## 3. Data Architecture

### 3.1 Data Strategy
- **Database per Service**: [Ensure data isolation]
- **Data Consistency**: [Eventual consistency patterns]
- **Data Synchronization**: [Event-driven data sync]
- **Backup & Recovery**: [Data protection strategy]

### 3.2 Data Models
[Specify data models for each service]

## 4. API Specifications

### 4.1 API Design Principles
- RESTful design with proper HTTP methods
- Consistent naming conventions
- Proper error handling and status codes
- API versioning strategy
- Request/response validation

### 4.2 API Documentation
[OpenAPI/Swagger specifications for each service]

## 5. Security Architecture

### 5.1 Authentication & Authorization
- **Authentication**: [JWT, OAuth 2.0, etc.]
- **Authorization**: [RBAC, ABAC patterns]
- **API Security**: [Rate limiting, API keys]
- **Service-to-Service**: [mTLS, service mesh]

### 5.2 Data Security
- **Encryption**: [At rest and in transit]
- **Sensitive Data**: [PII handling, tokenization]
- **Compliance**: [GDPR, CCPA, industry standards]

## 6. Scalability & Performance

### 6.1 Scalability Strategy
- **Horizontal Scaling**: [Auto-scaling policies]
- **Load Balancing**: [Distribution strategies]
- **Caching**: [Redis, CDN, application caching]
- **Database Scaling**: [Read replicas, sharding]

### 6.2 Performance Requirements
- **Response Times**: [SLA requirements]
- **Throughput**: [Requests per second]
- **Availability**: [Uptime requirements]

## 7. Deployment Architecture

### 7.1 Containerization
- **Docker**: [Container specifications]
- **Kubernetes**: [Deployment manifests]
- **Service Mesh**: [Istio, Linkerd configuration]

### 7.2 CI/CD Pipeline
- **Build Process**: [Automated testing and building]
- **Deployment Strategy**: [Blue-green, canary deployments]
- **Environment Management**: [Dev, staging, production]

## 8. Monitoring & Observability

### 8.1 Monitoring Stack
- **Metrics**: [Prometheus, Grafana]
- **Logging**: [ELK stack, structured logging]
- **Tracing**: [Jaeger, Zipkin]
- **Alerting**: [Alert rules and notifications]

### 8.2 Health Checks
- **Service Health**: [Health check endpoints]
- **Dependency Health**: [Circuit breakers]
- **System Health**: [Infrastructure monitoring]

## 9. Error Handling & Resilience

### 9.1 Fault Tolerance
- **Circuit Breakers**: [Prevent cascade failures]
- **Retry Policies**: [Exponential backoff]
- **Timeouts**: [Service timeout configurations]
- **Bulkhead Pattern**: [Resource isolation]

### 9.2 Disaster Recovery
- **Backup Strategy**: [Data and configuration backups]
- **Recovery Procedures**: [Service restoration]
- **Failover**: [Multi-region deployment]

## 10. Development Guidelines

### 10.1 Code Standards
- **Coding Conventions**: [Language-specific standards]
- **Documentation**: [Code and API documentation]
- **Testing**: [Unit, integration, contract testing]
- **Code Review**: [Review process and criteria]

### 10.2 Service Development
- **Service Templates**: [Boilerplate code]
- **Shared Libraries**: [Common functionality]
- **Database Migrations**: [Schema evolution]

## 11. Implementation Roadmap

### Phase 1: Core Services (Months 1-3)
- [Priority services and infrastructure]

### Phase 2: Feature Services (Months 4-6)
- [Additional business services]

### Phase 3: Optimization (Months 7-8)
- [Performance optimization and advanced features]

## 12. Appendices

### A. Technology Decisions
[Rationale for technology choices]

### B. Alternative Architectures
[Considered alternatives and why they were rejected]

### C. Migration Strategy
[If migrating from existing system]

---
*This specification should be reviewed by the development team and updated based on technical feasibility and constraints.*`,
      validationResult: {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        extractedVariables: []
      }
    },

    'ux-mobile-first': {
      metadata: {
        name: 'Mobile-First UX Specification',
        description: 'UX specification template focused on mobile-first design principles',
        author: 'System',
        version: '2.0',
        documentType: 'ux',
        category: 'Design',
        tags: ['mobile-first', 'responsive', 'accessibility', 'user-experience'],
        license: 'MIT',
        requiredVariables: [
          {
            name: 'input',
            type: 'string',
            required: true,
            description: 'Project requirements and functional specifications',
            validation: { minLength: 50, maxLength: 8000 }
          }
        ],
        optionalVariables: [
          {
            name: 'targetAudience',
            type: 'string',
            required: false,
            description: 'Target user demographics and characteristics',
            validation: { maxLength: 1000 }
          },
          {
            name: 'devices',
            type: 'string',
            required: false,
            description: 'Target devices and screen sizes',
            validation: { options: ['mobile-only', 'mobile-first', 'responsive', 'desktop-first'] }
          },
          {
            name: 'accessibility',
            type: 'string',
            required: false,
            description: 'Accessibility requirements and standards',
            validation: { maxLength: 800 }
          },
          {
            name: 'brandGuidelines',
            type: 'string',
            required: false,
            description: 'Brand guidelines and design constraints',
            validation: { maxLength: 800 }
          }
        ],
        examples: [
          {
            title: 'Mobile Banking App',
            description: 'UX specification for a mobile banking application',
            variables: {
              input: 'Design a mobile banking app with account management, transfers, bill payments, and financial insights.',
              targetAudience: 'Adults 25-65, tech-savvy, frequent mobile users, security-conscious',
              devices: 'mobile-first',
              accessibility: 'WCAG 2.1 AA compliance, screen reader support, high contrast mode',
              brandGuidelines: 'Conservative color palette, trustworthy design, clear typography'
            },
            expectedOutput: 'Comprehensive UX specification with user flows, wireframes, accessibility guidelines, and mobile-first design patterns'
          }
        ],
        bestPractices: [
          'Start with mobile constraints and expand to larger screens',
          'Prioritize touch-friendly interactions and gestures',
          'Consider thumb-friendly navigation zones',
          'Optimize for one-handed usage scenarios'
        ],
        warnings: [
          'Test on actual devices, not just browser responsive mode',
          'Consider network limitations and offline scenarios',
          'Validate touch target sizes meet accessibility standards'
        ]
      },
      content: `# UX Specification: Mobile-First Design

## Project Overview
{{input}}

{{#if targetAudience}}
**Target Audience:** {{targetAudience}}
{{/if}}

{{#if devices}}
**Device Strategy:** {{devices}}
{{/if}}

{{#if accessibility}}
**Accessibility Requirements:** {{accessibility}}
{{/if}}

{{#if brandGuidelines}}
**Brand Guidelines:** {{brandGuidelines}}
{{/if}}

## 1. User Research & Analysis

### 1.1 User Personas
[Create 3-5 detailed user personas including:]
- **Demographics**: Age, occupation, tech comfort level
- **Goals**: Primary objectives when using the app
- **Pain Points**: Current frustrations and challenges
- **Behaviors**: Usage patterns and preferences
- **Context**: When and where they use mobile apps

### 1.2 User Journey Mapping
[Map complete user journeys including:]
- **Awareness**: How users discover the app
- **Onboarding**: First-time user experience
- **Regular Usage**: Typical user workflows
- **Problem Resolution**: Error handling and support
- **Advocacy**: Sharing and recommendation flows

### 1.3 Competitive Analysis
[Analyze 3-5 competitors focusing on:]
- **Mobile UX Patterns**: Common design patterns
- **Navigation Structures**: How they organize content
- **Interaction Models**: Touch gestures and animations
- **Accessibility Features**: How they serve diverse users

## 2. Mobile-First Design Strategy

### 2.1 Progressive Enhancement
- **Mobile Core**: Essential features for smallest screens
- **Tablet Enhancement**: Additional features for medium screens
- **Desktop Expansion**: Full feature set for large screens

### 2.2 Touch Interface Design
- **Touch Targets**: Minimum 44x44px (iOS) / 48x48dp (Android)
- **Gesture Support**: Swipe, pinch, long press, pull-to-refresh
- **Thumb Zones**: Optimize for one-handed usage
- **Feedback**: Visual and haptic feedback for interactions

### 2.3 Performance Considerations
- **Loading States**: Progressive loading and skeleton screens
- **Offline Support**: Core functionality without network
- **Battery Optimization**: Efficient animations and processing
- **Network Awareness**: Adaptive content based on connection

## 3. Information Architecture

### 3.1 Navigation Structure
- **Primary Navigation**: Bottom tab bar or hamburger menu
- **Secondary Navigation**: Context-aware navigation
- **Deep Linking**: Support for direct content access
- **Search**: Prominent search functionality

### 3.2 Content Hierarchy
- **Content Prioritization**: Most important content first
- **Progressive Disclosure**: Reveal details on demand
- **Scannable Layout**: Easy to scan and digest
- **Contextual Actions**: Actions relevant to current content

## 4. Visual Design System

### 4.1 Typography
- **Font Hierarchy**: Clear heading and body text scales
- **Readability**: Optimal font sizes for mobile (16px minimum)
- **Line Height**: Comfortable reading experience
- **Contrast**: High contrast for readability

### 4.2 Color System
- **Primary Colors**: Brand colors and their variations
- **Semantic Colors**: Success, warning, error, info
- **Accessibility**: WCAG AA contrast ratios
- **Dark Mode**: Alternative color scheme

### 4.3 Spacing & Layout
- **Grid System**: Flexible grid for different screen sizes
- **Spacing Scale**: Consistent spacing throughout
- **Safe Areas**: Respect device safe areas and notches
- **Responsive Breakpoints**: Mobile, tablet, desktop

## 5. Interaction Design

### 5.1 Micro-interactions
- **Button States**: Default, hover, active, disabled
- **Loading States**: Spinners, progress bars, skeleton screens
- **Transitions**: Smooth animations between states
- **Feedback**: Immediate response to user actions

### 5.2 Gesture Patterns
- **Navigation Gestures**: Swipe back, pull-to-refresh
- **Content Gestures**: Pinch-to-zoom, swipe-to-delete
- **Custom Gestures**: App-specific interactions
- **Gesture Conflicts**: Avoid conflicts with system gestures

## 6. Accessibility Design

### 6.1 WCAG Compliance
- **Level AA**: Meet WCAG 2.1 AA standards
- **Screen Readers**: VoiceOver and TalkBack support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Clear focus indicators

### 6.2 Inclusive Design
- **Color Blindness**: Don't rely solely on color
- **Motor Impairments**: Large touch targets, alternative inputs
- **Cognitive Accessibility**: Clear language, consistent patterns
- **Temporary Impairments**: One-handed use, bright sunlight

## 7. Content Strategy

### 7.1 Mobile Content
- **Concise Copy**: Scannable, action-oriented text
- **Progressive Disclosure**: Show details on demand
- **Visual Hierarchy**: Use design to guide attention
- **Localization**: Support for multiple languages

### 7.2 Media Guidelines
- **Image Optimization**: Responsive images, proper formats
- **Video Considerations**: Autoplay policies, captions
- **Icon System**: Consistent iconography
- **Loading Optimization**: Lazy loading, progressive enhancement

## 8. Wireframes & Prototypes

### 8.1 Low-Fidelity Wireframes
[Create wireframes for key screens:]
- **Onboarding Flow**: Welcome, signup, tutorial
- **Main Navigation**: Home, primary features
- **Core Features**: Key user workflows
- **Settings**: Account, preferences, help

### 8.2 High-Fidelity Prototypes
[Create interactive prototypes showing:]
- **User Flows**: Complete task workflows
- **Interactions**: Tap, swipe, scroll behaviors
- **Transitions**: Screen-to-screen animations
- **Error States**: How errors are handled

## 9. Responsive Design

### 9.1 Breakpoint Strategy
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+
- **Flexible**: Fluid layouts between breakpoints

### 9.2 Adaptive Features
- **Navigation**: Tab bar → sidebar → top navigation
- **Content Layout**: Single column → multi-column
- **Interaction Methods**: Touch → mouse/keyboard
- **Information Density**: Compact → expanded views

## 10. Testing & Validation

### 10.1 Usability Testing
- **Device Testing**: Test on actual devices
- **User Testing**: Observe real users completing tasks
- **A/B Testing**: Compare design alternatives
- **Accessibility Testing**: Test with assistive technologies

### 10.2 Performance Testing
- **Load Times**: Measure and optimize loading
- **Animation Performance**: Smooth 60fps animations
- **Memory Usage**: Monitor memory consumption
- **Battery Impact**: Optimize for battery life

## 11. Implementation Guidelines

### 11.1 Developer Handoff
- **Design System**: Documented components and patterns
- **Asset Export**: Optimized images and icons
- **Specifications**: Detailed measurements and behaviors
- **Code Snippets**: CSS/styling examples

### 11.2 Quality Assurance
- **Design Review**: Regular design-dev sync
- **Cross-Platform**: Consistent across iOS/Android
- **Edge Cases**: Handle unusual scenarios
- **Performance Monitoring**: Track real-world performance

## 12. Launch & Iteration

### 12.1 Phased Rollout
- **Beta Testing**: Limited user group
- **Soft Launch**: Gradual rollout
- **Full Launch**: Complete availability
- **Post-Launch**: Monitor and iterate

### 12.2 Continuous Improvement
- **Analytics**: Track user behavior and pain points
- **Feedback**: Collect and prioritize user feedback
- **A/B Testing**: Continuously test improvements
- **Design System Evolution**: Update patterns based on learnings

---
*This UX specification should be validated through user testing and updated based on feedback before development begins.*`,
      validationResult: {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        extractedVariables: []
      }
    }
  }

  /**
   * Get available template categories
   */
  getTemplateCategories(): string[] {
    const categories = new Set<string>()
    Object.values(this.templateLibrary).forEach(template => {
      categories.add(template.metadata.category)
    })
    return Array.from(categories).sort()
  }

  /**
   * Get templates by document type
   */
  getTemplatesByDocumentType(documentType: string): TemplateLibraryItem[] {
    console.log('Getting templates for document type:', documentType)
    console.log('Available template IDs:', Object.keys(this.templateLibrary))
    
    const filtered = Object.entries(this.templateLibrary)
      .filter(([_, template]) => {
        console.log(`Template ${template.metadata.name}: documentType=${template.metadata.documentType}, matches=${template.metadata.documentType === documentType}`)
        return template.metadata.documentType === documentType
      })
    
    console.log('Filtered templates:', filtered.length)
    
    return filtered.map(([id, template]) => ({
      id,
      name: template.metadata.name,
      description: template.metadata.description,
      category: template.metadata.category,
      documentType: template.metadata.documentType,
      author: template.metadata.author,
      rating: 4.5, // Mock rating
      downloads: Math.floor(Math.random() * 1000) + 100, // Mock downloads
      tags: template.metadata.tags,
      preview: template.content.substring(0, 200) + '...',
      isOfficial: template.metadata.author === 'System',
      isPremium: false,
      requiredVariables: template.metadata.requiredVariables.map(v => v.name),
      optionalVariables: template.metadata.optionalVariables.map(v => v.name)
    }))
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): TemplateBundle | null {
    return this.templateLibrary[templateId] || null
  }

  /**
   * Load template content with variable validation
   */
  loadTemplate(templateId: string): { content: string; variables: PromptVariable[]; validation: ValidationResult } {
    const template = this.templateLibrary[templateId]
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const allVariables = template.metadata.requiredVariables.concat(template.metadata.optionalVariables)

    const validation = promptValidationService.validatePrompt(
      template.content,
      template.metadata.documentType,
      { strictMode: false, allowCustomVariables: true }
    )

    return {
      content: template.content,
      variables: allVariables,
      validation
    }
  }

  /**
   * Import template from file
   */
  async importTemplate(file: File): Promise<TemplateBundle> {
    const content = await file.text()
    
    try {
      // Try to parse as JSON first (structured template)
      const templateData = JSON.parse(content)
      
      if (templateData.metadata && templateData.content) {
        // Validate the template content
        const validation = promptValidationService.validatePrompt(
          templateData.content,
          templateData.metadata.documentType,
          { strictMode: false, allowCustomVariables: true }
        )

        return {
          metadata: templateData.metadata,
          content: templateData.content,
          validationResult: validation
        }
      }
    } catch (e) {
      // If not JSON, treat as plain text template
      const documentType = this.detectDocumentType(content)
      const extractedVariables = promptValidationService.extractVariables(content)
      
      const validation = promptValidationService.validatePrompt(
        content,
        documentType,
        { strictMode: false, allowCustomVariables: true }
      )

      return {
        metadata: {
          name: file.name.replace(/\.[^/.]+$/, ''),
          description: 'Imported template',
          author: 'User',
          version: '1.0',
          documentType,
          category: 'Custom',
          tags: ['imported'],
          license: 'Custom',
          requiredVariables: extractedVariables.filter(v => v.required),
          optionalVariables: extractedVariables.filter(v => !v.required),
          examples: [],
          bestPractices: [],
          warnings: []
        },
        content,
        validationResult: validation
      }
    }
  }

  /**
   * Export template to file
   */
  exportTemplate(templateId: string): Blob {
    const template = this.templateLibrary[templateId]
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const exportData = {
      metadata: template.metadata,
      content: template.content,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
  }

  /**
   * Save custom template to database
   */
  async saveCustomTemplate(
    templateData: TemplateBundle,
    userId: string,
    isPersonalDefault = false
  ): Promise<string> {
    const template = {
      name: templateData.metadata.name,
      description: templateData.metadata.description,
      document_type: templateData.metadata.documentType,
      prompt_content: templateData.content,
      variables: this.extractVariableMap(templateData.metadata.requiredVariables, templateData.metadata.optionalVariables),
      ai_model: 'gpt-4o',
      prompt_scope: 'user',
      user_id: userId,
      is_active: true,
      is_personal_default: isPersonalDefault,
      version: 1,
      created_by: userId,
      category: templateData.metadata.category,
      tags: templateData.metadata.tags
    }

    const { data, error } = await this.supabase
      .from('prompt_templates')
      .insert(template)
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to save template: ${error.message}`)
    }

    return data.id
  }

  /**
   * Get required variables for a document type
   */
  getRequiredVariables(documentType: string): PromptVariable[] {
    const baseVariables = promptValidationService.getVariableSuggestions(documentType)
    const requiredVariables = baseVariables.filter(v => v.required)
    
    // Add document-type specific required variables
    const additionalRequired: Record<string, PromptVariable[]> = {
      business: [
        {
          name: 'input',
          type: 'string',
          required: true,
          description: 'Project requirements and business context (minimum 50 characters)',
          validation: { minLength: 50, maxLength: 5000 }
        }
      ],
      technical: [
        {
          name: 'input',
          type: 'string',
          required: true,
          description: 'Functional requirements and system specifications (minimum 100 characters)',
          validation: { minLength: 100, maxLength: 10000 }
        }
      ],
      ux: [
        {
          name: 'input',
          type: 'string',
          required: true,
          description: 'Project requirements and user needs (minimum 50 characters)',
          validation: { minLength: 50, maxLength: 8000 }
        }
      ],
      mermaid: [
        {
          name: 'input',
          type: 'string',
          required: true,
          description: 'System description for diagram generation (minimum 20 characters)',
          validation: { minLength: 20, maxLength: 5000 }
        }
      ],
      functional: [
        {
          name: 'input',
          type: 'string',
          required: true,
          description: 'Business requirements and analysis (minimum 50 characters)',
          validation: { minLength: 50, maxLength: 8000 }
        }
      ],
      sdlc: [
        {
          name: 'input',
          type: 'string',
          required: true,
          description: 'Complete project description for SDLC planning (minimum 100 characters)',
          validation: { minLength: 100, maxLength: 15000 }
        }
      ]
    }

    // Combine and deduplicate by variable name (prioritize additional required variables)
    const variableMap = new Map<string, PromptVariable>()
    
    // Add base variables first
    requiredVariables.forEach(variable => {
      variableMap.set(variable.name, variable)
    })
    
    // Add/override with document-specific variables
    const additionalVars = additionalRequired[documentType] || []
    additionalVars.forEach(variable => {
      variableMap.set(variable.name, variable)
    })

    return Array.from(variableMap.values())
  }

  /**
   * Validate template before saving
   */
  validateTemplateForSaving(content: string, documentType: string): ValidationResult {
    const validation = promptValidationService.validatePrompt(
      content,
      documentType,
      { strictMode: true, allowCustomVariables: false }
    )

    // Additional validation for required variables
    const requiredVariables = this.getRequiredVariables(documentType)
    const extractedVariables = promptValidationService.extractVariables(content)
    const extractedVarNames = extractedVariables.map(v => v.name)

    for (const requiredVar of requiredVariables) {
      if (!extractedVarNames.includes(requiredVar.name)) {
        validation.errors.push(`Missing required variable: {{${requiredVar.name}}}`)
        validation.isValid = false
      }
    }

    return validation
  }

  /**
   * Get template guidance for a document type
   */
  getTemplateGuidance(documentType: string): {
    requiredVariables: PromptVariable[]
    recommendedStructure: string[]
    bestPractices: string[]
    commonMistakes: string[]
  } {
    const requiredVariables = this.getRequiredVariables(documentType)
    
    const guidance = {
      business: {
        recommendedStructure: [
          'Executive Summary',
          'Stakeholder Analysis',
          'Requirements Analysis',
          'Risk Assessment',
          'Success Metrics',
          'Recommendations'
        ],
        bestPractices: [
          'Include specific business objectives and success criteria',
          'Identify all stakeholders and their interests',
          'Quantify benefits and ROI where possible',
          'Address potential risks and mitigation strategies'
        ],
        commonMistakes: [
          'Too vague or generic requirements',
          'Missing stakeholder analysis',
          'No clear success metrics',
          'Ignoring business constraints'
        ]
      },
      technical: {
        recommendedStructure: [
          'System Architecture',
          'Technical Requirements',
          'API Specifications',
          'Database Design',
          'Security Considerations',
          'Performance Requirements',
          'Implementation Guidelines'
        ],
        bestPractices: [
          'Define clear system boundaries and interfaces',
          'Specify non-functional requirements',
          'Include scalability and performance considerations',
          'Address security and compliance requirements'
        ],
        commonMistakes: [
          'Missing non-functional requirements',
          'Unclear system boundaries',
          'No scalability considerations',
          'Insufficient security planning'
        ]
      },
      ux: {
        recommendedStructure: [
          'User Research Summary',
          'User Personas',
          'User Journey Maps',
          'Information Architecture',
          'Interaction Design',
          'Visual Design Guidelines',
          'Accessibility Requirements'
        ],
        bestPractices: [
          'Start with user research and personas',
          'Focus on user goals and pain points',
          'Include accessibility considerations',
          'Provide clear interaction patterns'
        ],
        commonMistakes: [
          'Designing without user research',
          'Ignoring accessibility requirements',
          'Inconsistent interaction patterns',
          'No consideration for mobile users'
        ]
      },
      mermaid: {
        recommendedStructure: [
          'System Flow Diagram',
          'Component Relationships',
          'User Interaction Flow',
          'Data Flow Diagram'
        ],
        bestPractices: [
          'Use appropriate diagram types for the content',
          'Keep diagrams simple and focused',
          'Include clear labels and relationships',
          'Ensure diagrams are self-explanatory'
        ],
        commonMistakes: [
          'Overly complex diagrams',
          'Unclear relationships',
          'Missing labels or legends',
          'Wrong diagram type for the content'
        ]
      },
      functional: {
        recommendedStructure: [
          'System Overview',
          'Functional Requirements',
          'User Stories',
          'System Interactions',
          'Data Requirements',
          'Business Rules'
        ],
        bestPractices: [
          'Write clear, testable requirements',
          'Use user story format where appropriate',
          'Include acceptance criteria',
          'Define system boundaries clearly'
        ],
        commonMistakes: [
          'Vague or untestable requirements',
          'Missing acceptance criteria',
          'Unclear system boundaries',
          'No consideration for edge cases'
        ]
      },
      sdlc: {
        recommendedStructure: [
          'Project Overview',
          'Requirements Analysis',
          'Architecture Design',
          'Implementation Plan',
          'Testing Strategy',
          'Deployment Plan',
          'Maintenance Plan'
        ],
        bestPractices: [
          'Provide comprehensive project context',
          'Include all SDLC phases',
          'Consider team structure and resources',
          'Plan for long-term maintenance'
        ],
        commonMistakes: [
          'Incomplete project description',
          'Missing SDLC phases',
          'No resource planning',
          'Ignoring maintenance requirements'
        ]
      }
    }

    return {
      requiredVariables,
      ...guidance[documentType as keyof typeof guidance]
    }
  }

  // Private helper methods
  private detectDocumentType(content: string): string {
    const contentLower = content.toLowerCase()
    
    if (contentLower.includes('business') || contentLower.includes('stakeholder') || contentLower.includes('roi')) {
      return 'business'
    }
    if (contentLower.includes('technical') || contentLower.includes('architecture') || contentLower.includes('api')) {
      return 'technical'
    }
    if (contentLower.includes('user') || contentLower.includes('ux') || contentLower.includes('design')) {
      return 'ux'
    }
    if (contentLower.includes('mermaid') || contentLower.includes('diagram') || contentLower.includes('flowchart')) {
      return 'mermaid'
    }
    if (contentLower.includes('functional') || contentLower.includes('requirements') || contentLower.includes('feature')) {
      return 'functional'
    }
    if (contentLower.includes('sdlc') || contentLower.includes('development') || contentLower.includes('lifecycle')) {
      return 'sdlc'
    }
    
    return 'business' // Default fallback
  }

  private extractVariableMap(required: PromptVariable[], optional: PromptVariable[]): Record<string, string> {
    const variableMap: Record<string, string> = {}
    
    const allVariables = required.concat(optional)
    allVariables.forEach(variable => {
      variableMap[variable.name] = variable.type
    })
    
    return variableMap
  }

  /**
   * Debug method to show all available templates
   */
  getAllTemplates(): TemplateLibraryItem[] {
    return Object.entries(this.templateLibrary).map(([id, template]) => ({
      id,
      name: template.metadata.name,
      description: template.metadata.description,
      category: template.metadata.category,
      documentType: template.metadata.documentType,
      author: template.metadata.author,
      rating: 4.5,
      downloads: Math.floor(Math.random() * 1000) + 100,
      tags: template.metadata.tags,
      preview: template.content.substring(0, 200) + '...',
      isOfficial: template.metadata.author === 'System',
      isPremium: false,
      requiredVariables: template.metadata.requiredVariables.map(v => v.name),
      optionalVariables: template.metadata.optionalVariables.map(v => v.name)
    }))
  }
}

// Export singleton instance
export const promptTemplateManager = new PromptTemplateManager() 