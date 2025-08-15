import * as vscode from 'vscode';
import { AuthService } from '../services/authService';
import { UsageTracker } from '../services/usageTracker';

export class AccountProvider implements vscode.TreeDataProvider<AccountItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<AccountItem | undefined | null | void> = new vscode.EventEmitter<AccountItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<AccountItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(
        private context: vscode.ExtensionContext,
        private authService: AuthService,
        private usageTracker: UsageTracker
    ) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: AccountItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: AccountItem): Promise<AccountItem[]> {
        if (!element) {
            const items: AccountItem[] = [];
            
            // Get user status
            const user = this.authService.getUser();
            const isAuthenticated = await this.authService.isAuthenticated();
            
            if (isAuthenticated && user) {
                items.push(new AccountItem(
                    'Status',
                    'Signed In',
                    'account',
                    new vscode.ThemeIcon('account')
                ));
                items.push(new AccountItem(
                    'Email',
                    user.email,
                    'email',
                    new vscode.ThemeIcon('mail')
                ));
            } else {
                items.push(new AccountItem(
                    'Status',
                    'Anonymous',
                    'account',
                    new vscode.ThemeIcon('account')
                ));
                items.push(new AccountItem(
                    'Sign In',
                    'Get more documents',
                    'signin',
                    new vscode.ThemeIcon('sign-in'),
                    {
                        command: 'sdlc-doc-generator.signIn',
                        title: 'Sign In',
                        arguments: []
                    }
                ));
            }
            
            // Get usage info
            const usage = await this.usageTracker.getCurrentUsage();
            const remaining = await this.usageTracker.getRemainingGenerations();
            const limit = isAuthenticated ? 20 : 10;
            
            items.push(new AccountItem(
                'Daily Limit',
                `${usage.count}/${limit} used`,
                'usage',
                new vscode.ThemeIcon('graph')
            ));
            
            items.push(new AccountItem(
                'Remaining',
                `${remaining} documents`,
                'remaining',
                new vscode.ThemeIcon('clock')
            ));
            
            // Add sign out option if authenticated
            if (isAuthenticated) {
                items.push(new AccountItem(
                    'Sign Out',
                    '',
                    'signout',
                    new vscode.ThemeIcon('sign-out'),
                    {
                        command: 'sdlc-doc-generator.signOut',
                        title: 'Sign Out',
                        arguments: []
                    }
                ));
            }
            
            return items;
        }
        return [];
    }
}

class AccountItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
        public readonly contextValue: string,
        public readonly iconPath: vscode.ThemeIcon,
        public readonly command?: vscode.Command
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${this.label}: ${this.description}`;
    }
}