import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export interface User {
    id: string;
    email: string;
    name?: string;
    isAuthenticated: boolean;
}

export class AuthService {
    private static readonly AUTH_KEY = 'sdlc-doc-generator.auth';
    private static readonly DEVICE_ID_KEY = 'sdlc-doc-generator.deviceId';
    private readonly _onAuthStateChanged = new vscode.EventEmitter<User | null>();
    public readonly onAuthStateChanged = this._onAuthStateChanged.event;

    private user: User | null = null;
    private deviceId: string;

    constructor(private context: vscode.ExtensionContext) {
        // Get or create device ID for anonymous tracking
        this.deviceId = context.globalState.get(AuthService.DEVICE_ID_KEY) || uuidv4();
        context.globalState.update(AuthService.DEVICE_ID_KEY, this.deviceId);
    }

    async initialize(): Promise<void> {
        // Load stored authentication
        const storedAuth = await this.context.secrets.get(AuthService.AUTH_KEY);
        if (storedAuth) {
            try {
                const authData = JSON.parse(storedAuth);
                await this.validateToken(authData.token);
                this.user = authData.user;
                this._onAuthStateChanged.fire(this.user);
            } catch (error) {
                // Invalid token, clear it
                await this.context.secrets.delete(AuthService.AUTH_KEY);
            }
        }
    }

    async signIn(): Promise<void> {
        try {
            // Generate OAuth URL
            // Use localhost for development
            const apiEndpoint = 'http://localhost:3000/api/vscode';
            
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
            const response = await axios.post(`${apiEndpoint}/auth/exchange`, {
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
        } catch (error: any) {
            vscode.window.showErrorMessage(`Sign in failed: ${error.message}`);
        }
    }

    async signOut(): Promise<void> {
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

    async isAuthenticated(): Promise<boolean> {
        return this.user?.isAuthenticated || false;
    }

    getUser(): User | null {
        return this.user;
    }

    getDeviceId(): string {
        return this.deviceId;
    }

    async getAuthToken(): Promise<string | null> {
        const storedAuth = await this.context.secrets.get(AuthService.AUTH_KEY);
        if (storedAuth) {
            const authData = JSON.parse(storedAuth);
            return authData.token;
        }
        return null;
    }

    private async validateToken(token: string): Promise<boolean> {
        try {
            const config = vscode.workspace.getConfiguration('sdlc-doc-generator');
            const apiEndpoint = config.get<string>('apiEndpoint') || 'http://localhost:3000/api/vscode';
            
            const response = await axios.get(`${apiEndpoint}/auth/validate`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data.valid;
        } catch {
            return false;
        }
    }
}