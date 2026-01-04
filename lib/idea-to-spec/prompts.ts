import { DiagramType } from './types';

// DSL references from ddflow 1.2.0
const DSL_REFERENCES = {
  architecture: `
Layer Types: [clients], [frontend], [gateway], [api], [services], [backend], [data], [database], [cache], [queue], [storage], [external]
C4-Style Nodes: [person], [system], [webapp], [mobileapp], [component], [service], [server], [monitoring], [logging]
Boundaries: boundary "Name" { ... }
Connections: A -> B, A -> B: label
Edge Styles: -> (solid), --> (dotted), ==> (thick), ->> (async), -.-> (dashed)`,

  mindmap: `
Indentation-based hierarchy (2 spaces per level)
NO ARROWS - hierarchy is defined by indentation only
Optional prefixes: -, *, + (all treated the same)`,

  flowchart: `
Node Types: (start), (end), (process), (decision), (io)
Connections: NodeLabel -> NextNodeLabel, NodeLabel -> NextNodeLabel: edge label
The type keyword defines the shape, NOT the label`,

  sequence: `
Participants: participant Name1, Name2, Name3
Messages: A -> B: message (request), A --> B: message (response), A ->> B: message (async)
Self-calls: A -> A: internal process`,

  erd: `
SQL CREATE TABLE syntax
Primary Key: column_name TYPE PRIMARY KEY
Foreign Key: column_name TYPE REFERENCES table(column)`,

  usecase: `
Actors: actor ActorName
Use Cases: (Use Case Name)
Relationships: Actor -> Use Case`,

  journey: `
Node Types: [actor], [user], [page], [screen], [action], [form], [email], [success], [error], [decision], [notification], [milestone]
Connections: Node1 -> Node2, Node1 -label-> Node2`,

  c4: `
Elements: [person], [system], [container], [component], [external], [database]
Boundaries: boundary "System Name" { ... }
Relationships: Element1 -> Element2: Description`
};

