# SDLC CLI - Command Line Interface Feature

## Overview
The SDLC CLI provides developers with a powerful command-line tool to generate SDLC documentation, manage projects, and integrate with CI/CD pipelines directly from the terminal.

**Command Name**: `sdlc`

## Installation

```bash
# Build from source (currently required - npm package coming soon)
git clone https://github.com/your-org/sdlc-platform.git
cd sdlc-platform/packages/cli
npm install
npm run build
npm link

# Now you can use the 'sdlc' command globally
sdlc --version

# Future installation methods (once published to npm):
# npm install -g @sdlc/cli
# npx @sdlc/cli generate "your project description"
# brew install sdlc-cli
# yarn global add @sdlc/cli
```

## Core Commands

### 1. Authentication & Setup

```bash
# Initialize SDLC CLI in your project
sdlc init

# Authenticate with your account
sdlc auth login              # Opens browser for OAuth
sdlc auth login --token      # Use API token
sdlc auth status            # Check authentication status
sdlc auth logout            # Clear stored credentials

# Configure CLI settings
sdlc config set api-key YOUR_API_KEY
sdlc config set ai-provider openai|anthropic|auto
sdlc config set output-dir ./sdlc-docs
sdlc config list            # Show all settings
sdlc config reset           # Reset to defaults
```

### 2. Document Generation

```bash
# Generate all SDLC documents
sdlc generate "e-commerce platform with payment integration"
sdlc generate --input "project description" --type all

# Generate specific document types
sdlc generate business "online marketplace requirements"
sdlc generate functional --input requirements.txt
sdlc generate technical --project-id abc123
sdlc generate ux --input "user interface requirements"
sdlc generate test --from-project abc123
sdlc generate architecture --input system-design.md

# Generate meeting documents
sdlc generate meeting --transcript meeting.txt
sdlc generate meeting --audio meeting.mp3  # With transcription

# Advanced generation options
sdlc generate --type business,technical,ux \
              --ai-provider anthropic \
              --model claude-3-opus \
              --output ./docs \
              --format markdown

# Generate with custom prompts
sdlc generate --custom-prompt "Focus on security aspects" \
              --input "banking application"

# Batch generation from file
sdlc generate --batch projects.json
```

### 3. Project Management

```bash
# Create and manage projects
sdlc project create "My SaaS Platform"
sdlc project create --from-file requirements.md
sdlc project list                    # List all projects
sdlc project list --recent           # Last 10 projects
sdlc project view PROJECT_ID         # View project details
sdlc project update PROJECT_ID --name "Updated Name"
sdlc project delete PROJECT_ID       # Delete project
sdlc project archive PROJECT_ID      # Archive project

# Search projects
sdlc project search "e-commerce"
sdlc project search --date-from 2024-01-01

# Project templates
sdlc project create --template saas
sdlc project create --template marketplace
sdlc project templates list          # List available templates
```

### 4. Export & Output

```bash
# Export documents
sdlc export PROJECT_ID              # Export to current directory
sdlc export PROJECT_ID --format pdf --output ./exports
sdlc export PROJECT_ID --format markdown,json
sdlc export PROJECT_ID --type business,technical
sdlc export --latest                 # Export most recent project

# Export formats supported
# - markdown (.md)
# - pdf (.pdf)
# - json (.json)
# - html (.html)
# - docx (.docx)
# - confluence (direct upload)
# - notion (direct upload)

# Bulk export
sdlc export --all --format pdf      # Export all projects
sdlc export --date-range 2024-01-01:2024-12-31
```

### 5. Interactive Mode

```bash
# Start interactive CLI wizard
sdlc interactive                    # Guided project creation
sdlc quick                          # Quick generation mode

# Interactive features:
# - Step-by-step project setup
# - Document type selection
# - AI provider selection
# - Real-time preview
# - Export options
```

### 6. Integration Commands

```bash
# GitHub integration
sdlc github create-pr --project PROJECT_ID
sdlc github sync --repo owner/repo

# JIRA integration  
sdlc jira create-epic --project PROJECT_ID
sdlc jira sync-stories --project PROJECT_ID

# Confluence integration
sdlc confluence publish --project PROJECT_ID --space SPACE_KEY

# Slack notifications
sdlc slack notify --project PROJECT_ID --channel "#sdlc-docs"
```

### 7. Utility Commands

