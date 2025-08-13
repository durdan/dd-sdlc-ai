/**
 * Functional Specification Sections
 * Provides specialized prompts for different functional specification focus areas
 */

export interface FunctionalSection {
  id: string
  name: string
  icon: string
  description: string
  detailedDescription: string
  bestFor: string[]
  outputSections: string[]
  prompt: string
}

export const functionalSpecSections: Record<string, FunctionalSection> = {
  'use-cases': {
    id: 'use-cases',
    name: 'Use Cases',
    icon: '📋',
    description: 'Detailed user scenarios',
    detailedDescription: 'Comprehensive use case documentation including actors, preconditions, main flows, alternative flows, and postconditions.',
    bestFor: [
      'Requirements documentation',
      'User story development',
      'Test case design',
      'Training materials'
    ],
    outputSections: [
      'Use Case Overview',
      'Actor Definitions',
      'Main Flows',
      'Alternative Flows',
      'Exception Handling'
    ],
    prompt: `As a Senior Systems Analyst, create comprehensive Use Case documentation.

Project Description: {{input}}

Generate detailed Use Cases including:

## 1. Use Case Overview
- **System Name**: [Application name]
- **Use Case Model Version**: 1.0
- **Created Date**: [Current date]
- **Primary Actors**: [List of main actors]
- **Scope**: [System boundaries]

## 2. Actor Definitions
For each actor:
### [Actor Name]
- **Description**: [Role description]
- **Type**: [Primary/Secondary/System]
- **Responsibilities**: [What they do]
- **Goals**: [What they want to achieve]
- **System Access**: [How they interact]

## 3. Use Case Catalog
### Priority Matrix
- **Critical**: Must have for MVP
- **High**: Important for launch
- **Medium**: Enhances functionality
- **Low**: Future consideration

## 4. Detailed Use Cases

### UC-001: [Use Case Name]
#### Basic Information
- **ID**: UC-001
- **Name**: [Descriptive name]
- **Actor**: [Primary actor]
- **Priority**: [Critical/High/Medium/Low]
- **Complexity**: [Simple/Medium/Complex]
- **Frequency**: [How often used]

#### Preconditions
1. [Condition that must be true before use case starts]
2. [Another precondition]

#### Postconditions
##### Success Postconditions
1. [State after successful completion]
2. [Another success condition]

##### Failure Postconditions
1. [State after failure]
2. [Another failure condition]

#### Main Flow
1. Actor initiates [action]
2. System displays [interface/screen]
3. Actor enters [data/selection]
4. System validates [input]
5. System processes [operation]
6. System updates [data/state]
7. System displays [confirmation]
8. Use case ends successfully

#### Alternative Flows
##### Alternative Flow 1: [Name]
At step 3 of main flow:
3a. Actor selects [alternative option]
3b. System displays [alternative interface]
3c. Continue at step 4

##### Alternative Flow 2: [Name]
At step 5 of main flow:
5a. System detects [condition]
5b. System performs [alternative action]
5c. Continue at step 6

#### Exception Flows
##### Exception 1: [Invalid Input]
At step 4 of main flow:
4a. System detects invalid input
4b. System displays error message
4c. System highlights invalid fields
4d. Return to step 3

##### Exception 2: [System Error]
At any step:
*a. System encounters error
*b. System logs error details
*c. System displays error message
*d. Use case ends in failure state

#### Business Rules
1. [Business rule applied]
2. [Another business rule]

#### Data Requirements
- Input Data: [List of required inputs]
- Output Data: [List of generated outputs]
- Data Validation: [Validation rules]

#### Non-Functional Requirements
- **Performance**: [Response time requirements]
- **Security**: [Access control requirements]
- **Usability**: [User experience requirements]

### UC-002: [Second Use Case]
[Similar structure for additional use cases]

## 5. Use Case Relationships
### Include Relationships
- UC-001 includes UC-005 (Authentication)
- UC-002 includes UC-006 (Validation)

### Extend Relationships
- UC-003 extends UC-001 (Optional features)
- UC-004 extends UC-002 (Advanced options)

### Generalization
- UC-007 generalizes UC-008, UC-009

## 6. Use Case Diagram
\`\`\`
[Actor 1] --> (Use Case 1)
[Actor 1] --> (Use Case 2)
[Actor 2] --> (Use Case 3)
(Use Case 1) ..> (Use Case 4) : <<include>>
(Use Case 2) <.. (Use Case 5) : <<extend>>
\`\`\`

## 7. Traceability Matrix
| Use Case | Requirements | User Stories | Test Cases |
|----------|-------------|--------------|------------|
| UC-001   | REQ-1, REQ-2 | US-101, US-102 | TC-001-TC-005 |
| UC-002   | REQ-3, REQ-4 | US-103, US-104 | TC-006-TC-010 |

Format as professional use case documentation.`
  },

  'user-stories': {
    id: 'user-stories',
    name: 'User Stories',
    icon: '👤',
    description: 'Agile user stories and epics',
    detailedDescription: 'Complete user story specifications with acceptance criteria, story points, and implementation details for agile development.',
    bestFor: [
      'Agile development',
      'Sprint planning',
      'Backlog grooming',
      'Feature development'
    ],
    outputSections: [
      'Epic Definition',
      'User Stories',
      'Acceptance Criteria',
      'Story Points',
      'Dependencies'
    ],
    prompt: `As a Senior Product Owner, create comprehensive User Stories for agile development.

Project Description: {{input}}

Generate detailed User Stories including:

## 1. Product Vision
- **Product Goal**: [High-level objective]
- **Target Users**: [Primary user segments]
- **Key Benefits**: [Value proposition]
- **Success Metrics**: [KPIs]

## 2. Epic Overview

### Epic 1: [Epic Name]
- **Epic ID**: E-001
- **Description**: [High-level description]
- **Business Value**: [Why this matters]
- **Success Criteria**: [How we measure completion]
- **Target Release**: [Sprint/Quarter]

#### User Stories for Epic 1

##### Story 1.1: [Story Title]
**Story ID**: US-101
**As a** [user type]
**I want to** [action/feature]
**So that** [business value/benefit]

**Story Points**: [1, 2, 3, 5, 8, 13]
**Priority**: [High/Medium/Low]
**Sprint**: [Target sprint]

**Acceptance Criteria**:
- [ ] Given [precondition], When [action], Then [expected result]
- [ ] Given [precondition], When [action], Then [expected result]
- [ ] System validates [specific validation]
- [ ] Error handling for [edge case]
- [ ] Performance: [specific metric]

**Technical Notes**:
- API endpoint: [endpoint details]
- Database changes: [schema updates]
- Integration points: [external systems]
- Security considerations: [auth/permissions]

**Design Notes**:
- Mockup reference: [link/attachment]
- UI components: [specific components]
- Responsive behavior: [mobile/tablet considerations]

**Dependencies**:
- Depends on: [US-XXX]
- Blocks: [US-YYY]
- External dependency: [third-party service]

**Test Scenarios**:
1. Happy path: [main scenario]
2. Edge case: [boundary condition]
3. Error case: [failure scenario]
4. Performance: [load scenario]

##### Story 1.2: [Story Title]
[Similar structure for additional stories]

### Epic 2: [Epic Name]
[Similar structure for additional epics]

## 3. User Story Map

### User Journey Stages
\`\`\`
| Discover | Sign Up | Onboard | Use Core | Advanced | Retain |
|----------|---------|---------|----------|----------|--------|
| US-101   | US-201  | US-301  | US-401   | US-501   | US-601 |
| US-102   | US-202  | US-302  | US-402   | US-502   | US-602 |
| US-103   |         | US-303  | US-403   | US-503   |        |
\`\`\`

## 4. Sprint Planning

### Sprint 1 (Week 1-2)
**Sprint Goal**: [Specific deliverable]
**Capacity**: [Total story points]

**Committed Stories**:
- US-101 (5 points) - [Developer name]
- US-102 (3 points) - [Developer name]
- US-103 (8 points) - [Developer name]
**Total**: 16 points

### Sprint 2 (Week 3-4)
[Similar structure]

## 5. Definition of Ready
- [ ] User story is clear and concise
- [ ] Acceptance criteria defined
- [ ] Dependencies identified
- [ ] Story pointed by team
- [ ] Design/mockups available
- [ ] Technical approach agreed

## 6. Definition of Done
- [ ] Code complete and reviewed
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Product owner acceptance
- [ ] Performance criteria met

## 7. Non-Functional Stories

### NFR-001: Performance Optimization
**As a** system administrator
**I want** page load times under 2 seconds
**So that** users have a responsive experience

**Acceptance Criteria**:
- [ ] 95th percentile load time < 2s
- [ ] API response time < 200ms
- [ ] Database queries optimized
- [ ] CDN configured for static assets

### NFR-002: Security Hardening
[Similar structure for non-functional requirements]

## 8. Technical Debt Stories

### TD-001: Refactor Authentication Module
**As a** development team
**I want to** refactor the authentication module
**So that** we can support multiple OAuth providers

**Technical Details**:
- Current state: [description]
- Target state: [description]
- Risk assessment: [impact analysis]
- Effort estimate: [story points]

## 9. Spike Stories

### SPIKE-001: Research Payment Gateway Options
**Timebox**: 2 days
**Objective**: Evaluate payment gateway providers
**Success Criteria**: Recommendation document with comparison matrix

**Research Areas**:
- Transaction fees
- API capabilities
- Security compliance
- Integration effort
- Support quality

## 10. Story Prioritization Matrix

| Story ID | Business Value | Technical Risk | Effort | Priority Score |
|----------|---------------|----------------|--------|----------------|
| US-101   | High (9)      | Low (2)        | 5      | 1.8           |
| US-102   | High (8)      | Medium (5)     | 3      | 1.6           |
| US-103   | Medium (5)    | Low (2)        | 8      | 2.5           |

Priority Score = Business Value / (Technical Risk + Effort)

Format as comprehensive agile documentation.`
  },

  'process-flows': {
    id: 'process-flows',
    name: 'Process Flows',
    icon: '🔄',
    description: 'Business process workflows',
    detailedDescription: 'Detailed business process flows including steps, decision points, roles, and system interactions.',
    bestFor: [
      'Process automation',
      'Workflow design',
      'Business analysis',
      'System integration'
    ],
    outputSections: [
      'Process Overview',
      'Workflow Steps',
      'Decision Points',
      'Role Assignments',
      'System Touchpoints'
    ],
    prompt: `As a Senior Business Process Analyst, create comprehensive Process Flow documentation.

Project Description: {{input}}

Generate detailed Process Flows including:

## 1. Process Inventory
### Core Processes
- **Order Management**: Order to fulfillment
- **Customer Onboarding**: Registration to activation
- **Payment Processing**: Invoice to collection
- **Support Handling**: Ticket to resolution

### Supporting Processes
- **User Authentication**: Login and access control
- **Data Synchronization**: System integration flows
- **Reporting**: Data aggregation and delivery
- **Maintenance**: System updates and backups

## 2. Detailed Process Flows

### Process: [Process Name]
#### Process Metadata
- **Process ID**: PRO-001
- **Version**: 1.0
- **Owner**: [Department/Role]
- **Frequency**: [Daily/Weekly/On-demand]
- **SLA**: [Time commitment]
- **Systems Involved**: [List of systems]

#### Process Overview
\`\`\`
Start --> [Input] --> [Process Step 1] --> [Decision] 
                                              |
                                    [Yes] --> [Process Step 2]
                                              |
                                    [No]  --> [Alternative Process]
                                              |
                                              v
                                          [End Process]
\`\`\`

#### Detailed Steps

##### Step 1: [Step Name]
- **Step ID**: S1.1
- **Description**: [What happens in this step]
- **Actor**: [Who performs this]
- **System**: [System used]
- **Input**: [Required information]
- **Output**: [Generated result]
- **Duration**: [Expected time]
- **Business Rules**: [Rules applied]

**Actions**:
1. Open [system/interface]
2. Navigate to [section]
3. Enter/Select [data]
4. Validate [information]
5. Submit [form/request]

**Validation Rules**:
- [Field] must be [condition]
- [Field] requires [format]
- [Business rule validation]

**Error Handling**:
- If [error condition], then [action]
- If [timeout], then [recovery action]

##### Decision Point 1: [Decision Name]
- **Decision ID**: D1.1
- **Question**: [Decision to be made]
- **Criteria**: [How to decide]
- **Options**:
  - **Option A**: [Condition] → Go to Step 2
  - **Option B**: [Condition] → Go to Step 3
  - **Option C**: [Condition] → End process

##### Step 2: [Step Name]
[Similar structure for additional steps]

#### Process Roles

##### Role: [Role Name]
- **Responsibilities**: [What they do]
- **Permissions**: [System access needed]
- **Escalation Path**: [Who to contact]
- **Training Required**: [Skills needed]

#### System Integrations

##### Integration Point 1: [System A → System B]
- **Trigger**: [What initiates]
- **Method**: [API/File/Database]
- **Data Transferred**: [Fields/Objects]
- **Frequency**: [Real-time/Batch]
- **Error Recovery**: [Retry logic]

#### Data Flow
\`\`\`
[Source System] --> [Field Mapping] --> [Transformation] --> [Target System]
     |                    |                   |                    |
  [Raw Data]      [Validated Data]    [Processed Data]    [Stored Data]
\`\`\`

#### Exception Handling

##### Exception: [Exception Type]
- **Trigger**: [What causes this]
- **Detection**: [How identified]
- **Resolution**: [Steps to resolve]
- **Escalation**: [When to escalate]
- **Documentation**: [What to record]

#### Performance Metrics
- **Throughput**: [Items/hour]
- **Cycle Time**: [Start to finish]
- **Error Rate**: [Acceptable threshold]
- **Queue Time**: [Maximum wait]
- **Processing Time**: [Active work time]

### Process: Customer Order Flow
[Detailed example of complete process]

## 3. BPMN Notation
\`\`\`
○ Start Event
□ Task/Activity
◇ Decision Gateway
⬭ Parallel Gateway
○ End Event
→ Sequence Flow
⇢ Message Flow
\`\`\`

## 4. Process Optimization Opportunities

### Current State Issues
- **Bottleneck**: [Where delays occur]
- **Manual Work**: [Automation candidates]
- **Redundancy**: [Duplicate efforts]
- **Quality Issues**: [Error-prone areas]

### Future State Improvements
- **Automation**: [What to automate]
- **Integration**: [Systems to connect]
- **Elimination**: [Steps to remove]
- **Optimization**: [Process improvements]

## 5. Swimlane Diagram

\`\`\`
Customer    | Sales Team | System    | Finance   | Fulfillment
------------|------------|-----------|-----------|-------------
Request  -->| Review  -->| Validate  |           |
            | Quote   <--|           |           |
Approve  <--| Send       |           |           |
Order    -->| Process -->| Create -->| Invoice   |
            |            | Order     | Process-->| Ship
Receive  <--|            |           |           | Deliver <--
\`\`\`

## 6. RACI Matrix

| Activity | Customer | Sales | Manager | System | Finance |
|----------|----------|-------|---------|--------|---------|
| Request  | R        | I     | -       | -      | -       |
| Review   | I        | R     | A       | C      | -       |
| Approve  | A        | R     | C       | -      | I       |
| Process  | I        | R     | I       | R      | C       |
| Deliver  | I        | I     | I       | C      | R       |

R = Responsible, A = Accountable, C = Consulted, I = Informed

## 7. Process KPIs

### Efficiency Metrics
- Cycle time reduction: [Target %]
- Automation rate: [Target %]
- First-time-right rate: [Target %]

### Quality Metrics
- Error rate: [Maximum %]
- Customer satisfaction: [Target score]
- Compliance rate: [Target %]

### Volume Metrics
- Transactions/day: [Target number]
- Peak capacity: [Maximum load]
- Average load: [Normal volume]

Format as comprehensive process documentation.`
  },

  'data-models': {
    id: 'data-models',
    name: 'Data Models',
    icon: '🗂️',
    description: 'Data structures and relationships',
    detailedDescription: 'Comprehensive data modeling including entities, attributes, relationships, and data dictionaries.',
    bestFor: [
      'Database design',
      'API design',
      'Data migration',
      'System documentation'
    ],
    outputSections: [
      'Conceptual Model',
      'Logical Model',
      'Physical Model',
      'Data Dictionary',
      'Data Constraints'
    ],
    prompt: `As a Senior Data Architect, create comprehensive Data Model documentation.

Project Description: {{input}}

Generate detailed Data Models including:

## 1. Conceptual Data Model

### Business Entities
#### Core Entities
- **Customer**: Individual or organization using the system
- **Product**: Items or services offered
- **Order**: Transaction records
- **Payment**: Financial transactions
- **User**: System users with access rights

#### Relationships Overview
- Customer PLACES Order (1:N)
- Order CONTAINS Product (N:M)
- Order HAS Payment (1:1)
- User MANAGES Customer (N:M)

### Entity Descriptions

#### Entity: Customer
- **Business Definition**: Person or organization that purchases products
- **Business Rules**: Must have valid contact information
- **Key Attributes**: Name, Email, Phone, Address
- **Relationships**: Orders, Payments, Preferences

## 2. Logical Data Model

### Entity Specifications

#### Customer Entity
**Attributes**:
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| customer_id | UUID | PK, NOT NULL | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Primary email |
| first_name | VARCHAR(100) | NOT NULL | Customer first name |
| last_name | VARCHAR(100) | NOT NULL | Customer last name |
| phone | VARCHAR(20) | | Contact phone |
| status | ENUM | NOT NULL | Active/Inactive/Suspended |
| created_at | TIMESTAMP | NOT NULL | Registration date |
| updated_at | TIMESTAMP | NOT NULL | Last modification |

**Indexes**:
- PRIMARY KEY (customer_id)
- UNIQUE INDEX idx_email (email)
- INDEX idx_name (last_name, first_name)
- INDEX idx_created (created_at)

**Constraints**:
- CHECK (email LIKE '%@%.%')
- CHECK (status IN ('active', 'inactive', 'suspended'))

#### Order Entity
**Attributes**:
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| order_id | UUID | PK, NOT NULL | Unique identifier |
| order_number | VARCHAR(20) | UNIQUE, NOT NULL | Human-readable ID |
| customer_id | UUID | FK, NOT NULL | Reference to customer |
| total_amount | DECIMAL(10,2) | NOT NULL | Order total |
| status | VARCHAR(20) | NOT NULL | Order status |
| order_date | TIMESTAMP | NOT NULL | Order placement time |

**Foreign Keys**:
- FK_order_customer: customer_id REFERENCES customer(customer_id)

#### Product Entity
[Similar structure for other entities]

### Relationship Specifications

#### Order_Items (Associative Entity)
**Purpose**: Links orders to products with quantity and pricing
**Attributes**:
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| order_item_id | UUID | PK | Unique identifier |
| order_id | UUID | FK, NOT NULL | Reference to order |
| product_id | UUID | FK, NOT NULL | Reference to product |
| quantity | INTEGER | NOT NULL, > 0 | Item quantity |
| unit_price | DECIMAL(10,2) | NOT NULL | Price at purchase |
| subtotal | DECIMAL(10,2) | NOT NULL | Line item total |

## 3. Physical Data Model

### Database Selection
- **Primary Database**: PostgreSQL 14+
- **Cache Layer**: Redis
- **Search Engine**: Elasticsearch
- **File Storage**: S3-compatible

### Table Definitions

\`\`\`sql
-- Customer table
CREATE TABLE customers (
    customer_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT chk_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(last_name, first_name);
CREATE INDEX idx_customers_created ON customers(created_at);
CREATE INDEX idx_customers_metadata ON customers USING GIN (metadata);

-- Triggers
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
\`\`\`

### Partitioning Strategy
\`\`\`sql
-- Partition orders by date
CREATE TABLE orders (
    order_id UUID DEFAULT gen_random_uuid(),
    order_date TIMESTAMP NOT NULL,
    -- other columns
) PARTITION BY RANGE (order_date);

-- Monthly partitions
CREATE TABLE orders_2024_01 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
\`\`\`

### Archival Strategy
- **Hot Data**: Last 90 days - Primary database
- **Warm Data**: 90 days to 1 year - Read replicas
- **Cold Data**: > 1 year - Archive storage

## 4. Data Dictionary

### Business Glossary
| Term | Definition | Example | Source |
|------|------------|---------|--------|
| Customer | Individual or entity that purchases | John Doe, ABC Corp | CRM |
| SKU | Stock Keeping Unit identifier | PROD-12345 | Inventory |
| Order | Confirmed purchase request | ORD-2024-0001 | Sales |

### Technical Dictionary
| Table.Column | Type | Null | Default | Description | Example |
|--------------|------|------|---------|-------------|---------|
| customers.customer_id | UUID | NO | gen_random_uuid() | Unique customer identifier | 123e4567-e89b-12d3 |
| customers.email | VARCHAR(255) | NO | | Customer email address | user@example.com |
| orders.total_amount | DECIMAL(10,2) | NO | 0.00 | Order total in base currency | 1234.56 |

## 5. Data Integrity Rules

### Referential Integrity
- All order.customer_id must exist in customers.customer_id
- Cascade delete restrictions on critical relationships
- Soft deletes for audit trail preservation

### Business Rules
1. Customer email must be unique across system
2. Order total must equal sum of order_items
3. Product price changes don't affect existing orders
4. Inventory must be checked before order confirmation

### Data Quality Rules
- **Completeness**: Required fields must be populated
- **Accuracy**: Email format validation, phone number format
- **Consistency**: Status values from defined list
- **Timeliness**: Updated_at reflects actual changes
- **Uniqueness**: No duplicate customers by email

## 6. Data Security Model

### Sensitive Data Classification
| Data Element | Classification | Encryption | Access Control |
|--------------|---------------|------------|----------------|
| customer.ssn | PII - High | AES-256 | Role-based |
| payment.card_number | PCI | Tokenized | PCI compliant |
| user.password | Credential | Bcrypt | No read access |

### Access Patterns
- **Public Data**: Product catalog, reviews
- **Authenticated**: User profile, order history
- **Authorized**: Admin functions, reports
- **Restricted**: Financial data, PII

## 7. Data Migration Strategy

### Source to Target Mapping
| Source System | Source Field | Target Table | Target Field | Transformation |
|---------------|--------------|--------------|--------------|----------------|
| Legacy.Customers | cust_num | customers | customer_id | Generate UUID |
| Legacy.Customers | email_addr | customers | email | Lowercase, trim |
| Legacy.Orders | order_amt | orders | total_amount | Currency conversion |

### Migration Phases
1. **Phase 1**: Reference data (products, categories)
2. **Phase 2**: Customer data and profiles
3. **Phase 3**: Transactional data (orders, payments)
4. **Phase 4**: Historical data and archives

Format as comprehensive data model documentation.`
  },

  'integration-specs': {
    id: 'integration-specs',
    name: 'Integration Specs',
    icon: '🔗',
    description: 'System integration requirements',
    detailedDescription: 'Detailed integration specifications including APIs, data flows, protocols, and error handling.',
    bestFor: [
      'API development',
      'System integration',
      'Microservices design',
      'Third-party connections'
    ],
    outputSections: [
      'Integration Overview',
      'API Specifications',
      'Data Mappings',
      'Error Handling',
      'Security Requirements'
    ],
    prompt: `As a Senior Integration Architect, create comprehensive Integration Specifications.

Project Description: {{input}}

Generate detailed Integration Specifications including:

## 1. Integration Landscape

### System Inventory
| System | Type | Purpose | Protocol | Direction |
|--------|------|---------|----------|-----------|
| CRM System | External | Customer data | REST API | Bidirectional |
| Payment Gateway | Third-party | Transactions | REST/Webhook | Bidirectional |
| Email Service | SaaS | Notifications | SMTP/API | Outbound |
| Analytics | Internal | Reporting | Event Stream | Outbound |
| ERP | Legacy | Order fulfillment | SOAP/File | Bidirectional |

### Integration Patterns
- **Synchronous**: Real-time API calls for critical operations
- **Asynchronous**: Message queues for bulk processing
- **Event-driven**: Pub/sub for system notifications
- **Batch**: Scheduled file transfers for reports
- **Streaming**: Continuous data flow for analytics

## 2. API Specifications

### API: Customer Management

#### Endpoint: Create Customer
**Method**: POST
**Path**: /api/v1/customers
**Description**: Creates a new customer record

**Request Headers**:
\`\`\`http
Content-Type: application/json
Authorization: Bearer {token}
X-API-Key: {api_key}
X-Request-ID: {uuid}
\`\`\`

**Request Body**:
\`\`\`json
{
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "postalCode": "12345",
    "country": "US"
  },
  "preferences": {
    "newsletter": true,
    "smsNotifications": false
  },
  "metadata": {
    "source": "web",
    "referrer": "campaign_123"
  }
}
\`\`\`

**Response - Success (201)**:
\`\`\`json
{
  "customerId": "cust_123e4567-e89b",
  "email": "customer@example.com",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z",
  "links": {
    "self": "/api/v1/customers/cust_123e4567-e89b",
    "orders": "/api/v1/customers/cust_123e4567-e89b/orders"
  }
}
\`\`\`

**Response - Error (400)**:
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Email already exists"
      }
    ],
    "requestId": "req_123456",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
\`\`\`

**Rate Limiting**:
- Rate limit: 1000 requests/hour
- Burst: 50 requests/minute
- Headers: X-RateLimit-Limit, X-RateLimit-Remaining

#### Endpoint: Get Customer
[Similar detailed structure for other endpoints]

### API: Order Processing
[Similar structure for order-related APIs]

## 3. Webhook Specifications

### Webhook: Order Status Update
**Event**: order.status.changed
**Method**: POST
**Target**: {configured_webhook_url}

**Payload**:
\`\`\`json
{
  "event": "order.status.changed",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "orderId": "ord_123456",
    "previousStatus": "pending",
    "newStatus": "processing",
    "updatedBy": "system",
    "metadata": {}
  },
  "signature": "sha256=..."
}
\`\`\`

**Security**:
- HMAC-SHA256 signature verification
- Retry policy: 3 attempts with exponential backoff
- Timeout: 30 seconds

## 4. Message Queue Integration

### Queue: Order Processing Queue
**Provider**: AWS SQS / RabbitMQ
**Queue Name**: order-processing-queue
**Message Format**: JSON

**Message Structure**:
\`\`\`json
{
  "messageId": "msg_123456",
  "timestamp": "2024-01-01T00:00:00Z",
  "type": "ORDER_CREATED",
  "version": "1.0",
  "payload": {
    "orderId": "ord_123456",
    "customerId": "cust_789",
    "items": [],
    "total": 100.00
  },
  "metadata": {
    "correlationId": "corr_123",
    "source": "web_checkout"
  }
}
\`\`\`

**Processing Rules**:
- Max retries: 3
- Dead letter queue after max retries
- Visibility timeout: 300 seconds
- Message retention: 7 days

## 5. File-Based Integration

### File Transfer: Daily Reports
**Protocol**: SFTP
**Schedule**: Daily at 02:00 UTC
**File Format**: CSV

**File Naming Convention**:
\`\`\`
{report_type}_{YYYYMMDD}_{sequence}.csv
Example: sales_report_20240101_001.csv
\`\`\`

**File Structure**:
\`\`\`csv
order_id,customer_id,order_date,total_amount,status
ORD001,CUST001,2024-01-01,100.00,completed
ORD002,CUST002,2024-01-01,200.00,processing
\`\`\`

**Processing**:
1. Poll SFTP directory every 5 minutes
2. Validate file checksum
3. Parse and validate content
4. Process records in batches
5. Move to processed folder
6. Send completion notification

## 6. Data Transformation Mappings

### Customer Data Mapping
| Source (CRM) | Target (System) | Transformation | Validation |
|--------------|-----------------|----------------|------------|
| contact_email | email | Lowercase | Email format |
| full_name | firstName, lastName | Split by space | Required |
| phone_number | phone | Format: +1XXXXXXXXXX | Phone regex |
| created_date | createdAt | ISO 8601 | Valid date |
| is_active | status | Boolean to enum | Enum values |

### Order Data Mapping
[Similar mapping table for orders]

## 7. Error Handling Strategy

### Error Categories
1. **Network Errors**: Connection timeouts, DNS failures
2. **Authentication Errors**: Invalid tokens, expired credentials
3. **Validation Errors**: Schema violations, business rule failures
4. **Rate Limit Errors**: Quota exceeded
5. **System Errors**: Internal server errors, service unavailable

### Retry Policies
\`\`\`
Initial retry: 1 second
Retry 1: 2 seconds (exponential)
Retry 2: 4 seconds
Retry 3: 8 seconds
Max retries: 3
Circuit breaker: Open after 5 consecutive failures
\`\`\`

### Error Recovery
- **Idempotency**: Use idempotency keys for critical operations
- **Compensation**: Implement saga pattern for distributed transactions
- **Fallback**: Degraded service with cached data
- **Dead Letter Queue**: Store failed messages for manual review

## 8. Security Requirements

### Authentication Methods
- **API Key**: For server-to-server communication
- **OAuth 2.0**: For user-delegated access
- **JWT**: For service mesh communication
- **mTLS**: For high-security integrations

### Data Security
- **Encryption in Transit**: TLS 1.2+
- **Encryption at Rest**: AES-256
- **Field-level Encryption**: PII and sensitive data
- **Data Masking**: Logs and non-production environments

### Access Control
\`\`\`yaml
roles:
  - name: integration_read
    permissions:
      - read:customers
      - read:orders
  - name: integration_write
    permissions:
      - write:customers
      - write:orders
  - name: integration_admin
    permissions:
      - admin:all
\`\`\`

## 9. Monitoring & Alerting

### Key Metrics
- **Availability**: API uptime > 99.9%
- **Latency**: P95 < 200ms, P99 < 500ms
- **Error Rate**: < 1% of requests
- **Throughput**: > 1000 requests/minute

### Health Checks
\`\`\`
GET /health
Response: {
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z",
  "dependencies": {
    "database": "healthy",
    "cache": "healthy",
    "queue": "healthy"
  }
}
\`\`\`

### Alert Conditions
- API response time > 1000ms for 5 minutes
- Error rate > 5% for 2 minutes
- Queue depth > 1000 messages
- Failed authentication attempts > 10/minute

## 10. Testing Strategy

### Integration Test Scenarios
1. **Happy Path**: Successful end-to-end flow
2. **Error Handling**: Invalid data, timeouts
3. **Performance**: Load testing, stress testing
4. **Security**: Authentication, authorization
5. **Failover**: Service unavailability

### Test Data Management
- Sandbox environment with test accounts
- Mock services for third-party APIs
- Test data generation scripts
- Data cleanup procedures

Format as comprehensive integration specification documentation.`
  },

  'validation-rules': {
    id: 'validation-rules',
    name: 'Validation Rules',
    icon: '✅',
    description: 'Business rules and data validation',
    detailedDescription: 'Comprehensive validation rules including business logic, data constraints, and compliance requirements.',
    bestFor: [
      'Data quality',
      'Business logic',
      'Compliance systems',
      'Form validation'
    ],
    outputSections: [
      'Business Rules',
      'Data Validation',
      'Compliance Rules',
      'Calculation Logic',
      'State Transitions'
    ],
    prompt: `As a Senior Business Rules Analyst, create comprehensive Validation Rules documentation.

Project Description: {{input}}

Generate detailed Validation Rules including:

## 1. Business Rules Catalog

### Rule Categories
- **Data Integrity Rules**: Ensure data consistency
- **Business Logic Rules**: Enforce business policies
- **Compliance Rules**: Meet regulatory requirements
- **Security Rules**: Protect sensitive information
- **Workflow Rules**: Control process flow

## 2. Data Validation Rules

### Customer Data Validation

#### Field: Email Address
**Rule ID**: VAL-CUST-001
**Field**: customer.email
**Type**: Format validation

**Validation Logic**:
\`\`\`javascript
function validateEmail(email) {
  // Required field
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }
  
  // Format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  // Business rules
  const blockedDomains = ['tempmail.com', 'throwaway.email'];
  const domain = email.split('@')[1];
  if (blockedDomains.includes(domain)) {
    return { valid: false, error: 'Temporary email addresses not allowed' };
  }
  
  // Length constraints
  if (email.length > 255) {
    return { valid: false, error: 'Email too long (max 255 characters)' };
  }
  
  return { valid: true };
}
\`\`\`

#### Field: Phone Number
**Rule ID**: VAL-CUST-002
**Field**: customer.phone
**Type**: Format and business validation

**Validation Rules**:
1. Optional field but if provided must be valid
2. International format: +[country code][number]
3. US numbers: 10 digits after country code
4. No premium rate numbers
5. Mobile numbers preferred for SMS

**Implementation**:
\`\`\`javascript
const phoneValidation = {
  pattern: /^\+?[1-9]\d{1,14}$/,
  minLength: 10,
  maxLength: 15,
  blockedPrefixes: ['+1900', '+1976'], // Premium numbers
  requiredForSMS: true
};
\`\`\`

### Order Validation Rules

#### Rule: Order Total Calculation
**Rule ID**: VAL-ORD-001
**Type**: Calculation validation

**Business Logic**:
\`\`\`
Order Total = Sum(Item Subtotals) + Tax + Shipping - Discount
Where:
- Item Subtotal = Quantity × Unit Price
- Tax = Taxable Amount × Tax Rate
- Shipping = Based on weight/location/method
- Discount = Applied promotions/coupons
\`\`\`

**Validation Checks**:
1. Total must equal calculated sum (±0.01 for rounding)
2. No negative totals allowed
3. Maximum order value: $10,000
4. Minimum order value: $1.00
5. Currency must match customer's region

#### Rule: Inventory Availability
**Rule ID**: VAL-ORD-002
**Type**: Business constraint

**Logic**:
\`\`\`sql
FOR each item in order:
  available_quantity = inventory.quantity_on_hand 
                      - inventory.quantity_reserved
  IF requested_quantity > available_quantity:
    IF item.allow_backorder:
      SET item.status = 'backorder'
      ADD to backorder_queue
    ELSE:
      REJECT order_item
      RETURN error: 'Insufficient inventory'
\`\`\`

## 3. Business Logic Rules

### Pricing Rules

#### Rule: Tiered Pricing
**Rule ID**: BUS-PRICE-001
**Description**: Apply volume discounts based on quantity

**Pricing Tiers**:
| Quantity | Discount | Applied To |
|----------|----------|------------|
| 1-9 | 0% | List price |
| 10-49 | 10% | List price |
| 50-99 | 15% | List price |
| 100+ | 20% | List price |

**Special Conditions**:
- VIP customers get additional 5% off
- Promotional items excluded from tiered pricing
- Discounts don't stack with sale prices

#### Rule: Dynamic Pricing
**Rule ID**: BUS-PRICE-002
**Factors**:
1. Time of day (peak/off-peak)
2. Demand level (high/normal/low)
3. Customer segment (new/returning/VIP)
4. Competitor pricing (match/beat)
5. Inventory levels (clearance if overstocked)

### Workflow Rules

#### Rule: Order Approval Workflow
**Rule ID**: WF-ORD-001
**Trigger**: Order submission

**Approval Matrix**:
| Order Value | Customer Type | Approval Required |
|-------------|---------------|-------------------|
| < $500 | Any | Auto-approve |
| $500-$2000 | New | Manager approval |
| $500-$2000 | Existing | Auto-approve |
| > $2000 | Any | Senior manager approval |
| > $5000 | Any | Director approval |

**Escalation**:
- If no response in 2 hours, escalate to next level
- If no response in 4 hours, auto-approve with audit flag

## 4. State Transition Rules

### Order Status Transitions
**Rule ID**: STATE-ORD-001

**Valid Transitions**:
\`\`\`
DRAFT --> SUBMITTED --> PENDING_PAYMENT
PENDING_PAYMENT --> PAID --> PROCESSING
PROCESSING --> SHIPPED --> DELIVERED
PROCESSING --> CANCELLED (with refund)
ANY_STATE --> ON_HOLD (by admin)
ON_HOLD --> PREVIOUS_STATE (resume)
\`\`\`

**Transition Guards**:
- SUBMITTED → PAID: Payment must be verified
- PAID → PROCESSING: Inventory must be available
- PROCESSING → SHIPPED: Tracking number required
- SHIPPED → DELIVERED: Delivery confirmation required

## 5. Compliance & Regulatory Rules

### GDPR Compliance
**Rule ID**: COMP-GDPR-001
**Requirements**:

1. **Consent Management**:
   - Explicit consent for data processing
   - Granular consent options
   - Easy withdrawal mechanism
   - Consent audit trail

2. **Data Retention**:
   - Customer data: 7 years after last activity
   - Transaction data: 10 years (legal requirement)
   - Marketing data: Until consent withdrawn
   - Log data: 90 days

3. **Right to Erasure**:
   \`\`\`sql
   IF erasure_request AND no_legal_hold:
     anonymize_personal_data()
     retain_transaction_records_anonymized()
     delete_marketing_preferences()
     log_erasure_action()
   \`\`\`

### PCI DSS Compliance
**Rule ID**: COMP-PCI-001
**Card Data Handling**:

1. Never store CVV/CVV2
2. Mask card numbers (show last 4 digits only)
3. Tokenize card data immediately
4. Use strong encryption (AES-256)
5. Limit access to authorized personnel

**Implementation**:
\`\`\`javascript
function handleCardData(cardNumber) {
  // Validate card number format
  if (!isValidCardNumber(cardNumber)) {
    throw new Error('Invalid card number');
  }
  
  // Tokenize immediately
  const token = tokenizationService.tokenize(cardNumber);
  
  // Never log full card number
  logger.info(\`Card tokenized: ****\${cardNumber.slice(-4)}\`);
  
  // Return token for storage
  return token;
}
\`\`\`

## 6. Calculation & Formula Rules

### Tax Calculation
**Rule ID**: CALC-TAX-001
**Formula**: Based on jurisdiction

\`\`\`javascript
function calculateTax(order) {
  const taxRules = {
    state: getTaxRate(order.shippingAddress.state),
    county: getCountyTax(order.shippingAddress.county),
    city: getCityTax(order.shippingAddress.city),
    special: getSpecialTax(order.items)
  };
  
  let taxableAmount = 0;
  for (const item of order.items) {
    if (!item.taxExempt) {
      taxableAmount += item.subtotal;
    }
  }
  
  const totalTaxRate = Object.values(taxRules)
    .reduce((sum, rate) => sum + rate, 0);
  
  return {
    taxableAmount,
    taxRate: totalTaxRate,
    taxAmount: taxableAmount * totalTaxRate,
    breakdown: taxRules
  };
}
\`\`\`

### Shipping Calculation
**Rule ID**: CALC-SHIP-001
**Factors**:
- Weight-based: $0.50 per pound
- Distance-based: Zone pricing
- Method: Standard/Express/Overnight
- Free shipping: Orders over $100

## 7. Security Validation Rules

### Password Policy
**Rule ID**: SEC-PWD-001
**Requirements**:
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- No common passwords (top 10000 list)
- No recent 5 passwords
- No personal information

### Session Management
**Rule ID**: SEC-SESS-001
**Rules**:
- Session timeout: 30 minutes idle
- Absolute timeout: 8 hours
- Concurrent sessions: Maximum 3
- Device fingerprinting required
- Re-authentication for sensitive operations

## 8. Notification Rules

### Email Trigger Rules
**Rule ID**: NOTIF-EMAIL-001
**Triggers and Conditions**:

| Event | Condition | Template | Delay |
|-------|-----------|----------|--------|
| Order Placed | Always | order_confirmation | Immediate |
| Payment Failed | After retry | payment_failed | 5 minutes |
| Shipment Sent | Tracking available | shipment_notification | Immediate |
| Cart Abandoned | Items > 24 hours | cart_reminder | 24 hours |
| Review Request | 7 days after delivery | review_request | 7 days |

## 9. Data Quality Rules

### Address Validation
**Rule ID**: DQ-ADDR-001
**Validation Steps**:
1. Format standardization (USPS format)
2. Address verification via API
3. Geocoding for delivery zones
4. PO Box restrictions for certain items
5. International address formats

### Duplicate Detection
**Rule ID**: DQ-DUP-001
**Matching Criteria**:
- Exact email match = Definite duplicate
- Name + Phone match = Probable duplicate
- Name + Address match = Possible duplicate
- Fuzzy matching for typos
- Merge rules for confirmed duplicates

## 10. Testing & Validation

### Rule Testing Framework
\`\`\`javascript
describe('Validation Rules', () => {
  test('Email validation', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid.email')).toBe(false);
    expect(validateEmail('test@tempmail.com')).toBe(false);
  });
  
  test('Order total calculation', () => {
    const order = createTestOrder();
    const calculated = calculateOrderTotal(order);
    expect(calculated).toBeCloseTo(expectedTotal, 2);
  });
});
\`\`\`

Format as comprehensive validation rules documentation.`
  }
}

