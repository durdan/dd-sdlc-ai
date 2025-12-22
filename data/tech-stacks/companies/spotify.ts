import { Company } from '../types';

export const spotify: Company = {
  slug: 'spotify',
  name: 'Spotify',
  logo: '/tech-stacks/logos/spotify.svg',
  description: 'Microservices architecture with 2000+ services powering audio streaming',
  category: 'streaming',
  tags: ['streaming', 'audio', 'microservices', 'java', 'python', 'gcp', 'kubernetes'],

  info: {
    founded: 2006,
    headquarters: 'Stockholm, Sweden',
    employees: '9,000+',
    revenue: '$14B+',
    publiclyTraded: true,
    ticker: 'SPOT',
    website: 'https://spotify.com',
  },

  metrics: {
    users: '600M+ users',
    monthlyActiveUsers: '600M+',
    uptime: '99.9%',
    customMetrics: [
      { label: 'Premium Subscribers', value: '240M+' },
      { label: 'Songs', value: '100M+' },
      { label: 'Microservices', value: '2,000+' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
      { name: 'Electron', category: 'framework', usage: 'primary' },
    ],
    backend: [
      { name: 'Java', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Python', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Go', category: 'language', usage: 'secondary' },
      { name: 'gRPC', category: 'framework', usage: 'primary' },
    ],
    databases: [
      { name: 'Cassandra', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'PostgreSQL', category: 'database', usage: 'primary' },
      { name: 'Bigtable', category: 'database', usage: 'primary' },
      { name: 'Redis', category: 'cache', usage: 'primary' },
      { name: 'Memcached', category: 'cache', usage: 'primary' },
    ],
    infrastructure: [
      { name: 'Google Cloud', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary', isPrimary: true },
      { name: 'Docker', category: 'container', usage: 'primary' },
      { name: 'Cloud CDN', category: 'cdn', usage: 'primary' },
    ],
    devOps: [
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
      { name: 'Backstage', category: 'ci-cd', usage: 'primary', isPrimary: true },
      { name: 'Argo CD', category: 'ci-cd', usage: 'primary' },
      { name: 'Datadog', category: 'monitoring', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Apache Kafka', category: 'queue', usage: 'primary', isPrimary: true },
      { name: 'Apache Beam', category: 'analytics', usage: 'primary' },
      { name: 'BigQuery', category: 'analytics', usage: 'primary' },
      { name: 'Apache Spark', category: 'analytics', usage: 'primary' },
      { name: 'Scio', category: 'analytics', usage: 'primary' },
    ],
    ml: [
      { name: 'TensorFlow', category: 'ml-framework', usage: 'primary', isPrimary: true },
      { name: 'PyTorch', category: 'ml-framework', usage: 'primary' },
      { name: 'Kubeflow', category: 'ml-framework', usage: 'primary' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: '2000+ Microservices on GCP',
    htmlDiagram: {
      title: 'Spotify Architecture',
      subtitle: 'Cloud-Native Audio Streaming',
      layers: [
        {
          id: 'clients',
          name: 'Client Applications',
          position: 'top',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'desktop', name: 'Desktop (Electron)', techStack: ['React', 'TypeScript'] },
            { id: 'mobile', name: 'Mobile Apps', techStack: ['Native'] },
            { id: 'web', name: 'Web Player', techStack: ['React'] },
          ],
        },
        {
          id: 'gateway',
          name: 'API Gateway',
          position: 'top',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'api', name: 'Apollo GraphQL', techStack: ['GraphQL Federation'] },
          ],
        },
        {
          id: 'services',
          name: '2000+ Microservices',
          position: 'middle',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'playback', name: 'Playback', techStack: ['Java'] },
            { id: 'discovery', name: 'Discovery', techStack: ['Python', 'ML'] },
            { id: 'library', name: 'Library', techStack: ['Java'] },
            { id: 'social', name: 'Social', techStack: ['Java'] },
          ],
        },
        {
          id: 'platform',
          name: 'Platform (Backstage)',
          position: 'bottom',
          color: 'bg-purple-100 border-purple-300',
          items: [
            { id: 'backstage', name: 'Backstage Developer Portal', techStack: ['TypeScript', 'React'] },
            { id: 'k8s', name: 'Kubernetes', techStack: ['GKE'] },
            { id: 'storage', name: 'Storage', techStack: ['Cassandra', 'BigTable'] },
          ],
        },
      ],
      connections: [
        { from: 'clients', to: 'gateway', type: 'api-call' },
        { from: 'gateway', to: 'services', type: 'api-call' },
        { from: 'services', to: 'platform', type: 'data-flow' },
      ],
    },
    mermaidDiagram: `graph TB
    subgraph "Clients"
        DESK[Desktop App]
        MOB[Mobile Apps]
        WEB[Web Player]
    end

    subgraph "API Layer"
        GQL[Apollo GraphQL]
        REST[REST APIs]
    end

    subgraph "Services - 2000+"
        PLAY[Playback Service]
        DISC[Discovery/Recommendations]
        LIB[Library Service]
        SEARCH[Search Service]
        ADS[Ads Platform]
    end

    subgraph "Data Platform"
        KAFKA[/"Kafka"/]
        BEAM[Apache Beam]
        BQ[BigQuery]
        SPARK[Spark]
    end

    subgraph "Storage"
        CASS[(Cassandra)]
        BT[(Bigtable)]
        GCS[Cloud Storage]
        REDIS[Redis]
    end

    subgraph "Platform"
        BACK[Backstage]
        K8S[Kubernetes/GKE]
    end

    DESK --> GQL
    MOB --> GQL
    WEB --> GQL

    GQL --> PLAY
    GQL --> DISC
    GQL --> LIB
    GQL --> SEARCH

    PLAY --> CASS
    DISC --> KAFKA
    KAFKA --> BEAM
    BEAM --> BQ

    BACK --> K8S`,
    components: [
      {
        name: 'Backstage Developer Portal',
        description: 'Open-source internal developer platform for managing services and documentation',
        responsibilities: ['Service catalog', 'Documentation', 'CI/CD', 'Tech insights'],
        technologies: ['TypeScript', 'React', 'Node.js'],
      },
      {
        name: 'Discover Weekly ML',
        description: 'Personalized playlist generation using collaborative filtering and NLP',
        responsibilities: ['Music recommendations', 'Playlist generation', 'User modeling'],
        technologies: ['TensorFlow', 'Spark', 'Kafka'],
      },
    ],
  },

  highlights: [
    {
      title: 'Backstage Platform',
      description: 'Created open-source developer portal adopted by thousands',
      impact: 'CNCF graduated project used globally',
      technologies: ['TypeScript', 'React', 'Kubernetes'],
      icon: 'Layout',
    },
    {
      title: 'ML Recommendations',
      description: 'Personalized playlists for 600M+ users',
      impact: 'Discover Weekly has 100M+ listeners',
      technologies: ['TensorFlow', 'Spark', 'ML'],
      icon: 'Music',
    },
    {
      title: 'GCP Migration',
      description: 'Migrated entirely from data centers to GCP',
      impact: 'First major platform to go all-in on public cloud',
      technologies: ['GCP', 'Kubernetes', 'BigQuery'],
      icon: 'Cloud',
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Monthly Active Users', value: '600M+', trend: 'up' },
      { label: 'Premium Subscribers', value: '240M+', trend: 'up' },
      { label: 'Microservices', value: '2,000+', trend: 'stable' },
    ],
    innovationAreas: [
      {
        name: 'Audio Intelligence',
        description: 'AI-powered music analysis and recommendations',
        technologies: ['TensorFlow', 'Audio ML', 'NLP'],
        yearStarted: 2015,
      },
      {
        name: 'Podcast Platform',
        description: 'Expanding into spoken word and video podcasts',
        technologies: ['Video Streaming', 'Transcription', 'Discovery'],
        yearStarted: 2019,
      },
    ],
    openSource: [
      {
        name: 'Backstage',
        description: 'Open platform for building developer portals',
        url: 'https://github.com/backstage/backstage',
        stars: 26000,
        language: 'TypeScript',
      },
      {
        name: 'Luigi',
        description: 'Python module for building data pipelines',
        url: 'https://github.com/spotify/luigi',
        stars: 17000,
        language: 'Python',
      },
      {
        name: 'Scio',
        description: 'Scala API for Apache Beam',
        url: 'https://github.com/spotify/scio',
        stars: 2500,
        language: 'Scala',
      },
    ],
    engineeringBlog: 'https://engineering.atspotify.com/',
  },

  // Phase 2: Detailed Architecture Diagrams
  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Clients["Client Applications"]
        DESKTOP["Desktop App<br/>Electron + React"]
        MOBILE["Mobile Apps<br/>Native + React Native"]
        WEB["Web Player<br/>React SPA"]
        SPEAKER["Smart Speakers<br/>Embedded SDK"]
    end

    subgraph Gateway["API Gateway"]
        APOLLO["Apollo GraphQL<br/>Federation Gateway"]
        REST["REST APIs<br/>Legacy Endpoints"]
    end

    subgraph Services["2000+ Microservices"]
        PLAYBACK["Playback Service<br/>Java"]
        DISCOVERY["Discovery<br/>ML Recommendations"]
        LIBRARY["Library Service<br/>Java"]
        SEARCH["Search<br/>Elasticsearch"]
        SOCIAL["Social<br/>Following/Playlists"]
        ADS["Ad Platform<br/>Real-time Bidding"]
        PODCAST["Podcast Platform<br/>Audio Processing"]
    end

    subgraph Platform["Developer Platform"]
        BACKSTAGE["Backstage<br/>Developer Portal"]
        K8S["Kubernetes/GKE<br/>Container Orchestration"]
        ARGOCD["Argo CD<br/>GitOps Deployments"]
    end

    subgraph Data["Data Platform"]
        KAFKA[/"Apache Kafka<br/>Event Streaming"/]
        BEAM["Apache Beam<br/>Unified Processing"]
        BQ[("BigQuery<br/>Analytics")]
        SCIO["Scio<br/>Scala Beam API"]
    end

    subgraph Storage["Storage Layer"]
        CASS[("Cassandra<br/>User Data")]
        BIGTABLE[("Bigtable<br/>ML Features")]
        GCS["Cloud Storage<br/>Audio Files"]
        REDIS["Redis<br/>Session Cache"]
    end

    Clients --> Gateway
    Gateway --> Services
    Services --> Platform
    Services --> Data
    Data --> Storage`,

    dataFlow: `sequenceDiagram
    participant User
    participant App as Spotify App
    participant CDN as Google CDN
    participant Apollo as Apollo Gateway
    participant Playback as Playback Service
    participant Disco as Discovery ML
    participant Cass as Cassandra
    participant Kafka as Kafka
    participant BQ as BigQuery

    User->>App: Play song
    App->>CDN: Request audio file
    CDN-->>App: Stream audio (OGG Vorbis)
    App->>Apollo: GraphQL - Get recommendations
    Apollo->>Playback: Get queue
    Apollo->>Disco: Get recommendations
    Disco->>Cass: Fetch user taste profile
    Cass-->>Disco: Listening history
    Disco-->>Apollo: Personalized tracks
    Apollo-->>App: Combined response

    App->>Kafka: Stream play event
    Kafka->>BQ: Store for analytics

    Note over Disco: ML models trained on<br/>billions of listening events`,

    deployment: `flowchart TB
    subgraph GCP["Google Cloud Platform"]
        subgraph Region1["US Region"]
            subgraph GKE1["GKE Cluster"]
                POD1["2000+ Services"]
                ISTIO1["Istio Service Mesh"]
            end
            subgraph Data1["Data Tier"]
                CASS1[("Cassandra")]
                BT1[("Bigtable")]
            end
        end

        subgraph Region2["EU Region"]
            subgraph GKE2["GKE Cluster"]
                POD2["2000+ Services"]
                ISTIO2["Istio Service Mesh"]
            end
            subgraph Data2["Data Tier"]
                CASS2[("Cassandra")]
                BT2[("Bigtable")]
            end
        end

        subgraph Global["Global Services"]
            CDN["Cloud CDN"]
            LB["Cloud Load Balancer"]
            ARMOR["Cloud Armor"]
        end

        subgraph DataPlatform["Data Platform"]
            BQ[("BigQuery")]
            DATAFLOW["Dataflow/Beam"]
            PUBSUB[/"Pub/Sub"/]
        end
    end

    subgraph Backstage["Developer Experience"]
        PORTAL["Backstage Portal"]
        CATALOG["Service Catalog"]
        DOCS["Tech Docs"]
    end

    Internet["600M Users"] --> CDN
    CDN --> LB
    LB --> GKE1
    LB --> GKE2
    GKE1 --> Data1
    GKE2 --> Data2
    PORTAL --> GKE1
    PORTAL --> GKE2`,

    serviceInteraction: `flowchart LR
    subgraph Core["Core Services"]
        PLAY["Playback"]
        LIBRARY["Library"]
        QUEUE["Queue"]
    end

    subgraph Discovery["Discovery Domain"]
        HOME["Home"]
        SEARCH["Search"]
        RADIO["Radio"]
        WEEKLY["Discover Weekly"]
    end

    subgraph Social["Social Domain"]
        FOLLOW["Following"]
        PLAYLIST["Playlists"]
        COLLAB["Collaborative"]
    end

    subgraph Content["Content Domain"]
        CATALOG["Music Catalog"]
        PODCAST["Podcasts"]
        AUDIO["Audiobooks"]
    end

    subgraph ML["ML Platform"]
        RECS["Recommendations"]
        PERSONA["User Persona"]
        AUDIO_ML["Audio Analysis"]
    end

    PLAY --> QUEUE
    QUEUE --> LIBRARY

    HOME --> RECS
    SEARCH --> CATALOG
    WEEKLY --> RECS
    WEEKLY --> PERSONA

    PLAYLIST --> FOLLOW
    COLLAB --> PLAYLIST

    RECS --> PERSONA
    RECS --> AUDIO_ML
    CATALOG --> AUDIO_ML`,
  },

  // Phase 2: Design Patterns Used
  patterns: [
    {
      patternSlug: 'developer-portal',
      patternName: 'Backstage Developer Portal',
      usage: 'Internal developer experience platform',
      implementation: 'Created Backstage for service catalog, documentation, and developer workflows - now CNCF graduated project',
      scale: '2000+ services cataloged',
    },
    {
      patternSlug: 'graphql-federation',
      patternName: 'GraphQL Federation',
      usage: 'Unified API gateway',
      implementation: 'Apollo Federation connecting 2000+ microservices through single GraphQL endpoint',
      scale: 'Billions of queries/day',
    },
    {
      patternSlug: 'event-streaming',
      patternName: 'Event Streaming with Kafka',
      usage: 'Real-time data pipeline',
      implementation: 'Kafka for streaming listening events, enabling real-time recommendations and analytics',
      scale: 'Billions of events/day',
    },
    {
      patternSlug: 'ml-recommendations',
      patternName: 'ML-Based Recommendations',
      usage: 'Personalized content discovery',
      implementation: 'Collaborative filtering, NLP for audio analysis, and deep learning for taste profiles',
      scale: '600M users personalized',
    },
    {
      patternSlug: 'gitops',
      patternName: 'GitOps with Argo CD',
      usage: 'Declarative deployments',
      implementation: 'All 2000+ services deployed via GitOps, with Backstage providing developer interface',
      scale: 'Thousands of deployments/day',
    },
    {
      patternSlug: 'cloud-native',
      patternName: 'Cloud-Native on GCP',
      usage: 'Full public cloud architecture',
      implementation: 'One of first major companies to migrate entirely to public cloud (GCP), using GKE, BigQuery, Bigtable',
      scale: 'Exabytes of data in GCP',
    },
  ],

  // Phase 2: Technical Decisions (ADR-style)
  technicalDecisions: [
    {
      title: 'Why Create Backstage for Developer Experience',
      context: 'With 2000+ microservices and hundreds of engineers, developer productivity and service discovery became critical',
      decision: 'Built Backstage as internal developer portal, then open-sourced it',
      consequences: [
        'Unified service catalog for all teams',
        'Standardized documentation and onboarding',
        'Became CNCF graduated project',
        'Reduced cognitive load for developers',
        'Enabled self-service infrastructure',
      ],
      alternatives: ['Internal wiki', 'Multiple point solutions', 'Custom portal'],
      sources: ['https://engineering.atspotify.com/2020/03/what-the-heck-is-backstage-anyway/'],
    },
    {
      title: 'Why Migrate to Google Cloud Platform',
      context: 'Managing own data centers was limiting growth and innovation speed',
      decision: 'Became one of first major companies to fully migrate to public cloud (GCP)',
      consequences: [
        'Eliminated data center operations burden',
        'Gained access to managed services (BigQuery, Bigtable, GKE)',
        'Enabled global scaling without infrastructure buildout',
        'Required significant cloud expertise development',
        'Proved public cloud viable for large-scale streaming',
      ],
      alternatives: ['AWS', 'Azure', 'Hybrid cloud', 'Continue with data centers'],
      sources: ['https://engineering.atspotify.com/2016/02/spotify-loves-google-cloud-platform/'],
    },
    {
      title: 'Why Apache Beam for Data Processing',
      context: 'Needed unified batch and streaming data processing that works with GCP',
      decision: 'Adopted Apache Beam with Scio (Scala API) for all data processing',
      consequences: [
        'Unified API for batch and streaming',
        'Created Scio library for Scala developers',
        'Tight integration with Google Dataflow',
        'Enabled ML feature engineering at scale',
        'Learning curve for Beam model',
      ],
      alternatives: ['Apache Spark only', 'Apache Flink', 'Cloud Dataflow directly'],
      sources: ['https://engineering.atspotify.com/2017/10/big-data-processing-at-spotify-the-road-to-scio-part-1/'],
    },
    {
      title: 'Why Collaborative Filtering for Recommendations',
      context: 'Needed to personalize music discovery for 600M+ users with diverse tastes',
      decision: 'Built ML platform combining collaborative filtering, audio analysis, and NLP on listening data',
      consequences: [
        'Discover Weekly became signature feature',
        'Required massive compute for training',
        'User engagement significantly increased',
        'Created competitive moat in personalization',
        'Needed careful balance to avoid filter bubbles',
      ],
      alternatives: ['Simple popularity-based', 'Editorial curation only', 'Genre-based'],
      sources: ['https://engineering.atspotify.com/2020/08/how-spotify-helps-you-discover-your-new-favorite-artist/'],
    },
  ],

  lastUpdated: '2024-12-01',
  sources: ['https://engineering.atspotify.com/', 'https://github.com/spotify'],
};
