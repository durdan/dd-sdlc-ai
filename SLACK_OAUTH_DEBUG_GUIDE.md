# 🔍 Slack OAuth Debug Guide

## Issue: OAuth Redirect Works But Integration Doesn't Show as Connected

If you get redirected to `http://localhost:3000/dashboard?slack_success=true` but Slack still shows as "Not Connected", here's how to debug:

## 🏥 **Step 1: Check Console Logs**

### **In Browser Console (F12)**
Look for these logs:
```javascript
✅ Slack config loaded from database: Connected  // ← Should see this
❌ Error loading Slack config from database: [error]  // ← Or this error
```

### **In Server Console (Terminal)**
Look for these logs during OAuth callback:
```
✅ Token exchange successful: { team: 'Your Workspace', bot_user_id: 'B...' }
✅ Slack integration saved successfully

// OR errors like:
❌ Error updating Slack config: [database error]
❌ Error inserting Slack config: [database error]
```

## 🗄️ **Step 2: Check Database Directly**

### **Option A: Check via Supabase Dashboard**
1. Go to your Supabase dashboard
2. Navigate to **Table Editor** → **user_configurations**
3. Find your user row
4. Check if these columns have values:
   - `slack_workspace_id`
   - `slack_workspace_name` 
   - `slack_access_token`
   - `slack_bot_user_id`

### **Option B: Check via API Endpoint**
Test the Slack integration API directly:

```bash
# In your browser, open Developer Tools (F12) → Console
# Run this command:
fetch('/api/user-integrations/slack', {
  method: 'GET',
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('Slack Config:', data))
```

**Expected Response (Connected):**
```json
{
  "isConnected": true,
  "workspace": {
    "id": "T1234567890",
    "name": "Your Workspace",
    "defaultChannel": "#general"
  }
}
```

**Expected Response (Not Connected):**
```json
{
  "isConnected": false,
  "workspace": null
}
```

## 🔧 **Step 3: Common Issues & Fixes**

### **Issue 1: Database Permission Error**
**Symptoms:** Error logs about database permissions
**Fix:** Check your Supabase RLS policies

```sql
-- Run this in Supabase SQL Editor to check if row exists
SELECT slack_workspace_id, slack_workspace_name, slack_access_token 
FROM user_configurations 
WHERE user_id = 'your-user-id-here';
```

### **Issue 2: Frontend Not Refreshing**
**Symptoms:** Database has data but UI still shows "Not Connected"
**Fix:** Force refresh the Slack config

```javascript
// In browser console, run this to force refresh:
window.location.reload()

// Or trigger the reload function manually:
loadSlackConfigFromDatabase()
```

### **Issue 3: OAuth Callback Failing Silently**
**Symptoms:** Redirect happens but no success/error logs
**Fix:** Check the complete OAuth callback logs

Add this to your `.env.local` for more debugging:
```bash
NODE_ENV=development
DEBUG=true
```

### **Issue 4: User Not Authenticated During OAuth**
**Symptoms:** "User not authenticated" errors in OAuth callback
**Fix:** Make sure you're signed in BEFORE starting OAuth

## 🚀 **Step 4: Force Reconnection**

If the integration is partially broken, try disconnecting and reconnecting:

### **Disconnect Slack**
```javascript
// In browser console:
fetch('/api/user-integrations/slack', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ action: 'disconnect' })
})
.then(r => r.json())
.then(data => console.log('Disconnect Result:', data))
```

### **Then Reconnect**
1. Refresh the page
2. Click "Add to Slack" again
3. Complete OAuth flow

## 🧪 **Step 5: Manual Testing**

### **Test Complete Flow**
1. **Sign out** and **sign in** again
2. **Go to Integration Hub**
3. **Check current status** (should be "Not Connected")
4. **Click "Add to Slack"**
5. **Watch browser console** for logs
6. **Complete OAuth in Slack**
7. **Check server console** for success logs
8. **Verify database** has slack_access_token
9. **Refresh page** and check if it shows "Connected"

### **Expected Success Flow Logs**
```
Browser Console:
🔄 Starting Slack OAuth flow...

Server Console:
🔄 Slack OAuth callback started
🔗 Base URL for redirects: http://localhost:3000
✅ User authenticated: user-abc-123
🔄 Using redirect URI: http://localhost:3000/api/slack/oauth/callback
✅ Token exchange successful: { team: 'Your Workspace', bot_user_id: 'B...' }
✅ Slack integration saved successfully

Browser Console (after redirect):
✅ Slack config loaded from database: Connected
```

## 🆘 **If Still Not Working**

### **Quick Fixes to Try**

1. **Clear all browser data** for your app
2. **Restart your development server**
3. **Check your Supabase connection**
4. **Verify all environment variables are set**
5. **Try in incognito mode**

### **Environment Variables Check**
```bash
echo "NEXT_PUBLIC_APP_URL: $NEXT_PUBLIC_APP_URL"
echo "SLACK_CLIENT_ID: $SLACK_CLIENT_ID"
echo "SLACK_CLIENT_SECRET: $SLACK_CLIENT_SECRET"
echo "SLACK_REDIRECT_URI: $SLACK_REDIRECT_URI"
echo "NEXT_PUBLIC_SLACK_CLIENT_ID: $NEXT_PUBLIC_SLACK_CLIENT_ID"
echo "NEXT_PUBLIC_SLACK_REDIRECT_URI: $NEXT_PUBLIC_SLACK_REDIRECT_URI"
```

### **Database Connection Test**
```javascript
// Test if you can access your database:
fetch('/api/auth/github/config', { credentials: 'include' })
.then(r => r.json())
.then(data => console.log('Database works:', data))
```

## 📋 **Report Results**

After running these debug steps, you should have:
1. ✅ Console logs showing what happened
2. ✅ Database check results 
3. ✅ API endpoint response
4. ✅ Clear error messages (if any)

Share these results to get more specific help! 