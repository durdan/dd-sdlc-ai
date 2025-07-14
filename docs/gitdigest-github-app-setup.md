# 🚀 GitDigest Integration with Existing GitHub Webhooks

## Overview

GitDigest integrates with your existing GitHub webhook infrastructure to provide seamless automated repository analysis. It leverages your current GitHub OAuth integration and webhook system at `/api/github/webhooks`.

## 🔧 How It Works

### Architecture
```
GitHub Repository → Existing GitHub Webhooks → GitDigest Processing → AI-Powered Insights
```

### Key Benefits
- ✅ **Uses Existing Infrastructure**: Integrates with your current webhook system
- ✅ **No Duplicate Setup**: Builds on existing `/api/github/webhooks` endpoint
- ✅ **Secure & Scoped**: Uses your current GitHub OAuth permissions
- ✅ **Easy Configuration**: Simple toggle-based setup per repository
- ✅ **Centralized Management**: All settings in GitDigest dashboard

## 📋 Prerequisites

1. **Existing GitHub OAuth**: Your platform already has GitHub OAuth configured
2. **OpenAI API Key**: Required for AI-powered analysis
3. **Database Schema**: GitDigest tables (you mentioned SQL is already run)

## 🛠️ Setup Steps

### Step 1: Access GitDigest Settings

1. Go to **Dashboard** → **GitDigest** → **Settings** tab
2. Verify GitHub connection status
3. If not connected, click **"Connect GitHub"**

### Step 2: Configure Repository Selection

1. **Enable GitDigest Automation**: Toggle the main switch
2. **Select Repositories**: Choose which repos should generate digests
3. **Configure Triggers**: Select events (Push, PRs, Issues, Releases)
4. **Set Schedule**: Optional daily/weekly/monthly digests

### Step 3: Save Configuration

1. Click **"Save Settings"**
2. System generates a secure webhook token
3. Configuration is stored per repository

## 🔄 Automated Workflow

### Event Processing
1. **GitHub Event Occurs** (push, PR, issue, etc.)
2. **Platform Receives Webhook** via GitHub App
3. **User Lookup** finds users with GitDigest enabled for that repo
4. **Analysis Triggered** using user's GitHub OAuth token
5. **AI Processing** generates comprehensive digest
6. **Results Stored** in user's digest collection

### Supported Events
- **Push Events**: New commits and code changes
- **Pull Requests**: PR creation, updates, merges
- **Issues**: New issues, comments, status changes
- **Releases**: New releases and tags

## 🎯 User Experience

### For Repository Owners
1. **One-Time Setup**: Configure once per repository
2. **Automatic Insights**: Digests generated on events
3. **Customizable Triggers**: Choose relevant events
4. **Scheduled Reports**: Regular digest delivery

### For Team Members
1. **Shared Insights**: Access team repository digests
2. **Individual Settings**: Personal notification preferences
3. **Export Options**: JIRA, Confluence, GitHub Projects

## 🔐 Security & Privacy

### Data Protection
- **OAuth Scoped Access**: Uses existing GitHub permissions
- **No Source Code Storage**: Only metadata analyzed
- **User-Isolated Data**: Each user's digests are private
- **Encrypted Tokens**: Secure token management

### Permissions Required
- **Repository Access**: Read repository metadata
- **Issues**: Read issues and comments
- **Pull Requests**: Read PR information
- **Commits**: Access commit history

## 📊 Configuration Options

### Trigger Settings
```json
{
  "triggers": {
    "push": true,          // Code pushes
    "pullRequest": true,   // PR events
    "issues": false,       // Issue events
    "release": false       // Release events
  }
}
```

### Schedule Settings
```json
{
  "schedule": {
    "enabled": true,
    "frequency": "daily",  // daily, weekly, monthly
    "time": "09:00"       // UTC time
  }
}
```

### Analysis Settings
```json
{
  "analysis": {
    "depth": "standard",      // light, standard, deep
    "includeDiagrams": true,  // Generate Mermaid diagrams
    "format": "markdown"      // markdown, json, html
  }
}
```

## 🚀 Environment Variables

Add these to your `.env.local`:

```env
# GitHub App Configuration
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY=your_private_key
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Existing GitHub OAuth (already configured)
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# Database (already configured)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

## 📈 Database Schema

### Required Tables (you mentioned SQL is run)
```sql
-- GitDigest Settings
CREATE TABLE gitdigest_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  repository_full_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  triggers JSONB DEFAULT '{}',
  schedule JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GitDigest Tokens
