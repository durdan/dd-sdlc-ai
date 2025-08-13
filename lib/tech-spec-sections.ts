/**
 * Technical Specification Sections
 * Provides specialized prompts for different technical focus areas
 */

export interface TechSpecSection {
  id: string
  name: string
  icon: string
  description: string
  detailedDescription: string
  bestFor: string[]
  outputSections: string[]
  requiredContext: ('business' | 'functional' | 'technical')[]
  prompt: string
}

export const techSpecSections: Record<string, TechSpecSection> = {
  'system-architecture': {
    id: 'system-architecture',
    name: 'System Architecture',
    icon: '🏗️',
    description: 'High-level system design and component breakdown',
    detailedDescription: 'Comprehensive system architecture design including component separation, service boundaries, technology stack selection, and integration strategies.',
    bestFor: [
      'Clear component separation and service design',
      'Technology selection guidance',
      'Scalability planning',
      'Integration with multiple systems'
    ],
    outputSections: [
      'Component Architecture Diagram',
      'Technology Stack Analysis',
      'Communication Patterns (REST, GraphQL, messaging)',
      'Scalability Design (horizontal/vertical scaling)',
      'Deployment Architecture'
    ],
    requiredContext: ['business', 'functional'],
    prompt: `As a Senior Solutions Architect with expertise in modern system design, create a comprehensive system architecture specification with professional formatting.

Context:
Business Analysis: {{business_analysis}}
Functional Requirements: {{functional_spec}}

Generate a detailed System Architecture document with clean, professional formatting:

# System Architecture Specification

## 1. Architecture Overview

### 1.1 Architecture Style
> **Selected Architecture:** [Monolithic/Microservices/Serverless/Event-Driven]
>
> **Justification:**
> - Primary benefit: [Key advantage]
> - Scalability: [How it enables scaling]
> - Maintainability: [Maintenance benefits]
> - Team structure fit: [Alignment with team organization]

### 1.2 Design Principles

| Principle | Description | Implementation Strategy |
|-----------|-------------|------------------------|
| **Separation of Concerns** | Each component handles specific business capability | Bounded contexts and clear service boundaries |
| **Loose Coupling** | Minimize dependencies between components | API-first design, event-driven communication |
| **High Cohesion** | Related functionality grouped together | Domain-driven design patterns |
| **Resilience** | System continues operating during failures | Circuit breakers, retries, fallbacks |
| **Scalability** | Handle increased load efficiently | Horizontal scaling, caching, async processing |

### 1.3 System Boundaries

#### In Scope
- ✅ [List components/features included]
- ✅ [External integrations]
- ✅ [User interfaces]

#### Out of Scope
- ❌ [Explicitly excluded components]
- ❌ [External systems not integrated]
- ❌ [Future phase items]

## 2. Component Architecture

### 2.1 Core Components

#### 📦 **[Component Name]**
| Aspect | Details |
|--------|---------|
| **Purpose** | [Clear description of responsibilities] |
| **Technology** | [Language, framework, runtime] |
| **API Type** | [REST/GraphQL/gRPC] |
| **Data Store** | [Database/cache used] |
| **Dependencies** | [Other components it relies on] |
| **Scaling Strategy** | [How it scales] |

**Key Endpoints:**
- \`POST /api/v1/[resource]\` - [Description]
- \`GET /api/v1/[resource]/{id}\` - [Description]
- \`PUT /api/v1/[resource]/{id}\` - [Description]
- \`DELETE /api/v1/[resource]/{id}\` - [Description]

### 2.2 Infrastructure Components

#### 🔧 **Load Balancing**
- **Technology:** [AWS ALB/NGINX/HAProxy]
- **Algorithm:** [Round-robin/Least connections/IP Hash]
- **Health Checks:** [HTTP/TCP with specific endpoints]
- **SSL Termination:** [Yes/No, certificate management]

#### 🔧 **API Gateway**
- **Solution:** [Kong/AWS API Gateway/Apigee]
- **Features:**
  - Rate limiting: [Requests per second/minute]
  - Authentication: [OAuth/API Keys/JWT]
  - Request routing: [Path/Header based]
  - Response caching: [TTL and invalidation strategy]

## 3. Technology Stack

### 3.1 Frontend Technologies

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| **Framework** | React | 18.x | Component reusability, large ecosystem |
| **State Management** | Redux Toolkit | 2.x | Predictable state, DevTools support |
| **Styling** | Tailwind CSS | 3.x | Utility-first, rapid development |
| **Build Tool** | Vite | 5.x | Fast builds, HMR support |
| **Testing** | Jest + RTL | Latest | Comprehensive testing capabilities |
| **Type Safety** | TypeScript | 5.x | Type safety, better IDE support |

### 3.2 Backend Technologies

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| **Runtime** | Node.js | 20.x LTS | Event-driven, npm ecosystem |
| **Framework** | NestJS | 10.x | Enterprise-grade, TypeScript-first |
| **Database** | PostgreSQL | 15.x | ACID compliance, JSON support |
| **Cache** | Redis | 7.x | In-memory performance, pub/sub |
| **Message Queue** | RabbitMQ | 3.12 | Reliable messaging, multiple patterns |
| **ORM** | Prisma | 5.x | Type-safe, migrations support |

### 3.3 Infrastructure & DevOps

| Category | Technology | Purpose |
|----------|------------|---------|
| **Cloud Platform** | AWS | Comprehensive services, global reach |
| **Container Runtime** | Docker | Consistent environments |
| **Orchestration** | Kubernetes/ECS | Container management at scale |
| **CI/CD** | GitHub Actions | Integrated with repository |
| **IaC** | Terraform | Declarative infrastructure |
| **Monitoring** | DataDog | Full-stack observability |
| **Log Management** | ELK Stack | Centralized logging and analysis |

## 4. Communication Patterns

### 4.1 Synchronous Communication

#### REST API Design
\`\`\`yaml
API Standards:
  Version: v1
  Format: JSON
  Authentication: Bearer tokens (JWT)
  Rate Limiting: 1000 req/min per client
  
Standard Endpoints:
  - GET    /api/v1/{resource}      # List with pagination
  - GET    /api/v1/{resource}/{id} # Get single resource
  - POST   /api/v1/{resource}      # Create new resource
  - PUT    /api/v1/{resource}/{id} # Full update
  - PATCH  /api/v1/{resource}/{id} # Partial update
  - DELETE /api/v1/{resource}/{id} # Remove resource
\`\`\`

### 4.2 Asynchronous Communication

| Pattern | Technology | Use Case | Guarantees |
|---------|------------|----------|------------|
| **Message Queue** | RabbitMQ | Task processing, order fulfillment | At-least-once delivery |
| **Event Streaming** | Apache Kafka | Real-time analytics, event sourcing | Ordered, persistent |
| **Pub/Sub** | Redis | Cache invalidation, notifications | Best-effort delivery |
| **WebSockets** | Socket.io | Live updates, chat features | Real-time bidirectional |

## 5. Scalability Design

### 5.1 Horizontal Scaling Strategy

#### Auto-Scaling Configuration
\`\`\`yaml
Scaling Metrics:
  - CPU Utilization > 70%     → Scale up
  - Memory Usage > 80%         → Scale up
  - Request Queue > 100        → Scale up
  - CPU Utilization < 30%     → Scale down (after 10 min)
  
Instance Limits:
  Minimum: 2 instances (high availability)
  Maximum: 20 instances (cost control)
  Scale-up Rate: 2 instances per trigger
  Scale-down Rate: 1 instance per trigger
\`\`\`

### 5.2 Performance Optimization

| Component | Strategy | Target Metric |
|-----------|----------|---------------|
| **Database** | Read replicas, query optimization | < 100ms query time |
| **API Gateway** | Response caching, CDN | < 200ms response time |
| **Application** | Memory caching, connection pooling | < 500ms request processing |
| **Static Assets** | CDN distribution, compression | < 50ms load time |

## 6. Deployment Architecture

### 6.1 Environment Strategy

| Environment | Purpose | Configuration | Deployment Frequency |
|-------------|---------|---------------|---------------------|
| **Development** | Local development | Docker Compose, mocked services | On-demand |
| **Testing** | Automated testing | Isolated, reset daily | Per commit |
| **Staging** | Pre-production validation | Production-like, reduced scale | Daily |
| **Production** | Live system | Full scale, multi-region | Weekly releases |

### 6.2 CI/CD Pipeline

\`\`\`mermaid
graph LR
    A[Code Commit] --> B[Build & Test]
    B --> C{Tests Pass?}
    C -->|Yes| D[Deploy to Staging]
    C -->|No| E[Notify Developer]
    D --> F[Integration Tests]
    F --> G{Approved?}
    G -->|Yes| H[Deploy to Production]
    G -->|No| E
    H --> I[Health Checks]
    I --> J[Monitor & Alert]
\`\`\`

## 7. Security Architecture

### 7.1 Security Layers

| Layer | Protection Mechanism | Implementation |
|-------|---------------------|----------------|
| **Network** | WAF, DDoS protection | CloudFlare, AWS Shield |
| **Application** | Input validation, CORS | OWASP Top 10 compliance |
| **API** | Rate limiting, authentication | OAuth 2.0, API keys |
| **Data** | Encryption at rest/transit | AES-256, TLS 1.3 |
| **Infrastructure** | Network segmentation | VPC, security groups |

### 7.2 Compliance & Standards

- ✅ **GDPR Compliance**: Data privacy and user rights
- ✅ **PCI DSS**: Payment card data security
- ✅ **SOC 2 Type II**: Security controls audit
- ✅ **ISO 27001**: Information security management

## 8. Monitoring & Observability

### 8.1 Metrics Dashboard

| Metric Category | Key Indicators | Alert Threshold |
|-----------------|----------------|------------------|
| **Application** | Response time, error rate | > 1s, > 1% |
| **Infrastructure** | CPU, memory, disk | > 80% |
| **Business** | Transactions/sec, conversion rate | < baseline -20% |
| **Security** | Failed auth attempts, suspicious activity | > 10/min |

### 8.2 Logging Strategy

\`\`\`yaml
Log Levels:
  ERROR: System errors, exceptions
  WARN: Performance issues, deprecated usage
  INFO: Business events, user actions
  DEBUG: Detailed execution flow (dev only)

Retention Policy:
  Production Logs: 30 days hot, 1 year cold storage
  Security Logs: 7 years (compliance requirement)
  Debug Logs: 7 days (staging only)
\`\`\`

Provide comprehensive technical details with specific configurations, code examples, and clear visual representations for implementation teams.`
  },

  'data-design': {
    id: 'data-design',
    name: 'Data Design',
    icon: '📊',
    description: 'Database schema design and data modeling',
    detailedDescription: 'Complete data architecture including database design, data flow, storage strategies, and data governance requirements.',
    bestFor: [
      'Complex data relationships and storage design',
      'Data processing and analytics requirements',
      'Multi-database architecture',
      'Data migration strategies'
    ],
    outputSections: [
      'Entity Relationship Diagrams',
      'Database Schema Specifications',
      'Data Flow Architecture',
      'Storage Technology Selection',
      'Data Governance Framework'
    ],
    requiredContext: ['business', 'functional'],
    prompt: `As a Senior Data Architect with expertise in data modeling and database design, create a comprehensive data design specification.

Context:
Business Requirements: {{business_analysis}}
Functional Specification: {{functional_spec}}

Generate a detailed Data Design document including:

## 1. Data Architecture Overview
- **Data Strategy**: [Centralized/Distributed/Hybrid]
- **Storage Strategy**: [SQL/NoSQL/Data Lake/Data Warehouse]
- **Data Governance**: [Ownership and stewardship]

## 2. Conceptual Data Model
### Business Entities
- **Entity Name**: [Business description]
- **Key Attributes**: [Important properties]
- **Business Rules**: [Constraints and validations]
- **Relationships**: [How entities connect]

## 3. Logical Data Model
### Entity Relationship Diagram
\`\`\`sql
-- Core Entities
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Data Dictionary
- **Table Name**: [Purpose and contents]
- **Column Specifications**: [Data types and constraints]
- **Indexes**: [Performance optimization]
- **Relationships**: [Foreign keys and joins]

## 4. Physical Data Model
### Database Selection
- **Primary Database**: [PostgreSQL/MySQL/MongoDB]
- **Cache Layer**: [Redis/Memcached]
- **Search Engine**: [Elasticsearch/Solr]
- **Analytics Store**: [ClickHouse/BigQuery]

### Partitioning Strategy
- **Horizontal Partitioning**: [Sharding strategy]
- **Vertical Partitioning**: [Table splitting]
- **Time-based Partitioning**: [Historical data]

## 5. Data Flow Architecture
### Data Ingestion
- **Batch Processing**: [ETL pipelines]
- **Stream Processing**: [Real-time data]
- **API Integration**: [External data sources]

### Data Processing
- **Transformation Rules**: [Data cleaning and enrichment]
- **Aggregation Logic**: [Summary calculations]
- **Validation Rules**: [Data quality checks]

## 6. Storage Design
### Storage Tiers
- **Hot Storage**: [Frequently accessed data]
- **Warm Storage**: [Occasional access]
- **Cold Storage**: [Archive data]

### Backup Strategy
- **Backup Frequency**: [RPO requirements]
- **Retention Policy**: [Data lifecycle]
- **Recovery Procedures**: [RTO requirements]

## 7. Data Security
### Access Control
- **Row-level Security**: [Data isolation]
- **Column-level Security**: [Sensitive fields]
- **Encryption**: [At-rest and in-transit]

### Compliance
- **GDPR**: [Personal data handling]
- **Data Residency**: [Geographic requirements]
- **Audit Trail**: [Change tracking]

## 8. Performance Optimization
### Indexing Strategy
- **Primary Indexes**: [Unique constraints]
- **Secondary Indexes**: [Query optimization]
- **Full-text Indexes**: [Search functionality]

### Query Optimization
- **Materialized Views**: [Pre-computed results]
- **Query Caching**: [Result caching]
- **Connection Pooling**: [Resource management]

## 9. Data Migration
### Migration Strategy
- **Phased Migration**: [Incremental approach]
- **Data Validation**: [Consistency checks]
- **Rollback Plan**: [Recovery procedures]

Format as a professional data architecture document with clear ERD diagrams and SQL examples.`
  },

  'api-specifications': {
    id: 'api-specifications',
    name: 'API Specifications',
    icon: '🔗',
    description: 'RESTful API design and endpoint specifications',
    detailedDescription: 'Complete API design including endpoints, authentication, request/response formats, and API documentation standards.',
    bestFor: [
      'Clear API contracts for frontend/backend separation',
      'Third-party integration specifications',
      'Microservices communication design',
      'Public API development'
    ],
    outputSections: [
      'OpenAPI/Swagger Specifications',
      'Authentication Design (OAuth, JWT, API keys)',
      'Endpoint Documentation',
      'Error Response Standards',
      'Rate Limiting and Security Policies'
    ],
    requiredContext: ['functional'],
    prompt: `As a Senior API Architect with expertise in RESTful design and API standards, create comprehensive API specifications.

Context:
Functional Requirements: {{functional_spec}}

Generate detailed API Specifications including:

## 1. API Overview
- **API Style**: [REST/GraphQL/gRPC]
- **Version Strategy**: [URL/Header/Accept]
- **Base URL**: [https://api.example.com/v1]
- **Authentication**: [OAuth 2.0/JWT/API Keys]

## 2. Authentication & Authorization
### Authentication Methods
\`\`\`yaml
OAuth2:
  type: oauth2
  flows:
    authorizationCode:
      authorizationUrl: https://auth.example.com/authorize
      tokenUrl: https://auth.example.com/token
      scopes:
        read: Read access
        write: Write access
        admin: Admin access
\`\`\`

### Security Schemes
- **JWT Bearer**: [Token-based authentication]
- **API Keys**: [Key management and rotation]
- **OAuth Scopes**: [Permission levels]

## 3. API Endpoints
### Resource: Users
#### GET /users
\`\`\`yaml
summary: List all users
parameters:
  - name: page
    in: query
    type: integer
    default: 1
  - name: limit
    in: query
    type: integer
    default: 20
responses:
  200:
    description: Successful response
    schema:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/definitions/User'
        pagination:
          $ref: '#/definitions/Pagination'
\`\`\`

#### POST /users
\`\`\`yaml
summary: Create a new user
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        required:
          - email
          - name
        properties:
          email:
            type: string
            format: email
          name:
            type: string
            minLength: 2
            maxLength: 100
responses:
  201:
    description: User created successfully
  400:
    description: Validation error
  409:
    description: User already exists
\`\`\`

## 4. Data Models
### User Model
\`\`\`json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user|admin",
  "status": "active|inactive",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
\`\`\`

## 5. Request/Response Standards
### Request Headers
- **Content-Type**: application/json
- **Accept**: application/json
- **Authorization**: Bearer {token}
- **X-Request-ID**: UUID for tracing

### Response Format
\`\`\`json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2024-01-15T10:00:00Z",
    "version": "1.0.0"
  }
}
\`\`\`

## 6. Error Handling
### Error Response Format
\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:00:00Z",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
\`\`\`

### HTTP Status Codes
- **200**: OK - Successful GET/PUT
- **201**: Created - Successful POST
- **204**: No Content - Successful DELETE
- **400**: Bad Request - Validation errors
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Resource already exists
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error

## 7. Rate Limiting
### Rate Limit Headers
- **X-RateLimit-Limit**: 1000
- **X-RateLimit-Remaining**: 999
- **X-RateLimit-Reset**: 1642248000

### Rate Limit Tiers
- **Basic**: 100 requests/hour
- **Standard**: 1000 requests/hour
- **Premium**: 10000 requests/hour

## 8. Pagination
### Query Parameters
- **page**: Current page number
- **limit**: Items per page
- **sort**: Sort field and order
- **filter**: Filter criteria

### Response Metadata
\`\`\`json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
\`\`\`

## 9. Versioning Strategy
### Version in URL
- **/v1/users** - Version 1
- **/v2/users** - Version 2

### Deprecation Policy
- **Notice Period**: 6 months
- **Sunset Header**: Sunset: Sat, 31 Dec 2024 23:59:59 GMT
- **Migration Guide**: Documentation for upgrading

## 10. API Documentation
### OpenAPI Specification
- **Swagger UI**: Interactive documentation
- **Postman Collection**: Ready-to-use requests
- **Code Examples**: Multiple languages
- **SDKs**: Client libraries

Format as a professional API specification document with OpenAPI/Swagger definitions and clear examples.`
  },

  'security-architecture': {
    id: 'security-architecture',
    name: 'Security Architecture',
    icon: '🔒',
    description: 'Authentication, authorization, and security framework',
    detailedDescription: 'Comprehensive security design including authentication, authorization, data protection, compliance, and security testing approaches.',
    bestFor: [
      'Regulatory compliance requirements',
      'Sensitive data handling',
      'Enterprise security standards',
      'Multi-tenant security models'
    ],
    outputSections: [
      'Identity and Access Management Design',
      'Data Protection and Encryption Strategy',
      'Security Controls Framework',
      'Compliance Requirements Mapping',
      'Security Testing Procedures'
    ],
    requiredContext: ['business', 'functional'],
    prompt: `As a Senior Security Architect with expertise in enterprise security and compliance, create a comprehensive security architecture specification.

Context:
Business Requirements: {{business_analysis}}
Functional Specification: {{functional_spec}}

Generate a detailed Security Architecture document including:

## 1. Security Architecture Overview
- **Security Principles**: [Defense in depth, least privilege, zero trust]
- **Threat Model**: [STRIDE analysis]
- **Risk Assessment**: [Critical assets and vulnerabilities]
- **Compliance Requirements**: [GDPR, HIPAA, SOC2, PCI DSS]

## 2. Identity and Access Management (IAM)
### Authentication Architecture
- **Authentication Methods**:
  - Multi-factor Authentication (MFA)
  - Single Sign-On (SSO)
  - Biometric Authentication
  - Certificate-based Authentication

### Authorization Framework
- **Access Control Model**: [RBAC/ABAC/ReBAC]
- **Permission Structure**:
  \`\`\`json
  {
    "role": "admin",
    "permissions": [
      "users:read",
      "users:write",
      "users:delete",
      "settings:manage"
    ]
  }
  \`\`\`

### Identity Federation
- **SAML 2.0**: Enterprise SSO
- **OAuth 2.0**: Third-party integrations
- **OpenID Connect**: User authentication

## 3. Data Security
### Data Classification
- **Public**: No restrictions
- **Internal**: Company use only
- **Confidential**: Restricted access
- **Secret**: Highly sensitive

### Encryption Strategy
#### Data at Rest
- **Database Encryption**: AES-256
- **File Storage**: Client-side encryption
- **Backup Encryption**: Encrypted snapshots

#### Data in Transit
- **TLS 1.3**: All communications
- **mTLS**: Service-to-service
- **VPN**: Remote access

### Key Management
- **Key Storage**: Hardware Security Module (HSM)
- **Key Rotation**: Automated quarterly
- **Key Recovery**: Secure escrow process

## 4. Application Security
### Secure Development
- **SAST**: Static code analysis
- **DAST**: Dynamic testing
- **Dependency Scanning**: Vulnerability detection
- **Code Review**: Security-focused reviews

### Input Validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Output encoding
- **CSRF Protection**: Token validation
- **File Upload Security**: Type and size validation

### Session Management
- **Session Timeout**: 30 minutes idle
- **Session Storage**: Secure, httpOnly cookies
- **Session Invalidation**: Logout and password change

## 5. Network Security
### Network Architecture
- **DMZ**: Public-facing services
- **Internal Network**: Segmented VLANs
- **Management Network**: Isolated admin access

### Firewall Rules
- **Ingress Rules**: Whitelist approach
- **Egress Rules**: Restricted outbound
- **WAF Rules**: OWASP Top 10 protection

### DDoS Protection
- **Rate Limiting**: Per-IP and per-user
- **CDN**: Geographic distribution
- **Scrubbing**: Traffic filtering

## 6. Infrastructure Security
### Cloud Security
- **IAM Policies**: Least privilege
- **Security Groups**: Network isolation
- **VPC Design**: Private subnets
- **Secrets Management**: AWS Secrets Manager/Azure Key Vault

### Container Security
- **Image Scanning**: Vulnerability detection
- **Runtime Protection**: Behavioral monitoring
- **Network Policies**: Pod-to-pod communication
- **Admission Control**: Policy enforcement

## 7. Compliance and Governance
### Regulatory Compliance
#### GDPR
- **Data Privacy**: User consent management
- **Right to Erasure**: Data deletion procedures
- **Data Portability**: Export capabilities

#### HIPAA
- **PHI Protection**: Encryption and access controls
- **Audit Logs**: Comprehensive logging
- **Business Associate Agreements**: Third-party compliance

### Security Policies
- **Password Policy**: Complexity and rotation
- **Access Control Policy**: Role assignments
- **Incident Response Policy**: Detection and response
- **Data Retention Policy**: Storage and deletion

## 8. Security Monitoring
### Logging and Auditing
- **Audit Events**:
  - Authentication attempts
  - Authorization failures
  - Data access
  - Configuration changes

### SIEM Integration
- **Log Aggregation**: Centralized logging
- **Correlation Rules**: Attack detection
- **Alerting**: Real-time notifications
- **Dashboards**: Security metrics

### Threat Detection
- **Anomaly Detection**: ML-based analysis
- **Threat Intelligence**: IOC feeds
- **Behavioral Analysis**: User behavior analytics

## 9. Incident Response
### Response Plan
1. **Detection**: Alert triggered
2. **Triage**: Severity assessment
3. **Containment**: Limit damage
4. **Eradication**: Remove threat
5. **Recovery**: Restore services
6. **Lessons Learned**: Post-mortem

### Security Operations
- **SOC Team**: 24/7 monitoring
- **Playbooks**: Automated responses
- **Forensics**: Evidence collection

## 10. Security Testing
### Penetration Testing
- **Frequency**: Quarterly
- **Scope**: Full application and infrastructure
- **Methodology**: OWASP/PTES

### Vulnerability Management
- **Scanning**: Weekly automated scans
- **Patching**: Critical within 24 hours
- **Risk Assessment**: CVSS scoring

Format as a professional security architecture document with clear threat models and mitigation strategies.`
  },

  'infrastructure-devops': {
    id: 'infrastructure-devops',
    name: 'Infrastructure & DevOps',
    icon: '⚙️',
    description: 'Cloud infrastructure design and CI/CD pipelines',
    detailedDescription: 'Complete infrastructure design including cloud architecture, CI/CD pipelines, monitoring strategies, and disaster recovery procedures.',
    bestFor: [
      'Cloud deployment and infrastructure planning',
      'Automated deployment pipelines',
      'Production monitoring and operations',
      'Scalability and reliability requirements'
    ],
    outputSections: [
      'Infrastructure as Code Templates',
      'CI/CD Pipeline Design',
      'Monitoring and Alerting Strategy',
      'Backup and Disaster Recovery Plan',
      'Performance Optimization Guidelines'
    ],
    requiredContext: ['technical'],
    prompt: `As a Senior DevOps Engineer with expertise in cloud infrastructure and automation, create a comprehensive infrastructure and DevOps specification.

Context:
Technical Specification: {{technical_spec}}

Generate a detailed Infrastructure & DevOps document including:

## 1. Infrastructure Overview
- **Cloud Strategy**: [Multi-cloud/Hybrid/Single provider]
- **Architecture Pattern**: [Microservices/Serverless/Containers]
- **Deployment Model**: [Blue-Green/Canary/Rolling]
- **High Availability**: [Multi-region/Multi-AZ]

## 2. Cloud Infrastructure Design
### AWS Architecture
\`\`\`yaml
# Infrastructure as Code - Terraform
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  
  tags = {
    Name = "production-vpc"
    Environment = "production"
  }
}

resource "aws_subnet" "public" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  map_public_ip_on_launch = true
}

resource "aws_eks_cluster" "main" {
  name = "production-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  
  vpc_config {
    subnet_ids = [aws_subnet.public.id]
  }
}
\`\`\`

### Kubernetes Configuration
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
\`\`\`

## 3. CI/CD Pipeline
### Pipeline Stages
\`\`\`yaml
# GitHub Actions Workflow
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Tests
        run: |
          npm install
          npm test
          npm run lint
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker Image
        run: |
          docker build -t myapp:$GITHUB_SHA .
          docker push registry/myapp:$GITHUB_SHA
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/app app=myapp:$GITHUB_SHA
          kubectl rollout status deployment/app
\`\`\`

### Deployment Strategies
- **Blue-Green Deployment**: Zero-downtime deployments
- **Canary Releases**: Gradual rollout
- **Feature Flags**: Progressive feature enablement

## 4. Container Management
### Docker Configuration
\`\`\`dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]
\`\`\`

### Container Registry
- **Registry**: Amazon ECR/Docker Hub
- **Image Scanning**: Vulnerability detection
- **Image Signing**: Content trust

## 5. Monitoring & Observability
### Metrics Collection
\`\`\`yaml
# Prometheus Configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
\`\`\`

### Logging Architecture
- **Log Aggregation**: ELK Stack/CloudWatch
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Retention**: 30 days hot, 90 days cold

### Alerting Rules
\`\`\`yaml
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
\`\`\`

## 6. Auto-Scaling Configuration
### Horizontal Pod Autoscaler
\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
\`\`\`

### Cluster Autoscaling
- **Node Groups**: Min 2, Max 20 nodes
- **Scaling Metrics**: CPU, Memory, Custom
- **Spot Instances**: Cost optimization

## 7. Backup & Disaster Recovery
### Backup Strategy
- **Database Backups**: Daily automated snapshots
- **Application State**: Persistent volume snapshots
- **Configuration**: Git-based versioning

### Disaster Recovery Plan
- **RTO**: 1 hour
- **RPO**: 15 minutes
- **Failover Process**: Automated with manual approval
- **Recovery Testing**: Monthly drills

## 8. Security & Compliance
### Infrastructure Security
- **Network Policies**: Kubernetes NetworkPolicy
- **Secrets Management**: HashiCorp Vault
- **IAM Roles**: Least privilege access
- **Security Scanning**: Trivy, Snyk

### Compliance Automation
- **Policy as Code**: Open Policy Agent
- **Compliance Scanning**: Cloud Custodian
- **Audit Logging**: CloudTrail/Azure Monitor

## 9. Performance Optimization
### Resource Optimization
- **Right-sizing**: Instance type selection
- **Reserved Instances**: Cost savings
- **Spot Instances**: Non-critical workloads
- **Auto-shutdown**: Development environments

### CDN Configuration
- **CloudFront/Cloudflare**: Static content
- **Cache Headers**: Optimized TTLs
- **Compression**: Gzip/Brotli

## 10. Documentation & Runbooks
### Operational Runbooks
- **Deployment Procedures**: Step-by-step guides
- **Rollback Procedures**: Emergency responses
- **Troubleshooting Guides**: Common issues
- **Maintenance Windows**: Scheduled updates

Format as a professional DevOps specification with Infrastructure as Code examples and automation scripts.`
  },

  'performance-scale': {
    id: 'performance-scale',
    name: 'Performance & Scale',
    icon: '⚡',
    description: 'Performance requirements and scaling strategies',
    detailedDescription: 'Comprehensive performance engineering including requirements, testing strategies, caching, load balancing, and optimization techniques.',
    bestFor: [
      'High-performance requirements',
      'Large-scale user bases',
      'Real-time processing needs',
      'Performance optimization strategies'
    ],
    outputSections: [
      'Performance Requirements Specification',
      'Caching Architecture Design',
      'Load Testing Strategy',
      'Database Optimization Plan',
      'Scalability Implementation Guide'
    ],
    requiredContext: ['functional', 'technical'],
    prompt: `As a Senior Performance Engineer with expertise in high-scale systems, create a comprehensive performance and scalability specification.

Context:
Functional Requirements: {{functional_spec}}
Technical Specification: {{technical_spec}}

Generate a detailed Performance & Scale document including:

## 1. Performance Requirements
### Response Time SLAs
- **API Response Times**:
  - p50: < 100ms
  - p95: < 500ms
  - p99: < 1000ms
- **Page Load Times**:
  - First Contentful Paint: < 1.5s
  - Time to Interactive: < 3.5s
  - Largest Contentful Paint: < 2.5s

### Throughput Requirements
- **Concurrent Users**: 10,000 simultaneous
- **Requests per Second**: 5,000 RPS
- **Data Processing**: 1M events/minute
- **File Uploads**: 100 concurrent uploads

### Availability Targets
- **Uptime SLA**: 99.99% (52 minutes downtime/year)
- **Recovery Time Objective**: < 1 hour
- **Recovery Point Objective**: < 15 minutes

## 2. Performance Architecture
### Load Balancing Strategy
\`\`\`nginx
upstream backend {
    least_conn;
    server backend1.example.com weight=5;
    server backend2.example.com weight=3;
    server backend3.example.com max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }
}
\`\`\`

### Connection Pooling
\`\`\`javascript
// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  statement_timeout: 5000,
  query_timeout: 10000
});
\`\`\`

## 3. Caching Architecture
### Multi-Layer Caching
#### Browser Cache
\`\`\`http
Cache-Control: public, max-age=31536000, immutable
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Vary: Accept-Encoding
\`\`\`

#### CDN Cache
- **Static Assets**: 1 year TTL
- **API Responses**: 5 minutes TTL
- **Invalidation**: Tag-based purging

#### Application Cache
\`\`\`javascript
// Redis caching strategy
const cacheKey = \`user:\${userId}\`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const data = await database.query(...);
await redis.setex(cacheKey, 3600, JSON.stringify(data));
return data;
\`\`\`

#### Database Cache
- **Query Result Cache**: In-memory caching
- **Materialized Views**: Pre-computed aggregates
- **Read Replicas**: Distributed read load

## 4. Database Optimization
### Query Optimization
\`\`\`sql
-- Optimized query with proper indexing
CREATE INDEX idx_users_email_status ON users(email, status) 
WHERE status = 'active';

CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC)
INCLUDE (total_amount, status);

-- Partitioned table for time-series data
CREATE TABLE events (
    id BIGSERIAL,
    created_at TIMESTAMP NOT NULL,
    event_type VARCHAR(50),
    data JSONB
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2024_01 PARTITION OF events
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
\`\`\`

### Connection Management
- **Connection Pooling**: PgBouncer configuration
- **Read/Write Splitting**: Primary/replica routing
- **Query Timeout**: 5 second maximum

## 5. Application Performance
### Code Optimization
\`\`\`javascript
// Batch processing example
async function processBatch(items, batchSize = 100) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    );
    results.push(...batchResults);
    
    // Prevent memory buildup
    if (global.gc) global.gc();
  }
  
  return results;
}

// Memoization for expensive operations
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};
\`\`\`

### Async Processing
- **Message Queues**: Background job processing
- **Worker Pools**: CPU-intensive tasks
- **Event Streaming**: Real-time data processing

## 6. Scalability Design
### Horizontal Scaling
\`\`\`yaml
# Kubernetes HPA configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deployment
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: 1000
\`\`\`

### Data Sharding
- **Shard Key**: User ID or tenant ID
- **Shard Distribution**: Consistent hashing
- **Cross-shard Queries**: Minimized

## 7. Load Testing Strategy
### Test Scenarios
\`\`\`javascript
// k6 load test script
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '5m', target: 100 },  // Ramp up
    { duration: '10m', target: 100 }, // Stay at 100 users
    { duration: '5m', target: 500 },  // Spike to 500
    { duration: '10m', target: 500 }, // Stay at 500
    { duration: '5m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  let response = http.get('https://api.example.com/endpoint');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
\`\`\`

### Performance Metrics
- **Latency Percentiles**: p50, p95, p99
- **Error Rates**: < 0.1%
- **Throughput**: Requests per second
- **Resource Utilization**: CPU, memory, I/O

## 8. Real-time Performance
### WebSocket Optimization
\`\`\`javascript
// WebSocket connection management
const ws = new WebSocket('wss://api.example.com/ws');
ws.binaryType = 'arraybuffer'; // Binary for performance

// Message batching
const messageBatch = [];
const BATCH_SIZE = 10;
const BATCH_TIMEOUT = 100; // ms

function sendMessage(msg) {
  messageBatch.push(msg);
  
  if (messageBatch.length >= BATCH_SIZE) {
    flushMessages();
  } else {
    setTimeout(flushMessages, BATCH_TIMEOUT);
  }
}

function flushMessages() {
  if (messageBatch.length > 0) {
    ws.send(JSON.stringify(messageBatch));
    messageBatch.length = 0;
  }
}
\`\`\`

### Server-Sent Events
- **Connection Management**: Connection pooling
- **Message Compression**: gzip compression
- **Heartbeat**: Keep-alive mechanism

## 9. Content Delivery
### CDN Strategy
- **Geographic Distribution**: Edge locations
- **Cache Invalidation**: Smart purging
- **Image Optimization**: WebP, AVIF formats
- **Video Streaming**: Adaptive bitrate

### Asset Optimization
\`\`\`javascript
// Webpack optimization config
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    minimize: true,
    usedExports: true,
    sideEffects: false
  }
};
\`\`\`

## 10. Monitoring & Optimization
### Performance Monitoring
- **APM Tools**: New Relic, DataDog
- **Real User Monitoring**: Page load metrics
- **Synthetic Monitoring**: Automated testing
- **Custom Metrics**: Business-specific KPIs

### Continuous Optimization
- **Performance Budget**: Size and time limits
- **A/B Testing**: Performance experiments
- **Regression Detection**: Automated alerts
- **Capacity Planning**: Growth projections

Format as a professional performance specification with benchmarks, optimization strategies, and monitoring plans.`
  }
}

