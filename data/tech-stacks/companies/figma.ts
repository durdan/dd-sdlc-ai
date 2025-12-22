import { Company } from '../types';

export const figma: Company = {
  slug: 'figma',
  name: 'Figma',
  logo: '/tech-stacks/logos/figma.svg',
  description: 'Browser-based collaborative design tool with real-time multiplayer editing using WebGL and WebAssembly',
  category: 'developer-tools',
  tags: ['design', 'webgl', 'wasm', 'crdt', 'collaboration', 'typescript', 'rust'],

  info: {
    founded: 2012,
    headquarters: 'San Francisco, CA',
    employees: '1,500+',
    revenue: '$500M+',
    publiclyTraded: false,
    website: 'https://figma.com',
  },

  metrics: {
    users: '4M+ designers',
    uptime: '99.9%',
    customMetrics: [
      { label: 'Files Created', value: 'Billions' },
      { label: 'Real-time Sessions', value: 'Millions/day' },
      { label: 'Render Performance', value: '60fps' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'WebGL', category: 'library', usage: 'primary', isPrimary: true },
      { name: 'WebAssembly', category: 'library', usage: 'primary', isPrimary: true },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
    ],
    backend: [
      { name: 'TypeScript', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'C++', category: 'language', usage: 'primary' },
      { name: 'Rust', category: 'language', usage: 'primary' },
      { name: 'Go', category: 'language', usage: 'secondary' },
      { name: 'Node.js', category: 'framework', usage: 'primary' },
    ],
    databases: [
      { name: 'PostgreSQL', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'Redis', category: 'cache', usage: 'primary' },
      { name: 'S3', category: 'storage', usage: 'primary' },
    ],
    infrastructure: [
      { name: 'AWS', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
      { name: 'CloudFront', category: 'cdn', usage: 'primary' },
    ],
    devOps: [
      { name: 'GitHub Actions', category: 'ci-cd', usage: 'primary' },
      { name: 'Datadog', category: 'monitoring', usage: 'primary' },
      { name: 'Sentry', category: 'monitoring', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Custom Sync', category: 'other', usage: 'primary' },
    ],
    ml: [
      { name: 'Custom ML', category: 'ml-framework', usage: 'primary' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: 'Browser-First with CRDT Sync',
    htmlDiagram: {
      title: 'Figma Architecture',
      subtitle: 'Real-Time Collaborative Design',
      layers: [
        {
          id: 'browser',
          name: 'Browser Client',
          position: 'top',
          color: 'bg-pink-100 border-pink-300',
          items: [
            { id: 'react', name: 'React UI', techStack: ['React', 'TypeScript'] },
            { id: 'canvas', name: 'WebGL Canvas', techStack: ['WebGL', '60fps'] },
            { id: 'wasm', name: 'WASM Engine', techStack: ['C++', 'Rust'] },
          ],
        },
        {
          id: 'sync',
          name: 'Sync Layer',
          position: 'middle',
          color: 'bg-purple-100 border-purple-300',
          items: [
            { id: 'ws', name: 'WebSocket Sync', techStack: ['Real-time'] },
            { id: 'crdt', name: 'CRDT Engine', techStack: ['Conflict-free'] },
          ],
        },
        {
          id: 'backend',
          name: 'Backend',
          position: 'middle',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'api', name: 'API Gateway', techStack: ['Node.js'] },
            { id: 'files', name: 'File Service', techStack: ['Versioning'] },
            { id: 'collab', name: 'Collaboration', techStack: ['Real-time'] },
          ],
        },
        {
          id: 'storage',
          name: 'Storage',
          position: 'bottom',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'postgres', name: 'PostgreSQL', techStack: ['Metadata'] },
            { id: 's3', name: 'S3', techStack: ['Files'] },
            { id: 'redis', name: 'Redis', techStack: ['Cache'] },
          ],
        },
      ],
      connections: [
        { from: 'browser', to: 'sync', type: 'api-call' },
        { from: 'sync', to: 'backend', type: 'data-flow' },
        { from: 'backend', to: 'storage', type: 'data-flow' },
      ],
    },
  },

  highlights: [
    {
      title: 'WebGL Rendering',
      description: '60fps design manipulation',
      impact: 'Complex designs render smoothly',
      technologies: ['WebGL', 'GPU'],
      icon: 'Palette',
    },
    {
      title: 'WebAssembly',
      description: 'Native performance in browser',
      impact: '3x faster than JavaScript',
      technologies: ['C++', 'Rust', 'WASM'],
      icon: 'Zap',
    },
    {
      title: 'Real-Time CRDT',
      description: 'Conflict-free collaboration',
      impact: 'True multiplayer editing',
      technologies: ['CRDT', 'OT'],
      icon: 'Users',
    },
  ],

  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Client["Browser Client"]
        React["React UI"]
        Canvas["WebGL Canvas - 60fps"]
        WASM["WebAssembly Engine"]
        CRDT["Local CRDT"]
    end

    subgraph Sync["Real-time Sync"]
        WSGateway["WebSocket Gateway"]
        OT["Operational Transform"]
    end

    subgraph API["API Layer"]
        GraphQL["GraphQL API"]
        FileAPI["File Service"]
    end

    subgraph Data["Data Layer"]
        Postgres[("PostgreSQL - Metadata")]
        S3[("S3 - Design Files")]
        Redis["Redis - Cache"]
    end

    Client <--> Sync
    Client --> API
    API --> Data
    Sync --> Data`,

    dataFlow: `sequenceDiagram
    participant Designer1
    participant Browser1 as Browser WASM
    participant WS as WebSocket
    participant CRDT as CRDT Service
    participant Browser2 as Browser WASM
    participant Designer2

    Designer1->>Browser1: Draw shape
    Browser1->>Browser1: WASM computes
    Browser1->>Browser1: WebGL renders
    Browser1->>WS: Send operation
    WS->>CRDT: Process op
    CRDT->>WS: Broadcast
    WS->>Browser2: Receive op
    Browser2->>Browser2: Apply CRDT
    Browser2-->>Designer2: See change`,

    deployment: `flowchart TB
    subgraph AWS["AWS Infrastructure"]
        subgraph Compute["Compute"]
            EKS["EKS Kubernetes"]
            Lambda["Lambda - Export"]
        end
        subgraph Data["Data"]
            RDS["RDS PostgreSQL"]
            S3["S3 - Files"]
        end
    end

    subgraph CDN["Content Delivery"]
        CloudFront["CloudFront"]
        Static["Static Assets"]
    end

    CDN --> AWS`,

    serviceInteraction: `flowchart LR
    subgraph Browser["Browser"]
        UI["React UI"]
        Engine["Rendering"]
        Local["Local CRDT"]
    end

    subgraph Realtime["Real-time"]
        WS["WebSocket"]
        Rooms["Room Manager"]
    end

    subgraph Backend["Backend"]
        GraphQL["GraphQL"]
        Files["Files"]
        Export["Export"]
    end

    UI --> Engine
    Local <--> WS
    UI --> GraphQL`,
  },

  patterns: [
    {
      patternSlug: 'crdt',
      patternName: 'CRDT Collaboration',
      usage: 'Conflict-free real-time editing',
      implementation: 'Custom CRDT for design operations',
      scale: 'Millions of concurrent sessions',
    },
    {
      patternSlug: 'wasm-performance',
      patternName: 'WebAssembly Performance',
      usage: 'CPU-intensive calculations',
      implementation: 'C++/Rust compiled to WASM',
      scale: '3x faster than JS',
    },
  ],

  technicalDecisions: [
    {
      title: 'Why Browser-First with WebGL',
      context: 'Desktop apps dominated design tools',
      decision: 'Built entirely in browser using WebGL',
      consequences: [
        'Instant access, no installation',
        'Cross-platform by default',
        'Required solving browser limitations',
      ],
      alternatives: ['Desktop app', 'Electron'],
      sources: ['https://www.figma.com/blog/building-a-professional-design-tool-on-the-web/'],
    },
    {
      title: 'Why WebAssembly',
      context: 'JavaScript too slow for complex operations',
      decision: 'Compiled C++ to WebAssembly',
      consequences: [
        '3x faster than pure JavaScript',
        'Near-native performance',
        'Complex build pipeline',
      ],
      alternatives: ['Pure JavaScript', 'asm.js'],
      sources: ['https://www.figma.com/blog/webassembly-cut-figmas-load-time-by-3x/'],
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Active Users', value: '4M+', trend: 'up' },
      { label: 'Files Created', value: 'Billions', trend: 'up' },
    ],
    openSource: [
      {
        name: 'Plugin API',
        description: 'Figma plugin development API',
        url: 'https://github.com/figma/plugin-samples',
        stars: 1500,
        language: 'TypeScript',
      },
    ],
    engineeringBlog: 'https://www.figma.com/blog/engineering/',
  },

  lastUpdated: '2024-12-01',
  sources: ['https://www.figma.com/blog/engineering/'],
};
