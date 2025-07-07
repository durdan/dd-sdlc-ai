-- Prompt Management System Database Migration
-- This migration creates the tables and policies for the prompt management system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user roles table for role-based access control
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one role per user
    UNIQUE(user_id)
);

-- Create prompt templates table
CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('business', 'functional', 'technical', 'ux', 'mermaid')),
    prompt_content TEXT NOT NULL,
    variables JSONB DEFAULT '{}', -- Dynamic variables like {input}, {context}
    ai_model VARCHAR(50) DEFAULT 'gpt-4', -- 'gpt-4', 'claude', 'gemini', etc.
    is_active BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT unique_default_per_type UNIQUE(document_type, is_default) DEFERRABLE INITIALLY DEFERRED
);

-- Create prompt usage logs table for analytics
CREATE TABLE IF NOT EXISTS prompt_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES sdlc_projects(id) ON DELETE SET NULL,
    input_text TEXT,
    generated_content TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    response_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    ai_model_used VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompt experiments table for A/B testing
CREATE TABLE IF NOT EXISTS prompt_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(50) NOT NULL,
    control_prompt_id UUID REFERENCES prompt_templates(id),
    variant_prompt_id UUID REFERENCES prompt_templates(id),
    traffic_split DECIMAL(3,2) DEFAULT 0.5 CHECK (traffic_split >= 0 AND traffic_split <= 1),
    is_active BOOLEAN DEFAULT false,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure valid date range
    CHECK (end_date IS NULL OR start_date < end_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompt_templates_document_type ON prompt_templates(document_type);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_prompt_templates_default ON prompt_templates(document_type, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_prompt_usage_logs_created_at ON prompt_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_logs_user_id ON prompt_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_logs_prompt_id ON prompt_usage_logs(prompt_template_id);
CREATE INDEX IF NOT EXISTS idx_prompt_experiments_active ON prompt_experiments(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_experiments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- RLS Policies for prompt_templates
CREATE POLICY "Admins can manage all prompts" ON prompt_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Managers can view prompts" ON prompt_templates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "All authenticated users can read active prompts" ON prompt_templates
    FOR SELECT USING (
        is_active = true 
        AND auth.role() = 'authenticated'
    );

-- RLS Policies for prompt_usage_logs
CREATE POLICY "Admins can view all usage logs" ON prompt_usage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Users can view their own usage logs" ON prompt_usage_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert usage logs" ON prompt_usage_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for prompt_experiments
CREATE POLICY "Admins can manage experiments" ON prompt_experiments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Managers can view experiments" ON prompt_experiments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_prompt_templates_updated_at 
    BEFORE UPDATE ON prompt_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_experiments_updated_at 
    BEFORE UPDATE ON prompt_experiments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default prompts (current hardcoded prompts)
INSERT INTO prompt_templates (name, description, document_type, prompt_content, variables, is_active, is_default, version, created_by) VALUES
(
    'Default Business Analysis Prompt',
    'Standard business analysis prompt for requirement analysis',
    'business',
    'You are an expert business analyst. Analyze the following project requirements and provide a comprehensive business analysis document.

Please structure your response with the following sections:

## Executive Summary
Provide a high-level overview of the project and its business value.

## Business Objectives
List the primary business goals this project aims to achieve.

## Stakeholder Analysis
Identify key stakeholders and their interests in the project.

## Requirements Analysis
Break down the functional and non-functional requirements.

## Success Metrics
Define measurable success criteria and KPIs.

## Risk Assessment
Identify potential risks and mitigation strategies.

## Implementation Considerations
Highlight important factors for successful implementation.

Project Requirements:
{input}

Additional Context:
{context}

Please provide a detailed, professional business analysis based on these requirements.',
    '{"input": "Project requirements text", "context": "Additional context or constraints"}',
    true,
    true,
    1,
    (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)
),
(
    'Default Functional Specification Prompt',
    'Standard functional specification prompt for detailed feature requirements',
    'functional',
    'You are an expert systems analyst. Create a detailed functional specification based on the business analysis provided.

Please structure your response with the following sections:

## Functional Overview
Summarize the system functionality at a high level.

## User Stories
Create detailed user stories with acceptance criteria.

## Feature Requirements
List and describe each feature in detail.

## User Interface Requirements
Describe UI/UX requirements and user flows.

## Data Requirements
Specify data models, inputs, outputs, and storage needs.

## Integration Requirements
Detail external systems and API integrations needed.

## Business Rules
Define business logic and validation rules.

## Performance Requirements
Specify performance, scalability, and reliability requirements.

Business Analysis:
{business_analysis}

Project Requirements:
{input}

Please provide a comprehensive functional specification that developers can use to build the system.',
    '{"business_analysis": "Business analysis document", "input": "Original project requirements"}',
    true,
    true,
    1,
    (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)
),
(
    'Default Technical Specification Prompt',
    'Standard technical specification prompt for system architecture and implementation details',
    'technical',
    'You are an expert software architect. Create a comprehensive technical specification based on the functional requirements provided.

Please structure your response with the following sections:

## System Architecture
Describe the overall system architecture and design patterns.

## Technology Stack
Recommend specific technologies, frameworks, and tools.

## Database Design
Provide database schema, relationships, and data flow.

## API Design
Define REST/GraphQL endpoints, request/response formats.

## Security Considerations
Detail authentication, authorization, and security measures.

## Infrastructure Requirements
Specify hosting, deployment, and scalability requirements.

## Development Guidelines
Provide coding standards and development best practices.

## Testing Strategy
Outline unit, integration, and end-to-end testing approaches.

## Deployment Plan
Describe CI/CD pipeline and deployment procedures.

## Monitoring and Maintenance
Define logging, monitoring, and maintenance requirements.

Functional Specification:
{functional_spec}

Business Analysis:
{business_analysis}

Please provide a detailed technical specification that the development team can follow.',
    '{"functional_spec": "Functional specification document", "business_analysis": "Business analysis document"}',
    true,
    true,
    1,
    (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)
),
(
    'Default UX Specification Prompt',
    'Standard UX specification prompt for user experience design',
    'ux',
    'You are an expert UX designer. Create a comprehensive UX specification based on the functional requirements provided.

Please structure your response with the following sections:

## User Experience Overview
Summarize the overall user experience strategy and goals.

## User Personas
Define primary user types and their characteristics.

## User Journey Maps
Describe key user flows and touchpoints.

## Information Architecture
Outline site structure, navigation, and content organization.

## Wireframes and Layouts
Describe page layouts and component structures.

## Interaction Design
Detail user interactions, micro-interactions, and feedback.

## Visual Design Guidelines
Specify design system, colors, typography, and branding.

## Accessibility Requirements
Ensure compliance with accessibility standards (WCAG).

## Responsive Design
Define mobile, tablet, and desktop experiences.

## Usability Testing Plan
Outline user testing methodology and success metrics.

Functional Specification:
{functional_spec}

Business Analysis:
{business_analysis}

Please provide a detailed UX specification that designers and developers can implement.',
    '{"functional_spec": "Functional specification document", "business_analysis": "Business analysis document"}',
    true,
    true,
    1,
    (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)
),
(
    'Default Mermaid Diagram Prompt',
    'Standard prompt for generating Mermaid architecture diagrams',
    'mermaid',
    'You are an expert system architect. Create comprehensive Mermaid diagrams to visualize the system architecture based on the technical specification provided.

Please create the following types of diagrams using Mermaid syntax:

## System Architecture Diagram
Create a high-level system architecture diagram showing major components and their relationships.

## Database Schema Diagram
Create an entity relationship diagram (ERD) showing database tables and relationships.

## User Flow Diagram
Create a flowchart showing key user journeys and decision points.

## API Architecture Diagram
Create a diagram showing API endpoints, services, and data flow.

## Deployment Diagram
Create a diagram showing the deployment architecture and infrastructure.

Technical Specification:
{technical_spec}

Functional Specification:
{functional_spec}

Please provide valid Mermaid diagram code that can be rendered directly. Use proper Mermaid syntax and ensure diagrams are clear and informative.',
    '{"technical_spec": "Technical specification document", "functional_spec": "Functional specification document"}',
    true,
    true,
    1,
    (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)
);

-- Create a default admin user role (this should be updated with actual admin user ID)
-- Note: This is a placeholder - in production, you'll need to update with actual admin user ID
INSERT INTO user_roles (user_id, role) 
SELECT id, 'admin' 
FROM auth.users 
WHERE email = 'admin@example.com' 
ON CONFLICT (user_id) DO NOTHING;

-- Create views for easier querying
CREATE OR REPLACE VIEW active_prompts AS
SELECT 
    pt.*,
    u.email as created_by_email
FROM prompt_templates pt
LEFT JOIN auth.users u ON pt.created_by = u.id
WHERE pt.is_active = true;

CREATE OR REPLACE VIEW default_prompts AS
SELECT 
    pt.*,
    u.email as created_by_email
FROM prompt_templates pt
LEFT JOIN auth.users u ON pt.created_by = u.id
WHERE pt.is_default = true;

CREATE OR REPLACE VIEW prompt_analytics AS
SELECT 
    pt.id,
    pt.name,
    pt.document_type,
    pt.version,
    COUNT(pul.id) as usage_count,
    AVG(pul.response_time_ms) as avg_response_time,
    AVG(CASE WHEN pul.success THEN 1.0 ELSE 0.0 END) * 100 as success_rate,
    SUM(pul.input_tokens) as total_input_tokens,
    SUM(pul.output_tokens) as total_output_tokens,
    MAX(pul.created_at) as last_used
FROM prompt_templates pt
LEFT JOIN prompt_usage_logs pul ON pt.id = pul.prompt_template_id
GROUP BY pt.id, pt.name, pt.document_type, pt.version;

-- Grant necessary permissions
GRANT SELECT ON active_prompts TO authenticated;
GRANT SELECT ON default_prompts TO authenticated;
GRANT SELECT ON prompt_analytics TO authenticated;

-- Create function to get active prompt for document type
CREATE OR REPLACE FUNCTION get_active_prompt(doc_type VARCHAR(50))
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    prompt_content TEXT,
    variables JSONB,
    ai_model VARCHAR(50),
    version INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.id,
        pt.name,
        pt.prompt_content,
        pt.variables,
        pt.ai_model,
        pt.version
    FROM prompt_templates pt
    WHERE pt.document_type = doc_type 
    AND pt.is_active = true 
    AND pt.is_default = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log prompt usage
CREATE OR REPLACE FUNCTION log_prompt_usage(
    p_prompt_template_id UUID,
    p_user_id UUID,
    p_project_id UUID DEFAULT NULL,
    p_input_text TEXT DEFAULT NULL,
    p_generated_content TEXT DEFAULT NULL,
    p_input_tokens INTEGER DEFAULT NULL,
    p_output_tokens INTEGER DEFAULT NULL,
    p_response_time_ms INTEGER DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL,
    p_ai_model_used VARCHAR(50) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO prompt_usage_logs (
        prompt_template_id,
        user_id,
        project_id,
        input_text,
        generated_content,
        input_tokens,
        output_tokens,
        response_time_ms,
        success,
        error_message,
        ai_model_used
    ) VALUES (
        p_prompt_template_id,
        p_user_id,
        p_project_id,
        p_input_text,
        p_generated_content,
        p_input_tokens,
        p_output_tokens,
        p_response_time_ms,
        p_success,
        p_error_message,
        p_ai_model_used
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_active_prompt(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION log_prompt_usage(UUID, UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER, BOOLEAN, TEXT, VARCHAR) TO authenticated;

COMMENT ON TABLE prompt_templates IS 'Stores AI prompts for different document types with version control';
COMMENT ON TABLE prompt_usage_logs IS 'Tracks usage analytics and performance metrics for prompts';
COMMENT ON TABLE prompt_experiments IS 'Manages A/B testing experiments for prompt optimization';
COMMENT ON TABLE user_roles IS 'Defines user roles for access control to prompt management features'; 