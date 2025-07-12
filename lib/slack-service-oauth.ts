// Updated Slack Service for OAuth integration
// Replace imports and functions in lib/slack-service.ts

import { createClient } from './supabase/server';

/**
 * Get user's Slack configuration using OAuth integration
 */
export async function getUserSlackConfig(userId: string): Promise<any> {
  try {
    const supabase = await createClient();
    
    // Use database function to get Slack config
    const { data: slackConfig, error } = await supabase.rpc('get_user_slack_config', {
      user_uuid: userId
    });

    if (error || !slackConfig || slackConfig.length === 0) {
      console.log('❌ No Slack configuration found for user:', userId);
      return null;
    }

    const config = slackConfig[0];
    
    if (!config.is_connected) {
      console.log('❌ Slack not connected for user:', userId);
      return null;
    }

    return {
      botToken: config.access_token,
      workspaceId: config.workspace_id,
      workspaceName: config.workspace_name,
      botUserId: config.bot_user_id,
      defaultChannel: config.default_channel || '#general'
    };
    
  } catch (error) {
    console.error('❌ Error getting user Slack config:', error);
    return null;
  }
}

/**
 * Get user ID by Slack user ID (for command handling)
 */
export async function getUserIdBySlackUser(slackUserId: string, teamId: string): Promise<string | null> {
  try {
    const supabase = await createClient();
    
    // Find user by workspace and installing user
    const { data: integrations, error } = await supabase
      .from('user_integrations')
      .select('user_id, config')
      .eq('integration_type', 'slack')
      .eq('is_active', true);
    
    if (error || !integrations) {
      console.log('❌ No Slack integrations found');
      return null;
    }
    
    // Find matching workspace and user
    for (const integration of integrations) {
      const config = integration.config;
      if (config.workspace_id === teamId && 
          (config.installing_user_id === slackUserId || config.bot_user_id === slackUserId)) {
        return integration.user_id;
      }
    }
    
    console.log('❌ No matching user found for Slack user:', slackUserId, 'in team:', teamId);
    return null;
    
  } catch (error) {
    console.error('❌ Error finding user by Slack ID:', error);
    return null;
  }
}

/**
 * Test Slack connection
 */
export async function testSlackConnection(userId: string): Promise<boolean> {
  try {
    const config = await getUserSlackConfig(userId);
    if (!config) return false;
    
    const response = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.botToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const data = await response.json();
    return data.ok;
    
  } catch (error) {
    console.error('❌ Slack connection test failed:', error);
    return false;
  }
}

// Export the updated SlackService class methods that need updating:

// Update SlackService.getUserIdBySlackUser method:
/*
private static async getUserIdBySlackUser(slackUserId: string, teamId: string): Promise<string | null> {
  return await getUserIdBySlackUser(slackUserId, teamId);
}
*/

// Update SlackService.sendNotification method:
/*
static async sendNotification(
  userId: string,
  channelId: string,
  message: string,
  blocks?: any[]
): Promise<void> {
  try {
    const config = await getUserSlackConfig(userId);
    if (!config) {
      console.log('❌ No Slack config found for user:', userId);
      return;
    }

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: channelId,
        text: message,
        blocks: blocks || undefined
      })
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error('❌ Slack notification failed:', data.error);
    } else {
      console.log('✅ Slack notification sent successfully');
    }
    
  } catch (error) {
    console.error('❌ Error sending Slack notification:', error);
  }
}
*/
