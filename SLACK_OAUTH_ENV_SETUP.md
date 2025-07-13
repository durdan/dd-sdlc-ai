# 🔧 Slack OAuth Environment Setup Guide

## ✅ **Updated Implementation**

The Slack OAuth redirect URL is now properly configured using environment variables for better security and flexibility.

## 📋 **Required Environment Variables**

### **Development (.env.local)**
```bash
# Slack OAuth Configuration
SLACK_CLIENT_ID=your_slack_client_id_here
SLACK_CLIENT_SECRET=your_slack_client_secret_here
SLACK_REDIRECT_URI=http://localhost:3000/api/slack/oauth/callback
SLACK_SIGNING_SECRET=your_slack_signing_secret_here

# Public environment variables (accessible in frontend)
NEXT_PUBLIC_SLACK_CLIENT_ID=your_slack_client_id_here
NEXT_PUBLIC_SLACK_REDIRECT_URI=http://localhost:3000/api/slack/oauth/callback

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Production (.env.production)**
```bash
# Slack OAuth Configuration
SLACK_CLIENT_ID=your_slack_client_id_here
SLACK_CLIENT_SECRET=your_slack_client_secret_here
SLACK_REDIRECT_URI=https://yourdomain.com/api/slack/oauth/callback
SLACK_SIGNING_SECRET=your_slack_signing_secret_here

# Public environment variables (accessible in frontend)
NEXT_PUBLIC_SLACK_CLIENT_ID=your_slack_client_id_here
NEXT_PUBLIC_SLACK_REDIRECT_URI=https://yourdomain.com/api/slack/oauth/callback

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### **Staging (.env.staging)**
```bash
# Slack OAuth Configuration
SLACK_CLIENT_ID=your_slack_client_id_here
SLACK_CLIENT_SECRET=your_slack_client_secret_here
SLACK_REDIRECT_URI=https://staging.yourdomain.com/api/slack/oauth/callback
SLACK_SIGNING_SECRET=your_slack_signing_secret_here

# Public environment variables (accessible in frontend)
NEXT_PUBLIC_SLACK_CLIENT_ID=your_slack_client_id_here
NEXT_PUBLIC_SLACK_REDIRECT_URI=https://staging.yourdomain.com/api/slack/oauth/callback

# App Configuration
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
```

## 🔧 **Benefits of Using Environment Variables**

### **✅ Security**
- Prevents URL manipulation and injection attacks
- Centralized configuration management
- Environment-specific URLs

### **✅ Flexibility**
- Different URLs for dev/staging/production
- Easy to update without code changes
- Supports multiple deployment environments

### **✅ Best Practices**
- Industry-standard OAuth implementation
- Consistent with other OAuth providers
- Easier debugging and troubleshooting

## 🏗️ **Implementation Changes**

### **1. Frontend (components/slack-oauth-button.tsx)**
```typescript
// Before: Dynamic URL building
const redirectUri = `${window.location.origin}/api/slack/oauth/callback`

// After: Environment variable
const redirectUri = process.env.NEXT_PUBLIC_SLACK_REDIRECT_URI
```

### **2. Backend (app/api/slack/oauth/callback/route.ts)**
```typescript
// Before: Dynamic URL building
redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/oauth/callback`

// After: Environment variable
redirect_uri: process.env.SLACK_REDIRECT_URI!
```

## 🔗 **Slack App Configuration**

### **1. Create Slack App**
1. Go to https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. App Name: **"SDLC.dev AI Assistant"**
4. Choose your development workspace

### **2. Configure OAuth & Permissions**
1. Go to **"OAuth & Permissions"**
2. Add **Redirect URLs** for each environment:

| Environment | Redirect URL |
|-------------|-------------|
| **Development** | `http://localhost:3000/api/slack/oauth/callback` |
| **Staging** | `https://staging.yourdomain.com/api/slack/oauth/callback` |
| **Production** | `https://yourdomain.com/api/slack/oauth/callback` |

3. Add **Bot Token Scopes**:
   - `chat:write`
   - `commands`
   - `channels:read`
   - `groups:read`
   - `users:read`
   - `team:read`

### **3. Get Credentials**
1. Go to **"Basic Information"** → **"App Credentials"**
2. Copy values to your environment file:
   - **Client ID** → `SLACK_CLIENT_ID` and `NEXT_PUBLIC_SLACK_CLIENT_ID`
   - **Client Secret** → `SLACK_CLIENT_SECRET`
   - **Signing Secret** → `SLACK_SIGNING_SECRET`

## 🧪 **Testing Setup**

