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
function activate(context) {
    console.log('SDLC Extension Test - Activated!');
    // Register a simple test command
    const testCommand = vscode.commands.registerCommand('sdlc-doc-generator.testSimple', () => {
        vscode.window.showInformationMessage('SDLC Extension is working! ✅');
    });
    // Register all the expected commands with simple implementations
    const commands = [
        'test',
        'generateBusinessAnalysis',
        'generateFunctionalSpec',
        'generateTechnicalSpec',
        'generateUXSpec',
        'generateArchitectureDiagram',
        'generateWireframe',
        'generateCodingPrompt',
        'generateTestSpec',
        'quickGenerate',
        'showHistory',
        'signIn',
        'signOut',
        'checkUsage'
    ];
    commands.forEach(cmd => {
        const disposable = vscode.commands.registerCommand(`sdlc-doc-generator.${cmd}`, () => {
            vscode.window.showInformationMessage(`Command ${cmd} executed!`);
        });
        context.subscriptions.push(disposable);
    });
    context.subscriptions.push(testCommand);
    // Show activation message
    vscode.window.showInformationMessage('SDLC Extension activated successfully!');
}
exports.activate = activate;
function deactivate() {
    console.log('SDLC Extension Test - Deactivated');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension-test.js.map