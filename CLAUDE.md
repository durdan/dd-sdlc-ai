# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start development server on http://localhost:3000
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript type checking
npm run clean-install  # Remove node_modules and reinstall
```

### CLI Package (packages/cli)
```bash
cd packages/cli
npm run build      # Build CLI for distribution
npm run dev        # Watch mode for development
npm run start      # Run the CLI locally
npm link           # Link for local testing as `sdlc` command
```

### MCP Server (packages/mcp-server)
```bash
cd packages/mcp-server
npm run build      # Build MCP server
npm run dev        # Watch mode with tsx
npm run setup      # Configure Claude Desktop integration
```

### Database Management
The project uses Supabase PostgreSQL. Run migrations in Supabase SQL editor:
- Initial setup: Execute `database/schema/initial-setup.sql`
- Sample data: Execute files in `database/sample-data/`

### Testing
No test framework is configured for the main app. CLI and MCP packages have Jest configured but tests are minimal.

## Architecture Overview

This is an AI-powered SDLC automation platform with three distribution channels:
- **Web App**: Next.js 15 App Router at [sdlc.dev](https://sdlc.dev)
- **CLI Tool**: `npm install -g sdlc-ai` (packages/cli)
- **MCP Server**: For Claude Desktop integration (packages/mcp-server)

### Tech Stack
- **Frontend**: Next.js 15 App Router, React 19, shadcn/ui, Tailwind CSS
- **Backend**: Next.js API routes, Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth with Google OAuth
- **AI Services**: OpenAI GPT-4 and Anthropic Claude for document generation
- **Integrations**: GitHub, JIRA, Confluence, Slack, ClickUp, Trello, Notion

### Core Services Architecture

1. **Prompt Management System** (`lib/prompt-service.ts`, `lib/prompt-service-server.ts`)
   - 3-tier fallback: Custom → Database → Hardcoded prompts
   - A/B testing capabilities
   - Version control and analytics
   - Global cache invalidation mechanism

2. **AI Document Generation** (`lib/enhanced-claude-service.ts`, `lib/claude-service.ts`)
   - Generates: Business Analysis, Functional/Technical/UX Specs, Architecture Diagrams
   - Supports multiple AI providers (OpenAI, Anthropic)
   - Streaming responses for better UX

3. **Database Services** (`lib/database-service.ts`, `lib/sdlc-document-database-service.ts`)
   - Project and document management
   - User configurations and API key storage
   - Anonymous user support with session tracking

4. **Integration Services** (all in `lib/`)
   - GitHub: Repository analysis, project creation (`github-projects-service.ts`)
   - JIRA: Epic/Story creation (`jira-service.ts`)
   - Slack: OAuth flow, notifications (`slack-service-oauth.ts`)
   - GitDigest: Repository analysis and reporting (`gitdigest-*.ts`)
   - ClickUp, Trello, Notion: Additional PM tool integrations

### Key API Routes Pattern
All API routes follow similar structure:
- Input validation with Zod schemas
- User authentication check
- Service layer invocation
- Error handling with appropriate status codes

Example: `/app/api/generate-sdlc/route.ts` for main document generation

### Database Schema
Main tables:
- `sdlc_projects`: Core project data
- `documents`: Generated documents by type
- `prompt_templates`: Prompt management system
- `user_configurations`: User API keys and settings
- `early_access_waitlist`: Freemium user management

### Environment Variables
Minimum required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- `NEXTAUTH_SECRET`

Optional for v0.dev integration:
- `V0_SYSTEM_API_KEY` - System v0.dev API key for users without their own key (2 generations/day)
- `V0_SYSTEM_KEY_ENABLED` - Enable/disable system key usage (default: true)
- `V0_DAILY_LIMIT` - Daily generation limit per user (default: 2)

See `.env.example` for complete list with descriptions.

### Component Structure
- `/components/ui/`: shadcn/ui base components
- `/components/admin/`: Admin panel components (prompt management)
- `/components/`: Feature-specific components (viewers, modals, dashboards)

### Authentication Flow
1. User signs in via Google OAuth through Supabase Auth
2. First user with `NEXT_PUBLIC_ADMIN_EMAIL` or first user overall becomes admin
3. Role-based access control: Admin, Manager, User
4. Anonymous users supported with session tracking

### Key Features Implementation
- **Freemium System**: Usage tracking, credit system, upgrade prompts (`lib/freemium-middleware.ts`, `lib/usage-tracking-service.ts`)
- **Early Access**: Waitlist management with approval workflow (`lib/early-access-service.ts`)
- **Prompt Variables**: Dynamic variable substitution in prompts
- **Mermaid Diagrams**: Real-time preview and export (`lib/mermaid-parser.ts`, `lib/mermaid-utils.ts`)
- **Streaming Responses**: Server-Sent Events for real-time document generation

### Monorepo Structure
```
/                       # Main Next.js web app
├── packages/cli/       # NPM package: sdlc-ai (Commander.js CLI)
└── packages/mcp-server/# NPM package: @sdlc/mcp-server (Model Context Protocol)
```

### Document Types Generated
Business Analysis, Functional Specs, Technical Specs, UX/UI Specs, Architecture Diagrams, Test Plans, Meeting Transcripts, AI Coding Prompts