### **Local Development with ngrok**
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Update environment variables
SLACK_REDIRECT_URI=https://abc123.ngrok.io/api/slack/oauth/callback
NEXT_PUBLIC_SLACK_REDIRECT_URI=https://abc123.ngrok.io/api/slack/oauth/callback

# Update Slack app redirect URLs to use ngrok URL
```

### **Environment Variable Validation**
```bash
# Check if all required variables are set
echo "SLACK_CLIENT_ID: $SLACK_CLIENT_ID"
echo "SLACK_CLIENT_SECRET: $SLACK_CLIENT_SECRET"
echo "SLACK_REDIRECT_URI: $SLACK_REDIRECT_URI"
echo "NEXT_PUBLIC_SLACK_CLIENT_ID: $NEXT_PUBLIC_SLACK_CLIENT_ID"
echo "NEXT_PUBLIC_SLACK_REDIRECT_URI: $NEXT_PUBLIC_SLACK_REDIRECT_URI"
```

## 🔐 **Security Considerations**

### **Environment Variable Security**
- `SLACK_CLIENT_SECRET` - Server-side only, never exposed to frontend
- `SLACK_SIGNING_SECRET` - Server-side only, used for request verification
- `NEXT_PUBLIC_*` - Exposed to frontend, safe for client-side use

### **Redirect URI Validation**
- Slack validates the redirect URI against configured URLs
- Must match exactly (including protocol, domain, path)
- Prevents OAuth hijacking attacks

## 📝 **Quick Setup Checklist**

- [ ] Copy environment variables to `.env.local`
- [ ] Create Slack app at https://api.slack.com/apps
- [ ] Configure OAuth redirect URLs in Slack app
- [ ] Copy credentials to environment file
- [ ] Test OAuth flow locally
- [ ] Configure production/staging environments
- [ ] Update Slack app with production URLs
- [ ] Test OAuth flow in production

## 🚀 **Ready to Use!**

Once configured, users can:
1. Click **"Add to Slack"** button in Integration Hub
2. Authorize app in Slack workspace
3. Use `/sdlc create "task description"` commands
4. Receive real-time notifications from Claude AI

The redirect URI is now securely managed through environment variables! 🎉

## 🐛 **Troubleshooting**

### **404 Error with ngrok**

If you get a 404 error like:
```
https://abc123.ngrok-free.app/slack/oauth/callback?code=...&state=...
```

**Problem**: Missing `/api/` prefix in the redirect URL.

**Solution**:
1. **Update your Slack app redirect URL** to include `/api/`:
   ```
   https://1a253f9180dc.ngrok-free.app/api/slack/oauth/callback
   ```

2. **Update your environment variables**:
   ```bash
   SLACK_REDIRECT_URI=https://1a253f9180dc.ngrok-free.app/api/slack/oauth/callback
   NEXT_PUBLIC_SLACK_REDIRECT_URI=https://1a253f9180dc.ngrok-free.app/api/slack/oauth/callback
   ```

3. **Restart your development server** after updating environment variables.

### **ngrok Setup Commands**
```bash
# 1. Start ngrok
ngrok http 3000

# 2. Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)
# 3. Update environment variables with your ngrok URL
NEXT_PUBLIC_APP_URL=https://1a253f9180dc.ngrok-free.app
SLACK_REDIRECT_URI=https://1a253f9180dc.ngrok-free.app/api/slack/oauth/callback
NEXT_PUBLIC_SLACK_REDIRECT_URI=https://1a253f9180dc.ngrok-free.app/api/slack/oauth/callback

# 4. Update Slack app redirect URLs at https://api.slack.com/apps
# 5. Restart your Next.js development server
npm run dev
```

### **Complete Environment Variables for ngrok Testing**
```bash
# Your ngrok URL (CRITICAL - this was missing!)
NEXT_PUBLIC_APP_URL=https://1a253f9180dc.ngrok-free.app

# Slack OAuth Configuration
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=https://1a253f9180dc.ngrok-free.app/api/slack/oauth/callback
SLACK_SIGNING_SECRET=your_slack_signing_secret

# Public Slack Configuration
NEXT_PUBLIC_SLACK_CLIENT_ID=your_slack_client_id
NEXT_PUBLIC_SLACK_REDIRECT_URI=https://1a253f9180dc.ngrok-free.app/api/slack/oauth/callback

# Other required variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Common Issues**
- **Wrong path**: Use `/api/slack/oauth/callback` not `/slack/oauth/callback`
- **HTTP vs HTTPS**: ngrok provides both, always use HTTPS for OAuth
- **Environment variables**: Restart dev server after updating .env.local
- **Slack app config**: Must match exactly with environment variables

