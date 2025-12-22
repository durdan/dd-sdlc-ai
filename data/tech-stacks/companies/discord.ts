import { Company } from '../types';

export const discord: Company = {
  slug: 'discord',
  name: 'Discord',
  logo: '/tech-stacks/logos/discord.svg',
  description: 'Real-time communication platform with millions of concurrent voice, video, and text connections',
  category: 'communication',
  tags: ['communication', 'elixir', 'rust', 'websocket', 'real-time', 'cassandra', 'scylladb'],

  info: {
    founded: 2015,
    headquarters: 'San Francisco, CA',
    employees: '1,000+',
    revenue: '$500M+',
    publiclyTraded: false,
    website: 'https://discord.com',
  },

  metrics: {
    users: '150M+ monthly active users',
    monthlyActiveUsers: '150M+',
    uptime: '99.9%',
    latency: '<100ms message delivery',
    customMetrics: [
      { label: 'Concurrent Voice', value: 'Millions' },
      { label: 'Voice Regions', value: '30+' },
      { label: 'Messages/Day', value: 'Billions' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'React Native', category: 'framework', usage: 'primary' },
      { name: 'Electron', category: 'framework', usage: 'primary' },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
    ],
    backend: [
      { name: 'Elixir', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Rust', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Python', category: 'language', usage: 'primary' },
      { name: 'Go', category: 'language', usage: 'secondary' },
      { name: 'Phoenix', category: 'framework', usage: 'primary' },
    ],
    databases: [
      { name: 'Cassandra', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'ScyllaDB', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'PostgreSQL', category: 'database', usage: 'primary' },
      { name: 'Redis', category: 'cache', usage: 'primary' },
    ],
    infrastructure: [
      { name: 'GCP', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
      { name: 'Cloudflare', category: 'cdn', usage: 'primary' },
      { name: 'WebRTC', category: 'other', usage: 'primary' },
    ],
    devOps: [
      { name: 'GitHub Actions', category: 'ci-cd', usage: 'primary' },
      { name: 'Datadog', category: 'monitoring', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Redis Pub/Sub', category: 'queue', usage: 'primary', isPrimary: true },
    ],
    ml: [
      { name: 'Python ML', category: 'ml-framework', usage: 'primary' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: 'Elixir + Rust Real-Time Platform',
    htmlDiagram: {
      title: 'Discord Architecture',
      subtitle: 'Real-Time Communication at Scale',
      layers: [
        {
          id: 'clients',
          name: 'Client Apps',
          position: 'top',
          color: 'bg-indigo-100 border-indigo-300',
          items: [
            { id: 'desktop', name: 'Desktop', techStack: ['Electron', 'React'] },
            { id: 'mobile', name: 'Mobile', techStack: ['React Native'] },
            { id: 'web', name: 'Web', techStack: ['React'] },
          ],
        },
        {
          id: 'gateway',
          name: 'Gateway Layer',
          position: 'middle',
          color: 'bg-purple-100 border-purple-300',
          items: [
            { id: 'ws', name: 'WebSocket Gateway', techStack: ['Elixir'] },
            { id: 'voice', name: 'Voice Gateway', techStack: ['Rust'] },
          ],
        },
        {
          id: 'services',
          name: 'Core Services',
          position: 'middle',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'guilds', name: 'Guilds', techStack: ['Elixir'] },
            { id: 'messages', name: 'Messages', techStack: ['Elixir'] },
            { id: 'presence', name: 'Presence', techStack: ['Elixir'] },
          ],
        },
        {
          id: 'data',
          name: 'Data Layer',
          position: 'bottom',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'scylla', name: 'ScyllaDB', techStack: ['Messages'] },
            { id: 'postgres', name: 'PostgreSQL', techStack: ['Guilds'] },
            { id: 'redis', name: 'Redis', techStack: ['Cache', 'Presence'] },
          ],
        },
      ],
      connections: [
        { from: 'clients', to: 'gateway', type: 'api-call' },
        { from: 'gateway', to: 'services', type: 'data-flow' },
        { from: 'services', to: 'data', type: 'data-flow' },
      ],
    },
  },

  highlights: [
    {
      title: 'Elixir at Scale',
      description: 'Millions of concurrent WebSockets',
      impact: 'Each node handles millions of connections',
      technologies: ['Elixir', 'BEAM VM', 'Phoenix'],
      icon: 'Zap',
    },
    {
      title: 'Rust Voice',
      description: 'Low-latency voice processing',
      impact: '10x more users per server',
      technologies: ['Rust', 'WebRTC'],
      icon: 'Mic',
    },
    {
      title: 'ScyllaDB Migration',
      description: 'Moved from Cassandra to ScyllaDB',
      impact: 'Reduced latency, better performance',
      technologies: ['ScyllaDB', 'Cassandra'],
      icon: 'Database',
    },
  ],

  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Users["150M+ Users"]
        Desktop["Desktop - Electron"]
        Mobile["Mobile - React Native"]
        Web["Web - React"]
    end

    subgraph Gateway["Gateway Services"]
        WSGateway["WebSocket Gateway - Elixir"]
        VoiceGW["Voice Gateway - Rust"]
    end

    subgraph Core["Core Services"]
        Guilds["Guild Service"]
        Messages["Message Service"]
        Presence["Presence Service"]
    end

    subgraph Data["Data Layer"]
        ScyllaDB[("ScyllaDB - Messages")]
        Postgres[("PostgreSQL - Guilds")]
        Redis["Redis - Cache + Presence"]
    end

    Users --> Gateway
    Gateway --> Core
    Core --> Data`,

    dataFlow: `sequenceDiagram
    participant User
    participant WS as WebSocket Gateway
    participant MsgSvc as Message Service
    participant Cache as Redis
    participant DB as ScyllaDB
    participant PubSub as Pub/Sub

    User->>WS: Connect WebSocket
    WS->>Cache: Get user state
    WS-->>User: READY event

    User->>WS: Send message
    WS->>MsgSvc: Process message
    MsgSvc->>DB: Store message
    MsgSvc->>PubSub: Publish to channel
    PubSub->>WS: Fan out
    WS-->>User: MESSAGE_CREATE`,

    deployment: `flowchart TB
    subgraph GCP["GCP Infrastructure"]
        subgraph US["US Region"]
            USWS["WebSocket Cluster"]
            USVoice["Voice Servers"]
        end
        subgraph EU["Europe Region"]
            EUWS["WebSocket Cluster"]
            EUVoice["Voice Servers"]
        end
    end

    subgraph K8s["Kubernetes"]
        Gateway["Gateway Pods"]
        Services["Service Pods"]
    end

    K8s --> GCP`,

    serviceInteraction: `flowchart LR
    subgraph Client["Client"]
        WS["WebSocket"]
    end

    subgraph Gateway["Gateway"]
        Session["Session Manager"]
        RateLimit["Rate Limiter"]
    end

    subgraph Services["Services"]
        GuildSvc["Guild"]
        MsgSvc["Message"]
        VoiceSvc["Voice"]
    end

    subgraph Async["Async"]
        PubSub["Redis Pub/Sub"]
    end

    WS --> Gateway
    Gateway --> Services
    Services --> Async`,
  },

  patterns: [
    {
      patternSlug: 'actor-model',
      patternName: 'BEAM Actor Model',
      usage: 'Elixir GenServers for connections',
      implementation: 'Each session is a lightweight process',
      scale: 'Millions of concurrent processes',
    },
    {
      patternSlug: 'websocket-gateway',
      patternName: 'WebSocket Gateway',
      usage: 'Real-time bidirectional communication',
      implementation: 'Custom protocol with compression',
      scale: 'Millions of connections per node',
    },
  ],

  technicalDecisions: [
    {
      title: 'Why Elixir for Gateway',
      context: 'Needed millions of concurrent WebSocket connections',
      decision: 'Chose Elixir/BEAM for gateway and messaging',
      consequences: [
        'Millions of concurrent connections per node',
        'Fault-tolerant with supervisor trees',
        'Hot code reloading',
      ],
      alternatives: ['Node.js', 'Go', 'Java'],
      sources: ['https://discord.com/blog/how-discord-handles-millions-of-concurrent-voice-users-using-webrtc'],
    },
    {
      title: 'Why Rust for Voice',
      context: 'Voice processing needed native performance',
      decision: 'Built voice infrastructure in Rust',
      consequences: [
        'Sub-millisecond latency',
        'Memory safety without GC',
        '10x more users per server',
      ],
      alternatives: ['C++', 'Go'],
      sources: ['https://discord.com/blog/why-discord-is-switching-from-go-to-rust'],
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Monthly Active Users', value: '150M+', trend: 'up' },
      { label: 'Concurrent Voice', value: 'Millions', trend: 'up' },
    ],
    openSource: [
      {
        name: 'Discord.js',
        description: 'JavaScript Discord API library',
        url: 'https://github.com/discordjs/discord.js',
        stars: 24000,
        language: 'JavaScript',
      },
    ],
    engineeringBlog: 'https://discord.com/blog',
  },

  lastUpdated: '2024-12-01',
  sources: ['https://discord.com/blog', 'https://github.com/discord'],
};
