/**
 * Architecture Diagram Sections
 * Provides specialized prompts for different architecture visualization focus areas
 */

export interface ArchitectureSection {
  id: string
  name: string
  icon: string
  description: string
  detailedDescription: string
  bestFor: string[]
  outputSections: string[]
  prompt: string
}

export const architectureSections: Record<string, ArchitectureSection> = {
  'system-overview': {
    id: 'system-overview',
    name: 'System Overview',
    icon: '🏗️',
    description: 'High-level architecture',
    detailedDescription: 'Comprehensive system architecture diagram showing all major components, their relationships, and data flows.',
    bestFor: [
      'Executive presentations',
      'System documentation',
      'Onboarding materials',
      'Architecture reviews'
    ],
    outputSections: [
      'Component Architecture',
      'Layer Diagram',
      'System Context',
      'Technology Stack',
      'Deployment View'
    ],
    prompt: `As a Senior Solution Architect, create comprehensive System Overview diagrams using Mermaid syntax.

Project Description: {{input}}

Generate detailed System Overview diagrams including:

## 1. System Context Diagram
\`\`\`mermaid
graph TB
    subgraph "External Systems"
        EXT1[External System 1]
        EXT2[External System 2]
        EXT3[Third-party API]
    end
    
    subgraph "Users"
        U1[End Users]
        U2[Administrators]
        U3[API Consumers]
    end
    
    subgraph "Core System"
        SYS[Main Application]
    end
    
    U1 --> SYS
    U2 --> SYS
    U3 --> SYS
    SYS --> EXT1
    SYS --> EXT2
    SYS --> EXT3
\`\`\`

## 2. Component Architecture Diagram
\`\`\`mermaid
graph TB
    subgraph "Presentation Layer"
        UI[Web UI]
        MOB[Mobile App]
        API[API Gateway]
    end
    
    subgraph "Business Layer"
        AUTH[Authentication Service]
        BL[Business Logic]
        WF[Workflow Engine]
        INT[Integration Service]
    end
    
    subgraph "Data Layer"
        DB[(Primary Database)]
        CACHE[(Cache)]
        QUEUE[Message Queue]
        STORAGE[File Storage]
    end
    
    UI --> API
    MOB --> API
    API --> AUTH
    API --> BL
    BL --> WF
    BL --> INT
    BL --> DB
    BL --> CACHE
    WF --> QUEUE
    INT --> STORAGE
\`\`\`

## 3. Layered Architecture
\`\`\`mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile Apps]
        DESKTOP[Desktop Apps]
    end
    
    subgraph "Presentation Layer"
        FE[Frontend Framework]
        RESP[Responsive UI]
    end
    
    subgraph "API Layer"
        REST[REST API]
        GQL[GraphQL]
        WS[WebSocket]
    end
    
    subgraph "Service Layer"
        BS[Business Services]
        AS[Application Services]
        IS[Integration Services]
    end
    
    subgraph "Domain Layer"
        DM[Domain Models]
        BR[Business Rules]
        DE[Domain Events]
    end
    
    subgraph "Infrastructure Layer"
        REPO[Repositories]
        MSG[Messaging]
        LOG[Logging]
        MON[Monitoring]
    end
    
    subgraph "Data Layer"
        SQL[(SQL DB)]
        NOSQL[(NoSQL DB)]
        BLOB[(Blob Storage)]
    end
\`\`\`

## 4. Technology Stack Visualization
\`\`\`mermaid
graph LR
    subgraph "Frontend Stack"
        REACT[React/Vue/Angular]
        TS[TypeScript]
        CSS[CSS Framework]
        BUILD[Build Tools]
    end
    
    subgraph "Backend Stack"
        LANG[Programming Language]
        FW[Framework]
        ORM[ORM/ODM]
        LIBS[Libraries]
    end
    
    subgraph "Infrastructure Stack"
        CLOUD[Cloud Provider]
        CONT[Containers]
        ORCH[Orchestration]
        CICD[CI/CD Pipeline]
    end
    
    subgraph "Data Stack"
        RDBMS[RDBMS]
        NOSQLDB[NoSQL]
        CACHESYS[Cache System]
        SEARCH[Search Engine]
    end
\`\`\`

## 5. Deployment Architecture
\`\`\`mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Region 1"
            LB1[Load Balancer]
            WEB1[Web Servers]
            APP1[App Servers]
            DB1[(Database Master)]
        end
        
        subgraph "Region 2"
            LB2[Load Balancer]
            WEB2[Web Servers]
            APP2[App Servers]
            DB2[(Database Replica)]
        end
        
        CDN[CDN]
        DNS[DNS]
    end
    
    DNS --> CDN
    CDN --> LB1
    CDN --> LB2
    LB1 --> WEB1
    LB2 --> WEB2
    WEB1 --> APP1
    WEB2 --> APP2
    APP1 --> DB1
    APP2 --> DB2
    DB1 -.->|Replication| DB2
\`\`\`

## 6. Key Architectural Decisions
- **Architecture Pattern**: [Microservices/Monolithic/Serverless]
- **Communication**: [Synchronous/Asynchronous/Event-driven]
- **Data Management**: [Centralized/Distributed/Federated]
- **Security Model**: [Zero-trust/Perimeter-based/Hybrid]
- **Scalability Strategy**: [Horizontal/Vertical/Auto-scaling]

Generate all diagrams with proper Mermaid syntax and clear component relationships.`
  },

  'data-flow': {
    id: 'data-flow',
    name: 'Data Flow',
    icon: '🔄',
    description: 'Data movement and processing',
    detailedDescription: 'Detailed data flow diagrams showing how data moves through the system, transformations, and storage points.',
    bestFor: [
      'Data architecture',
      'ETL processes',
      'Analytics systems',
      'Integration design'
    ],
    outputSections: [
      'Data Flow Overview',
      'ETL Pipeline',
      'Event Streaming',
      'Data Transformation',
      'Storage Architecture'
    ],
    prompt: `As a Senior Data Architect, create comprehensive Data Flow diagrams using Mermaid syntax.

Project Description: {{input}}

Generate detailed Data Flow diagrams including:

## 1. Overall Data Flow
\`\`\`mermaid
graph LR
    subgraph "Data Sources"
        SRC1[User Input]
        SRC2[External API]
        SRC3[IoT Devices]
        SRC4[Batch Files]
    end
    
    subgraph "Ingestion Layer"
        ING1[Real-time Ingestion]
        ING2[Batch Ingestion]
        VAL[Validation]
    end
    
    subgraph "Processing Layer"
        TRANS[Transformation]
        ENRICH[Enrichment]
        AGG[Aggregation]
        FILTER[Filtering]
    end
    
    subgraph "Storage Layer"
        RAW[(Raw Data Lake)]
        PROC[(Processed Data)]
        DW[(Data Warehouse)]
        CACHE[(Cache Layer)]
    end
    
    subgraph "Consumption Layer"
        API[Data API]
        REPORT[Reporting]
        ANALYTICS[Analytics]
        ML[ML Models]
    end
    
    SRC1 --> ING1
    SRC2 --> ING1
    SRC3 --> ING1
    SRC4 --> ING2
    ING1 --> VAL
    ING2 --> VAL
    VAL --> TRANS
    TRANS --> ENRICH
    ENRICH --> AGG
    AGG --> FILTER
    FILTER --> RAW
    FILTER --> PROC
    PROC --> DW
    DW --> CACHE
    CACHE --> API
    DW --> REPORT
    DW --> ANALYTICS
    PROC --> ML
\`\`\`

## 2. ETL Pipeline Diagram
\`\`\`mermaid
graph TB
    subgraph "Extract"
        E1[Database Extract]
        E2[API Extract]
        E3[File Extract]
        E4[Stream Extract]
    end
    
    subgraph "Transform"
        T1[Data Cleansing]
        T2[Data Validation]
        T3[Format Conversion]
        T4[Business Rules]
        T5[Aggregation]
        T6[Deduplication]
    end
    
    subgraph "Load"
        L1[Staging Load]
        L2[Dimension Load]
        L3[Fact Load]
        L4[Archive Load]
    end
    
    E1 --> T1
    E2 --> T1
    E3 --> T1
    E4 --> T1
    T1 --> T2
    T2 --> T3
    T3 --> T4
    T4 --> T5
    T5 --> T6
    T6 --> L1
    L1 --> L2
    L1 --> L3
    L1 --> L4
\`\`\`

## 3. Event-Driven Data Flow
\`\`\`mermaid
graph LR
    subgraph "Event Sources"
        EVT1[User Events]
        EVT2[System Events]
        EVT3[External Events]
    end
    
    subgraph "Event Bus"
        TOPIC1[Topic: Orders]
        TOPIC2[Topic: Users]
        TOPIC3[Topic: Inventory]
    end
    
    subgraph "Event Processors"
        PROC1[Order Processor]
        PROC2[User Processor]
        PROC3[Inventory Processor]
    end
    
    subgraph "Event Store"
        ES[(Event Store)]
        SNAP[(Snapshots)]
    end
    
    subgraph "Projections"
        VIEW1[Order View]
        VIEW2[User View]
        VIEW3[Inventory View]
    end
    
    EVT1 --> TOPIC1
    EVT2 --> TOPIC2
    EVT3 --> TOPIC3
    TOPIC1 --> PROC1
    TOPIC2 --> PROC2
    TOPIC3 --> PROC3
    PROC1 --> ES
    PROC2 --> ES
    PROC3 --> ES
    ES --> SNAP
    ES --> VIEW1
    ES --> VIEW2
    ES --> VIEW3
\`\`\`

## 4. Real-time Data Processing
\`\`\`mermaid
graph TB
    subgraph "Stream Sources"
        KAFKA[Kafka Stream]
        KINESIS[Kinesis Stream]
        PUBSUB[Pub/Sub]
    end
    
    subgraph "Stream Processing"
        WINDOW[Windowing]
        JOIN[Stream Join]
        FILTER[Filtering]
        ENRICH[Enrichment]
    end
    
    subgraph "Stream Analytics"
        CEP[Complex Event Processing]
        ALERT[Alerting]
        METRIC[Metrics]
    end
    
    subgraph "Stream Sinks"
        DB[(Database)]
        CACHE[(Cache)]
        NOTIFY[Notifications]
        DASH[Dashboard]
    end
    
    KAFKA --> WINDOW
    KINESIS --> WINDOW
    PUBSUB --> WINDOW
    WINDOW --> JOIN
    JOIN --> FILTER
    FILTER --> ENRICH
    ENRICH --> CEP
    CEP --> ALERT
    CEP --> METRIC
    ALERT --> NOTIFY
    METRIC --> DASH
    ENRICH --> DB
    ENRICH --> CACHE
\`\`\`

## 5. Data Storage Architecture
\`\`\`mermaid
graph TB
    subgraph "Hot Storage"
        HOT1[(Primary DB)]
        HOT2[(Cache)]
        HOT3[(In-Memory)]
    end
    
    subgraph "Warm Storage"
        WARM1[(Secondary DB)]
        WARM2[(Data Lake)]
        WARM3[(Search Index)]
    end
    
    subgraph "Cold Storage"
        COLD1[(Archive)]
        COLD2[(Backup)]
        COLD3[(Glacier)]
    end
    
    subgraph "Data Lifecycle"
        NEW[New Data] --> HOT1
        HOT1 -->|Age > 30d| WARM1
        WARM1 -->|Age > 90d| COLD1
        HOT1 --> HOT2
        HOT2 --> HOT3
        WARM1 --> WARM2
        WARM2 --> WARM3
        COLD1 --> COLD2
        COLD2 --> COLD3
    end
\`\`\`

## 6. Data Governance Flow
\`\`\`mermaid
graph LR
    subgraph "Data Entry"
        INPUT[Data Input]
        CONSENT[Consent Check]
    end
    
    subgraph "Data Quality"
        VALID[Validation]
        QUALITY[Quality Rules]
        MASTER[Master Data]
    end
    
    subgraph "Data Security"
        ENCRYPT[Encryption]
        MASK[Masking]
        ACCESS[Access Control]
    end
    
    subgraph "Data Compliance"
        AUDIT[Audit Log]
        RETAIN[Retention Policy]
        GDPR[GDPR Compliance]
    end
    
    INPUT --> CONSENT
    CONSENT --> VALID
    VALID --> QUALITY
    QUALITY --> MASTER
    MASTER --> ENCRYPT
    ENCRYPT --> MASK
    MASK --> ACCESS
    ACCESS --> AUDIT
    AUDIT --> RETAIN
    RETAIN --> GDPR
\`\`\`

Generate all diagrams with clear data flow paths and transformation points.`
  },

  'sequence-diagrams': {
    id: 'sequence-diagrams',
    name: 'Sequence Diagrams',
    icon: '📊',
    description: 'API and process sequences',
    detailedDescription: 'Detailed sequence diagrams showing API calls, process flows, and system interactions over time.',
    bestFor: [
      'API documentation',
      'Process documentation',
      'Integration specs',
      'Debugging guides'
    ],
    outputSections: [
      'User Flows',
      'API Sequences',
      'Authentication Flow',
      'Error Handling',
      'Integration Patterns'
    ],
    prompt: `As a Senior Solution Architect, create comprehensive Sequence diagrams using Mermaid syntax.

Project Description: {{input}}

Generate detailed Sequence diagrams including:

## 1. User Authentication Flow
\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant API as API Gateway
    participant AUTH as Auth Service
    participant DB as Database
    participant CACHE as Cache
    
    U->>UI: Enter credentials
    UI->>API: POST /auth/login
    API->>AUTH: Validate credentials
    AUTH->>DB: Query user
    DB-->>AUTH: User data
    AUTH->>AUTH: Hash & compare password
    AUTH->>CACHE: Store session
    AUTH-->>API: JWT token
    API-->>UI: Auth response
    UI->>UI: Store token
    UI-->>U: Login successful
    
    Note over U,UI: Subsequent requests
    U->>UI: Access protected resource
    UI->>API: GET /api/resource + JWT
    API->>AUTH: Validate token
    AUTH->>CACHE: Check session
    CACHE-->>AUTH: Session valid
    AUTH-->>API: Token valid
    API->>DB: Fetch resource
    DB-->>API: Resource data
    API-->>UI: Protected resource
    UI-->>U: Display resource
\`\`\`

## 2. Order Processing Sequence
\`\`\`mermaid
sequenceDiagram
    participant C as Customer
    participant UI as Web UI
    participant API as API Gateway
    participant ORDER as Order Service
    participant INV as Inventory Service
    participant PAY as Payment Service
    participant SHIP as Shipping Service
    participant NOTIFY as Notification Service
    
    C->>UI: Place order
    UI->>API: POST /orders
    API->>ORDER: Create order
    ORDER->>ORDER: Validate order
    
    par Check Inventory
        ORDER->>INV: Check availability
        INV-->>ORDER: Items available
    and Process Payment
        ORDER->>PAY: Process payment
        PAY->>PAY: Validate card
        PAY->>PAY: Charge amount
        PAY-->>ORDER: Payment success
    end
    
    ORDER->>INV: Reserve inventory
    INV-->>ORDER: Inventory reserved
    
    ORDER->>SHIP: Create shipment
    SHIP-->>ORDER: Shipment created
    
    ORDER->>NOTIFY: Send confirmation
    NOTIFY->>C: Email confirmation
    
    ORDER-->>API: Order complete
    API-->>UI: Order response
    UI-->>C: Order confirmed
\`\`\`

## 3. API Integration Pattern
\`\`\`mermaid
sequenceDiagram
    participant CLIENT as Client App
    participant GATEWAY as API Gateway
    participant AUTH as Auth Service
    participant CACHE as Cache Layer
    participant SERVICE as Business Service
    participant EXTERNAL as External API
    participant QUEUE as Message Queue
    
    CLIENT->>GATEWAY: API Request
    GATEWAY->>AUTH: Verify token
    AUTH-->>GATEWAY: Token valid
    
    GATEWAY->>CACHE: Check cache
    alt Cache Hit
        CACHE-->>GATEWAY: Cached data
        GATEWAY-->>CLIENT: Response (cached)
    else Cache Miss
        GATEWAY->>SERVICE: Process request
        
        SERVICE->>EXTERNAL: External call
        EXTERNAL-->>SERVICE: External data
        
        SERVICE->>SERVICE: Process data
        SERVICE->>CACHE: Update cache
        
        SERVICE->>QUEUE: Async task
        Note over QUEUE: Process async
        
        SERVICE-->>GATEWAY: Response
        GATEWAY-->>CLIENT: Response (fresh)
    end
\`\`\`

## 4. Error Handling Sequence
\`\`\`mermaid
sequenceDiagram
    participant USER as User
    participant APP as Application
    participant API as API Service
    participant DB as Database
    participant LOG as Logging Service
    participant MONITOR as Monitoring
    
    USER->>APP: Submit request
    APP->>API: API call
    API->>DB: Query data
    
    alt Success Path
        DB-->>API: Data returned
        API-->>APP: Success response
        APP-->>USER: Display result
    else Database Error
        DB--xAPI: Connection error
        API->>LOG: Log error
        API->>MONITOR: Alert: DB error
        API-->>APP: Error response
        APP-->>USER: Show error message
        
        Note over API,MONITOR: Retry logic
        loop Retry 3 times
            API->>DB: Retry query
            alt Retry Success
                DB-->>API: Data returned
                API-->>APP: Success response
                APP-->>USER: Display result
            else Retry Failed
                DB--xAPI: Still failing
            end
        end
        
        API->>MONITOR: Critical alert
        API-->>APP: Service unavailable
        APP-->>USER: Maintenance message
    end
\`\`\`

## 5. Microservices Communication
\`\`\`mermaid
sequenceDiagram
    participant CLIENT as Client
    participant GATEWAY as API Gateway
    participant USER_SVC as User Service
    participant PRODUCT_SVC as Product Service
    participant CART_SVC as Cart Service
    participant ORDER_SVC as Order Service
    participant EVENT_BUS as Event Bus
    
    CLIENT->>GATEWAY: GET /checkout
    GATEWAY->>USER_SVC: Get user info
    USER_SVC-->>GATEWAY: User data
    
    GATEWAY->>CART_SVC: Get cart items
    CART_SVC->>PRODUCT_SVC: Get product details
    PRODUCT_SVC-->>CART_SVC: Product info
    CART_SVC-->>GATEWAY: Cart with details
    
    GATEWAY-->>CLIENT: Checkout page data
    
    CLIENT->>GATEWAY: POST /orders
    GATEWAY->>ORDER_SVC: Create order
    ORDER_SVC->>EVENT_BUS: Publish: OrderCreated
    
    par Event Processing
        EVENT_BUS->>CART_SVC: Clear cart
        CART_SVC-->>EVENT_BUS: Cart cleared
    and
        EVENT_BUS->>USER_SVC: Update user history
        USER_SVC-->>EVENT_BUS: History updated
    and
        EVENT_BUS->>PRODUCT_SVC: Update inventory
        PRODUCT_SVC-->>EVENT_BUS: Inventory updated
    end
    
    ORDER_SVC-->>GATEWAY: Order created
    GATEWAY-->>CLIENT: Order confirmation
\`\`\`

## 6. Webhook Processing
\`\`\`mermaid
sequenceDiagram
    participant EXT as External Service
    participant WH as Webhook Endpoint
    participant VAL as Validator
    participant PROC as Processor
    participant DB as Database
    participant QUEUE as Queue
    participant APP as Application
    
    EXT->>WH: POST webhook event
    WH->>VAL: Validate signature
    
    alt Valid Signature
        VAL->>VAL: Verify payload
        VAL->>WH: Valid
        WH-->>EXT: 200 OK
        
        WH->>QUEUE: Queue event
        Note over QUEUE: Async processing
        
        QUEUE->>PROC: Process event
        PROC->>DB: Update data
        DB-->>PROC: Updated
        
        PROC->>APP: Notify application
        APP->>APP: Update UI
        
    else Invalid Signature
        VAL->>WH: Invalid
        WH-->>EXT: 401 Unauthorized
    end
\`\`\`

Generate all sequence diagrams with clear interaction patterns and proper Mermaid syntax.`
  },

  'database-schema': {
    id: 'database-schema',
    name: 'Database Schema',
    icon: '🗄️',
    description: 'Entity relationships and data models',
    detailedDescription: 'Comprehensive database schema diagrams showing entities, relationships, constraints, and data models.',
    bestFor: [
      'Database design',
      'Data modeling',
      'Schema documentation',
      'Migration planning'
    ],
    outputSections: [
      'Entity Relationships',
      'Table Structures',
      'Indexes & Constraints',
      'Data Types',
      'Normalization'
    ],
    prompt: `As a Senior Database Architect, create comprehensive Database Schema diagrams using Mermaid syntax.

Project Description: {{input}}

Generate detailed Database Schema diagrams including:

## 1. Entity Relationship Diagram (ERD)
\`\`\`mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ ADDRESSES : has
    USERS ||--o{ REVIEWS : writes
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        timestamp created_at
        timestamp updated_at
        boolean is_active
        string role
    }
    
    PRODUCTS ||--o{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ REVIEWS : has
    PRODUCTS ||--o{ INVENTORY : tracks
    PRODUCTS {
        uuid id PK
        string sku UK
        string name
        text description
        decimal price
        string category_id FK
        timestamp created_at
        boolean is_active
    }
    
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--|| PAYMENTS : has
    ORDERS ||--|| SHIPMENTS : has
    ORDERS {
        uuid id PK
        string order_number UK
        uuid user_id FK
        decimal total_amount
        string status
        timestamp order_date
        timestamp updated_at
    }
    
    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        integer quantity
        decimal unit_price
        decimal subtotal
    }
    
    CATEGORIES ||--o{ PRODUCTS : contains
    CATEGORIES {
        uuid id PK
        string name UK
        string slug UK
        uuid parent_id FK
        integer sort_order
    }
    
    INVENTORY {
        uuid id PK
        uuid product_id FK
        integer quantity_available
        integer quantity_reserved
        string warehouse_id FK
        timestamp last_updated
    }
    
    PAYMENTS {
        uuid id PK
        uuid order_id FK
        string payment_method
        string transaction_id
        decimal amount
        string status
        timestamp payment_date
    }
    
    SHIPMENTS {
        uuid id PK
        uuid order_id FK
        uuid address_id FK
        string tracking_number
        string carrier
        string status
        timestamp shipped_date
        timestamp delivered_date
    }
\`\`\`

## 2. User Management Schema
\`\`\`mermaid
erDiagram
    USERS ||--o{ USER_SESSIONS : has
    USERS ||--o{ USER_ROLES : has
    USERS ||--o{ USER_PERMISSIONS : has
    USERS ||--o{ AUDIT_LOGS : generates
    
    USERS {
        uuid id PK
        string email UK
        string username UK
        string password_hash
        boolean email_verified
        timestamp email_verified_at
        boolean two_factor_enabled
        string two_factor_secret
        timestamp last_login
        integer failed_login_attempts
        timestamp locked_until
        timestamp created_at
        timestamp updated_at
    }
    
    ROLES ||--o{ USER_ROLES : assigns
    ROLES ||--o{ ROLE_PERMISSIONS : has
    ROLES {
        uuid id PK
        string name UK
        string description
        boolean is_system
        timestamp created_at
    }
    
    PERMISSIONS ||--o{ USER_PERMISSIONS : grants
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : includes
    PERMISSIONS {
        uuid id PK
        string resource
        string action
        string description
        timestamp created_at
    }
    
    USER_SESSIONS {
        uuid id PK
        uuid user_id FK
        string token UK
        string ip_address
        string user_agent
        timestamp expires_at
        timestamp created_at
        timestamp last_activity
    }
    
    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string action
        string resource_type
        uuid resource_id
        json old_values
        json new_values
        string ip_address
        timestamp created_at
    }
\`\`\`

## 3. Product Catalog Schema
\`\`\`mermaid
erDiagram
    PRODUCTS ||--o{ PRODUCT_VARIANTS : has
    PRODUCTS ||--o{ PRODUCT_IMAGES : has
    PRODUCTS ||--o{ PRODUCT_ATTRIBUTES : has
    PRODUCTS ||--|| PRODUCT_SEO : has
    
    PRODUCTS {
        uuid id PK
        string sku UK
        string name
        string slug UK
        text description
        uuid brand_id FK
        uuid category_id FK
        decimal base_price
        decimal weight
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_VARIANTS {
        uuid id PK
        uuid product_id FK
        string sku UK
        string name
        json attributes
        decimal price_modifier
        integer stock_quantity
        boolean is_default
    }
    
    ATTRIBUTES ||--o{ PRODUCT_ATTRIBUTES : defines
    ATTRIBUTES ||--o{ ATTRIBUTE_VALUES : has
    ATTRIBUTES {
        uuid id PK
        string name
        string type
        boolean is_required
        integer sort_order
    }
    
    ATTRIBUTE_VALUES {
        uuid id PK
        uuid attribute_id FK
        string value
        integer sort_order
    }
    
    PRODUCT_IMAGES {
        uuid id PK
        uuid product_id FK
        string url
        string alt_text
        integer sort_order
        boolean is_primary
    }
    
    PRODUCT_SEO {
        uuid id PK
        uuid product_id FK
        string meta_title
        text meta_description
        string canonical_url
        json structured_data
    }
\`\`\`

## 4. Transaction & Financial Schema
\`\`\`mermaid
erDiagram
    ACCOUNTS ||--o{ TRANSACTIONS : has
    ACCOUNTS ||--o{ ACCOUNT_BALANCES : tracks
    
    ACCOUNTS {
        uuid id PK
        string account_number UK
        string account_type
        uuid owner_id FK
        string currency
        decimal credit_limit
        string status
        timestamp created_at
    }
    
    TRANSACTIONS ||--|| TRANSACTION_DETAILS : has
    TRANSACTIONS {
        uuid id PK
        string transaction_id UK
        uuid source_account_id FK
        uuid destination_account_id FK
        decimal amount
        string currency
        string type
        string status
        timestamp initiated_at
        timestamp completed_at
    }
    
    TRANSACTION_DETAILS {
        uuid id PK
        uuid transaction_id FK
        string description
        json metadata
        string reference_number
        decimal fee_amount
        decimal exchange_rate
    }
    
    ACCOUNT_BALANCES {
        uuid id PK
        uuid account_id FK
        decimal available_balance
        decimal pending_balance
        decimal ledger_balance
        timestamp as_of_date
    }
    
    LEDGER_ENTRIES {
        uuid id PK
        uuid transaction_id FK
        uuid account_id FK
        string entry_type
        decimal debit_amount
        decimal credit_amount
        decimal running_balance
        timestamp entry_date
    }
\`\`\`

## 5. Content Management Schema
\`\`\`mermaid
erDiagram
    CONTENT ||--o{ CONTENT_VERSIONS : has
    CONTENT ||--o{ CONTENT_TAGS : has
    CONTENT ||--o{ CONTENT_MEDIA : includes
    
    CONTENT {
        uuid id PK
        string slug UK
        string title
        string content_type
        json content_data
        uuid author_id FK
        string status
        timestamp published_at
        timestamp created_at
        timestamp updated_at
    }
    
    CONTENT_VERSIONS {
        uuid id PK
        uuid content_id FK
        integer version_number
        json content_data
        uuid modified_by FK
        string change_summary
        timestamp created_at
    }
    
    TAGS ||--o{ CONTENT_TAGS : categorizes
    TAGS {
        uuid id PK
        string name UK
        string slug UK
        string description
    }
    
    MEDIA ||--o{ CONTENT_MEDIA : references
    MEDIA {
        uuid id PK
        string file_name
        string file_type
        string mime_type
        integer file_size
        string storage_path
        string cdn_url
        json metadata
        timestamp uploaded_at
    }
    
    CONTENT_MEDIA {
        uuid id PK
        uuid content_id FK
        uuid media_id FK
        string usage_type
        integer sort_order
    }
\`\`\`

## 6. Analytics & Events Schema
\`\`\`mermaid
erDiagram
    EVENTS ||--o{ EVENT_PROPERTIES : has
    EVENTS ||--|| EVENT_SESSIONS : belongs
    
    EVENTS {
        uuid id PK
        string event_name
        string event_type
        uuid user_id FK
        uuid session_id FK
        json properties
        string source
        timestamp occurred_at
    }
    
    EVENT_SESSIONS {
        uuid id PK
        uuid user_id FK
        string session_token
        string ip_address
        string user_agent
        string referrer
        timestamp started_at
        timestamp ended_at
    }
    
    METRICS ||--o{ METRIC_VALUES : records
    METRICS {
        uuid id PK
        string metric_name UK
        string metric_type
        string aggregation_type
        string unit
        text description
    }
    
    METRIC_VALUES {
        uuid id PK
        uuid metric_id FK
        decimal value
        json dimensions
        timestamp recorded_at
    }
    
    FUNNEL_STEPS ||--o{ FUNNEL_EVENTS : tracks
    FUNNEL_STEPS {
        uuid id PK
        string funnel_name
        integer step_order
        string step_name
        string event_name
    }
    
    FUNNEL_EVENTS {
        uuid id PK
        uuid funnel_step_id FK
        uuid session_id FK
        uuid user_id FK
        timestamp occurred_at
    }
\`\`\`

Generate all database schema diagrams with proper relationships and constraints.`
  },

  'network-topology': {
    id: 'network-topology',
    name: 'Network Topology',
    icon: '🌐',
    description: 'Network and infrastructure layout',
    detailedDescription: 'Detailed network topology diagrams showing infrastructure, security zones, and communication paths.',
    bestFor: [
      'Infrastructure planning',
      'Security architecture',
      'Network documentation',
      'Disaster recovery'
    ],
    outputSections: [
      'Network Architecture',
      'Security Zones',
      'Load Balancing',
      'Redundancy',
      'Cloud Infrastructure'
    ],
    prompt: `As a Senior Network Architect, create comprehensive Network Topology diagrams using Mermaid syntax.

Project Description: {{input}}

Generate detailed Network Topology diagrams including:

## 1. Overall Network Architecture
\`\`\`mermaid
graph TB
    subgraph "Internet"
        INET[Internet]
        USERS[End Users]
    end
    
    subgraph "Edge Layer"
        CDN[CDN Provider]
        DDOS[DDoS Protection]
        DNS[DNS Service]
    end
    
    subgraph "DMZ - Public Zone"
        FW1[Firewall 1]
        LB1[Load Balancer 1]
        WAF[Web Application Firewall]
        PROXY[Reverse Proxy]
    end
    
    subgraph "Application Zone"
        WEB1[Web Server 1]
        WEB2[Web Server 2]
        APP1[App Server 1]
        APP2[App Server 2]
        API1[API Server 1]
        API2[API Server 2]
    end
    
    subgraph "Internal Zone"
        FW2[Firewall 2]
        LB2[Internal LB]
        CACHE[Cache Cluster]
        QUEUE[Message Queue]
    end
    
    subgraph "Data Zone"
        DB1[(Primary DB)]
        DB2[(Replica DB)]
        STORAGE[Object Storage]
        BACKUP[Backup Storage]
    end
    
    subgraph "Management Zone"
        BASTION[Bastion Host]
        MONITOR[Monitoring]
        LOG[Log Aggregation]
        CONFIG[Config Server]
    end
    
    USERS --> INET
    INET --> CDN
    CDN --> DDOS
    DDOS --> DNS
    DNS --> FW1
    FW1 --> WAF
    WAF --> LB1
    LB1 --> PROXY
    PROXY --> WEB1
    PROXY --> WEB2
    WEB1 --> APP1
    WEB2 --> APP2
    APP1 --> API1
    APP2 --> API2
    API1 --> FW2
    API2 --> FW2
    FW2 --> LB2
    LB2 --> CACHE
    LB2 --> QUEUE
    CACHE --> DB1
    QUEUE --> DB1
    DB1 -.->|Replication| DB2
    DB1 --> STORAGE
    STORAGE --> BACKUP
    BASTION --> MONITOR
    MONITOR --> LOG
    LOG --> CONFIG
\`\`\`

## 2. Cloud Infrastructure Topology
\`\`\`mermaid
graph TB
    subgraph "Multi-Region Setup"
        subgraph "Region 1 - Primary"
            subgraph "VPC1[VPC - 10.0.0.0/16]"
                subgraph "Public Subnet 1a"
                    NAT1[NAT Gateway]
                    ALB1[Application LB]
                end
                subgraph "Private Subnet 1a"
                    EC2_1A[EC2 Instances]
                    RDS1[RDS Primary]
                end
                subgraph "Private Subnet 1b"
                    EC2_1B[EC2 Instances]
                    RDS2[RDS Standby]
                end
            end
        end
        
        subgraph "Region 2 - DR"
            subgraph "VPC2[VPC - 10.1.0.0/16]"
                subgraph "Public Subnet 2a"
                    NAT2[NAT Gateway]
                    ALB2[Application LB]
                end
                subgraph "Private Subnet 2a"
                    EC2_2A[EC2 Instances]
                    RDS3[RDS Read Replica]
                end
            end
        end
    end
    
    subgraph "Global Services"
        R53[Route 53]
        CF[CloudFront]
        S3[S3 Buckets]
    end
    
    R53 --> CF
    CF --> ALB1
    CF --> ALB2
    ALB1 --> EC2_1A
    ALB1 --> EC2_1B
    ALB2 --> EC2_2A
    EC2_1A --> RDS1
    EC2_1B --> RDS1
    RDS1 -.->|Sync| RDS2
    RDS1 -.->|Replicate| RDS3
    EC2_1A --> S3
    EC2_2A --> S3
\`\`\`

## 3. Security Zones & Segmentation
\`\`\`mermaid
graph LR
    subgraph "Untrusted Zone"
        INTERNET[Internet]
        EXTERNAL[External Users]
    end
    
    subgraph "Perimeter Security"
        EDGE_FW[Edge Firewall]
        IPS[IPS/IDS]
        WAF[WAF]
    end
    
    subgraph "DMZ - Trust Level 1"
        PUBLIC_WEB[Public Web]
        PUBLIC_API[Public API]
    end
    
    subgraph "Semi-Trusted - Level 2"
        APP_TIER[Application Tier]
        INT_API[Internal API]
    end
    
    subgraph "Trusted - Level 3"
        BIZ_LOGIC[Business Logic]
        INT_SVC[Internal Services]
    end
    
    subgraph "Restricted - Level 4"
        DB_TIER[(Database)]
        SECRETS[Secrets Vault]
    end
    
    subgraph "Management - Level 5"
        ADMIN[Admin Access]
        AUDIT[Audit Logs]
    end
    
    EXTERNAL --> INTERNET
    INTERNET --> EDGE_FW
    EDGE_FW --> IPS
    IPS --> WAF
    WAF --> PUBLIC_WEB
    WAF --> PUBLIC_API
    PUBLIC_WEB --> APP_TIER
    PUBLIC_API --> APP_TIER
    APP_TIER --> INT_API
    INT_API --> BIZ_LOGIC
    BIZ_LOGIC --> INT_SVC
    INT_SVC --> DB_TIER
    INT_SVC --> SECRETS
    ADMIN --> AUDIT
    AUDIT -.->|Monitor| DB_TIER
\`\`\`

## 4. Load Balancing & High Availability
\`\`\`mermaid
graph TB
    subgraph "Global Load Balancing"
        GSLB[Global Server LB]
    end
    
    subgraph "Site A - Active"
        LB_A1[LB A1 - Primary]
        LB_A2[LB A2 - Secondary]
        subgraph "Pool A"
            SRV_A1[Server A1]
            SRV_A2[Server A2]
            SRV_A3[Server A3]
        end
    end
    
    subgraph "Site B - Active"
        LB_B1[LB B1 - Primary]
        LB_B2[LB B2 - Secondary]
        subgraph "Pool B"
            SRV_B1[Server B1]
            SRV_B2[Server B2]
            SRV_B3[Server B3]
        end
    end
    
    subgraph "Health Monitoring"
        HEALTH[Health Checks]
        METRICS[Metrics]
    end
    
    GSLB --> LB_A1
    GSLB --> LB_B1
    LB_A1 -.->|Failover| LB_A2
    LB_B1 -.->|Failover| LB_B2
    
    LB_A1 --> SRV_A1
    LB_A1 --> SRV_A2
    LB_A1 --> SRV_A3
    
    LB_B1 --> SRV_B1
    LB_B1 --> SRV_B2
    LB_B1 --> SRV_B3
    
    HEALTH --> SRV_A1
    HEALTH --> SRV_A2
    HEALTH --> SRV_A3
    HEALTH --> SRV_B1
    HEALTH --> SRV_B2
    HEALTH --> SRV_B3
    
    METRICS --> GSLB
\`\`\`

## 5. Kubernetes Cluster Architecture
\`\`\`mermaid
graph TB
    subgraph "Control Plane"
        API[API Server]
        ETCD[(etcd)]
        SCHED[Scheduler]
        CTRL[Controller Manager]
    end
    
    subgraph "Worker Nodes"
        subgraph "Node 1"
            KUBELET1[Kubelet]
            PROXY1[Kube-proxy]
            POD1A[Pod 1A]
            POD1B[Pod 1B]
        end
        
        subgraph "Node 2"
            KUBELET2[Kubelet]
            PROXY2[Kube-proxy]
            POD2A[Pod 2A]
            POD2B[Pod 2B]
        end
        
        subgraph "Node 3"
            KUBELET3[Kubelet]
            PROXY3[Kube-proxy]
            POD3A[Pod 3A]
            POD3B[Pod 3B]
        end
    end
    
    subgraph "Ingress"
        INGRESS[Ingress Controller]
        SVC_LB[Service LB]
    end
    
    subgraph "Storage"
        PV[Persistent Volumes]
        CSI[CSI Driver]
    end
    
    API --> ETCD
    API --> SCHED
    API --> CTRL
    SCHED --> KUBELET1
    SCHED --> KUBELET2
    SCHED --> KUBELET3
    KUBELET1 --> POD1A
    KUBELET1 --> POD1B
    KUBELET2 --> POD2A
    KUBELET2 --> POD2B
    KUBELET3 --> POD3A
    KUBELET3 --> POD3B
    INGRESS --> SVC_LB
    SVC_LB --> PROXY1
    SVC_LB --> PROXY2
    SVC_LB --> PROXY3
    CSI --> PV
    POD1A --> PV
    POD2A --> PV
\`\`\`

## 6. Disaster Recovery Network
\`\`\`mermaid
graph LR
    subgraph "Primary Site"
        PROD_NET[Production Network]
        PROD_APP[Applications]
        PROD_DB[(Primary Database)]
        PROD_STORAGE[Primary Storage]
    end
    
    subgraph "Network Links"
        MPLS[MPLS Circuit]
        VPN[VPN Backup]
        DARK[Dark Fiber]
    end
    
    subgraph "DR Site"
        DR_NET[DR Network]
        DR_APP[Standby Apps]
        DR_DB[(Standby Database)]
        DR_STORAGE[Replica Storage]
    end
    
    subgraph "Replication"
        SYNC[Sync Replication]
        ASYNC[Async Replication]
    end
    
    PROD_APP --> PROD_DB
    PROD_DB --> PROD_STORAGE
    
    PROD_NET --> MPLS
    PROD_NET -.->|Backup| VPN
    PROD_NET -.->|Premium| DARK
    
    MPLS --> DR_NET
    VPN --> DR_NET
    DARK --> DR_NET
    
    PROD_DB -->|Real-time| SYNC
    SYNC --> DR_DB
    
    PROD_STORAGE -->|Periodic| ASYNC
    ASYNC --> DR_STORAGE
    
    DR_NET --> DR_APP
    DR_APP --> DR_DB
    DR_DB --> DR_STORAGE
\`\`\`

Generate all network topology diagrams with clear infrastructure relationships.`
  },

  'deployment-architecture': {
    id: 'deployment-architecture',
    name: 'Deployment Architecture',
    icon: '🚀',
    description: 'CI/CD and deployment pipelines',
    detailedDescription: 'Comprehensive deployment architecture diagrams showing CI/CD pipelines, environments, and deployment strategies.',
    bestFor: [
      'DevOps documentation',
      'Deployment planning',
      'CI/CD design',
      'Release management'
    ],
    outputSections: [
      'CI/CD Pipeline',
      'Environment Architecture',
      'Deployment Strategies',
      'Container Orchestration',
      'Release Process'
    ],
    prompt: `As a Senior DevOps Architect, create comprehensive Deployment Architecture diagrams using Mermaid syntax.

Project Description: {{input}}

Generate detailed Deployment Architecture diagrams including:

## 1. CI/CD Pipeline Architecture
\`\`\`mermaid
graph LR
    subgraph "Source Control"
        GIT[Git Repository]
        BRANCH[Feature Branch]
        PR[Pull Request]
    end
    
    subgraph "CI Pipeline"
        WEBHOOK[Webhook Trigger]
        BUILD[Build Stage]
        TEST[Test Stage]
        SCAN[Security Scan]
        QUALITY[Code Quality]
        ARTIFACT[Artifact Creation]
    end
    
    subgraph "CD Pipeline"
        DEPLOY_DEV[Deploy to Dev]
        TEST_DEV[Dev Tests]
        DEPLOY_STG[Deploy to Staging]
        TEST_STG[Staging Tests]
        APPROVE[Manual Approval]
        DEPLOY_PROD[Deploy to Prod]
        VERIFY[Prod Verification]
    end
    
    subgraph "Artifact Storage"
        REGISTRY[Container Registry]
        ARTIFACTORY[Artifact Repository]
        S3[S3 Bucket]
    end
    
    subgraph "Monitoring"
        METRICS[Metrics]
        LOGS[Logs]
        ALERTS[Alerts]
    end
    
    BRANCH --> PR
    PR --> GIT
    GIT --> WEBHOOK
    WEBHOOK --> BUILD
    BUILD --> TEST
    TEST --> SCAN
    SCAN --> QUALITY
    QUALITY --> ARTIFACT
    ARTIFACT --> REGISTRY
    ARTIFACT --> ARTIFACTORY
    REGISTRY --> DEPLOY_DEV
    DEPLOY_DEV --> TEST_DEV
    TEST_DEV --> DEPLOY_STG
    DEPLOY_STG --> TEST_STG
    TEST_STG --> APPROVE
    APPROVE --> DEPLOY_PROD
    DEPLOY_PROD --> VERIFY
    VERIFY --> METRICS
    METRICS --> LOGS
    LOGS --> ALERTS
\`\`\`

## 2. Environment Architecture
\`\`\`mermaid
graph TB
    subgraph "Development Environment"
        DEV_LB[Dev Load Balancer]
        DEV_APP[Dev App Servers]
        DEV_DB[(Dev Database)]
        DEV_CACHE[Dev Cache]
    end
    
    subgraph "Testing Environment"
        TEST_LB[Test Load Balancer]
        TEST_APP[Test App Servers]
        TEST_DB[(Test Database)]
        TEST_MOCK[Mock Services]
    end
    
    subgraph "Staging Environment"
        STG_LB[Staging LB]
        STG_APP[Staging Apps]
        STG_DB[(Staging DB)]
        STG_INT[External Integrations]
    end
    
    subgraph "Production Environment"
        subgraph "Blue Environment"
            BLUE_LB[Blue LB]
            BLUE_APP[Blue Apps]
            BLUE_DB[(Production DB)]
        end
        
        subgraph "Green Environment"
            GREEN_LB[Green LB]
            GREEN_APP[Green Apps]
            GREEN_DB[(Same Prod DB)]
        end
        
        ROUTER[Traffic Router]
    end
    
    DEV_LB --> DEV_APP
    DEV_APP --> DEV_DB
    DEV_APP --> DEV_CACHE
    
    TEST_LB --> TEST_APP
    TEST_APP --> TEST_DB
    TEST_APP --> TEST_MOCK
    
    STG_LB --> STG_APP
    STG_APP --> STG_DB
    STG_APP --> STG_INT
    
    ROUTER --> BLUE_LB
    ROUTER -.->|Switchover| GREEN_LB
    BLUE_LB --> BLUE_APP
    GREEN_LB --> GREEN_APP
    BLUE_APP --> BLUE_DB
    GREEN_APP --> GREEN_DB
\`\`\`

## 3. Container Deployment Architecture
\`\`\`mermaid
graph TB
    subgraph "Container Build"
        CODE[Source Code]
        DOCKER[Dockerfile]
        BUILD[Docker Build]
        IMAGE[Container Image]
    end
    
    subgraph "Container Registry"
        REGISTRY[Registry]
        SCAN[Vulnerability Scan]
        SIGN[Image Signing]
        TAG[Version Tags]
    end
    
    subgraph "Orchestration Platform"
        subgraph "Kubernetes Cluster"
            MASTER[Master Nodes]
            WORKER[Worker Nodes]
            
            subgraph "Namespaces"
                DEV_NS[dev-namespace]
                STG_NS[staging-namespace]
                PROD_NS[prod-namespace]
            end
            
            subgraph "Workloads"
                DEPLOY[Deployments]
                SVC[Services]
                INGRESS[Ingress]
                CONFIG[ConfigMaps]
                SECRET[Secrets]
            end
        end
    end
    
    subgraph "Supporting Services"
        HELM[Helm Charts]
        ISTIO[Service Mesh]
        MONITOR[Prometheus]
        LOG[ELK Stack]
    end
    
    CODE --> DOCKER
    DOCKER --> BUILD
    BUILD --> IMAGE
    IMAGE --> REGISTRY
    REGISTRY --> SCAN
    SCAN --> SIGN
    SIGN --> TAG
    TAG --> MASTER
    MASTER --> WORKER
    WORKER --> DEV_NS
    WORKER --> STG_NS
    WORKER --> PROD_NS
    DEV_NS --> DEPLOY
    DEPLOY --> SVC
    SVC --> INGRESS
    CONFIG --> DEPLOY
    SECRET --> DEPLOY
    HELM --> DEPLOY
    ISTIO --> SVC
    MONITOR --> WORKER
    LOG --> WORKER
\`\`\`

## 4. Deployment Strategies
\`\`\`mermaid
graph LR
    subgraph "Rolling Deployment"
        R_V1[Version 1]
        R_V2_1[Version 2 - 25%]
        R_V2_2[Version 2 - 50%]
        R_V2_3[Version 2 - 75%]
        R_V2_4[Version 2 - 100%]
        
        R_V1 --> R_V2_1
        R_V2_1 --> R_V2_2
        R_V2_2 --> R_V2_3
        R_V2_3 --> R_V2_4
    end
    
    subgraph "Blue-Green Deployment"
        BG_BLUE[Blue - Active]
        BG_GREEN[Green - New]
        BG_SWITCH[Switch Traffic]
        BG_GREEN2[Green - Active]
        
        BG_BLUE --> BG_GREEN
        BG_GREEN --> BG_SWITCH
        BG_SWITCH --> BG_GREEN2
    end
    
    subgraph "Canary Deployment"
        C_V1[Version 1 - 90%]
        C_V2[Version 2 - 10%]
        C_V2_50[Version 2 - 50%]
        C_V2_100[Version 2 - 100%]
        
        C_V1 --> C_V2
        C_V2 --> C_V2_50
        C_V2_50 --> C_V2_100
    end
    
    subgraph "Feature Flag Deployment"
        FF_DEPLOY[Deploy All]
        FF_FLAG[Feature Flags]
        FF_ENABLE[Progressive Enable]
        FF_FULL[Full Rollout]
        
        FF_DEPLOY --> FF_FLAG
        FF_FLAG --> FF_ENABLE
        FF_ENABLE --> FF_FULL
    end
\`\`\`

## 5. GitOps Deployment Flow
\`\`\`mermaid
graph TB
    subgraph "Developer Workflow"
        DEV[Developer]
        CODE_REPO[Code Repository]
        CI[CI Pipeline]
    end
    
    subgraph "GitOps Repository"
        CONFIG_REPO[Config Repository]
        MANIFEST[K8s Manifests]
        VALUES[Helm Values]
        KUSTOMIZE[Kustomization]
    end
    
    subgraph "GitOps Controller"
        ARGO[ArgoCD/Flux]
        SYNC[Sync Engine]
        DIFF[Diff Detection]
    end
    
    subgraph "Kubernetes Clusters"
        DEV_CLUSTER[Dev Cluster]
        STG_CLUSTER[Staging Cluster]
        PROD_CLUSTER[Prod Cluster]
    end
    
    subgraph "Observability"
        MONITOR[Monitoring]
        AUDIT[Audit Logs]
        ROLLBACK[Rollback]
    end
    
    DEV --> CODE_REPO
    CODE_REPO --> CI
    CI --> CONFIG_REPO
    CONFIG_REPO --> MANIFEST
    CONFIG_REPO --> VALUES
    CONFIG_REPO --> KUSTOMIZE
    ARGO --> CONFIG_REPO
    ARGO --> SYNC
    SYNC --> DIFF
    DIFF --> DEV_CLUSTER
    DIFF --> STG_CLUSTER
    DIFF --> PROD_CLUSTER
    DEV_CLUSTER --> MONITOR
    STG_CLUSTER --> MONITOR
    PROD_CLUSTER --> MONITOR
    MONITOR --> AUDIT
    AUDIT --> ROLLBACK
    ROLLBACK --> CONFIG_REPO
\`\`\`

## 6. Multi-Cloud Deployment
\`\`\`mermaid
graph TB
    subgraph "CI/CD Hub"
        PIPELINE[Central Pipeline]
        ARTIFACTS[Artifact Store]
    end
    
    subgraph "AWS Deployment"
        AWS_ECR[ECR Registry]
        AWS_EKS[EKS Cluster]
        AWS_ALB[ALB]
        AWS_RDS[(RDS)]
    end
    
    subgraph "Azure Deployment"
        AZURE_ACR[ACR Registry]
        AZURE_AKS[AKS Cluster]
        AZURE_AGW[App Gateway]
        AZURE_SQL[(Azure SQL)]
    end
    
    subgraph "GCP Deployment"
        GCP_GCR[GCR Registry]
        GCP_GKE[GKE Cluster]
        GCP_GLB[Cloud LB]
        GCP_SQL[(Cloud SQL)]
    end
    
    subgraph "Traffic Management"
        GLOBAL_DNS[Global DNS]
        GLOBAL_CDN[Multi-CDN]
        FAILOVER[Failover Logic]
    end
    
    PIPELINE --> ARTIFACTS
    ARTIFACTS --> AWS_ECR
    ARTIFACTS --> AZURE_ACR
    ARTIFACTS --> GCP_GCR
    
    AWS_ECR --> AWS_EKS
    AWS_EKS --> AWS_ALB
    AWS_EKS --> AWS_RDS
    
    AZURE_ACR --> AZURE_AKS
    AZURE_AKS --> AZURE_AGW
    AZURE_AKS --> AZURE_SQL
    
    GCP_GCR --> GCP_GKE
    GCP_GKE --> GCP_GLB
    GCP_GKE --> GCP_SQL
    
    GLOBAL_DNS --> AWS_ALB
    GLOBAL_DNS --> AZURE_AGW
    GLOBAL_DNS --> GCP_GLB
    
    GLOBAL_CDN --> GLOBAL_DNS
    FAILOVER --> GLOBAL_DNS
\`\`\`

Generate all deployment architecture diagrams with clear pipeline and environment relationships.`
  }
}

