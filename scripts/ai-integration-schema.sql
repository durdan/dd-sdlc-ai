-- AI Code Assistant Integration Database Schema
-- Extends existing SDLC platform with AI automation capabilities

-- AI Providers Configuration Table
CREATE TABLE ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('openai', 'anthropic', 'github-copilot', 'custom')),
  capabilities JSONB NOT NULL DEFAULT '{}',
  cost_model JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User AI Configuration (BYOK Implementation)
CREATE TABLE user_ai_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  encrypted_api_key TEXT NOT NULL,
  key_id VARCHAR(100) NOT NULL, -- Reference to external KMS
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_limits JSONB DEFAULT '{"daily_requests": 1000, "monthly_cost": 100}',
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

-- AI Task Management
CREATE TABLE ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bug-fix', 'feature', 'review', 'test-generation', 'refactor')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'failed', 'cancelled')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  context JSONB NOT NULL DEFAULT '{}',
  provider_used VARCHAR(50),
  result JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  error_details TEXT,
  estimated_cost DECIMAL(10,4),
  actual_cost DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- GitHub Integration Management
CREATE TABLE github_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_url VARCHAR(255) NOT NULL,
  repository_id VARCHAR(50) NOT NULL,
  webhook_id VARCHAR(50),
  access_token_encrypted TEXT,
  permissions JSONB DEFAULT '{"issues": "write", "pull_requests": "write", "contents": "write"}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, repository_id)
);

-- Code Generation History
CREATE TABLE code_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES ai_tasks(id) ON DELETE CASCADE,
  github_integration_id UUID REFERENCES github_integrations(id) ON DELETE SET NULL,
  file_path VARCHAR(500) NOT NULL,
  original_content TEXT,
  generated_content TEXT NOT NULL,
  diff_content TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'applied', 'failed', 'reverted')),
  confidence_score DECIMAL(3,2),
  review_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_at TIMESTAMP WITH TIME ZONE
);

-- Task Execution Logs
CREATE TABLE task_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES ai_tasks(id) ON DELETE CASCADE,
  step_name VARCHAR(100) NOT NULL,
  step_order INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Pull Request Management
CREATE TABLE pull_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES ai_tasks(id) ON DELETE CASCADE,
  github_integration_id UUID NOT NULL REFERENCES github_integrations(id) ON DELETE CASCADE,
  pr_number INTEGER NOT NULL,
  pr_url VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  branch_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'merged', 'closed', 'draft')),
  files_changed INTEGER DEFAULT 0,
  lines_added INTEGER DEFAULT 0,
  lines_deleted INTEGER DEFAULT 0,
  review_status VARCHAR(20) DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'changes_requested', 'dismissed')),
  merged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Key Rotation Logs
CREATE TABLE api_key_rotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_ai_config_id UUID NOT NULL REFERENCES user_ai_configurations(id) ON DELETE CASCADE,
  old_key_id VARCHAR(100),
  new_key_id VARCHAR(100) NOT NULL,
  rotation_reason VARCHAR(100),
  rotated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider Usage Analytics
CREATE TABLE provider_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  task_id UUID REFERENCES ai_tasks(id) ON DELETE SET NULL,
  request_type VARCHAR(50) NOT NULL,
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  response_time_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_code VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Audit Logs
CREATE TABLE security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Dependencies (for complex workflows)
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_task_id UUID NOT NULL REFERENCES ai_tasks(id) ON DELETE CASCADE,
  dependent_task_id UUID NOT NULL REFERENCES ai_tasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) NOT NULL DEFAULT 'blocks',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_task_id, dependent_task_id),
  CHECK (parent_task_id != dependent_task_id)
);

-- Automation Rules Configuration
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_integration_id UUID REFERENCES github_integrations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Code Review Feedback
CREATE TABLE code_review_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pull_request_id UUID NOT NULL REFERENCES pull_requests(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('approval', 'changes_requested', 'comment')),
  comment TEXT,
  file_path VARCHAR(500),
  line_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default AI providers
INSERT INTO ai_providers (name, type, capabilities, cost_model) VALUES 
('OpenAI GPT-4', 'openai', 
 '{"code_generation": true, "bug_fixing": true, "test_generation": true, "max_tokens": 8192}',
 '{"input_cost_per_1k_tokens": 0.03, "output_cost_per_1k_tokens": 0.06}'),
('Anthropic Claude', 'anthropic', 
 '{"code_generation": true, "bug_fixing": true, "code_review": true, "max_tokens": 100000}',
 '{"input_cost_per_1k_tokens": 0.025, "output_cost_per_1k_tokens": 0.125}'),
('GitHub Copilot', 'github-copilot', 
 '{"code_completion": true, "code_generation": true, "chat": true}',
 '{"monthly_subscription": 10, "per_user": true}');

-- Create indexes for better performance
CREATE INDEX idx_ai_tasks_user_id ON ai_tasks(user_id);
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX idx_ai_tasks_type ON ai_tasks(type);
CREATE INDEX idx_ai_tasks_created_at ON ai_tasks(created_at);
CREATE INDEX idx_code_generations_task_id ON code_generations(task_id);
CREATE INDEX idx_provider_usage_logs_user_provider ON provider_usage_logs(user_id, provider_id);
CREATE INDEX idx_provider_usage_logs_created_at ON provider_usage_logs(created_at);
CREATE INDEX idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_created_at ON security_audit_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pull_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own AI configurations" ON user_ai_configurations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own AI tasks" ON ai_tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own GitHub integrations" ON github_integrations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their task code generations" ON code_generations
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM ai_tasks WHERE id = task_id));

CREATE POLICY "Users can view their pull requests" ON pull_requests
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM ai_tasks WHERE id = task_id));

CREATE POLICY "Users can view their usage logs" ON provider_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Functions for common operations
CREATE OR REPLACE FUNCTION get_user_task_stats(user_uuid UUID)
RETURNS TABLE (
  total_tasks BIGINT,
  completed_tasks BIGINT,
  failed_tasks BIGINT,
  total_cost DECIMAL(10,4),
  avg_completion_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_tasks,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::BIGINT as completed_tasks,
    COUNT(CASE WHEN status = 'failed' THEN 1 END)::BIGINT as failed_tasks,
    COALESCE(SUM(actual_cost), 0) as total_cost,
    AVG(completed_at - created_at) as avg_completion_time
  FROM ai_tasks 
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated; 