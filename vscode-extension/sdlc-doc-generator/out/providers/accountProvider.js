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
exports.AccountProvider = void 0;
const vscode = __importStar(require("vscode"));
class AccountProvider {
    constructor(context, authService, usageTracker) {
        this.context = context;
        this.authService = authService;
        this.usageTracker = usageTracker;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (!element) {
            const items = [];
            // Get user status
            const user = this.authService.getUser();
            const isAuthenticated = await this.authService.isAuthenticated();
            if (isAuthenticated && user) {
                items.push(new AccountItem('Status', 'Signed In', 'account', new vscode.ThemeIcon('account')));
                items.push(new AccountItem('Email', user.email, 'email', new vscode.ThemeIcon('mail')));
            }
            else {
                items.push(new AccountItem('Status', 'Anonymous', 'account', new vscode.ThemeIcon('account')));
                items.push(new AccountItem('Sign In', 'Get more documents', 'signin', new vscode.ThemeIcon('sign-in'), {
                    command: 'sdlc-doc-generator.signIn',
                    title: 'Sign In',
                    arguments: []
                }));
            }
            // Get usage info
            const usage = await this.usageTracker.getCurrentUsage();
            const remaining = await this.usageTracker.getRemainingGenerations();
            const limit = isAuthenticated ? 20 : 10;
            items.push(new AccountItem('Daily Limit', `${usage.count}/${limit} used`, 'usage', new vscode.ThemeIcon('graph')));
            items.push(new AccountItem('Remaining', `${remaining} documents`, 'remaining', new vscode.ThemeIcon('clock')));
            // Add sign out option if authenticated
            if (isAuthenticated) {
                items.push(new AccountItem('Sign Out', '', 'signout', new vscode.ThemeIcon('sign-out'), {
                    command: 'sdlc-doc-generator.signOut',
                    title: 'Sign Out',
                    arguments: []
                }));
            }
            return items;
        }
        return [];
    }
}
exports.AccountProvider = AccountProvider;
class AccountItem extends vscode.TreeItem {
    constructor(label, description, contextValue, iconPath, command) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.description = description;
        this.contextValue = contextValue;
        this.iconPath = iconPath;
        this.command = command;
        this.tooltip = `${this.label}: ${this.description}`;
    }
}
//# sourceMappingURL=accountProvider.js.map