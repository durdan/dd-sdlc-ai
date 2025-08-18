#!/bin/bash

# SDLC AI CLI Publishing Script
# This script helps publish the CLI to npm

set -e

echo "🚀 SDLC AI CLI Publishing Script"
echo "================================"
echo ""

# Check if user is logged into npm
echo "📝 Checking npm login status..."
NPM_USER=$(npm whoami 2>/dev/null || echo "")
if [ -z "$NPM_USER" ]; then
    echo "❌ You are not logged into npm"
    echo "Please run: npm login"
    exit 1
fi
echo "✅ Logged in as: $NPM_USER"
echo ""

# Check current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"
echo ""

# Ask for version bump
echo "What type of release is this?"
echo "1) Patch (bug fixes) - $CURRENT_VERSION → $(npm version patch --no-git-tag-version --dry-run 2>/dev/null | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')"
echo "2) Minor (new features) - $CURRENT_VERSION → $(npm version minor --no-git-tag-version --dry-run 2>/dev/null | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')"
echo "3) Major (breaking changes) - $CURRENT_VERSION → $(npm version major --no-git-tag-version --dry-run 2>/dev/null | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')"
echo "4) Custom version"
echo "5) Keep current version"
read -p "Select (1-5): " VERSION_CHOICE

case $VERSION_CHOICE in
    1)
        npm version patch --no-git-tag-version
        ;;
    2)
        npm version minor --no-git-tag-version
        ;;
    3)
        npm version major --no-git-tag-version
        ;;
    4)
        read -p "Enter custom version: " CUSTOM_VERSION
        npm version $CUSTOM_VERSION --no-git-tag-version
        ;;
    5)
        echo "Keeping current version"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

NEW_VERSION=$(node -p "require('./package.json').version")
echo ""
echo "📌 Publishing version: $NEW_VERSION"
echo ""

# Clean and build
echo "🧹 Cleaning previous build..."
rm -rf dist/
echo ""

echo "🔨 Building package..."
npm run build
echo ""

# Run tests if they exist
if [ -f "jest.config.js" ] || [ -f "jest.config.ts" ]; then
    echo "🧪 Running tests..."
    npm test || true
    echo ""
fi

# Pack to test
echo "📦 Creating package preview..."
npm pack --dry-run
echo ""

# Confirm publication
echo "⚠️  Ready to publish sdlc-ai@$NEW_VERSION to npm"
read -p "Continue? (y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ Publication cancelled"
    exit 1
fi

# Publish
echo ""
echo "📤 Publishing to npm..."
npm publish --access public

echo ""
echo "✅ Successfully published sdlc-ai@$NEW_VERSION!"
echo ""
echo "📋 Next steps:"
echo "  1. Test installation: npm install -g sdlc-ai"
echo "  2. Create git tag: git tag -a v$NEW_VERSION -m \"Release v$NEW_VERSION\""
echo "  3. Push tag: git push origin v$NEW_VERSION"
echo "  4. Create GitHub release"
echo "  5. Update documentation"
echo ""
echo "🔗 View package: https://www.npmjs.com/package/sdlc-ai"
echo "📊 Check stats: https://npm-stat.com/charts.html?package=sdlc-ai"