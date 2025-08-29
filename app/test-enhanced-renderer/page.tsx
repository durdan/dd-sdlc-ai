"use client"

import { useState } from 'react'
import { EnhancedDocumentRenderer } from '@/components/enhanced-document-renderer'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestEnhancedRenderer() {
  // Test content that was causing Mermaid errors
  const [problematicContent, setProblematicContent] = useState(`# System Architecture Specification

## 1. Architecture Overview

### 1.1 Architecture Style

> **Selected Architecture:** Microservices
>
> **Justification:**
> - **Primary benefit:** Flexibility in deployment and technology choices for each service.
> - **Scalability:** Enables independent scaling of services based on demand.
> - **Maintainability:** Easier to update and deploy individual services without affecting the entire system.
> - **Team structure fit:** Aligns with a cross-functional team structure, allowing teams to own specific services.

### 1.2 Design Principles

| Principle  | Description  | Implementation Strategy  |
|-------------------------|--------------------------------------------------|-------------------------------------------------|
| **Separation of Concerns** | Each component handles specific business capability | Bounded contexts and clear service boundaries  |
| **Loose Coupling**  | Minimize dependencies between components  | API-first design, event-driven communication  |
| **High Cohesion**  | Related functionality grouped together  | Domain-driven design patterns  |
| **Resilience**  | System continues operating during failures  | Circuit breakers, retries, fallbacks  |
| **Scalability**  | Handle increased load efficiently  | Horizontal scaling, caching, async processing  |

### 1.3 System Boundaries

#### In Scope

• ✅ User Authentication and Authorization
• ✅ Product Catalog Management
• ✅ Order Processing
• ✅ Payment Gateway Integration
• ✅ User Interfaces (Web and Mobile)

#### Out of Scope

• ❌ Legacy System Integration
• ❌ Third-party CRM Integration
• ❌ Future Analytics Dashboard

## 2. Component Architecture

### 2.1 Core Components

#### 📦 **User Service**

| Aspect  | Details  |
|-----------------|----------------------------------|
| **Purpose**  | Manages user profiles and authentication |
| **Technology**  | Node.js, Express  |
| **API Type**  | REST  |
| **Data Store**  | PostgreSQL  |
| **Dependencies**| Auth Service, Notification Service |
| **Scaling Strategy** | Horizontal scaling with load balancer |

**Key Endpoints:**
• \`POST /api/v1/users\` - Create a new user
• \`GET /api/v1/users/{id}\` - Retrieve user details
• \`PUT /api/v1/users/{id}\` - Update user information
• \`DELETE /api/v1/users/{id}\` - Delete a user

### 2.2 Infrastructure Components

#### 🔧 **Load Balancing**

• **Technology:** AWS ALB
• **Algorithm:** Round-robin
• **Health Checks:** HTTP with \`/health\` endpoint
• **SSL Termination:** Yes, managed by AWS Certificate Manager

#### 🔧 **API Gateway**

• **Solution:** AWS API Gateway
• **Features:**  - Rate limiting: 1000 requests per minute  - Authentication: OAuth 2.0  - Request routing: Path-based  - Response caching: 60 seconds TTL

## 3. Technology Stack

### 3.1 Frontend Technologies

| Layer  | Technology  | Version | Justification  |
|------------------|----------------|---------|----------------------------------------|
| **Framework**  | React  | 18.x  | Component reusability, large ecosystem |
| **State Management** | Redux Toolkit | 2.x  | Predictable state, DevTools support  |
| **Styling**  | Tailwind CSS  | 3.x  | Utility-first, rapid development  |
| **Build Tool**  | Vite  | 5.x  | Fast builds, HMR support  |
| **Testing**  | Jest + RTL  | Latest  | Comprehensive testing capabilities  |
| **Type Safety**  | TypeScript  | 5.x  | Type safety, better IDE support  |

### 3.2 Backend Technologies

| Layer  | Technology  | Version | Justification  |
|------------------|----------------|---------|----------------------------------------|
| **Runtime**  | Node.js  | 20.x LTS| Event-driven, npm ecosystem  |
| **Framework**  | NestJS  | 10.x  | Enterprise-grade, TypeScript-first  |
| **Database**  | PostgreSQL  | 15.x  | ACID compliance, JSON support  |
| **Cache**  | Redis  | 7.x  | In-memory performance, pub/sub  |
| **Message Queue**| RabbitMQ  | 3.12  | Reliable messaging, multiple patterns  |
| **ORM**  | Prisma  | 5.x  | Type-safe, migrations support  |

### 3.3 Infrastructure & DevOps

| Category  | Technology  | Purpose  |
|------------------|----------------|------------------------------------------|
| **Cloud Platform** | AWS  | Comprehensive services, global reach  |
| **Container Runtime** | Docker  | Consistent environments  |
| **Orchestration** | Kubernetes  | Container management at scale  |
| **CI/CD**  | GitHub Actions | Integrated with repository  |
| **IaC**  | Terraform  | Declarative infrastructure  |
| **Monitoring**  | DataDog  | Full-stack observability  |
| **Log Management** | ELK Stack  | Centralized logging and analysis  |

## 4. Communication Patterns

### 4.1 Synchronous Communication

#### REST API Design

\`\`\`yaml
API Standards:
  Version: v1
  Format: JSON
  Authentication: Bearer tokens (JWT)
  Rate Limiting: 1000 req/min per client
  Standard Endpoints:
    - GET  /api/v1/{resource}  # List with pagination
    - GET  /api/v1/{resource}/{id} # Get single resource
    - POST  /api/v1/{resource}  # Create new resource
    - PUT  /api/v1/{resource}/{id} # Full update
    - PATCH  /api/v1/{resource}/{id} # Partial update
    - DELETE /api/v1/{resource}/{id} # Remove resource
\`\`\`

### 4.2 Asynchronous Communication

| Pattern  | Technology  | Use Case  | Guarantees  |
|------------------|----------------|---------------------------|-----------------------|
| **Message Queue**| RabbitMQ  | Task processing, order fulfillment | At-least-once delivery |
| **Event Streaming** | Apache Kafka | Real-time analytics, event sourcing | Ordered, persistent |
| **Pub/Sub**  | Redis  | Cache invalidation, notifications | Best-effort delivery |
| **WebSockets**  | Socket.io  | Live updates, chat features | Real-time bidirectional |

## 5. Scalability Design

### 5.1 Horizontal Scaling Strategy

#### Auto-Scaling Configuration

\`\`\`yaml
Scaling Metrics:
  - CPU Utilization > 70%  → Scale up
  - Memory Usage > 80%  → Scale up
  - Request Queue > 100  → Scale up
  - CPU Utilization < 30%  → Scale down (after 10 min)

Instance Limits:
  Minimum: 2 instances (high availability)
  Maximum: 20 instances (cost control)
  Scale-up Rate: 2 instances per trigger
  Scale-down Rate: 1 instance per trigger
\`\`\`

### 5.2 Performance Optimization

| Component  | Strategy  | Target Metric  |
|-----------------|---------------------------------|------------------------|
| **Database**  | Read replicas, query optimization | < 100ms query time  |
| **API Gateway** | Response caching, CDN  | < 200ms response time  |
| **Application** | Memory caching, connection pooling | < 500ms request processing |
| **Static Assets** | CDN distribution, compression  | < 50ms load time  |

## 6. Deployment Architecture

### 6.1 Environment Strategy

| Environment  | Purpose  | Configuration  | Deployment Frequency |
|-----------------|------------------|--------------------------|----------------------|
| **Development** | Local development | Docker Compose, mocked services | On-demand  |
| **Testing**  | Automated testing | Isolated, reset daily  | Per commit  |
| **Staging**  | Pre-production validation | Production-like, reduced scale | Daily  |
| **Production**  | Live system  | Full scale, multi-region | Weekly releases  |

### 6.2 CI/CD Pipeline

\`\`\`mermaid
graph LR
  A[Code Commit] --> B[Build & Test]
  B --> C{Tests Pass?}
  C -->|Yes| D[Deploy to Staging]
  C -->|No| E[Notify Developer]
  D --> F[Integration Tests]
  F --> G{Approved?}
  G -->|Yes| H[Deploy to Production]
  G -->|No| E
  H --> I[Health Checks]
  I --> J[Monitor & Alert]
\`\`\`

## 7. Security Architecture

### 7.1 Security Layers

| Layer  | Protection Mechanism  | Implementation  |
|------------------|--------------------------------|-------------------------|
| **Network**  | WAF, DDoS protection  | CloudFlare, AWS Shield  |
| **Application**  | Input validation, CORS  | OWASP Top 10 compliance |
| **API**  | Rate limiting, authentication  | OAuth 2.0, API keys  |
| **Data**  | Encryption at rest/transit  | AES-256, TLS 1.3  |
| **Infrastructure** | Network segmentation  | VPC, security groups  |

### 7.2 Compliance & Standards

• ✅ **GDPR Compliance**: Data privacy and user rights
• ✅ **PCI DSS**: Payment card data security
• ✅ **SOC 2 Type II**: Security controls audit
• ✅ **ISO 27001**: Information security management

## 8. Monitoring & Observability

### 8.1 Metrics Dashboard

| Metric Category | Key Indicators  | Alert Threshold  |
|-----------------|---------------------------------|------------------------|
| **Application** | Response time, error rate  | > 1s, > 1%  |
| **Infrastructure** | CPU, memory, disk  | > 80%  |
| **Business**  | Transactions/sec, conversion rate | < baseline -20%  |
| **Security**  | Failed auth attempts, suspicious activity | > 10/min  |

### 8.2 Logging Strategy

\`\`\`yaml
Log Levels:
  ERROR: System errors, exceptions
  WARN: Performance issues, deprecated usage
  INFO: Business events, user actions
  DEBUG: Detailed execution flow (dev only)

Retention Policy:
  Production Logs: 30 days hot, 1 year cold storage
  Security Logs: 7 years (compliance requirement)
  Debug Logs: 7 days (staging only)
\`\`\`

This comprehensive technical specification provides a detailed blueprint for the implementation teams, ensuring all sections are cohesive and reference each other where appropriate. The document is formatted as a professional technical specification, ready for use in guiding the development and deployment of the system.`)

  const [normalContent, setNormalContent] = useState(`# Technical Specification

## Overview
This is a test document to demonstrate the enhanced document renderer.

## System Architecture
The system follows a microservices architecture pattern.

\`\`\`mermaid
graph TD
    A[Client] --> B[API Gateway]
    B --> C[User Service]
    B --> D[Product Service]
    B --> E[Order Service]
    C --> F[User Database]
    D --> G[Product Database]
    E --> H[Order Database]
\`\`\`

## Database Design
Our database uses a relational model with the following entities:

### Users
- **ID**: Primary key
- **Email**: Unique identifier
- **Name**: User's full name
- **Created**: Timestamp

### Products
- **ID**: Primary key
- **Name**: Product name
- **Price**: Decimal value
- **Category**: Product category

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/users | Retrieve all users |
| POST   | /api/users | Create new user |
| PUT    | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

## Code Examples

Here's an example of how to use our API:

\`\`\`javascript
const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com'
  })
})
\`\`\`

## Benefits
- **Scalability**: Microservices can scale independently
- **Maintainability**: Each service has a single responsibility
- **Flexibility**: Easy to add new features
- **Reliability**: Fault isolation between services

> **Note**: This is a sample document for testing purposes.

---

*Generated with enhanced rendering and Mermaid diagram support*`)

  const [currentContent, setCurrentContent] = useState(problematicContent)
  const [showActions, setShowActions] = useState(true)

  const switchToProblematic = () => {
    setCurrentContent(problematicContent)
  }

  const switchToNormal = () => {
    setCurrentContent(normalContent)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enhanced Document Renderer Test
        </h1>
        <p className="text-gray-600">
          Test the improved document rendering with better styling and Mermaid diagram support
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <Button onClick={switchToNormal} variant="outline">
          Test Normal Content
        </Button>
        <Button onClick={switchToProblematic} variant="outline">
          Test Problematic Content
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActions(!showActions)}
              >
                {showActions ? 'Hide' : 'Show'} Actions
              </Button>
            </div>
            <Textarea
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              placeholder="Enter markdown content with Mermaid diagrams..."
              className="min-h-[400px] font-mono text-sm"
            />
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Rendered Output</CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedDocumentRenderer
              content={currentContent}
              title="Test Document"
              documentType="technical"
              showActions={showActions}
            />
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>
          The enhanced renderer provides better typography, automatic Mermaid diagram detection, 
          and improved visual hierarchy for documents. It should now handle problematic content gracefully.
        </p>
      </div>
    </div>
  )
}
