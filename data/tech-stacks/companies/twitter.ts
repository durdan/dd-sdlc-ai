import { Company } from '../types';

export const twitter: Company = {
  slug: 'twitter',
  name: 'Twitter/X',
  logo: '/tech-stacks/logos/twitter.svg',
  description: 'Real-time social platform processing 500M+ tweets daily with Scala-based architecture',
  category: 'social-media',
  tags: ['social-media', 'scala', 'java', 'real-time', 'timeline', 'microservices'],

  info: {
    founded: 2006,
    headquarters: 'San Francisco, CA',
    employees: '2,000+',
    revenue: '$4B+',
    publiclyTraded: false,
    website: 'https://x.com',
  },

  metrics: {
    users: '500M+ monthly active users',
    monthlyActiveUsers: '500M+',
    dailyActiveUsers: '250M+',
    uptime: '99.9%',
    customMetrics: [
      { label: 'Tweets/Day', value: '500M+' },
      { label: 'Timeline Requests/Sec', value: '300K+' },
      { label: 'Fanout Operations/Sec', value: '5M+' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
      { name: 'React Native', category: 'framework', usage: 'primary' },
      { name: 'GraphQL', category: 'framework', usage: 'primary' },
    ],
    backend: [
      { name: 'Scala', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Java', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Finagle', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'Thrift', category: 'framework', usage: 'primary' },
    ],
    databases: [
      { name: 'Manhattan', category: 'database', usage: 'primary', isPrimary: true, description: 'Twitter distributed KV store' },
      { name: 'MySQL', category: 'database', usage: 'primary' },
      { name: 'Redis', category: 'cache', usage: 'primary' },
      { name: 'Memcached', category: 'cache', usage: 'primary' },
      { name: 'FlockDB', category: 'database', usage: 'primary', description: 'Social graph store' },
    ],
    infrastructure: [
      { name: 'Google Cloud', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
      { name: 'Mesos', category: 'orchestration', usage: 'legacy' },
      { name: 'Aurora', category: 'orchestration', usage: 'primary' },
    ],
    devOps: [
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
      { name: 'Splunk', category: 'monitoring', usage: 'primary' },
      { name: 'Custom CI/CD', category: 'ci-cd', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Apache Kafka', category: 'queue', usage: 'primary', isPrimary: true },
      { name: 'Apache Storm', category: 'analytics', usage: 'primary' },
      { name: 'Hadoop', category: 'analytics', usage: 'primary' },
      { name: 'Scalding', category: 'analytics', usage: 'primary', description: 'Scala MapReduce' },
    ],
    ml: [
      { name: 'TensorFlow', category: 'ml-framework', usage: 'primary' },
      { name: 'PyTorch', category: 'ml-framework', usage: 'primary' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: 'Scala Microservices with Finagle',
    htmlDiagram: {
      title: 'Twitter Architecture',
      subtitle: 'Real-Time Social Platform',
      layers: [
        {
          id: 'clients',
          name: 'Client Applications',
          position: 'top',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'web', name: 'Web App', techStack: ['React', 'GraphQL'] },
            { id: 'mobile', name: 'Mobile Apps', techStack: ['React Native'] },
            { id: 'api', name: 'Public API', techStack: ['REST', 'OAuth'] },
          ],
        },
        {
          id: 'services',
          name: 'Core Services',
          position: 'middle',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'timeline', name: 'Timeline Service', techStack: ['Scala', 'Finagle'] },
            { id: 'tweet', name: 'Tweet Service', techStack: ['Scala'] },
            { id: 'user', name: 'User Service', techStack: ['Scala'] },
            { id: 'fanout', name: 'Fanout Service', techStack: ['Scala'] },
          ],
        },
        {
          id: 'data',
          name: 'Data Layer',
          position: 'bottom',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'manhattan', name: 'Manhattan', techStack: ['Distributed KV'] },
            { id: 'kafka', name: 'Kafka', techStack: ['Event Streaming'] },
            { id: 'cache', name: 'Cache Layer', techStack: ['Redis', 'Memcached'] },
          ],
        },
      ],
      connections: [
        { from: 'clients', to: 'services', type: 'api-call' },
        { from: 'services', to: 'data', type: 'data-flow' },
      ],
    },
    mermaidDiagram: `graph TB
    subgraph "Clients"
        WEB[Web App]
        MOBILE[Mobile Apps]
        API[Public API]
    end

    subgraph "Edge"
        CDN[CDN]
        LB[Load Balancer]
    end

    subgraph "Services"
        TIMELINE[Timeline Service]
        TWEET[Tweet Service]
        USER[User Service]
        FANOUT[Fanout Service]
        SEARCH[Search Service]
    end

    subgraph "Data"
        MANHATTAN[(Manhattan)]
        KAFKA[/"Kafka"/]
        REDIS[Redis Cache]
        FLOCK[(FlockDB)]
    end

    WEB --> CDN
    MOBILE --> LB
    CDN --> TIMELINE
    LB --> TWEET

    TIMELINE --> MANHATTAN
    TWEET --> KAFKA
    FANOUT --> REDIS
    USER --> FLOCK`,
    components: [
      {
        name: 'Finagle RPC Framework',
        description: 'Asynchronous RPC system for building high-performance services in Scala/Java',
        responsibilities: ['Service communication', 'Load balancing', 'Connection pooling', 'Retry logic'],
        technologies: ['Scala', 'Netty', 'Thrift'],
      },
      {
        name: 'Manhattan Distributed Database',
        description: 'Twitter-built distributed key-value store for real-time data',
        responsibilities: ['Tweet storage', 'Timeline data', 'User data', 'Real-time access'],
        technologies: ['Java', 'Custom storage engine'],
      },
    ],
  },

  highlights: [
    {
      title: 'Scala at Scale',
      description: 'Pioneered Scala for backend services',
      impact: 'Influenced industry adoption of Scala',
      technologies: ['Scala', 'Finagle', 'Finatra'],
      icon: 'Code',
    },
    {
      title: 'Timeline Fanout',
      description: 'Push-based timeline delivery to millions',
      impact: '300K+ timeline requests per second',
      technologies: ['Manhattan', 'Redis', 'Kafka'],
      icon: 'Zap',
    },
    {
      title: 'Real-Time Search',
      description: 'Indexing tweets in seconds',
      impact: 'Search across 500M daily tweets instantly',
      technologies: ['Lucene', 'Earlybird'],
      icon: 'Search',
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Tweets/Day', value: '500M+', trend: 'stable' },
      { label: 'Timeline QPS', value: '300K+', trend: 'up' },
      { label: 'Fanout Ops/Sec', value: '5M+', trend: 'up' },
    ],
    innovationAreas: [
      {
        name: 'Algorithmic Timeline',
        description: 'ML-powered tweet ranking and recommendations',
        technologies: ['TensorFlow', 'Real-time ML'],
        yearStarted: 2016,
      },
      {
        name: 'Spaces Audio',
        description: 'Real-time audio conversations',
        technologies: ['WebRTC', 'Janus', 'Real-time'],
        yearStarted: 2020,
      },
    ],
    openSource: [
      {
        name: 'Finagle',
        description: 'Extensible RPC system for the JVM',
        url: 'https://github.com/twitter/finagle',
        stars: 8700,
        language: 'Scala',
      },
      {
        name: 'Finatra',
        description: 'Fast, testable Scala HTTP services built on Finagle',
        url: 'https://github.com/twitter/finatra',
        stars: 2200,
        language: 'Scala',
      },
      {
        name: 'Scalding',
        description: 'Scala API for Cascading/MapReduce',
        url: 'https://github.com/twitter/scalding',
        stars: 3400,
        language: 'Scala',
      },
    ],
    engineeringBlog: 'https://blog.twitter.com/engineering',
  },

  // Phase 2: Detailed Architecture Diagrams
  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Clients["Client Applications"]
        WEB["Web App<br/>React + GraphQL"]
        IOS["iOS App<br/>Swift"]
        AND["Android App<br/>Kotlin"]
        API["Public API<br/>OAuth 2.0"]
    end

    subgraph Edge["Edge Layer"]
        CDN["CDN<br/>Global Edge Cache"]
        LB["Load Balancers"]
    end

    subgraph Gateway["API Gateway"]
        GQL["GraphQL Gateway<br/>Strato"]
        REST["REST API<br/>Finagle"]
    end

    subgraph Core["Core Services - Scala/Finagle"]
        TIMELINE["Timeline Service<br/>Home/Search Timelines"]
        TWEET["Tweet Service<br/>CRUD Operations"]
        USER["User Service<br/>Profiles/Auth"]
        FANOUT["Fanout Service<br/>Push to Followers"]
        SOCIAL["Social Graph<br/>Follow/Block"]
        SEARCH["Search Service<br/>Earlybird"]
    end

    subgraph Streaming["Real-Time Processing"]
        KAFKA[/"Apache Kafka<br/>Event Bus"/]
        STORM["Apache Storm<br/>Stream Processing"]
        HERON["Heron<br/>Realtime Analytics"]
    end

    subgraph Storage["Storage Layer"]
        MANHATTAN[("Manhattan<br/>Tweets + Timelines")]
        MYSQL[("MySQL<br/>Relational Data")]
        FLOCK[("FlockDB<br/>Social Graph")]
        REDIS["Redis<br/>Cache + Sessions"]
        MEMCACHE["Memcached<br/>Hot Data"]
    end

    Clients --> Edge
    Edge --> Gateway
    Gateway --> Core
    Core --> Streaming
    Core --> Storage
    Streaming --> Storage`,

    dataFlow: `sequenceDiagram
    participant User
    participant App as Twitter App
    participant Gateway as GraphQL Gateway
    participant Tweet as Tweet Service
    participant Fanout as Fanout Service
    participant Manhattan as Manhattan DB
    participant Kafka as Kafka
    participant Timeline as Timeline Service
    participant Follower as Follower Timeline

    User->>App: Post tweet
    App->>Gateway: GraphQL mutation
    Gateway->>Tweet: Create tweet
    Tweet->>Manhattan: Store tweet
    Manhattan-->>Tweet: Tweet ID
    Tweet->>Kafka: Publish tweet event
    Tweet-->>Gateway: Success
    Gateway-->>App: Tweet created

    Kafka->>Fanout: Tweet event
    Fanout->>Timeline: Get follower list
    Timeline-->>Fanout: Follower IDs

    loop For each follower
        Fanout->>Manhattan: Add to timeline
    end

    Note over Fanout,Manhattan: Fanout to millions of followers<br/>5M+ operations/second`,

    deployment: `flowchart TB
    subgraph GCP["Google Cloud Platform"]
        subgraph Region1["US Region"]
            subgraph K8S1["Kubernetes Cluster"]
                SVC1["Scala Services"]
                FINAGLE1["Finagle Stack"]
            end
            subgraph Data1["Data Centers"]
                MH1[("Manhattan")]
                CACHE1["Redis/Memcached"]
            end
        end

        subgraph Region2["EU Region"]
            subgraph K8S2["Kubernetes Cluster"]
                SVC2["Scala Services"]
                FINAGLE2["Finagle Stack"]
            end
            subgraph Data2["Data Centers"]
                MH2[("Manhattan")]
                CACHE2["Redis/Memcached"]
            end
        end

        subgraph Global["Global Layer"]
            CDN["Global CDN"]
            DNS["DNS"]
            LB["Global Load Balancer"]
        end
    end

    subgraph Observability["Monitoring"]
        SPLUNK["Splunk"]
        METRICS["Metrics Pipeline"]
        TRACE["Distributed Tracing"]
    end

    Users["500M Users"] --> CDN
    CDN --> DNS
    DNS --> LB
    LB --> K8S1
    LB --> K8S2
    K8S1 --> Data1
    K8S2 --> Data2`,

    serviceInteraction: `flowchart LR
    subgraph Read["Read Path"]
        HOME["Home Timeline"]
        SRCH["Search"]
        PROFILE["Profile"]
        NOTIF["Notifications"]
    end

    subgraph Write["Write Path"]
        POST["Post Tweet"]
        REPLY["Reply"]
        RETWEET["Retweet"]
        LIKE["Like"]
    end

    subgraph Core["Core Services"]
        TIMELINE["Timeline"]
        TWEET["Tweet"]
        SOCIAL["Social Graph"]
        FANOUT["Fanout"]
    end

    subgraph Async["Async Processing"]
        KAFKA[/"Kafka"/]
        STORM["Storm"]
        INDEX["Search Indexer"]
    end

    HOME --> TIMELINE
    SRCH --> INDEX
    PROFILE --> SOCIAL

    POST --> TWEET
    TWEET --> KAFKA
    KAFKA --> FANOUT
    KAFKA --> INDEX
    FANOUT --> TIMELINE

    REPLY --> TWEET
    RETWEET --> TWEET
    LIKE --> SOCIAL`,
  },

  // Phase 2: Design Patterns Used
  patterns: [
    {
      patternSlug: 'fanout-on-write',
      patternName: 'Fanout on Write',
      usage: 'Timeline delivery strategy',
      implementation: 'When a tweet is posted, it is pushed to all follower timelines in real-time',
      scale: '5M+ fanout operations per second',
    },
    {
      patternSlug: 'finagle-rpc',
      patternName: 'Finagle RPC Framework',
      usage: 'Service-to-service communication',
      implementation: 'Asynchronous, protocol-agnostic RPC with built-in load balancing, retries, and circuit breakers',
      scale: 'Millions of RPC calls per second',
    },
    {
      patternSlug: 'distributed-kv',
      patternName: 'Manhattan Distributed KV Store',
      usage: 'Primary tweet and timeline storage',
      implementation: 'Multi-tenant, real-time, strongly consistent distributed key-value store',
      scale: 'Billions of keys, sub-ms latency',
    },
    {
      patternSlug: 'social-graph',
      patternName: 'FlockDB Graph Store',
      usage: 'Follow/follower relationships',
      implementation: 'Distributed graph database optimized for adjacency list operations at scale',
      scale: 'Hundreds of billions of edges',
    },
    {
      patternSlug: 'real-time-search',
      patternName: 'Earlybird Real-Time Search',
      usage: 'Tweet indexing and search',
      implementation: 'Custom search system indexing tweets within seconds of posting',
      scale: '500M tweets/day indexed in real-time',
    },
    {
      patternSlug: 'cache-aside',
      patternName: 'Multi-Layer Caching',
      usage: 'Read optimization',
      implementation: 'Redis and Memcached layers for hot data, timeline caching, and session storage',
      scale: 'Trillions of cache hits/day',
    },
  ],

  // Phase 2: Technical Decisions (ADR-style)
  technicalDecisions: [
    {
      title: 'Why Scala for Backend Services',
      context: 'Needed a language that combined functional programming benefits with JVM ecosystem maturity',
      decision: 'Adopted Scala as primary backend language, built Finagle RPC framework',
      consequences: [
        'Excellent concurrency with Futures and actors',
        'Strong type system caught bugs early',
        'Required significant training investment',
        'Influenced industry Scala adoption',
        'Created rich open-source ecosystem',
      ],
      alternatives: ['Java only', 'Erlang', 'C++'],
      sources: ['https://blog.twitter.com/engineering/en_us/topics/infrastructure/2021/the-scala-programming-language-at-twitter'],
    },
    {
      title: 'Why Build Manhattan Instead of Using Cassandra',
      context: 'Needed a distributed KV store with strong consistency and multi-tenancy for diverse workloads',
      decision: 'Built Manhattan as a custom distributed key-value store',
      consequences: [
        'Strong consistency for critical paths',
        'Multi-tenant with resource isolation',
        'Sub-millisecond latency at scale',
        'Significant engineering investment',
        'Not open-sourced',
      ],
      alternatives: ['Cassandra', 'DynamoDB', 'Custom MySQL sharding'],
      sources: ['https://blog.twitter.com/engineering/en_us/topics/infrastructure/2014/manhattan-our-real-time-multi-tenant-distributed-database-for-twitters-scale'],
    },
    {
      title: 'Why Fanout on Write vs Fanout on Read',
      context: 'Needed to deliver tweets to follower timelines with minimal latency',
      decision: 'Chose fanout-on-write model where tweets are pushed to follower timelines at write time',
      consequences: [
        'Fast timeline reads (pre-computed)',
        'High write amplification for popular accounts',
        'Hybrid approach for celebrities (fanout-on-read)',
        'Complex consistency management',
        'Required Manhattan for scale',
      ],
      alternatives: ['Fanout on read only', 'Hybrid only', 'Pull-based timelines'],
      sources: ['https://blog.twitter.com/engineering/en_us/topics/infrastructure/2013/new-tweets-per-second-record-and-how'],
    },
    {
      title: 'Why Apache Mesos to Kubernetes Migration',
      context: 'Mesos served well but Kubernetes became industry standard with better ecosystem',
      decision: 'Migrated from Mesos/Aurora to Kubernetes on Google Cloud',
      consequences: [
        'Better developer tooling and ecosystem',
        'Improved resource efficiency',
        'Multi-year migration effort',
        'Leveraged GCP managed services',
        'Reduced operational complexity',
      ],
      alternatives: ['Stay on Mesos', 'Build custom scheduler', 'AWS ECS'],
      sources: ['https://blog.twitter.com/engineering/en_us/topics/infrastructure/2020/from-mesos-to-kubernetes'],
    },
  ],

  lastUpdated: '2024-12-01',
  sources: ['https://blog.twitter.com/engineering', 'https://github.com/twitter'],
};
