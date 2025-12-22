import { Company } from '../types';

export const cloudflare: Company = {
  slug: 'cloudflare',
  name: 'Cloudflare',
  logo: '/tech-stacks/logos/cloudflare.svg',
  description: 'Global edge network providing CDN, DDoS protection, and serverless compute, processing 20%+ of web traffic',
  category: 'cloud-infrastructure',
  tags: ['edge', 'cdn', 'security', 'rust', 'go', 'workers', 'serverless'],

  info: {
    founded: 2009,
    headquarters: 'San Francisco, CA',
    employees: '4,000+',
    revenue: '$1.2B+',
    publiclyTraded: true,
    ticker: 'NET',
    website: 'https://cloudflare.com',
  },

  metrics: {
    users: '20%+ of web traffic',
    requestsPerSecond: '50M+ requests/sec',
    uptime: '99.99%',
    dataProcessed: 'Exabytes monthly',
    customMetrics: [
      { label: 'Edge Locations', value: '300+ cities' },
      { label: 'Threats Blocked/Day', value: '140B+' },
      { label: 'Network Capacity', value: '250+ Tbps' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
    ],
    backend: [
      { name: 'Rust', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Go', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'C/C++', category: 'language', usage: 'primary' },
      { name: 'Lua', category: 'language', usage: 'primary' },
    ],
    databases: [
      { name: 'ClickHouse', category: 'analytics', usage: 'primary', isPrimary: true },
      { name: 'PostgreSQL', category: 'database', usage: 'primary' },
      { name: 'Quicksilver', category: 'database', usage: 'primary', description: 'Global distributed KV' },
    ],
    infrastructure: [
      { name: 'Own Hardware', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'Anycast', category: 'other', usage: 'primary' },
      { name: 'V8 Isolates', category: 'other', usage: 'primary' },
    ],
    devOps: [
      { name: 'Custom CI', category: 'ci-cd', usage: 'primary' },
      { name: 'Prometheus', category: 'monitoring', usage: 'primary' },
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
    type: 'distributed',
    style: 'distributed',
    description: 'Global Edge Network with V8 Isolates',
    htmlDiagram: {
      title: 'Cloudflare Architecture',
      subtitle: 'Edge Computing at Internet Scale',
      layers: [
        {
          id: 'internet',
          name: 'Internet Traffic',
          position: 'top',
          color: 'bg-orange-100 border-orange-300',
          items: [
            { id: 'users', name: 'Global Users', techStack: ['HTTPS'] },
          ],
        },
        {
          id: 'edge',
          name: 'Edge Network (300+ PoPs)',
          position: 'middle',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'proxy', name: 'Anycast Proxy', techStack: ['Rust', 'Pingora'] },
            { id: 'workers', name: 'Workers Runtime', techStack: ['V8 Isolates'] },
            { id: 'cache', name: 'Edge Cache', techStack: ['Tiered'] },
            { id: 'waf', name: 'WAF/DDoS', techStack: ['ML Detection'] },
          ],
        },
        {
          id: 'control',
          name: 'Control Plane',
          position: 'middle',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'api', name: 'API Gateway', techStack: ['Go'] },
            { id: 'quicksilver', name: 'Quicksilver', techStack: ['Global KV'] },
          ],
        },
        {
          id: 'origin',
          name: 'Customer Origins',
          position: 'bottom',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'servers', name: 'Origin Servers', techStack: ['Customer Infrastructure'] },
          ],
        },
      ],
      connections: [
        { from: 'internet', to: 'edge', type: 'api-call' },
        { from: 'edge', to: 'control', type: 'data-flow' },
        { from: 'edge', to: 'origin', type: 'data-flow' },
      ],
    },
  },

  highlights: [
    {
      title: 'V8 Isolates',
      description: 'Sub-millisecond serverless cold starts',
      impact: 'Thousands of isolates per process',
      technologies: ['V8', 'Workers'],
      icon: 'Zap',
    },
    {
      title: 'Pingora (Rust)',
      description: 'Rust proxy replacing Nginx',
      impact: 'Better performance and memory safety',
      technologies: ['Rust', 'Async'],
      icon: 'Shield',
    },
    {
      title: 'Quicksilver',
      description: 'Global config propagation',
      impact: '<1 second worldwide',
      technologies: ['Distributed KV'],
      icon: 'Globe',
    },
  ],

  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Users["Global Users"]
        Americas["Americas"]
        Europe["Europe"]
        Asia["Asia"]
    end

    subgraph Network["Cloudflare Network - 300+ PoPs"]
        subgraph EdgeStack["Every PoP Runs"]
            Anycast["Anycast BGP"]
            L7["HTTP Proxy - Pingora"]
            WAF["WAF/DDoS"]
            Workers["Workers - V8 Isolates"]
            Cache["Tiered Cache"]
        end
    end

    subgraph ControlPlane["Control Plane"]
        API["API Gateway"]
        Quicksilver["Quicksilver - Global KV"]
        Analytics["Analytics - ClickHouse"]
    end

    subgraph Origins["Customer Origins"]
        Origin["Origin Servers"]
    end

    Users --> Network
    Network --> Origins
    ControlPlane --> Network`,

    dataFlow: `sequenceDiagram
    participant User
    participant DNS as 1.1.1.1 DNS
    participant Edge as Edge PoP
    participant Workers as Workers
    participant Cache as Edge Cache
    participant Origin

    User->>DNS: DNS Query
    DNS-->>User: Anycast IP

    User->>Edge: HTTPS Request
    Edge->>Edge: TLS + WAF

    alt Workers Configured
        Edge->>Workers: Run Worker
        Workers-->>Edge: Response
    else Static/Cached
        Edge->>Cache: Check cache
        alt Cache Hit
            Cache-->>Edge: Cached
        else Cache Miss
            Edge->>Origin: Fetch
            Origin-->>Edge: Response
        end
    end

    Edge-->>User: Response`,

    deployment: `flowchart TB
    subgraph Global["Global Rollout"]
        Tier1["Tier 1 - Major metros"]
        Tier2["Tier 2 - Secondary"]
        Tier3["Tier 3 - Edge"]
    end

    subgraph Deploy["Deployment"]
        CI["CI Pipeline"]
        Canary["Canary - 5% traffic"]
        Quicksilver["Quicksilver Push"]
    end

    subgraph Config["Configuration"]
        API["API/Dashboard"]
        KV["Quicksilver KV"]
    end

    Deploy --> Global
    Config --> KV
    KV --> Global`,

    serviceInteraction: `flowchart LR
    subgraph Edge["Edge PoP"]
        Frontend["FL - Frontend"]
        Proxy["Proxy Layer"]
        Filter["WAF/Filter"]
        Cache["Cache"]
        WorkerRT["Workers"]
    end

    subgraph Services["Services"]
        DNS["DNS"]
        Tunnel["Tunnel"]
        LoadBal["Load Balancer"]
    end

    subgraph Control["Control Plane"]
        API["API"]
        Analytics["ClickHouse"]
    end

    Frontend --> Proxy
    Proxy --> Filter
    Filter --> Cache
    Filter --> WorkerRT
    Edge --> Control`,
  },

  patterns: [
    {
      patternSlug: 'anycast',
      patternName: 'Anycast Networking',
      usage: 'Global load balancing',
      implementation: 'Single IP from 300+ locations',
      scale: '20%+ of internet traffic',
    },
    {
      patternSlug: 'v8-isolates',
      patternName: 'V8 Isolates',
      usage: 'Multi-tenant serverless',
      implementation: 'Sub-ms cold starts, thousands per process',
      scale: '10M+ requests/sec',
    },
  ],

  technicalDecisions: [
    {
      title: 'Why V8 Isolates over Containers',
      context: 'Containers too slow for edge serverless',
      decision: 'Built Workers on V8 isolates',
      consequences: [
        'Sub-millisecond cold starts',
        'Thousands of isolates per process',
        'JS/WASM only (initially)',
      ],
      alternatives: ['Containers', 'VMs', 'Firecracker'],
      sources: ['https://blog.cloudflare.com/cloud-computing-without-containers/'],
    },
    {
      title: 'Why Rust for Pingora',
      context: 'Nginx limitations at scale',
      decision: 'Built Pingora proxy in Rust',
      consequences: [
        'Memory safety at edge',
        'Better performance',
        'Released as open source',
      ],
      alternatives: ['Stay on Nginx', 'Envoy'],
      sources: ['https://blog.cloudflare.com/how-we-built-pingora-the-proxy-that-connects-cloudflare-to-the-internet/'],
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Web Traffic', value: '20%+', trend: 'up' },
      { label: 'Edge Locations', value: '300+', trend: 'up' },
    ],
    openSource: [
      {
        name: 'Pingora',
        description: 'Rust HTTP proxy library',
        url: 'https://github.com/cloudflare/pingora',
        stars: 18000,
        language: 'Rust',
      },
      {
        name: 'workerd',
        description: 'Workers JavaScript runtime',
        url: 'https://github.com/cloudflare/workerd',
        stars: 5500,
        language: 'C++',
      },
      {
        name: 'quiche',
        description: 'QUIC and HTTP/3',
        url: 'https://github.com/cloudflare/quiche',
        stars: 8500,
        language: 'Rust',
      },
    ],
    engineeringBlog: 'https://blog.cloudflare.com',
  },

  lastUpdated: '2024-12-01',
  sources: ['https://blog.cloudflare.com', 'https://github.com/cloudflare'],
};
