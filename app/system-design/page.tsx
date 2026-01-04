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
  { id: 'cloud', name: 'Cloud', icon: '☁️', color: '#38bdf8' },
  { id: 'resources', name: 'Resources', icon: '📚', color: '#94a3b8' },
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
  { id: 114, title: 'Thunder Herd', description: 'Cache expiration stampede problem', category: 'caching', readTime: '6 min', image: '🐘', company: 'Facebook', diagram: 'thunderherd' },
  { id: 115, title: 'Cache Penetration', description: 'Non-existent data attacks', category: 'caching', readTime: '5 min', image: '🎯', company: 'Redis', diagram: 'cachepenetration' },
  { id: 116, title: 'Cache Breakdown', description: 'Hot key expiration handling', category: 'caching', readTime: '5 min', image: '💥', company: 'Redis', diagram: 'cachebreakdown' },
  { id: 117, title: 'Cache Crash', description: 'Recovery strategies & warmup', category: 'caching', readTime: '6 min', image: '🔄', company: 'Memcached', diagram: 'cachecrash' },
  { id: 118, title: '8 Caching Levels', description: 'Multi-tier caching architecture', category: 'caching', readTime: '8 min', image: '📊', company: 'Netflix', diagram: 'cachinglevels' },
  { id: 119, title: 'K8s Architecture', description: 'Control plane & worker nodes', category: 'devops', readTime: '10 min', image: '☸️', company: 'CNCF', diagram: 'k8sarchitecture' },
  { id: 120, title: 'K8s Patterns', description: 'Top 10 Kubernetes design patterns', category: 'devops', readTime: '12 min', image: '🎨', company: 'Red Hat', diagram: 'k8spatterns' },
  { id: 121, title: 'K8s Tools Stack', description: 'Kubernetes ecosystem tools', category: 'devops', readTime: '8 min', image: '🛠️', company: 'CNCF', diagram: 'k8stools' },
  { id: 122, title: 'Container Security', description: 'Image scanning & pod security', category: 'security', readTime: '7 min', image: '🔒', company: 'Aqua', diagram: 'containersecurity' },
  { id: 123, title: 'OSI Model', description: '7 layers of network communication', category: 'distributed', readTime: '8 min', image: '🌐', company: 'ISO', diagram: 'osimodel' },
  { id: 124, title: 'HTTP Status Codes', description: 'Complete guide to 1xx-5xx codes', category: 'api', readTime: '6 min', image: '📊', company: 'IETF', diagram: 'httpstatus' },
  { id: 125, title: 'SSL/TLS Handshake', description: 'HTTPS connection establishment', category: 'security', readTime: '7 min', image: '🔐', company: 'Cloudflare', diagram: 'sslhandshake' },
  { id: 126, title: 'SSH Protocol', description: 'Secure shell architecture', category: 'security', readTime: '6 min', image: '🔑', company: 'OpenSSH', diagram: 'sshprotocol' },
  { id: 127, title: 'IPv4 vs IPv6', description: 'Address format comparison', category: 'distributed', readTime: '5 min', image: '🔢', company: 'IANA', diagram: 'ipv4v6' },
  { id: 128, title: 'TCP vs UDP', description: 'When to use each protocol', category: 'distributed', readTime: '6 min', image: '📡', company: 'Various', diagram: 'tcpudp' },
  { id: 129, title: 'Network Protocols', description: 'Top 8 protocols explained', category: 'distributed', readTime: '8 min', image: '🌍', company: 'IETF', diagram: 'netprotocols' },
  { id: 130, title: 'OAuth 2.0 Flows', description: 'Authorization Code, Client Credentials, PKCE', category: 'security', readTime: '10 min', image: '🔐', company: 'Google', diagram: 'oauth2flows' },
  { id: 131, title: 'Session vs Token', description: 'Session, Cookie, JWT comparison', category: 'security', readTime: '8 min', image: '🎫', company: 'Auth0', diagram: 'sessiontoken' },
  { id: 132, title: 'Data Protection', description: 'Encoding vs Encryption vs Tokenization', category: 'security', readTime: '7 min', image: '🔒', company: 'Stripe', diagram: 'dataprotection' },
  { id: 133, title: 'DevSecOps', description: 'SAST, DAST, IaC security pipeline', category: 'security', readTime: '9 min', image: '🛡️', company: 'Snyk', diagram: 'devsecops' },
  { id: 134, title: 'Security Domains', description: '12 security domains cheat sheet', category: 'security', readTime: '12 min', image: '📋', company: 'OWASP', diagram: 'securitydomains' },
  { id: 135, title: 'API Security', description: 'OWASP API Top 10, injection prevention', category: 'security', readTime: '8 min', image: '⚠️', company: 'Cloudflare', diagram: 'apisecurity' },
  { id: 136, title: 'API Auth Methods', description: 'API Keys, OAuth, JWT, Basic Auth', category: 'security', readTime: '7 min', image: '🔑', company: 'AWS', diagram: 'apiauthmethods' },
  { id: 137, title: 'DB Data Structures', description: 'Skiplist, SSTable, LSM Tree, B-Tree', category: 'database', readTime: '10 min', image: '🌲', company: 'LevelDB', diagram: 'dbdatastructures' },
  { id: 138, title: 'SQL Optimization', description: 'Execution plans, index strategies', category: 'database', readTime: '8 min', image: '⚡', company: 'PostgreSQL', diagram: 'sqloptimization' },
  { id: 139, title: 'DB Transactions', description: 'ACID, isolation levels, deadlocks', category: 'database', readTime: '9 min', image: '🔄', company: 'MySQL', diagram: 'dbtransactions' },
  { id: 140, title: '6 Database Models', description: 'Flat, Hierarchical, Relational, Star, Snowflake', category: 'database', readTime: '8 min', image: '📐', company: 'Various', diagram: 'dbmodels' },
  { id: 141, title: 'Sharding Guide', description: 'Range, Hash, Consistent Hashing, Virtual Buckets', category: 'database', readTime: '10 min', image: '🔀', company: 'Vitess', diagram: 'shardingguide' },
  { id: 142, title: 'PostgreSQL Ecosystem', description: 'Extensions: Timescale, pgVector, PostGIS', category: 'database', readTime: '8 min', image: '🐘', company: 'PostgreSQL', diagram: 'pgecosystem' },
  { id: 143, title: 'Microservices Practices', description: '9 best practices for microservices', category: 'architecture', readTime: '10 min', image: '🧩', company: 'Netflix', diagram: 'micropractices' },
  { id: 144, title: 'Production Components', description: '9 essential components for production', category: 'architecture', readTime: '9 min', image: '🏭', company: 'Uber', diagram: 'prodcomponents' },
  { id: 145, title: 'Service Discovery', description: 'Consul, Eureka, DNS-based discovery', category: 'architecture', readTime: '7 min', image: '🔎', company: 'HashiCorp', diagram: 'servicediscovery' },
  { id: 146, title: 'Distributed Tracing', description: 'Jaeger, Zipkin, OpenTelemetry', category: 'devops', readTime: '8 min', image: '🔍', company: 'Uber', diagram: 'disttracing' },
  { id: 147, title: 'Heartbeat Detection', description: '6 mechanisms for failure detection', category: 'distributed', readTime: '7 min', image: '💓', company: 'ZooKeeper', diagram: 'heartbeatdetect' },
  { id: 148, title: 'Communication Patterns', description: 'Sync vs Async, Choreography vs Orchestration', category: 'architecture', readTime: '8 min', image: '📡', company: 'Various', diagram: 'commpatterns' },
  { id: 149, title: 'Cloud Service Comparison', description: 'AWS vs Azure vs GCP - 25+ services mapped', category: 'cloud', readTime: '12 min', image: '☁️', company: 'Multi-cloud', diagram: 'cloudcompare' },
  { id: 150, title: 'Disaster Recovery', description: 'Backup, Pilot Light, Warm Standby, Hot Standby', category: 'cloud', readTime: '10 min', image: '🔄', company: 'AWS', diagram: 'disasterrecovery' },
  { id: 151, title: 'Cloud Cost Reduction', description: '6 strategies for cloud cost optimization', category: 'cloud', readTime: '8 min', image: '💰', company: 'FinOps', diagram: 'cloudcost' },
  { id: 152, title: 'AWS Learning Roadmap', description: 'Services categorized by domain', category: 'cloud', readTime: '15 min', image: '🗺️', company: 'AWS', diagram: 'awsroadmap' },
  { id: 153, title: 'Cloud Load Balancers', description: 'AWS vs Azure vs GCP LB selection guide', category: 'cloud', readTime: '8 min', image: '⚖️', company: 'Multi-cloud', diagram: 'cloudlb' },
  { id: 154, title: 'Netflix Tech Stack', description: 'Complete architecture: Mobile, Web, Spring Boot, Cassandra', category: 'realworld', readTime: '15 min', image: '🎬', company: 'Netflix', diagram: 'netflixstack' },
  { id: 155, title: 'Netflix API Evolution', description: 'Monolith → Gateway → GraphQL Federation', category: 'realworld', readTime: '12 min', image: '📈', company: 'Netflix', diagram: 'netflixapi' },
  { id: 156, title: 'Discord Architecture', description: 'MongoDB → Cassandra → ScyllaDB evolution', category: 'realworld', readTime: '12 min', image: '💬', company: 'Discord', diagram: 'discordarch' },
  { id: 157, title: 'Redis Architecture', description: 'Data structures, persistence, clustering, sentinel', category: 'database', readTime: '10 min', image: '🔴', company: 'Redis', diagram: 'redisarch' },
  { id: 158, title: 'Uber Tech Stack', description: 'Real-time systems, mapping, dispatch architecture', category: 'realworld', readTime: '14 min', image: '🚗', company: 'Uber', diagram: 'uberstack' },
  { id: 159, title: '12-Factor App', description: 'Cloud-native application principles', category: 'architecture', readTime: '12 min', image: '📋', company: 'Heroku', diagram: 'twelvefactor' },
  { id: 160, title: 'SDLC Models', description: '8 software development lifecycle models', category: 'architecture', readTime: '10 min', image: '🔄', company: 'Various', diagram: 'sdlcmodels' },
  { id: 161, title: 'Design Patterns', description: 'GoF patterns cheat sheet', category: 'architecture', readTime: '15 min', image: '🎨', company: 'Various', diagram: 'designpatterns' },
  { id: 162, title: 'System Trade-offs', description: '10 key system design trade-offs', category: 'architecture', readTime: '10 min', image: '⚖️', company: 'Various', diagram: 'tradeoffs' },
  { id: 163, title: 'Data Pipeline', description: 'ETL vs ELT, batch vs streaming', category: 'database', readTime: '10 min', image: '🔀', company: 'Airflow', diagram: 'datapipeline' },
  { id: 164, title: 'Data Lake vs Warehouse', description: 'Architecture comparison', category: 'database', readTime: '8 min', image: '🏞️', company: 'Snowflake', diagram: 'datalakehouse' },
  { id: 165, title: 'Change Data Capture', description: 'Debezium, Kafka Connect, CDC patterns', category: 'database', readTime: '9 min', image: '📡', company: 'Debezium', diagram: 'cdcpattern' },
  { id: 166, title: 'Kafka Deep Dive', description: 'Internals, message loss, partitioning', category: 'messaging', readTime: '12 min', image: '📊', company: 'Confluent', diagram: 'kafkadeep' },
  { id: 167, title: 'Search Engine', description: 'Crawling, indexing, ranking architecture', category: 'realworld', readTime: '12 min', image: '🔍', company: 'Google', diagram: 'searchengine' },
  { id: 168, title: 'Elasticsearch', description: 'Shards, replicas, cluster management', category: 'database', readTime: '10 min', image: '🔎', company: 'Elastic', diagram: 'elasticsearch' },
  { id: 169, title: 'Generative AI Stack', description: 'LLMs, RAG, AI development landscape', category: 'architecture', readTime: '15 min', image: '🤖', company: 'OpenAI', diagram: 'genaistack' },
  // Phase 2: Linux & OS
  { id: 170, title: 'Linux Boot Process', description: 'BIOS/UEFI → GRUB → Kernel → systemd', category: 'devops', readTime: '8 min', image: '🐧', company: 'Linux Foundation', diagram: 'linuxboot' },
  { id: 171, title: 'Linux File System', description: 'FHS directory structure and hierarchy', category: 'devops', readTime: '7 min', image: '📁', company: 'Linux Foundation', diagram: 'linuxfs' },
  { id: 172, title: 'Linux Permissions', description: 'chmod, chown, octal notation explained', category: 'security', readTime: '6 min', image: '🔐', company: 'Linux', diagram: 'linuxperms' },
  { id: 173, title: 'Linux Performance Tools', description: 'vmstat, iostat, netstat, perf, strace', category: 'devops', readTime: '10 min', image: '📊', company: 'Brendan Gregg', diagram: 'linuxperf' },
  { id: 174, title: 'Linux Commands', description: '18 most-used commands with examples', category: 'devops', readTime: '8 min', image: '💻', company: 'Linux', diagram: 'linuxcmds' },
  // Phase 2: API Design
  { id: 175, title: 'REST Best Practices', description: 'Pagination, filtering, error handling', category: 'api', readTime: '8 min', image: '📋', company: 'Stripe', diagram: 'restbest' },
  { id: 176, title: 'GraphQL Deep Dive', description: 'N+1 problem, schema design, resolvers', category: 'api', readTime: '10 min', image: '🕸️', company: 'Meta', diagram: 'graphqldeep' },
  { id: 177, title: 'gRPC Internals', description: 'Protocol buffers, streaming types', category: 'api', readTime: '9 min', image: '⚡', company: 'Google', diagram: 'grpcinternals' },
  { id: 178, title: 'API Gateway Patterns', description: 'Aggregation, transformation, routing', category: 'api', readTime: '8 min', image: '🚪', company: 'Kong', diagram: 'gatewaypatterns' },
  { id: 179, title: 'Proxy vs Gateway vs LB', description: 'Clear comparison of infrastructure', category: 'loadbalancing', readTime: '7 min', image: '🔀', company: 'Nginx', diagram: 'proxygwlb' },
  { id: 180, title: 'GraphQL Adoption', description: '4 patterns: Client, BFF, Monolithic, Federation', category: 'api', readTime: '8 min', image: '📈', company: 'Apollo', diagram: 'graphqladopt' },
  { id: 181, title: 'Polling vs Webhooks', description: 'When to use each, retry mechanisms', category: 'api', readTime: '6 min', image: '🔄', company: 'GitHub', diagram: 'pollwebhook' },
  { id: 182, title: 'API Protocols Landscape', description: 'REST, GraphQL, gRPC, WebSocket, Webhook', category: 'api', readTime: '10 min', image: '🗺️', company: 'Various', diagram: 'apilandscape' },
  // Phase 2: Real-Time & Communication
  { id: 183, title: 'Live Streaming', description: 'Video capture, transcoding, RTMP/HLS, CDN', category: 'realworld', readTime: '12 min', image: '📺', company: 'Twitch', diagram: 'livestream' },
  { id: 184, title: 'Push Notifications', description: 'FCM, APNs, push architecture', category: 'messaging', readTime: '8 min', image: '🔔', company: 'Firebase', diagram: 'pushnotify' },
  { id: 185, title: 'WebSocket Deep Dive', description: 'Connection lifecycle, heartbeats, scaling', category: 'api', readTime: '9 min', image: '🔗', company: 'Discord', diagram: 'wsdeep' },
  // Phase 2: DevOps & CI/CD
  { id: 186, title: 'CI/CD Pipeline', description: 'Plan, develop, build, test, release flow', category: 'devops', readTime: '10 min', image: '🔄', company: 'GitHub', diagram: 'cicdpipe' },
  { id: 187, title: 'Config Management vs IaC', description: 'Terraform, Ansible, CloudFormation comparison', category: 'devops', readTime: '8 min', image: '⚙️', company: 'HashiCorp', diagram: 'configiac' },
  { id: 188, title: 'Docker Deep Dive', description: 'Client, daemon, registry, image layers', category: 'devops', readTime: '10 min', image: '🐳', company: 'Docker', diagram: 'dockerdeep' },
  { id: 189, title: 'Git Workflows', description: 'Git flow, GitHub flow, trunk-based', category: 'devops', readTime: '7 min', image: '🌳', company: 'Various', diagram: 'gitworkflows' },
  // Phase 2: Performance & Monitoring
  { id: 190, title: 'Web Performance Metrics', description: 'Load Time, TTFB, FCP, LCP, CLS', category: 'devops', readTime: '8 min', image: '⚡', company: 'Google', diagram: 'webperf' },
  { id: 191, title: 'Frontend Performance', description: '8 optimization tips for faster sites', category: 'devops', readTime: '7 min', image: '🚀', company: 'Various', diagram: 'frontendperf' },
  { id: 192, title: 'Latency Numbers', description: 'L1/L2 cache, RAM, SSD, network latencies', category: 'distributed', readTime: '6 min', image: '⏱️', company: 'Jeff Dean', diagram: 'latencynums' },
  { id: 193, title: 'Latency Reduction', description: 'Indexing, caching, CDN, async strategies', category: 'distributed', readTime: '8 min', image: '📉', company: 'Various', diagram: 'latencyreduce' },
  // Phase 2: Advanced Caching
  { id: 194, title: 'Cache Eviction Policies', description: 'LRU, LFU, MRU, SLRU, FIFO comparison', category: 'caching', readTime: '8 min', image: '🗑️', company: 'Redis', diagram: 'cacheevict' },
  { id: 195, title: 'Two-Tier Caching', description: 'In-memory + distributed cache layers', category: 'caching', readTime: '7 min', image: '🏗️', company: 'Netflix', diagram: 'twoTierCache' },
  { id: 196, title: 'Redis Sentinel & Cluster', description: '16384 hash slots, sharding, failover', category: 'caching', readTime: '10 min', image: '🔴', company: 'Redis', diagram: 'rediscluster' },
  // Phase 2: Architecture Patterns
  { id: 197, title: 'High Availability Patterns', description: 'Hot-Hot, Hot-Warm, RTO/RPO', category: 'distributed', readTime: '9 min', image: '🔄', company: 'AWS', diagram: 'hapatterns' },
  { id: 198, title: 'Software Architecture', description: 'Microkernel, Space-Based, Pipe-Filter', category: 'architecture', readTime: '10 min', image: '🏛️', company: 'Various', diagram: 'archpatterns' },
  { id: 199, title: 'Fault-Tolerant Systems', description: '6 principles for resilient systems', category: 'distributed', readTime: '8 min', image: '🛡️', company: 'Netflix', diagram: 'faulttolerant' },
  { id: 200, title: 'SOLID Principles', description: 'SRP, OCP, LSP, ISP, DIP explained', category: 'architecture', readTime: '9 min', image: '🧱', company: 'Various', diagram: 'solidprinciples' },
  // Phase 2: Messaging
  { id: 201, title: 'Kafka Use Cases', description: 'Log analysis, CDC, recommendations', category: 'messaging', readTime: '10 min', image: '📊', company: 'LinkedIn', diagram: 'kafkausecases' },
  { id: 202, title: 'Cloud Messaging Patterns', description: 'Async Reply, Claim Check, Priority Queue', category: 'messaging', readTime: '8 min', image: '☁️', company: 'Azure', diagram: 'cloudmsgpatterns' },
  { id: 203, title: 'Kafka 101', description: 'Producer, Consumer, Broker, Topic basics', category: 'messaging', readTime: '8 min', image: '📬', company: 'Confluent', diagram: 'kafka101' },
  // Phase 2: Payment & Security
  { id: 204, title: 'Credit Card Economics', description: 'Interchange fees, merchant discount', category: 'realworld', readTime: '7 min', image: '💳', company: 'Visa', diagram: 'creditcardfees' },
  { id: 205, title: 'Payment Gateway', description: 'Authorization, capture, settlement flow', category: 'realworld', readTime: '9 min', image: '💰', company: 'Stripe', diagram: 'paymentgateway' },
  { id: 206, title: 'Sensitive Data Management', description: 'GDPR, RBAC, key management', category: 'security', readTime: '8 min', image: '🔒', company: 'Various', diagram: 'sensitivedata' },
  // Phase 2: Database Advanced
  { id: 207, title: 'B-Tree Deep Dive', description: 'Disk-based operations, index structure', category: 'database', readTime: '10 min', image: '🌲', company: 'PostgreSQL', diagram: 'btreedeep' },
  { id: 208, title: 'NoSQL Types', description: 'Document, Key-Value, Column, Graph', category: 'database', readTime: '9 min', image: '🗄️', company: 'Various', diagram: 'nosqltypes' },
  { id: 209, title: 'Star & Snowflake Schema', description: 'OLAP optimization, data warehousing', category: 'database', readTime: '8 min', image: '⭐', company: 'Snowflake', diagram: 'starsnowflake' },
  { id: 210, title: 'Database Design', description: 'Normalization, keys, constraints cheatsheet', category: 'database', readTime: '8 min', image: '📋', company: 'Various', diagram: 'dbdesign' },
  // Phase 3: Developer Resources
  { id: 211, title: 'Top Engineering Blogs', description: 'Netflix, Uber, Cloudflare, Meta, LinkedIn blogs', category: 'resources', readTime: '5 min', image: '📝', company: 'Various', diagram: 'engblogs' },
  { id: 212, title: 'Top Books for Developers', description: 'Pragmatic Programmer, Clean Code, DDIA', category: 'resources', readTime: '6 min', image: '📚', company: 'Various', diagram: 'devbooks' },
  { id: 213, title: 'Transformative CS Papers', description: 'Dynamo, GFS, BigTable, Borg, Kafka papers', category: 'resources', readTime: '8 min', image: '📄', company: 'Google/Amazon', diagram: 'cspapers' },
  { id: 214, title: 'Open Source by Big Tech', description: 'React, Kubernetes, TensorFlow, VS Code', category: 'resources', readTime: '6 min', image: '🌐', company: 'Various', diagram: 'opensource' },
  { id: 215, title: 'Soft Skills Books', description: 'Communication, leadership, career growth', category: 'resources', readTime: '5 min', image: '🤝', company: 'Various', diagram: 'softskills' },
  { id: 216, title: 'Diagrams as Code', description: 'Mermaid, PlantUML, Diagrams.py tools', category: 'resources', readTime: '6 min', image: '📊', company: 'Various', diagram: 'diagramtools' },
  { id: 217, title: 'Coding Principles', description: 'DRY, YAGNI, KISS, separation of concerns', category: 'resources', readTime: '7 min', image: '💡', company: 'Various', diagram: 'codingprinciples' },
  // Phase 3: Developer Roadmaps
  { id: 218, title: 'Full-Stack Roadmap', description: 'Frontend, backend, databases, deployment', category: 'resources', readTime: '8 min', image: '🗺️', company: 'roadmap.sh', diagram: 'fullstackroad' },
  { id: 219, title: 'Software Architect Path', description: 'From developer to architect knowledge map', category: 'resources', readTime: '9 min', image: '🏗️', company: 'Various', diagram: 'architectroad' },
  { id: 220, title: 'Cybersecurity Roadmap', description: 'Security fundamentals to advanced topics', category: 'security', readTime: '8 min', image: '🔒', company: 'Various', diagram: 'securityroad' },
  { id: 221, title: 'Backend Developer Roadmap', description: 'Languages, databases, APIs, deployment', category: 'resources', readTime: '8 min', image: '⚙️', company: 'roadmap.sh', diagram: 'backendroad' },
  { id: 222, title: 'DevOps Roadmap', description: 'CI/CD, containers, cloud, monitoring', category: 'devops', readTime: '8 min', image: '🔄', company: 'roadmap.sh', diagram: 'devopsroad' },
  // Phase 3: Programming Concepts
  { id: 223, title: 'UML Class Diagrams', description: 'Classes, relationships, multiplicity notation', category: 'architecture', readTime: '7 min', image: '📐', company: 'Various', diagram: 'umlclass' },
  { id: 224, title: 'Programming Paradigms', description: 'OOP vs Functional vs Procedural comparison', category: 'architecture', readTime: '8 min', image: '🧮', company: 'Various', diagram: 'paradigms' },
  { id: 225, title: 'Garbage Collection', description: 'Java, Python, Go memory management', category: 'architecture', readTime: '9 min', image: '♻️', company: 'Various', diagram: 'garbagecollection' },
  { id: 226, title: 'Concurrency vs Parallelism', description: 'I/O-bound vs CPU-bound, threads vs processes', category: 'distributed', readTime: '8 min', image: '⚡', company: 'Various', diagram: 'concurrencyparallel' },
  { id: 227, title: 'JavaScript Event Loop', description: 'Call stack, microtasks, macrotasks explained', category: 'architecture', readTime: '8 min', image: '🔁', company: 'Various', diagram: 'eventloop' },
  { id: 228, title: 'C++ Use Cases', description: 'Embedded, games, OS, databases, HFT', category: 'resources', readTime: '6 min', image: '⚙️', company: 'Various', diagram: 'cppusecases' },
  // Phase 3: Web & Frontend
  { id: 229, title: 'CSS Fundamentals', description: 'Selectors, Flexbox, Grid, animations', category: 'architecture', readTime: '7 min', image: '🎨', company: 'Various', diagram: 'cssfundamentals' },
  { id: 230, title: 'OOP Principles', description: 'Encapsulation, Abstraction, Inheritance, Polymorphism', category: 'architecture', readTime: '8 min', image: '🧱', company: 'Various', diagram: 'oopprinciples' },
  { id: 231, title: 'Why Nginx is Popular', description: 'Event-driven architecture, use cases', category: 'loadbalancing', readTime: '6 min', image: '🌐', company: 'Nginx', diagram: 'nginxpopular' },
  // Phase 3: Additional Topics
  { id: 232, title: 'Slack Notification Tree', description: 'When to DM, channel, or email decision tree', category: 'realworld', readTime: '4 min', image: '💬', company: 'Slack', diagram: 'slacknotify' },
  { id: 233, title: 'QR Code Login', description: 'How WeChat/WhatsApp QR login works', category: 'security', readTime: '5 min', image: '📱', company: 'WeChat', diagram: 'qrlogin' },
  { id: 234, title: 'Pinterest Git Optimization', description: 'Monorepo challenges and solutions', category: 'realworld', readTime: '7 min', image: '📌', company: 'Pinterest', diagram: 'pinterestgit' },
  { id: 235, title: 'Stack Overflow Architecture', description: 'Monolith at scale case study', category: 'realworld', readTime: '8 min', image: '📚', company: 'Stack Overflow', diagram: 'stackoverflowarch' },
  { id: 236, title: 'KISS Principle', description: 'Keep It Simple, Stupid in practice', category: 'architecture', readTime: '4 min', image: '💋', company: 'Various', diagram: 'kissprinciple' },
  { id: 237, title: 'API Client Tools', description: 'Postman, Insomnia, Thunder Client comparison', category: 'api', readTime: '5 min', image: '🔧', company: 'Various', diagram: 'apiclients' },
  { id: 238, title: 'Semantic Versioning', description: 'Major.Minor.Patch versioning explained', category: 'devops', readTime: '4 min', image: '🏷️', company: 'Various', diagram: 'semver' },
  { id: 239, title: 'VPN Architecture', description: 'Site-to-site vs client VPN explained', category: 'security', readTime: '6 min', image: '🔐', company: 'Various', diagram: 'vpnarch' },
  { id: 240, title: 'Memory Stack vs Heap', description: 'RAM hierarchy, allocation strategies', category: 'architecture', readTime: '7 min', image: '🧠', company: 'Various', diagram: 'memorytypes' },
  { id: 241, title: 'International Payments', description: 'Currency conversion, SWIFT, cross-border', category: 'realworld', readTime: '8 min', image: '💱', company: 'SWIFT', diagram: 'internationalpay' },
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
    thunderherd: (
      <svg viewBox="0 0 500 180" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Thunder Herd Problem & Solutions</text>
        <rect x="15" y="30" width="220" height="140" rx="8" fill="rgba(248,113,113,0.08)" stroke="#f87171" strokeDasharray="4,4" />
        <text x="125" y="48" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="600">❌ The Problem</text>
        <rect x="30" y="58" width="60" height="25" rx="4" fill="#60a5fa20" stroke="#60a5fa" /><text x="60" y="75" textAnchor="middle" fill="#fafafa" fontSize="7">Cache</text>
        <text x="60" y="95" textAnchor="middle" fill="#f87171" fontSize="7">🕐 TTL Expires!</text>
        {[0,1,2,3,4].map(i => <g key={i}><circle cx={30 + i*20} cy="115" r="8" fill="#fb923c20" stroke="#fb923c" /><text x={30 + i*20} y="118" textAnchor="middle" fill="#fb923c" fontSize="6">R{i+1}</text><path d={`M${30 + i*20} 125 L120 145`} stroke="#f87171" strokeWidth="1" strokeDasharray="2,2" /></g>)}
        <rect x="100" y="140" width="50" height="22" rx="4" fill="#f4728620" stroke="#f472b6" strokeWidth="2" /><text x="125" y="155" textAnchor="middle" fill="#f472b6" fontSize="7">💾 DB</text>
        <text x="125" y="175" textAnchor="middle" fill="#f87171" fontSize="6">1000s hit DB simultaneously!</text>
        <rect x="265" y="30" width="220" height="140" rx="8" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeDasharray="4,4" />
        <text x="375" y="48" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">✓ Solutions</text>
        <rect x="280" y="60" width="90" height="25" rx="4" fill="#4ade8020" stroke="#4ade80" /><text x="325" y="77" textAnchor="middle" fill="#fafafa" fontSize="7">🔒 Locking</text>
        <text x="325" y="92" textAnchor="middle" fill="#71717a" fontSize="6">One request fetches</text>
        <rect x="380" y="60" width="90" height="25" rx="4" fill="#22d3ee20" stroke="#22d3ee" /><text x="425" y="77" textAnchor="middle" fill="#fafafa" fontSize="7">⏰ Early Expire</text>
        <text x="425" y="92" textAnchor="middle" fill="#71717a" fontSize="6">Probabilistic refresh</text>
        <rect x="280" y="105" width="90" height="25" rx="4" fill="#a78bfa20" stroke="#a78bfa" /><text x="325" y="122" textAnchor="middle" fill="#fafafa" fontSize="7">📦 Background</text>
        <text x="325" y="137" textAnchor="middle" fill="#71717a" fontSize="6">Async refresh job</text>
        <rect x="380" y="105" width="90" height="25" rx="4" fill="#fbbf2420" stroke="#fbbf24" /><text x="425" y="122" textAnchor="middle" fill="#fafafa" fontSize="7">♾️ Never Expire</text>
        <text x="425" y="137" textAnchor="middle" fill="#71717a" fontSize="6">Manual invalidation</text>
        <text x="375" y="165" textAnchor="middle" fill="#4ade80" fontSize="7">Facebook: Request coalescing saves 99% DB load</text>
      </svg>
    ),
    cachepenetration: (
      <svg viewBox="0 0 500 170" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Cache Penetration: Querying Non-existent Keys</text>
        <rect x="15" y="28" width="220" height="130" rx="8" fill="rgba(248,113,113,0.08)" stroke="#f87171" strokeDasharray="4,4" />
        <text x="125" y="48" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="600">❌ The Attack</text>
        <circle cx="50" cy="80" r="15" fill="#fb923c20" stroke="#fb923c" /><text x="50" y="84" textAnchor="middle" fill="#fb923c" fontSize="8">🤖</text>
        <text x="50" y="105" textAnchor="middle" fill="#71717a" fontSize="6">Attacker</text>
        <path d="M70 80 L100 80" stroke="#f87171" strokeWidth="2" /><text x="85" y="75" textAnchor="middle" fill="#f87171" fontSize="6">key=-1</text>
        <rect x="105" y="65" width="50" height="30" rx="4" fill="#60a5fa20" stroke="#60a5fa" /><text x="130" y="84" textAnchor="middle" fill="#fafafa" fontSize="7">Cache</text>
        <text x="130" y="105" textAnchor="middle" fill="#f87171" fontSize="6">MISS!</text>
        <path d="M160 80 L185 80" stroke="#f87171" strokeWidth="2" />
        <rect x="190" y="65" width="50" height="30" rx="4" fill="#f4728620" stroke="#f472b6" strokeWidth="2" /><text x="215" y="84" textAnchor="middle" fill="#f472b6" fontSize="7">💾 DB</text>
        <text x="215" y="105" textAnchor="middle" fill="#f87171" fontSize="6">MISS!</text>
        <text x="125" y="145" textAnchor="middle" fill="#f87171" fontSize="7">Every request hits DB → DDoS effect</text>
        <rect x="265" y="28" width="220" height="130" rx="8" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeDasharray="4,4" />
        <text x="375" y="48" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">✓ Solutions</text>
        <rect x="280" y="60" width="95" height="40" rx="4" fill="#4ade8020" stroke="#4ade80" />
        <text x="327" y="77" textAnchor="middle" fill="#fafafa" fontSize="8">🌸 Bloom Filter</text>
        <text x="327" y="92" textAnchor="middle" fill="#71717a" fontSize="6">Pre-check existence</text>
        <rect x="385" y="60" width="95" height="40" rx="4" fill="#22d3ee20" stroke="#22d3ee" />
        <text x="432" y="77" textAnchor="middle" fill="#fafafa" fontSize="8">∅ Cache Nulls</text>
        <text x="432" y="92" textAnchor="middle" fill="#71717a" fontSize="6">Store empty results</text>
        <rect x="280" y="108" width="200" height="35" rx="4" fill="#a78bfa15" stroke="#a78bfa" />
        <text x="380" y="125" textAnchor="middle" fill="#a78bfa" fontSize="7">✓ Input Validation: Reject invalid IDs early</text>
        <text x="380" y="140" textAnchor="middle" fill="#71717a" fontSize="6">Rate limiting + IP blocking for repeated attacks</text>
      </svg>
    ),
    cachebreakdown: (
      <svg viewBox="0 0 500 170" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Cache Breakdown: Hot Key Expiration</text>
        <rect x="15" y="28" width="220" height="130" rx="8" fill="rgba(248,113,113,0.08)" stroke="#f87171" strokeDasharray="4,4" />
        <text x="125" y="48" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="600">❌ The Problem</text>
        <rect x="35" y="60" width="70" height="30" rx="4" fill="#fbbf2420" stroke="#fbbf24" strokeWidth="2" />
        <text x="70" y="75" textAnchor="middle" fill="#fbbf24" fontSize="8">🔥 Hot Key</text>
        <text x="70" y="88" textAnchor="middle" fill="#fbbf24" fontSize="6">"trending_post"</text>
        <text x="70" y="108" textAnchor="middle" fill="#f87171" fontSize="7">TTL Expires!</text>
        {[0,1,2].map(i => <g key={i}><rect x={120} y={60 + i*25} width="35" height="18" rx="3" fill="#60a5fa20" stroke="#60a5fa" /><text x="137" y={72 + i*25} textAnchor="middle" fill="#60a5fa" fontSize="5">10K req</text></g>)}
        <path d="M160 75 L200 115" stroke="#f87171" strokeWidth="2" />
        <rect x="180" y="105" width="45" height="25" rx="4" fill="#f4728620" stroke="#f472b6" strokeWidth="2" /><text x="202" y="122" textAnchor="middle" fill="#f472b6" fontSize="7">💾 DB</text>
        <text x="202" y="145" textAnchor="middle" fill="#f87171" fontSize="6">💥 Overload!</text>
        <rect x="265" y="28" width="220" height="130" rx="8" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeDasharray="4,4" />
        <text x="375" y="48" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">✓ Solutions</text>
        <rect x="280" y="60" width="95" height="38" rx="4" fill="#4ade8020" stroke="#4ade80" />
        <text x="327" y="76" textAnchor="middle" fill="#fafafa" fontSize="7">🔒 Mutex Lock</text>
        <text x="327" y="90" textAnchor="middle" fill="#71717a" fontSize="6">One thread rebuilds</text>
        <rect x="385" y="60" width="95" height="38" rx="4" fill="#22d3ee20" stroke="#22d3ee" />
        <text x="432" y="76" textAnchor="middle" fill="#fafafa" fontSize="7">♾️ No Expiry</text>
        <text x="432" y="90" textAnchor="middle" fill="#71717a" fontSize="6">Manual invalidation</text>
        <rect x="280" y="105" width="95" height="38" rx="4" fill="#a78bfa20" stroke="#a78bfa" />
        <text x="327" y="121" textAnchor="middle" fill="#fafafa" fontSize="7">🔄 Logical TTL</text>
        <text x="327" y="135" textAnchor="middle" fill="#71717a" fontSize="6">Soft expiration</text>
        <rect x="385" y="105" width="95" height="38" rx="4" fill="#fb923c20" stroke="#fb923c" />
        <text x="432" y="121" textAnchor="middle" fill="#fafafa" fontSize="7">📊 Singleflight</text>
        <text x="432" y="135" textAnchor="middle" fill="#71717a" fontSize="6">Dedupe requests</text>
      </svg>
    ),
    cachecrash: (
      <svg viewBox="0 0 500 170" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Cache Crash: Recovery & Warm-up Strategies</text>
        <rect x="15" y="28" width="140" height="130" rx="8" fill="rgba(248,113,113,0.08)" stroke="#f87171" strokeDasharray="4,4" />
        <text x="85" y="48" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="600">❌ Crash Scenario</text>
        <rect x="55" y="60" width="60" height="30" rx="4" fill="#52525b" stroke="#71717a" strokeWidth="2" strokeDasharray="3,3" />
        <text x="85" y="80" textAnchor="middle" fill="#71717a" fontSize="8">Cache ☠️</text>
        <text x="85" y="100" textAnchor="middle" fill="#f87171" fontSize="7">All data lost!</text>
        <text x="85" y="115" textAnchor="middle" fill="#f87171" fontSize="6">100% cache miss</text>
        <rect x="45" y="125" width="80" height="22" rx="3" fill="#f4728630" stroke="#f472b6" strokeWidth="2" /><text x="85" y="140" textAnchor="middle" fill="#f472b6" fontSize="7">💾 DB Overload</text>
        <rect x="175" y="28" width="310" height="130" rx="8" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeDasharray="4,4" />
        <text x="330" y="48" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">✓ Recovery Strategies</text>
        <rect x="190" y="58" width="90" height="42" rx="4" fill="#4ade8020" stroke="#4ade80" />
        <text x="235" y="74" textAnchor="middle" fill="#fafafa" fontSize="7">🔥 Cache Warming</text>
        <text x="235" y="88" textAnchor="middle" fill="#71717a" fontSize="6">Pre-load popular keys</text>
        <text x="235" y="98" textAnchor="middle" fill="#71717a" fontSize="5">on startup</text>
        <rect x="290" y="58" width="90" height="42" rx="4" fill="#22d3ee20" stroke="#22d3ee" />
        <text x="335" y="74" textAnchor="middle" fill="#fafafa" fontSize="7">💾 Persistent Cache</text>
        <text x="335" y="88" textAnchor="middle" fill="#71717a" fontSize="6">Redis RDB/AOF</text>
        <text x="335" y="98" textAnchor="middle" fill="#71717a" fontSize="5">survives restart</text>
        <rect x="390" y="58" width="90" height="42" rx="4" fill="#a78bfa20" stroke="#a78bfa" />
        <text x="435" y="74" textAnchor="middle" fill="#fafafa" fontSize="7">🔄 Replica Failover</text>
        <text x="435" y="88" textAnchor="middle" fill="#71717a" fontSize="6">Promote replica</text>
        <text x="435" y="98" textAnchor="middle" fill="#71717a" fontSize="5">to primary</text>
        <rect x="190" y="108" width="140" height="38" rx="4" fill="#fb923c20" stroke="#fb923c" />
        <text x="260" y="124" textAnchor="middle" fill="#fafafa" fontSize="7">🚦 Gradual Traffic Ramp-up</text>
        <text x="260" y="138" textAnchor="middle" fill="#71717a" fontSize="6">10% → 50% → 100% over time</text>
        <rect x="340" y="108" width="140" height="38" rx="4" fill="#fbbf2420" stroke="#fbbf24" />
        <text x="410" y="124" textAnchor="middle" fill="#fafafa" fontSize="7">🛡️ Circuit Breaker</text>
        <text x="410" y="138" textAnchor="middle" fill="#71717a" fontSize="6">Protect DB from overload</text>
      </svg>
    ),
    cachinglevels: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">8 Levels of Caching Architecture</text>
        {[
          { y: 28, label: '1. Client Cache', detail: 'Browser/App', color: '#4ade80', latency: '~0ms' },
          { y: 48, label: '2. CDN Cache', detail: 'Edge Locations', color: '#22d3ee', latency: '~10ms' },
          { y: 68, label: '3. Load Balancer', detail: 'Nginx/HAProxy', color: '#60a5fa', latency: '~1ms' },
          { y: 88, label: '4. API Gateway', detail: 'Response Cache', color: '#a78bfa', latency: '~2ms' },
          { y: 108, label: '5. App Cache', detail: 'CPU/RAM/Disk', color: '#f472b6', latency: '~0.1ms' },
          { y: 128, label: '6. Distributed Cache', detail: 'Redis/Memcached', color: '#fb923c', latency: '~1ms' },
          { y: 148, label: '7. Search Index', detail: 'Elasticsearch', color: '#fbbf24', latency: '~5ms' },
          { y: 168, label: '8. Database Cache', detail: 'Query/Buffer', color: '#f87171', latency: '~10ms' }
        ].map((level, i) => (
          <g key={i}>
            <rect x="20" y={level.y} width="180" height="17" rx="3" fill={`${level.color}20`} stroke={level.color} strokeWidth="1.5" />
            <text x="30" y={level.y + 12} fill={level.color} fontSize="7" fontWeight="600">{level.label}</text>
            <text x="195" y={level.y + 12} textAnchor="end" fill="#71717a" fontSize="6">{level.detail}</text>
            <rect x="210" y={level.y} width="50" height="17" rx="3" fill={`${level.color}10`} stroke={level.color} strokeWidth="0.5" />
            <text x="235" y={level.y + 12} textAnchor="middle" fill={level.color} fontSize="6">{level.latency}</text>
            {i < 7 && <path d={`M110 ${level.y + 17} L110 ${level.y + 28}`} stroke="#3f3f46" strokeWidth="1" />}
          </g>
        ))}
        <rect x="280" y="28" width="200" height="160" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="380" y="48" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Cache Hit Rate Impact</text>
        <text x="295" y="68" fill="#4ade80" fontSize="7">• 90% hit rate = 10x less DB load</text>
        <text x="295" y="85" fill="#22d3ee" fontSize="7">• CDN: Static assets, images</text>
        <text x="295" y="102" fill="#60a5fa" fontSize="7">• LB: SSL session, routing</text>
        <text x="295" y="119" fill="#a78bfa" fontSize="7">• Gateway: API responses</text>
        <text x="295" y="136" fill="#fb923c" fontSize="7">• Redis: Hot data, sessions</text>
        <text x="295" y="153" fill="#fbbf24" fontSize="7">• ES: Search results</text>
        <text x="295" y="170" fill="#f87171" fontSize="7">• DB: Query plans, buffers</text>
        <text x="380" y="185" textAnchor="middle" fill="#71717a" fontSize="6">Netflix: 30M+ ops/sec across layers</text>
      </svg>
    ),
    k8sarchitecture: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Kubernetes Architecture</text>
        <rect x="15" y="25" width="220" height="165" rx="8" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="2" />
        <text x="125" y="42" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">Control Plane</text>
        <rect x="30" y="52" width="90" height="30" rx="4" fill="#60a5fa20" stroke="#60a5fa" />
        <text x="75" y="71" textAnchor="middle" fill="#fafafa" fontSize="7">🔌 API Server</text>
        <rect x="130" y="52" width="90" height="30" rx="4" fill="#60a5fa20" stroke="#60a5fa" />
        <text x="175" y="71" textAnchor="middle" fill="#fafafa" fontSize="7">📅 Scheduler</text>
        <rect x="30" y="90" width="90" height="30" rx="4" fill="#60a5fa20" stroke="#60a5fa" />
        <text x="75" y="109" textAnchor="middle" fill="#fafafa" fontSize="7">🎛️ Controller Mgr</text>
        <rect x="130" y="90" width="90" height="30" rx="4" fill="#60a5fa20" stroke="#60a5fa" />
        <text x="175" y="109" textAnchor="middle" fill="#fafafa" fontSize="7">💾 etcd</text>
        <rect x="30" y="128" width="190" height="25" rx="4" fill="#a78bfa20" stroke="#a78bfa" />
        <text x="125" y="145" textAnchor="middle" fill="#a78bfa" fontSize="7">☁️ Cloud Controller Manager</text>
        <text x="125" y="175" textAnchor="middle" fill="#71717a" fontSize="6">Single source of truth</text>
        <rect x="265" y="25" width="220" height="165" rx="8" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeWidth="2" />
        <text x="375" y="42" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">Worker Nodes</text>
        <rect x="280" y="52" width="90" height="60" rx="4" fill="#4ade8020" stroke="#4ade80" />
        <text x="325" y="68" textAnchor="middle" fill="#fafafa" fontSize="7">📦 Pod</text>
        <rect x="290" y="78" width="30" height="20" rx="2" fill="#22d3ee20" stroke="#22d3ee" /><text x="305" y="92" textAnchor="middle" fill="#22d3ee" fontSize="5">C1</text>
        <rect x="330" y="78" width="30" height="20" rx="2" fill="#22d3ee20" stroke="#22d3ee" /><text x="345" y="92" textAnchor="middle" fill="#22d3ee" fontSize="5">C2</text>
        <rect x="380" y="52" width="90" height="60" rx="4" fill="#4ade8020" stroke="#4ade80" />
        <text x="425" y="68" textAnchor="middle" fill="#fafafa" fontSize="7">📦 Pod</text>
        <rect x="390" y="78" width="30" height="20" rx="2" fill="#22d3ee20" stroke="#22d3ee" /><text x="405" y="92" textAnchor="middle" fill="#22d3ee" fontSize="5">C1</text>
        <rect x="430" y="78" width="30" height="20" rx="2" fill="#22d3ee20" stroke="#22d3ee" /><text x="445" y="92" textAnchor="middle" fill="#22d3ee" fontSize="5">C2</text>
        <rect x="280" y="120" width="95" height="25" rx="3" fill="#fb923c20" stroke="#fb923c" />
        <text x="327" y="137" textAnchor="middle" fill="#fb923c" fontSize="7">🤖 Kubelet</text>
        <rect x="385" y="120" width="85" height="25" rx="3" fill="#f472b620" stroke="#f472b6" />
        <text x="427" y="137" textAnchor="middle" fill="#f472b6" fontSize="7">🔀 Kube-Proxy</text>
        <rect x="280" y="153" width="190" height="25" rx="3" fill="#fbbf2420" stroke="#fbbf24" />
        <text x="375" y="170" textAnchor="middle" fill="#fbbf24" fontSize="7">🐳 Container Runtime (containerd/CRI-O)</text>
        <path d="M240 90 L260 90" stroke="#71717a" strokeWidth="2" strokeDasharray="4,4" />
      </svg>
    ),
    k8spatterns: (
      <svg viewBox="0 0 500 210" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Top 10 Kubernetes Design Patterns</text>
        <rect x="15" y="25" width="150" height="85" rx="6" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeDasharray="4,4" />
        <text x="90" y="42" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="600">Foundational</text>
        <rect x="25" y="50" width="130" height="18" rx="3" fill="#4ade8020" stroke="#4ade80" /><text x="90" y="63" textAnchor="middle" fill="#fafafa" fontSize="6">💓 Health Probe</text>
        <rect x="25" y="72" width="130" height="18" rx="3" fill="#4ade8020" stroke="#4ade80" /><text x="90" y="85" textAnchor="middle" fill="#fafafa" fontSize="6">📋 Predictable Demands</text>
        <rect x="25" y="94" width="130" height="18" rx="3" fill="#4ade8020" stroke="#4ade80" /><text x="90" y="107" textAnchor="middle" fill="#fafafa" fontSize="6">🎯 Automated Placement</text>
        <rect x="175" y="25" width="150" height="85" rx="6" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeDasharray="4,4" />
        <text x="250" y="42" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="600">Structural</text>
        <rect x="185" y="50" width="130" height="18" rx="3" fill="#60a5fa20" stroke="#60a5fa" /><text x="250" y="63" textAnchor="middle" fill="#fafafa" fontSize="6">🚀 Init Container</text>
        <rect x="185" y="72" width="130" height="18" rx="3" fill="#60a5fa20" stroke="#60a5fa" /><text x="250" y="85" textAnchor="middle" fill="#fafafa" fontSize="6">🏍️ Sidecar</text>
        <rect x="335" y="25" width="150" height="85" rx="6" fill="rgba(251,146,60,0.08)" stroke="#fb923c" strokeDasharray="4,4" />
        <text x="410" y="42" textAnchor="middle" fill="#fb923c" fontSize="8" fontWeight="600">Behavioral</text>
        <rect x="345" y="50" width="130" height="18" rx="3" fill="#fb923c20" stroke="#fb923c" /><text x="410" y="63" textAnchor="middle" fill="#fafafa" fontSize="6">📦 Batch Job</text>
        <rect x="345" y="72" width="130" height="18" rx="3" fill="#fb923c20" stroke="#fb923c" /><text x="410" y="85" textAnchor="middle" fill="#fafafa" fontSize="6">💾 Stateful Service</text>
        <rect x="345" y="94" width="130" height="18" rx="3" fill="#fb923c20" stroke="#fb923c" /><text x="410" y="107" textAnchor="middle" fill="#fafafa" fontSize="6">🔎 Service Discovery</text>
        <rect x="95" y="120" width="310" height="80" rx="6" fill="rgba(167,139,250,0.08)" stroke="#a78bfa" strokeDasharray="4,4" />
        <text x="250" y="137" textAnchor="middle" fill="#a78bfa" fontSize="8" fontWeight="600">Higher-Level Patterns</text>
        <rect x="110" y="147" width="140" height="22" rx="3" fill="#a78bfa20" stroke="#a78bfa" />
        <text x="180" y="162" textAnchor="middle" fill="#fafafa" fontSize="7">🎛️ Controller</text>
        <text x="180" y="175" textAnchor="middle" fill="#71717a" fontSize="5">Reconciliation loop</text>
        <rect x="260" y="147" width="140" height="22" rx="3" fill="#a78bfa20" stroke="#a78bfa" />
        <text x="330" y="162" textAnchor="middle" fill="#fafafa" fontSize="7">🔧 Operator</text>
        <text x="330" y="175" textAnchor="middle" fill="#71717a" fontSize="5">Domain-specific automation</text>
        <text x="250" y="195" textAnchor="middle" fill="#71717a" fontSize="6">Source: Kubernetes Patterns by Bilgin Ibryam & Roland Huß</text>
      </svg>
    ),
    k8stools: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Kubernetes Ecosystem Tools</text>
        {[
          { x: 20, y: 30, w: 145, h: 75, title: '📊 Monitoring', color: '#4ade80', tools: ['Prometheus', 'Grafana', 'Datadog', 'New Relic'] },
          { x: 175, y: 30, w: 145, h: 75, title: '🔒 Security', color: '#f87171', tools: ['Falco', 'OPA', 'Trivy', 'Vault'] },
          { x: 330, y: 30, w: 145, h: 75, title: '🌐 Networking', color: '#60a5fa', tools: ['Calico', 'Cilium', 'Istio', 'Linkerd'] },
          { x: 20, y: 115, w: 145, h: 75, title: '📦 CI/CD', color: '#a78bfa', tools: ['ArgoCD', 'Flux', 'Jenkins X', 'Tekton'] },
          { x: 175, y: 115, w: 145, h: 75, title: '💾 Storage', color: '#fb923c', tools: ['Rook', 'Longhorn', 'OpenEBS', 'Velero'] },
          { x: 330, y: 115, w: 145, h: 75, title: '🛠️ Dev Tools', color: '#22d3ee', tools: ['Helm', 'Kustomize', 'Skaffold', 'Telepresence'] }
        ].map((cat, i) => (
          <g key={i}>
            <rect x={cat.x} y={cat.y} width={cat.w} height={cat.h} rx="6" fill={`${cat.color}10`} stroke={cat.color} strokeWidth="1.5" />
            <text x={cat.x + cat.w/2} y={cat.y + 18} textAnchor="middle" fill={cat.color} fontSize="8" fontWeight="600">{cat.title}</text>
            {cat.tools.map((tool, j) => (
              <text key={j} x={cat.x + 10 + (j % 2) * 70} y={cat.y + 38 + Math.floor(j / 2) * 16} fill="#a1a1aa" fontSize="6">{tool}</text>
            ))}
          </g>
        ))}
      </svg>
    ),
    containersecurity: (
      <svg viewBox="0 0 500 180" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Container Security Best Practices</text>
        <rect x="15" y="28" width="150" height="140" rx="6" fill="rgba(248,113,113,0.08)" stroke="#f87171" strokeWidth="1.5" />
        <text x="90" y="45" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="600">🔍 Image Security</text>
        <rect x="25" y="55" width="130" height="22" rx="3" fill="#f8717120" stroke="#f87171" />
        <text x="90" y="70" textAnchor="middle" fill="#fafafa" fontSize="7">Scan for vulnerabilities</text>
        <rect x="25" y="82" width="130" height="22" rx="3" fill="#f8717120" stroke="#f87171" />
        <text x="90" y="97" textAnchor="middle" fill="#fafafa" fontSize="7">Use minimal base images</text>
        <rect x="25" y="109" width="130" height="22" rx="3" fill="#f8717120" stroke="#f87171" />
        <text x="90" y="124" textAnchor="middle" fill="#fafafa" fontSize="7">Sign & verify images</text>
        <rect x="25" y="136" width="130" height="22" rx="3" fill="#f8717120" stroke="#f87171" />
        <text x="90" y="151" textAnchor="middle" fill="#fafafa" fontSize="7">Private registry</text>
        <rect x="175" y="28" width="150" height="140" rx="6" fill="rgba(251,191,36,0.08)" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="250" y="45" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">🛡️ Pod Security</text>
        <rect x="185" y="55" width="130" height="22" rx="3" fill="#fbbf2420" stroke="#fbbf24" />
        <text x="250" y="70" textAnchor="middle" fill="#fafafa" fontSize="7">Run as non-root</text>
        <rect x="185" y="82" width="130" height="22" rx="3" fill="#fbbf2420" stroke="#fbbf24" />
        <text x="250" y="97" textAnchor="middle" fill="#fafafa" fontSize="7">Read-only filesystem</text>
        <rect x="185" y="109" width="130" height="22" rx="3" fill="#fbbf2420" stroke="#fbbf24" />
        <text x="250" y="124" textAnchor="middle" fill="#fafafa" fontSize="7">Drop capabilities</text>
        <rect x="185" y="136" width="130" height="22" rx="3" fill="#fbbf2420" stroke="#fbbf24" />
        <text x="250" y="151" textAnchor="middle" fill="#fafafa" fontSize="7">Resource limits</text>
        <rect x="335" y="28" width="150" height="140" rx="6" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeWidth="1.5" />
        <text x="410" y="45" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">🔐 Secrets Mgmt</text>
        <rect x="345" y="55" width="130" height="22" rx="3" fill="#4ade8020" stroke="#4ade80" />
        <text x="410" y="70" textAnchor="middle" fill="#fafafa" fontSize="7">External secrets</text>
        <rect x="345" y="82" width="130" height="22" rx="3" fill="#4ade8020" stroke="#4ade80" />
        <text x="410" y="97" textAnchor="middle" fill="#fafafa" fontSize="7">Vault integration</text>
        <rect x="345" y="109" width="130" height="22" rx="3" fill="#4ade8020" stroke="#4ade80" />
        <text x="410" y="124" textAnchor="middle" fill="#fafafa" fontSize="7">Encrypt at rest</text>
        <rect x="345" y="136" width="130" height="22" rx="3" fill="#4ade8020" stroke="#4ade80" />
        <text x="410" y="151" textAnchor="middle" fill="#fafafa" fontSize="7">Rotate regularly</text>
      </svg>
    ),
    osimodel: (
      <svg viewBox="0 0 500 210" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">OSI 7-Layer Model</text>
        {[
          { n: '7', name: 'Application', proto: 'HTTP, SMTP, DNS', color: '#f87171', ex: 'Chrome, Outlook' },
          { n: '6', name: 'Presentation', proto: 'SSL/TLS, JPEG', color: '#fb923c', ex: 'Encryption, Format' },
          { n: '5', name: 'Session', proto: 'NetBIOS, RPC', color: '#fbbf24', ex: 'Session mgmt' },
          { n: '4', name: 'Transport', proto: 'TCP, UDP', color: '#4ade80', ex: 'Ports, Segments' },
          { n: '3', name: 'Network', proto: 'IP, ICMP', color: '#22d3ee', ex: 'Routers, Packets' },
          { n: '2', name: 'Data Link', proto: 'Ethernet, WiFi', color: '#60a5fa', ex: 'Switches, Frames' },
          { n: '1', name: 'Physical', proto: 'Cables, Signals', color: '#a78bfa', ex: 'Bits, Hubs' }
        ].map((layer, i) => (
          <g key={i}>
            <rect x="20" y={28 + i * 25} width="30" height="22" rx="3" fill={`${layer.color}30`} stroke={layer.color} strokeWidth="1.5" />
            <text x="35" y={43 + i * 25} textAnchor="middle" fill={layer.color} fontSize="10" fontWeight="bold">{layer.n}</text>
            <rect x="55" y={28 + i * 25} width="100" height="22" rx="3" fill={`${layer.color}20`} stroke={layer.color} />
            <text x="105" y={43 + i * 25} textAnchor="middle" fill="#fafafa" fontSize="8">{layer.name}</text>
            <rect x="160" y={28 + i * 25} width="120" height="22" rx="3" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
            <text x="220" y={43 + i * 25} textAnchor="middle" fill="#a1a1aa" fontSize="7">{layer.proto}</text>
            <text x="310" y={43 + i * 25} fill="#71717a" fontSize="6">{layer.ex}</text>
          </g>
        ))}
        <rect x="360" y="28" width="125" height="175" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="422" y="48" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Encapsulation</text>
        <text x="375" y="68" fill="#f87171" fontSize="6">↓ Data</text>
        <text x="375" y="88" fill="#fb923c" fontSize="6">↓ + Format</text>
        <text x="375" y="108" fill="#fbbf24" fontSize="6">↓ + Session</text>
        <text x="375" y="128" fill="#4ade80" fontSize="6">↓ + Port (Segment)</text>
        <text x="375" y="148" fill="#22d3ee" fontSize="6">↓ + IP (Packet)</text>
        <text x="375" y="168" fill="#60a5fa" fontSize="6">↓ + MAC (Frame)</text>
        <text x="375" y="188" fill="#a78bfa" fontSize="6">↓ + Signal (Bits)</text>
      </svg>
    ),
    httpstatus: (
      <svg viewBox="0 0 500 180" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">HTTP Status Codes</text>
        {[
          { range: '1xx', name: 'Informational', color: '#a78bfa', examples: '100 Continue, 101 Switching' },
          { range: '2xx', name: 'Success', color: '#4ade80', examples: '200 OK, 201 Created, 204 No Content' },
          { range: '3xx', name: 'Redirection', color: '#22d3ee', examples: '301 Moved, 302 Found, 304 Not Modified' },
          { range: '4xx', name: 'Client Error', color: '#fbbf24', examples: '400 Bad, 401 Unauth, 403 Forbidden, 404 Not Found' },
          { range: '5xx', name: 'Server Error', color: '#f87171', examples: '500 Internal, 502 Gateway, 503 Unavailable, 504 Timeout' }
        ].map((cat, i) => (
          <g key={i}>
            <rect x="20" y={28 + i * 30} width="55" height="26" rx="4" fill={`${cat.color}30`} stroke={cat.color} strokeWidth="2" />
            <text x="47" y={46 + i * 30} textAnchor="middle" fill={cat.color} fontSize="11" fontWeight="bold">{cat.range}</text>
            <rect x="82" y={28 + i * 30} width="90" height="26" rx="3" fill={`${cat.color}15`} stroke={cat.color} />
            <text x="127" y={46 + i * 30} textAnchor="middle" fill="#fafafa" fontSize="8">{cat.name}</text>
            <text x="185" y={46 + i * 30} fill="#a1a1aa" fontSize="6">{cat.examples}</text>
          </g>
        ))}
        <rect x="400" y="28" width="85" height="150" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="442" y="48" textAnchor="middle" fill="#fafafa" fontSize="7" fontWeight="600">Common</text>
        <text x="410" y="68" fill="#4ade80" fontSize="6">200 Success</text>
        <text x="410" y="85" fill="#4ade80" fontSize="6">201 Created</text>
        <text x="410" y="102" fill="#22d3ee" fontSize="6">301 Redirect</text>
        <text x="410" y="119" fill="#fbbf24" fontSize="6">401 Unauth</text>
        <text x="410" y="136" fill="#fbbf24" fontSize="6">404 Not Found</text>
        <text x="410" y="153" fill="#f87171" fontSize="6">500 Server Err</text>
        <text x="410" y="170" fill="#f87171" fontSize="6">503 Unavailable</text>
      </svg>
    ),
    sslhandshake: (
      <svg viewBox="0 0 500 190" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">TLS 1.3 Handshake (1-RTT)</text>
        <rect x="30" y="30" width="80" height="145" rx="6" fill="rgba(96,165,250,0.1)" stroke="#60a5fa" strokeWidth="2" />
        <text x="70" y="50" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">🖥️ Client</text>
        <rect x="390" y="30" width="80" height="145" rx="6" fill="rgba(74,222,128,0.1)" stroke="#4ade80" strokeWidth="2" />
        <text x="430" y="50" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">🌐 Server</text>
        <path d="M115 70 L385 85" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrow)" />
        <text x="250" y="72" textAnchor="middle" fill="#60a5fa" fontSize="7">ClientHello + KeyShare</text>
        <text x="250" y="82" textAnchor="middle" fill="#71717a" fontSize="5">Cipher suites, TLS version, ECDHE public key</text>
        <path d="M385 105 L115 120" stroke="#4ade80" strokeWidth="2" markerEnd="url(#arrow)" />
        <text x="250" y="107" textAnchor="middle" fill="#4ade80" fontSize="7">ServerHello + KeyShare + Certificate</text>
        <text x="250" y="117" textAnchor="middle" fill="#71717a" fontSize="5">Chosen cipher, server public key, cert chain</text>
        <path d="M115 140 L385 155" stroke="#a78bfa" strokeWidth="2" markerEnd="url(#arrow)" />
        <text x="250" y="142" textAnchor="middle" fill="#a78bfa" fontSize="7">Finished (Encrypted)</text>
        <text x="250" y="152" textAnchor="middle" fill="#71717a" fontSize="5">Verify handshake, start sending data</text>
        <rect x="140" y="165" width="220" height="20" rx="3" fill="#4ade8020" stroke="#4ade80" />
        <text x="250" y="179" textAnchor="middle" fill="#4ade80" fontSize="7">🔒 Encrypted Application Data</text>
        <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#71717a"/></marker></defs>
      </svg>
    ),
    sshprotocol: (
      <svg viewBox="0 0 500 180" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">SSH Protocol Architecture</text>
        <rect x="20" y="30" width="145" height="140" rx="6" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeDasharray="4,4" />
        <text x="92" y="48" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="600">Transport Layer</text>
        <rect x="30" y="58" width="125" height="22" rx="3" fill="#60a5fa20" stroke="#60a5fa" />
        <text x="92" y="73" textAnchor="middle" fill="#fafafa" fontSize="7">Key Exchange (DH)</text>
        <rect x="30" y="85" width="125" height="22" rx="3" fill="#60a5fa20" stroke="#60a5fa" />
        <text x="92" y="100" textAnchor="middle" fill="#fafafa" fontSize="7">Encryption (AES)</text>
        <rect x="30" y="112" width="125" height="22" rx="3" fill="#60a5fa20" stroke="#60a5fa" />
        <text x="92" y="127" textAnchor="middle" fill="#fafafa" fontSize="7">Integrity (HMAC)</text>
        <rect x="30" y="139" width="125" height="22" rx="3" fill="#60a5fa20" stroke="#60a5fa" />
        <text x="92" y="154" textAnchor="middle" fill="#fafafa" fontSize="7">Compression</text>
        <rect x="178" y="30" width="145" height="140" rx="6" fill="rgba(251,191,36,0.08)" stroke="#fbbf24" strokeDasharray="4,4" />
        <text x="250" y="48" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="600">Auth Layer</text>
        <rect x="188" y="58" width="125" height="22" rx="3" fill="#fbbf2420" stroke="#fbbf24" />
        <text x="250" y="73" textAnchor="middle" fill="#fafafa" fontSize="7">🔑 Public Key</text>
        <rect x="188" y="85" width="125" height="22" rx="3" fill="#fbbf2420" stroke="#fbbf24" />
        <text x="250" y="100" textAnchor="middle" fill="#fafafa" fontSize="7">🔐 Password</text>
        <rect x="188" y="112" width="125" height="22" rx="3" fill="#fbbf2420" stroke="#fbbf24" />
        <text x="250" y="127" textAnchor="middle" fill="#fafafa" fontSize="7">📜 Certificate</text>
        <rect x="188" y="139" width="125" height="22" rx="3" fill="#fbbf2420" stroke="#fbbf24" />
        <text x="250" y="154" textAnchor="middle" fill="#fafafa" fontSize="7">🔢 MFA/TOTP</text>
        <rect x="336" y="30" width="145" height="140" rx="6" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeDasharray="4,4" />
        <text x="408" y="48" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="600">Connection Layer</text>
        <rect x="346" y="58" width="125" height="22" rx="3" fill="#4ade8020" stroke="#4ade80" />
        <text x="408" y="73" textAnchor="middle" fill="#fafafa" fontSize="7">Terminal Session</text>
        <rect x="346" y="85" width="125" height="22" rx="3" fill="#4ade8020" stroke="#4ade80" />
        <text x="408" y="100" textAnchor="middle" fill="#fafafa" fontSize="7">Port Forwarding</text>
        <rect x="346" y="112" width="125" height="22" rx="3" fill="#4ade8020" stroke="#4ade80" />
        <text x="408" y="127" textAnchor="middle" fill="#fafafa" fontSize="7">SFTP/SCP</text>
        <rect x="346" y="139" width="125" height="22" rx="3" fill="#4ade8020" stroke="#4ade80" />
        <text x="408" y="154" textAnchor="middle" fill="#fafafa" fontSize="7">X11 Forwarding</text>
      </svg>
    ),
    ipv4v6: (
      <svg viewBox="0 0 500 170" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">IPv4 vs IPv6 Comparison</text>
        <rect x="20" y="28" width="220" height="130" rx="6" fill="rgba(251,146,60,0.08)" stroke="#fb923c" strokeWidth="2" />
        <text x="130" y="48" textAnchor="middle" fill="#fb923c" fontSize="11" fontWeight="600">IPv4</text>
        <text x="35" y="68" fill="#fafafa" fontSize="7">📏 32-bit (4.3 billion addresses)</text>
        <text x="35" y="85" fill="#fafafa" fontSize="7">📝 192.168.1.1</text>
        <text x="35" y="102" fill="#fafafa" fontSize="7">🔄 NAT required for address reuse</text>
        <text x="35" y="119" fill="#fafafa" fontSize="7">📊 Variable header (20-60 bytes)</text>
        <text x="35" y="136" fill="#fafafa" fontSize="7">✓ ~75% of Internet traffic</text>
        <text x="35" y="150" fill="#f87171" fontSize="6">⚠️ Address exhaustion since 2015</text>
        <rect x="260" y="28" width="220" height="130" rx="6" fill="rgba(74,222,128,0.08)" stroke="#4ade80" strokeWidth="2" />
        <text x="370" y="48" textAnchor="middle" fill="#4ade80" fontSize="11" fontWeight="600">IPv6</text>
        <text x="275" y="68" fill="#fafafa" fontSize="7">📏 128-bit (340 undecillion)</text>
        <text x="275" y="85" fill="#fafafa" fontSize="7">📝 2001:0db8:85a3::8a2e:0370</text>
        <text x="275" y="102" fill="#fafafa" fontSize="7">🚫 No NAT needed</text>
        <text x="275" y="119" fill="#fafafa" fontSize="7">📊 Fixed header (40 bytes)</text>
        <text x="275" y="136" fill="#fafafa" fontSize="7">📈 ~40% adoption, growing</text>
        <text x="275" y="150" fill="#4ade80" fontSize="6">✓ Mandatory IPsec, auto-config</text>
      </svg>
    ),
    tcpudp: (
      <svg viewBox="0 0 500 180" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">TCP vs UDP: When to Use Each</text>
        <rect x="20" y="28" width="220" height="140" rx="6" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="2" />
        <text x="130" y="48" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">TCP (Reliable)</text>
        <text x="35" y="68" fill="#4ade80" fontSize="7">✓ Guaranteed delivery</text>
        <text x="35" y="83" fill="#4ade80" fontSize="7">✓ Ordered packets</text>
        <text x="35" y="98" fill="#4ade80" fontSize="7">✓ Congestion control</text>
        <text x="35" y="113" fill="#f87171" fontSize="7">✗ Higher latency (handshake)</text>
        <text x="35" y="128" fill="#f87171" fontSize="7">✗ Head-of-line blocking</text>
        <text x="35" y="150" fill="#71717a" fontSize="6">Use: HTTP, Email, File transfer</text>
        <text x="35" y="162" fill="#60a5fa" fontSize="6">Netflix, Stripe, GitHub</text>
        <rect x="260" y="28" width="220" height="140" rx="6" fill="rgba(251,146,60,0.08)" stroke="#fb923c" strokeWidth="2" />
        <text x="370" y="48" textAnchor="middle" fill="#fb923c" fontSize="11" fontWeight="600">UDP (Fast)</text>
        <text x="275" y="68" fill="#4ade80" fontSize="7">✓ Lower latency</text>
        <text x="275" y="83" fill="#4ade80" fontSize="7">✓ No connection overhead</text>
        <text x="275" y="98" fill="#4ade80" fontSize="7">✓ Multicast support</text>
        <text x="275" y="113" fill="#f87171" fontSize="7">✗ No delivery guarantee</text>
        <text x="275" y="128" fill="#f87171" fontSize="7">✗ No ordering</text>
        <text x="275" y="150" fill="#71717a" fontSize="6">Use: Gaming, VoIP, DNS, Streaming</text>
        <text x="275" y="162" fill="#fb923c" fontSize="6">Discord, Zoom, Twitch, QUIC</text>
      </svg>
    ),
    netprotocols: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Top 8 Network Protocols</text>
        {[
          { x: 20, y: 28, name: 'HTTP/1.1', desc: 'Text, Keep-alive', color: '#60a5fa', use: 'Legacy web' },
          { x: 145, y: 28, name: 'HTTP/2', desc: 'Binary, Multiplex', color: '#4ade80', use: 'Modern web' },
          { x: 270, y: 28, name: 'HTTP/3', desc: 'QUIC, No HOL', color: '#22d3ee', use: 'Google, CF' },
          { x: 395, y: 28, name: 'WebSocket', desc: 'Full-duplex', color: '#a78bfa', use: 'Chat, Gaming' },
          { x: 20, y: 110, name: 'gRPC', desc: 'Protobuf, Stream', color: '#f472b6', use: 'Microservices' },
          { x: 145, y: 110, name: 'GraphQL', desc: 'Query language', color: '#fb923c', use: 'APIs' },
          { x: 270, y: 110, name: 'MQTT', desc: 'Pub/Sub, Light', color: '#fbbf24', use: 'IoT' },
          { x: 395, y: 110, name: 'AMQP', desc: 'Message queue', color: '#f87171', use: 'Enterprise' }
        ].map((p, i) => (
          <g key={i}>
            <rect x={p.x} y={p.y} width="105" height="70" rx="6" fill={`${p.color}15`} stroke={p.color} strokeWidth="1.5" />
            <text x={p.x + 52} y={p.y + 20} textAnchor="middle" fill={p.color} fontSize="9" fontWeight="600">{p.name}</text>
            <text x={p.x + 52} y={p.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="7">{p.desc}</text>
            <text x={p.x + 52} y={p.y + 55} textAnchor="middle" fill="#71717a" fontSize="6">{p.use}</text>
          </g>
        ))}
      </svg>
    ),
    oauth2flows: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">OAuth 2.0 Four Flows - Google, GitHub, Okta</text>
        <rect x="20" y="30" width="110" height="75" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="75" y="50" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Authorization Code</text>
        <text x="75" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Server-side apps</text>
        <text x="75" y="80" textAnchor="middle" fill="#71717a" fontSize="6">Most secure</text>
        <text x="75" y="95" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Recommended</text>
        <rect x="140" y="30" width="110" height="75" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="195" y="50" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">PKCE Flow</text>
        <text x="195" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Mobile/SPA apps</text>
        <text x="195" y="80" textAnchor="middle" fill="#71717a" fontSize="6">Code verifier</text>
        <text x="195" y="95" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Modern standard</text>
        <rect x="260" y="30" width="110" height="75" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="315" y="50" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">Client Credentials</text>
        <text x="315" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Service-to-service</text>
        <text x="315" y="80" textAnchor="middle" fill="#71717a" fontSize="6">No user context</text>
        <text x="315" y="95" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ M2M auth</text>
        <rect x="380" y="30" width="110" height="75" rx="6" fill="#f8717115" stroke="#f87171" strokeWidth="1.5" />
        <text x="435" y="50" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="600">Implicit (Deprecated)</text>
        <text x="435" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Legacy SPAs</text>
        <text x="435" y="80" textAnchor="middle" fill="#71717a" fontSize="6">Token in URL</text>
        <text x="435" y="95" textAnchor="middle" fill="#f87171" fontSize="6">✗ Use PKCE instead</text>
        <rect x="20" y="115" width="470" height="75" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="135" textAnchor="middle" fill="#fafafa" fontSize="10" fontWeight="600">Authorization Code + PKCE Flow</text>
        <text x="250" y="155" textAnchor="middle" fill="#a1a1aa" fontSize="8">App → Auth Server (code_challenge) → User Login → Code → App (code_verifier) → Tokens</text>
        <text x="250" y="175" textAnchor="middle" fill="#4ade80" fontSize="7">✓ No client secret exposed • ✓ CSRF protection • ✓ Works in browsers</text>
      </svg>
    ),
    sessiontoken: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Session vs Cookie vs JWT - Auth0, Okta comparison</text>
        <rect x="20" y="30" width="145" height="90" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="92" y="50" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">🍪 Session Cookie</text>
        <text x="92" y="68" textAnchor="middle" fill="#a1a1aa" fontSize="7">Server stores session</text>
        <text x="92" y="82" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Easy revocation</text>
        <text x="92" y="95" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Secure HttpOnly</text>
        <text x="92" y="108" textAnchor="middle" fill="#f87171" fontSize="6">✗ Server state needed</text>
        <rect x="177" y="30" width="145" height="90" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="250" y="50" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="600">🎫 JWT Token</text>
        <text x="250" y="68" textAnchor="middle" fill="#a1a1aa" fontSize="7">Self-contained claims</text>
        <text x="250" y="82" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Stateless/scalable</text>
        <text x="250" y="95" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Cross-domain</text>
        <text x="250" y="108" textAnchor="middle" fill="#f87171" fontSize="6">✗ Hard to revoke</text>
        <rect x="335" y="30" width="145" height="90" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="407" y="50" textAnchor="middle" fill="#fb923c" fontSize="10" fontWeight="600">🔄 Refresh Token</text>
        <text x="407" y="68" textAnchor="middle" fill="#a1a1aa" fontSize="7">Long-lived rotation</text>
        <text x="407" y="82" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Short access tokens</text>
        <text x="407" y="95" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Rotation security</text>
        <text x="407" y="108" textAnchor="middle" fill="#f87171" fontSize="6">✗ Complex implementation</text>
        <rect x="20" y="130" width="470" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="150" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Best Practice: Short JWT (15min) + Refresh Token + Secure Cookie Storage</text>
        <text x="250" y="170" textAnchor="middle" fill="#71717a" fontSize="7">Store tokens in HttpOnly cookies (not localStorage) • Use refresh token rotation • Implement token blacklist for logout</text>
      </svg>
    ),
    dataprotection: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Encoding vs Encryption vs Tokenization - Stripe, PCI DSS</text>
        <rect x="20" y="30" width="145" height="85" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="92" y="50" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">📝 Encoding</text>
        <text x="92" y="68" textAnchor="middle" fill="#a1a1aa" fontSize="7">Base64, URL encode</text>
        <text x="92" y="82" textAnchor="middle" fill="#22d3ee" fontSize="6">Purpose: Data format</text>
        <text x="92" y="95" textAnchor="middle" fill="#f87171" fontSize="6">NOT for security</text>
        <text x="92" y="108" textAnchor="middle" fill="#71717a" fontSize="6">Reversible by anyone</text>
        <rect x="177" y="30" width="145" height="85" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="250" y="50" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">🔐 Encryption</text>
        <text x="250" y="68" textAnchor="middle" fill="#a1a1aa" fontSize="7">AES-256, RSA</text>
        <text x="250" y="82" textAnchor="middle" fill="#22d3ee" fontSize="6">Purpose: Confidentiality</text>
        <text x="250" y="95" textAnchor="middle" fill="#22d3ee" fontSize="6">Key required to decrypt</text>
        <text x="250" y="108" textAnchor="middle" fill="#71717a" fontSize="6">Mathematically secure</text>
        <rect x="335" y="30" width="145" height="85" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="407" y="50" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="600">🎰 Tokenization</text>
        <text x="407" y="68" textAnchor="middle" fill="#a1a1aa" fontSize="7">Replace with token</text>
        <text x="407" y="82" textAnchor="middle" fill="#22d3ee" fontSize="6">Purpose: PCI compliance</text>
        <text x="407" y="95" textAnchor="middle" fill="#22d3ee" fontSize="6">Original in vault</text>
        <text x="407" y="108" textAnchor="middle" fill="#71717a" fontSize="6">Format-preserving</text>
        <rect x="20" y="125" width="470" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="145" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Use Case: Credit Card 4242-4242-4242-4242</text>
        <text x="250" y="162" textAnchor="middle" fill="#71717a" fontSize="7">Encoded: NDI0Mi00MjQy... | Encrypted: aGVsbG8gd29ybGQ= | Tokenized: tok_visa_4242</text>
        <text x="250" y="178" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Stripe uses tokenization for PCI DSS compliance - original card never touches your servers</text>
      </svg>
    ),
    devsecops: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">DevSecOps Pipeline - Snyk, SonarQube, Trivy</text>
        {[
          { x: 20, name: 'Plan', tools: 'Threat Model', color: '#60a5fa' },
          { x: 100, name: 'Code', tools: 'SAST, Secrets', color: '#4ade80' },
          { x: 180, name: 'Build', tools: 'SCA, SBOM', color: '#22d3ee' },
          { x: 260, name: 'Test', tools: 'DAST, IAST', color: '#a78bfa' },
          { x: 340, name: 'Deploy', tools: 'IaC Scan', color: '#fb923c' },
          { x: 420, name: 'Monitor', tools: 'SIEM, WAF', color: '#f472b6' }
        ].map((s, i) => (
          <g key={i}>
            <rect x={s.x} y="30" width="70" height="50" rx="6" fill={`${s.color}15`} stroke={s.color} strokeWidth="1.5" />
            <text x={s.x + 35} y="50" textAnchor="middle" fill={s.color} fontSize="9" fontWeight="600">{s.name}</text>
            <text x={s.x + 35} y="68" textAnchor="middle" fill="#a1a1aa" fontSize="6">{s.tools}</text>
            {i < 5 && <path d={`M${s.x + 75} 55 L${s.x + 95} 55`} stroke="#3f3f46" strokeWidth="1.5" markerEnd="url(#arrow)" />}
          </g>
        ))}
        <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#3f3f46" /></marker></defs>
        <rect x="20" y="95" width="225" height="90" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="115" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Security Tools</text>
        <text x="132" y="132" textAnchor="middle" fill="#4ade80" fontSize="7">SAST: Snyk Code, SonarQube</text>
        <text x="132" y="146" textAnchor="middle" fill="#a78bfa" fontSize="7">DAST: OWASP ZAP, Burp Suite</text>
        <text x="132" y="160" textAnchor="middle" fill="#22d3ee" fontSize="7">SCA: Snyk Open Source, Dependabot</text>
        <text x="132" y="174" textAnchor="middle" fill="#fb923c" fontSize="7">IaC: Checkov, tfsec, Trivy</text>
        <rect x="255" y="95" width="235" height="90" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="372" y="115" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Shift Left Benefits</text>
        <text x="372" y="132" textAnchor="middle" fill="#71717a" fontSize="7">• Find vulnerabilities early (10x cheaper)</text>
        <text x="372" y="146" textAnchor="middle" fill="#71717a" fontSize="7">• Block vulnerable deps at PR</text>
        <text x="372" y="160" textAnchor="middle" fill="#71717a" fontSize="7">• Automated security gates</text>
        <text x="372" y="174" textAnchor="middle" fill="#71717a" fontSize="7">• Compliance as code</text>
      </svg>
    ),
    securitydomains: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">12 Security Domains - OWASP, NIST Framework</text>
        {[
          { x: 20, y: 28, name: 'Authentication', icon: '🔐', color: '#4ade80' },
          { x: 145, y: 28, name: 'Authorization', icon: '👤', color: '#22d3ee' },
          { x: 270, y: 28, name: 'Input Validation', icon: '✅', color: '#a78bfa' },
          { x: 395, y: 28, name: 'Crypto', icon: '🔒', color: '#f472b6' },
          { x: 20, y: 78, name: 'Error Handling', icon: '⚠️', color: '#fb923c' },
          { x: 145, y: 78, name: 'Logging', icon: '📝', color: '#fbbf24' },
          { x: 270, y: 78, name: 'Data Protection', icon: '💾', color: '#60a5fa' },
          { x: 395, y: 78, name: 'Communication', icon: '📡', color: '#f87171' },
          { x: 20, y: 128, name: 'Config Mgmt', icon: '⚙️', color: '#2dd4bf' },
          { x: 145, y: 128, name: 'DB Security', icon: '🗄️', color: '#e879f9' },
          { x: 270, y: 128, name: 'File Handling', icon: '📁', color: '#84cc16' },
          { x: 395, y: 128, name: 'Memory Mgmt', icon: '🧠', color: '#06b6d4' }
        ].map((d, i) => (
          <g key={i}>
            <rect x={d.x} y={d.y} width="115" height="42" rx="5" fill={`${d.color}15`} stroke={d.color} strokeWidth="1.5" />
            <text x={d.x + 16} y={d.y + 26} fill="#fafafa" fontSize="12">{d.icon}</text>
            <text x={d.x + 32} y={d.y + 26} fill={d.color} fontSize="8" fontWeight="600">{d.name}</text>
          </g>
        ))}
        <rect x="20" y="178" width="470" height="35" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="195" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Key Principles: Defense in Depth • Least Privilege • Fail Secure • Separation of Duties</text>
        <text x="250" y="208" textAnchor="middle" fill="#71717a" fontSize="7">Based on OWASP Secure Coding Practices & NIST Cybersecurity Framework</text>
      </svg>
    ),
    apisecurity: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">OWASP API Security Top 10 - Cloudflare, AWS WAF</text>
        {[
          { x: 20, y: 28, name: 'Broken Auth', rank: '1', color: '#f87171', risk: 'Critical' },
          { x: 145, y: 28, name: 'Broken Object Auth', rank: '2', color: '#f87171', risk: 'Critical' },
          { x: 270, y: 28, name: 'Data Exposure', rank: '3', color: '#fb923c', risk: 'High' },
          { x: 395, y: 28, name: 'Rate Limiting', rank: '4', color: '#fb923c', risk: 'High' },
          { x: 20, y: 78, name: 'Function Auth', rank: '5', color: '#fbbf24', risk: 'Medium' },
          { x: 145, y: 78, name: 'Mass Assignment', rank: '6', color: '#fbbf24', risk: 'Medium' },
          { x: 270, y: 78, name: 'Security Misconfig', rank: '7', color: '#fbbf24', risk: 'Medium' },
          { x: 395, y: 78, name: 'Injection', rank: '8', color: '#f87171', risk: 'Critical' }
        ].map((v, i) => (
          <g key={i}>
            <rect x={v.x} y={v.y} width="115" height="42" rx="5" fill={`${v.color}15`} stroke={v.color} strokeWidth="1.5" />
            <text x={v.x + 12} y={v.y + 18} fill={v.color} fontSize="10" fontWeight="700">#{v.rank}</text>
            <text x={v.x + 30} y={v.y + 18} fill="#fafafa" fontSize="8">{v.name}</text>
            <text x={v.x + 57} y={v.y + 34} textAnchor="middle" fill="#71717a" fontSize="6">{v.risk}</text>
          </g>
        ))}
        <rect x="20" y="130" width="470" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="148" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Essential API Security Controls</text>
        <text x="130" y="165" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Rate limiting (429)</text>
        <text x="250" y="165" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Input validation</text>
        <text x="370" y="165" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Output encoding</text>
        <text x="130" y="180" textAnchor="middle" fill="#22d3ee" fontSize="7">✓ JWT validation</text>
        <text x="250" y="180" textAnchor="middle" fill="#22d3ee" fontSize="7">✓ API gateway</text>
        <text x="370" y="180" textAnchor="middle" fill="#22d3ee" fontSize="7">✓ WAF protection</text>
      </svg>
    ),
    apiauthmethods: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">REST API Authentication Methods - AWS, Stripe, GitHub</text>
        <rect x="20" y="30" width="110" height="85" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="75" y="50" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">🔑 API Key</text>
        <text x="75" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Header: X-API-Key</text>
        <text x="75" y="80" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Simple, fast</text>
        <text x="75" y="93" textAnchor="middle" fill="#f87171" fontSize="6">✗ No user context</text>
        <text x="75" y="106" textAnchor="middle" fill="#71717a" fontSize="6">Use: Internal APIs</text>
        <rect x="140" y="30" width="110" height="85" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="195" y="50" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">🔐 OAuth 2.0</text>
        <text x="195" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Bearer token</text>
        <text x="195" y="80" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Delegated access</text>
        <text x="195" y="93" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Scoped permissions</text>
        <text x="195" y="106" textAnchor="middle" fill="#71717a" fontSize="6">Use: Third-party</text>
        <rect x="260" y="30" width="110" height="85" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="315" y="50" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">🎫 JWT</text>
        <text x="315" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Self-contained</text>
        <text x="315" y="80" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Stateless</text>
        <text x="315" y="93" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Claims in token</text>
        <text x="315" y="106" textAnchor="middle" fill="#71717a" fontSize="6">Use: Microservices</text>
        <rect x="380" y="30" width="110" height="85" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="435" y="50" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">🔒 Basic Auth</text>
        <text x="435" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Base64 user:pass</text>
        <text x="435" y="80" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Universal support</text>
        <text x="435" y="93" textAnchor="middle" fill="#f87171" fontSize="6">✗ Credentials in header</text>
        <text x="435" y="106" textAnchor="middle" fill="#71717a" fontSize="6">Use: Dev/testing</text>
        <rect x="20" y="125" width="470" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="145" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Production Best Practices</text>
        <text x="130" y="162" textAnchor="middle" fill="#71717a" fontSize="7">AWS: IAM + SigV4 signing</text>
        <text x="250" y="162" textAnchor="middle" fill="#71717a" fontSize="7">Stripe: API key + webhook signatures</text>
        <text x="370" y="162" textAnchor="middle" fill="#71717a" fontSize="7">GitHub: OAuth + PAT tokens</text>
        <text x="250" y="178" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Always use HTTPS • ✓ Rotate keys regularly • ✓ Use short-lived tokens</text>
      </svg>
    ),
    dbdatastructures: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Database Data Structures - LevelDB, RocksDB, Cassandra</text>
        <rect x="20" y="30" width="110" height="75" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="75" y="50" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">🌲 B-Tree</text>
        <text x="75" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Balanced, sorted</text>
        <text x="75" y="80" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Read optimized</text>
        <text x="75" y="95" textAnchor="middle" fill="#71717a" fontSize="6">PostgreSQL, MySQL</text>
        <rect x="140" y="30" width="110" height="75" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="195" y="50" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">📚 LSM Tree</text>
        <text x="195" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Log-structured merge</text>
        <text x="195" y="80" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Write optimized</text>
        <text x="195" y="95" textAnchor="middle" fill="#71717a" fontSize="6">RocksDB, Cassandra</text>
        <rect x="260" y="30" width="110" height="75" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="315" y="50" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">📋 SSTable</text>
        <text x="315" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Sorted string table</text>
        <text x="315" y="80" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Immutable, fast</text>
        <text x="315" y="95" textAnchor="middle" fill="#71717a" fontSize="6">BigTable, LevelDB</text>
        <rect x="380" y="30" width="110" height="75" rx="6" fill="#22d3ee15" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="435" y="50" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="600">⏭️ Skiplist</text>
        <text x="435" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Probabilistic layers</text>
        <text x="435" y="80" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Simple, O(log n)</text>
        <text x="435" y="95" textAnchor="middle" fill="#71717a" fontSize="6">Redis, MemTable</text>
        <rect x="20" y="115" width="470" height="70" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="135" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">LSM Tree Write Path: MemTable → WAL → SSTable → Compaction</text>
        <text x="250" y="155" textAnchor="middle" fill="#71717a" fontSize="7">Write: O(1) to memory + O(1) WAL | Read: Check bloom filter → MemTable → SSTables</text>
        <text x="250" y="175" textAnchor="middle" fill="#4ade80" fontSize="7">B-Tree: Read-heavy OLTP | LSM: Write-heavy workloads | Skiplist: In-memory sorted data</text>
      </svg>
    ),
    sqloptimization: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">SQL Query Optimization - PostgreSQL EXPLAIN ANALYZE</text>
        {[
          { x: 20, name: 'Query', desc: 'Parse SQL', color: '#60a5fa' },
          { x: 100, name: 'Plan', desc: 'Cost estimate', color: '#4ade80' },
          { x: 180, name: 'Optimize', desc: 'Choose path', color: '#a78bfa' },
          { x: 260, name: 'Execute', desc: 'Run plan', color: '#22d3ee' },
          { x: 340, name: 'Fetch', desc: 'Return rows', color: '#fb923c' }
        ].map((s, i) => (
          <g key={i}>
            <rect x={s.x} y="30" width="70" height="45" rx="6" fill={`${s.color}15`} stroke={s.color} strokeWidth="1.5" />
            <text x={s.x + 35} y="48" textAnchor="middle" fill={s.color} fontSize="8" fontWeight="600">{s.name}</text>
            <text x={s.x + 35} y="63" textAnchor="middle" fill="#a1a1aa" fontSize="6">{s.desc}</text>
            {i < 4 && <path d={`M${s.x + 75} 52 L${s.x + 95} 52`} stroke="#3f3f46" strokeWidth="1.5" />}
          </g>
        ))}
        <rect x="420" y="30" width="70" height="45" rx="6" fill="#f4728015" stroke="#f472b6" strokeWidth="1.5" />
        <text x="455" y="48" textAnchor="middle" fill="#f472b6" fontSize="8" fontWeight="600">Cache</text>
        <text x="455" y="63" textAnchor="middle" fill="#a1a1aa" fontSize="6">Plan cache</text>
        <rect x="20" y="85" width="225" height="100" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="102" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Index Strategies</text>
        <text x="132" y="118" textAnchor="middle" fill="#4ade80" fontSize="7">B-Tree: =, &lt;, &gt;, BETWEEN, LIKE 'x%'</text>
        <text x="132" y="132" textAnchor="middle" fill="#a78bfa" fontSize="7">Hash: = only, faster point lookups</text>
        <text x="132" y="146" textAnchor="middle" fill="#22d3ee" fontSize="7">GIN: Arrays, JSONB, full-text</text>
        <text x="132" y="160" textAnchor="middle" fill="#fb923c" fontSize="7">GiST: Geometry, range types</text>
        <text x="132" y="174" textAnchor="middle" fill="#f472b6" fontSize="7">Composite: Multi-column (left-most)</text>
        <rect x="255" y="85" width="235" height="100" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="372" y="102" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Common Pitfalls</text>
        <text x="372" y="118" textAnchor="middle" fill="#f87171" fontSize="7">✗ SELECT * (fetch all columns)</text>
        <text x="372" y="132" textAnchor="middle" fill="#f87171" fontSize="7">✗ Functions on indexed columns</text>
        <text x="372" y="146" textAnchor="middle" fill="#f87171" fontSize="7">✗ LIKE '%x' (cant use index)</text>
        <text x="372" y="160" textAnchor="middle" fill="#f87171" fontSize="7">✗ Implicit type conversion</text>
        <text x="372" y="174" textAnchor="middle" fill="#f87171" fontSize="7">✗ Missing stats (ANALYZE)</text>
      </svg>
    ),
    dbtransactions: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Database Transactions - ACID & Isolation Levels</text>
        <rect x="20" y="30" width="110" height="55" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="75" y="48" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">⚛️ Atomicity</text>
        <text x="75" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">All or nothing</text>
        <text x="75" y="78" textAnchor="middle" fill="#71717a" fontSize="6">Rollback on failure</text>
        <rect x="140" y="30" width="110" height="55" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="195" y="48" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">✅ Consistency</text>
        <text x="195" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Valid state only</text>
        <text x="195" y="78" textAnchor="middle" fill="#71717a" fontSize="6">Constraints enforced</text>
        <rect x="260" y="30" width="110" height="55" rx="6" fill="#22d3ee15" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="315" y="48" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="600">🔒 Isolation</text>
        <text x="315" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Concurrent txns</text>
        <text x="315" y="78" textAnchor="middle" fill="#71717a" fontSize="6">Appear sequential</text>
        <rect x="380" y="30" width="110" height="55" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="435" y="48" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">💾 Durability</text>
        <text x="435" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Permanent on commit</text>
        <text x="435" y="78" textAnchor="middle" fill="#71717a" fontSize="6">WAL guarantees</text>
        <rect x="20" y="95" width="470" height="90" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="112" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Isolation Levels (weakest → strongest)</text>
        <text x="65" y="132" textAnchor="middle" fill="#f87171" fontSize="7">Read Uncommitted</text>
        <text x="65" y="145" textAnchor="middle" fill="#71717a" fontSize="6">Dirty reads ✗</text>
        <text x="175" y="132" textAnchor="middle" fill="#fb923c" fontSize="7">Read Committed</text>
        <text x="175" y="145" textAnchor="middle" fill="#71717a" fontSize="6">PG default</text>
        <text x="285" y="132" textAnchor="middle" fill="#4ade80" fontSize="7">Repeatable Read</text>
        <text x="285" y="145" textAnchor="middle" fill="#71717a" fontSize="6">MySQL default</text>
        <text x="395" y="132" textAnchor="middle" fill="#22d3ee" fontSize="7">Serializable</text>
        <text x="395" y="145" textAnchor="middle" fill="#71717a" fontSize="6">Strictest, slow</text>
        <text x="250" y="170" textAnchor="middle" fill="#71717a" fontSize="7">Phenomena: Dirty Read → Non-repeatable Read → Phantom Read → Write Skew</text>
      </svg>
    ),
    dbmodels: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">6 Database Models - Evolution of Data Storage</text>
        {[
          { x: 20, y: 28, name: 'Flat File', era: '1960s', color: '#71717a', use: 'CSV, logs' },
          { x: 145, y: 28, name: 'Hierarchical', era: '1970s', color: '#60a5fa', use: 'XML, LDAP' },
          { x: 270, y: 28, name: 'Network', era: '1970s', color: '#a78bfa', use: 'CODASYL' },
          { x: 395, y: 28, name: 'Relational', era: '1980s+', color: '#4ade80', use: 'PostgreSQL' },
          { x: 85, y: 105, name: 'Star Schema', era: 'OLAP', color: '#fb923c', use: 'Analytics' },
          { x: 270, y: 105, name: 'Snowflake', era: 'OLAP', color: '#22d3ee', use: 'Normalized DW' }
        ].map((m, i) => (
          <g key={i}>
            <rect x={m.x} y={m.y} width="115" height="65" rx="6" fill={`${m.color}15`} stroke={m.color} strokeWidth="1.5" />
            <text x={m.x + 57} y={m.y + 20} textAnchor="middle" fill={m.color} fontSize="9" fontWeight="600">{m.name}</text>
            <text x={m.x + 57} y={m.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="7">{m.era}</text>
            <text x={m.x + 57} y={m.y + 52} textAnchor="middle" fill="#71717a" fontSize="6">{m.use}</text>
          </g>
        ))}
        <rect x="395" y="105" width="95" height="65" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="442" y="125" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Modern</text>
        <text x="442" y="140" textAnchor="middle" fill="#f472b6" fontSize="7">Document</text>
        <text x="442" y="152" textAnchor="middle" fill="#f87171" fontSize="7">Graph</text>
        <text x="442" y="164" textAnchor="middle" fill="#fbbf24" fontSize="7">Key-Value</text>
        <text x="250" y="188" textAnchor="middle" fill="#4ade80" fontSize="7">Relational: OLTP | Star/Snowflake: OLAP | Document: Flexibility | Graph: Relationships</text>
      </svg>
    ),
    shardingguide: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Database Sharding Strategies - Vitess, CockroachDB, Instagram</text>
        <rect x="20" y="30" width="110" height="75" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="75" y="48" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">📊 Range Shard</text>
        <text x="75" y="63" textAnchor="middle" fill="#a1a1aa" fontSize="7">A-M → Shard1</text>
        <text x="75" y="78" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Range queries</text>
        <text x="75" y="93" textAnchor="middle" fill="#f87171" fontSize="6">✗ Hotspots</text>
        <rect x="140" y="30" width="110" height="75" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="195" y="48" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">#️⃣ Hash Shard</text>
        <text x="195" y="63" textAnchor="middle" fill="#a1a1aa" fontSize="7">hash(key) % N</text>
        <text x="195" y="78" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Even distribution</text>
        <text x="195" y="93" textAnchor="middle" fill="#f87171" fontSize="6">✗ Resharding pain</text>
        <rect x="260" y="30" width="110" height="75" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="315" y="48" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">💍 Consistent Hash</text>
        <text x="315" y="63" textAnchor="middle" fill="#a1a1aa" fontSize="7">Hash ring</text>
        <text x="315" y="78" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Easy resharding</text>
        <text x="315" y="93" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Add nodes easily</text>
        <rect x="380" y="30" width="110" height="75" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="435" y="48" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">🪣 Virtual Buckets</text>
        <text x="435" y="63" textAnchor="middle" fill="#a1a1aa" fontSize="7">Logical → Physical</text>
        <text x="435" y="78" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Flexible mapping</text>
        <text x="435" y="93" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Cassandra style</text>
        <rect x="20" y="115" width="470" height="70" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="135" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Shard Key Selection (Critical Decision)</text>
        <text x="250" y="155" textAnchor="middle" fill="#71717a" fontSize="7">Instagram: user_id % 4096 shards | Vitess: vschema mapping | CockroachDB: auto-sharding with ranges</text>
        <text x="250" y="175" textAnchor="middle" fill="#4ade80" fontSize="7">✓ High cardinality • ✓ Even distribution • ✓ Query locality • ✗ Avoid timestamps</text>
      </svg>
    ),
    pgecosystem: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">PostgreSQL Ecosystem - Extensions & Tools</text>
        <rect x="200" y="25" width="100" height="40" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="2" />
        <text x="250" y="48" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="700">🐘 PostgreSQL</text>
        {[
          { x: 20, y: 80, name: 'TimescaleDB', desc: 'Time-series', color: '#60a5fa', use: 'IoT, metrics' },
          { x: 145, y: 80, name: 'pgVector', desc: 'Embeddings', color: '#a78bfa', use: 'AI/ML, RAG' },
          { x: 270, y: 80, name: 'PostGIS', desc: 'Geospatial', color: '#22d3ee', use: 'Maps, location' },
          { x: 395, y: 80, name: 'Apache AGE', desc: 'Graph queries', color: '#f472b6', use: 'Graph DB' },
          { x: 20, y: 140, name: 'pg_cron', desc: 'Job scheduler', color: '#fb923c', use: 'Background jobs' },
          { x: 145, y: 140, name: 'Citus', desc: 'Distributed', color: '#4ade80', use: 'Sharding' },
          { x: 270, y: 140, name: 'pg_stat', desc: 'Monitoring', color: '#fbbf24', use: 'Performance' },
          { x: 395, y: 140, name: 'pgBouncer', desc: 'Connection pool', color: '#f87171', use: 'Scaling' }
        ].map((e, i) => (
          <g key={i}>
            <rect x={e.x} y={e.y} width="115" height="50" rx="5" fill={`${e.color}15`} stroke={e.color} strokeWidth="1.5" />
            <text x={e.x + 57} y={e.y + 18} textAnchor="middle" fill={e.color} fontSize="8" fontWeight="600">{e.name}</text>
            <text x={e.x + 57} y={e.y + 32} textAnchor="middle" fill="#a1a1aa" fontSize="6">{e.desc}</text>
            <text x={e.x + 57} y={e.y + 44} textAnchor="middle" fill="#71717a" fontSize="5">{e.use}</text>
            <path d={`M${e.x + 57} ${e.y} L250 70`} stroke="#3f3f46" strokeWidth="0.5" strokeDasharray="2,2" />
          </g>
        ))}
      </svg>
    ),
    micropractices: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">9 Microservices Best Practices - Netflix, Uber, Spotify</text>
        {[
          { x: 20, y: 28, name: '1. Single Purpose', desc: 'One business capability', color: '#4ade80' },
          { x: 175, y: 28, name: '2. Separate DBs', desc: 'Database per service', color: '#60a5fa' },
          { x: 330, y: 28, name: '3. Stateless', desc: 'No local state', color: '#a78bfa' },
          { x: 20, y: 85, name: '4. Containers', desc: 'Docker + K8s', color: '#22d3ee' },
          { x: 175, y: 85, name: '5. API Gateway', desc: 'Single entry point', color: '#fb923c' },
          { x: 330, y: 85, name: '6. CI/CD', desc: 'Independent deploy', color: '#f472b6' },
          { x: 20, y: 142, name: '7. DDD', desc: 'Domain-driven design', color: '#fbbf24' },
          { x: 175, y: 142, name: '8. Event-Driven', desc: 'Async messaging', color: '#f87171' },
          { x: 330, y: 142, name: '9. Observability', desc: 'Logs, metrics, traces', color: '#2dd4bf' }
        ].map((p, i) => (
          <g key={i}>
            <rect x={p.x} y={p.y} width="145" height="48" rx="6" fill={`${p.color}15`} stroke={p.color} strokeWidth="1.5" />
            <text x={p.x + 72} y={p.y + 20} textAnchor="middle" fill={p.color} fontSize="8" fontWeight="600">{p.name}</text>
            <text x={p.x + 72} y={p.y + 36} textAnchor="middle" fill="#a1a1aa" fontSize="7">{p.desc}</text>
          </g>
        ))}
        <text x="250" y="210" textAnchor="middle" fill="#4ade80" fontSize="7">Netflix: 1000+ microservices | Uber: 2000+ | Spotify: 800+ autonomous squads</text>
      </svg>
    ),
    prodcomponents: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">9 Essential Production Components - Netflix, Amazon</text>
        {[
          { x: 20, y: 28, name: 'API Gateway', desc: 'ZUUL, Kong', color: '#4ade80', icon: '🚪' },
          { x: 175, y: 28, name: 'Service Registry', desc: 'Eureka, Consul', color: '#60a5fa', icon: '📋' },
          { x: 330, y: 28, name: 'Config Server', desc: 'Spring Cloud', color: '#a78bfa', icon: '⚙️' },
          { x: 20, y: 85, name: 'Auth Server', desc: 'OAuth2, Keycloak', color: '#22d3ee', icon: '🔐' },
          { x: 175, y: 85, name: 'Load Balancer', desc: 'Ribbon, ALB', color: '#fb923c', icon: '⚖️' },
          { x: 330, y: 85, name: 'Circuit Breaker', desc: 'Hystrix, Resilience4j', color: '#f472b6', icon: '🔌' },
          { x: 20, y: 142, name: 'Distributed Cache', desc: 'Redis, Memcached', color: '#fbbf24', icon: '🗄️' },
          { x: 175, y: 142, name: 'Message Broker', desc: 'Kafka, RabbitMQ', color: '#f87171', icon: '📨' },
          { x: 330, y: 142, name: 'Observability', desc: 'Jaeger, Prometheus', color: '#2dd4bf', icon: '👁️' }
        ].map((c, i) => (
          <g key={i}>
            <rect x={c.x} y={c.y} width="145" height="48" rx="6" fill={`${c.color}15`} stroke={c.color} strokeWidth="1.5" />
            <text x={c.x + 18} y={c.y + 28} fill="#fafafa" fontSize="14">{c.icon}</text>
            <text x={c.x + 85} y={c.y + 20} textAnchor="middle" fill={c.color} fontSize="8" fontWeight="600">{c.name}</text>
            <text x={c.x + 85} y={c.y + 36} textAnchor="middle" fill="#a1a1aa" fontSize="6">{c.desc}</text>
          </g>
        ))}
        <text x="250" y="210" textAnchor="middle" fill="#71717a" fontSize="7">Without these components, microservices become distributed chaos</text>
      </svg>
    ),
    servicediscovery: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Service Discovery - Consul, Eureka, DNS-based</text>
        <rect x="200" y="30" width="100" height="45" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="2" />
        <text x="250" y="48" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Service Registry</text>
        <text x="250" y="62" textAnchor="middle" fill="#a1a1aa" fontSize="7">Consul / Eureka</text>
        {[
          { x: 40, y: 100, name: 'Service A', instances: '3 instances', color: '#60a5fa' },
          { x: 190, y: 100, name: 'Service B', instances: '2 instances', color: '#a78bfa' },
          { x: 340, y: 100, name: 'Service C', instances: '4 instances', color: '#fb923c' }
        ].map((s, i) => (
          <g key={i}>
            <rect x={s.x} y={s.y} width="120" height="45" rx="6" fill={`${s.color}15`} stroke={s.color} strokeWidth="1.5" />
            <text x={s.x + 60} y={s.y + 20} textAnchor="middle" fill={s.color} fontSize="9" fontWeight="600">{s.name}</text>
            <text x={s.x + 60} y={s.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{s.instances}</text>
            <path d={`M${s.x + 60} ${s.y} L250 75`} stroke="#3f3f46" strokeWidth="1" strokeDasharray="3,3" />
          </g>
        ))}
        <rect x="20" y="160" width="460" height="30" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="178" textAnchor="middle" fill="#fafafa" fontSize="8">Register → Health Check → Query → Load Balance → Connect</text>
      </svg>
    ),
    disttracing: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Distributed Tracing - Jaeger, Zipkin, OpenTelemetry</text>
        <rect x="20" y="35" width="460" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="52" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Trace ID: abc-123-xyz (spans entire request)</text>
        {[
          { x: 40, name: 'Gateway', ms: '5ms', color: '#4ade80', width: 80 },
          { x: 130, name: 'Auth', ms: '15ms', color: '#60a5fa', width: 60 },
          { x: 200, name: 'Order Svc', ms: '45ms', color: '#a78bfa', width: 100 },
          { x: 310, name: 'Inventory', ms: '25ms', color: '#fb923c', width: 70 },
          { x: 390, name: 'DB', ms: '10ms', color: '#f87171', width: 50 }
        ].map((s, i) => (
          <g key={i}>
            <rect x={s.x} y="60" width={s.width} height="20" rx="3" fill={s.color} fillOpacity="0.3" stroke={s.color} />
            <text x={s.x + s.width / 2} y="73" textAnchor="middle" fill="#fafafa" fontSize="6">{s.name} ({s.ms})</text>
          </g>
        ))}
        <rect x="20" y="100" width="225" height="85" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="118" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Tracing Tools</text>
        <text x="132" y="135" textAnchor="middle" fill="#4ade80" fontSize="7">Jaeger - Uber (CNCF)</text>
        <text x="132" y="150" textAnchor="middle" fill="#60a5fa" fontSize="7">Zipkin - Twitter</text>
        <text x="132" y="165" textAnchor="middle" fill="#a78bfa" fontSize="7">OpenTelemetry - Standard</text>
        <text x="132" y="180" textAnchor="middle" fill="#fb923c" fontSize="7">AWS X-Ray - Cloud native</text>
        <rect x="255" y="100" width="225" height="85" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="367" y="118" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Key Concepts</text>
        <text x="367" y="135" textAnchor="middle" fill="#71717a" fontSize="7">Trace: Full request journey</text>
        <text x="367" y="150" textAnchor="middle" fill="#71717a" fontSize="7">Span: Single operation unit</text>
        <text x="367" y="165" textAnchor="middle" fill="#71717a" fontSize="7">Context: Propagated headers</text>
        <text x="367" y="180" textAnchor="middle" fill="#71717a" fontSize="7">Sampling: % of traces stored</text>
      </svg>
    ),
    heartbeatdetect: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">6 Heartbeat Detection Mechanisms - ZooKeeper, etcd, Consul</text>
        {[
          { x: 20, y: 28, name: 'Push-based', desc: 'Node sends heartbeats', color: '#4ade80', pro: 'Simple' },
          { x: 175, y: 28, name: 'Pull-based', desc: 'Monitor polls nodes', color: '#60a5fa', pro: 'Controlled' },
          { x: 330, y: 28, name: 'Gossip', desc: 'Peer-to-peer spread', color: '#a78bfa', pro: 'Scalable' },
          { x: 20, y: 100, name: 'Lease-based', desc: 'Time-bound validity', color: '#22d3ee', pro: 'Automatic cleanup' },
          { x: 175, y: 100, name: 'Phi Accrual', desc: 'Adaptive threshold', color: '#fb923c', pro: 'Accurate' },
          { x: 330, y: 100, name: 'SWIM', desc: 'Scalable protocol', color: '#f472b6', pro: 'Efficient' }
        ].map((h, i) => (
          <g key={i}>
            <rect x={h.x} y={h.y} width="145" height="60" rx="6" fill={`${h.color}15`} stroke={h.color} strokeWidth="1.5" />
            <text x={h.x + 72} y={h.y + 18} textAnchor="middle" fill={h.color} fontSize="8" fontWeight="600">{h.name}</text>
            <text x={h.x + 72} y={h.y + 34} textAnchor="middle" fill="#a1a1aa" fontSize="7">{h.desc}</text>
            <text x={h.x + 72} y={h.y + 50} textAnchor="middle" fill="#22d3ee" fontSize="6">✓ {h.pro}</text>
          </g>
        ))}
        <rect x="20" y="170" width="460" height="22" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="184" textAnchor="middle" fill="#71717a" fontSize="7">ZooKeeper: Session heartbeats | Cassandra: Gossip + Phi Accrual | Consul: Gossip + SWIM</text>
      </svg>
    ),
    commpatterns: (
      <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Microservices Communication Patterns</text>
        <rect x="20" y="30" width="225" height="75" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="132" y="48" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">Synchronous</text>
        <text x="132" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">REST, gRPC, GraphQL</text>
        <text x="132" y="80" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Simple, immediate response</text>
        <text x="132" y="93" textAnchor="middle" fill="#f87171" fontSize="6">✗ Tight coupling, cascading failure</text>
        <rect x="255" y="30" width="225" height="75" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="367" y="48" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="600">Asynchronous</text>
        <text x="367" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Kafka, RabbitMQ, SQS</text>
        <text x="367" y="80" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Loose coupling, resilient</text>
        <text x="367" y="93" textAnchor="middle" fill="#f87171" fontSize="6">✗ Complex debugging, eventual consistency</text>
        <rect x="20" y="115" width="225" height="75" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="132" y="133" textAnchor="middle" fill="#fb923c" fontSize="10" fontWeight="600">Choreography</text>
        <text x="132" y="150" textAnchor="middle" fill="#a1a1aa" fontSize="7">Services react to events</text>
        <text x="132" y="165" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Decentralized, flexible</text>
        <text x="132" y="178" textAnchor="middle" fill="#f87171" fontSize="6">✗ Hard to track flow</text>
        <rect x="255" y="115" width="225" height="75" rx="6" fill="#22d3ee15" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="367" y="133" textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="600">Orchestration</text>
        <text x="367" y="150" textAnchor="middle" fill="#a1a1aa" fontSize="7">Central coordinator</text>
        <text x="367" y="165" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Clear flow, easy to monitor</text>
        <text x="367" y="178" textAnchor="middle" fill="#f87171" fontSize="6">✗ Single point of failure</text>
      </svg>
    ),
    cloudcompare: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Cloud Service Comparison - AWS vs Azure vs GCP</text>
        <rect x="20" y="25" width="145" height="30" rx="4" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="92" y="44" textAnchor="middle" fill="#fb923c" fontSize="10" fontWeight="600">AWS</text>
        <rect x="177" y="25" width="145" height="30" rx="4" fill="#38bdf815" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="250" y="44" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="600">Azure</text>
        <rect x="335" y="25" width="145" height="30" rx="4" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="407" y="44" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">GCP</text>
        {[
          { cat: 'Compute', aws: 'EC2, Lambda', azure: 'VMs, Functions', gcp: 'Compute, Cloud Run' },
          { cat: 'Storage', aws: 'S3, EBS', azure: 'Blob, Disk', gcp: 'Cloud Storage' },
          { cat: 'Database', aws: 'RDS, DynamoDB', azure: 'SQL DB, Cosmos', gcp: 'Cloud SQL, Spanner' },
          { cat: 'Container', aws: 'EKS, ECS', azure: 'AKS, ACI', gcp: 'GKE, Cloud Run' },
          { cat: 'Serverless', aws: 'Lambda, Fargate', azure: 'Functions, ACA', gcp: 'Functions, Run' },
          { cat: 'CDN', aws: 'CloudFront', azure: 'Front Door', gcp: 'Cloud CDN' },
          { cat: 'ML/AI', aws: 'SageMaker', azure: 'ML Studio', gcp: 'Vertex AI' }
        ].map((row, i) => (
          <g key={i}>
            <text x="10" y={78 + i * 22} fill="#a1a1aa" fontSize="7" fontWeight="600">{row.cat}</text>
            <text x="92" y={78 + i * 22} textAnchor="middle" fill="#fb923c" fontSize="6">{row.aws}</text>
            <text x="250" y={78 + i * 22} textAnchor="middle" fill="#38bdf8" fontSize="6">{row.azure}</text>
            <text x="407" y={78 + i * 22} textAnchor="middle" fill="#4ade80" fontSize="6">{row.gcp}</text>
            <line x1="20" y1={83 + i * 22} x2="480" y2={83 + i * 22} stroke="#3f3f46" strokeWidth="0.5" />
          </g>
        ))}
        <rect x="20" y="215" width="460" height="20" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="228" textAnchor="middle" fill="#71717a" fontSize="7">AWS: 200+ services | Azure: Strong enterprise | GCP: Best for data/ML</text>
      </svg>
    ),
    disasterrecovery: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Disaster Recovery Strategies - RTO vs RPO Trade-offs</text>
        {[
          { x: 20, y: 30, name: 'Backup & Restore', rto: 'Hours', rpo: 'Hours', cost: '$', color: '#60a5fa', desc: 'Cheapest, slowest' },
          { x: 140, y: 30, name: 'Pilot Light', rto: '10s min', rpo: 'Minutes', cost: '$$', color: '#4ade80', desc: 'Core running' },
          { x: 260, y: 30, name: 'Warm Standby', rto: 'Minutes', rpo: 'Seconds', cost: '$$$', color: '#fbbf24', desc: 'Scaled-down copy' },
          { x: 380, y: 30, name: 'Hot Standby', rto: 'Seconds', rpo: 'Zero', cost: '$$$$', color: '#f87171', desc: 'Full active-active' }
        ].map((s, i) => (
          <g key={i}>
            <rect x={s.x} y={s.y} width="110" height="90" rx="6" fill={`${s.color}15`} stroke={s.color} strokeWidth="1.5" />
            <text x={s.x + 55} y={s.y + 18} textAnchor="middle" fill={s.color} fontSize="8" fontWeight="600">{s.name}</text>
            <text x={s.x + 55} y={s.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{s.desc}</text>
            <text x={s.x + 55} y={s.y + 52} textAnchor="middle" fill="#22d3ee" fontSize="6">RTO: {s.rto}</text>
            <text x={s.x + 55} y={s.y + 66} textAnchor="middle" fill="#a78bfa" fontSize="6">RPO: {s.rpo}</text>
            <text x={s.x + 55} y={s.y + 80} textAnchor="middle" fill="#fbbf24" fontSize="8">{s.cost}</text>
          </g>
        ))}
        <rect x="20" y="130" width="460" height="75" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="148" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Key Metrics</text>
        <text x="130" y="168" textAnchor="middle" fill="#22d3ee" fontSize="8">RTO: Recovery Time Objective</text>
        <text x="370" y="168" textAnchor="middle" fill="#a78bfa" fontSize="8">RPO: Recovery Point Objective</text>
        <text x="130" y="185" textAnchor="middle" fill="#71717a" fontSize="7">How long to recover?</text>
        <text x="370" y="185" textAnchor="middle" fill="#71717a" fontSize="7">How much data loss acceptable?</text>
        <text x="250" y="200" textAnchor="middle" fill="#4ade80" fontSize="7">Netflix: Multi-region active-active | Stripe: Hot standby | Banks: Zero RPO required</text>
      </svg>
    ),
    cloudcost: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">6 Cloud Cost Reduction Strategies - FinOps Best Practices</text>
        {[
          { x: 20, y: 28, name: '1. Reserved Instances', desc: '1-3 year commit', save: '30-72% off', color: '#4ade80' },
          { x: 175, y: 28, name: '2. Spot/Preemptible', desc: 'Unused capacity', save: '60-90% off', color: '#60a5fa' },
          { x: 330, y: 28, name: '3. Right-sizing', desc: 'Match instance to load', save: '20-40% off', color: '#a78bfa' },
          { x: 20, y: 100, name: '4. Auto-scaling', desc: 'Scale down off-peak', save: '30-50% off', color: '#22d3ee' },
          { x: 175, y: 100, name: '5. Storage Tiering', desc: 'S3 IA, Glacier', save: '40-80% off', color: '#fb923c' },
          { x: 330, y: 100, name: '6. Savings Plans', desc: 'Flexible commitment', save: '20-50% off', color: '#f472b6' }
        ].map((s, i) => (
          <g key={i}>
            <rect x={s.x} y={s.y} width="145" height="60" rx="6" fill={`${s.color}15`} stroke={s.color} strokeWidth="1.5" />
            <text x={s.x + 72} y={s.y + 18} textAnchor="middle" fill={s.color} fontSize="8" fontWeight="600">{s.name}</text>
            <text x={s.x + 72} y={s.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{s.desc}</text>
            <text x={s.x + 72} y={s.y + 50} textAnchor="middle" fill="#4ade80" fontSize="7" fontWeight="600">{s.save}</text>
          </g>
        ))}
        <rect x="20" y="170" width="460" height="40" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="188" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Tools: AWS Cost Explorer, Azure Cost Management, GCP Cost Management</text>
        <text x="250" y="202" textAnchor="middle" fill="#71717a" fontSize="7">Airbnb: 40% savings | Lyft: $100M saved | Spotify: 50% compute reduction</text>
      </svg>
    ),
    awsroadmap: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">AWS Services Learning Roadmap by Domain</text>
        {[
          { x: 20, y: 28, cat: 'Compute', services: 'EC2 → Lambda → ECS → EKS', color: '#fb923c', level: 'Start Here' },
          { x: 260, y: 28, cat: 'Storage', services: 'S3 → EBS → EFS → FSx', color: '#60a5fa', level: 'Essentials' },
          { x: 20, y: 85, cat: 'Database', services: 'RDS → DynamoDB → ElastiCache → Aurora', color: '#4ade80', level: 'Data Layer' },
          { x: 260, y: 85, cat: 'Networking', services: 'VPC → Route53 → CloudFront → API GW', color: '#a78bfa', level: 'Connectivity' },
          { x: 20, y: 142, cat: 'Security', services: 'IAM → KMS → Secrets Mgr → WAF', color: '#f87171', level: 'Critical' },
          { x: 260, y: 142, cat: 'DevOps', services: 'CodePipeline → CloudFormation → CDK', color: '#22d3ee', level: 'Automation' }
        ].map((d, i) => (
          <g key={i}>
            <rect x={d.x} y={d.y} width="220" height="48" rx="6" fill={`${d.color}15`} stroke={d.color} strokeWidth="1.5" />
            <text x={d.x + 10} y={d.y + 18} fill={d.color} fontSize="9" fontWeight="600">{d.cat}</text>
            <text x={d.x + 210} y={d.y + 18} textAnchor="end" fill="#71717a" fontSize="6">{d.level}</text>
            <text x={d.x + 110} y={d.y + 36} textAnchor="middle" fill="#a1a1aa" fontSize="7">{d.services}</text>
          </g>
        ))}
        <rect x="20" y="200" width="460" height="32" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="215" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Certifications: Cloud Practitioner → Solutions Architect → DevOps → Specialty</text>
        <text x="250" y="228" textAnchor="middle" fill="#71717a" fontSize="7">200+ AWS services | Start with 20 core services | Add as needed</text>
      </svg>
    ),
    cloudlb: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Cloud Load Balancer Decision Tree</text>
        <rect x="175" y="25" width="150" height="35" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="250" y="47" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Need Load Balancer?</text>
        <rect x="20" y="80" width="145" height="60" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="92" y="98" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">AWS</text>
        <text x="92" y="112" textAnchor="middle" fill="#a1a1aa" fontSize="6">ALB: HTTP/HTTPS (L7)</text>
        <text x="92" y="124" textAnchor="middle" fill="#a1a1aa" fontSize="6">NLB: TCP/UDP (L4)</text>
        <text x="92" y="136" textAnchor="middle" fill="#a1a1aa" fontSize="6">GWLB: Third-party</text>
        <rect x="177" y="80" width="145" height="60" rx="6" fill="#38bdf815" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="250" y="98" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="600">Azure</text>
        <text x="250" y="112" textAnchor="middle" fill="#a1a1aa" fontSize="6">App GW: HTTP/HTTPS (L7)</text>
        <text x="250" y="124" textAnchor="middle" fill="#a1a1aa" fontSize="6">Load Balancer: L4</text>
        <text x="250" y="136" textAnchor="middle" fill="#a1a1aa" fontSize="6">Front Door: Global</text>
        <rect x="335" y="80" width="145" height="60" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="407" y="98" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">GCP</text>
        <text x="407" y="112" textAnchor="middle" fill="#a1a1aa" fontSize="6">HTTP(S) LB: Global L7</text>
        <text x="407" y="124" textAnchor="middle" fill="#a1a1aa" fontSize="6">Network LB: Regional L4</text>
        <text x="407" y="136" textAnchor="middle" fill="#a1a1aa" fontSize="6">Internal LB: Private</text>
        <path d="M250 60 L92 80" stroke="#3f3f46" strokeWidth="1" />
        <path d="M250 60 L250 80" stroke="#3f3f46" strokeWidth="1" />
        <path d="M250 60 L407 80" stroke="#3f3f46" strokeWidth="1" />
        <rect x="20" y="150" width="460" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="168" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Decision Criteria</text>
        <text x="130" y="185" textAnchor="middle" fill="#22d3ee" fontSize="7">L7: Path routing, headers</text>
        <text x="370" y="185" textAnchor="middle" fill="#fb923c" fontSize="7">L4: Low latency, any protocol</text>
        <text x="250" y="198" textAnchor="middle" fill="#71717a" fontSize="7">Global: Multi-region | Regional: Single region | Internal: Private network</text>
      </svg>
    ),
    netflixstack: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Netflix Tech Stack - 200M+ subscribers, 1B+ hours/week</text>
        <rect x="20" y="25" width="460" height="30" rx="4" fill="#f8717115" stroke="#f87171" strokeWidth="1.5" />
        <text x="250" y="44" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="600">Clients: iOS, Android, TV, Web (React)</text>
        <rect x="20" y="60" width="460" height="30" rx="4" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="250" y="79" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">CDN: Open Connect (own CDN) - 15,000+ servers worldwide</text>
        <rect x="20" y="95" width="225" height="35" rx="4" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="132" y="116" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">API Gateway: ZUUL</text>
        <rect x="255" y="95" width="225" height="35" rx="4" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="367" y="116" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">GraphQL Federation</text>
        <rect x="20" y="135" width="145" height="50" rx="4" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="92" y="155" textAnchor="middle" fill="#a78bfa" fontSize="8" fontWeight="600">Microservices</text>
        <text x="92" y="170" textAnchor="middle" fill="#a1a1aa" fontSize="6">1000+ services</text>
        <text x="92" y="180" textAnchor="middle" fill="#a1a1aa" fontSize="6">Spring Boot + Java</text>
        <rect x="177" y="135" width="145" height="50" rx="4" fill="#22d3ee15" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="250" y="155" textAnchor="middle" fill="#22d3ee" fontSize="8" fontWeight="600">Service Discovery</text>
        <text x="250" y="170" textAnchor="middle" fill="#a1a1aa" fontSize="6">Eureka</text>
        <text x="250" y="180" textAnchor="middle" fill="#a1a1aa" fontSize="6">Client-side LB</text>
        <rect x="335" y="135" width="145" height="50" rx="4" fill="#fbbf2415" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="407" y="155" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="600">Resilience</text>
        <text x="407" y="170" textAnchor="middle" fill="#a1a1aa" fontSize="6">Hystrix, Resilience4j</text>
        <text x="407" y="180" textAnchor="middle" fill="#a1a1aa" fontSize="6">Circuit breakers</text>
        <rect x="20" y="190" width="225" height="35" rx="4" fill="#f472b615" stroke="#f472b6" strokeWidth="1.5" />
        <text x="132" y="211" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="600">Data: Cassandra, DynamoDB, EVCache</text>
        <rect x="255" y="190" width="225" height="35" rx="4" fill="#2dd4bf15" stroke="#2dd4bf" strokeWidth="1.5" />
        <text x="367" y="211" textAnchor="middle" fill="#2dd4bf" fontSize="9" fontWeight="600">Streaming: Kafka (700B events/day)</text>
        <rect x="20" y="230" width="460" height="22" rx="4" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="244" textAnchor="middle" fill="#71717a" fontSize="7">AWS: EC2, S3, CloudFront | Observability: Atlas metrics, Spectator, Mantis</text>
      </svg>
    ),
    netflixapi: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Netflix API Evolution - 2008 to Present</text>
        {[
          { x: 20, y: 30, era: '2008', name: 'Monolith', desc: 'Single Java app', color: '#f87171' },
          { x: 140, y: 30, era: '2012', name: 'Direct Access', desc: 'Clients call services', color: '#fb923c' },
          { x: 260, y: 30, era: '2014', name: 'API Gateway', desc: 'ZUUL + aggregation', color: '#4ade80' },
          { x: 380, y: 30, era: '2020+', name: 'GraphQL Fed', desc: 'Studio API', color: '#60a5fa' }
        ].map((e, i) => (
          <g key={i}>
            <rect x={e.x} y={e.y} width="110" height="70" rx="6" fill={`${e.color}15`} stroke={e.color} strokeWidth="1.5" />
            <text x={e.x + 55} y={e.y + 18} textAnchor="middle" fill={e.color} fontSize="9" fontWeight="600">{e.name}</text>
            <text x={e.x + 55} y={e.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{e.desc}</text>
            <text x={e.x + 55} y={e.y + 55} textAnchor="middle" fill="#71717a" fontSize="7">{e.era}</text>
            {i < 3 && <path d={`M${e.x + 115} ${e.y + 35} L${e.x + 135} ${e.y + 35}`} stroke="#3f3f46" strokeWidth="1.5" markerEnd="url(#arrow)" />}
          </g>
        ))}
        <defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3f3f46"/></marker></defs>
        <rect x="20" y="110" width="460" height="95" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="128" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Key Lessons</text>
        <text x="130" y="148" textAnchor="middle" fill="#f87171" fontSize="7">Monolith: Simple but scaling issues</text>
        <text x="370" y="148" textAnchor="middle" fill="#fb923c" fontSize="7">Direct: N+1 calls from clients</text>
        <text x="130" y="165" textAnchor="middle" fill="#4ade80" fontSize="7">Gateway: Aggregation layer works</text>
        <text x="370" y="165" textAnchor="middle" fill="#60a5fa" fontSize="7">GraphQL: Self-serve API schema</text>
        <text x="250" y="185" textAnchor="middle" fill="#a78bfa" fontSize="7">GraphQL Federation: Domain teams own their schema</text>
        <text x="250" y="200" textAnchor="middle" fill="#71717a" fontSize="7">Evolution took 15+ years - gradual migration, not big bang</text>
      </svg>
    ),
    discordarch: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Discord Database Evolution - 150M+ MAU, Trillions of messages</text>
        {[
          { x: 20, y: 30, era: '2015', name: 'MongoDB', desc: 'Single node, simple', color: '#4ade80', issue: 'Scaling limits' },
          { x: 140, y: 30, era: '2017', name: 'Cassandra', desc: 'Distributed, scale-out', color: '#fb923c', issue: 'GC pauses, latency' },
          { x: 260, y: 30, era: '2020', name: 'Cassandra + Rust', desc: 'Custom data service', color: '#a78bfa', issue: 'Still JVM issues' },
          { x: 380, y: 30, era: '2022+', name: 'ScyllaDB', desc: 'C++, no GC', color: '#60a5fa', issue: 'Best of both' }
        ].map((e, i) => (
          <g key={i}>
            <rect x={e.x} y={e.y} width="110" height="75" rx="6" fill={`${e.color}15`} stroke={e.color} strokeWidth="1.5" />
            <text x={e.x + 55} y={e.y + 18} textAnchor="middle" fill={e.color} fontSize="9" fontWeight="600">{e.name}</text>
            <text x={e.x + 55} y={e.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{e.desc}</text>
            <text x={e.x + 55} y={e.y + 50} textAnchor="middle" fill="#71717a" fontSize="6">{e.era}</text>
            <text x={e.x + 55} y={e.y + 65} textAnchor="middle" fill="#f87171" fontSize="6">{e.issue}</text>
            {i < 3 && <path d={`M${e.x + 115} ${e.y + 37} L${e.x + 135} ${e.y + 37}`} stroke="#3f3f46" strokeWidth="1.5" />}
          </g>
        ))}
        <rect x="20" y="115" width="460" height="90" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="133" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Architecture Highlights</text>
        <text x="130" y="153" textAnchor="middle" fill="#22d3ee" fontSize="7">Message store: Time-bucketed</text>
        <text x="370" y="153" textAnchor="middle" fill="#fb923c" fontSize="7">Hot/Cold: Recent in memory</text>
        <text x="130" y="170" textAnchor="middle" fill="#4ade80" fontSize="7">Elixir: Real-time WebSockets</text>
        <text x="370" y="170" textAnchor="middle" fill="#a78bfa" fontSize="7">Rust: Data services layer</text>
        <text x="250" y="190" textAnchor="middle" fill="#60a5fa" fontSize="8">ScyllaDB Result: p99 latency 15ms → 5ms, GC pauses eliminated</text>
      </svg>
    ),
    redisarch: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Redis Architecture - In-Memory Data Structure Store</text>
        <rect x="175" y="25" width="150" height="35" rx="6" fill="#f8717115" stroke="#f87171" strokeWidth="2" />
        <text x="250" y="47" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="700">Redis Server</text>
        <text x="250" y="58" textAnchor="middle" fill="#a1a1aa" fontSize="6">Single-threaded + I/O threads (6.0+)</text>
        {[
          { x: 20, y: 75, name: 'Strings', desc: 'SET/GET, counters', color: '#4ade80' },
          { x: 100, y: 75, name: 'Lists', desc: 'Queues, feeds', color: '#60a5fa' },
          { x: 180, y: 75, name: 'Sets', desc: 'Tags, unique', color: '#a78bfa' },
          { x: 260, y: 75, name: 'Hashes', desc: 'Objects, fields', color: '#22d3ee' },
          { x: 340, y: 75, name: 'Sorted Sets', desc: 'Leaderboards', color: '#fb923c' },
          { x: 420, y: 75, name: 'Streams', desc: 'Event log', color: '#f472b6' }
        ].map((d, i) => (
          <g key={i}>
            <rect x={d.x} y={d.y} width="72" height="42" rx="4" fill={`${d.color}15`} stroke={d.color} strokeWidth="1" />
            <text x={d.x + 36} y={d.y + 16} textAnchor="middle" fill={d.color} fontSize="7" fontWeight="600">{d.name}</text>
            <text x={d.x + 36} y={d.y + 32} textAnchor="middle" fill="#71717a" fontSize="5">{d.desc}</text>
          </g>
        ))}
        <rect x="20" y="125" width="225" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="143" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Persistence</text>
        <text x="132" y="158" textAnchor="middle" fill="#4ade80" fontSize="7">RDB: Point-in-time snapshots</text>
        <text x="132" y="170" textAnchor="middle" fill="#60a5fa" fontSize="7">AOF: Append-only file (durability)</text>
        <rect x="255" y="125" width="225" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="367" y="143" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">High Availability</text>
        <text x="367" y="158" textAnchor="middle" fill="#fb923c" fontSize="7">Sentinel: Auto failover</text>
        <text x="367" y="170" textAnchor="middle" fill="#a78bfa" fontSize="7">Cluster: 16384 hash slots</text>
        <rect x="20" y="185" width="460" height="45" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="203" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Evolution: 2009-2024</text>
        <text x="250" y="218" textAnchor="middle" fill="#71717a" fontSize="7">2009: Created | 2015: Cluster | 2020: I/O threads | 2022: Redis Functions | 2024: Redis 8.0</text>
      </svg>
    ),
    uberstack: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Uber Tech Stack - 100M+ MAU, 25M trips/day</text>
        <rect x="20" y="25" width="460" height="25" rx="4" fill="#f8717115" stroke="#f87171" strokeWidth="1.5" />
        <text x="250" y="42" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="600">Mobile: iOS (Swift), Android (Kotlin) + React Native</text>
        <rect x="20" y="55" width="225" height="40" rx="4" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="132" y="72" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="600">API Gateway: Edge</text>
        <text x="132" y="86" textAnchor="middle" fill="#a1a1aa" fontSize="6">Rate limiting, auth, routing</text>
        <rect x="255" y="55" width="225" height="40" rx="4" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="367" y="72" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="600">Maps: H3 Hexagonal Grid</text>
        <text x="367" y="86" textAnchor="middle" fill="#a1a1aa" fontSize="6">Hierarchical spatial index</text>
        {[
          { x: 20, y: 100, name: 'Dispatch', desc: 'Real-time matching', color: '#a78bfa' },
          { x: 140, y: 100, name: 'Pricing', desc: 'Dynamic/surge', color: '#22d3ee' },
          { x: 260, y: 100, name: 'ETA', desc: 'ML predictions', color: '#fb923c' },
          { x: 380, y: 100, name: 'Payments', desc: 'Multi-currency', color: '#f472b6' }
        ].map((s, i) => (
          <g key={i}>
            <rect x={s.x} y={s.y} width="110" height="40" rx="4" fill={`${s.color}15`} stroke={s.color} strokeWidth="1.5" />
            <text x={s.x + 55} y={s.y + 17} textAnchor="middle" fill={s.color} fontSize="8" fontWeight="600">{s.name}</text>
            <text x={s.x + 55} y={s.y + 32} textAnchor="middle" fill="#a1a1aa" fontSize="6">{s.desc}</text>
          </g>
        ))}
        <rect x="20" y="145" width="145" height="40" rx="4" fill="#fbbf2415" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="92" y="162" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="600">Data Platform</text>
        <text x="92" y="177" textAnchor="middle" fill="#a1a1aa" fontSize="6">Kafka, Spark, Presto</text>
        <rect x="177" y="145" width="145" height="40" rx="4" fill="#2dd4bf15" stroke="#2dd4bf" strokeWidth="1.5" />
        <text x="250" y="162" textAnchor="middle" fill="#2dd4bf" fontSize="8" fontWeight="600">Storage</text>
        <text x="250" y="177" textAnchor="middle" fill="#a1a1aa" fontSize="6">MySQL, Cassandra, Redis</text>
        <rect x="335" y="145" width="145" height="40" rx="4" fill="#f8717115" stroke="#f87171" strokeWidth="1.5" />
        <text x="407" y="162" textAnchor="middle" fill="#f87171" fontSize="8" fontWeight="600">Observability</text>
        <text x="407" y="177" textAnchor="middle" fill="#a1a1aa" fontSize="6">Jaeger (created here)</text>
        <rect x="20" y="190" width="460" height="40" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="208" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Key Technologies: Go (backend), gRPC, Docker, Kubernetes, Cadence (workflow)</text>
        <text x="250" y="222" textAnchor="middle" fill="#71717a" fontSize="7">4000+ microservices | Multi-datacenter | 4 trillion messages/day on Kafka</text>
      </svg>
    ),
    twelvefactor: (
      <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">12-Factor App - Cloud-Native Principles (Heroku)</text>
        {[
          { x: 20, y: 25, n: '1', name: 'Codebase', desc: 'One repo, many deploys', color: '#4ade80' },
          { x: 140, y: 25, n: '2', name: 'Dependencies', desc: 'Explicit declaration', color: '#60a5fa' },
          { x: 260, y: 25, n: '3', name: 'Config', desc: 'Store in environment', color: '#a78bfa' },
          { x: 380, y: 25, n: '4', name: 'Backing Services', desc: 'Treat as resources', color: '#22d3ee' },
          { x: 20, y: 85, n: '5', name: 'Build/Release/Run', desc: 'Strict separation', color: '#fb923c' },
          { x: 140, y: 85, n: '6', name: 'Processes', desc: 'Stateless, share-nothing', color: '#f472b6' },
          { x: 260, y: 85, n: '7', name: 'Port Binding', desc: 'Export via port', color: '#fbbf24' },
          { x: 380, y: 85, n: '8', name: 'Concurrency', desc: 'Scale via processes', color: '#f87171' },
          { x: 20, y: 145, n: '9', name: 'Disposability', desc: 'Fast start, graceful stop', color: '#2dd4bf' },
          { x: 140, y: 145, n: '10', name: 'Dev/Prod Parity', desc: 'Keep environments similar', color: '#4ade80' },
          { x: 260, y: 145, n: '11', name: 'Logs', desc: 'Treat as event streams', color: '#60a5fa' },
          { x: 380, y: 145, n: '12', name: 'Admin Processes', desc: 'Run as one-off', color: '#a78bfa' }
        ].map((f, i) => (
          <g key={i}>
            <rect x={f.x} y={f.y} width="110" height="50" rx="5" fill={`${f.color}15`} stroke={f.color} strokeWidth="1.5" />
            <text x={f.x + 12} y={f.y + 18} fill={f.color} fontSize="10" fontWeight="700">{f.n}</text>
            <text x={f.x + 65} y={f.y + 18} textAnchor="middle" fill={f.color} fontSize="7" fontWeight="600">{f.name}</text>
            <text x={f.x + 55} y={f.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{f.desc}</text>
          </g>
        ))}
        <rect x="20" y="205" width="460" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="223" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Key Benefits</text>
        <text x="130" y="243" textAnchor="middle" fill="#4ade80" fontSize="7">Portable across clouds</text>
        <text x="250" y="243" textAnchor="middle" fill="#60a5fa" fontSize="7">Scale horizontally</text>
        <text x="370" y="243" textAnchor="middle" fill="#a78bfa" fontSize="7">CI/CD friendly</text>
        <text x="250" y="258" textAnchor="middle" fill="#71717a" fontSize="7">Netflix, Heroku, Spotify, Airbnb - all follow 12-factor principles</text>
      </svg>
    ),
    sdlcmodels: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">8 SDLC Models - Choose Based on Requirements</text>
        {[
          { x: 20, y: 28, name: 'Waterfall', desc: 'Sequential phases', use: 'Fixed requirements', color: '#60a5fa' },
          { x: 140, y: 28, name: 'Agile', desc: 'Iterative sprints', use: 'Evolving needs', color: '#4ade80' },
          { x: 260, y: 28, name: 'V-Model', desc: 'Verification focus', use: 'Safety-critical', color: '#a78bfa' },
          { x: 380, y: 28, name: 'Iterative', desc: 'Repeated cycles', use: 'Unclear scope', color: '#22d3ee' },
          { x: 20, y: 100, name: 'Spiral', desc: 'Risk-driven', use: 'High-risk projects', color: '#fb923c' },
          { x: 140, y: 100, name: 'Big Bang', desc: 'No formal process', use: 'Tiny projects', color: '#f87171' },
          { x: 260, y: 100, name: 'RAD', desc: 'Rapid prototyping', use: 'Quick delivery', color: '#f472b6' },
          { x: 380, y: 100, name: 'Incremental', desc: 'Phased delivery', use: 'Large systems', color: '#fbbf24' }
        ].map((m, i) => (
          <g key={i}>
            <rect x={m.x} y={m.y} width="110" height="60" rx="5" fill={`${m.color}15`} stroke={m.color} strokeWidth="1.5" />
            <text x={m.x + 55} y={m.y + 18} textAnchor="middle" fill={m.color} fontSize="8" fontWeight="600">{m.name}</text>
            <text x={m.x + 55} y={m.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{m.desc}</text>
            <text x={m.x + 55} y={m.y + 50} textAnchor="middle" fill="#71717a" fontSize="5">{m.use}</text>
          </g>
        ))}
        <rect x="20" y="170" width="460" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="188" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Modern Trend: Hybrid Approaches</text>
        <text x="250" y="208" textAnchor="middle" fill="#71717a" fontSize="7">Most teams: Agile + DevOps | Regulated industries: V-Model + Agile</text>
        <text x="250" y="220" textAnchor="middle" fill="#4ade80" fontSize="7">Spotify: Squads (Agile) | Google: Iterative + Continuous | Banks: Waterfall for compliance</text>
      </svg>
    ),
    designpatterns: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Design Patterns Cheat Sheet - Gang of Four (GoF)</text>
        <rect x="20" y="25" width="145" height="90" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="92" y="43" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Creational</text>
        <text x="92" y="58" textAnchor="middle" fill="#a1a1aa" fontSize="6">Singleton - One instance</text>
        <text x="92" y="70" textAnchor="middle" fill="#a1a1aa" fontSize="6">Factory - Create objects</text>
        <text x="92" y="82" textAnchor="middle" fill="#a1a1aa" fontSize="6">Builder - Step by step</text>
        <text x="92" y="94" textAnchor="middle" fill="#a1a1aa" fontSize="6">Prototype - Clone</text>
        <text x="92" y="106" textAnchor="middle" fill="#a1a1aa" fontSize="6">Abstract Factory - Families</text>
        <rect x="177" y="25" width="145" height="90" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="250" y="43" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">Structural</text>
        <text x="250" y="58" textAnchor="middle" fill="#a1a1aa" fontSize="6">Adapter - Interface convert</text>
        <text x="250" y="70" textAnchor="middle" fill="#a1a1aa" fontSize="6">Decorator - Add behavior</text>
        <text x="250" y="82" textAnchor="middle" fill="#a1a1aa" fontSize="6">Facade - Simplify API</text>
        <text x="250" y="94" textAnchor="middle" fill="#a1a1aa" fontSize="6">Proxy - Control access</text>
        <text x="250" y="106" textAnchor="middle" fill="#a1a1aa" fontSize="6">Composite - Tree structure</text>
        <rect x="335" y="25" width="145" height="90" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="407" y="43" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Behavioral</text>
        <text x="407" y="58" textAnchor="middle" fill="#a1a1aa" fontSize="6">Observer - Pub/Sub</text>
        <text x="407" y="70" textAnchor="middle" fill="#a1a1aa" fontSize="6">Strategy - Swap algorithms</text>
        <text x="407" y="82" textAnchor="middle" fill="#a1a1aa" fontSize="6">Command - Encapsulate action</text>
        <text x="407" y="94" textAnchor="middle" fill="#a1a1aa" fontSize="6">State - State machine</text>
        <text x="407" y="106" textAnchor="middle" fill="#a1a1aa" fontSize="6">Template - Define skeleton</text>
        <rect x="20" y="125" width="460" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="143" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Most Used in Modern Systems</text>
        <text x="130" y="163" textAnchor="middle" fill="#4ade80" fontSize="7">Factory: Spring, React</text>
        <text x="250" y="163" textAnchor="middle" fill="#60a5fa" fontSize="7">Observer: Event systems</text>
        <text x="370" y="163" textAnchor="middle" fill="#a78bfa" fontSize="7">Strategy: Payment gateways</text>
        <rect x="20" y="190" width="460" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="208" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Anti-Patterns to Avoid</text>
        <text x="130" y="228" textAnchor="middle" fill="#f87171" fontSize="7">God Object: Too much</text>
        <text x="250" y="228" textAnchor="middle" fill="#f87171" fontSize="7">Spaghetti: No structure</text>
        <text x="370" y="228" textAnchor="middle" fill="#f87171" fontSize="7">Golden Hammer: Overuse</text>
      </svg>
    ),
    tradeoffs: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">10 Key System Design Trade-offs</text>
        {[
          { x: 20, y: 28, left: 'Performance', right: 'Cost', color: '#4ade80' },
          { x: 260, y: 28, left: 'Consistency', right: 'Availability', color: '#60a5fa' },
          { x: 20, y: 75, left: 'Latency', right: 'Throughput', color: '#a78bfa' },
          { x: 260, y: 75, left: 'Simplicity', right: 'Flexibility', color: '#22d3ee' },
          { x: 20, y: 122, left: 'Read Speed', right: 'Write Speed', color: '#fb923c' },
          { x: 260, y: 122, left: 'Normalization', right: 'Denormalization', color: '#f472b6' },
          { x: 20, y: 169, left: 'SQL', right: 'NoSQL', color: '#fbbf24' },
          { x: 260, y: 169, left: 'Monolith', right: 'Microservices', color: '#f87171' }
        ].map((t, i) => (
          <g key={i}>
            <rect x={t.x} y={t.y} width="220" height="38" rx="5" fill={`${t.color}15`} stroke={t.color} strokeWidth="1.5" />
            <text x={t.x + 55} y={t.y + 23} textAnchor="middle" fill={t.color} fontSize="8" fontWeight="600">{t.left}</text>
            <text x={t.x + 110} y={t.y + 23} textAnchor="middle" fill="#71717a" fontSize="10">⟷</text>
            <text x={t.x + 165} y={t.y + 23} textAnchor="middle" fill={t.color} fontSize="8" fontWeight="600">{t.right}</text>
          </g>
        ))}
        <rect x="20" y="215" width="460" height="35" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="233" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">No perfect choice - understand requirements, measure, iterate</text>
        <text x="250" y="245" textAnchor="middle" fill="#71717a" fontSize="7">Every trade-off depends on: Scale, Budget, Team, Timeline, Requirements</text>
      </svg>
    ),
    datapipeline: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Data Pipeline Architecture - ETL vs ELT, Batch vs Streaming</text>
        <rect x="20" y="30" width="225" height="70" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="132" y="50" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">ETL (Extract-Transform-Load)</text>
        <text x="132" y="68" textAnchor="middle" fill="#a1a1aa" fontSize="7">Transform before loading</text>
        <text x="132" y="83" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Cleaned data in warehouse</text>
        <text x="132" y="95" textAnchor="middle" fill="#f87171" fontSize="6">✗ Slower, inflexible</text>
        <rect x="255" y="30" width="225" height="70" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="367" y="50" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">ELT (Extract-Load-Transform)</text>
        <text x="367" y="68" textAnchor="middle" fill="#a1a1aa" fontSize="7">Transform after loading</text>
        <text x="367" y="83" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Faster, flexible</text>
        <text x="367" y="95" textAnchor="middle" fill="#f87171" fontSize="6">✗ Raw data in warehouse</text>
        <rect x="20" y="110" width="225" height="50" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="132" y="130" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">Batch Processing</text>
        <text x="132" y="148" textAnchor="middle" fill="#a1a1aa" fontSize="7">Spark, Hadoop, scheduled jobs</text>
        <rect x="255" y="110" width="225" height="50" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="367" y="130" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Stream Processing</text>
        <text x="367" y="148" textAnchor="middle" fill="#a1a1aa" fontSize="7">Kafka Streams, Flink, real-time</text>
        <rect x="20" y="170" width="460" height="40" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="188" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Tools: Airflow (orchestration), dbt (transform), Fivetran (ingestion)</text>
        <text x="250" y="202" textAnchor="middle" fill="#71717a" fontSize="7">Netflix: 500PB data, 1.5T events/day | Uber: Presto for SQL analytics</text>
      </svg>
    ),
    datalakehouse: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Data Lake vs Data Warehouse vs Lakehouse</text>
        <rect x="20" y="30" width="145" height="100" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="92" y="50" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">Data Warehouse</text>
        <text x="92" y="68" textAnchor="middle" fill="#a1a1aa" fontSize="6">Structured only</text>
        <text x="92" y="82" textAnchor="middle" fill="#a1a1aa" fontSize="6">Schema-on-write</text>
        <text x="92" y="96" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Fast queries</text>
        <text x="92" y="110" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ BI optimized</text>
        <text x="92" y="124" textAnchor="middle" fill="#f87171" fontSize="6">✗ Limited types</text>
        <rect x="177" y="30" width="145" height="100" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="250" y="50" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Data Lake</text>
        <text x="250" y="68" textAnchor="middle" fill="#a1a1aa" fontSize="6">All data types</text>
        <text x="250" y="82" textAnchor="middle" fill="#a1a1aa" fontSize="6">Schema-on-read</text>
        <text x="250" y="96" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Cheap storage</text>
        <text x="250" y="110" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ ML friendly</text>
        <text x="250" y="124" textAnchor="middle" fill="#f87171" fontSize="6">✗ Slow queries</text>
        <rect x="335" y="30" width="145" height="100" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="407" y="50" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Lakehouse</text>
        <text x="407" y="68" textAnchor="middle" fill="#a1a1aa" fontSize="6">Best of both</text>
        <text x="407" y="82" textAnchor="middle" fill="#a1a1aa" fontSize="6">Delta Lake, Iceberg</text>
        <text x="407" y="96" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ ACID on lake</text>
        <text x="407" y="110" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Unified analytics</text>
        <text x="407" y="124" textAnchor="middle" fill="#22d3ee" fontSize="6">✓ Time travel</text>
        <rect x="20" y="140" width="460" height="65" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="158" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Popular Solutions</text>
        <text x="130" y="178" textAnchor="middle" fill="#60a5fa" fontSize="7">Warehouse: Snowflake, BigQuery, Redshift</text>
        <text x="370" y="178" textAnchor="middle" fill="#4ade80" fontSize="7">Lake: S3 + Athena, HDFS</text>
        <text x="250" y="195" textAnchor="middle" fill="#a78bfa" fontSize="7">Lakehouse: Databricks, Delta Lake, Apache Iceberg, Apache Hudi</text>
      </svg>
    ),
    cdcpattern: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Change Data Capture (CDC) - Real-time Data Sync</text>
        <rect x="20" y="30" width="100" height="60" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="70" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Source DB</text>
        <text x="70" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="6">MySQL, Postgres</text>
        <path d="M125 60 L175 60" stroke="#4ade80" strokeWidth="2" markerEnd="url(#arrowGreen)" />
        <rect x="180" y="30" width="140" height="60" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="250" y="50" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">CDC Tool</text>
        <text x="250" y="68" textAnchor="middle" fill="#a1a1aa" fontSize="6">Debezium, Maxwell</text>
        <text x="250" y="82" textAnchor="middle" fill="#a1a1aa" fontSize="6">Reads transaction log</text>
        <path d="M325 60 L375 60" stroke="#fb923c" strokeWidth="2" />
        <rect x="380" y="30" width="100" height="60" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="430" y="55" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">Kafka</text>
        <text x="430" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="6">Event stream</text>
        <defs><marker id="arrowGreen" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#4ade80"/></marker></defs>
        <rect x="20" y="100" width="225" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="118" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">CDC Methods</text>
        <text x="132" y="135" textAnchor="middle" fill="#a78bfa" fontSize="7">Log-based: Transaction log (best)</text>
        <text x="132" y="148" textAnchor="middle" fill="#71717a" fontSize="7">Trigger | Timestamp | Diff-based</text>
        <rect x="255" y="100" width="225" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="367" y="118" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Use Cases</text>
        <text x="367" y="135" textAnchor="middle" fill="#22d3ee" fontSize="7">Cache invalidation, Search sync</text>
        <text x="367" y="148" textAnchor="middle" fill="#22d3ee" fontSize="7">Analytics pipeline, Microservices</text>
        <rect x="20" y="165" width="460" height="40" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="183" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Tools: Debezium (OSS), AWS DMS, Airbyte, Fivetran</text>
        <text x="250" y="198" textAnchor="middle" fill="#71717a" fontSize="7">Airbnb: CDC for search sync | LinkedIn: CDC for data lake | Uber: Marmaray</text>
      </svg>
    ),
    kafkadeep: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Kafka Deep Dive - Internals & Best Practices</text>
        <rect x="20" y="28" width="145" height="80" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="92" y="46" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Producer</text>
        <text x="92" y="62" textAnchor="middle" fill="#a1a1aa" fontSize="6">acks=all: Durability</text>
        <text x="92" y="76" textAnchor="middle" fill="#a1a1aa" fontSize="6">acks=1: Performance</text>
        <text x="92" y="90" textAnchor="middle" fill="#a1a1aa" fontSize="6">Batching, compression</text>
        <text x="92" y="102" textAnchor="middle" fill="#22d3ee" fontSize="5">idempotence=true</text>
        <rect x="177" y="28" width="145" height="80" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="250" y="46" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">Broker/Topic</text>
        <text x="250" y="62" textAnchor="middle" fill="#a1a1aa" fontSize="6">Partitions = parallelism</text>
        <text x="250" y="76" textAnchor="middle" fill="#a1a1aa" fontSize="6">Replication factor = 3</text>
        <text x="250" y="90" textAnchor="middle" fill="#a1a1aa" fontSize="6">Log segments, compaction</text>
        <text x="250" y="102" textAnchor="middle" fill="#22d3ee" fontSize="5">min.insync.replicas=2</text>
        <rect x="335" y="28" width="145" height="80" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="407" y="46" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">Consumer</text>
        <text x="407" y="62" textAnchor="middle" fill="#a1a1aa" fontSize="6">Consumer groups</text>
        <text x="407" y="76" textAnchor="middle" fill="#a1a1aa" fontSize="6">Offset commit</text>
        <text x="407" y="90" textAnchor="middle" fill="#a1a1aa" fontSize="6">Rebalancing protocol</text>
        <text x="407" y="102" textAnchor="middle" fill="#22d3ee" fontSize="5">auto.offset.reset</text>
        <rect x="20" y="118" width="225" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="136" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Message Loss Scenarios</text>
        <text x="132" y="153" textAnchor="middle" fill="#f87171" fontSize="6">acks=0/1 + leader crash</text>
        <text x="132" y="166" textAnchor="middle" fill="#f87171" fontSize="6">Consumer crash before commit</text>
        <rect x="255" y="118" width="225" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="367" y="136" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Exactly-Once Config</text>
        <text x="367" y="153" textAnchor="middle" fill="#4ade80" fontSize="6">enable.idempotence=true</text>
        <text x="367" y="166" textAnchor="middle" fill="#4ade80" fontSize="6">transactional.id + acks=all</text>
        <rect x="20" y="183" width="460" height="45" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="201" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Scaling: LinkedIn 7T msgs/day | Uber 4T msgs/day | Netflix 700B events/day</text>
        <text x="250" y="218" textAnchor="middle" fill="#71717a" fontSize="7">Partitions = max(target_throughput/100MB/s, num_consumers) | Start with 12-24</text>
      </svg>
    ),
    searchengine: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Search Engine Architecture - Google-scale Design</text>
        {[
          { x: 20, y: 30, name: 'Crawling', desc: 'Fetch web pages', tool: 'Scrapy, Heritrix', color: '#4ade80' },
          { x: 140, y: 30, name: 'Parsing', desc: 'Extract content', tool: 'DOM, NLP', color: '#60a5fa' },
          { x: 260, y: 30, name: 'Indexing', desc: 'Inverted index', tool: 'Lucene', color: '#a78bfa' },
          { x: 380, y: 30, name: 'Ranking', desc: 'Relevance scoring', tool: 'PageRank, ML', color: '#fb923c' }
        ].map((s, i) => (
          <g key={i}>
            <rect x={s.x} y={s.y} width="110" height="65" rx="6" fill={`${s.color}15`} stroke={s.color} strokeWidth="1.5" />
            <text x={s.x + 55} y={s.y + 20} textAnchor="middle" fill={s.color} fontSize="9" fontWeight="600">{s.name}</text>
            <text x={s.x + 55} y={s.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="7">{s.desc}</text>
            <text x={s.x + 55} y={s.y + 55} textAnchor="middle" fill="#71717a" fontSize="6">{s.tool}</text>
            {i < 3 && <path d={`M${s.x + 115} ${s.y + 32} L${s.x + 135} ${s.y + 32}`} stroke="#3f3f46" strokeWidth="1.5" />}
          </g>
        ))}
        <rect x="20" y="105" width="225" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="123" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Inverted Index</text>
        <text x="132" y="140" textAnchor="middle" fill="#a1a1aa" fontSize="7">Term → [doc1, doc5, doc12...]</text>
        <text x="132" y="152" textAnchor="middle" fill="#71717a" fontSize="6">TF-IDF, BM25 scoring</text>
        <rect x="255" y="105" width="225" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="367" y="123" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Query Processing</text>
        <text x="367" y="140" textAnchor="middle" fill="#a1a1aa" fontSize="7">Tokenize → Analyze → Score → Rank</text>
        <text x="367" y="152" textAnchor="middle" fill="#71717a" fontSize="6">Query expansion, spell check</text>
        <rect x="20" y="165" width="460" height="40" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="183" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Google: 100B+ pages indexed, 8.5B searches/day</text>
        <text x="250" y="198" textAnchor="middle" fill="#71717a" fontSize="7">MapReduce for indexing | Distributed shards | Real-time with Caffeine</text>
      </svg>
    ),
    elasticsearch: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Elasticsearch Architecture - Distributed Search & Analytics</text>
        <rect x="175" y="25" width="150" height="35" rx="6" fill="#fbbf2415" stroke="#fbbf24" strokeWidth="2" />
        <text x="250" y="47" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600">Cluster</text>
        {[
          { x: 20, y: 75, name: 'Node 1', role: 'Master', shards: 'P0, R1', color: '#4ade80' },
          { x: 180, y: 75, name: 'Node 2', role: 'Data', shards: 'P1, R0', color: '#60a5fa' },
          { x: 340, y: 75, name: 'Node 3', role: 'Data', shards: 'P2, R2', color: '#a78bfa' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="55" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.role}</text>
            <text x={n.x + 70} y={n.y + 48} textAnchor="middle" fill="#71717a" fontSize="6">Shards: {n.shards}</text>
            <path d={`M${n.x + 70} ${n.y} L250 60`} stroke="#3f3f46" strokeWidth="0.5" strokeDasharray="2,2" />
          </g>
        ))}
        <rect x="20" y="140" width="225" height="65" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="158" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Key Concepts</text>
        <text x="132" y="175" textAnchor="middle" fill="#22d3ee" fontSize="7">Index: Collection of documents</text>
        <text x="132" y="190" textAnchor="middle" fill="#fb923c" fontSize="7">Shard: Horizontal partition</text>
        <text x="132" y="200" textAnchor="middle" fill="#a78bfa" fontSize="6">Replica: Copy for HA</text>
        <rect x="255" y="140" width="225" height="65" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="367" y="158" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Sizing Rules</text>
        <text x="367" y="175" textAnchor="middle" fill="#71717a" fontSize="7">Shard: 10-50GB each</text>
        <text x="367" y="190" textAnchor="middle" fill="#71717a" fontSize="7">1 replica = 2x storage</text>
        <text x="367" y="200" textAnchor="middle" fill="#71717a" fontSize="6">Nodes: shards/20 minimum</text>
      </svg>
    ),
    genaistack: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Generative AI Stack - 2024 Landscape</text>
        <rect x="20" y="25" width="460" height="35" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="250" y="47" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="600">Foundation Models: GPT-4, Claude, Gemini, Llama, Mistral</text>
        <rect x="20" y="68" width="145" height="55" rx="5" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="92" y="88" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="600">Inference</text>
        <text x="92" y="103" textAnchor="middle" fill="#a1a1aa" fontSize="6">vLLM, TensorRT-LLM</text>
        <text x="92" y="115" textAnchor="middle" fill="#a1a1aa" fontSize="6">NVIDIA, Groq, AWS Inf2</text>
        <rect x="177" y="68" width="145" height="55" rx="5" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="250" y="88" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="600">Orchestration</text>
        <text x="250" y="103" textAnchor="middle" fill="#a1a1aa" fontSize="6">LangChain, LlamaIndex</text>
        <text x="250" y="115" textAnchor="middle" fill="#a1a1aa" fontSize="6">Semantic Kernel</text>
        <rect x="335" y="68" width="145" height="55" rx="5" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="407" y="88" textAnchor="middle" fill="#fb923c" fontSize="8" fontWeight="600">Vector DB</text>
        <text x="407" y="103" textAnchor="middle" fill="#a1a1aa" fontSize="6">Pinecone, Weaviate</text>
        <text x="407" y="115" textAnchor="middle" fill="#a1a1aa" fontSize="6">pgVector, Chroma</text>
        <rect x="20" y="130" width="225" height="55" rx="5" fill="#22d3ee15" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="132" y="150" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="600">RAG (Retrieval Augmented)</text>
        <text x="132" y="168" textAnchor="middle" fill="#a1a1aa" fontSize="7">Query → Retrieve → Augment → Generate</text>
        <text x="132" y="180" textAnchor="middle" fill="#71717a" fontSize="6">Reduces hallucinations, uses your data</text>
        <rect x="255" y="130" width="225" height="55" rx="5" fill="#f472b615" stroke="#f472b6" strokeWidth="1.5" />
        <text x="367" y="150" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="600">Fine-tuning</text>
        <text x="367" y="168" textAnchor="middle" fill="#a1a1aa" fontSize="7">LoRA, QLoRA, RLHF</text>
        <text x="367" y="180" textAnchor="middle" fill="#71717a" fontSize="6">Custom behavior, domain expertise</text>
        <rect x="20" y="195" width="460" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="213" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Production Stack: Model API → Prompt Engineering → Guardrails → Evaluation</text>
        <text x="250" y="230" textAnchor="middle" fill="#71717a" fontSize="7">Companies: OpenAI, Anthropic, Google, Meta, Mistral | Observability: LangSmith, Weights & Biases</text>
      </svg>
    ),
    linuxboot: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Linux Boot Process - From Power On to User Space</text>
        {[
          { x: 20, y: 35, name: 'BIOS/UEFI', desc: 'POST, Hardware Init', color: '#f472b6' },
          { x: 115, y: 35, name: 'MBR/GPT', desc: 'Bootloader Location', color: '#fb923c' },
          { x: 210, y: 35, name: 'GRUB', desc: 'Bootloader Menu', color: '#4ade80' },
          { x: 305, y: 35, name: 'Kernel', desc: 'vmlinuz + initramfs', color: '#60a5fa' },
          { x: 400, y: 35, name: 'systemd', desc: 'PID 1, Init System', color: '#a78bfa' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="85" height="45" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 42} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 42} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            {i < 4 && <path d={`M${n.x + 85} ${n.y + 22} L${n.x + 95} ${n.y + 22}`} stroke="#3f3f46" strokeWidth="1.5" markerEnd="url(#arrow)" />}
          </g>
        ))}
        <rect x="20" y="95" width="460" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="112" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">systemd Targets (Run Levels)</text>
        {['poweroff.target (0)', 'rescue.target (1)', 'multi-user.target (3)', 'graphical.target (5)', 'reboot.target (6)'].map((t, i) => (
          <text key={i} x={50 + i * 95} y={135} textAnchor="middle" fill="#71717a" fontSize="7">{t}</text>
        ))}
        <rect x="20" y="160" width="225" height="45" rx="5" fill="#22d3ee15" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="132" y="178" textAnchor="middle" fill="#22d3ee" fontSize="8" fontWeight="600">initramfs Tasks</text>
        <text x="132" y="195" textAnchor="middle" fill="#a1a1aa" fontSize="6">Load drivers, mount root FS, start init</text>
        <rect x="255" y="160" width="225" height="45" rx="5" fill="#fbbf2415" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="367" y="178" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="600">User Space</text>
        <text x="367" y="195" textAnchor="middle" fill="#a1a1aa" fontSize="6">Services, daemons, login manager</text>
      </svg>
    ),
    linuxfs: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Linux Filesystem Hierarchy Standard (FHS)</text>
        <rect x="200" y="25" width="100" height="30" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="2" />
        <text x="250" y="45" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="700">/</text>
        {[
          { x: 20, y: 75, name: '/bin', desc: 'Essential binaries', color: '#60a5fa' },
          { x: 100, y: 75, name: '/boot', desc: 'Bootloader files', color: '#f472b6' },
          { x: 180, y: 75, name: '/dev', desc: 'Device files', color: '#fb923c' },
          { x: 260, y: 75, name: '/etc', desc: 'Config files', color: '#a78bfa' },
          { x: 340, y: 75, name: '/home', desc: 'User homes', color: '#22d3ee' },
          { x: 420, y: 75, name: '/lib', desc: 'Libraries', color: '#fbbf24' }
        ].map((n, i) => (
          <g key={i}>
            <path d={`M250 55 L${n.x + 35} 75`} stroke="#3f3f46" strokeWidth="0.5" />
            <rect x={n.x} y={n.y} width="70" height="40" rx="5" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 35} y={n.y + 17} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 35} y={n.y + 32} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        {[
          { x: 20, y: 130, name: '/opt', desc: 'Optional software', color: '#4ade80' },
          { x: 100, y: 130, name: '/proc', desc: 'Process info', color: '#60a5fa' },
          { x: 180, y: 130, name: '/root', desc: 'Root home', color: '#f472b6' },
          { x: 260, y: 130, name: '/sbin', desc: 'System binaries', color: '#fb923c' },
          { x: 340, y: 130, name: '/tmp', desc: 'Temporary files', color: '#a78bfa' },
          { x: 420, y: 130, name: '/usr', desc: 'User programs', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="70" height="40" rx="5" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 35} y={n.y + 17} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 35} y={n.y + 32} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        <rect x="20" y="185" width="145" height="45" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="92" y="202" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">/var</text>
        <text x="92" y="218" textAnchor="middle" fill="#a1a1aa" fontSize="6">Variable data, logs</text>
        <rect x="177" y="185" width="145" height="45" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="202" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">/mnt & /media</text>
        <text x="250" y="218" textAnchor="middle" fill="#a1a1aa" fontSize="6">Mount points</text>
        <rect x="335" y="185" width="145" height="45" rx="5" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="407" y="202" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">/sys</text>
        <text x="407" y="218" textAnchor="middle" fill="#a1a1aa" fontSize="6">Kernel/hardware info</text>
      </svg>
    ),
    linuxperms: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Linux File Permissions - chmod, chown, ACL</text>
        <rect x="20" y="30" width="460" height="50" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="250" y="50" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">-rwxr-xr-- 1 user group 4096 Jan 1 file.txt</text>
        <text x="45" y="72" textAnchor="middle" fill="#f472b6" fontSize="7">type</text>
        <text x="95" y="72" textAnchor="middle" fill="#60a5fa" fontSize="7">user</text>
        <text x="145" y="72" textAnchor="middle" fill="#fb923c" fontSize="7">group</text>
        <text x="195" y="72" textAnchor="middle" fill="#a78bfa" fontSize="7">other</text>
        {[
          { x: 20, y: 95, bits: 'rwx', val: '7', name: 'User (Owner)', color: '#60a5fa' },
          { x: 180, y: 95, bits: 'r-x', val: '5', name: 'Group', color: '#fb923c' },
          { x: 340, y: 95, bits: 'r--', val: '4', name: 'Other', color: '#a78bfa' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="45" rx="5" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#fafafa" fontSize="10" fontFamily="monospace">{n.bits} = {n.val}</text>
          </g>
        ))}
        <rect x="20" y="155" width="225" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="172" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Octal Notation</text>
        <text x="132" y="188" textAnchor="middle" fill="#22d3ee" fontSize="7">755 = rwxr-xr-x (exec)</text>
        <text x="132" y="202" textAnchor="middle" fill="#fbbf24" fontSize="7">644 = rw-r--r-- (file)</text>
        <rect x="255" y="155" width="225" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="367" y="172" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Commands</text>
        <text x="367" y="188" textAnchor="middle" fill="#71717a" fontSize="7">chmod 755 file | chown user:group</text>
        <text x="367" y="202" textAnchor="middle" fill="#71717a" fontSize="7">chmod +x file | umask 022</text>
      </svg>
    ),
    linuxperf: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Linux Performance Tools - Brendan Gregg's Observability Wheel</text>
        {[
          { x: 20, y: 30, name: 'CPU', tools: 'top, htop, mpstat, pidstat', color: '#f472b6' },
          { x: 180, y: 30, name: 'Memory', tools: 'free, vmstat, pmap, slabtop', color: '#60a5fa' },
          { x: 340, y: 30, name: 'Disk I/O', tools: 'iostat, iotop, blktrace', color: '#4ade80' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.tools}</text>
          </g>
        ))}
        {[
          { x: 20, y: 95, name: 'Network', tools: 'netstat, ss, iftop, tcpdump', color: '#fb923c' },
          { x: 180, y: 95, name: 'Process', tools: 'ps, pstree, strace, lsof', color: '#a78bfa' },
          { x: 340, y: 95, name: 'System', tools: 'dmesg, sysctl, uptime', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.tools}</text>
          </g>
        ))}
        <rect x="20" y="160" width="225" height="85" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="178" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Advanced Tracing</text>
        <text x="132" y="195" textAnchor="middle" fill="#f472b6" fontSize="7">perf - CPU profiling, flame graphs</text>
        <text x="132" y="210" textAnchor="middle" fill="#60a5fa" fontSize="7">eBPF/bpftrace - Dynamic tracing</text>
        <text x="132" y="225" textAnchor="middle" fill="#4ade80" fontSize="7">SystemTap - Kernel probing</text>
        <rect x="255" y="160" width="225" height="85" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="367" y="178" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Quick Diagnosis</text>
        <text x="367" y="195" textAnchor="middle" fill="#71717a" fontSize="7">1. uptime → load average</text>
        <text x="367" y="210" textAnchor="middle" fill="#71717a" fontSize="7">2. vmstat 1 → memory, CPU</text>
        <text x="367" y="225" textAnchor="middle" fill="#71717a" fontSize="7">3. iostat -x 1 → disk latency</text>
      </svg>
    ),
    linuxcmds: (
      <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">18 Essential Linux Commands</text>
        {[
          { x: 20, y: 30, cmds: ['ls - list files', 'cd - change dir', 'pwd - current dir'], color: '#4ade80', title: 'Navigation' },
          { x: 180, y: 30, cmds: ['cp - copy', 'mv - move/rename', 'rm - remove'], color: '#60a5fa', title: 'File Ops' },
          { x: 340, y: 30, cmds: ['cat - view file', 'grep - search text', 'find - find files'], color: '#f472b6', title: 'Search/View' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="70" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 15} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.title}</text>
            {n.cmds.map((c, j) => <text key={j} x={n.x + 70} y={n.y + 32 + j * 13} textAnchor="middle" fill="#a1a1aa" fontSize="6">{c}</text>)}
          </g>
        ))}
        {[
          { x: 20, y: 115, cmds: ['chmod - permissions', 'chown - ownership', 'sudo - run as root'], color: '#fb923c', title: 'Permissions' },
          { x: 180, y: 115, cmds: ['ps - processes', 'top - monitor', 'kill - terminate'], color: '#a78bfa', title: 'Processes' },
          { x: 340, y: 115, cmds: ['ssh - remote login', 'scp - secure copy', 'curl - HTTP client'], color: '#22d3ee', title: 'Network' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="70" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 15} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.title}</text>
            {n.cmds.map((c, j) => <text key={j} x={n.x + 70} y={n.y + 32 + j * 13} textAnchor="middle" fill="#a1a1aa" fontSize="6">{c}</text>)}
          </g>
        ))}
        <rect x="20" y="200" width="225" height="65" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="218" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Package Management</text>
        <text x="132" y="235" textAnchor="middle" fill="#71717a" fontSize="7">apt/yum install | update | remove</text>
        <text x="132" y="250" textAnchor="middle" fill="#71717a" fontSize="7">systemctl start/stop/status service</text>
        <rect x="255" y="200" width="225" height="65" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="367" y="218" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Pipes & Redirection</text>
        <text x="367" y="235" textAnchor="middle" fill="#71717a" fontSize="7">cmd1 | cmd2 - pipe output</text>
        <text x="367" y="250" textAnchor="middle" fill="#71717a" fontSize="7">&gt; file, &gt;&gt; append, 2&gt;&amp;1 stderr</text>
      </svg>
    ),
    restbest: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">REST API Best Practices</text>
        {[
          { x: 20, y: 30, name: 'Naming', rules: ['Use nouns: /users', 'Plural: /orders/{id}', 'Lowercase, hyphens'], color: '#4ade80' },
          { x: 180, y: 30, name: 'HTTP Methods', rules: ['GET: read', 'POST: create', 'PUT/PATCH: update'], color: '#60a5fa' },
          { x: 340, y: 30, name: 'Status Codes', rules: ['2xx: success', '4xx: client error', '5xx: server error'], color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="65" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 15} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            {n.rules.map((r, j) => <text key={j} x={n.x + 70} y={n.y + 32 + j * 12} textAnchor="middle" fill="#a1a1aa" fontSize="6">{r}</text>)}
          </g>
        ))}
        <rect x="20" y="110" width="225" height="60" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="132" y="128" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">Pagination</text>
        <text x="132" y="145" textAnchor="middle" fill="#a1a1aa" fontSize="7">Offset: ?page=2&limit=20</text>
        <text x="132" y="160" textAnchor="middle" fill="#a1a1aa" fontSize="7">Cursor: ?cursor=xyz&limit=20 (preferred)</text>
        <rect x="255" y="110" width="225" height="60" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="367" y="128" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Filtering & Sorting</text>
        <text x="367" y="145" textAnchor="middle" fill="#a1a1aa" fontSize="7">?status=active&sort=-created_at</text>
        <text x="367" y="160" textAnchor="middle" fill="#a1a1aa" fontSize="7">?fields=id,name (sparse fieldsets)</text>
        <rect x="20" y="185" width="460" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="205" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Error Response Format</text>
        <text x="250" y="225" textAnchor="middle" fill="#22d3ee" fontSize="7" fontFamily="monospace">{`{ "error": { "code": "INVALID_INPUT", "message": "...", "details": [...] } }`}</text>
        <text x="250" y="240" textAnchor="middle" fill="#71717a" fontSize="6">Companies: Stripe, GitHub, Twilio follow these patterns</text>
      </svg>
    ),
    graphqldeep: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">GraphQL Deep Dive - Schema, Resolvers, N+1</text>
        <rect x="20" y="30" width="145" height="70" rx="6" fill="#f472b615" stroke="#f472b6" strokeWidth="1.5" />
        <text x="92" y="48" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="600">Schema</text>
        <text x="92" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">type Query {"{ }"}</text>
        <text x="92" y="78" textAnchor="middle" fill="#a1a1aa" fontSize="7">type Mutation {"{ }"}</text>
        <text x="92" y="91" textAnchor="middle" fill="#a1a1aa" fontSize="7">type Subscription {"{ }"}</text>
        <rect x="177" y="30" width="145" height="70" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="250" y="48" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Resolver</text>
        <text x="250" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Field → Data Source</text>
        <text x="250" y="78" textAnchor="middle" fill="#a1a1aa" fontSize="7">parent, args, context</text>
        <text x="250" y="91" textAnchor="middle" fill="#a1a1aa" fontSize="7">info (AST)</text>
        <rect x="335" y="30" width="145" height="70" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="407" y="48" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">DataLoader</text>
        <text x="407" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Batch requests</text>
        <text x="407" y="78" textAnchor="middle" fill="#a1a1aa" fontSize="7">Solve N+1 problem</text>
        <text x="407" y="91" textAnchor="middle" fill="#a1a1aa" fontSize="7">Per-request cache</text>
        <rect x="20" y="115" width="225" height="60" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="132" y="133" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">N+1 Problem</text>
        <text x="132" y="150" textAnchor="middle" fill="#a1a1aa" fontSize="7">Query users → N queries for posts</text>
        <text x="132" y="165" textAnchor="middle" fill="#22d3ee" fontSize="7">Solution: DataLoader batches into 1 query</text>
        <rect x="255" y="115" width="225" height="60" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="367" y="133" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Schema Design</text>
        <text x="367" y="150" textAnchor="middle" fill="#a1a1aa" fontSize="7">Connections for pagination</text>
        <text x="367" y="165" textAnchor="middle" fill="#a1a1aa" fontSize="7">Relay cursor spec</text>
        <rect x="20" y="190" width="460" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="210" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Production Patterns</text>
        <text x="250" y="228" textAnchor="middle" fill="#71717a" fontSize="7">Query depth limiting | Cost analysis | Persisted queries | Schema stitching</text>
        <text x="250" y="240" textAnchor="middle" fill="#71717a" fontSize="6">Companies: GitHub, Shopify, Twitter, Airbnb</text>
      </svg>
    ),
    grpcinternals: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">gRPC Internals - Protocol Buffers & Streaming</text>
        <rect x="20" y="30" width="140" height="65" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="90" y="48" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Protocol Buffers</text>
        <text x="90" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Binary serialization</text>
        <text x="90" y="78" textAnchor="middle" fill="#a1a1aa" fontSize="7">~10x smaller than JSON</text>
        <text x="90" y="88" textAnchor="middle" fill="#a1a1aa" fontSize="6">.proto schema → codegen</text>
        <rect x="180" y="30" width="140" height="65" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="250" y="48" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">HTTP/2</text>
        <text x="250" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Multiplexing</text>
        <text x="250" y="78" textAnchor="middle" fill="#a1a1aa" fontSize="7">Header compression</text>
        <text x="250" y="88" textAnchor="middle" fill="#a1a1aa" fontSize="6">Binary framing</text>
        <rect x="340" y="30" width="140" height="65" rx="6" fill="#f472b615" stroke="#f472b6" strokeWidth="1.5" />
        <text x="410" y="48" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="600">Code Generation</text>
        <text x="410" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="7">Client stubs</text>
        <text x="410" y="78" textAnchor="middle" fill="#a1a1aa" fontSize="7">Server interfaces</text>
        <text x="410" y="88" textAnchor="middle" fill="#a1a1aa" fontSize="6">Type-safe APIs</text>
        <rect x="20" y="110" width="460" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="128" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">4 Streaming Types</text>
        {['Unary (1:1)', 'Server Stream (1:N)', 'Client Stream (N:1)', 'Bidirectional (N:N)'].map((t, i) => (
          <text key={i} x={80 + i * 110} y={155} textAnchor="middle" fill={['#4ade80', '#60a5fa', '#fb923c', '#a78bfa'][i]} fontSize="7">{t}</text>
        ))}
        <rect x="20" y="185" width="225" height="60" rx="6" fill="#22d3ee15" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="132" y="203" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="600">When to Use gRPC</text>
        <text x="132" y="220" textAnchor="middle" fill="#a1a1aa" fontSize="7">Microservice-to-microservice</text>
        <text x="132" y="235" textAnchor="middle" fill="#a1a1aa" fontSize="7">High-performance, low latency</text>
        <rect x="255" y="185" width="225" height="60" rx="6" fill="#fbbf2415" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="367" y="203" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">Trade-offs</text>
        <text x="367" y="220" textAnchor="middle" fill="#a1a1aa" fontSize="7">+ Performance, type safety</text>
        <text x="367" y="235" textAnchor="middle" fill="#a1a1aa" fontSize="7">- Browser support, debugging</text>
      </svg>
    ),
    gatewaypatterns: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">API Gateway Patterns - Routing, Aggregation, Security</text>
        <rect x="175" y="25" width="150" height="40" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="2" />
        <text x="250" y="50" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">API Gateway</text>
        {[
          { x: 20, y: 85, name: 'Routing', desc: 'Path-based, header-based', color: '#60a5fa' },
          { x: 180, y: 85, name: 'Aggregation', desc: 'Combine multiple APIs', color: '#f472b6' },
          { x: 340, y: 85, name: 'Protocol Trans.', desc: 'REST ↔ gRPC ↔ WS', color: '#fb923c' }
        ].map((n, i) => (
          <g key={i}>
            <path d="M250 65 L250 75" stroke="#3f3f46" strokeWidth="1" />
            <path d={`M250 75 L${n.x + 70} 85`} stroke="#3f3f46" strokeWidth="0.5" />
            <rect x={n.x} y={n.y} width="140" height="45" rx="5" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        {[
          { x: 20, y: 145, name: 'Auth/AuthZ', desc: 'JWT, OAuth, API keys', color: '#a78bfa' },
          { x: 180, y: 145, name: 'Rate Limiting', desc: 'Quotas, throttling', color: '#22d3ee' },
          { x: 340, y: 145, name: 'Caching', desc: 'Response caching', color: '#fbbf24' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="45" rx="5" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        <rect x="20" y="200" width="460" height="30" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="220" textAnchor="middle" fill="#71717a" fontSize="7">Solutions: Kong, AWS API Gateway, Azure APIM, Apigee, NGINX, Traefik, Ambassador</text>
      </svg>
    ),
    proxygwlb: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Reverse Proxy vs API Gateway vs Load Balancer</text>
        {[
          { x: 20, y: 35, name: 'Reverse Proxy', desc: 'Forward requests, SSL termination, caching', features: ['Hide backend servers', 'SSL/TLS termination', 'Static content serving'], color: '#4ade80', examples: 'Nginx, HAProxy' },
          { x: 180, y: 35, name: 'API Gateway', desc: 'API management, auth, rate limiting', features: ['Authentication/AuthZ', 'Request transformation', 'API versioning'], color: '#60a5fa', examples: 'Kong, Apigee' },
          { x: 340, y: 35, name: 'Load Balancer', desc: 'Distribute traffic across servers', features: ['Health checks', 'Session affinity', 'L4/L7 balancing'], color: '#f472b6', examples: 'AWS ALB, F5' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="130" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            {n.features.map((f, j) => <text key={j} x={n.x + 70} y={n.y + 55 + j * 15} textAnchor="middle" fill="#71717a" fontSize="6">• {f}</text>)}
            <text x={n.x + 70} y={n.y + 115} textAnchor="middle" fill="#fafafa" fontSize="6">{n.examples}</text>
          </g>
        ))}
        <rect x="20" y="180" width="460" height="45" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="198" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">When to Use Each</text>
        <text x="250" y="215" textAnchor="middle" fill="#71717a" fontSize="7">Reverse Proxy: Simple forwarding | API Gateway: API management | LB: High availability</text>
      </svg>
    ),
    graphqladopt: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">GraphQL Adoption Patterns - 4 Architecture Approaches</text>
        {[
          { x: 20, y: 35, name: 'Client-Side', desc: 'GraphQL in browser, direct to REST', good: 'Simple migration', bad: 'Multiple round trips', color: '#4ade80' },
          { x: 260, y: 35, name: 'BFF (Backend for Frontend)', desc: 'GraphQL per client type', good: 'Optimized per client', bad: 'Code duplication', color: '#60a5fa' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="220" height="80" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 110} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 110} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.desc}</text>
            <text x={n.x + 110} y={n.y + 55} textAnchor="middle" fill="#22d3ee" fontSize="6">✓ {n.good}</text>
            <text x={n.x + 110} y={n.y + 70} textAnchor="middle" fill="#f472b6" fontSize="6">✗ {n.bad}</text>
          </g>
        ))}
        {[
          { x: 20, y: 130, name: 'Monolithic Gateway', desc: 'Single GraphQL server', good: 'Simple to start', bad: 'Scaling bottleneck', color: '#f472b6' },
          { x: 260, y: 130, name: 'Federation', desc: 'Distributed graph across services', good: 'Team autonomy, scale', bad: 'Complex operations', color: '#a78bfa' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="220" height="80" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 110} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 110} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.desc}</text>
            <text x={n.x + 110} y={n.y + 55} textAnchor="middle" fill="#22d3ee" fontSize="6">✓ {n.good}</text>
            <text x={n.x + 110} y={n.y + 70} textAnchor="middle" fill="#f472b6" fontSize="6">✗ {n.bad}</text>
          </g>
        ))}
        <text x="250" y="228" textAnchor="middle" fill="#71717a" fontSize="7">Most companies: Start Monolithic → Move to Federation as team grows</text>
      </svg>
    ),
    pollwebhook: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Polling vs Webhooks - Push vs Pull Patterns</text>
        <rect x="20" y="30" width="220" height="110" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="130" y="50" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">Polling (Pull)</text>
        <text x="130" y="70" textAnchor="middle" fill="#a1a1aa" fontSize="7">Client repeatedly asks: "Any updates?"</text>
        <text x="130" y="90" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Simple, client controls timing</text>
        <text x="130" y="105" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Works through firewalls</text>
        <text x="130" y="120" textAnchor="middle" fill="#f472b6" fontSize="7">✗ Wastes resources on no-change</text>
        <text x="130" y="135" textAnchor="middle" fill="#f472b6" fontSize="7">✗ Delay between polls</text>
        <rect x="260" y="30" width="220" height="110" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="370" y="50" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">Webhooks (Push)</text>
        <text x="370" y="70" textAnchor="middle" fill="#a1a1aa" fontSize="7">Server pushes: "Here's an update!"</text>
        <text x="370" y="90" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Real-time, efficient</text>
        <text x="370" y="105" textAnchor="middle" fill="#4ade80" fontSize="7">✓ Only when data changes</text>
        <text x="370" y="120" textAnchor="middle" fill="#f472b6" fontSize="7">✗ Needs public endpoint</text>
        <text x="370" y="135" textAnchor="middle" fill="#f472b6" fontSize="7">✗ Retry/delivery complexity</text>
        <rect x="20" y="155" width="460" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="173" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Webhook Best Practices</text>
        <text x="250" y="190" textAnchor="middle" fill="#71717a" fontSize="7">Signature verification | Idempotency keys | Retry with exponential backoff | Timeout handling</text>
      </svg>
    ),
    apilandscape: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">API Protocols Landscape - When to Use What</text>
        {[
          { x: 20, y: 30, name: 'REST', desc: 'HTTP + JSON, stateless', use: 'CRUD, public APIs', company: 'Stripe, GitHub', color: '#4ade80' },
          { x: 180, y: 30, name: 'GraphQL', desc: 'Query language, single endpoint', use: 'Flexible queries, mobile', company: 'GitHub, Shopify', color: '#f472b6' },
          { x: 340, y: 30, name: 'gRPC', desc: 'Binary, HTTP/2, streaming', use: 'Microservices, perf', company: 'Google, Netflix', color: '#60a5fa' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="80" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 52} textAnchor="middle" fill="#22d3ee" fontSize="6">{n.use}</text>
            <text x={n.x + 70} y={n.y + 68} textAnchor="middle" fill="#71717a" fontSize="6">{n.company}</text>
          </g>
        ))}
        {[
          { x: 20, y: 125, name: 'WebSocket', desc: 'Full-duplex, persistent', use: 'Real-time, chat, gaming', company: 'Slack, Discord', color: '#fb923c' },
          { x: 180, y: 125, name: 'Webhooks', desc: 'HTTP callbacks, event-driven', use: 'Notifications, integrations', company: 'Stripe, GitHub', color: '#a78bfa' },
          { x: 340, y: 125, name: 'SSE', desc: 'Server-sent events, one-way', use: 'Live updates, feeds', company: 'Twitter, Stock apps', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="80" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 52} textAnchor="middle" fill="#22d3ee" fontSize="6">{n.use}</text>
            <text x={n.x + 70} y={n.y + 68} textAnchor="middle" fill="#71717a" fontSize="6">{n.company}</text>
          </g>
        ))}
        <rect x="20" y="220" width="460" height="30" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="240" textAnchor="middle" fill="#71717a" fontSize="7">Decision: External API → REST | High perf → gRPC | Flexible client → GraphQL | Real-time → WebSocket/SSE</text>
      </svg>
    ),
    // Phase 2: Real-Time, DevOps, Performance
    livestream: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Live Streaming Architecture - Capture to Delivery</text>
        {[
          { x: 20, y: 35, name: 'Capture', desc: 'Camera, OBS, Encoder', color: '#f472b6' },
          { x: 115, y: 35, name: 'Ingest', desc: 'RTMP to origin', color: '#fb923c' },
          { x: 210, y: 35, name: 'Transcode', desc: 'Multiple bitrates', color: '#4ade80' },
          { x: 305, y: 35, name: 'Package', desc: 'HLS/DASH segments', color: '#60a5fa' },
          { x: 400, y: 35, name: 'CDN', desc: 'Global delivery', color: '#a78bfa' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="85" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 42} y={n.y + 20} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 42} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            {i < 4 && <path d={`M${n.x + 85} ${n.y + 25} L${n.x + 95} ${n.y + 25}`} stroke="#3f3f46" strokeWidth="1.5" />}
          </g>
        ))}
        <rect x="20" y="100" width="225" height="70" rx="6" fill="#22d3ee15" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="132" y="118" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="600">Protocols</text>
        <text x="132" y="138" textAnchor="middle" fill="#a1a1aa" fontSize="7">RTMP: Ingest (low latency)</text>
        <text x="132" y="153" textAnchor="middle" fill="#a1a1aa" fontSize="7">HLS: Apple, 6-30s latency</text>
        <text x="132" y="165" textAnchor="middle" fill="#a1a1aa" fontSize="7">DASH: Standard, adaptive</text>
        <rect x="255" y="100" width="225" height="70" rx="6" fill="#fbbf2415" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="367" y="118" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">Adaptive Bitrate</text>
        <text x="367" y="138" textAnchor="middle" fill="#a1a1aa" fontSize="7">1080p: 6 Mbps</text>
        <text x="367" y="153" textAnchor="middle" fill="#a1a1aa" fontSize="7">720p: 3 Mbps</text>
        <text x="367" y="165" textAnchor="middle" fill="#a1a1aa" fontSize="7">360p: 1 Mbps</text>
        <rect x="20" y="185" width="460" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="205" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Companies & Low Latency</text>
        <text x="250" y="225" textAnchor="middle" fill="#71717a" fontSize="7">Twitch: Sub-3s with Low Latency HLS | YouTube Live: DASH + WebRTC | Discord: WebRTC for calls</text>
        <text x="250" y="238" textAnchor="middle" fill="#71717a" fontSize="6">WebRTC: Real-time, P2P, sub-500ms | SRT: Secure, low latency</text>
      </svg>
    ),
    pushnotify: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Push Notification Architecture - FCM, APNs, Web Push</text>
        <rect x="175" y="30" width="150" height="40" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="2" />
        <text x="250" y="55" textAnchor="middle" fill="#fb923c" fontSize="10" fontWeight="600">Your Backend</text>
        {[
          { x: 20, y: 100, name: 'FCM', desc: 'Firebase (Android/iOS/Web)', color: '#fbbf24' },
          { x: 180, y: 100, name: 'APNs', desc: 'Apple Push (iOS/macOS)', color: '#a78bfa' },
          { x: 340, y: 100, name: 'Web Push', desc: 'Service Worker + VAPID', color: '#60a5fa' }
        ].map((n, i) => (
          <g key={i}>
            <path d={`M250 70 L${n.x + 70} 100`} stroke="#3f3f46" strokeWidth="0.5" />
            <rect x={n.x} y={n.y} width="140" height="50" rx="5" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 20} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        <rect x="20" y="170" width="225" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="188" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Token Management</text>
        <text x="132" y="205" textAnchor="middle" fill="#71717a" fontSize="7">Device registers → Get token</text>
        <text x="132" y="218" textAnchor="middle" fill="#71717a" fontSize="7">Store token → Send by topic/token</text>
        <rect x="255" y="170" width="225" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="367" y="188" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Best Practices</text>
        <text x="367" y="205" textAnchor="middle" fill="#71717a" fontSize="7">Batch sends, handle token refresh</text>
        <text x="367" y="218" textAnchor="middle" fill="#71717a" fontSize="7">Rate limit, respect preferences</text>
      </svg>
    ),
    wsdeep: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">WebSocket Deep Dive - Connection Lifecycle & Scaling</text>
        {[
          { x: 20, y: 35, name: 'HTTP Upgrade', desc: 'Upgrade: websocket', color: '#4ade80' },
          { x: 140, y: 35, name: 'Handshake', desc: 'Sec-WebSocket-Key', color: '#60a5fa' },
          { x: 260, y: 35, name: 'Connected', desc: 'Full-duplex open', color: '#f472b6' },
          { x: 380, y: 35, name: 'Close', desc: 'Close frame + code', color: '#fb923c' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="100" height="45" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 50} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 50} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            {i < 3 && <path d={`M${n.x + 100} ${n.y + 22} L${n.x + 120} ${n.y + 22}`} stroke="#3f3f46" strokeWidth="1" />}
          </g>
        ))}
        <rect x="20" y="95" width="225" height="65" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="132" y="113" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Keep-Alive</text>
        <text x="132" y="130" textAnchor="middle" fill="#a1a1aa" fontSize="7">Ping/Pong frames (30-60s)</text>
        <text x="132" y="145" textAnchor="middle" fill="#a1a1aa" fontSize="7">Detect dead connections</text>
        <text x="132" y="158" textAnchor="middle" fill="#a1a1aa" fontSize="6">Handle reconnection with backoff</text>
        <rect x="255" y="95" width="225" height="65" rx="6" fill="#22d3ee15" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="367" y="113" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="600">Scaling</text>
        <text x="367" y="130" textAnchor="middle" fill="#a1a1aa" fontSize="7">Sticky sessions (IP hash)</text>
        <text x="367" y="145" textAnchor="middle" fill="#a1a1aa" fontSize="7">Redis Pub/Sub for broadcast</text>
        <text x="367" y="158" textAnchor="middle" fill="#a1a1aa" fontSize="6">Connection limits per server (~65K)</text>
        <rect x="20" y="175" width="460" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="195" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Companies: Discord (millions of connections), Slack, Figma, Notion</text>
        <text x="250" y="215" textAnchor="middle" fill="#71717a" fontSize="7">Socket.IO: Auto-fallback | ws: Node.js library | AWS API Gateway: Managed WebSocket</text>
      </svg>
    ),
    cicdpipe: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">CI/CD Pipeline - From Code to Production</text>
        {[
          { x: 20, y: 35, name: 'Plan', desc: 'Jira, Linear', color: '#a78bfa' },
          { x: 100, y: 35, name: 'Code', desc: 'Git, IDE', color: '#60a5fa' },
          { x: 180, y: 35, name: 'Build', desc: 'Compile, Docker', color: '#4ade80' },
          { x: 260, y: 35, name: 'Test', desc: 'Unit, Integration', color: '#fbbf24' },
          { x: 340, y: 35, name: 'Release', desc: 'Tag, Artifact', color: '#f472b6' },
          { x: 420, y: 35, name: 'Deploy', desc: 'K8s, Lambda', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="70" height="45" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 35} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="7" fontWeight="600">{n.name}</text>
            <text x={n.x + 35} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="5">{n.desc}</text>
            {i < 5 && <path d={`M${n.x + 70} ${n.y + 22} L${n.x + 80} ${n.y + 22}`} stroke="#3f3f46" strokeWidth="1" />}
          </g>
        ))}
        <rect x="20" y="95" width="225" height="75" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="112" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">CI (Continuous Integration)</text>
        <text x="132" y="130" textAnchor="middle" fill="#a1a1aa" fontSize="7">Merge often → Auto build → Auto test</text>
        <text x="132" y="148" textAnchor="middle" fill="#71717a" fontSize="6">Tools: GitHub Actions, Jenkins, GitLab CI</text>
        <text x="132" y="163" textAnchor="middle" fill="#71717a" fontSize="6">CircleCI, Travis CI, Azure DevOps</text>
        <rect x="255" y="95" width="225" height="75" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="367" y="112" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">CD (Continuous Delivery/Deploy)</text>
        <text x="367" y="130" textAnchor="middle" fill="#a1a1aa" fontSize="7">Delivery: Deploy-ready artifacts</text>
        <text x="367" y="148" textAnchor="middle" fill="#a1a1aa" fontSize="7">Deployment: Auto push to prod</text>
        <text x="367" y="163" textAnchor="middle" fill="#71717a" fontSize="6">ArgoCD, Spinnaker, Flux</text>
        <rect x="20" y="185" width="460" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="205" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Best Practices</text>
        <text x="250" y="225" textAnchor="middle" fill="#71717a" fontSize="7">Fast feedback (&lt;10 min) | Trunk-based development | Feature flags | Canary/Blue-green deploys</text>
        <text x="250" y="238" textAnchor="middle" fill="#71717a" fontSize="6">Amazon: Deploy every 11.7 seconds | Netflix: Full CD with canary</text>
      </svg>
    ),
    configiac: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Configuration Management vs Infrastructure as Code</text>
        <rect x="20" y="35" width="220" height="100" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="130" y="55" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="600">Config Management</text>
        <text x="130" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Manage existing servers</text>
        <text x="130" y="92" textAnchor="middle" fill="#22d3ee" fontSize="7">Ansible, Chef, Puppet, Salt</text>
        <text x="130" y="109" textAnchor="middle" fill="#71717a" fontSize="6">Mutable: Update in place</text>
        <text x="130" y="124" textAnchor="middle" fill="#71717a" fontSize="6">Agent or agentless (SSH)</text>
        <rect x="260" y="35" width="220" height="100" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="370" y="55" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">Infrastructure as Code</text>
        <text x="370" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Provision infrastructure</text>
        <text x="370" y="92" textAnchor="middle" fill="#22d3ee" fontSize="7">Terraform, Pulumi, CloudFormation</text>
        <text x="370" y="109" textAnchor="middle" fill="#71717a" fontSize="6">Immutable: Replace, dont update</text>
        <text x="370" y="124" textAnchor="middle" fill="#71717a" fontSize="6">Declarative state management</text>
        <rect x="20" y="150" width="460" height="75" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="170" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Tools Comparison</text>
        {[
          { x: 50, name: 'Terraform', desc: 'Cloud-agnostic', color: '#a78bfa' },
          { x: 165, name: 'Ansible', desc: 'Agentless, YAML', color: '#f472b6' },
          { x: 280, name: 'Pulumi', desc: 'Real languages', color: '#4ade80' },
          { x: 395, name: 'CDK', desc: 'AWS native', color: '#fb923c' }
        ].map((t, i) => (
          <g key={i}>
            <text x={t.x} y={195} textAnchor="middle" fill={t.color} fontSize="8" fontWeight="600">{t.name}</text>
            <text x={t.x} y={212} textAnchor="middle" fill="#71717a" fontSize="6">{t.desc}</text>
          </g>
        ))}
      </svg>
    ),
    dockerdeep: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Docker Architecture - Layers, Daemon, Registry</text>
        {[
          { x: 20, y: 35, name: 'Docker Client', desc: 'CLI commands', color: '#60a5fa' },
          { x: 180, y: 35, name: 'Docker Daemon', desc: 'Manages containers', color: '#4ade80' },
          { x: 340, y: 35, name: 'Registry', desc: 'Image storage', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 20} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        <path d="M160 60 L180 60" stroke="#3f3f46" strokeWidth="1" />
        <path d="M320 60 L340 60" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3,3" />
        <rect x="20" y="100" width="225" height="80" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="118" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Image Layers</text>
        <text x="132" y="138" textAnchor="middle" fill="#fb923c" fontSize="7">Layer 4: CMD, COPY app</text>
        <text x="132" y="153" textAnchor="middle" fill="#a78bfa" fontSize="7">Layer 3: npm install</text>
        <text x="132" y="168" textAnchor="middle" fill="#22d3ee" fontSize="7">Layer 2: Base image</text>
        <text x="132" y="178" textAnchor="middle" fill="#71717a" fontSize="6">Layers cached, shared</text>
        <rect x="255" y="100" width="225" height="80" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="367" y="118" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Container Runtime</text>
        <text x="367" y="138" textAnchor="middle" fill="#a1a1aa" fontSize="7">containerd: Industry standard</text>
        <text x="367" y="153" textAnchor="middle" fill="#a1a1aa" fontSize="7">runc: OCI runtime</text>
        <text x="367" y="168" textAnchor="middle" fill="#a1a1aa" fontSize="7">cgroups: Resource limits</text>
        <text x="367" y="178" textAnchor="middle" fill="#71717a" fontSize="6">namespaces: Isolation</text>
        <rect x="20" y="195" width="460" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="215" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Best Practices: Multi-stage builds, .dockerignore, non-root user, minimal base image</text>
        <text x="250" y="235" textAnchor="middle" fill="#71717a" fontSize="7">Used by: Every modern company | Registries: Docker Hub, ECR, GCR, ACR</text>
      </svg>
    ),
    gitworkflows: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Git Workflows - Git Flow, GitHub Flow, Trunk-Based</text>
        <rect x="20" y="35" width="145" height="100" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="92" y="55" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Git Flow</text>
        <text x="92" y="72" textAnchor="middle" fill="#a1a1aa" fontSize="6">main, develop, feature/</text>
        <text x="92" y="85" textAnchor="middle" fill="#a1a1aa" fontSize="6">release/, hotfix/</text>
        <text x="92" y="102" textAnchor="middle" fill="#4ade80" fontSize="6">✓ Versioned releases</text>
        <text x="92" y="118" textAnchor="middle" fill="#f472b6" fontSize="6">✗ Complex, slow</text>
        <text x="92" y="130" textAnchor="middle" fill="#71717a" fontSize="6">Best: Versioned software</text>
        <rect x="177" y="35" width="145" height="100" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="250" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">GitHub Flow</text>
        <text x="250" y="72" textAnchor="middle" fill="#a1a1aa" fontSize="6">main + feature branches</text>
        <text x="250" y="85" textAnchor="middle" fill="#a1a1aa" fontSize="6">PR → Review → Merge</text>
        <text x="250" y="102" textAnchor="middle" fill="#4ade80" fontSize="6">✓ Simple, fast</text>
        <text x="250" y="118" textAnchor="middle" fill="#f472b6" fontSize="6">✗ No release branches</text>
        <text x="250" y="130" textAnchor="middle" fill="#71717a" fontSize="6">Best: Web apps, SaaS</text>
        <rect x="335" y="35" width="145" height="100" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="407" y="55" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">Trunk-Based</text>
        <text x="407" y="72" textAnchor="middle" fill="#a1a1aa" fontSize="6">All commits to main</text>
        <text x="407" y="85" textAnchor="middle" fill="#a1a1aa" fontSize="6">Feature flags, short PRs</text>
        <text x="407" y="102" textAnchor="middle" fill="#4ade80" fontSize="6">✓ Fastest CI/CD</text>
        <text x="407" y="118" textAnchor="middle" fill="#f472b6" fontSize="6">✗ Needs mature CI/CD</text>
        <text x="407" y="130" textAnchor="middle" fill="#71717a" fontSize="6">Best: High velocity teams</text>
        <rect x="20" y="150" width="460" height="75" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="170" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Company Examples</text>
        <text x="250" y="190" textAnchor="middle" fill="#71717a" fontSize="7">Git Flow: Versioned libraries | GitHub Flow: GitHub, most startups | Trunk: Google, Meta, Netflix</text>
        <text x="250" y="210" textAnchor="middle" fill="#71717a" fontSize="7">Key: Trunk-based with feature flags enables fastest iteration with safety</text>
      </svg>
    ),
    webperf: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Web Performance Metrics - Core Web Vitals & More</text>
        {[
          { x: 20, y: 35, name: 'FCP', full: 'First Contentful Paint', target: '< 1.8s', color: '#4ade80' },
          { x: 180, y: 35, name: 'LCP', full: 'Largest Contentful Paint', target: '< 2.5s', color: '#60a5fa' },
          { x: 340, y: 35, name: 'CLS', full: 'Cumulative Layout Shift', target: '< 0.1', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.full}</text>
            <text x={n.x + 70} y={n.y + 50} textAnchor="middle" fill="#22d3ee" fontSize="7">{n.target}</text>
          </g>
        ))}
        {[
          { x: 20, y: 110, name: 'TTFB', full: 'Time to First Byte', target: '< 800ms', color: '#fb923c' },
          { x: 180, y: 110, name: 'INP', full: 'Interaction to Next Paint', target: '< 200ms', color: '#a78bfa' },
          { x: 340, y: 110, name: 'TBT', full: 'Total Blocking Time', target: '< 200ms', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.full}</text>
            <text x={n.x + 70} y={n.y + 50} textAnchor="middle" fill="#22d3ee" fontSize="7">{n.target}</text>
          </g>
        ))}
        <rect x="20" y="185" width="460" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="205" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Core Web Vitals (Google ranking factor): LCP, INP, CLS</text>
        <text x="250" y="225" textAnchor="middle" fill="#71717a" fontSize="7">Tools: Lighthouse, PageSpeed Insights, Web Vitals extension, Chrome DevTools</text>
        <text x="250" y="238" textAnchor="middle" fill="#71717a" fontSize="6">Real User Monitoring: Datadog RUM, New Relic, Sentry Performance</text>
      </svg>
    ),
    frontendperf: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Frontend Performance - 8 Optimization Techniques</text>
        {[
          { x: 20, y: 30, name: 'Code Splitting', desc: 'Load only needed JS', color: '#4ade80' },
          { x: 180, y: 30, name: 'Lazy Loading', desc: 'Defer below-fold images', color: '#60a5fa' },
          { x: 340, y: 30, name: 'Compression', desc: 'Brotli/Gzip assets', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        {[
          { x: 20, y: 95, name: 'Image Optimization', desc: 'WebP, srcset, CDN', color: '#fb923c' },
          { x: 180, y: 95, name: 'Caching', desc: 'Browser + CDN cache', color: '#a78bfa' },
          { x: 340, y: 95, name: 'Minification', desc: 'Remove whitespace', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        {[
          { x: 20, y: 160, name: 'Tree Shaking', desc: 'Remove unused code', color: '#fbbf24' },
          { x: 180, y: 160, name: 'Preconnect', desc: 'Early DNS/TLS hints', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        <rect x="340" y="160" width="140" height="85" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="410" y="180" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Tools</text>
        <text x="410" y="198" textAnchor="middle" fill="#71717a" fontSize="6">Webpack, Vite, esbuild</text>
        <text x="410" y="213" textAnchor="middle" fill="#71717a" fontSize="6">Parcel, Rollup</text>
        <text x="410" y="228" textAnchor="middle" fill="#71717a" fontSize="6">Next.js, Nuxt</text>
      </svg>
    ),
    latencynums: (
      <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Latency Numbers Every Programmer Should Know</text>
        {[
          { y: 35, name: 'L1 cache reference', time: '0.5 ns', color: '#4ade80', bar: 2 },
          { y: 55, name: 'Branch mispredict', time: '5 ns', color: '#4ade80', bar: 3 },
          { y: 75, name: 'L2 cache reference', time: '7 ns', color: '#60a5fa', bar: 4 },
          { y: 95, name: 'Mutex lock/unlock', time: '25 ns', color: '#60a5fa', bar: 8 },
          { y: 115, name: 'Main memory reference', time: '100 ns', color: '#fbbf24', bar: 20 },
          { y: 135, name: 'SSD random read', time: '150 μs', color: '#fb923c', bar: 60 },
          { y: 155, name: 'Read 1MB from memory', time: '250 μs', color: '#fb923c', bar: 80 },
          { y: 175, name: 'Round trip same DC', time: '500 μs', color: '#f472b6', bar: 100 },
          { y: 195, name: 'Read 1MB from SSD', time: '1 ms', color: '#f472b6', bar: 140 },
          { y: 215, name: 'HDD seek', time: '10 ms', color: '#a78bfa', bar: 200 },
          { y: 235, name: 'CA to Netherlands', time: '150 ms', color: '#22d3ee', bar: 300 }
        ].map((n, i) => (
          <g key={i}>
            <text x="155" y={n.y + 10} textAnchor="end" fill="#a1a1aa" fontSize="7">{n.name}</text>
            <rect x="160" y={n.y} width={n.bar} height="15" rx="2" fill={n.color} />
            <text x={170 + n.bar} y={n.y + 10} fill={n.color} fontSize="7">{n.time}</text>
          </g>
        ))}
        <text x="250" y="270" textAnchor="middle" fill="#71717a" fontSize="7">Source: Jeff Dean (Google) | Memory is 100x faster than SSD, 10000x faster than HDD</text>
      </svg>
    ),
    latencyreduce: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Latency Reduction Strategies</text>
        {[
          { x: 20, y: 35, name: 'Caching', desc: 'In-memory, Redis, CDN', impact: '10-100x faster', color: '#4ade80' },
          { x: 180, y: 35, name: 'Indexing', desc: 'B-tree, hash indexes', impact: '100-1000x faster', color: '#60a5fa' },
          { x: 340, y: 35, name: 'CDN', desc: 'Edge serving', impact: '2-10x faster', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="65" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 52} textAnchor="middle" fill="#22d3ee" fontSize="7">{n.impact}</text>
          </g>
        ))}
        {[
          { x: 20, y: 115, name: 'Async Processing', desc: 'Queue background work', impact: 'Non-blocking', color: '#fb923c' },
          { x: 180, y: 115, name: 'Connection Pool', desc: 'Reuse DB connections', impact: '5-20x faster', color: '#a78bfa' },
          { x: 340, y: 115, name: 'Data Locality', desc: 'Compute near data', impact: '10-50x faster', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="65" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 52} textAnchor="middle" fill="#22d3ee" fontSize="7">{n.impact}</text>
          </g>
        ))}
        <rect x="20" y="195" width="460" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="215" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Priority: Cache hot data → Index queries → Use CDN → Async where possible</text>
        <text x="250" y="235" textAnchor="middle" fill="#71717a" fontSize="7">Measure first (APM tools), optimize bottlenecks, avoid premature optimization</text>
      </svg>
    ),
    // Remaining Phase 2 diagrams
    cacheevict: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Cache Eviction Policies Comparison</text>
        {[
          { x: 20, y: 35, name: 'LRU', full: 'Least Recently Used', desc: 'Evict oldest access', color: '#4ade80' },
          { x: 180, y: 35, name: 'LFU', full: 'Least Frequently Used', desc: 'Evict lowest count', color: '#60a5fa' },
          { x: 340, y: 35, name: 'FIFO', full: 'First In First Out', desc: 'Evict oldest entry', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.full}</text>
            <text x={n.x + 70} y={n.y + 50} textAnchor="middle" fill="#71717a" fontSize="6">{n.desc}</text>
          </g>
        ))}
        {[
          { x: 20, y: 110, name: 'TTL', full: 'Time To Live', desc: 'Expire after time', color: '#fb923c' },
          { x: 180, y: 110, name: 'Random', full: 'Random Eviction', desc: 'Simple, fast', color: '#a78bfa' },
          { x: 340, y: 110, name: 'SLRU', full: 'Segmented LRU', desc: 'Protected segment', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.full}</text>
            <text x={n.x + 70} y={n.y + 50} textAnchor="middle" fill="#71717a" fontSize="6">{n.desc}</text>
          </g>
        ))}
        <rect x="20" y="185" width="460" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="205" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Common Choices</text>
        <text x="250" y="225" textAnchor="middle" fill="#71717a" fontSize="7">General purpose: LRU | Scan-resistant: SLRU | Simple: TTL + LRU</text>
        <text x="250" y="238" textAnchor="middle" fill="#71717a" fontSize="6">Redis: allkeys-lru, volatile-lru, allkeys-lfu, volatile-ttl, noeviction</text>
      </svg>
    ),
    twoTierCache: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Two-Tier Caching Architecture</text>
        <rect x="100" y="35" width="300" height="45" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="250" y="55" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">L1: In-Process Cache</text>
        <text x="250" y="72" textAnchor="middle" fill="#a1a1aa" fontSize="7">Caffeine, Guava (Java) | lru-cache (Node) | ~1ms</text>
        <path d="M250 80 L250 95" stroke="#3f3f46" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <rect x="100" y="95" width="300" height="45" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="250" y="115" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">L2: Distributed Cache</text>
        <text x="250" y="132" textAnchor="middle" fill="#a1a1aa" fontSize="7">Redis, Memcached | Network hop | ~1-5ms</text>
        <rect x="20" y="155" width="225" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="173" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Benefits</text>
        <text x="132" y="190" textAnchor="middle" fill="#71717a" fontSize="7">Reduce network calls, higher throughput</text>
        <rect x="255" y="155" width="225" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="367" y="173" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Challenges</text>
        <text x="367" y="190" textAnchor="middle" fill="#71717a" fontSize="7">Invalidation complexity, memory per instance</text>
      </svg>
    ),
    rediscluster: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Redis Sentinel vs Redis Cluster</text>
        <rect x="20" y="35" width="220" height="100" rx="6" fill="#f472b615" stroke="#f472b6" strokeWidth="1.5" />
        <text x="130" y="55" textAnchor="middle" fill="#f472b6" fontSize="10" fontWeight="600">Redis Sentinel</text>
        <text x="130" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">High availability, auto-failover</text>
        <text x="130" y="92" textAnchor="middle" fill="#71717a" fontSize="6">1 master + N replicas</text>
        <text x="130" y="107" textAnchor="middle" fill="#71717a" fontSize="6">3+ sentinels for quorum</text>
        <text x="130" y="122" textAnchor="middle" fill="#22d3ee" fontSize="6">Use: HA without sharding</text>
        <rect x="260" y="35" width="220" height="100" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="370" y="55" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">Redis Cluster</text>
        <text x="370" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Sharding + High availability</text>
        <text x="370" y="92" textAnchor="middle" fill="#71717a" fontSize="6">16384 hash slots distributed</text>
        <text x="370" y="107" textAnchor="middle" fill="#71717a" fontSize="6">Min 3 masters + replicas</text>
        <text x="370" y="122" textAnchor="middle" fill="#22d3ee" fontSize="6">Use: Scale beyond single node</text>
        <rect x="20" y="150" width="460" height="95" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="170" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Cluster Key Distribution</text>
        <text x="250" y="190" textAnchor="middle" fill="#a1a1aa" fontSize="7">slot = CRC16(key) mod 16384</text>
        <text x="250" y="210" textAnchor="middle" fill="#71717a" fontSize="7">Hash tags: {"{"}user:1{"}"}:session and {"{"}user:1{"}"}:cart → same slot</text>
        <text x="250" y="230" textAnchor="middle" fill="#71717a" fontSize="6">Multi-key operations only work if keys are on same slot</text>
      </svg>
    ),
    hapatterns: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">High Availability Patterns</text>
        {[
          { x: 20, y: 35, name: 'Active-Active', desc: 'Both serve traffic', rto: 'Zero', color: '#4ade80' },
          { x: 180, y: 35, name: 'Active-Passive', desc: 'Standby takes over', rto: 'Minutes', color: '#60a5fa' },
          { x: 340, y: 35, name: 'Active-Warm', desc: 'Warm ready quickly', rto: 'Seconds', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="65" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 52} textAnchor="middle" fill="#22d3ee" fontSize="7">RTO: {n.rto}</text>
          </g>
        ))}
        <rect x="20" y="115" width="225" height="60" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="132" y="133" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">RTO (Recovery Time Objective)</text>
        <text x="132" y="150" textAnchor="middle" fill="#a1a1aa" fontSize="7">Max acceptable downtime</text>
        <text x="132" y="165" textAnchor="middle" fill="#71717a" fontSize="6">E-commerce: minutes | Finance: seconds</text>
        <rect x="255" y="115" width="225" height="60" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="367" y="133" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">RPO (Recovery Point Objective)</text>
        <text x="367" y="150" textAnchor="middle" fill="#a1a1aa" fontSize="7">Max acceptable data loss</text>
        <text x="367" y="165" textAnchor="middle" fill="#71717a" fontSize="6">Sync replication: zero | Async: minutes</text>
        <rect x="20" y="190" width="460" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="210" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">SLA: 99.9% = 8.7h/year | 99.99% = 52min/year | 99.999% = 5min/year</text>
        <text x="250" y="230" textAnchor="middle" fill="#71717a" fontSize="7">AWS, Google Cloud: Multi-AZ for 99.99% | Multi-region for 99.999%</text>
      </svg>
    ),
    archpatterns: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Software Architecture Patterns</text>
        {[
          { x: 20, y: 35, name: 'Microkernel', desc: 'Core + plugins', use: 'IDEs, browsers', color: '#4ade80' },
          { x: 180, y: 35, name: 'Space-Based', desc: 'Distributed memory', use: 'High volume', color: '#60a5fa' },
          { x: 340, y: 35, name: 'Pipe-Filter', desc: 'Data transforms', use: 'ETL, compilers', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="65" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 52} textAnchor="middle" fill="#22d3ee" fontSize="6">{n.use}</text>
          </g>
        ))}
        {[
          { x: 20, y: 115, name: 'Event-Driven', desc: 'Async events', use: 'Real-time', color: '#fb923c' },
          { x: 180, y: 115, name: 'Hexagonal', desc: 'Ports & adapters', use: 'Testable core', color: '#a78bfa' },
          { x: 340, y: 115, name: 'CQRS', desc: 'Read/write split', use: 'High read load', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="65" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 52} textAnchor="middle" fill="#22d3ee" fontSize="6">{n.use}</text>
          </g>
        ))}
        <rect x="20" y="195" width="460" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="215" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Choose based on: Team size, scalability needs, domain complexity</text>
        <text x="250" y="235" textAnchor="middle" fill="#71717a" fontSize="7">Start simple (layered), evolve as needed. Most systems use hybrid approaches.</text>
      </svg>
    ),
    faulttolerant: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Fault-Tolerant System Principles</text>
        {[
          { x: 20, y: 35, name: 'Redundancy', desc: 'Multiple instances', icon: '📦📦', color: '#4ade80' },
          { x: 180, y: 35, name: 'Isolation', desc: 'Bulkhead pattern', icon: '🚢', color: '#60a5fa' },
          { x: 340, y: 35, name: 'Failover', desc: 'Auto switch to backup', icon: '🔄', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 50} textAnchor="middle" fontSize="12">{n.icon}</text>
          </g>
        ))}
        {[
          { x: 20, y: 110, name: 'Circuit Breaker', desc: 'Stop cascading failures', icon: '🔌', color: '#fb923c' },
          { x: 180, y: 110, name: 'Retry + Backoff', desc: 'Handle transient errors', icon: '🔁', color: '#a78bfa' },
          { x: 340, y: 110, name: 'Timeout', desc: 'Bound response time', icon: '⏱️', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 50} textAnchor="middle" fontSize="12">{n.icon}</text>
          </g>
        ))}
        <rect x="20" y="185" width="460" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="205" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Netflix: Hystrix (now Resilience4j) | AWS: Auto-scaling groups</text>
        <text x="250" y="225" textAnchor="middle" fill="#71717a" fontSize="7">Chaos Engineering: Test failures proactively (Chaos Monkey, LitmusChaos)</text>
        <text x="250" y="238" textAnchor="middle" fill="#71717a" fontSize="6">Design for failure: Assume everything can and will fail</text>
      </svg>
    ),
    solidprinciples: (
      <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">SOLID Principles</text>
        {[
          { y: 35, letter: 'S', name: 'Single Responsibility', desc: 'One class, one reason to change', color: '#4ade80' },
          { y: 75, letter: 'O', name: 'Open/Closed', desc: 'Open for extension, closed for modification', color: '#60a5fa' },
          { y: 115, letter: 'L', name: 'Liskov Substitution', desc: 'Subtypes must be substitutable', color: '#f472b6' },
          { y: 155, letter: 'I', name: 'Interface Segregation', desc: 'Many specific interfaces > one general', color: '#fb923c' },
          { y: 195, letter: 'D', name: 'Dependency Inversion', desc: 'Depend on abstractions, not concretions', color: '#a78bfa' }
        ].map((n, i) => (
          <g key={i}>
            <rect x="20" y={n.y} width="40" height="30" rx="4" fill={`${n.color}30`} stroke={n.color} strokeWidth="1.5" />
            <text x="40" y={n.y + 20} textAnchor="middle" fill={n.color} fontSize="14" fontWeight="700">{n.letter}</text>
            <text x="75" y={n.y + 14} fill="#fafafa" fontSize="9" fontWeight="600">{n.name}</text>
            <text x="75" y={n.y + 27} fill="#a1a1aa" fontSize="7">{n.desc}</text>
          </g>
        ))}
        <rect x="20" y="235" width="460" height="30" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="255" textAnchor="middle" fill="#71717a" fontSize="7">Apply when code changes frequently. Dont over-engineer simple code.</text>
      </svg>
    ),
    kafkausecases: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Kafka Use Cases</text>
        {[
          { x: 20, y: 35, name: 'Log Aggregation', desc: 'Collect logs from services', company: 'LinkedIn, Uber', color: '#4ade80' },
          { x: 180, y: 35, name: 'Event Sourcing', desc: 'Store events as source of truth', company: 'Banks, Trading', color: '#60a5fa' },
          { x: 340, y: 35, name: 'Stream Processing', desc: 'Real-time transformations', company: 'Netflix, Uber', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="70" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 55} textAnchor="middle" fill="#71717a" fontSize="6">{n.company}</text>
          </g>
        ))}
        {[
          { x: 20, y: 120, name: 'CDC', desc: 'Database change capture', company: 'Debezium', color: '#fb923c' },
          { x: 180, y: 120, name: 'Microservices', desc: 'Async communication', company: 'Everyone', color: '#a78bfa' },
          { x: 340, y: 120, name: 'Metrics/Monitoring', desc: 'Time-series ingestion', company: 'InfluxDB, Datadog', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="70" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 55} textAnchor="middle" fill="#71717a" fontSize="6">{n.company}</text>
          </g>
        ))}
        <text x="250" y="220" textAnchor="middle" fill="#71717a" fontSize="7">LinkedIn: 7T+ messages/day | Uber: 4T messages/day | Netflix: 700B events/day</text>
      </svg>
    ),
    cloudmsgpatterns: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Cloud Messaging Patterns</text>
        {[
          { x: 20, y: 35, name: 'Async Request-Reply', desc: 'Request → Queue → Reply queue', color: '#4ade80' },
          { x: 180, y: 35, name: 'Claim Check', desc: 'Store payload, pass reference', color: '#60a5fa' },
          { x: 340, y: 35, name: 'Priority Queue', desc: 'High priority processed first', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="55" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        {[
          { x: 20, y: 105, name: 'Competing Consumers', desc: 'Multiple workers, one message', color: '#fb923c' },
          { x: 180, y: 105, name: 'Pub/Sub', desc: 'One message, many subscribers', color: '#a78bfa' },
          { x: 340, y: 105, name: 'Dead Letter Queue', desc: 'Failed messages for review', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="55" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        <rect x="20" y="175" width="460" height="30" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="195" textAnchor="middle" fill="#71717a" fontSize="7">Services: AWS SQS/SNS, Azure Service Bus, Google Pub/Sub, RabbitMQ</text>
      </svg>
    ),
    kafka101: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Kafka 101 - Core Concepts</text>
        {[
          { x: 20, y: 35, name: 'Producer', desc: 'Publishes messages to topics', color: '#4ade80' },
          { x: 180, y: 35, name: 'Topic', desc: 'Category of messages', color: '#60a5fa' },
          { x: 340, y: 35, name: 'Consumer', desc: 'Reads messages from topics', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 20} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        <path d="M160 60 L180 60" stroke="#3f3f46" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <path d="M320 60 L340 60" stroke="#3f3f46" strokeWidth="1.5" markerEnd="url(#arrow)" />
        {[
          { x: 20, y: 100, name: 'Partition', desc: 'Ordered, immutable log', color: '#fb923c' },
          { x: 180, y: 100, name: 'Broker', desc: 'Kafka server node', color: '#a78bfa' },
          { x: 340, y: 100, name: 'Consumer Group', desc: 'Coordinated consumers', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 20} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        <rect x="20" y="165" width="460" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="185" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Key Guarantees</text>
        <text x="250" y="205" textAnchor="middle" fill="#71717a" fontSize="7">Ordering within partition | At-least-once delivery | Durability via replication</text>
        <text x="250" y="218" textAnchor="middle" fill="#71717a" fontSize="6">Partition count determines max parallelism | Messages retained by time or size</text>
      </svg>
    ),
    creditcardfees: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Credit Card Payment Economics</text>
        <rect x="20" y="35" width="460" height="50" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="250" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Merchant Discount Rate (MDR): 1.5% - 3.5%</text>
        <text x="250" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">What merchant pays per transaction</text>
        {[
          { x: 20, y: 100, name: 'Interchange', pct: '1.5-2%', to: '→ Issuing Bank', color: '#60a5fa' },
          { x: 180, y: 100, name: 'Assessment', pct: '0.13-0.15%', to: '→ Card Network', color: '#f472b6' },
          { x: 340, y: 100, name: 'Processor', pct: '0.2-0.5%', to: '→ Acquirer', color: '#fb923c' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="55" rx="5" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#22d3ee" fontSize="8">{n.pct}</text>
            <text x={n.x + 70} y={n.y + 48} textAnchor="middle" fill="#71717a" fontSize="6">{n.to}</text>
          </g>
        ))}
        <rect x="20" y="170" width="460" height="35" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="192" textAnchor="middle" fill="#71717a" fontSize="7">Visa/Mastercard networks | Stripe, Square add ~0.5% | Debit cheaper than credit</text>
      </svg>
    ),
    paymentgateway: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Payment Gateway Flow</text>
        {[
          { x: 20, y: 35, name: 'Customer', desc: 'Card details', color: '#60a5fa' },
          { x: 115, y: 35, name: 'Merchant', desc: 'Checkout', color: '#4ade80' },
          { x: 210, y: 35, name: 'Gateway', desc: 'Stripe, Adyen', color: '#f472b6' },
          { x: 305, y: 35, name: 'Acquirer', desc: 'Bank', color: '#fb923c' },
          { x: 400, y: 35, name: 'Issuer', desc: 'Card bank', color: '#a78bfa' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="85" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 42} y={n.y + 20} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 42} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            {i < 4 && <path d={`M${n.x + 85} ${n.y + 25} L${n.x + 95} ${n.y + 25}`} stroke="#3f3f46" strokeWidth="1" />}
          </g>
        ))}
        {[
          { x: 20, y: 100, name: 'Authorization', desc: 'Verify funds, reserve amount', color: '#4ade80' },
          { x: 180, y: 100, name: 'Capture', desc: 'Finalize transaction', color: '#60a5fa' },
          { x: 340, y: 100, name: 'Settlement', desc: 'Move funds (T+1/2)', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="5" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 20} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        <rect x="20" y="165" width="460" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="185" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Key Considerations</text>
        <text x="250" y="205" textAnchor="middle" fill="#71717a" fontSize="7">PCI DSS compliance | Tokenization | 3D Secure for fraud | Idempotency keys</text>
        <text x="250" y="218" textAnchor="middle" fill="#71717a" fontSize="6">Stripe, Adyen, Braintree handle complexity. Never store raw card numbers.</text>
      </svg>
    ),
    sensitivedata: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Sensitive Data Management</text>
        {[
          { x: 20, y: 35, name: 'Encryption', desc: 'At rest & in transit', icon: '🔐', color: '#4ade80' },
          { x: 180, y: 35, name: 'Access Control', desc: 'RBAC, least privilege', icon: '🔑', color: '#60a5fa' },
          { x: 340, y: 35, name: 'Audit Logging', desc: 'Who accessed what', icon: '📋', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 52} textAnchor="middle" fontSize="12">{n.icon}</text>
          </g>
        ))}
        {[
          { x: 20, y: 110, name: 'Tokenization', desc: 'Replace sensitive with tokens', icon: '🎫', color: '#fb923c' },
          { x: 180, y: 110, name: 'Key Management', desc: 'KMS, rotation, HSM', icon: '🗝️', color: '#a78bfa' },
          { x: 340, y: 110, name: 'Data Masking', desc: 'Hide in non-prod', icon: '🎭', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 52} textAnchor="middle" fontSize="12">{n.icon}</text>
          </g>
        ))}
        <rect x="20" y="185" width="460" height="40" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="205" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">GDPR: Right to erasure | PCI DSS: Card data | HIPAA: Health data</text>
        <text x="250" y="218" textAnchor="middle" fill="#71717a" fontSize="6">AWS KMS, HashiCorp Vault, Azure Key Vault for key management</text>
      </svg>
    ),
    btreedeep: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">B-Tree Index Deep Dive</text>
        <rect x="175" y="30" width="150" height="35" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="250" y="52" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Root Node [10, 20]</text>
        {[
          { x: 50, y: 90, keys: '[3, 5, 7]', color: '#60a5fa' },
          { x: 200, y: 90, keys: '[12, 15, 18]', color: '#60a5fa' },
          { x: 350, y: 90, keys: '[25, 30, 40]', color: '#60a5fa' }
        ].map((n, i) => (
          <g key={i}>
            <path d={`M250 65 L${n.x + 50} 90`} stroke="#3f3f46" strokeWidth="0.5" />
            <rect x={n.x} y={n.y} width="100" height="30" rx="4" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 50} y={n.y + 20} textAnchor="middle" fill={n.color} fontSize="8">{n.keys}</text>
          </g>
        ))}
        <rect x="20" y="140" width="225" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="132" y="158" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">Why B-Tree for Databases?</text>
        <text x="132" y="175" textAnchor="middle" fill="#71717a" fontSize="6">Balanced: O(log n) lookup</text>
        <text x="132" y="188" textAnchor="middle" fill="#71717a" fontSize="6">Disk-friendly: Large fan-out</text>
        <rect x="255" y="140" width="225" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="367" y="158" textAnchor="middle" fill="#fafafa" fontSize="8" fontWeight="600">B+ Tree Variant</text>
        <text x="367" y="175" textAnchor="middle" fill="#71717a" fontSize="6">Data only in leaves</text>
        <text x="367" y="188" textAnchor="middle" fill="#71717a" fontSize="6">Leaves linked for range scans</text>
        <rect x="20" y="210" width="460" height="35" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="230" textAnchor="middle" fill="#71717a" fontSize="7">PostgreSQL, MySQL InnoDB use B+ trees. SSDs make LSM trees competitive (RocksDB)</text>
      </svg>
    ),
    nosqltypes: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">NoSQL Database Types</text>
        {[
          { x: 20, y: 35, name: 'Document', desc: 'JSON-like, flexible schema', examples: 'MongoDB, CouchDB', use: 'CMS, catalogs', color: '#4ade80' },
          { x: 260, y: 35, name: 'Key-Value', desc: 'Simple key → value pairs', examples: 'Redis, DynamoDB', use: 'Caching, sessions', color: '#60a5fa' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="220" height="80" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 110} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="600">{n.name}</text>
            <text x={n.x + 110} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 110} y={n.y + 52} textAnchor="middle" fill="#22d3ee" fontSize="6">{n.examples}</text>
            <text x={n.x + 110} y={n.y + 68} textAnchor="middle" fill="#71717a" fontSize="6">{n.use}</text>
          </g>
        ))}
        {[
          { x: 20, y: 130, name: 'Wide-Column', desc: 'Column families, sparse data', examples: 'Cassandra, HBase', use: 'Time-series, IoT', color: '#f472b6' },
          { x: 260, y: 130, name: 'Graph', desc: 'Nodes and relationships', examples: 'Neo4j, Neptune', use: 'Social, fraud', color: '#fb923c' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="220" height="80" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 110} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="600">{n.name}</text>
            <text x={n.x + 110} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 110} y={n.y + 52} textAnchor="middle" fill="#22d3ee" fontSize="6">{n.examples}</text>
            <text x={n.x + 110} y={n.y + 68} textAnchor="middle" fill="#71717a" fontSize="6">{n.use}</text>
          </g>
        ))}
        <text x="250" y="230" textAnchor="middle" fill="#71717a" fontSize="7">Choose based on data model and access patterns, not hype</text>
      </svg>
    ),
    starsnowflake: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Star Schema vs Snowflake Schema</text>
        <rect x="20" y="35" width="220" height="130" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="130" y="55" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">Star Schema</text>
        <rect x="90" y="70" width="80" height="30" rx="4" fill="#fb923c25" stroke="#fb923c" />
        <text x="130" y="90" textAnchor="middle" fill="#fb923c" fontSize="7">Fact Table</text>
        {['Date', 'Product', 'Store', 'Customer'].map((d, i) => (
          <g key={i}>
            <rect x={40 + (i % 2) * 90} y={110 + Math.floor(i / 2) * 35} width="60" height="20" rx="3" fill="#60a5fa20" stroke="#60a5fa" />
            <text x={70 + (i % 2) * 90} y={123 + Math.floor(i / 2) * 35} textAnchor="middle" fill="#60a5fa" fontSize="6">{d}</text>
          </g>
        ))}
        <rect x="260" y="35" width="220" height="130" rx="6" fill="#f472b615" stroke="#f472b6" strokeWidth="1.5" />
        <text x="370" y="55" textAnchor="middle" fill="#f472b6" fontSize="10" fontWeight="600">Snowflake Schema</text>
        <text x="370" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Normalized dimensions</text>
        <text x="370" y="92" textAnchor="middle" fill="#a1a1aa" fontSize="7">More joins, less redundancy</text>
        <text x="370" y="110" textAnchor="middle" fill="#71717a" fontSize="6">Product → Category → Department</text>
        <text x="370" y="127" textAnchor="middle" fill="#71717a" fontSize="6">Date → Month → Quarter → Year</text>
        <text x="370" y="150" textAnchor="middle" fill="#22d3ee" fontSize="6">Use: Complex hierarchies</text>
        <rect x="20" y="180" width="460" height="45" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="200" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Star: Faster queries, more storage | Snowflake: Less storage, more joins</text>
        <text x="250" y="218" textAnchor="middle" fill="#71717a" fontSize="7">Used by: Snowflake, BigQuery, Redshift for OLAP workloads</text>
      </svg>
    ),
    dbdesign: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Database Design Cheatsheet</text>
        {[
          { x: 20, y: 35, name: '1NF', desc: 'Atomic values, no repeating groups', color: '#4ade80' },
          { x: 180, y: 35, name: '2NF', desc: 'No partial dependencies', color: '#60a5fa' },
          { x: 340, y: 35, name: '3NF', desc: 'No transitive dependencies', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 20} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
          </g>
        ))}
        {[
          { x: 20, y: 100, name: 'Primary Key', desc: 'Unique row identifier', example: 'id SERIAL PRIMARY KEY', color: '#fb923c' },
          { x: 180, y: 100, name: 'Foreign Key', desc: 'Reference to another table', example: 'user_id REFERENCES users(id)', color: '#a78bfa' },
          { x: 340, y: 100, name: 'Indexes', desc: 'Speed up lookups', example: 'CREATE INDEX ON users(email)', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="65" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 52} textAnchor="middle" fill="#71717a" fontSize="5">{n.example}</text>
          </g>
        ))}
        <rect x="20" y="180" width="460" height="65" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="200" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Common Constraints</text>
        <text x="250" y="218" textAnchor="middle" fill="#71717a" fontSize="7">NOT NULL | UNIQUE | CHECK | DEFAULT | ON DELETE CASCADE</text>
        <text x="250" y="235" textAnchor="middle" fill="#71717a" fontSize="6">Normalize for OLTP, denormalize for OLAP. Measure before optimizing.</text>
      </svg>
    ),
    // Phase 3: Developer Resources
    engblogs: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Top Engineering Blogs - Learn from the Best</text>
        {[
          { x: 20, y: 35, name: 'Netflix Tech', desc: 'Streaming, resilience', color: '#e50914', url: 'netflixtechblog.com' },
          { x: 180, y: 35, name: 'Uber Eng', desc: 'Real-time, scale', color: '#000000', url: 'eng.uber.com' },
          { x: 340, y: 35, name: 'Cloudflare', desc: 'Edge, security', color: '#f38020', url: 'blog.cloudflare.com' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="55" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 48} textAnchor="middle" fill="#71717a" fontSize="5">{n.url}</text>
          </g>
        ))}
        {[
          { x: 20, y: 105, name: 'Meta Eng', desc: 'Scale, infra', color: '#1877f2', url: 'engineering.fb.com' },
          { x: 180, y: 105, name: 'LinkedIn Eng', desc: 'Data, ML', color: '#0077b5', url: 'engineering.linkedin.com' },
          { x: 340, y: 105, name: 'Stripe Eng', desc: 'Payments, API', color: '#635bff', url: 'stripe.com/blog/engineering' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="55" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 48} textAnchor="middle" fill="#71717a" fontSize="5">{n.url}</text>
          </g>
        ))}
        <rect x="20" y="175" width="460" height="70" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="195" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">More: AWS Architecture Blog, Google Cloud Blog, Discord Eng, Slack Eng</text>
        <text x="250" y="215" textAnchor="middle" fill="#71717a" fontSize="7">Learn architecture decisions, scaling challenges, and post-mortems from real systems</text>
        <text x="250" y="232" textAnchor="middle" fill="#22d3ee" fontSize="6">Pro tip: Subscribe to their newsletters and RSS feeds</text>
      </svg>
    ),
    devbooks: (
      <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Essential Books for Software Developers</text>
        {[
          { x: 20, y: 35, name: 'Clean Code', author: 'Robert Martin', topic: 'Code quality', color: '#4ade80' },
          { x: 180, y: 35, name: 'DDIA', author: 'Kleppmann', topic: 'Distributed sys', color: '#60a5fa' },
          { x: 340, y: 35, name: 'Pragmatic Prog', author: 'Hunt & Thomas', topic: 'Best practices', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.author}</text>
            <text x={n.x + 70} y={n.y + 50} textAnchor="middle" fill="#71717a" fontSize="6">{n.topic}</text>
          </g>
        ))}
        {[
          { x: 20, y: 110, name: 'System Design', author: 'Alex Xu', topic: 'Interview prep', color: '#fb923c' },
          { x: 180, y: 110, name: 'Clean Arch', author: 'Robert Martin', topic: 'Architecture', color: '#a78bfa' },
          { x: 340, y: 110, name: 'Refactoring', author: 'Martin Fowler', topic: 'Code evolution', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.author}</text>
            <text x={n.x + 70} y={n.y + 50} textAnchor="middle" fill="#71717a" fontSize="6">{n.topic}</text>
          </g>
        ))}
        <rect x="20" y="185" width="460" height="80" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="205" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Reading Path</text>
        <text x="250" y="225" textAnchor="middle" fill="#71717a" fontSize="7">Junior: Clean Code → Pragmatic → Refactoring</text>
        <text x="250" y="242" textAnchor="middle" fill="#71717a" fontSize="7">Senior: DDIA → Clean Arch → Domain-Driven Design</text>
        <text x="250" y="257" textAnchor="middle" fill="#22d3ee" fontSize="6">One chapter per week = 52 chapters/year of learning</text>
      </svg>
    ),
    cspapers: (
      <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Transformative Computer Science Papers</text>
        {[
          { x: 20, y: 35, name: 'Dynamo', year: '2007', company: 'Amazon', impact: 'DynamoDB, Cassandra', color: '#ff9900' },
          { x: 180, y: 35, name: 'GFS', year: '2003', company: 'Google', impact: 'HDFS, distributed FS', color: '#4285f4' },
          { x: 340, y: 35, name: 'MapReduce', year: '2004', company: 'Google', impact: 'Hadoop, Spark', color: '#34a853' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 15} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name} ({n.year})</text>
            <text x={n.x + 70} y={n.y + 32} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.company}</text>
            <text x={n.x + 70} y={n.y + 48} textAnchor="middle" fill="#71717a" fontSize="6">{n.impact}</text>
          </g>
        ))}
        {[
          { x: 20, y: 110, name: 'Raft', year: '2014', company: 'Stanford', impact: 'etcd, Consul', color: '#f472b6' },
          { x: 180, y: 110, name: 'Kafka', year: '2011', company: 'LinkedIn', impact: 'Event streaming', color: '#22d3ee' },
          { x: 340, y: 110, name: 'Spanner', year: '2012', company: 'Google', impact: 'Global SQL DB', color: '#fbbc04' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 15} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name} ({n.year})</text>
            <text x={n.x + 70} y={n.y + 32} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.company}</text>
            <text x={n.x + 70} y={n.y + 48} textAnchor="middle" fill="#71717a" fontSize="6">{n.impact}</text>
          </g>
        ))}
        <rect x="20" y="185" width="460" height="80" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="205" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">More Essential Papers</text>
        <text x="250" y="225" textAnchor="middle" fill="#71717a" fontSize="7">BigTable, Cassandra, Paxos, Borg, Chubby, Bigtable, TAO</text>
        <text x="250" y="242" textAnchor="middle" fill="#71717a" fontSize="7">papers.lovereading.art or paperswelove.org</text>
        <text x="250" y="257" textAnchor="middle" fill="#22d3ee" fontSize="6">Read one paper per month to deeply understand distributed systems</text>
      </svg>
    ),
    opensource: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Popular Open Source Projects by Big Tech</text>
        {[
          { x: 20, y: 35, name: 'React', company: 'Meta', stars: '220k+', color: '#61dafb' },
          { x: 120, y: 35, name: 'Kubernetes', company: 'Google', stars: '105k+', color: '#326ce5' },
          { x: 220, y: 35, name: 'VS Code', company: 'Microsoft', stars: '155k+', color: '#007acc' },
          { x: 320, y: 35, name: 'TensorFlow', company: 'Google', stars: '180k+', color: '#ff6f00' },
          { x: 420, y: 35, name: 'TypeScript', company: 'Microsoft', stars: '95k+', color: '#3178c6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="80" height="55" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 40} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 40} y={n.y + 32} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.company}</text>
            <text x={n.x + 40} y={n.y + 45} textAnchor="middle" fill="#71717a" fontSize="6">⭐ {n.stars}</text>
          </g>
        ))}
        {[
          { x: 20, y: 105, name: 'PyTorch', company: 'Meta', stars: '75k+', color: '#ee4c2c' },
          { x: 120, y: 105, name: 'Kafka', company: 'LinkedIn', stars: '27k+', color: '#231f20' },
          { x: 220, y: 105, name: 'GraphQL', company: 'Meta', stars: '14k+', color: '#e535ab' },
          { x: 320, y: 105, name: 'Flutter', company: 'Google', stars: '160k+', color: '#02569b' },
          { x: 420, y: 105, name: 'Go', company: 'Google', stars: '118k+', color: '#00add8' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="80" height="55" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 40} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 40} y={n.y + 32} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.company}</text>
            <text x={n.x + 40} y={n.y + 45} textAnchor="middle" fill="#71717a" fontSize="6">⭐ {n.stars}</text>
          </g>
        ))}
        <rect x="20" y="175" width="460" height="70" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="195" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Why Companies Open Source</text>
        <text x="250" y="215" textAnchor="middle" fill="#71717a" fontSize="7">Talent recruitment | Community contributions | Industry standards | Developer ecosystem</text>
        <text x="250" y="232" textAnchor="middle" fill="#22d3ee" fontSize="6">Contributing to OSS is great for learning and career growth</text>
      </svg>
    ),
    softskills: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Soft Skills Books for Developers</text>
        {[
          { x: 20, y: 35, name: 'Soft Skills', author: 'Sonmez', skill: 'Career growth', color: '#4ade80' },
          { x: 180, y: 35, name: 'Staff Engineer', author: 'Larson', skill: 'IC leadership', color: '#60a5fa' },
          { x: 340, y: 35, name: 'Crucial Convos', author: 'Various', skill: 'Communication', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="55" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.author}</text>
            <text x={n.x + 70} y={n.y + 48} textAnchor="middle" fill="#71717a" fontSize="6">{n.skill}</text>
          </g>
        ))}
        {[
          { x: 20, y: 105, name: 'Never Split Diff', author: 'Voss', skill: 'Negotiation', color: '#fb923c' },
          { x: 180, y: 105, name: 'Manager Path', author: 'Fournier', skill: 'Management', color: '#a78bfa' },
          { x: 340, y: 105, name: 'Thinking Fast', author: 'Kahneman', skill: 'Decision making', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="55" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.author}</text>
            <text x={n.x + 70} y={n.y + 48} textAnchor="middle" fill="#71717a" fontSize="6">{n.skill}</text>
          </g>
        ))}
        <rect x="20" y="175" width="460" height="50" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="195" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">80% of career success comes from soft skills, not just technical ability</text>
        <text x="250" y="215" textAnchor="middle" fill="#71717a" fontSize="7">Communication, leadership, and influence matter more at senior levels</text>
      </svg>
    ),
    diagramtools: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Diagrams as Code Tools</text>
        {[
          { x: 20, y: 35, name: 'Mermaid', lang: 'Markdown', use: 'GitHub, Docs', color: '#ff3670' },
          { x: 180, y: 35, name: 'PlantUML', lang: 'Custom DSL', use: 'UML diagrams', color: '#8bc34a' },
          { x: 340, y: 35, name: 'Diagrams.py', lang: 'Python', use: 'Cloud arch', color: '#3776ab' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="55" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.lang}</text>
            <text x={n.x + 70} y={n.y + 48} textAnchor="middle" fill="#71717a" fontSize="6">{n.use}</text>
          </g>
        ))}
        <rect x="20" y="105" width="225" height="60" rx="6" fill="#22d3ee15" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="132" y="125" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="600">Benefits</text>
        <text x="132" y="145" textAnchor="middle" fill="#a1a1aa" fontSize="7">Version control friendly</text>
        <text x="132" y="158" textAnchor="middle" fill="#71717a" fontSize="6">Auto-generate from code</text>
        <rect x="255" y="105" width="225" height="60" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="367" y="125" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">Comparison</text>
        <text x="367" y="145" textAnchor="middle" fill="#a1a1aa" fontSize="7">Mermaid: Simple, GitHub native</text>
        <text x="367" y="158" textAnchor="middle" fill="#71717a" fontSize="6">D2: Modern, better layouts</text>
        <rect x="20" y="180" width="460" height="45" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="200" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">More tools: D2, Structurizr, Graphviz, Excalidraw, tldraw</text>
        <text x="250" y="218" textAnchor="middle" fill="#71717a" fontSize="7">Keep diagrams in sync with code by generating from source</text>
      </svg>
    ),
    codingprinciples: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Essential Coding Principles</text>
        {[
          { x: 20, y: 35, name: 'DRY', full: "Don't Repeat Yourself", desc: 'Extract duplication', color: '#4ade80' },
          { x: 180, y: 35, name: 'KISS', full: 'Keep It Simple', desc: 'Simple over clever', color: '#60a5fa' },
          { x: 340, y: 35, name: 'YAGNI', full: "You Ain't Gonna Need It", desc: 'Build when needed', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.full}</text>
            <text x={n.x + 70} y={n.y + 50} textAnchor="middle" fill="#71717a" fontSize="6">{n.desc}</text>
          </g>
        ))}
        {[
          { x: 20, y: 110, name: 'SoC', full: 'Separation of Concerns', desc: 'One responsibility', color: '#fb923c' },
          { x: 180, y: 110, name: 'LoD', full: 'Law of Demeter', desc: 'Talk to friends only', color: '#a78bfa' },
          { x: 340, y: 110, name: 'CoC', full: 'Convention over Config', desc: 'Sensible defaults', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.full}</text>
            <text x={n.x + 70} y={n.y + 50} textAnchor="middle" fill="#71717a" fontSize="6">{n.desc}</text>
          </g>
        ))}
        <rect x="20" y="185" width="460" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="205" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Balance is Key</text>
        <text x="250" y="223" textAnchor="middle" fill="#71717a" fontSize="7">DRY too much = wrong abstraction | YAGNI too much = tech debt</text>
        <text x="250" y="238" textAnchor="middle" fill="#22d3ee" fontSize="6">Apply principles thoughtfully, not dogmatically</text>
      </svg>
    ),
    fullstackroad: (
      <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Full-Stack Developer Roadmap</text>
        {[
          { x: 20, y: 35, name: 'Frontend', items: 'HTML, CSS, JS, React/Vue', color: '#4ade80' },
          { x: 180, y: 35, name: 'Backend', items: 'Node/Python, APIs, Auth', color: '#60a5fa' },
          { x: 340, y: 35, name: 'Database', items: 'SQL, NoSQL, ORMs', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.items}</text>
          </g>
        ))}
        <path d="M160 60 L175 60" stroke="#3f3f46" strokeWidth="2" />
        <path d="M320 60 L335 60" stroke="#3f3f46" strokeWidth="2" />
        {[
          { x: 20, y: 100, name: 'DevOps', items: 'Docker, CI/CD, Cloud', color: '#fb923c' },
          { x: 180, y: 100, name: 'Testing', items: 'Unit, Integration, E2E', color: '#a78bfa' },
          { x: 340, y: 100, name: 'Security', items: 'OWASP, Auth, HTTPS', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.items}</text>
          </g>
        ))}
        <rect x="20" y="165" width="460" height="100" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="185" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Learning Path (12-18 months)</text>
        <text x="250" y="205" textAnchor="middle" fill="#71717a" fontSize="7">1-3mo: HTML/CSS/JS basics → 3-6mo: React + Node</text>
        <text x="250" y="222" textAnchor="middle" fill="#71717a" fontSize="7">6-9mo: Databases + Auth → 9-12mo: DevOps + Projects</text>
        <text x="250" y="239" textAnchor="middle" fill="#71717a" fontSize="7">12-18mo: Advanced topics + Real projects</text>
        <text x="250" y="256" textAnchor="middle" fill="#22d3ee" fontSize="6">roadmap.sh/full-stack - Follow the interactive roadmap</text>
      </svg>
    ),
    architectroad: (
      <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Software Architect Knowledge Map</text>
        {[
          { x: 20, y: 35, name: 'Design Patterns', items: 'GoF, Enterprise, Cloud', color: '#4ade80' },
          { x: 180, y: 35, name: 'Architecture Styles', items: 'Micro, Event, Serverless', color: '#60a5fa' },
          { x: 340, y: 35, name: 'System Design', items: 'Scalability, Reliability', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.items}</text>
          </g>
        ))}
        {[
          { x: 20, y: 100, name: 'Data Architecture', items: 'OLTP, OLAP, Lakes', color: '#fb923c' },
          { x: 180, y: 100, name: 'Security', items: 'Zero Trust, IAM, Crypto', color: '#a78bfa' },
          { x: 340, y: 100, name: 'Leadership', items: 'ADRs, RFCs, Mentoring', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.items}</text>
          </g>
        ))}
        <rect x="20" y="165" width="460" height="100" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="185" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Developer → Architect Path</text>
        <text x="250" y="205" textAnchor="middle" fill="#71717a" fontSize="7">Senior Dev (5+ yrs) → Staff/Principal → Architect</text>
        <text x="250" y="222" textAnchor="middle" fill="#71717a" fontSize="7">Key skills: Trade-off analysis, cross-team influence, long-term thinking</text>
        <text x="250" y="239" textAnchor="middle" fill="#71717a" fontSize="7">Read: Clean Architecture, DDIA, Fundamentals of Software Arch</text>
        <text x="250" y="256" textAnchor="middle" fill="#22d3ee" fontSize="6">Architects write code less but make decisions with 10x impact</text>
      </svg>
    ),
    securityroad: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Cybersecurity Learning Roadmap</text>
        {[
          { x: 20, y: 35, name: 'Fundamentals', items: 'Networks, OS, Crypto', color: '#4ade80' },
          { x: 180, y: 35, name: 'Web Security', items: 'OWASP Top 10, XSS, SQLI', color: '#60a5fa' },
          { x: 340, y: 35, name: 'Offensive', items: 'Pentesting, Bug bounty', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.items}</text>
          </g>
        ))}
        {[
          { x: 20, y: 100, name: 'Defensive', items: 'SIEM, SOC, IR', color: '#fb923c' },
          { x: 180, y: 100, name: 'Cloud Security', items: 'AWS/GCP/Azure sec', color: '#a78bfa' },
          { x: 340, y: 100, name: 'Certs', items: 'OSCP, CEH, CISSP', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.items}</text>
          </g>
        ))}
        <rect x="20" y="165" width="460" height="80" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="185" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Practice Platforms</text>
        <text x="250" y="205" textAnchor="middle" fill="#71717a" fontSize="7">HackTheBox, TryHackMe, PortSwigger Web Security Academy</text>
        <text x="250" y="222" textAnchor="middle" fill="#71717a" fontSize="7">Bug Bounty: HackerOne, Bugcrowd, Synack</text>
        <text x="250" y="238" textAnchor="middle" fill="#22d3ee" fontSize="6">Security skills are in high demand - average salary $120k+</text>
      </svg>
    ),
    backendroad: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Backend Developer Roadmap</text>
        {[
          { x: 20, y: 35, name: 'Languages', items: 'Python, Go, Java, Node', color: '#4ade80' },
          { x: 180, y: 35, name: 'Databases', items: 'PostgreSQL, Redis, Mongo', color: '#60a5fa' },
          { x: 340, y: 35, name: 'APIs', items: 'REST, GraphQL, gRPC', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.items}</text>
          </g>
        ))}
        {[
          { x: 20, y: 100, name: 'Caching', items: 'Redis, Memcached, CDN', color: '#fb923c' },
          { x: 180, y: 100, name: 'Message Queues', items: 'Kafka, RabbitMQ, SQS', color: '#a78bfa' },
          { x: 340, y: 100, name: 'Containers', items: 'Docker, Kubernetes', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.items}</text>
          </g>
        ))}
        <rect x="20" y="165" width="460" height="80" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="185" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Senior Backend Skills</text>
        <text x="250" y="205" textAnchor="middle" fill="#71717a" fontSize="7">System design, distributed systems, performance optimization</text>
        <text x="250" y="222" textAnchor="middle" fill="#71717a" fontSize="7">Monitoring: Prometheus, Grafana, ELK Stack</text>
        <text x="250" y="238" textAnchor="middle" fill="#22d3ee" fontSize="6">roadmap.sh/backend - Complete interactive roadmap</text>
      </svg>
    ),
    devopsroad: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">DevOps Engineer Roadmap</text>
        {[
          { x: 20, y: 35, name: 'OS & Linux', items: 'Shell, processes, networking', color: '#4ade80' },
          { x: 180, y: 35, name: 'Containers', items: 'Docker, Kubernetes, Helm', color: '#60a5fa' },
          { x: 340, y: 35, name: 'CI/CD', items: 'Jenkins, GitHub Actions', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.items}</text>
          </g>
        ))}
        {[
          { x: 20, y: 100, name: 'IaC', items: 'Terraform, Ansible, Pulumi', color: '#fb923c' },
          { x: 180, y: 100, name: 'Cloud', items: 'AWS, GCP, Azure', color: '#a78bfa' },
          { x: 340, y: 100, name: 'Monitoring', items: 'Prometheus, Grafana, PD', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.items}</text>
          </g>
        ))}
        <rect x="20" y="165" width="460" height="80" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="185" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">DevOps Culture</text>
        <text x="250" y="205" textAnchor="middle" fill="#71717a" fontSize="7">Automate everything | Continuous improvement | Blameless postmortems</text>
        <text x="250" y="222" textAnchor="middle" fill="#71717a" fontSize="7">SRE overlap: SLOs, SLIs, Error budgets, On-call</text>
        <text x="250" y="238" textAnchor="middle" fill="#22d3ee" fontSize="6">roadmap.sh/devops - Detailed path with resources</text>
      </svg>
    ),
    umlclass: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">UML Class Diagram Notation</text>
        <rect x="20" y="30" width="140" height="90" rx="4" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <rect x="20" y="30" width="140" height="22" rx="4" fill="#4ade8030" />
        <text x="90" y="46" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">ClassName</text>
        <line x1="20" y1="52" x2="160" y2="52" stroke="#4ade80" strokeWidth="0.5" />
        <text x="30" y="68" fill="#a1a1aa" fontSize="7">- privateAttr: Type</text>
        <text x="30" y="82" fill="#a1a1aa" fontSize="7">+ publicAttr: Type</text>
        <line x1="20" y1="90" x2="160" y2="90" stroke="#4ade80" strokeWidth="0.5" />
        <text x="30" y="105" fill="#a1a1aa" fontSize="7">+ publicMethod()</text>
        <text x="30" y="118" fill="#a1a1aa" fontSize="7"># protectedMethod()</text>
        <rect x="180" y="30" width="140" height="90" rx="4" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="250" y="50" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">Relationships</text>
        <text x="190" y="70" fill="#a1a1aa" fontSize="7">─── Association</text>
        <text x="190" y="85" fill="#a1a1aa" fontSize="7">──▷ Inheritance</text>
        <text x="190" y="100" fill="#a1a1aa" fontSize="7">◇── Aggregation</text>
        <text x="190" y="115" fill="#a1a1aa" fontSize="7">◆── Composition</text>
        <rect x="340" y="30" width="140" height="90" rx="4" fill="#f472b615" stroke="#f472b6" strokeWidth="1.5" />
        <text x="410" y="50" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="600">Multiplicity</text>
        <text x="350" y="70" fill="#a1a1aa" fontSize="7">1 - exactly one</text>
        <text x="350" y="85" fill="#a1a1aa" fontSize="7">0..1 - zero or one</text>
        <text x="350" y="100" fill="#a1a1aa" fontSize="7">* - zero or more</text>
        <text x="350" y="115" fill="#a1a1aa" fontSize="7">1..* - one or more</text>
        <rect x="20" y="135" width="460" height="110" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="155" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Quick Reference</text>
        <text x="250" y="175" textAnchor="middle" fill="#71717a" fontSize="7">Visibility: + public, - private, # protected, ~ package</text>
        <text x="250" y="192" textAnchor="middle" fill="#71717a" fontSize="7">Composition = strong ownership (child dies with parent)</text>
        <text x="250" y="209" textAnchor="middle" fill="#71717a" fontSize="7">Aggregation = weak ownership (child can exist independently)</text>
        <text x="250" y="226" textAnchor="middle" fill="#71717a" fontSize="7">Abstract classes: italics | Interfaces: &lt;&lt;interface&gt;&gt;</text>
        <text x="250" y="240" textAnchor="middle" fill="#22d3ee" fontSize="6">Tools: PlantUML, Mermaid, draw.io, Lucidchart</text>
      </svg>
    ),
    paradigms: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Programming Paradigms Comparison</text>
        {[
          { x: 20, y: 35, name: 'OOP', desc: 'Objects with state + behavior', langs: 'Java, C++, Python', color: '#4ade80' },
          { x: 180, y: 35, name: 'Functional', desc: 'Pure functions, immutability', langs: 'Haskell, Elixir, Scala', color: '#60a5fa' },
          { x: 340, y: 35, name: 'Procedural', desc: 'Sequential instructions', langs: 'C, Go, Pascal', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="65" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.desc}</text>
            <text x={n.x + 70} y={n.y + 52} textAnchor="middle" fill="#71717a" fontSize="6">{n.langs}</text>
          </g>
        ))}
        <rect x="20" y="115" width="225" height="60" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="132" y="135" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">OOP Pros</text>
        <text x="132" y="152" textAnchor="middle" fill="#a1a1aa" fontSize="7">Encapsulation, reusability, modeling</text>
        <text x="132" y="168" textAnchor="middle" fill="#71717a" fontSize="6">Good for: Large apps, domain modeling</text>
        <rect x="255" y="115" width="225" height="60" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="367" y="135" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">FP Pros</text>
        <text x="367" y="152" textAnchor="middle" fill="#a1a1aa" fontSize="7">Testability, concurrency, predictability</text>
        <text x="367" y="168" textAnchor="middle" fill="#71717a" fontSize="6">Good for: Data pipelines, concurrent</text>
        <rect x="20" y="190" width="460" height="55" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="210" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Modern Languages: Multi-Paradigm</text>
        <text x="250" y="228" textAnchor="middle" fill="#71717a" fontSize="7">JavaScript, Python, Kotlin, Rust support OOP + FP + Procedural</text>
        <text x="250" y="242" textAnchor="middle" fill="#22d3ee" fontSize="6">Choose paradigm based on problem, not dogma</text>
      </svg>
    ),
    garbagecollection: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Garbage Collection Comparison</text>
        {[
          { x: 20, y: 35, name: 'Java GC', type: 'Generational', pause: 'Can be long', color: '#f89820' },
          { x: 180, y: 35, name: 'Go GC', type: 'Concurrent', pause: 'Sub-ms', color: '#00add8' },
          { x: 340, y: 35, name: 'Python GC', type: 'Ref counting', pause: 'Rare', color: '#3776ab' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="55" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.type}</text>
            <text x={n.x + 70} y={n.y + 48} textAnchor="middle" fill="#71717a" fontSize="6">Pause: {n.pause}</text>
          </g>
        ))}
        <rect x="20" y="105" width="225" height="65" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="132" y="125" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">GC Algorithms</text>
        <text x="132" y="142" textAnchor="middle" fill="#a1a1aa" fontSize="7">Mark-Sweep: Find live, remove dead</text>
        <text x="132" y="157" textAnchor="middle" fill="#a1a1aa" fontSize="7">Copying: Move live to new space</text>
        <text x="132" y="172" textAnchor="middle" fill="#71717a" fontSize="6">Generational: Young/Old segregation</text>
        <rect x="255" y="105" width="225" height="65" rx="6" fill="#f472b615" stroke="#f472b6" strokeWidth="1.5" />
        <text x="367" y="125" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="600">Rust: No GC</text>
        <text x="367" y="142" textAnchor="middle" fill="#a1a1aa" fontSize="7">Ownership + Borrowing</text>
        <text x="367" y="157" textAnchor="middle" fill="#a1a1aa" fontSize="7">Compile-time memory safety</text>
        <text x="367" y="172" textAnchor="middle" fill="#71717a" fontSize="6">Zero runtime overhead</text>
        <rect x="20" y="185" width="460" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="205" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">GC Tuning Tips</text>
        <text x="250" y="223" textAnchor="middle" fill="#71717a" fontSize="7">Java: -Xmx, G1GC for low latency | Go: GOGC env var</text>
        <text x="250" y="238" textAnchor="middle" fill="#22d3ee" fontSize="6">Monitor GC pauses in production - they impact p99 latency</text>
      </svg>
    ),
    concurrencyparallel: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Concurrency vs Parallelism</text>
        <rect x="20" y="35" width="225" height="80" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="132" y="55" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">Concurrency</text>
        <text x="132" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Dealing with multiple things at once</text>
        <text x="132" y="92" textAnchor="middle" fill="#a1a1aa" fontSize="7">Structure/Design concept</text>
        <text x="132" y="107" textAnchor="middle" fill="#71717a" fontSize="6">Single core can be concurrent</text>
        <rect x="255" y="35" width="225" height="80" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="367" y="55" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">Parallelism</text>
        <text x="367" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Doing multiple things at once</text>
        <text x="367" y="92" textAnchor="middle" fill="#a1a1aa" fontSize="7">Execution concept</text>
        <text x="367" y="107" textAnchor="middle" fill="#71717a" fontSize="6">Requires multiple cores</text>
        <rect x="20" y="130" width="225" height="55" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="132" y="150" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">I/O-Bound Tasks</text>
        <text x="132" y="167" textAnchor="middle" fill="#a1a1aa" fontSize="7">Network, disk, DB calls</text>
        <text x="132" y="180" textAnchor="middle" fill="#71717a" fontSize="6">Use: async/await, threads</text>
        <rect x="255" y="130" width="225" height="55" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="367" y="150" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">CPU-Bound Tasks</text>
        <text x="367" y="167" textAnchor="middle" fill="#a1a1aa" fontSize="7">Computation, processing</text>
        <text x="367" y="180" textAnchor="middle" fill="#71717a" fontSize="6">Use: multiprocessing, workers</text>
        <rect x="20" y="200" width="460" height="45" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="218" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Rob Pike: Concurrency is about structure, parallelism is about execution</text>
        <text x="250" y="235" textAnchor="middle" fill="#22d3ee" fontSize="6">Python GIL limits parallelism but not concurrency (use multiprocessing)</text>
      </svg>
    ),
    eventloop: (
      <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">JavaScript Event Loop</text>
        <rect x="20" y="35" width="140" height="70" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="90" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Call Stack</text>
        <text x="90" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">LIFO execution</text>
        <text x="90" y="92" textAnchor="middle" fill="#71717a" fontSize="6">One thing at a time</text>
        <rect x="180" y="35" width="140" height="70" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="250" y="55" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">Microtask Queue</text>
        <text x="250" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Promises, queueMicrotask</text>
        <text x="250" y="92" textAnchor="middle" fill="#71717a" fontSize="6">Higher priority</text>
        <rect x="340" y="35" width="140" height="70" rx="6" fill="#f472b615" stroke="#f472b6" strokeWidth="1.5" />
        <text x="410" y="55" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="600">Macrotask Queue</text>
        <text x="410" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">setTimeout, setInterval</text>
        <text x="410" y="92" textAnchor="middle" fill="#71717a" fontSize="6">Lower priority</text>
        <path d="M90 110 L90 130 L250 130 L250 110" stroke="#3f3f46" strokeWidth="2" fill="none" />
        <path d="M250 110 L250 130 L410 130 L410 110" stroke="#3f3f46" strokeWidth="2" fill="none" />
        <rect x="180" y="120" width="140" height="40" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="250" y="145" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">Event Loop</text>
        <rect x="20" y="175" width="460" height="90" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="195" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Execution Order</text>
        <text x="250" y="215" textAnchor="middle" fill="#71717a" fontSize="7">1. Execute all sync code (call stack)</text>
        <text x="250" y="232" textAnchor="middle" fill="#71717a" fontSize="7">2. Execute ALL microtasks (Promise.then, queueMicrotask)</text>
        <text x="250" y="249" textAnchor="middle" fill="#71717a" fontSize="7">3. Execute ONE macrotask (setTimeout callback) → Repeat from 2</text>
        <text x="250" y="262" textAnchor="middle" fill="#22d3ee" fontSize="6">Microtasks always run before next macrotask - can starve macrotasks!</text>
      </svg>
    ),
    cppusecases: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">C++ Use Cases - Where Performance Matters</text>
        {[
          { x: 20, y: 35, name: 'Game Engines', examples: 'Unreal, Unity core', reason: 'Low latency, GPU', color: '#4ade80' },
          { x: 180, y: 35, name: 'Embedded', examples: 'IoT, automotive', reason: 'Memory control', color: '#60a5fa' },
          { x: 340, y: 35, name: 'OS/Drivers', examples: 'Windows, Linux', reason: 'Hardware access', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.examples}</text>
            <text x={n.x + 70} y={n.y + 50} textAnchor="middle" fill="#71717a" fontSize="6">{n.reason}</text>
          </g>
        ))}
        {[
          { x: 20, y: 110, name: 'Databases', examples: 'MySQL, Mongo, Redis', reason: 'Query perf', color: '#fb923c' },
          { x: 180, y: 110, name: 'HFT/Trading', examples: 'Exchanges, algos', reason: 'Microseconds', color: '#a78bfa' },
          { x: 340, y: 110, name: 'Browsers', examples: 'Chrome, Firefox', reason: 'JS engines', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.examples}</text>
            <text x={n.x + 70} y={n.y + 50} textAnchor="middle" fill="#71717a" fontSize="6">{n.reason}</text>
          </g>
        ))}
        <rect x="20" y="185" width="460" height="40" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="203" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Modern C++: Use C++17/20, smart pointers, RAII for safety</text>
        <text x="250" y="218" textAnchor="middle" fill="#22d3ee" fontSize="6">Consider Rust for new projects needing similar performance with better safety</text>
      </svg>
    ),
    cssfundamentals: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">CSS Fundamentals Cheatsheet</text>
        {[
          { x: 20, y: 35, name: 'Selectors', items: '.class #id tag [attr]', color: '#4ade80' },
          { x: 180, y: 35, name: 'Flexbox', items: 'display: flex; gap', color: '#60a5fa' },
          { x: 340, y: 35, name: 'Grid', items: 'grid-template-columns', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.items}</text>
          </g>
        ))}
        {[
          { x: 20, y: 100, name: 'Box Model', items: 'margin, border, padding', color: '#fb923c' },
          { x: 180, y: 100, name: 'Positioning', items: 'static, relative, absolute', color: '#a78bfa' },
          { x: 340, y: 100, name: 'Animations', items: '@keyframes, transition', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.items}</text>
          </g>
        ))}
        <rect x="20" y="165" width="460" height="80" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="185" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Modern CSS</text>
        <text x="250" y="205" textAnchor="middle" fill="#71717a" fontSize="7">CSS Variables: --color: #fff; color: var(--color)</text>
        <text x="250" y="222" textAnchor="middle" fill="#71717a" fontSize="7">Container queries, :has(), subgrid, nesting (native)</text>
        <text x="250" y="238" textAnchor="middle" fill="#22d3ee" fontSize="6">Tools: Tailwind CSS, CSS Modules, styled-components</text>
      </svg>
    ),
    oopprinciples: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Four Pillars of OOP</text>
        {[
          { x: 20, y: 35, name: 'Encapsulation', desc: 'Bundle data + methods', example: 'private fields + getters', color: '#4ade80' },
          { x: 260, y: 35, name: 'Abstraction', desc: 'Hide complexity', example: 'interfaces, abstract classes', color: '#60a5fa' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="220" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 110} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="600">{n.name}</text>
            <text x={n.x + 110} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.desc}</text>
            <text x={n.x + 110} y={n.y + 50} textAnchor="middle" fill="#71717a" fontSize="6">{n.example}</text>
          </g>
        ))}
        {[
          { x: 20, y: 110, name: 'Inheritance', desc: 'Reuse via parent classes', example: 'class Dog extends Animal', color: '#f472b6' },
          { x: 260, y: 110, name: 'Polymorphism', desc: 'Same interface, diff behavior', example: 'method overriding', color: '#fb923c' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="220" height="60" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 110} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="600">{n.name}</text>
            <text x={n.x + 110} y={n.y + 35} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.desc}</text>
            <text x={n.x + 110} y={n.y + 50} textAnchor="middle" fill="#71717a" fontSize="6">{n.example}</text>
          </g>
        ))}
        <rect x="20" y="185" width="460" height="60" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="205" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Modern OOP Best Practices</text>
        <text x="250" y="223" textAnchor="middle" fill="#71717a" fontSize="7">Favor composition over inheritance | Program to interfaces | SOLID principles</text>
        <text x="250" y="238" textAnchor="middle" fill="#22d3ee" fontSize="6">Pure OOP languages: Java, C# | Multi-paradigm: Python, TypeScript, Kotlin</text>
      </svg>
    ),
    nginxpopular: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Why Nginx is Popular - Event-Driven Architecture</text>
        <rect x="20" y="35" width="225" height="80" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="132" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Apache (Process/Thread)</text>
        <text x="132" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">1 process/thread per connection</text>
        <text x="132" y="92" textAnchor="middle" fill="#a1a1aa" fontSize="7">Memory: ~2-10 MB per conn</text>
        <text x="132" y="107" textAnchor="middle" fill="#71717a" fontSize="6">Limited concurrent connections</text>
        <rect x="255" y="35" width="225" height="80" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="367" y="55" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">Nginx (Event-Driven)</text>
        <text x="367" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Async, non-blocking I/O</text>
        <text x="367" y="92" textAnchor="middle" fill="#a1a1aa" fontSize="7">Memory: ~2.5 KB per conn</text>
        <text x="367" y="107" textAnchor="middle" fill="#71717a" fontSize="6">Handles 10K+ connections easily</text>
        <rect x="20" y="130" width="460" height="55" rx="6" fill="#f472b615" stroke="#f472b6" strokeWidth="1.5" />
        <text x="250" y="150" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="600">Nginx Use Cases</text>
        <text x="250" y="170" textAnchor="middle" fill="#a1a1aa" fontSize="7">Web server | Reverse proxy | Load balancer | SSL termination | API gateway</text>
        <rect x="20" y="200" width="460" height="45" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="218" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">32%+ of all websites use Nginx (2024) - Netflix, Dropbox, WordPress.com</text>
        <text x="250" y="235" textAnchor="middle" fill="#22d3ee" fontSize="6">Alternatives: Caddy (auto HTTPS), Traefik (K8s native), HAProxy (LB focused)</text>
      </svg>
    ),
    slacknotify: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Slack Notification Decision Tree</text>
        <rect x="180" y="30" width="140" height="35" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="250" y="52" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="600">Need to communicate?</text>
        <path d="M250 65 L250 80" stroke="#3f3f46" strokeWidth="1.5" />
        <rect x="180" y="80" width="140" height="35" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="250" y="102" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="600">Urgent response needed?</text>
        <path d="M180 97 L100 97 L100 125" stroke="#4ade80" strokeWidth="1.5" />
        <text x="140" y="93" fill="#4ade80" fontSize="6">Yes</text>
        <path d="M320 97 L400 97 L400 125" stroke="#f472b6" strokeWidth="1.5" />
        <text x="360" y="93" fill="#f472b6" fontSize="6">No</text>
        <rect x="40" y="125" width="120" height="35" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="100" y="147" textAnchor="middle" fill="#fb923c" fontSize="8" fontWeight="600">Direct Message</text>
        <rect x="340" y="125" width="120" height="35" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="400" y="142" textAnchor="middle" fill="#a78bfa" fontSize="8" fontWeight="600">Channel message</text>
        <text x="400" y="155" textAnchor="middle" fill="#71717a" fontSize="6">(searchable, async)</text>
        <rect x="20" y="180" width="460" height="45" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="198" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Best Practices</text>
        <text x="250" y="215" textAnchor="middle" fill="#71717a" fontSize="7">Thread replies | @here for online | @channel sparingly | Status updates in channels</text>
      </svg>
    ),
    qrlogin: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">QR Code Login Flow (WeChat/WhatsApp Web)</text>
        {[
          { x: 20, y: 35, step: '1', name: 'Web generates QR', desc: 'Contains session ID', color: '#4ade80' },
          { x: 180, y: 35, step: '2', name: 'Phone scans QR', desc: 'App reads session ID', color: '#60a5fa' },
          { x: 340, y: 35, step: '3', name: 'Phone confirms', desc: 'User approves login', color: '#f472b6' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="55" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.step}. {n.name}</text>
            <text x={n.x + 70} y={n.y + 40} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.desc}</text>
          </g>
        ))}
        {[
          { x: 20, y: 105, step: '4', name: 'Phone sends auth', desc: 'Token to server', color: '#fb923c' },
          { x: 180, y: 105, step: '5', name: 'Server validates', desc: 'Links session to user', color: '#a78bfa' },
          { x: 340, y: 105, step: '6', name: 'Web gets access', desc: 'Long-polling/WS update', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="55" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.step}. {n.name}</text>
            <text x={n.x + 70} y={n.y + 40} textAnchor="middle" fill="#a1a1aa" fontSize="7">{n.desc}</text>
          </g>
        ))}
        <rect x="20" y="175" width="460" height="70" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="195" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Security Features</text>
        <text x="250" y="215" textAnchor="middle" fill="#71717a" fontSize="7">QR expires quickly (1-2 min) | Session bound to device | 2FA on phone</text>
        <text x="250" y="232" textAnchor="middle" fill="#22d3ee" fontSize="6">Used by: WeChat, WhatsApp, Slack, Discord, Spotify</text>
      </svg>
    ),
    pinterestgit: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Pinterest Git Optimization Case Study</text>
        <rect x="20" y="35" width="225" height="80" rx="6" fill="#f472b615" stroke="#f472b6" strokeWidth="1.5" />
        <text x="132" y="55" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="600">Problem</text>
        <text x="132" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Monorepo: 350K files, 200K commits</text>
        <text x="132" y="92" textAnchor="middle" fill="#a1a1aa" fontSize="7">git status: 45 seconds</text>
        <text x="132" y="107" textAnchor="middle" fill="#71717a" fontSize="6">Developer productivity tanked</text>
        <rect x="255" y="35" width="225" height="80" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="367" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Solution</text>
        <text x="367" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Git file system monitor (fsmonitor)</text>
        <text x="367" y="92" textAnchor="middle" fill="#a1a1aa" fontSize="7">Watchman integration</text>
        <text x="367" y="107" textAnchor="middle" fill="#71717a" fontSize="6">git status: 0.5 seconds (90x faster)</text>
        <rect x="20" y="130" width="460" height="55" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="250" y="150" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">Other Optimizations</text>
        <text x="250" y="170" textAnchor="middle" fill="#a1a1aa" fontSize="7">Sparse checkout | Partial clone | Commit graph | Multi-pack index</text>
        <rect x="20" y="200" width="460" height="45" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="218" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Microsoft, Google, Facebook also use monorepos with custom tooling</text>
        <text x="250" y="235" textAnchor="middle" fill="#22d3ee" fontSize="6">For large repos: Consider Scalar (Microsoft) or VFS for Git</text>
      </svg>
    ),
    stackoverflowarch: (
      <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Stack Overflow Architecture - Monolith at Scale</text>
        <rect x="20" y="35" width="225" height="70" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="132" y="55" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">Scale (2024)</text>
        <text x="132" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">1.3B monthly page views</text>
        <text x="132" y="92" textAnchor="middle" fill="#71717a" fontSize="6">9 web servers | 4 SQL servers</text>
        <rect x="255" y="35" width="225" height="70" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="367" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Team Size</text>
        <text x="367" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">~50 developers for SO</text>
        <text x="367" y="92" textAnchor="middle" fill="#71717a" fontSize="6">Proof: You dont need microservices</text>
        {[
          { x: 20, y: 120, name: 'HAProxy', desc: 'Load balancing', color: '#4ade80' },
          { x: 120, y: 120, name: 'IIS', desc: 'Web servers', color: '#60a5fa' },
          { x: 220, y: 120, name: 'SQL Server', desc: 'Primary DB', color: '#f472b6' },
          { x: 320, y: 120, name: 'Redis', desc: 'L1/L2 cache', color: '#fb923c' },
          { x: 420, y: 120, name: 'Elastic', desc: 'Search', color: '#a78bfa' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="80" height="45" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 40} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 40} y={n.y + 35} textAnchor="middle" fill="#71717a" fontSize="6">{n.desc}</text>
          </g>
        ))}
        <rect x="20" y="180" width="460" height="85" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="200" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Key Lessons</text>
        <text x="250" y="220" textAnchor="middle" fill="#71717a" fontSize="7">Aggressive caching (Redis multi-tier) | SQL is fast when done right</text>
        <text x="250" y="237" textAnchor="middle" fill="#71717a" fontSize="7">Performance culture | Measure everything | Simple beats complex</text>
        <text x="250" y="254" textAnchor="middle" fill="#22d3ee" fontSize="6">Read: Nick Craver Stack Overflow blog series - legendary performance posts</text>
      </svg>
    ),
    kissprinciple: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">KISS Principle - Keep It Simple, Stupid</text>
        <rect x="20" y="35" width="225" height="70" rx="6" fill="#f472b615" stroke="#f472b6" strokeWidth="1.5" />
        <text x="132" y="55" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="600">Over-Engineering</text>
        <text x="132" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Abstracting too early</text>
        <text x="132" y="92" textAnchor="middle" fill="#71717a" fontSize="6">Building for hypotheticals</text>
        <rect x="255" y="35" width="225" height="70" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="367" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">KISS Approach</text>
        <text x="367" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Simplest solution first</text>
        <text x="367" y="92" textAnchor="middle" fill="#71717a" fontSize="6">Refactor when needed</text>
        <rect x="20" y="120" width="460" height="85" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="140" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">KISS in Practice</text>
        <text x="250" y="160" textAnchor="middle" fill="#71717a" fontSize="7">Prefer readable code over clever code | Avoid premature optimization</text>
        <text x="250" y="177" textAnchor="middle" fill="#71717a" fontSize="7">Start monolith, split later | Use boring technology</text>
        <text x="250" y="194" textAnchor="middle" fill="#22d3ee" fontSize="6">Einstein: Everything should be as simple as possible, but not simpler</text>
      </svg>
    ),
    apiclients: (
      <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">API Client Tools Comparison</text>
        {[
          { x: 20, y: 35, name: 'Postman', pros: 'Full-featured, team collab', cons: 'Heavy, cloud sync', color: '#ff6c37' },
          { x: 180, y: 35, name: 'Insomnia', pros: 'Clean UI, GraphQL', cons: 'Less plugins', color: '#4000bf' },
          { x: 340, y: 35, name: 'Thunder Client', pros: 'VS Code native, fast', cons: 'Less features', color: '#22d3ee' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="70" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#4ade80" fontSize="6">✓ {n.pros}</text>
            <text x={n.x + 70} y={n.y + 55} textAnchor="middle" fill="#f472b6" fontSize="6">✗ {n.cons}</text>
          </g>
        ))}
        <rect x="20" y="120" width="460" height="55" rx="6" fill="#fb923c15" stroke="#fb923c" strokeWidth="1.5" />
        <text x="250" y="140" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="600">CLI Alternatives</text>
        <text x="250" y="158" textAnchor="middle" fill="#a1a1aa" fontSize="7">curl - Universal, scriptable | HTTPie - Human-friendly | xh - Rust, fast</text>
        <rect x="20" y="190" width="460" height="35" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="210" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Pick based on team needs: Collaboration (Postman) | Speed (Thunder) | CLI (curl)</text>
      </svg>
    ),
    semver: (
      <svg viewBox="0 0 500 220" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Semantic Versioning (SemVer) - MAJOR.MINOR.PATCH</text>
        {[
          { x: 20, y: 35, name: 'MAJOR', when: 'Breaking changes', example: '2.0.0', color: '#f472b6' },
          { x: 180, y: 35, name: 'MINOR', when: 'New features (backward compatible)', example: '1.5.0', color: '#4ade80' },
          { x: 340, y: 35, name: 'PATCH', when: 'Bug fixes', example: '1.5.3', color: '#60a5fa' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="140" height="65" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 70} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="600">{n.name}</text>
            <text x={n.x + 70} y={n.y + 38} textAnchor="middle" fill="#a1a1aa" fontSize="6">{n.when}</text>
            <text x={n.x + 70} y={n.y + 55} textAnchor="middle" fill="#71717a" fontSize="7">e.g., {n.example}</text>
          </g>
        ))}
        <rect x="20" y="115" width="460" height="90" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="135" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Version Ranges (npm/yarn)</text>
        <text x="250" y="155" textAnchor="middle" fill="#71717a" fontSize="7">^1.2.3 = 1.x.x (minor updates OK) | ~1.2.3 = 1.2.x (patch updates only)</text>
        <text x="250" y="172" textAnchor="middle" fill="#71717a" fontSize="7">1.2.3 = exact version | &gt;=1.2.3 = this or higher</text>
        <text x="250" y="192" textAnchor="middle" fill="#22d3ee" fontSize="6">Pre-release: 1.0.0-alpha.1 | Build metadata: 1.0.0+build.123</text>
      </svg>
    ),
    vpnarch: (
      <svg viewBox="0 0 500 260" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">VPN Architecture - Site-to-Site vs Client VPN</text>
        <rect x="20" y="35" width="225" height="90" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="132" y="55" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="600">Site-to-Site VPN</text>
        <text x="132" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Connects entire networks</text>
        <text x="132" y="92" textAnchor="middle" fill="#a1a1aa" fontSize="7">Office ↔ Cloud/DC</text>
        <text x="132" y="110" textAnchor="middle" fill="#71717a" fontSize="6">IPsec, always-on, hardware</text>
        <rect x="255" y="35" width="225" height="90" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="367" y="55" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">Client VPN</text>
        <text x="367" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Individual device access</text>
        <text x="367" y="92" textAnchor="middle" fill="#a1a1aa" fontSize="7">Laptop → Corporate network</text>
        <text x="367" y="110" textAnchor="middle" fill="#71717a" fontSize="6">OpenVPN, WireGuard, software</text>
        <rect x="20" y="140" width="460" height="55" rx="6" fill="#f472b615" stroke="#f472b6" strokeWidth="1.5" />
        <text x="250" y="160" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="600">VPN Protocols</text>
        <text x="250" y="180" textAnchor="middle" fill="#a1a1aa" fontSize="7">WireGuard (modern, fast) | OpenVPN (flexible) | IPsec/IKEv2 (enterprise) | L2TP (legacy)</text>
        <rect x="20" y="210" width="460" height="35" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="230" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Zero Trust alternative: BeyondCorp model - no VPN needed, identity-based access</text>
      </svg>
    ),
    memorytypes: (
      <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">Memory: Stack vs Heap</text>
        <rect x="20" y="35" width="225" height="100" rx="6" fill="#4ade8015" stroke="#4ade80" strokeWidth="1.5" />
        <text x="132" y="55" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="600">Stack</text>
        <text x="132" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">LIFO, auto-managed</text>
        <text x="132" y="92" textAnchor="middle" fill="#a1a1aa" fontSize="7">Local variables, function calls</text>
        <text x="132" y="109" textAnchor="middle" fill="#a1a1aa" fontSize="7">Fast allocation (pointer bump)</text>
        <text x="132" y="126" textAnchor="middle" fill="#71717a" fontSize="6">Limited size (~1-8 MB)</text>
        <rect x="255" y="35" width="225" height="100" rx="6" fill="#f472b615" stroke="#f472b6" strokeWidth="1.5" />
        <text x="367" y="55" textAnchor="middle" fill="#f472b6" fontSize="10" fontWeight="600">Heap</text>
        <text x="367" y="75" textAnchor="middle" fill="#a1a1aa" fontSize="7">Dynamic, manual/GC managed</text>
        <text x="367" y="92" textAnchor="middle" fill="#a1a1aa" fontSize="7">Objects, dynamic arrays</text>
        <text x="367" y="109" textAnchor="middle" fill="#a1a1aa" fontSize="7">Slower (fragmentation)</text>
        <text x="367" y="126" textAnchor="middle" fill="#71717a" fontSize="6">Large, limited by RAM</text>
        <rect x="20" y="150" width="460" height="55" rx="6" fill="#60a5fa15" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="250" y="170" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="600">Memory Hierarchy (Speed → Capacity)</text>
        <text x="250" y="190" textAnchor="middle" fill="#a1a1aa" fontSize="7">Registers → L1 Cache → L2 Cache → L3 Cache → RAM → SSD → HDD</text>
        <rect x="20" y="220" width="460" height="45" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="238" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Stack overflow: recursion too deep | Heap: memory leaks, fragmentation</text>
        <text x="250" y="255" textAnchor="middle" fill="#22d3ee" fontSize="6">Rust/Go put small objects on stack for performance (escape analysis)</text>
      </svg>
    ),
    internationalpay: (
      <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <text x="250" y="15" textAnchor="middle" fill="#52525b" fontSize="9">International Payments - Cross-Border Flow</text>
        {[
          { x: 20, y: 35, name: 'Sender Bank', desc: 'Initiates payment', color: '#4ade80' },
          { x: 140, y: 35, name: 'SWIFT', desc: 'Messaging network', color: '#60a5fa' },
          { x: 260, y: 35, name: 'Correspondent', desc: 'Intermediary bank', color: '#f472b6' },
          { x: 380, y: 35, name: 'Receiver Bank', desc: 'Credits recipient', color: '#fb923c' }
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width="100" height="50" rx="6" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 50} y={n.y + 18} textAnchor="middle" fill={n.color} fontSize="8" fontWeight="600">{n.name}</text>
            <text x={n.x + 50} y={n.y + 38} textAnchor="middle" fill="#71717a" fontSize="6">{n.desc}</text>
            {i < 3 && <path d={`M${n.x + 100} ${n.y + 25} L${n.x + 120} ${n.y + 25}`} stroke="#3f3f46" strokeWidth="1.5" />}
          </g>
        ))}
        <rect x="20" y="100" width="225" height="70" rx="6" fill="#a78bfa15" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="132" y="120" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Traditional SWIFT</text>
        <text x="132" y="140" textAnchor="middle" fill="#a1a1aa" fontSize="7">2-5 business days</text>
        <text x="132" y="157" textAnchor="middle" fill="#71717a" fontSize="6">$25-50 fees, multiple hops</text>
        <rect x="255" y="100" width="225" height="70" rx="6" fill="#22d3ee15" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="367" y="120" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="600">Modern Alternatives</text>
        <text x="367" y="140" textAnchor="middle" fill="#a1a1aa" fontSize="7">Wise, Revolut: Minutes, low fees</text>
        <text x="367" y="157" textAnchor="middle" fill="#71717a" fontSize="6">Ripple/XRP: Blockchain-based</text>
        <rect x="20" y="185" width="460" height="80" rx="6" fill="rgba(255,255,255,0.02)" stroke="#3f3f46" />
        <text x="250" y="205" textAnchor="middle" fill="#fafafa" fontSize="9" fontWeight="600">Currency Conversion</text>
        <text x="250" y="225" textAnchor="middle" fill="#71717a" fontSize="7">FX rate + markup (1-5%) | Mid-market rate is best | Banks add hidden fees</text>
        <text x="250" y="242" textAnchor="middle" fill="#71717a" fontSize="7">SWIFT GPI: Faster tracking | ISO 20022: New message format</text>
        <text x="250" y="257" textAnchor="middle" fill="#22d3ee" fontSize="6">$150 trillion+ moves through SWIFT annually</text>
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
  },
  thunderherd: {
    concepts: ['Cache expiration causes simultaneous DB requests', 'Multiple clients race to rebuild cache', 'Database overload from sudden traffic spike', 'Solutions: Locking, early refresh, background jobs', 'Request coalescing deduplicates identical requests'],
    tradeoffs: [['Solution', 'Pros', 'Cons'], ['Mutex Lock', 'Guaranteed single rebuild', 'Added latency, lock contention'], ['Early Expire', 'No thundering herd', 'Complex probability logic'], ['Background Refresh', 'No user impact', 'Stale data window'], ['Never Expire', 'Zero stampede risk', 'Manual invalidation needed']],
    interview: ['How prevent cache stampede?', 'Compare locking vs probabilistic refresh', 'What is request coalescing?'],
    deepDive: 'Facebook solved this with lease mechanism: first request gets a lease token, others wait. If lease holder crashes, token expires and another client takes over. Google uses probabilistic early expiration: refresh probability increases as TTL approaches. Formula: exp(-beta * remaining_ttl) where beta controls aggressiveness. Request coalescing in Nginx combines duplicate in-flight requests - 99% reduction in backend calls during traffic spikes.',
    realWorld: 'Facebook: Lease-based locking in Memcached for 5B+ requests/sec. Netflix: EVCache with probabilistic refresh. Cloudflare: Request coalescing handles 25M+ requests/sec. Instagram: Background refresh for hot keys with 100K+ QPS.',
    gotchas: 'Mutex locks create single point of failure if holder crashes. Set lock timeout shorter than TTL. Probabilistic refresh only works with predictable access patterns. Test thundering herd with cache flush during peak traffic.'
  },
  cachepenetration: {
    concepts: ['Queries for non-existent data bypass cache', 'Every miss hits database directly', 'Can be malicious attack or bug', 'Bloom filter pre-checks key existence', 'Cache null values with short TTL'],
    tradeoffs: [['Solution', 'Pros', 'Cons'], ['Bloom Filter', 'Memory efficient, O(1)', 'False positives possible'], ['Cache Nulls', 'Simple to implement', 'Memory for null entries'], ['Input Validation', 'Blocks invalid requests', 'Requires business logic'], ['Rate Limiting', 'Protects DB', 'May block valid users']],
    interview: ['Bloom filter vs caching nulls?', 'How handle legitimate new keys?', 'Cache penetration vs stampede?'],
    deepDive: 'Bloom filter uses k hash functions mapping to m bits. False positive rate: (1 - e^(-kn/m))^k where n = items. For 1M keys, 10MB bloom filter gives <1% false positives. Caching nulls: store empty result with 30-60s TTL to absorb repeated queries. Combine both: bloom filter first, then cache nulls for items that pass filter. Redis SETNX with TTL for null caching.',
    realWorld: 'Google Bigtable: Bloom filter per SSTable reduces disk reads 99%. Cassandra: Row-level bloom filters default. HBase: Block-level bloom filters. Redis: Built-in bloom filter module. Cloudflare: Rate limiting + null caching for 7M+ sites.',
    gotchas: 'Bloom filter must be rebuilt when data changes. False negatives never happen but false positives waste cache space. Dont cache nulls too long or real data appears missing. Log and alert on high null cache rates - may indicate attack.'
  },
  cachebreakdown: {
    concepts: ['Hot key expiration under high load', 'Single popular item expires and causes stampede', 'Different from thunderherd: affects one key', 'Mutex prevents concurrent rebuilds', 'Logical expiration separates TTL from refresh'],
    tradeoffs: [['Solution', 'Pros', 'Cons'], ['Mutex Lock', 'Single rebuild', 'Lock contention on hot key'], ['Never Expire', 'Zero breakdown', 'Manual invalidation burden'], ['Logical TTL', 'Graceful refresh', 'Stale data during refresh'], ['Singleflight', 'Dedupes concurrent calls', 'Added code complexity']],
    interview: ['Mutex vs singleflight pattern?', 'How detect hot keys?', 'Logical vs physical TTL?'],
    deepDive: 'Singleflight pattern (Go stdlib): first caller executes, others wait for result. Unlike mutex, callers share the result. Logical TTL: store actual data + soft expiry timestamp. If soft expired, serve stale while refreshing async. Hot key detection: Redis OBJECT FREQ command or client-side sampling. Instagram uses shadow keys: hot_key + hot_key_shadow where shadow has longer TTL as backup.',
    realWorld: 'Instagram: Shadow keys for trending posts with 1M+ views. Twitter: Singleflight for trending hashtags. Netflix: Never-expire for catalog data with event-driven invalidation. Go stdlib: sync/singleflight used by Kubernetes, Docker, Prometheus.',
    gotchas: 'Hot keys often unpredictable (viral content). Pre-warm cache before marketing campaigns. Monitor key access distribution - power law means top 1% keys get 90% traffic. Consider dedicated cache cluster for hot keys.'
  },
  cachecrash: {
    concepts: ['Complete cache layer failure', 'All requests hit database', 'Cold start with empty cache', 'Warm-up strategies before serving traffic', 'Persistence options prevent data loss'],
    tradeoffs: [['Strategy', 'Pros', 'Cons'], ['Cache Warming', 'Fast recovery', 'Needs data source'], ['Persistent Cache', 'Survives restart', 'Disk I/O overhead'], ['Replica Failover', 'Instant recovery', '2x cost'], ['Gradual Ramp', 'Protects DB', 'Slower recovery']],
    interview: ['Redis RDB vs AOF?', 'How warm cache at startup?', 'Cache cluster failover strategies?'],
    deepDive: 'Redis persistence: RDB snapshots every N changes (fast recovery, some data loss) vs AOF logs every write (slow recovery, no data loss). Use both: AOF for durability, RDB for fast restart. Cache warming: replay access logs or query top-N from DB. Netflix warms EVCache from Cassandra before enabling traffic. Gradual ramp-up: start at 10% traffic, increase as cache fills.',
    realWorld: 'Redis: RDB+AOF for production, snapshots every 15 min. Netflix: EVCache replication across 3 zones, automatic failover. Facebook: Memcached cold cache warm-up takes 6 hours for petabyte-scale. AWS ElastiCache: Multi-AZ with automatic failover in <60 seconds.',
    gotchas: 'Never disable persistence in production. RDB fork can cause latency spike for large datasets. AOF rewrite also needs careful tuning. Test cache failure regularly - know your recovery time. Database needs headroom for cache failures.'
  },
  cachinglevels: {
    concepts: ['8 layers of caching in modern architecture', 'Each layer reduces latency and load', 'Client → CDN → LB → Gateway → App → Distributed → Search → DB', 'Cache closer to user = faster response', 'Trade-off between freshness and performance'],
    tradeoffs: [['Layer', 'Latency', 'Freshness Trade-off'], ['Client/Browser', '~0ms', 'Stale until refresh'], ['CDN Edge', '~10ms', 'TTL-based invalidation'], ['Distributed Cache', '~1ms', 'Near real-time'], ['Database Cache', '~10ms', 'Automatic invalidation']],
    interview: ['When to cache at each layer?', 'How coordinate invalidation across layers?', 'CDN vs application cache?'],
    deepDive: 'Layer selection: Static content → CDN (1 year TTL). Session data → Distributed cache (Redis). Query results → Application cache. Full-text → Search cache. Invalidation cascade: write to DB → invalidate distributed cache → CDN purge → client refresh. Cache-Control headers coordinate browser + CDN. Netflix uses cache hierarchy: L1 (in-process) → L2 (EVCache) → L3 (Cassandra).',
    realWorld: 'Netflix: 8 caching layers serve 30M+ ops/sec. Cloudflare: 200+ edge locations, 50TB+ cached globally. Facebook: TAO cache handles 99% of social graph reads. LinkedIn: Feed uses 5 cache layers from browser to MySQL.',
    gotchas: 'More layers = more complexity for invalidation. Browser cache hardest to invalidate (versioned URLs help). Each layer adds debugging difficulty. Monitor hit rates at every layer - identify weak spots.'
  },
  k8sarchitecture: {
    concepts: ['Control plane manages cluster state', 'API Server: Central hub for all communication', 'etcd: Distributed key-value store for state', 'Scheduler: Assigns pods to nodes', 'Worker nodes run actual workloads'],
    tradeoffs: [['Component', 'Purpose', 'Failure Impact'], ['API Server', 'All operations', 'Cluster unusable'], ['etcd', 'State storage', 'Data loss risk'], ['Scheduler', 'Pod placement', 'No new scheduling'], ['Kubelet', 'Node agent', 'Node unhealthy']],
    interview: ['How API Server handles requests?', 'Why etcd over other databases?', 'Control plane HA setup?'],
    deepDive: 'API Server: RESTful interface, all kubectl commands go here. Implements admission controllers for validation/mutation. etcd: Raft consensus for strong consistency, watch API for change notifications. Scheduler: 2-phase (filter + score) to find best node. Controller Manager: runs reconciliation loops (Deployment → ReplicaSet → Pods). Production: 3+ control plane nodes, 5 etcd nodes for quorum.',
    realWorld: 'Google GKE: Managed control plane, 99.95% SLA. Spotify: 200+ clusters, 6000+ nodes. Shopify: 800K+ pods during Black Friday. Airbnb: 1000+ microservices on Kubernetes.',
    gotchas: 'etcd performance critical - use SSDs, separate etcd cluster. API Server rate limiting prevents overload. Control plane and workloads on separate nodes in production. Watch API can overwhelm etcd - limit list/watch operations.'
  },
  k8spatterns: {
    concepts: ['Health Probe: Liveness and readiness checks', 'Sidecar: Helper container alongside main app', 'Init Container: Setup before main container', 'Operator: Custom controller for complex apps', 'Service Discovery: Dynamic endpoint resolution'],
    tradeoffs: [['Pattern', 'Use Case', 'Complexity'], ['Sidecar', 'Cross-cutting concerns', 'Resource overhead'], ['Init Container', 'Setup/migration', 'Startup delay'], ['Operator', 'Stateful apps', 'High dev effort'], ['DaemonSet', 'Node-level agents', 'Resource per node']],
    interview: ['Liveness vs readiness probes?', 'When use operator vs Helm?', 'Sidecar vs library?'],
    deepDive: 'Sidecar pattern: Istio injects Envoy proxy for mTLS, observability, traffic control. Init containers: run database migrations, wait for dependencies. Operators: extend Kubernetes API for stateful workloads (databases, message queues). CRDs + Controllers = Operator. Health probes: liveness restarts unhealthy containers, readiness removes from service endpoints.',
    realWorld: 'Istio: Sidecar proxy for service mesh in 10K+ companies. Prometheus Operator: Manages monitoring stack. Redis Operator: Handles cluster formation and failover. Kafka Strimzi Operator: Manages Kafka on Kubernetes.',
    gotchas: 'Sidecar increases pod resource usage 2x. Init container failure blocks pod startup. Operators are powerful but complex to build correctly. Readiness probe failure during deployment = rollback.'
  },
  k8stools: {
    concepts: ['Monitoring: Prometheus, Grafana, Datadog', 'Security: Falco, OPA, Trivy, Vault', 'Networking: Calico, Cilium, Istio', 'CI/CD: ArgoCD, Flux, Tekton', 'Storage: Rook, Longhorn, Velero'],
    tradeoffs: [['Category', 'CNCF Tool', 'Enterprise Alternative'], ['Monitoring', 'Prometheus', 'Datadog, New Relic'], ['Mesh', 'Istio', 'Linkerd, Consul'], ['GitOps', 'ArgoCD', 'Flux, Spinnaker'], ['Security', 'Falco', 'Aqua, Sysdig']],
    interview: ['Prometheus vs commercial APM?', 'Istio vs Linkerd trade-offs?', 'ArgoCD vs Flux?'],
    deepDive: 'CNCF landscape: 100+ projects across 20+ categories. Prometheus: Pull-based metrics, PromQL, AlertManager. Istio: Feature-rich but complex (sidecar overhead). Linkerd: Simpler, lower resource usage. ArgoCD: GitOps with UI, SSO, RBAC. OPA: Policy as code for admission control. Trivy: Image vulnerability scanning.',
    realWorld: 'Spotify: Prometheus + Grafana for 200+ clusters. Airbnb: Istio service mesh. Netflix: Custom tooling (Spinnaker for CD). Pinterest: Calico for network policy. Shopify: ArgoCD for GitOps.',
    gotchas: 'Too many tools = integration nightmare. Start simple (Prometheus + basic networking). Istio adds 10-20ms latency per hop. OPA policies can break deployments if too strict. Plan for tool upgrades - version compatibility matters.'
  },
  containersecurity: {
    concepts: ['Image scanning for vulnerabilities', 'Run as non-root user', 'Read-only root filesystem', 'Drop unnecessary capabilities', 'Secret management with Vault'],
    tradeoffs: [['Practice', 'Security Benefit', 'Operational Cost'], ['Non-root', 'Limits exploit damage', 'App compatibility issues'], ['Read-only FS', 'Prevents tampering', 'Needs volume mounts'], ['Network Policy', 'Micro-segmentation', 'Complex rule management'], ['Image Signing', 'Supply chain security', 'CI/CD integration']],
    interview: ['PodSecurityPolicy vs OPA?', 'How handle secrets in containers?', 'Container escape attacks?'],
    deepDive: 'Defense in depth: Scan images (Trivy) → Sign images (Cosign) → Admission control (OPA) → Runtime security (Falco). Pod Security Standards: Privileged, Baseline, Restricted. securityContext: runAsNonRoot, readOnlyRootFilesystem, allowPrivilegeEscalation: false. Drop all capabilities, add only needed (NET_BIND_SERVICE). Secrets: never in image, use Vault with sidecar or CSI driver.',
    realWorld: 'Google: Binary Authorization for GKE. Netflix: Automated CVE scanning blocks vulnerable images. Capital One: Vault for all secrets. Shopify: Falco for runtime anomaly detection. DoD: STIG-hardened base images.',
    gotchas: 'Non-root breaks apps expecting root. Read-only FS needs writable volumes for logs/temp. Network policies default allow - explicit deny needed. Image scanning at build AND runtime (new CVEs discovered daily).'
  },
  osimodel: {
    concepts: ['7 layers of network communication', 'Physical → Data Link → Network → Transport → Session → Presentation → Application', 'Each layer has specific protocols', 'Encapsulation adds headers going down', 'De-encapsulation removes headers going up'],
    tradeoffs: [['Layer', 'Function', 'Example Protocols'], ['Application (7)', 'User interface', 'HTTP, SMTP, DNS'], ['Transport (4)', 'End-to-end delivery', 'TCP, UDP'], ['Network (3)', 'Routing', 'IP, ICMP'], ['Data Link (2)', 'Framing', 'Ethernet, WiFi']],
    interview: ['Which layer do firewalls operate?', 'TCP/IP vs OSI model?', 'How does NAT work?'],
    deepDive: 'TCP/IP model collapses OSI to 4 layers: Application, Transport, Internet, Network Access. L4 load balancer: routes based on TCP/UDP port, fast (millions req/sec). L7 load balancer: inspects HTTP headers, slower but smarter routing. Firewalls: L3 (packet filtering), L4 (stateful), L7 (application-aware). Encapsulation overhead: Ethernet 14B + IP 20B + TCP 20B = 54B minimum header per packet.',
    realWorld: 'AWS: NLB (L4, 100ns latency) vs ALB (L7, 1ms latency). Cloudflare: L7 DDoS protection inspects 25M+ req/sec. Cisco: L2/L3 switches for data center fabrics. Netflix: L7 load balancing with Zuul for routing logic.',
    gotchas: 'OSI is conceptual model, not implementation. Real protocols span multiple layers. Troubleshoot bottom-up: physical first, then work up. MTU mismatch causes fragmentation issues at L3.'
  },
  httpstatus: {
    concepts: ['1xx: Informational (100 Continue)', '2xx: Success (200 OK, 201 Created, 204 No Content)', '3xx: Redirection (301 Permanent, 302 Temporary, 304 Not Modified)', '4xx: Client Error (400 Bad Request, 401, 403, 404)', '5xx: Server Error (500, 502 Bad Gateway, 503, 504)'],
    tradeoffs: [['Code', 'When to Use', 'Client Behavior'], ['301', 'Permanent move', 'Cache redirect'], ['302', 'Temporary move', 'Don\'t cache'], ['304', 'Not modified', 'Use cached version'], ['429', 'Rate limited', 'Retry with backoff']],
    interview: ['401 vs 403?', '502 vs 504?', 'Why 204 vs 200?'],
    deepDive: '401 Unauthorized: missing/invalid auth. 403 Forbidden: authenticated but not permitted. 502 Bad Gateway: upstream returned invalid response. 504 Gateway Timeout: upstream didn\'t respond. 429 Too Many Requests: include Retry-After header. 204 No Content: successful but no body (DELETE, PUT). API design: use 201+Location for created resources, 202 for async processing.',
    realWorld: 'Stripe: 402 Payment Required for declined cards. GitHub: 422 Unprocessable Entity for validation errors. Twitter: 429 with rate limit headers. AWS: 503 with exponential backoff recommendation. Cloudflare: Custom 5xx for specific edge errors.',
    gotchas: 'Don\'t return 200 for errors (with error in body). 5xx should be retried, 4xx should not (usually). Log 5xx for debugging, 4xx for abuse detection. Status code is first thing client checks - make it meaningful.'
  },
  sslhandshake: {
    concepts: ['ClientHello: cipher suites, TLS version', 'ServerHello: chosen cipher, certificate', 'Key exchange: establish shared secret', 'Verify certificate chain to CA', 'Encrypted session established'],
    tradeoffs: [['TLS Version', 'Security', 'Compatibility'], ['TLS 1.3', 'Best, 1-RTT', 'New clients only'], ['TLS 1.2', 'Good, 2-RTT', 'Wide support'], ['TLS 1.0/1.1', 'Deprecated', 'Legacy only']],
    interview: ['TLS 1.2 vs 1.3 handshake?', 'What is perfect forward secrecy?', 'How does MITM attack work?'],
    deepDive: 'TLS 1.3: 1-RTT handshake (vs 2-RTT in 1.2), removed weak ciphers, mandatory PFS. Key exchange: ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) for PFS. Certificate validation: check signature, expiry, revocation (OCSP/CRL), hostname match. 0-RTT resumption in TLS 1.3 enables instant reconnection but has replay attack risk. Certificate Transparency logs prevent rogue CA certs.',
    realWorld: 'Cloudflare: TLS 1.3 for 25% of HTTPS traffic. Let\'s Encrypt: 300M+ free certificates. Google: Certificate Transparency pioneer. AWS: ACM for automatic renewal. Apple: App Transport Security requires TLS 1.2+.',
    gotchas: 'Certificate expiry causes outages - automate renewal. OCSP stapling reduces latency. TLS termination at load balancer simplifies backend. Mixed content (HTTP resources on HTTPS page) blocked by browsers. HSTS prevents downgrade attacks.'
  },
  sshprotocol: {
    concepts: ['Transport layer: encryption, integrity', 'User authentication: password, key, certificate', 'Connection: multiplexed channels', 'Port forwarding: local, remote, dynamic', 'Key exchange: Diffie-Hellman'],
    tradeoffs: [['Auth Method', 'Security', 'Convenience'], ['Password', 'Low', 'Easy'], ['SSH Key', 'High', 'Key management'], ['Certificate', 'Highest', 'CA infrastructure'], ['MFA', 'Highest', 'Complexity']],
    interview: ['SSH vs TLS differences?', 'How does SSH key auth work?', 'SSH tunneling use cases?'],
    deepDive: 'SSH key auth: client has private key, server has public key in authorized_keys. Challenge-response: server encrypts random data with public key, client decrypts with private. Ed25519 keys recommended (fast, secure, short). SSH certificates: signed by CA, include validity period and principals. Jump hosts: ProxyJump for bastion access. Agent forwarding: use local keys on remote servers (security risk).',
    realWorld: 'GitHub: SSH for git operations, 100M+ repos. HashiCorp Vault: SSH certificate authority. Teleport: Zero-trust SSH with audit logs. AWS: EC2 Instance Connect for browser SSH. Google Cloud: OS Login with IAM integration.',
    gotchas: 'Never share private keys. Disable password auth in production. Agent forwarding exposes keys to compromised hosts. Rotate keys regularly. known_hosts prevents MITM but can break on server rebuild.'
  },
  ipv4v6: {
    concepts: ['IPv4: 32-bit, 4.3 billion addresses', 'IPv6: 128-bit, 340 undecillion addresses', 'NAT extends IPv4 address space', 'IPv6 simplifies headers, no NAT needed', 'Dual-stack: run both protocols'],
    tradeoffs: [['Aspect', 'IPv4', 'IPv6'], ['Address size', '32-bit (4B)', '128-bit (340 undecillion)'], ['NAT needed', 'Yes', 'No'], ['Header', 'Variable, complex', 'Fixed, simpler'], ['Adoption', '~75%', '~40%']],
    interview: ['Why still using IPv4?', 'How does NAT work?', 'IPv6 transition strategies?'],
    deepDive: 'IPv4 exhaustion: ARIN ran out 2015. NAT (Network Address Translation): many private IPs share one public IP. IPv6 benefits: no NAT = true end-to-end, simpler routing, mandatory IPsec, auto-configuration (SLAAC). Transition: Dual-stack (run both), tunneling (6to4, Teredo), translation (NAT64). IPv6 adoption: mobile networks lead (80%+), enterprise lags.',
    realWorld: 'Google: 40%+ traffic IPv6. Facebook: 90% of traffic IPv6-capable. AWS: Dual-stack VPCs default. Mobile carriers: T-Mobile 95% IPv6. Apple: IPv6-only network required for App Store approval.',
    gotchas: 'IPv6 addresses are long - use DNS. Some apps hardcode IPv4. Firewalls need IPv6 rules too. IPv6 makes port scanning easier (no NAT hiding). Test with IPv6-only to ensure compatibility.'
  },
  tcpudp: {
    concepts: ['TCP: connection-oriented, reliable, ordered', 'UDP: connectionless, unreliable, unordered', 'TCP: 3-way handshake, retransmission', 'UDP: fire-and-forget, lower latency', 'Choice depends on application needs'],
    tradeoffs: [['Feature', 'TCP', 'UDP'], ['Reliability', 'Guaranteed', 'Best effort'], ['Ordering', 'Maintained', 'Not guaranteed'], ['Latency', 'Higher (handshake)', 'Lower'], ['Use case', 'HTTP, email', 'Gaming, video']],
    interview: ['When use UDP over TCP?', 'How TCP handles packet loss?', 'Why DNS uses UDP?'],
    deepDive: 'TCP congestion control: slow start, congestion avoidance, fast retransmit. Head-of-line blocking: one lost packet blocks entire stream. QUIC (HTTP/3): UDP-based, fixes HOL blocking with streams. UDP for: real-time (VoIP, gaming), discovery (DHCP, DNS), multicast. DNS uses UDP for small queries (<512B), TCP for large (zone transfers). Modern games: UDP + custom reliability layer.',
    realWorld: 'Discord: UDP for voice with custom protocol. Zoom: UDP with forward error correction. Netflix: TCP for video (needs reliability). Google: QUIC for 35% of Chrome traffic. Gaming: UDP with client-side prediction.',
    gotchas: 'UDP through NAT is tricky (no connection tracking). Firewalls may block UDP. TCP overhead significant for small messages. QUIC adoption requires infrastructure updates. Don\'t reinvent reliability - use existing protocols.'
  },
  netprotocols: {
    concepts: ['HTTP/1.1: text-based, keep-alive', 'HTTP/2: binary, multiplexed, server push', 'HTTP/3: QUIC-based, no HOL blocking', 'WebSocket: full-duplex, persistent', 'gRPC: HTTP/2 + Protocol Buffers'],
    tradeoffs: [['Protocol', 'Pros', 'Cons'], ['HTTP/1.1', 'Simple, universal', '6 conn limit, HOL'], ['HTTP/2', 'Multiplexed, fast', 'TCP HOL, complex'], ['HTTP/3', 'No HOL, fast', 'UDP, new'], ['gRPC', 'Efficient, typed', 'Not browser-native']],
    interview: ['HTTP/2 vs gRPC?', 'WebSocket vs SSE?', 'When use HTTP/3?'],
    deepDive: 'HTTP/2: single connection, multiplexed streams, header compression (HPACK). Server push deprecated (unused). HTTP/3: QUIC = UDP + TLS 1.3 + reliability. No TCP HOL blocking - lost packet only affects one stream. WebSocket: upgrade from HTTP, bidirectional messages. SSE: server-to-client only, auto-reconnect, simpler. gRPC: strict contracts, streaming support, code generation.',
    realWorld: 'Google: HTTP/3 for Search, YouTube, Gmail. Cloudflare: HTTP/3 for 25%+ of traffic. Slack: WebSocket for real-time messaging. Twitter: gRPC for internal services. Stock exchanges: Custom UDP protocols for microsecond latency.',
    gotchas: 'HTTP/2 needs TLS in browsers (h2c unsupported). WebSocket through proxies can fail. gRPC needs code generation setup. HTTP/3 UDP may be blocked by corporate firewalls. Choose based on requirements, not hype.'
  },
  oauth2flows: {
    concepts: ['Authorization Code: Server-side apps with client secret', 'PKCE: Mobile/SPA apps with code verifier', 'Client Credentials: Service-to-service M2M', 'Implicit (Deprecated): Legacy SPAs, token in URL', 'Refresh Token: Long-lived rotation for session extension'],
    tradeoffs: [['Flow', 'Security', 'Use Case'], ['Authorization Code', 'Highest (server keeps secret)', 'Web apps with backend'], ['PKCE', 'High (code verifier)', 'Mobile, SPA, CLI'], ['Client Credentials', 'High (M2M only)', 'Microservices, cron jobs'], ['Implicit', 'Low (deprecated)', 'Never use - use PKCE']],
    interview: ['Why is PKCE more secure than Implicit?', 'When use Client Credentials vs Authorization Code?', 'How does refresh token rotation work?'],
    deepDive: 'Authorization Code: App redirects to auth server → user logs in → auth server returns code → app exchanges code + client_secret for tokens. PKCE adds code_verifier (random string) and code_challenge (SHA256 hash). Auth server verifies the challenge on token exchange - no secret needed. Refresh token rotation: each refresh returns new refresh token, old one invalidated. This limits damage if token stolen.',
    realWorld: 'Google: OAuth 2.0 for all Google APIs, 1B+ users. GitHub: OAuth for third-party apps, 100M+ developers. Okta: Enterprise SSO with PKCE for mobile. Auth0: 10B+ logins/month. Spotify: OAuth for API access, 500M+ users.',
    gotchas: 'Never use Implicit flow - vulnerable to token leakage in URL. PKCE is now required for public clients (mobile, SPA). Access tokens should be short-lived (5-15 min). Store refresh tokens securely (not localStorage). Always use HTTPS for token exchange.'
  },
  sessiontoken: {
    concepts: ['Session Cookie: Server stores session state, client gets ID', 'JWT: Self-contained claims, signed/encrypted', 'Refresh Token: Long-lived token for getting new access tokens', 'HttpOnly Cookie: JavaScript cannot access, XSS protection', 'SameSite Cookie: CSRF protection attribute'],
    tradeoffs: [['Method', 'Scalability', 'Revocation'], ['Session Cookie', 'Needs session store', 'Instant (delete from store)'], ['JWT', 'Stateless, highly scalable', 'Hard (wait for expiry)'], ['JWT + Blacklist', 'Medium', 'Possible but adds state'], ['Short JWT + Refresh', 'Good balance', 'Revoke refresh token']],
    interview: ['How revoke a JWT before expiry?', 'Session vs JWT for microservices?', 'Where to store tokens in browser?'],
    deepDive: 'JWT structure: header.payload.signature (Base64 encoded). Claims: iss (issuer), sub (subject), exp (expiry), iat (issued at), custom claims. Signature: HMAC-SHA256 or RSA. Revocation strategies: short expiry (15 min), blacklist in Redis, refresh token rotation. Storage: HttpOnly cookies (secure from XSS) vs localStorage (vulnerable to XSS but no CSRF). Best: HttpOnly cookie with SameSite=Strict.',
    realWorld: 'Auth0: JWT for stateless auth, 10B+ logins. Netflix: Short-lived JWTs with refresh rotation. Stripe: Session cookies for dashboard, API keys for programmatic. Discord: JWTs with 7-day expiry. GitHub: Session cookies with CSRF tokens.',
    gotchas: 'JWT in localStorage = XSS vulnerability. Large JWTs increase request size (sent with every request). Never store sensitive data in JWT payload (its only Base64, not encrypted). Refresh token must be stored more securely than access token. Set proper expiry - too long is insecure, too short is annoying.'
  },
  dataprotection: {
    concepts: ['Encoding: Data format conversion (Base64, URL encode)', 'Encryption: Confidentiality with key (AES, RSA)', 'Hashing: One-way fingerprint (SHA-256, bcrypt)', 'Tokenization: Replace sensitive data with token', 'Key Management: Secure key storage and rotation'],
    tradeoffs: [['Method', 'Reversible', 'Use Case'], ['Encoding', 'Yes, by anyone', 'Data transport only'], ['Symmetric Encryption', 'Yes, with key', 'Data at rest, fast'], ['Asymmetric Encryption', 'Yes, with private key', 'Key exchange, signatures'], ['Tokenization', 'Yes, via vault lookup', 'PCI compliance'], ['Hashing', 'No', 'Password storage']],
    interview: ['Encoding vs Encryption for API data?', 'How does tokenization reduce PCI scope?', 'Why bcrypt over SHA-256 for passwords?'],
    deepDive: 'Encryption: AES-256-GCM for symmetric (fast, authenticated). RSA-2048+ for asymmetric (slow, key exchange). Tokenization: original stored in secure vault, token has no mathematical relationship. PCI DSS: tokenization removes card data from your systems = reduced compliance scope. Hashing for passwords: bcrypt/scrypt/Argon2 with salt and work factor. Key rotation: encrypt with new key, re-encrypt data gradually.',
    realWorld: 'Stripe: Tokenization for cards, PCI Level 1. AWS KMS: Managed encryption keys for S3, EBS. HashiCorp Vault: Secret management, 10K+ companies. Apple: End-to-end encryption for iMessage. 1Password: Zero-knowledge encryption.',
    gotchas: 'Base64 is NOT encryption - anyone can decode. Never roll your own crypto - use established libraries. Key management is the hardest part - use HSM or KMS. Bcrypt has 72-byte limit - hash long passwords first. Tokenization requires highly available vault.'
  },
  devsecops: {
    concepts: ['Shift Left: Security earlier in SDLC', 'SAST: Static code analysis for vulnerabilities', 'DAST: Dynamic testing of running application', 'SCA: Software Composition Analysis for dependencies', 'IaC Security: Scan Terraform, CloudFormation'],
    tradeoffs: [['Tool Type', 'When', 'Coverage'], ['SAST', 'Code commit/PR', 'Code patterns, secrets'], ['SCA', 'Build time', 'Vulnerable dependencies'], ['DAST', 'Runtime/staging', 'Injection, misconfig'], ['IAST', 'Runtime with agent', 'Real vulnerabilities']],
    interview: ['SAST vs DAST vs SCA?', 'How prioritize vulnerability remediation?', 'Security gates in CI/CD?'],
    deepDive: 'Pipeline: PR → SAST + SCA scan → Block on critical → Build → Container scan → DAST in staging → Deploy with approval. SAST tools: Snyk Code, SonarQube, Semgrep. SCA tools: Snyk Open Source, Dependabot, WhiteSource. DAST tools: OWASP ZAP, Burp Suite. IaC tools: Checkov, tfsec, Trivy. SBOM: Software Bill of Materials for supply chain security.',
    realWorld: 'Netflix: Continuous security testing, Security Monkey. Google: OSS-Fuzz for automated fuzzing. Microsoft: SDL integrated into Azure DevOps. GitHub: Dependabot alerts, CodeQL analysis. Capital One: Cloud Custodian for compliance.',
    gotchas: 'Too many false positives = alert fatigue. Start with high/critical only. SAST cant find runtime issues. DAST cant find all code paths. Prioritize: exploitability > severity > fix effort. Security gates that block everything get bypassed.'
  },
  securitydomains: {
    concepts: ['Authentication: Verify identity (who you are)', 'Authorization: Verify permissions (what you can do)', 'Input Validation: Sanitize all user input', 'Cryptography: Encryption, hashing, signatures', 'Logging: Audit trail for security events'],
    tradeoffs: [['Domain', 'Primary Threat', 'Key Control'], ['Authentication', 'Credential theft', 'MFA, strong passwords'], ['Authorization', 'Privilege escalation', 'RBAC, least privilege'], ['Input Validation', 'Injection attacks', 'Allowlist, encoding'], ['Cryptography', 'Data exposure', 'AES-256, TLS 1.3']],
    interview: ['Defense in depth examples?', 'Least privilege in microservices?', 'Security logging requirements?'],
    deepDive: 'OWASP Secure Coding: 12 domains covering full application security. Defense in depth: multiple security layers (WAF + app validation + DB permissions). Least privilege: service accounts with minimal permissions. Fail secure: default deny, explicit allow. Separation of duties: no single person controls entire flow. Security logging: who, what, when, from where, success/failure.',
    realWorld: 'AWS: IAM for authorization, 200+ services. Google: BeyondCorp zero-trust model. Netflix: Microservice security with mutual TLS. Stripe: PCI DSS Level 1 across all domains. Apple: Secure enclave for cryptographic keys.',
    gotchas: 'Security is not a feature - its a property of every feature. Authentication without authorization = useless. Input validation on client AND server. Never log sensitive data (passwords, tokens, PII). Test security controls - dont assume they work.'
  },
  apisecurity: {
    concepts: ['BOLA: Broken Object Level Authorization', 'Rate Limiting: Prevent abuse and DoS', 'Input Validation: Prevent injection attacks', 'Authentication: Verify caller identity', 'Output Encoding: Prevent XSS in responses'],
    tradeoffs: [['Control', 'Protection', 'Performance Impact'], ['Rate Limiting', 'DoS, brute force', 'State management'], ['Input Validation', 'Injection, XSS', 'Processing overhead'], ['WAF', 'Known attack patterns', 'Latency, false positives'], ['mTLS', 'Service identity', 'Certificate management']],
    interview: ['OWASP API Top 10 vs Web Top 10?', 'How prevent BOLA?', 'API rate limiting strategies?'],
    deepDive: 'OWASP API Top 10 (2023): 1. BOLA, 2. Broken Auth, 3. Object Property Level Auth, 4. Unrestricted Resource Consumption, 5. Broken Function Level Auth, 6. Server Side Request Forgery, 7. Security Misconfiguration, 8. Injection, 9. Improper Asset Management, 10. Unsafe API Consumption. BOLA prevention: always check user owns resource, never trust client IDs. Rate limiting: Token bucket with per-user and global limits.',
    realWorld: 'Cloudflare: WAF protecting 25M+ sites. AWS API Gateway: Built-in throttling, WAF integration. Stripe: Idempotency keys prevent duplicate charges. GitHub: Rate limiting with X-RateLimit headers. Twilio: Webhook validation signatures.',
    gotchas: 'BOLA is #1 for a reason - most common API vulnerability. Client-side validation is not security. Rate limits too strict = false positives. Too loose = ineffective. Log all API errors - they reveal attack patterns. Version your API - breaking changes create security gaps.'
  },
  apiauthmethods: {
    concepts: ['API Key: Simple identifier in header/query', 'OAuth 2.0 Bearer: Delegated access token', 'JWT: Self-contained signed token', 'Basic Auth: Base64 encoded username:password', 'mTLS: Mutual TLS with client certificates'],
    tradeoffs: [['Method', 'Security', 'Complexity'], ['API Key', 'Low (no user context)', 'Very simple'], ['OAuth Bearer', 'High (scoped, expiring)', 'Complex flow'], ['JWT', 'Medium (verify signature)', 'Medium'], ['Basic Auth', 'Low (credentials sent)', 'Very simple'], ['mTLS', 'Highest (cert-based)', 'Certificate management']],
    interview: ['When use API key vs OAuth?', 'JWT vs opaque tokens?', 'How secure API keys?'],
    deepDive: 'API Key: X-API-Key header, identify application not user. Scope: rate limits, feature access. OAuth Bearer: Authorization: Bearer <token>, delegated user access. JWT: Self-contained claims, verify with public key. Signature prevents tampering. Basic Auth: Base64(username:password), only over HTTPS. mTLS: Client presents certificate, server verifies. Used for service-to-service.',
    realWorld: 'AWS: SigV4 signature for all API calls. Stripe: API keys + webhook signatures. GitHub: Personal Access Tokens with fine-grained permissions. Google Cloud: Service account keys + OAuth. Twilio: Account SID + Auth Token (Basic Auth pattern).',
    gotchas: 'API keys are not secrets if in client code. Rotate keys regularly - breach detection is hard. Bearer tokens in URLs get logged - use headers. Basic Auth credentials cached by browsers - logout is tricky. mTLS certificate rotation needs automation.'
  },
  dbdatastructures: {
    concepts: ['B-Tree: Balanced tree for disk-based sorted data', 'LSM Tree: Log-structured merge for write-heavy', 'SSTable: Sorted String Table, immutable on disk', 'Skiplist: Probabilistic layers for O(log n)', 'Inverted Index: Term → Document mapping for search'],
    tradeoffs: [['Structure', 'Read', 'Write'], ['B-Tree', 'O(log n), optimal', 'O(log n), in-place'], ['LSM Tree', 'O(log n), check levels', 'O(1), sequential'], ['Skiplist', 'O(log n)', 'O(log n)'], ['Hash Index', 'O(1)', 'O(1), no range']],
    interview: ['B-Tree vs LSM Tree trade-offs?', 'Why LSM for write-heavy?', 'How does compaction work?'],
    deepDive: 'B-Tree: Nodes sorted, fan-out 100-500 for disk. Each node = 1 disk page (4-16KB). Optimal for read-heavy OLTP. LSM Tree: Writes go to MemTable (skiplist) → flush to SSTable → background compaction. Write amplification: data rewritten during compaction. Read amplification: check multiple levels. Bloom filters reduce unnecessary disk reads. Compaction strategies: Size-tiered (Cassandra) vs Leveled (RocksDB).',
    realWorld: 'LevelDB/RocksDB: LSM Tree, 100K+ writes/sec. PostgreSQL/MySQL: B-Tree indexes. Cassandra: LSM with size-tiered compaction. Redis: Skiplist for sorted sets. Elasticsearch: Inverted index + segment merging.',
    gotchas: 'LSM compaction can spike latency - tune carefully. B-Tree suffers from fragmentation over time. Bloom filters use memory - balance false positive rate. SSTable merging is I/O intensive. Monitor write amplification ratio.'
  },
  sqloptimization: {
    concepts: ['EXPLAIN ANALYZE: View actual execution plan', 'Index types: B-Tree, Hash, GIN, GiST', 'Query planner: Cost-based optimization', 'Statistics: ANALYZE keeps stats current', 'Covering index: All columns in index'],
    tradeoffs: [['Index Type', 'Best For', 'Limitation'], ['B-Tree', '=, <, >, BETWEEN', 'Large values slow'], ['Hash', 'Equality only', 'No range queries'], ['GIN', 'Arrays, JSONB, FTS', 'Slower writes'], ['Partial', 'Subset of rows', 'Limited scope']],
    interview: ['How read EXPLAIN output?', 'When does index not help?', 'Composite index column order?'],
    deepDive: 'Query execution: Parse → Rewrite → Plan → Execute. Cost estimation: seq_page_cost=1.0, random_page_cost=4.0, cpu_tuple_cost=0.01. Index selection: planner compares sequential scan vs index scan costs. Left-most prefix rule: composite index (a, b, c) can use (a), (a, b), or (a, b, c). Covering index: includes all queried columns, avoids table lookup (Index-Only Scan). Statistics: histogram, most common values, null fraction.',
    realWorld: 'Uber: 10K+ PostgreSQL indexes, careful monitoring. Instagram: Partial indexes for active users only. Stripe: Covering indexes for billing queries. Discord: GIN indexes for JSONB search. Amazon RDS: Performance Insights for query analysis.',
    gotchas: 'LIKE %x% cannot use B-Tree index. Functions on columns prevent index use (create expression index). Too many indexes slow writes. Outdated statistics → bad plans (run ANALYZE). Index bloat requires REINDEX. Check for sequential scans on large tables.'
  },
  dbtransactions: {
    concepts: ['ACID: Atomicity, Consistency, Isolation, Durability', 'Isolation levels: Read Uncommitted → Serializable', 'MVCC: Multi-Version Concurrency Control', 'Deadlock: Circular wait detection', '2PC: Two-phase commit for distributed'],
    tradeoffs: [['Isolation', 'Anomaly Prevented', 'Performance'], ['Read Uncommitted', 'None', 'Fastest'], ['Read Committed', 'Dirty read', 'Good'], ['Repeatable Read', 'Non-repeatable', 'Medium'], ['Serializable', 'All anomalies', 'Slowest']],
    interview: ['What causes phantom reads?', 'MVCC vs locking?', 'How detect deadlocks?'],
    deepDive: 'MVCC (PostgreSQL): Each row has xmin (created by txn) and xmax (deleted by txn). Readers dont block writers. Snapshot isolation: txn sees consistent snapshot at start. Serializable: PostgreSQL uses SSI (Serializable Snapshot Isolation) with predicate locks. Deadlock detection: wait-for graph, abort youngest txn. MySQL: InnoDB uses gap locks for phantom prevention.',
    realWorld: 'PostgreSQL: MVCC, Read Committed default. MySQL: Repeatable Read default, gap locks. CockroachDB: Serializable only, optimistic locking. Spanner: External consistency with TrueTime. DynamoDB: Transactions with 25-item limit.',
    gotchas: 'Serializable is slow - use only when needed. Long transactions hold locks/versions. Deadlocks require retry logic. MVCC vacuum is essential (PostgreSQL autovacuum). Read Committed can see different data in same txn. Distributed transactions are 10x slower.'
  },
  dbmodels: {
    concepts: ['Flat file: Simple records, no relationships', 'Hierarchical: Tree structure, IMS style', 'Relational: Tables with foreign keys', 'Star schema: Fact + dimension tables', 'Snowflake: Normalized star schema', 'Network: Graph-like CODASYL'],
    tradeoffs: [['Model', 'Query Flexibility', 'Write Performance'], ['Relational', 'High (SQL)', 'Medium'], ['Star Schema', 'Fast aggregations', 'ETL complexity'], ['Document', 'Schema flexible', 'Good'], ['Graph', 'Relationship traversal', 'Variable']],
    interview: ['Star vs snowflake schema?', 'OLTP vs OLAP data model?', 'When denormalize?'],
    deepDive: 'Star schema: Central fact table (events/transactions) + dimension tables (who/what/when/where). Optimized for aggregations, denormalized for query speed. Snowflake: Dimensions normalized into sub-dimensions. Saves space but more joins. OLAP engines (BigQuery, Redshift) optimize for star schema scans. Modern: Document (MongoDB flexibility), Graph (Neo4j relationships), Time-series (InfluxDB metrics).',
    realWorld: 'Amazon Redshift: Star schema for analytics. Snowflake: Named after the schema pattern. MongoDB: Document model for 50K+ companies. Neo4j: Graph DB for fraud detection, recommendations. ClickHouse: Columnar for real-time analytics.',
    gotchas: 'Over-normalization kills query performance. Star schema needs careful dimension design. Snowflake schema joins can be expensive. Document model: think about access patterns upfront. Graph traversal can explode with dense connections.'
  },
  shardingguide: {
    concepts: ['Range sharding: Divide by key ranges', 'Hash sharding: Consistent hash of key', 'Consistent hashing: Ring-based distribution', 'Virtual buckets: Logical to physical mapping', 'Shard key: Most important decision'],
    tradeoffs: [['Strategy', 'Distribution', 'Range Queries'], ['Range', 'Can be uneven', 'Efficient'], ['Hash', 'Even', 'Scatter-gather'], ['Consistent', 'Even, easy resize', 'Scatter-gather'], ['Directory', 'Controlled', 'Lookup needed']],
    interview: ['How choose shard key?', 'Cross-shard query challenges?', 'Resharding strategies?'],
    deepDive: 'Shard key selection criteria: high cardinality, even distribution, query locality. Bad keys: timestamps (hot partition), low cardinality (uneven). Instagram: user_id modulo number of shards. Vitess: vschema maps logical shards to physical MySQL. Consistent hashing: minimal data movement when adding nodes. Virtual nodes: each server owns multiple points on ring for better balance. Cross-shard: scatter-gather pattern, expensive for joins.',
    realWorld: 'Instagram: 12K+ shards, user_id based. Vitess (YouTube): Manages sharded MySQL at scale. CockroachDB: Automatic range-based sharding. Cassandra: Consistent hashing with vnodes. MongoDB: Range or hash sharding.',
    gotchas: 'Wrong shard key = rewrite entire database. Cross-shard transactions are very slow. Hotspots can overwhelm single shard. Plan resharding before you need it. Scatter-gather queries dont scale linearly. Consider read replicas before sharding.'
  },
  pgecosystem: {
    concepts: ['TimescaleDB: Time-series extension', 'pgVector: Vector embeddings for AI', 'PostGIS: Geospatial data and queries', 'Citus: Distributed PostgreSQL', 'pgBouncer: Connection pooling'],
    tradeoffs: [['Extension', 'Use Case', 'Overhead'], ['TimescaleDB', 'Time-series', 'Chunking complexity'], ['pgVector', 'Embeddings/AI', 'Index build time'], ['PostGIS', 'Geospatial', 'Large data types'], ['Citus', 'Sharding', 'Distributed complexity']],
    interview: ['pgVector vs dedicated vector DB?', 'When use TimescaleDB?', 'PostGIS vs application-side geo?'],
    deepDive: 'TimescaleDB: Hypertables auto-partition by time. Compression up to 95%. Continuous aggregates for rollups. pgVector: Store 1536-dim OpenAI embeddings, IVFFlat or HNSW indexes. 10-100x faster than linear scan. PostGIS: Geography vs Geometry types, spatial indexes (GiST). ST_DWithin for proximity queries. Citus: Distributed tables, reference tables, local tables. Transparent sharding.',
    realWorld: 'Timescale: IoT at Comcast, 100B+ rows. pgVector: AI startups, RAG applications. PostGIS: Uber, Lyft for location data. Citus: Microsoft (acquired), Azure PostgreSQL Hyperscale. Supabase: PostgreSQL + pgVector for AI features.',
    gotchas: 'Extensions add upgrade complexity. pgVector index build can take hours for millions of vectors. PostGIS SRID must match for operations. Citus distributed queries can be slow if poorly designed. pgBouncer transaction mode breaks some features (prepared statements).'
  },
  micropractices: {
    concepts: ['Single responsibility: One service = one business capability', 'Database per service: No shared databases', 'Stateless services: Store state externally', 'Containerization: Docker for consistency', 'API Gateway: Single entry point for clients'],
    tradeoffs: [['Practice', 'Benefit', 'Challenge'], ['Single Purpose', 'Easy to understand', 'More services to manage'], ['Separate DBs', 'Independence', 'Data consistency'], ['Stateless', 'Easy scaling', 'External state management'], ['Containers', 'Portability', 'Orchestration complexity']],
    interview: ['How determine service boundaries?', 'Database per service challenges?', 'When NOT use microservices?'],
    deepDive: 'Service boundaries: Use DDD bounded contexts. Each context = potential microservice. Database per service: Prevents tight coupling, enables polyglot persistence. Challenge: distributed transactions (use Saga pattern). Stateless: Store sessions in Redis, use JWT for auth. Enables horizontal scaling. API Gateway: Netflix ZUUL, Kong, AWS API Gateway. Handles auth, rate limiting, routing, aggregation.',
    realWorld: 'Netflix: 1000+ microservices, 2 billion API calls/day. Uber: 2000+ microservices, 50M trips/day. Amazon: Two-pizza team rule, each owns services. Spotify: Squads own services end-to-end. Airbnb: Migrated from Rails monolith to 500+ services.',
    gotchas: 'Microservices add complexity - dont use for small teams. Network latency replaces function calls. Distributed debugging is hard. Data consistency requires eventual consistency mindset. Start with monolith, extract services as needed.'
  },
  prodcomponents: {
    concepts: ['API Gateway: Entry point with auth, rate limiting', 'Service Registry: Dynamic service discovery', 'Config Server: Centralized configuration', 'Circuit Breaker: Prevent cascade failures', 'Distributed Cache: Reduce database load'],
    tradeoffs: [['Component', 'Must-Have', 'Nice-to-Have'], ['API Gateway', 'Yes', 'Load balancing built-in'], ['Service Registry', 'Yes for dynamic', 'No if static IPs'], ['Config Server', 'Yes for secrets', 'Can use env vars'], ['Circuit Breaker', 'Yes', 'Retry + timeout sufficient']],
    interview: ['Minimum viable production setup?', 'Config server vs environment variables?', 'When skip service registry?'],
    deepDive: 'API Gateway: ZUUL (Netflix), Kong (open source), AWS API Gateway. Features: authentication, rate limiting, request transformation, response caching. Service Registry: Eureka (Netflix), Consul (HashiCorp), etcd. Self-registration vs third-party registration. Config Server: Spring Cloud Config, HashiCorp Vault for secrets. Git-backed for version control. Circuit Breaker: Hystrix (deprecated), Resilience4j. States: Closed → Open → Half-Open.',
    realWorld: 'Netflix: ZUUL + Eureka + Hystrix stack. Amazon: AWS API Gateway + ECS Service Discovery. Uber: Custom service mesh with Consul. Spotify: Envoy proxy for service mesh. Pinterest: Kong API Gateway.',
    gotchas: 'Start with essentials: Gateway, Registry, basic monitoring. Add complexity as needed. Service registry requires health checks - configure properly. Config server is single point of failure - make it HA. Too many circuit breakers = hard to debug.'
  },
  servicediscovery: {
    concepts: ['Service Registry: Central database of services', 'Self-registration: Services register themselves', 'Health checks: Verify service availability', 'Client-side discovery: Client queries registry', 'Server-side discovery: Load balancer queries registry'],
    tradeoffs: [['Type', 'Pros', 'Cons'], ['Client-side', 'Simpler, fewer hops', 'Client complexity'], ['Server-side', 'Simpler clients', 'Extra hop, SPOF'], ['DNS-based', 'Universal support', 'TTL caching issues'], ['Consul/Eureka', 'Feature-rich', 'Operational overhead']],
    interview: ['Client-side vs server-side discovery?', 'DNS TTL problems?', 'Self-registration vs registrar?'],
    deepDive: 'Self-registration: Service sends heartbeats, deregisters on shutdown. Registrar pattern: Separate process registers services (Kubernetes does this). Client-side: Ribbon (Netflix) caches registry, load balances locally. Server-side: AWS ELB, Kubernetes Service. DNS-based: Route 53, CoreDNS. Simple but TTL causes stale entries. Consul: Supports both patterns, built-in health checks, key-value store.',
    realWorld: 'Netflix: Eureka for service registry, Ribbon for client-side LB. Kubernetes: etcd + kube-proxy for server-side discovery. HashiCorp Consul: Used by Stripe, Twitch, Criteo. AWS: Cloud Map + App Mesh. Airbnb: SmartStack (custom, now deprecated).',
    gotchas: 'DNS TTL can return stale IPs - use short TTL or SDK. Health checks must match service readiness. Self-registration needs graceful shutdown. Registry must be highly available - use cluster. Client-side discovery needs retry logic for stale entries.'
  },
  disttracing: {
    concepts: ['Trace: Full request journey across services', 'Span: Single operation within a trace', 'Context propagation: Pass trace ID in headers', 'Sampling: Store percentage of traces', 'Correlation ID: Link related requests'],
    tradeoffs: [['Tool', 'Deployment', 'Storage'], ['Jaeger', 'Self-hosted', 'Elasticsearch, Cassandra'], ['Zipkin', 'Self-hosted', 'MySQL, Cassandra'], ['OpenTelemetry', 'Standard', 'Multiple backends'], ['AWS X-Ray', 'Managed', 'AWS']],
    interview: ['Trace vs span vs log?', 'Sampling strategies?', 'OpenTelemetry vs vendor-specific?'],
    deepDive: 'Context propagation: W3C Trace Context standard (traceparent header). Contains: trace-id, parent-id, flags. Sampling: Head-based (decide at start) vs tail-based (decide after). Adaptive sampling: sample more errors. OpenTelemetry: CNCF standard, auto-instrumentation for 10+ languages. Collectors aggregate and export to backends. Jaeger architecture: Client → Agent → Collector → Storage → Query.',
    realWorld: 'Uber: Created Jaeger, traces 1M+ spans/sec. Google: Dapper paper inspired modern tracing. Netflix: Uses OpenTelemetry + custom tools. Lyft: Envoy proxy built-in tracing. Shopify: 1B+ traces/day with OpenTelemetry.',
    gotchas: 'Tracing adds latency - use async reporting. Storage grows fast - set retention policies. Sampling means missing some traces - use adaptive sampling for errors. Instrumentation requires code changes or auto-instrumentation. Trace context must be propagated through all services including async.'
  },
  heartbeatdetect: {
    concepts: ['Push-based: Node sends periodic heartbeats', 'Pull-based: Monitor polls nodes', 'Gossip: Nodes share failure info with peers', 'Phi Accrual: Adaptive threshold based on history', 'SWIM: Scalable Weakly-consistent Infection-style Membership'],
    tradeoffs: [['Mechanism', 'Scalability', 'Accuracy'], ['Push', 'Good', 'Depends on interval'], ['Pull', 'Limited', 'Controlled'], ['Gossip', 'Excellent', 'Eventually consistent'], ['Phi Accrual', 'Good', 'Excellent'], ['SWIM', 'Excellent', 'Good']],
    interview: ['Push vs pull heartbeats?', 'How Cassandra detects failures?', 'False positive in failure detection?'],
    deepDive: 'Push-based: Node → Monitor at fixed interval. Timeout = failure. Simple but noisy networks cause false positives. Phi Accrual (Cassandra): Track heartbeat history, compute probability of failure. Adapts to network conditions. SWIM: Probe random node, if no response ask k others to probe. Scales O(log n). Gossip: Combine with heartbeats, spread failure info peer-to-peer. Consul uses SWIM + gossip. ZooKeeper: Session-based, client maintains ephemeral nodes.',
    realWorld: 'Cassandra: Phi Accrual for accuracy. Consul: SWIM + gossip for scale. ZooKeeper: Session heartbeats with ephemeral nodes. etcd: Raft leader heartbeats. Kubernetes: kubelet node heartbeats to API server.',
    gotchas: 'Heartbeat interval tradeoff: too fast = network overhead, too slow = slow detection. Network partitions cause split-brain - need quorum. Phi Accrual needs history - cold start is tricky. SWIM can have temporary inconsistency. Always have manual override for false positives.'
  },
  commpatterns: {
    concepts: ['Synchronous: Request-response, wait for reply', 'Asynchronous: Fire-and-forget, use queues', 'Choreography: Services react to events independently', 'Orchestration: Central coordinator manages flow', 'Event sourcing: Store events, not current state'],
    tradeoffs: [['Pattern', 'Coupling', 'Complexity'], ['Sync (REST)', 'Tight', 'Simple'], ['Async (Queue)', 'Loose', 'Medium'], ['Choreography', 'Very loose', 'Hard to track'], ['Orchestration', 'Medium', 'Single coordinator'], ['Event Sourcing', 'Loose', 'High']],
    interview: ['When use orchestration vs choreography?', 'Saga pattern for transactions?', 'gRPC vs REST for internal?'],
    deepDive: 'Synchronous: REST (simple, ubiquitous), gRPC (efficient, typed). Use for queries, real-time responses. Asynchronous: Kafka (high throughput), RabbitMQ (flexible routing), SQS (managed). Use for commands, fire-and-forget. Choreography: Services publish events, others react. Good for loose coupling. Hard to understand full flow. Orchestration: Saga orchestrator (Camunda, Temporal) coordinates steps. Clear flow but single point of failure. Event sourcing: Store events, rebuild state. Perfect audit log but complex queries.',
    realWorld: 'Netflix: Mix of sync (REST) and async (Kafka). Uber: gRPC for internal, REST for external. Amazon: Choreography with SNS/SQS. Spotify: Event-driven with Kafka. Airbnb: Temporal for orchestration.',
    gotchas: 'Dont mix sync calls in async flows - defeats purpose. Choreography needs good event design upfront. Orchestrator is SPOF - make it stateless. gRPC needs code generation - adds build complexity. Event sourcing queries need CQRS pattern.'
  },
  cloudcompare: {
    concepts: ['AWS: Market leader (32%), 200+ services, most mature', 'Azure: Enterprise favorite (22%), Office 365 integration', 'GCP: Data/ML leader (10%), Kubernetes native, global network', 'Multi-cloud: Avoid vendor lock-in, best-of-breed', 'Hybrid cloud: On-prem + cloud integration'],
    tradeoffs: [['Provider', 'Strength', 'Consideration'], ['AWS', 'Broadest services, largest community', 'Complexity, cost at scale'], ['Azure', 'Enterprise integration, hybrid', 'Learning curve from AWS'], ['GCP', 'Data/ML, K8s, global network', 'Smaller ecosystem, fewer regions']],
    interview: ['When choose multi-cloud?', 'AWS vs GCP for ML workloads?', 'How migrate between clouds?'],
    deepDive: 'Service mapping: EC2 = Azure VMs = Compute Engine. S3 = Blob Storage = Cloud Storage. Lambda = Functions = Cloud Functions. RDS = Azure SQL = Cloud SQL. Each has unique strengths: AWS (breadth), Azure (enterprise), GCP (data). Multi-cloud strategy: Use Terraform/Pulumi for IaC across clouds. Kubernetes enables portability. Consider data gravity - data transfer costs add up.',
    realWorld: 'Netflix: All-in AWS, built on EC2/S3. Spotify: Google Cloud for data platform. Twitter: GCP for data, AWS for compute. Dropbox: Left AWS for own infra, saved $75M/2yrs. Airbnb: AWS with some GCP. Apple: Google Cloud for iCloud storage.',
    gotchas: 'Multi-cloud adds complexity - most companies are better with one cloud. Service names differ but concepts are same. Data egress costs can be shocking. Reserved instances dont transfer between clouds. Each cloud has unique services worth using.'
  },
  disasterrecovery: {
    concepts: ['RTO: Recovery Time Objective - how long to recover', 'RPO: Recovery Point Objective - acceptable data loss', 'Backup & Restore: Cheapest, slowest recovery', 'Pilot Light: Core systems always on, scale up on demand', 'Warm Standby: Scaled-down full system running', 'Hot Standby: Full active-active, instant failover'],
    tradeoffs: [['Strategy', 'RTO', 'RPO', 'Cost'], ['Backup/Restore', 'Hours', 'Hours', '$'], ['Pilot Light', '10-30 min', 'Minutes', '$$'], ['Warm Standby', 'Minutes', 'Seconds', '$$$'], ['Hot/Active-Active', 'Seconds', 'Near-zero', '$$$$']],
    interview: ['How determine RTO/RPO requirements?', 'Active-active vs active-passive?', 'Testing DR plans?'],
    deepDive: 'Backup & Restore: AWS Backup, S3 cross-region replication. Good for non-critical systems. Pilot Light: Database replicated, minimal compute. Use AWS Launch Templates for quick scale-up. Warm Standby: Route 53 health checks trigger failover. Run at 10-20% capacity. Hot Standby: Global load balancing, multi-region deployments. Netflix Chaos Engineering approach - assume failures will happen.',
    realWorld: 'Netflix: Multi-region active-active, Chaos Monkey testing. Stripe: Hot standby, zero data loss for payments. Banks: Zero RPO mandatory, active-active required. Capital One: AWS multi-region with automated failover. Slack: Cross-region data replication.',
    gotchas: 'DR is insurance - pay now or pay more later. Test DR regularly - untested plans fail. Data sync lag matters for RPO. DNS TTL affects failover time. Stateful services complicate DR significantly.'
  },
  cloudcost: {
    concepts: ['Reserved Instances: 1-3 year commit for 30-72% savings', 'Spot/Preemptible: Unused capacity at 60-90% discount', 'Right-sizing: Match instance size to actual usage', 'Auto-scaling: Scale down during off-peak hours', 'Storage tiering: Move cold data to cheaper storage', 'Savings Plans: Flexible commitment across services'],
    tradeoffs: [['Strategy', 'Savings', 'Flexibility'], ['Reserved', '30-72%', 'Locked in'], ['Spot', '60-90%', 'Can be terminated'], ['Right-size', '20-40%', 'Requires monitoring'], ['Auto-scale', '30-50%', 'Needs architecture support']],
    interview: ['Reserved vs Savings Plans?', 'When use spot instances?', 'How measure cloud waste?'],
    deepDive: 'Reserved Instances: All upfront = more savings. Convertible RIs allow changes. Savings Plans: Compute Savings Plan is most flexible. Spot: Perfect for stateless, fault-tolerant workloads. Use spot-fleet for diversity. Right-sizing: AWS Compute Optimizer, GCP Recommender. Storage: S3 Intelligent-Tiering automates. Lifecycle policies for Glacier. FinOps: Showback/chargeback to teams.',
    realWorld: 'Airbnb: 40% savings with FinOps practices. Lyft: $100M+ saved over 5 years. Spotify: 50% reduction in compute costs. Pinterest: Spot instances for 80% of batch workloads. Netflix: Right-sizing saved millions annually.',
    gotchas: 'Reserved instances need commitment - measure first. Spot interruptions require proper handling. Auto-scaling needs proper metrics. Storage egress costs often overlooked. Tag everything for cost allocation. Review unused resources monthly.'
  },
  awsroadmap: {
    concepts: ['Core services: EC2, S3, RDS, Lambda, VPC, IAM', 'Compute progression: EC2 → Lambda → ECS → EKS', 'Database progression: RDS → DynamoDB → Aurora', 'Networking: VPC → Route 53 → CloudFront → API Gateway', 'Security essentials: IAM → KMS → Secrets Manager → WAF'],
    tradeoffs: [['Learning Path', 'Focus', 'Career Path'], ['Solutions Architect', 'Design, best practices', 'Architecture roles'], ['Developer', 'Code, SDK, CI/CD', 'Backend development'], ['DevOps', 'Automation, IaC', 'Platform engineering'], ['Specialty', 'Deep domain expertise', 'Expert roles']],
    interview: ['Which services to learn first?', 'EC2 vs Lambda decision?', 'VPC design basics?'],
    deepDive: 'Start with compute (EC2 basics, Lambda for serverless), storage (S3 for everything), database (RDS for relational, DynamoDB for NoSQL). Add networking (VPC is foundational), security (IAM is non-negotiable). Then specialize: containers (ECS/EKS), data (Redshift, EMR), ML (SageMaker). Certifications help: Cloud Practitioner → Solutions Architect Associate → Professional or Specialty.',
    realWorld: 'Netflix: Heavy EC2, S3, DynamoDB, CloudFront usage. Airbnb: RDS, ElastiCache, EKS. Stripe: Lambda for event processing. Capital One: All-in on AWS, extensive use of Lambda. Slack: ElastiCache, EKS, extensive VPC design.',
    gotchas: 'Dont try to learn all 200+ services. Focus on 20 core services covering 80% of use cases. Free tier helps for learning. AWS documentation is excellent. Re:Invent videos are great learning resources. Start building - hands-on beats theory.'
  },
  cloudlb: {
    concepts: ['Layer 4 (L4): TCP/UDP load balancing, fastest, protocol-agnostic', 'Layer 7 (L7): HTTP/HTTPS, path routing, header inspection', 'Global: Anycast, multi-region, best for worldwide users', 'Regional: Single region, lower latency for local traffic', 'Internal: Private network only, no public exposure'],
    tradeoffs: [['Type', 'Best For', 'Limitation'], ['L4 (NLB/Network)', 'Low latency, any protocol', 'No content inspection'], ['L7 (ALB/App GW)', 'HTTP routing, WAF', 'Higher latency'], ['Global (CloudFront)', 'Worldwide distribution', 'Cost at scale'], ['Internal', 'Service-to-service', 'No public access']],
    interview: ['ALB vs NLB decision?', 'When use global load balancer?', 'SSL termination where?'],
    deepDive: 'AWS: ALB for HTTP (path routing, host routing), NLB for TCP/UDP (static IP, low latency), GWLB for third-party appliances. Azure: Application Gateway (L7 + WAF), Load Balancer (L4), Front Door (global CDN + LB). GCP: Global HTTP(S) LB (anycast), Network LB (regional L4), Internal LB. SSL termination: at LB reduces backend load but exposes traffic internally. Consider end-to-end encryption for sensitive data.',
    realWorld: 'Netflix: AWS ALB + CloudFront for streaming. Stripe: ALB with WAF for API protection. Uber: GCP Global LB for worldwide coverage. Spotify: Mix of ALB and NLB. Slack: ALB with detailed path routing.',
    gotchas: 'L7 adds latency - measure if it matters. NLB preserves client IP, ALB does not (use X-Forwarded-For). WebSocket needs ALB sticky sessions. Global LB has edge locations limits. Health check tuning is critical - too aggressive causes flapping.'
  },
  netflixstack: {
    concepts: ['Open Connect: Custom CDN with 15,000+ servers in ISP networks', 'ZUUL: API Gateway for routing, filtering, security', 'Eureka: Service discovery with client-side load balancing', 'EVCache: Memcached-based distributed cache', 'Chaos Engineering: Simian Army for fault tolerance testing'],
    tradeoffs: [['Component', 'Technology', 'Why'], ['API Gateway', 'ZUUL → Spring Cloud Gateway', 'Custom needs, performance'], ['Database', 'Cassandra over RDBMS', 'Global scale, availability'], ['Cache', 'EVCache (Memcached)', 'Low latency, proven'], ['Message Queue', 'Kafka', 'High throughput streaming']],
    interview: ['Why Netflix built Open Connect?', 'How Netflix handles failures?', 'Describe Netflix microservices architecture'],
    deepDive: 'Architecture layers: CDN (Open Connect) → Edge (ZUUL) → Mid-tier services → Data stores. Open Connect places servers directly in ISP networks - 95% of traffic. Microservices: 1000+ services, each owned by a team. Resilience: Hystrix circuit breakers, retry with backoff, bulkheads. Data: Cassandra for user data (global), DynamoDB for metadata. Observability: Atlas for metrics, Mantis for stream processing.',
    realWorld: 'Netflix: 200M+ subscribers, 15% of global internet traffic. Open Connect delivers 100+ Tbps during peak. 2 billion API calls/day. Chaos Monkey randomly terminates instances in production. 1B+ hours of video streamed weekly.',
    gotchas: 'Netflix scale is unusual - dont copy everything. Their solutions evolved over 15+ years. Chaos Engineering requires mature monitoring first. Open-source tools (Eureka, ZUUL) are battle-tested. Start with managed services, build custom when needed.'
  },
  netflixapi: {
    concepts: ['Monolith era: Single deployable with shared database', 'Direct access: Clients call microservices directly (N+1 problem)', 'Gateway aggregation: Backend for Frontend pattern', 'GraphQL Federation: Distributed schema ownership', 'Studio API: Domain-driven API design'],
    tradeoffs: [['Era', 'Approach', 'Challenge'], ['Monolith', 'Simple deployment', 'Scaling bottleneck'], ['Direct', 'Service independence', 'Client complexity'], ['Gateway', 'Optimized aggregation', 'Gateway bottleneck'], ['Federation', 'Distributed ownership', 'Schema governance']],
    interview: ['Why move from monolith?', 'Problems with direct service access?', 'Benefits of GraphQL federation?'],
    deepDive: 'Evolution: 2008 monolith → 2012 microservices with direct access → 2014 ZUUL + aggregation layer → 2020 GraphQL Federation. Direct access problems: N+1 calls from mobile clients, client-side complexity. Gateway solution: Server-side aggregation, optimized payloads. GraphQL Federation: Each domain team owns their schema, federated gateway composes. Studio API serves content creation tools with complex data needs.',
    realWorld: 'Netflix: Evolution took 15+ years. No big-bang migration. GraphQL Federation serves Netflix Studio (content creation) where data relationships are complex. Traditional REST still used for streaming. Mobile clients benefit from aggregation layer.',
    gotchas: 'Evolution is gradual, not revolutionary. GraphQL adds complexity - not for every use case. Federation requires governance tooling. Gateway can become bottleneck - need multiple gateways. Keep REST for simple CRUD operations.'
  },
  discordarch: {
    concepts: ['MongoDB era: Simple start, single node limitations', 'Cassandra migration: Distributed, write-optimized', 'Rust data service: Custom layer for optimization', 'ScyllaDB: C++ rewrite of Cassandra, no GC', 'Time-bucketed storage: Messages partitioned by time'],
    tradeoffs: [['Database', 'Pros', 'Cons'], ['MongoDB', 'Simple, flexible', 'Single-node limits'], ['Cassandra', 'Distributed, available', 'GC pauses, tuning'], ['ScyllaDB', 'No GC, fast', 'Newer, less ecosystem']],
    interview: ['Why leave MongoDB?', 'Cassandra GC problems?', 'Why ScyllaDB over Cassandra?'],
    deepDive: 'Growth forced migration: MongoDB hit single-node limits at 100M messages. Cassandra: Distributed, but JVM GC caused p99 latency spikes during compaction. Rust data service: Added caching layer in Rust for hot data. ScyllaDB decision: C++ rewrite of Cassandra, API compatible, no GC pauses. Results: p99 latency 15ms → 5ms, tail latency eliminated.',
    realWorld: 'Discord: 150M+ MAU, trillions of messages stored. Time-bucketed: Messages partitioned by channel + time window. Elixir: WebSocket connections (millions concurrent). Rust: Data services layer. ScyllaDB migration reduced operational complexity.',
    gotchas: 'Start simple (MongoDB is fine initially). Cassandra tuning is complex - GC pauses are real. ScyllaDB is Cassandra-compatible - easier migration. Rust services add performance but complexity. Hot/cold data architecture crucial for cost.'
  },
  redisarch: {
    concepts: ['Single-threaded: Simplicity, no locks, atomic operations', 'Data structures: Strings, Lists, Sets, Hashes, Sorted Sets, Streams', 'Persistence: RDB snapshots, AOF append-only file', 'Sentinel: High availability with automatic failover', 'Cluster: Horizontal scaling with 16384 hash slots'],
    tradeoffs: [['Feature', 'RDB', 'AOF'], ['Performance', 'Faster recovery', 'Slower'], ['Durability', 'Point-in-time', 'Every write'], ['File Size', 'Compact', 'Larger'], ['Recovery', 'Fast', 'Slower rebuild']],
    interview: ['Why single-threaded?', 'RDB vs AOF trade-offs?', 'How does Redis Cluster work?'],
    deepDive: 'Single-threaded simplicity: No locks, no race conditions, predictable latency. I/O threads (6.0+): Multi-threaded network I/O, single-threaded commands. Data structures: Sorted Sets use skiplists for O(log n). Persistence: RDB for backups, AOF for durability (or both). Sentinel: 3+ nodes, quorum-based failover. Cluster: Hash slots assigned to nodes, resharding online.',
    realWorld: 'Twitter: 10K+ Redis instances, timeline cache. GitHub: Session storage, rate limiting. Pinterest: 1000+ Redis instances. Slack: User presence, rate limiting. Instagram: Stories, user sessions. Stack Overflow: Caching layer.',
    gotchas: 'Single-threaded means one slow command blocks all. Large keys are dangerous. Memory is the limit - monitor closely. Cluster resharding is online but impacts latency. Sentinel needs odd number of nodes. Persistence can cause latency spikes.'
  },
  uberstack: {
    concepts: ['H3: Hexagonal hierarchical geospatial indexing', 'Dispatch: Real-time rider-driver matching', 'Surge pricing: Dynamic pricing based on demand', 'Ringpop: Consistent hashing for service discovery', 'Schemaless: MySQL-backed distributed datastore'],
    tradeoffs: [['Component', 'Technology', 'Why'], ['Backend', 'Go', 'Simple, concurrent, fast'], ['RPC', 'gRPC', 'Efficient, typed, streaming'], ['Workflow', 'Cadence (Temporal)', 'Long-running, fault-tolerant'], ['Geo', 'H3', 'Efficient hexagonal grid']],
    interview: ['How does Uber dispatch work?', 'Explain surge pricing architecture', 'Why Go for backend?'],
    deepDive: 'Dispatch: Real-time matching using supply/demand signals. Every driver sends location every 4 seconds. H3: Earth divided into hexagons at multiple resolutions. Efficient for spatial queries (nearby drivers). Surge: ML model predicts demand, adjusts prices to balance supply. Cadence: Workflow engine for long-running processes (trip lifecycle). Data: Schemaless (MySQL + custom layer), Cassandra for high-volume.',
    realWorld: 'Uber: 100M+ MAU, 25M trips/day. 4000+ microservices. H3 open-sourced, used by many companies. Jaeger (tracing) created at Uber. Kafka: 4 trillion messages/day. Multi-datacenter active-active.',
    gotchas: 'Real-time systems require specialized design. Geo-indexing is complex - use established solutions (H3, S2). gRPC needs careful schema evolution. Microservices at this scale require extensive tooling. Start with simpler architecture, evolve as needed.'
  },
  twelvefactor: {
    concepts: ['Codebase: One repo per app, many deploys from same codebase', 'Dependencies: Explicitly declare and isolate dependencies', 'Config: Store config in environment variables', 'Backing services: Treat databases, queues as attached resources', 'Build/Release/Run: Strict separation of stages'],
    tradeoffs: [['Factor', 'Benefit', 'Challenge'], ['Stateless', 'Easy scaling', 'External state management'], ['Port binding', 'Self-contained', 'Service discovery needed'], ['Disposability', 'Fast scaling', 'Graceful shutdown logic'], ['Dev/Prod parity', 'Fewer bugs', 'More infrastructure']],
    interview: ['How handle state in 12-factor app?', 'Why environment variables for config?', 'Explain build/release/run separation'],
    deepDive: 'Stateless processes: Store sessions in Redis, files in S3. No sticky sessions. Port binding: App exports HTTP via port, doesnt rely on webserver injection. Works with containers. Dev/prod parity: Docker Compose locally, same images in prod. Disposability: Fast startup (seconds) and SIGTERM handling. Logs as streams: Write to stdout, let platform aggregate. Admin processes: Run migrations, scripts as one-off pods.',
    realWorld: 'Heroku: Created 12-factor, all apps follow it. Netflix: 12-factor for 1000+ microservices. Spotify: All backend services follow principles. Airbnb: Kubernetes + 12-factor. Every cloud-native app implicitly uses most factors.',
    gotchas: 'Not all factors apply to all apps - use judgment. Config via env vars has limits (large configs). Stateless can be hard for legacy apps. Dev/prod parity requires investment. Some factors overlap with container best practices.'
  },
  sdlcmodels: {
    concepts: ['Waterfall: Sequential phases, no going back', 'Agile: Iterative sprints, continuous feedback', 'V-Model: Testing parallel to development', 'Spiral: Risk-driven, prototypes per iteration', 'Iterative: Repeated refinement cycles'],
    tradeoffs: [['Model', 'Best For', 'Avoid When'], ['Waterfall', 'Fixed requirements, compliance', 'Uncertain scope'], ['Agile', 'Evolving needs, fast delivery', 'Strict contracts'], ['V-Model', 'Safety-critical, testing focus', 'Rapid changes'], ['RAD', 'Quick prototypes', 'Large teams']],
    interview: ['When choose Waterfall over Agile?', 'How does V-Model ensure quality?', 'Agile vs Scrum vs Kanban?'],
    deepDive: 'Waterfall: Requirements → Design → Implementation → Testing → Deployment. Good for construction, hardware. Agile: Sprints (2-4 weeks), daily standups, retrospectives. Scrum adds roles (PO, SM). V-Model: Each development phase has corresponding test phase. Spiral: Plan → Risk analysis → Build → Evaluate. Good for large government projects. Modern: Most teams use hybrid - Agile for development, Waterfall for planning.',
    realWorld: 'Spotify: Squad model (modified Agile). Google: Iterative with continuous deployment. Banks: V-Model for core systems. SpaceX: Waterfall for hardware, Agile for software. Amazon: Two-pizza teams, continuous delivery.',
    gotchas: 'No model fits all projects. Agile can fail without discipline. Waterfall works for stable requirements. V-Model adds overhead for small projects. Consider team size, domain, and regulatory needs.'
  },
  designpatterns: {
    concepts: ['Creational: Object creation mechanisms (Factory, Builder, Singleton)', 'Structural: Object composition (Adapter, Decorator, Facade)', 'Behavioral: Object interaction (Observer, Strategy, Command)', 'Anti-patterns: Common mistakes to avoid (God Object, Spaghetti)'],
    tradeoffs: [['Pattern', 'Use When', 'Avoid When'], ['Singleton', 'Shared resource', 'Need testability'], ['Factory', 'Complex creation', 'Simple constructors'], ['Observer', 'Event-driven', 'Simple callbacks work'], ['Strategy', 'Swap algorithms', 'One algorithm']],
    interview: ['Factory vs Abstract Factory?', 'When use Decorator vs Inheritance?', 'Observer pattern in event systems?'],
    deepDive: 'Factory: Create objects without specifying concrete class. Used in React.createElement, Spring beans. Observer: Publishers notify subscribers of changes. Used in React state, event emitters, RxJS. Strategy: Family of algorithms, interchangeable. Used in payment processors, compression. Decorator: Add behavior dynamically. Used in Python decorators, Java I/O streams. Facade: Simplified interface to complex subsystem. Used in libraries, SDKs.',
    realWorld: 'React: Factory (createElement), Observer (useState). Spring: Factory (beans), Singleton (services). Node.js: Observer (EventEmitter). AWS SDK: Facade pattern. Redux: Command pattern for actions.',
    gotchas: 'Dont force patterns where not needed. Singleton makes testing hard - use DI instead. Over-abstraction is worse than no patterns. Learn patterns but apply judgment. Modern languages have built-in alternatives.'
  },
  tradeoffs: {
    concepts: ['CAP theorem: Consistency, Availability, Partition tolerance - pick 2', 'Latency vs Throughput: Optimize one or balance both', 'Simplicity vs Flexibility: YAGNI vs future-proofing', 'Cost vs Performance: Throw money or optimize code', 'Read vs Write optimization: Denormalize for reads, normalize for writes'],
    tradeoffs: [['Choice', 'Favoring A', 'Favoring B'], ['Consistency/Availability', 'Banks, inventory', 'Social media, caching'], ['SQL/NoSQL', 'Transactions, joins', 'Scale, flexibility'], ['Monolith/Microservices', 'Small team, starting', 'Large team, scale']],
    interview: ['How does CAP affect database choice?', 'When accept eventual consistency?', 'Monolith vs microservices decision?'],
    deepDive: 'CAP: Network partitions happen, so choose CP (consistent but unavailable during partition) or AP (available but potentially stale). PACELC extends: during partition C/A, else latency/consistency. Latency vs throughput: Batching increases throughput, adds latency. Streaming has low latency, lower throughput. Read/write: CQRS separates read/write models. Write-optimized (LSM) vs read-optimized (B-tree).',
    realWorld: 'Amazon: AP for shopping cart (high availability). Banks: CP for transactions. Netflix: Eventually consistent for recommendations. Uber: Real-time needs low latency. Airbnb: Denormalized search, normalized core data.',
    gotchas: 'Trade-offs are context-dependent - no universal answers. Measure before optimizing. Start simple, add complexity as needed. Document decisions (ADRs). Revisit as requirements change.'
  },
  datapipeline: {
    concepts: ['ETL: Extract, Transform, Load - traditional approach', 'ELT: Extract, Load, Transform - modern cloud approach', 'Batch: Process data in scheduled chunks', 'Streaming: Process data in real-time as it arrives', 'Orchestration: Coordinate pipeline steps (Airflow, Dagster)'],
    tradeoffs: [['Approach', 'Pros', 'Cons'], ['ETL', 'Clean data in warehouse', 'Slower, less flexible'], ['ELT', 'Faster, flexible', 'Raw data needs governance'], ['Batch', 'Simple, cost-effective', 'Delayed insights'], ['Streaming', 'Real-time', 'Complex, expensive']],
    interview: ['ETL vs ELT when?', 'Batch vs streaming decision?', 'How handle late data?'],
    deepDive: 'ETL: Transform on dedicated servers before loading. Good when compute is cheaper than storage (pre-cloud). ELT: Load raw data, transform in warehouse (BigQuery, Snowflake). Leverages warehouse compute. Batch: Spark, Hadoop. Schedule with Airflow. Good for daily/hourly jobs. Streaming: Kafka Streams, Flink, Spark Streaming. Use for real-time dashboards, fraud detection. Hybrid: Lambda (batch + stream) or Kappa (stream-only) architectures.',
    realWorld: 'Netflix: 500PB data, ELT with Spark. Uber: Streaming for surge pricing. Airbnb: dbt for transformations. Spotify: Scio (Scala) on Dataflow. LinkedIn: Gobblin for ingestion.',
    gotchas: 'Streaming adds complexity - start with batch. ELT needs data governance for raw data. Airflow DAGs can become complex. Exactly-once is hard - design for at-least-once. Monitor data quality at each stage.'
  },
  datalakehouse: {
    concepts: ['Data Warehouse: Structured data, schema-on-write, fast queries', 'Data Lake: Raw data, schema-on-read, cheap storage', 'Lakehouse: Best of both - ACID on lake, unified analytics', 'Delta Lake: Open-source lakehouse from Databricks', 'Apache Iceberg: Table format with time travel'],
    tradeoffs: [['Type', 'Query Speed', 'Flexibility'], ['Warehouse', 'Fast', 'Limited to structured'], ['Lake', 'Slow', 'Any data type'], ['Lakehouse', 'Good', 'Best of both']],
    interview: ['Data lake vs warehouse decision?', 'What is lakehouse architecture?', 'Delta Lake vs Iceberg?'],
    deepDive: 'Warehouse: Columnar storage, predefined schema. Best for BI, reporting. Examples: Snowflake, BigQuery, Redshift. Lake: Object storage (S3, GCS), Parquet/ORC files. Schema defined at query time. Good for ML, raw data. Lakehouse: Add ACID transactions to lake. Delta Lake adds transaction log. Iceberg adds partition evolution. Time travel: Query data as of specific timestamp.',
    realWorld: 'Databricks: Created Delta Lake, powers lakehouse for Fortune 500. Netflix: Iceberg for 500PB data lake. Uber: BigLake (internal lakehouse). Airbnb: Delta Lake for data mesh. Apple: Iceberg for analytics.',
    gotchas: 'Lakehouse is newer - evaluate maturity. Small files problem on lakes (combine them). Delta/Iceberg need maintenance (compaction). Warehouse still better for pure BI. Consider existing skills and tools.'
  },
  cdcpattern: {
    concepts: ['Log-based CDC: Read database transaction log (WAL/binlog)', 'Query-based CDC: Poll for changes (timestamp, diff)', 'Trigger-based CDC: Database triggers capture changes', 'Debezium: Open-source CDC platform for Kafka', 'Outbox pattern: Write events to outbox table, CDC publishes'],
    tradeoffs: [['Method', 'Impact on Source', 'Reliability'], ['Log-based', 'Zero impact', 'Most reliable'], ['Query-based', 'Query load', 'Can miss changes'], ['Trigger-based', 'Write overhead', 'Reliable but complex']],
    interview: ['Log-based vs query-based CDC?', 'Explain outbox pattern', 'CDC for microservices events?'],
    deepDive: 'Log-based (best): Read Postgres WAL or MySQL binlog. No impact on source DB. Captures all changes including deletes. Debezium connects to DB, publishes to Kafka. Outbox pattern: Service writes domain event to outbox table in same transaction. CDC reads outbox, publishes to Kafka. Guarantees consistency. Use cases: Cache invalidation, search sync, analytics pipeline, microservices integration.',
    realWorld: 'Airbnb: CDC syncs to Elasticsearch. LinkedIn: Databus for CDC at scale. Uber: Marmaray for data lake ingestion. Wix: Debezium for 100+ services. Shopify: CDC for warehouse sync.',
    gotchas: 'Log-based needs DB permissions and config. Schema changes need careful handling. High-volume tables can create lag. Debezium needs Kafka Connect cluster. Test CDC with production-like data volumes.'
  },
  kafkadeep: {
    concepts: ['Producer acks: 0 (fire-forget), 1 (leader), all (replicas)', 'Partitions: Unit of parallelism, ordered within partition', 'Consumer groups: Load balance across consumers', 'Exactly-once: Idempotent producer + transactional', 'Log compaction: Keep latest value per key'],
    tradeoffs: [['Setting', 'Durability', 'Performance'], ['acks=0', 'Low (can lose)', 'Fastest'], ['acks=1', 'Medium', 'Good'], ['acks=all', 'Highest', 'Slower'], ['min.insync.replicas=2', 'Very high', 'Needs 3+ replicas']],
    interview: ['How prevent message loss?', 'Partition count decision?', 'Consumer group rebalancing?'],
    deepDive: 'Producer config: acks=all, enable.idempotence=true, retries=MAX. Broker config: replication.factor=3, min.insync.replicas=2. Consumer: enable.auto.commit=false, process then commit. Partition count: max(throughput/100MB/s, consumer count). Cant decrease later. Log compaction: Keeps latest message per key. Good for state stores. Segment size affects compaction efficiency.',
    realWorld: 'LinkedIn: Created Kafka, 7T+ messages/day. Uber: 4T messages/day, Kafka backbone. Netflix: 700B events/day. Confluent: Kafka creators, enterprise support. Wix: 100K+ topics.',
    gotchas: 'Partition count cant be decreased - start right. acks=all adds latency (measure impact). Consumer lag indicates problems. Dont commit before processing. Monitor under-replicated partitions. Test failure scenarios.'
  },
  searchengine: {
    concepts: ['Crawling: Fetch web pages, respect robots.txt', 'Indexing: Build inverted index from documents', 'Ranking: Score relevance using PageRank, TF-IDF, ML', 'Query processing: Parse, expand, score, rank results', 'Inverted index: Term → list of documents containing term'],
    tradeoffs: [['Component', 'Latency', 'Quality'], ['Index size', 'Smaller faster', 'Larger more complete'], ['Ranking complexity', 'Simple faster', 'Complex more relevant'], ['Freshness', 'Batch cheaper', 'Real-time expensive']],
    interview: ['How does PageRank work?', 'Inverted index vs forward index?', 'How handle typos in search?'],
    deepDive: 'Crawling: BFS from seed URLs, politeness rules, dedup with URL fingerprints. Indexing: Tokenize → Stem → Build posting lists. Lucene is core engine. Ranking: TF-IDF (term frequency × inverse document frequency). BM25 is modern improvement. PageRank for web authority. Modern: ML ranking (LTR) with features. Query: Tokenize, expand (synonyms), score across shards, merge results.',
    realWorld: 'Google: 100B+ pages, 8.5B searches/day. Caffeine for real-time indexing. Bing: Similar scale, different ranking. DuckDuckGo: Privacy-focused, uses Bing index. Elasticsearch: 60%+ of enterprise search.',
    gotchas: 'Crawling at scale is complex - handle rate limits. Index maintenance (deletes, updates) is expensive. Ranking quality needs continuous tuning. Sharding affects result quality. Autocomplete and spell-check are separate systems.'
  },
  elasticsearch: {
    concepts: ['Index: Collection of documents with similar characteristics', 'Shard: Horizontal partition of an index (Lucene index)', 'Replica: Copy of primary shard for HA and read scaling', 'Cluster: Collection of nodes storing data', 'Mapping: Schema definition for document fields'],
    tradeoffs: [['Setting', 'Benefit', 'Cost'], ['More shards', 'Write parallelism', 'Query overhead'], ['More replicas', 'Read scaling, HA', 'Storage, write latency'], ['Larger shards', 'Fewer shards to manage', 'Slower rebalancing']],
    interview: ['Shard sizing rules?', 'Primary vs replica shards?', 'How handle schema changes?'],
    deepDive: 'Shard sizing: 10-50GB each. Max 20 shards per GB heap. Too many shards = overhead. Shards/index = number of primaries. Replica = copy on different node. Write goes to primary, replicates to replica. Query hits all shards, merges results. Mapping: Dynamic (auto-detect) or explicit. Changing mapping needs reindex. Rollover: Time or size-based index rotation.',
    realWorld: 'Wikipedia: Elasticsearch for search. GitHub: Code search with ES. Netflix: Logging with ELK stack. Uber: Driver/rider search. Slack: Message search across workspaces.',
    gotchas: 'Shard count is fixed at index creation. Over-sharding is common mistake. Deep pagination is expensive (use search_after). Mapping explosions with dynamic fields. Monitor cluster health (green/yellow/red). JVM heap sizing is critical.'
  },
  genaistack: {
    concepts: ['Foundation models: GPT-4, Claude, Gemini, Llama, Mistral', 'RAG: Retrieve relevant context, augment prompt, generate', 'Vector database: Store and query embeddings (Pinecone, Weaviate)', 'Fine-tuning: LoRA, QLoRA for domain adaptation', 'Prompt engineering: System prompts, few-shot, chain-of-thought'],
    tradeoffs: [['Approach', 'Pros', 'Cons'], ['RAG', 'Uses your data, no training', 'Retrieval quality matters'], ['Fine-tuning', 'Better for style/format', 'Expensive, needs data'], ['Prompt engineering', 'Quick iteration', 'Context limits'], ['Agents', 'Complex tasks', 'Unpredictable']],
    interview: ['RAG vs fine-tuning decision?', 'How reduce hallucinations?', 'Vector DB selection criteria?'],
    deepDive: 'RAG pipeline: Query → Embed → Vector search → Retrieve chunks → Augment prompt → Generate. Chunk size matters (512-1024 tokens). Embedding models: OpenAI, Cohere, open-source (sentence-transformers). Vector DBs: Pinecone (managed), Weaviate (hybrid search), pgVector (PostgreSQL native). Fine-tuning: LoRA (low-rank adaptation) for efficient training. QLoRA adds quantization. RLHF for behavior alignment.',
    realWorld: 'OpenAI: GPT-4, DALL-E, Whisper. Anthropic: Claude, Constitutional AI. Google: Gemini, PaLM. Meta: Llama (open weights). Perplexity: RAG-based search. GitHub Copilot: Code generation.',
    gotchas: 'Hallucinations are inherent - verify outputs. RAG retrieval quality limits generation quality. Fine-tuning needs quality data. Prompt injection is security risk. Monitor costs - inference adds up. Evaluation is hard - use multiple metrics.'
  },
  // Phase 2: Linux & OS
  linuxboot: {
    concepts: ['BIOS/UEFI: Power-on self-test, hardware initialization', 'MBR/GPT: Master Boot Record or GUID Partition Table locates bootloader', 'GRUB: GRand Unified Bootloader, menu for kernel selection', 'Kernel: vmlinuz loaded with initramfs for initial filesystem', 'systemd: PID 1, manages services and targets'],
    tradeoffs: [['Stage', 'Purpose', 'Failure Impact'], ['BIOS/UEFI', 'Hardware init', 'No boot at all'], ['Bootloader', 'Load kernel', 'Boot menu fails'], ['Kernel', 'Hardware drivers', 'Kernel panic'], ['systemd', 'Services start', 'Partial boot']],
    interview: ['Explain Linux boot process', 'What is initramfs for?', 'How to troubleshoot boot failures?'],
    deepDive: 'BIOS (legacy) vs UEFI (modern): UEFI is faster, supports larger disks (>2TB), Secure Boot. initramfs: Temporary root filesystem in RAM with essential drivers to mount real root. systemd replaces SysVinit: Parallel service startup, socket activation, cgroups. Boot targets: rescue.target (single user), multi-user.target (servers), graphical.target (desktop).',
    realWorld: 'AWS EC2: Uses UEFI on newer instances. Docker: Containers share host kernel. systemd: Used by Ubuntu, RHEL, Debian. CoreOS/Flatcar: Minimal boot for containers. Chrome OS: Verified boot with dm-verity.',
    gotchas: 'GRUB recovery: Hold Shift during boot. Kernel panics: Usually driver issues. systemd-analyze blame shows slow services. journalctl -b for boot logs. UEFI Secure Boot can block unsigned kernels.'
  },
  linuxfs: {
    concepts: ['/: Root of everything', '/bin, /sbin: Essential binaries (ls, cp, mount)', '/etc: System configuration files', '/home: User home directories', '/var: Variable data (logs, mail, spool)', '/tmp: Temporary files, cleared on reboot'],
    tradeoffs: [['Directory', 'Purpose', 'Mounting'], ['/boot', 'Kernel, GRUB', 'Often separate partition'], ['/home', 'User data', 'Often separate for backups'], ['/var', 'Logs, data', 'Separate to prevent root fill'], ['/tmp', 'Temp files', 'Often tmpfs (RAM)']],
    interview: ['Difference between /bin and /usr/bin?', 'Why separate /boot partition?', 'What is in /proc and /sys?'],
    deepDive: 'FHS (Filesystem Hierarchy Standard) defines structure. /proc: Virtual filesystem for process info (cat /proc/cpuinfo). /sys: Kernel and hardware info, sysfs. /dev: Device files (block, character). Modern systems merge /bin→/usr/bin, /lib→/usr/lib. XDG Base Directory: ~/.config, ~/.local/share for user apps.',
    realWorld: 'Docker: Uses overlay filesystem, shares /usr. Kubernetes: Uses emptyDir for /tmp in pods. NixOS: Immutable /nix store. Ubuntu: Uses /snap for snaps. Android: Modified Linux FS layout.',
    gotchas: 'Running out of space in /: Check /var/log. /tmp cleanup: systemd-tmpfiles. Symlinks in /lib and /bin on modern distros. Hidden files in home: .bashrc, .ssh, .config. Space usage: du -sh /* | sort -h.'
  },
  linuxperms: {
    concepts: ['rwx: Read (4), Write (2), Execute (1)', 'User/Group/Other: Three permission sets', 'chmod: Change permissions (755, 644)', 'chown: Change owner (user:group)', 'umask: Default permission mask for new files'],
    tradeoffs: [['Permission', 'Files', 'Directories'], ['r (read)', 'View contents', 'List files'], ['w (write)', 'Modify file', 'Create/delete files'], ['x (execute)', 'Run as program', 'Enter directory']],
    interview: ['Explain 755 vs 644', 'What is sticky bit?', 'How do ACLs extend permissions?'],
    deepDive: 'Special bits: SUID (4000) runs as owner, SGID (2000) runs as group, Sticky (1000) prevents deletion. ACLs (getfacl, setfacl) for fine-grained control. Capabilities: Split root privileges (CAP_NET_BIND_SERVICE). SELinux/AppArmor: Mandatory Access Control beyond DAC. sudo: Temporary privilege escalation.',
    realWorld: 'AWS: EC2 key pairs require 400 permissions. Docker: Often runs as root, security concern. Kubernetes: securityContext for pod permissions. GitHub: SSH keys need 600. Web servers: 755 for directories, 644 for files.',
    gotchas: 'World-writable files are security risk. SSH keys must be 600 or 400. SUID on scripts is dangerous. Root can access despite permissions. umask 022 is typical (files 644, dirs 755).'
  },
  linuxperf: {
    concepts: ['top/htop: Real-time process monitoring', 'vmstat: Virtual memory, CPU, I/O stats', 'iostat: Disk I/O statistics', 'netstat/ss: Network connections and sockets', 'strace: System call tracing', 'perf: CPU profiling and flame graphs'],
    tradeoffs: [['Tool', 'Overhead', 'Detail'], ['top', 'Low', 'Process summary'], ['perf', 'Medium', 'CPU profiling'], ['strace', 'High', 'System calls'], ['eBPF', 'Low', 'Deep tracing']],
    interview: ['How diagnose high CPU usage?', 'Explain load average', 'What is eBPF?'],
    deepDive: 'Load average: 1/5/15 min avg of runnable + waiting processes. Rule: LA < CPU cores is healthy. USE Method (Brendan Gregg): Utilization, Saturation, Errors for each resource. eBPF: Safe kernel tracing without modules. Flame graphs: Visualize CPU time by stack. perf record + perf report for profiling.',
    realWorld: 'Netflix: Uses Vector for time-series metrics. Google: Developed eBPF predecessors. Datadog: Agent uses these tools. AWS: CloudWatch agent uses similar metrics. Brendan Gregg: Created flame graphs, USE method at Netflix.',
    gotchas: 'strace slows applications significantly. top CPU% can exceed 100% (multi-core). vmstat first row is since boot average. Load average ignores I/O on Linux. eBPF requires modern kernel (4.x+).'
  },
  linuxcmds: {
    concepts: ['Navigation: cd, ls, pwd, find', 'File operations: cp, mv, rm, mkdir, touch', 'Text processing: cat, grep, sed, awk', 'System: ps, top, kill, df, du', 'Network: curl, wget, ssh, scp, netstat', 'Permissions: chmod, chown, sudo'],
    tradeoffs: [['Task', 'Command', 'Alternative'], ['Search text', 'grep', 'ripgrep (rg)'], ['Find files', 'find', 'fd, locate'], ['View files', 'cat', 'less, bat'], ['Disk usage', 'du', 'ncdu']],
    interview: ['grep vs awk vs sed?', 'How find large files?', 'Explain pipes and redirection'],
    deepDive: 'Pipes: cmd1 | cmd2 passes stdout to stdin. Redirection: > overwrites, >> appends, 2>&1 combines stderr. xargs: Build commands from stdin. Command substitution: $(command) or `command`. Process substitution: diff <(cmd1) <(cmd2). Job control: bg, fg, &, Ctrl-Z.',
    realWorld: 'DevOps: ssh, rsync, curl daily. Data engineering: awk, sed for ETL. SRE: ps, netstat for debugging. Kubernetes: kubectl exec uses these. CI/CD: Shell scripts use these commands.',
    gotchas: 'rm -rf / is catastrophic (use --no-preserve-root). grep -r can be slow (use ripgrep). find with -exec is slow (use xargs). Quotes matter: single vs double. Always test delete commands with echo first.'
  },
  // Phase 2: API Design
  restbest: {
    concepts: ['Use nouns for resources: /users, /orders', 'HTTP methods: GET (read), POST (create), PUT (replace), PATCH (update), DELETE', 'Status codes: 2xx success, 4xx client error, 5xx server error', 'Versioning: /v1/users or Accept header', 'HATEOAS: Include links for discoverability'],
    tradeoffs: [['Practice', 'Benefit', 'Cost'], ['Pagination', 'Performance', 'Complexity'], ['Versioning', 'Stability', 'Maintenance'], ['HATEOAS', 'Discoverability', 'Verbosity']],
    interview: ['PUT vs PATCH?', 'How handle partial failures?', 'API versioning strategies?'],
    deepDive: 'Pagination: Offset-based (page, limit) vs cursor-based (after). Cursor is better for real-time data. Filtering: ?status=active&sort=-created_at. Sparse fieldsets: ?fields=id,name. Error format: { error: { code, message, details } }. Rate limiting headers: X-RateLimit-Limit, Remaining, Reset.',
    realWorld: 'Stripe: Gold standard REST API, detailed errors. GitHub: Uses hypermedia (HATEOAS). Twilio: Great versioning strategy. Twitter: Rate limit examples. Shopify: Cursor-based pagination.',
    gotchas: 'PUT requires full resource (not partial). DELETE should be idempotent. 404 vs 410 (gone permanently). Avoid verbs in URLs (/createUser is wrong). Cache GET responses, never POST.'
  },
  graphqldeep: {
    concepts: ['Schema: Types, Queries, Mutations, Subscriptions', 'Resolvers: Functions that fetch data for fields', 'DataLoader: Batch and cache to solve N+1', 'Fragments: Reusable field selections', 'Directives: @skip, @include, @deprecated'],
    tradeoffs: [['Feature', 'Benefit', 'Challenge'], ['Single endpoint', 'Simple client', 'Caching harder'], ['Type system', 'Safety', 'Schema evolution'], ['Subscriptions', 'Real-time', 'Stateful connections']],
    interview: ['How solve N+1 problem?', 'GraphQL vs REST performance?', 'Security considerations?'],
    deepDive: 'N+1: Query users, then N queries for each users posts. DataLoader batches into 1 query per tick. Schema design: Use connections for pagination (Relay spec). Persisted queries: Hash queries, send hash instead of full query. Query complexity: Assign cost to fields, limit total cost per query.',
    realWorld: 'GitHub: Full GraphQL API, explorer. Shopify: Storefront API uses GraphQL. Facebook: Created GraphQL for mobile. Netflix: Uses Federated GraphQL. Airbnb: Apollo Federation for 50+ services.',
    gotchas: 'No built-in caching like REST. Deep queries can be expensive (limit depth). File uploads need multipart or separate endpoint. Subscriptions need WebSocket infrastructure. Schema changes can break clients.'
  },
  grpcinternals: {
    concepts: ['Protocol Buffers: Binary serialization format (.proto files)', 'HTTP/2: Multiplexing, header compression, streaming', 'Service definition: Define RPC methods in .proto', 'Code generation: protoc generates client/server stubs', 'Streaming: Unary, server, client, bidirectional'],
    tradeoffs: [['Aspect', 'gRPC', 'REST'], ['Performance', 'Fast (binary)', 'Slower (JSON)'], ['Debugging', 'Harder', 'Easy (curl)'], ['Browser', 'Limited', 'Native']],
    interview: ['Why Protocol Buffers over JSON?', 'Explain streaming types', 'How handle versioning?'],
    deepDive: 'Proto3: Default values not serialized, no required fields. Backward compatibility: Add fields with new numbers, dont remove/reuse. Streaming: Server stream for large responses, bidirectional for chat. gRPC-Web: Browser support via proxy. Deadlines: Set timeouts that propagate through service calls.',
    realWorld: 'Google: Uses gRPC internally for all services. Netflix: gRPC for inter-service. Uber: Migrated to gRPC for performance. Envoy: gRPC load balancing. Kubernetes: API server uses gRPC internally.',
    gotchas: 'Field numbers are forever (dont reuse). Browser support needs grpc-web proxy. Debugging requires special tools (grpcurl). Large messages need chunking. Load balancing needs L7 understanding.'
  },
  gatewaypatterns: {
    concepts: ['Routing: Path-based, header-based routing to services', 'Aggregation: Combine multiple service calls into one response', 'Protocol translation: REST to gRPC, HTTP to WebSocket', 'Cross-cutting: Auth, rate limiting, logging centralized', 'Circuit breaking: Prevent cascade failures'],
    tradeoffs: [['Pattern', 'Benefit', 'Cost'], ['Aggregation', 'Fewer round trips', 'Gateway complexity'], ['Protocol translation', 'Client flexibility', 'Latency'], ['Centralized auth', 'Consistency', 'Single point']],
    interview: ['API Gateway vs Service Mesh?', 'How handle authentication?', 'Gateway performance impact?'],
    deepDive: 'BFF (Backend for Frontend): Separate gateway per client type. GraphQL Gateway: Unified query across services. Edge vs internal gateway: Edge for public, internal for service mesh. Rate limiting: Token bucket at gateway. Request transformation: Add headers, modify body, aggregate responses.',
    realWorld: 'Kong: Open-source gateway, plugin ecosystem. AWS API Gateway: Serverless, Lambda integration. Apigee: Enterprise features, analytics. Netflix Zuul: Edge gateway, now Zuul 2 (non-blocking). Ambassador: Kubernetes-native, Envoy-based.',
    gotchas: 'Gateway is single point of failure. Aggregation adds latency. WebSocket passthrough needs special config. Large request bodies need streaming. Monitor gateway latency separately.'
  },
  proxygwlb: {
    concepts: ['Reverse Proxy: Sits in front of servers, forwards requests', 'Load Balancer: Distributes traffic across servers', 'API Gateway: Full API management (auth, rate limit, transform)', 'L4 vs L7: Transport layer vs application layer', 'Service Mesh: Sidecar proxies for microservices'],
    tradeoffs: [['Type', 'Primary Purpose', 'Complexity'], ['Reverse Proxy', 'Forwarding, SSL', 'Low'], ['Load Balancer', 'Distribution', 'Medium'], ['API Gateway', 'API management', 'High']],
    interview: ['When use each type?', 'L4 vs L7 load balancing?', 'Nginx as all three?'],
    deepDive: 'Nginx: Can be all three depending on config. HAProxy: High-performance L4/L7 LB. Envoy: Modern proxy with observability. L4: Fast, TCP-level (IP + port). L7: Slower, HTTP-level (headers, cookies, paths). Service mesh (Istio): Sidecars handle all cross-cutting concerns.',
    realWorld: 'Cloudflare: Global reverse proxy + CDN. AWS: ALB (L7), NLB (L4), API Gateway. Netflix: Zuul for edge, Ribbon for internal. Google: Front-end servers → GFE proxies. Uber: Custom L7 LB for gRPC.',
    gotchas: 'Dont use API Gateway for simple proxying. L4 cant do HTTP routing. Sticky sessions complicate scaling. Health checks essential for all. Consider failover between regions.'
  },
  graphqladopt: {
    concepts: ['Client-side: GraphQL in browser, wraps REST APIs', 'BFF: Backend for Frontend GraphQL per client', 'Monolithic: Single GraphQL gateway for all services', 'Federation: Each service owns part of the graph', 'Relay: Facebook specification for GraphQL clients'],
    tradeoffs: [['Pattern', 'Team Independence', 'Consistency'], ['Monolithic', 'Low', 'High'], ['Federation', 'High', 'Medium'], ['BFF', 'Medium', 'Low']],
    interview: ['When adopt GraphQL?', 'Federation vs schema stitching?', 'Migration strategy from REST?'],
    deepDive: 'Schema stitching: Merge schemas at gateway. Federation (Apollo): @key, @extends for entity ownership. Supergraph: Composed schema from subgraphs. Gateway: Composes query plan across services. Start monolithic: Extract to federation as services grow. Incremental adoption: Wrap REST APIs with GraphQL layer.',
    realWorld: 'Netflix: Apollo Federation for catalog. Airbnb: Federation with 50+ subgraphs. GitHub: Started monolithic, evaluating federation. Shopify: Monolithic for storefront. Apollo: Created Federation specification.',
    gotchas: 'Federation adds operational complexity. Schema conflicts between teams. Version subgraphs independently. Monitor resolver performance. Gateway becomes critical path.'
  },
  pollwebhook: {
    concepts: ['Polling: Client repeatedly requests for updates', 'Webhooks: Server pushes updates to client endpoint', 'Long polling: Keep request open until update or timeout', 'Retry: Exponential backoff for failed deliveries', 'Signature: HMAC verification for webhook security'],
    tradeoffs: [['Method', 'Real-time', 'Infrastructure'], ['Polling', 'Delayed', 'Simple'], ['Webhooks', 'Instant', 'Needs endpoint'], ['Long polling', 'Near real-time', 'Connection overhead']],
    interview: ['When choose polling vs webhooks?', 'How secure webhooks?', 'Webhook delivery guarantees?'],
    deepDive: 'Webhook security: HMAC signature in header, verify on receive. Idempotency: Send unique ID, receiver deduplicates. Retry: Exponential backoff (1s, 2s, 4s, 8s...). Dead letter: Store failed webhooks for manual retry. Status callbacks: Support 2xx range, retry on 5xx, drop on 4xx (bad config).',
    realWorld: 'Stripe: Webhook events with signatures. GitHub: Webhooks for repo events. Slack: Slash commands use webhooks. Twilio: Status callbacks for SMS. Shopify: Webhooks for order events.',
    gotchas: 'Webhook receivers must respond fast (<5s). HTTPS required for security. Handle duplicate deliveries (idempotent processing). Monitor webhook queue depth. Test with ngrok locally.'
  },
  apilandscape: {
    concepts: ['REST: HTTP + JSON, stateless, resource-oriented', 'GraphQL: Query language, single endpoint, type-safe', 'gRPC: Binary protocol, streaming, high performance', 'WebSocket: Full-duplex persistent connection', 'Webhooks: Event-driven push notifications'],
    tradeoffs: [['Protocol', 'Use Case', 'Trade-off'], ['REST', 'Public APIs', 'Over/under-fetching'], ['GraphQL', 'Complex clients', 'Caching complexity'], ['gRPC', 'Microservices', 'Browser support'], ['WebSocket', 'Real-time', 'Stateful']],
    interview: ['How choose between protocols?', 'Can they coexist?', 'Future of API protocols?'],
    deepDive: 'Decision matrix: External → REST (ubiquitous). Mobile with varying needs → GraphQL. Service-to-service high perf → gRPC. Real-time bidirectional → WebSocket. Event notifications → Webhooks. Hybrid: REST for public, gRPC internal, WebSocket for real-time. API Gateway can translate between them.',
    realWorld: 'Google: REST (external), gRPC (internal). GitHub: REST and GraphQL side-by-side. Slack: REST + WebSocket for real-time. Discord: REST + WebSocket + gRPC. Stripe: REST primary, webhooks for events.',
    gotchas: 'One size doesnt fit all. REST is still dominant for public APIs. GraphQL requires client investment. gRPC needs infrastructure support. Consider team expertise and tooling.'
  },
  // Phase 2: Real-Time & Communication
  livestream: {
    concepts: ['Capture: Camera/screen → Encoder (OBS, hardware)', 'Ingest: RTMP stream to origin server', 'Transcode: Convert to multiple bitrates/resolutions', 'Package: Segment into HLS/DASH formats', 'Deliver: CDN distributes to edge locations'],
    tradeoffs: [['Protocol', 'Latency', 'Compatibility'], ['RTMP', '1-3s', 'Ingest only'], ['HLS', '6-30s', 'Universal'], ['DASH', '4-20s', 'Standard'], ['WebRTC', '<500ms', 'Limited scale']],
    interview: ['How reduce live stream latency?', 'ABR vs single bitrate?', 'CDN for live vs VOD?'],
    deepDive: 'Adaptive Bitrate Streaming (ABR): Multiple quality levels, client switches based on bandwidth. Segment length affects latency (2-6 seconds typical). Low Latency HLS (LL-HLS): Partial segments, <3s latency. WebRTC for real-time: P2P, sub-second, but limited to ~1000 viewers without SFU. SRT: Secure, UDP-based, low latency ingest.',
    realWorld: 'Twitch: RTMP ingest, HLS delivery, <3s low latency mode. YouTube Live: DASH + LL-DASH. Netflix: Not live, but ABR pioneer. Zoom/Meet: WebRTC for video calls. Discord: WebRTC with custom SFU.',
    gotchas: 'Live is harder than VOD (no buffering ahead). RTMP is dying but still used for ingest. WebRTC scaling needs SFU/MCU infrastructure. Test with real network conditions. Monitor stream health (bitrate, keyframes).'
  },
  pushnotify: {
    concepts: ['FCM: Firebase Cloud Messaging for Android/iOS/Web', 'APNs: Apple Push Notification service', 'Web Push: VAPID keys + Service Worker', 'Topic messaging: Subscribe devices to topics', 'Token management: Handle registration and refresh'],
    tradeoffs: [['Platform', 'Reliability', 'Cost'], ['FCM', 'High', 'Free (limits)'], ['APNs', 'High', 'Free'], ['Web Push', 'Medium', 'Free'], ['Custom', 'Variable', 'Higher']],
    interview: ['FCM vs custom solution?', 'How handle token expiration?', 'Notification delivery guarantees?'],
    deepDive: 'Token lifecycle: Device registers → Gets token → App sends to backend → Token refreshes periodically. Priority: High for time-sensitive (uses more battery). Collapsible: Replace previous undelivered. Data vs notification: Data for custom handling, notification for system display. Batching: FCM supports up to 500 tokens per request.',
    realWorld: 'WhatsApp: FCM for Android, APNs for iOS. Slack: All three platforms. Instagram: Heavy push usage for engagement. Uber: Real-time ride updates. Amazon: Order and delivery notifications.',
    gotchas: 'Tokens can become invalid (uninstall, re-register). Rate limits exist (FCM: 1M/minute per project). iOS requires user permission. Web Push needs HTTPS. China blocks FCM (need alternatives).'
  },
  wsdeep: {
    concepts: ['Upgrade: HTTP → WebSocket handshake', 'Frames: Text or binary message format', 'Ping/Pong: Keep-alive heartbeat', 'Close: Graceful termination with status code', 'Reconnection: Exponential backoff strategy'],
    tradeoffs: [['Aspect', 'WebSocket', 'SSE'], ['Direction', 'Bidirectional', 'Server → Client'], ['Protocol', 'Custom', 'HTTP'], ['Reconnect', 'Manual', 'Auto']],
    interview: ['WebSocket vs long polling?', 'How scale WebSocket?', 'When use SSE instead?'],
    deepDive: 'Scaling: Sticky sessions (IP hash) keep connections on same server. Redis Pub/Sub for cross-server broadcast. Connection limit ~65K per IP per server. Heartbeat: 30-60s ping to detect dead connections. Reconnection: Track last message ID, replay on reconnect. Compression: permessage-deflate extension.',
    realWorld: 'Discord: Millions of concurrent connections. Slack: Real-time messaging, presence. Figma: Collaborative cursors, changes. Notion: Real-time collaboration. Trading platforms: Price updates.',
    gotchas: 'Load balancers must support WebSocket upgrade. No auto-reconnect (handle in client). Memory per connection adds up. Timeouts from proxies (increase limits). Test connection handling under failures.'
  },
  // Phase 2: DevOps & CI/CD
  cicdpipe: {
    concepts: ['Plan: Requirements, stories, sprints', 'Code: Version control, branches, PRs', 'Build: Compile, lint, containerize', 'Test: Unit, integration, E2E, security', 'Deploy: Staging → Production with rollback'],
    tradeoffs: [['Stage', 'Speed', 'Safety'], ['Direct deploy', 'Fast', 'Risky'], ['Canary', 'Slower', 'Safe'], ['Blue-green', 'Fast switch', 'Cost (2x infra)']],
    interview: ['CI vs CD vs CD?', 'How achieve fast feedback?', 'Deployment strategies?'],
    deepDive: 'CI (Continuous Integration): Merge code often, auto-build and test. CD (Delivery): Always deploy-ready artifacts. CD (Deployment): Auto-deploy to production. Pipeline stages: Lint → Unit tests → Build → Integration tests → Security scan → Deploy staging → Deploy prod. Feature flags enable trunk-based development.',
    realWorld: 'Amazon: Deploys every 11.7 seconds. Google: Monorepo with 25K+ engineers. Netflix: Full CD with canary analysis. GitHub: Ship to production 20+ times/day. Etsy: Pioneer of continuous deployment.',
    gotchas: 'Slow pipelines kill velocity (target <10 min). Flaky tests erode trust. Feature flags need cleanup. Rollback must be tested regularly. Monitor after every deploy.'
  },
  configiac: {
    concepts: ['Config Management: Manage existing servers (Ansible, Chef, Puppet)', 'IaC: Provision infrastructure (Terraform, Pulumi, CloudFormation)', 'Mutable: Update servers in place', 'Immutable: Replace servers, never update', 'Declarative: Define desired state, tool converges'],
    tradeoffs: [['Tool', 'Approach', 'Learning'], ['Terraform', 'Declarative IaC', 'HCL syntax'], ['Ansible', 'Procedural config', 'YAML, SSH'], ['Pulumi', 'Programming IaC', 'Real languages'], ['CloudFormation', 'AWS native', 'JSON/YAML']],
    interview: ['Terraform vs Ansible use cases?', 'Immutable vs mutable infra?', 'State management in Terraform?'],
    deepDive: 'Terraform: State file tracks resources. Use remote backend (S3) for team. Plan before apply. Modules for reusability. Ansible: Agentless, SSH-based. Playbooks define tasks. Idempotent actions. Good for config drift. Pulumi: TypeScript/Python/Go for infra. Testing with standard tools. CDK: AWS constructs in code.',
    realWorld: 'Netflix: Heavy Terraform, immutable infrastructure. Shopify: Terraform for cloud, Ansible for bare metal. HashiCorp: Created Terraform, used by most. Airbnb: Terraformed AWS accounts. Spotify: Terraform for all cloud resources.',
    gotchas: 'Terraform state is critical - secure it. Drift detection needs regular runs. Config management + IaC often used together. Cloud-specific tools lock you in. Start simple, add complexity as needed.'
  },
  dockerdeep: {
    concepts: ['Docker Client: CLI commands (build, run, push)', 'Docker Daemon: Background service managing containers', 'Registry: Store and distribute images (Docker Hub, ECR)', 'Image layers: Read-only, cached, shared between containers', 'Container: Running instance with writable layer'],
    tradeoffs: [['Base Image', 'Size', 'Security'], ['Alpine', '5MB', 'Minimal attack surface'], ['Debian Slim', '80MB', 'More packages'], ['Ubuntu', '200MB', 'Familiar']],
    interview: ['Image layers and caching?', 'Multi-stage builds?', 'Container vs VM?'],
    deepDive: 'Layers: Each Dockerfile instruction creates layer. Cache invalidation cascades down. Order matters (deps before code). Multi-stage: Build in fat image, copy artifacts to slim. Security: Non-root user, read-only filesystem, no secrets in layers. Runtime: containerd (industry standard), cgroups (resource limits), namespaces (isolation).',
    realWorld: 'Docker: Universal adoption, every company. Kubernetes: Uses containerd runtime. AWS ECS/EKS: Docker images on AWS. Google Cloud Run: Serverless containers. Every CI/CD pipeline uses Docker.',
    gotchas: 'Secrets in build args are visible in history. Large images slow deploys. Alpine has musl (not glibc) issues. Volume mounts for persistence. Prune regularly (docker system prune).'
  },
  gitworkflows: {
    concepts: ['Git Flow: main, develop, feature/, release/, hotfix/', 'GitHub Flow: main + short-lived feature branches', 'Trunk-based: All commits to main, feature flags', 'GitLab Flow: Environment branches (production, staging)', 'Squash merge: Clean history, one commit per feature'],
    tradeoffs: [['Workflow', 'Complexity', 'Release Speed'], ['Git Flow', 'High', 'Slow (planned)'], ['GitHub Flow', 'Low', 'Fast (continuous)'], ['Trunk-based', 'Low', 'Fastest']],
    interview: ['When use Git Flow?', 'Trunk-based prerequisites?', 'How handle hotfixes?'],
    deepDive: 'Git Flow: Good for versioned software (libraries, mobile apps). Long-lived branches, structured releases. GitHub Flow: Simple, merge to main, deploy often. Feature branches short-lived (<day). Trunk-based: Commit to main directly or via short PRs. Feature flags hide incomplete work. Requires strong CI/CD and testing.',
    realWorld: 'Google: Monorepo, trunk-based, 40K commits/day. Facebook: Trunk-based for web. GitHub: GitHub Flow (obviously). Microsoft: Git Flow for Office, trunk-based for Azure. Shopify: Trunk-based + feature flags.',
    gotchas: 'Long-lived branches create merge hell. Feature flags need cleanup. Trunk-based needs fast CI (<10 min). Squash loses detailed history. Choose based on release cadence.'
  },
  // Phase 2: Performance & Monitoring
  webperf: {
    concepts: ['FCP: First Contentful Paint - when first content appears', 'LCP: Largest Contentful Paint - when main content appears', 'CLS: Cumulative Layout Shift - visual stability', 'INP: Interaction to Next Paint - responsiveness', 'TTFB: Time to First Byte - server response time'],
    tradeoffs: [['Metric', 'Target', 'Impact'], ['LCP', '< 2.5s', 'SEO ranking'], ['INP', '< 200ms', 'UX'], ['CLS', '< 0.1', 'Trust']],
    interview: ['Core Web Vitals for SEO?', 'How improve LCP?', 'What causes CLS?'],
    deepDive: 'Core Web Vitals (Google ranking): LCP, INP, CLS. Measure in lab (Lighthouse) and field (RUM). LCP optimization: Optimize hero image, preload critical assets, server-side render. CLS causes: Images without dimensions, dynamic content insertion, web fonts. INP: Reduce JavaScript, break up long tasks, use web workers.',
    realWorld: 'Google: Created Core Web Vitals, uses for ranking. Amazon: 100ms slower = 1% revenue loss. Pinterest: 40% less wait time = 15% more signups. BBC: 10% users lost per second of load. Walmart: 1s faster = 2% conversion.',
    gotchas: 'Lab and field metrics differ. Mobile is usually worse than desktop. Third-party scripts kill performance. Measure real users, not just synthetic. Performance budgets prevent regression.'
  },
  frontendperf: {
    concepts: ['Code splitting: Load only needed JavaScript', 'Lazy loading: Defer offscreen images/components', 'Compression: Brotli/Gzip for text assets', 'Caching: Browser cache + CDN caching', 'Critical CSS: Inline above-fold styles'],
    tradeoffs: [['Technique', 'Benefit', 'Complexity'], ['Code split', 'Smaller bundles', 'Route config'], ['Lazy load', 'Faster initial', 'Loading states'], ['SSR', 'Better FCP', 'Server cost']],
    interview: ['Bundle size reduction strategies?', 'When use SSR vs SSG?', 'Image optimization techniques?'],
    deepDive: 'Code splitting: Dynamic imports, route-based chunking. Bundle analyzer to find issues. Tree shaking: Remove unused exports (ES modules required). Images: WebP/AVIF format, srcset for responsive, lazy loading native. Fonts: Font-display: swap, subset fonts, preload critical. Preconnect: dns-prefetch and preconnect for third-party.',
    realWorld: 'Airbnb: Reduced JS by 50%, improved conversion. Twitter: Moved to lite version for slow networks. Shopify: Optimized images for merchants. Netflix: Custom loading for TV apps. LinkedIn: Lazy loading increased engagement.',
    gotchas: 'Too many chunks hurt performance (waterfall). Lazy loading can cause layout shift. Brotli not supported everywhere. CDN cache invalidation is tricky. Measure real impact, not just bundle size.'
  },
  latencynums: {
    concepts: ['L1 cache: 0.5ns - fastest, on CPU core', 'L2 cache: 7ns - per-core cache', 'Main memory: 100ns - RAM access', 'SSD: 150μs - random read', 'Network: 500μs same DC, 150ms cross-continent'],
    tradeoffs: [['Storage', 'Latency', 'Cost/GB'], ['RAM', '~100ns', '$$$'], ['SSD', '~100μs', '$$'], ['HDD', '~10ms', '$']],
    interview: ['Why cache in memory vs SSD?', 'Network latency factors?', 'How do these affect system design?'],
    deepDive: 'Memory hierarchy: L1 (fastest, smallest) → L2 → L3 → RAM → SSD → HDD → Network. Each level 10-100x slower. Implications: Cache hot data in memory. Sequential access much faster than random. Network round trips dominate most systems. Data locality matters - compute near data.',
    realWorld: 'Google: Jeff Dean created these benchmarks. Redis: Why in-memory matters. CDN: Why edge locations matter. Database indexes: Why B-trees work. Kafka: Why sequential writes are fast.',
    gotchas: 'These numbers are approximate and change with hardware. Focus on orders of magnitude. Network is usually the bottleneck. SSDs have limited writes (wear). Memory bandwidth also matters.'
  },
  latencyreduce: {
    concepts: ['Caching: Memory cache (Redis) for hot data', 'Indexing: Database indexes for fast lookups', 'CDN: Edge caching for static content', 'Async: Queue background work, return fast', 'Connection pooling: Reuse expensive connections'],
    tradeoffs: [['Strategy', 'Complexity', 'Impact'], ['Cache', 'Medium (invalidation)', '10-100x'], ['CDN', 'Low', '2-10x'], ['Async', 'High (eventual)', 'Non-blocking']],
    interview: ['Where to add caching?', 'Trade-off of async processing?', 'How profile latency?'],
    deepDive: 'Priority order: 1) Measure (APM tools) to find bottleneck. 2) Cache most frequent queries. 3) Add missing indexes. 4) Move static assets to CDN. 5) Make slow operations async. 6) Connection pools for DB, HTTP. 7) Data locality (compute near data). Avoid premature optimization.',
    realWorld: 'Netflix: Everything cached at edge. Uber: Async for non-critical paths. LinkedIn: Heavy use of connection pools. Shopify: CDN for all assets. Discord: Distributed caching with Rust.',
    gotchas: 'Measure before optimizing. Cache invalidation is hard. Async adds complexity and failure modes. CDN cold caches are slow. Connection pools have limits.'
  },
  // Phase 2: Advanced Caching
  cacheevict: {
    concepts: ['LRU (Least Recently Used): Evict oldest accessed item - most common', 'LFU (Least Frequently Used): Evict least accessed item - better for hot data', 'FIFO (First In First Out): Simple queue, evict oldest - least accurate', 'SLRU (Segmented LRU): Probation + protected segments - better hit rate', 'TTL (Time To Live): Time-based expiration - for freshness requirements'],
    tradeoffs: [['Policy', 'Pros', 'Cons', 'Used By'], ['LRU', 'Good recency', 'No frequency tracking', 'Redis, Memcached'], ['LFU', 'Hot data stays', 'Cold data stuck', 'Caffeine'], ['SLRU', 'Best hit rate', 'Complex', 'CDNs'], ['TTL', 'Fresh data', 'May evict hot items', 'All caches']],
    interview: ['When use LFU over LRU?', 'How implement O(1) LRU?', 'What is cache pollution?'],
    deepDive: 'LRU implementation: HashMap + doubly-linked list for O(1) get/put/evict. LinkedHashMap in Java. LFU needs min-heap or frequency buckets. SLRU: New items enter probation segment, promoted to protected on second access. Reduces scan resistance. Adaptive policies (ARC, LIRS) auto-tune but add complexity.',
    realWorld: 'Redis: Uses approximated LRU (sampling) for memory efficiency. Caffeine (Java): Uses Window TinyLFU - state of the art. CDNs: Use SLRU variants for better hit rates. MySQL: Uses LRU for buffer pool. Browser: Uses combination of LRU + size.',
    gotchas: 'LRU fails for sequential scans (cache pollution). LFU bad for changing access patterns. TTL alone wastes memory. Approximated LRU trades accuracy for speed. Size-based eviction needed for variable-size items.'
  },
  twoTierCache: {
    concepts: ['L1 (Local): In-process cache - fastest, limited size, no network', 'L2 (Distributed): Redis/Memcached - shared, larger, network hop', 'Write-through: Write to both L1 and L2 together', 'Write-behind: Write L1 immediately, async to L2', 'Cache-aside: Application manages both layers explicitly'],
    tradeoffs: [['Tier', 'Latency', 'Size', 'Consistency'], ['L1 Local', '~100ns', 'MB-GB', 'Per-process only'], ['L2 Redis', '~1ms', 'GB-TB', 'Shared across nodes'], ['Both', 'L1 hit: fast', 'Combined', 'Invalidation needed']],
    interview: ['How invalidate L1 across nodes?', 'When skip L1?', 'Write-through vs write-behind?'],
    deepDive: 'Pattern: Check L1 → Miss → Check L2 → Miss → Database → Populate L2 → Populate L1. Invalidation: Pub/sub for L1 invalidation across nodes. Redis keyspace notifications or dedicated channel. L1 sizing: Small but hot - top 5-10% of data. L2 sizing: Larger, covers working set.',
    realWorld: 'Netflix: Guava L1 + EVCache L2. Facebook: Local cache + Memcached. Twitter: Caffeine L1 + Redis L2. LinkedIn: Couchbase multi-tier. Uber: Local + Redis with geo-awareness.',
    gotchas: 'L1 staleness without proper invalidation. Memory pressure from L1. Thundering herd on L1 miss. Serialization overhead for L2. Monitor both hit rates separately.'
  },
  rediscluster: {
    concepts: ['Redis Sentinel: HA with automatic failover for single master', 'Redis Cluster: Sharding across 16384 hash slots', 'Hash slots: CRC16(key) mod 16384 determines node', 'Master-replica: Each shard has replicas for durability', 'MOVED/ASK: Client redirects for cluster resharding'],
    tradeoffs: [['Mode', 'Scalability', 'Complexity', 'Multi-key Ops'], ['Sentinel', 'Vertical only', 'Low', 'Full support'], ['Cluster', 'Horizontal', 'High', 'Hash tags only'], ['Single', 'Limited', 'Lowest', 'Full support']],
    interview: ['How handle cluster failover?', 'What are hash tags?', 'Cross-slot operations?'],
    deepDive: 'Sentinel: 3+ sentinels monitor master. Quorum-based failover (usually 2). Promotes replica to master. Cluster: Slots 0-16383 distributed across masters. Hash tags: {user}:profile and {user}:orders same slot. MOVED: permanent redirect. ASK: temporary during migration. Gossip protocol for node discovery.',
    realWorld: 'Instagram: Redis Cluster with 500+ nodes. Discord: Custom proxy over Redis Cluster. GitHub: Sentinel for HA. Pinterest: Cluster for recommendation cache. Twitch: Cluster for chat state.',
    gotchas: 'Cluster: No multi-key ops across slots (use hash tags). Sentinel: Manual resharding. Split-brain without proper quorum. Memory fragmentation. Lua scripts limited in cluster mode.'
  },
  // Phase 2: Architecture Patterns
  hapatterns: {
    concepts: ['Hot-Hot (Active-Active): Both DCs serve traffic, best availability', 'Hot-Warm (Active-Passive): Standby DC for failover only', 'RTO (Recovery Time Objective): Max acceptable downtime', 'RPO (Recovery Point Objective): Max acceptable data loss', 'Failover: Automatic switch to healthy instance/DC'],
    tradeoffs: [['Pattern', 'Cost', 'RTO', 'Complexity'], ['Hot-Hot', 'Highest', 'Seconds', 'Data sync hard'], ['Hot-Warm', 'Medium', 'Minutes', 'Moderate'], ['Hot-Cold', 'Lowest', 'Hours', 'Simplest']],
    interview: ['RTO vs RPO trade-offs?', 'How achieve zero RTO?', 'CAP implications for HA?'],
    deepDive: 'Hot-Hot: Both sites fully operational. Requires data replication (sync or async). Conflict resolution for writes (last-write-wins, CRDT, or version vectors). DNS or global load balancer for traffic. Hot-Warm: Replicate data continuously, but standby not serving. Faster failover than cold, cheaper than hot-hot.',
    realWorld: 'Netflix: Active-active across 3 AWS regions. Google: Active-active globally. Stripe: Active-passive for payment processing (consistency). AWS: Multi-AZ for RDS. Shopify: Active-active with regional routing.',
    gotchas: 'Active-active write conflicts need resolution strategy. Failover testing is critical (chaos engineering). DNS failover has TTL delays. Data replication lag affects RPO. Cost grows with redundancy level.'
  },
  archpatterns: {
    concepts: ['Microkernel: Core + plugins (browsers, IDEs)', 'Space-Based: In-memory data grid for extreme scale', 'Pipe-Filter: Data transformation pipeline (Unix, ETL)', 'Event-Driven: Async events decouple components', 'Hexagonal (Ports-Adapters): Business logic isolated from infra'],
    tradeoffs: [['Pattern', 'Best For', 'Complexity', 'Scalability'], ['Microkernel', 'Extensibility', 'Medium', 'Limited'], ['Space-Based', 'Extreme scale', 'Very High', 'Excellent'], ['Pipe-Filter', 'Data processing', 'Low', 'Good'], ['Event-Driven', 'Decoupling', 'High', 'Very Good']],
    interview: ['When use space-based?', 'Microkernel examples?', 'Event-driven vs request-response?'],
    deepDive: 'Microkernel: Core system + plugin modules. Plugin interface defines contracts. Examples: VS Code, Eclipse, WordPress. Space-Based: Tuple spaces, processing units with in-memory data. No central database bottleneck. GigaSpaces, Hazelcast. Pipe-Filter: Unix pipes, Apache Beam, Kafka Streams.',
    realWorld: 'Eclipse: Microkernel with OSGi plugins. eBay: Space-based for flash sales. Netflix: Pipe-filter for video encoding. Uber: Event-driven for ride matching. Various: Hexagonal in DDD projects.',
    gotchas: 'Microkernel plugin compatibility/versioning. Space-based: Memory costs, eventual consistency. Pipe-filter: Ordering guarantees. Event-driven: Event sourcing complexity. Choose based on specific requirements.'
  },
  faulttolerant: {
    concepts: ['Redundancy: Multiple instances eliminate single points of failure', 'Isolation: Bulkheads prevent cascade failures', 'Graceful Degradation: Reduced functionality over total failure', 'Fast Recovery: Minimize MTTR with automation', 'Chaos Engineering: Test failures in production'],
    tradeoffs: [['Principle', 'Benefit', 'Cost'], ['Redundancy', 'No SPOF', 'Resources, sync'], ['Isolation', 'Blast radius', 'Complexity'], ['Degradation', 'Partial service', 'Feature flags'], ['Recovery', 'Lower MTTR', 'Automation effort']],
    interview: ['Design for N+1 redundancy?', 'How isolate failures?', 'Graceful degradation examples?'],
    deepDive: 'Six principles: 1) Redundancy at every layer. 2) Bulkhead isolation (separate pools, regions). 3) Circuit breakers for external calls. 4) Timeouts and retries with backoff. 5) Health checks and self-healing. 6) Monitoring and alerting. Defense in depth - multiple mechanisms.',
    realWorld: 'Netflix: Chaos Monkey, Simian Army. AWS: Availability Zones isolation. Google: N+2 redundancy standard. Stripe: Graceful degradation in payment flow. Amazon: Cell-based architecture.',
    gotchas: 'Testing failures is hard (but essential). Redundancy doesn\'t help correlated failures. Retries can cause thundering herd. Too many fallbacks mask real issues. Document failure modes explicitly.'
  },
  solidprinciples: {
    concepts: ['SRP: Single Responsibility - one reason to change', 'OCP: Open-Closed - extend without modifying', 'LSP: Liskov Substitution - subtypes replaceable', 'ISP: Interface Segregation - small specific interfaces', 'DIP: Dependency Inversion - depend on abstractions'],
    tradeoffs: [['Principle', 'Benefit', 'Risk If Ignored'], ['SRP', 'Maintainable', 'God classes'], ['OCP', 'Extensible', 'Modification ripples'], ['LSP', 'Polymorphism', 'Unexpected behavior'], ['ISP', 'Decoupled', 'Fat interfaces'], ['DIP', 'Testable', 'Tight coupling']],
    interview: ['SRP violation signs?', 'OCP with strategy pattern?', 'DIP in layered architecture?'],
    deepDive: 'SRP: Class should have one actor to serve. Split by business capability. OCP: Use inheritance, composition, or plugins. Strategy/Template patterns. LSP: Preconditions cannot be strengthened. Rectangle/Square problem. ISP: Many small interfaces > one large. Role interfaces. DIP: High-level modules don\'t depend on low-level.',
    realWorld: 'Spring Framework: DIP with IoC container. React: SRP with component composition. AWS SDK: ISP with service-specific clients. Plugin systems: OCP everywhere. Payment processors: LSP for processor interface.',
    gotchas: 'Over-engineering with too many abstractions. SRP doesn\'t mean one method per class. LSP is about behavior, not syntax. Interface explosion from ISP. DIP adds indirection overhead.'
  },
  // Phase 2: Messaging
  kafkausecases: {
    concepts: ['Log Aggregation: Collect logs from services centrally', 'Stream Processing: Real-time analytics with Kafka Streams', 'Event Sourcing: Store events as source of truth', 'CDC (Change Data Capture): Database changes to Kafka', 'Metrics Pipeline: Collect and process system metrics'],
    tradeoffs: [['Use Case', 'Latency', 'Volume', 'Ordering'], ['Log aggregation', 'Seconds OK', 'Very high', 'Per-source'], ['Stream processing', 'Sub-second', 'High', 'Per-partition'], ['Event sourcing', 'Low', 'Medium', 'Strict per-entity'], ['CDC', 'Near real-time', 'Medium', 'Strict per-table']],
    interview: ['Kafka vs RabbitMQ for logs?', 'CDC implementation?', 'Stream processing frameworks?'],
    deepDive: 'Log aggregation: Filebeat → Kafka → ELK/Splunk. Buffering for bursty logs. Stream processing: Kafka Streams, Flink, Spark Streaming. Windowed aggregations. CDC: Debezium captures DB changes. Outbox pattern for transactional messaging. Event sourcing: Events = source of truth, derive state.',
    realWorld: 'LinkedIn: Log aggregation at scale (origin of Kafka). Uber: Real-time pricing with Kafka Streams. Shopify: CDC for data warehouse sync. Netflix: Metrics pipeline with Kafka. Walmart: Event sourcing for inventory.',
    gotchas: 'Log volume can explode costs. CDC schema evolution challenges. Event sourcing adds complexity. Stream processing exactly-once is hard. Partition count affects parallelism.'
  },
  cloudmsgpatterns: {
    concepts: ['Async Request-Reply: Reply to temp queue, correlate with ID', 'Claim Check: Store large payload separately, pass reference', 'Priority Queue: Multiple queues with consumers prioritized', 'Competing Consumers: Multiple workers share queue load', 'Message Deduplication: Handle duplicate deliveries idempotently'],
    tradeoffs: [['Pattern', 'Problem Solved', 'Complexity'], ['Async Reply', 'Long operations', 'Correlation tracking'], ['Claim Check', 'Large messages', 'External storage'], ['Priority Queue', 'SLA differentiation', 'Multiple queues'], ['Competing Consumers', 'Scale processing', 'Message ordering']],
    interview: ['Implement priority queue?', 'Handle large payloads?', 'Deduplication strategies?'],
    deepDive: 'Async Reply: Correlation ID links request/response. Temporary queues or polling. Claim Check: Azure Blob + message reference. S3 presigned URLs. Priority: Separate high/medium/low queues. Weight-based consumption. Deduplication: Message ID + idempotency key. TTL on dedup window.',
    realWorld: 'Azure: Native patterns in Service Bus. AWS: SQS + S3 for claim check. Stripe: Priority queues for payment webhooks. Shopify: Competing consumers for order processing. Google: Pub/Sub deduplication.',
    gotchas: 'Async reply timeout handling. Claim check storage lifecycle. Priority inversion (starving low priority). Competing consumers lose ordering. Dedup window sizing trade-offs.'
  },
  kafka101: {
    concepts: ['Broker: Kafka server storing partitions', 'Topic: Logical channel for messages, divided into partitions', 'Partition: Ordered, immutable log - unit of parallelism', 'Producer: Writes to topic partitions', 'Consumer Group: Coordinated consumers sharing partitions'],
    tradeoffs: [['Component', 'Scale Factor', 'Bottleneck'], ['Brokers', 'Horizontal', 'Disk, network'], ['Partitions', 'Parallelism', 'Memory per partition'], ['Consumers', 'Per partition', 'One per partition max'], ['Producers', 'Unlimited', 'Broker throughput']],
    interview: ['Partition assignment?', 'Consumer rebalancing?', 'Why immutable log?'],
    deepDive: 'Architecture: Producers → Brokers (Topics/Partitions) → Consumer Groups. Partitions enable parallelism. Replication factor for durability. ZooKeeper (legacy) or KRaft for cluster coordination. Consumer offset tracking for exactly-once semantics.',
    realWorld: 'LinkedIn: Created Kafka, 7T messages/day. Uber: 1M+ messages/second. Netflix: All inter-service communication. Apple: User-facing notifications. Walmart: Transaction processing.',
    gotchas: 'Partition count: Can increase, never decrease. Consumer lag monitoring essential. Broker disk is the bottleneck. Rebalancing causes pause. Message ordering only within partition.'
  },
  // Phase 2: Payment & Security
  creditcardfees: {
    concepts: ['Interchange: Bank-to-bank fee (largest, ~1.5-3%)', 'Assessment: Card network fee (Visa/MC ~0.13%)', 'Processor fee: Payment processor margin', 'MDR: Total Merchant Discount Rate to merchant', 'Chargebacks: Disputed transactions, costly to merchants'],
    tradeoffs: [['Card Type', 'Interchange', 'Reason'], ['Debit', 'Lower (~0.5%)', 'Lower risk'], ['Credit', 'Higher (~2%)', 'Rewards funding'], ['Premium/Rewards', 'Highest (~3%)', 'Rich rewards'], ['B2B/Corporate', 'Very high', 'Extended terms']],
    interview: ['Why debit cheaper?', 'Who sets interchange?', 'How reduce processing costs?'],
    deepDive: 'Flow: Customer pays → Merchant → Processor → Network → Issuing Bank. Interchange: Set by networks (Visa, Mastercard). Varies by card type, MCC, region. EU caps at 0.3%. US has Durbin Amendment for debit. Processors: Square, Stripe add margin on top. Revenue model for payment companies.',
    realWorld: 'Visa/Mastercard: ~$20B+ annual revenue from assessments. Stripe: 2.9% + 30¢ includes all fees. Square: Simplified flat-rate pricing. Costco: Pushed for lower interchange. Amazon: Threatens to drop cards over fees.',
    gotchas: 'Interchange is non-negotiable (set by networks). Chargebacks: $20-100 fee + lost goods. PCI compliance costs. Currency conversion markups. Level 2/3 data for lower B2B rates.'
  },
  paymentgateway: {
    concepts: ['Authorization: Verify funds, get approval code', 'Capture: Actually transfer the funds', 'Settlement: Bank-to-bank fund movement', 'Void: Cancel before capture', 'Refund: Return funds after settlement'],
    tradeoffs: [['Step', 'Timing', 'Reversibility'], ['Auth', 'Instant', 'Voidable'], ['Capture', 'Within 7 days', 'Refundable'], ['Settlement', '1-3 days', 'Chargeback only'], ['Refund', '3-10 days', 'Final']],
    interview: ['Auth vs capture timing?', 'Why delay capture?', 'Idempotency in payments?'],
    deepDive: 'Flow: 1) Customer enters card. 2) Gateway encrypts, sends to processor. 3) Processor routes to network (Visa/MC). 4) Network routes to issuing bank. 5) Bank authorizes. 6) Response back through chain. Auth hold: Reserves funds. Capture: Triggers settlement. Batch settlement typically end of day.',
    realWorld: 'Stripe: Unified auth+capture by default. Uber: Auth on ride start, capture on end. Hotels: Auth at check-in, capture at checkout. Amazon: Auth at order, capture at ship. Gas stations: Auth $1, capture actual amount.',
    gotchas: 'Auth expires (7-30 days). Partial capture allowed. Auth hold frustrates customers (shows as pending). Settlement timing affects cash flow. 3D Secure adds friction but reduces chargebacks.'
  },
  sensitivedata: {
    concepts: ['Encryption at rest: AES-256 for stored data', 'Encryption in transit: TLS 1.3 for network data', 'Key Management: HSM or cloud KMS for key storage', 'RBAC: Role-based access to sensitive data', 'Data Masking: Show partial data (****1234)'],
    tradeoffs: [['Control', 'Security', 'Complexity'], ['Encryption', 'Data protected', 'Key management'], ['RBAC', 'Access control', 'Role explosion'], ['Masking', 'Limit exposure', 'Audit requirements'], ['Tokenization', 'Remove PCI scope', 'Token vault']],
    interview: ['Encryption key rotation?', 'GDPR right to deletion?', 'Tokenization vs encryption?'],
    deepDive: 'Defense in depth: 1) Encrypt at rest (AES-256-GCM). 2) Encrypt in transit (TLS 1.3). 3) Encrypt at application layer for sensitive fields. Key management: Never in code. Use KMS (AWS, GCP, Azure). HSM for highest security. Rotate keys regularly. GDPR: Right to erasure, data portability, consent tracking.',
    realWorld: 'Stripe: Tokenization removes PCI scope for merchants. AWS: KMS with automatic rotation. Slack: Encryption at rest with customer keys. Healthcare: HIPAA BAA requirements. Banking: HSM for all key operations.',
    gotchas: 'Key rotation without downtime is hard. Logs may contain sensitive data. Backup encryption separate from primary. Insider threats need monitoring. Compliance != security.'
  },
  // Phase 2: Database Advanced
  btreedeep: {
    concepts: ['Node structure: Keys + pointers, branching factor ~100', 'Disk-optimized: Node size = page size (4KB-16KB)', 'Height: 3-4 levels for billions of rows', 'Range queries: Leaf nodes linked for sequential scan', 'Write amplification: One write may update multiple pages'],
    tradeoffs: [['Aspect', 'B-Tree', 'LSM-Tree'], ['Read', 'O(log n), single path', 'O(log n), multiple files'], ['Write', 'Random I/O', 'Sequential (faster)'], ['Range', 'Excellent', 'Requires merge'], ['Space', 'Some overhead', 'Space amplification']],
    interview: ['Why B-tree for databases?', 'B-tree vs B+tree?', 'Index bloat causes?'],
    deepDive: 'B+tree (used in DBs): Only leaves have data, internal nodes just keys+pointers. Leaf nodes doubly-linked for range scans. Height = log_B(N) where B = branching factor. With B=100, 3 levels handles 100M rows. Page splits on insert, merge on delete. VACUUM reclaims dead space.',
    realWorld: 'PostgreSQL: B-tree is default index. MySQL InnoDB: Clustered B+tree index. Oracle: B-tree for primary indexes. SQL Server: Clustered and non-clustered B-trees. SQLite: B-tree for everything.',
    gotchas: 'Index bloat from updates/deletes. Page splits cause write amplification. Hot spots on sequential inserts. Covering indexes reduce lookups. Partial indexes save space. REINDEX to rebuild bloated indexes.'
  },
  nosqltypes: {
    concepts: ['Document (MongoDB): JSON-like, flexible schema, nested data', 'Key-Value (Redis, DynamoDB): Simple lookup, fast, limited queries', 'Column-Family (Cassandra, HBase): Wide rows, time-series friendly', 'Graph (Neo4j): Relationships first-class, traversal queries', 'Time-Series (InfluxDB): Optimized for temporal data'],
    tradeoffs: [['Type', 'Query Pattern', 'Schema', 'Example'], ['Document', 'Flexible', 'Schema-less', 'MongoDB'], ['Key-Value', 'Get/Set by key', 'None', 'Redis'], ['Column-Family', 'Wide rows', 'Column-based', 'Cassandra'], ['Graph', 'Traversals', 'Nodes+Edges', 'Neo4j']],
    interview: ['When use document vs relational?', 'Graph DB use cases?', 'Column-family vs row-store?'],
    deepDive: 'Document: Embed related data, avoid joins. Best for content management, catalogs. Key-Value: Caching, session storage, simple lookups. Column-Family: Write-heavy, time-series, IoT. Sparse data efficient. Graph: Social networks, fraud detection, recommendations. Traversals O(relationships) not O(data).',
    realWorld: 'MongoDB: Used by Uber, eBay, Adobe. Redis: Used by Twitter, GitHub, Pinterest. Cassandra: Used by Netflix, Apple, Instagram. Neo4j: Used by NASA, Walmart, Airbnb. DynamoDB: Used by Amazon, Lyft, Redfin.',
    gotchas: 'Document DBs can lead to data duplication. Key-Value limited query flexibility. Column-family updates are expensive. Graph DBs not for simple queries. Choose based on access patterns.'
  },
  starsnowflake: {
    concepts: ['Star Schema: Fact table + denormalized dimension tables', 'Snowflake: Star with normalized dimensions', 'Fact Table: Measurements/metrics (sales, events)', 'Dimension: Descriptive attributes (product, date, customer)', 'Grain: Level of detail in fact table (one row = one sale)'],
    tradeoffs: [['Schema', 'Query Speed', 'Storage', 'Maintenance'], ['Star', 'Faster (fewer joins)', 'More (denormalized)', 'Easier'], ['Snowflake', 'Slower (more joins)', 'Less', 'Harder (updates)'], ['Flat', 'Fastest', 'Most', 'Hardest (duplicates)']],
    interview: ['Star vs snowflake choice?', 'Slowly changing dimensions?', 'Fact table grain?'],
    deepDive: 'Star: Central fact table with foreign keys to dimension tables. Dimensions denormalized for query speed. Snowflake: Dimensions normalized (product → category → department). Saves space, adds joins. SCD Types: Type 1 (overwrite), Type 2 (history rows), Type 3 (previous column). OLAP cubes built on star schemas.',
    realWorld: 'Snowflake (company): Cloud data warehouse, uses star internally. Amazon Redshift: Optimized for star schemas. BigQuery: Nested/repeated fields alternative to star. Tableau: Works best with star schemas. Power BI: Prefers star for performance.',
    gotchas: 'Star schema requires ETL discipline. Snowflake slow for ad-hoc queries. SCD Type 2 explodes dimension size. Grain mistakes cause wrong aggregations. Bridge tables for many-to-many.'
  },
  dbdesign: {
    concepts: ['1NF: Atomic values, no repeating groups', '2NF: 1NF + no partial key dependencies', '3NF: 2NF + no transitive dependencies', 'Primary Key: Unique identifier for each row', 'Foreign Key: Reference to another table\'s primary key'],
    tradeoffs: [['Form', 'Redundancy', 'Query Complexity', 'Write Speed'], ['1NF', 'High', 'Simple', 'Slow (updates)'], ['2NF', 'Medium', 'Medium', 'Medium'], ['3NF', 'Low', 'More joins', 'Fast'], ['BCNF', 'Minimal', 'Complex', 'Fastest writes']],
    interview: ['When denormalize?', 'Surrogate vs natural keys?', 'Index design principles?'],
    deepDive: 'Normal forms prevent anomalies: Insert (can\'t add data without related data), Update (same data in multiple places), Delete (losing data unintentionally). Keys: Surrogate (auto-increment, UUID) vs Natural (email, SSN). Indexes: B-tree default, hash for equality, GIN for arrays, BRIN for sorted. Covering indexes include all columns needed.',
    realWorld: 'OLTP systems: Highly normalized (3NF). OLAP systems: Denormalized (star schema). E-commerce: Products often denormalized for speed. Banking: Strict normalization for integrity. Social media: Mix based on access patterns.',
    gotchas: 'Over-normalization kills read performance. Under-normalization causes update anomalies. UUID PKs can hurt index performance. NULL handling varies by DB. Composite keys complicate ORM mapping.'
  },
  // Phase 3: Developer Resources
  engblogs: {
    concepts: ['Netflix Tech Blog: Microservices, resilience, data engineering', 'Uber Engineering: Real-time systems, ML at scale, maps', 'Cloudflare Blog: Edge computing, security, network performance', 'Meta Engineering: AI/ML, infrastructure, mobile development', 'LinkedIn Engineering: Data infrastructure, search, recommendations'],
    tradeoffs: [['Blog', 'Strength', 'Focus Area'], ['Netflix', 'Distributed systems', 'Streaming, chaos'], ['Uber', 'Real-time systems', 'Maps, pricing'], ['Cloudflare', 'Edge/network', 'CDN, security'], ['Meta', 'Scale patterns', 'AI, mobile'], ['LinkedIn', 'Data engineering', 'Search, graph']],
    interview: ['Which blog for microservices?', 'Best resource for distributed systems?', 'How engineers share knowledge?'],
    deepDive: 'Engineering blogs reveal real production challenges. Netflix pioneered chaos engineering documentation. Uber shares ride-matching algorithms. Cloudflare explains DDoS mitigation. Meta publishes React and infrastructure insights. These blogs are interview gold - they show what companies actually build and value.',
    realWorld: 'Netflix: 100+ deep technical posts. Uber: Open-sourced many tools from blog posts. Cloudflare: Explains internet outages publicly. Stripe: Idempotency keys concept widely adopted. Discord: Scaling WebSocket servers documentation.',
    gotchas: 'Blogs often show idealized versions. Implementation details may be outdated. Not all solutions apply to your scale. Follow multiple companies for balanced view. RSS feeds help track updates.'
  },
  devbooks: {
    concepts: ['The Pragmatic Programmer: Career wisdom, DRY, orthogonality', 'Clean Code: Readable code, naming, functions, SOLID', 'DDIA: Distributed systems, storage engines, consensus', 'Design Patterns: GoF patterns, object-oriented design', 'System Design Interview: Scalability, real-world systems'],
    tradeoffs: [['Book', 'Level', 'Focus'], ['Pragmatic Programmer', 'All levels', 'Mindset'], ['Clean Code', 'Junior-Mid', 'Code quality'], ['DDIA', 'Mid-Senior', 'Distributed systems'], ['Design Patterns', 'Mid', 'OOP patterns'], ['System Design Interview', 'Senior', 'Interview prep']],
    interview: ['Must-read books for engineers?', 'When to read DDIA?', 'How books complement experience?'],
    deepDive: 'Pragmatic Programmer: Timeless principles like DRY and tracer bullets. Clean Code: Controversial but influential on industry standards. DDIA by Martin Kleppmann: Deep dive into how databases and distributed systems actually work. Essential for senior roles.',
    realWorld: 'FAANG interviews often reference DDIA concepts. Clean Code shaped many style guides. Design Patterns vocabulary used daily. Staff engineers cite Pragmatic Programmer. System Design Interview became interview standard.',
    gotchas: 'Books age - check publication dates. Not all advice applies to your stack. Theory differs from practice. One book wont make you expert. Combine with hands-on projects.'
  },
  cspapers: {
    concepts: ['MapReduce: Distributed processing framework, Google 2004', 'Dynamo: Key-value store design, Amazon 2007', 'Raft: Understandable consensus algorithm, 2013', 'Bigtable: Distributed storage system, Google 2006', 'Paxos Made Simple: Consensus explained, Lamport'],
    tradeoffs: [['Paper', 'Impact', 'Difficulty'], ['MapReduce', 'Spawned Hadoop ecosystem', 'Medium'], ['Dynamo', 'Inspired Cassandra, Riak', 'Hard'], ['Raft', 'Replaced Paxos in practice', 'Medium'], ['Bigtable', 'HBase, LevelDB origins', 'Hard'], ['GFS', 'HDFS design basis', 'Medium']],
    interview: ['Key insight from Dynamo paper?', 'Why Raft over Paxos?', 'How papers influence systems?'],
    deepDive: 'Google papers shaped modern infrastructure. MapReduce made distributed computing accessible. Dynamo showed how to build highly available systems with eventual consistency. Raft made consensus understandable and implementable. Reading original papers reveals why systems work the way they do.',
    realWorld: 'Hadoop: Direct MapReduce implementation. Cassandra: Dynamo + Bigtable hybrid. etcd: Uses Raft for consensus. CockroachDB: Spanner paper inspired. Kafka: Based on log-structured storage papers.',
    gotchas: 'Papers assume background knowledge. Academic style can be dense. Implementation differs from paper. Focus on key insights first. Use explanatory blog posts alongside.'
  },
  opensource: {
    concepts: ['First Contribution: Start with good-first-issue labels', 'Code Review: Learn from maintainer feedback', 'Documentation: Often overlooked, high impact', 'Testing: Add tests for existing features', 'Community: Join Discord, Slack, mailing lists'],
    tradeoffs: [['Contribution Type', 'Effort', 'Impact', 'Learning'], ['Bug fixes', 'Medium', 'High', 'Codebase knowledge'], ['Documentation', 'Low', 'High', 'Understanding'], ['Features', 'High', 'Very high', 'Deep expertise'], ['Tests', 'Medium', 'Medium', 'Quality practices'], ['Triage', 'Low', 'Medium', 'Community building']],
    interview: ['Open source contributions?', 'How handle maintainer feedback?', 'OSS project experience?'],
    deepDive: 'OSS contributions demonstrate initiative and collaboration skills. Start small - fix typos, improve docs, add tests. Graduate to bug fixes and features. Maintainer feedback is free senior review. Well-known projects on resume stand out.',
    realWorld: 'React: 1600+ contributors. VS Code: Community-driven features. Kubernetes: Enterprise-backed OSS. Linux kernel: Gold standard. Apache projects: Foundation governance model.',
    gotchas: 'Maintainers are volunteers - be patient. Read contributing guides first. Large PRs hard to review. Understand project roadmap. Some projects have slow response times.'
  },
  softskills: {
    concepts: ['Communication: Clear writing, presentations, 1:1s', 'Collaboration: Code review etiquette, pair programming', 'Time Management: Estimation, prioritization, focus', 'Mentorship: Teaching, receiving feedback, growing others', 'Leadership: Technical decisions, team influence, ownership'],
    tradeoffs: [['Skill', 'Junior Focus', 'Senior Focus'], ['Communication', 'Ask good questions', 'Explain complex topics'], ['Collaboration', 'Accept feedback', 'Give constructive feedback'], ['Time Management', 'Meet deadlines', 'Set realistic timelines'], ['Leadership', 'Own your tasks', 'Own team outcomes']],
    interview: ['Conflict resolution example?', 'How handle disagreement?', 'Leadership without authority?'],
    deepDive: 'Technical skills plateau - soft skills differentiate. Staff+ engineers spend 50%+ time on communication. Influence without authority requires trust-building. Written communication scales better than meetings. Mentorship accelerates career growth both ways.',
    realWorld: 'Amazon: Writing-first culture (6-pagers). Google: Strong code review culture. Netflix: Radical candor feedback. Stripe: Written RFCs for decisions. Microsoft: Growth mindset adoption.',
    gotchas: 'Soft skills take years to develop. Feedback can feel personal. Cultural differences matter. Remote work needs more explicit communication. Over-collaboration slows progress.'
  },
  diagramtools: {
    concepts: ['Mermaid: Text-based, Git-friendly, markdown support', 'Excalidraw: Hand-drawn style, collaborative, simple', 'Draw.io: Feature-rich, many templates, free', 'Lucidchart: Professional, team collaboration, integrations', 'PlantUML: Code-based, UML focused, CI/CD friendly'],
    tradeoffs: [['Tool', 'Best For', 'Weakness'], ['Mermaid', 'Version control', 'Limited styling'], ['Excalidraw', 'Quick sketches', 'Not formal'], ['Draw.io', 'Detailed diagrams', 'Heavy interface'], ['Lucidchart', 'Team collaboration', 'Paid features'], ['PlantUML', 'UML diagrams', 'Learning curve']],
    interview: ['Diagram tool preferences?', 'How document architecture?', 'Version control diagrams?'],
    deepDive: 'Diagram-as-code (Mermaid, PlantUML) enables version control and automation. Excalidraw great for whiteboard sessions. Draw.io/Lucidchart for polished documentation. Choice depends on audience - informal for team, formal for stakeholders.',
    realWorld: 'GitHub: Native Mermaid support in markdown. Notion: Excalidraw embedding. Confluence: Draw.io integration. Google: Proprietary diagramming tools. AWS: Architecture Icons for diagrams.',
    gotchas: 'Too detailed diagrams become unreadable. Keep diagrams updated with code. Different audiences need different detail levels. Auto-generated diagrams often messy. Simple is usually better.'
  },
  codingprinciples: {
    concepts: ['DRY: Dont Repeat Yourself - single source of truth', 'SOLID: Single responsibility, Open-closed, Liskov, Interface segregation, Dependency inversion', 'YAGNI: You Arent Gonna Need It - avoid premature features', 'KISS: Keep It Simple, Stupid - simplicity over complexity', 'Clean Code: Readable, maintainable, testable code'],
    tradeoffs: [['Principle', 'Benefit', 'Danger of Over-applying'], ['DRY', 'Maintainability', 'Wrong abstractions'], ['SOLID', 'Flexibility', 'Over-engineering'], ['YAGNI', 'Faster delivery', 'Missing foresight'], ['KISS', 'Readability', 'Ignoring complexity'], ['Clean Code', 'Team velocity', 'Bikeshedding']],
    interview: ['SOLID in practice?', 'When break DRY?', 'Over-engineering examples?'],
    deepDive: 'Principles are guidelines, not laws. DRY often misapplied - duplication is better than wrong abstraction. SOLID matters most for library/framework code. YAGNI prevents gold-plating. KISS is most important but hardest to follow.',
    realWorld: 'Google: Readability reviews for clean code. Amazon: Two-pizza teams enable SOLID. Basecamp: YAGNI advocates. Linux kernel: KISS for critical paths. Netflix: Principle-driven architecture decisions.',
    gotchas: 'Principles can conflict. Junior devs over-apply DRY. SOLID adds indirection. YAGNI doesnt mean no planning. Context determines which principle matters most.'
  },
  // Phase 3: Developer Roadmaps
  fullstackroad: {
    concepts: ['Frontend: HTML, CSS, JavaScript, React/Vue/Angular', 'Backend: Node.js/Python/Java, REST APIs, databases', 'DevOps: Git, CI/CD, Docker, cloud basics', 'Databases: SQL, NoSQL, caching, query optimization', 'System Design: Scalability, architecture patterns, trade-offs'],
    tradeoffs: [['Path', 'Pros', 'Cons'], ['Frontend First', 'Visual feedback', 'Limited system view'], ['Backend First', 'System understanding', 'Slower visible progress'], ['Full-Stack Bootcamp', 'Fast overview', 'Shallow depth'], ['CS Degree', 'Strong fundamentals', 'Time investment']],
    interview: ['Full-stack project experience?', 'Strongest area?', 'How stay current?'],
    deepDive: 'Full-stack path: HTML/CSS → JavaScript → React → Node.js → SQL → REST APIs → Docker → AWS/GCP basics. T-shaped skills: Broad knowledge, deep in one area. Frontend moving to server (Next.js, Remix). Backend moving to serverless. Both converging.',
    realWorld: 'Startups: Need full-stack flexibility. FAANG: Specialized roles but system knowledge valued. Agencies: Full-stack efficiency. Enterprise: Specialized but cross-functional appreciated.',
    gotchas: 'Jack of all trades, master of none risk. Technology changes fast. Depth matters for senior roles. Dont spread too thin early. Pick specialization after broad exposure.'
  },
  architectroad: {
    concepts: ['Technical Leadership: Design decisions, mentoring, standards', 'System Design: Distributed systems, scalability, reliability', 'Domain Knowledge: Business context, industry patterns', 'Communication: RFCs, presentations, stakeholder management', 'Trade-offs: Cost vs performance, consistency vs availability'],
    tradeoffs: [['Focus', 'Staff Path', 'Manager Path'], ['Technical depth', 'Primary', 'Secondary'], ['People management', 'Indirect', 'Direct'], ['Architecture decisions', 'Hands-on', 'Oversight'], ['Career ceiling', 'IC track', 'Exec track']],
    interview: ['Architecture decision process?', 'How handle technical debt?', 'Cross-team coordination?'],
    deepDive: 'Path: Senior Engineer (5+ years) → Staff (8+ years) → Principal (12+ years). Key transitions: Individual contributor → Technical leader → Organization influencer. Requires: Deep technical expertise, business acumen, communication skills, influence without authority.',
    realWorld: 'Google: Staff/Principal/Distinguished Engineer levels. Amazon: Principal Engineer, Distinguished Engineer. Netflix: Senior Staff, Architect. Stripe: Infrastructure IC track. Meta: E7+ architect responsibilities.',
    gotchas: 'Architect role varies by company. Some architects dont code. Stay hands-on to remain credible. Politics increases at higher levels. Technical debt is your responsibility.'
  },
  securityroad: {
    concepts: ['Application Security: OWASP, secure coding, code review', 'Network Security: Firewalls, IDS/IPS, network segmentation', 'Cloud Security: IAM, encryption, compliance (SOC2, HIPAA)', 'Penetration Testing: Ethical hacking, vulnerability assessment', 'Incident Response: Detection, containment, forensics, recovery'],
    tradeoffs: [['Specialization', 'Demand', 'Entry Difficulty'], ['AppSec', 'Very high', 'Medium (dev background)'], ['Cloud Security', 'Very high', 'Medium'], ['Pen Testing', 'High', 'Hard (certifications)'], ['Security Engineering', 'Very high', 'Medium'], ['GRC', 'High', 'Lower']],
    interview: ['Security vulnerability found?', 'OWASP Top 10?', 'Security in SDLC?'],
    deepDive: 'Path: Developer → Security-focused developer → Application Security Engineer → Security Architect. Certifications: CISSP, OSCP, CEH valuable. DevSecOps integrating security into CI/CD. Cloud security is fastest growing area.',
    realWorld: 'Google: Project Zero, bug bounties. Microsoft: Security Development Lifecycle. Netflix: Security Chaos Engineering. Cloudflare: DDoS protection innovations. Bug bounty: HackerOne, Bugcrowd platforms.',
    gotchas: 'Security is everyone\'s job. Compliance != Security. Zero-day vulnerabilities always exist. Social engineering often easiest attack. Security slows development - balance needed.'
  },
  backendroad: {
    concepts: ['Languages: Python, Java, Go, Node.js, Rust', 'Databases: PostgreSQL, MySQL, MongoDB, Redis', 'APIs: REST, GraphQL, gRPC, WebSockets', 'Infrastructure: Docker, Kubernetes, AWS/GCP/Azure', 'Architecture: Microservices, event-driven, serverless'],
    tradeoffs: [['Language', 'Strength', 'Best For'], ['Python', 'Productivity, ML', 'Startups, data'], ['Java', 'Enterprise, performance', 'Banking, Android'], ['Go', 'Concurrency, simplicity', 'Infrastructure'], ['Node.js', 'JS ecosystem, async', 'Real-time apps'], ['Rust', 'Performance, safety', 'Systems programming']],
    interview: ['Backend language choice?', 'Database selection criteria?', 'Microservices experience?'],
    deepDive: 'Foundation: One language deeply → SQL databases → REST APIs → Authentication → Caching → Message queues → Docker → Cloud. Then: Distributed systems, system design, performance optimization. Language choice matters less than fundamentals.',
    realWorld: 'Netflix: Java, Python. Uber: Go, Java, Python. Stripe: Ruby, Go. Discord: Elixir, Rust. Airbnb: Java, Ruby. Google: C++, Go, Java, Python.',
    gotchas: 'Dont chase languages. Fundamentals transfer. Database knowledge is timeless. Cloud changes fast. Understand the why, not just how.'
  },
  devopsroad: {
    concepts: ['CI/CD: Jenkins, GitHub Actions, GitLab CI, CircleCI', 'Infrastructure as Code: Terraform, Pulumi, CloudFormation', 'Containers: Docker, Kubernetes, container registries', 'Monitoring: Prometheus, Grafana, DataDog, PagerDuty', 'Cloud: AWS, GCP, Azure - compute, storage, networking'],
    tradeoffs: [['Tool Category', 'Popular Choice', 'Alternative'], ['CI/CD', 'GitHub Actions', 'Jenkins, GitLab CI'], ['IaC', 'Terraform', 'Pulumi, CDK'], ['Container Orchestration', 'Kubernetes', 'ECS, Nomad'], ['Monitoring', 'Prometheus+Grafana', 'DataDog'], ['Cloud', 'AWS', 'GCP, Azure']],
    interview: ['CI/CD pipeline design?', 'Infrastructure as Code experience?', 'Incident response process?'],
    deepDive: 'Path: Developer → DevOps Engineer → SRE → Platform Engineer. Linux fundamentals essential. Automation mindset: If you do it twice, script it. GitOps: Infrastructure changes through Git. Platform engineering: Building internal developer platforms.',
    realWorld: 'Google: SRE originated, error budgets. Netflix: Chaos engineering, Spinnaker. Amazon: You build it, you run it. Spotify: Platform teams, Backstage. Uber: Internal platform investments.',
    gotchas: 'DevOps is culture, not tools. Automation takes time investment upfront. Kubernetes complexity often overkill. Cloud costs surprise teams. On-call fatigue is real.'
  },
  // Phase 3: Programming Concepts
  umlclass: {
    concepts: ['Class: Rectangle with name, attributes, methods', 'Association: Line connecting related classes', 'Inheritance: Arrow pointing to parent class', 'Composition: Filled diamond, strong ownership', 'Aggregation: Empty diamond, weak ownership'],
    tradeoffs: [['Relationship', 'Symbol', 'Meaning'], ['Association', 'Plain line', 'Uses/knows about'], ['Dependency', 'Dashed arrow', 'Temporary usage'], ['Inheritance', 'Hollow arrow', 'Is-a relationship'], ['Composition', 'Filled diamond', 'Part-of (lifecycle)'], ['Aggregation', 'Empty diamond', 'Has-a (independent)']],
    interview: ['Composition vs aggregation?', 'When use inheritance?', 'UML in practice?'],
    deepDive: 'UML class diagrams show static structure. Composition: Child dies with parent (Order has LineItems). Aggregation: Child can exist independently (Team has Players). Modern use: Sketch designs, not formal spec. Mermaid/PlantUML make diagrams as code.',
    realWorld: 'Enterprise: Formal UML documentation. Startups: Whiteboard sketches. Architecture reviews: High-level class diagrams. Domain-Driven Design: Bounded context diagrams. API design: Interface definitions.',
    gotchas: 'Full UML rarely used in practice. Keep diagrams high-level. Diagrams go stale quickly. Show important relationships only. Code is the real documentation.'
  },
  paradigms: {
    concepts: ['Imperative: Step-by-step instructions, state changes', 'Object-Oriented: Objects, encapsulation, inheritance, polymorphism', 'Functional: Pure functions, immutability, composition', 'Declarative: What, not how (SQL, HTML, React)', 'Reactive: Data streams, propagation of change'],
    tradeoffs: [['Paradigm', 'Strength', 'Best For'], ['OOP', 'Modeling real-world', 'Business logic, GUI'], ['Functional', 'Predictability', 'Data transformation'], ['Imperative', 'Control flow clarity', 'Performance-critical'], ['Declarative', 'Readability', 'UI, queries'], ['Reactive', 'Async handling', 'Real-time updates']],
    interview: ['Functional vs OOP preference?', 'When use each paradigm?', 'Multi-paradigm examples?'],
    deepDive: 'Most languages are multi-paradigm. JavaScript: All paradigms. Python: OOP + functional. Java: OOP primary, functional added. Functional gaining popularity: Immutability simplifies concurrency. React: Functional components won over classes.',
    realWorld: 'React: Functional components default. Scala: FP on JVM. Haskell: Pure functional. Erlang/Elixir: Actor model. Rust: Multi-paradigm with FP emphasis.',
    gotchas: 'Paradigms are tools, not religions. Pure FP hard in real apps. OOP can lead to complexity. Mix paradigms pragmatically. Understand trade-offs.'
  },
  garbagecollection: {
    concepts: ['Reference Counting: Count references, free when zero', 'Mark and Sweep: Mark reachable, sweep unreachable', 'Generational: Young and old generations, frequent young GC', 'Stop-the-World: Pause application during GC', 'Concurrent GC: Collect while application runs'],
    tradeoffs: [['GC Type', 'Throughput', 'Latency', 'Memory'], ['Serial', 'Low', 'High pauses', 'Low'], ['Parallel', 'High', 'Medium pauses', 'Medium'], ['CMS', 'Medium', 'Low pauses', 'Higher'], ['G1', 'High', 'Predictable', 'Medium'], ['ZGC', 'High', 'Sub-ms pauses', 'Higher']],
    interview: ['GC tuning experience?', 'Memory leak debugging?', 'Generational hypothesis?'],
    deepDive: 'Generational hypothesis: Most objects die young. Young gen collected frequently (minor GC), old gen rarely (major GC). G1: Divides heap into regions, collects garbage-first regions. ZGC: Concurrent, sub-millisecond pauses, scales to TB heaps.',
    realWorld: 'Java: G1 default since Java 9. Go: Low-latency concurrent GC. .NET: Generational with regions. Python: Reference counting + cycle detector. Rust: No GC, ownership model.',
    gotchas: 'GC tuning is often premature optimization. Memory leaks still possible (references held). Stop-the-world can cause latency spikes. Allocation rate affects GC frequency. Understand your GC before tuning.'
  },
  concurrencyparallel: {
    concepts: ['Concurrency: Managing multiple tasks, may not run simultaneously', 'Parallelism: Running multiple tasks at exact same time', 'Thread: OS-level execution unit, shared memory', 'Process: Isolated execution, separate memory space', 'Async/Await: Non-blocking I/O, single thread can handle many tasks'],
    tradeoffs: [['Model', 'Use Case', 'Complexity'], ['Multi-threading', 'CPU-bound parallel work', 'High (race conditions)'], ['Multi-processing', 'CPU-bound, isolation needed', 'Medium (IPC overhead)'], ['Async/Await', 'I/O-bound operations', 'Lower (single thread)'], ['Actor Model', 'Message passing, isolation', 'Medium'], ['CSP (Go)', 'Goroutines + channels', 'Lower']],
    interview: ['Concurrency vs parallelism difference?', 'Race condition handling?', 'Async programming model?'],
    deepDive: 'Concurrency is about structure (dealing with many things). Parallelism is about execution (doing many things). Single core can be concurrent but not parallel. Node.js: Concurrent (async), not parallel (single thread). Go: Concurrent and parallel (goroutines on multiple cores).',
    realWorld: 'Node.js: Event loop concurrency. Go: Goroutines + channels. Java: Thread pools, CompletableFuture. Python: asyncio, multiprocessing. Rust: Fearless concurrency with ownership.',
    gotchas: 'Shared mutable state is the root of all evil. Race conditions are hard to reproduce. Deadlocks from improper locking. Async doesnt mean fast. More threads != more performance.'
  },
  eventloop: {
    concepts: ['Call Stack: Synchronous code execution, LIFO', 'Web APIs: Browser-provided async operations (setTimeout, fetch)', 'Callback Queue: Completed async callbacks waiting', 'Microtask Queue: Promises, higher priority than callbacks', 'Event Loop: Moves callbacks to stack when stack is empty'],
    tradeoffs: [['Queue', 'Contains', 'Priority'], ['Microtasks', 'Promise callbacks, queueMicrotask', 'Highest'], ['Animation', 'requestAnimationFrame', 'High'], ['Macrotasks', 'setTimeout, setInterval, I/O', 'Normal'], ['Idle', 'requestIdleCallback', 'Lowest']],
    interview: ['Event loop explanation?', 'Microtask vs macrotask?', 'How avoid blocking event loop?'],
    deepDive: 'Event loop enables single-threaded async. Steps: 1) Execute sync code on stack. 2) Run all microtasks. 3) Render if needed. 4) Run one macrotask. 5) Repeat. Promise.then always before setTimeout. Long-running sync code blocks everything.',
    realWorld: 'Node.js: libuv event loop, same principles. Browser: UI rendering in event loop. React: Concurrent mode uses scheduler. Web Workers: Separate event loops for parallel work.',
    gotchas: 'Sync code blocks event loop completely. Microtasks can starve macrotasks. setTimeout(0) not immediate. Promise.resolve() schedules microtask. Understand execution order for debugging.'
  },
  cppusecases: {
    concepts: ['Game Engines: Performance-critical rendering, physics', 'Systems Programming: OS kernels, device drivers', 'Embedded Systems: Resource-constrained devices', 'High-Frequency Trading: Microsecond latency requirements', 'Databases: Core engines (MySQL, MongoDB, Redis)'],
    tradeoffs: [['Use Case', 'Why C++', 'Alternative'], ['Games', 'Raw performance, control', 'C#/Unity, Rust'], ['Systems', 'Hardware access, no GC', 'Rust, C'], ['Embedded', 'Small footprint, deterministic', 'C, Rust'], ['HFT', 'Minimal latency', 'FPGA'], ['Browsers', 'Performance + complexity', 'Rust emerging']],
    interview: ['When choose C++?', 'C++ vs Rust comparison?', 'Memory management in C++?'],
    deepDive: 'C++ used where performance is critical and GC pauses unacceptable. Games: Unreal Engine (C++), Unity (C# but core is C++). Browsers: Chrome, Firefox cores in C++. Databases: MySQL, PostgreSQL, MongoDB all have C++ in core. Modern C++ (11/14/17/20) much safer than legacy.',
    realWorld: 'Google: Search infrastructure, Chrome. Meta: Core services. Microsoft: Windows, Office. Adobe: Creative suite. Bloomberg: Trading systems. CERN: Particle physics simulations.',
    gotchas: 'Memory safety issues still common. Build systems are complex. Long compile times. Legacy codebases challenging. Rust is modern alternative for new projects.'
  },
  // Phase 3: Web & Frontend
  cssfundamentals: {
    concepts: ['Box Model: Content, padding, border, margin', 'Flexbox: One-dimensional layouts, alignment', 'Grid: Two-dimensional layouts, rows and columns', 'Specificity: ID > Class > Element selector priority', 'Cascade: Order matters, last rule wins (same specificity)'],
    tradeoffs: [['Layout Method', 'Use Case', 'Complexity'], ['Flexbox', '1D layouts, navigation, cards', 'Low'], ['Grid', '2D layouts, page structure', 'Medium'], ['Float', 'Legacy, text wrapping', 'High (clearfix)'], ['Position', 'Overlays, fixed elements', 'Low'], ['Table', 'Tabular data only', 'Low']],
    interview: ['Flexbox vs Grid choice?', 'CSS specificity calculation?', 'Responsive design approach?'],
    deepDive: 'Modern CSS: Flexbox for components, Grid for page layout. Mobile-first: Start with mobile styles, add breakpoints. CSS Custom Properties (variables) enable theming. BEM naming for maintainability. Utility-first (Tailwind) gaining popularity.',
    realWorld: 'Tailwind CSS: Utility-first revolution. Bootstrap: Component library standard. Material UI: Google design system. Styled Components: CSS-in-JS approach. CSS Modules: Scoped styles.',
    gotchas: 'Specificity wars in large codebases. !important is code smell. Flexbox gaps browser support. Grid support now universal. Performance: Large stylesheets impact load time.'
  },
  oopprinciples: {
    concepts: ['Encapsulation: Hide internal state, expose interface', 'Abstraction: Simplify complex reality with models', 'Inheritance: Reuse code through parent-child relationships', 'Polymorphism: Same interface, different implementations', 'Composition: Build complex objects from simpler ones'],
    tradeoffs: [['Principle', 'Benefit', 'Pitfall'], ['Encapsulation', 'Information hiding', 'Over-protected data'], ['Inheritance', 'Code reuse', 'Deep hierarchies, fragile base'], ['Polymorphism', 'Flexibility', 'Runtime errors if misused'], ['Composition', 'Flexible combination', 'More boilerplate'], ['Abstraction', 'Simplicity', 'Leaky abstractions']],
    interview: ['Composition over inheritance?', 'Polymorphism examples?', 'SOLID principles application?'],
    deepDive: 'Favor composition over inheritance - more flexible, less coupling. Inheritance creates tight coupling and fragile base class problem. Interface-based polymorphism preferred. Encapsulation: Not just private fields, but hiding implementation details. Modern trend: Mix OOP with functional concepts.',
    realWorld: 'Java: Traditional OOP, SOLID focus. Python: Duck typing, less strict OOP. JavaScript: Prototypal inheritance, now class syntax. Go: Composition through embedding, interfaces. Rust: Traits for polymorphism, no inheritance.',
    gotchas: 'Deep inheritance hierarchies are hard to maintain. God objects violate single responsibility. Getters/setters dont mean encapsulation. Anemic domain models miss the point. OOP isnt always the answer.'
  },
  nginxpopular: {
    concepts: ['Event-driven: Handles thousands of connections per worker', 'Reverse Proxy: Load balancing, SSL termination, caching', 'Static Content: Efficient file serving with sendfile', 'Configuration: Declarative config files, hot reload', 'Modularity: Core modules, third-party extensions'],
    tradeoffs: [['Feature', 'Nginx', 'Apache'], ['Architecture', 'Event-driven', 'Process/thread per connection'], ['Concurrency', '10K+ connections', 'Hundreds'], ['Static files', 'Very fast', 'Slower'], ['Dynamic', 'Proxy to app server', 'mod_php embedded'], ['Config', '.conf files', '.htaccess flexibility']],
    interview: ['Why choose Nginx?', 'Nginx vs Apache use cases?', 'Load balancing strategies?'],
    deepDive: 'Nginx handles 10K+ concurrent connections with minimal memory through event-driven architecture. Master process manages worker processes. Each worker handles many connections without blocking. C10K problem solution. Used as reverse proxy in front of application servers.',
    realWorld: 'Netflix: Nginx for edge delivery. Cloudflare: OpenResty (Nginx + Lua). Dropbox: Custom Nginx modules. WordPress: Most common web server. Docker: Default for many container setups.',
    gotchas: 'Not for dynamic content directly (proxy to app). Configuration syntax learning curve. Debugging can be challenging. Module ecosystem smaller than Apache. HTTPS configuration requires attention.'
  },
  // Phase 3: Additional Topics (MISC)
  slacknotify: {
    concepts: ['Webhooks: HTTP POST to Slack URL, simple integration', 'Bot Users: OAuth, interactive messages, commands', 'Real-time Messaging: WebSocket connection for instant updates', 'Block Kit: Rich message formatting with interactive components', 'Events API: Subscribe to workspace events, serverless-friendly'],
    tradeoffs: [['Method', 'Complexity', 'Capabilities'], ['Incoming Webhook', 'Very low', 'Send messages only'], ['Bot User', 'Medium', 'Full interaction'], ['Events API', 'Medium', 'React to events'], ['RTM (deprecated)', 'High', 'Real-time connection'], ['Workflow Builder', 'Low', 'No-code automation']],
    interview: ['Notification system design?', 'Webhook vs bot approach?', 'Rate limiting handling?'],
    deepDive: 'Architecture: Event source → Queue (reliability) → Notification service → Slack API. Webhooks for simple one-way notifications. Bot users for interactive workflows. Block Kit for rich formatting. Rate limits: 1 message/second per channel, burst allowed.',
    realWorld: 'GitHub: PR notifications via webhooks. PagerDuty: Incident alerts with actions. DataDog: Alert notifications. Jira: Issue updates. CI/CD: Build status notifications.',
    gotchas: 'Rate limits can be hit during incidents. Message delivery not guaranteed (queue needed). Rich formatting increases payload size. Bot tokens need secure storage. Channel flooding annoys users.'
  },
  qrlogin: {
    concepts: ['QR Generation: Server creates unique session token in QR', 'Mobile Scan: App scans, authenticates with server', 'Polling/WebSocket: Desktop waits for confirmation', 'Token Exchange: Mobile confirms, desktop gets auth token', 'Security: Short TTL, one-time use, device binding'],
    tradeoffs: [['Aspect', 'QR Login', 'Password'], ['Security', 'Higher (device-bound)', 'Phishing risk'], ['UX', 'Fast if phone ready', 'Typing required'], ['Dependency', 'Needs mobile app', 'Self-contained'], ['Offline', 'Needs both online', 'Works offline'], ['Adoption', 'Familiar pattern', 'Universal']],
    interview: ['QR login security model?', 'How prevent replay attacks?', 'Alternative to QR?'],
    deepDive: 'Flow: 1) Desktop requests login, gets session ID. 2) Session ID encoded in QR. 3) Mobile scans, sends session ID + auth to server. 4) Server validates, marks session authenticated. 5) Desktop poll/WebSocket receives auth token. Security: TTL ~2 min, single use, HTTPS required.',
    realWorld: 'WhatsApp Web: Original popular implementation. Discord: Desktop login. Telegram: Multi-device support. WeChat: Primary login method in China. Banking apps: Transaction confirmation.',
    gotchas: 'QR hijacking possible if displayed on compromised screen. Session fixation if not implemented correctly. Mobile app required. Network connectivity needed. Accessibility concerns for vision-impaired.'
  },
  pinterestgit: {
    concepts: ['Trunk-Based Development: Short-lived branches, frequent merges', 'Feature Flags: Deploy code without enabling features', 'Continuous Deployment: Merge to main triggers deploy', 'Small PRs: Easier review, faster iteration', 'Automated Testing: Gate merges with CI checks'],
    tradeoffs: [['Strategy', 'Pros', 'Cons'], ['Trunk-based', 'Fast integration', 'Needs feature flags'], ['GitFlow', 'Clear releases', 'Complex, slow'], ['GitHub Flow', 'Simple, CI/CD friendly', 'Less structure'], ['Ship/Show/Ask', 'Flexible', 'Requires trust']],
    interview: ['Git branching strategy?', 'Feature flag implementation?', 'CI/CD pipeline design?'],
    deepDive: 'Pinterest approach: Small PRs (under 200 lines), trunk-based development, feature flags for gradual rollout. Ship: Merge directly for small changes. Show: Merge, notify for review. Ask: PR for feedback before merge. Feature flags enable testing in production safely.',
    realWorld: 'Google: Monorepo, trunk-based. Facebook: Mercurial, ship fast. Netflix: Microservices, independent deploys. Stripe: Careful review process. GitHub: Dogfooding GitHub Flow.',
    gotchas: 'Feature flag tech debt accumulates. Trunk-based needs strong CI. Code review bottleneck. Merge conflicts with large teams. Branch naming conventions matter.'
  },
  stackoverflowarch: {
    concepts: ['Monolith: Single .NET application, vertically scaled', 'SQL Server: Primary database, heavily optimized', 'Caching: Redis for hot data, aggressive caching', 'CDN: Static content delivery, edge caching', 'Minimal Services: Two tiers, not microservices'],
    tradeoffs: [['Approach', 'Stack Overflow', 'Typical Startup'], ['Architecture', 'Monolith', 'Microservices rush'], ['Scaling', 'Vertical first', 'Horizontal first'], ['Database', 'Optimize SQL', 'NoSQL for everything'], ['Caching', 'Heavy optimization', 'Add when slow'], ['Team', 'Small, focused', 'Large, specialized']],
    interview: ['Monolith vs microservices?', 'Vertical vs horizontal scaling?', 'Optimization techniques?'],
    deepDive: 'Stack Overflow: 1.3B page views/month with ~9 web servers. Success factors: Aggressive SQL optimization, heavy caching (Redis), CDN for static content, minimal network hops. Proves monoliths can scale when well-optimized. Team of ~50 engineers.',
    realWorld: 'Stack Overflow: 9 servers for 1.3B views. Basecamp: Monolith philosophy. Shopify: Modular monolith. GitHub: Started monolith, gradual extraction. Instagram: Scaled Python monolith to 1B users.',
    gotchas: 'Monolith requires discipline. Team size matters more than architecture. Premature microservices add complexity. Vertical scaling has limits. Optimization requires measurement first.'
  },
  kissprinciple: {
    concepts: ['Simplicity: Fewest moving parts to solve problem', 'Readability: Code explains itself, minimal comments needed', 'Maintainability: Future you can understand it', 'Debugging: Simple code has fewer bugs, easier to fix', 'Pragmatism: Working beats perfect'],
    tradeoffs: [['Choice', 'Simple', 'Complex'], ['Framework', 'Vanilla JS/stdlib', 'Heavy framework'], ['Architecture', 'Monolith', 'Microservices'], ['Data flow', 'Request-response', 'Event sourcing'], ['Storage', 'Single database', 'Polyglot persistence'], ['Deployment', 'Single server', 'Kubernetes']],
    interview: ['Over-engineering example?', 'When is complexity justified?', 'Simple solution that scaled?'],
    deepDive: 'Complexity has ongoing costs: learning curve, debugging difficulty, maintenance burden. Start simple, add complexity only when needed and measured. WhatsApp: 50 engineers, 900M users. Instagram: Scaled Python to 1B users. Complexity is easy to add, hard to remove.',
    realWorld: 'SQLite: 100K websites use it. Redis: Simple data structures, powerful. Go language: Simplicity as feature. Unix philosophy: Do one thing well. Basecamp: Intentionally simple stack.',
    gotchas: 'Simple is not easy. Oversimplification ignores real requirements. Complexity sometimes unavoidable. Team experience affects simple. Context determines appropriate complexity.'
  },
  apiclients: {
    concepts: ['REST Clients: Axios, Fetch, requests - HTTP-based', 'GraphQL Clients: Apollo, Relay, urql - query language', 'SDK/Libraries: Official client libraries from providers', 'Code Generation: OpenAPI, protobuf generate typed clients', 'Retry/Resilience: Built-in retry, circuit breakers'],
    tradeoffs: [['Client Type', 'Pros', 'Cons'], ['Fetch/Axios', 'Lightweight, flexible', 'Manual error handling'], ['Apollo (GraphQL)', 'Caching, DevTools', 'Complexity, bundle size'], ['Generated SDKs', 'Type safety, complete', 'Version coupling'], ['Official SDKs', 'Best practices built-in', 'Vendor lock-in']],
    interview: ['Client library choice criteria?', 'Error handling strategies?', 'Caching approaches?'],
    deepDive: 'Modern API clients: Type safety (TypeScript), automatic retries, request/response interceptors, caching. Fetch API now has most features. Axios popular for interceptors and transforms. Apollo Client for GraphQL with normalized cache. OpenAPI generators create type-safe clients.',
    realWorld: 'Stripe: Best-in-class official SDKs. AWS: SDK for every language. Google: Generated client libraries. Twilio: Helper libraries with examples. GitHub: Octokit official clients.',
    gotchas: 'Bundle size matters for frontend. SDK versions lag API versions. Rate limiting handling needed. Error responses vary by API. Testing requires mocking.'
  },
  semver: {
    concepts: ['MAJOR: Breaking changes, incompatible API changes', 'MINOR: New features, backwards compatible', 'PATCH: Bug fixes, backwards compatible', 'Pre-release: Alpha, beta, rc tags (1.0.0-beta.1)', 'Build metadata: +build.123, ignored in precedence'],
    tradeoffs: [['Strategy', 'Pros', 'Cons'], ['Strict SemVer', 'Clear expectations', 'Frequent major bumps'], ['CalVer', 'Time-based clarity', 'No compatibility info'], ['0.x forever', 'Flexibility', 'No stability signal'], ['Marketing versions', 'Customer-friendly', 'Technical confusion']],
    interview: ['When bump major version?', 'Pre-release versioning?', 'Dependency version strategy?'],
    deepDive: 'SemVer rules: Major for breaking changes, minor for additions, patch for fixes. npm/yarn use semver ranges: ^1.2.3 (minor updates), ~1.2.3 (patch only). Breaking change = anything that requires user code changes. Deprecation before removal in next major.',
    realWorld: 'npm: Semver standard. React: Major for breaking changes. Node.js: Even = LTS, odd = current. Chrome: Marketing version, fast releases. Kubernetes: API versioning (v1, v1beta1).',
    gotchas: 'Semver is social contract, not enforced. Minor versions can break in practice. 0.x means anything can change. Lock files prevent surprises. Test dependency updates.'
  },
  vpnarch: {
    concepts: ['Tunneling: Encapsulate traffic in encrypted tunnel', 'Authentication: Certificates, username/password, MFA', 'Split Tunneling: Route some traffic through VPN, rest direct', 'Protocols: OpenVPN, WireGuard, IPSec, IKEv2', 'Exit Nodes: Where traffic emerges, determines apparent location'],
    tradeoffs: [['Protocol', 'Speed', 'Security', 'Compatibility'], ['WireGuard', 'Fastest', 'Modern crypto', 'Newer'], ['OpenVPN', 'Good', 'Battle-tested', 'Universal'], ['IPSec/IKEv2', 'Fast', 'Enterprise standard', 'Native support'], ['PPTP', 'Fast', 'Broken', 'Legacy only']],
    interview: ['VPN security model?', 'Split tunneling use case?', 'Corporate VPN design?'],
    deepDive: 'VPN creates encrypted tunnel between client and server. All traffic appears to originate from VPN server IP. WireGuard: Modern, fast, simple (4000 lines of code vs OpenVPN 100K+). Corporate VPNs: Access internal resources. Consumer VPNs: Privacy, geo-unblocking.',
    realWorld: 'Cloudflare: WARP (WireGuard-based). NordVPN: WireGuard (NordLynx). Tailscale: WireGuard mesh VPN. Corporate: Cisco AnyConnect, GlobalProtect. AWS: Client VPN, Site-to-Site.',
    gotchas: 'VPN provider sees all traffic. Free VPNs often sell data. Performance overhead varies. DNS leaks expose activity. Corporate VPNs can see personal traffic.'
  },
  memorytypes: {
    concepts: ['Stack: Fast, automatic, fixed size, local variables', 'Heap: Dynamic, manual/GC managed, larger, objects', 'Registers: Fastest, CPU-level, very limited', 'Cache: L1/L2/L3, between CPU and RAM, transparent', 'Virtual Memory: Abstraction layer, enables paging/swapping'],
    tradeoffs: [['Memory Type', 'Speed', 'Size', 'Management'], ['Registers', 'Fastest', 'Bytes', 'Compiler'], ['L1 Cache', 'Very fast', 'KB', 'Hardware'], ['L2/L3 Cache', 'Fast', 'MB', 'Hardware'], ['Stack', 'Fast', 'MB', 'Automatic'], ['Heap', 'Slower', 'GB', 'Manual/GC']],
    interview: ['Stack vs heap allocation?', 'Memory leak causes?', 'Cache-friendly code?'],
    deepDive: 'Stack: LIFO, thread-local, fast allocation (just move pointer). Heap: Random access, shared, fragmentation possible. Cache hierarchy: CPU checks L1 → L2 → L3 → RAM. Cache miss expensive. Locality of reference: Access nearby memory for cache hits.',
    realWorld: 'Game engines: Custom allocators, stack allocation preferred. Databases: Buffer pool management. JVM: Eden, Survivor, Old gen heap regions. Redis: Single-threaded, cache-friendly. High-frequency trading: Lock-free, cache-line aware.',
    gotchas: 'Stack overflow from deep recursion. Heap fragmentation over time. False sharing in multi-threaded code. Large allocations can be slow. Memory leaks crash eventually.'
  },
  internationalpay: {
    concepts: ['SWIFT: Messaging network for bank-to-bank transfers', 'Correspondent Banking: Intermediary banks for international transfers', 'FX Rates: Exchange rates, spreads, markups', 'Settlement: Actual fund movement, 1-5 days', 'ISO 20022: New messaging standard, richer data'],
    tradeoffs: [['Method', 'Speed', 'Cost', 'Reach'], ['SWIFT', '1-5 days', '$25-50', 'Global'], ['Wise/Revolut', 'Hours-1 day', '0.5-1%', 'Most countries'], ['Western Union', 'Minutes', '5-10%', 'Cash pickup'], ['Crypto/Stablecoins', 'Minutes', 'Variable', 'Limited adoption'], ['Local rails', 'Same day', 'Low', 'Regional']],
    interview: ['International payment flow?', 'Why SWIFT is slow?', 'Currency conversion strategies?'],
    deepDive: 'SWIFT flow: Bank A → Correspondent Bank → SWIFT Network → Correspondent Bank → Bank B. Each hop adds delay and fees. Fintech disruption: Wise holds local currency pools, avoids SWIFT for common corridors. Real-time settlement emerging with new rails.',
    realWorld: 'SWIFT: $150 trillion annually. Wise: $9B monthly transfer volume. PayPal: 200+ countries. Stripe: 135+ currencies. Ripple: Blockchain-based SWIFT alternative attempt.',
    gotchas: 'Compliance (AML/KYC) adds delays. Correspondent bank fees hidden. FX markup often buried. Settlement vs authorization timing. Recipient bank fees possible.'
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
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
      
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ margin: '0 auto', padding: '0.75rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="mobile-menu-btn"
            style={{ display: 'none', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fafafa', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            {showMobileSidebar ? '✕' : '☰'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem', fontWeight: 600, textDecoration: 'none', color: 'inherit' }}>
              <span style={{ color: '#22d3ee' }}>◆</span> SystemDesign<span style={{ color: '#22d3ee' }}>.guide</span>
            </a>
            <div className="tab-buttons" style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '8px' }}>
              <button onClick={() => setActiveTab('guides')} style={{ padding: '0.4rem 0.85rem', borderRadius: '6px', border: 'none', background: activeTab === 'guides' ? '#22d3ee' : 'transparent', color: activeTab === 'guides' ? '#09090b' : '#a1a1aa', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>📚 Guides</button>
              <button onClick={() => setActiveTab('roadmap')} style={{ padding: '0.4rem 0.85rem', borderRadius: '6px', border: 'none', background: activeTab === 'roadmap' ? '#22d3ee' : 'transparent', color: activeTab === 'roadmap' ? '#09090b' : '#a1a1aa', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>🗺️ Roadmap</button>
              <button onClick={() => setActiveTab('quiz')} style={{ padding: '0.4rem 0.85rem', borderRadius: '6px', border: 'none', background: activeTab === 'quiz' ? '#22d3ee' : 'transparent', color: activeTab === 'quiz' ? '#09090b' : '#a1a1aa', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>🧠 Quiz</button>
            </div>
          </div>
          {activeTab === 'guides' && (
            <input type="text" placeholder="Search guides..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" style={{ width: 220, padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fafafa', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' }} />
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

          <main className="main-content" style={{ margin: '0 auto', padding: '0 2.5rem 2rem', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2.5rem', position: 'relative', zIndex: 1 }}>
            {/* Mobile category overlay */}
            {showMobileSidebar && (
              <div className="mobile-sidebar-overlay" onClick={() => setShowMobileSidebar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 90 }} />
            )}

            <aside className={`sidebar ${showMobileSidebar ? 'sidebar-open' : ''}`} style={{ position: 'sticky', top: '80px', height: 'fit-content' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Categories</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <button onClick={() => { setSelectedCategory(null); setShowMobileSidebar(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', background: !selectedCategory ? 'rgba(34, 211, 238, 0.1)' : 'transparent', border: !selectedCategory ? '1px solid #22d3ee' : '1px solid transparent', borderRadius: '8px', color: !selectedCategory ? '#fafafa' : '#a1a1aa', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', textAlign: 'left', transition: 'all 0.2s' }}>
                  📚 All Guides <span style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}>{guides.length}</span>
                </button>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setShowMobileSidebar(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', background: selectedCategory === cat.id ? `${cat.color}15` : 'transparent', border: selectedCategory === cat.id ? `1px solid ${cat.color}` : '1px solid transparent', borderRadius: '8px', color: selectedCategory === cat.id ? '#fafafa' : '#a1a1aa', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', textAlign: 'left', transition: 'all 0.2s' }}>
                    <span style={{ fontSize: '1rem' }}>{cat.icon}</span> {cat.name}
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: `${cat.color}20`, color: cat.color, borderRadius: '6px' }}>{guides.filter(g => g.category === cat.id).length}</span>
                  </button>
                ))}
              </div>
            </aside>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#22d3ee' }}>◈</span>
                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'All Guides'}
                <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#52525b', fontWeight: 400 }}>{filteredGuides.length} guides</span>
              </h2>

              <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' }}>
                {filteredGuides.map(guide => {
                  const cat = categories.find(c => c.id === guide.category);
                  const isHovered = hoveredCard === guide.id;
                  const isComplete = completed.has(guide.id);
                  return (
                    <article key={guide.id} onClick={() => setSelectedGuide(guide)} onMouseEnter={() => setHoveredCard(guide.id)} onMouseLeave={() => setHoveredCard(null)} style={{ padding: '1.5rem', background: isHovered ? 'rgba(255,255,255,0.06)' : 'rgba(24,24,27,0.8)', border: `2px solid ${isHovered ? cat?.color : isComplete ? '#4ade8060' : 'rgba(255,255,255,0.12)'}`, borderRadius: '16px', cursor: 'pointer', transition: 'all 0.25s ease', transform: isHovered ? 'translateY(-4px)' : 'none', boxShadow: isHovered ? `0 12px 40px ${cat?.color}20, 0 4px 16px rgba(0,0,0,0.4)` : '0 4px 12px rgba(0,0,0,0.3)', position: 'relative' }}>
                      {isComplete && <span style={{ position: 'absolute', top: 12, right: 12, fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: '#4ade8025', color: '#4ade80', borderRadius: '8px', fontWeight: 600, border: '1px solid #4ade8040' }}>✓ Done</span>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2rem', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${cat?.color}20`, borderRadius: '14px', border: `1px solid ${cat?.color}30` }}>{guide.image}</span>
                        <span style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', borderRadius: '8px', background: `${cat?.color}20`, color: cat?.color, fontWeight: 600, border: `1px solid ${cat?.color}40` }}>{cat?.name}</span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.6rem', color: '#fafafa' }}>{guide.title}</h3>
                      <p style={{ fontSize: '0.9rem', color: '#a1a1aa', lineHeight: 1.6, marginBottom: '1rem', minHeight: '3rem' }}>{guide.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '0.85rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>⏱ {guide.readTime}</span>
                        <span style={{ fontSize: '0.85rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>🏢 {guide.company}</span>
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }

        /* Mobile Responsive Styles */
        @media (max-width: 1024px) {
          .main-content {
            grid-template-columns: 1fr !important;
            padding: 0 1.5rem 2rem !important;
          }
          .sidebar {
            display: none !important;
          }
          .sidebar.sidebar-open {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 300px !important;
            height: 100vh !important;
            background: #09090b !important;
            padding: 1.5rem !important;
            z-index: 100 !important;
            overflow-y: auto !important;
            border-right: 1px solid rgba(255,255,255,0.1) !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .card-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
          }
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 0 1rem 2rem !important;
          }
          .tab-buttons {
            font-size: 0.75rem !important;
          }
          .tab-buttons button {
            padding: 0.35rem 0.5rem !important;
            font-size: 0.75rem !important;
          }
          .search-input {
            width: 140px !important;
            font-size: 0.8rem !important;
          }
          .card-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
        }

        @media (max-width: 480px) {
          .tab-buttons button span {
            display: none;
          }
          .search-input {
            display: none !important;
          }
        }

        /* Large screens - 3 column layout */
        @media (min-width: 1200px) {
          .card-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }

        /* Extra large screens - 4 column layout */
        @media (min-width: 1600px) {
          .card-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }

        /* Ultra wide screens - 5 column layout */
        @media (min-width: 2200px) {
          .card-grid {
            grid-template-columns: repeat(5, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}