```bash
# View generation history
sdlc history                        # Show recent generations
sdlc history --limit 50             # Show last 50
sdlc history --date 2024-01-01     # Filter by date

# Usage statistics
sdlc stats                          # Show usage statistics
sdlc stats --monthly                # Monthly breakdown
sdlc stats --by-type                # By document type

# Cost tracking
sdlc cost                           # Show cost estimate
sdlc cost --project PROJECT_ID      # Project-specific cost
sdlc cost --date-range 2024-01-01:2024-12-31

# System commands
sdlc version                        # Show CLI version
sdlc update                         # Update CLI to latest
sdlc doctor                         # Diagnose issues
sdlc cache clear                    # Clear local cache
```

## Advanced Features

### 1. Configuration Profiles

```bash
# Manage multiple configurations
sdlc config profile create production
sdlc config profile create staging
sdlc config profile use production
sdlc config profile list
sdlc config profile delete staging

# Use profiles for different environments
sdlc generate --profile production "payment system"
```

### 2. Watch Mode

```bash
# Watch files for changes and auto-generate
sdlc watch requirements.md          # Watch single file
sdlc watch ./specs --type business  # Watch directory
sdlc watch --auto-commit            # Auto-commit changes
```

### 3. CI/CD Integration

```bash
# Generate CI/CD configuration
sdlc ci setup github-actions
sdlc ci setup gitlab-ci
sdlc ci setup jenkins

# Validate in CI mode (no interactive prompts)
sdlc generate --ci --input "$BUILD_DESCRIPTION"
```

### 4. Plugins

```bash
# Plugin management
sdlc plugin install @sdlc/jira-sync
sdlc plugin install @sdlc/aws-deploy
sdlc plugin list                    # List installed plugins
sdlc plugin update --all            # Update all plugins
sdlc plugin uninstall PLUGIN_NAME   # Remove plugin

# Create custom plugin
sdlc plugin create my-custom-plugin
```

### 5. Templates & Snippets

```bash
# Manage templates
sdlc template create "SaaS Boilerplate" --from-project PROJECT_ID
sdlc template list
sdlc template use "SaaS Boilerplate"
sdlc template share "SaaS Boilerplate"  # Share with community
sdlc template import URL               # Import from URL

# Snippets for common patterns
sdlc snippet create auth-flow --type functional
sdlc snippet list
sdlc snippet use auth-flow
```

## Environment Variables

```bash
# Supported environment variables
SDLC_API_KEY          # API key for authentication
SDLC_API_URL          # API endpoint (default: https://api.sdlc.dev)
SDLC_OUTPUT_DIR       # Default output directory
SDLC_AI_PROVIDER      # Default AI provider
SDLC_CONFIG_PATH      # Custom config file path
SDLC_PROFILE          # Active configuration profile
SDLC_NO_ANALYTICS     # Disable usage analytics
SDLC_DEBUG            # Enable debug logging
```

## Configuration File

Create `.sdlcrc.json` in your project root:

```json
{
  "version": "1.0.0",
  "defaultProvider": "anthropic",
  "outputDirectory": "./documentation",
  "projectDefaults": {
    "type": "saas",
    "documentTypes": ["business", "functional", "technical", "ux"],
    "exportFormat": "markdown"
  },
  "templates": {
    "default": "saas-boilerplate"
  },
  "integrations": {
    "github": {
      "enabled": true,
      "autoCreatePR": false
    },
    "jira": {
      "enabled": true,
      "projectKey": "SDLC"
    }
  },
  "hooks": {
    "preGenerate": "npm run lint",
    "postGenerate": "npm run format",
    "preExport": "./scripts/validate.sh"
  }
}
```

## Command Aliases

For convenience, the CLI supports short aliases:

```bash
sdlc g    # alias for 'generate'
sdlc p    # alias for 'project'
sdlc e    # alias for 'export'
sdlc c    # alias for 'config'
sdlc i    # alias for 'interactive'

# Examples
sdlc g "todo app"                   # Quick generate
sdlc p list                         # List projects
sdlc e --latest --format pdf        # Export latest as PDF
```

## Output Examples

### Standard Output
```bash
$ sdlc generate "task management app"

🚀 SDLC Document Generation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Generating Business Analysis... ✓
📝 Generating Functional Spec... ✓
📝 Generating Technical Spec... ✓
📝 Generating UX Design Spec... ✓
📝 Generating Architecture Diagrams... ✓

✅ Successfully generated 5 documents
📁 Project ID: proj_abc123xyz
📂 Output: ./sdlc-docs/task-management-app/

View online: https://sdlc.dev/projects/proj_abc123xyz
```

