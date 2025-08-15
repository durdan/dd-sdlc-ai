import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
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

export function deactivate() {
    console.log('SDLC Extension Test - Deactivated');
}