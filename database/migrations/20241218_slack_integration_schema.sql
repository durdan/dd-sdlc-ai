-- =====================================================
-- SLACK INTEGRATION & TASK QUEUE SCHEMA MIGRATION
-- =====================================================
-- File: 20241218_slack_integration_schema.sql
-- Purpose: Add support for user integrations and task queue system

-- =====================================================
-- 1. USER INTEGRATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL, -- 'slack', 'github', 'email', etc.
    config JSONB NOT NULL DEFAULT '{}', -- Encrypted configuration data
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure one active integration per type per user
    UNIQUE(user_id, integration_type, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_type ON user_integrations(user_id, integration_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_integrations_type ON user_integrations(integration_type) WHERE is_active = true;

-- =====================================================
-- 2. TASK QUEUE TABLE (Fallback for Vercel KV)
-- =====================================================
CREATE TABLE IF NOT EXISTS task_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id VARCHAR(255) NOT NULL UNIQUE, -- External task ID
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_type VARCHAR(50) NOT NULL, -- 'code_analysis', 'implementation', etc.
    priority INTEGER NOT NULL DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=urgent
    status VARCHAR(50) NOT NULL DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
    payload JSONB NOT NULL DEFAULT '{}', -- Task data
    dependencies TEXT[] DEFAULT '{}', -- Array of dependent task IDs
    source VARCHAR(50) NOT NULL DEFAULT 'web', -- 'web', 'slack', 'api'
    
    -- Execution tracking
    started_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    error_message TEXT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for queue operations
CREATE INDEX IF NOT EXISTS idx_task_queue_status_priority ON task_queue(status, priority DESC, created_at ASC) WHERE status IN ('queued', 'processing');
CREATE INDEX IF NOT EXISTS idx_task_queue_user ON task_queue(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_queue_type ON task_queue(task_type, status);

-- =====================================================
-- 3. TASK EXECUTION LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS task_execution_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id VARCHAR(255) NOT NULL, -- References task_queue.task_id
    step_name VARCHAR(100) NOT NULL,
    step_status VARCHAR(50) NOT NULL, -- 'started', 'completed', 'failed'
    step_data JSONB DEFAULT '{}',
    execution_time_ms INTEGER NULL,
    error_details TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for task log lookups
CREATE INDEX IF NOT EXISTS idx_task_logs_task_id ON task_execution_logs(task_id, created_at ASC);

-- =====================================================
-- 4. SLACK WORKSPACES (for reference)
-- =====================================================
CREATE TABLE IF NOT EXISTS slack_workspaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id VARCHAR(50) NOT NULL UNIQUE, -- Slack team ID
    workspace_name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NULL,
    user_count INTEGER DEFAULT 0,
    is_enterprise BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 5. NOTIFICATIONS QUEUE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'task_completed', 'pr_created', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channels TEXT[] NOT NULL DEFAULT '{}', -- ['slack', 'email', 'webhook']
    priority INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    
    -- Delivery tracking
    scheduled_at TIMESTAMPTZ DEFAULT now(),
    sent_at TIMESTAMPTZ NULL,
    delivery_attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Content data
    data JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for notification delivery
CREATE INDEX IF NOT EXISTS idx_notifications_status_scheduled ON notifications_queue(status, scheduled_at ASC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications_queue(user_id, created_at DESC);

-- =====================================================
-- 6. UPDATE EXISTING TABLES
-- =====================================================

-- Add source tracking to existing task executions
ALTER TABLE sdlc_ai_task_executions 
ADD COLUMN IF NOT EXISTS source VARCHAR(50) NOT NULL DEFAULT 'web';

ALTER TABLE sdlc_ai_task_executions 
ADD COLUMN IF NOT EXISTS external_task_id VARCHAR(255) NULL;

-- Add index for external task ID lookups
CREATE INDEX IF NOT EXISTS idx_task_executions_external_id ON sdlc_ai_task_executions(external_task_id) WHERE external_task_id IS NOT NULL;

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_workspaces ENABLE ROW LEVEL SECURITY;

-- User integrations policies
CREATE POLICY user_integrations_policy ON user_integrations
    FOR ALL USING (auth.uid() = user_id);

-- Task queue policies
CREATE POLICY task_queue_policy ON task_queue
    FOR ALL USING (auth.uid() = user_id);

-- Task logs policies (users can only see their own task logs)
CREATE POLICY task_logs_policy ON task_execution_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM task_queue tq 
            WHERE tq.task_id = task_execution_logs.task_id 
            AND tq.user_id = auth.uid()
        )
    );

-- Notifications policies
CREATE POLICY notifications_policy ON notifications_queue
    FOR ALL USING (auth.uid() = user_id);

-- Slack workspaces policies (read-only for authenticated users)
CREATE POLICY slack_workspaces_read_policy ON slack_workspaces
    FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- 8. FUNCTIONS FOR TASK QUEUE OPERATIONS
-- =====================================================

-- Function to get next task from queue
CREATE OR REPLACE FUNCTION get_next_task_from_queue(
    task_types TEXT[] DEFAULT NULL,
    exclude_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    task_id VARCHAR(255),
    user_id UUID,
    task_type VARCHAR(50),
    priority INTEGER,
    payload JSONB,
    created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    UPDATE task_queue 
    SET 
        status = 'processing',
        started_at = now(),
        updated_at = now()
    WHERE id = (
        SELECT tq.id
        FROM task_queue tq
        WHERE tq.status = 'queued'
        AND (task_types IS NULL OR tq.task_type = ANY(task_types))
        AND (exclude_user_id IS NULL OR tq.user_id != exclude_user_id)
        AND (
            array_length(tq.dependencies, 1) IS NULL 
            OR NOT EXISTS (
                SELECT 1 FROM task_queue dep 
                WHERE dep.task_id = ANY(tq.dependencies) 
                AND dep.status NOT IN ('completed', 'failed')
            )
        )
        ORDER BY tq.priority DESC, tq.created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    RETURNING 
        task_queue.task_id,
        task_queue.user_id,
        task_queue.task_type,
        task_queue.priority,
        task_queue.payload,
        task_queue.created_at;
END;
$$;

-- Function to complete task
CREATE OR REPLACE FUNCTION complete_task(
    p_task_id VARCHAR(255),
    p_result JSONB DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    task_exists BOOLEAN := FALSE;
BEGIN
    UPDATE task_queue 
    SET 
        status = CASE WHEN p_error_message IS NULL THEN 'completed' ELSE 'failed' END,
        completed_at = now(),
        error_message = p_error_message,
        updated_at = now()
    WHERE task_id = p_task_id
    AND status = 'processing';
    
    GET DIAGNOSTICS task_exists = FOUND;
    
    -- Log completion
    INSERT INTO task_execution_logs (task_id, step_name, step_status, step_data)
    VALUES (
        p_task_id, 
        'completion', 
        CASE WHEN p_error_message IS NULL THEN 'completed' ELSE 'failed' END,
        COALESCE(p_result, '{}')
    );
    
    RETURN task_exists;
END;
$$;

-- =====================================================
-- 9. NOTIFICATION HELPERS
-- =====================================================

-- Function to queue notification
CREATE OR REPLACE FUNCTION queue_notification(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT,
    p_channels TEXT[] DEFAULT '{"email"}',
    p_data JSONB DEFAULT '{}',
    p_priority INTEGER DEFAULT 1
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications_queue (
        user_id, notification_type, title, message, channels, priority, data
    ) VALUES (
        p_user_id, p_type, p_title, p_message, p_channels, p_priority, p_data
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- =====================================================
-- 10. SAMPLE DATA & TESTING
-- =====================================================

-- Insert sample integration types
INSERT INTO user_integrations (user_id, integration_type, config, is_active)
SELECT 
    u.id,
    'slack',
    '{"setup_completed": false}'::jsonb,
    false
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_integrations ui 
    WHERE ui.user_id = u.id AND ui.integration_type = 'slack'
)
LIMIT 5;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Slack Integration & Task Queue Schema Migration Completed Successfully';
    RAISE NOTICE 'Tables created: user_integrations, task_queue, task_execution_logs, notifications_queue, slack_workspaces';
    RAISE NOTICE 'Functions created: get_next_task_from_queue, complete_task, queue_notification';
    RAISE NOTICE 'RLS policies applied to all new tables';
END $$; 