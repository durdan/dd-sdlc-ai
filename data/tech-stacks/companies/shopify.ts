import { Company } from '../types';

export const shopify: Company = {
  slug: 'shopify',
  name: 'Shopify',
  logo: '/tech-stacks/logos/shopify.svg',
  description: 'E-commerce platform powering millions of merchants with resilient infrastructure handling Black Friday peaks',
  category: 'e-commerce',
  tags: ['e-commerce', 'ruby', 'rails', 'mysql', 'vitess', 'kubernetes', 'graphql'],

  info: {
    founded: 2006,
    headquarters: 'Ottawa, Canada',
    employees: '10,000+',
    revenue: '$7B+',
    publiclyTraded: true,
    ticker: 'SHOP',
    website: 'https://shopify.com',
  },

  metrics: {
    users: 'Millions of merchants',
    requestsPerDay: '10M+ requests/min at peak',
    uptime: '99.99%',
    dataProcessed: 'Billions of events/day',
    customMetrics: [
      { label: 'Annual GMV', value: '$200B+' },
      { label: 'BFCM Peak Sales', value: '$9.3B' },
      { label: 'Checkout Speed', value: '<1 sec avg' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'Polaris', category: 'library', usage: 'primary' },
      { name: 'Hydrogen', category: 'framework', usage: 'primary' },
      { name: 'Remix', category: 'framework', usage: 'primary' },
    ],
    backend: [
      { name: 'Ruby', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Ruby on Rails', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'Go', category: 'language', usage: 'primary' },
      { name: 'Rust', category: 'language', usage: 'secondary' },
      { name: 'GraphQL', category: 'framework', usage: 'primary' },
    ],
    databases: [
      { name: 'MySQL', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'Vitess', category: 'database', usage: 'primary', isPrimary: true, description: 'MySQL sharding' },
      { name: 'Redis', category: 'cache', usage: 'primary' },
      { name: 'Elasticsearch', category: 'search', usage: 'primary' },
    ],
    infrastructure: [
      { name: 'GCP', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
      { name: 'Cloudflare', category: 'cdn', usage: 'primary' },
    ],
    devOps: [
      { name: 'Shipit', category: 'ci-cd', usage: 'primary' },
      { name: 'Buildkite', category: 'ci-cd', usage: 'primary' },
      { name: 'Datadog', category: 'monitoring', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Apache Kafka', category: 'queue', usage: 'primary', isPrimary: true },
      { name: 'Sidekiq', category: 'queue', usage: 'primary' },
    ],
    ml: [
      { name: 'Custom ML', category: 'ml-framework', usage: 'primary' },
    ],
  },

  architecture: {
    type: 'modular-monolith',
    style: 'distributed',
    description: 'Modular Rails Monolith with Vitess',
    htmlDiagram: {
      title: 'Shopify Architecture',
      subtitle: 'Resilient E-commerce Platform',
      layers: [
        {
          id: 'merchants',
          name: 'Merchants & Buyers',
          position: 'top',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'stores', name: 'Online Stores', techStack: ['Liquid', 'React'] },
            { id: 'pos', name: 'Point of Sale', techStack: ['iOS', 'Android'] },
            { id: 'admin', name: 'Admin', techStack: ['React', 'Polaris'] },
          ],
        },
        {
          id: 'edge',
          name: 'Edge Layer',
          position: 'middle',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'cdn', name: 'CDN', techStack: ['Cloudflare'] },
            { id: 'edge', name: 'Edge Workers', techStack: ['Lua', 'Rust'] },
          ],
        },
        {
          id: 'core',
          name: 'Core Platform',
          position: 'middle',
          color: 'bg-purple-100 border-purple-300',
          items: [
            { id: 'rails', name: 'Rails Monolith', techStack: ['Ruby', 'Rails'] },
            { id: 'checkout', name: 'Checkout', techStack: ['Go', 'Optimized'] },
            { id: 'payments', name: 'Payments', techStack: ['Go'] },
          ],
        },
        {
          id: 'data',
          name: 'Data Layer',
          position: 'bottom',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'vitess', name: 'Vitess MySQL', techStack: ['1000+ shards'] },
            { id: 'redis', name: 'Redis', techStack: ['Cache', 'Sessions'] },
            { id: 'kafka', name: 'Kafka', techStack: ['Event Stream'] },
          ],
        },
      ],
      connections: [
        { from: 'merchants', to: 'edge', type: 'api-call' },
        { from: 'edge', to: 'core', type: 'data-flow' },
        { from: 'core', to: 'data', type: 'data-flow' },
      ],
    },
  },

  highlights: [
    {
      title: 'Rails at Scale',
      description: 'One of the largest Rails apps',
      impact: 'Proves monolith can scale',
      technologies: ['Ruby on Rails', 'Vitess'],
      icon: 'Code',
    },
    {
      title: 'BFCM Resilience',
      description: 'Handles extreme traffic spikes',
      impact: '$9.3B in 2023 BFCM sales',
      technologies: ['Semian', 'Load Shedding'],
      icon: 'Shield',
    },
    {
      title: 'Vitess MySQL',
      description: 'Horizontal MySQL scaling',
      impact: '1000+ shards, no downtime',
      technologies: ['Vitess', 'MySQL'],
      icon: 'Database',
    },
  ],

  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Buyers["Shoppers Worldwide"]
        Browser["Web Browser"]
        ShopApp["Shop App"]
        POS["Point of Sale"]
    end

    subgraph Edge["Edge Network"]
        Cloudflare["Cloudflare - DDoS + CDN"]
        EdgeWorkers["Edge Workers"]
    end

    subgraph Core["Core Platform - Rails"]
        Storefront["Storefront - Liquid"]
        Admin["Admin - GraphQL"]
        Checkout["Checkout - Optimized"]
    end

    subgraph Data["Data Layer"]
        Vitess[("Vitess - MySQL Sharding - 1000+ shards")]
        Redis["Redis - Cache"]
        Kafka[/"Kafka - Events"/]
    end

    Buyers --> Edge
    Edge --> Core
    Core --> Data`,

    dataFlow: `sequenceDiagram
    participant Buyer
    participant Edge as Cloudflare
    participant Store as Storefront
    participant Cart as Cart
    participant Checkout
    participant Payment
    participant DB as Vitess

    Buyer->>Edge: Visit store
    Edge->>Store: Load storefront
    Store->>DB: Get products
    Store-->>Buyer: Rendered page

    Buyer->>Cart: Add to cart
    Cart->>Redis: Store cart

    Buyer->>Checkout: Begin checkout
    Checkout->>DB: Reserve inventory
    Checkout->>Payment: Process payment
    Payment-->>Checkout: Success
    Checkout-->>Buyer: Order confirmed`,

    deployment: `flowchart TB
    subgraph GCP["Google Cloud"]
        subgraph K8s["Kubernetes"]
            Rails["Rails Pods"]
            Workers["Background Jobs"]
        end
        subgraph Data["Data"]
            Vitess["Vitess Clusters"]
            Redis["Redis Cluster"]
        end
    end

    subgraph Deploy["Deployment"]
        Shipit["Shipit"]
        Buildkite["Buildkite CI"]
    end

    Deploy --> K8s`,

    serviceInteraction: `flowchart LR
    subgraph Monolith["Rails Monolith"]
        Core["Core Commerce"]
        API["GraphQL API"]
        Webhooks["Webhooks"]
    end

    subgraph Services["Go Services"]
        CheckoutSvc["Checkout"]
        PaymentSvc["Payments"]
    end

    subgraph Async["Async"]
        Kafka[/"Kafka"/]
        Sidekiq["Sidekiq"]
    end

    API --> Core
    Core --> Services
    Core --> Async`,
  },

  patterns: [
    {
      patternSlug: 'modular-monolith',
      patternName: 'Modular Monolith',
      usage: 'Rails with clear boundaries',
      implementation: 'Domain-driven components in single deployable',
      scale: 'Millions of merchants',
    },
    {
      patternSlug: 'vitess-sharding',
      patternName: 'Vitess MySQL Sharding',
      usage: 'Horizontal MySQL scaling',
      implementation: '1000+ shards, merchant-based key',
      scale: 'Exabytes of data',
    },
  ],

  technicalDecisions: [
    {
      title: 'Why Keep the Rails Monolith',
      context: 'Many companies moved to microservices',
      decision: 'Invested in modular monolith instead',
      consequences: [
        'Maintained development velocity',
        'Easier consistency and refactoring',
        'Simpler deployment and testing',
      ],
      alternatives: ['Full microservices', 'Serverless'],
      sources: ['https://shopify.engineering/shopify-monolith'],
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Annual GMV', value: '$200B+', trend: 'up' },
      { label: 'BFCM Peak', value: '10M+ req/min', trend: 'up' },
    ],
    openSource: [
      {
        name: 'Polaris',
        description: 'React component library',
        url: 'https://github.com/Shopify/polaris',
        stars: 5500,
        language: 'TypeScript',
      },
      {
        name: 'Liquid',
        description: 'Template language',
        url: 'https://github.com/Shopify/liquid',
        stars: 10000,
        language: 'Ruby',
      },
    ],
    engineeringBlog: 'https://shopify.engineering',
  },

  lastUpdated: '2024-12-01',
  sources: ['https://shopify.engineering', 'https://github.com/Shopify'],
};
