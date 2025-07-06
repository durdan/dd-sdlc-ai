# API Reference - SDLC AI Platform

## 📋 Overview

The SDLC AI Platform provides a comprehensive REST API for generating software development life cycle documentation, managing projects, and integrating with third-party services.

## 🔐 Authentication

All API endpoints require authentication using Supabase Auth. Include the authorization header in all requests:

```bash
Authorization: Bearer <your-supabase-jwt-token>
```

### Getting Authentication Token

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

## 🚀 Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## 📊 API Endpoints

### 🤖 AI Generation Endpoints

#### Generate Complete SDLC Documentation

```http
POST /api/generate-sdlc
```

**Description**: Generates complete SDLC documentation including business analysis, functional specs, technical specs, and UX specs.

**Request Body**:
```json
{
  "input": "string", // Business requirement description
  "title": "string", // Project title
  "template": "string", // Optional: Template to use
  "model": "gpt-4" | "gpt-3.5-turbo" | "claude-3", // AI model
  "includeArchitecture": boolean, // Include architecture diagrams
  "customPrompts": { // Optional custom prompts
    "businessAnalysis": "string",
    "functionalSpec": "string",
    "technicalSpec": "string",
    "uxSpec": "string"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "projectId": "uuid",
    "businessAnalysis": "string",
    "functionalSpec": "string",
    "technicalSpec": "string",
    "uxSpec": "string",
    "architectureDiagrams": "string",
    "backlogStructure": {
      "epic": "string",
      "stories": ["string"],
      "tasks": ["string"]
    }
  },
  "metadata": {
    "tokensUsed": number,
    "generationTime": number,
    "model": "string"
  }
}
```

**Example**:
```bash
curl -X POST "http://localhost:3000/api/generate-sdlc" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "We need to build a task management application with user authentication, project creation, and team collaboration features.",
    "title": "Task Management System",
    "model": "gpt-4",
    "includeArchitecture": true
  }'
```

#### Generate Business Analysis

```http
POST /api/generate-business-analysis
```

**Description**: Generates detailed business analysis for a given requirement.

**Request Body**:
```json
{
  "input": "string",
  "focus": "roi" | "stakeholders" | "risks" | "all",
  "model": "gpt-4" | "gpt-3.5-turbo" | "claude-3"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "executiveSummary": "string",
    "businessCase": "string",
    "stakeholderAnalysis": "string",
    "riskAssessment": "string",
    "successMetrics": "string",
    "timeline": "string"
  }
}
```

#### Generate Technical Specifications

```http
POST /api/generate-technical-spec
```

**Description**: Creates comprehensive technical specifications and architecture documentation.

**Request Body**:
```json
{
  "input": "string",
  "functionalRequirements": "string", // Optional: From functional spec
  "technology": "string", // Optional: Preferred tech stack
  "architecture": "microservices" | "monolith" | "serverless",
  "includeAPI": boolean,
  "includeSecurity": boolean,
  "model": "gpt-4" | "gpt-3.5-turbo" | "claude-3"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "systemArchitecture": "string",
    "technicalRequirements": "string",
    "apiDesign": "string",
    "databaseDesign": "string",
    "securityConsiderations": "string",
    "deploymentStrategy": "string",
    "performanceRequirements": "string"
  }
}
```

#### Generate UX Specifications

```http
POST /api/generate-ux-spec
```

**Description**: Creates user experience specifications including personas, user journeys, and wireframes.

**Request Body**:
```json
{
  "input": "string",
  "targetAudience": "string",
  "platform": "web" | "mobile" | "desktop" | "all",
  "includeWireframes": boolean,
  "designSystem": "string", // Optional: Design system to follow
  "model": "gpt-4" | "gpt-3.5-turbo" | "claude-3"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "userPersonas": "string",
    "userJourneys": "string",
    "wireframeDescriptions": "string",
    "designRequirements": "string",
    "accessibilityGuidelines": "string",
    "usabilityRequirements": "string"
  }
}
```

#### Generate Mermaid Diagrams

```http
POST /api/generate-mermaid-diagrams
```

**Description**: Creates Mermaid diagrams for system architecture and workflows.

**Request Body**:
```json
{
  "input": "string",
  "diagramTypes": ["flowchart", "sequence", "class", "er", "state"],
  "complexity": "simple" | "detailed" | "comprehensive",
  "model": "gpt-4" | "gpt-3.5-turbo"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "systemArchitecture": "string", // Mermaid diagram code
    "dataFlow": "string",
    "userFlow": "string",
    "databaseSchema": "string",
    "deploymentDiagram": "string"
  }
}
```

