# 📚 SDLC AI Platform - Complete User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Platform Overview](#platform-overview)
4. [Using the Web Application](#using-the-web-application)
5. [Using the CLI Tool](#using-the-cli-tool)
6. [Using with AI Assistants (MCP)](#using-with-ai-assistants-mcp)
7. [Document Types](#document-types)
8. [Integrations](#integrations)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)

---

## Introduction

The SDLC AI Platform is a comprehensive solution for automating Software Development Life Cycle documentation using artificial intelligence. Whether you're a startup founder, project manager, developer, or technical writer, this platform helps you generate professional documentation in minutes instead of hours.

### Who This Guide Is For

- **Developers** who need technical specifications
- **Project Managers** requiring comprehensive project documentation
- **Business Analysts** creating requirements documents
- **UX Designers** needing design specifications
- **QA Engineers** writing test plans
- **Technical Writers** producing documentation
- **Startup Founders** creating business plans

### What You Can Do

- Generate 8+ types of SDLC documents with AI
- Use via web, CLI, or AI assistants
- Integrate with GitHub, JIRA, Confluence, and Slack
- Export in multiple formats (Markdown, HTML, PDF, JSON)
- Collaborate with team members
- Track document history and versions

---

## Getting Started

### Quick Start Options

Choose the method that works best for you:

#### 1. Web Application (No Installation)
Visit https://sdlc.dev and start generating documents immediately.

#### 2. CLI Tool (For Developers)
```bash
npm install -g sdlc-ai
sdlc generate "your project description"
```

#### 3. AI Assistant Integration (Claude)
Configure Claude Desktop to use SDLC tools directly in conversations.

### First-Time Setup

#### Web Platform Setup

1. **Visit the Platform**
   - Go to https://sdlc.dev
   - Click "Get Started" or "Sign In"

2. **Authentication Options**
   - **Anonymous Mode**: Generate up to 10 documents per 24 hours without signing up
   - **Free Account**: Sign up with Google for unlimited basic features
   - **Pro Account**: Access advanced features and integrations

3. **Configure Your Profile**
   - Add your OpenAI or Anthropic API key
   - Set default document preferences
   - Configure integrations (optional)

#### CLI Setup

1. **Install the CLI**
   ```bash
   npm install -g sdlc-ai
   ```

2. **Initialize Configuration**
   ```bash
   sdlc init
   ```

3. **Authenticate (Optional)**
   ```bash
   sdlc auth login
   ```

---

## Platform Overview

### Architecture

```
┌─────────────────────────────────────────────┐
│           SDLC AI Platform                   │
├─────────────────────────────────────────────┤
│                                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │   Web   │  │   CLI   │  │   MCP   │      │
│  │   App   │  │  Tool   │  │ Server  │      │
│  └────┬────┘  └────┬────┘  └────┬────┘      │
│       │            │            │            │
│       └────────────┼────────────┘            │
│                    │                         │
│           ┌────────▼────────┐                │
│           │   API Gateway   │                │
│           └────────┬────────┘                │
│                    │                         │
│     ┌──────────────┼──────────────┐          │
│     │              │              │          │
│ ┌───▼───┐    ┌────▼────┐   ┌────▼────┐     │
│ │  AI   │    │Document │   │Project  │     │
│ │Engine │    │Service  │   │Service  │     │
│ └───────┘    └─────────┘   └─────────┘     │
│                                               │
│           ┌─────────────┐                    │
│           │  Database   │                    │
│           │  (Supabase) │                    │
│           └─────────────┘                    │
└─────────────────────────────────────────────┘
```

### Key Components

1. **AI Engine**: Powered by OpenAI GPT-4 and Anthropic Claude
2. **Document Service**: Handles generation, storage, and retrieval
3. **Project Service**: Manages projects and collaboration
4. **Integration Service**: Connects with external tools
5. **Prompt Management**: Advanced template system with A/B testing

---

## Using the Web Application

### Dashboard Overview

When you log in, you'll see the main dashboard with:

- **Quick Generate**: Input field for immediate document generation
- **Recent Projects**: Your latest projects and documents
- **Document Library**: Browse all generated documents
- **Templates**: Pre-configured templates for common use cases
- **Settings**: Configure your preferences and integrations

### Generating Documents

#### Method 1: Quick Generate

1. **Enter Your Input**
   - Type or paste your project description
   - Be specific and detailed for better results
   
2. **Select Document Types**
   - Check the documents you want to generate
   - Options: Business, Functional, Technical, UX, Architecture, Test, Meeting, Coding

3. **Configure Options** (Optional)
   - Choose AI provider (OpenAI/Anthropic)
   - Select model (GPT-4, Claude-3)
   - Add custom prompts
   - Set quality level

4. **Click Generate**
   - Watch real-time generation progress
   - Documents appear as they complete

#### Method 2: Project-Based Generation

1. **Create a Project**
   - Click "New Project"
   - Enter project name and description
   - Set project parameters

2. **Generate Documents**
   - Select project from list
   - Choose document types
   - Generate with project context

3. **Manage Documents**
   - View all project documents
   - Edit and refine content
   - Export in various formats

### Document Management

#### Viewing Documents

- **Document Viewer**: Clean, formatted view with syntax highlighting
- **Raw View**: See the markdown source
- **Preview Mode**: See how it will look when exported
- **Mermaid Diagrams**: Interactive diagram rendering

#### Editing Documents

1. Click "Edit" on any document
2. Use the markdown editor
3. Preview changes in real-time
4. Save versions automatically

#### Exporting Documents

- **Markdown**: Raw markdown files
- **HTML**: Styled HTML documents
- **PDF**: Professional PDF exports
- **JSON**: Structured data format
- **ZIP**: Batch export multiple documents

### Advanced Features

#### Prompt Templates

1. **Access Admin Panel** (Admin users only)
   - Navigate to `/admin/prompts`
   - View all prompt templates

2. **Create Custom Prompts**
   - Click "New Template"
   - Define variables and structure
   - Test with sample data
   - Save and activate

3. **A/B Testing**
   - Create prompt variants
   - Set distribution percentages
   - Monitor performance metrics
   - Optimize based on results

#### Integration Setup

1. **GitHub Integration**
   - Connect your GitHub account
   - Import repository information
   - Generate docs from code analysis
   - Export to GitHub Wiki

2. **JIRA Integration**
   - Link JIRA workspace
   - Create epics and stories from specs
   - Sync requirements bidirectionally
   - Track implementation status

3. **Slack Integration**
   - Connect Slack workspace
   - Receive generation notifications
   - Share documents in channels
   - Collaborate with mentions

---

## Using the CLI Tool

### Installation

```bash
# Global installation
npm install -g sdlc-ai

# Verify installation
sdlc --version
```

### Basic Commands

#### Generate Documents

```bash
# Generate default documents (business, functional, technical, UX)
sdlc generate "e-commerce platform with payment integration"

# Generate specific document type
sdlc g business "fintech startup idea"

# Generate multiple types
sdlc generate "project description" -t business,technical,test

# Use shortcuts
sdlc g b "project"  # business
sdlc g f "project"  # functional
sdlc g t "project"  # technical
```

#### Command Options

```bash
# Specify output directory
sdlc generate "project" -o ./docs

# Choose output format
sdlc generate "project" -f pdf

# Use specific AI provider
sdlc generate "project" -p openai -m gpt-4

# Add custom prompt
sdlc generate "project" --custom-prompt "Focus on security aspects"

# Read input from file
sdlc generate --file requirements.txt

# Quality settings
sdlc generate "project" --quality high

# Parallel generation (faster)
sdlc generate "project" --parallel
```

### Project Management

```bash
# Create a new project
sdlc project create "My SaaS Platform"

# List all projects
sdlc project list

# View project details
sdlc project view <project-id>

# Delete a project
sdlc project delete <project-id>

# Generate for existing project
sdlc generate "new feature" --project-id <id>
```

### Authentication

```bash
# Login to your account
sdlc auth login

# Check authentication status
sdlc auth status

# Logout
sdlc auth logout

# Use with API key
sdlc config set apiKey YOUR_API_KEY
```

### Configuration

```bash
# Set default output directory
sdlc config set outputDir ./sdlc-docs

# Set default format
sdlc config set defaultFormat markdown

# Set API endpoint (for self-hosted)
sdlc config set apiUrl https://your-instance.com

# View all settings
sdlc config list

# Reset to defaults
sdlc config reset
```

### Interactive Mode

```bash
# Start interactive wizard
sdlc interactive

# Or use shortcut
sdlc i
```

The interactive mode guides you through:
1. Project description input
2. Document type selection
3. Output configuration
4. Generation options

### Batch Operations

```bash
# Process multiple projects from file
sdlc batch process projects.json

# Example projects.json:
{
  "projects": [
    {
      "input": "Project 1 description",
      "types": ["business", "technical"]
    },
    {
      "input": "Project 2 description",
      "types": ["functional", "ux"]
    }
  ]
}
```

---

## Using with AI Assistants (MCP)

### Claude Desktop Integration

#### Setup

1. **Install MCP Server**
   ```bash
   npm install -g @sdlc/mcp-server
   ```

2. **Configure Claude**
   Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "sdlc": {
         "command": "npx",
         "args": ["@sdlc/mcp-server"],
         "env": {
           "OPENAI_API_KEY": "your-key"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

#### Usage Examples

Ask Claude naturally:

- "Use SDLC to generate a business plan for a fintech startup"
- "Generate technical and functional specs for an e-commerce platform"
- "Analyze https://github.com/facebook/react and create documentation"
- "Show me my recent SDLC projects"
- "Get the details of project abc-123"

### Available MCP Tools

1. **generate_sdlc_document** - Single document generation
2. **generate_multiple_documents** - Batch generation
3. **list_sdlc_projects** - View your projects
4. **get_sdlc_project** - Get project details
5. **analyze_github_repo** - Repository analysis

---

## Document Types

### 1. Business Analysis Document

**Purpose**: Define business requirements, objectives, and strategy

**Includes**:
- Executive Summary
- Market Analysis
- Business Objectives
- Stakeholder Analysis
- Risk Assessment
- ROI Projections
- Success Metrics

**Best For**: Startups, new projects, investor pitches

### 2. Functional Specification

**Purpose**: Describe what the system should do

**Includes**:
- User Stories
- Use Cases
- Feature Requirements
- User Flows
- Acceptance Criteria
- Functional Dependencies
- Data Requirements

**Best For**: Product managers, business analysts

### 3. Technical Specification

**Purpose**: Define how the system will be built

**Includes**:
- System Architecture
- Technology Stack
- API Design
- Database Schema
- Security Measures
- Performance Requirements
- Deployment Strategy

**Best For**: Developers, architects, DevOps

### 4. UX/UI Specification

**Purpose**: Design user experience and interface

**Includes**:
- User Personas
- User Journey Maps
- Wireframe Descriptions
- Design System
- Interaction Patterns
- Accessibility Requirements
- Usability Metrics

**Best For**: UX designers, product teams

### 5. Architecture Document

**Purpose**: Define system structure and design

**Includes**:
- System Overview
- Component Diagrams
- Data Flow Diagrams
- Integration Points
- Scalability Plan
- Technology Decisions
- Deployment Architecture

**Best For**: Solution architects, tech leads

### 6. Test Specification

**Purpose**: Define testing strategy and cases

**Includes**:
- Test Strategy
- Test Cases (Unit, Integration, E2E)
- BDD Scenarios
- Performance Tests
- Security Tests
- Test Data Requirements
- Success Criteria

**Best For**: QA engineers, test leads

### 7. Meeting Transcript

**Purpose**: Process and structure meeting content

**Includes**:
- Meeting Summary
- Key Decisions
- Action Items
- Discussion Points
- Follow-up Tasks
- Agile User Stories
- Next Steps

**Best For**: Scrum masters, project managers

### 8. AI Coding Assistant Prompt

**Purpose**: Generate implementation instructions for AI coding tools

**Includes**:
- Component Specifications
- Data Models
- API Endpoints
- Business Logic
- Validation Rules
- Error Handling
- Test Requirements

**Best For**: Developers using Cursor, Copilot, Claude

---

## Integrations

### GitHub Integration

#### Features
- Import repository structure
- Analyze codebase
- Generate documentation from code
- Export to GitHub Wiki
- Create issues from requirements

#### Setup
1. Go to Settings → Integrations
2. Click "Connect GitHub"
3. Authorize the application
4. Select repositories to connect

#### Usage
- Generate docs from repo analysis
- Keep documentation in sync with code
- Auto-generate README files
- Create architecture diagrams from code

### JIRA Integration

#### Features
- Create epics from business requirements
- Generate user stories from functional specs
- Sync acceptance criteria
- Track implementation progress
- Link documents to issues

#### Setup
1. Get JIRA API token
2. Add JIRA URL and credentials
3. Select default project
4. Map document types to issue types

#### Usage
- One-click story creation
- Bulk import requirements
- Bidirectional sync
- Progress tracking

### Slack Integration

#### Features
- Document generation notifications
- Share documents in channels
- Collaborative reviews
- Quick feedback loops
- Team mentions

#### Setup
1. Add Slack app to workspace
2. Authorize in platform settings
3. Select notification channels
4. Configure triggers

### Confluence Integration

#### Features
- Export documents to Confluence
- Create space structure
- Maintain documentation wiki
- Version control
- Team collaboration

#### Setup
1. Add Confluence API token
2. Configure space mappings
3. Set export templates
4. Enable auto-sync

---

## Best Practices

### Writing Effective Inputs

#### DO:
- **Be Specific**: "E-commerce platform for handmade crafts with Stripe integration"
- **Include Context**: Target audience, business goals, technical constraints
- **Mention Key Features**: List must-have functionality
- **Specify Requirements**: Performance, security, compliance needs

#### DON'T:
- Be too vague: "Make a website"
- Skip important details
- Use ambiguous terms
- Forget constraints

### Example Good Input:
```
Create a B2B SaaS platform for inventory management targeting small retailers.
Key features:
- Multi-location inventory tracking
- Real-time stock updates
- Purchase order management
- Barcode scanning via mobile app
- Integration with QuickBooks and Shopify
- Role-based access control
- Monthly subscription billing

Technical requirements:
- Support 10,000 concurrent users
- 99.9% uptime SLA
- GDPR compliant
- Mobile-responsive web app
- REST API for third-party integrations
```

### Document Quality Tips

1. **Review and Refine**
   - Always review generated content
   - Edit for accuracy and completeness
   - Add project-specific details
   - Remove irrelevant sections

2. **Use Templates**
   - Create templates for common projects
   - Maintain consistency across documents
   - Save time on similar projects

3. **Iterative Generation**
   - Start with high-level documents
   - Add detail progressively
   - Use previous docs as context

4. **Version Control**
   - Save important versions
   - Track changes over time
   - Maintain document history

### Team Collaboration

1. **Establish Conventions**
   - Naming standards
   - Folder structure
   - Review process
   - Approval workflow

2. **Share Knowledge**
   - Document templates
   - Best practices
   - Lessons learned
   - Success stories

3. **Regular Updates**
   - Keep docs current
   - Reflect changes
   - Archive outdated versions
   - Communicate updates

---

## Troubleshooting

### Common Issues

#### 1. Generation Fails or Times Out

**Symptoms**: Document generation doesn't complete

**Solutions**:
- Check API key validity
- Reduce number of documents
- Try different AI provider
- Use --fast option in CLI
- Check internet connection

#### 2. Poor Quality Output

**Symptoms**: Generic or irrelevant content

**Solutions**:
- Provide more detailed input
- Use custom prompts
- Select appropriate document type
- Try different AI model
- Increase quality setting

#### 3. Authentication Issues

**Symptoms**: Can't login or access features

**Solutions**:
- Clear browser cache
- Check email verification
- Reset password
- Try different browser
- Contact support

#### 4. CLI Not Working

**Symptoms**: Commands fail or not recognized

**Solutions**:
```bash
# Reinstall CLI
npm uninstall -g sdlc-ai
npm install -g sdlc-ai

# Check version
sdlc --version

# Reset configuration
sdlc config reset

# Check Node version (needs 16+)
node --version
```

#### 5. MCP Server Issues

**Symptoms**: Claude can't access SDLC tools

**Solutions**:
- Restart Claude Desktop
- Check configuration file
- Verify API keys
- Review Claude logs
- Test server directly

### Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `API key required` | Missing API key | Add OpenAI or Anthropic key |
| `Rate limit exceeded` | Too many requests | Wait or upgrade plan |
| `Invalid input` | Input too short/long | Adjust input length |
| `Network error` | Connection issue | Check internet/firewall |
| `Unauthorized` | Auth problem | Re-login or check permissions |

### Getting Help

1. **Documentation**: https://sdlc.dev/docs
2. **GitHub Issues**: Report bugs and request features
3. **Community Forum**: Ask questions and share tips
4. **Email Support**: support@sdlc.dev (Pro users)

---

## FAQ

### General Questions

**Q: Is it free to use?**
A: Yes! Anonymous users get 10 documents/day. Sign up for unlimited basic features. Pro plans available for advanced features.

**Q: Which AI provider is better?**
A: OpenAI GPT-4 excels at technical content. Anthropic Claude is better for business and creative content. Try both!

**Q: Can I use my own API keys?**
A: Yes, you can use your own OpenAI or Anthropic API keys for unlimited generation.

**Q: Is my data secure?**
A: Yes, we use encryption, secure storage, and never share your data. You can also self-host for complete control.

### Technical Questions

**Q: Can I self-host the platform?**
A: Yes, the platform is open-source. See our deployment guide for instructions.

**Q: What formats can I export?**
A: Markdown, HTML, PDF, JSON, and ZIP archives for multiple documents.

**Q: Can I customize the prompts?**
A: Yes, admin users can create and manage custom prompt templates.

**Q: Does it work offline?**
A: The CLI saves documents locally. Web app requires internet for AI generation.

### Integration Questions

**Q: Which tools integrate with the platform?**
A: GitHub, JIRA, Confluence, Slack, and any tool that supports webhooks or REST APIs.

**Q: Can I use it in my CI/CD pipeline?**
A: Yes! The CLI is perfect for automation. See our CI/CD guide.

**Q: Does it work with VS Code?**
A: Not directly, but you can use the CLI from VS Code terminal or integrate via tasks.

### Troubleshooting Questions

**Q: Why is generation slow?**
A: Complex documents take time. Try: reducing document count, using --fast mode, or selecting a faster model.

**Q: Can I cancel a generation?**
A: Yes, press Ctrl+C in CLI or click Cancel in web app.

**Q: What if I exceed limits?**
A: Anonymous users: wait 24 hours or sign up. Free users: upgrade to Pro for higher limits.

---

## Conclusion

The SDLC AI Platform revolutionizes how teams create and manage software documentation. Whether you're a solo developer or enterprise team, the platform adapts to your workflow and helps you produce professional documentation efficiently.

### Key Takeaways

1. **Multiple Access Methods**: Web, CLI, and AI assistants
2. **Comprehensive Coverage**: 8+ document types for complete SDLC
3. **Flexible Integration**: Works with your existing tools
4. **Scalable Solution**: From individual to enterprise use
5. **Open Source**: Customize and self-host as needed

### Next Steps

1. **Try It Now**: Generate your first document at https://sdlc.dev
2. **Install CLI**: `npm install -g sdlc-ai`
3. **Join Community**: Contribute and get support
4. **Share Feedback**: Help us improve the platform

Thank you for choosing SDLC AI Platform! 🚀

---

*Last updated: November 2024*
*Version: 1.0.0*