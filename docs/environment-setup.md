# Environment Setup Guide

This guide will help you set up your development environment for SDLC AI.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18 or higher
- **npm**, **yarn**, or **pnpm**
- **Git** for version control
- **Supabase Account** (free tier available)
- **OpenAI API Key** (for AI generation)

## 🔧 Environment Variables

Create a `.env.local` file in your project root with the following configuration:

```env
# =============================================================================
# SUPABASE CONFIGURATION (Required)
# =============================================================================
# Get these from your Supabase project settings: https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# =============================================================================
# AUTHENTICATION (Required)
# =============================================================================
# Generate a random secret: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# =============================================================================
# AI CONFIGURATION (Required)
# =============================================================================
# OpenAI API Key - Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Anthropic Claude API Key - Get from: https://console.anthropic.com/
# ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# =============================================================================
# ADMIN SETUP (Optional)
# =============================================================================
# Set admin email to automatically assign admin role to this user
# If not set, the first user to sign up will become admin
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourcompany.com

# =============================================================================
# INTEGRATION KEYS (Optional)
# =============================================================================

# JIRA Integration
# JIRA_API_TOKEN=your_jira_api_token_here
# JIRA_BASE_URL=https://yourcompany.atlassian.net
# JIRA_EMAIL=your-jira-email@company.com

# Confluence Integration  
# CONFLUENCE_API_TOKEN=your_confluence_api_token_here
# CONFLUENCE_BASE_URL=https://yourcompany.atlassian.net/wiki
# CONFLUENCE_EMAIL=your-confluence-email@company.com

# Slack Integration
# SLACK_BOT_TOKEN=xoxb-your-slack-bot-token-here
# SLACK_SIGNING_SECRET=your-slack-signing-secret-here

# GitHub Integration
# GITHUB_TOKEN=ghp_your-github-token-here
# GITHUB_ORG=your-github-organization
```

## 🚀 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/sdlc-ai.git
cd sdlc-ai
npm install
```

### 2. Set Up Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose your organization and enter project details
   - Wait for the project to be created

2. **Get Your Credentials**
   - Go to **Settings → API** in your Supabase dashboard
   - Copy the **Project URL** and **anon/public key**
   - Copy the **service_role key** (keep this secret!)

3. **Set Up the Database**
   - Go to **SQL Editor** in your Supabase dashboard
   - Run the scripts in this order:
     ```sql
     -- First, run: scripts/setup-database.sql
     -- Then, run: scripts/prompt-management-migration.sql
     ```

### 3. Get OpenAI API Key

1. **Create OpenAI Account**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Sign up or log in to your account

2. **Generate API Key**
   - Go to **API Keys** section
   - Click **Create new secret key**
   - Copy the key (starts with `sk-`)
   - **Important**: Store this securely, you won't see it again!

3. **Set Up Billing** (if needed)
   - Add payment method in OpenAI dashboard
   - Set usage limits to control costs

### 4. Generate NextAuth Secret

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

### 5. Create Environment File

Create `.env.local` in your project root and add all the variables above with your actual values.

### 6. Start Development

```bash
npm run dev
```

Your application will be available at [http://localhost:3000](http://localhost:3000)

## 🔐 Admin Setup

### Automatic Admin Assignment

- **If you set `NEXT_PUBLIC_ADMIN_EMAIL`**: That email gets admin privileges
- **If not set**: First user to sign up becomes admin automatically

### Manual Admin Assignment

If you need to manually assign admin privileges:

```sql
-- Run in Supabase SQL Editor
INSERT INTO user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

## 🔌 Optional Integrations

### JIRA Integration

