import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Slack OAuth callback started');
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Get the base URL for redirects with better fallback handling
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    if (!baseUrl || baseUrl === 'undefined') {
      if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        // Extract from the request URL as final fallback
        const url = new URL(request.url);
        baseUrl = `${url.protocol}//${url.host}`;
      }
    }

    console.log('🔗 Base URL for redirects:', baseUrl);

    if (error) {
      console.error('❌ OAuth error:', error);
      return NextResponse.redirect(`${baseUrl}/dashboard?slack_error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      console.error('❌ No authorization code received');
      return NextResponse.redirect(`${baseUrl}/dashboard?slack_error=no_code`);
    }

    if (!state) {
      console.error('❌ No state parameter received');
      return NextResponse.redirect(`${baseUrl}/dashboard?slack_error=no_state`);
    }

    // Extract user ID from state parameter
    const userId = state.split('_').pop();
    
    if (!userId) {
      console.error('❌ Invalid state parameter - no user ID');
      return NextResponse.redirect(`${baseUrl}/dashboard?slack_error=invalid_state`);
    }

    console.log('✅ User ID from state:', userId);

    // Exchange code for access token
    const redirectUri = process.env.SLACK_REDIRECT_URI || `${baseUrl}/api/slack/oauth/callback`;
    console.log('🔄 Using redirect URI:', redirectUri);
    
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    
    console.log('🔍 Environment check:', {
      clientId: clientId ? `${clientId.substring(0, 10)}...` : 'NOT SET',
      clientSecret: clientSecret ? 'SET' : 'NOT SET',
      redirectUri
    });
    
    if (!clientId || !clientSecret) {
      console.error('❌ Missing Slack credentials');
      return NextResponse.redirect(`${baseUrl}/dashboard?slack_error=missing_credentials`);
    }
    
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.ok) {
      console.error('❌ Token exchange failed:', tokenData.error);
      return NextResponse.redirect(`${baseUrl}/dashboard?slack_error=${encodeURIComponent(tokenData.error)}`);
    }

    console.log('✅ Token exchange successful:', {
      team: tokenData.team?.name,
      bot_user_id: tokenData.bot_user_id
    });

    // Save to database using admin client to bypass RLS
    const adminClient = createAdminClient();
    
    const { data: existingConfig, error: fetchError } = await adminClient
      .from('user_configurations')
      .select('*')
      .eq('user_id', userId)
      .single();

    const slackConfig = {
      slack_workspace_id: tokenData.team.id,
      slack_workspace_name: tokenData.team.name,
      slack_access_token: tokenData.access_token,
      slack_bot_user_id: tokenData.bot_user_id,
      slack_default_channel: '#general',
      updated_at: new Date().toISOString()
    };

    if (existingConfig) {
      // Update existing configuration
      const { error: updateError } = await adminClient
        .from('user_configurations')
        .update(slackConfig)
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Error updating Slack config:', updateError);
        return NextResponse.redirect(`${baseUrl}/dashboard?slack_error=save_failed`);
      }
    } else {
      // Create new configuration
      const { error: insertError } = await adminClient
        .from('user_configurations')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          created_at: new Date().toISOString(),
          ...slackConfig
        });

      if (insertError) {
        console.error('❌ Error inserting Slack config:', insertError);
        return NextResponse.redirect(`${baseUrl}/dashboard?slack_error=save_failed`);
      }
    }

    console.log('✅ Slack integration saved successfully');

    // Redirect back to dashboard with success
    return NextResponse.redirect(`${baseUrl}/dashboard?slack_success=true`);

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    
    // Get base URL for error redirect with better fallback
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    if (!baseUrl || baseUrl === 'undefined') {
      if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        const url = new URL(request.url);
        baseUrl = `${url.protocol}//${url.host}`;
      }
    }
    
    return NextResponse.redirect(`${baseUrl}/dashboard?slack_error=callback_failed`);
  }
}
