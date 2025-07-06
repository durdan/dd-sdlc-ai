import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard';

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/signin?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${requestUrl.origin}/signin?error=${encodeURIComponent('no_code')}`
    );
  }

  try {
    // Initialize Supabase SSR client
    const supabase = await createClient();

    // Exchange the code for a session (sets cookie on response)
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.redirect(
        `${requestUrl.origin}/signin?error=${encodeURIComponent(authError.message)}`
      );
    }

    // Just return the redirect, cookies are already set
    return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);

  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(
      `${requestUrl.origin}/signin?error=${encodeURIComponent('authentication_failed')}`
    );
  }
} 