export const defaultFunctionalSpecPrompt = functionalSpecSections['use-cases'].prompt

export function getFunctionalSectionPrompt(sectionId: string): string {
  return functionalSpecSections[sectionId]?.prompt || defaultFunctionalSpecPrompt
}

export function getAllFunctionalSections(): FunctionalSection[] {
  return Object.values(functionalSpecSections)
}

export function getFunctionalSectionById(sectionId: string): FunctionalSection | undefined {
  return functionalSpecSections[sectionId]
}

export function generateCombinedFunctionalSpec(selectedSections: string[], context: {
  input: string
  business_analysis?: string
  technical_spec?: string
}): string {
  if (selectedSections.length === 0) {
    return defaultFunctionalSpecPrompt
  }

  const sections = selectedSections.map(id => functionalSpecSections[id]).filter(Boolean)
  
  const combinedPrompt = `As a Senior Systems Analyst, create a comprehensive functional specification covering multiple focus areas.

Project Description: {{input}}
${context.business_analysis ? `Business Analysis: {{business_analysis}}` : ''}
${context.technical_spec ? `Technical Specification: {{technical_spec}}` : ''}

Generate a detailed functional specification covering the following areas:

${sections.map((section, index) => `
## Part ${index + 1}: ${section.name}
${section.prompt.split('\n').slice(5).join('\n')}
`).join('\n\n')}

Ensure all sections are cohesive and reference each other where appropriate. Format as a professional functional specification document.`

  return combinedPrompt
}