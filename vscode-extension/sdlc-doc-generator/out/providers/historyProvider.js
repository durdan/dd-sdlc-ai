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
exports.HistoryProvider = void 0;
const vscode = __importStar(require("vscode"));
class HistoryProvider {
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
    async getChildren(element) {
        if (!element) {
            const history = await this.getRecentHistory();
            if (history.length === 0) {
                return [new HistoryItem('No documents generated yet', '', null)];
            }
            return history;
        }
        return [];
    }
    async getRecentHistory() {
        // Get history from global state
        const historyKey = 'sdlc-doc-generator.history';
        const history = this.context.globalState.get(historyKey, []);
        return history.slice(-10).reverse().map(item => new HistoryItem(item.title || this.getDocumentTypeName(item.type), new Date(item.timestamp).toLocaleString(), item));
    }
    getDocumentTypeName(type) {
        const names = {
            business: 'Business Analysis',
            functional: 'Functional Spec',
            technical: 'Technical Spec',
            ux: 'UX Spec',
            architecture: 'Architecture',
            wireframe: 'Wireframe',
            coding: 'Coding Prompt',
            test: 'Test Spec'
        };
        return names[type] || type;
    }
}
exports.HistoryProvider = HistoryProvider;
class HistoryItem extends vscode.TreeItem {
    constructor(label, description, documentData) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.description = description;
        this.documentData = documentData;
        this.iconPath = new vscode.ThemeIcon('file');
        this.tooltip = `${this.label} - ${this.description}`;
        if (documentData) {
            this.command = {
                command: 'sdlc-doc-generator.openHistoryItem',
                title: 'Open Document',
                arguments: [documentData]
            };
            this.contextValue = 'historyItem';
        }
    }
}
//# sourceMappingURL=historyProvider.js.map