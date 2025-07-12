import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Slack configuration from user_configurations table
    const { data: config, error: configError } = await supabase
      .from('user_configurations')
      .select('slack_workspace_id, slack_workspace_name, slack_access_token, slack_bot_user_id, slack_default_channel')
      .eq('user_id', user.id)
      .single();

    if (configError && configError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching Slack config:', configError);
      return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 });
    }

    const hasSlackIntegration = config && config.slack_access_token;

    return NextResponse.json({
      isConnected: hasSlackIntegration,
      workspace: hasSlackIntegration ? {
        id: config.slack_workspace_id,
        name: config.slack_workspace_name,
        defaultChannel: config.slack_default_channel || '#general'
      } : null
    });

  } catch (error) {
    console.error('Error in Slack integration API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'disconnect') {
      // Remove Slack configuration
      const { error: updateError } = await supabase
        .from('user_configurations')
        .update({
          slack_workspace_id: null,
          slack_workspace_name: null,
          slack_access_token: null,
          slack_bot_user_id: null,
          slack_default_channel: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error disconnecting Slack:', updateError);
        return NextResponse.json({ error: 'Failed to disconnect Slack' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Slack disconnected successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in Slack integration API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
 