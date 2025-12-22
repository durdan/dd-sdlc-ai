import { Company } from '../types';

export const whatsapp: Company = {
  slug: 'whatsapp',
  name: 'WhatsApp',
  logo: '/tech-stacks/logos/whatsapp.svg',
  description: 'Minimalist Erlang/BEAM architecture serving 2B+ users with extreme efficiency',
  category: 'communication',
  tags: ['messaging', 'erlang', 'beam', 'real-time', 'encryption', 'mobile'],

  info: {
    founded: 2009,
    headquarters: 'Menlo Park, CA',
    employees: '1,000+',
    revenue: 'Part of Meta',
    publiclyTraded: true,
    ticker: 'META',
    website: 'https://whatsapp.com',
  },

  metrics: {
    users: '2B+ users',
    dailyActiveUsers: '2B+',
    uptime: '99.999%',
    latency: '<100ms',
    customMetrics: [
      { label: 'Messages/Day', value: '100B+' },
      { label: 'Engineers (2014)', value: '50' },
      { label: 'Users per Engineer', value: '40M' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React Native', category: 'framework', usage: 'primary' },
      { name: 'React', category: 'framework', usage: 'primary' },
    ],
    backend: [
      { name: 'Erlang', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'BEAM VM', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'FreeBSD', category: 'other', usage: 'primary' },
      { name: 'Yaws', category: 'framework', usage: 'primary' },
    ],
    databases: [
      { name: 'Mnesia', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'DETS', category: 'database', usage: 'primary' },
      { name: 'PostgreSQL', category: 'database', usage: 'secondary' },
    ],
    infrastructure: [
      { name: 'Custom Data Centers', category: 'container', usage: 'primary' },
      { name: 'FreeBSD', category: 'other', usage: 'primary', isPrimary: true },
      { name: 'SoftLayer', category: 'container', usage: 'primary' },
    ],
    devOps: [
      { name: 'Custom Erlang Tools', category: 'monitoring', usage: 'primary' },
      { name: 'Hot Code Loading', category: 'ci-cd', usage: 'primary', isPrimary: true },
    ],
    security: [
      { name: 'Signal Protocol', category: 'security', usage: 'primary', isPrimary: true },
      { name: 'E2E Encryption', category: 'security', usage: 'primary' },
    ],
  },

  architecture: {
    type: 'monolith',
    style: 'distributed',
    description: 'Minimalist Erlang/BEAM',
    htmlDiagram: {
      title: 'WhatsApp Architecture',
      subtitle: 'Erlang-Powered Messaging',
      layers: [
        {
          id: 'clients',
          name: 'Mobile Clients',
          position: 'top',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'ios', name: 'iOS', techStack: ['Objective-C', 'Swift'] },
            { id: 'android', name: 'Android', techStack: ['Java', 'Kotlin'] },
            { id: 'web', name: 'WhatsApp Web', techStack: ['React'] },
          ],
        },
        {
          id: 'gateway',
          name: 'Connection Layer',
          position: 'top',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'xmpp', name: 'Custom XMPP Protocol', techStack: ['Erlang', 'TLS'] },
          ],
        },
        {
          id: 'services',
          name: 'Erlang Backend',
          position: 'middle',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'msg', name: 'Message Router', techStack: ['Erlang', 'BEAM'] },
            { id: 'presence', name: 'Presence', techStack: ['Erlang'] },
            { id: 'media', name: 'Media Server', techStack: ['Erlang'] },
            { id: 'group', name: 'Group Messaging', techStack: ['Erlang'] },
          ],
        },
        {
          id: 'data',
          name: 'Data Layer',
          position: 'bottom',
          color: 'bg-purple-100 border-purple-300',
          items: [
            { id: 'mnesia', name: 'Mnesia', techStack: ['Distributed DB'] },
            { id: 'files', name: 'Media Storage', techStack: ['FreeBSD'] },
          ],
        },
      ],
      connections: [
        { from: 'clients', to: 'gateway', type: 'async', label: 'E2E Encrypted' },
        { from: 'gateway', to: 'services', type: 'event' },
        { from: 'services', to: 'data', type: 'data-flow' },
      ],
    },
    mermaidDiagram: `graph TB
    subgraph "Clients"
        IOS[iOS App]
        AND[Android App]
        WEB[WhatsApp Web]
        DESK[Desktop App]
    end

    subgraph "Connection"
        XMPP[Custom XMPP Protocol]
        TLS[TLS 1.3]
        E2E[Signal Protocol E2E]
    end

    subgraph "Erlang Backend"
        ROUTE[Message Router]
        PRES[Presence Service]
        MEDIA[Media Service]
        GROUP[Group Service]
        STATUS[Status Service]
    end

    subgraph "Storage"
        MNESIA[(Mnesia DB)]
        MEDIA_S[Media Storage]
    end

    subgraph "Infrastructure"
        BEAM[BEAM VM]
        FREEBSD[FreeBSD]
    end

    IOS --> XMPP
    AND --> XMPP
    WEB --> XMPP
    XMPP --> TLS
    TLS --> E2E

    E2E --> ROUTE
    ROUTE --> PRES
    ROUTE --> MEDIA
    ROUTE --> GROUP
    ROUTE --> STATUS

    ROUTE --> MNESIA
    MEDIA --> MEDIA_S

    ROUTE --> BEAM
    BEAM --> FREEBSD`,
    components: [
      {
        name: 'BEAM Virtual Machine',
        description: 'Erlang VM enabling massive concurrency with lightweight processes',
        responsibilities: ['Process management', 'Fault tolerance', 'Hot code loading', 'Distribution'],
        technologies: ['Erlang', 'BEAM', 'OTP'],
      },
      {
        name: 'Signal Protocol',
        description: 'End-to-end encryption for all messages and calls',
        responsibilities: ['Key exchange', 'Message encryption', 'Forward secrecy'],
        technologies: ['Curve25519', 'AES-256', 'HMAC-SHA256'],
      },
    ],
  },

  highlights: [
    {
      title: 'Erlang Efficiency',
      description: '2B users served by ~50 engineers in 2014',
      impact: '40 million users per engineer - industry record',
      technologies: ['Erlang', 'BEAM', 'FreeBSD'],
      icon: 'Zap',
    },
    {
      title: 'E2E Encryption',
      description: 'First major platform with default E2E encryption',
      impact: 'Set industry standard for messaging privacy',
      technologies: ['Signal Protocol', 'Cryptography'],
      icon: 'Shield',
    },
    {
      title: 'Hot Code Loading',
      description: 'Update production without restarting',
      impact: 'Zero downtime deployments',
      technologies: ['Erlang OTP', 'BEAM'],
      icon: 'RefreshCw',
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Daily Active Users', value: '2B+', trend: 'stable' },
      { label: 'Messages/Day', value: '100B+', trend: 'up' },
      { label: 'Countries', value: '180+', trend: 'stable' },
    ],
    innovationAreas: [
      {
        name: 'Erlang at Scale',
        description: 'Proved Erlang can handle 2B+ users with minimal team',
        technologies: ['Erlang', 'BEAM', 'OTP'],
        yearStarted: 2009,
      },
      {
        name: 'WhatsApp Business',
        description: 'Enterprise messaging platform',
        technologies: ['API', 'Chatbots', 'Commerce'],
        yearStarted: 2018,
      },
    ],
    openSource: [],
    engineeringBlog: 'https://engineering.fb.com/tag/whatsapp/',
  },

  // Phase 2: Detailed Architecture Diagrams
  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Clients["Mobile-First Clients"]
        IOS["iOS App<br/>Objective-C/Swift"]
        AND["Android App<br/>Java/Kotlin"]
        WEB["WhatsApp Web<br/>React"]
        DESK["Desktop Apps<br/>Electron"]
    end

    subgraph Connection["Connection Layer"]
        NOISE["Noise Protocol<br/>Key Exchange"]
        XMPP["Custom XMPP<br/>Optimized Protocol"]
        TLS["TLS 1.3<br/>Transport Security"]
    end

    subgraph Encryption["End-to-End Encryption"]
        SIGNAL["Signal Protocol<br/>E2E Encryption"]
        KEYS["Key Management<br/>Prekeys + Sessions"]
    end

    subgraph ErlangBackend["Erlang Backend - BEAM VM"]
        ROUTE["Message Router<br/>Erlang Processes"]
        PRES["Presence Service<br/>Online Status"]
        GROUP["Group Messaging<br/>Fan-out Logic"]
        MEDIA["Media Service<br/>Upload/Download"]
        STATUS["Status Stories<br/>24hr Expiry"]
        CALL["Voice/Video<br/>WebRTC Signaling"]
    end

    subgraph Storage["Storage Layer"]
        MNESIA[("Mnesia<br/>Distributed Erlang DB")]
        MEDIA_S["Media Storage<br/>Encrypted Blobs"]
        DETS["DETS<br/>Disk-based Tables"]
    end

    subgraph Infra["Infrastructure"]
        BEAM["BEAM VM<br/>Lightweight Processes"]
        FREEBSD["FreeBSD<br/>Optimized Kernel"]
    end

    Clients --> Connection
    Connection --> Encryption
    Encryption --> ErlangBackend
    ErlangBackend --> Storage
    ErlangBackend --> Infra`,

    dataFlow: `sequenceDiagram
    participant Sender as Sender Phone
    participant SClient as Sender Client
    participant Server as Erlang Server
    participant RClient as Recipient Client
    participant Receiver as Recipient Phone

    Note over Sender,Receiver: End-to-End Encrypted - Server cannot read messages

    Sender->>SClient: Compose message
    SClient->>SClient: Encrypt with Signal Protocol
    SClient->>Server: Send encrypted blob
    Server->>Server: Store if recipient offline
    Server->>RClient: Forward encrypted message
    RClient->>RClient: Decrypt with Signal Protocol
    RClient->>Receiver: Display message

    Note over Server: Server only sees:<br/>- Sender/recipient IDs<br/>- Encrypted blob<br/>- Timestamp

    Sender->>SClient: Send media
    SClient->>SClient: Encrypt media file
    SClient->>Server: Upload encrypted media
    Server-->>SClient: Return media URL
    SClient->>Server: Send message with URL
    Server->>RClient: Forward message
    RClient->>Server: Download encrypted media
    RClient->>RClient: Decrypt and display`,

    deployment: `flowchart TB
    subgraph Meta["Meta Infrastructure"]
        subgraph DC1["Data Center 1"]
            subgraph Erlang1["Erlang Cluster"]
                NODE1["BEAM Node 1<br/>Millions of processes"]
                NODE2["BEAM Node 2<br/>Millions of processes"]
                NODE3["BEAM Node 3<br/>Millions of processes"]
            end
            subgraph Store1["Storage"]
                MN1[("Mnesia<br/>Replicated")]
            end
        end

        subgraph DC2["Data Center 2"]
            subgraph Erlang2["Erlang Cluster"]
                NODE4["BEAM Node 4"]
                NODE5["BEAM Node 5"]
                NODE6["BEAM Node 6"]
            end
            subgraph Store2["Storage"]
                MN2[("Mnesia<br/>Replicated")]
            end
        end

        LB["Load Balancers<br/>Global Distribution"]
    end

    subgraph Operations["Operations"]
        HOT["Hot Code Loading<br/>Zero Downtime"]
        OTP["OTP Supervisors<br/>Self-Healing"]
    end

    Users["2B Users"] --> LB
    LB --> Erlang1
    LB --> Erlang2
    Erlang1 <--> Erlang2
    Store1 <--> Store2
    HOT --> Erlang1
    HOT --> Erlang2`,

    serviceInteraction: `flowchart LR
    subgraph Client["Client Layer"]
        APP["WhatsApp App"]
    end

    subgraph Protocol["Protocol Layer"]
        XMPP["XMPP Connection"]
        SIGNAL["Signal Encryption"]
    end

    subgraph Core["Core Services"]
        MSG["Messaging"]
        GRP["Groups"]
        PRES["Presence"]
    end

    subgraph Extended["Extended Services"]
        STATUS["Status"]
        CALL["Calls"]
        MEDIA["Media"]
        BIZ["Business API"]
    end

    subgraph Support["Support"]
        SPAM["Anti-Spam"]
        REPORT["Reporting"]
    end

    APP --> XMPP
    XMPP --> SIGNAL
    SIGNAL --> MSG
    SIGNAL --> GRP
    SIGNAL --> CALL

    MSG --> PRES
    GRP --> MSG
    STATUS --> MEDIA
    CALL --> MEDIA

    MSG --> SPAM
    GRP --> REPORT
    BIZ --> MSG`,
  },

  // Phase 2: Design Patterns Used
  patterns: [
    {
      patternSlug: 'actor-model',
      patternName: 'Actor Model with BEAM',
      usage: 'Concurrent message processing',
      implementation: 'Erlang lightweight processes (actors) handling millions of concurrent connections with message passing',
      scale: '2B users on minimal servers',
    },
    {
      patternSlug: 'e2e-encryption',
      patternName: 'End-to-End Encryption',
      usage: 'Message privacy',
      implementation: 'Signal Protocol with Double Ratchet algorithm, forward secrecy, and deniable authentication',
      scale: '100B+ encrypted messages/day',
    },
    {
      patternSlug: 'hot-code-loading',
      patternName: 'Hot Code Loading',
      usage: 'Zero-downtime deployments',
      implementation: 'Erlang OTP allows updating running code without stopping the system or dropping connections',
      scale: 'Zero downtime updates',
    },
    {
      patternSlug: 'supervision-trees',
      patternName: 'OTP Supervision Trees',
      usage: 'Fault tolerance',
      implementation: 'Erlang supervisors automatically restart failed processes, enabling self-healing systems',
      scale: '99.999% uptime',
    },
    {
      patternSlug: 'minimalist-architecture',
      patternName: 'Minimalist Architecture',
      usage: 'Engineering efficiency',
      implementation: 'Small team philosophy - 50 engineers serving 2B users by choosing right technology and avoiding complexity',
      scale: '40M users per engineer',
    },
    {
      patternSlug: 'distributed-database',
      patternName: 'Mnesia Distributed Database',
      usage: 'User data storage',
      implementation: 'Erlang native distributed database with real-time replication and in-memory performance',
      scale: 'Billions of user records',
    },
  ],

  // Phase 2: Technical Decisions (ADR-style)
  technicalDecisions: [
    {
      title: 'Why Erlang and BEAM Virtual Machine',
      context: 'Needed to handle millions of concurrent long-lived connections with minimal resources and high reliability',
      decision: 'Chose Erlang/OTP running on BEAM VM for its lightweight process model and fault tolerance',
      consequences: [
        'Single server handles 2M+ connections',
        'Lightweight processes (2KB each vs MB for threads)',
        'Built-in distribution for clustering',
        'Small talent pool for Erlang developers',
        'Proved massive scale possible with right tech choices',
      ],
      alternatives: ['Java NIO', 'Node.js', 'C++ with custom runtime'],
      sources: ['https://www.wired.com/2015/09/whatsapp-serves-900-million-users-50-engineers/'],
    },
    {
      title: 'Why FreeBSD Over Linux',
      context: 'Needed optimal network performance for millions of concurrent connections',
      decision: 'Chose FreeBSD for superior network stack performance with many concurrent connections',
      consequences: [
        'Better performance for high connection counts',
        'Excellent ZFS filesystem support',
        'Smaller community than Linux',
        'Required specific kernel tuning expertise',
        'Consistent performance under load',
      ],
      alternatives: ['Linux', 'Custom OS', 'Solaris'],
      sources: ['https://engineering.fb.com/tag/whatsapp/'],
    },
    {
      title: 'Why Signal Protocol for Encryption',
      context: 'Users demanded privacy, and WhatsApp wanted to be first major platform with default E2E encryption',
      decision: 'Partnered with Open Whisper Systems to implement Signal Protocol for all messages',
      consequences: [
        'First major platform with default E2E encryption',
        'Forward secrecy protects past messages',
        'Set industry standard for messaging privacy',
        'Cannot comply with some government requests',
        'Slight latency increase for key exchange',
      ],
      alternatives: ['Custom encryption', 'PGP', 'No encryption'],
      sources: ['https://signal.org/blog/whatsapp-complete/'],
    },
    {
      title: 'Why Mnesia for Data Storage',
      context: 'Needed distributed database that integrates natively with Erlang for user session and presence data',
      decision: 'Used Mnesia, Erlang built-in distributed database, for real-time data with DETS for persistence',
      consequences: [
        'Native Erlang integration, no serialization overhead',
        'Real-time replication across nodes',
        'In-memory performance with disk persistence',
        'Limited query capabilities vs SQL',
        'Tight coupling with Erlang ecosystem',
      ],
      alternatives: ['Cassandra', 'Redis', 'Custom solution'],
      sources: ['https://engineering.fb.com/tag/whatsapp/'],
    },
  ],

  lastUpdated: '2024-12-01',
  sources: ['https://engineering.fb.com/tag/whatsapp/', 'https://www.whatsapp.com/about'],
};
