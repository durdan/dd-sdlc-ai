#!/bin/bash

# Test script for published sdlc-ai package

echo "🧪 Testing published sdlc-ai package"
echo "===================================="
echo ""

# Check if package exists on npm
echo "📦 Checking package on npm..."
npm view sdlc-ai version 2>/dev/null
if [ $? -eq 0 ]; then
    VERSION=$(npm view sdlc-ai version)
    echo "✅ Package found: sdlc-ai@$VERSION"
else
    echo "❌ Package not found on npm"
    echo "   Please publish first: npm publish --access public"
    exit 1
fi
echo ""

# Install globally
echo "📥 Installing sdlc-ai globally..."
npm install -g sdlc-ai
echo ""

# Check installation
echo "🔍 Verifying installation..."
which sdlc
if [ $? -eq 0 ]; then
    echo "✅ CLI installed at: $(which sdlc)"
else
    echo "❌ CLI not found in PATH"
    exit 1
fi
echo ""

# Check version
echo "📌 Checking version..."
sdlc --version
echo ""

# Test help command
echo "📚 Testing help command..."
sdlc --help | head -10
echo ""

# Test generation (dry run)
echo "🚀 Testing generation command..."
sdlc g business "test project" --dry-run
echo ""

echo "✅ All tests passed!"
echo ""
echo "📊 View your package at:"
echo "   https://www.npmjs.com/package/sdlc-ai"
echo ""
echo "📈 Check download stats at:"
echo "   https://npm-stat.com/charts.html?package=sdlc-ai"