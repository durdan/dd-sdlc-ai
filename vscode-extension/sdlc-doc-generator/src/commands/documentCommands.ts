import * as vscode from 'vscode';
import { DocumentGeneratorProvider } from '../providers/documentGeneratorProvider';
import { UsageTracker } from '../services/usageTracker';
import * as path from 'path';
import * as fs from 'fs';

export class DocumentCommands {
    constructor(
        private context: vscode.ExtensionContext,
        private documentGenerator: DocumentGeneratorProvider,
        private usageTracker: UsageTracker
    ) {}

    async generateDocument(type: string, uri?: vscode.Uri): Promise<void> {
        // Check usage limits
        const canGenerate = await this.usageTracker.canGenerate();
        if (!canGenerate.allowed) {
            const action = await vscode.window.showWarningMessage(
                canGenerate.reason!,
                'Sign In',
                'Check Usage'
            );

            if (action === 'Sign In') {
                vscode.commands.executeCommand('sdlc-doc-generator.signIn');
            } else if (action === 'Check Usage') {
                vscode.commands.executeCommand('sdlc-doc-generator.checkUsage');
            }
            return;
        }

        // Get project context
        let initialContext = '';
        if (uri) {
            initialContext = await this.getContextFromUri(uri);
        } else if (vscode.window.activeTextEditor) {
            const selection = vscode.window.activeTextEditor.selection;
            if (!selection.isEmpty) {
                initialContext = vscode.window.activeTextEditor.document.getText(selection);
            }
        }

        // Show input form
        const input = await this.showInputForm(type, initialContext);
        if (!input) {
            return;
        }

        // Generate document
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Generating ${this.getDocumentTypeName(type)}...`,
            cancellable: true
        }, async (progress, token) => {
            try {
                const result = await this.documentGenerator.generateDocument({
                    type,
                    input,
                    onProgress: (chunk) => {
                        progress.report({ increment: 1, message: 'Generating...' });
                    },
                    cancellationToken: token
                });

                if (result.success && result.document) {
                    // Track usage
                    await this.usageTracker.trackUsage(type, result.document.title);

                    // Show document
                    await this.showGeneratedDocument(result.document);

                    // Show success message with actions
                    const action = await vscode.window.showInformationMessage(
                        `${this.getDocumentTypeName(type)} generated successfully!`,
                        'Save to File',
                        'Copy to Clipboard'
                    );

                    if (action === 'Save to File') {
                        await this.saveDocument(result.document);
                    } else if (action === 'Copy to Clipboard') {
                        await vscode.env.clipboard.writeText(result.document.content);
                        vscode.window.showInformationMessage('Document copied to clipboard');
                    }
                } else {
                    vscode.window.showErrorMessage(result.error || 'Failed to generate document');
                }
            } catch (error: any) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
            }
        });
    }

    async showHistory(): Promise<void> {
        const history = await this.usageTracker.getHistory(20);
        
        if (history.length === 0) {
            vscode.window.showInformationMessage('No documents generated yet');
            return;
        }

        const items = history.map(item => ({
            label: item.title || `${this.getDocumentTypeName(item.type)}`,
            description: new Date(item.timestamp).toLocaleString(),
            detail: `Type: ${this.getDocumentTypeName(item.type)}`,
            item
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a document to view details'
        });

        if (selected) {
            // In a real implementation, we would store and retrieve the full document
            vscode.window.showInformationMessage(`Selected: ${selected.label}`);
        }
    }

    private async showInputForm(type: string, initialContext: string): Promise<string | undefined> {
        const result = await vscode.window.showInputBox({
            prompt: `Describe your project for ${this.getDocumentTypeName(type)} generation`,
            placeHolder: 'Enter project description, requirements, or paste existing content...',
            value: initialContext,
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value || value.trim().length < 10) {
                    return 'Please provide at least 10 characters of description';
                }
                return null;
            }
        });

        return result;
    }

    private async getContextFromUri(uri: vscode.Uri): Promise<string> {
        const stat = await vscode.workspace.fs.stat(uri);
        
        if (stat.type === vscode.FileType.Directory) {
            // Get README or description from directory
            try {
                const readmeUri = vscode.Uri.joinPath(uri, 'README.md');
                const content = await vscode.workspace.fs.readFile(readmeUri);
                return content.toString().substring(0, 1000);
            } catch {
                return `Project: ${path.basename(uri.fsPath)}`;
            }
        } else {
            // Get content from file
            try {
                const content = await vscode.workspace.fs.readFile(uri);
                return content.toString().substring(0, 1000);
            } catch {
                return '';
            }
        }
    }

    private async showGeneratedDocument(document: any): Promise<void> {
        // Create a new untitled document with the generated content
        const doc = await vscode.workspace.openTextDocument({
            content: document.content,
            language: 'markdown'
        });

        await vscode.window.showTextDocument(doc, {
            preview: true,
            preserveFocus: false
        });
    }

    private async saveDocument(document: any): Promise<void> {
        const defaultName = `${document.type}-${Date.now()}.md`;
        
        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.workspace.workspaceFolders 
                ? vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, defaultName)
                : vscode.Uri.file(defaultName),
            filters: {
                'Markdown': ['md'],
                'All Files': ['*']
            }
        });

        if (uri) {
            await vscode.workspace.fs.writeFile(uri, Buffer.from(document.content));
            vscode.window.showInformationMessage(`Document saved to ${uri.fsPath}`);
            
            // Open the saved document
            const doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc);
        }
    }

    private getDocumentTypeName(type: string): string {
        const names: Record<string, string> = {
            business: 'Business Analysis',
            functional: 'Functional Specification',
            technical: 'Technical Specification',
            ux: 'UX Specification',
            architecture: 'Architecture Diagram',
            wireframe: 'Wireframe',
            coding: 'AI Coding Prompt',
            test: 'Test Specification'
        };
        return names[type] || type;
    }
}