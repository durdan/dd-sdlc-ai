#!/bin/bash

# GitHub Connection Script using MCP Browser Tools
# This script helps automate GitHub OAuth setup and connection

echo "🔗 GitHub Connection Setup with MCP"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    touch .env.local
    echo "# GitHub OAuth Configuration" >> .env.local
    echo "NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id_here" >> .env.local
    echo "GITHUB_CLIENT_SECRET=your_client_secret_here" >> .env.local
    echo ""
    echo "✅ Created .env.local template"
    echo ""
fi

echo "📋 Steps to connect GitHub:"
echo ""
echo "1. Create GitHub OAuth App:"
echo "   → Go to: https://github.com/settings/developers"
echo "   → Click 'New OAuth App'"
echo "   → Fill in:"
echo "     • Application name: SDLC.dev"
echo "     • Homepage URL: http://localhost:3000"
echo "     • Authorization callback URL: http://localhost:3000/api/auth/github/callback"
echo "   → Click 'Register application'"
echo ""
echo "2. Copy your credentials:"
echo "   • Client ID (public)"
echo "   • Client Secret (keep secret!)"
echo ""
echo "3. Update .env.local with your credentials"
echo ""
echo "4. Start the dev server:"
echo "   npm run dev"
echo ""
echo "5. The MCP browser tools will help you complete the connection!"
echo ""
echo "🚀 Ready to proceed? The browser will open to help you connect..."



