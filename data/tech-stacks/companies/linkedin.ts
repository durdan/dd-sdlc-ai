import { Company } from '../types';

export const linkedin: Company = {
  slug: 'linkedin',
  name: 'LinkedIn',
  logo: '/tech-stacks/logos/linkedin.svg',
  description: '750+ microservices architecture with 7T Kafka messages daily',
  category: 'social-media',
  tags: ['social-media', 'professional', 'java', 'kafka', 'scala', 'microservices'],

  info: {
    founded: 2002,
    headquarters: 'Sunnyvale, CA',
    employees: '20,000+',
    revenue: '$15B+',
    publiclyTraded: false,
    website: 'https://linkedin.com',
  },

  metrics: {
    users: '900M+ members',
    monthlyActiveUsers: '310M+',
    uptime: '99.99%',
    customMetrics: [
      { label: 'Kafka Messages/Day', value: '7T+' },
      { label: 'Countries', value: '200+' },
      { label: 'Microservices', value: '750+' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'Ember.js', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'React', category: 'framework', usage: 'primary' },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
      { name: 'Node.js', category: 'framework', usage: 'primary' },
    ],
    backend: [
      { name: 'Java', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Scala', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Python', category: 'language', usage: 'secondary' },
      { name: 'Play Framework', category: 'framework', usage: 'primary' },
      { name: 'Rest.li', category: 'framework', usage: 'primary' },
    ],
    databases: [
      { name: 'Espresso', category: 'database', usage: 'primary', isPrimary: true, description: 'LinkedIn\'s NoSQL' },
      { name: 'Oracle', category: 'database', usage: 'primary' },
      { name: 'MySQL', category: 'database', usage: 'secondary' },
      { name: 'Couchbase', category: 'cache', usage: 'primary' },
      { name: 'Voldemort', category: 'database', usage: 'primary' },
    ],
    infrastructure: [
      { name: 'Azure', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
      { name: 'Docker', category: 'container', usage: 'primary' },
    ],
    devOps: [
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
      { name: 'InGraphs', category: 'monitoring', usage: 'primary' },
      { name: 'Jenkins', category: 'ci-cd', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Apache Kafka', category: 'queue', usage: 'primary', isPrimary: true },
      { name: 'Apache Samza', category: 'analytics', usage: 'primary', isPrimary: true },
      { name: 'Apache Spark', category: 'analytics', usage: 'primary' },
      { name: 'Pinot', category: 'analytics', usage: 'primary' },
      { name: 'Brooklin', category: 'queue', usage: 'primary' },
    ],
    ml: [
      { name: 'PyTorch', category: 'ml-framework', usage: 'primary' },
      { name: 'TensorFlow', category: 'ml-framework', usage: 'primary' },
      { name: 'Pro-ML', category: 'ml-framework', usage: 'primary', description: 'LinkedIn ML platform' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: '750+ Microservices with Kafka',
    htmlDiagram: {
      title: 'LinkedIn Platform Architecture',
      subtitle: 'Real-Time Data Processing',
      layers: [
        {
          id: 'clients',
          name: 'Client Applications',
          position: 'top',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'web', name: 'Web (Ember.js)', techStack: ['Ember', 'TypeScript'] },
            { id: 'mobile', name: 'Mobile Apps', techStack: ['Native'] },
            { id: 'api', name: 'Public API', techStack: ['REST'] },
          ],
        },
        {
          id: 'gateway',
          name: 'API Gateway',
          position: 'top',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'restli', name: 'Rest.li Framework', techStack: ['Java', 'Scala'] },
          ],
        },
        {
          id: 'services',
          name: '750+ Microservices',
          position: 'middle',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'feed', name: 'Feed Service', techStack: ['Java'] },
            { id: 'profile', name: 'Profile Service', techStack: ['Java'] },
            { id: 'messaging', name: 'Messaging', techStack: ['Scala'] },
            { id: 'search', name: 'Search', techStack: ['Java', 'Galene'] },
          ],
        },
        {
          id: 'streaming',
          name: 'Streaming Platform',
          position: 'bottom',
          color: 'bg-orange-100 border-orange-300',
          items: [
            { id: 'kafka', name: 'Kafka (7T msgs/day)', techStack: ['Event Streaming'] },
            { id: 'samza', name: 'Samza', techStack: ['Stream Processing'] },
            { id: 'pinot', name: 'Pinot', techStack: ['OLAP'] },
          ],
        },
      ],
      connections: [
        { from: 'clients', to: 'gateway', type: 'api-call' },
        { from: 'gateway', to: 'services', type: 'api-call' },
        { from: 'services', to: 'streaming', type: 'event' },
      ],
    },
    mermaidDiagram: `graph TB
    subgraph "Clients"
        WEB[Web App]
        MOBILE[Mobile Apps]
        API[Public API]
    end

    subgraph "API Layer"
        RESTLI[Rest.li Gateway]
        GRAPHQL[GraphQL Federation]
    end

    subgraph "Microservices - 750+"
        FEED[Feed Service]
        PROFILE[Profile Service]
        MSG[Messaging]
        SEARCH[Search - Galene]
        JOBS[Jobs Matching]
        LEARNING[LinkedIn Learning]
    end

    subgraph "Stream Processing"
        KAFKA[/"Kafka - 7T msgs/day"/]
        SAMZA[Apache Samza]
        BROOKLIN[Brooklin]
    end

    subgraph "Storage"
        ESPRESSO[(Espresso)]
        ORACLE[(Oracle)]
        VOLDEMORT[Voldemort]
        PINOT[Apache Pinot]
    end

    WEB --> RESTLI
    MOBILE --> RESTLI
    RESTLI --> FEED
    RESTLI --> PROFILE
    RESTLI --> MSG
    RESTLI --> SEARCH

    FEED --> KAFKA
    PROFILE --> ESPRESSO
    MSG --> KAFKA
    KAFKA --> SAMZA
    SAMZA --> PINOT`,
    components: [
      {
        name: 'Kafka at LinkedIn',
        description: 'Birthplace of Apache Kafka, processing 7 trillion messages daily',
        responsibilities: ['Event streaming', 'Data pipeline', 'Activity tracking', 'Change capture'],
        technologies: ['Apache Kafka', 'Java', 'ZooKeeper'],
      },
      {
        name: 'Espresso Database',
        description: 'LinkedIn\'s distributed document store',
        responsibilities: ['Member data', 'Social graph', 'Timeline data'],
        technologies: ['Java', 'MySQL storage', 'Custom replication'],
      },
    ],
  },

  highlights: [
    {
      title: 'Kafka Birthplace',
      description: 'Created Apache Kafka, now processing 7T messages/day',
      impact: 'De facto standard for event streaming',
      technologies: ['Apache Kafka', 'Java'],
      icon: 'Zap',
    },
    {
      title: 'Rest.li Framework',
      description: 'RESTful service framework for microservices',
      impact: 'Powers 750+ internal services',
      technologies: ['Java', 'Scala', 'REST'],
      icon: 'Code',
    },
    {
      title: 'Apache Samza',
      description: 'Stream processing framework',
      impact: 'Real-time analytics at scale',
      technologies: ['Apache Samza', 'Kafka', 'YARN'],
      icon: 'Activity',
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Members', value: '900M+', trend: 'up' },
      { label: 'Kafka Messages/Day', value: '7T+', trend: 'up' },
      { label: 'Microservices', value: '750+', trend: 'stable' },
    ],
    innovationAreas: [
      {
        name: 'Economic Graph',
        description: 'Digital mapping of the global economy',
        technologies: ['Graph Database', 'ML', 'Analytics'],
        yearStarted: 2012,
      },
    ],
    openSource: [
      {
        name: 'Kafka',
        description: 'Distributed event streaming platform',
        url: 'https://github.com/apache/kafka',
        stars: 27000,
        language: 'Scala/Java',
      },
      {
        name: 'Samza',
        description: 'Distributed stream processing framework',
        url: 'https://github.com/apache/samza',
        stars: 800,
        language: 'Java',
      },
      {
        name: 'Pinot',
        description: 'Real-time distributed OLAP datastore',
        url: 'https://github.com/apache/pinot',
        stars: 5200,
        language: 'Java',
      },
      {
        name: 'Rest.li',
        description: 'REST framework for building scalable services',
        url: 'https://github.com/linkedin/rest.li',
        stars: 2400,
        language: 'Java',
      },
    ],
    engineeringBlog: 'https://engineering.linkedin.com/',
  },

  // Phase 2: Detailed Architecture Diagrams
  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Clients["Client Applications"]
        WEB["Web App<br/>Ember.js + React"]
        MOBILE["Mobile Apps<br/>Native iOS/Android"]
        LITEAPP["LinkedIn Lite<br/>PWA"]
    end

    subgraph Gateway["API Gateway Layer"]
        RESTLI["Rest.li Framework<br/>Java/Scala"]
        GRAPHQL["GraphQL Federation<br/>Unified API"]
        AUTH["Authentication<br/>OAuth 2.0"]
    end

    subgraph Services["750+ Microservices"]
        PROFILE["Profile Service<br/>Java"]
        FEED["Feed Service<br/>Java"]
        MESSAGING["Messaging<br/>Scala"]
        SEARCH["Search - Galene<br/>Java"]
        JOBS["Jobs Matching<br/>ML Pipeline"]
        LEARNING["LinkedIn Learning<br/>Video Platform"]
        CONNECTIONS["Connections<br/>Graph Service"]
    end

    subgraph Streaming["Stream Processing - Kafka Birthplace"]
        KAFKA[/"Apache Kafka<br/>7T msgs/day"/]
        SAMZA["Apache Samza<br/>Stream Processing"]
        BROOKLIN["Brooklin<br/>Change Capture"]
    end

    subgraph Data["Data Layer"]
        ESPRESSO[("Espresso<br/>Document Store")]
        ORACLE[("Oracle<br/>Legacy Systems")]
        VOLDEMORT["Voldemort<br/>KV Store"]
        PINOT[("Apache Pinot<br/>OLAP")]
        COUCHBASE["Couchbase<br/>Session Cache"]
    end

    Clients --> Gateway
    Gateway --> Services
    Services --> Streaming
    Services --> Data
    Streaming --> Data`,

    dataFlow: `sequenceDiagram
    participant User
    participant App as LinkedIn App
    participant Gateway as Rest.li Gateway
    participant Feed as Feed Service
    participant Kafka as Apache Kafka
    participant Samza as Stream Processing
    participant Espresso as Espresso DB
    participant Pinot as Apache Pinot
    participant ML as ML Ranking

    User->>App: View feed
    App->>Gateway: REST API request
    Gateway->>Feed: Get personalized feed
    Feed->>Espresso: Fetch connections posts
    Espresso-->>Feed: Raw posts
    Feed->>ML: Rank by relevance
    ML-->>Feed: Ranked posts
    Feed-->>Gateway: Feed response
    Gateway-->>App: JSON response
    App-->>User: Display feed

    Note over Kafka: 7 Trillion messages/day

    User->>App: Post update
    App->>Gateway: Create post
    Gateway->>Feed: Publish post
    Feed->>Espresso: Persist post
    Feed->>Kafka: Publish event
    Kafka->>Samza: Process stream
    Samza->>Pinot: Update analytics
    Samza->>Feed: Fan-out to followers`,

    deployment: `flowchart TB
    subgraph Azure["Azure Cloud - Microsoft Owned"]
        subgraph Region1["US West"]
            subgraph K8S1["Kubernetes Cluster"]
                SVC1["750+ Services"]
                POD1["Thousands of Pods"]
            end
            subgraph Data1["Data Tier"]
                ESP1[("Espresso")]
                KAFKA1[/"Kafka Cluster"/]
            end
        end

        subgraph Region2["US East"]
            subgraph K8S2["Kubernetes Cluster"]
                SVC2["750+ Services"]
                POD2["Thousands of Pods"]
            end
            subgraph Data2["Data Tier"]
                ESP2[("Espresso")]
                KAFKA2[/"Kafka Cluster"/]
            end
        end

        subgraph Global["Global Infrastructure"]
            CDN["Azure CDN"]
            LB["Azure Load Balancer"]
            DNS["Azure DNS"]
        end
    end

    subgraph Observability["Monitoring"]
        INGRAPHS["InGraphs<br/>Custom Metrics"]
        ONCALL["On-Call System"]
        TRACING["Distributed Tracing"]
    end

    Internet["900M Members"] --> CDN
    CDN --> LB
    LB --> K8S1
    LB --> K8S2
    K8S1 --> Data1
    K8S2 --> Data2
    K8S1 --> INGRAPHS
    K8S2 --> INGRAPHS`,

    serviceInteraction: `flowchart LR
    subgraph Frontend["Frontend Services"]
        WEB["Web BFF"]
        MOBILE["Mobile BFF"]
    end

    subgraph Core["Core Domain Services"]
        IDENTITY["Identity<br/>Authentication"]
        MEMBER["Member<br/>Profiles"]
        NETWORK["Network<br/>Connections"]
    end

    subgraph Engagement["Engagement Services"]
        FEED["Feed<br/>Timeline"]
        MSG["Messaging<br/>InMail"]
        NOTIF["Notifications"]
    end

    subgraph Business["Business Services"]
        JOBS["Jobs<br/>Matching"]
        ADS["Advertising<br/>Campaigns"]
        LEARNING["Learning<br/>Courses"]
    end

    subgraph Platform["Platform Services"]
        KAFKA[/"Kafka"/]
        SAMZA["Samza"]
        ML["ML Platform"]
    end

    WEB --> IDENTITY
    WEB --> MEMBER
    WEB --> FEED
    MOBILE --> NETWORK
    MOBILE --> MSG

    FEED --> NETWORK
    JOBS --> MEMBER
    JOBS --> ML
    ADS --> ML

    FEED --> KAFKA
    MSG --> KAFKA
    KAFKA --> SAMZA
    SAMZA --> ML`,
  },

  // Phase 2: Design Patterns Used
  patterns: [
    {
      patternSlug: 'event-streaming',
      patternName: 'Event Streaming with Kafka',
      usage: 'Core data pipeline and service communication',
      implementation: 'LinkedIn created Kafka - now processing 7 trillion messages daily for activity tracking, metrics, and service communication',
      scale: '7T+ messages/day',
    },
    {
      patternSlug: 'rest-framework',
      patternName: 'Rest.li Framework',
      usage: 'Standardized RESTful service interfaces',
      implementation: 'Custom framework providing uniform API patterns, automatic documentation, and client generation for 750+ services',
      scale: '750+ microservices',
    },
    {
      patternSlug: 'stream-processing',
      patternName: 'Stream Processing with Samza',
      usage: 'Real-time data processing',
      implementation: 'Apache Samza (created at LinkedIn) for stateful stream processing with exactly-once semantics',
      scale: 'Processes trillions of events',
    },
    {
      patternSlug: 'document-store',
      patternName: 'Espresso Document Store',
      usage: 'Primary data storage for member data',
      implementation: 'Custom distributed document store with timeline consistency, secondary indexes, and change capture',
      scale: '900M+ member profiles',
    },
    {
      patternSlug: 'real-time-olap',
      patternName: 'Real-Time OLAP with Pinot',
      usage: 'Analytics and metrics queries',
      implementation: 'Apache Pinot (created at LinkedIn) for sub-second OLAP queries on streaming and batch data',
      scale: '100K+ queries/second',
    },
    {
      patternSlug: 'change-data-capture',
      patternName: 'Change Data Capture',
      usage: 'Database replication and event sourcing',
      implementation: 'Brooklin for streaming database changes to Kafka, enabling event-driven architectures',
      scale: 'All database changes captured',
    },
  ],

  // Phase 2: Technical Decisions (ADR-style)
  technicalDecisions: [
    {
      title: 'Why Build Apache Kafka',
      context: 'LinkedIn needed a unified platform for real-time data feeds, activity tracking, and service decoupling at massive scale',
      decision: 'Built Kafka as a distributed commit log optimized for high-throughput, low-latency message streaming',
      consequences: [
        'Enabled real-time data pipelines company-wide',
        'Decoupled 750+ microservices',
        'Became industry standard for event streaming',
        'Required significant operational investment',
        'Open-sourced and donated to Apache',
      ],
      alternatives: ['RabbitMQ', 'ActiveMQ', 'Custom queue system'],
      sources: ['https://engineering.linkedin.com/blog/2016/04/kafka-ecosystem-at-linkedin'],
    },
    {
      title: 'Why Java and Scala for Backend',
      context: 'Needed languages with strong typing, mature ecosystem, and proven scalability for enterprise systems',
      decision: 'Standardized on JVM with Java for services and Scala for data processing, creating Rest.li framework',
      consequences: [
        'Consistent tooling across 750+ services',
        'Strong type safety reduced production bugs',
        'Large talent pool in Silicon Valley',
        'JVM tuning expertise required',
        'Scala learning curve for some teams',
      ],
      alternatives: ['Go', 'Python', 'Node.js'],
      sources: ['https://engineering.linkedin.com/'],
    },
    {
      title: 'Why Build Espresso Instead of Using Existing NoSQL',
      context: 'Existing databases did not meet requirements for timeline consistency, change capture, and horizontal scaling',
      decision: 'Built Espresso - a distributed document store with MySQL storage engine and custom replication',
      consequences: [
        'Timeline consistency guaranteed for member data',
        'Built-in change capture for Kafka integration',
        'Significant engineering investment',
        'Tight integration with LinkedIn infrastructure',
        'Not suitable for external use',
      ],
      alternatives: ['Cassandra', 'MongoDB', 'CockroachDB'],
      sources: ['https://engineering.linkedin.com/espresso/introducing-espresso-linkedins-hot-new-distributed-document-store'],
    },
    {
      title: 'Why Build Apache Pinot for Analytics',
      context: 'Needed sub-second analytics queries on both real-time streaming data and historical batch data',
      decision: 'Built Pinot as a distributed OLAP datastore with native Kafka integration and hybrid tables',
      consequences: [
        'Sub-second query latency at scale',
        'Unified view of streaming and batch data',
        'Complex operational requirements',
        'Open-sourced and widely adopted',
        'Powers Who Viewed Your Profile and analytics',
      ],
      alternatives: ['Druid', 'ClickHouse', 'Elasticsearch'],
      sources: ['https://engineering.linkedin.com/blog/2021/pinot-joins-apache'],
    },
  ],

  lastUpdated: '2024-12-01',
  sources: ['https://engineering.linkedin.com/', 'https://github.com/linkedin'],
};
