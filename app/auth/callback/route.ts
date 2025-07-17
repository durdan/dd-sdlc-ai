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

  console.log('Auth callback received:', {
    hasCode: !!code,
    hasError: !!error,
    isMobile,
    userAgent: userAgent.substring(0, 100) + '...' // Truncate for logging
  });

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
    // Initialize Supabase SSR client
    const supabase = await createClient();

    // Exchange the code for a session (sets cookie on response)
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

    console.log('Auth callback successful:', {
      isMobile,
      redirectTo,
      hasSession: !!data?.session
    });

    // Just return the redirect, cookies are already set
    return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);

  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(
      `${requestUrl.origin}/signin?error=${encodeURIComponent('authentication_failed')}`
    );
  }
} 