-- Create table for agentic task executions
CREATE TABLE IF NOT EXISTS sdlc_ai_task_executions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL CHECK (task_type IN ('bug-fix', 'feature', 'review', 'test-generation', 'refactor')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'planning', 'executing', 'reviewing', 'completed', 'failed', 'cancelled', 'rollback_completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    description TEXT NOT NULL,
    repository_owner TEXT NOT NULL,
    repository_name TEXT NOT NULL,
    repository_branch TEXT,
    github_issue_url TEXT,
    context TEXT,
    requirements TEXT,
    execution_config JSONB DEFAULT '{}',
    execution_result JSONB,
    execution_logs JSONB DEFAULT '[]',
    safety_checks JSONB DEFAULT '[]',
    rollback_points JSONB DEFAULT '[]',
    estimated_duration INTEGER, -- in seconds
    actual_duration INTEGER,   -- in seconds
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Indexes for better performance
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sdlc_ai_task_executions_user_id ON sdlc_ai_task_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_ai_task_executions_status ON sdlc_ai_task_executions(status);
CREATE INDEX IF NOT EXISTS idx_sdlc_ai_task_executions_created_at ON sdlc_ai_task_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sdlc_ai_task_executions_repository ON sdlc_ai_task_executions(repository_owner, repository_name);

-- Create table for approval requests
CREATE TABLE IF NOT EXISTS sdlc_approval_requests (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES sdlc_ai_task_executions(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('code_changes', 'pull_request', 'file_deletion', 'branch_creation', 'merge_request')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requested_by TEXT NOT NULL DEFAULT 'claude-ai-assistant',
    reviewed_by TEXT,
    approval_data JSONB NOT NULL DEFAULT '{}',
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    estimated_impact TEXT NOT NULL,
    review_notes TEXT,
    auto_approval_rules JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    reviewed_at TIMESTAMPTZ,
    
    CONSTRAINT fk_task FOREIGN KEY (task_id) REFERENCES sdlc_ai_task_executions(id)
);

-- Create indexes for approval requests
CREATE INDEX IF NOT EXISTS idx_sdlc_approval_requests_task_id ON sdlc_approval_requests(task_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_approval_requests_status ON sdlc_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_sdlc_approval_requests_created_at ON sdlc_approval_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sdlc_approval_requests_expires_at ON sdlc_approval_requests(expires_at);

-- Create table for safety checks
CREATE TABLE IF NOT EXISTS sdlc_safety_checks (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES sdlc_ai_task_executions(id) ON DELETE CASCADE,
    check_type TEXT NOT NULL CHECK (check_type IN ('pre_execution', 'post_execution', 'continuous')),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'passed', 'failed', 'skipped')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    result JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_task_safety FOREIGN KEY (task_id) REFERENCES sdlc_ai_task_executions(id)
);

-- Create indexes for safety checks
CREATE INDEX IF NOT EXISTS idx_sdlc_safety_checks_task_id ON sdlc_safety_checks(task_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_safety_checks_status ON sdlc_safety_checks(status);
CREATE INDEX IF NOT EXISTS idx_sdlc_safety_checks_severity ON sdlc_safety_checks(severity);

-- Create table for test executions
CREATE TABLE IF NOT EXISTS sdlc_test_executions (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES sdlc_ai_task_executions(id) ON DELETE CASCADE,
    test_type TEXT NOT NULL CHECK (test_type IN ('unit', 'integration', 'e2e', 'security', 'performance')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'passed', 'failed', 'cancelled')),
    results JSONB DEFAULT '[]',
    coverage JSONB,
    performance_metrics JSONB,
    duration INTEGER, -- in milliseconds
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    CONSTRAINT fk_task_test FOREIGN KEY (task_id) REFERENCES sdlc_ai_task_executions(id)
);

-- Create indexes for test executions
CREATE INDEX IF NOT EXISTS idx_sdlc_test_executions_task_id ON sdlc_test_executions(task_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_test_executions_status ON sdlc_test_executions(status);
CREATE INDEX IF NOT EXISTS idx_sdlc_test_executions_test_type ON sdlc_test_executions(test_type);

-- Create table for repository context cache
CREATE TABLE IF NOT EXISTS sdlc_repository_context (
    id TEXT PRIMARY KEY,
    repository_owner TEXT NOT NULL,
    repository_name TEXT NOT NULL,
    branch TEXT NOT NULL,
    context_data JSONB NOT NULL,
    file_count INTEGER NOT NULL,
    total_size BIGINT NOT NULL,
    languages JSONB NOT NULL DEFAULT '{}',
    last_analyzed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
    
    -- Unique constraint for caching
    UNIQUE(repository_owner, repository_name, branch)
);

-- Create indexes for repository context
CREATE INDEX IF NOT EXISTS idx_sdlc_repository_context_repo ON sdlc_repository_context(repository_owner, repository_name);
CREATE INDEX IF NOT EXISTS idx_sdlc_repository_context_expires_at ON sdlc_repository_context(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE sdlc_ai_task_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdlc_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdlc_safety_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdlc_test_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdlc_repository_context ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for task executions
CREATE POLICY "Users can view their own task executions" ON sdlc_ai_task_executions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task executions" ON sdlc_ai_task_executions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task executions" ON sdlc_ai_task_executions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task executions" ON sdlc_ai_task_executions
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for approval requests
CREATE POLICY "Users can view approval requests for their tasks" ON sdlc_approval_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sdlc_ai_task_executions t 
            WHERE t.id = task_id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert approval requests for their tasks" ON sdlc_approval_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sdlc_ai_task_executions t 
            WHERE t.id = task_id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update approval requests for their tasks" ON sdlc_approval_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM sdlc_ai_task_executions t 
            WHERE t.id = task_id AND t.user_id = auth.uid()
        )
    );

-- Create RLS policies for safety checks
CREATE POLICY "Users can view safety checks for their tasks" ON sdlc_safety_checks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sdlc_ai_task_executions t 
            WHERE t.id = task_id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert safety checks for their tasks" ON sdlc_safety_checks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sdlc_ai_task_executions t 
            WHERE t.id = task_id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update safety checks for their tasks" ON sdlc_safety_checks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM sdlc_ai_task_executions t 
            WHERE t.id = task_id AND t.user_id = auth.uid()
        )
    );

