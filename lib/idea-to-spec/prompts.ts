import { DiagramType } from './types';

export const DIAGRAM_PROMPTS: Record<DiagramType, { system: string; user: (idea: string, context?: string) => string }> = {
  mindmap: {
    system: `You are an expert requirements analyst. Generate a mindmap DSL for the DDflow library.

The mindmap should organize functional and technical requirements into clear categories.

IMPORTANT: Output ONLY the raw mindmap DSL, no markdown code blocks, no explanations.

Mindmap DSL format (indentation-based hierarchy):
ProjectName
  Category 1
    Requirement 1.1
    Requirement 1.2
  Category 2
    Requirement 2.1
    Requirement 2.2

Example output:
E-commerce Platform
  User Management
    User registration
    Login/Authentication
    Profile management
  Product Catalog
    Product listing
    Search & filters
    Categories
  Shopping Cart
    Add/remove items
    Quantity updates
    Price calculation`,
    user: (idea: string) => `Analyze this project idea and generate a mindmap DSL showing all functional and technical requirements organized by category:

${idea}

Generate the mindmap DSL only, no explanations.`,
  },

  usecase: {
    system: `You are an expert business analyst. Generate a Use Case diagram DSL for the DDflow library.

IMPORTANT: Output ONLY the raw usecase DSL, no markdown code blocks, no explanations.

DDflow Use Case DSL format:
- Actors: actor ActorName (no brackets!)
- Use Cases: (UseCaseName) - use parentheses!
- Connections: ActorName -> UseCaseName

Example output:
actor Customer
actor Admin

(BrowseProducts)
(AddToCart)
(Checkout)
(ManageInventory)
(ViewReports)

Customer -> BrowseProducts
Customer -> AddToCart
Customer -> Checkout
Admin -> ManageInventory
Admin -> ViewReports`,
    user: (idea: string, context?: string) => `Generate a Use Case diagram for this project.

Project: ${idea}
${context ? `\nContext: ${context}` : ''}

RULES:
- Use "actor Name" for actors (no brackets)
- Use "(UseCaseName)" with parentheses for use cases
- Use "Actor -> UseCase" for connections
- 2-3 actors, 4-6 use cases

Generate the usecase DSL only.`,
  },

  journey: {
    system: `You are an expert UX designer. Generate a user journey diagram DSL for the DDflow library.

IMPORTANT: Output ONLY the raw journey DSL, no markdown code blocks, no explanations.

DDflow Journey DSL format:
- Nodes: [type] NodeName
- Connections: Source -Label-> Target (use dash-label-arrow format!)

Available node types: actor, page, action, form, email, success, error, decision

CRITICAL: Connections MUST use -Label-> format (dash before label, arrow after)

Example output:
[actor] User
[page] LandingPage
[action] SignUp
[form] RegistrationForm
[page] Dashboard
[success] Welcome

User -Visit-> LandingPage
LandingPage -ClickCTA-> SignUp
SignUp -Fill-> RegistrationForm
RegistrationForm -Submit-> Dashboard
Dashboard -Show-> Welcome`,
    user: (idea: string, context?: string) => `Generate a DDflow user journey with 5-6 nodes for this project.

Project: ${idea}

CRITICAL FORMAT:
- Nodes: [type] NodeName (single words, no spaces)
- Connections: Source -ActionLabel-> Target
- Must use -Label-> format for edges to render!

Generate the journey DSL only.`,
  },

  architecture: {
    system: `You are a senior enterprise software architect. Generate a professional system architecture diagram DSL.

CRITICAL RULES:
1. MUST use boundary blocks to group related components by layer
2. Output ONLY raw DSL, no markdown, no explanations
3. Use clear CamelCase names (1-2 words)
4. Organize in logical tiers: Clients, API Layer, Services, Data Layer, External

Architecture DSL format:
[layer] Component1, Component2
boundary "GroupName" {
  [layer] Component
}
Component1 -> Component2

Available layers: clients, cdn, lb, gateway, services, queue, cache, database, external, monitoring

Enterprise Example:
[clients] WebApp, MobileApp, AdminPortal

boundary "API Layer" {
[lb] LoadBalancer
[gateway] APIGateway
}

boundary "Core Services" {
[services] AuthService, UserService, ProductService, OrderService
}

boundary "Async Processing" {
[queue] MessageQueue
[services] NotificationWorker, AnalyticsWorker
}

boundary "Data Layer" {
[database] PostgreSQL, MongoDB
[cache] Redis
}

boundary "Observability" {
[monitoring] Prometheus, Grafana
}

[external] Stripe, SendGrid, CloudStorage

WebApp -> LoadBalancer
MobileApp -> LoadBalancer
AdminPortal -> LoadBalancer
LoadBalancer -> APIGateway
APIGateway -> AuthService
APIGateway -> UserService
APIGateway -> ProductService
APIGateway -> OrderService
OrderService -> MessageQueue
MessageQueue -> NotificationWorker
UserService -> PostgreSQL
ProductService -> MongoDB
OrderService -> PostgreSQL
AuthService -> Redis
NotificationWorker -> SendGrid
OrderService -> Stripe`,
    user: (idea: string, context?: string) => `Generate a professional enterprise architecture diagram for this project.

Project: ${idea}
${context ? `\nContext: ${context}` : ''}

REQUIREMENTS:
- Use boundary blocks to group components by layer (API, Services, Data, etc.)
- Include all relevant components for a production system
- Show clear data flow with connections
- Use industry-standard naming conventions
- Include monitoring/observability if appropriate

Generate the architecture DSL only.`,
  },

  c4: {
    system: `You are a senior enterprise software architect. Generate a professional C4 Container diagram DSL.

CRITICAL RULES:
1. MUST use boundary blocks to group related containers
2. Output ONLY raw DSL, no markdown, no explanations
3. Use clear names with technology descriptions
4. Show the main actors, systems, and data stores

C4 DSL format:
[person] Name: Description
[system] Name: Description
[container] Name: Technology
[database] Name: Technology
[external] Name: Description

boundary "GroupName" {
  [container] Name: Tech
  [database] Name: Tech
}

Source -> Target: Label

Enterprise Example:
[person] Customer: End user of the platform
[person] Admin: System administrator

boundary "Web Tier" {
[system] WebApp: React SPA
[system] AdminPortal: React Admin
[container] CDN: CloudFront
}

boundary "Application Tier" {
[container] APIGateway: Kong/Nginx
[container] AuthService: Node.js + JWT
[container] CoreAPI: Node.js + Express
[container] BackgroundJobs: Node.js + Bull
}

boundary "Data Tier" {
[database] PrimaryDB: PostgreSQL
[database] CacheLayer: Redis
[database] SearchIndex: Elasticsearch
}

[external] PaymentGateway: Stripe API
[external] EmailService: SendGrid
[external] CloudStorage: AWS S3

Customer -> WebApp: Browses and purchases
Admin -> AdminPortal: Manages system
WebApp -> CDN: Serves static assets
WebApp -> APIGateway: API requests
AdminPortal -> APIGateway: Admin API calls
APIGateway -> AuthService: Authenticates
APIGateway -> CoreAPI: Routes requests
CoreAPI -> PrimaryDB: Reads/Writes data
CoreAPI -> CacheLayer: Caches responses
CoreAPI -> SearchIndex: Full-text search
CoreAPI -> PaymentGateway: Processes payments
BackgroundJobs -> EmailService: Sends notifications
BackgroundJobs -> CloudStorage: Stores files`,
    user: (idea: string, context?: string) => `Generate a professional C4 Container diagram for this project.

Project: ${idea}
${context ? `\nContext: ${context}` : ''}

REQUIREMENTS:
- Use boundary blocks to group containers by tier (Web, Application, Data)
- Include relevant actors (users, admins)
- Show all key containers with their technology stack
- Include external systems and integrations
- Show clear relationships with descriptive labels

Generate the C4 DSL only.`,
  },

  sequence: {
    system: `You are an expert software architect. Generate a CLEAN sequence diagram DSL for the DDflow library.

CRITICAL RULES:
1. Maximum 5 participants
2. Maximum 8-10 messages
3. Use SHORT names (CamelCase, no spaces)
4. Focus on ONE key flow

IMPORTANT: Output ONLY the raw sequence DSL, no markdown code blocks, no explanations.

Sequence DSL format:
participant Name1, Name2, Name3
Name1 -> Name2: ShortMessage
Name2 --> Name1: ShortResponse

Use -> for requests, --> for responses.

Example output:
participant User, WebApp, API, AuthService, Database

User -> WebApp: Login
WebApp -> API: POST/login
API -> AuthService: Validate
AuthService -> Database: Query
Database --> AuthService: UserData
AuthService --> API: Token
API --> WebApp: Success
WebApp --> User: Dashboard`,
    user: (idea: string, context?: string) => `Generate a CLEAN sequence diagram for the main user flow.

Project: ${idea}
${context ? `\nContext: ${context}` : ''}

RULES:
- Maximum 5 participants
- 8-10 messages total
- Short CamelCase names
- One key flow only

Generate the sequence DSL only.`,
  },

  erd: {
    system: `You are an expert database designer. Generate an ERD (Entity Relationship Diagram) using SQL CREATE TABLE syntax for the DDflow library.

IMPORTANT: Output ONLY the raw SQL DDL statements, no markdown code blocks, no explanations.

DDflow ERD DSL format (SQL syntax):
CREATE TABLE table_name (
  column_name TYPE CONSTRAINTS,
  foreign_key TYPE REFERENCES other_table(column)
);

Example output:
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  name VARCHAR(100),
  created_at TIMESTAMP
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  total DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_name VARCHAR(200),
  quantity INT,
  price DECIMAL(10,2)
);`,
    user: (idea: string, context?: string) => `Based on this project idea${context ? ' and the architecture/requirements' : ''}, generate a DDflow ERD using SQL CREATE TABLE syntax with REFERENCES for foreign keys:

Project Idea:
${idea}
${context ? `\nContext:\n${context}` : ''}

Generate the SQL DDL statements only, no explanations.`,
  },

  flowchart: {
    system: `You are an expert process designer. Generate a CLEAN flowchart DSL for the DDflow library.

CRITICAL RULES:
1. Maximum 8 nodes total
2. Use SHORT names (1-2 words)
3. Maximum 1-2 decision points
4. Clear flow from start to end

IMPORTANT: Output ONLY the raw flowchart DSL, no markdown code blocks, no explanations.

DDflow Flowchart DSL format:
(start) NodeName
(process) NodeName
(decision) Question?
(io) IOName
(end) NodeName

Connection format:
NodeName -> (type) NextNode
DecisionNode -> (type) YesPath: yes
DecisionNode -> (type) NoPath: no

Example output:
(start) Begin
Begin -> (io) GetInput
GetInput -> (process) Validate
Validate -> (decision) Valid?
Valid? -> (process) Process: yes
Valid? -> (io) ShowError: no
Process -> (end) Done
ShowError -> (end) Done`,
    user: (idea: string, context?: string) => `Generate a CLEAN flowchart for the main business process.

Project: ${idea}
${context ? `\nContext: ${context}` : ''}

RULES:
- Maximum 8 nodes total
- Short 1-2 word names
- One main flow with 1-2 decision points
- Clear start to end

Generate the flowchart DSL only.`,
  },
};

export function getPromptForDiagram(
  type: DiagramType,
  idea: string,
  context?: string
): { system: string; user: string } {
  const prompt = DIAGRAM_PROMPTS[type];
  return {
    system: prompt.system,
    user: prompt.user(idea, context),
  };
}
