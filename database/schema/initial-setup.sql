-- =====================================================
-- SDLC AUTOMATION PLATFORM - COMPLETE INITIAL SETUP SCRIPT
-- =====================================================
-- This script creates a complete database setup for the SDLC Automation Platform
-- Based on the actual production database structure
-- Run this in your Supabase SQL editor for a fresh installation
-- 
-- Features included:
-- - Complete SDLC project management with AI tasks
-- - Advanced prompt management system with A/B testing
-- - Early access and freemium system
-- - GitDigest repository analysis
-- - Slack integration
-- - User roles and permissions
-- - Comprehensive analytics and usage tracking
-- - AI provider management
-- - Code generation and review system
-- - Security and safety checks
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CORE SDLC TABLES
-- =====================================================

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
    document_metadata JSONB DEFAULT '{}',
    linked_projects JSONB DEFAULT '{}',
    session_id TEXT,
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
    slack_workspace_id TEXT,
    slack_access_token TEXT,
    v0_api_key TEXT, -- v0.dev API key for UI component generation
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- v0.dev Usage Tracking (for system API key daily limits)
CREATE TABLE IF NOT EXISTS v0_usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    usage_count INTEGER NOT NULL DEFAULT 1,
    project_ids TEXT[], -- Array of project IDs generated on this date
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, usage_date)
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

-- =====================================================
-- 2. USER ROLES AND PERMISSIONS
-- =====================================================

-- User roles table for role-based access control
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- 3. PROMPT MANAGEMENT SYSTEM
-- =====================================================

-- Prompt templates table
CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'business', 'functional', 'technical', 'ux', 'mermaid',
        'businessAnalysis', 'functionalSpec', 'technicalSpec', 'uxSpec', 'architecture',
        'comprehensive_sdlc', 'business_analysis', 'functional_spec', 'technical_spec', 'ux_spec',
        'backlog_structure', 'mermaid_diagrams', 'database', 'dataflow', 'userflow', 'sequence', 'wireframe'
    )),
    prompt_content TEXT NOT NULL,
    variables JSONB DEFAULT '{}', -- Dynamic variables like {input}, {context}
    ai_model VARCHAR(50) DEFAULT 'gpt-4', -- 'gpt-4', 'claude', 'gemini', etc.
    is_active BOOLEAN DEFAULT false,
    is_system_default BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    prompt_scope VARCHAR(50) NOT NULL DEFAULT 'system',
    user_id UUID REFERENCES auth.users(id),
    is_personal_default BOOLEAN DEFAULT false
);

-- Prompt usage logs table for analytics
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

-- Prompt experiments table for A/B testing
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
    CHECK (end_date IS NULL OR start_date < end_date)
);

-- Wireframe prompts table for managing wireframe generation prompts
CREATE TABLE IF NOT EXISTS wireframe_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prompt_template TEXT NOT NULL,
    category VARCHAR(100),
    layout_type VARCHAR(50) DEFAULT 'web',
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =====================================================
-- 4. EARLY ACCESS AND FREEMIUM SYSTEM
-- =====================================================

-- Early access enrollments
CREATE TABLE IF NOT EXISTS early_access_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    enrollment_status TEXT NOT NULL DEFAULT 'pending' CHECK (enrollment_status IN ('pending', 'approved', 'rejected', 'waitlisted')),
    access_level TEXT NOT NULL DEFAULT 'beta' CHECK (access_level IN ('alpha', 'beta', 'preview', 'enterprise')),
    requested_features JSONB DEFAULT '[]',
    use_case_description TEXT,
    company_name TEXT,
    company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),
    technical_background TEXT CHECK (technical_background IN ('beginner', 'intermediate', 'advanced', 'expert')),
    expected_usage TEXT CHECK (expected_usage IN ('light', 'moderate', 'heavy', 'enterprise')),
    referral_source TEXT,
    priority_score INTEGER DEFAULT 0,
    admin_notes TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    enrolled_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, access_level)
);

-- Beta features
CREATE TABLE IF NOT EXISTS beta_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_key TEXT NOT NULL UNIQUE,
    feature_name TEXT NOT NULL,
    feature_description TEXT,
    feature_category TEXT NOT NULL DEFAULT 'general',
    access_level TEXT NOT NULL DEFAULT 'beta' CHECK (access_level IN ('alpha', 'beta', 'preview', 'enterprise')),
    is_active BOOLEAN DEFAULT true,
    min_priority_score INTEGER DEFAULT 0,
    usage_limit INTEGER,
    usage_limit_period TEXT CHECK (usage_limit_period IN ('daily', 'weekly', 'monthly')),
    feature_config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User feature access
CREATE TABLE IF NOT EXISTS user_feature_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES beta_features(id) ON DELETE CASCADE,
    access_granted BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, feature_id)
);

-- Early access waitlist
CREATE TABLE IF NOT EXISTS early_access_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    requested_features JSONB DEFAULT '[]',
    position INTEGER,
    priority_score INTEGER DEFAULT 0,
    notification_sent BOOLEAN DEFAULT false,
    invited_at TIMESTAMPTZ,
    signed_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Credit requests for freemium system
CREATE TABLE IF NOT EXISTS credit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('increase_limit', 'feature_access', 'early_access')),
    request_reason TEXT NOT NULL,
    current_usage JSONB DEFAULT '{}',
    requested_amount INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. ADVANCED SDLC TABLES
-- =====================================================

-- AI Providers Management
CREATE TABLE IF NOT EXISTS sdlc_ai_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    capabilities JSONB NOT NULL DEFAULT '{}',
    cost_model JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Tasks Management
