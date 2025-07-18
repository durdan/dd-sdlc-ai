#!/bin/bash

# SDLC Automation Platform - Quick Start Script
# This script helps you set up the project quickly

set -e

echo "🚀 SDLC Automation Platform - Quick Start"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo ""
    echo "🔧 Setting up environment variables..."
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local from .env.example"
        echo "⚠️  Please edit .env.local with your actual configuration values"
    else
        echo "⚠️  .env.example not found. Please create .env.local manually"
    fi
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. 📝 Configure your environment variables:"
echo "   - Edit .env.local with your Supabase and API keys"
echo "   - See docs/setup/environment-setup.md for details"
echo ""
echo "2. 🗄️  Set up your database:"
echo "   - Create a Supabase project at https://supabase.com"
echo "   - Run the initial setup script: database/schema/initial-setup.sql"
echo "   - See docs/setup/database-setup.md for detailed instructions"
echo ""
echo "3. 🚀 Start development:"
echo "   npm run dev"
echo ""
echo "4. 📚 Read the documentation:"
echo "   - Getting Started: docs/setup/getting-started.md"
echo "   - Environment Setup: docs/setup/environment-setup.md"
echo "   - Database Setup: docs/setup/database-setup.md"
echo ""
echo "🎉 Setup complete! Happy coding!"
echo ""
echo "💡 Need help? Check out:"
echo "   - GitHub Issues: https://github.com/your-org/sdlc-automation-platform/issues"
echo "   - Discussions: https://github.com/your-org/sdlc-automation-platform/discussions"
echo "   - Documentation: ./docs/" 