export const defaultTechSpecPrompt = techSpecSections['system-architecture'].prompt

export function getTechSpecSectionPrompt(sectionId: string): string {
  return techSpecSections[sectionId]?.prompt || defaultTechSpecPrompt
}

export function getAllTechSpecSections(): TechSpecSection[] {
  return Object.values(techSpecSections)
}

export function getTechSpecSectionById(sectionId: string): TechSpecSection | undefined {
  return techSpecSections[sectionId]
}

export function generateCombinedTechSpec(selectedSections: string[], context: {
  business_analysis?: string
  functional_spec?: string
  technical_spec?: string
}): string {
  if (selectedSections.length === 0) {
    return defaultTechSpecPrompt
  }

  const sections = selectedSections.map(id => techSpecSections[id]).filter(Boolean)
  
  const combinedPrompt = `As a Senior Technical Architect, create a comprehensive technical specification covering multiple focus areas.

Context:
${context.business_analysis ? `Business Analysis: {{business_analysis}}` : ''}
${context.functional_spec ? `Functional Requirements: {{functional_spec}}` : ''}
${context.technical_spec ? `Previous Technical Spec: {{technical_spec}}` : ''}

Generate a detailed technical specification covering the following areas:

${sections.map((section, index) => `
## Part ${index + 1}: ${section.name}
${section.prompt.split('\n').slice(5).join('\n')}
`).join('\n\n')}

Ensure all sections are cohesive and reference each other where appropriate. Format as a professional technical specification document.`

  return combinedPrompt
}