#### Generate Backlog Structure

```http
POST /api/generate-backlog-structure
```

**Description**: Creates structured backlog with epics, stories, and tasks.

**Request Body**:
```json
{
  "input": "string",
  "methodology": "scrum" | "kanban" | "safe",
  "includeAcceptanceCriteria": boolean,
  "includeTasks": boolean,
  "model": "gpt-4" | "gpt-3.5-turbo" | "claude-3"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "epic": {
      "title": "string",
      "description": "string",
      "acceptanceCriteria": ["string"]
    },
    "stories": [
      {
        "title": "string",
        "description": "string",
        "acceptanceCriteria": ["string"],
        "storyPoints": number,
        "priority": "high" | "medium" | "low"
      }
    ],
    "tasks": [
      {
        "title": "string",
        "description": "string",
        "estimatedHours": number,
        "assignedTo": "string"
      }
    ]
  }
}
```

### 📁 Project Management Endpoints

#### Get All Projects

```http
GET /api/projects
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `status`: Filter by status
- `search`: Search in title and description

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "status": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "document_count": number
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

#### Get Project by ID

```http
GET /api/projects/{id}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "input_text": "string",
    "status": "string",
    "template_used": "string",
    "jira_project": "string",
    "confluence_space": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "documents": [
      {
        "id": "uuid",
        "document_type": "string",
        "content": "string",
        "version": number,
        "created_at": "timestamp"
      }
    ]
  }
}
```

#### Create Project

```http
POST /api/projects
```

**Request Body**:
```json
{
  "title": "string",
  "description": "string",
  "input_text": "string",
  "template_used": "string" // Optional
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "input_text": "string",
    "status": "processing",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

#### Update Project

```http
PUT /api/projects/{id}
```

**Request Body**:
```json
{
  "title": "string", // Optional
  "description": "string", // Optional
  "status": "string", // Optional
  "jira_project": "string", // Optional
  "confluence_space": "string" // Optional
}
```

#### Delete Project

```http
DELETE /api/projects/{id}
```

**Response**:
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### 📄 Document Management Endpoints

#### Get Project Documents

```http
GET /api/projects/{projectId}/documents
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "document_type": "business_analysis" | "functional_spec" | "technical_spec" | "ux_spec" | "architecture_diagrams",
      "content": "string",
      "version": number,
      "created_at": "timestamp"
    }
  ]
}
```

#### Get Document by Type

```http
GET /api/projects/{projectId}/documents/{type}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "document_type": "string",
    "content": "string",
    "version": number,
    "created_at": "timestamp"
  }
}
```

#### Save Document

```http
POST /api/projects/{projectId}/documents
```

**Request Body**:
```json
{
  "document_type": "business_analysis" | "functional_spec" | "technical_spec" | "ux_spec" | "architecture_diagrams",
  "content": "string",
  "version": number // Optional, defaults to 1
}
```

### ⚙️ Configuration Endpoints

#### Get User Configuration

```http
GET /api/configuration
```

**Response**:
```json
{
  "success": true,
  "data": {
    "openai_api_key": "string", // Masked for security
    "jira_base_url": "string",
    "jira_email": "string",
    "confluence_base_url": "string",
    "confluence_email": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

#### Update User Configuration

```http
PUT /api/configuration
```

**Request Body**:
```json
{
  "openai_api_key": "string", // Optional
  "jira_base_url": "string", // Optional
  "jira_email": "string", // Optional
  "jira_api_token": "string", // Optional
  "confluence_base_url": "string", // Optional
  "confluence_email": "string", // Optional
  "confluence_api_token": "string" // Optional
}
```

### 🔗 Integration Endpoints

#### Export to JIRA

```http
POST /api/integrations/jira
```

**Request Body**:
```json
{
  "projectId": "uuid",
  "jiraProjectKey": "string",
  "epicTitle": "string",
  "createSubtasks": boolean
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "epicKey": "string",
    "epicUrl": "string",
    "storyKeys": ["string"],
    "taskKeys": ["string"]
  }
}
```

#### Export to Confluence

```http
POST /api/integrations/confluence
```

**Request Body**:
```json
{
  "projectId": "uuid",
  "spaceKey": "string",
  "parentPageId": "string", // Optional
  "createHierarchy": boolean
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "parentPageId": "string",
    "parentPageUrl": "string",
    "childPages": [
      {
        "title": "string",
        "id": "string",
        "url": "string"
      }
    ]
  }
}
```

#### GitHub Integration

```http
POST /api/integrations/github
```

**Request Body**:
```json
{
  "projectId": "uuid",
  "repositoryUrl": "string",
  "createIssues": boolean,
  "createProject": boolean
}
```

#### Slack Integration

```http
POST /api/integrations/slack
```

**Request Body**:
```json
{
  "projectId": "uuid",
  "channelId": "string",
  "message": "string",
  "includeDocuments": boolean
}
```

### 📊 Analytics Endpoints

#### Get Project Analytics

```http
GET /api/analytics/projects
```

**Query Parameters**:
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)
- `groupBy`: Group by period (day, week, month)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalProjects": number,
    "completedProjects": number,
    "averageCompletionTime": number,
    "projectsByStatus": {
      "processing": number,
      "completed": number,
      "failed": number
    },
    "projectsOverTime": [
      {
        "date": "string",
        "count": number
      }
    ]
  }
}
```