### Interactive Mode
```bash
$ sdlc interactive

Welcome to SDLC Interactive Mode! 🎯

? What type of project are you building? SaaS Application
? Provide a brief description: Task management platform with team collaboration
? Select document types to generate: 
  ✓ Business Analysis
  ✓ Functional Specification
  ✓ Technical Specification
  ✓ UX Design Specification
? Choose AI provider: Anthropic (Claude)
? Select output format: Markdown
? Export location: ./documentation

Generating documents... 
[████████████████████████] 100% | Time: 45s

✅ Generation complete!
? What would you like to do next?
  ❯ View generated documents
    Export as PDF
    Create GitHub PR
    Generate more documents
    Exit
```

## Error Handling

```bash
# Common error messages and solutions
Error: Authentication required
→ Run: sdlc auth login

Error: Invalid API key
→ Run: sdlc config set api-key YOUR_KEY

Error: Rate limit exceeded
→ Wait 60 seconds or upgrade your plan

Error: Network timeout
→ Check connection or use: sdlc generate --timeout 120

Error: Invalid input format
→ Check supported formats: sdlc help generate
```

## Performance Optimization

```bash
# Optimize for speed
sdlc generate --fast                # Use faster model
sdlc generate --cache               # Use cached responses
sdlc generate --parallel            # Parallel generation

# Optimize for quality
sdlc generate --quality high        # Use best model
sdlc generate --review              # Add review step
sdlc generate --iterate 2           # Multiple iterations
```

## Shell Completions

```bash
# Install shell completions
sdlc completion bash >> ~/.bashrc
sdlc completion zsh >> ~/.zshrc
sdlc completion fish > ~/.config/fish/completions/sdlc.fish

# PowerShell (Windows)
sdlc completion powershell >> $PROFILE
```

## Debugging & Troubleshooting

```bash
# Debug commands
sdlc --debug generate "test project"     # Enable debug output
sdlc doctor                              # Run diagnostics
sdlc doctor --fix                        # Auto-fix issues
sdlc cache clear                         # Clear cache
sdlc config reset                        # Reset configuration

# Logging
sdlc --log-level debug generate "app"
sdlc --log-file sdlc.log generate "app"

# Dry run (preview without execution)
sdlc generate --dry-run "test project"
```

## Security Features

- API keys stored in OS keychain (macOS/Windows) or encrypted file (Linux)
- Support for environment variables for CI/CD
- Token refresh mechanism for long-running operations
- Audit logs for compliance tracking
- Data encryption for sensitive information
- SOC 2 compliant API communication

## Platform Support

- **macOS**: Full support with Homebrew installation
- **Linux**: Full support (Ubuntu, Debian, RHEL, Arch)
- **Windows**: Full support with Windows Terminal
- **Docker**: Official Docker image available
- **Cloud Shell**: Works in Google Cloud Shell, AWS CloudShell

## Pricing & Limits

| Feature | Anonymous | Free Tier | Pro | Enterprise |
|---------|-----------|-----------|-----|------------|
| Generations per 24h | 10 | 30 | Unlimited | Unlimited |
| Generations/month | N/A | 300 | 5000 | Unlimited |
| API Rate Limit | 5/min | 10/min | 100/min | Custom |
| Parallel Generation | ❌ | ❌ | ✅ | ✅ |
| Custom Templates | ❌ | 1 | 10 | Unlimited |
| Priority Support | ❌ | ❌ | ✅ | ✅ |
| CLI Access | ✅ | ✅ | ✅ | ✅ |
| Authentication Required | ❌ | ✅ | ✅ | ✅ |

## Community & Support

- **Documentation**: https://sdlc.dev/docs/cli
- **GitHub**: https://github.com/sdlc-dev/cli
- **Discord**: https://discord.gg/sdlc-dev
- **Issues**: https://github.com/sdlc-dev/cli/issues
- **Plugins**: https://sdlc.dev/plugins

## Roadmap

### Q1 2025
- [ ] VSCode extension integration
- [ ] IntelliJ IDEA plugin
- [ ] Real-time collaboration features
- [ ] Voice input support

### Q2 2025
- [ ] AI model fine-tuning
- [ ] Custom model support
- [ ] Offline mode
- [ ] Mobile app companion

### Q3 2025
- [ ] Multi-language support
- [ ] Enterprise SSO
- [ ] Advanced analytics
- [ ] Compliance templates (HIPAA, GDPR)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

```bash
# Clone and setup development environment
git clone https://github.com/sdlc-dev/cli
cd cli
npm install
npm link
sdlc --version
```

## License

MIT License - See [LICENSE](../LICENSE) for details.

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: In Development