CREATE TABLE gitdigest_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repository Digests (existing)
-- repo_digests table for storing generated digests
```

## 🔧 API Endpoints

### Settings Management
- `GET /api/gitdigest/webhook-settings` - Get user settings
- `POST /api/gitdigest/webhook-settings` - Save user settings

### Token Management
- `POST /api/gitdigest/webhook-token` - Generate webhook token

### GitHub App Webhook
- `POST /api/gitdigest/github-app` - Process GitHub events

## 🎨 UI Components

### GitDigest Settings Tab
- **GitHub Connection Status**: Shows OAuth connection
- **Repository Selection**: Multi-select with search
- **Trigger Configuration**: Event type toggles
- **Schedule Settings**: Frequency and time picker
- **Advanced Options**: Analysis depth, format, diagrams

### Features
- **Real-time Status**: Live connection indicators
- **Repository Sync**: Automatic repository list updates
- **Bulk Operations**: Enable/disable multiple repos
- **Export Integration**: JIRA, Confluence, GitHub Projects

## 🐛 Troubleshooting

### Common Issues

#### "GitHub Not Connected"
```bash
# Check OAuth configuration
NEXT_PUBLIC_GITHUB_CLIENT_ID=set
GITHUB_CLIENT_SECRET=set

# Verify callback URL
https://your-domain.com/api/auth/github/callback
```

#### "No Repositories Found"
```bash
# Check GitHub token scopes
Required: repo, read:user, read:org

# Refresh repository list
Click "Refresh Repositories" button
```

#### "Digest Generation Failed"
```bash
# Check OpenAI API key
Ensure key is configured in Settings

# Verify GitHub permissions
Check repository access permissions
```

## 🔄 Migration from Manual Webhooks

If you were using manual webhooks:

1. **Remove Manual Webhooks**: Delete from GitHub repository settings
2. **Enable GitHub App**: Use the new Settings tab
3. **Configure Repositories**: Select repos in the UI
4. **Test Integration**: Trigger events to verify

## 📚 Advanced Usage

### Custom Analysis Prompts
```javascript
// Configure custom prompts for different events
const customPrompts = {
  push: "Focus on code quality and security changes",
  pull_request: "Analyze integration impact and conflicts",
  issues: "Summarize issue trends and priority items"
}
```

### Batch Processing
```javascript
// Process multiple repositories
const repositories = ["owner/repo1", "owner/repo2"]
await Promise.all(repositories.map(repo => 
  processGitDigest(repo, event, payload)
))
```

### Integration Hooks
```javascript
// Custom post-processing
onDigestGenerated(digest => {
  // Send to Slack
  // Update JIRA
  // Create GitHub issue
})
```

## 🎯 Best Practices

### Repository Selection
- ✅ **Active Repositories**: Focus on actively developed repos
- ✅ **Team Repositories**: Include shared team projects
- ❌ **Archived Repos**: Avoid inactive repositories
- ❌ **Fork Repositories**: Usually not needed

### Trigger Configuration
- ✅ **Push Events**: For active development tracking
- ✅ **Pull Requests**: For code review insights
- ⚠️ **Issues**: Only if you want issue trend analysis
- ⚠️ **Releases**: For release impact analysis

### Schedule Settings
- **Daily**: For active projects with frequent changes
- **Weekly**: For stable projects with regular updates
- **Monthly**: For maintenance-mode projects

## 📞 Support

### Getting Help
1. **Dashboard Settings**: Check configuration in GitDigest → Settings
2. **GitHub Connection**: Verify OAuth in Integration Hub
3. **API Logs**: Check browser console for errors
4. **Database**: Verify GitDigest tables exist

### Common Solutions
- **Reconnect GitHub**: Refresh OAuth token
- **Regenerate Token**: Create new webhook token
- **Refresh Repositories**: Sync latest repo list
- **Check Permissions**: Verify GitHub access scopes

---

## 🚀 Ready to Go!

Your GitDigest GitHub App integration is now configured to:
- ✅ Automatically analyze repository changes
- ✅ Generate AI-powered insights
- ✅ Deliver scheduled digest reports
- ✅ Export to your favorite tools

Navigate to **GitDigest → Settings** to start configuring your automated repository analysis! 