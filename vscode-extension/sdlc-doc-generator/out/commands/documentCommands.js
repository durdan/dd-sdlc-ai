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
exports.DocumentCommands = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class DocumentCommands {
    constructor(context, documentGenerator, usageTracker) {
        this.context = context;
        this.documentGenerator = documentGenerator;
        this.usageTracker = usageTracker;
    }
    async generateDocument(type, uri) {
        // Check usage limits
        const canGenerate = await this.usageTracker.canGenerate();
        if (!canGenerate.allowed) {
            const action = await vscode.window.showWarningMessage(canGenerate.reason, 'Sign In', 'Check Usage');
            if (action === 'Sign In') {
                vscode.commands.executeCommand('sdlc-doc-generator.signIn');
            }
            else if (action === 'Check Usage') {
                vscode.commands.executeCommand('sdlc-doc-generator.checkUsage');
            }
            return;
        }
        // Get project context
        let initialContext = '';
        if (uri) {
            initialContext = await this.getContextFromUri(uri);
        }
        else if (vscode.window.activeTextEditor) {
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
            // Show timeout warning after 10 seconds
            const timeoutWarning = setTimeout(() => {
                progress.report({
                    message: 'Still generating... This may take up to 30 seconds. You can cancel anytime.'
                });
            }, 10000);
            try {
                const result = await this.documentGenerator.generateDocument({
                    type,
                    input,
                    onProgress: (chunk) => {
                        progress.report({ increment: 1, message: 'Generating...' });
                    },
                    cancellationToken: token
                });
                // Clear timeout if successful
                clearTimeout(timeoutWarning);
                if (result.success && result.document) {
                    // Track usage
                    await this.usageTracker.trackUsage(type, result.document.title);
                    // Show document in a new editor tab
                    await this.showGeneratedDocument(result.document);
                    // Show success message with clear indication of where the document is
                    const action = await vscode.window.showInformationMessage(`✅ ${this.getDocumentTypeName(type)} generated successfully! The document is now open in the editor.`, 'Save to File', 'Copy to Clipboard', 'Close');
                    if (action === 'Save to File') {
                        await this.saveDocument(result.document);
                    }
                    else if (action === 'Copy to Clipboard') {
                        await vscode.env.clipboard.writeText(result.document.content);
                        vscode.window.showInformationMessage('Document copied to clipboard');
                    }
                }
                else {
                    // Show detailed error message
                    const errorMsg = result.error || 'Failed to generate document';
                    vscode.window.showErrorMessage(`❌ Document generation failed: ${errorMsg}`, 'Try Again', 'Check API Status').then(action => {
                        if (action === 'Try Again') {
                            this.generateDocument(type, uri);
                        }
                        else if (action === 'Check API Status') {
                            vscode.env.openExternal(vscode.Uri.parse('http://localhost:3000'));
                        }
                    });
                }
            }
            catch (error) {
                // Clear timeout on error
                clearTimeout(timeoutWarning);
                console.error('Document generation error:', error);
                vscode.window.showErrorMessage(`❌ Error: ${error.message || 'Unknown error occurred'}`, 'View Logs').then(action => {
                    if (action === 'View Logs') {
                        vscode.commands.executeCommand('workbench.action.toggleDevTools');
                    }
                });
            }
        });
    }
    async showHistory() {
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
    async showInputForm(type, initialContext) {
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
    async getContextFromUri(uri) {
        const stat = await vscode.workspace.fs.stat(uri);
        if (stat.type === vscode.FileType.Directory) {
            // Get README or description from directory
            try {
                const readmeUri = vscode.Uri.joinPath(uri, 'README.md');
                const content = await vscode.workspace.fs.readFile(readmeUri);
                return content.toString().substring(0, 1000);
            }
            catch {
                return `Project: ${path.basename(uri.fsPath)}`;
            }
        }
        else {
            // Get content from file
            try {
                const content = await vscode.workspace.fs.readFile(uri);
                return content.toString().substring(0, 1000);
            }
            catch {
                return '';
            }
        }
    }
    async showGeneratedDocument(document) {
        // Add a header to the document for clarity
        const header = `# ${document.title || document.type + ' Document'}\n\n` +
            `> Generated by SDLC Document Generator\n` +
            `> Date: ${new Date().toLocaleString()}\n` +
            `> Type: ${this.getDocumentTypeName(document.type)}\n\n` +
            `---\n\n`;
        const fullContent = header + document.content;
        // Create a new untitled document with the generated content
        const doc = await vscode.workspace.openTextDocument({
            content: fullContent,
            language: 'markdown'
        });
        // Show the document in the editor
        await vscode.window.showTextDocument(doc, {
            preview: false,
            preserveFocus: false,
            viewColumn: vscode.ViewColumn.One // Open in the main editor
        });
        // Also show a status bar message
        vscode.window.setStatusBarMessage('📄 Document generated successfully', 5000);
    }
    async saveDocument(document) {
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
    getDocumentTypeName(type) {
        const names = {
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
exports.DocumentCommands = DocumentCommands;
//# sourceMappingURL=documentCommands.js.map