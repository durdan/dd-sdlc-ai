import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';
import { AuthService } from './authService';

export interface GenerateDocumentRequest {
    type: string;
    input: string;
    context?: {
        projectName?: string;
        language?: string;
        framework?: string;
        files?: string[];
    };
}

export interface GenerateDocumentResponse {
    success: boolean;
    document?: {
        id: string;
        type: string;
        content: string;
        title: string;
        timestamp: number;
    };
    error?: string;
}

export class ApiClient {
    private client: AxiosInstance;
    private apiEndpoint: string;

    constructor(
        private context: vscode.ExtensionContext,
        private authService: AuthService
    ) {
        const config = vscode.workspace.getConfiguration('sdlc-doc-generator');
        // Use localhost for development
        this.apiEndpoint = 'http://localhost:3000/api/vscode';
        // Uncomment for production:
        // this.apiEndpoint = config.get<string>('apiEndpoint') || 'https://www.sdlc.dev/api/vscode';

        this.client = axios.create({
            baseURL: this.apiEndpoint,
            timeout: 30000, // 30 second timeout
            headers: {
                'Content-Type': 'application/json',
                'X-Extension-Version': this.getExtensionVersion()
            }
        });

        // Add auth interceptor
        this.client.interceptors.request.use(async (config) => {
            const token = await this.authService.getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            
            // Always include device ID
            config.headers['X-Device-Id'] = this.authService.getDeviceId();
            
            return config;
        });
    }

    async generateDocument(request: GenerateDocumentRequest): Promise<GenerateDocumentResponse> {
        try {
            // Add workspace context if available
            if (vscode.workspace.workspaceFolders) {
                const workspaceFolder = vscode.workspace.workspaceFolders[0];
                request.context = request.context || {};
                request.context.projectName = workspaceFolder.name;

                // Try to detect language and framework
                const detectedContext = await this.detectProjectContext(workspaceFolder.uri);
                request.context = { ...request.context, ...detectedContext };
            }

            const response = await this.client.post<GenerateDocumentResponse>('/generate', request);
            return response.data;
        } catch (error: any) {
            console.error('API Error:', error);
            
            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                return {
                    success: false,
                    error: 'Request timed out. The document generation is taking too long. Please try with simpler requirements.'
                };
            }

            if (error.response?.status === 429) {
                return {
                    success: false,
                    error: 'Rate limit exceeded. Please try again later.'
                };
            }

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'Authentication required. Please sign in.'
                };
            }

            if (error.response?.status === 500) {
                return {
                    success: false,
                    error: 'Server error. Please ensure the main app is running (npm run dev) and try again.'
                };
            }

            return {
                success: false,
                error: error.message || 'Failed to generate document'
            };
        }
    }

    async streamGenerateDocument(
        request: GenerateDocumentRequest,
        onChunk: (chunk: string) => void
    ): Promise<GenerateDocumentResponse> {
        try {
            const response = await this.client.post('/generate/stream', request, {
                responseType: 'stream'
            });

            return new Promise((resolve, reject) => {
                let fullContent = '';
                let metadata: any = {};

                response.data.on('data', (chunk: Buffer) => {
                    const text = chunk.toString();
                    const lines = text.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') {
                                resolve({
                                    success: true,
                                    document: {
                                        id: metadata.id || 'generated',
                                        type: request.type,
                                        content: fullContent,
                                        title: metadata.title || 'Generated Document',
                                        timestamp: Date.now()
                                    }
                                });
                            } else {
                                try {
                                    const parsed = JSON.parse(data);
                                    if (parsed.content) {
                                        fullContent += parsed.content;
                                        onChunk(parsed.content);
                                    }
                                    if (parsed.metadata) {
                                        metadata = parsed.metadata;
                                    }
                                } catch (e) {
                                    // Ignore parse errors
                                }
                            }
                        }
                    }
                });

                response.data.on('error', (error: Error) => {
                    reject(error);
                });
            });
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to generate document'
            };
        }
    }

    async checkUsage(): Promise<{
        used: number;
        limit: number;
        resetTime: string;
    }> {
        try {
            const response = await this.client.get('/usage');
            return response.data;
        } catch (error) {
            // Fallback to local tracking
            return {
                used: 0,
                limit: 10,
                resetTime: '24 hours'
            };
        }
    }

    private async detectProjectContext(workspaceUri: vscode.Uri): Promise<any> {
        const context: any = {};

        // Check for common project files
        const files = await vscode.workspace.fs.readDirectory(workspaceUri);
        const fileNames = files.map(([name]) => name);

        // Detect language and framework
        if (fileNames.includes('package.json')) {
            try {
                const packageJsonUri = vscode.Uri.joinPath(workspaceUri, 'package.json');
                const content = await vscode.workspace.fs.readFile(packageJsonUri);
                const packageJson = JSON.parse(content.toString());
                
                context.language = 'JavaScript/TypeScript';
                
                // Detect framework
                const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
                if (deps.react) context.framework = 'React';
                else if (deps.vue) context.framework = 'Vue';
                else if (deps.angular) context.framework = 'Angular';
                else if (deps.next) context.framework = 'Next.js';
                else if (deps.express) context.framework = 'Express';
            } catch {
                // Ignore errors
            }
        } else if (fileNames.includes('requirements.txt') || fileNames.includes('setup.py')) {
            context.language = 'Python';
            if (fileNames.includes('manage.py')) context.framework = 'Django';
        } else if (fileNames.includes('pom.xml')) {
            context.language = 'Java';
            context.framework = 'Maven';
        } else if (fileNames.includes('build.gradle')) {
            context.language = 'Java';
            context.framework = 'Gradle';
        } else if (fileNames.includes('Cargo.toml')) {
            context.language = 'Rust';
        } else if (fileNames.includes('go.mod')) {
            context.language = 'Go';
        }

        return context;
    }

    private getExtensionVersion(): string {
        const packageJson = require('../../package.json');
        return packageJson.version || '1.0.0';
    }
}