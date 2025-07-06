-- SDLC Automation Platform Database Setup
-- Run this script in your Supabase SQL editor

-- SDLC Projects
CREATE TABLE IF NOT EXISTS sdlc_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    input_text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'processing',
    template_used VARCHAR(100),
    jira_project VARCHAR(50),
    confluence_space VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Generated Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES sdlc_projects(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'businessAnalysis', 'functionalSpec', 'technicalSpec', 'uxSpec', 'architecture'
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- External Integrations
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES sdlc_projects(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL, -- 'jira', 'confluence'
    external_id VARCHAR(255) NOT NULL,
    external_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Configurations (API Keys, etc.)
CREATE TABLE IF NOT EXISTS user_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    openai_api_key TEXT,
    jira_base_url TEXT,
    jira_email TEXT,
    jira_api_token TEXT,
    confluence_base_url TEXT,
    confluence_email TEXT,
    confluence_api_token TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Progress Tracking
CREATE TABLE IF NOT EXISTS progress_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES sdlc_projects(id) ON DELETE CASCADE,
    step VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    progress_percentage INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Templates
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    configuration JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sdlc_projects_user_id ON sdlc_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_projects_status ON sdlc_projects(status);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_progress_logs_project_id ON progress_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_integrations_project_id ON integrations(project_id);
CREATE INDEX IF NOT EXISTS idx_user_configurations_user_id ON user_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE sdlc_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own projects
CREATE POLICY "Users can view own projects" ON sdlc_projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON sdlc_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON sdlc_projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON sdlc_projects
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only see documents for their own projects
CREATE POLICY "Users can view own documents" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sdlc_projects 
            WHERE sdlc_projects.id = documents.project_id 
            AND sdlc_projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert documents for own projects" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sdlc_projects 
            WHERE sdlc_projects.id = documents.project_id 
            AND sdlc_projects.user_id = auth.uid()
        )
    );

-- Similar policies for other tables
CREATE POLICY "Users can view own integrations" ON integrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sdlc_projects 
            WHERE sdlc_projects.id = integrations.project_id 
            AND sdlc_projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert integrations for own projects" ON integrations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sdlc_projects 
            WHERE sdlc_projects.id = integrations.project_id 
            AND sdlc_projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own configurations" ON user_configurations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own configurations" ON user_configurations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configurations" ON user_configurations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress logs" ON progress_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sdlc_projects 
            WHERE sdlc_projects.id = progress_logs.project_id 
            AND sdlc_projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert progress logs for own projects" ON progress_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sdlc_projects 
            WHERE sdlc_projects.id = progress_logs.project_id 
            AND sdlc_projects.user_id = auth.uid()
        )
    );

-- Templates can be viewed by everyone if public, or by owner if private
CREATE POLICY "Users can view public templates or own templates" ON templates
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" ON templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON templates
    FOR UPDATE USING (auth.uid() = user_id);

-- Audit logs - users can only see their own
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Insert default templates
INSERT INTO templates (name, description, category, configuration, is_public) VALUES
('Default SDLC', 'Standard software development lifecycle template', 'default', 
 '{"prompts": {"businessAnalysis": "Analyze the business requirements...", "functionalSpec": "Create functional specifications...", "technicalSpec": "Design technical architecture...", "uxSpec": "Define user experience requirements..."}}', 
 true),
('Agile Development', 'Agile-focused development template with user stories', 'agile',
 '{"prompts": {"businessAnalysis": "Define user stories and acceptance criteria...", "functionalSpec": "Create sprint-ready requirements...", "technicalSpec": "Design for iterative development...", "uxSpec": "Create user-centered design..."}}',
 true),
('Bug Fix Template', 'Template optimized for bug fixes and maintenance', 'bug-fix',
 '{"prompts": {"businessAnalysis": "Analyze the bug impact and root cause...", "functionalSpec": "Define fix requirements...", "technicalSpec": "Design the technical solution...", "uxSpec": "Ensure UX consistency..."}}',
 true)
ON CONFLICT DO NOTHING; 