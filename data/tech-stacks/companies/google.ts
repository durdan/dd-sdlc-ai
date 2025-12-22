import { Company } from '../types';

export const google: Company = {
  slug: 'google',
  name: 'Google',
  logo: '/tech-stacks/logos/google.svg',
  description: 'Borg/Kubernetes foundation powering global search and cloud services',
  category: 'cloud-infrastructure',
  tags: ['search', 'cloud', 'kubernetes', 'ai', 'go', 'python', 'c++', 'distributed-systems'],

  info: {
    founded: 1998,
    headquarters: 'Mountain View, CA',
    employees: '180,000+',
    revenue: '$282B',
    publiclyTraded: true,
    ticker: 'GOOGL',
    website: 'https://google.com',
  },

  metrics: {
    users: '4.3B+ users',
    requestsPerDay: '8.5B+ searches daily',
    uptime: '99.999%',
    latency: '<200ms',
    regionsServed: 200,
    customMetrics: [
      { label: 'YouTube Hours/Day', value: '1B+' },
      { label: 'Gmail Users', value: '1.8B' },
      { label: 'Data Centers', value: '35+' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'Angular', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
      { name: 'Dart', category: 'language', usage: 'primary' },
      { name: 'Flutter', category: 'framework', usage: 'primary' },
      { name: 'Lit', category: 'library', usage: 'primary' },
    ],
    backend: [
      { name: 'C++', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Java', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Go', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Python', category: 'language', usage: 'primary' },
      { name: 'gRPC', category: 'framework', usage: 'primary' },
      { name: 'Protocol Buffers', category: 'framework', usage: 'primary' },
    ],
    databases: [
      { name: 'Bigtable', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'Spanner', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'Colossus', category: 'storage', usage: 'primary' },
      { name: 'Memorystore', category: 'cache', usage: 'primary' },
      { name: 'Firestore', category: 'database', usage: 'primary' },
    ],
    infrastructure: [
      { name: 'Borg', category: 'orchestration', usage: 'primary', isPrimary: true, description: 'Precursor to Kubernetes' },
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary', isPrimary: true },
      { name: 'Google Cloud', category: 'container', usage: 'primary' },
      { name: 'Custom TPUs', category: 'other', usage: 'primary' },
      { name: 'B4 Network', category: 'other', usage: 'primary', description: 'Software-defined WAN' },
    ],
    devOps: [
      { name: 'Borg', category: 'orchestration', usage: 'primary' },
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
      { name: 'Blaze/Bazel', category: 'ci-cd', usage: 'primary', isPrimary: true },
      { name: 'Monarch', category: 'monitoring', usage: 'primary' },
      { name: 'Dapper', category: 'monitoring', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'MapReduce', category: 'analytics', usage: 'legacy' },
      { name: 'Dremel', category: 'analytics', usage: 'primary', isPrimary: true },
      { name: 'Dataflow', category: 'analytics', usage: 'primary' },
      { name: 'Pub/Sub', category: 'queue', usage: 'primary' },
      { name: 'BigQuery', category: 'analytics', usage: 'primary' },
    ],
    ml: [
      { name: 'TensorFlow', category: 'ml-framework', usage: 'primary', isPrimary: true },
      { name: 'JAX', category: 'ml-framework', usage: 'primary' },
      { name: 'Vertex AI', category: 'ml-framework', usage: 'primary' },
      { name: 'TPU', category: 'other', usage: 'primary', description: 'Custom ML accelerator' },
    ],
    mobile: [
      { name: 'Flutter', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'Kotlin', category: 'language', usage: 'primary' },
      { name: 'Jetpack Compose', category: 'framework', usage: 'primary' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: 'Borg/Kubernetes Foundation',
    htmlDiagram: {
      title: 'Google Infrastructure Architecture',
      subtitle: 'Global Distributed Systems',
      layers: [
        {
          id: 'users',
          name: 'Global Users',
          position: 'top',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'users', name: '4.3B+ Users', icon: 'Users', techStack: ['Search', 'Gmail', 'YouTube', 'Maps'] },
          ],
        },
        {
          id: 'edge',
          name: 'Global Edge Network',
          position: 'top',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'gfe', name: 'Google Front End', techStack: ['Load Balancing', 'SSL Termination'] },
            { id: 'cdn', name: 'Google CDN', techStack: ['Edge Caching'] },
          ],
        },
        {
          id: 'services',
          name: 'Service Mesh',
          position: 'middle',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'search', name: 'Search', techStack: ['C++', 'Bigtable'] },
            { id: 'gmail', name: 'Gmail', techStack: ['Java', 'Spanner'] },
            { id: 'youtube', name: 'YouTube', techStack: ['Python', 'Vitess'] },
            { id: 'maps', name: 'Maps', techStack: ['C++', 'Go'] },
          ],
        },
        {
          id: 'infra',
          name: 'Borg Cluster Management',
          position: 'bottom',
          color: 'bg-purple-100 border-purple-300',
          items: [
            { id: 'borg', name: 'Borg', techStack: ['Container Orchestration'] },
            { id: 'spanner', name: 'Spanner', techStack: ['Globally Distributed DB'] },
            { id: 'bigtable', name: 'Bigtable', techStack: ['NoSQL'] },
          ],
        },
      ],
      connections: [
        { from: 'users', to: 'edge', type: 'api-call' },
        { from: 'edge', to: 'services', type: 'api-call', label: 'gRPC' },
        { from: 'services', to: 'infra', type: 'data-flow' },
      ],
    },
    mermaidDiagram: `graph TB
    subgraph "Global Edge"
        GFE[Google Front End]
        CDN[Google CDN]
        EDGE[Edge PoPs]
    end

    subgraph "Products"
        SEARCH[Search]
        GMAIL[Gmail]
        YT[YouTube]
        MAPS[Maps]
        DRIVE[Drive]
        MEET[Meet]
    end

    subgraph "Platform Services"
        AUTH[Identity Platform]
        ADS[Ads Platform]
        AI[AI/ML Services]
        CLOUD[Cloud Platform]
    end

    subgraph "Core Infrastructure"
        BORG[Borg Cluster Manager]
        SPANNER[(Spanner)]
        BIGTABLE[(Bigtable)]
        COLOSSUS[Colossus FS]
        B4[B4 Network]
    end

    subgraph "ML Infrastructure"
        TPU[TPU Pods]
        TF[TensorFlow]
        VERTEX[Vertex AI]
    end

    GFE --> CDN
    CDN --> EDGE
    EDGE --> SEARCH
    EDGE --> GMAIL
    EDGE --> YT
    EDGE --> MAPS

    SEARCH --> BORG
    GMAIL --> SPANNER
    YT --> BIGTABLE
    MAPS --> COLOSSUS

    BORG --> B4
    AI --> TPU
    TPU --> TF
    TF --> VERTEX`,
    components: [
      {
        name: 'Borg',
        description: 'Google\'s internal cluster management system that inspired Kubernetes',
        responsibilities: ['Container orchestration', 'Resource allocation', 'Job scheduling', 'High availability'],
        technologies: ['C++', 'Protocol Buffers', 'Custom Linux kernel'],
      },
      {
        name: 'Spanner',
        description: 'Globally distributed, strongly consistent database',
        responsibilities: ['Global transactions', 'SQL interface', 'Automatic sharding', 'Strong consistency'],
        technologies: ['TrueTime', 'Paxos', 'Custom hardware'],
      },
      {
        name: 'Bigtable',
        description: 'Distributed storage system for structured data',
        responsibilities: ['Petabyte-scale storage', 'Low latency reads', 'High throughput writes'],
        technologies: ['GFS/Colossus', 'Chubby', 'SSTable'],
      },
    ],
  },

  highlights: [
    {
      title: 'Kubernetes Origin',
      description: 'Created Kubernetes based on 15 years of Borg experience',
      impact: 'De facto standard for container orchestration worldwide',
      technologies: ['Borg', 'Kubernetes', 'Go'],
      icon: 'Container',
    },
    {
      title: 'TensorFlow',
      description: 'Open-source machine learning framework',
      impact: 'Most widely used ML framework globally',
      technologies: ['TensorFlow', 'Python', 'C++'],
      icon: 'Brain',
    },
    {
      title: 'Spanner Database',
      description: 'First globally distributed database with strong consistency',
      impact: 'Revolutionized distributed database design',
      technologies: ['Spanner', 'TrueTime', 'Paxos'],
      icon: 'Database',
    },
    {
      title: 'TPU Hardware',
      description: 'Custom tensor processing units for ML workloads',
      impact: 'Powers Google\'s AI including Search and Gemini',
      technologies: ['TPU', 'XLA', 'JAX'],
      icon: 'Cpu',
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Daily Searches', value: '8.5B+', trend: 'stable' },
      { label: 'YouTube Hours/Day', value: '1B+', trend: 'up' },
      { label: 'Gmail Users', value: '1.8B', trend: 'up' },
      { label: 'Data Centers', value: '35+', trend: 'up' },
    ],
    innovationAreas: [
      {
        name: 'Large Language Models',
        description: 'Pioneering transformer architecture and LLMs (BERT, PaLM, Gemini)',
        technologies: ['TensorFlow', 'JAX', 'TPU', 'Transformers'],
        yearStarted: 2017,
      },
      {
        name: 'Quantum Computing',
        description: 'Quantum supremacy achievement with Sycamore processor',
        technologies: ['Cirq', 'Quantum Hardware'],
        yearStarted: 2019,
      },
      {
        name: 'Software-Defined Networking',
        description: 'B4 network connecting data centers with SDN',
        technologies: ['OpenFlow', 'Custom Switches'],
        yearStarted: 2012,
      },
    ],
    openSource: [
      {
        name: 'Kubernetes',
        description: 'Container orchestration platform',
        url: 'https://github.com/kubernetes/kubernetes',
        stars: 105000,
        language: 'Go',
      },
      {
        name: 'TensorFlow',
        description: 'Machine learning framework',
        url: 'https://github.com/tensorflow/tensorflow',
        stars: 180000,
        language: 'Python/C++',
      },
      {
        name: 'gRPC',
        description: 'High-performance RPC framework',
        url: 'https://github.com/grpc/grpc',
        stars: 40000,
        language: 'C++',
      },
      {
        name: 'Bazel',
        description: 'Fast, scalable build system',
        url: 'https://github.com/bazelbuild/bazel',
        stars: 22000,
        language: 'Java',
      },
      {
        name: 'Angular',
        description: 'Web application framework',
        url: 'https://github.com/angular/angular',
        stars: 94000,
        language: 'TypeScript',
      },
      {
        name: 'Flutter',
        description: 'Cross-platform UI toolkit',
        url: 'https://github.com/flutter/flutter',
        stars: 160000,
        language: 'Dart',
      },
    ],
    blogPosts: [
      {
        title: 'Google Research Blog',
        url: 'https://blog.research.google/',
        date: '2024-01-01',
        topic: 'Research',
      },
      {
        title: 'Google Cloud Blog',
        url: 'https://cloud.google.com/blog',
        date: '2024-01-01',
        topic: 'Cloud',
      },
    ],
    engineeringBlog: 'https://blog.research.google/',
  },

  // Phase 2: Detailed Architecture Diagrams
  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Users["Global Users - 4.3B+ across products"]
        direction LR
        SEARCH["Search<br/>8.5B queries/day"]
        YOUTUBE["YouTube<br/>2B+ users"]
        GMAIL["Gmail<br/>1.8B users"]
        MAPS["Maps<br/>1B+ users"]
        ANDROID["Android<br/>3B+ devices"]
    end

    subgraph Edge["Global Edge Network"]
        direction LR
        GFE["Google Front End<br/>Global load balancing"]
        CDN["Edge Caching<br/>200+ PoPs worldwide"]
        QUIC["QUIC Protocol<br/>Low-latency transport"]
    end

    subgraph Compute["Compute Layer - Borg"]
        direction TB
        BORG["Borg Cluster Manager<br/>Millions of jobs"]
        subgraph Services["Core Services"]
            WEB["Web Search<br/>Serving clusters"]
            ADS["Ads Serving<br/>Real-time bidding"]
            ML_SERVE["ML Serving<br/>TensorFlow Serving"]
        end
        BORG --> Services
    end

    subgraph Storage["Storage Infrastructure"]
        direction LR
        COLOSSUS["Colossus<br/>Distributed File System"]
        BIGTABLE[("Bigtable<br/>Petabyte-scale NoSQL")]
        SPANNER[("Spanner<br/>Globally distributed SQL")]
        MEMSTORE["Memorystore<br/>In-memory caching"]
    end

    subgraph Data["Data Processing"]
        direction LR
        MAPREDUCE["MapReduce<br/>Batch processing"]
        DATAFLOW["Dataflow<br/>Stream processing"]
        BIGQUERY["BigQuery<br/>Analytics warehouse"]
    end

    subgraph ML["AI and ML Platform"]
        direction LR
        TPU["TPU Pods<br/>Custom ML hardware"]
        VERTEX["Vertex AI<br/>ML platform"]
        TENSORFLOW["TensorFlow<br/>ML framework"]
    end

    subgraph Network["Jupiter Network Fabric"]
        JUPITER["1.3 Pbps bisection bandwidth"]
    end

    Users --> Edge
    Edge --> Compute
    Compute --> Storage
    Compute --> Data
    Compute --> ML
    Storage --> JUPITER
    Data --> Storage`,

    dataFlow: `sequenceDiagram
    participant User as User Query
    participant GFE as Google Front End
    participant Index as Search Index
    participant Rank as Ranking Service
    participant Ads as Ads Server
    participant ML as ML Ranking
    participant Cache as Distributed Cache
    participant Bigtable as Bigtable

    User->>GFE: 1. Search query
    GFE->>GFE: 2. Parse and validate query

    par Parallel Index Lookup
        GFE->>Index: 3a. Query inverted index
        GFE->>Ads: 3b. Get relevant ads
        GFE->>Cache: 3c. Check result cache
    end

    Index->>Index: 4. Retrieve document IDs
    Index-->>Rank: 5. Candidate documents

    Rank->>ML: 6. Score with ML models
    ML->>ML: 7. BERT/MUM ranking
    ML-->>Rank: 8. Ranked scores

    Rank->>Bigtable: 9. Fetch document snippets
    Bigtable-->>Rank: 10. Document content

    Ads-->>GFE: 11. Matched ads
    Rank-->>GFE: 12. Ranked results

    GFE->>GFE: 13. Blend organic and ads
    GFE->>Cache: 14. Cache results
    GFE-->>User: 15. Search results page

    Note over User,Bigtable: Total latency target - 200ms`,

    deployment: `flowchart TB
    subgraph Global["Global Infrastructure"]
        direction TB
        subgraph Regions["Data Center Regions"]
            direction LR
            US["US Regions<br/>Multiple DCs"]
            EU["Europe Regions<br/>Multiple DCs"]
            ASIA["Asia Pacific<br/>Multiple DCs"]
        end

        subgraph DC["Single Data Center"]
            direction TB
            subgraph Cluster["Borg Cluster"]
                BORGMASTER["Borg Master<br/>5-way replicated"]
                BORGLET["Borglets<br/>Per-machine agents"]
                SCHEDULER["Scheduler<br/>Constraint-based"]
            end

            subgraph Machines["Machine Fleet"]
                RACK1["Rack 1<br/>~80 machines"]
                RACK2["Rack 2<br/>~80 machines"]
                RACKN["Rack N<br/>1000s of racks"]
            end

            Cluster --> Machines
        end
    end

    subgraph Network["Network Topology"]
        JUPITER_NET["Jupiter Fabric<br/>1.3 Pbps"]
        B4["B4 WAN<br/>Software-defined WAN"]
        ESPRESSO["Espresso<br/>Peering edge"]
    end

    subgraph Reliability["Reliability"]
        CHUBBY["Chubby<br/>Distributed lock service"]
        MONARCH["Monarch<br/>Global monitoring"]
        DAPPER["Dapper<br/>Distributed tracing"]
    end

    Regions --> Network
    DC --> Reliability
    B4 --> Regions`,

    serviceInteraction: `flowchart LR
    subgraph Frontend["Frontend Services"]
        GFE["Google Front End"]
        GSLB["Global Load Balancer"]
    end

    subgraph RPC["RPC Infrastructure"]
        STUBBY["Stubby RPC<br/>Internal gRPC"]
        PROTO["Protocol Buffers<br/>Serialization"]
    end

    subgraph Discovery["Service Discovery"]
        BNS["Borg Naming Service"]
        CHUBBY_SVC["Chubby<br/>Coordination"]
    end

    subgraph Services["Application Services"]
        direction TB
        SVC_A["Search Backend"]
        SVC_B["Ads Backend"]
        SVC_C["YouTube Backend"]
        SVC_D["Gmail Backend"]
    end

    subgraph Storage_Layer["Storage Services"]
        BIGTABLE_SVC["Bigtable"]
        SPANNER_SVC["Spanner"]
        COLOSSUS_SVC["Colossus"]
    end

    subgraph Monitoring["Observability"]
        BORGMON["Borgmon<br/>Monitoring"]
        DAPPER_SVC["Dapper<br/>Tracing"]
        MONARCH_SVC["Monarch<br/>Metrics"]
    end

    Frontend --> RPC
    RPC --> Discovery
    Discovery --> Services
    Services --> Storage_Layer
    Services -.-> Monitoring

    classDef frontend fill:#e3f2fd,stroke:#1565c0
    classDef storage fill:#e8f5e9,stroke:#2e7d32
    classDef monitoring fill:#fff3e0,stroke:#ef6c00

    class GFE,GSLB frontend
    class BIGTABLE_SVC,SPANNER_SVC,COLOSSUS_SVC storage
    class BORGMON,DAPPER_SVC,MONARCH_SVC monitoring`,
  },

  // Phase 2: Design Patterns Used
  patterns: [
    {
      patternSlug: 'cluster-management',
      patternName: 'Borg Cluster Management',
      usage: 'Centralized container orchestration across all Google services',
      implementation: 'Borg manages millions of jobs across massive clusters. Inspired Kubernetes. Uses constraint-based scheduling and bin-packing.',
      scale: 'Millions of containers, thousands of machines per cluster',
    },
    {
      patternSlug: 'distributed-storage',
      patternName: 'Distributed File System (Colossus)',
      usage: 'Petabyte-scale distributed storage for all Google data',
      implementation: 'Successor to GFS. Single cluster storing exabytes. Reed-Solomon encoding for durability.',
      scale: 'Exabytes of data, millions of QPS',
    },
    {
      patternSlug: 'globally-distributed-db',
      patternName: 'Globally Distributed Database (Spanner)',
      usage: 'Strongly consistent global SQL database',
      implementation: 'TrueTime API using atomic clocks and GPS for global consistency. External consistency guarantee.',
      scale: 'Millions of nodes, global replication with single-digit ms latency',
    },
    {
      patternSlug: 'wide-column-store',
      patternName: 'Wide Column Store (Bigtable)',
      usage: 'Sparse, distributed, persistent multi-dimensional sorted map',
      implementation: 'Tablets with row-range sharding. SSTable format. Bloom filters for reads.',
      scale: 'Petabytes per cluster, millions of operations per second',
    },
    {
      patternSlug: 'software-defined-networking',
      patternName: 'Software-Defined Networking',
      usage: 'Jupiter fabric for data center, B4 for WAN',
      implementation: 'Centralized control plane, OpenFlow-based. Traffic engineering for optimal utilization.',
      scale: '1.3 Pbps bisection bandwidth per data center',
    },
    {
      patternSlug: 'map-reduce',
      patternName: 'MapReduce and Dataflow',
      usage: 'Batch and stream processing at scale',
      implementation: 'MapReduce for batch, Dataflow for unified batch/stream. Auto-scaling workers.',
      scale: 'Exabytes processed daily',
    },
  ],

  // Phase 2: Technical Decisions (ADR-style)
  technicalDecisions: [
    {
      title: 'Building Custom Hardware - TPUs',
      context: 'GPUs were not optimized for TensorFlow workloads and ML inference at scale',
      decision: 'Designed custom Tensor Processing Units (TPUs) specifically for neural network workloads',
      consequences: [
        '15-30x better performance per watt than GPUs for inference',
        'Enabled training of massive models like BERT, PaLM',
        'Significant R&D investment required',
        'Now available to external customers via Cloud TPU',
      ],
      alternatives: ['GPU clusters', 'FPGAs', 'Standard CPUs'],
      sources: ['https://cloud.google.com/blog/products/ai-machine-learning/an-in-depth-look-at-googles-first-tensor-processing-unit-tpu'],
    },
    {
      title: 'Spanner TrueTime for Global Consistency',
      context: 'Needed globally distributed database with strong consistency, traditional approaches required 2PC which is slow',
      decision: 'Built TrueTime API using GPS and atomic clocks to bound clock uncertainty, enabling lock-free reads',
      consequences: [
        'External consistency without global locks',
        'Requires specialized hardware in every data center',
        'Single-digit millisecond commit latency globally',
        'Foundational for Cloud Spanner product',
      ],
      alternatives: ['Eventual consistency', 'Two-phase commit', 'Single-leader replication'],
      sources: ['https://research.google/pubs/pub39966/'],
    },
    {
      title: 'Protocol Buffers over JSON/XML',
      context: 'JSON and XML serialization was too slow and verbose for internal RPC',
      decision: 'Created Protocol Buffers - a language-neutral, platform-neutral serialization format',
      consequences: [
        '3-10x smaller than XML, 20-100x faster',
        'Strong schema enforcement with backward compatibility',
        'Code generation for multiple languages',
        'Industry standard, basis for gRPC',
      ],
      alternatives: ['JSON', 'XML', 'Thrift', 'Avro'],
      sources: ['https://protobuf.dev/'],
    },
    {
      title: 'Borg over Virtual Machines',
      context: 'VMs had too much overhead for the density and utilization needed',
      decision: 'Built Borg container orchestration system using Linux cgroups and namespaces',
      consequences: [
        'Higher machine utilization - 60-70% vs 20-30% with VMs',
        'Sub-second container startup vs minutes for VMs',
        'Complex isolation and security requirements',
        'Inspired Kubernetes which was open-sourced',
      ],
      alternatives: ['VMware', 'Xen', 'Dedicated machines'],
      sources: ['https://research.google/pubs/pub43438/'],
    },
  ],

  lastUpdated: '2024-12-01',
  sources: [
    'https://blog.research.google/',
    'https://cloud.google.com/blog',
    'https://github.com/google',
    'https://abc.xyz/investor/',
  ],
};
