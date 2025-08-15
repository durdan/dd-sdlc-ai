import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Show immediate feedback
    vscode.window.showInformationMessage('SDLC Extension Activated!');
    console.log('SDLC Extension - ACTIVATED');
    
    // Register a simple command that always works
    const disposable = vscode.commands.registerCommand('sdlc-doc-generator.test', () => {
        vscode.window.showInformationMessage('SDLC Test Command Works!');
    });
    
    context.subscriptions.push(disposable);
    
    // Add status bar item
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = '$(file-text) SDLC Active';
    statusBar.show();
    context.subscriptions.push(statusBar);
}

export function deactivate() {
    console.log('SDLC Extension - DEACTIVATED');
}