import * as vscode from 'vscode';
import { DocumentGeneratorProvider } from './providers/documentGeneratorProvider';
import { QuickActionsProvider } from './providers/quickActionsProvider';
import { HistoryProvider } from './providers/historyProvider';
import { AccountProvider } from './providers/accountProvider';
import { AuthService } from './services/authService';
import { UsageTracker } from './services/usageTracker';
import { ApiClient } from './services/apiClient';
import { DocumentCommands } from './commands/documentCommands';
import { AccountCommands } from './commands/accountCommands';

let authService: AuthService;
let usageTracker: UsageTracker;
let apiClient: ApiClient;

export async function activate(context: vscode.ExtensionContext) {
    console.log('SDLC Document Generator is now active!');

    // Initialize services
    authService = new AuthService(context);
    usageTracker = new UsageTracker(context, authService);
    apiClient = new ApiClient(context, authService);

    // Initialize providers
    const documentGeneratorProvider = new DocumentGeneratorProvider(context, apiClient, usageTracker);
    const quickActionsProvider = new QuickActionsProvider(context);
    const historyProvider = new HistoryProvider(context);
    const accountProvider = new AccountProvider(context, authService, usageTracker);

    // Register tree data providers
    vscode.window.registerTreeDataProvider('sdlc-doc-generator.quickActions', quickActionsProvider);
    vscode.window.registerTreeDataProvider('sdlc-doc-generator.history', historyProvider);
    vscode.window.registerTreeDataProvider('sdlc-doc-generator.account', accountProvider);

    // Initialize commands
    const documentCommands = new DocumentCommands(context, documentGeneratorProvider, usageTracker);
    const accountCommands = new AccountCommands(context, authService, usageTracker);

    // Register test command
    context.subscriptions.push(
        vscode.commands.registerCommand('sdlc-doc-generator.test', () => {
            vscode.window.showInformationMessage('SDLC Extension is working! All commands are registered.');
        })
    );

    // Register document generation commands
    const generateCommands = [
        { command: 'generateBusinessAnalysis', type: 'business' },
        { command: 'generateFunctionalSpec', type: 'functional' },
        { command: 'generateTechnicalSpec', type: 'technical' },
        { command: 'generateUXSpec', type: 'ux' },
        { command: 'generateArchitectureDiagram', type: 'architecture' },
        { command: 'generateWireframe', type: 'wireframe' },
        { command: 'generateCodingPrompt', type: 'coding' },
        { command: 'generateTestSpec', type: 'test' }
    ];

    generateCommands.forEach(({ command, type }) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(`sdlc-doc-generator.${command}`, () => {
                documentCommands.generateDocument(type);
            })
        );
    });

    // Register quick generate command
    context.subscriptions.push(
        vscode.commands.registerCommand('sdlc-doc-generator.quickGenerate', async (uri?: vscode.Uri) => {
            const documentType = await vscode.window.showQuickPick([
                { label: '📊 Business Analysis', value: 'business' },
                { label: '⚙️ Functional Specification', value: 'functional' },
                { label: '🔧 Technical Specification', value: 'technical' },
                { label: '🎨 UX Specification', value: 'ux' },
                { label: '📈 Architecture Diagram', value: 'architecture' },
                { label: '🎯 Wireframe', value: 'wireframe' },
                { label: '💻 AI Coding Prompt', value: 'coding' },
                { label: '🧪 Test Specification', value: 'test' }
            ], {
                placeHolder: 'Select document type to generate'
            });

            if (documentType) {
                documentCommands.generateDocument(documentType.value, uri);
            }
        })
    );

    // Register history command
    context.subscriptions.push(
        vscode.commands.registerCommand('sdlc-doc-generator.showHistory', () => {
            documentCommands.showHistory();
        })
    );

    // Register account commands
    context.subscriptions.push(
        vscode.commands.registerCommand('sdlc-doc-generator.signIn', () => {
            accountCommands.signIn();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sdlc-doc-generator.signOut', () => {
            accountCommands.signOut();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('sdlc-doc-generator.checkUsage', () => {
            accountCommands.checkUsage();
        })
    );

    // Create status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'sdlc-doc-generator.checkUsage';
    context.subscriptions.push(statusBarItem);

    // Update status bar
    const updateStatusBar = async () => {
        const usage = await usageTracker.getCurrentUsage();
        const isAuthenticated = await authService.isAuthenticated();
        const limit = isAuthenticated ? 20 : 10;
        
        statusBarItem.text = `$(file-text) SDLC: ${usage.count}/${limit}`;
        statusBarItem.tooltip = `Documents generated today: ${usage.count}/${limit}\nClick to check usage details`;
        statusBarItem.show();
    };

    // Initial status bar update
    updateStatusBar();

    // Update status bar when usage changes
    context.subscriptions.push(
        usageTracker.onUsageChanged(() => {
            updateStatusBar();
            accountProvider.refresh();
        })
    );

    // Update status bar when auth status changes
    context.subscriptions.push(
        authService.onAuthStateChanged(() => {
            updateStatusBar();
            accountProvider.refresh();
            quickActionsProvider.refresh();
        })
    );

    // Initialize authentication state
    await authService.initialize();

    // Show welcome message if first time
    const hasShownWelcome = context.globalState.get('sdlc-doc-generator.hasShownWelcome');
    if (!hasShownWelcome) {
        const action = await vscode.window.showInformationMessage(
            'Welcome to SDLC Document Generator! Generate comprehensive documentation with AI.',
            'Get Started',
            'Sign In'
        );

        if (action === 'Get Started') {
            vscode.commands.executeCommand('sdlc-doc-generator.quickGenerate');
        } else if (action === 'Sign In') {
            vscode.commands.executeCommand('sdlc-doc-generator.signIn');
        }

        context.globalState.update('sdlc-doc-generator.hasShownWelcome', true);
    }
}

export function deactivate() {
    console.log('SDLC Document Generator is now deactivated');
}