import { Company } from '../types';

export const amazon: Company = {
  slug: 'amazon',
  name: 'Amazon',
  logo: '/tech-stacks/logos/amazon.svg',
  description: 'Service-oriented platform powering global e-commerce and cloud services',
  category: 'e-commerce',
  tags: ['e-commerce', 'aws', 'microservices', 'java', 'distributed-systems', 'cloud'],

  info: {
    founded: 1994,
    headquarters: 'Seattle, WA',
    employees: '1,500,000+',
    revenue: '$574B',
    publiclyTraded: true,
    ticker: 'AMZN',
    website: 'https://amazon.com',
  },

  metrics: {
    users: '300M+ customers',
    requestsPerSecond: '100M+',
    uptime: '99.99%',
    latency: '<100ms',
    customMetrics: [
      { label: 'Prime Members', value: '200M+' },
      { label: 'Products', value: '350M+' },
      { label: 'AWS Regions', value: '33' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
      { name: 'Node.js', category: 'framework', usage: 'primary' },
    ],
    backend: [
      { name: 'Java', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'C++', category: 'language', usage: 'primary' },
      { name: 'Python', category: 'language', usage: 'primary' },
      { name: 'Go', category: 'language', usage: 'secondary' },
      { name: 'Rust', category: 'language', usage: 'secondary' },
    ],
    databases: [
      { name: 'DynamoDB', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'Aurora', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'ElastiCache', category: 'cache', usage: 'primary' },
      { name: 'Elasticsearch', category: 'search', usage: 'primary' },
      { name: 'Neptune', category: 'database', usage: 'secondary' },
    ],
    infrastructure: [
      { name: 'AWS', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'EC2', category: 'container', usage: 'primary' },
      { name: 'Lambda', category: 'container', usage: 'primary' },
      { name: 'CloudFront', category: 'cdn', usage: 'primary' },
      { name: 'ECS/EKS', category: 'orchestration', usage: 'primary' },
    ],
    devOps: [
      { name: 'CodePipeline', category: 'ci-cd', usage: 'primary' },
      { name: 'CodeDeploy', category: 'ci-cd', usage: 'primary' },
      { name: 'CloudWatch', category: 'monitoring', usage: 'primary', isPrimary: true },
      { name: 'X-Ray', category: 'monitoring', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Kinesis', category: 'queue', usage: 'primary', isPrimary: true },
      { name: 'EMR', category: 'analytics', usage: 'primary' },
      { name: 'Redshift', category: 'analytics', usage: 'primary' },
      { name: 'SQS', category: 'queue', usage: 'primary' },
      { name: 'SNS', category: 'queue', usage: 'primary' },
    ],
    ml: [
      { name: 'SageMaker', category: 'ml-framework', usage: 'primary', isPrimary: true },
      { name: 'Personalize', category: 'ml-framework', usage: 'primary' },
      { name: 'Rekognition', category: 'ml-framework', usage: 'primary' },
      { name: 'Alexa', category: 'ml-framework', usage: 'primary' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: 'Service-Oriented Platform',
    htmlDiagram: {
      title: 'Amazon E-Commerce Architecture',
      subtitle: 'Two-Pizza Teams & Service Ownership',
      layers: [
        {
          id: 'clients',
          name: 'Client Applications',
          position: 'top',
          color: 'bg-orange-100 border-orange-300',
          items: [
            { id: 'web', name: 'Amazon.com', techStack: ['React', 'Node.js'] },
            { id: 'mobile', name: 'Mobile Apps', techStack: ['Native', 'React Native'] },
            { id: 'alexa', name: 'Alexa', techStack: ['Voice AI'] },
          ],
        },
        {
          id: 'api',
          name: 'API Gateway',
          position: 'top',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'gateway', name: 'API Gateway', techStack: ['Load Balancing', 'Routing'] },
          ],
        },
        {
          id: 'services',
          name: 'Domain Services',
          position: 'middle',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'catalog', name: 'Product Catalog', techStack: ['Java', 'DynamoDB'] },
            { id: 'cart', name: 'Shopping Cart', techStack: ['Java', 'ElastiCache'] },
            { id: 'orders', name: 'Order Service', techStack: ['Java', 'Aurora'] },
            { id: 'recommendations', name: 'Recommendations', techStack: ['ML', 'Personalize'] },
          ],
        },
        {
          id: 'data',
          name: 'Data & Messaging',
          position: 'bottom',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'dynamo', name: 'DynamoDB', techStack: ['NoSQL'] },
            { id: 'aurora', name: 'Aurora', techStack: ['RDBMS'] },
            { id: 'kinesis', name: 'Kinesis', techStack: ['Streaming'] },
          ],
        },
      ],
      connections: [
        { from: 'clients', to: 'api', type: 'api-call' },
        { from: 'api', to: 'services', type: 'api-call' },
        { from: 'services', to: 'data', type: 'data-flow' },
      ],
    },
    mermaidDiagram: `graph TB
    subgraph "Customer Touchpoints"
        WEB[Amazon.com]
        MOBILE[Mobile Apps]
        ALEXA[Alexa Devices]
        PRIME[Prime Video]
    end

    subgraph "Edge Services"
        CF[CloudFront CDN]
        ALB[Application LB]
        WAF[AWS WAF]
    end

    subgraph "Core Services"
        CATALOG[Product Catalog]
        CART[Shopping Cart]
        ORDER[Order Management]
        SEARCH[Search Service]
        REC[Recommendations]
        PAY[Payment Service]
    end

    subgraph "Fulfillment"
        INV[Inventory]
        SHIP[Shipping]
        WAREHOUSE[Warehouse Mgmt]
    end

    subgraph "Data Platform"
        DYNAMO[(DynamoDB)]
        AURORA[(Aurora)]
        KINESIS{{Kinesis}}
        REDSHIFT[Redshift]
    end

    subgraph "ML Platform"
        SAGE[SageMaker]
        PERS[Personalize]
    end

    WEB --> CF
    MOBILE --> CF
    ALEXA --> CF
    CF --> ALB

    ALB --> CATALOG
    ALB --> CART
    ALB --> ORDER
    ALB --> SEARCH
    ALB --> REC

    CATALOG --> DYNAMO
    CART --> DYNAMO
    ORDER --> AURORA
    ORDER --> INV
    INV --> WAREHOUSE

    REC --> PERS
    PERS --> SAGE`,
    components: [
      {
        name: 'DynamoDB',
        description: 'Fully managed NoSQL database providing single-digit millisecond performance',
        responsibilities: ['Product catalog', 'User sessions', 'Shopping cart', 'High-throughput reads'],
        technologies: ['Proprietary', 'SSD storage', 'Multi-region'],
      },
      {
        name: 'Kinesis',
        description: 'Real-time data streaming platform',
        responsibilities: ['Clickstream analytics', 'Real-time inventory', 'Event processing'],
        technologies: ['Managed Kafka-like', 'Sharding', 'Serverless'],
      },
      {
        name: 'Two-Pizza Teams',
        description: 'Organizational structure where each service is owned by a team small enough to be fed by two pizzas',
        responsibilities: ['Full service ownership', 'DevOps culture', 'Autonomous deployment'],
        technologies: ['Microservices', 'Service mesh'],
      },
    ],
  },

  highlights: [
    {
      title: 'Two-Pizza Teams',
      description: 'Pioneered small, autonomous service teams',
      impact: 'Model for microservices organization worldwide',
      technologies: ['Microservices', 'DevOps', 'Service Ownership'],
      icon: 'Users',
    },
    {
      title: 'AWS Cloud',
      description: 'Built cloud computing from internal infrastructure',
      impact: '$80B+ annual revenue, industry leader',
      technologies: ['EC2', 'S3', 'Lambda', 'DynamoDB'],
      icon: 'Cloud',
    },
    {
      title: 'DynamoDB',
      description: 'Fully managed NoSQL at planet scale',
      impact: 'Handles 10 trillion+ requests per day',
      technologies: ['DynamoDB', 'Distributed Systems'],
      icon: 'Database',
    },
    {
      title: 'Alexa AI',
      description: 'Voice-first computing platform',
      impact: '500M+ Alexa-enabled devices',
      technologies: ['NLP', 'ASR', 'ML'],
      icon: 'Mic',
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Active Customers', value: '300M+', trend: 'up' },
      { label: 'Prime Members', value: '200M+', trend: 'up' },
      { label: 'AWS Regions', value: '33', trend: 'up' },
      { label: 'Products', value: '350M+', trend: 'up' },
    ],
    innovationAreas: [
      {
        name: 'Serverless Computing',
        description: 'Pioneered serverless with AWS Lambda',
        technologies: ['Lambda', 'Step Functions', 'EventBridge'],
        yearStarted: 2014,
      },
      {
        name: 'Voice Computing',
        description: 'Led voice-first computing with Alexa',
        technologies: ['Alexa', 'Echo', 'Skills Kit'],
        yearStarted: 2014,
      },
      {
        name: 'Autonomous Delivery',
        description: 'Drone delivery and autonomous robots',
        technologies: ['Prime Air', 'Scout', 'Computer Vision'],
        yearStarted: 2016,
      },
    ],
    openSource: [
      {
        name: 'Firecracker',
        description: 'Secure and fast microVMs for serverless',
        url: 'https://github.com/firecracker-microvm/firecracker',
        stars: 24000,
        language: 'Rust',
      },
      {
        name: 'Bottlerocket',
        description: 'Linux-based OS for running containers',
        url: 'https://github.com/bottlerocket-os/bottlerocket',
        stars: 8000,
        language: 'Rust',
      },
      {
        name: 'OpenSearch',
        description: 'Community-driven search and analytics suite',
        url: 'https://github.com/opensearch-project/OpenSearch',
        stars: 8500,
        language: 'Java',
      },
    ],
    blogPosts: [
      {
        title: 'AWS Architecture Blog',
        url: 'https://aws.amazon.com/blogs/architecture/',
        date: '2024-01-01',
        topic: 'Architecture',
      },
    ],
    engineeringBlog: 'https://aws.amazon.com/blogs/architecture/',
  },

  // Phase 2: Detailed Architecture Diagrams
  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Customers["Customer Touchpoints"]
        direction LR
        WEB["Amazon.com<br/>React SPA"]
        MOBILE["Mobile Apps<br/>iOS, Android"]
        ALEXA["Alexa<br/>Voice commerce"]
        PRIME["Prime Video<br/>Streaming"]
    end

    subgraph Edge["Global Edge"]
        direction LR
        CF["CloudFront<br/>CDN - 400+ PoPs"]
        R53["Route 53<br/>DNS routing"]
        SHIELD["Shield<br/>DDoS protection"]
    end

    subgraph Services["Service-Oriented Architecture"]
        direction TB
        subgraph Retail["Retail Platform"]
            CATALOG["Product Catalog<br/>500M+ items"]
            SEARCH["A9 Search<br/>Product discovery"]
            CART["Shopping Cart"]
            CHECKOUT["Checkout<br/>1-Click ordering"]
        end
        subgraph Fulfillment["Fulfillment"]
            INVENTORY["Inventory<br/>Real-time tracking"]
            WAREHOUSE["Warehouse Mgmt<br/>Kiva robots"]
            SHIPPING["Shipping<br/>Last mile delivery"]
        end
        subgraph Platform["Platform Services"]
            PERSONALIZE["Personalization<br/>Recommendations ML"]
            PRICING["Dynamic Pricing<br/>Real-time"]
            FRAUD["Fraud Detection"]
        end
    end

    subgraph Data["Data Infrastructure"]
        direction LR
        DYNAMO[("DynamoDB<br/>Key-value store")]
        AURORA[("Aurora<br/>MySQL compatible")]
        REDSHIFT["Redshift<br/>Data warehouse"]
        KINESIS[/"Kinesis<br/>Real-time streaming"/]
    end

    subgraph AWS_Infra["AWS Infrastructure"]
        direction LR
        EC2["EC2<br/>Compute"]
        LAMBDA["Lambda<br/>Serverless"]
        EKS["EKS<br/>Kubernetes"]
        S3[("S3<br/>Object storage")]
    end

    Customers --> Edge
    Edge --> Services
    Services --> Data
    Services --> AWS_Infra`,

    dataFlow: `sequenceDiagram
    participant User as Customer
    participant Web as Amazon.com
    participant Search as A9 Search
    participant Catalog as Product Catalog
    participant Cart as Cart Service
    participant Inventory as Inventory
    participant Payment as Payment Service
    participant Fulfillment as Fulfillment
    participant Notify as Notification

    User->>Web: 1. Search for product
    Web->>Search: 2. Query A9 search
    Search->>Search: 3. ML ranking and personalization
    Search-->>Web: 4. Ranked results

    User->>Web: 5. View product
    Web->>Catalog: 6. Get product details
    Catalog->>Inventory: 7. Check availability
    Inventory-->>Catalog: 8. Stock levels
    Catalog-->>Web: 9. Product with availability

    User->>Web: 10. Add to cart
    Web->>Cart: 11. Update cart
    Cart->>Cart: 12. Apply promotions

    User->>Web: 13. Checkout - 1-Click
    Web->>Payment: 14. Process payment
    Payment->>Payment: 15. Fraud check
    Payment-->>Web: 16. Payment confirmed

    Web->>Fulfillment: 17. Create order
    Fulfillment->>Inventory: 18. Reserve stock
    Fulfillment->>Fulfillment: 19. Assign warehouse

    Fulfillment->>Notify: 20. Order confirmation
    Notify-->>User: 21. Email and app notification

    Note over Fulfillment,User: Async delivery updates
    Fulfillment-->>User: 22. Shipping updates`,

    deployment: `flowchart TB
    subgraph Global["Global AWS Regions"]
        direction TB
        subgraph US["US Regions"]
            US_EAST["us-east-1<br/>Primary"]
            US_WEST["us-west-2<br/>Secondary"]
        end
        subgraph EU["EU Regions"]
            EU_WEST["eu-west-1<br/>Ireland"]
            EU_CENTRAL["eu-central-1<br/>Frankfurt"]
        end
        subgraph APAC["APAC Regions"]
            AP_SOUTH["ap-south-1<br/>Mumbai"]
            AP_NORTHEAST["ap-northeast-1<br/>Tokyo"]
        end
    end

    subgraph AZ["Availability Zones - per Region"]
        direction LR
        AZ1["AZ-a<br/>Isolated failure domain"]
        AZ2["AZ-b<br/>Isolated failure domain"]
        AZ3["AZ-c<br/>Isolated failure domain"]
    end

    subgraph Deployment["Deployment Strategy"]
        direction TB
        PIPELINE["CodePipeline<br/>CI/CD"]
        CANARY["Canary Deployment<br/>Gradual rollout"]
        ROLLBACK["Automatic Rollback<br/>CloudWatch alarms"]
    end

    subgraph Cell["Cell-Based Architecture"]
        CELL1["Cell 1<br/>Independent unit"]
        CELL2["Cell 2<br/>Independent unit"]
        CELLN["Cell N<br/>Blast radius limited"]
    end

    Users["300M+ Active Customers"] --> Global
    Global --> AZ
    Deployment --> Global
    Cell --> AZ`,

    serviceInteraction: `flowchart LR
    subgraph Gateway["API Gateway"]
        ALB["Application LB"]
        APIGW["API Gateway"]
    end

    subgraph Compute["Compute Layer"]
        direction TB
        EC2_SVC["EC2 Services<br/>Long-running"]
        LAMBDA_SVC["Lambda<br/>Event-driven"]
        ECS_SVC["ECS/EKS<br/>Containerized"]
    end

    subgraph Messaging["Async Communication"]
        SQS[/"SQS<br/>Message queues"/]
        SNS["SNS<br/>Pub/Sub"]
        EVENTBRIDGE["EventBridge<br/>Event bus"]
    end

    subgraph Storage["Data Services"]
        DYNAMO_SVC[("DynamoDB")]
        AURORA_SVC[("Aurora")]
        ELASTICACHE["ElastiCache<br/>Redis/Memcached"]
        S3_SVC[("S3")]
    end

    subgraph Observability["Observability"]
        CLOUDWATCH["CloudWatch<br/>Metrics and logs"]
        XRAY["X-Ray<br/>Distributed tracing"]
        CLOUDTRAIL["CloudTrail<br/>Audit logs"]
    end

    Gateway --> Compute
    Compute --> Messaging
    Compute --> Storage
    Compute -.-> Observability
    Messaging --> Compute

    classDef gateway fill:#ff9800,stroke:#e65100
    classDef compute fill:#2196f3,stroke:#1565c0
    classDef storage fill:#4caf50,stroke:#2e7d32

    class ALB,APIGW gateway
    class EC2_SVC,LAMBDA_SVC,ECS_SVC compute
    class DYNAMO_SVC,AURORA_SVC,S3_SVC storage`,
  },

  // Phase 2: Design Patterns Used
  patterns: [
    {
      patternSlug: 'soa',
      patternName: 'Service-Oriented Architecture',
      usage: 'Pioneered microservices with two-pizza teams since 2002',
      implementation: 'Each service owned by small team. APIs are the only interface. No shared databases.',
      scale: 'Thousands of services, millions of deployments per year',
    },
    {
      patternSlug: 'cell-based',
      patternName: 'Cell-Based Architecture',
      usage: 'Limit blast radius of failures to isolated cells',
      implementation: 'Each cell is independent unit with own resources. Shuffle sharding distributes customers across cells.',
      scale: 'Failures limited to single-digit percentage of customers',
    },
    {
      patternSlug: 'event-driven',
      patternName: 'Event-Driven with SQS/SNS',
      usage: 'Async communication between services',
      implementation: 'SQS for point-to-point queuing. SNS for pub/sub. EventBridge for event routing.',
      scale: 'Trillions of messages processed',
    },
    {
      patternSlug: 'dynamodb-single-table',
      patternName: 'DynamoDB Single-Table Design',
      usage: 'Denormalized data model for performance',
      implementation: 'Single table with composite keys. GSIs for access patterns. Provisioned capacity for predictability.',
      scale: 'Millions of requests per second',
    },
    {
      patternSlug: 'serverless',
      patternName: 'Serverless Architecture',
      usage: 'Lambda for event-driven workloads',
      implementation: 'Event sources trigger Lambda. Auto-scaling. Pay per invocation.',
      scale: 'Millions of Lambda invocations per second',
    },
  ],

  // Phase 2: Technical Decisions (ADR-style)
  technicalDecisions: [
    {
      title: 'Two-Pizza Teams and Service Ownership',
      context: 'Large monolithic teams were slow and created coordination overhead',
      decision: 'Reorganized into small autonomous teams that own their services end-to-end',
      consequences: [
        'Teams can deploy independently',
        'Clear ownership and accountability',
        'Some duplication of effort across teams',
        'Became the template for microservices industry-wide',
      ],
      alternatives: ['Larger teams with specialists', 'Shared service teams', 'Feature teams'],
      sources: ['https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/organization.html'],
    },
    {
      title: 'Building DynamoDB over Traditional RDBMS',
      context: 'Relational databases could not scale for Amazon shopping cart requirements',
      decision: 'Built Dynamo - eventually consistent key-value store, later productized as DynamoDB',
      consequences: [
        'Infinite horizontal scaling',
        'Single-digit millisecond latency at any scale',
        'Requires careful data modeling - no joins',
        'Became foundational AWS service',
      ],
      alternatives: ['Sharded MySQL', 'Cassandra', 'Custom solution'],
      sources: ['https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf'],
    },
    {
      title: 'Shipping AWS as External Service',
      context: 'Internal infrastructure was valuable but expensive to maintain just for Amazon',
      decision: 'Productize internal infrastructure and sell to external customers as AWS',
      consequences: [
        'Created massive new revenue stream',
        'Economies of scale reduced costs',
        'Pressure to innovate from external customers',
        'Changed the entire industry',
      ],
      alternatives: ['Keep internal only', 'License technology', 'Consulting model'],
      sources: ['https://aws.amazon.com/blogs/'],
    },
  ],

  lastUpdated: '2024-12-01',
  sources: [
    'https://aws.amazon.com/blogs/',
    'https://github.com/aws',
    'https://ir.aboutamazon.com',
  ],
};
