#!/bin/bash

# GitHub Connection Checker Script
# This script helps verify your GitHub OAuth setup

echo "🔍 Checking GitHub Connection Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local file not found${NC}"
    echo "   Create a .env.local file in the project root"
    exit 1
fi

echo -e "${GREEN}✅ .env.local file found${NC}"

# Check for GitHub Client ID
if grep -q "NEXT_PUBLIC_GITHUB_CLIENT_ID" .env.local; then
    CLIENT_ID=$(grep "NEXT_PUBLIC_GITHUB_CLIENT_ID" .env.local | cut -d '=' -f2 | tr -d ' "' | tr -d "'")
    if [ -z "$CLIENT_ID" ] || [ "$CLIENT_ID" == "your_client_id_here" ]; then
        echo -e "${RED}❌ NEXT_PUBLIC_GITHUB_CLIENT_ID is not set or has placeholder value${NC}"
    else
        echo -e "${GREEN}✅ NEXT_PUBLIC_GITHUB_CLIENT_ID is configured${NC}"
        echo "   Client ID: ${CLIENT_ID:0:10}..."
    fi
else
    echo -e "${RED}❌ NEXT_PUBLIC_GITHUB_CLIENT_ID not found in .env.local${NC}"
fi

# Check for GitHub Client Secret
if grep -q "GITHUB_CLIENT_SECRET" .env.local; then
    CLIENT_SECRET=$(grep "GITHUB_CLIENT_SECRET" .env.local | cut -d '=' -f2 | tr -d ' "' | tr -d "'")
    if [ -z "$CLIENT_SECRET" ] || [ "$CLIENT_SECRET" == "your_client_secret_here" ]; then
        echo -e "${RED}❌ GITHUB_CLIENT_SECRET is not set or has placeholder value${NC}"
    else
        echo -e "${GREEN}✅ GITHUB_CLIENT_SECRET is configured${NC}"
        echo "   Secret: ${CLIENT_SECRET:0:10}..."
    fi
else
    echo -e "${RED}❌ GITHUB_CLIENT_SECRET not found in .env.local${NC}"
fi

echo ""
echo "📋 Next Steps:"
echo "1. If credentials are missing, create a GitHub OAuth App:"
echo "   https://github.com/settings/developers"
echo ""
echo "2. Add credentials to .env.local:"
echo "   NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id"
echo "   GITHUB_CLIENT_SECRET=your_client_secret"
echo ""
echo "3. Make sure callback URL is set to:"
echo "   http://localhost:3000/api/auth/github/callback"
echo ""
echo "4. Start your dev server:"
echo "   npm run dev"
echo ""
echo "5. Navigate to Integration Hub in your dashboard"
echo ""

# Check if server is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Development server is running${NC}"
    echo ""
    echo "🌐 Test connection at: http://localhost:3000/dashboard#integrations"
else
    echo -e "${YELLOW}⚠️  Development server is not running${NC}"
    echo "   Start it with: npm run dev"
fi

echo ""
echo "📚 For detailed instructions, see: docs/github-connection-guide.md"



