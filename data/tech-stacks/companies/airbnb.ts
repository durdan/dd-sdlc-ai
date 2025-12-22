import { Company } from '../types';

export const airbnb: Company = {
  slug: 'airbnb',
  name: 'Airbnb',
  logo: '/tech-stacks/logos/airbnb.svg',
  description: 'Service-oriented architecture powering global travel marketplace',
  category: 'transportation',
  tags: ['travel', 'marketplace', 'ruby', 'react', 'java', 'microservices'],

  info: {
    founded: 2008,
    headquarters: 'San Francisco, CA',
    employees: '6,000+',
    revenue: '$9.9B',
    publiclyTraded: true,
    ticker: 'ABNB',
    website: 'https://airbnb.com',
  },

  metrics: {
    users: '150M+ users',
    customMetrics: [
      { label: 'Listings', value: '7M+' },
      { label: 'Countries', value: '220+' },
      { label: 'Guest Arrivals', value: '1B+ cumulative' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
      { name: 'Next.js', category: 'framework', usage: 'primary' },
      { name: 'Lottie', category: 'library', usage: 'primary' },
    ],
    backend: [
      { name: 'Ruby', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Ruby on Rails', category: 'framework', usage: 'primary' },
      { name: 'Java', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Kotlin', category: 'language', usage: 'secondary' },
      { name: 'Thrift', category: 'framework', usage: 'primary' },
    ],
    databases: [
      { name: 'MySQL', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'PostgreSQL', category: 'database', usage: 'primary' },
      { name: 'Redis', category: 'cache', usage: 'primary' },
      { name: 'Elasticsearch', category: 'search', usage: 'primary' },
      { name: 'Amazon DynamoDB', category: 'database', usage: 'secondary' },
    ],
    infrastructure: [
      { name: 'AWS', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary', isPrimary: true },
      { name: 'Docker', category: 'container', usage: 'primary' },
    ],
    devOps: [
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
      { name: 'Spinnaker', category: 'ci-cd', usage: 'primary' },
      { name: 'Datadog', category: 'monitoring', usage: 'primary' },
      { name: 'Terraform', category: 'ci-cd', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Apache Kafka', category: 'queue', usage: 'primary' },
      { name: 'Apache Spark', category: 'analytics', usage: 'primary', isPrimary: true },
      { name: 'Apache Airflow', category: 'analytics', usage: 'primary', isPrimary: true },
      { name: 'Presto', category: 'analytics', usage: 'primary' },
      { name: 'Druid', category: 'analytics', usage: 'primary' },
    ],
    ml: [
      { name: 'PyTorch', category: 'ml-framework', usage: 'primary' },
      { name: 'TensorFlow', category: 'ml-framework', usage: 'primary' },
      { name: 'Bighead', category: 'ml-framework', usage: 'primary', isPrimary: true, description: 'Airbnb ML platform' },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: 'SOA Marketplace Platform',
    htmlDiagram: {
      title: 'Airbnb Architecture',
      subtitle: 'Global Travel Marketplace',
      layers: [
        {
          id: 'clients',
          name: 'Client Applications',
          position: 'top',
          color: 'bg-red-100 border-red-300',
          items: [
            { id: 'web', name: 'Web (React)', techStack: ['React', 'Next.js'] },
            { id: 'mobile', name: 'Mobile Apps', techStack: ['Native'] },
          ],
        },
        {
          id: 'api',
          name: 'API Layer',
          position: 'top',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'gateway', name: 'API Gateway', techStack: ['Java', 'Thrift'] },
            { id: 'graphql', name: 'GraphQL', techStack: ['Apollo'] },
          ],
        },
        {
          id: 'services',
          name: 'Domain Services',
          position: 'middle',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'search', name: 'Search', techStack: ['Java', 'Elasticsearch'] },
            { id: 'booking', name: 'Booking', techStack: ['Ruby', 'Java'] },
            { id: 'pricing', name: 'Smart Pricing', techStack: ['ML', 'Python'] },
            { id: 'trust', name: 'Trust & Safety', techStack: ['ML'] },
          ],
        },
        {
          id: 'data',
          name: 'Data Platform',
          position: 'bottom',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'airflow', name: 'Airflow', techStack: ['Orchestration'] },
            { id: 'spark', name: 'Spark', techStack: ['Processing'] },
            { id: 'mysql', name: 'MySQL', techStack: ['RDBMS'] },
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
    subgraph "Clients"
        WEB[Web App - React]
        IOS[iOS App]
        AND[Android App]
    end

    subgraph "API Gateway"
        GW[API Gateway]
        GQL[GraphQL - Apollo]
    end

    subgraph "Services"
        SEARCH[Search Service]
        BOOK[Booking Service]
        PAY[Payments]
        PRICE[Smart Pricing ML]
        TRUST[Trust & Safety]
        MSG[Messaging]
    end

    subgraph "Data Platform"
        AIRFLOW[Apache Airflow]
        SPARK[Apache Spark]
        PRESTO[Presto]
        DRUID[Druid]
    end

    subgraph "Storage"
        MYSQL[(MySQL)]
        ES[Elasticsearch]
        REDIS[Redis]
        S3[S3]
    end

    subgraph "ML Platform"
        BIGHEAD[Bighead ML]
        ZIPLINE[Zipline Features]
    end

    WEB --> GW
    IOS --> GW
    AND --> GW
    GW --> GQL

    GQL --> SEARCH
    GQL --> BOOK
    GQL --> PAY
    GQL --> MSG

    SEARCH --> ES
    BOOK --> MYSQL
    PRICE --> BIGHEAD
    TRUST --> BIGHEAD

    AIRFLOW --> SPARK
    SPARK --> PRESTO
    BIGHEAD --> ZIPLINE`,
    components: [
      {
        name: 'Apache Airflow',
        description: 'Workflow orchestration platform created at Airbnb, now Apache project',
        responsibilities: ['DAG scheduling', 'Workflow management', 'Data pipeline orchestration'],
        technologies: ['Python', 'PostgreSQL', 'Celery'],
      },
      {
        name: 'Bighead ML Platform',
        description: 'End-to-end machine learning platform for search ranking and pricing',
        responsibilities: ['Model training', 'Feature engineering', 'Model serving', 'A/B testing'],
        technologies: ['Python', 'Spark', 'Kubernetes'],
      },
    ],
  },

  highlights: [
    {
      title: 'Apache Airflow',
      description: 'Created Airflow for workflow orchestration',
      impact: 'Most popular data pipeline orchestrator globally',
      technologies: ['Python', 'Apache Airflow'],
      icon: 'Workflow',
    },
    {
      title: 'Smart Pricing',
      description: 'ML-powered dynamic pricing for hosts',
      impact: 'Optimizes pricing for millions of listings',
      technologies: ['ML', 'Spark', 'Python'],
      icon: 'DollarSign',
    },
    {
      title: 'Lottie Animations',
      description: 'Open-source animation library for mobile',
      impact: 'Adopted by thousands of apps worldwide',
      technologies: ['Lottie', 'After Effects', 'JSON'],
      icon: 'Sparkles',
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Active Users', value: '150M+', trend: 'up' },
      { label: 'Listings', value: '7M+', trend: 'up' },
      { label: 'Countries', value: '220+', trend: 'stable' },
    ],
    innovationAreas: [
      {
        name: 'AI Photography',
        description: 'ML-powered photo selection and enhancement',
        technologies: ['Computer Vision', 'PyTorch'],
        yearStarted: 2019,
      },
      {
        name: 'Experiences Platform',
        description: 'Marketplace for activities and experiences',
        technologies: ['Search', 'Recommendations', 'Payments'],
        yearStarted: 2016,
      },
    ],
    openSource: [
      {
        name: 'Airflow',
        description: 'Platform to programmatically author, schedule and monitor workflows',
        url: 'https://github.com/apache/airflow',
        stars: 34000,
        language: 'Python',
      },
      {
        name: 'Lottie',
        description: 'Render After Effects animations natively',
        url: 'https://github.com/airbnb/lottie-web',
        stars: 29000,
        language: 'JavaScript',
      },
      {
        name: 'Visx',
        description: 'Collection of visualization components for React',
        url: 'https://github.com/airbnb/visx',
        stars: 18000,
        language: 'TypeScript',
      },
      {
        name: 'ts-migrate',
        description: 'Tool to help migrate JavaScript to TypeScript',
        url: 'https://github.com/airbnb/ts-migrate',
        stars: 5000,
        language: 'TypeScript',
      },
    ],
    engineeringBlog: 'https://medium.com/airbnb-engineering',
  },

  // Phase 2: Detailed Architecture Diagrams
  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Clients["Client Applications"]
        WEB["Web App<br/>React + Next.js"]
        IOS["iOS App<br/>Swift"]
        AND["Android App<br/>Kotlin"]
    end

    subgraph Gateway["API Layer"]
        APIGW["API Gateway<br/>Java + Thrift"]
        GRAPHQL["GraphQL<br/>Apollo Federation"]
    end

    subgraph Services["Domain Services"]
        SEARCH["Search Service<br/>Elasticsearch"]
        BOOKING["Booking Service<br/>Ruby + Java"]
        PRICING["Smart Pricing<br/>ML Pipeline"]
        PAYMENTS["Payments<br/>Java"]
        MESSAGING["Messaging<br/>Real-time"]
        REVIEWS["Reviews<br/>Trust System"]
        TRUST["Trust and Safety<br/>ML Fraud Detection"]
    end

    subgraph ML["ML Platform - Bighead"]
        BIGHEAD["Bighead<br/>ML Platform"]
        ZIPLINE["Zipline<br/>Feature Store"]
        CHRONON["Chronon<br/>Feature Engineering"]
    end

    subgraph DataPlatform["Data Platform"]
        AIRFLOW["Apache Airflow<br/>Workflow Orchestration"]
        SPARK["Apache Spark<br/>Data Processing"]
        PRESTO["Presto<br/>SQL Queries"]
        DRUID[("Druid<br/>OLAP")]
    end

    subgraph Storage["Storage Layer"]
        MYSQL[("MySQL<br/>Primary RDBMS")]
        ES[("Elasticsearch<br/>Search Index")]
        REDIS["Redis<br/>Caching"]
        S3["S3<br/>Media Storage"]
        DYNAMO[("DynamoDB<br/>Sessions")]
    end

    Clients --> Gateway
    Gateway --> Services
    Services --> ML
    Services --> Storage
    ML --> DataPlatform
    DataPlatform --> Storage`,

    dataFlow: `sequenceDiagram
    participant Guest
    participant App as Airbnb App
    participant GQL as GraphQL Gateway
    participant Search as Search Service
    participant Pricing as Smart Pricing
    participant ES as Elasticsearch
    participant ML as Bighead ML
    participant Booking as Booking Service
    participant MySQL as MySQL

    Guest->>App: Search "Paris apartments"
    App->>GQL: GraphQL Query
    GQL->>Search: Search request
    Search->>ES: Query listings
    ES-->>Search: Raw results
    Search->>ML: Get price predictions
    ML-->>Search: Dynamic prices
    Search->>Pricing: Apply smart pricing
    Pricing-->>Search: Adjusted prices
    Search-->>GQL: Ranked listings
    GQL-->>App: Search results
    App-->>Guest: Display listings

    Guest->>App: Book listing
    App->>GQL: Create reservation
    GQL->>Booking: Process booking
    Booking->>MySQL: Check availability
    MySQL-->>Booking: Available
    Booking->>MySQL: Create reservation
    Booking-->>GQL: Booking confirmed
    GQL-->>App: Confirmation
    App-->>Guest: Booking success`,

    deployment: `flowchart TB
    subgraph AWS["AWS Cloud"]
        subgraph Region1["US-East Region"]
            subgraph EKS1["EKS Cluster"]
                SVC1["Services"]
                RAILS1["Rails Monolith"]
            end
            subgraph Data1["Data Tier"]
                RDS1[("Aurora MySQL")]
                ES1[("Elasticsearch")]
            end
        end

        subgraph Region2["EU Region"]
            subgraph EKS2["EKS Cluster"]
                SVC2["Services"]
                RAILS2["Rails Monolith"]
            end
            subgraph Data2["Data Tier"]
                RDS2[("Aurora MySQL")]
                ES2[("Elasticsearch")]
            end
        end

        subgraph Global["Global Infrastructure"]
            CF["CloudFront CDN"]
            R53["Route 53"]
            ALB["Application Load Balancer"]
        end

        subgraph DataLayer["Data Platform"]
            EMR["EMR - Spark"]
            S3_DATA["S3 Data Lake"]
            AIRFLOW_SVC["Airflow"]
        end
    end

    subgraph Monitoring["Observability"]
        DD["Datadog"]
        PD["PagerDuty"]
    end

    Internet["150M Users"] --> CF
    CF --> R53
    R53 --> ALB
    ALB --> EKS1
    ALB --> EKS2
    EKS1 --> Data1
    EKS2 --> Data2
    AIRFLOW_SVC --> EMR
    EMR --> S3_DATA`,

    serviceInteraction: `flowchart LR
    subgraph Guest["Guest Journey"]
        SEARCH["Search"]
        LISTING["View Listing"]
        BOOK["Book"]
        STAY["Stay"]
        REVIEW["Review"]
    end

    subgraph Host["Host Journey"]
        CREATE["Create Listing"]
        PRICE["Set Pricing"]
        MANAGE["Manage Booking"]
        HOST_REV["Host Review"]
    end

    subgraph Core["Core Services"]
        SEARCH_SVC["Search Service"]
        BOOKING_SVC["Booking Service"]
        PAYMENT["Payments"]
        MSG["Messaging"]
    end

    subgraph Trust["Trust Layer"]
        VERIFY["Verification"]
        FRAUD["Fraud Detection"]
        SAFETY["Trust and Safety"]
    end

    subgraph ML["ML Services"]
        SMART_PRICE["Smart Pricing"]
        RECS["Recommendations"]
        MATCH["Host-Guest Matching"]
    end

    SEARCH --> SEARCH_SVC
    LISTING --> SEARCH_SVC
    BOOK --> BOOKING_SVC
    BOOK --> PAYMENT

    CREATE --> VERIFY
    PRICE --> SMART_PRICE
    MANAGE --> BOOKING_SVC

    BOOKING_SVC --> FRAUD
    SEARCH_SVC --> RECS
    MSG --> SAFETY`,
  },

  // Phase 2: Design Patterns Used
  patterns: [
    {
      patternSlug: 'workflow-orchestration',
      patternName: 'Apache Airflow Orchestration',
      usage: 'Data pipeline management',
      implementation: 'Created Airflow for DAG-based workflow scheduling - now Apache top-level project used globally',
      scale: 'Thousands of DAGs daily',
    },
    {
      patternSlug: 'ml-platform',
      patternName: 'Bighead ML Platform',
      usage: 'End-to-end machine learning',
      implementation: 'Custom platform for feature engineering (Zipline), model training, serving, and experimentation',
      scale: 'Hundreds of ML models in production',
    },
    {
      patternSlug: 'smart-pricing',
      patternName: 'Dynamic Pricing ML',
      usage: 'Automated price optimization',
      implementation: 'ML models analyzing demand, seasonality, local events, and comparable listings for price recommendations',
      scale: '7M+ listings priced',
    },
    {
      patternSlug: 'service-oriented',
      patternName: 'Service-Oriented Architecture',
      usage: 'Domain-driven microservices',
      implementation: 'Evolved from Rails monolith to SOA with domain services for search, booking, payments, messaging',
      scale: 'Hundreds of services',
    },
    {
      patternSlug: 'trust-safety',
      patternName: 'Trust and Safety ML',
      usage: 'Fraud prevention and safety',
      implementation: 'ML models for identity verification, fraud detection, content moderation, and risk scoring',
      scale: 'Millions of verifications/day',
    },
    {
      patternSlug: 'animation-library',
      patternName: 'Lottie Animation System',
      usage: 'High-quality animations',
      implementation: 'Created Lottie for After Effects to native animation rendering - open-sourced and widely adopted',
      scale: 'Used by thousands of apps',
    },
  ],

  // Phase 2: Technical Decisions (ADR-style)
  technicalDecisions: [
    {
      title: 'Why Create Apache Airflow',
      context: 'Needed a way to programmatically author, schedule, and monitor complex data workflows',
      decision: 'Built Airflow as Python-based workflow orchestrator with DAG-based scheduling',
      consequences: [
        'Programmatic workflow definition in Python',
        'Became industry standard for data orchestration',
        'Rich ecosystem of operators and connections',
        'Open-sourced and donated to Apache',
        'Requires careful DAG design at scale',
      ],
      alternatives: ['Luigi', 'Oozie', 'Azkaban', 'Custom scheduler'],
      sources: ['https://medium.com/airbnb-engineering/airflow-a-workflow-management-platform-46318b977fd8'],
    },
    {
      title: 'Why Ruby on Rails for Core Platform',
      context: 'Small startup needed rapid development and iteration on product features',
      decision: 'Built core platform on Ruby on Rails, evolved to SOA as scale demanded',
      consequences: [
        'Rapid initial development and iteration',
        'Convention over configuration reduced decisions',
        'Needed to extract services as scale increased',
        'Still runs significant Rails code today',
        'Gradually adding Java services for performance-critical paths',
      ],
      alternatives: ['Python Django', 'Java Spring', 'Node.js'],
      sources: ['https://medium.com/airbnb-engineering/'],
    },
    {
      title: 'Why Create Lottie for Animations',
      context: 'Designers created animations in After Effects but implementing natively was expensive and inconsistent',
      decision: 'Built Lottie to render After Effects animations natively on mobile and web',
      consequences: [
        'Designers export directly to production',
        'Consistent animations across platforms',
        'Open-sourced and massively adopted',
        'JSON format is large for complex animations',
        'Created ecosystem of tools and plugins',
      ],
      alternatives: ['GIF animations', 'Native code for each animation', 'Video files'],
      sources: ['https://airbnb.design/introducing-lottie/'],
    },
    {
      title: 'Why Build Custom ML Platform (Bighead)',
      context: 'Needed integrated platform for feature engineering, model training, and serving at scale',
      decision: 'Built Bighead with Zipline feature store and integrated experiment framework',
      consequences: [
        'Unified ML workflow from features to production',
        'Feature reuse across models',
        'Integrated A/B testing for ML',
        'Significant engineering investment',
        'Tight integration with Airbnb infrastructure',
      ],
      alternatives: ['Databricks', 'Kubeflow', 'SageMaker'],
      sources: ['https://medium.com/airbnb-engineering/bighead-airbnbs-end-to-end-machine-learning-platform-cf28fb3e4587'],
    },
  ],

  lastUpdated: '2024-12-01',
  sources: ['https://medium.com/airbnb-engineering', 'https://github.com/airbnb'],
};