export const DIAGRAM_PROMPTS: Record<DiagramType, { system: string; user: (idea: string, context?: string) => string }> = {
  mindmap: {
    system: `You are an expert requirements analyst. Generate a mindmap DSL for DDflow.

IMPORTANT: Output ONLY the raw mindmap DSL, no markdown code blocks, no explanations.

${DSL_REFERENCES.mindmap}

Mindmap DSL format (2-space indentation hierarchy):
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

Generate the mindmap DSL only, no explanations. Use 2-space indentation, NO arrows.`,
  },

  usecase: {
    system: `You are an expert business analyst. Generate a Use Case diagram DSL for DDflow.

IMPORTANT: Output ONLY the raw usecase DSL, no markdown code blocks, no explanations.

${DSL_REFERENCES.usecase}

Example output:
actor Customer
actor Admin
actor System

(Browse Products)
(Add to Cart)
(Checkout)
(Manage Products)
(Process Orders)
(Send Notifications)

Customer -> Browse Products
Customer -> Add to Cart
Customer -> Checkout
Admin -> Manage Products
Admin -> Process Orders
System -> Send Notifications`,
    user: (idea: string, context?: string) => `Generate a Use Case diagram for this project.

Project: ${idea}
${context ? `\nContext: ${context}` : ''}

RULES:
- Use "actor Name" for actors
- Use "(Use Case Name)" with parentheses for use cases
- Use "Actor -> Use Case" for connections
- 2-4 actors, 5-8 use cases

Generate the usecase DSL only.`,
  },

  journey: {
    system: `You are an expert UX designer. Generate a user journey diagram DSL for DDflow.

IMPORTANT: Output ONLY the raw journey DSL, no markdown code blocks, no explanations.

${DSL_REFERENCES.journey}

Example output:
[actor] Customer
[page] Homepage
[action] SearchProducts
[page] ProductList
[action] AddToCart
[page] Cart
[action] Checkout
[form] PaymentForm
[success] OrderConfirmed

Customer -> Homepage
Homepage -> SearchProducts
SearchProducts -> ProductList
ProductList -> AddToCart
AddToCart -> Cart
Cart -> Checkout
Checkout -> PaymentForm
PaymentForm -> OrderConfirmed`,
    user: (idea: string, context?: string) => `Generate a DDflow user journey with 6-8 nodes for this project.

Project: ${idea}
${context ? `\nContext: ${context}` : ''}

CRITICAL FORMAT:
- Nodes: [type] NodeName (single words or CamelCase, no spaces)
- Connections: Source -> Target OR Source -label-> Target
- Available types: actor, user, page, screen, action, form, email, success, error, decision

Generate the journey DSL only.`,
  },

  architecture: {
    system: `You are a senior enterprise software architect. Generate a well-organized system architecture diagram DSL for DDflow 1.2.0.

CRITICAL RULES FOR CLARITY:
1. ALWAYS use boundary blocks to group related components by layer
2. Use SHORT names (1-3 words max, CamelCase)
3. Group similar components together (all databases in one boundary, all services in another)
4. Output ONLY raw DSL, no markdown, no explanations
5. Use descriptive but brief labels on connections

${DSL_REFERENCES.architecture}

Example (note the clean organization):
title: E-Commerce Platform
subtitle: Microservices Architecture

[person] Customer: Online shopper
[person] Admin: System manager

boundary "Client Layer" {
  [webapp] WebApp: React SPA
  [mobileapp] MobileApp: React Native
}

boundary "API Gateway" {
  [gateway] Gateway: Kong
  [service] AuthService: JWT Auth
}

boundary "Core Services" {
  [service] UserService: User management
  [service] OrderService: Orders
  [service] ProductService: Catalog
  [service] PaymentService: Transactions
}

boundary "Data Layer" {
  [database] PostgreSQL: Primary DB
  [database] MongoDB: Product catalog
  [cache] Redis: Sessions
  [queue] RabbitMQ: Events
}

boundary "External" {
  [external] Stripe: Payments
  [external] SendGrid: Email
  [external] S3: Storage
}

Customer -> WebApp: Uses
Admin -> WebApp: Manages
WebApp -> Gateway: API calls
Gateway -> AuthService: Validates
Gateway -> UserService: Routes
Gateway -> OrderService: Routes
OrderService -> PostgreSQL: Writes
OrderService ->> RabbitMQ: Events
ProductService -> MongoDB: Queries
AuthService -> Redis: Sessions
PaymentService -> Stripe: Process`,
    user: (idea: string, context?: string) => `Generate a well-organized architecture diagram for this project.

Project: ${idea}
${context ? `\nContext: ${context}` : ''}

REQUIREMENTS:
- Add title and subtitle
- Use boundary blocks to group components logically (Client, Gateway, Services, Data, External)
- Use short 1-3 word names
- Include all necessary components for the system
- Show clear data flow with connections
- Use ->> for async connections to queues

Generate the architecture DSL only.`,
  },

  c4: {
    system: `You are a senior enterprise software architect. Generate a well-organized C4 Container diagram DSL for DDflow.

CRITICAL RULES FOR CLARITY:
1. ALWAYS use boundary blocks to group related containers
2. Use SHORT names (1-3 words max)
3. Group containers by system/domain (e.g., "Core Platform", "Data Stores", "External Services")
4. Use brief connection labels (1-3 words)
5. Output ONLY raw DSL, no markdown, no explanations

${DSL_REFERENCES.c4}

Example (note the clean organization with boundaries):
[person] Customer: End user
[person] Admin: System admin

boundary "Web & Mobile" {
  [container] WebApp: React SPA
  [container] MobileApp: React Native
  [container] AdminPortal: React Admin
}

boundary "Core Platform" {
  [container] APIGateway: Kong
  [container] AuthService: Node.js + JWT
  [container] UserService: Node.js
  [container] OrderService: Node.js
  [container] ProductService: Node.js
}

boundary "Data Stores" {
  [database] PostgreSQL: Primary DB
  [database] Redis: Cache & Sessions
  [database] Elasticsearch: Search
}

boundary "External Services" {
  [external] Stripe: Payments
  [external] SendGrid: Email
  [external] S3: File Storage
}

Customer -> WebApp: Browses
Admin -> AdminPortal: Manages
WebApp -> APIGateway: API calls
APIGateway -> AuthService: Authenticates
APIGateway -> UserService: User ops
APIGateway -> OrderService: Orders
OrderService -> PostgreSQL: Persists
UserService -> Redis: Caches
ProductService -> Elasticsearch: Searches
OrderService -> Stripe: Payments`,
    user: (idea: string, context?: string) => `Generate a well-organized C4 Container diagram for this project.

Project: ${idea}
${context ? `\nContext: ${context}` : ''}

REQUIREMENTS:
- Use boundary blocks to group containers logically
- Include relevant actors (users, admins)
- Show all key containers with their technology
- Group databases and external services in separate boundaries
- Use short 1-3 word connection labels

Generate the C4 DSL only.`,
  },

  sequence: {
    system: `You are an expert software architect. Generate a CLEAN sequence diagram DSL for DDflow.

CRITICAL RULES:
1. Maximum 5 participants
2. Maximum 8-10 messages
3. Use SHORT names (CamelCase, no spaces)
4. Focus on ONE key flow

IMPORTANT: Output ONLY the raw sequence DSL, no markdown code blocks, no explanations.

${DSL_REFERENCES.sequence}

Example output:
participant Client, API, AuthService, Database

Client -> API: POST /login
API -> AuthService: ValidateCredentials
AuthService -> Database: QueryUser
Database --> AuthService: UserData
AuthService -> AuthService: GenerateToken
AuthService --> API: JWTToken
API --> Client: LoginSuccess`,
    user: (idea: string, context?: string) => `Generate a CLEAN sequence diagram for the main user flow.

Project: ${idea}
${context ? `\nContext: ${context}` : ''}

RULES:
- Maximum 5 participants
- 8-10 messages total
- Use -> for requests, --> for responses, ->> for async
- Use A -> A: for internal processing
- Short CamelCase names
- One key flow only

Generate the sequence DSL only.`,
  },

  erd: {
    system: `You are an expert database designer. Generate an ERD using SQL CREATE TABLE syntax for DDflow.

IMPORTANT: Output ONLY the raw SQL DDL statements, no markdown code blocks, no explanations.

${DSL_REFERENCES.erd}

Example output:
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  password_hash VARCHAR(255),
  created_at TIMESTAMP
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(200),
  description TEXT,
  price DECIMAL(10,2),
  stock INTEGER
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
  product_id UUID REFERENCES products(id),
  quantity INTEGER,
  price DECIMAL(10,2)
);`,
    user: (idea: string, context?: string) => `Based on this project idea${context ? ' and the architecture/requirements' : ''}, generate a DDflow ERD using SQL CREATE TABLE syntax with REFERENCES for foreign keys:

Project Idea:
${idea}
${context ? `\nContext:\n${context}` : ''}

Generate 4-6 tables with appropriate relationships. SQL DDL statements only, no explanations.`,
  },

  flowchart: {
    system: `You are an expert process designer. Generate a CLEAN flowchart DSL for DDflow.

CRITICAL RULES:
1. Maximum 8-10 nodes total
2. Use SHORT names (1-2 words)
3. Maximum 2 decision points
4. Clear flow from start to end

IMPORTANT: Output ONLY the raw flowchart DSL, no markdown code blocks, no explanations.

${DSL_REFERENCES.flowchart}

Example output:
(start) Begin
Begin -> (io) GetInput
GetInput -> (process) ValidateData
ValidateData -> (decision) IsValid?
IsValid? -> (process) ProcessData: Yes
IsValid? -> (io) ShowError: No
ProcessData -> (process) SaveResult
SaveResult -> (end) Complete
ShowError -> (io) GetInput: Retry`,
    user: (idea: string, context?: string) => `Generate a CLEAN flowchart for the main business process.

Project: ${idea}
${context ? `\nContext: ${context}` : ''}

RULES:
- Maximum 8-10 nodes total
- Short 1-2 word names
- One main flow with 1-2 decision points
- Use node types: (start), (end), (process), (decision), (io)
- Clear start to end path

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
