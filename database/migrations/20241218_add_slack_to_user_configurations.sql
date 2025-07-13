-- Add Slack integration columns to user_configurations table
-- Migration: 20241218_add_slack_to_user_configurations.sql

-- Add Slack-specific columns to user_configurations
ALTER TABLE user_configurations 
ADD COLUMN IF NOT EXISTS slack_workspace_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS slack_workspace_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS slack_access_token TEXT,
ADD COLUMN IF NOT EXISTS slack_bot_user_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS slack_default_channel VARCHAR(255) DEFAULT '#general';

-- Add index for faster Slack config lookups
CREATE INDEX IF NOT EXISTS idx_user_configurations_slack_workspace 
ON user_configurations(user_id, slack_workspace_id) 
WHERE slack_workspace_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_configurations.slack_workspace_id IS 'Slack workspace/team ID from OAuth';
COMMENT ON COLUMN user_configurations.slack_workspace_name IS 'Human-readable Slack workspace name';
COMMENT ON COLUMN user_configurations.slack_access_token IS 'Slack bot access token for API calls';
COMMENT ON COLUMN user_configurations.slack_bot_user_id IS 'Bot user ID in the Slack workspace';
COMMENT ON COLUMN user_configurations.slack_default_channel IS 'Default channel for notifications (e.g., #general)'; 