CREATE TABLE IF NOT EXISTS sdlc_ai_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES sdlc_projects(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    context JSONB NOT NULL DEFAULT '{}',
    provider_used VARCHAR(100),
    result JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    error_details TEXT,
    estimated_cost NUMERIC,
    actual_cost NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- AI Task Executions
CREATE TABLE IF NOT EXISTS sdlc_ai_task_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES sdlc_ai_tasks(id) ON DELETE CASCADE,
    execution_status VARCHAR(50) NOT NULL,
    execution_data JSONB DEFAULT '{}',
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Task Dashboard
CREATE TABLE IF NOT EXISTS sdlc_ai_task_dashboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dashboard_data JSONB NOT NULL DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Key Rotations
CREATE TABLE IF NOT EXISTS sdlc_api_key_rotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_name VARCHAR(100) NOT NULL,
    old_key_hash TEXT,
    new_key_hash TEXT,
    rotation_reason TEXT,
    rotated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval Requests
CREATE TABLE IF NOT EXISTS sdlc_approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type VARCHAR(100) NOT NULL,
    request_data JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation Rules
CREATE TABLE IF NOT EXISTS sdlc_automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    rule_conditions JSONB NOT NULL DEFAULT '{}',
    rule_actions JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Code Generations
CREATE TABLE IF NOT EXISTS sdlc_code_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES sdlc_projects(id) ON DELETE CASCADE,
    generation_type VARCHAR(100) NOT NULL,
    input_context JSONB NOT NULL DEFAULT '{}',
    generated_code TEXT,
    language VARCHAR(50),
    framework VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Code Review Feedback
CREATE TABLE IF NOT EXISTS sdlc_code_review_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code_generation_id UUID REFERENCES sdlc_code_generations(id) ON DELETE CASCADE,
    feedback_type VARCHAR(100) NOT NULL,
    feedback_content TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'medium',
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GitHub Integrations
CREATE TABLE IF NOT EXISTS sdlc_github_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    github_username VARCHAR(255),
    access_token_hash TEXT,
    webhook_secret_hash TEXT,
    repositories JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider Usage Logs
CREATE TABLE IF NOT EXISTS sdlc_provider_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_name VARCHAR(100) NOT NULL,
    usage_type VARCHAR(100) NOT NULL,
    tokens_used INTEGER,
    cost NUMERIC,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pull Requests
CREATE TABLE IF NOT EXISTS sdlc_pull_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES sdlc_projects(id) ON DELETE CASCADE,
    github_pr_id INTEGER,
    repository VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repository Context
CREATE TABLE IF NOT EXISTS sdlc_repository_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    repository_url TEXT NOT NULL,
    context_data JSONB NOT NULL DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safety Checks
CREATE TABLE IF NOT EXISTS sdlc_safety_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    check_type VARCHAR(100) NOT NULL,
    check_data JSONB NOT NULL DEFAULT '{}',
    passed BOOLEAN NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Audit Logs
CREATE TABLE IF NOT EXISTS sdlc_security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    security_level VARCHAR(50) DEFAULT 'info',
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Dependencies
CREATE TABLE IF NOT EXISTS sdlc_task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dependent_task_id UUID NOT NULL REFERENCES sdlc_ai_tasks(id) ON DELETE CASCADE,
    prerequisite_task_id UUID NOT NULL REFERENCES sdlc_ai_tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'required',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(dependent_task_id, prerequisite_task_id)
);

-- Test Executions
CREATE TABLE IF NOT EXISTS sdlc_test_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES sdlc_projects(id) ON DELETE CASCADE,
    test_type VARCHAR(100) NOT NULL,
    test_data JSONB NOT NULL DEFAULT '{}',
    result JSONB DEFAULT '{}',
    passed BOOLEAN,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Analytics
CREATE TABLE IF NOT EXISTS sdlc_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    analytics_type VARCHAR(100) NOT NULL,
    analytics_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User AI Configurations
CREATE TABLE IF NOT EXISTS sdlc_user_ai_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_name VARCHAR(100) NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles (SDLC specific)
CREATE TABLE IF NOT EXISTS sdlc_user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_name VARCHAR(100) NOT NULL,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_name)
);

-- =====================================================
-- 6. ADDITIONAL TABLES
-- =====================================================

-- Anonymous Project Sessions
CREATE TABLE IF NOT EXISTS anonymous_project_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    project_data JSONB NOT NULL DEFAULT '{}',
    user_agent TEXT,
    ip_address TEXT,
    referrer TEXT,
    project_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Content Analytics
CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    content_type VARCHAR(100) NOT NULL,
    content_id UUID,
    analytics_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Generation Log
CREATE TABLE IF NOT EXISTS content_generation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    generation_type VARCHAR(100) NOT NULL,
    input_data JSONB NOT NULL DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    generation_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Generations
CREATE TABLE IF NOT EXISTS project_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    project_id UUID REFERENCES sdlc_projects(id) ON DELETE CASCADE,
    generation_type VARCHAR(100) NOT NULL,
    generation_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GitDigest Queue
CREATE TABLE IF NOT EXISTS gitdigest_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    repo_digest_id UUID REFERENCES repo_digests(id) ON DELETE CASCADE,
    queue_status VARCHAR(50) DEFAULT 'pending',
    priority INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Analytics
CREATE TABLE IF NOT EXISTS system_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analytics_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    system_key_usage INTEGER DEFAULT 0,
    user_key_usage INTEGER DEFAULT 0,
    total_tokens_used BIGINT DEFAULT 0,
    total_cost_estimate NUMERIC(10,2) DEFAULT 0,
    error_rate NUMERIC(5,2) DEFAULT 0,
    avg_generation_time_ms INTEGER DEFAULT 0,
    analytics_type VARCHAR(100),
    analytics_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Ratings
