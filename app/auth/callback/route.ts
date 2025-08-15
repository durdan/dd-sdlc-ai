import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard';

  // Log for debugging mobile issues
  console.log('🔍 Auth callback received:', {
    code: code ? 'present' : 'missing',
    error,
    error_description,
    redirectTo,
    userAgent: request.headers.get('user-agent')
  });

  if (error) {
    console.error('❌ OAuth error:', error, error_description);
    return NextResponse.redirect(
      `${requestUrl.origin}/signin?error=${encodeURIComponent(error_description || error)}`
    );
  }

  if (!code) {
    console.error('❌ No authorization code received');
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
      console.error('❌ Auth exchange error:', authError);
      return NextResponse.redirect(
        `${requestUrl.origin}/signin?error=${encodeURIComponent(authError.message)}`
      );
    }

    console.log('✅ Auth successful, redirecting to:', redirectTo);

    // Create response with proper redirect
    const response = NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
    
    // Add cache control headers for mobile browsers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (err) {
    console.error('❌ Callback error:', err);
    return NextResponse.redirect(
      `${requestUrl.origin}/signin?error=${encodeURIComponent('authentication_failed')}`
    );
  }
} 