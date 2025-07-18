import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { createServerPromptService } from '@/lib/prompt-service-server'
import { createClient } from "@/lib/supabase/server"
import { generateWithDatabasePrompt } from '@/lib/prompt-template-manager'

export const maxDuration = 300 // 5 minutes for detailed generation

interface DetailedSDLCRequest {
  input: string
  openaiKey: string
  userId?: string
  projectId?: string
  detailLevel: 'standard' | 'enterprise' | 'comprehensive'
}

interface DetailedSDLCResponse {
  businessAnalysis: {
    executiveSummary: string
    stakeholderAnalysis: string
    requirementsAnalysis: string
    riskAssessment: string
    successMetrics: string
    userStories: string
    personas: string
  }
  functionalSpec: {
    systemOverview: string
    functionalRequirements: string
    dataRequirements: string
    integrationRequirements: string
    performanceRequirements: string
    securityRequirements: string
    userInterfaceRequirements: string
  }
  technicalSpec: {
    systemArchitecture: string
    technologyStack: string
    dataModels: string
    apiSpecifications: string
    securityImplementation: string
    deploymentStrategy: string
    monitoringStrategy: string
    testingStrategy: string
  }
  uxSpec: {
    userPersonas: string
    userJourneys: string
    wireframes: string
    designSystem: string
    accessibilityRequirements: string
    usabilityTesting: string
    interactionDesign: string
  }
  implementationGuide: {
    projectPlan: string
    sprintBreakdown: string
    userStories: string
    acceptanceCriteria: string
    testCases: string
    deploymentPlan: string
    operationalRunbook: string
  }
  metadata: {
    generationTime: number
    detailLevel: string
    sectionsGenerated: number
  }
}

