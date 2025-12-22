import { Company } from '../types';

export const uber: Company = {
  slug: 'uber',
  name: 'Uber',
  logo: '/tech-stacks/logos/uber.svg',
  description: 'Geographic service architecture powering global ride-sharing and delivery',
  category: 'transportation',
  tags: ['ride-sharing', 'microservices', 'go', 'java', 'python', 'kafka', 'real-time', 'geospatial'],

  info: {
    founded: 2009,
    headquarters: 'San Francisco, CA',
    employees: '32,000+',
    revenue: '$31.8B',
    publiclyTraded: true,
    ticker: 'UBER',
    website: 'https://uber.com',
  },

  metrics: {
    users: '118M+ monthly active users',
    requestsPerSecond: '1M+',
    uptime: '99.99%',
    latency: '<100ms',
    regionsServed: 70,
    customMetrics: [
      { label: 'Trips Completed', value: '10B+ lifetime' },
      { label: 'Countries', value: '70+' },
      { label: 'Cities', value: '10,000+' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
      { name: 'Node.js', category: 'framework', usage: 'primary' },
      { name: 'Fusion.js', category: 'framework', usage: 'primary' },
    ],
    backend: [
      { name: 'Go', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Java', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Python', category: 'language', usage: 'secondary' },
      { name: 'Node.js', category: 'framework', usage: 'secondary' },
      { name: 'gRPC', category: 'framework', usage: 'primary' },
    ],
    databases: [
      { name: 'MySQL', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'PostgreSQL', category: 'database', usage: 'primary' },
      { name: 'Cassandra', category: 'database', usage: 'primary' },
      { name: 'Redis', category: 'cache', usage: 'primary', isPrimary: true },
      { name: 'Elasticsearch', category: 'search', usage: 'primary' },
      { name: 'H3', category: 'database', usage: 'primary', description: 'Geospatial indexing' },
    ],
    infrastructure: [
      { name: 'AWS', category: 'container', usage: 'primary' },
      { name: 'Google Cloud', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary', isPrimary: true },
      { name: 'Docker', category: 'container', usage: 'primary' },
    ],
    devOps: [
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary', isPrimary: true },
      { name: 'Docker', category: 'container', usage: 'primary' },
      { name: 'Peloton', category: 'orchestration', usage: 'primary', description: 'Uber\'s resource scheduler' },
      { name: 'Jaeger', category: 'monitoring', usage: 'primary', isPrimary: true },
      { name: 'M3', category: 'monitoring', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Apache Kafka', category: 'queue', usage: 'primary', isPrimary: true },
      { name: 'Apache Spark', category: 'analytics', usage: 'primary' },
      { name: 'Apache Flink', category: 'analytics', usage: 'primary' },
      { name: 'Presto', category: 'analytics', usage: 'primary' },
      { name: 'Apache Hudi', category: 'storage', usage: 'primary', isPrimary: true },
    ],
    ml: [
      { name: 'Michelangelo', category: 'ml-framework', usage: 'primary', isPrimary: true, description: 'Uber\'s ML platform' },
      { name: 'PyTorch', category: 'ml-framework', usage: 'primary' },
      { name: 'TensorFlow', category: 'ml-framework', usage: 'secondary' },
    ],
    mobile: [
      { name: 'Swift', category: 'language', usage: 'primary' },
      { name: 'Kotlin', category: 'language', usage: 'primary' },
      { name: 'RIBs', category: 'framework', usage: 'primary', description: 'Uber\'s mobile architecture' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: 'Geographic Service Architecture',
    htmlDiagram: {
      title: 'Uber Platform Architecture',
      subtitle: 'Real-time Ride Matching & Dispatch',
      layers: [
        {
          id: 'clients',
          name: 'Mobile Clients',
          position: 'top',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'rider-app', name: 'Rider App', techStack: ['Swift', 'Kotlin', 'RIBs'] },
            { id: 'driver-app', name: 'Driver App', techStack: ['Swift', 'Kotlin', 'RIBs'] },
            { id: 'web', name: 'Web App', techStack: ['React', 'Fusion.js'] },
          ],
        },
        {
          id: 'gateway',
          name: 'API Gateway & Load Balancing',
          position: 'top',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'gateway', name: 'API Gateway', techStack: ['Go', 'gRPC'] },
          ],
        },
        {
          id: 'services',
          name: 'Domain Services',
          position: 'middle',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'dispatch', name: 'Dispatch Service', techStack: ['Go', 'H3'] },
            { id: 'pricing', name: 'Dynamic Pricing', techStack: ['Java', 'ML'] },
            { id: 'maps', name: 'Maps & Routing', techStack: ['Go', 'H3'] },
            { id: 'payments', name: 'Payments', techStack: ['Java'] },
          ],
        },
        {
          id: 'data',
          name: 'Data & Streaming',
          position: 'bottom',
          color: 'bg-purple-100 border-purple-300',
          items: [
            { id: 'kafka', name: 'Kafka', techStack: ['Event Streaming'] },
            { id: 'mysql', name: 'MySQL/Postgres', techStack: ['RDBMS'] },
            { id: 'redis', name: 'Redis', techStack: ['Caching'] },
          ],
        },
      ],
      connections: [
        { from: 'clients', to: 'gateway', type: 'api-call' },
        { from: 'gateway', to: 'services', type: 'api-call', label: 'gRPC' },
        { from: 'services', to: 'data', type: 'data-flow' },
      ],
    },
    mermaidDiagram: `graph TB
    subgraph "Client Apps"
        RIDER[Rider App]
        DRIVER[Driver App]
        EATS[Uber Eats App]
        WEB[Web App]
    end

    subgraph "Edge Layer"
        LB[Load Balancer]
        GW[API Gateway]
    end

    subgraph "Domain Services"
        DISPATCH[Dispatch Service]
        PRICING[Dynamic Pricing]
        MAPS[Maps & Routing]
        PAY[Payments]
        USER[User Service]
        DRIVER_SVC[Driver Service]
    end

    subgraph "Data Platform"
        KAFKA{{Kafka}}
        HUDI[Apache Hudi]
        SPARK[Spark]
        PRESTO[Presto]
    end

    subgraph "Storage"
        MYSQL[(MySQL)]
        CASS[(Cassandra)]
        REDIS[Redis Cache]
        H3[H3 Geo Index]
    end

    subgraph "ML Platform"
        MICHEL[Michelangelo]
        ETA[ETA Prediction]
        SURGE[Surge Pricing ML]
    end

    RIDER --> LB
    DRIVER --> LB
    EATS --> LB
    WEB --> LB
    LB --> GW

    GW --> DISPATCH
    GW --> PRICING
    GW --> MAPS
    GW --> PAY
    GW --> USER
    GW --> DRIVER_SVC

    DISPATCH --> KAFKA
    DISPATCH --> H3
    DISPATCH --> REDIS
    PRICING --> MICHEL
    MAPS --> H3

    KAFKA --> HUDI
    HUDI --> SPARK
    SPARK --> PRESTO

    MICHEL --> ETA
    MICHEL --> SURGE`,
    components: [
      {
        name: 'H3 Geospatial Index',
        description: 'Hexagonal hierarchical geospatial indexing system for efficient location queries',
        responsibilities: ['Location indexing', 'Geofencing', 'Proximity search', 'ETA calculation'],
        technologies: ['C', 'Go', 'Python bindings'],
      },
      {
        name: 'Michelangelo ML Platform',
        description: 'End-to-end machine learning platform for training and serving ML models',
        responsibilities: ['Model training', 'Feature store', 'Model serving', 'Experiment tracking'],
        technologies: ['Python', 'Spark', 'Kubernetes'],
      },
      {
        name: 'Dispatch System',
        description: 'Real-time matching system connecting riders with nearby drivers',
        responsibilities: ['Driver matching', 'ETA prediction', 'Route optimization', 'Surge calculation'],
        technologies: ['Go', 'H3', 'Redis', 'Kafka'],
      },
    ],
  },

  highlights: [
    {
      title: 'H3 Geospatial Index',
      description: 'Open-source hexagonal hierarchical geospatial indexing system',
      impact: 'Enables efficient real-time location matching across millions of requests',
      technologies: ['H3', 'C', 'Go'],
      icon: 'Map',
    },
    {
      title: 'Michelangelo ML',
      description: 'Unified ML platform powering 100+ production models',
      impact: 'Powers ETA prediction, surge pricing, and fraud detection',
      technologies: ['Python', 'Spark', 'Kubernetes'],
      icon: 'Brain',
    },
    {
      title: 'Jaeger Tracing',
      description: 'Open-source distributed tracing system',
      impact: 'Industry standard for microservices observability',
      technologies: ['Go', 'Jaeger', 'OpenTracing'],
      icon: 'Activity',
    },
    {
      title: 'Apache Hudi',
      description: 'Incremental data processing framework',
      impact: 'Processes petabytes of data with ACID transactions',
      technologies: ['Spark', 'Hudi', 'Presto'],
      icon: 'Database',
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Monthly Active Users', value: '118M+', trend: 'up' },
      { label: 'Trips per Day', value: '25M+', trend: 'up' },
      { label: 'Cities', value: '10,000+', trend: 'up' },
      { label: 'Microservices', value: '4,000+', trend: 'stable' },
    ],
    innovationAreas: [
      {
        name: 'Real-time Dispatch',
        description: 'Matching millions of riders and drivers in real-time with sub-second latency',
        technologies: ['Go', 'H3', 'Redis', 'Kafka'],
        yearStarted: 2012,
      },
      {
        name: 'Dynamic Pricing',
        description: 'ML-powered surge pricing balancing supply and demand',
        technologies: ['Michelangelo', 'Python', 'Spark'],
        yearStarted: 2014,
      },
      {
        name: 'Autonomous Vehicles',
        description: 'Self-driving car research and development',
        technologies: ['LiDAR', 'Computer Vision', 'PyTorch'],
        yearStarted: 2015,
      },
    ],
    openSource: [
      {
        name: 'H3',
        description: 'Hexagonal hierarchical geospatial indexing system',
        url: 'https://github.com/uber/h3',
        stars: 4500,
        language: 'C',
      },
      {
        name: 'Jaeger',
        description: 'Distributed tracing platform',
        url: 'https://github.com/jaegertracing/jaeger',
        stars: 19000,
        language: 'Go',
      },
      {
        name: 'Apache Hudi',
        description: 'Streaming data lake platform',
        url: 'https://github.com/apache/hudi',
        stars: 5000,
        language: 'Java',
      },
      {
        name: 'RIBs',
        description: 'Cross-platform mobile architecture framework',
        url: 'https://github.com/uber/RIBs',
        stars: 7500,
        language: 'Swift/Kotlin',
      },
      {
        name: 'Cadence',
        description: 'Distributed workflow orchestration engine',
        url: 'https://github.com/uber/cadence',
        stars: 7800,
        language: 'Go',
      },
    ],
    blogPosts: [
      {
        title: 'Uber Engineering Blog',
        url: 'https://www.uber.com/blog/engineering/',
        date: '2024-01-01',
        topic: 'Architecture',
      },
    ],
    engineeringBlog: 'https://www.uber.com/blog/engineering/',
  },

  // Phase 2: Detailed Architecture Diagrams
  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Clients["Mobile and Web Clients - 118M MAU"]
        direction LR
        RIDER["Rider App<br/>Swift/Kotlin + RIBs"]
        DRIVER["Driver App<br/>Swift/Kotlin + RIBs"]
        EATS["Uber Eats<br/>Swift/Kotlin + RIBs"]
        WEB["Web<br/>React + Fusion.js"]
    end

    subgraph Edge["Edge Services"]
        direction TB
        LB["Load Balancer<br/>L4/L7 routing"]
        GW["API Gateway<br/>Go, gRPC-Web"]
        AUTH["Auth Service<br/>JWT, OAuth2"]
    end

    subgraph Domain["Domain Services - 4000+ Microservices"]
        direction TB
        subgraph Rides["Rides Domain"]
            DISPATCH["Dispatch<br/>Driver matching"]
            TRIP["Trip<br/>Ride lifecycle"]
            ETA["ETA<br/>Arrival predictions"]
        end
        subgraph Geo["Geospatial"]
            MAPS["Maps<br/>Routing engine"]
            H3_SVC["H3 Service<br/>Hex geo-indexing"]
            GEOFENCE["Geofencing<br/>Zone management"]
        end
        subgraph Money["Payments and Pricing"]
            PRICING["Dynamic Pricing<br/>Surge calculation"]
            PAYMENTS["Payments<br/>Multi-currency"]
            WALLET["Wallet<br/>Credits and promos"]
        end
    end

    subgraph Platform["Platform Services"]
        direction LR
        CADENCE["Cadence<br/>Workflow orchestration"]
        PELOTON["Peloton<br/>Resource scheduler"]
        RINGPOP["Ringpop<br/>Consistent hashing"]
    end

    subgraph Data["Data Infrastructure"]
        direction LR
        KAFKA[/"Kafka<br/>Trillions msgs/day"/]
        HUDI["Apache Hudi<br/>Data lake ingestion"]
        SPARK["Spark<br/>Batch processing"]
        PRESTO["Presto<br/>Interactive queries"]
    end

    subgraph Storage["Storage Layer"]
        direction LR
        MYSQL[("MySQL<br/>Vitess sharded")]
        CASS[("Cassandra<br/>Wide-column store")]
        REDIS["Redis<br/>Caching layer"]
        H3_IDX["H3 Index<br/>Geo lookups"]
    end

    subgraph ML["ML Platform - Michelangelo"]
        direction LR
        FEATURE["Feature Store<br/>Real-time features"]
        TRAIN["Training<br/>Distributed training"]
        SERVE["Serving<br/>Low-latency inference"]
    end

    subgraph Observability["Observability"]
        JAEGER["Jaeger<br/>Distributed tracing"]
        M3_MON["M3<br/>Metrics platform"]
    end

    Clients --> Edge
    Edge --> Domain
    Domain --> Platform
    Domain --> Storage
    Domain --> ML
    Domain --> Data
    Data --> ML
    Domain -.-> Observability`,

    dataFlow: `sequenceDiagram
    participant Rider as Rider App
    participant Driver as Driver App
    participant GW as API Gateway
    participant Dispatch as Dispatch
    participant H3 as H3 Geo
    participant Price as Pricing
    participant ETA as ETA ML
    participant Kafka as Kafka
    participant Redis as Redis

    Rider->>GW: 1. Request ride - pickup, destination
    GW->>GW: 2. Auth and rate limit

    par Parallel Processing
        GW->>H3: 3a. Convert coords to H3 cells
        GW->>ETA: 3b. Get ETA prediction
        GW->>Price: 3c. Calculate surge pricing
    end

    H3-->>Dispatch: 4. H3 cell index
    ETA-->>Dispatch: 5. ETA estimate
    Price-->>Dispatch: 6. Surge multiplier

    Dispatch->>Redis: 7. Query nearby drivers - H3 ring
    Redis-->>Dispatch: 8. Driver locations in cells

    Dispatch->>Dispatch: 9. Match algorithm

    Dispatch->>Kafka: 10. Publish match event

    Dispatch->>Driver: 11. Send trip request
    Driver-->>Dispatch: 12. Accept trip

    Dispatch->>Rider: 13. Driver matched
    Dispatch->>Kafka: 14. Trip started event

    Note over Kafka,ETA: Real-time ML feedback loop

    loop Every 4 seconds
        Driver->>GW: 15. Location update
        GW->>H3: 16. Update H3 cell
        H3->>Redis: 17. Update position cache
        GW->>Rider: 18. Push driver location
    end

    Driver->>GW: 19. Trip completed
    GW->>Kafka: 20. Trip completed event
    Kafka->>ETA: 21. Update training data`,

    deployment: `flowchart TB
    subgraph MultiCloud["Multi-Cloud Infrastructure"]
        direction TB
        subgraph GCP["Google Cloud (Primary)"]
            subgraph GKE["GKE Clusters"]
                RIDES_GKE["Rides Services<br/>1000s of pods"]
                EATS_GKE["Eats Services<br/>1000s of pods"]
                FREIGHT_GKE["Freight Services"]
            end
            GCP_SQL[("Cloud SQL<br/>Managed MySQL")]
            GCS["Cloud Storage<br/>Data lake"]
        end

        subgraph AWS["AWS (Secondary)"]
            subgraph EKS["EKS Clusters"]
                AWS_SERVICES["Failover Services"]
            end
            S3["S3<br/>Backup storage"]
        end
    end

    subgraph Peloton_Cluster["Peloton Resource Management"]
        PELOTON_MASTER["Peloton Master<br/>Resource allocation"]
        MESOS["Mesos Agents<br/>100K+ containers"]
    end

    subgraph DataCenter["Data Centers"]
        direction LR
        DC1["US-West<br/>Primary"]
        DC2["US-East<br/>Secondary"]
        DC3["EU<br/>Regional"]
        DC4["APAC<br/>Regional"]
    end

    subgraph CI_CD["CI/CD Pipeline"]
        BUILD["Buildkite<br/>Continuous builds"]
        DEPLOY["uDeploy<br/>Canary deployments"]
        MONITOR["Flipr<br/>Feature flags"]
    end

    Users["118M+ MAU<br/>70+ Countries"] --> DataCenter
    DataCenter --> MultiCloud
    CI_CD --> MultiCloud
    Peloton_Cluster --> MultiCloud

    DC1 <-->|Active-Active| DC2
    GCP <-->|Cross-cloud sync| AWS`,

    serviceInteraction: `flowchart LR
    subgraph Gateway["API Layer"]
        GW["API Gateway<br/>gRPC-Web, REST"]
    end

    subgraph ServiceMesh["Service Mesh"]
        direction TB
        ENVOY["Envoy Proxy<br/>Sidecar"]
        RINGPOP["Ringpop<br/>Consistent hashing"]
        TChannel["TChannel<br/>RPC framework"]
    end

    subgraph Patterns["Communication Patterns"]
        direction TB
        SYNC["Sync RPC<br/>gRPC, TChannel"]
        ASYNC["Async Events<br/>Kafka"]
        WORKFLOW["Workflows<br/>Cadence"]
    end

    subgraph Services["Domain Services"]
        direction TB
        SVC_A["Dispatch<br/>Go"]
        SVC_B["Pricing<br/>Java"]
        SVC_C["ETA<br/>Python"]
        SVC_D["Maps<br/>Go"]
    end

    subgraph Resilience["Resilience Patterns"]
        CB["Circuit Breaker<br/>Hystrix-style"]
        RETRY["Retry + Backoff<br/>Exponential"]
        HEDGE["Hedged Requests<br/>Parallel calls"]
    end

    subgraph MessageBus["Event Bus"]
        KAFKA[/"Kafka Cluster<br/>Multi-region"/]
        CHERAMI[/"Cherami<br/>Durable queues"/]
    end

    subgraph Observability["Observability Stack"]
        JAEGER["Jaeger<br/>Tracing"]
        M3["M3<br/>Metrics"]
        UMONITOR["uMonitor<br/>Alerting"]
    end

    GW --> ServiceMesh
    ServiceMesh --> Patterns
    Patterns --> Services
    Services --> Resilience
    Services --> MessageBus
    Services -.-> Observability

    classDef gateway fill:#fce4ec,stroke:#c2185b
    classDef service fill:#e3f2fd,stroke:#1565c0
    classDef event fill:#e8f5e9,stroke:#2e7d32

    class GW gateway
    class SVC_A,SVC_B,SVC_C,SVC_D service
    class KAFKA,CHERAMI event`,
  },

  // Phase 2: Design Patterns Used
  patterns: [
    {
      patternSlug: 'domain-driven-design',
      patternName: 'Domain-Driven Design',
      usage: 'Services organized around business domains: Rides, Eats, Freight, Payments',
      implementation: 'Each domain has dedicated team, services, and data ownership. Cross-domain communication via APIs and events.',
      scale: '4000+ microservices across 20+ domains',
    },
    {
      patternSlug: 'saga',
      patternName: 'Saga Pattern with Cadence',
      usage: 'Long-running transactions across multiple services',
      implementation: 'Cadence workflow engine orchestrates multi-step processes like ride completion, payment processing',
      scale: 'Millions of concurrent workflows',
    },
    {
      patternSlug: 'event-sourcing',
      patternName: 'Event-Driven Architecture',
      usage: 'Kafka as the backbone for all async communication',
      implementation: 'Domain events published to Kafka, consumed by downstream services. Event replay for data recovery.',
      scale: 'Trillions of messages per day',
    },
    {
      patternSlug: 'cqrs',
      patternName: 'CQRS with Apache Hudi',
      usage: 'Separate read/write paths for analytics',
      implementation: 'Write path to MySQL, change data capture to Kafka, materialized views in Hudi for analytics',
      scale: 'Petabytes of data processed daily',
    },
    {
      patternSlug: 'consistent-hashing',
      patternName: 'Consistent Hashing with Ringpop',
      usage: 'Distributing work across stateful services',
      implementation: 'Ringpop library provides consistent hashing ring for services like dispatch matching',
      scale: 'Millions of drivers distributed across hash ring',
    },
    {
      patternSlug: 'geospatial-indexing',
      patternName: 'Hierarchical Geospatial Indexing',
      usage: 'H3 hexagonal grid for efficient location queries',
      implementation: 'All locations indexed to H3 cells. Ring queries for nearby entity lookup.',
      scale: 'Real-time matching across 10,000+ cities',
    },
  ],

  // Phase 2: Technical Decisions (ADR-style)
  technicalDecisions: [
    {
      title: 'H3 Hexagonal Indexing over Geohash',
      context: 'Needed efficient geospatial queries for driver-rider matching with uniform area coverage',
      decision: 'Built H3, a hexagonal hierarchical spatial index, instead of using rectangular geohash',
      consequences: [
        'Uniform cell areas eliminate distance distortion at edges',
        'Hierarchical resolution enables efficient ring searches',
        'Had to build custom tooling and educate engineers',
        'Open-sourced and now industry standard',
      ],
      alternatives: ['Geohash', 'S2 Geometry', 'QuadTree'],
      sources: ['https://www.uber.com/blog/h3/'],
    },
    {
      title: 'Go over Java for Core Platform Services',
      context: 'Java services had high memory footprint and GC pauses affecting latency',
      decision: 'Migrated core platform services from Java to Go for better performance',
      consequences: [
        '10x reduction in memory usage',
        'Consistent sub-100ms latency (no GC pauses)',
        'Required retraining engineers on Go',
        'Lost some Java ecosystem benefits',
      ],
      alternatives: ['Optimize JVM', 'Rust', 'C++'],
      sources: ['https://www.uber.com/blog/tech-stack-part-one-foundation/'],
    },
    {
      title: 'Building Cadence for Workflow Orchestration',
      context: 'Complex multi-service transactions needed reliable orchestration beyond message queues',
      decision: 'Built Cadence, a durable workflow execution engine for long-running business processes',
      consequences: [
        'Durable execution survives process crashes',
        'Simplified complex orchestration logic',
        'New programming model for engineers to learn',
        'Now powers millions of workflows (open-sourced as Temporal)',
      ],
      alternatives: ['AWS Step Functions', 'Airflow', 'Custom state machines'],
      sources: ['https://www.uber.com/blog/cadence/'],
    },
    {
      title: 'Apache Hudi for Data Lake Ingestion',
      context: 'Raw data lake on HDFS/S3 lacked ACID transactions and efficient upserts',
      decision: 'Built Hudi for incremental data processing with ACID transactions on data lakes',
      consequences: [
        'Near-real-time data availability (10-minute latency)',
        'ACID transactions on data lake',
        'Efficient upserts instead of full rewrites',
        'Open-sourced and donated to Apache',
      ],
      alternatives: ['Delta Lake', 'Apache Iceberg', 'Full rewrites'],
      sources: ['https://www.uber.com/blog/apache-hudi/'],
    },
  ],

  lastUpdated: '2024-12-01',
  sources: [
    'https://www.uber.com/blog/engineering/',
    'https://github.com/uber',
    'https://investor.uber.com',
    'https://eng.uber.com',
  ],
};
