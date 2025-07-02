-- SDLC Automation Platform Database Schema

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SDLC Projects
CREATE TABLE sdlc_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES sdlc_projects(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'business_analysis', 'functional_spec', etc.
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- External Integrations
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES sdlc_projects(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL, -- 'jira', 'confluence'
    external_id VARCHAR(255) NOT NULL,
    external_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    configuration JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Progress Tracking
CREATE TABLE progress_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES sdlc_projects(id) ON DELETE CASCADE,
    step VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    progress_percentage INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- API Keys and Configuration
CREATE TABLE user_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sdlc_projects_user_id ON sdlc_projects(user_id);
CREATE INDEX idx_sdlc_projects_status ON sdlc_projects(status);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_progress_logs_project_id ON progress_logs(project_id);
CREATE INDEX idx_integrations_project_id ON integrations(project_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

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
 true);
