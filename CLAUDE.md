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
```

### Database Management
The project uses Supabase PostgreSQL. Run migrations in Supabase SQL editor:
- Initial setup: Execute `database/schema/initial-setup.sql`
- Sample data: Execute files in `database/sample-data/`

### Testing
Currently no test framework is configured. `npm test` returns "No tests configured yet".

## Architecture Overview

This is an AI-powered SDLC automation platform built with:
- **Frontend**: Next.js 15 App Router, React 19, shadcn/ui components, Tailwind CSS
- **Backend**: Next.js API routes, Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth with Google OAuth
- **AI Services**: OpenAI GPT-4 and Anthropic Claude for document generation
- **Key Integrations**: GitHub, JIRA, Confluence, Slack

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

4. **Integration Services**
   - GitHub: Repository analysis, project creation (`lib/github-projects-service.ts`)
   - JIRA: Epic/Story creation (`lib/jira-service.ts`)
   - Slack: OAuth flow, notifications (`lib/slack-service-oauth.ts`)
   - GitDigest: Repository analysis and reporting (`lib/gitdigest-*.ts`)

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
- **Freemium System**: Usage tracking, credit system, upgrade prompts
- **Early Access**: Waitlist management with approval workflow
- **Prompt Variables**: Dynamic variable substitution in prompts
- **Mermaid Diagrams**: Real-time preview and export capabilities
- **Mobile Responsive**: Optimized UI for mobile devices