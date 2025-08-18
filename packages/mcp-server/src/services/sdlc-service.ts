import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger.js';

export interface SDLCServiceConfig {
  apiUrl: string;
  apiKey?: string;
  openAIKey?: string;
  anthropicKey?: string;
}

export interface GenerateDocumentParams {
  input: string;
  documentType: string;
  customPrompt?: string;
  aiProvider?: string;
  model?: string;
}

export interface GenerateMultipleDocumentsParams {
  input: string;
  documentTypes: string[];
  customPrompt?: string;
  aiProvider?: string;
}

export interface Document {
  id: string;
  type: string;
  content: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  documents?: Document[];
  document_count?: number;
}

export interface GitHubAnalysis {
  repoName: string;
  summary: string;
  techStack: string[];
  documents: Array<{
    type: string;
    content: string;
  }>;
}

export class SDLCService {
  private client: AxiosInstance;
  private config: SDLCServiceConfig;

  constructor(config: SDLCServiceConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: 300000, // 5 minutes for AI generation
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-API-Key': config.apiKey }),
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error(`API Error: ${error.response?.status} ${error.response?.statusText}`);
        return Promise.reject(error);
      }
    );
  }

  async generateDocument(params: GenerateDocumentParams): Promise<{ content: string; projectId: string }> {
    try {
      const response = await this.client.post('/api/generate-sdlc', {
        userRequirement: params.input,
        input: params.input, // Support both field names
        documentTypes: [params.documentType],
        customPrompt: params.customPrompt,
        aiProvider: params.aiProvider,
        model: params.model,
        openaiKey: this.config.openAIKey,
        anthropicKey: this.config.anthropicKey,
      });

      const data = response.data;
      
      // Handle different response formats
      const content = data.data?.[params.documentType] || 
                     data[params.documentType] || 
                     data.content ||
                     'Document generation completed but content not found';
      
      const projectId = data.projectId || data.project_id || 'unknown';

      return {
        content,
        projectId,
      };
    } catch (error) {
      logger.error('Failed to generate document:', error);
      
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.data?.error || error.message}`);
      }
      
      throw error;
    }
  }

  async generateMultipleDocuments(params: GenerateMultipleDocumentsParams): Promise<{
    documents: Array<{ type: string; content: string }>;
    projectId: string;
  }> {
    try {
      const response = await this.client.post('/api/generate-sdlc', {
        userRequirement: params.input,
        input: params.input,
        documentTypes: params.documentTypes,
        customPrompt: params.customPrompt,
        aiProvider: params.aiProvider,
        openaiKey: this.config.openAIKey,
        anthropicKey: this.config.anthropicKey,
      });

      const data = response.data;
      const documents: Array<{ type: string; content: string }> = [];
      
      // Extract documents from response
      if (data.data) {
        for (const [type, content] of Object.entries(data.data)) {
          if (typeof content === 'string') {
            documents.push({ type, content });
          }
        }
      } else {
        // Try to extract from direct response
        for (const type of params.documentTypes) {
          if (data[type]) {
            documents.push({ type, content: data[type] });
          }
        }
      }

      const projectId = data.projectId || data.project_id || 'unknown';

      return {
        documents,
        projectId,
      };
    } catch (error) {
      logger.error('Failed to generate multiple documents:', error);
      
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.data?.error || error.message}`);
      }
      
      throw error;
    }
  }

  async listProjects(params: { limit?: number; offset?: number }): Promise<Project[]> {
    try {
      const response = await this.client.get('/api/projects', {
        params: {
          limit: params.limit || 10,
          offset: params.offset || 0,
        },
      });

      return response.data.projects || response.data || [];
    } catch (error) {
      logger.error('Failed to list projects:', error);
      
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.data?.error || error.message}`);
      }
      
      throw error;
    }
  }

  async getProject(projectId: string): Promise<Project> {
    try {
      const response = await this.client.get(`/api/projects/${projectId}`);
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to get project ${projectId}:`, error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Project not found: ${projectId}`);
        }
        throw new Error(`API Error: ${error.response?.data?.error || error.message}`);
      }
      
      throw error;
    }
  }

  async analyzeGitHubRepo(params: { repoUrl: string; branch?: string }): Promise<GitHubAnalysis> {
    try {
      // Extract owner and repo from URL
      const match = params.repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error('Invalid GitHub repository URL');
      }
      
      const [, owner, repo] = match;
      
      // Call GitHub analysis endpoint
      const response = await this.client.post('/api/analyze-github', {
        owner,
        repo,
        branch: params.branch || 'main',
        openaiKey: this.config.openAIKey,
      });

      const data = response.data;
      
      // Generate SDLC documents based on analysis
      const analysisInput = `
        Repository: ${owner}/${repo}
        Description: ${data.description || 'No description'}
        Language: ${data.language || 'Unknown'}
        Tech Stack: ${data.techStack?.join(', ') || 'Unknown'}
        
        Repository Structure:
        ${data.structure || 'Unable to analyze structure'}
        
        README Content:
        ${data.readme || 'No README found'}
      `;

      // Generate comprehensive documentation
      const docsResponse = await this.generateMultipleDocuments({
        input: analysisInput,
        documentTypes: ['technical', 'architecture', 'functional'],
        aiProvider: params.aiProvider || 'auto',
      });

      return {
        repoName: `${owner}/${repo}`,
        summary: data.description || 'Repository analyzed successfully',
        techStack: data.techStack || [],
        documents: docsResponse.documents,
      };
    } catch (error) {
      logger.error('Failed to analyze GitHub repo:', error);
      
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.data?.error || error.message}`);
      }
      
      throw error;
    }
  }
}