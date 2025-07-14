import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 300 // 5 minutes for detailed generation

interface EnhancedSDLCRequest {
  input: string
  openaiKey: string
  userId?: string
  projectId?: string
  detailLevel?: 'standard' | 'enterprise' | 'comprehensive'
}

// Get authenticated user
async function getAuthenticatedUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Enhanced prompts for enterprise-grade documentation
const ENHANCED_PROMPTS = {
  businessAnalysis: `You are a Senior Business Analyst with 15+ years of experience at Fortune 500 companies. 
Create a comprehensive business analysis for this project:

PROJECT REQUIREMENTS: {input}

Generate a detailed business analysis document that includes:

## Executive Summary
- **Project Vision**: Clear, compelling vision statement that aligns with business strategy
- **Business Justification**: Detailed ROI analysis, cost-benefit analysis with specific numbers
- **Strategic Alignment**: How this project supports company objectives and market position
- **Success Definition**: Specific, measurable KPIs and success criteria
- **Investment Summary**: Resource requirements, budget estimates, timeline overview
- **Risk Overview**: Top 5 risks and mitigation strategies

## Stakeholder Analysis
- **Primary Stakeholders**: Executive sponsors, product owners, key decision makers
- **Secondary Stakeholders**: End users, support teams, affected departments
- **External Stakeholders**: Customers, partners, vendors, regulators
- **Stakeholder Interests**: What each group cares about and their success criteria
- **Influence/Interest Matrix**: Power dynamics and engagement strategies
- **Communication Plan**: How to keep stakeholders informed and engaged

## Detailed Requirements Analysis
Create at least 15 detailed functional requirements in this format:
- **REQ-F-001**: [Requirement Title]
  - **Description**: Detailed description of what the system must do
  - **Business Rationale**: Why this requirement exists and its business value
  - **Acceptance Criteria**: Specific, testable criteria (Given/When/Then format)
  - **Priority**: Must Have/Should Have/Could Have/Won't Have (MoSCoW)
  - **Complexity**: High/Medium/Low implementation complexity
  - **Dependencies**: Other requirements this depends on
  - **Assumptions**: What we're assuming to be true
  - **Constraints**: Any limitations or restrictions

## Non-Functional Requirements
- **Performance Requirements**: Response times, throughput, scalability targets
- **Security Requirements**: Authentication, authorization, data protection standards
- **Usability Requirements**: User experience standards, accessibility compliance
- **Reliability Requirements**: Uptime targets, error handling, disaster recovery
- **Compliance Requirements**: Regulatory standards, industry certifications
- **Maintainability Requirements**: Code quality, documentation, support standards

## User Stories and Personas
Create 3-5 detailed user personas:
- **Demographics**: Age, role, experience level, industry
- **Goals & Motivations**: What they want to achieve
- **Pain Points**: Current challenges and frustrations
- **Behavior Patterns**: How they work and make decisions
- **Technology Comfort**: Technical skill level and preferences

Create 20+ user stories in this format:
- **Epic**: [High-level feature]
- **Story**: As a [user type], I want [functionality] so that [benefit]
- **Acceptance Criteria**: Given/When/Then scenarios
- **Story Points**: Fibonacci estimation (1,2,3,5,8,13)
- **Priority**: Must/Should/Could/Won't Have
- **Dependencies**: Other stories this depends on

## Risk Assessment
Create a comprehensive risk register with at least 10 risks:
- **Risk ID**: RISK-001
- **Risk Category**: Technical/Business/Operational/External
- **Risk Description**: Detailed description of what could go wrong
- **Probability**: High/Medium/Low (with percentage if possible)
- **Impact**: High/Medium/Low (with business impact description)
- **Risk Score**: Probability × Impact
- **Mitigation Strategy**: How to prevent or reduce the risk
- **Contingency Plan**: What to do if the risk occurs
- **Risk Owner**: Who is responsible for monitoring this risk
- **Review Date**: When to reassess this risk

## Success Metrics and KPIs
- **Business Metrics**: Revenue impact, cost savings, market share
- **User Metrics**: Adoption rates, satisfaction scores, usage patterns
- **Technical Metrics**: Performance, reliability, security metrics
- **Operational Metrics**: Efficiency gains, process improvements
- **Financial Metrics**: ROI, NPV, payback period

Format the response as a professional business document with clear headings, bullet points, and structured sections. Include specific numbers, percentages, and metrics wherever possible.`,

  functionalSpec: `You are a Senior Systems Analyst with expertise in enterprise software requirements. 
Create a comprehensive functional specification based on this business analysis:

BUSINESS ANALYSIS: {businessAnalysis}

Generate a detailed functional specification that includes:

## System Overview
- **System Purpose**: What the system is designed to accomplish
- **System Scope**: What's included and excluded from this project
- **System Context**: How it fits within the larger enterprise architecture
- **Key Stakeholders**: Who will interact with the system
- **System Boundaries**: Integration points and external dependencies

## Functional Requirements
Create at least 25 detailed functional requirements organized by functional area:

### User Management
- User registration and authentication
- Profile management and preferences
- Role-based access control
- Password policies and security

### Data Management
- Data entry and validation
- Data storage and retrieval
- Data transformation and processing
- Data export and reporting

### Business Logic
- Core business processes
- Workflow management
- Business rules enforcement
- Decision support

### Integration
- API integrations
- Data synchronization
- Third-party services
- Legacy system connections

### Reporting and Analytics
- Standard reports
- Custom report generation
- Data visualization
- Performance dashboards

## Data Requirements
### Data Entities
For each major data entity:
- **Entity Name**: Clear, descriptive name
- **Entity Purpose**: What this data represents
- **Key Attributes**: Essential data fields with data types
- **Business Rules**: Validation rules and constraints
- **Relationships**: How it connects to other entities
- **Lifecycle**: Creation, update, archival, deletion rules

### Data Quality Standards
- **Accuracy**: Data correctness requirements
- **Completeness**: Required vs optional fields
- **Consistency**: Format and validation standards
- **Timeliness**: How fresh data needs to be
- **Uniqueness**: Duplicate prevention rules

## User Interface Requirements
### User Experience Principles
- **Usability**: Intuitive navigation and workflows
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsive Design**: Mobile, tablet, desktop compatibility
- **Performance**: Page load times and responsiveness
- **Consistency**: Design system and branding standards

### Screen Specifications
For each major screen/page:
- **Screen Name**: Descriptive name
- **Screen Purpose**: What users accomplish here
- **User Types**: Who can access this screen
- **Screen Elements**: Forms, buttons, navigation, content
- **Validation Rules**: Input validation and error handling
- **Navigation**: How users get to/from this screen

## Integration Requirements
### Internal Integrations
- **Database Systems**: Connection requirements
- **Authentication Systems**: SSO, LDAP, Active Directory
- **Monitoring Systems**: Logging, metrics, alerting
- **Backup Systems**: Data protection and recovery

### External Integrations
- **Third-party APIs**: External service connections
- **Payment Systems**: Financial transaction processing
- **Communication Systems**: Email, SMS, notifications
- **Analytics Systems**: Data collection and analysis

## Performance Requirements
- **Response Time**: Maximum acceptable response times
- **Throughput**: Transactions per second/minute/hour
- **Concurrent Users**: Maximum simultaneous users
- **Data Volume**: Storage and processing capacity
- **Scalability**: Growth accommodation requirements

## Security Requirements
- **Authentication**: User verification methods
- **Authorization**: Access control mechanisms
- **Data Protection**: Encryption, tokenization, masking
- **Audit Trail**: Activity logging and monitoring
- **Compliance**: Regulatory and industry standards

Format as a technical specification document with numbered requirements, clear acceptance criteria, and cross-references between related requirements.`,

  technicalSpec: `You are a Senior Software Architect with 15+ years of experience designing enterprise systems.
Create a comprehensive technical specification based on this functional specification:

FUNCTIONAL SPECIFICATION: {functionalSpec}

Generate a detailed technical specification that includes:

## System Architecture
### Architecture Overview
- **Architecture Style**: Microservices/Monolithic/Serverless/Hybrid with justification
- **Architecture Principles**: Scalability, maintainability, security, performance
- **Design Patterns**: Specific patterns used (MVC, Repository, Factory, Observer, etc.)
- **Technology Philosophy**: Cloud-native, API-first, mobile-first approach
- **Quality Attributes**: Non-functional requirements prioritization

### System Components
For each major component:
- **Component Name**: Clear, descriptive name
- **Component Purpose**: What this component does
- **Responsibilities**: Specific functions and capabilities
- **Interfaces**: How other components interact with it
- **Dependencies**: What this component depends on
- **Technology Stack**: Specific technologies, frameworks, libraries
- **Deployment Model**: How it's deployed, scaled, and monitored

### Layer Architecture
- **Presentation Layer**: UI frameworks, web servers, mobile apps
- **API Layer**: REST/GraphQL APIs, authentication, rate limiting
- **Business Logic Layer**: Core business rules, processing, validation
- **Data Access Layer**: Database connections, ORM, caching
- **Integration Layer**: External APIs, message queues, event streams
- **Infrastructure Layer**: Logging, monitoring, security, deployment

## Technology Stack
### Frontend Technologies
- **Framework**: React/Angular/Vue with version and justification
- **State Management**: Redux/MobX/Context API approach
- **UI Components**: Design system and component library
- **Build Tools**: Webpack/Vite/Parcel configuration
- **Testing**: Jest/Cypress/Playwright testing strategy

### Backend Technologies
- **Runtime**: Node.js/Python/Java/.NET with version
- **Framework**: Express/FastAPI/Spring Boot/ASP.NET Core
- **Database**: PostgreSQL/MySQL/MongoDB with clustering
- **Caching**: Redis/Memcached configuration
- **Message Queue**: RabbitMQ/Apache Kafka/AWS SQS

### Infrastructure
- **Cloud Platform**: AWS/Azure/GCP with specific services
- **Containerization**: Docker/Kubernetes configuration
- **CI/CD**: GitHub Actions/Jenkins/GitLab CI pipeline
- **Monitoring**: Prometheus/Grafana/DataDog/New Relic
- **Logging**: ELK Stack/Splunk/CloudWatch

## Database Design
### Database Schema
Create detailed table structures:
\`\`\`sql
-- Example: Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_role CHECK (role IN ('admin', 'manager', 'user'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
\`\`\`

### Data Migration Strategy
- **Current State Analysis**: Existing data assessment
- **Migration Approach**: Big bang vs phased migration
- **Data Transformation**: ETL processes and data mapping
- **Validation Strategy**: Data integrity and quality checks
- **Rollback Plan**: Recovery procedures if migration fails

## API Design
### RESTful API Specification
For each endpoint:
- **Endpoint**: GET/POST/PUT/DELETE /api/v1/resource
- **Purpose**: What this endpoint does
- **Authentication**: Required auth level
- **Parameters**: Query params, path params, request body
- **Response**: Success and error response formats
- **Rate Limiting**: Request limits and throttling
- **Caching**: Cache headers and strategies

### API Documentation
- **OpenAPI/Swagger**: Complete API specification
- **Authentication**: JWT/OAuth2 implementation
- **Error Handling**: Consistent error response format
- **Versioning**: API version management strategy
- **Testing**: API testing and validation approach

## Security Implementation
### Authentication & Authorization
- **Authentication Method**: JWT/OAuth2/SAML implementation
- **Session Management**: Token lifecycle and refresh
- **Role-Based Access Control**: Permission matrix
- **Multi-Factor Authentication**: 2FA/MFA implementation
- **Single Sign-On**: SSO integration approach

### Data Protection
- **Encryption at Rest**: Database and file encryption
- **Encryption in Transit**: TLS/SSL configuration
- **Key Management**: Encryption key rotation and storage
- **Data Masking**: PII protection in non-production
- **Backup Security**: Secure backup and recovery

## Deployment Strategy
### Environment Configuration
- **Development**: Local development setup
- **Testing**: Automated testing environment
- **Staging**: Production-like testing environment
- **Production**: Live system configuration

### Deployment Pipeline
- **Source Control**: Git workflow and branching strategy
- **Build Process**: Automated build and testing
- **Deployment Automation**: CI/CD pipeline configuration
- **Rollback Strategy**: Quick rollback procedures
- **Blue-Green Deployment**: Zero-downtime deployment

## Monitoring and Observability
### Application Monitoring
- **Performance Metrics**: Response times, throughput, errors
- **Business Metrics**: User activity, feature usage
- **Infrastructure Metrics**: CPU, memory, disk, network
- **Custom Metrics**: Application-specific measurements

### Logging Strategy
- **Log Levels**: Debug, Info, Warning, Error, Critical
- **Log Format**: Structured logging with correlation IDs
- **Log Aggregation**: Centralized log collection
- **Log Retention**: Storage and archival policies
- **Log Analysis**: Search and alerting capabilities

## Testing Strategy
### Testing Pyramid
- **Unit Tests**: Component-level testing (70%)
- **Integration Tests**: API and service testing (20%)
- **End-to-End Tests**: User workflow testing (10%)
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability and penetration testing

### Test Automation
- **Test Framework**: Testing tools and libraries
- **Test Data**: Test data management and generation
- **Test Environments**: Isolated testing environments
- **Test Reporting**: Test results and coverage reports
- **Continuous Testing**: Automated test execution

Format as a comprehensive technical document with code examples, configuration samples, and architectural diagrams described in text format.`,

  implementationPlan: `You are a Senior Project Manager and Technical Lead with experience delivering enterprise software projects.
Create a comprehensive implementation plan based on this technical specification:

TECHNICAL SPECIFICATION: {technicalSpec}

Generate a detailed implementation plan that includes:

## Project Planning
### Project Overview
- **Project Name**: Descriptive project name
- **Project Duration**: Estimated timeline with milestones
- **Team Structure**: Roles and responsibilities
- **Budget Estimate**: High-level cost breakdown
- **Success Criteria**: Measurable project outcomes

### Team Composition
- **Project Manager**: Project oversight and coordination
- **Technical Lead**: Architecture and technical decisions
- **Frontend Developers**: UI/UX implementation (2-3 developers)
- **Backend Developers**: API and business logic (2-3 developers)
- **DevOps Engineer**: Infrastructure and deployment
- **QA Engineer**: Testing and quality assurance
- **UX Designer**: User experience design
- **Business Analyst**: Requirements and stakeholder management

## Sprint Planning
### Sprint 1-2: Foundation (Weeks 1-4)
**Sprint 1: Project Setup**
- Development environment setup
- Repository and CI/CD pipeline configuration
- Database schema design and initial setup
- Authentication system implementation
- Basic project structure and architecture

**Sprint 2: Core Infrastructure**
- API framework setup and basic endpoints
- Database connection and ORM configuration
- Logging and monitoring setup
- Security middleware implementation
- Basic frontend framework setup

### Sprint 3-4: Core Features (Weeks 5-8)
**Sprint 3: User Management**
- User registration and login functionality
- Profile management features
- Role-based access control
- Password reset and recovery
- Basic admin functionality

**Sprint 4: Data Management**
- Core data models implementation
- CRUD operations for main entities
- Data validation and business rules
- Basic search and filtering
- Data export functionality

### Sprint 5-6: Business Logic (Weeks 9-12)
**Sprint 5: Core Business Features**
- Main business workflows
- Business rule enforcement
- Data processing and transformation
- Notification system
- Basic reporting features

**Sprint 6: Integration**
- Third-party API integrations
- Data synchronization features
- External service connections
- Integration testing
- Error handling and recovery

### Sprint 7-8: Advanced Features (Weeks 13-16)
**Sprint 7: Advanced UI/UX**
- Advanced user interface components
- Dashboard and analytics views
- Mobile responsiveness
- Accessibility improvements
- Performance optimizations

**Sprint 8: Reporting and Analytics**
- Advanced reporting features
- Data visualization components
- Custom report generation
- Performance dashboards
- Analytics integration

### Sprint 9-10: Testing and Polish (Weeks 17-20)
**Sprint 9: Testing and Quality**
- Comprehensive testing suite
- Performance testing and optimization
- Security testing and hardening
- Bug fixes and improvements
- Documentation updates

**Sprint 10: Deployment and Launch**
- Production environment setup
- Deployment automation
- User acceptance testing
- Launch preparation
- Post-launch monitoring

## User Stories Breakdown
### Epic 1: User Management
**Story 1.1**: User Registration
- **As a** new user
- **I want** to create an account
- **So that** I can access the system
- **Acceptance Criteria**:
  - Given I'm on the registration page
  - When I enter valid information
  - Then I should be able to create an account
- **Story Points**: 5
- **Sprint**: 3

**Story 1.2**: User Authentication
- **As a** registered user
- **I want** to log into the system
- **So that** I can access my account
- **Acceptance Criteria**:
  - Given I have valid credentials
  - When I enter them on the login page
  - Then I should be authenticated and redirected to dashboard
- **Story Points**: 3
- **Sprint**: 3

[Continue with 20+ more detailed user stories...]

## Acceptance Criteria
### Functional Acceptance Criteria
For each major feature:
- **Feature Name**: Clear feature description
- **Acceptance Criteria**: Given/When/Then scenarios
- **Test Cases**: Specific test scenarios
- **Definition of Done**: Completion criteria
- **Performance Criteria**: Speed and efficiency requirements

### Technical Acceptance Criteria
- **Code Quality**: Code review and standards compliance
- **Test Coverage**: Minimum 80% code coverage
- **Performance**: Response time requirements
- **Security**: Security scan and vulnerability assessment
- **Documentation**: Technical and user documentation

## Risk Management
### Technical Risks
- **Risk**: Third-party API availability
- **Mitigation**: Implement circuit breakers and fallback mechanisms
- **Contingency**: Alternative service providers identified

- **Risk**: Database performance issues
- **Mitigation**: Implement caching and query optimization
- **Contingency**: Database scaling and optimization plan

### Project Risks
- **Risk**: Team member availability
- **Mitigation**: Cross-training and knowledge sharing
- **Contingency**: Backup team members identified

- **Risk**: Scope creep
- **Mitigation**: Change control process and regular stakeholder communication
- **Contingency**: Priority-based feature deferral plan

## Quality Assurance
### Testing Strategy
- **Unit Testing**: 70% of testing effort, automated
- **Integration Testing**: 20% of testing effort, automated
- **End-to-End Testing**: 10% of testing effort, manual and automated
- **Performance Testing**: Load and stress testing
- **Security Testing**: Vulnerability and penetration testing

### Quality Gates
- **Code Review**: All code must be reviewed before merge
- **Automated Testing**: All tests must pass before deployment
- **Performance Testing**: Performance benchmarks must be met
- **Security Testing**: Security scans must pass
- **User Acceptance**: Stakeholder approval required

## Deployment Plan
### Deployment Strategy
- **Blue-Green Deployment**: Zero-downtime deployment strategy
- **Feature Flags**: Gradual feature rollout capability
- **Monitoring**: Real-time monitoring and alerting
- **Rollback**: Quick rollback procedures
- **Post-Deployment**: Health checks and validation

### Environment Progression
1. **Development**: Feature development and unit testing
2. **Testing**: Integration and system testing
3. **Staging**: User acceptance testing and performance testing
4. **Production**: Live system deployment

## Operational Runbook
### System Monitoring
- **Health Checks**: Automated system health monitoring
- **Performance Metrics**: Key performance indicators
- **Error Monitoring**: Error tracking and alerting
- **Business Metrics**: User activity and feature usage
- **Infrastructure Metrics**: Server and database performance

### Incident Response
- **Incident Classification**: Severity levels and response times
- **Escalation Process**: Who to contact and when
- **Communication Plan**: Stakeholder notification procedures
- **Recovery Procedures**: Step-by-step recovery instructions
- **Post-Incident Review**: Learning and improvement process

### Maintenance Procedures
- **Regular Backups**: Automated backup and recovery testing
- **Security Updates**: Patch management and vulnerability scanning
- **Performance Optimization**: Regular performance tuning
- **Data Maintenance**: Data cleanup and archival procedures
- **Documentation Updates**: Keeping documentation current

Format as a comprehensive project plan with clear timelines, responsibilities, and deliverables.`,

  uxSpec: `You are a Senior UX Designer with 15+ years of experience designing enterprise applications.
Create a comprehensive UX specification based on this project:

PROJECT REQUIREMENTS: {input}

Generate a detailed UX specification that includes:

## User Experience Strategy
### UX Vision and Goals
- **Product Vision**: Clear UX vision aligned with business objectives
- **User Experience Goals**: Specific UX objectives and success metrics
- **Design Principles**: Core principles guiding design decisions
- **Brand Alignment**: How UX supports brand identity and values

## User Research and Personas
### Primary User Personas (3-5 detailed personas)
- **Persona Name**: Memorable, descriptive name
- **Demographics**: Age, role, industry, location, education
- **Goals & Motivations**: What they want to achieve
- **Pain Points**: Current frustrations and challenges
- **Behavior Patterns**: How they work and make decisions
- **Technology Comfort**: Technical skill level and preferences

### User Journey Mapping
- **Awareness Stage**: How they discover the need/solution
- **Onboarding Stage**: First-time user experience
- **Usage Stage**: Regular usage patterns and workflows
- **Support Stage**: Help-seeking and problem-resolution

## Information Architecture
### Site Map and Navigation
- **Primary Navigation**: Main navigation structure
- **Content Hierarchy**: Information organization and grouping
- **Search Strategy**: Search functionality and findability
- **Mobile Navigation**: Mobile-specific navigation patterns

## Interaction Design
### User Interface Patterns
- **Layout Patterns**: Grid systems, page layouts, responsive design
- **Navigation Patterns**: Menu styles, breadcrumbs, pagination
- **Input Patterns**: Forms, search, filters, data entry
- **Feedback Patterns**: Success states, error states, loading states

## Visual Design System
### Design Language
- **Typography**: Font families, sizes, weights, line heights
- **Color Palette**: Primary, secondary, neutral, semantic colors
- **Iconography**: Icon style, sizing, usage guidelines
- **Spacing**: Margin, padding, and layout spacing rules

### Component Library
- **Buttons**: Primary, secondary, tertiary actions
- **Forms**: Input fields, dropdowns, checkboxes
- **Navigation**: Headers, sidebars, tabs
- **Data Display**: Tables, cards, lists
- **Feedback**: Alerts, modals, tooltips

## Wireframes and Prototypes
### Key Screens
- **Homepage**: Landing page layout and content structure
- **Dashboard**: Main application interface
- **List Views**: Data tables, search results
- **Detail Views**: Individual item pages
- **Forms**: Data entry, registration, settings

## Accessibility and Usability
### Accessibility Standards
- **WCAG Compliance**: Level AA compliance requirements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper semantic markup
- **Color Contrast**: Meeting contrast ratio requirements

## Responsive Design Strategy
### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

Format as a comprehensive UX specification with detailed descriptions and design guidelines.`
}