CREATE TABLE IF NOT EXISTS user_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating_type VARCHAR(100) NOT NULL,
    rating_value INTEGER NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. GITDIGEST REPOSITORY ANALYSIS
-- =====================================================

-- Repository digests
CREATE TABLE IF NOT EXISTS repo_digests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    repo_url TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    repo_owner TEXT NOT NULL,
    repo_full_name TEXT NOT NULL,
    digest_data JSONB NOT NULL DEFAULT '{}',
    sdlc_score INTEGER NOT NULL DEFAULT 0 CHECK (sdlc_score >= 0 AND sdlc_score <= 100),
    analysis_metadata JSONB DEFAULT '{}',
    last_analyzed TIMESTAMP DEFAULT NOW(),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, repo_url)
);

-- Daily reports
CREATE TABLE IF NOT EXISTS daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_digest_id UUID NOT NULL REFERENCES repo_digests(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    changes_summary JSONB NOT NULL DEFAULT '{}',
    commit_count INTEGER DEFAULT 0,
    pr_count INTEGER DEFAULT 0,
    issue_count INTEGER DEFAULT 0,
    contributors_count INTEGER DEFAULT 0,
    lines_added INTEGER DEFAULT 0,
    lines_removed INTEGER DEFAULT 0,
    ai_summary TEXT,
    key_changes TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(repo_digest_id, report_date)
);

-- Digest shares
CREATE TABLE IF NOT EXISTS digest_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_digest_id UUID NOT NULL REFERENCES repo_digests(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT false,
    expires_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    last_viewed TIMESTAMP,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_share_token UNIQUE(share_token)
);

-- Digest analytics
CREATE TABLE IF NOT EXISTS digest_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_digest_id UUID NOT NULL REFERENCES repo_digests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Digest subscriptions
CREATE TABLE IF NOT EXISTS digest_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    repo_digest_id UUID NOT NULL REFERENCES repo_digests(id) ON DELETE CASCADE,
    subscription_type TEXT NOT NULL DEFAULT 'daily',
    is_active BOOLEAN DEFAULT true,
    delivery_method TEXT NOT NULL DEFAULT 'email',
    delivery_config JSONB DEFAULT '{}',
    last_delivered TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, repo_digest_id, subscription_type)
);

-- GitDigest settings
CREATE TABLE IF NOT EXISTS gitdigest_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    github_token TEXT,
    github_username TEXT,
    default_analysis_frequency TEXT DEFAULT 'daily' CHECK (default_analysis_frequency IN ('daily', 'weekly', 'monthly')),
    notification_preferences JSONB DEFAULT '{"email": true, "slack": false}',
    analysis_depth TEXT DEFAULT 'standard' CHECK (analysis_depth IN ('basic', 'standard', 'deep')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- 6. SLACK INTEGRATION
-- =====================================================

-- Slack workspace connections
CREATE TABLE IF NOT EXISTS slack_workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id TEXT NOT NULL,
    workspace_name TEXT NOT NULL,
    access_token TEXT NOT NULL,
    bot_user_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, workspace_id)
);

-- Slack notifications
CREATE TABLE IF NOT EXISTS slack_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    message_content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);

-- =====================================================
-- 7. ANALYTICS AND USAGE TRACKING
-- =====================================================

-- Daily usage tracking
CREATE TABLE IF NOT EXISTS daily_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL,
    api_calls INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    projects_created INTEGER DEFAULT 0,
    documents_generated INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, usage_date)
);

-- Anonymous analytics (for non-authenticated users)
CREATE TABLE IF NOT EXISTS anonymous_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================

-- Core SDLC indexes
CREATE INDEX IF NOT EXISTS idx_sdlc_projects_user_id ON sdlc_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_projects_status ON sdlc_projects(status);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_progress_logs_project_id ON progress_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_integrations_project_id ON integrations(project_id);
CREATE INDEX IF NOT EXISTS idx_user_configurations_user_id ON user_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- v0.dev usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_v0_usage_user_date ON v0_usage_tracking(user_id, usage_date);

