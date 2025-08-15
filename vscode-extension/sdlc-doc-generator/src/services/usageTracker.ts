import * as vscode from 'vscode';
import { AuthService } from './authService';

export interface UsageData {
    date: string;
    count: number;
    documents: Array<{
        type: string;
        timestamp: number;
        title?: string;
    }>;
}

export class UsageTracker {
    private static readonly USAGE_KEY = 'sdlc-doc-generator.usage';
    private readonly _onUsageChanged = new vscode.EventEmitter<UsageData>();
    public readonly onUsageChanged = this._onUsageChanged.event;

    constructor(
        private context: vscode.ExtensionContext,
        private authService: AuthService
    ) {}

    async getCurrentUsage(): Promise<UsageData> {
        const today = new Date().toISOString().split('T')[0];
        const usageKey = this.getUsageKey();
        const storedUsage = this.context.globalState.get<UsageData>(usageKey);

        if (storedUsage && storedUsage.date === today) {
            return storedUsage;
        }

        // Reset for new day
        const newUsage: UsageData = {
            date: today,
            count: 0,
            documents: []
        };

        await this.context.globalState.update(usageKey, newUsage);
        return newUsage;
    }

    async canGenerate(): Promise<{ allowed: boolean; reason?: string }> {
        const usage = await this.getCurrentUsage();
        const isAuthenticated = await this.authService.isAuthenticated();
        const limit = isAuthenticated ? 20 : 10;

        if (usage.count >= limit) {
            const resetTime = this.getResetTime();
            return {
                allowed: false,
                reason: `Daily limit reached (${limit} documents). Resets at ${resetTime}. ${
                    !isAuthenticated ? 'Sign in to get 20 documents per day.' : ''
                }`
            };
        }

        return { allowed: true };
    }

    async trackUsage(documentType: string, title?: string): Promise<void> {
        const usage = await this.getCurrentUsage();
        
        usage.count++;
        usage.documents.push({
            type: documentType,
            timestamp: Date.now(),
            title
        });

        const usageKey = this.getUsageKey();
        await this.context.globalState.update(usageKey, usage);
        this._onUsageChanged.fire(usage);
    }

    async getHistory(limit: number = 10): Promise<Array<{
        type: string;
        timestamp: number;
        title?: string;
    }>> {
        const usage = await this.getCurrentUsage();
        return usage.documents.slice(-limit).reverse();
    }

    async getRemainingGenerations(): Promise<number> {
        const usage = await this.getCurrentUsage();
        const isAuthenticated = await this.authService.isAuthenticated();
        const limit = isAuthenticated ? 20 : 10;
        return Math.max(0, limit - usage.count);
    }

    private getUsageKey(): string {
        const user = this.authService.getUser();
        if (user?.isAuthenticated) {
            return `${UsageTracker.USAGE_KEY}.${user.id}`;
        }
        return `${UsageTracker.USAGE_KEY}.${this.authService.getDeviceId()}`;
    }

    private getResetTime(): string {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const hours = Math.floor((tomorrow.getTime() - Date.now()) / (1000 * 60 * 60));
        const minutes = Math.floor(((tomorrow.getTime() - Date.now()) % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    async clearHistory(): Promise<void> {
        const usage = await this.getCurrentUsage();
        usage.documents = [];
        
        const usageKey = this.getUsageKey();
        await this.context.globalState.update(usageKey, usage);
        this._onUsageChanged.fire(usage);
    }
}