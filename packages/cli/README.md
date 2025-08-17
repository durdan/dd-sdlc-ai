# SDLC AI Platform CLI

Open source command-line interface for generating comprehensive Software Development Life Cycle (SDLC) documentation using AI. Generate business requirements, technical specifications, UX designs, and more directly from your terminal.

## 🚀 Features

- **AI-Powered Documentation** - Generate comprehensive SDLC documents using OpenAI GPT-4 or Anthropic Claude
- **Real-time Streaming** - Watch documents generate in real-time with progress indicators
- **Multiple Document Types** - Business, Functional, Technical, UX, Architecture, Test Plans, and more
- **Anonymous Mode** - Use without authentication (10 documents per 24 hours)
- **Export Formats** - Markdown, JSON, HTML, PDF support
- **Project Management** - Create, list, and manage multiple projects
- **Offline Support** - Save documents locally for offline access

## Installation

```bash
# Clone and build from source
git clone https://github.com/yourusername/sdlc-ai-platform.git
cd sdlc-ai-platform/packages/cli
npm install
npm run build
npm link

# Or install from npm (when published)
npm install -g @sdlc/cli
```

## Quick Start

```bash
# Initialize the CLI
sdlc init

# Authenticate
sdlc auth login

# Generate documentation
sdlc generate "e-commerce platform with payment integration"

# Interactive mode
sdlc interactive
```

## Core Commands

### Authentication
```bash
sdlc auth login       # Authenticate with SDLC platform
sdlc auth logout      # Log out
sdlc auth status      # Check authentication status
```

### Document Generation
```bash
# Generate all documents
sdlc generate "project description"

# Generate specific types
sdlc generate business "requirements"
sdlc generate technical --file specs.md
sdlc generate meeting --transcript meeting.txt

# With options
sdlc generate "my app" --type business,technical --output ./docs
```

### Project Management
```bash
sdlc project create "Project Name"
sdlc project list
sdlc project view <id>
sdlc project delete <id>
```

### Export
```bash
sdlc export <project-id> --format pdf
sdlc export --latest --output ./exports
```

### Configuration
```bash
sdlc config set apiUrl https://api.sdlc.dev
sdlc config list
sdlc config reset
```

## Command Aliases

For faster workflows:
- `sdlc g` → `sdlc generate`
- `sdlc p` → `sdlc project`
- `sdlc i` → `sdlc interactive`

## Environment Variables

```bash
SDLC_API_URL=https://api.sdlc.dev
SDLC_API_KEY=your-api-key
SDLC_OUTPUT_DIR=./sdlc-docs
SDLC_AI_PROVIDER=openai|anthropic|auto
```

## Configuration File

Create `.sdlcrc.json` in your project:

```json
{
  "version": "1.0.0",
  "defaultProvider": "anthropic",
  "outputDirectory": "./documentation",
  "projectDefaults": {
    "documentTypes": ["business", "functional", "technical", "ux"],
    "exportFormat": "markdown"
  }
}
```

## Features

- 🚀 **Fast Generation** - Stream documents in real-time
- 🎯 **Interactive Mode** - Guided wizard for beginners
- 📁 **Multiple Formats** - Export as Markdown, JSON, HTML, PDF
- 🔄 **CI/CD Ready** - Integrate with GitHub Actions, GitLab CI
- 🎨 **Customizable** - Templates, prompts, and configurations
- 🔐 **Secure** - API keys stored securely in OS keychain
- 📊 **Progress Tracking** - Visual indicators and status updates

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key or Anthropic API key (optional for anonymous mode)

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/sdlc-ai-platform.git
cd sdlc-ai-platform/packages/cli

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Link for global usage
npm link

# Run locally
node dist/bin/sdlc.js --help
```

### Running Tests

```bash
npm test        # Run test suite (when available)
npm run lint    # Run ESLint
npm run type-check  # Run TypeScript type checking
```

## Architecture

The CLI is built with:
- **TypeScript** - Type-safe development
- **Commander.js** - Command parsing and structure
- **EventSource** - Server-sent events for streaming
- **Chalk** - Terminal styling
- **Ora** - Elegant terminal spinners

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [Full Documentation](https://github.com/yourusername/sdlc-ai-platform/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/sdlc-ai-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/sdlc-ai-platform/discussions)

## License

MIT © 2024 SDLC AI Platform Contributors

See [LICENSE](LICENSE) file for details.