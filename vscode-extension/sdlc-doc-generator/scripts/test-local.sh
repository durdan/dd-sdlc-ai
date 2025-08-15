#!/bin/bash

# SDLC Document Generator - Local Testing Script

echo "🚀 SDLC Document Generator - Local Testing Setup"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Node.js
echo -e "\n${YELLOW}Step 1: Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Step 2: Install dependencies
echo -e "\n${YELLOW}Step 2: Installing dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

# Step 3: Compile TypeScript
echo -e "\n${YELLOW}Step 3: Compiling TypeScript...${NC}"
npm run compile
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ TypeScript compiled successfully${NC}"
else
    echo -e "${RED}✗ TypeScript compilation failed${NC}"
    exit 1
fi

# Step 4: Check if main app is running
echo -e "\n${YELLOW}Step 4: Checking if main app is running...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Main app is running on http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠ Main app not detected on http://localhost:3000${NC}"
    echo "Please run 'npm run dev' in the main project directory"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 5: Instructions for testing
echo -e "\n${GREEN}✅ Setup Complete!${NC}"
echo -e "\n${YELLOW}To test the extension:${NC}"
echo "1. Open VS Code in this directory"
echo "2. Press F5 to launch Extension Development Host"
echo "3. In the new VS Code window:"
echo "   - Press Ctrl+Shift+P (Cmd+Shift+P on Mac)"
echo "   - Type 'SDLC' to see all commands"
echo "   - Test document generation"
echo ""
echo "Or run: code ."
echo ""
echo -e "${GREEN}Happy testing! 🎉${NC}"