### **Critical Authentication Issues**

#### **Issue 1: "Auth session missing!" Error**
**Problem**: User is not authenticated when OAuth callback occurs.

**Root Cause**: 
- OAuth flow redirects to callback URL
- User session is not maintained across redirect
- Supabase session cookies are not being read properly

**Solution**:
1. **Make sure user is signed in** before starting OAuth flow
2. **Check your Supabase auth configuration**
3. **Verify cookie settings** in your Supabase client

#### **Issue 2: "Base URL: https://undefined"**
**Problem**: `NEXT_PUBLIC_APP_URL` environment variable is not being read.

**Troubleshooting Steps**:
```bash
# 1. Check if your .env.local file exists
ls -la .env.local

# 2. Verify the environment variable is set
echo "NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL"

# 3. Check for typos in variable name
grep -n "NEXT_PUBLIC_APP_URL" .env.local

# 4. Restart your development server
npm run dev
```

#### **Issue 3: OAuth Flow Breaks User Session**
**Problem**: User gets signed out during OAuth flow.

**Solution**: Make sure to sign in **before** starting the OAuth flow.

**Proper Flow**:
1. User signs in to your app first
2. User clicks "Add to Slack" 
3. OAuth flow completes with authenticated user
4. Integration saved successfully

**If user is not authenticated**: The callback will redirect to sign-in page with error information.

#### **Issue 4: "Cannot read properties of undefined (reading 'getUser')"**
**Problem**: Supabase client is not created properly.

**Root Cause**: The `createClient()` function was not being awaited properly.

**Solution**: Fixed in the OAuth callback route:
```typescript
// Before: 
const supabase = createClient();

// After:
const supabase = await createClient();
```

**This is now fixed** in the latest code update.

### **Debug Commands**

#### **Check Environment Variables**
```bash
# In your terminal where you run npm run dev
echo "App URL: $NEXT_PUBLIC_APP_URL"
echo "Slack Client ID: $NEXT_PUBLIC_SLACK_CLIENT_ID"
echo "Slack Redirect: $NEXT_PUBLIC_SLACK_REDIRECT_URI"
echo "Slack Server Redirect: $SLACK_REDIRECT_URI"
```

#### **Check .env.local Contents**
```bash
# Show your environment file (remove sensitive values before sharing)
cat .env.local | grep -E "(NEXT_PUBLIC_APP_URL|SLACK_)"
```

#### **Test API Endpoint**
```bash
# Test if your OAuth callback endpoint exists
curl -I https://1a253f9180dc.ngrok-free.app/api/slack/oauth/callback
```

### **Complete Working Example**

#### **Your .env.local should look like this:**
```bash
# CRITICAL: Replace with your actual ngrok URL
NEXT_PUBLIC_APP_URL=https://1a253f9180dc.ngrok-free.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Slack OAuth (replace with your actual values)
SLACK_CLIENT_ID=4899495460323.9171463789623
SLACK_CLIENT_SECRET=your_slack_client_secret_here
SLACK_REDIRECT_URI=https://1a253f9180dc.ngrok-free.app/api/slack/oauth/callback
SLACK_SIGNING_SECRET=your_slack_signing_secret_here

# Public Slack Configuration
NEXT_PUBLIC_SLACK_CLIENT_ID=4899495460323.9171463789623
NEXT_PUBLIC_SLACK_REDIRECT_URI=https://1a253f9180dc.ngrok-free.app/api/slack/oauth/callback
```

### **Step-by-Step Fix Process**

1. **Update your .env.local** with the complete configuration above
2. **Restart your development server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
3. **IMPORTANT: Sign in to your app first** 
   - Go to http://localhost:3000/signin (or your ngrok URL)
   - Sign in with your account
   - Verify you're on the dashboard
4. **Then try the Slack OAuth flow**
   - Go to Integration Hub
   - Click "Add to Slack"
   - Complete OAuth in Slack
5. **Check the logs** for proper authentication

**⚠️ Critical**: Always sign in **before** starting OAuth flow!

### **Expected Log Output**
```
🔄 Slack OAuth callback started
🔗 Base URL for redirects: https://1a253f9180dc.ngrok-free.app
✅ User authenticated: user-id-here
🔄 Using redirect URI: https://1a253f9180dc.ngrok-free.app/api/slack/oauth/callback
✅ Token exchange successful: { team: 'Your Workspace', bot_user_id: 'B...' }
✅ Slack integration saved successfully
``` 