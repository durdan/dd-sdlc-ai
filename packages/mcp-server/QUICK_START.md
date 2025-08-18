# 🚀 SDLC MCP Server - Quick Start

Get your SDLC MCP server running with Claude in 5 minutes!

## Step 1: Install the MCP Server

```bash
# Option A: From NPM (when published)
npm install -g @sdlc/mcp-server

# Option B: From source (current)
cd packages/mcp-server
npm install
npm run build
```

## Step 2: Configure Claude Desktop

### Automatic Setup (Recommended)

```bash
npm run setup
```

This will automatically configure Claude Desktop for you!

### Manual Setup

Add to your Claude config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sdlc": {
      "command": "node",
      "args": ["/path/to/sdlc-ai-platform/packages/mcp-server/dist/index.js"],
      "env": {
        "SDLC_API_URL": "https://sdlc.dev",
        "OPENAI_API_KEY": "sk-your-key-here"
      }
    }
  }
}
```

## Step 3: Restart Claude Desktop

Close and reopen Claude Desktop to load the new configuration.

## Step 4: Test It!

Ask Claude to use the SDLC tools:

### Example Prompts

1. **Generate a business plan:**
   ```
   Use the SDLC tool to generate a business plan for a fintech startup
   ```

2. **Generate multiple documents:**
   ```
   Generate business, functional, and technical specs for an e-commerce platform
   ```

3. **Analyze a GitHub repo:**
   ```
   Analyze https://github.com/facebook/react and create technical documentation
   ```

## 🎯 Available Commands

| Command | Description |
|---------|-------------|
| `generate_sdlc_document` | Generate a single document |
| `generate_multiple_documents` | Generate multiple documents |
| `list_sdlc_projects` | List your projects |
| `get_sdlc_project` | Get project details |
| `analyze_github_repo` | Analyze a GitHub repository |

## 📊 Document Types

- `business` - Business requirements and analysis
- `functional` - Functional specifications
- `technical` - Technical specifications
- `ux` - UX/UI specifications
- `architecture` - System architecture
- `test` - Test plans and specifications
- `meeting` - Meeting transcripts and summaries
- `coding` - AI coding assistant prompts

## 🔧 Troubleshooting

### MCP server not responding?

1. Check Claude logs:
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`

2. Test the server directly:
   ```bash
   cd packages/mcp-server
   npm test
   ```

3. Enable debug logging:
   ```json
   {
     "env": {
       "LOG_LEVEL": "debug"
     }
   }
   ```

### API key issues?

Make sure at least one AI provider key is set:
- `OPENAI_API_KEY` for OpenAI
- `ANTHROPIC_API_KEY` for Anthropic

## 🎉 Success!

If everything is working, you should be able to:
1. See "sdlc" in Claude's available tools
2. Generate SDLC documents through natural language
3. Access all your projects and documents

## 📚 Full Documentation

For complete documentation, see [README.md](README.md)

## 🆘 Need Help?

- GitHub Issues: https://github.com/yourusername/sdlc-ai-platform/issues
- Documentation: https://sdlc.dev/docs/mcp