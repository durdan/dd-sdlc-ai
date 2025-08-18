import axios, { AxiosInstance, AxiosError } from 'axios';
import EventSource from 'eventsource';
import { configStore } from './simple-config';
import chalk from 'chalk';
import ora from 'ora';
import { version } from '../../package.json';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  documents?: Document[];
}

export interface Document {
  id: string;
  project_id: string;
  document_type: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: configStore.get('apiUrl'),
      timeout: 300000, // 5 minutes - increased for LLM generation
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const auth = configStore.get('auth');
        if (auth?.token) {
          config.headers.Authorization = `Bearer ${auth.token}`;
        }
        
        // For anonymous users, add a header to indicate CLI usage
        if (!auth?.token) {
          config.headers['X-Client-Type'] = 'cli-anonymous';
          config.headers['X-CLI-Version'] = version;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Only exit on 401 if user was trying to use authenticated features
        if (error.response?.status === 401) {
          const auth = configStore.get('auth');
          if (auth?.token) {
            // User has a token but it's invalid/expired
            console.log(chalk.red('\n❌ Authentication failed - token may be expired'));
            console.log(chalk.gray('Please run: sdlc auth login'));
            process.exit(1);
          }
          // For anonymous users, let the error bubble up to be handled by the command
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/auth/login', { email, password });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async loginWithToken(token: string): Promise<ApiResponse> {
    try {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await this.client.get('/api/auth/me');
      return { success: true, data: { ...response.data, token } };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      await this.client.post('/api/auth/logout');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  // Document Generation
  async generateDocuments(
    input: string,
    options: any = {}
  ): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/generate-sdlc', {
        input: input,  // Changed from userRequirement to input
        ...options
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  // Streaming generation
  generateDocumentsStream(
    input: string,
    options: any = {},
    onData: (data: any) => void,
    onError: (error: string) => void,
    onComplete: () => void
  ): EventSource {
    const auth = configStore.get('auth');
    const apiKey = configStore.get('apiKey');
    const apiUrl = configStore.get('apiUrl');

    // Filter out undefined values from options
    const cleanOptions: Record<string, any> = {};
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined && value !== null) {
        cleanOptions[key] = value;
      }
    }

    const params = new URLSearchParams({
      input: input,  // Changed from userRequirement to input
      ...cleanOptions
    });

    const headers: Record<string, string> = {};
    if (auth?.token) {
      headers['Authorization'] = `Bearer ${auth.token}`;
    } else {
      // Add anonymous CLI headers
      headers['X-Client-Type'] = 'cli-anonymous';
      headers['X-CLI-Version'] = version;
    }
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const url = `${apiUrl}/api/generate-sdlc/stream?${params}`;
    const eventSource = new EventSource(url, { headers });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Debug logging
        if (process.env.DEBUG_STREAM) {
          console.log('Stream event:', data.type, data.documentType || '');
        }
        
        // Always call onData to process the event
        onData(data);
        
        // Handle done event - but don't call onComplete here
        // Let the generate command handle it when it sees the done event
        if (data.type === 'done') {
          eventSource.close();
        }
      } catch (err) {
        console.error('Error parsing stream data:', err);
        console.error('Raw event data:', event.data);
      }
    };

    eventSource.onerror = (error: any) => {
      // EventSource errors are often not very descriptive
      // Check if it's actually a connection issue or just the stream ending
      if (eventSource.readyState === EventSource.CLOSED) {
        // Stream closed normally or by server
        console.debug('Stream closed');
      } else {
        console.error('EventSource error:', error);
        onError(error.message || 'Stream connection error');
      }
      eventSource.close();
    };

    // Note: 'complete' is not a standard EventSource event
    // We handle completion through the 'done' message type instead

    return eventSource;
  }

  // Project Management
  async createProject(title: string, description?: string): Promise<ApiResponse<Project>> {
    try {
      const response = await this.client.post('/api/projects', { title, description });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async listProjects(options: any = {}): Promise<ApiResponse<Project[]>> {
    try {
      const response = await this.client.get('/api/projects', { params: options });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    try {
      const response = await this.client.get(`/api/projects/${projectId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<ApiResponse<Project>> {
    try {
      const response = await this.client.put(`/api/projects/${projectId}`, updates);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async deleteProject(projectId: string): Promise<ApiResponse> {
    try {
      await this.client.delete(`/api/projects/${projectId}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  // Document Export
  async exportProject(projectId: string, format: string): Promise<ApiResponse<Buffer>> {
    try {
      const response = await this.client.get(`/api/projects/${projectId}/export`, {
        params: { format },
        responseType: 'arraybuffer'
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  // Meeting Transcript
  async generateMeetingTranscript(
    transcript: string,
    options: any = {}
  ): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/generate-meeting-transcript', {
        transcript,
        ...options
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  // Statistics
  async getStats(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/stats');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/api/health');
      return true;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();