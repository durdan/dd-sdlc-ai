import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: userError?.message 
      }, { status: 401 });
    }

    // Get all user configuration data
    const { data: config, error: configError } = await supabase
      .from('user_configurations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get table schema info
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_configurations')
      .select('*')
      .limit(1);

    return NextResponse.json({
      debug: 'Slack Integration Debug Information',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        authenticated: true
      },
      database: {
        configExists: !!config,
        configError: configError?.message || null,
        tableAccessible: !tableError,
        tableError: tableError?.message || null
      },
      slackData: config ? {
        hasWorkspaceId: !!config.slack_workspace_id,
        hasWorkspaceName: !!config.slack_workspace_name,
        hasAccessToken: !!config.slack_access_token,
        hasBotUserId: !!config.slack_bot_user_id,
        workspaceId: config.slack_workspace_id || 'NOT_SET',
        workspaceName: config.slack_workspace_name || 'NOT_SET',
        defaultChannel: config.slack_default_channel || 'NOT_SET',
        updatedAt: config.updated_at || 'NOT_SET'
      } : {
        noConfigFound: true,
        message: 'No user_configurations row found for this user'
      },
      integration: {
        isConnected: !!(config && config.slack_access_token),
        status: config && config.slack_access_token ? 'CONNECTED' : 'NOT_CONNECTED'
      },
      apiEndpoints: {
        slackIntegration: '/api/user-integrations/slack',
        oauthCallback: '/api/slack/oauth/callback',
        debug: '/api/slack/debug'
      },
      environment: {
        hasClientId: !!process.env.SLACK_CLIENT_ID,
        hasClientSecret: !!process.env.SLACK_CLIENT_SECRET,
        hasRedirectUri: !!process.env.SLACK_REDIRECT_URI,
        hasPublicClientId: !!process.env.NEXT_PUBLIC_SLACK_CLIENT_ID,
        hasPublicRedirectUri: !!process.env.NEXT_PUBLIC_SLACK_REDIRECT_URI,
        nodeEnv: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('Error in Slack debug API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 