#### Get Usage Analytics

```http
GET /api/analytics/usage
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalTokensUsed": number,
    "totalGenerations": number,
    "averageGenerationTime": number,
    "modelUsage": {
      "gpt-4": number,
      "gpt-3.5-turbo": number,
      "claude-3": number
    },
    "documentTypes": {
      "business_analysis": number,
      "functional_spec": number,
      "technical_spec": number,
      "ux_spec": number
    }
  }
}
```

## 🔧 Content Intelligence

#### Analyze Content Intelligence

```http
POST /api/analyze-content-intelligence
```

**Description**: Analyzes content for insights, gaps, and recommendations.

**Request Body**:
```json
{
  "content": "string",
  "analysisType": "completeness" | "quality" | "consistency" | "all",
  "context": "string" // Optional: Additional context
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "completenessScore": number,
    "qualityScore": number,
    "consistencyScore": number,
    "insights": ["string"],
    "recommendations": ["string"],
    "missingElements": ["string"]
  }
}
```

## 📝 Templates

#### Get Templates

```http
GET /api/templates
```

**Query Parameters**:
- `category`: Filter by category
- `public`: Include public templates (boolean)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "category": "string",
      "configuration": {},
      "is_public": boolean,
      "created_at": "timestamp"
    }
  ]
}
```

#### Create Template

```http
POST /api/templates
```

**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "configuration": {},
  "is_public": boolean
}
```

## 🚨 Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": {} // Optional additional error details
  }
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED`: Missing or invalid authentication token
- `AUTHORIZATION_FAILED`: User doesn't have permission for this resource
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded
- `AI_SERVICE_ERROR`: Error from AI service provider
- `INTEGRATION_ERROR`: Error with third-party integration
- `INTERNAL_SERVER_ERROR`: Unexpected server error

## 🔄 Rate Limiting

API endpoints are rate-limited to ensure fair usage:

- **Free Tier**: 100 requests per hour
- **Pro Tier**: 1,000 requests per hour
- **Enterprise**: Custom limits

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Request limit per hour
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (Unix timestamp)

## 📊 Webhooks

Configure webhooks to receive real-time updates:

#### Project Status Updates

```json
{
  "event": "project.status_changed",
  "data": {
    "projectId": "uuid",
    "oldStatus": "string",
    "newStatus": "string",
    "timestamp": "timestamp"
  }
}
```

#### Document Generated

```json
{
  "event": "document.generated",
  "data": {
    "projectId": "uuid",
    "documentType": "string",
    "documentId": "uuid",
    "timestamp": "timestamp"
  }
}
```

## 🧪 Testing

### Example Test Requests

```bash
# Test authentication
curl -X GET "http://localhost:3000/api/projects" \
  -H "Authorization: Bearer <token>"

# Generate simple business analysis
curl -X POST "http://localhost:3000/api/generate-business-analysis" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Build a simple todo app",
    "model": "gpt-3.5-turbo"
  }'

# Create a test project
curl -X POST "http://localhost:3000/api/projects" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project",
    "description": "Testing API",
    "input_text": "Simple test requirement"
  }'
```

## 📚 SDK and Libraries

### JavaScript/TypeScript SDK

```typescript
import { SDLCClient } from '@sdlc-ai/sdk'

const client = new SDLCClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.sdlc-ai.com'
})

// Generate SDLC documentation
const result = await client.generateSDLC({
  input: 'Build a task management system',
  model: 'gpt-4'
})
```

### Python SDK

```python
from sdlc_ai import SDLCClient

client = SDLCClient(api_key='your-api-key')

# Generate business analysis
result = client.generate_business_analysis(
    input='Build a task management system',
    model='gpt-4'
)
```

---

This API reference provides comprehensive documentation for integrating with the SDLC AI platform. For additional support, please refer to our [GitHub repository](https://github.com/your-username/sdlc-ai) or contact our support team. 