import { Company } from '../types';

export const paypal: Company = {
  slug: 'paypal',
  name: 'PayPal',
  logo: '/tech-stacks/logos/paypal.svg',
  description: 'Global payments platform processing $1.5T+ annually with real-time fraud detection and GraphQL federation',
  category: 'fintech',
  tags: ['fintech', 'payments', 'java', 'graphql', 'kafka', 'fraud-detection', 'ml'],

  info: {
    founded: 1998,
    headquarters: 'San Jose, CA',
    employees: '25,000+',
    revenue: '$30B+',
    publiclyTraded: true,
    ticker: 'PYPL',
    website: 'https://paypal.com',
  },

  metrics: {
    users: '400M+ active accounts',
    requestsPerSecond: '10K+ transactions/sec',
    uptime: '99.99%',
    dataProcessed: 'Petabytes of financial data',
    customMetrics: [
      { label: 'Annual Volume', value: '$1.5T+' },
      { label: 'Transactions/Day', value: '40M+' },
      { label: 'Fraud Detection', value: '99%+' },
    ],
  },

  techStack: {
    frontend: [
      { name: 'React', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'TypeScript', category: 'language', usage: 'primary' },
      { name: 'Node.js', category: 'framework', usage: 'primary' },
    ],
    backend: [
      { name: 'Java', category: 'language', usage: 'primary', isPrimary: true },
      { name: 'Spring', category: 'framework', usage: 'primary', isPrimary: true },
      { name: 'GraphQL', category: 'framework', usage: 'primary' },
      { name: 'Go', category: 'language', usage: 'secondary' },
    ],
    databases: [
      { name: 'Oracle', category: 'database', usage: 'primary', isPrimary: true },
      { name: 'MySQL', category: 'database', usage: 'primary' },
      { name: 'Cassandra', category: 'database', usage: 'primary' },
      { name: 'Redis', category: 'cache', usage: 'primary' },
    ],
    infrastructure: [
      { name: 'Private Cloud', category: 'container', usage: 'primary', isPrimary: true },
      { name: 'GCP', category: 'container', usage: 'secondary' },
      { name: 'Kubernetes', category: 'orchestration', usage: 'primary' },
    ],
    devOps: [
      { name: 'Jenkins', category: 'ci-cd', usage: 'primary' },
      { name: 'Splunk', category: 'monitoring', usage: 'primary' },
      { name: 'PagerDuty', category: 'monitoring', usage: 'primary' },
    ],
    dataEngineering: [
      { name: 'Apache Kafka', category: 'queue', usage: 'primary', isPrimary: true },
    ],
    ml: [
      { name: 'Custom ML', category: 'ml-framework', usage: 'primary', isPrimary: true },
    ],
  },

  architecture: {
    type: 'microservices',
    style: 'distributed',
    description: 'GraphQL Federation with ML Fraud Detection',
    htmlDiagram: {
      title: 'PayPal Architecture',
      subtitle: 'Enterprise-Scale Payments Platform',
      layers: [
        {
          id: 'channels',
          name: 'Payment Channels',
          position: 'top',
          color: 'bg-blue-100 border-blue-300',
          items: [
            { id: 'checkout', name: 'Checkout', techStack: ['React'] },
            { id: 'venmo', name: 'Venmo', techStack: ['P2P'] },
            { id: 'braintree', name: 'Braintree', techStack: ['Merchant'] },
          ],
        },
        {
          id: 'gateway',
          name: 'API Gateway',
          position: 'middle',
          color: 'bg-purple-100 border-purple-300',
          items: [
            { id: 'graphql', name: 'GraphQL Federation', techStack: ['Unified API'] },
            { id: 'rest', name: 'REST APIs', techStack: ['Legacy'] },
          ],
        },
        {
          id: 'core',
          name: 'Core Services',
          position: 'middle',
          color: 'bg-green-100 border-green-300',
          items: [
            { id: 'payment', name: 'Payment Service', techStack: ['Java', 'Spring'] },
            { id: 'risk', name: 'Risk Engine', techStack: ['ML', 'Real-time'] },
            { id: 'wallet', name: 'Wallet Service', techStack: ['Balance'] },
          ],
        },
        {
          id: 'data',
          name: 'Data Layer',
          position: 'bottom',
          color: 'bg-yellow-100 border-yellow-300',
          items: [
            { id: 'oracle', name: 'Oracle', techStack: ['Core Financial'] },
            { id: 'kafka', name: 'Kafka', techStack: ['Event Stream'] },
            { id: 'ledger', name: 'Ledger', techStack: ['Double-Entry'] },
          ],
        },
      ],
      connections: [
        { from: 'channels', to: 'gateway', type: 'api-call' },
        { from: 'gateway', to: 'core', type: 'data-flow' },
        { from: 'core', to: 'data', type: 'data-flow' },
      ],
    },
  },

  highlights: [
    {
      title: 'GraphQL Federation',
      description: 'Unified API across 1000+ services',
      impact: 'Single endpoint for clients',
      technologies: ['GraphQL', 'Apollo'],
      icon: 'Workflow',
    },
    {
      title: 'Real-Time Fraud Detection',
      description: 'ML scoring in <100ms',
      impact: '99%+ fraud detection rate',
      technologies: ['ML', 'Real-time'],
      icon: 'Shield',
    },
    {
      title: 'Double-Entry Ledger',
      description: 'Financial accuracy at scale',
      impact: 'Zero tolerance for errors',
      technologies: ['Ledger', 'Kafka'],
      icon: 'DollarSign',
    },
  ],

  architectureDiagrams: {
    overview: `flowchart TB
    subgraph Channels["Payment Channels"]
        Checkout["PayPal Checkout"]
        Braintree["Braintree"]
        Venmo["Venmo - P2P"]
    end

    subgraph Gateway["API Gateway"]
        GraphQL["GraphQL Federation"]
        REST["REST APIs"]
    end

    subgraph Core["Core Services"]
        PaymentSvc["Payment Service"]
        WalletSvc["Wallet Service"]
        RiskSvc["Risk Engine - ML"]
    end

    subgraph Financial["Financial Systems"]
        Ledger["Ledger - Double-Entry"]
        Settlement["Settlement"]
    end

    subgraph Data["Data Infrastructure"]
        Oracle[("Oracle - Core")]
        Kafka[/"Kafka - Events"/]
    end

    Channels --> Gateway
    Gateway --> Core
    Core --> Financial
    Core --> Data`,

    dataFlow: `sequenceDiagram
    participant User
    participant Gateway as GraphQL Gateway
    participant Risk as Risk Engine
    participant Payment as Payment Service
    participant Ledger as Ledger
    participant Bank as Bank Network

    User->>Gateway: Payment request
    Gateway->>Risk: Evaluate risk
    Risk->>Risk: ML scoring <100ms

    alt High Risk
        Risk-->>Gateway: Step-up auth
    else Approved
        Risk-->>Gateway: Proceed
    end

    Gateway->>Payment: Process payment
    Payment->>Ledger: Debit buyer
    Payment->>Ledger: Credit merchant
    Payment->>Bank: Authorize
    Bank-->>Payment: Approved
    Payment-->>User: Success`,

    deployment: `flowchart TB
    subgraph Global["Global Infrastructure"]
        subgraph US["US Data Centers"]
            USDC1["Primary"]
            USDC2["Secondary"]
        end
        subgraph EU["EU Data Centers"]
            EUDC["GDPR Compliant"]
        end
    end

    subgraph Platform["Platform"]
        K8s["Kubernetes"]
        VMs["VM Fleet"]
    end

    subgraph Deploy["Deployment"]
        Jenkins["Jenkins CI"]
        Canary["Canary Deploy"]
    end

    Deploy --> Platform
    Platform --> Global`,

    serviceInteraction: `flowchart LR
    subgraph Client["Clients"]
        Web["Web App"]
        Mobile["Mobile SDK"]
    end

    subgraph GraphQL["GraphQL Federation"]
        Gateway["Gateway"]
        Schema["Schema"]
    end

    subgraph Services["1000+ Services"]
        Payment["Payment"]
        Wallet["Wallet"]
        Risk["Risk"]
    end

    subgraph Async["Async"]
        Kafka[/"Kafka"/]
        Workers["Workers"]
    end

    Client --> GraphQL
    GraphQL --> Services
    Services --> Async`,
  },

  patterns: [
    {
      patternSlug: 'graphql-federation',
      patternName: 'GraphQL Federation',
      usage: 'Unified API layer',
      implementation: 'Apollo Federation across 1000+ services',
      scale: 'Billions of queries/day',
    },
    {
      patternSlug: 'ml-fraud-detection',
      patternName: 'Real-Time ML Fraud Detection',
      usage: 'Transaction risk scoring',
      implementation: '100+ signals evaluated in <100ms',
      scale: '99%+ detection rate',
    },
    {
      patternSlug: 'double-entry-ledger',
      patternName: 'Double-Entry Ledger',
      usage: 'Financial accuracy',
      implementation: 'Every transaction has debit and credit',
      scale: '$1.5T+ annually',
    },
  ],

  technicalDecisions: [
    {
      title: 'Why GraphQL Federation',
      context: '1000+ services with inconsistent APIs',
      decision: 'Adopted GraphQL Federation as unified API',
      consequences: [
        'Single endpoint for clients',
        'Teams own their schemas',
        'Easier API evolution',
      ],
      alternatives: ['REST aggregation', 'BFF pattern'],
      sources: ['https://medium.com/paypal-tech/graphql-at-paypal-an-adoption-story-b7e01175f2b7'],
    },
    {
      title: 'Why Real-Time ML for Fraud',
      context: 'Manual rules insufficient at scale',
      decision: 'Built real-time ML risk scoring',
      consequences: [
        '99%+ fraud detection',
        '<100ms scoring latency',
        'Complex ML infrastructure',
      ],
      alternatives: ['Rules-based only', 'Batch ML'],
      sources: ['https://medium.com/paypal-tech/'],
    },
  ],

  scaleInnovation: {
    scaleMetrics: [
      { label: 'Active Accounts', value: '400M+', trend: 'up' },
      { label: 'Annual Volume', value: '$1.5T+', trend: 'up' },
    ],
    openSource: [
      {
        name: 'Juneau',
        description: 'Java REST framework',
        url: 'https://github.com/apache/juneau',
        stars: 300,
        language: 'Java',
      },
    ],
    engineeringBlog: 'https://medium.com/paypal-tech',
  },

  lastUpdated: '2024-12-01',
  sources: ['https://medium.com/paypal-tech', 'https://github.com/paypal'],
};
