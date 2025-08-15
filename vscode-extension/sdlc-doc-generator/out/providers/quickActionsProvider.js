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
exports.QuickActionsProvider = void 0;
const vscode = __importStar(require("vscode"));
class QuickActionsProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return Promise.resolve(this.getQuickActions());
        }
        return Promise.resolve([]);
    }
    getQuickActions() {
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
exports.QuickActionsProvider = QuickActionsProvider;
class QuickAction extends vscode.TreeItem {
    constructor(label, icon, commandString) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.icon = icon;
        this.iconPath = new vscode.ThemeIcon('file-text');
        this.tooltip = `Generate ${this.label}`;
        this.description = this.icon;
        this.command = {
            command: commandString,
            title: `Generate ${this.label}`,
            arguments: []
        };
    }
}
//# sourceMappingURL=quickActionsProvider.js.map