"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentGeneratorProvider = void 0;
class DocumentGeneratorProvider {
    constructor(context, apiClient, usageTracker) {
        this.context = context;
        this.apiClient = apiClient;
        this.usageTracker = usageTracker;
    }
    async generateDocument(options) {
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
        const request = {
            type,
            input
        };
        // Use streaming if progress callback provided
        if (onProgress) {
            return await this.apiClient.streamGenerateDocument(request, onProgress);
        }
        else {
            return await this.apiClient.generateDocument(request);
        }
    }
}
exports.DocumentGeneratorProvider = DocumentGeneratorProvider;
//# sourceMappingURL=documentGeneratorProvider.js.map