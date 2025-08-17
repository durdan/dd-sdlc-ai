# CLI Development Guide

## Local Development Setup

Since the package is not yet published to npm, follow these steps to test the CLI locally:

### 1. Build and Link the CLI

```bash
# Navigate to the CLI package
cd packages/cli

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Create a global symlink
npm link

# Verify installation
sdlc --version
```

### 2. Test Commands

```bash
# Check help
sdlc --help

# Test configuration
sdlc config list

# Test with dry-run (no API calls)
sdlc generate "test project" --dry-run

# Test interactive mode
sdlc interactive
```

### 3. Connect to Local API

Make sure your main application is running:

```bash
# In the root project directory
cd ../..
npm run dev

# The CLI will use http://localhost:3000 by default
```

### 4. Test Authentication

```bash
# Check auth status
sdlc auth status

# Configure API URL if needed
sdlc config set apiUrl http://localhost:3000

# Login (will open browser)
sdlc auth login
```

### 5. Test Generation

```bash
# Generate with local API
sdlc generate "e-commerce platform" --output ./test-output

# Generate specific types
sdlc generate business "user requirements"
sdlc generate technical --file specs.md
```

## Development Workflow

### Making Changes

1. Edit source files in `src/`
2. Rebuild: `npm run build`
3. Test changes: `sdlc [command]`

### Watch Mode

```bash
# Auto-rebuild on changes
npm run dev
```

### Debugging

```bash
# Enable debug output
sdlc --debug generate "test"

# Check configuration
sdlc config list

# Reset configuration
sdlc config reset
```

## Troubleshooting

### Command Not Found

If `sdlc` command is not found after linking:

```bash
# Check npm global bin directory
npm bin -g

# Add to PATH if needed
export PATH="$(npm bin -g):$PATH"

# Or reinstall link
npm unlink
npm link
```

### Permission Errors

```bash
# On macOS/Linux, you might need sudo
sudo npm link

# Or configure npm to use a different directory
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### API Connection Issues

```bash
# Check API URL
sdlc config get apiUrl

# Set correct URL
sdlc config set apiUrl http://localhost:3000

# Test connection
curl http://localhost:3000/api/health
```

## Testing Checklist

- [ ] `sdlc --version` shows correct version
- [ ] `sdlc --help` displays all commands
- [ ] `sdlc init` creates configuration
- [ ] `sdlc config list` shows settings
- [ ] `sdlc generate --dry-run` works without API
- [ ] `sdlc interactive` launches wizard
- [ ] `sdlc auth status` checks authentication
- [ ] `sdlc project list` (with auth) shows projects
- [ ] `sdlc generate` (with auth) creates documents

## Publishing to NPM (Future)

When ready to publish:

```bash
# Update version
npm version patch|minor|major

# Build
npm run build

# Test package
npm pack
npm install -g sdlc-cli-1.0.0.tgz

# Publish
npm login
npm publish --access public
```

## Clean Up

To remove the CLI:

```bash
# Unlink global symlink
npm unlink

# Or remove from global packages
npm uninstall -g @sdlc/cli
```