// Get authenticated user
async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Enhanced prompts for detailed generation
const DETAILED_PROMPTS = {
  businessAnalysis: {
    executiveSummary: `As a Senior Business Analyst with 15+ years of experience, create a comprehensive executive summary for this project:

PROJECT INPUT: {input}

Create a detailed executive summary that includes:

## Executive Summary
- **Project Vision**: Clear, compelling vision statement
- **Business Justification**: ROI analysis, cost-benefit analysis
- **Strategic Alignment**: How this aligns with business strategy
- **Success Definition**: Specific, measurable success criteria
- **Investment Required**: High-level resource requirements
- **Timeline Overview**: Major milestones and delivery dates
- **Risk Summary**: Top 3 risks and mitigation strategies

## Business Case
- **Current State Analysis**: What problems exist today
- **Proposed Solution**: How this project solves those problems
- **Alternative Options**: Other solutions considered and why this is best
- **Financial Impact**: Revenue impact, cost savings, efficiency gains
- **Market Opportunity**: Market size, competitive advantage
- **Stakeholder Benefits**: Value to each stakeholder group

## Strategic Context
- **Business Objectives**: Link to company goals
- **Market Position**: Competitive landscape analysis
- **Technology Trends**: Relevant industry trends
- **Regulatory Compliance**: Compliance requirements
- **Scalability Potential**: Future growth opportunities

Provide specific numbers, percentages, and concrete metrics wherever possible. This should be executive-level quality suitable for board presentation.`,

    stakeholderAnalysis: `As a Senior Business Analyst, create a comprehensive stakeholder analysis:

PROJECT INPUT: {input}

## Stakeholder Analysis

### Primary Stakeholders
For each stakeholder, provide:
- **Role & Responsibility**: What they do and decide
- **Interests & Concerns**: What they care about most
- **Influence Level**: High/Medium/Low influence on project
- **Support Level**: Champion/Supporter/Neutral/Skeptic/Blocker
- **Communication Needs**: How often, what format, what information
- **Success Criteria**: What success looks like to them

### Secondary Stakeholders
- **Affected Parties**: Who is impacted but not directly involved
- **External Stakeholders**: Customers, partners, regulators
- **Support Functions**: HR, Legal, Compliance, Security

### Stakeholder Engagement Strategy
- **Communication Plan**: Who gets what information when
- **Decision-Making Process**: How decisions will be made
- **Conflict Resolution**: How to handle disagreements
- **Change Management**: How to manage stakeholder concerns

### RACI Matrix
Create a RACI matrix for key project decisions and deliverables:
- **Responsible**: Who does the work
- **Accountable**: Who is ultimately accountable
- **Consulted**: Who provides input
- **Informed**: Who needs to be kept informed

This should be detailed enough to guide project communications and stakeholder management throughout the project lifecycle.`,

    requirementsAnalysis: `As a Senior Business Analyst specializing in requirements engineering, create a detailed requirements analysis:

PROJECT INPUT: {input}

## Requirements Analysis

### Functional Requirements
Create detailed functional requirements in this format:
- **REQ-F-001**: [Requirement Title]
  - **Description**: Detailed description of what the system must do
  - **Rationale**: Why this requirement exists
  - **Acceptance Criteria**: Specific, testable criteria
  - **Priority**: Must Have/Should Have/Could Have/Won't Have
  - **Complexity**: High/Medium/Low
  - **Dependencies**: Other requirements this depends on
  - **Assumptions**: What we're assuming
  - **Constraints**: Any limitations or restrictions

### Non-Functional Requirements
- **Performance Requirements**: Response times, throughput, scalability
- **Security Requirements**: Authentication, authorization, data protection
- **Usability Requirements**: User experience, accessibility
- **Reliability Requirements**: Uptime, error handling, recovery
- **Compliance Requirements**: Regulatory, industry standards
- **Maintainability Requirements**: Code quality, documentation
- **Portability Requirements**: Platform compatibility

### Business Rules
- **Data Validation Rules**: What data is valid/invalid
- **Business Logic Rules**: How the system should behave
- **Workflow Rules**: Process flows and decision points
- **Authorization Rules**: Who can do what
- **Audit Rules**: What needs to be tracked

### Requirements Traceability
- **Business Objective Mapping**: Link each requirement to business goals
- **Stakeholder Mapping**: Which stakeholders care about each requirement
- **Test Case Mapping**: How each requirement will be tested
- **Risk Mapping**: Risks associated with each requirement

Each requirement should be specific, measurable, achievable, relevant, and time-bound (SMART).`
  },

  functionalSpec: {
    systemOverview: `As a Senior Systems Analyst, create a comprehensive system overview:

PROJECT INPUT: {input}

## System Overview

### System Purpose & Scope
- **Primary Purpose**: What the system is designed to do
- **System Boundaries**: What's included and excluded
- **Key Capabilities**: Main functional areas
- **User Types**: Who will use the system
- **System Context**: How it fits in the larger ecosystem

### System Architecture Overview
- **Architecture Pattern**: Microservices/Monolithic/Serverless
- **System Components**: Major system components and their roles
- **Data Flow**: How data moves through the system
- **Integration Points**: External systems and APIs
- **Technology Stack**: High-level technology choices

### Business Process Support
- **Current Process**: How things work today
- **Future Process**: How the system will change processes
- **Process Improvements**: Efficiency gains and automation
- **Process Risks**: What could go wrong
- **Change Management**: How to transition users

### System Capabilities
- **Core Functions**: Essential system features
- **Supporting Functions**: Administrative and maintenance features
- **Reporting & Analytics**: Business intelligence capabilities
- **Integration Capabilities**: How it connects to other systems
- **Scalability Features**: How it handles growth

### Success Criteria
- **Functional Success**: What the system must do
- **Performance Success**: How fast and reliable it must be
- **User Success**: User adoption and satisfaction metrics
- **Business Success**: ROI and business impact metrics

This should provide a clear understanding of what the system does and why it's valuable.`,

    dataRequirements: `As a Senior Data Architect, create comprehensive data requirements:

PROJECT INPUT: {input}

## Data Requirements

### Data Entities & Attributes
For each major data entity, provide:
- **Entity Name**: Clear, descriptive name
- **Entity Purpose**: What this data represents
- **Key Attributes**: Essential data fields
- **Data Types**: String, Integer, Date, Boolean, etc.
- **Constraints**: Required fields, validation rules, formats
- **Business Rules**: How this data behaves
- **Relationships**: How it connects to other entities

### Data Relationships
- **Entity Relationship Diagram**: Conceptual ERD
- **Relationship Types**: One-to-one, one-to-many, many-to-many
- **Foreign Keys**: How entities link together
- **Referential Integrity**: Data consistency rules
- **Cascade Rules**: What happens when data is deleted

### Data Quality Requirements
- **Accuracy**: How accurate data must be
- **Completeness**: Required vs optional data
- **Consistency**: Data format and validation standards
- **Timeliness**: How fresh data needs to be
- **Uniqueness**: Duplicate prevention rules
- **Validity**: Data format and range requirements

### Data Lifecycle Management
- **Data Creation**: How data enters the system
- **Data Updates**: How data changes over time
- **Data Archival**: Long-term storage requirements
- **Data Deletion**: When and how data is removed
- **Data Retention**: Legal and business retention policies

### Data Security & Privacy
- **Sensitive Data**: PII, financial, health data
- **Access Controls**: Who can see what data
- **Encryption Requirements**: Data at rest and in transit
- **Audit Requirements**: Data access logging
- **Compliance Requirements**: GDPR, HIPAA, etc.

### Data Integration
- **Data Sources**: Where data comes from
- **Data Formats**: JSON, XML, CSV, database
- **Data Transformation**: How data is processed
- **Data Synchronization**: Keeping data consistent
- **Data Migration**: Moving existing data

This should provide complete guidance for database design and data management.`
  },

  technicalSpec: {
    systemArchitecture: `As a Senior Software Architect with 15+ years of experience, create a comprehensive system architecture specification:

PROJECT INPUT: {input}

## System Architecture Specification

### Architecture Overview
- **Architecture Style**: Microservices/Monolithic/Serverless/Hybrid
- **Architecture Principles**: Scalability, maintainability, security
- **Design Patterns**: MVC, Repository, Factory, Observer, etc.
- **Technology Philosophy**: Cloud-native, API-first, mobile-first
- **Quality Attributes**: Performance, security, scalability, availability

### System Components
For each major component:
- **Component Name**: Clear, descriptive name
- **Component Purpose**: What this component does
- **Responsibilities**: Specific functions and capabilities
- **Interfaces**: How other components interact with it
- **Dependencies**: What this component depends on
- **Technology Stack**: Specific technologies used
- **Deployment Model**: How it's deployed and scaled

### Layer Architecture
- **Presentation Layer**: UI components, web interfaces
- **Business Logic Layer**: Core business rules and processing
- **Data Access Layer**: Database interactions, ORM
- **Integration Layer**: External APIs, message queues
- **Infrastructure Layer**: Logging, monitoring, security

### Service Architecture (for Microservices)
- **Service Boundaries**: What each service owns
- **Service Communication**: REST, GraphQL, message queues
- **Service Discovery**: How services find each other
- **Service Mesh**: Traffic management, security, observability
- **Data Consistency**: Eventual consistency, SAGA patterns

### Scalability & Performance
- **Horizontal Scaling**: Load balancing, auto-scaling
- **Vertical Scaling**: Resource optimization
- **Caching Strategy**: Redis, CDN, application caching
- **Database Optimization**: Indexing, partitioning, read replicas
- **Performance Monitoring**: APM, metrics, alerting

### Security Architecture
- **Authentication**: OAuth, JWT, SSO
- **Authorization**: RBAC, ABAC, API keys
- **Data Protection**: Encryption, tokenization, masking
- **Network Security**: VPC, firewalls, WAF
- **Compliance**: SOC2, ISO27001, GDPR

This should provide complete technical guidance for system implementation.`,

    dataModels: `As a Senior Data Architect, create comprehensive data models:

PROJECT INPUT: {input}

## Data Models

### Conceptual Data Model
- **Business Entities**: High-level business concepts
- **Entity Relationships**: How business concepts relate
- **Business Rules**: Constraints and validations
- **Data Domains**: Categories of data (customer, product, order)

### Logical Data Model
For each entity, provide:
- **Entity Name**: Table/collection name
- **Attributes**: Column names and descriptions
- **Primary Key**: Unique identifier
- **Foreign Keys**: Relationships to other entities
- **Data Types**: String(50), Integer, DateTime, Boolean
- **Constraints**: NOT NULL, UNIQUE, CHECK constraints
- **Indexes**: Performance optimization indexes

### Physical Data Model
- **Database Schema**: Actual table definitions
- **Partitioning Strategy**: How large tables are split
- **Storage Requirements**: Disk space estimates
- **Backup Strategy**: Full, incremental, point-in-time
- **Performance Tuning**: Query optimization, indexing

### Sample Data Structures

\`\`\`sql
-- Example table structure
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
\`\`\`

### Data Validation Rules
- **Format Validation**: Email, phone, date formats
- **Range Validation**: Min/max values, length limits
- **Business Validation**: Custom business rules
- **Referential Integrity**: Foreign key constraints

### Data Migration Strategy
- **Current State Analysis**: Existing data assessment
- **Migration Plan**: Step-by-step migration process
- **Data Transformation**: How data will be converted
- **Validation Testing**: Ensuring data integrity
- **Rollback Plan**: What to do if migration fails

This should provide complete guidance for database implementation.`
  }
}

