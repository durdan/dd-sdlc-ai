-- Insert Sample Data for AI Code Automation Testing
-- This script safely inserts sample data using actual user IDs and provider UUIDs from your database

-- First, let's get the actual user IDs from auth.users table and provider UUIDs
-- and create variables for testing
DO $$
DECLARE
    test_user_1 UUID;
    test_user_2 UUID;
    openai_provider_id UUID;
    claude_provider_id UUID;
BEGIN
    -- Get first two user IDs from auth.users table
    SELECT id INTO test_user_1 FROM auth.users LIMIT 1;
    SELECT id INTO test_user_2 FROM auth.users OFFSET 1 LIMIT 1;
    
    -- Get provider IDs by name
    SELECT id INTO openai_provider_id FROM sdlc_ai_providers WHERE name = 'OpenAI GPT-4' LIMIT 1;
    SELECT id INTO claude_provider_id FROM sdlc_ai_providers WHERE name = 'Anthropic Claude' LIMIT 1;
    
    -- If no users exist, create placeholder for testing
    IF test_user_1 IS NULL THEN
        test_user_1 := gen_random_uuid();
        test_user_2 := gen_random_uuid();
        
        RAISE NOTICE 'No existing users found. Using test UUIDs: % and %', test_user_1, test_user_2;
    ELSE
        RAISE NOTICE 'Using existing user IDs: % and %', test_user_1, test_user_2;
    END IF;
    
    -- If no providers exist, we need to insert them first or use test UUIDs
    IF openai_provider_id IS NULL THEN
        openai_provider_id := gen_random_uuid();
        claude_provider_id := gen_random_uuid();
        
        -- Insert test providers if they don't exist
        INSERT INTO sdlc_ai_providers (id, name, type, capabilities, cost_model) VALUES 
        (openai_provider_id, 'OpenAI GPT-4', 'openai', 
         '{"code_generation": true, "bug_fixing": true, "test_generation": true, "max_tokens": 8192}',
         '{"input_cost_per_1k_tokens": 0.03, "output_cost_per_1k_tokens": 0.06}'),
        (claude_provider_id, 'Anthropic Claude', 'anthropic', 
         '{"code_generation": true, "bug_fixing": true, "code_review": true, "max_tokens": 100000}',
         '{"input_cost_per_1k_tokens": 0.025, "output_cost_per_1k_tokens": 0.125}')
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Created test provider UUIDs: % and %', openai_provider_id, claude_provider_id;
    ELSE
        RAISE NOTICE 'Using existing provider IDs: % and %', openai_provider_id, claude_provider_id;
    END IF;
    
    -- Create temp table with all our variables
    CREATE TEMP TABLE test_data AS 
    SELECT 
        test_user_1 as user_id_1, 
        test_user_2 as user_id_2,
        openai_provider_id as openai_id,
        claude_provider_id as claude_id;
END $$;

-- Insert sample user AI configurations
INSERT INTO sdlc_user_ai_configurations (user_id, provider_id, encrypted_api_key, key_id, is_active, created_at, updated_at)
SELECT 
    user_id_1, openai_id, 'encrypted_test_openai_key_123', 'kms-key-openai-001', true, NOW(), NOW()
FROM test_data
ON CONFLICT DO NOTHING;

INSERT INTO sdlc_user_ai_configurations (user_id, provider_id, encrypted_api_key, key_id, is_active, created_at, updated_at)
SELECT 
    user_id_2, openai_id, 'encrypted_test_openai_key_789', 'kms-key-openai-002', true, NOW(), NOW()
FROM test_data
ON CONFLICT DO NOTHING;

INSERT INTO sdlc_user_ai_configurations (user_id, provider_id, encrypted_api_key, key_id, is_active, created_at, updated_at)
SELECT 
    user_id_1, claude_id, 'encrypted_test_claude_key_456', 'kms-key-claude-001', false, NOW(), NOW()
FROM test_data
ON CONFLICT DO NOTHING;

-- Insert sample GitHub integrations
INSERT INTO sdlc_github_integrations (user_id, repository_url, repository_id, webhook_id, permissions, is_active, created_at)
SELECT 
    user_id_1, 'https://github.com/testuser/sample-app', 'testuser/sample-app', '12345', 
    '{"issues": "write", "pull_requests": "write", "contents": "write"}'::jsonb, true, NOW()
FROM test_data
ON CONFLICT DO NOTHING;

