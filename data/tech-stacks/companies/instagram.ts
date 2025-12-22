import { Company } from '../types';

export const instagram: Company = {
  slug: 'instagram',
  name: 'Instagram',
  logo: '/tech-stacks/logos/instagram.svg',
  description: 'Scaled Django architecture with 4000+ database shards serving 2B+ users',
  category: 'social-media',
  tags: ['social-media', 'python', 'django', 'cassandra', 'postgresql', 'photos'],

  info: {
    founded: 2010,
    headquarters: 'Menlo Park, CA',
    employees: '10,000+',
    revenue: '$50B+ (Meta segment)',
    publiclyTraded: true,
    ticker: 'META',
    website: 'https://instagram.com',
  },

  metrics: {
    users: '2B+ users',
    monthlyActiveUsers: '2B+',
    dailyActiveUsers: '500M+',
    uptime: '99.99%',
    customMetrics: [
      { label: 'Photos/Day', value: '95M+' },
      { label: 'Stories/Day', value: '500M+' },
      { label: 'Database Shards', value: '4,000+' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React Native', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'React', category: 'framework', usage: 'primary' },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
    ],
    backend: [
      { name: 'Python', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Django', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'C++', category: 'language', usage: 'secondary' },
      { name: 'Thrift', category: 'framework', usage: 'primary' },
    ],
    databases: [
      { name: 'PostgreSQL', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'Cassandra', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'Redis', category: 'cache', usage: 'primary' },
      { name: 'Memcached', category: 'cache', usage: 'primary' },
    ],
    infrastructure: [
      { name: 'Facebook Infrastructure', category: 'container', usage: 'primary' },
      { name: 'Custom CDN', category: 'cdn', usage: 'primary' },
      { name: 'TAO', category: 'database', usage: 'primary', description: 'Social graph store' },
    ],
    devOps: [
      { name: 'Tupperware', category: 'orchestration', usage: 'primary' },
      { name: 'Scuba', category: 'monitoring', usage: 'primary' },
      { name: 'ODS', category: 'monitoring', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Apache Kafka', category: 'queue', usage: 'primary' },
      { name: 'Apache Spark', category: 'analytics', usage: 'primary' },
      { name: 'Presto', category: 'analytics', usage: 'primary' },
    ],
    ml: [
      { name: 'PyTorch', category: 'ml-framework', usage: 'primary', isPrimary: true },
      { name: 'Caffe2', category: 'ml-framework', usage: 'legacy' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: 'Scaled Django with Massive Sharding',
    htmlDiagram: {
      title: 'Instagram Architecture',
      subtitle: '2B+ Users on Django',
      layers: [
        {
          id: 'clients',
          name: 'Mobile-First',
          position: 'top',
          color: 'bg-pink-100 border-pink-300',
          items: [
            { id: 'ios', name: 'iOS App', techStack: ['Swift', 'React Native'] },
            { id: 'android', name: 'Android App', techStack: ['Kotlin', 'React Native'] },
            { id: 'web', name: 'Web', techStack: ['React'] },
          ],
        },
        {
          id: 'api',
          name: 'API Layer',
          position: 'top',
          color: 'bg-purple-100 border-purple-300',
          items: [
            { id: 'django', name: 'Django API', techStack: ['Python', 'uWSGI'] },
          ],
        },
        {
          id: 'services',
          name: 'Core Services',
          position: 'middle',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'feed', name: 'Feed Service', techStack: ['Python', 'Cassandra'] },
            { id: 'media', name: 'Media Service', techStack: ['C++', 'CDN'] },
            { id: 'social', name: 'Social Graph', techStack: ['TAO'] },
            { id: 'ml', name: 'ML Ranking', techStack: ['PyTorch'] },
          ],
        },
        {
          id: 'data',
          name: 'Data Layer',
          position: 'bottom',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'pg', name: 'PostgreSQL (4000+ shards)', techStack: ['Sharded'] },
            { id: 'cass', name: 'Cassandra', techStack: ['Time Series'] },
            { id: 'redis', name: 'Redis', techStack: ['Caching'] },
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
    subgraph "Mobile Apps"
        IOS[iOS - React Native]
        AND[Android - React Native]
        WEB[Web App]
    end

    subgraph "Application Layer"
        DJANGO[Django API Servers]
        UWSGI[uWSGI Workers]
    end

    subgraph "Services"
        FEED[Feed Generation]
        MEDIA[Media Processing]
        SOCIAL[Social Graph - TAO]
        SEARCH[Search]
        STORIES[Stories]
        REELS[Reels]
    end

    subgraph "ML Pipeline"
        RANK[Ranking Models]
        REC[Recommendations]
        MOD[Content Moderation]
    end

    subgraph "Storage"
        PG[(PostgreSQL Shards)]
        CASS[(Cassandra)]
        REDIS[Redis]
        CDN[CDN Storage]
    end

    IOS --> DJANGO
    AND --> DJANGO
    WEB --> DJANGO

    DJANGO --> UWSGI
    UWSGI --> FEED
    UWSGI --> MEDIA
    UWSGI --> SOCIAL

    FEED --> RANK
    FEED --> PG
    FEED --> CASS
    MEDIA --> CDN
    SOCIAL --> PG`,
    components: [
      {
        name: 'PostgreSQL Sharding',
        description: 'Custom sharding layer distributing data across 4000+ PostgreSQL instances',
        responsibilities: ['Horizontal scaling', 'Shard routing', 'Data distribution'],
        technologies: ['PostgreSQL', 'Python', 'Custom middleware'],
      },
      {
        name: 'TAO Social Graph',
        description: 'Distributed social graph storage system from Meta',
        responsibilities: ['Relationship storage', 'Graph queries', 'Caching'],
        technologies: ['Custom', 'Memcached', 'MySQL'],
      },
    ],
  },

  highlights: [
    {
      title: 'Django at Scale',
      description: 'Largest Django deployment serving 2B+ users',
      impact: 'Proved Python can handle massive scale',
      technologies: ['Python', 'Django', 'uWSGI'],
      icon: 'Zap',
    },
    {
      title: 'PostgreSQL Sharding',
      description: '4000+ shards handling billions of rows',
      impact: 'Pioneered massive PostgreSQL deployments',
      technologies: ['PostgreSQL', 'Custom Sharding'],
      icon: 'Database',
    },
    {
      title: 'React Native Pioneer',
      description: 'Early adopter of cross-platform mobile development',
      impact: 'Shared 85%+ code between iOS and Android',
      technologies: ['React Native', 'JavaScript'],
      icon: 'Smartphone',
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Monthly Users', value: '2B+', trend: 'up' },
      { label: 'Photos/Day', value: '95M+', trend: 'up' },
      { label: 'DB Shards', value: '4,000+', trend: 'stable' },
    ],
    innovationAreas: [
      {
        name: 'Reels Algorithm',
        description: 'ML-powered short video recommendations',
        technologies: ['PyTorch', 'Transformers', 'Real-time ML'],
        yearStarted: 2020,
      },
      {
        name: 'Content Moderation',
        description: 'AI-powered content safety at scale',
        technologies: ['Computer Vision', 'NLP', 'PyTorch'],
        yearStarted: 2017,
      },
    ],
    openSource: [
      {
        name: 'React Native',
        description: 'Cross-platform mobile framework',
        url: 'https://github.com/facebook/react-native',
        stars: 115000,
        language: 'JavaScript',
      },
    ],
    engineeringBlog: 'https://instagram-engineering.com/',
  },

  // Phase 2: Detailed Architecture Diagrams
  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Clients["Mobile-First Clients"]
        IOS["iOS App<br/>React Native + Swift"]
        AND["Android App<br/>React Native + Kotlin"]
        WEB["Web App<br/>React"]
    end

    subgraph Edge["Edge and CDN Layer"]
        CDN["Meta CDN<br/>Global Edge Cache"]
        LB["Load Balancers<br/>Edge POP"]
    end

    subgraph API["Application Layer"]
        DJANGO["Django API Servers<br/>Python + uWSGI"]
        THRIFT["Thrift Services<br/>Internal RPC"]
    end

    subgraph Services["Core Services"]
        FEED["Feed Generation<br/>Python"]
        MEDIA["Media Processing<br/>C++ Pipeline"]
        SOCIAL["Social Graph<br/>TAO"]
        STORIES["Stories Service<br/>Python"]
        REELS["Reels Service<br/>ML Pipeline"]
        SEARCH["Search<br/>Unicorn"]
    end

    subgraph ML["ML Infrastructure"]
        RANK["Ranking Models<br/>PyTorch"]
        REC["Recommendations<br/>Embeddings"]
        MOD["Content Moderation<br/>Vision AI"]
    end

    subgraph Data["Data Layer - 4000+ Shards"]
        PG[("PostgreSQL<br/>4000+ Shards")]
        CASS[("Cassandra<br/>Time Series")]
        REDIS["Redis Cluster<br/>Session Cache"]
        TAO[("TAO<br/>Social Graph Store")]
        MEMCACHE["Memcached<br/>App Cache"]
    end

    Clients --> Edge
    Edge --> API
    API --> Services
    Services --> ML
    Services --> Data
    ML --> Data`,

    dataFlow: `sequenceDiagram
    participant User
    participant App as Instagram App
    participant CDN as Meta CDN
    participant Django as Django API
    participant Feed as Feed Service
    participant TAO as TAO Graph
    participant PG as PostgreSQL Shards
    participant ML as ML Ranking
    participant Cache as Redis/Memcached

    User->>App: Open Instagram
    App->>CDN: Request feed
    CDN->>Django: Cache miss - fetch feed
    Django->>Cache: Check feed cache
    Cache-->>Django: Cache miss
    Django->>Feed: Generate feed
    Feed->>TAO: Get following list
    TAO-->>Feed: User connections
    Feed->>PG: Fetch recent posts (parallel shards)
    PG-->>Feed: Posts from 4000+ shards
    Feed->>ML: Rank posts
    ML-->>Feed: Ranked feed
    Feed->>Cache: Cache feed
    Feed-->>Django: Feed response
    Django-->>CDN: Cache at edge
    CDN-->>App: Return feed
    App-->>User: Display feed

    Note over PG: Shard key: user_id mod 4000`,

    deployment: `flowchart TB
    subgraph Meta["Meta Infrastructure"]
        subgraph DC1["Data Center - US East"]
            subgraph PG1["PostgreSQL Cluster"]
                SHARD1["Shards 1-1000"]
                SHARD2["Shards 1001-2000"]
            end
            subgraph APP1["Application Tier"]
                DJANGO1["Django Workers"]
                UWSGI1["uWSGI Pool"]
            end
        end

        subgraph DC2["Data Center - US West"]
            subgraph PG2["PostgreSQL Cluster"]
                SHARD3["Shards 2001-3000"]
                SHARD4["Shards 3001-4000"]
            end
            subgraph APP2["Application Tier"]
                DJANGO2["Django Workers"]
                UWSGI2["uWSGI Pool"]
            end
        end

        subgraph Global["Global Layer"]
            FBCDN["Meta CDN"]
            TUPPERWARE["Tupperware<br/>Container Orchestration"]
        end
    end

    subgraph Monitoring["Observability"]
        SCUBA["Scuba<br/>Real-time Analytics"]
        ODS["ODS<br/>Time Series Metrics"]
        GATEKEEPER["Gatekeeper<br/>Feature Flags"]
    end

    Internet["2B Users"] --> FBCDN
    FBCDN --> APP1
    FBCDN --> APP2
    APP1 --> PG1
    APP2 --> PG2
    TUPPERWARE --> APP1
    TUPPERWARE --> APP2`,

    serviceInteraction: `flowchart LR
    subgraph Ingestion["Content Ingestion"]
        UPLOAD["Upload Service"]
        PROCESS["Media Processor"]
        TRANSCODE["Transcoder<br/>Multiple Resolutions"]
    end

    subgraph Storage["Storage Layer"]
        S3["Object Storage<br/>Photos/Videos"]
        CDN["CDN Cache"]
        PG[("PostgreSQL")]
    end

    subgraph Distribution["Content Distribution"]
        FEED["Feed Builder"]
        EXPLORE["Explore/Discover"]
        STORIES["Stories"]
        REELS["Reels"]
    end

    subgraph Social["Social Features"]
        LIKE["Likes/Comments"]
        DM["Direct Messages"]
        FOLLOW["Follow Graph"]
    end

    subgraph ML["ML Pipeline"]
        RANK["Ranking"]
        RECS["Recommendations"]
        SAFETY["Content Safety"]
    end

    UPLOAD --> PROCESS
    PROCESS --> TRANSCODE
    TRANSCODE --> S3
    S3 --> CDN

    FEED --> RANK
    EXPLORE --> RECS
    FEED --> PG
    STORIES --> S3

    LIKE --> PG
    DM --> PG
    FOLLOW --> TAO[("TAO")]

    SAFETY --> PROCESS`,
  },

  // Phase 2: Design Patterns Used
  patterns: [
    {
      patternSlug: 'database-sharding',
      patternName: 'PostgreSQL Sharding',
      usage: 'Horizontal scaling for 2B+ users',
      implementation: 'Custom sharding middleware distributing data across 4000+ PostgreSQL instances by user_id',
      scale: '4000+ shards, billions of rows',
    },
    {
      patternSlug: 'django-at-scale',
      patternName: 'Django at Scale',
      usage: 'Core application framework',
      implementation: 'Heavily optimized Django with custom middleware, connection pooling, and async views',
      scale: 'Largest Django deployment globally',
    },
    {
      patternSlug: 'social-graph',
      patternName: 'TAO Social Graph',
      usage: 'Storing and querying social relationships',
      implementation: 'Meta TAO system for graph queries - followers, following, connections with aggressive caching',
      scale: 'Trillions of edges',
    },
    {
      patternSlug: 'media-pipeline',
      patternName: 'Media Processing Pipeline',
      usage: 'Photo and video processing at scale',
      implementation: 'C++ based pipeline for transcoding, resizing, filtering with GPU acceleration',
      scale: '95M+ photos/day processed',
    },
    {
      patternSlug: 'ml-ranking',
      patternName: 'ML-Based Feed Ranking',
      usage: 'Personalized content delivery',
      implementation: 'PyTorch models predicting engagement, with real-time feature serving and online learning',
      scale: 'Billions of rankings/day',
    },
    {
      patternSlug: 'feature-flags',
      patternName: 'Feature Flags with Gatekeeper',
      usage: 'Controlled rollouts and A/B testing',
      implementation: 'Meta Gatekeeper for feature toggles, gradual rollouts, and experimentation framework',
      scale: 'Thousands of concurrent experiments',
    },
  ],

  // Phase 2: Technical Decisions (ADR-style)
  technicalDecisions: [
    {
      title: 'Why Django Instead of Java/Go',
      context: 'Instagram started as a small team needing rapid iteration on product features',
      decision: 'Stayed with Python/Django even at massive scale, investing in optimization instead of rewrite',
      consequences: [
        'Maintained rapid development velocity',
        'Large talent pool familiar with Python',
        'Required significant Python runtime optimization',
        'Custom Cython extensions for hot paths',
        'Proved Python can handle 2B+ users',
      ],
      alternatives: ['Java Spring', 'Go microservices', 'C++ services'],
      sources: ['https://instagram-engineering.com/web-service-efficiency-at-instagram-with-python-4976d078e366'],
    },
    {
      title: 'Why PostgreSQL Sharding Over NoSQL',
      context: 'Needed to scale relational data while maintaining consistency for financial and social features',
      decision: 'Built custom PostgreSQL sharding layer with 4000+ shards rather than adopting NoSQL',
      consequences: [
        'Maintained ACID guarantees for critical operations',
        'Leveraged existing SQL expertise',
        'Cross-shard queries became complex',
        'Required custom ORM extensions',
        'Consistent backup and recovery procedures',
      ],
      alternatives: ['Cassandra', 'DynamoDB', 'MongoDB', 'CockroachDB'],
      sources: ['https://instagram-engineering.com/'],
    },
    {
      title: 'Why React Native for Mobile',
      context: 'Needed to ship features simultaneously on iOS and Android with limited mobile team',
      decision: 'Early adopter of React Native, sharing 85%+ code between platforms',
      consequences: [
        'Faster feature development cycle',
        'Shared business logic across platforms',
        'Some native modules still required for performance',
        'Influenced React Native development at Meta',
        'Occasional platform-specific bugs',
      ],
      alternatives: ['Fully native iOS/Android', 'Flutter', 'Xamarin'],
      sources: ['https://engineering.fb.com/2016/08/09/android/react-native-bringing-modern-web-techniques-to-mobile/'],
    },
    {
      title: 'Why Cassandra for Time-Series Data',
      context: 'Feed data and activity streams require high write throughput with time-based queries',
      decision: 'Adopted Cassandra for time-series workloads alongside PostgreSQL for relational data',
      consequences: [
        'Excellent write throughput for activity feeds',
        'Natural time-based partitioning',
        'Eventually consistent - acceptable for feeds',
        'Separate operational expertise required',
        'Used for Stories, notifications, activity logs',
      ],
      alternatives: ['TimescaleDB', 'InfluxDB', 'Pure PostgreSQL'],
      sources: ['https://instagram-engineering.com/'],
    },
  ],

  lastUpdated: '2024-12-01',
  sources: ['https://instagram-engineering.com/', 'https://engineering.fb.com/'],
};
