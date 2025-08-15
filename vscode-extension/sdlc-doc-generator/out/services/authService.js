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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const vscode = __importStar(require("vscode"));
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
class AuthService {
    constructor(context) {
        this.context = context;
        this._onAuthStateChanged = new vscode.EventEmitter();
        this.onAuthStateChanged = this._onAuthStateChanged.event;
        this.user = null;
        // Get or create device ID for anonymous tracking
        this.deviceId = context.globalState.get(AuthService.DEVICE_ID_KEY) || (0, uuid_1.v4)();
        context.globalState.update(AuthService.DEVICE_ID_KEY, this.deviceId);
    }
    async initialize() {
        // Load stored authentication
        const storedAuth = await this.context.secrets.get(AuthService.AUTH_KEY);
        if (storedAuth) {
            try {
                const authData = JSON.parse(storedAuth);
                await this.validateToken(authData.token);
                this.user = authData.user;
                this._onAuthStateChanged.fire(this.user);
            }
            catch (error) {
                // Invalid token, clear it
                await this.context.secrets.delete(AuthService.AUTH_KEY);
            }
        }
    }
    async signIn() {
        try {
            // Generate OAuth URL
            const config = vscode.workspace.getConfiguration('sdlc-doc-generator');
            const apiEndpoint = config.get('apiEndpoint') || 'http://localhost:3000/api/vscode';
            // Open OAuth flow in browser
            const authUrl = `http://localhost:3000/auth/vscode?device_id=${this.deviceId}`;
            await vscode.env.openExternal(vscode.Uri.parse(authUrl));
            // Show input box for auth code
            const authCode = await vscode.window.showInputBox({
                prompt: 'Enter the authentication code from the browser',
                placeHolder: 'Paste your authentication code here',
                ignoreFocusOut: true
            });
            if (!authCode) {
                return;
            }
            // Exchange code for token
            const response = await axios_1.default.post(`${apiEndpoint}/auth/exchange`, {
                code: authCode,
                deviceId: this.deviceId
            });
            if (response.data.success) {
                const { token, user } = response.data;
                this.user = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    isAuthenticated: true
                };
                // Store authentication
                await this.context.secrets.store(AuthService.AUTH_KEY, JSON.stringify({
                    token,
                    user: this.user
                }));
                this._onAuthStateChanged.fire(this.user);
                vscode.window.showInformationMessage(`Signed in as ${user.email}`);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Sign in failed: ${error.message}`);
        }
    }
    async signOut() {
        const confirm = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: 'Are you sure you want to sign out?'
        });
        if (confirm === 'Yes') {
            await this.context.secrets.delete(AuthService.AUTH_KEY);
            this.user = null;
            this._onAuthStateChanged.fire(null);
            vscode.window.showInformationMessage('Successfully signed out');
        }
    }
    async isAuthenticated() {
        return this.user?.isAuthenticated || false;
    }
    getUser() {
        return this.user;
    }
    getDeviceId() {
        return this.deviceId;
    }
    async getAuthToken() {
        const storedAuth = await this.context.secrets.get(AuthService.AUTH_KEY);
        if (storedAuth) {
            const authData = JSON.parse(storedAuth);
            return authData.token;
        }
        return null;
    }
    async validateToken(token) {
        try {
            const config = vscode.workspace.getConfiguration('sdlc-doc-generator');
            const apiEndpoint = config.get('apiEndpoint') || 'http://localhost:3000/api/vscode';
            const response = await axios_1.default.get(`${apiEndpoint}/auth/validate`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.valid;
        }
        catch {
            return false;
        }
    }
}
exports.AuthService = AuthService;
AuthService.AUTH_KEY = 'sdlc-doc-generator.auth';
AuthService.DEVICE_ID_KEY = 'sdlc-doc-generator.deviceId';
//# sourceMappingURL=authService.js.map