'use client';

import { useState, useEffect } from 'react';

const categories = [
  { id: 'caching', name: 'Caching', icon: '🚀', color: '#4ade80' },
  { id: 'database', name: 'Database', icon: '💾', color: '#f472b6' },
  { id: 'loadbalancing', name: 'Load Balancing', icon: '⚖️', color: '#60a5fa' },
  { id: 'messaging', name: 'Messaging', icon: '📨', color: '#fb923c' },
  { id: 'architecture', name: 'Architecture', icon: '🏛️', color: '#a78bfa' },
  { id: 'security', name: 'Security', icon: '🔐', color: '#fbbf24' },
  { id: 'distributed', name: 'Distributed', icon: '☁️', color: '#22d3ee' },
  { id: 'api', name: 'API Design', icon: '⚡', color: '#f87171' },
  { id: 'devops', name: 'DevOps', icon: '🛠️', color: '#e879f9' },
  { id: 'realworld', name: 'System Designs', icon: '🎯', color: '#2dd4bf' },
];

const guides = [
  { id: 1, title: 'Caching Strategies', description: 'Cache Aside, Read/Write Through, Write Back/Around', category: 'caching', readTime: '5 min', image: '🗄️', company: 'Facebook', diagram: 'caching' },
  { id: 2, title: 'Cache Eviction', description: 'LRU, LFU, FIFO, TTL policies', category: 'caching', readTime: '4 min', image: '🗑️', company: 'Redis', diagram: 'eviction' },
  { id: 3, title: 'CDN Architecture', description: 'Edge caching for global delivery', category: 'caching', readTime: '6 min', image: '🌍', company: 'Cloudflare', diagram: 'cdn' },
  { id: 4, title: 'Database Sharding', description: 'Horizontal partitioning at scale', category: 'database', readTime: '7 min', image: '🔢', company: 'Instagram', diagram: 'sharding' },
  { id: 5, title: 'DB Replication', description: 'Master-Slave vs Multi-Master', category: 'database', readTime: '6 min', image: '📋', company: 'MySQL', diagram: 'replication' },
  { id: 6, title: 'SQL vs NoSQL', description: 'Database selection framework', category: 'database', readTime: '8 min', image: '🤔', company: 'Various', diagram: 'sqlnosql' },
  { id: 7, title: 'CQRS & Event Sourcing', description: 'Separate read/write models', category: 'database', readTime: '10 min', image: '📊', company: 'Banking', diagram: 'cqrs' },
  { id: 8, title: 'Database Indexing', description: 'B-Tree, Hash, Full-text indexes', category: 'database', readTime: '6 min', image: '📑', company: 'PostgreSQL', diagram: 'indexing' },
  { id: 9, title: 'Connection Pooling', description: 'Reuse DB connections efficiently', category: 'database', readTime: '5 min', image: '🔌', company: 'PgBouncer', diagram: 'connpool' },
  { id: 10, title: 'Bloom Filter', description: 'Probabilistic membership testing', category: 'database', readTime: '6 min', image: '🌸', company: 'Cassandra', diagram: 'bloom' },
  { id: 11, title: 'Load Balancer Types', description: 'L4 vs L7 load balancing', category: 'loadbalancing', readTime: '5 min', image: '⚖️', company: 'AWS', diagram: 'lbtypes' },
  { id: 12, title: 'LB Algorithms', description: 'Round Robin, Weighted, Least Conn', category: 'loadbalancing', readTime: '6 min', image: '🎯', company: 'Nginx', diagram: 'lbalgo' },
  { id: 13, title: 'API Gateway', description: 'Single entry for microservices', category: 'loadbalancing', readTime: '6 min', image: '🚪', company: 'Netflix', diagram: 'gateway' },
  { id: 14, title: 'Circuit Breaker', description: 'Prevent cascade failures', category: 'loadbalancing', readTime: '5 min', image: '🔌', company: 'Netflix', diagram: 'circuit' },
  { id: 15, title: 'Message Queue', description: 'Async processing with queues', category: 'messaging', readTime: '6 min', image: '📬', company: 'RabbitMQ', diagram: 'queue' },
  { id: 16, title: 'Pub/Sub Pattern', description: 'Fan-out event messaging', category: 'messaging', readTime: '5 min', image: '📢', company: 'Google', diagram: 'pubsub' },
  { id: 17, title: 'Kafka Streaming', description: 'Log-based messaging at scale', category: 'messaging', readTime: '8 min', image: '🌊', company: 'LinkedIn', diagram: 'kafka' },
  { id: 18, title: 'Saga Pattern', description: 'Distributed transactions', category: 'messaging', readTime: '9 min', image: '🔄', company: 'E-commerce', diagram: 'saga' },
  { id: 19, title: 'Dead Letter Queue', description: 'Handle failed messages', category: 'messaging', readTime: '5 min', image: '💀', company: 'AWS SQS', diagram: 'dlq' },
  { id: 20, title: 'Microservices', description: 'Distributed services architecture', category: 'architecture', readTime: '10 min', image: '🧩', company: 'Netflix', diagram: 'microservices' },
  { id: 21, title: 'Mono vs Micro', description: 'When to choose each', category: 'architecture', readTime: '7 min', image: '🏗️', company: 'Shopify', diagram: 'monomicro' },
  { id: 22, title: 'Serverless', description: 'FaaS patterns and use cases', category: 'architecture', readTime: '6 min', image: '⚡', company: 'AWS', diagram: 'serverless' },
  { id: 23, title: 'Backend for Frontend', description: 'Client-specific APIs', category: 'architecture', readTime: '5 min', image: '📱', company: 'SoundCloud', diagram: 'bff' },
  { id: 24, title: 'Service Mesh', description: 'Sidecar proxy for microservices', category: 'architecture', readTime: '8 min', image: '🕸️', company: 'Lyft', diagram: 'servicemesh' },
  { id: 25, title: 'Event-Driven', description: 'Loosely coupled event architecture', category: 'architecture', readTime: '7 min', image: '⚡', company: 'Uber', diagram: 'eventdriven' },
  { id: 26, title: 'OAuth 2.0', description: 'Authorization framework', category: 'security', readTime: '8 min', image: '🔑', company: 'Google', diagram: 'oauth' },
  { id: 27, title: 'JWT Auth', description: 'Stateless token auth', category: 'security', readTime: '6 min', image: '🎫', company: 'Auth0', diagram: 'jwt' },
  { id: 28, title: 'Rate Limiting', description: 'Token bucket, sliding window', category: 'security', readTime: '7 min', image: '⏱️', company: 'Stripe', diagram: 'ratelimit' },
  { id: 29, title: 'SSO (Single Sign-On)', description: 'One login for multiple apps', category: 'security', readTime: '6 min', image: '🔐', company: 'Okta', diagram: 'sso' },
  { id: 30, title: 'CAP Theorem', description: 'C vs A trade-offs', category: 'distributed', readTime: '6 min', image: '⚖️', company: 'Various', diagram: 'cap' },
  { id: 31, title: 'Consistent Hashing', description: 'Data partitioning', category: 'distributed', readTime: '7 min', image: '💍', company: 'Cassandra', diagram: 'hash' },
  { id: 32, title: 'Consensus', description: 'Raft and Paxos', category: 'distributed', readTime: '10 min', image: '🤝', company: 'etcd', diagram: 'consensus' },
  { id: 33, title: 'Distributed Locking', description: 'Coordinate across nodes', category: 'distributed', readTime: '7 min', image: '🔒', company: 'Redis', diagram: 'distlock' },
  { id: 34, title: 'Leader Election', description: 'Single coordinator selection', category: 'distributed', readTime: '6 min', image: '👑', company: 'ZooKeeper', diagram: 'leaderelect' },
  { id: 35, title: 'Two-Phase Commit', description: 'Atomic distributed transactions', category: 'distributed', readTime: '8 min', image: '✌️', company: 'Spanner', diagram: 'twophase' },
  { id: 36, title: 'REST vs GraphQL vs gRPC', description: 'API protocol comparison', category: 'api', readTime: '8 min', image: '🔌', company: 'Various', diagram: 'apicompare' },
  { id: 37, title: 'WebSocket', description: 'Real-time bi-directional', category: 'api', readTime: '6 min', image: '🔗', company: 'Slack', diagram: 'websocket' },
  { id: 38, title: 'API Pagination', description: 'Cursor vs Offset', category: 'api', readTime: '5 min', image: '📄', company: 'Twitter', diagram: 'pagination' },
  { id: 39, title: 'API Versioning', description: 'Evolve APIs without breaking', category: 'api', readTime: '5 min', image: '🏷️', company: 'Stripe', diagram: 'versioning' },
  { id: 40, title: 'Webhooks', description: 'Push-based event notifications', category: 'api', readTime: '5 min', image: '🪝', company: 'GitHub', diagram: 'webhooks' },
  { id: 41, title: 'Kubernetes', description: 'Container orchestration', category: 'devops', readTime: '10 min', image: '☸️', company: 'Spotify', diagram: 'k8s' },
  { id: 42, title: 'CI/CD Pipeline', description: 'Build, test, deploy', category: 'devops', readTime: '7 min', image: '🔄', company: 'GitHub', diagram: 'cicd' },
  { id: 43, title: 'Blue-Green Deploy', description: 'Zero-downtime', category: 'devops', readTime: '5 min', image: '🔵', company: 'Netflix', diagram: 'bluegreen' },
  { id: 44, title: 'Canary Deploy', description: 'Gradual rollout strategy', category: 'devops', readTime: '5 min', image: '🐤', company: 'Google', diagram: 'canary' },
  { id: 45, title: 'Feature Flags', description: 'Toggle features dynamically', category: 'devops', readTime: '5 min', image: '🚩', company: 'LaunchDarkly', diagram: 'featureflags' },
  { id: 46, title: 'Observability', description: 'Logs, Metrics, Traces', category: 'devops', readTime: '8 min', image: '👁️', company: 'Datadog', diagram: 'observability' },
  { id: 47, title: 'URL Shortener', description: 'Design bit.ly', category: 'realworld', readTime: '12 min', image: '🔗', company: 'Bit.ly', diagram: 'urlshort' },
  { id: 48, title: 'Twitter Feed', description: 'Timeline & fan-out', category: 'realworld', readTime: '15 min', image: '🐦', company: 'Twitter', diagram: 'twitter' },
  { id: 49, title: 'Chat System', description: 'Real-time messaging', category: 'realworld', readTime: '14 min', image: '💬', company: 'WhatsApp', diagram: 'chat' },
  { id: 50, title: 'Video Streaming', description: 'Upload, transcode, deliver', category: 'realworld', readTime: '15 min', image: '🎬', company: 'YouTube', diagram: 'video' },
  { id: 51, title: 'Ride Sharing', description: 'Matching & geo-indexing', category: 'realworld', readTime: '14 min', image: '🚗', company: 'Uber', diagram: 'rideshare' },
  { id: 52, title: 'Notification System', description: 'Push, SMS, Email at scale', category: 'realworld', readTime: '12 min', image: '🔔', company: 'Facebook', diagram: 'notification' },
  { id: 53, title: 'Search Engine', description: 'Inverted index & ranking', category: 'realworld', readTime: '15 min', image: '🔍', company: 'Elasticsearch', diagram: 'search' },
  { id: 54, title: 'Payment System', description: 'Transactions & ledger', category: 'realworld', readTime: '14 min', image: '💳', company: 'Stripe', diagram: 'payment' },
  { id: 55, title: 'E-commerce System', description: 'Cart, inventory, checkout', category: 'realworld', readTime: '15 min', image: '🛒', company: 'Amazon', diagram: 'ecommerce' },
  { id: 56, title: 'File Storage', description: 'Distributed file system', category: 'realworld', readTime: '12 min', image: '📁', company: 'Dropbox', diagram: 'filestorage' },
  { id: 57, title: 'Ticketing System', description: 'High-demand booking', category: 'realworld', readTime: '12 min', image: '🎫', company: 'Ticketmaster', diagram: 'ticketing' },
  { id: 58, title: 'Retry Pattern', description: 'Exponential backoff & jitter', category: 'loadbalancing', readTime: '5 min', image: '🔁', company: 'AWS SDK', diagram: 'retry' },
  { id: 59, title: 'Bulkhead Pattern', description: 'Isolate failures', category: 'loadbalancing', readTime: '5 min', image: '🚢', company: 'Hystrix', diagram: 'bulkhead' },
  { id: 60, title: 'Backpressure', description: 'Handle overwhelming load', category: 'messaging', readTime: '6 min', image: '⏸️', company: 'RxJava', diagram: 'backpressure' },
  { id: 61, title: 'MapReduce', description: 'Distributed data processing', category: 'distributed', readTime: '10 min', image: '🗺️', company: 'Hadoop', diagram: 'mapreduce' },
  { id: 62, title: 'Stream Processing', description: 'Real-time data pipelines', category: 'messaging', readTime: '8 min', image: '🌊', company: 'Flink', diagram: 'streamproc' },
  { id: 63, title: 'Data Pipeline', description: 'ETL & data orchestration', category: 'devops', readTime: '8 min', image: '🔀', company: 'Airflow', diagram: 'datapipeline' },
  { id: 64, title: 'Multi-tier Cache', description: 'L1 local + L2 distributed', category: 'caching', readTime: '6 min', image: '🏗️', company: 'Netflix', diagram: 'multitiercache' },
  { id: 65, title: 'RBAC', description: 'Role-based access control', category: 'security', readTime: '6 min', image: '👥', company: 'AWS IAM', diagram: 'rbac' },
  { id: 66, title: 'API Keys & Secrets', description: 'Secure credential management', category: 'security', readTime: '5 min', image: '🔐', company: 'HashiCorp', diagram: 'secrets' },
  { id: 67, title: 'Idempotency', description: 'Safe retries & duplicates', category: 'api', readTime: '5 min', image: '🎯', company: 'Stripe', diagram: 'idempotency' },
  { id: 68, title: 'Health Checks', description: 'Liveness & readiness probes', category: 'devops', readTime: '4 min', image: '💓', company: 'Kubernetes', diagram: 'healthcheck' },
  { id: 69, title: 'Graceful Degradation', description: 'Fail gracefully under load', category: 'loadbalancing', readTime: '5 min', image: '📉', company: 'Netflix', diagram: 'graceful' },
  { id: 70, title: 'Content Moderation', description: 'AI + human review pipeline', category: 'realworld', readTime: '10 min', image: '🛡️', company: 'Facebook', diagram: 'moderation' },
  { id: 71, title: 'Distributed Tracing', description: 'Request flow across services', category: 'devops', readTime: '7 min', image: '🔍', company: 'Jaeger', diagram: 'tracing' },
  { id: 72, title: 'Service Discovery', description: 'Dynamic service registration', category: 'architecture', readTime: '6 min', image: '🔎', company: 'Consul', diagram: 'servicedisco' },
  { id: 73, title: 'Sidecar Pattern', description: 'Auxiliary containers', category: 'architecture', readTime: '5 min', image: '🏍️', company: 'Kubernetes', diagram: 'sidecar' },
  { id: 74, title: 'Strangler Fig', description: 'Incremental migration', category: 'architecture', readTime: '6 min', image: '🌳', company: 'Legacy', diagram: 'strangler' },
  { id: 75, title: 'Read Replicas', description: 'Scale reads horizontally', category: 'database', readTime: '5 min', image: '📖', company: 'Aurora', diagram: 'readreplica' },
  { id: 76, title: 'Write-Ahead Log', description: 'Durability & recovery', category: 'database', readTime: '6 min', image: '📝', company: 'PostgreSQL', diagram: 'wal' },
  { id: 77, title: 'Time-Series DB', description: 'Optimized for metrics', category: 'database', readTime: '6 min', image: '📈', company: 'InfluxDB', diagram: 'timeseries' },
  { id: 78, title: 'Vector Clock', description: 'Ordering distributed events', category: 'distributed', readTime: '8 min', image: '🕐', company: 'Dynamo', diagram: 'vectorclock' },
  { id: 79, title: 'Gossip Protocol', description: 'Peer-to-peer propagation', category: 'distributed', readTime: '7 min', image: '🗣️', company: 'Cassandra', diagram: 'gossip' },
  { id: 80, title: 'Quorum', description: 'Majority consensus reads/writes', category: 'distributed', readTime: '6 min', image: '🗳️', company: 'Cassandra', diagram: 'quorum' },
  { id: 81, title: 'Request Coalescing', description: 'Batch duplicate requests', category: 'caching', readTime: '5 min', image: '🔗', company: 'Nginx', diagram: 'coalescing' },
  { id: 82, title: 'Cache Warming', description: 'Pre-populate cache', category: 'caching', readTime: '4 min', image: '🔥', company: 'CDN', diagram: 'cachewarming' },
  { id: 83, title: 'GraphQL Federation', description: 'Unified graph from services', category: 'api', readTime: '8 min', image: '🕸️', company: 'Apollo', diagram: 'federation' },
  { id: 84, title: 'API Rate Design', description: 'Quotas, throttling, tiers', category: 'api', readTime: '6 min', image: '📊', company: 'Stripe', diagram: 'ratedesign' },
  { id: 85, title: 'Long Polling', description: 'Server-push simulation', category: 'api', readTime: '5 min', image: '⏳', company: 'Slack', diagram: 'longpolling' },
  { id: 86, title: 'Server-Sent Events', description: 'One-way streaming', category: 'api', readTime: '5 min', image: '📡', company: 'Twitter', diagram: 'sse' },
  { id: 87, title: 'Infrastructure as Code', description: 'Terraform, Pulumi patterns', category: 'devops', readTime: '7 min', image: '📜', company: 'HashiCorp', diagram: 'iac' },
  { id: 88, title: 'GitOps', description: 'Git as source of truth', category: 'devops', readTime: '6 min', image: '🔄', company: 'ArgoCD', diagram: 'gitops' },
  { id: 89, title: 'Chaos Engineering', description: 'Controlled failure testing', category: 'devops', readTime: '7 min', image: '🐒', company: 'Netflix', diagram: 'chaos' },
  { id: 90, title: 'Social Graph', description: 'Relationships at scale', category: 'realworld', readTime: '12 min', image: '👥', company: 'Facebook', diagram: 'socialgraph' },
  { id: 91, title: 'Event Loop', description: 'Non-blocking I/O model', category: 'architecture', readTime: '6 min', image: '🔁', company: 'Node.js', diagram: 'eventloop' },
  { id: 92, title: 'Connection State', description: 'Stateful vs stateless services', category: 'architecture', readTime: '5 min', image: '🔗', company: 'Various', diagram: 'connstate' },
  { id: 93, title: 'Data Locality', description: 'Compute near data', category: 'distributed', readTime: '6 min', image: '📍', company: 'Spark', diagram: 'datalocality' },
  { id: 94, title: 'Merkle Tree', description: 'Efficient data verification', category: 'distributed', readTime: '7 min', image: '🌲', company: 'Bitcoin', diagram: 'merkle' },
  { id: 95, title: 'Checksum', description: 'Data integrity verification', category: 'database', readTime: '4 min', image: '✅', company: 'HDFS', diagram: 'checksum' },
  { id: 96, title: 'Soft Delete', description: 'Recoverable data removal', category: 'database', readTime: '4 min', image: '🗑️', company: 'Various', diagram: 'softdelete' },
  { id: 97, title: 'Content Delivery', description: 'Global edge distribution', category: 'caching', readTime: '7 min', image: '🌐', company: 'Akamai', diagram: 'contentdelivery' },
  { id: 98, title: 'Token Bucket Deep', description: 'Advanced rate limiting', category: 'security', readTime: '6 min', image: '🪣', company: 'AWS', diagram: 'tokenbucket' },
  { id: 99, title: 'Geo-Routing', description: 'Location-based traffic steering', category: 'loadbalancing', readTime: '6 min', image: '🗺️', company: 'Cloudflare', diagram: 'georouting' },
  { id: 100, title: 'News Feed', description: 'Ranked content aggregation', category: 'realworld', readTime: '14 min', image: '📰', company: 'Facebook', diagram: 'newsfeed' },
  { id: 101, title: 'Horizontal vs Vertical', description: 'Scale out vs scale up', category: 'architecture', readTime: '5 min', image: '📐', company: 'Various', diagram: 'scaling' },
  { id: 102, title: 'Proxy Patterns', description: 'Forward & reverse proxy', category: 'loadbalancing', readTime: '6 min', image: '🔀', company: 'Nginx', diagram: 'proxy' },
  { id: 103, title: 'ACID Transactions', description: 'Database transaction guarantees', category: 'database', readTime: '6 min', image: '⚛️', company: 'PostgreSQL', diagram: 'acid' },
  { id: 104, title: 'Optimistic Locking', description: 'Version-based concurrency', category: 'database', readTime: '5 min', image: '🔓', company: 'Various', diagram: 'optlock' },
  { id: 105, title: 'Hot/Cold Data', description: 'Data tiering strategy', category: 'database', readTime: '5 min', image: '🌡️', company: 'S3', diagram: 'hotcold' },
  { id: 106, title: 'Heartbeat', description: 'Node liveness detection', category: 'distributed', readTime: '5 min', image: '💗', company: 'ZooKeeper', diagram: 'heartbeat' },
  { id: 107, title: 'Split Brain', description: 'Network partition handling', category: 'distributed', readTime: '7 min', image: '🧠', company: 'Elasticsearch', diagram: 'splitbrain' },
  { id: 108, title: 'Hinted Handoff', description: 'Temporary failure recovery', category: 'distributed', readTime: '6 min', image: '🤝', company: 'Cassandra', diagram: 'hintedhandoff' },
  { id: 109, title: 'Read Repair', description: 'Fix stale data on read', category: 'distributed', readTime: '5 min', image: '🔧', company: 'Cassandra', diagram: 'readrepair' },
  { id: 110, title: 'Anti-Entropy', description: 'Background data sync', category: 'distributed', readTime: '6 min', image: '🔄', company: 'Dynamo', diagram: 'antientropy' },
  { id: 111, title: 'Batch Processing', description: 'Scheduled bulk operations', category: 'messaging', readTime: '6 min', image: '📦', company: 'Spark', diagram: 'batch' },
  { id: 112, title: 'Throttling', description: 'Request rate control', category: 'loadbalancing', readTime: '5 min', image: '🚦', company: 'AWS', diagram: 'throttling' },
  { id: 113, title: 'Reverse Proxy', description: 'Server-side proxy patterns', category: 'loadbalancing', readTime: '5 min', image: '↩️', company: 'Nginx', diagram: 'reverseproxy' },
];

function Diagram({ type, color }) {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 5), 2500); return () => clearInterval(t); }, []);

  const diagrams = {
    caching: (
      <div>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Cache Aside', 'Read Through', 'Write Through', 'Write Back', 'Write Around'].map((s, i) => (
            <button key={i} onClick={() => setStep(i)} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', border: step === i ? `2px solid ${color}` : '1px solid #3f3f46', background: step === i ? `${color}20` : 'transparent', color: step === i ? color : '#71717a', fontSize: '0.75rem' }}>{s}</button>
          ))}
        </div>
        <svg viewBox="0 0 500 180" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
          <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Facebook: 5B+ cache requests/sec</text>
          <rect x="20" y="60" width="80" height="50" rx="8" fill={`${color}20`} stroke={color} strokeWidth="2" /><text x="60" y="88" textAnchor="middle" fill="#fafafa" fontSize="10">📱 App</text>
          <rect x="160" y="35" width="90" height="45" rx="8" fill={`${color}20`} stroke={step < 3 ? color : '#52525b'} strokeWidth="2" /><text x="205" y="58" textAnchor="middle" fill="#fafafa" fontSize="10">⚡ Cache</text><text x="205" y="72" textAnchor="middle" fill={color} fontSize="8">~0.1ms</text>
          <rect x="160" y="100" width="90" height="45" rx="8" fill="#f472b620" stroke={step >= 3 ? '#f472b6' : '#52525b'} strokeWidth="2" /><text x="205" y="123" textAnchor="middle" fill="#fafafa" fontSize="10">💾 DB</text><text x="205" y="137" textAnchor="middle" fill="#f472b6" fontSize="8">~10ms</text>
          {step === 0 && <><path d="M105 75 L155 55" stroke={color} strokeWidth="2" /><path d="M105 95 L155 120" stroke="#f472b6" strokeWidth="2" strokeDasharray="4,4" /></>}
          {step === 1 && <path d="M105 85 L155 57" stroke={color} strokeWidth="2" />}
          {step === 2 && <><path d="M105 75 L155 55" stroke={color} strokeWidth="2" /><path d="M105 95 L155 120" stroke={color} strokeWidth="2" /></>}
          {step === 3 && <><path d="M105 85 L155 57" stroke={color} strokeWidth="2" /><path d="M205 85 L205 95" stroke="#fb923c" strokeWidth="2" strokeDasharray="4,3" /></>}
          {step === 4 && <path d="M105 95 L155 120" stroke={color} strokeWidth="2" />}
          <rect x="300" y="40" width="175" height="105" rx="8" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
          <text x="387" y="65" textAnchor="middle" fill="#fafafa" fontSize="10" fontWeight="600">{['Cache Aside', 'Read Through', 'Write Through', 'Write Back', 'Write Around'][step]}</text>
          <text x="387" y="85" textAnchor="middle" fill="#a1a1aa" fontSize="8">{['App manages cache', 'Cache auto-loads', 'Sync to both', 'Async DB write', 'Bypass cache'][step]}</text>
          <text x="387" y="105" textAnchor="middle" fill="#4ade80" fontSize="8">{['✓ Cache only needed', '✓ Simple app code', '✓ Consistency', '✓ Fast writes', '✓ No pollution'][step]}</text>
          <text x="387" y="125" textAnchor="middle" fill="#f87171" fontSize="8">{['✗ Cache miss cost', '✗ First req slow', '✗ Higher latency', '✗ Data loss risk', '✗ Read-after-write'][step]}</text>
        </svg>
      </div>
    ),
    eviction: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Cache Eviction Policies</text>
        {[{ x: 10, n: 'LRU', c: '#4ade80', d: 'Least Recently Used' }, { x: 135, n: 'LFU', c: '#22d3ee', d: 'Least Frequently Used' }, { x: 260, n: 'FIFO', c: '#a78bfa', d: 'First In First Out' }, { x: 385, n: 'TTL', c: '#fb923c', d: 'Time To Live' }].map((p, i) => (
          <g key={i}><rect x={p.x} y="30" width="105" height="70" rx="8" fill={`${p.c}15`} stroke={p.c} strokeWidth="1.5" /><text x={p.x + 52} y="52" textAnchor="middle" fill={p.c} fontSize="11" fontWeight="600">{p.n}</text><text x={p.x + 52} y="68" textAnchor="middle" fill="#a1a1aa" fontSize="7">{p.d}</text><text x={p.x + 52} y="88" textAnchor="middle" fill="#71717a" fontSize="7">{['General cache', 'Hot data', 'Queues', 'Sessions'][i]}</text></g>
        ))}
        <text x="250" y="125" textAnchor="middle" fill="#71717a" fontSize="8">LRU is default • LFU for hot data • TTL for time-sensitive</text>
      </svg>
    ),
    cdn: (
      <svg viewBox="0 0 500 170" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Cloudflare: 200+ edge locations</text>
        <rect x="190" y="28" width="120" height="35" rx="8" fill={`${color}20`} stroke={color} strokeWidth="2" /><text x="250" y="50" textAnchor="middle" fill="#fafafa" fontSize="10">🏢 Origin Server</text>
        {[{ x: 30, r: '🇺🇸 US' }, { x: 140, r: '🇪🇺 EU' }, { x: 250, r: '🇯🇵 Asia' }, { x: 360, r: '🇦🇺 AU' }].map((e, i) => (
          <g key={i}><rect x={e.x} y="85" width="90" height="30" rx="6" fill="#fb923c20" stroke="#fb923c" /><text x={e.x + 45} y="104" textAnchor="middle" fill="#fafafa" fontSize="9">📡 {e.r}</text><path d={`M250 68 L${e.x + 45} 80`} stroke="#3f3f46" strokeWidth="1" strokeDasharray="3,3" /></g>
        ))}
        {[60, 120, 180, 240, 300, 360, 420].map((x, i) => <circle key={i} cx={x} cy="140" r="10" fill="#60a5fa20" stroke="#60a5fa" />)}
        <text x="250" y="165" textAnchor="middle" fill="#4ade80" fontSize="8">✓ Lower latency • ✓ Reduced load • ✓ DDoS protection</text>
      </svg>
    ),
    sharding: (
      <svg viewBox="0 0 500 180" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Instagram: 2B+ users sharded by user_id</text>
        <rect x="175" y="25" width="150" height="30" rx="6" fill={`${color}20`} stroke={color} strokeWidth="2" /><text x="250" y="44" textAnchor="middle" fill="#fafafa" fontSize="9">📱 App → Shard Router</text>
        {[{ x: 20, c: '#22d3ee', r: '0-500M' }, { x: 145, c: '#a78bfa', r: '500M-1B' }, { x: 270, c: '#4ade80', r: '1B-1.5B' }, { x: 395, c: '#f472b6', r: '1.5B+' }].map((s, i) => (
          <g key={i}><rect x={s.x} y="75" width="85" height="85" rx="8" fill={`${s.c}15`} stroke={s.c} strokeWidth="1.5" /><text x={s.x + 42} y="95" textAnchor="middle" fill={s.c} fontSize="9" fontWeight="600">Shard {i + 1}</text><text x={s.x + 42} y="110" textAnchor="middle" fill="#a1a1aa" fontSize="7">{s.r}</text><rect x={s.x + 8} y="120" width="30" height="15" rx="2" fill="rgba(255,255,255,0.05)" /><text x={s.x + 23} y="131" textAnchor="middle" fill="#52525b" fontSize="6">Pri</text><rect x={s.x + 45} y="120" width="30" height="15" rx="2" fill="rgba(255,255,255,0.03)" /><text x={s.x + 60} y="131" textAnchor="middle" fill="#3f3f46" fontSize="6">Rep</text><text x={s.x + 42} y="152" textAnchor="middle" fill="#52525b" fontSize="7">{['US-E', 'US-W', 'EU', 'Asia'][i]}</text><path d={`M250 58 L${s.x + 42} 70`} stroke={s.c} strokeWidth="1.5" /></g>
        ))}
      </svg>
    ),
    replication: (
      <svg viewBox="0 0 500 170" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Database Replication Patterns</text>
        <rect x="20" y="28" width="210" height="125" rx="8" fill="rgba(74,222,128,0.05)" stroke="#4ade80" strokeDasharray="4,4" />
        <text x="125" y="48" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Master-Slave</text>
        <rect x="75" y="58" width="100" height="30" rx="5" fill="#4ade8030" stroke="#4ade80" strokeWidth="2" /><text x="125" y="77" textAnchor="middle" fill="#fafafa" fontSize="9">👑 Master</text>
        {[0, 1, 2].map(i => <g key={i}><rect x={40 + i * 65} y="105" width="55" height="25" rx="4" fill="#4ade8015" stroke="#4ade80" /><text x={67 + i * 65} y="122" textAnchor="middle" fill="#a1a1aa" fontSize="7">Replica</text><path d={`M125 92 L${67 + i * 65} 100`} stroke="#4ade80" strokeWidth="1" /></g>)}
        <text x="125" y="145" textAnchor="middle" fill="#71717a" fontSize="7">Writes→Master Reads→Replicas</text>
        <rect x="270" y="28" width="210" height="125" rx="8" fill="rgba(251,146,60,0.05)" stroke="#fb923c" strokeDasharray="4,4" />
        <text x="375" y="48" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">Multi-Master</text>
        <rect x="295" y="70" width="70" height="30" rx="5" fill="#fb923c30" stroke="#fb923c" strokeWidth="2" /><text x="330" y="89" textAnchor="middle" fill="#fafafa" fontSize="8">👑 M1</text>
        <rect x="395" y="70" width="70" height="30" rx="5" fill="#fb923c30" stroke="#fb923c" strokeWidth="2" /><text x="430" y="89" textAnchor="middle" fill="#fafafa" fontSize="8">👑 M2</text>
        <path d="M370 80 L390 80" stroke="#fb923c" strokeWidth="2" /><path d="M390 90 L370 90" stroke="#fb923c" strokeWidth="2" />
        <text x="375" y="120" textAnchor="middle" fill="#4ade80" fontSize="7">✓ HA, Write scaling</text>
        <text x="375" y="135" textAnchor="middle" fill="#f87171" fontSize="7">✗ Conflict resolution</text>
      </svg>
    ),
    sqlnosql: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">SQL vs NoSQL Decision</text>
        <rect x="20" y="28" width="210" height="115" rx="8" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="2" />
        <text x="125" y="48" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">💾 SQL</text>
        <text x="35" y="68" fill="#fafafa" fontSize="8">✓ ACID, Complex joins</text>
        <text x="35" y="83" fill="#fafafa" fontSize="8">✓ Strong consistency</text>
        <text x="35" y="100" fill="#f87171" fontSize="8">✗ Horizontal scaling harder</text>
        <text x="35" y="120" fill="#71717a" fontSize="7">PostgreSQL, MySQL</text>
        <text x="35" y="135" fill="#52525b" fontSize="7">Use: Banking, E-commerce</text>
        <rect x="270" y="28" width="210" height="115" rx="8" fill="rgba(244,114,182,0.08)" stroke="#f472b6" strokeWidth="2" />
        <text x="375" y="48" textAnchor="middle" fill="#f472b6" fontSize="11" fontWeight="600">📦 NoSQL</text>
        <text x="285" y="68" fill="#fafafa" fontSize="8">✓ Horizontal scaling</text>
        <text x="285" y="83" fill="#fafafa" fontSize="8">✓ Flexible schema</text>
        <text x="285" y="100" fill="#f87171" fontSize="8">✗ Limited joins</text>
        <text x="285" y="120" fill="#71717a" fontSize="7">MongoDB, Cassandra, Redis</text>
        <text x="285" y="135" fill="#52525b" fontSize="7">Use: Social, IoT, Real-time</text>
      </svg>
    ),
    cqrs: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">CQRS: Separate Read/Write</text>
        <rect x="185" y="25" width="130" height="28" rx="6" fill={`${color}20`} stroke={color} strokeWidth="2" /><text x="250" y="43" textAnchor="middle" fill="#fafafa" fontSize="9">📱 Application</text>
        <rect x="30" y="70" width="170" height="65" rx="6" fill="rgba(251,146,60,0.08)" stroke="#fb923c" strokeDasharray="4,4" />
        <text x="115" y="88" textAnchor="middle" fill="#fb923c" fontSize="8" fontWeight="600">Command (Write)</text>
        <rect x="45" y="98" width="60" height="22" rx="4" fill="#fb923c20" stroke="#fb923c" /><text x="75" y="113" textAnchor="middle" fill="#fafafa" fontSize="7">Command</text>
        <rect x="120" y="98" width="60" height="22" rx="4" fill="#fb923c20" stroke="#fb923c" /><text x="150" y="113" textAnchor="middle" fill="#fafafa" fontSize="7">Events</text>
        <rect x="300" y="70" width="170" height="65" rx="6" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeDasharray="4,4" />
        <text x="385" y="88" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="600">Query (Read)</text>
        <rect x="315" y="98" width="60" height="22" rx="4" fill="#4ade8020" stroke="#4ade80" /><text x="345" y="113" textAnchor="middle" fill="#fafafa" fontSize="7">Model</text>
        <rect x="390" y="98" width="60" height="22" rx="4" fill="#4ade8020" stroke="#4ade80" /><text x="420" y="113" textAnchor="middle" fill="#fafafa" fontSize="7">Query</text>
        <rect x="195" y="110" width="110" height="22" rx="4" fill="#a78bfa20" stroke="#a78bfa" /><text x="250" y="125" textAnchor="middle" fill="#a78bfa" fontSize="7">📨 Event Bus</text>
      </svg>
    ),
    lbtypes: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">AWS: NLB (L4) vs ALB (L7)</text>
        <rect x="20" y="28" width="210" height="105" rx="8" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="2" />
        <text x="125" y="48" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">L4 Transport</text>
        <text x="35" y="68" fill="#fafafa" fontSize="8">✓ Fastest (~100ns)</text>
        <text x="35" y="83" fill="#fafafa" fontSize="8">✓ Millions req/sec</text>
        <text x="35" y="100" fill="#f87171" fontSize="8">✗ No content routing</text>
        <text x="35" y="118" fill="#71717a" fontSize="7">Use: Gaming, IoT, TCP</text>
        <rect x="270" y="28" width="210" height="105" rx="8" fill="rgba(167,139,250,0.08)" stroke="#a78bfa" strokeWidth="2" />
        <text x="375" y="48" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="600">L7 Application</text>
        <text x="285" y="68" fill="#fafafa" fontSize="8">✓ Content routing</text>
        <text x="285" y="83" fill="#fafafa" fontSize="8">✓ SSL termination</text>
        <text x="285" y="100" fill="#f87171" fontSize="8">✗ Higher latency (~1ms)</text>
        <text x="285" y="118" fill="#71717a" fontSize="7">Use: Web, APIs, Microservices</text>
      </svg>
    ),
    lbalgo: (
      <svg viewBox="0 0 500 130" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Load Balancing Algorithms</text>
        {[{ x: 10, n: 'Round Robin', c: '#4ade80', d: 'Equal' }, { x: 135, n: 'Weighted', c: '#22d3ee', d: 'Capacity' }, { x: 260, n: 'Least Conn', c: '#a78bfa', d: 'Active' }, { x: 385, n: 'IP Hash', c: '#fb923c', d: 'Sticky' }].map((a, i) => (
          <g key={i}><rect x={a.x} y="28" width="105" height="55" rx="6" fill={`${a.c}15`} stroke={a.c} strokeWidth="1.5" /><text x={a.x + 52} y="48" textAnchor="middle" fill={a.c} fontSize="9" fontWeight="600">{a.n}</text><text x={a.x + 52} y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">{a.d} distribution</text></g>
        ))}
        <rect x="50" y="100" width="40" height="20" rx="3" fill="#60a5fa30" stroke="#60a5fa" /><text x="70" y="114" textAnchor="middle" fill="#fafafa" fontSize="7">LB</text>
        {[0, 1, 2, 3].map(i => <g key={i}><rect x={130 + i * 90} y="98" width="60" height="24" rx="3" fill={i === step % 4 ? '#4ade8030' : 'rgba(255,255,255,0.02)'} stroke={i === step % 4 ? '#4ade80' : '#3f3f46'} /><text x={160 + i * 90} y="114" textAnchor="middle" fill={i === step % 4 ? '#4ade80' : '#52525b'} fontSize="7">Server {i + 1}</text></g>)}
      </svg>
    ),
    gateway: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Netflix Zuul: 50B+ requests/day</text>
        <rect x="15" y="55" width="60" height="50" rx="6" fill={`${color}20`} stroke={color} strokeWidth="2" /><text x="45" y="83" textAnchor="middle" fill="#fafafa" fontSize="9">🌐</text><text x="45" y="98" textAnchor="middle" fill="#71717a" fontSize="7">Clients</text>
        <rect x="100" y="35" width="130" height="90" rx="8" fill="rgba(251,146,60,0.1)" stroke="#fb923c" strokeWidth="2" />
        <text x="165" y="55" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">🚪 API Gateway</text>
        {['Auth', 'Rate Limit', 'Transform', 'Route'].map((f, i) => <g key={i}><rect x={112} y={62 + i * 16} width="105" height="13" rx="2" fill="#fb923c20" /><text x={165} y={72 + i * 16} textAnchor="middle" fill="#fafafa" fontSize="7">{f}</text></g>)}
        <rect x="260" y="30" width="220" height="100" rx="8" fill="rgba(167,139,250,0.08)" stroke="#a78bfa" strokeDasharray="4,4" />
        <text x="370" y="50" textAnchor="middle" fill="#a78bfa" fontSize="8" fontWeight="500">Microservices</text>
        {['User', 'Order', 'Payment', 'Inventory'].map((s, i) => <g key={i}><rect x={275 + (i % 2) * 105} y={58 + Math.floor(i / 2) * 35} width="90" height="28" rx="4" fill="#a78bfa20" stroke="#a78bfa" /><text x={320 + (i % 2) * 105} y={76 + Math.floor(i / 2) * 35} textAnchor="middle" fill="#fafafa" fontSize="7">{s}</text></g>)}
        <path d="M80 80 L95 80" stroke="#71717a" strokeWidth="1.5" /><path d="M235 80 L255 80" stroke="#71717a" strokeWidth="1.5" />
      </svg>
    ),
    circuit: (
      <svg viewBox="0 0 500 130" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Netflix Hystrix: Prevent cascade failures</text>
        {[{ x: 40, s: 'CLOSED', c: '#4ade80', d: 'Normal' }, { x: 190, s: 'OPEN', c: '#f87171', d: 'Fail fast' }, { x: 340, s: 'HALF-OPEN', c: '#fbbf24', d: 'Testing' }].map((st, i) => (
          <g key={i}><circle cx={st.x + 45} cy="65" r="30" fill={`${st.c}20`} stroke={st.c} strokeWidth="2" /><text x={st.x + 45} y="62" textAnchor="middle" fill={st.c} fontSize="9" fontWeight="600">{st.s}</text><text x={st.x + 45} y="76" textAnchor="middle" fill="#71717a" fontSize="7">{st.d}</text></g>
        ))}
        <path d="M120 55 L160 55" stroke="#f87171" strokeWidth="2" /><text x="140" y="50" textAnchor="middle" fill="#f87171" fontSize="6">Fail</text>
        <path d="M270 55 L310 55" stroke="#fbbf24" strokeWidth="2" /><text x="290" y="50" textAnchor="middle" fill="#fbbf24" fontSize="6">Timeout</text>
        <path d="M385 95 C 430 95 430 35 385 35" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3,3" />
        <path d="M340 95 C 295 95 295 35 340 35" stroke="#f87171" strokeWidth="1.5" strokeDasharray="3,3" />
        <text x="250" y="120" textAnchor="middle" fill="#71717a" fontSize="7">failure_rate=50%, timeout=30s • Hystrix, Resilience4j</text>
      </svg>
    ),
    queue: (
      <svg viewBox="0 0 500 130" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">RabbitMQ: Async Processing</text>
        <rect x="20" y="45" width="80" height="40" rx="6" fill={`${color}20`} stroke={color} strokeWidth="2" /><text x="60" y="70" textAnchor="middle" fill="#fafafa" fontSize="9">📤 Producer</text>
        <rect x="150" y="35" width="160" height="60" rx="8" fill="#fb923c15" stroke="#fb923c" strokeWidth="2" />
        <text x="230" y="55" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">📬 Queue</text>
        {[0, 1, 2, 3].map(i => <rect key={i} x={165 + i * 35} y="62" width="28" height="25" rx="3" fill="#fb923c30" stroke="#fb923c" />)}
        <rect x="360" y="35" width="80" height="30" rx="5" fill="#4ade8020" stroke="#4ade80" /><text x="400" y="55" textAnchor="middle" fill="#fafafa" fontSize="8">👷 W1</text>
        <rect x="360" y="73" width="80" height="30" rx="5" fill="#4ade8020" stroke="#4ade80" /><text x="400" y="93" textAnchor="middle" fill="#fafafa" fontSize="8">👷 W2</text>
        <path d="M105 65 L145 65" stroke="#71717a" strokeWidth="1.5" /><path d="M315 50 L355 50" stroke="#71717a" strokeWidth="1" /><path d="M315 80 L355 88" stroke="#71717a" strokeWidth="1" />
        <text x="250" y="118" textAnchor="middle" fill="#4ade80" fontSize="8">✓ Decoupling • Buffering • Async • Load leveling</text>
      </svg>
    ),
    pubsub: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Google Pub/Sub: Fan-out Events</text>
        <rect x="20" y="50" width="80" height="40" rx="6" fill={`${color}20`} stroke={color} strokeWidth="2" /><text x="60" y="75" textAnchor="middle" fill="#fafafa" fontSize="9">📤 Publisher</text>
        <rect x="150" y="40" width="120" height="60" rx="8" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="2" />
        <text x="210" y="65" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">📢 Topic</text>
        <text x="210" y="82" textAnchor="middle" fill="#71717a" fontSize="7">1 → N subscribers</text>
        {['Email', 'Analytics', 'Inventory', 'Notify'].map((s, i) => <g key={i}><rect x={320} y={25 + i * 28} width="80" height="23" rx="4" fill="#4ade8020" stroke="#4ade80" /><text x={360} y={40 + i * 28} textAnchor="middle" fill="#fafafa" fontSize="7">📥 {s}</text><path d={`M275 70 L315 ${36 + i * 28}`} stroke="#4ade80" strokeWidth="1" /></g>)}
        <path d="M105 70 L145 70" stroke="#71717a" strokeWidth="1.5" />
      </svg>
    ),
    kafka: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">LinkedIn Kafka: 7T messages/day</text>
        <rect x="15" y="45" width="70" height="35" rx="5" fill={`${color}20`} stroke={color} strokeWidth="2" /><text x="50" y="67" textAnchor="middle" fill="#fafafa" fontSize="8">📤 Producer</text>
        <rect x="110" y="30" width="250" height="95" rx="8" fill="#fb923c10" stroke="#fb923c" strokeWidth="2" />
        <text x="235" y="48" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">Kafka Cluster</text>
        <text x="130" y="65" fill="#a1a1aa" fontSize="7">Topic: orders</text>
        {[0, 1, 2].map(i => <g key={i}><rect x={125} y={72 + i * 17} width="110" height="14" rx="2" fill="#fb923c25" stroke="#fb923c" /><text x="180" y={82 + i * 17} textAnchor="middle" fill="#71717a" fontSize="6">Partition {i}</text>{[0, 1, 2, 3].map(j => <rect key={j} x={128 + j * 25} y={74 + i * 17} width="22" height="10" rx="1" fill={j === (4 - step) % 4 ? '#fb923c50' : '#fb923c15'} />)}</g>)}
        <rect x={255} y={60} width="90" height="55" rx="5" fill="rgba(255,255,255,0.02)" stroke="#52525b" /><text x="300" y="92" textAnchor="middle" fill="#52525b" fontSize="6">Replicas</text>
        {[0, 1, 2].map(i => <g key={i}><rect x="385" y={35 + i * 32} width="80" height="26" rx="4" fill={i < 2 ? '#4ade8020' : '#22d3ee20'} stroke={i < 2 ? '#4ade80' : '#22d3ee'} /><text x="425" y={52 + i * 32} textAnchor="middle" fill="#fafafa" fontSize="7">Consumer {i + 1}</text></g>)}
        <path d="M90 62 L105 62" stroke="#71717a" strokeWidth="1" /><path d="M365 62 L380 48" stroke="#71717a" strokeWidth="1" /><path d="M365 80 L380 80" stroke="#71717a" strokeWidth="1" /><path d="M365 98 L380 112" stroke="#71717a" strokeWidth="1" />
        <text x="425" y="140" textAnchor="middle" fill="#71717a" fontSize="6">Consumer Group</text>
      </svg>
    ),
    saga: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Saga: Distributed Transactions</text>
        {[{ x: 20, n: 'Order', a: 'Create' }, { x: 140, n: 'Payment', a: 'Charge' }, { x: 260, n: 'Inventory', a: 'Reserve' }, { x: 380, n: 'Shipping', a: 'Ship' }].map((s, i) => (
          <g key={i}><rect x={s.x} y="28" width="100" height="45" rx="6" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x={s.x + 50} y="48" textAnchor="middle" fill="#fafafa" fontSize="8">{s.n}</text><text x={s.x + 50} y="63" textAnchor="middle" fill="#4ade80" fontSize="7">✓ {s.a}</text>{i < 3 && <path d={`M${s.x + 105} 50 L${s.x + 135} 50`} stroke="#4ade80" strokeWidth="1.5" />}</g>
        ))}
        <text x="250" y="88" textAnchor="middle" fill="#fafafa" fontSize="8">Compensation (Rollback):</text>
        {[{ x: 20, c: 'Cancel' }, { x: 140, c: 'Refund' }, { x: 260, c: 'Release' }, { x: 380, c: '❌ Failed' }].map((s, i) => (
          <g key={i}><rect x={s.x} y="95" width="100" height="25" rx="4" fill={i === 3 ? '#f8717130' : '#fb923c20'} stroke={i === 3 ? '#f87171' : '#fb923c'} /><text x={s.x + 50} y="112" textAnchor="middle" fill={i === 3 ? '#f87171' : '#fb923c'} fontSize="7">{4 - i}. {s.c}</text>{i > 0 && <path d={`M${s.x - 5} 107 L${s.x - 35} 107`} stroke="#fb923c" strokeWidth="1" strokeDasharray="3,3" />}</g>
        ))}
        <text x="250" y="135" textAnchor="middle" fill="#71717a" fontSize="7">Choreography vs Orchestration</text>
      </svg>
    ),
    microservices: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Netflix: 1000+ services, 200B req/day</text>
        <rect x="15" y="25" width="470" height="32" rx="5" fill="#60a5fa10" stroke="#60a5fa" strokeDasharray="4,4" />
        <text x="30" y="40" fill="#60a5fa" fontSize="7">Edge</text>
        {['CDN', 'LB', 'Gateway', 'Auth'].map((n, i) => <g key={i}><rect x={70 + i * 100} y={30} width="85" height="22" rx="3" fill="#60a5fa20" stroke="#60a5fa" /><text x={112 + i * 100} y="45" textAnchor="middle" fill="#fafafa" fontSize="7">{n}</text></g>)}
        <rect x="15" y="62" width="470" height="55" rx="5" fill="#a78bfa08" stroke="#a78bfa" strokeDasharray="4,4" />
        <text x="30" y="77" fill="#a78bfa" fontSize="7">Services</text>
        {['User', 'Order', 'Payment', 'Inventory', 'Search'].map((n, i) => <g key={i}><rect x={70 + i * 85} y={70} width="75" height="22" rx="3" fill="#a78bfa20" stroke="#a78bfa" /><text x={107 + i * 85} y="85" textAnchor="middle" fill="#fafafa" fontSize="7">{n}</text></g>)}
        {['Email', 'Notify', 'Analytics'].map((n, i) => <g key={i}><rect x={120 + i * 110} y={96} width="70" height="18" rx="2" fill="#a78bfa15" stroke="#a78bfa" /><text x={155 + i * 110} y="109" textAnchor="middle" fill="#a1a1aa" fontSize="6">{n}</text></g>)}
        <rect x="15" y="122" width="470" height="30" rx="5" fill="#f472b608" stroke="#f472b6" strokeDasharray="4,4" />
        <text x="30" y="137" fill="#f472b6" fontSize="7">Data</text>
        {['PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'S3'].map((n, i) => <g key={i}><rect x={85 + i * 80} y={128} width="70" height="20" rx="3" fill="#f472b620" stroke="#f472b6" /><text x={120 + i * 80} y="142" textAnchor="middle" fill="#fafafa" fontSize="6">{n}</text></g>)}
      </svg>
    ),
    oauth: (
      <svg viewBox="0 0 450 150" style={{ width: '100%', maxWidth: 450, display: 'block', margin: '0 auto' }}>
        <text x="225" y="15" textAnchor="middle" fill="#52525b" fontSize="9">OAuth 2.0 Authorization Code Flow</text>
        {[{ x: 15, l: '👤 User', c: color }, { x: 120, l: '📱 App', c: color }, { x: 240, l: '🔐 Auth', c: '#4ade80' }, { x: 355, l: '🗄️ API', c: '#60a5fa' }].map((a, i) => <g key={i}><rect x={a.x} y="25" width="80" height="32" rx="5" fill={`${a.c}20`} stroke={a.c} strokeWidth="1.5" /><text x={a.x + 40} y="45" textAnchor="middle" fill="#fafafa" fontSize="8">{a.l}</text></g>)}
        {[{ y: 70, f: 55, t: 160, l: '1. Login', c: color }, { y: 85, f: 160, t: 280, l: '2. Redirect', c: color }, { y: 100, f: 280, t: 55, l: '3. Approve', c: '#4ade80' }, { y: 115, f: 55, t: 160, l: '4. Code', c: '#4ade80' }, { y: 130, f: 160, t: 280, l: '5. Token', c: '#fb923c' }, { y: 145, f: 200, t: 395, l: '6. API call', c: '#60a5fa' }].map((s, i) => (
          <g key={i}><circle cx={Math.min(s.f, s.t)} cy={s.y} r="6" fill={s.c} /><text x={Math.min(s.f, s.t)} y={s.y + 3} textAnchor="middle" fill="#09090b" fontSize="6" fontWeight="bold">{i + 1}</text><path d={`M${Math.min(s.f, s.t) + 8} ${s.y} L${Math.max(s.f, s.t) - 3} ${s.y}`} stroke={s.c} strokeWidth="1.5" /><text x={(s.f + s.t) / 2 + 10} y={s.y - 3} fill={s.c} fontSize="6">{s.l}</text></g>
        ))}
      </svg>
    ),
    jwt: (
      <svg viewBox="0 0 500 130" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">JWT: Stateless Tokens</text>
        <rect x="30" y="25" width="440" height="40" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="42" textAnchor="middle" fill="#fafafa" fontSize="8" fontFamily="monospace">eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.sig</text>
        <rect x="55" y="52" width="110" height="15" rx="2" fill="#f8717130" stroke="#f87171" /><text x="110" y="63" textAnchor="middle" fill="#f87171" fontSize="7">Header</text>
        <rect x="195" y="52" width="110" height="15" rx="2" fill="#a78bfa30" stroke="#a78bfa" /><text x="250" y="63" textAnchor="middle" fill="#a78bfa" fontSize="7">Payload</text>
        <rect x="335" y="52" width="110" height="15" rx="2" fill="#4ade8030" stroke="#4ade80" /><text x="390" y="63" textAnchor="middle" fill="#4ade80" fontSize="7">Signature</text>
        <rect x="30" y="80" width="210" height="40" rx="5" fill="rgba(74,222,128,0.08)" stroke="#4ade80" />
        <text x="135" y="97" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="500">✓ Advantages</text>
        <text x="42" y="112" fill="#a1a1aa" fontSize="7">Stateless • Self-contained • Cross-domain</text>
        <rect x="260" y="80" width="210" height="40" rx="5" fill="rgba(248,113,113,0.08)" stroke="#f87171" />
        <text x="365" y="97" textAnchor="middle" fill="#f87171" fontSize="8" fontWeight="500">✗ Considerations</text>
        <text x="272" y="112" fill="#a1a1aa" fontSize="7">Can't revoke early • Larger size</text>
      </svg>
    ),
    ratelimit: (
      <svg viewBox="0 0 500 130" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Rate Limiting Algorithms</text>
        {[{ x: 10, n: 'Token Bucket', c: '#4ade80', d: 'Bursts OK' }, { x: 135, n: 'Leaky Bucket', c: '#22d3ee', d: 'Smooth' }, { x: 260, n: 'Fixed Window', c: '#a78bfa', d: 'Simple' }, { x: 385, n: 'Sliding Window', c: '#f472b6', d: 'Accurate' }].map((a, i) => (
          <g key={i}><rect x={a.x} y="28" width="105" height="60" rx="6" fill={`${a.c}15`} stroke={a.c} strokeWidth="1.5" /><text x={a.x + 52} y="48" textAnchor="middle" fill={a.c} fontSize="9" fontWeight="600">{a.n}</text><rect x={a.x + 20} y="55" width="65" height="18" rx="3" fill="rgba(0,0,0,0.3)" /><rect x={a.x + 22} y="62" width={40 - i * 6} height="9" fill={`${a.c}50`} /><text x={a.x + 52} y="82" textAnchor="middle" fill="#71717a" fontSize="7">{a.d}</text></g>
        ))}
        <rect x="10" y="100" width="480" height="22" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="115" textAnchor="middle" fill="#71717a" fontSize="7">Token→APIs • Leaky→Traffic • Fixed→Counters • Sliding→Accurate | X-RateLimit headers</text>
      </svg>
    ),
    cap: (
      <svg viewBox="0 0 450 170" style={{ width: '100%', maxWidth: 450, display: 'block', margin: '0 auto' }}>
        <text x="225" y="15" textAnchor="middle" fill="#52525b" fontSize="9">CAP Theorem: Choose 2 of 3</text>
        <polygon points="225,35 80,155 370,155" fill="none" stroke="#3f3f46" strokeWidth="2" />
        <circle cx="225" cy="35" r="24" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="2" /><text x="225" y="33" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">C</text><text x="225" y="46" textAnchor="middle" fill="#60a5fa" fontSize="6">Consistency</text>
        <circle cx="80" cy="155" r="24" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" /><text x="80" y="153" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">A</text><text x="80" y="166" textAnchor="middle" fill="#4ade80" fontSize="6">Availability</text>
        <circle cx="370" cy="155" r="24" fill="#f472b620" stroke="#f472b6" strokeWidth="2" /><text x="370" y="153" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="600">P</text><text x="370" y="166" textAnchor="middle" fill="#f472b6" fontSize="6">Partition</text>
        <rect x="235" y="75" width="85" height="38" rx="4" fill="#60a5fa15" stroke="#60a5fa" /><text x="277" y="91" textAnchor="middle" fill="#60a5fa" fontSize="7" fontWeight="500">CP</text><text x="277" y="104" textAnchor="middle" fill="#71717a" fontSize="6">MongoDB, Spanner</text>
        <rect x="105" y="115" width="85" height="38" rx="4" fill="#4ade8015" stroke="#4ade80" /><text x="147" y="131" textAnchor="middle" fill="#4ade80" fontSize="7" fontWeight="500">AP</text><text x="147" y="144" textAnchor="middle" fill="#71717a" fontSize="6">Cassandra, DynamoDB</text>
        <rect x="260" y="115" width="85" height="38" rx="4" fill="#fbbf2415" stroke="#fbbf24" strokeDasharray="3,3" /><text x="302" y="131" textAnchor="middle" fill="#fbbf24" fontSize="7" fontWeight="500">CA</text><text x="302" y="144" textAnchor="middle" fill="#71717a" fontSize="6">Single-node RDBMS</text>
      </svg>
    ),
    hash: (
      <svg viewBox="0 0 450 170" style={{ width: '100%', maxWidth: 450, display: 'block', margin: '0 auto' }}>
        <text x="225" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Consistent Hashing: Minimal Data Movement</text>
        <circle cx="120" cy="95" r="65" fill="none" stroke="#3f3f46" strokeWidth="2" /><text x="120" y="95" textAnchor="middle" fill="#52525b" fontSize="7">Hash Ring</text>
        {[0, 72, 144, 216, 288].map((a, i) => { const r = (a - 90) * Math.PI / 180; const x = 120 + 65 * Math.cos(r); const y = 95 + 65 * Math.sin(r); return <g key={i}><circle cx={x} cy={y} r="10" fill={['#4ade80', '#22d3ee', '#a78bfa', '#f472b6', '#fb923c'][i] + '40'} stroke={['#4ade80', '#22d3ee', '#a78bfa', '#f472b6', '#fb923c'][i]} strokeWidth="2" /><text x={x} y={y + 3} textAnchor="middle" fill="#fafafa" fontSize="6">N{i + 1}</text></g>; })}
        {[30, 100, 180, 250, 320].map((a, i) => { const r = (a - 90) * Math.PI / 180; const x = 120 + 45 * Math.cos(r); const y = 95 + 45 * Math.sin(r); return <circle key={i} cx={x} cy={y} r="4" fill="#fafafa" opacity="0.4" />; })}
        <rect x="220" y="35" width="200" height="120" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="320" y="55" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="500">How it works:</text>
        <text x="235" y="75" fill="#a1a1aa" fontSize="7">1. Hash nodes & keys to ring</text>
        <text x="235" y="92" fill="#a1a1aa" fontSize="7">2. Key → nearest node clockwise</text>
        <text x="235" y="109" fill="#a1a1aa" fontSize="7">3. Add node → only K/N keys move</text>
        <text x="235" y="126" fill="#4ade80" fontSize="7">✓ Minimal redistribution</text>
        <text x="235" y="143" fill="#71717a" fontSize="6">Used: Cassandra, DynamoDB, Memcached</text>
      </svg>
    ),
    apicompare: (
      <svg viewBox="0 0 500 130" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">API Protocol Comparison</text>
        {[{ x: 10, n: 'REST', c: '#4ade80', p: ['Simple', 'Cacheable'], u: 'Public APIs' }, { x: 175, n: 'GraphQL', c: '#e879f9', p: ['Flexible', 'Typed'], u: 'Mobile' }, { x: 340, n: 'gRPC', c: '#fb923c', p: ['Fast', 'Streaming'], u: 'Microservices' }].map((a, i) => (
          <g key={i}><rect x={a.x} y="28" width="145" height="90" rx="6" fill={`${a.c}10`} stroke={a.c} strokeWidth="1.5" /><text x={a.x + 72} y="48" textAnchor="middle" fill={a.c} fontSize="11" fontWeight="600">{a.n}</text><text x={a.x + 15} y="68" fill="#4ade80" fontSize="7">✓ {a.p[0]}</text><text x={a.x + 15} y="83" fill="#4ade80" fontSize="7">✓ {a.p[1]}</text><text x={a.x + 72} y="108" textAnchor="middle" fill="#52525b" fontSize="7">Best: {a.u}</text></g>
        ))}
      </svg>
    ),
    websocket: (
      <svg viewBox="0 0 450 120" style={{ width: '100%', maxWidth: 450, display: 'block', margin: '0 auto' }}>
        <text x="225" y="15" textAnchor="middle" fill="#52525b" fontSize="9">WebSocket: Real-time Bi-directional</text>
        <rect x="20" y="35" width="90" height="40" rx="6" fill={`${color}20`} stroke={color} strokeWidth="2" /><text x="65" y="60" textAnchor="middle" fill="#fafafa" fontSize="9">📱 Client</text>
        <rect x="340" y="35" width="90" height="40" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" /><text x="385" y="60" textAnchor="middle" fill="#fafafa" fontSize="9">🖥️ Server</text>
        <path d="M115 45 L335 45" stroke={color} strokeWidth="2" /><text x="225" y="40" textAnchor="middle" fill={color} fontSize="7">HTTP Upgrade → WebSocket</text>
        <path d="M115 55 L335 55" stroke="#4ade80" strokeWidth="1.5" /><path d="M335 62 L115 62" stroke="#fb923c" strokeWidth="1.5" /><path d="M115 69 L335 69" stroke="#4ade80" strokeWidth="1.5" />
        <text x="225" y="95" textAnchor="middle" fill="#71717a" fontSize="8">↔ Full-duplex • Use: Chat, Gaming, Live feeds</text>
        <text x="225" y="110" textAnchor="middle" fill="#52525b" fontSize="7">Alt: SSE (server→client), Long polling (legacy)</text>
      </svg>
    ),
    k8s: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Kubernetes: Container Orchestration</text>
        <rect x="15" y="25" width="190" height="75" rx="6" fill="#60a5fa10" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="110" y="42" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">Control Plane</text>
        {['API Server', 'etcd', 'Scheduler', 'Controller'].map((c, i) => <g key={i}><rect x={28 + (i % 2) * 90} y={50 + Math.floor(i / 2) * 25} width="78" height="20" rx="3" fill="#60a5fa20" stroke="#60a5fa" /><text x={67 + (i % 2) * 90} y="64 + Math.floor(i / 2) * 25" textAnchor="middle" fill="#fafafa" fontSize="7">{c}</text></g>)}
        <rect x="230" y="25" width="250" height="125" rx="6" fill="#4ade8008" stroke="#4ade80" strokeDasharray="4,4" />
        <text x="355" y="42" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Worker Nodes</text>
        {[0, 1].map(n => <g key={n}><rect x={245 + n * 120} y="50" width="105" height="60" rx="5" fill="#4ade8015" stroke="#4ade80" /><text x={297 + n * 120} y="65" textAnchor="middle" fill="#4ade80" fontSize="7">Node {n + 1}</text>{[0, 1].map(p => <rect key={p} x={255 + n * 120 + p * 45} y="72" width="38" height="20" rx="2" fill="#a78bfa20" stroke="#a78bfa" />)}<text x={297 + n * 120} y="88" textAnchor="middle" fill="#a78bfa" fontSize="5">Pods</text><rect x={255 + n * 120} y="98" width="85" height="12" rx="2" fill="rgba(255,255,255,0.03)" /><text x={297 + n * 120} y="107" textAnchor="middle" fill="#52525b" fontSize="5">kubelet</text></g>)}
        <rect x={250} y="118" width="220" height="22" rx="4" fill="#fb923c20" stroke="#fb923c" /><text x={360} y="133" textAnchor="middle" fill="#fb923c" fontSize="7">Service (Load Balancer)</text>
      </svg>
    ),
    cicd: (
      <svg viewBox="0 0 500 110" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">CI/CD Pipeline</text>
        {[{ x: 10, n: 'Code', i: '💻', c: '#60a5fa' }, { x: 92, n: 'Build', i: '🔨', c: '#a78bfa' }, { x: 174, n: 'Test', i: '🧪', c: '#4ade80' }, { x: 256, n: 'Security', i: '🔒', c: '#fbbf24' }, { x: 338, n: 'Deploy', i: '🚀', c: '#f472b6' }, { x: 420, n: 'Monitor', i: '📊', c: '#22d3ee' }].map((s, i) => (
          <g key={i}><rect x={s.x} y="28" width="70" height="50" rx="5" fill={`${s.c}20`} stroke={s.c} strokeWidth="1.5" /><text x={s.x + 35} y="50" textAnchor="middle" fill="#fafafa" fontSize="13">{s.i}</text><text x={s.x + 35} y="68" textAnchor="middle" fill={s.c} fontSize="7">{s.n}</text>{i < 5 && <path d={`M${s.x + 75} 53 L${s.x + 87} 53`} stroke="#52525b" strokeWidth="1.5" />}</g>
        ))}
        <text x="250" y="100" textAnchor="middle" fill="#71717a" fontSize="7">Commit → PR → Review → Merge → Auto-deploy → Monitor</text>
      </svg>
    ),
    bluegreen: (
      <svg viewBox="0 0 450 120" style={{ width: '100%', maxWidth: 450, display: 'block', margin: '0 auto' }}>
        <text x="225" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Blue-Green Deployment: Zero Downtime</text>
        <rect x="160" y="28" width="130" height="30" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="225" y="47" textAnchor="middle" fill="#fb923c" fontSize="9">⚖️ Load Balancer</text>
        <rect x="30" y="72" width="160" height="40" rx="6" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="2" />
        <text x="110" y="92" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">🔵 Blue (v1.0)</text>
        <text x="110" y="106" textAnchor="middle" fill="#4ade80" fontSize="7">✓ 100% traffic</text>
        <rect x="260" y="72" width="160" height="40" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="340" y="92" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">🟢 Green (v2.0)</text>
        <text x="340" y="106" textAnchor="middle" fill="#71717a" fontSize="7">0% traffic (ready)</text>
        <path d="M200 62 L110 67" stroke="#60a5fa" strokeWidth="2.5" /><path d="M250 62 L340 67" stroke="#4ade80" strokeWidth="1" strokeDasharray="4,4" />
      </svg>
    ),
    urlshort: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">URL Shortener Design</text>
        <rect x="15" y="35" width="70" height="35" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="50" y="57" textAnchor="middle" fill="#fafafa" fontSize="8">📱 Client</text>
        <rect x="115" y="30" width="90" height="45" rx="5" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="1.5" /><text x="160" y="50" textAnchor="middle" fill="#60a5fa" fontSize="8">⚖️ LB</text><text x="160" y="65" textAnchor="middle" fill="#71717a" fontSize="6">API Servers</text>
        <rect x="235" y="25" width="120" height="55" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="295" y="45" textAnchor="middle" fill="#4ade80" fontSize="8">🖥️ URL Service</text><text x="295" y="60" textAnchor="middle" fill="#71717a" fontSize="6">Create/Redirect</text><text x="295" y="73" textAnchor="middle" fill="#71717a" fontSize="5">Base62 encode</text>
        <rect x="385" y="25" width="90" height="25" rx="4" fill="#f472b620" stroke="#f472b6" /><text x="430" y="42" textAnchor="middle" fill="#f472b6" fontSize="7">⚡ Cache</text>
        <rect x="385" y="58" width="90" height="25" rx="4" fill="#a78bfa20" stroke="#a78bfa" /><text x="430" y="75" textAnchor="middle" fill="#a78bfa" fontSize="7">💾 DB</text>
        <path d="M90 52 L110 52" stroke="#71717a" strokeWidth="1" /><path d="M210 52 L230 52" stroke="#71717a" strokeWidth="1" /><path d="M360 40 L380 37" stroke="#71717a" strokeWidth="1" /><path d="M360 65 L380 70" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="95" width="225" height="45" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="127" y="112" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">URL Encoding</text>
        <text x="27" y="128" fill="#a1a1aa" fontSize="7">ID: 12345678 → "dnh8" | 62^7 = 3.5T</text>
        <rect x="260" y="95" width="225" height="45" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="372" y="112" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Key Decisions</text>
        <text x="272" y="128" fill="#4ade80" fontSize="7">✓ Cache hot URLs (80%)</text>
      </svg>
    ),
    twitter: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Twitter Feed: Fan-out Design</text>
        <rect x="15" y="35" width="70" height="35" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="50" y="57" textAnchor="middle" fill="#fafafa" fontSize="8">✍️ Tweet</text>
        <rect x="115" y="30" width="100" height="45" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="165" y="50" textAnchor="middle" fill="#fb923c" fontSize="8">📨 Fan-out</text><text x="165" y="65" textAnchor="middle" fill="#71717a" fontSize="6">Service</text>
        <rect x="245" y="25" width="120" height="55" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="305" y="45" textAnchor="middle" fill="#4ade80" fontSize="8">🗃️ Timeline Cache</text><text x="305" y="60" textAnchor="middle" fill="#71717a" fontSize="6">User A: [t1,t2]</text><text x="305" y="72" textAnchor="middle" fill="#71717a" fontSize="5">~800 tweets/user</text>
        <rect x="395" y="35" width="85" height="35" rx="5" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="1.5" /><text x="437" y="57" textAnchor="middle" fill="#60a5fa" fontSize="8">👀 Read</text>
        <path d="M90 52 L110 52" stroke="#71717a" strokeWidth="1" /><path d="M220 52 L240 52" stroke="#71717a" strokeWidth="1" /><path d="M370 52 L390 52" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="95" width="225" height="45" rx="5" fill="rgba(251,146,60,0.08)" stroke="#fb923c" />
        <text x="127" y="112" textAnchor="middle" fill="#fb923c" fontSize="8" fontWeight="500">Fan-out on Write</text>
        <text x="27" y="128" fill="#4ade80" fontSize="7">✓ Fast reads</text><text x="120" y="128" fill="#f87171" fontSize="7">✗ Slow for celebrities</text>
        <rect x="260" y="95" width="225" height="45" rx="5" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" />
        <text x="372" y="112" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="500">Fan-out on Read</text>
        <text x="272" y="128" fill="#4ade80" fontSize="7">✓ Fast writes</text><text x="365" y="128" fill="#f87171" fontSize="7">✗ Slow reads</text>
      </svg>
    ),
    chat: (
      <svg viewBox="0 0 500 170" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">WhatsApp: 100B+ messages/day</text>
        <rect x="15" y="35" width="70" height="50" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="50" y="58" textAnchor="middle" fill="#fafafa" fontSize="9">📱</text><text x="50" y="73" textAnchor="middle" fill="#71717a" fontSize="7">User A</text>
        <rect x="115" y="30" width="110" height="60" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" />
        <text x="170" y="52" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">🔌 Gateway</text>
        <text x="170" y="68" textAnchor="middle" fill="#71717a" fontSize="6">WebSocket</text>
        <text x="170" y="82" textAnchor="middle" fill="#71717a" fontSize="6">Connection Mgr</text>
        <rect x="255" y="25" width="110" height="70" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" />
        <text x="310" y="48" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">💬 Chat Svc</text>
        <text x="310" y="65" textAnchor="middle" fill="#71717a" fontSize="6">Message routing</text>
        <text x="310" y="78" textAnchor="middle" fill="#71717a" fontSize="6">Delivery status</text>
        <text x="310" y="91" textAnchor="middle" fill="#71717a" fontSize="6">Presence</text>
        <rect x="395" y="30" width="90" height="25" rx="4" fill="#a78bfa20" stroke="#a78bfa" /><text x="440" y="47" textAnchor="middle" fill="#a78bfa" fontSize="7">📨 Kafka</text>
        <rect x="395" y="62" width="90" height="25" rx="4" fill="#f472b620" stroke="#f472b6" /><text x="440" y="79" textAnchor="middle" fill="#f472b6" fontSize="7">💾 Cassandra</text>
        <rect x="415" y="35" width="70" height="50" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" style={{transform: 'translate(0, 60px)'}} />
        <text x="450" y="153" textAnchor="middle" fill="#fafafa" fontSize="9">📱</text><text x="450" y="163" textAnchor="middle" fill="#71717a" fontSize="7">User B</text>
        <path d="M90 60 L110 60" stroke="#71717a" strokeWidth="1" /><path d="M230 60 L250 60" stroke="#71717a" strokeWidth="1" /><path d="M370 42 L390 42" stroke="#71717a" strokeWidth="1" /><path d="M370 75 L390 75" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="105" width="350" height="55" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="190" y="125" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Message Flow</text>
        <text x="30" y="145" fill="#a1a1aa" fontSize="7">1. Send via WebSocket → 2. Route to recipient → 3. Store in Cassandra → 4. Deliver + ACK</text>
      </svg>
    ),
    video: (
      <svg viewBox="0 0 500 170" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">YouTube: 500+ hours uploaded/min, 1B+ hours watched/day</text>
        <rect x="15" y="35" width="70" height="40" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="50" y="55" textAnchor="middle" fill="#fafafa" fontSize="8">📤 Upload</text><text x="50" y="68" textAnchor="middle" fill="#71717a" fontSize="6">Client</text>
        <rect x="110" y="30" width="90" height="50" rx="5" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="1.5" /><text x="155" y="52" textAnchor="middle" fill="#60a5fa" fontSize="8">🗄️ Storage</text><text x="155" y="68" textAnchor="middle" fill="#71717a" fontSize="6">Raw video</text>
        <rect x="225" y="30" width="100" height="50" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="275" y="52" textAnchor="middle" fill="#fb923c" fontSize="8">🎬 Transcode</text><text x="275" y="68" textAnchor="middle" fill="#71717a" fontSize="6">Multiple res</text>
        <rect x="350" y="30" width="70" height="50" rx="5" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="385" y="52" textAnchor="middle" fill="#a78bfa" fontSize="8">📦 CDN</text><text x="385" y="68" textAnchor="middle" fill="#71717a" fontSize="6">Edge cache</text>
        <rect x="445" y="35" width="45" height="40" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="467" y="55" textAnchor="middle" fill="#4ade80" fontSize="8">👁️</text><text x="467" y="68" textAnchor="middle" fill="#71717a" fontSize="5">Watch</text>
        <path d="M90 55 L105 55" stroke="#71717a" strokeWidth="1" /><path d="M205 55 L220 55" stroke="#71717a" strokeWidth="1" /><path d="M330 55 L345 55" stroke="#71717a" strokeWidth="1" /><path d="M425 55 L440 55" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="95" width="225" height="65" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="127" y="112" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Transcoding Output</text>
        <text x="30" y="128" fill="#a1a1aa" fontSize="7">• 144p, 240p, 360p, 480p, 720p, 1080p, 4K</text>
        <text x="30" y="145" fill="#a1a1aa" fontSize="7">• HLS/DASH adaptive streaming</text>
        <rect x="260" y="95" width="225" height="65" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="372" y="112" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Key Components</text>
        <text x="275" y="128" fill="#4ade80" fontSize="7">✓ Chunked upload (resumable)</text>
        <text x="275" y="145" fill="#4ade80" fontSize="7">✓ Async processing queue</text>
      </svg>
    ),
    rideshare: (
      <svg viewBox="0 0 500 170" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Uber: 14M trips/day, location updates every 4 sec</text>
        <rect x="15" y="35" width="70" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="50" y="55" textAnchor="middle" fill="#fafafa" fontSize="8">🧑 Rider</text><text x="50" y="70" textAnchor="middle" fill="#71717a" fontSize="6">Request</text>
        <rect x="110" y="30" width="100" height="55" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="160" y="50" textAnchor="middle" fill="#fb923c" fontSize="8" fontWeight="600">🗺️ Matching</text><text x="160" y="65" textAnchor="middle" fill="#71717a" fontSize="6">Find nearby</text><text x="160" y="78" textAnchor="middle" fill="#71717a" fontSize="6">drivers</text>
        <rect x="235" y="30" width="100" height="55" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="285" y="50" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="600">📍 Geo Index</text><text x="285" y="65" textAnchor="middle" fill="#71717a" fontSize="6">Geohash/S2</text><text x="285" y="78" textAnchor="middle" fill="#71717a" fontSize="6">cells</text>
        <rect x="360" y="30" width="60" height="55" rx="5" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="390" y="55" textAnchor="middle" fill="#a78bfa" fontSize="8">🚗</text><text x="390" y="72" textAnchor="middle" fill="#71717a" fontSize="6">Drivers</text>
        <rect x="430" y="35" width="55" height="45" rx="5" fill="#22d3ee20" stroke="#22d3ee" strokeWidth="1.5" /><text x="457" y="55" textAnchor="middle" fill="#22d3ee" fontSize="7">📡 Track</text><text x="457" y="70" textAnchor="middle" fill="#71717a" fontSize="5">Real-time</text>
        <path d="M90 57 L105 57" stroke="#71717a" strokeWidth="1" /><path d="M215 57 L230 57" stroke="#71717a" strokeWidth="1" /><path d="M340 57 L355 57" stroke="#71717a" strokeWidth="1" /><path d="M425 57 L440 57" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="100" width="225" height="60" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="127" y="117" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Geospatial Index</text>
        <text x="30" y="133" fill="#a1a1aa" fontSize="7">• Geohash: "9q8yy" → lat/lng cell</text>
        <text x="30" y="148" fill="#a1a1aa" fontSize="7">• Query nearby: O(1) cell lookup</text>
        <rect x="260" y="100" width="225" height="60" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="372" y="117" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Matching Algorithm</text>
        <text x="275" y="133" fill="#4ade80" fontSize="7">✓ ETA-based ranking</text>
        <text x="275" y="148" fill="#4ade80" fontSize="7">✓ Driver score, acceptance rate</text>
      </svg>
    ),
    consensus: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Raft Consensus: Leader Election + Log Replication</text>
        <circle cx="100" cy="75" r="35" fill="#4ade8030" stroke="#4ade80" strokeWidth="3" /><text x="100" y="70" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">Leader</text><text x="100" y="85" textAnchor="middle" fill="#71717a" fontSize="7">Node 1</text>
        <circle cx="250" cy="75" r="30" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="2" /><text x="250" y="70" textAnchor="middle" fill="#60a5fa" fontSize="9">Follower</text><text x="250" y="85" textAnchor="middle" fill="#71717a" fontSize="7">Node 2</text>
        <circle cx="400" cy="75" r="30" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="2" /><text x="400" y="70" textAnchor="middle" fill="#60a5fa" fontSize="9">Follower</text><text x="400" y="85" textAnchor="middle" fill="#71717a" fontSize="7">Node 3</text>
        <path d="M140 65 L215 65" stroke="#4ade80" strokeWidth="2" /><text x="177" y="58" textAnchor="middle" fill="#4ade80" fontSize="6">replicate</text>
        <path d="M140 85 L365 85" stroke="#4ade80" strokeWidth="2" /><text x="252" y="95" textAnchor="middle" fill="#4ade80" fontSize="6">heartbeat</text>
        <rect x="15" y="120" width="225" height="35" rx="5" fill="rgba(74,222,128,0.08)" stroke="#4ade80" />
        <text x="127" y="142" textAnchor="middle" fill="#4ade80" fontSize="8">Raft: Understandable consensus</text>
        <rect x="260" y="120" width="225" height="35" rx="5" fill="rgba(167,139,250,0.08)" stroke="#a78bfa" />
        <text x="372" y="142" textAnchor="middle" fill="#a78bfa" fontSize="8">Used: etcd, Consul, CockroachDB</text>
      </svg>
    ),
    serverless: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">AWS Lambda: Event-driven, auto-scaling</text>
        <rect x="15" y="40" width="80" height="35" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="62" textAnchor="middle" fill="#fafafa" fontSize="8">🌐 API GW</text>
        <rect x="15" y="85" width="80" height="35" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="55" y="107" textAnchor="middle" fill="#fb923c" fontSize="8">📨 SQS</text>
        <rect x="130" y="55" width="100" height="60" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="2" />
        <text x="180" y="78" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="600">λ Lambda</text>
        <text x="180" y="95" textAnchor="middle" fill="#71717a" fontSize="7">Stateless function</text>
        <text x="180" y="108" textAnchor="middle" fill="#71717a" fontSize="6">0→1000 instances</text>
        <rect x="265" y="40" width="80" height="35" rx="5" fill="#f472b620" stroke="#f472b6" strokeWidth="1.5" /><text x="305" y="62" textAnchor="middle" fill="#f472b6" fontSize="8">💾 DynamoDB</text>
        <rect x="265" y="85" width="80" height="35" rx="5" fill="#22d3ee20" stroke="#22d3ee" strokeWidth="1.5" /><text x="305" y="107" textAnchor="middle" fill="#22d3ee" fontSize="8">🪣 S3</text>
        <path d="M100 57 L125 75" stroke="#71717a" strokeWidth="1" /><path d="M100 102 L125 90" stroke="#71717a" strokeWidth="1" /><path d="M235 75 L260 57" stroke="#71717a" strokeWidth="1" /><path d="M235 90 L260 102" stroke="#71717a" strokeWidth="1" />
        <rect x="370" y="45" width="115" height="75" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="427" y="65" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Benefits</text>
        <text x="380" y="82" fill="#4ade80" fontSize="7">✓ No server mgmt</text>
        <text x="380" y="97" fill="#4ade80" fontSize="7">✓ Auto-scaling</text>
        <text x="380" y="112" fill="#4ade80" fontSize="7">✓ Pay per invocation</text>
      </svg>
    ),
    bff: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Backend for Frontend: Client-specific APIs</text>
        <rect x="15" y="40" width="60" height="35" rx="5" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="1.5" /><text x="45" y="62" textAnchor="middle" fill="#60a5fa" fontSize="8">📱 iOS</text>
        <rect x="15" y="85" width="60" height="35" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="45" y="107" textAnchor="middle" fill="#4ade80" fontSize="8">🤖 Android</text>
        <rect x="100" y="35" width="80" height="45" rx="5" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="1.5" /><text x="140" y="55" textAnchor="middle" fill="#60a5fa" fontSize="8">BFF</text><text x="140" y="70" textAnchor="middle" fill="#71717a" fontSize="6">Mobile</text>
        <rect x="100" y="90" width="80" height="35" rx="5" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="140" y="108" textAnchor="middle" fill="#a78bfa" fontSize="8">BFF Web</text>
        <rect x="15" y="130" width="60" height="25" rx="4" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="45" y="147" textAnchor="middle" fill="#a78bfa" fontSize="7">🌐 Web</text>
        <rect x="220" y="50" width="260" height="70" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="350" y="70" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="500">Backend Services</text>
        {['User', 'Order', 'Payment', 'Search'].map((s, i) => <g key={i}><rect x={235 + i * 60} y="80" width="50" height="28" rx="4" fill="#f472b620" stroke="#f472b6" /><text x={260 + i * 60} y="98" textAnchor="middle" fill="#fafafa" fontSize="6">{s}</text></g>)}
        <path d="M80 57 L95 57" stroke="#71717a" strokeWidth="1" /><path d="M80 102 L95 57" stroke="#71717a" strokeWidth="1" /><path d="M80 142 L95 107" stroke="#71717a" strokeWidth="1" /><path d="M185 57 L215 85" stroke="#71717a" strokeWidth="1" /><path d="M185 107 L215 95" stroke="#71717a" strokeWidth="1" />
      </svg>
    ),
    monomicro: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Shopify: Started monolith → selective extraction</text>
        <rect x="20" y="30" width="200" height="105" rx="8" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="2" />
        <text x="120" y="50" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">🏢 Monolith</text>
        <rect x="35" y="60" width="170" height="60" rx="5" fill="#60a5fa15" />
        <text x="120" y="80" textAnchor="middle" fill="#fafafa" fontSize="8">All code in one codebase</text>
        <text x="120" y="95" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Simple deploy, debug</text>
        <text x="120" y="108" textAnchor="middle" fill="#f87171" fontSize="7">✗ Scale entire app</text>
        <rect x="280" y="30" width="200" height="105" rx="8" fill="rgba(167,139,250,0.08)" stroke="#a78bfa" strokeWidth="2" />
        <text x="380" y="50" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="600">🧩 Microservices</text>
        {['User', 'Order', 'Pay'].map((s, i) => <rect key={i} x={295 + i * 60} y="62" width="50" height="25" rx="4" fill="#a78bfa20" stroke="#a78bfa" />)}
        {['User', 'Order', 'Pay'].map((s, i) => <text key={i} x={320 + i * 60} y="79" textAnchor="middle" fill="#fafafa" fontSize="7">{s}</text>)}
        <text x="380" y="105" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Scale independently</text>
        <text x="380" y="118" textAnchor="middle" fill="#f87171" fontSize="7">✗ Distributed complexity</text>
        <path d="M225 82 L275 82" stroke="#fb923c" strokeWidth="2" strokeDasharray="5,5" /><text x="250" y="75" textAnchor="middle" fill="#fb923c" fontSize="7">migrate</text>
      </svg>
    ),
    pagination: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">API Pagination Strategies</text>
        <rect x="20" y="30" width="210" height="105" rx="8" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="2" />
        <text x="125" y="50" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">📄 Offset</text>
        <text x="35" y="70" fill="#fafafa" fontSize="8">?page=3&limit=20</text>
        <text x="35" y="88" fill="#4ade80" fontSize="7">✓ Simple, jump to page</text>
        <text x="35" y="103" fill="#f87171" fontSize="7">✗ Slow on large datasets</text>
        <text x="35" y="118" fill="#f87171" fontSize="7">✗ Inconsistent with changes</text>
        <rect x="270" y="30" width="210" height="105" rx="8" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeWidth="2" />
        <text x="375" y="50" textAnchor="middle" fill="#4ade80" fontSize="11" fontWeight="600">🔗 Cursor</text>
        <text x="285" y="70" fill="#fafafa" fontSize="8">?cursor=abc123&limit=20</text>
        <text x="285" y="88" fill="#4ade80" fontSize="7">✓ Fast, consistent</text>
        <text x="285" y="103" fill="#4ade80" fontSize="7">✓ Works with real-time data</text>
        <text x="285" y="118" fill="#f87171" fontSize="7">✗ No random page access</text>
      </svg>
    ),
    indexing: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">PostgreSQL: Index types for different queries</text>
        {[{ x: 10, n: 'B-Tree', c: '#4ade80', d: 'Default, range queries', u: '=, <, >, BETWEEN' }, { x: 135, n: 'Hash', c: '#22d3ee', d: 'Equality only', u: '= lookups' }, { x: 260, n: 'GIN', c: '#a78bfa', d: 'Multi-value', u: 'Arrays, JSONB' }, { x: 385, n: 'Full-Text', c: '#fb923c', d: 'Text search', u: 'LIKE, search' }].map((idx, i) => (
          <g key={i}><rect x={idx.x} y="28" width="115" height="75" rx="6" fill={`${idx.c}15`} stroke={idx.c} strokeWidth="1.5" /><text x={idx.x + 57} y="48" textAnchor="middle" fill={idx.c} fontSize="10" fontWeight="600">{idx.n}</text><text x={idx.x + 57} y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">{idx.d}</text><text x={idx.x + 57} y="82" textAnchor="middle" fill="#71717a" fontSize="6">{idx.u}</text><rect x={idx.x + 15} y="88" width="85" height="10" rx="2" fill={`${idx.c}30`} /></g>
        ))}
        <rect x="10" y="115" width="480" height="35" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="135" textAnchor="middle" fill="#fafafa" fontSize="8">Trade-off: Faster reads ↔ Slower writes (index maintenance) + Storage overhead</text>
        <text x="250" y="148" textAnchor="middle" fill="#71717a" fontSize="7">Tip: Only index columns used in WHERE, JOIN, ORDER BY</text>
      </svg>
    ),
    connpool: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">PgBouncer: Reuse connections, reduce overhead</text>
        <rect x="15" y="35" width="120" height="80" rx="6" fill={`${color}20`} stroke={color} strokeWidth="1.5" />
        <text x="75" y="55" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">App Servers</text>
        {[0, 1, 2, 3].map(i => <rect key={i} x={25 + (i % 2) * 55} y={62 + Math.floor(i / 2) * 25} width="45" height="20" rx="3" fill={`${color}30`} />)}
        <rect x="190" y="35" width="120" height="80" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" />
        <text x="250" y="55" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">Connection Pool</text>
        <text x="250" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Max: 100 conns</text>
        {[0, 1, 2].map(i => <rect key={i} x={205 + i * 35} y="82" width="28" height="22" rx="3" fill="#fb923c30" stroke="#fb923c" />)}
        <rect x="365" y="45" width="110" height="60" rx="6" fill="#f472b620" stroke="#f472b6" strokeWidth="1.5" />
        <text x="420" y="70" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="600">💾 Database</text>
        <text x="420" y="88" textAnchor="middle" fill="#71717a" fontSize="7">max_conn=100</text>
        <path d="M140 75 L185 75" stroke="#71717a" strokeWidth="1.5" /><path d="M315 75 L360 75" stroke="#71717a" strokeWidth="1.5" />
        <rect x="15" y="125" width="225" height="20" rx="4" fill="rgba(74,222,128,0.1)" stroke="#4ade80" /><text x="127" y="139" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Reuse conns, reduce latency</text>
        <rect x="260" y="125" width="225" height="20" rx="4" fill="rgba(248,113,113,0.1)" stroke="#f87171" /><text x="372" y="139" textAnchor="middle" fill="#f87171" fontSize="7">Without: New conn per request (~50ms)</text>
      </svg>
    ),
    bloom: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Bloom Filter: Probabilistic set membership</text>
        <rect x="15" y="35" width="100" height="45" rx="6" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="65" y="55" textAnchor="middle" fill="#fafafa" fontSize="9">Input: "key"</text><text x="65" y="70" textAnchor="middle" fill="#71717a" fontSize="7">h1, h2, h3</text>
        <rect x="150" y="30" width="200" height="55" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="2" />
        <text x="250" y="48" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Bit Array</text>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <rect key={i} x={160 + i * 18} y="55" width="15" height="20" rx="2" fill={[2, 5, 8].includes(i) ? '#4ade80' : 'rgba(255,255,255,0.1)'} stroke="#52525b" />)}
        <rect x="385" y="35" width="100" height="45" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="435" y="55" textAnchor="middle" fill="#4ade80" fontSize="9">Result:</text><text x="435" y="70" textAnchor="middle" fill="#fafafa" fontSize="7">"Maybe" / "No"</text>
        <path d="M120 57 L145 57" stroke="#71717a" strokeWidth="1.5" /><path d="M355 57 L380 57" stroke="#71717a" strokeWidth="1.5" />
        <rect x="15" y="100" width="225" height="50" rx="5" fill="rgba(74,222,128,0.08)" stroke="#4ade80" />
        <text x="127" y="118" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="500">✓ Advantages</text>
        <text x="30" y="135" fill="#a1a1aa" fontSize="7">• O(1) lookup, tiny memory</text>
        <text x="30" y="147" fill="#a1a1aa" fontSize="7">• No false negatives</text>
        <rect x="260" y="100" width="225" height="50" rx="5" fill="rgba(248,113,113,0.08)" stroke="#f87171" />
        <text x="372" y="118" textAnchor="middle" fill="#f87171" fontSize="8" fontWeight="500">⚠️ Trade-offs</text>
        <text x="275" y="135" fill="#a1a1aa" fontSize="7">• False positives possible</text>
        <text x="275" y="147" fill="#a1a1aa" fontSize="7">• Can't delete elements</text>
      </svg>
    ),
    dlq: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Dead Letter Queue: Handle failed messages</text>
        <rect x="15" y="40" width="80" height="40" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="65" textAnchor="middle" fill="#fafafa" fontSize="8">📤 Producer</text>
        <rect x="120" y="35" width="120" height="50" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="180" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">📬 Main Queue</text><text x="180" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Process messages</text>
        <rect x="270" y="35" width="80" height="50" rx="5" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="1.5" /><text x="310" y="58" textAnchor="middle" fill="#60a5fa" fontSize="8">👷 Worker</text><text x="310" y="73" textAnchor="middle" fill="#71717a" fontSize="6">Retry 3x</text>
        <rect x="380" y="35" width="100" height="50" rx="6" fill="#f8717130" stroke="#f87171" strokeWidth="2" /><text x="430" y="55" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="600">💀 DLQ</text><text x="430" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Failed msgs</text>
        <path d="M100 60 L115 60" stroke="#71717a" strokeWidth="1.5" /><path d="M245 60 L265 60" stroke="#4ade80" strokeWidth="1.5" /><path d="M355 60 L375 60" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4,4" />
        <text x="365" y="48" fill="#f87171" fontSize="6">fail</text>
        <rect x="15" y="100" width="470" height="40" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="118" textAnchor="middle" fill="#fafafa" fontSize="8">Use: Poison messages, parsing errors, downstream failures</text>
        <text x="250" y="133" textAnchor="middle" fill="#71717a" fontSize="7">Action: Alert → Investigate → Fix → Replay or discard</text>
      </svg>
    ),
    servicemesh: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Istio/Envoy: Sidecar proxy for service communication</text>
        {[{ x: 30, n: 'Service A' }, { x: 200, n: 'Service B' }, { x: 370, n: 'Service C' }].map((svc, i) => (
          <g key={i}>
            <rect x={svc.x} y="35" width="100" height="70" rx="6" fill={`${color}20`} stroke={color} strokeWidth="1.5" />
            <text x={svc.x + 50} y="55" textAnchor="middle" fill="#fafafa" fontSize="9">{svc.n}</text>
            <rect x={svc.x + 10} y="65" width="80" height="30" rx="4" fill="#a78bfa30" stroke="#a78bfa" />
            <text x={svc.x + 50} y="85" textAnchor="middle" fill="#a78bfa" fontSize="7">🛡️ Sidecar</text>
          </g>
        ))}
        <path d="M135 80 L195 80" stroke="#a78bfa" strokeWidth="2" /><path d="M305 80 L365 80" stroke="#a78bfa" strokeWidth="2" />
        <rect x="140" y="115" width="220" height="35" rx="5" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" />
        <text x="250" y="130" textAnchor="middle" fill="#a78bfa" fontSize="8" fontWeight="500">Sidecar handles:</text>
        <text x="250" y="143" textAnchor="middle" fill="#a1a1aa" fontSize="7">mTLS • Load balancing • Retries • Circuit breaking • Tracing</text>
      </svg>
    ),
    eventdriven: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Event-Driven Architecture: Loosely coupled services</text>
        <rect x="15" y="40" width="90" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="60" y="60" textAnchor="middle" fill="#fafafa" fontSize="8">Order Svc</text><text x="60" y="75" textAnchor="middle" fill="#71717a" fontSize="6">publish event</text>
        <rect x="155" y="30" width="190" height="65" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" />
        <text x="250" y="52" textAnchor="middle" fill="#fb923c" fontSize="10" fontWeight="600">Event Bus / Kafka</text>
        <text x="250" y="70" textAnchor="middle" fill="#71717a" fontSize="7">"OrderCreated" event</text>
        <text x="250" y="85" textAnchor="middle" fill="#71717a" fontSize="6">{`{ orderId, userId, items }`}</text>
        <rect x="395" y="28" width="90" height="30" rx="4" fill="#4ade8020" stroke="#4ade80" /><text x="440" y="47" textAnchor="middle" fill="#4ade80" fontSize="7">Email Svc</text>
        <rect x="395" y="63" width="90" height="30" rx="4" fill="#a78bfa20" stroke="#a78bfa" /><text x="440" y="82" textAnchor="middle" fill="#a78bfa" fontSize="7">Inventory Svc</text>
        <path d="M110 62 L150 62" stroke="#71717a" strokeWidth="1.5" /><path d="M350 43 L390 43" stroke="#71717a" strokeWidth="1" /><path d="M350 78 L390 78" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="110" width="470" height="30" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="130" textAnchor="middle" fill="#a1a1aa" fontSize="8">✓ Decoupled services • ✓ Scale independently • ✓ Easy to add consumers</text>
      </svg>
    ),
    sso: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">SSO: One login for multiple applications</text>
        <rect x="200" y="30" width="100" height="45" rx="6" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="2" /><text x="250" y="50" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600">🔐 IdP</text><text x="250" y="65" textAnchor="middle" fill="#71717a" fontSize="7">Okta/Auth0</text>
        <rect x="15" y="95" width="70" height="40" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="50" y="120" textAnchor="middle" fill="#fafafa" fontSize="8">App 1</text>
        <rect x="110" y="95" width="70" height="40" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="145" y="120" textAnchor="middle" fill="#fafafa" fontSize="8">App 2</text>
        <rect x="215" y="95" width="70" height="40" rx="5" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="250" y="120" textAnchor="middle" fill="#fafafa" fontSize="8">App 3</text>
        <rect x="320" y="95" width="70" height="40" rx="5" fill="#f472b620" stroke="#f472b6" strokeWidth="1.5" /><text x="355" y="120" textAnchor="middle" fill="#fafafa" fontSize="8">App N</text>
        <path d="M50 90 L200 78" stroke="#fbbf24" strokeWidth="1.5" /><path d="M145 90 L220 78" stroke="#fbbf24" strokeWidth="1.5" /><path d="M250 80 L250 90" stroke="#fbbf24" strokeWidth="1.5" /><path d="M355 90 L300 78" stroke="#fbbf24" strokeWidth="1.5" />
        <rect x="410" y="45" width="75" height="90" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="447" y="65" textAnchor="middle" fill="#fafafa" fontSize="7" fontWeight="500">Protocols</text>
        <text x="447" y="82" textAnchor="middle" fill="#4ade80" fontSize="6">SAML</text>
        <text x="447" y="97" textAnchor="middle" fill="#60a5fa" fontSize="6">OIDC</text>
        <text x="447" y="112" textAnchor="middle" fill="#a78bfa" fontSize="6">OAuth 2.0</text>
        <text x="447" y="127" textAnchor="middle" fill="#fb923c" fontSize="6">LDAP</text>
      </svg>
    ),
    distlock: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Redis/ZooKeeper: Coordinate across nodes</text>
        {[{ x: 30, n: 'Node 1', s: '🔒' }, { x: 180, n: 'Node 2', s: '⏳' }, { x: 330, n: 'Node 3', s: '⏳' }].map((node, i) => (
          <g key={i}>
            <rect x={node.x} y="35" width="120" height="50" rx="6" fill={i === 0 ? '#4ade8020' : 'rgba(255,255,255,0.02)'} stroke={i === 0 ? '#4ade80' : '#52525b'} strokeWidth={i === 0 ? 2 : 1} />
            <text x={node.x + 60} y="55" textAnchor="middle" fill={i === 0 ? '#4ade80' : '#71717a'} fontSize="9">{node.n}</text>
            <text x={node.x + 60} y="75" textAnchor="middle" fill="#fafafa" fontSize="12">{node.s}</text>
          </g>
        ))}
        <rect x="150" y="100" width="200" height="40" rx="6" fill="#f8717120" stroke="#f87171" strokeWidth="2" />
        <text x="250" y="118" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="600">🗄️ Lock Store (Redis)</text>
        <text x="250" y="133" textAnchor="middle" fill="#71717a" fontSize="7">SET lock:resource NX PX 30000</text>
        <path d="M90 90 L180 100" stroke="#4ade80" strokeWidth="1.5" /><path d="M240 90 L230 100" stroke="#52525b" strokeWidth="1" strokeDasharray="3,3" /><path d="M390 90 L320 100" stroke="#52525b" strokeWidth="1" strokeDasharray="3,3" />
      </svg>
    ),
    leaderelect: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">ZooKeeper/etcd: Single coordinator selection</text>
        <circle cx="250" cy="85" r="55" fill="none" stroke="#3f3f46" strokeWidth="2" strokeDasharray="5,5" />
        <text x="250" y="88" textAnchor="middle" fill="#52525b" fontSize="7">Cluster</text>
        {[0, 120, 240].map((angle, i) => {
          const rad = (angle - 90) * Math.PI / 180;
          const x = 250 + 55 * Math.cos(rad);
          const y = 85 + 55 * Math.sin(rad);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="22" fill={i === 0 ? '#fbbf2430' : '#60a5fa20'} stroke={i === 0 ? '#fbbf24' : '#60a5fa'} strokeWidth="2" />
              <text x={x} y={y - 5} textAnchor="middle" fill={i === 0 ? '#fbbf24' : '#60a5fa'} fontSize="10">{i === 0 ? '👑' : '👤'}</text>
              <text x={x} y={y + 10} textAnchor="middle" fill="#fafafa" fontSize="6">{i === 0 ? 'Leader' : 'Follower'}</text>
            </g>
          );
        })}
        <rect x="380" y="45" width="105" height="80" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="432" y="65" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Use cases</text>
        <text x="432" y="82" textAnchor="middle" fill="#a1a1aa" fontSize="7">• Cron jobs</text>
        <text x="432" y="97" textAnchor="middle" fill="#a1a1aa" fontSize="7">• DB writes</text>
        <text x="432" y="112" textAnchor="middle" fill="#a1a1aa" fontSize="7">• Coordination</text>
      </svg>
    ),
    twophase: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">2PC: Atomic distributed transactions</text>
        <rect x="200" y="30" width="100" height="35" rx="5" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="2" /><text x="250" y="52" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">Coordinator</text>
        <rect x="30" y="95" width="90" height="50" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="75" y="115" textAnchor="middle" fill="#fafafa" fontSize="8">DB 1</text><text x="75" y="130" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Ready</text>
        <rect x="205" y="95" width="90" height="50" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="250" y="115" textAnchor="middle" fill="#fafafa" fontSize="8">DB 2</text><text x="250" y="130" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Ready</text>
        <rect x="380" y="95" width="90" height="50" rx="5" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="425" y="115" textAnchor="middle" fill="#fafafa" fontSize="8">DB 3</text><text x="425" y="130" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Ready</text>
        <path d="M200 47 L125 95" stroke="#fbbf24" strokeWidth="1.5" /><text x="150" y="68" fill="#fbbf24" fontSize="6">1. Prepare</text>
        <path d="M250 70 L250 90" stroke="#fbbf24" strokeWidth="1.5" />
        <path d="M300 47 L375 95" stroke="#fbbf24" strokeWidth="1.5" />
        <path d="M125 90 L200 60" stroke="#4ade80" strokeWidth="1" strokeDasharray="3,3" /><text x="150" y="82" fill="#4ade80" fontSize="6">vote</text>
        <rect x="145" y="75" width="210" height="15" rx="3" fill="rgba(74,222,128,0.1)" stroke="#4ade80" /><text x="250" y="86" textAnchor="middle" fill="#4ade80" fontSize="7">2. All voted YES → COMMIT</text>
      </svg>
    ),
    versioning: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Stripe: API versioning strategies</text>
        {[{ x: 10, n: 'URL Path', c: '#4ade80', ex: '/api/v1/users', p: 'Clear, cacheable', cn: 'Breaks URLs' }, { x: 175, n: 'Header', c: '#60a5fa', ex: 'Api-Version: 2', p: 'Clean URLs', cn: 'Less visible' }, { x: 340, n: 'Query', c: '#a78bfa', ex: '?version=1', p: 'Easy testing', cn: 'Cache issues' }].map((v, i) => (
          <g key={i}>
            <rect x={v.x} y="30" width="150" height="100" rx="6" fill={`${v.c}15`} stroke={v.c} strokeWidth="1.5" />
            <text x={v.x + 75} y="50" textAnchor="middle" fill={v.c} fontSize="10" fontWeight="600">{v.n}</text>
            <rect x={v.x + 10} y="58" width="130" height="20" rx="3" fill="rgba(0,0,0,0.3)" />
            <text x={v.x + 75} y="72" textAnchor="middle" fill="#fafafa" fontSize="7" fontFamily="monospace">{v.ex}</text>
            <text x={v.x + 75} y="95" textAnchor="middle" fill="#4ade80" fontSize="7">✓ {v.p}</text>
            <text x={v.x + 75} y="115" textAnchor="middle" fill="#f87171" fontSize="7">✗ {v.cn}</text>
          </g>
        ))}
        <text x="250" y="145" textAnchor="middle" fill="#71717a" fontSize="8">Stripe uses: Header-based with date versions (2023-10-16)</text>
      </svg>
    ),
    webhooks: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">GitHub: Push-based event notifications</text>
        <rect x="15" y="40" width="120" height="60" rx="6" fill={`${color}20`} stroke={color} strokeWidth="2" /><text x="75" y="62" textAnchor="middle" fill="#fafafa" fontSize="10" fontWeight="600">🏢 Provider</text><text x="75" y="80" textAnchor="middle" fill="#71717a" fontSize="7">Event occurs</text><text x="75" y="92" textAnchor="middle" fill="#71717a" fontSize="6">(push, PR, etc)</text>
        <rect x="190" y="45" width="120" height="50" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" />
        <text x="250" y="67" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">HTTP POST</text>
        <text x="250" y="82" textAnchor="middle" fill="#71717a" fontSize="6">{`{ event, payload }`}</text>
        <rect x="365" y="40" width="120" height="60" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" /><text x="425" y="62" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">🎯 Your App</text><text x="425" y="80" textAnchor="middle" fill="#71717a" fontSize="7">Webhook endpoint</text><text x="425" y="92" textAnchor="middle" fill="#71717a" fontSize="6">/webhooks/github</text>
        <path d="M140 70 L185 70" stroke="#fb923c" strokeWidth="2" /><path d="M315 70 L360 70" stroke="#fb923c" strokeWidth="2" />
        <rect x="15" y="115" width="470" height="25" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="132" textAnchor="middle" fill="#a1a1aa" fontSize="8">Best practices: Verify signature • Respond 2xx quickly • Process async • Retry logic</text>
      </svg>
    ),
    canary: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Google: Gradual rollout to detect issues early</text>
        <rect x="15" y="35" width="100" height="40" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="65" y="60" textAnchor="middle" fill="#fb923c" fontSize="9">⚖️ Load Balancer</text>
        <rect x="150" y="30" width="140" height="50" rx="6" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="2" /><text x="220" y="52" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">v1.0 Stable</text><text x="220" y="68" textAnchor="middle" fill="#4ade80" fontSize="8">95% traffic</text>
        <rect x="310" y="30" width="140" height="50" rx="6" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="2" /><text x="380" y="52" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600">🐤 v2.0 Canary</text><text x="380" y="68" textAnchor="middle" fill="#fb923c" fontSize="8">5% traffic</text>
        <path d="M120 55 L145 55" stroke="#71717a" strokeWidth="1.5" />
        <rect x="15" y="95" width="435" height="35" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="232" y="112" textAnchor="middle" fill="#fafafa" fontSize="8">Rollout: 5% → 25% → 50% → 100% (if metrics healthy)</text>
        <text x="232" y="125" textAnchor="middle" fill="#71717a" fontSize="7">Monitor: Error rate, latency, CPU | Rollback instantly if issues</text>
      </svg>
    ),
    featureflags: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">LaunchDarkly: Toggle features without deploy</text>
        <rect x="15" y="35" width="140" height="60" rx="6" fill={`${color}20`} stroke={color} strokeWidth="1.5" />
        <text x="85" y="55" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Application Code</text>
        <text x="85" y="75" textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="monospace">if (flag.enabled)</text>
        <text x="85" y="88" textAnchor="middle" fill="#71717a" fontSize="6" fontFamily="monospace">{`{ newFeature() }`}</text>
        <rect x="190" y="35" width="120" height="60" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="2" />
        <text x="250" y="55" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">🚩 Flag Service</text>
        <text x="250" y="75" textAnchor="middle" fill="#71717a" fontSize="7">Real-time config</text>
        <text x="250" y="88" textAnchor="middle" fill="#71717a" fontSize="6">SDK + streaming</text>
        <rect x="345" y="35" width="140" height="60" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" />
        <text x="415" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Dashboard</text>
        <text x="415" y="75" textAnchor="middle" fill="#71717a" fontSize="7">Toggle ON/OFF</text>
        <text x="415" y="88" textAnchor="middle" fill="#71717a" fontSize="6">% rollout, targeting</text>
        <path d="M160 65 L185 65" stroke="#71717a" strokeWidth="1.5" /><path d="M315 65 L340 65" stroke="#71717a" strokeWidth="1.5" />
        <rect x="15" y="110" width="470" height="30" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="130" textAnchor="middle" fill="#a1a1aa" fontSize="8">Use: A/B testing • Kill switch • Beta access • Gradual rollout • Ops toggles</text>
      </svg>
    ),
    observability: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Three Pillars of Observability</text>
        {[{ x: 15, n: 'Logs', c: '#4ade80', i: '📝', d: 'Events', ex: 'ELK, Loki' }, { x: 180, n: 'Metrics', c: '#60a5fa', i: '📊', d: 'Numbers', ex: 'Prometheus' }, { x: 345, n: 'Traces', c: '#a78bfa', i: '🔍', d: 'Request flow', ex: 'Jaeger' }].map((p, i) => (
          <g key={i}>
            <rect x={p.x} y="30" width="140" height="75" rx="6" fill={`${p.c}15`} stroke={p.c} strokeWidth="2" />
            <text x={p.x + 70} y="52" textAnchor="middle" fill={p.c} fontSize="14">{p.i}</text>
            <text x={p.x + 70} y="70" textAnchor="middle" fill={p.c} fontSize="11" fontWeight="600">{p.n}</text>
            <text x={p.x + 70} y="85" textAnchor="middle" fill="#a1a1aa" fontSize="8">{p.d}</text>
            <text x={p.x + 70} y="100" textAnchor="middle" fill="#71717a" fontSize="7">{p.ex}</text>
          </g>
        ))}
        <rect x="15" y="115" width="470" height="28" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="133" textAnchor="middle" fill="#fafafa" fontSize="8">Datadog, Grafana, New Relic: Unified observability platform</text>
      </svg>
    ),
    notification: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Facebook: Multi-channel notifications at scale</text>
        <rect x="15" y="40" width="90" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="60" y="60" textAnchor="middle" fill="#fafafa" fontSize="8">📤 Trigger</text><text x="60" y="75" textAnchor="middle" fill="#71717a" fontSize="6">Event service</text>
        <rect x="135" y="35" width="100" height="55" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" /><text x="185" y="55" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">📨 Queue</text><text x="185" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Priority + Rate</text><text x="185" y="85" textAnchor="middle" fill="#71717a" fontSize="6">limiting</text>
        <rect x="265" y="35" width="100" height="55" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="315" y="55" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">🔀 Router</text><text x="315" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Channel select</text><text x="315" y="85" textAnchor="middle" fill="#71717a" fontSize="6">User prefs</text>
        <rect x="395" y="25" width="90" height="28" rx="4" fill="#4ade8020" stroke="#4ade80" /><text x="440" y="43" textAnchor="middle" fill="#4ade80" fontSize="7">📱 Push (FCM)</text>
        <rect x="395" y="58" width="90" height="28" rx="4" fill="#60a5fa20" stroke="#60a5fa" /><text x="440" y="76" textAnchor="middle" fill="#60a5fa" fontSize="7">📧 Email (SES)</text>
        <rect x="395" y="91" width="90" height="28" rx="4" fill="#f472b620" stroke="#f472b6" /><text x="440" y="109" textAnchor="middle" fill="#f472b6" fontSize="7">📱 SMS (Twilio)</text>
        <path d="M110 62 L130 62" stroke="#71717a" strokeWidth="1" /><path d="M240 62 L260 62" stroke="#71717a" strokeWidth="1" /><path d="M370 50 L390 39" stroke="#71717a" strokeWidth="1" /><path d="M370 62 L390 72" stroke="#71717a" strokeWidth="1" /><path d="M370 74 L390 105" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="130" width="470" height="22" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="145" textAnchor="middle" fill="#a1a1aa" fontSize="7">Handle: Dedup • Batching • Preferences • Unsubscribe • Analytics</text>
      </svg>
    ),
    search: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Elasticsearch: Inverted index for fast text search</text>
        <rect x="15" y="35" width="120" height="50" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="75" y="55" textAnchor="middle" fill="#fafafa" fontSize="9">📝 Documents</text><text x="75" y="72" textAnchor="middle" fill="#71717a" fontSize="7">"quick brown fox"</text>
        <rect x="170" y="35" width="160" height="50" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" />
        <text x="250" y="52" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">🔄 Indexer</text>
        <text x="250" y="68" textAnchor="middle" fill="#71717a" fontSize="7">Tokenize → Analyze → Index</text>
        <rect x="365" y="35" width="120" height="50" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="425" y="55" textAnchor="middle" fill="#4ade80" fontSize="9">📚 Inverted Index</text><text x="425" y="72" textAnchor="middle" fill="#71717a" fontSize="6">word → [doc1, doc2]</text>
        <path d="M140 60 L165 60" stroke="#71717a" strokeWidth="1.5" /><path d="M335 60 L360 60" stroke="#71717a" strokeWidth="1.5" />
        <rect x="15" y="100" width="225" height="50" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="127" y="118" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Inverted Index</text>
        <text x="30" y="135" fill="#a1a1aa" fontSize="7">"quick" → [doc1, doc3]</text>
        <text x="30" y="147" fill="#a1a1aa" fontSize="7">"brown" → [doc1, doc2]</text>
        <rect x="260" y="100" width="225" height="50" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="372" y="118" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Features</text>
        <text x="275" y="135" fill="#4ade80" fontSize="7">✓ Full-text, fuzzy, faceted</text>
        <text x="275" y="147" fill="#4ade80" fontSize="7">✓ Relevance scoring (TF-IDF)</text>
      </svg>
    ),
    payment: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Stripe: Idempotent transactions & double-entry ledger</text>
        <rect x="15" y="35" width="80" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="55" textAnchor="middle" fill="#fafafa" fontSize="8">💳 Client</text><text x="55" y="70" textAnchor="middle" fill="#71717a" fontSize="6">checkout</text>
        <rect x="120" y="30" width="110" height="55" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" /><text x="175" y="50" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">Payment API</text><text x="175" y="67" textAnchor="middle" fill="#71717a" fontSize="6">Idempotency key</text><text x="175" y="80" textAnchor="middle" fill="#71717a" fontSize="5">Fraud detection</text>
        <rect x="255" y="30" width="110" height="55" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="310" y="50" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Gateway</text><text x="310" y="67" textAnchor="middle" fill="#71717a" fontSize="6">Stripe/Adyen</text><text x="310" y="80" textAnchor="middle" fill="#71717a" fontSize="5">PSP routing</text>
        <rect x="390" y="30" width="95" height="55" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="437" y="50" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Bank</text><text x="437" y="67" textAnchor="middle" fill="#71717a" fontSize="6">Visa/MC</text><text x="437" y="80" textAnchor="middle" fill="#71717a" fontSize="5">Auth + Capture</text>
        <path d="M100 57 L115 57" stroke="#71717a" strokeWidth="1" /><path d="M235 57 L250 57" stroke="#71717a" strokeWidth="1" /><path d="M370 57 L385 57" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="100" width="225" height="50" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="127" y="118" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Double-Entry Ledger</text>
        <text x="30" y="135" fill="#a1a1aa" fontSize="7">Debit: User wallet -$100</text>
        <text x="30" y="147" fill="#a1a1aa" fontSize="7">Credit: Merchant +$100</text>
        <rect x="260" y="100" width="225" height="50" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="372" y="118" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Key Patterns</text>
        <text x="275" y="135" fill="#4ade80" fontSize="7">✓ Idempotency (retry safe)</text>
        <text x="275" y="147" fill="#4ade80" fontSize="7">✓ Async webhooks + polling</text>
      </svg>
    ),
    ecommerce: (
      <svg viewBox="0 0 500 170" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Amazon: E-commerce architecture at scale</text>
        <rect x="15" y="35" width="70" height="40" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="50" y="60" textAnchor="middle" fill="#fafafa" fontSize="8">🛒 Cart</text>
        <rect x="100" y="35" width="70" height="40" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="135" y="60" textAnchor="middle" fill="#4ade80" fontSize="8">📦 Inventory</text>
        <rect x="185" y="35" width="70" height="40" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="220" y="60" textAnchor="middle" fill="#fb923c" fontSize="8">💳 Payment</text>
        <rect x="270" y="35" width="70" height="40" rx="5" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="305" y="60" textAnchor="middle" fill="#a78bfa" fontSize="8">📧 Notify</text>
        <rect x="355" y="35" width="70" height="40" rx="5" fill="#f472b620" stroke="#f472b6" strokeWidth="1.5" /><text x="390" y="60" textAnchor="middle" fill="#f472b6" fontSize="8">🚚 Shipping</text>
        <rect x="440" y="35" width="45" height="40" rx="5" fill="#22d3ee20" stroke="#22d3ee" strokeWidth="1.5" /><text x="462" y="60" textAnchor="middle" fill="#22d3ee" fontSize="7">📊</text>
        <rect x="15" y="90" width="470" height="70" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="110" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="500">Key Challenges</text>
        <text x="30" y="130" fill="#4ade80" fontSize="7">✓ Inventory: Pessimistic locking for hot items</text>
        <text x="30" y="145" fill="#4ade80" fontSize="7">✓ Cart: Session storage (Redis) + DB persistence</text>
        <text x="270" y="130" fill="#4ade80" fontSize="7">✓ Checkout: Saga for distributed tx</text>
        <text x="270" y="145" fill="#4ade80" fontSize="7">✓ Flash sales: Queue + rate limiting</text>
      </svg>
    ),
    filestorage: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Dropbox: Chunked uploads, dedup, sync</text>
        <rect x="15" y="40" width="80" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="60" textAnchor="middle" fill="#fafafa" fontSize="8">📱 Client</text><text x="55" y="75" textAnchor="middle" fill="#71717a" fontSize="6">Sync agent</text>
        <rect x="120" y="35" width="100" height="55" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" /><text x="170" y="55" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">Metadata</text><text x="170" y="72" textAnchor="middle" fill="#71717a" fontSize="7">File info, chunks</text><text x="170" y="85" textAnchor="middle" fill="#71717a" fontSize="6">MySQL + Redis</text>
        <rect x="245" y="35" width="100" height="55" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" /><text x="295" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Block Store</text><text x="295" y="72" textAnchor="middle" fill="#71717a" fontSize="7">4MB chunks</text><text x="295" y="85" textAnchor="middle" fill="#71717a" fontSize="6">S3 / GCS</text>
        <rect x="370" y="35" width="115" height="55" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="427" y="55" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Notification</text><text x="427" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Long polling</text><text x="427" y="85" textAnchor="middle" fill="#71717a" fontSize="6">Sync changes</text>
        <path d="M100 62 L115 62" stroke="#71717a" strokeWidth="1" /><path d="M225 62 L240 62" stroke="#71717a" strokeWidth="1" /><path d="M350 62 L365 62" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="105" width="470" height="45" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="125" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Deduplication: Hash chunks → store once → reference many</text>
        <text x="250" y="142" textAnchor="middle" fill="#71717a" fontSize="7">Delta sync: Only upload changed chunks (rsync algorithm)</text>
      </svg>
    ),
    ticketing: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Ticketmaster: Handle 10M+ users for hot events</text>
        <rect x="15" y="40" width="80" height="40" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="65" textAnchor="middle" fill="#fafafa" fontSize="8">👥 Users</text>
        <rect x="120" y="35" width="90" height="50" rx="6" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="2" /><text x="165" y="55" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">🚦 Queue</text><text x="165" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Virtual waiting</text>
        <rect x="235" y="35" width="90" height="50" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" /><text x="280" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">🔒 Hold</text><text x="280" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Temp reserve</text>
        <rect x="350" y="35" width="65" height="50" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="382" y="55" textAnchor="middle" fill="#fb923c" fontSize="8">💳 Pay</text><text x="382" y="70" textAnchor="middle" fill="#71717a" fontSize="6">5 min</text>
        <rect x="440" y="35" width="45" height="50" rx="5" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="462" y="65" textAnchor="middle" fill="#a78bfa" fontSize="8">🎫</text>
        <path d="M100 60 L115 60" stroke="#71717a" strokeWidth="1" /><path d="M215 60 L230 60" stroke="#71717a" strokeWidth="1" /><path d="M330 60 L345 60" stroke="#71717a" strokeWidth="1" /><path d="M420 60 L435 60" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="100" width="470" height="50" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="120" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Key Patterns</text>
        <text x="30" y="138" fill="#4ade80" fontSize="7">✓ Virtual queue (fairness)</text>
        <text x="180" y="138" fill="#4ade80" fontSize="7">✓ Inventory hold + TTL</text>
        <text x="350" y="138" fill="#4ade80" fontSize="7">✓ Optimistic locking</text>
      </svg>
    ),
    retry: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Exponential Backoff with Jitter</text>
        <rect x="15" y="35" width="80" height="40" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="60" textAnchor="middle" fill="#fafafa" fontSize="8">📤 Request</text>
        {[1, 2, 3, 4].map((n, i) => (
          <g key={i}>
            <rect x={120 + i * 90} y="35" width="75" height="40" rx="5" fill={i === 3 ? '#4ade8020' : '#f8717120'} stroke={i === 3 ? '#4ade80' : '#f87171'} strokeWidth="1.5" />
            <text x={157 + i * 90} y="52" textAnchor="middle" fill={i === 3 ? '#4ade80' : '#f87171'} fontSize="8">{i === 3 ? '✓ Success' : `❌ Fail ${n}`}</text>
            <text x={157 + i * 90} y="67" textAnchor="middle" fill="#71717a" fontSize="6">{i === 3 ? '' : `Wait ${Math.pow(2, i)}s`}</text>
          </g>
        ))}
        <rect x="15" y="90" width="470" height="40" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="107" textAnchor="middle" fill="#fafafa" fontSize="8" fontFamily="monospace">delay = min(base * 2^attempt + random_jitter, max_delay)</text>
        <text x="250" y="122" textAnchor="middle" fill="#71717a" fontSize="7">Jitter prevents thundering herd • Max retries: 3-5 • Circuit breaker if persistent</text>
      </svg>
    ),
    bulkhead: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Bulkhead: Isolate failures like ship compartments</text>
        <rect x="15" y="35" width="145" height="70" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="87" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Pool A: Orders</text>
        <text x="87" y="72" textAnchor="middle" fill="#71717a" fontSize="7">10 threads</text>
        <rect x="25" y="78" width="125" height="20" rx="3" fill="#4ade8030" /><text x="87" y="92" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Healthy</text>
        <rect x="180" y="35" width="145" height="70" rx="6" fill="#f8717120" stroke="#f87171" strokeWidth="2" />
        <text x="252" y="55" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="600">Pool B: Payments</text>
        <text x="252" y="72" textAnchor="middle" fill="#71717a" fontSize="7">5 threads (exhausted)</text>
        <rect x="190" y="78" width="125" height="20" rx="3" fill="#f8717130" /><text x="252" y="92" textAnchor="middle" fill="#f87171" fontSize="7">❌ Failing</text>
        <rect x="345" y="35" width="140" height="70" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="415" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Pool C: Search</text>
        <text x="415" y="72" textAnchor="middle" fill="#71717a" fontSize="7">8 threads</text>
        <rect x="355" y="78" width="120" height="20" rx="3" fill="#4ade8030" /><text x="415" y="92" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Isolated</text>
        <rect x="15" y="115" width="470" height="25" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="132" textAnchor="middle" fill="#a1a1aa" fontSize="8">Pool B failure doesn't affect A or C → System partially available</text>
      </svg>
    ),
    backpressure: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Backpressure: Slow down producers when consumers overwhelmed</text>
        <rect x="15" y="40" width="100" height="50" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="65" y="62" textAnchor="middle" fill="#fafafa" fontSize="9">📤 Producer</text><text x="65" y="78" textAnchor="middle" fill="#71717a" fontSize="7">1000 msg/s</text>
        <rect x="150" y="35" width="130" height="60" rx="6" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="2" />
        <text x="215" y="55" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">📬 Buffer</text>
        <rect x="160" y="62" width="110" height="15" rx="2" fill="rgba(0,0,0,0.3)" />
        <rect x="162" y="64" width="90" height="11" rx="1" fill="#f87171" /><text x="215" y="88" textAnchor="middle" fill="#f87171" fontSize="7">90% full!</text>
        <rect x="315" y="40" width="100" height="50" rx="5" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="1.5" /><text x="365" y="62" textAnchor="middle" fill="#60a5fa" fontSize="9">📥 Consumer</text><text x="365" y="78" textAnchor="middle" fill="#71717a" fontSize="7">100 msg/s</text>
        <path d="M120 65 L145 65" stroke="#71717a" strokeWidth="1.5" /><path d="M285 65 L310 65" stroke="#71717a" strokeWidth="1.5" />
        <path d="M215 100 C 215 115 65 115 65 95" stroke="#f87171" strokeWidth="2" strokeDasharray="5,5" /><text x="140" y="125" textAnchor="middle" fill="#f87171" fontSize="7">← Signal: Slow down!</text>
        <rect x="430" y="40" width="55" height="50" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="457" y="58" textAnchor="middle" fill="#fafafa" fontSize="7">Actions:</text>
        <text x="457" y="72" textAnchor="middle" fill="#a1a1aa" fontSize="6">Drop</text>
        <text x="457" y="84" textAnchor="middle" fill="#a1a1aa" fontSize="6">Block</text>
      </svg>
    ),
    mapreduce: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Hadoop MapReduce: Distributed batch processing</text>
        <rect x="15" y="35" width="90" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="60" y="55" textAnchor="middle" fill="#fafafa" fontSize="9">📄 Input</text><text x="60" y="70" textAnchor="middle" fill="#71717a" fontSize="6">Split into chunks</text>
        <rect x="130" y="30" width="100" height="55" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" />
        <text x="180" y="50" textAnchor="middle" fill="#fb923c" fontSize="10" fontWeight="600">Map</text>
        <text x="180" y="67" textAnchor="middle" fill="#71717a" fontSize="7">(k,v) → [(k2,v2)]</text>
        <text x="180" y="80" textAnchor="middle" fill="#71717a" fontSize="6">Parallel workers</text>
        <rect x="255" y="30" width="80" height="55" rx="5" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="295" y="50" textAnchor="middle" fill="#a78bfa" fontSize="9">Shuffle</text><text x="295" y="67" textAnchor="middle" fill="#71717a" fontSize="6">Sort & group</text><text x="295" y="80" textAnchor="middle" fill="#71717a" fontSize="6">by key</text>
        <rect x="360" y="30" width="100" height="55" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="410" y="50" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">Reduce</text>
        <text x="410" y="67" textAnchor="middle" fill="#71717a" fontSize="7">(k,[v]) → (k,v3)</text>
        <text x="410" y="80" textAnchor="middle" fill="#71717a" fontSize="6">Aggregate</text>
        <path d="M110 57 L125 57" stroke="#71717a" strokeWidth="1" /><path d="M235 57 L250 57" stroke="#71717a" strokeWidth="1" /><path d="M340 57 L355 57" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="100" width="470" height="50" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="118" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Word Count Example</text>
        <text x="30" y="138" fill="#fb923c" fontSize="7">Map: "hello world" → [(hello,1), (world,1)]</text>
        <text x="280" y="138" fill="#4ade80" fontSize="7">Reduce: (hello,[1,1,1]) → (hello,3)</text>
      </svg>
    ),
    streamproc: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Apache Flink: Real-time stream processing</text>
        <rect x="15" y="40" width="80" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="58" textAnchor="middle" fill="#fafafa" fontSize="8">📡 Source</text><text x="55" y="73" textAnchor="middle" fill="#71717a" fontSize="6">Kafka/Kinesis</text>
        <rect x="120" y="35" width="100" height="55" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" /><text x="170" y="55" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">Transform</text><text x="170" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Filter, Map, Join</text><text x="170" y="85" textAnchor="middle" fill="#71717a" fontSize="6">Windowing</text>
        <rect x="245" y="35" width="100" height="55" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="295" y="55" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Aggregate</text><text x="295" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Count, Sum</text><text x="295" y="85" textAnchor="middle" fill="#71717a" fontSize="6">State mgmt</text>
        <rect x="370" y="40" width="80" height="45" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="410" y="58" textAnchor="middle" fill="#4ade80" fontSize="8">💾 Sink</text><text x="410" y="73" textAnchor="middle" fill="#71717a" fontSize="6">DB/Dashboard</text>
        <path d="M100 62 L115 62" stroke="#71717a" strokeWidth="1.5" /><path d="M225 62 L240 62" stroke="#71717a" strokeWidth="1.5" /><path d="M350 62 L365 62" stroke="#71717a" strokeWidth="1.5" />
        <rect x="15" y="105" width="225" height="35" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="127" y="127" textAnchor="middle" fill="#a1a1aa" fontSize="8">Windowing: Tumbling, Sliding, Session</text>
        <rect x="260" y="105" width="225" height="35" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="372" y="127" textAnchor="middle" fill="#a1a1aa" fontSize="8">Use: Fraud detection, real-time analytics</text>
      </svg>
    ),
    datapipeline: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Apache Airflow: DAG-based workflow orchestration</text>
        {[{ x: 15, n: 'Extract', c: '#60a5fa', i: '📤' }, { x: 130, n: 'Transform', c: '#fb923c', i: '🔄' }, { x: 245, n: 'Load', c: '#4ade80', i: '📥' }, { x: 360, n: 'Validate', c: '#a78bfa', i: '✅' }].map((s, i) => (
          <g key={i}>
            <rect x={s.x} y="35" width="100" height="50" rx="6" fill={`${s.c}20`} stroke={s.c} strokeWidth="1.5" />
            <text x={s.x + 50} y="55" textAnchor="middle" fill={s.c} fontSize="10" fontWeight="600">{s.i} {s.n}</text>
            <text x={s.x + 50} y="72" textAnchor="middle" fill="#71717a" fontSize="7">{['Sources: API, DB', 'Clean, enrich', 'Warehouse/Lake', 'Quality checks'][i]}</text>
            {i < 3 && <path d={`M${s.x + 105} 60 L${s.x + 125} 60`} stroke="#52525b" strokeWidth="1.5" />}
          </g>
        ))}
        <rect x="15" y="100" width="470" height="30" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="120" textAnchor="middle" fill="#a1a1aa" fontSize="8">DAG scheduling • Retries • Dependencies • Monitoring • Backfills</text>
      </svg>
    ),
    multitiercache: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Netflix EVCache: Multi-tier caching strategy</text>
        <rect x="15" y="35" width="80" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="55" textAnchor="middle" fill="#fafafa" fontSize="8">📱 App</text><text x="55" y="70" textAnchor="middle" fill="#71717a" fontSize="6">Request</text>
        <rect x="120" y="30" width="100" height="55" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" /><text x="170" y="50" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">L1 Local</text><text x="170" y="67" textAnchor="middle" fill="#71717a" fontSize="7">In-process</text><text x="170" y="80" textAnchor="middle" fill="#4ade80" fontSize="6">~0.01ms</text>
        <rect x="245" y="30" width="100" height="55" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" /><text x="295" y="50" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">L2 Redis</text><text x="295" y="67" textAnchor="middle" fill="#71717a" fontSize="7">Distributed</text><text x="295" y="80" textAnchor="middle" fill="#fb923c" fontSize="6">~1ms</text>
        <rect x="370" y="30" width="100" height="55" rx="6" fill="#f472b620" stroke="#f472b6" strokeWidth="1.5" /><text x="420" y="50" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="600">L3 Database</text><text x="420" y="67" textAnchor="middle" fill="#71717a" fontSize="7">Source of truth</text><text x="420" y="80" textAnchor="middle" fill="#f472b6" fontSize="6">~10-50ms</text>
        <path d="M100 57 L115 57" stroke="#71717a" strokeWidth="1" /><path d="M225 57 L240 57" stroke="#71717a" strokeWidth="1" strokeDasharray="3,3" /><path d="M350 57 L365 57" stroke="#71717a" strokeWidth="1" strokeDasharray="3,3" />
        <text x="180" y="100" fill="#4ade80" fontSize="7">Hit</text><text x="305" y="100" fill="#fb923c" fontSize="7">Miss→</text><text x="430" y="100" fill="#f472b6" fontSize="7">Miss→</text>
        <rect x="15" y="110" width="470" height="30" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="130" textAnchor="middle" fill="#a1a1aa" fontSize="8">L1: Hot data, small TTL • L2: Shared, invalidation • Write-through or write-behind</text>
      </svg>
    ),
    rbac: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">AWS IAM: Role-Based Access Control</text>
        <rect x="15" y="35" width="90" height="50" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="60" y="55" textAnchor="middle" fill="#fafafa" fontSize="9">👤 Users</text><text x="60" y="72" textAnchor="middle" fill="#71717a" fontSize="6">Alice, Bob</text>
        <rect x="140" y="35" width="90" height="50" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="2" /><text x="185" y="55" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">👥 Roles</text><text x="185" y="72" textAnchor="middle" fill="#71717a" fontSize="6">Admin, Editor</text>
        <rect x="265" y="35" width="90" height="50" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" /><text x="310" y="55" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">📜 Permissions</text><text x="310" y="72" textAnchor="middle" fill="#71717a" fontSize="6">read, write</text>
        <rect x="390" y="35" width="90" height="50" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="435" y="55" textAnchor="middle" fill="#4ade80" fontSize="9">📦 Resources</text><text x="435" y="72" textAnchor="middle" fill="#71717a" fontSize="6">files, APIs</text>
        <path d="M110 60 L135 60" stroke="#71717a" strokeWidth="1.5" /><path d="M235 60 L260 60" stroke="#71717a" strokeWidth="1.5" /><path d="M360 60 L385 60" stroke="#71717a" strokeWidth="1.5" />
        <rect x="15" y="100" width="470" height="40" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="117" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">User → Role → Permission → Resource</text>
        <text x="250" y="133" textAnchor="middle" fill="#71717a" fontSize="7">Principle of least privilege • Audit logs • Regular reviews</text>
      </svg>
    ),
    secrets: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">HashiCorp Vault: Centralized secrets management</text>
        <rect x="15" y="40" width="100" height="50" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="65" y="60" textAnchor="middle" fill="#fafafa" fontSize="8">📱 Application</text><text x="65" y="77" textAnchor="middle" fill="#71717a" fontSize="6">Needs DB creds</text>
        <rect x="150" y="35" width="130" height="60" rx="6" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="2" />
        <text x="215" y="55" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600">🔐 Vault</text>
        <text x="215" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Encrypt at rest</text>
        <text x="215" y="85" textAnchor="middle" fill="#71717a" fontSize="6">Audit logging</text>
        <rect x="315" y="35" width="80" height="30" rx="4" fill="#4ade8020" stroke="#4ade80" /><text x="355" y="55" textAnchor="middle" fill="#4ade80" fontSize="7">🔑 DB Creds</text>
        <rect x="315" y="70" width="80" height="30" rx="4" fill="#60a5fa20" stroke="#60a5fa" /><text x="355" y="90" textAnchor="middle" fill="#60a5fa" fontSize="7">🎫 API Keys</text>
        <rect x="420" y="35" width="65" height="65" rx="5" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="452" y="60" textAnchor="middle" fill="#a78bfa" fontSize="7">Rotation</text><text x="452" y="77" textAnchor="middle" fill="#71717a" fontSize="6">Auto</text><text x="452" y="90" textAnchor="middle" fill="#71717a" fontSize="6">TTL</text>
        <path d="M120 65 L145 65" stroke="#71717a" strokeWidth="1.5" /><path d="M285 55 L310 50" stroke="#71717a" strokeWidth="1" /><path d="M285 80 L310 85" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="110" width="470" height="30" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="130" textAnchor="middle" fill="#a1a1aa" fontSize="8">Never hardcode secrets • Encrypt in transit • Short TTLs • Rotate regularly</text>
      </svg>
    ),
    idempotency: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Stripe: Safe retries with idempotency keys</text>
        <rect x="15" y="40" width="100" height="50" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="65" y="60" textAnchor="middle" fill="#fafafa" fontSize="8">📤 Client</text><text x="65" y="77" textAnchor="middle" fill="#71717a" fontSize="6">Key: abc-123</text>
        {[1, 2, 3].map((n, i) => (
          <g key={i}>
            <rect x={150 + i * 110} y="40" width="95" height="50" rx="5" fill={i === 0 ? '#4ade8020' : '#60a5fa20'} stroke={i === 0 ? '#4ade80' : '#60a5fa'} strokeWidth="1.5" />
            <text x={197 + i * 110} y="60" textAnchor="middle" fill={i === 0 ? '#4ade80' : '#60a5fa'} fontSize="8">{i === 0 ? '1st: Process' : i === 1 ? '2nd: Return' : '3rd: Return'}</text>
            <text x={197 + i * 110} y="77" textAnchor="middle" fill="#71717a" fontSize="6">{i === 0 ? 'Create charge' : 'Cached result'}</text>
          </g>
        ))}
        <path d="M120 65 L145 65" stroke="#71717a" strokeWidth="1.5" />
        <rect x="15" y="105" width="470" height="28" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="123" textAnchor="middle" fill="#a1a1aa" fontSize="8">f(x) = f(f(x)) → Same key → Same result • Store: key → response for 24h</text>
      </svg>
    ),
    healthcheck: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Kubernetes: Liveness & Readiness Probes</text>
        <rect x="15" y="35" width="210" height="75" rx="6" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeWidth="2" />
        <text x="120" y="55" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">💓 Liveness Probe</text>
        <text x="120" y="72" textAnchor="middle" fill="#fafafa" fontSize="8">"Is the app alive?"</text>
        <text x="120" y="88" textAnchor="middle" fill="#71717a" fontSize="7">Fail → Restart container</text>
        <text x="120" y="102" textAnchor="middle" fill="#71717a" fontSize="6">/health/live • TCP • Exec</text>
        <rect x="275" y="35" width="210" height="75" rx="6" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="2" />
        <text x="380" y="55" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">✅ Readiness Probe</text>
        <text x="380" y="72" textAnchor="middle" fill="#fafafa" fontSize="8">"Can it serve traffic?"</text>
        <text x="380" y="88" textAnchor="middle" fill="#71717a" fontSize="7">Fail → Remove from LB</text>
        <text x="380" y="102" textAnchor="middle" fill="#71717a" fontSize="6">/health/ready • Check deps</text>
        <rect x="15" y="118" width="470" height="18" rx="3" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="131" textAnchor="middle" fill="#71717a" fontSize="7">initialDelaySeconds • periodSeconds • failureThreshold • timeoutSeconds</text>
      </svg>
    ),
    graceful: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Netflix: Graceful degradation under load</text>
        <rect x="15" y="35" width="145" height="55" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="87" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">🟢 Normal</text>
        <text x="87" y="72" textAnchor="middle" fill="#fafafa" fontSize="7">Full features</text>
        <text x="87" y="85" textAnchor="middle" fill="#71717a" fontSize="6">Recommendations, reviews</text>
        <rect x="180" y="35" width="145" height="55" rx="6" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="2" />
        <text x="252" y="55" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">🟡 Degraded</text>
        <text x="252" y="72" textAnchor="middle" fill="#fafafa" fontSize="7">Core features only</text>
        <text x="252" y="85" textAnchor="middle" fill="#71717a" fontSize="6">Disable recommendations</text>
        <rect x="345" y="35" width="140" height="55" rx="6" fill="#f8717120" stroke="#f87171" strokeWidth="2" />
        <text x="415" y="55" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="600">🔴 Critical</text>
        <text x="415" y="72" textAnchor="middle" fill="#fafafa" fontSize="7">Static fallbacks</text>
        <text x="415" y="85" textAnchor="middle" fill="#71717a" fontSize="6">Cached content</text>
        <path d="M165 62 L175 62" stroke="#fbbf24" strokeWidth="2" /><path d="M330 62 L340 62" stroke="#f87171" strokeWidth="2" />
        <rect x="15" y="100" width="470" height="30" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="120" textAnchor="middle" fill="#a1a1aa" fontSize="8">Feature flags + Circuit breakers → Shed load progressively → Keep core working</text>
      </svg>
    ),
    moderation: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Facebook: Multi-layer content moderation</text>
        <rect x="15" y="40" width="80" height="40" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="65" textAnchor="middle" fill="#fafafa" fontSize="8">📤 Upload</text>
        <rect x="120" y="35" width="90" height="50" rx="6" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="2" /><text x="165" y="55" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">🤖 AI Filter</text><text x="165" y="72" textAnchor="middle" fill="#71717a" fontSize="6">Image/Text ML</text>
        <rect x="235" y="35" width="90" height="50" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="280" y="55" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">🚦 Queue</text><text x="280" y="72" textAnchor="middle" fill="#71717a" fontSize="6">Uncertain items</text>
        <rect x="350" y="35" width="90" height="50" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="395" y="55" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">👥 Human</text><text x="395" y="72" textAnchor="middle" fill="#71717a" fontSize="6">Review team</text>
        <path d="M100 60 L115 60" stroke="#71717a" strokeWidth="1" /><path d="M215 60 L230 60" stroke="#71717a" strokeWidth="1" /><path d="M330 60 L345 60" stroke="#71717a" strokeWidth="1" />
        <rect x="120" y="90" width="90" height="25" rx="4" fill="#4ade8020" stroke="#4ade80" /><text x="165" y="107" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Auto approve</text>
        <rect x="350" y="90" width="90" height="25" rx="4" fill="#f8717120" stroke="#f87171" /><text x="395" y="107" textAnchor="middle" fill="#f87171" fontSize="7">❌ Remove</text>
        <path d="M165 90 L165 85" stroke="#4ade80" strokeWidth="1" /><path d="M395 90 L395 85" stroke="#f87171" strokeWidth="1" />
        <rect x="15" y="125" width="470" height="20" rx="3" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="139" textAnchor="middle" fill="#71717a" fontSize="7">Appeals process • Confidence thresholds • Continuous ML training</text>
      </svg>
    ),
    tracing: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Jaeger/Zipkin: Distributed request tracing</text>
        <rect x="15" y="35" width="80" height="40" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="60" textAnchor="middle" fill="#fafafa" fontSize="8">📱 Request</text>
        {[{ x: 120, n: 'API GW', t: '5ms' }, { x: 220, n: 'User Svc', t: '12ms' }, { x: 320, n: 'Order Svc', t: '45ms' }, { x: 420, n: 'DB', t: '8ms' }].map((s, i) => (
          <g key={i}>
            <rect x={s.x} y="35" width="80" height="40" rx="5" fill={['#4ade80', '#60a5fa', '#fb923c', '#f472b6'][i] + '20'} stroke={['#4ade80', '#60a5fa', '#fb923c', '#f472b6'][i]} strokeWidth="1.5" />
            <text x={s.x + 40} y="52" textAnchor="middle" fill="#fafafa" fontSize="7">{s.n}</text>
            <text x={s.x + 40} y="67" textAnchor="middle" fill="#71717a" fontSize="6">{s.t}</text>
          </g>
        ))}
        <rect x="15" y="90" width="470" height="50" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="108" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Trace ID: abc-123 spans entire request</text>
        <text x="30" y="128" fill="#4ade80" fontSize="7">├─ Span 1: API GW (5ms)</text>
        <text x="150" y="128" fill="#60a5fa" fontSize="7">├─ Span 2: User (12ms)</text>
        <text x="280" y="128" fill="#fb923c" fontSize="7">├─ Span 3: Order (45ms)</text>
        <text x="410" y="128" fill="#f472b6" fontSize="7">└─ Span 4: DB (8ms)</text>
      </svg>
    ),
    servicedisco: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Consul/Eureka: Dynamic service registration</text>
        <rect x="180" y="30" width="140" height="55" rx="6" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="2" />
        <text x="250" y="52" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600">📋 Registry</text>
        <text x="250" y="70" textAnchor="middle" fill="#71717a" fontSize="7">user-svc: [10.0.0.1, 10.0.0.2]</text>
        {[{ x: 30, n: 'Service A' }, { x: 180, n: 'Service B' }, { x: 330, n: 'Service C' }].map((s, i) => (
          <g key={i}>
            <rect x={s.x} y="100" width="100" height="40" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" />
            <text x={s.x + 50} y="125" textAnchor="middle" fill="#fafafa" fontSize="8">{s.n}</text>
          </g>
        ))}
        <path d="M80 100 L200 90" stroke="#4ade80" strokeWidth="1.5" /><text x="130" y="92" fill="#4ade80" fontSize="6">register</text>
        <path d="M230 100 L230 90" stroke="#60a5fa" strokeWidth="1.5" /><text x="245" y="97" fill="#60a5fa" fontSize="6">heartbeat</text>
        <path d="M380 100 L300 90" stroke="#fb923c" strokeWidth="1.5" /><text x="350" y="92" fill="#fb923c" fontSize="6">discover</text>
      </svg>
    ),
    sidecar: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Sidecar Pattern: Auxiliary container alongside main app</text>
        <rect x="30" y="35" width="200" height="90" rx="8" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" strokeWidth="2" strokeDasharray="5,5" />
        <text x="130" y="52" textAnchor="middle" fill="#52525b" fontSize="8">Pod</text>
        <rect x="45" y="60" width="80" height="55" rx="5" fill={`${color}20`} stroke={color} strokeWidth="2" /><text x="85" y="85" textAnchor="middle" fill="#fafafa" fontSize="9">📦 App</text><text x="85" y="100" textAnchor="middle" fill="#71717a" fontSize="6">Main container</text>
        <rect x="135" y="60" width="80" height="55" rx="5" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="2" /><text x="175" y="85" textAnchor="middle" fill="#a78bfa" fontSize="9">🛡️ Sidecar</text><text x="175" y="100" textAnchor="middle" fill="#71717a" fontSize="6">Envoy proxy</text>
        <rect x="280" y="45" width="200" height="80" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="380" y="65" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Sidecar handles:</text>
        <text x="295" y="85" fill="#4ade80" fontSize="7">✓ Logging, metrics</text>
        <text x="295" y="100" fill="#4ade80" fontSize="7">✓ mTLS, auth</text>
        <text x="395" y="85" fill="#4ade80" fontSize="7">✓ Rate limiting</text>
        <text x="395" y="100" fill="#4ade80" fontSize="7">✓ Circuit breaking</text>
      </svg>
    ),
    strangler: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Strangler Fig: Incremental legacy migration</text>
        <rect x="15" y="40" width="70" height="40" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="50" y="65" textAnchor="middle" fill="#fafafa" fontSize="8">📱 Client</text>
        <rect x="110" y="35" width="90" height="50" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" /><text x="155" y="55" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">🚦 Facade</text><text x="155" y="72" textAnchor="middle" fill="#71717a" fontSize="6">Route by feature</text>
        <rect x="230" y="30" width="120" height="60" rx="6" fill="#f8717120" stroke="#f87171" strokeWidth="2" /><text x="290" y="52" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="600">🏚️ Legacy</text><text x="290" y="68" textAnchor="middle" fill="#71717a" fontSize="7">Monolith (shrinking)</text><text x="290" y="82" textAnchor="middle" fill="#f87171" fontSize="6">40% traffic</text>
        <rect x="370" y="30" width="115" height="60" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" /><text x="427" y="52" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">✨ New</text><text x="427" y="68" textAnchor="middle" fill="#71717a" fontSize="7">Microservices</text><text x="427" y="82" textAnchor="middle" fill="#4ade80" fontSize="6">60% traffic</text>
        <path d="M90 60 L105 60" stroke="#71717a" strokeWidth="1.5" /><path d="M205 50 L225 50" stroke="#f87171" strokeWidth="1.5" /><path d="M205 70 L365 70" stroke="#4ade80" strokeWidth="1.5" />
        <rect x="15" y="105" width="470" height="35" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="127" textAnchor="middle" fill="#a1a1aa" fontSize="8">Migrate feature by feature → Route new traffic → Eventually retire legacy</text>
      </svg>
    ),
    readreplica: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Aurora: Scale reads with replicas</text>
        <rect x="15" y="40" width="80" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="60" textAnchor="middle" fill="#fafafa" fontSize="8">📱 App</text><text x="55" y="75" textAnchor="middle" fill="#71717a" fontSize="6">Read/Write</text>
        <rect x="130" y="35" width="100" height="55" rx="6" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="2" /><text x="180" y="55" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">✏️ Primary</text><text x="180" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Writes only</text><text x="180" y="85" textAnchor="middle" fill="#71717a" fontSize="6">Sync to replicas</text>
        {[0, 1, 2].map(i => (
          <g key={i}>
            <rect x={270 + i * 75} y="35" width="65" height="55" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" />
            <text x={302 + i * 75} y="55" textAnchor="middle" fill="#4ade80" fontSize="8">📖 Read</text>
            <text x={302 + i * 75} y="72" textAnchor="middle" fill="#71717a" fontSize="6">Replica {i + 1}</text>
          </g>
        ))}
        <path d="M100 55 L125 55" stroke="#fbbf24" strokeWidth="1.5" /><text x="112" y="50" fill="#fbbf24" fontSize="6">write</text>
        <path d="M100 70 L265 70" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3,3" /><text x="180" y="98" fill="#4ade80" fontSize="6">reads (load balanced)</text>
        <rect x="15" y="105" width="470" height="25" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="122" textAnchor="middle" fill="#a1a1aa" fontSize="8">Eventual consistency (ms lag) • Auto-failover • Up to 15 replicas (Aurora)</text>
      </svg>
    ),
    wal: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">PostgreSQL WAL: Write-Ahead Logging for durability</text>
        <rect x="15" y="40" width="80" height="40" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="65" textAnchor="middle" fill="#fafafa" fontSize="8">✏️ Write</text>
        <rect x="120" y="35" width="120" height="50" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" /><text x="180" y="55" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">1️⃣ WAL Buffer</text><text x="180" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Log change first</text>
        <rect x="265" y="35" width="100" height="50" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" /><text x="315" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">2️⃣ fsync</text><text x="315" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Flush to disk</text>
        <rect x="390" y="35" width="95" height="50" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="437" y="55" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">3️⃣ Apply</text><text x="437" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Update tables</text>
        <path d="M100 60 L115 60" stroke="#71717a" strokeWidth="1.5" /><path d="M245 60 L260 60" stroke="#71717a" strokeWidth="1.5" /><path d="M370 60 L385 60" stroke="#71717a" strokeWidth="1.5" />
        <rect x="15" y="100" width="470" height="30" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="120" textAnchor="middle" fill="#a1a1aa" fontSize="8">Crash recovery: Replay WAL → Consistent state | Also used for replication</text>
      </svg>
    ),
    timeseries: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">InfluxDB/TimescaleDB: Optimized for time-based data</text>
        <rect x="15" y="35" width="100" height="50" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="65" y="55" textAnchor="middle" fill="#fafafa" fontSize="8">📊 Metrics</text><text x="65" y="70" textAnchor="middle" fill="#71717a" fontSize="6">CPU, memory, etc</text>
        <rect x="140" y="30" width="140" height="60" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="210" y="50" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">⏱️ Time-Series DB</text>
        <text x="210" y="67" textAnchor="middle" fill="#71717a" fontSize="7">timestamp | tags | fields</text>
        <text x="210" y="82" textAnchor="middle" fill="#71717a" fontSize="6">Columnar storage</text>
        <rect x="305" y="30" width="85" height="60" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="347" y="52" textAnchor="middle" fill="#fb923c" fontSize="8">Downsample</text><text x="347" y="68" textAnchor="middle" fill="#71717a" fontSize="6">5min → 1hr</text><text x="347" y="82" textAnchor="middle" fill="#71717a" fontSize="6">aggregates</text>
        <rect x="415" y="30" width="70" height="60" rx="5" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="450" y="55" textAnchor="middle" fill="#a78bfa" fontSize="8">📈 Query</text><text x="450" y="72" textAnchor="middle" fill="#71717a" fontSize="6">Grafana</text>
        <path d="M120 60 L135 60" stroke="#71717a" strokeWidth="1" /><path d="M285 60 L300 60" stroke="#71717a" strokeWidth="1" /><path d="M395 60 L410 60" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="105" width="470" height="35" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="127" textAnchor="middle" fill="#a1a1aa" fontSize="8">Optimizations: Time-based partitioning • Compression • TTL auto-delete • Fast range queries</text>
      </svg>
    ),
    vectorclock: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Vector Clocks: Ordering events in distributed systems</text>
        {[{ x: 30, n: 'Node A', c: '#4ade80' }, { x: 200, n: 'Node B', c: '#60a5fa' }, { x: 370, n: 'Node C', c: '#fb923c' }].map((node, i) => (
          <g key={i}>
            <rect x={node.x} y="35" width="100" height="35" rx="5" fill={node.c + '20'} stroke={node.c} strokeWidth="1.5" />
            <text x={node.x + 50} y="57" textAnchor="middle" fill={node.c} fontSize="9">{node.n}</text>
            <line x1={node.x + 50} y1="75" x2={node.x + 50} y2="130" stroke={node.c} strokeWidth="2" />
            <circle cx={node.x + 50} cy="90" r="8" fill={node.c + '40'} stroke={node.c} />
            <text x={node.x + 50} y="93" textAnchor="middle" fill="#fafafa" fontSize="6">{['[1,0,0]', '[0,1,0]', '[0,0,1]'][i]}</text>
            <circle cx={node.x + 50} cy="120" r="8" fill={node.c + '40'} stroke={node.c} />
            <text x={node.x + 50} y="123" textAnchor="middle" fill="#fafafa" fontSize="6">{['[2,1,0]', '[2,2,0]', '[2,2,1]'][i]}</text>
          </g>
        ))}
        <path d="M88 92 L192 118" stroke="#71717a" strokeWidth="1" strokeDasharray="3,3" />
        <path d="M258 118 L362 120" stroke="#71717a" strokeWidth="1" strokeDasharray="3,3" />
        <text x="250" y="145" textAnchor="middle" fill="#71717a" fontSize="7">Detect conflicts: [2,1,0] vs [1,2,0] = concurrent (neither happened before)</text>
      </svg>
    ),
    gossip: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Gossip Protocol: Peer-to-peer state propagation</text>
        {[{ x: 80, y: 70 }, { x: 180, y: 50 }, { x: 280, y: 90 }, { x: 380, y: 60 }, { x: 130, y: 110 }, { x: 330, y: 110 }].map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="20" fill={i === 0 ? '#4ade8040' : '#60a5fa20'} stroke={i === 0 ? '#4ade80' : '#60a5fa'} strokeWidth="2" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#fafafa" fontSize="8">N{i + 1}</text>
          </g>
        ))}
        <path d="M100 70 L160 55" stroke="#4ade80" strokeWidth="1.5" /><path d="M200 55 L260 85" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="4,4" />
        <path d="M150 105 L260 95" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3,3" /><path d="M300 95 L360 70" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3,3" />
        <rect x="15" y="140" width="220" height="0" rx="0" fill="none" />
        <text x="80" y="145" textAnchor="middle" fill="#4ade80" fontSize="7">Node 1 has update</text>
        <text x="250" y="145" textAnchor="middle" fill="#71717a" fontSize="7">→ Tells random peers → They tell others → Eventually consistent</text>
      </svg>
    ),
    quorum: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Quorum: Majority agreement for consistency</text>
        <rect x="15" y="35" width="80" height="40" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="60" textAnchor="middle" fill="#fafafa" fontSize="8">✏️ Write</text>
        {[0, 1, 2, 3, 4].map(i => (
          <g key={i}>
            <circle cx={140 + i * 70} cy="55" r="22" fill={i < 3 ? '#4ade8030' : '#71717a20'} stroke={i < 3 ? '#4ade80' : '#71717a'} strokeWidth="2" />
            <text x={140 + i * 70} y="52" textAnchor="middle" fill={i < 3 ? '#4ade80' : '#71717a'} fontSize="10">{i < 3 ? '✓' : '...'}</text>
            <text x={140 + i * 70} y="65" textAnchor="middle" fill="#71717a" fontSize="6">R{i + 1}</text>
          </g>
        ))}
        <rect x="15" y="90" width="470" height="40" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="108" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">{'W + R > N ensures overlap → Always read latest write'}</text>
        <text x="250" y="123" textAnchor="middle" fill="#71717a" fontSize="7">N=5, W=3, R=3 → Consistent | N=5, W=1, R=1 → Fast but risky</text>
      </svg>
    ),
    coalescing: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Request Coalescing: Batch identical concurrent requests</text>
        {[0, 1, 2].map(i => (
          <g key={i}>
            <rect x="15" y={35 + i * 30} width="90" height="25" rx="4" fill={`${color}20`} stroke={color} strokeWidth="1" />
            <text x="60" y={52 + i * 30} textAnchor="middle" fill="#fafafa" fontSize="7">GET /user/123</text>
          </g>
        ))}
        <rect x="140" y="45" width="100" height="50" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" />
        <text x="190" y="67" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">🔗 Coalesce</text>
        <text x="190" y="85" textAnchor="middle" fill="#71717a" fontSize="7">Single request</text>
        <rect x="275" y="45" width="90" height="50" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="320" y="67" textAnchor="middle" fill="#4ade80" fontSize="8">📦 Origin</text><text x="320" y="82" textAnchor="middle" fill="#71717a" fontSize="6">1 DB call</text>
        <rect x="400" y="35" width="85" height="70" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="442" y="55" textAnchor="middle" fill="#fafafa" fontSize="7">Response</text>
        <text x="442" y="72" textAnchor="middle" fill="#4ade80" fontSize="6">→ Client 1</text>
        <text x="442" y="85" textAnchor="middle" fill="#4ade80" fontSize="6">→ Client 2</text>
        <text x="442" y="98" textAnchor="middle" fill="#4ade80" fontSize="6">→ Client 3</text>
        <path d="M110 50 L135 65" stroke="#71717a" strokeWidth="1" /><path d="M110 70 L135 70" stroke="#71717a" strokeWidth="1" /><path d="M110 90 L135 75" stroke="#71717a" strokeWidth="1" />
        <path d="M245 70 L270 70" stroke="#71717a" strokeWidth="1.5" /><path d="M370 70 L395 70" stroke="#71717a" strokeWidth="1.5" />
      </svg>
    ),
    cachewarming: (
      <svg viewBox="0 0 500 130" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Cache Warming: Pre-populate before traffic</text>
        <rect x="15" y="35" width="100" height="45" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="65" y="53" textAnchor="middle" fill="#fb923c" fontSize="8">🔥 Warmer Job</text><text x="65" y="68" textAnchor="middle" fill="#71717a" fontSize="6">Pre-deploy task</text>
        <rect x="150" y="35" width="90" height="45" rx="5" fill="#f472b620" stroke="#f472b6" strokeWidth="1.5" /><text x="195" y="53" textAnchor="middle" fill="#f472b6" fontSize="8">💾 Database</text><text x="195" y="68" textAnchor="middle" fill="#71717a" fontSize="6">Hot data</text>
        <rect x="275" y="30" width="100" height="55" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" /><text x="325" y="52" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">⚡ Cache</text><text x="325" y="68" textAnchor="middle" fill="#71717a" fontSize="7">Pre-loaded</text><text x="325" y="82" textAnchor="middle" fill="#4ade80" fontSize="6">Ready for traffic!</text>
        <rect x="410" y="35" width="75" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="447" y="53" textAnchor="middle" fill="#fafafa" fontSize="8">📱 Users</text><text x="447" y="68" textAnchor="middle" fill="#71717a" fontSize="6">Fast response</text>
        <path d="M120 57 L145 57" stroke="#fb923c" strokeWidth="1.5" /><path d="M245 57 L270 57" stroke="#4ade80" strokeWidth="1.5" /><path d="M380 57 L405 57" stroke="#71717a" strokeWidth="1.5" />
        <rect x="15" y="95" width="470" height="25" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="112" textAnchor="middle" fill="#a1a1aa" fontSize="8">Use: After deploy, before launch, scheduled refresh | Prevent cold-start latency spikes</text>
      </svg>
    ),
    federation: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Apollo Federation: Unified GraphQL from multiple services</text>
        <rect x="15" y="40" width="80" height="40" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="65" textAnchor="middle" fill="#fafafa" fontSize="8">📱 Client</text>
        <rect x="130" y="30" width="120" height="60" rx="6" fill="#e879f920" stroke="#e879f9" strokeWidth="2" />
        <text x="190" y="52" textAnchor="middle" fill="#e879f9" fontSize="10" fontWeight="600">🕸️ Gateway</text>
        <text x="190" y="70" textAnchor="middle" fill="#71717a" fontSize="7">Compose schema</text>
        <text x="190" y="82" textAnchor="middle" fill="#71717a" fontSize="6">Query planning</text>
        <rect x="285" y="25" width="85" height="35" rx="4" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="327" y="42" textAnchor="middle" fill="#4ade80" fontSize="7">User Service</text><text x="327" y="55" textAnchor="middle" fill="#71717a" fontSize="5">type User</text>
        <rect x="285" y="65" width="85" height="35" rx="4" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="1.5" /><text x="327" y="82" textAnchor="middle" fill="#60a5fa" fontSize="7">Product Svc</text><text x="327" y="95" textAnchor="middle" fill="#71717a" fontSize="5">type Product</text>
        <rect x="400" y="25" width="85" height="35" rx="4" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="442" y="42" textAnchor="middle" fill="#fb923c" fontSize="7">Order Svc</text><text x="442" y="55" textAnchor="middle" fill="#71717a" fontSize="5">type Order</text>
        <rect x="400" y="65" width="85" height="35" rx="4" fill="#f472b620" stroke="#f472b6" strokeWidth="1.5" /><text x="442" y="82" textAnchor="middle" fill="#f472b6" fontSize="7">Review Svc</text><text x="442" y="95" textAnchor="middle" fill="#71717a" fontSize="5">type Review</text>
        <path d="M100 60 L125 60" stroke="#71717a" strokeWidth="1.5" /><path d="M255 50 L280 42" stroke="#71717a" strokeWidth="1" /><path d="M255 70 L280 82" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="115" width="470" height="25" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="132" textAnchor="middle" fill="#a1a1aa" fontSize="8">Single graph, distributed ownership | @key, @extends for entity resolution</text>
      </svg>
    ),
    ratedesign: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">API Rate Design: Quotas, throttling, tiers</text>
        {[{ x: 15, n: 'Free', c: '#71717a', r: '100/day', q: '1K/mo' }, { x: 140, n: 'Basic', c: '#60a5fa', r: '1K/hr', q: '50K/mo' }, { x: 265, n: 'Pro', c: '#4ade80', r: '10K/hr', q: '500K/mo' }, { x: 390, n: 'Enterprise', c: '#fbbf24', r: 'Custom', q: 'Unlimited' }].map((t, i) => (
          <g key={i}>
            <rect x={t.x} y="30" width="110" height="75" rx="6" fill={t.c + '15'} stroke={t.c} strokeWidth="1.5" />
            <text x={t.x + 55} y="50" textAnchor="middle" fill={t.c} fontSize="10" fontWeight="600">{t.n}</text>
            <text x={t.x + 55} y="68" textAnchor="middle" fill="#fafafa" fontSize="7">Rate: {t.r}</text>
            <text x={t.x + 55} y="83" textAnchor="middle" fill="#71717a" fontSize="6">Quota: {t.q}</text>
            <text x={t.x + 55} y="98" textAnchor="middle" fill="#71717a" fontSize="6">{['No SLA', '99%', '99.9%', '99.99%'][i]}</text>
          </g>
        ))}
        <rect x="15" y="115" width="470" height="20" rx="3" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="129" textAnchor="middle" fill="#71717a" fontSize="7">Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset | 429 Too Many Requests</text>
      </svg>
    ),
    longpolling: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Long Polling: Server holds request until data available</text>
        <rect x="15" y="40" width="90" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="60" y="60" textAnchor="middle" fill="#fafafa" fontSize="8">📱 Client</text><text x="60" y="75" textAnchor="middle" fill="#71717a" fontSize="6">Request & wait</text>
        <rect x="150" y="35" width="200" height="55" rx="6" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="2" />
        <text x="250" y="55" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">🖥️ Server</text>
        <text x="250" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Hold connection open (30-60s)</text>
        <text x="250" y="85" textAnchor="middle" fill="#71717a" fontSize="6">Respond when: data ready OR timeout</text>
        <rect x="395" y="40" width="90" height="45" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="440" y="60" textAnchor="middle" fill="#4ade80" fontSize="8">📦 Data</text><text x="440" y="75" textAnchor="middle" fill="#71717a" fontSize="6">New message!</text>
        <path d="M110 62 L145 62" stroke={color} strokeWidth="1.5" /><text x="127" y="55" fill={color} fontSize="6">1. Poll</text>
        <path d="M355 62 L390 62" stroke="#4ade80" strokeWidth="1.5" /><text x="372" y="55" fill="#4ade80" fontSize="6">2. Event</text>
        <path d="M145 75 L110 75" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="4,4" /><text x="127" y="88" fill="#4ade80" fontSize="6">3. Response</text>
        <rect x="15" y="105" width="470" height="25" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="122" textAnchor="middle" fill="#a1a1aa" fontSize="8">Simpler than WebSocket • Works everywhere • Client immediately re-polls after response</text>
      </svg>
    ),
    sse: (
      <svg viewBox="0 0 500 130" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Server-Sent Events: One-way streaming over HTTP</text>
        <rect x="15" y="40" width="90" height="50" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="60" y="60" textAnchor="middle" fill="#fafafa" fontSize="8">📱 Client</text><text x="60" y="77" textAnchor="middle" fill="#71717a" fontSize="6">EventSource API</text>
        <rect x="150" y="35" width="200" height="60" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="250" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">🖥️ Server</text>
        <text x="250" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Content-Type: text/event-stream</text>
        <text x="250" y="87" textAnchor="middle" fill="#71717a" fontSize="6">data: msg</text>
        <rect x="395" y="40" width="90" height="50" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="440" y="60" textAnchor="middle" fill="#fb923c" fontSize="8">📊 Events</text><text x="440" y="77" textAnchor="middle" fill="#71717a" fontSize="6">Live updates</text>
        <path d="M110 65 L145 65" stroke={color} strokeWidth="1.5" /><text x="127" y="58" fill={color} fontSize="6">subscribe</text>
        <path d="M355 55 L145 55" stroke="#4ade80" strokeWidth="1.5" /><path d="M355 75 L145 75" stroke="#4ade80" strokeWidth="1.5" /><text x="280" y="50" fill="#4ade80" fontSize="6">event 1</text><text x="280" y="85" fill="#4ade80" fontSize="6">event 2...</text>
        <rect x="15" y="105" width="470" height="20" rx="3" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="119" textAnchor="middle" fill="#71717a" fontSize="7">vs WebSocket: Simpler, HTTP-native, auto-reconnect | Use: Feeds, notifications, dashboards</text>
      </svg>
    ),
    iac: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Terraform/Pulumi: Infrastructure as Code</text>
        <rect x="15" y="35" width="120" height="60" rx="6" fill={`${color}20`} stroke={color} strokeWidth="1.5" />
        <text x="75" y="55" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">📝 Code</text>
        <text x="75" y="72" textAnchor="middle" fill="#71717a" fontSize="6" fontFamily="monospace">main.tf</text>
        <text x="75" y="85" textAnchor="middle" fill="#71717a" fontSize="6">Declarative config</text>
        <rect x="170" y="35" width="100" height="60" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="2" /><text x="220" y="55" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">📋 Plan</text><text x="220" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Diff preview</text><text x="220" y="85" textAnchor="middle" fill="#71717a" fontSize="6">+ 3 create</text>
        <rect x="305" y="35" width="80" height="60" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" /><text x="345" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">🚀 Apply</text><text x="345" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Provision</text>
        <rect x="420" y="35" width="65" height="60" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="452" y="55" textAnchor="middle" fill="#fb923c" fontSize="8">☁️ Cloud</text><text x="452" y="72" textAnchor="middle" fill="#71717a" fontSize="6">AWS/GCP</text><text x="452" y="85" textAnchor="middle" fill="#71717a" fontSize="6">Azure</text>
        <path d="M140 65 L165 65" stroke="#71717a" strokeWidth="1.5" /><path d="M275 65 L300 65" stroke="#71717a" strokeWidth="1.5" /><path d="M390 65 L415 65" stroke="#71717a" strokeWidth="1.5" />
        <rect x="15" y="107" width="470" height="25" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="124" textAnchor="middle" fill="#a1a1aa" fontSize="8">Version control • Code review • Reproducible • State management • Drift detection</text>
      </svg>
    ),
    gitops: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">ArgoCD/Flux: Git as single source of truth</text>
        <rect x="15" y="40" width="100" height="55" rx="6" fill={`${color}20`} stroke={color} strokeWidth="1.5" />
        <text x="65" y="60" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">📝 Git Repo</text>
        <text x="65" y="77" textAnchor="middle" fill="#71717a" fontSize="7">manifests/</text>
        <text x="65" y="90" textAnchor="middle" fill="#71717a" fontSize="6">Desired state</text>
        <rect x="150" y="40" width="110" height="55" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="2" />
        <text x="205" y="60" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">🔄 Argo CD</text>
        <text x="205" y="77" textAnchor="middle" fill="#71717a" fontSize="7">Sync controller</text>
        <text x="205" y="90" textAnchor="middle" fill="#71717a" fontSize="6">Detect drift</text>
        <rect x="295" y="40" width="90" height="55" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="340" y="60" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">☸️ K8s</text>
        <text x="340" y="77" textAnchor="middle" fill="#71717a" fontSize="7">Cluster</text>
        <text x="340" y="90" textAnchor="middle" fill="#71717a" fontSize="6">Actual state</text>
        <rect x="420" y="40" width="65" height="55" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="452" y="65" textAnchor="middle" fill="#fb923c" fontSize="8">📱 App</text><text x="452" y="82" textAnchor="middle" fill="#71717a" fontSize="6">Running</text>
        <path d="M120 67 L145 67" stroke="#71717a" strokeWidth="1.5" /><path d="M265 67 L290 67" stroke="#4ade80" strokeWidth="1.5" /><path d="M390 67 L415 67" stroke="#71717a" strokeWidth="1.5" />
        <rect x="15" y="107" width="470" height="25" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="124" textAnchor="middle" fill="#a1a1aa" fontSize="8">PR = deploy approval • Auto-sync • Rollback = git revert • Audit trail built-in</text>
      </svg>
    ),
    chaos: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Netflix Chaos Monkey: Controlled failure testing</text>
        <rect x="15" y="35" width="130" height="60" rx="6" fill="#f8717120" stroke="#f87171" strokeWidth="2" />
        <text x="80" y="55" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="600">🐒 Chaos</text>
        <text x="80" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Random failures</text>
        <text x="80" y="85" textAnchor="middle" fill="#71717a" fontSize="6">Kill instances</text>
        <rect x="180" y="30" width="140" height="70" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" strokeWidth="2" strokeDasharray="5,5" />
        <text x="250" y="50" textAnchor="middle" fill="#52525b" fontSize="8">Production</text>
        {[0, 1, 2].map(i => (
          <rect key={i} x={195 + i * 40} y="58" width="30" height="30" rx="4" fill={i === 1 ? '#f8717140' : '#4ade8020'} stroke={i === 1 ? '#f87171' : '#4ade80'} strokeWidth="1.5" />
        ))}
        <text x="225" y="78" textAnchor="middle" fill="#4ade80" fontSize="8">✓</text>
        <text x="265" y="78" textAnchor="middle" fill="#f87171" fontSize="8">💥</text>
        <text x="305" y="78" textAnchor="middle" fill="#4ade80" fontSize="8">✓</text>
        <rect x="355" y="35" width="130" height="60" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="420" y="55" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">✓ Resilient</text>
        <text x="420" y="72" textAnchor="middle" fill="#71717a" fontSize="7">System survived</text>
        <text x="420" y="85" textAnchor="middle" fill="#71717a" fontSize="6">Auto-recovery</text>
        <path d="M150 65 L175 65" stroke="#f87171" strokeWidth="1.5" /><path d="M325 65 L350 65" stroke="#4ade80" strokeWidth="1.5" />
        <rect x="15" y="107" width="470" height="25" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="124" textAnchor="middle" fill="#a1a1aa" fontSize="8">Types: Latency injection, CPU stress, Network partition | Run in prod during business hours</text>
      </svg>
    ),
    socialgraph: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Facebook: Billion-node social graph</text>
        <rect x="15" y="35" width="80" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="55" textAnchor="middle" fill="#fafafa" fontSize="8">📱 Query</text><text x="55" y="70" textAnchor="middle" fill="#71717a" fontSize="6">"friends of X"</text>
        <rect x="120" y="30" width="120" height="55" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="2" />
        <text x="180" y="50" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">🕸️ Graph DB</text>
        <text x="180" y="67" textAnchor="middle" fill="#71717a" fontSize="7">TAO (FB) / Neo4j</text>
        <text x="180" y="80" textAnchor="middle" fill="#71717a" fontSize="6">Adjacency lists</text>
        <rect x="270" y="30" width="100" height="55" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="320" y="50" textAnchor="middle" fill="#4ade80" fontSize="8">⚡ Cache</text><text x="320" y="67" textAnchor="middle" fill="#71717a" fontSize="6">Edge cache</text><text x="320" y="80" textAnchor="middle" fill="#71717a" fontSize="6">Read-through</text>
        <rect x="400" y="30" width="85" height="55" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="442" y="50" textAnchor="middle" fill="#fb923c" fontSize="8">📊 Shard</text><text x="442" y="67" textAnchor="middle" fill="#71717a" fontSize="6">By user ID</text><text x="442" y="80" textAnchor="middle" fill="#71717a" fontSize="6">1000+ shards</text>
        <path d="M100 57 L115 57" stroke="#71717a" strokeWidth="1" /><path d="M245 57 L265 57" stroke="#71717a" strokeWidth="1" /><path d="M375 57 L395 57" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="100" width="470" height="40" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="118" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Edges: (user1, FRIENDS, user2) | Traverse: 2-hop friends, mutual friends</text>
        <text x="250" y="133" textAnchor="middle" fill="#71717a" fontSize="7">Challenge: High fan-out (avg 338 friends) • Consistency • Real-time updates</text>
      </svg>
    ),
    eventloop: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Node.js: Single-threaded non-blocking I/O</text>
        <circle cx="100" cy="75" r="40" fill="none" stroke="#4ade80" strokeWidth="3" />
        <text x="100" y="72" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Event</text>
        <text x="100" y="85" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Loop</text>
        <path d="M60 55 A45 45 0 0 1 140 55" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="5,3" />
        <rect x="175" y="40" width="100" height="35" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" /><text x="225" y="62" textAnchor="middle" fill="#fb923c" fontSize="8">📋 Callback Queue</text>
        <rect x="175" y="85" width="100" height="35" rx="5" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="1.5" /><text x="225" y="107" textAnchor="middle" fill="#60a5fa" fontSize="8">📬 Microtask Queue</text>
        <rect x="310" y="40" width="90" height="80" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="2" />
        <text x="355" y="62" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Thread Pool</text>
        <text x="355" y="82" textAnchor="middle" fill="#71717a" fontSize="7">libuv workers</text>
        <text x="355" y="100" textAnchor="middle" fill="#71717a" fontSize="6">I/O, DNS, crypto</text>
        <rect x="420" y="55" width="70" height="50" rx="5" fill="#f472b620" stroke="#f472b6" strokeWidth="1.5" /><text x="455" y="78" textAnchor="middle" fill="#f472b6" fontSize="8">🖥️ OS</text><text x="455" y="93" textAnchor="middle" fill="#71717a" fontSize="6">Async I/O</text>
        <path d="M145 75 L170 57" stroke="#71717a" strokeWidth="1" /><path d="M145 75 L170 102" stroke="#71717a" strokeWidth="1" />
      </svg>
    ),
    connstate: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Stateful vs Stateless Architecture</text>
        <rect x="20" y="35" width="200" height="90" rx="8" fill="rgba(248,113,113,0.08)" stroke="#f87171" strokeWidth="2" />
        <text x="120" y="55" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="600">Stateful</text>
        <text x="120" y="75" textAnchor="middle" fill="#fafafa" fontSize="8">Session on server</text>
        <text x="120" y="92" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Simpler logic</text>
        <text x="120" y="107" textAnchor="middle" fill="#f87171" fontSize="7">✗ Sticky sessions needed</text>
        <text x="120" y="120" textAnchor="middle" fill="#f87171" fontSize="7">✗ Hard to scale</text>
        <rect x="280" y="35" width="200" height="90" rx="8" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeWidth="2" />
        <text x="380" y="55" textAnchor="middle" fill="#4ade80" fontSize="11" fontWeight="600">Stateless</text>
        <text x="380" y="75" textAnchor="middle" fill="#fafafa" fontSize="8">State in external store</text>
        <text x="380" y="92" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Easy horizontal scale</text>
        <text x="380" y="107" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Any server handles req</text>
        <text x="380" y="120" textAnchor="middle" fill="#f87171" fontSize="7">✗ External deps (Redis)</text>
      </svg>
    ),
    datalocality: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Spark/Hadoop: Move compute to data, not data to compute</text>
        <rect x="20" y="35" width="140" height="90" rx="6" fill="rgba(248,113,113,0.08)" stroke="#f87171" strokeWidth="2" />
        <text x="90" y="55" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="600">❌ Bad: Move Data</text>
        <rect x="35" y="65" width="50" height="25" rx="4" fill="#f472b620" stroke="#f472b6" /><text x="60" y="82" textAnchor="middle" fill="#fafafa" fontSize="6">Data</text>
        <rect x="95" y="65" width="50" height="25" rx="4" fill="#a78bfa20" stroke="#a78bfa" /><text x="120" y="82" textAnchor="middle" fill="#fafafa" fontSize="6">Compute</text>
        <path d="M88 77 L92 77" stroke="#f87171" strokeWidth="2" /><text x="90" y="105" textAnchor="middle" fill="#f87171" fontSize="6">Network transfer</text>
        <rect x="180" y="35" width="140" height="90" rx="6" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeWidth="2" />
        <text x="250" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">✓ Good: Local Compute</text>
        <rect x="210" y="65" width="80" height="45" rx="4" fill="#4ade8020" stroke="#4ade80" />
        <text x="250" y="82" textAnchor="middle" fill="#fafafa" fontSize="7">Data + Compute</text>
        <text x="250" y="98" textAnchor="middle" fill="#71717a" fontSize="6">Same node</text>
        <rect x="340" y="45" width="145" height="80" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="412" y="65" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Benefits</text>
        <text x="412" y="82" textAnchor="middle" fill="#a1a1aa" fontSize="7">Lower latency</text>
        <text x="412" y="97" textAnchor="middle" fill="#a1a1aa" fontSize="7">Less bandwidth</text>
        <text x="412" y="112" textAnchor="middle" fill="#a1a1aa" fontSize="7">Better throughput</text>
      </svg>
    ),
    merkle: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Merkle Tree: Efficient data verification (Blockchain, Git)</text>
        <rect x="200" y="30" width="100" height="30" rx="5" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="2" /><text x="250" y="50" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="600">Root Hash</text>
        <rect x="115" y="75" width="80" height="25" rx="4" fill="#4ade8020" stroke="#4ade80" /><text x="155" y="92" textAnchor="middle" fill="#fafafa" fontSize="7">Hash(0-1)</text>
        <rect x="305" y="75" width="80" height="25" rx="4" fill="#4ade8020" stroke="#4ade80" /><text x="345" y="92" textAnchor="middle" fill="#fafafa" fontSize="7">Hash(2-3)</text>
        {[0, 1, 2, 3].map(i => <rect key={i} x={40 + i * 110} y="115" width="70" height="25" rx="4" fill="#60a5fa20" stroke="#60a5fa" />)}
        {[0, 1, 2, 3].map(i => <text key={i} x={75 + i * 110} y="132" textAnchor="middle" fill="#fafafa" fontSize="6">Block {i}</text>)}
        <path d="M200 45 L155 72" stroke="#71717a" strokeWidth="1" /><path d="M300 45 L345 72" stroke="#71717a" strokeWidth="1" />
        <path d="M135 102 L75 112" stroke="#71717a" strokeWidth="1" /><path d="M175 102 L185 112" stroke="#71717a" strokeWidth="1" />
        <path d="M325 102 L295 112" stroke="#71717a" strokeWidth="1" /><path d="M365 102 L405 112" stroke="#71717a" strokeWidth="1" />
        <text x="250" y="148" textAnchor="middle" fill="#a1a1aa" fontSize="7">Change one block → all parent hashes change → Tamper-evident</text>
      </svg>
    ),
    checksum: (
      <svg viewBox="0 0 500 130" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Data Integrity: Checksum verification</text>
        <rect x="20" y="40" width="120" height="50" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="80" y="62" textAnchor="middle" fill="#fafafa" fontSize="9">📄 Data Block</text><text x="80" y="78" textAnchor="middle" fill="#71717a" fontSize="6">+ CRC32 checksum</text>
        <rect x="175" y="40" width="100" height="50" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" /><text x="225" y="62" textAnchor="middle" fill="#fb923c" fontSize="9">🔄 Transfer</text><text x="225" y="78" textAnchor="middle" fill="#71717a" fontSize="6">Network/Disk</text>
        <rect x="310" y="40" width="80" height="50" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="350" y="62" textAnchor="middle" fill="#4ade80" fontSize="9">✅ Verify</text><text x="350" y="78" textAnchor="middle" fill="#71717a" fontSize="6">Recompute</text>
        <rect x="425" y="40" width="60" height="50" rx="5" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="1.5" /><text x="455" y="62" textAnchor="middle" fill="#a78bfa" fontSize="8">Match?</text><text x="455" y="78" textAnchor="middle" fill="#4ade80" fontSize="6">✓ OK</text>
        <path d="M145 65 L170 65" stroke="#71717a" strokeWidth="1" /><path d="M280 65 L305 65" stroke="#71717a" strokeWidth="1" /><path d="M395 65 L420 65" stroke="#71717a" strokeWidth="1" />
        <rect x="20" y="100" width="465" height="22" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="115" textAnchor="middle" fill="#a1a1aa" fontSize="7">Used: HDFS, S3, TCP, ZIP • Algorithms: CRC32, MD5, SHA-256</text>
      </svg>
    ),
    softdelete: (
      <svg viewBox="0 0 500 130" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Soft Delete: Mark as deleted, don't remove</text>
        <rect x="20" y="40" width="200" height="70" rx="6" fill="#f8717120" stroke="#f87171" strokeWidth="2" />
        <text x="120" y="60" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="600">Hard Delete</text>
        <text x="120" y="78" textAnchor="middle" fill="#fafafa" fontSize="7" fontFamily="monospace">DELETE FROM users WHERE id=1</text>
        <text x="120" y="98" textAnchor="middle" fill="#f87171" fontSize="7">❌ Gone forever • No recovery</text>
        <rect x="280" y="40" width="200" height="70" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="380" y="60" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">Soft Delete</text>
        <text x="380" y="78" textAnchor="middle" fill="#fafafa" fontSize="7" fontFamily="monospace">deleted_at = NOW()</text>
        <text x="380" y="98" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Recoverable • Audit trail</text>
        <text x="250" y="125" textAnchor="middle" fill="#71717a" fontSize="7">Filter: WHERE deleted_at IS NULL • Cleanup: Background job after 30 days</text>
      </svg>
    ),
    contentdelivery: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Akamai/Cloudflare: Global edge distribution</text>
        <rect x="200" y="35" width="100" height="45" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" /><text x="250" y="55" textAnchor="middle" fill="#fb923c" fontSize="10" fontWeight="600">Origin</text><text x="250" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Your server</text>
        <circle cx="75" cy="95" r="25" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="75" y="92" textAnchor="middle" fill="#4ade80" fontSize="7">🌍 EU</text><text x="75" y="105" textAnchor="middle" fill="#71717a" fontSize="5">Edge</text>
        <circle cx="175" cy="115" r="25" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="175" y="112" textAnchor="middle" fill="#4ade80" fontSize="7">🌎 US</text><text x="175" y="125" textAnchor="middle" fill="#71717a" fontSize="5">Edge</text>
        <circle cx="325" cy="115" r="25" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="325" y="112" textAnchor="middle" fill="#4ade80" fontSize="7">🌏 Asia</text><text x="325" y="125" textAnchor="middle" fill="#71717a" fontSize="5">Edge</text>
        <circle cx="425" cy="95" r="25" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="425" y="92" textAnchor="middle" fill="#4ade80" fontSize="7">🌐 AU</text><text x="425" y="105" textAnchor="middle" fill="#71717a" fontSize="5">Edge</text>
        <path d="M200 60 L100 85" stroke="#71717a" strokeWidth="1" /><path d="M200 70 L175 90" stroke="#71717a" strokeWidth="1" /><path d="M300 70 L325 90" stroke="#71717a" strokeWidth="1" /><path d="M300 60 L400 85" stroke="#71717a" strokeWidth="1" />
      </svg>
    ),
    tokenbucket: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Token Bucket: Rate limiting with burst capacity</text>
        <rect x="20" y="40" width="130" height="80" rx="8" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" />
        <text x="85" y="60" textAnchor="middle" fill="#fb923c" fontSize="10" fontWeight="600">🪣 Bucket</text>
        <text x="85" y="78" textAnchor="middle" fill="#fafafa" fontSize="8">Capacity: 100</text>
        <rect x="40" y="85" width="90" height="25" rx="3" fill="rgba(0,0,0,0.3)" />
        <rect x="42" y="87" width="60" height="21" rx="2" fill="#4ade80" /><text x="72" y="102" textAnchor="middle" fill="#fafafa" fontSize="7">60 tokens</text>
        <rect x="180" y="50" width="100" height="60" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="230" y="70" textAnchor="middle" fill="#4ade80" fontSize="8">⬆️ Refill</text>
        <text x="230" y="88" textAnchor="middle" fill="#fafafa" fontSize="7">10 tokens/sec</text>
        <text x="230" y="102" textAnchor="middle" fill="#71717a" fontSize="6">Constant rate</text>
        <rect x="310" y="50" width="170" height="60" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="395" y="70" textAnchor="middle" fill="#60a5fa" fontSize="8">⬇️ Consume</text>
        <text x="395" y="88" textAnchor="middle" fill="#fafafa" fontSize="7">1 token per request</text>
        <text x="395" y="102" textAnchor="middle" fill="#71717a" fontSize="6">Burst OK if tokens avail</text>
        <path d="M155 80 L175 80" stroke="#4ade80" strokeWidth="1.5" /><path d="M285 80 L305 80" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="250" y="130" textAnchor="middle" fill="#a1a1aa" fontSize="7">Burst: Use all 100 tokens instantly • Then wait for refill • Smooth long-term rate</text>
      </svg>
    ),
    georouting: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Cloudflare: Location-based traffic routing</text>
        <rect x="15" y="40" width="80" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="60" textAnchor="middle" fill="#fafafa" fontSize="8">👤 User</text><text x="55" y="77" textAnchor="middle" fill="#71717a" fontSize="6">London, UK</text>
        <rect x="130" y="35" width="130" height="55" rx="6" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="2" />
        <text x="195" y="55" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">🌐 GeoDNS</text>
        <text x="195" y="72" textAnchor="middle" fill="#71717a" fontSize="7">Resolve by location</text>
        <text x="195" y="85" textAnchor="middle" fill="#71717a" fontSize="6">IP → Region mapping</text>
        <rect x="295" y="30" width="90" height="35" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="340" y="52" textAnchor="middle" fill="#4ade80" fontSize="8">🇪🇺 EU Server</text>
        <rect x="295" y="70" width="90" height="35" rx="5" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="1.5" /><text x="340" y="92" textAnchor="middle" fill="#60a5fa" fontSize="8">🇺🇸 US Server</text>
        <rect x="405" y="30" width="80" height="75" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="445" y="52" textAnchor="middle" fill="#fafafa" fontSize="8">Benefits</text>
        <text x="445" y="70" textAnchor="middle" fill="#a1a1aa" fontSize="6">Lower latency</text>
        <text x="445" y="85" textAnchor="middle" fill="#a1a1aa" fontSize="6">Compliance</text>
        <text x="445" y="100" textAnchor="middle" fill="#a1a1aa" fontSize="6">Failover</text>
        <path d="M100 62 L125 62" stroke="#71717a" strokeWidth="1" /><path d="M265 62 L290 47" stroke="#4ade80" strokeWidth="1.5" /><path d="M265 72 L290 87" stroke="#71717a" strokeWidth="1" strokeDasharray="3,3" />
        <text x="277" y="42" fill="#4ade80" fontSize="6">nearest</text>
      </svg>
    ),
    newsfeed: (
      <svg viewBox="0 0 500 160" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Facebook: Ranked news feed aggregation</text>
        <rect x="15" y="35" width="80" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="55" textAnchor="middle" fill="#fafafa" fontSize="8">📝 Posts</text><text x="55" y="72" textAnchor="middle" fill="#71717a" fontSize="6">From friends</text>
        <rect x="120" y="30" width="100" height="55" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" /><text x="170" y="50" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">🔄 Aggregator</text><text x="170" y="67" textAnchor="middle" fill="#71717a" fontSize="7">Collect posts</text><text x="170" y="80" textAnchor="middle" fill="#71717a" fontSize="6">From all sources</text>
        <rect x="245" y="30" width="100" height="55" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="2" /><text x="295" y="50" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">🎯 Ranker</text><text x="295" y="67" textAnchor="middle" fill="#71717a" fontSize="7">ML scoring</text><text x="295" y="80" textAnchor="middle" fill="#71717a" fontSize="6">Relevance</text>
        <rect x="370" y="30" width="115" height="55" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" /><text x="427" y="50" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">📰 Feed</text><text x="427" y="67" textAnchor="middle" fill="#fafafa" fontSize="7">Personalized</text><text x="427" y="80" textAnchor="middle" fill="#71717a" fontSize="6">Top stories first</text>
        <path d="M100 57 L115 57" stroke="#71717a" strokeWidth="1" /><path d="M225 57 L240 57" stroke="#71717a" strokeWidth="1" /><path d="M350 57 L365 57" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="100" width="225" height="50" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="127" y="117" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Ranking Signals</text>
        <text x="30" y="135" fill="#a1a1aa" fontSize="7">Recency • Engagement • Relationship</text>
        <rect x="260" y="100" width="225" height="50" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="372" y="117" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="500">Scale</text>
        <text x="275" y="135" fill="#a1a1aa" fontSize="7">10K+ candidates → 100 shown</text>
      </svg>
    ),
    scaling: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Horizontal vs Vertical Scaling</text>
        <rect x="20" y="35" width="200" height="90" rx="8" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeWidth="2" />
        <text x="120" y="55" textAnchor="middle" fill="#4ade80" fontSize="11" fontWeight="600">↔️ Horizontal (Scale Out)</text>
        <text x="120" y="75" textAnchor="middle" fill="#fafafa" fontSize="8">Add more machines</text>
        <text x="120" y="92" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Linear scaling, fault tolerant</text>
        <text x="120" y="107" textAnchor="middle" fill="#f87171" fontSize="7">✗ Complexity, data consistency</text>
        <rect x="280" y="35" width="200" height="90" rx="8" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="2" />
        <text x="380" y="55" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">↕️ Vertical (Scale Up)</text>
        <text x="380" y="75" textAnchor="middle" fill="#fafafa" fontSize="8">Bigger machine</text>
        <text x="380" y="92" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Simple, no code change</text>
        <text x="380" y="107" textAnchor="middle" fill="#f87171" fontSize="7">✗ Hardware limits, SPOF</text>
      </svg>
    ),
    proxy: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Proxy Patterns: Forward vs Reverse</text>
        <rect x="20" y="35" width="200" height="90" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" />
        <text x="120" y="55" textAnchor="middle" fill="#fb923c" fontSize="10" fontWeight="600">→ Forward Proxy</text>
        <text x="120" y="75" textAnchor="middle" fill="#fafafa" fontSize="8">Client-side proxy</text>
        <text x="120" y="92" textAnchor="middle" fill="#71717a" fontSize="7">Client → Proxy → Internet</text>
        <text x="120" y="107" textAnchor="middle" fill="#a1a1aa" fontSize="6">Anonymity, caching, filtering</text>
        <rect x="280" y="35" width="200" height="90" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="2" />
        <text x="380" y="55" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="600">← Reverse Proxy</text>
        <text x="380" y="75" textAnchor="middle" fill="#fafafa" fontSize="8">Server-side proxy</text>
        <text x="380" y="92" textAnchor="middle" fill="#71717a" fontSize="7">Client → Proxy → Servers</text>
        <text x="380" y="107" textAnchor="middle" fill="#a1a1aa" fontSize="6">LB, SSL termination, cache</text>
      </svg>
    ),
    acid: (
      <svg viewBox="0 0 500 130" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">ACID: Database Transaction Guarantees</text>
        {[{ x: 15, l: 'A', n: 'Atomicity', d: 'All or nothing', c: '#4ade80' }, { x: 140, l: 'C', n: 'Consistency', d: 'Valid state', c: '#60a5fa' }, { x: 265, l: 'I', n: 'Isolation', d: 'No interference', c: '#a78bfa' }, { x: 390, l: 'D', n: 'Durability', d: 'Persisted', c: '#fb923c' }].map((p, i) => (
          <g key={i}>
            <rect x={p.x} y="35" width="110" height="80" rx="6" fill={`${p.c}20`} stroke={p.c} strokeWidth="2" />
            <text x={p.x + 55} y="58" textAnchor="middle" fill={p.c} fontSize="16" fontWeight="700">{p.l}</text>
            <text x={p.x + 55} y="78" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="500">{p.n}</text>
            <text x={p.x + 55} y="98" textAnchor="middle" fill="#71717a" fontSize="7">{p.d}</text>
          </g>
        ))}
      </svg>
    ),
    optlock: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Optimistic vs Pessimistic Locking</text>
        <rect x="20" y="35" width="200" height="90" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="120" y="55" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">😊 Optimistic</text>
        <text x="120" y="75" textAnchor="middle" fill="#fafafa" fontSize="8">Check version at commit</text>
        <text x="120" y="90" textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="monospace">WHERE version = 5</text>
        <text x="120" y="107" textAnchor="middle" fill="#4ade80" fontSize="7">✓ High concurrency, no waits</text>
        <rect x="280" y="35" width="200" height="90" rx="6" fill="#f8717120" stroke="#f87171" strokeWidth="2" />
        <text x="380" y="55" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="600">🔒 Pessimistic</text>
        <text x="380" y="75" textAnchor="middle" fill="#fafafa" fontSize="8">Lock row during edit</text>
        <text x="380" y="90" textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="monospace">SELECT FOR UPDATE</text>
        <text x="380" y="107" textAnchor="middle" fill="#f87171" fontSize="7">✓ No conflicts, but waits</text>
      </svg>
    ),
    hotcold: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">S3/Glacier: Hot, Warm, Cold Data Tiering</text>
        <rect x="20" y="40" width="140" height="80" rx="6" fill="#f8717130" stroke="#f87171" strokeWidth="2" />
        <text x="90" y="60" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="600">🔥 Hot</text>
        <text x="90" y="78" textAnchor="middle" fill="#fafafa" fontSize="8">Frequent access</text>
        <text x="90" y="93" textAnchor="middle" fill="#71717a" fontSize="7">SSD, in-memory</text>
        <text x="90" y="108" textAnchor="middle" fill="#f87171" fontSize="6">$$$ High cost</text>
        <rect x="180" y="40" width="140" height="80" rx="6" fill="#fbbf2430" stroke="#fbbf24" strokeWidth="2" />
        <text x="250" y="60" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="600">🌡️ Warm</text>
        <text x="250" y="78" textAnchor="middle" fill="#fafafa" fontSize="8">Occasional access</text>
        <text x="250" y="93" textAnchor="middle" fill="#71717a" fontSize="7">Standard storage</text>
        <text x="250" y="108" textAnchor="middle" fill="#fbbf24" fontSize="6">$$ Medium cost</text>
        <rect x="340" y="40" width="140" height="80" rx="6" fill="#60a5fa30" stroke="#60a5fa" strokeWidth="2" />
        <text x="410" y="60" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">❄️ Cold</text>
        <text x="410" y="78" textAnchor="middle" fill="#fafafa" fontSize="8">Rare access</text>
        <text x="410" y="93" textAnchor="middle" fill="#71717a" fontSize="7">Archive (Glacier)</text>
        <text x="410" y="108" textAnchor="middle" fill="#60a5fa" fontSize="6">$ Low cost</text>
      </svg>
    ),
    heartbeat: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">ZooKeeper: Heartbeat for liveness detection</text>
        <rect x="30" y="40" width="120" height="60" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="90" y="65" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">💚 Node A</text>
        <text x="90" y="85" textAnchor="middle" fill="#71717a" fontSize="7">Alive (3s ago)</text>
        <rect x="190" y="40" width="120" height="60" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="250" y="65" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">💚 Node B</text>
        <text x="250" y="85" textAnchor="middle" fill="#71717a" fontSize="7">Alive (1s ago)</text>
        <rect x="350" y="40" width="120" height="60" rx="6" fill="#f8717130" stroke="#f87171" strokeWidth="2" />
        <text x="410" y="65" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="600">💔 Node C</text>
        <text x="410" y="85" textAnchor="middle" fill="#71717a" fontSize="7">Dead (30s timeout)</text>
        <rect x="30" y="110" width="440" height="22" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="125" textAnchor="middle" fill="#a1a1aa" fontSize="8">Periodic ping • Timeout → Mark dead • Trigger failover</text>
      </svg>
    ),
    splitbrain: (
      <svg viewBox="0 0 500 150" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Split Brain: Network partition creates two leaders</text>
        <rect x="20" y="40" width="180" height="70" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="110" y="60" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">Partition A</text>
        <circle cx="70" cy="85" r="15" fill="#fbbf2430" stroke="#fbbf24" strokeWidth="2" /><text x="70" y="90" textAnchor="middle" fill="#fbbf24" fontSize="8">👑</text>
        <circle cx="150" cy="85" r="15" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="1.5" /><text x="150" y="90" textAnchor="middle" fill="#60a5fa" fontSize="8">F</text>
        <rect x="220" y="55" width="60" height="40" rx="4" fill="#f8717130" stroke="#f87171" strokeWidth="2" strokeDasharray="5,5" />
        <text x="250" y="80" textAnchor="middle" fill="#f87171" fontSize="8">🔌</text>
        <rect x="300" y="40" width="180" height="70" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="2" />
        <text x="390" y="60" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="600">Partition B</text>
        <circle cx="350" cy="85" r="15" fill="#fbbf2430" stroke="#fbbf24" strokeWidth="2" /><text x="350" y="90" textAnchor="middle" fill="#fbbf24" fontSize="8">👑</text>
        <circle cx="430" cy="85" r="15" fill="#60a5fa20" stroke="#60a5fa" strokeWidth="1.5" /><text x="430" y="90" textAnchor="middle" fill="#60a5fa" fontSize="8">F</text>
        <rect x="20" y="120" width="460" height="22" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="135" textAnchor="middle" fill="#a1a1aa" fontSize="7">Solution: Quorum (majority wins) • Fencing tokens • Manual intervention</text>
      </svg>
    ),
    hintedhandoff: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Cassandra: Hinted Handoff for temporary failures</text>
        <rect x="30" y="40" width="100" height="50" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="80" y="62" textAnchor="middle" fill="#fafafa" fontSize="9">📝 Write</text><text x="80" y="78" textAnchor="middle" fill="#71717a" fontSize="6">key=123</text>
        <rect x="170" y="40" width="100" height="50" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" /><text x="220" y="62" textAnchor="middle" fill="#4ade80" fontSize="9">Node A</text><text x="220" y="78" textAnchor="middle" fill="#71717a" fontSize="6">Available</text>
        <rect x="310" y="40" width="100" height="50" rx="6" fill="#f8717120" stroke="#f87171" strokeWidth="2" strokeDasharray="5,5" /><text x="360" y="62" textAnchor="middle" fill="#f87171" fontSize="9">Node B</text><text x="360" y="78" textAnchor="middle" fill="#71717a" fontSize="6">Down ❌</text>
        <rect x="170" y="100" width="240" height="30" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth="1.5" />
        <text x="290" y="120" textAnchor="middle" fill="#fb923c" fontSize="8">💾 Node A stores hint for Node B → Replay when B recovers</text>
        <path d="M135 65 L165 65" stroke="#71717a" strokeWidth="1" /><path d="M275 65 L305 65" stroke="#f87171" strokeWidth="1" strokeDasharray="3,3" />
      </svg>
    ),
    readrepair: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Cassandra: Read Repair fixes stale replicas</text>
        <rect x="15" y="40" width="80" height="45" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="60" textAnchor="middle" fill="#fafafa" fontSize="8">📖 Read</text><text x="55" y="77" textAnchor="middle" fill="#71717a" fontSize="6">key=123</text>
        <rect x="130" y="35" width="90" height="55" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="175" y="55" textAnchor="middle" fill="#4ade80" fontSize="8">Node 1</text><text x="175" y="72" textAnchor="middle" fill="#fafafa" fontSize="7">v=5 ✓</text><text x="175" y="85" textAnchor="middle" fill="#4ade80" fontSize="6">Latest</text>
        <rect x="240" y="35" width="90" height="55" rx="5" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="1.5" /><text x="285" y="55" textAnchor="middle" fill="#fbbf24" fontSize="8">Node 2</text><text x="285" y="72" textAnchor="middle" fill="#fafafa" fontSize="7">v=4 ⚠️</text><text x="285" y="85" textAnchor="middle" fill="#fbbf24" fontSize="6">Stale</text>
        <rect x="350" y="35" width="90" height="55" rx="5" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="1.5" /><text x="395" y="55" textAnchor="middle" fill="#fbbf24" fontSize="8">Node 3</text><text x="395" y="72" textAnchor="middle" fill="#fafafa" fontSize="7">v=3 ⚠️</text><text x="395" y="85" textAnchor="middle" fill="#fbbf24" fontSize="6">Stale</text>
        <path d="M100 62 L125 62" stroke="#71717a" strokeWidth="1" />
        <rect x="15" y="105" width="470" height="28" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="123" textAnchor="middle" fill="#a1a1aa" fontSize="8">Coordinator returns v=5 (latest) AND asynchronously updates Nodes 2,3</text>
      </svg>
    ),
    antientropy: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Dynamo: Anti-Entropy (Merkle Tree sync)</text>
        <rect x="30" y="40" width="130" height="60" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="95" y="62" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">Node A</text>
        <text x="95" y="80" textAnchor="middle" fill="#71717a" fontSize="7">Hash: abc123</text>
        <rect x="340" y="40" width="130" height="60" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" />
        <text x="405" y="62" textAnchor="middle" fill="#fb923c" fontSize="10" fontWeight="600">Node B</text>
        <text x="405" y="80" textAnchor="middle" fill="#71717a" fontSize="7">Hash: xyz789</text>
        <rect x="185" y="45" width="130" height="50" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="65" textAnchor="middle" fill="#fafafa" fontSize="8">🔄 Compare</text>
        <text x="250" y="82" textAnchor="middle" fill="#f87171" fontSize="7">Mismatch → Sync</text>
        <path d="M165 70 L180 70" stroke="#4ade80" strokeWidth="1.5" /><path d="M320 70 L335 70" stroke="#fb923c" strokeWidth="1.5" />
        <rect x="30" y="110" width="440" height="22" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="125" textAnchor="middle" fill="#a1a1aa" fontSize="7">Background process • Compare Merkle trees • Sync only differing ranges</text>
      </svg>
    ),
    batch: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Batch Processing: Scheduled bulk operations</text>
        <rect x="20" y="40" width="130" height="60" rx="6" fill="#f472b620" stroke="#f472b6" strokeWidth="2" />
        <text x="85" y="62" textAnchor="middle" fill="#f472b6" fontSize="10" fontWeight="600">📁 Data Lake</text>
        <text x="85" y="80" textAnchor="middle" fill="#71717a" fontSize="7">Raw data (TB+)</text>
        <rect x="185" y="40" width="130" height="60" rx="6" fill="#fb923c20" stroke="#fb923c" strokeWidth="2" />
        <text x="250" y="62" textAnchor="middle" fill="#fb923c" fontSize="10" fontWeight="600">⚙️ Batch Job</text>
        <text x="250" y="80" textAnchor="middle" fill="#71717a" fontSize="7">Spark/Hadoop</text>
        <rect x="350" y="40" width="130" height="60" rx="6" fill="#4ade8020" stroke="#4ade80" strokeWidth="2" />
        <text x="415" y="62" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">📊 Results</text>
        <text x="415" y="80" textAnchor="middle" fill="#71717a" fontSize="7">Aggregations</text>
        <path d="M155 70 L180 70" stroke="#71717a" strokeWidth="1.5" /><path d="M320 70 L345 70" stroke="#71717a" strokeWidth="1.5" />
        <rect x="20" y="110" width="460" height="22" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="125" textAnchor="middle" fill="#a1a1aa" fontSize="8">Use: ETL, reports, ML training • Schedule: Hourly/Daily/Weekly</text>
      </svg>
    ),
    throttling: (
      <svg viewBox="0 0 500 130" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">AWS: Throttling to protect system resources</text>
        <rect x="20" y="40" width="120" height="50" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" />
        <text x="80" y="62" textAnchor="middle" fill="#fafafa" fontSize="9">🌊 Requests</text>
        <text x="80" y="78" textAnchor="middle" fill="#71717a" fontSize="7">10,000 RPS</text>
        <rect x="175" y="35" width="150" height="60" rx="6" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="2" />
        <text x="250" y="58" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600">🚦 Throttler</text>
        <text x="250" y="75" textAnchor="middle" fill="#71717a" fontSize="7">Limit: 1,000 RPS</text>
        <text x="250" y="88" textAnchor="middle" fill="#71717a" fontSize="6">HTTP 429 if exceeded</text>
        <rect x="360" y="40" width="120" height="50" rx="5" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" />
        <text x="420" y="62" textAnchor="middle" fill="#4ade80" fontSize="9">✅ Allowed</text>
        <text x="420" y="78" textAnchor="middle" fill="#71717a" fontSize="7">1,000 RPS</text>
        <path d="M145 65 L170 65" stroke="#71717a" strokeWidth="1.5" /><path d="M330 65 L355 65" stroke="#4ade80" strokeWidth="1.5" />
        <text x="250" y="115" textAnchor="middle" fill="#a1a1aa" fontSize="7">Protect downstream • Fair usage • Prevent cascading failure</text>
      </svg>
    ),
    reverseproxy: (
      <svg viewBox="0 0 500 140" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Nginx: Reverse Proxy Use Cases</text>
        <rect x="15" y="40" width="80" height="50" rx="5" fill={`${color}20`} stroke={color} strokeWidth="1.5" /><text x="55" y="62" textAnchor="middle" fill="#fafafa" fontSize="8">🌐 Client</text><text x="55" y="77" textAnchor="middle" fill="#71717a" fontSize="6">Internet</text>
        <rect x="130" y="30" width="130" height="80" rx="6" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="2" />
        <text x="195" y="52" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="600">🔀 Reverse Proxy</text>
        <text x="195" y="70" textAnchor="middle" fill="#71717a" fontSize="7">• SSL termination</text>
        <text x="195" y="85" textAnchor="middle" fill="#71717a" fontSize="7">• Load balancing</text>
        <text x="195" y="100" textAnchor="middle" fill="#71717a" fontSize="7">• Caching, WAF</text>
        <rect x="300" y="32" width="80" height="30" rx="4" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="340" y="52" textAnchor="middle" fill="#4ade80" fontSize="7">Server 1</text>
        <rect x="300" y="67" width="80" height="30" rx="4" fill="#4ade8020" stroke="#4ade80" strokeWidth="1.5" /><text x="340" y="87" textAnchor="middle" fill="#4ade80" fontSize="7">Server 2</text>
        <rect x="395" y="50" width="90" height="40" rx="5" fill="#f472b620" stroke="#f472b6" strokeWidth="1.5" /><text x="440" y="75" textAnchor="middle" fill="#f472b6" fontSize="7">Backend Pool</text>
        <path d="M100 65 L125 65" stroke="#71717a" strokeWidth="1.5" /><path d="M265 50 L295 47" stroke="#71717a" strokeWidth="1" /><path d="M265 82 L295 82" stroke="#71717a" strokeWidth="1" />
        <text x="250" y="130" textAnchor="middle" fill="#a1a1aa" fontSize="7">Clients see one endpoint • Servers hidden • Centralized security</text>
      </svg>
    ),
  };
  return diagrams[type] || <div style={{ padding: '2rem', textAlign: 'center', background: `${color}10`, borderRadius: '8px' }}><span style={{ fontSize: '2.5rem' }}>📊</span><p style={{ color: '#71717a', marginTop: '0.5rem', fontSize: '0.85rem' }}>{type}</p></div>;
}


const content = {
  caching: {
    concepts: ['Cache-aside: App checks cache first, loads from DB on miss', 'Read-through: Cache fetches from DB on miss', 'Write-through: Write to cache and DB simultaneously', 'Write-back: Write to cache, async persist to DB', 'Write-around: Write directly to DB, bypass cache'],
    tradeoffs: [['Strategy', 'Pros', 'Cons'], ['Cache-aside', 'Simple, app controls', 'Cache miss penalty'], ['Read-through', 'Transparent', 'First request slow'], ['Write-through', 'Strong consistency', 'Higher latency'], ['Write-back', 'Fast writes', 'Data loss risk']],
    interview: ['When choose write-back over write-through?', 'How handle cache invalidation?', 'What is thundering herd?'],
    deepDive: 'Facebook uses Memcached with cache-aside for 1B+ users. Key insight: Cache invalidation is the hardest problem. Solutions: TTL-based expiry (simple but stale data), event-driven invalidation (complex but fresh), or write-through (consistent but slower). Thundering herd occurs when cache expires and 1000s of requests hit DB simultaneously - solve with request coalescing or probabilistic early expiration.',
    realWorld: 'Netflix: EVCache (Memcached-based) with 30M+ ops/sec. Twitter: Redis for timeline cache, 300K requests/sec per node. Instagram: Memcached for sessions, 500K ops/sec.',
    gotchas: 'Never cache user-specific data without proper keys. Watch for cache stampede on cold start. Hot keys can overload single cache node - use consistent hashing. Cache penetration (querying non-existent keys) needs bloom filters.'
  },
  eviction: {
    concepts: ['LRU: Evict oldest accessed item', 'LFU: Evict least accessed item', 'FIFO: Evict oldest inserted item', 'TTL: Automatic expiration after time limit', 'Random: Simple but unpredictable'],
    tradeoffs: [['Policy', 'Best For', 'Weakness'], ['LRU', 'Temporal locality', 'Scan resistance poor'], ['LFU', 'Frequency patterns', 'Slow to adapt'], ['FIFO', 'Simplicity', 'Ignores access patterns'], ['TTL', 'Time-sensitive', 'May evict hot data']],
    interview: ['Implement LRU cache with O(1)', 'How does Redis implement LRU?', 'When is LFU better than LRU?'],
    deepDive: 'LRU uses doubly-linked list + hashmap for O(1). Redis approximates LRU by sampling 5 random keys and evicting oldest - saves memory vs true LRU. LFU better for CDNs where some content is always popular. Window-LFU combines both: recent frequency matters more than historical.',
    gotchas: 'True LRU is expensive at scale. One full table scan can evict your entire hot set. Consider ARC (Adaptive Replacement Cache) which balances recency and frequency automatically.'
  },
  sharding: {
    concepts: ['Horizontal partitioning across databases', 'Shard key determines data placement', 'Range sharding: Divide by key ranges', 'Hash sharding: Consistent hash of key', 'Directory-based: Lookup table for mapping'],
    tradeoffs: [['Strategy', 'Pros', 'Cons'], ['Range', 'Range queries efficient', 'Hotspots possible'], ['Hash', 'Even distribution', 'Range queries hard'], ['Directory', 'Flexible', 'Single point of failure']],
    interview: ['How handle cross-shard queries?', 'What happens adding more shards?', 'How does Instagram shard?'],
    deepDive: 'Instagram shards by user_id % num_shards - each shard is a complete Postgres instance. Cross-shard queries are expensive, so they denormalize heavily. When resharding, they use logical replication to copy data to new shards with zero downtime. Shard key choice is critical: shard by user_id for user-centric apps, by tenant_id for B2B SaaS.',
    realWorld: 'Vitess (YouTube): Sharded MySQL serving 5B+ rows. CockroachDB: Auto-sharding with rebalancing. Instagram: 12K+ shards serving 2B users.',
    gotchas: 'Avoid sharding by timestamp (hot partition for recent data). Cross-shard transactions are 10-100x slower. Plan resharding strategy before you need it - migration is painful.'
  },
  circuit: {
    concepts: ['Closed: Normal operation, requests pass', 'Open: Requests fail fast immediately', 'Half-open: Test if service recovered', 'Failure threshold triggers state change', 'Prevents cascade failures'],
    tradeoffs: [['State', 'Behavior', 'Purpose'], ['Closed', 'All requests pass', 'Normal operation'], ['Open', 'Immediate failure', 'Protect system'], ['Half-Open', 'Limited requests', 'Test recovery']],
    interview: ['How set circuit breaker thresholds?', 'What metrics trigger the circuit?', 'How does Netflix Hystrix work?'],
    deepDive: 'Netflix Hystrix opened circuit at 50% error rate over 20 requests in 10s window. Modern approach: Resilience4j uses sliding window (count or time-based). Key insight: circuit breaker protects the CALLER, not the failing service. Combine with bulkhead (thread pool isolation) to prevent one slow service from consuming all threads.',
    realWorld: 'Netflix: Every service-to-service call has circuit breaker. Amazon: Circuit breakers prevented 2020 Prime Day cascading failures. Uber: Circuit breaker + retry with exponential backoff.',
    gotchas: 'Too sensitive = circuit opens on transient errors. Too lenient = cascade failures. Start with 50% error rate, 10s window, 5s open duration. Monitor circuit state as a key metric.'
  },
  cap: {
    concepts: ['Consistency: All nodes see same data', 'Availability: Every request gets response', 'Partition tolerance: Works despite network splits', 'Can only guarantee 2 of 3 during partition', 'PACELC extends for non-partition scenarios'],
    tradeoffs: [['Choice', 'Examples', 'Behavior'], ['CP', 'MongoDB, Redis Cluster', 'Consistent but may reject'], ['AP', 'Cassandra, DynamoDB', 'Available but stale data'], ['CA', 'Single-node RDBMS', 'Not partition tolerant']],
    interview: ['Is CAP a false trichotomy?', 'How does Cassandra handle CAP?', 'What is PACELC?'],
    deepDive: 'CAP is about DURING network partition - you choose C or A. PACELC adds: Else (no partition), choose Latency or Consistency. DynamoDB is PA/EL (available during partition, low latency otherwise). Spanner is PC/EC (consistent always, accepts latency cost). Most systems let you tune per-operation: Cassandra QUORUM reads = CP, ONE read = AP.',
    realWorld: 'Google Spanner: TrueTime gives global consistency with ~7ms latency. Cassandra: Tunable consistency per query. DynamoDB: Eventually consistent by default, strongly consistent optional (2x cost).',
    gotchas: 'CAP is often misunderstood. Partitions are rare in modern cloud. Real tradeoff is usually latency vs consistency. Dont choose AP just because CAP says you must - measure your actual partition frequency.'
  },
  hash: {
    concepts: ['Maps keys to positions on virtual ring', 'Nodes placed at hash positions', 'Keys routed to next clockwise node', 'Virtual nodes for better distribution', 'Minimal key movement when nodes change'],
    tradeoffs: [['Aspect', 'Consistent Hash', 'Modulo Hash'], ['Node change', 'K/n keys move', 'All keys move'], ['Distribution', 'Even with vnodes', 'Even'], ['Complexity', 'Higher', 'Simple']],
    interview: ['How do virtual nodes improve distribution?', 'What happens when a node fails?', 'How does DynamoDB use consistent hashing?'],
    deepDive: 'Without virtual nodes, adding a node only takes load from ONE neighbor. With 150 vnodes per physical node, load distributes evenly. DynamoDB uses consistent hashing with preference lists - each key stored on N consecutive nodes on ring for replication. Jump consistent hash is simpler and faster but doesnt support weighted nodes.',
    realWorld: 'Cassandra: 256 vnodes default. DynamoDB: Consistent hashing + preference lists. Memcached: Client-side consistent hashing. Discord: Custom implementation for message routing.',
    gotchas: 'More vnodes = better distribution but more memory for ring. Hot keys still hot regardless of hashing. Consider separate handling for celebrity/viral content.'
  },
  microservices: {
    concepts: ['Single responsibility per service', 'Independent deployment and scaling', 'API contracts between services', 'Database per service pattern', 'Service mesh for communication'],
    tradeoffs: [['Aspect', 'Microservices', 'Monolith'], ['Deployment', 'Independent', 'All-or-nothing'], ['Scaling', 'Granular', 'Whole app'], ['Complexity', 'Distributed systems', 'Simpler ops']],
    interview: ['How handle distributed transactions?', 'What is service decomposition?', 'How debug across services?'],
    deepDive: 'Start monolith, extract when needed. Amazon rule: 2-pizza team owns each service. Database per service is hard - use Saga pattern for distributed transactions or accept eventual consistency. Service mesh (Istio/Linkerd) handles cross-cutting: mTLS, retries, circuit breakers, observability.',
    realWorld: 'Amazon: 100-150 services per page load. Netflix: 700+ microservices. Uber: 4000+ services. Monzo: Started microservices day 1, 1600+ services.',
    gotchas: 'Distributed monolith is worst of both worlds. If services cant deploy independently, you dont have microservices. Network calls are 1000x slower than in-process - design for failure.'
  },
  kafka: {
    concepts: ['Distributed commit log', 'Topics partitioned for parallelism', 'Consumer groups for scaling', 'Retention-based not deletion on consume', 'Exactly-once semantics with transactions'],
    tradeoffs: [['Feature', 'Kafka', 'Traditional MQ'], ['Storage', 'Persistent log', 'Transient'], ['Replay', 'Yes from offset', 'No'], ['Throughput', 'Very high', 'Moderate']],
    interview: ['How choose number of partitions?', 'Explain consumer group rebalancing', 'How does Kafka achieve high throughput?'],
    deepDive: 'Kafka achieves 2M messages/sec through sequential disk I/O (faster than random SSD), zero-copy sendfile(), and batching. Partitions = max parallelism for consumers. Rule of thumb: partitions = max(throughput/100MB/s, consumer count). Compacted topics keep only latest value per key - perfect for CDC or materialized views.',
    realWorld: 'LinkedIn: 7 trillion messages/day. Netflix: 700 billion events/day. Uber: 4 trillion messages/day across 2000+ clusters. Airbnb: Event sourcing backbone.',
    gotchas: 'Cant change partition count without rebalancing. Consumer lag is key metric - alert if growing. Ordering only guaranteed within partition, not across. Large messages (>1MB) need chunking.'
  },
  urlshort: {
    concepts: ['Base62 encoding of unique ID', 'Hash collision handling', 'Read-heavy workload 100:1', 'Custom alias support', 'Analytics and click tracking'],
    tradeoffs: [['Approach', 'Pros', 'Cons'], ['Counter + Base62', 'No collision', 'Sequential'], ['Hash truncation', 'Non-sequential', 'Collision handling'], ['Pre-generated', 'Fast writes', 'Storage overhead']],
    interview: ['How handle 301 vs 302 redirects?', 'How design for 1B URLs?', 'How prevent abuse?'],
    deepDive: '301 (permanent) lets browsers cache - less server load but cant track clicks. 302 (temporary) forces server hit each time - better analytics. Base62 gives 62^7 = 3.5 trillion combinations. For 1B URLs: shard by short code prefix. Pre-generate IDs using Twitter Snowflake pattern to avoid single-point counter.',
    realWorld: 'bit.ly: 600M links created monthly, 10B clicks monthly. TinyURL: Simple hash + collision retry. t.co (Twitter): Every link wrapped for analytics.',
    gotchas: 'URL shorteners are spam/phishing vectors - need abuse detection. Custom aliases can be guessed (try /admin). Consider link expiration for security-sensitive use cases.'
  },
  twitterfeed: {
    concepts: ['Fan-out on write vs fan-out on read', 'Hybrid approach for celebrities', 'Timeline cache per user', 'Social graph for following', 'Tweet ranking and filtering'],
    tradeoffs: [['Approach', 'Write Cost', 'Read Cost'], ['Fan-out Write', 'High', 'Low'], ['Fan-out Read', 'Low', 'High'], ['Hybrid', 'Medium', 'Medium']],
    interview: ['Why Twitter uses fan-out on write?', 'How handle millions of followers?', 'How rank tweets?'],
    deepDive: 'Twitter fan-out: Tweet goes to Redis list for each follower. 300K writes/sec fanout. But celebrities (Lady Gaga: 80M followers) use fan-out on read - their tweets fetched at read time and merged. Timeline cache: ~800 tweet IDs per user in Redis. Ranking moved from chronological to ML-based (engagement prediction) in 2016.',
    realWorld: 'Twitter: Hybrid model, 500M tweets/day. Instagram: Fan-out on write with ranking. LinkedIn: Fan-out on read for feed diversity. Facebook: Complex aggregation + ranking.',
    gotchas: 'Fan-out on write doesnt scale for follow-heavy graphs (celebrities). Unfollow needs to remove from all timelines - expensive. Mute/block adds complexity to fanout filtering.'
  },
  chat: {
    concepts: ['WebSocket for real-time messaging', 'Message queue for reliability', 'Presence system for online status', 'Message delivery receipts', 'End-to-end encryption option'],
    tradeoffs: [['Component', 'Technology', 'Purpose'], ['Real-time', 'WebSocket', 'Instant delivery'], ['Storage', 'Cassandra', 'Message history'], ['Queue', 'Kafka', 'Reliable delivery']],
    interview: ['How ensure message ordering?', 'How implement E2E encryption?', 'How handle group chats at scale?'],
    deepDive: 'WhatsApp: Each message gets monotonic ID per conversation for ordering. Signal Protocol for E2E: Double Ratchet algorithm rotates keys per message. Presence: Heartbeat every 30s, status cached in Redis with 60s TTL. Group chats: Fan-out to all members, store single copy with pointers. Large groups (1000+): Treat like broadcast channel.',
    realWorld: 'WhatsApp: 100B messages/day, 2B users. Discord: 4M concurrent voice users, millions of concurrent WebSocket connections. Slack: Message ID includes timestamp for ordering.',
    gotchas: 'WebSocket reconnection loses messages without queue backup. Presence at scale is expensive - consider lazy presence (query on demand). E2E encryption prevents server-side search/moderation.'
  },
  payment: {
    concepts: ['Idempotency for duplicate prevention', 'Double-entry bookkeeping', 'PCI compliance for card data', 'Reconciliation processes', 'Fraud detection integration'],
    tradeoffs: [['Aspect', 'Consideration', 'Solution'], ['Consistency', 'Money must balance', 'Transactions'], ['Security', 'PCI DSS', 'Tokenization'], ['Latency', 'User experience', 'Async processing']],
    interview: ['How ensure exactly-once payment?', 'What is PCI compliance?', 'How handle refunds?'],
    deepDive: 'Idempotency key (UUID from client) stored with each payment attempt. If retry hits same key, return original result. Double-entry: Every transaction creates 2 entries (debit + credit) that must balance. Stripe/Adyen tokenize cards so you never see raw card numbers (PCI scope reduction). Settlement is async - authorize instantly, capture later, settle in batches.',
    realWorld: 'Stripe: 99.999% uptime, idempotency keys expire after 24h. Square: Real-time fraud scoring on every transaction. PayPal: 2-phase commit for balance transfers.',
    gotchas: 'Never log card numbers. Idempotency window must exceed retry timeout. Refunds can fail months later (chargebacks). Currency handling: always store in smallest unit (cents) to avoid float errors.'
  },
  k8s: {
    concepts: ['Pods: Smallest deployable unit', 'Services: Stable network endpoint', 'Deployments: Declarative updates', 'ConfigMaps/Secrets: Configuration', 'HPA: Auto-scaling'],
    tradeoffs: [['Component', 'Purpose', 'Consideration'], ['Pod', 'Run containers', 'Ephemeral'], ['Deployment', 'Manage replicas', 'Rolling updates'], ['Service', 'Load balance', 'ClusterIP vs LB']],
    interview: ['How does K8s service discovery work?', 'Deployment vs StatefulSet?', 'How handle secrets in K8s?'],
    deepDive: 'Service discovery via DNS: my-service.namespace.svc.cluster.local. StatefulSet gives stable network IDs and ordered deployment - required for databases. Secrets are base64 (not encrypted) by default - use external secret managers (Vault, AWS Secrets Manager). HPA scales on CPU/memory, KEDA scales on custom metrics (queue depth).',
    realWorld: 'Spotify: 4M+ containers. Airbnb: 1000+ services on K8s. Pinterest: Migrated from EC2, 4x better resource efficiency.',
    gotchas: 'Dont use latest tag - pin versions. Resource limits prevent noisy neighbors. Liveness probe failures restart pods - dont make them hit databases. Rolling updates need proper readiness probes.'
  },
  oauth: {
    concepts: ['Authorization not authentication', 'Access tokens for API access', 'Refresh tokens for new access tokens', 'Scopes limit permissions', 'Authorization code flow most secure'],
    tradeoffs: [['Flow', 'Use Case', 'Security'], ['Auth Code', 'Server-side apps', 'Highest'], ['PKCE', 'Mobile/SPA', 'High'], ['Client Credentials', 'Service-to-service', 'Medium']],
    interview: ['Explain OAuth 2.0 auth code flow', 'What is PKCE and why needed?', 'How securely store tokens?'],
    deepDive: 'PKCE prevents auth code interception: client generates random verifier, sends hash in auth request, proves possession when exchanging code. Short-lived access tokens (15min) + long-lived refresh tokens (30 days). Store refresh tokens server-side only. For SPAs: use auth code + PKCE, NOT implicit flow (deprecated). Token rotation: issue new refresh token on each use.',
    realWorld: 'Google: OAuth 2.0 for all APIs. Auth0: Handles token rotation automatically. Okta: PKCE required for all public clients since 2021.',
    gotchas: 'Never store tokens in localStorage (XSS vulnerable). Implicit flow is deprecated - always use auth code + PKCE. Refresh token rotation prevents token theft. Scope creep: request minimum scopes needed.'
  },
  ratelimit: {
    concepts: ['Token bucket: Steady rate with burst', 'Sliding window: Rolling time window', 'Fixed window: Reset at intervals', 'Leaky bucket: Constant output rate', 'Distributed: Redis for shared state'],
    tradeoffs: [['Algorithm', 'Burst', 'Precision'], ['Token Bucket', 'Allows', 'Good'], ['Sliding Window', 'Smooth', 'Excellent'], ['Fixed Window', 'Edge spike', 'Moderate']],
    interview: ['How implement distributed rate limiting?', 'What is sliding window log?', 'Rate limiting for premium users?'],
    deepDive: 'Token bucket: Tokens added at fixed rate, request consumes token, bucket has max capacity for burst. Sliding window counter: Split window into sub-windows, weight by position. Redis MULTI for atomic increment + expire. Rate limit by: IP (simple but NAT issues), user ID (fair but needs auth), API key (trackable). Return headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After.',
    realWorld: 'GitHub: 5000 req/hr authenticated, 60/hr unauthenticated. Stripe: 100 req/sec with automatic retry handling. Twitter: Complex tier system based on endpoint.',
    gotchas: 'Fixed window has 2x burst at window edges. Distributed rate limiting has race conditions - accept some over-limit. Rate limit early (API gateway) not late (database). Dont rate limit health checks.'
  },
  websocket: {
    concepts: ['Full-duplex communication over TCP', 'Persistent connection no polling', 'Starts as HTTP upgrades to WS', 'Low latency real-time messaging', 'Requires connection state management'],
    tradeoffs: [['Aspect', 'WebSocket', 'HTTP Polling'], ['Latency', 'Very low', 'Higher'], ['Server load', 'Connection overhead', 'Request overhead'], ['Scaling', 'Stateful harder', 'Stateless easier']],
    interview: ['How scale WebSocket servers?', 'What is WebSocket heartbeat?', 'How handle reconnection?'],
  },
  cicd: {
    concepts: ['Continuous Integration: Merge and test frequently', 'Continuous Delivery: Always deployable', 'Continuous Deployment: Auto-deploy to prod', 'Pipeline stages: Build Test Deploy', 'Artifact versioning and storage'],
    tradeoffs: [['Stage', 'Purpose', 'Failure Impact'], ['Build', 'Compile package', 'Fast feedback'], ['Unit Test', 'Logic validation', 'Catch bugs early'], ['Integration', 'System validation', 'Find integration issues']],
    interview: ['CI vs CD difference?', 'How handle database migrations?', 'What is trunk-based development?'],
    deepDive: 'CI = merge to main frequently (multiple times/day), automated tests catch issues early. CD = every commit is deployable, but human triggers prod. Continuous Deployment = auto-deploy to prod on green tests. Trunk-based dev: Short-lived branches (<1 day), feature flags for incomplete work. Database migrations: run before deploy, make backward compatible, never delete columns immediately.',
    realWorld: 'Google: 50K+ commits/day to monorepo, automated testing. Netflix: Full CD with canary analysis. Amazon: Deploy every 11.7 seconds on average. Etsy: Pioneer of CD, 50 deploys/day.',
    gotchas: 'Long-running branches cause merge hell. Flaky tests erode confidence - fix or delete. Database migrations must be reversible. Never deploy Friday afternoon. Feature flags need cleanup process.'
  },
  observability: {
    concepts: ['Logs: Event records what happened', 'Metrics: Numerical measurements how much', 'Traces: Request flow where', 'Correlation IDs link all three', 'SLIs SLOs SLAs for reliability'],
    tradeoffs: [['Pillar', 'Tool', 'Best For'], ['Logs', 'ELK Loki', 'Debugging audit'], ['Metrics', 'Prometheus', 'Alerting dashboards'], ['Traces', 'Jaeger Zipkin', 'Latency analysis']],
    interview: ['Monitoring vs observability?', 'How set SLOs?', 'What is distributed tracing?'],
    deepDive: 'Monitoring = known-unknowns (predefined dashboards). Observability = unknown-unknowns (explore any question). SLI = metric (99th percentile latency). SLO = target (p99 < 200ms). SLA = contract with consequences. Error budgets: If SLO is 99.9%, you have 43 min/month downtime budget. Correlation ID: Generate at edge, propagate through all services via headers.',
    realWorld: 'Google: SRE book defined SLO/SLI framework. Uber: 50M+ spans/sec with Jaeger. Netflix: 2.5B metrics/min. Datadog: $2B+ revenue shows observability demand.',
    gotchas: 'Too many metrics = alert fatigue. Log without context is useless - always include request ID. Sampling is necessary at scale but can miss rare errors. Dont alert on causes (CPU high), alert on symptoms (latency high).'
  },
  cdn: {
    concepts: ['Edge servers cache content close to users', 'Origin server is source of truth', 'PoPs distributed globally', 'Cache-Control headers define behavior', 'Purge/invalidate to update content'],
    tradeoffs: [['Aspect', 'Benefit', 'Challenge'], ['Latency', '10-100x faster', 'Cache warming'], ['Availability', 'Origin offload', 'Stale content risk'], ['Cost', 'Bandwidth savings', 'CDN pricing']],
    interview: ['How invalidate CDN cache globally?', 'Explain CDN cache hierarchy', 'Handle personalized content with CDN?'],
    deepDive: 'Cache hierarchy: Browser -> Edge PoP -> Regional shield -> Origin. Cache-Control: max-age=3600, s-maxage=86400 (CDN caches longer). Vary header for content negotiation (language, device). Purge strategies: Instant purge (expensive), soft purge (serve stale while revalidating), versioned URLs (never purge). Edge computing: Run logic at CDN (Cloudflare Workers, Lambda@Edge).',
    realWorld: 'Netflix: Open Connect CDN delivers 15% of internet traffic. Cloudflare: 300+ cities, 11K+ interconnects. Akamai: Serves 30% of web traffic. Fastly: Instant purge (<150ms global).',
    gotchas: 'Cache-busting with query params can be ignored by some CDNs. Personalized content needs Edge Side Includes or bypass. Long TTLs cause stale content issues during outages. Test cache headers with curl -I.'
  },
  replication: {
    concepts: ['Master-slave: One writer multiple readers', 'Multi-master: Multiple writers with conflict resolution', 'Synchronous: Wait for replica ACK', 'Asynchronous: Fire and forget', 'Semi-sync: At least one replica ACK'],
    tradeoffs: [['Type', 'Consistency', 'Performance'], ['Sync', 'Strong', 'Slower writes'], ['Async', 'Eventual', 'Fast writes'], ['Semi-sync', 'Moderate', 'Balanced']],
    interview: ['How handle replication lag?', 'What is split-brain?', 'When use multi-master?'],
    deepDive: 'Replication lag: Time between master write and replica having data. Read-your-writes: Route user to master for reads after their writes, or use session stickiness. Split-brain: Network partition makes both nodes think they are master - use quorum (majority) to prevent. WAL shipping: Postgres sends write-ahead log to replicas. MySQL: Binary log replication, GTID for tracking position.',
    realWorld: 'GitHub: MySQL with orchestrator for automated failover. Slack: Vitess for sharded MySQL replication. Pinterest: 2000+ MySQL instances with automated failover.',
    gotchas: 'Replication lag can be minutes during high load. Dont read from replica immediately after write. Multi-master conflicts are hard - avoid if possible. Monitor replication lag as key metric. Failover needs connection draining.'
  },
  cqrs: {
    concepts: ['Separate read and write models', 'Event sourcing: Store events not state', 'Projections: Build read models from events', 'Eventually consistent between read/write', 'Different storage for reads vs writes'],
    tradeoffs: [['Aspect', 'Benefit', 'Challenge'], ['Scalability', 'Scale independently', 'Complexity'], ['Performance', 'Optimized models', 'Eventual consistency'], ['Auditability', 'Full event history', 'Storage growth']],
    interview: ['When is CQRS overkill?', 'How handle event schema evolution?', 'What is event replay?'],
    deepDive: 'Event sourcing: Store OrderPlaced, ItemAdded, OrderShipped events, not final state. Rebuild current state by replaying events. Projections: Materialize events into read-optimized views (denormalized, pre-aggregated). Schema evolution: Add fields with defaults, never remove, use versioned events. Snapshots: Store state every N events to speed up replay. Usually overkill for CRUD apps - use for complex domains.',
    realWorld: 'LMAX Exchange: Processes 6M orders/sec with event sourcing. Walmart: Event-driven inventory. Banking: Natural fit for audit trail requirements.',
    gotchas: 'Event schema changes are painful - plan for evolution. Storage grows forever. Eventual consistency confuses users (I just ordered, where is it?). Dont use CQRS/ES for simple CRUD - massive overkill.'
  },
  sqlnosql: {
    concepts: ['ACID vs BASE consistency models', 'Schema vs schemaless flexibility', 'Vertical vs horizontal scaling', 'Joins vs denormalization', 'SQL for complex queries NoSQL for scale'],
    tradeoffs: [['Criteria', 'SQL', 'NoSQL'], ['Schema', 'Fixed enforced', 'Flexible dynamic'], ['Scaling', 'Vertical', 'Horizontal'], ['Consistency', 'ACID', 'Eventually consistent']],
    interview: ['How decide SQL vs NoSQL?', 'Can you use both in same system?', 'What is polyglot persistence?'],
    deepDive: 'SQL excels at: Complex joins, ACID transactions, ad-hoc queries, strong consistency. NoSQL excels at: Massive scale, flexible schema, high write throughput, geographic distribution. Key insight: Most apps need both (polyglot persistence). Document DB (MongoDB): Nested objects, flexible schema. Wide-column (Cassandra): Time-series, high write volume. Graph (Neo4j): Relationships are first-class. Key-value (Redis): Simple, blazing fast.',
    realWorld: 'Uber: PostgreSQL for trip data + Cassandra for GPS traces. Airbnb: MySQL + Elasticsearch + Redis. Netflix: Cassandra (500+ clusters), PostgreSQL, ElasticSearch. Instagram: PostgreSQL heavily sharded.',
    gotchas: 'NoSQL doesnt mean no schema - it means schema in application code. Joins in app code are slower than DB joins. Eventual consistency surprises users. Migration between SQL and NoSQL is painful - choose wisely early.'
  },
  queue: {
    concepts: ['Decouples producers and consumers', 'At-least-once vs at-most-once delivery', 'FIFO ordering guarantees', 'Dead letter queue for failures', 'Visibility timeout prevents duplicates'],
    tradeoffs: [['Delivery', 'Guarantee', 'Trade-off'], ['At-most-once', 'May lose messages', 'Highest performance'], ['At-least-once', 'May duplicate', 'Most common'], ['Exactly-once', 'No loss/dupe', 'Complex slower']],
    interview: ['How handle poison messages?', 'RabbitMQ vs Kafka?', 'How ensure message ordering?'],
    deepDive: 'At-least-once requires idempotent consumers (processing same message twice is safe). Visibility timeout: Message invisible to others while being processed, returns to queue if not ACKed. FIFO: SQS FIFO guarantees order but 300 msg/sec limit. Message grouping: Messages with same group ID processed in order. Exactly-once: Kafka transactions or deduplication at consumer.',
    realWorld: 'AWS SQS: 30+ billion messages/day at Amazon. RabbitMQ: Millions of deployments, AMQP protocol. Apache Kafka: When you need replay and ordering. Redis Streams: Lightweight, built into Redis.',
    gotchas: 'Standard queues can reorder messages. Visibility timeout must exceed max processing time. Poison messages need DLQ. Queue depth is key metric - alert on growth. Batch operations improve throughput 10x.'
  },
  pubsub: {
    concepts: ['Publishers send to topics', 'Subscribers receive from topics', 'Fan-out: One message to many', 'Decouples sender from receiver', 'Supports broadcast and filtering'],
    tradeoffs: [['Aspect', 'Pub/Sub', 'Point-to-Point'], ['Delivery', 'All subscribers', 'One consumer'], ['Coupling', 'Very loose', 'Moderate'], ['Use case', 'Events notifications', 'Task queues']],
    interview: ['How handle subscriber failures?', 'Fan-out vs fan-in?', 'How does Google Pub/Sub guarantee delivery?'],
    deepDive: 'Fan-out: One event triggers multiple actions (order placed -> send email, update inventory, notify seller). Push vs Pull: Push delivers immediately, Pull lets consumer control rate. At-least-once: Pub/Sub acks at subscriber level, redelivers on failure. Ordering: Google Pub/Sub ordering keys group related messages. Filtering: Server-side filters reduce bandwidth.',
    realWorld: 'Google Pub/Sub: 1M+ messages/sec, global replication. AWS SNS: 300B+ notifications daily. Redis Pub/Sub: Simple, real-time, but no persistence. Apache Pulsar: Unified messaging and streaming.',
    gotchas: 'Pub/Sub usually at-least-once - consumers must be idempotent. No persistence in basic pub/sub - use with queue for durability. Slow subscribers can cause backpressure. Subscription filters help but add latency.'
  },
  saga: {
    concepts: ['Sequence of local transactions', 'Compensating transactions for rollback', 'Choreography: Events trigger next step', 'Orchestration: Central coordinator', 'Eventually consistent across services'],
    tradeoffs: [['Type', 'Pros', 'Cons'], ['Choreography', 'Loose coupling', 'Hard to track'], ['Orchestration', 'Clear flow', 'Single point']],
    interview: ['When use saga vs 2PC?', 'How handle saga failures?', 'What is Outbox pattern?'],
    deepDive: '2PC requires all services available, holds locks - doesnt scale. Saga commits locally, publishes event, next service continues. Compensating = undo (RefundPayment, RestoreInventory). Choreography: Services react to events, hard to track overall status. Orchestration: Central service calls each step, easier monitoring. Outbox pattern: Write event to DB table, separate process publishes - ensures DB write and event publish are atomic.',
    realWorld: 'Uber: Orchestrated sagas for ride booking. Airbnb: Choreographed booking flow. Amazon: Saga for order fulfillment across warehouses.',
    gotchas: 'Compensating transactions must be implemented for every step. Sagas can leave system in partial state during execution. Need correlation ID to track saga instance. Some actions cant be compensated (sent email) - design around it.'
  },
  dlq: {
    concepts: ['Capture failed messages for analysis', 'Prevent blocking main queue', 'Manual or automatic retry', 'Alerting on DLQ depth', 'Message inspection and replay'],
    tradeoffs: [['Strategy', 'Pros', 'Cons'], ['Immediate DLQ', 'No blocking', 'May lose retriable'], ['Retry then DLQ', 'Better success', 'Delayed failure'], ['Exponential backoff', 'Handles transient', 'Complex timing']],
    interview: ['How decide retry count before DLQ?', 'How replay DLQ messages?', 'What causes poison messages?'],
    deepDive: 'Poison messages: Malformed data, schema mismatch, bug in consumer. Retry strategy: 3 retries with exponential backoff (1s, 5s, 25s) then DLQ. DLQ processing: Manual inspection, fix bug, replay messages. Automated replay: Careful - same bug will send back to DLQ. Include original timestamp, retry count, error message with DLQ message.',
    realWorld: 'AWS SQS: Built-in DLQ support with redrive policy. RabbitMQ: Dead letter exchange pattern. Kafka: Custom DLQ topic implementation.',
    gotchas: 'DLQ grows silently - must alert on depth > 0. Replaying DLQ can cause duplicate processing. Dont auto-retry indefinitely - poison message infinite loop. Log why message failed before sending to DLQ.'
  },
  serverless: {
    concepts: ['Function as a Service FaaS', 'Event-driven execution', 'Pay per invocation', 'Auto-scaling to zero', 'Cold start latency'],
    tradeoffs: [['Aspect', 'Serverless', 'Containers'], ['Scaling', 'Automatic', 'Manual/HPA'], ['Cost', 'Pay per use', 'Always running'], ['Cold start', 'Yes 100ms-3s', 'No']],
    interview: ['How reduce cold start latency?', 'When is serverless not appropriate?', 'How handle DB connections?'],
    deepDive: 'Cold start: Loading runtime + code + dependencies. Reduce by: Smaller packages, provisioned concurrency, keep warm with scheduled pings. Connection pooling is hard - use RDS Proxy or connection pooling services. Execution limits: 15 min max (Lambda), 128MB-10GB RAM. Good for: Event processing, APIs, scheduled tasks. Bad for: Long-running, WebSocket, high-frequency calls.',
    realWorld: 'Netflix: Encoding pipelines. Coca-Cola: Vending machine payments. iRobot: Roomba cloud processing. AWS Lambda: Billions of invocations/day across customers.',
    gotchas: 'Cold starts in VPC are worse (ENI attachment). Dont put complex logic in Lambda - hard to debug. Watch out for recursive invocations (Lambda triggers itself). Cost can exceed containers at high scale. 15 min timeout is hard limit.'
  },
  bff: {
    concepts: ['Backend specific to frontend needs', 'Aggregate multiple services', 'Optimize for client mobile web', 'Reduce over-fetching', 'Handle auth and formatting'],
    tradeoffs: [['Approach', 'Pros', 'Cons'], ['Shared BFF', 'Less code', 'Compromises'], ['Per-client BFF', 'Optimized', 'Duplication'], ['GraphQL', 'Flexible queries', 'Complexity']],
    interview: ['When use BFF vs GraphQL?', 'How handle versioning with BFF?', 'How avoid BFF becoming monolith?'],
    deepDive: 'Mobile needs less data (bandwidth), different formats (pagination). BFF aggregates 5 microservice calls into 1 response. Per-platform BFF: iOS, Android, Web each get optimized backend. GraphQL as BFF: Client specifies exactly what fields needed. BFF owns: Response formatting, field filtering, auth token handling, error mapping.',
    realWorld: 'SoundCloud: Coined the term BFF. Netflix: Per-device experience teams. Spotify: Mobile and web BFFs. Airbnb: Moved from BFF to federated GraphQL.',
    gotchas: 'BFF becomes bottleneck if not scaled. Easy for business logic to creep in - keep it thin. Multiple BFFs means duplicated effort. Consider GraphQL federation as alternative to multiple BFFs.'
  },
  servicemesh: {
    concepts: ['Sidecar proxy per service Envoy', 'mTLS for service-to-service', 'Traffic management routing retry', 'Observability built-in', 'Control plane + data plane'],
    tradeoffs: [['Aspect', 'With Mesh', 'Without'], ['Security', 'mTLS everywhere', 'Manual TLS'], ['Observability', 'Automatic', 'Per-service'], ['Complexity', 'Higher', 'Lower']],
    interview: ['When is service mesh overkill?', 'How does mTLS work in Istio?', 'Sidecar vs sidecarless mesh?'],
    deepDive: 'Sidecar (Envoy) intercepts all traffic, adds security/observability without code changes. mTLS: Each pod gets certificate, all communication encrypted and authenticated. Traffic management: Canary routing (10% to v2), retry policies, circuit breakers. Sidecarless (Cilium): eBPF-based, less overhead but fewer features. Control plane (Istiod): Manages config, certificates, policy.',
    realWorld: 'Uber: 4000+ microservices on custom mesh. Lyft: Created Envoy, open-sourced. eBay: Istio for 2000+ services. Shopify: Moved to Linkerd for simplicity.',
    gotchas: 'Adds 2-3ms latency per hop. Debugging is harder (is it my code or the mesh?). Resource overhead: Sidecar uses CPU/memory per pod. Start simple - adopt mesh when you have 50+ services, not before.'
  },
  jwt: {
    concepts: ['Header.Payload.Signature structure', 'Stateless authentication', 'Claims contain user info', 'Signed JWS or encrypted JWE', 'Short-lived with refresh token'],
    tradeoffs: [['Aspect', 'JWT', 'Session'], ['Storage', 'Client-side', 'Server-side'], ['Scalability', 'Excellent', 'Requires shared store'], ['Revocation', 'Difficult', 'Easy']],
    interview: ['How handle JWT revocation?', 'What should be in a JWT?', 'How implement token refresh?'],
    deepDive: 'JWT contains: Header (algorithm), Payload (claims: sub, exp, iat, custom), Signature. Signed with HS256 (shared secret) or RS256 (public/private keys). RS256 allows verification without secret. Short-lived (15 min) + refresh token (30 days) pattern. Revocation strategies: Short expiry, token blacklist (Redis), token versioning (increment on logout). Never put sensitive data in payload - its base64, not encrypted.',
    realWorld: 'Auth0: JWTs for millions of apps. Okta: RS256 with JWKS endpoint. Firebase: JWTs with 1-hour expiry.',
    gotchas: 'JWTs cant be revoked without blacklist. Large JWTs (many claims) add bandwidth per request. Dont use JWT for session management in traditional web apps. HS256 requires same secret everywhere - RS256 better for microservices.'
  },
  sso: {
    concepts: ['Single auth for multiple apps', 'Identity Provider IdP centralized', 'SAML for enterprise OIDC for modern', 'Session management across apps', 'Single logout challenge'],
    tradeoffs: [['Protocol', 'Use Case', 'Complexity'], ['SAML 2.0', 'Enterprise legacy', 'High'], ['OIDC', 'Modern apps', 'Medium'], ['OAuth 2.0', 'API access', 'Medium']],
    interview: ['SAML vs OIDC when to use each?', 'How implement single logout?', 'What is session fixation?'],
    deepDive: 'SAML: XML-based, enterprise-focused, assertion contains user attributes. OIDC: JSON-based, built on OAuth 2.0, ID token is JWT. SSO flow: App redirects to IdP, user authenticates, IdP returns token/assertion, app creates session. Single logout: Notify all apps to invalidate sessions - hard because apps might be offline. Session fixation: Attacker sets session ID before auth - regenerate session on login.',
    realWorld: 'Okta: 17,000+ enterprise customers. Google Workspace: SAML for enterprise apps. Auth0: OIDC for modern apps. Microsoft Entra: Hybrid SAML/OIDC.',
    gotchas: 'SAML clock skew causes auth failures. Single logout often partial - some apps miss the memo. IdP is single point of failure. Test SSO flows with multiple browsers/devices. Session timeout sync across apps is tricky.'
  },
  rbac: {
    concepts: ['Users assigned to roles', 'Roles contain permissions', 'Permissions grant access', 'Role hierarchy for inheritance', 'Separation of duties'],
    tradeoffs: [['Model', 'Flexibility', 'Complexity'], ['RBAC', 'Moderate', 'Low'], ['ABAC', 'High', 'High'], ['ReBAC', 'High', 'Medium']],
    interview: ['RBAC vs ABAC when to use each?', 'How handle role explosion?', 'What is relationship-based access control?']
  },
  consensus: {
    concepts: ['Distributed agreement on single value', 'Raft: Leader-based easier to understand', 'Paxos: Classic algorithm complex', 'Leader election and log replication', 'Quorum-based decision making'],
    tradeoffs: [['Algorithm', 'Complexity', 'Use Case'], ['Raft', 'Moderate', 'etcd Consul'], ['Paxos', 'High', 'Chubby Spanner'], ['ZAB', 'Moderate', 'ZooKeeper']],
    interview: ['Explain Raft leader election', 'What happens during network partition?', 'How does Raft handle log conflicts?']
  },
  distlock: {
    concepts: ['Single lock holder at a time', 'TTL prevents deadlocks', 'Fencing tokens prevent stale locks', 'Redlock for distributed Redis', 'Compare-and-swap for atomicity'],
    tradeoffs: [['Implementation', 'Safety', 'Complexity'], ['Single Redis', 'Low', 'Low'], ['Redlock', 'Medium', 'Medium'], ['ZooKeeper', 'High', 'High']],
    interview: ['What is Redlock algorithm?', 'How handle lock expiration?', 'What is a fencing token?']
  },
  bluegreen: {
    concepts: ['Two identical production environments', 'Switch traffic at load balancer', 'Instant rollback by switching back', 'Zero downtime deployments', 'Requires double infrastructure'],
    tradeoffs: [['Aspect', 'Blue-Green', 'Rolling'], ['Downtime', 'Zero', 'Zero'], ['Rollback', 'Instant', 'Gradual'], ['Infrastructure', '2x cost', '1x cost']],
    interview: ['How handle database schema changes?', 'Blue-green vs canary?', 'How handle stateful services?'],
    deepDive: 'Blue (current) serves all traffic. Green (new) deployed and tested. Switch DNS or load balancer when ready. Rollback = switch back. Database challenge: Both versions must work with same schema during switch. Strategy: Expand then contract - add columns/tables first, deploy v2, then remove old columns. CloudFront, Elastic Beanstalk support native blue-green.',
    realWorld: 'LinkedIn: Blue-green for inversion of dependencies. Netflix: Full blue-green with Spinnaker. AWS: Elastic Beanstalk swap URLs in seconds.',
    gotchas: 'Double infrastructure cost during deploy. Database migrations must be backward compatible. Long-running requests may fail during switch. Session state must be externalized (Redis). DNS TTL affects switch speed.'
  },
  canary: {
    concepts: ['Deploy to small subset first 1-5%', 'Gradually increase if healthy', 'Monitor error rates and latency', 'Automatic rollback on failure', 'Feature flags can control rollout'],
    tradeoffs: [['Phase', 'Traffic', 'Purpose'], ['Canary', '1-5%', 'Catch critical issues'], ['Early Adopters', '10-25%', 'Broader validation'], ['Full', '100%', 'Complete rollout']],
    interview: ['How define success metrics for canary?', 'What is progressive delivery?', 'Canary for database changes?'],
    deepDive: 'Canary analysis compares metrics between baseline and canary: Error rate, latency p50/p99, saturation. Automated rollback if canary metrics are N% worse than baseline. Kayenta (Netflix) does statistical analysis. Progressive delivery: Canary -> 5% -> 25% -> 50% -> 100% with gates between stages. Feature flags enable canary without infrastructure changes.',
    realWorld: 'Google: 0.1% canary before any production change. Netflix: Kayenta for automated canary analysis. Spotify: Squad-level canary releases. Uber: Canary with automatic rollback.',
    gotchas: 'Need enough traffic for statistical significance. Sticky sessions can route same users to canary repeatedly. Database changes still affect all traffic. Monitor business metrics not just technical (conversion rate).'
  },
  indexing: {
    concepts: ['B-Tree: Balanced tree for range queries', 'Hash index: O(1) exact lookups', 'GIN/GiST: Full-text and spatial', 'Covering index: Include non-key columns', 'Partial index: Subset of rows'],
    tradeoffs: [['Index Type', 'Best For', 'Trade-off'], ['B-Tree', 'Range sorting', 'Write overhead'], ['Hash', 'Equality', 'No range queries'], ['GIN', 'Full-text arrays', 'Slow updates']],
    interview: ['When use covering index?', 'How identify missing indexes?', 'What is index bloat?'],
    deepDive: 'B-Tree: Default, supports =, <, >, BETWEEN, ORDER BY. Covering index: INCLUDE columns to avoid table lookup (index-only scan). Partial index: WHERE status=active - smaller, faster for common queries. Composite index: Column order matters - leftmost prefix used. EXPLAIN ANALYZE to see index usage. pg_stat_user_indexes shows unused indexes.',
    realWorld: 'Slack: Careful indexing for message search performance. GitHub: Partial indexes for active repositories. Shopify: Covering indexes for product queries.',
    gotchas: 'Too many indexes slow writes. Index column order matters - (a,b) wont help WHERE b=X. LIKE %pattern% cant use B-Tree (need GIN/trigram). Bloated indexes need REINDEX. NULL values: Index may or may not include depending on config.'
  },
  pagination: {
    concepts: ['Offset-based: Simple but slow for large offsets', 'Cursor-based: Consistent performant', 'Keyset: Use last seen value', 'Page token: Encoded cursor', 'Total count considerations'],
    tradeoffs: [['Type', 'Consistency', 'Performance'], ['Offset', 'Poor', 'Degrades'], ['Cursor', 'Good', 'Constant'], ['Keyset', 'Good', 'Constant']],
    interview: ['Why is offset pagination problematic at scale?', 'How handle cursor pagination with filters?', 'How does Stripe implement pagination?'],
    deepDive: 'Offset: OFFSET 10000 still scans 10000 rows then discards. Keyset: WHERE id > last_seen_id ORDER BY id LIMIT 20 - uses index efficiently. Cursor: Encode (last_id, sort_values) as opaque token. Client passes cursor, server decodes and queries. Total count: COUNT(*) expensive - consider approximate or cache. Bidirectional: Store both after and before cursors.',
    realWorld: 'Stripe: Cursor-based with has_more flag. Slack: Cursor for message history. GraphQL: Connections spec (edges, nodes, pageInfo). Twitter: since_id/max_id for timeline.',
    gotchas: 'Keyset breaks if sort column has duplicates - add secondary sort (id). Cursor must be tamper-proof (sign or encrypt). Dont expose internal IDs in cursor. Offset needed for jump to page N - hybrid approach.'
  },
  versioning: {
    concepts: ['URL path versioning /v1/users', 'Header versioning Accept-Version', 'Query param ?version=1', 'Semantic versioning for APIs', 'Deprecation strategy'],
    tradeoffs: [['Strategy', 'Pros', 'Cons'], ['URL path', 'Clear cacheable', 'URL changes'], ['Header', 'Clean URLs', 'Hidden harder debug'], ['Query param', 'Easy to test', 'Not RESTful']],
    interview: ['How deprecate API versions?', 'How does Stripe handle versioning?', 'Breaking vs non-breaking changes?']
  },
  webhooks: {
    concepts: ['Push-based notifications vs polling', 'HTTP callbacks on events', 'Retry on failure with backoff', 'Signature verification for security', 'Idempotency keys for deduplication'],
    tradeoffs: [['Aspect', 'Webhooks', 'Polling'], ['Latency', 'Real-time', 'Up to interval'], ['Resources', 'Server push', 'Constant requests'], ['Reliability', 'Need retry logic', 'Simple']],
    interview: ['How handle webhook failures?', 'How does Stripe verify webhooks?', 'Webhooks vs WebSockets?'],
    deepDive: 'Signature: HMAC-SHA256(payload, secret) in header - verify to prevent spoofing. Retry: Exponential backoff (1m, 5m, 30m, 2h, 24h) then disable. Idempotency: Include event_id, receiver deduplicates. Ordering: Not guaranteed - use timestamp and handle out-of-order. Best practice: Respond 200 immediately, process async.',
    realWorld: 'Stripe: Signed webhooks with 72-hour retry. GitHub: Webhooks for CI/CD triggers. Shopify: 19 webhook topics for store events.',
    gotchas: 'Webhook endpoints must be fast (<30s timeout). Verify signature before processing. Dont trust payload blindly - fetch fresh data from API. Monitor webhook failures closely. Test with ngrok during development.'
  },
  idempotency: {
    concepts: ['Same request same result', 'Idempotency key identifies operation', 'Store and check before processing', 'TTL on idempotency records', 'Essential for payment systems'],
    tradeoffs: [['Implementation', 'Pros', 'Cons'], ['Database lock', 'Simple', 'Contention'], ['Redis + DB', 'Fast check', 'Complexity'], ['Request hash', 'No client key', 'False positives']],
    interview: ['How long keep idempotency keys?', 'Idempotency for batch operations?', 'Client vs server generated keys?'],
    deepDive: 'Client generates UUID, sends in Idempotency-Key header. Server: Check if key exists -> return cached response. If not, process and store (key, response, created_at). TTL: 24-48 hours typical. Response caching: Store full response to return on retry. Scope: Key unique per user/merchant, not globally.',
    realWorld: 'Stripe: 24-hour idempotency keys, stores full response. PayPal: Similar pattern for payments. AWS: Client tokens for EC2 operations.',
    gotchas: 'Key collision across users is security issue - scope properly. Concurrent requests with same key need locking. Failed requests should be retriable with same key. Dont hash request body as key - order may differ.'
  },
  featureflags: {
    concepts: ['Toggle features without deployment', 'Gradual rollout by percentage', 'User targeting beta users', 'Kill switch for emergencies', 'A/B testing integration'],
    tradeoffs: [['Type', 'Use Case', 'Complexity'], ['Release', 'New feature rollout', 'Low'], ['Experiment', 'A/B testing', 'Medium'], ['Ops', 'Kill switches', 'Low']],
    interview: ['How ensure consistent flag evaluation?', 'How handle flag cleanup?', 'What is feature flag debt?'],
    deepDive: 'Consistent hashing: user_id + flag_name -> deterministic bucket -> same user always gets same variant. Segments: Target by attribute (country, plan, beta user). Kill switch: Flag for graceful degradation (disable feature during outage). Flag lifecycle: Plan removal at creation. SDK evaluation: Client-side (fast but exposed) vs server-side (secure).',
    realWorld: 'LaunchDarkly: $3B+ valuation shows demand. Facebook: Gatekeeper controls all features. Netflix: Server-side flags for A/B testing.',
    gotchas: 'Flag debt: Old flags never removed. Test both flag states in CI. Dont use flags for config that rarely changes. Client-side flags leak feature existence. Too many flags = spaghetti logic.'
  },
  healthcheck: {
    concepts: ['Liveness: Is the process alive?', 'Readiness: Can it accept traffic?', 'Startup: Has it finished initializing?', 'Dependency health aggregation', 'Graceful shutdown handling'],
    tradeoffs: [['Probe', 'Failure Action', 'Use Case'], ['Liveness', 'Restart pod', 'Deadlock crash'], ['Readiness', 'Remove from LB', 'Busy warming'], ['Startup', 'Delay probes', 'Slow init']],
    interview: ['Liveness vs readiness when fails?', 'How handle slow health checks?', 'Pod termination grace period?']
  },
  tracing: {
    concepts: ['Trace: Full request journey across services', 'Span: Single operation within trace', 'Context propagation via headers', 'Sampling for high-volume systems', 'Trace ID correlates logs and metrics'],
    tradeoffs: [['Sampling', 'Coverage', 'Overhead'], ['100%', 'Complete', 'High cost'], ['Head-based', 'Consistent', 'May miss issues'], ['Tail-based', 'Smart', 'Requires buffering']],
    interview: ['Trace vs span vs log?', 'How does context propagation work?', 'Head vs tail-based sampling?']
  },
  searchengine: {
    concepts: ['Inverted index: Term to Documents', 'TF-IDF for relevance scoring', 'Tokenization and stemming', 'Sharding for scale', 'Near real-time indexing'],
    tradeoffs: [['Aspect', 'Elasticsearch', 'Custom'], ['Speed', 'Milliseconds', 'Varies'], ['Features', 'Rich', 'Build yourself'], ['Cost', 'Memory intensive', 'Lower']],
    interview: ['How does inverted index work?', 'How handle search ranking?', 'Elasticsearch vs Solr vs Algolia?']
  },
  notification: {
    concepts: ['Multi-channel: Push Email SMS In-app', 'Priority and rate limiting', 'User preferences management', 'Template rendering', 'Delivery tracking'],
    tradeoffs: [['Channel', 'Reach', 'Cost'], ['Push', 'Opt-in only', 'Low'], ['Email', 'Universal', 'Low'], ['SMS', 'High', 'Medium']],
    interview: ['How handle notification preferences?', 'How prevent notification spam?', 'Push notification delivery guarantees?']
  },
  rideshare: {
    concepts: ['Real-time location tracking', 'Geospatial matching driver-rider', 'Dynamic pricing surge', 'ETA calculation', 'Route optimization'],
    tradeoffs: [['Component', 'Technology', 'Challenge'], ['Location', 'GPS + Cell', 'Battery accuracy'], ['Matching', 'Geospatial index', 'Real-time updates'], ['Pricing', 'ML model', 'Fairness']],
    interview: ['How handle surge pricing fairly?', 'How does Uber calculate ETA?', 'How match riders in UberPool?']
  },
  videostream: {
    concepts: ['Adaptive bitrate streaming ABR', 'CDN for delivery', 'Video transcoding to multiple qualities', 'HLS/DASH protocols', 'Chunked transfer for seeking'],
    tradeoffs: [['Quality', 'Bitrate', 'Use Case'], ['240p', '400 kbps', 'Slow connection'], ['720p', '2.5 Mbps', 'Desktop'], ['1080p', '5 Mbps', 'High quality']],
    interview: ['How does adaptive bitrate work?', 'Live streaming vs VOD?', 'How does YouTube recommend videos?']
  },
  lbtypes: {
    concepts: ['L4: Transport layer TCP/UDP routing', 'L7: Application layer HTTP routing', 'L4 faster less intelligent', 'L7 content-based routing SSL termination', 'Hardware vs software load balancers'],
    tradeoffs: [['Layer', 'Speed', 'Features'], ['L4', 'Very fast', 'Basic routing'], ['L7', 'Moderate', 'Content routing SSL'], ['DNS', 'Fastest', 'No health checks']],
    interview: ['When use L4 vs L7?', 'What is SSL termination?', 'How does AWS ALB differ from NLB?'],
    deepDive: 'L4 sees IP:port only - routes by source/dest, cant inspect content. L7 terminates HTTP, can route by path/header/cookie. SSL termination at L7: Decrypt once at LB, backend uses plain HTTP (or re-encrypt). HAProxy: Both L4/L7. NGINX: L7 focused. AWS NLB: L4, millions req/sec, static IP. AWS ALB: L7, path routing, WebSocket support.',
    realWorld: 'Netflix: Custom L4 + L7 combo. Cloudflare: L7 with WAF at edge. Shopify: OpenResty (NGINX-based) for L7 routing.',
    gotchas: 'L7 sees original client IP (X-Forwarded-For), L4 may need proxy protocol. L7 adds latency (decrypt, inspect, route). Health checks should match layer (L4: TCP check, L7: HTTP check). WebSocket needs L7 with upgrade support.'
  },
  lbalgo: {
    concepts: ['Round Robin: Equal distribution', 'Weighted: Capacity-based distribution', 'Least Connections: Route to least busy', 'IP Hash: Sticky sessions', 'Random: Simple unpredictable'],
    tradeoffs: [['Algorithm', 'Best For', 'Weakness'], ['Round Robin', 'Homogeneous servers', 'Ignores load'], ['Least Conn', 'Varying request times', 'Connection counting'], ['IP Hash', 'Session affinity', 'Uneven distribution']],
    interview: ['How implement sticky sessions?', 'Least connections vs least time?', 'How handle server weights?'],
    deepDive: 'Round Robin: Simple, works when requests are similar duration. Weighted Round Robin: 3:1 weight means 3x requests to larger server. Least Connections: Best when request times vary (some 10ms, some 10s). Least Time: NGINX Plus - considers both connections and response time. IP Hash: SHA(client_ip) % servers - same client always hits same server. Power of Two Choices: Pick 2 random servers, choose least loaded.',
    realWorld: 'Google: Custom least-loaded with local preference. Netflix: Weighted based on real-time metrics. HAProxy: Supports all algorithms with health-aware routing.',
    gotchas: 'Sticky sessions break horizontal scaling benefits. Least connections needs accurate connection counting. Server removal causes all IP hash users to remap. Consider slow-start for new servers (gradually increase traffic).'
  },
  monomicro: {
    concepts: ['Monolith: Single deployable unit', 'Microservices: Independent services', 'Start monolith extract later', 'Team size affects architecture', 'Distributed systems complexity'],
    tradeoffs: [['Aspect', 'Monolith', 'Microservices'], ['Deployment', 'Simple all-or-nothing', 'Complex independent'], ['Scaling', 'Whole app', 'Per service'], ['Development', 'Faster initially', 'Team autonomy']],
    interview: ['When decompose monolith?', 'How define service boundaries?', 'What is distributed monolith?']
  },
  bulkhead: {
    concepts: ['Isolate failures to compartments', 'Thread pool per dependency', 'Prevent cascade failures', 'Named after ship compartments', 'Limits blast radius'],
    tradeoffs: [['Isolation', 'Pros', 'Cons'], ['Thread pools', 'Strong isolation', 'Resource overhead'], ['Semaphores', 'Lightweight', 'Weaker isolation'], ['Process', 'Complete isolation', 'Communication cost']],
    interview: ['Bulkhead vs circuit breaker?', 'How size thread pools?', 'What is the bulkhead pattern in Hystrix?']
  },
  backpressure: {
    concepts: ['Signal upstream to slow down', 'Prevent memory exhaustion', 'Reactive streams support', 'Bounded queues with rejection', 'Load shedding strategy'],
    tradeoffs: [['Strategy', 'Behavior', 'Trade-off'], ['Drop oldest', 'Lose stale data', 'Data loss'], ['Drop newest', 'Keep queue stable', 'Reject new work'], ['Block', 'Wait for space', 'Upstream blocked']],
    interview: ['How implement backpressure in Kafka?', 'Backpressure vs rate limiting?', 'What is reactive streams?']
  },
  streamproc: {
    concepts: ['Process data as it arrives', 'Windowing: Time or count based', 'Exactly-once processing', 'State management checkpointing', 'Event time vs processing time'],
    tradeoffs: [['Framework', 'Latency', 'Throughput'], ['Flink', 'Low ms', 'High'], ['Spark Streaming', 'Higher', 'Very high'], ['Kafka Streams', 'Low', 'Medium']],
    interview: ['Event time vs processing time?', 'How handle late events?', 'What is watermarking?']
  },
  mapreduce: {
    concepts: ['Map: Transform input to key-value pairs', 'Shuffle: Group by key', 'Reduce: Aggregate values per key', 'Distributed across cluster', 'Fault tolerant with retries'],
    tradeoffs: [['Aspect', 'MapReduce', 'Spark'], ['Speed', 'Disk-based slower', 'Memory faster'], ['Complexity', 'Simple model', 'Rich APIs'], ['Use case', 'Batch ETL', 'Interactive']],
    interview: ['Explain word count in MapReduce', 'Why is Spark faster?', 'What is the shuffle phase?']
  },
  datapipeline: {
    concepts: ['ETL: Extract Transform Load', 'DAG: Directed acyclic graph of tasks', 'Scheduling and orchestration', 'Data quality checks', 'Idempotent tasks for retries'],
    tradeoffs: [['Tool', 'Best For', 'Complexity'], ['Airflow', 'Complex DAGs', 'High'], ['dbt', 'SQL transforms', 'Medium'], ['Prefect', 'Python native', 'Medium']],
    interview: ['ETL vs ELT?', 'How handle pipeline failures?', 'What is data lineage?']
  },
  multitiercache: {
    concepts: ['L1: In-process cache fastest', 'L2: Distributed cache shared', 'Cache coherence between tiers', 'Write-through or invalidation', 'Different TTLs per tier'],
    tradeoffs: [['Tier', 'Speed', 'Consistency'], ['L1 Local', 'Nanoseconds', 'Node-local only'], ['L2 Redis', 'Milliseconds', 'Shared'], ['L3 CDN', '10s ms', 'Eventually consistent']],
    interview: ['How handle L1 cache invalidation?', 'When use multi-tier?', 'How does Netflix use EVCache?']
  },
  coalescing: {
    concepts: ['Batch duplicate concurrent requests', 'Single flight pattern', 'Prevents thundering herd on cache miss', 'Request deduplication', 'Reduces backend load'],
    tradeoffs: [['Approach', 'Pros', 'Cons'], ['Singleflight', 'Simple effective', 'In-process only'], ['Distributed lock', 'Cross-node', 'Latency overhead'], ['Probabilistic', 'No coordination', 'Some duplicates']],
    interview: ['What is singleflight pattern?', 'How prevent thundering herd?', 'Request coalescing in CDNs?']
  },
  cachewarming: {
    concepts: ['Pre-populate cache before traffic', 'Scheduled warming jobs', 'Warm on deploy or scale', 'Priority-based warming', 'Prevents cold start latency'],
    tradeoffs: [['Strategy', 'Coverage', 'Cost'], ['Full warm', 'Complete', 'High resources'], ['Top N items', 'Most traffic', 'Some misses'], ['On-demand', 'Adaptive', 'Initial latency']],
    interview: ['How prioritize cache warming?', 'Warm cache before deploy?', 'How does Facebook warm caches?']
  },
  secrets: {
    concepts: ['Never commit secrets to code', 'Vault for centralized management', 'Dynamic secrets short-lived', 'Encryption at rest and transit', 'Audit logging for access'],
    tradeoffs: [['Storage', 'Security', 'Complexity'], ['Env vars', 'Low', 'Simple'], ['Secret manager', 'High', 'Medium'], ['Vault', 'Highest', 'Complex']],
    interview: ['How rotate secrets without downtime?', 'What are dynamic secrets?', 'How does Vault work?']
  },
  graceful: {
    concepts: ['Degrade non-critical features', 'Return cached or default data', 'Priority-based load shedding', 'Feature flags for degradation', 'Communicate degraded state to users'],
    tradeoffs: [['Level', 'User Impact', 'System Load'], ['Full service', 'None', 'High'], ['Degraded', 'Reduced features', 'Medium'], ['Maintenance', 'Minimal function', 'Low']],
    interview: ['How decide what to degrade?', 'Graceful degradation vs failover?', 'How does Netflix degrade?']
  },
  sidecar: {
    concepts: ['Helper container alongside main app', 'Handles cross-cutting concerns', 'Logging metrics networking', 'Language agnostic', 'Same lifecycle as main container'],
    tradeoffs: [['Concern', 'Sidecar', 'Library'], ['Language', 'Any', 'Per-language'], ['Overhead', 'Resource cost', 'In-process'], ['Updates', 'Independent', 'Redeploy app']],
    interview: ['What runs in a sidecar?', 'Sidecar vs init container?', 'How does Envoy work as sidecar?']
  },
  strangler: {
    concepts: ['Incrementally replace legacy system', 'Route traffic to new or old', 'Feature by feature migration', 'Facade hides complexity', 'Rollback by changing routes'],
    tradeoffs: [['Approach', 'Risk', 'Speed'], ['Big bang', 'High', 'Fast'], ['Strangler', 'Low', 'Slow'], ['Parallel run', 'Medium', 'Medium']],
    interview: ['How identify strangler boundaries?', 'How handle shared database?', 'What is branch by abstraction?']
  },
  readreplica: {
    concepts: ['Separate read and write databases', 'Master handles writes replicas handle reads', 'Replication lag consideration', 'Read-after-write consistency', 'Geographic distribution'],
    tradeoffs: [['Consistency', 'Behavior', 'Use Case'], ['Sync', 'Strong consistent', 'Critical reads'], ['Async', 'Eventual lag', 'Analytics'], ['Semi-sync', 'At least one sync', 'Balanced']],
    interview: ['How handle replication lag?', 'Read replica vs cache?', 'How route reads to replicas?']
  },
  wal: {
    concepts: ['Write changes to log before applying', 'Crash recovery from log replay', 'Sequential writes fast', 'Checkpointing reduces replay', 'Used by most databases'],
    tradeoffs: [['Aspect', 'Benefit', 'Cost'], ['Durability', 'Survives crash', 'Write amplification'], ['Performance', 'Sequential IO', 'Double write'], ['Recovery', 'Point in time', 'Log storage']],
    interview: ['How does WAL enable crash recovery?', 'WAL vs double write buffer?', 'What is log-structured storage?']
  },
  timeseries: {
    concepts: ['Optimized for time-stamped data', 'High write throughput', 'Automatic downsampling retention', 'Time-based queries efficient', 'Compression for metrics'],
    tradeoffs: [['Database', 'Best For', 'Scale'], ['InfluxDB', 'Metrics DevOps', 'Medium'], ['TimescaleDB', 'SQL compatible', 'Large'], ['Prometheus', 'Kubernetes metrics', 'Medium']],
    interview: ['Time-series vs relational for metrics?', 'How handle high cardinality?', 'What is downsampling?']
  },
  vectorclock: {
    concepts: ['Track causality in distributed systems', 'Vector of counters per node', 'Detect concurrent updates', 'Partial ordering of events', 'Used in eventual consistency'],
    tradeoffs: [['Mechanism', 'Accuracy', 'Overhead'], ['Vector clock', 'Exact causality', 'O(n) space'], ['Version vector', 'Per-key', 'Less space'], ['Lamport clock', 'Total order', 'No concurrency detect']],
    interview: ['Vector clock vs Lamport clock?', 'How detect conflicts?', 'How does DynamoDB use vector clocks?']
  },
  gossip: {
    concepts: ['Peer-to-peer information propagation', 'Each node gossips to random peers', 'Eventually consistent cluster state', 'Failure detection via heartbeats', 'Scalable O(log N) convergence'],
    tradeoffs: [['Aspect', 'Benefit', 'Cost'], ['Scalability', 'Large clusters', 'Bandwidth'], ['Reliability', 'No SPOF', 'Eventual consistency'], ['Simplicity', 'Easy implement', 'Convergence time']],
    interview: ['Push vs pull gossip?', 'How tune gossip parameters?', 'How does Cassandra use gossip?']
  },
  quorum: {
    concepts: ['Read quorum R + Write quorum W > N', 'Guarantees read sees latest write', 'Tunable consistency levels', 'Sloppy quorum for availability', 'Hinted handoff for failures'],
    tradeoffs: [['Config', 'Consistency', 'Availability'], ['R=W=N', 'Strongest', 'Lowest'], ['R+W=N+1', 'Strong', 'Balanced'], ['R=1 W=1', 'Eventual', 'Highest']],
    interview: ['What is sloppy quorum?', 'How does read repair work?', 'R=1 W=N vs R=N W=1?']
  },
  federation: {
    concepts: ['Compose multiple GraphQL services', 'Gateway merges schemas', 'Entity references across services', 'Each service owns its types', 'Single graph for clients'],
    tradeoffs: [['Approach', 'Flexibility', 'Complexity'], ['Monolithic', 'Simple', 'Team coupling'], ['Federation', 'Service ownership', 'Gateway management'], ['Stitching', 'Flexible', 'Manual work']],
    interview: ['Federation vs schema stitching?', 'How handle cross-service queries?', 'What is Apollo Federation?']
  },
  ratedesign: {
    concepts: ['Quotas: Total allowed requests', 'Throttling: Requests per time window', 'Tiers: Different limits per plan', 'Burst allowance: Short-term spike', 'Retry-After headers'],
    tradeoffs: [['Strategy', 'Fairness', 'Complexity'], ['Per user', 'Fair', 'More state'], ['Per API key', 'Trackable', 'Shareable'], ['Per IP', 'Simple', 'NAT issues']],
    interview: ['How design rate limit tiers?', 'Hard vs soft limits?', 'How communicate limits to clients?']
  },
  moderation: {
    concepts: ['AI first pass classification', 'Human review for edge cases', 'Priority queue by severity', 'Appeals process', 'Feedback loop to improve AI'],
    tradeoffs: [['Layer', 'Speed', 'Accuracy'], ['AI only', 'Instant', 'More errors'], ['Human only', 'Slow', 'Accurate'], ['Hybrid', 'Balanced', 'Best quality']],
    interview: ['How scale human review?', 'How handle false positives?', 'How train moderation models?']
  },
  ticketing: {
    concepts: ['Inventory locking with timeout', 'Queue for high demand events', 'Prevent overselling', 'Seat selection with optimistic locking', 'Payment timeout handling'],
    tradeoffs: [['Locking', 'User Experience', 'Inventory Risk'], ['Pessimistic', 'Wait in queue', 'No oversell'], ['Optimistic', 'Fast checkout', 'Cart conflicts'], ['Time-limited hold', 'Balanced', 'Abandoned carts']],
    interview: ['How handle 100K concurrent users?', 'How prevent ticket scalping?', 'How does Ticketmaster queue work?']
  },
  ecommerce: {
    concepts: ['Cart service with session/user binding', 'Inventory with optimistic locking', 'Order service orchestrates checkout', 'Payment integration with idempotency', 'Eventual consistency for non-critical'],
    tradeoffs: [['Component', 'Consistency', 'Availability'], ['Inventory', 'Strong', 'Can reject'], ['Cart', 'Eventual', 'Always available'], ['Orders', 'Strong', 'Retry on failure']],
    interview: ['How prevent overselling?', 'Cart in Redis vs database?', 'How handle payment failures?']
  },
  filestorage: {
    concepts: ['Chunking large files for upload', 'Content-addressable storage hash as key', 'Deduplication saves storage', 'Metadata separate from blobs', 'CDN for frequently accessed'],
    tradeoffs: [['Storage', 'Access', 'Scalability'], ['Object S3', 'HTTP API', 'Unlimited'], ['Block EBS', 'Mount disk', 'Limited'], ['File NFS', 'Mount network', 'Moderate']],
    interview: ['How does Dropbox sync files?', 'Chunking strategy for large files?', 'How implement deduplication?']
  },
  bloom: {
    concepts: ['Probabilistic membership testing', 'No false negatives possible false positives', 'Space efficient vs hash set', 'Multiple hash functions', 'Cannot remove elements'],
    tradeoffs: [['Structure', 'Space', 'False Positive'], ['Bloom filter', 'Very low', 'Yes tunable'], ['Hash set', 'O(n)', 'None'], ['Cuckoo filter', 'Low', 'Yes supports delete']],
    interview: ['When use Bloom filter?', 'How choose optimal size?', 'What is counting Bloom filter?']
  },
  connpool: {
    concepts: ['Reuse database connections', 'Pool maintains min/max connections', 'Connection validation before use', 'Idle timeout releases unused', 'Prevents connection exhaustion'],
    tradeoffs: [['Setting', 'Too Low', 'Too High'], ['Pool size', 'Wait time', 'Resource waste'], ['Idle timeout', 'Cold connections', 'Stale'], ['Max lifetime', 'Reconnects', 'Stale']],
    interview: ['How size connection pool?', 'Pool exhaustion handling?', 'Connection pool vs new connection?']
  },
  gateway: {
    concepts: ['Single entry for all clients', 'Request routing to backends', 'Cross-cutting: Auth rate-limit logging', 'Response aggregation', 'Protocol translation'],
    tradeoffs: [['Aspect', 'With Gateway', 'Without'], ['Complexity', 'Centralized', 'Per-service'], ['Latency', 'Extra hop', 'Direct'], ['Security', 'Single point', 'Distributed']],
    interview: ['API Gateway vs Load Balancer?', 'How handle gateway failures?', 'BFF vs API Gateway?']
  },
  retry: {
    concepts: ['Exponential backoff 1s 2s 4s 8s', 'Jitter prevents thundering herd', 'Max retries prevent infinite loops', 'Only retry idempotent operations', 'Circuit breaker for persistent failures'],
    tradeoffs: [['Strategy', 'Recovery Speed', 'Load'], ['Immediate', 'Fastest', 'May overwhelm'], ['Fixed delay', 'Predictable', 'Suboptimal'], ['Exponential+jitter', 'Adaptive', 'Best practice']],
    interview: ['Why add jitter to backoff?', 'Retry vs circuit breaker?', 'How make operations idempotent?']
  },
  leaderelect: {
    concepts: ['Single leader coordinates work', 'Lease-based with TTL expiration', 'Automatic failover on leader death', 'Prevents split-brain with fencing', 'ZooKeeper ephemeral nodes pattern'],
    tradeoffs: [['Method', 'Consistency', 'Complexity'], ['ZooKeeper', 'Strong', 'High'], ['etcd', 'Strong', 'Medium'], ['Redis', 'Weak', 'Low']],
    interview: ['How prevent split-brain?', 'What is a fencing token?', 'Leader election vs distributed lock?']
  },
  twophase: {
    concepts: ['Coordinator orchestrates distributed tx', 'Phase 1 Prepare: All vote', 'Phase 2 Commit or Abort', 'Blocking protocol', 'Used in distributed databases'],
    tradeoffs: [['Aspect', '2PC', 'Saga'], ['Consistency', 'Strong ACID', 'Eventual'], ['Availability', 'Lower blocking', 'Higher'], ['Performance', 'Slower', 'Faster']],
    interview: ['What if coordinator fails after prepare?', '2PC vs 3PC?', 'When use 2PC vs Saga?']
  },
  apicompare: {
    concepts: ['REST: Resource-based HTTP verbs', 'GraphQL: Query language client-driven', 'gRPC: Binary protocol streaming', 'REST for simple GraphQL for complex', 'gRPC for internal services'],
    tradeoffs: [['Protocol', 'Ease', 'Performance'], ['REST', 'Simple', 'Moderate'], ['GraphQL', 'Flexible', 'Moderate'], ['gRPC', 'Complex', 'Best']],
    interview: ['When choose GraphQL over REST?', 'How handle N+1 in GraphQL?', 'Why is gRPC faster?']
  },
  eventdriven: {
    concepts: ['Services communicate via events', 'Producers and consumers decoupled', 'Event sourcing stores events', 'CQRS often paired', 'Eventually consistent'],
    tradeoffs: [['Aspect', 'Event-Driven', 'Request-Response'], ['Coupling', 'Loose', 'Tight'], ['Latency', 'Higher', 'Lower'], ['Debugging', 'Harder', 'Easier']],
    interview: ['Event sourcing vs event-driven?', 'How handle event ordering?', 'How debug event-driven systems?']
  },
  servicedisco: {
    concepts: ['Services register on startup', 'Clients discover dynamically', 'Health checks remove unhealthy', 'Client-side vs server-side discovery', 'DNS-based vs registry-based'],
    tradeoffs: [['Type', 'Pros', 'Cons'], ['Client-side', 'No proxy hop', 'Client complexity'], ['Server-side', 'Simple clients', 'Extra latency'], ['DNS', 'Standard', 'TTL caching issues']],
    interview: ['Client vs server-side discovery?', 'How handle stale discovery?', 'Consul vs etcd vs ZooKeeper?']
  },
  search: {
    concepts: ['Inverted index maps terms to docs', 'Tokenization and stemming', 'TF-IDF and BM25 ranking', 'Faceted search and filters', 'Fuzzy matching for typos'],
    tradeoffs: [['Engine', 'Strength', 'Weakness'], ['Elasticsearch', 'Full-featured', 'Resource heavy'], ['Algolia', 'Fast hosted', 'Costly at scale'], ['Meilisearch', 'Simple fast', 'Less features']],
    interview: ['How build autocomplete?', 'How handle synonyms?', 'Search relevance tuning?']
  },
  twitter: {
    concepts: ['Fan-out on write for most users', 'Fan-out on read for celebrities', 'Timeline cache per user', 'Social graph for following', 'Tweet ranking by engagement'],
    tradeoffs: [['Approach', 'Write Cost', 'Read Cost'], ['Fan-out Write', 'High for celebs', 'Fast reads'], ['Fan-out Read', 'Low writes', 'Slow reads'], ['Hybrid', 'Balanced', 'Complex logic']],
    interview: ['How handle celebrity tweets?', 'How rank timeline?', 'How design trending topics?']
  },
  video: {
    concepts: ['Upload to object storage', 'Transcoding to multiple formats', 'Adaptive bitrate streaming', 'CDN for global delivery', 'Thumbnail generation'],
    tradeoffs: [['Format', 'Compatibility', 'Size'], ['HLS', 'Best iOS', 'Larger'], ['DASH', 'Universal', 'Medium'], ['MP4', 'Download', 'Fixed quality']],
    interview: ['How handle large uploads?', 'Live vs VOD architecture?', 'How YouTube handles scale?']
  },
  newsfeed: {
    concepts: ['Pull model: Fetch on request', 'Push model: Pre-compute feed', 'Hybrid for high-follower accounts', 'Ranking by relevance and time', 'Infinite scroll pagination'],
    tradeoffs: [['Model', 'Latency', 'Storage'], ['Pull', 'Higher', 'Lower'], ['Push', 'Lower', 'Higher'], ['Hybrid', 'Medium', 'Medium']],
    interview: ['Push vs pull for news feed?', 'How rank feed items?', 'How handle unfollows?']
  },
  socialgraph: {
    concepts: ['Vertices: Users nodes', 'Edges: Relationships connections', 'Graph database for traversal', 'Adjacency list storage', 'Bidirectional vs unidirectional'],
    tradeoffs: [['Storage', 'Best For', 'Weakness'], ['Graph DB', 'Traversal', 'Scale'], ['Relational', 'Simple queries', 'Joins slow'], ['Key-value', 'Fast lookups', 'No traversal']],
    interview: ['How store friend relationships?', 'Mutual friends algorithm?', 'How does LinkedIn do connections?']
  },
  proxy: {
    concepts: ['Forward proxy: Client side', 'Reverse proxy: Server side', 'Caching at proxy layer', 'Load balancing', 'SSL termination'],
    tradeoffs: [['Type', 'Location', 'Use Case'], ['Forward', 'Client side', 'Privacy filtering'], ['Reverse', 'Server side', 'LB caching SSL'], ['Transparent', 'Inline', 'Caching']],
    interview: ['Forward vs reverse proxy?', 'Where terminate SSL?', 'Nginx vs HAProxy?']
  },
  reverseproxy: {
    concepts: ['Sits in front of servers', 'Hides backend topology', 'SSL termination', 'Caching and compression', 'Request routing'],
    tradeoffs: [['Feature', 'Benefit', 'Overhead'], ['SSL termination', 'Offload CPU', 'Decrypt/re-encrypt'], ['Caching', 'Reduce load', 'Memory usage'], ['Compression', 'Bandwidth', 'CPU usage']],
    interview: ['Reverse proxy vs load balancer?', 'How configure caching?', 'When use Nginx vs Envoy?']
  },
  scaling: {
    concepts: ['Vertical: Bigger machine', 'Horizontal: More machines', 'Stateless for easy horizontal', 'Database scaling hardest', 'Auto-scaling based on metrics'],
    tradeoffs: [['Type', 'Pros', 'Cons'], ['Vertical', 'Simple', 'Hardware limits'], ['Horizontal', 'Unlimited', 'Complexity'], ['Auto', 'Cost efficient', 'Cold start']],
    interview: ['When vertical vs horizontal?', 'How make apps stateless?', 'Auto-scaling strategies?']
  },
  longpolling: {
    concepts: ['Client holds connection open', 'Server responds when data ready', 'Reconnect after response or timeout', 'Better than polling', 'Simpler than WebSocket'],
    tradeoffs: [['Method', 'Latency', 'Complexity'], ['Polling', 'High', 'Simple'], ['Long polling', 'Medium', 'Medium'], ['WebSocket', 'Low', 'Higher']],
    interview: ['Long polling vs WebSocket?', 'How handle timeouts?', 'Connection limits?']
  },
  sse: {
    concepts: ['Server-sent events over HTTP', 'Unidirectional server to client', 'Auto-reconnection built in', 'Text-based event stream', 'Simpler than WebSocket'],
    tradeoffs: [['Aspect', 'SSE', 'WebSocket'], ['Direction', 'Server to client', 'Bidirectional'], ['Protocol', 'HTTP', 'WS'], ['Reconnect', 'Automatic', 'Manual']],
    interview: ['SSE vs WebSocket when?', 'How handle reconnection?', 'Browser connection limits?']
  },
  throttling: {
    concepts: ['Limit request rate', 'Protect backend resources', 'Queue or reject excess', 'Per-user or global limits', 'Graceful degradation'],
    tradeoffs: [['Response', 'User Experience', 'Protection'], ['429 reject', 'Clear feedback', 'Immediate'], ['Queue', 'Eventual service', 'Resource usage'], ['Degrade', 'Partial service', 'Complex logic']],
    interview: ['Throttling vs rate limiting?', 'How communicate limits?', 'Throttling strategies?']
  },
  tokenbucket: {
    concepts: ['Bucket holds tokens', 'Tokens added at fixed rate', 'Request consumes tokens', 'Allows burst up to bucket size', 'Smooth rate limiting'],
    tradeoffs: [['Algorithm', 'Burst', 'Smoothness'], ['Token bucket', 'Allows', 'Good'], ['Leaky bucket', 'No burst', 'Smooth'], ['Fixed window', 'Edge burst', 'Simple']],
    interview: ['Token vs leaky bucket?', 'How choose bucket size?', 'Distributed token bucket?']
  },
  optlock: {
    concepts: ['Version number on record', 'Check version before update', 'Fail if version changed', 'No locks held', 'Good for low contention'],
    tradeoffs: [['Locking', 'Contention', 'Consistency'], ['Optimistic', 'Low overhead', 'Retry on conflict'], ['Pessimistic', 'High overhead', 'Strong'], ['None', 'No overhead', 'Lost updates']],
    interview: ['Optimistic vs pessimistic locking?', 'How handle conflicts?', 'Version vs timestamp?']
  },
  softdelete: {
    concepts: ['Mark deleted not remove', 'deleted_at timestamp column', 'Filter in queries', 'Enables undo and audit', 'Periodic hard delete cleanup'],
    tradeoffs: [['Approach', 'Recovery', 'Complexity'], ['Soft delete', 'Easy', 'Query overhead'], ['Hard delete', 'None', 'Simple'], ['Archive table', 'Moderate', 'Data movement']],
    interview: ['Soft vs hard delete?', 'How handle foreign keys?', 'GDPR and soft delete?']
  },
  heartbeat: {
    concepts: ['Periodic signal alive', 'Detect node failures', 'Timeout triggers failover', 'Leader sends or followers send', 'Network partition consideration'],
    tradeoffs: [['Interval', 'Detection Speed', 'Network Load'], ['Short 1s', 'Fast', 'High'], ['Medium 5s', 'Balanced', 'Medium'], ['Long 30s', 'Slow', 'Low']],
    interview: ['How choose heartbeat interval?', 'Heartbeat vs health check?', 'Handle network partition?']
  },
  checksum: {
    concepts: ['Verify data integrity', 'MD5 SHA256 CRC32', 'Detect corruption in transit', 'Stored with data for verification', 'Block-level for large files'],
    tradeoffs: [['Algorithm', 'Speed', 'Security'], ['CRC32', 'Very fast', 'Weak'], ['MD5', 'Fast', 'Broken'], ['SHA256', 'Slower', 'Strong']],
    interview: ['When use which checksum?', 'How verify large files?', 'Checksum vs digital signature?']
  },
  merkle: {
    concepts: ['Tree of hashes', 'Leaf nodes are data hashes', 'Parent is hash of children', 'Efficient difference detection', 'Used in blockchain and sync'],
    tradeoffs: [['Use Case', 'Benefit', 'Overhead'], ['Sync', 'Find differences fast', 'Tree maintenance'], ['Verification', 'Prove membership', 'Storage'], ['Blockchain', 'Tamper evident', 'Compute']],
    interview: ['How Merkle tree enables sync?', 'How verify membership?', 'Merkle tree in Bitcoin?']
  },
  antientropy: {
    concepts: ['Background sync process', 'Compare and repair replicas', 'Uses Merkle trees', 'Handles missed updates', 'Runs periodically'],
    tradeoffs: [['Frequency', 'Consistency', 'Resources'], ['High', 'Better consistency', 'More bandwidth'], ['Low', 'Eventual', 'Less overhead'], ['On-demand', 'Triggered', 'Variable']],
    interview: ['Anti-entropy vs read repair?', 'How Cassandra does repair?', 'When trigger anti-entropy?']
  },
  readrepair: {
    concepts: ['Fix inconsistency on read', 'Compare values from replicas', 'Update stale replicas', 'Opportunistic repair', 'Part of read path'],
    tradeoffs: [['Type', 'Coverage', 'Overhead'], ['Sync', 'All reads', 'Higher latency'], ['Async', 'Background', 'Lower latency'], ['Probabilistic', 'Sampled', 'Lowest']],
    interview: ['Read repair vs anti-entropy?', 'How decide correct value?', 'Read repair latency impact?']
  },
  hintedhandoff: {
    concepts: ['Store writes for down nodes', 'Hints kept by coordinator', 'Replay when node recovers', 'Temporary storage with TTL', 'Improves availability'],
    tradeoffs: [['Aspect', 'Benefit', 'Risk'], ['Availability', 'Accept writes', 'Hint storage'], ['Consistency', 'Eventually sync', 'Delay'], ['Recovery', 'Automatic', 'Hint expiry']],
    interview: ['Hinted handoff vs anti-entropy?', 'What if hints expire?', 'How long keep hints?']
  },
  splitbrain: {
    concepts: ['Network partition divides cluster', 'Multiple leaders possible', 'Data divergence risk', 'Fencing prevents conflicts', 'Quorum avoids split brain'],
    tradeoffs: [['Solution', 'Availability', 'Consistency'], ['Quorum', 'Majority only', 'Strong'], ['Fencing', 'One side only', 'Strong'], ['Allow split', 'Both sides', 'Merge needed']],
    interview: ['How quorum prevents split-brain?', 'What is STONITH?', 'How resolve after partition heals?']
  },
  chaos: {
    concepts: ['Intentionally inject failures', 'Test system resilience', 'Random instance termination', 'Network latency injection', 'Discover weaknesses proactively'],
    tradeoffs: [['Scope', 'Risk', 'Learning'], ['Production', 'Higher', 'Real behavior'], ['Staging', 'Lower', 'May miss issues'], ['Game days', 'Controlled', 'Limited scope']],
    interview: ['Chaos engineering principles?', 'How does Chaos Monkey work?', 'When not to do chaos testing?']
  },
  gitops: {
    concepts: ['Git as single source of truth', 'Declarative infrastructure', 'Pull-based deployment', 'Automatic sync to cluster', 'Audit trail in git history'],
    tradeoffs: [['Aspect', 'GitOps', 'Push-based'], ['Audit', 'Full history', 'Separate logging'], ['Security', 'Pull-based safer', 'Push credentials'], ['Rollback', 'Git revert', 'Manual']],
    interview: ['GitOps vs traditional CI/CD?', 'ArgoCD vs Flux?', 'How handle secrets in GitOps?']
  },
  iac: {
    concepts: ['Infrastructure as code', 'Version controlled infra', 'Terraform CloudFormation Pulumi', 'Declarative vs imperative', 'State management'],
    tradeoffs: [['Tool', 'Cloud', 'Learning'], ['Terraform', 'Multi-cloud', 'Medium'], ['CloudFormation', 'AWS only', 'AWS native'], ['Pulumi', 'Multi-cloud', 'Code-based']],
    interview: ['Terraform vs CloudFormation?', 'How manage state?', 'How handle drift?']
  },
  batch: {
    concepts: ['Process data in chunks', 'Scheduled execution', 'Checkpointing for recovery', 'Parallel processing', 'Idempotent operations'],
    tradeoffs: [['Size', 'Throughput', 'Latency'], ['Large', 'Higher', 'Higher delay'], ['Small', 'Lower', 'More overhead'], ['Adaptive', 'Optimized', 'Complex']],
    interview: ['Batch vs stream processing?', 'How handle failures mid-batch?', 'Batch size optimization?']
  },
  eventloop: {
    concepts: ['Single-threaded execution', 'Non-blocking I/O', 'Callback queue processing', 'Microtasks vs macrotasks', 'Used in Node.js browsers'],
    tradeoffs: [['Model', 'Concurrency', 'CPU-bound'], ['Event loop', 'High I/O', 'Blocks'], ['Thread pool', 'CPU parallel', 'Overhead'], ['Hybrid', 'Balanced', 'Complex']],
    interview: ['How does Node.js event loop work?', 'Blocking vs non-blocking?', 'How handle CPU-intensive tasks?']
  },
  connstate: {
    concepts: ['Track connection status', 'Reconnection logic', 'Exponential backoff on failure', 'State machine pattern', 'Notify subscribers of changes'],
    tradeoffs: [['Strategy', 'Reliability', 'Complexity'], ['Auto-reconnect', 'High', 'Medium'], ['Manual', 'User controlled', 'Simple'], ['Circuit breaker', 'Prevents flood', 'Higher']],
    interview: ['How handle flaky connections?', 'Reconnection strategies?', 'How notify connection state?']
  },
  georouting: {
    concepts: ['Route by user location', 'GeoDNS for global routing', 'Latency-based routing', 'Compliance with data residency', 'Failover across regions'],
    tradeoffs: [['Method', 'Accuracy', 'Complexity'], ['GeoDNS', 'Country level', 'Low'], ['Anycast', 'Network level', 'Medium'], ['App-level', 'Precise', 'High']],
    interview: ['How implement geo-routing?', 'GeoDNS vs anycast?', 'Handle users on VPN?']
  },
  datalocality: {
    concepts: ['Process data where stored', 'Reduce network transfer', 'HDFS data locality', 'Rack awareness', 'Move compute to data'],
    tradeoffs: [['Approach', 'Latency', 'Flexibility'], ['Data local', 'Lowest', 'Constrained'], ['Rack local', 'Low', 'More options'], ['Any node', 'Higher', 'Most flexible']],
    interview: ['Why data locality matters?', 'How HDFS achieves locality?', 'Data locality in Spark?']
  },
  hotcold: {
    concepts: ['Hot: Frequently accessed fast storage', 'Cold: Rarely accessed cheap storage', 'Automatic tiering policies', 'Access patterns drive placement', 'Cost optimization'],
    tradeoffs: [['Tier', 'Cost', 'Latency'], ['Hot SSD', 'High', 'Low ms'], ['Warm HDD', 'Medium', '10s ms'], ['Cold Archive', 'Low', 'Hours']],
    interview: ['How classify hot vs cold?', 'Automatic vs manual tiering?', 'S3 storage classes?']
  },
  contentdelivery: {
    concepts: ['Distribute content globally', 'Edge caching close to users', 'Origin shield reduces origin load', 'Purge and invalidation', 'Dynamic vs static content'],
    tradeoffs: [['Content', 'Cacheability', 'Strategy'], ['Static', 'High', 'Long TTL'], ['Dynamic', 'Low', 'Edge compute'], ['Personalized', 'None', 'Origin only']],
    interview: ['How cache dynamic content?', 'Origin shield benefits?', 'CDN cache invalidation?']
  },
  acid: {
    concepts: ['Atomicity: All or nothing', 'Consistency: Valid state transitions', 'Isolation: Concurrent transactions', 'Durability: Committed data persists', 'Foundation of RDBMS'],
    tradeoffs: [['Property', 'Benefit', 'Cost'], ['Atomicity', 'Rollback on failure', 'Logging overhead'], ['Isolation', 'Correctness', 'Lock contention'], ['Durability', 'Data safety', 'Disk sync']],
    interview: ['ACID vs BASE?', 'Isolation levels explained?', 'How achieve durability?']
  }
};

function generateFlashcards() {
  const cards = [];
  
  Object.entries(content).forEach(function(entry) {
    var key = entry[0];
    var data = entry[1];
    var guide = guides.find(function(g) { return g.diagram === key; });
    if (!guide) return;
    
    if (data.concepts) {
      data.concepts.forEach(function(concept) {
        var parts = concept.split(':');
        if (parts.length > 1) {
          cards.push({
            front: parts[0].trim() + ' (' + guide.title + ')',
            back: parts.slice(1).join(':').trim(),
            tags: 'concept ' + guide.category
          });
        }
      });
    }
    
    if (data.interview) {
      data.interview.forEach(function(q) {
        cards.push({
          front: q,
          back: 'Topic: ' + guide.title,
          tags: 'interview ' + guide.category
        });
      });
    }
  });
  
  guides.forEach(function(guide) {
    cards.push({
      front: 'What is ' + guide.title + '?',
      back: guide.description + ' - Used by: ' + guide.company,
      tags: 'pattern ' + guide.category
    });
  });
  
  return cards;
}

function downloadFlashcards() {
  var cards = generateFlashcards();
  var tsv = '';
  cards.forEach(function(card) {
    var front = card.front.replace(/\t/g, ' ');
    var back = card.back.replace(/\t/g, ' ');
    tsv = tsv + front + '\t' + back + '\t' + card.tags + '\n';
  });
  var blob = new Blob([tsv], { type: 'text/plain' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'system-design-flashcards.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// Quiz question generators
function generateQuizQuestions() {
  const questions = [];
  
  // Type 1: Concept matching - "What pattern is this describing?"
  Object.entries(content).forEach(function(entry) {
    var key = entry[0];
    var data = entry[1];
    var guide = guides.find(function(g) { return g.diagram === key; });
    if (!guide || !data.concepts) return;
    
    var concept = data.concepts[Math.floor(Math.random() * data.concepts.length)];
    var wrongAnswers = guides.filter(function(g) { return g.id !== guide.id; })
      .sort(function() { return Math.random() - 0.5; }).slice(0, 3);
    
    questions.push({
      type: 'concept',
      question: 'Which pattern does this describe: "' + concept + '"?',
      correct: guide.title,
      options: [guide.title].concat(wrongAnswers.map(function(g) { return g.title; }))
        .sort(function() { return Math.random() - 0.5; }),
      category: guide.category
    });
  });
  
  // Type 2: Interview questions
  Object.entries(content).forEach(function(entry) {
    var key = entry[0];
    var data = entry[1];
    var guide = guides.find(function(g) { return g.diagram === key; });
    if (!guide || !data.interview) return;
    
    data.interview.forEach(function(q) {
      questions.push({
        type: 'interview',
        question: q,
        answer: guide.title + ': ' + guide.description,
        category: guide.category,
        patternTitle: guide.title
      });
    });
  });
  
  // Type 3: Pattern identification - "What does X help with?"
  guides.forEach(function(guide) {
    var wrongAnswers = guides.filter(function(g) { return g.category !== guide.category; })
      .sort(function() { return Math.random() - 0.5; }).slice(0, 3);
    
    questions.push({
      type: 'identify',
      question: 'What problem does "' + guide.title + '" solve?',
      correct: guide.description,
      options: [guide.description].concat(wrongAnswers.map(function(g) { return g.description; }))
        .sort(function() { return Math.random() - 0.5; }),
      category: guide.category
    });
  });
  
  return questions.sort(function() { return Math.random() - 0.5; });
}

function Quiz({ onSelectGuide, quizStats, setQuizStats }) {
  const [mode, setMode] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);

  const startQuiz = function(type, count) {
    var allQ = generateQuizQuestions();
    var filtered = type === 'all' ? allQ : allQ.filter(function(q) { return q.type === type; });
    setQuestions(filtered.slice(0, count || 10));
    setCurrentQ(0);
    setSelected(null);
    setShowAnswer(false);
    setScore(0);
    setAnswered(0);
    setStreak(0);
    setMode(type);
  };

  const handleAnswer = function(option) {
    if (showAnswer) return;
    setSelected(option);
    setShowAnswer(true);
    setAnswered(answered + 1);
    
    var q = questions[currentQ];
    var isCorrect = q.type === 'interview' ? true : option === q.correct;
    
    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
    
    // Update persistent stats
    setQuizStats(function(prev) {
      return {
        totalAnswered: (prev.totalAnswered || 0) + 1,
        totalCorrect: (prev.totalCorrect || 0) + (isCorrect ? 1 : 0),
        bestStreak: Math.max(prev.bestStreak || 0, isCorrect ? streak + 1 : streak)
      };
    });
  };

  const nextQuestion = function() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      setMode('results');
    }
  };

  // Mode selection screen
  if (!mode) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            🧠 Quiz <span style={{ background: 'linear-gradient(135deg, #f472b6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mode</span>
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Test your system design knowledge</p>
        </div>

        {quizStats.totalAnswered > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22d3ee' }}>{quizStats.totalAnswered}</div>
              <div style={{ fontSize: '0.75rem', color: '#71717a' }}>Questions</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4ade80' }}>{Math.round((quizStats.totalCorrect / quizStats.totalAnswered) * 100)}%</div>
              <div style={{ fontSize: '0.75rem', color: '#71717a' }}>Accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f472b6' }}>{quizStats.bestStreak}</div>
              <div style={{ fontSize: '0.75rem', color: '#71717a' }}>Best Streak</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '1rem' }}>
          <button onClick={function() { startQuiz('concept', 10); }} style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(34,211,238,0.1) 0%, rgba(34,211,238,0.05) 100%)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#22d3ee', marginBottom: '0.25rem' }}>🎯 Concept Match</div>
            <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Match concepts to the correct pattern</div>
          </button>
          
          <button onClick={function() { startQuiz('identify', 10); }} style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(74,222,128,0.1) 0%, rgba(74,222,128,0.05) 100%)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#4ade80', marginBottom: '0.25rem' }}>🔍 Pattern Identification</div>
            <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Identify what problem each pattern solves</div>
          </button>
          
          <button onClick={function() { startQuiz('interview', 10); }} style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(167,139,250,0.1) 0%, rgba(167,139,250,0.05) 100%)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#a78bfa', marginBottom: '0.25rem' }}>💼 Interview Practice</div>
            <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Practice answering real interview questions</div>
          </button>
          
          <button onClick={function() { startQuiz('all', 20); }} style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(251,146,60,0.1) 0%, rgba(251,146,60,0.05) 100%)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fb923c', marginBottom: '0.25rem' }}>🔥 Mixed Challenge</div>
            <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>20 random questions from all types</div>
          </button>
        </div>
      </div>
    );
  }

  // Results screen
  if (mode === 'results') {
    var percentage = Math.round((score / questions.length) * 100);
    var grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';
    var gradeColor = percentage >= 80 ? '#4ade80' : percentage >= 60 ? '#fbbf24' : '#f87171';
    
    return (
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quiz Complete!</h2>
        
        <div style={{ fontSize: '4rem', fontWeight: 700, color: gradeColor, marginBottom: '0.5rem' }}>{grade}</div>
        <div style={{ fontSize: '1.2rem', color: '#a1a1aa', marginBottom: '1.5rem' }}>{score} / {questions.length} correct ({percentage}%)</div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={function() { setMode(null); }} style={{ padding: '0.75rem 1.5rem', background: '#22d3ee', border: 'none', borderRadius: '8px', color: '#09090b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
            Try Again
          </button>
          <button onClick={function() { startQuiz('all', 20); }} style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fafafa', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
            New Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz question screen
  if (!questions.length || !questions[currentQ]) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#a1a1aa' }}>Loading questions...</p>
        <button onClick={function() { setMode(null); }} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#22d3ee', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Back</button>
      </div>
    );
  }
  
  var q = questions[currentQ];
  var cat = categories.find(function(c) { return c.id === q.category; }) || { color: '#22d3ee', icon: '📝', name: 'General' };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button onClick={function() { setMode(null); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>← Exit</button>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {streak >= 3 && <span style={{ color: '#f472b6', fontSize: '0.85rem' }}>🔥 {streak} streak!</span>}
          <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>{currentQ + 1} / {questions.length}</span>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: cat.color + '20', color: cat.color, borderRadius: '6px' }}>{cat.icon} {cat.name}</span>
          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', color: '#a1a1aa', borderRadius: '6px' }}>
            {q.type === 'concept' ? '🎯 Concept' : q.type === 'identify' ? '🔍 Identify' : '💼 Interview'}
          </span>
        </div>
        
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fafafa', lineHeight: 1.5 }}>{q.question}</h3>
      </div>

      {q.type === 'interview' ? (
        <div>
          {!showAnswer ? (
            <button onClick={function() { handleAnswer(null); }} style={{ width: '100%', padding: '1rem', background: '#a78bfa', border: 'none', borderRadius: '8px', color: '#09090b', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
              Reveal Answer
            </button>
          ) : (
            <div>
              <div style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#a78bfa', marginBottom: '0.5rem', fontWeight: 600 }}>Related Pattern:</div>
                <div style={{ color: '#fafafa', fontSize: '0.95rem' }}>{q.patternTitle}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={nextQuestion} style={{ flex: 1, padding: '0.75rem', background: '#22d3ee', border: 'none', borderRadius: '8px', color: '#09090b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                  {currentQ < questions.length - 1 ? 'Next Question →' : 'See Results'}
                </button>
                <button onClick={function() { var guide = guides.find(function(g) { return g.title === q.patternTitle; }); if (guide) onSelectGuide(guide); }} style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fafafa', fontSize: '0.9rem', cursor: 'pointer' }}>
                  📖 Study
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {q.options.map(function(option, i) {
            var isCorrect = option === q.correct;
            var isSelected = option === selected;
            var bgColor = !showAnswer ? 'rgba(255,255,255,0.03)' : isCorrect ? 'rgba(74,222,128,0.15)' : isSelected ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.03)';
            var borderColor = !showAnswer ? 'rgba(255,255,255,0.1)' : isCorrect ? '#4ade80' : isSelected ? '#f87171' : 'rgba(255,255,255,0.1)';
            
            return (
              <button key={i} onClick={function() { handleAnswer(option); }} disabled={showAnswer} style={{ padding: '1rem', background: bgColor, border: '1px solid ' + borderColor, borderRadius: '8px', color: '#fafafa', fontSize: '0.9rem', textAlign: 'left', cursor: showAnswer ? 'default' : 'pointer', opacity: showAnswer && !isCorrect && !isSelected ? 0.5 : 1 }}>
                <span style={{ marginRight: '0.75rem', color: '#71717a' }}>{String.fromCharCode(65 + i)}.</span>
                {option}
                {showAnswer && isCorrect && <span style={{ marginLeft: '0.5rem' }}>✓</span>}
                {showAnswer && isSelected && !isCorrect && <span style={{ marginLeft: '0.5rem' }}>✗</span>}
              </button>
            );
          })}
          
          {showAnswer && (
            <button onClick={nextQuestion} style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#22d3ee', border: 'none', borderRadius: '8px', color: '#09090b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              {currentQ < questions.length - 1 ? 'Next Question →' : 'See Results'}
            </button>
          )}
        </div>
      )}

      <div style={{ marginTop: '1rem', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: ((currentQ + 1) / questions.length * 100) + '%', background: '#22d3ee', borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

const roadmap = {
  beginner: {
    title: 'Foundations',
    icon: '🌱',
    color: '#4ade80',
    time: '~15 hours',
    description: 'Core concepts every engineer should know',
    modules: [
      { name: 'Caching Basics', patterns: [1, 2, 3], desc: 'Understand how caching improves performance' },
      { name: 'Database Fundamentals', patterns: [4, 5, 6], desc: 'SQL, NoSQL, and when to use each' },
      { name: 'Load Balancing 101', patterns: [11, 12], desc: 'Distribute traffic across servers' },
      { name: 'API Essentials', patterns: [36, 38, 39], desc: 'REST, pagination, and versioning' },
      { name: 'Basic Security', patterns: [27, 28], desc: 'JWT auth and rate limiting' },
    ]
  },
  intermediate: {
    title: 'Building Blocks',
    icon: '🔧',
    color: '#60a5fa',
    time: '~25 hours',
    description: 'Patterns for scalable distributed systems',
    modules: [
      { name: 'Message Queues', patterns: [15, 16, 17, 19], desc: 'Async communication patterns' },
      { name: 'Distributed Data', patterns: [30, 31, 80], desc: 'CAP theorem, consistent hashing, quorum' },
      { name: 'Microservices', patterns: [20, 21, 72, 73], desc: 'Service architecture patterns' },
      { name: 'Resilience', patterns: [14, 58, 69], desc: 'Circuit breakers and graceful degradation' },
      { name: 'DevOps Patterns', patterns: [41, 42, 43, 44], desc: 'CI/CD, blue-green, canary deploys' },
      { name: 'Observability', patterns: [46, 68, 71], desc: 'Logs, metrics, traces, health checks' },
    ]
  },
  advanced: {
    title: 'Expert Level',
    icon: '🚀',
    color: '#a78bfa',
    time: '~35 hours',
    description: 'Complex systems and real-world designs',
    modules: [
      { name: 'Distributed Consensus', patterns: [32, 33, 34, 35], desc: 'Raft, distributed locks, 2PC' },
      { name: 'Event-Driven', patterns: [7, 18, 25, 60], desc: 'CQRS, saga, event sourcing' },
      { name: 'Advanced Infra', patterns: [22, 23, 24, 29], desc: 'Serverless, BFF, service mesh, SSO' },
      { name: 'Real-World: Social', patterns: [48, 49, 52], desc: 'Twitter feed, chat, notifications' },
      { name: 'Real-World: Commerce', patterns: [51, 54, 55, 57], desc: 'Uber, payments, e-commerce, ticketing' },
      { name: 'Real-World: Media', patterns: [47, 50, 53, 56], desc: 'URL shortener, video, search, storage' },
    ]
  }
};

function Roadmap({ completed, onToggleComplete, onSelectGuide }) {
  const levels = ['beginner', 'intermediate', 'advanced'];
  const totalPatterns = Object.values(roadmap).flatMap(l => l.modules.flatMap(m => m.patterns)).length;
  const completedCount = completed.size;
  const progress = Math.round((completedCount / totalPatterns) * 100);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          🗺️ Learning <span style={{ background: 'linear-gradient(135deg, #4ade80, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Roadmap</span>
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1rem' }}>Master system design step by step</p>
        
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem', maxWidth: 400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Overall Progress</span>
            <span style={{ fontSize: '0.85rem', color: '#22d3ee', fontWeight: 600 }}>{completedCount}/{totalPatterns} patterns</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: progress + '%', background: 'linear-gradient(90deg, #4ade80, #60a5fa, #a78bfa)', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#52525b' }}>{progress}% complete</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {levels.map((levelKey, levelIndex) => {
          const level = roadmap[levelKey];
          const levelPatterns = level.modules.flatMap(m => m.patterns);
          const levelCompleted = levelPatterns.filter(p => completed.has(p)).length;
          const levelProgress = Math.round((levelCompleted / levelPatterns.length) * 100);
          const prevLevelComplete = levelIndex === 0 || 
            roadmap[levels[levelIndex - 1]].modules.flatMap(m => m.patterns).every(p => completed.has(p));

          return (
            <div key={levelKey} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', opacity: prevLevelComplete ? 1 : 0.5 }}>
              <div style={{ padding: '1rem 1.25rem', background: level.color + '10', borderBottom: '1px solid ' + level.color + '30', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>{level.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: level.color }}>{level.title}</h2>
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: level.color + '20', color: level.color, borderRadius: '10px' }}>{level.time}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{level.description}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: level.color }}>{levelProgress}%</div>
                  <div style={{ fontSize: '0.7rem', color: '#71717a' }}>{levelCompleted}/{levelPatterns.length}</div>
                </div>
              </div>
              
              <div style={{ padding: '1rem' }}>
                {level.modules.map((module, mi) => {
                  const moduleCompleted = module.patterns.filter(p => completed.has(p)).length;
                  const isModuleComplete = moduleCompleted === module.patterns.length;
                  
                  return (
                    <div key={mi} style={{ marginBottom: mi < level.modules.length - 1 ? '1rem' : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isModuleComplete ? level.color : 'rgba(255,255,255,0.1)', color: isModuleComplete ? '#09090b' : '#71717a', fontSize: '0.7rem', fontWeight: 600 }}>
                          {isModuleComplete ? '✓' : mi + 1}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fafafa' }}>{module.name}</span>
                        <span style={{ fontSize: '0.7rem', color: '#52525b' }}>({moduleCompleted}/{module.patterns.length})</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#71717a', marginLeft: '1.75rem', marginBottom: '0.5rem' }}>{module.desc}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginLeft: '1.75rem' }}>
                        {module.patterns.map(patternId => {
                          const guide = guides.find(g => g.id === patternId);
                          if (!guide) return null;
                          const cat = categories.find(c => c.id === guide.category);
                          const isComplete = completed.has(patternId);
                          
                          return (
                            <div key={patternId} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.5rem', background: isComplete ? level.color + '20' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (isComplete ? level.color + '50' : 'rgba(255,255,255,0.08)'), borderRadius: '6px', fontSize: '0.7rem' }}>
                              <button onClick={() => onToggleComplete(patternId)} style={{ width: 14, height: 14, borderRadius: '3px', border: '1px solid ' + (isComplete ? level.color : '#52525b'), background: isComplete ? level.color : 'transparent', color: '#09090b', fontSize: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                {isComplete && '✓'}
                              </button>
                              <span onClick={() => onSelectGuide(guide)} style={{ cursor: 'pointer', color: isComplete ? level.color : '#a1a1aa' }}>{guide.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(34,211,238,0.1) 0%, rgba(167,139,250,0.1) 100%)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: '#22d3ee' }}>📤 Export Study Materials</h3>
          <button onClick={downloadFlashcards} style={{ padding: '0.6rem 1rem', background: '#22d3ee', border: 'none', borderRadius: '8px', color: '#09090b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
            🎴 Export Flashcards (Anki)
          </button>
          <p style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '0.5rem' }}>
            350+ cards with concepts, interview Qs, and pattern definitions
          </p>
        </div>
        
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fafafa' }}>📋 Status</h3>
          <div style={{ fontSize: '0.8rem', color: '#71717a' }}>
            <div style={{ marginBottom: '0.25rem', color: '#4ade80' }}>✓ 113 patterns with diagrams</div>
            <div style={{ marginBottom: '0.25rem', color: '#4ade80' }}>✓ All 113 patterns with content</div>
            <div style={{ marginBottom: '0.25rem', color: '#4ade80' }}>✓ Anki flashcard export</div>
            <div style={{ color: '#52525b' }}>○ Quiz mode (coming soon)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuideDetail({ guide, onBack, completed, onToggleComplete }) {
  const cat = categories.find(c => c.id === guide.category);
  const guideContent = content[guide.diagram] || {};
  const isComplete = completed?.has(guide.id);
  
  return (
    <div style={{ maxWidth: 850, margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}>← Back</button>
        <button onClick={() => onToggleComplete(guide.id)} style={{ background: isComplete ? '#4ade8020' : 'rgba(255,255,255,0.05)', border: '1px solid ' + (isComplete ? '#4ade80' : 'rgba(255,255,255,0.1)'), color: isComplete ? '#4ade80' : '#a1a1aa', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}>
          {isComplete ? '✓ Completed' : '○ Mark Complete'}
        </button>
      </div>
      <span style={{ display: 'inline-block', background: `${cat?.color}20`, color: cat?.color, padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.6rem' }}>{cat?.icon} {cat?.name}</span>
      <h1 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fafafa' }}>{guide.title}</h1>
      <p style={{ fontSize: '0.95rem', color: '#a1a1aa', marginBottom: '0.8rem' }}>{guide.description}</p>
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ background: `${cat?.color}10`, border: `1px solid ${cat?.color}30`, borderRadius: '6px', padding: '0.4rem 0.7rem', fontSize: '0.8rem', color: '#d4d4d8' }}>🏢 {guide.company}</div>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.4rem 0.7rem', fontSize: '0.8rem', color: '#a1a1aa' }}>⏱ {guide.readTime}</div>
      </div>
      
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
        <Diagram type={guide.diagram} color={cat?.color} />
      </div>
      
      {guideContent.concepts && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fafafa', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>💡 Key Concepts</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {guideContent.concepts.map((concept, i) => (
              <li key={i} style={{ padding: '0.5rem 0.75rem', marginBottom: '0.4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: `3px solid ${cat?.color}`, fontSize: '0.85rem', color: '#d4d4d8' }}>{concept}</li>
            ))}
          </ul>
        </div>
      )}
      
      {guideContent.tradeoffs && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fafafa', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⚖️ Trade-offs</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr>{guideContent.tradeoffs[0].map((h, i) => <th key={i} style={{ textAlign: 'left', padding: '0.6rem', background: `${cat?.color}15`, color: cat?.color, fontWeight: 600, borderBottom: `1px solid ${cat?.color}30` }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {guideContent.tradeoffs.slice(1).map((row, i) => (
                  <tr key={i}>{row.map((cell, j) => <td key={j} style={{ padding: '0.5rem 0.6rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: j === 0 ? '#fafafa' : '#a1a1aa' }}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {guideContent.deepDive && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fafafa', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🔬 Deep Dive</h2>
          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(34,211,238,0.02) 100%)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#d4d4d8', lineHeight: 1.7 }}>{guideContent.deepDive}</div>
        </div>
      )}
      
      {guideContent.realWorld && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fafafa', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🏢 Real-World Usage</h2>
          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(74,222,128,0.08) 0%, rgba(74,222,128,0.02) 100%)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#d4d4d8', lineHeight: 1.7 }}>{guideContent.realWorld}</div>
        </div>
      )}
      
      {guideContent.gotchas && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fafafa', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⚠️ Common Pitfalls</h2>
          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(251,146,60,0.08) 0%, rgba(251,146,60,0.02) 100%)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#d4d4d8', lineHeight: 1.7 }}>{guideContent.gotchas}</div>
        </div>
      )}
      
      {guideContent.interview && (
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fafafa', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🎯 Interview Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {guideContent.interview.map((q, i) => (
              <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(251,146,60,0.05) 100%)', borderRadius: '6px', fontSize: '0.85rem', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>❓ {q}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SystemDesignPage() {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeTab, setActiveTab] = useState('guides');
  const [completed, setCompleted] = useState(new Set());
  const [quizStats, setQuizStats] = useState({ totalAnswered: 0, totalCorrect: 0, bestStreak: 0 });

  // Load from persistent storage on mount
  useEffect(function() {
    if (typeof window !== 'undefined' && window.storage) {
      window.storage.get('sd-completed').then(function(result) {
        if (result && result.value) {
          try {
            setCompleted(new Set(JSON.parse(result.value)));
          } catch(e) {}
        }
      }).catch(function() {});
      
      window.storage.get('sd-quiz-stats').then(function(result) {
        if (result && result.value) {
          try {
            setQuizStats(JSON.parse(result.value));
          } catch(e) {}
        }
      }).catch(function() {});
    }
  }, []);

  // Save completed to persistent storage
  var toggleComplete = function(id) {
    setCompleted(function(prev) {
      var next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      
      if (typeof window !== 'undefined' && window.storage) {
        try {
          window.storage.set('sd-completed', JSON.stringify(Array.from(next)));
        } catch (e) {}
      }
      
      return next;
    });
  };

  // Save quiz stats to persistent storage
  var updateQuizStats = function(updater) {
    setQuizStats(function(prev) {
      var next = typeof updater === 'function' ? updater(prev) : updater;
      
      if (typeof window !== 'undefined' && window.storage) {
        try {
          window.storage.set('sd-quiz-stats', JSON.stringify(next));
        } catch (e) {}
      }
      
      return next;
    });
  };

  const filteredGuides = guides.filter(g => {
    const matchCat = !selectedCategory || g.category === selectedCategory;
    const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (selectedGuide) {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', color: '#fafafa', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 211, 238, 0.1), transparent)', pointerEvents: 'none' }} />
        <GuideDetail guide={selectedGuide} onBack={() => setSelectedGuide(null)} completed={completed} onToggleComplete={toggleComplete} />
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap'); * { margin: 0; padding: 0; box-sizing: border-box; }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fafafa', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 211, 238, 0.1), transparent)', pointerEvents: 'none' }} />
      
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0.6rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem', fontWeight: 600 }}>
              <span style={{ color: '#22d3ee' }}>◆</span> SystemDesign<span style={{ color: '#22d3ee' }}>.guide</span>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: '8px' }}>
              <button onClick={() => setActiveTab('guides')} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none', background: activeTab === 'guides' ? '#22d3ee' : 'transparent', color: activeTab === 'guides' ? '#09090b' : '#a1a1aa', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>📚 Guides</button>
              <button onClick={() => setActiveTab('roadmap')} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none', background: activeTab === 'roadmap' ? '#22d3ee' : 'transparent', color: activeTab === 'roadmap' ? '#09090b' : '#a1a1aa', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>🗺️ Roadmap</button>
              <button onClick={() => setActiveTab('quiz')} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none', background: activeTab === 'quiz' ? '#22d3ee' : 'transparent', color: activeTab === 'quiz' ? '#09090b' : '#a1a1aa', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>🧠 Quiz</button>
            </div>
          </div>
          {activeTab === 'guides' && (
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 180, padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fafafa', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }} />
          )}
        </div>
      </header>

      {activeTab === 'quiz' ? (
        <Quiz onSelectGuide={setSelectedGuide} quizStats={quizStats} setQuizStats={updateQuizStats} />
      ) : activeTab === 'roadmap' ? (
        <Roadmap completed={completed} onToggleComplete={toggleComplete} onSelectGuide={setSelectedGuide} />
      ) : (
        <>
          <section style={{ textAlign: 'center', padding: '1.5rem 1.5rem 1rem', maxWidth: 600, margin: '0 auto' }}>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, marginBottom: '0.6rem' }}>
              Master <span style={{ background: 'linear-gradient(135deg, #22d3ee, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>System Design</span>
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>{guides.length} interactive diagrams • {completed.size} completed</p>
          </section>

          <main style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem 2rem', display: 'grid', gridTemplateColumns: '170px 1fr', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
            <aside>
              <h3 style={{ fontSize: '0.65rem', fontWeight: 600, color: '#52525b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Categories</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <button onClick={() => setSelectedCategory(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.6rem', background: !selectedCategory ? 'rgba(255,255,255,0.05)' : 'transparent', border: !selectedCategory ? '1px solid #22d3ee' : '1px solid transparent', borderRadius: '6px', color: !selectedCategory ? '#fafafa' : '#71717a', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', textAlign: 'left' }}>
                  📚 All <span style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '0.1rem 0.3rem', background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}>{guides.length}</span>
                </button>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.6rem', background: selectedCategory === cat.id ? 'rgba(255,255,255,0.05)' : 'transparent', border: selectedCategory === cat.id ? `1px solid ${cat.color}` : '1px solid transparent', borderRadius: '6px', color: selectedCategory === cat.id ? '#fafafa' : '#71717a', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', textAlign: 'left' }}>
                    {cat.icon} {cat.name}
                    <span style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '0.1rem 0.3rem', background: `${cat.color}25`, color: cat.color, borderRadius: '6px' }}>{guides.filter(g => g.category === cat.id).length}</span>
                  </button>
                ))}
              </div>
            </aside>

            <section>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: '#22d3ee' }}>◈</span>
                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'All Guides'}
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#52525b', fontWeight: 400 }}>{filteredGuides.length}</span>
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.8rem' }}>
                {filteredGuides.map(guide => {
                  const cat = categories.find(c => c.id === guide.category);
                  const isHovered = hoveredCard === guide.id;
                  const isComplete = completed.has(guide.id);
                  return (
                    <article key={guide.id} onClick={() => setSelectedGuide(guide)} onMouseEnter={() => setHoveredCard(guide.id)} onMouseLeave={() => setHoveredCard(null)} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: `1px solid ${isHovered ? cat?.color : isComplete ? '#4ade8050' : 'rgba(255,255,255,0.06)'}`, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', transform: isHovered ? 'translateY(-2px)' : 'none', position: 'relative' }}>
                      {isComplete && <span style={{ position: 'absolute', top: 6, right: 6, fontSize: '0.6rem', padding: '0.1rem 0.3rem', background: '#4ade8020', color: '#4ade80', borderRadius: '4px' }}>✓</span>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.4rem', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${cat?.color}20`, borderRadius: '7px' }}>{guide.image}</span>
                        <span style={{ fontSize: '0.5rem', padding: '0.1rem 0.3rem', borderRadius: '4px', border: `1px solid ${cat?.color}50`, color: cat?.color }}>{cat?.name}</span>
                      </div>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: '#fafafa' }}>{guide.title}</h3>
                      <p style={{ fontSize: '0.7rem', color: '#71717a', lineHeight: 1.4, marginBottom: '0.4rem' }}>{guide.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', color: '#52525b' }}>⏱ {guide.readTime}</span>
                        <span style={{ fontSize: '0.6rem', color: '#52525b' }}>🏢 {guide.company}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </main>
        </>
      )}

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1rem', textAlign: 'center' }}>
        <p style={{ color: '#3f3f46', fontSize: '0.7rem' }}>SystemDesign.guide • {guides.length} patterns • {completed.size} completed</p>
      </footer>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap'); * { margin: 0; padding: 0; box-sizing: border-box; }`}</style>
    </div>
  );
}