export async function POST(req: NextRequest) {
  try {
    const { 
      input, 
      openaiKey, 
      userId, 
      projectId, 
      detailLevel = 'enterprise' 
    }: EnhancedSDLCRequest = await req.json()

    if (!openaiKey || openaiKey.trim() === '') {
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 400 }
      )
    }

    const user = await getAuthenticatedUser()
    const effectiveUserId = userId || user?.id
    const startTime = Date.now()

    console.log('Generating enhanced SDLC documentation...')
    console.log('Detail Level:', detailLevel)
    console.log('User ID:', effectiveUserId)

    const openaiClient = createOpenAI({ apiKey: openaiKey })

    // Generate each section with enhanced prompts and higher token limits
    const generateSection = async (prompt: string, context: any = {}) => {
      let processedPrompt = prompt.replace(/\{input\}/g, input)
      
      // Add context from previous sections for continuity
      if (context.businessAnalysis) {
        processedPrompt += `\n\nContext from Business Analysis:\n${context.businessAnalysis.substring(0, 1500)}`
      }
      if (context.functionalSpec) {
        processedPrompt += `\n\nContext from Functional Spec:\n${context.functionalSpec.substring(0, 1500)}`
      }
      if (context.technicalSpec) {
        processedPrompt += `\n\nContext from Technical Spec:\n${context.technicalSpec.substring(0, 1500)}`
      }
      
      const result = await generateText({
        model: openaiClient("gpt-4o"),
        prompt: processedPrompt,
        maxTokens: 8000, // Significantly increased token limit
      })
      
      return result.text
    }

    // Generate Business Analysis with comprehensive sections
    console.log('Generating comprehensive business analysis...')
    const businessAnalysis = await generateSection(`${ENHANCED_PROMPTS.businessAnalysis}

## Additional Enterprise Requirements:

### Financial Analysis
- **ROI Projections**: 3-year financial forecast with break-even analysis
- **Cost-Benefit Analysis**: Detailed cost breakdown vs expected benefits
- **Budget Allocation**: Resource allocation across development phases
- **Risk-Adjusted NPV**: Net present value with risk considerations

### Stakeholder Impact Assessment
- **Change Impact**: How each stakeholder group will be affected
- **Training Requirements**: Skill development needs by role
- **Communication Plan**: Stakeholder-specific communication strategy
- **Success Metrics**: KPIs for each stakeholder group

### Competitive Positioning
- **Market Analysis**: Current market landscape and opportunities
- **Competitive Advantages**: How this solution differentiates
- **Threat Assessment**: Potential competitive responses
- **Market Entry Strategy**: Go-to-market approach

### Regulatory Compliance
- **Compliance Requirements**: Industry-specific regulations
- **Data Privacy**: GDPR, CCPA, and other privacy requirements
- **Security Standards**: SOC2, ISO 27001, and security frameworks
- **Audit Trail**: Compliance monitoring and reporting

Create a comprehensive business case that could be presented to a board of directors.`, {})

    // Generate Functional Specification with detailed technical requirements
    console.log('Generating detailed functional specification...')
    const functionalSpec = await generateSection(`${ENHANCED_PROMPTS.functionalSpec}

## Comprehensive Functional Requirements:

### Data Architecture
- **Data Models**: Complete entity relationship diagrams
- **Data Flow**: End-to-end data processing workflows
- **Data Validation**: Input validation and business rules
- **Data Retention**: Archival and deletion policies

### API Specifications
- **RESTful API Design**: Complete API documentation with OpenAPI specs
- **Authentication**: OAuth 2.0, JWT, and session management
- **Rate Limiting**: API throttling and usage policies
- **Error Handling**: Comprehensive error response formats

### Integration Requirements
- **Third-party Integrations**: External service connections
- **Data Synchronization**: Real-time and batch data sync
- **Webhook Support**: Event-driven integrations
- **Legacy System Integration**: Existing system connections

### Performance Specifications
- **Response Time**: Sub-second response requirements
- **Throughput**: Concurrent user and transaction limits
- **Scalability**: Auto-scaling and load balancing
- **Availability**: 99.9% uptime SLA requirements

### Security Requirements
- **Authentication**: Multi-factor authentication
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: At-rest and in-transit encryption
- **Audit Logging**: Comprehensive security audit trails

### User Interface Requirements
- **Responsive Design**: Mobile-first responsive layouts
- **Accessibility**: WCAG 2.1 AA compliance
- **Browser Support**: Cross-browser compatibility
- **Progressive Web App**: PWA capabilities

Create detailed functional specifications that development teams can implement directly.`, { businessAnalysis })

    // Generate Technical Specification with implementation details
    console.log('Generating comprehensive technical specification...')
    const technicalSpec = await generateSection(`${ENHANCED_PROMPTS.technicalSpec}

## Enterprise Technical Architecture:

### System Architecture
- **Microservices Design**: Service decomposition and boundaries
- **Event-Driven Architecture**: Asynchronous communication patterns
- **CQRS Pattern**: Command Query Responsibility Segregation
- **API Gateway**: Centralized API management and routing

### Technology Stack
- **Frontend**: React/Next.js with TypeScript
- **Backend**: Node.js/Python with microservices
- **Database**: PostgreSQL with Redis caching
- **Message Queue**: RabbitMQ/Apache Kafka
- **Container Orchestration**: Kubernetes with Docker

### Data Models
- **Database Schema**: Complete table structures with relationships
- **Indexing Strategy**: Query optimization and performance
- **Data Partitioning**: Horizontal and vertical partitioning
- **Backup Strategy**: Automated backups and disaster recovery

### Service Specifications
- **Service Contracts**: API contracts and SLAs
- **Service Discovery**: Dynamic service registration
- **Load Balancing**: Traffic distribution strategies
- **Circuit Breakers**: Fault tolerance patterns

### Deployment Strategy
- **Infrastructure as Code**: Terraform/CloudFormation
- **CI/CD Pipeline**: GitLab CI/Jenkins automation
- **Blue-Green Deployment**: Zero-downtime deployments
- **Monitoring**: Prometheus, Grafana, and ELK stack

### Security Implementation
- **Zero Trust Architecture**: Security-first design
- **Secrets Management**: HashiCorp Vault integration
- **Network Security**: VPC, subnets, and security groups
- **Compliance**: SOC2, ISO 27001 implementation

### Observability
- **Distributed Tracing**: Jaeger/Zipkin implementation
- **Metrics Collection**: Custom and system metrics
- **Log Aggregation**: Centralized logging strategy
- **Alerting**: Proactive monitoring and alerting

### Testing Strategy
- **Unit Testing**: 90%+ code coverage
- **Integration Testing**: API and service testing
- **End-to-End Testing**: User journey automation
- **Performance Testing**: Load and stress testing

Create production-ready technical specifications with detailed implementation guidance.`, { businessAnalysis, functionalSpec })

    // Generate Implementation Plan with detailed project management
    console.log('Generating detailed implementation plan...')
    const implementationPlan = await generateSection(`Create a comprehensive implementation plan for: {input}

## Enterprise Implementation Strategy:

### Project Management
- **Agile Methodology**: Scrum with 2-week sprints
- **Team Structure**: Cross-functional teams with clear roles
- **Communication Plan**: Daily standups, sprint reviews, retrospectives
- **Risk Management**: Risk register with mitigation strategies

### Sprint Breakdown
- **Epic Decomposition**: High-level epics broken into user stories
- **Story Estimation**: Planning poker and story points
- **Sprint Planning**: Capacity planning and velocity tracking
- **Definition of Done**: Clear completion criteria

### Resource Planning
- **Team Composition**: Developers, QA, DevOps, UX designers
- **Skill Requirements**: Technical and domain expertise needed
- **Training Plan**: Upskilling and knowledge transfer
- **Vendor Management**: Third-party service providers

### Quality Assurance
- **Testing Strategy**: Comprehensive testing approach
- **Code Review Process**: Peer review and quality gates
- **Automated Testing**: CI/CD pipeline integration
- **Performance Monitoring**: Continuous performance tracking

### Deployment Strategy
- **Environment Management**: Dev, staging, production environments
- **Release Management**: Controlled release process
- **Rollback Procedures**: Quick rollback capabilities
- **Post-Deployment Monitoring**: Health checks and monitoring

### Change Management
- **Stakeholder Communication**: Regular updates and demos
- **User Training**: Comprehensive training programs
- **Adoption Strategy**: Gradual rollout and feedback collection
- **Support Structure**: Help desk and documentation

### Operational Readiness
- **Runbook Creation**: Operational procedures and troubleshooting
- **Monitoring Setup**: Comprehensive monitoring and alerting
- **Backup Procedures**: Data backup and recovery processes
- **Security Procedures**: Security monitoring and incident response

### Post-Launch Support
- **Maintenance Plan**: Ongoing support and updates
- **Performance Optimization**: Continuous improvement
- **Feature Enhancement**: Future development roadmap
- **User Feedback**: Feedback collection and implementation

Create a detailed implementation plan that project managers can execute directly.`, { businessAnalysis, functionalSpec, technicalSpec })

    const generationTime = Date.now() - startTime

    // Generate UX specification for completeness
    console.log('Generating UX specification...')
    const uxSpec = await generateSection(ENHANCED_PROMPTS.uxSpec || `Create a comprehensive UX specification for: {input}
    
    Include user personas, user journeys, wireframes description, design system requirements, accessibility standards, usability testing plans, interaction design principles, information architecture, visual design guidelines, and prototyping approach.`, 
    { businessAnalysis, functionalSpec, technicalSpec })

    // Generate architecture/diagrams for completeness  
    console.log('Generating architecture diagrams...')
    const architecture = await generateSection(`Create comprehensive Mermaid diagrams for the system architecture based on: {input}
    
    Include system architecture diagram, database schema diagram, user flow diagram, and API sequence diagram. Format as proper Mermaid syntax with detailed descriptions.`, 
    { businessAnalysis, functionalSpec, technicalSpec })

    const generationTime = Date.now() - startTime

    // Standard response format matching other generation endpoints
    const response = {
      businessAnalysis,
      functionalSpec, 
      technicalSpec,
      uxSpec,
      mermaidDiagrams: architecture, // Use standard field name
      metadata: {
        generationTime,
        detailLevel,
        sectionsGenerated: 5,
        tokenEstimate: Math.floor((businessAnalysis.length + functionalSpec.length + technicalSpec.length + uxSpec.length + architecture.length) / 4),
        promptSources: {
          business: 'enhanced_prompts',
          functional: 'enhanced_prompts', 
          technical: 'enhanced_prompts',
          ux: 'enhanced_prompts',
          architecture: 'enhanced_prompts'
        }
      }
    }

    console.log(`Enhanced SDLC documentation generated in ${generationTime}ms`)
    return NextResponse.json(response)

  } catch (error) {
    console.error("Error generating enhanced SDLC documentation:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to generate enhanced SDLC documentation" 
    }, { status: 500 })
  }
} 