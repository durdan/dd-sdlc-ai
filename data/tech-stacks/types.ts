// Company Tech Stacks - TypeScript Type Definitions
// This file defines all types for the tech stacks feature

// ===== COMPANY CATEGORY TYPES =====

export type CompanyCategory =
  | 'streaming'
  | 'fintech'
  | 'e-commerce'
  | 'social-media'
  | 'transportation'
  | 'saas'
  | 'cloud-infrastructure'
  | 'gaming'
  | 'enterprise'
  | 'developer-tools'
  | 'ai-ml'
  | 'healthcare'
  | 'education'
  | 'communication';

export interface CategoryMeta {
  slug: CompanyCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// ===== COMPANY INFO TYPES =====

export interface CompanyInfo {
  founded: number;
  headquarters: string;
  employees: string;
  revenue?: string;
  publiclyTraded: boolean;
  ticker?: string;
  website: string;
}

export interface CompanyMetrics {
  users?: string;
  monthlyActiveUsers?: string;
  dailyActiveUsers?: string;
  requestsPerSecond?: string;
  requestsPerDay?: string;
  uptime?: string;
  latency?: string;
  dataProcessed?: string;
  regionsServed?: number;
  customMetrics?: CustomMetric[];
}

export interface CustomMetric {
  label: string;
  value: string;
  icon?: string;
}

// ===== TECH STACK TYPES =====

export type TechCategory =
  | 'language'
  | 'framework'
  | 'library'
  | 'database'
  | 'cache'
  | 'queue'
  | 'search'
  | 'container'
  | 'orchestration'
  | 'ci-cd'
  | 'monitoring'
  | 'cdn'
  | 'api-gateway'
  | 'storage'
  | 'analytics'
  | 'ml-framework'
  | 'security'
  | 'other';

export type TechUsage =
  | 'primary'
  | 'secondary'
  | 'experimental'
  | 'legacy'
  | 'migrating-from'
  | 'migrating-to';

export interface TechLayer {
  name: string;
  category: TechCategory;
  usage: TechUsage;
  icon?: string;
  isPrimary?: boolean;
  description?: string;
}

export interface TechStack {
  frontend: TechLayer[];
  backend: TechLayer[];
  databases: TechLayer[];
  infrastructure: TechLayer[];
  devOps: TechLayer[];
  dataEngineering?: TechLayer[];
  ml?: TechLayer[];
  mobile?: TechLayer[];
  security?: TechLayer[];
}

// ===== ARCHITECTURE TYPES =====

export type ArchitectureType =
  | 'microservices'
  | 'monolith'
  | 'serverless'
  | 'event-driven'
  | 'hybrid'
  | 'modular-monolith';

export type ArchitectureStyle =
  | 'distributed'
  | 'centralized'
  | 'federated'
  | 'layered'
  | 'hexagonal'
  | 'cqrs';

export interface DiagramItem {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  techStack?: string[];
}

export interface DiagramLayer {
  id: string;
  name: string;
  position: 'top' | 'middle' | 'bottom';
  color: string;
  items: DiagramItem[];
}

export interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
  type: 'data-flow' | 'api-call' | 'event' | 'sync' | 'async';
}

export interface HtmlArchitectureDiagram {
  title: string;
  subtitle?: string;
  layers: DiagramLayer[];
  connections: DiagramConnection[];
}

export interface ArchitectureComponent {
  name: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
}

export interface ArchitectureData {
  type: ArchitectureType;
  style: ArchitectureStyle;
  description: string;
  htmlDiagram: HtmlArchitectureDiagram;
  mermaidDiagram: string;
  components: ArchitectureComponent[];
}

// ===== DETAILED MERMAID DIAGRAMS =====

export interface ArchitectureDiagrams {
  overview: string;           // High-level system architecture
  dataFlow: string;           // How data moves through the system
  deployment: string;         // Infrastructure and deployment topology
  serviceInteraction: string; // How services communicate with each other
}

// ===== DESIGN PATTERN REFERENCES =====

export type PatternCategory =
  | 'architectural'
  | 'data'
  | 'messaging'
  | 'resilience'
  | 'deployment';

export interface PatternReference {
  patternSlug: string;        // Links to /patterns/[slug]
  patternName: string;        // Display name
  usage: string;              // How they use it
  implementation: string;     // Specific implementation details
  scale?: string;             // At what scale they operate
}

// ===== TECHNICAL DECISIONS (ADRs) =====

export interface TechnicalDecision {
  title: string;              // e.g., "Why Cassandra over MySQL"
  context: string;            // Problem they faced
  decision: string;           // What they chose
  consequences: string[];     // Trade-offs accepted
  alternatives?: string[];    // Other options considered
  sources: string[];          // Blog posts, talks, papers
}

// ===== HIGHLIGHTS & INNOVATION TYPES =====

export interface Highlight {
  title: string;
  description: string;
  impact: string;
  technologies: string[];
  icon: string;
}

export interface ScaleMetric {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  context?: string;
}

export interface InnovationArea {
  name: string;
  description: string;
  technologies: string[];
  yearStarted?: number;
}

export interface OpenSourceProject {
  name: string;
  description: string;
  url: string;
  stars?: number;
  language?: string;
}

export interface BlogPost {
  title: string;
  url: string;
  date: string;
  topic: string;
}

export interface ScaleInnovation {
  scaleMetrics: ScaleMetric[];
  innovationAreas: InnovationArea[];
  openSource?: OpenSourceProject[];
  blogPosts?: BlogPost[];
  engineeringBlog?: string;
}

// ===== MAIN COMPANY TYPE =====

export interface Company {
  slug: string;
  name: string;
  logo: string;
  description: string;
  category: CompanyCategory;
  tags: string[];

  info: CompanyInfo;
  metrics: CompanyMetrics;
  techStack: TechStack;
  architecture: ArchitectureData;
  highlights: Highlight[];
  scaleInnovation: ScaleInnovation;

  // Enhanced Phase 2 fields
  architectureDiagrams?: ArchitectureDiagrams;  // Detailed Mermaid diagrams
  patterns?: PatternReference[];                 // Links to design patterns
  technicalDecisions?: TechnicalDecision[];     // ADR-style decisions

  lastUpdated: string;
  sources: string[];
}

// ===== USER INTERACTION TYPES =====

export interface UserFavorite {
  id: string;
  userId: string;
  companySlug: string;
  createdAt: string;
}

export interface UserNote {
  id: string;
  userId: string;
  companySlug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityRating {
  id: string;
  companySlug: string;
  userId: string;
  helpfulness: number;
  accuracy: number;
  createdAt: string;
}

export interface RatingAggregate {
  companySlug: string;
  averageHelpfulness: number;
  averageAccuracy: number;
  totalRatings: number;
}

// ===== SEARCH & FILTER TYPES =====

export interface SearchFilters {
  query?: string;
  category?: CompanyCategory | 'all';
  technology?: string;
  architectureType?: ArchitectureType;
  scale?: 'startup' | 'scale-up' | 'enterprise';
}

export type ViewMode = 'grid' | 'list';

export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'category'
  | 'popularity'
  | 'recently-updated';