1. **Generate API Token**
   - Go to [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Click **Create API token**
   - Copy the token

2. **Add to Environment**
   ```env
   JIRA_API_TOKEN=your_token_here
   JIRA_BASE_URL=https://yourcompany.atlassian.net
   JIRA_EMAIL=your-email@company.com
   ```

### Confluence Integration

Uses the same API token as JIRA:

```env
CONFLUENCE_API_TOKEN=your_jira_token_here
CONFLUENCE_BASE_URL=https://yourcompany.atlassian.net/wiki
CONFLUENCE_EMAIL=your-email@company.com
```

### Slack Integration

1. **Create Slack App**
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Click **Create New App**
   - Choose **From scratch**
   - Enter app name and select workspace

2. **Configure Permissions**
   - Go to **OAuth & Permissions**
   - Add these scopes:
     - `chat:write`
     - `channels:read`
     - `users:read`

3. **Install to Workspace**
   - Click **Install to Workspace**
   - Copy the **Bot User OAuth Token**

4. **Add to Environment**
   ```env
   SLACK_BOT_TOKEN=xoxb-your-bot-token-here
   SLACK_SIGNING_SECRET=your-signing-secret-here
   ```

### GitHub Integration

1. **Generate Personal Access Token**
   - Go to **Settings → Developer settings → Personal access tokens**
   - Click **Generate new token (classic)**
   - Select scopes: 
     - `repo` (Full control of private repositories)
     - `read:org` (Read org membership)
     - `read:user` (Read user profile data)
     - `project` (Full control of GitHub Projects v2)
     - `read:project` (Read GitHub Projects v2 data)
     - `write:repo_hook` (Write repository hooks)
     - `workflow` (Update GitHub Action workflows)
     - `actions:write` (Write GitHub Actions)

2. **Add to Environment**
   ```env
   GITHUB_TOKEN=ghp_your-token-here
   GITHUB_ORG=your-organization-name
   ```

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check if Supabase URL and keys are correct
# Verify database scripts were run successfully
# Check Supabase dashboard for any errors
```

#### Authentication Issues
```bash
# Verify NEXTAUTH_SECRET is set
# Check NEXTAUTH_URL matches your domain
# Ensure Google OAuth is configured in Supabase
```

#### API Generation Issues
```bash
# Verify OPENAI_API_KEY is correct
# Check OpenAI account has sufficient credits
# Review API usage limits
```

#### Admin Access Issues
```bash
# Check if NEXT_PUBLIC_ADMIN_EMAIL is set correctly
# Verify user email matches exactly
# Check user_roles table in Supabase
```

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```env
NEXT_PUBLIC_DEBUG=true
```

### Getting Help

- **Documentation**: Visit `/admin/prompts/guide` in your running application
- **GitHub Issues**: [Report bugs and request features](https://github.com/your-org/sdlc-ai/issues)
- **Community**: Join our Discord server for real-time help
- **Email**: Contact support@sdlc-ai.com for urgent issues

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env.local` to version control
- ✅ Use different keys for development and production
- ✅ Rotate API keys regularly
- ✅ Use environment-specific Supabase projects

### Database Security
- ✅ Enable Row Level Security (RLS) in Supabase
- ✅ Review and test RLS policies
- ✅ Use service role key only on server-side
- ✅ Regularly audit database access

### API Security
- ✅ Set usage limits on OpenAI account
- ✅ Monitor API usage regularly
- ✅ Use least-privilege principle for integrations
- ✅ Enable rate limiting in production

## 📊 Production Deployment

### Environment Differences

For production, update these variables:

```env
NODE_ENV=production
NEXTAUTH_URL=https://your-production-domain.com

# Use production Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_key

# Use production OpenAI key (optional)
OPENAI_API_KEY=sk-your-production-key
```

### Deployment Platforms

#### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

#### Docker
```bash
# Build container
docker build -t sdlc-ai .

# Run with environment file
docker run -p 3000:3000 --env-file .env.local sdlc-ai
```

#### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🎯 Next Steps

Once your environment is set up:

1. **Create Your First Prompt** - Visit `/admin/prompts` to set up document templates
2. **Test Generation** - Try generating a sample project document
3. **Configure Integrations** - Set up JIRA and Confluence if needed
4. **Customize Templates** - Adapt prompts to your organization's needs
5. **Invite Team Members** - Share access and assign appropriate roles

Happy documenting! 🚀 