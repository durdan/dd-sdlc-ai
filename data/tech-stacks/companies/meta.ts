import { Company } from '../types';

export const meta: Company = {
  slug: 'meta',
  name: 'Meta (Facebook)',
  logo: '/tech-stacks/logos/meta.svg',
  description: 'Social media giant serving 3+ billion users with real-time feed, messaging, and content delivery at unprecedented scale',
  category: 'social-media',
  tags: ['social-media', 'react', 'graphql', 'php', 'hack', 'mysql', 'tao', 'pytorch'],

  info: {
    founded: 2004,
    headquarters: 'Menlo Park, CA',
    employees: '80,000+',
    revenue: '$117B+',
    publiclyTraded: true,
    ticker: 'META',
    website: 'https://meta.com',
  },

  metrics: {
    users: '3B+ monthly active users',
    monthlyActiveUsers: '3B+',
    dailyActiveUsers: '2B+',
    uptime: '99.99%',
    dataProcessed: '500+ TB/day new data',
    customMetrics: [
      { label: 'Photos Uploaded/Day', value: '350M+' },
      { label: 'TAO Graph Edges', value: '1T+' },
      { label: 'API Requests/sec', value: '100M+' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'React Native', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'Relay', category: 'library', usage: 'primary' },
      { name: 'GraphQL', category: 'framework', usage: 'primary' },
    ],
    backend: [
      { name: 'Hack', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'C++', category: 'language', usage: 'primary' },
      { name: 'Python', category: 'language', usage: 'primary' },
      { name: 'Rust', category: 'language', usage: 'secondary' },
      { name: 'Thrift', category: 'framework', usage: 'primary' },
    ],
    databases: [
      { name: 'MySQL', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'TAO', category: 'database', usage: 'primary', isPrimary: true, description: 'Social graph store' },
      { name: 'RocksDB', category: 'database', usage: 'primary' },
      { name: 'Memcache', category: 'cache', usage: 'primary' },
      { name: 'ZippyDB', category: 'database', usage: 'primary' },
    ],
    infrastructure: [
      { name: 'Custom Data Centers', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'HHVM', category: 'other', usage: 'primary' },
      { name: 'Tupperware', category: 'orchestration', usage: 'primary' },
    ],
    devOps: [
      { name: 'Sandcastle', category: 'ci-cd', usage: 'primary' },
      { name: 'Buck', category: 'ci-cd', usage: 'primary' },
      { name: 'ODS', category: 'monitoring', usage: 'primary' },
      { name: 'Scuba', category: 'analytics', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Presto', category: 'analytics', usage: 'primary', isPrimary: true },
      { name: 'Scribe', category: 'other', usage: 'primary' },
      { name: 'Hive', category: 'analytics', usage: 'primary' },
    ],
    ml: [
      { name: 'PyTorch', category: 'ml-framework', usage: 'primary', isPrimary: true },
      { name: 'FBLearner Flow', category: 'ml-framework', usage: 'primary' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: 'Massive Distributed System with TAO',
    htmlDiagram: {
      title: 'Meta Architecture',
      subtitle: 'Social Platform at Billion-User Scale',
      layers: [
        {
          id: 'clients',
          name: 'Client Layer (3B+ Users)',
          position: 'top',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'web', name: 'Web App', techStack: ['React', 'Relay'] },
            { id: 'mobile', name: 'Mobile Apps', techStack: ['React Native'] },
            { id: 'messenger', name: 'Messenger', techStack: ['React Native'] },
          ],
        },
        {
          id: 'api',
          name: 'API Layer',
          position: 'middle',
          color: 'bg-purple-100 border-purple-300',
          items: [
            { id: 'graphql', name: 'GraphQL Gateway', techStack: ['GraphQL', 'Relay'] },
            { id: 'thrift', name: 'Thrift Services', techStack: ['Thrift'] },
          ],
        },
        {
          id: 'services',
          name: 'Core Services',
          position: 'middle',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'feed', name: 'News Feed', techStack: ['ML Ranking'] },
            { id: 'social', name: 'Social Graph', techStack: ['TAO'] },
            { id: 'messenger', name: 'Messenger', techStack: ['E2E Encryption'] },
          ],
        },
        {
          id: 'data',
          name: 'Data Layer',
          position: 'bottom',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'mysql', name: 'MySQL', techStack: ['Sharded', '1000+ clusters'] },
            { id: 'tao', name: 'TAO', techStack: ['1T+ edges'] },
            { id: 'memcache', name: 'Memcache', techStack: ['1000+ servers'] },
          ],
        },
      ],
      connections: [
        { from: 'clients', to: 'api', type: 'api-call' },
        { from: 'api', to: 'services', type: 'data-flow' },
        { from: 'services', to: 'data', type: 'data-flow' },
      ],
    },
  },

  highlights: [
    {
      title: 'React Ecosystem',
      description: 'Created React for UI development',
      impact: 'Industry standard for web development',
      technologies: ['React', 'React Native', 'Relay'],
      icon: 'Code',
    },
    {
      title: 'TAO Graph Store',
      description: 'Distributed social graph storage',
      impact: '1 trillion+ edges with low latency',
      technologies: ['TAO', 'MySQL', 'Memcache'],
      icon: 'Database',
    },
    {
      title: 'PyTorch ML',
      description: 'Deep learning framework',
      impact: 'Powers ML across Meta and industry',
      technologies: ['PyTorch', 'FBLearner'],
      icon: 'Brain',
    },
  ],

  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Users["3 Billion Users"]
        WebApp["React Web"]
        RN["React Native Apps"]
    end

    subgraph API["API Gateway"]
        GQL["GraphQL Gateway"]
        Thrift["Thrift RPC"]
    end

    subgraph Services["Core Services"]
        NewsFeed["News Feed - ML Ranking"]
        Messenger["Messenger - E2E Encryption"]
        Groups["Groups - Community"]
    end

    subgraph DataLayer["Data Infrastructure"]
        TAO[("TAO - Social Graph - 1T+ edges")]
        MySQL[("MySQL - Sharded - 1000+ clusters")]
        Memcache["Memcache - 1000+ servers"]
    end

    subgraph MLPlatform["ML Platform"]
        PyTorch["PyTorch"]
        FBLearner["FBLearner - ML Workflow"]
    end

    Users --> API
    API --> Services
    Services --> DataLayer
    Services --> MLPlatform`,

    dataFlow: `sequenceDiagram
    participant User
    participant GraphQL as GraphQL Gateway
    participant Feed as News Feed Service
    participant TAO as TAO Graph
    participant ML as ML Ranking
    participant Cache as Memcache

    User->>GraphQL: GraphQL Query
    GraphQL->>Feed: Get Feed

    Feed->>Cache: Check cache
    Cache-->>Feed: Cache miss

    Feed->>TAO: Get social graph
    TAO-->>Feed: Friends, interests

    Feed->>ML: Rank content
    Note over ML: 10000+ signals
    ML-->>Feed: Ranked posts

    Feed->>Cache: Update cache
    Feed-->>GraphQL: Feed data
    GraphQL-->>User: Rendered feed`,

    deployment: `flowchart TB
    subgraph Global["Global Infrastructure"]
        subgraph DC1["Data Center - US West"]
            Web1["Web Tier"]
            App1["App Tier"]
            DB1["Database Tier"]
        end

        subgraph DC2["Data Center - Europe"]
            Web2["Web Tier"]
            App2["App Tier"]
            DB2["Database Tier"]
        end
    end

    subgraph Deploy["Deployment"]
        Sandcastle["Sandcastle CI"]
        Tupperware["Tupperware Orchestration"]
    end

    Deploy --> DC1
    Deploy --> DC2
    DC1 <--> DC2`,

    serviceInteraction: `flowchart LR
    subgraph Client["Client Layer"]
        React["React App"]
        Relay["Relay Client"]
    end

    subgraph Gateway["Gateway"]
        GQL["GraphQL Gateway"]
    end

    subgraph Services["Microservices"]
        UserSvc["User Service"]
        FeedSvc["Feed Service"]
        MsgSvc["Messenger"]
        AdsSvc["Ads Service"]
    end

    subgraph Data["Data Services"]
        TAO["TAO Graph"]
        MySQL["MySQL Clusters"]
    end

    React --> Relay
    Relay --> GQL
    GQL --> Services
    Services --> Data`,
  },

  patterns: [
    {
      patternSlug: 'graphql',
      patternName: 'GraphQL API',
      usage: 'Efficient data fetching',
      implementation: 'Single endpoint, client specifies exact data needs',
      scale: 'Billions of queries/day',
    },
    {
      patternSlug: 'tao-graph',
      patternName: 'TAO Graph Store',
      usage: 'Social graph queries',
      implementation: 'Distributed graph store over MySQL/cache',
      scale: '1 trillion+ edges',
    },
    {
      patternSlug: 'distributed-cache',
      patternName: 'Memcache at Scale',
      usage: 'Read optimization',
      implementation: '1000+ server pools with consistent hashing',
      scale: 'Trillions of operations/day',
    },
  ],

  technicalDecisions: [
    {
      title: 'Why Create React',
      context: 'Complex UI with frequent updates was hard to manage',
      decision: 'Built React with virtual DOM and component architecture',
      consequences: [
        'Declarative UI made code more predictable',
        'Virtual DOM enabled efficient updates',
        'Became industry standard',
      ],
      alternatives: ['Angular', 'Backbone', 'Custom framework'],
      sources: ['https://engineering.fb.com/2013/06/02/web/react-a-library-for-building-user-interfaces/'],
    },
    {
      title: 'Why Build TAO',
      context: 'MySQL joins too slow for social graph at scale',
      decision: 'Built TAO - distributed graph store over MySQL/cache',
      consequences: [
        'Efficient graph traversals',
        'Strong caching layer',
        'Handles 1 trillion+ edges',
      ],
      alternatives: ['Pure MySQL', 'Neo4j', 'Custom graph DB'],
      sources: ['https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson'],
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Monthly Active Users', value: '3B+', trend: 'up' },
      { label: 'Photos/Day', value: '350M+', trend: 'up' },
      { label: 'API Requests/sec', value: '100M+', trend: 'up' },
    ],
    openSource: [
      {
        name: 'React',
        description: 'UI library for building user interfaces',
        url: 'https://github.com/facebook/react',
        stars: 220000,
        language: 'JavaScript',
      },
      {
        name: 'PyTorch',
        description: 'Deep learning framework',
        url: 'https://github.com/pytorch/pytorch',
        stars: 75000,
        language: 'Python',
      },
      {
        name: 'GraphQL',
        description: 'Query language for APIs',
        url: 'https://github.com/graphql/graphql-js',
        stars: 20000,
        language: 'JavaScript',
      },
    ],
    engineeringBlog: 'https://engineering.fb.com',
  },

  lastUpdated: '2024-12-01',
  sources: ['https://engineering.fb.com', 'https://github.com/facebook'],
};