export async function POST(req: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const startTime = Date.now()
  
  try {
    console.log(`🚀 [${requestId}] Starting detailed SDLC generation request`)
    
    const { input, openaiKey, userId, projectId, detailLevel = 'enterprise' }: DetailedSDLCRequest = await req.json()

    console.log(`📝 [${requestId}] Request details:`, {
      inputLength: input?.length || 0,
      hasApiKey: !!openaiKey,
      userId: userId || 'not provided',
      projectId: projectId || 'not provided',
      detailLevel,
      timestamp: new Date().toISOString()
    })

    if (!openaiKey || openaiKey.trim() === '') {
      console.error(`❌ [${requestId}] Missing OpenAI API key`)
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 400 }
      )
    }

    const user = await getAuthenticatedUser()
    const effectiveUserId = userId || user?.id
    
    console.log(`👤 [${requestId}] Authentication:`, {
      authenticatedUser: !!user,
      effectiveUserId,
      userEmail: user?.email || 'unknown'
    })

    const openaiClient = createOpenAI({ apiKey: openaiKey })

    // Generate each section with detailed prompts
    const generateSection = async (prompt: string, context: any = {}, sectionName: string = 'Unknown') => {
      const sectionStartTime = Date.now()
      console.log(`🎯 [${requestId}] Starting section: ${sectionName}`)
      
      const processedPrompt = prompt.replace(/\{input\}/g, input)
      
      try {
        const result = await streamText({
          model: openaiClient("gpt-4o"),
          prompt: processedPrompt,
          maxTokens: 4000, // Increased token limit for detailed content
        })
        
        const sectionDuration = Date.now() - sectionStartTime
        console.log(`✅ [${requestId}] Completed section: ${sectionName}`, {
          duration: `${sectionDuration}ms`,
          outputLength: result.text?.length || 0,
          tokensUsed: result.usage?.totalTokens || 'unknown'
        })
        
        return result.text
      } catch (error) {
        const sectionDuration = Date.now() - sectionStartTime
        console.error(`❌ [${requestId}] Failed section: ${sectionName}`, {
          duration: `${sectionDuration}ms`,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        throw error
      }
    }

    console.log(`📊 [${requestId}] Starting Business Analysis generation...`)
    
    // Generate Business Analysis sections
    const businessAnalysis = {
      executiveSummary: await generateSection(DETAILED_PROMPTS.businessAnalysis.executiveSummary, {}, 'Executive Summary'),
      stakeholderAnalysis: await generateSection(DETAILED_PROMPTS.businessAnalysis.stakeholderAnalysis, {}, 'Stakeholder Analysis'),
      requirementsAnalysis: await generateSection(DETAILED_PROMPTS.businessAnalysis.requirementsAnalysis, {}, 'Requirements Analysis'),
      riskAssessment: await generateSection(`As a Senior Risk Analyst, create a comprehensive risk assessment for: {input}

## Risk Assessment

### Technical Risks
- **Risk ID**: TECH-001
- **Risk Description**: Detailed description
- **Probability**: High/Medium/Low
- **Impact**: High/Medium/Low
- **Risk Score**: Probability × Impact
- **Mitigation Strategy**: How to reduce/eliminate risk
- **Contingency Plan**: What to do if risk occurs
- **Owner**: Who is responsible for managing this risk

### Business Risks
- **Market Risk**: Competition, market changes
- **Financial Risk**: Budget overruns, ROI concerns
- **Operational Risk**: Resource availability, skill gaps
- **Regulatory Risk**: Compliance changes, legal issues

### Project Risks
- **Schedule Risk**: Delivery delays, dependency issues
- **Resource Risk**: Team availability, skill requirements
- **Quality Risk**: Defects, performance issues
- **Change Risk**: Scope creep, requirement changes

### Risk Monitoring
- **Risk Indicators**: Early warning signs
- **Review Schedule**: When to reassess risks
- **Escalation Process**: When to escalate risks
- **Risk Reporting**: How risks are communicated

Create a risk register with at least 10 specific risks relevant to this project.`),
      successMetrics: await generateSection(`As a Senior Business Analyst, define comprehensive success metrics for: {input}

## Success Metrics

### Business Metrics
- **Revenue Impact**: Specific revenue targets
- **Cost Savings**: Operational efficiency gains
- **User Adoption**: User growth and engagement
- **Market Share**: Competitive position improvement
- **Customer Satisfaction**: NPS, CSAT scores

### Technical Metrics
- **Performance**: Response time, throughput
- **Reliability**: Uptime, error rates
- **Scalability**: Concurrent users, data volume
- **Security**: Vulnerability assessments, compliance

### Operational Metrics
- **Deployment Frequency**: How often we release
- **Lead Time**: Idea to production time
- **Mean Time to Recovery**: Issue resolution time
- **Change Failure Rate**: Percentage of failed deployments

### User Experience Metrics
- **Task Completion Rate**: Success rate for key tasks
- **User Satisfaction**: User feedback scores
- **Time to Value**: How quickly users get value
- **Feature Adoption**: Which features are used most

Each metric should include:
- **Baseline**: Current state measurement
- **Target**: Desired improvement
- **Timeline**: When to achieve target
- **Measurement Method**: How to track progress
- **Reporting Frequency**: How often to measure`),
      userStories: await generateSection(`As a Senior Product Owner, create comprehensive user stories for: {input}

## User Stories

Create detailed user stories in this format:

### Epic: [Epic Name]
**Epic Description**: High-level feature description
**Business Value**: Why this epic matters
**Acceptance Criteria**: Epic-level success criteria

#### Story 1: [Story Title]
**As a** [user type]
**I want** [functionality]
**So that** [benefit/value]

**Acceptance Criteria**:
- **Given** [precondition]
- **When** [action]
- **Then** [expected result]

**Story Points**: [1, 2, 3, 5, 8]
**Priority**: Must Have/Should Have/Could Have
**Dependencies**: Other stories this depends on
**Definition of Done**: 
- [ ] Code complete and reviewed
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Acceptance criteria verified
- [ ] Performance requirements met

Create 15-20 detailed user stories covering all major functionality.`),
      personas: await generateSection(`As a UX Research Specialist, create detailed user personas for: {input}

## User Personas

For each persona, provide:

### Primary Persona: [Persona Name]
**Demographics**:
- **Age**: Age range
- **Job Title**: Professional role
- **Experience Level**: Beginner/Intermediate/Expert
- **Industry**: Sector they work in
- **Location**: Geographic location

**Goals & Motivations**:
- **Primary Goals**: What they want to achieve
- **Secondary Goals**: Nice-to-have objectives
- **Motivations**: What drives them
- **Success Criteria**: How they measure success

**Frustrations & Pain Points**:
- **Current Challenges**: Problems they face today
- **Technology Barriers**: Technical limitations
- **Process Issues**: Workflow problems
- **Time Constraints**: Efficiency concerns

**Behavior Patterns**:
- **Technology Usage**: How they use technology
- **Work Patterns**: Daily routines and workflows
- **Communication Style**: How they prefer to communicate
- **Decision Making**: How they make decisions

**Needs & Requirements**:
- **Must-Have Features**: Essential functionality
- **Nice-to-Have Features**: Desired enhancements
- **Information Needs**: What data they need
- **Support Needs**: Help and training requirements

Create 3-5 detailed personas representing different user types.`)
    }
    
    console.log(`✅ [${requestId}] Business Analysis completed`)
    console.log(`📋 [${requestId}] Starting Functional Specification generation...`)

    // Continue with other sections...
    const functionalSpec = {
      systemOverview: await generateSection(DETAILED_PROMPTS.functionalSpec.systemOverview, {}, 'System Overview'),
      functionalRequirements: await generateSection(DETAILED_PROMPTS.functionalSpec.dataRequirements, {}, 'Functional Requirements'),
      dataRequirements: await generateSection(DETAILED_PROMPTS.functionalSpec.dataRequirements, {}, 'Data Requirements'),
      integrationRequirements: await generateSection(`Create detailed integration requirements for: {input}`, {}, 'Integration Requirements'),
      performanceRequirements: await generateSection(`Create detailed performance requirements for: {input}`),
      securityRequirements: await generateSection(`Create detailed security requirements for: {input}`),
      userInterfaceRequirements: await generateSection(`Create detailed UI requirements for: {input}`)
    }
    
    console.log(`✅ [${requestId}] Functional Specification completed`)
    console.log(`🔧 [${requestId}] Starting Technical Specification generation...`)

    const technicalSpec = {
      systemArchitecture: await generateSection(DETAILED_PROMPTS.technicalSpec.systemArchitecture, {}, 'System Architecture'),
      technologyStack: await generateSection(`Create detailed technology stack recommendations for: {input}`, {}, 'Technology Stack'),
      dataModels: await generateSection(DETAILED_PROMPTS.technicalSpec.dataModels),
      apiSpecifications: await generateSection(`Create detailed API specifications for: {input}`),
      securityImplementation: await generateSection(`Create detailed security implementation for: {input}`),
      deploymentStrategy: await generateSection(`Create detailed deployment strategy for: {input}`),
      monitoringStrategy: await generateSection(`Create detailed monitoring strategy for: {input}`),
      testingStrategy: await generateSection(`Create detailed testing strategy for: {input}`)
    }
    
    console.log(`✅ [${requestId}] Technical Specification completed`)
    console.log(`🎨 [${requestId}] Starting UX Specification generation...`)

    // Generate UX specification using database prompt system
    console.log('Generating UX specification using database prompt...')
    const uxResult = await generateWithDatabasePrompt(
      'ux',
      { 
        input, 
        business_analysis: businessAnalysis,
        functional_spec: functionalSpec,
        technical_spec: technicalSpec
      },
      null, // No custom prompt - use database default
      openaiKey,
      effectiveUserId,
      projectId
    )
    
    const uxSpec = {
      userPersonas: businessAnalysis.personas,
      userJourneys: await generateSection(`Based on the UX specification, create detailed user journey maps for: {input}`, { businessAnalysis, functionalSpec, technicalSpec }),
      wireframes: await generateSection(`Based on the UX specification, create detailed wireframe specifications for: {input}`, { businessAnalysis, functionalSpec, technicalSpec }),
      designSystem: await generateSection(`Based on the UX specification, create detailed design system specifications for: {input}`, { businessAnalysis, functionalSpec, technicalSpec }),
      accessibilityRequirements: await generateSection(`Based on the UX specification, create detailed accessibility requirements for: {input}`, { businessAnalysis, functionalSpec, technicalSpec }),
      usabilityTesting: await generateSection(`Based on the UX specification, create detailed usability testing plan for: {input}`, { businessAnalysis, functionalSpec, technicalSpec }),
      interactionDesign: await generateSection(`Based on the UX specification, create detailed interaction design specifications for: {input}`, { businessAnalysis, functionalSpec, technicalSpec }),
      informationArchitecture: await generateSection(`Based on the UX specification, create detailed information architecture for: {input}`, { businessAnalysis, functionalSpec, technicalSpec }),
      visualDesign: await generateSection(`Based on the UX specification, create detailed visual design guidelines for: {input}`, { businessAnalysis, functionalSpec, technicalSpec }),
      prototypingPlan: await generateSection(`Based on the UX specification, create detailed prototyping plan for: {input}`, { businessAnalysis, functionalSpec, technicalSpec })
    }
    
    console.log(`✅ [${requestId}] UX Specification completed`)
    console.log(`📋 [${requestId}] Starting Implementation Guide generation...`)

    const implementationGuide = {
      projectPlan: await generateSection(`Create detailed project plan for: {input}`),
      sprintBreakdown: await generateSection(`Create detailed sprint breakdown for: {input}`),
      userStories: businessAnalysis.userStories,
      acceptanceCriteria: await generateSection(`Create detailed acceptance criteria for: {input}`),
      testCases: await generateSection(`Create detailed test cases for: {input}`),
      deploymentPlan: await generateSection(`Create detailed deployment plan for: {input}`),
      operationalRunbook: await generateSection(`Create detailed operational runbook for: {input}`)
    }

    console.log(`✅ [${requestId}] Implementation Guide completed`)
    
    const generationTime = Date.now() - startTime

    const response: DetailedSDLCResponse = {
      businessAnalysis,
      functionalSpec,
      technicalSpec,
      uxSpec,
      implementationGuide,
      metadata: {
        generationTime,
        detailLevel,
        sectionsGenerated: 25
      }
    }

    console.log(`🎉 [${requestId}] COMPLETE - Detailed SDLC documentation generated successfully!`, {
      totalTime: `${generationTime}ms`,
      totalTimeMin: `${(generationTime / 1000 / 60).toFixed(2)}min`,
      detailLevel,
      sectionsGenerated: 25,
      userId: effectiveUserId,
      contentSizes: {
        businessAnalysis: Object.values(businessAnalysis).reduce((acc, val) => acc + (val?.length || 0), 0),
        functionalSpec: Object.values(functionalSpec).reduce((acc, val) => acc + (val?.length || 0), 0),
        technicalSpec: Object.values(technicalSpec).reduce((acc, val) => acc + (val?.length || 0), 0),
        uxSpec: Object.values(uxSpec).reduce((acc, val) => acc + (val?.length || 0), 0),
        implementationGuide: Object.values(implementationGuide).reduce((acc, val) => acc + (val?.length || 0), 0)
      }
    })
    
    return NextResponse.json(response)

  } catch (error) {
    const errorTime = Date.now() - startTime
    console.error(`💥 [${requestId}] FAILED - Error generating detailed SDLC documentation:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timeBeforeFailure: `${errorTime}ms`,
      requestDetails: {
        hasInput: !!input,
        hasApiKey: !!openaiKey,
        userId: userId || 'not provided'
      }
    })
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to generate detailed SDLC documentation",
      requestId: requestId,
      timeBeforeFailure: errorTime
    }, { status: 500 })
  }
} 