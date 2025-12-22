# 🔗 GitHub Connection Guide

This guide will help you connect your SDLC.dev account to GitHub.

## 📋 Prerequisites

1. **GitHub Account** - You need a GitHub account
2. **GitHub OAuth App** - You need to create a GitHub OAuth App (see setup below)
3. **Environment Variables** - Configure your OAuth credentials

## 🚀 Quick Start: Connect via UI

### Step 1: Access Integration Hub

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your dashboard: `http://localhost:3000/dashboard`

3. Click on **"Integration Hub"** button (or navigate to the integrations section)

4. Find the **GitHub** integration card

### Step 2: Connect GitHub

1. Click the **"Connect GitHub"** button
2. You'll be redirected to GitHub to authorize the application
3. Grant the required permissions:
   - ✅ Repository access
   - ✅ Issues and Pull Requests
   - ✅ GitHub Projects
   - ✅ Workflows and Actions
4. You'll be redirected back to your dashboard
5. GitHub should now show as **"Connected"** ✅

## ⚙️ Setup GitHub OAuth App (If Not Already Done)

If you don't have a GitHub OAuth App set up, follow these steps:

### 1. Create GitHub OAuth App

1. Go to GitHub → **Settings** → **Developer settings** → **OAuth Apps**
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `SDLC.dev` (or your app name)
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback` (or your production callback URL)
4. Click **"Register application"**

### 2. Get Your Credentials

1. After creating the app, you'll see:
   - **Client ID** (public)
   - **Client Secret** (keep this secret!)

2. Copy these values

### 3. Configure Environment Variables

Create or update your `.env.local` file:

```env
# GitHub OAuth Configuration
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

**Important Notes:**
- `NEXT_PUBLIC_GITHUB_CLIENT_ID` is public and safe to expose in client-side code
- `GITHUB_CLIENT_SECRET` is secret and must never be exposed in client-side code
- Restart your development server after adding these variables

## 🔍 Verify Connection

### Method 1: Check Integration Hub UI

1. Go to Integration Hub
2. Look for GitHub integration card
3. Status should show **"Connected"** with your GitHub username

### Method 2: Check via API

```bash
# Make sure you're authenticated first
curl http://localhost:3000/api/auth/github/status \
  -H "Cookie: your-session-cookie"
```

Expected response:
```json
{
  "connected": true,
  "user": {
    "login": "your-username",
    "name": "Your Name",
    "email": "your-email@example.com"
  },
  "repositories": [...]
}
```

## 🛠️ Troubleshooting

### Issue: "GitHub OAuth not configured"

**Solution:**
- Check that `NEXT_PUBLIC_GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set in `.env.local`
- Restart your development server
- Verify the values are correct (no extra spaces or quotes)

### Issue: "Invalid redirect URI"

**Solution:**
- Make sure your GitHub OAuth App callback URL matches exactly:
  - Development: `http://localhost:3000/api/auth/github/callback`
  - Production: `https://your-domain.com/api/auth/github/callback`
- Check for trailing slashes or protocol mismatches

### Issue: "Failed to exchange code for token"

**Solution:**
- Verify your `GITHUB_CLIENT_SECRET` is correct
- Check that the OAuth app is not suspended or deleted
- Ensure the authorization code hasn't expired (they expire quickly)

### Issue: Connection shows but repositories don't load

**Solution:**
- Check that your GitHub token has the required scopes:
  - `repo` - Full repository access
  - `read:user` - Read user profile
  - `user:email` - Access email
- Try disconnecting and reconnecting

## 📚 Required GitHub Permissions

The integration requests these scopes:

- **`repo`** - Full control of repositories
- **`user:email`** - Access user email addresses
- **`read:user`** - Read user profile data
- **`write:repo_hook`** - Write repository webhooks
- **`admin:repo_hook`** - Admin access to repository webhooks
- **`workflow`** - Update GitHub Action workflows
- **`actions:write`** - Write GitHub Actions
- **`contents:write`** - Write repository contents
- **`pull_requests:write`** - Create and manage pull requests
- **`issues:write`** - Create and manage issues
- **`project`** - Full control of GitHub Projects v2
- **`read:project`** - Read GitHub Projects v2 data

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - It contains secrets
2. **Use different OAuth Apps** for development and production
3. **Rotate secrets regularly** - Especially if exposed
4. **Monitor token usage** - Check GitHub for unusual activity
5. **Use environment-specific credentials** - Don't share dev/prod credentials

## 🎯 Next Steps After Connection

Once connected, you can:

1. **Create GitHub Projects** from your SDLC documents
2. **Sync Issues** between SDLC.dev and GitHub
3. **Generate Pull Requests** from your documentation
4. **Automate Workflows** using GitHub Actions
5. **Access Repository Data** for analysis and insights

## 📞 Need Help?

- Check the [GitHub Projects Setup Guide](./github-projects-setup-guide.md)
- Review the [Integration Hub Design](./GITHUB_INTEGRATION_HUB_DESIGN.md)
- Check API logs in browser console for detailed error messages

---

**Ready to connect?** Start your server and navigate to Integration Hub! 🚀



