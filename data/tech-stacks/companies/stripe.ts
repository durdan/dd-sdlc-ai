import { Company } from '../types';

export const stripe: Company = {
  slug: 'stripe',
  name: 'Stripe',
  logo: '/tech-stacks/logos/stripe.svg',
  description: 'Ruby-based payment infrastructure handling billions in transactions annually',
  category: 'fintech',
  tags: ['payments', 'fintech', 'ruby', 'api', 'developer-tools', 'infrastructure'],

  info: {
    founded: 2010,
    headquarters: 'San Francisco, CA',
    employees: '8,000+',
    revenue: '$14B+',
    publiclyTraded: false,
    website: 'https://stripe.com',
  },

  metrics: {
    users: '100M+ businesses',
    requestsPerSecond: '500+',
    uptime: '99.999%',
    latency: '<100ms',
    customMetrics: [
      { label: 'Payment Volume', value: '$1T+ annually' },
      { label: 'Countries', value: '46+' },
      { label: 'Currencies', value: '135+' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
      { name: 'Flow', category: 'language', usage: 'secondary' },
      { name: 'Storybook', category: 'library', usage: 'primary' },
    ],
    backend: [
      { name: 'Ruby', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Ruby on Rails', category: 'framework', usage: 'primary' },
      { name: 'Go', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Java', category: 'language', usage: 'secondary' },
      { name: 'Scala', category: 'language', usage: 'secondary' },
    ],
    databases: [
      { name: 'PostgreSQL', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'MongoDB', category: 'database', usage: 'primary' },
      { name: 'Redis', category: 'cache', usage: 'primary', isPrimary: true },
      { name: 'Elasticsearch', category: 'search', usage: 'primary' },
    ],
    infrastructure: [
      { name: 'AWS', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
      { name: 'Docker', category: 'container', usage: 'primary' },
      { name: 'Terraform', category: 'ci-cd', usage: 'primary' },
    ],
    devOps: [
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
      { name: 'Jenkins', category: 'ci-cd', usage: 'primary' },
      { name: 'Datadog', category: 'monitoring', usage: 'primary' },
      { name: 'PagerDuty', category: 'monitoring', usage: 'primary' },
      { name: 'Terraform', category: 'ci-cd', usage: 'primary', isPrimary: true },
    ],
    dataEngineering: [
      { name: 'Apache Kafka', category: 'queue', usage: 'primary', isPrimary: true },
      { name: 'Apache Spark', category: 'analytics', usage: 'primary' },
      { name: 'Apache Airflow', category: 'analytics', usage: 'primary' },
      { name: 'Snowflake', category: 'analytics', usage: 'primary' },
    ],
    ml: [
      { name: 'Python', category: 'language', usage: 'primary' },
      { name: 'PyTorch', category: 'ml-framework', usage: 'primary' },
      { name: 'Radar', category: 'ml-framework', usage: 'primary', isPrimary: true, description: 'Stripe\'s fraud detection' },
    ],
    security: [
      { name: 'PCI DSS', category: 'security', usage: 'primary' },
      { name: 'Vault', category: 'security', usage: 'primary' },
      { name: 'HSM', category: 'security', usage: 'primary' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'layered',
    description: 'API-First Payment Infrastructure',
    htmlDiagram: {
      title: 'Stripe Payment Architecture',
      subtitle: 'Secure Payment Processing',
      layers: [
        {
          id: 'clients',
          name: 'Client Integration',
          position: 'top',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'js', name: 'Stripe.js', techStack: ['JavaScript', 'TypeScript'] },
            { id: 'elements', name: 'Stripe Elements', techStack: ['React', 'Web Components'] },
            { id: 'sdks', name: 'Server SDKs', techStack: ['Ruby', 'Python', 'Node.js', 'Go'] },
          ],
        },
        {
          id: 'api',
          name: 'API Gateway',
          position: 'top',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'api-gateway', name: 'API Gateway', techStack: ['Rate Limiting', 'Auth'] },
            { id: 'webhooks', name: 'Webhooks', techStack: ['Event Delivery'] },
          ],
        },
        {
          id: 'services',
          name: 'Payment Services',
          position: 'middle',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'payments', name: 'Payments Core', techStack: ['Ruby', 'PostgreSQL'] },
            { id: 'radar', name: 'Radar (Fraud)', techStack: ['ML', 'Python'] },
            { id: 'billing', name: 'Billing', techStack: ['Ruby', 'Subscriptions'] },
            { id: 'connect', name: 'Connect', techStack: ['Marketplaces'] },
          ],
        },
        {
          id: 'network',
          name: 'Payment Network',
          position: 'bottom',
          color: 'bg-purple-100 border-purple-300',
          items: [
            { id: 'visa', name: 'Visa/MC', techStack: ['Card Networks'] },
            { id: 'banks', name: 'Banks', techStack: ['ACH', 'SEPA'] },
            { id: 'wallets', name: 'Wallets', techStack: ['Apple Pay', 'Google Pay'] },
          ],
        },
      ],
      connections: [
        { from: 'clients', to: 'api', type: 'api-call', label: 'HTTPS' },
        { from: 'api', to: 'services', type: 'api-call' },
        { from: 'services', to: 'network', type: 'data-flow', label: 'Secure' },
      ],
    },
    mermaidDiagram: `graph TB
    subgraph "Client Integration"
        JS[Stripe.js]
        ELEM[Stripe Elements]
        SDK[Server SDKs]
        MOBILE[Mobile SDKs]
    end

    subgraph "API Layer"
        GW[API Gateway]
        AUTH[Authentication]
        RATE[Rate Limiting]
        WEBHOOK[Webhooks]
    end

    subgraph "Core Services"
        PAY[Payments API]
        BILLING[Billing/Subscriptions]
        CONNECT[Connect Platform]
        RADAR[Radar Fraud Detection]
        ISSUING[Issuing]
        TERMINAL[Terminal]
    end

    subgraph "Processing"
        ROUTE[Payment Router]
        RETRY[Retry Logic]
        IDEMPOTENT[Idempotency]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL)]
        REDIS[Redis]
        KAFKA{{Kafka}}
        ES[Elasticsearch]
    end

    subgraph "External Networks"
        VISA[Visa/Mastercard]
        BANKS[Banking Partners]
        WALLETS[Digital Wallets]
    end

    JS --> GW
    ELEM --> GW
    SDK --> GW
    MOBILE --> GW

    GW --> AUTH
    AUTH --> PAY
    AUTH --> BILLING
    AUTH --> CONNECT
    AUTH --> ISSUING

    PAY --> RADAR
    PAY --> ROUTE
    ROUTE --> RETRY
    RETRY --> IDEMPOTENT

    PAY --> PG
    PAY --> REDIS
    PAY --> KAFKA

    ROUTE --> VISA
    ROUTE --> BANKS
    ROUTE --> WALLETS`,
    components: [
      {
        name: 'Radar Fraud Detection',
        description: 'Machine learning-based fraud detection analyzing billions of data points',
        responsibilities: ['Fraud scoring', 'Risk assessment', 'Rule engine', 'Adaptive learning'],
        technologies: ['Python', 'PyTorch', 'Real-time ML'],
      },
      {
        name: 'Payment Router',
        description: 'Intelligent routing to optimize authorization rates across networks',
        responsibilities: ['Network selection', 'Retry logic', 'Fallback handling', 'Cost optimization'],
        technologies: ['Ruby', 'Go', 'Redis'],
      },
      {
        name: 'Idempotency Layer',
        description: 'Ensures exactly-once payment processing semantics',
        responsibilities: ['Request deduplication', 'State management', 'Replay protection'],
        technologies: ['PostgreSQL', 'Redis', 'Distributed locks'],
      },
    ],
  },

  highlights: [
    {
      title: 'Developer-First API',
      description: 'Industry-leading API design with excellent documentation',
      impact: 'Powers millions of businesses worldwide',
      technologies: ['REST API', 'OpenAPI', 'SDKs'],
      icon: 'Code',
    },
    {
      title: 'Radar ML Fraud',
      description: 'ML-powered fraud detection with 99.9% accuracy',
      impact: 'Blocks $25B+ in fraud annually',
      technologies: ['PyTorch', 'Real-time ML', 'Rule Engine'],
      icon: 'Shield',
    },
    {
      title: 'Ruby at Scale',
      description: 'Proves Ruby can handle massive financial workloads',
      impact: 'Processes $1T+ in payments annually',
      technologies: ['Ruby', 'Rails', 'Sorbet'],
      icon: 'Gem',
    },
    {
      title: 'Global Expansion',
      description: 'Payment infrastructure across 46+ countries',
      impact: 'Supports 135+ currencies and local payment methods',
      technologies: ['Multi-region', 'Localization'],
      icon: 'Globe',
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Payment Volume', value: '$1T+/year', trend: 'up' },
      { label: 'Businesses', value: '100M+', trend: 'up' },
      { label: 'Countries', value: '46+', trend: 'up' },
      { label: 'Uptime', value: '99.999%', trend: 'stable' },
    ],
    innovationAreas: [
      {
        name: 'Adaptive Acceptance',
        description: 'ML-powered payment routing to maximize authorization rates',
        technologies: ['ML', 'Multi-network routing', 'Real-time optimization'],
        yearStarted: 2018,
      },
      {
        name: 'Financial Infrastructure',
        description: 'Building the economic infrastructure of the internet',
        technologies: ['Treasury', 'Issuing', 'Capital'],
        yearStarted: 2020,
      },
      {
        name: 'Stripe CLI & Local Dev',
        description: 'Best-in-class developer tools for testing and debugging',
        technologies: ['CLI', 'Webhooks', 'Testing'],
        yearStarted: 2019,
      },
    ],
    openSource: [
      {
        name: 'Sorbet',
        description: 'Fast, powerful type checker for Ruby',
        url: 'https://github.com/sorbet/sorbet',
        stars: 3500,
        language: 'C++',
      },
      {
        name: 'stripe-ruby',
        description: 'Official Ruby library for the Stripe API',
        url: 'https://github.com/stripe/stripe-ruby',
        stars: 1900,
        language: 'Ruby',
      },
      {
        name: 'stripe-node',
        description: 'Node.js library for the Stripe API',
        url: 'https://github.com/stripe/stripe-node',
        stars: 3500,
        language: 'TypeScript',
      },
      {
        name: 'Veneur',
        description: 'Distributed, fault-tolerant pipeline for metrics',
        url: 'https://github.com/stripe/veneur',
        stars: 1700,
        language: 'Go',
      },
    ],
    blogPosts: [
      {
        title: 'Stripe Engineering Blog',
        url: 'https://stripe.com/blog/engineering',
        date: '2024-01-01',
        topic: 'Engineering',
      },
    ],
    engineeringBlog: 'https://stripe.com/blog/engineering',
  },

  // Phase 2: Detailed Architecture Diagrams
  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Clients["Developer Integration"]
        direction LR
        SDK["Client SDKs<br/>JS, iOS, Android"]
        API["REST API<br/>stripe.com/api"]
        DASH["Dashboard<br/>React SPA"]
        CLI["Stripe CLI<br/>Local testing"]
    end

    subgraph Edge["Edge Layer"]
        direction TB
        LB["Load Balancer<br/>HAProxy"]
        RATE["Rate Limiting<br/>Per-API-key limits"]
        AUTH["API Authentication<br/>Bearer tokens"]
    end

    subgraph Gateway["API Gateway - Ruby"]
        direction TB
        ROUTER["Request Router<br/>Sinatra"]
        IDEMPOTENCY["Idempotency Layer<br/>Request deduplication"]
        VERSIONING["API Versioning<br/>Stripe-Version header"]
    end

    subgraph Core["Core Services"]
        direction TB
        subgraph Payments["Payment Processing"]
            CHARGE["Charges Service<br/>Payment creation"]
            AUTH_SVC["Authorization<br/>Card validation"]
            CAPTURE["Capture Service<br/>Settlement"]
        end
        subgraph Platform["Platform Services"]
            CONNECT["Connect<br/>Marketplace payments"]
            BILLING["Billing<br/>Subscriptions"]
            RADAR["Radar<br/>Fraud detection ML"]
        end
        subgraph Identity["Identity Services"]
            CUSTOMER["Customer Service<br/>User management"]
            ACCOUNT["Account Service<br/>Merchant accounts"]
        end
    end

    subgraph External["External Networks"]
        direction LR
        VISA["Visa<br/>ISO 8583"]
        MC["Mastercard<br/>ISO 8583"]
        AMEX["Amex<br/>Direct integration"]
        BANKS["Issuing Banks<br/>ACH, Wire"]
    end

    subgraph Data["Data Layer"]
        direction LR
        PG[("PostgreSQL<br/>Primary data store")]
        REDIS["Redis<br/>Caching and queues"]
        MONGO[("MongoDB<br/>Logs and analytics")]
        KAFKA[/"Kafka<br/>Event streaming"/]
    end

    Clients --> Edge
    Edge --> Gateway
    Gateway --> Core
    Core --> External
    Core --> Data`,

    dataFlow: `sequenceDiagram
    participant Merchant as Merchant App
    participant SDK as Stripe.js
    participant API as Stripe API
    participant Radar as Radar ML
    participant Vault as Card Vault
    participant Network as Card Network
    participant Bank as Issuing Bank
    participant Webhook as Webhook Service

    Merchant->>SDK: 1. Create PaymentIntent
    SDK->>API: 2. POST /v1/payment_intents
    API->>API: 3. Idempotency check

    API->>Radar: 4. Fraud risk assessment
    Radar->>Radar: 5. ML model scoring
    Radar-->>API: 6. Risk score and rules

    alt High Risk
        API-->>Merchant: 6a. Requires 3DS
        Merchant->>SDK: 6b. Handle authentication
    end

    API->>Vault: 7. Tokenize card data
    Vault-->>API: 8. Payment token

    API->>Network: 9. Authorization request
    Network->>Bank: 10. Validate and authorize
    Bank-->>Network: 11. Auth response
    Network-->>API: 12. Approval code

    API->>API: 13. Record transaction
    API->>Webhook: 14. Queue webhook event

    API-->>SDK: 15. PaymentIntent confirmed
    SDK-->>Merchant: 16. Success callback

    Note over Webhook,Merchant: Async webhook delivery
    Webhook->>Merchant: 17. payment_intent.succeeded
    Merchant-->>Webhook: 18. 200 OK`,

    deployment: `flowchart TB
    subgraph AWS["AWS Infrastructure"]
        direction TB
        subgraph Region1["US-East Primary"]
            subgraph VPC1["Production VPC"]
                ALB1["Application LB"]
                subgraph ECS1["ECS Cluster"]
                    API1["API Containers<br/>Ruby"]
                    WORKER1["Worker Containers<br/>Background jobs"]
                end
                RDS1[("RDS PostgreSQL<br/>Multi-AZ")]
                REDIS1["ElastiCache<br/>Redis cluster"]
            end
        end

        subgraph Region2["US-West DR"]
            subgraph VPC2["DR VPC"]
                ALB2["Standby LB"]
                ECS2["ECS Cluster<br/>Warm standby"]
                RDS2[("RDS Read Replica")]
            end
        end
    end

    subgraph PCI["PCI DSS Environment"]
        direction TB
        VAULT_ENV["Card Vault<br/>HSM-backed encryption"]
        TOKENIZER["Tokenization Service"]
        COMPLIANCE["Audit Logging"]
    end

    subgraph CI_CD["Deployment Pipeline"]
        direction LR
        GIT["GitHub<br/>Monorepo"]
        CI["CI Pipeline<br/>Extensive tests"]
        DEPLOY["Deploy<br/>Canary rollout"]
        MONITOR["Monitoring<br/>PagerDuty alerts"]
    end

    Users["Merchants and Users"] --> AWS
    Region1 <-->|Cross-region replication| Region2
    API1 --> PCI
    CI_CD --> AWS`,

    serviceInteraction: `flowchart LR
    subgraph API_Layer["API Layer - Ruby"]
        API["API Service<br/>Sinatra + Sorbet"]
        WEBHOOK_API["Webhook API"]
    end

    subgraph Services["Core Services"]
        direction TB
        PAYMENTS["Payments<br/>Charge processing"]
        SUBSCRIPTIONS["Subscriptions<br/>Recurring billing"]
        CONNECT_SVC["Connect<br/>Platform payments"]
        RADAR_SVC["Radar<br/>Fraud ML"]
    end

    subgraph Workers["Background Workers"]
        SIDEKIQ["Sidekiq<br/>Job processing"]
        WEBHOOKS["Webhook Delivery<br/>Retry logic"]
        REPORTS["Report Generation"]
    end

    subgraph Data_Stores["Data Stores"]
        POSTGRES[("PostgreSQL<br/>ACID transactions")]
        REDIS_CACHE["Redis<br/>Cache and queues"]
        KAFKA_BUS[/"Kafka<br/>Event bus"/]
    end

    subgraph External_Int["External Integrations"]
        CARDS["Card Networks<br/>Visa, MC, Amex"]
        BANKS_INT["Banking Rails<br/>ACH, SEPA"]
        PARTNERS["Partner APIs"]
    end

    subgraph Observability_Stack["Observability"]
        VENEUR["Veneur<br/>Metrics pipeline"]
        LOGGING["Structured Logging"]
        TRACING["Distributed Tracing"]
    end

    API_Layer --> Services
    Services --> Workers
    Workers --> Data_Stores
    Services --> External_Int
    Services -.-> Observability_Stack

    classDef api fill:#e8eaf6,stroke:#3f51b5
    classDef service fill:#e3f2fd,stroke:#1976d2
    classDef data fill:#e8f5e9,stroke:#388e3c

    class API,WEBHOOK_API api
    class PAYMENTS,SUBSCRIPTIONS,CONNECT_SVC,RADAR_SVC service
    class POSTGRES,REDIS_CACHE,KAFKA_BUS data`,
  },

  // Phase 2: Design Patterns Used
  patterns: [
    {
      patternSlug: 'api-versioning',
      patternName: 'Explicit API Versioning',
      usage: 'Every API request can specify version via Stripe-Version header',
      implementation: 'API version is a first-class concept. Old versions supported indefinitely. Automatic upgrades with changelog.',
      scale: '100+ API versions maintained simultaneously',
    },
    {
      patternSlug: 'idempotency',
      patternName: 'Idempotent Requests',
      usage: 'All mutating API calls support idempotency keys',
      implementation: 'Idempotency-Key header allows safe retries. Results cached for 24 hours. Critical for payment reliability.',
      scale: 'Billions of idempotent requests processed',
    },
    {
      patternSlug: 'event-driven',
      patternName: 'Webhook Events',
      usage: 'All state changes emit events that can trigger webhooks',
      implementation: 'Reliable delivery with exponential backoff. Event replay available. Webhook signing for security.',
      scale: 'Billions of webhook deliveries per month',
    },
    {
      patternSlug: 'type-safety',
      patternName: 'Gradual Typing with Sorbet',
      usage: 'Static type checking for Ruby codebase',
      implementation: 'Built Sorbet type checker. Gradual adoption - typed and untyped code coexist. IDE integration.',
      scale: 'Millions of lines of typed Ruby code',
    },
    {
      patternSlug: 'pci-compliance',
      patternName: 'PCI DSS Level 1 Architecture',
      usage: 'Card data isolation and encryption',
      implementation: 'Separate network segment for card data. HSM for key management. Tokenization at edge.',
      scale: 'PCI Level 1 - highest certification level',
    },
    {
      patternSlug: 'fraud-detection',
      patternName: 'ML-Based Fraud Detection',
      usage: 'Radar evaluates every transaction in real-time',
      implementation: 'Ensemble of ML models. Network-wide learning from all Stripe transactions. Customizable rules.',
      scale: 'Prevents billions in fraud annually',
    },
  ],

  // Phase 2: Technical Decisions (ADR-style)
  technicalDecisions: [
    {
      title: 'Ruby Monolith over Microservices',
      context: 'Needed to move fast while maintaining correctness for financial transactions',
      decision: 'Maintained Ruby monolith with strong typing via Sorbet instead of breaking into microservices',
      consequences: [
        'Faster iteration - all code in one place',
        'Easier refactoring with type safety',
        'Single deployment unit simplifies releases',
        'Careful attention to modularity within monolith',
      ],
      alternatives: ['Microservices', 'Service mesh', 'Modular monolith'],
      sources: ['https://stripe.com/blog/sorbet-stripes-type-checker-for-ruby'],
    },
    {
      title: 'Building Sorbet Type Checker',
      context: 'Ruby lacks static types, making large codebase maintenance difficult',
      decision: 'Built custom type checker for Ruby that supports gradual typing',
      consequences: [
        'Catch bugs at compile time instead of runtime',
        '10x faster than interpreted type checking',
        'IDE autocomplete and navigation',
        'Significant engineering investment to build and maintain',
      ],
      alternatives: ['TypeScript rewrite', 'Python with mypy', 'Stay with untyped Ruby'],
      sources: ['https://sorbet.org/'],
    },
    {
      title: 'PostgreSQL as Primary Database',
      context: 'Financial data requires ACID guarantees and strong consistency',
      decision: 'PostgreSQL for all transactional data with careful schema design',
      consequences: [
        'Strong consistency for financial operations',
        'Excellent tooling and operational knowledge',
        'Vertical scaling limits require careful optimization',
        'Read replicas for scaling reads',
      ],
      alternatives: ['MySQL', 'Distributed SQL', 'NoSQL with compensation'],
      sources: ['https://stripe.com/blog/online-migrations'],
    },
    {
      title: 'API-First Design',
      context: 'Developers are primary users - API experience is the product',
      decision: 'Invest heavily in API design, documentation, and developer experience',
      consequences: [
        'Industry-leading API documentation',
        'Strong backward compatibility commitment',
        'Higher initial design investment',
        'Enabled ecosystem of integrations and tools',
      ],
      alternatives: ['SDK-first', 'Dashboard-first', 'Partner integrations only'],
      sources: ['https://stripe.com/docs/api'],
    },
  ],

  lastUpdated: '2024-12-01',
  sources: [
    'https://stripe.com/blog/engineering',
    'https://github.com/stripe',
    'https://stripe.com/docs',
  ],
};
