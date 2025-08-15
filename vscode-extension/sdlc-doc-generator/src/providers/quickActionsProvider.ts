import * as vscode from 'vscode';

export class QuickActionsProvider implements vscode.TreeDataProvider<QuickAction> {
    private _onDidChangeTreeData: vscode.EventEmitter<QuickAction | undefined | null | void> = new vscode.EventEmitter<QuickAction | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<QuickAction | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: QuickAction): vscode.TreeItem {
        return element;
    }

    getChildren(element?: QuickAction): Thenable<QuickAction[]> {
        if (!element) {
            return Promise.resolve(this.getQuickActions());
        }
        return Promise.resolve([]);
    }

    private getQuickActions(): QuickAction[] {
        const actions = [
            new QuickAction('Business Analysis', '📊', 'sdlc-doc-generator.generateBusinessAnalysis'),
            new QuickAction('Functional Spec', '⚙️', 'sdlc-doc-generator.generateFunctionalSpec'),
            new QuickAction('Technical Spec', '🔧', 'sdlc-doc-generator.generateTechnicalSpec'),
            new QuickAction('UX Specification', '🎨', 'sdlc-doc-generator.generateUXSpec'),
            new QuickAction('Architecture', '📈', 'sdlc-doc-generator.generateArchitectureDiagram'),
            new QuickAction('Wireframe', '🎯', 'sdlc-doc-generator.generateWireframe'),
            new QuickAction('AI Coding Prompt', '💻', 'sdlc-doc-generator.generateCodingPrompt'),
            new QuickAction('Test Specification', '🧪', 'sdlc-doc-generator.generateTestSpec')
        ];
        return actions;
    }
}

class QuickAction extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private icon: string,
        commandString: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `Generate ${this.label}`;
        this.description = this.icon;
        
        this.command = {
            command: commandString,
            title: `Generate ${this.label}`,
            arguments: []
        };
    }

    iconPath = new vscode.ThemeIcon('file-text');
}