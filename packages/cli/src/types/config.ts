export interface ConfigSchema {
  apiKey?: string;
  apiUrl: string;
  aiProvider: 'openai' | 'anthropic' | 'auto';
  outputDir: string;
  defaultFormat: 'markdown' | 'json' | 'pdf' | 'html';
  profile: string;
  profiles: Record<string, Partial<ConfigSchema>>;
  auth?: {
    token?: string;
    refreshToken?: string;
    expiresAt?: number;
    email?: string;
    userId?: string;
  };
}

export const DEFAULT_CONFIG: ConfigSchema = {
  apiUrl: process.env.SDLC_API_URL || 'http://localhost:3000',
  aiProvider: 'auto',
  outputDir: './sdlc-docs',
  defaultFormat: 'markdown',
  profile: 'default',
  profiles: {}
};

export interface GenerateOptions {
  type?: string[];
  aiProvider?: 'openai' | 'anthropic' | 'auto';
  model?: string;
  output?: string;
  format?: 'markdown' | 'json' | 'pdf' | 'html';
  customPrompt?: string;
  batch?: boolean;
  fast?: boolean;
  quality?: 'low' | 'medium' | 'high';
  cache?: boolean;
  parallel?: boolean;
  dryRun?: boolean;
  ci?: boolean;
  projectId?: string;
  file?: string;
  stream?: boolean;
}

export interface ProjectOptions {
  template?: string;
  fromFile?: string;
  recent?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  description?: string;
}

export interface ExportOptions {
  format?: string[];
  output?: string;
  type?: string[];
  latest?: boolean;
  all?: boolean;
  dateRange?: string;
}

export interface DocumentType {
  key: string;
  name: string;
  description: string;
  emoji: string;
}

export const DOCUMENT_TYPES: DocumentType[] = [
  { key: 'business', name: 'Business Analysis', description: 'Business requirements and analysis', emoji: '📊' },
  { key: 'functional', name: 'Functional Specification', description: 'Functional requirements and features', emoji: '⚙️' },
  { key: 'technical', name: 'Technical Specification', description: 'Technical architecture and implementation', emoji: '🔧' },
  { key: 'ux', name: 'UX Design Specification', description: 'User experience and interface design', emoji: '🎨' },
  { key: 'test', name: 'Test Specification', description: 'Test plans and test cases', emoji: '🧪' },
  { key: 'architecture', name: 'Architecture Diagrams', description: 'System architecture and diagrams', emoji: '🏗️' },
  { key: 'meeting', name: 'Meeting Transcript', description: 'Meeting summary and action items', emoji: '📝' },
  { key: 'coding', name: 'AI Coding Assistant', description: 'Code generation prompts', emoji: '💻' }
];