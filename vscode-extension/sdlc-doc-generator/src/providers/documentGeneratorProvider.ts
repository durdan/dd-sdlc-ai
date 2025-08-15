import * as vscode from 'vscode';
import { ApiClient, GenerateDocumentRequest } from '../services/apiClient';
import { UsageTracker } from '../services/usageTracker';

export interface GenerateOptions {
    type: string;
    input: string;
    onProgress?: (chunk: string) => void;
    cancellationToken?: vscode.CancellationToken;
}

export class DocumentGeneratorProvider {
    constructor(
        private context: vscode.ExtensionContext,
        private apiClient: ApiClient,
        private usageTracker: UsageTracker
    ) {}

    async generateDocument(options: GenerateOptions): Promise<any> {
        const { type, input, onProgress, cancellationToken } = options;

        // Check if cancelled
        if (cancellationToken?.isCancellationRequested) {
            return { success: false, error: 'Generation cancelled' };
        }

        // Check usage limits
        const canGenerate = await this.usageTracker.canGenerate();
        if (!canGenerate.allowed) {
            return { success: false, error: canGenerate.reason };
        }

        // Prepare request
        const request: GenerateDocumentRequest = {
            type,
            input
        };

        // Use streaming if progress callback provided
        if (onProgress) {
            return await this.apiClient.streamGenerateDocument(request, onProgress);
        } else {
            return await this.apiClient.generateDocument(request);
        }
    }
}