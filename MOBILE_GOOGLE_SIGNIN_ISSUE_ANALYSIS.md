# Mobile Google Sign-In Issue Analysis & Solutions

## Problem Summary
Google sign-in works on desktop but fails on mobile devices, likely related to the user agent tracking implementation introduced for visitor analytics.

## Root Cause Analysis

### 1. User Agent Tracking Implementation
The visitor tracking system captures `navigator.userAgent` on page load:

```javascript
// app/page.tsx (lines 93)
userAgent: navigator.userAgent,
```

This is sent to `/api/track-visit/route.ts` for analytics purposes.

### 2. OAuth Configuration Issues
The current `AuthContext.tsx` implementation has several potential mobile-specific issues:

#### Issue 1: Missing Mobile-Specific OAuth Options
```javascript
// AuthContext.tsx (lines 109-124)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent'
    },
    scopes: 'openid profile email',
    skipBrowserRedirect: false  // This might be problematic on mobile
  }
})
```

#### Issue 2: PKCE Implementation
The current PKCE implementation might not be compatible with mobile browsers:

```javascript
// AuthContext.tsx (lines 8-28)
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return base64URLEncode(digest)
}
```

### 3. Mobile Browser Limitations
Mobile browsers have different behavior for:
- Window redirects
- Popup handling
- Session storage
- Cookie handling

## Identified Solutions

### Solution 1: Mobile-Specific OAuth Configuration

Update `AuthContext.tsx` to detect mobile and adjust OAuth options:

```javascript
const handleGoogleSignIn = async () => {
  try {
    setLoading(true)
    
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    // Generate a random code verifier
    const codeVerifier = generateRandomString(64)
    
    // Generate code challenge
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    
    // Store the code verifier in session storage for the callback
    sessionStorage.setItem('pkce_code_verifier', codeVerifier)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        },
        scopes: 'openid profile email https://www.googleapis.com/auth/userinfo.email',
        skipBrowserRedirect: isMobile ? true : false  // Skip redirect on mobile
      }
    })

    if (error) throw error
    
    // Handle mobile redirect manually
    if (isMobile && data.url) {
      window.location.href = data.url
    }
    
    return data
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  } finally {
    setLoading(false)
  }
}
```

### Solution 2: Enhanced Mobile Detection Hook

Update `hooks/use-mobile.tsx` to provide more comprehensive mobile detection:

```javascript
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      const screenWidth = window.innerWidth < MOBILE_BREAKPOINT
      const userAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      return screenWidth || userAgent
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(checkMobile())
    }
    
    mql.addEventListener("change", onChange)
    setIsMobile(checkMobile())
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function isMobileUserAgent(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}
```

### Solution 3: Improved Auth Callback Handler

Update `app/auth/callback/route.ts` to handle mobile-specific issues:

```javascript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard';
  
  // Get user agent from request headers
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(
      `${requestUrl.origin}/signin?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(
      `${requestUrl.origin}/signin?error=${encodeURIComponent('no_code')}`
    );
  }

  try {
    const supabase = await createClient();

    // Exchange the code for a session
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.redirect(
        `${requestUrl.origin}/signin?error=${encodeURIComponent(authError.message)}`
      );
    }

    // For mobile devices, add a small delay to ensure session is properly set
    if (isMobile) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Redirect to the intended destination
    return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);

  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(
      `${requestUrl.origin}/signin?error=${encodeURIComponent('authentication_failed')}`
    );
  }
}
```

### Solution 4: User Agent Tracking Optimization

Update the visitor tracking to avoid interfering with authentication:

```javascript
// app/page.tsx - Modify the tracking call
const trackVisit = async () => {
  try {
    // Don't track during authentication flows
    if (window.location.pathname.includes('/auth/') || 
        window.location.search.includes('code=') ||
        window.location.search.includes('error=')) {
      return;
    }

    await fetch('/api/track-visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: 'landing',
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      })
    })
  } catch (error) {
    console.log('Analytics tracking failed:', error)
  }
}
```

## Testing Recommendations

### 1. Mobile Device Testing
- Test on actual mobile devices (iOS Safari, Android Chrome)
- Use browser developer tools mobile emulation
- Test with different screen sizes and orientations

### 2. OAuth Flow Testing
- Test the complete OAuth flow on mobile
- Verify session persistence after redirect
- Test with different mobile browsers

### 3. User Agent Scenarios
- Test with various mobile user agents
- Verify tracking doesn't interfere with authentication
- Test with user agent spoofing

## Implementation Priority

1. **High Priority**: Update AuthContext with mobile detection and skipBrowserRedirect logic
2. **Medium Priority**: Enhance mobile detection hook
3. **Medium Priority**: Improve auth callback handler
4. **Low Priority**: Optimize user agent tracking

## Monitoring & Debugging

Add mobile-specific logging to track OAuth flow:

```javascript
// Add to AuthContext.tsx
const handleGoogleSignIn = async () => {
  try {
    setLoading(true)
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    console.log('Google OAuth initiated:', {
      isMobile,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
    
    // ... rest of the implementation
  } catch (error) {
    console.error('Google OAuth error:', {
      error: error.message,
      isMobile,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
    throw error
  }
}
```

## Expected Outcome

After implementing these solutions:
- Google sign-in should work consistently on mobile devices
- OAuth flow should handle mobile browser limitations
- User agent tracking should not interfere with authentication
- Better error handling and debugging for mobile-specific issues

## Next Steps

1. Implement Solution 1 (mobile-specific OAuth configuration)
2. Test on various mobile devices
3. Monitor authentication success rates
4. Implement additional solutions as needed
5. Update documentation with mobile-specific considerations