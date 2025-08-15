import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('SDLC Document Generator - SIMPLE TEST - is now active!');
    
    // Register a simple test command
    let disposable = vscode.commands.registerCommand('sdlc-doc-generator.test', () => {
        vscode.window.showInformationMessage('SDLC Extension is working!');
    });

    context.subscriptions.push(disposable);
    
    // Show that extension loaded
    vscode.window.showInformationMessage('SDLC Document Generator Extension Loaded Successfully!');
}

export function deactivate() {
    console.log('SDLC Document Generator deactivated');
}