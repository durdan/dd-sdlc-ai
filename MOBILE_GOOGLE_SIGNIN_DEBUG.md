# Mobile Google Sign-In Debugging Guide

## Issue Description
Google sign-in works on desktop and mobile dev tools, but fails on actual mobile devices.

## Potential Causes & Solutions

### 1. **OAuth Redirect URL Configuration**

**Problem**: Mobile browsers handle redirects differently than desktop browsers.

**Check in Supabase Dashboard**:
1. Go to Authentication → URL Configuration
2. Verify these URLs are added:
   ```
   https://yourdomain.com/auth/callback
   https://yourdomain.com/auth/callback?redirectTo=/dashboard
   http://localhost:3000/auth/callback (for development)
   http://localhost:3000/auth/callback?redirectTo=/dashboard
   ```

### 2. **Google OAuth Provider Configuration**

**Check in Supabase Dashboard**:
1. Go to Authentication → Providers → Google
2. Verify these settings:
   - **Enabled**: ✅ Yes
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret
   - **Redirect URL**: `https://your-project.supabase.co/auth/v1/callback`

**Check in Google Cloud Console**:
1. Go to APIs & Services → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add these Authorized redirect URIs:
   ```
   https://your-project.supabase.co/auth/v1/callback
   https://yourdomain.com/auth/callback
   http://localhost:3000/auth/callback (for development)
   ```

### 3. **Mobile Browser Security Issues**

**Common Mobile Issues**:
- Popup blockers
- Third-party cookie restrictions
- HTTPS/HTTP protocol mismatches
- User agent detection issues

**Solutions Implemented**:
- Added mobile device detection
- Enhanced error handling
- Better redirect URL encoding
- Mobile-specific OAuth parameters

### 4. **Environment Variables**

**Check your `.env.local`**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. **Testing Steps**

#### Desktop Testing:
1. Open browser dev tools
2. Toggle device toolbar (mobile view)
3. Try Google sign-in
4. Check console for logs

#### Real Mobile Testing:
1. Deploy to production or use ngrok for local testing
2. Test on actual mobile device
3. Check browser console (if possible)
4. Look for network errors

### 6. **Debug Information Added**

The updated code now logs:
- User agent string
- Mobile device detection
- Current origin
- Redirect URL
- OAuth response data
- Any errors with detailed messages

### 7. **Mobile-Specific Fixes Applied**

1. **Enhanced Error Handling**: Better error messages for mobile-specific issues
2. **Mobile Detection**: Different behavior for mobile vs desktop
3. **Redirect URL Encoding**: Proper URL encoding for mobile browsers
4. **OAuth Parameters**: Added `prompt: 'select_account'` and `access_type: 'offline'`
5. **Modal Behavior**: Don't close modal immediately on mobile

### 8. **Common Mobile Error Messages**

- **"Popup blocked"**: Allow popups for the site
- **"Redirect failed"**: Check internet connection and try again
- **"Network error"**: Check internet connection
- **"Authentication failed"**: Check Supabase configuration

### 9. **Next Steps for Debugging**

1. **Test the updated code** with enhanced logging
2. **Check browser console** on mobile device
3. **Verify Supabase configuration** in dashboard
4. **Check Google OAuth settings** in Google Cloud Console
5. **Test with different mobile browsers** (Chrome, Safari, Firefox)

### 10. **Alternative Solutions**

If the issue persists:

1. **Use a different OAuth flow** for mobile
2. **Implement deep linking** for mobile apps
3. **Use a different authentication method** for mobile
4. **Contact Supabase support** with detailed logs

## Testing Commands

```bash
# Test environment variables
node test-signup.js

# Start development server
npm run dev

# Test on mobile (use ngrok for local testing)
npx ngrok http 3000
```

## Expected Behavior After Fix

**Desktop**: 
- Click "Continue with Google" → Popup opens → Redirect to dashboard

**Mobile**: 
- Click "Continue with Google" → Redirect to Google OAuth → Redirect back to dashboard
- Enhanced logging in console
- Better error messages if something fails 