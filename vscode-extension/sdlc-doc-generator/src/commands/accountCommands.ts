import * as vscode from 'vscode';
import { AuthService } from '../services/authService';
import { UsageTracker } from '../services/usageTracker';

export class AccountCommands {
    constructor(
        private context: vscode.ExtensionContext,
        private authService: AuthService,
        private usageTracker: UsageTracker
    ) {}

    async signIn(): Promise<void> {
        await this.authService.signIn();
    }

    async signOut(): Promise<void> {
        await this.authService.signOut();
    }

    async checkUsage(): Promise<void> {
        const usage = await this.usageTracker.getCurrentUsage();
        const remaining = await this.usageTracker.getRemainingGenerations();
        const isAuthenticated = await this.authService.isAuthenticated();
        const user = this.authService.getUser();
        const limit = isAuthenticated ? 20 : 10;

        // Create usage report
        const report = [
            `**Account Status**`,
            user ? `Email: ${user.email}` : 'Status: Anonymous User',
            '',
            `**Usage Today**`,
            `Documents Generated: ${usage.count}/${limit}`,
            `Remaining: ${remaining}`,
            '',
            `**Recent Documents**`,
            ...usage.documents.slice(-5).reverse().map(doc => 
                `• ${this.getDocumentTypeName(doc.type)} - ${new Date(doc.timestamp).toLocaleTimeString()}`
            )
        ].join('\n');

        // Show usage panel
        const panel = vscode.window.createWebviewPanel(
            'sdlc-usage',
            'SDLC Usage Report',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        panel.webview.html = this.getUsageWebviewContent(report, usage, limit, isAuthenticated);

        // Handle messages from webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'signIn':
                        await this.signIn();
                        panel.dispose();
                        break;
                    case 'clearHistory':
                        await this.clearHistory();
                        panel.dispose();
                        this.checkUsage(); // Reopen with updated data
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private async clearHistory(): Promise<void> {
        const confirm = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: 'Clear generation history? This cannot be undone.'
        });

        if (confirm === 'Yes') {
            await this.usageTracker.clearHistory();
            vscode.window.showInformationMessage('History cleared');
        }
    }

    private getUsageWebviewContent(report: string, usage: any, limit: number, isAuthenticated: boolean): string {
        const percentage = (usage.count / limit) * 100;
        const progressBarColor = percentage > 80 ? '#ef4444' : percentage > 60 ? '#f59e0b' : '#10b981';

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        padding: 20px;
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                    }
                    h1 {
                        color: var(--vscode-foreground);
                        border-bottom: 1px solid var(--vscode-panel-border);
                        padding-bottom: 10px;
                    }
                    .progress-container {
                        width: 100%;
                        height: 30px;
                        background-color: var(--vscode-input-background);
                        border-radius: 15px;
                        margin: 20px 0;
                        overflow: hidden;
                    }
                    .progress-bar {
                        height: 100%;
                        background-color: ${progressBarColor};
                        border-radius: 15px;
                        transition: width 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                    }
                    .usage-stats {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 15px;
                        margin: 20px 0;
                    }
                    .stat-card {
                        background-color: var(--vscode-input-background);
                        padding: 15px;
                        border-radius: 8px;
                        text-align: center;
                    }
                    .stat-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: var(--vscode-textLink-foreground);
                    }
                    .stat-label {
                        font-size: 12px;
                        color: var(--vscode-descriptionForeground);
                        margin-top: 5px;
                    }
                    button {
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        margin: 5px;
                    }
                    button:hover {
                        background-color: var(--vscode-button-hoverBackground);
                    }
                    .action-buttons {
                        margin-top: 20px;
                    }
                    .upgrade-banner {
                        background-color: var(--vscode-textBlockQuote-background);
                        border-left: 3px solid var(--vscode-textLink-foreground);
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .history-list {
                        list-style: none;
                        padding: 0;
                    }
                    .history-item {
                        padding: 8px;
                        margin: 5px 0;
                        background-color: var(--vscode-input-background);
                        border-radius: 4px;
                    }
                </style>
            </head>
            <body>
                <h1>📊 SDLC Document Generator - Usage Report</h1>
                
                <div class="usage-stats">
                    <div class="stat-card">
                        <div class="stat-value">${usage.count}</div>
                        <div class="stat-label">Generated Today</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${limit - usage.count}</div>
                        <div class="stat-label">Remaining</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${limit}</div>
                        <div class="stat-label">Daily Limit</div>
                    </div>
                </div>

                <div class="progress-container">
                    <div class="progress-bar" style="width: ${percentage}%">
                        ${Math.round(percentage)}%
                    </div>
                </div>

                ${!isAuthenticated ? `
                    <div class="upgrade-banner">
                        <strong>🚀 Get More Documents!</strong><br>
                        Sign in to increase your daily limit from 10 to 20 documents.
                    </div>
                ` : ''}

                <h2>Recent Documents</h2>
                <ul class="history-list">
                    ${usage.documents.slice(-5).reverse().map((doc: any) => `
                        <li class="history-item">
                            ${this.getDocumentTypeEmoji(doc.type)} ${this.getDocumentTypeName(doc.type)} 
                            - ${new Date(doc.timestamp).toLocaleString()}
                        </li>
                    `).join('')}
                </ul>

                <div class="action-buttons">
                    ${!isAuthenticated ? `
                        <button onclick="signIn()">Sign In for More</button>
                    ` : ''}
                    <button onclick="clearHistory()">Clear History</button>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();
                    
                    function signIn() {
                        vscode.postMessage({ command: 'signIn' });
                    }
                    
                    function clearHistory() {
                        vscode.postMessage({ command: 'clearHistory' });
                    }
                </script>
            </body>
            </html>
        `;
    }

    private getDocumentTypeName(type: string): string {
        const names: Record<string, string> = {
            business: 'Business Analysis',
            functional: 'Functional Spec',
            technical: 'Technical Spec',
            ux: 'UX Spec',
            architecture: 'Architecture',
            wireframe: 'Wireframe',
            coding: 'Coding Prompt',
            test: 'Test Spec'
        };
        return names[type] || type;
    }

    private getDocumentTypeEmoji(type: string): string {
        const emojis: Record<string, string> = {
            business: '📊',
            functional: '⚙️',
            technical: '🔧',
            ux: '🎨',
            architecture: '📈',
            wireframe: '🎯',
            coding: '💻',
            test: '🧪'
        };
        return emojis[type] || '📄';
    }
}