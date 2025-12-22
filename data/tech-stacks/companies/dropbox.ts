import { Company } from '../types';

export const dropbox: Company = {
  slug: 'dropbox',
  name: 'Dropbox',
  logo: '/tech-stacks/logos/dropbox.svg',
  description: 'Cloud storage pioneer with efficient sync, deduplication, and hybrid cloud architecture serving 700M+ users',
  category: 'cloud-infrastructure',
  tags: ['cloud', 'storage', 'sync', 'python', 'rust', 'go', 'deduplication'],

  info: {
    founded: 2007,
    headquarters: 'San Francisco, CA',
    employees: '3,000+',
    revenue: '$2.5B+',
    publiclyTraded: true,
    ticker: 'DBX',
    website: 'https://dropbox.com',
  },

  metrics: {
    users: '700M+ registered users',
    uptime: '99.99%',
    dataProcessed: 'Exabytes stored',
    customMetrics: [
      { label: 'Files Stored', value: 'Hundreds of billions' },
      { label: 'Storage Efficiency', value: '90%+ dedup' },
      { label: 'Sync Latency', value: 'Seconds' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
    ],
    backend: [
      { name: 'Python', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Rust', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Go', category: 'language', usage: 'primary' },
      { name: 'C++', category: 'language', usage: 'secondary' },
      { name: 'gRPC', category: 'framework', usage: 'primary' },
    ],
    databases: [
      { name: 'MySQL', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'Edgestore', category: 'database', usage: 'primary', description: 'Custom metadata store' },
      { name: 'Magic Pocket', category: 'storage', usage: 'primary', isPrimary: true },
      { name: 'Redis', category: 'cache', usage: 'primary' },
    ],
    infrastructure: [
      { name: 'Own Data Centers', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'AWS', category: 'container', usage: 'secondary' },
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
    ],
    devOps: [
      { name: 'Bazel', category: 'ci-cd', usage: 'primary' },
      { name: 'Custom CI', category: 'ci-cd', usage: 'primary' },
      { name: 'Grafana', category: 'monitoring', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Custom Pipeline', category: 'analytics', usage: 'primary' },
    ],
    ml: [
      { name: 'Custom ML', category: 'ml-framework', usage: 'primary' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: 'Hybrid Cloud with Magic Pocket',
    htmlDiagram: {
      title: 'Dropbox Architecture',
      subtitle: 'Exabyte-Scale File Storage',
      layers: [
        {
          id: 'clients',
          name: 'Client Apps',
          position: 'top',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'desktop', name: 'Desktop Sync', techStack: ['Rust'] },
            { id: 'mobile', name: 'Mobile Apps', techStack: ['iOS', 'Android'] },
            { id: 'web', name: 'Web App', techStack: ['React'] },
          ],
        },
        {
          id: 'edge',
          name: 'Edge Layer',
          position: 'middle',
          color: 'bg-purple-100 border-purple-300',
          items: [
            { id: 'cdn', name: 'CDN', techStack: ['Static'] },
            { id: 'api', name: 'API Gateway', techStack: ['gRPC'] },
          ],
        },
        {
          id: 'services',
          name: 'Core Services',
          position: 'middle',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'sync', name: 'Sync Engine', techStack: ['Coordination'] },
            { id: 'store', name: 'Storage Service', techStack: ['Blocks'] },
            { id: 'meta', name: 'Metadata', techStack: ['Edgestore'] },
          ],
        },
        {
          id: 'storage',
          name: 'Magic Pocket',
          position: 'bottom',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'blocks', name: 'Block Store', techStack: ['Content-addressed'] },
            { id: 'dedup', name: 'Deduplication', techStack: ['90%+ savings'] },
            { id: 'erasure', name: 'Erasure Coding', techStack: ['Durability'] },
          ],
        },
      ],
      connections: [
        { from: 'clients', to: 'edge', type: 'api-call' },
        { from: 'edge', to: 'services', type: 'data-flow' },
        { from: 'services', to: 'storage', type: 'data-flow' },
      ],
    },
  },

  highlights: [
    {
      title: 'Magic Pocket',
      description: 'Custom storage infrastructure',
      impact: 'Saved hundreds of millions in AWS costs',
      technologies: ['Custom', 'Erasure Coding'],
      icon: 'HardDrive',
    },
    {
      title: 'Rust Sync Engine',
      description: 'Cross-platform desktop client',
      impact: '75% less memory usage',
      technologies: ['Rust', 'SQLite'],
      icon: 'RefreshCw',
    },
    {
      title: 'Block Deduplication',
      description: '90%+ storage savings',
      impact: 'Only unique content stored',
      technologies: ['SHA-256', 'Content-addressing'],
      icon: 'Database',
    },
  ],

  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Clients["700M+ Users"]
        Desktop["Desktop - Rust Sync"]
        Mobile["Mobile Apps"]
        Web["Web App - React"]
    end

    subgraph Edge["Edge Layer"]
        CDN["CDN"]
        Gateway["API Gateway"]
    end

    subgraph Services["Core Services"]
        SyncSvc["Sync Service"]
        MetaSvc["Metadata - Edgestore"]
        ShareSvc["Sharing Service"]
    end

    subgraph Storage["Magic Pocket"]
        BlockStore["Block Store - Content-Addressed"]
        Dedup["Deduplication - 90%+"]
        Erasure["Erasure Coding"]
    end

    Clients --> Edge
    Edge --> Services
    Services --> Storage`,

    dataFlow: `sequenceDiagram
    participant Client as Desktop
    participant Sync as Sync Service
    participant Meta as Metadata
    participant Dedup as Dedup Service
    participant Store as Magic Pocket

    Client->>Client: Detect file change
    Client->>Client: Split into blocks
    Client->>Client: Hash blocks

    Client->>Sync: Upload request
    Sync->>Meta: Check existing blocks

    loop For each block
        Meta->>Dedup: Check hash exists
        alt Block exists
            Dedup-->>Meta: Reference existing
        else New block
            Client->>Store: Upload block
            Store->>Store: Erasure encode
        end
    end

    Sync->>Meta: Update file metadata
    Meta-->>Client: Sync complete`,

    deployment: `flowchart TB
    subgraph OwnDC["Dropbox Data Centers"]
        subgraph DC1["US West"]
            Compute1["Compute"]
            Storage1["Magic Pocket"]
        end
        subgraph DC2["US East"]
            Compute2["Compute"]
            Storage2["Magic Pocket"]
        end
    end

    subgraph AWS["AWS"]
        S3["S3 - Overflow"]
    end

    DC1 <--> DC2
    OwnDC <--> AWS`,

    serviceInteraction: `flowchart LR
    subgraph Client["Client"]
        SyncEngine["Sync Engine - Rust"]
        LocalDB["Local State - SQLite"]
    end

    subgraph Gateway["API"]
        Auth["Authentication"]
        Router["Router"]
    end

    subgraph Services["Services"]
        FileSvc["File Service"]
        ShareSvc["Sharing"]
        SearchSvc["Search"]
    end

    subgraph Storage["Storage"]
        Edgestore["Edgestore"]
        MagicPocket["Magic Pocket"]
    end

    SyncEngine --> Gateway
    Gateway --> Services
    Services --> Storage`,
  },

  patterns: [
    {
      patternSlug: 'content-addressing',
      patternName: 'Content-Addressed Storage',
      usage: 'Block-level deduplication',
      implementation: 'SHA-256 hashes, 4MB blocks',
      scale: '90%+ storage savings',
    },
    {
      patternSlug: 'erasure-coding',
      patternName: 'Erasure Coding',
      usage: 'Data durability',
      implementation: 'Reed-Solomon, more efficient than 3x replication',
      scale: 'Exabytes of data',
    },
  ],

  technicalDecisions: [
    {
      title: 'Why Build Magic Pocket',
      context: 'AWS S3 costs unsustainable at exabyte scale',
      decision: 'Built custom storage infrastructure',
      consequences: [
        'Saved hundreds of millions in costs',
        '90%+ deduplication',
        '2+ years to build and migrate',
      ],
      alternatives: ['Stay on S3', 'Google Cloud'],
      sources: ['https://dropbox.tech/infrastructure/magic-pocket-infrastructure'],
    },
    {
      title: 'Why Rust for Sync Engine',
      context: 'Python client had performance issues',
      decision: 'Rewrote sync engine in Rust',
      consequences: [
        'Single codebase for all platforms',
        '75% less memory',
        'Faster sync',
      ],
      alternatives: ['C++', 'Go'],
      sources: ['https://dropbox.tech/application/rewriting-the-heart-of-our-sync-engine'],
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Registered Users', value: '700M+', trend: 'stable' },
      { label: 'Storage', value: 'Exabytes', trend: 'up' },
    ],
    openSource: [
      {
        name: 'Zxcvbn',
        description: 'Password strength estimator',
        url: 'https://github.com/dropbox/zxcvbn',
        stars: 14000,
        language: 'JavaScript',
      },
      {
        name: 'Lepton',
        description: 'JPEG compression',
        url: 'https://github.com/dropbox/lepton',
        stars: 5000,
        language: 'C++',
      },
    ],
    engineeringBlog: 'https://dropbox.tech',
  },

  lastUpdated: '2024-12-01',
  sources: ['https://dropbox.tech', 'https://github.com/dropbox'],
};
