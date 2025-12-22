import { Company } from '../types';

export const slack: Company = {
  slug: 'slack',
  name: 'Slack',
  logo: '/tech-stacks/logos/slack.svg',
  description: 'Cellular architecture enabling real-time messaging for millions of teams',
  category: 'communication',
  tags: ['messaging', 'real-time', 'collaboration', 'php', 'java', 'websockets'],

  info: {
    founded: 2013,
    headquarters: 'San Francisco, CA',
    employees: '2,500+',
    revenue: '$1.5B+',
    publiclyTraded: false,
    website: 'https://slack.com',
  },

  metrics: {
    dailyActiveUsers: '20M+',
    users: '65M+ weekly active users',
    requestsPerSecond: '100K+',
    uptime: '99.99%',
    latency: '<50ms',
    customMetrics: [
      { label: 'Messages/Day', value: '1.5B+' },
      { label: 'Paid Customers', value: '200K+' },
      { label: 'Apps Installed', value: '2,600+' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
      { name: 'Electron', category: 'framework', usage: 'primary' },
      { name: 'Redux', category: 'library', usage: 'primary' },
    ],
    backend: [
      { name: 'PHP', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Java', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Go', category: 'language', usage: 'secondary' },
      { name: 'Hack', category: 'language', usage: 'primary' },
    ],
    databases: [
      { name: 'MySQL', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'Vitess', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'Redis', category: 'cache', usage: 'primary' },
      { name: 'Solr', category: 'search', usage: 'primary' },
      { name: 'Memcached', category: 'cache', usage: 'primary' },
    ],
    infrastructure: [
      { name: 'AWS', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
      { name: 'Docker', category: 'container', usage: 'primary' },
    ],
    devOps: [
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
      { name: 'Jenkins', category: 'ci-cd', usage: 'primary' },
      { name: 'Datadog', category: 'monitoring', usage: 'primary' },
      { name: 'PagerDuty', category: 'monitoring', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Apache Kafka', category: 'queue', usage: 'primary', isPrimary: true },
      { name: 'Apache Spark', category: 'analytics', usage: 'primary' },
      { name: 'Presto', category: 'analytics', usage: 'primary' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: 'Cellular Architecture',
    htmlDiagram: {
      title: 'Slack Real-Time Architecture',
      subtitle: 'WebSocket-Powered Messaging',
      layers: [
        {
          id: 'clients',
          name: 'Client Applications',
          position: 'top',
          color: 'bg-purple-100 border-purple-300',
          items: [
            { id: 'desktop', name: 'Desktop (Electron)', techStack: ['React', 'TypeScript'] },
            { id: 'mobile', name: 'Mobile Apps', techStack: ['Native'] },
            { id: 'web', name: 'Web App', techStack: ['React'] },
          ],
        },
        {
          id: 'realtime',
          name: 'Real-Time Layer',
          position: 'top',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'ws', name: 'WebSocket Gateway', techStack: ['Java', 'Netty'] },
            { id: 'pub', name: 'Pub/Sub', techStack: ['Kafka'] },
          ],
        },
        {
          id: 'services',
          name: 'Core Services',
          position: 'middle',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'msg', name: 'Messages', techStack: ['PHP', 'MySQL'] },
            { id: 'channels', name: 'Channels', techStack: ['PHP', 'Vitess'] },
            { id: 'search', name: 'Search', techStack: ['Java', 'Solr'] },
            { id: 'files', name: 'Files', techStack: ['S3'] },
          ],
        },
        {
          id: 'data',
          name: 'Data Layer',
          position: 'bottom',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'vitess', name: 'Vitess/MySQL', techStack: ['Sharded'] },
            { id: 'redis', name: 'Redis', techStack: ['Caching'] },
            { id: 'kafka', name: 'Kafka', techStack: ['Events'] },
          ],
        },
      ],
      connections: [
        { from: 'clients', to: 'realtime', type: 'async', label: 'WebSocket' },
        { from: 'realtime', to: 'services', type: 'event' },
        { from: 'services', to: 'data', type: 'data-flow' },
      ],
    },
    mermaidDiagram: `graph TB
    subgraph "Clients"
        DESK[Desktop App]
        WEB[Web App]
        MOB[Mobile Apps]
    end

    subgraph "Edge"
        LB[Load Balancer]
        WS[WebSocket Gateway]
    end

    subgraph "API Services"
        MSG[Message Service]
        CHAN[Channel Service]
        USER[User Service]
        SRCH[Search Service]
        FILE[File Service]
    end

    subgraph "Real-Time"
        KAFKA{{Kafka}}
        PUBSUB[Pub/Sub]
    end

    subgraph "Storage"
        VITESS[(Vitess/MySQL)]
        REDIS[Redis Cache]
        SOLR[Solr Search]
        S3[S3 Files]
    end

    DESK --> WS
    WEB --> WS
    MOB --> WS

    WS --> PUBSUB
    PUBSUB --> KAFKA

    WS --> MSG
    WS --> CHAN
    WS --> SRCH

    MSG --> VITESS
    MSG --> REDIS
    CHAN --> VITESS
    SRCH --> SOLR
    FILE --> S3`,
    components: [
      {
        name: 'WebSocket Gateway',
        description: 'Real-time bidirectional communication layer handling millions of concurrent connections',
        responsibilities: ['Connection management', 'Message routing', 'Presence tracking', 'Reconnection handling'],
        technologies: ['Java', 'Netty', 'WebSocket'],
      },
      {
        name: 'Vitess Database Layer',
        description: 'Horizontal sharding solution for MySQL enabling massive scale',
        responsibilities: ['Data sharding', 'Query routing', 'Connection pooling', 'Schema management'],
        technologies: ['Vitess', 'MySQL', 'Go'],
      },
    ],
  },

  highlights: [
    {
      title: 'Real-Time Messaging',
      description: 'Sub-50ms message delivery to millions of users',
      impact: '1.5B+ messages delivered daily',
      technologies: ['WebSocket', 'Kafka', 'Java'],
      icon: 'MessageSquare',
    },
    {
      title: 'Vitess at Scale',
      description: 'MySQL sharding handling billions of rows',
      impact: 'Horizontally scalable relational storage',
      technologies: ['Vitess', 'MySQL', 'Kubernetes'],
      icon: 'Database',
    },
    {
      title: 'Electron Desktop',
      description: 'Cross-platform desktop app with native-like performance',
      impact: 'Consistent experience across Windows, Mac, Linux',
      technologies: ['Electron', 'React', 'TypeScript'],
      icon: 'Monitor',
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Daily Active Users', value: '20M+', trend: 'up' },
      { label: 'Messages/Day', value: '1.5B+', trend: 'up' },
      { label: 'Workspaces', value: '750K+', trend: 'up' },
    ],
    innovationAreas: [
      {
        name: 'Slack Connect',
        description: 'Secure communication between organizations',
        technologies: ['Federation', 'E2E Encryption'],
        yearStarted: 2020,
      },
      {
        name: 'Workflow Builder',
        description: 'No-code automation within Slack',
        technologies: ['Visual Programming', 'Integrations'],
        yearStarted: 2019,
      },
    ],
    openSource: [
      {
        name: 'nebula',
        description: 'Scalable overlay networking tool',
        url: 'https://github.com/slackhq/nebula',
        stars: 13000,
        language: 'Go',
      },
    ],
    engineeringBlog: 'https://slack.engineering/',
  },

  // Phase 2: Detailed Architecture Diagrams
  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Clients["Client Applications"]
        DESK["Desktop App<br/>Electron + React"]
        WEB["Web App<br/>React SPA"]
        MOB["Mobile Apps<br/>Native iOS/Android"]
    end

    subgraph Edge["Edge Layer"]
        LB["Load Balancers<br/>AWS ALB"]
        WS["WebSocket Gateway<br/>Java + Netty"]
    end

    subgraph API["API Gateway"]
        GATEWAY["API Gateway<br/>Rate Limiting + Auth"]
        ROUTER["Request Router<br/>Service Discovery"]
    end

    subgraph Services["Core Services - Cellular Architecture"]
        MSG["Message Service<br/>PHP + Hack"]
        CHAN["Channel Service<br/>PHP + Hack"]
        USER["User Service<br/>Java"]
        SEARCH["Search Service<br/>Java + Solr"]
        FILE["File Service<br/>Go + S3"]
        PRES["Presence Service<br/>Java"]
    end

    subgraph RealTime["Real-Time Layer"]
        PUBSUB["Pub/Sub System<br/>Custom Implementation"]
        KAFKA[/"Kafka<br/>1.5B+ msgs/day"/]
    end

    subgraph Data["Data Layer"]
        VITESS[("Vitess<br/>Sharded MySQL")]
        REDIS["Redis Cluster<br/>Caching + Sessions"]
        SOLR[("Solr<br/>Full-Text Search")]
        S3["S3<br/>File Storage"]
        MEMCACHE["Memcached<br/>Hot Data Cache"]
    end

    Clients --> Edge
    Edge --> API
    API --> Services
    Services --> RealTime
    Services --> Data
    RealTime --> WS`,

    dataFlow: `sequenceDiagram
    participant User
    participant Desktop as Desktop Client
    participant WS as WebSocket Gateway
    participant Kafka as Kafka
    participant MsgSvc as Message Service
    participant Vitess as Vitess DB
    participant Redis as Redis Cache
    participant PubSub as Pub/Sub
    participant Recipient as Recipient Client

    User->>Desktop: Type message
    Desktop->>WS: Send via WebSocket
    WS->>MsgSvc: Route to Message Service
    MsgSvc->>Vitess: Persist message
    Vitess-->>MsgSvc: Confirmed
    MsgSvc->>Kafka: Publish event
    MsgSvc->>Redis: Update cache
    MsgSvc-->>WS: ACK to sender
    WS-->>Desktop: Delivery confirmed

    Kafka->>PubSub: Fan out to channels
    PubSub->>WS: Push to connected clients
    WS->>Recipient: Deliver message

    Note over Kafka,PubSub: Sub-50ms delivery latency`,

    deployment: `flowchart TB
    subgraph AWS["AWS Infrastructure"]
        subgraph Region1["US-East Region"]
            subgraph AZ1["Availability Zone 1"]
                K8S1["Kubernetes Cluster"]
                DB1[("Vitess Primary")]
            end
            subgraph AZ2["Availability Zone 2"]
                K8S2["Kubernetes Cluster"]
                DB2[("Vitess Replica")]
            end
        end

        subgraph Region2["US-West Region"]
            subgraph AZ3["Availability Zone 3"]
                K8S3["Kubernetes Cluster"]
                DB3[("Vitess Replica")]
            end
        end

        subgraph Global["Global Services"]
            CF["CloudFront CDN"]
            R53["Route 53 DNS"]
            WAF["AWS WAF"]
        end
    end

    subgraph Monitoring["Observability"]
        DD["Datadog"]
        PD["PagerDuty"]
        LOGS["Log Aggregation"]
    end

    Internet["Internet"] --> CF
    CF --> R53
    R53 --> WAF
    WAF --> K8S1
    WAF --> K8S2
    WAF --> K8S3

    K8S1 --> DD
    K8S2 --> DD
    K8S3 --> DD
    DD --> PD`,

    serviceInteraction: `flowchart LR
    subgraph Client["Client Layer"]
        APP["Slack Apps"]
    end

    subgraph Gateway["Gateway"]
        WSGW["WebSocket<br/>Gateway"]
        APIGW["REST API<br/>Gateway"]
    end

    subgraph Core["Core Services"]
        MSG["Messages"]
        CHAN["Channels"]
        USER["Users"]
        TEAM["Teams"]
    end

    subgraph Support["Support Services"]
        SRCH["Search"]
        FILE["Files"]
        PRES["Presence"]
        NOTIFY["Notifications"]
    end

    subgraph Async["Async Processing"]
        KAFKA[/"Kafka"/]
        WORKER["Background Workers"]
    end

    APP --> WSGW
    APP --> APIGW

    WSGW --> MSG
    WSGW --> PRES
    APIGW --> CHAN
    APIGW --> USER
    APIGW --> TEAM

    MSG --> SRCH
    MSG --> NOTIFY
    MSG --> KAFKA
    CHAN --> FILE

    KAFKA --> WORKER
    WORKER --> SRCH`,
  },

  // Phase 2: Design Patterns Used
  patterns: [
    {
      patternSlug: 'cellular-architecture',
      patternName: 'Cellular Architecture',
      usage: 'Core isolation strategy for workspace data',
      implementation: 'Each workspace is a cell with isolated data storage, enabling independent scaling and fault isolation',
      scale: '750K+ workspaces in isolated cells',
    },
    {
      patternSlug: 'websocket-gateway',
      patternName: 'WebSocket Gateway Pattern',
      usage: 'Real-time bidirectional communication',
      implementation: 'Netty-based Java gateway handling millions of concurrent WebSocket connections with heartbeats and reconnection logic',
      scale: '20M+ concurrent connections',
    },
    {
      patternSlug: 'database-sharding',
      patternName: 'Database Sharding with Vitess',
      usage: 'Horizontal scaling of MySQL',
      implementation: 'Vitess provides transparent sharding, connection pooling, and query routing for MySQL at scale',
      scale: 'Billions of messages stored',
    },
    {
      patternSlug: 'event-driven-architecture',
      patternName: 'Event-Driven Architecture',
      usage: 'Decoupled service communication',
      implementation: 'Kafka-based event bus for async operations like search indexing, notifications, and analytics',
      scale: '1.5B+ messages/day processed',
    },
    {
      patternSlug: 'cqrs',
      patternName: 'CQRS',
      usage: 'Separated read/write paths for messages',
      implementation: 'Writes go to Vitess, reads served from Redis cache for hot channels, Solr for search',
      scale: 'Sub-50ms read latency',
    },
    {
      patternSlug: 'presence-service',
      patternName: 'Distributed Presence',
      usage: 'Real-time online status tracking',
      implementation: 'Dedicated presence service with Redis backing, aggregating status across multiple client connections per user',
      scale: '65M+ users tracked',
    },
  ],

  // Phase 2: Technical Decisions (ADR-style)
  technicalDecisions: [
    {
      title: 'Why Vitess Over Native MySQL Sharding',
      context: 'Slack needed to scale MySQL beyond single-server limits while maintaining ACID guarantees and existing ORM compatibility',
      decision: 'Adopted Vitess for transparent horizontal sharding with MySQL protocol compatibility',
      consequences: [
        'Maintained existing PHP/MySQL codebase without rewrites',
        'Transparent connection pooling reduced DB connections by 90%',
        'Cross-shard queries require careful query design',
        'Gained automatic resharding capabilities',
      ],
      alternatives: ['CockroachDB', 'Native MySQL sharding', 'PostgreSQL Citus'],
      sources: ['https://slack.engineering/scaling-datastores-at-slack-with-vitess/'],
    },
    {
      title: 'Why PHP and Hack for Core Services',
      context: 'Started with PHP for rapid development, needed type safety and performance at scale',
      decision: 'Migrated critical paths to Hack (PHP with static typing) while keeping PHP for less critical services',
      consequences: [
        'Type safety caught bugs before production',
        'Async/await improved concurrency handling',
        'Maintained developer familiarity',
        'HHVM provided JIT compilation performance gains',
      ],
      alternatives: ['Full Go rewrite', 'Java migration', 'Stay pure PHP'],
      sources: ['https://slack.engineering/'],
    },
    {
      title: 'Why Java and Netty for WebSocket Gateway',
      context: 'Needed to handle millions of concurrent long-lived WebSocket connections efficiently',
      decision: 'Built custom WebSocket gateway using Java with Netty for non-blocking I/O',
      consequences: [
        'Single server handles 100K+ concurrent connections',
        'Low memory footprint per connection',
        'Required deep networking expertise',
        'Enabled custom protocol optimizations',
      ],
      alternatives: ['Node.js with Socket.io', 'Go with Gorilla WebSocket', 'Erlang/Elixir'],
      sources: ['https://slack.engineering/'],
    },
    {
      title: 'Why Cellular Architecture',
      context: 'Large enterprise customers needed isolation guarantees and independent scaling',
      decision: 'Implemented cellular architecture where each workspace cell is isolated with dedicated resources',
      consequences: [
        'Failure in one cell does not affect others',
        'Enterprise customers get guaranteed resources',
        'Increased operational complexity',
        'Enabled compliance certifications (SOC2, HIPAA)',
      ],
      alternatives: ['Shared multi-tenant', 'Kubernetes namespaces only', 'Dedicated deployments'],
      sources: ['https://slack.engineering/'],
    },
  ],

  lastUpdated: '2024-12-01',
  sources: ['https://slack.engineering/', 'https://github.com/slackhq'],
};
