-- =====================================================
-- SLACK PROVIDER INTEGRATION (USING EXISTING SYSTEM)
-- =====================================================
-- File: 20241218_slack_provider_integration.sql
-- Purpose: Add Slack as a provider in existing architecture

-- =====================================================
-- 1. UPDATE PROVIDER TYPES TO INCLUDE SLACK
-- =====================================================

-- Drop the existing CHECK constraint
ALTER TABLE sdlc_ai_providers 
DROP CONSTRAINT IF EXISTS sdlc_ai_providers_type_check;

-- Add the new constraint with 'slack' type
ALTER TABLE sdlc_ai_providers 
ADD CONSTRAINT sdlc_ai_providers_type_check 
CHECK (type IN ('openai', 'anthropic', 'github-copilot', 'slack', 'custom'));

-- =====================================================
-- 2. ADD SLACK PROVIDER ENTRY
-- =====================================================

-- Insert Slack as a provider
INSERT INTO sdlc_ai_providers (name, type, capabilities, cost_model, is_active) 
VALUES (
  'Slack Workspace', 
  'slack',
  '{
    "slash_commands": true,
    "interactive_messages": true, 
    "real_time_notifications": true,
    "task_management": true,
    "workspace_integration": true,
    "oauth_scopes": ["chat:write", "commands", "channels:read", "users:read"]
  }'::jsonb,
  '{
    "cost_type": "free",
    "rate_limits": {
      "messages_per_minute": 100,
      "commands_per_minute": 20
    }
  }'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 3. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get user's Slack configuration
CREATE OR REPLACE FUNCTION get_user_slack_config(user_uuid UUID)
RETURNS TABLE (
  workspace_id VARCHAR(50),
  workspace_name VARCHAR(255),
  access_token TEXT,
  bot_user_id VARCHAR(50),
  default_channel VARCHAR(255),
  is_connected BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (config->>'workspace_id')::VARCHAR(50),
    (config->>'workspace_name')::VARCHAR(255),
    (config->>'access_token')::TEXT,
    (config->>'bot_user_id')::VARCHAR(50),
    COALESCE((config->>'default_channel')::VARCHAR(255), '#general'),
    ui.is_active
  FROM user_integrations ui
  WHERE ui.user_id = user_uuid 
    AND ui.integration_type = 'slack'
    AND ui.is_active = true;
END;
$$;

-- Function to save Slack OAuth data
CREATE OR REPLACE FUNCTION save_slack_oauth_config(
  user_uuid UUID,
  workspace_id_param VARCHAR(50),
  workspace_name_param VARCHAR(255),
  access_token_param TEXT,
  bot_user_id_param VARCHAR(50),
  installing_user_id_param VARCHAR(50),
  scopes_param TEXT[],
  default_channel_param VARCHAR(255) DEFAULT '#general'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  slack_config JSONB;
BEGIN
  -- Build config JSON
  slack_config := jsonb_build_object(
    'workspace_id', workspace_id_param,
    'workspace_name', workspace_name_param,
    'access_token', access_token_param,
    'bot_user_id', bot_user_id_param,
    'installing_user_id', installing_user_id_param,
    'scopes', scopes_param,
    'default_channel', default_channel_param,
    'connected_at', now(),
    'oauth_type', 'centralized'
  );

  -- Insert or update user integration
  INSERT INTO user_integrations (
    user_id, 
    integration_type, 
    config, 
    is_active,
    updated_at
  ) VALUES (
    user_uuid,
    'slack',
    slack_config,
    true,
    now()
  )
  ON CONFLICT (user_id, integration_type, is_active) 
  DO UPDATE SET 
    config = slack_config,
    updated_at = now();

  RETURN true;
END;
$$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Slack Provider Integration Migration Completed Successfully';
    RAISE NOTICE 'Slack added to existing sdlc_ai_providers table';
    RAISE NOTICE 'OAuth data will be stored in existing user_integrations table';
    RAISE NOTICE 'Helper functions created: get_user_slack_config, save_slack_oauth_config';
END $$;
