# SDLC Document Generator for VS Code

Generate comprehensive SDLC (Software Development Life Cycle) documents directly from VS Code using AI-powered generation.

## Features

### 📚 8 Document Types
- **Business Analysis** - Comprehensive business requirements and analysis
- **Functional Specification** - Detailed functional requirements
- **Technical Specification** - Technical architecture and implementation details  
- **UX Specification** - User experience design and requirements
- **Architecture Diagram** - System architecture with Mermaid diagrams
- **Wireframe** - UI wireframes and mockups
- **AI Coding Prompt** - Optimized prompts for AI code generation
- **Test Specification** - Test plans following TDD/BDD practices

### 🎯 Key Features
- **Usage Limits**: 10 documents/day for anonymous users, 20/day for signed-in users
- **Smart Context Detection**: Automatically detects project type, language, and framework
- **Multiple Access Points**: Command palette, context menu, or keyboard shortcuts
- **Document Preview**: Live markdown preview with syntax highlighting
- **Export Options**: Save as Markdown, copy to clipboard
- **History Tracking**: View and manage your generation history
- **Offline Support**: Queue requests when offline

## Installation

1. Install from VS Code Marketplace: Search for "SDLC Document Generator"
2. Or install manually: Download the `.vsix` file and run:
   ```bash
   code --install-extension sdlc-doc-generator-*.vsix
   ```

## Getting Started

### Quick Generate (Ctrl+Shift+D / Cmd+Shift+D)
1. Select text or open a project file
2. Press `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (Mac)
3. Choose document type
4. Enter project description
5. View generated document

### Command Palette
1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "SDLC" to see all commands
3. Select document type to generate

### Context Menu
- Right-click on any file/folder → "SDLC Docs: Quick Generate Document"
- Right-click in editor → "SDLC Docs: Quick Generate Document"

## Usage Limits

| User Type | Daily Limit | Features |
|-----------|------------|----------|
| Anonymous | 10 documents | All document types, local history |
| Signed In | 20 documents | All features + cloud sync |

## Authentication

Sign in to get more documents per day:
1. Click "SDLC Docs: Sign In" in command palette
2. Follow browser authentication
3. Enter code back in VS Code

## Commands

| Command | Description |
|---------|-------------|
| `SDLC Docs: Generate Business Analysis` | Generate business requirements document |
| `SDLC Docs: Generate Functional Specification` | Generate functional spec |
| `SDLC Docs: Generate Technical Specification` | Generate technical spec |
| `SDLC Docs: Generate UX Specification` | Generate UX requirements |
| `SDLC Docs: Generate Architecture Diagram` | Generate architecture with diagrams |
| `SDLC Docs: Generate Wireframe` | Generate UI wireframes |
| `SDLC Docs: Generate AI Coding Prompt` | Generate optimized coding prompts |
| `SDLC Docs: Generate Test Specification` | Generate test plans |
| `SDLC Docs: Quick Generate Document` | Quick access to all document types |
| `SDLC Docs: Show Generation History` | View recent documents |
| `SDLC Docs: Sign In` | Sign in for more features |
| `SDLC Docs: Sign Out` | Sign out of your account |
| `SDLC Docs: Check Usage Limits` | View usage statistics |

## Configuration

Access settings via `File > Preferences > Settings > Extensions > SDLC Document Generator`

| Setting | Default | Description |
|---------|---------|-------------|
| `apiEndpoint` | `https://www.sdlc.dev/api/vscode` | API endpoint |
| `anonymousLimit` | `10` | Daily limit for anonymous users |
| `authenticatedLimit` | `20` | Daily limit for authenticated users |
| `autoDetectProject` | `true` | Auto-detect project context |
| `showPreview` | `true` | Show preview after generation |
| `defaultExportFormat` | `markdown` | Default export format |

## Keyboard Shortcuts

- `Ctrl+Shift+D` / `Cmd+Shift+D` - Quick generate document

## Tips

1. **Select Code First**: Select relevant code before generating to provide context
2. **Use Project Root**: Right-click on project root for better context detection
3. **Sign In Early**: Sign in at the start of your day for higher limits
4. **Check Usage**: Monitor usage via status bar (bottom right)

## Privacy & Security

- **Anonymous Usage**: Uses device ID only, no personal data collected
- **Authenticated**: Secure OAuth 2.0 authentication
- **Local Storage**: History stored locally in VS Code
- **Secure API**: All API calls use HTTPS

## Support

- **Documentation**: [https://www.sdlc.dev/docs](https://www.sdlc.dev/docs)
- **Issues**: [GitHub Issues](https://github.com/yourusername/sdlc-doc-generator-vscode/issues)
- **Email**: support@sdlc.dev

## License

MIT License - see LICENSE file for details

## Changelog

### 1.0.0 - Initial Release
- 8 document types
- Usage tracking and limits
- Authentication support
- Context detection
- Document preview and export

---

Made with ❤️ by the SDLC.dev team