"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageTracker = void 0;
const vscode = __importStar(require("vscode"));
class UsageTracker {
    constructor(context, authService) {
        this.context = context;
        this.authService = authService;
        this._onUsageChanged = new vscode.EventEmitter();
        this.onUsageChanged = this._onUsageChanged.event;
    }
    async getCurrentUsage() {
        const today = new Date().toISOString().split('T')[0];
        const usageKey = this.getUsageKey();
        const storedUsage = this.context.globalState.get(usageKey);
        if (storedUsage && storedUsage.date === today) {
            return storedUsage;
        }
        // Reset for new day
        const newUsage = {
            date: today,
            count: 0,
            documents: []
        };
        await this.context.globalState.update(usageKey, newUsage);
        return newUsage;
    }
    async canGenerate() {
        const usage = await this.getCurrentUsage();
        const isAuthenticated = await this.authService.isAuthenticated();
        const limit = isAuthenticated ? 20 : 10;
        if (usage.count >= limit) {
            const resetTime = this.getResetTime();
            return {
                allowed: false,
                reason: `Daily limit reached (${limit} documents). Resets at ${resetTime}. ${!isAuthenticated ? 'Sign in to get 20 documents per day.' : ''}`
            };
        }
        return { allowed: true };
    }
    async trackUsage(documentType, title) {
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
    async getHistory(limit = 10) {
        const usage = await this.getCurrentUsage();
        return usage.documents.slice(-limit).reverse();
    }
    async getRemainingGenerations() {
        const usage = await this.getCurrentUsage();
        const isAuthenticated = await this.authService.isAuthenticated();
        const limit = isAuthenticated ? 20 : 10;
        return Math.max(0, limit - usage.count);
    }
    getUsageKey() {
        const user = this.authService.getUser();
        if (user?.isAuthenticated) {
            return `${UsageTracker.USAGE_KEY}.${user.id}`;
        }
        return `${UsageTracker.USAGE_KEY}.${this.authService.getDeviceId()}`;
    }
    getResetTime() {
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
    async clearHistory() {
        const usage = await this.getCurrentUsage();
        usage.documents = [];
        const usageKey = this.getUsageKey();
        await this.context.globalState.update(usageKey, usage);
        this._onUsageChanged.fire(usage);
    }
}
exports.UsageTracker = UsageTracker;
UsageTracker.USAGE_KEY = 'sdlc-doc-generator.usage';
//# sourceMappingURL=usageTracker.js.map