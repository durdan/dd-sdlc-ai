#!/usr/bin/env node

/**
 * MCP GitHub Connection Helper
 * Uses browser automation to help connect GitHub OAuth
 */

console.log(`
🔗 GitHub Connection Helper using MCP Browser Tools
==================================================

This script will help you connect GitHub using MCP browser automation.

📋 Prerequisites:
1. GitHub account (logged in)
2. GitHub OAuth App created (or we'll help you create it)
3. .env.local file with credentials

🚀 Steps:
1. First, ensure you're logged into GitHub
2. We'll navigate to create/configure your OAuth App
3. Then connect via the dashboard

📝 To create GitHub OAuth App manually:
- Go to: https://github.com/settings/developers
- Click "New OAuth App"
- Application name: SDLC.dev
- Homepage URL: http://localhost:3000
- Callback URL: http://localhost:3000/api/auth/github/callback
- Copy Client ID and Client Secret

💡 Then update .env.local:
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

🔄 Next, we'll use MCP browser tools to:
- Navigate to your dashboard
- Open Integration Hub
- Click "Connect GitHub"
- Complete the OAuth flow

Ready to proceed? Make sure your dev server is running (npm run dev)
`);

// This script is a guide - actual MCP browser automation happens via the MCP tools
// The browser tools will be called separately to navigate and interact



