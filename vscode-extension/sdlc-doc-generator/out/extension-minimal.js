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
exports.activate = activate;
function deactivate() {
    console.log('SDLC Extension - DEACTIVATED');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension-minimal.js.map