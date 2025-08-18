# SDLC MCP Server

Model Context Protocol (MCP) server for the SDLC AI Platform. This server enables AI assistants like Claude to directly interact with the SDLC document generation system.

## 🚀 Features

- **Document Generation**: Generate any type of SDLC document (business, functional, technical, UX, architecture, test, meeting, coding)
- **Batch Generation**: Generate multiple documents at once
- **Project Management**: List and retrieve SDLC projects
- **GitHub Integration**: Analyze repositories and generate documentation
- **Streaming Support**: Real-time document generation with progress updates
- **Multi-Provider**: Support for OpenAI and Anthropic models

## 📦 Installation

### From NPM

```bash
npm install -g @sdlc/mcp-server
```

### From Source

```bash
git clone https://github.com/yourusername/sdlc-ai-platform.git
cd sdlc-ai-platform/packages/mcp-server
npm install
npm run build
```

## 🔧 Configuration

### For Claude Desktop

Add to your Claude configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sdlc": {
      "command": "npx",
      "args": ["@sdlc/mcp-server"],
      "env": {
        "SDLC_API_URL": "https://sdlc.dev",
        "SDLC_API_KEY": "your-api-key-here",
        "OPENAI_API_KEY": "your-openai-key",
        "ANTHROPIC_API_KEY": "your-anthropic-key"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SDLC_API_URL` | SDLC Platform API URL | No | https://sdlc.dev |
| `SDLC_API_KEY` | Your SDLC API key | No* | - |
| `OPENAI_API_KEY` | OpenAI API key | No* | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | No* | - |
| `LOG_LEVEL` | Logging level | No | info |

*At least one AI provider key is required for document generation

## 🛠️ Available Tools

### generate_sdlc_document

Generate a single SDLC document.

**Parameters:**
- `input` (string, required): Project description or requirements
- `documentType` (string, required): Type of document (business, functional, technical, ux, architecture, test, meeting, coding)
- `customPrompt` (string, optional): Custom prompt to enhance generation
- `aiProvider` (string, optional): AI provider (openai, anthropic, auto)
- `model` (string, optional): Specific AI model to use

**Example:**
```
Generate a technical specification for an e-commerce platform with payment integration
```

### generate_multiple_documents

Generate multiple SDLC documents at once.

**Parameters:**
- `input` (string, required): Project description or requirements
- `documentTypes` (array, required): Types of documents to generate
- `customPrompt` (string, optional): Custom prompt to enhance generation
- `aiProvider` (string, optional): AI provider (openai, anthropic, auto)

**Example:**
```
Generate business, functional, and technical documents for a school management system
```

### list_sdlc_projects

List all SDLC projects.

**Parameters:**
- `limit` (number, optional): Number of projects to return (default: 10)
- `offset` (number, optional): Number of projects to skip (default: 0)

### get_sdlc_project

Get details of a specific SDLC project including all its documents.

**Parameters:**
- `projectId` (string, required): Project ID to retrieve

### analyze_github_repo

Analyze a GitHub repository and generate SDLC documentation based on the codebase.

**Parameters:**
- `repoUrl` (string, required): GitHub repository URL
- `branch` (string, optional): Branch to analyze (default: main)

**Example:**
```
Analyze https://github.com/facebook/react and generate technical documentation
```

## 💬 Usage with Claude

Once configured, you can use natural language to interact with the SDLC platform through Claude:

### Examples

1. **Generate a business plan:**
   ```
   Use the SDLC tool to generate a business plan for a fintech startup focused on micro-investments
   ```

2. **Generate multiple documents:**
   ```
   Generate business, functional, and technical specifications for a healthcare appointment booking system
   ```

3. **Analyze a repository:**
   ```
   Analyze the repository https://github.com/vercel/next.js and create architectural documentation
   ```

4. **List projects:**
   ```
   Show me my recent SDLC projects
   ```

5. **Retrieve specific project:**
   ```
   Get the details of project abc-123-def including all its documents
   ```

## 🔄 Development

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Testing Locally

```bash
# Start the server
npm start

# In another terminal, test with MCP client
npx @modelcontextprotocol/inspector
```

### Project Structure

```
mcp-server/
├── src/
│   ├── index.ts           # Main server implementation
│   ├── services/
│   │   └── sdlc-service.ts # SDLC API client
│   └── utils/
│       └── logger.ts       # Logging utilities
├── dist/                   # Compiled JavaScript
├── logs/                   # Log files
├── mcp.json               # MCP configuration
└── package.json
```

## 🐛 Debugging

Enable debug logging:

```json
{
  "mcpServers": {
    "sdlc": {
      "command": "npx",
      "args": ["@sdlc/mcp-server"],
      "env": {
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

View logs:
- macOS/Linux: `tail -f logs/combined.log`
- Windows: `Get-Content logs\combined.log -Wait`

## 🔒 Security

- API keys are stored in environment variables
- All API communications use HTTPS
- Sensitive data is never logged
- Rate limiting is enforced by the SDLC platform

## 📊 Monitoring

The MCP server logs all operations to help monitor usage:
- Request/response times
- Error rates
- Document generation statistics
- API usage patterns

## 🤝 Contributing

Contributions are welcome! Please see the [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT © SDLC AI Platform Contributors

## 🔗 Resources

- [SDLC Platform](https://sdlc.dev)
- [MCP Protocol Documentation](https://modelcontextprotocol.io)
- [Claude Desktop](https://claude.ai/download)
- [GitHub Repository](https://github.com/yourusername/sdlc-ai-platform)

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/sdlc-ai-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/sdlc-ai-platform/discussions)
- **Documentation**: [SDLC Docs](https://sdlc.dev/docs)