export const defaultArchitecturePrompt = architectureSections['system-overview'].prompt

export function getArchitectureSectionPrompt(sectionId: string): string {
  return architectureSections[sectionId]?.prompt || defaultArchitecturePrompt
}

export function getAllArchitectureSections(): ArchitectureSection[] {
  return Object.values(architectureSections)
}

export function getArchitectureSectionById(sectionId: string): ArchitectureSection | undefined {
  return architectureSections[sectionId]
}

export function generateCombinedArchitecture(selectedSections: string[], context: {
  input: string
  business_analysis?: string
  functional_spec?: string
  technical_spec?: string
}): string {
  if (selectedSections.length === 0) {
    return defaultArchitecturePrompt
  }

  const sections = selectedSections.map(id => architectureSections[id]).filter(Boolean)
  
  const combinedPrompt = `As a Senior Solution Architect, create comprehensive architecture diagrams covering multiple aspects using Mermaid syntax.

Project Description: {{input}}
${context.business_analysis ? `Business Analysis: {{business_analysis}}` : ''}
${context.functional_spec ? `Functional Requirements: {{functional_spec}}` : ''}
${context.technical_spec ? `Technical Specification: {{technical_spec}}` : ''}

Generate detailed architecture diagrams covering the following areas:

${sections.map((section, index) => `
## Part ${index + 1}: ${section.name}
${section.prompt.split('\n').slice(5).join('\n')}
`).join('\n\n')}

Ensure all diagrams are cohesive and reference each other where appropriate. Use proper Mermaid syntax throughout.`

  return combinedPrompt
}