-- Create RLS policies for test executions
CREATE POLICY "Users can view test executions for their tasks" ON sdlc_test_executions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sdlc_ai_task_executions t 
            WHERE t.id = task_id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert test executions for their tasks" ON sdlc_test_executions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sdlc_ai_task_executions t 
            WHERE t.id = task_id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update test executions for their tasks" ON sdlc_test_executions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM sdlc_ai_task_executions t 
            WHERE t.id = task_id AND t.user_id = auth.uid()
        )
    );

-- Create RLS policies for repository context (can be read by anyone, but only inserted by authenticated users)
CREATE POLICY "Anyone can view repository context" ON sdlc_repository_context
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert repository context" ON sdlc_repository_context
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update repository context" ON sdlc_repository_context
    FOR UPDATE TO authenticated USING (true);

-- Create functions for automatic cleanup of expired data
CREATE OR REPLACE FUNCTION cleanup_expired_approvals()
RETURNS void AS $$
BEGIN
    UPDATE sdlc_approval_requests 
    SET status = 'expired' 
    WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_repository_context()
RETURNS void AS $$
BEGIN
    DELETE FROM sdlc_repository_context 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-update completed_at when status changes to completed/failed/cancelled
CREATE OR REPLACE FUNCTION update_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('completed', 'failed', 'cancelled', 'rollback_completed') 
       AND OLD.status NOT IN ('completed', 'failed', 'cancelled', 'rollback_completed') THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_completed_at
    BEFORE UPDATE ON sdlc_ai_task_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_task_completed_at();

-- Add comments for documentation
COMMENT ON TABLE sdlc_ai_task_executions IS 'Stores agentic AI task executions for code generation and automation';
COMMENT ON TABLE sdlc_approval_requests IS 'Stores human approval requests for AI-generated code changes';
COMMENT ON TABLE sdlc_safety_checks IS 'Stores safety check results for AI task executions';
COMMENT ON TABLE sdlc_test_executions IS 'Stores test execution results for AI-generated code';
COMMENT ON TABLE sdlc_repository_context IS 'Caches repository analysis data for performance optimization';

-- Grant necessary permissions
GRANT ALL ON sdlc_ai_task_executions TO authenticated;
GRANT ALL ON sdlc_approval_requests TO authenticated;
GRANT ALL ON sdlc_safety_checks TO authenticated;
GRANT ALL ON sdlc_test_executions TO authenticated;
GRANT ALL ON sdlc_repository_context TO authenticated; 