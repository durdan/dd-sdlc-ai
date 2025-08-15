import * as vscode from 'vscode';

export class HistoryProvider implements vscode.TreeDataProvider<HistoryItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<HistoryItem | undefined | null | void> = new vscode.EventEmitter<HistoryItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<HistoryItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: HistoryItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: HistoryItem): Promise<HistoryItem[]> {
        if (!element) {
            const history = await this.getRecentHistory();
            if (history.length === 0) {
                return [new HistoryItem('No documents generated yet', '', null)];
            }
            return history;
        }
        return [];
    }

    private async getRecentHistory(): Promise<HistoryItem[]> {
        // Get history from global state
        const historyKey = 'sdlc-doc-generator.history';
        const history = this.context.globalState.get<any[]>(historyKey, []);
        
        return history.slice(-10).reverse().map(item => 
            new HistoryItem(
                item.title || this.getDocumentTypeName(item.type),
                new Date(item.timestamp).toLocaleString(),
                item
            )
        );
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
}

class HistoryItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
        public readonly documentData: any
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${this.label} - ${this.description}`;
        
        if (documentData) {
            this.command = {
                command: 'sdlc-doc-generator.openHistoryItem',
                title: 'Open Document',
                arguments: [documentData]
            };
            this.contextValue = 'historyItem';
        }
    }

    iconPath = new vscode.ThemeIcon('file');
}