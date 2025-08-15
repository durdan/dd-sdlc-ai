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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const documentGeneratorProvider_1 = require("./providers/documentGeneratorProvider");
const quickActionsProvider_1 = require("./providers/quickActionsProvider");
const historyProvider_1 = require("./providers/historyProvider");
const accountProvider_1 = require("./providers/accountProvider");
const authService_1 = require("./services/authService");
const usageTracker_1 = require("./services/usageTracker");
const apiClient_1 = require("./services/apiClient");
const documentCommands_1 = require("./commands/documentCommands");
const accountCommands_1 = require("./commands/accountCommands");
let authService;
let usageTracker;
let apiClient;
async function activate(context) {
    console.log('SDLC Document Generator is now active!');
    // Initialize services
    authService = new authService_1.AuthService(context);
    usageTracker = new usageTracker_1.UsageTracker(context, authService);
    apiClient = new apiClient_1.ApiClient(context, authService);
    // Initialize providers
    const documentGeneratorProvider = new documentGeneratorProvider_1.DocumentGeneratorProvider(context, apiClient, usageTracker);
    const quickActionsProvider = new quickActionsProvider_1.QuickActionsProvider(context);
    const historyProvider = new historyProvider_1.HistoryProvider(context);
    const accountProvider = new accountProvider_1.AccountProvider(context, authService, usageTracker);
    // Register tree data providers
    vscode.window.registerTreeDataProvider('sdlc-doc-generator.quickActions', quickActionsProvider);
    vscode.window.registerTreeDataProvider('sdlc-doc-generator.history', historyProvider);
    vscode.window.registerTreeDataProvider('sdlc-doc-generator.account', accountProvider);
    // Initialize commands
    const documentCommands = new documentCommands_1.DocumentCommands(context, documentGeneratorProvider, usageTracker);
    const accountCommands = new accountCommands_1.AccountCommands(context, authService, usageTracker);
    // Register test command
    context.subscriptions.push(vscode.commands.registerCommand('sdlc-doc-generator.test', () => {
        vscode.window.showInformationMessage('SDLC Extension is working! All commands are registered.');
    }));
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
        context.subscriptions.push(vscode.commands.registerCommand(`sdlc-doc-generator.${command}`, () => {
            documentCommands.generateDocument(type);
        }));
    });
    // Register quick generate command
    context.subscriptions.push(vscode.commands.registerCommand('sdlc-doc-generator.quickGenerate', async (uri) => {
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
    }));
    // Register history command
    context.subscriptions.push(vscode.commands.registerCommand('sdlc-doc-generator.showHistory', () => {
        documentCommands.showHistory();
    }));
    // Register account commands
    context.subscriptions.push(vscode.commands.registerCommand('sdlc-doc-generator.signIn', () => {
        accountCommands.signIn();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('sdlc-doc-generator.signOut', () => {
        accountCommands.signOut();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('sdlc-doc-generator.checkUsage', () => {
        accountCommands.checkUsage();
    }));
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
    context.subscriptions.push(usageTracker.onUsageChanged(() => {
        updateStatusBar();
        accountProvider.refresh();
    }));
    // Update status bar when auth status changes
    context.subscriptions.push(authService.onAuthStateChanged(() => {
        updateStatusBar();
        accountProvider.refresh();
        quickActionsProvider.refresh();
    }));
    // Initialize authentication state
    await authService.initialize();
    // Show welcome message if first time
    const hasShownWelcome = context.globalState.get('sdlc-doc-generator.hasShownWelcome');
    if (!hasShownWelcome) {
        const action = await vscode.window.showInformationMessage('Welcome to SDLC Document Generator! Generate comprehensive documentation with AI.', 'Get Started', 'Sign In');
        if (action === 'Get Started') {
            vscode.commands.executeCommand('sdlc-doc-generator.quickGenerate');
        }
        else if (action === 'Sign In') {
            vscode.commands.executeCommand('sdlc-doc-generator.signIn');
        }
        context.globalState.update('sdlc-doc-generator.hasShownWelcome', true);
    }
}
exports.activate = activate;
function deactivate() {
    console.log('SDLC Document Generator is now deactivated');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map