INSERT INTO sdlc_github_integrations (user_id, repository_url, repository_id, webhook_id, permissions, is_active, created_at)
SELECT 
    user_id_1, 'https://github.com/testuser/api-service', 'testuser/api-service', '12346', 
    '{"issues": "write", "pull_requests": "write", "contents": "write"}'::jsonb, true, NOW()
FROM test_data
ON CONFLICT DO NOTHING;

-- Insert sample AI tasks
INSERT INTO sdlc_ai_tasks (user_id, type, status, priority, context, provider_used, created_at)
SELECT 
    td.user_id_1, 'bug-fix', 'pending', 'high',
    '{"description": "Users are unable to login when password contains special characters. Need to update regex validation in auth service.", "github_issue_url": "https://github.com/testuser/sample-app/issues/123", "repository_url": "https://github.com/testuser/sample-app"}'::jsonb,
    'openai', NOW()
FROM test_data td
ON CONFLICT DO NOTHING;

INSERT INTO sdlc_ai_tasks (user_id, type, status, priority, context, provider_used, created_at)
SELECT 
    td.user_id_1, 'feature', 'in-progress', 'medium',
    '{"description": "Allow users to export their profile data in JSON and CSV formats for GDPR compliance.", "github_issue_url": "https://github.com/testuser/sample-app/issues/89", "repository_url": "https://github.com/testuser/sample-app"}'::jsonb,
    'openai', NOW()
FROM test_data td
ON CONFLICT DO NOTHING;

INSERT INTO sdlc_ai_tasks (user_id, type, status, priority, context, provider_used, created_at, completed_at)
SELECT 
    td.user_id_2, 'bug-fix', 'completed', 'medium',
    '{"description": "The sidebar navigation overlaps content on mobile devices. Need responsive design fixes.", "github_issue_url": "https://github.com/testuser/web-app/issues/67", "repository_url": "https://github.com/testuser/web-app"}'::jsonb,
    'openai', NOW() - INTERVAL '2 days', NOW()
FROM test_data td
ON CONFLICT DO NOTHING;

-- Insert sample usage logs for analytics testing
INSERT INTO sdlc_provider_usage_logs (user_id, provider_id, task_id, request_type, tokens_used, cost, response_time_ms, success, created_at)
SELECT 
    td.user_id_1, p.id, at.id, 'code_generation', 15420, 0.45, 2340, true, NOW() - INTERVAL '1 hour'
FROM test_data td
JOIN sdlc_ai_tasks at ON at.user_id = td.user_id_1 AND at.type = 'bug-fix'
JOIN sdlc_ai_providers p ON p.name = 'OpenAI GPT-4'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO sdlc_provider_usage_logs (user_id, provider_id, task_id, request_type, tokens_used, cost, response_time_ms, success, created_at)
SELECT 
    td.user_id_1, p.id, at.id, 'feature_analysis', 12340, 0.38, 2100, true, NOW() - INTERVAL '2 hours'
FROM test_data td
JOIN sdlc_ai_tasks at ON at.user_id = td.user_id_1 AND at.type = 'feature'
JOIN sdlc_ai_providers p ON p.name = 'OpenAI GPT-4'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Create some automation rules
INSERT INTO sdlc_automation_rules (user_id, github_integration_id, name, trigger_conditions, actions, is_active, created_at, updated_at)
SELECT 
    td.user_id_1, gi.id,
    'Auto-fix simple bugs',
    '{"labels": ["bug", "good-first-issue"], "priority": ["low", "medium"]}'::jsonb,
    '{"auto_assign": true, "create_pr": true, "run_tests": true}'::jsonb,
    true, NOW() - INTERVAL '7 days', NOW()
FROM test_data td
JOIN sdlc_github_integrations gi ON gi.user_id = td.user_id_1
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add security audit logs
INSERT INTO sdlc_security_audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, success, created_at)
SELECT 
    user_id_1, 'task_created', 'ai_task', gen_random_uuid(), '192.168.1.100'::inet, 
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', true, NOW() - INTERVAL '1 hour'
FROM test_data
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT 
    'Sample data insertion completed!' as status,
    (SELECT COUNT(*) FROM sdlc_ai_tasks) as ai_tasks_count,
    (SELECT COUNT(*) FROM sdlc_user_ai_configurations) as user_configs_count,
    (SELECT COUNT(*) FROM sdlc_github_integrations) as github_integrations_count,
    (SELECT COUNT(*) FROM sdlc_provider_usage_logs) as usage_logs_count,
    (SELECT COUNT(*) FROM sdlc_automation_rules) as automation_rules_count,
    (SELECT COUNT(*) FROM sdlc_ai_providers) as ai_providers_count; 