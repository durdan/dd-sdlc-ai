import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard';
  
  // Get user agent for debugging
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // Log for debugging mobile issues
  console.log('🔍 Auth callback received:', {
    code: code ? 'present' : 'missing',
    error,
    error_description,
    redirectTo,
    isMobile,
    userAgent: userAgent.substring(0, 100) // Log first 100 chars of user agent
  });

  if (error) {
    console.error('❌ OAuth error:', error, error_description);
    // For mobile, might need to use simple landing page instead of signin
    const errorRedirect = isMobile ? '/' : '/signin';
    return NextResponse.redirect(
      `${requestUrl.origin}${errorRedirect}?error=${encodeURIComponent(error_description || error)}`
    );
  }

  if (!code) {
    console.error('❌ No authorization code received');
    const errorRedirect = isMobile ? '/' : '/signin';
    return NextResponse.redirect(
      `${requestUrl.origin}${errorRedirect}?error=${encodeURIComponent('no_code')}`
    );
  }

  try {
    // Initialize Supabase SSR client
    const supabase = await createClient();

    // Exchange the code for a session (sets cookie on response)
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (authError) {
      console.error('❌ Auth exchange error:', authError);
      const errorRedirect = isMobile ? '/' : '/signin';
      return NextResponse.redirect(
        `${requestUrl.origin}${errorRedirect}?error=${encodeURIComponent(authError.message)}`
      );
    }

    console.log('✅ Auth successful, redirecting to:', redirectTo);
    console.log('📱 Is Mobile:', isMobile);

    // For mobile, sometimes dashboard redirect fails, so let's be more explicit
    const finalRedirect = isMobile && redirectTo === '/dashboard' 
      ? `${requestUrl.origin}/dashboard` 
      : `${requestUrl.origin}${redirectTo}`;

    // Create response with proper redirect
    const response = NextResponse.redirect(finalRedirect);
    
    // Add cache control headers for mobile browsers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (err) {
    console.error('❌ Callback error:', err);
    const errorRedirect = isMobile ? '/' : '/signin';
    return NextResponse.redirect(
      `${requestUrl.origin}${errorRedirect}?error=${encodeURIComponent('authentication_failed')}`
    );
  }
} 