-- Prompt management indexes
CREATE INDEX IF NOT EXISTS idx_prompt_templates_document_type ON prompt_templates(document_type);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_prompt_templates_default ON prompt_templates(document_type, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_prompt_usage_logs_created_at ON prompt_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_logs_user_id ON prompt_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_logs_prompt_id ON prompt_usage_logs(prompt_template_id);
CREATE INDEX IF NOT EXISTS idx_prompt_experiments_active ON prompt_experiments(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Wireframe prompts indexes
CREATE INDEX IF NOT EXISTS idx_wireframe_prompts_active ON wireframe_prompts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_wireframe_prompts_category ON wireframe_prompts(category);
CREATE INDEX IF NOT EXISTS idx_wireframe_prompts_layout_type ON wireframe_prompts(layout_type);

-- Early access indexes
CREATE INDEX IF NOT EXISTS idx_early_access_user_id ON early_access_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_early_access_status ON early_access_enrollments(enrollment_status);
CREATE INDEX IF NOT EXISTS idx_early_access_level ON early_access_enrollments(access_level);
CREATE INDEX IF NOT EXISTS idx_early_access_priority ON early_access_enrollments(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_beta_features_key ON beta_features(feature_key);
CREATE INDEX IF NOT EXISTS idx_beta_features_category ON beta_features(feature_category);
CREATE INDEX IF NOT EXISTS idx_beta_features_level ON beta_features(access_level);
CREATE INDEX IF NOT EXISTS idx_beta_features_active ON beta_features(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_feature_access_user_id ON user_feature_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_access_feature_id ON user_feature_access(feature_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON early_access_waitlist(position);
CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON early_access_waitlist(priority_score DESC);

-- GitDigest indexes
CREATE INDEX IF NOT EXISTS idx_repo_digests_user_id ON repo_digests(user_id);
CREATE INDEX IF NOT EXISTS idx_repo_digests_repo_owner ON repo_digests(repo_owner);
CREATE INDEX IF NOT EXISTS idx_repo_digests_sdlc_score ON repo_digests(sdlc_score);
CREATE INDEX IF NOT EXISTS idx_repo_digests_last_analyzed ON repo_digests(last_analyzed);
CREATE INDEX IF NOT EXISTS idx_repo_digests_public ON repo_digests(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_daily_reports_repo_digest_id ON daily_reports(repo_digest_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_digest_shares_token ON digest_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_digest_shares_repo_digest_id ON digest_shares(repo_digest_id);
CREATE INDEX IF NOT EXISTS idx_digest_analytics_repo_digest_id ON digest_analytics(repo_digest_id);
CREATE INDEX IF NOT EXISTS idx_digest_analytics_event_type ON digest_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_digest_subscriptions_user_id ON digest_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_digest_subscriptions_repo_digest_id ON digest_subscriptions(repo_digest_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_id ON daily_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON daily_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_anonymous_analytics_session_id ON anonymous_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_analytics_event_type ON anonymous_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_anonymous_analytics_created_at ON anonymous_analytics(created_at);

-- Advanced SDLC indexes
CREATE INDEX IF NOT EXISTS idx_sdlc_ai_providers_active ON sdlc_ai_providers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sdlc_ai_tasks_user_id ON sdlc_ai_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_ai_tasks_status ON sdlc_ai_tasks(status);
CREATE INDEX IF NOT EXISTS idx_sdlc_ai_tasks_project_id ON sdlc_ai_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_ai_task_executions_task_id ON sdlc_ai_task_executions(task_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_ai_task_executions_status ON sdlc_ai_task_executions(execution_status);
CREATE INDEX IF NOT EXISTS idx_sdlc_ai_task_dashboard_user_id ON sdlc_ai_task_dashboard(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_api_key_rotations_user_id ON sdlc_api_key_rotations(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_approval_requests_user_id ON sdlc_approval_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_approval_requests_status ON sdlc_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_sdlc_automation_rules_user_id ON sdlc_automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_automation_rules_active ON sdlc_automation_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sdlc_code_generations_user_id ON sdlc_code_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_code_generations_project_id ON sdlc_code_generations(project_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_code_generations_type ON sdlc_code_generations(generation_type);
CREATE INDEX IF NOT EXISTS idx_sdlc_code_review_feedback_user_id ON sdlc_code_review_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_code_review_feedback_generation_id ON sdlc_code_review_feedback(code_generation_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_github_integrations_user_id ON sdlc_github_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_github_integrations_active ON sdlc_github_integrations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sdlc_provider_usage_logs_user_id ON sdlc_provider_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_provider_usage_logs_provider ON sdlc_provider_usage_logs(provider_name);
CREATE INDEX IF NOT EXISTS idx_sdlc_pull_requests_user_id ON sdlc_pull_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_pull_requests_project_id ON sdlc_pull_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_pull_requests_status ON sdlc_pull_requests(status);
CREATE INDEX IF NOT EXISTS idx_sdlc_repository_context_user_id ON sdlc_repository_context(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_safety_checks_user_id ON sdlc_safety_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_safety_checks_type ON sdlc_safety_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_sdlc_security_audit_logs_user_id ON sdlc_security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_security_audit_logs_action ON sdlc_security_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_sdlc_task_dependencies_dependent ON sdlc_task_dependencies(dependent_task_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_task_dependencies_prerequisite ON sdlc_task_dependencies(prerequisite_task_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_test_executions_user_id ON sdlc_test_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_test_executions_project_id ON sdlc_test_executions(project_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_usage_analytics_user_id ON sdlc_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_usage_analytics_type ON sdlc_usage_analytics(analytics_type);
CREATE INDEX IF NOT EXISTS idx_sdlc_user_ai_configurations_user_id ON sdlc_user_ai_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_sdlc_user_ai_configurations_active ON sdlc_user_ai_configurations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sdlc_user_roles_user_id ON sdlc_user_roles(user_id);

-- Additional table indexes
CREATE INDEX IF NOT EXISTS idx_anonymous_project_sessions_session_id ON anonymous_project_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_project_sessions_expires_at ON anonymous_project_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_content_analytics_user_id ON content_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_type ON content_analytics(content_type);
CREATE INDEX IF NOT EXISTS idx_content_generation_log_user_id ON content_generation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_content_generation_log_type ON content_generation_log(generation_type);
CREATE INDEX IF NOT EXISTS idx_project_generations_user_id ON project_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_project_generations_project_id ON project_generations(project_id);
CREATE INDEX IF NOT EXISTS idx_gitdigest_queue_user_id ON gitdigest_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_gitdigest_queue_status ON gitdigest_queue(queue_status);
CREATE INDEX IF NOT EXISTS idx_gitdigest_queue_scheduled ON gitdigest_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_system_analytics_type ON system_analytics(analytics_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_type ON user_ratings(rating_type);

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE sdlc_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE v0_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wireframe_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_access_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_access_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE repo_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gitdigest_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_analytics ENABLE ROW LEVEL SECURITY;

-- Core SDLC Policies
CREATE POLICY "Users can view own projects" ON sdlc_projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON sdlc_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON sdlc_projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON sdlc_projects
    FOR DELETE USING (auth.uid() = user_id);

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

-- v0.dev Usage Tracking Policies
CREATE POLICY "Users can view their own v0 usage" ON v0_usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own v0 usage" ON v0_usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own v0 usage" ON v0_usage_tracking
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Prompt Management Policies
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

CREATE POLICY "Users can view their own usage logs" ON prompt_usage_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert usage logs" ON prompt_usage_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Wireframe Prompts Policies
CREATE POLICY "Users can view active wireframe prompts" ON wireframe_prompts
    FOR SELECT USING (is_active = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own wireframe prompts" ON wireframe_prompts
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own wireframe prompts" ON wireframe_prompts
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own wireframe prompts" ON wireframe_prompts
    FOR DELETE USING (auth.uid() = created_by);

-- GitDigest Policies
CREATE POLICY "Users can view their own digests" ON repo_digests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public digests" ON repo_digests
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create their own digests" ON repo_digests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own digests" ON repo_digests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own digests" ON repo_digests
    FOR DELETE USING (auth.uid() = user_id);

-- Early Access Policies
CREATE POLICY "Users can view their own enrollments" ON early_access_enrollments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments" ON early_access_enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all enrollments" ON early_access_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- =====================================================
-- 10. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to check beta feature access
CREATE OR REPLACE FUNCTION has_beta_feature_access(
    p_user_id UUID,
    p_feature_key TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN := false;
    user_enrollment RECORD;
    feature_info RECORD;
BEGIN
    -- Get feature information
    SELECT * INTO feature_info
    FROM beta_features 
    WHERE feature_key = p_feature_key AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check if user has explicit access granted
    IF EXISTS (
        SELECT 1 FROM user_feature_access ufa
        WHERE ufa.user_id = p_user_id 
        AND ufa.feature_id = feature_info.id
        AND ufa.access_granted = true
        AND (ufa.expires_at IS NULL OR ufa.expires_at > NOW())
    ) THEN
        RETURN true;
    END IF;
    
    -- Check if user has early access enrollment that covers this feature
    SELECT * INTO user_enrollment
    FROM early_access_enrollments
    WHERE user_id = p_user_id 
    AND enrollment_status = 'approved'
    AND (expires_at IS NULL OR expires_at > NOW());
    
    IF FOUND THEN
        -- Check if user's access level and priority score meet feature requirements
        IF user_enrollment.access_level = feature_info.access_level 
        AND user_enrollment.priority_score >= feature_info.min_priority_score THEN
            RETURN true;
        END IF;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to get active prompt
CREATE OR REPLACE FUNCTION get_active_prompt(doc_type VARCHAR(50))
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    prompt_content TEXT,
    variables JSONB,
    ai_model VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.id,
        pt.name,
        pt.prompt_content,
        pt.variables,
        pt.ai_model
    FROM prompt_templates pt
    WHERE pt.document_type = doc_type
    AND pt.is_active = true
    AND pt.is_default = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to log prompt usage
CREATE OR REPLACE FUNCTION log_prompt_usage(
    p_prompt_template_id UUID,
    p_user_id UUID,
    p_project_id UUID,
    p_input_text TEXT,
    p_generated_content TEXT,
    p_input_tokens INTEGER,
    p_output_tokens INTEGER,
    p_response_time_ms INTEGER,
    p_success BOOLEAN,
    p_error_message TEXT,
    p_ai_model_used VARCHAR(50)
) RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql;

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to get prompt for execution
CREATE OR REPLACE FUNCTION get_prompt_for_execution(doc_type VARCHAR(50), user_uuid UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    prompt_content TEXT,
    variables JSONB,
    ai_model VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.id,
        pt.name,
        pt.prompt_content,
        pt.variables,
        pt.ai_model
    FROM prompt_templates pt
    WHERE pt.document_type = doc_type
    AND pt.is_active = true
    AND (
        pt.is_system_default = true 
        OR (user_uuid IS NOT NULL AND pt.user_id = user_uuid AND pt.is_personal_default = true)
    )
    ORDER BY pt.is_system_default DESC, pt.is_personal_default DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get prompt usage timeseries
CREATE OR REPLACE FUNCTION get_prompt_usage_timeseries(
    p_user_id UUID DEFAULT NULL,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    usage_count BIGINT,
    total_tokens BIGINT,
    avg_response_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(pul.created_at) as date,
        COUNT(*) as usage_count,
        COALESCE(SUM(pul.input_tokens + pul.output_tokens), 0) as total_tokens,
        COALESCE(AVG(pul.response_time_ms), 0) as avg_response_time
    FROM prompt_usage_logs pul
    WHERE (p_user_id IS NULL OR pul.user_id = p_user_id)
    AND pul.created_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY DATE(pul.created_at)
    ORDER BY date;
END;
$$ LANGUAGE plpgsql;

-- Function to get SDLC user task stats
CREATE OR REPLACE FUNCTION get_sdlc_user_task_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_tasks', COUNT(*),
        'completed_tasks', COUNT(*) FILTER (WHERE status = 'completed'),
        'pending_tasks', COUNT(*) FILTER (WHERE status = 'pending'),
        'failed_tasks', COUNT(*) FILTER (WHERE status = 'failed'),
        'total_cost', COALESCE(SUM(actual_cost), 0),
        'avg_execution_time', COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - started_at))), 0)
    ) INTO stats
    FROM sdlc_ai_tasks
    WHERE user_id = p_user_id;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get user prompt stats
CREATE OR REPLACE FUNCTION get_user_prompt_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_usage', COUNT(*),
        'successful_usage', COUNT(*) FILTER (WHERE success = true),
        'failed_usage', COUNT(*) FILTER (WHERE success = false),
        'total_tokens', COALESCE(SUM(input_tokens + output_tokens), 0),
        'avg_response_time', COALESCE(AVG(response_time_ms), 0),
        'most_used_prompt', (
            SELECT pt.name 
            FROM prompt_templates pt 
            WHERE pt.id = pul.prompt_template_id 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        )
    ) INTO stats
    FROM prompt_usage_logs pul
    WHERE user_id = p_user_id;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get user SDLC documents
CREATE OR REPLACE FUNCTION get_user_sdlc_documents(p_user_id UUID)
RETURNS TABLE (
    project_id UUID,
    project_title VARCHAR(255),
    document_type VARCHAR(50),
    document_count BIGINT,
    last_updated TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.id as project_id,
        sp.title as project_title,
        d.document_type,
        COUNT(*) as document_count,
        MAX(d.created_at) as last_updated
    FROM sdlc_projects sp
    LEFT JOIN documents d ON sp.id = d.project_id
    WHERE sp.user_id = p_user_id
    GROUP BY sp.id, sp.title, d.document_type
    ORDER BY last_updated DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to save anonymous SDLC project
CREATE OR REPLACE FUNCTION save_anonymous_sdlc_project(
    p_session_id TEXT,
    p_project_data JSONB
)
RETURNS UUID AS $$
DECLARE
    v_project_id UUID;
    v_title TEXT;
    v_input_text TEXT;
    v_documents JSONB;
BEGIN
    -- Generate a new UUID for the project
    v_project_id := gen_random_uuid();
    
    -- Extract data from the JSONB
    v_title := p_project_data->>'title';
    v_input_text := p_project_data->>'input_text';
    v_documents := p_project_data->'documents';
    
    -- First, ensure we have a session record
    INSERT INTO anonymous_project_sessions (
        session_id,
        user_agent,
        ip_address,
        referrer,
        project_count,
        expires_at
    )
    VALUES (
        p_session_id,
        p_project_data->>'user_agent',
        p_project_data->>'ip_address',
        p_project_data->>'referrer',
        1,
        NOW() + INTERVAL '24 hours'
    )
    ON CONFLICT (session_id) 
    DO UPDATE SET 
        last_activity = NOW(),
        project_count = COALESCE(anonymous_project_sessions.project_count, 0) + 1,
        expires_at = NOW() + INTERVAL '24 hours';
    
    -- Insert the project into sdlc_projects table
    INSERT INTO sdlc_projects (
        id,
        user_id,
        session_id,
        title,
        description,
        input_text,
        status,
        document_metadata,
        created_at
    )
    VALUES (
        v_project_id,
        NULL, -- Anonymous users have no user_id
        p_session_id,
        v_title,
        p_project_data->>'description',
        v_input_text,
        'completed',
        v_documents,
        NOW()
    );
    
    -- Insert documents if provided
    IF v_documents IS NOT NULL THEN
        -- Insert architecture document if exists
        IF v_documents->>'architecture' IS NOT NULL THEN
            INSERT INTO documents (project_id, document_type, content, created_at)
            VALUES (v_project_id, 'architecture', v_documents->>'architecture', NOW());
        END IF;
    END IF;
    
    RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;

-- Function to save comprehensive SDLC document
CREATE OR REPLACE FUNCTION save_comprehensive_sdlc_document(
    p_user_id UUID,
    p_project_id UUID,
    p_document_type VARCHAR(50),
    p_content TEXT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    document_id UUID;
BEGIN
    INSERT INTO documents (project_id, document_type, content)
    VALUES (p_project_id, p_document_type, p_content)
    RETURNING id INTO document_id;
    
    -- Update project metadata
    UPDATE sdlc_projects 
    SET document_metadata = document_metadata || p_metadata
    WHERE id = p_project_id;
    
    RETURN document_id;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER update_repo_digests_updated_at
    BEFORE UPDATE ON repo_digests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digest_subscriptions_updated_at
    BEFORE UPDATE ON digest_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. DEFAULT DATA INSERTION
-- =====================================================

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

-- Insert default prompt templates
INSERT INTO prompt_templates (name, description, document_type, prompt_content, variables, is_active, is_system_default, version) VALUES
(
    'Default Business Analysis Prompt',
    'Standard business analysis prompt for requirement analysis',
    'business',
    'You are an expert business analyst. Analyze the following project requirements and provide a comprehensive business analysis document.

Please structure your response with the following sections:

## Executive Summary
Provide a high-level overview of the project and its business value.

## Business Objectives
Outline the primary business goals and success criteria.

## Stakeholder Analysis
Identify key stakeholders and their interests.

## Market Analysis
Analyze the market opportunity and competitive landscape.

## Risk Assessment
Identify potential risks and mitigation strategies.

## Success Metrics
Define KPIs and measurement criteria.

Project Requirements: {input}

Please provide a detailed, professional analysis suitable for executive review.',
    '{"input": "Project requirements text"}',
    true,
    true,
    1
),
(
    'Default Functional Specification Prompt',
    'Standard functional specification prompt',
    'functional',
    'You are an expert software architect. Create a comprehensive functional specification based on the following requirements.

Please structure your response with:

## System Overview
High-level system description and scope.

## Functional Requirements
Detailed functional requirements with user stories.

## Use Cases
Key use cases and scenarios.

## User Interface Requirements
UI/UX requirements and mockups.

## Data Requirements
Data models and relationships.

## Integration Requirements
External system integrations.

Requirements: {input}

Provide a detailed specification suitable for development teams.',
    '{"input": "Project requirements text"}',
    true,
    true,
    1
),
(
    'Default Technical Specification Prompt',
    'Standard technical specification prompt',
    'technical',
    'You are an expert software architect. Design a comprehensive technical specification for the following project.

Please include:

## System Architecture
High-level architecture design.

## Technology Stack
Recommended technologies and frameworks.

## Database Design
Data models and schema design.

## API Design
RESTful API specifications.

## Security Implementation
Security measures and best practices.

## Deployment Strategy
Infrastructure and deployment approach.

## Performance Requirements
Scalability and performance considerations.

Project Requirements: {input}

Provide a detailed technical specification for implementation.',
    '{"input": "Project requirements text"}',
    true,
    true,
    1
),
(
    'Default UX Specification Prompt',
    'Standard UX specification prompt',
    'ux',
    'You are an expert UX designer. Create a comprehensive user experience specification for the following project.

Please include:

## User Research
Target user personas and research findings.

## User Journey Maps
Key user journeys and touchpoints.

## Information Architecture
Site structure and navigation.

## Wireframes
Low-fidelity wireframes and layouts.

## Design System
UI components and design patterns.

## Accessibility Requirements
WCAG compliance and accessibility features.

## Usability Testing Plan
Testing methodology and success criteria.

Project Requirements: {input}

Provide a detailed UX specification for design teams.',
    '{"input": "Project requirements text"}',
    true,
    true,
    1
),
(
    'Default Mermaid Diagram Prompt',
    'Standard Mermaid diagram generation prompt',
    'mermaid',
    'You are an expert software architect. Create a Mermaid diagram based on the following requirements.

Please generate a clear, well-structured diagram that shows:

- System components and their relationships
- Data flow and processes
- User interactions and workflows
- Technology stack and infrastructure

Requirements: {input}

Generate only the Mermaid diagram code without any additional text or explanations.',
    '{"input": "Project requirements text"}',
    true,
    true,
    1
),
(
    'Default Wireframe Generator',
    'System default prompt for generating comprehensive wireframes from user descriptions',
    'wireframe',
    'You are an expert UX designer creating detailed wireframes.

User Request: {user_prompt}

Create a comprehensive wireframe specification for a {layout_type} interface with the following requirements:

1. **Layout Structure**:
   - Define the overall layout with appropriate dimensions for {layout_type}
   - Use a grid system with proper spacing
   - Include responsive breakpoints if applicable

2. **Components**:
   - Create a hierarchical component structure
   - Each component should have:
     - Unique ID
     - Type (from standard UI components)
     - Position and size
     - Content or placeholder text
     - Relevant properties
   - Use semantic component types

3. **Visual Hierarchy**:
   - Establish clear visual hierarchy
   - Group related components
   - Use appropriate spacing and alignment

4. **Annotations** (if {include_annotations} is true):
   - Add design annotations explaining key decisions
   - Include interaction notes
   - Specify content requirements
   - Note accessibility considerations

5. **User Flow** (if {include_user_flow} is true):
   - Document the primary user flow
   - Include step-by-step actions
   - Note expected results
   - Identify alternative paths

Output the wireframe specification as a valid JSON object following this structure:
{
  "title": "Page/Screen Title",
  "description": "Brief description of the interface",
  "layout": {
    "type": "{layout_type}",
    "dimensions": { "width": number, "height": number },
    "grid": { "columns": number, "gap": number, "padding": number }
  },
  "components": [...],
  "annotations": [...],
  "userFlow": [...]
}

Important guidelines:
- Use realistic dimensions (e.g., 1440x900 for desktop, 375x812 for mobile)
- Components should not overlap unless intentionally layered
- Use standard component types: header, nav, button, input, card, etc.
- Ensure proper parent-child relationships for nested components
- Make the design accessible and user-friendly

Return ONLY the JSON object without any additional text or markdown formatting.',
    '{"user_prompt": "User wireframe request", "layout_type": "web", "include_annotations": true, "include_user_flow": true}',
    true,
    true,
    1
)
ON CONFLICT DO NOTHING;

-- Insert default beta features
INSERT INTO beta_features (feature_key, feature_name, feature_description, feature_category, access_level, is_active) VALUES
('advanced_claude_integration', 'Advanced Claude Integration', 'Access to Claude 3 Sonnet for enhanced AI capabilities', 'ai', 'beta', true),
('premium_templates', 'Premium Templates', 'Access to premium SDLC templates and prompts', 'templates', 'beta', true),
('advanced_analytics', 'Advanced Analytics', 'Detailed usage analytics and insights', 'analytics', 'beta', true),
('slack_integration', 'Slack Integration', 'Real-time notifications and collaboration via Slack', 'integrations', 'beta', true),
('gitdigest_pro', 'GitDigest Pro', 'Advanced repository analysis and insights', 'gitdigest', 'beta', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 12. VIEWS FOR ANALYTICS
-- =====================================================

-- View for active prompts
CREATE OR REPLACE VIEW active_prompts AS
SELECT 
    id,
    name,
    description,
    document_type,
    prompt_content,
    variables,
    ai_model,
    is_default,
    version,
    created_at
FROM prompt_templates
WHERE is_active = true;

-- View for default prompts
CREATE OR REPLACE VIEW default_prompts AS
SELECT 
    id,
    name,
    description,
    document_type,
    prompt_content,
    variables,
    ai_model,
    version,
    created_at
FROM prompt_templates
WHERE is_active = true AND is_default = true;

-- View for prompt analytics
CREATE OR REPLACE VIEW prompt_analytics AS
SELECT 
    pt.id,
    pt.name,
    pt.document_type,
    COUNT(pul.id) as usage_count,
    AVG(pul.response_time_ms) as avg_response_time,
    SUM(pul.input_tokens) as total_input_tokens,
    SUM(pul.output_tokens) as total_output_tokens,
    COUNT(CASE WHEN pul.success = true THEN 1 END) as success_count,
    COUNT(CASE WHEN pul.success = false THEN 1 END) as error_count
FROM prompt_templates pt
LEFT JOIN prompt_usage_logs pul ON pt.id = pul.prompt_template_id
WHERE pt.is_active = true
GROUP BY pt.id, pt.name, pt.document_type;

-- =====================================================
-- 13. AUTHENTICATION TRIGGERS
-- =====================================================

-- Function to handle new user signup (simplified to avoid database issues)
CREATE OR REPLACE FUNCTION handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Do nothing - just return the new user
    -- This ensures signup works without any database operations
    -- Users can be assigned roles later through the application
    RAISE NOTICE 'User signup successful for user: %', NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

CREATE TRIGGER on_auth_user_created_role
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_role();

-- =====================================================
-- 14. ADMIN DASHBOARD FUNCTIONS
-- =====================================================

-- Function to get live analytics for admin dashboard
CREATE OR REPLACE FUNCTION get_live_admin_analytics()
RETURNS TABLE (
  analytics_date date,
  total_users bigint,
  active_users bigint,
  new_users bigint,
  total_projects bigint,
  projects_today bigint,
  anonymous_projects bigint,
  authenticated_projects bigint,
  system_key_usage integer,
  user_key_usage integer,
  total_tokens_used bigint,
  total_cost_estimate numeric,
  error_rate numeric,
  avg_generation_time_ms numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      COUNT(DISTINCT au.id) as total_users,
      COUNT(DISTINCT CASE WHEN au.last_sign_in_at > NOW() - INTERVAL '7 days' THEN au.id END) as active_users,
      COUNT(DISTINCT CASE WHEN au.created_at > NOW() - INTERVAL '1 day' THEN au.id END) as new_users
    FROM auth.users au
  ),
  project_stats AS (
    SELECT 
      COUNT(*) as total_projects,
      COUNT(CASE WHEN sp.created_at > NOW() - INTERVAL '1 day' THEN 1 END) as projects_today,
      COUNT(CASE WHEN sp.user_id IS NULL THEN 1 END) as anonymous_projects,
      COUNT(CASE WHEN sp.user_id IS NOT NULL THEN 1 END) as authenticated_projects
    FROM public.sdlc_projects sp
  ),
  -- Use system_analytics table if it has recent data, otherwise use default values
  usage_stats AS (
    SELECT 
      COALESCE(MAX(sa.system_key_usage), 0) as system_key_usage,
      COALESCE(MAX(sa.user_key_usage), 0) as user_key_usage,
      COALESCE(MAX(sa.total_tokens_used), 0) as total_tokens,
      COALESCE(MAX(sa.total_cost_estimate), 0) as total_cost,
      COALESCE(MAX(sa.avg_generation_time_ms), 0) as avg_time
    FROM public.system_analytics sa
    WHERE sa.analytics_date >= CURRENT_DATE - INTERVAL '1 day'
  )
  SELECT 
    CURRENT_DATE as analytics_date,
    us.total_users::bigint,
    us.active_users::bigint,
    us.new_users::bigint,
    ps.total_projects::bigint,
    ps.projects_today::bigint,
    ps.anonymous_projects::bigint,
    ps.authenticated_projects::bigint,
    uss.system_key_usage::integer,
    uss.user_key_usage::integer,
    uss.total_tokens::bigint,
    uss.total_cost::numeric(10,2),
    0.0::numeric as error_rate,
    uss.avg_time::numeric
  FROM user_stats us, project_stats ps, usage_stats uss;
END;
$$;

-- Function to get user statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_admin_user_stats()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  subscription_type text,
  total_projects_created bigint,
  projects_today bigint,
  last_login_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_projects AS (
    SELECT 
      sp.user_id::uuid as project_user_id,
      COUNT(*) as total_projects,
      COUNT(CASE WHEN sp.created_at > NOW() - INTERVAL '1 day' THEN 1 END) as today_projects
    FROM public.sdlc_projects sp
    WHERE sp.user_id IS NOT NULL
    GROUP BY sp.user_id
  ),
  user_role_data AS (
    SELECT 
      ur.user_id as role_user_id,
      ur.role as user_role
    FROM public.user_roles ur
  )
  SELECT 
    au.id,
    au.email::text,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email)::text as full_name,
    COALESCE(urd.user_role, 'user')::text as role,
    COALESCE(au.raw_user_meta_data->>'subscription_type', 'free')::text as subscription_type,
    COALESCE(up.total_projects, 0)::bigint as total_projects_created,
    COALESCE(up.today_projects, 0)::bigint as projects_today,
    au.last_sign_in_at,
    au.created_at
  FROM auth.users au
  LEFT JOIN user_projects up ON up.project_user_id = au.id
  LEFT JOIN user_role_data urd ON urd.role_user_id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permissions for admin functions
GRANT EXECUTE ON FUNCTION get_live_admin_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_user_stats() TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Display setup completion message
DO $$
BEGIN
    RAISE NOTICE 'SDLC Automation Platform database setup completed successfully!';
    RAISE NOTICE 'Tables created: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public');
    RAISE NOTICE 'Default prompts inserted: %', (SELECT COUNT(*) FROM prompt_templates WHERE is_system_default = true);
    RAISE NOTICE 'Default templates inserted: %', (SELECT COUNT(*) FROM templates WHERE is_public = true);
    RAISE NOTICE 'Beta features configured: %', (SELECT COUNT(*) FROM beta_features WHERE is_active = true);
    RAISE NOTICE 'SDLC tables: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'sdlc_%');
    RAISE NOTICE 'Functions created: %', (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public');
    RAISE NOTICE 'Indexes created: %', (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public');
    RAISE NOTICE 'Auth trigger configured for seamless user signup';
END $$; 