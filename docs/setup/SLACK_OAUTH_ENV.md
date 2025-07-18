# 🔧 Slack OAuth Environment Variables

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Slack OAuth Configuration (Centralized App)
SLACK_CLIENT_ID=your_slack_client_id_here
SLACK_CLIENT_SECRET=your_slack_client_secret_here
SLACK_REDIRECT_URI=http://localhost:3000/api/slack/oauth/callback

# Public environment variables (accessible in frontend)
NEXT_PUBLIC_SLACK_CLIENT_ID=your_slack_client_id_here
NEXT_PUBLIC_SLACK_REDIRECT_URI=http://localhost:3000/api/slack/oauth/callback

# Optional: Slack App Configuration
SLACK_APP_ID=your_slack_app_id_here
SLACK_SIGNING_SECRET=your_slack_signing_secret_here
```

## Environment-Specific Configuration

### Development (.env.local)
```bash
SLACK_REDIRECT_URI=http://localhost:3000/api/slack/oauth/callback
NEXT_PUBLIC_SLACK_REDIRECT_URI=http://localhost:3000/api/slack/oauth/callback
```

### Production (.env.production)
```bash
SLACK_REDIRECT_URI=https://yourdomain.com/api/slack/oauth/callback
NEXT_PUBLIC_SLACK_REDIRECT_URI=https://yourdomain.com/api/slack/oauth/callback
```

### Staging (.env.staging)
```bash
SLACK_REDIRECT_URI=https://staging.yourdomain.com/api/slack/oauth/callback
NEXT_PUBLIC_SLACK_REDIRECT_URI=https://staging.yourdomain.com/api/slack/oauth/callback
```

## How to Get These Values

### 1. Create Slack App
1. Go to https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. App Name: **"SDLC.dev AI Assistant"**
5. Choose your development workspace

### 2. Get Client ID & Secret
1. Go to **"Basic Information"** → **"App Credentials"**
2. Copy **Client ID** → `SLACK_CLIENT_ID` and `NEXT_PUBLIC_SLACK_CLIENT_ID`
3. Copy **Client Secret** → `SLACK_CLIENT_SECRET`
4. Copy **Signing Secret** → `SLACK_SIGNING_SECRET`

### 3. Configure OAuth & Permissions
1. Go to **"OAuth & Permissions"**
2. Add Redirect URLs for each environment:
   - Development: `http://localhost:3000/api/slack/oauth/callback`
   - Production: `https://yourdomain.com/api/slack/oauth/callback`
   - Staging: `https://staging.yourdomain.com/api/slack/oauth/callback`
3. Add Bot Token Scopes:
   - `chat:write`
   - `commands`
   - `channels:read`
   - `groups:read`
   - `users:read`
   - `team:read`

### 4. Configure Slash Commands
1. Go to **"Slash Commands"**
2. Click **"Create New Command"**
3. Command: `/sdlc`
4. Request URL: `https://yourapp.com/api/slack/events`
5. Short Description: `SDLC.dev AI Assistant`
6. Usage Hint: `create [task description]`

### 5. Configure Event Subscriptions (Optional)
1. Go to **"Event Subscriptions"**
2. Enable Events: **On**
3. Request URL: `https://yourapp.com/api/slack/events`
4. Subscribe to bot events:
   - `app_mention`
   - `message.im`

### 6. Install App
1. Go to **"Install App"**
2. Click **"Install to Workspace"**
3. Authorize the app

## User Experience

### Before (BYOK):
```
User must:
1. Create their own Slack app
2. Configure 10+ settings
3. Get 5 different tokens
4. Complete complex setup wizard
5. Debug configuration issues
```

### After (OAuth):
```
User just:
1. Clicks "Add to Slack" button
2. Authorizes app in popup
3. Done! ✨
```

## Architecture

```
SDLC.dev Slack App (Centralized)
├── OAuth Scopes: chat:write, commands, etc.
├── Slash Command: /sdlc
├── Event Subscriptions: app_mention, message.im
├── Request URL: https://yourapp.com/api/slack/events
└── Distribute: Install button on dashboard

User Experience:
├── Click "Add to Slack" → OAuth flow
├── Redirect to: /api/slack/oauth/callback
├── Save to: user_integrations table
└── Ready to use: /sdlc commands
```

## Testing

### Development:
```bash
# Use ngrok for local testing
ngrok http 3000
# Update Slack app URLs to ngrok URL
```

### Production:
```bash
# Update Slack app URLs to production domain
https://yourapp.com/api/slack/oauth/callback
https://yourapp.com/api/slack/events
```
