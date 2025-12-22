import { Company } from '../types';

export const netflix: Company = {
  slug: 'netflix',
  name: 'Netflix',
  logo: '/tech-stacks/logos/netflix.svg',
  description: 'Global streaming platform with chaos engineering and microservices architecture',
  category: 'streaming',
  tags: ['streaming', 'microservices', 'chaos-engineering', 'aws', 'java', 'react', 'cassandra', 'kafka'],

  info: {
    founded: 1997,
    headquarters: 'Los Gatos, CA',
    employees: '12,000+',
    revenue: '$31.6B',
    publiclyTraded: true,
    ticker: 'NFLX',
    website: 'https://netflix.com',
  },

  metrics: {
    users: '230M+ subscribers',
    requestsPerDay: '1B+ API calls/day',
    uptime: '99.99%',
    latency: '<100ms globally',
    dataProcessed: '400+ PB/day',
    regionsServed: 190,
    customMetrics: [
      { label: 'Hours Streamed Daily', value: '1B+' },
      { label: 'Content Library', value: '15,000+ titles' },
      { label: 'Microservices', value: '1,000+' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'Node.js', category: 'framework', usage: 'primary' },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
      { name: 'RxJS', category: 'library', usage: 'primary' },
    ],
    backend: [
      { name: 'Java', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Spring Boot', category: 'framework', usage: 'primary' },
      { name: 'Python', category: 'language', usage: 'secondary' },
      { name: 'gRPC', category: 'framework', usage: 'primary' },
      { name: 'GraphQL', category: 'framework', usage: 'primary' },
    ],
    databases: [
      { name: 'Cassandra', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'MySQL', category: 'database', usage: 'secondary' },
      { name: 'CockroachDB', category: 'database', usage: 'experimental' },
      { name: 'EVCache', category: 'cache', usage: 'primary' },
      { name: 'Elasticsearch', category: 'search', usage: 'primary' },
      { name: 'Redis', category: 'cache', usage: 'primary' },
    ],
    infrastructure: [
      { name: 'AWS', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'Open Connect CDN', category: 'cdn', usage: 'primary', isPrimary: true },
      { name: 'Zuul', category: 'api-gateway', usage: 'primary' },
      { name: 'S3', category: 'storage', usage: 'primary' },
      { name: 'EC2', category: 'container', usage: 'primary' },
    ],
    devOps: [
      { name: 'Spinnaker', category: 'ci-cd', usage: 'primary', isPrimary: true },
      { name: 'Docker', category: 'container', usage: 'primary' },
      { name: 'Kubernetes', category: 'orchestration', usage: 'migrating-to' },
      { name: 'Atlas', category: 'monitoring', usage: 'primary' },
      { name: 'Chaos Monkey', category: 'monitoring', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Apache Spark', category: 'analytics', usage: 'primary' },
      { name: 'Apache Kafka', category: 'queue', usage: 'primary', isPrimary: true },
      { name: 'Apache Flink', category: 'analytics', usage: 'primary' },
      { name: 'Presto', category: 'analytics', usage: 'primary' },
    ],
    ml: [
      { name: 'PyTorch', category: 'ml-framework', usage: 'primary' },
      { name: 'Metaflow', category: 'ml-framework', usage: 'primary', isPrimary: true },
      { name: 'TensorFlow', category: 'ml-framework', usage: 'secondary' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: 'Microservices with Chaos Engineering',
    htmlDiagram: {
      title: 'Netflix Microservices Architecture',
      subtitle: 'Chaos Engineering & Global CDN',
      layers: [
        {
          id: 'users',
          name: 'Global Users (230M+)',
          position: 'top',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'users', name: 'Global Users (230M+)', icon: 'Users', techStack: ['Web', 'Mobile', 'TV'] },
          ],
        },
        {
          id: 'cdn',
          name: 'CDN Layer',
          position: 'top',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'open-connect', name: 'AWS CloudFront CDN', icon: 'Globe', techStack: ['Edge Caching', 'Content Delivery'] },
          ],
        },
        {
          id: 'gateway',
          name: 'API Gateway',
          position: 'top',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'zuul', name: 'Zuul API Gateway', icon: 'Shield', techStack: ['Java', 'Netty', 'Routing'] },
          ],
        },
        {
          id: 'services',
          name: 'Microservices Layer',
          position: 'middle',
          color: 'bg-blue-50 border-blue-200',
          items: [
            { id: 'user-service', name: 'User Service', techStack: ['Java', 'Spring Boot'] },
            { id: 'content-service', name: 'Content Service', techStack: ['Java', 'gRPC'] },
            { id: 'recommendation', name: 'Recommendation', techStack: ['Python', 'ML'] },
            { id: 'billing', name: 'Billing Service', techStack: ['Java'] },
          ],
        },
        {
          id: 'data',
          name: 'Data Layer',
          position: 'bottom',
          color: 'bg-purple-100 border-purple-300',
          items: [
            { id: 'cassandra', name: 'Cassandra', techStack: ['NoSQL', 'Distributed'] },
            { id: 'mysql', name: 'MySQL', techStack: ['RDBMS'] },
            { id: 'elasticsearch', name: 'ElasticSearch', techStack: ['Search'] },
          ],
        },
        {
          id: 'chaos',
          name: 'Chaos Monkey - Continuous Resilience Testing',
          position: 'bottom',
          color: 'bg-red-100 border-red-300',
          items: [
            { id: 'chaos-monkey', name: 'Chaos Monkey - Continuous Resilience Testing', icon: 'Zap', techStack: ['Fault Injection', 'Resilience'] },
          ],
        },
      ],
      connections: [
        { from: 'users', to: 'cdn', type: 'api-call' },
        { from: 'cdn', to: 'gateway', type: 'api-call' },
        { from: 'gateway', to: 'services', type: 'api-call', label: 'REST/gRPC' },
        { from: 'services', to: 'data', type: 'data-flow', label: 'Read/Write' },
      ],
    },
    mermaidDiagram: `graph TB
    subgraph "Client Layer"
        WEB[Web App - React]
        MOBILE[Mobile Apps]
        TV[Smart TV Apps]
    end

    subgraph "CDN Layer"
        OC[Open Connect CDN]
        CF[CloudFront]
    end

    subgraph "API Gateway"
        ZUUL[Zuul Gateway]
        AUTH[Auth Service]
    end

    subgraph "Microservices"
        PLAY[Playback Service]
        REC[Recommendation Engine]
        BILL[Billing Service]
        CONTENT[Content Service]
        USER[User Service]
        SEARCH[Search Service]
    end

    subgraph "Data Layer"
        CASS[(Cassandra)]
        MYSQL[(MySQL)]
        EVC[EVCache]
        KAFKA{{Kafka}}
        ES[Elasticsearch]
    end

    subgraph "ML Platform"
        META[Metaflow]
        SPARK[Spark]
    end

    WEB --> OC
    MOBILE --> OC
    TV --> OC
    OC --> ZUUL
    CF --> ZUUL

    ZUUL --> AUTH
    ZUUL --> PLAY
    ZUUL --> REC
    ZUUL --> BILL
    ZUUL --> CONTENT
    ZUUL --> USER
    ZUUL --> SEARCH

    PLAY --> CASS
    PLAY --> EVC
    REC --> CASS
    REC --> KAFKA
    REC --> META
    BILL --> MYSQL
    CONTENT --> ES
    USER --> CASS
    SEARCH --> ES
    META --> SPARK`,
    components: [
      {
        name: 'Open Connect CDN',
        description: 'Netflix\'s custom CDN deployed within ISP networks worldwide',
        responsibilities: ['Content delivery', 'Edge caching', 'Bandwidth optimization', 'Video streaming'],
        technologies: ['FreeBSD', 'nginx', 'Custom Hardware'],
      },
      {
        name: 'Zuul API Gateway',
        description: 'Edge service that provides dynamic routing, monitoring, and security',
        responsibilities: ['Request routing', 'Authentication', 'Rate limiting', 'Load balancing'],
        technologies: ['Java', 'Netty', 'RxJava'],
      },
      {
        name: 'Metaflow ML Platform',
        description: 'Open-source framework for building and managing ML workflows',
        responsibilities: ['ML pipeline orchestration', 'Experiment tracking', 'Model deployment'],
        technologies: ['Python', 'AWS', 'Kubernetes'],
      },
    ],
  },

  highlights: [
    {
      title: 'Chaos Monkey',
      description: 'Proactive failure testing in production',
      impact: 'Pioneered chaos engineering as an industry practice',
      technologies: ['Chaos Monkey', 'Simian Army', 'Java'],
      icon: 'Zap',
    },
    {
      title: 'Global CDN',
      description: '99.99% uptime with intelligent content placement',
      impact: 'Delivers 15% of global internet traffic',
      technologies: ['Open Connect', 'FreeBSD', 'nginx'],
      icon: 'Globe',
    },
    {
      title: 'Microservices',
      description: '15,000+ services with independent deployment',
      impact: 'Enables rapid feature deployment and scaling',
      technologies: ['Java', 'Spring Boot', 'gRPC'],
      icon: 'Layers',
    },
    {
      title: 'Machine Learning',
      description: 'Personalized recommendations for 230M+ users',
      impact: '80% of content watched comes from recommendations',
      technologies: ['PyTorch', 'Metaflow', 'Spark'],
      icon: 'Brain',
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Subscribers', value: '230M+', trend: 'up', context: 'Across 190+ countries' },
      { label: 'Microservices', value: '15,000+', trend: 'stable' },
      { label: 'Hours Watched Daily', value: '1M+', trend: 'up' },
      { label: 'Content Library', value: '15,000+ titles', trend: 'up' },
    ],
    innovationAreas: [
      {
        name: 'Chaos Engineering',
        description: 'Invented chaos engineering to test system resilience by intentionally causing failures',
        technologies: ['Chaos Monkey', 'Simian Army', 'Chaos Kong'],
        yearStarted: 2011,
      },
      {
        name: 'ML-Powered Recommendations',
        description: 'Personalized content recommendations driving 80% of viewing decisions',
        technologies: ['PyTorch', 'Metaflow', 'Spark', 'Flink'],
        yearStarted: 2006,
      },
      {
        name: 'Adaptive Streaming',
        description: 'Dynamic bitrate adjustment based on network conditions',
        technologies: ['VMAF', 'Custom Encoders', 'Per-Title Encoding'],
        yearStarted: 2015,
      },
    ],
    openSource: [
      {
        name: 'Zuul',
        description: 'Edge service gateway providing dynamic routing, monitoring, and security',
        url: 'https://github.com/Netflix/zuul',
        stars: 13000,
        language: 'Java',
      },
      {
        name: 'Eureka',
        description: 'Service discovery for resilient mid-tier load balancing',
        url: 'https://github.com/Netflix/eureka',
        stars: 12000,
        language: 'Java',
      },
      {
        name: 'Hystrix',
        description: 'Latency and fault tolerance library for distributed systems',
        url: 'https://github.com/Netflix/Hystrix',
        stars: 24000,
        language: 'Java',
      },
      {
        name: 'Metaflow',
        description: 'Human-friendly Python library for data science projects',
        url: 'https://github.com/Netflix/metaflow',
        stars: 7500,
        language: 'Python',
      },
      {
        name: 'Spinnaker',
        description: 'Multi-cloud continuous delivery platform',
        url: 'https://github.com/spinnaker/spinnaker',
        stars: 9000,
        language: 'Java',
      },
    ],
    blogPosts: [
      {
        title: 'Netflix System Design',
        url: 'https://netflixtechblog.com/tagged/system-design',
        date: '2024-01-01',
        topic: 'Architecture',
      },
      {
        title: 'Chaos Engineering at Netflix',
        url: 'https://netflixtechblog.com/tagged/chaos-engineering',
        date: '2024-01-01',
        topic: 'Reliability',
      },
    ],
    engineeringBlog: 'https://netflixtechblog.com',
  },

  // Phase 2: Detailed Architecture Diagrams
  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Clients["Client Devices - 230M+ Subscribers"]
        direction LR
        WEB["Web App<br/>React, RxJS"]
        MOBILE["Mobile<br/>iOS/Android"]
        TV["Smart TVs<br/>Native SDKs"]
        GAME["Gaming<br/>Xbox, PS5"]
    end

    subgraph Edge["Open Connect CDN - 15% of Global Internet Traffic"]
        direction LR
        OCA["Open Connect Appliances<br/>10,000+ servers in ISP networks"]
        AWS_CF["AWS CloudFront<br/>Fallback CDN"]
    end

    subgraph Gateway["API Gateway Layer"]
        direction TB
        ZUUL["Zuul 2.0<br/>Async non-blocking gateway"]
        subgraph ZuulFeatures["Gateway Features"]
            AUTH["Authentication<br/>JWT tokens"]
            RATE["Rate Limiting<br/>Concurrency-based"]
            ROUTE["Dynamic Routing<br/>Ribbon load balancing"]
        end
        ZUUL --> ZuulFeatures
    end

    subgraph Services["1000+ Microservices"]
        direction TB
        subgraph Core["Core Services"]
            PLAY["Playback API<br/>Video streaming control"]
            MEMBER["Member Service<br/>User profiles"]
            BILLING["Billing<br/>Subscription management"]
        end
        subgraph Discovery["Content Discovery"]
            REC["Recommendations<br/>ML-powered personalization"]
            SEARCH["Search<br/>Elasticsearch-based"]
            BROWSE["Browse<br/>Content catalog"]
        end
        subgraph Platform["Platform Services"]
            EUREKA["Eureka<br/>Service discovery"]
            CONFIG["Archaius<br/>Dynamic configuration"]
            HYSTRIX["Hystrix<br/>Circuit breakers"]
        end
    end

    subgraph Data["Data Layer - 500+ PB Storage"]
        direction LR
        CASS[("Cassandra<br/>500TB+ distributed storage")]
        EVC["EVCache<br/>Memcached-based caching"]
        KAFKA[/"Kafka<br/>700B+ msgs/day"/]
        ES["Elasticsearch<br/>Full-text search"]
        S3[("S3<br/>Video/Image assets")]
    end

    subgraph ML["ML and Data Platform"]
        direction LR
        META["Metaflow<br/>ML pipelines"]
        SPARK["Spark<br/>Batch processing"]
        FLINK["Flink<br/>Real-time streaming"]
    end

    subgraph Chaos["Chaos Engineering"]
        MONKEY["Chaos Monkey<br/>Random instance failures"]
        KONG["Chaos Kong<br/>Region evacuation testing"]
    end

    Clients --> Edge
    Edge --> Gateway
    Gateway --> Services
    Services --> Data
    Services --> ML
    Chaos -.->|Continuous failure injection| Services`,

    dataFlow: `sequenceDiagram
    participant User as Netflix User
    participant CDN as Open Connect CDN
    participant Zuul as Zuul Gateway
    participant Play as Playback Service
    participant DRM as DRM Service
    participant Rec as Recommendation
    participant Cache as EVCache
    participant Cass as Cassandra
    participant Kafka as Kafka

    User->>CDN: 1. Request video stream
    CDN->>Zuul: 2. Route to API
    Zuul->>Zuul: 3. Auth and rate limit check
    Zuul->>Play: 4. Get playback manifest

    Play->>Cache: 5. Check viewing history
    Cache-->>Play: 6. Cache hit - sub ms

    Play->>DRM: 7. Get license keys
    DRM-->>Play: 8. Widevine or FairPlay license

    Play->>Cass: 9. Log playback start
    Play->>Kafka: 10. Publish view event

    Play-->>Zuul: 11. Return manifest URLs
    Zuul-->>CDN: 12. Redirect to nearest OCA
    CDN-->>User: 13. Stream video chunks

    Note over Kafka,Rec: Async Processing
    Kafka->>Rec: 14. Process view events
    Rec->>Cass: 15. Update user profile
    Rec->>Rec: 16. Retrain models

    User->>CDN: 17. Request next episode
    CDN->>Zuul: 18. Route request
    Zuul->>Rec: 19. Get recommendations
    Rec->>Cache: 20. Fetch personalized list
    Cache-->>Rec: 21. Return cached recs
    Rec-->>User: 22. Display next episode`,

    deployment: `flowchart TB
    subgraph AWS_US["AWS US-East-1 (Primary)"]
        direction TB
        subgraph AZ1["Availability Zone 1"]
            EC2_1["EC2 Auto Scaling Group<br/>Microservices fleet"]
            CASS_1[("Cassandra Nodes<br/>Rack-aware replication")]
        end
        subgraph AZ2["Availability Zone 2"]
            EC2_2["EC2 Auto Scaling Group<br/>Microservices fleet"]
            CASS_2[("Cassandra Nodes<br/>Cross-AZ replication")]
        end
        subgraph AZ3["Availability Zone 3"]
            EC2_3["EC2 Auto Scaling Group<br/>Microservices fleet"]
            CASS_3[("Cassandra Nodes<br/>Quorum reads/writes")]
        end

        ELB["Application Load Balancer"]
        ELB --> EC2_1
        ELB --> EC2_2
        ELB --> EC2_3
    end

    subgraph AWS_EU["AWS EU-West-1 (Secondary)"]
        EU_CLUSTER["Active-Active Cluster<br/>Full service replica"]
    end

    subgraph OpenConnect["Open Connect Network"]
        direction LR
        OCA_ISP1["ISP Embedded Server<br/>Comcast, Verizon"]
        OCA_ISP2["ISP Embedded Server<br/>AT&T, Cox"]
        OCA_IXP["Internet Exchange Points<br/>Equinix, DE-CIX"]
    end

    subgraph CI_CD["CI/CD - Spinnaker"]
        direction LR
        BAKE["AMI Baking<br/>Immutable deployments"]
        CANARY["Canary Analysis<br/>Automated rollback"]
        DEPLOY["Multi-region Deploy<br/>Red/Black strategy"]
    end

    Users["230M+ Users<br/>190+ Countries"] --> OpenConnect
    OpenConnect --> AWS_US
    OpenConnect --> AWS_EU

    AWS_US <-->|Cross-region replication| AWS_EU
    CI_CD -->|Automated deployments| AWS_US
    CI_CD -->|Region-by-region rollout| AWS_EU`,

    serviceInteraction: `flowchart LR
    subgraph Gateway["API Gateway"]
        ZUUL["Zuul 2.0"]
    end

    subgraph Discovery["Service Mesh"]
        EUREKA["Eureka Registry<br/>Heartbeat: 30s"]
        RIBBON["Ribbon<br/>Client-side LB"]
    end

    subgraph CircuitBreaker["Resilience Layer"]
        HYSTRIX["Hystrix<br/>Circuit Breaker"]
        FALLBACK["Fallback Handlers<br/>Graceful degradation"]
    end

    subgraph Services["Microservices"]
        direction TB
        SVC_A["Service A<br/>gRPC"]
        SVC_B["Service B<br/>REST"]
        SVC_C["Service C<br/>GraphQL"]
    end

    subgraph Async["Event-Driven"]
        KAFKA[/"Kafka Cluster<br/>700B msgs/day"/]
        CONSUMER["Consumer Groups<br/>At-least-once delivery"]
    end

    subgraph Observability["Observability"]
        ATLAS["Atlas<br/>Time-series metrics"]
        VECTOR["Vector<br/>Log aggregation"]
        ZIPKIN["Zipkin<br/>Distributed tracing"]
    end

    ZUUL --> EUREKA
    EUREKA --> RIBBON
    RIBBON --> HYSTRIX
    HYSTRIX --> Services
    HYSTRIX --> FALLBACK

    Services --> KAFKA
    KAFKA --> CONSUMER

    Services --> Observability

    classDef gateway fill:#f9f,stroke:#333
    classDef service fill:#bbf,stroke:#333
    classDef data fill:#bfb,stroke:#333

    class ZUUL gateway
    class SVC_A,SVC_B,SVC_C service
    class KAFKA,EUREKA data`,
  },

  // Phase 2: Design Patterns Used
  patterns: [
    {
      patternSlug: 'microservices',
      patternName: 'Microservices Architecture',
      usage: 'Core architectural pattern with 1000+ independently deployable services',
      implementation: 'Each service owned by 2-pizza team, deployed independently via Spinnaker with Red/Black deployment strategy',
      scale: '1000+ services, 100+ deployments per day',
    },
    {
      patternSlug: 'circuit-breaker',
      patternName: 'Circuit Breaker',
      usage: 'Hystrix library for fault tolerance across all service calls',
      implementation: 'Automatic fallbacks to cached data or degraded responses when services fail. Configurable thresholds per service.',
      scale: 'Millions of circuit breaker evaluations per second',
    },
    {
      patternSlug: 'event-sourcing',
      patternName: 'Event-Driven Architecture',
      usage: 'Kafka as backbone for all async communication and data pipelines',
      implementation: 'Producer-consumer pattern with exactly-once semantics. Events stored for replay and audit.',
      scale: '700+ billion messages per day',
    },
    {
      patternSlug: 'cqrs',
      patternName: 'CQRS',
      usage: 'Separate read and write paths for high-traffic services',
      implementation: 'EVCache for reads, Cassandra for writes with eventual consistency. Read replicas optimized for query patterns.',
      scale: 'Sub-millisecond read latency at 99th percentile',
    },
    {
      patternSlug: 'service-mesh',
      patternName: 'Service Discovery & Load Balancing',
      usage: 'Eureka for service registry, Ribbon for client-side load balancing',
      implementation: 'Services self-register on startup, heartbeat every 30s. Ribbon handles weighted load distribution.',
      scale: '1000+ service instances, automatic failover',
    },
    {
      patternSlug: 'chaos-engineering',
      patternName: 'Chaos Engineering',
      usage: 'Continuous resilience testing in production',
      implementation: 'Chaos Monkey terminates random instances, Chaos Kong tests region failures, Latency Monkey injects delays',
      scale: 'Daily failure injection across all services',
    },
  ],

  // Phase 2: Technical Decisions (ADR-style)
  technicalDecisions: [
    {
      title: 'Why Cassandra over MySQL for User Data',
      context: 'Needed to scale user data storage to 500TB+ with low latency globally distributed across 190+ countries',
      decision: 'Chose Apache Cassandra for its horizontal scaling, tunable consistency, and multi-datacenter replication',
      consequences: [
        'Eventually consistent - designed application logic to handle it',
        'No joins - fully denormalized data model, increased storage',
        'Excellent write throughput at 1M+ writes/second',
        'Lower operational overhead than sharded MySQL',
      ],
      alternatives: ['Sharded MySQL', 'DynamoDB', 'CockroachDB'],
      sources: ['https://netflixtechblog.com/tagged/cassandra'],
    },
    {
      title: 'Building Open Connect CDN Instead of Using Third-Party',
      context: 'Third-party CDNs were too expensive at Netflix scale and didnt provide enough control over video delivery quality',
      decision: 'Built custom CDN with servers deployed directly inside ISP networks',
      consequences: [
        'Reduced bandwidth costs by 50%+',
        'Better video quality with reduced buffering',
        'Complex hardware and operations management',
        'Requires partnerships with 1000+ ISPs globally',
      ],
      alternatives: ['Akamai', 'CloudFlare', 'AWS CloudFront only'],
      sources: ['https://openconnect.netflix.com'],
    },
    {
      title: 'EVCache over Standard Redis for Session Caching',
      context: 'Needed a caching layer that could handle billions of requests with sub-millisecond latency',
      decision: 'Built EVCache, a distributed memcached-based caching solution optimized for Netflix use cases',
      consequences: [
        'Sub-millisecond latency for 99.9% of requests',
        'Automatic replication and failover',
        'Custom client with Netflix-specific optimizations',
        'Requires specialized operational expertise',
      ],
      alternatives: ['Redis Cluster', 'Aerospike', 'AWS ElastiCache'],
      sources: ['https://netflixtechblog.com/caching-for-a-global-netflix-7bcc457012f1'],
    },
    {
      title: 'Async Microservices with Kafka over Sync REST',
      context: 'Synchronous REST calls between services created cascading failures and increased latency',
      decision: 'Adopted Kafka-based async messaging for non-critical service communication',
      consequences: [
        'Decoupled services, improved fault isolation',
        'Higher throughput for data pipelines',
        'Increased complexity in debugging distributed flows',
        'Requires robust idempotency handling',
      ],
      alternatives: ['RabbitMQ', 'AWS SQS', 'gRPC streaming'],
      sources: ['https://netflixtechblog.com/kafka-inside-keystone-pipeline-dd5aeabaf6bb'],
    },
  ],

  lastUpdated: '2024-12-01',
  sources: [
    'https://netflixtechblog.com',
    'https://netflix.github.io',
    'https://ir.netflix.net',
    'https://openconnect.netflix.com',
  ],
};
